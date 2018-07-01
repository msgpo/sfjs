export class SFModelManager {

  constructor() {
    SFModelManager.MappingSourceRemoteRetrieved = "MappingSourceRemoteRetrieved";
    SFModelManager.MappingSourceRemoteSaved = "MappingSourceRemoteSaved";
    SFModelManager.MappingSourceLocalSaved = "MappingSourceLocalSaved";
    SFModelManager.MappingSourceLocalRetrieved = "MappingSourceLocalRetrieved";
    SFModelManager.MappingSourceComponentRetrieved = "MappingSourceComponentRetrieved";
    SFModelManager.MappingSourceDesktopInstalled = "MappingSourceDesktopInstalled"; // When a component is installed by the desktop and some of its values change
    SFModelManager.MappingSourceRemoteActionRetrieved = "MappingSourceRemoteActionRetrieved"; /* aciton-based Extensions like note history */
    SFModelManager.MappingSourceFileImport = "MappingSourceFileImport";

    SFModelManager.isMappingSourceRetrieved = (source) => {
      return [
        SFModelManager.MappingSourceRemoteRetrieved,
        SFModelManager.MappingSourceComponentRetrieved,
        SFModelManager.MappingSourceRemoteActionRetrieved
      ].includes(source);
    }

    this.itemSyncObservers = [];
    this.itemsPendingRemoval = [];
    this.items = [];
    this.missedReferences = [];
  }

  resetLocalMemory() {
    this.items.length = 0;
    this.itemsPendingRemoval.length = 0;
    this.missedReferences.length = 0;
  }

  get allItems() {
    return this.items.filter(function(item){
      return !item.dummy;
    })
  }

  get extensions() {
    return this._extensions.filter(function(ext){
      return !ext.deleted;
    })
  }

  async alternateUUIDForItem(item) {
    // We need to clone this item and give it a new uuid, then delete item with old uuid from db (you can't modify uuid's in our indexeddb setup)
    var newItem = this.createItem(item);
    newItem.uuid = SFJS.crypto.generateUUIDSync();

    // Update uuids of relationships
    newItem.informReferencesOfUUIDChange(item.uuid, newItem.uuid);
    this.informModelsOfUUIDChangeForItem(newItem, item.uuid, newItem.uuid);

    console.log(item.uuid, "-->", newItem.uuid);

    // Set to deleted, then run through mapping function so that observers can be notified
    item.deleted = true;
    item.content.references = [];
    item.setDirty(true);
    this.mapResponseItemsToLocalModels([item], SFModelManager.MappingSourceLocalSaved);

    // add new item
    this.addItem(newItem);
    newItem.setDirty(true);
    this.markAllReferencesDirtyForItem(newItem);

    return newItem;
  }

  informModelsOfUUIDChangeForItem(newItem, oldUUID, newUUID) {
    // some models that only have one-way relationships might be interested to hear that an item has changed its uuid
    // for example, editors have a one way relationship with notes. When a note changes its UUID, it has no way to inform the editor
    // to update its relationships

    for(var model of this.items) {
      model.potentialItemOfInterestHasChangedItsUUID(newItem, oldUUID, newUUID);
    }
  }

  allItemsMatchingTypes(contentTypes) {
    return this.allItems.filter(function(item){
      return (_.includes(contentTypes, item.content_type) || _.includes(contentTypes, "*")) && !item.dummy;
    })
  }

  validItemsForContentType(contentType) {
    return this.allItems.filter((item) => {
      return item.content_type == contentType && !item.errorDecrypting;
    });
  }

  findItem(itemId) {
    return _.find(this.items, {uuid: itemId});
  }

  findItems(ids) {
    return this.items.filter((item) => {
      return ids.includes(item.uuid);
    })
  }

  didSyncModelsOffline(items) {
    this.notifySyncObserversOfModels(items, SFModelManager.MappingSourceLocalSaved);
  }

  mapResponseItemsToLocalModels(items, source, sourceKey) {
    return this.mapResponseItemsToLocalModelsOmittingFields(items, null, source, sourceKey);
  }

  mapResponseItemsToLocalModelsOmittingFields(items, omitFields, source, sourceKey) {
    var models = [], processedObjects = [], modelsToNotifyObserversOf = [];

    // first loop should add and process items
    for (var json_obj of items) {
      if((!json_obj.content_type || !json_obj.content) && !json_obj.deleted && !json_obj.errorDecrypting) {
        // An item that is not deleted should never have empty content
        console.error("Server response item is corrupt:", json_obj);
        continue;
      }

      // Lodash's _.omit, which was previously used, seems to cause unexpected behavior
      // when json_obj is an ES6 item class. So we instead manually omit each key.
      if(Array.isArray(omitFields)) {
        for(var key of omitFields) {
          delete json_obj[key];
        }
      }

      var item = this.findItem(json_obj.uuid);

      if(item) {
        item.updateFromJSON(json_obj);
        // If an item goes through mapping, it can no longer be a dummy.
        item.dummy = false;
      }

      if(this.itemsPendingRemoval.includes(json_obj.uuid)) {
        _.pull(this.itemsPendingRemoval, json_obj.uuid);
        continue;
      }

      let contentType = json_obj["content_type"] || (item && item.content_type);
      var isDirtyItemPendingDelete = false;
      if(json_obj.deleted == true) {
        if(json_obj.dirty) {
          // Item was marked as deleted but not yet synced
          // We need to create this item as usual, but just not add it to individual arrays
          // i.e add to this.items but not this.notes (so that it can be retrieved with getDirtyItems)
          isDirtyItemPendingDelete = true;
        } else {
          if(item) {
            modelsToNotifyObserversOf.push(item);
            this.removeItemLocally(item);
          }
          continue;
        }
      }

      if(!item) {
        item = this.createItem(json_obj, true);
      }

      this.addItem(item, isDirtyItemPendingDelete);

      // Observers do not need to handle items that errored while decrypting.
      if(!item.errorDecrypting) {
        modelsToNotifyObserversOf.push(item);
      }

      models.push(item);
      processedObjects.push(json_obj);
    }

    // // second loop should process references
    for (var index in processedObjects) {
      var json_obj = processedObjects[index];
      if(json_obj.content) {
        this.resolveReferencesForItem(models[index]);
      }
      var missedRefs = this.missedReferences.filter((r) => {return r.reference_uuid == json_obj.uuid});
      for(var ref of missedRefs) {
        this.resolveReferencesForItem(ref.for_item);
      }
      // remove handled refs
      this.missedReferences = this.missedReferences.filter((r) => {return r.reference_uuid != json_obj.uuid});
    }

    this.notifySyncObserversOfModels(modelsToNotifyObserversOf, source, sourceKey);

    return models;
  }

  /* Note that this function is public, and can also be called manually (desktopManager uses it) */
  notifySyncObserversOfModels(models, source, sourceKey) {
    for(var observer of this.itemSyncObservers) {
      var allRelevantItems = observer.type == "*" ? models : models.filter(function(item){return item.content_type == observer.type});
      var validItems = [], deletedItems = [];
      for(var item of allRelevantItems) {
        if(item.deleted) {
          deletedItems.push(item);
        } else {
          validItems.push(item);
        }
      }

      if(allRelevantItems.length > 0) {
        observer.callback(allRelevantItems, validItems, deletedItems, source, sourceKey);
      }
    }
  }

  createItem(json_obj, dontNotifyObservers) {
    var itemClass = SFModelManager.ContentTypeClassMapping && SFModelManager.ContentTypeClassMapping[json_obj.content_type];
    if(!itemClass) {
      itemClass = SFItem;
    }
    var item = new itemClass(json_obj);

    // Some observers would be interested to know when an an item is locally created
    // If we don't send this out, these observers would have to wait until MappingSourceRemoteSaved
    // to hear about it, but sometimes, RemoveSaved is explicitly ignored by the observer to avoid
    // recursive callbacks. See componentManager's syncObserver callback.
    // dontNotifyObservers is currently only set true by modelManagers mapResponseItemsToLocalModels
    if(!dontNotifyObservers) {
      this.notifySyncObserversOfModels([item], SFModelManager.MappingSourceLocalSaved);
    }

    return item;
  }

  /*
    Be sure itemResponse is a generic Javascript object, and not an Item.
    An Item needs to collapse its properties into its content object before it can be duplicated.
    Note: the reason we need this function is specificallty for the call to resolveReferencesForItem.
    This method creates but does not add the item to the global inventory. It's used by syncManager
    to check if this prospective duplicate item is identical to another item, including the references.
   */
  createDuplicateItem(itemResponse) {
    var dup = this.createItem(itemResponse, true);
    this.resolveReferencesForItem(dup);
    return dup;
  }

  addDuplicatedItem(dup, original) {
    this.addItem(dup);
    dup.conflict_of = original.uuid;
    dup.setDirty(true);
  }

  addItem(item, globalOnly = false) {
    this.addItems([item], globalOnly);
  }

  addItems(items, globalOnly = false) {
    items.forEach((item) => {
      if(!_.find(this.items, {uuid: item.uuid})) {
        this.items.push(item);
      }
    });
  }

  resolveReferencesForItem(item, markReferencesDirty = false) {

    // console.log("resolveReferencesForItem", item, "references", item.contentObject.references);

    var contentObject = item.contentObject;

    // If another client removes an item's references, this client won't pick up the removal unless
    // we remove everything not present in the current list of references
    item.updateLocalRelationships();

    if(!contentObject.references) {
      return;
    }

    var references = contentObject.references.slice(); // make copy, references will be modified in array

    for(var reference of references) {
      var referencedItem = this.findItem(reference.uuid);
      if(referencedItem) {
        item.addItemAsRelationship(referencedItem);
        if(markReferencesDirty) {
          referencedItem.setDirty(true);
        }
      } else {
        // Allows mapper to check when missing reference makes it through the loop,
        // and then runs resolveReferencesForItem again for the original item.
        let missedRef = {reference_uuid: reference.uuid, for_item: item};
        if(!_.find(this.missedReferences, missedRef)) {
          this.missedReferences.push(missedRef);
        }
      }
    }
  }

  /* Notifies observers when an item has been synced or mapped from a remote response */
  addItemSyncObserver(id, type, callback) {
    this.itemSyncObservers.push({id: id, type: type, callback: callback});
  }

  removeItemSyncObserver(id) {
    _.remove(this.itemSyncObservers, _.find(this.itemSyncObservers, {id: id}));
  }

  getDirtyItems() {
    return this.items.filter((item) => {
      // An item that has an error decrypting can be synced only if it is being deleted.
      // Otherwise, we don't want to send corrupt content up to the server.
      return item.dirty == true && !item.dummy && (!item.errorDecrypting || item.deleted);
    })
  }

  clearDirtyItems(items) {
    for(var item of items) {
      item.setDirty(false);
    }
  }

  setItemToBeDeleted(item) {
    item.deleted = true;

    if(!item.dummy) { item.setDirty(true); }

    this.removeAndDirtyAllRelationshipsForItem(item);
  }

  removeAndDirtyAllRelationshipsForItem(item) {
    // Handle direct relationships
    for(var reference of item.content.references) {
      var relationship = this.findItem(reference.uuid);
      if(relationship) {
        item.removeItemAsRelationship(relationship);
        if(relationship.hasRelationshipWithItem(item)) {
          relationship.removeItemAsRelationship(item);
          relationship.setDirty(true);
        }
      }
    }

    // Handle indirect relationships
    for(var object of item.referencingObjects) {
      object.removeItemAsRelationship(item);
      object.setDirty(true);
    }

    item.referencingObjects = [];
  }

  /* Used when changing encryption key */
  setAllItemsDirty(dontUpdateClientDates = true) {
    var relevantItems = this.allItems;

    for(var item of relevantItems) {
      item.setDirty(true, dontUpdateClientDates);
    }
  }

  markAllReferencesDirtyForItem(item, dontUpdateClientDate) {
    var ids = item.content.references.map((r) => {return r.uuid});
    var referencedObjects = this.findItems(ids);
    referencedObjects.forEach(function(reference){
      reference.setDirty(true, dontUpdateClientDate);
    })
  }

  removeItemLocally(item, callback) {
    _.remove(this.items, {uuid: item.uuid});

    item.isBeingRemovedLocally();

    this.itemsPendingRemoval.push(item.uuid);
  }


  /*
  Archives
  */

  async getAllItemsJSONData(keys, authParams, protocolVersion, returnNullIfEmpty) {
    return Promise.all(this.allItems.map((item) => {
      var itemParams = new SFItemParams(item, keys, protocolVersion);
      return itemParams.paramsForExportFile();
    })).then((items) => {
      if(returnNullIfEmpty && items.length == 0) {
        return null;
      }

      var data = {items: items}

      if(keys) {
        // auth params are only needed when encrypted with a standard file key
        data["auth_params"] = authParams;
      }

      return JSON.stringify(data, null, 2 /* pretty print */);
    })

  }
}
