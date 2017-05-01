/* Abstract class. Instantiate an instance of either SFCryptoJS (uses cryptojs) or SFCryptoWeb (uses web crypto) */

class SFAbstractCrypto {

  generateRandomKey(bits) {
    return CryptoJS.lib.WordArray.random(bits/8).toString();
  }

  generateUUID() {
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

  decryptText({ciphertextToAuth, contentCiphertext, encryptionKey, iv, authHash, authKey} = {}, requiresAuth) {
    if(requiresAuth && !authHash) {
      console.error("Auth hash is required.");
      return;
    }

    if(authHash) {
      var localAuthHash = SFJS.crypto.hmac256(ciphertextToAuth, authKey);
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

  encryptText(text, key, iv) {
    var keyData = CryptoJS.enc.Hex.parse(key);
    var ivData  = CryptoJS.enc.Hex.parse(iv || "");
    var encrypted = CryptoJS.AES.encrypt(text, keyData, { iv: ivData,  mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.toString();
  }

  generateRandomEncryptionKey() {
    var salt = SFJS.crypto.generateRandomKey(512);
    var passphrase = SFJS.crypto.generateRandomKey(512);
    return CryptoJS.PBKDF2(passphrase, salt, { keySize: 512/32 }).toString();
  }

  firstHalfOfKey(key) {
    return key.substring(0, key.length/2);
  }

  secondHalfOfKey(key) {
    return key.substring(key.length/2, key.length);
  }

  base64(text) {
    return window.btoa(text);
  }

  base64Decode(base64String) {
    return window.atob(base64String);
  }

  sha256(text) {
    return CryptoJS.SHA256(text).toString();
  }

  sha1(text) {
    return CryptoJS.SHA1(text).toString();
  }

  hmac256(message, key) {
    var keyData = CryptoJS.enc.Hex.parse(key);
    var messageData = CryptoJS.enc.Utf8.parse(message);
    var result = CryptoJS.HmacSHA256(messageData, keyData).toString();
    return result;
  }

  generateKeysFromMasterKey(mk) {
    console.log("From crpyot.js", SFJS, SFJS.crypto);
    var encryptionKey = SFJS.crypto.hmac256(mk, CryptoJS.enc.Utf8.parse("e").toString(CryptoJS.enc.Hex));
    var authKey = SFJS.crypto.hmac256(mk, CryptoJS.enc.Utf8.parse("a").toString(CryptoJS.enc.Hex));
    return {mk: mk, encryptionKey: encryptionKey, authKey: authKey};
  }

  computeEncryptionKeysForUser({password, pw_salt, pw_func, pw_alg, pw_cost, pw_key_size} = {}, callback) {
     this.generateSymmetricKeyPair({password: password, pw_salt: pw_salt,
       pw_func: pw_func, pw_alg: pw_alg, pw_cost: pw_cost, pw_key_size: pw_key_size}, function(keys){
         var pw = keys[0];
         var mk = keys[1];

         callback(_.merge({pw: pw, mk: mk}, this.generateKeysFromMasterKey(mk)));
       }.bind(this));
   }

   generateInitialEncryptionKeysForUser({email, password} = {}, callback) {
     var defaults = this.defaultPasswordGenerationParams();
     var {pw_func, pw_alg, pw_key_size, pw_cost} = defaults;
     var pw_nonce = this.generateRandomKey(512);
     var pw_salt = this.sha1(email + "SN" + pw_nonce);
     _.merge(defaults, {pw_salt: pw_salt, pw_nonce: pw_nonce})
     this.generateSymmetricKeyPair(_.merge({email: email, password: password, pw_salt: pw_salt}, defaults), function(keys){
       var pw = keys[0];
       var mk = keys[1];

       callback(_.merge({pw: pw, mk: mk}, this.generateKeysFromMasterKey(mk)), defaults);
     }.bind(this));
   }
}

export { SFAbstractCrypto }
;class SFCryptoJS extends SFAbstractCrypto {

   /** Generates two deterministic keys based on one input */
   generateSymmetricKeyPair({password, pw_salt, pw_func, pw_alg, pw_cost, pw_key_size} = {}, callback) {
     var algMapping = {
       "sha256" : CryptoJS.algo.SHA256,
       "sha512" : CryptoJS.algo.SHA512
     }
     var fnMapping = {
       "pbkdf2" : CryptoJS.PBKDF2
     }

     var alg = algMapping[pw_alg];
     var kdf = fnMapping[pw_func];
     var output = kdf(password, pw_salt, { keySize: pw_key_size/32, hasher: alg, iterations: pw_cost }).toString();

     var outputLength = output.length;
     var firstHalf = output.slice(0, outputLength/2);
     var secondHalf = output.slice(outputLength/2, outputLength);
     callback([firstHalf, secondHalf])
   }

   defaultPasswordGenerationParams() {
     return {pw_func: "pbkdf2", pw_alg: "sha512", pw_key_size: 512, pw_cost: 3000};
   }
 }


export { SFCryptoJS }
;var subtleCrypto = window.crypto ? window.crypto.subtle : null;

class SFCryptoWeb extends SFAbstractCrypto {

  /**
  Overrides
  */
  defaultPasswordGenerationParams() {
    return {pw_func: "pbkdf2", pw_alg: "sha512", pw_key_size: 512, pw_cost: 5000};
  }

  /** Generates two deterministic keys based on one input */
  generateSymmetricKeyPair({password, pw_salt, pw_func, pw_alg, pw_cost, pw_key_size} = {}, callback) {
   this.stretchPassword({password: password, pw_func: pw_func, pw_alg: pw_alg, pw_salt: pw_salt, pw_cost: pw_cost, pw_key_size: pw_key_size}, function(output){
     var outputLength = output.length;
     var firstHalf = output.slice(0, outputLength/2);
     var secondHalf = output.slice(outputLength/2, outputLength);
     callback([firstHalf, secondHalf]);
   })
  }

  /**
  Internal
  */

  stretchPassword({password, pw_salt, pw_cost, pw_func, pw_alg, pw_key_size} = {}, callback) {

   this.webCryptoImportKey(password, pw_func, function(key){

     if(!key) {
       console.log("Key is null, unable to continue");
       callback(null);
       return;
     }

     this.webCryptoDeriveBits({key: key, pw_func: pw_func, pw_alg: pw_alg, pw_salt: pw_salt, pw_cost: pw_cost, pw_key_size: pw_key_size}, function(key){
       if(!key) {
         callback(null);
         return;
       }

       callback(key);

     }.bind(this))
   }.bind(this))
  }

  webCryptoImportKey(input, pw_func, callback) {
     subtleCrypto.importKey(
      "raw",
      this.stringToArrayBuffer(input),
      {name: pw_func.toUpperCase()},
      false,
      ["deriveBits"]
    )
    .then(function(key){
      callback(key);
    })
    .catch(function(err){
      console.error(err);
      callback(null);
    });
  }

  webCryptoDeriveBits({key, pw_func, pw_alg, pw_salt, pw_cost, pw_key_size} = {}, callback) {
     var algMapping = {
       "sha256" : "SHA-256",
       "sha512" : "SHA-512",
     }
     var alg = algMapping[pw_alg];
     subtleCrypto.deriveBits(
      {
        "name": pw_func.toUpperCase(),
        salt: this.stringToArrayBuffer(pw_salt),
        iterations: pw_cost,
        hash: {name: alg},
      },
      key,
      pw_key_size
    )
    .then(function(bits){
      var key = this.arrayBufferToHexString(new Uint8Array(bits));
      callback(key);
    }.bind(this))
    .catch(function(err){
      console.error(err);
      callback(null);
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

export { SFCryptoWeb }
;class SFItemTransformer {

  static _private_encryptString(string, encryptionKey, authKey, version) {
    var fullCiphertext, contentCiphertext;
    if(version === "001") {
      contentCiphertext = SFJS.crypto.encryptText(string, encryptionKey, null);
      fullCiphertext = version + contentCiphertext;
    } else {
      var iv = SFJS.crypto.generateRandomKey(128);
      contentCiphertext = SFJS.crypto.encryptText(string, encryptionKey, iv);
      var ciphertextToAuth = [version, iv, contentCiphertext].join(":");
      var authHash = SFJS.crypto.hmac256(ciphertextToAuth, authKey);
      fullCiphertext = [version, authHash, iv, contentCiphertext].join(":");
    }

    return fullCiphertext;
  }

  static encryptItem(item, keys, version) {
    // encrypt item key
    var item_key = SFJS.crypto.generateRandomEncryptionKey();
    if(version === "001") {
      // legacy
      item.enc_item_key = SFJS.crypto.encryptText(item_key, keys.mk, null);
    } else {
      item.enc_item_key = this._private_encryptString(item_key, keys.encryptionKey, keys.authKey, version);
    }

    // encrypt content
    var ek = SFJS.crypto.firstHalfOfKey(item_key);
    var ak = SFJS.crypto.secondHalfOfKey(item_key);
    var ciphertext = this._private_encryptString(JSON.stringify(item.createContentJSONFromProperties()), ek, ak, version);
    if(version === "001") {
      var authHash = SFJS.crypto.hmac256(ciphertext, ak);
      item.auth_hash = authHash;
    }

    item.content = ciphertext;
  }

  static encryptionComponentsFromString(string, baseKey, encryptionKey, authKey) {
    var encryptionVersion = string.substring(0, 3);
    if(encryptionVersion === "001") {
      return {
        contentCiphertext: string.substring(3, string.length),
        encryptionVersion: encryptionVersion,
        ciphertextToAuth: string,
        iv: null,
        authHash: null,
        encryptionKey: baseKey,
        authKey: authKey
      }
    } else {
      let components = string.split(":");
      return {
        encryptionVersion: components[0],
        authHash: components[1],
        iv: components[2],
        contentCiphertext: components[3],
        ciphertextToAuth: [components[0], components[2], components[3]].join(":"),
        encryptionKey: encryptionKey,
        authKey: authKey
      }
    }
  }

  static decryptItem(item, keys) {
    // decrypt encrypted key
    var encryptedItemKey = item.enc_item_key;
    var requiresAuth = true;
    if(encryptedItemKey.startsWith("002") === false) {
      // legacy encryption type, has no prefix
      encryptedItemKey = "001" + encryptedItemKey;
      requiresAuth = false;
    }
    var keyParams = this.encryptionComponentsFromString(encryptedItemKey, keys.mk, keys.encryptionKey, keys.authKey);
    var item_key = SFJS.crypto.decryptText(keyParams, requiresAuth);

    if(!item_key) {
      return;
    }

    // decrypt content
    var ek = SFJS.crypto.firstHalfOfKey(item_key);
    var ak = SFJS.crypto.secondHalfOfKey(item_key);
    var itemParams = this.encryptionComponentsFromString(item.content, ek, ek, ak);
    if(!itemParams.authHash) {
      itemParams.authHash = item.auth_hash;
    }
    var content = SFJS.crypto.decryptText(itemParams, true);
    item.content = content;
  }

  static decryptMultipleItems(items, keys, throws) {
    for (var item of items) {
     if(item.deleted == true) {
       continue;
     }

     var isString = typeof item.content === 'string' || item.content instanceof String;
     if(isString) {
       try {
         if((item.content.startsWith("001") || item.content.startsWith("002")) && item.enc_item_key) {
           // is encrypted
           this.decryptItem(item, keys);
         } else {
           // is base64 encoded
           item.content = SFJS.crypto.base64Decode(item.content.substring(3, item.content.length))
         }
       } catch (e) {
         if(throws) {
           throw e;
         }
         console.log("Error decrypting item", item, e);
         continue;
       }
     }
   }
  }
}

window.SFItemTransformer = SFItemTransformer;
export { SFItemTransformer }
;class Item {

  constructor(json_obj) {

    this.updateFromJSON(json_obj);

    this.observers = [];

    if(!this.uuid) {
      this.uuid = Neeto.crypto.generateUUID();
    }
  }

  static sortItemsByDate(items) {
    items.sort(function(a,b){
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }

  get contentObject() {
    if(!this.content) {
      return {};
    }

    if(this.content !== null && typeof this.content === 'object') {
      // this is the case when mapping localStorage content, in which case the content is already parsed
      return this.content;
    }

    try {
      return JSON.parse(this.content);
    } catch (e) {
      console.log("Error parsing json", e);
      return {};
    }
  }

  updateFromJSON(json) {
    _.merge(this, json);

    this.created_at = this.created_at ? new Date(this.created_at) : new Date();
    this.updated_at = this.updated_at ? new Date(this.updated_at) : new Date();

    if(json.content) {
      this.mapContentToLocalProperties(this.contentObject);
    }
  }

  setDirty(dirty) {
    this.dirty = dirty;

    if(dirty) {
      this.notifyObserversOfChange();
    }
  }

  markAllReferencesDirty() {
    this.allReferencedObjects().forEach(function(reference){
      reference.setDirty(true);
    })
  }
  addObserver(observer, callback) {
    if(!_.find(this.observers, observer)) {
      this.observers.push({observer: observer, callback: callback});
    }
  }

  removeObserver(observer) {
    _.remove(this.observers, {observer: observer})
  }

  notifyObserversOfChange() {
    for(var observer of this.observers) {
      observer.callback(this);
    }
  }

  mapContentToLocalProperties(contentObj) {

  }

  createContentJSONFromProperties() {
    return this.structureParams();
  }

  referenceParams() {
    // must override
  }

  structureParams() {
    return {references: this.referenceParams()}
  }

  addItemAsRelationship(item) {
    // must override
  }

  removeItemAsRelationship(item) {
    // must override
  }

  isBeingRemovedLocally() {

  }

  removeAllRelationships() {
    // must override
    this.setDirty(true);
  }

  locallyClearAllReferences() {

  }

  mergeMetadataFromItem(item) {
    _.merge(this, _.omit(item, ["content"]));
  }

  informReferencesOfUUIDChange(oldUUID, newUUID) {
    // optional override
  }

  potentialItemOfInterestHasChangedItsUUID(newItem, oldUUID, newUUID) {
    // optional override
  }

  allReferencedObjects() {
    // must override
    return [];
  }
}

window.Item = Item;
export { Item }
;class StandardFile {
  constructor() {
    // detect IE8 and above, and edge.
    // IE and Edge do not support pbkdf2 in WebCrypto, therefore we need to use CryptoJS
    var IEOrEdge = document.documentMode || /Edge/.test(navigator.userAgent);

    if(!IEOrEdge && (window.crypto && window.crypto.subtle)) {
      this.crypto = new SFCryptoWeb();
    } else {
      this.crypto = new SFCryptoJS();
    }
  }
}

window.StandardFile = StandardFile;
window.SFJS = new StandardFile()
