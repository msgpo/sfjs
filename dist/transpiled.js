"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
    key: "resetLocalMemory",
    value: function resetLocalMemory() {
      this.items.length = 0;
    }
  }, {
    key: "alternateUUIDForItem",
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
    key: "informModelsOfUUIDChangeForItem",
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
    key: "allItemsMatchingTypes",
    value: function allItemsMatchingTypes(contentTypes) {
      return this.allItems.filter(function (item) {
        return (_.includes(contentTypes, item.content_type) || _.includes(contentTypes, "*")) && !item.dummy;
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
      return _.find(this.items, { uuid: itemId });
    }
  }, {
    key: "findItems",
    value: function findItems(ids) {
      return this.items.filter(function (item) {
        return ids.includes(item.uuid);
      });
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
    key: "notifySyncObserversOfModels",
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
    key: "createDuplicateItem",
    value: function createDuplicateItem(itemResponse) {
      var dup = this.createItem(itemResponse, true);
      this.resolveReferencesForItem(dup);
      return dup;
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
      var _this = this;

      var globalOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      items.forEach(function (item) {
        if (!_.find(_this.items, { uuid: item.uuid })) {
          _this.items.push(item);
        }
      });
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
    key: "addItemSyncObserver",
    value: function addItemSyncObserver(id, type, callback) {
      this.itemSyncObservers.push({ id: id, type: type, callback: callback });
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
    key: "clearAllDirtyItems",
    value: function clearAllDirtyItems() {
      this.clearDirtyItems(this.getDirtyItems());
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
      var _iteratorNormalCompletion9 = true;
      var _didIteratorError9 = false;
      var _iteratorError9 = undefined;

      try {
        for (var _iterator9 = item.content.references[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
          var reference = _step9.value;

          var relationship = this.findItem(reference.uuid);
          if (relationship) {
            this.removeRelationshipBetweenItems(relationship, item);
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
    key: "setAllItemsDirty",
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
    key: "markAllReferencesDirtyForItem",
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
    key: "removeItemLocally",
    value: function removeItemLocally(item, callback) {
      _.remove(this.items, { uuid: item.uuid });

      item.isBeingRemovedLocally();

      this.itemsPendingRemoval.push(item.uuid);
    }

    /*
    Archives
    */

  }, {
    key: "getAllItemsJSONData",
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(keys, authParams, protocolVersion, returnNullIfEmpty) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", Promise.all(this.allItems.map(function (item) {
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
              case "end":
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
    key: "allItems",
    get: function get() {
      return this.items.filter(function (item) {
        return !item.dummy;
      });
    }
  }, {
    key: "extensions",
    get: function get() {
      return this._extensions.filter(function (ext) {
        return !ext.deleted;
      });
    }
  }]);

  return SFModelManager;
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
    key: "updateFromJSON",
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
      var references = this.content.references || [];
      references = references.filter(function (r) {
        return r.uuid != item.uuid;
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
    key: "informReferencesOfUUIDChange",
    value: function informReferencesOfUUIDChange(oldUUID, newUUID) {
      // optional override
    }
  }, {
    key: "potentialItemOfInterestHasChangedItsUUID",
    value: function potentialItemOfInterestHasChangedItsUUID(newItem, oldUUID, newUUID) {
      // optional override
      var _iteratorNormalCompletion11 = true;
      var _didIteratorError11 = false;
      var _iteratorError11 = undefined;

      try {
        for (var _iterator11 = this.content.references[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
          var reference = _step11.value;

          if (reference.uuid == oldUUID) {
            reference.uuid = newUUID;
          }
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
        var _iteratorNormalCompletion12 = true;
        var _didIteratorError12 = false;
        var _iteratorError12 = undefined;

        try {
          for (var _iterator12 = keys[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
            var key = _step12.value;

            delete obj[key];
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
    key: "sortItemsByDate",
    value: function sortItemsByDate(items) {
      items.sort(function (a, b) {
        return new Date(b.created_at) - new Date(a.created_at);
      });
    }
  }, {
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
    key: "paramsForExportFile",
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(includeDeleted) {
        var result;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this.additionalFields = ["updated_at"];
                this.forExportFile = true;

                if (!includeDeleted) {
                  _context2.next = 6;
                  break;
                }

                return _context2.abrupt("return", this.__params());

              case 6:
                _context2.next = 8;
                return this.__params();

              case 8:
                result = _context2.sent;
                return _context2.abrupt("return", _.omit(result, ["deleted"]));

              case 10:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function paramsForExportFile(_x10) {
        return _ref2.apply(this, arguments);
      }

      return paramsForExportFile;
    }()
  }, {
    key: "paramsForExtension",
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                return _context3.abrupt("return", this.paramsForExportFile());

              case 1:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function paramsForExtension() {
        return _ref3.apply(this, arguments);
      }

      return paramsForExtension;
    }()
  }, {
    key: "paramsForLocalStorage",
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                this.additionalFields = ["updated_at", "dirty", "errorDecrypting"];
                this.forExportFile = true;
                return _context4.abrupt("return", this.__params());

              case 3:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function paramsForLocalStorage() {
        return _ref4.apply(this, arguments);
      }

      return paramsForLocalStorage;
    }()
  }, {
    key: "paramsForSync",
    value: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                return _context5.abrupt("return", this.__params());

              case 1:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function paramsForSync() {
        return _ref5.apply(this, arguments);
      }

      return paramsForSync;
    }()
  }, {
    key: "__params",
    value: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
        var params, doNotEncrypt, encryptedParams;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:

                console.assert(!this.item.dummy, "Item is dummy, should not have gotten here.", this.item.dummy);

                params = { uuid: this.item.uuid, content_type: this.item.content_type, deleted: this.item.deleted, created_at: this.item.created_at };

                if (this.item.errorDecrypting) {
                  _context6.next = 24;
                  break;
                }

                // Items should always be encrypted for export files. Only respect item.doNotEncrypt for remote sync params.
                doNotEncrypt = this.item.doNotEncrypt() && !this.forExportFile;

                if (!(this.keys && !doNotEncrypt)) {
                  _context6.next = 12;
                  break;
                }

                _context6.next = 7;
                return SFJS.itemTransformer.encryptItem(this.item, this.keys, this.version);

              case 7:
                encryptedParams = _context6.sent;

                _.merge(params, encryptedParams);

                if (this.version !== "001") {
                  params.auth_hash = null;
                }
                _context6.next = 22;
                break;

              case 12:
                if (!this.forExportFile) {
                  _context6.next = 16;
                  break;
                }

                _context6.t0 = this.item.createContentJSONFromProperties();
                _context6.next = 20;
                break;

              case 16:
                _context6.next = 18;
                return SFJS.crypto.base64(JSON.stringify(this.item.createContentJSONFromProperties()));

              case 18:
                _context6.t1 = _context6.sent;
                _context6.t0 = "000" + _context6.t1;

              case 20:
                params.content = _context6.t0;

                if (!this.forExportFile) {
                  params.enc_item_key = null;
                  params.auth_hash = null;
                }

              case 22:
                _context6.next = 27;
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

                return _context6.abrupt("return", params);

              case 29:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function __params() {
        return _ref6.apply(this, arguments);
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
    key: "generateUUIDSync",
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
    key: "decryptText",
    value: function () {
      var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
        var _ref8 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            ciphertextToAuth = _ref8.ciphertextToAuth,
            contentCiphertext = _ref8.contentCiphertext,
            encryptionKey = _ref8.encryptionKey,
            iv = _ref8.iv,
            authHash = _ref8.authHash,
            authKey = _ref8.authKey;

        var requiresAuth = arguments[1];
        var localAuthHash, keyData, ivData, decrypted;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                if (!(requiresAuth && !authHash)) {
                  _context7.next = 3;
                  break;
                }

                console.error("Auth hash is required.");
                return _context7.abrupt("return");

              case 3:
                if (!authHash) {
                  _context7.next = 10;
                  break;
                }

                _context7.next = 6;
                return this.hmac256(ciphertextToAuth, authKey);

              case 6:
                localAuthHash = _context7.sent;

                if (!(authHash !== localAuthHash)) {
                  _context7.next = 10;
                  break;
                }

                console.error("Auth hash does not match, returning null.");
                return _context7.abrupt("return", null);

              case 10:
                keyData = CryptoJS.enc.Hex.parse(encryptionKey);
                ivData = CryptoJS.enc.Hex.parse(iv || "");
                decrypted = CryptoJS.AES.decrypt(contentCiphertext, keyData, { iv: ivData, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
                return _context7.abrupt("return", decrypted.toString(CryptoJS.enc.Utf8));

              case 14:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function decryptText() {
        return _ref7.apply(this, arguments);
      }

      return decryptText;
    }()
  }, {
    key: "encryptText",
    value: function () {
      var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(text, key, iv) {
        var keyData, ivData, encrypted;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                keyData = CryptoJS.enc.Hex.parse(key);
                ivData = CryptoJS.enc.Hex.parse(iv || "");
                encrypted = CryptoJS.AES.encrypt(text, keyData, { iv: ivData, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
                return _context8.abrupt("return", encrypted.toString());

              case 4:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function encryptText(_x12, _x13, _x14) {
        return _ref9.apply(this, arguments);
      }

      return encryptText;
    }()
  }, {
    key: "generateRandomKey",
    value: function () {
      var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(bits) {
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                return _context9.abrupt("return", CryptoJS.lib.WordArray.random(bits / 8).toString());

              case 1:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function generateRandomKey(_x15) {
        return _ref10.apply(this, arguments);
      }

      return generateRandomKey;
    }()
  }, {
    key: "generateItemEncryptionKey",
    value: function () {
      var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
        var length, cost, salt, passphrase;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                // Generates a key that will be split in half, each being 256 bits. So total length will need to be 512.
                length = 512;
                cost = 1;
                _context10.next = 4;
                return this.generateRandomKey(length);

              case 4:
                salt = _context10.sent;
                _context10.next = 7;
                return this.generateRandomKey(length);

              case 7:
                passphrase = _context10.sent;
                return _context10.abrupt("return", this.pbkdf2(passphrase, salt, cost, length));

              case 9:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function generateItemEncryptionKey() {
        return _ref11.apply(this, arguments);
      }

      return generateItemEncryptionKey;
    }()
  }, {
    key: "firstHalfOfKey",
    value: function () {
      var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(key) {
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                return _context11.abrupt("return", key.substring(0, key.length / 2));

              case 1:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function firstHalfOfKey(_x16) {
        return _ref12.apply(this, arguments);
      }

      return firstHalfOfKey;
    }()
  }, {
    key: "secondHalfOfKey",
    value: function () {
      var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(key) {
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                return _context12.abrupt("return", key.substring(key.length / 2, key.length));

              case 1:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function secondHalfOfKey(_x17) {
        return _ref13.apply(this, arguments);
      }

      return secondHalfOfKey;
    }()
  }, {
    key: "base64",
    value: function () {
      var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(text) {
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                return _context13.abrupt("return", window.btoa(text));

              case 1:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function base64(_x18) {
        return _ref14.apply(this, arguments);
      }

      return base64;
    }()
  }, {
    key: "base64Decode",
    value: function () {
      var _ref15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14(base64String) {
        return regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                return _context14.abrupt("return", window.atob(base64String));

              case 1:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function base64Decode(_x19) {
        return _ref15.apply(this, arguments);
      }

      return base64Decode;
    }()
  }, {
    key: "sha256",
    value: function () {
      var _ref16 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15(text) {
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                return _context15.abrupt("return", CryptoJS.SHA256(text).toString());

              case 1:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function sha256(_x20) {
        return _ref16.apply(this, arguments);
      }

      return sha256;
    }()
  }, {
    key: "hmac256",
    value: function () {
      var _ref17 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(message, key) {
        var keyData, messageData, result;
        return regeneratorRuntime.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                keyData = CryptoJS.enc.Hex.parse(key);
                messageData = CryptoJS.enc.Utf8.parse(message);
                result = CryptoJS.HmacSHA256(messageData, keyData).toString();
                return _context16.abrupt("return", result);

              case 4:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee16, this);
      }));

      function hmac256(_x21, _x22) {
        return _ref17.apply(this, arguments);
      }

      return hmac256;
    }()
  }, {
    key: "generateSalt",
    value: function () {
      var _ref18 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17(identifier, version, cost, nonce) {
        var result;
        return regeneratorRuntime.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                _context17.next = 2;
                return this.sha256([identifier, "SF", version, cost, nonce].join(":"));

              case 2:
                result = _context17.sent;
                return _context17.abrupt("return", result);

              case 4:
              case "end":
                return _context17.stop();
            }
          }
        }, _callee17, this);
      }));

      function generateSalt(_x23, _x24, _x25, _x26) {
        return _ref18.apply(this, arguments);
      }

      return generateSalt;
    }()

    /** Generates two deterministic keys based on one input */

  }, {
    key: "generateSymmetricKeyPair",
    value: function () {
      var _ref19 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18() {
        var _ref20 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            password = _ref20.password,
            pw_salt = _ref20.pw_salt,
            pw_cost = _ref20.pw_cost;

        var output, outputLength, splitLength, firstThird, secondThird, thirdThird;
        return regeneratorRuntime.wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                _context18.next = 2;
                return this.pbkdf2(password, pw_salt, pw_cost, this.DefaultPBKDF2Length);

              case 2:
                output = _context18.sent;
                outputLength = output.length;
                splitLength = outputLength / 3;
                firstThird = output.slice(0, splitLength);
                secondThird = output.slice(splitLength, splitLength * 2);
                thirdThird = output.slice(splitLength * 2, splitLength * 3);
                return _context18.abrupt("return", [firstThird, secondThird, thirdThird]);

              case 9:
              case "end":
                return _context18.stop();
            }
          }
        }, _callee18, this);
      }));

      function generateSymmetricKeyPair() {
        return _ref19.apply(this, arguments);
      }

      return generateSymmetricKeyPair;
    }()
  }, {
    key: "computeEncryptionKeysForUser",
    value: function () {
      var _ref21 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19(password, authParams) {
        var pw_salt;
        return regeneratorRuntime.wrap(function _callee19$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
                if (!(authParams.version == "003")) {
                  _context19.next = 9;
                  break;
                }

                if (authParams.identifier) {
                  _context19.next = 4;
                  break;
                }

                console.error("authParams is missing identifier.");
                return _context19.abrupt("return");

              case 4:
                _context19.next = 6;
                return this.generateSalt(authParams.identifier, authParams.version, authParams.pw_cost, authParams.pw_nonce);

              case 6:
                pw_salt = _context19.sent;
                _context19.next = 10;
                break;

              case 9:
                // Salt is returned from server
                pw_salt = authParams.pw_salt;

              case 10:
                return _context19.abrupt("return", this.generateSymmetricKeyPair({ password: password, pw_salt: pw_salt, pw_cost: authParams.pw_cost }).then(function (keys) {
                  var userKeys = { pw: keys[0], mk: keys[1], ak: keys[2] };
                  return userKeys;
                }));

              case 11:
              case "end":
                return _context19.stop();
            }
          }
        }, _callee19, this);
      }));

      function computeEncryptionKeysForUser(_x28, _x29) {
        return _ref21.apply(this, arguments);
      }

      return computeEncryptionKeysForUser;
    }()

    // Unlike computeEncryptionKeysForUser, this method always uses the latest SF Version

  }, {
    key: "generateInitialKeysAndAuthParamsForUser",
    value: function () {
      var _ref22 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20(identifier, password) {
        var version, pw_cost, pw_nonce, pw_salt;
        return regeneratorRuntime.wrap(function _callee20$(_context20) {
          while (1) {
            switch (_context20.prev = _context20.next) {
              case 0:
                version = this.SFJS.version;
                pw_cost = this.SFJS.defaultPasswordGenerationCost;
                _context20.next = 4;
                return this.generateRandomKey(256);

              case 4:
                pw_nonce = _context20.sent;
                _context20.next = 7;
                return this.generateSalt(identifier, version, pw_cost, pw_nonce);

              case 7:
                pw_salt = _context20.sent;
                return _context20.abrupt("return", this.generateSymmetricKeyPair({ password: password, pw_salt: pw_salt, pw_cost: pw_cost }).then(function (keys) {
                  var authParams = { pw_nonce: pw_nonce, pw_cost: pw_cost, identifier: identifier, version: version };
                  var userKeys = { pw: keys[0], mk: keys[1], ak: keys[2] };
                  return { keys: userKeys, authParams: authParams };
                }));

              case 9:
              case "end":
                return _context20.stop();
            }
          }
        }, _callee20, this);
      }));

      function generateInitialKeysAndAuthParamsForUser(_x30, _x31) {
        return _ref22.apply(this, arguments);
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
      var _ref23 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21(password, pw_salt, pw_cost, length) {
        var params;
        return regeneratorRuntime.wrap(function _callee21$(_context21) {
          while (1) {
            switch (_context21.prev = _context21.next) {
              case 0:
                params = {
                  keySize: length / 32,
                  hasher: CryptoJS.algo.SHA512,
                  iterations: pw_cost
                };
                return _context21.abrupt("return", CryptoJS.PBKDF2(password, pw_salt, params).toString());

              case 2:
              case "end":
                return _context21.stop();
            }
          }
        }, _callee21, this);
      }));

      function pbkdf2(_x32, _x33, _x34, _x35) {
        return _ref23.apply(this, arguments);
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
    key: "pbkdf2",


    /**
    Public
    */

    value: function () {
      var _ref24 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee22(password, pw_salt, pw_cost, length) {
        var key;
        return regeneratorRuntime.wrap(function _callee22$(_context22) {
          while (1) {
            switch (_context22.prev = _context22.next) {
              case 0:
                _context22.next = 2;
                return this.webCryptoImportKey(password, "PBKDF2", "deriveBits");

              case 2:
                key = _context22.sent;

                if (key) {
                  _context22.next = 6;
                  break;
                }

                console.log("Key is null, unable to continue");
                return _context22.abrupt("return", null);

              case 6:
                return _context22.abrupt("return", this.webCryptoDeriveBits(key, pw_salt, pw_cost, length));

              case 7:
              case "end":
                return _context22.stop();
            }
          }
        }, _callee22, this);
      }));

      function pbkdf2(_x36, _x37, _x38, _x39) {
        return _ref24.apply(this, arguments);
      }

      return pbkdf2;
    }()
  }, {
    key: "generateRandomKey",
    value: function () {
      var _ref25 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee23(bits) {
        var _this4 = this;

        var extractable;
        return regeneratorRuntime.wrap(function _callee23$(_context23) {
          while (1) {
            switch (_context23.prev = _context23.next) {
              case 0:
                extractable = true;
                return _context23.abrupt("return", subtleCrypto.generateKey({ name: "AES-CBC", length: bits }, extractable, ["encrypt", "decrypt"]).then(function (keyObject) {
                  return subtleCrypto.exportKey("raw", keyObject).then(function (keyData) {
                    var key = _this4.arrayBufferToHexString(new Uint8Array(keyData));
                    return key;
                  }).catch(function (err) {
                    console.error("Error exporting key", err);
                  });
                }).catch(function (err) {
                  console.error("Error generating key", err);
                }));

              case 2:
              case "end":
                return _context23.stop();
            }
          }
        }, _callee23, this);
      }));

      function generateRandomKey(_x40) {
        return _ref25.apply(this, arguments);
      }

      return generateRandomKey;
    }()
  }, {
    key: "generateItemEncryptionKey",
    value: function () {
      var _ref26 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee24() {
        var length;
        return regeneratorRuntime.wrap(function _callee24$(_context24) {
          while (1) {
            switch (_context24.prev = _context24.next) {
              case 0:
                // Generates a key that will be split in half, each being 256 bits. So total length will need to be 512.
                length = 256;
                return _context24.abrupt("return", Promise.all([this.generateRandomKey(length), this.generateRandomKey(length)]).then(function (values) {
                  return values.join("");
                }));

              case 2:
              case "end":
                return _context24.stop();
            }
          }
        }, _callee24, this);
      }));

      function generateItemEncryptionKey() {
        return _ref26.apply(this, arguments);
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
    key: "webCryptoImportKey",
    value: function () {
      var _ref27 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee25(input, alg, action) {
        var text;
        return regeneratorRuntime.wrap(function _callee25$(_context25) {
          while (1) {
            switch (_context25.prev = _context25.next) {
              case 0:
                text = typeof input === "string" ? this.stringToArrayBuffer(input) : input;
                return _context25.abrupt("return", subtleCrypto.importKey("raw", text, { name: alg }, false, [action]).then(function (key) {
                  return key;
                }).catch(function (err) {
                  console.error(err);
                  return null;
                }));

              case 2:
              case "end":
                return _context25.stop();
            }
          }
        }, _callee25, this);
      }));

      function webCryptoImportKey(_x41, _x42, _x43) {
        return _ref27.apply(this, arguments);
      }

      return webCryptoImportKey;
    }()
  }, {
    key: "webCryptoDeriveBits",
    value: function () {
      var _ref28 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee26(key, pw_salt, pw_cost, length) {
        var _this5 = this;

        var params;
        return regeneratorRuntime.wrap(function _callee26$(_context26) {
          while (1) {
            switch (_context26.prev = _context26.next) {
              case 0:
                params = {
                  "name": "PBKDF2",
                  salt: this.stringToArrayBuffer(pw_salt),
                  iterations: pw_cost,
                  hash: { name: "SHA-512" }
                };
                return _context26.abrupt("return", subtleCrypto.deriveBits(params, key, length).then(function (bits) {
                  var key = _this5.arrayBufferToHexString(new Uint8Array(bits));
                  return key;
                }).catch(function (err) {
                  console.error(err);
                  return null;
                }));

              case 2:
              case "end":
                return _context26.stop();
            }
          }
        }, _callee26, this);
      }));

      function webCryptoDeriveBits(_x44, _x45, _x46, _x47) {
        return _ref28.apply(this, arguments);
      }

      return webCryptoDeriveBits;
    }()
  }, {
    key: "stringToArrayBuffer",
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
    key: "arrayBufferToHexString",
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
    key: "hexStringToArrayBuffer",
    value: function hexStringToArrayBuffer(hex) {
      for (var bytes = [], c = 0; c < hex.length; c += 2) {
        bytes.push(parseInt(hex.substr(c, 2), 16));
      }return new Uint8Array(bytes);
    }
  }, {
    key: "arrayBufferToBase64",
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
    key: "_private_encryptString",
    value: function () {
      var _ref29 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee27(string, encryptionKey, authKey, uuid, version) {
        var fullCiphertext, contentCiphertext, iv, ciphertextToAuth, authHash;
        return regeneratorRuntime.wrap(function _callee27$(_context27) {
          while (1) {
            switch (_context27.prev = _context27.next) {
              case 0:
                if (!(version === "001")) {
                  _context27.next = 7;
                  break;
                }

                _context27.next = 3;
                return this.crypto.encryptText(string, encryptionKey, null);

              case 3:
                contentCiphertext = _context27.sent;

                fullCiphertext = version + contentCiphertext;
                _context27.next = 18;
                break;

              case 7:
                _context27.next = 9;
                return this.crypto.generateRandomKey(128);

              case 9:
                iv = _context27.sent;
                _context27.next = 12;
                return this.crypto.encryptText(string, encryptionKey, iv);

              case 12:
                contentCiphertext = _context27.sent;
                ciphertextToAuth = [version, uuid, iv, contentCiphertext].join(":");
                _context27.next = 16;
                return this.crypto.hmac256(ciphertextToAuth, authKey);

              case 16:
                authHash = _context27.sent;

                fullCiphertext = [version, authHash, uuid, iv, contentCiphertext].join(":");

              case 18:
                return _context27.abrupt("return", fullCiphertext);

              case 19:
              case "end":
                return _context27.stop();
            }
          }
        }, _callee27, this);
      }));

      function _private_encryptString(_x48, _x49, _x50, _x51, _x52) {
        return _ref29.apply(this, arguments);
      }

      return _private_encryptString;
    }()
  }, {
    key: "encryptItem",
    value: function () {
      var _ref30 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee28(item, keys) {
        var version = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "003";
        var params, item_key, ek, ak, ciphertext, authHash;
        return regeneratorRuntime.wrap(function _callee28$(_context28) {
          while (1) {
            switch (_context28.prev = _context28.next) {
              case 0:
                params = {};
                // encrypt item key

                _context28.next = 3;
                return this.crypto.generateItemEncryptionKey();

              case 3:
                item_key = _context28.sent;

                if (!(version === "001")) {
                  _context28.next = 10;
                  break;
                }

                _context28.next = 7;
                return this.crypto.encryptText(item_key, keys.mk, null);

              case 7:
                params.enc_item_key = _context28.sent;
                _context28.next = 13;
                break;

              case 10:
                _context28.next = 12;
                return this._private_encryptString(item_key, keys.mk, keys.ak, item.uuid, version);

              case 12:
                params.enc_item_key = _context28.sent;

              case 13:
                _context28.next = 15;
                return this.crypto.firstHalfOfKey(item_key);

              case 15:
                ek = _context28.sent;
                _context28.next = 18;
                return this.crypto.secondHalfOfKey(item_key);

              case 18:
                ak = _context28.sent;
                _context28.next = 21;
                return this._private_encryptString(JSON.stringify(item.createContentJSONFromProperties()), ek, ak, item.uuid, version);

              case 21:
                ciphertext = _context28.sent;

                if (!(version === "001")) {
                  _context28.next = 27;
                  break;
                }

                _context28.next = 25;
                return this.crypto.hmac256(ciphertext, ak);

              case 25:
                authHash = _context28.sent;

                params.auth_hash = authHash;

              case 27:

                params.content = ciphertext;
                return _context28.abrupt("return", params);

              case 29:
              case "end":
                return _context28.stop();
            }
          }
        }, _callee28, this);
      }));

      function encryptItem(_x54, _x55) {
        return _ref30.apply(this, arguments);
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
          ciphertextToAuth: [components[0], components[2], components[3], components[4]].join(":"),
          encryptionKey: encryptionKey,
          authKey: authKey
        };
      }
    }
  }, {
    key: "decryptItem",
    value: function () {
      var _ref31 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee29(item, keys) {
        var encryptedItemKey, requiresAuth, keyParams, item_key, ek, ak, itemParams, content;
        return regeneratorRuntime.wrap(function _callee29$(_context29) {
          while (1) {
            switch (_context29.prev = _context29.next) {
              case 0:
                if (!(typeof item.content != "string")) {
                  _context29.next = 2;
                  break;
                }

                return _context29.abrupt("return");

              case 2:
                if (!item.content.startsWith("000")) {
                  _context29.next = 14;
                  break;
                }

                _context29.prev = 3;
                _context29.t0 = JSON;
                _context29.next = 7;
                return this.crypto.base64Decode(item.content.substring(3, item.content.length));

              case 7:
                _context29.t1 = _context29.sent;
                item.content = _context29.t0.parse.call(_context29.t0, _context29.t1);
                _context29.next = 13;
                break;

              case 11:
                _context29.prev = 11;
                _context29.t2 = _context29["catch"](3);

              case 13:
                return _context29.abrupt("return");

              case 14:
                if (item.enc_item_key) {
                  _context29.next = 17;
                  break;
                }

                // This needs to be here to continue, return otherwise
                console.log("Missing item encryption key, skipping decryption.");
                return _context29.abrupt("return");

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
                  _context29.next = 26;
                  break;
                }

                console.error("Item key params UUID does not match item UUID");
                if (!item.errorDecrypting) {
                  item.errorDecryptingValueChanged = true;
                }
                item.errorDecrypting = true;
                return _context29.abrupt("return");

              case 26:
                _context29.next = 28;
                return this.crypto.decryptText(keyParams, requiresAuth);

              case 28:
                item_key = _context29.sent;

                if (item_key) {
                  _context29.next = 33;
                  break;
                }

                if (!item.errorDecrypting) {
                  item.errorDecryptingValueChanged = true;
                }
                item.errorDecrypting = true;
                return _context29.abrupt("return");

              case 33:
                _context29.next = 35;
                return this.crypto.firstHalfOfKey(item_key);

              case 35:
                ek = _context29.sent;
                _context29.next = 38;
                return this.crypto.secondHalfOfKey(item_key);

              case 38:
                ak = _context29.sent;
                itemParams = this.encryptionComponentsFromString(item.content, ek, ak);

                // return if uuid in auth hash does not match item uuid. Signs of tampering.

                if (!(itemParams.uuid && itemParams.uuid !== item.uuid)) {
                  _context29.next = 44;
                  break;
                }

                if (!item.errorDecrypting) {
                  item.errorDecryptingValueChanged = true;
                }
                item.errorDecrypting = true;
                return _context29.abrupt("return");

              case 44:

                if (!itemParams.authHash) {
                  // legacy 001
                  itemParams.authHash = item.auth_hash;
                }

                _context29.next = 47;
                return this.crypto.decryptText(itemParams, true);

              case 47:
                content = _context29.sent;

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
              case "end":
                return _context29.stop();
            }
          }
        }, _callee29, this, [[3, 11]]);
      }));

      function decryptItem(_x56, _x57) {
        return _ref31.apply(this, arguments);
      }

      return decryptItem;
    }()
  }, {
    key: "decryptMultipleItems",
    value: function () {
      var _ref32 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee31(items, keys, throws) {
        var _this6 = this;

        var decrypt;
        return regeneratorRuntime.wrap(function _callee31$(_context31) {
          while (1) {
            switch (_context31.prev = _context31.next) {
              case 0:
                decrypt = function () {
                  var _ref33 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee30(item) {
                    var isString;
                    return regeneratorRuntime.wrap(function _callee30$(_context30) {
                      while (1) {
                        switch (_context30.prev = _context30.next) {
                          case 0:
                            if (!(item.deleted == true && item.content == null)) {
                              _context30.next = 2;
                              break;
                            }

                            return _context30.abrupt("return");

                          case 2:
                            isString = typeof item.content === 'string' || item.content instanceof String;

                            if (!isString) {
                              _context30.next = 17;
                              break;
                            }

                            _context30.prev = 4;
                            _context30.next = 7;
                            return _this6.decryptItem(item, keys);

                          case 7:
                            _context30.next = 17;
                            break;

                          case 9:
                            _context30.prev = 9;
                            _context30.t0 = _context30["catch"](4);

                            if (!item.errorDecrypting) {
                              item.errorDecryptingValueChanged = true;
                            }
                            item.errorDecrypting = true;

                            if (!throws) {
                              _context30.next = 15;
                              break;
                            }

                            throw _context30.t0;

                          case 15:
                            console.error("Error decrypting item", item, _context30.t0);
                            return _context30.abrupt("return");

                          case 17:
                          case "end":
                            return _context30.stop();
                        }
                      }
                    }, _callee30, _this6, [[4, 9]]);
                  }));

                  return function decrypt(_x61) {
                    return _ref33.apply(this, arguments);
                  };
                }();

                return _context31.abrupt("return", Promise.all(items.map(function (item) {
                  return decrypt(item);
                })));

              case 2:
              case "end":
                return _context31.stop();
            }
          }
        }, _callee31, this);
      }));

      function decryptMultipleItems(_x58, _x59, _x60) {
        return _ref32.apply(this, arguments);
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
  } catch (e) {
    console.log("Exception while exporting window variables", e);
  }
}
//# sourceMappingURL=transpiled.js.map
