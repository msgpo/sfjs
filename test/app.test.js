import '../dist/regenerator.js';
import '../dist/sfjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import '../vendor/lodash/lodash.custom.js';

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

    // relatedObjects was only temporarily enabled for items to test this case.
    // expect(item1.relatedObjects.length).to.equal(1);
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

    item1.removeItemAsRelationship(item2);
    item2.removeItemAsRelationship(item1);

    expect(item1.content.references.length).to.equal(0);
    expect(item2.content.references.length).to.equal(0);
  });

  it('properly handles uuid alternation', (done) => {
    let modelManager = createModelManager();
    var item1 = createItem();
    var item2 = createItem();
    modelManager.addItem(item1);
    modelManager.addItem(item2);

    item1.addItemAsRelationship(item2);
    item2.addItemAsRelationship(item1);

    modelManager.alternateUUIDForItem(item1, (alternatedItem) => {
      expect(item1.uuid).to.not.equal(alternatedItem.uuid);

      expect(item1.content.references.length).to.equal(0);
      expect(item2.content.references.length).to.equal(1);
      expect(alternatedItem.content.references.length).to.equal(1);

      expect(item1.hasRelationshipWithItem(item2)).to.equal(false);
      expect(item2.hasRelationshipWithItem(item1)).to.equal(false);

      expect(item2.hasRelationshipWithItem(alternatedItem)).to.equal(true);
      expect(alternatedItem.hasRelationshipWithItem(item2)).to.equal(true);

      expect(item1.dirty).to.equal(true);
      expect(alternatedItem.dirty).to.equal(true);
      expect(item2.dirty).to.equal(true);

      done();
    })
  });
});

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
})
