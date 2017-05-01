(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SFTest = function () {
  function SFTest() {
    _classCallCheck(this, SFTest);
  }

  _createClass(SFTest, [{
    key: "decryptFiles",
    value: function decryptFiles(files, completion) {

      var mk = "<master key>";
      var keys = SFJS.crypto.generateKeysFromMasterKey(mk);

      var index = 0;
      var processedData = [];

      var readNext = function () {
        var file = files[index];
        index++;
        var reader = new FileReader();

        reader.onload = function (e) {

          var data = JSON.parse(e.target.result);

          // decrypt data
          console.log(data);

          SFItemTransformer.decryptItem(data, keys);
          console.log("Decrypted", data);

          var item = new Item(data);
          console.log("Item:", item);

          if (index < files.length) {
            readNext();
          } else {
            completion({ items: processedData });
          }
        }.bind(this);
        reader.readAsText(file);
      }.bind(this);

      readNext();
    }
  }]);

  return SFTest;
}();

window.SFTest = new SFTest();


},{}]},{},[1]);
