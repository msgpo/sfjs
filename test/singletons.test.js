import '../dist/regenerator.js';
import '../dist/sfjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import Factory from './lib/factory.js';
import MemoryStorageManager from './lib/memoryStorageManager.js';

SFItem.AppDomain = "org.standardnotes.sn";

chai.use(chaiAsPromised);
var expect = chai.expect;

const storageManager = new MemoryStorageManager();
const modelManager = new SFModelManager();
const syncManager = new SFSyncManager(modelManager, storageManager, Factory.globalHttpManager());
const singletonManager = new SFSingletonManager(modelManager, syncManager);

syncManager.setKeyRequestHandler(async () => {
  return {
    offline: true
  };
})

describe("singletons", () => {
  it("only resolves to 1 item", async () => {
    await syncManager.loadLocalItems();

    let item1 = Factory.createItem();
    let item2 = Factory.createItem();
    item1.setDirty(true);
    item2.setDirty(true);
    modelManager.addItem(item1);
    modelManager.addItem(item2);

    let contentTypePredicate = new SFPredicate("content_type", "=", item1.content_type);
    singletonManager.registerSingleton([contentTypePredicate]);

    expect(modelManager.allItems.length).to.equal(2);

    await syncManager.sync();

    return new Promise((resolve, reject) => {
      setTimeout(function () {
        // Sync completion event is not dispatched in any particular order, so lets wait for everyone
        // to have had a fair chance to handle it

        // after sync, only 1 should remain
        expect(modelManager.allItems.length).to.equal(1);
        resolve();
      }, 100);
    })
  });


})
