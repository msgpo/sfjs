export class SFMigrationManager {

  constructor(modelManager, syncManager, storageManager) {
    this.modelManager = modelManager;
    this.syncManager = syncManager;
    this.storageManager = storageManager;

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
            // If initial online sync, clear any completed migrations that occurred while offline, so they can run again now
            // that we have updated user items.
            await this.clearCompletedMigrations();
          }
          this.runPendingMigrations();
        }
      }
    })
  }

  async clearCompletedMigrations() {
    var completed = await this.getCompletedMigrations();
    completed.length = 0;
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
      if(migration.items && migration.items.length > 0) {
        this.runMigration(migration, migration.items);
      } else {
        this.markMigrationCompleted(migration);
      }
    }
  }

  encode(text) {
    return window.btoa(text);
  }

  decode(text) {
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
    return this.migrations.filter((migration) => {
      // if the name is not found in completed, then it is pending.
      return completed.indexOf(this.encode(migration.name)) == -1;
    })
  }

  async markMigrationCompleted(migration) {
    var completed = await this.getCompletedMigrations();
    completed.push(this.encode(migration.name));
    this.storageManager.setItem("migrations", JSON.stringify(completed));
  }

  async runMigration(migration, items) {
    console.log("Running migration:", migration.name);
    migration.handler(items);
    this.markMigrationCompleted(migration);
  }
}
