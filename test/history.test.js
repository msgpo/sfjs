import '../dist/regenerator.js';
import '../dist/sfjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import '../vendor/lodash/lodash.custom.js';
import Factory from './lib/factory.js';

chai.use(chaiAsPromised);
var expect = chai.expect;


describe.only('session history', () => {
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
  var keyRequestHandler = async () => {
    return {
      keys: await authManager.keys(),
      auth_params: await authManager.getAuthParams(),
      offline: false
    };
  };

  syncManager.setKeyRequestHandler(keyRequestHandler)

  let historyManager = new SFSessionHistoryManager(modelManager, Factory.globalStorageManager(), keyRequestHandler, "*");

  it("should register and sync basic model online", async () => {
    var item = Factory.createItem();
    item.setDirty(true);
    modelManager.addItem(item);
    await syncManager.sync();

    var itemHistory = historyManager.historyForItem(item);
    expect(itemHistory).to.be.ok;
    expect(itemHistory.entries.length).to.equal(1);

    // sync with same contents, should not create new entry
    item.setDirty(true);
    await syncManager.sync();
    expect(itemHistory.entries.length).to.equal(1);

    // sync with different contents, should create new entry
    item.content.title = Math.random();
    item.setDirty(true);
    await syncManager.sync();
    expect(itemHistory.entries.length).to.equal(2);

    historyManager.clearHistoryForItem(item);
    var itemHistory = historyManager.historyForItem(item);
    expect(itemHistory.entries.length).to.equal(0);

    item.setDirty(true);
    await syncManager.sync();
    expect(itemHistory.entries.length).to.equal(1);

    historyManager.clearAllHistory();
    expect(historyManager.historyForItem(item).entries.length).to.equal(0);
  });
});
