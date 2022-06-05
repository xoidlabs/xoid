import{META as n,createNotifier as e,subscribe as t}from"@xoid/engine";
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
***************************************************************************** */var o=function(){return o=Object.assign||function(n){for(var e,t=1,o=arguments.length;t<o;t++)for(var i in e=arguments[t])Object.prototype.hasOwnProperty.call(e,i)&&(n[i]=e[i]);return n},o.apply(this,arguments)},i=function(n){return n()},r=function(r,a){var c;try{c=window.__REDUX_DEVTOOLS_EXTENSION__}catch(n){}if(!c)return"object"==typeof process&&"development"===process.env.NODE_ENV&&"undefined"!=typeof window&&console.warn("[Warning] Please install/enable Redux devtools extension"),function(){};var d=c.connect({name:a});r[n].devtoolsHelper=l();var u,p=(r[n].devtoolsChannel=e()).subscribe((function(n){if(!n&&u&&d.send(u,i(r)),u=n,n&&n.async){var e=n.end?" (end)":"";d.send(o(o({},n),{type:n.type+e}),i(r)),u=void 0}})),s=!1,v=t(r,(function(){if(s)s=!1;else{var n=window.performance.now().toFixed(2),e=u&&!u.async?u:"Update ("+n+")";d.send(e,i(r)),u=void 0}})),f=d.subscribe((function(n){var e,t,o,a,l,c;if("DISPATCH"===n.type)if(n.state){"JUMP_TO_ACTION"!==(null===(e=n.payload)||void 0===e?void 0:e.type)&&"JUMP_TO_STATE"!==(null===(t=n.payload)||void 0===t?void 0:t.type)||(s=!0);var u=JSON.parse(n.state);r(u)}else if("COMMIT"===(null===(o=n.payload)||void 0===o?void 0:o.type))d.init(i(r));else if("IMPORT_STATE"===(null===(a=n.payload)||void 0===a?void 0:a.type)){var p=null===(l=n.payload.nextLiftedState)||void 0===l?void 0:l.actionsById,v=(null===(c=n.payload.nextLiftedState)||void 0===c?void 0:c.computedStates)||[];s=!0,v.forEach((function(n,e){var t=n.state,o=p[e]||"Update - "+(new Date).toLocaleString();r(t),0===e?d.init(i(r)):d.send(o,i(r))}))}}));return d.init(i(r)),function(){p(),v(),f()}};function a(n){return n===Object(n)&&["[object Object]","[object Function]","[object AsyncFunction]"].includes(Object.prototype.toString.call(n))}var l=function(){var e=function(t,i,r){return void 0===r&&(r=[]),a(i)?new Proxy(i,{get:function(o,l){if(l===n)return o[n];if(!a(o[l]))return o[l];var c=r.map((function(n){return n}));return c.push(l),e(t,i[l],c)},apply:function(e,i,a){var l,p;if(e[n]||!t[n].devtoolsChannel)return Reflect.apply(e,i,a);var s=null===(p=null===(l=t[n])||void 0===l?void 0:l.address)||void 0===p?void 0:p.slice(1).map(c),v=(null==s?void 0:s.length)?"(*."+s.join(".")+")":"*",f="[object AsyncFunction]"===Object.prototype.toString.call(e),y={type:v+"."+r.map(d).join(".")};if(f){y.async=!0;var O=u.get(e);O||(O={i:0},u.set(e,O)),O.i++,y.type=y.type+" #"+O.i}t[n].devtoolsChannel.notify(o(o({},y),{args:a}));var b=Reflect.apply(e,i,a);return f?b.then((function(){return t[n].devtoolsChannel.notify(o(o({},y),{end:!0}))})):t[n].devtoolsChannel.notify(void 0),b}}):i};return e},c=function(n){return n.length<10?d(n):d(n.slice(0,3))+".."+d(n.slice(-3))},d=function(n){return n.replace(".","\\.")},u=new WeakMap;export{r as devtools};
