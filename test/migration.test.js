import '../dist/regenerator.js';
import '../dist/sfjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import '../vendor/lodash/lodash.custom.js';
import Factory from './lib/factory.js';

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('migrations', () => {
  var email = Factory.globalStandardFile().crypto.generateUUIDSync();
  var password = Factory.globalStandardFile().crypto.generateUUIDSync();

  before((done) => {
    Factory.globalStorageManager().clearAllData().then(() => {
      Factory.newRegisteredUser(email, password).then((user) => {
        done();
      })
    })
  })

  let authManager = Factory.globalAuthManager();
  let modelManager = Factory.createModelManager();
  modelManager.addItem(Factory.createItem());
  let syncManager = new SFSyncManager(modelManager, Factory.globalStorageManager(), Factory.globalHttpManager());

  syncManager.setKeyRequestHandler(async () => {
    return {
      keys: await authManager.keys(),
      auth_params: await authManager.getAuthParams(),
      offline: false
    };
  })

  let migrationManager = new SFMigrationManager(modelManager, syncManager, Factory.globalStorageManager());

  it("should not run migrations until local data loading and sync is complete", async () => {
    migrationManager.registeredMigrations = () => {
      return [
        {
          name: "migration-1",
          content_type: "Note",
          handler: (items) => {
            for(var item of items) {
              item.content.foo = "bar";
            }
          }
        }
      ]
    }

    var item = modelManager.allItems[0];
    expect(item.content.foo).to.not.equal("bar");

    migrationManager.loadMigrations();

    await syncManager.sync();
    var pending = await migrationManager.getPendingMigrations();
    var completed = await migrationManager.getCompletedMigrations();
    expect(pending.length).to.equal(1);
    expect(completed.length).to.equal(0);

    await syncManager.loadLocalItems();
    // should be completed now
    var pending = await migrationManager.getPendingMigrations();
    var completed = await migrationManager.getCompletedMigrations();
    expect(pending.length).to.equal(0);
    expect(completed.length).to.equal(1);

    var item = modelManager.allItems[0];
    expect(item.content.foo).to.equal("bar");
  })

  it("should handle running multiple migrations", async () => {
    let randValue1 = Math.random();
    let randValue2 = Math.random();
    migrationManager.registeredMigrations = () => {
      return [
        {
          name: "migration-2",
          content_type: "Note",
          handler: (items) => {
            for(var item of items) {
              item.content.bar = randValue1;
            }
          }
        },
        {
          name: "migration-3",
          content_type: "Note",
          handler: (items) => {
            for(var item of items) {
              item.content.foo = randValue2;
            }
          }
        },
      ]
    }

    migrationManager.loadMigrations();

    var item = modelManager.allItems[0];
    expect(item.content.bar).to.not.equal(randValue1);
    expect(item.content.foo).to.not.equal(randValue2);

    await syncManager.loadLocalItems();
    await syncManager.sync();

    expect(item.content.bar).to.equal(randValue1);
    expect(item.content.foo).to.equal(randValue2);
  })


});
