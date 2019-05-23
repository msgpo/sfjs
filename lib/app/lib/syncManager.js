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

    // this.loggingEnabled = true;

    this.PerSyncItemUploadLimit = 150;
    this.ServerItemDownloadLimit = 150;

    // The number of changed items that constitute a major change
    // This is used by the desktop app to create backups
    this.MajorDataChangeThreshold = 15;

    // Sync integrity checking
    // If X consective sync requests return mismatching hashes, then we officially enter out-of-sync.
    this.MaxDiscordanceBeforeOutOfSync = 5;

    // How many consective sync results have had mismatching hashes. This value can never exceed this.MaxDiscordanceBeforeOutOfSync.
    this.syncDiscordance = 0;
    this.outOfSync = false;
  }

  async handleServerIntegrityHash(serverHash) {
    if(!serverHash || serverHash.length == 0) {
      return true;
    }

    let localHash = await this.modelManager.computeDataIntegrityHash();

    // if localHash is null, it means computation failed. We can do nothing but return true for success here
    if(!localHash) {
      return true;
    }

    if(localHash !== serverHash) {
      this.syncDiscordance++;
      if(this.syncDiscordance >= this.MaxDiscordanceBeforeOutOfSync) {
        if(!this.outOfSync) {
          this.outOfSync = true;
          this.notifyEvent("enter-out-of-sync");
        }
      }
      return false;
    } else {
      // Integrity matches
      if(this.outOfSync) {
        this.outOfSync = false;
        this.notifyEvent("exit-out-of-sync");
      }
      this.syncDiscordance = 0;
      return true;
    }
  }

  isOutOfSync() {
    // Once we are outOfSync, it's up to the client to display UI to the user to instruct them
    // to take action. The client should present a reconciliation wizard.
    return this.outOfSync;
  }

  async getServerURL() {
    return await this.storageManager.getItem("server") || window._default_sf_server;
  }

  async getSyncURL() {
    return await this.getServerURL() + "/items/sync";
  }

  registerSyncStatusObserver(callback) {
    let observer = {key: new Date(), callback: callback};
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
    for(let handler of this.eventHandlers) {
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
      // put most recently updated at beginning, sorted by priority
      items = items.sort((a,b) => {
        let dateResult = new Date(b.updated_at) - new Date(a.updated_at);

        let priorityList = this.contentTypeLoadPriority;
        let aPriority = 0, bPriority = 0;
        if(priorityList) {
          aPriority = priorityList.indexOf(a.content_type);
          bPriority = priorityList.indexOf(b.content_type);
          if(aPriority == -1) {
            // Not found in list, not prioritized. Set it to max value
            aPriority = priorityList.length;
          }
          if(bPriority == -1) {
            // Not found in list, not prioritized. Set it to max value
            bPriority = priorityList.length;
          }
        }

        if(aPriority == bPriority) {
          return dateResult;
        }

        if(aPriority < bPriority) {
          return -1;
        } else {
          return 1;
        }

        // aPriority < bPriority means a should come first
        return aPriority < bPriority ? -1 : 1;
      })

      // break it up into chunks to make interface more responsive for large item counts
      let total = items.length;
      let current = 0;
      let processed = [];

      let decryptNext = async () => {
        let subitems = items.slice(current, current + batchSize);
        let processedSubitems = await this.handleItemsResponse(subitems, null, SFModelManager.MappingSourceLocalRetrieved, SFSyncManager.KeyRequestLoadLocal);
        processed.push(processedSubitems);

        current += subitems.length;

        if(current < total) {
          return new Promise((innerResolve, innerReject) => {
            this.$timeout(() => {
              this.notifyEvent("local-data-incremental-load");
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
        let itemParams = new SFItemParams(item, info.keys, info.auth_params);
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
    for(let item of items) { item.updated_at = new Date(); }
    return this.writeItemsToLocalStorage(items, true).then((responseItems) => {
      // delete anything needing to be deleted
      for(let item of items) {
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
    let originalItems = this.modelManager.allNondummyItems.filter((item) => {return !item.errorDecrypting}).slice();

    if(alternateUUIDs) {
      for(let item of originalItems) {
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

    let allItems = this.modelManager.allNondummyItems;
    for(let item of allItems) { item.setDirty(true); }
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
    let allCallbacks = this.queuedCallbacks;
    if(allCallbacks.length) {
      for(let eachCallback of allCallbacks) {
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
      let secondsPassed = (new Date() - this.syncStatus.syncStart) / 1000;
      let warningThreshold = 5.0; // seconds
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
    if(this.syncLocked) {
      console.log("Sync Locked, Returning;");
      return;
    }

    if(!options) options = {};

    let allDirtyItems = this.modelManager.getDirtyItems();

    let dirtyItemsNotYetSaved = allDirtyItems.filter((candidate) => {
      if(!this.lastDirtyItemsSave) {
        return true;
      }

      let diffInMs = this.lastDirtyItemsSave - candidate.dirtiedDate;
      // If diffInMs is positive, it means the last save date was after this item was dirtied, which means we don't need to save it again.
      // If diffInMs is negative, it means the last save date was before this item was dirtied, which means we need to save it.
      // We'll include a small buffer to account for small differences.
      if(diffInMs < -100) {
        return true;
      } else {
        return false;
      }
    })

    // When a user hits the physical refresh button, we want to force refresh, in case
    // the sync engine is stuck in some inProgress loop.
    if(this.syncStatus.syncOpInProgress && !options.force) {
      this.repeatOnCompletion = true;
      await this.writeItemsToLocalStorage(dirtyItemsNotYetSaved, false);
      this.lastDirtyItemsSave = new Date();
      console.log("Sync op in progress; returning.");
      return;
    }

    // Set this value immediately after checking it above, to avoid race conditions.
    this.syncStatus.syncOpInProgress = true;

    let info = await this.getActiveKeyInfo(SFSyncManager.KeyRequestLoadSaveAccount);

    // we want to write all dirty items to disk only if the user is offline, or if the sync op fails
    // if the sync op succeeds, these items will be written to disk by handling the "saved_items" response from the server
    if(info.offline) {
      return this.syncOffline(allDirtyItems).then((response) => {
        this.syncStatus.syncOpInProgress = false;
        this.modelManager.clearDirtyItems(allDirtyItems);
      }).catch((e) => {
        this.notifyEvent("sync-exception", e);
      })
    }

    let isContinuationSync = this.syncStatus.needsMoreSync;
    this.syncStatus.syncStart = new Date();
    this.beginCheckingIfSyncIsTakingTooLong();

    return new Promise(async (resolve, reject) => {
      let submitLimit = this.PerSyncItemUploadLimit;
      let subItems = allDirtyItems.slice(0, submitLimit);
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
      this.lastDirtyItemsSave = new Date();

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

      let params = {};
      params.limit = this.ServerItemDownloadLimit;

      if(options.performIntegrityCheck) {
        params.compute_integrity = true;
      }

      try {
        await Promise.all(subItems.map((item) => {
          let itemParams = new SFItemParams(item, info.keys, info.auth_params);
          itemParams.additionalFields = options.additionalFields;
          return itemParams.paramsForSync();
        })).then((itemsParams) => {
          params.items = itemsParams;
        })
      } catch (e) {
        this.notifyEvent("sync-exception", e);
      }

      for(let item of subItems) {
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
    if(options.simulateHighLatency) {
      // Useful for testing
      let latency = options.simulatedLatency || 1000;
      const sleep = async () => {
        return new Promise((resolve, reject) => {
          setTimeout(function () {
            resolve();
          }, latency);
        })
      }

      console.warn("Simulating high latency sync request", latency);
      await sleep();
    }

    this.syncStatus.error = null;

    if(this.loggingEnabled) {
      console.log("Sync response", response);
    }

    let allSavedUUIDs = this.allSavedItems.map((item) => item.uuid);
    let currentRequestSavedUUIDs = response.saved_items.map((savedResponse) => savedResponse.uuid);

    response.retrieved_items = response.retrieved_items.filter((retrievedItem) => {
      let isInPreviousSaved = allSavedUUIDs.includes(retrievedItem.uuid);
      let isInCurrentSaved = currentRequestSavedUUIDs.includes(retrievedItem.uuid);
      if(isInPreviousSaved || isInCurrentSaved) {
        return false;
      }

      let localItem = this.modelManager.findItem(retrievedItem.uuid);
      if(localItem && localItem.dirty) {
        return false;
      }
      return true;
    });

    // Clear dirty items after we've finish filtering retrieved_items above, since that depends on dirty items.
    // Check to make sure any subItem hasn't been marked as dirty again while a sync was ongoing
    let itemsToClearAsDirty = [];
    for(let item of syncedItems) {
      if(item.dirtyCount == 0) {
        // Safe to clear as dirty
        itemsToClearAsDirty.push(item);
      }
    }

    this.modelManager.clearDirtyItems(itemsToClearAsDirty);

    // Map retrieved items to local data
    // Note that deleted items will not be returned
    let retrieved = await this.handleItemsResponse(response.retrieved_items, null, SFModelManager.MappingSourceRemoteRetrieved, SFSyncManager.KeyRequestLoadSaveAccount);

    // Append items to master list of retrieved items for this ongoing sync operation
    this.allRetreivedItems = this.allRetreivedItems.concat(retrieved);
    this.syncStatus.retrievedCount = this.allRetreivedItems.length;

    // Merge only metadata for saved items
    // we write saved items to disk now because it clears their dirty status then saves
    // if we saved items before completion, we had have to save them as dirty and save them again on success as clean
    let omitFields = ["content", "auth_hash"];

    // Map saved items to local data
    let saved = await this.handleItemsResponse(response.saved_items, omitFields, SFModelManager.MappingSourceRemoteSaved, SFSyncManager.KeyRequestLoadSaveAccount);

    // Append items to master list of saved items for this ongoing sync operation
    this.allSavedItems = this.allSavedItems.concat(saved);

    // 'unsaved' is deprecated and replaced with 'conflicts' in newer version.
    let deprecated_unsaved = response.unsaved;
    await this.deprecated_handleUnsavedItemsResponse(deprecated_unsaved);

    let conflicts = response.conflicts;
    await this.handleConflictsResponse(conflicts);

    await this.writeItemsToLocalStorage(saved, false);
    await this.writeItemsToLocalStorage(retrieved, false);

    this.syncStatus.syncOpInProgress = false;
    this.syncStatus.current += syncedItems.length;

    this.syncStatusDidChange();

    // set the sync token at the end, so that if any errors happen above, you can resync
    this.setSyncToken(response.sync_token);
    this.setCursorToken(response.cursor_token);

    this.stopCheckingIfSyncIsTakingTooLong();

    // if a cursor token is available, dont perform integrity calculation,
    // as content is still on the server waiting to be downloaded
    if(response.integrity_hash && !response.cursor_token) {
      let matches = await this.handleServerIntegrityHash(response.integrity_hash);
      if(!matches) {
        // If the server hash doesn't match our local hash, we want to continue syncing until we reach
        // the max discordance threshold
        if(this.syncDiscordance < this.MaxDiscordanceBeforeOutOfSync) {
          this.repeatOnCompletion = true;
        }
      }
    }

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
      this.syncStatus.retrievedCount = 0;
      this.syncStatusDidChange();

      if(
        this.allRetreivedItems.length >= this.majorDataChangeThreshold ||
        saved.length >= this.majorDataChangeThreshold ||
        (deprecated_unsaved && deprecated_unsaved.length >= this.majorDataChangeThreshold) ||
        (conflicts && conflicts.length >= this.majorDataChangeThreshold)
      ) {
        this.notifyEvent("major-data-change");
      }

      this.callQueuedCallbacks(response);
      this.notifyEvent("sync:completed", {retrievedItems: this.allRetreivedItems, savedItems: this.allSavedItems});

      this.allRetreivedItems = [];
      this.allSavedItems = [];

      return response;
    }
  }

  async handleSyncError(response, statusCode, allDirtyItems) {
    console.log("Sync error: ", response);

    if(statusCode == 401) {
      this.notifyEvent("sync-session-invalid");
    }

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
    let keys = (await this.getActiveKeyInfo(keyRequest)).keys;
    await SFJS.itemTransformer.decryptMultipleItems(responseItems, keys);
    let items = this.modelManager.mapResponseItemsToLocalModelsOmittingFields(responseItems, omitFields, source);

    // During the decryption process, items may be marked as "errorDecrypting". If so, we want to be sure
    // to persist this new state by writing these items back to local storage. When an item's "errorDecrypting"
    // flag is changed, its "errorDecryptingValueChanged" flag will be set, so we can find these items by filtering (then unsetting) below:
    let itemsWithErrorStatusChange = items.filter((item) => {
      let valueChanged = item.errorDecryptingValueChanged;
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
    let erroredItems = this.modelManager.allNondummyItems.filter((item) => {return item.errorDecrypting == true});
    if(erroredItems.length > 0) {
      return this.handleItemsResponse(erroredItems, null, SFModelManager.MappingSourceLocalRetrieved, SFSyncManager.KeyRequestLoadSaveAccount);
    }
  }

  // Legacy API
  async deprecated_handleUnsavedItemsResponse(unsaved) {
    if(!unsaved || unsaved.length == 0) {
      return;
    }

    if(this.loggingEnabled) {
      console.log("Handle Unsaved Items:", unsaved);
    }

    for(let mapping of unsaved) {
      let itemResponse = mapping.item;
      await SFJS.itemTransformer.decryptMultipleItems([itemResponse], (await this.getActiveKeyInfo(SFSyncManager.KeyRequestLoadSaveAccount)).keys);
      let item = this.modelManager.findItem(itemResponse.uuid);

      // Could be deleted
      if(!item) { continue; }

      let error = mapping.error;

      if(error.tag === "uuid_conflict") {
        // UUID conflicts can occur if a user attempts to
        // import an old data archive with uuids from the old account into a new account
        await this.modelManager.alternateUUIDForItem(item);
      }

      else if(error.tag === "sync_conflict") {
        // Create a new item with the same contents of this item if the contents differ
        let dup = await this.modelManager.createDuplicateItemFromResponseItem(itemResponse);
        if(!itemResponse.deleted && !item.isItemContentEqualWith(dup)) {
          this.modelManager.addDuplicatedItemAsConflict({duplicate: dup, duplicateOf: item});
        }
      }
    }

    this.sync(null, {additionalFields: ["created_at", "updated_at"]});
  }

  /*
  The difference between 'unsaved' (deprecated_handleUnsavedItemsResponse) and 'conflicts' (handleConflictsResponse) is that
  with unsaved items, the local copy is triumphant on the server, and we check the server copy to see if we should
  create it as a duplicate. This is for the legacy API where it would save what you sent the server no matter its value,
  and the client would decide what to do with the previous server value.

  handleConflictsResponse on the other hand handles where the local copy save was not triumphant on the server.
  Instead the conflict includes the server item. Here we immediately map the server value onto our local value,
  but before that, we give our local value a chance to duplicate itself if it differs from the server value.
  */
  async handleConflictsResponse(conflicts) {
    if(!conflicts || conflicts.length == 0) { return; }

    if(this.loggingEnabled) {
      console.log("Handle Conflicted Items:", conflicts);
    }

    // Get local values before doing any processing. This way, if a note change below modifies a tag,
    // and the tag is going to be iterated on in the same loop, then we don't want this change to be compared
    // to the local value.
    let localValues = {};
    for(let conflict of conflicts) {
      let serverItemResponse = conflict.server_item || conflict.unsaved_item;
      let localItem = this.modelManager.findItem(serverItemResponse.uuid);
      if(!localItem) {
        localValues[serverItemResponse.uuid] = {};
        continue;
      }
      let frozenContent = localItem.getContentCopy();
      localValues[serverItemResponse.uuid] = {frozenContent, itemRef: localItem};
    }

    for(let conflict of conflicts) {
      // if sync_conflict, we receive conflict.server_item.
      // If uuid_conflict, we receive the value we attempted to save.
      let serverItemResponse = conflict.server_item || conflict.unsaved_item;
      await SFJS.itemTransformer.decryptMultipleItems([serverItemResponse], (await this.getActiveKeyInfo(SFSyncManager.KeyRequestLoadSaveAccount)).keys);
      let {frozenContent, itemRef} = localValues[serverItemResponse.uuid];

      // Could be deleted
      if(!itemRef) { continue; }

      if(conflict.type === "uuid_conflict") {
        // UUID conflicts can occur if a user attempts to
        // import an old data archive with uuids from the old account into a new account
        await this.modelManager.alternateUUIDForItem(itemRef);
        continue;
      }

      if(conflict.type !== "sync_conflict") {
        console.error("Unsupported conflict type", conflict.type);
        continue;
      }

      let tempServerItem = await this.modelManager.createDuplicateItemFromResponseItem(serverItemResponse);
      // Convert to an object simply so we can have access to the `isItemContentEqualWith` function.
      let _tempItemWithFrozenValues = this.modelManager.duplicateItemWithCustomContent({
        content: frozenContent, duplicateOf: itemRef
      });

      // if !frozenContentDiffers && currentContentDiffers, it means values have changed as we were looping through conflicts here.
      let frozenContentDiffers = !_tempItemWithFrozenValues.isItemContentEqualWith(tempServerItem);
      let currentContentDiffers = !itemRef.isItemContentEqualWith(tempServerItem);

      let duplicateLocal = false;
      let duplicateServer = false;
      let keepLocal = false;
      let keepServer = false;

      if(serverItemResponse.deleted || itemRef.deleted) {
        keepServer = true;
      }
      else if(frozenContentDiffers) {
        const IsActiveItemSecondsThreshold = 20;
        let isActivelyBeingEdited = (new Date() - itemRef.client_updated_at) / 1000 < IsActiveItemSecondsThreshold;
        if(isActivelyBeingEdited) {
          keepLocal = true;
          duplicateServer = true;
        } else {
          duplicateLocal = true;
          keepServer = true;
        }
      }
      else if(currentContentDiffers) {
        let contentExcludingReferencesDiffers = !SFItem.AreItemContentsEqual({
          leftContent: itemRef.content,
          rightContent: tempServerItem.content,
          keysToIgnore: itemRef.keysToIgnoreWhenCheckingContentEquality().concat(["references"]),
          appDataKeysToIgnore: itemRef.appDataKeysToIgnoreWhenCheckingContentEquality()
        })
        let isOnlyReferenceChange = !contentExcludingReferencesDiffers;
        if(isOnlyReferenceChange) {
          keepServer = false;
          keepLocal = true;
        } else {
          duplicateLocal = true;
          keepServer = true;
        }
      } else {
        // items are exactly equal
        keepServer = true;
      }

      if(duplicateLocal) {
        await this.modelManager.duplicateItemWithCustomContentAndAddAsConflict({
          content: frozenContent, duplicateOf: itemRef
        });
      }

      if(duplicateServer) {
        this.modelManager.addDuplicatedItemAsConflict({
          duplicate: tempServerItem,
          duplicateOf: itemRef
        });
      }

      if(keepServer) {
        this.modelManager.mapResponseItemsToLocalModelsOmittingFields([serverItemResponse], null, SFModelManager.MappingSourceRemoteRetrieved);
      }

      if(keepLocal) {
        itemRef.updated_at = tempServerItem.updated_at;
        itemRef.setDirty(true);
      }
    }

    this.sync();
  }

  /*
    Executes a sync request with a blank sync token and high download limit. It will download all items,
    but won't do anything with them other than decrypting, creating respective objects, and returning them to caller. (it does not map them nor establish their relationships)
    The use case came primarly for clients who had ignored a certain content_type in sync, but later issued an update
    indicated they actually did want to start handling that content type. In that case, they would need to download all items
    freshly from the server.
  */
  stateless_downloadAllItems(options = {}) {
    return new Promise(async (resolve, reject) => {
      let params = {
        limit: options.limit || 500,
        sync_token: options.syncToken,
        cursor_token: options.cursorToken,
        content_type: options.contentType,
        event: options.event
      };

      try {
        this.httpManager.postAbsolute(await this.getSyncURL(), params, async (response) => {
          if(!options.retrievedItems) {
            options.retrievedItems = [];
          }

          let incomingItems = response.retrieved_items;
          let keys = (await this.getActiveKeyInfo(SFSyncManager.KeyRequestLoadSaveAccount)).keys;
          await SFJS.itemTransformer.decryptMultipleItems(incomingItems, keys);

          options.retrievedItems = options.retrievedItems.concat(incomingItems.map((incomingItem) => {
            // Create model classes
            return this.modelManager.createItem(incomingItem);
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

  async resolveOutOfSync() {
    // Sync all items again to resolve out-of-sync state
    return this.stateless_downloadAllItems({event: "resolve-out-of-sync"}).then(async (downloadedItems) => {
      let itemsToMap = [];
      for(let downloadedItem of downloadedItems) {
        // Note that deleted items will not be sent back by the server.
        let existingItem = this.modelManager.findItem(downloadedItem.uuid);
        if(existingItem) {
          // Check if the content differs. If it does, create a new item, and do not map downloadedItem.
          let contentDoesntMatch = !downloadedItem.isItemContentEqualWith(existingItem);
          if(contentDoesntMatch) {
            // We create a copy of the local existing item and sync that up. It will be a "conflict" of itself
            await this.modelManager.duplicateItemAndAddAsConflict(existingItem);
          }
        }

        // Map the downloadedItem as authoritive content. If client copy at all differed, we would have created a duplicate of it above and synced it.
        // This is also neccessary to map the updated_at value from the server
        itemsToMap.push(downloadedItem);
      }

      this.modelManager.mapResponseItemsToLocalModelsWithOptions({items: itemsToMap, source: SFModelManager.MappingSourceRemoteRetrieved});
      // Save all items locally. Usually sync() would save downloaded items locally, but we're using stateless_sync here, so we have to do it manually
      await this.writeItemsToLocalStorage(this.modelManager.allNondummyItems);
      return this.sync({performIntegrityCheck: true});
    })
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
