var subtleCrypto = window.crypto ? window.crypto.subtle : null;

export class SFCryptoWeb extends SFAbstractCrypto {

  /**
  Internal
  */

  async pbkdf2(password, pw_salt, pw_cost, length) {
    if(!length) { length = this.DefaultPBKDF2Length; }

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

  async webCryptoDeriveBits({key, pw_salt, pw_cost, length} = {}) {
    var params = {
      "name": "PBKDF2",
      salt: this.stringToArrayBuffer(pw_salt),
      iterations: pw_cost,
      hash: {name: "SHA-512"},
    }

    return subtleCrypto.deriveBits(params, key, length)
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
