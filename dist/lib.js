export class SFAlertManager {

  async alert(params) {
    return new Promise((resolve, reject) => {
      window.alert(params.text);
      resolve();
    })
  }

  async confirm(params) {
    return new Promise((resolve, reject) => {
      if(window.confirm(params.text)) {
        resolve();
      } else {
        reject();
      }
    });
  }

}
;export class SFAuthManager {

  constructor(storageManager, httpManager, alertManager, timeout) {
    SFAuthManager.DidSignOutEvent = "DidSignOutEvent";
    SFAuthManager.WillSignInEvent = "WillSignInEvent";
    SFAuthManager.DidSignInEvent = "DidSignInEvent";

    this.httpManager = httpManager;
    this.storageManager = storageManager;
    this.alertManager = alertManager || new SFAlertManager();
    this.$timeout = timeout || setTimeout.bind(window);

    this.eventHandlers = [];
  }

  addEventHandler(handler) {
    this.eventHandlers.push(handler);
    return handler;
  }

  removeEventHandler(handler) {
    _.pull(this.eventHandlers, handler);
  }

  notifyEvent(event, data) {
    for(var handler of this.eventHandlers) {
      handler(event, data || {});
    }
  }

  async saveKeys(keys) {
    this._keys = keys;
    await this.storageManager.setItem("mk", keys.mk);
    await this.storageManager.setItem("ak", keys.ak);
  }

  async signout(clearAllData) {
    this._keys = null;
    this._authParams = null;
    if(clearAllData) {
      return this.storageManager.clearAllData().then(() => {
        this.notifyEvent(SFAuthManager.DidSignOutEvent);
      })
    } else {
      this.notifyEvent(SFAuthManager.DidSignOutEvent);
    }
  }

  async keys() {
    if(!this._keys) {
      var mk = await this.storageManager.getItem("mk");
      if(!mk) {
        return null;
      }
      this._keys = {mk: mk, ak: await this.storageManager.getItem("ak")};
    }
    return this._keys;
  }

  async getAuthParams() {
    if(!this._authParams) {
      var data = await this.storageManager.getItem("auth_params");
      this._authParams = JSON.parse(data);
    }

    if(this._authParams && !this._authParams.version) {
      this._authParams.version = await this.defaultProtocolVersion();
    }

    return this._authParams;
  }

  async defaultProtocolVersion() {
    var keys = await this.keys();
    if(keys && keys.ak) {
      // If there's no version stored, and there's an ak, it has to be 002. Newer versions would have thier version stored in authParams.
      return "002";
    } else {
      return "001";
    }
  }

  async protocolVersion() {
    var authParams = await this.getAuthParams();
    if(authParams && authParams.version) {
      return authParams.version;
    }

    return this.defaultProtocolVersion();
  }

  async getAuthParamsForEmail(url, email, extraParams) {
    return new Promise((resolve, reject) => {
      var requestUrl = url + "/auth/params";
      this.httpManager.getAbsolute(requestUrl, _.merge({email: email}, extraParams), (response) => {
        resolve(response);
      }, (response) => {
        console.error("Error getting auth params", response);
        if(typeof response !== 'object') {
          response = {error: {message: "A server error occurred while trying to sign in. Please try again."}};
        }
        resolve(response);
      })
    })
  }

  lock() {
    this.locked = true;
  }

  unlock() {
    this.locked = false;
  }

  isLocked() {
    return this.locked == true;
  }

  unlockAndResolve(resolve, param) {
    this.unlock();
    resolve(param);
  }

  async login(url, email, password, strictSignin, extraParams) {
    return new Promise(async (resolve, reject) => {

      let existingKeys = await this.keys();
      if(existingKeys != null) {
        resolve({error : {message: "Cannot log in because already signed in."}});
        return;
      }

      if(this.isLocked()) {
        resolve({error : {message: "Login already in progress."}});
        return;
      }

      this.lock();

      this.notifyEvent(SFAuthManager.WillSignInEvent);

      let authParams = await this.getAuthParamsForEmail(url, email, extraParams);

      // SF3 requires a unique identifier in the auth params
      authParams.identifier = email;

      if(authParams.error) {
        this.unlockAndResolve(resolve, authParams);
        return;
      }

      if(!authParams || !authParams.pw_cost) {
        this.unlockAndResolve(resolve, {error : {message: "Invalid email or password."}});
        return;
      }

      if(!SFJS.supportedVersions().includes(authParams.version)) {
        var message;
        if(SFJS.isVersionNewerThanLibraryVersion(authParams.version)) {
          // The user has a new account type, but is signing in to an older client.
          message = "This version of the application does not support your newer account type. Please upgrade to the latest version of Standard Notes to sign in.";
        } else {
          // The user has a very old account type, which is no longer supported by this client
          message = "The protocol version associated with your account is outdated and no longer supported by this application. Please visit standardnotes.org/help/security for more information.";
        }
        this.unlockAndResolve(resolve, {error: {message: message}});
        return;
      }

      if(SFJS.isProtocolVersionOutdated(authParams.version)) {
        let message = `The encryption version for your account, ${authParams.version}, is outdated and requires upgrade. You may proceed with login, but are advised to perform a security update using the web or desktop application. Please visit standardnotes.org/help/security for more information.`
        var abort = false;
        await this.alertManager.confirm({
          title: "Update Needed",
          text: message,
          confirmButtonText: "Sign In",
        }).catch(() => {
          this.unlockAndResolve(resolve, {error: {}});
          abort = true;
        })
        if(abort) {
          return;
        }
      }

      if(!SFJS.supportsPasswordDerivationCost(authParams.pw_cost)) {
        let message = "Your account was created on a platform with higher security capabilities than this browser supports. " +
        "If we attempted to generate your login keys here, it would take hours. " +
        "Please use a browser with more up to date security capabilities, like Google Chrome or Firefox, to log in."
        this.unlockAndResolve(resolve, {error: {message: message}});
        return;
      }

      var minimum = SFJS.costMinimumForVersion(authParams.version);
      if(authParams.pw_cost < minimum) {
        let message = "Unable to login due to insecure password parameters. Please visit standardnotes.org/help/security for more information.";
        this.unlockAndResolve(resolve, {error: {message: message}});
        return;
      }

      if(strictSignin) {
        // Refuse sign in if authParams.version is anything but the latest version
        var latestVersion = SFJS.version();
        if(authParams.version !== latestVersion) {
          let message = `Strict sign in refused server sign in parameters. The latest security version is ${latestVersion}, but your account is reported to have version ${authParams.version}. If you'd like to proceed with sign in anyway, please disable strict sign in and try again.`;
          this.unlockAndResolve(resolve, {error: {message: message}});
          return;
        }
      }

      let keys = await SFJS.crypto.computeEncryptionKeysForUser(password, authParams);

      var requestUrl = url + "/auth/sign_in";
      var params = _.merge({password: keys.pw, email: email}, extraParams);

      this.httpManager.postAbsolute(requestUrl, params, async (response) => {
        await this.handleAuthResponse(response, email, url, authParams, keys);
        this.notifyEvent(SFAuthManager.DidSignInEvent);
        this.$timeout(() => this.unlockAndResolve(resolve, response));
      }, (response) => {
        console.error("Error logging in", response);
        if(typeof response !== 'object') {
          response = {error: {message: "A server error occurred while trying to sign in. Please try again."}};
        }
        this.$timeout(() => this.unlockAndResolve(resolve, response));
      });
    });
  }

  register(url, email, password) {
    return new Promise(async (resolve, reject) => {

      if(this.isLocked()) {
        resolve({error : {message: "Register already in progress."}});
        return;
      }

      this.lock();

      let results = await SFJS.crypto.generateInitialKeysAndAuthParamsForUser(email, password);
      let keys = results.keys;
      let authParams = results.authParams;

      var requestUrl = url + "/auth";
      var params = _.merge({password: keys.pw, email: email}, authParams);

      this.httpManager.postAbsolute(requestUrl, params, async (response) => {
        await this.handleAuthResponse(response, email, url, authParams, keys);
        this.unlockAndResolve(resolve, response);
      }, (response) => {
        console.error("Registration error", response);
        if(typeof response !== 'object') {
          response = {error: {message: "A server error occurred while trying to register. Please try again."}};
        }
        this.unlockAndResolve(resolve, response);
      })
    });
  }

  async changePassword(url, email, current_server_pw, newKeys, newAuthParams) {
    return new Promise(async (resolve, reject) => {

      if(this.isLocked()) {
        resolve({error : {message: "Change password already in progress."}});
        return;
      }

      this.lock();

      let newServerPw = newKeys.pw;

      var requestUrl = url + "/auth/change_pw";
      var params = _.merge({new_password: newServerPw, current_password: current_server_pw}, newAuthParams);

      this.httpManager.postAbsolute(requestUrl, params, async (response) => {
        await this.handleAuthResponse(response, email, null, newAuthParams, newKeys);
        this.unlockAndResolve(resolve, response);
      }, (response) => {
        if(typeof response !== 'object') {
          response = {error: {message: "Something went wrong while changing your password. Your password was not changed. Please try again."}}
        }
        this.unlockAndResolve(resolve, response);
      })
    });
  }

  async handleAuthResponse(response, email, url, authParams, keys) {
    if(url) { await this.storageManager.setItem("server", url);}
    this._authParams = authParams;
    await this.storageManager.setItem("auth_params", JSON.stringify(authParams));
    await this.storageManager.setItem("jwt", response.token);
    return this.saveKeys(keys);
  }
}
;var globalScope = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : null);

export class SFHttpManager {

  constructor(timeout) {
    // calling callbacks in a $timeout allows UI to update
    this.$timeout = timeout || setTimeout.bind(globalScope);
  }

  setJWTRequestHandler(handler) {
    this.jwtRequestHandler = handler;
  }

  async setAuthHeadersForRequest(request) {
    var token = await this.jwtRequestHandler();
    if(token) {
      request.setRequestHeader('Authorization', 'Bearer ' + token);
    }
  }

  async postAbsolute(url, params, onsuccess, onerror) {
    return this.httpRequest("post", url, params, onsuccess, onerror);
  }

  async patchAbsolute(url, params, onsuccess, onerror) {
    return this.httpRequest("patch", url, params, onsuccess, onerror);
  }

  async getAbsolute(url, params, onsuccess, onerror) {
    return this.httpRequest("get", url, params, onsuccess, onerror);
  }

  async httpRequest(verb, url, params, onsuccess, onerror) {
    return new Promise(async (resolve, reject) => {
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = () => {
          if (xmlhttp.readyState == 4) {
            var response = xmlhttp.responseText;
            if(response) {
              try {
                response = JSON.parse(response);
              } catch(e) {}
            }

           if(xmlhttp.status >= 200 && xmlhttp.status <= 299){
             this.$timeout(function(){
               onsuccess(response);
               resolve(response);
             })
           } else {
             console.error("Request error:", response);
             this.$timeout(function(){
               onerror(response, xmlhttp.status)
               reject(response);
             })
           }
         }
        }

        if(verb == "get" && Object.keys(params).length > 0) {
          url = url + this.formatParams(params);
        }

        xmlhttp.open(verb, url, true);
        await this.setAuthHeadersForRequest(xmlhttp);
        xmlhttp.setRequestHeader('Content-type', 'application/json');

        if(verb == "post" || verb == "patch") {
          xmlhttp.send(JSON.stringify(params));
        } else {
          xmlhttp.send();
        }
    })
  }

  formatParams(params) {
    return "?" + Object
          .keys(params)
          .map(function(key){
            return key+"="+encodeURIComponent(params[key])
          })
          .join("&")
  }

}
;export class SFMigrationManager {

  constructor(modelManager, syncManager, storageManager) {
    this.modelManager = modelManager;
    this.syncManager = syncManager;
    this.storageManager = storageManager;

    this.completionHandlers = [];

    this.loadMigrations();

    this.syncManager.addEventHandler(async (event, data) => {
      var dataLoadedEvent = event == "local-data-loaded";
      var syncCompleteEvent = event == "sync:completed";

      if(dataLoadedEvent || syncCompleteEvent) {
        if(dataLoadedEvent) {
          this.receivedLocalDataEvent = true;
        } else if(syncCompleteEvent) {
          this.receivedSyncCompletedEvent = true;
        }

        // We want to run pending migrations only after local data has been loaded, and a sync has been completed.
        if(this.receivedLocalDataEvent && this.receivedSyncCompletedEvent) {
          if(data && data.initialSync) {
            // If initial online sync, clear any completed migrations that occurred while offline,
            // so they can run again now that we have updated user items. Only clear migrations that
            // don't have `runOnlyOnce` set
            var completedList = (await this.getCompletedMigrations()).slice();
            for(var migrationName of completedList) {
              let migration = await this.migrationForEncodedName(migrationName);
              if(!migration.runOnlyOnce) {
                _.pull(this._completed, migrationName);
              }
            }
          }
          this.runPendingMigrations();
        }
      }
    })
  }

  addCompletionHandler(handler) {
    this.completionHandlers.push(handler);
  }

  removeCompletionHandler(handler) {
    _.pull(this.completionHandlers, handler);
  }

  async migrationForEncodedName(name) {
    let decoded = await this.decode(name);
    return this.migrations.find((migration) => {
      return migration.name == decoded;
    })
  }

  loadMigrations() {
    this.migrations = this.registeredMigrations();
  }

  registeredMigrations() {
    // Subclasses should return an array of migrations here.
    // Migrations should have a unique `name`, `content_type`,
    // and `handler`, which is a function that accepts an array of matching items to migration.
  }

  async runPendingMigrations() {
    var pending = await this.getPendingMigrations();

    // run in pre loop, keeping in mind that a migration may be run twice: when offline then again when signing in.
    // we need to reset the items to a new array.
    for(var migration of pending) {
      migration.items = [];
    }

    for(var item of this.modelManager.allItems) {
      for(var migration of pending) {
        if(item.content_type == migration.content_type) {
          migration.items.push(item);
        }
      }
    }

    for(var migration of pending) {
      if((migration.items && migration.items.length > 0) || migration.customHandler) {
        await this.runMigration(migration, migration.items);
      } else {
        this.markMigrationCompleted(migration);
      }
    }

    for(var handler of this.completionHandlers) {
      handler();
    }
  }

  async encode(text) {
    return window.btoa(text);
  }

  async decode(text) {
    return window.atob(text);
  }

  async getCompletedMigrations() {
    if(!this._completed) {
      var rawCompleted = await this.storageManager.getItem("migrations");
      if(rawCompleted) {
        this._completed = JSON.parse(rawCompleted);
      } else {
        this._completed = [];
      }
    }
    return this._completed;
  }

  async getPendingMigrations() {
    var completed = await this.getCompletedMigrations();
    let pending = [];
    for(var migration of this.migrations) {
      // if the name is not found in completed, then it is pending.
      if(completed.indexOf(await this.encode(migration.name)) == -1) {
        pending.push(migration);
      }
    }
    return pending;
  }

  async markMigrationCompleted(migration) {
    var completed = await this.getCompletedMigrations();
    completed.push(await this.encode(migration.name));
    this.storageManager.setItem("migrations", JSON.stringify(completed));
  }

  async runMigration(migration, items) {
    console.log("Running migration:", migration.name);
    if(migration.customHandler) {
      return migration.customHandler().then(() => {
        this.markMigrationCompleted(migration);
      })
    } else {
      return migration.handler(items).then(() => {
        this.markMigrationCompleted(migration);
      })
    }
  }
}
;export class SFModelManager {

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
    for(let observer of this.uuidChangeObservers) {
      observer.callback(oldItem, newItem);
    }
  }

  async alternateUUIDForItem(item) {
    // We need to clone this item and give it a new uuid, then delete item with old uuid from db (you can't modify uuid's in our indexeddb setup)
    let newItem = this.createItem(item);
    newItem.uuid = await SFJS.crypto.generateUUID();

    // Update uuids of relationships
    newItem.informReferencesOfUUIDChange(item.uuid, newItem.uuid);
    this.informModelsOfUUIDChangeForItem(newItem, item.uuid, newItem.uuid);

    // the new item should inherit the original's relationships
    for(let referencingObject of item.referencingObjects) {
      referencingObject.setIsNoLongerBeingReferencedBy(item);
      referencingObject.addItemAsRelationship(newItem);
      referencingObject.setDirty(true);
    }

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

    // We don't need to do this. The only purpose would be to set up referencingObjects, but we do that above now.
    // this.resolveReferencesForItem(newItem);

    this.notifyObserversOfUuidChange(item, newItem);

    return newItem;
  }

  informModelsOfUUIDChangeForItem(newItem, oldUUID, newUUID) {
    // some models that only have one-way relationships might be interested to hear that an item has changed its uuid
    // for example, editors have a one way relationship with notes. When a note changes its UUID, it has no way to inform the editor
    // to update its relationships

    for(let model of this.items) {
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
    let models = [], processedObjects = [], modelsToNotifyObserversOf = [];

    // first loop should add and process items
    for(let json_obj of items) {
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
        for(let key of omitFields) {
          delete json_obj[key];
        }
      }

      let item = this.findItem(json_obj.uuid);

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
      let unknownContentType = this.acceptableContentTypes && !this.acceptableContentTypes.includes(contentType);
      if(unknownContentType) {
        continue;
      }

      let isDirtyItemPendingDelete = false;
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

    // second loop should process references
    for(let [index, json_obj] of processedObjects.entries()) {
      let model = models[index];
      if(json_obj.content) {
        this.resolveReferencesForItem(model);
      }

      model.didFinishSyncing();
    }

    let missedRefs = this.popMissedReferenceStructsForObjects(processedObjects);
    for(let ref of missedRefs) {
      let model = models.find((candidate) => candidate.uuid == ref.reference_uuid);
      // Model should 100% be defined here, but let's not be too overconfident
      if(model) {
        let itemWaitingForTheValueInThisCurrentLoop = ref.for_item;
        itemWaitingForTheValueInThisCurrentLoop.addItemAsRelationship(model);
      }
    }

    this.notifySyncObserversOfModels(modelsToNotifyObserversOf, source, sourceKey);

    return models;
  }

  missedReferenceBuildKey(referenceId, objectId) {
    return `${referenceId}:${objectId}`
  }

  popMissedReferenceStructsForObjects(objects) {
    if(!objects || objects.length == 0) {
      return [];
    }

    let results = [];
    let toDelete = [];
    let uuids = objects.map((item) => item.uuid);
    let genericUuidLength = uuids[0].length;

    let keys = Object.keys(this.missedReferences);
    for(let candidateKey of keys) {
      /*
      We used to do string.split to get at the UUID, but surprisingly,
      the performance of this was about 20x worse then just getting the substring.

      let matches = candidateKey.split(":")[0] == object.uuid;
      */
      let matches = uuids.includes(candidateKey.substring(0, genericUuidLength));
      if(matches) {
        results.push(this.missedReferences[candidateKey]);
        toDelete.push(candidateKey);
      }
    }

    // remove from hash
    for(let key of toDelete) {
      delete this.missedReferences[key];
    }

    return results;
  }

  resolveReferencesForItem(item, markReferencesDirty = false) {

    if(item.errorDecrypting) {
      return;
    }

    // console.log("resolveReferencesForItem", item, "references", item.contentObject.references);

    let contentObject = item.contentObject;

    // If another client removes an item's references, this client won't pick up the removal unless
    // we remove everything not present in the current list of references
    item.updateLocalRelationships();

    if(!contentObject.references) {
      return;
    }

    let references = contentObject.references.slice(); // make copy, references will be modified in array

    let referencesIds = references.map((ref) => {return ref.uuid});
    let includeBlanks = true;
    let referencesObjectResults = this.findItems(referencesIds, includeBlanks);

    for(let [index, referencedItem] of referencesObjectResults.entries()) {
      if(referencedItem) {
        item.addItemAsRelationship(referencedItem);
        if(markReferencesDirty) {
          referencedItem.setDirty(true);
        }
      } else {
        let missingRefId = referencesIds[index];
        // Allows mapper to check when missing reference makes it through the loop,
        // and then runs resolveReferencesForItem again for the original item.
        let mappingKey = this.missedReferenceBuildKey(missingRefId, item.uuid);
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
      let allRelevantItems = observer.types.includes("*") ? models : models.filter((item) => {return observer.types.includes(item.content_type)});
      let validItems = [], deletedItems = [];
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
    let itemClass = SFModelManager.ContentTypeClassMapping && SFModelManager.ContentTypeClassMapping[json_obj.content_type];
    if(!itemClass) {
      itemClass = SFItem;
    }
    let item = new itemClass(json_obj);

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
    let dup = this.createItem(itemResponse, true);
    return dup;
  }

  addConflictedItem(dup, original) {
    this.addItem(dup);
    // the duplicate should inherit the original's relationships
    for(let referencingObject of original.referencingObjects) {
      referencingObject.addItemAsRelationship(dup);
      referencingObject.setDirty(true);
    }
    this.resolveReferencesForItem(dup);
    dup.conflict_of = original.uuid;
    dup.setDirty(true);
  }

  duplicateItem(item) {
    let copy = new item.constructor({content: item.content});
    copy.created_at = item.created_at;
    copy.content_type = item.content_type;

    this.addItem(copy);

    // the duplicate should inherit the original's relationships
    for(let referencingObject of item.referencingObjects) {
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
    for(let item of items) {
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
    for(let reference of item.content.references) {
      let relationship = this.findItem(reference.uuid);
      if(relationship) {
        item.removeItemAsRelationship(relationship);
        if(relationship.hasRelationshipWithItem(item)) {
          relationship.removeItemAsRelationship(item);
          relationship.setDirty(true);
        }
      }
    }

    // Handle indirect relationships
    for(let object of item.referencingObjects) {
      object.removeItemAsRelationship(item);
      object.setDirty(true);
    }

    item.referencingObjects = [];
  }

  /* Used when changing encryption key */
  setAllItemsDirty(dontUpdateClientDates = true) {
    let relevantItems = this.allItems;

    for(let item of relevantItems) {
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
    let results = [];
    for(let id of ids) {
      let item = this.itemsHash[id];
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
    let results = items.filter((item) => {
      for(let predicate of predicates)  {
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
    let itemsToBeMapped = [];
    for(let itemData of externalItems) {
      let existing = this.findItem(itemData.uuid);
      if(existing && !existing.errorDecrypting) {
        // if the item already exists, check to see if it's different from the import data.
        // If it's the same, do nothing, otherwise, create a copy.
        itemData.uuid = null;
        let dup = this.createConflictedItem(itemData);
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

    let items = this.mapResponseItemsToLocalModels(itemsToBeMapped, SFModelManager.MappingSourceFileImport);
    for(let item of items) {
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
      let itemParams = new SFItemParams(item, keys, authParams);
      return itemParams.paramsForExportFile();
    })).then((items) => {
      if(returnNullIfEmpty && items.length == 0) {
        return null;
      }

      let data = {items: items}

      if(keys) {
        // auth params are only needed when encrypted with a standard file key
        data["auth_params"] = authParams;
      }

      return JSON.stringify(data, null, 2 /* pretty print */);
    })
  }
}
;export class SFPrivilegesManager {

  constructor(modelManager, syncManager, singletonManager) {
    this.modelManager = modelManager;
    this.syncManager = syncManager;
    this.singletonManager = singletonManager;

    this.loadPrivileges();

    SFPrivilegesManager.CredentialAccountPassword = "CredentialAccountPassword";
    SFPrivilegesManager.CredentialLocalPasscode = "CredentialLocalPasscode";

    SFPrivilegesManager.ActionManageExtensions = "ActionManageExtensions";
    SFPrivilegesManager.ActionManageBackups = "ActionManageBackups";
    SFPrivilegesManager.ActionViewProtectedNotes = "ActionViewProtectedNotes";
    SFPrivilegesManager.ActionManagePrivileges = "ActionManagePrivileges";
    SFPrivilegesManager.ActionManagePasscode = "ActionManagePasscode";
    SFPrivilegesManager.ActionDeleteNote = "ActionDeleteNote";

    SFPrivilegesManager.SessionExpiresAtKey = "SessionExpiresAtKey";
    SFPrivilegesManager.SessionLengthKey = "SessionLengthKey";

    SFPrivilegesManager.SessionLengthNone = 0;
    SFPrivilegesManager.SessionLengthFiveMinutes = 300;
    SFPrivilegesManager.SessionLengthOneHour = 3600;
    SFPrivilegesManager.SessionLengthOneWeek = 604800;

    this.availableActions = [
      SFPrivilegesManager.ActionViewProtectedNotes,
      SFPrivilegesManager.ActionDeleteNote,
      SFPrivilegesManager.ActionManagePasscode,
      SFPrivilegesManager.ActionManageBackups,
      SFPrivilegesManager.ActionManageExtensions,
      SFPrivilegesManager.ActionManagePrivileges,
    ]

    this.availableCredentials = [
      SFPrivilegesManager.CredentialAccountPassword,
      SFPrivilegesManager.CredentialLocalPasscode
    ];

    this.sessionLengths = [
      SFPrivilegesManager.SessionLengthNone,
      SFPrivilegesManager.SessionLengthFiveMinutes,
      SFPrivilegesManager.SessionLengthOneHour,
      SFPrivilegesManager.SessionLengthOneWeek,
      SFPrivilegesManager.SessionLengthIndefinite
    ]
  }

  /*
  async delegate.isOffline()
  async delegate.hasLocalPasscode()
  async delegate.saveToStorage(key, value)
  async delegate.getFromStorage(key)
  async delegate.verifyAccountPassword
  async delegate.verifyLocalPasscode
  */
  setDelegate(delegate) {
    this.delegate = delegate;
  }

  getAvailableActions() {
    return this.availableActions;
  }

  getAvailableCredentials() {
    return this.availableCredentials;
  }

  async netCredentialsForAction(action) {
    let credentials = (await this.getPrivileges()).getCredentialsForAction(action);
    let netCredentials = [];

    for(var cred of credentials) {
      if(cred == SFPrivilegesManager.CredentialAccountPassword) {
        let isOffline = await this.delegate.isOffline();
        if(!isOffline) {
          netCredentials.push(cred);
        }
      } else if(cred == SFPrivilegesManager.CredentialLocalPasscode) {
        let hasLocalPasscode = await this.delegate.hasLocalPasscode();
        if(hasLocalPasscode) {
          netCredentials.push(cred);
        }
      }
    }

    return netCredentials;
  }

  async loadPrivileges() {
    if(this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      let privsContentType = SFPrivileges.contentType();
      let contentTypePredicate = new SFPredicate("content_type", "=", privsContentType);
      this.singletonManager.registerSingleton([contentTypePredicate], (resolvedSingleton) => {
        this.privileges = resolvedSingleton;
        if(!this.privileges.content.desktopPrivileges) {
          this.privileges.content.desktopPrivileges = {};
        }
        resolve(resolvedSingleton);
      }, async (valueCallback) => {
        // Safe to create. Create and return object.
        var privs = new SFPrivileges({content_type: privsContentType});
        if(!SFJS.crypto.generateUUIDSync) {
          // If syncrounous implementaiton of UUID generation is not available (i.e mobile),
          // we need to manually init uuid asyncronously
          await privs.initUUID();
        }
        this.modelManager.addItem(privs);
        privs.setDirty(true);
        this.syncManager.sync();
        valueCallback(privs);
        resolve(privs);
      });
    });

    return this.loadPromise;
  }

  async getPrivileges() {
    if(this.privileges) {
      return this.privileges;
    } else {
      return this.loadPrivileges();
    }
  }

  displayInfoForCredential(credential) {
    let metadata = {}

    metadata[SFPrivilegesManager.CredentialAccountPassword] = {
      label: "Account Password",
      prompt: "Please enter your account password."
    }

    metadata[SFPrivilegesManager.CredentialLocalPasscode] = {
      label: "Local Passcode",
      prompt: "Please enter your local passcode."
    }

    return metadata[credential];
  }

  displayInfoForAction(action) {
    let metadata = {};

    metadata[SFPrivilegesManager.ActionManageExtensions] = {
      label: "Manage Extensions"
    };

    metadata[SFPrivilegesManager.ActionManageBackups] = {
      label: "Download/Import Backups"
    };

    metadata[SFPrivilegesManager.ActionViewProtectedNotes] = {
      label: "View Protected Notes"
    };

    metadata[SFPrivilegesManager.ActionManagePrivileges] = {
      label: "Manage Privileges"
    };

    metadata[SFPrivilegesManager.ActionManagePasscode] = {
      label: "Manage Passcode"
    }

    metadata[SFPrivilegesManager.ActionDeleteNote] = {
      label: "Delete Notes"
    }

    return metadata[action];
  }

  getSessionLengthOptions() {
    return [
      {
        value: SFPrivilegesManager.SessionLengthNone,
        label: "Don't Remember"
      },
      {
        value: SFPrivilegesManager.SessionLengthFiveMinutes,
        label: "5 Minutes"
      },
      {
        value: SFPrivilegesManager.SessionLengthOneHour,
        label: "1 Hour"
      },
      {
        value: SFPrivilegesManager.SessionLengthOneWeek,
        label: "1 Week"
      }
    ]
  }

  async setSessionLength(length) {
    let addToNow = (seconds) => {
      let date = new Date();
      date.setSeconds(date.getSeconds() + seconds);
      return date;
    }

    let expiresAt = addToNow(length);

    return Promise.all([
      this.delegate.saveToStorage(SFPrivilegesManager.SessionExpiresAtKey, JSON.stringify(expiresAt)),
      this.delegate.saveToStorage(SFPrivilegesManager.SessionLengthKey, JSON.stringify(length))
    ])
  }

  async clearSession() {
    return this.setSessionLength(SFPrivilegesManager.SessionLengthNone);
  }

  async getSelectedSessionLength() {
    let length = await this.delegate.getFromStorage(SFPrivilegesManager.SessionLengthKey);
    if(length) {
      return JSON.parse(length);
    } else {
      return SFPrivilegesManager.SessionLengthNone;
    }
  }

  async getSessionExpirey() {
    let expiresAt = await this.delegate.getFromStorage(SFPrivilegesManager.SessionExpiresAtKey);
    if(expiresAt) {
      return new Date(JSON.parse(expiresAt));
    } else {
      return new Date();
    }
  }

  async actionHasPrivilegesConfigured(action) {
    return (await this.netCredentialsForAction(action)).length > 0;
  }

  async actionRequiresPrivilege(action) {
    let expiresAt = await this.getSessionExpirey();
    if(expiresAt > new Date()) {
      return false;
    }
    let netCredentials = await this.netCredentialsForAction(action);
    return netCredentials.length > 0;
  }

  async savePrivileges() {
    let privs = await this.getPrivileges();
    privs.setDirty(true);
    this.syncManager.sync();
  }

  async authenticateAction(action, credentialAuthMapping) {
    var requiredCredentials = (await this.netCredentialsForAction(action));
    var successfulCredentials = [], failedCredentials = [];

    for(let requiredCredential of requiredCredentials) {
      var passesAuth = await this._verifyAuthenticationParameters(requiredCredential, credentialAuthMapping[requiredCredential]);
      if(passesAuth) {
        successfulCredentials.push(requiredCredential);
      } else {
        failedCredentials.push(requiredCredential);
      }
    }

    return {
      success: failedCredentials.length == 0,
      successfulCredentials: successfulCredentials,
      failedCredentials: failedCredentials
    }
  }

  async _verifyAuthenticationParameters(credential, value) {

    let verifyAccountPassword = async (password) => {
      return this.delegate.verifyAccountPassword(password);
    }

    let verifyLocalPasscode = async (passcode) => {
      return this.delegate.verifyLocalPasscode(passcode);
    }

    if(credential == SFPrivilegesManager.CredentialAccountPassword) {
      return verifyAccountPassword(value);
    } else if(credential == SFPrivilegesManager.CredentialLocalPasscode) {
      return verifyLocalPasscode(value);
    }
  }
}
;const SessionHistoryPersistKey = "sessionHistory_persist";
const SessionHistoryRevisionsKey = "sessionHistory_revisions";
const SessionHistoryAutoOptimizeKey = "sessionHistory_autoOptimize";

export class SFSessionHistoryManager {

  constructor(modelManager, storageManager, keyRequestHandler, contentTypes, timeout) {
    this.modelManager = modelManager;
    this.storageManager = storageManager;
    this.$timeout = timeout || setTimeout.bind(window);

    // Required to persist the encrypted form of SFHistorySession
    this.keyRequestHandler = keyRequestHandler;

    this.loadFromDisk().then(() => {
      this.modelManager.addItemSyncObserver("session-history", contentTypes, (allItems, validItems, deletedItems, source, sourceKey) => {
        for(let item of allItems) {
          try {
            this.addHistoryEntryForItem(item);
          } catch (e) {
            console.log("Caught exception while trying to add item history entry", e);
          }
        }
      });
    })
  }

  async encryptionParams() {
    // Should return a dictionary: {offline, keys, auth_params}
    return this.keyRequestHandler();
  }

  addHistoryEntryForItem(item) {
    var persistableItemParams = {
      uuid: item.uuid,
      content_type: item.content_type,
      updated_at: item.updated_at,
      content: item.content
    }

    let entry = this.historySession.addEntryForItem(persistableItemParams);

    if(this.autoOptimize) {
      this.historySession.optimizeHistoryForItem(item);
    }

    if(entry && this.diskEnabled) {
      // Debounce, clear existing timeout
      if(this.diskTimeout) {
        if(this.$timeout.hasOwnProperty("cancel")) {
          this.$timeout.cancel(this.diskTimeout);
        } else {
          clearTimeout(this.diskTimeout);
        }
      };
      this.diskTimeout = this.$timeout(() => {
        this.saveToDisk();
      }, 2000)
    }
  }

  historyForItem(item) {
    return this.historySession.historyForItem(item);
  }

  async clearHistoryForItem(item) {
    this.historySession.clearItemHistory(item);
    return this.saveToDisk();
  }

  async clearAllHistory() {
    this.historySession.clearAllHistory();
    return this.storageManager.removeItem(SessionHistoryRevisionsKey);
  }

  async toggleDiskSaving() {
    this.diskEnabled = !this.diskEnabled;

    if(this.diskEnabled) {
      this.storageManager.setItem(SessionHistoryPersistKey, JSON.stringify(true));
      this.saveToDisk();
    } else {
      this.storageManager.setItem(SessionHistoryPersistKey, JSON.stringify(false));
      return this.storageManager.removeItem(SessionHistoryRevisionsKey);
    }
  }

  async saveToDisk() {
    if(!this.diskEnabled) {
      return;
    }

    let encryptionParams = await this.encryptionParams();

    var itemParams = new SFItemParams(this.historySession, encryptionParams.keys, encryptionParams.auth_params);
    itemParams.paramsForSync().then((syncParams) => {
      // console.log("Saving to disk", syncParams);
      this.storageManager.setItem(SessionHistoryRevisionsKey, JSON.stringify(syncParams));
    })
  }

  async loadFromDisk() {
    var diskValue = await this.storageManager.getItem(SessionHistoryPersistKey);
    if(diskValue) {
      this.diskEnabled = JSON.parse(diskValue);
    }

    var historyValue = await this.storageManager.getItem(SessionHistoryRevisionsKey);
    if(historyValue) {
      historyValue = JSON.parse(historyValue);
      let encryptionParams = await this.encryptionParams();
      await SFJS.itemTransformer.decryptItem(historyValue, encryptionParams.keys);
      var historySession = new SFHistorySession(historyValue);
      this.historySession = historySession;
    } else {
      this.historySession = new SFHistorySession();
    }

    var autoOptimizeValue = await this.storageManager.getItem(SessionHistoryAutoOptimizeKey);
    if(autoOptimizeValue) {
      this.autoOptimize = JSON.parse(autoOptimizeValue);
    } else {
      // default value is true
      this.autoOptimize = true;
    }
  }

  async toggleAutoOptimize() {
    this.autoOptimize = !this.autoOptimize;

    if(this.autoOptimize) {
      this.storageManager.setItem(SessionHistoryAutoOptimizeKey, JSON.stringify(true));
    } else {
      this.storageManager.setItem(SessionHistoryAutoOptimizeKey, JSON.stringify(false));
    }
  }
}
;/*
  The SingletonManager allows controllers to register an item as a singleton, which means only one instance of that model
  should exist, both on the server and on the client. When the SingletonManager detects multiple items matching the singleton predicate,
  the oldest ones will be deleted, leaving the newest ones. (See 4/28/18 update. We now choose the earliest created one as the winner.).

  (This no longer fully applies, See 4/28/18 update.) We will treat the model most recently arrived from the server as the most recent one. The reason for this is,
  if you're offline, a singleton can be created, as in the case of UserPreferneces. Then when you sign in, you'll retrieve your actual user preferences.
  In that case, even though the offline singleton has a more recent updated_at, the server retreived value is the one we care more about.

  4/28/18: I'm seeing this issue: if you have the app open in one window, then in another window sign in, and during sign in,
  click Refresh (or autorefresh occurs) in the original signed in window, then you will happen to receive from the server the newly created
  Extensions singleton, and it will be mistaken (it just looks like a regular retrieved item, since nothing is in saved) for a fresh, latest copy, and replace the current instance.
  This has happened to me and many users.
  A puzzling issue, but what if instead of resolving singletons by choosing the one most recently modified, we choose the one with the earliest create date?
  This way, we don't care when it was modified, but we always, always choose the item that was created first. This way, we always deal with the same item.
*/

export class SFSingletonManager {

  constructor(modelManager, syncManager) {
    this.syncManager = syncManager;
    this.modelManager = modelManager;
    this.singletonHandlers = [];

    syncManager.addEventHandler((syncEvent, data) => {
      if(syncEvent == "local-data-loaded") {
        this.resolveSingletons(modelManager.allItems, null, true);
        this.initialDataLoaded = true;
      } else if(syncEvent == "sync:completed") {
        // Wait for initial data load before handling any sync. If we don't want for initial data load,
        // then the singleton resolver won't have the proper items to work with to determine whether to resolve or create.
        if(!this.initialDataLoaded) {
          return;
        }
        // The reason we also need to consider savedItems in consolidating singletons is in case of sync conflicts,
        // a new item can be created, but is never processed through "retrievedItems" since it is only created locally then saved.

        // HOWEVER, by considering savedItems, we are now ruining everything, especially during sign in. A singleton can be created
        // offline, and upon sign in, will sync all items to the server, and by combining retrievedItems & savedItems, and only choosing
        // the latest, you are now resolving to the most recent one, which is in the savedItems list and not retrieved items, defeating
        // the whole purpose of this thing.

        // Updated solution: resolveSingletons will now evaluate both of these arrays separately.
        this.resolveSingletons(data.retrievedItems, data.savedItems);
      }
    });

    /*
      If an item alternates its uuid on registration, singletonHandlers might need to update
      their local reference to the object, since the object reference will change on uuid alternation
    */
    modelManager.addModelUuidChangeObserver("singleton-manager", (oldModel, newModel) => {
      for(var handler of this.singletonHandlers) {
        if(handler.singleton && SFPredicate.ItemSatisfiesPredicates(newModel, handler.predicates)) {
          // Reference is now invalid, calling resolveSingleton should update it
          handler.singleton = null;
          this.resolveSingletons([newModel]);
        }
      }
    })
  }

  registerSingleton(predicates, resolveCallback, createBlock) {
    /*
    predicate: a key/value pair that specifies properties that should match in order for an item to be considered a predicate
    resolveCallback: called when one or more items are deleted and a new item becomes the reigning singleton
    createBlock: called when a sync is complete and no items are found. The createBlock should create the item and return it.
    */
    this.singletonHandlers.push({
      predicates: predicates,
      resolutionCallback: resolveCallback,
      createBlock: createBlock
    });
  }

  resolveSingletons(retrievedItems, savedItems, initialLoad) {
    retrievedItems = retrievedItems || [];
    savedItems = savedItems || [];

    for(let singletonHandler of this.singletonHandlers) {
      var predicates = singletonHandler.predicates;
      let retrievedSingletonItems = this.modelManager.filterItemsWithPredicates(retrievedItems, predicates);

      // We only want to consider saved items count to see if it's more than 0, and do nothing else with it.
      // This way we know there was some action and things need to be resolved. The saved items will come up
      // in filterItemsWithPredicate(this.modelManager.allItems) and be deleted anyway
      let savedSingletonItemsCount = this.modelManager.filterItemsWithPredicates(savedItems, predicates).length;

      if(retrievedSingletonItems.length > 0 || savedSingletonItemsCount > 0) {
        /*
          Check local inventory and make sure only 1 similar item exists. If more than 1, delete newest
          Note that this local inventory will also contain whatever is in retrievedItems.
        */
        var allExtantItemsMatchingPredicate = this.modelManager.itemsMatchingPredicates(predicates);

        /*
          Delete all but the earliest created
        */
        if(allExtantItemsMatchingPredicate.length >= 2) {
          let sorted = allExtantItemsMatchingPredicate.sort((a, b) => {
            /*
              If compareFunction(a, b) is less than 0, sort a to an index lower than b, i.e. a comes first.
              If compareFunction(a, b) is greater than 0, sort b to an index lower than a, i.e. b comes first.
            */
            return a.created_at < b.created_at ? -1 : 1;
          });

          // The item that will be chosen to be kept
          let winningItem = sorted[0];

          // Items that will be deleted
          // Delete everything but the first one
          let toDelete = sorted.slice(1, sorted.length);

          for(var d of toDelete) {
            this.modelManager.setItemToBeDeleted(d);
          }

          this.syncManager.sync();

          // Send remaining item to callback
          singletonHandler.singleton = winningItem;
          singletonHandler.resolutionCallback && singletonHandler.resolutionCallback(winningItem);

        } else if(allExtantItemsMatchingPredicate.length == 1) {
          if(!singletonHandler.singleton || singletonHandler.singleton !== singleton) {
            // Not yet notified interested parties of object
            var singleton = allExtantItemsMatchingPredicate[0];
            singletonHandler.singleton = singleton;
            singletonHandler.resolutionCallback && singletonHandler.resolutionCallback(singleton);
          }
        }
      } else {
        // Retrieved items does not include any items of interest. If we don't have a singleton registered to this handler,
        // we need to create one. Only do this on actual sync completetions and not on initial data load. Because we want
        // to get the latest from the server before making the decision to create a new item
        if(!singletonHandler.singleton && !initialLoad && !singletonHandler.pendingCreateBlockCallback) {
          if(singletonHandler.createBlock) {
            singletonHandler.pendingCreateBlockCallback = true;
            singletonHandler.createBlock((created) => {
              singletonHandler.singleton = created;
              singletonHandler.pendingCreateBlockCallback = false;
              singletonHandler.resolutionCallback && singletonHandler.resolutionCallback(created);
            });
          }
        }
      }
    }
  }
}
;// SFStorageManager should be subclassed, and all the methods below overwritten.

export class SFStorageManager {

  /* Simple Key/Value Storage */

  async setItem(key, value) {

  }

  async getItem(key) {

  }

  async removeItem(key) {

  }

  async clear() {
    // clear only simple key/values
  }

  /*
  Model Storage
  */

  async getAllModels() {

  }

  async saveModel(item) {
    return this.saveModels([item]);
  }

  async saveModels(items) {

  }

  async deleteModel(item) {

  }

  async clearAllModels() {
    // clear only models
  }

  /* General */

  async clearAllData() {
    return Promise.all([
      this.clear(),
      this.clearAllModels()
    ])
  }
}
;export class SFSyncManager {

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
    let originalItems = this.modelManager.allItems.filter((item) => {return !item.errorDecrypting}).slice();

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

    let allItems = this.modelManager.allItems;
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
    return new Promise(async (resolve, reject) => {

      if(this.syncLocked) {
        console.log("Sync Locked, Returning;");
        resolve();
        return;
      }

      if(!options) options = {};

      let allDirtyItems = this.modelManager.getDirtyItems();

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

      let isContinuationSync = this.syncStatus.needsMoreSync;

      this.syncStatus.syncOpInProgress = true;
      this.syncStatus.syncStart = new Date();
      this.beginCheckingIfSyncIsTakingTooLong();

      let submitLimit = 100;
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
      params.limit = 150;

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
    // Check to make sure any subItem hasn't been marked as dirty again while a sync was ongoing
    let itemsToClearAsDirty = [];
    for(let item of syncedItems) {
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

    // Create copies of items or alternate their uuids if neccessary
    let unsaved = response.unsaved;
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
    let erroredItems = this.modelManager.allItems.filter((item) => {return item.errorDecrypting == true});
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
        // We want a new uuid for the new item. Note that this won't neccessarily adjust references.
        itemResponse.uuid = await SFJS.crypto.generateUUID();

        let dup = this.modelManager.createConflictedItem(itemResponse);
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
      let params = {
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
          let keys = (await this.getActiveKeyInfo(SFSyncManager.KeyRequestLoadSaveAccount)).keys;
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
;var dateFormatter;

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

    if(typeof this.content === 'object' && !this.content.references) {
      this.content.references = [];
    }
  }

  // On some platforms, syncrounous uuid generation is not available.
  // Those platforms (mobile) must call this function manually.
  async initUUID() {
    if(!this.uuid) {
      this.uuid = await SFJS.crypto.generateUUID();
    }
  }

  get contentObject() {

    if(this.errorDecrypting) {
      return this.content;
    }

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

    if(json.errorDecrypting) {
      this.content = json.content;
    } else {
      try {
        let parsedContent = typeof json.content === 'string' ? JSON.parse(json.content) : json.content;
        SFItem.deepMerge(this.contentObject, parsedContent);
      } catch (e) {
        console.log("Error while updating item from json", e);
      }
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
;export class SFItemParams {

  constructor(item, keys, auth_params) {
    this.item = item;
    this.keys = keys;
    this.auth_params = auth_params;

    if(this.keys && !this.auth_params) {
      throw "SFItemParams.auth_params must be supplied if supplying keys.";
    }

    if(this.auth_params && !this.auth_params.version) {
      throw "SFItemParams.auth_params is missing version";
    }
  }

  async paramsForExportFile(includeDeleted) {
    this.additionalFields = ["updated_at"];
    this.forExportFile = true;
    if(includeDeleted) {
      return this.__params();
    } else {
      var result = await this.__params();
      return _.omit(result, ["deleted"]);
    }
  }

  async paramsForExtension() {
    return this.paramsForExportFile();
  }

  async paramsForLocalStorage() {
    this.additionalFields = ["updated_at", "dirty", "errorDecrypting"];
    this.forExportFile = true;
    return this.__params();
  }

  async paramsForSync() {
    return this.__params();
  }

  async __params() {

    var params = {uuid: this.item.uuid, content_type: this.item.content_type, deleted: this.item.deleted, created_at: this.item.created_at};
    if(!this.item.errorDecrypting) {
      // Items should always be encrypted for export files. Only respect item.doNotEncrypt for remote sync params.
      var doNotEncrypt = this.item.doNotEncrypt() && !this.forExportFile;
      if(this.keys && !doNotEncrypt) {
        var encryptedParams = await SFJS.itemTransformer.encryptItem(this.item, this.keys, this.auth_params);
        _.merge(params, encryptedParams);

        if(this.auth_params.version !== "001") {
          params.auth_hash = null;
        }
      }
      else {
        params.content = this.forExportFile ? this.item.createContentJSONFromProperties() : "000" + await SFJS.crypto.base64(JSON.stringify(this.item.createContentJSONFromProperties()));
        if(!this.forExportFile) {
          params.enc_item_key = null;
          params.auth_hash = null;
        }
      }
    } else {
      // Error decrypting, keep "content" and related fields as is (and do not try to encrypt, otherwise that would be undefined behavior)
      params.content = this.item.content;
      params.enc_item_key = this.item.enc_item_key;
      params.auth_hash = this.item.auth_hash;
    }

    if(this.additionalFields) {
      _.merge(params, _.pick(this.item, this.additionalFields));
    }

    return params;
  }


}
;export class SFPredicate {


  constructor(keypath, operator, value) {
    this.keypath = keypath;
    this.operator = operator;
    this.value = value;

    // Preprocessing to make predicate evaluation faster.
    // Won't recurse forever, but with arbitrarily large input could get stuck. Hope there are input size limits
    // somewhere else.
    if(SFPredicate.IsRecursiveOperator(this.operator)) {
      this.value = this.value.map(SFPredicate.fromArray);
    }
  }

  static fromArray(array) {
    return new SFPredicate(array[0],array[1],array[2]);
  }

  static ObjectSatisfiesPredicate(object, predicate) {
    // Predicates may not always be created using the official constructor
    // so if it's still an array here, convert to object
    if(Array.isArray(predicate)) {
      predicate = this.fromArray(predicate);
    }

    if(SFPredicate.IsRecursiveOperator(predicate.operator)) {
      if(predicate.operator === "and") {
        for(var subPredicate of predicate.value) {
          if (!this.ObjectSatisfiesPredicate(object, subPredicate)) {
            return false;
          }
        }
        return true;
      }
      if(predicate.operator === "or") {
        for(var subPredicate of predicate.value) {
          if (this.ObjectSatisfiesPredicate(object, subPredicate)) {
            return true;
          }
        }
        return false;
      }
    }

    var predicateValue = predicate.value;
    if(typeof(predicateValue) == 'string' && predicateValue.includes(".ago")) {
      predicateValue = this.DateFromString(predicateValue);
    }


    var valueAtKeyPath = predicate.keypath.split('.').reduce((previous, current) => {
      return previous && previous[current]
    }, object);

    const falseyValues = [false, "", null, undefined, NaN];

    if(valueAtKeyPath == undefined) {
      return falseyValues.includes(predicate.value);
    }

    if(predicate.operator == "=") {
      // Use array comparison
      if(Array.isArray(valueAtKeyPath)) {
        return JSON.stringify(valueAtKeyPath) == JSON.stringify(predicateValue);
      } else {
        return valueAtKeyPath == predicateValue;
      }
    } else if(predicate.operator == "<")  {
      return valueAtKeyPath < predicateValue;
    } else if(predicate.operator == ">")  {
      return valueAtKeyPath > predicateValue;
    } else if(predicate.operator == "<=")  {
      return valueAtKeyPath <= predicateValue;
    } else if(predicate.operator == ">=")  {
      return valueAtKeyPath >= predicateValue;
    } else if(predicate.operator == "startsWith")  {
      return valueAtKeyPath.startsWith(predicateValue);
    } else if(predicate.operator == "in") {
      return predicateValue.indexOf(valueAtKeyPath) != -1;
    } else if(predicate.operator == "includes") {
      return this.resolveIncludesPredicate(valueAtKeyPath, predicateValue);
    } else if(predicate.operator == "matches") {
      var regex = new RegExp(predicateValue);
      return regex.test(valueAtKeyPath);
    }

    return false;
  }

  static resolveIncludesPredicate(valueAtKeyPath, predicateValue) {
    // includes can be a string  or a predicate (in array form)
    if(typeof(predicateValue) == 'string') {
      // if string, simply check if the valueAtKeyPath includes the predicate value
      return valueAtKeyPath.includes(predicateValue);
    } else {
      // is a predicate array or predicate object
      var innerPredicate;
      if(Array.isArray(predicateValue)) {
        innerPredicate = SFPredicate.fromArray(predicateValue);
      } else {
        innerPredicate = predicateValue;
      }
      for(var obj of valueAtKeyPath) {
        if(this.ObjectSatisfiesPredicate(obj, innerPredicate)) {
          return true;
        }
      }
      return false;
    }
  }

  static ItemSatisfiesPredicate(item, predicate) {
    if(Array.isArray(predicate)) {
      predicate = SFPredicate.fromArray(predicate);
    }
    return this.ObjectSatisfiesPredicate(item, predicate);
  }

  static ItemSatisfiesPredicates(item, predicates) {
    for(var predicate of predicates) {
      if(!this.ItemSatisfiesPredicate(item, predicate)) {
        return false;
      }
    }
    return true;
  }

  static DateFromString(string) {
    // x.days.ago, x.hours.ago
    var comps = string.split(".");
    var unit = comps[1];
    var date = new Date;
    var offset = parseInt(comps[0]);
    if(unit == "days") {
      date.setDate(date.getDate() - offset);
    } else if(unit == "hours") {
      date.setHours(date.getHours() - offset);
    }
    return date;
  }

  static IsRecursiveOperator(operator) {
    return ["and", "or"].includes(operator);
  }
}
;export class SFPrivileges extends SFItem {

  static contentType() {
    // It has prefix SN since it was originally imported from SN codebase
    return "SN|Privileges";
  }

  setCredentialsForAction(action, credentials) {
    this.content.desktopPrivileges[action] = credentials;
  }

  getCredentialsForAction(action) {
    return this.content.desktopPrivileges[action] || [];
  }

  toggleCredentialForAction(action, credential) {
    if(this.isCredentialRequiredForAction(action, credential)) {
      this.removeCredentialForAction(action, credential);
    } else {
      this.addCredentialForAction(action, credential);
    }
  }

  removeCredentialForAction(action, credential) {
    _.pull(this.content.desktopPrivileges[action], credential);
  }

  addCredentialForAction(action, credential) {
    var credentials = this.getCredentialsForAction(action);
    credentials.push(credential);
    this.setCredentialsForAction(action, credentials);
  }

  isCredentialRequiredForAction(action, credential) {
    var credentialsRequired = this.getCredentialsForAction(action);
    return credentialsRequired.includes(credential);
  }

}
;/*
  Important: This is the only object in the session history domain that is persistable.

  A history session contains one main content object:
  the itemUUIDToItemHistoryMapping. This is a dictionary whose keys are item uuids,
  and each value is an SFItemHistory object.

  Each SFItemHistory object contains an array called `entires` which contain `SFItemHistory` entries (or subclasses, if the
  `SFItemHistory.HistoryEntryClassMapping` class property value is set.)
 */

// See default class values at bottom of this file, including `SFHistorySession.LargeItemEntryAmountThreshold`.

export class SFHistorySession extends SFItem {
  constructor(json_obj) {

    super(json_obj);

    /*
      Our .content params:
      {
        itemUUIDToItemHistoryMapping
      }
     */

    if(!this.content.itemUUIDToItemHistoryMapping) {
      this.content.itemUUIDToItemHistoryMapping = {};
    }

    // When initializing from a json_obj, we want to deserialize the item history JSON into SFItemHistory objects.
    var uuids = Object.keys(this.content.itemUUIDToItemHistoryMapping);
    uuids.forEach((itemUUID) => {
      var itemHistory = this.content.itemUUIDToItemHistoryMapping[itemUUID];
      this.content.itemUUIDToItemHistoryMapping[itemUUID] = new SFItemHistory(itemHistory);
    });
  }

  addEntryForItem(item) {
    var itemHistory = this.historyForItem(item);
    var entry = itemHistory.addHistoryEntryForItem(item);
    return entry;
  }

  historyForItem(item) {
    var history = this.content.itemUUIDToItemHistoryMapping[item.uuid];
    if(!history) {
      history = this.content.itemUUIDToItemHistoryMapping[item.uuid] = new SFItemHistory();
    }
    return history;
  }

  clearItemHistory(item) {
    this.historyForItem(item).clear();
  }

  clearAllHistory() {
    this.content.itemUUIDToItemHistoryMapping = {};
  }

  optimizeHistoryForItem(item) {
    // Clean up if there are too many revisions. Note SFHistorySession.LargeItemEntryAmountThreshold is the amount of revisions which above, call
    // for an optimization. An optimization may not remove entries above this threshold. It will determine what it should keep and what it shouldn't.
    // So, it is possible to have a threshold of 60 but have 600 entries, if the item history deems those worth keeping.
    var itemHistory = this.historyForItem(item);
    if(itemHistory.entries.length > SFHistorySession.LargeItemEntryAmountThreshold) {
      itemHistory.optimize();
    }
  }
}

// See comment in `this.optimizeHistoryForItem`
SFHistorySession.LargeItemEntryAmountThreshold = 60;
;// See default class values at bottom of this file, including `SFItemHistory.LargeEntryDeltaThreshold`.

export class SFItemHistory {

  constructor(params = {}) {
    if(!this.entries) {
      this.entries = [];
    }

    // Deserialize the entries into entry objects.
    if(params.entries) {
      for(var entryParams of params.entries) {
        var entry = this.createEntryForItem(entryParams.item);
        entry.setPreviousEntry(this.getLastEntry());
        this.entries.push(entry);
      }
    }
  }

  createEntryForItem(item) {
    var historyItemClass = SFItemHistory.HistoryEntryClassMapping && SFItemHistory.HistoryEntryClassMapping[item.content_type];
    if(!historyItemClass) {
      historyItemClass = SFItemHistoryEntry;
    }
    var entry = new historyItemClass(item);
    return entry;
  }

  getLastEntry() {
    return this.entries[this.entries.length - 1]
  }

  addHistoryEntryForItem(item) {
    var prospectiveEntry = this.createEntryForItem(item);

    var previousEntry = this.getLastEntry();
    prospectiveEntry.setPreviousEntry(previousEntry);

    // Don't add first revision if text length is 0, as this means it's a new note.
    // Actually, nevermind. If we do this, the first character added to a new note
    // will be displayed as "1 characters loaded".
    // if(!previousRevision && prospectiveRevision.textCharDiffLength == 0) {
    //   return;
    // }

    // Don't add if text is the same
    if(prospectiveEntry.isSameAsEntry(previousEntry)) {
      return;
    }

    this.entries.push(prospectiveEntry);
    return prospectiveEntry;
  }

  clear() {
    this.entries.length = 0;
  }

  optimize() {
    var keepEntries = [];

    let isEntrySignificant = (entry) => {
      return entry.deltaSize() > SFItemHistory.LargeEntryDeltaThreshold;
    }

    let processEntry = (entry, index, keep) => {
      // Entries may be processed retrospectively, meaning it can be decided to be deleted, then an upcoming processing can change that.
      if(keep) {
        keepEntries.push(entry);
      } else {
        // Remove if in keep
        var index = keepEntries.indexOf(entry);
        if(index !== -1) {
          keepEntries.splice(index, 1);
        }
      }

      if(keep && isEntrySignificant(entry) && entry.operationVector() == -1) {
        // This is a large negative change. Hang on to the previous entry.
        var previousEntry = this.entries[index - 1];
        if(previousEntry) {
          keepEntries.push(previousEntry);
        }
      }
    }

    this.entries.forEach((entry, index) => {
      if(index == 0 || index == this.entries.length - 1) {
        // Keep the first and last
        processEntry(entry, index, true);
      } else {
        var significant = isEntrySignificant(entry);
        processEntry(entry, index, significant);
      }
    })

    this.entries = this.entries.filter((entry, index) => {
      return keepEntries.indexOf(entry) !== -1;
    })
  }
}

// The amount of characters added or removed that constitute a keepable entry after optimization.
SFItemHistory.LargeEntryDeltaThreshold = 15;
;export class SFItemHistoryEntry {

  constructor(item) {
    // Whatever values `item` has will be persisted, so be sure that the values are picked beforehand.
    this.item = SFItem.deepMerge({}, item);

    // We'll assume a `text` content value to diff on. If it doesn't exist, no problem.
    this.defaultContentKeyToDiffOn = "text";

    // Default value
    this.textCharDiffLength = 0;

    if(typeof this.item.updated_at == 'string') {
      this.item.updated_at = new Date(this.item.updated_at);
    }
  }

  setPreviousEntry(previousEntry) {
    this.hasPreviousEntry = previousEntry != null;

    // we'll try to compute the delta based on an assumed content property of `text`, if it exists.
    if(this.item.content[this.defaultContentKeyToDiffOn]) {
      if(previousEntry) {
        this.textCharDiffLength = this.item.content[this.defaultContentKeyToDiffOn].length - previousEntry.item.content[this.defaultContentKeyToDiffOn].length;
      } else {
        this.textCharDiffLength = this.item.content[this.defaultContentKeyToDiffOn].length;
      }
    }
  }

  operationVector() {
    // We'll try to use the value of `textCharDiffLength` to help determine this, if it's set
    if(this.textCharDiffLength != undefined) {
      if(!this.hasPreviousEntry || this.textCharDiffLength == 0) {
        return 0;
      } else if(this.textCharDiffLength < 0) {
        return -1;
      } else {
        return 1;
      }
    }

    // Otherwise use a default value of 1
    return 1;
  }

  deltaSize() {
    // Up to the subclass to determine how large the delta was, i.e number of characters changed.
    // But this general class won't be able to determine which property it should diff on, or even its format.

    // We can return the `textCharDiffLength` if it's set, otherwise, just return 1;
    if(this.textCharDiffLength != undefined) {
      return Math.abs(this.textCharDiffLength);
    }

    // Otherwise return 1 here to constitute a basic positive delta.
    // The value returned should always be positive. override `operationVector` to return the direction of the delta.
    return 1;
  }

  isSameAsEntry(entry) {
    if(!entry) {
      return false;
    }

    var lhs = new SFItem(this.item);
    var rhs = new SFItem(entry.item);
    return lhs.isItemContentEqualWith(rhs);
  }

}
;/* Abstract class. Instantiate an instance of either SFCryptoJS (uses cryptojs) or SFCryptoWeb (uses web crypto) */

var globalScope = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : null);

export class SFAbstractCrypto {

  constructor() {
    this.DefaultPBKDF2Length = 768;
  }

  /*
  Our WebCrypto implementation only offers PBKDf2, so any other encryption
  and key generation functions must use CryptoJS in this abstract implementation.
  */

  generateUUIDSync() {
    var crypto = globalScope.crypto || globalScope.msCrypto;
    if(crypto) {
      var buf = new Uint32Array(4);
      crypto.getRandomValues(buf);
      var idx = -1;
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          idx++;
          var r = (buf[idx>>3] >> ((idx%8)*4))&15;
          var v = c == 'x' ? r : (r&0x3|0x8);
          return v.toString(16);
      });
    } else {
      var d = new Date().getTime();
      if(globalScope.performance && typeof globalScope.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
      }
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
      });
      return uuid;
    }
  }

  async generateUUID()  {
    return this.generateUUIDSync();
  }

  async decryptText({ciphertextToAuth, contentCiphertext, encryptionKey, iv, authHash, authKey} = {}, requiresAuth) {
    if(requiresAuth && !authHash) {
      console.error("Auth hash is required.");
      return;
    }

    if(authHash) {
      var localAuthHash = await this.hmac256(ciphertextToAuth, authKey);
      if(authHash !== localAuthHash) {
        console.error("Auth hash does not match, returning null.");
        return null;
      }
    }
    
    var keyData = CryptoJS.enc.Hex.parse(encryptionKey);
    var ivData  = CryptoJS.enc.Hex.parse(iv || "");
    var decrypted = CryptoJS.AES.decrypt(contentCiphertext, keyData, { iv: ivData,  mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  async encryptText(text, key, iv) {
    var keyData = CryptoJS.enc.Hex.parse(key);
    var ivData  = CryptoJS.enc.Hex.parse(iv || "");
    var encrypted = CryptoJS.AES.encrypt(text, keyData, { iv: ivData,  mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.toString();
  }

  async generateRandomKey(bits) {
    return CryptoJS.lib.WordArray.random(bits/8).toString();
  }

  async generateItemEncryptionKey() {
    // Generates a key that will be split in half, each being 256 bits. So total length will need to be 512.
    let length = 512; let cost = 1;
    var salt = await this.generateRandomKey(length);
    var passphrase = await this.generateRandomKey(length);
    return this.pbkdf2(passphrase, salt, cost, length);
  }

  async firstHalfOfKey(key) {
    return key.substring(0, key.length/2);
  }

  async secondHalfOfKey(key) {
    return key.substring(key.length/2, key.length);
  }

  async base64(text) {
    return globalScope.btoa(encodeURIComponent(text).replace(/%([0-9A-F]{2})/g,
      function toSolidBytes(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
  }

  async base64Decode(base64String) {
    return globalScope.atob(base64String);
  }

  async sha256(text) {
    return CryptoJS.SHA256(text).toString();
  }

  async hmac256(message, key) {
    var keyData = CryptoJS.enc.Hex.parse(key);
    var messageData = CryptoJS.enc.Utf8.parse(message);
    var result = CryptoJS.HmacSHA256(messageData, keyData).toString();
    return result;
  }

  async generateSalt(identifier, version, cost, nonce) {
    var result = await this.sha256([identifier, "SF", version, cost, nonce].join(":"));
    return result;
  }

  /** Generates two deterministic keys based on one input */
  async generateSymmetricKeyPair({password, pw_salt, pw_cost} = {}) {
    var output = await this.pbkdf2(password, pw_salt, pw_cost, this.DefaultPBKDF2Length);
    var outputLength = output.length;
    var splitLength = outputLength/3;
    var firstThird = output.slice(0, splitLength);
    var secondThird = output.slice(splitLength, splitLength * 2);
    var thirdThird = output.slice(splitLength * 2, splitLength * 3);
    return [firstThird, secondThird, thirdThird];
  }

  async computeEncryptionKeysForUser(password, authParams) {
    var pw_salt;

    if(authParams.version == "003") {
      if(!authParams.identifier) {
        console.error("authParams is missing identifier.");
        return;
      }
      // Salt is computed from identifier + pw_nonce from server
      pw_salt = await this.generateSalt(authParams.identifier, authParams.version, authParams.pw_cost, authParams.pw_nonce);
    } else {
      // Salt is returned from server
      pw_salt = authParams.pw_salt;
    }

    return this.generateSymmetricKeyPair({password: password, pw_salt: pw_salt, pw_cost: authParams.pw_cost})
    .then((keys) => {
      let userKeys = {pw: keys[0], mk: keys[1], ak: keys[2]};
      return userKeys;
     });
   }

   // Unlike computeEncryptionKeysForUser, this method always uses the latest SF Version
  async generateInitialKeysAndAuthParamsForUser(identifier, password) {
    let version = this.SFJS.version;
    var pw_cost = this.SFJS.defaultPasswordGenerationCost;
    var pw_nonce = await this.generateRandomKey(256);
    var pw_salt = await this.generateSalt(identifier, version, pw_cost, pw_nonce);

    return this.generateSymmetricKeyPair({password: password, pw_salt: pw_salt, pw_cost: pw_cost})
    .then((keys) => {
      let authParams = {pw_nonce: pw_nonce, pw_cost: pw_cost, identifier: identifier, version: version};
      let userKeys = {pw: keys[0], mk: keys[1], ak: keys[2]};
      return {keys: userKeys, authParams: authParams};
    });
  }

}
;export class SFCryptoJS extends SFAbstractCrypto {

  async pbkdf2(password, pw_salt, pw_cost, length) {
    var params = {
      keySize: length/32,
      hasher: CryptoJS.algo.SHA512,
      iterations: pw_cost
    }

    return CryptoJS.PBKDF2(password, pw_salt, params).toString();
  }

}
;var globalScope = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : null);

const subtleCrypto = globalScope.crypto ? globalScope.crypto.subtle : null;

export class SFCryptoWeb extends SFAbstractCrypto {

  /**
  Public
  */

  async pbkdf2(password, pw_salt, pw_cost, length) {
    var key = await this.webCryptoImportKey(password, "PBKDF2", ["deriveBits"]);
    if(!key) {
      console.log("Key is null, unable to continue");
      return null;
    }

    return this.webCryptoDeriveBits(key, pw_salt, pw_cost, length);
  }

  async generateRandomKey(bits) {
    let extractable = true;
    return subtleCrypto.generateKey({name: "AES-CBC", length: bits}, extractable, ["encrypt", "decrypt"]).then((keyObject) => {
      return subtleCrypto.exportKey("raw", keyObject).then(async (keyData) => {
        var key = await this.arrayBufferToHexString(new Uint8Array(keyData));
        return key;
      })
      .catch((err) => {
        console.error("Error exporting key", err);
      });
    })
    .catch((err) => {
      console.error("Error generating key", err);
    });
  }

  async generateItemEncryptionKey() {
    // Generates a key that will be split in half, each being 256 bits. So total length will need to be 512.
    var length = 256;
    return Promise.all([
      this.generateRandomKey(length),
      this.generateRandomKey(length)
    ]).then((values) => {
      return values.join("");
    });
  }

  /* This is a functioning implementation of WebCrypto's encrypt, however, in basic testing, CrpytoJS performs about 30-40% faster, surprisingly. */

  async encryptText(text, key, iv) {
    // in 001, iv can be null, so we'll initialize to an empty array buffer instead
    var ivData = iv ? await this.hexStringToArrayBuffer(iv) : new ArrayBuffer(16);
    const alg = { name: 'AES-CBC', iv: ivData };

    const keyBuffer = await this.hexStringToArrayBuffer(key);
    var keyData = await this.webCryptoImportKey(keyBuffer, alg.name, ["encrypt"]);
    var textData = await this.stringToArrayBuffer(text);

    return crypto.subtle.encrypt(alg, keyData, textData).then(async (result) => {
      let cipher = await this.arrayBufferToBase64(result);
      return cipher;
    })
  }

  async decryptText({ciphertextToAuth, contentCiphertext, encryptionKey, iv, authHash, authKey} = {}, requiresAuth) {
    if(requiresAuth && !authHash) {
      console.error("Auth hash is required.");
      return;
    }

    if(authHash) {
      var localAuthHash = await this.hmac256(ciphertextToAuth, authKey);
      if(authHash !== localAuthHash) {
        console.error(`Auth hash does not match, returning null. ${authHash} != ${localAuthHash}`);
        return null;
      }
    }

    // in 001, iv can be null, so we'll initialize to an empty array buffer instead
    var ivData = iv ? await this.hexStringToArrayBuffer(iv) : new ArrayBuffer(16);
    const alg = { name: 'AES-CBC', iv: ivData };

    const keyBuffer = await this.hexStringToArrayBuffer(encryptionKey);
    var keyData = await this.webCryptoImportKey(keyBuffer, alg.name, ["decrypt"]);
    var textData = await this.base64ToArrayBuffer(contentCiphertext);

    return crypto.subtle.decrypt(alg, keyData, textData).then(async (result) => {
      var decoded = await this.arrayBufferToString(result);
      return decoded;
    }).catch((error) => {
      console.error("Error decrypting:", error);
    })
  }

  /**
  Internal
  */

  async webCryptoImportKey(input, alg, actions, hash) {
    var text = typeof input === "string" ? await this.stringToArrayBuffer(input) : input;
    return subtleCrypto.importKey("raw", text, { name: alg, hash: hash }, false, actions)
    .then((key) => {
      return key;
    })
    .catch((err) => {
      console.error(err);
      return null;
    });
  }
  //
  async webCryptoDeriveBits(key, pw_salt, pw_cost, length) {
    var params = {
      "name": "PBKDF2",
      salt: await this.stringToArrayBuffer(pw_salt),
      iterations: pw_cost,
      hash: {name: "SHA-512"},
    }

    return subtleCrypto.deriveBits(params, key, length)
    .then(async (bits) => {
      var key = await this.arrayBufferToHexString(new Uint8Array(bits));
      return key;
    })
    .catch((err) => {
      console.error(err);
      return null;
    });
  }

  async stringToArrayBuffer(string) {
    // Using FileReader for higher performance amongst larger files
    return new Promise((resolve, reject) => {
      var blob = new Blob([string]);
      var f = new FileReader();
      f.onload = function(e) {
        resolve(e.target.result);
      }
      f.readAsArrayBuffer(blob);
    })
  }

  async arrayBufferToString(arrayBuffer) {
    // Using FileReader for higher performance amongst larger files
    return new Promise((resolve, reject) => {
      var blob = new Blob([arrayBuffer]);
      var f = new FileReader();
      f.onload = function(e) {
        resolve(e.target.result);
      }
      f.readAsText(blob);
    })
  }

  async arrayBufferToHexString(arrayBuffer) {
    var byteArray = new Uint8Array(arrayBuffer);
    var hexString = "";
    var nextHexByte;

    for (var i=0; i<byteArray.byteLength; i++) {
      nextHexByte = byteArray[i].toString(16);
      if(nextHexByte.length < 2) {
        nextHexByte = "0" + nextHexByte;
      }
      hexString += nextHexByte;
    }
    return hexString;
  }

  async hexStringToArrayBuffer(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
    return new Uint8Array(bytes);
  }

  async base64ToArrayBuffer(base64) {
    var binary_string = await this.base64Decode(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for(var i = 0; i < len; i++)        {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  async arrayBufferToBase64(buffer) {
    return new Promise((resolve, reject) => {
      var blob = new Blob([buffer],{type:'application/octet-binary'});
      var reader = new FileReader();
      reader.onload = function(evt){
        var dataurl = evt.target.result;
        resolve(dataurl.substr(dataurl.indexOf(',') + 1));
      };
      reader.readAsDataURL(blob);
    })
  }

  async hmac256(message, key) {
    var keyHexData = await this.hexStringToArrayBuffer(key);
    var keyData = await this.webCryptoImportKey(keyHexData, "HMAC", ["sign"], {name: "SHA-256"});
    var messageData = await this.stringToArrayBuffer(message);
    return crypto.subtle.sign({name: "HMAC"}, keyData, messageData)
    .then(async (signature) => {
      var hash = await this.arrayBufferToHexString(signature);
      return hash;
    })
    .catch(function(err){
      console.error("Error computing hmac");
    });
  }

}
;export class SFItemTransformer {

  constructor(crypto) {
    this.crypto = crypto;
  }

  async _private_encryptString(string, encryptionKey, authKey, uuid, auth_params) {
    var fullCiphertext, contentCiphertext;
    if(auth_params.version === "001") {
      contentCiphertext = await this.crypto.encryptText(string, encryptionKey, null);
      fullCiphertext = auth_params.version + contentCiphertext;
    } else {
      var iv = await this.crypto.generateRandomKey(128);
      contentCiphertext = await this.crypto.encryptText(string, encryptionKey, iv);
      var ciphertextToAuth = [auth_params.version, uuid, iv, contentCiphertext].join(":");
      var authHash = await this.crypto.hmac256(ciphertextToAuth, authKey);
      var authParamsString = await this.crypto.base64(JSON.stringify(auth_params));
      fullCiphertext = [auth_params.version, authHash, uuid, iv, contentCiphertext, authParamsString].join(":");
    }

    return fullCiphertext;
  }

  async encryptItem(item, keys, auth_params) {
    var params = {};
    // encrypt item key
    var item_key = await this.crypto.generateItemEncryptionKey();
    if(auth_params.version === "001") {
      // legacy
      params.enc_item_key = await this.crypto.encryptText(item_key, keys.mk, null);
    } else {
      params.enc_item_key = await this._private_encryptString(item_key, keys.mk, keys.ak, item.uuid, auth_params);
    }

    // encrypt content
    var ek = await this.crypto.firstHalfOfKey(item_key);
    var ak = await this.crypto.secondHalfOfKey(item_key);
    var ciphertext = await this._private_encryptString(JSON.stringify(item.createContentJSONFromProperties()), ek, ak, item.uuid, auth_params);
    if(auth_params.version === "001") {
      var authHash = await this.crypto.hmac256(ciphertext, ak);
      params.auth_hash = authHash;
    }

    params.content = ciphertext;
    return params;
  }

  encryptionComponentsFromString(string, encryptionKey, authKey) {
    var encryptionVersion = string.substring(0, 3);
    if(encryptionVersion === "001") {
      return {
        contentCiphertext: string.substring(3, string.length),
        encryptionVersion: encryptionVersion,
        ciphertextToAuth: string,
        iv: null,
        authHash: null,
        encryptionKey: encryptionKey,
        authKey: authKey
      }
    } else {
      let components = string.split(":");
      return {
        encryptionVersion: components[0],
        authHash: components[1],
        uuid: components[2],
        iv: components[3],
        contentCiphertext: components[4],
        authParams: components[5],
        ciphertextToAuth: [components[0], components[2], components[3], components[4]].join(":"),
        encryptionKey: encryptionKey,
        authKey: authKey,
      }
    }
  }

  async decryptItem(item, keys) {

    if(typeof item.content != "string") {
      // Content is already an object, can't do anything with it.
      return;
    }

    if(item.content.startsWith("000")) {
      // is base64 encoded
      try {
        item.content = JSON.parse(await this.crypto.base64Decode(item.content.substring(3, item.content.length)));
      } catch (e) {}

      return;
    }

    if(!item.enc_item_key) {
      // This needs to be here to continue, return otherwise
      console.log("Missing item encryption key, skipping decryption.");
      return;
    }

    // decrypt encrypted key
    var encryptedItemKey = item.enc_item_key;
    var requiresAuth = true;
    if(!encryptedItemKey.startsWith("002") && !encryptedItemKey.startsWith("003")) {
      // legacy encryption type, has no prefix
      encryptedItemKey = "001" + encryptedItemKey;
      requiresAuth = false;
    }
    var keyParams = this.encryptionComponentsFromString(encryptedItemKey, keys.mk, keys.ak);

    // return if uuid in auth hash does not match item uuid. Signs of tampering.
    if(keyParams.uuid && keyParams.uuid !== item.uuid) {
      console.error("Item key params UUID does not match item UUID");
      if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
      item.errorDecrypting = true;
      return;
    }

    var item_key = await this.crypto.decryptText(keyParams, requiresAuth);

    if(!item_key) {
      console.log("Error decrypting item", item);
      if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
      item.errorDecrypting = true;
      return;
    }

    // decrypt content
    var ek = await this.crypto.firstHalfOfKey(item_key);
    var ak = await this.crypto.secondHalfOfKey(item_key);
    var itemParams = this.encryptionComponentsFromString(item.content, ek, ak);

    try {
      item.auth_params = JSON.parse(await this.crypto.base64Decode(itemParams.authParams));
    } catch (e) {}

    // return if uuid in auth hash does not match item uuid. Signs of tampering.
    if(itemParams.uuid && itemParams.uuid !== item.uuid) {
      if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
      item.errorDecrypting = true;
      return;
    }

    if(!itemParams.authHash) {
      // legacy 001
      itemParams.authHash = item.auth_hash;
    }

    var content = await this.crypto.decryptText(itemParams, true);
    if(!content) {
      if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
      item.errorDecrypting = true;
    } else {
      if(item.errorDecrypting == true) { item.errorDecryptingValueChanged = true;}
       // Content should only be set if it was successfully decrypted, and should otherwise remain unchanged.
      item.errorDecrypting = false;
      item.content = content;
    }
  }

  async decryptMultipleItems(items, keys, throws) {
    let decrypt = async (item) => {
      if(!item) {
        return;
      }
      // 4/15/18: Adding item.content == null clause. We still want to decrypt deleted items incase
      // they were marked as dirty but not yet synced. Not yet sure why we had this requirement.
      if(item.deleted == true && item.content == null) {
        return;
      }

      var isString = typeof item.content === 'string' || item.content instanceof String;
      if(isString) {
        try {
          await this.decryptItem(item, keys);
        } catch (e) {
          if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
          item.errorDecrypting = true;
          if(throws) {
            throw e;
          }
          console.error("Error decrypting item", item, e);
          return;
        }
      }
    }

    return Promise.all(items.map((item) => {
      return decrypt(item);
    }));

  }
}
;var globalScope = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : null);

export class StandardFile {
  constructor(cryptoInstance) {
    // This library runs in native environments as well (react native)
    if(globalScope) {
      // detect IE8 and above, and edge.
      // IE and Edge do not support pbkdf2 in WebCrypto, therefore we need to use CryptoJS
      var IEOrEdge = (typeof document !== 'undefined' && document.documentMode) || /Edge/.test(navigator.userAgent);

      if(!IEOrEdge && (globalScope.crypto && globalScope.crypto.subtle)) {
        this.crypto = new SFCryptoWeb();
      } else {
        this.crypto = new SFCryptoJS();
      }
    }

    // This must be placed outside window check, as it's used in native.
    if(cryptoInstance) {
      this.crypto = cryptoInstance;
    }

    this.itemTransformer = new SFItemTransformer(this.crypto);

    this.crypto.SFJS = {
      version : this.version(),
      defaultPasswordGenerationCost : this.defaultPasswordGenerationCost()
    }
  }

  version() {
    return "003";
  }

  supportsPasswordDerivationCost(cost) {
    // some passwords are created on platforms with stronger pbkdf2 capabilities, like iOS,
    // which CryptoJS can't handle here (WebCrypto can however).
    // if user has high password cost and is using browser that doesn't support WebCrypto,
    // we want to tell them that they can't login with this browser.
    if(cost > 5000) {
      return this.crypto instanceof SFCryptoWeb;
    } else {
      return true;
    }
  }

  // Returns the versions that this library supports technically.
  supportedVersions() {
    return ["001", "002", "003"];
  }

  isVersionNewerThanLibraryVersion(version) {
    var libraryVersion = this.version();
    return parseInt(version) > parseInt(libraryVersion);
  }

  isProtocolVersionOutdated(version) {
    // YYYY-MM-DD
    let expirationDates = {
      "001" : Date.parse("2018-01-01"),
      "002" : Date.parse("2020-01-01"),
    }

    let date = expirationDates[version];
    if(!date) {
      // No expiration date, is active version
      return false;
    }
    let expired = new Date() > date;
    return expired;
  }

  costMinimumForVersion(version) {
    return {
      "001" : 3000,
      "002" : 3000,
      "003" : 110000
    }[version];
  }

  defaultPasswordGenerationCost() {
    return this.costMinimumForVersion(this.version());
  }
}

if(globalScope) {
  // window is for some reason defined in React Native, but throws an exception when you try to set to it
  try {
    globalScope.StandardFile = StandardFile;
    globalScope.SFJS = new StandardFile();
    globalScope.SFCryptoWeb = SFCryptoWeb;
    globalScope.SFCryptoJS = SFCryptoJS;
    globalScope.SFItemTransformer = SFItemTransformer;
    globalScope.SFModelManager = SFModelManager;
    globalScope.SFItem = SFItem;
    globalScope.SFItemParams = SFItemParams;
    globalScope.SFHttpManager = SFHttpManager;
    globalScope.SFStorageManager = SFStorageManager;
    globalScope.SFSyncManager = SFSyncManager;
    globalScope.SFAuthManager = SFAuthManager;
    globalScope.SFMigrationManager = SFMigrationManager;
    globalScope.SFAlertManager = SFAlertManager;
    globalScope.SFPredicate = SFPredicate;
    globalScope.SFHistorySession = SFHistorySession;
    globalScope.SFSessionHistoryManager = SFSessionHistoryManager
    globalScope.SFItemHistory = SFItemHistory;
    globalScope.SFItemHistoryEntry = SFItemHistoryEntry;
    globalScope.SFPrivilegesManager = SFPrivilegesManager;
    globalScope.SFPrivileges = SFPrivileges;
    globalScope.SFSingletonManager = SFSingletonManager;
  } catch (e) {
    console.log("Exception while exporting window variables", e);
  }
}
