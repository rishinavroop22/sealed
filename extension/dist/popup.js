var He=()=>{};var Ve=function(e){let t=[],n=0;for(let s=0;s<e.length;s++){let i=e.charCodeAt(s);i<128?t[n++]=i:i<2048?(t[n++]=i>>6|192,t[n++]=i&63|128):(i&64512)===55296&&s+1<e.length&&(e.charCodeAt(s+1)&64512)===56320?(i=65536+((i&1023)<<10)+(e.charCodeAt(++s)&1023),t[n++]=i>>18|240,t[n++]=i>>12&63|128,t[n++]=i>>6&63|128,t[n++]=i&63|128):(t[n++]=i>>12|224,t[n++]=i>>6&63|128,t[n++]=i&63|128)}return t},jt=function(e){let t=[],n=0,s=0;for(;n<e.length;){let i=e[n++];if(i<128)t[s++]=String.fromCharCode(i);else if(i>191&&i<224){let o=e[n++];t[s++]=String.fromCharCode((i&31)<<6|o&63)}else if(i>239&&i<365){let o=e[n++],r=e[n++],a=e[n++],c=((i&7)<<18|(o&63)<<12|(r&63)<<6|a&63)-65536;t[s++]=String.fromCharCode(55296+(c>>10)),t[s++]=String.fromCharCode(56320+(c&1023))}else{let o=e[n++],r=e[n++];t[s++]=String.fromCharCode((i&15)<<12|(o&63)<<6|r&63)}}return t.join("")},ze={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(e,t){if(!Array.isArray(e))throw Error("encodeByteArray takes an array as a parameter");this.init_();let n=t?this.byteToCharMapWebSafe_:this.byteToCharMap_,s=[];for(let i=0;i<e.length;i+=3){let o=e[i],r=i+1<e.length,a=r?e[i+1]:0,c=i+2<e.length,l=c?e[i+2]:0,h=o>>2,g=(o&3)<<4|a>>4,E=(a&15)<<2|l>>6,z=l&63;c||(z=64,r||(E=64)),s.push(n[h],n[g],n[E],n[z])}return s.join("")},encodeString(e,t){return this.HAS_NATIVE_SUPPORT&&!t?btoa(e):this.encodeByteArray(Ve(e),t)},decodeString(e,t){return this.HAS_NATIVE_SUPPORT&&!t?atob(e):jt(this.decodeStringToByteArray(e,t))},decodeStringToByteArray(e,t){this.init_();let n=t?this.charToByteMapWebSafe_:this.charToByteMap_,s=[];for(let i=0;i<e.length;){let o=n[e.charAt(i++)],a=i<e.length?n[e.charAt(i)]:0;++i;let l=i<e.length?n[e.charAt(i)]:64;++i;let g=i<e.length?n[e.charAt(i)]:64;if(++i,o==null||a==null||l==null||g==null)throw new se;let E=o<<2|a>>4;if(s.push(E),l!==64){let z=a<<4&240|l>>2;if(s.push(z),g!==64){let zt=l<<6&192|g;s.push(zt)}}}return s},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let e=0;e<this.ENCODED_VALS.length;e++)this.byteToCharMap_[e]=this.ENCODED_VALS.charAt(e),this.charToByteMap_[this.byteToCharMap_[e]]=e,this.byteToCharMapWebSafe_[e]=this.ENCODED_VALS_WEBSAFE.charAt(e),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[e]]=e,e>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(e)]=e,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(e)]=e)}}},se=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}},Wt=function(e){let t=Ve(e);return ze.encodeByteArray(t,!0)},ie=function(e){return Wt(e).replace(/\./g,"")},je=function(e){try{return ze.decodeString(e,!0)}catch(t){console.error("base64Decode failed: ",t)}return null};function D(e){return We(void 0,e)}function We(e,t){if(!(t instanceof Object))return t;switch(t.constructor){case Date:let n=t;return new Date(n.getTime());case Object:e===void 0&&(e={});break;case Array:e=[];break;default:return t}for(let n in t)!t.hasOwnProperty(n)||!Zt(n)||(e[n]=We(e[n],t[n]));return e}function Zt(e){return e!=="__proto__"}function oe(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}var Yt=()=>oe().__FIREBASE_DEFAULTS__,Jt=()=>{if(typeof process>"u"||typeof process.env>"u")return;let e=process.env.__FIREBASE_DEFAULTS__;if(e)return JSON.parse(e)},Kt=()=>{if(typeof document>"u")return;let e;try{e=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}let t=e&&je(e[1]);return t&&JSON.parse(t)},qt=()=>{try{return He()||Yt()||Jt()||Kt()}catch(e){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${e}`);return}};var re=()=>qt()?.config;var B=class{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((t,n)=>{this.resolve=t,this.reject=n})}wrapCallback(t){return(n,s)=>{n?this.reject(n):this.resolve(s),typeof t=="function"&&(this.promise.catch(()=>{}),t.length===1?t(n):t(n,s))}}};function Ze(){try{return typeof indexedDB=="object"}catch{return!1}}function Ye(){return new Promise((e,t)=>{try{let n=!0,s="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(s);i.onsuccess=()=>{i.result.close(),n||self.indexedDB.deleteDatabase(s),e(!0)},i.onupgradeneeded=()=>{n=!1},i.onerror=()=>{t(i.error?.message||"")}}catch(n){t(n)}})}var Qt="FirebaseError",_=class e extends Error{constructor(t,n,s){super(n),this.code=t,this.customData=s,this.name=Qt,Object.setPrototypeOf(this,e.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,$.prototype.create)}},$=class{constructor(t,n,s){this.service=t,this.serviceName=n,this.errors=s}create(t,...n){let s=n[0]||{},i=`${this.service}/${t}`,o=this.errors[t],r=o?Xt(o,s):"Error",a=`${this.serviceName}: ${r} (${i}).`;return new _(i,a,s)}};function Xt(e,t){try{let n=0,s="";for(;n<e.length;){let i=e.indexOf("{$",n);if(i===-1){s+=e.substring(n);break}let o=e.indexOf("}",i+2);if(o===-1){s+=e.substring(n);break}let r=e.substring(i+2,o),a=t[r];s+=e.substring(n,i)+(a!=null?String(a):`<${r}?>`),n=o+1}return s}catch{return e}}function j(e,t){if(e===t)return!0;let n=Object.keys(e),s=Object.keys(t);for(let i of n){if(!s.includes(i))return!1;let o=e[i],r=t[i];if(Ge(o)&&Ge(r)){if(!j(o,r))return!1}else if(o!==r)return!1}for(let i of s)if(!n.includes(i))return!1;return!0}function Ge(e){return e!==null&&typeof e=="object"}var li=4*60*60*1e3;function Je(e){return e&&e._delegate?e._delegate:e}var O=class{constructor(t,n,s){this.name=t,this.instanceFactory=n,this.type=s,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(t){return this.instantiationMode=t,this}setMultipleInstances(t){return this.multipleInstances=t,this}setServiceProps(t){return this.serviceProps=t,this}setInstanceCreatedCallback(t){return this.onInstanceCreated=t,this}};var L="[DEFAULT]";var ae=class{constructor(t,n){this.name=t,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(t){let n=this.normalizeInstanceIdentifier(t);if(!this.instancesDeferred.has(n)){let s=new B;if(this.instancesDeferred.set(n,s),this.isInitialized(n)||this.shouldAutoInitialize())try{let i=this.getOrInitializeService({instanceIdentifier:n});i&&s.resolve(i)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(t){let n=this.normalizeInstanceIdentifier(t?.identifier),s=t?.optional??!1;if(this.isInitialized(n)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:n})}catch(i){if(s)return null;throw i}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(t){if(t.name!==this.name)throw Error(`Mismatching Component ${t.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=t,!!this.shouldAutoInitialize()){if(tn(t))try{this.getOrInitializeService({instanceIdentifier:L})}catch{}for(let[n,s]of this.instancesDeferred.entries()){let i=this.normalizeInstanceIdentifier(n);try{let o=this.getOrInitializeService({instanceIdentifier:i});s.resolve(o)}catch{}}}}clearInstance(t=L){this.instancesDeferred.delete(t),this.instancesOptions.delete(t),this.instances.delete(t)}async delete(){let t=Array.from(this.instances.values());await Promise.all([...t.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...t.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(t=L){return this.instances.has(t)}getOptions(t=L){return this.instancesOptions.get(t)||{}}initialize(t={}){let{options:n={}}=t,s=this.normalizeInstanceIdentifier(t.instanceIdentifier);if(this.isInitialized(s))throw Error(`${this.name}(${s}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);let i=this.getOrInitializeService({instanceIdentifier:s,options:n});for(let[o,r]of this.instancesDeferred.entries()){let a=this.normalizeInstanceIdentifier(o);s===a&&r.resolve(i)}return i}onInit(t,n){let s=this.normalizeInstanceIdentifier(n),i=this.onInitCallbacks.get(s)??new Set;i.add(t),this.onInitCallbacks.set(s,i);let o=this.instances.get(s);return o&&t(o,s),()=>{i.delete(t)}}invokeOnInitCallbacks(t,n){let s=this.onInitCallbacks.get(n);if(s)for(let i of s)try{i(t,n)}catch{}}getOrInitializeService({instanceIdentifier:t,options:n={}}){let s=this.instances.get(t);if(!s&&this.component&&(s=this.component.instanceFactory(this.container,{instanceIdentifier:en(t),options:n}),this.instances.set(t,s),this.instancesOptions.set(t,n),this.invokeOnInitCallbacks(s,t),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,t,s)}catch{}return s||null}normalizeInstanceIdentifier(t=L){return this.component?this.component.multipleInstances?t:L:t}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}};function en(e){return e===L?void 0:e}function tn(e){return e.instantiationMode==="EAGER"}var W=class{constructor(t){this.name=t,this.providers=new Map}addComponent(t){let n=this.getProvider(t.name);if(n.isComponentSet())throw new Error(`Component ${t.name} has already been registered with ${this.name}`);n.setComponent(t)}addOrOverwriteComponent(t){this.getProvider(t.name).isComponentSet()&&this.providers.delete(t.name),this.addComponent(t)}getProvider(t){if(this.providers.has(t))return this.providers.get(t);let n=new ae(t,this);return this.providers.set(t,n),n}getProviders(){return Array.from(this.providers.values())}};var nn=[],p;(function(e){e[e.DEBUG=0]="DEBUG",e[e.VERBOSE=1]="VERBOSE",e[e.INFO=2]="INFO",e[e.WARN=3]="WARN",e[e.ERROR=4]="ERROR",e[e.SILENT=5]="SILENT"})(p||(p={}));var sn={debug:p.DEBUG,verbose:p.VERBOSE,info:p.INFO,warn:p.WARN,error:p.ERROR,silent:p.SILENT},on=p.INFO,rn={[p.DEBUG]:"log",[p.VERBOSE]:"log",[p.INFO]:"info",[p.WARN]:"warn",[p.ERROR]:"error"},an=(e,t,...n)=>{if(t<e.logLevel)return;let s=new Date().toISOString(),i=rn[t];if(i)console[i](`[${s}]  ${e.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${t})`)},k=class{constructor(t){this.name=t,this._logLevel=on,this._logHandler=an,this._userLogHandler=null,nn.push(this)}get logLevel(){return this._logLevel}set logLevel(t){if(!(t in p))throw new TypeError(`Invalid value "${t}" assigned to \`logLevel\``);this._logLevel=t}setLogLevel(t){this._logLevel=typeof t=="string"?sn[t]:t}get logHandler(){return this._logHandler}set logHandler(t){if(typeof t!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=t}get userLogHandler(){return this._userLogHandler}set userLogHandler(t){this._userLogHandler=t}debug(...t){this._userLogHandler&&this._userLogHandler(this,p.DEBUG,...t),this._logHandler(this,p.DEBUG,...t)}log(...t){this._userLogHandler&&this._userLogHandler(this,p.VERBOSE,...t),this._logHandler(this,p.VERBOSE,...t)}info(...t){this._userLogHandler&&this._userLogHandler(this,p.INFO,...t),this._logHandler(this,p.INFO,...t)}warn(...t){this._userLogHandler&&this._userLogHandler(this,p.WARN,...t),this._logHandler(this,p.WARN,...t)}error(...t){this._userLogHandler&&this._userLogHandler(this,p.ERROR,...t),this._logHandler(this,p.ERROR,...t)}};var cn=(e,t)=>t.some(n=>e instanceof n),Ke,qe;function ln(){return Ke||(Ke=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function dn(){return qe||(qe=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}var Qe=new WeakMap,le=new WeakMap,Xe=new WeakMap,ce=new WeakMap,ue=new WeakMap;function un(e){let t=new Promise((n,s)=>{let i=()=>{e.removeEventListener("success",o),e.removeEventListener("error",r)},o=()=>{n(S(e.result)),i()},r=()=>{s(e.error),i()};e.addEventListener("success",o),e.addEventListener("error",r)});return t.then(n=>{n instanceof IDBCursor&&Qe.set(n,e)}).catch(()=>{}),ue.set(t,e),t}function fn(e){if(le.has(e))return;let t=new Promise((n,s)=>{let i=()=>{e.removeEventListener("complete",o),e.removeEventListener("error",r),e.removeEventListener("abort",r)},o=()=>{n(),i()},r=()=>{s(e.error||new DOMException("AbortError","AbortError")),i()};e.addEventListener("complete",o),e.addEventListener("error",r),e.addEventListener("abort",r)});le.set(e,t)}var de={get(e,t,n){if(e instanceof IDBTransaction){if(t==="done")return le.get(e);if(t==="objectStoreNames")return e.objectStoreNames||Xe.get(e);if(t==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return S(e[t])},set(e,t,n){return e[t]=n,!0},has(e,t){return e instanceof IDBTransaction&&(t==="done"||t==="store")?!0:t in e}};function et(e){de=e(de)}function hn(e){return e===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(t,...n){let s=e.call(Z(this),t,...n);return Xe.set(s,t.sort?t.sort():[t]),S(s)}:dn().includes(e)?function(...t){return e.apply(Z(this),t),S(Qe.get(this))}:function(...t){return S(e.apply(Z(this),t))}}function pn(e){return typeof e=="function"?hn(e):(e instanceof IDBTransaction&&fn(e),cn(e,ln())?new Proxy(e,de):e)}function S(e){if(e instanceof IDBRequest)return un(e);if(ce.has(e))return ce.get(e);let t=pn(e);return t!==e&&(ce.set(e,t),ue.set(t,e)),t}var Z=e=>ue.get(e);function nt(e,t,{blocked:n,upgrade:s,blocking:i,terminated:o}={}){let r=indexedDB.open(e,t),a=S(r);return s&&r.addEventListener("upgradeneeded",c=>{s(S(r.result),c.oldVersion,c.newVersion,S(r.transaction),c)}),n&&r.addEventListener("blocked",c=>n(c.oldVersion,c.newVersion,c)),a.then(c=>{o&&c.addEventListener("close",()=>o()),i&&c.addEventListener("versionchange",l=>i(l.oldVersion,l.newVersion,l))}).catch(()=>{}),a}var mn=["get","getKey","getAll","getAllKeys","count"],gn=["put","add","delete","clear"],fe=new Map;function tt(e,t){if(!(e instanceof IDBDatabase&&!(t in e)&&typeof t=="string"))return;if(fe.get(t))return fe.get(t);let n=t.replace(/FromIndex$/,""),s=t!==n,i=gn.includes(n);if(!(n in(s?IDBIndex:IDBObjectStore).prototype)||!(i||mn.includes(n)))return;let o=async function(r,...a){let c=this.transaction(r,i?"readwrite":"readonly"),l=c.store;return s&&(l=l.index(a.shift())),(await Promise.all([l[n](...a),i&&c.done]))[0]};return fe.set(t,o),o}et(e=>({...e,get:(t,n,s)=>tt(t,n)||e.get(t,n,s),has:(t,n)=>!!tt(t,n)||e.has(t,n)}));var pe=class{constructor(t){this.container=t}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(En(n)){let s=n.getImmediate();return`${s.library}/${s.version}`}else return null}).filter(n=>n).join(" ")}};function En(e){return e.getComponent()?.type==="VERSION"}var me="@firebase/app",st="0.16.6";var R=new k("@firebase/app"),yn="@firebase/app-compat",bn="@firebase/analytics-compat",An="@firebase/analytics",Sn="@firebase/app-check-compat",Cn="@firebase/app-check",_n="@firebase/auth",On="@firebase/auth-compat",wn="@firebase/crashlytics",Rn="@firebase/database",In="@firebase/data-connect",Tn="@firebase/database-compat",Dn="@firebase/functions",Nn="@firebase/functions-compat",vn="@firebase/installations",Ln="@firebase/installations-compat",Mn="@firebase/messaging",Pn="@firebase/messaging-compat",xn="@firebase/performance",kn="@firebase/performance-compat",Fn="@firebase/remote-config",Un="@firebase/remote-config-compat",Bn="@firebase/storage",$n="@firebase/storage-compat",Hn="@firebase/firestore",Gn="@firebase/ai",Vn="@firebase/firestore-compat",zn="firebase";var ge="[DEFAULT]",jn={[me]:"fire-core",[yn]:"fire-core-compat",[An]:"fire-analytics",[bn]:"fire-analytics-compat",[Cn]:"fire-app-check",[Sn]:"fire-app-check-compat",[_n]:"fire-auth",[On]:"fire-auth-compat",[wn]:"fire-cls",[Rn]:"fire-rtdb",[In]:"fire-data-connect",[Tn]:"fire-rtdb-compat",[Dn]:"fire-fn",[Nn]:"fire-fn-compat",[vn]:"fire-iid",[Ln]:"fire-iid-compat",[Mn]:"fire-fcm",[Pn]:"fire-fcm-compat",[xn]:"fire-perf",[kn]:"fire-perf-compat",[Fn]:"fire-rc",[Un]:"fire-rc-compat",[Bn]:"fire-gcs",[$n]:"fire-gcs-compat",[Hn]:"fire-fst",[Vn]:"fire-fst-compat",[Gn]:"fire-vertex","fire-js":"fire-js",[zn]:"fire-js-all"};var Y=new Map,Wn=new Map,Ee=new Map;function it(e,t){try{e.container.addComponent(t)}catch(n){R.debug(`Component ${t.name} failed to register with FirebaseApp ${e.name}`,n)}}function H(e){let t=e.name;if(Ee.has(t))return R.debug(`There were multiple attempts to register component ${t}.`),!1;Ee.set(t,e);for(let n of Y.values())it(n,e);for(let n of Wn.values())it(n,e);return!0}function ct(e,t){let n=e.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),e.container.getProvider(t)}function lt(e){return e==null?!1:e.settings!==void 0}var Zn={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different {$mismatchedParam}. Existing: '{$oldValue}'. New: '{$newValue}'.","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},w=new $("app","Firebase",Zn);var ye=class{constructor(t,n,s){this._isDeleted=!1,this._options={...t},this._config={...n},this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=s,this.container.addComponent(new O("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(t){this.checkDestroyed(),this._automaticDataCollectionEnabled=t}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(t){this._isDeleted=t}checkDestroyed(){if(this.isDeleted)throw w.create("app-deleted",{appName:this._name})}};function Se(e,t={}){let n=e;typeof t!="object"&&(t={name:t});let s={name:ge,automaticDataCollectionEnabled:!0,...t},i=s.name;if(typeof i!="string"||!i)throw w.create("bad-app-name",{appName:String(i)});if(n||(n=re()),!n)throw w.create("no-options");let o=Y.get(i);if(o)if(j(n,o.options)){if(j(s,o.config))return o;throw w.create("duplicate-app",{appName:i,mismatchedParam:"config",oldValue:JSON.stringify(o.config),newValue:JSON.stringify(s)})}else throw w.create("duplicate-app",{appName:i,mismatchedParam:"options",oldValue:JSON.stringify(o.options),newValue:JSON.stringify(n)});let r=new W(i);for(let c of Ee.values())r.addComponent(c);let a=new ye(n,s,r);return Y.set(i,a),a}function dt(e=ge){let t=Y.get(e);if(!t&&e===ge&&re())return Se();if(!t)throw w.create("no-app",{appName:e});return t}function N(e,t,n){let s=jn[e]??e;n&&(s+=`-${n}`);let i=s.match(/\s|\//),o=t.match(/\s|\//);if(i||o){let r=[`Unable to register library "${s}" with version "${t}":`];i&&r.push(`library name "${s}" contains illegal characters (whitespace or "/")`),i&&o&&r.push("and"),o&&r.push(`version name "${t}" contains illegal characters (whitespace or "/")`),R.warn(r.join(" "));return}H(new O(`${s}-version`,()=>({library:s,version:t}),"VERSION"))}var Yn="firebase-heartbeat-database",Jn=1,G="firebase-heartbeat-store",he=null;function ut(){return he||(he=nt(Yn,Jn,{upgrade:(e,t)=>{switch(t){case 0:try{e.createObjectStore(G)}catch(n){console.warn(n)}}}}).catch(e=>{throw w.create("idb-open",{originalErrorMessage:e.message})})),he}async function Kn(e){try{let n=(await ut()).transaction(G),s=await n.objectStore(G).get(ft(e));return await n.done,s}catch(t){if(t instanceof _)R.warn(t.message);else{let n=w.create("idb-get",{originalErrorMessage:t?.message});R.warn(n.message)}}}async function ot(e,t){try{let s=(await ut()).transaction(G,"readwrite");await s.objectStore(G).put(t,ft(e)),await s.done}catch(n){if(n instanceof _)R.warn(n.message);else{let s=w.create("idb-set",{originalErrorMessage:n?.message});R.warn(s.message)}}}function ft(e){return`${e.name}!${e.options.appId}`}var qn=1024,Qn=30,be=class{constructor(t){this.container=t,this._heartbeatsCache=null;let n=this.container.getProvider("app").getImmediate();this._storage=new Ae(n),this._heartbeatsCachePromise=this._storage.read().then(s=>(this._heartbeatsCache=s,s))}async triggerHeartbeat(){try{let n=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=rt();if(this._heartbeatsCache?.heartbeats==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(i=>i.date===s))return;if(this._heartbeatsCache.heartbeats.push({date:s,agent:n}),this._heartbeatsCache.heartbeats.length>Qn){let i=es(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(i,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(t){R.warn(t)}}async getHeartbeatsHeader(){try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null||this._heartbeatsCache.heartbeats.length===0)return"";let t=rt(),{heartbeatsToSend:n,unsentEntries:s}=Xn(this._heartbeatsCache.heartbeats),i=ie(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return R.warn(t),""}}};function rt(){return new Date().toISOString().substring(0,10)}function Xn(e,t=qn){let n=[],s=e.slice();for(let i of e){let o=n.find(r=>r.agent===i.agent);if(o){if(o.dates.push(i.date),at(n)>t){o.dates.pop();break}}else if(n.push({agent:i.agent,dates:[i.date]}),at(n)>t){n.pop();break}s=s.slice(1)}return{heartbeatsToSend:n,unsentEntries:s}}var Ae=class{constructor(t){this.app=t,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Ze()?Ye().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){let n=await Kn(this.app);return n?.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(t){if(await this._canUseIndexedDBPromise){let s=await this.read();return ot(this.app,{lastSentHeartbeatDate:t.lastSentHeartbeatDate??s.lastSentHeartbeatDate,heartbeats:t.heartbeats})}else return}async add(t){if(await this._canUseIndexedDBPromise){let s=await this.read();return ot(this.app,{lastSentHeartbeatDate:t.lastSentHeartbeatDate??s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...t.heartbeats]})}else return}};function at(e){return ie(JSON.stringify({version:2,heartbeats:e})).length}function es(e){if(e.length===0)return-1;let t=0,n=e[0].date;for(let s=1;s<e.length;s++)e[s].date<n&&(n=e[s].date,t=s);return t}function ts(e){H(new O("platform-logger",t=>new pe(t),"PRIVATE")),H(new O("heartbeat",t=>new be(t),"PRIVATE")),N(me,st,e),N(me,st,"esm2020"),N("fire-js","")}ts("");var ns="firebase",ss="13.3.0";N(ns,ss,"app");var ht="@firebase/ai",Re="3.1.0";var F="AI",is="global",os="firebasevertexai.googleapis.com",K="v1beta",pt=Re,rs="gl-js",as="hybrid",cs=180*1e3,ls="gemini-3.5-flash-lite";var f=class e extends _{constructor(t,n,s){let i=F,o=`${i}/${t}`,r=`${i}: ${n} (${o})`;super(t,r),this.code=t,this.customErrorData=s,Error.captureStackTrace&&Error.captureStackTrace(this,e),Object.setPrototypeOf(this,e.prototype),this.toString=()=>r}};var mt=["user","model","function","system"];var St={HARM_SEVERITY_NEGLIGIBLE:"HARM_SEVERITY_NEGLIGIBLE",HARM_SEVERITY_LOW:"HARM_SEVERITY_LOW",HARM_SEVERITY_MEDIUM:"HARM_SEVERITY_MEDIUM",HARM_SEVERITY_HIGH:"HARM_SEVERITY_HIGH",HARM_SEVERITY_UNSUPPORTED:"HARM_SEVERITY_UNSUPPORTED"};var b={STOP:"STOP",MAX_TOKENS:"MAX_TOKENS",SAFETY:"SAFETY",RECITATION:"RECITATION",OTHER:"OTHER",BLOCKLIST:"BLOCKLIST",PROHIBITED_CONTENT:"PROHIBITED_CONTENT",SPII:"SPII",MALFORMED_FUNCTION_CALL:"MALFORMED_FUNCTION_CALL",IMAGE_SAFETY:"IMAGE_SAFETY",IMAGE_PROHIBITED_CONTENT:"IMAGE_PROHIBITED_CONTENT",IMAGE_OTHER:"IMAGE_OTHER",NO_IMAGE:"NO_IMAGE",IMAGE_RECITATION:"IMAGE_RECITATION",LANGUAGE:"LANGUAGE",UNEXPECTED_TOOL_CALL:"UNEXPECTED_TOOL_CALL",TOO_MANY_TOOL_CALLS:"TOO_MANY_TOOL_CALLS",MISSING_THOUGHT_SIGNATURE:"MISSING_THOUGHT_SIGNATURE",MALFORMED_RESPONSE:"MALFORMED_RESPONSE"};var A={PREFER_ON_DEVICE:"prefer_on_device",ONLY_ON_DEVICE:"only_on_device",ONLY_IN_CLOUD:"only_in_cloud",PREFER_IN_CLOUD:"prefer_in_cloud"},v={ON_DEVICE:"on_device",IN_CLOUD:"in_cloud"};var d={ERROR:"error",REQUEST_ERROR:"request-error",RESPONSE_ERROR:"response-error",FETCH_ERROR:"fetch-error",SESSION_CLOSED:"session-closed",INVALID_CONTENT:"invalid-content",API_NOT_ENABLED:"api-not-enabled",ALREADY_INITIALIZED:"already-initialized",INVALID_SCHEMA:"invalid-schema",NO_API_KEY:"no-api-key",NO_APP_ID:"no-app-id",NO_MODEL:"no-model",NO_PROJECT_ID:"no-project-id",PARSE_FAILED:"parse-failed",UNSUPPORTED:"unsupported"};var T={AGENT_PLATFORM:"AGENT_PLATFORM",GOOGLE_AI:"GOOGLE_AI"};var q=class{constructor(t){this.backendType=t}},P=class extends q{constructor(){super(T.GOOGLE_AI)}_getModelPath(t,n){return`/${K}/projects/${t}/${n}`}_getTemplatePath(t,n){return`/${K}/projects/${t}/templates/${n}`}},Q=class extends q{constructor(t){super(T.AGENT_PLATFORM),this.location=is,t&&(this.location=t)}_getModelPath(t,n){return`/${K}/projects/${t}/locations/${this.location}/${n}`}_getTemplatePath(t,n){return`/${K}/projects/${t}/locations/${this.location}/templates/${n}`}};function ds(e){if(e instanceof P)return`${F}/googleai`;if(e instanceof Q)return`${F}/agentplatform/${e.location}`;throw new f(d.ERROR,`Invalid backend: ${JSON.stringify(e.backendType)}`)}function us(e){let t=e.split("/");if(t[0]!==F)throw new f(d.ERROR,`Invalid instance identifier, unknown prefix '${t[0]}'`);switch(t[1]){case"agentplatform":let s=t[2];if(!s)throw new f(d.ERROR,`Invalid instance identifier, unknown location '${e}'`);return new Q(s);case"googleai":return new P;default:throw new f(d.ERROR,`Invalid instance identifier string: '${e}'`)}}var y=new k("@firebase/ai"),I;(function(e){e.UNAVAILABLE="unavailable",e.DOWNLOADABLE="downloadable",e.DOWNLOADING="downloading",e.AVAILABLE="available"})(I||(I={}));var Ct={type:"text",languages:["en"]},Ce=[Ct,{type:"image"}],_e=[Ct],X=class e{constructor(t,n,s){this.languageModelProvider=t,this.mode=n,this.downloadPromise=null,this.onDeviceParams={createOptions:{expectedInputs:Ce,expectedOutputs:_e}},s&&(this.onDeviceParams=s,this.onDeviceParams.createOptions?(this.onDeviceParams.createOptions.expectedInputs||(this.onDeviceParams.createOptions.expectedInputs=Ce),this.onDeviceParams.createOptions.expectedOutputs||(this.onDeviceParams.createOptions.expectedOutputs=_e)):this.onDeviceParams.createOptions={expectedInputs:Ce,expectedOutputs:_e})}async isAvailable(t){if(!this.mode)return y.debug("On-device inference unavailable because mode is undefined."),!1;if(this.mode===A.ONLY_IN_CLOUD)return y.debug('On-device inference unavailable because mode is "only_in_cloud".'),!1;let n=await this.languageModelProvider?.availability(this.onDeviceParams.createOptions);if(this.mode===A.ONLY_ON_DEVICE){if(n===I.UNAVAILABLE)throw new f(d.API_NOT_ENABLED,"Local LanguageModel API not available in this environment.");if(n===I.DOWNLOADABLE||n===I.DOWNLOADING){y.debug("Waiting for download of LanguageModel to complete.");try{await this.downloadPromise}catch(s){throw new f(d.ERROR,s.message)}return!0}return!0}return n!==I.AVAILABLE?(y.debug(`On-device inference unavailable because availability is "${n}".`),!1):e.isOnDeviceRequest(t)?!0:(y.debug("On-device inference unavailable because request is incompatible."),!1)}async generateContent(t){let n=await this.createSession(),s=await Promise.all(t.contents.map(e.toLanguageModelMessage)),i=await n.prompt(s,this.onDeviceParams.promptOptions);return e.toResponse(i)}async generateContentStream(t){let n=await this.createSession(),s=await Promise.all(t.contents.map(e.toLanguageModelMessage)),i=n.promptStreaming(s,this.onDeviceParams.promptOptions);return e.toStreamResponse(i)}async countTokens(t){throw new f(d.REQUEST_ERROR,"Count Tokens is not yet available for on-device model.")}static isOnDeviceRequest(t){if(t.contents.length===0)return y.debug("Empty prompt rejected for on-device inference."),!1;for(let n of t.contents){if(n.parts.some(s=>"functionResponse"in s))return y.debug("Content with a function response part rejected for on-device inference."),!1;for(let s of n.parts)if("inlineData"in s&&s.inlineData&&e.SUPPORTED_MIME_TYPES.indexOf(s.inlineData.mimeType)===-1)return y.debug(`Unsupported mime type "${s.inlineData.mimeType}" rejected for on-device inference.`),!1}return!0}async downloadIfAvailable(t){let n=await this.languageModelProvider?.availability(this.onDeviceParams.createOptions);return(n===I.DOWNLOADABLE||n===I.DOWNLOADING)&&this.download(t),n}download(t){if(this.downloadPromise)return;let n={...this.onDeviceParams.createOptions};n&&!n.monitor&&t&&(n.monitor=s=>{s.addEventListener("downloadprogress",i=>{t(i.loaded)})}),this.downloadPromise=this.languageModelProvider?.create(n).finally(()=>{this.downloadPromise=null})}static async toLanguageModelMessage(t){let n=await Promise.all(t.parts.map(e.toLanguageModelMessageContent));return{role:e.toLanguageModelMessageRole(t.role),content:n}}static async toLanguageModelMessageContent(t){if("text"in t&&typeof t.text=="string")return{type:"text",value:t.text};if("inlineData"in t&&t.inlineData){let s=await(await fetch(`data:${t.inlineData.mimeType};base64,${t.inlineData.data}`)).blob();return{type:"image",value:await createImageBitmap(s)}}throw new f(d.REQUEST_ERROR,"Processing of this Part type is not currently supported.")}static toLanguageModelMessageRole(t){return t==="model"?"assistant":"user"}async createSession(){if(!this.languageModelProvider)throw new f(d.UNSUPPORTED,"Chrome AI requested for unsupported browser version.");let t=await this.languageModelProvider.create(this.onDeviceParams.createOptions);return this.oldSession&&this.oldSession.destroy(),this.oldSession=t,t}static toResponse(t){return{json:async()=>({candidates:[{content:{parts:[{text:t}]}}]})}}static toStreamResponse(t){let n=new TextEncoder;return{body:t.pipeThrough(new TransformStream({transform(s,i){let o=JSON.stringify({candidates:[{content:{role:"model",parts:[{text:s}]}}]});i.enqueue(n.encode(`data: ${o}

`))}}))}}};X.SUPPORTED_MIME_TYPES=["image/jpeg","image/png"];function fs(e,t,n){let i=(t||oe()).LanguageModel;if(i&&e)return new X(i,e,n)}var Ie=class{constructor(t,n,s,i,o){this.app=t,this.backend=n,this.chromeAdapterFactory=o;let r=i?.getImmediate({optional:!0}),a=s?.getImmediate({optional:!0});this.auth=a||null,this.appCheck=r||null}_delete(){return Promise.resolve()}set options(t){this._options=t}get options(){return this._options}};function hs(e,{instanceIdentifier:t}){if(!t)throw new f(d.ERROR,"AIService instance identifier is undefined.");let n=us(t),s=e.getProvider("app").getImmediate(),i=e.getProvider("auth-internal"),o=e.getProvider("app-check-internal");return new Ie(s,n,i,o,fs)}function ps(e){if(e.app?.options?.apiKey)if(e.app?.options?.projectId){if(!e.app?.options?.appId)throw new f(d.NO_APP_ID,'The "appId" field is empty in the local Firebase config. Firebase AI requires this field to contain a valid app ID.')}else throw new f(d.NO_PROJECT_ID,'The "projectId" field is empty in the local Firebase config. Firebase AI requires this field to contain a valid project ID.');else throw new f(d.NO_API_KEY,'The "apiKey" field is empty in the local Firebase config. Firebase AI requires this field to contain a valid API key.');let t={apiKey:e.app.options.apiKey,project:e.app.options.projectId,appId:e.app.options.appId,automaticDataCollectionEnabled:e.app.automaticDataCollectionEnabled,backend:e.backend};if(lt(e.app)&&e.app.settings.appCheckToken){let n=e.app.settings.appCheckToken;t.getAppCheckToken=()=>Promise.resolve({token:n})}else e.appCheck&&(e.options?.useLimitedUseAppCheckTokens?t.getAppCheckToken=()=>e.appCheck.getLimitedUseToken():t.getAppCheckToken=()=>e.appCheck.getToken());return e.auth&&(t.getAuthToken=()=>e.auth.getToken()),t}var Te=class e{constructor(t,n){this._apiSettings=ps(t),this.model=e.normalizeModelName(n,this._apiSettings.backend.backendType)}static normalizeModelName(t,n){return n===T.GOOGLE_AI?e.normalizeGoogleAIModelName(t):e.normalizeVertexAIModelName(t)}static normalizeGoogleAIModelName(t){return`models/${t}`}static normalizeVertexAIModelName(t){let n;return t.includes("/")?t.startsWith("models/")?n=`publishers/google/${t}`:n=t:n=`publishers/google/models/${t}`,n}};var ms="Timeout has expired.",Oe="AbortError",De=class{constructor(t){this.params=t}toString(){let t=new URL(this.baseUrl);return t.pathname=this.pathname,t.search=this.queryParams.toString(),t.toString()}get pathname(){return this.params.templateId?`${this.params.apiSettings.backend._getTemplatePath(this.params.apiSettings.project,this.params.templateId)}:${this.params.task}`:`${this.params.apiSettings.backend._getModelPath(this.params.apiSettings.project,this.params.model)}:${this.params.task}`}get baseUrl(){return this.params.singleRequestOptions?.baseUrl??`https://${os}`}get queryParams(){let t=new URLSearchParams;return this.params.stream&&t.set("alt","sse"),t}};function gs(e){let t=[];return t.push(`${rs}/${pt}`),t.push(`fire/${pt}`),(e.params.apiSettings.inferenceMode===A.PREFER_ON_DEVICE||e.params.apiSettings.inferenceMode===A.PREFER_IN_CLOUD)&&t.push(as),t.join(" ")}async function Es(e){let t=new Headers;if(t.append("Content-Type","application/json"),t.append("x-goog-api-client",gs(e)),t.append("x-goog-api-key",e.params.apiSettings.apiKey),e.params.apiSettings.automaticDataCollectionEnabled&&t.append("X-Firebase-Appid",e.params.apiSettings.appId),e.params.apiSettings.getAppCheckToken){let n=await e.params.apiSettings.getAppCheckToken();n&&(t.append("X-Firebase-AppCheck",n.token),n.error&&y.warn(`Unable to obtain a valid App Check token: ${n.error.message}`))}if(e.params.apiSettings.getAuthToken){let n=await e.params.apiSettings.getAuthToken();n&&t.append("Authorization",`Firebase ${n.accessToken}`)}return t}async function Me(e,t){let n=new De(e),s,i=e.singleRequestOptions?.signal,o=e.singleRequestOptions?.timeout!=null&&e.singleRequestOptions.timeout>=0?e.singleRequestOptions.timeout:cs,r=new AbortController,a=setTimeout(()=>{r.abort(new DOMException(ms,Oe)),y.debug(`Aborting request to ${n} due to timeout (${o}ms)`)},o),c=AbortSignal.any(i?[i,r.signal]:[r.signal]);if(i&&i.aborted)throw clearTimeout(a),new DOMException(i.reason??"Aborted externally before fetch",Oe);try{let l={method:"POST",headers:await Es(n),signal:c,body:t};if(s=await fetch(n.toString(),l),!s.ok){let h="",g;try{let E=await s.json();h=E.error.message,E.error.details&&(h+=` ${JSON.stringify(E.error.details)}`,g=E.error.details)}catch{}throw s.status===403&&g&&g.some(E=>E.reason==="SERVICE_DISABLED")&&g.some(E=>E.links?.[0]?.description.includes("Google developers console API activation"))?new f(d.API_NOT_ENABLED,`The Firebase AI SDK requires the Firebase AI API ('firebasevertexai.googleapis.com') to be enabled in your Firebase project. Enable this API by visiting the Firebase Console at https://console.firebase.google.com/project/${n.params.apiSettings.project}/ailogic/ and clicking "Get started". If you enabled this API recently, wait a few minutes for the action to propagate to our systems and then retry.`,{status:s.status,statusText:s.statusText,errorDetails:g}):new f(d.FETCH_ERROR,`Error fetching from ${n}: [${s.status} ${s.statusText}] ${h}`,{status:s.status,statusText:s.statusText,errorDetails:g})}}catch(l){let h=l;throw l.code!==d.FETCH_ERROR&&l.code!==d.API_NOT_ENABLED&&l instanceof Error&&l.name!==Oe&&(h=new f(d.ERROR,`Error fetching from ${n.toString()}: ${l.message}`),h.stack=l.stack),h}finally{clearTimeout(a)}return s}function J(e){if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&y.warn(`This response had ${e.candidates.length} candidates. Returning text from the first candidate only. Access response.candidates directly to use the other candidates.`),Ot(e.candidates[0]))throw new f(d.RESPONSE_ERROR,`Response error: ${M(e)}. Response body stored in error.response`,{response:e});return!0}else return!1}function C(e){return"type"in e&&e.type?e:e.text!==void 0?{...e,type:"text"}:e.inlineData!==void 0?{...e,type:"inlineData"}:e.functionCall!==void 0?{...e,type:"functionCall"}:e.functionResponse!==void 0?{...e,type:"functionResponse"}:e.fileData!==void 0?{...e,type:"fileData"}:e.executableCode!==void 0?{...e,type:"executableCode"}:e.codeExecutionResult!==void 0?{...e,type:"codeExecutionResult"}:e}function ee(e,t=v.IN_CLOUD){if(e.candidates?.[0]&&!e.candidates[0].hasOwnProperty("index")&&(e.candidates[0].index=0),e.candidates)for(let s of e.candidates)s.content?.parts&&(s.content.parts=s.content.parts.map(C));let n=ys(e);return n.inferenceSource=t,n}function ys(e){return e.text=()=>{if(J(e))return gt(e,t=>!("thought"in t&&t.thought));if(e.promptFeedback)throw new f(d.RESPONSE_ERROR,`Text not available. ${M(e)}`,{response:e});return""},e.thoughtSummary=()=>{if(J(e)){let t=gt(e,n=>!!("thought"in n&&n.thought));return t===""?void 0:t}else if(e.promptFeedback)throw new f(d.RESPONSE_ERROR,`Thought summary not available. ${M(e)}`,{response:e})},e.inlineDataParts=()=>{if(J(e))return bs(e);if(e.promptFeedback)throw new f(d.RESPONSE_ERROR,`Data not available. ${M(e)}`,{response:e})},e.functionCalls=()=>{if(J(e))return _t(e);if(e.promptFeedback)throw new f(d.RESPONSE_ERROR,`Function call not available. ${M(e)}`,{response:e})},e}function gt(e,t){let n=[];if(e.candidates?.[0].content?.parts)for(let s of e.candidates?.[0].content?.parts){let i=C(s);i.type==="text"&&t(i)&&n.push(i.text)}return n.length>0?n.join(""):""}function _t(e){if(!e)return;let t=[];if(e.candidates?.[0].content?.parts)for(let n of e.candidates?.[0].content?.parts){let s=C(n);s.type==="functionCall"&&t.push(s.functionCall)}if(t.length>0)return t}function bs(e){let t=[];if(e.candidates?.[0].content?.parts)for(let n of e.candidates?.[0].content?.parts){let s=C(n);s.type==="inlineData"&&t.push(s)}if(t.length>0)return t}var As=[b.RECITATION,b.SAFETY,b.BLOCKLIST,b.PROHIBITED_CONTENT,b.SPII,b.MALFORMED_FUNCTION_CALL,b.IMAGE_SAFETY,b.IMAGE_PROHIBITED_CONTENT,b.IMAGE_OTHER,b.NO_IMAGE,b.IMAGE_RECITATION,b.LANGUAGE,b.UNEXPECTED_TOOL_CALL,b.TOO_MANY_TOOL_CALLS,b.MISSING_THOUGHT_SIGNATURE,b.MALFORMED_RESPONSE];function Ot(e){return!!e.finishReason&&As.some(t=>t===e.finishReason)}function M(e){let t="";if((!e.candidates||e.candidates.length===0)&&e.promptFeedback)t+="Response was blocked",e.promptFeedback?.blockReason&&(t+=` due to ${e.promptFeedback.blockReason}`),e.promptFeedback?.blockReasonMessage&&(t+=`: ${e.promptFeedback.blockReasonMessage}`);else if(e.candidates?.[0]){let n=e.candidates[0];Ot(n)&&(t+=`Candidate was blocked due to ${n.finishReason}`,n.finishMessage&&(t+=`: ${n.finishMessage}`))}return t}function Pe(e){if(e!=null){if(typeof e=="string")return{role:"system",parts:[{type:"text",text:e}]};if(e.type==="text"||"text"in e&&typeof e.text=="string")return{role:"system",parts:[D(C(e))]};if(e.parts){let t=e.parts.map(n=>D(C(n)));return e.role?{...e,parts:t}:{role:"system",parts:t}}}}function V(e){let t=[];if(typeof e=="string")t=[{type:"text",text:e}];else for(let n of e)typeof n=="string"?t.push({type:"text",text:n}):t.push(D(C(n)));return Ss(t)}function Ss(e){let t={role:"user",parts:[]},n=!1,s=!1;for(let i of e)i.type==="functionResponse"||"functionResponse"in i?s=!0:n=!0,t.parts.push(i);if(n&&s)throw new f(d.INVALID_CONTENT,"Within a single message, FunctionResponse cannot be mixed with other type of Part in the request for sending chat message.");if(!n&&!s)throw new f(d.INVALID_CONTENT,"No Content is provided for sending chat message.");return t}function we(e){let t;if(e.contents){let n=e;t={...n,contents:n.contents.map(s=>({...s,parts:s.parts?s.parts.map(C):[]}))}}else t={contents:[V(e)]};return e.systemInstruction&&(t.systemInstruction=Pe(e.systemInstruction)),t}function Cs(e){return e.parts&&Array.isArray(e.parts)?{...e,parts:e.parts.map(xe)}:e}function xe(e){let t;if("type"in e){let{type:n,...s}=e;t=s}else t=e;return t.functionResponse&&(t={...t,functionResponse:Cs(t.functionResponse)}),t}function ke(e){return e.parts?{...e,parts:e.parts.map(xe)}:e}function wt(e){return e==null||typeof e=="string"?e:"parts"in e&&Array.isArray(e.parts)?ke(e):xe(e)}function Rt(e){let t={...e};return t.contents&&(t.contents=t.contents.map(ke)),t.systemInstruction&&(t.systemInstruction=wt(t.systemInstruction)),t}function _s(e){let t={...e};return t.contents&&(t.contents=t.contents.map(ke)),t.systemInstruction&&(t.systemInstruction=wt(t.systemInstruction)),t}function It(e){if(e.safetySettings?.forEach(t=>{if(t.method)throw new f(d.UNSUPPORTED,"SafetySetting.method is not supported in the the Gemini Developer API. Please remove this property.")}),e.generationConfig?.topK){let t=Math.round(e.generationConfig.topK);t!==e.generationConfig.topK&&(y.warn("topK in GenerationConfig has been rounded to the nearest integer to match the format for requests to the Gemini Developer API."),e.generationConfig.topK=t)}return e}function Fe(e){return{candidates:e.candidates?ws(e.candidates):void 0,promptFeedback:e.promptFeedback?Rs(e.promptFeedback):void 0,usageMetadata:e.usageMetadata}}function Os(e,t){return{generateContentRequest:{model:t,...e}}}function ws(e){let t=[],n;return t&&e.forEach(s=>{let i;if(s.citationMetadata&&(i={citations:s.citationMetadata.citationSources}),s.safetyRatings&&(n=s.safetyRatings.map(r=>({...r,severity:r.severity??St.HARM_SEVERITY_UNSUPPORTED,probabilityScore:r.probabilityScore??0,severityScore:r.severityScore??0}))),s.content?.parts?.some(r=>"videoMetadata"in r&&r.videoMetadata))throw new f(d.UNSUPPORTED,"Part.videoMetadata is not supported in the Gemini Developer API. Please remove this property.");let o={index:s.index,content:s.content,finishReason:s.finishReason,finishMessage:s.finishMessage,safetyRatings:n,citationMetadata:i,groundingMetadata:s.groundingMetadata,urlContextMetadata:s.urlContextMetadata};t.push(o)}),t}function Rs(e){let t=[];return(e.safetyRatings??[]).forEach(s=>{t.push({category:s.category,probability:s.probability,severity:s.severity??St.HARM_SEVERITY_UNSUPPORTED,probabilityScore:s.probabilityScore??0,severityScore:s.severityScore??0,blocked:s.blocked})}),{blockReason:e.blockReason,safetyRatings:t,blockReasonMessage:e.blockReasonMessage}}var Et=/^data\: (.*)(?:\n\n|\r\r|\r\n\r\n)/;async function Is(e,t,n){let s=e.body.pipeThrough(new TextDecoderStream("utf8",{fatal:!0})),i=vs(s),[o,r]=i.tee(),{response:a,firstValue:c}=await Ts(r,t,n);return{stream:Ns(o,t,n),response:a,firstValue:c}}async function Ts(e,t,n){let[s,i]=e.tee(),o=s.getReader(),{value:r}=await o.read();return{firstValue:r,response:Ds(i,t,n)}}async function Ds(e,t,n){let s=[],i=e.getReader();for(;;){let{done:o,value:r}=await i.read();if(o){let a=Ls(s);return t.backend.backendType===T.GOOGLE_AI&&(a=Fe(a)),ee(a,n)}s.push(r)}}async function*Ns(e,t,n){let s=e.getReader();for(;;){let{value:i,done:o}=await s.read();if(o)break;let r;t.backend.backendType===T.GOOGLE_AI?r=ee(Fe(i),n):r=ee(i,n);let a=r.candidates?.[0];!a?.content?.parts&&!a?.finishReason&&!a?.citationMetadata&&!a?.urlContextMetadata||(yield r)}}function vs(e){let t=e.getReader();return new ReadableStream({start(s){let i="";return o();function o(){return t.read().then(({value:r,done:a})=>{if(a){if(i.trim()){s.error(new f(d.PARSE_FAILED,"Failed to parse stream"));return}s.close();return}i+=r;let c=i.match(Et),l;for(;c;){try{l=JSON.parse(c[1])}catch{s.error(new f(d.PARSE_FAILED,`Error parsing JSON response: "${c[1]}`));return}s.enqueue(l),i=i.substring(c[0].length),c=i.match(Et)}return o()})}}})}function Ls(e){let n={promptFeedback:e[e.length-1]?.promptFeedback};for(let s of e)if(s.candidates)for(let i of s.candidates){let o=i.index||0;n.candidates||(n.candidates=[]),n.candidates[o]||(n.candidates[o]={index:i.index}),n.candidates[o].citationMetadata=i.citationMetadata,n.candidates[o].finishReason=i.finishReason,n.candidates[o].finishMessage=i.finishMessage,n.candidates[o].safetyRatings=i.safetyRatings,n.candidates[o].groundingMetadata=i.groundingMetadata;let r=i.urlContextMetadata;if(typeof r=="object"&&r!==null&&Object.keys(r).length>0&&(n.candidates[o].urlContextMetadata=r),i.content){if(!i.content.parts)continue;n.candidates[o].content||(n.candidates[o].content={role:i.content.role||"user",parts:[]});for(let a of i.content.parts){if("text"in a&&a.text==="")continue;if(Object.keys(a).length===0)throw new f(d.INVALID_CONTENT,"Part should have at least one property, but there are none. This is likely caused by a malformed response from the backend.");let c=C({...a});Object.keys(c).length>0&&n.candidates[o].content.parts.push(c)}}}return n}var Ms=[d.FETCH_ERROR,d.ERROR,d.API_NOT_ENABLED];async function Tt(e,t,n,s){if(!t)return{response:await s(),inferenceSource:v.IN_CLOUD};switch(t.mode){case A.ONLY_ON_DEVICE:if(await t.isAvailable(e))return{response:await n(),inferenceSource:v.ON_DEVICE};throw new f(d.UNSUPPORTED,"Inference mode is ONLY_ON_DEVICE, but an on-device model is not available.");case A.ONLY_IN_CLOUD:return{response:await s(),inferenceSource:v.IN_CLOUD};case A.PREFER_IN_CLOUD:try{return{response:await s(),inferenceSource:v.IN_CLOUD}}catch(i){if(i instanceof f&&Ms.includes(i.code)&&await t.isAvailable(e))return{response:await n(),inferenceSource:v.ON_DEVICE};throw i}case A.PREFER_ON_DEVICE:return await t.isAvailable(e)?{response:await n(),inferenceSource:v.ON_DEVICE}:{response:await s(),inferenceSource:v.IN_CLOUD};default:throw new f(d.ERROR,`Unexpected infererence mode: ${t.mode}`)}}async function Ps(e,t,n,s){return n=Rt(n),e.backend.backendType===T.GOOGLE_AI&&(n=It(n)),Me({task:"streamGenerateContent",model:t,apiSettings:e,stream:!0,singleRequestOptions:s},JSON.stringify(n))}async function Dt(e,t,n,s,i){let o=await Tt(n,s,()=>s.generateContentStream(n),()=>Ps(e,t,n,i));return Is(o.response,e,o.inferenceSource)}async function xs(e,t,n,s){return n=Rt(n),e.backend.backendType===T.GOOGLE_AI&&(n=It(n)),Me({model:t,task:"generateContent",apiSettings:e,stream:!1,singleRequestOptions:s},JSON.stringify(n))}async function Nt(e,t,n,s,i){let o=await Tt(n,s,()=>s.generateContent(n),()=>xs(e,t,n,i)),r=await ks(o.response,e);return{response:ee(r,o.inferenceSource)}}async function ks(e,t){let n=await e.json();return t.backend.backendType===T.GOOGLE_AI?Fe(n):n}var yt="SILENT_ERROR",bt=10,Ne=class{constructor(t,n,s){this.params=n,this.requestOptions=s,this._history=[],this._sendPromise=Promise.resolve(),this._apiSettings=t}async getHistory(){return await this._sendPromise,D(this._history).map(t=>({...t,parts:t.parts?t.parts.map(C):[]}))}async _sendMessage(t,n){let s={};await this._sendPromise;let i=[];return this._sendPromise=this._sendPromise.then(async()=>{let o,r=0,a=this.requestOptions?.maxSequentialFunctionCalls??bt;do{let c;if(o){r++;let g=await this._callFunctionsAsNeeded(o);c=V(g)}else c=V(t);let l=this._formatRequest(c,[...i]);i.push(c);let h=await this._callGenerateContent(l,n);if(h)if(s=h,o=this._getCallableFunctionCalls(h.response),h.response.candidates&&h.response.candidates.length>0){let g={parts:h.response.candidates?.[0].content.parts||[],role:h.response.candidates?.[0].content.role||"model"};i.push(D(g))}else{let g=M(h.response);g&&y.warn(`sendMessage() was unsuccessful. ${g}. Inspect response object for details.`)}else o=void 0}while(o&&r<a);o&&r>=a&&y.warn(`Automatic function calling exceeded the limit of ${a} function calls. Returning last model response.`)}),await this._sendPromise,this._history=this._history.concat(i),s}async _sendMessageStream(t,n){await this._sendPromise;let s=[],o=(async()=>{let r,a=0,c=this.requestOptions?.maxSequentialFunctionCalls??bt,l;do{let h;if(r){a++;let E=await this._callFunctionsAsNeeded(r);h=V(E)}else h=V(t);let g=this._formatRequest(h,[...s]);if(s.push(h),l=await this._callGenerateContentStream(g,n),r=this._getCallableFunctionCalls(l.firstValue),r&&l.firstValue&&l.firstValue.candidates&&l.firstValue.candidates.length>0){let E={...l.firstValue.candidates[0].content};E.role||(E.role="model"),s.push(E)}}while(r&&a<c);return r&&a>=c&&y.warn(`Automatic function calling exceeded the limit of ${c} function calls. Returning last model response.`),{stream:l.stream,response:l.response}})();return this._sendPromise=this._sendPromise.then(async()=>o).catch(r=>{throw new Error(yt)}).then(r=>r.response).then(r=>{if(r.candidates&&r.candidates.length>0){this._history=this._history.concat(s);let a={...r.candidates[0].content};a.role||(a.role="model"),this._history.push(D(a))}else{let a=M(r);a&&y.warn(`sendMessageStream() was unsuccessful. ${a}. Inspect response object for details.`)}}).catch(r=>{r.message!==yt&&r.name!=="AbortError"&&y.error(r)}),o}_getCallableFunctionCalls(t){let n=this.params?.tools?.find(i=>i.functionDeclarations);if(!n?.functionDeclarations)return;let s=_t(t);if(s){for(let i of s)if(!n.functionDeclarations?.some(r=>r.name===i.name&&typeof r.functionReference=="function"))return;return s}}async _callFunctionsAsNeeded(t){let n=[],s=[],i=this.params?.tools?.find(o=>o.functionDeclarations);if(i&&i.functionDeclarations){for(let r of t){let a=i.functionDeclarations.find(c=>c.name===r.name);if(a?.functionReference){let c=Promise.resolve(a.functionReference(r.args)).catch(l=>{let h=new f(d.ERROR,`Error in user-defined function "${a.name}": ${l.message}`);throw h.stack=l.stack,h});n.push({name:r.name,id:r.id,results:c}),s.push(c)}}await Promise.all(s);let o=[];for(let{name:r,id:a,results:c}of n){let l={name:r,response:await c};a&&(l.id=a),o.push({type:"functionResponse",functionResponse:l})}return o}else throw new f(d.REQUEST_ERROR,'No function declarations were provided in "tools".')}};var Fs=["text","inlineData","functionCall","functionResponse","thought","thoughtSignature"],Us={user:["text","inlineData","functionResponse"],function:["functionResponse"],model:["text","functionCall","thought","thoughtSignature"],system:["text"]},At={user:["model"],function:["model"],model:["user","function"],system:[]};function Bs(e){let t=null;for(let n of e){let{role:s,parts:i}=n;if(!t&&s!=="user")throw new f(d.INVALID_CONTENT,`First Content should be with role 'user', got ${s}`);if(!mt.includes(s))throw new f(d.INVALID_CONTENT,`Each item should include role field. Got ${s} but valid roles are: ${JSON.stringify(mt)}`);if(!Array.isArray(i))throw new f(d.INVALID_CONTENT,"Content should have 'parts' property with an array of Parts");if(i.length===0)throw new f(d.INVALID_CONTENT,"Each Content should have at least one part");let o={text:0,inlineData:0,functionCall:0,functionResponse:0,thought:0,thoughtSignature:0,fileData:0,executableCode:0,codeExecutionResult:0};for(let a of i){if(a.type)o[a.type]+=1;else for(let c of["text","inlineData","functionCall","functionResponse","fileData","executableCode","codeExecutionResult"])c in a&&(o[c]+=1);"thought"in a&&a.thought&&(o.thought+=1),"thoughtSignature"in a&&a.thoughtSignature&&(o.thoughtSignature+=1)}let r=Us[s];for(let a of Fs)if(!r.includes(a)&&o[a]>0)throw new f(d.INVALID_CONTENT,`Content with role '${s}' can't contain '${a}' part`);if(t&&!At[s].includes(t.role))throw new f(d.INVALID_CONTENT,`Content with role '${s}' can't follow '${t.role}'. Valid previous roles: ${JSON.stringify(At)}`);t=n}}var ve=class extends Ne{constructor(t,n,s,i,o){super(t,i,o),this.model=n,this.chromeAdapter=s,this.params=i,this.requestOptions=o,i?.history&&(Bs(i.history),this._history=D(i.history)),this.params?.systemInstruction!=null&&(this.params={...this.params,systemInstruction:Pe(this.params.systemInstruction)})}_formatRequest(t,n){return{safetySettings:this.params?.safetySettings,generationConfig:this.params?.generationConfig,tools:this.params?.tools,toolConfig:this.params?.toolConfig,systemInstruction:this.params?.systemInstruction,contents:[...this._history,...n,t]}}_callGenerateContent(t,n){return Nt(this._apiSettings,this.model,t,this.chromeAdapter,{...this.requestOptions,...n})}_callGenerateContentStream(t,n){return Dt(this._apiSettings,this.model,t,this.chromeAdapter,{...this.requestOptions,...n})}async sendMessage(t,n){return this._sendMessage(t,n)}async sendMessageStream(t,n){return this._sendMessageStream(t,n)}};async function $s(e,t,n,s){n=_s(n);let i="";if(e.backend.backendType===T.GOOGLE_AI){let r=Os(n,t);i=JSON.stringify(r)}else i=JSON.stringify(n);return(await Me({model:t,task:"countTokens",apiSettings:e,stream:!1,singleRequestOptions:s},i)).json()}async function Hs(e,t,n,s,i){if(s?.mode===A.ONLY_ON_DEVICE)throw new f(d.UNSUPPORTED,"countTokens() is not supported for on-device models.");return $s(e,t,n,i)}var Le=class extends Te{constructor(t,n,s,i){super(t,n.model),this.chromeAdapter=i,this.generationConfig=n.generationConfig||{},Gs(this.generationConfig),this.safetySettings=n.safetySettings||[],this.tools=n.tools,this.toolConfig=n.toolConfig,this.systemInstruction=Pe(n.systemInstruction),this.requestOptions=s||{}}async initializeDeviceModel(t){if(!this.chromeAdapter||this.chromeAdapter.mode===A.ONLY_IN_CLOUD)return;if(await this.chromeAdapter.downloadIfAvailable(t)===I.UNAVAILABLE){let s=new f(d.API_NOT_ENABLED,"Local LanguageModel API not available in this environment.");if(this.chromeAdapter.mode===A.ONLY_ON_DEVICE)throw s;y.debug(s.message)}await this.chromeAdapter.downloadPromise}async generateContent(t,n){let s=we(t);return Nt(this._apiSettings,this.model,{generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,...s},this.chromeAdapter,{...this.requestOptions,...n})}async generateContentStream(t,n){let s=we(t),{stream:i,response:o}=await Dt(this._apiSettings,this.model,{generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,...s},this.chromeAdapter,{...this.requestOptions,...n});return{stream:i,response:o}}startChat(t){return new ve(this._apiSettings,this.model,this.chromeAdapter,{tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,generationConfig:this.generationConfig,safetySettings:this.safetySettings,...t},this.requestOptions)}async countTokens(t,n){let s=we(t);return Hs(this._apiSettings,this.model,s,this.chromeAdapter,{...this.requestOptions,...n})}};function Gs(e){if(e.thinkingConfig?.thinkingBudget!=null&&e.thinkingConfig?.thinkingLevel)throw new f(d.UNSUPPORTED,"Cannot set both thinkingBudget and thinkingLevel in a config.");if(e.responseSchema!=null&&e.responseJsonSchema!=null)throw new f(d.UNSUPPORTED,"Cannot set both responseSchema and responseJsonSchema in a config.");if((e.responseSchema!=null||e.responseJsonSchema!=null)&&e.responseMimeType!=="application/json"&&e.responseMimeType!=="text/x.enum")throw new f(d.UNSUPPORTED,'responseMimeType must be set to "application/json" or "text/x.enum" if responseSchema or responseJsonSchema are set.')}var Vs="audio-processor",xi=`
  class AudioProcessor extends AudioWorkletProcessor {
    constructor(options) {
      super();
      this.targetSampleRate = options.processorOptions.targetSampleRate;
      // 'sampleRate' is a global variable available inside the AudioWorkletGlobalScope,
      // representing the native sample rate of the AudioContext.
      this.inputSampleRate = sampleRate;
    }

    /**
     * This method is called by the browser's audio engine for each block of audio data.
     * Input is a single input, with a single channel (input[0][0]).
     */
    process(inputs) {
      const input = inputs[0];
      if (input && input.length > 0 && input[0].length > 0) {
        const pcmData = input[0]; // Float32Array of raw audio samples.
        
        // Simple linear interpolation for resampling.
        const resampled = new Float32Array(Math.round(pcmData.length * this.targetSampleRate / this.inputSampleRate));
        const ratio = pcmData.length / resampled.length;
        for (let i = 0; i < resampled.length; i++) {
          resampled[i] = pcmData[Math.floor(i * ratio)];
        }

        // Convert Float32 (-1, 1) samples to Int16 (-32768, 32767)
        const resampledInt16 = new Int16Array(resampled.length);
        for (let i = 0; i < resampled.length; i++) {
          const sample = Math.max(-1, Math.min(1, resampled[i]));
          if (sample < 0) {
            resampledInt16[i] = sample * 32768;
          } else {
            resampledInt16[i] = sample * 32767;
          }
        }
        
        this.port.postMessage(resampledInt16);
      }
      // Return true to keep the processor alive and processing the next audio block.
      return true;
    }
  }

  // Register the processor with a name that can be used to instantiate it from the main thread.
  registerProcessor('${Vs}', AudioProcessor);
`;function vt(e=dt(),t){e=Je(e);let n=ct(e,F),s=t?.backend??new P,i=ds(s),o=n.getImmediate({identifier:i}),r=o.options;if(r){let a=t?.useLimitedUseAppCheckTokens,c=!!r.useLimitedUseAppCheckTokens;if(a!=null&&!!a!==c)throw new f(d.ALREADY_INITIALIZED,`getAI() has already been called for app "${e.name}" and this backend with useLimitedUseAppCheckTokens: ${c}. This option cannot be changed after the AI instance has been initialized. Pass the desired options to the first getAI() call for this app and backend, or omit useLimitedUseAppCheckTokens to reuse the existing instance.`);return o}return o.options={useLimitedUseAppCheckTokens:t?.useLimitedUseAppCheckTokens??!1},o}var zs=["mode","onDeviceParams","inCloudParams"];function Lt(e,t,n){let s=t,i;if(s.mode){for(let a of Object.keys(t))zs.includes(a)||y.warn(`When a hybrid inference mode is specified (mode is currently set to ${s.mode}), "${a}" cannot be configured at the top level. Configuration for in-cloud and on-device must be done separately in inCloudParams and onDeviceParams. Configuration values set outside of inCloudParams and onDeviceParams will be ignored.`);i=s.inCloudParams||{model:ls}}else i=t;if(!i.model)throw new f(d.NO_MODEL,"Must provide a model name. Example: getGenerativeModel({ model: 'my-model-name' })");let o=e.chromeAdapterFactory?.(s.mode,typeof window>"u"?void 0:window,s.onDeviceParams),r=new Le(e,i,n,o);return r._apiSettings.inferenceMode=s.mode,r}function js(){H(new O(F,hs,"PUBLIC").setMultipleInstances(!0)),N(ht,Re),N(ht,Re,"esm2020")}js();var x=e=>e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),u={NAME:"NAME",DOCTOR:"DOCTOR",FACILITY:"FACILITY",ADDRESS:"ADDRESS",ID:"ID",CONTACT:"CONTACT",DOB:"DOB"},Ws=[{type:u.CONTACT,re:/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g},{type:u.CONTACT,re:/(?:\+91[\s-]?|\b0)?[6-9]\d{4}[\s-]?\d{5}\b/g},{type:u.ID,re:/\b\d{4}[\s-]\d{4}[\s-]\d{4}\b/g},{type:u.ID,re:/\b[A-Z]{5}\d{4}[A-Z]\b/g},{type:u.ID,re:/\b\d{4}(?:[ -]\d{4}){3}\b/g},{type:u.ID,re:/\b[A-Z]{1,3}\d{7}\b/g},{type:u.ID,re:/\b[A-Z]{2,5}[-\/]\d{4,}\b/g},{type:u.ID,re:/\b[A-Z]{2,6}[-\/]\d{2,4}[-\/]\d{3,}\b/g},{type:u.ID,re:/\b\d{9,}\b/g},{type:u.CONTACT,re:/\b0\d{2,4}[ -]\d{3,4}[ -]?\d{4}\b/g}],te=/\b(?:adults?|child(?:ren)?|infants?|newborns?|males?|females?|men|women|boys?|girls?|normal|above|below|over|under|up ?to|between|age|sex|range|count|total|serum|plasma|blood|urine|vitamin|free|test|result|value|high|low|risk|sample|specimen|method|machine|analy[sz]er|hand|phone|email|courier|lab|hospital|home|self|doctor|technician|pathologist|consultant)\b/i,Mt=/\b(?:profile|function|panel|tests?|liver|kidney|thyroid|lipid|complete|blood|urine|iron|diabetes|vitamin|culture|hormone|cardiac|fever|serum|count|doctor|patient|lab|hospital|clinic|department)\b/i,Zs=[{type:u.NAME,re:/\b(?:Patient(?:'s)?\s*Name|Name\s*of\s*Patient|Pt\.?\s*Name|Name)\s*[:\-]\s*([^\n\r]+?)(?=\s{2,}|\t|[ \t]*[|;]|,[ \t]*[A-Z][A-Za-z .]*:|\s+(?:Age|Sex|Gender|DOB|UHID|MRN)\b|$)/gim},{type:u.DOCTOR,re:/\b(?:Ref(?:erred|erring)?\.?\s*(?:By|Doctor|Dr\.?)|Consultant|Doctor|Physician|Pathologist)\s*[:\-]\s*([^\n\r]+?)(?=\s{2,}|\t|[ \t]*[|;]|$)/gim},{type:u.DOCTOR,re:/\bDr\.? ?[A-Z][a-zA-Z.]*(?: [A-Z][a-zA-Z.]+){0,2}/g,whole:!0},{type:u.DOCTOR,re:/\bDR(?:\. ?| )[A-Z][A-Z.]*(?: [A-Z][A-Z.]*){0,3}\b/g,whole:!0},{type:u.ID,re:/\b(?:UHID|MRN|MR\s*No|Patient\s*ID|Reg(?:istration)?\.?\s*No|Lab\s*(?:No|ID)|Sample\s*(?:No|ID)|Bill\s*No|Accession\s*No|Barcode|IP\s*No|OP\s*No)\.?\s*[:#\-]?\s*([A-Z0-9][A-Z0-9\/\-]{3,})/gi},{type:u.DOB,re:/\b(?:DOB|D\.O\.B\.?|Date\s*of\s*Birth)\s*[:\-]?\s*(\d{1,2}[\/\-.\s](?:\d{1,2}|[A-Za-z]{3,9})[\/\-.\s]\d{2,4})/gi},{type:u.ADDRESS,re:/\b(?:Address|Addr)[ \t]*[:\-][ \t]*([^\n\r]+)/gi},{type:u.ADDRESS,re:/\b(?:City|Town|Locality|Area|Village|Taluk|District|Dist|Landmark|Location|Loc|Place)[ \t]*:[ \t]*([A-Za-z][A-Za-z .'-]{1,40}?)[ \t]*(?=\s{2,}|[A-Z]{3,}[ \t]*:|$)/gim},{type:u.ADDRESS,re:/^[ \t]*([^\n:]{0,60}\b(?:Road|Rd|Street|Circle|Cross|Layout|Nagar|Lane|Marg|Colony|Sector|Phase|Stage|Extension|Apartments?|Residency|Society)\b[^\n]{0,80}?)[ \t,]*$/gim},{type:u.ADDRESS,re:/^[ \t]*([A-Z][A-Za-z]{2,}[ \t]*-[ \t]*\d{2,6})\b/gm},{type:u.CONTACT,re:/\b(?:Ph|Phone|Tel|Telephone|Mob|Mobile|Contact|Cell)\.?\s*(?:No\.?)?\s*[:\-]?\s*(\+?\d[\d\s\-]{6,16}\d)/gi},{type:u.FACILITY,skip:/\b(?:processed|sample|slip|report|patient|collected|verified|tested)\b/i,re:/^[ \t]*([A-Za-z][A-Za-z.&' -]{2,60}\b(?:Diagnostics?|Laborator(?:y|ies)|Labs?|Hospitals?|Clinic|Polyclinic|Centre|Center|Pathology|Healthcare|Medical|Imaging|Scans?|Nursing Home)\b[A-Za-z.&' -]{0,40}?)[ \t]*(?=\s{2,}|,|$)/gim},{type:u.ADDRESS,skip:/\b(?:count|platelets?|wbc|rbc|total|absolute)\b/i,re:/^[ \t]*([A-Za-z0-9][^\n\r:]{4,80}?\b[1-9]\d{2}\s?\d{3})\b(?![ \t]*(?:\/|cells|cumm|per\b|IU|U\/|mg|ng|pg|copies|x ?10|<|\d))/gm},{type:u.NAME,re:/\b(?:Patient|Customer|Client|Insured|Beneficiary|Member|Booked\s*for|Report\s*for|Father|Mother|Husband|Wife|Spouse|Son|Daughter|Guardian|Attendant|Nominee|Emergency\s*Contact)(?:'s)?(?:[ \t]*Name)?[ \t]*[:\-][ \t]*([A-Za-z][A-Za-z.' -]{1,48}?)(?=\s{2,}|\t|[ \t]*[|;,(\/\d]|\s+(?:Age|Sex|Gender|DOB|UHID|MRN)\b|$)/gim},{type:u.NAME,re:/\b[SDWC][ \t]?\/[ \t]?o\.?[ \t]*[:\-]?[ \t]*([A-Za-z][A-Za-z.' -]{1,48}?)(?=\s{2,}|\t|[ \t]*[|;,(\/\d]|$)/gim},{type:u.NAME,re:/^[ \t]*(?:Patient(?:'s)?[ \t]*Name|Pt\.?[ \t]*Name|Name)[ \t]*[:\-]?[ \t]*\r?\n[ \t]*([A-Za-z][A-Za-z.' ]{2,48})[ \t]*$/gim},{type:u.DOCTOR,re:/^[ \t]*(?:Ref\.?[ \t]*(?:By|Dr)?\.?|Dr\.?|Doctor|Consultant)[ \t]*[:\-]?[ \t]*\r?\n[ \t]*([A-Za-z][A-Za-z.' ]{2,48})[ \t]*$/gim},{type:u.NAME,re:/\b(?:Mr|Mrs|Ms|Miss|Shri|Smt|Sri|Kumari|MR|MRS|SMT|SHRI)(?:\. ?| )[A-Z][A-Za-z.']*(?: [A-Z][A-Za-z.']*){0,3}/g,whole:!0},{type:u.NAME,re:/\b(?:Dear|Hello|Hey|Hi|Namaste|Regards|Thanks),? +(?!(?:Sir|Madam|Patient|Customer|Doctor|Team|All|Valued|User|Member|Client)\b)([A-Z][a-z]+(?:[ -][A-Z][a-z]+){0,2})/g},{type:u.NAME,re:/\b(?:[Mm]y|[Hh]is|[Hh]er|[Pp]atient|,)\s+name(?:\s+is)?\s+([A-Z][a-z]+(?: [A-Z][a-z]+){0,3})/g},{type:u.NAME,re:/^[ \t]*Forwarded(?: from)?:[ \t]*([A-Z][a-z]+(?: [A-Z][a-z]+){0,3})/gm},{type:u.NAME,skip:te,re:/\b(?:husband|wife|spouse|son|daughter|mother|father|brother|sister|uncle|aunt|attendant|caretaker|nurse|technician|phlebotomist)(?: is)?,? ([A-Z][a-z]{2,}(?: [A-Z][a-z]+)?)/g},{type:u.NAME,skip:Mt,re:/\b(?:[Rr]eports?|[Rr]esults?|[Dd]elivered|[Hh]anded|[Ii]nformed)(?: over)? (?:for|of|to) ([A-Z][a-z]+ [A-Z][a-z]+(?:-[A-Z][a-z]+)?)/g},{type:u.NAME,skip:te,re:/^[ \t]*([A-Z][A-Za-z.']+(?: [A-Z][A-Za-z.']*){0,3})[ \t]*[,\/]?\s*\d{1,3}[ \t]*(?:(?:[Yy]rs?|YRS?|[Yy]ears?|YEARS?)\b|[\/,]?[ \t]*(?:M|F|Male|Female|male|female|MALE|FEMALE)(?![A-Za-z\/]))/gm},{type:u.NAME,re:/(?:नाम|नांव|పేరు|பெயர்|ಹೆಸರು|പേര്|নাম|નામ)[ \t]*[:\-][ \t]*([^\n\r\d,]{2,48}?)(?=\s{2,}|\t|[,\d]|$)/gm},{type:u.DOCTOR,skip:te,re:/\b(?:Verified|Checked|Reported|Collected|Authori[sz]ed|Approved|Prepared|Entered|Signed|Validated|Reviewed|Reporting)[ \t]+by[ \t]*[:\-]?[ \t]*([A-Za-z][A-Za-z.' -]{2,40}?)(?=\s{2,}|\t|[ \t]*[|;,(\/\d]|$)/gim},{type:u.DOCTOR,skip:te,re:/\b(?:Phlebotomist|Technician|Technologist|Nurse|Microbiologist|Biochemist|Radiologist|Surgeon)[ \t]*[:\-][ \t]*([A-Za-z][A-Za-z.' -]{2,40}?)(?=\s{2,}|\t|[ \t]*[|;,(\/\d]|$)/gim},{type:u.ID,re:/\b(?:Booking|Order|Employee|Emp|Policy|Card|Member(?:ship)?|Claim|Passport|Aadhaa?r|ABHA|Voter|Invoice|Receipt|Visit|Episode|Case|File|Customer|Client|Request|Requisition|Specimen|Token|Reference)[ \t]*(?:ID|No|Number|Code|Card)?\.?[ \t]*(?:ID|No|Number)?\.?[ \t]*[:#][ \t]*([A-Z0-9][A-Z0-9\/\-]{3,24})/gi},{type:u.ID,re:/\bRef\.?[ \t]*(?:No\.?)?[ \t]*[:#]?[ \t]*([A-Z]{1,5}[\/-][A-Z0-9\/-]{3,20})/gi},{type:u.FACILITY,re:/\b(?:Employer|Company|Corporate|TPA|Insurer|Insurance|Hospital|Laboratory|Clinic|Branch|Collection[ \t]*Cent(?:re|er))[ \t]*(?:Name)?[ \t]*:[ \t]*([A-Za-z][A-Za-z.&' -]{2,50}?)(?=\s{2,}|\t|[,(\d]|$)/gim},{type:u.FACILITY,skip:/patient|slip/i,re:/\b(?!(?:MD|DM|MS|MBBS|DNB|DCP|Consultant|Senior|Chief|Clinical|Department|Your|The|This|Our|All|Please|At|In|From)\b)([A-Z][A-Za-z&.']+(?: (?:[A-Z][A-Za-z&.']+|&)){0,3} (?:Diagnostics?|Laborator(?:y|ies)|Labs?|Hospitals?|Clinic|Polyclinic|Nursing Home|Healthcare)(?: (?:Centre|Center|Services|Pvt|Ltd))*)\b/g},{type:u.FACILITY,re:/^[ \t]*([^\n\d:]{0,30}(?:पैथोलॉजी|अस्पताल|हॉस्पिटल|क्लिनिक|डायग्नोस्टिक|लैब)[^\n\d:]{0,30}?)[ \t]*$/gm},{type:u.ADDRESS,re:/\b(?:Diagnostics?|Laborator(?:y|ies)|Labs?|Hospitals?|Clinic|Polyclinic|Cent(?:re|er)|Pathology|Institute),[ \t]*([A-Z0-9][A-Za-z0-9 .,'\/-]{3,80}?)[ \t]*$/gm},{type:u.ADDRESS,re:/\b(?:Flat|Plot|House|H\.? ?No|D\.? ?No|Door ?No|Apt|Shop)\.?[ \t]*(?:No\.?)?[ \t]*[:\-]?[ \t]*\d[^\n\r]{4,80}/gi,whole:!0},{type:u.ADDRESS,re:/\b(?:Near|Opp\.?|Opposite|Behind|Beside)[ \t]+([A-Z][A-Za-z.']+(?: [A-Z][A-Za-z.']+){0,3})/g},{type:u.ADDRESS,re:/(?:\b\d[\dA-Za-z\/-]{0,6},? )?\b[A-Z][A-Za-z]*(?: [A-Z][A-Za-z]*){0,2} (?:Nagar|Road|Street|Colony|Layout|Marg|Enclave|Vihar|Puram|Chowk|Bazaar|Bazar|Circus|Salai|Heights|Residency|Apartments?|Society)\b(?:, [A-Z][a-z]+(?: [A-Z][a-z]+)?){0,3}/g,whole:!0},{type:u.ADDRESS,re:/\b(?:Sector|Phase|Block|Ward)[ -]\d{1,3}[A-Z]?(?:, [A-Z][a-z]+(?: [A-Z][a-z]+)?)+/g,whole:!0},{type:u.ADDRESS,skip:Mt,re:/(?:Diagnostics?|DIAGNOSTICS?|Lab(?:orator(?:y|ies)|s)?|LAB(?:ORATOR(?:Y|IES)|S)?|Hospitals?|HOSPITALS?|Clinic|CLINIC|Polyclinic|Cent(?:re|er)|CENT(?:RE|ER)|Pathology|PATHOLOGY)[ \t]*\r?\n[ \t]*([A-Z0-9][A-Za-z0-9 .'\/-]{2,40},[ \t]*[A-Z][A-Za-z .,'-]{2,60})[ \t]*$/gm}],Ue=/^(covid-?\s?19|na|n\/a|nil|none|nan|op|ip|electrolytes|biochemistry|haematology|hematology|lipid profile|lipid|profile|kidney|liver|thyroid|function|tests?|panel|routine|examination|serology|immunology|diabetes|complete|count|differential|hormones?|vitamins?|minerals|enzymes|cardiac|iron studies|urine|stool|summary|investigation|department|specimen|method|technology|units?|value|interval|name|names|patient|address|addr|ref|ref\.? by|self|doctor|dr|consultant|landmark|locality|city|state|area|age|sex|gender|sample|barcode|date|report|male|female|m|f|years?|yrs?|normal|high|low|positive|negative|fasting|serum|plasma|blood|urine|report|test|result|hemoglobin|haemoglobin|glucose|cholesterol|platelets?|wbc|rbc|tsh|hba1c|creatinine|vitamin\s*\w+)$/i;function xt(e){let t=[];for(let{type:n,re:s}of Ws)for(let i of e.matchAll(s))t.push({text:i[0].trim(),type:n,source:"pattern"});for(let{type:n,re:s,whole:i,skip:o}of Zs)for(let r of e.matchAll(s)){let a=(i?r[0]:r[1]||"").trim().replace(/[,;.]+$/,"");o?.test(a)||n===u.ADDRESS&&/\d\s*(?:mg(?!\s+(?:road|marg|rd))|g\/dl|u\/l|iu|meq|mmol|ng|pg|µ|%|cells|lakh|\/cumm|fl\b)/i.test(a)||a&&t.push({text:a,type:n,source:"pattern"})}return kt(t,e)}function Ys(e,t){let n=String(e).trim();return/[\n\r]/.test(n)&&(n=n.split(/[\n\r]/)[0].trim()),n=n.replace(/^[A-Za-z][A-Za-z .'\/]{1,28}:\s+/,""),n=n.replace(/^(?:reported|referred|ref\.?|signed|verified|checked|authori[sz]ed)\s+by\s*:?\s*/i,""),(t==="DOCTOR"||t==="NAME")&&(n=n.replace(/,\s*(?:MD|MBBS|DM|MS|DNB|MCh|FRCP|PhD)\b.*$/i,"")),n.replace(/[,;:.]+$/,"").trim()}var Pt=/\b(?:reports?|reported|was|were|is|are|has|have|had|kindly|advised|please|correlate|shows?|noted|for|with)\b/i,U=e=>e.split(/\s+/).filter(Boolean).length;function Js(e,t){switch(t){case"DOB":return/\d{1,2}[\/\-. ](?:\d{1,2}|[A-Za-z]{3,9})[\/\-. ]\d{2,4}/.test(e);case"CONTACT":return e.includes("@")||(e.match(/\d/g)||[]).length>=7;case"ID":return/\d/.test(e)&&e.length>=4&&U(e)<=4;case"NAME":case"DOCTOR":return U(e)<=5&&!/\d/.test(e)&&!Pt.test(e);case"FACILITY":return U(e)<=8&&!Pt.test(e);case"ADDRESS":return U(e)<=18;default:return!1}}function kt(e,t){let n=new Set,s=[],i=t.toLowerCase();for(let o of e||[]){if(!o||typeof o.text!="string")continue;let r=u[o.type]||"NAME",a=o.source==="you"?o.text.trim():Ys(o.text,r);if(a.length<2||a.length>120||Ue.test(a)||/^\d+(\.\d+)?\s*%?$/.test(a)&&a.length<6&&!(o.source==="pattern"&&r==="ID")||o.source!=="you"&&!Js(a,r)||!i.includes(a.toLowerCase()))continue;let c=a.toLowerCase();n.has(c)||(n.add(c),s.push({text:a,type:r,source:o.source||"model"}))}return ti(ei(si(s.map(o=>Ks(qs(o,t),t)),t),t),t)}function Ks(e,t){if(e.type!=="ADDRESS")return e;let n=t.match(new RegExp(`(?:^|[\\s,:])((?:#\\s?)?\\d[\\dA-Za-z/-]{0,8}[ ,]+)${x(e.text)}`,"im"));return n?{...e,text:n[1]+e.text}:e}function qs(e,t){if(e.type!=="FACILITY")return e;let n=t.split(/\r?\n/).find(o=>o.toLowerCase().includes(e.text.toLowerCase()));if(!n)return e;let s=n.trim(),i=s.toLowerCase().replace(e.text.toLowerCase(),"").trim();return i&&U(i)<=4&&!/[\d:]/.test(i)&&U(s)<=9?{...e,text:s}:e}var Qs=/^(road|rd|main|cross|street|st|lane|ln|new|old|near|opp|opposite|behind|city|locality|landmark|layout|stage|phase|block|sector|flat|house|h\.?no|no|floor|area|dist|district|taluk|state|india|colony|apartment|apartments|residency|hills|nagar|extension|ext|post|po|village|town|west|east|north|south|the|and|of)$/i,Xs=/^(clinical|diagnostics?|laborator(y|ies)|labs?|hospitals?|clinic|centre|center|pathology|healthcare|medical|research|imaging|scans?|technologies|ltd|limited|pvt)$/i;function ei(e,t){let n=t;for(let o of e)n=n.split(new RegExp(x(o.text),"gi")).join(" ");let s=new Set(e.map(o=>o.text.toLowerCase())),i=[];for(let o of e)if(!(o.type!=="ADDRESS"&&o.type!=="FACILITY"))for(let r of o.text.split(/[\s,.:;()\/-]+/))r.length<4||/\d/.test(r)||Qs.test(r)||Ue.test(r)||s.has(r.toLowerCase())||o.type==="FACILITY"&&Xs.test(r)||new RegExp(`\\b${x(r)}\\b`,"i").test(n)&&(s.add(r.toLowerCase()),i.push({text:r,type:o.type,source:"pattern"}));return e.concat(i)}function ti(e,t){return e.filter(n=>{let s=e.filter(o=>o!==n&&o.text.length>n.text.length&&o.text.toLowerCase().includes(n.text.toLowerCase()));if(!s.length)return!0;let i=t;for(let o of s)i=i.split(new RegExp(x(o.text),"gi")).join(" ");return i.toLowerCase().includes(n.text.toLowerCase())})}var ni=/^(mr|mrs|ms|miss|dr|shri|smt|sri|kumari|master|baby|md|prof)\.?$/i;function si(e,t){let n=t;for(let o of e)n=n.split(new RegExp(x(o.text),"gi")).join(" ");let s=new Set(e.map(o=>o.text.toLowerCase())),i=[];for(let o of e)if(!(o.type!=="NAME"&&o.type!=="DOCTOR"))for(let r of o.text.split(/[\s.]+/))r.length<3||ni.test(r)||Ue.test(r)||s.has(r.toLowerCase())||new RegExp(`\\b${x(r)}\\b`,"i").test(n)&&(s.add(r.toLowerCase()),i.push({text:r,type:o.type,source:"pattern"}));return e.concat(i)}function Ft(e,t,n){return kt([...e||[],...t||[]],n)}function Ut(e,t){let n=[...t].sort((a,c)=>c.text.length-a.text.length),s={},i={},o={},r=e;for(let a of n){let c=a.text.toLowerCase();if(!o[c]){s[a.type]=(s[a.type]||0)+1;let h=`[${a.type}_${s[a.type]}]`;o[c]=h,i[h]=a.text}let l=/^\w+$/.test(a.text)?"\\b":"";r=r.replace(new RegExp(l+x(a.text)+l,"gi"),o[c])}return{sealed:r,map:i}}function Be(e,t){let n=String(e??"");for(let[s,i]of Object.entries(t||{}))n=n.split(s).join(i);return n}function Bt(e,t=2800){let n=[],s=e;for(;s.length>t;){let i=s.lastIndexOf(`
`,t);i<t*.5&&(i=t),n.push(s.slice(0,i)),s=s.slice(i)}return s.trim()&&n.push(s),n}function $t(e){if(!e)return null;let t=String(e).replace(/^```(?:json)?/i,"").replace(/```$/,"").trim();try{return JSON.parse(t)}catch{}let n=t.indexOf("{"),s=t.lastIndexOf("}");if(n>=0&&s>n)try{return JSON.parse(t.slice(n,s+1))}catch{}return null}var Ht=e=>`List the personal identifiers in this medical document: names of the patient, relatives and doctors; hospital and lab names; street addresses; ID numbers; phone numbers; emails; dates of birth.
Copy only the identifying words exactly as written, never the field label or a whole sentence. Never list tests, results, units, ranges, age or sex.
Return JSON: {"entities":[{"text":"...","type":"NAME|DOCTOR|FACILITY|ADDRESS|ID|CONTACT|DOB"}]}

DOCUMENT:
${e}`;var ii={apiKey:"AIzaSyBNhTUtYR2NrarGlhKCs84yC1quvaEruWk",authDomain:"sealed-hybrid-ai.firebaseapp.com",projectId:"sealed-hybrid-ai",storageBucket:"sealed-hybrid-ai.firebasestorage.app",messagingSenderId:"864197298923",appId:"1:864197298923:web:6112612c5cc5f073a28cae"},Gt={expectedInputs:[{type:"text",languages:["en"]}],expectedOutputs:[{type:"text",languages:["en"]}]},oi={type:"object",properties:{entities:{type:"array",items:{type:"object",properties:{text:{type:"string"},type:{type:"string",enum:["NAME","DOCTOR","FACILITY","ADDRESS","ID","CONTACT","DOB"]}},required:["text","type"]}}},required:["entities"]},ne=null;function ri(){if(ne)return ne;let e=Se(ii,"sealed-extension"),t=vt(e,{backend:new P});return ne=Lt(t,{mode:A.ONLY_ON_DEVICE,onDeviceParams:{createOptions:Gt,promptOptions:{responseConstraint:oi}}}),ne}async function $e(){try{return"LanguageModel"in self?await self.LanguageModel.availability(Gt):"unavailable"}catch{return"unavailable"}}async function Vt(e){let t=xt(e),n=!1;if(await $e()==="available")try{let o=ri();try{await o.initializeDeviceModel?.()}catch{}let r=[];for(let a of Bt(e,2400)){let c=await o.generateContent(Ht(a)),l=$t(c.response.text());l?.entities&&(r=r.concat(l.entities))}t=Ft(t,r,e),n=!0}catch(o){console.warn("[Sealed] on-device model could not run; pattern rules only.",o)}let{sealed:s,map:i}=Ut(e,t);return{sealed:s,map:i,count:Object.keys(i).length,usedModel:n}}var m=e=>document.getElementById(e);chrome.storage.sync.get({enabled:!0},e=>{m("enabled").checked=e.enabled});m("enabled").addEventListener("change",()=>chrome.storage.sync.set({enabled:m("enabled").checked}));$e().then(e=>{m("status").textContent=e==="available"?"Gemini Nano: ready on this device":`Gemini Nano: ${e}. Pattern rules still work.`,m("status").className=e==="available"?"ok":"warn"});m("seal").addEventListener("click",async()=>{let e=m("in").value.trim();if(e){m("seal").disabled=!0,m("seal").textContent="Sealing on this device\u2026";try{let t=await Vt(e);await chrome.storage.session.set({lastMap:t.map,lastCount:t.count,lastAt:Date.now()}),m("in").value=t.sealed,m("note").textContent=`${t.count} personal detail${t.count===1?"":"s"} hidden${t.usedModel?" with Gemini Nano and pattern rules":" with pattern rules"}. Copy it into any chatbot.`,m("copy").hidden=!1}catch(t){m("note").textContent="Could not seal: "+(t?.message||t)}m("seal").disabled=!1,m("seal").textContent="Seal on this device"}});m("copy").addEventListener("click",async()=>{await navigator.clipboard.writeText(m("in").value),m("copy").textContent="Copied",setTimeout(()=>{m("copy").textContent="Copy"},1500)});m("restore").addEventListener("click",async()=>{let{lastMap:e}=await chrome.storage.session.get("lastMap");if(!e){m("restored").textContent="Nothing sealed in this browser session yet.";return}m("restored").textContent=Be(m("answer").value,e)});
/*! Bundled license information:

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/component/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/logger/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

firebase/app/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/ai/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/ai/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/ai/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/ai/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/ai/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/ai/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/ai/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2026 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/ai/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/ai/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/ai/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2026 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/ai/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/ai/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/ai/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/ai/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/ai/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
*/
