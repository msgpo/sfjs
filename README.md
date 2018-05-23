SFJS is a client-side JavaScript library for [Standard File](https://standardfile.org) that handles user key generation and item encryption/decryption.

This library can be used in any JavaScript environment, including web, desktop, native, and mobile (via [React Native](https://github.com/standardnotes/mobile/blob/master/src/lib/sfjs.js)).

## Installation

`npm install --save standard-file-js`

## Integrating in a web app

1. Import these two files in your page, either via a packager like Grunt or Webpack, or via regular HTML script tags:

```
<script src="regenerator.js"></script>
<script src="sfjs.js"></script>
```

(`regenerator.js` is only required in web environments. If in native environment, install the package independently via `npm install --save regenerator-runtime` and include it in your build.)

## Usage

On the web, `SFJS` will be available as a global window variable accessible via `window.SFJS` or just `SFJS`.

If in a module environment, you can import it via:

```
import { StandardFile } from 'standard-file-js';
let SFJS = new StandardFile();
```

### Generating keys for user

#### New user (registration):

```
SFJS.generateInitialKeysAndAuthParamsForUser(email, password).then((results) => {
	let keys  = results.keys;
	let authParams = results.authParams;

	let serverPassword = keys.pw;
	let encryptionKey = keys.mk;
	let authenticationKey = keys.ak;
});
```

#### Existing user (sign in):

```
let authParams = getPreviouslyCreatedAuthParams();
SFJS.computeEncryptionKeysForUser(password, authParams).then((keys) => {
	let serverPassword = keys.pw;
	let encryptionKey = keys.mk;
	let authenticationKey = keys.ak;
});
```

#### Key descriptions:
`pw`: sent to the server for authentication.
`mk`: encrypts and decrypts items. Never sent to the server.
`ak`: authenticates the encryption and decryption of items. Never sent to the server.

### Encrypting and decrypting items

Note that the Item class is not yet included in SFJS. You must create your own Item class. You can also use the Item class from the [Standard Notes implementation](https://github.com/standardnotes/web/blob/master/app/assets/javascripts/app/models/api/item.js)._

Use `SFJS.itemTransformer` to encrypt and decrypt items.

#### Encrypt:

```
let keys = getKeys(); // keys is a hash which should have properties mk and ak.
SFJS.itemTransformer.encryptItem(item, keys).then(() => {
 // item.content is now encrypted
})
```

#### Decrypt:

```
let keys = getKeys(); // keys is a hash which should have properties mk and ak.
SFJS.itemTransformer.decryptItem(item, keys).then(() => {
 // item.content is now decrypted
})
```

## Notes
- SFJS uses an asynchronous API. All functions are asynchronous, and return immediately even if they have not finished. Add `.then()` to every call to be notified of the result, or use `await` if you don't want to use callbacks.
- SFJS handles key generation and encryption, but there's two other parts of the [Standard File](https://standardfile.org) specification that this library does not handle: model management, and server communication/syncing.
	- Model management relates to resolving relationships between items, handling deletions, and mapping items to and from the server.
	- Server communication relates to signing in, registering, and syncing items back and forth.

	You can study the source code of Standard Notes' [model management class](https://github.com/standardnotes/web/blob/master/app/assets/javascripts/app/services/modelManager.js), [syncing class](https://github.com/standardnotes/web/blob/master/app/assets/javascripts/app/services/syncManager.js), and [authentication class](https://github.com/standardnotes/web/blob/master/app/assets/javascripts/app/services/authManager.js) to get a better idea of how to do this inside your own app. In the future, this functionality will be bundled into a complete Standard File library.

## Help
Join the #dev channel in [our Slack group](https://standardnotes.org/slack) for help and discussion.
