import '../dist/regenerator.js';
import '../dist/sfjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import '../vendor/lodash/lodash.custom.js';
import Factory from './lib/factory.js';

SFItem.AppDomain = "org.standardnotes.sn";

chai.use(chaiAsPromised);
var expect = chai.expect;

const globalModelManager = new SFModelManager();
const createModelManager = () => {
  return new SFModelManager();
}

const createItemParams = () => {
  var params = {
    uuid: SFJS.crypto.generateUUIDSync(),
    content_type: "Note",
    content: {
      title: "hello",
      text: "world"
    }
  };
  return params;
}

const createItem = () => {
  return new SFItem(createItemParams());
}

describe('app models', () => {
  var createdItem;

  it('lodash should be defined', () => {
    expect(_).to.not.be.null;
  });

  it('lodash merge should behave as expected', () => {
    var a = {
      content: {
        references: [{a: "a"}]
      }
    }

    var b = {
      content: {
        references: [ ]
      }
    }

    // merging a with b should replace total content
    SFItem.deepMerge(a, b);

    expect(a.content.references).to.eql([]);
  });

  it('modelManager should be defined', () => {
    expect(globalModelManager).to.not.be.null;
  });

  it('item should be defined', () => {
    expect(SFItem).to.not.be.null;
  });

  it('item content should be assigned', () => {
    var params = createItemParams();
    var item = new SFItem(params);
    expect(item.content.title).to.equal(params.content.title);
  });

  it('adding item to modelmanager should add it to its items', () => {
    createdItem = createItem();
    globalModelManager.addItem(createdItem);
    expect(globalModelManager.items.length).to.equal(1);
    expect(globalModelManager.allItems.length).to.equal(1);
    expect(globalModelManager.allItemsMatchingTypes([createdItem.content_type]).length).to.equal(1);
    expect(globalModelManager.validItemsForContentType([createdItem.content_type]).length).to.equal(1);
  });

  it('find added item', () => {
    var result = globalModelManager.findItem(createdItem.uuid);
    expect(result.uuid).to.equal(createdItem.uuid);
  });

  it('removing item from modelmanager should remove it from its items', () => {
    globalModelManager.removeItemLocally(createdItem);
    expect(globalModelManager.items.length).to.equal(0);
  });

  it('handles delayed mapping', () => {
    let modelManager = createModelManager();
    var params1 = createItem();
    var params2 = createItem();

    params1.content.references = [{uuid: params2.uuid, content_type: params2.content_type}];

    expect(params1.content.references.length).to.equal(1);
    expect(params2.content.references.length).to.equal(0);

    modelManager.mapResponseItemsToLocalModels([params1]);
    modelManager.mapResponseItemsToLocalModels([params2]);

    var item1 = modelManager.findItem(params1.uuid);
    var item2 = modelManager.findItem(params2.uuid);

    expect(item1.referencingObjects.length).to.equal(0);
    expect(item2.referencingObjects.length).to.equal(1);
  });

  it('mapping item without uuid should not map it', () => {
    let modelManager = createModelManager();
    var params1 = createItem();
    params1.uuid = null;

    modelManager.mapResponseItemsToLocalModels([params1]);
    expect(modelManager.allItems.length).to.equal(0);
  });

  it('mapping an item twice shouldnt cause problems', () => {
    let modelManager = createModelManager();
    var params1 = createItem();
    params1.content.foo = "bar";

    let items = modelManager.mapResponseItemsToLocalModels([params1]);
    let item = items[0];
    expect(item).to.not.be.null;

    items = modelManager.mapResponseItemsToLocalModels([item]);
    item = items[0];

    expect(item.content.foo).to.equal("bar");
  });

  it('fixes relationship integrity', () => {
    let modelManager = createModelManager();
    var item1 = createItem();
    var item2 = createItem();

    item1.addItemAsRelationship(item2);
    item2.addItemAsRelationship(item1);

    expect(item1.content.references.length).to.equal(1);
    expect(item2.content.references.length).to.equal(1);

    // damage references of one object
    item1.content.references = [];
    modelManager.mapResponseItemsToLocalModels([item1]);

    expect(item1.content.references.length).to.equal(0);
    expect(item2.content.references.length).to.equal(1);
  });

  it('creating and removing relationships between two items should have valid references', () => {
    let modelManager = createModelManager();
    var item1 = createItem();
    var item2 = createItem();
    item1.addItemAsRelationship(item2);
    item2.addItemAsRelationship(item1);

    expect(item1.content.references.length).to.equal(1);
    expect(item2.content.references.length).to.equal(1);

    expect(item1.referencingObjects).to.include(item2);
    expect(item2.referencingObjects).to.include(item1);

    item1.removeItemAsRelationship(item2);
    item2.removeItemAsRelationship(item1);

    expect(item1.content.references.length).to.equal(0);
    expect(item2.content.references.length).to.equal(0);

    expect(item1.referencingObjects.length).to.equal(0);
    expect(item2.referencingObjects.length).to.equal(0);
  });

  it('notifies observers of item uuid alternation', async () => {
    let modelManager = createModelManager();
    var originalItem1 = createItem();

    return new Promise((resolve, reject) => {
      modelManager.addModelUuidChangeObserver("test", (oldItem, newItem) => {
        expect(oldItem.uuid).to.not.equal(newItem.uuid);
        resolve();
      })

      modelManager.alternateUUIDForItem(originalItem1);
    })
  });

  it('properly duplicates item', async () => {
    let modelManager = createModelManager();
    var originalItem1 = createItem();
    originalItem1.setAppDataItem("locked", true);
    var originalItem2 = createItem();
    originalItem1.addItemAsRelationship(originalItem2);

    expect(originalItem2.referencingObjects.length).to.equal(1);

    let duplicate = modelManager.duplicateItem(originalItem1);

    expect(originalItem1.isItemContentEqualWith(duplicate)).to.equal(true);
    expect(originalItem1.created_at).to.equal(duplicate.created_at);
    expect(originalItem1.content_type).to.equal(duplicate.content_type);
    expect(duplicate.content.references.length).to.equal(1);
    expect(originalItem2.referencingObjects.length).to.equal(1);
  });

  it('properly handles single item uuid alternation', async () => {
    let modelManager = createModelManager();
    var originalItem1 = createItem();
    var originalItem2 = createItem();
    modelManager.addItem(originalItem1);
    modelManager.addItem(originalItem2);

    originalItem1.addItemAsRelationship(originalItem2);
    originalItem2.addItemAsRelationship(originalItem1);

    expect(originalItem1.referencingObjects.length).to.equal(1);
    expect(originalItem2.referencingObjects.length).to.equal(1);

    let alternatedItem1 = await modelManager.alternateUUIDForItem(originalItem1);

    expect(modelManager.allItems.length).to.equal(2);

    expect(originalItem1.uuid).to.not.equal(alternatedItem1.uuid);
    expect(alternatedItem1.uuid).to.equal(alternatedItem1.uuid);

    expect(alternatedItem1.content.references.length).to.equal(1);
    expect(originalItem2.content.references.length).to.equal(1);
    expect(alternatedItem1.content.references.length).to.equal(1);

    expect(alternatedItem1.referencingObjects.length).to.equal(1);
    expect(originalItem2.referencingObjects.length).to.equal(1);

    expect(alternatedItem1.hasRelationshipWithItem(originalItem2)).to.equal(true);
    expect(originalItem2.hasRelationshipWithItem(alternatedItem1)).to.equal(true);

    expect(originalItem2.hasRelationshipWithItem(alternatedItem1)).to.equal(true);
    expect(alternatedItem1.hasRelationshipWithItem(originalItem2)).to.equal(true);

    expect(alternatedItem1.dirty).to.equal(true);
  });

  it('properly handles mutli item uuid alternation', async () => {
    let modelManager = createModelManager();
    var originalItem1 = createItem();
    var originalItem2 = createItem();
    modelManager.addItem(originalItem1);
    modelManager.addItem(originalItem2);

    originalItem1.addItemAsRelationship(originalItem2);

    expect(originalItem2.referencingObjects.length).to.equal(1);

    var alternatedItem1 = await modelManager.alternateUUIDForItem(originalItem1);
    var alternatedItem2 = await modelManager.alternateUUIDForItem(originalItem2);

    expect(modelManager.allItems.length).to.equal(2);

    expect(originalItem1.uuid).to.not.equal(alternatedItem1.uuid);
    expect(originalItem2.uuid).to.not.equal(alternatedItem2.uuid);

    expect(alternatedItem1.content.references.length).to.equal(1);
    expect(alternatedItem1.content.references[0].uuid).to.equal(alternatedItem2.uuid);
    expect(alternatedItem2.content.references.length).to.equal(0);

    expect(alternatedItem2.referencingObjects.length).to.equal(1);

    expect(alternatedItem1.hasRelationshipWithItem(alternatedItem2)).to.equal(true);
    expect(alternatedItem2.hasRelationshipWithItem(alternatedItem1)).to.equal(false);
    expect(alternatedItem1.dirty).to.equal(true);
  });

  it('maintains referencing relationships when duplicating', async () => {
    let modelManager = createModelManager();
    var tag = createItem();
    var note = createItem();
    modelManager.addItem(tag);
    modelManager.addItem(note);

    tag.addItemAsRelationship(note);

    expect(tag.content.references.length).to.equal(1);

    var noteCopy = modelManager.duplicateItem(note);

    expect(modelManager.allItems.length).to.equal(3);
    expect(note.uuid).to.not.equal(noteCopy.uuid);

    expect(note.content.references.length).to.equal(0);
    expect(noteCopy.content.references.length).to.equal(0);
    expect(tag.content.references.length).to.equal(2);
  });
});

describe("mapping performance", () => {

  it("shouldn't take a long time", () => {
    /*
      There was an issue with mapping where we were using arrays for everything instead of hashes (like items, missedReferences),
      which caused searching to be really expensive and caused a huge slowdown.
    */
    let modelManager = createModelManager();

    // create a bunch of notes and tags, and make sure mapping doesn't take a long time
    const noteCount = 1500;
    const tagCount = 10;
    var tags = [], notes = [];
    for(var i = 0; i < tagCount; i++) {
      var tag = {
        uuid: SFJS.crypto.generateUUIDSync(),
        content_type: "Tag",
        content: {
          title: `${Math.random()}`,
          references: []
        }
      }
      tags.push(tag);
    }

    for(var i = 0; i < noteCount; i++) {
      var note = {
        uuid: SFJS.crypto.generateUUIDSync(),
        content_type: "Note",
        content: {
          title: `${Math.random()}`,
          text: `${Math.random()}`,
          references: []
        }
      }

      var randomTag = Factory.randomArrayValue(tags);

      randomTag.content.references.push(
        {
          content_type: "Note",
          uuid: note.uuid
        }
      )
      notes.push(note);
    }

    var items = Factory.shuffleArray(tags.concat(notes));

    var t0 = performance.now();
    // process items in separate batches, so as to trigger missed references
    var currentIndex = 0;
    var batchSize = 100;
    for(var i = 0; i < items.length; i += batchSize) {
      var subArray = items.slice(currentIndex, currentIndex + batchSize);
      modelManager.mapResponseItemsToLocalModels(subArray);
      currentIndex += batchSize;
    }

    var t1 = performance.now();
    var seconds = (t1 - t0) / 1000;
    const expectedRunTime = 3; // seconds
    expect(seconds).to.be.at.most(expectedRunTime);

    for(let note of modelManager.validItemsForContentType("Note")) {
      expect(note.referencingObjects.length).to.be.above(0);
    }
  }).timeout(20000);

  it("mapping a tag with thousands of notes should be quick", () => {
    /*
      There was an issue where if you have a tag with thousands of notes, it will take minutes to resolve.
      Fixed now. The issue was that we were looping around too much. I've consolidated some of the loops
      so that things require less loops in modelManager, regarding missedReferences.
    */
    let modelManager = createModelManager();

    const noteCount = 10000;
    var notes = [];

    var tag = {
      uuid: SFJS.crypto.generateUUIDSync(),
      content_type: "Tag",
      content: {
        title: `${Math.random()}`,
        references: []
      }
    }

    for(var i = 0; i < noteCount; i++) {
      var note = {
        uuid: SFJS.crypto.generateUUIDSync(),
        content_type: "Note",
        content: {
          title: `${Math.random()}`,
          text: `${Math.random()}`,
          references: []
        }
      }

      tag.content.references.push({
        content_type: "Note",
        uuid: note.uuid
      })
      notes.push(note);
    }

    var items = [tag].concat(notes);

    var t0 = performance.now();
    // process items in separate batches, so as to trigger missed references
    var currentIndex = 0;
    var batchSize = 100;
    for(var i = 0; i < items.length; i += batchSize) {
      var subArray = items.slice(currentIndex, currentIndex + batchSize);
      modelManager.mapResponseItemsToLocalModels(subArray);
      currentIndex += batchSize;
    }

    var t1 = performance.now();
    var seconds = (t1 - t0) / 1000;
    const expectedRunTime = 3; // seconds
    expect(seconds).to.be.at.most(expectedRunTime);

    let mappedTag = modelManager.validItemsForContentType("Tag")[0];
    for(let note of modelManager.validItemsForContentType("Note")) {
      expect(note.referencingObjects.length).to.equal(1);
      expect(note.referencingObjects[0]).to.equal(mappedTag);
    }

  }).timeout(20000);
})

describe("model manager mapping", () => {
  it('mapping nonexistent item creates it', () => {
    let modelManager = createModelManager();
    var params = createItemParams();
    modelManager.mapResponseItemsToLocalModels([params]);
    expect(modelManager.items.length).to.equal(1);
  });

  it('mapping string content correctly parses it', () => {
    let modelManager = createModelManager();
    var params = createItemParams();
    let originalTitle = params.content.title;
    params.content = JSON.stringify(params.content);
    modelManager.mapResponseItemsToLocalModels([params]);
    var item = modelManager.items[0];
    expect(params.content.title).to.not.be.a('string');
    expect(item.content.title).to.be.a('string');
    expect(item.content.title).to.equal(originalTitle);
  });

  it('mapping nonexistent deleted item doesnt create it', () => {
    let modelManager = createModelManager();
    var params = createItemParams();
    params.deleted = true;
    modelManager.mapResponseItemsToLocalModels([params]);
    expect(modelManager.items.length).to.equal(0);
  });

  it('mapping and deleting nonexistent item creates and deletes it', () => {
    let modelManager = createModelManager();
    var params = createItemParams();
    modelManager.mapResponseItemsToLocalModels([params]);
    expect(modelManager.items.length).to.equal(1);

    params.deleted = true;
    modelManager.mapResponseItemsToLocalModels([params]);
    expect(modelManager.items.length).to.equal(0);
  });

  it('mapping deleted but dirty item should not delete it', () => {
    let modelManager = createModelManager();
    var params = createItemParams();
    modelManager.mapResponseItemsToLocalModels([params]);

    let item = modelManager.items[0];
    item.deleted = true;
    item.setDirty(true);
    modelManager.mapResponseItemsToLocalModels([item]);
    expect(modelManager.items.length).to.equal(1);
  });

  it('mapping existing item updates its properties', () => {
    let modelManager = createModelManager();
    var params = createItemParams();
    modelManager.mapResponseItemsToLocalModels([params]);

    var newTitle = "updated title";
    params.content.title = newTitle;
    modelManager.mapResponseItemsToLocalModels([params]);
    let item = modelManager.items[0];

    expect(item.content.title).to.equal(newTitle);
  });

  it('setting an item dirty should retrieve it in dirty items', () => {
    let modelManager = createModelManager();
    var params = createItemParams();
    modelManager.mapResponseItemsToLocalModels([params]);
    let item = modelManager.items[0];
    item.setDirty(true);
    let dirtyItems = modelManager.getDirtyItems();
    expect(dirtyItems.length).to.equal(1);
  });

  it('clearing dirty items should return no items', () => {
    let modelManager = createModelManager();
    var params = createItemParams();
    modelManager.mapResponseItemsToLocalModels([params]);
    let item = modelManager.items[0];
    item.setDirty(true);
    let dirtyItems = modelManager.getDirtyItems();
    expect(dirtyItems.length).to.equal(1);

    modelManager.clearDirtyItems(dirtyItems);
    expect(modelManager.getDirtyItems().length).to.equal(0);
  });

  it('set all items dirty', () => {
    let modelManager = createModelManager();
    let count = 10;
    var items = [];
    for(var i = 0; i < count; i++) {
      items.push(createItemParams());
    }
    modelManager.mapResponseItemsToLocalModels(items);
    modelManager.setAllItemsDirty();

    let dirtyItems = modelManager.getDirtyItems();
    expect(dirtyItems.length).to.equal(10);
  });

  it('sync observers should be notified of changes', (done) => {
    let modelManager = createModelManager();
    var params = createItemParams();
    modelManager.mapResponseItemsToLocalModels([params]);
    let item = modelManager.items[0];
    modelManager.addItemSyncObserver("test", "*", (items, validItems, deletedItems, source, sourceKey) => {
      expect(items[0].uuid == item.uuid);
      done();
    })
    modelManager.mapResponseItemsToLocalModels([params]);
  });
})

describe("items", () => {
  it('item content should equal item contentObject', () => {
    let modelManager = createModelManager();
    var item1 = createItem();
    var item2 = createItem();
    item1.addItemAsRelationship(item2);
    item2.addItemAsRelationship(item1);

    expect(item1.content).to.equal(item1.contentObject);

    item1.content.foo = "bar";

    expect(item1.content).to.equal(item1.contentObject);
  });

  it('setting an item as dirty should update its client updated at', (done) => {
    let modelManager = createModelManager();
    var params = createItemParams();
    modelManager.mapResponseItemsToLocalModels([params]);
    let item = modelManager.items[0];
    var prevDate = item.client_updated_at.getTime();
    setTimeout(function () {
      item.setDirty(true);
      var newDate = item.client_updated_at.getTime();
      expect(prevDate).to.not.equal(newDate);
      done();
    }, 100);
  });

  it('setting an item as dirty with option to skip client updated at', (done) => {
    let modelManager = createModelManager();
    var params = createItemParams();
    modelManager.mapResponseItemsToLocalModels([params]);
    let item = modelManager.items[0];
    var prevDate = item.client_updated_at.getTime();
    setTimeout(function () {
      item.setDirty(true, true /* dontUpdateClientDate */);
      var newDate = item.client_updated_at.getTime();
      expect(prevDate).to.equal(newDate);
      done();
    }, 100);
  });

  it('properly pins, archives, and locks', () => {
    let modelManager = createModelManager();
    var params = createItemParams();
    modelManager.mapResponseItemsToLocalModels([params]);

    let item = modelManager.items[0];
    expect(item.pinned).to.not.be.ok;

    item.setAppDataItem("pinned", true);
    expect(item.pinned).to.equal(true);

    item.setAppDataItem("archived", true);
    expect(item.archived).to.equal(true);

    item.setAppDataItem("locked", true);
    expect(item.locked).to.equal(true);
  });

  it('properly compares item equality', () => {
    let modelManager = createModelManager();
    var params1 = createItemParams();
    var params2 = createItemParams();
    modelManager.mapResponseItemsToLocalModels([params1, params2]);

    let item1 = modelManager.items[0];
    let item2 = modelManager.items[1];

    expect(item1.isItemContentEqualWith(item2)).to.equal(true);

    // items should ignore this field when checking for equality
    item1.client_updated_at = new Date();
    item2.client_updated_at = null;

    expect(item1.isItemContentEqualWith(item2)).to.equal(true);

    item1.content.foo = "bar";

    expect(item1.isItemContentEqualWith(item2)).to.equal(false);

    item2.content.foo = "bar";

    expect(item1.isItemContentEqualWith(item2)).to.equal(true);
    expect(item2.isItemContentEqualWith(item1)).to.equal(true);

    item1.addItemAsRelationship(item2);
    item2.addItemAsRelationship(item1);

    expect(item1.content.references.length).to.equal(1);
    expect(item2.content.references.length).to.equal(1);

    expect(item1.isItemContentEqualWith(item2)).to.equal(false);

    item1.removeItemAsRelationship(item2);
    item2.removeItemAsRelationship(item1);

    expect(item1.isItemContentEqualWith(item2)).to.equal(true);
    expect(item1.content.references.length).to.equal(0);
    expect(item2.content.references.length).to.equal(0);
  });

  it('content equality should not have side effects', () => {
    let modelManager = createModelManager();
    var params1 = createItemParams();
    var params2 = createItemParams();
    modelManager.mapResponseItemsToLocalModels([params1, params2]);

    let item1 = modelManager.items[0];
    let item2 = modelManager.items[1];

    item1.content.foo = "bar";
    expect(item1.content.foo).to.equal("bar");

    item1.keysToIgnoreWhenCheckingContentEquality = () => {
      return ["foo"];
    }

    item2.keysToIgnoreWhenCheckingContentEquality = () => {
      return ["foo"];
    }

    // calling isItemContentEqualWith should not have side effects
    // There was an issue where calling that function would modify values directly to omit keys
    // in keysToIgnoreWhenCheckingContentEquality.

    item1.setDirty(true);
    item2.setDirty(true);

    expect(item1.getAppDataItem("client_updated_at")).to.be.ok;
    expect(item2.getAppDataItem("client_updated_at")).to.be.ok;

    expect(item1.isItemContentEqualWith(item2)).to.equal(true);
    expect(item2.isItemContentEqualWith(item1)).to.equal(true);

    expect(item1.getAppDataItem("client_updated_at")).to.be.ok;
    expect(item2.getAppDataItem("client_updated_at")).to.be.ok;

    expect(item1.content.foo).to.equal("bar");
  })
})
