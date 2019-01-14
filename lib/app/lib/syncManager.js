export class SFSyncManager {

  constructor(modelManager, storageManager, httpManager, timeout, interval) {

    SFSyncManager.KeyRequestLoadLocal = "KeyRequestLoadLocal";
    SFSyncManager.KeyRequestSaveLocal = "KeyRequestSaveLocal";
    SFSyncManager.KeyRequestLoadSaveAccount = "KeyRequestLoadSaveAccount";

    this.httpManager = httpManager;
    this.modelManager = modelManager;
    this.storageManager = storageManager;

    // Allows you to et your own interval/timeout function (i.e if you're using angular and want to use $timeout)
    this.$interval = interval || setInterval.bind(window);
    this.$timeout = timeout || setTimeout.bind(window);

    this.syncStatus = {};
    this.syncStatusObservers = [];
    this.eventHandlers = [];
  }

  async getServerURL() {
    return await this.storageManager.getItem("server") || window._default_sf_server;
  }

  async getSyncURL() {
    return await this.getServerURL() + "/items/sync";
  }

  registerSyncStatusObserver(callback) {
    var observer = {key: new Date(), callback: callback};
    this.syncStatusObservers.push(observer);
    return observer;
  }

  removeSyncStatusObserver(observer) {
    _.pull(this.syncStatusObservers, observer);
  }

  syncStatusDidChange() {
    this.syncStatusObservers.forEach((observer) => {
      observer.callback(this.syncStatus);
    })
  }

  addEventHandler(handler) {
    /*
    Possible Events:
    sync:completed
    sync:taking-too-long
    sync:updated_token
    sync:error
    major-data-change
    local-data-loaded
    sync-session-invalid
    sync-exception
     */
    this.eventHandlers.push(handler);
    return handler;
  }

  removeEventHandler(handler) {
    _.pull(this.eventHandlers, handler);
  }

  notifyEvent(syncEvent, data) {
    for(var handler of this.eventHandlers) {
      handler(syncEvent, data || {});
    }
  }

  setKeyRequestHandler(handler) {
    this.keyRequestHandler = handler;
  }

  async getActiveKeyInfo(request) {
    // request can be one of [KeyRequestSaveLocal, KeyRequestLoadLocal, KeyRequestLoadSaveAccount]
    // keyRequestHandler is set externally by using class. It should return an object of this format:
    /*
    {
      keys: {pw, mk, ak}
      auth_params,
      offline: true/false
    }
    */
    return this.keyRequestHandler(request);
  }

  initialDataLoaded() {
    return this._initialDataLoaded;
  }

  async loadLocalItems(incrementalCallback, batchSize = 100) {
    return this.storageManager.getAllModels().then((items) => {
      // break it up into chunks to make interface more responsive for large item counts
      let total = items.length;
      var current = 0;
      var processed = [];

      var decryptNext = async () => {
        var subitems = items.slice(current, current + batchSize);
        var processedSubitems = await this.handleItemsResponse(subitems, null, SFModelManager.MappingSourceLocalRetrieved, SFSyncManager.KeyRequestLoadLocal);
        processed.push(processedSubitems);

        current += subitems.length;

        if(current < total) {
          return new Promise((innerResolve, innerReject) => {
            this.$timeout(() => {
              incrementalCallback && incrementalCallback(current, total);
              decryptNext().then(innerResolve);
            });
          });
        } else {
          // Completed
          this.notifyEvent("local-data-loaded");
          this._initialDataLoaded = true;
        }
      }

      return decryptNext();
    })
  }

  async writeItemsToLocalStorage(items, offlineOnly) {
    return new Promise(async (resolve, reject) => {
      if(items.length == 0) {
        resolve();
        return;
      }

      let info = await this.getActiveKeyInfo(SFSyncManager.KeyRequestSaveLocal);

      Promise.all(items.map(async (item) => {
        var itemParams = new SFItemParams(item, info.keys, info.auth_params);
        itemParams = await itemParams.paramsForLocalStorage();
        if(offlineOnly) {
          delete itemParams.dirty;
        }
        return itemParams;
      })).then((params) => {
        this.storageManager.saveModels(params).then(() => {
          // on success
          if(this.syncStatus.localError) {
            this.syncStatus.localError = null;
            this.syncStatusDidChange();
          }
          resolve();
        }).catch((error) => {
          // on error
          console.error("Error writing items", error);
          this.syncStatus.localError = error;
          this.syncStatusDidChange();
          reject();
        });
      }).catch((e) => {
        reject(e);
      })
    })
  }

  async syncOffline(items) {
    // Update all items updated_at to now
    for(var item of items) { item.updated_at = new Date(); }
    return this.writeItemsToLocalStorage(items, true).then((responseItems) => {
      // delete anything needing to be deleted
      for(var item of items) {
        if(item.deleted) { this.modelManager.removeItemLocally(item);}
      }

      this.notifyEvent("sync:completed", {savedItems: items});
      // Required in order for modelManager to notify sync observers
      this.modelManager.didSyncModelsOffline(items);

      return {saved_items: items};
    })
  }

  /*
    In the case of signing in and merging local data, we alternative UUIDs
    to avoid overwriting data a user may retrieve that has the same UUID.
    Alternating here forces us to to create duplicates of the items instead.
   */
  async markAllItemsDirtyAndSaveOffline(alternateUUIDs) {

    // use a copy, as alternating uuid will affect array
    var originalItems = this.modelManager.allItems.filter((item) => {return !item.errorDecrypting}).slice();

    if(alternateUUIDs) {
      for(var item of originalItems) {
        // Update: the last params has been removed. Defaults to true.
        // Old: alternateUUIDForItem last param is a boolean that controls whether the original item
        // should be removed locally after new item is created. We set this to true, since during sign in,
        // all item ids are alternated, and we only want one final copy of the entire data set.
        // Passing false can be desired sometimes, when for example the app has signed out the user,
        // but for some reason retained their data (This happens in Firefox when using private mode).
        // In this case, we should pass false so that both copies are kept. However, it's difficult to
        // detect when the app has entered this state. We will just use true to remove original items for now.
        await this.modelManager.alternateUUIDForItem(item);
      }
    }

    var allItems = this.modelManager.allItems;
    for(var item of allItems) { item.setDirty(true); }
    return this.writeItemsToLocalStorage(allItems, false);
  }

  async setSyncToken(token) {
    this._syncToken = token;
    await this.storageManager.setItem("syncToken", token);
  }

  async getSyncToken() {
    if(!this._syncToken) {
      this._syncToken = await this.storageManager.getItem("syncToken");
    }
    return this._syncToken;
  }

  async setCursorToken(token) {
    this._cursorToken = token;
    if(token) {
      await this.storageManager.setItem("cursorToken", token);
    } else {
      await this.storageManager.removeItem("cursorToken");
    }
  }

  async getCursorToken() {
    if(!this._cursorToken) {
      this._cursorToken = await this.storageManager.getItem("cursorToken");
    }
    return this._cursorToken;
  }

  get queuedCallbacks() {
    if(!this._queuedCallbacks) {
      this._queuedCallbacks = [];
    }
    return this._queuedCallbacks;
  }

  clearQueuedCallbacks() {
    this._queuedCallbacks = [];
  }

  callQueuedCallbacks(response) {
    var allCallbacks = this.queuedCallbacks;
    if(allCallbacks.length) {
      for(var eachCallback of allCallbacks) {
        eachCallback(response);
      }
      this.clearQueuedCallbacks();
    }
  }

  beginCheckingIfSyncIsTakingTooLong() {
    if(this.syncStatus.checker) {
      this.stopCheckingIfSyncIsTakingTooLong();
    }
    this.syncStatus.checker = this.$interval(function(){
      // check to see if the ongoing sync is taking too long, alert the user
      var secondsPassed = (new Date() - this.syncStatus.syncStart) / 1000;
      var warningThreshold = 5.0; // seconds
      if(secondsPassed > warningThreshold) {
        this.notifyEvent("sync:taking-too-long");
        this.stopCheckingIfSyncIsTakingTooLong();
      }
    }.bind(this), 500)
  }

  stopCheckingIfSyncIsTakingTooLong() {
    if(this.$interval.hasOwnProperty("cancel")) {
      this.$interval.cancel(this.syncStatus.checker);
    } else {
      clearInterval(this.syncStatus.checker);
    }
    this.syncStatus.checker = null;
  }

  lockSyncing() {
    this.syncLocked = true;
  }

  unlockSyncing() {
    this.syncLocked = false;
  }

  async sync(options = {}) {
    return new Promise(async (resolve, reject) => {

      if(this.syncLocked) {
        console.log("Sync Locked, Returning;");
        resolve();
        return;
      }

      if(!options) options = {};

      var allDirtyItems = this.modelManager.getDirtyItems();

      /*
        When it comes to saving to disk before the sync request (both in syncOpInProgress and preSyncSave),
        you only want to save items that have a dirty count > 0. That's because, if for example, you're syncing
        2000 items, and every sync request handles only 150 items at a time, then every sync request will
        be writing the same thousand items to storage every time. Writing a thousand items to storage can take 10s.
        So, save to local storage only items with dirtyCount > 0, then, after saving, set dirtyCount to 0.
        This way, if an item changes again, it will be saved next sync.
      */

      let dirtyItemsNotYetSaved = allDirtyItems.filter((candidate) => {
        if(candidate.dirtyCount > 0) {
          candidate.dirtyCount = 0;
          return true;
        } else {
          return false;
        }
      })

      // When a user hits the physical refresh button, we want to force refresh, in case
      // the sync engine is stuck in some inProgress loop.
      if(this.syncStatus.syncOpInProgress && !options.force) {
        this.repeatOnCompletion = true;
        this.queuedCallbacks.push(resolve);
        await this.writeItemsToLocalStorage(dirtyItemsNotYetSaved, false);
        console.log("Sync op in progress; returning.");
        return;
      }

      let info = await this.getActiveKeyInfo(SFSyncManager.KeyRequestLoadSaveAccount);

      // we want to write all dirty items to disk only if the user is offline, or if the sync op fails
      // if the sync op succeeds, these items will be written to disk by handling the "saved_items" response from the server
      if(info.offline) {
        this.syncOffline(allDirtyItems).then((response) => {
          this.modelManager.clearDirtyItems(allDirtyItems);
          resolve(response);
        }).catch((e) => {
          this.notifyEvent("sync-exception", e);
        })
        return;
      }

      var isContinuationSync = this.syncStatus.needsMoreSync;

      this.syncStatus.syncOpInProgress = true;
      this.syncStatus.syncStart = new Date();
      this.beginCheckingIfSyncIsTakingTooLong();

      let submitLimit = 100;
      var subItems = allDirtyItems.slice(0, submitLimit);
      if(subItems.length < allDirtyItems.length) {
        // more items left to be synced, repeat
        this.syncStatus.needsMoreSync = true;
      } else {
        this.syncStatus.needsMoreSync = false;
      }

      if(!isContinuationSync) {
        this.syncStatus.total = allDirtyItems.length;
        this.syncStatus.current = 0;
      }

      // If items are marked as dirty during a long running sync request, total isn't updated
      // This happens mostly in the case of large imports and sync conflicts where duplicated items are created
      if(this.syncStatus.current > this.syncStatus.total) {
        this.syncStatus.total = this.syncStatus.current;
      }

      this.syncStatusDidChange();

      // Perform save after you've updated all status signals above. Presync save can take several seconds in some cases.
      // Write to local storage before beginning sync.
      // This way, if they close the browser before the sync request completes, local changes will not be lost
      await this.writeItemsToLocalStorage(dirtyItemsNotYetSaved, false);
      if(options.onPreSyncSave) {
        options.onPreSyncSave();
      }

      // when doing a sync request that returns items greater than the limit, and thus subsequent syncs are required,
      // we want to keep track of all retreived items, then save to local storage only once all items have been retrieved,
      // so that relationships remain intact
      // Update 12/18: I don't think we need to do this anymore, since relationships will now retroactively resolve their relationships,
      // if an item they were looking for hasn't been pulled in yet.
      if(!this.allRetreivedItems) {
        this.allRetreivedItems = [];
      }

      // We also want to do this for savedItems
      if(!this.allSavedItems) {
        this.allSavedItems = [];
      }

      var params = {};
      params.limit = 150;

      try {
        await Promise.all(subItems.map((item) => {
          var itemParams = new SFItemParams(item, info.keys, info.auth_params);
          itemParams.additionalFields = options.additionalFields;
          return itemParams.paramsForSync();
        })).then((itemsParams) => {
          params.items = itemsParams;
        })
      } catch (e) {
        this.notifyEvent("sync-exception", e);
      }

      for(var item of subItems) {
        // Reset dirty counter to 0, since we're about to sync it.
        // This means anyone marking the item as dirty after this will cause it so sync again and not be cleared on sync completion.
        item.dirtyCount = 0;
      }

      params.sync_token = await this.getSyncToken();
      params.cursor_token = await this.getCursorToken();

      try {
        this.httpManager.postAbsolute(await this.getSyncURL(), params, (response) => {
          this.handleSyncSuccess(subItems, response, options).then(() => {
            resolve(response);
          }).catch((e) => {
            console.log("Caught sync success exception:", e);
            this.handleSyncError(null, null, allDirtyItems).then((errorResponse) => {
              resolve(errorResponse);
            });
          });
        }, (response, statusCode) => {
          this.handleSyncError(response, statusCode, allDirtyItems).then((errorResponse) => {
            resolve(errorResponse);
          });
        });
      }
      catch(e) {
        console.log("Sync exception caught:", e);
      }
    });
  }

  async handleSyncSuccess(syncedItems, response, options) {
    // Check to make sure any subItem hasn't been marked as dirty again while a sync was ongoing
    var itemsToClearAsDirty = [];
    for(var item of syncedItems) {
      if(item.dirtyCount == 0) {
        // Safe to clear as dirty
        itemsToClearAsDirty.push(item);
      }
    }
    this.modelManager.clearDirtyItems(itemsToClearAsDirty);
    this.syncStatus.error = null;

    // Filter retrieved_items to remove any items that may be in saved_items for this complete sync operation
    // When signing in, and a user requires many round trips to complete entire retrieval of data, an item may be saved
    // on the first trip, then on subsequent trips using cursor_token, this same item may be returned, since it's date is
    // greater than cursor_token. We keep track of all saved items in whole sync operation with this.allSavedItems
    // We need this because singletonManager looks at retrievedItems as higher precendence than savedItems, but if it comes in both
    // then that's problematic.

    let allSavedUUIDs = this.allSavedItems.map((item) => {return item.uuid});
    response.retrieved_items = response.retrieved_items.filter((candidate) => {return !allSavedUUIDs.includes(candidate.uuid)});

    // Map retrieved items to local data
    // Note that deleted items will not be returned
    var retrieved = await this.handleItemsResponse(response.retrieved_items, null, SFModelManager.MappingSourceRemoteRetrieved, SFSyncManager.KeyRequestLoadSaveAccount);

    // Append items to master list of retrieved items for this ongoing sync operation
    this.allRetreivedItems = this.allRetreivedItems.concat(retrieved);
    this.syncStatus.retrievedCount = this.allRetreivedItems.length;

    // Merge only metadata for saved items
    // we write saved items to disk now because it clears their dirty status then saves
    // if we saved items before completion, we had have to save them as dirty and save them again on success as clean
    var omitFields = ["content", "auth_hash"];

    // Map saved items to local data
    var saved = await this.handleItemsResponse(response.saved_items, omitFields, SFModelManager.MappingSourceRemoteSaved, SFSyncManager.KeyRequestLoadSaveAccount);

    // Append items to master list of saved items for this ongoing sync operation
    this.allSavedItems = this.allSavedItems.concat(saved);

    // Create copies of items or alternate their uuids if neccessary
    var unsaved = response.unsaved;
    // don't `await`. This function calls sync, so if you wait, it will call sync without having completed the sync we're in.
    // On second thought, calling await will only await the local conflict resolution and not await the sync call.
    // We do need to wait here for sync duplication to finish. If we don't, there seems to be an issue where if you import a large
    // backup with uuid-conflcits (from another account), you'll see very confused duplication.
    await this.handleUnsavedItemsResponse(unsaved);

    await this.writeItemsToLocalStorage(saved, false);
    await this.writeItemsToLocalStorage(retrieved, false);

    this.syncStatus.syncOpInProgress = false;
    this.syncStatus.current += syncedItems.length;

    this.syncStatusDidChange();

    let isInitialSync = (await this.getSyncToken()) == null;

    // set the sync token at the end, so that if any errors happen above, you can resync
    this.setSyncToken(response.sync_token);
    this.setCursorToken(response.cursor_token);

    this.stopCheckingIfSyncIsTakingTooLong();

    // Oct 2018: Why use both this.syncStatus.needsMoreSync and this.repeatOnCompletion?
    // They seem to do the same thing.

    let cursorToken = await this.getCursorToken();
    if(cursorToken || this.syncStatus.needsMoreSync) {
      return new Promise((resolve, reject) => {
        setTimeout(function () {
          this.sync(options).then(resolve);
        }.bind(this), 10); // wait 10ms to allow UI to update
      })
    }

    else if(this.repeatOnCompletion) {
      this.repeatOnCompletion = false;
      return new Promise((resolve, reject) => {
        setTimeout(function () {
          this.sync(options).then(resolve);
        }.bind(this), 10); // wait 10ms to allow UI to update
      });
    }

    else {
      /*
      // await this.writeItemsToLocalStorage(this.allRetreivedItems, false);
        We used to do this, but the problem is, if you're saving 2000 items at the end of a sign in,
        then refresh or close the page, the items will not be saved, and the sync token will be the lastest.
        So the data won't be downloaded again. Instead, we'll save retrieved as they come.
      */


      this.syncStatus.retrievedCount = 0;
      this.syncStatusDidChange();

      // The number of changed items that constitute a major change
      // This is used by the desktop app to create backups
      let majorDataChangeThreshold = 10;
      if(
        this.allRetreivedItems.length >= majorDataChangeThreshold ||
        saved.length >= majorDataChangeThreshold ||
        unsaved.length >= majorDataChangeThreshold
      ) {
        this.notifyEvent("major-data-change");
      }

      this.callQueuedCallbacks(response);
      this.notifyEvent("sync:completed", {retrievedItems: this.allRetreivedItems, savedItems: this.allSavedItems, unsavedItems: unsaved, initialSync: isInitialSync});

      this.allRetreivedItems = [];
      this.allSavedItems = [];

      return response;
    }
  }

  async handleSyncError(response, statusCode, allDirtyItems) {
    if(statusCode == 401) {
      this.notifyEvent("sync-session-invalid");
    }

    console.log("Sync error: ", response);

    if(!response) {
      response = {error: {message: "Could not connect to server."}};
    } else if(typeof response == 'string') {
      response = {error: {message: response}};
    }

    this.syncStatus.syncOpInProgress = false;
    this.syncStatus.error = response.error;
    this.syncStatusDidChange();

    this.writeItemsToLocalStorage(allDirtyItems, false);
    this.modelManager.didSyncModelsOffline(allDirtyItems);

    this.stopCheckingIfSyncIsTakingTooLong();

    this.notifyEvent("sync:error", response.error);

    this.callQueuedCallbacks({error: "Sync error"});

    return response;
  }

  async handleItemsResponse(responseItems, omitFields, source, keyRequest) {
    var keys = (await this.getActiveKeyInfo(keyRequest)).keys;
    await SFJS.itemTransformer.decryptMultipleItems(responseItems, keys);
    var items = this.modelManager.mapResponseItemsToLocalModelsOmittingFields(responseItems, omitFields, source);

    // During the decryption process, items may be marked as "errorDecrypting". If so, we want to be sure
    // to persist this new state by writing these items back to local storage. When an item's "errorDecrypting"
    // flag is changed, its "errorDecryptingValueChanged" flag will be set, so we can find these items by filtering (then unsetting) below:
    var itemsWithErrorStatusChange = items.filter((item) => {
      var valueChanged = item.errorDecryptingValueChanged;
      // unset after consuming value
      item.errorDecryptingValueChanged = false;
      return valueChanged;
    });
    if(itemsWithErrorStatusChange.length > 0) {
      this.writeItemsToLocalStorage(itemsWithErrorStatusChange, false);
    }

    return items;
  }

  async refreshErroredItems() {
    var erroredItems = this.modelManager.allItems.filter((item) => {return item.errorDecrypting == true});
    if(erroredItems.length > 0) {
      return this.handleItemsResponse(erroredItems, null, SFModelManager.MappingSourceLocalRetrieved, SFSyncManager.KeyRequestLoadSaveAccount);
    }
  }

  async handleUnsavedItemsResponse(unsaved) {
    if(unsaved.length == 0) {
      return;
    }

    console.log("Handle Conflicted Items:", unsaved);

    for(let mapping of unsaved) {
      var itemResponse = mapping.item;
      await SFJS.itemTransformer.decryptMultipleItems([itemResponse], (await this.getActiveKeyInfo(SFSyncManager.KeyRequestLoadSaveAccount)).keys);
      var item = this.modelManager.findItem(itemResponse.uuid);

      // Could be deleted
      if(!item) { continue; }

      var error = mapping.error;

      if(error.tag === "uuid_conflict") {
        // UUID conflicts can occur if a user attempts to
        // import an old data archive with uuids from the old account into a new account
        await this.modelManager.alternateUUIDForItem(item);
      }

      else if(error.tag === "sync_conflict") {
        // Create a new item with the same contents of this item if the contents differ
        // We want a new uuid for the new item. Note that this won't neccessarily adjust references.
        itemResponse.uuid = await SFJS.crypto.generateUUID();

        var dup = this.modelManager.createConflictedItem(itemResponse);
        if(!itemResponse.deleted && !item.isItemContentEqualWith(dup)) {
          this.modelManager.addConflictedItem(dup, item);
        }
      }
    }

    // This will immediately result in "Sync op in progress" and sync will be queued.
    // That's ok. You actually want a sync op in progress so that the new items are saved to disk right away.
    // If you add a timeout here of 100ms, you'll avoid sync op in progress, but it will be a few ms before the items
    // are saved to disk, meaning that the user may see All changes saved a few ms before changes are saved to disk.
    // You could also just write to disk manually here, but syncing here is 100% sure to trigger sync op in progress as that's
    // where it's being called from.
    this.sync(null, {additionalFields: ["created_at", "updated_at"]});
  }

  /*
    Executes a sync request with a blank sync token and high download limit. It will download all items,
    but won't do anything with them other than decrypting, creating respective objects, and returning them to caller. (it does not map them nor establish their relationships)
    The use case came primarly for clients who had ignored a certain content_type in sync, but later issued an update
    indicated they actually did want to start handling that content type. In that case, they would need to download all items
    freshly from the server.(Ideally in the future the server would accept a content_type param to only download items of that type.
    We've inserted that into the params in anticipation, but the server currently totally ignores that.
  */
  stateless_downloadAllItems(options = {}) {
    return new Promise(async (resolve, reject) => {
      var params = {
        limit: options.limit || 500,
        sync_token: options.syncToken,
        cursor_token: options.cursorToken,
        content_type: options.contentType /* currently ignored by server, placed preemptively. See comment above */
      };

      try {
        this.httpManager.postAbsolute(await this.getSyncURL(), params, async (response) => {
          if(!options.retrievedItems) {
            options.retrievedItems = [];
          }

          let incomingItems = response.retrieved_items;
          var keys = (await this.getActiveKeyInfo(SFSyncManager.KeyRequestLoadSaveAccount)).keys;
          await SFJS.itemTransformer.decryptMultipleItems(incomingItems, keys);

          options.retrievedItems = options.retrievedItems.concat(incomingItems.map((incomingItem) => {
            // Create model classes
            return this.modelManager.createItem(incomingItem, true /* dontNotifyObservers */);
          }));
          options.syncToken = response.sync_token;
          options.cursorToken = response.cursor_token;

          if(options.cursorToken) {
            this.stateless_downloadAllItems(options).then(resolve);
          } else {
            resolve(options.retrievedItems);
          }
        }, (response, statusCode) => {
          reject(response);
        });
      } catch(e) {
        console.log("Download all items exception caught:", e);
        reject(e);
      }
    });
  }

  async handleSignout() {
    this._syncToken = null;
    this._cursorToken = null;
    this._queuedCallbacks = [];
    this.syncStatus = {};
  }

  async clearSyncToken() {
    this._syncToken = null;
    this._cursorToken = null;
    return this.storageManager.removeItem("syncToken");
  }
}
