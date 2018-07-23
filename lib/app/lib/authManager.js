export class SFAuthManager {

  constructor(storageManager, httpManager, alertManager, timeout) {
    SFAuthManager.DidSignOutEvent = "DidSignOutEvent";
    SFAuthManager.WillSignInEvent = "WillSignInEvent";
    SFAuthManager.DidSignInEvent = "DidSignInEvent";

    this.httpManager = httpManager;
    this.storageManager = storageManager;
    this.alertManager = alertManager || new SFAlertManager();
    this.$timeout = timeout || setTimeout.bind(window);

    this.eventHandlers = [];
  }

  addEventHandler(handler) {
    this.eventHandlers.push(handler);
    return handler;
  }

  removeEventHandler(handler) {
    _.pull(this.eventHandlers, handler);
  }

  notifyEvent(event, data) {
    for(var handler of this.eventHandlers) {
      handler(event, data || {});
    }
  }

  async saveKeys(keys) {
    this._keys = keys;
    await this.storageManager.setItem("mk", keys.mk);
    await this.storageManager.setItem("ak", keys.ak);
  }

  async signout(clearAllData) {
    this._keys = null;
    this._authParams = null;
    if(clearAllData) {
      return this.storageManager.clearAllData().then(() => {
        this.notifyEvent(SFAuthManager.DidSignOutEvent);
      })
    } else {
      this.notifyEvent(SFAuthManager.DidSignOutEvent);
    }
  }

  async keys() {
    if(!this._keys) {
      var mk = await this.storageManager.getItem("mk");
      if(!mk) {
        return null;
      }
      this._keys = {mk: mk, ak: await this.storageManager.getItem("ak")};
    }
    return this._keys;
  }

  async getAuthParams() {
    if(!this._authParams) {
      var data = await this.storageManager.getItem("auth_params");
      this._authParams = JSON.parse(data);
    }

    if(!this._authParams.version) {
      this._authParams.version = await this.defaultProtocolVersion();
    }

    return this._authParams;
  }

  async defaultProtocolVersion() {
    var keys = await this.keys();
    if(keys && keys.ak) {
      // If there's no version stored, and there's an ak, it has to be 002. Newer versions would have thier version stored in authParams.
      return "002";
    } else {
      return "001";
    }
  }

  async protocolVersion() {
    var authParams = await this.getAuthParams();
    if(authParams && authParams.version) {
      return authParams.version;
    }

    return this.defaultProtocolVersion();
  }

  async getAuthParamsForEmail(url, email, extraParams) {
    return new Promise((resolve, reject) => {
      var requestUrl = url + "/auth/params";
      this.httpManager.getAbsolute(requestUrl, _.merge({email: email}, extraParams), (response) => {
        resolve(response);
      }, (response) => {
        console.error("Error getting auth params", response);
        if(typeof response !== 'object') {
          response = {error: {message: "A server error occurred while trying to sign in. Please try again."}};
        }
        resolve(response);
      })
    })
  }

  async login(url, email, password, strictSignin, extraParams) {
    return new Promise(async (resolve, reject) => {

      this.notifyEvent(SFAuthManager.WillSignInEvent);

      let authParams = await this.getAuthParamsForEmail(url, email, extraParams);

      // SF3 requires a unique identifier in the auth params
      authParams.identifier = email;

      if(authParams.error) {
        resolve(authParams);
        return;
      }

      if(!authParams || !authParams.pw_cost) {
        resolve({error : {message: "Invalid email or password."}});
        return;
      }

      if(!SFJS.supportedVersions().includes(authParams.version)) {
        var message;
        if(SFJS.isVersionNewerThanLibraryVersion(authParams.version)) {
          // The user has a new account type, but is signing in to an older client.
          message = "This version of the application does not support your newer account type. Please upgrade to the latest version of Standard Notes to sign in.";
        } else {
          // The user has a very old account type, which is no longer supported by this client
          message = "The protocol version associated with your account is outdated and no longer supported by this application. Please visit standardnotes.org/help/security for more information.";
        }
        resolve({error: {message: message}});
        return;
      }

      if(SFJS.isProtocolVersionOutdated(authParams.version)) {
        let message = `The encryption version for your account, ${authParams.version}, is outdated and requires upgrade. You may proceed with login, but are advised to perform a security update using the web or desktop application. Please visit standardnotes.org/help/security for more information.`
        var abort = false;
        await this.alertManager.confirm({
          title: "Update Needed",
          text: message,
          confirmButtonText: "Sign In",
        }).catch(() => {
          resolve({error: {}});
          abort = true;
        })
        if(abort) {return;}
      }

      if(!SFJS.supportsPasswordDerivationCost(authParams.pw_cost)) {
        let message = "Your account was created on a platform with higher security capabilities than this browser supports. " +
        "If we attempted to generate your login keys here, it would take hours. " +
        "Please use a browser with more up to date security capabilities, like Google Chrome or Firefox, to log in."
        resolve({error: {message: message}});
        return;
      }

      var minimum = SFJS.costMinimumForVersion(authParams.version);
      if(authParams.pw_cost < minimum) {
        let message = "Unable to login due to insecure password parameters. Please visit standardnotes.org/help/security for more information.";
        resolve({error: {message: message}});
        return;
      }

      if(strictSignin) {
        // Refuse sign in if authParams.version is anything but the latest version
        var latestVersion = SFJS.version();
        if(authParams.version !== latestVersion) {
          let message = `Strict sign in refused server sign in parameters. The latest security version is ${latestVersion}, but your account is reported to have version ${authParams.version}. If you'd like to proceed with sign in anyway, please disable strict sign in and try again.`;
          resolve({error: {message: message}});
          return;
        }
      }

      let keys = await SFJS.crypto.computeEncryptionKeysForUser(password, authParams);

      var requestUrl = url + "/auth/sign_in";
      var params = _.merge({password: keys.pw, email: email}, extraParams);

      this.httpManager.postAbsolute(requestUrl, params, async (response) => {
        this.notifyEvent(SFAuthManager.DidSignInEvent);
        await this.handleAuthResponse(response, email, url, authParams, keys);
        this.$timeout(() => resolve(response));
      }, (response) => {
        console.error("Error logging in", response);
        if(typeof response !== 'object') {
          response = {error: {message: "A server error occurred while trying to sign in. Please try again."}};
        }
        this.$timeout(() => resolve(response));
      });
    });
  }

  register(url, email, password) {
    return new Promise(async (resolve, reject) => {
      let results = await SFJS.crypto.generateInitialKeysAndAuthParamsForUser(email, password);
      let keys = results.keys;
      let authParams = results.authParams;

      var requestUrl = url + "/auth";
      var params = _.merge({password: keys.pw, email: email}, authParams);

      this.httpManager.postAbsolute(requestUrl, params, async (response) => {
        await this.handleAuthResponse(response, email, url, authParams, keys);
        resolve(response);
      }, (response) => {
        console.error("Registration error", response);
        if(typeof response !== 'object') {
          response = {error: {message: "A server error occurred while trying to register. Please try again."}};
        }
        resolve(response);
      })
    });
  }

  async changePassword(url, email, current_server_pw, newKeys, newAuthParams) {
    return new Promise(async (resolve, reject) => {
      let newServerPw = newKeys.pw;

      var requestUrl = url + "/auth/change_pw";
      var params = _.merge({new_password: newServerPw, current_password: current_server_pw}, newAuthParams);

      this.httpManager.postAbsolute(requestUrl, params, async (response) => {
        await this.handleAuthResponse(response, email, null, newAuthParams, newKeys);
        resolve(response);
      }, (response) => {
        if(typeof response !== 'object') {
          response = {error: {message: "Something went wrong while changing your password. Your password was not changed. Please try again."}}
        }
        resolve(response);
      })
    });
  }

  async handleAuthResponse(response, email, url, authParams, keys) {
    if(url) { await this.storageManager.setItem("server", url);}
    this._authParams = authParams;
    await this.storageManager.setItem("auth_params", JSON.stringify(authParams));
    await this.storageManager.setItem("jwt", response.token);
    return this.saveKeys(keys);
  }
}
