var dateFormatter;

export class SFItem {

  constructor(json_obj = {}) {
    this.appData = {};
    this.content = {};
    this.referencingObjects = [];
    this.updateFromJSON(json_obj);

    if(!this.uuid) {
      // on React Native, this method will not exist. UUID gen will be handled manually via async methods.
      if(typeof(SFJS) !== "undefined" && SFJS.crypto.generateUUIDSync) {
        this.uuid = SFJS.crypto.generateUUIDSync();
      }
    }

    if(!this.content.references) {
      this.content.references = [];
    }
  }

  get contentObject() {
    if(!this.content) {
      this.content = {};
      return this.content;
    }

    if(this.content !== null && typeof this.content === 'object') {
      // this is the case when mapping localStorage content, in which case the content is already parsed
      return this.content;
    }

    try {
      let content = JSON.parse(this.content);
      this.content = content;
      return this.content;
    } catch (e) {
      console.log("Error parsing json", e, this);
      this.content = {};
      return this.content;
    }
  }

  static deepMerge(a, b) {
    // By default _.merge will not merge a full array with an empty one.
    // We want to replace arrays wholesale
    function mergeCopyArrays(objValue, srcValue) {
      if (_.isArray(objValue)) {
        return srcValue;
      }
    }
    _.mergeWith(a, b, mergeCopyArrays);
    return a;
  }

  updateFromJSON(json) {
    // Manually merge top level data instead of wholesale merge
    this.created_at = json.created_at;
    this.updated_at = json.updated_at;
    this.deleted = json.deleted;
    this.uuid = json.uuid;
    this.enc_item_key = json.enc_item_key;
    this.auth_hash = json.auth_hash;
    this.auth_params = json.auth_params;

    // When updating from server response (as opposed to local json response), these keys will be missing.
    // So we only want to update these values if they are explicitly present.
    let clientKeys = ["errorDecrypting", "conflict_of", "dirty", "dirtyCount"];
    for(var key of clientKeys) {
      if(json[key] !== undefined) {
        this[key] = json[key];
      }
    }

    // Check if object has getter for content_type, and if so, skip
    if(!this.content_type) {
      this.content_type = json.content_type;
    }

    // this.content = json.content will copy it by reference rather than value. So we need to do a deep merge after.
    // json.content can still be a string here. We copy it to this.content, then do a deep merge to transfer over all values.

    try {
      let parsedContent = typeof json.content === 'string' ? JSON.parse(json.content) : json.content;
      SFItem.deepMerge(this.contentObject, parsedContent);
    } catch (e) {
      console.log("Error while updating item from json", e);
    }

    if(this.created_at) {
      this.created_at = new Date(this.created_at);
      this.updated_at = new Date(this.updated_at);
    } else {
      this.created_at = new Date();
      this.updated_at = new Date();
    }

    // Allows the getter to be re-invoked
    this._client_updated_at = null;

    if(json.content) {
      this.mapContentToLocalProperties(this.contentObject);
    } else if(json.deleted == true) {
      this.handleDeletedContent();
    }
  }

  mapContentToLocalProperties(contentObj) {
    if(contentObj.appData) {
      this.appData = contentObj.appData;
    }
    if(!this.appData) { this.appData = {}; }
  }

  createContentJSONFromProperties() {
    return this.structureParams();
  }

  structureParams() {
    var params = this.contentObject;
    params.appData = this.appData;
    return params;
  }

  /* Allows the item to handle the case where the item is deleted and the content is null */
  handleDeletedContent() {
    // Subclasses can override
  }

  setDirty(dirty, dontUpdateClientDate) {
    this.dirty = dirty;

    // Allows the syncManager to check if an item has been marked dirty after a sync has been started
    // This prevents it from clearing it as a dirty item after sync completion, if someone else has marked it dirty
    // again after an ongoing sync.
    if(!this.dirtyCount) { this.dirtyCount = 0; }
    if(dirty) {
      this.dirtyCount++;
    } else {
      this.dirtyCount = 0;
    }

    if(dirty && !dontUpdateClientDate) {
      // Set the client modified date to now if marking the item as dirty
      this.client_updated_at = new Date();
    } else if(!this.hasRawClientUpdatedAtValue()) {
      // copy updated_at
      this.client_updated_at = new Date(this.updated_at);
    }
  }

  updateLocalRelationships() {
    // optional override
  }

  addItemAsRelationship(item) {
    item.setIsBeingReferencedBy(this);

    if(this.hasRelationshipWithItem(item)) {
      return;
    }

    var references = this.content.references || [];
    references.push({
      uuid: item.uuid,
      content_type: item.content_type
    })
    this.content.references = references;
  }

  removeItemAsRelationship(item) {
    item.setIsNoLongerBeingReferencedBy(this);
    this.removeReferenceWithUuid(item.uuid);
  }

  // When another object has a relationship with us, we push that object into memory here.
  // We use this so that when `this` is deleted, we're able to update the references of those other objects.
  // For example, a Note has a one way relationship with a Tag. If a Tag is deleted, we want to update
  // the Note's references to remove the tag relationship.
  setIsBeingReferencedBy(item) {
    if(!_.find(this.referencingObjects, {uuid: item.uuid})) {
      this.referencingObjects.push(item);
    }
  }

  setIsNoLongerBeingReferencedBy(item) {
    _.remove(this.referencingObjects, {uuid: item.uuid});
    // Legacy two-way relationships should be handled here
    if(this.hasRelationshipWithItem(item)) {
      this.removeReferenceWithUuid(item.uuid);
      // We really shouldn't have the authority to set this item as dirty, but it's the only way to save this change.
      this.setDirty(true);
    }
  }

  removeReferenceWithUuid(uuid) {
    var references = this.content.references || [];
    references = references.filter((r) => {return r.uuid != uuid});
    this.content.references = references;
  }

  hasRelationshipWithItem(item) {
    let target = this.content.references.find((r) => {
      return r.uuid == item.uuid;
    });
    return target != null;
  }

  isBeingRemovedLocally() {

  }

  didFinishSyncing() {

  }

  informReferencesOfUUIDChange(oldUUID, newUUID) {
    // optional override
  }

  potentialItemOfInterestHasChangedItsUUID(newItem, oldUUID, newUUID) {
    // optional override
    for(var reference of this.content.references) {
      if(reference.uuid == oldUUID) {
        reference.uuid = newUUID;
        this.setDirty(true);
      }
    }
  }

  doNotEncrypt() {
    return false;
  }

  /*
  App Data
  */

  setDomainDataItem(key, value, domain) {
    if(!domain) {
      console.error("SFItem.AppDomain needs to be set.");
      return;
    }
    var data = this.appData[domain];
    if(!data) {
      data = {}
    }
    data[key] = value;
    this.appData[domain] = data;
  }

  getDomainDataItem(key, domain) {
    if(!domain) {
      console.error("SFItem.AppDomain needs to be set.");
      return;
    }
    var data = this.appData[domain];
    if(data) {
      return data[key];
    } else {
      return null;
    }
  }

  setAppDataItem(key, value) {
    this.setDomainDataItem(key, value, SFItem.AppDomain);
  }

  getAppDataItem(key) {
    return this.getDomainDataItem(key, SFItem.AppDomain);
  }

  get pinned() {
    return this.getAppDataItem("pinned");
  }

  get archived() {
    return this.getAppDataItem("archived");
  }

  get locked() {
    return this.getAppDataItem("locked");
  }

  // May be used by clients to display the human readable type for this item. Should be overriden by subclasses.
  get displayName() {
    return "Item";
  }

  hasRawClientUpdatedAtValue() {
    return this.getAppDataItem("client_updated_at") != null;
  }

  get client_updated_at() {
    if(!this._client_updated_at) {
      var saved = this.getAppDataItem("client_updated_at");
      if(saved) {
        this._client_updated_at = new Date(saved);
      } else {
        this._client_updated_at = new Date(this.updated_at);
      }
    }
    return this._client_updated_at;
  }

  set client_updated_at(date) {
    this._client_updated_at = date;

    this.setAppDataItem("client_updated_at", date);
  }

  /*
    During sync conflicts, when determing whether to create a duplicate for an item, we can omit keys that have no
    meaningful weight and can be ignored. For example, if one component has active = true and another component has active = false,
    it would be silly to duplicate them, so instead we ignore this.
   */
  keysToIgnoreWhenCheckingContentEquality() {
    return [];
  }

  // Same as above, but keys inside appData[Item.AppDomain]
  appDataKeysToIgnoreWhenCheckingContentEquality() {
    return ["client_updated_at"];
  }

  isItemContentEqualWith(otherItem) {
    let omit = (obj, keys) => {
      if(!obj) { return obj; }
      for(var key of keys) {
        delete obj[key];
      }
      return obj;
    }

    var left = this.structureParams();
    left.appData[SFItem.AppDomain] = omit(left.appData[SFItem.AppDomain], this.appDataKeysToIgnoreWhenCheckingContentEquality());
    left = omit(left, this.keysToIgnoreWhenCheckingContentEquality());

    var right = otherItem.structureParams();
    right.appData[SFItem.AppDomain] = omit(right.appData[SFItem.AppDomain], otherItem.appDataKeysToIgnoreWhenCheckingContentEquality());
    right = omit(right, otherItem.keysToIgnoreWhenCheckingContentEquality());

    return JSON.stringify(left) === JSON.stringify(right);
  }

  satisfiesPredicate(predicate) {
    /*
    Predicate is an SFPredicate having properties:
    {
      keypath: String,
      operator: String,
      value: object
    }
     */
    return SFPredicate.ItemSatisfiesPredicate(this, predicate);
  }

  /*
  Dates
  */

  createdAtString() {
    return this.dateToLocalizedString(this.created_at);
  }

  updatedAtString() {
    return this.dateToLocalizedString(this.client_updated_at);
  }

  dateToLocalizedString(date) {
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      if (!dateFormatter) {
        var locale = (navigator.languages && navigator.languages.length) ? navigator.languages[0] : navigator.language;
        dateFormatter = new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          weekday: 'long',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      return dateFormatter.format(date);
    } else {
      // IE < 11, Safari <= 9.0.
      // In English, this generates the string most similar to
      // the toLocaleDateString() result above.
      return date.toDateString() + ' ' + date.toLocaleTimeString();
    }
  }

}
