(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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
    key: 'version',
    value: function version() {
      return "003";
    }
  }, {
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
    key: 'hmac256',
    value: function hmac256(message, key) {
      var keyData = CryptoJS.enc.Hex.parse(key);
      var messageData = CryptoJS.enc.Utf8.parse(message);
      var result = CryptoJS.HmacSHA256(messageData, keyData).toString();
      return result;
    }
  }, {
    key: 'supportsPasswordDerivationCost',
    value: function supportsPasswordDerivationCost(cost) {
      // some passwords are created on platforms with stronger pbkdf2 capabilities, like iOS,
      // which CryptoJS can't handle here (WebCrypto can however).
      // if user has high password cost and is using browser that doesn't support WebCrypto,
      // we want to tell them that they can't login with this browser.
      if (cost > 5000) {
        return this instanceof SFCryptoWeb;
      } else {
        return true;
      }
    }

    // Returns the versions that this library supports technically.

  }, {
    key: 'supportedVersions',
    value: function supportedVersions() {
      return ["001", "002", "003"];
    }
  }, {
    key: 'isVersionNewerThanLibraryVersion',
    value: function isVersionNewerThanLibraryVersion(version) {
      var libraryVersion = this.version();
      return parseInt(version) > parseInt(libraryVersion);
    }
  }, {
    key: 'costMinimumForVersion',
    value: function costMinimumForVersion(version) {
      return {
        "001": 3000,
        "002": 3000,
        "003": 110000
      }[version];
    }
  }, {
    key: 'defaultPasswordGenerationCost',
    value: function defaultPasswordGenerationCost() {
      return this.costMinimumForVersion(this.version());
    }
  }, {
    key: 'generateSalt',
    value: function generateSalt(identifier, nonce) {
      return this.sha256([identifier, "SF", nonce].join(":"));
    }
  }, {
    key: 'computeEncryptionKeysForUser',
    value: function computeEncryptionKeysForUser(password, authParams, callback) {
      var pw_salt;
      if (authParams.version == "003") {
        // Salt is computed from identifier + pw_nonce from server
        pw_salt = this.generateSalt(authParams.identifier, authParams.pw_nonce);
      } else {
        // Salt is returned from server
        pw_salt = authParams.pw_salt;
      }
      this.generateSymmetricKeyPair({ password: password, pw_salt: pw_salt, pw_cost: authParams.pw_cost }, function (keys) {
        var userKeys = { pw: keys[0], mk: keys[1], ak: keys[2] };
        callback(userKeys);
      });
    }

    // Unlike computeEncryptionKeysForUser, this method always uses the latest SF Version

  }, {
    key: 'generateInitialEncryptionKeysForUser',
    value: function generateInitialEncryptionKeysForUser(identifier, password, callback) {
      var version = this.version();
      var pw_cost = this.defaultPasswordGenerationCost();
      var pw_nonce = this.generateRandomKey(256);
      var pw_salt = this.generateSalt(identifier, pw_nonce);
      this.generateSymmetricKeyPair({ password: password, pw_salt: pw_salt, pw_cost: pw_cost }, function (keys) {
        var authParams = { pw_nonce: pw_nonce, pw_cost: pw_cost, identifier: identifier, version: version };
        var userKeys = { pw: keys[0], mk: keys[1], ak: keys[2] };
        callback(userKeys, authParams);
      });
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
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          password = _ref2.password,
          pw_salt = _ref2.pw_salt,
          pw_cost = _ref2.pw_cost;

      var callback = arguments[1];

      var output = CryptoJS.PBKDF2(password, pw_salt, { keySize: 768 / 32, hasher: CryptoJS.algo.SHA512, iterations: pw_cost }).toString();

      var outputLength = output.length;
      var splitLength = outputLength / 3;
      var firstThird = output.slice(0, splitLength);
      var secondThird = output.slice(splitLength, splitLength * 2);
      var thirdThird = output.slice(splitLength * 2, splitLength * 3);
      callback([firstThird, secondThird, thirdThird]);
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
    key: 'generateSymmetricKeyPair',


    /**
    Overrides
    */

    /** Generates two deterministic keys based on one input */
    value: function generateSymmetricKeyPair() {
      var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          password = _ref3.password,
          pw_salt = _ref3.pw_salt,
          pw_cost = _ref3.pw_cost;

      var callback = arguments[1];

      this.stretchPassword({ password: password, pw_salt: pw_salt, pw_cost: pw_cost }, function (output) {
        var outputLength = output.length;
        var splitLength = outputLength / 3;
        var firstThird = output.slice(0, splitLength);
        var secondThird = output.slice(splitLength, splitLength * 2);
        var thirdThird = output.slice(splitLength * 2, splitLength * 3);
        callback([firstThird, secondThird, thirdThird]);
      });
    }

    /**
    Internal
    */

  }, {
    key: 'stretchPassword',
    value: function stretchPassword() {
      var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          password = _ref4.password,
          pw_salt = _ref4.pw_salt,
          pw_cost = _ref4.pw_cost;

      var callback = arguments[1];


      this.webCryptoImportKey(password, function (key) {

        if (!key) {
          console.log("Key is null, unable to continue");
          callback(null);
          return;
        }

        this.webCryptoDeriveBits({ key: key, pw_salt: pw_salt, pw_cost: pw_cost }, function (key) {
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
    value: function webCryptoImportKey(input, callback) {
      subtleCrypto.importKey("raw", this.stringToArrayBuffer(input), { name: "PBKDF2" }, false, ["deriveBits"]).then(function (key) {
        callback(key);
      }).catch(function (err) {
        console.error(err);
        callback(null);
      });
    }
  }, {
    key: 'webCryptoDeriveBits',
    value: function webCryptoDeriveBits() {
      var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          key = _ref5.key,
          pw_salt = _ref5.pw_salt,
          pw_cost = _ref5.pw_cost;

      var callback = arguments[1];

      subtleCrypto.deriveBits({
        "name": "PBKDF2",
        salt: this.stringToArrayBuffer(pw_salt),
        iterations: pw_cost,
        hash: { name: "SHA-512" }
      }, key, 768).then(function (bits) {
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
    value: function _private_encryptString(string, encryptionKey, authKey, uuid, version) {
      var fullCiphertext, contentCiphertext;
      if (version === "001") {
        contentCiphertext = SFJS.crypto.encryptText(string, encryptionKey, null);
        fullCiphertext = version + contentCiphertext;
      } else {
        var iv = SFJS.crypto.generateRandomKey(128);
        contentCiphertext = SFJS.crypto.encryptText(string, encryptionKey, iv);
        var ciphertextToAuth = [version, uuid, iv, contentCiphertext].join(":");
        var authHash = SFJS.crypto.hmac256(ciphertextToAuth, authKey);
        fullCiphertext = [version, authHash, uuid, iv, contentCiphertext].join(":");
      }

      return fullCiphertext;
    }
  }, {
    key: 'encryptItem',
    value: function encryptItem(item, keys) {
      var version = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "003";

      var params = {};
      // encrypt item key
      var item_key = SFJS.crypto.generateRandomEncryptionKey();
      if (version === "001") {
        // legacy
        params.enc_item_key = SFJS.crypto.encryptText(item_key, keys.mk, null);
      } else {
        params.enc_item_key = this._private_encryptString(item_key, keys.mk, keys.ak, item.uuid, version);
      }

      // encrypt content
      var ek = SFJS.crypto.firstHalfOfKey(item_key);
      var ak = SFJS.crypto.secondHalfOfKey(item_key);
      var ciphertext = this._private_encryptString(JSON.stringify(item.createContentJSONFromProperties()), ek, ak, item.uuid, version);
      if (version === "001") {
        var authHash = SFJS.crypto.hmac256(ciphertext, ak);
        params.auth_hash = authHash;
      }

      params.content = ciphertext;
      return params;
    }
  }, {
    key: 'encryptionComponentsFromString',
    value: function encryptionComponentsFromString(string, encryptionKey, authKey) {
      var encryptionVersion = string.substring(0, 3);
      if (encryptionVersion === "001") {
        return {
          contentCiphertext: string.substring(3, string.length),
          encryptionVersion: encryptionVersion,
          ciphertextToAuth: string,
          iv: null,
          authHash: null,
          encryptionKey: encryptionKey,
          authKey: authKey
        };
      } else {
        var components = string.split(":");
        return {
          encryptionVersion: components[0],
          authHash: components[1],
          uuid: components[2],
          iv: components[3],
          contentCiphertext: components[4],
          ciphertextToAuth: [components[0], components[2], components[3], components[4]].join(":"),
          encryptionKey: encryptionKey,
          authKey: authKey
        };
      }
    }
  }, {
    key: 'decryptItem',
    value: function decryptItem(item, keys) {

      if (typeof item.content != "string") {
        // Content is already an object, can't do anything with it.
        return;
      }

      if (item.content.startsWith("000")) {
        // is base64 encoded
        try {
          item.content = JSON.parse(SFJS.crypto.base64Decode(item.content.substring(3, item.content.length)));
        } catch (e) {}

        return;
      }

      if (!item.enc_item_key) {
        // This needs to be here to continue, return otherwise
        console.log("Missing item encryption key, skipping decryption.");
        return;
      }

      // decrypt encrypted key
      var encryptedItemKey = item.enc_item_key;
      var requiresAuth = true;
      if (!encryptedItemKey.startsWith("002") && !encryptedItemKey.startsWith("003")) {
        // legacy encryption type, has no prefix
        encryptedItemKey = "001" + encryptedItemKey;
        requiresAuth = false;
      }
      var keyParams = this.encryptionComponentsFromString(encryptedItemKey, keys.mk, keys.ak);

      // return if uuid in auth hash does not match item uuid. Signs of tampering.
      if (keyParams.uuid && keyParams.uuid !== item.uuid) {
        if (!item.errorDecrypting) {
          item.errorDecryptingValueChanged = true;
        }
        item.errorDecrypting = true;
        return;
      }

      var item_key = SFJS.crypto.decryptText(keyParams, requiresAuth);

      if (!item_key) {
        if (!item.errorDecrypting) {
          item.errorDecryptingValueChanged = true;
        }
        item.errorDecrypting = true;
        return;
      }

      // decrypt content
      var ek = SFJS.crypto.firstHalfOfKey(item_key);
      var ak = SFJS.crypto.secondHalfOfKey(item_key);
      var itemParams = this.encryptionComponentsFromString(item.content, ek, ak);

      // return if uuid in auth hash does not match item uuid. Signs of tampering.
      if (itemParams.uuid && itemParams.uuid !== item.uuid) {
        if (!item.errorDecrypting) {
          item.errorDecryptingValueChanged = true;
        }
        item.errorDecrypting = true;
        return;
      }

      if (!itemParams.authHash) {
        // legacy 001
        itemParams.authHash = item.auth_hash;
      }

      var content = SFJS.crypto.decryptText(itemParams, true);
      if (!content) {
        if (!item.errorDecrypting) {
          item.errorDecryptingValueChanged = true;
        }
        item.errorDecrypting = true;
      } else {
        if (item.errorDecrypting == true) {
          item.errorDecryptingValueChanged = true;
        }
        // Content should only be set if it was successfully decrypted, and should otherwise remain unchanged.
        item.errorDecrypting = false;
        item.content = content;
      }
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


          // 4/15/18: Adding item.content == null clause. We still want to decrypt deleted items incase
          // they were marked as dirty but not yet synced. Not yet sure why we had this requirement.
          if (item.deleted == true && item.content == null) {
            continue;
          }

          var isString = typeof item.content === 'string' || item.content instanceof String;
          if (isString) {
            try {
              this.decryptItem(item, keys);
            } catch (e) {
              if (!item.errorDecrypting) {
                item.errorDecryptingValueChanged = true;
              }
              item.errorDecrypting = true;
              if (throws) {
                throw e;
              }
              console.error("Error decrypting item", item, e);
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
