"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SFAlertManager = exports.SFAlertManager = function () {
  function SFAlertManager() {
    _classCallCheck(this, SFAlertManager);
  }

  _createClass(SFAlertManager, [{
    key: "alert",
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(params) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", new Promise(function (resolve, reject) {
                  window.alert(params.text);
                  resolve();
                }));

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function alert(_x) {
        return _ref.apply(this, arguments);
      }

      return alert;
    }()
  }, {
    key: "confirm",
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(params) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt("return", new Promise(function (resolve, reject) {
                  if (window.confirm(params.text)) {
                    resolve();
                  } else {
                    reject();
                  }
                }));

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function confirm(_x2) {
        return _ref2.apply(this, arguments);
      }

      return confirm;
    }()
  }]);

  return SFAlertManager;
}();

;
var SFAuthManager = exports.SFAuthManager = function () {
  function SFAuthManager(storageManager, httpManager, alertManager, timeout) {
    _classCallCheck(this, SFAuthManager);

    SFAuthManager.DidSignOutEvent = "DidSignOutEvent";
    SFAuthManager.WillSignInEvent = "WillSignInEvent";
    SFAuthManager.DidSignInEvent = "DidSignInEvent";

    this.httpManager = httpManager;
    this.storageManager = storageManager;
    this.alertManager = alertManager || new SFAlertManager();
    this.$timeout = timeout || setTimeout.bind(window);

    this.eventHandlers = [];
  }

  _createClass(SFAuthManager, [{
    key: "addEventHandler",
    value: function addEventHandler(handler) {
      this.eventHandlers.push(handler);
      return handler;
    }
  }, {
    key: "removeEventHandler",
    value: function removeEventHandler(handler) {
      _.pull(this.eventHandlers, handler);
    }
  }, {
    key: "notifyEvent",
    value: function notifyEvent(event, data) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.eventHandlers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var handler = _step.value;

          handler(event, data || {});
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
  }, {
    key: "saveKeys",
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(keys) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                this._keys = keys;
                _context3.next = 3;
                return this.storageManager.setItem("mk", keys.mk);

              case 3:
                _context3.next = 5;
                return this.storageManager.setItem("ak", keys.ak);

              case 5:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function saveKeys(_x3) {
        return _ref3.apply(this, arguments);
      }

      return saveKeys;
    }()
  }, {
    key: "signout",
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(clearAllData) {
        var _this = this;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                this._keys = null;
                this._authParams = null;

                if (!clearAllData) {
                  _context4.next = 6;
                  break;
                }

                return _context4.abrupt("return", this.storageManager.clearAllData().then(function () {
                  _this.notifyEvent(SFAuthManager.DidSignOutEvent);
                }));

              case 6:
                this.notifyEvent(SFAuthManager.DidSignOutEvent);

              case 7:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function signout(_x4) {
        return _ref4.apply(this, arguments);
      }

      return signout;
    }()
  }, {
    key: "keys",
    value: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        var mk;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (this._keys) {
                  _context5.next = 11;
                  break;
                }

                _context5.next = 3;
                return this.storageManager.getItem("mk");

              case 3:
                mk = _context5.sent;

                if (mk) {
                  _context5.next = 6;
                  break;
                }

                return _context5.abrupt("return", null);

              case 6:
                _context5.t0 = mk;
                _context5.next = 9;
                return this.storageManager.getItem("ak");

              case 9:
                _context5.t1 = _context5.sent;
                this._keys = {
                  mk: _context5.t0,
                  ak: _context5.t1
                };

              case 11:
                return _context5.abrupt("return", this._keys);

              case 12:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function keys() {
        return _ref5.apply(this, arguments);
      }

      return keys;
    }()
  }, {
    key: "getAuthParams",
    value: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
        var data;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                if (this._authParams) {
                  _context6.next = 5;
                  break;
                }

                _context6.next = 3;
                return this.storageManager.getItem("auth_params");

              case 3:
                data = _context6.sent;

                this._authParams = JSON.parse(data);

              case 5:
                if (!(this._authParams && !this._authParams.version)) {
                  _context6.next = 9;
                  break;
                }

                _context6.next = 8;
                return this.defaultProtocolVersion();

              case 8:
                this._authParams.version = _context6.sent;

              case 9:
                return _context6.abrupt("return", this._authParams);

              case 10:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function getAuthParams() {
        return _ref6.apply(this, arguments);
      }

      return getAuthParams;
    }()
  }, {
    key: "defaultProtocolVersion",
    value: function () {
      var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
        var keys;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return this.keys();

              case 2:
                keys = _context7.sent;

                if (!(keys && keys.ak)) {
                  _context7.next = 7;
                  break;
                }

                return _context7.abrupt("return", "002");

              case 7:
                return _context7.abrupt("return", "001");

              case 8:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function defaultProtocolVersion() {
        return _ref7.apply(this, arguments);
      }

      return defaultProtocolVersion;
    }()
  }, {
    key: "protocolVersion",
    value: function () {
      var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
        var authParams;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return this.getAuthParams();

              case 2:
                authParams = _context8.sent;

                if (!(authParams && authParams.version)) {
                  _context8.next = 5;
                  break;
                }

                return _context8.abrupt("return", authParams.version);

              case 5:
                return _context8.abrupt("return", this.defaultProtocolVersion());

              case 6:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function protocolVersion() {
        return _ref8.apply(this, arguments);
      }

      return protocolVersion;
    }()
  }, {
    key: "getAuthParamsForEmail",
    value: function () {
      var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(url, email, extraParams) {
        var _this2 = this;

        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                return _context9.abrupt("return", new Promise(function (resolve, reject) {
                  var requestUrl = url + "/auth/params";
                  _this2.httpManager.getAbsolute(requestUrl, _.merge({ email: email }, extraParams), function (response) {
                    resolve(response);
                  }, function (response) {
                    console.error("Error getting auth params", response);
                    if ((typeof response === "undefined" ? "undefined" : _typeof(response)) !== 'object') {
                      response = { error: { message: "A server error occurred while trying to sign in. Please try again." } };
                    }
                    resolve(response);
                  });
                }));

              case 1:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function getAuthParamsForEmail(_x5, _x6, _x7) {
        return _ref9.apply(this, arguments);
      }

      return getAuthParamsForEmail;
    }()
  }, {
    key: "lock",
    value: function lock() {
      this.locked = true;
    }
  }, {
    key: "unlock",
    value: function unlock() {
      this.locked = false;
    }
  }, {
    key: "isLocked",
    value: function isLocked() {
      return this.locked == true;
    }
  }, {
    key: "unlockAndResolve",
    value: function unlockAndResolve(resolve, param) {
      this.unlock();
      resolve(param);
    }
  }, {
    key: "login",
    value: function () {
      var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(url, email, password, strictSignin, extraParams) {
        var _this3 = this;

        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                return _context12.abrupt("return", new Promise(function () {
                  var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(resolve, reject) {
                    var existingKeys, authParams, message, _message, abort, _message2, minimum, _message3, latestVersion, _message4, keys, requestUrl, params;

                    return regeneratorRuntime.wrap(function _callee11$(_context11) {
                      while (1) {
                        switch (_context11.prev = _context11.next) {
                          case 0:
                            _context11.next = 2;
                            return _this3.keys();

                          case 2:
                            existingKeys = _context11.sent;

                            if (!(existingKeys != null)) {
                              _context11.next = 6;
                              break;
                            }

                            resolve({ error: { message: "Cannot log in because already signed in." } });
                            return _context11.abrupt("return");

                          case 6:
                            if (!_this3.isLocked()) {
                              _context11.next = 9;
                              break;
                            }

                            resolve({ error: { message: "Login already in progress." } });
                            return _context11.abrupt("return");

                          case 9:

                            _this3.lock();

                            _this3.notifyEvent(SFAuthManager.WillSignInEvent);

                            _context11.next = 13;
                            return _this3.getAuthParamsForEmail(url, email, extraParams);

                          case 13:
                            authParams = _context11.sent;


                            // SF3 requires a unique identifier in the auth params
                            authParams.identifier = email;

                            if (!authParams.error) {
                              _context11.next = 18;
                              break;
                            }

                            _this3.unlockAndResolve(resolve, authParams);
                            return _context11.abrupt("return");

                          case 18:
                            if (!(!authParams || !authParams.pw_cost)) {
                              _context11.next = 21;
                              break;
                            }

                            _this3.unlockAndResolve(resolve, { error: { message: "Invalid email or password." } });
                            return _context11.abrupt("return");

                          case 21:
                            if (SFJS.supportedVersions().includes(authParams.version)) {
                              _context11.next = 25;
                              break;
                            }

                            if (SFJS.isVersionNewerThanLibraryVersion(authParams.version)) {
                              // The user has a new account type, but is signing in to an older client.
                              message = "This version of the application does not support your newer account type. Please upgrade to the latest version of Standard Notes to sign in.";
                            } else {
                              // The user has a very old account type, which is no longer supported by this client
                              message = "The protocol version associated with your account is outdated and no longer supported by this application. Please visit standardnotes.org/help/security for more information.";
                            }
                            _this3.unlockAndResolve(resolve, { error: { message: message } });
                            return _context11.abrupt("return");

                          case 25:
                            if (!SFJS.isProtocolVersionOutdated(authParams.version)) {
                              _context11.next = 32;
                              break;
                            }

                            _message = "The encryption version for your account, " + authParams.version + ", is outdated and requires upgrade. You may proceed with login, but are advised to perform a security update using the web or desktop application. Please visit standardnotes.org/help/security for more information.";
                            abort = false;
                            _context11.next = 30;
                            return _this3.alertManager.confirm({
                              title: "Update Needed",
                              text: _message,
                              confirmButtonText: "Sign In"
                            }).catch(function () {
                              _this3.unlockAndResolve(resolve, { error: {} });
                              abort = true;
                            });

                          case 30:
                            if (!abort) {
                              _context11.next = 32;
                              break;
                            }

                            return _context11.abrupt("return");

                          case 32:
                            if (SFJS.supportsPasswordDerivationCost(authParams.pw_cost)) {
                              _context11.next = 36;
                              break;
                            }

                            _message2 = "Your account was created on a platform with higher security capabilities than this browser supports. " + "If we attempted to generate your login keys here, it would take hours. " + "Please use a browser with more up to date security capabilities, like Google Chrome or Firefox, to log in.";

                            _this3.unlockAndResolve(resolve, { error: { message: _message2 } });
                            return _context11.abrupt("return");

                          case 36:
                            minimum = SFJS.costMinimumForVersion(authParams.version);

                            if (!(authParams.pw_cost < minimum)) {
                              _context11.next = 41;
                              break;
                            }

                            _message3 = "Unable to login due to insecure password parameters. Please visit standardnotes.org/help/security for more information.";

                            _this3.unlockAndResolve(resolve, { error: { message: _message3 } });
                            return _context11.abrupt("return");

                          case 41:
                            if (!strictSignin) {
                              _context11.next = 47;
                              break;
                            }

                            // Refuse sign in if authParams.version is anything but the latest version
                            latestVersion = SFJS.version();

                            if (!(authParams.version !== latestVersion)) {
                              _context11.next = 47;
                              break;
                            }

                            _message4 = "Strict sign in refused server sign in parameters. The latest security version is " + latestVersion + ", but your account is reported to have version " + authParams.version + ". If you'd like to proceed with sign in anyway, please disable strict sign in and try again.";

                            _this3.unlockAndResolve(resolve, { error: { message: _message4 } });
                            return _context11.abrupt("return");

                          case 47:
                            _context11.next = 49;
                            return SFJS.crypto.computeEncryptionKeysForUser(password, authParams);

                          case 49:
                            keys = _context11.sent;
                            requestUrl = url + "/auth/sign_in";
                            params = _.merge({ password: keys.pw, email: email }, extraParams);


                            _this3.httpManager.postAbsolute(requestUrl, params, function () {
                              var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(response) {
                                return regeneratorRuntime.wrap(function _callee10$(_context10) {
                                  while (1) {
                                    switch (_context10.prev = _context10.next) {
                                      case 0:
                                        _this3.notifyEvent(SFAuthManager.DidSignInEvent);
                                        _context10.next = 3;
                                        return _this3.handleAuthResponse(response, email, url, authParams, keys);

                                      case 3:
                                        _this3.$timeout(function () {
                                          return _this3.unlockAndResolve(resolve, response);
                                        });

                                      case 4:
                                      case "end":
                                        return _context10.stop();
                                    }
                                  }
                                }, _callee10, _this3);
                              }));

                              return function (_x15) {
                                return _ref12.apply(this, arguments);
                              };
                            }(), function (response) {
                              console.error("Error logging in", response);
                              if ((typeof response === "undefined" ? "undefined" : _typeof(response)) !== 'object') {
                                response = { error: { message: "A server error occurred while trying to sign in. Please try again." } };
                              }
                              _this3.$timeout(function () {
                                return _this3.unlockAndResolve(resolve, response);
                              });
                            });

                          case 53:
                          case "end":
                            return _context11.stop();
                        }
                      }
                    }, _callee11, _this3);
                  }));

                  return function (_x13, _x14) {
                    return _ref11.apply(this, arguments);
                  };
                }()));

              case 1:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function login(_x8, _x9, _x10, _x11, _x12) {
        return _ref10.apply(this, arguments);
      }

      return login;
    }()
  }, {
    key: "register",
    value: function register(url, email, password) {
      var _this4 = this;

      return new Promise(function () {
        var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14(resolve, reject) {
          var results, keys, authParams, requestUrl, params;
          return regeneratorRuntime.wrap(function _callee14$(_context14) {
            while (1) {
              switch (_context14.prev = _context14.next) {
                case 0:
                  if (!_this4.isLocked()) {
                    _context14.next = 3;
                    break;
                  }

                  resolve({ error: { message: "Register already in progress." } });
                  return _context14.abrupt("return");

                case 3:

                  _this4.lock();

                  _context14.next = 6;
                  return SFJS.crypto.generateInitialKeysAndAuthParamsForUser(email, password);

                case 6:
                  results = _context14.sent;
                  keys = results.keys;
                  authParams = results.authParams;
                  requestUrl = url + "/auth";
                  params = _.merge({ password: keys.pw, email: email }, authParams);


                  _this4.httpManager.postAbsolute(requestUrl, params, function () {
                    var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(response) {
                      return regeneratorRuntime.wrap(function _callee13$(_context13) {
                        while (1) {
                          switch (_context13.prev = _context13.next) {
                            case 0:
                              _context13.next = 2;
                              return _this4.handleAuthResponse(response, email, url, authParams, keys);

                            case 2:
                              _this4.unlockAndResolve(resolve, response);

                            case 3:
                            case "end":
                              return _context13.stop();
                          }
                        }
                      }, _callee13, _this4);
                    }));

                    return function (_x18) {
                      return _ref14.apply(this, arguments);
                    };
                  }(), function (response) {
                    console.error("Registration error", response);
                    if ((typeof response === "undefined" ? "undefined" : _typeof(response)) !== 'object') {
                      response = { error: { message: "A server error occurred while trying to register. Please try again." } };
                    }
                    _this4.unlockAndResolve(resolve, response);
                  });

                case 12:
                case "end":
                  return _context14.stop();
              }
            }
          }, _callee14, _this4);
        }));

        return function (_x16, _x17) {
          return _ref13.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "changePassword",
    value: function () {
      var _ref15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17(url, email, current_server_pw, newKeys, newAuthParams) {
        var _this5 = this;

        return regeneratorRuntime.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                return _context17.abrupt("return", new Promise(function () {
                  var _ref16 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(resolve, reject) {
                    var newServerPw, requestUrl, params;
                    return regeneratorRuntime.wrap(function _callee16$(_context16) {
                      while (1) {
                        switch (_context16.prev = _context16.next) {
                          case 0:
                            if (!_this5.isLocked()) {
                              _context16.next = 3;
                              break;
                            }

                            resolve({ error: { message: "Change password already in progress." } });
                            return _context16.abrupt("return");

                          case 3:

                            _this5.lock();

                            newServerPw = newKeys.pw;
                            requestUrl = url + "/auth/change_pw";
                            params = _.merge({ new_password: newServerPw, current_password: current_server_pw }, newAuthParams);


                            _this5.httpManager.postAbsolute(requestUrl, params, function () {
                              var _ref17 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15(response) {
                                return regeneratorRuntime.wrap(function _callee15$(_context15) {
                                  while (1) {
                                    switch (_context15.prev = _context15.next) {
                                      case 0:
                                        _context15.next = 2;
                                        return _this5.handleAuthResponse(response, email, null, newAuthParams, newKeys);

                                      case 2:
                                        _this5.unlockAndResolve(resolve, response);

                                      case 3:
                                      case "end":
                                        return _context15.stop();
                                    }
                                  }
                                }, _callee15, _this5);
                              }));

                              return function (_x26) {
                                return _ref17.apply(this, arguments);
                              };
                            }(), function (response) {
                              if ((typeof response === "undefined" ? "undefined" : _typeof(response)) !== 'object') {
                                response = { error: { message: "Something went wrong while changing your password. Your password was not changed. Please try again." } };
                              }
                              _this5.unlockAndResolve(resolve, response);
                            });

                          case 8:
                          case "end":
                            return _context16.stop();
                        }
                      }
                    }, _callee16, _this5);
                  }));

                  return function (_x24, _x25) {
                    return _ref16.apply(this, arguments);
                  };
                }()));

              case 1:
              case "end":
                return _context17.stop();
            }
          }
        }, _callee17, this);
      }));

      function changePassword(_x19, _x20, _x21, _x22, _x23) {
        return _ref15.apply(this, arguments);
      }

      return changePassword;
    }()
  }, {
    key: "handleAuthResponse",
    value: function () {
      var _ref18 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18(response, email, url, authParams, keys) {
        return regeneratorRuntime.wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                if (!url) {
                  _context18.next = 3;
                  break;
                }

                _context18.next = 3;
                return this.storageManager.setItem("server", url);

              case 3:
                this._authParams = authParams;
                _context18.next = 6;
                return this.storageManager.setItem("auth_params", JSON.stringify(authParams));

              case 6:
                _context18.next = 8;
                return this.storageManager.setItem("jwt", response.token);

              case 8:
                return _context18.abrupt("return", this.saveKeys(keys));

              case 9:
              case "end":
                return _context18.stop();
            }
          }
        }, _callee18, this);
      }));

      function handleAuthResponse(_x27, _x28, _x29, _x30, _x31) {
        return _ref18.apply(this, arguments);
      }

      return handleAuthResponse;
    }()
  }]);

  return SFAuthManager;
}();

;var globalScope = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : null;

var SFHttpManager = exports.SFHttpManager = function () {
  function SFHttpManager(timeout) {
    _classCallCheck(this, SFHttpManager);

    // calling callbacks in a $timeout allows UI to update
    this.$timeout = timeout || setTimeout.bind(globalScope);
  }

  _createClass(SFHttpManager, [{
    key: "setJWTRequestHandler",
    value: function setJWTRequestHandler(handler) {
      this.jwtRequestHandler = handler;
    }
  }, {
    key: "setAuthHeadersForRequest",
    value: function () {
      var _ref19 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19(request) {
        var token;
        return regeneratorRuntime.wrap(function _callee19$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
                _context19.next = 2;
                return this.jwtRequestHandler();

              case 2:
                token = _context19.sent;

                if (token) {
                  request.setRequestHeader('Authorization', 'Bearer ' + token);
                }

              case 4:
              case "end":
                return _context19.stop();
            }
          }
        }, _callee19, this);
      }));

      function setAuthHeadersForRequest(_x32) {
        return _ref19.apply(this, arguments);
      }

      return setAuthHeadersForRequest;
    }()
  }, {
    key: "postAbsolute",
    value: function () {
      var _ref20 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20(url, params, onsuccess, onerror) {
        return regeneratorRuntime.wrap(function _callee20$(_context20) {
          while (1) {
            switch (_context20.prev = _context20.next) {
              case 0:
                return _context20.abrupt("return", this.httpRequest("post", url, params, onsuccess, onerror));

              case 1:
              case "end":
                return _context20.stop();
            }
          }
        }, _callee20, this);
      }));

      function postAbsolute(_x33, _x34, _x35, _x36) {
        return _ref20.apply(this, arguments);
      }

      return postAbsolute;
    }()
  }, {
    key: "patchAbsolute",
    value: function () {
      var _ref21 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21(url, params, onsuccess, onerror) {
        return regeneratorRuntime.wrap(function _callee21$(_context21) {
          while (1) {
            switch (_context21.prev = _context21.next) {
              case 0:
                return _context21.abrupt("return", this.httpRequest("patch", url, params, onsuccess, onerror));

              case 1:
              case "end":
                return _context21.stop();
            }
          }
        }, _callee21, this);
      }));

      function patchAbsolute(_x37, _x38, _x39, _x40) {
        return _ref21.apply(this, arguments);
      }

      return patchAbsolute;
    }()
  }, {
    key: "getAbsolute",
    value: function () {
      var _ref22 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee22(url, params, onsuccess, onerror) {
        return regeneratorRuntime.wrap(function _callee22$(_context22) {
          while (1) {
            switch (_context22.prev = _context22.next) {
              case 0:
                return _context22.abrupt("return", this.httpRequest("get", url, params, onsuccess, onerror));

              case 1:
              case "end":
                return _context22.stop();
            }
          }
        }, _callee22, this);
      }));

      function getAbsolute(_x41, _x42, _x43, _x44) {
        return _ref22.apply(this, arguments);
      }

      return getAbsolute;
    }()
  }, {
    key: "httpRequest",
    value: function () {
      var _ref23 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee24(verb, url, params, onsuccess, onerror) {
        var _this6 = this;

        return regeneratorRuntime.wrap(function _callee24$(_context24) {
          while (1) {
            switch (_context24.prev = _context24.next) {
              case 0:
                return _context24.abrupt("return", new Promise(function () {
                  var _ref24 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee23(resolve, reject) {
                    var xmlhttp;
                    return regeneratorRuntime.wrap(function _callee23$(_context23) {
                      while (1) {
                        switch (_context23.prev = _context23.next) {
                          case 0:
                            xmlhttp = new XMLHttpRequest();


                            xmlhttp.onreadystatechange = function () {
                              if (xmlhttp.readyState == 4) {
                                var response = xmlhttp.responseText;
                                if (response) {
                                  try {
                                    response = JSON.parse(response);
                                  } catch (e) {}
                                }

                                if (xmlhttp.status >= 200 && xmlhttp.status <= 299) {
                                  _this6.$timeout(function () {
                                    onsuccess(response);
                                    resolve(response);
                                  });
                                } else {
                                  console.error("Request error:", response);
                                  _this6.$timeout(function () {
                                    onerror(response, xmlhttp.status);
                                    reject(response);
                                  });
                                }
                              }
                            };

                            if (verb == "get" && Object.keys(params).length > 0) {
                              url = url + _this6.formatParams(params);
                            }

                            xmlhttp.open(verb, url, true);
                            _context23.next = 6;
                            return _this6.setAuthHeadersForRequest(xmlhttp);

                          case 6:
                            xmlhttp.setRequestHeader('Content-type', 'application/json');

                            if (verb == "post" || verb == "patch") {
                              xmlhttp.send(JSON.stringify(params));
                            } else {
                              xmlhttp.send();
                            }

                          case 8:
                          case "end":
                            return _context23.stop();
                        }
                      }
                    }, _callee23, _this6);
                  }));

                  return function (_x50, _x51) {
                    return _ref24.apply(this, arguments);
                  };
                }()));

              case 1:
              case "end":
                return _context24.stop();
            }
          }
        }, _callee24, this);
      }));

      function httpRequest(_x45, _x46, _x47, _x48, _x49) {
        return _ref23.apply(this, arguments);
      }

      return httpRequest;
    }()
  }, {
    key: "formatParams",
    value: function formatParams(params) {
      return "?" + Object.keys(params).map(function (key) {
        return key + "=" + encodeURIComponent(params[key]);
      }).join("&");
    }
  }]);

  return SFHttpManager;
}();

;
var SFMigrationManager = exports.SFMigrationManager = function () {
  function SFMigrationManager(modelManager, syncManager, storageManager) {
    var _this7 = this;

    _classCallCheck(this, SFMigrationManager);

    this.modelManager = modelManager;
    this.syncManager = syncManager;
    this.storageManager = storageManager;

    this.loadMigrations();

    this.syncManager.addEventHandler(function () {
      var _ref25 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee25(event, data) {
        var dataLoadedEvent, syncCompleteEvent;
        return regeneratorRuntime.wrap(function _callee25$(_context25) {
          while (1) {
            switch (_context25.prev = _context25.next) {
              case 0:
                dataLoadedEvent = event == "local-data-loaded";
                syncCompleteEvent = event == "sync:completed";

                if (!(dataLoadedEvent || syncCompleteEvent)) {
                  _context25.next = 9;
                  break;
                }

                if (dataLoadedEvent) {
                  _this7.receivedLocalDataEvent = true;
                } else if (syncCompleteEvent) {
                  _this7.receivedSyncCompletedEvent = true;
                }

                // We want to run pending migrations only after local data has been loaded, and a sync has been completed.

                if (!(_this7.receivedLocalDataEvent && _this7.receivedSyncCompletedEvent)) {
                  _context25.next = 9;
                  break;
                }

                if (!(data && data.initialSync)) {
                  _context25.next = 8;
                  break;
                }

                _context25.next = 8;
                return _this7.clearCompletedMigrations();

              case 8:
                _this7.runPendingMigrations();

              case 9:
              case "end":
                return _context25.stop();
            }
          }
        }, _callee25, _this7);
      }));

      return function (_x52, _x53) {
        return _ref25.apply(this, arguments);
      };
    }());
  }

  _createClass(SFMigrationManager, [{
    key: "clearCompletedMigrations",
    value: function () {
      var _ref26 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee26() {
        var completed;
        return regeneratorRuntime.wrap(function _callee26$(_context26) {
          while (1) {
            switch (_context26.prev = _context26.next) {
              case 0:
                _context26.next = 2;
                return this.getCompletedMigrations();

              case 2:
                completed = _context26.sent;

                completed.length = 0;

              case 4:
              case "end":
                return _context26.stop();
            }
          }
        }, _callee26, this);
      }));

      function clearCompletedMigrations() {
        return _ref26.apply(this, arguments);
      }

      return clearCompletedMigrations;
    }()
  }, {
    key: "loadMigrations",
    value: function loadMigrations() {
      this.migrations = this.registeredMigrations();
    }
  }, {
    key: "registeredMigrations",
    value: function registeredMigrations() {
      // Subclasses should return an array of migrations here.
      // Migrations should have a unique `name`, `content_type`,
      // and `handler`, which is a function that accepts an array of matching items to migration.
    }
  }, {
    key: "runPendingMigrations",
    value: function () {
      var _ref27 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee27() {
        var pending, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, migration, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, item, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4;

        return regeneratorRuntime.wrap(function _callee27$(_context27) {
          while (1) {
            switch (_context27.prev = _context27.next) {
              case 0:
                _context27.next = 2;
                return this.getPendingMigrations();

              case 2:
                pending = _context27.sent;


                // run in pre loop, keeping in mind that a migration may be run twice: when offline then again when signing in.
                // we need to reset the items to a new array.
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context27.prev = 6;
                for (_iterator2 = pending[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  migration = _step2.value;

                  migration.items = [];
                }
                _context27.next = 14;
                break;

              case 10:
                _context27.prev = 10;
                _context27.t0 = _context27["catch"](6);
                _didIteratorError2 = true;
                _iteratorError2 = _context27.t0;

              case 14:
                _context27.prev = 14;
                _context27.prev = 15;

                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }

              case 17:
                _context27.prev = 17;

                if (!_didIteratorError2) {
                  _context27.next = 20;
                  break;
                }

                throw _iteratorError2;

              case 20:
                return _context27.finish(17);

              case 21:
                return _context27.finish(14);

              case 22:
                _iteratorNormalCompletion3 = true;
                _didIteratorError3 = false;
                _iteratorError3 = undefined;
                _context27.prev = 25;
                _iterator3 = this.modelManager.allItems[Symbol.iterator]();

              case 27:
                if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                  _context27.next = 51;
                  break;
                }

                item = _step3.value;
                _iteratorNormalCompletion5 = true;
                _didIteratorError5 = false;
                _iteratorError5 = undefined;
                _context27.prev = 32;

                for (_iterator5 = pending[Symbol.iterator](); !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                  migration = _step5.value;

                  if (item.content_type == migration.content_type) {
                    migration.items.push(item);
                  }
                }
                _context27.next = 40;
                break;

              case 36:
                _context27.prev = 36;
                _context27.t1 = _context27["catch"](32);
                _didIteratorError5 = true;
                _iteratorError5 = _context27.t1;

              case 40:
                _context27.prev = 40;
                _context27.prev = 41;

                if (!_iteratorNormalCompletion5 && _iterator5.return) {
                  _iterator5.return();
                }

              case 43:
                _context27.prev = 43;

                if (!_didIteratorError5) {
                  _context27.next = 46;
                  break;
                }

                throw _iteratorError5;

              case 46:
                return _context27.finish(43);

              case 47:
                return _context27.finish(40);

              case 48:
                _iteratorNormalCompletion3 = true;
                _context27.next = 27;
                break;

              case 51:
                _context27.next = 57;
                break;

              case 53:
                _context27.prev = 53;
                _context27.t2 = _context27["catch"](25);
                _didIteratorError3 = true;
                _iteratorError3 = _context27.t2;

              case 57:
                _context27.prev = 57;
                _context27.prev = 58;

                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                  _iterator3.return();
                }

              case 60:
                _context27.prev = 60;

                if (!_didIteratorError3) {
                  _context27.next = 63;
                  break;
                }

                throw _iteratorError3;

              case 63:
                return _context27.finish(60);

              case 64:
                return _context27.finish(57);

              case 65:
                _iteratorNormalCompletion4 = true;
                _didIteratorError4 = false;
                _iteratorError4 = undefined;
                _context27.prev = 68;


                for (_iterator4 = pending[Symbol.iterator](); !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                  migration = _step4.value;

                  if (migration.items && migration.items.length > 0) {
                    this.runMigration(migration, migration.items);
                  } else {
                    this.markMigrationCompleted(migration);
                  }
                }
                _context27.next = 76;
                break;

              case 72:
                _context27.prev = 72;
                _context27.t3 = _context27["catch"](68);
                _didIteratorError4 = true;
                _iteratorError4 = _context27.t3;

              case 76:
                _context27.prev = 76;
                _context27.prev = 77;

                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                  _iterator4.return();
                }

              case 79:
                _context27.prev = 79;

                if (!_didIteratorError4) {
                  _context27.next = 82;
                  break;
                }

                throw _iteratorError4;

              case 82:
                return _context27.finish(79);

              case 83:
                return _context27.finish(76);

              case 84:
              case "end":
                return _context27.stop();
            }
          }
        }, _callee27, this, [[6, 10, 14, 22], [15,, 17, 21], [25, 53, 57, 65], [32, 36, 40, 48], [41,, 43, 47], [58,, 60, 64], [68, 72, 76, 84], [77,, 79, 83]]);
      }));

      function runPendingMigrations() {
        return _ref27.apply(this, arguments);
      }

      return runPendingMigrations;
    }()
  }, {
    key: "encode",
    value: function encode(text) {
      return window.btoa(text);
    }
  }, {
    key: "decode",
    value: function decode(text) {
      return window.atob(text);
    }
  }, {
    key: "getCompletedMigrations",
    value: function () {
      var _ref28 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee28() {
        var rawCompleted;
        return regeneratorRuntime.wrap(function _callee28$(_context28) {
          while (1) {
            switch (_context28.prev = _context28.next) {
              case 0:
                if (this._completed) {
                  _context28.next = 5;
                  break;
                }

                _context28.next = 3;
                return this.storageManager.getItem("migrations");

              case 3:
                rawCompleted = _context28.sent;

                if (rawCompleted) {
                  this._completed = JSON.parse(rawCompleted);
                } else {
                  this._completed = [];
                }

              case 5:
                return _context28.abrupt("return", this._completed);

              case 6:
              case "end":
                return _context28.stop();
            }
          }
        }, _callee28, this);
      }));

      function getCompletedMigrations() {
        return _ref28.apply(this, arguments);
      }

      return getCompletedMigrations;
    }()
  }, {
    key: "getPendingMigrations",
    value: function () {
      var _ref29 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee29() {
        var _this8 = this;

        var completed;
        return regeneratorRuntime.wrap(function _callee29$(_context29) {
          while (1) {
            switch (_context29.prev = _context29.next) {
              case 0:
                _context29.next = 2;
                return this.getCompletedMigrations();

              case 2:
                completed = _context29.sent;
                return _context29.abrupt("return", this.migrations.filter(function (migration) {
                  // if the name is not found in completed, then it is pending.
                  return completed.indexOf(_this8.encode(migration.name)) == -1;
                }));

              case 4:
              case "end":
                return _context29.stop();
            }
          }
        }, _callee29, this);
      }));

      function getPendingMigrations() {
        return _ref29.apply(this, arguments);
      }

      return getPendingMigrations;
    }()
  }, {
    key: "markMigrationCompleted",
    value: function () {
      var _ref30 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee30(migration) {
        var completed;
        return regeneratorRuntime.wrap(function _callee30$(_context30) {
          while (1) {
            switch (_context30.prev = _context30.next) {
              case 0:
                _context30.next = 2;
                return this.getCompletedMigrations();

              case 2:
                completed = _context30.sent;

                completed.push(this.encode(migration.name));
                this.storageManager.setItem("migrations", JSON.stringify(completed));

              case 5:
              case "end":
                return _context30.stop();
            }
          }
        }, _callee30, this);
      }));

      function markMigrationCompleted(_x54) {
        return _ref30.apply(this, arguments);
      }

      return markMigrationCompleted;
    }()
  }, {
    key: "runMigration",
    value: function () {
      var _ref31 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee31(migration, items) {
        return regeneratorRuntime.wrap(function _callee31$(_context31) {
          while (1) {
            switch (_context31.prev = _context31.next) {
              case 0:
                console.log("Running migration:", migration.name);
                migration.handler(items);
                this.markMigrationCompleted(migration);

              case 3:
              case "end":
                return _context31.stop();
            }
          }
        }, _callee31, this);
      }));

      function runMigration(_x55, _x56) {
        return _ref31.apply(this, arguments);
      }

      return runMigration;
    }()
  }]);

  return SFMigrationManager;
}();

;
var SFModelManager = exports.SFModelManager = function () {
  function SFModelManager(timeout) {
    _classCallCheck(this, SFModelManager);

    SFModelManager.MappingSourceRemoteRetrieved = "MappingSourceRemoteRetrieved";
    SFModelManager.MappingSourceRemoteSaved = "MappingSourceRemoteSaved";
    SFModelManager.MappingSourceLocalSaved = "MappingSourceLocalSaved";
    SFModelManager.MappingSourceLocalRetrieved = "MappingSourceLocalRetrieved";
    SFModelManager.MappingSourceComponentRetrieved = "MappingSourceComponentRetrieved";
    SFModelManager.MappingSourceDesktopInstalled = "MappingSourceDesktopInstalled"; // When a component is installed by the desktop and some of its values change
    SFModelManager.MappingSourceRemoteActionRetrieved = "MappingSourceRemoteActionRetrieved"; /* aciton-based Extensions like note history */
    SFModelManager.MappingSourceFileImport = "MappingSourceFileImport";

    SFModelManager.isMappingSourceRetrieved = function (source) {
      return [SFModelManager.MappingSourceRemoteRetrieved, SFModelManager.MappingSourceComponentRetrieved, SFModelManager.MappingSourceRemoteActionRetrieved].includes(source);
    };

    this.$timeout = timeout || setTimeout.bind(window);

    this.itemSyncObservers = [];
    this.itemsPendingRemoval = [];
    this.items = [];
    this.itemsHash = {};
    this.missedReferences = {};
    this.uuidChangeObservers = [];
  }

  _createClass(SFModelManager, [{
    key: "handleSignout",
    value: function handleSignout() {
      this.items.length = 0;
      this.itemsHash = {};
      this.itemsPendingRemoval.length = 0;
      this.missedReferences = {};
    }
  }, {
    key: "addModelUuidChangeObserver",
    value: function addModelUuidChangeObserver(id, callback) {
      this.uuidChangeObservers.push({ id: id, callback: callback });
    }
  }, {
    key: "notifyObserversOfUuidChange",
    value: function notifyObserversOfUuidChange(oldItem, newItem) {
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = this.uuidChangeObservers[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var observer = _step6.value;

          observer.callback(oldItem, newItem);
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }
    }
  }, {
    key: "alternateUUIDForItem",
    value: function () {
      var _ref32 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee32(item) {
        var newItem, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, referencingObject;

        return regeneratorRuntime.wrap(function _callee32$(_context32) {
          while (1) {
            switch (_context32.prev = _context32.next) {
              case 0:
                // We need to clone this item and give it a new uuid, then delete item with old uuid from db (you can't modify uuid's in our indexeddb setup)
                newItem = this.createItem(item);
                _context32.next = 3;
                return SFJS.crypto.generateUUID();

              case 3:
                newItem.uuid = _context32.sent;


                // Update uuids of relationships
                newItem.informReferencesOfUUIDChange(item.uuid, newItem.uuid);
                this.informModelsOfUUIDChangeForItem(newItem, item.uuid, newItem.uuid);

                // the new item should inherit the original's relationships
                _iteratorNormalCompletion7 = true;
                _didIteratorError7 = false;
                _iteratorError7 = undefined;
                _context32.prev = 9;
                for (_iterator7 = item.referencingObjects[Symbol.iterator](); !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                  referencingObject = _step7.value;

                  referencingObject.setIsNoLongerBeingReferencedBy(item);
                  referencingObject.addItemAsRelationship(newItem);
                  referencingObject.setDirty(true);
                }

                _context32.next = 17;
                break;

              case 13:
                _context32.prev = 13;
                _context32.t0 = _context32["catch"](9);
                _didIteratorError7 = true;
                _iteratorError7 = _context32.t0;

              case 17:
                _context32.prev = 17;
                _context32.prev = 18;

                if (!_iteratorNormalCompletion7 && _iterator7.return) {
                  _iterator7.return();
                }

              case 20:
                _context32.prev = 20;

                if (!_didIteratorError7) {
                  _context32.next = 23;
                  break;
                }

                throw _iteratorError7;

              case 23:
                return _context32.finish(20);

              case 24:
                return _context32.finish(17);

              case 25:
                console.log(item.uuid, "-->", newItem.uuid);

                // Set to deleted, then run through mapping function so that observers can be notified
                item.deleted = true;
                item.content.references = [];
                // Don't set dirty, because we don't need to sync old item. alternating uuid only occurs in two cases:
                // signing in and merging offline data, or when a uuid-conflict occurs. In both cases, the original item never
                // saves to a server, so doesn't need to be synced.
                // informModelsOfUUIDChangeForItem may set this object to dirty, but we want to undo that here, so that the item gets deleted
                // right away through the mapping function.
                item.setDirty(false);
                this.mapResponseItemsToLocalModels([item], SFModelManager.MappingSourceLocalSaved);

                // add new item
                this.addItem(newItem);
                newItem.setDirty(true);

                // We don't need to do this. The only purpose would be to set up referencingObjects, but we do that above now.
                // this.resolveReferencesForItem(newItem);

                this.notifyObserversOfUuidChange(item, newItem);

                return _context32.abrupt("return", newItem);

              case 34:
              case "end":
                return _context32.stop();
            }
          }
        }, _callee32, this, [[9, 13, 17, 25], [18,, 20, 24]]);
      }));

      function alternateUUIDForItem(_x57) {
        return _ref32.apply(this, arguments);
      }

      return alternateUUIDForItem;
    }()
  }, {
    key: "informModelsOfUUIDChangeForItem",
    value: function informModelsOfUUIDChangeForItem(newItem, oldUUID, newUUID) {
      // some models that only have one-way relationships might be interested to hear that an item has changed its uuid
      // for example, editors have a one way relationship with notes. When a note changes its UUID, it has no way to inform the editor
      // to update its relationships

      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = this.items[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var model = _step8.value;

          model.potentialItemOfInterestHasChangedItsUUID(newItem, oldUUID, newUUID);
        }
      } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion8 && _iterator8.return) {
            _iterator8.return();
          }
        } finally {
          if (_didIteratorError8) {
            throw _iteratorError8;
          }
        }
      }
    }
  }, {
    key: "didSyncModelsOffline",
    value: function didSyncModelsOffline(items) {
      this.notifySyncObserversOfModels(items, SFModelManager.MappingSourceLocalSaved);
    }
  }, {
    key: "mapResponseItemsToLocalModels",
    value: function mapResponseItemsToLocalModels(items, source, sourceKey) {
      return this.mapResponseItemsToLocalModelsOmittingFields(items, null, source, sourceKey);
    }
  }, {
    key: "mapResponseItemsToLocalModelsOmittingFields",
    value: function mapResponseItemsToLocalModelsOmittingFields(items, omitFields, source, sourceKey) {
      var models = [],
          processedObjects = [],
          modelsToNotifyObserversOf = [];

      // first loop should add and process items
      var _iteratorNormalCompletion9 = true;
      var _didIteratorError9 = false;
      var _iteratorError9 = undefined;

      try {
        for (var _iterator9 = items[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
          var json_obj = _step9.value;

          if (!json_obj) {
            continue;
          }
          if ((!json_obj.content_type || !json_obj.content || !json_obj.uuid) && !json_obj.deleted && !json_obj.errorDecrypting) {
            // An item that is not deleted should never have empty content
            console.error("Server response item is corrupt:", json_obj);
            continue;
          }

          // Lodash's _.omit, which was previously used, seems to cause unexpected behavior
          // when json_obj is an ES6 item class. So we instead manually omit each key.
          if (Array.isArray(omitFields)) {
            var _iteratorNormalCompletion12 = true;
            var _didIteratorError12 = false;
            var _iteratorError12 = undefined;

            try {
              for (var _iterator12 = omitFields[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                var key = _step12.value;

                delete json_obj[key];
              }
            } catch (err) {
              _didIteratorError12 = true;
              _iteratorError12 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion12 && _iterator12.return) {
                  _iterator12.return();
                }
              } finally {
                if (_didIteratorError12) {
                  throw _iteratorError12;
                }
              }
            }
          }

          var item = this.findItem(json_obj.uuid);

          if (item) {
            item.updateFromJSON(json_obj);
            // If an item goes through mapping, it can no longer be a dummy.
            item.dummy = false;
          }

          if (this.itemsPendingRemoval.includes(json_obj.uuid)) {
            _.pull(this.itemsPendingRemoval, json_obj.uuid);
            continue;
          }

          var contentType = json_obj["content_type"] || item && item.content_type;
          var unknownContentType = this.acceptableContentTypes && !this.acceptableContentTypes.includes(contentType);
          if (unknownContentType) {
            continue;
          }

          var isDirtyItemPendingDelete = false;
          if (json_obj.deleted == true) {
            if (json_obj.dirty) {
              // Item was marked as deleted but not yet synced
              // We need to create this item as usual, but just not add it to individual arrays
              // i.e add to this.items but not this.notes (so that it can be retrieved with getDirtyItems)
              isDirtyItemPendingDelete = true;
            } else {
              if (item) {
                modelsToNotifyObserversOf.push(item);
                this.removeItemLocally(item);
              }
              continue;
            }
          }

          if (!item) {
            item = this.createItem(json_obj, true);
          }

          this.addItem(item, isDirtyItemPendingDelete);

          // Observers do not need to handle items that errored while decrypting.
          if (!item.errorDecrypting) {
            modelsToNotifyObserversOf.push(item);
          }

          models.push(item);
          processedObjects.push(json_obj);
        }

        // second loop should process references
      } catch (err) {
        _didIteratorError9 = true;
        _iteratorError9 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion9 && _iterator9.return) {
            _iterator9.return();
          }
        } finally {
          if (_didIteratorError9) {
            throw _iteratorError9;
          }
        }
      }

      var _iteratorNormalCompletion10 = true;
      var _didIteratorError10 = false;
      var _iteratorError10 = undefined;

      try {
        for (var _iterator10 = processedObjects.entries()[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
          var _ref33 = _step10.value;

          var _ref34 = _slicedToArray(_ref33, 2);

          var index = _ref34[0];
          var _json_obj = _ref34[1];

          var model = models[index];
          if (_json_obj.content) {
            this.resolveReferencesForItem(model);
          }

          model.didFinishSyncing();
        }
      } catch (err) {
        _didIteratorError10 = true;
        _iteratorError10 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion10 && _iterator10.return) {
            _iterator10.return();
          }
        } finally {
          if (_didIteratorError10) {
            throw _iteratorError10;
          }
        }
      }

      var missedRefs = this.popMissedReferenceStructsForObjects(processedObjects);
      var _iteratorNormalCompletion11 = true;
      var _didIteratorError11 = false;
      var _iteratorError11 = undefined;

      try {
        for (var _iterator11 = missedRefs[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
          var ref = _step11.value;

          var itemWaitingForTheValueInThisCurrentLoop = ref.for_item;
          itemWaitingForTheValueInThisCurrentLoop.addItemAsRelationship(model);
        }
      } catch (err) {
        _didIteratorError11 = true;
        _iteratorError11 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion11 && _iterator11.return) {
            _iterator11.return();
          }
        } finally {
          if (_didIteratorError11) {
            throw _iteratorError11;
          }
        }
      }

      this.notifySyncObserversOfModels(modelsToNotifyObserversOf, source, sourceKey);

      return models;
    }
  }, {
    key: "missedReferenceBuildKey",
    value: function missedReferenceBuildKey(referenceId, objectId) {
      return referenceId + ":" + objectId;
    }
  }, {
    key: "popMissedReferenceStructsForObjects",
    value: function popMissedReferenceStructsForObjects(objects) {
      if (!objects || objects.length == 0) {
        return [];
      }

      var results = [];
      var toDelete = [];
      var uuids = objects.map(function (item) {
        return item.uuid;
      });
      var genericUuidLength = uuids[0].length;

      var keys = Object.keys(this.missedReferences);
      var _iteratorNormalCompletion13 = true;
      var _didIteratorError13 = false;
      var _iteratorError13 = undefined;

      try {
        for (var _iterator13 = keys[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
          var candidateKey = _step13.value;

          /*
          We used to do string.split to get at the UUID, but surprisingly,
          the performance of this was about 20x worse then just getting the substring.
           var matches = candidateKey.split(":")[0] == object.uuid;
          */
          var matches = uuids.includes(candidateKey.substring(0, genericUuidLength));
          if (matches) {
            results.push(this.missedReferences[candidateKey]);
            toDelete.push(candidateKey);
          }
        }

        // remove from hash
      } catch (err) {
        _didIteratorError13 = true;
        _iteratorError13 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion13 && _iterator13.return) {
            _iterator13.return();
          }
        } finally {
          if (_didIteratorError13) {
            throw _iteratorError13;
          }
        }
      }

      var _iteratorNormalCompletion14 = true;
      var _didIteratorError14 = false;
      var _iteratorError14 = undefined;

      try {
        for (var _iterator14 = toDelete[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
          var key = _step14.value;

          delete this.missedReferences[key];
        }
      } catch (err) {
        _didIteratorError14 = true;
        _iteratorError14 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion14 && _iterator14.return) {
            _iterator14.return();
          }
        } finally {
          if (_didIteratorError14) {
            throw _iteratorError14;
          }
        }
      }

      return results;
    }
  }, {
    key: "resolveReferencesForItem",
    value: function resolveReferencesForItem(item) {
      var markReferencesDirty = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;


      // console.log("resolveReferencesForItem", item, "references", item.contentObject.references);

      var contentObject = item.contentObject;

      // If another client removes an item's references, this client won't pick up the removal unless
      // we remove everything not present in the current list of references
      item.updateLocalRelationships();

      if (!contentObject.references) {
        return;
      }

      var references = contentObject.references.slice(); // make copy, references will be modified in array

      var referencesIds = references.map(function (ref) {
        return ref.uuid;
      });
      var includeBlanks = true;
      var referencesObjectResults = this.findItems(referencesIds, includeBlanks);

      var _iteratorNormalCompletion15 = true;
      var _didIteratorError15 = false;
      var _iteratorError15 = undefined;

      try {
        for (var _iterator15 = referencesObjectResults.entries()[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
          var _ref35 = _step15.value;

          var _ref36 = _slicedToArray(_ref35, 2);

          var index = _ref36[0];
          var referencedItem = _ref36[1];

          if (referencedItem) {
            item.addItemAsRelationship(referencedItem);
            if (markReferencesDirty) {
              referencedItem.setDirty(true);
            }
          } else {
            var missingRefId = referencesIds[index];
            // Allows mapper to check when missing reference makes it through the loop,
            // and then runs resolveReferencesForItem again for the original item.
            var mappingKey = this.missedReferenceBuildKey(missingRefId, item.uuid);
            if (!this.missedReferences[mappingKey]) {
              var missedRef = { reference_uuid: missingRefId, for_item: item };
              this.missedReferences[mappingKey] = missedRef;
            }
          }
        }
      } catch (err) {
        _didIteratorError15 = true;
        _iteratorError15 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion15 && _iterator15.return) {
            _iterator15.return();
          }
        } finally {
          if (_didIteratorError15) {
            throw _iteratorError15;
          }
        }
      }
    }

    /* Note that this function is public, and can also be called manually (desktopManager uses it) */

  }, {
    key: "notifySyncObserversOfModels",
    value: function notifySyncObserversOfModels(models, source, sourceKey) {
      var _this9 = this;

      var _loop = function _loop(observer) {
        allRelevantItems = observer.types.includes("*") ? models : models.filter(function (item) {
          return observer.types.includes(item.content_type);
        });
        validItems = [];
        deletedItems = [];
        var _iteratorNormalCompletion17 = true;
        var _didIteratorError17 = false;
        var _iteratorError17 = undefined;

        try {
          for (var _iterator17 = allRelevantItems[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
            var item = _step17.value;

            if (item.deleted) {
              deletedItems.push(item);
            } else {
              validItems.push(item);
            }
          }
        } catch (err) {
          _didIteratorError17 = true;
          _iteratorError17 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion17 && _iterator17.return) {
              _iterator17.return();
            }
          } finally {
            if (_didIteratorError17) {
              throw _iteratorError17;
            }
          }
        }

        if (allRelevantItems.length > 0) {
          _this9._callSyncObserverCallbackWithTimeout(observer, allRelevantItems, validItems, deletedItems, source, sourceKey);
        }
      };

      // Make sure `let` is used in the for loops instead of `var`, as we will be using a timeout below.
      var _iteratorNormalCompletion16 = true;
      var _didIteratorError16 = false;
      var _iteratorError16 = undefined;

      try {
        for (var _iterator16 = this.itemSyncObservers[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
          var observer = _step16.value;
          var allRelevantItems;
          var validItems, deletedItems;

          _loop(observer);
        }
      } catch (err) {
        _didIteratorError16 = true;
        _iteratorError16 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion16 && _iterator16.return) {
            _iterator16.return();
          }
        } finally {
          if (_didIteratorError16) {
            throw _iteratorError16;
          }
        }
      }
    }

    /*
      Rather than running this inline in a for loop, which causes problems and requires all variables to be declared with `let`,
      we'll do it here so it's more explicit and less confusing.
     */

  }, {
    key: "_callSyncObserverCallbackWithTimeout",
    value: function _callSyncObserverCallbackWithTimeout(observer, allRelevantItems, validItems, deletedItems, source, sourceKey) {
      this.$timeout(function () {
        observer.callback(allRelevantItems, validItems, deletedItems, source, sourceKey);
      });
    }
  }, {
    key: "createItem",
    value: function createItem(json_obj, dontNotifyObservers) {
      var itemClass = SFModelManager.ContentTypeClassMapping && SFModelManager.ContentTypeClassMapping[json_obj.content_type];
      if (!itemClass) {
        itemClass = SFItem;
      }
      var item = new itemClass(json_obj);

      // Some observers would be interested to know when an an item is locally created
      // If we don't send this out, these observers would have to wait until MappingSourceRemoteSaved
      // to hear about it, but sometimes, RemoveSaved is explicitly ignored by the observer to avoid
      // recursive callbacks. See componentManager's syncObserver callback.
      // dontNotifyObservers is currently only set true by modelManagers mapResponseItemsToLocalModels
      if (!dontNotifyObservers) {
        this.notifySyncObserversOfModels([item], SFModelManager.MappingSourceLocalSaved);
      }

      return item;
    }

    /*
      Be sure itemResponse is a generic Javascript object, and not an Item.
      An Item needs to collapse its properties into its content object before it can be duplicated.
      Note: the reason we need this function is specificallty for the call to resolveReferencesForItem.
      This method creates but does not add the item to the global inventory. It's used by syncManager
      to check if this prospective duplicate item is identical to another item, including the references.
     */

  }, {
    key: "createConflictedItem",
    value: function createConflictedItem(itemResponse) {
      var dup = this.createItem(itemResponse, true);
      return dup;
    }
  }, {
    key: "addConflictedItem",
    value: function addConflictedItem(dup, original) {
      this.addItem(dup);
      // the duplicate should inherit the original's relationships
      var _iteratorNormalCompletion18 = true;
      var _didIteratorError18 = false;
      var _iteratorError18 = undefined;

      try {
        for (var _iterator18 = original.referencingObjects[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
          var referencingObject = _step18.value;

          referencingObject.addItemAsRelationship(dup);
          referencingObject.setDirty(true);
        }
      } catch (err) {
        _didIteratorError18 = true;
        _iteratorError18 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion18 && _iterator18.return) {
            _iterator18.return();
          }
        } finally {
          if (_didIteratorError18) {
            throw _iteratorError18;
          }
        }
      }

      this.resolveReferencesForItem(dup);
      dup.conflict_of = original.uuid;
      dup.setDirty(true);
    }
  }, {
    key: "duplicateItem",
    value: function duplicateItem(item) {
      var copy = new item.constructor({ content: item.content });
      copy.created_at = item.created_at;
      copy.content_type = item.content_type;

      this.addItem(copy);

      // the duplicate should inherit the original's relationships
      var _iteratorNormalCompletion19 = true;
      var _didIteratorError19 = false;
      var _iteratorError19 = undefined;

      try {
        for (var _iterator19 = item.referencingObjects[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
          var referencingObject = _step19.value;

          referencingObject.addItemAsRelationship(copy);
          referencingObject.setDirty(true);
        }
      } catch (err) {
        _didIteratorError19 = true;
        _iteratorError19 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion19 && _iterator19.return) {
            _iterator19.return();
          }
        } finally {
          if (_didIteratorError19) {
            throw _iteratorError19;
          }
        }
      }

      this.resolveReferencesForItem(copy);
      copy.setDirty(true);

      return copy;
    }
  }, {
    key: "addItem",
    value: function addItem(item) {
      var globalOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      this.addItems([item], globalOnly);
    }
  }, {
    key: "addItems",
    value: function addItems(items) {
      var _this10 = this;

      var globalOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      items.forEach(function (item) {
        if (!_this10.itemsHash[item.uuid]) {
          _this10.itemsHash[item.uuid] = item;
          _this10.items.push(item);
        }
      });
    }

    /* Notifies observers when an item has been synced or mapped from a remote response */

  }, {
    key: "addItemSyncObserver",
    value: function addItemSyncObserver(id, types, callback) {
      if (!Array.isArray(types)) {
        types = [types];
      }
      this.itemSyncObservers.push({ id: id, types: types, callback: callback });
    }
  }, {
    key: "removeItemSyncObserver",
    value: function removeItemSyncObserver(id) {
      _.remove(this.itemSyncObservers, _.find(this.itemSyncObservers, { id: id }));
    }
  }, {
    key: "getDirtyItems",
    value: function getDirtyItems() {
      return this.items.filter(function (item) {
        // An item that has an error decrypting can be synced only if it is being deleted.
        // Otherwise, we don't want to send corrupt content up to the server.
        return item.dirty == true && !item.dummy && (!item.errorDecrypting || item.deleted);
      });
    }
  }, {
    key: "clearDirtyItems",
    value: function clearDirtyItems(items) {
      var _iteratorNormalCompletion20 = true;
      var _didIteratorError20 = false;
      var _iteratorError20 = undefined;

      try {
        for (var _iterator20 = items[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
          var item = _step20.value;

          item.setDirty(false);
        }
      } catch (err) {
        _didIteratorError20 = true;
        _iteratorError20 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion20 && _iterator20.return) {
            _iterator20.return();
          }
        } finally {
          if (_didIteratorError20) {
            throw _iteratorError20;
          }
        }
      }
    }
  }, {
    key: "setItemToBeDeleted",
    value: function setItemToBeDeleted(item) {
      item.deleted = true;

      if (!item.dummy) {
        item.setDirty(true);
      }

      this.removeAndDirtyAllRelationshipsForItem(item);
    }
  }, {
    key: "removeAndDirtyAllRelationshipsForItem",
    value: function removeAndDirtyAllRelationshipsForItem(item) {
      // Handle direct relationships
      var _iteratorNormalCompletion21 = true;
      var _didIteratorError21 = false;
      var _iteratorError21 = undefined;

      try {
        for (var _iterator21 = item.content.references[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
          var reference = _step21.value;

          var relationship = this.findItem(reference.uuid);
          if (relationship) {
            item.removeItemAsRelationship(relationship);
            if (relationship.hasRelationshipWithItem(item)) {
              relationship.removeItemAsRelationship(item);
              relationship.setDirty(true);
            }
          }
        }

        // Handle indirect relationships
      } catch (err) {
        _didIteratorError21 = true;
        _iteratorError21 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion21 && _iterator21.return) {
            _iterator21.return();
          }
        } finally {
          if (_didIteratorError21) {
            throw _iteratorError21;
          }
        }
      }

      var _iteratorNormalCompletion22 = true;
      var _didIteratorError22 = false;
      var _iteratorError22 = undefined;

      try {
        for (var _iterator22 = item.referencingObjects[Symbol.iterator](), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
          var object = _step22.value;

          object.removeItemAsRelationship(item);
          object.setDirty(true);
        }
      } catch (err) {
        _didIteratorError22 = true;
        _iteratorError22 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion22 && _iterator22.return) {
            _iterator22.return();
          }
        } finally {
          if (_didIteratorError22) {
            throw _iteratorError22;
          }
        }
      }

      item.referencingObjects = [];
    }

    /* Used when changing encryption key */

  }, {
    key: "setAllItemsDirty",
    value: function setAllItemsDirty() {
      var dontUpdateClientDates = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      var relevantItems = this.allItems;

      var _iteratorNormalCompletion23 = true;
      var _didIteratorError23 = false;
      var _iteratorError23 = undefined;

      try {
        for (var _iterator23 = relevantItems[Symbol.iterator](), _step23; !(_iteratorNormalCompletion23 = (_step23 = _iterator23.next()).done); _iteratorNormalCompletion23 = true) {
          var item = _step23.value;

          item.setDirty(true, dontUpdateClientDates);
        }
      } catch (err) {
        _didIteratorError23 = true;
        _iteratorError23 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion23 && _iterator23.return) {
            _iterator23.return();
          }
        } finally {
          if (_didIteratorError23) {
            throw _iteratorError23;
          }
        }
      }
    }
  }, {
    key: "removeItemLocally",
    value: function removeItemLocally(item, callback) {
      _.remove(this.items, { uuid: item.uuid });
      delete this.itemsHash[item.uuid];

      item.isBeingRemovedLocally();

      this.itemsPendingRemoval.push(item.uuid);
    }

    /* Searching */

  }, {
    key: "allItemsMatchingTypes",
    value: function allItemsMatchingTypes(contentTypes) {
      return this.allItems.filter(function (item) {
        return (_.includes(contentTypes, item.content_type) || _.includes(contentTypes, "*")) && !item.dummy;
      });
    }
  }, {
    key: "invalidItems",
    value: function invalidItems() {
      return this.allItems.filter(function (item) {
        return item.errorDecrypting;
      });
    }
  }, {
    key: "validItemsForContentType",
    value: function validItemsForContentType(contentType) {
      return this.allItems.filter(function (item) {
        return item.content_type == contentType && !item.errorDecrypting;
      });
    }
  }, {
    key: "findItem",
    value: function findItem(itemId) {
      return this.itemsHash[itemId];
    }
  }, {
    key: "findItems",
    value: function findItems(ids) {
      var includeBlanks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var results = [];
      var _iteratorNormalCompletion24 = true;
      var _didIteratorError24 = false;
      var _iteratorError24 = undefined;

      try {
        for (var _iterator24 = ids[Symbol.iterator](), _step24; !(_iteratorNormalCompletion24 = (_step24 = _iterator24.next()).done); _iteratorNormalCompletion24 = true) {
          var id = _step24.value;

          var item = this.itemsHash[id];
          if (item || includeBlanks) {
            results.push(item);
          }
        }
      } catch (err) {
        _didIteratorError24 = true;
        _iteratorError24 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion24 && _iterator24.return) {
            _iterator24.return();
          }
        } finally {
          if (_didIteratorError24) {
            throw _iteratorError24;
          }
        }
      }

      return results;
    }
  }, {
    key: "itemsMatchingPredicate",
    value: function itemsMatchingPredicate(predicate) {
      return this.itemsMatchingPredicates([predicate]);
    }
  }, {
    key: "itemsMatchingPredicates",
    value: function itemsMatchingPredicates(predicates) {
      return this.filterItemsWithPredicates(this.allItems, predicates);
    }
  }, {
    key: "filterItemsWithPredicates",
    value: function filterItemsWithPredicates(items, predicates) {
      var results = items.filter(function (item) {
        var _iteratorNormalCompletion25 = true;
        var _didIteratorError25 = false;
        var _iteratorError25 = undefined;

        try {
          for (var _iterator25 = predicates[Symbol.iterator](), _step25; !(_iteratorNormalCompletion25 = (_step25 = _iterator25.next()).done); _iteratorNormalCompletion25 = true) {
            var predicate = _step25.value;

            if (!item.satisfiesPredicate(predicate)) {
              return false;
            }
          }
        } catch (err) {
          _didIteratorError25 = true;
          _iteratorError25 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion25 && _iterator25.return) {
              _iterator25.return();
            }
          } finally {
            if (_didIteratorError25) {
              throw _iteratorError25;
            }
          }
        }

        return true;
      });

      return results;
    }

    /*
    Archives
    */

  }, {
    key: "importItems",
    value: function importItems(externalItems) {
      var itemsToBeMapped = [];
      var _iteratorNormalCompletion26 = true;
      var _didIteratorError26 = false;
      var _iteratorError26 = undefined;

      try {
        for (var _iterator26 = externalItems[Symbol.iterator](), _step26; !(_iteratorNormalCompletion26 = (_step26 = _iterator26.next()).done); _iteratorNormalCompletion26 = true) {
          var itemData = _step26.value;

          var existing = this.findItem(itemData.uuid);
          if (existing && !existing.errorDecrypting) {
            // if the item already exists, check to see if it's different from the import data.
            // If it's the same, do nothing, otherwise, create a copy.
            itemData.uuid = null;
            var dup = this.createConflictedItem(itemData);
            if (!itemData.deleted && !existing.isItemContentEqualWith(dup)) {
              // Data differs
              this.addConflictedItem(dup, existing);
              itemsToBeMapped.push(dup);
            }
          } else {
            // it doesn't exist, push it into items to be mapped
            itemsToBeMapped.push(itemData);
            if (existing && existing.errorDecrypting) {
              existing.errorDecrypting = false;
            }
          }
        }
      } catch (err) {
        _didIteratorError26 = true;
        _iteratorError26 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion26 && _iterator26.return) {
            _iterator26.return();
          }
        } finally {
          if (_didIteratorError26) {
            throw _iteratorError26;
          }
        }
      }

      var items = this.mapResponseItemsToLocalModels(itemsToBeMapped, SFModelManager.MappingSourceFileImport);
      var _iteratorNormalCompletion27 = true;
      var _didIteratorError27 = false;
      var _iteratorError27 = undefined;

      try {
        for (var _iterator27 = items[Symbol.iterator](), _step27; !(_iteratorNormalCompletion27 = (_step27 = _iterator27.next()).done); _iteratorNormalCompletion27 = true) {
          var item = _step27.value;

          item.setDirty(true, true);
          item.deleted = false;
        }
      } catch (err) {
        _didIteratorError27 = true;
        _iteratorError27 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion27 && _iterator27.return) {
            _iterator27.return();
          }
        } finally {
          if (_didIteratorError27) {
            throw _iteratorError27;
          }
        }
      }

      return items;
    }
  }, {
    key: "getAllItemsJSONData",
    value: function () {
      var _ref37 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee33(keys, authParams, returnNullIfEmpty) {
        return regeneratorRuntime.wrap(function _callee33$(_context33) {
          while (1) {
            switch (_context33.prev = _context33.next) {
              case 0:
                return _context33.abrupt("return", this.getJSONDataForItems(this.allItems, keys, authParams, returnNullIfEmpty));

              case 1:
              case "end":
                return _context33.stop();
            }
          }
        }, _callee33, this);
      }));

      function getAllItemsJSONData(_x63, _x64, _x65) {
        return _ref37.apply(this, arguments);
      }

      return getAllItemsJSONData;
    }()
  }, {
    key: "getJSONDataForItems",
    value: function () {
      var _ref38 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee34(items, keys, authParams, returnNullIfEmpty) {
        return regeneratorRuntime.wrap(function _callee34$(_context34) {
          while (1) {
            switch (_context34.prev = _context34.next) {
              case 0:
                return _context34.abrupt("return", Promise.all(items.map(function (item) {
                  var itemParams = new SFItemParams(item, keys, authParams);
                  return itemParams.paramsForExportFile();
                })).then(function (items) {
                  if (returnNullIfEmpty && items.length == 0) {
                    return null;
                  }

                  var data = { items: items };

                  if (keys) {
                    // auth params are only needed when encrypted with a standard file key
                    data["auth_params"] = authParams;
                  }

                  return JSON.stringify(data, null, 2 /* pretty print */);
                }));

              case 1:
              case "end":
                return _context34.stop();
            }
          }
        }, _callee34, this);
      }));

      function getJSONDataForItems(_x66, _x67, _x68, _x69) {
        return _ref38.apply(this, arguments);
      }

      return getJSONDataForItems;
    }()
  }, {
    key: "allItems",
    get: function get() {
      return this.items.filter(function (item) {
        return !item.dummy;
      });
    }
  }]);

  return SFModelManager;
}();

;
var SFPrivilegesManager = exports.SFPrivilegesManager = function () {
  function SFPrivilegesManager(modelManager, syncManager, singletonManager) {
    _classCallCheck(this, SFPrivilegesManager);

    this.modelManager = modelManager;
    this.syncManager = syncManager;
    this.singletonManager = singletonManager;

    this.loadPrivileges();

    SFPrivilegesManager.CredentialAccountPassword = "CredentialAccountPassword";
    SFPrivilegesManager.CredentialLocalPasscode = "CredentialLocalPasscode";

    SFPrivilegesManager.ActionManageExtensions = "ActionManageExtensions";
    SFPrivilegesManager.ActionManageBackups = "ActionManageBackups";
    SFPrivilegesManager.ActionViewProtectedNotes = "ActionViewProtectedNotes";
    SFPrivilegesManager.ActionManagePrivileges = "ActionManagePrivileges";
    SFPrivilegesManager.ActionManagePasscode = "ActionManagePasscode";
    SFPrivilegesManager.ActionDeleteNote = "ActionDeleteNote";

    SFPrivilegesManager.SessionExpiresAtKey = "SessionExpiresAtKey";
    SFPrivilegesManager.SessionLengthKey = "SessionLengthKey";

    SFPrivilegesManager.SessionLengthNone = 0;
    SFPrivilegesManager.SessionLengthFiveMinutes = 300;
    SFPrivilegesManager.SessionLengthOneHour = 3600;
    SFPrivilegesManager.SessionLengthOneWeek = 604800;

    this.availableActions = [SFPrivilegesManager.ActionViewProtectedNotes, SFPrivilegesManager.ActionDeleteNote, SFPrivilegesManager.ActionManagePasscode, SFPrivilegesManager.ActionManageBackups, SFPrivilegesManager.ActionManageExtensions, SFPrivilegesManager.ActionManagePrivileges];

    this.availableCredentials = [SFPrivilegesManager.CredentialAccountPassword, SFPrivilegesManager.CredentialLocalPasscode];

    this.sessionLengths = [SFPrivilegesManager.SessionLengthNone, SFPrivilegesManager.SessionLengthFiveMinutes, SFPrivilegesManager.SessionLengthOneHour, SFPrivilegesManager.SessionLengthOneWeek, SFPrivilegesManager.SessionLengthIndefinite];
  }

  /*
  async delegate.isOffline()
  async delegate.hasLocalPasscode()
  async delegate.saveToStorage(key, value)
  async delegate.getFromStorage(key)
  async delegate.verifyAccountPassword
  async delegate.verifyLocalPasscode
  */


  _createClass(SFPrivilegesManager, [{
    key: "setDelegate",
    value: function setDelegate(delegate) {
      this.delegate = delegate;
    }
  }, {
    key: "getAvailableActions",
    value: function getAvailableActions() {
      return this.availableActions;
    }
  }, {
    key: "getAvailableCredentials",
    value: function getAvailableCredentials() {
      return this.availableCredentials;
    }
  }, {
    key: "netCredentialsForAction",
    value: function () {
      var _ref39 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee35(action) {
        var credentials, netCredentials, _iteratorNormalCompletion28, _didIteratorError28, _iteratorError28, _iterator28, _step28, cred, isOffline, hasLocalPasscode;

        return regeneratorRuntime.wrap(function _callee35$(_context35) {
          while (1) {
            switch (_context35.prev = _context35.next) {
              case 0:
                _context35.next = 2;
                return this.getPrivileges();

              case 2:
                _context35.t0 = action;
                credentials = _context35.sent.getCredentialsForAction(_context35.t0);
                netCredentials = [];
                _iteratorNormalCompletion28 = true;
                _didIteratorError28 = false;
                _iteratorError28 = undefined;
                _context35.prev = 8;
                _iterator28 = credentials[Symbol.iterator]();

              case 10:
                if (_iteratorNormalCompletion28 = (_step28 = _iterator28.next()).done) {
                  _context35.next = 27;
                  break;
                }

                cred = _step28.value;

                if (!(cred == SFPrivilegesManager.CredentialAccountPassword)) {
                  _context35.next = 19;
                  break;
                }

                _context35.next = 15;
                return this.delegate.isOffline();

              case 15:
                isOffline = _context35.sent;

                if (!isOffline) {
                  netCredentials.push(cred);
                }
                _context35.next = 24;
                break;

              case 19:
                if (!(cred == SFPrivilegesManager.CredentialLocalPasscode)) {
                  _context35.next = 24;
                  break;
                }

                _context35.next = 22;
                return this.delegate.hasLocalPasscode();

              case 22:
                hasLocalPasscode = _context35.sent;

                if (hasLocalPasscode) {
                  netCredentials.push(cred);
                }

              case 24:
                _iteratorNormalCompletion28 = true;
                _context35.next = 10;
                break;

              case 27:
                _context35.next = 33;
                break;

              case 29:
                _context35.prev = 29;
                _context35.t1 = _context35["catch"](8);
                _didIteratorError28 = true;
                _iteratorError28 = _context35.t1;

              case 33:
                _context35.prev = 33;
                _context35.prev = 34;

                if (!_iteratorNormalCompletion28 && _iterator28.return) {
                  _iterator28.return();
                }

              case 36:
                _context35.prev = 36;

                if (!_didIteratorError28) {
                  _context35.next = 39;
                  break;
                }

                throw _iteratorError28;

              case 39:
                return _context35.finish(36);

              case 40:
                return _context35.finish(33);

              case 41:
                return _context35.abrupt("return", netCredentials);

              case 42:
              case "end":
                return _context35.stop();
            }
          }
        }, _callee35, this, [[8, 29, 33, 41], [34,, 36, 40]]);
      }));

      function netCredentialsForAction(_x70) {
        return _ref39.apply(this, arguments);
      }

      return netCredentialsForAction;
    }()
  }, {
    key: "loadPrivileges",
    value: function () {
      var _ref40 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee37() {
        var _this11 = this;

        return regeneratorRuntime.wrap(function _callee37$(_context37) {
          while (1) {
            switch (_context37.prev = _context37.next) {
              case 0:
                if (!this.loadPromise) {
                  _context37.next = 2;
                  break;
                }

                return _context37.abrupt("return", this.loadPromise);

              case 2:

                this.loadPromise = new Promise(function (resolve, reject) {
                  var privsContentType = SFPrivileges.contentType();
                  var contentTypePredicate = new SFPredicate("content_type", "=", privsContentType);
                  _this11.singletonManager.registerSingleton([contentTypePredicate], function (resolvedSingleton) {
                    _this11.privileges = resolvedSingleton;
                    if (!_this11.privileges.content.desktopPrivileges) {
                      _this11.privileges.content.desktopPrivileges = {};
                    }
                    resolve(resolvedSingleton);
                  }, function () {
                    var _ref41 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee36(valueCallback) {
                      var privs;
                      return regeneratorRuntime.wrap(function _callee36$(_context36) {
                        while (1) {
                          switch (_context36.prev = _context36.next) {
                            case 0:
                              // Safe to create. Create and return object.
                              privs = new SFPrivileges({ content_type: privsContentType });

                              if (SFJS.crypto.generateUUIDSync) {
                                _context36.next = 4;
                                break;
                              }

                              _context36.next = 4;
                              return privs.initUUID();

                            case 4:
                              _this11.modelManager.addItem(privs);
                              privs.setDirty(true);
                              _this11.syncManager.sync();
                              valueCallback(privs);
                              resolve(privs);

                            case 9:
                            case "end":
                              return _context36.stop();
                          }
                        }
                      }, _callee36, _this11);
                    }));

                    return function (_x71) {
                      return _ref41.apply(this, arguments);
                    };
                  }());
                });

                return _context37.abrupt("return", this.loadPromise);

              case 4:
              case "end":
                return _context37.stop();
            }
          }
        }, _callee37, this);
      }));

      function loadPrivileges() {
        return _ref40.apply(this, arguments);
      }

      return loadPrivileges;
    }()
  }, {
    key: "getPrivileges",
    value: function () {
      var _ref42 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee38() {
        return regeneratorRuntime.wrap(function _callee38$(_context38) {
          while (1) {
            switch (_context38.prev = _context38.next) {
              case 0:
                if (!this.privileges) {
                  _context38.next = 4;
                  break;
                }

                return _context38.abrupt("return", this.privileges);

              case 4:
                return _context38.abrupt("return", this.loadPrivileges());

              case 5:
              case "end":
                return _context38.stop();
            }
          }
        }, _callee38, this);
      }));

      function getPrivileges() {
        return _ref42.apply(this, arguments);
      }

      return getPrivileges;
    }()
  }, {
    key: "displayInfoForCredential",
    value: function displayInfoForCredential(credential) {
      var metadata = {};

      metadata[SFPrivilegesManager.CredentialAccountPassword] = {
        label: "Account Password",
        prompt: "Please enter your account password."
      };

      metadata[SFPrivilegesManager.CredentialLocalPasscode] = {
        label: "Local Passcode",
        prompt: "Please enter your local passcode."
      };

      return metadata[credential];
    }
  }, {
    key: "displayInfoForAction",
    value: function displayInfoForAction(action) {
      var metadata = {};

      metadata[SFPrivilegesManager.ActionManageExtensions] = {
        label: "Manage Extensions"
      };

      metadata[SFPrivilegesManager.ActionManageBackups] = {
        label: "Download/Import Backups"
      };

      metadata[SFPrivilegesManager.ActionViewProtectedNotes] = {
        label: "View Protected Notes"
      };

      metadata[SFPrivilegesManager.ActionManagePrivileges] = {
        label: "Manage Privileges"
      };

      metadata[SFPrivilegesManager.ActionManagePasscode] = {
        label: "Manage Passcode"
      };

      metadata[SFPrivilegesManager.ActionDeleteNote] = {
        label: "Delete Notes"
      };

      return metadata[action];
    }
  }, {
    key: "getSessionLengthOptions",
    value: function getSessionLengthOptions() {
      return [{
        value: SFPrivilegesManager.SessionLengthNone,
        label: "Don't Remember"
      }, {
        value: SFPrivilegesManager.SessionLengthFiveMinutes,
        label: "5 Minutes"
      }, {
        value: SFPrivilegesManager.SessionLengthOneHour,
        label: "1 Hour"
      }, {
        value: SFPrivilegesManager.SessionLengthOneWeek,
        label: "1 Week"
      }];
    }
  }, {
    key: "setSessionLength",
    value: function () {
      var _ref43 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee39(length) {
        var addToNow, expiresAt;
        return regeneratorRuntime.wrap(function _callee39$(_context39) {
          while (1) {
            switch (_context39.prev = _context39.next) {
              case 0:
                addToNow = function addToNow(seconds) {
                  var date = new Date();
                  date.setSeconds(date.getSeconds() + seconds);
                  return date;
                };

                expiresAt = addToNow(length);
                return _context39.abrupt("return", Promise.all([this.delegate.saveToStorage(SFPrivilegesManager.SessionExpiresAtKey, JSON.stringify(expiresAt)), this.delegate.saveToStorage(SFPrivilegesManager.SessionLengthKey, JSON.stringify(length))]));

              case 3:
              case "end":
                return _context39.stop();
            }
          }
        }, _callee39, this);
      }));

      function setSessionLength(_x72) {
        return _ref43.apply(this, arguments);
      }

      return setSessionLength;
    }()
  }, {
    key: "clearSession",
    value: function () {
      var _ref44 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee40() {
        return regeneratorRuntime.wrap(function _callee40$(_context40) {
          while (1) {
            switch (_context40.prev = _context40.next) {
              case 0:
                return _context40.abrupt("return", this.setSessionLength(SFPrivilegesManager.SessionLengthNone));

              case 1:
              case "end":
                return _context40.stop();
            }
          }
        }, _callee40, this);
      }));

      function clearSession() {
        return _ref44.apply(this, arguments);
      }

      return clearSession;
    }()
  }, {
    key: "getSelectedSessionLength",
    value: function () {
      var _ref45 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee41() {
        var length;
        return regeneratorRuntime.wrap(function _callee41$(_context41) {
          while (1) {
            switch (_context41.prev = _context41.next) {
              case 0:
                _context41.next = 2;
                return this.delegate.getFromStorage(SFPrivilegesManager.SessionLengthKey);

              case 2:
                length = _context41.sent;

                if (!length) {
                  _context41.next = 7;
                  break;
                }

                return _context41.abrupt("return", JSON.parse(length));

              case 7:
                return _context41.abrupt("return", SFPrivilegesManager.SessionLengthNone);

              case 8:
              case "end":
                return _context41.stop();
            }
          }
        }, _callee41, this);
      }));

      function getSelectedSessionLength() {
        return _ref45.apply(this, arguments);
      }

      return getSelectedSessionLength;
    }()
  }, {
    key: "getSessionExpirey",
    value: function () {
      var _ref46 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee42() {
        var expiresAt;
        return regeneratorRuntime.wrap(function _callee42$(_context42) {
          while (1) {
            switch (_context42.prev = _context42.next) {
              case 0:
                _context42.next = 2;
                return this.delegate.getFromStorage(SFPrivilegesManager.SessionExpiresAtKey);

              case 2:
                expiresAt = _context42.sent;

                if (!expiresAt) {
                  _context42.next = 7;
                  break;
                }

                return _context42.abrupt("return", new Date(JSON.parse(expiresAt)));

              case 7:
                return _context42.abrupt("return", new Date());

              case 8:
              case "end":
                return _context42.stop();
            }
          }
        }, _callee42, this);
      }));

      function getSessionExpirey() {
        return _ref46.apply(this, arguments);
      }

      return getSessionExpirey;
    }()
  }, {
    key: "actionHasPrivilegesConfigured",
    value: function () {
      var _ref47 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee43(action) {
        return regeneratorRuntime.wrap(function _callee43$(_context43) {
          while (1) {
            switch (_context43.prev = _context43.next) {
              case 0:
                _context43.next = 2;
                return this.netCredentialsForAction(action);

              case 2:
                _context43.t0 = _context43.sent.length;
                return _context43.abrupt("return", _context43.t0 > 0);

              case 4:
              case "end":
                return _context43.stop();
            }
          }
        }, _callee43, this);
      }));

      function actionHasPrivilegesConfigured(_x73) {
        return _ref47.apply(this, arguments);
      }

      return actionHasPrivilegesConfigured;
    }()
  }, {
    key: "actionRequiresPrivilege",
    value: function () {
      var _ref48 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee44(action) {
        var expiresAt, netCredentials;
        return regeneratorRuntime.wrap(function _callee44$(_context44) {
          while (1) {
            switch (_context44.prev = _context44.next) {
              case 0:
                _context44.next = 2;
                return this.getSessionExpirey();

              case 2:
                expiresAt = _context44.sent;

                if (!(expiresAt > new Date())) {
                  _context44.next = 5;
                  break;
                }

                return _context44.abrupt("return", false);

              case 5:
                _context44.next = 7;
                return this.netCredentialsForAction(action);

              case 7:
                netCredentials = _context44.sent;
                return _context44.abrupt("return", netCredentials.length > 0);

              case 9:
              case "end":
                return _context44.stop();
            }
          }
        }, _callee44, this);
      }));

      function actionRequiresPrivilege(_x74) {
        return _ref48.apply(this, arguments);
      }

      return actionRequiresPrivilege;
    }()
  }, {
    key: "savePrivileges",
    value: function () {
      var _ref49 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee45() {
        var privs;
        return regeneratorRuntime.wrap(function _callee45$(_context45) {
          while (1) {
            switch (_context45.prev = _context45.next) {
              case 0:
                _context45.next = 2;
                return this.getPrivileges();

              case 2:
                privs = _context45.sent;

                privs.setDirty(true);
                this.syncManager.sync();

              case 5:
              case "end":
                return _context45.stop();
            }
          }
        }, _callee45, this);
      }));

      function savePrivileges() {
        return _ref49.apply(this, arguments);
      }

      return savePrivileges;
    }()
  }, {
    key: "authenticateAction",
    value: function () {
      var _ref50 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee46(action, credentialAuthMapping) {
        var requiredCredentials, successfulCredentials, failedCredentials, _iteratorNormalCompletion29, _didIteratorError29, _iteratorError29, _iterator29, _step29, requiredCredential, passesAuth;

        return regeneratorRuntime.wrap(function _callee46$(_context46) {
          while (1) {
            switch (_context46.prev = _context46.next) {
              case 0:
                _context46.next = 2;
                return this.netCredentialsForAction(action);

              case 2:
                requiredCredentials = _context46.sent;
                successfulCredentials = [], failedCredentials = [];
                _iteratorNormalCompletion29 = true;
                _didIteratorError29 = false;
                _iteratorError29 = undefined;
                _context46.prev = 7;
                _iterator29 = requiredCredentials[Symbol.iterator]();

              case 9:
                if (_iteratorNormalCompletion29 = (_step29 = _iterator29.next()).done) {
                  _context46.next = 18;
                  break;
                }

                requiredCredential = _step29.value;
                _context46.next = 13;
                return this._verifyAuthenticationParameters(requiredCredential, credentialAuthMapping[requiredCredential]);

              case 13:
                passesAuth = _context46.sent;

                if (passesAuth) {
                  successfulCredentials.push(requiredCredential);
                } else {
                  failedCredentials.push(requiredCredential);
                }

              case 15:
                _iteratorNormalCompletion29 = true;
                _context46.next = 9;
                break;

              case 18:
                _context46.next = 24;
                break;

              case 20:
                _context46.prev = 20;
                _context46.t0 = _context46["catch"](7);
                _didIteratorError29 = true;
                _iteratorError29 = _context46.t0;

              case 24:
                _context46.prev = 24;
                _context46.prev = 25;

                if (!_iteratorNormalCompletion29 && _iterator29.return) {
                  _iterator29.return();
                }

              case 27:
                _context46.prev = 27;

                if (!_didIteratorError29) {
                  _context46.next = 30;
                  break;
                }

                throw _iteratorError29;

              case 30:
                return _context46.finish(27);

              case 31:
                return _context46.finish(24);

              case 32:
                return _context46.abrupt("return", {
                  success: failedCredentials.length == 0,
                  successfulCredentials: successfulCredentials,
                  failedCredentials: failedCredentials
                });

              case 33:
              case "end":
                return _context46.stop();
            }
          }
        }, _callee46, this, [[7, 20, 24, 32], [25,, 27, 31]]);
      }));

      function authenticateAction(_x75, _x76) {
        return _ref50.apply(this, arguments);
      }

      return authenticateAction;
    }()
  }, {
    key: "_verifyAuthenticationParameters",
    value: function () {
      var _ref51 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee49(credential, value) {
        var _this12 = this;

        var verifyAccountPassword, verifyLocalPasscode;
        return regeneratorRuntime.wrap(function _callee49$(_context49) {
          while (1) {
            switch (_context49.prev = _context49.next) {
              case 0:
                verifyAccountPassword = function () {
                  var _ref52 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee47(password) {
                    return regeneratorRuntime.wrap(function _callee47$(_context47) {
                      while (1) {
                        switch (_context47.prev = _context47.next) {
                          case 0:
                            return _context47.abrupt("return", _this12.delegate.verifyAccountPassword(password));

                          case 1:
                          case "end":
                            return _context47.stop();
                        }
                      }
                    }, _callee47, _this12);
                  }));

                  return function verifyAccountPassword(_x79) {
                    return _ref52.apply(this, arguments);
                  };
                }();

                verifyLocalPasscode = function () {
                  var _ref53 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee48(passcode) {
                    return regeneratorRuntime.wrap(function _callee48$(_context48) {
                      while (1) {
                        switch (_context48.prev = _context48.next) {
                          case 0:
                            return _context48.abrupt("return", _this12.delegate.verifyLocalPasscode(passcode));

                          case 1:
                          case "end":
                            return _context48.stop();
                        }
                      }
                    }, _callee48, _this12);
                  }));

                  return function verifyLocalPasscode(_x80) {
                    return _ref53.apply(this, arguments);
                  };
                }();

                if (!(credential == SFPrivilegesManager.CredentialAccountPassword)) {
                  _context49.next = 6;
                  break;
                }

                return _context49.abrupt("return", verifyAccountPassword(value));

              case 6:
                if (!(credential == SFPrivilegesManager.CredentialLocalPasscode)) {
                  _context49.next = 8;
                  break;
                }

                return _context49.abrupt("return", verifyLocalPasscode(value));

              case 8:
              case "end":
                return _context49.stop();
            }
          }
        }, _callee49, this);
      }));

      function _verifyAuthenticationParameters(_x77, _x78) {
        return _ref51.apply(this, arguments);
      }

      return _verifyAuthenticationParameters;
    }()
  }]);

  return SFPrivilegesManager;
}();

;var SessionHistoryPersistKey = "sessionHistory_persist";
var SessionHistoryRevisionsKey = "sessionHistory_revisions";
var SessionHistoryAutoOptimizeKey = "sessionHistory_autoOptimize";

var SFSessionHistoryManager = exports.SFSessionHistoryManager = function () {
  function SFSessionHistoryManager(modelManager, storageManager, keyRequestHandler, contentTypes, timeout) {
    var _this13 = this;

    _classCallCheck(this, SFSessionHistoryManager);

    this.modelManager = modelManager;
    this.storageManager = storageManager;
    this.$timeout = timeout || setTimeout.bind(window);

    // Required to persist the encrypted form of SFHistorySession
    this.keyRequestHandler = keyRequestHandler;

    this.loadFromDisk().then(function () {
      _this13.modelManager.addItemSyncObserver("session-history", contentTypes, function (allItems, validItems, deletedItems, source, sourceKey) {
        var _iteratorNormalCompletion30 = true;
        var _didIteratorError30 = false;
        var _iteratorError30 = undefined;

        try {
          for (var _iterator30 = allItems[Symbol.iterator](), _step30; !(_iteratorNormalCompletion30 = (_step30 = _iterator30.next()).done); _iteratorNormalCompletion30 = true) {
            var item = _step30.value;

            try {
              _this13.addHistoryEntryForItem(item);
            } catch (e) {
              console.log("Caught exception while trying to add item history entry", e);
            }
          }
        } catch (err) {
          _didIteratorError30 = true;
          _iteratorError30 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion30 && _iterator30.return) {
              _iterator30.return();
            }
          } finally {
            if (_didIteratorError30) {
              throw _iteratorError30;
            }
          }
        }
      });
    });
  }

  _createClass(SFSessionHistoryManager, [{
    key: "encryptionParams",
    value: function () {
      var _ref54 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee50() {
        return regeneratorRuntime.wrap(function _callee50$(_context50) {
          while (1) {
            switch (_context50.prev = _context50.next) {
              case 0:
                return _context50.abrupt("return", this.keyRequestHandler());

              case 1:
              case "end":
                return _context50.stop();
            }
          }
        }, _callee50, this);
      }));

      function encryptionParams() {
        return _ref54.apply(this, arguments);
      }

      return encryptionParams;
    }()
  }, {
    key: "addHistoryEntryForItem",
    value: function addHistoryEntryForItem(item) {
      var _this14 = this;

      var persistableItemParams = {
        uuid: item.uuid,
        content_type: item.content_type,
        updated_at: item.updated_at,
        content: item.content
      };

      var entry = this.historySession.addEntryForItem(persistableItemParams);

      if (this.autoOptimize) {
        this.historySession.optimizeHistoryForItem(item);
      }

      if (entry && this.diskEnabled) {
        // Debounce, clear existing timeout
        if (this.diskTimeout) {
          if (this.$timeout.hasOwnProperty("cancel")) {
            this.$timeout.cancel(this.diskTimeout);
          } else {
            clearTimeout(this.diskTimeout);
          }
        };
        this.diskTimeout = this.$timeout(function () {
          _this14.saveToDisk();
        }, 2000);
      }
    }
  }, {
    key: "historyForItem",
    value: function historyForItem(item) {
      return this.historySession.historyForItem(item);
    }
  }, {
    key: "clearHistoryForItem",
    value: function () {
      var _ref55 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee51(item) {
        return regeneratorRuntime.wrap(function _callee51$(_context51) {
          while (1) {
            switch (_context51.prev = _context51.next) {
              case 0:
                this.historySession.clearItemHistory(item);
                return _context51.abrupt("return", this.saveToDisk());

              case 2:
              case "end":
                return _context51.stop();
            }
          }
        }, _callee51, this);
      }));

      function clearHistoryForItem(_x81) {
        return _ref55.apply(this, arguments);
      }

      return clearHistoryForItem;
    }()
  }, {
    key: "clearAllHistory",
    value: function () {
      var _ref56 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee52() {
        return regeneratorRuntime.wrap(function _callee52$(_context52) {
          while (1) {
            switch (_context52.prev = _context52.next) {
              case 0:
                this.historySession.clearAllHistory();
                return _context52.abrupt("return", this.storageManager.removeItem(SessionHistoryRevisionsKey));

              case 2:
              case "end":
                return _context52.stop();
            }
          }
        }, _callee52, this);
      }));

      function clearAllHistory() {
        return _ref56.apply(this, arguments);
      }

      return clearAllHistory;
    }()
  }, {
    key: "toggleDiskSaving",
    value: function () {
      var _ref57 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee53() {
        return regeneratorRuntime.wrap(function _callee53$(_context53) {
          while (1) {
            switch (_context53.prev = _context53.next) {
              case 0:
                this.diskEnabled = !this.diskEnabled;

                if (!this.diskEnabled) {
                  _context53.next = 6;
                  break;
                }

                this.storageManager.setItem(SessionHistoryPersistKey, JSON.stringify(true));
                this.saveToDisk();
                _context53.next = 8;
                break;

              case 6:
                this.storageManager.setItem(SessionHistoryPersistKey, JSON.stringify(false));
                return _context53.abrupt("return", this.storageManager.removeItem(SessionHistoryRevisionsKey));

              case 8:
              case "end":
                return _context53.stop();
            }
          }
        }, _callee53, this);
      }));

      function toggleDiskSaving() {
        return _ref57.apply(this, arguments);
      }

      return toggleDiskSaving;
    }()
  }, {
    key: "saveToDisk",
    value: function () {
      var _ref58 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee54() {
        var _this15 = this;

        var encryptionParams, itemParams;
        return regeneratorRuntime.wrap(function _callee54$(_context54) {
          while (1) {
            switch (_context54.prev = _context54.next) {
              case 0:
                if (this.diskEnabled) {
                  _context54.next = 2;
                  break;
                }

                return _context54.abrupt("return");

              case 2:
                _context54.next = 4;
                return this.encryptionParams();

              case 4:
                encryptionParams = _context54.sent;
                itemParams = new SFItemParams(this.historySession, encryptionParams.keys, encryptionParams.auth_params);

                itemParams.paramsForSync().then(function (syncParams) {
                  // console.log("Saving to disk", syncParams);
                  _this15.storageManager.setItem(SessionHistoryRevisionsKey, JSON.stringify(syncParams));
                });

              case 7:
              case "end":
                return _context54.stop();
            }
          }
        }, _callee54, this);
      }));

      function saveToDisk() {
        return _ref58.apply(this, arguments);
      }

      return saveToDisk;
    }()
  }, {
    key: "loadFromDisk",
    value: function () {
      var _ref59 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee55() {
        var diskValue, historyValue, encryptionParams, historySession, autoOptimizeValue;
        return regeneratorRuntime.wrap(function _callee55$(_context55) {
          while (1) {
            switch (_context55.prev = _context55.next) {
              case 0:
                _context55.next = 2;
                return this.storageManager.getItem(SessionHistoryPersistKey);

              case 2:
                diskValue = _context55.sent;

                if (diskValue) {
                  this.diskEnabled = JSON.parse(diskValue);
                }

                _context55.next = 6;
                return this.storageManager.getItem(SessionHistoryRevisionsKey);

              case 6:
                historyValue = _context55.sent;

                if (!historyValue) {
                  _context55.next = 18;
                  break;
                }

                historyValue = JSON.parse(historyValue);
                _context55.next = 11;
                return this.encryptionParams();

              case 11:
                encryptionParams = _context55.sent;
                _context55.next = 14;
                return SFJS.itemTransformer.decryptItem(historyValue, encryptionParams.keys);

              case 14:
                historySession = new SFHistorySession(historyValue);

                this.historySession = historySession;
                _context55.next = 19;
                break;

              case 18:
                this.historySession = new SFHistorySession();

              case 19:
                _context55.next = 21;
                return this.storageManager.getItem(SessionHistoryAutoOptimizeKey);

              case 21:
                autoOptimizeValue = _context55.sent;

                if (autoOptimizeValue) {
                  this.autoOptimize = JSON.parse(autoOptimizeValue);
                } else {
                  // default value is true
                  this.autoOptimize = true;
                }

              case 23:
              case "end":
                return _context55.stop();
            }
          }
        }, _callee55, this);
      }));

      function loadFromDisk() {
        return _ref59.apply(this, arguments);
      }

      return loadFromDisk;
    }()
  }, {
    key: "toggleAutoOptimize",
    value: function () {
      var _ref60 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee56() {
        return regeneratorRuntime.wrap(function _callee56$(_context56) {
          while (1) {
            switch (_context56.prev = _context56.next) {
              case 0:
                this.autoOptimize = !this.autoOptimize;

                if (this.autoOptimize) {
                  this.storageManager.setItem(SessionHistoryAutoOptimizeKey, JSON.stringify(true));
                } else {
                  this.storageManager.setItem(SessionHistoryAutoOptimizeKey, JSON.stringify(false));
                }

              case 2:
              case "end":
                return _context56.stop();
            }
          }
        }, _callee56, this);
      }));

      function toggleAutoOptimize() {
        return _ref60.apply(this, arguments);
      }

      return toggleAutoOptimize;
    }()
  }]);

  return SFSessionHistoryManager;
}();

; /*
   The SingletonManager allows controllers to register an item as a singleton, which means only one instance of that model
   should exist, both on the server and on the client. When the SingletonManager detects multiple items matching the singleton predicate,
   the oldest ones will be deleted, leaving the newest ones. (See 4/28/18 update. We now choose the earliest created one as the winner.).
    (This no longer fully applies, See 4/28/18 update.) We will treat the model most recently arrived from the server as the most recent one. The reason for this is,
   if you're offline, a singleton can be created, as in the case of UserPreferneces. Then when you sign in, you'll retrieve your actual user preferences.
   In that case, even though the offline singleton has a more recent updated_at, the server retreived value is the one we care more about.
    4/28/18: I'm seeing this issue: if you have the app open in one window, then in another window sign in, and during sign in,
   click Refresh (or autorefresh occurs) in the original signed in window, then you will happen to receive from the server the newly created
   Extensions singleton, and it will be mistaken (it just looks like a regular retrieved item, since nothing is in saved) for a fresh, latest copy, and replace the current instance.
   This has happened to me and many users.
   A puzzling issue, but what if instead of resolving singletons by choosing the one most recently modified, we choose the one with the earliest create date?
   This way, we don't care when it was modified, but we always, always choose the item that was created first. This way, we always deal with the same item.
  */

var SFSingletonManager = exports.SFSingletonManager = function () {
  function SFSingletonManager(modelManager, syncManager) {
    var _this16 = this;

    _classCallCheck(this, SFSingletonManager);

    this.syncManager = syncManager;
    this.modelManager = modelManager;
    this.singletonHandlers = [];

    syncManager.addEventHandler(function (syncEvent, data) {
      if (syncEvent == "local-data-loaded") {
        _this16.resolveSingletons(modelManager.allItems, null, true);
        _this16.initialDataLoaded = true;
      } else if (syncEvent == "sync:completed") {
        // Wait for initial data load before handling any sync. If we don't want for initial data load,
        // then the singleton resolver won't have the proper items to work with to determine whether to resolve or create.
        if (!_this16.initialDataLoaded) {
          return;
        }
        // The reason we also need to consider savedItems in consolidating singletons is in case of sync conflicts,
        // a new item can be created, but is never processed through "retrievedItems" since it is only created locally then saved.

        // HOWEVER, by considering savedItems, we are now ruining everything, especially during sign in. A singleton can be created
        // offline, and upon sign in, will sync all items to the server, and by combining retrievedItems & savedItems, and only choosing
        // the latest, you are now resolving to the most recent one, which is in the savedItems list and not retrieved items, defeating
        // the whole purpose of this thing.

        // Updated solution: resolveSingletons will now evaluate both of these arrays separately.
        _this16.resolveSingletons(data.retrievedItems, data.savedItems);
      }
    });

    /*
      If an item alternates its uuid on registration, singletonHandlers might need to update
      their local reference to the object, since the object reference will change on uuid alternation
    */
    modelManager.addModelUuidChangeObserver("singleton-manager", function (oldModel, newModel) {
      var _iteratorNormalCompletion31 = true;
      var _didIteratorError31 = false;
      var _iteratorError31 = undefined;

      try {
        for (var _iterator31 = _this16.singletonHandlers[Symbol.iterator](), _step31; !(_iteratorNormalCompletion31 = (_step31 = _iterator31.next()).done); _iteratorNormalCompletion31 = true) {
          var handler = _step31.value;

          if (handler.singleton && SFPredicate.ItemSatisfiesPredicates(newModel, handler.predicates)) {
            // Reference is now invalid, calling resolveSingleton should update it
            handler.singleton = null;
            _this16.resolveSingletons([newModel]);
          }
        }
      } catch (err) {
        _didIteratorError31 = true;
        _iteratorError31 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion31 && _iterator31.return) {
            _iterator31.return();
          }
        } finally {
          if (_didIteratorError31) {
            throw _iteratorError31;
          }
        }
      }
    });
  }

  _createClass(SFSingletonManager, [{
    key: "registerSingleton",
    value: function registerSingleton(predicates, resolveCallback, createBlock) {
      /*
      predicate: a key/value pair that specifies properties that should match in order for an item to be considered a predicate
      resolveCallback: called when one or more items are deleted and a new item becomes the reigning singleton
      createBlock: called when a sync is complete and no items are found. The createBlock should create the item and return it.
      */
      this.singletonHandlers.push({
        predicates: predicates,
        resolutionCallback: resolveCallback,
        createBlock: createBlock
      });
    }
  }, {
    key: "resolveSingletons",
    value: function resolveSingletons(retrievedItems, savedItems, initialLoad) {
      var _this17 = this;

      retrievedItems = retrievedItems || [];
      savedItems = savedItems || [];

      var _loop2 = function _loop2(singletonHandler) {
        predicates = singletonHandler.predicates;

        var retrievedSingletonItems = _this17.modelManager.filterItemsWithPredicates(retrievedItems, predicates);

        // We only want to consider saved items count to see if it's more than 0, and do nothing else with it.
        // This way we know there was some action and things need to be resolved. The saved items will come up
        // in filterItemsWithPredicate(this.modelManager.allItems) and be deleted anyway
        var savedSingletonItemsCount = _this17.modelManager.filterItemsWithPredicates(savedItems, predicates).length;

        if (retrievedSingletonItems.length > 0 || savedSingletonItemsCount > 0) {
          /*
            Check local inventory and make sure only 1 similar item exists. If more than 1, delete newest
            Note that this local inventory will also contain whatever is in retrievedItems.
          */
          allExtantItemsMatchingPredicate = _this17.modelManager.itemsMatchingPredicates(predicates);

          /*
            Delete all but the earliest created
          */

          if (allExtantItemsMatchingPredicate.length >= 2) {
            var sorted = allExtantItemsMatchingPredicate.sort(function (a, b) {
              /*
                If compareFunction(a, b) is less than 0, sort a to an index lower than b, i.e. a comes first.
                If compareFunction(a, b) is greater than 0, sort b to an index lower than a, i.e. b comes first.
              */
              return a.created_at < b.created_at ? -1 : 1;
            });

            // The item that will be chosen to be kept
            var winningItem = sorted[0];

            // Items that will be deleted
            // Delete everything but the first one
            var toDelete = sorted.slice(1, sorted.length);

            var _iteratorNormalCompletion33 = true;
            var _didIteratorError33 = false;
            var _iteratorError33 = undefined;

            try {
              for (var _iterator33 = toDelete[Symbol.iterator](), _step33; !(_iteratorNormalCompletion33 = (_step33 = _iterator33.next()).done); _iteratorNormalCompletion33 = true) {
                d = _step33.value;

                _this17.modelManager.setItemToBeDeleted(d);
              }
            } catch (err) {
              _didIteratorError33 = true;
              _iteratorError33 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion33 && _iterator33.return) {
                  _iterator33.return();
                }
              } finally {
                if (_didIteratorError33) {
                  throw _iteratorError33;
                }
              }
            }

            _this17.syncManager.sync();

            // Send remaining item to callback
            singletonHandler.singleton = winningItem;
            singletonHandler.resolutionCallback && singletonHandler.resolutionCallback(winningItem);
          } else if (allExtantItemsMatchingPredicate.length == 1) {
            if (!singletonHandler.singleton) {
              // Not yet notified interested parties of object
              singleton = allExtantItemsMatchingPredicate[0];

              singletonHandler.singleton = singleton;
              singletonHandler.resolutionCallback && singletonHandler.resolutionCallback(singleton);
            }
          }
        } else {
          // Retrieved items does not include any items of interest. If we don't have a singleton registered to this handler,
          // we need to create one. Only do this on actual sync completetions and not on initial data load. Because we want
          // to get the latest from the server before making the decision to create a new item
          if (!singletonHandler.singleton && !initialLoad && !singletonHandler.pendingCreateBlockCallback) {
            if (singletonHandler.createBlock) {
              singletonHandler.pendingCreateBlockCallback = true;
              singletonHandler.createBlock(function (created) {
                singletonHandler.singleton = created;
                singletonHandler.pendingCreateBlockCallback = false;
                singletonHandler.resolutionCallback && singletonHandler.resolutionCallback(created);
              });
            }
          }
        }
      };

      var _iteratorNormalCompletion32 = true;
      var _didIteratorError32 = false;
      var _iteratorError32 = undefined;

      try {
        for (var _iterator32 = this.singletonHandlers[Symbol.iterator](), _step32; !(_iteratorNormalCompletion32 = (_step32 = _iterator32.next()).done); _iteratorNormalCompletion32 = true) {
          var singletonHandler = _step32.value;
          var predicates;
          var allExtantItemsMatchingPredicate;
          var d;
          var singleton;

          _loop2(singletonHandler);
        }
      } catch (err) {
        _didIteratorError32 = true;
        _iteratorError32 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion32 && _iterator32.return) {
            _iterator32.return();
          }
        } finally {
          if (_didIteratorError32) {
            throw _iteratorError32;
          }
        }
      }
    }
  }]);

  return SFSingletonManager;
}();

; // SFStorageManager should be subclassed, and all the methods below overwritten.

var SFStorageManager = exports.SFStorageManager = function () {
  function SFStorageManager() {
    _classCallCheck(this, SFStorageManager);
  }

  _createClass(SFStorageManager, [{
    key: "setItem",


    /* Simple Key/Value Storage */

    value: function () {
      var _ref61 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee57(key, value) {
        return regeneratorRuntime.wrap(function _callee57$(_context57) {
          while (1) {
            switch (_context57.prev = _context57.next) {
              case 0:
              case "end":
                return _context57.stop();
            }
          }
        }, _callee57, this);
      }));

      function setItem(_x82, _x83) {
        return _ref61.apply(this, arguments);
      }

      return setItem;
    }()
  }, {
    key: "getItem",
    value: function () {
      var _ref62 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee58(key) {
        return regeneratorRuntime.wrap(function _callee58$(_context58) {
          while (1) {
            switch (_context58.prev = _context58.next) {
              case 0:
              case "end":
                return _context58.stop();
            }
          }
        }, _callee58, this);
      }));

      function getItem(_x84) {
        return _ref62.apply(this, arguments);
      }

      return getItem;
    }()
  }, {
    key: "removeItem",
    value: function () {
      var _ref63 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee59(key) {
        return regeneratorRuntime.wrap(function _callee59$(_context59) {
          while (1) {
            switch (_context59.prev = _context59.next) {
              case 0:
              case "end":
                return _context59.stop();
            }
          }
        }, _callee59, this);
      }));

      function removeItem(_x85) {
        return _ref63.apply(this, arguments);
      }

      return removeItem;
    }()
  }, {
    key: "clear",
    value: function () {
      var _ref64 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee60() {
        return regeneratorRuntime.wrap(function _callee60$(_context60) {
          while (1) {
            switch (_context60.prev = _context60.next) {
              case 0:
              case "end":
                return _context60.stop();
            }
          }
        }, _callee60, this);
      }));

      function clear() {
        return _ref64.apply(this, arguments);
      }

      return clear;
    }()
  }, {
    key: "getAllModels",


    /*
    Model Storage
    */

    value: function () {
      var _ref65 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee61() {
        return regeneratorRuntime.wrap(function _callee61$(_context61) {
          while (1) {
            switch (_context61.prev = _context61.next) {
              case 0:
              case "end":
                return _context61.stop();
            }
          }
        }, _callee61, this);
      }));

      function getAllModels() {
        return _ref65.apply(this, arguments);
      }

      return getAllModels;
    }()
  }, {
    key: "saveModel",
    value: function () {
      var _ref66 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee62(item) {
        return regeneratorRuntime.wrap(function _callee62$(_context62) {
          while (1) {
            switch (_context62.prev = _context62.next) {
              case 0:
                return _context62.abrupt("return", this.saveModels([item]));

              case 1:
              case "end":
                return _context62.stop();
            }
          }
        }, _callee62, this);
      }));

      function saveModel(_x86) {
        return _ref66.apply(this, arguments);
      }

      return saveModel;
    }()
  }, {
    key: "saveModels",
    value: function () {
      var _ref67 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee63(items) {
        return regeneratorRuntime.wrap(function _callee63$(_context63) {
          while (1) {
            switch (_context63.prev = _context63.next) {
              case 0:
              case "end":
                return _context63.stop();
            }
          }
        }, _callee63, this);
      }));

      function saveModels(_x87) {
        return _ref67.apply(this, arguments);
      }

      return saveModels;
    }()
  }, {
    key: "deleteModel",
    value: function () {
      var _ref68 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee64(item) {
        return regeneratorRuntime.wrap(function _callee64$(_context64) {
          while (1) {
            switch (_context64.prev = _context64.next) {
              case 0:
              case "end":
                return _context64.stop();
            }
          }
        }, _callee64, this);
      }));

      function deleteModel(_x88) {
        return _ref68.apply(this, arguments);
      }

      return deleteModel;
    }()
  }, {
    key: "clearAllModels",
    value: function () {
      var _ref69 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee65() {
        return regeneratorRuntime.wrap(function _callee65$(_context65) {
          while (1) {
            switch (_context65.prev = _context65.next) {
              case 0:
              case "end":
                return _context65.stop();
            }
          }
        }, _callee65, this);
      }));

      function clearAllModels() {
        return _ref69.apply(this, arguments);
      }

      return clearAllModels;
    }()
  }, {
    key: "clearAllData",


    /* General */

    value: function () {
      var _ref70 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee66() {
        return regeneratorRuntime.wrap(function _callee66$(_context66) {
          while (1) {
            switch (_context66.prev = _context66.next) {
              case 0:
                return _context66.abrupt("return", Promise.all([this.clear(), this.clearAllModels()]));

              case 1:
              case "end":
                return _context66.stop();
            }
          }
        }, _callee66, this);
      }));

      function clearAllData() {
        return _ref70.apply(this, arguments);
      }

      return clearAllData;
    }()
  }]);

  return SFStorageManager;
}();

;
var SFSyncManager = exports.SFSyncManager = function () {
  function SFSyncManager(modelManager, storageManager, httpManager, timeout, interval) {
    _classCallCheck(this, SFSyncManager);

    SFSyncManager.KeyRequestLoadLocal = "KeyRequestLoadLocal";
    SFSyncManager.KeyRequestSaveLocal = "KeyRequestSaveLocal";
    SFSyncManager.KeyRequestLoadSaveAccount = "KeyRequestLoadSaveAccount";

    this.httpManager = httpManager;
    this.modelManager = modelManager;
    this.storageManager = storageManager;

    // Allows you to et your own interval/timeout function (i.e if you're using angular and want to use $timeout)
    this.$interval = interval || setInterval.bind(window);
    this.$timeout = timeout || setTimeout.bind(window);

    this.syncStatus = {};
    this.syncStatusObservers = [];
    this.eventHandlers = [];
  }

  _createClass(SFSyncManager, [{
    key: "getServerURL",
    value: function () {
      var _ref71 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee67() {
        return regeneratorRuntime.wrap(function _callee67$(_context67) {
          while (1) {
            switch (_context67.prev = _context67.next) {
              case 0:
                _context67.next = 2;
                return this.storageManager.getItem("server");

              case 2:
                _context67.t0 = _context67.sent;

                if (_context67.t0) {
                  _context67.next = 5;
                  break;
                }

                _context67.t0 = window._default_sf_server;

              case 5:
                return _context67.abrupt("return", _context67.t0);

              case 6:
              case "end":
                return _context67.stop();
            }
          }
        }, _callee67, this);
      }));

      function getServerURL() {
        return _ref71.apply(this, arguments);
      }

      return getServerURL;
    }()
  }, {
    key: "getSyncURL",
    value: function () {
      var _ref72 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee68() {
        return regeneratorRuntime.wrap(function _callee68$(_context68) {
          while (1) {
            switch (_context68.prev = _context68.next) {
              case 0:
                _context68.next = 2;
                return this.getServerURL();

              case 2:
                _context68.t0 = _context68.sent;
                return _context68.abrupt("return", _context68.t0 + "/items/sync");

              case 4:
              case "end":
                return _context68.stop();
            }
          }
        }, _callee68, this);
      }));

      function getSyncURL() {
        return _ref72.apply(this, arguments);
      }

      return getSyncURL;
    }()
  }, {
    key: "registerSyncStatusObserver",
    value: function registerSyncStatusObserver(callback) {
      var observer = { key: new Date(), callback: callback };
      this.syncStatusObservers.push(observer);
      return observer;
    }
  }, {
    key: "removeSyncStatusObserver",
    value: function removeSyncStatusObserver(observer) {
      _.pull(this.syncStatusObservers, observer);
    }
  }, {
    key: "syncStatusDidChange",
    value: function syncStatusDidChange() {
      var _this18 = this;

      this.syncStatusObservers.forEach(function (observer) {
        observer.callback(_this18.syncStatus);
      });
    }
  }, {
    key: "addEventHandler",
    value: function addEventHandler(handler) {
      /*
      Possible Events:
      sync:completed
      sync:taking-too-long
      sync:updated_token
      sync:error
      major-data-change
      local-data-loaded
      sync-session-invalid
      sync-exception
       */
      this.eventHandlers.push(handler);
      return handler;
    }
  }, {
    key: "removeEventHandler",
    value: function removeEventHandler(handler) {
      _.pull(this.eventHandlers, handler);
    }
  }, {
    key: "notifyEvent",
    value: function notifyEvent(syncEvent, data) {
      var _iteratorNormalCompletion34 = true;
      var _didIteratorError34 = false;
      var _iteratorError34 = undefined;

      try {
        for (var _iterator34 = this.eventHandlers[Symbol.iterator](), _step34; !(_iteratorNormalCompletion34 = (_step34 = _iterator34.next()).done); _iteratorNormalCompletion34 = true) {
          var handler = _step34.value;

          handler(syncEvent, data || {});
        }
      } catch (err) {
        _didIteratorError34 = true;
        _iteratorError34 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion34 && _iterator34.return) {
            _iterator34.return();
          }
        } finally {
          if (_didIteratorError34) {
            throw _iteratorError34;
          }
        }
      }
    }
  }, {
    key: "setKeyRequestHandler",
    value: function setKeyRequestHandler(handler) {
      this.keyRequestHandler = handler;
    }
  }, {
    key: "getActiveKeyInfo",
    value: function () {
      var _ref73 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee69(request) {
        return regeneratorRuntime.wrap(function _callee69$(_context69) {
          while (1) {
            switch (_context69.prev = _context69.next) {
              case 0:
                return _context69.abrupt("return", this.keyRequestHandler(request));

              case 1:
              case "end":
                return _context69.stop();
            }
          }
        }, _callee69, this);
      }));

      function getActiveKeyInfo(_x89) {
        return _ref73.apply(this, arguments);
      }

      return getActiveKeyInfo;
    }()
  }, {
    key: "initialDataLoaded",
    value: function initialDataLoaded() {
      return this._initialDataLoaded;
    }
  }, {
    key: "loadLocalItems",
    value: function () {
      var _ref74 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee71(incrementalCallback) {
        var _this19 = this;

        var batchSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
        return regeneratorRuntime.wrap(function _callee71$(_context71) {
          while (1) {
            switch (_context71.prev = _context71.next) {
              case 0:
                return _context71.abrupt("return", this.storageManager.getAllModels().then(function (items) {
                  // break it up into chunks to make interface more responsive for large item counts
                  var total = items.length;
                  var current = 0;
                  var processed = [];

                  var decryptNext = function () {
                    var _ref75 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee70() {
                      var subitems, processedSubitems;
                      return regeneratorRuntime.wrap(function _callee70$(_context70) {
                        while (1) {
                          switch (_context70.prev = _context70.next) {
                            case 0:
                              subitems = items.slice(current, current + batchSize);
                              _context70.next = 3;
                              return _this19.handleItemsResponse(subitems, null, SFModelManager.MappingSourceLocalRetrieved, SFSyncManager.KeyRequestLoadLocal);

                            case 3:
                              processedSubitems = _context70.sent;

                              processed.push(processedSubitems);

                              current += subitems.length;

                              if (!(current < total)) {
                                _context70.next = 10;
                                break;
                              }

                              return _context70.abrupt("return", new Promise(function (innerResolve, innerReject) {
                                _this19.$timeout(function () {
                                  incrementalCallback && incrementalCallback(current, total);
                                  decryptNext().then(innerResolve);
                                });
                              }));

                            case 10:
                              // Completed
                              _this19.notifyEvent("local-data-loaded");
                              _this19._initialDataLoaded = true;

                            case 12:
                            case "end":
                              return _context70.stop();
                          }
                        }
                      }, _callee70, _this19);
                    }));

                    return function decryptNext() {
                      return _ref75.apply(this, arguments);
                    };
                  }();

                  return decryptNext();
                }));

              case 1:
              case "end":
                return _context71.stop();
            }
          }
        }, _callee71, this);
      }));

      function loadLocalItems(_x91) {
        return _ref74.apply(this, arguments);
      }

      return loadLocalItems;
    }()
  }, {
    key: "writeItemsToLocalStorage",
    value: function () {
      var _ref76 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee74(items, offlineOnly) {
        var _this20 = this;

        return regeneratorRuntime.wrap(function _callee74$(_context74) {
          while (1) {
            switch (_context74.prev = _context74.next) {
              case 0:
                return _context74.abrupt("return", new Promise(function () {
                  var _ref77 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee73(resolve, reject) {
                    var info;
                    return regeneratorRuntime.wrap(function _callee73$(_context73) {
                      while (1) {
                        switch (_context73.prev = _context73.next) {
                          case 0:
                            if (!(items.length == 0)) {
                              _context73.next = 3;
                              break;
                            }

                            resolve();
                            return _context73.abrupt("return");

                          case 3:
                            _context73.next = 5;
                            return _this20.getActiveKeyInfo(SFSyncManager.KeyRequestSaveLocal);

                          case 5:
                            info = _context73.sent;


                            Promise.all(items.map(function () {
                              var _ref78 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee72(item) {
                                var itemParams;
                                return regeneratorRuntime.wrap(function _callee72$(_context72) {
                                  while (1) {
                                    switch (_context72.prev = _context72.next) {
                                      case 0:
                                        itemParams = new SFItemParams(item, info.keys, info.auth_params);
                                        _context72.next = 3;
                                        return itemParams.paramsForLocalStorage();

                                      case 3:
                                        itemParams = _context72.sent;

                                        if (offlineOnly) {
                                          delete itemParams.dirty;
                                        }
                                        return _context72.abrupt("return", itemParams);

                                      case 6:
                                      case "end":
                                        return _context72.stop();
                                    }
                                  }
                                }, _callee72, _this20);
                              }));

                              return function (_x96) {
                                return _ref78.apply(this, arguments);
                              };
                            }())).then(function (params) {
                              _this20.storageManager.saveModels(params).then(function () {
                                // on success
                                if (_this20.syncStatus.localError) {
                                  _this20.syncStatus.localError = null;
                                  _this20.syncStatusDidChange();
                                }
                                resolve();
                              }).catch(function (error) {
                                // on error
                                console.error("Error writing items", error);
                                _this20.syncStatus.localError = error;
                                _this20.syncStatusDidChange();
                                reject();
                              });
                            }).catch(function (e) {
                              reject(e);
                            });

                          case 7:
                          case "end":
                            return _context73.stop();
                        }
                      }
                    }, _callee73, _this20);
                  }));

                  return function (_x94, _x95) {
                    return _ref77.apply(this, arguments);
                  };
                }()));

              case 1:
              case "end":
                return _context74.stop();
            }
          }
        }, _callee74, this);
      }));

      function writeItemsToLocalStorage(_x92, _x93) {
        return _ref76.apply(this, arguments);
      }

      return writeItemsToLocalStorage;
    }()
  }, {
    key: "syncOffline",
    value: function () {
      var _ref79 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee75(items) {
        var _this21 = this;

        var _iteratorNormalCompletion35, _didIteratorError35, _iteratorError35, _iterator35, _step35, item;

        return regeneratorRuntime.wrap(function _callee75$(_context75) {
          while (1) {
            switch (_context75.prev = _context75.next) {
              case 0:
                // Update all items updated_at to now
                _iteratorNormalCompletion35 = true;
                _didIteratorError35 = false;
                _iteratorError35 = undefined;
                _context75.prev = 3;
                for (_iterator35 = items[Symbol.iterator](); !(_iteratorNormalCompletion35 = (_step35 = _iterator35.next()).done); _iteratorNormalCompletion35 = true) {
                  item = _step35.value;
                  item.updated_at = new Date();
                }
                _context75.next = 11;
                break;

              case 7:
                _context75.prev = 7;
                _context75.t0 = _context75["catch"](3);
                _didIteratorError35 = true;
                _iteratorError35 = _context75.t0;

              case 11:
                _context75.prev = 11;
                _context75.prev = 12;

                if (!_iteratorNormalCompletion35 && _iterator35.return) {
                  _iterator35.return();
                }

              case 14:
                _context75.prev = 14;

                if (!_didIteratorError35) {
                  _context75.next = 17;
                  break;
                }

                throw _iteratorError35;

              case 17:
                return _context75.finish(14);

              case 18:
                return _context75.finish(11);

              case 19:
                return _context75.abrupt("return", this.writeItemsToLocalStorage(items, true).then(function (responseItems) {
                  // delete anything needing to be deleted
                  var _iteratorNormalCompletion36 = true;
                  var _didIteratorError36 = false;
                  var _iteratorError36 = undefined;

                  try {
                    for (var _iterator36 = items[Symbol.iterator](), _step36; !(_iteratorNormalCompletion36 = (_step36 = _iterator36.next()).done); _iteratorNormalCompletion36 = true) {
                      var item = _step36.value;

                      if (item.deleted) {
                        _this21.modelManager.removeItemLocally(item);
                      }
                    }
                  } catch (err) {
                    _didIteratorError36 = true;
                    _iteratorError36 = err;
                  } finally {
                    try {
                      if (!_iteratorNormalCompletion36 && _iterator36.return) {
                        _iterator36.return();
                      }
                    } finally {
                      if (_didIteratorError36) {
                        throw _iteratorError36;
                      }
                    }
                  }

                  _this21.notifyEvent("sync:completed", { savedItems: items });
                  // Required in order for modelManager to notify sync observers
                  _this21.modelManager.didSyncModelsOffline(items);

                  return { saved_items: items };
                }));

              case 20:
              case "end":
                return _context75.stop();
            }
          }
        }, _callee75, this, [[3, 7, 11, 19], [12,, 14, 18]]);
      }));

      function syncOffline(_x97) {
        return _ref79.apply(this, arguments);
      }

      return syncOffline;
    }()

    /*
      In the case of signing in and merging local data, we alternative UUIDs
      to avoid overwriting data a user may retrieve that has the same UUID.
      Alternating here forces us to to create duplicates of the items instead.
     */

  }, {
    key: "markAllItemsDirtyAndSaveOffline",
    value: function () {
      var _ref80 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee76(alternateUUIDs) {
        var originalItems, _iteratorNormalCompletion37, _didIteratorError37, _iteratorError37, _iterator37, _step37, item, allItems, _iteratorNormalCompletion38, _didIteratorError38, _iteratorError38, _iterator38, _step38;

        return regeneratorRuntime.wrap(function _callee76$(_context76) {
          while (1) {
            switch (_context76.prev = _context76.next) {
              case 0:

                // use a copy, as alternating uuid will affect array
                originalItems = this.modelManager.allItems.filter(function (item) {
                  return !item.errorDecrypting;
                }).slice();

                if (!alternateUUIDs) {
                  _context76.next = 28;
                  break;
                }

                _iteratorNormalCompletion37 = true;
                _didIteratorError37 = false;
                _iteratorError37 = undefined;
                _context76.prev = 5;
                _iterator37 = originalItems[Symbol.iterator]();

              case 7:
                if (_iteratorNormalCompletion37 = (_step37 = _iterator37.next()).done) {
                  _context76.next = 14;
                  break;
                }

                item = _step37.value;
                _context76.next = 11;
                return this.modelManager.alternateUUIDForItem(item);

              case 11:
                _iteratorNormalCompletion37 = true;
                _context76.next = 7;
                break;

              case 14:
                _context76.next = 20;
                break;

              case 16:
                _context76.prev = 16;
                _context76.t0 = _context76["catch"](5);
                _didIteratorError37 = true;
                _iteratorError37 = _context76.t0;

              case 20:
                _context76.prev = 20;
                _context76.prev = 21;

                if (!_iteratorNormalCompletion37 && _iterator37.return) {
                  _iterator37.return();
                }

              case 23:
                _context76.prev = 23;

                if (!_didIteratorError37) {
                  _context76.next = 26;
                  break;
                }

                throw _iteratorError37;

              case 26:
                return _context76.finish(23);

              case 27:
                return _context76.finish(20);

              case 28:
                allItems = this.modelManager.allItems;
                _iteratorNormalCompletion38 = true;
                _didIteratorError38 = false;
                _iteratorError38 = undefined;
                _context76.prev = 32;

                for (_iterator38 = allItems[Symbol.iterator](); !(_iteratorNormalCompletion38 = (_step38 = _iterator38.next()).done); _iteratorNormalCompletion38 = true) {
                  item = _step38.value;
                  item.setDirty(true);
                }
                _context76.next = 40;
                break;

              case 36:
                _context76.prev = 36;
                _context76.t1 = _context76["catch"](32);
                _didIteratorError38 = true;
                _iteratorError38 = _context76.t1;

              case 40:
                _context76.prev = 40;
                _context76.prev = 41;

                if (!_iteratorNormalCompletion38 && _iterator38.return) {
                  _iterator38.return();
                }

              case 43:
                _context76.prev = 43;

                if (!_didIteratorError38) {
                  _context76.next = 46;
                  break;
                }

                throw _iteratorError38;

              case 46:
                return _context76.finish(43);

              case 47:
                return _context76.finish(40);

              case 48:
                return _context76.abrupt("return", this.writeItemsToLocalStorage(allItems, false));

              case 49:
              case "end":
                return _context76.stop();
            }
          }
        }, _callee76, this, [[5, 16, 20, 28], [21,, 23, 27], [32, 36, 40, 48], [41,, 43, 47]]);
      }));

      function markAllItemsDirtyAndSaveOffline(_x98) {
        return _ref80.apply(this, arguments);
      }

      return markAllItemsDirtyAndSaveOffline;
    }()
  }, {
    key: "setSyncToken",
    value: function () {
      var _ref81 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee77(token) {
        return regeneratorRuntime.wrap(function _callee77$(_context77) {
          while (1) {
            switch (_context77.prev = _context77.next) {
              case 0:
                this._syncToken = token;
                _context77.next = 3;
                return this.storageManager.setItem("syncToken", token);

              case 3:
              case "end":
                return _context77.stop();
            }
          }
        }, _callee77, this);
      }));

      function setSyncToken(_x99) {
        return _ref81.apply(this, arguments);
      }

      return setSyncToken;
    }()
  }, {
    key: "getSyncToken",
    value: function () {
      var _ref82 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee78() {
        return regeneratorRuntime.wrap(function _callee78$(_context78) {
          while (1) {
            switch (_context78.prev = _context78.next) {
              case 0:
                if (this._syncToken) {
                  _context78.next = 4;
                  break;
                }

                _context78.next = 3;
                return this.storageManager.getItem("syncToken");

              case 3:
                this._syncToken = _context78.sent;

              case 4:
                return _context78.abrupt("return", this._syncToken);

              case 5:
              case "end":
                return _context78.stop();
            }
          }
        }, _callee78, this);
      }));

      function getSyncToken() {
        return _ref82.apply(this, arguments);
      }

      return getSyncToken;
    }()
  }, {
    key: "setCursorToken",
    value: function () {
      var _ref83 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee79(token) {
        return regeneratorRuntime.wrap(function _callee79$(_context79) {
          while (1) {
            switch (_context79.prev = _context79.next) {
              case 0:
                this._cursorToken = token;

                if (!token) {
                  _context79.next = 6;
                  break;
                }

                _context79.next = 4;
                return this.storageManager.setItem("cursorToken", token);

              case 4:
                _context79.next = 8;
                break;

              case 6:
                _context79.next = 8;
                return this.storageManager.removeItem("cursorToken");

              case 8:
              case "end":
                return _context79.stop();
            }
          }
        }, _callee79, this);
      }));

      function setCursorToken(_x100) {
        return _ref83.apply(this, arguments);
      }

      return setCursorToken;
    }()
  }, {
    key: "getCursorToken",
    value: function () {
      var _ref84 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee80() {
        return regeneratorRuntime.wrap(function _callee80$(_context80) {
          while (1) {
            switch (_context80.prev = _context80.next) {
              case 0:
                if (this._cursorToken) {
                  _context80.next = 4;
                  break;
                }

                _context80.next = 3;
                return this.storageManager.getItem("cursorToken");

              case 3:
                this._cursorToken = _context80.sent;

              case 4:
                return _context80.abrupt("return", this._cursorToken);

              case 5:
              case "end":
                return _context80.stop();
            }
          }
        }, _callee80, this);
      }));

      function getCursorToken() {
        return _ref84.apply(this, arguments);
      }

      return getCursorToken;
    }()
  }, {
    key: "clearQueuedCallbacks",
    value: function clearQueuedCallbacks() {
      this._queuedCallbacks = [];
    }
  }, {
    key: "callQueuedCallbacks",
    value: function callQueuedCallbacks(response) {
      var allCallbacks = this.queuedCallbacks;
      if (allCallbacks.length) {
        var _iteratorNormalCompletion39 = true;
        var _didIteratorError39 = false;
        var _iteratorError39 = undefined;

        try {
          for (var _iterator39 = allCallbacks[Symbol.iterator](), _step39; !(_iteratorNormalCompletion39 = (_step39 = _iterator39.next()).done); _iteratorNormalCompletion39 = true) {
            var eachCallback = _step39.value;

            eachCallback(response);
          }
        } catch (err) {
          _didIteratorError39 = true;
          _iteratorError39 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion39 && _iterator39.return) {
              _iterator39.return();
            }
          } finally {
            if (_didIteratorError39) {
              throw _iteratorError39;
            }
          }
        }

        this.clearQueuedCallbacks();
      }
    }
  }, {
    key: "beginCheckingIfSyncIsTakingTooLong",
    value: function beginCheckingIfSyncIsTakingTooLong() {
      if (this.syncStatus.checker) {
        this.stopCheckingIfSyncIsTakingTooLong();
      }
      this.syncStatus.checker = this.$interval(function () {
        // check to see if the ongoing sync is taking too long, alert the user
        var secondsPassed = (new Date() - this.syncStatus.syncStart) / 1000;
        var warningThreshold = 5.0; // seconds
        if (secondsPassed > warningThreshold) {
          this.notifyEvent("sync:taking-too-long");
          this.stopCheckingIfSyncIsTakingTooLong();
        }
      }.bind(this), 500);
    }
  }, {
    key: "stopCheckingIfSyncIsTakingTooLong",
    value: function stopCheckingIfSyncIsTakingTooLong() {
      if (this.$interval.hasOwnProperty("cancel")) {
        this.$interval.cancel(this.syncStatus.checker);
      } else {
        clearInterval(this.syncStatus.checker);
      }
      this.syncStatus.checker = null;
    }
  }, {
    key: "lockSyncing",
    value: function lockSyncing() {
      this.syncLocked = true;
    }
  }, {
    key: "unlockSyncing",
    value: function unlockSyncing() {
      this.syncLocked = false;
    }
  }, {
    key: "sync",
    value: function () {
      var _ref85 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee82() {
        var _this22 = this;

        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        return regeneratorRuntime.wrap(function _callee82$(_context82) {
          while (1) {
            switch (_context82.prev = _context82.next) {
              case 0:
                return _context82.abrupt("return", new Promise(function () {
                  var _ref86 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee81(resolve, reject) {
                    var allDirtyItems, dirtyItemsNotYetSaved, info, isContinuationSync, submitLimit, subItems, params, _iteratorNormalCompletion40, _didIteratorError40, _iteratorError40, _iterator40, _step40, item;

                    return regeneratorRuntime.wrap(function _callee81$(_context81) {
                      while (1) {
                        switch (_context81.prev = _context81.next) {
                          case 0:
                            if (!_this22.syncLocked) {
                              _context81.next = 4;
                              break;
                            }

                            console.log("Sync Locked, Returning;");
                            resolve();
                            return _context81.abrupt("return");

                          case 4:

                            if (!options) options = {};

                            allDirtyItems = _this22.modelManager.getDirtyItems();

                            /*
                              When it comes to saving to disk before the sync request (both in syncOpInProgress and preSyncSave),
                              you only want to save items that have a dirty count > 0. That's because, if for example, you're syncing
                              2000 items, and every sync request handles only 150 items at a time, then every sync request will
                              be writing the same thousand items to storage every time. Writing a thousand items to storage can take 10s.
                              So, save to local storage only items with dirtyCount > 0, then, after saving, set dirtyCount to 0.
                              This way, if an item changes again, it will be saved next sync.
                            */

                            dirtyItemsNotYetSaved = allDirtyItems.filter(function (candidate) {
                              if (candidate.dirtyCount > 0) {
                                candidate.dirtyCount = 0;
                                return true;
                              } else {
                                return false;
                              }
                            });

                            // When a user hits the physical refresh button, we want to force refresh, in case
                            // the sync engine is stuck in some inProgress loop.

                            if (!(_this22.syncStatus.syncOpInProgress && !options.force)) {
                              _context81.next = 14;
                              break;
                            }

                            _this22.repeatOnCompletion = true;
                            _this22.queuedCallbacks.push(resolve);
                            _context81.next = 12;
                            return _this22.writeItemsToLocalStorage(dirtyItemsNotYetSaved, false);

                          case 12:
                            console.log("Sync op in progress; returning.");
                            return _context81.abrupt("return");

                          case 14:
                            _context81.next = 16;
                            return _this22.getActiveKeyInfo(SFSyncManager.KeyRequestLoadSaveAccount);

                          case 16:
                            info = _context81.sent;

                            if (!info.offline) {
                              _context81.next = 20;
                              break;
                            }

                            _this22.syncOffline(allDirtyItems).then(function (response) {
                              _this22.modelManager.clearDirtyItems(allDirtyItems);
                              resolve(response);
                            }).catch(function (e) {
                              _this22.notifyEvent("sync-exception", e);
                            });
                            return _context81.abrupt("return");

                          case 20:
                            isContinuationSync = _this22.syncStatus.needsMoreSync;


                            _this22.syncStatus.syncOpInProgress = true;
                            _this22.syncStatus.syncStart = new Date();
                            _this22.beginCheckingIfSyncIsTakingTooLong();

                            submitLimit = 100;
                            subItems = allDirtyItems.slice(0, submitLimit);

                            if (subItems.length < allDirtyItems.length) {
                              // more items left to be synced, repeat
                              _this22.syncStatus.needsMoreSync = true;
                            } else {
                              _this22.syncStatus.needsMoreSync = false;
                            }

                            if (!isContinuationSync) {
                              _this22.syncStatus.total = allDirtyItems.length;
                              _this22.syncStatus.current = 0;
                            }

                            // If items are marked as dirty during a long running sync request, total isn't updated
                            // This happens mostly in the case of large imports and sync conflicts where duplicated items are created
                            if (_this22.syncStatus.current > _this22.syncStatus.total) {
                              _this22.syncStatus.total = _this22.syncStatus.current;
                            }

                            _this22.syncStatusDidChange();

                            // Perform save after you've updated all status signals above. Presync save can take several seconds in some cases.
                            // Write to local storage before beginning sync.
                            // This way, if they close the browser before the sync request completes, local changes will not be lost
                            _context81.next = 32;
                            return _this22.writeItemsToLocalStorage(dirtyItemsNotYetSaved, false);

                          case 32:
                            if (options.onPreSyncSave) {
                              options.onPreSyncSave();
                            }

                            // when doing a sync request that returns items greater than the limit, and thus subsequent syncs are required,
                            // we want to keep track of all retreived items, then save to local storage only once all items have been retrieved,
                            // so that relationships remain intact
                            // Update 12/18: I don't think we need to do this anymore, since relationships will now retroactively resolve their relationships,
                            // if an item they were looking for hasn't been pulled in yet.
                            if (!_this22.allRetreivedItems) {
                              _this22.allRetreivedItems = [];
                            }

                            // We also want to do this for savedItems
                            if (!_this22.allSavedItems) {
                              _this22.allSavedItems = [];
                            }

                            params = {};

                            params.limit = 150;

                            _context81.prev = 37;
                            _context81.next = 40;
                            return Promise.all(subItems.map(function (item) {
                              var itemParams = new SFItemParams(item, info.keys, info.auth_params);
                              itemParams.additionalFields = options.additionalFields;
                              return itemParams.paramsForSync();
                            })).then(function (itemsParams) {
                              params.items = itemsParams;
                            });

                          case 40:
                            _context81.next = 45;
                            break;

                          case 42:
                            _context81.prev = 42;
                            _context81.t0 = _context81["catch"](37);

                            _this22.notifyEvent("sync-exception", _context81.t0);

                          case 45:
                            _iteratorNormalCompletion40 = true;
                            _didIteratorError40 = false;
                            _iteratorError40 = undefined;
                            _context81.prev = 48;


                            for (_iterator40 = subItems[Symbol.iterator](); !(_iteratorNormalCompletion40 = (_step40 = _iterator40.next()).done); _iteratorNormalCompletion40 = true) {
                              item = _step40.value;

                              // Reset dirty counter to 0, since we're about to sync it.
                              // This means anyone marking the item as dirty after this will cause it so sync again and not be cleared on sync completion.
                              item.dirtyCount = 0;
                            }

                            _context81.next = 56;
                            break;

                          case 52:
                            _context81.prev = 52;
                            _context81.t1 = _context81["catch"](48);
                            _didIteratorError40 = true;
                            _iteratorError40 = _context81.t1;

                          case 56:
                            _context81.prev = 56;
                            _context81.prev = 57;

                            if (!_iteratorNormalCompletion40 && _iterator40.return) {
                              _iterator40.return();
                            }

                          case 59:
                            _context81.prev = 59;

                            if (!_didIteratorError40) {
                              _context81.next = 62;
                              break;
                            }

                            throw _iteratorError40;

                          case 62:
                            return _context81.finish(59);

                          case 63:
                            return _context81.finish(56);

                          case 64:
                            _context81.next = 66;
                            return _this22.getSyncToken();

                          case 66:
                            params.sync_token = _context81.sent;
                            _context81.next = 69;
                            return _this22.getCursorToken();

                          case 69:
                            params.cursor_token = _context81.sent;
                            _context81.prev = 70;
                            _context81.t2 = _this22.httpManager;
                            _context81.next = 74;
                            return _this22.getSyncURL();

                          case 74:
                            _context81.t3 = _context81.sent;
                            _context81.t4 = params;

                            _context81.t5 = function (response) {
                              _this22.handleSyncSuccess(subItems, response, options).then(function () {
                                resolve(response);
                              }).catch(function (e) {
                                console.log("Caught sync success exception:", e);
                                _this22.handleSyncError(null, null, allDirtyItems).then(function (errorResponse) {
                                  resolve(errorResponse);
                                });
                              });
                            };

                            _context81.t6 = function (response, statusCode) {
                              _this22.handleSyncError(response, statusCode, allDirtyItems).then(function (errorResponse) {
                                resolve(errorResponse);
                              });
                            };

                            _context81.t2.postAbsolute.call(_context81.t2, _context81.t3, _context81.t4, _context81.t5, _context81.t6);

                            _context81.next = 84;
                            break;

                          case 81:
                            _context81.prev = 81;
                            _context81.t7 = _context81["catch"](70);

                            console.log("Sync exception caught:", _context81.t7);

                          case 84:
                          case "end":
                            return _context81.stop();
                        }
                      }
                    }, _callee81, _this22, [[37, 42], [48, 52, 56, 64], [57,, 59, 63], [70, 81]]);
                  }));

                  return function (_x102, _x103) {
                    return _ref86.apply(this, arguments);
                  };
                }()));

              case 1:
              case "end":
                return _context82.stop();
            }
          }
        }, _callee82, this);
      }));

      function sync() {
        return _ref85.apply(this, arguments);
      }

      return sync;
    }()
  }, {
    key: "handleSyncSuccess",
    value: function () {
      var _ref87 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee83(syncedItems, response, options) {
        var _this23 = this;

        var itemsToClearAsDirty, _iteratorNormalCompletion41, _didIteratorError41, _iteratorError41, _iterator41, _step41, item, allSavedUUIDs, retrieved, omitFields, saved, unsaved, isInitialSync, cursorToken, majorDataChangeThreshold;

        return regeneratorRuntime.wrap(function _callee83$(_context83) {
          while (1) {
            switch (_context83.prev = _context83.next) {
              case 0:
                // Check to make sure any subItem hasn't been marked as dirty again while a sync was ongoing
                itemsToClearAsDirty = [];
                _iteratorNormalCompletion41 = true;
                _didIteratorError41 = false;
                _iteratorError41 = undefined;
                _context83.prev = 4;

                for (_iterator41 = syncedItems[Symbol.iterator](); !(_iteratorNormalCompletion41 = (_step41 = _iterator41.next()).done); _iteratorNormalCompletion41 = true) {
                  item = _step41.value;

                  if (item.dirtyCount == 0) {
                    // Safe to clear as dirty
                    itemsToClearAsDirty.push(item);
                  }
                }
                _context83.next = 12;
                break;

              case 8:
                _context83.prev = 8;
                _context83.t0 = _context83["catch"](4);
                _didIteratorError41 = true;
                _iteratorError41 = _context83.t0;

              case 12:
                _context83.prev = 12;
                _context83.prev = 13;

                if (!_iteratorNormalCompletion41 && _iterator41.return) {
                  _iterator41.return();
                }

              case 15:
                _context83.prev = 15;

                if (!_didIteratorError41) {
                  _context83.next = 18;
                  break;
                }

                throw _iteratorError41;

              case 18:
                return _context83.finish(15);

              case 19:
                return _context83.finish(12);

              case 20:
                this.modelManager.clearDirtyItems(itemsToClearAsDirty);
                this.syncStatus.error = null;

                // Filter retrieved_items to remove any items that may be in saved_items for this complete sync operation
                // When signing in, and a user requires many round trips to complete entire retrieval of data, an item may be saved
                // on the first trip, then on subsequent trips using cursor_token, this same item may be returned, since it's date is
                // greater than cursor_token. We keep track of all saved items in whole sync operation with this.allSavedItems
                // We need this because singletonManager looks at retrievedItems as higher precendence than savedItems, but if it comes in both
                // then that's problematic.

                allSavedUUIDs = this.allSavedItems.map(function (item) {
                  return item.uuid;
                });

                response.retrieved_items = response.retrieved_items.filter(function (candidate) {
                  return !allSavedUUIDs.includes(candidate.uuid);
                });

                // Map retrieved items to local data
                // Note that deleted items will not be returned
                _context83.next = 26;
                return this.handleItemsResponse(response.retrieved_items, null, SFModelManager.MappingSourceRemoteRetrieved, SFSyncManager.KeyRequestLoadSaveAccount);

              case 26:
                retrieved = _context83.sent;


                // Append items to master list of retrieved items for this ongoing sync operation
                this.allRetreivedItems = this.allRetreivedItems.concat(retrieved);
                this.syncStatus.retrievedCount = this.allRetreivedItems.length;

                // Merge only metadata for saved items
                // we write saved items to disk now because it clears their dirty status then saves
                // if we saved items before completion, we had have to save them as dirty and save them again on success as clean
                omitFields = ["content", "auth_hash"];

                // Map saved items to local data

                _context83.next = 32;
                return this.handleItemsResponse(response.saved_items, omitFields, SFModelManager.MappingSourceRemoteSaved, SFSyncManager.KeyRequestLoadSaveAccount);

              case 32:
                saved = _context83.sent;


                // Append items to master list of saved items for this ongoing sync operation
                this.allSavedItems = this.allSavedItems.concat(saved);

                // Create copies of items or alternate their uuids if neccessary
                unsaved = response.unsaved;
                // don't `await`. This function calls sync, so if you wait, it will call sync without having completed the sync we're in.
                // On second thought, calling await will only await the local conflict resolution and not await the sync call.
                // We do need to wait here for sync duplication to finish. If we don't, there seems to be an issue where if you import a large
                // backup with uuid-conflcits (from another account), you'll see very confused duplication.

                _context83.next = 37;
                return this.handleUnsavedItemsResponse(unsaved);

              case 37:
                _context83.next = 39;
                return this.writeItemsToLocalStorage(saved, false);

              case 39:
                _context83.next = 41;
                return this.writeItemsToLocalStorage(retrieved, false);

              case 41:

                this.syncStatus.syncOpInProgress = false;
                this.syncStatus.current += syncedItems.length;

                this.syncStatusDidChange();

                _context83.next = 46;
                return this.getSyncToken();

              case 46:
                _context83.t1 = _context83.sent;
                isInitialSync = _context83.t1 == null;


                // set the sync token at the end, so that if any errors happen above, you can resync
                this.setSyncToken(response.sync_token);
                this.setCursorToken(response.cursor_token);

                this.stopCheckingIfSyncIsTakingTooLong();

                // Oct 2018: Why use both this.syncStatus.needsMoreSync and this.repeatOnCompletion?
                // They seem to do the same thing.

                _context83.next = 53;
                return this.getCursorToken();

              case 53:
                cursorToken = _context83.sent;

                if (!(cursorToken || this.syncStatus.needsMoreSync)) {
                  _context83.next = 58;
                  break;
                }

                return _context83.abrupt("return", new Promise(function (resolve, reject) {
                  setTimeout(function () {
                    this.sync(options).then(resolve);
                  }.bind(_this23), 10); // wait 10ms to allow UI to update
                }));

              case 58:
                if (!this.repeatOnCompletion) {
                  _context83.next = 63;
                  break;
                }

                this.repeatOnCompletion = false;
                return _context83.abrupt("return", new Promise(function (resolve, reject) {
                  setTimeout(function () {
                    this.sync(options).then(resolve);
                  }.bind(_this23), 10); // wait 10ms to allow UI to update
                }));

              case 63:
                /*
                // await this.writeItemsToLocalStorage(this.allRetreivedItems, false);
                  We used to do this, but the problem is, if you're saving 2000 items at the end of a sign in,
                  then refresh or close the page, the items will not be saved, and the sync token will be the lastest.
                  So the data won't be downloaded again. Instead, we'll save retrieved as they come.
                */

                this.syncStatus.retrievedCount = 0;
                this.syncStatusDidChange();

                // The number of changed items that constitute a major change
                // This is used by the desktop app to create backups
                majorDataChangeThreshold = 10;

                if (this.allRetreivedItems.length >= majorDataChangeThreshold || saved.length >= majorDataChangeThreshold || unsaved.length >= majorDataChangeThreshold) {
                  this.notifyEvent("major-data-change");
                }

                this.callQueuedCallbacks(response);
                this.notifyEvent("sync:completed", { retrievedItems: this.allRetreivedItems, savedItems: this.allSavedItems, unsavedItems: unsaved, initialSync: isInitialSync });

                this.allRetreivedItems = [];
                this.allSavedItems = [];

                return _context83.abrupt("return", response);

              case 72:
              case "end":
                return _context83.stop();
            }
          }
        }, _callee83, this, [[4, 8, 12, 20], [13,, 15, 19]]);
      }));

      function handleSyncSuccess(_x104, _x105, _x106) {
        return _ref87.apply(this, arguments);
      }

      return handleSyncSuccess;
    }()
  }, {
    key: "handleSyncError",
    value: function () {
      var _ref88 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee84(response, statusCode, allDirtyItems) {
        return regeneratorRuntime.wrap(function _callee84$(_context84) {
          while (1) {
            switch (_context84.prev = _context84.next) {
              case 0:
                console.log("Sync error", response);
                if (statusCode == 401) {
                  this.notifyEvent("sync-session-invalid");
                }

                console.log("Sync error: ", response);

                if (!response) {
                  response = { error: { message: "Could not connect to server." } };
                }

                this.syncStatus.syncOpInProgress = false;
                this.syncStatus.error = response.error;
                this.syncStatusDidChange();

                this.writeItemsToLocalStorage(allDirtyItems, false);
                this.modelManager.didSyncModelsOffline(allDirtyItems);

                this.stopCheckingIfSyncIsTakingTooLong();

                this.notifyEvent("sync:error", response.error);

                this.callQueuedCallbacks({ error: "Sync error" });

                return _context84.abrupt("return", response);

              case 13:
              case "end":
                return _context84.stop();
            }
          }
        }, _callee84, this);
      }));

      function handleSyncError(_x107, _x108, _x109) {
        return _ref88.apply(this, arguments);
      }

      return handleSyncError;
    }()
  }, {
    key: "handleItemsResponse",
    value: function () {
      var _ref89 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee85(responseItems, omitFields, source, keyRequest) {
        var keys, items, itemsWithErrorStatusChange;
        return regeneratorRuntime.wrap(function _callee85$(_context85) {
          while (1) {
            switch (_context85.prev = _context85.next) {
              case 0:
                _context85.next = 2;
                return this.getActiveKeyInfo(keyRequest);

              case 2:
                keys = _context85.sent.keys;
                _context85.next = 5;
                return SFJS.itemTransformer.decryptMultipleItems(responseItems, keys);

              case 5:
                items = this.modelManager.mapResponseItemsToLocalModelsOmittingFields(responseItems, omitFields, source);

                // During the decryption process, items may be marked as "errorDecrypting". If so, we want to be sure
                // to persist this new state by writing these items back to local storage. When an item's "errorDecrypting"
                // flag is changed, its "errorDecryptingValueChanged" flag will be set, so we can find these items by filtering (then unsetting) below:

                itemsWithErrorStatusChange = items.filter(function (item) {
                  var valueChanged = item.errorDecryptingValueChanged;
                  // unset after consuming value
                  item.errorDecryptingValueChanged = false;
                  return valueChanged;
                });

                if (itemsWithErrorStatusChange.length > 0) {
                  this.writeItemsToLocalStorage(itemsWithErrorStatusChange, false);
                }

                return _context85.abrupt("return", items);

              case 9:
              case "end":
                return _context85.stop();
            }
          }
        }, _callee85, this);
      }));

      function handleItemsResponse(_x110, _x111, _x112, _x113) {
        return _ref89.apply(this, arguments);
      }

      return handleItemsResponse;
    }()
  }, {
    key: "refreshErroredItems",
    value: function () {
      var _ref90 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee86() {
        var erroredItems;
        return regeneratorRuntime.wrap(function _callee86$(_context86) {
          while (1) {
            switch (_context86.prev = _context86.next) {
              case 0:
                erroredItems = this.modelManager.allItems.filter(function (item) {
                  return item.errorDecrypting == true;
                });

                if (!(erroredItems.length > 0)) {
                  _context86.next = 3;
                  break;
                }

                return _context86.abrupt("return", this.handleItemsResponse(erroredItems, null, SFModelManager.MappingSourceLocalRetrieved, SFSyncManager.KeyRequestLoadSaveAccount));

              case 3:
              case "end":
                return _context86.stop();
            }
          }
        }, _callee86, this);
      }));

      function refreshErroredItems() {
        return _ref90.apply(this, arguments);
      }

      return refreshErroredItems;
    }()
  }, {
    key: "handleUnsavedItemsResponse",
    value: function () {
      var _ref91 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee87(unsaved) {
        var _iteratorNormalCompletion42, _didIteratorError42, _iteratorError42, _iterator42, _step42, mapping, itemResponse, item, error, dup;

        return regeneratorRuntime.wrap(function _callee87$(_context87) {
          while (1) {
            switch (_context87.prev = _context87.next) {
              case 0:
                if (!(unsaved.length == 0)) {
                  _context87.next = 2;
                  break;
                }

                return _context87.abrupt("return");

              case 2:

                console.log("Handle Conflicted Items:", unsaved);

                _iteratorNormalCompletion42 = true;
                _didIteratorError42 = false;
                _iteratorError42 = undefined;
                _context87.prev = 6;
                _iterator42 = unsaved[Symbol.iterator]();

              case 8:
                if (_iteratorNormalCompletion42 = (_step42 = _iterator42.next()).done) {
                  _context87.next = 36;
                  break;
                }

                mapping = _step42.value;
                itemResponse = mapping.item;
                _context87.t0 = SFJS.itemTransformer;
                _context87.t1 = [itemResponse];
                _context87.next = 15;
                return this.getActiveKeyInfo(SFSyncManager.KeyRequestLoadSaveAccount);

              case 15:
                _context87.t2 = _context87.sent.keys;
                _context87.next = 18;
                return _context87.t0.decryptMultipleItems.call(_context87.t0, _context87.t1, _context87.t2);

              case 18:
                item = this.modelManager.findItem(itemResponse.uuid);

                // Could be deleted

                if (item) {
                  _context87.next = 21;
                  break;
                }

                return _context87.abrupt("continue", 33);

              case 21:
                error = mapping.error;

                if (!(error.tag === "uuid_conflict")) {
                  _context87.next = 27;
                  break;
                }

                _context87.next = 25;
                return this.modelManager.alternateUUIDForItem(item);

              case 25:
                _context87.next = 33;
                break;

              case 27:
                if (!(error.tag === "sync_conflict")) {
                  _context87.next = 33;
                  break;
                }

                _context87.next = 30;
                return SFJS.crypto.generateUUID();

              case 30:
                itemResponse.uuid = _context87.sent;
                dup = this.modelManager.createConflictedItem(itemResponse);

                if (!itemResponse.deleted && !item.isItemContentEqualWith(dup)) {
                  this.modelManager.addConflictedItem(dup, item);
                }

              case 33:
                _iteratorNormalCompletion42 = true;
                _context87.next = 8;
                break;

              case 36:
                _context87.next = 42;
                break;

              case 38:
                _context87.prev = 38;
                _context87.t3 = _context87["catch"](6);
                _didIteratorError42 = true;
                _iteratorError42 = _context87.t3;

              case 42:
                _context87.prev = 42;
                _context87.prev = 43;

                if (!_iteratorNormalCompletion42 && _iterator42.return) {
                  _iterator42.return();
                }

              case 45:
                _context87.prev = 45;

                if (!_didIteratorError42) {
                  _context87.next = 48;
                  break;
                }

                throw _iteratorError42;

              case 48:
                return _context87.finish(45);

              case 49:
                return _context87.finish(42);

              case 50:

                // This will immediately result in "Sync op in progress" and sync will be queued.
                // That's ok. You actually want a sync op in progress so that the new items are saved to disk right away.
                // If you add a timeout here of 100ms, you'll avoid sync op in progress, but it will be a few ms before the items
                // are saved to disk, meaning that the user may see All changes saved a few ms before changes are saved to disk.
                // You could also just write to disk manually here, but syncing here is 100% sure to trigger sync op in progress as that's
                // where it's being called from.
                this.sync(null, { additionalFields: ["created_at", "updated_at"] });

              case 51:
              case "end":
                return _context87.stop();
            }
          }
        }, _callee87, this, [[6, 38, 42, 50], [43,, 45, 49]]);
      }));

      function handleUnsavedItemsResponse(_x114) {
        return _ref91.apply(this, arguments);
      }

      return handleUnsavedItemsResponse;
    }()

    /*
      Executes a sync request with a blank sync token and high download limit. It will download all items,
      but won't do anything with them other than decrypting, creating respective objects, and returning them to caller. (it does not map them nor establish their relationships)
      The use case came primarly for clients who had ignored a certain content_type in sync, but later issued an update
      indicated they actually did want to start handling that content type. In that case, they would need to download all items
      freshly from the server.(Ideally in the future the server would accept a content_type param to only download items of that type.
      We've inserted that into the params in anticipation, but the server currently totally ignores that.
    */

  }, {
    key: "stateless_downloadAllItems",
    value: function stateless_downloadAllItems() {
      var _this24 = this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      return new Promise(function () {
        var _ref92 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee89(resolve, reject) {
          var params;
          return regeneratorRuntime.wrap(function _callee89$(_context89) {
            while (1) {
              switch (_context89.prev = _context89.next) {
                case 0:
                  params = {
                    limit: 500,
                    sync_token: options.syncToken,
                    cursor_token: options.cursorToken,
                    content_type: options.contentType /* currently ignored by server, placed preemptively. See comment above */
                  };
                  _context89.prev = 1;
                  _context89.t0 = _this24.httpManager;
                  _context89.next = 5;
                  return _this24.getSyncURL();

                case 5:
                  _context89.t1 = _context89.sent;
                  _context89.t2 = params;

                  _context89.t3 = function () {
                    var _ref93 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee88(response) {
                      var incomingItems, keys;
                      return regeneratorRuntime.wrap(function _callee88$(_context88) {
                        while (1) {
                          switch (_context88.prev = _context88.next) {
                            case 0:
                              if (!options.retrievedItems) {
                                options.retrievedItems = [];
                              }

                              incomingItems = response.retrieved_items;
                              _context88.next = 4;
                              return _this24.getActiveKeyInfo(SFSyncManager.KeyRequestLoadSaveAccount);

                            case 4:
                              keys = _context88.sent.keys;
                              _context88.next = 7;
                              return SFJS.itemTransformer.decryptMultipleItems(incomingItems, keys);

                            case 7:

                              options.retrievedItems = options.retrievedItems.concat(incomingItems.map(function (incomingItem) {
                                // Create model classes
                                return _this24.modelManager.createItem(incomingItem, true /* dontNotifyObservers */);
                              }));
                              options.syncToken = response.sync_token;
                              options.cursorToken = response.cursor_token;

                              if (options.cursorToken) {
                                _this24.stateless_downloadAllItems(options).then(resolve);
                              } else {
                                resolve(options.retrievedItems);
                              }

                            case 11:
                            case "end":
                              return _context88.stop();
                          }
                        }
                      }, _callee88, _this24);
                    }));

                    return function (_x118) {
                      return _ref93.apply(this, arguments);
                    };
                  }();

                  _context89.t4 = function (response, statusCode) {
                    reject(response);
                  };

                  _context89.t0.postAbsolute.call(_context89.t0, _context89.t1, _context89.t2, _context89.t3, _context89.t4);

                  _context89.next = 16;
                  break;

                case 12:
                  _context89.prev = 12;
                  _context89.t5 = _context89["catch"](1);

                  console.log("Download all items exception caught:", _context89.t5);
                  reject(_context89.t5);

                case 16:
                case "end":
                  return _context89.stop();
              }
            }
          }, _callee89, _this24, [[1, 12]]);
        }));

        return function (_x116, _x117) {
          return _ref92.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "handleSignout",
    value: function () {
      var _ref94 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee90() {
        return regeneratorRuntime.wrap(function _callee90$(_context90) {
          while (1) {
            switch (_context90.prev = _context90.next) {
              case 0:
                this._syncToken = null;
                this._cursorToken = null;
                this._queuedCallbacks = [];
                this.syncStatus = {};

              case 4:
              case "end":
                return _context90.stop();
            }
          }
        }, _callee90, this);
      }));

      function handleSignout() {
        return _ref94.apply(this, arguments);
      }

      return handleSignout;
    }()
  }, {
    key: "clearSyncToken",
    value: function () {
      var _ref95 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee91() {
        return regeneratorRuntime.wrap(function _callee91$(_context91) {
          while (1) {
            switch (_context91.prev = _context91.next) {
              case 0:
                this._syncToken = null;
                this._cursorToken = null;
                return _context91.abrupt("return", this.storageManager.removeItem("syncToken"));

              case 3:
              case "end":
                return _context91.stop();
            }
          }
        }, _callee91, this);
      }));

      function clearSyncToken() {
        return _ref95.apply(this, arguments);
      }

      return clearSyncToken;
    }()
  }, {
    key: "queuedCallbacks",
    get: function get() {
      if (!this._queuedCallbacks) {
        this._queuedCallbacks = [];
      }
      return this._queuedCallbacks;
    }
  }]);

  return SFSyncManager;
}();

;var dateFormatter;

var SFItem = exports.SFItem = function () {
  function SFItem() {
    var json_obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, SFItem);

    this.appData = {};
    this.content = {};
    this.referencingObjects = [];
    this.updateFromJSON(json_obj);

    if (!this.uuid) {
      // on React Native, this method will not exist. UUID gen will be handled manually via async methods.
      if (typeof SFJS !== "undefined" && SFJS.crypto.generateUUIDSync) {
        this.uuid = SFJS.crypto.generateUUIDSync();
      }
    }

    if (!this.content.references) {
      this.content.references = [];
    }
  }

  // On some platforms, syncrounous uuid generation is not available.
  // Those platforms (mobile) must call this function manually.


  _createClass(SFItem, [{
    key: "initUUID",
    value: function () {
      var _ref96 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee92() {
        return regeneratorRuntime.wrap(function _callee92$(_context92) {
          while (1) {
            switch (_context92.prev = _context92.next) {
              case 0:
                if (this.uuid) {
                  _context92.next = 4;
                  break;
                }

                _context92.next = 3;
                return SFJS.crypto.generateUUID();

              case 3:
                this.uuid = _context92.sent;

              case 4:
              case "end":
                return _context92.stop();
            }
          }
        }, _callee92, this);
      }));

      function initUUID() {
        return _ref96.apply(this, arguments);
      }

      return initUUID;
    }()
  }, {
    key: "updateFromJSON",
    value: function updateFromJSON(json) {
      // Manually merge top level data instead of wholesale merge
      this.created_at = json.created_at;
      this.updated_at = json.updated_at;
      this.deleted = json.deleted;
      this.uuid = json.uuid;
      this.enc_item_key = json.enc_item_key;
      this.auth_hash = json.auth_hash;
      this.auth_params = json.auth_params;

      // When updating from server response (as opposed to local json response), these keys will be missing.
      // So we only want to update these values if they are explicitly present.
      var clientKeys = ["errorDecrypting", "conflict_of", "dirty", "dirtyCount"];
      var _iteratorNormalCompletion43 = true;
      var _didIteratorError43 = false;
      var _iteratorError43 = undefined;

      try {
        for (var _iterator43 = clientKeys[Symbol.iterator](), _step43; !(_iteratorNormalCompletion43 = (_step43 = _iterator43.next()).done); _iteratorNormalCompletion43 = true) {
          var key = _step43.value;

          if (json[key] !== undefined) {
            this[key] = json[key];
          }
        }

        // Check if object has getter for content_type, and if so, skip
      } catch (err) {
        _didIteratorError43 = true;
        _iteratorError43 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion43 && _iterator43.return) {
            _iterator43.return();
          }
        } finally {
          if (_didIteratorError43) {
            throw _iteratorError43;
          }
        }
      }

      if (!this.content_type) {
        this.content_type = json.content_type;
      }

      // this.content = json.content will copy it by reference rather than value. So we need to do a deep merge after.
      // json.content can still be a string here. We copy it to this.content, then do a deep merge to transfer over all values.

      try {
        var parsedContent = typeof json.content === 'string' ? JSON.parse(json.content) : json.content;
        SFItem.deepMerge(this.contentObject, parsedContent);
      } catch (e) {
        console.log("Error while updating item from json", e);
      }

      if (this.created_at) {
        this.created_at = new Date(this.created_at);
        this.updated_at = new Date(this.updated_at);
      } else {
        this.created_at = new Date();
        this.updated_at = new Date();
      }

      // Allows the getter to be re-invoked
      this._client_updated_at = null;

      if (json.content) {
        this.mapContentToLocalProperties(this.contentObject);
      } else if (json.deleted == true) {
        this.handleDeletedContent();
      }
    }
  }, {
    key: "mapContentToLocalProperties",
    value: function mapContentToLocalProperties(contentObj) {
      if (contentObj.appData) {
        this.appData = contentObj.appData;
      }
      if (!this.appData) {
        this.appData = {};
      }
    }
  }, {
    key: "createContentJSONFromProperties",
    value: function createContentJSONFromProperties() {
      return this.structureParams();
    }
  }, {
    key: "structureParams",
    value: function structureParams() {
      var params = this.contentObject;
      params.appData = this.appData;
      return params;
    }

    /* Allows the item to handle the case where the item is deleted and the content is null */

  }, {
    key: "handleDeletedContent",
    value: function handleDeletedContent() {
      // Subclasses can override
    }
  }, {
    key: "setDirty",
    value: function setDirty(dirty, dontUpdateClientDate) {
      this.dirty = dirty;

      // Allows the syncManager to check if an item has been marked dirty after a sync has been started
      // This prevents it from clearing it as a dirty item after sync completion, if someone else has marked it dirty
      // again after an ongoing sync.
      if (!this.dirtyCount) {
        this.dirtyCount = 0;
      }
      if (dirty) {
        this.dirtyCount++;
      } else {
        this.dirtyCount = 0;
      }

      if (dirty && !dontUpdateClientDate) {
        // Set the client modified date to now if marking the item as dirty
        this.client_updated_at = new Date();
      } else if (!this.hasRawClientUpdatedAtValue()) {
        // copy updated_at
        this.client_updated_at = new Date(this.updated_at);
      }
    }
  }, {
    key: "updateLocalRelationships",
    value: function updateLocalRelationships() {
      // optional override
    }
  }, {
    key: "addItemAsRelationship",
    value: function addItemAsRelationship(item) {
      item.setIsBeingReferencedBy(this);

      if (this.hasRelationshipWithItem(item)) {
        return;
      }

      var references = this.content.references || [];
      references.push({
        uuid: item.uuid,
        content_type: item.content_type
      });
      this.content.references = references;
    }
  }, {
    key: "removeItemAsRelationship",
    value: function removeItemAsRelationship(item) {
      item.setIsNoLongerBeingReferencedBy(this);
      this.removeReferenceWithUuid(item.uuid);
    }

    // When another object has a relationship with us, we push that object into memory here.
    // We use this so that when `this` is deleted, we're able to update the references of those other objects.
    // For example, a Note has a one way relationship with a Tag. If a Tag is deleted, we want to update
    // the Note's references to remove the tag relationship.

  }, {
    key: "setIsBeingReferencedBy",
    value: function setIsBeingReferencedBy(item) {
      if (!_.find(this.referencingObjects, { uuid: item.uuid })) {
        this.referencingObjects.push(item);
      }
    }
  }, {
    key: "setIsNoLongerBeingReferencedBy",
    value: function setIsNoLongerBeingReferencedBy(item) {
      _.remove(this.referencingObjects, { uuid: item.uuid });
      // Legacy two-way relationships should be handled here
      if (this.hasRelationshipWithItem(item)) {
        this.removeReferenceWithUuid(item.uuid);
        // We really shouldn't have the authority to set this item as dirty, but it's the only way to save this change.
        this.setDirty(true);
      }
    }
  }, {
    key: "removeReferenceWithUuid",
    value: function removeReferenceWithUuid(uuid) {
      var references = this.content.references || [];
      references = references.filter(function (r) {
        return r.uuid != uuid;
      });
      this.content.references = references;
    }
  }, {
    key: "hasRelationshipWithItem",
    value: function hasRelationshipWithItem(item) {
      var target = this.content.references.find(function (r) {
        return r.uuid == item.uuid;
      });
      return target != null;
    }
  }, {
    key: "isBeingRemovedLocally",
    value: function isBeingRemovedLocally() {}
  }, {
    key: "didFinishSyncing",
    value: function didFinishSyncing() {}
  }, {
    key: "informReferencesOfUUIDChange",
    value: function informReferencesOfUUIDChange(oldUUID, newUUID) {
      // optional override
    }
  }, {
    key: "potentialItemOfInterestHasChangedItsUUID",
    value: function potentialItemOfInterestHasChangedItsUUID(newItem, oldUUID, newUUID) {
      // optional override
      var _iteratorNormalCompletion44 = true;
      var _didIteratorError44 = false;
      var _iteratorError44 = undefined;

      try {
        for (var _iterator44 = this.content.references[Symbol.iterator](), _step44; !(_iteratorNormalCompletion44 = (_step44 = _iterator44.next()).done); _iteratorNormalCompletion44 = true) {
          var reference = _step44.value;

          if (reference.uuid == oldUUID) {
            reference.uuid = newUUID;
            this.setDirty(true);
          }
        }
      } catch (err) {
        _didIteratorError44 = true;
        _iteratorError44 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion44 && _iterator44.return) {
            _iterator44.return();
          }
        } finally {
          if (_didIteratorError44) {
            throw _iteratorError44;
          }
        }
      }
    }
  }, {
    key: "doNotEncrypt",
    value: function doNotEncrypt() {
      return false;
    }

    /*
    App Data
    */

  }, {
    key: "setDomainDataItem",
    value: function setDomainDataItem(key, value, domain) {
      if (!domain) {
        console.error("SFItem.AppDomain needs to be set.");
        return;
      }
      var data = this.appData[domain];
      if (!data) {
        data = {};
      }
      data[key] = value;
      this.appData[domain] = data;
    }
  }, {
    key: "getDomainDataItem",
    value: function getDomainDataItem(key, domain) {
      if (!domain) {
        console.error("SFItem.AppDomain needs to be set.");
        return;
      }
      var data = this.appData[domain];
      if (data) {
        return data[key];
      } else {
        return null;
      }
    }
  }, {
    key: "setAppDataItem",
    value: function setAppDataItem(key, value) {
      this.setDomainDataItem(key, value, SFItem.AppDomain);
    }
  }, {
    key: "getAppDataItem",
    value: function getAppDataItem(key) {
      return this.getDomainDataItem(key, SFItem.AppDomain);
    }
  }, {
    key: "hasRawClientUpdatedAtValue",
    value: function hasRawClientUpdatedAtValue() {
      return this.getAppDataItem("client_updated_at") != null;
    }
  }, {
    key: "keysToIgnoreWhenCheckingContentEquality",


    /*
      During sync conflicts, when determing whether to create a duplicate for an item, we can omit keys that have no
      meaningful weight and can be ignored. For example, if one component has active = true and another component has active = false,
      it would be silly to duplicate them, so instead we ignore this.
     */
    value: function keysToIgnoreWhenCheckingContentEquality() {
      return [];
    }

    // Same as above, but keys inside appData[Item.AppDomain]

  }, {
    key: "appDataKeysToIgnoreWhenCheckingContentEquality",
    value: function appDataKeysToIgnoreWhenCheckingContentEquality() {
      return ["client_updated_at"];
    }
  }, {
    key: "isItemContentEqualWith",
    value: function isItemContentEqualWith(otherItem) {
      var omit = function omit(obj, keys) {
        if (!obj) {
          return obj;
        }
        var _iteratorNormalCompletion45 = true;
        var _didIteratorError45 = false;
        var _iteratorError45 = undefined;

        try {
          for (var _iterator45 = keys[Symbol.iterator](), _step45; !(_iteratorNormalCompletion45 = (_step45 = _iterator45.next()).done); _iteratorNormalCompletion45 = true) {
            var key = _step45.value;

            delete obj[key];
          }
        } catch (err) {
          _didIteratorError45 = true;
          _iteratorError45 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion45 && _iterator45.return) {
              _iterator45.return();
            }
          } finally {
            if (_didIteratorError45) {
              throw _iteratorError45;
            }
          }
        }

        return obj;
      };

      var left = this.structureParams();
      left.appData[SFItem.AppDomain] = omit(left.appData[SFItem.AppDomain], this.appDataKeysToIgnoreWhenCheckingContentEquality());
      left = omit(left, this.keysToIgnoreWhenCheckingContentEquality());

      var right = otherItem.structureParams();
      right.appData[SFItem.AppDomain] = omit(right.appData[SFItem.AppDomain], otherItem.appDataKeysToIgnoreWhenCheckingContentEquality());
      right = omit(right, otherItem.keysToIgnoreWhenCheckingContentEquality());

      return JSON.stringify(left) === JSON.stringify(right);
    }
  }, {
    key: "satisfiesPredicate",
    value: function satisfiesPredicate(predicate) {
      /*
      Predicate is an SFPredicate having properties:
      {
        keypath: String,
        operator: String,
        value: object
      }
       */
      return SFPredicate.ItemSatisfiesPredicate(this, predicate);
    }

    /*
    Dates
    */

  }, {
    key: "createdAtString",
    value: function createdAtString() {
      return this.dateToLocalizedString(this.created_at);
    }
  }, {
    key: "updatedAtString",
    value: function updatedAtString() {
      return this.dateToLocalizedString(this.client_updated_at);
    }
  }, {
    key: "dateToLocalizedString",
    value: function dateToLocalizedString(date) {
      if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
        if (!dateFormatter) {
          var locale = navigator.languages && navigator.languages.length ? navigator.languages[0] : navigator.language;
          dateFormatter = new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            weekday: 'long',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
        return dateFormatter.format(date);
      } else {
        // IE < 11, Safari <= 9.0.
        // In English, this generates the string most similar to
        // the toLocaleDateString() result above.
        return date.toDateString() + ' ' + date.toLocaleTimeString();
      }
    }
  }, {
    key: "contentObject",
    get: function get() {
      if (!this.content) {
        this.content = {};
        return this.content;
      }

      if (this.content !== null && _typeof(this.content) === 'object') {
        // this is the case when mapping localStorage content, in which case the content is already parsed
        return this.content;
      }

      try {
        var content = JSON.parse(this.content);
        this.content = content;
        return this.content;
      } catch (e) {
        console.log("Error parsing json", e, this);
        this.content = {};
        return this.content;
      }
    }
  }, {
    key: "pinned",
    get: function get() {
      return this.getAppDataItem("pinned");
    }
  }, {
    key: "archived",
    get: function get() {
      return this.getAppDataItem("archived");
    }
  }, {
    key: "locked",
    get: function get() {
      return this.getAppDataItem("locked");
    }

    // May be used by clients to display the human readable type for this item. Should be overriden by subclasses.

  }, {
    key: "displayName",
    get: function get() {
      return "Item";
    }
  }, {
    key: "client_updated_at",
    get: function get() {
      if (!this._client_updated_at) {
        var saved = this.getAppDataItem("client_updated_at");
        if (saved) {
          this._client_updated_at = new Date(saved);
        } else {
          this._client_updated_at = new Date(this.updated_at);
        }
      }
      return this._client_updated_at;
    },
    set: function set(date) {
      this._client_updated_at = date;

      this.setAppDataItem("client_updated_at", date);
    }
  }], [{
    key: "deepMerge",
    value: function deepMerge(a, b) {
      // By default _.merge will not merge a full array with an empty one.
      // We want to replace arrays wholesale
      function mergeCopyArrays(objValue, srcValue) {
        if (_.isArray(objValue)) {
          return srcValue;
        }
      }
      _.mergeWith(a, b, mergeCopyArrays);
      return a;
    }
  }]);

  return SFItem;
}();

;
var SFItemParams = exports.SFItemParams = function () {
  function SFItemParams(item, keys, auth_params) {
    _classCallCheck(this, SFItemParams);

    this.item = item;
    this.keys = keys;
    this.auth_params = auth_params;

    if (this.keys && !this.auth_params) {
      throw "SFItemParams.auth_params must be supplied if supplying keys.";
    }

    if (this.auth_params && !this.auth_params.version) {
      throw "SFItemParams.auth_params is missing version";
    }
  }

  _createClass(SFItemParams, [{
    key: "paramsForExportFile",
    value: function () {
      var _ref97 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee93(includeDeleted) {
        var result;
        return regeneratorRuntime.wrap(function _callee93$(_context93) {
          while (1) {
            switch (_context93.prev = _context93.next) {
              case 0:
                this.additionalFields = ["updated_at"];
                this.forExportFile = true;

                if (!includeDeleted) {
                  _context93.next = 6;
                  break;
                }

                return _context93.abrupt("return", this.__params());

              case 6:
                _context93.next = 8;
                return this.__params();

              case 8:
                result = _context93.sent;
                return _context93.abrupt("return", _.omit(result, ["deleted"]));

              case 10:
              case "end":
                return _context93.stop();
            }
          }
        }, _callee93, this);
      }));

      function paramsForExportFile(_x120) {
        return _ref97.apply(this, arguments);
      }

      return paramsForExportFile;
    }()
  }, {
    key: "paramsForExtension",
    value: function () {
      var _ref98 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee94() {
        return regeneratorRuntime.wrap(function _callee94$(_context94) {
          while (1) {
            switch (_context94.prev = _context94.next) {
              case 0:
                return _context94.abrupt("return", this.paramsForExportFile());

              case 1:
              case "end":
                return _context94.stop();
            }
          }
        }, _callee94, this);
      }));

      function paramsForExtension() {
        return _ref98.apply(this, arguments);
      }

      return paramsForExtension;
    }()
  }, {
    key: "paramsForLocalStorage",
    value: function () {
      var _ref99 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee95() {
        return regeneratorRuntime.wrap(function _callee95$(_context95) {
          while (1) {
            switch (_context95.prev = _context95.next) {
              case 0:
                this.additionalFields = ["updated_at", "dirty", "errorDecrypting"];
                this.forExportFile = true;
                return _context95.abrupt("return", this.__params());

              case 3:
              case "end":
                return _context95.stop();
            }
          }
        }, _callee95, this);
      }));

      function paramsForLocalStorage() {
        return _ref99.apply(this, arguments);
      }

      return paramsForLocalStorage;
    }()
  }, {
    key: "paramsForSync",
    value: function () {
      var _ref100 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee96() {
        return regeneratorRuntime.wrap(function _callee96$(_context96) {
          while (1) {
            switch (_context96.prev = _context96.next) {
              case 0:
                return _context96.abrupt("return", this.__params());

              case 1:
              case "end":
                return _context96.stop();
            }
          }
        }, _callee96, this);
      }));

      function paramsForSync() {
        return _ref100.apply(this, arguments);
      }

      return paramsForSync;
    }()
  }, {
    key: "__params",
    value: function () {
      var _ref101 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee97() {
        var params, doNotEncrypt, encryptedParams;
        return regeneratorRuntime.wrap(function _callee97$(_context97) {
          while (1) {
            switch (_context97.prev = _context97.next) {
              case 0:
                params = { uuid: this.item.uuid, content_type: this.item.content_type, deleted: this.item.deleted, created_at: this.item.created_at };

                if (this.item.errorDecrypting) {
                  _context97.next = 23;
                  break;
                }

                // Items should always be encrypted for export files. Only respect item.doNotEncrypt for remote sync params.
                doNotEncrypt = this.item.doNotEncrypt() && !this.forExportFile;

                if (!(this.keys && !doNotEncrypt)) {
                  _context97.next = 11;
                  break;
                }

                _context97.next = 6;
                return SFJS.itemTransformer.encryptItem(this.item, this.keys, this.auth_params);

              case 6:
                encryptedParams = _context97.sent;

                _.merge(params, encryptedParams);

                if (this.auth_params.version !== "001") {
                  params.auth_hash = null;
                }
                _context97.next = 21;
                break;

              case 11:
                if (!this.forExportFile) {
                  _context97.next = 15;
                  break;
                }

                _context97.t0 = this.item.createContentJSONFromProperties();
                _context97.next = 19;
                break;

              case 15:
                _context97.next = 17;
                return SFJS.crypto.base64(JSON.stringify(this.item.createContentJSONFromProperties()));

              case 17:
                _context97.t1 = _context97.sent;
                _context97.t0 = "000" + _context97.t1;

              case 19:
                params.content = _context97.t0;

                if (!this.forExportFile) {
                  params.enc_item_key = null;
                  params.auth_hash = null;
                }

              case 21:
                _context97.next = 26;
                break;

              case 23:
                // Error decrypting, keep "content" and related fields as is (and do not try to encrypt, otherwise that would be undefined behavior)
                params.content = this.item.content;
                params.enc_item_key = this.item.enc_item_key;
                params.auth_hash = this.item.auth_hash;

              case 26:

                if (this.additionalFields) {
                  _.merge(params, _.pick(this.item, this.additionalFields));
                }

                return _context97.abrupt("return", params);

              case 28:
              case "end":
                return _context97.stop();
            }
          }
        }, _callee97, this);
      }));

      function __params() {
        return _ref101.apply(this, arguments);
      }

      return __params;
    }()
  }]);

  return SFItemParams;
}();

;
var SFPredicate = exports.SFPredicate = function () {
  function SFPredicate(keypath, operator, value) {
    _classCallCheck(this, SFPredicate);

    this.keypath = keypath;
    this.operator = operator;
    this.value = value;
  }

  _createClass(SFPredicate, null, [{
    key: "fromArray",
    value: function fromArray(array) {
      var pred = new SFPredicate();
      pred.keypath = array[0];
      pred.operator = array[1];
      pred.value = array[2];
      return pred;
    }
  }, {
    key: "ObjectSatisfiesPredicate",
    value: function ObjectSatisfiesPredicate(object, predicate) {
      var valueAtKeyPath = predicate.keypath.split('.').reduce(function (previous, current) {
        return previous && previous[current];
      }, object);

      var predicateValue = predicate.value;
      if (typeof predicateValue == 'string' && predicateValue.includes(".ago")) {
        predicateValue = this.DateFromString(predicateValue);
      }

      var falseyValues = [false, "", null, undefined, NaN];

      if (valueAtKeyPath == undefined) {
        return falseyValues.includes(predicate.value);
      }

      if (predicate.operator == "=") {
        // Use array comparison
        if (Array.isArray(valueAtKeyPath)) {
          return JSON.stringify(valueAtKeyPath) == JSON.stringify(predicateValue);
        } else {
          return valueAtKeyPath == predicateValue;
        }
      } else if (predicate.operator == "<") {
        return valueAtKeyPath < predicateValue;
      } else if (predicate.operator == ">") {
        return valueAtKeyPath > predicateValue;
      } else if (predicate.operator == "<=") {
        return valueAtKeyPath <= predicateValue;
      } else if (predicate.operator == ">=") {
        return valueAtKeyPath >= predicateValue;
      } else if (predicate.operator == "startsWith") {
        return valueAtKeyPath.startsWith(predicateValue);
      } else if (predicate.operator == "in") {
        return predicateValue.indexOf(valueAtKeyPath) != -1;
      } else if (predicate.operator == "includes") {
        return this.resolveIncludesPredicate(valueAtKeyPath, predicateValue);
      } else if (predicate.operator == "matches") {
        var regex = new RegExp(predicateValue);
        return regex.test(valueAtKeyPath);
      }

      return false;
    }
  }, {
    key: "resolveIncludesPredicate",
    value: function resolveIncludesPredicate(valueAtKeyPath, predicateValue) {
      // includes can be a string  or a predicate (in array form)
      if (typeof predicateValue == 'string') {
        // if string, simply check if the valueAtKeyPath includes the predicate value
        return valueAtKeyPath.includes(predicateValue);
      } else {
        // is a predicate array or predicate object
        var innerPredicate;
        if (Array.isArray(predicateValue)) {
          innerPredicate = SFPredicate.fromArray(predicateValue);
        } else {
          innerPredicate = predicateValue;
        }
        var _iteratorNormalCompletion46 = true;
        var _didIteratorError46 = false;
        var _iteratorError46 = undefined;

        try {
          for (var _iterator46 = valueAtKeyPath[Symbol.iterator](), _step46; !(_iteratorNormalCompletion46 = (_step46 = _iterator46.next()).done); _iteratorNormalCompletion46 = true) {
            var obj = _step46.value;

            if (this.ObjectSatisfiesPredicate(obj, innerPredicate)) {
              return true;
            }
          }
        } catch (err) {
          _didIteratorError46 = true;
          _iteratorError46 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion46 && _iterator46.return) {
              _iterator46.return();
            }
          } finally {
            if (_didIteratorError46) {
              throw _iteratorError46;
            }
          }
        }

        return false;
      }
    }
  }, {
    key: "ItemSatisfiesPredicate",
    value: function ItemSatisfiesPredicate(item, predicate) {
      if (Array.isArray(predicate)) {
        predicate = SFPredicate.fromArray(predicate);
      }
      return this.ObjectSatisfiesPredicate(item, predicate);
    }
  }, {
    key: "ItemSatisfiesPredicates",
    value: function ItemSatisfiesPredicates(item, predicates) {
      var _iteratorNormalCompletion47 = true;
      var _didIteratorError47 = false;
      var _iteratorError47 = undefined;

      try {
        for (var _iterator47 = predicates[Symbol.iterator](), _step47; !(_iteratorNormalCompletion47 = (_step47 = _iterator47.next()).done); _iteratorNormalCompletion47 = true) {
          var predicate = _step47.value;

          if (!this.ItemSatisfiesPredicate(item, predicate)) {
            return false;
          }
        }
      } catch (err) {
        _didIteratorError47 = true;
        _iteratorError47 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion47 && _iterator47.return) {
            _iterator47.return();
          }
        } finally {
          if (_didIteratorError47) {
            throw _iteratorError47;
          }
        }
      }

      return true;
    }
  }, {
    key: "DateFromString",
    value: function DateFromString(string) {
      // x.days.ago, x.hours.ago
      var comps = string.split(".");
      var unit = comps[1];
      var date = new Date();
      var offset = parseInt(comps[0]);
      if (unit == "days") {
        date.setDate(date.getDate() - offset);
      } else if (unit == "hours") {
        date.setHours(date.getHours() - offset);
      }
      return date;
    }
  }]);

  return SFPredicate;
}();

;
var SFPrivileges = exports.SFPrivileges = function (_SFItem) {
  _inherits(SFPrivileges, _SFItem);

  function SFPrivileges() {
    _classCallCheck(this, SFPrivileges);

    return _possibleConstructorReturn(this, (SFPrivileges.__proto__ || Object.getPrototypeOf(SFPrivileges)).apply(this, arguments));
  }

  _createClass(SFPrivileges, [{
    key: "setCredentialsForAction",
    value: function setCredentialsForAction(action, credentials) {
      this.content.desktopPrivileges[action] = credentials;
    }
  }, {
    key: "getCredentialsForAction",
    value: function getCredentialsForAction(action) {
      return this.content.desktopPrivileges[action] || [];
    }
  }, {
    key: "toggleCredentialForAction",
    value: function toggleCredentialForAction(action, credential) {
      if (this.isCredentialRequiredForAction(action, credential)) {
        this.removeCredentialForAction(action, credential);
      } else {
        this.addCredentialForAction(action, credential);
      }
    }
  }, {
    key: "removeCredentialForAction",
    value: function removeCredentialForAction(action, credential) {
      _.pull(this.content.desktopPrivileges[action], credential);
    }
  }, {
    key: "addCredentialForAction",
    value: function addCredentialForAction(action, credential) {
      var credentials = this.getCredentialsForAction(action);
      credentials.push(credential);
      this.setCredentialsForAction(action, credentials);
    }
  }, {
    key: "isCredentialRequiredForAction",
    value: function isCredentialRequiredForAction(action, credential) {
      var credentialsRequired = this.getCredentialsForAction(action);
      return credentialsRequired.includes(credential);
    }
  }], [{
    key: "contentType",
    value: function contentType() {
      // It has prefix SN since it was originally imported from SN codebase
      return "SN|Privileges";
    }
  }]);

  return SFPrivileges;
}(SFItem);

; /*
   Important: This is the only object in the session history domain that is persistable.
    A history session contains one main content object:
   the itemUUIDToItemHistoryMapping. This is a dictionary whose keys are item uuids,
   and each value is an SFItemHistory object.
    Each SFItemHistory object contains an array called `entires` which contain `SFItemHistory` entries (or subclasses, if the
   `SFItemHistory.HistoryEntryClassMapping` class property value is set.)
  */

// See default class values at bottom of this file, including `SFHistorySession.LargeItemEntryAmountThreshold`.

var SFHistorySession = exports.SFHistorySession = function (_SFItem2) {
  _inherits(SFHistorySession, _SFItem2);

  function SFHistorySession(json_obj) {
    _classCallCheck(this, SFHistorySession);

    /*
      Our .content params:
      {
        itemUUIDToItemHistoryMapping
      }
     */

    var _this26 = _possibleConstructorReturn(this, (SFHistorySession.__proto__ || Object.getPrototypeOf(SFHistorySession)).call(this, json_obj));

    if (!_this26.content.itemUUIDToItemHistoryMapping) {
      _this26.content.itemUUIDToItemHistoryMapping = {};
    }

    // When initializing from a json_obj, we want to deserialize the item history JSON into SFItemHistory objects.
    var uuids = Object.keys(_this26.content.itemUUIDToItemHistoryMapping);
    uuids.forEach(function (itemUUID) {
      var itemHistory = _this26.content.itemUUIDToItemHistoryMapping[itemUUID];
      _this26.content.itemUUIDToItemHistoryMapping[itemUUID] = new SFItemHistory(itemHistory);
    });
    return _this26;
  }

  _createClass(SFHistorySession, [{
    key: "addEntryForItem",
    value: function addEntryForItem(item) {
      var itemHistory = this.historyForItem(item);
      var entry = itemHistory.addHistoryEntryForItem(item);
      return entry;
    }
  }, {
    key: "historyForItem",
    value: function historyForItem(item) {
      var history = this.content.itemUUIDToItemHistoryMapping[item.uuid];
      if (!history) {
        history = this.content.itemUUIDToItemHistoryMapping[item.uuid] = new SFItemHistory();
      }
      return history;
    }
  }, {
    key: "clearItemHistory",
    value: function clearItemHistory(item) {
      this.historyForItem(item).clear();
    }
  }, {
    key: "clearAllHistory",
    value: function clearAllHistory() {
      this.content.itemUUIDToItemHistoryMapping = {};
    }
  }, {
    key: "optimizeHistoryForItem",
    value: function optimizeHistoryForItem(item) {
      // Clean up if there are too many revisions. Note SFHistorySession.LargeItemEntryAmountThreshold is the amount of revisions which above, call
      // for an optimization. An optimization may not remove entries above this threshold. It will determine what it should keep and what it shouldn't.
      // So, it is possible to have a threshold of 60 but have 600 entries, if the item history deems those worth keeping.
      var itemHistory = this.historyForItem(item);
      if (itemHistory.entries.length > SFHistorySession.LargeItemEntryAmountThreshold) {
        itemHistory.optimize();
      }
    }
  }]);

  return SFHistorySession;
}(SFItem);

// See comment in `this.optimizeHistoryForItem`


SFHistorySession.LargeItemEntryAmountThreshold = 60;
; // See default class values at bottom of this file, including `SFItemHistory.LargeEntryDeltaThreshold`.

var SFItemHistory = exports.SFItemHistory = function () {
  function SFItemHistory() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, SFItemHistory);

    if (!this.entries) {
      this.entries = [];
    }

    // Deserialize the entries into entry objects.
    if (params.entries) {
      var _iteratorNormalCompletion48 = true;
      var _didIteratorError48 = false;
      var _iteratorError48 = undefined;

      try {
        for (var _iterator48 = params.entries[Symbol.iterator](), _step48; !(_iteratorNormalCompletion48 = (_step48 = _iterator48.next()).done); _iteratorNormalCompletion48 = true) {
          var entryParams = _step48.value;

          var entry = this.createEntryForItem(entryParams.item);
          entry.setPreviousEntry(this.getLastEntry());
          this.entries.push(entry);
        }
      } catch (err) {
        _didIteratorError48 = true;
        _iteratorError48 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion48 && _iterator48.return) {
            _iterator48.return();
          }
        } finally {
          if (_didIteratorError48) {
            throw _iteratorError48;
          }
        }
      }
    }
  }

  _createClass(SFItemHistory, [{
    key: "createEntryForItem",
    value: function createEntryForItem(item) {
      var historyItemClass = SFItemHistory.HistoryEntryClassMapping && SFItemHistory.HistoryEntryClassMapping[item.content_type];
      if (!historyItemClass) {
        historyItemClass = SFItemHistoryEntry;
      }
      var entry = new historyItemClass(item);
      return entry;
    }
  }, {
    key: "getLastEntry",
    value: function getLastEntry() {
      return this.entries[this.entries.length - 1];
    }
  }, {
    key: "addHistoryEntryForItem",
    value: function addHistoryEntryForItem(item) {
      var prospectiveEntry = this.createEntryForItem(item);

      var previousEntry = this.getLastEntry();
      prospectiveEntry.setPreviousEntry(previousEntry);

      // Don't add first revision if text length is 0, as this means it's a new note.
      // Actually, nevermind. If we do this, the first character added to a new note
      // will be displayed as "1 characters loaded".
      // if(!previousRevision && prospectiveRevision.textCharDiffLength == 0) {
      //   return;
      // }

      // Don't add if text is the same
      if (prospectiveEntry.isSameAsEntry(previousEntry)) {
        return;
      }

      this.entries.push(prospectiveEntry);
      return prospectiveEntry;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.entries.length = 0;
    }
  }, {
    key: "optimize",
    value: function optimize() {
      var _this27 = this;

      var keepEntries = [];

      var isEntrySignificant = function isEntrySignificant(entry) {
        return entry.deltaSize() > SFItemHistory.LargeEntryDeltaThreshold;
      };

      var processEntry = function processEntry(entry, index, keep) {
        // Entries may be processed retrospectively, meaning it can be decided to be deleted, then an upcoming processing can change that.
        if (keep) {
          keepEntries.push(entry);
        } else {
          // Remove if in keep
          var index = keepEntries.indexOf(entry);
          if (index !== -1) {
            keepEntries.splice(index, 1);
          }
        }

        if (keep && isEntrySignificant(entry) && entry.operationVector() == -1) {
          // This is a large negative change. Hang on to the previous entry.
          var previousEntry = _this27.entries[index - 1];
          if (previousEntry) {
            keepEntries.push(previousEntry);
          }
        }
      };

      this.entries.forEach(function (entry, index) {
        if (index == 0 || index == _this27.entries.length - 1) {
          // Keep the first and last
          processEntry(entry, index, true);
        } else {
          var significant = isEntrySignificant(entry);
          processEntry(entry, index, significant);
        }
      });

      this.entries = this.entries.filter(function (entry, index) {
        return keepEntries.indexOf(entry) !== -1;
      });
    }
  }]);

  return SFItemHistory;
}();

// The amount of characters added or removed that constitute a keepable entry after optimization.


SFItemHistory.LargeEntryDeltaThreshold = 15;
;
var SFItemHistoryEntry = exports.SFItemHistoryEntry = function () {
  function SFItemHistoryEntry(item) {
    _classCallCheck(this, SFItemHistoryEntry);

    // Whatever values `item` has will be persisted, so be sure that the values are picked beforehand.
    this.item = SFItem.deepMerge({}, item);

    // We'll assume a `text` content value to diff on. If it doesn't exist, no problem.
    this.defaultContentKeyToDiffOn = "text";

    // Default value
    this.textCharDiffLength = 0;

    if (typeof this.item.updated_at == 'string') {
      this.item.updated_at = new Date(this.item.updated_at);
    }
  }

  _createClass(SFItemHistoryEntry, [{
    key: "setPreviousEntry",
    value: function setPreviousEntry(previousEntry) {
      this.hasPreviousEntry = previousEntry != null;

      // we'll try to compute the delta based on an assumed content property of `text`, if it exists.
      if (this.item.content[this.defaultContentKeyToDiffOn]) {
        if (previousEntry) {
          this.textCharDiffLength = this.item.content[this.defaultContentKeyToDiffOn].length - previousEntry.item.content[this.defaultContentKeyToDiffOn].length;
        } else {
          this.textCharDiffLength = this.item.content[this.defaultContentKeyToDiffOn].length;
        }
      }
    }
  }, {
    key: "operationVector",
    value: function operationVector() {
      // We'll try to use the value of `textCharDiffLength` to help determine this, if it's set
      if (this.textCharDiffLength != undefined) {
        if (!this.hasPreviousEntry || this.textCharDiffLength == 0) {
          return 0;
        } else if (this.textCharDiffLength < 0) {
          return -1;
        } else {
          return 1;
        }
      }

      // Otherwise use a default value of 1
      return 1;
    }
  }, {
    key: "deltaSize",
    value: function deltaSize() {
      // Up to the subclass to determine how large the delta was, i.e number of characters changed.
      // But this general class won't be able to determine which property it should diff on, or even its format.

      // We can return the `textCharDiffLength` if it's set, otherwise, just return 1;
      if (this.textCharDiffLength != undefined) {
        return Math.abs(this.textCharDiffLength);
      }

      // Otherwise return 1 here to constitute a basic positive delta.
      // The value returned should always be positive. override `operationVector` to return the direction of the delta.
      return 1;
    }
  }, {
    key: "isSameAsEntry",
    value: function isSameAsEntry(entry) {
      if (!entry) {
        return false;
      }

      var lhs = new SFItem(this.item);
      var rhs = new SFItem(entry.item);
      return lhs.isItemContentEqualWith(rhs);
    }
  }]);

  return SFItemHistoryEntry;
}();

; /* Abstract class. Instantiate an instance of either SFCryptoJS (uses cryptojs) or SFCryptoWeb (uses web crypto) */

var globalScope = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : null;

var SFAbstractCrypto = exports.SFAbstractCrypto = function () {
  function SFAbstractCrypto() {
    _classCallCheck(this, SFAbstractCrypto);

    this.DefaultPBKDF2Length = 768;
  }

  /*
  Our WebCrypto implementation only offers PBKDf2, so any other encryption
  and key generation functions must use CryptoJS in this abstract implementation.
  */

  _createClass(SFAbstractCrypto, [{
    key: "generateUUIDSync",
    value: function generateUUIDSync() {
      var crypto = globalScope.crypto || globalScope.msCrypto;
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
        if (globalScope.performance && typeof globalScope.performance.now === "function") {
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
    key: "generateUUID",
    value: function () {
      var _ref102 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee98() {
        return regeneratorRuntime.wrap(function _callee98$(_context98) {
          while (1) {
            switch (_context98.prev = _context98.next) {
              case 0:
                return _context98.abrupt("return", this.generateUUIDSync());

              case 1:
              case "end":
                return _context98.stop();
            }
          }
        }, _callee98, this);
      }));

      function generateUUID() {
        return _ref102.apply(this, arguments);
      }

      return generateUUID;
    }()
  }, {
    key: "decryptText",
    value: function () {
      var _ref103 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee99() {
        var _ref104 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            ciphertextToAuth = _ref104.ciphertextToAuth,
            contentCiphertext = _ref104.contentCiphertext,
            encryptionKey = _ref104.encryptionKey,
            iv = _ref104.iv,
            authHash = _ref104.authHash,
            authKey = _ref104.authKey;

        var requiresAuth = arguments[1];
        var localAuthHash, keyData, ivData, decrypted;
        return regeneratorRuntime.wrap(function _callee99$(_context99) {
          while (1) {
            switch (_context99.prev = _context99.next) {
              case 0:
                if (!(requiresAuth && !authHash)) {
                  _context99.next = 3;
                  break;
                }

                console.error("Auth hash is required.");
                return _context99.abrupt("return");

              case 3:
                if (!authHash) {
                  _context99.next = 10;
                  break;
                }

                _context99.next = 6;
                return this.hmac256(ciphertextToAuth, authKey);

              case 6:
                localAuthHash = _context99.sent;

                if (!(authHash !== localAuthHash)) {
                  _context99.next = 10;
                  break;
                }

                console.error("Auth hash does not match, returning null.");
                return _context99.abrupt("return", null);

              case 10:
                keyData = CryptoJS.enc.Hex.parse(encryptionKey);
                ivData = CryptoJS.enc.Hex.parse(iv || "");
                decrypted = CryptoJS.AES.decrypt(contentCiphertext, keyData, { iv: ivData, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
                return _context99.abrupt("return", decrypted.toString(CryptoJS.enc.Utf8));

              case 14:
              case "end":
                return _context99.stop();
            }
          }
        }, _callee99, this);
      }));

      function decryptText() {
        return _ref103.apply(this, arguments);
      }

      return decryptText;
    }()
  }, {
    key: "encryptText",
    value: function () {
      var _ref105 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee100(text, key, iv) {
        var keyData, ivData, encrypted;
        return regeneratorRuntime.wrap(function _callee100$(_context100) {
          while (1) {
            switch (_context100.prev = _context100.next) {
              case 0:
                keyData = CryptoJS.enc.Hex.parse(key);
                ivData = CryptoJS.enc.Hex.parse(iv || "");
                encrypted = CryptoJS.AES.encrypt(text, keyData, { iv: ivData, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
                return _context100.abrupt("return", encrypted.toString());

              case 4:
              case "end":
                return _context100.stop();
            }
          }
        }, _callee100, this);
      }));

      function encryptText(_x123, _x124, _x125) {
        return _ref105.apply(this, arguments);
      }

      return encryptText;
    }()
  }, {
    key: "generateRandomKey",
    value: function () {
      var _ref106 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee101(bits) {
        return regeneratorRuntime.wrap(function _callee101$(_context101) {
          while (1) {
            switch (_context101.prev = _context101.next) {
              case 0:
                return _context101.abrupt("return", CryptoJS.lib.WordArray.random(bits / 8).toString());

              case 1:
              case "end":
                return _context101.stop();
            }
          }
        }, _callee101, this);
      }));

      function generateRandomKey(_x126) {
        return _ref106.apply(this, arguments);
      }

      return generateRandomKey;
    }()
  }, {
    key: "generateItemEncryptionKey",
    value: function () {
      var _ref107 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee102() {
        var length, cost, salt, passphrase;
        return regeneratorRuntime.wrap(function _callee102$(_context102) {
          while (1) {
            switch (_context102.prev = _context102.next) {
              case 0:
                // Generates a key that will be split in half, each being 256 bits. So total length will need to be 512.
                length = 512;
                cost = 1;
                _context102.next = 4;
                return this.generateRandomKey(length);

              case 4:
                salt = _context102.sent;
                _context102.next = 7;
                return this.generateRandomKey(length);

              case 7:
                passphrase = _context102.sent;
                return _context102.abrupt("return", this.pbkdf2(passphrase, salt, cost, length));

              case 9:
              case "end":
                return _context102.stop();
            }
          }
        }, _callee102, this);
      }));

      function generateItemEncryptionKey() {
        return _ref107.apply(this, arguments);
      }

      return generateItemEncryptionKey;
    }()
  }, {
    key: "firstHalfOfKey",
    value: function () {
      var _ref108 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee103(key) {
        return regeneratorRuntime.wrap(function _callee103$(_context103) {
          while (1) {
            switch (_context103.prev = _context103.next) {
              case 0:
                return _context103.abrupt("return", key.substring(0, key.length / 2));

              case 1:
              case "end":
                return _context103.stop();
            }
          }
        }, _callee103, this);
      }));

      function firstHalfOfKey(_x127) {
        return _ref108.apply(this, arguments);
      }

      return firstHalfOfKey;
    }()
  }, {
    key: "secondHalfOfKey",
    value: function () {
      var _ref109 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee104(key) {
        return regeneratorRuntime.wrap(function _callee104$(_context104) {
          while (1) {
            switch (_context104.prev = _context104.next) {
              case 0:
                return _context104.abrupt("return", key.substring(key.length / 2, key.length));

              case 1:
              case "end":
                return _context104.stop();
            }
          }
        }, _callee104, this);
      }));

      function secondHalfOfKey(_x128) {
        return _ref109.apply(this, arguments);
      }

      return secondHalfOfKey;
    }()
  }, {
    key: "base64",
    value: function () {
      var _ref110 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee105(text) {
        return regeneratorRuntime.wrap(function _callee105$(_context105) {
          while (1) {
            switch (_context105.prev = _context105.next) {
              case 0:
                return _context105.abrupt("return", globalScope.btoa(encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, function toSolidBytes(match, p1) {
                  return String.fromCharCode('0x' + p1);
                })));

              case 1:
              case "end":
                return _context105.stop();
            }
          }
        }, _callee105, this);
      }));

      function base64(_x129) {
        return _ref110.apply(this, arguments);
      }

      return base64;
    }()
  }, {
    key: "base64Decode",
    value: function () {
      var _ref111 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee106(base64String) {
        return regeneratorRuntime.wrap(function _callee106$(_context106) {
          while (1) {
            switch (_context106.prev = _context106.next) {
              case 0:
                return _context106.abrupt("return", globalScope.atob(base64String));

              case 1:
              case "end":
                return _context106.stop();
            }
          }
        }, _callee106, this);
      }));

      function base64Decode(_x130) {
        return _ref111.apply(this, arguments);
      }

      return base64Decode;
    }()
  }, {
    key: "sha256",
    value: function () {
      var _ref112 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee107(text) {
        return regeneratorRuntime.wrap(function _callee107$(_context107) {
          while (1) {
            switch (_context107.prev = _context107.next) {
              case 0:
                return _context107.abrupt("return", CryptoJS.SHA256(text).toString());

              case 1:
              case "end":
                return _context107.stop();
            }
          }
        }, _callee107, this);
      }));

      function sha256(_x131) {
        return _ref112.apply(this, arguments);
      }

      return sha256;
    }()
  }, {
    key: "hmac256",
    value: function () {
      var _ref113 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee108(message, key) {
        var keyData, messageData, result;
        return regeneratorRuntime.wrap(function _callee108$(_context108) {
          while (1) {
            switch (_context108.prev = _context108.next) {
              case 0:
                keyData = CryptoJS.enc.Hex.parse(key);
                messageData = CryptoJS.enc.Utf8.parse(message);
                result = CryptoJS.HmacSHA256(messageData, keyData).toString();
                return _context108.abrupt("return", result);

              case 4:
              case "end":
                return _context108.stop();
            }
          }
        }, _callee108, this);
      }));

      function hmac256(_x132, _x133) {
        return _ref113.apply(this, arguments);
      }

      return hmac256;
    }()
  }, {
    key: "generateSalt",
    value: function () {
      var _ref114 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee109(identifier, version, cost, nonce) {
        var result;
        return regeneratorRuntime.wrap(function _callee109$(_context109) {
          while (1) {
            switch (_context109.prev = _context109.next) {
              case 0:
                _context109.next = 2;
                return this.sha256([identifier, "SF", version, cost, nonce].join(":"));

              case 2:
                result = _context109.sent;
                return _context109.abrupt("return", result);

              case 4:
              case "end":
                return _context109.stop();
            }
          }
        }, _callee109, this);
      }));

      function generateSalt(_x134, _x135, _x136, _x137) {
        return _ref114.apply(this, arguments);
      }

      return generateSalt;
    }()

    /** Generates two deterministic keys based on one input */

  }, {
    key: "generateSymmetricKeyPair",
    value: function () {
      var _ref115 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee110() {
        var _ref116 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            password = _ref116.password,
            pw_salt = _ref116.pw_salt,
            pw_cost = _ref116.pw_cost;

        var output, outputLength, splitLength, firstThird, secondThird, thirdThird;
        return regeneratorRuntime.wrap(function _callee110$(_context110) {
          while (1) {
            switch (_context110.prev = _context110.next) {
              case 0:
                _context110.next = 2;
                return this.pbkdf2(password, pw_salt, pw_cost, this.DefaultPBKDF2Length);

              case 2:
                output = _context110.sent;
                outputLength = output.length;
                splitLength = outputLength / 3;
                firstThird = output.slice(0, splitLength);
                secondThird = output.slice(splitLength, splitLength * 2);
                thirdThird = output.slice(splitLength * 2, splitLength * 3);
                return _context110.abrupt("return", [firstThird, secondThird, thirdThird]);

              case 9:
              case "end":
                return _context110.stop();
            }
          }
        }, _callee110, this);
      }));

      function generateSymmetricKeyPair() {
        return _ref115.apply(this, arguments);
      }

      return generateSymmetricKeyPair;
    }()
  }, {
    key: "computeEncryptionKeysForUser",
    value: function () {
      var _ref117 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee111(password, authParams) {
        var pw_salt;
        return regeneratorRuntime.wrap(function _callee111$(_context111) {
          while (1) {
            switch (_context111.prev = _context111.next) {
              case 0:
                if (!(authParams.version == "003")) {
                  _context111.next = 9;
                  break;
                }

                if (authParams.identifier) {
                  _context111.next = 4;
                  break;
                }

                console.error("authParams is missing identifier.");
                return _context111.abrupt("return");

              case 4:
                _context111.next = 6;
                return this.generateSalt(authParams.identifier, authParams.version, authParams.pw_cost, authParams.pw_nonce);

              case 6:
                pw_salt = _context111.sent;
                _context111.next = 10;
                break;

              case 9:
                // Salt is returned from server
                pw_salt = authParams.pw_salt;

              case 10:
                return _context111.abrupt("return", this.generateSymmetricKeyPair({ password: password, pw_salt: pw_salt, pw_cost: authParams.pw_cost }).then(function (keys) {
                  var userKeys = { pw: keys[0], mk: keys[1], ak: keys[2] };
                  return userKeys;
                }));

              case 11:
              case "end":
                return _context111.stop();
            }
          }
        }, _callee111, this);
      }));

      function computeEncryptionKeysForUser(_x139, _x140) {
        return _ref117.apply(this, arguments);
      }

      return computeEncryptionKeysForUser;
    }()

    // Unlike computeEncryptionKeysForUser, this method always uses the latest SF Version

  }, {
    key: "generateInitialKeysAndAuthParamsForUser",
    value: function () {
      var _ref118 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee112(identifier, password) {
        var version, pw_cost, pw_nonce, pw_salt;
        return regeneratorRuntime.wrap(function _callee112$(_context112) {
          while (1) {
            switch (_context112.prev = _context112.next) {
              case 0:
                version = this.SFJS.version;
                pw_cost = this.SFJS.defaultPasswordGenerationCost;
                _context112.next = 4;
                return this.generateRandomKey(256);

              case 4:
                pw_nonce = _context112.sent;
                _context112.next = 7;
                return this.generateSalt(identifier, version, pw_cost, pw_nonce);

              case 7:
                pw_salt = _context112.sent;
                return _context112.abrupt("return", this.generateSymmetricKeyPair({ password: password, pw_salt: pw_salt, pw_cost: pw_cost }).then(function (keys) {
                  var authParams = { pw_nonce: pw_nonce, pw_cost: pw_cost, identifier: identifier, version: version };
                  var userKeys = { pw: keys[0], mk: keys[1], ak: keys[2] };
                  return { keys: userKeys, authParams: authParams };
                }));

              case 9:
              case "end":
                return _context112.stop();
            }
          }
        }, _callee112, this);
      }));

      function generateInitialKeysAndAuthParamsForUser(_x141, _x142) {
        return _ref118.apply(this, arguments);
      }

      return generateInitialKeysAndAuthParamsForUser;
    }()
  }]);

  return SFAbstractCrypto;
}();

;
var SFCryptoJS = exports.SFCryptoJS = function (_SFAbstractCrypto) {
  _inherits(SFCryptoJS, _SFAbstractCrypto);

  function SFCryptoJS() {
    _classCallCheck(this, SFCryptoJS);

    return _possibleConstructorReturn(this, (SFCryptoJS.__proto__ || Object.getPrototypeOf(SFCryptoJS)).apply(this, arguments));
  }

  _createClass(SFCryptoJS, [{
    key: "pbkdf2",
    value: function () {
      var _ref119 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee113(password, pw_salt, pw_cost, length) {
        var params;
        return regeneratorRuntime.wrap(function _callee113$(_context113) {
          while (1) {
            switch (_context113.prev = _context113.next) {
              case 0:
                params = {
                  keySize: length / 32,
                  hasher: CryptoJS.algo.SHA512,
                  iterations: pw_cost
                };
                return _context113.abrupt("return", CryptoJS.PBKDF2(password, pw_salt, params).toString());

              case 2:
              case "end":
                return _context113.stop();
            }
          }
        }, _callee113, this);
      }));

      function pbkdf2(_x143, _x144, _x145, _x146) {
        return _ref119.apply(this, arguments);
      }

      return pbkdf2;
    }()
  }]);

  return SFCryptoJS;
}(SFAbstractCrypto);

;var globalScope = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : null;

var subtleCrypto = globalScope.crypto ? globalScope.crypto.subtle : null;

var SFCryptoWeb = exports.SFCryptoWeb = function (_SFAbstractCrypto2) {
  _inherits(SFCryptoWeb, _SFAbstractCrypto2);

  function SFCryptoWeb() {
    _classCallCheck(this, SFCryptoWeb);

    return _possibleConstructorReturn(this, (SFCryptoWeb.__proto__ || Object.getPrototypeOf(SFCryptoWeb)).apply(this, arguments));
  }

  _createClass(SFCryptoWeb, [{
    key: "pbkdf2",


    /**
    Public
    */

    value: function () {
      var _ref120 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee114(password, pw_salt, pw_cost, length) {
        var key;
        return regeneratorRuntime.wrap(function _callee114$(_context114) {
          while (1) {
            switch (_context114.prev = _context114.next) {
              case 0:
                _context114.next = 2;
                return this.webCryptoImportKey(password, "PBKDF2", ["deriveBits"]);

              case 2:
                key = _context114.sent;

                if (key) {
                  _context114.next = 6;
                  break;
                }

                console.log("Key is null, unable to continue");
                return _context114.abrupt("return", null);

              case 6:
                return _context114.abrupt("return", this.webCryptoDeriveBits(key, pw_salt, pw_cost, length));

              case 7:
              case "end":
                return _context114.stop();
            }
          }
        }, _callee114, this);
      }));

      function pbkdf2(_x147, _x148, _x149, _x150) {
        return _ref120.apply(this, arguments);
      }

      return pbkdf2;
    }()
  }, {
    key: "generateRandomKey",
    value: function () {
      var _ref121 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee116(bits) {
        var _this30 = this;

        var extractable;
        return regeneratorRuntime.wrap(function _callee116$(_context116) {
          while (1) {
            switch (_context116.prev = _context116.next) {
              case 0:
                extractable = true;
                return _context116.abrupt("return", subtleCrypto.generateKey({ name: "AES-CBC", length: bits }, extractable, ["encrypt", "decrypt"]).then(function (keyObject) {
                  return subtleCrypto.exportKey("raw", keyObject).then(function () {
                    var _ref122 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee115(keyData) {
                      var key;
                      return regeneratorRuntime.wrap(function _callee115$(_context115) {
                        while (1) {
                          switch (_context115.prev = _context115.next) {
                            case 0:
                              _context115.next = 2;
                              return _this30.arrayBufferToHexString(new Uint8Array(keyData));

                            case 2:
                              key = _context115.sent;
                              return _context115.abrupt("return", key);

                            case 4:
                            case "end":
                              return _context115.stop();
                          }
                        }
                      }, _callee115, _this30);
                    }));

                    return function (_x152) {
                      return _ref122.apply(this, arguments);
                    };
                  }()).catch(function (err) {
                    console.error("Error exporting key", err);
                  });
                }).catch(function (err) {
                  console.error("Error generating key", err);
                }));

              case 2:
              case "end":
                return _context116.stop();
            }
          }
        }, _callee116, this);
      }));

      function generateRandomKey(_x151) {
        return _ref121.apply(this, arguments);
      }

      return generateRandomKey;
    }()
  }, {
    key: "generateItemEncryptionKey",
    value: function () {
      var _ref123 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee117() {
        var length;
        return regeneratorRuntime.wrap(function _callee117$(_context117) {
          while (1) {
            switch (_context117.prev = _context117.next) {
              case 0:
                // Generates a key that will be split in half, each being 256 bits. So total length will need to be 512.
                length = 256;
                return _context117.abrupt("return", Promise.all([this.generateRandomKey(length), this.generateRandomKey(length)]).then(function (values) {
                  return values.join("");
                }));

              case 2:
              case "end":
                return _context117.stop();
            }
          }
        }, _callee117, this);
      }));

      function generateItemEncryptionKey() {
        return _ref123.apply(this, arguments);
      }

      return generateItemEncryptionKey;
    }()

    /* This is a functioning implementation of WebCrypto's encrypt, however, in basic testing, CrpytoJS performs about 30-40% faster, surprisingly. */

  }, {
    key: "encryptText",
    value: function () {
      var _ref124 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee119(text, key, iv) {
        var _this31 = this;

        var ivData, alg, keyBuffer, keyData, textData;
        return regeneratorRuntime.wrap(function _callee119$(_context119) {
          while (1) {
            switch (_context119.prev = _context119.next) {
              case 0:
                if (!iv) {
                  _context119.next = 6;
                  break;
                }

                _context119.next = 3;
                return this.hexStringToArrayBuffer(iv);

              case 3:
                _context119.t0 = _context119.sent;
                _context119.next = 7;
                break;

              case 6:
                _context119.t0 = new ArrayBuffer(16);

              case 7:
                ivData = _context119.t0;
                alg = { name: 'AES-CBC', iv: ivData };
                _context119.next = 11;
                return this.hexStringToArrayBuffer(key);

              case 11:
                keyBuffer = _context119.sent;
                _context119.next = 14;
                return this.webCryptoImportKey(keyBuffer, alg.name, ["encrypt"]);

              case 14:
                keyData = _context119.sent;
                _context119.next = 17;
                return this.stringToArrayBuffer(text);

              case 17:
                textData = _context119.sent;
                return _context119.abrupt("return", crypto.subtle.encrypt(alg, keyData, textData).then(function () {
                  var _ref125 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee118(result) {
                    var cipher;
                    return regeneratorRuntime.wrap(function _callee118$(_context118) {
                      while (1) {
                        switch (_context118.prev = _context118.next) {
                          case 0:
                            _context118.next = 2;
                            return _this31.arrayBufferToBase64(result);

                          case 2:
                            cipher = _context118.sent;
                            return _context118.abrupt("return", cipher);

                          case 4:
                          case "end":
                            return _context118.stop();
                        }
                      }
                    }, _callee118, _this31);
                  }));

                  return function (_x156) {
                    return _ref125.apply(this, arguments);
                  };
                }()));

              case 19:
              case "end":
                return _context119.stop();
            }
          }
        }, _callee119, this);
      }));

      function encryptText(_x153, _x154, _x155) {
        return _ref124.apply(this, arguments);
      }

      return encryptText;
    }()
  }, {
    key: "decryptText",
    value: function () {
      var _ref126 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee121() {
        var _this32 = this;

        var _ref127 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            ciphertextToAuth = _ref127.ciphertextToAuth,
            contentCiphertext = _ref127.contentCiphertext,
            encryptionKey = _ref127.encryptionKey,
            iv = _ref127.iv,
            authHash = _ref127.authHash,
            authKey = _ref127.authKey;

        var requiresAuth = arguments[1];
        var localAuthHash, ivData, alg, keyBuffer, keyData, textData;
        return regeneratorRuntime.wrap(function _callee121$(_context121) {
          while (1) {
            switch (_context121.prev = _context121.next) {
              case 0:
                if (!(requiresAuth && !authHash)) {
                  _context121.next = 3;
                  break;
                }

                console.error("Auth hash is required.");
                return _context121.abrupt("return");

              case 3:
                if (!authHash) {
                  _context121.next = 10;
                  break;
                }

                _context121.next = 6;
                return this.hmac256(ciphertextToAuth, authKey);

              case 6:
                localAuthHash = _context121.sent;

                if (!(authHash !== localAuthHash)) {
                  _context121.next = 10;
                  break;
                }

                console.error("Auth hash does not match, returning null. " + authHash + " != " + localAuthHash);
                return _context121.abrupt("return", null);

              case 10:
                if (!iv) {
                  _context121.next = 16;
                  break;
                }

                _context121.next = 13;
                return this.hexStringToArrayBuffer(iv);

              case 13:
                _context121.t0 = _context121.sent;
                _context121.next = 17;
                break;

              case 16:
                _context121.t0 = new ArrayBuffer(16);

              case 17:
                ivData = _context121.t0;
                alg = { name: 'AES-CBC', iv: ivData };
                _context121.next = 21;
                return this.hexStringToArrayBuffer(encryptionKey);

              case 21:
                keyBuffer = _context121.sent;
                _context121.next = 24;
                return this.webCryptoImportKey(keyBuffer, alg.name, ["decrypt"]);

              case 24:
                keyData = _context121.sent;
                _context121.next = 27;
                return this.base64ToArrayBuffer(contentCiphertext);

              case 27:
                textData = _context121.sent;
                return _context121.abrupt("return", crypto.subtle.decrypt(alg, keyData, textData).then(function () {
                  var _ref128 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee120(result) {
                    var decoded;
                    return regeneratorRuntime.wrap(function _callee120$(_context120) {
                      while (1) {
                        switch (_context120.prev = _context120.next) {
                          case 0:
                            _context120.next = 2;
                            return _this32.arrayBufferToString(result);

                          case 2:
                            decoded = _context120.sent;
                            return _context120.abrupt("return", decoded);

                          case 4:
                          case "end":
                            return _context120.stop();
                        }
                      }
                    }, _callee120, _this32);
                  }));

                  return function (_x158) {
                    return _ref128.apply(this, arguments);
                  };
                }()).catch(function (error) {
                  console.error("Error decrypting:", error);
                }));

              case 29:
              case "end":
                return _context121.stop();
            }
          }
        }, _callee121, this);
      }));

      function decryptText() {
        return _ref126.apply(this, arguments);
      }

      return decryptText;
    }()

    /**
    Internal
    */

  }, {
    key: "webCryptoImportKey",
    value: function () {
      var _ref129 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee122(input, alg, actions, hash) {
        var text;
        return regeneratorRuntime.wrap(function _callee122$(_context122) {
          while (1) {
            switch (_context122.prev = _context122.next) {
              case 0:
                if (!(typeof input === "string")) {
                  _context122.next = 6;
                  break;
                }

                _context122.next = 3;
                return this.stringToArrayBuffer(input);

              case 3:
                _context122.t0 = _context122.sent;
                _context122.next = 7;
                break;

              case 6:
                _context122.t0 = input;

              case 7:
                text = _context122.t0;
                return _context122.abrupt("return", subtleCrypto.importKey("raw", text, { name: alg, hash: hash }, false, actions).then(function (key) {
                  return key;
                }).catch(function (err) {
                  console.error(err);
                  return null;
                }));

              case 9:
              case "end":
                return _context122.stop();
            }
          }
        }, _callee122, this);
      }));

      function webCryptoImportKey(_x159, _x160, _x161, _x162) {
        return _ref129.apply(this, arguments);
      }

      return webCryptoImportKey;
    }()
    //

  }, {
    key: "webCryptoDeriveBits",
    value: function () {
      var _ref130 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee124(key, pw_salt, pw_cost, length) {
        var _this33 = this;

        var params;
        return regeneratorRuntime.wrap(function _callee124$(_context124) {
          while (1) {
            switch (_context124.prev = _context124.next) {
              case 0:
                _context124.next = 2;
                return this.stringToArrayBuffer(pw_salt);

              case 2:
                _context124.t0 = _context124.sent;
                _context124.t1 = pw_cost;
                _context124.t2 = { name: "SHA-512" };
                params = {
                  "name": "PBKDF2",
                  salt: _context124.t0,
                  iterations: _context124.t1,
                  hash: _context124.t2
                };
                return _context124.abrupt("return", subtleCrypto.deriveBits(params, key, length).then(function () {
                  var _ref131 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee123(bits) {
                    var key;
                    return regeneratorRuntime.wrap(function _callee123$(_context123) {
                      while (1) {
                        switch (_context123.prev = _context123.next) {
                          case 0:
                            _context123.next = 2;
                            return _this33.arrayBufferToHexString(new Uint8Array(bits));

                          case 2:
                            key = _context123.sent;
                            return _context123.abrupt("return", key);

                          case 4:
                          case "end":
                            return _context123.stop();
                        }
                      }
                    }, _callee123, _this33);
                  }));

                  return function (_x167) {
                    return _ref131.apply(this, arguments);
                  };
                }()).catch(function (err) {
                  console.error(err);
                  return null;
                }));

              case 7:
              case "end":
                return _context124.stop();
            }
          }
        }, _callee124, this);
      }));

      function webCryptoDeriveBits(_x163, _x164, _x165, _x166) {
        return _ref130.apply(this, arguments);
      }

      return webCryptoDeriveBits;
    }()
  }, {
    key: "stringToArrayBuffer",
    value: function () {
      var _ref132 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee125(string) {
        return regeneratorRuntime.wrap(function _callee125$(_context125) {
          while (1) {
            switch (_context125.prev = _context125.next) {
              case 0:
                return _context125.abrupt("return", new Promise(function (resolve, reject) {
                  var blob = new Blob([string]);
                  var f = new FileReader();
                  f.onload = function (e) {
                    resolve(e.target.result);
                  };
                  f.readAsArrayBuffer(blob);
                }));

              case 1:
              case "end":
                return _context125.stop();
            }
          }
        }, _callee125, this);
      }));

      function stringToArrayBuffer(_x168) {
        return _ref132.apply(this, arguments);
      }

      return stringToArrayBuffer;
    }()
  }, {
    key: "arrayBufferToString",
    value: function () {
      var _ref133 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee126(arrayBuffer) {
        return regeneratorRuntime.wrap(function _callee126$(_context126) {
          while (1) {
            switch (_context126.prev = _context126.next) {
              case 0:
                return _context126.abrupt("return", new Promise(function (resolve, reject) {
                  var blob = new Blob([arrayBuffer]);
                  var f = new FileReader();
                  f.onload = function (e) {
                    resolve(e.target.result);
                  };
                  f.readAsText(blob);
                }));

              case 1:
              case "end":
                return _context126.stop();
            }
          }
        }, _callee126, this);
      }));

      function arrayBufferToString(_x169) {
        return _ref133.apply(this, arguments);
      }

      return arrayBufferToString;
    }()
  }, {
    key: "arrayBufferToHexString",
    value: function () {
      var _ref134 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee127(arrayBuffer) {
        var byteArray, hexString, nextHexByte, i;
        return regeneratorRuntime.wrap(function _callee127$(_context127) {
          while (1) {
            switch (_context127.prev = _context127.next) {
              case 0:
                byteArray = new Uint8Array(arrayBuffer);
                hexString = "";


                for (i = 0; i < byteArray.byteLength; i++) {
                  nextHexByte = byteArray[i].toString(16);
                  if (nextHexByte.length < 2) {
                    nextHexByte = "0" + nextHexByte;
                  }
                  hexString += nextHexByte;
                }
                return _context127.abrupt("return", hexString);

              case 4:
              case "end":
                return _context127.stop();
            }
          }
        }, _callee127, this);
      }));

      function arrayBufferToHexString(_x170) {
        return _ref134.apply(this, arguments);
      }

      return arrayBufferToHexString;
    }()
  }, {
    key: "hexStringToArrayBuffer",
    value: function () {
      var _ref135 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee128(hex) {
        var bytes, c;
        return regeneratorRuntime.wrap(function _callee128$(_context128) {
          while (1) {
            switch (_context128.prev = _context128.next) {
              case 0:
                for (bytes = [], c = 0; c < hex.length; c += 2) {
                  bytes.push(parseInt(hex.substr(c, 2), 16));
                }return _context128.abrupt("return", new Uint8Array(bytes));

              case 2:
              case "end":
                return _context128.stop();
            }
          }
        }, _callee128, this);
      }));

      function hexStringToArrayBuffer(_x171) {
        return _ref135.apply(this, arguments);
      }

      return hexStringToArrayBuffer;
    }()
  }, {
    key: "base64ToArrayBuffer",
    value: function () {
      var _ref136 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee129(base64) {
        var binary_string, len, bytes, i;
        return regeneratorRuntime.wrap(function _callee129$(_context129) {
          while (1) {
            switch (_context129.prev = _context129.next) {
              case 0:
                _context129.next = 2;
                return this.base64Decode(base64);

              case 2:
                binary_string = _context129.sent;
                len = binary_string.length;
                bytes = new Uint8Array(len);

                for (i = 0; i < len; i++) {
                  bytes[i] = binary_string.charCodeAt(i);
                }
                return _context129.abrupt("return", bytes.buffer);

              case 7:
              case "end":
                return _context129.stop();
            }
          }
        }, _callee129, this);
      }));

      function base64ToArrayBuffer(_x172) {
        return _ref136.apply(this, arguments);
      }

      return base64ToArrayBuffer;
    }()
  }, {
    key: "arrayBufferToBase64",
    value: function () {
      var _ref137 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee130(buffer) {
        return regeneratorRuntime.wrap(function _callee130$(_context130) {
          while (1) {
            switch (_context130.prev = _context130.next) {
              case 0:
                return _context130.abrupt("return", new Promise(function (resolve, reject) {
                  var blob = new Blob([buffer], { type: 'application/octet-binary' });
                  var reader = new FileReader();
                  reader.onload = function (evt) {
                    var dataurl = evt.target.result;
                    resolve(dataurl.substr(dataurl.indexOf(',') + 1));
                  };
                  reader.readAsDataURL(blob);
                }));

              case 1:
              case "end":
                return _context130.stop();
            }
          }
        }, _callee130, this);
      }));

      function arrayBufferToBase64(_x173) {
        return _ref137.apply(this, arguments);
      }

      return arrayBufferToBase64;
    }()
  }, {
    key: "hmac256",
    value: function () {
      var _ref138 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee132(message, key) {
        var _this34 = this;

        var keyHexData, keyData, messageData;
        return regeneratorRuntime.wrap(function _callee132$(_context132) {
          while (1) {
            switch (_context132.prev = _context132.next) {
              case 0:
                _context132.next = 2;
                return this.hexStringToArrayBuffer(key);

              case 2:
                keyHexData = _context132.sent;
                _context132.next = 5;
                return this.webCryptoImportKey(keyHexData, "HMAC", ["sign"], { name: "SHA-256" });

              case 5:
                keyData = _context132.sent;
                _context132.next = 8;
                return this.stringToArrayBuffer(message);

              case 8:
                messageData = _context132.sent;
                return _context132.abrupt("return", crypto.subtle.sign({ name: "HMAC" }, keyData, messageData).then(function () {
                  var _ref139 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee131(signature) {
                    var hash;
                    return regeneratorRuntime.wrap(function _callee131$(_context131) {
                      while (1) {
                        switch (_context131.prev = _context131.next) {
                          case 0:
                            _context131.next = 2;
                            return _this34.arrayBufferToHexString(signature);

                          case 2:
                            hash = _context131.sent;
                            return _context131.abrupt("return", hash);

                          case 4:
                          case "end":
                            return _context131.stop();
                        }
                      }
                    }, _callee131, _this34);
                  }));

                  return function (_x176) {
                    return _ref139.apply(this, arguments);
                  };
                }()).catch(function (err) {
                  console.error("Error computing hmac");
                }));

              case 10:
              case "end":
                return _context132.stop();
            }
          }
        }, _callee132, this);
      }));

      function hmac256(_x174, _x175) {
        return _ref138.apply(this, arguments);
      }

      return hmac256;
    }()
  }]);

  return SFCryptoWeb;
}(SFAbstractCrypto);

;
var SFItemTransformer = exports.SFItemTransformer = function () {
  function SFItemTransformer(crypto) {
    _classCallCheck(this, SFItemTransformer);

    this.crypto = crypto;
  }

  _createClass(SFItemTransformer, [{
    key: "_private_encryptString",
    value: function () {
      var _ref140 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee133(string, encryptionKey, authKey, uuid, auth_params) {
        var fullCiphertext, contentCiphertext, iv, ciphertextToAuth, authHash, authParamsString;
        return regeneratorRuntime.wrap(function _callee133$(_context133) {
          while (1) {
            switch (_context133.prev = _context133.next) {
              case 0:
                if (!(auth_params.version === "001")) {
                  _context133.next = 7;
                  break;
                }

                _context133.next = 3;
                return this.crypto.encryptText(string, encryptionKey, null);

              case 3:
                contentCiphertext = _context133.sent;

                fullCiphertext = auth_params.version + contentCiphertext;
                _context133.next = 21;
                break;

              case 7:
                _context133.next = 9;
                return this.crypto.generateRandomKey(128);

              case 9:
                iv = _context133.sent;
                _context133.next = 12;
                return this.crypto.encryptText(string, encryptionKey, iv);

              case 12:
                contentCiphertext = _context133.sent;
                ciphertextToAuth = [auth_params.version, uuid, iv, contentCiphertext].join(":");
                _context133.next = 16;
                return this.crypto.hmac256(ciphertextToAuth, authKey);

              case 16:
                authHash = _context133.sent;
                _context133.next = 19;
                return this.crypto.base64(JSON.stringify(auth_params));

              case 19:
                authParamsString = _context133.sent;

                fullCiphertext = [auth_params.version, authHash, uuid, iv, contentCiphertext, authParamsString].join(":");

              case 21:
                return _context133.abrupt("return", fullCiphertext);

              case 22:
              case "end":
                return _context133.stop();
            }
          }
        }, _callee133, this);
      }));

      function _private_encryptString(_x177, _x178, _x179, _x180, _x181) {
        return _ref140.apply(this, arguments);
      }

      return _private_encryptString;
    }()
  }, {
    key: "encryptItem",
    value: function () {
      var _ref141 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee134(item, keys, auth_params) {
        var params, item_key, ek, ak, ciphertext, authHash;
        return regeneratorRuntime.wrap(function _callee134$(_context134) {
          while (1) {
            switch (_context134.prev = _context134.next) {
              case 0:
                params = {};
                // encrypt item key

                _context134.next = 3;
                return this.crypto.generateItemEncryptionKey();

              case 3:
                item_key = _context134.sent;

                if (!(auth_params.version === "001")) {
                  _context134.next = 10;
                  break;
                }

                _context134.next = 7;
                return this.crypto.encryptText(item_key, keys.mk, null);

              case 7:
                params.enc_item_key = _context134.sent;
                _context134.next = 13;
                break;

              case 10:
                _context134.next = 12;
                return this._private_encryptString(item_key, keys.mk, keys.ak, item.uuid, auth_params);

              case 12:
                params.enc_item_key = _context134.sent;

              case 13:
                _context134.next = 15;
                return this.crypto.firstHalfOfKey(item_key);

              case 15:
                ek = _context134.sent;
                _context134.next = 18;
                return this.crypto.secondHalfOfKey(item_key);

              case 18:
                ak = _context134.sent;
                _context134.next = 21;
                return this._private_encryptString(JSON.stringify(item.createContentJSONFromProperties()), ek, ak, item.uuid, auth_params);

              case 21:
                ciphertext = _context134.sent;

                if (!(auth_params.version === "001")) {
                  _context134.next = 27;
                  break;
                }

                _context134.next = 25;
                return this.crypto.hmac256(ciphertext, ak);

              case 25:
                authHash = _context134.sent;

                params.auth_hash = authHash;

              case 27:

                params.content = ciphertext;
                return _context134.abrupt("return", params);

              case 29:
              case "end":
                return _context134.stop();
            }
          }
        }, _callee134, this);
      }));

      function encryptItem(_x182, _x183, _x184) {
        return _ref141.apply(this, arguments);
      }

      return encryptItem;
    }()
  }, {
    key: "encryptionComponentsFromString",
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
          authParams: components[5],
          ciphertextToAuth: [components[0], components[2], components[3], components[4]].join(":"),
          encryptionKey: encryptionKey,
          authKey: authKey
        };
      }
    }
  }, {
    key: "decryptItem",
    value: function () {
      var _ref142 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee135(item, keys) {
        var encryptedItemKey, requiresAuth, keyParams, item_key, ek, ak, itemParams, content;
        return regeneratorRuntime.wrap(function _callee135$(_context135) {
          while (1) {
            switch (_context135.prev = _context135.next) {
              case 0:
                if (!(typeof item.content != "string")) {
                  _context135.next = 2;
                  break;
                }

                return _context135.abrupt("return");

              case 2:
                if (!item.content.startsWith("000")) {
                  _context135.next = 14;
                  break;
                }

                _context135.prev = 3;
                _context135.t0 = JSON;
                _context135.next = 7;
                return this.crypto.base64Decode(item.content.substring(3, item.content.length));

              case 7:
                _context135.t1 = _context135.sent;
                item.content = _context135.t0.parse.call(_context135.t0, _context135.t1);
                _context135.next = 13;
                break;

              case 11:
                _context135.prev = 11;
                _context135.t2 = _context135["catch"](3);

              case 13:
                return _context135.abrupt("return");

              case 14:
                if (item.enc_item_key) {
                  _context135.next = 17;
                  break;
                }

                // This needs to be here to continue, return otherwise
                console.log("Missing item encryption key, skipping decryption.");
                return _context135.abrupt("return");

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
                  _context135.next = 26;
                  break;
                }

                console.error("Item key params UUID does not match item UUID");
                if (!item.errorDecrypting) {
                  item.errorDecryptingValueChanged = true;
                }
                item.errorDecrypting = true;
                return _context135.abrupt("return");

              case 26:
                _context135.next = 28;
                return this.crypto.decryptText(keyParams, requiresAuth);

              case 28:
                item_key = _context135.sent;

                if (item_key) {
                  _context135.next = 34;
                  break;
                }

                console.log("Error decrypting item", item);
                if (!item.errorDecrypting) {
                  item.errorDecryptingValueChanged = true;
                }
                item.errorDecrypting = true;
                return _context135.abrupt("return");

              case 34:
                _context135.next = 36;
                return this.crypto.firstHalfOfKey(item_key);

              case 36:
                ek = _context135.sent;
                _context135.next = 39;
                return this.crypto.secondHalfOfKey(item_key);

              case 39:
                ak = _context135.sent;
                itemParams = this.encryptionComponentsFromString(item.content, ek, ak);
                _context135.prev = 41;
                _context135.t3 = JSON;
                _context135.next = 45;
                return this.crypto.base64Decode(itemParams.authParams);

              case 45:
                _context135.t4 = _context135.sent;
                item.auth_params = _context135.t3.parse.call(_context135.t3, _context135.t4);
                _context135.next = 51;
                break;

              case 49:
                _context135.prev = 49;
                _context135.t5 = _context135["catch"](41);

              case 51:
                if (!(itemParams.uuid && itemParams.uuid !== item.uuid)) {
                  _context135.next = 55;
                  break;
                }

                if (!item.errorDecrypting) {
                  item.errorDecryptingValueChanged = true;
                }
                item.errorDecrypting = true;
                return _context135.abrupt("return");

              case 55:

                if (!itemParams.authHash) {
                  // legacy 001
                  itemParams.authHash = item.auth_hash;
                }

                _context135.next = 58;
                return this.crypto.decryptText(itemParams, true);

              case 58:
                content = _context135.sent;

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

              case 60:
              case "end":
                return _context135.stop();
            }
          }
        }, _callee135, this, [[3, 11], [41, 49]]);
      }));

      function decryptItem(_x185, _x186) {
        return _ref142.apply(this, arguments);
      }

      return decryptItem;
    }()
  }, {
    key: "decryptMultipleItems",
    value: function () {
      var _ref143 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee137(items, keys, throws) {
        var _this35 = this;

        var decrypt;
        return regeneratorRuntime.wrap(function _callee137$(_context137) {
          while (1) {
            switch (_context137.prev = _context137.next) {
              case 0:
                decrypt = function () {
                  var _ref144 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee136(item) {
                    var isString;
                    return regeneratorRuntime.wrap(function _callee136$(_context136) {
                      while (1) {
                        switch (_context136.prev = _context136.next) {
                          case 0:
                            if (item) {
                              _context136.next = 2;
                              break;
                            }

                            return _context136.abrupt("return");

                          case 2:
                            if (!(item.deleted == true && item.content == null)) {
                              _context136.next = 4;
                              break;
                            }

                            return _context136.abrupt("return");

                          case 4:
                            isString = typeof item.content === 'string' || item.content instanceof String;

                            if (!isString) {
                              _context136.next = 19;
                              break;
                            }

                            _context136.prev = 6;
                            _context136.next = 9;
                            return _this35.decryptItem(item, keys);

                          case 9:
                            _context136.next = 19;
                            break;

                          case 11:
                            _context136.prev = 11;
                            _context136.t0 = _context136["catch"](6);

                            if (!item.errorDecrypting) {
                              item.errorDecryptingValueChanged = true;
                            }
                            item.errorDecrypting = true;

                            if (!throws) {
                              _context136.next = 17;
                              break;
                            }

                            throw _context136.t0;

                          case 17:
                            console.error("Error decrypting item", item, _context136.t0);
                            return _context136.abrupt("return");

                          case 19:
                          case "end":
                            return _context136.stop();
                        }
                      }
                    }, _callee136, _this35, [[6, 11]]);
                  }));

                  return function decrypt(_x190) {
                    return _ref144.apply(this, arguments);
                  };
                }();

                return _context137.abrupt("return", Promise.all(items.map(function (item) {
                  return decrypt(item);
                })));

              case 2:
              case "end":
                return _context137.stop();
            }
          }
        }, _callee137, this);
      }));

      function decryptMultipleItems(_x187, _x188, _x189) {
        return _ref143.apply(this, arguments);
      }

      return decryptMultipleItems;
    }()
  }]);

  return SFItemTransformer;
}();

;var globalScope = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : null;

var StandardFile = exports.StandardFile = function () {
  function StandardFile(cryptoInstance) {
    _classCallCheck(this, StandardFile);

    // This library runs in native environments as well (react native)
    if (globalScope) {
      // detect IE8 and above, and edge.
      // IE and Edge do not support pbkdf2 in WebCrypto, therefore we need to use CryptoJS
      var IEOrEdge = typeof document !== 'undefined' && document.documentMode || /Edge/.test(navigator.userAgent);

      if (!IEOrEdge && globalScope.crypto && globalScope.crypto.subtle) {
        this.crypto = new SFCryptoWeb();
      } else {
        this.crypto = new SFCryptoJS();
      }
    }

    // This must be placed outside window check, as it's used in native.
    if (cryptoInstance) {
      this.crypto = cryptoInstance;
    }

    this.itemTransformer = new SFItemTransformer(this.crypto);

    this.crypto.SFJS = {
      version: this.version(),
      defaultPasswordGenerationCost: this.defaultPasswordGenerationCost()
    };
  }

  _createClass(StandardFile, [{
    key: "version",
    value: function version() {
      return "003";
    }
  }, {
    key: "supportsPasswordDerivationCost",
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
    key: "supportedVersions",
    value: function supportedVersions() {
      return ["001", "002", "003"];
    }
  }, {
    key: "isVersionNewerThanLibraryVersion",
    value: function isVersionNewerThanLibraryVersion(version) {
      var libraryVersion = this.version();
      return parseInt(version) > parseInt(libraryVersion);
    }
  }, {
    key: "isProtocolVersionOutdated",
    value: function isProtocolVersionOutdated(version) {
      // YYYY-MM-DD
      var expirationDates = {
        "001": Date.parse("2018-01-01"),
        "002": Date.parse("2020-01-01")
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
    key: "costMinimumForVersion",
    value: function costMinimumForVersion(version) {
      return {
        "001": 3000,
        "002": 3000,
        "003": 110000
      }[version];
    }
  }, {
    key: "defaultPasswordGenerationCost",
    value: function defaultPasswordGenerationCost() {
      return this.costMinimumForVersion(this.version());
    }
  }]);

  return StandardFile;
}();

if (globalScope) {
  // window is for some reason defined in React Native, but throws an exception when you try to set to it
  try {
    globalScope.StandardFile = StandardFile;
    globalScope.SFJS = new StandardFile();
    globalScope.SFCryptoWeb = SFCryptoWeb;
    globalScope.SFCryptoJS = SFCryptoJS;
    globalScope.SFItemTransformer = SFItemTransformer;
    globalScope.SFModelManager = SFModelManager;
    globalScope.SFItem = SFItem;
    globalScope.SFItemParams = SFItemParams;
    globalScope.SFHttpManager = SFHttpManager;
    globalScope.SFStorageManager = SFStorageManager;
    globalScope.SFSyncManager = SFSyncManager;
    globalScope.SFAuthManager = SFAuthManager;
    globalScope.SFMigrationManager = SFMigrationManager;
    globalScope.SFAlertManager = SFAlertManager;
    globalScope.SFPredicate = SFPredicate;
    globalScope.SFHistorySession = SFHistorySession;
    globalScope.SFSessionHistoryManager = SFSessionHistoryManager;
    globalScope.SFItemHistory = SFItemHistory;
    globalScope.SFItemHistoryEntry = SFItemHistoryEntry;
    globalScope.SFPrivilegesManager = SFPrivilegesManager;
    globalScope.SFPrivileges = SFPrivileges;
    globalScope.SFSingletonManager = SFSingletonManager;
  } catch (e) {
    console.log("Exception while exporting window variables", e);
  }
}
//# sourceMappingURL=transpiled.js.map
