/* Abstract class. Instantiate an instance of either SFCryptoJS (uses cryptojs) or SFCryptoWeb (uses web crypto) */

export class SFAbstractCrypto {

  /*
  Our WebCrypto implementation only offers PBKDf2, so any other encryption
  and key generation functions must use CryptoJS in this abstract implementation.
  */

  generateUUIDSync() {
    var crypto = window.crypto || window.msCrypto;
    if(crypto) {
      var buf = new Uint32Array(4);
      crypto.getRandomValues(buf);
      var idx = -1;
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          idx++;
          var r = (buf[idx>>3] >> ((idx%8)*4))&15;
          var v = c == 'x' ? r : (r&0x3|0x8);
          return v.toString(16);
      });
    } else {
      var d = new Date().getTime();
      if(window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
      }
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
      });
      return uuid;
    }
  }

  async decryptText({ciphertextToAuth, contentCiphertext, encryptionKey, iv, authHash, authKey} = {}, requiresAuth) {
    if(requiresAuth && !authHash) {
      console.error("Auth hash is required.");
      return;
    }

    if(authHash) {
      var localAuthHash = await this.hmac256(ciphertextToAuth, authKey);
      if(authHash !== localAuthHash) {
        console.error("Auth hash does not match, returning null.");
        return null;
      }
    }
    var keyData = CryptoJS.enc.Hex.parse(encryptionKey);
    var ivData  = CryptoJS.enc.Hex.parse(iv || "");
    var decrypted = CryptoJS.AES.decrypt(contentCiphertext, keyData, { iv: ivData,  mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  async encryptText(text, key, iv) {
    var keyData = CryptoJS.enc.Hex.parse(key);
    var ivData  = CryptoJS.enc.Hex.parse(iv || "");
    var encrypted = CryptoJS.AES.encrypt(text, keyData, { iv: ivData,  mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.toString();
  }

  async generateRandomKey(bits) {
    return CryptoJS.lib.WordArray.random(bits/8).toString();
  }

  async generateRandomEncryptionKey() {
    var salt = await this.generateRandomKey(512);
    var passphrase = await this.generateRandomKey(512);
    return this.sha256(passphrase + salt);
  }

  async firstHalfOfKey(key) {
    return key.substring(0, key.length/2);
  }

  async secondHalfOfKey(key) {
    return key.substring(key.length/2, key.length);
  }

  async base64(text) {
    return window.btoa(text);
  }

  async base64Decode(base64String) {
    return window.atob(base64String);
  }

  async sha256(text) {
    return CryptoJS.SHA256(text).toString();
  }

  async hmac256(message, key) {
    var keyData = CryptoJS.enc.Hex.parse(key);
    var messageData = CryptoJS.enc.Utf8.parse(message);
    var result = CryptoJS.HmacSHA256(messageData, keyData).toString();
    return result;
  }

  async generateSalt(identifier, version, cost, nonce) {
    var result = await this.sha256([identifier, "SF", version, cost, nonce].join(":"));
    return result;
  }

  /** Generates two deterministic keys based on one input */
  async generateSymmetricKeyPair({password, pw_salt, pw_cost} = {}) {
    var output = await this.pbkdf2(password, pw_salt, pw_cost);
    var outputLength = output.length;
    var splitLength = outputLength/3;
    var firstThird = output.slice(0, splitLength);
    var secondThird = output.slice(splitLength, splitLength * 2);
    var thirdThird = output.slice(splitLength * 2, splitLength * 3);
    return [firstThird, secondThird, thirdThird];
  }

  async computeEncryptionKeysForUser(password, authParams) {
    var pw_salt;

    if(authParams.version == "003") {
      // Salt is computed from identifier + pw_nonce from server
      pw_salt = await this.generateSalt(authParams.identifier, authParams.version, authParams.pw_cost, authParams.pw_nonce);
    } else {
      // Salt is returned from server
      pw_salt = authParams.pw_salt;
    }

    return this.generateSymmetricKeyPair({password: password, pw_salt: pw_salt, pw_cost: authParams.pw_cost})
    .then((keys) => {
      let userKeys = {pw: keys[0], mk: keys[1], ak: keys[2]};
      return userKeys;
     });
   }

   // Unlike computeEncryptionKeysForUser, this method always uses the latest SF Version
  async generateInitialEncryptionKeysForUser(identifier, password) {
    let version = this.SFJS.version;
    var pw_cost = this.SFJS.defaultPasswordGenerationCost;
    var pw_nonce = await this.generateRandomKey(256);
    var pw_salt = await this.generateSalt(identifier, version, pw_cost, pw_nonce);

    return this.generateSymmetricKeyPair({password: password, pw_salt: pw_salt, pw_cost: pw_cost})
    .then((keys) => {
      let authParams = {pw_nonce: pw_nonce, pw_cost: pw_cost, identifier: identifier, version: version};
      let userKeys = {pw: keys[0], mk: keys[1], ak: keys[2]};
      return {keys: userKeys, authParams: authParams};
    });
  }

}
;export class SFCryptoJS extends SFAbstractCrypto {

  async pbkdf2(password, pw_salt, pw_cost) {
    var params = {
      keySize: 768/32,
      hasher: CryptoJS.algo.SHA512,
      iterations: pw_cost
    }

    return CryptoJS.PBKDF2(password, pw_salt, params).toString();
  }

}
;var subtleCrypto = window.crypto ? window.crypto.subtle : null;

export class SFCryptoWeb extends SFAbstractCrypto {

  /**
  Internal
  */

  async pbkdf2(password, pw_salt, pw_cost) {
   var key = await this.webCryptoImportKey(password);
   if(!key) {
     console.log("Key is null, unable to continue");
     return null;
   }

   return this.webCryptoDeriveBits({key: key, pw_salt: pw_salt, pw_cost: pw_cost});
  }

  async webCryptoImportKey(input) {
    return subtleCrypto.importKey("raw", this.stringToArrayBuffer(input), { name: "PBKDF2" }, false, ["deriveBits"])
    .then((key) => {
      return key;
    })
    .catch((err) => {
      console.error(err);
      return null;
    });
  }

  async webCryptoDeriveBits({key, pw_salt, pw_cost} = {}) {
    var params = {
      "name": "PBKDF2",
      salt: this.stringToArrayBuffer(pw_salt),
      iterations: pw_cost,
      hash: {name: "SHA-512"},
    }

    return subtleCrypto.deriveBits(params, key, 768)
    .then((bits) => {
      var key = this.arrayBufferToHexString(new Uint8Array(bits));
      return key;
    })
    .catch((err) => {
      console.error(err);
      return null;
    });
  }

  stringToArrayBuffer(string) {
    // not available on Edge/IE

    if(window.TextEncoder) {
      var encoder = new TextEncoder("utf-8");
      var result = encoder.encode(string);
      return result;
    } else {
      string = unescape(encodeURIComponent(string));
      var buf = new ArrayBuffer(string.length);
      var bufView = new Uint8Array(buf);
      for (var i=0, strLen=string.length; i<strLen; i++) {
        bufView[i] = string.charCodeAt(i);
      }
      return buf;
    }
  }

  arrayBufferToHexString(arrayBuffer) {
      var byteArray = new Uint8Array(arrayBuffer);
      var hexString = "";
      var nextHexByte;

      for (var i=0; i<byteArray.byteLength; i++) {
          nextHexByte = byteArray[i].toString(16);
          if (nextHexByte.length < 2) {
              nextHexByte = "0" + nextHexByte;
          }
          hexString += nextHexByte;
      }
      return hexString;
  }
}
;export class SFItemTransformer {

  constructor(crypto) {
    this.crypto = crypto;
  }

  async _private_encryptString(string, encryptionKey, authKey, uuid, version) {
    var fullCiphertext, contentCiphertext;
    if(version === "001") {
      contentCiphertext = await this.crypto.encryptText(string, encryptionKey, null);
      fullCiphertext = version + contentCiphertext;
    } else {
      var iv = await this.crypto.generateRandomKey(128);
      contentCiphertext = await this.crypto.encryptText(string, encryptionKey, iv);
      var ciphertextToAuth = [version, uuid, iv, contentCiphertext].join(":");
      var authHash = await this.crypto.hmac256(ciphertextToAuth, authKey);
      fullCiphertext = [version, authHash, uuid, iv, contentCiphertext].join(":");
    }

    return fullCiphertext;
  }

  async encryptItem(item, keys, version = "003") {
    var params = {};
    // encrypt item key
    var item_key = await this.crypto.generateRandomEncryptionKey();
    if(version === "001") {
      // legacy
      params.enc_item_key = await this.crypto.encryptText(item_key, keys.mk, null);
    } else {
      params.enc_item_key = await this._private_encryptString(item_key, keys.mk, keys.ak, item.uuid, version);
    }

    // encrypt content
    var ek = await this.crypto.firstHalfOfKey(item_key);
    var ak = await this.crypto.secondHalfOfKey(item_key);
    var ciphertext = await this._private_encryptString(JSON.stringify(item.createContentJSONFromProperties()), ek, ak, item.uuid, version);
    if(version === "001") {
      var authHash = await this.crypto.hmac256(ciphertext, ak);
      params.auth_hash = authHash;
    }

    params.content = ciphertext;
    return params;
  }

  encryptionComponentsFromString(string, encryptionKey, authKey) {
    var encryptionVersion = string.substring(0, 3);
    if(encryptionVersion === "001") {
      return {
        contentCiphertext: string.substring(3, string.length),
        encryptionVersion: encryptionVersion,
        ciphertextToAuth: string,
        iv: null,
        authHash: null,
        encryptionKey: encryptionKey,
        authKey: authKey
      }
    } else {
      let components = string.split(":");
      return {
        encryptionVersion: components[0],
        authHash: components[1],
        uuid: components[2],
        iv: components[3],
        contentCiphertext: components[4],
        ciphertextToAuth: [components[0], components[2], components[3], components[4]].join(":"),
        encryptionKey: encryptionKey,
        authKey: authKey
      }
    }
  }

  async decryptItem(item, keys) {

    if(typeof item.content != "string") {
      // Content is already an object, can't do anything with it.
      return;
    }

    if(item.content.startsWith("000")) {
      // is base64 encoded
      try {
        item.content = JSON.parse(await this.crypto.base64Decode(item.content.substring(3, item.content.length)));
      } catch (e) {}

      return;
    }

    if(!item.enc_item_key) {
      // This needs to be here to continue, return otherwise
      console.log("Missing item encryption key, skipping decryption.");
      return;
    }

    // decrypt encrypted key
    var encryptedItemKey = item.enc_item_key;
    var requiresAuth = true;
    if(!encryptedItemKey.startsWith("002") && !encryptedItemKey.startsWith("003")) {
      // legacy encryption type, has no prefix
      encryptedItemKey = "001" + encryptedItemKey;
      requiresAuth = false;
    }
    var keyParams = this.encryptionComponentsFromString(encryptedItemKey, keys.mk, keys.ak);

    // return if uuid in auth hash does not match item uuid. Signs of tampering.
    if(keyParams.uuid && keyParams.uuid !== item.uuid) {
      if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
      item.errorDecrypting = true;
      return;
    }

    var item_key = await this.crypto.decryptText(keyParams, requiresAuth);

    if(!item_key) {
      if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
      item.errorDecrypting = true;
      return;
    }

    // decrypt content
    var ek = await this.crypto.firstHalfOfKey(item_key);
    var ak = await this.crypto.secondHalfOfKey(item_key);
    var itemParams = this.encryptionComponentsFromString(item.content, ek, ak);

    // return if uuid in auth hash does not match item uuid. Signs of tampering.
    if(itemParams.uuid && itemParams.uuid !== item.uuid) {
      if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
      item.errorDecrypting = true;
      return;
    }

    if(!itemParams.authHash) {
      // legacy 001
      itemParams.authHash = item.auth_hash;
    }

    var content = await this.crypto.decryptText(itemParams, true);
    if(!content) {
      if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
      item.errorDecrypting = true;
    } else {
      if(item.errorDecrypting == true) { item.errorDecryptingValueChanged = true;}
       // Content should only be set if it was successfully decrypted, and should otherwise remain unchanged.
      item.errorDecrypting = false;
      item.content = content;
    }
  }

  async decryptMultipleItems(items, keys, throws) {
    let decrypt = async (item) => {
      // 4/15/18: Adding item.content == null clause. We still want to decrypt deleted items incase
      // they were marked as dirty but not yet synced. Not yet sure why we had this requirement.
      if(item.deleted == true && item.content == null) {
        return;
      }

      var isString = typeof item.content === 'string' || item.content instanceof String;
      if(isString) {
        try {
          await this.decryptItem(item, keys);
        } catch (e) {
          if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
          item.errorDecrypting = true;
          if(throws) {
            throw e;
          }
          console.error("Error decrypting item", item, e);
          return;
        }
      }
    }

    return Promise.all(items.map((item) => {
      return decrypt(item);
    }));

  }
}
;export class StandardFile {
  constructor() {
    // This library runs in native environments as well (react native)
    if(typeof window !== 'undefined' && typeof document !== 'undefined') {
      // detect IE8 and above, and edge.
      // IE and Edge do not support pbkdf2 in WebCrypto, therefore we need to use CryptoJS
      var IEOrEdge = document.documentMode || /Edge/.test(navigator.userAgent);

      if(!IEOrEdge && (window.crypto && window.crypto.subtle)) {
        this.crypto = new SFCryptoWeb();
      } else {
        this.crypto = new SFCryptoJS();
      }

      this.crypto.SFJS = {
        version : this.version(),
        defaultPasswordGenerationCost : this.defaultPasswordGenerationCost()
      }

      this.itemTransformer = new SFItemTransformer(this.crypto);
    }
  }

  version() {
    return "003";
  }

  supportsPasswordDerivationCost(cost) {
    // some passwords are created on platforms with stronger pbkdf2 capabilities, like iOS,
    // which CryptoJS can't handle here (WebCrypto can however).
    // if user has high password cost and is using browser that doesn't support WebCrypto,
    // we want to tell them that they can't login with this browser.
    if(cost > 5000) {
      return this.crypto instanceof SFCryptoWeb;
    } else {
      return true;
    }
  }

  // Returns the versions that this library supports technically.
  supportedVersions() {
    return ["001", "002", "003"];
  }

  isVersionNewerThanLibraryVersion(version) {
    var libraryVersion = this.version();
    return parseInt(version) > parseInt(libraryVersion);
  }

  isProtocolVersionOutdated(version) {
    // YYYY-MM-DD
    let expirationDates = {
      "001" : Date.parse("2018-01-01"),
      "002" : Date.parse("2019-06-01"),
    }

    let date = expirationDates[version];
    if(!date) {
      // No expiration date, is active version
      return false;
    }
    let expired = new Date() > date;
    return expired;
  }

  costMinimumForVersion(version) {
    return {
      "001" : 3000,
      "002" : 3000,
      "003" : 110000
    }[version];
  }

  defaultPasswordGenerationCost() {
    return this.costMinimumForVersion(this.version());
  }

}

if(window) {
  window.StandardFile = StandardFile;
  window.SFJS = new StandardFile()
}
