import '../dist/regenerator.js';
import '../dist/sfjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import '../vendor/lodash/lodash.custom.js';
import Factory from './lib/factory.js';
import MemoryStorageManager from './lib/memoryStorageManager.js';

chai.use(chaiAsPromised);
var expect = chai.expect;

describe("local storage manager", () => {
  before(async () => {
    await Factory.globalStorageManager().clearAllData();
  })

  it("should set and retrieve values", async () => {
    var key = "foo";
    var value = "bar";
    await Factory.globalStorageManager().setItem(key, value);
    expect(await Factory.globalStorageManager().getItem(key)).to.eql(value);
  })

  it("should set and retrieve items", async () => {
    var item = Factory.createItem();
    await Factory.globalStorageManager().saveModel(item);

    return Factory.globalStorageManager().getAllModels().then((models) => {
      expect(models.length).to.equal(1);
    })
  })

  it("should clear values", async () => {
    var key = "foo";
    var value = "bar";
    await Factory.globalStorageManager().setItem(key, value);
    await Factory.globalStorageManager().clearAllData();
    expect(await Factory.globalStorageManager().getItem(key)).to.not.be.ok;
  })
})

describe('offline syncing', () => {
  let modelManager = Factory.createModelManager();
  let syncManager = new SFSyncManager(modelManager, Factory.globalStorageManager(), Factory.globalHttpManager());

  syncManager.setKeyRequestHandler(async () => {
    return {
      offline: true
    };
  })

  beforeEach(async () => {
    await Factory.globalStorageManager().clearAllData();
  });

  it("should sync basic model offline", (done) => {
    var item = Factory.createItem();
    item.setDirty(true);
    modelManager.addItem(item);

    Factory.globalStorageManager().getAllModels().then((models) => {
      expect(models.length).to.equal(0);

      syncManager.sync().then(() => {
        try {
          expect(modelManager.getDirtyItems().length).to.equal(0);
          Factory.globalStorageManager().getAllModels().then((models) => {
            expect(models.length).to.equal(1);
            done();
          });
        } catch (e) {
          done(e);
        }
      })
    })
  });
});

describe('online syncing', () => {
  var email = Factory.globalStandardFile().crypto.generateUUIDSync();
  var password = Factory.globalStandardFile().crypto.generateUUIDSync();
  var totalItemCount = 0;

  before((done) => {
    Factory.globalStorageManager().clearAllData().then(() => {
      Factory.newRegisteredUser(email, password).then((user) => {
        done();
      })
    })
  })

  let authManager = Factory.globalAuthManager();
  let modelManager = Factory.createModelManager();
  let syncManager = new SFSyncManager(modelManager, Factory.globalStorageManager(), Factory.globalHttpManager());

  syncManager.setKeyRequestHandler(async () => {
    return {
      keys: await authManager.keys(),
      auth_params: await authManager.getAuthParams(),
      offline: false
    };
  })

  it("should register and sync basic model online", () => {
    var item = Factory.createItem();
    item.setDirty(true);
    modelManager.addItem(item);

    totalItemCount++;

    return expect(syncManager.sync()).to.be.fulfilled.then(async (response) => {
      expect(response).to.be.ok;
      expect(modelManager.getDirtyItems().length).to.equal(0);
      let models = await Factory.globalStorageManager().getAllModels();
      expect(models.length).to.equal(totalItemCount);
    });
  });

  it("should login and retrieve synced item", async () => {
    // logout
    await Factory.globalAuthManager().signout();
    syncManager.clearSyncToken();
    await Factory.globalStorageManager().clearAllData();
    await Factory.globalAuthManager().login(Factory.serverURL(), email, password, true, null);

    return expect(syncManager.sync()).to.be.fulfilled.then(async (response) => {
      expect(response).to.be.ok;
      let models = await Factory.globalStorageManager().getAllModels();
      expect(models.length).to.equal(totalItemCount);
    })
  });

  it("every sync request should trigger a completion event", async () => {
    let syncCount = 10;
    let successes = 0;
    let events = 0;

    syncManager.addEventHandler(async (event, data) => {
      if(event == "sync:completed") {
        events++;
      }
    });

    for(let i = 0; i < syncCount; i++) {
      syncManager.sync().then(() => {
        successes++;
      })
    }

    await Factory.sleep(1);

    expect(successes).to.equal(syncCount);
    expect(events).to.equal(syncCount);
  }).timeout(5000);

  it("mapping should not mutate items with error decrypting state", async () => {
    var item = Factory.createItem();
    let originalTitle = item.content.title;
    item.setDirty(true);
    modelManager.addItem(item);
    await syncManager.sync();
    totalItemCount++;

    let keys = await authManager.keys();
    let authParams = await authManager.getAuthParams();
    var itemParams = await new SFItemParams(item, keys, authParams).paramsForSync();
    itemParams.errorDecrypting = true;
    let mappedItem = modelManager.mapResponseItemsToLocalModels([itemParams])[0];
    expect(typeof mappedItem.content).to.equal("string");

    await SFJS.itemTransformer.decryptItem(itemParams, keys);
    mappedItem = modelManager.mapResponseItemsToLocalModels([itemParams])[0];
    expect(typeof mappedItem.content).to.equal("object");
    expect(mappedItem.content.title).to.equal(originalTitle);
  });

  it("should handle sync conflicts by duplicating differing data", async () => {
    // create an item and sync it
    var item = Factory.createItem();
    item.setDirty(true);
    modelManager.addItem(item);
    await syncManager.sync();
    totalItemCount++;

    let models = await Factory.globalStorageManager().getAllModels();
    expect(models.length).to.equal(totalItemCount);

    // modify this item to have stale values
    item.content.title = `${Math.random()}`;
    item.updated_at = Factory.yesterday();
    item.setDirty(true);

    // We expect this item to be duplicated
    totalItemCount++;

    // wait about 1s, which is the value the dev server will ignore conflicting changes
    await Factory.sleep(1.1);
    await syncManager.sync()

    let memModels = modelManager.allItems;
    expect(memModels.length).to.equal(totalItemCount);

    let storedModels = await Factory.globalStorageManager().getAllModels();
    expect(storedModels.length).to.equal(totalItemCount);
  }).timeout(5000);

  it("should duplicate item if saving a modified item and clearing our sync token", async () => {
    var item = Factory.createItem();
    item.setDirty(true);
    modelManager.addItem(item);
    await syncManager.sync();
    totalItemCount++;

    // modify this item to have stale values
    let newTitle = `${Math.random()}`;
    item.content.title = newTitle;
    // Do not set updated_at to old value. We we intentionally want to avoid that scenario, since that's easily handled.
    // We're testing the case where we save something that will be retrieved.
    // Actually, as explained in sync-log, this would never happen. updated_at would always have an inferior value if it were in retrieved items and is dirty. (except if the sync token is explicitely cleared, but that never happens)
    item.updated_at = Factory.yesterday();
    item.setDirty(true, true); // set client modified

    // We expect this item to be duplicated
    totalItemCount++;

    await syncManager.clearSyncToken();
    // wait about 1s, which is the value the dev server will ignore conflicting changes
    await Factory.sleep(1.1);
    await syncManager.sync()

    // We expect the item title to be the new title, and not rolled back to original value
    expect(item.content.title).to.equal(newTitle);

    let memModels = modelManager.allItems;
    expect(memModels.length).to.equal(totalItemCount);

    let storedModels = await Factory.globalStorageManager().getAllModels();
    expect(storedModels.length).to.equal(totalItemCount);
  }).timeout(5000);


  it("should handle sync conflicts by not duplicating same data", async () => {
    // create an item and sync it
    var item = Factory.createItem();
    totalItemCount++;
    item.setDirty(true);
    modelManager.addItem(item);
    await syncManager.sync();

    // keep item as is and set dirty
    item.setDirty(true);

    // clear sync token so that all items are retrieved on next sync
    syncManager.clearSyncToken();

    // wait about 1s, which is the value the dev server will ignore conflicting changes
    return expect(new Promise((resolve, reject) => {
      setTimeout(function () {
        resolve();
      }, 1100);
    })).to.be.fulfilled.then(async () => {
      return expect(syncManager.sync()).to.be.fulfilled.then(async (response) => {
        expect(response).to.be.ok;
        let models = await Factory.globalStorageManager().getAllModels();
        expect(models.length).to.equal(totalItemCount);
      })
    })
  }).timeout(5000);

  it("should create conflict if syncing an item that is stale", async () => {
    // Typically if the client attempted to save an item for which the server has a newer change,
    // the server will instruct the client to duplicate it. But this only works according to the syncToken
    // sent in. However, when it comes to dealing with sync tokens and cursor tokens, it may be that
    // the subset of items sent up (limit ~150) does not match up with what the server has for a given token,
    // so the server will not determine that an incoming item has an existing change.

    // We'll simulate rogue client behavior here, which syncs up a stale note,
    // with a sync token that has already downloaded all changes. With as-of-now current server behavior, we expect it
    // to save the stale item (which is no good). After the server updates, it will
    // compare updated_at of any incoming items. If the incoming item updated_at does not match what the server has,
    // it means we're trying to save an item that hasn't been updated yet. We should conflict immediately at that point.

    var item = Factory.createItem();
    totalItemCount++;
    item.setDirty(true);
    modelManager.addItem(item);
    await syncManager.sync();

    let yesterday = Factory.yesterday();
    item.content.text = "Stale text";
    item.updated_at = yesterday;
    item.setDirty(true);
    await syncManager.sync();

    // We expect now that the item was conflicted
    totalItemCount++;

    let models = await Factory.globalStorageManager().getAllModels();
    expect(models.length).to.equal(totalItemCount);
  }).timeout(5000);

  it("should sync an item twice if it's marked dirty while a sync is ongoing", async () => {
    // create an item and sync it
    var item = Factory.createItem();
    item.setDirty(true);
    modelManager.addItem(item);
    totalItemCount++;
    syncManager.sync();
    setTimeout(function () {
      item.setDirty(true);
    }, 50);

    return expect(new Promise((resolve, reject) => {
      setTimeout(function () {
        resolve();
      }, 300);
    })).to.be.fulfilled.then(() => {
      expect(modelManager.getDirtyItems().length).to.equal(1);
    })
  }).timeout(5000);

  it("marking an item dirty then saving to disk should retain that dirty state when restored", async () => {
    // create an item and sync it
    var item = Factory.createItem();
    modelManager.addItem(item);
    totalItemCount++;
    await syncManager.markAllItemsDirtyAndSaveOffline(false);
    modelManager.handleSignout();
    expect(modelManager.allItems.length).to.equal(0);

    await syncManager.loadLocalItems();
    expect(modelManager.allItems.length).to.equal(totalItemCount);

    item = modelManager.findItem(item.uuid);
    expect(item.dirty).to.equal(true);
    return true;
  }).timeout(5000);

  it('duplicating an item should maintian its relationships', async () => {
    var originalItem1 = Factory.createItem();
    originalItem1.content_type = "Foo";

    var originalItem2 = Factory.createItem();
    originalItem2.content_type = "Bar";

    originalItem1.addItemAsRelationship(originalItem2);
    totalItemCount += 2;
    modelManager.mapResponseItemsToLocalModels([originalItem1, originalItem2]);

    originalItem1 = modelManager.findItem(originalItem1.uuid);
    originalItem2 = modelManager.findItem(originalItem2.uuid);

    expect(originalItem1).to.be.ok;
    expect(originalItem2).to.be.ok;

    expect(originalItem2.referencingObjects.length).to.equal(1);
    expect(originalItem2.referencingObjects).to.include(originalItem1);

    originalItem1.setDirty(true);
    originalItem2.setDirty(true);

    await syncManager.sync();

    expect(modelManager.allItems.length).to.equal(totalItemCount);

    originalItem1.content.title = `${Math.random()}`
    originalItem1.updated_at = Factory.yesterday();
    originalItem1.setDirty(true);

    // wait about 1s, which is the value the dev server will ignore conflicting changes
    await Factory.sleep(1.1);
    await syncManager.sync();
    // item should now be conflicted and a copy created
    totalItemCount++;
    expect(modelManager.allItems.length).to.equal(totalItemCount);
    let models = modelManager.allItemsMatchingTypes(["Foo"]);
    var item1 = models[0];
    var item2 = models[1];

    expect(item2.content.conflict_of).to.equal(item1.uuid);
    // Two items now link to this original object
    expect(originalItem2.referencingObjects.length).to.equal(2);
    expect(originalItem2.referencingObjects[0]).to.not.equal(originalItem2.referencingObjects[1]);

    expect(originalItem1.referencingObjects.length).to.equal(0);
    expect(item1.referencingObjects.length).to.equal(0);
    expect(item2.referencingObjects.length).to.equal(0);

    expect(item1.content.references.length).to.equal(1);
    expect(item2.content.references.length).to.equal(1);
    expect(originalItem2.content.references.length).to.equal(0);
  }).timeout(10000);

  let largeItemCount = 300;

  it("should handle syncing pagination", async () => {
    for(var i = 0; i < largeItemCount; i++) {
      var item = Factory.createItem();
      item.setDirty(true);
      modelManager.addItem(item);
    }

    totalItemCount += largeItemCount;

    return expect(syncManager.sync()).to.be.fulfilled.then(async (response) => {
      expect(response).to.be.ok;
      let models = await Factory.globalStorageManager().getAllModels();
      expect(models.length).to.equal(totalItemCount);
    })
  }).timeout(25000);

  it("should be able to download all items separate of sync", async () => {
    return expect(syncManager.stateless_downloadAllItems()).to.be.fulfilled.then(async (downloadedItems) => {
      expect(downloadedItems.length).to.equal(totalItemCount);
      // ensure it's decrypted
      expect(downloadedItems[0].content.text).to.equal("world");
    })
  }).timeout(15000);

  it("load local items", async () => {
    let localModelManager = Factory.createModelManager();
    let localSyncManager = new SFSyncManager(localModelManager, Factory.globalStorageManager(), Factory.globalHttpManager());
    localSyncManager.setKeyRequestHandler(syncManager.keyRequestHandler);
    expect(localModelManager.allItems.length).to.equal(0);

    await localSyncManager.loadLocalItems();
    expect(localModelManager.allItems.length).to.equal(totalItemCount);
  });

  it("load local items should respect sort priority", async () => {
    let localModelManager = Factory.createModelManager();
    let localStorageManager = new MemoryStorageManager();
    let localSyncManager = new SFSyncManager(localModelManager, localStorageManager, Factory.globalHttpManager());
    localSyncManager.setKeyRequestHandler(async () => {
      return {
        offline: true
      };
    })

    let contentTypes = ["A", "B", "C"];
    let itemCount = 6;
    for(var i = 0; i < itemCount; i++) {
      var item = Factory.createItem();
      item.content_type = contentTypes[Math.floor(i/2)];
      item.setDirty(true);
      localModelManager.addItem(item);
    }

    await localSyncManager.sync();
    let models = await localStorageManager.getAllModels();

    expect(models.length).to.equal(itemCount);

    // reset items
    localModelManager.handleSignout();

    localSyncManager.contentTypeLoadPriority = ["C", "A", "B"];
    await localSyncManager.loadLocalItems();

    let items = localModelManager.allItems;

    expect(items[0].content_type).to.equal("C");
    expect(items[2].content_type).to.equal("A");
    expect(items[4].content_type).to.equal("B");
  });

  it("should sign in and retrieve large number of items", async () => {
    // logout
    await Factory.globalAuthManager().signout();
    syncManager.clearSyncToken();
    await Factory.globalStorageManager().clearAllData();
    await Factory.globalAuthManager().login(Factory.serverURL(), email, password, true, null);

    let models = await Factory.globalStorageManager().getAllModels();
    expect(models.length).to.equal(0);

    return expect(syncManager.sync()).to.be.fulfilled.then(async (response) => {
      expect(response).to.be.ok;
      let models = await Factory.globalStorageManager().getAllModels();
      expect(models.length).to.equal(totalItemCount);
    })
  }).timeout(15000);

  it("handles stale data in bulk", async () => {

    let itemCount = 200;
    // syncManager.PerSyncItemUploadLimit = 1;
    // syncManager.ServerItemDownloadLimit = 2;

    for(var i = 0; i < itemCount; i++) {
      var item = Factory.createItem();
      item.setDirty(true);
      modelManager.addItem(item);
    }

    totalItemCount += itemCount;
    await syncManager.sync();
    let items = modelManager.allItems;
    expect(items.length).to.equal(totalItemCount);

    // We want to see what will happen if we upload everything we have to the server as dirty,
    // with no sync token, so that the server also gives us everything it has. Where I expect some awkwardness
    // is with subsets. That is, sync requests are broken up, so if I'm sending up 150/400, will the server know to conflict it?

    // With rails-engine behavior 0.3.1, we expect syncing up stale data with old updated_at dates
    // to overwrite whatever is on the server. With the 0.3.2 update, we expect this data will be conflicted
    // since what the server has for updated_at doesn't match what we're sending it.

    // In the test below, we expect all models to double. We'll modify the content, and act as if the change
    // were from yesterday. The server would have the current time as its updated_at. This test succeeds
    // when you're only dealing with 100 items. But if you go up to 300 where pagination is required, you can see
    // that the server can't properly handle conflicts. 0.3.2 of the server will add an additional conflict check
    // by comparing the incoming updated_at with the existing, and if it's in the past, we'll conflict it.

    let yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
    for(let item of items) {
      item.content.text = `${Math.random()}`;
      item.updated_at = yesterday;
      item.setDirty(true);
    }

    await syncManager.sync();

    // We expect all the models to have been duplicated now, exactly.
    totalItemCount *= 2;

    items = modelManager.allItems;
    expect(items.length).to.equal(totalItemCount);

    let storage = await Factory.globalStorageManager().getAllModels();
    expect(storage.length).to.equal(totalItemCount);
  }).timeout(45000);

  it('when a note is conflicted, its tags should not be duplicated.', async () => {
    /*
      If you have a note and a tag, and the tag has 1 reference to the note,
      and you import the same two items, except modify the note value so that a duplicate is created,
      we expect only the note to be duplicated, and the tag not to.
      However, if only the note changes, and you duplicate the note, which causes the tag's references content to change,
      then when the incoming tag is being processed, it will also think it has changed, since our local value now doesn't match
      what's coming in. The solution is to get all values ahead of time before any changes are made.
    */
    var tag = Factory.createItem();
    tag.content_type = "Tag";

    var note = Factory.createItem();
    modelManager.addItem(note);
    modelManager.addItem(tag);
    tag.addItemAsRelationship(note);
    tag.setDirty(true);
    note.setDirty(true);
    totalItemCount += 2;

    await syncManager.sync();

    // conflict the note
    let newText = `${Math.random()}`;
    note.updated_at = Factory.yesterday();
    note.content.text = newText;
    note.setDirty(true);

    // conflict the tag but keep its content the same
    tag.updated_at = Factory.yesterday();
    tag.setDirty(true);

    await Factory.sleep(1.1);
    await syncManager.sync();

    // We expect now that the total item count has went up by just 1 (the note), and not 2 (the note and tag)
    totalItemCount += 1;
    expect(modelManager.allItems.length).to.equal(totalItemCount);
    expect(tag.content.references.length).to.equal(2);
  });
});

describe('sync params', () => {

  var _identifier = "hello@test.com";
  var _password = "password";
  var _authParams, _keys;

  before((done) => {
    // runs once before all tests in this block
    Factory.globalStandardFile().crypto.generateInitialKeysAndAuthParamsForUser(_identifier, _password).then((result) => {
      _authParams = result.authParams;
      _keys = result.keys;
      done();
    })
  });

  it("returns valid encrypted params for syncing", async () => {
    var item = Factory.createItem();
    var itemParams = await new SFItemParams(item, _keys, _authParams).paramsForSync();
    expect(itemParams.enc_item_key).to.not.be.null;
    expect(itemParams.uuid).to.not.be.null;
    expect(itemParams.auth_hash).to.be.null;
    expect(itemParams.content_type).to.not.be.null;
    expect(itemParams.created_at).to.not.be.null;
    expect(itemParams.content).to.satisfy((string) => {
      return string.startsWith(Factory.globalStandardFile().version());
    });
  });

  it("returns unencrypted params with no keys", async () => {
    var item = Factory.createItem();
    var itemParams = await new SFItemParams(item, null).paramsForSync();
    expect(itemParams.enc_item_key).to.be.null;
    expect(itemParams.auth_hash).to.be.null;
    expect(itemParams.uuid).to.not.be.null;
    expect(itemParams.content_type).to.not.be.null;
    expect(itemParams.created_at).to.not.be.null;
    expect(itemParams.content).to.satisfy((string) => {
      return string.startsWith("000");
    });
  });

  it("returns additional fields for local storage", async () => {
    var item = Factory.createItem();
    var itemParams = await new SFItemParams(item, _keys, _authParams).paramsForLocalStorage();
    expect(itemParams.enc_item_key).to.not.be.null;
    expect(itemParams.auth_hash).to.be.null;
    expect(itemParams.uuid).to.not.be.null;
    expect(itemParams.content_type).to.not.be.null;
    expect(itemParams.created_at).to.not.be.null;
    expect(itemParams.updated_at).to.not.be.null;
    expect(itemParams.deleted).to.not.be.null;
    expect(itemParams.errorDecrypting).to.not.be.null;
    expect(itemParams.content).to.satisfy((string) => {
      return string.startsWith(Factory.globalStandardFile().version());
    });
  });

  it("omits deleted for export file", async () => {
    var item = Factory.createItem();
    var itemParams = await new SFItemParams(item, _keys, _authParams).paramsForExportFile();
    expect(itemParams.enc_item_key).to.not.be.null;
    expect(itemParams.uuid).to.not.be.null;
    expect(itemParams.content_type).to.not.be.null;
    expect(itemParams.created_at).to.not.be.null;
    expect(itemParams.deleted).to.not.be.ok;
    expect(itemParams.content).to.satisfy((string) => {
      return string.startsWith(Factory.globalStandardFile().version());
    });
  });

  it("items with error decrypting should remain as is", async () => {
    var item = Factory.createItem();
    item.errorDecrypting = true;
    var itemParams = await new SFItemParams(item, _keys, _authParams).paramsForSync();
    expect(itemParams.content).to.eql(item.content);
    expect(itemParams.enc_item_key).to.not.be.null;
    expect(itemParams.uuid).to.not.be.null;
    expect(itemParams.content_type).to.not.be.null;
    expect(itemParams.created_at).to.not.be.null;
  });
});


describe('sync discordance', () => {
  var email = Factory.globalStandardFile().crypto.generateUUIDSync();
  var password = Factory.globalStandardFile().crypto.generateUUIDSync();
  var totalItemCount = 0;

  let localStorageManager = new MemoryStorageManager();
  let localAuthManager = new SFAuthManager(localStorageManager, Factory.globalHttpManager());

  before((done) => {
    localStorageManager.clearAllData().then(() => {
      Factory.newRegisteredUser(email, password, localAuthManager).then((user) => {
        done();
      })
    })
  })

  let localHttpManager = new SFHttpManager();
  localHttpManager.setJWTRequestHandler(async () => {
    return localStorageManager.getItem("jwt");;
  })
  let localModelManager = Factory.createModelManager();
  let localSyncManager = new SFSyncManager(localModelManager, localStorageManager, localHttpManager);

  let itemCount = 0;

  localSyncManager.setKeyRequestHandler(async () => {
    return {
      keys: await localAuthManager.keys(),
      auth_params: await localAuthManager.getAuthParams(),
      offline: false
    };
  })

  it("should begin discordance upon instructions", async () => {
    let response = await localSyncManager.sync({performIntegrityCheck: false});
    expect(response.integrity_hash).to.not.be.ok;

    response = await localSyncManager.sync({performIntegrityCheck: true});
    expect(response.integrity_hash).to.not.be.null;

    // integrity should be valid
    expect(localSyncManager.syncDiscordance).to.equal(0);

    // sync should no longer request integrity hash from server
    response = await localSyncManager.sync({performIntegrityCheck: false});
    expect(response.integrity_hash).to.not.be.ok;

    // we expect another integrity check here
    response = await localSyncManager.sync({performIntegrityCheck: true});
    expect(response.integrity_hash).to.not.be.null;

    // integrity should be valid
    expect(localSyncManager.syncDiscordance).to.equal(0);
  }).timeout(10000);

  it("should increase discordance as client server mismatches", async () => {
    let response = await localSyncManager.sync();

    var item = Factory.createItem();
    item.setDirty(true);
    localModelManager.addItem(item);
    itemCount++;

    await localSyncManager.sync({performIntegrityCheck: true});

    // Expect no discordance
    expect(localSyncManager.syncDiscordance).to.equal(0);

    // Delete item locally only without notifying server. We should then be in discordance.
    await localModelManager.removeItemLocally(item);

    // wait for integrity check interval
    await localSyncManager.sync({performIntegrityCheck: true});

    // We expect now to be in discordance. What the client has is different from what the server has
    // The above sync will not resolve until it syncs enough time to meet discordance threshold
    expect(localSyncManager.syncDiscordance).to.equal(localSyncManager.MaxDiscordanceBeforeOutOfSync);

    // We now expect out of sync to be true, since we have reached MaxDiscordanceBeforeOutOfSync
    expect(localSyncManager.isOutOfSync()).to.equal(true);

    // Integrity checking should now be disabled until the next interval
    response = await localSyncManager.sync();
    expect(response.integrity_hash).to.not.be.ok;

    // We should still be in discordance and out of sync at this point
    expect(localSyncManager.syncDiscordance).to.equal(localSyncManager.MaxDiscordanceBeforeOutOfSync);
    expect(localSyncManager.isOutOfSync()).to.equal(true);

    // We will now reinstate the item and sync, which should repair everything
    item.setDirty(true);
    localModelManager.addItem(item);
    await localSyncManager.sync({performIntegrityCheck: true});

    expect(localSyncManager.isOutOfSync()).to.equal(false);
    expect(localSyncManager.syncDiscordance).to.equal(0);
  }).timeout(10000);

  it("should perform sync resolution in which differing items are duplicated instead of merged", async () => {
    var item = Factory.createItem();
    item.setDirty(true);
    localModelManager.addItem(item);
    itemCount++;

    await localSyncManager.sync();

    // Delete item locally only without notifying server. We should then be in discordance.
    // Don't use localModelManager.removeItemLocally(item), as it saves some state about itemsPendingDeletion. Use internal API
    _.remove(localModelManager.items, {uuid: item.uuid});
    delete localModelManager.itemsHash[item.uuid]

    await localSyncManager.sync({performIntegrityCheck: true});
    expect(localSyncManager.isOutOfSync()).to.equal(true);

    // lets resolve sync where content does not differ
    await localSyncManager.resolveOutOfSync();
    expect(localSyncManager.isOutOfSync()).to.equal(false);

    // expect a clean merge
    expect(localModelManager.allItems.length).to.equal(itemCount);

    // lets enter back into out of sync
    item = localModelManager.allItems[0];
    // now lets change the local content without syncing it.
    item.content.text = "discordance";

    // When we resolve out of sync now (even though we're not currently officially out of sync)
    // we expect that the remote content coming in doesn't wipe out our pending change. A conflict should be created
    await localSyncManager.resolveOutOfSync();
    expect(localSyncManager.isOutOfSync()).to.equal(false);
    expect(localModelManager.allItems.length).to.equal(itemCount + 1);

    for(let item of localModelManager.allItems) {
      expect(item.uuid).not.be.null;
    }

    // now lets sync the item, just to make sure it doesn't cause any problems
    item.setDirty(true);
    await localSyncManager.sync({performIntegrityCheck: true});
    expect(localSyncManager.isOutOfSync()).to.equal(false);
    expect(localModelManager.allItems.length).to.equal(itemCount + 1);
  });
});
