(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* Abstract class. Instantiate an instance of either SFCryptoJS (uses cryptojs) or SFCryptoWeb (uses web crypto) */

var SFAbstractCrypto = function () {
  function SFAbstractCrypto() {
    _classCallCheck(this, SFAbstractCrypto);
  }

  _createClass(SFAbstractCrypto, [{
    key: 'generateRandomKey',
    value: function generateRandomKey(bits) {
      return CryptoJS.lib.WordArray.random(bits / 8).toString();
    }
  }, {
    key: 'generateUUID',
    value: function generateUUID() {
      var crypto = window.crypto || window.msCrypto;
      if (crypto) {
        var buf = new Uint32Array(4);
        crypto.getRandomValues(buf);
        var idx = -1;
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          idx++;
          var r = buf[idx >> 3] >> idx % 8 * 4 & 15;
          var v = c == 'x' ? r : r & 0x3 | 0x8;
          return v.toString(16);
        });
      } else {
        var d = new Date().getTime();
        if (window.performance && typeof window.performance.now === "function") {
          d += performance.now(); //use high-precision timer if available
        }
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = (d + Math.random() * 16) % 16 | 0;
          d = Math.floor(d / 16);
          return (c == 'x' ? r : r & 0x3 | 0x8).toString(16);
        });
        return uuid;
      }
    }
  }, {
    key: 'decryptText',
    value: function decryptText() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          ciphertextToAuth = _ref.ciphertextToAuth,
          contentCiphertext = _ref.contentCiphertext,
          encryptionKey = _ref.encryptionKey,
          iv = _ref.iv,
          authHash = _ref.authHash,
          authKey = _ref.authKey;

      var requiresAuth = arguments[1];

      if (requiresAuth && !authHash) {
        console.error("Auth hash is required.");
        return;
      }

      if (authHash) {
        var localAuthHash = SFJS.crypto.hmac256(ciphertextToAuth, authKey);
        if (authHash !== localAuthHash) {
          console.error("Auth hash does not match, returning null.");
          return null;
        }
      }
      var keyData = CryptoJS.enc.Hex.parse(encryptionKey);
      var ivData = CryptoJS.enc.Hex.parse(iv || "");
      var decrypted = CryptoJS.AES.decrypt(contentCiphertext, keyData, { iv: ivData, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
      return decrypted.toString(CryptoJS.enc.Utf8);
    }
  }, {
    key: 'encryptText',
    value: function encryptText(text, key, iv) {
      var keyData = CryptoJS.enc.Hex.parse(key);
      var ivData = CryptoJS.enc.Hex.parse(iv || "");
      var encrypted = CryptoJS.AES.encrypt(text, keyData, { iv: ivData, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
      return encrypted.toString();
    }
  }, {
    key: 'generateRandomEncryptionKey',
    value: function generateRandomEncryptionKey() {
      var salt = SFJS.crypto.generateRandomKey(512);
      var passphrase = SFJS.crypto.generateRandomKey(512);
      return CryptoJS.PBKDF2(passphrase, salt, { keySize: 512 / 32 }).toString();
    }
  }, {
    key: 'firstHalfOfKey',
    value: function firstHalfOfKey(key) {
      return key.substring(0, key.length / 2);
    }
  }, {
    key: 'secondHalfOfKey',
    value: function secondHalfOfKey(key) {
      return key.substring(key.length / 2, key.length);
    }
  }, {
    key: 'base64',
    value: function base64(text) {
      return window.btoa(text);
    }
  }, {
    key: 'base64Decode',
    value: function base64Decode(base64String) {
      return window.atob(base64String);
    }
  }, {
    key: 'sha256',
    value: function sha256(text) {
      return CryptoJS.SHA256(text).toString();
    }
  }, {
    key: 'sha1',
    value: function sha1(text) {
      return CryptoJS.SHA1(text).toString();
    }
  }, {
    key: 'hmac256',
    value: function hmac256(message, key) {
      var keyData = CryptoJS.enc.Hex.parse(key);
      var messageData = CryptoJS.enc.Utf8.parse(message);
      var result = CryptoJS.HmacSHA256(messageData, keyData).toString();
      return result;
    }
  }, {
    key: 'generateKeysFromMasterKey',
    value: function generateKeysFromMasterKey(mk) {
      console.log("From crpyot.js", SFJS, SFJS.crypto);
      var encryptionKey = SFJS.crypto.hmac256(mk, CryptoJS.enc.Utf8.parse("e").toString(CryptoJS.enc.Hex));
      var authKey = SFJS.crypto.hmac256(mk, CryptoJS.enc.Utf8.parse("a").toString(CryptoJS.enc.Hex));
      return { mk: mk, encryptionKey: encryptionKey, authKey: authKey };
    }
  }, {
    key: 'computeEncryptionKeysForUser',
    value: function computeEncryptionKeysForUser() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          password = _ref2.password,
          pw_salt = _ref2.pw_salt,
          pw_func = _ref2.pw_func,
          pw_alg = _ref2.pw_alg,
          pw_cost = _ref2.pw_cost,
          pw_key_size = _ref2.pw_key_size;

      var callback = arguments[1];

      this.generateSymmetricKeyPair({ password: password, pw_salt: pw_salt,
        pw_func: pw_func, pw_alg: pw_alg, pw_cost: pw_cost, pw_key_size: pw_key_size }, function (keys) {
        var pw = keys[0];
        var mk = keys[1];

        callback(_.merge({ pw: pw, mk: mk }, this.generateKeysFromMasterKey(mk)));
      }.bind(this));
    }
  }, {
    key: 'generateInitialEncryptionKeysForUser',
    value: function generateInitialEncryptionKeysForUser() {
      var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          email = _ref3.email,
          password = _ref3.password;

      var callback = arguments[1];

      var defaults = this.defaultPasswordGenerationParams();
      var pw_func = defaults.pw_func,
          pw_alg = defaults.pw_alg,
          pw_key_size = defaults.pw_key_size,
          pw_cost = defaults.pw_cost;

      var pw_nonce = this.generateRandomKey(512);
      var pw_salt = this.sha1(email + "SN" + pw_nonce);
      _.merge(defaults, { pw_salt: pw_salt, pw_nonce: pw_nonce });
      this.generateSymmetricKeyPair(_.merge({ email: email, password: password, pw_salt: pw_salt }, defaults), function (keys) {
        var pw = keys[0];
        var mk = keys[1];

        callback(_.merge({ pw: pw, mk: mk }, this.generateKeysFromMasterKey(mk)), defaults);
      }.bind(this));
    }
  }]);

  return SFAbstractCrypto;
}();

exports.SFAbstractCrypto = SFAbstractCrypto;

var SFCryptoJS = function (_SFAbstractCrypto) {
  _inherits(SFCryptoJS, _SFAbstractCrypto);

  function SFCryptoJS() {
    _classCallCheck(this, SFCryptoJS);

    return _possibleConstructorReturn(this, (SFCryptoJS.__proto__ || Object.getPrototypeOf(SFCryptoJS)).apply(this, arguments));
  }

  _createClass(SFCryptoJS, [{
    key: 'generateSymmetricKeyPair',


    /** Generates two deterministic keys based on one input */
    value: function generateSymmetricKeyPair() {
      var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          password = _ref4.password,
          pw_salt = _ref4.pw_salt,
          pw_func = _ref4.pw_func,
          pw_alg = _ref4.pw_alg,
          pw_cost = _ref4.pw_cost,
          pw_key_size = _ref4.pw_key_size;

      var callback = arguments[1];

      var algMapping = {
        "sha256": CryptoJS.algo.SHA256,
        "sha512": CryptoJS.algo.SHA512
      };
      var fnMapping = {
        "pbkdf2": CryptoJS.PBKDF2
      };

      var alg = algMapping[pw_alg];
      var kdf = fnMapping[pw_func];
      var output = kdf(password, pw_salt, { keySize: pw_key_size / 32, hasher: alg, iterations: pw_cost }).toString();

      var outputLength = output.length;
      var firstHalf = output.slice(0, outputLength / 2);
      var secondHalf = output.slice(outputLength / 2, outputLength);
      callback([firstHalf, secondHalf]);
    }
  }, {
    key: 'defaultPasswordGenerationParams',
    value: function defaultPasswordGenerationParams() {
      return { pw_func: "pbkdf2", pw_alg: "sha512", pw_key_size: 512, pw_cost: 3000 };
    }
  }]);

  return SFCryptoJS;
}(SFAbstractCrypto);

exports.SFCryptoJS = SFCryptoJS;
var subtleCrypto = window.crypto ? window.crypto.subtle : null;

var SFCryptoWeb = function (_SFAbstractCrypto2) {
  _inherits(SFCryptoWeb, _SFAbstractCrypto2);

  function SFCryptoWeb() {
    _classCallCheck(this, SFCryptoWeb);

    return _possibleConstructorReturn(this, (SFCryptoWeb.__proto__ || Object.getPrototypeOf(SFCryptoWeb)).apply(this, arguments));
  }

  _createClass(SFCryptoWeb, [{
    key: 'defaultPasswordGenerationParams',


    /**
    Overrides
    */
    value: function defaultPasswordGenerationParams() {
      return { pw_func: "pbkdf2", pw_alg: "sha512", pw_key_size: 512, pw_cost: 5000 };
    }

    /** Generates two deterministic keys based on one input */

  }, {
    key: 'generateSymmetricKeyPair',
    value: function generateSymmetricKeyPair() {
      var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          password = _ref5.password,
          pw_salt = _ref5.pw_salt,
          pw_func = _ref5.pw_func,
          pw_alg = _ref5.pw_alg,
          pw_cost = _ref5.pw_cost,
          pw_key_size = _ref5.pw_key_size;

      var callback = arguments[1];

      this.stretchPassword({ password: password, pw_func: pw_func, pw_alg: pw_alg, pw_salt: pw_salt, pw_cost: pw_cost, pw_key_size: pw_key_size }, function (output) {
        var outputLength = output.length;
        var firstHalf = output.slice(0, outputLength / 2);
        var secondHalf = output.slice(outputLength / 2, outputLength);
        callback([firstHalf, secondHalf]);
      });
    }

    /**
    Internal
    */

  }, {
    key: 'stretchPassword',
    value: function stretchPassword() {
      var _ref6 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          password = _ref6.password,
          pw_salt = _ref6.pw_salt,
          pw_cost = _ref6.pw_cost,
          pw_func = _ref6.pw_func,
          pw_alg = _ref6.pw_alg,
          pw_key_size = _ref6.pw_key_size;

      var callback = arguments[1];


      this.webCryptoImportKey(password, pw_func, function (key) {

        if (!key) {
          console.log("Key is null, unable to continue");
          callback(null);
          return;
        }

        this.webCryptoDeriveBits({ key: key, pw_func: pw_func, pw_alg: pw_alg, pw_salt: pw_salt, pw_cost: pw_cost, pw_key_size: pw_key_size }, function (key) {
          if (!key) {
            callback(null);
            return;
          }

          callback(key);
        }.bind(this));
      }.bind(this));
    }
  }, {
    key: 'webCryptoImportKey',
    value: function webCryptoImportKey(input, pw_func, callback) {
      subtleCrypto.importKey("raw", this.stringToArrayBuffer(input), { name: pw_func.toUpperCase() }, false, ["deriveBits"]).then(function (key) {
        callback(key);
      }).catch(function (err) {
        console.error(err);
        callback(null);
      });
    }
  }, {
    key: 'webCryptoDeriveBits',
    value: function webCryptoDeriveBits() {
      var _ref7 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          key = _ref7.key,
          pw_func = _ref7.pw_func,
          pw_alg = _ref7.pw_alg,
          pw_salt = _ref7.pw_salt,
          pw_cost = _ref7.pw_cost,
          pw_key_size = _ref7.pw_key_size;

      var callback = arguments[1];

      var algMapping = {
        "sha256": "SHA-256",
        "sha512": "SHA-512"
      };
      var alg = algMapping[pw_alg];
      subtleCrypto.deriveBits({
        "name": pw_func.toUpperCase(),
        salt: this.stringToArrayBuffer(pw_salt),
        iterations: pw_cost,
        hash: { name: alg }
      }, key, pw_key_size).then(function (bits) {
        var key = this.arrayBufferToHexString(new Uint8Array(bits));
        callback(key);
      }.bind(this)).catch(function (err) {
        console.error(err);
        callback(null);
      });
    }
  }, {
    key: 'stringToArrayBuffer',
    value: function stringToArrayBuffer(string) {
      // not available on Edge/IE
      if (window.TextEncoder) {
        var encoder = new TextEncoder("utf-8");
        var result = encoder.encode(string);
        return result;
      } else {
        string = unescape(encodeURIComponent(string));
        var buf = new ArrayBuffer(string.length);
        var bufView = new Uint8Array(buf);
        for (var i = 0, strLen = string.length; i < strLen; i++) {
          bufView[i] = string.charCodeAt(i);
        }
        return buf;
      }
    }
  }, {
    key: 'arrayBufferToHexString',
    value: function arrayBufferToHexString(arrayBuffer) {
      var byteArray = new Uint8Array(arrayBuffer);
      var hexString = "";
      var nextHexByte;

      for (var i = 0; i < byteArray.byteLength; i++) {
        nextHexByte = byteArray[i].toString(16);
        if (nextHexByte.length < 2) {
          nextHexByte = "0" + nextHexByte;
        }
        hexString += nextHexByte;
      }
      return hexString;
    }
  }]);

  return SFCryptoWeb;
}(SFAbstractCrypto);

exports.SFCryptoWeb = SFCryptoWeb;

var SFItemTransformer = function () {
  function SFItemTransformer() {
    _classCallCheck(this, SFItemTransformer);
  }

  _createClass(SFItemTransformer, null, [{
    key: '_private_encryptString',
    value: function _private_encryptString(string, encryptionKey, authKey, version) {
      var fullCiphertext, contentCiphertext;
      if (version === "001") {
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
  }, {
    key: 'encryptItem',
    value: function encryptItem(item, keys, version) {
      // encrypt item key
      var item_key = SFJS.crypto.generateRandomEncryptionKey();
      if (version === "001") {
        // legacy
        item.enc_item_key = SFJS.crypto.encryptText(item_key, keys.mk, null);
      } else {
        item.enc_item_key = this._private_encryptString(item_key, keys.encryptionKey, keys.authKey, version);
      }

      // encrypt content
      var ek = SFJS.crypto.firstHalfOfKey(item_key);
      var ak = SFJS.crypto.secondHalfOfKey(item_key);
      var ciphertext = this._private_encryptString(JSON.stringify(item.createContentJSONFromProperties()), ek, ak, version);
      if (version === "001") {
        var authHash = SFJS.crypto.hmac256(ciphertext, ak);
        item.auth_hash = authHash;
      }

      item.content = ciphertext;
    }
  }, {
    key: 'encryptionComponentsFromString',
    value: function encryptionComponentsFromString(string, baseKey, encryptionKey, authKey) {
      var encryptionVersion = string.substring(0, 3);
      if (encryptionVersion === "001") {
        return {
          contentCiphertext: string.substring(3, string.length),
          encryptionVersion: encryptionVersion,
          ciphertextToAuth: string,
          iv: null,
          authHash: null,
          encryptionKey: baseKey,
          authKey: authKey
        };
      } else {
        var components = string.split(":");
        return {
          encryptionVersion: components[0],
          authHash: components[1],
          iv: components[2],
          contentCiphertext: components[3],
          ciphertextToAuth: [components[0], components[2], components[3]].join(":"),
          encryptionKey: encryptionKey,
          authKey: authKey
        };
      }
    }
  }, {
    key: 'decryptItem',
    value: function decryptItem(item, keys) {
      // decrypt encrypted key
      var encryptedItemKey = item.enc_item_key;
      var requiresAuth = true;
      if (encryptedItemKey.startsWith("002") === false) {
        // legacy encryption type, has no prefix
        encryptedItemKey = "001" + encryptedItemKey;
        requiresAuth = false;
      }
      var keyParams = this.encryptionComponentsFromString(encryptedItemKey, keys.mk, keys.encryptionKey, keys.authKey);
      var item_key = SFJS.crypto.decryptText(keyParams, requiresAuth);

      if (!item_key) {
        return;
      }

      // decrypt content
      var ek = SFJS.crypto.firstHalfOfKey(item_key);
      var ak = SFJS.crypto.secondHalfOfKey(item_key);
      var itemParams = this.encryptionComponentsFromString(item.content, ek, ek, ak);
      if (!itemParams.authHash) {
        itemParams.authHash = item.auth_hash;
      }
      var content = SFJS.crypto.decryptText(itemParams, true);
      item.content = content;
    }
  }, {
    key: 'decryptMultipleItems',
    value: function decryptMultipleItems(items, keys, throws) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;

          if (item.deleted == true) {
            continue;
          }

          var isString = typeof item.content === 'string' || item.content instanceof String;
          if (isString) {
            try {
              if ((item.content.startsWith("001") || item.content.startsWith("002")) && item.enc_item_key) {
                // is encrypted
                this.decryptItem(item, keys);
              } else {
                // is base64 encoded
                item.content = SFJS.crypto.base64Decode(item.content.substring(3, item.content.length));
              }
            } catch (e) {
              if (throws) {
                throw e;
              }
              console.log("Error decrypting item", item, e);
              continue;
            }
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }]);

  return SFItemTransformer;
}();

window.SFItemTransformer = SFItemTransformer;
exports.SFItemTransformer = SFItemTransformer;

var Item = function () {
  function Item(json_obj) {
    _classCallCheck(this, Item);

    this.updateFromJSON(json_obj);

    this.observers = [];

    if (!this.uuid) {
      this.uuid = Neeto.crypto.generateUUID();
    }
  }

  _createClass(Item, [{
    key: 'updateFromJSON',
    value: function updateFromJSON(json) {
      _.merge(this, json);

      this.created_at = this.created_at ? new Date(this.created_at) : new Date();
      this.updated_at = this.updated_at ? new Date(this.updated_at) : new Date();

      if (json.content) {
        this.mapContentToLocalProperties(this.contentObject);
      }
    }
  }, {
    key: 'setDirty',
    value: function setDirty(dirty) {
      this.dirty = dirty;

      if (dirty) {
        this.notifyObserversOfChange();
      }
    }
  }, {
    key: 'markAllReferencesDirty',
    value: function markAllReferencesDirty() {
      this.allReferencedObjects().forEach(function (reference) {
        reference.setDirty(true);
      });
    }
  }, {
    key: 'addObserver',
    value: function addObserver(observer, callback) {
      if (!_.find(this.observers, observer)) {
        this.observers.push({ observer: observer, callback: callback });
      }
    }
  }, {
    key: 'removeObserver',
    value: function removeObserver(observer) {
      _.remove(this.observers, { observer: observer });
    }
  }, {
    key: 'notifyObserversOfChange',
    value: function notifyObserversOfChange() {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.observers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var observer = _step2.value;

          observer.callback(this);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }, {
    key: 'mapContentToLocalProperties',
    value: function mapContentToLocalProperties(contentObj) {}
  }, {
    key: 'createContentJSONFromProperties',
    value: function createContentJSONFromProperties() {
      return this.structureParams();
    }
  }, {
    key: 'referenceParams',
    value: function referenceParams() {
      // must override
    }
  }, {
    key: 'structureParams',
    value: function structureParams() {
      return { references: this.referenceParams() };
    }
  }, {
    key: 'addItemAsRelationship',
    value: function addItemAsRelationship(item) {
      // must override
    }
  }, {
    key: 'removeItemAsRelationship',
    value: function removeItemAsRelationship(item) {
      // must override
    }
  }, {
    key: 'isBeingRemovedLocally',
    value: function isBeingRemovedLocally() {}
  }, {
    key: 'removeAllRelationships',
    value: function removeAllRelationships() {
      // must override
      this.setDirty(true);
    }
  }, {
    key: 'locallyClearAllReferences',
    value: function locallyClearAllReferences() {}
  }, {
    key: 'mergeMetadataFromItem',
    value: function mergeMetadataFromItem(item) {
      _.merge(this, _.omit(item, ["content"]));
    }
  }, {
    key: 'informReferencesOfUUIDChange',
    value: function informReferencesOfUUIDChange(oldUUID, newUUID) {
      // optional override
    }
  }, {
    key: 'potentialItemOfInterestHasChangedItsUUID',
    value: function potentialItemOfInterestHasChangedItsUUID(newItem, oldUUID, newUUID) {
      // optional override
    }
  }, {
    key: 'allReferencedObjects',
    value: function allReferencedObjects() {
      // must override
      return [];
    }
  }, {
    key: 'contentObject',
    get: function get() {
      if (!this.content) {
        return {};
      }

      if (this.content !== null && _typeof(this.content) === 'object') {
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
  }], [{
    key: 'sortItemsByDate',
    value: function sortItemsByDate(items) {
      items.sort(function (a, b) {
        return new Date(b.created_at) - new Date(a.created_at);
      });
    }
  }]);

  return Item;
}();

window.Item = Item;
exports.Item = Item;

var StandardFile = function StandardFile() {
  _classCallCheck(this, StandardFile);

  // detect IE8 and above, and edge.
  // IE and Edge do not support pbkdf2 in WebCrypto, therefore we need to use CryptoJS
  var IEOrEdge = document.documentMode || /Edge/.test(navigator.userAgent);

  if (!IEOrEdge && window.crypto && window.crypto.subtle) {
    this.crypto = new SFCryptoWeb();
  } else {
    this.crypto = new SFCryptoJS();
  }
};

window.StandardFile = StandardFile;
window.SFJS = new StandardFile();


},{}]},{},[1]);
