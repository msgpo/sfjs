class StandardFile {
  constructor() {
    // detect IE8 and above, and edge.
    // IE and Edge do not support pbkdf2 in WebCrypto, therefore we need to use CryptoJS
    var IEOrEdge = document.documentMode || /Edge/.test(navigator.userAgent);

    if(!IEOrEdge && (window.crypto && window.crypto.subtle)) {
      this.crypto = new SFCryptoWeb();
    } else {
      this.crypto = new SFCryptoJS();
    }
  }
}

window.StandardFile = StandardFile;
window.SFJS = new StandardFile()
