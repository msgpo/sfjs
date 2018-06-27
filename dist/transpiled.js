'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SFHttpManager = function () {
  function SFHttpManager(storageManager, timeout) {
    _classCallCheck(this, SFHttpManager);

    // calling callbacks in a $timeout allows UI to update
    this.$timeout = timeout || setTimeout;
    this.storageManager = storageManager;
  }

  _createClass(SFHttpManager, [{
    key: 'setAuthHeadersForRequest',
    value: function setAuthHeadersForRequest(request) {
      var token = this.storageManager.getItem("jwt");
      if (token) {
        request.setRequestHeader('Authorization', 'Bearer ' + token);
      }
    }
  }, {
    key: 'postAbsolute',
    value: function postAbsolute(url, params, onsuccess, onerror) {
      this.httpRequest("post", url, params, onsuccess, onerror);
    }
  }, {
    key: 'patchAbsolute',
    value: function patchAbsolute(url, params, onsuccess, onerror) {
      this.httpRequest("patch", url, params, onsuccess, onerror);
    }
  }, {
    key: 'getAbsolute',
    value: function getAbsolute(url, params, onsuccess, onerror) {
      this.httpRequest("get", url, params, onsuccess, onerror);
    }
  }, {
    key: 'httpRequest',
    value: function httpRequest(verb, url, params, onsuccess, onerror) {

      var xmlhttp = new XMLHttpRequest();

      xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
          var response = xmlhttp.responseText;
          if (response) {
            try {
              response = JSON.parse(response);
            } catch (e) {}
          }

          if (xmlhttp.status >= 200 && xmlhttp.status <= 299) {
            this.$timeout(function () {
              onsuccess(response);
            });
          } else {
            console.error("Request error:", response);
            this.$timeout(function () {
              onerror(response, xmlhttp.status);
            });
          }
        }
      }.bind(this);

      if (verb == "get" && Object.keys(params).length > 0) {
        url = url + this.formatParams(params);
      }

      xmlhttp.open(verb, url, true);
      this.setAuthHeadersForRequest(xmlhttp);
      xmlhttp.setRequestHeader('Content-type', 'application/json');

      if (verb == "post" || verb == "patch") {
        xmlhttp.send(JSON.stringify(params));
      } else {
        xmlhttp.send();
      }
    }
  }, {
    key: 'formatParams',
    value: function formatParams(params) {
      return "?" + Object.keys(params).map(function (key) {
        return key + "=" + encodeURIComponent(params[key]);
      }).join("&");
    }
  }]);

  return SFHttpManager;
}();

;
var SFModelManager = exports.SFModelManager = function () {
  function SFModelManager() {
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

    this.itemSyncObservers = [];
    this.itemsPendingRemoval = [];
    this.items = [];
    this.missedReferences = [];
  }

  _createClass(SFModelManager, [{
    key: 'resetLocalMemory',
    value: function resetLocalMemory() {
      this.items.length = 0;
    }
  }, {
    key: 'alternateUUIDForItem',
    value: function alternateUUIDForItem(item, callback) {
      // We need to clone this item and give it a new uuid, then delete item with old uuid from db (you can't modify uuid's in our indexeddb setup)
      var newItem = this.createItem(item);
      newItem.uuid = SFJS.crypto.generateUUIDSync();

      // Update uuids of relationships
      newItem.informReferencesOfUUIDChange(item.uuid, newItem.uuid);
      this.informModelsOfUUIDChangeForItem(newItem, item.uuid, newItem.uuid);

      console.log(item.uuid, "-->", newItem.uuid);

      // Set to deleted, then run through mapping function so that observers can be notified
      item.deleted = true;
      item.content.references = [];
      item.setDirty(true);
      this.mapResponseItemsToLocalModels([item], SFModelManager.MappingSourceLocalSaved);

      // add new item
      this.addItem(newItem);
      newItem.setDirty(true);
      this.markAllReferencesDirtyForItem(newItem);
      callback(newItem);
    }
  }, {
    key: 'informModelsOfUUIDChangeForItem',
    value: function informModelsOfUUIDChangeForItem(newItem, oldUUID, newUUID) {
      // some models that only have one-way relationships might be interested to hear that an item has changed its uuid
      // for example, editors have a one way relationship with notes. When a note changes its UUID, it has no way to inform the editor
      // to update its relationships

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var model = _step.value;

          model.potentialItemOfInterestHasChangedItsUUID(newItem, oldUUID, newUUID);
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
    key: 'allItemsMatchingTypes',
    value: function allItemsMatchingTypes(contentTypes) {
      return this.allItems.filter(function (item) {
        return (_.includes(contentTypes, item.content_type) || _.includes(contentTypes, "*")) && !item.dummy;
      });
    }
  }, {
    key: 'validItemsForContentType',
    value: function validItemsForContentType(contentType) {
      return this.allItems.filter(function (item) {
        return item.content_type == contentType && !item.errorDecrypting;
      });
    }
  }, {
    key: 'findItem',
    value: function findItem(itemId) {
      return _.find(this.items, { uuid: itemId });
    }
  }, {
    key: 'findItems',
    value: function findItems(ids) {
      return this.items.filter(function (item) {
        return ids.includes(item.uuid);
      });
    }
  }, {
    key: 'didSyncModelsOffline',
    value: function didSyncModelsOffline(items) {
      this.notifySyncObserversOfModels(items, SFModelManager.MappingSourceLocalSaved);
    }
  }, {
    key: 'mapResponseItemsToLocalModels',
    value: function mapResponseItemsToLocalModels(items, source, sourceKey) {
      return this.mapResponseItemsToLocalModelsOmittingFields(items, null, source, sourceKey);
    }
  }, {
    key: 'mapResponseItemsToLocalModelsOmittingFields',
    value: function mapResponseItemsToLocalModelsOmittingFields(items, omitFields, source, sourceKey) {
      var models = [],
          processedObjects = [],
          modelsToNotifyObserversOf = [];

      // first loop should add and process items
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = items[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var json_obj = _step2.value;

          if ((!json_obj.content_type || !json_obj.content) && !json_obj.deleted && !json_obj.errorDecrypting) {
            // An item that is not deleted should never have empty content
            console.error("Server response item is corrupt:", json_obj);
            continue;
          }

          // Lodash's _.omit, which was previously used, seems to cause unexpected behavior
          // when json_obj is an ES6 item class. So we instead manually omit each key.
          if (Array.isArray(omitFields)) {
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
              for (var _iterator4 = omitFields[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var key = _step4.value;

                delete json_obj[key];
              }
            } catch (err) {
              _didIteratorError4 = true;
              _iteratorError4 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                  _iterator4.return();
                }
              } finally {
                if (_didIteratorError4) {
                  throw _iteratorError4;
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

        // // second loop should process references
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

      for (var index in processedObjects) {
        var json_obj = processedObjects[index];
        if (json_obj.content) {
          this.resolveReferencesForItem(models[index]);
        }
        var missedRefs = this.missedReferences.filter(function (r) {
          return r.reference_uuid == json_obj.uuid;
        });
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = missedRefs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var ref = _step3.value;

            this.resolveReferencesForItem(ref.for_item);
          }
          // remove handled refs
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        this.missedReferences = this.missedReferences.filter(function (r) {
          return r.reference_uuid != json_obj.uuid;
        });
      }

      this.notifySyncObserversOfModels(modelsToNotifyObserversOf, source, sourceKey);

      return models;
    }

    /* Note that this function is public, and can also be called manually (desktopManager uses it) */

  }, {
    key: 'notifySyncObserversOfModels',
    value: function notifySyncObserversOfModels(models, source, sourceKey) {
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = this.itemSyncObservers[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var observer = _step5.value;

          var allRelevantItems = observer.type == "*" ? models : models.filter(function (item) {
            return item.content_type == observer.type;
          });
          var validItems = [],
              deletedItems = [];
          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = allRelevantItems[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var item = _step6.value;

              if (item.deleted) {
                deletedItems.push(item);
              } else {
                validItems.push(item);
              }
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

          if (allRelevantItems.length > 0) {
            observer.callback(allRelevantItems, validItems, deletedItems, source, sourceKey);
          }
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }
    }
  }, {
    key: 'createItem',
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
    key: 'createDuplicateItem',
    value: function createDuplicateItem(itemResponse) {
      var dup = this.createItem(itemResponse, true);
      this.resolveReferencesForItem(dup);
      return dup;
    }
  }, {
    key: 'addItem',
    value: function addItem(item) {
      var globalOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      this.addItems([item], globalOnly);
    }
  }, {
    key: 'addItems',
    value: function addItems(items) {
      var _this = this;

      var globalOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      items.forEach(function (item) {
        if (!_.find(_this.items, { uuid: item.uuid })) {
          _this.items.push(item);
        }
      });
    }
  }, {
    key: 'resolveReferencesForItem',
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

      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = references[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var reference = _step7.value;

          var referencedItem = this.findItem(reference.uuid);
          if (referencedItem) {
            item.addItemAsRelationship(referencedItem);
            if (markReferencesDirty) {
              referencedItem.setDirty(true);
            }
          } else {
            // Allows mapper to check when missing reference makes it through the loop,
            // and then runs resolveReferencesForItem again for the original item.
            var missedRef = { reference_uuid: reference.uuid, for_item: item };
            if (!_.find(this.missedReferences, missedRef)) {
              this.missedReferences.push(missedRef);
            }
          }
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }
    }

    /* Notifies observers when an item has been synced or mapped from a remote response */

  }, {
    key: 'addItemSyncObserver',
    value: function addItemSyncObserver(id, type, callback) {
      this.itemSyncObservers.push({ id: id, type: type, callback: callback });
    }
  }, {
    key: 'removeItemSyncObserver',
    value: function removeItemSyncObserver(id) {
      _.remove(this.itemSyncObservers, _.find(this.itemSyncObservers, { id: id }));
    }
  }, {
    key: 'getDirtyItems',
    value: function getDirtyItems() {
      return this.items.filter(function (item) {
        // An item that has an error decrypting can be synced only if it is being deleted.
        // Otherwise, we don't want to send corrupt content up to the server.
        return item.dirty == true && !item.dummy && (!item.errorDecrypting || item.deleted);
      });
    }
  }, {
    key: 'clearDirtyItems',
    value: function clearDirtyItems(items) {
      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = items[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var item = _step8.value;

          item.setDirty(false);
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
    key: 'clearAllDirtyItems',
    value: function clearAllDirtyItems() {
      this.clearDirtyItems(this.getDirtyItems());
    }
  }, {
    key: 'setItemToBeDeleted',
    value: function setItemToBeDeleted(item) {
      item.deleted = true;
      if (!item.dummy) {
        item.setDirty(true);
      }

      this.removeAndDirtyAllRelationshipsForItem(item);
    }
  }, {
    key: 'removeAndDirtyAllRelationshipsForItem',
    value: function removeAndDirtyAllRelationshipsForItem(item) {
      var _iteratorNormalCompletion9 = true;
      var _didIteratorError9 = false;
      var _iteratorError9 = undefined;

      try {
        for (var _iterator9 = item.content.references[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
          var reference = _step9.value;

          var relationship = this.findItem(reference.uuid);
          if (relationship) {
            item.removeItemAsRelationship(relationship);
            if (relationship.hasRelationshipWithItem(item)) {
              relationship.removeItemAsRelationship(item);
              relationship.setDirty(true);
            }
          }
        }
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
    }

    /* Used when changing encryption key */

  }, {
    key: 'setAllItemsDirty',
    value: function setAllItemsDirty() {
      var dontUpdateClientDates = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      var relevantItems = this.allItems;

      var _iteratorNormalCompletion10 = true;
      var _didIteratorError10 = false;
      var _iteratorError10 = undefined;

      try {
        for (var _iterator10 = relevantItems[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
          var item = _step10.value;

          item.setDirty(true, dontUpdateClientDates);
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
    }
  }, {
    key: 'markAllReferencesDirtyForItem',
    value: function markAllReferencesDirtyForItem(item, dontUpdateClientDate) {
      var ids = item.content.references.map(function (r) {
        return r.uuid;
      });
      var referencedObjects = this.findItems(ids);
      referencedObjects.forEach(function (reference) {
        reference.setDirty(true, dontUpdateClientDate);
      });
    }
  }, {
    key: 'removeItemLocally',
    value: function removeItemLocally(item, callback) {
      _.remove(this.items, { uuid: item.uuid });

      item.isBeingRemovedLocally();

      this.itemsPendingRemoval.push(item.uuid);
    }

    /*
    Archives
    */

  }, {
    key: 'getAllItemsJSONData',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(keys, authParams, protocolVersion, returnNullIfEmpty) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt('return', Promise.all(this.allItems.map(function (item) {
                  var itemParams = new SFItemParams(item, keys, protocolVersion);
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
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getAllItemsJSONData(_x5, _x6, _x7, _x8) {
        return _ref.apply(this, arguments);
      }

      return getAllItemsJSONData;
    }()
  }, {
    key: 'allItems',
    get: function get() {
      return this.items.filter(function (item) {
        return !item.dummy;
      });
    }
  }, {
    key: 'extensions',
    get: function get() {
      return this._extensions.filter(function (ext) {
        return !ext.deleted;
      });
    }
  }]);

  return SFModelManager;
}();

; // SFStorageManager should be subclassed, and all the methods below overwritten.

var SFStorageManager = exports.SFStorageManager = function () {
  function SFStorageManager() {
    _classCallCheck(this, SFStorageManager);
  }

  _createClass(SFStorageManager, [{
    key: 'setItem',


    /* Simple Key/Value Storage */

    value: function setItem(key, value, vaultKey) {}
  }, {
    key: 'getItem',
    value: function getItem(key, vault) {}
  }, {
    key: 'removeItem',
    value: function removeItem(key, vault) {}
  }, {
    key: 'clear',
    value: function clear() {}
    // clear only simple key/values


    /*
    Model Storage
    */

  }, {
    key: 'getAllModels',
    value: function getAllModels(callback) {}
  }, {
    key: 'saveModel',
    value: function saveModel(item) {
      this.saveModels([item]);
    }
  }, {
    key: 'saveModels',
    value: function saveModels(items, onsuccess, onerror) {}
  }, {
    key: 'deleteModel',
    value: function deleteModel(item, callback) {}
  }, {
    key: 'clearAllModels',
    value: function clearAllModels(callback) {}
    // clear only models


    /* General */

  }, {
    key: 'clearAllData',
    value: function clearAllData(callback) {
      this.clear();
      this.clearAllModels(callback);
    }
  }]);

  return SFStorageManager;
}();

;
var SFSyncManager = exports.SFSyncManager = function () {
  function SFSyncManager(modelManager, storageManager, httpManager, timeout, interval) {
    _classCallCheck(this, SFSyncManager);

    this.httpManager = httpManager;
    this.modelManager = modelManager;
    this.storageManager = storageManager;

    // Allows you to et your own interval/timeout function (i.e if you're using angular and want to use $timeout)
    this.$interval = interval || setInterval;
    this.$timeout = timeout || setTimeout;

    this.syncStatus = {};
    this.syncStatusObservers = [];
  }

  _createClass(SFSyncManager, [{
    key: 'registerSyncStatusObserver',
    value: function registerSyncStatusObserver(callback) {
      var observer = { key: new Date(), callback: callback };
      this.syncStatusObservers.push(observer);
      return observer;
    }
  }, {
    key: 'removeSyncStatusObserver',
    value: function removeSyncStatusObserver(observer) {
      _.pull(this.syncStatusObservers, observer);
    }
  }, {
    key: 'syncStatusDidChange',
    value: function syncStatusDidChange() {
      var _this2 = this;

      this.syncStatusObservers.forEach(function (observer) {
        observer.callback(_this2.syncStatus);
      });
    }
  }, {
    key: 'setEventHandler',
    value: function setEventHandler(handler) {
      /*
      Possible Events:
      sync:completed
      sync:taking-too-long
      sync:updated_token
      sync:error
      major-data-change
       */
      this.eventHandler = handler;
    }
  }, {
    key: 'notifyEvent',
    value: function notifyEvent(syncEvent, data) {
      this.eventHandler(syncEvent, data);
    }
  }, {
    key: 'setKeyRequestHandler',
    value: function setKeyRequestHandler(handler) {
      this.keyRequestHandler = handler;
    }
  }, {
    key: 'getActiveKeyInfo',
    value: function getActiveKeyInfo() {
      // keyRequestHandler is set externally by using class. It should return an object of this format:
      /*
      {
        keys: {pw, mk, ak}
        version,
        offline: true/false
      }
      */
      return this.keyRequestHandler();
    }
  }, {
    key: 'writeItemsToLocalStorage',
    value: function writeItemsToLocalStorage(items, offlineOnly, callback) {
      var _this3 = this;

      if (items.length == 0) {
        callback && callback();
        return;
      }

      var info = this.getActiveKeyInfo();

      Promise.all(items.map(function () {
        var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(item) {
          var itemParams;
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  itemParams = new SFItemParams(item, info.keys, info.version);
                  _context2.next = 3;
                  return itemParams.paramsForLocalStorage();

                case 3:
                  itemParams = _context2.sent;

                  if (offlineOnly) {
                    delete itemParams.dirty;
                  }
                  return _context2.abrupt('return', itemParams);

                case 6:
                case 'end':
                  return _context2.stop();
              }
            }
          }, _callee2, _this3);
        }));

        return function (_x9) {
          return _ref2.apply(this, arguments);
        };
      }())).then(function (params) {
        _this3.storageManager.saveModels(params, function () {
          // on success
          if (_this3.syncStatus.localError) {
            _this3.syncStatus.localError = null;
            _this3.syncStatusDidChange();
          }
          callback && callback();
        }, function (error) {
          // on error
          _this3.syncStatus.localError = error;
          _this3.syncStatusDidChange();
        });
      });
    }
  }, {
    key: 'loadLocalItems',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(callback) {
        var _this4 = this;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                this.storageManager.getAllModels(function (items) {
                  // break it up into chunks to make interface more responsive for large item counts
                  var total = items.length;
                  var iteration = 50;
                  var current = 0;
                  var processed = [];

                  var completion = function completion() {
                    SFItem.sortItemsByDate(processed);
                    callback(processed);
                  };

                  var decryptNext = function () {
                    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
                      var subitems, processedSubitems;
                      return regeneratorRuntime.wrap(function _callee3$(_context3) {
                        while (1) {
                          switch (_context3.prev = _context3.next) {
                            case 0:
                              subitems = items.slice(current, current + iteration);
                              _context3.next = 3;
                              return _this4.handleItemsResponse(subitems, null, SFModelManager.MappingSourceLocalRetrieved);

                            case 3:
                              processedSubitems = _context3.sent;

                              processed.push(processedSubitems);

                              current += subitems.length;

                              if (current < total) {
                                _this4.$timeout(function () {
                                  decryptNext();
                                });
                              } else {
                                completion();
                              }

                            case 7:
                            case 'end':
                              return _context3.stop();
                          }
                        }
                      }, _callee3, _this4);
                    }));

                    return function decryptNext() {
                      return _ref4.apply(this, arguments);
                    };
                  }();

                  decryptNext();
                });

              case 1:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function loadLocalItems(_x10) {
        return _ref3.apply(this, arguments);
      }

      return loadLocalItems;
    }()
  }, {
    key: 'syncOffline',
    value: function syncOffline(items, callback) {
      var _this5 = this;

      // Update all items updated_at to now
      var _iteratorNormalCompletion11 = true;
      var _didIteratorError11 = false;
      var _iteratorError11 = undefined;

      try {
        for (var _iterator11 = items[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
          var item = _step11.value;

          item.updated_at = new Date();
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

      this.writeItemsToLocalStorage(items, true, function (responseItems) {
        // delete anything needing to be deleted
        var _iteratorNormalCompletion12 = true;
        var _didIteratorError12 = false;
        var _iteratorError12 = undefined;

        try {
          for (var _iterator12 = items[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
            var item = _step12.value;

            if (item.deleted) {
              _this5.modelManager.removeItemLocally(item);
            }
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

        _this5.notifyEvent("sync:completed");

        // Required in order for modelManager to notify sync observers
        _this5.modelManager.didSyncModelsOffline(items);

        if (callback) {
          callback({ success: true });
        }
      });
    }

    /*
      In the case of signing in and merging local data, we alternative UUIDs
      to avoid overwriting data a user may retrieve that has the same UUID.
      Alternating here forces us to to create duplicates of the items instead.
     */

  }, {
    key: 'markAllItemsDirtyAndSaveOffline',
    value: function markAllItemsDirtyAndSaveOffline(callback, alternateUUIDs) {
      var _this6 = this;

      // use a copy, as alternating uuid will affect array
      var originalItems = this.modelManager.allItems.filter(function (item) {
        return !item.errorDecrypting;
      }).slice();

      var block = function block() {
        var allItems = _this6.modelManager.allItems;
        var _iteratorNormalCompletion13 = true;
        var _didIteratorError13 = false;
        var _iteratorError13 = undefined;

        try {
          for (var _iterator13 = allItems[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
            var item = _step13.value;

            item.setDirty(true);
          }
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

        _this6.writeItemsToLocalStorage(allItems, false, callback);
      };

      if (alternateUUIDs) {
        var index = 0;

        var alternateNextItem = function alternateNextItem() {
          if (index >= originalItems.length) {
            // We don't use originalItems as alternating UUID will have deleted them.
            block();
            return;
          }

          var item = originalItems[index];
          index++;

          // alternateUUIDForItem last param is a boolean that controls whether the original item
          // should be removed locally after new item is created. We set this to true, since during sign in,
          // all item ids are alternated, and we only want one final copy of the entire data set.
          // Passing false can be desired sometimes, when for example the app has signed out the user,
          // but for some reason retained their data (This happens in Firefox when using private mode).
          // In this case, we should pass false so that both copies are kept. However, it's difficult to
          // detect when the app has entered this state. We will just use true to remove original items for now.
          _this6.modelManager.alternateUUIDForItem(item, alternateNextItem, true);
        };

        alternateNextItem();
      } else {
        block();
      }
    }
  }, {
    key: 'clearSyncToken',
    value: function clearSyncToken() {
      this.storageManager.removeItem("syncToken");
    }
  }, {
    key: 'clearQueuedCallbacks',
    value: function clearQueuedCallbacks() {
      this._queuedCallbacks = [];
    }
  }, {
    key: 'callQueuedCallbacksAndCurrent',
    value: function callQueuedCallbacksAndCurrent(currentCallback, response) {
      var allCallbacks = this.queuedCallbacks;
      if (currentCallback) {
        allCallbacks.push(currentCallback);
      }
      if (allCallbacks.length) {
        var _iteratorNormalCompletion14 = true;
        var _didIteratorError14 = false;
        var _iteratorError14 = undefined;

        try {
          for (var _iterator14 = allCallbacks[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
            var eachCallback = _step14.value;

            eachCallback(response);
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

        this.clearQueuedCallbacks();
      }
    }
  }, {
    key: 'beginCheckingIfSyncIsTakingTooLong',
    value: function beginCheckingIfSyncIsTakingTooLong() {
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
    key: 'stopCheckingIfSyncIsTakingTooLong',
    value: function stopCheckingIfSyncIsTakingTooLong() {
      this.$interval.cancel(this.syncStatus.checker);
    }
  }, {
    key: 'lockSyncing',
    value: function lockSyncing() {
      this.syncLocked = true;
    }
  }, {
    key: 'unlockSyncing',
    value: function unlockSyncing() {
      this.syncLocked = false;
    }
  }, {
    key: 'sync',
    value: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(callback) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var source = arguments[2];

        var allDirtyItems, info, isContinuationSync, submitLimit, subItems, params, _iteratorNormalCompletion15, _didIteratorError15, _iteratorError15, _iterator15, _step15, item, onSyncCompletion, onSyncSuccess;

        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                if (!this.syncLocked) {
                  _context6.next = 3;
                  break;
                }

                console.log("Sync Locked, Returning;");
                return _context6.abrupt('return');

              case 3:

                if (!options) options = {};

                if (typeof callback == 'string') {
                  // is source string, used to avoid filling parameters on call
                  source = callback;
                  callback = null;
                }

                // console.log("Syncing from", source);

                allDirtyItems = this.modelManager.getDirtyItems();

                // When a user hits the physical refresh button, we want to force refresh, in case
                // the sync engine is stuck in some inProgress loop.

                if (!(this.syncStatus.syncOpInProgress && !options.force)) {
                  _context6.next = 12;
                  break;
                }

                this.repeatOnCompletion = true;
                if (callback) {
                  this.queuedCallbacks.push(callback);
                }

                // write to local storage nonetheless, since some users may see several second delay in server response.
                // if they close the browser before the ongoing sync request completes, local changes will be lost if we dont save here
                this.writeItemsToLocalStorage(allDirtyItems, false, null);

                console.log("Sync op in progress; returning.");
                return _context6.abrupt('return');

              case 12:
                info = this.getActiveKeyInfo();

                // we want to write all dirty items to disk only if the user is offline, or if the sync op fails
                // if the sync op succeeds, these items will be written to disk by handling the "saved_items" response from the server

                if (!info.offline) {
                  _context6.next = 17;
                  break;
                }

                this.syncOffline(allDirtyItems, callback);
                this.modelManager.clearDirtyItems(allDirtyItems);
                return _context6.abrupt('return');

              case 17:
                isContinuationSync = this.syncStatus.needsMoreSync;


                this.syncStatus.syncOpInProgress = true;
                this.syncStatus.syncStart = new Date();
                this.beginCheckingIfSyncIsTakingTooLong();

                submitLimit = 100;
                subItems = allDirtyItems.slice(0, submitLimit);

                if (subItems.length < allDirtyItems.length) {
                  // more items left to be synced, repeat
                  this.syncStatus.needsMoreSync = true;
                } else {
                  this.syncStatus.needsMoreSync = false;
                }

                if (!isContinuationSync) {
                  this.syncStatus.total = allDirtyItems.length;
                  this.syncStatus.current = 0;
                }

                // If items are marked as dirty during a long running sync request, total isn't updated
                // This happens mostly in the case of large imports and sync conflicts where duplicated items are created
                if (this.syncStatus.current > this.syncStatus.total) {
                  this.syncStatus.total = this.syncStatus.current;
                }

                // when doing a sync request that returns items greater than the limit, and thus subsequent syncs are required,
                // we want to keep track of all retreived items, then save to local storage only once all items have been retrieved,
                // so that relationships remain intact
                if (!this.allRetreivedItems) {
                  this.allRetreivedItems = [];
                }

                // We also want to do this for savedItems
                if (!this.allSavedItems) {
                  this.allSavedItems = [];
                }

                params = {};

                params.limit = 150;

                _context6.next = 32;
                return Promise.all(subItems.map(function (item) {
                  var itemParams = new SFItemParams(item, info.keys, info.version);
                  itemParams.additionalFields = options.additionalFields;
                  return itemParams.paramsForSync();
                })).then(function (itemsParams) {
                  params.items = itemsParams;
                });

              case 32:
                _iteratorNormalCompletion15 = true;
                _didIteratorError15 = false;
                _iteratorError15 = undefined;
                _context6.prev = 35;


                for (_iterator15 = subItems[Symbol.iterator](); !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
                  item = _step15.value;

                  // Reset dirty counter to 0, since we're about to sync it.
                  // This means anyone marking the item as dirty after this will cause it so sync again and not be cleared on sync completion.
                  item.dirtyCount = 0;
                }

                _context6.next = 43;
                break;

              case 39:
                _context6.prev = 39;
                _context6.t0 = _context6['catch'](35);
                _didIteratorError15 = true;
                _iteratorError15 = _context6.t0;

              case 43:
                _context6.prev = 43;
                _context6.prev = 44;

                if (!_iteratorNormalCompletion15 && _iterator15.return) {
                  _iterator15.return();
                }

              case 46:
                _context6.prev = 46;

                if (!_didIteratorError15) {
                  _context6.next = 49;
                  break;
                }

                throw _iteratorError15;

              case 49:
                return _context6.finish(46);

              case 50:
                return _context6.finish(43);

              case 51:
                params.sync_token = this.syncToken;
                params.cursor_token = this.cursorToken;

                onSyncCompletion = function (response) {
                  this.stopCheckingIfSyncIsTakingTooLong();
                }.bind(this);

                onSyncSuccess = function () {
                  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(response) {
                    var itemsToClearAsDirty, _iteratorNormalCompletion16, _didIteratorError16, _iteratorError16, _iterator16, _step16, item, allSavedUUIDs, retrieved, omitFields, saved, unsaved, majorDataChangeThreshold;

                    return regeneratorRuntime.wrap(function _callee5$(_context5) {
                      while (1) {
                        switch (_context5.prev = _context5.next) {
                          case 0:
                            // Check to make sure any subItem hasn't been marked as dirty again while a sync was ongoing
                            itemsToClearAsDirty = [];
                            _iteratorNormalCompletion16 = true;
                            _didIteratorError16 = false;
                            _iteratorError16 = undefined;
                            _context5.prev = 4;

                            for (_iterator16 = subItems[Symbol.iterator](); !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
                              item = _step16.value;

                              if (item.dirtyCount == 0) {
                                // Safe to clear as dirty
                                itemsToClearAsDirty.push(item);
                              }
                            }
                            _context5.next = 12;
                            break;

                          case 8:
                            _context5.prev = 8;
                            _context5.t0 = _context5['catch'](4);
                            _didIteratorError16 = true;
                            _iteratorError16 = _context5.t0;

                          case 12:
                            _context5.prev = 12;
                            _context5.prev = 13;

                            if (!_iteratorNormalCompletion16 && _iterator16.return) {
                              _iterator16.return();
                            }

                          case 15:
                            _context5.prev = 15;

                            if (!_didIteratorError16) {
                              _context5.next = 18;
                              break;
                            }

                            throw _iteratorError16;

                          case 18:
                            return _context5.finish(15);

                          case 19:
                            return _context5.finish(12);

                          case 20:
                            this.modelManager.clearDirtyItems(itemsToClearAsDirty);
                            this.syncStatus.error = null;

                            this.notifyEvent("sync:updated_token", this.syncToken);

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
                            _context5.next = 27;
                            return this.handleItemsResponse(response.retrieved_items, null, SFModelManager.MappingSourceRemoteRetrieved);

                          case 27:
                            retrieved = _context5.sent;


                            // Append items to master list of retrieved items for this ongoing sync operation
                            this.allRetreivedItems = this.allRetreivedItems.concat(retrieved);

                            // Merge only metadata for saved items
                            // we write saved items to disk now because it clears their dirty status then saves
                            // if we saved items before completion, we had have to save them as dirty and save them again on success as clean
                            omitFields = ["content", "auth_hash"];

                            // Map saved items to local data

                            _context5.next = 32;
                            return this.handleItemsResponse(response.saved_items, omitFields, SFModelManager.MappingSourceRemoteSaved);

                          case 32:
                            saved = _context5.sent;


                            // Append items to master list of saved items for this ongoing sync operation
                            this.allSavedItems = this.allSavedItems.concat(saved);

                            // Create copies of items or alternate their uuids if neccessary
                            unsaved = response.unsaved;

                            this.handleUnsavedItemsResponse(unsaved);

                            this.writeItemsToLocalStorage(saved, false, null);

                            this.syncStatus.syncOpInProgress = false;
                            this.syncStatus.current += subItems.length;

                            // set the sync token at the end, so that if any errors happen above, you can resync
                            this.syncToken = response.sync_token;
                            this.cursorToken = response.cursor_token;

                            onSyncCompletion(response);

                            if (this.cursorToken || this.syncStatus.needsMoreSync) {
                              setTimeout(function () {
                                this.sync(callback, options, "onSyncSuccess cursorToken || needsMoreSync");
                              }.bind(this), 10); // wait 10ms to allow UI to update
                            } else if (this.repeatOnCompletion) {
                              this.repeatOnCompletion = false;
                              setTimeout(function () {
                                this.sync(callback, options, "onSyncSuccess repeatOnCompletion");
                              }.bind(this), 10); // wait 10ms to allow UI to update
                            } else {
                              this.writeItemsToLocalStorage(this.allRetreivedItems, false, null);

                              // The number of changed items that constitute a major change
                              // This is used by the desktop app to create backups
                              majorDataChangeThreshold = 10;

                              if (this.allRetreivedItems.length >= majorDataChangeThreshold || saved.length >= majorDataChangeThreshold || unsaved.length >= majorDataChangeThreshold) {
                                this.notifyEvent("major-data-change");
                              }

                              this.callQueuedCallbacksAndCurrent(callback, response);
                              this.notifyEvent("sync:completed", { retrievedItems: this.allRetreivedItems, savedItems: this.allSavedItems });

                              this.allRetreivedItems = [];
                              this.allSavedItems = [];
                            }

                          case 43:
                          case 'end':
                            return _context5.stop();
                        }
                      }
                    }, _callee5, this, [[4, 8, 12, 20], [13,, 15, 19]]);
                  }));

                  return function (_x13) {
                    return _ref6.apply(this, arguments);
                  };
                }().bind(this);

                try {
                  this.httpManager.postAbsolute(this.syncURL, params, function (response) {

                    try {
                      onSyncSuccess(response);
                    } catch (e) {
                      console.log("Caught sync success exception:", e);
                    }
                  }.bind(this), function (response, statusCode) {
                    if (statusCode == 401) {
                      alert("Your session has expired. New changes will not be pulled in. Please sign out and sign back in to refresh your session.");
                    }
                    console.log("Sync error: ", response);
                    var error = response ? response.error : { message: "Could not connect to server." };

                    this.syncStatus.syncOpInProgress = false;
                    this.syncStatus.error = error;
                    this.writeItemsToLocalStorage(allDirtyItems, false, null);

                    onSyncCompletion(response);

                    this.notifyEvent("sync:error", error);

                    this.callQueuedCallbacksAndCurrent(callback, { error: "Sync error" });
                  }.bind(this));
                } catch (e) {
                  console.log("Sync exception caught:", e);
                }

              case 56:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this, [[35, 39, 43, 51], [44,, 46, 50]]);
      }));

      function sync(_x12) {
        return _ref5.apply(this, arguments);
      }

      return sync;
    }()
  }, {
    key: 'handleItemsResponse',
    value: function () {
      var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(responseItems, omitFields, source) {
        var keys, items, itemsWithErrorStatusChange;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                keys = this.getActiveKeyInfo().keys;
                _context7.next = 3;
                return SFJS.itemTransformer.decryptMultipleItems(responseItems, keys);

              case 3:
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
                  this.writeItemsToLocalStorage(itemsWithErrorStatusChange, false, null);
                }

                return _context7.abrupt('return', items);

              case 7:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function handleItemsResponse(_x14, _x15, _x16) {
        return _ref7.apply(this, arguments);
      }

      return handleItemsResponse;
    }()
  }, {
    key: 'refreshErroredItems',
    value: function refreshErroredItems() {
      var erroredItems = this.modelManager.allItems.filter(function (item) {
        return item.errorDecrypting == true;
      });
      if (erroredItems.length > 0) {
        this.handleItemsResponse(erroredItems, null, SFModelManager.MappingSourceLocalRetrieved);
      }
    }
  }, {
    key: 'handleUnsavedItemsResponse',
    value: function () {
      var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(unsaved) {
        var _this7 = this;

        var i, handleNext;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                if (!(unsaved.length == 0)) {
                  _context9.next = 2;
                  break;
                }

                return _context9.abrupt('return');

              case 2:

                console.log("Handle unsaved", unsaved);

                i = 0;

                handleNext = function () {
                  var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
                    var mapping, itemResponse, item, error, dup;
                    return regeneratorRuntime.wrap(function _callee8$(_context8) {
                      while (1) {
                        switch (_context8.prev = _context8.next) {
                          case 0:
                            if (!(i >= unsaved.length)) {
                              _context8.next = 3;
                              break;
                            }

                            // Handled all items
                            _this7.sync(null, { additionalFields: ["created_at", "updated_at"] });
                            return _context8.abrupt('return');

                          case 3:
                            mapping = unsaved[i];
                            itemResponse = mapping.item;
                            _context8.next = 7;
                            return SFJS.itemTransformer.decryptMultipleItems([itemResponse], _this7.getActiveKeyInfo().keys);

                          case 7:
                            item = _this7.modelManager.findItem(itemResponse.uuid);

                            if (item) {
                              _context8.next = 10;
                              break;
                            }

                            return _context8.abrupt('return');

                          case 10:
                            error = mapping.error;


                            if (error.tag === "uuid_conflict") {
                              // UUID conflicts can occur if a user attempts to
                              // import an old data archive with uuids from the old account into a new account
                              _this7.modelManager.alternateUUIDForItem(item, function () {
                                i++;
                                handleNext();
                              }, true);
                            } else if (error.tag === "sync_conflict") {
                              // Create a new item with the same contents of this item if the contents differ

                              // We want a new uuid for the new item. Note that this won't neccessarily adjust references.
                              itemResponse.uuid = null;

                              dup = _this7.modelManager.createDuplicateItem(itemResponse);

                              if (!itemResponse.deleted && !item.isItemContentEqualWith(dup)) {
                                _this7.modelManager.addItem(dup);
                                dup.conflict_of = item.uuid;
                                dup.setDirty(true);
                              }

                              i++;
                              handleNext();
                            }

                          case 12:
                          case 'end':
                            return _context8.stop();
                        }
                      }
                    }, _callee8, _this7);
                  }));

                  return function handleNext() {
                    return _ref9.apply(this, arguments);
                  };
                }();

                handleNext();

              case 6:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function handleUnsavedItemsResponse(_x17) {
        return _ref8.apply(this, arguments);
      }

      return handleUnsavedItemsResponse;
    }()
  }, {
    key: 'serverURL',
    get: function get() {
      return this.storageManager.getItem("server") || window._default_sf_server;
    }
  }, {
    key: 'syncURL',
    get: function get() {
      return this.serverURL + "/items/sync";
    }
  }, {
    key: 'syncToken',
    set: function set(token) {
      this._syncToken = token;
      this.storageManager.setItem("syncToken", token);
    },
    get: function get() {
      if (!this._syncToken) {
        this._syncToken = this.storageManager.getItem("syncToken");
      }
      return this._syncToken;
    }
  }, {
    key: 'cursorToken',
    set: function set(token) {
      this._cursorToken = token;
      if (token) {
        this.storageManager.setItem("cursorToken", token);
      } else {
        this.storageManager.removeItem("cursorToken");
      }
    },
    get: function get() {
      if (!this._cursorToken) {
        this._cursorToken = this.storageManager.getItem("cursorToken");
      }
      return this._cursorToken;
    }
  }, {
    key: 'queuedCallbacks',
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
    this.updateFromJSON(json_obj);

    if (!this.uuid) {
      this.uuid = SFJS.crypto.generateUUIDSync();
    }

    if (!this.content.references) {
      this.content.references = [];
    }
  }

  _createClass(SFItem, [{
    key: 'updateFromJSON',
    value: function updateFromJSON(json) {
      // Manually merge top level data instead of wholesale merge
      this.created_at = json.created_at;
      this.updated_at = json.updated_at;
      this.content_type = json.content_type;
      this.deleted = json.deleted;
      this.uuid = json.uuid;
      this.enc_item_key = json.enc_item_key;
      this.auth_hash = json.auth_hash;

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
    key: 'mapContentToLocalProperties',
    value: function mapContentToLocalProperties(contentObj) {
      if (contentObj.appData) {
        this.appData = contentObj.appData;
      }
      if (!this.appData) {
        this.appData = {};
      }
    }
  }, {
    key: 'createContentJSONFromProperties',
    value: function createContentJSONFromProperties() {
      return this.structureParams();
    }
  }, {
    key: 'structureParams',
    value: function structureParams() {
      var params = this.contentObject;
      params.appData = this.appData;
      return params;
    }

    /* Allows the item to handle the case where the item is deleted and the content is null */

  }, {
    key: 'handleDeletedContent',
    value: function handleDeletedContent() {
      // Subclasses can override
    }
  }, {
    key: 'setDirty',
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
    key: 'updateLocalRelationships',
    value: function updateLocalRelationships() {
      // optional override
    }
  }, {
    key: 'addItemAsRelationship',
    value: function addItemAsRelationship(item) {
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
    key: 'removeItemAsRelationship',
    value: function removeItemAsRelationship(item) {
      var references = this.content.references || [];
      references = references.filter(function (r) {
        return r.uuid != item.uuid;
      });
      this.content.references = references;
    }
  }, {
    key: 'hasRelationshipWithItem',
    value: function hasRelationshipWithItem(item) {
      var target = this.content.references.find(function (r) {
        return r.uuid == item.uuid;
      });
      return target != null;
    }
  }, {
    key: 'isBeingRemovedLocally',
    value: function isBeingRemovedLocally() {}
  }, {
    key: 'informReferencesOfUUIDChange',
    value: function informReferencesOfUUIDChange(oldUUID, newUUID) {
      // optional override
    }
  }, {
    key: 'potentialItemOfInterestHasChangedItsUUID',
    value: function potentialItemOfInterestHasChangedItsUUID(newItem, oldUUID, newUUID) {
      // optional override
      var _iteratorNormalCompletion17 = true;
      var _didIteratorError17 = false;
      var _iteratorError17 = undefined;

      try {
        for (var _iterator17 = this.content.references[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
          var reference = _step17.value;

          if (reference.uuid == oldUUID) {
            reference.uuid = newUUID;
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
    }
  }, {
    key: 'doNotEncrypt',
    value: function doNotEncrypt() {
      return false;
    }

    /*
    App Data
    */

  }, {
    key: 'setDomainDataItem',
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
    key: 'getDomainDataItem',
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
    key: 'setAppDataItem',
    value: function setAppDataItem(key, value) {
      this.setDomainDataItem(key, value, SFItem.AppDomain);
    }
  }, {
    key: 'getAppDataItem',
    value: function getAppDataItem(key) {
      return this.getDomainDataItem(key, SFItem.AppDomain);
    }
  }, {
    key: 'hasRawClientUpdatedAtValue',
    value: function hasRawClientUpdatedAtValue() {
      return this.getAppDataItem("client_updated_at") != null;
    }
  }, {
    key: 'keysToIgnoreWhenCheckingContentEquality',


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
    key: 'appDataKeysToIgnoreWhenCheckingContentEquality',
    value: function appDataKeysToIgnoreWhenCheckingContentEquality() {
      return ["client_updated_at"];
    }
  }, {
    key: 'isItemContentEqualWith',
    value: function isItemContentEqualWith(otherItem) {
      var omit = function omit(obj, keys) {
        if (!obj) {
          return obj;
        }
        var _iteratorNormalCompletion18 = true;
        var _didIteratorError18 = false;
        var _iteratorError18 = undefined;

        try {
          for (var _iterator18 = keys[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
            var key = _step18.value;

            delete obj[key];
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

    /*
    Dates
    */

  }, {
    key: 'createdAtString',
    value: function createdAtString() {
      return this.dateToLocalizedString(this.created_at);
    }
  }, {
    key: 'updatedAtString',
    value: function updatedAtString() {
      return this.dateToLocalizedString(this.client_updated_at);
    }
  }, {
    key: 'dateToLocalizedString',
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
    key: 'contentObject',
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
    key: 'pinned',
    get: function get() {
      return this.getAppDataItem("pinned");
    }
  }, {
    key: 'archived',
    get: function get() {
      return this.getAppDataItem("archived");
    }
  }, {
    key: 'locked',
    get: function get() {
      return this.getAppDataItem("locked");
    }
  }, {
    key: 'client_updated_at',
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
    key: 'sortItemsByDate',
    value: function sortItemsByDate(items) {
      items.sort(function (a, b) {
        return new Date(b.created_at) - new Date(a.created_at);
      });
    }
  }, {
    key: 'deepMerge',
    value: function deepMerge(a, b) {
      // By default _.merge will not merge a full array with an empty one.
      // We want to replace arrays wholesale
      function mergeCopyArrays(objValue, srcValue) {
        if (_.isArray(objValue)) {
          return srcValue;
        }
      }
      _.mergeWith(a, b, mergeCopyArrays);
    }
  }]);

  return SFItem;
}();

;
var SFItemParams = exports.SFItemParams = function () {
  function SFItemParams(item, keys, version) {
    _classCallCheck(this, SFItemParams);

    this.item = item;
    this.keys = keys;
    this.version = version || SFJS.version();
  }

  _createClass(SFItemParams, [{
    key: 'paramsForExportFile',
    value: function () {
      var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(includeDeleted) {
        var result;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                this.additionalFields = ["updated_at"];
                this.forExportFile = true;

                if (!includeDeleted) {
                  _context10.next = 6;
                  break;
                }

                return _context10.abrupt('return', this.__params());

              case 6:
                _context10.next = 8;
                return this.__params();

              case 8:
                result = _context10.sent;
                return _context10.abrupt('return', _.omit(result, ["deleted"]));

              case 10:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function paramsForExportFile(_x19) {
        return _ref10.apply(this, arguments);
      }

      return paramsForExportFile;
    }()
  }, {
    key: 'paramsForExtension',
    value: function () {
      var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                return _context11.abrupt('return', this.paramsForExportFile());

              case 1:
              case 'end':
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function paramsForExtension() {
        return _ref11.apply(this, arguments);
      }

      return paramsForExtension;
    }()
  }, {
    key: 'paramsForLocalStorage',
    value: function () {
      var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12() {
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                this.additionalFields = ["updated_at", "dirty", "errorDecrypting"];
                this.forExportFile = true;
                return _context12.abrupt('return', this.__params());

              case 3:
              case 'end':
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function paramsForLocalStorage() {
        return _ref12.apply(this, arguments);
      }

      return paramsForLocalStorage;
    }()
  }, {
    key: 'paramsForSync',
    value: function () {
      var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13() {
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                return _context13.abrupt('return', this.__params());

              case 1:
              case 'end':
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function paramsForSync() {
        return _ref13.apply(this, arguments);
      }

      return paramsForSync;
    }()
  }, {
    key: '__params',
    value: function () {
      var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14() {
        var params, doNotEncrypt, encryptedParams;
        return regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:

                console.assert(!this.item.dummy, "Item is dummy, should not have gotten here.", this.item.dummy);

                params = { uuid: this.item.uuid, content_type: this.item.content_type, deleted: this.item.deleted, created_at: this.item.created_at };

                if (this.item.errorDecrypting) {
                  _context14.next = 24;
                  break;
                }

                // Items should always be encrypted for export files. Only respect item.doNotEncrypt for remote sync params.
                doNotEncrypt = this.item.doNotEncrypt() && !this.forExportFile;

                if (!(this.keys && !doNotEncrypt)) {
                  _context14.next = 12;
                  break;
                }

                _context14.next = 7;
                return SFJS.itemTransformer.encryptItem(this.item, this.keys, this.version);

              case 7:
                encryptedParams = _context14.sent;

                _.merge(params, encryptedParams);

                if (this.version !== "001") {
                  params.auth_hash = null;
                }
                _context14.next = 22;
                break;

              case 12:
                if (!this.forExportFile) {
                  _context14.next = 16;
                  break;
                }

                _context14.t0 = this.item.createContentJSONFromProperties();
                _context14.next = 20;
                break;

              case 16:
                _context14.next = 18;
                return SFJS.crypto.base64(JSON.stringify(this.item.createContentJSONFromProperties()));

              case 18:
                _context14.t1 = _context14.sent;
                _context14.t0 = "000" + _context14.t1;

              case 20:
                params.content = _context14.t0;

                if (!this.forExportFile) {
                  params.enc_item_key = null;
                  params.auth_hash = null;
                }

              case 22:
                _context14.next = 27;
                break;

              case 24:
                // Error decrypting, keep "content" and related fields as is (and do not try to encrypt, otherwise that would be undefined behavior)
                params.content = this.item.content;
                params.enc_item_key = this.item.enc_item_key;
                params.auth_hash = this.item.auth_hash;

              case 27:

                if (this.additionalFields) {
                  _.merge(params, _.pick(this.item, this.additionalFields));
                }

                return _context14.abrupt('return', params);

              case 29:
              case 'end':
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function __params() {
        return _ref14.apply(this, arguments);
      }

      return __params;
    }()
  }]);

  return SFItemParams;
}();

; /* Abstract class. Instantiate an instance of either SFCryptoJS (uses cryptojs) or SFCryptoWeb (uses web crypto) */

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
    key: 'generateUUIDSync',
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
      var _ref15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15() {
        var _ref16 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            ciphertextToAuth = _ref16.ciphertextToAuth,
            contentCiphertext = _ref16.contentCiphertext,
            encryptionKey = _ref16.encryptionKey,
            iv = _ref16.iv,
            authHash = _ref16.authHash,
            authKey = _ref16.authKey;

        var requiresAuth = arguments[1];
        var localAuthHash, keyData, ivData, decrypted;
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                if (!(requiresAuth && !authHash)) {
                  _context15.next = 3;
                  break;
                }

                console.error("Auth hash is required.");
                return _context15.abrupt('return');

              case 3:
                if (!authHash) {
                  _context15.next = 10;
                  break;
                }

                _context15.next = 6;
                return this.hmac256(ciphertextToAuth, authKey);

              case 6:
                localAuthHash = _context15.sent;

                if (!(authHash !== localAuthHash)) {
                  _context15.next = 10;
                  break;
                }

                console.error("Auth hash does not match, returning null.");
                return _context15.abrupt('return', null);

              case 10:
                keyData = CryptoJS.enc.Hex.parse(encryptionKey);
                ivData = CryptoJS.enc.Hex.parse(iv || "");
                decrypted = CryptoJS.AES.decrypt(contentCiphertext, keyData, { iv: ivData, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
                return _context15.abrupt('return', decrypted.toString(CryptoJS.enc.Utf8));

              case 14:
              case 'end':
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function decryptText() {
        return _ref15.apply(this, arguments);
      }

      return decryptText;
    }()
  }, {
    key: 'encryptText',
    value: function () {
      var _ref17 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(text, key, iv) {
        var keyData, ivData, encrypted;
        return regeneratorRuntime.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                keyData = CryptoJS.enc.Hex.parse(key);
                ivData = CryptoJS.enc.Hex.parse(iv || "");
                encrypted = CryptoJS.AES.encrypt(text, keyData, { iv: ivData, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
                return _context16.abrupt('return', encrypted.toString());

              case 4:
              case 'end':
                return _context16.stop();
            }
          }
        }, _callee16, this);
      }));

      function encryptText(_x21, _x22, _x23) {
        return _ref17.apply(this, arguments);
      }

      return encryptText;
    }()
  }, {
    key: 'generateRandomKey',
    value: function () {
      var _ref18 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17(bits) {
        return regeneratorRuntime.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                return _context17.abrupt('return', CryptoJS.lib.WordArray.random(bits / 8).toString());

              case 1:
              case 'end':
                return _context17.stop();
            }
          }
        }, _callee17, this);
      }));

      function generateRandomKey(_x24) {
        return _ref18.apply(this, arguments);
      }

      return generateRandomKey;
    }()
  }, {
    key: 'generateItemEncryptionKey',
    value: function () {
      var _ref19 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18() {
        var length, cost, salt, passphrase;
        return regeneratorRuntime.wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                // Generates a key that will be split in half, each being 256 bits. So total length will need to be 512.
                length = 512;
                cost = 1;
                _context18.next = 4;
                return this.generateRandomKey(length);

              case 4:
                salt = _context18.sent;
                _context18.next = 7;
                return this.generateRandomKey(length);

              case 7:
                passphrase = _context18.sent;
                return _context18.abrupt('return', this.pbkdf2(passphrase, salt, cost, length));

              case 9:
              case 'end':
                return _context18.stop();
            }
          }
        }, _callee18, this);
      }));

      function generateItemEncryptionKey() {
        return _ref19.apply(this, arguments);
      }

      return generateItemEncryptionKey;
    }()
  }, {
    key: 'firstHalfOfKey',
    value: function () {
      var _ref20 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19(key) {
        return regeneratorRuntime.wrap(function _callee19$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
                return _context19.abrupt('return', key.substring(0, key.length / 2));

              case 1:
              case 'end':
                return _context19.stop();
            }
          }
        }, _callee19, this);
      }));

      function firstHalfOfKey(_x25) {
        return _ref20.apply(this, arguments);
      }

      return firstHalfOfKey;
    }()
  }, {
    key: 'secondHalfOfKey',
    value: function () {
      var _ref21 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20(key) {
        return regeneratorRuntime.wrap(function _callee20$(_context20) {
          while (1) {
            switch (_context20.prev = _context20.next) {
              case 0:
                return _context20.abrupt('return', key.substring(key.length / 2, key.length));

              case 1:
              case 'end':
                return _context20.stop();
            }
          }
        }, _callee20, this);
      }));

      function secondHalfOfKey(_x26) {
        return _ref21.apply(this, arguments);
      }

      return secondHalfOfKey;
    }()
  }, {
    key: 'base64',
    value: function () {
      var _ref22 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21(text) {
        return regeneratorRuntime.wrap(function _callee21$(_context21) {
          while (1) {
            switch (_context21.prev = _context21.next) {
              case 0:
                return _context21.abrupt('return', window.btoa(text));

              case 1:
              case 'end':
                return _context21.stop();
            }
          }
        }, _callee21, this);
      }));

      function base64(_x27) {
        return _ref22.apply(this, arguments);
      }

      return base64;
    }()
  }, {
    key: 'base64Decode',
    value: function () {
      var _ref23 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee22(base64String) {
        return regeneratorRuntime.wrap(function _callee22$(_context22) {
          while (1) {
            switch (_context22.prev = _context22.next) {
              case 0:
                return _context22.abrupt('return', window.atob(base64String));

              case 1:
              case 'end':
                return _context22.stop();
            }
          }
        }, _callee22, this);
      }));

      function base64Decode(_x28) {
        return _ref23.apply(this, arguments);
      }

      return base64Decode;
    }()
  }, {
    key: 'sha256',
    value: function () {
      var _ref24 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee23(text) {
        return regeneratorRuntime.wrap(function _callee23$(_context23) {
          while (1) {
            switch (_context23.prev = _context23.next) {
              case 0:
                return _context23.abrupt('return', CryptoJS.SHA256(text).toString());

              case 1:
              case 'end':
                return _context23.stop();
            }
          }
        }, _callee23, this);
      }));

      function sha256(_x29) {
        return _ref24.apply(this, arguments);
      }

      return sha256;
    }()
  }, {
    key: 'hmac256',
    value: function () {
      var _ref25 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee24(message, key) {
        var keyData, messageData, result;
        return regeneratorRuntime.wrap(function _callee24$(_context24) {
          while (1) {
            switch (_context24.prev = _context24.next) {
              case 0:
                keyData = CryptoJS.enc.Hex.parse(key);
                messageData = CryptoJS.enc.Utf8.parse(message);
                result = CryptoJS.HmacSHA256(messageData, keyData).toString();
                return _context24.abrupt('return', result);

              case 4:
              case 'end':
                return _context24.stop();
            }
          }
        }, _callee24, this);
      }));

      function hmac256(_x30, _x31) {
        return _ref25.apply(this, arguments);
      }

      return hmac256;
    }()
  }, {
    key: 'generateSalt',
    value: function () {
      var _ref26 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee25(identifier, version, cost, nonce) {
        var result;
        return regeneratorRuntime.wrap(function _callee25$(_context25) {
          while (1) {
            switch (_context25.prev = _context25.next) {
              case 0:
                _context25.next = 2;
                return this.sha256([identifier, "SF", version, cost, nonce].join(":"));

              case 2:
                result = _context25.sent;
                return _context25.abrupt('return', result);

              case 4:
              case 'end':
                return _context25.stop();
            }
          }
        }, _callee25, this);
      }));

      function generateSalt(_x32, _x33, _x34, _x35) {
        return _ref26.apply(this, arguments);
      }

      return generateSalt;
    }()

    /** Generates two deterministic keys based on one input */

  }, {
    key: 'generateSymmetricKeyPair',
    value: function () {
      var _ref27 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee26() {
        var _ref28 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            password = _ref28.password,
            pw_salt = _ref28.pw_salt,
            pw_cost = _ref28.pw_cost;

        var output, outputLength, splitLength, firstThird, secondThird, thirdThird;
        return regeneratorRuntime.wrap(function _callee26$(_context26) {
          while (1) {
            switch (_context26.prev = _context26.next) {
              case 0:
                _context26.next = 2;
                return this.pbkdf2(password, pw_salt, pw_cost, this.DefaultPBKDF2Length);

              case 2:
                output = _context26.sent;
                outputLength = output.length;
                splitLength = outputLength / 3;
                firstThird = output.slice(0, splitLength);
                secondThird = output.slice(splitLength, splitLength * 2);
                thirdThird = output.slice(splitLength * 2, splitLength * 3);
                return _context26.abrupt('return', [firstThird, secondThird, thirdThird]);

              case 9:
              case 'end':
                return _context26.stop();
            }
          }
        }, _callee26, this);
      }));

      function generateSymmetricKeyPair() {
        return _ref27.apply(this, arguments);
      }

      return generateSymmetricKeyPair;
    }()
  }, {
    key: 'computeEncryptionKeysForUser',
    value: function () {
      var _ref29 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee27(password, authParams) {
        var pw_salt;
        return regeneratorRuntime.wrap(function _callee27$(_context27) {
          while (1) {
            switch (_context27.prev = _context27.next) {
              case 0:
                if (!(authParams.version == "003")) {
                  _context27.next = 9;
                  break;
                }

                if (authParams.identifier) {
                  _context27.next = 4;
                  break;
                }

                console.error("authParams is missing identifier.");
                return _context27.abrupt('return');

              case 4:
                _context27.next = 6;
                return this.generateSalt(authParams.identifier, authParams.version, authParams.pw_cost, authParams.pw_nonce);

              case 6:
                pw_salt = _context27.sent;
                _context27.next = 10;
                break;

              case 9:
                // Salt is returned from server
                pw_salt = authParams.pw_salt;

              case 10:
                return _context27.abrupt('return', this.generateSymmetricKeyPair({ password: password, pw_salt: pw_salt, pw_cost: authParams.pw_cost }).then(function (keys) {
                  var userKeys = { pw: keys[0], mk: keys[1], ak: keys[2] };
                  return userKeys;
                }));

              case 11:
              case 'end':
                return _context27.stop();
            }
          }
        }, _callee27, this);
      }));

      function computeEncryptionKeysForUser(_x37, _x38) {
        return _ref29.apply(this, arguments);
      }

      return computeEncryptionKeysForUser;
    }()

    // Unlike computeEncryptionKeysForUser, this method always uses the latest SF Version

  }, {
    key: 'generateInitialKeysAndAuthParamsForUser',
    value: function () {
      var _ref30 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee28(identifier, password) {
        var version, pw_cost, pw_nonce, pw_salt;
        return regeneratorRuntime.wrap(function _callee28$(_context28) {
          while (1) {
            switch (_context28.prev = _context28.next) {
              case 0:
                version = this.SFJS.version;
                pw_cost = this.SFJS.defaultPasswordGenerationCost;
                _context28.next = 4;
                return this.generateRandomKey(256);

              case 4:
                pw_nonce = _context28.sent;
                _context28.next = 7;
                return this.generateSalt(identifier, version, pw_cost, pw_nonce);

              case 7:
                pw_salt = _context28.sent;
                return _context28.abrupt('return', this.generateSymmetricKeyPair({ password: password, pw_salt: pw_salt, pw_cost: pw_cost }).then(function (keys) {
                  var authParams = { pw_nonce: pw_nonce, pw_cost: pw_cost, identifier: identifier, version: version };
                  var userKeys = { pw: keys[0], mk: keys[1], ak: keys[2] };
                  return { keys: userKeys, authParams: authParams };
                }));

              case 9:
              case 'end':
                return _context28.stop();
            }
          }
        }, _callee28, this);
      }));

      function generateInitialKeysAndAuthParamsForUser(_x39, _x40) {
        return _ref30.apply(this, arguments);
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
    key: 'pbkdf2',
    value: function () {
      var _ref31 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee29(password, pw_salt, pw_cost, length) {
        var params;
        return regeneratorRuntime.wrap(function _callee29$(_context29) {
          while (1) {
            switch (_context29.prev = _context29.next) {
              case 0:
                params = {
                  keySize: length / 32,
                  hasher: CryptoJS.algo.SHA512,
                  iterations: pw_cost
                };
                return _context29.abrupt('return', CryptoJS.PBKDF2(password, pw_salt, params).toString());

              case 2:
              case 'end':
                return _context29.stop();
            }
          }
        }, _callee29, this);
      }));

      function pbkdf2(_x41, _x42, _x43, _x44) {
        return _ref31.apply(this, arguments);
      }

      return pbkdf2;
    }()
  }]);

  return SFCryptoJS;
}(SFAbstractCrypto);

;var subtleCrypto = window.crypto ? window.crypto.subtle : null;

var SFCryptoWeb = exports.SFCryptoWeb = function (_SFAbstractCrypto2) {
  _inherits(SFCryptoWeb, _SFAbstractCrypto2);

  function SFCryptoWeb() {
    _classCallCheck(this, SFCryptoWeb);

    return _possibleConstructorReturn(this, (SFCryptoWeb.__proto__ || Object.getPrototypeOf(SFCryptoWeb)).apply(this, arguments));
  }

  _createClass(SFCryptoWeb, [{
    key: 'pbkdf2',


    /**
    Public
    */

    value: function () {
      var _ref32 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee30(password, pw_salt, pw_cost, length) {
        var key;
        return regeneratorRuntime.wrap(function _callee30$(_context30) {
          while (1) {
            switch (_context30.prev = _context30.next) {
              case 0:
                _context30.next = 2;
                return this.webCryptoImportKey(password, "PBKDF2", "deriveBits");

              case 2:
                key = _context30.sent;

                if (key) {
                  _context30.next = 6;
                  break;
                }

                console.log("Key is null, unable to continue");
                return _context30.abrupt('return', null);

              case 6:
                return _context30.abrupt('return', this.webCryptoDeriveBits(key, pw_salt, pw_cost, length));

              case 7:
              case 'end':
                return _context30.stop();
            }
          }
        }, _callee30, this);
      }));

      function pbkdf2(_x45, _x46, _x47, _x48) {
        return _ref32.apply(this, arguments);
      }

      return pbkdf2;
    }()
  }, {
    key: 'generateRandomKey',
    value: function () {
      var _ref33 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee31(bits) {
        var _this10 = this;

        var extractable;
        return regeneratorRuntime.wrap(function _callee31$(_context31) {
          while (1) {
            switch (_context31.prev = _context31.next) {
              case 0:
                extractable = true;
                return _context31.abrupt('return', subtleCrypto.generateKey({ name: "AES-CBC", length: bits }, extractable, ["encrypt", "decrypt"]).then(function (keyObject) {
                  return subtleCrypto.exportKey("raw", keyObject).then(function (keyData) {
                    var key = _this10.arrayBufferToHexString(new Uint8Array(keyData));
                    return key;
                  }).catch(function (err) {
                    console.error("Error exporting key", err);
                  });
                }).catch(function (err) {
                  console.error("Error generating key", err);
                }));

              case 2:
              case 'end':
                return _context31.stop();
            }
          }
        }, _callee31, this);
      }));

      function generateRandomKey(_x49) {
        return _ref33.apply(this, arguments);
      }

      return generateRandomKey;
    }()
  }, {
    key: 'generateItemEncryptionKey',
    value: function () {
      var _ref34 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee32() {
        var length;
        return regeneratorRuntime.wrap(function _callee32$(_context32) {
          while (1) {
            switch (_context32.prev = _context32.next) {
              case 0:
                // Generates a key that will be split in half, each being 256 bits. So total length will need to be 512.
                length = 256;
                return _context32.abrupt('return', Promise.all([this.generateRandomKey(length), this.generateRandomKey(length)]).then(function (values) {
                  return values.join("");
                }));

              case 2:
              case 'end':
                return _context32.stop();
            }
          }
        }, _callee32, this);
      }));

      function generateItemEncryptionKey() {
        return _ref34.apply(this, arguments);
      }

      return generateItemEncryptionKey;
    }()

    /* This is a functioning implementation of WebCrypto's encrypt, however, in basic testing, CrpytoJS performs about 30-40% faster, surprisingly. */
    /*
    async encryptText(text, key, iv) {
      var ivData  = this.hexStringToArrayBuffer(iv);
      const alg = { name: 'AES-CBC', iv: ivData };
       const keyBuffer = this.hexStringToArrayBuffer(key);
      var keyData = await this.webCryptoImportKey(keyBuffer, alg.name, "encrypt");
       var textData = this.stringToArrayBuffer(text);
       return crypto.subtle.encrypt(alg, keyData, textData).then((result) => {
        let cipher = this.arrayBufferToBase64(result);
        return cipher;
      })
    }
    */

    /**
    Internal
    */

  }, {
    key: 'webCryptoImportKey',
    value: function () {
      var _ref35 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee33(input, alg, action) {
        var text;
        return regeneratorRuntime.wrap(function _callee33$(_context33) {
          while (1) {
            switch (_context33.prev = _context33.next) {
              case 0:
                text = typeof input === "string" ? this.stringToArrayBuffer(input) : input;
                return _context33.abrupt('return', subtleCrypto.importKey("raw", text, { name: alg }, false, [action]).then(function (key) {
                  return key;
                }).catch(function (err) {
                  console.error(err);
                  return null;
                }));

              case 2:
              case 'end':
                return _context33.stop();
            }
          }
        }, _callee33, this);
      }));

      function webCryptoImportKey(_x50, _x51, _x52) {
        return _ref35.apply(this, arguments);
      }

      return webCryptoImportKey;
    }()
  }, {
    key: 'webCryptoDeriveBits',
    value: function () {
      var _ref36 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee34(key, pw_salt, pw_cost, length) {
        var _this11 = this;

        var params;
        return regeneratorRuntime.wrap(function _callee34$(_context34) {
          while (1) {
            switch (_context34.prev = _context34.next) {
              case 0:
                params = {
                  "name": "PBKDF2",
                  salt: this.stringToArrayBuffer(pw_salt),
                  iterations: pw_cost,
                  hash: { name: "SHA-512" }
                };
                return _context34.abrupt('return', subtleCrypto.deriveBits(params, key, length).then(function (bits) {
                  var key = _this11.arrayBufferToHexString(new Uint8Array(bits));
                  return key;
                }).catch(function (err) {
                  console.error(err);
                  return null;
                }));

              case 2:
              case 'end':
                return _context34.stop();
            }
          }
        }, _callee34, this);
      }));

      function webCryptoDeriveBits(_x53, _x54, _x55, _x56) {
        return _ref36.apply(this, arguments);
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
  }, {
    key: 'hexStringToArrayBuffer',
    value: function hexStringToArrayBuffer(hex) {
      for (var bytes = [], c = 0; c < hex.length; c += 2) {
        bytes.push(parseInt(hex.substr(c, 2), 16));
      }return new Uint8Array(bytes);
    }
  }, {
    key: 'arrayBufferToBase64',
    value: function arrayBufferToBase64(buffer) {
      var binary = '';
      var bytes = new Uint8Array(buffer);
      var len = bytes.byteLength;
      for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return window.btoa(binary);
    }
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
    key: '_private_encryptString',
    value: function () {
      var _ref37 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee35(string, encryptionKey, authKey, uuid, version) {
        var fullCiphertext, contentCiphertext, iv, ciphertextToAuth, authHash;
        return regeneratorRuntime.wrap(function _callee35$(_context35) {
          while (1) {
            switch (_context35.prev = _context35.next) {
              case 0:
                if (!(version === "001")) {
                  _context35.next = 7;
                  break;
                }

                _context35.next = 3;
                return this.crypto.encryptText(string, encryptionKey, null);

              case 3:
                contentCiphertext = _context35.sent;

                fullCiphertext = version + contentCiphertext;
                _context35.next = 18;
                break;

              case 7:
                _context35.next = 9;
                return this.crypto.generateRandomKey(128);

              case 9:
                iv = _context35.sent;
                _context35.next = 12;
                return this.crypto.encryptText(string, encryptionKey, iv);

              case 12:
                contentCiphertext = _context35.sent;
                ciphertextToAuth = [version, uuid, iv, contentCiphertext].join(":");
                _context35.next = 16;
                return this.crypto.hmac256(ciphertextToAuth, authKey);

              case 16:
                authHash = _context35.sent;

                fullCiphertext = [version, authHash, uuid, iv, contentCiphertext].join(":");

              case 18:
                return _context35.abrupt('return', fullCiphertext);

              case 19:
              case 'end':
                return _context35.stop();
            }
          }
        }, _callee35, this);
      }));

      function _private_encryptString(_x57, _x58, _x59, _x60, _x61) {
        return _ref37.apply(this, arguments);
      }

      return _private_encryptString;
    }()
  }, {
    key: 'encryptItem',
    value: function () {
      var _ref38 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee36(item, keys) {
        var version = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "003";
        var params, item_key, ek, ak, ciphertext, authHash;
        return regeneratorRuntime.wrap(function _callee36$(_context36) {
          while (1) {
            switch (_context36.prev = _context36.next) {
              case 0:
                params = {};
                // encrypt item key

                _context36.next = 3;
                return this.crypto.generateItemEncryptionKey();

              case 3:
                item_key = _context36.sent;

                if (!(version === "001")) {
                  _context36.next = 10;
                  break;
                }

                _context36.next = 7;
                return this.crypto.encryptText(item_key, keys.mk, null);

              case 7:
                params.enc_item_key = _context36.sent;
                _context36.next = 13;
                break;

              case 10:
                _context36.next = 12;
                return this._private_encryptString(item_key, keys.mk, keys.ak, item.uuid, version);

              case 12:
                params.enc_item_key = _context36.sent;

              case 13:
                _context36.next = 15;
                return this.crypto.firstHalfOfKey(item_key);

              case 15:
                ek = _context36.sent;
                _context36.next = 18;
                return this.crypto.secondHalfOfKey(item_key);

              case 18:
                ak = _context36.sent;
                _context36.next = 21;
                return this._private_encryptString(JSON.stringify(item.createContentJSONFromProperties()), ek, ak, item.uuid, version);

              case 21:
                ciphertext = _context36.sent;

                if (!(version === "001")) {
                  _context36.next = 27;
                  break;
                }

                _context36.next = 25;
                return this.crypto.hmac256(ciphertext, ak);

              case 25:
                authHash = _context36.sent;

                params.auth_hash = authHash;

              case 27:

                params.content = ciphertext;
                return _context36.abrupt('return', params);

              case 29:
              case 'end':
                return _context36.stop();
            }
          }
        }, _callee36, this);
      }));

      function encryptItem(_x63, _x64) {
        return _ref38.apply(this, arguments);
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
      var _ref39 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee37(item, keys) {
        var encryptedItemKey, requiresAuth, keyParams, item_key, ek, ak, itemParams, content;
        return regeneratorRuntime.wrap(function _callee37$(_context37) {
          while (1) {
            switch (_context37.prev = _context37.next) {
              case 0:
                if (!(typeof item.content != "string")) {
                  _context37.next = 2;
                  break;
                }

                return _context37.abrupt('return');

              case 2:
                if (!item.content.startsWith("000")) {
                  _context37.next = 14;
                  break;
                }

                _context37.prev = 3;
                _context37.t0 = JSON;
                _context37.next = 7;
                return this.crypto.base64Decode(item.content.substring(3, item.content.length));

              case 7:
                _context37.t1 = _context37.sent;
                item.content = _context37.t0.parse.call(_context37.t0, _context37.t1);
                _context37.next = 13;
                break;

              case 11:
                _context37.prev = 11;
                _context37.t2 = _context37['catch'](3);

              case 13:
                return _context37.abrupt('return');

              case 14:
                if (item.enc_item_key) {
                  _context37.next = 17;
                  break;
                }

                // This needs to be here to continue, return otherwise
                console.log("Missing item encryption key, skipping decryption.");
                return _context37.abrupt('return');

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
                  _context37.next = 26;
                  break;
                }

                console.error("Item key params UUID does not match item UUID");
                if (!item.errorDecrypting) {
                  item.errorDecryptingValueChanged = true;
                }
                item.errorDecrypting = true;
                return _context37.abrupt('return');

              case 26:
                _context37.next = 28;
                return this.crypto.decryptText(keyParams, requiresAuth);

              case 28:
                item_key = _context37.sent;

                if (item_key) {
                  _context37.next = 33;
                  break;
                }

                if (!item.errorDecrypting) {
                  item.errorDecryptingValueChanged = true;
                }
                item.errorDecrypting = true;
                return _context37.abrupt('return');

              case 33:
                _context37.next = 35;
                return this.crypto.firstHalfOfKey(item_key);

              case 35:
                ek = _context37.sent;
                _context37.next = 38;
                return this.crypto.secondHalfOfKey(item_key);

              case 38:
                ak = _context37.sent;
                itemParams = this.encryptionComponentsFromString(item.content, ek, ak);

                // return if uuid in auth hash does not match item uuid. Signs of tampering.

                if (!(itemParams.uuid && itemParams.uuid !== item.uuid)) {
                  _context37.next = 44;
                  break;
                }

                if (!item.errorDecrypting) {
                  item.errorDecryptingValueChanged = true;
                }
                item.errorDecrypting = true;
                return _context37.abrupt('return');

              case 44:

                if (!itemParams.authHash) {
                  // legacy 001
                  itemParams.authHash = item.auth_hash;
                }

                _context37.next = 47;
                return this.crypto.decryptText(itemParams, true);

              case 47:
                content = _context37.sent;

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

              case 49:
              case 'end':
                return _context37.stop();
            }
          }
        }, _callee37, this, [[3, 11]]);
      }));

      function decryptItem(_x65, _x66) {
        return _ref39.apply(this, arguments);
      }

      return decryptItem;
    }()
  }, {
    key: 'decryptMultipleItems',
    value: function () {
      var _ref40 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee39(items, keys, throws) {
        var _this12 = this;

        var decrypt;
        return regeneratorRuntime.wrap(function _callee39$(_context39) {
          while (1) {
            switch (_context39.prev = _context39.next) {
              case 0:
                decrypt = function () {
                  var _ref41 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee38(item) {
                    var isString;
                    return regeneratorRuntime.wrap(function _callee38$(_context38) {
                      while (1) {
                        switch (_context38.prev = _context38.next) {
                          case 0:
                            if (!(item.deleted == true && item.content == null)) {
                              _context38.next = 2;
                              break;
                            }

                            return _context38.abrupt('return');

                          case 2:
                            isString = typeof item.content === 'string' || item.content instanceof String;

                            if (!isString) {
                              _context38.next = 17;
                              break;
                            }

                            _context38.prev = 4;
                            _context38.next = 7;
                            return _this12.decryptItem(item, keys);

                          case 7:
                            _context38.next = 17;
                            break;

                          case 9:
                            _context38.prev = 9;
                            _context38.t0 = _context38['catch'](4);

                            if (!item.errorDecrypting) {
                              item.errorDecryptingValueChanged = true;
                            }
                            item.errorDecrypting = true;

                            if (!throws) {
                              _context38.next = 15;
                              break;
                            }

                            throw _context38.t0;

                          case 15:
                            console.error("Error decrypting item", item, _context38.t0);
                            return _context38.abrupt('return');

                          case 17:
                          case 'end':
                            return _context38.stop();
                        }
                      }
                    }, _callee38, _this12, [[4, 9]]);
                  }));

                  return function decrypt(_x70) {
                    return _ref41.apply(this, arguments);
                  };
                }();

                return _context39.abrupt('return', Promise.all(items.map(function (item) {
                  return decrypt(item);
                })));

              case 2:
              case 'end':
                return _context39.stop();
            }
          }
        }, _callee39, this);
      }));

      function decryptMultipleItems(_x67, _x68, _x69) {
        return _ref40.apply(this, arguments);
      }

      return decryptMultipleItems;
    }()
  }]);

  return SFItemTransformer;
}();

;
var StandardFile = exports.StandardFile = function () {
  function StandardFile(cryptoInstance) {
    _classCallCheck(this, StandardFile);

    // This library runs in native environments as well (react native)
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      // detect IE8 and above, and edge.
      // IE and Edge do not support pbkdf2 in WebCrypto, therefore we need to use CryptoJS
      var IEOrEdge = document.documentMode || /Edge/.test(navigator.userAgent);

      if (cryptoInstance) {
        this.crypto = cryptoInstance;
      } else if (!IEOrEdge && window.crypto && window.crypto.subtle) {
        this.crypto = new SFCryptoWeb();
      } else {
        this.crypto = new SFCryptoJS();
      }
    }

    this.itemTransformer = new SFItemTransformer(this.crypto);

    this.crypto.SFJS = {
      version: this.version(),
      defaultPasswordGenerationCost: this.defaultPasswordGenerationCost()
    };
  }

  _createClass(StandardFile, [{
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

if (typeof window !== 'undefined' && window !== null) {
  // window is for some reason defined in React Native, but throws an exception when you try to set to it
  try {
    window.StandardFile = StandardFile;
    window.SFJS = new StandardFile();
    window.SFCryptoWeb = SFCryptoWeb;
    window.SFCryptoJS = SFCryptoJS;
    window.SFItemTransformer = SFItemTransformer;
    window.SFModelManager = SFModelManager;
    window.SFItem = SFItem;
    window.SFItemParams = SFItemParams;
    window.SFHttpManager = SFHttpManager;
    window.SFStorageManager = SFStorageManager;
    window.SFSyncManager = SFSyncManager;
  } catch (e) {
    console.log("Exception while exporting window variables", e);
  }
}
//# sourceMappingURL=transpiled.js.map
