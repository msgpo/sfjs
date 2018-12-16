export class SFModelManager {

  constructor(timeout) {
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

    this.$timeout = timeout || setTimeout.bind(window);

    this.itemSyncObservers = [];
    this.itemsPendingRemoval = [];
    this.items = [];
    this.itemsHash = {};
    this.missedReferences = {};
    this.uuidChangeObservers = [];
  }

  handleSignout() {
    this.items.length = 0;
    this.itemsHash = {};
    this.itemsPendingRemoval.length = 0;
    this.missedReferences = {};
  }

  addModelUuidChangeObserver(id, callback) {
    this.uuidChangeObservers.push({id: id, callback: callback});
  }

  notifyObserversOfUuidChange(oldItem, newItem) {
    for(var observer of this.uuidChangeObservers) {
      observer.callback(oldItem, newItem);
    }
  }

  async alternateUUIDForItem(item) {
    // We need to clone this item and give it a new uuid, then delete item with old uuid from db (you can't modify uuid's in our indexeddb setup)
    var newItem = this.createItem(item);
    newItem.uuid = await SFJS.crypto.generateUUID();

    // Update uuids of relationships
    newItem.informReferencesOfUUIDChange(item.uuid, newItem.uuid);
    this.informModelsOfUUIDChangeForItem(newItem, item.uuid, newItem.uuid);

    console.log(item.uuid, "-->", newItem.uuid);

    // Set to deleted, then run through mapping function so that observers can be notified
    item.deleted = true;
    item.content.references = [];
    // Don't set dirty, because we don't need to sync old item. alternating uuid only occurs in two cases:
    // signing in and merging offline data, or when a uuid-conflict occurs. In both cases, the original item never
    // saves to a server, so doesn't need to be synced.
    // informModelsOfUUIDChangeForItem may set this object to dirty, but we want to undo that here, so that the item gets deleted
    // right away through the mapping function.
    item.setDirty(false);
    this.mapResponseItemsToLocalModels([item], SFModelManager.MappingSourceLocalSaved);

    // add new item
    this.addItem(newItem);
    newItem.setDirty(true);
    this.resolveReferencesForItem(newItem);

    this.notifyObserversOfUuidChange(item, newItem);

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

  didSyncModelsOffline(items) {
    this.notifySyncObserversOfModels(items, SFModelManager.MappingSourceLocalSaved);
  }

  mapResponseItemsToLocalModels(items, source, sourceKey) {
    return this.mapResponseItemsToLocalModelsOmittingFields(items, null, source, sourceKey);
  }

  mapResponseItemsToLocalModelsOmittingFields(items, omitFields, source, sourceKey) {
    var models = [], processedObjects = [], modelsToNotifyObserversOf = [];

    // first loop should add and process items
    for(var json_obj of items) {
      if(!json_obj) {
        continue;
      }
      if((!json_obj.content_type || !json_obj.content || !json_obj.uuid) && !json_obj.deleted && !json_obj.errorDecrypting) {
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
      var unknownContentType = this.acceptableContentTypes && !this.acceptableContentTypes.includes(contentType);
      if(unknownContentType) {
        continue;
      }

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
    for(let [index, json_obj] of processedObjects.entries()) {
      var model = models[index];
      if(json_obj.content) {
        this.resolveReferencesForItem(model);
      }

      var missedRefs = this.popMissedReferenceStructsForObject(json_obj);
      for(var ref of missedRefs) {
        this.resolveReferencesForItem(ref.for_item);
      }

      model.didFinishSyncing();
    }

    this.notifySyncObserversOfModels(modelsToNotifyObserversOf, source, sourceKey);

    return models;
  }

  missedReferenceBuildKey(referenceId, objectId) {
    return `${referenceId}:${objectId}`
  }

  popMissedReferenceStructsForObject(object) {
    var results = [];
    var toDelete = [];
    for(var candidateKey of Object.keys(this.missedReferences)) {
      var matches = candidateKey.split(":")[0] == object.uuid;
      if(matches) {
        results.push(this.missedReferences[candidateKey]);
        toDelete.push(candidateKey);
      }
    }

    // remove from hash
    for(var key of toDelete) {
      delete this.missedReferences[key];
    }

    return results;
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

    var referencesIds = references.map((ref) => {return ref.uuid});
    let includeBlanks = true;
    var referencesObjectResults = this.findItems(referencesIds, includeBlanks);

    for(let [index, referencedItem] of referencesObjectResults.entries()) {
      if(referencedItem) {
        item.addItemAsRelationship(referencedItem);
        if(markReferencesDirty) {
          referencedItem.setDirty(true);
        }
      } else {
        var missingRefId = referencesIds[index];
        // Allows mapper to check when missing reference makes it through the loop,
        // and then runs resolveReferencesForItem again for the original item.
        var mappingKey = this.missedReferenceBuildKey(missingRefId, item.uuid);
        if(!this.missedReferences[mappingKey]) {
          let missedRef = {reference_uuid: missingRefId, for_item: item};
          this.missedReferences[mappingKey] = missedRef;
        }
      }
    }
  }

  /* Note that this function is public, and can also be called manually (desktopManager uses it) */
  notifySyncObserversOfModels(models, source, sourceKey) {
    // Make sure `let` is used in the for loops instead of `var`, as we will be using a timeout below.
    for(let observer of this.itemSyncObservers) {
      var allRelevantItems = observer.types.includes("*") ? models : models.filter((item) => {return observer.types.includes(item.content_type)});
      var validItems = [], deletedItems = [];
      for(let item of allRelevantItems) {
        if(item.deleted) {
          deletedItems.push(item);
        } else {
          validItems.push(item);
        }
      }

      if(allRelevantItems.length > 0) {
        this._callSyncObserverCallbackWithTimeout(observer, allRelevantItems, validItems, deletedItems, source, sourceKey);
      }
    }
  }

  /*
    Rather than running this inline in a for loop, which causes problems and requires all variables to be declared with `let`,
    we'll do it here so it's more explicit and less confusing.
   */
  _callSyncObserverCallbackWithTimeout(observer, allRelevantItems, validItems, deletedItems, source, sourceKey) {
    this.$timeout(() => {
      observer.callback(allRelevantItems, validItems, deletedItems, source, sourceKey);
    })
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
  createConflictedItem(itemResponse) {
    var dup = this.createItem(itemResponse, true);
    return dup;
  }

  addConflictedItem(dup, original) {
    this.addItem(dup);
    // the duplicate should inherit the original's relationships
    for(var referencingObject of original.referencingObjects) {
      referencingObject.addItemAsRelationship(dup);
      referencingObject.setDirty(true);
    }
    this.resolveReferencesForItem(dup);
    dup.conflict_of = original.uuid;
    dup.setDirty(true);
  }

  duplicateItem(item) {
    var copy = new item.constructor({content: item.content});

    this.addItem(copy);

    // the duplicate should inherit the original's relationships
    for(var referencingObject of item.referencingObjects) {
      referencingObject.addItemAsRelationship(copy);
      referencingObject.setDirty(true);
    }
    this.resolveReferencesForItem(copy);
    copy.setDirty(true);

    return copy;
  }

  addItem(item, globalOnly = false) {
    this.addItems([item], globalOnly);
  }

  addItems(items, globalOnly = false) {
    items.forEach((item) => {
      if(!this.itemsHash[item.uuid]) {
        this.itemsHash[item.uuid] = item;
        this.items.push(item);
      }
    });
  }

  /* Notifies observers when an item has been synced or mapped from a remote response */
  addItemSyncObserver(id, types, callback) {
    if(!Array.isArray(types)) {
      types = [types];
    }
    this.itemSyncObservers.push({id: id, types: types, callback: callback});
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

  removeItemLocally(item, callback) {
    _.remove(this.items, {uuid: item.uuid});
    delete this.itemsHash[item.uuid]

    item.isBeingRemovedLocally();

    this.itemsPendingRemoval.push(item.uuid);
  }

  /* Searching */

  get allItems() {
    return this.items.filter(function(item){
      return !item.dummy;
    })
  }

  allItemsMatchingTypes(contentTypes) {
    return this.allItems.filter(function(item){
      return (_.includes(contentTypes, item.content_type) || _.includes(contentTypes, "*")) && !item.dummy;
    })
  }

  invalidItems() {
    return this.allItems.filter((item) => {
      return item.errorDecrypting;
    });
  }

  validItemsForContentType(contentType) {
    return this.allItems.filter((item) => {
      return item.content_type == contentType && !item.errorDecrypting;
    });
  }

  findItem(itemId) {
    return this.itemsHash[itemId];
  }

  findItems(ids, includeBlanks = false) {
    var results = [];
    for(var id of ids) {
      var item = this.itemsHash[id];
      if(item || includeBlanks) {
        results.push(item);
      }
    }
    return results;
  }

  itemsMatchingPredicate(predicate) {
    return this.itemsMatchingPredicates([predicate]);
  }

  itemsMatchingPredicates(predicates) {
    return this.filterItemsWithPredicates(this.allItems, predicates);
  }

  filterItemsWithPredicates(items, predicates) {
    var results = items.filter((item) => {
      for(var predicate of predicates)  {
        if(!item.satisfiesPredicate(predicate)) {
          return false;
        }
      }
      return true;
    })

    return results;
  }


  /*
  Archives
  */

  importItems(externalItems) {
    var itemsToBeMapped = [];
    for(var itemData of externalItems) {
      var existing = this.findItem(itemData.uuid);
      if(existing && !existing.errorDecrypting) {
        // if the item already exists, check to see if it's different from the import data.
        // If it's the same, do nothing, otherwise, create a copy.
        itemData.uuid = null;
        var dup = this.createConflictedItem(itemData);
        if(!itemData.deleted && !existing.isItemContentEqualWith(dup)) {
          // Data differs
          this.addConflictedItem(dup, existing);
          itemsToBeMapped.push(dup);
        }
      } else {
        // it doesn't exist, push it into items to be mapped
        itemsToBeMapped.push(itemData);
        if(existing && existing.errorDecrypting) {
          existing.errorDecrypting = false;
        }
      }
    }

    var items = this.mapResponseItemsToLocalModels(itemsToBeMapped, SFModelManager.MappingSourceFileImport);
    for(var item of items) {
      item.setDirty(true, true);
      item.deleted = false;
    }

    return items;
  }

  async getAllItemsJSONData(keys, authParams, returnNullIfEmpty) {
    return this.getJSONDataForItems(this.allItems, keys, authParams, returnNullIfEmpty);
  }

  async getJSONDataForItems(items, keys, authParams, returnNullIfEmpty) {
    return Promise.all(items.map((item) => {
      var itemParams = new SFItemParams(item, keys, authParams);
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
