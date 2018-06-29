import '../dist/regenerator.js';
import '../dist/sfjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import '../vendor/lodash/lodash.custom.js';
import Factory from './lib/factory.js';

chai.use(chaiAsPromised);
var expect = chai.expect;

describe.only("local storage manager", () => {
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
  syncManager.setEventHandler(() => {

  })

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

      syncManager.sync((success) => {
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

describe.only('online syncing', () => {
  var email = Factory.globalStandardFile().crypto.generateUUIDSync();
  var password = Factory.globalStandardFile().crypto.generateUUIDSync();

  before((done) => {
    Factory.globalStorageManager().clearAllData().then(() => {
      Factory.newRegisteredUser(email, password).then((user) => {
        console.log("Registered as", email);
        done();
      })
    })
  })

  let authManager = Factory.globalAuthManager();
  let modelManager = Factory.createModelManager();
  let syncManager = new SFSyncManager(modelManager, Factory.globalStorageManager(), Factory.globalHttpManager());

  syncManager.setEventHandler(() => {

  })

  syncManager.setKeyRequestHandler(async () => {
    return {
      keys: await authManager.keys(),
      offline: false
    };
  })

  it("should register and sync basic model online", (done) => {
    var item = Factory.createItem();
    item.setDirty(true);
    modelManager.addItem(item);

    syncManager.sync((success) => {
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
  });

  it("should login and retrieve synced item", async () => {
    // logout
    await Factory.globalStorageManager().clearAllData();
    await Factory.globalAuthManager().login(Factory.serverURL(), email, password, true, null);

    syncManager.clearSyncToken();
    return new Promise((resolve, reject) => {
      syncManager.sync(async (success) => {
        try {
          let models = await Factory.globalStorageManager().getAllModels();
          expect(models.length).to.equal(1);
          resolve();
        } catch (e) {
          reject(e);
        }
      })
    })
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
    var itemParams = await new SFItemParams(item, _keys).paramsForSync();
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
    var itemParams = await new SFItemParams(item, _keys).paramsForLocalStorage();
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
    var itemParams = await new SFItemParams(item, _keys).paramsForExportFile();
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
    var itemParams = await new SFItemParams(item, _keys).paramsForSync();
    expect(itemParams.content).to.eql(item.content);
    expect(itemParams.enc_item_key).to.not.be.null;
    expect(itemParams.uuid).to.not.be.null;
    expect(itemParams.content_type).to.not.be.null;
    expect(itemParams.created_at).to.not.be.null;
  });


});
