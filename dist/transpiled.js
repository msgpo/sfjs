'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StandardFile = exports.SFItemTransformer = exports.SFCryptoWeb = exports.SFCryptoJS = exports.SFAbstractCrypto = undefined;

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* Abstract class. Instantiate an instance of either SFCryptoJS (uses cryptojs) or SFCryptoWeb (uses web crypto) */

var SFAbstractCrypto = exports.SFAbstractCrypto = function () {
  function SFAbstractCrypto() {
    (0, _classCallCheck3.default)(this, SFAbstractCrypto);
  }

  (0, _createClass3.default)(SFAbstractCrypto, [{
    key: 'generateUUIDSync',


    /*
    Our WebCrypto implementation only offers PBKDf2, so any other encryption
    and key generation functions must use CryptoJS in this abstract implementation.
    */

    value: function generateUUIDSync() {
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
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
        var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            ciphertextToAuth = _ref2.ciphertextToAuth,
            contentCiphertext = _ref2.contentCiphertext,
            encryptionKey = _ref2.encryptionKey,
            iv = _ref2.iv,
            authHash = _ref2.authHash,
            authKey = _ref2.authKey;

        var requiresAuth = arguments[1];
        var localAuthHash, keyData, ivData, decrypted;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(requiresAuth && !authHash)) {
                  _context.next = 3;
                  break;
                }

                console.error("Auth hash is required.");
                return _context.abrupt('return');

              case 3:
                if (!authHash) {
                  _context.next = 10;
                  break;
                }

                _context.next = 6;
                return this.hmac256(ciphertextToAuth, authKey);

              case 6:
                localAuthHash = _context.sent;

                if (!(authHash !== localAuthHash)) {
                  _context.next = 10;
                  break;
                }

                console.error("Auth hash does not match, returning null.");
                return _context.abrupt('return', null);

              case 10:
                keyData = CryptoJS.enc.Hex.parse(encryptionKey);
                ivData = CryptoJS.enc.Hex.parse(iv || "");
                decrypted = CryptoJS.AES.decrypt(contentCiphertext, keyData, { iv: ivData, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
                return _context.abrupt('return', decrypted.toString(CryptoJS.enc.Utf8));

              case 14:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function decryptText() {
        return _ref.apply(this, arguments);
      }

      return decryptText;
    }()
  }, {
    key: 'encryptText',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(text, key, iv) {
        var keyData, ivData, encrypted;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                keyData = CryptoJS.enc.Hex.parse(key);
                ivData = CryptoJS.enc.Hex.parse(iv || "");
                encrypted = CryptoJS.AES.encrypt(text, keyData, { iv: ivData, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
                return _context2.abrupt('return', encrypted.toString());

              case 4:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function encryptText(_x2, _x3, _x4) {
        return _ref3.apply(this, arguments);
      }

      return encryptText;
    }()
  }, {
    key: 'generateRandomKey',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(bits) {
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                return _context3.abrupt('return', CryptoJS.lib.WordArray.random(bits / 8).toString());

              case 1:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function generateRandomKey(_x5) {
        return _ref4.apply(this, arguments);
      }

      return generateRandomKey;
    }()
  }, {
    key: 'generateRandomEncryptionKey',
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
        var salt, passphrase;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.generateRandomKey(512);

              case 2:
                salt = _context4.sent;
                _context4.next = 5;
                return this.generateRandomKey(512);

              case 5:
                passphrase = _context4.sent;
                return _context4.abrupt('return', this.sha256(passphrase + salt));

              case 7:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function generateRandomEncryptionKey() {
        return _ref5.apply(this, arguments);
      }

      return generateRandomEncryptionKey;
    }()
  }, {
    key: 'firstHalfOfKey',
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(key) {
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                return _context5.abrupt('return', key.substring(0, key.length / 2));

              case 1:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function firstHalfOfKey(_x6) {
        return _ref6.apply(this, arguments);
      }

      return firstHalfOfKey;
    }()
  }, {
    key: 'secondHalfOfKey',
    value: function () {
      var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(key) {
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                return _context6.abrupt('return', key.substring(key.length / 2, key.length));

              case 1:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function secondHalfOfKey(_x7) {
        return _ref7.apply(this, arguments);
      }

      return secondHalfOfKey;
    }()
  }, {
    key: 'base64',
    value: function () {
      var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(text) {
        return _regenerator2.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                return _context7.abrupt('return', window.btoa(text));

              case 1:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function base64(_x8) {
        return _ref8.apply(this, arguments);
      }

      return base64;
    }()
  }, {
    key: 'base64Decode',
    value: function () {
      var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(base64String) {
        return _regenerator2.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                return _context8.abrupt('return', window.atob(base64String));

              case 1:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function base64Decode(_x9) {
        return _ref9.apply(this, arguments);
      }

      return base64Decode;
    }()
  }, {
    key: 'sha256',
    value: function () {
      var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(text) {
        return _regenerator2.default.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                return _context9.abrupt('return', CryptoJS.SHA256(text).toString());

              case 1:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function sha256(_x10) {
        return _ref10.apply(this, arguments);
      }

      return sha256;
    }()
  }, {
    key: 'hmac256',
    value: function () {
      var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10(message, key) {
        var keyData, messageData, result;
        return _regenerator2.default.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                keyData = CryptoJS.enc.Hex.parse(key);
                messageData = CryptoJS.enc.Utf8.parse(message);
                result = CryptoJS.HmacSHA256(messageData, keyData).toString();
                return _context10.abrupt('return', result);

              case 4:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function hmac256(_x11, _x12) {
        return _ref11.apply(this, arguments);
      }

      return hmac256;
    }()
  }, {
    key: 'generateSalt',
    value: function () {
      var _ref12 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11(identifier, version, cost, nonce) {
        var result;
        return _regenerator2.default.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                _context11.next = 2;
                return this.sha256([identifier, "SF", version, cost, nonce].join(":"));

              case 2:
                result = _context11.sent;
                return _context11.abrupt('return', result);

              case 4:
              case 'end':
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function generateSalt(_x13, _x14, _x15, _x16) {
        return _ref12.apply(this, arguments);
      }

      return generateSalt;
    }()

    /** Generates two deterministic keys based on one input */

  }, {
    key: 'generateSymmetricKeyPair',
    value: function () {
      var _ref13 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee12() {
        var _ref14 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            password = _ref14.password,
            pw_salt = _ref14.pw_salt,
            pw_cost = _ref14.pw_cost;

        var output, outputLength, splitLength, firstThird, secondThird, thirdThird;
        return _regenerator2.default.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                _context12.next = 2;
                return this.pbkdf2(password, pw_salt, pw_cost);

              case 2:
                output = _context12.sent;
                outputLength = output.length;
                splitLength = outputLength / 3;
                firstThird = output.slice(0, splitLength);
                secondThird = output.slice(splitLength, splitLength * 2);
                thirdThird = output.slice(splitLength * 2, splitLength * 3);
                return _context12.abrupt('return', [firstThird, secondThird, thirdThird]);

              case 9:
              case 'end':
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function generateSymmetricKeyPair() {
        return _ref13.apply(this, arguments);
      }

      return generateSymmetricKeyPair;
    }()
  }, {
    key: 'computeEncryptionKeysForUser',
    value: function () {
      var _ref15 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee13(password, authParams) {
        var pw_salt;
        return _regenerator2.default.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                if (!(authParams.version == "003")) {
                  _context13.next = 6;
                  break;
                }

                _context13.next = 3;
                return this.generateSalt(authParams.identifier, authParams.version, authParams.pw_cost, authParams.pw_nonce);

              case 3:
                pw_salt = _context13.sent;
                _context13.next = 7;
                break;

              case 6:
                // Salt is returned from server
                pw_salt = authParams.pw_salt;

              case 7:
                return _context13.abrupt('return', this.generateSymmetricKeyPair({ password: password, pw_salt: pw_salt, pw_cost: authParams.pw_cost }).then(function (keys) {
                  var userKeys = { pw: keys[0], mk: keys[1], ak: keys[2] };
                  return userKeys;
                }));

              case 8:
              case 'end':
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function computeEncryptionKeysForUser(_x18, _x19) {
        return _ref15.apply(this, arguments);
      }

      return computeEncryptionKeysForUser;
    }()

    // Unlike computeEncryptionKeysForUser, this method always uses the latest SF Version

  }, {
    key: 'generateInitialEncryptionKeysForUser',
    value: function () {
      var _ref16 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee14(identifier, password) {
        var version, pw_cost, pw_nonce, pw_salt;
        return _regenerator2.default.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                version = this.SFJS.version;
                pw_cost = this.SFJS.defaultPasswordGenerationCost;
                _context14.next = 4;
                return this.generateRandomKey(256);

              case 4:
                pw_nonce = _context14.sent;
                _context14.next = 7;
                return this.generateSalt(identifier, version, pw_cost, pw_nonce);

              case 7:
                pw_salt = _context14.sent;
                return _context14.abrupt('return', this.generateSymmetricKeyPair({ password: password, pw_salt: pw_salt, pw_cost: pw_cost }).then(function (keys) {
                  var authParams = { pw_nonce: pw_nonce, pw_cost: pw_cost, identifier: identifier, version: version };
                  var userKeys = { pw: keys[0], mk: keys[1], ak: keys[2] };
                  return { keys: userKeys, authParams: authParams };
                }));

              case 9:
              case 'end':
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function generateInitialEncryptionKeysForUser(_x20, _x21) {
        return _ref16.apply(this, arguments);
      }

      return generateInitialEncryptionKeysForUser;
    }()
  }]);
  return SFAbstractCrypto;
}();

;
var SFCryptoJS = exports.SFCryptoJS = function (_SFAbstractCrypto) {
  (0, _inherits3.default)(SFCryptoJS, _SFAbstractCrypto);

  function SFCryptoJS() {
    (0, _classCallCheck3.default)(this, SFCryptoJS);
    return (0, _possibleConstructorReturn3.default)(this, (SFCryptoJS.__proto__ || Object.getPrototypeOf(SFCryptoJS)).apply(this, arguments));
  }

  (0, _createClass3.default)(SFCryptoJS, [{
    key: 'pbkdf2',
    value: function () {
      var _ref17 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee15(password, pw_salt, pw_cost) {
        var params;
        return _regenerator2.default.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                params = {
                  keySize: 768 / 32,
                  hasher: CryptoJS.algo.SHA512,
                  iterations: pw_cost
                };
                return _context15.abrupt('return', CryptoJS.PBKDF2(password, pw_salt, params).toString());

              case 2:
              case 'end':
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function pbkdf2(_x22, _x23, _x24) {
        return _ref17.apply(this, arguments);
      }

      return pbkdf2;
    }()
  }]);
  return SFCryptoJS;
}(SFAbstractCrypto);

;var subtleCrypto = window.crypto ? window.crypto.subtle : null;

var SFCryptoWeb = exports.SFCryptoWeb = function (_SFAbstractCrypto2) {
  (0, _inherits3.default)(SFCryptoWeb, _SFAbstractCrypto2);

  function SFCryptoWeb() {
    (0, _classCallCheck3.default)(this, SFCryptoWeb);
    return (0, _possibleConstructorReturn3.default)(this, (SFCryptoWeb.__proto__ || Object.getPrototypeOf(SFCryptoWeb)).apply(this, arguments));
  }

  (0, _createClass3.default)(SFCryptoWeb, [{
    key: 'pbkdf2',


    /**
    Internal
    */

    value: function () {
      var _ref18 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee16(password, pw_salt, pw_cost) {
        var key;
        return _regenerator2.default.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                _context16.next = 2;
                return this.webCryptoImportKey(password);

              case 2:
                key = _context16.sent;

                if (key) {
                  _context16.next = 6;
                  break;
                }

                console.log("Key is null, unable to continue");
                return _context16.abrupt('return', null);

              case 6:
                return _context16.abrupt('return', this.webCryptoDeriveBits({ key: key, pw_salt: pw_salt, pw_cost: pw_cost }));

              case 7:
              case 'end':
                return _context16.stop();
            }
          }
        }, _callee16, this);
      }));

      function pbkdf2(_x25, _x26, _x27) {
        return _ref18.apply(this, arguments);
      }

      return pbkdf2;
    }()
  }, {
    key: 'webCryptoImportKey',
    value: function () {
      var _ref19 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee17(input) {
        return _regenerator2.default.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                return _context17.abrupt('return', subtleCrypto.importKey("raw", this.stringToArrayBuffer(input), { name: "PBKDF2" }, false, ["deriveBits"]).then(function (key) {
                  return key;
                }).catch(function (err) {
                  console.error(err);
                  return null;
                }));

              case 1:
              case 'end':
                return _context17.stop();
            }
          }
        }, _callee17, this);
      }));

      function webCryptoImportKey(_x28) {
        return _ref19.apply(this, arguments);
      }

      return webCryptoImportKey;
    }()
  }, {
    key: 'webCryptoDeriveBits',
    value: function () {
      var _ref20 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee18() {
        var _this3 = this;

        var _ref21 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            key = _ref21.key,
            pw_salt = _ref21.pw_salt,
            pw_cost = _ref21.pw_cost;

        var params;
        return _regenerator2.default.wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                params = {
                  "name": "PBKDF2",
                  salt: this.stringToArrayBuffer(pw_salt),
                  iterations: pw_cost,
                  hash: { name: "SHA-512" }
                };
                return _context18.abrupt('return', subtleCrypto.deriveBits(params, key, 768).then(function (bits) {
                  var key = _this3.arrayBufferToHexString(new Uint8Array(bits));
                  return key;
                }).catch(function (err) {
                  console.error(err);
                  return null;
                }));

              case 2:
              case 'end':
                return _context18.stop();
            }
          }
        }, _callee18, this);
      }));

      function webCryptoDeriveBits() {
        return _ref20.apply(this, arguments);
      }

      return webCryptoDeriveBits;
    }()
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

;
var SFItemTransformer = exports.SFItemTransformer = function () {
  function SFItemTransformer(crypto) {
    (0, _classCallCheck3.default)(this, SFItemTransformer);

    this.crypto = crypto;
  }

  (0, _createClass3.default)(SFItemTransformer, [{
    key: '_private_encryptString',
    value: function () {
      var _ref22 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee19(string, encryptionKey, authKey, uuid, version) {
        var fullCiphertext, contentCiphertext, iv, ciphertextToAuth, authHash;
        return _regenerator2.default.wrap(function _callee19$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
                if (!(version === "001")) {
                  _context19.next = 7;
                  break;
                }

                _context19.next = 3;
                return this.crypto.encryptText(string, encryptionKey, null);

              case 3:
                contentCiphertext = _context19.sent;

                fullCiphertext = version + contentCiphertext;
                _context19.next = 18;
                break;

              case 7:
                _context19.next = 9;
                return this.crypto.generateRandomKey(128);

              case 9:
                iv = _context19.sent;
                _context19.next = 12;
                return this.crypto.encryptText(string, encryptionKey, iv);

              case 12:
                contentCiphertext = _context19.sent;
                ciphertextToAuth = [version, uuid, iv, contentCiphertext].join(":");
                _context19.next = 16;
                return this.crypto.hmac256(ciphertextToAuth, authKey);

              case 16:
                authHash = _context19.sent;

                fullCiphertext = [version, authHash, uuid, iv, contentCiphertext].join(":");

              case 18:
                return _context19.abrupt('return', fullCiphertext);

              case 19:
              case 'end':
                return _context19.stop();
            }
          }
        }, _callee19, this);
      }));

      function _private_encryptString(_x30, _x31, _x32, _x33, _x34) {
        return _ref22.apply(this, arguments);
      }

      return _private_encryptString;
    }()
  }, {
    key: 'encryptItem',
    value: function () {
      var _ref23 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee20(item, keys) {
        var version = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "003";
        var params, item_key, ek, ak, ciphertext, authHash;
        return _regenerator2.default.wrap(function _callee20$(_context20) {
          while (1) {
            switch (_context20.prev = _context20.next) {
              case 0:
                params = {};
                // encrypt item key

                _context20.next = 3;
                return this.crypto.generateRandomEncryptionKey();

              case 3:
                item_key = _context20.sent;

                if (!(version === "001")) {
                  _context20.next = 10;
                  break;
                }

                _context20.next = 7;
                return this.crypto.encryptText(item_key, keys.mk, null);

              case 7:
                params.enc_item_key = _context20.sent;
                _context20.next = 13;
                break;

              case 10:
                _context20.next = 12;
                return this._private_encryptString(item_key, keys.mk, keys.ak, item.uuid, version);

              case 12:
                params.enc_item_key = _context20.sent;

              case 13:
                _context20.next = 15;
                return this.crypto.firstHalfOfKey(item_key);

              case 15:
                ek = _context20.sent;
                _context20.next = 18;
                return this.crypto.secondHalfOfKey(item_key);

              case 18:
                ak = _context20.sent;
                _context20.next = 21;
                return this._private_encryptString(JSON.stringify(item.createContentJSONFromProperties()), ek, ak, item.uuid, version);

              case 21:
                ciphertext = _context20.sent;

                if (!(version === "001")) {
                  _context20.next = 27;
                  break;
                }

                _context20.next = 25;
                return this.crypto.hmac256(ciphertext, ak);

              case 25:
                authHash = _context20.sent;

                params.auth_hash = authHash;

              case 27:

                params.content = ciphertext;
                return _context20.abrupt('return', params);

              case 29:
              case 'end':
                return _context20.stop();
            }
          }
        }, _callee20, this);
      }));

      function encryptItem(_x36, _x37) {
        return _ref23.apply(this, arguments);
      }

      return encryptItem;
    }()
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
    value: function () {
      var _ref24 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee21(item, keys) {
        var encryptedItemKey, requiresAuth, keyParams, item_key, ek, ak, itemParams, content;
        return _regenerator2.default.wrap(function _callee21$(_context21) {
          while (1) {
            switch (_context21.prev = _context21.next) {
              case 0:
                if (!(typeof item.content != "string")) {
                  _context21.next = 2;
                  break;
                }

                return _context21.abrupt('return');

              case 2:
                if (!item.content.startsWith("000")) {
                  _context21.next = 14;
                  break;
                }

                _context21.prev = 3;
                _context21.t0 = JSON;
                _context21.next = 7;
                return this.crypto.base64Decode(item.content.substring(3, item.content.length));

              case 7:
                _context21.t1 = _context21.sent;
                item.content = _context21.t0.parse.call(_context21.t0, _context21.t1);
                _context21.next = 13;
                break;

              case 11:
                _context21.prev = 11;
                _context21.t2 = _context21['catch'](3);

              case 13:
                return _context21.abrupt('return');

              case 14:
                if (item.enc_item_key) {
                  _context21.next = 17;
                  break;
                }

                // This needs to be here to continue, return otherwise
                console.log("Missing item encryption key, skipping decryption.");
                return _context21.abrupt('return');

              case 17:

                // decrypt encrypted key
                encryptedItemKey = item.enc_item_key;
                requiresAuth = true;

                if (!encryptedItemKey.startsWith("002") && !encryptedItemKey.startsWith("003")) {
                  // legacy encryption type, has no prefix
                  encryptedItemKey = "001" + encryptedItemKey;
                  requiresAuth = false;
                }
                keyParams = this.encryptionComponentsFromString(encryptedItemKey, keys.mk, keys.ak);

                // return if uuid in auth hash does not match item uuid. Signs of tampering.

                if (!(keyParams.uuid && keyParams.uuid !== item.uuid)) {
                  _context21.next = 25;
                  break;
                }

                if (!item.errorDecrypting) {
                  item.errorDecryptingValueChanged = true;
                }
                item.errorDecrypting = true;
                return _context21.abrupt('return');

              case 25:
                _context21.next = 27;
                return this.crypto.decryptText(keyParams, requiresAuth);

              case 27:
                item_key = _context21.sent;

                if (item_key) {
                  _context21.next = 32;
                  break;
                }

                if (!item.errorDecrypting) {
                  item.errorDecryptingValueChanged = true;
                }
                item.errorDecrypting = true;
                return _context21.abrupt('return');

              case 32:
                _context21.next = 34;
                return this.crypto.firstHalfOfKey(item_key);

              case 34:
                ek = _context21.sent;
                _context21.next = 37;
                return this.crypto.secondHalfOfKey(item_key);

              case 37:
                ak = _context21.sent;
                itemParams = this.encryptionComponentsFromString(item.content, ek, ak);

                // return if uuid in auth hash does not match item uuid. Signs of tampering.

                if (!(itemParams.uuid && itemParams.uuid !== item.uuid)) {
                  _context21.next = 43;
                  break;
                }

                if (!item.errorDecrypting) {
                  item.errorDecryptingValueChanged = true;
                }
                item.errorDecrypting = true;
                return _context21.abrupt('return');

              case 43:

                if (!itemParams.authHash) {
                  // legacy 001
                  itemParams.authHash = item.auth_hash;
                }

                _context21.next = 46;
                return this.crypto.decryptText(itemParams, true);

              case 46:
                content = _context21.sent;

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

              case 48:
              case 'end':
                return _context21.stop();
            }
          }
        }, _callee21, this, [[3, 11]]);
      }));

      function decryptItem(_x38, _x39) {
        return _ref24.apply(this, arguments);
      }

      return decryptItem;
    }()
  }, {
    key: 'decryptMultipleItems',
    value: function () {
      var _ref25 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee23(items, keys, throws) {
        var _this4 = this;

        var decrypt;
        return _regenerator2.default.wrap(function _callee23$(_context23) {
          while (1) {
            switch (_context23.prev = _context23.next) {
              case 0:
                decrypt = function () {
                  var _ref26 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee22(item) {
                    var isString;
                    return _regenerator2.default.wrap(function _callee22$(_context22) {
                      while (1) {
                        switch (_context22.prev = _context22.next) {
                          case 0:
                            if (!(item.deleted == true && item.content == null)) {
                              _context22.next = 2;
                              break;
                            }

                            return _context22.abrupt('return');

                          case 2:
                            isString = typeof item.content === 'string' || item.content instanceof String;

                            if (!isString) {
                              _context22.next = 17;
                              break;
                            }

                            _context22.prev = 4;
                            _context22.next = 7;
                            return _this4.decryptItem(item, keys);

                          case 7:
                            _context22.next = 17;
                            break;

                          case 9:
                            _context22.prev = 9;
                            _context22.t0 = _context22['catch'](4);

                            if (!item.errorDecrypting) {
                              item.errorDecryptingValueChanged = true;
                            }
                            item.errorDecrypting = true;

                            if (!throws) {
                              _context22.next = 15;
                              break;
                            }

                            throw _context22.t0;

                          case 15:
                            console.error("Error decrypting item", item, _context22.t0);
                            return _context22.abrupt('return');

                          case 17:
                          case 'end':
                            return _context22.stop();
                        }
                      }
                    }, _callee22, _this4, [[4, 9]]);
                  }));

                  return function decrypt(_x43) {
                    return _ref26.apply(this, arguments);
                  };
                }();

                return _context23.abrupt('return', Promise.all(items.map(function (item) {
                  return decrypt(item);
                })));

              case 2:
              case 'end':
                return _context23.stop();
            }
          }
        }, _callee23, this);
      }));

      function decryptMultipleItems(_x40, _x41, _x42) {
        return _ref25.apply(this, arguments);
      }

      return decryptMultipleItems;
    }()
  }]);
  return SFItemTransformer;
}();

;
var StandardFile = exports.StandardFile = function () {
  function StandardFile() {
    (0, _classCallCheck3.default)(this, StandardFile);

    // This library runs in native environments as well (react native)
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      // detect IE8 and above, and edge.
      // IE and Edge do not support pbkdf2 in WebCrypto, therefore we need to use CryptoJS
      var IEOrEdge = document.documentMode || /Edge/.test(navigator.userAgent);

      if (!IEOrEdge && window.crypto && window.crypto.subtle) {
        this.crypto = new SFCryptoWeb();
      } else {
        this.crypto = new SFCryptoJS();
      }

      this.crypto.SFJS = {
        version: this.version(),
        defaultPasswordGenerationCost: this.defaultPasswordGenerationCost()
      };

      this.itemTransformer = new SFItemTransformer(this.crypto);
    }
  }

  (0, _createClass3.default)(StandardFile, [{
    key: 'version',
    value: function version() {
      return "003";
    }
  }, {
    key: 'supportsPasswordDerivationCost',
    value: function supportsPasswordDerivationCost(cost) {
      // some passwords are created on platforms with stronger pbkdf2 capabilities, like iOS,
      // which CryptoJS can't handle here (WebCrypto can however).
      // if user has high password cost and is using browser that doesn't support WebCrypto,
      // we want to tell them that they can't login with this browser.
      if (cost > 5000) {
        return this.crypto instanceof SFCryptoWeb;
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
    key: 'isProtocolVersionOutdated',
    value: function isProtocolVersionOutdated(version) {
      // YYYY-MM-DD
      var expirationDates = {
        "001": Date.parse("2018-01-01"),
        "002": Date.parse("2019-06-01")
      };

      var date = expirationDates[version];
      if (!date) {
        // No expiration date, is active version
        return false;
      }
      var expired = new Date() > date;
      return expired;
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
  }]);
  return StandardFile;
}();

if (window) {
  window.StandardFile = StandardFile;
  window.SFJS = new StandardFile();
}
//# sourceMappingURL=transpiled.js.map
