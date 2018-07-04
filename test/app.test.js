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

    expect(item1.referencingObjects.length).to.equal(0);
    expect(item2.referencingObjects.length).to.equal(1);
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

  it('properly handles uuid alternation', () => {
    let modelManager = createModelManager();
    var originalItem1 = createItem();
    var originalItem2 = createItem();
    modelManager.addItem(originalItem1);
    modelManager.addItem(originalItem2);

    originalItem1.addItemAsRelationship(originalItem2);
    originalItem2.addItemAsRelationship(originalItem1);

    return expect(modelManager.alternateUUIDForItem(originalItem1)).to.be.fulfilled.then(async (alternatedItem1) => {

      expect(modelManager.allItems.length).to.equal(2);

      // item 1 now is at the end of the array
      var item1 = modelManager.allItems[1];
      var item2 = modelManager.allItems[0];

      expect(originalItem1.uuid).to.not.equal(alternatedItem1.uuid);
      expect(item1.uuid).to.equal(alternatedItem1.uuid);

      expect(item1.content.references.length).to.equal(1);
      expect(item2.content.references.length).to.equal(1);
      expect(alternatedItem1.content.references.length).to.equal(1);

      expect(item1.hasRelationshipWithItem(item2)).to.equal(true);
      expect(item2.hasRelationshipWithItem(item1)).to.equal(true);

      expect(item2.hasRelationshipWithItem(alternatedItem1)).to.equal(true);
      expect(alternatedItem1.hasRelationshipWithItem(item2)).to.equal(true);

      expect(alternatedItem1.dirty).to.equal(true);
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

  it.only('item predicate matching', () => {
    let item = new SFItem({
      content_type: "Item",
      content: {
        title: "Hello",
        desc: "World",
        tags: ["1", "2", "3"]
      },
    })

    expect(item.satisfiesPredicate(new SFPredicate("content_type", "=", "Foo"))).to.equal(false);
    expect(item.satisfiesPredicate(new SFPredicate("content_type", "=", "Item"))).to.equal(true);

    expect(item.satisfiesPredicate(new SFPredicate("content.title", "=", "Foo"))).to.equal(false);
    expect(item.satisfiesPredicate(new SFPredicate("content.title", "=", "Hello"))).to.equal(true);

    expect(item.satisfiesPredicate(new SFPredicate("content.tags", "=", ["1"]))).to.equal(false);
    expect(item.satisfiesPredicate(new SFPredicate("content.tags", "=", ["1", "2", "3"]))).to.equal(true);
  });

  it.only('model manager predicate matching', () => {
    let modelManager = createModelManager();
    let item = new SFItem({
      content_type: "Item",
      content: {
        title: "Hello",
        desc: "World",
        tags: ["1", "2", "3"]
      },
      updated_at:  new Date()
    })

    modelManager.addItem(item);
    var predicate = new SFPredicate("content.title", "=", "ello");
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(0);

    predicate.keypath = "content.desc";
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(0);

    predicate.keypath = "content.title";
    predicate.value = "Hello";
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(1);

    predicate.keypath = "content.tags.length";
    predicate.value = 2;
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(0);

    predicate.value = 3;
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(1);

    predicate.operator = "<";
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(0);

    predicate.operator = "<=";
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(1);

    predicate.operator = ">";
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(0);

    predicate.keypath = "updated_at";
    predicate.operator = ">"
    var date = new Date();
    date.setSeconds(date.getSeconds() + 1);
    predicate.value = date;
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(0);

    predicate.operator = "<"
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(1);

    // multi matching
    var predicate1 = new SFPredicate("content_type", "=", "Item");
    var predicate2 = new SFPredicate("content.title", "=", "SHello");
    expect(modelManager.itemsMatchingPredicates([predicate1, predicate2]).length).to.equal(0);

    var predicate1 = new SFPredicate("content_type", "=", "Item");
    var predicate2 = new SFPredicate("content.title", "=", "Hello");
    expect(modelManager.itemsMatchingPredicates([predicate1, predicate2]).length).to.equal(1);
  });


})
