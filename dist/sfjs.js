/**
 * @license
 * Lodash (Custom Build) lodash.com/license | Underscore.js 1.8.3 underscorejs.org/LICENSE
 * Build: `lodash include="includes,merge,filter,map,remove,find,omit,pull,cloneDeep,pick,uniq,sortedIndexBy"`
 */
;(function(){function t(t,n){return t.set(n[0],n[1]),t}function n(t,n){return t.add(n),t}function r(t,n,r){switch(r.length){case 0:return t.call(n);case 1:return t.call(n,r[0]);case 2:return t.call(n,r[0],r[1]);case 3:return t.call(n,r[0],r[1],r[2])}return t.apply(n,r)}function e(t,n){for(var r=-1,e=null==t?0:t.length;++r<e&&n(t[r],r,t)!==false;);return t}function u(t,n){for(var r=-1,e=null==t?0:t.length,u=0,o=[];++r<e;){var i=t[r];n(i,r,t)&&(o[u++]=i)}return o}function o(t,n){return!!(null==t?0:t.length)&&h(t,n,0)>-1;
}function i(t,n,r){for(var e=-1,u=null==t?0:t.length;++e<u;)if(r(n,t[e]))return true;return false}function c(t,n){for(var r=-1,e=null==t?0:t.length,u=Array(e);++r<e;)u[r]=n(t[r],r,t);return u}function f(t,n){for(var r=-1,e=n.length,u=t.length;++r<e;)t[u+r]=n[r];return t}function a(t,n,r,e){var u=-1,o=null==t?0:t.length;for(e&&o&&(r=t[++u]);++u<o;)r=n(r,t[u],u,t);return r}function l(t,n){for(var r=-1,e=null==t?0:t.length;++r<e;)if(n(t[r],r,t))return true;return false}function s(t,n,r,e){for(var u=t.length,o=r+(e?1:-1);e?o--:++o<u;)if(n(t[o],o,t))return o;
return-1}function h(t,n,r){return n===n?A(t,n,r):s(t,p,r)}function v(t,n,r,e){for(var u=r-1,o=t.length;++u<o;)if(e(t[u],n))return u;return-1}function p(t){return t!==t}function y(t){return function(n){return null==n?Or:n[t]}}function g(t,n){for(var r=-1,e=Array(t);++r<t;)e[r]=n(r);return e}function b(t){return function(n){return t(n)}}function _(t,n){return c(n,function(n){return t[n]})}function d(t,n){return t.has(n)}function j(t,n){return null==t?Or:t[n]}function w(t){var n=-1,r=Array(t.size);return t.forEach(function(t,e){
r[++n]=[e,t]}),r}function O(t,n){return function(r){return t(n(r))}}function m(t){var n=-1,r=Array(t.size);return t.forEach(function(t){r[++n]=t}),r}function A(t,n,r){for(var e=r-1,u=t.length;++e<u;)if(t[e]===n)return e;return-1}function z(){}function x(t){var n=-1,r=null==t?0:t.length;for(this.clear();++n<r;){var e=t[n];this.set(e[0],e[1])}}function S(){this.__data__=Ou?Ou(null):{},this.size=0}function k(t){var n=this.has(t)&&delete this.__data__[t];return this.size-=n?1:0,n}function $(t){var n=this.__data__;
if(Ou){var r=n[t];return r===xr?Or:r}return Je.call(n,t)?n[t]:Or}function I(t){var n=this.__data__;return Ou?n[t]!==Or:Je.call(n,t)}function L(t,n){var r=this.__data__;return this.size+=this.has(t)?0:1,r[t]=Ou&&n===Or?xr:n,this}function P(t){var n=-1,r=null==t?0:t.length;for(this.clear();++n<r;){var e=t[n];this.set(e[0],e[1])}}function E(){this.__data__=[],this.size=0}function F(t){var n=this.__data__,r=rt(n,t);return!(r<0)&&(r==n.length-1?n.pop():iu.call(n,r,1),--this.size,true)}function B(t){var n=this.__data__,r=rt(n,t);
return r<0?Or:n[r][1]}function M(t){return rt(this.__data__,t)>-1}function T(t,n){var r=this.__data__,e=rt(r,t);return e<0?(++this.size,r.push([t,n])):r[e][1]=n,this}function U(t){var n=-1,r=null==t?0:t.length;for(this.clear();++n<r;){var e=t[n];this.set(e[0],e[1])}}function N(){this.size=0,this.__data__={hash:new x,map:new(_u||P),string:new x}}function C(t){var n=hn(this,t).delete(t);return this.size-=n?1:0,n}function D(t){return hn(this,t).get(t)}function R(t){return hn(this,t).has(t)}function V(t,n){
var r=hn(this,t),e=r.size;return r.set(t,n),this.size+=r.size==e?0:1,this}function q(t){var n=-1,r=null==t?0:t.length;for(this.__data__=new U;++n<r;)this.add(t[n])}function W(t){return this.__data__.set(t,xr),this}function G(t){return this.__data__.has(t)}function H(t){this.size=(this.__data__=new P(t)).size}function J(){this.__data__=new P,this.size=0}function K(t){var n=this.__data__,r=n.delete(t);return this.size=n.size,r}function Q(t){return this.__data__.get(t)}function X(t){return this.__data__.has(t);
}function Y(t,n){var r=this.__data__;if(r instanceof P){var e=r.__data__;if(!_u||e.length<Ar-1)return e.push([t,n]),this.size=++r.size,this;r=this.__data__=new U(e)}return r.set(t,n),this.size=r.size,this}function Z(t,n){var r=qu(t),e=!r&&Vu(t),u=!r&&!e&&Wu(t),o=!r&&!e&&!u&&Gu(t),i=r||e||u||o,c=i?g(t.length,String):[],f=c.length;for(var a in t)!n&&!Je.call(t,a)||i&&("length"==a||u&&("offset"==a||"parent"==a)||o&&("buffer"==a||"byteLength"==a||"byteOffset"==a)||wn(a,f))||c.push(a);return c}function tt(t,n,r){
(r===Or||Kn(t[n],r))&&(r!==Or||n in t)||ot(t,n,r)}function nt(t,n,r){var e=t[n];Je.call(t,n)&&Kn(e,r)&&(r!==Or||n in t)||ot(t,n,r)}function rt(t,n){for(var r=t.length;r--;)if(Kn(t[r][0],n))return r;return-1}function et(t,n){return t&&Qt(n,hr(n),t)}function ut(t,n){return t&&Qt(n,vr(n),t)}function ot(t,n,r){"__proto__"==n&&au?au(t,n,{configurable:true,enumerable:true,value:r,writable:true}):t[n]=r}function it(t,n,r,u,o,i){var c,f=n&kr,a=n&$r,l=n&Ir;if(r&&(c=o?r(t,u,o,i):r(t)),c!==Or)return c;if(!tr(t))return t;
var s=qu(t);if(s){if(c=bn(t),!f)return Kt(t,c)}else{var h=Uu(t),v=h==Hr||h==Jr;if(Wu(t))return Dt(t,f);if(h==Yr||h==Dr||v&&!o){if(c=a||v?{}:_n(t),!f)return a?Yt(t,ut(c,t)):Xt(t,et(c,t))}else{if(!Pe[h])return o?t:{};c=dn(t,h,it,f)}}i||(i=new H);var p=i.get(t);if(p)return p;i.set(t,c);var y=l?a?ln:an:a?vr:hr,g=s?Or:y(t);return e(g||t,function(e,u){g&&(u=e,e=t[u]),nt(c,u,it(e,n,r,u,t,i))}),c}function ct(t,n){var r=[];return Pu(t,function(t,e,u){n(t,e,u)&&r.push(t)}),r}function ft(t,n,r,e,u){var o=-1,i=t.length;
for(r||(r=jn),u||(u=[]);++o<i;){var c=t[o];n>0&&r(c)?n>1?ft(c,n-1,r,e,u):f(u,c):e||(u[u.length]=c)}return u}function at(t,n){return t&&Eu(t,n,hr)}function lt(t,n){n=Ct(n,t);for(var r=0,e=n.length;null!=t&&r<e;)t=t[Bn(n[r++])];return r&&r==e?t:Or}function st(t,n,r){var e=n(t);return qu(t)?e:f(e,r(t))}function ht(t){return null==t?t===Or?oe:Xr:fu&&fu in Object(t)?yn(t):Ln(t)}function vt(t,n){return null!=t&&n in Object(t)}function pt(t){return nr(t)&&ht(t)==Dr}function yt(t,n,r,e,u){return t===n||(null==t||null==n||!nr(t)&&!nr(n)?t!==t&&n!==n:gt(t,n,r,e,yt,u));
}function gt(t,n,r,e,u,o){var i=qu(t),c=qu(n),f=i?Rr:Uu(t),a=c?Rr:Uu(n);f=f==Dr?Yr:f,a=a==Dr?Yr:a;var l=f==Yr,s=a==Yr,h=f==a;if(h&&Wu(t)){if(!Wu(n))return false;i=true,l=false}if(h&&!l)return o||(o=new H),i||Gu(t)?un(t,n,r,e,u,o):on(t,n,f,r,e,u,o);if(!(r&Lr)){var v=l&&Je.call(t,"__wrapped__"),p=s&&Je.call(n,"__wrapped__");if(v||p){var y=v?t.value():t,g=p?n.value():n;return o||(o=new H),u(y,g,r,e,o)}}return!!h&&(o||(o=new H),cn(t,n,r,e,u,o))}function bt(t,n,r,e){var u=r.length,o=u,i=!e;if(null==t)return!o;for(t=Object(t);u--;){
var c=r[u];if(i&&c[2]?c[1]!==t[c[0]]:!(c[0]in t))return false}for(;++u<o;){c=r[u];var f=c[0],a=t[f],l=c[1];if(i&&c[2]){if(a===Or&&!(f in t))return false}else{var s=new H;if(e)var h=e(a,l,f,t,n,s);if(!(h===Or?yt(l,a,Lr|Pr,e,s):h))return false}}return true}function _t(t){return!(!tr(t)||zn(t))&&(Yn(t)?Ye:ke).test(Mn(t))}function dt(t){return nr(t)&&Zn(t.length)&&!!Le[ht(t)]}function jt(t){return typeof t=="function"?t:null==t?gr:typeof t=="object"?qu(t)?zt(t[0],t[1]):At(t):dr(t)}function wt(t){if(!xn(t))return vu(t);
var n=[];for(var r in Object(t))Je.call(t,r)&&"constructor"!=r&&n.push(r);return n}function Ot(t){if(!tr(t))return In(t);var n=xn(t),r=[];for(var e in t)("constructor"!=e||!n&&Je.call(t,e))&&r.push(e);return r}function mt(t,n){var r=-1,e=Qn(t)?Array(t.length):[];return Pu(t,function(t,u,o){e[++r]=n(t,u,o)}),e}function At(t){var n=vn(t);return 1==n.length&&n[0][2]?kn(n[0][0],n[0][1]):function(r){return r===t||bt(r,t,n)}}function zt(t,n){return mn(t)&&Sn(n)?kn(Bn(t),n):function(r){var e=lr(r,t);return e===Or&&e===n?sr(r,t):yt(n,e,Lr|Pr);
}}function xt(t,n,r,e,u){t!==n&&Eu(n,function(o,i){if(tr(o))u||(u=new H),St(t,n,i,r,xt,e,u);else{var c=e?e(t[i],o,i+"",t,n,u):Or;c===Or&&(c=o),tt(t,i,c)}},vr)}function St(t,n,r,e,u,o,i){var c=t[r],f=n[r],a=i.get(f);if(a)return tt(t,r,a),Or;var l=o?o(c,f,r+"",t,n,i):Or,s=l===Or;if(s){var h=qu(f),v=!h&&Wu(f),p=!h&&!v&&Gu(f);l=f,h||v||p?qu(c)?l=c:Xn(c)?l=Kt(c):v?(s=false,l=Dt(f,true)):p?(s=false,l=Jt(f,true)):l=[]:rr(f)||Vu(f)?(l=c,Vu(c)?l=fr(c):(!tr(c)||e&&Yn(c))&&(l=_n(f))):s=false}s&&(i.set(f,l),u(l,f,e,o,i),
i.delete(f)),tt(t,r,l)}function kt(t,n){return $t(t,n,function(n,r){return sr(t,r)})}function $t(t,n,r){for(var e=-1,u=n.length,o={};++e<u;){var i=n[e],c=lt(t,i);r(c,i)&&Ft(o,Ct(i,t),c)}return o}function It(t){return function(n){return lt(n,t)}}function Lt(t,n,r,e){var u=e?v:h,o=-1,i=n.length,f=t;for(t===n&&(n=Kt(n)),r&&(f=c(t,b(r)));++o<i;)for(var a=0,l=n[o],s=r?r(l):l;(a=u(f,s,a,e))>-1;)f!==t&&iu.call(f,a,1),iu.call(t,a,1);return t}function Pt(t,n){for(var r=t?n.length:0,e=r-1;r--;){var u=n[r];if(r==e||u!==o){
var o=u;wn(u)?iu.call(t,u,1):Nt(t,u)}}return t}function Et(t,n){return Nu(Pn(t,n,gr),t+"")}function Ft(t,n,r,e){if(!tr(t))return t;n=Ct(n,t);for(var u=-1,o=n.length,i=o-1,c=t;null!=c&&++u<o;){var f=Bn(n[u]),a=r;if(u!=i){var l=c[f];a=e?e(l,f,c):Or,a===Or&&(a=tr(l)?l:wn(n[u+1])?[]:{})}nt(c,f,a),c=c[f]}return t}function Bt(t,n,r){var e=-1,u=t.length;n<0&&(n=-n>u?0:u+n),r=r>u?u:r,r<0&&(r+=u),u=n>r?0:r-n>>>0,n>>>=0;for(var o=Array(u);++e<u;)o[e]=t[e+n];return o}function Mt(t,n,r,e){n=r(n);for(var u=0,o=null==t?0:t.length,i=n!==n,c=null===n,f=ur(n),a=n===Or;u<o;){
var l=lu((u+o)/2),s=r(t[l]),h=s!==Or,v=null===s,p=s===s,y=ur(s);if(i)var g=e||p;else g=a?p&&(e||h):c?p&&h&&(e||!v):f?p&&h&&!v&&(e||!y):!v&&!y&&(e?s<=n:s<n);g?u=l+1:o=l}return yu(o,Cr)}function Tt(t){if(typeof t=="string")return t;if(qu(t))return c(t,Tt)+"";if(ur(t))return Iu?Iu.call(t):"";var n=t+"";return"0"==n&&1/t==-Br?"-0":n}function Ut(t,n,r){var e=-1,u=o,c=t.length,f=true,a=[],l=a;if(r)f=false,u=i;else if(c>=Ar){var s=n?null:Bu(t);if(s)return m(s);f=false,u=d,l=new q}else l=n?[]:a;t:for(;++e<c;){var h=t[e],v=n?n(h):h;
if(h=r||0!==h?h:0,f&&v===v){for(var p=l.length;p--;)if(l[p]===v)continue t;n&&l.push(v),a.push(h)}else u(l,v,r)||(l!==a&&l.push(v),a.push(h))}return a}function Nt(t,n){return n=Ct(n,t),t=En(t,n),null==t||delete t[Bn(Nn(n))]}function Ct(t,n){return qu(t)?t:mn(t,n)?[t]:Cu(ar(t))}function Dt(t,n){if(n)return t.slice();var r=t.length,e=ru?ru(r):new t.constructor(r);return t.copy(e),e}function Rt(t){var n=new t.constructor(t.byteLength);return new nu(n).set(new nu(t)),n}function Vt(t,n){return new t.constructor(n?Rt(t.buffer):t.buffer,t.byteOffset,t.byteLength);
}function qt(n,r,e){return a(r?e(w(n),kr):w(n),t,new n.constructor)}function Wt(t){var n=new t.constructor(t.source,ze.exec(t));return n.lastIndex=t.lastIndex,n}function Gt(t,r,e){return a(r?e(m(t),kr):m(t),n,new t.constructor)}function Ht(t){return $u?Object($u.call(t)):{}}function Jt(t,n){return new t.constructor(n?Rt(t.buffer):t.buffer,t.byteOffset,t.length)}function Kt(t,n){var r=-1,e=t.length;for(n||(n=Array(e));++r<e;)n[r]=t[r];return n}function Qt(t,n,r,e){var u=!r;r||(r={});for(var o=-1,i=n.length;++o<i;){
var c=n[o],f=e?e(r[c],t[c],c,r,t):Or;f===Or&&(f=t[c]),u?ot(r,c,f):nt(r,c,f)}return r}function Xt(t,n){return Qt(t,Mu(t),n)}function Yt(t,n){return Qt(t,Tu(t),n)}function Zt(t){return Et(function(n,r){var e=-1,u=r.length,o=u>1?r[u-1]:Or,i=u>2?r[2]:Or;for(o=t.length>3&&typeof o=="function"?(u--,o):Or,i&&On(r[0],r[1],i)&&(o=u<3?Or:o,u=1),n=Object(n);++e<u;){var c=r[e];c&&t(n,c,e,o)}return n})}function tn(t,n){return function(r,e){if(null==r)return r;if(!Qn(r))return t(r,e);for(var u=r.length,o=n?u:-1,i=Object(r);(n?o--:++o<u)&&e(i[o],o,i)!==false;);
return r}}function nn(t){return function(n,r,e){for(var u=-1,o=Object(n),i=e(n),c=i.length;c--;){var f=i[t?c:++u];if(r(o[f],f,o)===false)break}return n}}function rn(t){return function(n,r,e){var u=Object(n);if(!Qn(n)){var o=sn(r,3);n=hr(n),r=function(t){return o(u[t],t,u)}}var i=t(n,r,e);return i>-1?u[o?n[i]:i]:Or}}function en(t){return rr(t)?Or:t}function un(t,n,r,e,u,o){var i=r&Lr,c=t.length,f=n.length;if(c!=f&&!(i&&f>c))return false;var a=o.get(t);if(a&&o.get(n))return a==n;var s=-1,h=true,v=r&Pr?new q:Or;
for(o.set(t,n),o.set(n,t);++s<c;){var p=t[s],y=n[s];if(e)var g=i?e(y,p,s,n,t,o):e(p,y,s,t,n,o);if(g!==Or){if(g)continue;h=false;break}if(v){if(!l(n,function(t,n){if(!d(v,n)&&(p===t||u(p,t,r,e,o)))return v.push(n)})){h=false;break}}else if(p!==y&&!u(p,y,r,e,o)){h=false;break}}return o.delete(t),o.delete(n),h}function on(t,n,r,e,u,o,i){switch(r){case fe:if(t.byteLength!=n.byteLength||t.byteOffset!=n.byteOffset)return false;t=t.buffer,n=n.buffer;case ce:return!(t.byteLength!=n.byteLength||!o(new nu(t),new nu(n)));
case qr:case Wr:case Qr:return Kn(+t,+n);case Gr:return t.name==n.name&&t.message==n.message;case ne:case ee:return t==n+"";case Kr:var c=w;case re:var f=e&Lr;if(c||(c=m),t.size!=n.size&&!f)return false;var a=i.get(t);if(a)return a==n;e|=Pr,i.set(t,n);var l=un(c(t),c(n),e,u,o,i);return i.delete(t),l;case ue:if($u)return $u.call(t)==$u.call(n)}return false}function cn(t,n,r,e,u,o){var i=r&Lr,c=an(t),f=c.length;if(f!=an(n).length&&!i)return false;for(var a=f;a--;){var l=c[a];if(!(i?l in n:Je.call(n,l)))return false;
}var s=o.get(t);if(s&&o.get(n))return s==n;var h=true;o.set(t,n),o.set(n,t);for(var v=i;++a<f;){l=c[a];var p=t[l],y=n[l];if(e)var g=i?e(y,p,l,n,t,o):e(p,y,l,t,n,o);if(!(g===Or?p===y||u(p,y,r,e,o):g)){h=false;break}v||(v="constructor"==l)}if(h&&!v){var b=t.constructor,_=n.constructor;b!=_&&"constructor"in t&&"constructor"in n&&!(typeof b=="function"&&b instanceof b&&typeof _=="function"&&_ instanceof _)&&(h=false)}return o.delete(t),o.delete(n),h}function fn(t){return Nu(Pn(t,Or,Un),t+"")}function an(t){return st(t,hr,Mu);
}function ln(t){return st(t,vr,Tu)}function sn(){var t=z.iteratee||br;return t=t===br?jt:t,arguments.length?t(arguments[0],arguments[1]):t}function hn(t,n){var r=t.__data__;return An(n)?r[typeof n=="string"?"string":"hash"]:r.map}function vn(t){for(var n=hr(t),r=n.length;r--;){var e=n[r],u=t[e];n[r]=[e,u,Sn(u)]}return n}function pn(t,n){var r=j(t,n);return _t(r)?r:Or}function yn(t){var n=Je.call(t,fu),r=t[fu];try{t[fu]=Or;var e=true}catch(t){}var u=Qe.call(t);return e&&(n?t[fu]=r:delete t[fu]),u}function gn(t,n,r){
n=Ct(n,t);for(var e=-1,u=n.length,o=false;++e<u;){var i=Bn(n[e]);if(!(o=null!=t&&r(t,i)))break;t=t[i]}return o||++e!=u?o:(u=null==t?0:t.length,!!u&&Zn(u)&&wn(i,u)&&(qu(t)||Vu(t)))}function bn(t){var n=t.length,r=t.constructor(n);return n&&"string"==typeof t[0]&&Je.call(t,"index")&&(r.index=t.index,r.input=t.input),r}function _n(t){return typeof t.constructor!="function"||xn(t)?{}:Lu(eu(t))}function dn(t,n,r,e){var u=t.constructor;switch(n){case ce:return Rt(t);case qr:case Wr:return new u(+t);case fe:
return Vt(t,e);case ae:case le:case se:case he:case ve:case pe:case ye:case ge:case be:return Jt(t,e);case Kr:return qt(t,e,r);case Qr:case ee:return new u(t);case ne:return Wt(t);case re:return Gt(t,e,r);case ue:return Ht(t)}}function jn(t){return qu(t)||Vu(t)||!!(cu&&t&&t[cu])}function wn(t,n){return n=null==n?Mr:n,!!n&&(typeof t=="number"||Ie.test(t))&&t>-1&&t%1==0&&t<n}function On(t,n,r){if(!tr(r))return false;var e=typeof n;return!!("number"==e?Qn(r)&&wn(n,r.length):"string"==e&&n in r)&&Kn(r[n],t);
}function mn(t,n){if(qu(t))return false;var r=typeof t;return!("number"!=r&&"symbol"!=r&&"boolean"!=r&&null!=t&&!ur(t))||(de.test(t)||!_e.test(t)||null!=n&&t in Object(n))}function An(t){var n=typeof t;return"string"==n||"number"==n||"symbol"==n||"boolean"==n?"__proto__"!==t:null===t}function zn(t){return!!Ke&&Ke in t}function xn(t){var n=t&&t.constructor;return t===(typeof n=="function"&&n.prototype||We)}function Sn(t){return t===t&&!tr(t)}function kn(t,n){return function(r){return null!=r&&(r[t]===n&&(n!==Or||t in Object(r)));
}}function $n(t){var n=Hn(t,function(t){return r.size===Sr&&r.clear(),t}),r=n.cache;return n}function In(t){var n=[];if(null!=t)for(var r in Object(t))n.push(r);return n}function Ln(t){return Qe.call(t)}function Pn(t,n,e){return n=pu(n===Or?t.length-1:n,0),function(){for(var u=arguments,o=-1,i=pu(u.length-n,0),c=Array(i);++o<i;)c[o]=u[n+o];o=-1;for(var f=Array(n+1);++o<n;)f[o]=u[o];return f[n]=e(c),r(t,this,f)}}function En(t,n){return n.length<2?t:lt(t,Bt(n,0,-1))}function Fn(t){var n=0,r=0;return function(){
var e=gu(),u=Fr-(e-r);if(r=e,u>0){if(++n>=Er)return arguments[0]}else n=0;return t.apply(Or,arguments)}}function Bn(t){if(typeof t=="string"||ur(t))return t;var n=t+"";return"0"==n&&1/t==-Br?"-0":n}function Mn(t){if(null!=t){try{return He.call(t)}catch(t){}try{return t+""}catch(t){}}return""}function Tn(t,n,r){var e=null==t?0:t.length;if(!e)return-1;var u=null==r?0:ir(r);return u<0&&(u=pu(e+u,0)),s(t,sn(n,3),u)}function Un(t){return(null==t?0:t.length)?ft(t,1):[]}function Nn(t){var n=null==t?0:t.length;
return n?t[n-1]:Or}function Cn(t,n){return t&&t.length&&n&&n.length?Lt(t,n):t}function Dn(t,n){var r=[];if(!t||!t.length)return r;var e=-1,u=[],o=t.length;for(n=sn(n,3);++e<o;){var i=t[e];n(i,e,t)&&(r.push(i),u.push(e))}return Pt(t,u),r}function Rn(t,n,r){return Mt(t,n,sn(r,2))}function Vn(t){return t&&t.length?Ut(t):[]}function qn(t,n){return(qu(t)?u:ct)(t,sn(n,3))}function Wn(t,n,r,e){t=Qn(t)?t:pr(t),r=r&&!e?ir(r):0;var u=t.length;return r<0&&(r=pu(u+r,0)),er(t)?r<=u&&t.indexOf(n,r)>-1:!!u&&h(t,n,r)>-1;
}function Gn(t,n){return(qu(t)?c:mt)(t,sn(n,3))}function Hn(t,n){if(typeof t!="function"||null!=n&&typeof n!="function")throw new TypeError(zr);var r=function(){var e=arguments,u=n?n.apply(this,e):e[0],o=r.cache;if(o.has(u))return o.get(u);var i=t.apply(this,e);return r.cache=o.set(u,i)||o,i};return r.cache=new(Hn.Cache||U),r}function Jn(t){return it(t,kr|Ir)}function Kn(t,n){return t===n||t!==t&&n!==n}function Qn(t){return null!=t&&Zn(t.length)&&!Yn(t)}function Xn(t){return nr(t)&&Qn(t)}function Yn(t){
if(!tr(t))return false;var n=ht(t);return n==Hr||n==Jr||n==Vr||n==te}function Zn(t){return typeof t=="number"&&t>-1&&t%1==0&&t<=Mr}function tr(t){var n=typeof t;return null!=t&&("object"==n||"function"==n)}function nr(t){return null!=t&&typeof t=="object"}function rr(t){if(!nr(t)||ht(t)!=Yr)return false;var n=eu(t);if(null===n)return true;var r=Je.call(n,"constructor")&&n.constructor;return typeof r=="function"&&r instanceof r&&He.call(r)==Xe}function er(t){return typeof t=="string"||!qu(t)&&nr(t)&&ht(t)==ee}function ur(t){
return typeof t=="symbol"||nr(t)&&ht(t)==ue}function or(t){if(!t)return 0===t?t:0;if(t=cr(t),t===Br||t===-Br){return(t<0?-1:1)*Tr}return t===t?t:0}function ir(t){var n=or(t),r=n%1;return n===n?r?n-r:n:0}function cr(t){if(typeof t=="number")return t;if(ur(t))return Ur;if(tr(t)){var n=typeof t.valueOf=="function"?t.valueOf():t;t=tr(n)?n+"":n}if(typeof t!="string")return 0===t?t:+t;t=t.replace(me,"");var r=Se.test(t);return r||$e.test(t)?Ee(t.slice(2),r?2:8):xe.test(t)?Ur:+t}function fr(t){return Qt(t,vr(t));
}function ar(t){return null==t?"":Tt(t)}function lr(t,n,r){var e=null==t?Or:lt(t,n);return e===Or?r:e}function sr(t,n){return null!=t&&gn(t,n,vt)}function hr(t){return Qn(t)?Z(t):wt(t)}function vr(t){return Qn(t)?Z(t,true):Ot(t)}function pr(t){return null==t?[]:_(t,hr(t))}function yr(t){return function(){return t}}function gr(t){return t}function br(t){return jt(typeof t=="function"?t:it(t,kr))}function _r(){}function dr(t){return mn(t)?y(Bn(t)):It(t)}function jr(){return[]}function wr(){return false}var Or,mr="4.17.4",Ar=200,zr="Expected a function",xr="__lodash_hash_undefined__",Sr=500,kr=1,$r=2,Ir=4,Lr=1,Pr=2,Er=800,Fr=16,Br=1/0,Mr=9007199254740991,Tr=1.7976931348623157e308,Ur=NaN,Nr=4294967295,Cr=Nr-1,Dr="[object Arguments]",Rr="[object Array]",Vr="[object AsyncFunction]",qr="[object Boolean]",Wr="[object Date]",Gr="[object Error]",Hr="[object Function]",Jr="[object GeneratorFunction]",Kr="[object Map]",Qr="[object Number]",Xr="[object Null]",Yr="[object Object]",Zr="[object Promise]",te="[object Proxy]",ne="[object RegExp]",re="[object Set]",ee="[object String]",ue="[object Symbol]",oe="[object Undefined]",ie="[object WeakMap]",ce="[object ArrayBuffer]",fe="[object DataView]",ae="[object Float32Array]",le="[object Float64Array]",se="[object Int8Array]",he="[object Int16Array]",ve="[object Int32Array]",pe="[object Uint8Array]",ye="[object Uint8ClampedArray]",ge="[object Uint16Array]",be="[object Uint32Array]",_e=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,de=/^\w*$/,je=/^\./,we=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,Oe=/[\\^$.*+?()[\]{}|]/g,me=/^\s+|\s+$/g,Ae=/\\(\\)?/g,ze=/\w*$/,xe=/^[-+]0x[0-9a-f]+$/i,Se=/^0b[01]+$/i,ke=/^\[object .+?Constructor\]$/,$e=/^0o[0-7]+$/i,Ie=/^(?:0|[1-9]\d*)$/,Le={};
Le[ae]=Le[le]=Le[se]=Le[he]=Le[ve]=Le[pe]=Le[ye]=Le[ge]=Le[be]=true,Le[Dr]=Le[Rr]=Le[ce]=Le[qr]=Le[fe]=Le[Wr]=Le[Gr]=Le[Hr]=Le[Kr]=Le[Qr]=Le[Yr]=Le[ne]=Le[re]=Le[ee]=Le[ie]=false;var Pe={};Pe[Dr]=Pe[Rr]=Pe[ce]=Pe[fe]=Pe[qr]=Pe[Wr]=Pe[ae]=Pe[le]=Pe[se]=Pe[he]=Pe[ve]=Pe[Kr]=Pe[Qr]=Pe[Yr]=Pe[ne]=Pe[re]=Pe[ee]=Pe[ue]=Pe[pe]=Pe[ye]=Pe[ge]=Pe[be]=true,Pe[Gr]=Pe[Hr]=Pe[ie]=false;var Ee=parseInt,Fe=typeof global=="object"&&global&&global.Object===Object&&global,Be=typeof self=="object"&&self&&self.Object===Object&&self,Me=Fe||Be||Function("return this")(),Te=typeof exports=="object"&&exports&&!exports.nodeType&&exports,Ue=Te&&typeof module=="object"&&module&&!module.nodeType&&module,Ne=Ue&&Ue.exports===Te,Ce=Ne&&Fe.process,De=function(){
try{return Ce&&Ce.binding&&Ce.binding("util")}catch(t){}}(),Re=De&&De.isTypedArray,Ve=Array.prototype,qe=Function.prototype,We=Object.prototype,Ge=Me["__core-js_shared__"],He=qe.toString,Je=We.hasOwnProperty,Ke=function(){var t=/[^.]+$/.exec(Ge&&Ge.keys&&Ge.keys.IE_PROTO||"");return t?"Symbol(src)_1."+t:""}(),Qe=We.toString,Xe=He.call(Object),Ye=RegExp("^"+He.call(Je).replace(Oe,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),Ze=Ne?Me.Buffer:Or,tu=Me.Symbol,nu=Me.Uint8Array,ru=Ze?Ze.allocUnsafe:Or,eu=O(Object.getPrototypeOf,Object),uu=Object.create,ou=We.propertyIsEnumerable,iu=Ve.splice,cu=tu?tu.isConcatSpreadable:Or,fu=tu?tu.toStringTag:Or,au=function(){
try{var t=pn(Object,"defineProperty");return t({},"",{}),t}catch(t){}}(),lu=Math.floor,su=Object.getOwnPropertySymbols,hu=Ze?Ze.isBuffer:Or,vu=O(Object.keys,Object),pu=Math.max,yu=Math.min,gu=Date.now,bu=pn(Me,"DataView"),_u=pn(Me,"Map"),du=pn(Me,"Promise"),ju=pn(Me,"Set"),wu=pn(Me,"WeakMap"),Ou=pn(Object,"create"),mu=Mn(bu),Au=Mn(_u),zu=Mn(du),xu=Mn(ju),Su=Mn(wu),ku=tu?tu.prototype:Or,$u=ku?ku.valueOf:Or,Iu=ku?ku.toString:Or,Lu=function(){function t(){}return function(n){if(!tr(n))return{};if(uu)return uu(n);
t.prototype=n;var r=new t;return t.prototype=Or,r}}();x.prototype.clear=S,x.prototype.delete=k,x.prototype.get=$,x.prototype.has=I,x.prototype.set=L,P.prototype.clear=E,P.prototype.delete=F,P.prototype.get=B,P.prototype.has=M,P.prototype.set=T,U.prototype.clear=N,U.prototype.delete=C,U.prototype.get=D,U.prototype.has=R,U.prototype.set=V,q.prototype.add=q.prototype.push=W,q.prototype.has=G,H.prototype.clear=J,H.prototype.delete=K,H.prototype.get=Q,H.prototype.has=X,H.prototype.set=Y;var Pu=tn(at),Eu=nn(),Fu=au?function(t,n){
return au(t,"toString",{configurable:true,enumerable:false,value:yr(n),writable:true})}:gr,Bu=ju&&1/m(new ju([,-0]))[1]==Br?function(t){return new ju(t)}:_r,Mu=su?function(t){return null==t?[]:(t=Object(t),u(su(t),function(n){return ou.call(t,n)}))}:jr,Tu=su?function(t){for(var n=[];t;)f(n,Mu(t)),t=eu(t);return n}:jr,Uu=ht;(bu&&Uu(new bu(new ArrayBuffer(1)))!=fe||_u&&Uu(new _u)!=Kr||du&&Uu(du.resolve())!=Zr||ju&&Uu(new ju)!=re||wu&&Uu(new wu)!=ie)&&(Uu=function(t){var n=ht(t),r=n==Yr?t.constructor:Or,e=r?Mn(r):"";
if(e)switch(e){case mu:return fe;case Au:return Kr;case zu:return Zr;case xu:return re;case Su:return ie}return n});var Nu=Fn(Fu),Cu=$n(function(t){var n=[];return je.test(t)&&n.push(""),t.replace(we,function(t,r,e,u){n.push(e?u.replace(Ae,"$1"):r||t)}),n}),Du=Et(Cn),Ru=rn(Tn);Hn.Cache=U;var Vu=pt(function(){return arguments}())?pt:function(t){return nr(t)&&Je.call(t,"callee")&&!ou.call(t,"callee")},qu=Array.isArray,Wu=hu||wr,Gu=Re?b(Re):dt,Hu=Zt(function(t,n,r){xt(t,n,r)}),Ju=fn(function(t,n){var r={};
if(null==t)return r;var e=false;n=c(n,function(n){return n=Ct(n,t),e||(e=n.length>1),n}),Qt(t,ln(t),r),e&&(r=it(r,kr|$r|Ir,en));for(var u=n.length;u--;)Nt(r,n[u]);return r}),Ku=fn(function(t,n){return null==t?{}:kt(t,n)});z.constant=yr,z.filter=qn,z.flatten=Un,z.iteratee=br,z.keys=hr,z.keysIn=vr,z.map=Gn,z.memoize=Hn,z.merge=Hu,z.omit=Ju,z.pick=Ku,z.property=dr,z.pull=Du,z.pullAll=Cn,z.remove=Dn,z.toPlainObject=fr,z.uniq=Vn,z.values=pr,z.cloneDeep=Jn,z.eq=Kn,z.find=Ru,z.findIndex=Tn,z.get=lr,z.hasIn=sr,
z.identity=gr,z.includes=Wn,z.isArguments=Vu,z.isArray=qu,z.isArrayLike=Qn,z.isArrayLikeObject=Xn,z.isBuffer=Wu,z.isFunction=Yn,z.isLength=Zn,z.isObject=tr,z.isObjectLike=nr,z.isPlainObject=rr,z.isString=er,z.isSymbol=ur,z.isTypedArray=Gu,z.last=Nn,z.stubArray=jr,z.stubFalse=wr,z.noop=_r,z.sortedIndexBy=Rn,z.toFinite=or,z.toInteger=ir,z.toNumber=cr,z.toString=ar,z.VERSION=mr,typeof define=="function"&&typeof define.amd=="object"&&define.amd?(Me._=z, define(function(){return z})):Ue?((Ue.exports=z)._=z,
Te._=z):Me._=z}).call(this);;/*
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
;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* Abstract class. Instantiate an instance of either SFCryptoJS (uses cryptojs) or SFCryptoWeb (uses web crypto) */

var SFAbstractCrypto = function () {
  function SFAbstractCrypto() {
    _classCallCheck(this, SFAbstractCrypto);
  }

  _createClass(SFAbstractCrypto, [{
    key: 'generateRandomKey',
    value: function generateRandomKey(bits) {
      return CryptoJS.lib.WordArray.random(bits / 8).toString();
    }
  }, {
    key: 'generateUUID',
    value: function generateUUID() {
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
    value: function decryptText() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          ciphertextToAuth = _ref.ciphertextToAuth,
          contentCiphertext = _ref.contentCiphertext,
          encryptionKey = _ref.encryptionKey,
          iv = _ref.iv,
          authHash = _ref.authHash,
          authKey = _ref.authKey;

      var requiresAuth = arguments[1];

      if (requiresAuth && !authHash) {
        console.error("Auth hash is required.");
        return;
      }

      if (authHash) {
        var localAuthHash = SFJS.crypto.hmac256(ciphertextToAuth, authKey);
        if (authHash !== localAuthHash) {
          console.error("Auth hash does not match, returning null.");
          return null;
        }
      }
      var keyData = CryptoJS.enc.Hex.parse(encryptionKey);
      var ivData = CryptoJS.enc.Hex.parse(iv || "");
      var decrypted = CryptoJS.AES.decrypt(contentCiphertext, keyData, { iv: ivData, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
      return decrypted.toString(CryptoJS.enc.Utf8);
    }
  }, {
    key: 'encryptText',
    value: function encryptText(text, key, iv) {
      var keyData = CryptoJS.enc.Hex.parse(key);
      var ivData = CryptoJS.enc.Hex.parse(iv || "");
      var encrypted = CryptoJS.AES.encrypt(text, keyData, { iv: ivData, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
      return encrypted.toString();
    }
  }, {
    key: 'generateRandomEncryptionKey',
    value: function generateRandomEncryptionKey() {
      var salt = SFJS.crypto.generateRandomKey(512);
      var passphrase = SFJS.crypto.generateRandomKey(512);
      return CryptoJS.PBKDF2(passphrase, salt, { keySize: 512 / 32 }).toString();
    }
  }, {
    key: 'firstHalfOfKey',
    value: function firstHalfOfKey(key) {
      return key.substring(0, key.length / 2);
    }
  }, {
    key: 'secondHalfOfKey',
    value: function secondHalfOfKey(key) {
      return key.substring(key.length / 2, key.length);
    }
  }, {
    key: 'base64',
    value: function base64(text) {
      return window.btoa(text);
    }
  }, {
    key: 'base64Decode',
    value: function base64Decode(base64String) {
      return window.atob(base64String);
    }
  }, {
    key: 'sha256',
    value: function sha256(text) {
      return CryptoJS.SHA256(text).toString();
    }
  }, {
    key: 'sha1',
    value: function sha1(text) {
      return CryptoJS.SHA1(text).toString();
    }
  }, {
    key: 'hmac256',
    value: function hmac256(message, key) {
      var keyData = CryptoJS.enc.Hex.parse(key);
      var messageData = CryptoJS.enc.Utf8.parse(message);
      var result = CryptoJS.HmacSHA256(messageData, keyData).toString();
      return result;
    }
  }, {
    key: 'computeEncryptionKeysForUser',
    value: function computeEncryptionKeysForUser() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          password = _ref2.password,
          pw_salt = _ref2.pw_salt,
          pw_cost = _ref2.pw_cost;

      var callback = arguments[1];

      this.generateSymmetricKeyPair({ password: password, pw_salt: pw_salt, pw_cost: pw_cost }, function (keys) {
        callback({ pw: keys[0], mk: keys[1], ak: keys[2] });
      }.bind(this));
    }
  }, {
    key: 'calculateVerificationTag',
    value: function calculateVerificationTag(cost, salt, ak) {
      return SFJS.crypto.hmac256([cost, salt].join(":"), ak);
    }
  }, {
    key: 'generateInitialEncryptionKeysForUser',
    value: function generateInitialEncryptionKeysForUser() {
      var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          email = _ref3.email,
          password = _ref3.password;

      var callback = arguments[1];

      var pw_cost = this.defaultPasswordGenerationCost();
      var pw_nonce = this.generateRandomKey(512);
      var pw_salt = this.sha1([email, pw_nonce].join(":"));
      this.generateSymmetricKeyPair({ email: email, password: password, pw_salt: pw_salt, pw_cost: pw_cost }, function (keys) {
        var ak = keys[2];
        var pw_auth = this.calculateVerificationTag(pw_cost, pw_salt, ak);
        callback({ pw: keys[0], mk: keys[1], ak: ak }, { pw_auth: pw_auth, pw_salt: pw_salt, pw_cost: pw_cost });
      }.bind(this));
    }
  }]);

  return SFAbstractCrypto;
}();

exports.SFAbstractCrypto = SFAbstractCrypto;

var SFCryptoJS = function (_SFAbstractCrypto) {
  _inherits(SFCryptoJS, _SFAbstractCrypto);

  function SFCryptoJS() {
    _classCallCheck(this, SFCryptoJS);

    return _possibleConstructorReturn(this, (SFCryptoJS.__proto__ || Object.getPrototypeOf(SFCryptoJS)).apply(this, arguments));
  }

  _createClass(SFCryptoJS, [{
    key: 'generateSymmetricKeyPair',


    /** Generates two deterministic keys based on one input */
    value: function generateSymmetricKeyPair() {
      var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          password = _ref4.password,
          pw_salt = _ref4.pw_salt,
          pw_cost = _ref4.pw_cost;

      var callback = arguments[1];

      var output = CryptoJS.PBKDF2(password, pw_salt, { keySize: 768 / 32, hasher: CryptoJS.algo.SHA512, iterations: pw_cost }).toString();

      var outputLength = output.length;
      var splitLength = outputLength / 3;
      var firstThird = output.slice(0, splitLength);
      var secondThird = output.slice(splitLength, splitLength * 2);
      var thirdThird = output.slice(splitLength * 2, splitLength * 3);
      callback([firstThird, secondThird, thirdThird]);
    }
  }, {
    key: 'defaultPasswordGenerationCost',
    value: function defaultPasswordGenerationCost() {
      return 3000;
    }
  }]);

  return SFCryptoJS;
}(SFAbstractCrypto);

exports.SFCryptoJS = SFCryptoJS;
var subtleCrypto = window.crypto ? window.crypto.subtle : null;

var SFCryptoWeb = function (_SFAbstractCrypto2) {
  _inherits(SFCryptoWeb, _SFAbstractCrypto2);

  function SFCryptoWeb() {
    _classCallCheck(this, SFCryptoWeb);

    return _possibleConstructorReturn(this, (SFCryptoWeb.__proto__ || Object.getPrototypeOf(SFCryptoWeb)).apply(this, arguments));
  }

  _createClass(SFCryptoWeb, [{
    key: 'defaultPasswordGenerationCost',


    /**
    Overrides
    */
    value: function defaultPasswordGenerationCost() {
      return 10000;
    }

    /** Generates two deterministic keys based on one input */

  }, {
    key: 'generateSymmetricKeyPair',
    value: function generateSymmetricKeyPair() {
      var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          password = _ref5.password,
          pw_salt = _ref5.pw_salt,
          pw_cost = _ref5.pw_cost;

      var callback = arguments[1];

      this.stretchPassword({ password: password, pw_salt: pw_salt, pw_cost: pw_cost }, function (output) {
        var outputLength = output.length;
        var splitLength = outputLength / 3;
        var firstThird = output.slice(0, splitLength);
        var secondThird = output.slice(splitLength, splitLength * 2);
        var thirdThird = output.slice(splitLength * 2, splitLength * 3);
        callback([firstThird, secondThird, thirdThird]);
      });
    }

    /**
    Internal
    */

  }, {
    key: 'stretchPassword',
    value: function stretchPassword() {
      var _ref6 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          password = _ref6.password,
          pw_salt = _ref6.pw_salt,
          pw_cost = _ref6.pw_cost;

      var callback = arguments[1];


      this.webCryptoImportKey(password, function (key) {

        if (!key) {
          console.log("Key is null, unable to continue");
          callback(null);
          return;
        }

        this.webCryptoDeriveBits({ key: key, pw_salt: pw_salt, pw_cost: pw_cost }, function (key) {
          if (!key) {
            callback(null);
            return;
          }

          callback(key);
        }.bind(this));
      }.bind(this));
    }
  }, {
    key: 'webCryptoImportKey',
    value: function webCryptoImportKey(input, callback) {
      subtleCrypto.importKey("raw", this.stringToArrayBuffer(input), { name: "PBKDF2" }, false, ["deriveBits"]).then(function (key) {
        callback(key);
      }).catch(function (err) {
        console.error(err);
        callback(null);
      });
    }
  }, {
    key: 'webCryptoDeriveBits',
    value: function webCryptoDeriveBits() {
      var _ref7 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          key = _ref7.key,
          pw_salt = _ref7.pw_salt,
          pw_cost = _ref7.pw_cost;

      var callback = arguments[1];

      subtleCrypto.deriveBits({
        "name": "PBKDF2",
        salt: this.stringToArrayBuffer(pw_salt),
        iterations: pw_cost,
        hash: { name: "SHA-512" }
      }, key, 768).then(function (bits) {
        var key = this.arrayBufferToHexString(new Uint8Array(bits));
        callback(key);
      }.bind(this)).catch(function (err) {
        console.error(err);
        callback(null);
      });
    }
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
  }]);

  return SFCryptoWeb;
}(SFAbstractCrypto);

exports.SFCryptoWeb = SFCryptoWeb;

var SFItemTransformer = function () {
  function SFItemTransformer() {
    _classCallCheck(this, SFItemTransformer);
  }

  _createClass(SFItemTransformer, null, [{
    key: '_private_encryptString',
    value: function _private_encryptString(string, encryptionKey, authKey, uuid, version) {
      var fullCiphertext, contentCiphertext;
      if (version === "001") {
        contentCiphertext = SFJS.crypto.encryptText(string, encryptionKey, null);
        fullCiphertext = version + contentCiphertext;
      } else {
        var iv = SFJS.crypto.generateRandomKey(128);
        contentCiphertext = SFJS.crypto.encryptText(string, encryptionKey, iv);
        var ciphertextToAuth = [version, uuid, iv, contentCiphertext].join(":");
        var authHash = SFJS.crypto.hmac256(ciphertextToAuth, authKey);
        fullCiphertext = [version, authHash, uuid, iv, contentCiphertext].join(":");
      }

      return fullCiphertext;
    }
  }, {
    key: 'encryptItem',
    value: function encryptItem(item, keys, version) {
      var params = {};
      // encrypt item key
      var item_key = SFJS.crypto.generateRandomEncryptionKey();
      if (version === "001") {
        // legacy
        params.enc_item_key = SFJS.crypto.encryptText(item_key, keys.mk, null);
      } else {
        params.enc_item_key = this._private_encryptString(item_key, keys.mk, keys.ak, item.uuid, version);
      }

      // encrypt content
      var ek = SFJS.crypto.firstHalfOfKey(item_key);
      var ak = SFJS.crypto.secondHalfOfKey(item_key);
      var ciphertext = this._private_encryptString(JSON.stringify(item.createContentJSONFromProperties()), ek, ak, item.uuid, version);
      if (version === "001") {
        var authHash = SFJS.crypto.hmac256(ciphertext, ak);
        params.auth_hash = authHash;
      }

      params.content = ciphertext;
      return params;
    }
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
    value: function decryptItem(item, keys) {
      // decrypt encrypted key
      var encryptedItemKey = item.enc_item_key;
      var requiresAuth = true;
      if (encryptedItemKey.startsWith("002") === false) {
        // legacy encryption type, has no prefix
        encryptedItemKey = "001" + encryptedItemKey;
        requiresAuth = false;
      }
      var keyParams = this.encryptionComponentsFromString(encryptedItemKey, keys.mk, keys.ak);

      // return if uuid in auth hash does not match item uuid. Signs of tampering.
      if (keyParams.uuid && keyParams.uuid !== item.uuid) {
        item.errorDecrypting = true;
        return;
      }

      var item_key = SFJS.crypto.decryptText(keyParams, requiresAuth);

      if (!item_key) {
        item.errorDecrypting = true;
        return;
      }

      // decrypt content
      var ek = SFJS.crypto.firstHalfOfKey(item_key);
      var ak = SFJS.crypto.secondHalfOfKey(item_key);
      var itemParams = this.encryptionComponentsFromString(item.content, ek, ak);

      // return if uuid in auth hash does not match item uuid. Signs of tampering.
      if (itemParams.uuid && itemParams.uuid !== item.uuid) {
        item.errorDecrypting = true;
        return;
      }

      if (!itemParams.authHash) {
        // legacy 001
        itemParams.authHash = item.auth_hash;
      }

      var content = SFJS.crypto.decryptText(itemParams, true);
      if (!content) {
        item.errorDecrypting = true;
      }
      item.content = content;
    }
  }, {
    key: 'decryptMultipleItems',
    value: function decryptMultipleItems(items, keys, throws) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;

          if (item.deleted == true) {
            continue;
          }

          var isString = typeof item.content === 'string' || item.content instanceof String;
          if (isString) {
            try {
              if ((item.content.startsWith("001") || item.content.startsWith("002")) && item.enc_item_key) {
                // is encrypted
                this.decryptItem(item, keys);
              } else {
                // is base64 encoded
                item.content = SFJS.crypto.base64Decode(item.content.substring(3, item.content.length));
              }
            } catch (e) {
              item.errorDecrypting = true;
              if (throws) {
                throw e;
              }
              console.log("Error decrypting item", item, e);
              continue;
            }
          }
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
  }]);

  return SFItemTransformer;
}();

window.SFItemTransformer = SFItemTransformer;
exports.SFItemTransformer = SFItemTransformer;

var Item = function () {
  function Item(json_obj) {
    _classCallCheck(this, Item);

    this.updateFromJSON(json_obj);

    this.observers = [];

    if (!this.uuid) {
      this.uuid = SFJS.crypto.generateUUID();
    }
  }

  _createClass(Item, [{
    key: 'updateFromJSON',
    value: function updateFromJSON(json) {
      _.merge(this, json);

      this.created_at = this.created_at ? new Date(this.created_at) : new Date();
      this.updated_at = this.updated_at ? new Date(this.updated_at) : new Date();

      if (json.content) {
        this.mapContentToLocalProperties(this.contentObject);
      }
    }
  }, {
    key: 'setDirty',
    value: function setDirty(dirty) {
      this.dirty = dirty;

      if (dirty) {
        this.notifyObserversOfChange();
      }
    }
  }, {
    key: 'markAllReferencesDirty',
    value: function markAllReferencesDirty() {
      this.allReferencedObjects().forEach(function (reference) {
        reference.setDirty(true);
      });
    }
  }, {
    key: 'addObserver',
    value: function addObserver(observer, callback) {
      if (!_.find(this.observers, observer)) {
        this.observers.push({ observer: observer, callback: callback });
      }
    }
  }, {
    key: 'removeObserver',
    value: function removeObserver(observer) {
      _.remove(this.observers, { observer: observer });
    }
  }, {
    key: 'notifyObserversOfChange',
    value: function notifyObserversOfChange() {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.observers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var observer = _step2.value;

          observer.callback(this);
        }
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
    }
  }, {
    key: 'mapContentToLocalProperties',
    value: function mapContentToLocalProperties(contentObj) {}
  }, {
    key: 'createContentJSONFromProperties',
    value: function createContentJSONFromProperties() {
      return this.structureParams();
    }
  }, {
    key: 'referenceParams',
    value: function referenceParams() {
      // must override
    }
  }, {
    key: 'structureParams',
    value: function structureParams() {
      return { references: this.referenceParams() };
    }
  }, {
    key: 'addItemAsRelationship',
    value: function addItemAsRelationship(item) {
      // must override
    }
  }, {
    key: 'removeItemAsRelationship',
    value: function removeItemAsRelationship(item) {
      // must override
    }
  }, {
    key: 'isBeingRemovedLocally',
    value: function isBeingRemovedLocally() {}
  }, {
    key: 'removeAllRelationships',
    value: function removeAllRelationships() {
      // must override
      this.setDirty(true);
    }
  }, {
    key: 'locallyClearAllReferences',
    value: function locallyClearAllReferences() {}
  }, {
    key: 'mergeMetadataFromItem',
    value: function mergeMetadataFromItem(item) {
      _.merge(this, _.omit(item, ["content"]));
    }
  }, {
    key: 'informReferencesOfUUIDChange',
    value: function informReferencesOfUUIDChange(oldUUID, newUUID) {
      // optional override
    }
  }, {
    key: 'potentialItemOfInterestHasChangedItsUUID',
    value: function potentialItemOfInterestHasChangedItsUUID(newItem, oldUUID, newUUID) {
      // optional override
    }
  }, {
    key: 'allReferencedObjects',
    value: function allReferencedObjects() {
      // must override
      return [];
    }
  }, {
    key: 'doNotEncrypt',
    value: function doNotEncrypt() {
      return false;
    }
  }, {
    key: 'contentObject',
    get: function get() {
      if (!this.content) {
        return {};
      }

      if (this.content !== null && _typeof(this.content) === 'object') {
        // this is the case when mapping localStorage content, in which case the content is already parsed
        return this.content;
      }

      try {
        return JSON.parse(this.content);
      } catch (e) {
        console.log("Error parsing json", e);
        return {};
      }
    }
  }], [{
    key: 'sortItemsByDate',
    value: function sortItemsByDate(items) {
      items.sort(function (a, b) {
        return new Date(b.created_at) - new Date(a.created_at);
      });
    }
  }]);

  return Item;
}();

window.Item = Item;
exports.Item = Item;

var StandardFile = function StandardFile() {
  _classCallCheck(this, StandardFile);

  // detect IE8 and above, and edge.
  // IE and Edge do not support pbkdf2 in WebCrypto, therefore we need to use CryptoJS
  var IEOrEdge = document.documentMode || /Edge/.test(navigator.userAgent);

  if (!IEOrEdge && window.crypto && window.crypto.subtle) {
    this.crypto = new SFCryptoWeb();
  } else {
    this.crypto = new SFCryptoJS();
  }
};

window.StandardFile = StandardFile;
window.SFJS = new StandardFile();


},{}]},{},[1]);
