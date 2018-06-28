import '../dist/regenerator.js';
import '../dist/sfjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import '../vendor/lodash/lodash.custom.js';
import Factory from './lib/factory.js';

chai.use(chaiAsPromised);
var expect = chai.expect;

describe("basic auth", () => {
  let url = "http://localhost:3000";
  let email = Factory.globalStandardFile().crypto.generateUUIDSync();
  let password = Factory.globalStandardFile().crypto.generateUUIDSync();
  var _keys;

  before(async () => {
    await Factory.globalStorageManager().clearAllData();
  })

  it("successfully register new account", (done) => {
     Factory.globalAuthManager().register(url, email, password, false, (response) => {
      expect(response.error).to.not.be.ok;
      done();
    })
  })

  it("successfully logins to registered account", (done) => {
    var strict = false;
    var ephemeral = false;
     Factory.globalAuthManager().login(url, email, password, ephemeral, strict, null, (response, keys) => {
      _keys = keys;
      expect(response.error).to.not.be.ok;
      done();
    })
  })

  it("fails login to registered account", (done) => {
    var strict = false;
    var ephemeral = false;
    Factory.globalAuthManager().login(url, email, "wrong-password", ephemeral, strict, null, (response) => {
      expect(response.error).to.be.ok;
      done();
    })
  })

  it("successfully changes password", (done) => {
    var strict = false;
    var ephemeral = false;

    Factory.globalStandardFile().crypto.generateInitialKeysAndAuthParamsForUser(email, password).then((result) => {
      var newKeys = result.keys;
      var newAuthParams = result.authParams;

      Factory.globalAuthManager().changePassword(email, _keys.pw, newKeys, newAuthParams, (response) => {
        expect(response.error).to.not.be.ok;

        Factory.globalAuthManager().login(url, email, password, ephemeral, strict, null, (response) => {
          expect(response.error).to.not.be.ok;
          done();
        })
      })
    })
  })

})
