import '../dist/regenerator.js';
import '../dist/sfjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import '../vendor/lodash/lodash.custom.js';

const DefaultMapping = {
  "Note" : Note,
  "Tag" : Tag
}
ModelManager.ContentTypeClassMapping = DefaultMapping;

chai.use(chaiAsPromised);
var expect = chai.expect;

const globalModelManager = new ModelManager();
const createModelManager = () => {
  return new ModelManager();
}

describe('app models', () => {

  const getParams = () => {
    var params = {
      content_type: "Note",
      content: {
        title: "hello",
        text: "world"
      }
    };
    return params;
  }

  const createItem = () => {
    return new Item(getParams());
  }

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
    Item.deepMerge(a, b);

    expect(a.content.references).to.eql([]);
  });

  it('modelManager should be defined', () => {
    expect(globalModelManager).to.not.be.null;
  });

  it('item should be defined', () => {
    expect(Item).to.not.be.null;
  });

  it('item content should be assigned', () => {
    var params = getParams();
    var item = new Item(params);
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

  it('creating and removing relationships between two items should have valid references', () => {
    let modelManager = createModelManager();
    var item1 = createItem();
    var item2 = createItem();
    modelManager.createRelationshipBetweenItems(item1, item2);
    expect(item1.content.references.length).to.equal(1);
    expect(item2.content.references.length).to.equal(1);

    modelManager.removeRelationshipBetweenItems(item1, item2);
    expect(item1.content.references.length).to.equal(0);
    expect(item2.content.references.length).to.equal(0);
  });

  it('properly handles uuid alternation', (done) => {
    let modelManager = createModelManager();
    var item1 = createItem();
    var item2 = createItem();
    modelManager.addItem(item1);
    modelManager.addItem(item2);
    modelManager.createRelationshipBetweenItems(item1, item2);

    modelManager.alternateUUIDForItem(item1, (alternatedItem) => {
      expect(item1.uuid).to.not.equal(alternatedItem.uuid);

      expect(item1.content.references.length).to.equal(0);
      expect(item2.content.references.length).to.equal(1);
      expect(alternatedItem.content.references.length).to.equal(1);

      expect(item1.hasRelationshipWithItem(item2)).to.equal(false);
      expect(item2.hasRelationshipWithItem(item1)).to.equal(false);

      expect(item2.hasRelationshipWithItem(alternatedItem)).to.equal(true);
      expect(alternatedItem.hasRelationshipWithItem(item2)).to.equal(true);
      done();
    })
  });

  it('creates and deletes basic relationships', () => {
    let modelManager = createModelManager();
    var item1 = createItem();
    var item2 = createItem();
    modelManager.createRelationshipBetweenItems(item1, item2);
    expect(item1.content.references.length).to.equal(1);
    expect(item2.content.references.length).to.equal(1);

    modelManager.removeRelationshipBetweenItems(item1, item2);
    expect(item1.content.references.length).to.equal(0);
    expect(item2.content.references.length).to.equal(0);
  });
});

describe("model manager mapping", () => {
  const getParams = () => {
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

  it('mapping nonexistent item creates it', () => {
    let modelManager = createModelManager();
    var params = getParams();
    modelManager.mapResponseItemsToLocalModels([params]);
    expect(modelManager.items.length).to.equal(1);
  });

  it('mapping nonexistent deleted item doesnt create it', () => {
    let modelManager = createModelManager();
    var params = getParams();
    params.deleted = true;
    modelManager.mapResponseItemsToLocalModels([params]);
    expect(modelManager.items.length).to.equal(0);
  });

  it('mapping and deleting nonexistent item creates and deletes it', () => {
    let modelManager = createModelManager();
    var params = getParams();
    modelManager.mapResponseItemsToLocalModels([params]);
    expect(modelManager.items.length).to.equal(1);

    params.deleted = true;
    modelManager.mapResponseItemsToLocalModels([params]);
    expect(modelManager.items.length).to.equal(0);
  });

  it('mapping deleted but dirty item should not delete it', () => {
    let modelManager = createModelManager();
    var params = getParams();
    modelManager.mapResponseItemsToLocalModels([params]);


    let item = modelManager.items[0];
    item.deleted = true;
    item.setDirty(true);
    modelManager.mapResponseItemsToLocalModels([item]);
    expect(modelManager.items.length).to.equal(1);
  });

  it('mapping existing item updates its properties', () => {
    let modelManager = createModelManager();
    var params = getParams();
    modelManager.mapResponseItemsToLocalModels([params]);

    var newTitle = "updated title";
    params.content.title = newTitle;
    modelManager.mapResponseItemsToLocalModels([params]);
    let item = modelManager.items[0];

    expect(item.content.title).to.equal(newTitle);
  });
})

describe("notes and tags", () => {
  const getNoteParams = () => {
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

  const createRelatedNoteTagPair = () => {
    let noteParams = getNoteParams();
    let tagParams = {
      uuid: SFJS.crypto.generateUUIDSync(),
      content_type: "Tag",
      content: {
        title: "thoughts",
      }
    };
    noteParams.content.references = [
      {
        uuid: tagParams.uuid,
        content_type: tagParams.content_type
      }
    ]

    tagParams.content.references = [
      {
        uuid: noteParams.uuid,
        content_type: noteParams.content_type
      }
    ]

    return [noteParams, tagParams];
  }

  it('uses proper class for note', () => {
    let modelManager = createModelManager();
    let noteParams = getNoteParams();
    modelManager.mapResponseItemsToLocalModels([noteParams]);
    let note = modelManager.allItemsMatchingTypes(["Note"])[0];
    expect(note).to.be.an.instanceOf(Note);
  });

  it('creates two-way relationship between note and tag', () => {
    let modelManager = createModelManager();

    let pair = createRelatedNoteTagPair();
    let noteParams = pair[0];
    let tagParams = pair[1];

    expect(tagParams.content.references.length).to.equal(1);
    expect(tagParams.content.references.length).to.equal(1);

    modelManager.mapResponseItemsToLocalModels([noteParams, tagParams]);
    let note = modelManager.allItemsMatchingTypes(["Note"])[0];
    let tag = modelManager.allItemsMatchingTypes(["Tag"])[0];

    expect(note).to.not.be.null;
    expect(tag).to.not.be.null;

    expect(note.content.references.length).to.equal(1);
    expect(tag.content.references.length).to.equal(1);

    expect(note.tags.length).to.equal(1);
    expect(tag.notes.length).to.equal(1);

    modelManager.setItemToBeDeleted(note);
    expect(note.tags.length).to.equal(0);
    expect(tag.notes.length).to.equal(0);
  });

  it('handles remote deletion of relationship', () => {
    let modelManager = createModelManager();

    let pair = createRelatedNoteTagPair();
    let noteParams = pair[0];
    let tagParams = pair[1];

    modelManager.mapResponseItemsToLocalModels([noteParams, tagParams]);
    let note = modelManager.allItemsMatchingTypes(["Note"])[0];
    let tag = modelManager.allItemsMatchingTypes(["Tag"])[0];

    expect(note.content.references.length).to.equal(1);
    expect(tag.content.references.length).to.equal(1);

    noteParams.content.references = [];
    modelManager.mapResponseItemsToLocalModels([noteParams]);

    expect(note.content.references.length).to.equal(0);
    expect(note.tags.length).to.equal(0);
    expect(tag.notes.length).to.equal(0);
  });
});
