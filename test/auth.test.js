import '../dist/regenerator.js';
import '../dist/sfjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import '../vendor/lodash/lodash.custom.js';
import Factory from './lib/factory.js';

chai.use(chaiAsPromised);
var expect = chai.expect;

describe("basic auth", () => {
  let url = "http://localhost:3000";
  let email = Factory.globalStandardFile().crypto.generateUUIDSync();
  let password = Factory.globalStandardFile().crypto.generateUUIDSync();
  var _keys;

  before(async () => {
    await Factory.globalStorageManager().clearAllData();
  })

  it("successfully register new account", (done) => {
     Factory.globalAuthManager().register(url, email, password, false).then((response) => {
      expect(response.error).to.not.be.ok;
      done();
    })
  })

  it("successfully logins to registered account", (done) => {
    var strict = false;
     Factory.globalAuthManager().login(url, email, password, strict, null).then(async (response) => {
      _keys = await Factory.globalAuthManager().keys();
      expect(response.error).to.not.be.ok;
      done();
    })
  })

  it("fails login to registered account", (done) => {
    var strict = false;
    Factory.globalAuthManager().login(url, email, "wrong-password", strict, null).then((response) => {
      expect(response.error).to.be.ok;
      done();
    })
  })

  it("successfully changes password", async () => {
    let modelManager = Factory.createModelManager();
    let storageManager = Factory.globalStorageManager();
    let syncManager = new SFSyncManager(modelManager, storageManager, Factory.globalHttpManager());

    syncManager.setKeyRequestHandler(async () => {
      return {
        offline: false,
        keys: await Factory.globalAuthManager().keys(),
        auth_params: await Factory.globalAuthManager().getAuthParams(),
      };
    })

    var totalItemCount = 105;
    for(var i = 0; i < totalItemCount; i++) {
      var item = Factory.createItem();
      item.setDirty(true);
      modelManager.addItem(item);
    }

    await syncManager.sync();

    var strict = false;

    var result = await Factory.globalStandardFile().crypto.generateInitialKeysAndAuthParamsForUser(email, password);
    var newKeys = result.keys;
    var newAuthParams = result.authParams;

    var response = await Factory.globalAuthManager().changePassword(email, _keys.pw, newKeys, newAuthParams);
    expect(response.error).to.not.be.ok;

    expect(modelManager.allItems.length).to.equal(totalItemCount);
    expect(modelManager.invalidItems().length).to.equal(0);

    modelManager.setAllItemsDirty();
    await syncManager.sync();

    // create conflict for an item
    var item = modelManager.allItems[0];
    item.content.foo = "bar";
    item.setDirty(true);
    totalItemCount++;

    // clear sync token, clear storage, download all items, and ensure none of them have error decrypting
    await syncManager.clearSyncToken();
    await syncManager.sync();
    await syncManager.clearSyncToken();
    await storageManager.clearAllModels();
    modelManager.handleSignout();

    expect(modelManager.allItems.length).to.equal(0);

    await syncManager.sync();

    expect(modelManager.allItems.length).to.equal(totalItemCount);
    expect(modelManager.invalidItems().length).to.equal(0);

    var loginResponse = await Factory.globalAuthManager().login(url, email, password, strict, null);
    expect(loginResponse.error).to.not.be.ok;
  }).timeout(20000);

})
