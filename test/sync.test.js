import '../dist/regenerator.js';
import '../dist/sfjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import '../vendor/lodash/lodash.custom.js';

const sf_default = new StandardFile();

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

describe('syncing', () => {

  var _identifier = "hello@test.com";
  var _password = "password";
  var _authParams, _keys;

  before((done) => {
    // runs once before all tests in this block
    sf_default.crypto.generateInitialKeysAndAuthParamsForUser(_identifier, _password).then((result) => {
      _authParams = result.authParams;
      _keys = result.keys;
      done();
    })
  });

  it("returns valid encrypted params for syncing", async () => {
    var item = createItem();
    var itemParams = await new SFItemParams(item, _keys).paramsForSync();
    expect(itemParams.enc_item_key).to.not.be.null;
    expect(itemParams.uuid).to.not.be.null;
    expect(itemParams.auth_hash).to.be.null;
    expect(itemParams.content_type).to.not.be.null;
    expect(itemParams.created_at).to.not.be.null;
    expect(itemParams.content).to.satisfy((string) => {
      return string.startsWith(sf_default.version());
    });
  });

  it("returns unencrypted params with no keys", async () => {
    var item = createItem();
    var itemParams = await new SFItemParams(item, null).paramsForSync();
    expect(itemParams.enc_item_key).to.be.null;
    expect(itemParams.auth_hash).to.be.null;
    expect(itemParams.uuid).to.not.be.null;
    expect(itemParams.content_type).to.not.be.null;
    expect(itemParams.created_at).to.not.be.null;
    expect(itemParams.content).to.satisfy((string) => {
      return string.startsWith("000");
    });
  });

  it("returns additional fields for local storage", async () => {
    var item = createItem();
    var itemParams = await new SFItemParams(item, _keys).paramsForLocalStorage();
    expect(itemParams.enc_item_key).to.not.be.null;
    expect(itemParams.auth_hash).to.be.null;
    expect(itemParams.uuid).to.not.be.null;
    expect(itemParams.content_type).to.not.be.null;
    expect(itemParams.created_at).to.not.be.null;
    expect(itemParams.updated_at).to.not.be.null;
    expect(itemParams.deleted).to.not.be.null;
    expect(itemParams.errorDecrypting).to.not.be.null;
    expect(itemParams.content).to.satisfy((string) => {
      return string.startsWith(sf_default.version());
    });
  });

  it("omits deleted for export file", async () => {
    var item = createItem();
    var itemParams = await new SFItemParams(item, _keys).paramsForExportFile();
    expect(itemParams.enc_item_key).to.not.be.null;
    expect(itemParams.uuid).to.not.be.null;
    expect(itemParams.content_type).to.not.be.null;
    expect(itemParams.created_at).to.not.be.null;
    expect(itemParams.deleted).to.not.be.ok;
    expect(itemParams.content).to.satisfy((string) => {
      return string.startsWith(sf_default.version());
    });
  });

  it("items with error decrypting should remain as is", async () => {
    var item = createItem();
    item.errorDecrypting = true;
    var itemParams = await new SFItemParams(item, _keys).paramsForSync();
    expect(itemParams.content).to.eql(item.content);
    expect(itemParams.enc_item_key).to.not.be.null;
    expect(itemParams.uuid).to.not.be.null;
    expect(itemParams.content_type).to.not.be.null;
    expect(itemParams.created_at).to.not.be.null;
  });


});
