const subtleCrypto = (typeof window !== 'undefined' && window.crypto) ? window.crypto.subtle : null;

export class SFCryptoWeb extends SFAbstractCrypto {

  /**
  Public
  */

  async pbkdf2(password, pw_salt, pw_cost, length) {
    var key = await this.webCryptoImportKey(password, "PBKDF2", "deriveBits");
    if(!key) {
      console.log("Key is null, unable to continue");
      return null;
    }

    return this.webCryptoDeriveBits(key, pw_salt, pw_cost, length);
  }

  async generateRandomKey(bits) {
    let extractable = true;
    return subtleCrypto.generateKey({name: "AES-CBC", length: bits}, extractable, ["encrypt", "decrypt"]).then((keyObject) => {
      return subtleCrypto.exportKey("raw", keyObject).then((keyData) => {
        var key = this.arrayBufferToHexString(new Uint8Array(keyData));
        return key;
      })
      .catch((err) => {
        console.error("Error exporting key", err);
      });
    })
    .catch((err) => {
      console.error("Error generating key", err);
    });
  }

  async generateItemEncryptionKey() {
    // Generates a key that will be split in half, each being 256 bits. So total length will need to be 512.
    var length = 256;
    return Promise.all([
      this.generateRandomKey(length),
      this.generateRandomKey(length)
    ]).then((values) => {
      return values.join("");
    });
  }

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

  async webCryptoImportKey(input, alg, action) {
    var text = typeof input === "string" ? this.stringToArrayBuffer(input) : input;
    return subtleCrypto.importKey("raw", text, { name: alg }, false, [action])
    .then((key) => {
      return key;
    })
    .catch((err) => {
      console.error(err);
      return null;
    });
  }

  async webCryptoDeriveBits(key, pw_salt, pw_cost, length) {
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
      if(nextHexByte.length < 2) {
        nextHexByte = "0" + nextHexByte;
      }
      hexString += nextHexByte;
    }
    return hexString;
  }

  hexStringToArrayBuffer(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
    return new Uint8Array(bytes);
  }

  arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
  }

}
