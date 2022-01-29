/*! For license information please see 6cb13b5c.af0f7bd4.js.LICENSE.txt */
(window.webpackJsonp=window.webpackJsonp||[]).push([[16],{74:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return c})),n.d(t,"metadata",(function(){return i})),n.d(t,"rightToc",(function(){return u})),n.d(t,"default",(function(){return l}));var r=n(2),o=n(6),a=(n(92),n(91)),c={id:"dynamic-functions-with-fixed-references",title:"Dynamic functions with fixed references"},i={unversionedId:"recipes/dynamic-functions-with-fixed-references",id:"recipes/dynamic-functions-with-fixed-references",isDocsHomePage:!1,title:"Dynamic functions with fixed references",description:"Inside a React function component, in some cases which will be explained below, a function with a fixed reference, but a dynamic content may be needed. While it's not as straightforward with React hooks, it's easy to solve with xoid.",source:"@site/../docs/recipes/dynamic-functions-with-fixed-references.md",slug:"/recipes/dynamic-functions-with-fixed-references",permalink:"/docs/recipes/dynamic-functions-with-fixed-references",editUrl:"https://github.com/onurkerimov/xoid/blob/master/website/../docs/recipes/dynamic-functions-with-fixed-references.md",version:"current",lastUpdatedAt:1643467229,sidebar:"docs",previous:{title:"Refactoring React classes",permalink:"/docs/recipes/refactoring-react-classes"},next:{title:"Grabbing refs",permalink:"/docs/recipes/grabbing-refs"}},u=[{value:"Quick Example",id:"quick-example",children:[]},{value:"Another Example",id:"another-example",children:[]},{value:"React vs xoid",id:"react-vs-xoid",children:[]}],s={rightToc:u};function l(e){var t=e.components,n=Object(o.a)(e,["components"]);return Object(a.b)("wrapper",Object(r.a)({},s,n,{components:t,mdxType:"MDXLayout"}),Object(a.b)("p",null,"Inside a React function component, in some cases which will be explained below, ",Object(a.b)("strong",{parentName:"p"},"a function with a fixed reference, but a dynamic content")," may be needed. While it's not as straightforward with React hooks, it's easy to solve with ",Object(a.b)("strong",{parentName:"p"},"xoid"),"."),Object(a.b)("h3",{id:"quick-example"},"Quick Example"),Object(a.b)("p",null,"In this example, inside a ",Object(a.b)("inlineCode",{parentName:"p"},"React.useEffect"),", an event listener is attached and removed everytime when ",Object(a.b)("inlineCode",{parentName:"p"},"props.number")," changes."),Object(a.b)("pre",null,Object(a.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"//inside React\nuseEffect(() => {\n  const callback = () => console.log(props.number)\n  window.addEventListener('click', callback)\n  return () => window.removeEventListener('click', callback)\n}, [props.number])\n")),Object(a.b)("p",null,"Let's assume that our requirements somehow led us to attach the listener only once, and remove it only once when the component is unmounted. This could be achieved with React's manners, as the following."),Object(a.b)("pre",null,Object(a.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"//inside React\nconst numberRef = useRef(props.number)\nuseEffect(() => (numberRef.current = props.number), [props.number])\nuseEffect(() => {\n  const callback = () => console.log(numberRef.current)\n  window.addEventListener('click', callback)\n  return () => window.removeEventListener('click', callback)\n}, [])\n")),Object(a.b)("blockquote",null,Object(a.b)("p",{parentName:"blockquote"},"Instead of consuming ",Object(a.b)("inlineCode",{parentName:"p"},"props.number")," directly, The callback function now consumes ",Object(a.b)("inlineCode",{parentName:"p"},"numberRef.current"),", so it always has the most recent version of the ",Object(a.b)("inlineCode",{parentName:"p"},"number")," prop.")),Object(a.b)("p",null,"With ",Object(a.b)("strong",{parentName:"p"},"xoid"),", the equivalent optimization is simply the following:"),Object(a.b)("pre",null,Object(a.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"//inside React\nuseSetup(($props, onCleanup) => {\n  const callback = () => console.log($props().number)\n  window.addEventListener('click', callback)\n  onCleanup(() => window.removeEventListener('click', callback))\n}, props)\n")),Object(a.b)("p",null,"This example is, because it also demonstrates replacing React's lifecycle methods (such as ",Object(a.b)("inlineCode",{parentName:"p"},"useEffect"),"'s unmount using return value) with ",Object(a.b)("strong",{parentName:"p"},"xoid"),". I wanted to start with this anyway, because it shows the potential of ",Object(a.b)("strong",{parentName:"p"},"xoid"),"."),Object(a.b)("h3",{id:"another-example"},"Another Example"),Object(a.b)("p",null,"Let's propose another problem, this time let's examine it in a more detailed way."),Object(a.b)("p",null,"Let's imagine that, inside a React component, we're supposed to initialize a class called ",Object(a.b)("inlineCode",{parentName:"p"},"DragDropLibrary")," ",Object(a.b)("strong",{parentName:"p"},"only once")," as ",Object(a.b)("inlineCode",{parentName:"p"},"new DragDropLibrary({ onDrop })"),". Let's assume that this class cannot receive an updated version of ",Object(a.b)("inlineCode",{parentName:"p"},"onDrop"),' callback, because it was not implemented by us, and we have no interest in modifying it. So, we want to perform dynamic "onDrop" actions, with the initial version of ',Object(a.b)("inlineCode",{parentName:"p"},"onDrop")," that's supplied."),Object(a.b)("p",null,"Imagine that ",Object(a.b)("inlineCode",{parentName:"p"},"props.func"),' is our dynamic function that changes in every render. We\'re going to use it as the source for different "onDrop" actions.'),Object(a.b)("p",null,"Therefore, we need to convert ",Object(a.b)("inlineCode",{parentName:"p"},"props.func")," (dynamic reference) into ",Object(a.b)("inlineCode",{parentName:"p"},"onDrop")," (fixed reference, dynamic content)."),Object(a.b)("p",null,"With React hooks, it's achieved by combination of three hooks. "),Object(a.b)("pre",null,Object(a.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"const funcRef = useRef(props.func)\nuseMemo(() => { funcRef.current = props.func }, [props.func])\nconst onDrop = useCallback(() => (...args) => funcRef.current(...args), [])\n")),Object(a.b)("ul",null,Object(a.b)("li",{parentName:"ul"},"A ref to hold the latest version of ",Object(a.b)("inlineCode",{parentName:"li"},"props.func")),Object(a.b)("li",{parentName:"ul"},"A ",Object(a.b)("inlineCode",{parentName:"li"},"useMemo")," to update the ref as ",Object(a.b)("inlineCode",{parentName:"li"},"props.func")," changes"),Object(a.b)("li",{parentName:"ul"},"Finally a ",Object(a.b)("inlineCode",{parentName:"li"},"useCallback")," with an empty dependencies array")),Object(a.b)("p",null,"What if I told you, with ",Object(a.b)("strong",{parentName:"p"},"xoid"),", it's simply:"),Object(a.b)("pre",null,Object(a.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"// inside React\nconst onDrop = useSetup((atom) => (...args) => atom()(...args), props.func)\n")),Object(a.b)("p",null,"Let's review what's going on here. Remember that ",Object(a.b)("inlineCode",{parentName:"p"},"useSetup")," is used to create things ",Object(a.b)("strong",{parentName:"p"},"exactly once")," inside React components. It's almost similar to ",Object(a.b)("inlineCode",{parentName:"p"},"React.useMemo"),", but unlike that, it doesn't rerun its callback function when the dependency in the second argument is changed. "),Object(a.b)("p",null,"Inside the ",Object(a.b)("inlineCode",{parentName:"p"},"useSetup")," callback, ",Object(a.b)("inlineCode",{parentName:"p"},"atom()"),' simply means "latest version of the dependency". (Just like how ',Object(a.b)("inlineCode",{parentName:"p"},"funcRef.current")," would mean the same). Thus, ",Object(a.b)("inlineCode",{parentName:"p"},"onDrop")," will always call the latest version of the ",Object(a.b)("inlineCode",{parentName:"p"},"props.func")," inside."),Object(a.b)("h3",{id:"react-vs-xoid"},"React vs xoid"),Object(a.b)("p",null,"Let's try to make React version more user-friendly, by creating a custom hook."),Object(a.b)("pre",null,Object(a.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"const useLatestCallback = (func) => {\n  const funcRef = useRef(func)\n  useMemo(() => { funcRef.current = props.func }, [props.func])\n  return useCallback(() => (...args) => funcRef.current(...args), [])\n}\n")),Object(a.b)("p",null,"We can then use it as:"),Object(a.b)("pre",null,Object(a.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"const onDrop = useLatestCallback(props.func)\nuseMemo(() => new DragDropLibrary({ onDrop }),[])\n")),Object(a.b)("p",null,"It's OK to prefer React hooks. The choice is completely up to you. Just remember that ",Object(a.b)("strong",{parentName:"p"},"xoid")," provides sensible fundamentals for local state management, and you'll need less custom hooks or helpers."),Object(a.b)("pre",null,Object(a.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"const onDrop = useSetup((atom) => atom()(), props.func)\nuseSetup(() => new DragDropLibrary({ onDrop }))\n")))}l.isMDXComponent=!0},91:function(e,t,n){"use strict";n.d(t,"a",(function(){return p})),n.d(t,"b",(function(){return d}));var r=n(0),o=n.n(r);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function c(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?c(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):c(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function u(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var s=o.a.createContext({}),l=function(e){var t=o.a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},p=function(e){var t=l(e.components);return o.a.createElement(s.Provider,{value:t},e.children)},f={inlineCode:"code",wrapper:function(e){var t=e.children;return o.a.createElement(o.a.Fragment,{},t)}},b=o.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,c=e.parentName,s=u(e,["components","mdxType","originalType","parentName"]),p=l(n),b=r,d=p["".concat(c,".").concat(b)]||p[b]||f[b]||a;return n?o.a.createElement(d,i(i({ref:t},s),{},{components:n})):o.a.createElement(d,i({ref:t},s))}));function d(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,c=new Array(a);c[0]=b;var i={};for(var u in t)hasOwnProperty.call(t,u)&&(i[u]=t[u]);i.originalType=e,i.mdxType="string"==typeof e?e:r,c[1]=i;for(var s=2;s<a;s++)c[s]=n[s];return o.a.createElement.apply(null,c)}return o.a.createElement.apply(null,n)}b.displayName="MDXCreateElement"},92:function(e,t,n){"use strict";e.exports=n(93)},93:function(e,t,n){"use strict";var r=n(94),o="function"==typeof Symbol&&Symbol.for,a=o?Symbol.for("react.element"):60103,c=o?Symbol.for("react.portal"):60106,i=o?Symbol.for("react.fragment"):60107,u=o?Symbol.for("react.strict_mode"):60108,s=o?Symbol.for("react.profiler"):60114,l=o?Symbol.for("react.provider"):60109,p=o?Symbol.for("react.context"):60110,f=o?Symbol.for("react.forward_ref"):60112,b=o?Symbol.for("react.suspense"):60113,d=o?Symbol.for("react.memo"):60115,m=o?Symbol.for("react.lazy"):60116,y="function"==typeof Symbol&&Symbol.iterator;function h(e){for(var t="https://reactjs.org/docs/error-decoder.html?invariant="+e,n=1;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var O={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},j={};function g(e,t,n){this.props=e,this.context=t,this.refs=j,this.updater=n||O}function v(){}function w(e,t,n){this.props=e,this.context=t,this.refs=j,this.updater=n||O}g.prototype.isReactComponent={},g.prototype.setState=function(e,t){if("object"!=typeof e&&"function"!=typeof e&&null!=e)throw Error(h(85));this.updater.enqueueSetState(this,e,t,"setState")},g.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")},v.prototype=g.prototype;var k=w.prototype=new v;k.constructor=w,r(k,g.prototype),k.isPureReactComponent=!0;var x={current:null},N=Object.prototype.hasOwnProperty,C={key:!0,ref:!0,__self:!0,__source:!0};function R(e,t,n){var r,o={},c=null,i=null;if(null!=t)for(r in void 0!==t.ref&&(i=t.ref),void 0!==t.key&&(c=""+t.key),t)N.call(t,r)&&!C.hasOwnProperty(r)&&(o[r]=t[r]);var u=arguments.length-2;if(1===u)o.children=n;else if(1<u){for(var s=Array(u),l=0;l<u;l++)s[l]=arguments[l+2];o.children=s}if(e&&e.defaultProps)for(r in u=e.defaultProps)void 0===o[r]&&(o[r]=u[r]);return{$$typeof:a,type:e,key:c,ref:i,props:o,_owner:x.current}}function E(e){return"object"==typeof e&&null!==e&&e.$$typeof===a}var S=/\/+/g,D=[];function P(e,t,n,r){if(D.length){var o=D.pop();return o.result=e,o.keyPrefix=t,o.func=n,o.context=r,o.count=0,o}return{result:e,keyPrefix:t,func:n,context:r,count:0}}function _(e){e.result=null,e.keyPrefix=null,e.func=null,e.context=null,e.count=0,10>D.length&&D.push(e)}function $(e,t,n,r){var o=typeof e;"undefined"!==o&&"boolean"!==o||(e=null);var i=!1;if(null===e)i=!0;else switch(o){case"string":case"number":i=!0;break;case"object":switch(e.$$typeof){case a:case c:i=!0}}if(i)return n(r,e,""===t?"."+I(e,0):t),1;if(i=0,t=""===t?".":t+":",Array.isArray(e))for(var u=0;u<e.length;u++){var s=t+I(o=e[u],u);i+=$(o,s,n,r)}else if(null===e||"object"!=typeof e?s=null:s="function"==typeof(s=y&&e[y]||e["@@iterator"])?s:null,"function"==typeof s)for(e=s.call(e),u=0;!(o=e.next()).done;)i+=$(o=o.value,s=t+I(o,u++),n,r);else if("object"===o)throw n=""+e,Error(h(31,"[object Object]"===n?"object with keys {"+Object.keys(e).join(", ")+"}":n,""));return i}function L(e,t,n){return null==e?0:$(e,"",t,n)}function I(e,t){return"object"==typeof e&&null!==e&&null!=e.key?function(e){var t={"=":"=0",":":"=2"};return"$"+(""+e).replace(/[=:]/g,(function(e){return t[e]}))}(e.key):t.toString(36)}function T(e,t){e.func.call(e.context,t,e.count++)}function A(e,t,n){var r=e.result,o=e.keyPrefix;e=e.func.call(e.context,t,e.count++),Array.isArray(e)?M(e,r,n,(function(e){return e})):null!=e&&(E(e)&&(e=function(e,t){return{$$typeof:a,type:e.type,key:t,ref:e.ref,props:e.props,_owner:e._owner}}(e,o+(!e.key||t&&t.key===e.key?"":(""+e.key).replace(S,"$&/")+"/")+n)),r.push(e))}function M(e,t,n,r,o){var a="";null!=n&&(a=(""+n).replace(S,"$&/")+"/"),L(e,A,t=P(t,a,r,o)),_(t)}var q={current:null};function U(){var e=q.current;if(null===e)throw Error(h(321));return e}var W={ReactCurrentDispatcher:q,ReactCurrentBatchConfig:{suspense:null},ReactCurrentOwner:x,IsSomeRendererActing:{current:!1},assign:r};t.Children={map:function(e,t,n){if(null==e)return e;var r=[];return M(e,r,null,t,n),r},forEach:function(e,t,n){if(null==e)return e;L(e,T,t=P(null,null,t,n)),_(t)},count:function(e){return L(e,(function(){return null}),null)},toArray:function(e){var t=[];return M(e,t,null,(function(e){return e})),t},only:function(e){if(!E(e))throw Error(h(143));return e}},t.Component=g,t.Fragment=i,t.Profiler=s,t.PureComponent=w,t.StrictMode=u,t.Suspense=b,t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=W,t.cloneElement=function(e,t,n){if(null==e)throw Error(h(267,e));var o=r({},e.props),c=e.key,i=e.ref,u=e._owner;if(null!=t){if(void 0!==t.ref&&(i=t.ref,u=x.current),void 0!==t.key&&(c=""+t.key),e.type&&e.type.defaultProps)var s=e.type.defaultProps;for(l in t)N.call(t,l)&&!C.hasOwnProperty(l)&&(o[l]=void 0===t[l]&&void 0!==s?s[l]:t[l])}var l=arguments.length-2;if(1===l)o.children=n;else if(1<l){s=Array(l);for(var p=0;p<l;p++)s[p]=arguments[p+2];o.children=s}return{$$typeof:a,type:e.type,key:c,ref:i,props:o,_owner:u}},t.createContext=function(e,t){return void 0===t&&(t=null),(e={$$typeof:p,_calculateChangedBits:t,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null}).Provider={$$typeof:l,_context:e},e.Consumer=e},t.createElement=R,t.createFactory=function(e){var t=R.bind(null,e);return t.type=e,t},t.createRef=function(){return{current:null}},t.forwardRef=function(e){return{$$typeof:f,render:e}},t.isValidElement=E,t.lazy=function(e){return{$$typeof:m,_ctor:e,_status:-1,_result:null}},t.memo=function(e,t){return{$$typeof:d,type:e,compare:void 0===t?null:t}},t.useCallback=function(e,t){return U().useCallback(e,t)},t.useContext=function(e,t){return U().useContext(e,t)},t.useDebugValue=function(){},t.useEffect=function(e,t){return U().useEffect(e,t)},t.useImperativeHandle=function(e,t,n){return U().useImperativeHandle(e,t,n)},t.useLayoutEffect=function(e,t){return U().useLayoutEffect(e,t)},t.useMemo=function(e,t){return U().useMemo(e,t)},t.useReducer=function(e,t,n){return U().useReducer(e,t,n)},t.useRef=function(e){return U().useRef(e)},t.useState=function(e){return U().useState(e)},t.version="16.13.1"},94:function(e,t,n){"use strict";var r=Object.getOwnPropertySymbols,o=Object.prototype.hasOwnProperty,a=Object.prototype.propertyIsEnumerable;function c(e){if(null==e)throw new TypeError("Object.assign cannot be called with null or undefined");return Object(e)}e.exports=function(){try{if(!Object.assign)return!1;var e=new String("abc");if(e[5]="de","5"===Object.getOwnPropertyNames(e)[0])return!1;for(var t={},n=0;n<10;n++)t["_"+String.fromCharCode(n)]=n;if("0123456789"!==Object.getOwnPropertyNames(t).map((function(e){return t[e]})).join(""))return!1;var r={};return"abcdefghijklmnopqrst".split("").forEach((function(e){r[e]=e})),"abcdefghijklmnopqrst"===Object.keys(Object.assign({},r)).join("")}catch(o){return!1}}()?Object.assign:function(e,t){for(var n,i,u=c(e),s=1;s<arguments.length;s++){for(var l in n=Object(arguments[s]))o.call(n,l)&&(u[l]=n[l]);if(r){i=r(n);for(var p=0;p<i.length;p++)a.call(n,i[p])&&(u[i[p]]=n[i[p]])}}return u}}}]);