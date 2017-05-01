class SFItemTransformer {

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
