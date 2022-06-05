"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e=require("@xoid/engine"),n=function(){return n=Object.assign||function(e){for(var n,t=1,o=arguments.length;t<o;t++)for(var i in n=arguments[t])Object.prototype.hasOwnProperty.call(n,i)&&(e[i]=n[i]);return e},n.apply(this,arguments)},t=function(e){return e()};
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */function o(e){return e===Object(e)&&["[object Object]","[object Function]","[object AsyncFunction]"].includes(Object.prototype.toString.call(e))}var i=function(){var t=function(i,c,d){return void 0===d&&(d=[]),o(c)?new Proxy(c,{get:function(n,r){if(r===e.META)return n[e.META];if(!o(n[r]))return n[r];var a=d.map((function(e){return e}));return a.push(r),t(i,c[r],a)},apply:function(t,o,c){var u,s;if(t[e.META]||!i[e.META].devtoolsChannel)return Reflect.apply(t,o,c);var p=null===(s=null===(u=i[e.META])||void 0===u?void 0:u.address)||void 0===s?void 0:s.slice(1).map(r),v=(null==p?void 0:p.length)?"(*."+p.join(".")+")":"*",f="[object AsyncFunction]"===Object.prototype.toString.call(t),y={type:v+"."+d.map(a).join(".")};if(f){y.async=!0;var T=l.get(t);T||(T={i:0},l.set(t,T)),T.i++,y.type=y.type+" #"+T.i}i[e.META].devtoolsChannel.notify(n(n({},y),{args:c}));var b=Reflect.apply(t,o,c);return f?b.then((function(){return i[e.META].devtoolsChannel.notify(n(n({},y),{end:!0}))})):i[e.META].devtoolsChannel.notify(void 0),b}}):c};return t},r=function(e){return e.length<10?a(e):a(e.slice(0,3))+".."+a(e.slice(-3))},a=function(e){return e.replace(".","\\.")},l=new WeakMap;exports.devtools=function(o,r){var a;try{a=window.__REDUX_DEVTOOLS_EXTENSION__}catch(e){}if(!a)return"object"==typeof process&&"development"===process.env.NODE_ENV&&"undefined"!=typeof window&&console.warn("[Warning] Please install/enable Redux devtools extension"),function(){};var l=a.connect({name:r});o[e.META].devtoolsHelper=i();var c,d=(o[e.META].devtoolsChannel=e.createNotifier()).subscribe((function(e){if(!e&&c&&l.send(c,t(o)),c=e,e&&e.async){var i=e.end?" (end)":"";l.send(n(n({},e),{type:e.type+i}),t(o)),c=void 0}})),u=!1,s=e.subscribe(o,(function(){if(u)u=!1;else{var e=window.performance.now().toFixed(2),n=c&&!c.async?c:"Update ("+e+")";l.send(n,t(o)),c=void 0}})),p=l.subscribe((function(e){var n,i,r,a,c,d;if("DISPATCH"===e.type)if(e.state){"JUMP_TO_ACTION"!==(null===(n=e.payload)||void 0===n?void 0:n.type)&&"JUMP_TO_STATE"!==(null===(i=e.payload)||void 0===i?void 0:i.type)||(u=!0);var s=JSON.parse(e.state);o(s)}else if("COMMIT"===(null===(r=e.payload)||void 0===r?void 0:r.type))l.init(t(o));else if("IMPORT_STATE"===(null===(a=e.payload)||void 0===a?void 0:a.type)){var p=null===(c=e.payload.nextLiftedState)||void 0===c?void 0:c.actionsById,v=(null===(d=e.payload.nextLiftedState)||void 0===d?void 0:d.computedStates)||[];u=!0,v.forEach((function(e,n){var i=e.state,r=p[n]||"Update - "+(new Date).toLocaleString();o(i),0===n?l.init(t(o)):l.send(r,t(o))}))}}));return l.init(t(o)),function(){d(),s(),p()}};
