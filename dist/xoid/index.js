"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e=require("@xoid/engine"),t=function(e,t,r){var n=function(e){t.node=e,t.notifier.notify()};return r&&(n=r(n)),function(t){var r="function"==typeof t?t(e()):t;n(r)}};function r(e,t,n){if(!t.length)return n;var o=t.map((function(e){return e})),i=o.shift(),u=function(e){return Array.isArray(e)?e.map((function(e){return e})):Object.create(Object.getPrototypeOf(e),Object.getOwnPropertyDescriptors(e))}(e);return u[i]=r(e[i],o,n),u}function n(t){return new Proxy({},{get:function(r,o){if(o===e.RECORD)return t;var i=t.map((function(e){return e}));return i.push(o),n(i)}})}var o=function(o,i){var u=e.parseSelector(i),f=u.isPluck,c=u.fn,s=f?[i]:c(n([]))[e.RECORD],a=o[e.META],p=(o[e.RECORD]||[]).concat(s),l=s.some((function(e){return"symbol"==typeof e}));if(!l){var y=JSON.stringify(p);if(a.selectors||(a.selectors={}),a.selectors[y])return a.selectors[y]}var v=function(){return c(o())},O=t(v,a,(function(e){return function(t){o(),e(r(a.node,p,t))}})),b=e.createTarget(v,O);if(b[e.META]=a,b[e.RECORD]=p,!l){y=JSON.stringify(p);a.selectors[y]=b}return b};Object.defineProperty(exports,"effect",{enumerable:!0,get:function(){return e.effect}}),Object.defineProperty(exports,"subscribe",{enumerable:!0,get:function(){return e.subscribe}}),exports.create=function(r,n,o){var i,u={notifier:e.createNotifier(),node:r},f=!0,c=function(){return f||i(),u.node},s=t(c,u,o),a=e.createTarget(c,s);if(a[e.META]=u,"function"==typeof r){f=!1;var p=e.createCleanup(),l=p.onCleanup,y=p.cleanupAll,v=e.createGetState((function(){u.notifier.listeners.size?i():f=!1}),l);i=function(){y();var e=r(v);u.node=e,f=!0,a()!==e&&u.notifier.notify()}}return n&&"function"==typeof n&&(a[e.USABLE]=n(a)),a},exports.use=function(t,r){if(1===arguments.length){var n=t[e.USABLE],i=t[e.META].devtoolsHelper;return i?i(t,n):n}return o(t,r)};
