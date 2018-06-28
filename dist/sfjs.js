(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.SF = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS=CryptoJS||function(u,p){var d={},l=d.lib={},s=function(){},t=l.Base={extend:function(a){s.prototype=this;var c=new s;a&&c.mixIn(a);c.hasOwnProperty("init")||(c.init=function(){c.$super.init.apply(this,arguments)});c.init.prototype=c;c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}},
r=l.WordArray=t.extend({init:function(a,c){a=this.words=a||[];this.sigBytes=c!=p?c:4*a.length},toString:function(a){return(a||v).stringify(this)},concat:function(a){var c=this.words,e=a.words,j=this.sigBytes;a=a.sigBytes;this.clamp();if(j%4)for(var k=0;k<a;k++)c[j+k>>>2]|=(e[k>>>2]>>>24-8*(k%4)&255)<<24-8*((j+k)%4);else if(65535<e.length)for(k=0;k<a;k+=4)c[j+k>>>2]=e[k>>>2];else c.push.apply(c,e);this.sigBytes+=a;return this},clamp:function(){var a=this.words,c=this.sigBytes;a[c>>>2]&=4294967295<<
32-8*(c%4);a.length=u.ceil(c/4)},clone:function(){var a=t.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var c=[],e=0;e<a;e+=4)c.push(4294967296*u.random()|0);return new r.init(c,a)}}),w=d.enc={},v=w.Hex={stringify:function(a){var c=a.words;a=a.sigBytes;for(var e=[],j=0;j<a;j++){var k=c[j>>>2]>>>24-8*(j%4)&255;e.push((k>>>4).toString(16));e.push((k&15).toString(16))}return e.join("")},parse:function(a){for(var c=a.length,e=[],j=0;j<c;j+=2)e[j>>>3]|=parseInt(a.substr(j,
2),16)<<24-4*(j%8);return new r.init(e,c/2)}},b=w.Latin1={stringify:function(a){var c=a.words;a=a.sigBytes;for(var e=[],j=0;j<a;j++)e.push(String.fromCharCode(c[j>>>2]>>>24-8*(j%4)&255));return e.join("")},parse:function(a){for(var c=a.length,e=[],j=0;j<c;j++)e[j>>>2]|=(a.charCodeAt(j)&255)<<24-8*(j%4);return new r.init(e,c)}},x=w.Utf8={stringify:function(a){try{return decodeURIComponent(escape(b.stringify(a)))}catch(c){throw Error("Malformed UTF-8 data");}},parse:function(a){return b.parse(unescape(encodeURIComponent(a)))}},
q=l.BufferedBlockAlgorithm=t.extend({reset:function(){this._data=new r.init;this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=x.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var c=this._data,e=c.words,j=c.sigBytes,k=this.blockSize,b=j/(4*k),b=a?u.ceil(b):u.max((b|0)-this._minBufferSize,0);a=b*k;j=u.min(4*a,j);if(a){for(var q=0;q<a;q+=k)this._doProcessBlock(e,q);q=e.splice(0,a);c.sigBytes-=j}return new r.init(q,j)},clone:function(){var a=t.clone.call(this);
a._data=this._data.clone();return a},_minBufferSize:0});l.Hasher=q.extend({cfg:t.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){q.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(b,e){return(new a.init(e)).finalize(b)}},_createHmacHelper:function(a){return function(b,e){return(new n.HMAC.init(a,
e)).finalize(b)}}});var n=d.algo={};return d}(Math);
(function(){var u=CryptoJS,p=u.lib.WordArray;u.enc.Base64={stringify:function(d){var l=d.words,p=d.sigBytes,t=this._map;d.clamp();d=[];for(var r=0;r<p;r+=3)for(var w=(l[r>>>2]>>>24-8*(r%4)&255)<<16|(l[r+1>>>2]>>>24-8*((r+1)%4)&255)<<8|l[r+2>>>2]>>>24-8*((r+2)%4)&255,v=0;4>v&&r+0.75*v<p;v++)d.push(t.charAt(w>>>6*(3-v)&63));if(l=t.charAt(64))for(;d.length%4;)d.push(l);return d.join("")},parse:function(d){var l=d.length,s=this._map,t=s.charAt(64);t&&(t=d.indexOf(t),-1!=t&&(l=t));for(var t=[],r=0,w=0;w<
l;w++)if(w%4){var v=s.indexOf(d.charAt(w-1))<<2*(w%4),b=s.indexOf(d.charAt(w))>>>6-2*(w%4);t[r>>>2]|=(v|b)<<24-8*(r%4);r++}return p.create(t,r)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}})();
(function(u){function p(b,n,a,c,e,j,k){b=b+(n&a|~n&c)+e+k;return(b<<j|b>>>32-j)+n}function d(b,n,a,c,e,j,k){b=b+(n&c|a&~c)+e+k;return(b<<j|b>>>32-j)+n}function l(b,n,a,c,e,j,k){b=b+(n^a^c)+e+k;return(b<<j|b>>>32-j)+n}function s(b,n,a,c,e,j,k){b=b+(a^(n|~c))+e+k;return(b<<j|b>>>32-j)+n}for(var t=CryptoJS,r=t.lib,w=r.WordArray,v=r.Hasher,r=t.algo,b=[],x=0;64>x;x++)b[x]=4294967296*u.abs(u.sin(x+1))|0;r=r.MD5=v.extend({_doReset:function(){this._hash=new w.init([1732584193,4023233417,2562383102,271733878])},
_doProcessBlock:function(q,n){for(var a=0;16>a;a++){var c=n+a,e=q[c];q[c]=(e<<8|e>>>24)&16711935|(e<<24|e>>>8)&4278255360}var a=this._hash.words,c=q[n+0],e=q[n+1],j=q[n+2],k=q[n+3],z=q[n+4],r=q[n+5],t=q[n+6],w=q[n+7],v=q[n+8],A=q[n+9],B=q[n+10],C=q[n+11],u=q[n+12],D=q[n+13],E=q[n+14],x=q[n+15],f=a[0],m=a[1],g=a[2],h=a[3],f=p(f,m,g,h,c,7,b[0]),h=p(h,f,m,g,e,12,b[1]),g=p(g,h,f,m,j,17,b[2]),m=p(m,g,h,f,k,22,b[3]),f=p(f,m,g,h,z,7,b[4]),h=p(h,f,m,g,r,12,b[5]),g=p(g,h,f,m,t,17,b[6]),m=p(m,g,h,f,w,22,b[7]),
f=p(f,m,g,h,v,7,b[8]),h=p(h,f,m,g,A,12,b[9]),g=p(g,h,f,m,B,17,b[10]),m=p(m,g,h,f,C,22,b[11]),f=p(f,m,g,h,u,7,b[12]),h=p(h,f,m,g,D,12,b[13]),g=p(g,h,f,m,E,17,b[14]),m=p(m,g,h,f,x,22,b[15]),f=d(f,m,g,h,e,5,b[16]),h=d(h,f,m,g,t,9,b[17]),g=d(g,h,f,m,C,14,b[18]),m=d(m,g,h,f,c,20,b[19]),f=d(f,m,g,h,r,5,b[20]),h=d(h,f,m,g,B,9,b[21]),g=d(g,h,f,m,x,14,b[22]),m=d(m,g,h,f,z,20,b[23]),f=d(f,m,g,h,A,5,b[24]),h=d(h,f,m,g,E,9,b[25]),g=d(g,h,f,m,k,14,b[26]),m=d(m,g,h,f,v,20,b[27]),f=d(f,m,g,h,D,5,b[28]),h=d(h,f,
m,g,j,9,b[29]),g=d(g,h,f,m,w,14,b[30]),m=d(m,g,h,f,u,20,b[31]),f=l(f,m,g,h,r,4,b[32]),h=l(h,f,m,g,v,11,b[33]),g=l(g,h,f,m,C,16,b[34]),m=l(m,g,h,f,E,23,b[35]),f=l(f,m,g,h,e,4,b[36]),h=l(h,f,m,g,z,11,b[37]),g=l(g,h,f,m,w,16,b[38]),m=l(m,g,h,f,B,23,b[39]),f=l(f,m,g,h,D,4,b[40]),h=l(h,f,m,g,c,11,b[41]),g=l(g,h,f,m,k,16,b[42]),m=l(m,g,h,f,t,23,b[43]),f=l(f,m,g,h,A,4,b[44]),h=l(h,f,m,g,u,11,b[45]),g=l(g,h,f,m,x,16,b[46]),m=l(m,g,h,f,j,23,b[47]),f=s(f,m,g,h,c,6,b[48]),h=s(h,f,m,g,w,10,b[49]),g=s(g,h,f,m,
E,15,b[50]),m=s(m,g,h,f,r,21,b[51]),f=s(f,m,g,h,u,6,b[52]),h=s(h,f,m,g,k,10,b[53]),g=s(g,h,f,m,B,15,b[54]),m=s(m,g,h,f,e,21,b[55]),f=s(f,m,g,h,v,6,b[56]),h=s(h,f,m,g,x,10,b[57]),g=s(g,h,f,m,t,15,b[58]),m=s(m,g,h,f,D,21,b[59]),f=s(f,m,g,h,z,6,b[60]),h=s(h,f,m,g,C,10,b[61]),g=s(g,h,f,m,j,15,b[62]),m=s(m,g,h,f,A,21,b[63]);a[0]=a[0]+f|0;a[1]=a[1]+m|0;a[2]=a[2]+g|0;a[3]=a[3]+h|0},_doFinalize:function(){var b=this._data,n=b.words,a=8*this._nDataBytes,c=8*b.sigBytes;n[c>>>5]|=128<<24-c%32;var e=u.floor(a/
4294967296);n[(c+64>>>9<<4)+15]=(e<<8|e>>>24)&16711935|(e<<24|e>>>8)&4278255360;n[(c+64>>>9<<4)+14]=(a<<8|a>>>24)&16711935|(a<<24|a>>>8)&4278255360;b.sigBytes=4*(n.length+1);this._process();b=this._hash;n=b.words;for(a=0;4>a;a++)c=n[a],n[a]=(c<<8|c>>>24)&16711935|(c<<24|c>>>8)&4278255360;return b},clone:function(){var b=v.clone.call(this);b._hash=this._hash.clone();return b}});t.MD5=v._createHelper(r);t.HmacMD5=v._createHmacHelper(r)})(Math);
(function(){var u=CryptoJS,p=u.lib,d=p.Base,l=p.WordArray,p=u.algo,s=p.EvpKDF=d.extend({cfg:d.extend({keySize:4,hasher:p.MD5,iterations:1}),init:function(d){this.cfg=this.cfg.extend(d)},compute:function(d,r){for(var p=this.cfg,s=p.hasher.create(),b=l.create(),u=b.words,q=p.keySize,p=p.iterations;u.length<q;){n&&s.update(n);var n=s.update(d).finalize(r);s.reset();for(var a=1;a<p;a++)n=s.finalize(n),s.reset();b.concat(n)}b.sigBytes=4*q;return b}});u.EvpKDF=function(d,l,p){return s.create(p).compute(d,
l)}})();
CryptoJS.lib.Cipher||function(u){var p=CryptoJS,d=p.lib,l=d.Base,s=d.WordArray,t=d.BufferedBlockAlgorithm,r=p.enc.Base64,w=p.algo.EvpKDF,v=d.Cipher=t.extend({cfg:l.extend(),createEncryptor:function(e,a){return this.create(this._ENC_XFORM_MODE,e,a)},createDecryptor:function(e,a){return this.create(this._DEC_XFORM_MODE,e,a)},init:function(e,a,b){this.cfg=this.cfg.extend(b);this._xformMode=e;this._key=a;this.reset()},reset:function(){t.reset.call(this);this._doReset()},process:function(e){this._append(e);return this._process()},
finalize:function(e){e&&this._append(e);return this._doFinalize()},keySize:4,ivSize:4,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:function(e){return{encrypt:function(b,k,d){return("string"==typeof k?c:a).encrypt(e,b,k,d)},decrypt:function(b,k,d){return("string"==typeof k?c:a).decrypt(e,b,k,d)}}}});d.StreamCipher=v.extend({_doFinalize:function(){return this._process(!0)},blockSize:1});var b=p.mode={},x=function(e,a,b){var c=this._iv;c?this._iv=u:c=this._prevBlock;for(var d=0;d<b;d++)e[a+d]^=
c[d]},q=(d.BlockCipherMode=l.extend({createEncryptor:function(e,a){return this.Encryptor.create(e,a)},createDecryptor:function(e,a){return this.Decryptor.create(e,a)},init:function(e,a){this._cipher=e;this._iv=a}})).extend();q.Encryptor=q.extend({processBlock:function(e,a){var b=this._cipher,c=b.blockSize;x.call(this,e,a,c);b.encryptBlock(e,a);this._prevBlock=e.slice(a,a+c)}});q.Decryptor=q.extend({processBlock:function(e,a){var b=this._cipher,c=b.blockSize,d=e.slice(a,a+c);b.decryptBlock(e,a);x.call(this,
e,a,c);this._prevBlock=d}});b=b.CBC=q;q=(p.pad={}).Pkcs7={pad:function(a,b){for(var c=4*b,c=c-a.sigBytes%c,d=c<<24|c<<16|c<<8|c,l=[],n=0;n<c;n+=4)l.push(d);c=s.create(l,c);a.concat(c)},unpad:function(a){a.sigBytes-=a.words[a.sigBytes-1>>>2]&255}};d.BlockCipher=v.extend({cfg:v.cfg.extend({mode:b,padding:q}),reset:function(){v.reset.call(this);var a=this.cfg,b=a.iv,a=a.mode;if(this._xformMode==this._ENC_XFORM_MODE)var c=a.createEncryptor;else c=a.createDecryptor,this._minBufferSize=1;this._mode=c.call(a,
this,b&&b.words)},_doProcessBlock:function(a,b){this._mode.processBlock(a,b)},_doFinalize:function(){var a=this.cfg.padding;if(this._xformMode==this._ENC_XFORM_MODE){a.pad(this._data,this.blockSize);var b=this._process(!0)}else b=this._process(!0),a.unpad(b);return b},blockSize:4});var n=d.CipherParams=l.extend({init:function(a){this.mixIn(a)},toString:function(a){return(a||this.formatter).stringify(this)}}),b=(p.format={}).OpenSSL={stringify:function(a){var b=a.ciphertext;a=a.salt;return(a?s.create([1398893684,
1701076831]).concat(a).concat(b):b).toString(r)},parse:function(a){a=r.parse(a);var b=a.words;if(1398893684==b[0]&&1701076831==b[1]){var c=s.create(b.slice(2,4));b.splice(0,4);a.sigBytes-=16}return n.create({ciphertext:a,salt:c})}},a=d.SerializableCipher=l.extend({cfg:l.extend({format:b}),encrypt:function(a,b,c,d){d=this.cfg.extend(d);var l=a.createEncryptor(c,d);b=l.finalize(b);l=l.cfg;return n.create({ciphertext:b,key:c,iv:l.iv,algorithm:a,mode:l.mode,padding:l.padding,blockSize:a.blockSize,formatter:d.format})},
decrypt:function(a,b,c,d){d=this.cfg.extend(d);b=this._parse(b,d.format);return a.createDecryptor(c,d).finalize(b.ciphertext)},_parse:function(a,b){return"string"==typeof a?b.parse(a,this):a}}),p=(p.kdf={}).OpenSSL={execute:function(a,b,c,d){d||(d=s.random(8));a=w.create({keySize:b+c}).compute(a,d);c=s.create(a.words.slice(b),4*c);a.sigBytes=4*b;return n.create({key:a,iv:c,salt:d})}},c=d.PasswordBasedCipher=a.extend({cfg:a.cfg.extend({kdf:p}),encrypt:function(b,c,d,l){l=this.cfg.extend(l);d=l.kdf.execute(d,
b.keySize,b.ivSize);l.iv=d.iv;b=a.encrypt.call(this,b,c,d.key,l);b.mixIn(d);return b},decrypt:function(b,c,d,l){l=this.cfg.extend(l);c=this._parse(c,l.format);d=l.kdf.execute(d,b.keySize,b.ivSize,c.salt);l.iv=d.iv;return a.decrypt.call(this,b,c,d.key,l)}})}();
(function(){for(var u=CryptoJS,p=u.lib.BlockCipher,d=u.algo,l=[],s=[],t=[],r=[],w=[],v=[],b=[],x=[],q=[],n=[],a=[],c=0;256>c;c++)a[c]=128>c?c<<1:c<<1^283;for(var e=0,j=0,c=0;256>c;c++){var k=j^j<<1^j<<2^j<<3^j<<4,k=k>>>8^k&255^99;l[e]=k;s[k]=e;var z=a[e],F=a[z],G=a[F],y=257*a[k]^16843008*k;t[e]=y<<24|y>>>8;r[e]=y<<16|y>>>16;w[e]=y<<8|y>>>24;v[e]=y;y=16843009*G^65537*F^257*z^16843008*e;b[k]=y<<24|y>>>8;x[k]=y<<16|y>>>16;q[k]=y<<8|y>>>24;n[k]=y;e?(e=z^a[a[a[G^z]]],j^=a[a[j]]):e=j=1}var H=[0,1,2,4,8,
16,32,64,128,27,54],d=d.AES=p.extend({_doReset:function(){for(var a=this._key,c=a.words,d=a.sigBytes/4,a=4*((this._nRounds=d+6)+1),e=this._keySchedule=[],j=0;j<a;j++)if(j<d)e[j]=c[j];else{var k=e[j-1];j%d?6<d&&4==j%d&&(k=l[k>>>24]<<24|l[k>>>16&255]<<16|l[k>>>8&255]<<8|l[k&255]):(k=k<<8|k>>>24,k=l[k>>>24]<<24|l[k>>>16&255]<<16|l[k>>>8&255]<<8|l[k&255],k^=H[j/d|0]<<24);e[j]=e[j-d]^k}c=this._invKeySchedule=[];for(d=0;d<a;d++)j=a-d,k=d%4?e[j]:e[j-4],c[d]=4>d||4>=j?k:b[l[k>>>24]]^x[l[k>>>16&255]]^q[l[k>>>
8&255]]^n[l[k&255]]},encryptBlock:function(a,b){this._doCryptBlock(a,b,this._keySchedule,t,r,w,v,l)},decryptBlock:function(a,c){var d=a[c+1];a[c+1]=a[c+3];a[c+3]=d;this._doCryptBlock(a,c,this._invKeySchedule,b,x,q,n,s);d=a[c+1];a[c+1]=a[c+3];a[c+3]=d},_doCryptBlock:function(a,b,c,d,e,j,l,f){for(var m=this._nRounds,g=a[b]^c[0],h=a[b+1]^c[1],k=a[b+2]^c[2],n=a[b+3]^c[3],p=4,r=1;r<m;r++)var q=d[g>>>24]^e[h>>>16&255]^j[k>>>8&255]^l[n&255]^c[p++],s=d[h>>>24]^e[k>>>16&255]^j[n>>>8&255]^l[g&255]^c[p++],t=
d[k>>>24]^e[n>>>16&255]^j[g>>>8&255]^l[h&255]^c[p++],n=d[n>>>24]^e[g>>>16&255]^j[h>>>8&255]^l[k&255]^c[p++],g=q,h=s,k=t;q=(f[g>>>24]<<24|f[h>>>16&255]<<16|f[k>>>8&255]<<8|f[n&255])^c[p++];s=(f[h>>>24]<<24|f[k>>>16&255]<<16|f[n>>>8&255]<<8|f[g&255])^c[p++];t=(f[k>>>24]<<24|f[n>>>16&255]<<16|f[g>>>8&255]<<8|f[h&255])^c[p++];n=(f[n>>>24]<<24|f[g>>>16&255]<<16|f[h>>>8&255]<<8|f[k&255])^c[p++];a[b]=q;a[b+1]=s;a[b+2]=t;a[b+3]=n},keySize:8});u.AES=p._createHelper(d)})();
;/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS=CryptoJS||function(h,s){var f={},g=f.lib={},q=function(){},m=g.Base={extend:function(a){q.prototype=this;var c=new q;a&&c.mixIn(a);c.hasOwnProperty("init")||(c.init=function(){c.$super.init.apply(this,arguments)});c.init.prototype=c;c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}},
r=g.WordArray=m.extend({init:function(a,c){a=this.words=a||[];this.sigBytes=c!=s?c:4*a.length},toString:function(a){return(a||k).stringify(this)},concat:function(a){var c=this.words,d=a.words,b=this.sigBytes;a=a.sigBytes;this.clamp();if(b%4)for(var e=0;e<a;e++)c[b+e>>>2]|=(d[e>>>2]>>>24-8*(e%4)&255)<<24-8*((b+e)%4);else if(65535<d.length)for(e=0;e<a;e+=4)c[b+e>>>2]=d[e>>>2];else c.push.apply(c,d);this.sigBytes+=a;return this},clamp:function(){var a=this.words,c=this.sigBytes;a[c>>>2]&=4294967295<<
32-8*(c%4);a.length=h.ceil(c/4)},clone:function(){var a=m.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var c=[],d=0;d<a;d+=4)c.push(4294967296*h.random()|0);return new r.init(c,a)}}),l=f.enc={},k=l.Hex={stringify:function(a){var c=a.words;a=a.sigBytes;for(var d=[],b=0;b<a;b++){var e=c[b>>>2]>>>24-8*(b%4)&255;d.push((e>>>4).toString(16));d.push((e&15).toString(16))}return d.join("")},parse:function(a){for(var c=a.length,d=[],b=0;b<c;b+=2)d[b>>>3]|=parseInt(a.substr(b,
2),16)<<24-4*(b%8);return new r.init(d,c/2)}},n=l.Latin1={stringify:function(a){var c=a.words;a=a.sigBytes;for(var d=[],b=0;b<a;b++)d.push(String.fromCharCode(c[b>>>2]>>>24-8*(b%4)&255));return d.join("")},parse:function(a){for(var c=a.length,d=[],b=0;b<c;b++)d[b>>>2]|=(a.charCodeAt(b)&255)<<24-8*(b%4);return new r.init(d,c)}},j=l.Utf8={stringify:function(a){try{return decodeURIComponent(escape(n.stringify(a)))}catch(c){throw Error("Malformed UTF-8 data");}},parse:function(a){return n.parse(unescape(encodeURIComponent(a)))}},
u=g.BufferedBlockAlgorithm=m.extend({reset:function(){this._data=new r.init;this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=j.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var c=this._data,d=c.words,b=c.sigBytes,e=this.blockSize,f=b/(4*e),f=a?h.ceil(f):h.max((f|0)-this._minBufferSize,0);a=f*e;b=h.min(4*a,b);if(a){for(var g=0;g<a;g+=e)this._doProcessBlock(d,g);g=d.splice(0,a);c.sigBytes-=b}return new r.init(g,b)},clone:function(){var a=m.clone.call(this);
a._data=this._data.clone();return a},_minBufferSize:0});g.Hasher=u.extend({cfg:m.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){u.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(c,d){return(new a.init(d)).finalize(c)}},_createHmacHelper:function(a){return function(c,d){return(new t.HMAC.init(a,
d)).finalize(c)}}});var t=f.algo={};return f}(Math);
(function(h){for(var s=CryptoJS,f=s.lib,g=f.WordArray,q=f.Hasher,f=s.algo,m=[],r=[],l=function(a){return 4294967296*(a-(a|0))|0},k=2,n=0;64>n;){var j;a:{j=k;for(var u=h.sqrt(j),t=2;t<=u;t++)if(!(j%t)){j=!1;break a}j=!0}j&&(8>n&&(m[n]=l(h.pow(k,0.5))),r[n]=l(h.pow(k,1/3)),n++);k++}var a=[],f=f.SHA256=q.extend({_doReset:function(){this._hash=new g.init(m.slice(0))},_doProcessBlock:function(c,d){for(var b=this._hash.words,e=b[0],f=b[1],g=b[2],j=b[3],h=b[4],m=b[5],n=b[6],q=b[7],p=0;64>p;p++){if(16>p)a[p]=
c[d+p]|0;else{var k=a[p-15],l=a[p-2];a[p]=((k<<25|k>>>7)^(k<<14|k>>>18)^k>>>3)+a[p-7]+((l<<15|l>>>17)^(l<<13|l>>>19)^l>>>10)+a[p-16]}k=q+((h<<26|h>>>6)^(h<<21|h>>>11)^(h<<7|h>>>25))+(h&m^~h&n)+r[p]+a[p];l=((e<<30|e>>>2)^(e<<19|e>>>13)^(e<<10|e>>>22))+(e&f^e&g^f&g);q=n;n=m;m=h;h=j+k|0;j=g;g=f;f=e;e=k+l|0}b[0]=b[0]+e|0;b[1]=b[1]+f|0;b[2]=b[2]+g|0;b[3]=b[3]+j|0;b[4]=b[4]+h|0;b[5]=b[5]+m|0;b[6]=b[6]+n|0;b[7]=b[7]+q|0},_doFinalize:function(){var a=this._data,d=a.words,b=8*this._nDataBytes,e=8*a.sigBytes;
d[e>>>5]|=128<<24-e%32;d[(e+64>>>9<<4)+14]=h.floor(b/4294967296);d[(e+64>>>9<<4)+15]=b;a.sigBytes=4*d.length;this._process();return this._hash},clone:function(){var a=q.clone.call(this);a._hash=this._hash.clone();return a}});s.SHA256=q._createHelper(f);s.HmacSHA256=q._createHmacHelper(f)})(Math);
(function(){var h=CryptoJS,s=h.enc.Utf8;h.algo.HMAC=h.lib.Base.extend({init:function(f,g){f=this._hasher=new f.init;"string"==typeof g&&(g=s.parse(g));var h=f.blockSize,m=4*h;g.sigBytes>m&&(g=f.finalize(g));g.clamp();for(var r=this._oKey=g.clone(),l=this._iKey=g.clone(),k=r.words,n=l.words,j=0;j<h;j++)k[j]^=1549556828,n[j]^=909522486;r.sigBytes=l.sigBytes=m;this.reset()},reset:function(){var f=this._hasher;f.reset();f.update(this._iKey)},update:function(f){this._hasher.update(f);return this},finalize:function(f){var g=
this._hasher;f=g.finalize(f);g.reset();return g.finalize(this._oKey.clone().concat(f))}})})();
;/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS=CryptoJS||function(a,j){var c={},b=c.lib={},f=function(){},l=b.Base={extend:function(a){f.prototype=this;var d=new f;a&&d.mixIn(a);d.hasOwnProperty("init")||(d.init=function(){d.$super.init.apply(this,arguments)});d.init.prototype=d;d.$super=this;return d},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var d in a)a.hasOwnProperty(d)&&(this[d]=a[d]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}},
u=b.WordArray=l.extend({init:function(a,d){a=this.words=a||[];this.sigBytes=d!=j?d:4*a.length},toString:function(a){return(a||m).stringify(this)},concat:function(a){var d=this.words,M=a.words,e=this.sigBytes;a=a.sigBytes;this.clamp();if(e%4)for(var b=0;b<a;b++)d[e+b>>>2]|=(M[b>>>2]>>>24-8*(b%4)&255)<<24-8*((e+b)%4);else if(65535<M.length)for(b=0;b<a;b+=4)d[e+b>>>2]=M[b>>>2];else d.push.apply(d,M);this.sigBytes+=a;return this},clamp:function(){var D=this.words,d=this.sigBytes;D[d>>>2]&=4294967295<<
32-8*(d%4);D.length=a.ceil(d/4)},clone:function(){var a=l.clone.call(this);a.words=this.words.slice(0);return a},random:function(D){for(var d=[],b=0;b<D;b+=4)d.push(4294967296*a.random()|0);return new u.init(d,D)}}),k=c.enc={},m=k.Hex={stringify:function(a){var d=a.words;a=a.sigBytes;for(var b=[],e=0;e<a;e++){var c=d[e>>>2]>>>24-8*(e%4)&255;b.push((c>>>4).toString(16));b.push((c&15).toString(16))}return b.join("")},parse:function(a){for(var d=a.length,b=[],e=0;e<d;e+=2)b[e>>>3]|=parseInt(a.substr(e,
2),16)<<24-4*(e%8);return new u.init(b,d/2)}},y=k.Latin1={stringify:function(a){var b=a.words;a=a.sigBytes;for(var c=[],e=0;e<a;e++)c.push(String.fromCharCode(b[e>>>2]>>>24-8*(e%4)&255));return c.join("")},parse:function(a){for(var b=a.length,c=[],e=0;e<b;e++)c[e>>>2]|=(a.charCodeAt(e)&255)<<24-8*(e%4);return new u.init(c,b)}},z=k.Utf8={stringify:function(a){try{return decodeURIComponent(escape(y.stringify(a)))}catch(b){throw Error("Malformed UTF-8 data");}},parse:function(a){return y.parse(unescape(encodeURIComponent(a)))}},
x=b.BufferedBlockAlgorithm=l.extend({reset:function(){this._data=new u.init;this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=z.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(b){var d=this._data,c=d.words,e=d.sigBytes,l=this.blockSize,k=e/(4*l),k=b?a.ceil(k):a.max((k|0)-this._minBufferSize,0);b=k*l;e=a.min(4*b,e);if(b){for(var x=0;x<b;x+=l)this._doProcessBlock(c,x);x=c.splice(0,b);d.sigBytes-=e}return new u.init(x,e)},clone:function(){var a=l.clone.call(this);
a._data=this._data.clone();return a},_minBufferSize:0});b.Hasher=x.extend({cfg:l.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){x.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(b,c){return(new a.init(c)).finalize(b)}},_createHmacHelper:function(a){return function(b,c){return(new ja.HMAC.init(a,
c)).finalize(b)}}});var ja=c.algo={};return c}(Math);
(function(a){var j=CryptoJS,c=j.lib,b=c.Base,f=c.WordArray,j=j.x64={};j.Word=b.extend({init:function(a,b){this.high=a;this.low=b}});j.WordArray=b.extend({init:function(b,c){b=this.words=b||[];this.sigBytes=c!=a?c:8*b.length},toX32:function(){for(var a=this.words,b=a.length,c=[],m=0;m<b;m++){var y=a[m];c.push(y.high);c.push(y.low)}return f.create(c,this.sigBytes)},clone:function(){for(var a=b.clone.call(this),c=a.words=this.words.slice(0),k=c.length,f=0;f<k;f++)c[f]=c[f].clone();return a}})})();
(function(){function a(){return f.create.apply(f,arguments)}for(var j=CryptoJS,c=j.lib.Hasher,b=j.x64,f=b.Word,l=b.WordArray,b=j.algo,u=[a(1116352408,3609767458),a(1899447441,602891725),a(3049323471,3964484399),a(3921009573,2173295548),a(961987163,4081628472),a(1508970993,3053834265),a(2453635748,2937671579),a(2870763221,3664609560),a(3624381080,2734883394),a(310598401,1164996542),a(607225278,1323610764),a(1426881987,3590304994),a(1925078388,4068182383),a(2162078206,991336113),a(2614888103,633803317),
a(3248222580,3479774868),a(3835390401,2666613458),a(4022224774,944711139),a(264347078,2341262773),a(604807628,2007800933),a(770255983,1495990901),a(1249150122,1856431235),a(1555081692,3175218132),a(1996064986,2198950837),a(2554220882,3999719339),a(2821834349,766784016),a(2952996808,2566594879),a(3210313671,3203337956),a(3336571891,1034457026),a(3584528711,2466948901),a(113926993,3758326383),a(338241895,168717936),a(666307205,1188179964),a(773529912,1546045734),a(1294757372,1522805485),a(1396182291,
2643833823),a(1695183700,2343527390),a(1986661051,1014477480),a(2177026350,1206759142),a(2456956037,344077627),a(2730485921,1290863460),a(2820302411,3158454273),a(3259730800,3505952657),a(3345764771,106217008),a(3516065817,3606008344),a(3600352804,1432725776),a(4094571909,1467031594),a(275423344,851169720),a(430227734,3100823752),a(506948616,1363258195),a(659060556,3750685593),a(883997877,3785050280),a(958139571,3318307427),a(1322822218,3812723403),a(1537002063,2003034995),a(1747873779,3602036899),
a(1955562222,1575990012),a(2024104815,1125592928),a(2227730452,2716904306),a(2361852424,442776044),a(2428436474,593698344),a(2756734187,3733110249),a(3204031479,2999351573),a(3329325298,3815920427),a(3391569614,3928383900),a(3515267271,566280711),a(3940187606,3454069534),a(4118630271,4000239992),a(116418474,1914138554),a(174292421,2731055270),a(289380356,3203993006),a(460393269,320620315),a(685471733,587496836),a(852142971,1086792851),a(1017036298,365543100),a(1126000580,2618297676),a(1288033470,
3409855158),a(1501505948,4234509866),a(1607167915,987167468),a(1816402316,1246189591)],k=[],m=0;80>m;m++)k[m]=a();b=b.SHA512=c.extend({_doReset:function(){this._hash=new l.init([new f.init(1779033703,4089235720),new f.init(3144134277,2227873595),new f.init(1013904242,4271175723),new f.init(2773480762,1595750129),new f.init(1359893119,2917565137),new f.init(2600822924,725511199),new f.init(528734635,4215389547),new f.init(1541459225,327033209)])},_doProcessBlock:function(a,b){for(var c=this._hash.words,
f=c[0],j=c[1],d=c[2],l=c[3],e=c[4],m=c[5],N=c[6],c=c[7],aa=f.high,O=f.low,ba=j.high,P=j.low,ca=d.high,Q=d.low,da=l.high,R=l.low,ea=e.high,S=e.low,fa=m.high,T=m.low,ga=N.high,U=N.low,ha=c.high,V=c.low,r=aa,n=O,G=ba,E=P,H=ca,F=Q,Y=da,I=R,s=ea,p=S,W=fa,J=T,X=ga,K=U,Z=ha,L=V,t=0;80>t;t++){var A=k[t];if(16>t)var q=A.high=a[b+2*t]|0,g=A.low=a[b+2*t+1]|0;else{var q=k[t-15],g=q.high,v=q.low,q=(g>>>1|v<<31)^(g>>>8|v<<24)^g>>>7,v=(v>>>1|g<<31)^(v>>>8|g<<24)^(v>>>7|g<<25),C=k[t-2],g=C.high,h=C.low,C=(g>>>19|
h<<13)^(g<<3|h>>>29)^g>>>6,h=(h>>>19|g<<13)^(h<<3|g>>>29)^(h>>>6|g<<26),g=k[t-7],$=g.high,B=k[t-16],w=B.high,B=B.low,g=v+g.low,q=q+$+(g>>>0<v>>>0?1:0),g=g+h,q=q+C+(g>>>0<h>>>0?1:0),g=g+B,q=q+w+(g>>>0<B>>>0?1:0);A.high=q;A.low=g}var $=s&W^~s&X,B=p&J^~p&K,A=r&G^r&H^G&H,ka=n&E^n&F^E&F,v=(r>>>28|n<<4)^(r<<30|n>>>2)^(r<<25|n>>>7),C=(n>>>28|r<<4)^(n<<30|r>>>2)^(n<<25|r>>>7),h=u[t],la=h.high,ia=h.low,h=L+((p>>>14|s<<18)^(p>>>18|s<<14)^(p<<23|s>>>9)),w=Z+((s>>>14|p<<18)^(s>>>18|p<<14)^(s<<23|p>>>9))+(h>>>
0<L>>>0?1:0),h=h+B,w=w+$+(h>>>0<B>>>0?1:0),h=h+ia,w=w+la+(h>>>0<ia>>>0?1:0),h=h+g,w=w+q+(h>>>0<g>>>0?1:0),g=C+ka,A=v+A+(g>>>0<C>>>0?1:0),Z=X,L=K,X=W,K=J,W=s,J=p,p=I+h|0,s=Y+w+(p>>>0<I>>>0?1:0)|0,Y=H,I=F,H=G,F=E,G=r,E=n,n=h+g|0,r=w+A+(n>>>0<h>>>0?1:0)|0}O=f.low=O+n;f.high=aa+r+(O>>>0<n>>>0?1:0);P=j.low=P+E;j.high=ba+G+(P>>>0<E>>>0?1:0);Q=d.low=Q+F;d.high=ca+H+(Q>>>0<F>>>0?1:0);R=l.low=R+I;l.high=da+Y+(R>>>0<I>>>0?1:0);S=e.low=S+p;e.high=ea+s+(S>>>0<p>>>0?1:0);T=m.low=T+J;m.high=fa+W+(T>>>0<J>>>0?1:
0);U=N.low=U+K;N.high=ga+X+(U>>>0<K>>>0?1:0);V=c.low=V+L;c.high=ha+Z+(V>>>0<L>>>0?1:0)},_doFinalize:function(){var a=this._data,b=a.words,c=8*this._nDataBytes,f=8*a.sigBytes;b[f>>>5]|=128<<24-f%32;b[(f+128>>>10<<5)+30]=Math.floor(c/4294967296);b[(f+128>>>10<<5)+31]=c;a.sigBytes=4*b.length;this._process();return this._hash.toX32()},clone:function(){var a=c.clone.call(this);a._hash=this._hash.clone();return a},blockSize:32});j.SHA512=c._createHelper(b);j.HmacSHA512=c._createHmacHelper(b)})();
(function(){var a=CryptoJS,j=a.enc.Utf8;a.algo.HMAC=a.lib.Base.extend({init:function(a,b){a=this._hasher=new a.init;"string"==typeof b&&(b=j.parse(b));var f=a.blockSize,l=4*f;b.sigBytes>l&&(b=a.finalize(b));b.clamp();for(var u=this._oKey=b.clone(),k=this._iKey=b.clone(),m=u.words,y=k.words,z=0;z<f;z++)m[z]^=1549556828,y[z]^=909522486;u.sigBytes=k.sigBytes=l;this.reset()},reset:function(){var a=this._hasher;a.reset();a.update(this._iKey)},update:function(a){this._hasher.update(a);return this},finalize:function(a){var b=
this._hasher;a=b.finalize(a);b.reset();return b.finalize(this._oKey.clone().concat(a))}})})();
;/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS=CryptoJS||function(g,j){var e={},d=e.lib={},m=function(){},n=d.Base={extend:function(a){m.prototype=this;var c=new m;a&&c.mixIn(a);c.hasOwnProperty("init")||(c.init=function(){c.$super.init.apply(this,arguments)});c.init.prototype=c;c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}},
q=d.WordArray=n.extend({init:function(a,c){a=this.words=a||[];this.sigBytes=c!=j?c:4*a.length},toString:function(a){return(a||l).stringify(this)},concat:function(a){var c=this.words,p=a.words,f=this.sigBytes;a=a.sigBytes;this.clamp();if(f%4)for(var b=0;b<a;b++)c[f+b>>>2]|=(p[b>>>2]>>>24-8*(b%4)&255)<<24-8*((f+b)%4);else if(65535<p.length)for(b=0;b<a;b+=4)c[f+b>>>2]=p[b>>>2];else c.push.apply(c,p);this.sigBytes+=a;return this},clamp:function(){var a=this.words,c=this.sigBytes;a[c>>>2]&=4294967295<<
32-8*(c%4);a.length=g.ceil(c/4)},clone:function(){var a=n.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var c=[],b=0;b<a;b+=4)c.push(4294967296*g.random()|0);return new q.init(c,a)}}),b=e.enc={},l=b.Hex={stringify:function(a){var c=a.words;a=a.sigBytes;for(var b=[],f=0;f<a;f++){var d=c[f>>>2]>>>24-8*(f%4)&255;b.push((d>>>4).toString(16));b.push((d&15).toString(16))}return b.join("")},parse:function(a){for(var c=a.length,b=[],f=0;f<c;f+=2)b[f>>>3]|=parseInt(a.substr(f,
2),16)<<24-4*(f%8);return new q.init(b,c/2)}},k=b.Latin1={stringify:function(a){var c=a.words;a=a.sigBytes;for(var b=[],f=0;f<a;f++)b.push(String.fromCharCode(c[f>>>2]>>>24-8*(f%4)&255));return b.join("")},parse:function(a){for(var c=a.length,b=[],f=0;f<c;f++)b[f>>>2]|=(a.charCodeAt(f)&255)<<24-8*(f%4);return new q.init(b,c)}},h=b.Utf8={stringify:function(a){try{return decodeURIComponent(escape(k.stringify(a)))}catch(b){throw Error("Malformed UTF-8 data");}},parse:function(a){return k.parse(unescape(encodeURIComponent(a)))}},
u=d.BufferedBlockAlgorithm=n.extend({reset:function(){this._data=new q.init;this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=h.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var b=this._data,d=b.words,f=b.sigBytes,l=this.blockSize,e=f/(4*l),e=a?g.ceil(e):g.max((e|0)-this._minBufferSize,0);a=e*l;f=g.min(4*a,f);if(a){for(var h=0;h<a;h+=l)this._doProcessBlock(d,h);h=d.splice(0,a);b.sigBytes-=f}return new q.init(h,f)},clone:function(){var a=n.clone.call(this);
a._data=this._data.clone();return a},_minBufferSize:0});d.Hasher=u.extend({cfg:n.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){u.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(b,d){return(new a.init(d)).finalize(b)}},_createHmacHelper:function(a){return function(b,d){return(new w.HMAC.init(a,
d)).finalize(b)}}});var w=e.algo={};return e}(Math);
(function(){var g=CryptoJS,j=g.lib,e=j.WordArray,d=j.Hasher,m=[],j=g.algo.SHA1=d.extend({_doReset:function(){this._hash=new e.init([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(d,e){for(var b=this._hash.words,l=b[0],k=b[1],h=b[2],g=b[3],j=b[4],a=0;80>a;a++){if(16>a)m[a]=d[e+a]|0;else{var c=m[a-3]^m[a-8]^m[a-14]^m[a-16];m[a]=c<<1|c>>>31}c=(l<<5|l>>>27)+j+m[a];c=20>a?c+((k&h|~k&g)+1518500249):40>a?c+((k^h^g)+1859775393):60>a?c+((k&h|k&g|h&g)-1894007588):c+((k^h^
g)-899497514);j=g;g=h;h=k<<30|k>>>2;k=l;l=c}b[0]=b[0]+l|0;b[1]=b[1]+k|0;b[2]=b[2]+h|0;b[3]=b[3]+g|0;b[4]=b[4]+j|0},_doFinalize:function(){var d=this._data,e=d.words,b=8*this._nDataBytes,l=8*d.sigBytes;e[l>>>5]|=128<<24-l%32;e[(l+64>>>9<<4)+14]=Math.floor(b/4294967296);e[(l+64>>>9<<4)+15]=b;d.sigBytes=4*e.length;this._process();return this._hash},clone:function(){var e=d.clone.call(this);e._hash=this._hash.clone();return e}});g.SHA1=d._createHelper(j);g.HmacSHA1=d._createHmacHelper(j)})();
(function(){var g=CryptoJS,j=g.enc.Utf8;g.algo.HMAC=g.lib.Base.extend({init:function(e,d){e=this._hasher=new e.init;"string"==typeof d&&(d=j.parse(d));var g=e.blockSize,n=4*g;d.sigBytes>n&&(d=e.finalize(d));d.clamp();for(var q=this._oKey=d.clone(),b=this._iKey=d.clone(),l=q.words,k=b.words,h=0;h<g;h++)l[h]^=1549556828,k[h]^=909522486;q.sigBytes=b.sigBytes=n;this.reset()},reset:function(){var e=this._hasher;e.reset();e.update(this._iKey)},update:function(e){this._hasher.update(e);return this},finalize:function(e){var d=
this._hasher;e=d.finalize(e);d.reset();return d.finalize(this._oKey.clone().concat(e))}})})();
(function(){var g=CryptoJS,j=g.lib,e=j.Base,d=j.WordArray,j=g.algo,m=j.HMAC,n=j.PBKDF2=e.extend({cfg:e.extend({keySize:4,hasher:j.SHA1,iterations:1}),init:function(d){this.cfg=this.cfg.extend(d)},compute:function(e,b){for(var g=this.cfg,k=m.create(g.hasher,e),h=d.create(),j=d.create([1]),n=h.words,a=j.words,c=g.keySize,g=g.iterations;n.length<c;){var p=k.update(b).finalize(j);k.reset();for(var f=p.words,v=f.length,s=p,t=1;t<g;t++){s=k.finalize(s);k.reset();for(var x=s.words,r=0;r<v;r++)f[r]^=x[r]}h.concat(p);
a[0]++}h.sigBytes=4*c;return h}});g.PBKDF2=function(d,b,e){return n.create(e).compute(d,b)}})();
;/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS=CryptoJS||function(e,m){var p={},j=p.lib={},l=function(){},f=j.Base={extend:function(a){l.prototype=this;var c=new l;a&&c.mixIn(a);c.hasOwnProperty("init")||(c.init=function(){c.$super.init.apply(this,arguments)});c.init.prototype=c;c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}},
n=j.WordArray=f.extend({init:function(a,c){a=this.words=a||[];this.sigBytes=c!=m?c:4*a.length},toString:function(a){return(a||h).stringify(this)},concat:function(a){var c=this.words,q=a.words,d=this.sigBytes;a=a.sigBytes;this.clamp();if(d%4)for(var b=0;b<a;b++)c[d+b>>>2]|=(q[b>>>2]>>>24-8*(b%4)&255)<<24-8*((d+b)%4);else if(65535<q.length)for(b=0;b<a;b+=4)c[d+b>>>2]=q[b>>>2];else c.push.apply(c,q);this.sigBytes+=a;return this},clamp:function(){var a=this.words,c=this.sigBytes;a[c>>>2]&=4294967295<<
32-8*(c%4);a.length=e.ceil(c/4)},clone:function(){var a=f.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var c=[],b=0;b<a;b+=4)c.push(4294967296*e.random()|0);return new n.init(c,a)}}),b=p.enc={},h=b.Hex={stringify:function(a){var c=a.words;a=a.sigBytes;for(var b=[],d=0;d<a;d++){var f=c[d>>>2]>>>24-8*(d%4)&255;b.push((f>>>4).toString(16));b.push((f&15).toString(16))}return b.join("")},parse:function(a){for(var c=a.length,b=[],d=0;d<c;d+=2)b[d>>>3]|=parseInt(a.substr(d,
2),16)<<24-4*(d%8);return new n.init(b,c/2)}},g=b.Latin1={stringify:function(a){var c=a.words;a=a.sigBytes;for(var b=[],d=0;d<a;d++)b.push(String.fromCharCode(c[d>>>2]>>>24-8*(d%4)&255));return b.join("")},parse:function(a){for(var c=a.length,b=[],d=0;d<c;d++)b[d>>>2]|=(a.charCodeAt(d)&255)<<24-8*(d%4);return new n.init(b,c)}},r=b.Utf8={stringify:function(a){try{return decodeURIComponent(escape(g.stringify(a)))}catch(c){throw Error("Malformed UTF-8 data");}},parse:function(a){return g.parse(unescape(encodeURIComponent(a)))}},
k=j.BufferedBlockAlgorithm=f.extend({reset:function(){this._data=new n.init;this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=r.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var c=this._data,b=c.words,d=c.sigBytes,f=this.blockSize,h=d/(4*f),h=a?e.ceil(h):e.max((h|0)-this._minBufferSize,0);a=h*f;d=e.min(4*a,d);if(a){for(var g=0;g<a;g+=f)this._doProcessBlock(b,g);g=b.splice(0,a);c.sigBytes-=d}return new n.init(g,d)},clone:function(){var a=f.clone.call(this);
a._data=this._data.clone();return a},_minBufferSize:0});j.Hasher=k.extend({cfg:f.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){k.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(c,b){return(new a.init(b)).finalize(c)}},_createHmacHelper:function(a){return function(b,f){return(new s.HMAC.init(a,
f)).finalize(b)}}});var s=p.algo={};return p}(Math);
(function(){var e=CryptoJS,m=e.lib,p=m.WordArray,j=m.Hasher,l=[],m=e.algo.SHA1=j.extend({_doReset:function(){this._hash=new p.init([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(f,n){for(var b=this._hash.words,h=b[0],g=b[1],e=b[2],k=b[3],j=b[4],a=0;80>a;a++){if(16>a)l[a]=f[n+a]|0;else{var c=l[a-3]^l[a-8]^l[a-14]^l[a-16];l[a]=c<<1|c>>>31}c=(h<<5|h>>>27)+j+l[a];c=20>a?c+((g&e|~g&k)+1518500249):40>a?c+((g^e^k)+1859775393):60>a?c+((g&e|g&k|e&k)-1894007588):c+((g^e^
k)-899497514);j=k;k=e;e=g<<30|g>>>2;g=h;h=c}b[0]=b[0]+h|0;b[1]=b[1]+g|0;b[2]=b[2]+e|0;b[3]=b[3]+k|0;b[4]=b[4]+j|0},_doFinalize:function(){var f=this._data,e=f.words,b=8*this._nDataBytes,h=8*f.sigBytes;e[h>>>5]|=128<<24-h%32;e[(h+64>>>9<<4)+14]=Math.floor(b/4294967296);e[(h+64>>>9<<4)+15]=b;f.sigBytes=4*e.length;this._process();return this._hash},clone:function(){var e=j.clone.call(this);e._hash=this._hash.clone();return e}});e.SHA1=j._createHelper(m);e.HmacSHA1=j._createHmacHelper(m)})();
;"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SFAuthManager = exports.SFAuthManager = function () {
  function SFAuthManager(storageManager, httpManager, timeout) {
    _classCallCheck(this, SFAuthManager);

    this.httpManager = httpManager;
    this.storageManager = storageManager;
    this.$timeout = timeout || setTimeout.bind(window);
  }

  _createClass(SFAuthManager, [{
    key: "getAuthParamsForEmail",
    value: function getAuthParamsForEmail(url, email, extraParams, callback) {
      var requestUrl = url + "/auth/params";
      this.httpManager.getAbsolute(requestUrl, _.merge({ email: email }, extraParams), function (response) {
        callback(response);
      }, function (response) {
        console.error("Error getting auth params", response);
        if ((typeof response === "undefined" ? "undefined" : _typeof(response)) !== 'object') {
          response = { error: { message: "A server error occurred while trying to sign in. Please try again." } };
        }
        callback(response);
      });
    }
  }, {
    key: "login",
    value: function login(url, email, password, ephemeral, strictSignin, extraParams, callback) {
      var _this = this;

      this.getAuthParamsForEmail(url, email, extraParams, function (authParams) {

        // SF3 requires a unique identifier in the auth params
        authParams.identifier = email;

        if (authParams.error) {
          callback(authParams);
          return;
        }

        if (!authParams || !authParams.pw_cost) {
          callback({ error: { message: "Invalid email or password." } });
          return;
        }

        if (!SFJS.supportedVersions().includes(authParams.version)) {
          var message;
          if (SFJS.isVersionNewerThanLibraryVersion(authParams.version)) {
            // The user has a new account type, but is signing in to an older client.
            message = "This version of the application does not support your newer account type. Please upgrade to the latest version of Standard Notes to sign in.";
          } else {
            // The user has a very old account type, which is no longer supported by this client
            message = "The protocol version associated with your account is outdated and no longer supported by this application. Please visit standardnotes.org/help/security for more information.";
          }
          callback({ error: { message: message } });
          return;
        }

        if (SFJS.isProtocolVersionOutdated(authParams.version)) {
          var _message = "The encryption version for your account, " + authParams.version + ", is outdated and requires upgrade. You may proceed with login, but are advised to follow prompts for Security Updates once inside. Please visit standardnotes.org/help/security for more information.\n\nClick 'OK' to proceed with login.";
          if (!confirm(_message)) {
            callback({ error: {} });
            return;
          }
        }

        if (!SFJS.supportsPasswordDerivationCost(authParams.pw_cost)) {
          var _message2 = "Your account was created on a platform with higher security capabilities than this browser supports. " + "If we attempted to generate your login keys here, it would take hours. " + "Please use a browser with more up to date security capabilities, like Google Chrome or Firefox, to log in.";
          callback({ error: { message: _message2 } });
          return;
        }

        var minimum = SFJS.costMinimumForVersion(authParams.version);
        if (authParams.pw_cost < minimum) {
          var _message3 = "Unable to login due to insecure password parameters. Please visit standardnotes.org/help/security for more information.";
          callback({ error: { message: _message3 } });
          return;
        }

        if (strictSignin) {
          // Refuse sign in if authParams.version is anything but the latest version
          var latestVersion = SFJS.version();
          if (authParams.version !== latestVersion) {
            var _message4 = "Strict sign in refused server sign in parameters. The latest security version is " + latestVersion + ", but your account is reported to have version " + authParams.version + ". If you'd like to proceed with sign in anyway, please disable strict sign in and try again.";
            callback({ error: { message: _message4 } });
            return;
          }
        }

        SFJS.crypto.computeEncryptionKeysForUser(password, authParams).then(function (keys) {
          var requestUrl = url + "/auth/sign_in";
          var params = _.merge({ password: keys.pw, email: email }, extraParams);

          _this.httpManager.postAbsolute(requestUrl, params, function (response) {
            _this.handleAuthResponse(response, email, url, authParams, keys);
            _this.$timeout(function () {
              return callback(response, keys);
            });
          }, function (response) {
            console.error("Error logging in", response);
            if ((typeof response === "undefined" ? "undefined" : _typeof(response)) !== 'object') {
              response = { error: { message: "A server error occurred while trying to sign in. Please try again." } };
            }
            _this.$timeout(function () {
              return callback(response);
            });
          });
        });
      });
    }
  }, {
    key: "handleAuthResponse",
    value: function handleAuthResponse(response, email, url, authParams, keys) {
      if (url) {
        this.storageManager.setItem("server", url);
      }
      this.storageManager.setItem("auth_params", JSON.stringify(authParams));
      this.storageManager.setItem("jwt", response.token);
      this.saveKeys(keys);
    }
  }, {
    key: "saveKeys",
    value: function saveKeys(keys) {
      this._keys = keys;
      this.storageManager.setItem("mk", keys.mk);
      this.storageManager.setItem("ak", keys.ak);
    }
  }, {
    key: "keys",
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var mk;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (this._keys) {
                  _context.next = 11;
                  break;
                }

                _context.next = 3;
                return this.storageManager.getItem("mk");

              case 3:
                mk = _context.sent;

                if (mk) {
                  _context.next = 6;
                  break;
                }

                return _context.abrupt("return", null);

              case 6:
                _context.t0 = mk;
                _context.next = 9;
                return this.storageManager.getItem("ak");

              case 9:
                _context.t1 = _context.sent;
                this._keys = {
                  mk: _context.t0,
                  ak: _context.t1
                };

              case 11:
                return _context.abrupt("return", this._keys);

              case 12:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function keys() {
        return _ref.apply(this, arguments);
      }

      return keys;
    }()
  }, {
    key: "register",
    value: function register(url, email, password, ephemeral, callback) {
      var _this2 = this;

      SFJS.crypto.generateInitialKeysAndAuthParamsForUser(email, password).then(function (results) {
        var keys = results.keys;
        var authParams = results.authParams;

        var requestUrl = url + "/auth";
        var params = _.merge({ password: keys.pw, email: email }, authParams);

        _this2.httpManager.postAbsolute(requestUrl, params, function (response) {
          _this2.handleAuthResponse(response, email, url, authParams, keys);
          callback(response);
        }, function (response) {
          console.error("Registration error", response);
          if ((typeof response === "undefined" ? "undefined" : _typeof(response)) !== 'object') {
            response = { error: { message: "A server error occurred while trying to register. Please try again." } };
          }
          callback(response);
        });
      });
    }
  }, {
    key: "changePassword",
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(email, current_server_pw, newKeys, newAuthParams, callback) {
        var _this3 = this;

        var newServerPw, requestUrl, params;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                newServerPw = newKeys.pw;
                _context2.next = 3;
                return this.storageManager.getItem("server");

              case 3:
                _context2.t0 = _context2.sent;
                requestUrl = _context2.t0 + "/auth/change_pw";
                params = _.merge({ new_password: newServerPw, current_password: current_server_pw }, newAuthParams);


                this.httpManager.postAbsolute(requestUrl, params, function (response) {
                  _this3.handleAuthResponse(response, email, null, newAuthParams, newKeys);
                  callback(response);
                }, function (response) {
                  if ((typeof response === "undefined" ? "undefined" : _typeof(response)) !== 'object') {
                    response = { error: { message: "Something went wrong while changing your password. Your password was not changed. Please try again." } };
                  }
                  callback(response);
                });

              case 7:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function changePassword(_x, _x2, _x3, _x4, _x5) {
        return _ref2.apply(this, arguments);
      }

      return changePassword;
    }()
  }]);

  return SFAuthManager;
}();

;
var SFHttpManager = function () {
  function SFHttpManager(storageManager, timeout) {
    _classCallCheck(this, SFHttpManager);

    // calling callbacks in a $timeout allows UI to update
    this.$timeout = timeout || setTimeout.bind(window);
    this.storageManager = storageManager;
  }

  _createClass(SFHttpManager, [{
    key: "setAuthHeadersForRequest",
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(request) {
        var token;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.storageManager.getItem("jwt");

              case 2:
                token = _context3.sent;

                if (token) {
                  request.setRequestHeader('Authorization', 'Bearer ' + token);
                }

              case 4:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function setAuthHeadersForRequest(_x6) {
        return _ref3.apply(this, arguments);
      }

      return setAuthHeadersForRequest;
    }()
  }, {
    key: "postAbsolute",
    value: function postAbsolute(url, params, onsuccess, onerror) {
      this.httpRequest("post", url, params, onsuccess, onerror);
    }
  }, {
    key: "patchAbsolute",
    value: function patchAbsolute(url, params, onsuccess, onerror) {
      this.httpRequest("patch", url, params, onsuccess, onerror);
    }
  }, {
    key: "getAbsolute",
    value: function getAbsolute(url, params, onsuccess, onerror) {
      this.httpRequest("get", url, params, onsuccess, onerror);
    }
  }, {
    key: "httpRequest",
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(verb, url, params, onsuccess, onerror) {
        var xmlhttp;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
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
                _context4.next = 6;
                return this.setAuthHeadersForRequest(xmlhttp);

              case 6:
                xmlhttp.setRequestHeader('Content-type', 'application/json');

                if (verb == "post" || verb == "patch") {
                  xmlhttp.send(JSON.stringify(params));
                } else {
                  xmlhttp.send();
                }

              case 8:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function httpRequest(_x7, _x8, _x9, _x10, _x11) {
        return _ref4.apply(this, arguments);
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
      var _this4 = this;

      var globalOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      items.forEach(function (item) {
        if (!_.find(_this4.items, { uuid: item.uuid })) {
          _this4.items.push(item);
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
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(keys, authParams, protocolVersion, returnNullIfEmpty) {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                return _context5.abrupt("return", Promise.all(this.allItems.map(function (item) {
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
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function getAllItemsJSONData(_x16, _x17, _x18, _x19) {
        return _ref5.apply(this, arguments);
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

; // SFStorageManager should be subclassed, and all the methods below overwritten.

var SFStorageManager = exports.SFStorageManager = function () {
  function SFStorageManager() {
    _classCallCheck(this, SFStorageManager);
  }

  _createClass(SFStorageManager, [{
    key: "setItem",


    /* Simple Key/Value Storage */

    value: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(key, value, vaultKey) {
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function setItem(_x20, _x21, _x22) {
        return _ref6.apply(this, arguments);
      }

      return setItem;
    }()
  }, {
    key: "getItem",
    value: function () {
      var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(key, vault) {
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function getItem(_x23, _x24) {
        return _ref7.apply(this, arguments);
      }

      return getItem;
    }()
  }, {
    key: "removeItem",
    value: function () {
      var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(key, vault) {
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function removeItem(_x25, _x26) {
        return _ref8.apply(this, arguments);
      }

      return removeItem;
    }()
  }, {
    key: "clear",
    value: function () {
      var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function clear() {
        return _ref9.apply(this, arguments);
      }

      return clear;
    }()
  }, {
    key: "getAllModels",


    /*
    Model Storage
    */

    value: function () {
      var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function getAllModels() {
        return _ref10.apply(this, arguments);
      }

      return getAllModels;
    }()
  }, {
    key: "saveModel",
    value: function () {
      var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(item) {
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                return _context11.abrupt("return", this.saveModels([item]));

              case 1:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function saveModel(_x27) {
        return _ref11.apply(this, arguments);
      }

      return saveModel;
    }()
  }, {
    key: "saveModels",
    value: function () {
      var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(items) {
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function saveModels(_x28) {
        return _ref12.apply(this, arguments);
      }

      return saveModels;
    }()
  }, {
    key: "deleteModel",
    value: function () {
      var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(item) {
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function deleteModel(_x29) {
        return _ref13.apply(this, arguments);
      }

      return deleteModel;
    }()
  }, {
    key: "clearAllModels",
    value: function () {
      var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14() {
        return regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function clearAllModels() {
        return _ref14.apply(this, arguments);
      }

      return clearAllModels;
    }()
  }, {
    key: "clearAllData",


    /* General */

    value: function () {
      var _ref15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15() {
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                return _context15.abrupt("return", Promise.all([this.clear(), this.clearAllModels()]));

              case 1:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function clearAllData() {
        return _ref15.apply(this, arguments);
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

    this.httpManager = httpManager;
    this.modelManager = modelManager;
    this.storageManager = storageManager;

    // Allows you to et your own interval/timeout function (i.e if you're using angular and want to use $timeout)
    this.$interval = interval || setInterval.bind(window);
    this.$timeout = timeout || setTimeout.bind(window);

    this.syncStatus = {};
    this.syncStatusObservers = [];
  }

  _createClass(SFSyncManager, [{
    key: "getServerURL",
    value: function () {
      var _ref16 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16() {
        return regeneratorRuntime.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                _context16.next = 2;
                return this.storageManager.getItem("server");

              case 2:
                _context16.t0 = _context16.sent;

                if (_context16.t0) {
                  _context16.next = 5;
                  break;
                }

                _context16.t0 = window._default_sf_server;

              case 5:
                return _context16.abrupt("return", _context16.t0);

              case 6:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee16, this);
      }));

      function getServerURL() {
        return _ref16.apply(this, arguments);
      }

      return getServerURL;
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
      var _this5 = this;

      this.syncStatusObservers.forEach(function (observer) {
        observer.callback(_this5.syncStatus);
      });
    }
  }, {
    key: "setEventHandler",
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
    key: "notifyEvent",
    value: function notifyEvent(syncEvent, data) {
      this.eventHandler(syncEvent, data);
    }
  }, {
    key: "setKeyRequestHandler",
    value: function setKeyRequestHandler(handler) {
      this.keyRequestHandler = handler;
    }
  }, {
    key: "getActiveKeyInfo",
    value: function () {
      var _ref17 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17() {
        return regeneratorRuntime.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                return _context17.abrupt("return", this.keyRequestHandler());

              case 1:
              case "end":
                return _context17.stop();
            }
          }
        }, _callee17, this);
      }));

      function getActiveKeyInfo() {
        return _ref17.apply(this, arguments);
      }

      return getActiveKeyInfo;
    }()
  }, {
    key: "loadLocalItems",
    value: function () {
      var _ref18 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19(callback) {
        var _this6 = this;

        return regeneratorRuntime.wrap(function _callee19$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
                this.storageManager.getAllModels.then(function (items) {
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
                    var _ref19 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18() {
                      var subitems, processedSubitems;
                      return regeneratorRuntime.wrap(function _callee18$(_context18) {
                        while (1) {
                          switch (_context18.prev = _context18.next) {
                            case 0:
                              subitems = items.slice(current, current + iteration);
                              _context18.next = 3;
                              return _this6.handleItemsResponse(subitems, null, SFModelManager.MappingSourceLocalRetrieved);

                            case 3:
                              processedSubitems = _context18.sent;

                              processed.push(processedSubitems);

                              current += subitems.length;

                              if (current < total) {
                                _this6.$timeout(function () {
                                  decryptNext();
                                });
                              } else {
                                completion();
                              }

                            case 7:
                            case "end":
                              return _context18.stop();
                          }
                        }
                      }, _callee18, _this6);
                    }));

                    return function decryptNext() {
                      return _ref19.apply(this, arguments);
                    };
                  }();

                  decryptNext();
                });

              case 1:
              case "end":
                return _context19.stop();
            }
          }
        }, _callee19, this);
      }));

      function loadLocalItems(_x30) {
        return _ref18.apply(this, arguments);
      }

      return loadLocalItems;
    }()
  }, {
    key: "writeItemsToLocalStorage",
    value: function () {
      var _ref20 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee22(items, offlineOnly) {
        var _this7 = this;

        return regeneratorRuntime.wrap(function _callee22$(_context22) {
          while (1) {
            switch (_context22.prev = _context22.next) {
              case 0:
                return _context22.abrupt("return", new Promise(function () {
                  var _ref21 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21(resolve, reject) {
                    var info;
                    return regeneratorRuntime.wrap(function _callee21$(_context21) {
                      while (1) {
                        switch (_context21.prev = _context21.next) {
                          case 0:
                            if (!(items.length == 0)) {
                              _context21.next = 3;
                              break;
                            }

                            resolve();
                            return _context21.abrupt("return");

                          case 3:
                            _context21.next = 5;
                            return _this7.getActiveKeyInfo();

                          case 5:
                            info = _context21.sent;


                            Promise.all(items.map(function () {
                              var _ref22 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20(item) {
                                var itemParams;
                                return regeneratorRuntime.wrap(function _callee20$(_context20) {
                                  while (1) {
                                    switch (_context20.prev = _context20.next) {
                                      case 0:
                                        itemParams = new SFItemParams(item, info.keys, info.version);
                                        _context20.next = 3;
                                        return itemParams.paramsForLocalStorage();

                                      case 3:
                                        itemParams = _context20.sent;

                                        if (offlineOnly) {
                                          delete itemParams.dirty;
                                        }
                                        return _context20.abrupt("return", itemParams);

                                      case 6:
                                      case "end":
                                        return _context20.stop();
                                    }
                                  }
                                }, _callee20, _this7);
                              }));

                              return function (_x35) {
                                return _ref22.apply(this, arguments);
                              };
                            }())).then(function (params) {
                              _this7.storageManager.saveModels(params).then(function () {
                                // on success
                                if (_this7.syncStatus.localError) {
                                  _this7.syncStatus.localError = null;
                                  _this7.syncStatusDidChange();
                                }
                                resolve();
                              }).catch(function (error) {
                                // on error
                                console.log("Error writing items", error);
                                _this7.syncStatus.localError = error;
                                _this7.syncStatusDidChange();
                                reject();
                              });
                            });

                          case 7:
                          case "end":
                            return _context21.stop();
                        }
                      }
                    }, _callee21, _this7);
                  }));

                  return function (_x33, _x34) {
                    return _ref21.apply(this, arguments);
                  };
                }()));

              case 1:
              case "end":
                return _context22.stop();
            }
          }
        }, _callee22, this);
      }));

      function writeItemsToLocalStorage(_x31, _x32) {
        return _ref20.apply(this, arguments);
      }

      return writeItemsToLocalStorage;
    }()
  }, {
    key: "syncOffline",
    value: function () {
      var _ref23 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee23(items, callback) {
        var _this8 = this;

        var _iteratorNormalCompletion11, _didIteratorError11, _iteratorError11, _iterator11, _step11, item;

        return regeneratorRuntime.wrap(function _callee23$(_context23) {
          while (1) {
            switch (_context23.prev = _context23.next) {
              case 0:
                // Update all items updated_at to now
                _iteratorNormalCompletion11 = true;
                _didIteratorError11 = false;
                _iteratorError11 = undefined;
                _context23.prev = 3;
                for (_iterator11 = items[Symbol.iterator](); !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                  item = _step11.value;
                  item.updated_at = new Date();
                }
                _context23.next = 11;
                break;

              case 7:
                _context23.prev = 7;
                _context23.t0 = _context23["catch"](3);
                _didIteratorError11 = true;
                _iteratorError11 = _context23.t0;

              case 11:
                _context23.prev = 11;
                _context23.prev = 12;

                if (!_iteratorNormalCompletion11 && _iterator11.return) {
                  _iterator11.return();
                }

              case 14:
                _context23.prev = 14;

                if (!_didIteratorError11) {
                  _context23.next = 17;
                  break;
                }

                throw _iteratorError11;

              case 17:
                return _context23.finish(14);

              case 18:
                return _context23.finish(11);

              case 19:
                this.writeItemsToLocalStorage(items, true).then(function (responseItems) {
                  // delete anything needing to be deleted
                  var _iteratorNormalCompletion12 = true;
                  var _didIteratorError12 = false;
                  var _iteratorError12 = undefined;

                  try {
                    for (var _iterator12 = items[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                      var item = _step12.value;

                      if (item.deleted) {
                        _this8.modelManager.removeItemLocally(item);
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

                  _this8.notifyEvent("sync:completed");
                  // Required in order for modelManager to notify sync observers
                  _this8.modelManager.didSyncModelsOffline(items);
                  callback && callback({ success: true });
                });

              case 20:
              case "end":
                return _context23.stop();
            }
          }
        }, _callee23, this, [[3, 7, 11, 19], [12,, 14, 18]]);
      }));

      function syncOffline(_x36, _x37) {
        return _ref23.apply(this, arguments);
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
    value: function markAllItemsDirtyAndSaveOffline(callback, alternateUUIDs) {
      var _this9 = this;

      // use a copy, as alternating uuid will affect array
      var originalItems = this.modelManager.allItems.filter(function (item) {
        return !item.errorDecrypting;
      }).slice();

      var block = function block() {
        var allItems = _this9.modelManager.allItems;
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

        _this9.writeItemsToLocalStorage(allItems, false).then(callback);
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
          _this9.modelManager.alternateUUIDForItem(item, alternateNextItem, true);
        };

        alternateNextItem();
      } else {
        block();
      }
    }
  }, {
    key: "getSyncURL",
    value: function () {
      var _ref24 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee24() {
        return regeneratorRuntime.wrap(function _callee24$(_context24) {
          while (1) {
            switch (_context24.prev = _context24.next) {
              case 0:
                _context24.next = 2;
                return this.getServerURL();

              case 2:
                _context24.t0 = _context24.sent;
                return _context24.abrupt("return", _context24.t0 + "/items/sync");

              case 4:
              case "end":
                return _context24.stop();
            }
          }
        }, _callee24, this);
      }));

      function getSyncURL() {
        return _ref24.apply(this, arguments);
      }

      return getSyncURL;
    }()
  }, {
    key: "setSyncToken",
    value: function () {
      var _ref25 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee25(token) {
        return regeneratorRuntime.wrap(function _callee25$(_context25) {
          while (1) {
            switch (_context25.prev = _context25.next) {
              case 0:
                this._syncToken = token;
                _context25.next = 3;
                return this.storageManager.setItem("syncToken", token);

              case 3:
              case "end":
                return _context25.stop();
            }
          }
        }, _callee25, this);
      }));

      function setSyncToken(_x38) {
        return _ref25.apply(this, arguments);
      }

      return setSyncToken;
    }()
  }, {
    key: "getSyncToken",
    value: function () {
      var _ref26 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee26() {
        return regeneratorRuntime.wrap(function _callee26$(_context26) {
          while (1) {
            switch (_context26.prev = _context26.next) {
              case 0:
                if (this._syncToken) {
                  _context26.next = 4;
                  break;
                }

                _context26.next = 3;
                return this.storageManager.getItem("syncToken");

              case 3:
                this._syncToken = _context26.sent;

              case 4:
                return _context26.abrupt("return", this._syncToken);

              case 5:
              case "end":
                return _context26.stop();
            }
          }
        }, _callee26, this);
      }));

      function getSyncToken() {
        return _ref26.apply(this, arguments);
      }

      return getSyncToken;
    }()
  }, {
    key: "clearSyncToken",
    value: function () {
      var _ref27 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee27() {
        return regeneratorRuntime.wrap(function _callee27$(_context27) {
          while (1) {
            switch (_context27.prev = _context27.next) {
              case 0:
                return _context27.abrupt("return", this.storageManager.removeItem("syncToken"));

              case 1:
              case "end":
                return _context27.stop();
            }
          }
        }, _callee27, this);
      }));

      function clearSyncToken() {
        return _ref27.apply(this, arguments);
      }

      return clearSyncToken;
    }()
  }, {
    key: "setCursorToken",
    value: function () {
      var _ref28 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee28(token) {
        return regeneratorRuntime.wrap(function _callee28$(_context28) {
          while (1) {
            switch (_context28.prev = _context28.next) {
              case 0:
                this._cursorToken = token;

                if (!token) {
                  _context28.next = 6;
                  break;
                }

                _context28.next = 4;
                return this.storageManager.setItem("cursorToken", token);

              case 4:
                _context28.next = 8;
                break;

              case 6:
                _context28.next = 8;
                return this.storageManager.removeItem("cursorToken");

              case 8:
              case "end":
                return _context28.stop();
            }
          }
        }, _callee28, this);
      }));

      function setCursorToken(_x39) {
        return _ref28.apply(this, arguments);
      }

      return setCursorToken;
    }()
  }, {
    key: "getCursorToken",
    value: function () {
      var _ref29 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee29() {
        return regeneratorRuntime.wrap(function _callee29$(_context29) {
          while (1) {
            switch (_context29.prev = _context29.next) {
              case 0:
                if (this._cursorToken) {
                  _context29.next = 4;
                  break;
                }

                _context29.next = 3;
                return this.storageManager.getItem("cursorToken");

              case 3:
                this._cursorToken = _context29.sent;

              case 4:
                return _context29.abrupt("return", this._cursorToken);

              case 5:
              case "end":
                return _context29.stop();
            }
          }
        }, _callee29, this);
      }));

      function getCursorToken() {
        return _ref29.apply(this, arguments);
      }

      return getCursorToken;
    }()
  }, {
    key: "clearQueuedCallbacks",
    value: function clearQueuedCallbacks() {
      this._queuedCallbacks = [];
    }
  }, {
    key: "callQueuedCallbacksAndCurrent",
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
    key: "beginCheckingIfSyncIsTakingTooLong",
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
    key: "stopCheckingIfSyncIsTakingTooLong",
    value: function stopCheckingIfSyncIsTakingTooLong() {
      if (this.$interval.hasOwnProperty("cancel")) {
        this.$interval.cancel(this.syncStatus.checker);
      } else {
        clearInterval(this.syncStatus.checker);
      }
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
      var _ref30 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee31(callback) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var source = arguments[2];

        var allDirtyItems, info, isContinuationSync, submitLimit, subItems, params, _iteratorNormalCompletion15, _didIteratorError15, _iteratorError15, _iterator15, _step15, item, onSyncCompletion, onSyncSuccess;

        return regeneratorRuntime.wrap(function _callee31$(_context31) {
          while (1) {
            switch (_context31.prev = _context31.next) {
              case 0:
                if (!this.syncLocked) {
                  _context31.next = 3;
                  break;
                }

                console.log("Sync Locked, Returning;");
                return _context31.abrupt("return");

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
                  _context31.next = 12;
                  break;
                }

                this.repeatOnCompletion = true;
                if (callback) {
                  this.queuedCallbacks.push(callback);
                }

                // write to local storage nonetheless, since some users may see several second delay in server response.
                // if they close the browser before the ongoing sync request completes, local changes will be lost if we dont save here
                this.writeItemsToLocalStorage(allDirtyItems, false);

                console.log("Sync op in progress; returning.");
                return _context31.abrupt("return");

              case 12:
                _context31.next = 14;
                return this.getActiveKeyInfo();

              case 14:
                info = _context31.sent;

                if (!info.offline) {
                  _context31.next = 19;
                  break;
                }

                this.syncOffline(allDirtyItems, callback);
                this.modelManager.clearDirtyItems(allDirtyItems);
                return _context31.abrupt("return");

              case 19:
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

                _context31.next = 34;
                return Promise.all(subItems.map(function (item) {
                  var itemParams = new SFItemParams(item, info.keys, info.version);
                  itemParams.additionalFields = options.additionalFields;
                  return itemParams.paramsForSync();
                })).then(function (itemsParams) {
                  params.items = itemsParams;
                });

              case 34:
                _iteratorNormalCompletion15 = true;
                _didIteratorError15 = false;
                _iteratorError15 = undefined;
                _context31.prev = 37;


                for (_iterator15 = subItems[Symbol.iterator](); !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
                  item = _step15.value;

                  // Reset dirty counter to 0, since we're about to sync it.
                  // This means anyone marking the item as dirty after this will cause it so sync again and not be cleared on sync completion.
                  item.dirtyCount = 0;
                }

                _context31.next = 45;
                break;

              case 41:
                _context31.prev = 41;
                _context31.t0 = _context31["catch"](37);
                _didIteratorError15 = true;
                _iteratorError15 = _context31.t0;

              case 45:
                _context31.prev = 45;
                _context31.prev = 46;

                if (!_iteratorNormalCompletion15 && _iterator15.return) {
                  _iterator15.return();
                }

              case 48:
                _context31.prev = 48;

                if (!_didIteratorError15) {
                  _context31.next = 51;
                  break;
                }

                throw _iteratorError15;

              case 51:
                return _context31.finish(48);

              case 52:
                return _context31.finish(45);

              case 53:
                _context31.next = 55;
                return this.getSyncToken();

              case 55:
                params.sync_token = _context31.sent;
                _context31.next = 58;
                return this.getCursorToken();

              case 58:
                params.cursor_token = _context31.sent;

                onSyncCompletion = function (response) {
                  this.stopCheckingIfSyncIsTakingTooLong();
                }.bind(this);

                onSyncSuccess = function () {
                  var _ref31 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee30(response) {
                    var itemsToClearAsDirty, _iteratorNormalCompletion16, _didIteratorError16, _iteratorError16, _iterator16, _step16, item, allSavedUUIDs, retrieved, omitFields, saved, unsaved, majorDataChangeThreshold;

                    return regeneratorRuntime.wrap(function _callee30$(_context30) {
                      while (1) {
                        switch (_context30.prev = _context30.next) {
                          case 0:
                            // Check to make sure any subItem hasn't been marked as dirty again while a sync was ongoing
                            itemsToClearAsDirty = [];
                            _iteratorNormalCompletion16 = true;
                            _didIteratorError16 = false;
                            _iteratorError16 = undefined;
                            _context30.prev = 4;

                            for (_iterator16 = subItems[Symbol.iterator](); !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
                              item = _step16.value;

                              if (item.dirtyCount == 0) {
                                // Safe to clear as dirty
                                itemsToClearAsDirty.push(item);
                              }
                            }
                            _context30.next = 12;
                            break;

                          case 8:
                            _context30.prev = 8;
                            _context30.t0 = _context30["catch"](4);
                            _didIteratorError16 = true;
                            _iteratorError16 = _context30.t0;

                          case 12:
                            _context30.prev = 12;
                            _context30.prev = 13;

                            if (!_iteratorNormalCompletion16 && _iterator16.return) {
                              _iterator16.return();
                            }

                          case 15:
                            _context30.prev = 15;

                            if (!_didIteratorError16) {
                              _context30.next = 18;
                              break;
                            }

                            throw _iteratorError16;

                          case 18:
                            return _context30.finish(15);

                          case 19:
                            return _context30.finish(12);

                          case 20:
                            this.modelManager.clearDirtyItems(itemsToClearAsDirty);
                            this.syncStatus.error = null;

                            _context30.t1 = this;
                            _context30.next = 25;
                            return this.getSyncToken();

                          case 25:
                            _context30.t2 = _context30.sent;

                            _context30.t1.notifyEvent.call(_context30.t1, "sync:updated_token", _context30.t2);

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
                            _context30.next = 31;
                            return this.handleItemsResponse(response.retrieved_items, null, SFModelManager.MappingSourceRemoteRetrieved);

                          case 31:
                            retrieved = _context30.sent;


                            // Append items to master list of retrieved items for this ongoing sync operation
                            this.allRetreivedItems = this.allRetreivedItems.concat(retrieved);

                            // Merge only metadata for saved items
                            // we write saved items to disk now because it clears their dirty status then saves
                            // if we saved items before completion, we had have to save them as dirty and save them again on success as clean
                            omitFields = ["content", "auth_hash"];

                            // Map saved items to local data

                            _context30.next = 36;
                            return this.handleItemsResponse(response.saved_items, omitFields, SFModelManager.MappingSourceRemoteSaved);

                          case 36:
                            saved = _context30.sent;


                            // Append items to master list of saved items for this ongoing sync operation
                            this.allSavedItems = this.allSavedItems.concat(saved);

                            // Create copies of items or alternate their uuids if neccessary
                            unsaved = response.unsaved;

                            this.handleUnsavedItemsResponse(unsaved);

                            _context30.next = 42;
                            return this.writeItemsToLocalStorage(saved, false);

                          case 42:

                            this.syncStatus.syncOpInProgress = false;
                            this.syncStatus.current += subItems.length;

                            // set the sync token at the end, so that if any errors happen above, you can resync
                            this.setSyncToken(response.sync_token);
                            this.setCursorToken(response.cursor_token);

                            onSyncCompletion(response);

                            _context30.next = 49;
                            return this.getCursorToken();

                          case 49:
                            _context30.t3 = _context30.sent;

                            if (_context30.t3) {
                              _context30.next = 52;
                              break;
                            }

                            _context30.t3 = this.syncStatus.needsMoreSync;

                          case 52:
                            if (!_context30.t3) {
                              _context30.next = 56;
                              break;
                            }

                            setTimeout(function () {
                              this.sync(callback, options, "onSyncSuccess cursorToken || needsMoreSync");
                            }.bind(this), 10); // wait 10ms to allow UI to update
                            _context30.next = 69;
                            break;

                          case 56:
                            if (!this.repeatOnCompletion) {
                              _context30.next = 61;
                              break;
                            }

                            this.repeatOnCompletion = false;
                            setTimeout(function () {
                              this.sync(callback, options, "onSyncSuccess repeatOnCompletion");
                            }.bind(this), 10); // wait 10ms to allow UI to update
                            _context30.next = 69;
                            break;

                          case 61:
                            _context30.next = 63;
                            return this.writeItemsToLocalStorage(this.allRetreivedItems, false);

                          case 63:

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

                          case 69:
                          case "end":
                            return _context30.stop();
                        }
                      }
                    }, _callee30, this, [[4, 8, 12, 20], [13,, 15, 19]]);
                  }));

                  return function (_x42) {
                    return _ref31.apply(this, arguments);
                  };
                }().bind(this);

                _context31.prev = 61;
                _context31.t1 = this.httpManager;
                _context31.next = 65;
                return this.getSyncURL();

              case 65:
                _context31.t2 = _context31.sent;
                _context31.t3 = params;

                _context31.t4 = function (response) {

                  try {
                    onSyncSuccess(response);
                  } catch (e) {
                    console.log("Caught sync success exception:", e);
                  }
                }.bind(this);

                _context31.t5 = function (response, statusCode) {
                  if (statusCode == 401) {
                    alert("Your session has expired. New changes will not be pulled in. Please sign out and sign back in to refresh your session.");
                  }
                  console.log("Sync error: ", response);
                  var error = response ? response.error : { message: "Could not connect to server." };

                  this.syncStatus.syncOpInProgress = false;
                  this.syncStatus.error = error;
                  this.writeItemsToLocalStorage(allDirtyItems, false);

                  onSyncCompletion(response);

                  this.notifyEvent("sync:error", error);

                  this.callQueuedCallbacksAndCurrent(callback, { error: "Sync error" });
                }.bind(this);

                _context31.t1.postAbsolute.call(_context31.t1, _context31.t2, _context31.t3, _context31.t4, _context31.t5);

                _context31.next = 75;
                break;

              case 72:
                _context31.prev = 72;
                _context31.t6 = _context31["catch"](61);

                console.log("Sync exception caught:", _context31.t6);

              case 75:
              case "end":
                return _context31.stop();
            }
          }
        }, _callee31, this, [[37, 41, 45, 53], [46,, 48, 52], [61, 72]]);
      }));

      function sync(_x41) {
        return _ref30.apply(this, arguments);
      }

      return sync;
    }()
  }, {
    key: "handleItemsResponse",
    value: function () {
      var _ref32 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee32(responseItems, omitFields, source) {
        var keys, items, itemsWithErrorStatusChange;
        return regeneratorRuntime.wrap(function _callee32$(_context32) {
          while (1) {
            switch (_context32.prev = _context32.next) {
              case 0:
                _context32.next = 2;
                return this.getActiveKeyInfo();

              case 2:
                keys = _context32.sent.keys;
                _context32.next = 5;
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

                return _context32.abrupt("return", items);

              case 9:
              case "end":
                return _context32.stop();
            }
          }
        }, _callee32, this);
      }));

      function handleItemsResponse(_x43, _x44, _x45) {
        return _ref32.apply(this, arguments);
      }

      return handleItemsResponse;
    }()
  }, {
    key: "refreshErroredItems",
    value: function refreshErroredItems() {
      var erroredItems = this.modelManager.allItems.filter(function (item) {
        return item.errorDecrypting == true;
      });
      if (erroredItems.length > 0) {
        this.handleItemsResponse(erroredItems, null, SFModelManager.MappingSourceLocalRetrieved);
      }
    }
  }, {
    key: "handleUnsavedItemsResponse",
    value: function () {
      var _ref33 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee34(unsaved) {
        var _this10 = this;

        var i, handleNext;
        return regeneratorRuntime.wrap(function _callee34$(_context34) {
          while (1) {
            switch (_context34.prev = _context34.next) {
              case 0:
                if (!(unsaved.length == 0)) {
                  _context34.next = 2;
                  break;
                }

                return _context34.abrupt("return");

              case 2:

                console.log("Handle unsaved", unsaved);

                i = 0;

                handleNext = function () {
                  var _ref34 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee33() {
                    var mapping, itemResponse, item, error, dup;
                    return regeneratorRuntime.wrap(function _callee33$(_context33) {
                      while (1) {
                        switch (_context33.prev = _context33.next) {
                          case 0:
                            if (!(i >= unsaved.length)) {
                              _context33.next = 3;
                              break;
                            }

                            // Handled all items
                            _this10.sync(null, { additionalFields: ["created_at", "updated_at"] });
                            return _context33.abrupt("return");

                          case 3:
                            mapping = unsaved[i];
                            itemResponse = mapping.item;
                            _context33.t0 = SFJS.itemTransformer;
                            _context33.t1 = [itemResponse];
                            _context33.next = 9;
                            return _this10.getActiveKeyInfo();

                          case 9:
                            _context33.t2 = _context33.sent.keys;
                            _context33.next = 12;
                            return _context33.t0.decryptMultipleItems.call(_context33.t0, _context33.t1, _context33.t2);

                          case 12:
                            item = _this10.modelManager.findItem(itemResponse.uuid);

                            if (item) {
                              _context33.next = 15;
                              break;
                            }

                            return _context33.abrupt("return");

                          case 15:
                            error = mapping.error;


                            if (error.tag === "uuid_conflict") {
                              // UUID conflicts can occur if a user attempts to
                              // import an old data archive with uuids from the old account into a new account
                              _this10.modelManager.alternateUUIDForItem(item, function () {
                                i++;
                                handleNext();
                              }, true);
                            } else if (error.tag === "sync_conflict") {
                              // Create a new item with the same contents of this item if the contents differ

                              // We want a new uuid for the new item. Note that this won't neccessarily adjust references.
                              itemResponse.uuid = null;

                              dup = _this10.modelManager.createDuplicateItem(itemResponse);

                              if (!itemResponse.deleted && !item.isItemContentEqualWith(dup)) {
                                _this10.modelManager.addItem(dup);
                                dup.conflict_of = item.uuid;
                                dup.setDirty(true);
                              }

                              i++;
                              handleNext();
                            }

                          case 17:
                          case "end":
                            return _context33.stop();
                        }
                      }
                    }, _callee33, _this10);
                  }));

                  return function handleNext() {
                    return _ref34.apply(this, arguments);
                  };
                }();

                handleNext();

              case 6:
              case "end":
                return _context34.stop();
            }
          }
        }, _callee34, this);
      }));

      function handleUnsavedItemsResponse(_x46) {
        return _ref33.apply(this, arguments);
      }

      return handleUnsavedItemsResponse;
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
      var _ref35 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee35(includeDeleted) {
        var result;
        return regeneratorRuntime.wrap(function _callee35$(_context35) {
          while (1) {
            switch (_context35.prev = _context35.next) {
              case 0:
                this.additionalFields = ["updated_at"];
                this.forExportFile = true;

                if (!includeDeleted) {
                  _context35.next = 6;
                  break;
                }

                return _context35.abrupt("return", this.__params());

              case 6:
                _context35.next = 8;
                return this.__params();

              case 8:
                result = _context35.sent;
                return _context35.abrupt("return", _.omit(result, ["deleted"]));

              case 10:
              case "end":
                return _context35.stop();
            }
          }
        }, _callee35, this);
      }));

      function paramsForExportFile(_x48) {
        return _ref35.apply(this, arguments);
      }

      return paramsForExportFile;
    }()
  }, {
    key: "paramsForExtension",
    value: function () {
      var _ref36 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee36() {
        return regeneratorRuntime.wrap(function _callee36$(_context36) {
          while (1) {
            switch (_context36.prev = _context36.next) {
              case 0:
                return _context36.abrupt("return", this.paramsForExportFile());

              case 1:
              case "end":
                return _context36.stop();
            }
          }
        }, _callee36, this);
      }));

      function paramsForExtension() {
        return _ref36.apply(this, arguments);
      }

      return paramsForExtension;
    }()
  }, {
    key: "paramsForLocalStorage",
    value: function () {
      var _ref37 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee37() {
        return regeneratorRuntime.wrap(function _callee37$(_context37) {
          while (1) {
            switch (_context37.prev = _context37.next) {
              case 0:
                this.additionalFields = ["updated_at", "dirty", "errorDecrypting"];
                this.forExportFile = true;
                return _context37.abrupt("return", this.__params());

              case 3:
              case "end":
                return _context37.stop();
            }
          }
        }, _callee37, this);
      }));

      function paramsForLocalStorage() {
        return _ref37.apply(this, arguments);
      }

      return paramsForLocalStorage;
    }()
  }, {
    key: "paramsForSync",
    value: function () {
      var _ref38 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee38() {
        return regeneratorRuntime.wrap(function _callee38$(_context38) {
          while (1) {
            switch (_context38.prev = _context38.next) {
              case 0:
                return _context38.abrupt("return", this.__params());

              case 1:
              case "end":
                return _context38.stop();
            }
          }
        }, _callee38, this);
      }));

      function paramsForSync() {
        return _ref38.apply(this, arguments);
      }

      return paramsForSync;
    }()
  }, {
    key: "__params",
    value: function () {
      var _ref39 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee39() {
        var params, doNotEncrypt, encryptedParams;
        return regeneratorRuntime.wrap(function _callee39$(_context39) {
          while (1) {
            switch (_context39.prev = _context39.next) {
              case 0:

                console.assert(!this.item.dummy, "Item is dummy, should not have gotten here.", this.item.dummy);

                params = { uuid: this.item.uuid, content_type: this.item.content_type, deleted: this.item.deleted, created_at: this.item.created_at };

                if (this.item.errorDecrypting) {
                  _context39.next = 24;
                  break;
                }

                // Items should always be encrypted for export files. Only respect item.doNotEncrypt for remote sync params.
                doNotEncrypt = this.item.doNotEncrypt() && !this.forExportFile;

                if (!(this.keys && !doNotEncrypt)) {
                  _context39.next = 12;
                  break;
                }

                _context39.next = 7;
                return SFJS.itemTransformer.encryptItem(this.item, this.keys, this.version);

              case 7:
                encryptedParams = _context39.sent;

                _.merge(params, encryptedParams);

                if (this.version !== "001") {
                  params.auth_hash = null;
                }
                _context39.next = 22;
                break;

              case 12:
                if (!this.forExportFile) {
                  _context39.next = 16;
                  break;
                }

                _context39.t0 = this.item.createContentJSONFromProperties();
                _context39.next = 20;
                break;

              case 16:
                _context39.next = 18;
                return SFJS.crypto.base64(JSON.stringify(this.item.createContentJSONFromProperties()));

              case 18:
                _context39.t1 = _context39.sent;
                _context39.t0 = "000" + _context39.t1;

              case 20:
                params.content = _context39.t0;

                if (!this.forExportFile) {
                  params.enc_item_key = null;
                  params.auth_hash = null;
                }

              case 22:
                _context39.next = 27;
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

                return _context39.abrupt("return", params);

              case 29:
              case "end":
                return _context39.stop();
            }
          }
        }, _callee39, this);
      }));

      function __params() {
        return _ref39.apply(this, arguments);
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
      var _ref40 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee40() {
        var _ref41 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            ciphertextToAuth = _ref41.ciphertextToAuth,
            contentCiphertext = _ref41.contentCiphertext,
            encryptionKey = _ref41.encryptionKey,
            iv = _ref41.iv,
            authHash = _ref41.authHash,
            authKey = _ref41.authKey;

        var requiresAuth = arguments[1];
        var localAuthHash, keyData, ivData, decrypted;
        return regeneratorRuntime.wrap(function _callee40$(_context40) {
          while (1) {
            switch (_context40.prev = _context40.next) {
              case 0:
                if (!(requiresAuth && !authHash)) {
                  _context40.next = 3;
                  break;
                }

                console.error("Auth hash is required.");
                return _context40.abrupt("return");

              case 3:
                if (!authHash) {
                  _context40.next = 10;
                  break;
                }

                _context40.next = 6;
                return this.hmac256(ciphertextToAuth, authKey);

              case 6:
                localAuthHash = _context40.sent;

                if (!(authHash !== localAuthHash)) {
                  _context40.next = 10;
                  break;
                }

                console.error("Auth hash does not match, returning null.");
                return _context40.abrupt("return", null);

              case 10:
                keyData = CryptoJS.enc.Hex.parse(encryptionKey);
                ivData = CryptoJS.enc.Hex.parse(iv || "");
                decrypted = CryptoJS.AES.decrypt(contentCiphertext, keyData, { iv: ivData, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
                return _context40.abrupt("return", decrypted.toString(CryptoJS.enc.Utf8));

              case 14:
              case "end":
                return _context40.stop();
            }
          }
        }, _callee40, this);
      }));

      function decryptText() {
        return _ref40.apply(this, arguments);
      }

      return decryptText;
    }()
  }, {
    key: "encryptText",
    value: function () {
      var _ref42 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee41(text, key, iv) {
        var keyData, ivData, encrypted;
        return regeneratorRuntime.wrap(function _callee41$(_context41) {
          while (1) {
            switch (_context41.prev = _context41.next) {
              case 0:
                keyData = CryptoJS.enc.Hex.parse(key);
                ivData = CryptoJS.enc.Hex.parse(iv || "");
                encrypted = CryptoJS.AES.encrypt(text, keyData, { iv: ivData, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
                return _context41.abrupt("return", encrypted.toString());

              case 4:
              case "end":
                return _context41.stop();
            }
          }
        }, _callee41, this);
      }));

      function encryptText(_x50, _x51, _x52) {
        return _ref42.apply(this, arguments);
      }

      return encryptText;
    }()
  }, {
    key: "generateRandomKey",
    value: function () {
      var _ref43 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee42(bits) {
        return regeneratorRuntime.wrap(function _callee42$(_context42) {
          while (1) {
            switch (_context42.prev = _context42.next) {
              case 0:
                return _context42.abrupt("return", CryptoJS.lib.WordArray.random(bits / 8).toString());

              case 1:
              case "end":
                return _context42.stop();
            }
          }
        }, _callee42, this);
      }));

      function generateRandomKey(_x53) {
        return _ref43.apply(this, arguments);
      }

      return generateRandomKey;
    }()
  }, {
    key: "generateItemEncryptionKey",
    value: function () {
      var _ref44 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee43() {
        var length, cost, salt, passphrase;
        return regeneratorRuntime.wrap(function _callee43$(_context43) {
          while (1) {
            switch (_context43.prev = _context43.next) {
              case 0:
                // Generates a key that will be split in half, each being 256 bits. So total length will need to be 512.
                length = 512;
                cost = 1;
                _context43.next = 4;
                return this.generateRandomKey(length);

              case 4:
                salt = _context43.sent;
                _context43.next = 7;
                return this.generateRandomKey(length);

              case 7:
                passphrase = _context43.sent;
                return _context43.abrupt("return", this.pbkdf2(passphrase, salt, cost, length));

              case 9:
              case "end":
                return _context43.stop();
            }
          }
        }, _callee43, this);
      }));

      function generateItemEncryptionKey() {
        return _ref44.apply(this, arguments);
      }

      return generateItemEncryptionKey;
    }()
  }, {
    key: "firstHalfOfKey",
    value: function () {
      var _ref45 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee44(key) {
        return regeneratorRuntime.wrap(function _callee44$(_context44) {
          while (1) {
            switch (_context44.prev = _context44.next) {
              case 0:
                return _context44.abrupt("return", key.substring(0, key.length / 2));

              case 1:
              case "end":
                return _context44.stop();
            }
          }
        }, _callee44, this);
      }));

      function firstHalfOfKey(_x54) {
        return _ref45.apply(this, arguments);
      }

      return firstHalfOfKey;
    }()
  }, {
    key: "secondHalfOfKey",
    value: function () {
      var _ref46 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee45(key) {
        return regeneratorRuntime.wrap(function _callee45$(_context45) {
          while (1) {
            switch (_context45.prev = _context45.next) {
              case 0:
                return _context45.abrupt("return", key.substring(key.length / 2, key.length));

              case 1:
              case "end":
                return _context45.stop();
            }
          }
        }, _callee45, this);
      }));

      function secondHalfOfKey(_x55) {
        return _ref46.apply(this, arguments);
      }

      return secondHalfOfKey;
    }()
  }, {
    key: "base64",
    value: function () {
      var _ref47 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee46(text) {
        return regeneratorRuntime.wrap(function _callee46$(_context46) {
          while (1) {
            switch (_context46.prev = _context46.next) {
              case 0:
                return _context46.abrupt("return", window.btoa(text));

              case 1:
              case "end":
                return _context46.stop();
            }
          }
        }, _callee46, this);
      }));

      function base64(_x56) {
        return _ref47.apply(this, arguments);
      }

      return base64;
    }()
  }, {
    key: "base64Decode",
    value: function () {
      var _ref48 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee47(base64String) {
        return regeneratorRuntime.wrap(function _callee47$(_context47) {
          while (1) {
            switch (_context47.prev = _context47.next) {
              case 0:
                return _context47.abrupt("return", window.atob(base64String));

              case 1:
              case "end":
                return _context47.stop();
            }
          }
        }, _callee47, this);
      }));

      function base64Decode(_x57) {
        return _ref48.apply(this, arguments);
      }

      return base64Decode;
    }()
  }, {
    key: "sha256",
    value: function () {
      var _ref49 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee48(text) {
        return regeneratorRuntime.wrap(function _callee48$(_context48) {
          while (1) {
            switch (_context48.prev = _context48.next) {
              case 0:
                return _context48.abrupt("return", CryptoJS.SHA256(text).toString());

              case 1:
              case "end":
                return _context48.stop();
            }
          }
        }, _callee48, this);
      }));

      function sha256(_x58) {
        return _ref49.apply(this, arguments);
      }

      return sha256;
    }()
  }, {
    key: "hmac256",
    value: function () {
      var _ref50 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee49(message, key) {
        var keyData, messageData, result;
        return regeneratorRuntime.wrap(function _callee49$(_context49) {
          while (1) {
            switch (_context49.prev = _context49.next) {
              case 0:
                keyData = CryptoJS.enc.Hex.parse(key);
                messageData = CryptoJS.enc.Utf8.parse(message);
                result = CryptoJS.HmacSHA256(messageData, keyData).toString();
                return _context49.abrupt("return", result);

              case 4:
              case "end":
                return _context49.stop();
            }
          }
        }, _callee49, this);
      }));

      function hmac256(_x59, _x60) {
        return _ref50.apply(this, arguments);
      }

      return hmac256;
    }()
  }, {
    key: "generateSalt",
    value: function () {
      var _ref51 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee50(identifier, version, cost, nonce) {
        var result;
        return regeneratorRuntime.wrap(function _callee50$(_context50) {
          while (1) {
            switch (_context50.prev = _context50.next) {
              case 0:
                _context50.next = 2;
                return this.sha256([identifier, "SF", version, cost, nonce].join(":"));

              case 2:
                result = _context50.sent;
                return _context50.abrupt("return", result);

              case 4:
              case "end":
                return _context50.stop();
            }
          }
        }, _callee50, this);
      }));

      function generateSalt(_x61, _x62, _x63, _x64) {
        return _ref51.apply(this, arguments);
      }

      return generateSalt;
    }()

    /** Generates two deterministic keys based on one input */

  }, {
    key: "generateSymmetricKeyPair",
    value: function () {
      var _ref52 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee51() {
        var _ref53 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            password = _ref53.password,
            pw_salt = _ref53.pw_salt,
            pw_cost = _ref53.pw_cost;

        var output, outputLength, splitLength, firstThird, secondThird, thirdThird;
        return regeneratorRuntime.wrap(function _callee51$(_context51) {
          while (1) {
            switch (_context51.prev = _context51.next) {
              case 0:
                _context51.next = 2;
                return this.pbkdf2(password, pw_salt, pw_cost, this.DefaultPBKDF2Length);

              case 2:
                output = _context51.sent;
                outputLength = output.length;
                splitLength = outputLength / 3;
                firstThird = output.slice(0, splitLength);
                secondThird = output.slice(splitLength, splitLength * 2);
                thirdThird = output.slice(splitLength * 2, splitLength * 3);
                return _context51.abrupt("return", [firstThird, secondThird, thirdThird]);

              case 9:
              case "end":
                return _context51.stop();
            }
          }
        }, _callee51, this);
      }));

      function generateSymmetricKeyPair() {
        return _ref52.apply(this, arguments);
      }

      return generateSymmetricKeyPair;
    }()
  }, {
    key: "computeEncryptionKeysForUser",
    value: function () {
      var _ref54 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee52(password, authParams) {
        var pw_salt;
        return regeneratorRuntime.wrap(function _callee52$(_context52) {
          while (1) {
            switch (_context52.prev = _context52.next) {
              case 0:
                if (!(authParams.version == "003")) {
                  _context52.next = 9;
                  break;
                }

                if (authParams.identifier) {
                  _context52.next = 4;
                  break;
                }

                console.error("authParams is missing identifier.");
                return _context52.abrupt("return");

              case 4:
                _context52.next = 6;
                return this.generateSalt(authParams.identifier, authParams.version, authParams.pw_cost, authParams.pw_nonce);

              case 6:
                pw_salt = _context52.sent;
                _context52.next = 10;
                break;

              case 9:
                // Salt is returned from server
                pw_salt = authParams.pw_salt;

              case 10:
                return _context52.abrupt("return", this.generateSymmetricKeyPair({ password: password, pw_salt: pw_salt, pw_cost: authParams.pw_cost }).then(function (keys) {
                  var userKeys = { pw: keys[0], mk: keys[1], ak: keys[2] };
                  return userKeys;
                }));

              case 11:
              case "end":
                return _context52.stop();
            }
          }
        }, _callee52, this);
      }));

      function computeEncryptionKeysForUser(_x66, _x67) {
        return _ref54.apply(this, arguments);
      }

      return computeEncryptionKeysForUser;
    }()

    // Unlike computeEncryptionKeysForUser, this method always uses the latest SF Version

  }, {
    key: "generateInitialKeysAndAuthParamsForUser",
    value: function () {
      var _ref55 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee53(identifier, password) {
        var version, pw_cost, pw_nonce, pw_salt;
        return regeneratorRuntime.wrap(function _callee53$(_context53) {
          while (1) {
            switch (_context53.prev = _context53.next) {
              case 0:
                version = this.SFJS.version;
                pw_cost = this.SFJS.defaultPasswordGenerationCost;
                _context53.next = 4;
                return this.generateRandomKey(256);

              case 4:
                pw_nonce = _context53.sent;
                _context53.next = 7;
                return this.generateSalt(identifier, version, pw_cost, pw_nonce);

              case 7:
                pw_salt = _context53.sent;
                return _context53.abrupt("return", this.generateSymmetricKeyPair({ password: password, pw_salt: pw_salt, pw_cost: pw_cost }).then(function (keys) {
                  var authParams = { pw_nonce: pw_nonce, pw_cost: pw_cost, identifier: identifier, version: version };
                  var userKeys = { pw: keys[0], mk: keys[1], ak: keys[2] };
                  return { keys: userKeys, authParams: authParams };
                }));

              case 9:
              case "end":
                return _context53.stop();
            }
          }
        }, _callee53, this);
      }));

      function generateInitialKeysAndAuthParamsForUser(_x68, _x69) {
        return _ref55.apply(this, arguments);
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
      var _ref56 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee54(password, pw_salt, pw_cost, length) {
        var params;
        return regeneratorRuntime.wrap(function _callee54$(_context54) {
          while (1) {
            switch (_context54.prev = _context54.next) {
              case 0:
                params = {
                  keySize: length / 32,
                  hasher: CryptoJS.algo.SHA512,
                  iterations: pw_cost
                };
                return _context54.abrupt("return", CryptoJS.PBKDF2(password, pw_salt, params).toString());

              case 2:
              case "end":
                return _context54.stop();
            }
          }
        }, _callee54, this);
      }));

      function pbkdf2(_x70, _x71, _x72, _x73) {
        return _ref56.apply(this, arguments);
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
      var _ref57 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee55(password, pw_salt, pw_cost, length) {
        var key;
        return regeneratorRuntime.wrap(function _callee55$(_context55) {
          while (1) {
            switch (_context55.prev = _context55.next) {
              case 0:
                _context55.next = 2;
                return this.webCryptoImportKey(password, "PBKDF2", "deriveBits");

              case 2:
                key = _context55.sent;

                if (key) {
                  _context55.next = 6;
                  break;
                }

                console.log("Key is null, unable to continue");
                return _context55.abrupt("return", null);

              case 6:
                return _context55.abrupt("return", this.webCryptoDeriveBits(key, pw_salt, pw_cost, length));

              case 7:
              case "end":
                return _context55.stop();
            }
          }
        }, _callee55, this);
      }));

      function pbkdf2(_x74, _x75, _x76, _x77) {
        return _ref57.apply(this, arguments);
      }

      return pbkdf2;
    }()
  }, {
    key: "generateRandomKey",
    value: function () {
      var _ref58 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee56(bits) {
        var _this13 = this;

        var extractable;
        return regeneratorRuntime.wrap(function _callee56$(_context56) {
          while (1) {
            switch (_context56.prev = _context56.next) {
              case 0:
                extractable = true;
                return _context56.abrupt("return", subtleCrypto.generateKey({ name: "AES-CBC", length: bits }, extractable, ["encrypt", "decrypt"]).then(function (keyObject) {
                  return subtleCrypto.exportKey("raw", keyObject).then(function (keyData) {
                    var key = _this13.arrayBufferToHexString(new Uint8Array(keyData));
                    return key;
                  }).catch(function (err) {
                    console.error("Error exporting key", err);
                  });
                }).catch(function (err) {
                  console.error("Error generating key", err);
                }));

              case 2:
              case "end":
                return _context56.stop();
            }
          }
        }, _callee56, this);
      }));

      function generateRandomKey(_x78) {
        return _ref58.apply(this, arguments);
      }

      return generateRandomKey;
    }()
  }, {
    key: "generateItemEncryptionKey",
    value: function () {
      var _ref59 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee57() {
        var length;
        return regeneratorRuntime.wrap(function _callee57$(_context57) {
          while (1) {
            switch (_context57.prev = _context57.next) {
              case 0:
                // Generates a key that will be split in half, each being 256 bits. So total length will need to be 512.
                length = 256;
                return _context57.abrupt("return", Promise.all([this.generateRandomKey(length), this.generateRandomKey(length)]).then(function (values) {
                  return values.join("");
                }));

              case 2:
              case "end":
                return _context57.stop();
            }
          }
        }, _callee57, this);
      }));

      function generateItemEncryptionKey() {
        return _ref59.apply(this, arguments);
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
      var _ref60 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee58(input, alg, action) {
        var text;
        return regeneratorRuntime.wrap(function _callee58$(_context58) {
          while (1) {
            switch (_context58.prev = _context58.next) {
              case 0:
                text = typeof input === "string" ? this.stringToArrayBuffer(input) : input;
                return _context58.abrupt("return", subtleCrypto.importKey("raw", text, { name: alg }, false, [action]).then(function (key) {
                  return key;
                }).catch(function (err) {
                  console.error(err);
                  return null;
                }));

              case 2:
              case "end":
                return _context58.stop();
            }
          }
        }, _callee58, this);
      }));

      function webCryptoImportKey(_x79, _x80, _x81) {
        return _ref60.apply(this, arguments);
      }

      return webCryptoImportKey;
    }()
  }, {
    key: "webCryptoDeriveBits",
    value: function () {
      var _ref61 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee59(key, pw_salt, pw_cost, length) {
        var _this14 = this;

        var params;
        return regeneratorRuntime.wrap(function _callee59$(_context59) {
          while (1) {
            switch (_context59.prev = _context59.next) {
              case 0:
                params = {
                  "name": "PBKDF2",
                  salt: this.stringToArrayBuffer(pw_salt),
                  iterations: pw_cost,
                  hash: { name: "SHA-512" }
                };
                return _context59.abrupt("return", subtleCrypto.deriveBits(params, key, length).then(function (bits) {
                  var key = _this14.arrayBufferToHexString(new Uint8Array(bits));
                  return key;
                }).catch(function (err) {
                  console.error(err);
                  return null;
                }));

              case 2:
              case "end":
                return _context59.stop();
            }
          }
        }, _callee59, this);
      }));

      function webCryptoDeriveBits(_x82, _x83, _x84, _x85) {
        return _ref61.apply(this, arguments);
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
      var _ref62 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee60(string, encryptionKey, authKey, uuid, version) {
        var fullCiphertext, contentCiphertext, iv, ciphertextToAuth, authHash;
        return regeneratorRuntime.wrap(function _callee60$(_context60) {
          while (1) {
            switch (_context60.prev = _context60.next) {
              case 0:
                if (!(version === "001")) {
                  _context60.next = 7;
                  break;
                }

                _context60.next = 3;
                return this.crypto.encryptText(string, encryptionKey, null);

              case 3:
                contentCiphertext = _context60.sent;

                fullCiphertext = version + contentCiphertext;
                _context60.next = 18;
                break;

              case 7:
                _context60.next = 9;
                return this.crypto.generateRandomKey(128);

              case 9:
                iv = _context60.sent;
                _context60.next = 12;
                return this.crypto.encryptText(string, encryptionKey, iv);

              case 12:
                contentCiphertext = _context60.sent;
                ciphertextToAuth = [version, uuid, iv, contentCiphertext].join(":");
                _context60.next = 16;
                return this.crypto.hmac256(ciphertextToAuth, authKey);

              case 16:
                authHash = _context60.sent;

                fullCiphertext = [version, authHash, uuid, iv, contentCiphertext].join(":");

              case 18:
                return _context60.abrupt("return", fullCiphertext);

              case 19:
              case "end":
                return _context60.stop();
            }
          }
        }, _callee60, this);
      }));

      function _private_encryptString(_x86, _x87, _x88, _x89, _x90) {
        return _ref62.apply(this, arguments);
      }

      return _private_encryptString;
    }()
  }, {
    key: "encryptItem",
    value: function () {
      var _ref63 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee61(item, keys) {
        var version = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "003";
        var params, item_key, ek, ak, ciphertext, authHash;
        return regeneratorRuntime.wrap(function _callee61$(_context61) {
          while (1) {
            switch (_context61.prev = _context61.next) {
              case 0:
                params = {};
                // encrypt item key

                _context61.next = 3;
                return this.crypto.generateItemEncryptionKey();

              case 3:
                item_key = _context61.sent;

                if (!(version === "001")) {
                  _context61.next = 10;
                  break;
                }

                _context61.next = 7;
                return this.crypto.encryptText(item_key, keys.mk, null);

              case 7:
                params.enc_item_key = _context61.sent;
                _context61.next = 13;
                break;

              case 10:
                _context61.next = 12;
                return this._private_encryptString(item_key, keys.mk, keys.ak, item.uuid, version);

              case 12:
                params.enc_item_key = _context61.sent;

              case 13:
                _context61.next = 15;
                return this.crypto.firstHalfOfKey(item_key);

              case 15:
                ek = _context61.sent;
                _context61.next = 18;
                return this.crypto.secondHalfOfKey(item_key);

              case 18:
                ak = _context61.sent;
                _context61.next = 21;
                return this._private_encryptString(JSON.stringify(item.createContentJSONFromProperties()), ek, ak, item.uuid, version);

              case 21:
                ciphertext = _context61.sent;

                if (!(version === "001")) {
                  _context61.next = 27;
                  break;
                }

                _context61.next = 25;
                return this.crypto.hmac256(ciphertext, ak);

              case 25:
                authHash = _context61.sent;

                params.auth_hash = authHash;

              case 27:

                params.content = ciphertext;
                return _context61.abrupt("return", params);

              case 29:
              case "end":
                return _context61.stop();
            }
          }
        }, _callee61, this);
      }));

      function encryptItem(_x92, _x93) {
        return _ref63.apply(this, arguments);
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
      var _ref64 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee62(item, keys) {
        var encryptedItemKey, requiresAuth, keyParams, item_key, ek, ak, itemParams, content;
        return regeneratorRuntime.wrap(function _callee62$(_context62) {
          while (1) {
            switch (_context62.prev = _context62.next) {
              case 0:
                if (!(typeof item.content != "string")) {
                  _context62.next = 2;
                  break;
                }

                return _context62.abrupt("return");

              case 2:
                if (!item.content.startsWith("000")) {
                  _context62.next = 14;
                  break;
                }

                _context62.prev = 3;
                _context62.t0 = JSON;
                _context62.next = 7;
                return this.crypto.base64Decode(item.content.substring(3, item.content.length));

              case 7:
                _context62.t1 = _context62.sent;
                item.content = _context62.t0.parse.call(_context62.t0, _context62.t1);
                _context62.next = 13;
                break;

              case 11:
                _context62.prev = 11;
                _context62.t2 = _context62["catch"](3);

              case 13:
                return _context62.abrupt("return");

              case 14:
                if (item.enc_item_key) {
                  _context62.next = 17;
                  break;
                }

                // This needs to be here to continue, return otherwise
                console.log("Missing item encryption key, skipping decryption.");
                return _context62.abrupt("return");

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
                  _context62.next = 26;
                  break;
                }

                console.error("Item key params UUID does not match item UUID");
                if (!item.errorDecrypting) {
                  item.errorDecryptingValueChanged = true;
                }
                item.errorDecrypting = true;
                return _context62.abrupt("return");

              case 26:
                _context62.next = 28;
                return this.crypto.decryptText(keyParams, requiresAuth);

              case 28:
                item_key = _context62.sent;

                if (item_key) {
                  _context62.next = 33;
                  break;
                }

                if (!item.errorDecrypting) {
                  item.errorDecryptingValueChanged = true;
                }
                item.errorDecrypting = true;
                return _context62.abrupt("return");

              case 33:
                _context62.next = 35;
                return this.crypto.firstHalfOfKey(item_key);

              case 35:
                ek = _context62.sent;
                _context62.next = 38;
                return this.crypto.secondHalfOfKey(item_key);

              case 38:
                ak = _context62.sent;
                itemParams = this.encryptionComponentsFromString(item.content, ek, ak);

                // return if uuid in auth hash does not match item uuid. Signs of tampering.

                if (!(itemParams.uuid && itemParams.uuid !== item.uuid)) {
                  _context62.next = 44;
                  break;
                }

                if (!item.errorDecrypting) {
                  item.errorDecryptingValueChanged = true;
                }
                item.errorDecrypting = true;
                return _context62.abrupt("return");

              case 44:

                if (!itemParams.authHash) {
                  // legacy 001
                  itemParams.authHash = item.auth_hash;
                }

                _context62.next = 47;
                return this.crypto.decryptText(itemParams, true);

              case 47:
                content = _context62.sent;

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
                return _context62.stop();
            }
          }
        }, _callee62, this, [[3, 11]]);
      }));

      function decryptItem(_x94, _x95) {
        return _ref64.apply(this, arguments);
      }

      return decryptItem;
    }()
  }, {
    key: "decryptMultipleItems",
    value: function () {
      var _ref65 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee64(items, keys, throws) {
        var _this15 = this;

        var decrypt;
        return regeneratorRuntime.wrap(function _callee64$(_context64) {
          while (1) {
            switch (_context64.prev = _context64.next) {
              case 0:
                decrypt = function () {
                  var _ref66 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee63(item) {
                    var isString;
                    return regeneratorRuntime.wrap(function _callee63$(_context63) {
                      while (1) {
                        switch (_context63.prev = _context63.next) {
                          case 0:
                            if (!(item.deleted == true && item.content == null)) {
                              _context63.next = 2;
                              break;
                            }

                            return _context63.abrupt("return");

                          case 2:
                            isString = typeof item.content === 'string' || item.content instanceof String;

                            if (!isString) {
                              _context63.next = 17;
                              break;
                            }

                            _context63.prev = 4;
                            _context63.next = 7;
                            return _this15.decryptItem(item, keys);

                          case 7:
                            _context63.next = 17;
                            break;

                          case 9:
                            _context63.prev = 9;
                            _context63.t0 = _context63["catch"](4);

                            if (!item.errorDecrypting) {
                              item.errorDecryptingValueChanged = true;
                            }
                            item.errorDecrypting = true;

                            if (!throws) {
                              _context63.next = 15;
                              break;
                            }

                            throw _context63.t0;

                          case 15:
                            console.error("Error decrypting item", item, _context63.t0);
                            return _context63.abrupt("return");

                          case 17:
                          case "end":
                            return _context63.stop();
                        }
                      }
                    }, _callee63, _this15, [[4, 9]]);
                  }));

                  return function decrypt(_x99) {
                    return _ref66.apply(this, arguments);
                  };
                }();

                return _context64.abrupt("return", Promise.all(items.map(function (item) {
                  return decrypt(item);
                })));

              case 2:
              case "end":
                return _context64.stop();
            }
          }
        }, _callee64, this);
      }));

      function decryptMultipleItems(_x96, _x97, _x98) {
        return _ref65.apply(this, arguments);
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
    window.SFHttpManager = SFHttpManager;
    window.SFStorageManager = SFStorageManager;
    window.SFSyncManager = SFSyncManager;
    window.SFAuthManager = SFAuthManager;
  } catch (e) {
    console.log("Exception while exporting window variables", e);
  }
}


},{}]},{},[1])(1)
});
