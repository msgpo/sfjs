import '../dist/regenerator.js';
import '../dist/sfjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import '../vendor/lodash/lodash.custom.js';
import Factory from './lib/factory.js';

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

  it("should handle sync conflicts by duplicating differing data", async () => {
    // create an item and sync it
    var item = Factory.createItem();
    item.setDirty(true);
    modelManager.addItem(item);
    await syncManager.sync();
    totalItemCount++;

    let models = await Factory.globalStorageManager().getAllModels();
    expect(models.length).to.equal(totalItemCount);

    // modify this item to have different values
    item.content.title = `${Math.random()}`;
    item.setDirty(true);

    // We expect this item to be duplicated
    totalItemCount++;

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

        let memModels = modelManager.allItems;
        expect(memModels.length).to.equal(totalItemCount);

        console.log("Checking storage models");

        let storedModels = await Factory.globalStorageManager().getAllModels();
        expect(storedModels.length).to.equal(totalItemCount);
      })
    })
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

  it("should sync an item twice if it's marked dirty while a sync is ongoing", async () => {
    // create an item and sync it
    var item = Factory.createItem();
    item.setDirty(true);
    modelManager.addItem(item);
    totalItemCount++;
    syncManager.sync();
    setTimeout(function () {
      item.setDirty(true);
    }, 10);

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
    await syncManager.clearSyncToken();

    expect(modelManager.allItems.length).to.equal(totalItemCount);

    originalItem1.content.title = `${Math.random()}`
    originalItem1.setDirty(true);

    // wait about 1s, which is the value the dev server will ignore conflicting changes
    return expect(new Promise((resolve, reject) => {
      setTimeout(function () {
        resolve();
      }, 1100);
    })).to.be.fulfilled.then(async () => {
      return expect(syncManager.sync()).to.be.fulfilled.then(async (response) => {
        // item should now be conflicted and a copy created
        totalItemCount++;
        expect(modelManager.allItems.length).to.equal(totalItemCount);
        let models = modelManager.allItemsMatchingTypes(["Foo"]);
        var item1 = models[0];
        var item2 = models[1];

        expect(item2.conflict_of).to.equal(item1.uuid);
        // Two items now link to this original object
        expect(originalItem2.referencingObjects.length).to.equal(2);
        expect(originalItem2.referencingObjects[0]).to.not.equal(originalItem2.referencingObjects[1]);

        expect(originalItem1.referencingObjects.length).to.equal(0);
        expect(item1.referencingObjects.length).to.equal(0);
        expect(item2.referencingObjects.length).to.equal(0);

        expect(item1.content.references.length).to.equal(1);
        expect(item2.content.references.length).to.equal(1);
        expect(originalItem2.content.references.length).to.equal(0);
      })
    })
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
  }).timeout(15000);

  it("load local items", async () => {
    let localModelManager = Factory.createModelManager();
    let localSyncManager = new SFSyncManager(localModelManager, Factory.globalStorageManager(), Factory.globalHttpManager());
    localSyncManager.setKeyRequestHandler(syncManager.keyRequestHandler);
    expect(localModelManager.allItems.length).to.equal(0);

    await localSyncManager.loadLocalItems();
    expect(localModelManager.allItems.length).to.equal(totalItemCount);
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
