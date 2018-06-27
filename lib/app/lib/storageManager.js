// SFStorageManager should be subclassed, and all the methods below overwritten.

export class SFStorageManager {

  /* Simple Key/Value Storage */

  setItem(key, value, vaultKey) {

  }

  getItem(key, vault) {

  }

  removeItem(key, vault) {

  }

  clear() {
    // clear only simple key/values
  }

  /*
  Model Storage
  */

  getAllModels(callback) {

  }

  saveModel(item) {
    this.saveModels([item]);
  }

  saveModels(items, onsuccess, onerror) {

  }

  deleteModel(item, callback) {

  }

  clearAllModels(callback) {
    // clear only models
  }

  /* General */

  clearAllData(callback) {
    this.clear();
    this.clearAllModels(callback);
  }
}
