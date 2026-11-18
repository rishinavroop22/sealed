var Ue=()=>{};var Be=function(e){let t=[],n=0;for(let s=0;s<e.length;s++){let i=e.charCodeAt(s);i<128?t[n++]=i:i<2048?(t[n++]=i>>6|192,t[n++]=i&63|128):(i&64512)===55296&&s+1<e.length&&(e.charCodeAt(s+1)&64512)===56320?(i=65536+((i&1023)<<10)+(e.charCodeAt(++s)&1023),t[n++]=i>>18|240,t[n++]=i>>12&63|128,t[n++]=i>>6&63|128,t[n++]=i&63|128):(t[n++]=i>>12|224,t[n++]=i>>6&63|128,t[n++]=i&63|128)}return t},Bt=function(e){let t=[],n=0,s=0;for(;n<e.length;){let i=e[n++];if(i<128)t[s++]=String.fromCharCode(i);else if(i>191&&i<224){let o=e[n++];t[s++]=String.fromCharCode((i&31)<<6|o&63)}else if(i>239&&i<365){let o=e[n++],r=e[n++],a=e[n++],c=((i&7)<<18|(o&63)<<12|(r&63)<<6|a&63)-65536;t[s++]=String.fromCharCode(55296+(c>>10)),t[s++]=String.fromCharCode(56320+(c&1023))}else{let o=e[n++],r=e[n++];t[s++]=String.fromCharCode((i&15)<<12|(o&63)<<6|r&63)}}return t.join("")},$e={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(e,t){if(!Array.isArray(e))throw Error("encodeByteArray takes an array as a parameter");this.init_();let n=t?this.byteToCharMapWebSafe_:this.byteToCharMap_,s=[];for(let i=0;i<e.length;i+=3){let o=e[i],r=i+1<e.length,a=r?e[i+1]:0,c=i+2<e.length,l=c?e[i+2]:0,f=o>>2,p=(o&3)<<4|a>>4,m=(a&15)<<2|l>>6,V=l&63;c||(V=64,r||(m=64)),s.push(n[f],n[p],n[m],n[V])}return s.join("")},encodeString(e,t){return this.HAS_NATIVE_SUPPORT&&!t?btoa(e):this.encodeByteArray(Be(e),t)},decodeString(e,t){return this.HAS_NATIVE_SUPPORT&&!t?atob(e):Bt(this.decodeStringToByteArray(e,t))},decodeStringToByteArray(e,t){this.init_();let n=t?this.charToByteMapWebSafe_:this.charToByteMap_,s=[];for(let i=0;i<e.length;){let o=n[e.charAt(i++)],a=i<e.length?n[e.charAt(i)]:0;++i;let l=i<e.length?n[e.charAt(i)]:64;++i;let p=i<e.length?n[e.charAt(i)]:64;if(++i,o==null||a==null||l==null||p==null)throw new te;let m=o<<2|a>>4;if(s.push(m),l!==64){let V=a<<4&240|l>>2;if(s.push(V),p!==64){let Ft=l<<6&192|p;s.push(Ft)}}}return s},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let e=0;e<this.ENCODED_VALS.length;e++)this.byteToCharMap_[e]=this.ENCODED_VALS.charAt(e),this.charToByteMap_[this.byteToCharMap_[e]]=e,this.byteToCharMapWebSafe_[e]=this.ENCODED_VALS_WEBSAFE.charAt(e),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[e]]=e,e>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(e)]=e,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(e)]=e)}}},te=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}},$t=function(e){let t=Be(e);return $e.encodeByteArray(t,!0)},ne=function(e){return $t(e).replace(/\./g,"")},He=function(e){try{return $e.decodeString(e,!0)}catch(t){console.error("base64Decode failed: ",t)}return null};function T(e){return Ge(void 0,e)}function Ge(e,t){if(!(t instanceof Object))return t;switch(t.constructor){case Date:let n=t;return new Date(n.getTime());case Object:e===void 0&&(e={});break;case Array:e=[];break;default:return t}for(let n in t)!t.hasOwnProperty(n)||!Ht(n)||(e[n]=Ge(e[n],t[n]));return e}function Ht(e){return e!=="__proto__"}function se(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}var Gt=()=>se().__FIREBASE_DEFAULTS__,Vt=()=>{if(typeof process>"u"||typeof process.env>"u")return;let e=process.env.__FIREBASE_DEFAULTS__;if(e)return JSON.parse(e)},jt=()=>{if(typeof document>"u")return;let e;try{e=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}let t=e&&He(e[1]);return t&&JSON.parse(t)},Wt=()=>{try{return Ue()||Gt()||Vt()||jt()}catch(e){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${e}`);return}};var ie=()=>Wt()?.config;var F=class{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((t,n)=>{this.resolve=t,this.reject=n})}wrapCallback(t){return(n,s)=>{n?this.reject(n):this.resolve(s),typeof t=="function"&&(this.promise.catch(()=>{}),t.length===1?t(n):t(n,s))}}};function Ve(){try{return typeof indexedDB=="object"}catch{return!1}}function je(){return new Promise((e,t)=>{try{let n=!0,s="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(s);i.onsuccess=()=>{i.result.close(),n||self.indexedDB.deleteDatabase(s),e(!0)},i.onupgradeneeded=()=>{n=!1},i.onerror=()=>{t(i.error?.message||"")}}catch(n){t(n)}})}var Yt="FirebaseError",O=class e extends Error{constructor(t,n,s){super(n),this.code=t,this.customData=s,this.name=Yt,Object.setPrototypeOf(this,e.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,B.prototype.create)}},B=class{constructor(t,n,s){this.service=t,this.serviceName=n,this.errors=s}create(t,...n){let s=n[0]||{},i=`${this.service}/${t}`,o=this.errors[t],r=o?zt(o,s):"Error",a=`${this.serviceName}: ${r} (${i}).`;return new O(i,a,s)}};function zt(e,t){try{let n=0,s="";for(;n<e.length;){let i=e.indexOf("{$",n);if(i===-1){s+=e.substring(n);break}let o=e.indexOf("}",i+2);if(o===-1){s+=e.substring(n);break}let r=e.substring(i+2,o),a=t[r];s+=e.substring(n,i)+(a!=null?String(a):`<${r}?>`),n=o+1}return s}catch{return e}}function j(e,t){if(e===t)return!0;let n=Object.keys(e),s=Object.keys(t);for(let i of n){if(!s.includes(i))return!1;let o=e[i],r=t[i];if(Fe(o)&&Fe(r)){if(!j(o,r))return!1}else if(o!==r)return!1}for(let i of s)if(!n.includes(i))return!1;return!0}function Fe(e){return e!==null&&typeof e=="object"}var ii=4*60*60*1e3;function We(e){return e&&e._delegate?e._delegate:e}var A=class{constructor(t,n,s){this.name=t,this.instanceFactory=n,this.type=s,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(t){return this.instantiationMode=t,this}setMultipleInstances(t){return this.multipleInstances=t,this}setServiceProps(t){return this.serviceProps=t,this}setInstanceCreatedCallback(t){return this.onInstanceCreated=t,this}};var v="[DEFAULT]";var oe=class{constructor(t,n){this.name=t,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(t){let n=this.normalizeInstanceIdentifier(t);if(!this.instancesDeferred.has(n)){let s=new F;if(this.instancesDeferred.set(n,s),this.isInitialized(n)||this.shouldAutoInitialize())try{let i=this.getOrInitializeService({instanceIdentifier:n});i&&s.resolve(i)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(t){let n=this.normalizeInstanceIdentifier(t?.identifier),s=t?.optional??!1;if(this.isInitialized(n)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:n})}catch(i){if(s)return null;throw i}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(t){if(t.name!==this.name)throw Error(`Mismatching Component ${t.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=t,!!this.shouldAutoInitialize()){if(Kt(t))try{this.getOrInitializeService({instanceIdentifier:v})}catch{}for(let[n,s]of this.instancesDeferred.entries()){let i=this.normalizeInstanceIdentifier(n);try{let o=this.getOrInitializeService({instanceIdentifier:i});s.resolve(o)}catch{}}}}clearInstance(t=v){this.instancesDeferred.delete(t),this.instancesOptions.delete(t),this.instances.delete(t)}async delete(){let t=Array.from(this.instances.values());await Promise.all([...t.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...t.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(t=v){return this.instances.has(t)}getOptions(t=v){return this.instancesOptions.get(t)||{}}initialize(t={}){let{options:n={}}=t,s=this.normalizeInstanceIdentifier(t.instanceIdentifier);if(this.isInitialized(s))throw Error(`${this.name}(${s}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);let i=this.getOrInitializeService({instanceIdentifier:s,options:n});for(let[o,r]of this.instancesDeferred.entries()){let a=this.normalizeInstanceIdentifier(o);s===a&&r.resolve(i)}return i}onInit(t,n){let s=this.normalizeInstanceIdentifier(n),i=this.onInitCallbacks.get(s)??new Set;i.add(t),this.onInitCallbacks.set(s,i);let o=this.instances.get(s);return o&&t(o,s),()=>{i.delete(t)}}invokeOnInitCallbacks(t,n){let s=this.onInitCallbacks.get(n);if(s)for(let i of s)try{i(t,n)}catch{}}getOrInitializeService({instanceIdentifier:t,options:n={}}){let s=this.instances.get(t);if(!s&&this.component&&(s=this.component.instanceFactory(this.container,{instanceIdentifier:Jt(t),options:n}),this.instances.set(t,s),this.instancesOptions.set(t,n),this.invokeOnInitCallbacks(s,t),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,t,s)}catch{}return s||null}normalizeInstanceIdentifier(t=v){return this.component?this.component.multipleInstances?t:v:t}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}};function Jt(e){return e===v?void 0:e}function Kt(e){return e.instantiationMode==="EAGER"}var W=class{constructor(t){this.name=t,this.providers=new Map}addComponent(t){let n=this.getProvider(t.name);if(n.isComponentSet())throw new Error(`Component ${t.name} has already been registered with ${this.name}`);n.setComponent(t)}addOrOverwriteComponent(t){this.getProvider(t.name).isComponentSet()&&this.providers.delete(t.name),this.addComponent(t)}getProvider(t){if(this.providers.has(t))return this.providers.get(t);let n=new oe(t,this);return this.providers.set(t,n),n}getProviders(){return Array.from(this.providers.values())}};var qt=[],h;(function(e){e[e.DEBUG=0]="DEBUG",e[e.VERBOSE=1]="VERBOSE",e[e.INFO=2]="INFO",e[e.WARN=3]="WARN",e[e.ERROR=4]="ERROR",e[e.SILENT=5]="SILENT"})(h||(h={}));var Zt={debug:h.DEBUG,verbose:h.VERBOSE,info:h.INFO,warn:h.WARN,error:h.ERROR,silent:h.SILENT},Qt=h.INFO,Xt={[h.DEBUG]:"log",[h.VERBOSE]:"log",[h.INFO]:"info",[h.WARN]:"warn",[h.ERROR]:"error"},en=(e,t,...n)=>{if(t<e.logLevel)return;let s=new Date().toISOString(),i=Xt[t];if(i)console[i](`[${s}]  ${e.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${t})`)},x=class{constructor(t){this.name=t,this._logLevel=Qt,this._logHandler=en,this._userLogHandler=null,qt.push(this)}get logLevel(){return this._logLevel}set logLevel(t){if(!(t in h))throw new TypeError(`Invalid value "${t}" assigned to \`logLevel\``);this._logLevel=t}setLogLevel(t){this._logLevel=typeof t=="string"?Zt[t]:t}get logHandler(){return this._logHandler}set logHandler(t){if(typeof t!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=t}get userLogHandler(){return this._userLogHandler}set userLogHandler(t){this._userLogHandler=t}debug(...t){this._userLogHandler&&this._userLogHandler(this,h.DEBUG,...t),this._logHandler(this,h.DEBUG,...t)}log(...t){this._userLogHandler&&this._userLogHandler(this,h.VERBOSE,...t),this._logHandler(this,h.VERBOSE,...t)}info(...t){this._userLogHandler&&this._userLogHandler(this,h.INFO,...t),this._logHandler(this,h.INFO,...t)}warn(...t){this._userLogHandler&&this._userLogHandler(this,h.WARN,...t),this._logHandler(this,h.WARN,...t)}error(...t){this._userLogHandler&&this._userLogHandler(this,h.ERROR,...t),this._logHandler(this,h.ERROR,...t)}};var tn=(e,t)=>t.some(n=>e instanceof n),Ye,ze;function nn(){return Ye||(Ye=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function sn(){return ze||(ze=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}var Je=new WeakMap,ae=new WeakMap,Ke=new WeakMap,re=new WeakMap,le=new WeakMap;function on(e){let t=new Promise((n,s)=>{let i=()=>{e.removeEventListener("success",o),e.removeEventListener("error",r)},o=()=>{n(_(e.result)),i()},r=()=>{s(e.error),i()};e.addEventListener("success",o),e.addEventListener("error",r)});return t.then(n=>{n instanceof IDBCursor&&Je.set(n,e)}).catch(()=>{}),le.set(t,e),t}function rn(e){if(ae.has(e))return;let t=new Promise((n,s)=>{let i=()=>{e.removeEventListener("complete",o),e.removeEventListener("error",r),e.removeEventListener("abort",r)},o=()=>{n(),i()},r=()=>{s(e.error||new DOMException("AbortError","AbortError")),i()};e.addEventListener("complete",o),e.addEventListener("error",r),e.addEventListener("abort",r)});ae.set(e,t)}var ce={get(e,t,n){if(e instanceof IDBTransaction){if(t==="done")return ae.get(e);if(t==="objectStoreNames")return e.objectStoreNames||Ke.get(e);if(t==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return _(e[t])},set(e,t,n){return e[t]=n,!0},has(e,t){return e instanceof IDBTransaction&&(t==="done"||t==="store")?!0:t in e}};function qe(e){ce=e(ce)}function an(e){return e===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(t,...n){let s=e.call(Y(this),t,...n);return Ke.set(s,t.sort?t.sort():[t]),_(s)}:sn().includes(e)?function(...t){return e.apply(Y(this),t),_(Je.get(this))}:function(...t){return _(e.apply(Y(this),t))}}function cn(e){return typeof e=="function"?an(e):(e instanceof IDBTransaction&&rn(e),tn(e,nn())?new Proxy(e,ce):e)}function _(e){if(e instanceof IDBRequest)return on(e);if(re.has(e))return re.get(e);let t=cn(e);return t!==e&&(re.set(e,t),le.set(t,e)),t}var Y=e=>le.get(e);function Qe(e,t,{blocked:n,upgrade:s,blocking:i,terminated:o}={}){let r=indexedDB.open(e,t),a=_(r);return s&&r.addEventListener("upgradeneeded",c=>{s(_(r.result),c.oldVersion,c.newVersion,_(r.transaction),c)}),n&&r.addEventListener("blocked",c=>n(c.oldVersion,c.newVersion,c)),a.then(c=>{o&&c.addEventListener("close",()=>o()),i&&c.addEventListener("versionchange",l=>i(l.oldVersion,l.newVersion,l))}).catch(()=>{}),a}var ln=["get","getKey","getAll","getAllKeys","count"],un=["put","add","delete","clear"],ue=new Map;function Ze(e,t){if(!(e instanceof IDBDatabase&&!(t in e)&&typeof t=="string"))return;if(ue.get(t))return ue.get(t);let n=t.replace(/FromIndex$/,""),s=t!==n,i=un.includes(n);if(!(n in(s?IDBIndex:IDBObjectStore).prototype)||!(i||ln.includes(n)))return;let o=async function(r,...a){let c=this.transaction(r,i?"readwrite":"readonly"),l=c.store;return s&&(l=l.index(a.shift())),(await Promise.all([l[n](...a),i&&c.done]))[0]};return ue.set(t,o),o}qe(e=>({...e,get:(t,n,s)=>Ze(t,n)||e.get(t,n,s),has:(t,n)=>!!Ze(t,n)||e.has(t,n)}));var fe=class{constructor(t){this.container=t}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(dn(n)){let s=n.getImmediate();return`${s.library}/${s.version}`}else return null}).filter(n=>n).join(" ")}};function dn(e){return e.getComponent()?.type==="VERSION"}var he="@firebase/app",Xe="0.16.6";var w=new x("@firebase/app"),fn="@firebase/app-compat",hn="@firebase/analytics-compat",pn="@firebase/analytics",mn="@firebase/app-check-compat",gn="@firebase/app-check",En="@firebase/auth",yn="@firebase/auth-compat",bn="@firebase/crashlytics",_n="@firebase/database",Sn="@firebase/data-connect",On="@firebase/database-compat",An="@firebase/functions",Cn="@firebase/functions-compat",wn="@firebase/installations",In="@firebase/installations-compat",Rn="@firebase/messaging",Tn="@firebase/messaging-compat",Dn="@firebase/performance",Nn="@firebase/performance-compat",vn="@firebase/remote-config",Ln="@firebase/remote-config-compat",Mn="@firebase/storage",Pn="@firebase/storage-compat",xn="@firebase/firestore",kn="@firebase/ai",Un="@firebase/firestore-compat",Fn="firebase";var pe="[DEFAULT]",Bn={[he]:"fire-core",[fn]:"fire-core-compat",[pn]:"fire-analytics",[hn]:"fire-analytics-compat",[gn]:"fire-app-check",[mn]:"fire-app-check-compat",[En]:"fire-auth",[yn]:"fire-auth-compat",[bn]:"fire-cls",[_n]:"fire-rtdb",[Sn]:"fire-data-connect",[On]:"fire-rtdb-compat",[An]:"fire-fn",[Cn]:"fire-fn-compat",[wn]:"fire-iid",[In]:"fire-iid-compat",[Rn]:"fire-fcm",[Tn]:"fire-fcm-compat",[Dn]:"fire-perf",[Nn]:"fire-perf-compat",[vn]:"fire-rc",[Ln]:"fire-rc-compat",[Mn]:"fire-gcs",[Pn]:"fire-gcs-compat",[xn]:"fire-fst",[Un]:"fire-fst-compat",[kn]:"fire-vertex","fire-js":"fire-js",[Fn]:"fire-js-all"};var z=new Map,$n=new Map,me=new Map;function et(e,t){try{e.container.addComponent(t)}catch(n){w.debug(`Component ${t.name} failed to register with FirebaseApp ${e.name}`,n)}}function $(e){let t=e.name;if(me.has(t))return w.debug(`There were multiple attempts to register component ${t}.`),!1;me.set(t,e);for(let n of z.values())et(n,e);for(let n of $n.values())et(n,e);return!0}function it(e,t){let n=e.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),e.container.getProvider(t)}function ot(e){return e==null?!1:e.settings!==void 0}var Hn={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different {$mismatchedParam}. Existing: '{$oldValue}'. New: '{$newValue}'.","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},C=new B("app","Firebase",Hn);var ge=class{constructor(t,n,s){this._isDeleted=!1,this._options={...t},this._config={...n},this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=s,this.container.addComponent(new A("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(t){this.checkDestroyed(),this._automaticDataCollectionEnabled=t}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(t){this._isDeleted=t}checkDestroyed(){if(this.isDeleted)throw C.create("app-deleted",{appName:this._name})}};function be(e,t={}){let n=e;typeof t!="object"&&(t={name:t});let s={name:pe,automaticDataCollectionEnabled:!0,...t},i=s.name;if(typeof i!="string"||!i)throw C.create("bad-app-name",{appName:String(i)});if(n||(n=ie()),!n)throw C.create("no-options");let o=z.get(i);if(o)if(j(n,o.options)){if(j(s,o.config))return o;throw C.create("duplicate-app",{appName:i,mismatchedParam:"config",oldValue:JSON.stringify(o.config),newValue:JSON.stringify(s)})}else throw C.create("duplicate-app",{appName:i,mismatchedParam:"options",oldValue:JSON.stringify(o.options),newValue:JSON.stringify(n)});let r=new W(i);for(let c of me.values())r.addComponent(c);let a=new ge(n,s,r);return z.set(i,a),a}function rt(e=pe){let t=z.get(e);if(!t&&e===pe&&ie())return be();if(!t)throw C.create("no-app",{appName:e});return t}function D(e,t,n){let s=Bn[e]??e;n&&(s+=`-${n}`);let i=s.match(/\s|\//),o=t.match(/\s|\//);if(i||o){let r=[`Unable to register library "${s}" with version "${t}":`];i&&r.push(`library name "${s}" contains illegal characters (whitespace or "/")`),i&&o&&r.push("and"),o&&r.push(`version name "${t}" contains illegal characters (whitespace or "/")`),w.warn(r.join(" "));return}$(new A(`${s}-version`,()=>({library:s,version:t}),"VERSION"))}var Gn="firebase-heartbeat-database",Vn=1,H="firebase-heartbeat-store",de=null;function at(){return de||(de=Qe(Gn,Vn,{upgrade:(e,t)=>{switch(t){case 0:try{e.createObjectStore(H)}catch(n){console.warn(n)}}}}).catch(e=>{throw C.create("idb-open",{originalErrorMessage:e.message})})),de}async function jn(e){try{let n=(await at()).transaction(H),s=await n.objectStore(H).get(ct(e));return await n.done,s}catch(t){if(t instanceof O)w.warn(t.message);else{let n=C.create("idb-get",{originalErrorMessage:t?.message});w.warn(n.message)}}}async function tt(e,t){try{let s=(await at()).transaction(H,"readwrite");await s.objectStore(H).put(t,ct(e)),await s.done}catch(n){if(n instanceof O)w.warn(n.message);else{let s=C.create("idb-set",{originalErrorMessage:n?.message});w.warn(s.message)}}}function ct(e){return`${e.name}!${e.options.appId}`}var Wn=1024,Yn=30,Ee=class{constructor(t){this.container=t,this._heartbeatsCache=null;let n=this.container.getProvider("app").getImmediate();this._storage=new ye(n),this._heartbeatsCachePromise=this._storage.read().then(s=>(this._heartbeatsCache=s,s))}async triggerHeartbeat(){try{let n=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=nt();if(this._heartbeatsCache?.heartbeats==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(i=>i.date===s))return;if(this._heartbeatsCache.heartbeats.push({date:s,agent:n}),this._heartbeatsCache.heartbeats.length>Yn){let i=Jn(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(i,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(t){w.warn(t)}}async getHeartbeatsHeader(){try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null||this._heartbeatsCache.heartbeats.length===0)return"";let t=nt(),{heartbeatsToSend:n,unsentEntries:s}=zn(this._heartbeatsCache.heartbeats),i=ne(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return w.warn(t),""}}};function nt(){return new Date().toISOString().substring(0,10)}function zn(e,t=Wn){let n=[],s=e.slice();for(let i of e){let o=n.find(r=>r.agent===i.agent);if(o){if(o.dates.push(i.date),st(n)>t){o.dates.pop();break}}else if(n.push({agent:i.agent,dates:[i.date]}),st(n)>t){n.pop();break}s=s.slice(1)}return{heartbeatsToSend:n,unsentEntries:s}}var ye=class{constructor(t){this.app=t,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Ve()?je().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){let n=await jn(this.app);return n?.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(t){if(await this._canUseIndexedDBPromise){let s=await this.read();return tt(this.app,{lastSentHeartbeatDate:t.lastSentHeartbeatDate??s.lastSentHeartbeatDate,heartbeats:t.heartbeats})}else return}async add(t){if(await this._canUseIndexedDBPromise){let s=await this.read();return tt(this.app,{lastSentHeartbeatDate:t.lastSentHeartbeatDate??s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...t.heartbeats]})}else return}};function st(e){return ne(JSON.stringify({version:2,heartbeats:e})).length}function Jn(e){if(e.length===0)return-1;let t=0,n=e[0].date;for(let s=1;s<e.length;s++)e[s].date<n&&(n=e[s].date,t=s);return t}function Kn(e){$(new A("platform-logger",t=>new fe(t),"PRIVATE")),$(new A("heartbeat",t=>new Ee(t),"PRIVATE")),D(he,Xe,e),D(he,Xe,"esm2020"),D("fire-js","")}Kn("");var qn="firebase",Zn="13.3.0";D(qn,Zn,"app");var lt="@firebase/ai",Ce="3.1.0";var k="AI",Qn="global",Xn="firebasevertexai.googleapis.com",K="v1beta",ut=Ce,es="gl-js",ts="hybrid",ns=180*1e3,ss="gemini-3.5-flash-lite";var d=class e extends O{constructor(t,n,s){let i=k,o=`${i}/${t}`,r=`${i}: ${n} (${o})`;super(t,r),this.code=t,this.customErrorData=s,Error.captureStackTrace&&Error.captureStackTrace(this,e),Object.setPrototypeOf(this,e.prototype),this.toString=()=>r}};var dt=["user","model","function","system"];var Et={HARM_SEVERITY_NEGLIGIBLE:"HARM_SEVERITY_NEGLIGIBLE",HARM_SEVERITY_LOW:"HARM_SEVERITY_LOW",HARM_SEVERITY_MEDIUM:"HARM_SEVERITY_MEDIUM",HARM_SEVERITY_HIGH:"HARM_SEVERITY_HIGH",HARM_SEVERITY_UNSUPPORTED:"HARM_SEVERITY_UNSUPPORTED"};var y={STOP:"STOP",MAX_TOKENS:"MAX_TOKENS",SAFETY:"SAFETY",RECITATION:"RECITATION",OTHER:"OTHER",BLOCKLIST:"BLOCKLIST",PROHIBITED_CONTENT:"PROHIBITED_CONTENT",SPII:"SPII",MALFORMED_FUNCTION_CALL:"MALFORMED_FUNCTION_CALL",IMAGE_SAFETY:"IMAGE_SAFETY",IMAGE_PROHIBITED_CONTENT:"IMAGE_PROHIBITED_CONTENT",IMAGE_OTHER:"IMAGE_OTHER",NO_IMAGE:"NO_IMAGE",IMAGE_RECITATION:"IMAGE_RECITATION",LANGUAGE:"LANGUAGE",UNEXPECTED_TOOL_CALL:"UNEXPECTED_TOOL_CALL",TOO_MANY_TOOL_CALLS:"TOO_MANY_TOOL_CALLS",MISSING_THOUGHT_SIGNATURE:"MISSING_THOUGHT_SIGNATURE",MALFORMED_RESPONSE:"MALFORMED_RESPONSE"};var b={PREFER_ON_DEVICE:"prefer_on_device",ONLY_ON_DEVICE:"only_on_device",ONLY_IN_CLOUD:"only_in_cloud",PREFER_IN_CLOUD:"prefer_in_cloud"},N={ON_DEVICE:"on_device",IN_CLOUD:"in_cloud"};var u={ERROR:"error",REQUEST_ERROR:"request-error",RESPONSE_ERROR:"response-error",FETCH_ERROR:"fetch-error",SESSION_CLOSED:"session-closed",INVALID_CONTENT:"invalid-content",API_NOT_ENABLED:"api-not-enabled",ALREADY_INITIALIZED:"already-initialized",INVALID_SCHEMA:"invalid-schema",NO_API_KEY:"no-api-key",NO_APP_ID:"no-app-id",NO_MODEL:"no-model",NO_PROJECT_ID:"no-project-id",PARSE_FAILED:"parse-failed",UNSUPPORTED:"unsupported"};var R={AGENT_PLATFORM:"AGENT_PLATFORM",GOOGLE_AI:"GOOGLE_AI"};var q=class{constructor(t){this.backendType=t}},M=class extends q{constructor(){super(R.GOOGLE_AI)}_getModelPath(t,n){return`/${K}/projects/${t}/${n}`}_getTemplatePath(t,n){return`/${K}/projects/${t}/templates/${n}`}},Z=class extends q{constructor(t){super(R.AGENT_PLATFORM),this.location=Qn,t&&(this.location=t)}_getModelPath(t,n){return`/${K}/projects/${t}/locations/${this.location}/${n}`}_getTemplatePath(t,n){return`/${K}/projects/${t}/locations/${this.location}/templates/${n}`}};function is(e){if(e instanceof M)return`${k}/googleai`;if(e instanceof Z)return`${k}/agentplatform/${e.location}`;throw new d(u.ERROR,`Invalid backend: ${JSON.stringify(e.backendType)}`)}function os(e){let t=e.split("/");if(t[0]!==k)throw new d(u.ERROR,`Invalid instance identifier, unknown prefix '${t[0]}'`);switch(t[1]){case"agentplatform":let s=t[2];if(!s)throw new d(u.ERROR,`Invalid instance identifier, unknown location '${e}'`);return new Z(s);case"googleai":return new M;default:throw new d(u.ERROR,`Invalid instance identifier string: '${e}'`)}}var g=new x("@firebase/ai"),I;(function(e){e.UNAVAILABLE="unavailable",e.DOWNLOADABLE="downloadable",e.DOWNLOADING="downloading",e.AVAILABLE="available"})(I||(I={}));var yt={type:"text",languages:["en"]},_e=[yt,{type:"image"}],Se=[yt],Q=class e{constructor(t,n,s){this.languageModelProvider=t,this.mode=n,this.downloadPromise=null,this.onDeviceParams={createOptions:{expectedInputs:_e,expectedOutputs:Se}},s&&(this.onDeviceParams=s,this.onDeviceParams.createOptions?(this.onDeviceParams.createOptions.expectedInputs||(this.onDeviceParams.createOptions.expectedInputs=_e),this.onDeviceParams.createOptions.expectedOutputs||(this.onDeviceParams.createOptions.expectedOutputs=Se)):this.onDeviceParams.createOptions={expectedInputs:_e,expectedOutputs:Se})}async isAvailable(t){if(!this.mode)return g.debug("On-device inference unavailable because mode is undefined."),!1;if(this.mode===b.ONLY_IN_CLOUD)return g.debug('On-device inference unavailable because mode is "only_in_cloud".'),!1;let n=await this.languageModelProvider?.availability(this.onDeviceParams.createOptions);if(this.mode===b.ONLY_ON_DEVICE){if(n===I.UNAVAILABLE)throw new d(u.API_NOT_ENABLED,"Local LanguageModel API not available in this environment.");if(n===I.DOWNLOADABLE||n===I.DOWNLOADING){g.debug("Waiting for download of LanguageModel to complete.");try{await this.downloadPromise}catch(s){throw new d(u.ERROR,s.message)}return!0}return!0}return n!==I.AVAILABLE?(g.debug(`On-device inference unavailable because availability is "${n}".`),!1):e.isOnDeviceRequest(t)?!0:(g.debug("On-device inference unavailable because request is incompatible."),!1)}async generateContent(t){let n=await this.createSession(),s=await Promise.all(t.contents.map(e.toLanguageModelMessage)),i=await n.prompt(s,this.onDeviceParams.promptOptions);return e.toResponse(i)}async generateContentStream(t){let n=await this.createSession(),s=await Promise.all(t.contents.map(e.toLanguageModelMessage)),i=n.promptStreaming(s,this.onDeviceParams.promptOptions);return e.toStreamResponse(i)}async countTokens(t){throw new d(u.REQUEST_ERROR,"Count Tokens is not yet available for on-device model.")}static isOnDeviceRequest(t){if(t.contents.length===0)return g.debug("Empty prompt rejected for on-device inference."),!1;for(let n of t.contents){if(n.parts.some(s=>"functionResponse"in s))return g.debug("Content with a function response part rejected for on-device inference."),!1;for(let s of n.parts)if("inlineData"in s&&s.inlineData&&e.SUPPORTED_MIME_TYPES.indexOf(s.inlineData.mimeType)===-1)return g.debug(`Unsupported mime type "${s.inlineData.mimeType}" rejected for on-device inference.`),!1}return!0}async downloadIfAvailable(t){let n=await this.languageModelProvider?.availability(this.onDeviceParams.createOptions);return(n===I.DOWNLOADABLE||n===I.DOWNLOADING)&&this.download(t),n}download(t){if(this.downloadPromise)return;let n={...this.onDeviceParams.createOptions};n&&!n.monitor&&t&&(n.monitor=s=>{s.addEventListener("downloadprogress",i=>{t(i.loaded)})}),this.downloadPromise=this.languageModelProvider?.create(n).finally(()=>{this.downloadPromise=null})}static async toLanguageModelMessage(t){let n=await Promise.all(t.parts.map(e.toLanguageModelMessageContent));return{role:e.toLanguageModelMessageRole(t.role),content:n}}static async toLanguageModelMessageContent(t){if("text"in t&&typeof t.text=="string")return{type:"text",value:t.text};if("inlineData"in t&&t.inlineData){let s=await(await fetch(`data:${t.inlineData.mimeType};base64,${t.inlineData.data}`)).blob();return{type:"image",value:await createImageBitmap(s)}}throw new d(u.REQUEST_ERROR,"Processing of this Part type is not currently supported.")}static toLanguageModelMessageRole(t){return t==="model"?"assistant":"user"}async createSession(){if(!this.languageModelProvider)throw new d(u.UNSUPPORTED,"Chrome AI requested for unsupported browser version.");let t=await this.languageModelProvider.create(this.onDeviceParams.createOptions);return this.oldSession&&this.oldSession.destroy(),this.oldSession=t,t}static toResponse(t){return{json:async()=>({candidates:[{content:{parts:[{text:t}]}}]})}}static toStreamResponse(t){let n=new TextEncoder;return{body:t.pipeThrough(new TransformStream({transform(s,i){let o=JSON.stringify({candidates:[{content:{role:"model",parts:[{text:s}]}}]});i.enqueue(n.encode(`data: ${o}

`))}}))}}};Q.SUPPORTED_MIME_TYPES=["image/jpeg","image/png"];function rs(e,t,n){let i=(t||se()).LanguageModel;if(i&&e)return new Q(i,e,n)}var we=class{constructor(t,n,s,i,o){this.app=t,this.backend=n,this.chromeAdapterFactory=o;let r=i?.getImmediate({optional:!0}),a=s?.getImmediate({optional:!0});this.auth=a||null,this.appCheck=r||null}_delete(){return Promise.resolve()}set options(t){this._options=t}get options(){return this._options}};function as(e,{instanceIdentifier:t}){if(!t)throw new d(u.ERROR,"AIService instance identifier is undefined.");let n=os(t),s=e.getProvider("app").getImmediate(),i=e.getProvider("auth-internal"),o=e.getProvider("app-check-internal");return new we(s,n,i,o,rs)}function cs(e){if(e.app?.options?.apiKey)if(e.app?.options?.projectId){if(!e.app?.options?.appId)throw new d(u.NO_APP_ID,'The "appId" field is empty in the local Firebase config. Firebase AI requires this field to contain a valid app ID.')}else throw new d(u.NO_PROJECT_ID,'The "projectId" field is empty in the local Firebase config. Firebase AI requires this field to contain a valid project ID.');else throw new d(u.NO_API_KEY,'The "apiKey" field is empty in the local Firebase config. Firebase AI requires this field to contain a valid API key.');let t={apiKey:e.app.options.apiKey,project:e.app.options.projectId,appId:e.app.options.appId,automaticDataCollectionEnabled:e.app.automaticDataCollectionEnabled,backend:e.backend};if(ot(e.app)&&e.app.settings.appCheckToken){let n=e.app.settings.appCheckToken;t.getAppCheckToken=()=>Promise.resolve({token:n})}else e.appCheck&&(e.options?.useLimitedUseAppCheckTokens?t.getAppCheckToken=()=>e.appCheck.getLimitedUseToken():t.getAppCheckToken=()=>e.appCheck.getToken());return e.auth&&(t.getAuthToken=()=>e.auth.getToken()),t}var Ie=class e{constructor(t,n){this._apiSettings=cs(t),this.model=e.normalizeModelName(n,this._apiSettings.backend.backendType)}static normalizeModelName(t,n){return n===R.GOOGLE_AI?e.normalizeGoogleAIModelName(t):e.normalizeVertexAIModelName(t)}static normalizeGoogleAIModelName(t){return`models/${t}`}static normalizeVertexAIModelName(t){let n;return t.includes("/")?t.startsWith("models/")?n=`publishers/google/${t}`:n=t:n=`publishers/google/models/${t}`,n}};var ls="Timeout has expired.",Oe="AbortError",Re=class{constructor(t){this.params=t}toString(){let t=new URL(this.baseUrl);return t.pathname=this.pathname,t.search=this.queryParams.toString(),t.toString()}get pathname(){return this.params.templateId?`${this.params.apiSettings.backend._getTemplatePath(this.params.apiSettings.project,this.params.templateId)}:${this.params.task}`:`${this.params.apiSettings.backend._getModelPath(this.params.apiSettings.project,this.params.model)}:${this.params.task}`}get baseUrl(){return this.params.singleRequestOptions?.baseUrl??`https://${Xn}`}get queryParams(){let t=new URLSearchParams;return this.params.stream&&t.set("alt","sse"),t}};function us(e){let t=[];return t.push(`${es}/${ut}`),t.push(`fire/${ut}`),(e.params.apiSettings.inferenceMode===b.PREFER_ON_DEVICE||e.params.apiSettings.inferenceMode===b.PREFER_IN_CLOUD)&&t.push(ts),t.join(" ")}async function ds(e){let t=new Headers;if(t.append("Content-Type","application/json"),t.append("x-goog-api-client",us(e)),t.append("x-goog-api-key",e.params.apiSettings.apiKey),e.params.apiSettings.automaticDataCollectionEnabled&&t.append("X-Firebase-Appid",e.params.apiSettings.appId),e.params.apiSettings.getAppCheckToken){let n=await e.params.apiSettings.getAppCheckToken();n&&(t.append("X-Firebase-AppCheck",n.token),n.error&&g.warn(`Unable to obtain a valid App Check token: ${n.error.message}`))}if(e.params.apiSettings.getAuthToken){let n=await e.params.apiSettings.getAuthToken();n&&t.append("Authorization",`Firebase ${n.accessToken}`)}return t}async function ve(e,t){let n=new Re(e),s,i=e.singleRequestOptions?.signal,o=e.singleRequestOptions?.timeout!=null&&e.singleRequestOptions.timeout>=0?e.singleRequestOptions.timeout:ns,r=new AbortController,a=setTimeout(()=>{r.abort(new DOMException(ls,Oe)),g.debug(`Aborting request to ${n} due to timeout (${o}ms)`)},o),c=AbortSignal.any(i?[i,r.signal]:[r.signal]);if(i&&i.aborted)throw clearTimeout(a),new DOMException(i.reason??"Aborted externally before fetch",Oe);try{let l={method:"POST",headers:await ds(n),signal:c,body:t};if(s=await fetch(n.toString(),l),!s.ok){let f="",p;try{let m=await s.json();f=m.error.message,m.error.details&&(f+=` ${JSON.stringify(m.error.details)}`,p=m.error.details)}catch{}throw s.status===403&&p&&p.some(m=>m.reason==="SERVICE_DISABLED")&&p.some(m=>m.links?.[0]?.description.includes("Google developers console API activation"))?new d(u.API_NOT_ENABLED,`The Firebase AI SDK requires the Firebase AI API ('firebasevertexai.googleapis.com') to be enabled in your Firebase project. Enable this API by visiting the Firebase Console at https://console.firebase.google.com/project/${n.params.apiSettings.project}/ailogic/ and clicking "Get started". If you enabled this API recently, wait a few minutes for the action to propagate to our systems and then retry.`,{status:s.status,statusText:s.statusText,errorDetails:p}):new d(u.FETCH_ERROR,`Error fetching from ${n}: [${s.status} ${s.statusText}] ${f}`,{status:s.status,statusText:s.statusText,errorDetails:p})}}catch(l){let f=l;throw l.code!==u.FETCH_ERROR&&l.code!==u.API_NOT_ENABLED&&l instanceof Error&&l.name!==Oe&&(f=new d(u.ERROR,`Error fetching from ${n.toString()}: ${l.message}`),f.stack=l.stack),f}finally{clearTimeout(a)}return s}function J(e){if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&g.warn(`This response had ${e.candidates.length} candidates. Returning text from the first candidate only. Access response.candidates directly to use the other candidates.`),_t(e.candidates[0]))throw new d(u.RESPONSE_ERROR,`Response error: ${L(e)}. Response body stored in error.response`,{response:e});return!0}else return!1}function S(e){return"type"in e&&e.type?e:e.text!==void 0?{...e,type:"text"}:e.inlineData!==void 0?{...e,type:"inlineData"}:e.functionCall!==void 0?{...e,type:"functionCall"}:e.functionResponse!==void 0?{...e,type:"functionResponse"}:e.fileData!==void 0?{...e,type:"fileData"}:e.executableCode!==void 0?{...e,type:"executableCode"}:e.codeExecutionResult!==void 0?{...e,type:"codeExecutionResult"}:e}function X(e,t=N.IN_CLOUD){if(e.candidates?.[0]&&!e.candidates[0].hasOwnProperty("index")&&(e.candidates[0].index=0),e.candidates)for(let s of e.candidates)s.content?.parts&&(s.content.parts=s.content.parts.map(S));let n=fs(e);return n.inferenceSource=t,n}function fs(e){return e.text=()=>{if(J(e))return ft(e,t=>!("thought"in t&&t.thought));if(e.promptFeedback)throw new d(u.RESPONSE_ERROR,`Text not available. ${L(e)}`,{response:e});return""},e.thoughtSummary=()=>{if(J(e)){let t=ft(e,n=>!!("thought"in n&&n.thought));return t===""?void 0:t}else if(e.promptFeedback)throw new d(u.RESPONSE_ERROR,`Thought summary not available. ${L(e)}`,{response:e})},e.inlineDataParts=()=>{if(J(e))return hs(e);if(e.promptFeedback)throw new d(u.RESPONSE_ERROR,`Data not available. ${L(e)}`,{response:e})},e.functionCalls=()=>{if(J(e))return bt(e);if(e.promptFeedback)throw new d(u.RESPONSE_ERROR,`Function call not available. ${L(e)}`,{response:e})},e}function ft(e,t){let n=[];if(e.candidates?.[0].content?.parts)for(let s of e.candidates?.[0].content?.parts){let i=S(s);i.type==="text"&&t(i)&&n.push(i.text)}return n.length>0?n.join(""):""}function bt(e){if(!e)return;let t=[];if(e.candidates?.[0].content?.parts)for(let n of e.candidates?.[0].content?.parts){let s=S(n);s.type==="functionCall"&&t.push(s.functionCall)}if(t.length>0)return t}function hs(e){let t=[];if(e.candidates?.[0].content?.parts)for(let n of e.candidates?.[0].content?.parts){let s=S(n);s.type==="inlineData"&&t.push(s)}if(t.length>0)return t}var ps=[y.RECITATION,y.SAFETY,y.BLOCKLIST,y.PROHIBITED_CONTENT,y.SPII,y.MALFORMED_FUNCTION_CALL,y.IMAGE_SAFETY,y.IMAGE_PROHIBITED_CONTENT,y.IMAGE_OTHER,y.NO_IMAGE,y.IMAGE_RECITATION,y.LANGUAGE,y.UNEXPECTED_TOOL_CALL,y.TOO_MANY_TOOL_CALLS,y.MISSING_THOUGHT_SIGNATURE,y.MALFORMED_RESPONSE];function _t(e){return!!e.finishReason&&ps.some(t=>t===e.finishReason)}function L(e){let t="";if((!e.candidates||e.candidates.length===0)&&e.promptFeedback)t+="Response was blocked",e.promptFeedback?.blockReason&&(t+=` due to ${e.promptFeedback.blockReason}`),e.promptFeedback?.blockReasonMessage&&(t+=`: ${e.promptFeedback.blockReasonMessage}`);else if(e.candidates?.[0]){let n=e.candidates[0];_t(n)&&(t+=`Candidate was blocked due to ${n.finishReason}`,n.finishMessage&&(t+=`: ${n.finishMessage}`))}return t}function Le(e){if(e!=null){if(typeof e=="string")return{role:"system",parts:[{type:"text",text:e}]};if(e.type==="text"||"text"in e&&typeof e.text=="string")return{role:"system",parts:[T(S(e))]};if(e.parts){let t=e.parts.map(n=>T(S(n)));return e.role?{...e,parts:t}:{role:"system",parts:t}}}}function G(e){let t=[];if(typeof e=="string")t=[{type:"text",text:e}];else for(let n of e)typeof n=="string"?t.push({type:"text",text:n}):t.push(T(S(n)));return ms(t)}function ms(e){let t={role:"user",parts:[]},n=!1,s=!1;for(let i of e)i.type==="functionResponse"||"functionResponse"in i?s=!0:n=!0,t.parts.push(i);if(n&&s)throw new d(u.INVALID_CONTENT,"Within a single message, FunctionResponse cannot be mixed with other type of Part in the request for sending chat message.");if(!n&&!s)throw new d(u.INVALID_CONTENT,"No Content is provided for sending chat message.");return t}function Ae(e){let t;if(e.contents){let n=e;t={...n,contents:n.contents.map(s=>({...s,parts:s.parts?s.parts.map(S):[]}))}}else t={contents:[G(e)]};return e.systemInstruction&&(t.systemInstruction=Le(e.systemInstruction)),t}function gs(e){return e.parts&&Array.isArray(e.parts)?{...e,parts:e.parts.map(Me)}:e}function Me(e){let t;if("type"in e){let{type:n,...s}=e;t=s}else t=e;return t.functionResponse&&(t={...t,functionResponse:gs(t.functionResponse)}),t}function Pe(e){return e.parts?{...e,parts:e.parts.map(Me)}:e}function St(e){return e==null||typeof e=="string"?e:"parts"in e&&Array.isArray(e.parts)?Pe(e):Me(e)}function Ot(e){let t={...e};return t.contents&&(t.contents=t.contents.map(Pe)),t.systemInstruction&&(t.systemInstruction=St(t.systemInstruction)),t}function Es(e){let t={...e};return t.contents&&(t.contents=t.contents.map(Pe)),t.systemInstruction&&(t.systemInstruction=St(t.systemInstruction)),t}function At(e){if(e.safetySettings?.forEach(t=>{if(t.method)throw new d(u.UNSUPPORTED,"SafetySetting.method is not supported in the the Gemini Developer API. Please remove this property.")}),e.generationConfig?.topK){let t=Math.round(e.generationConfig.topK);t!==e.generationConfig.topK&&(g.warn("topK in GenerationConfig has been rounded to the nearest integer to match the format for requests to the Gemini Developer API."),e.generationConfig.topK=t)}return e}function xe(e){return{candidates:e.candidates?bs(e.candidates):void 0,promptFeedback:e.promptFeedback?_s(e.promptFeedback):void 0,usageMetadata:e.usageMetadata}}function ys(e,t){return{generateContentRequest:{model:t,...e}}}function bs(e){let t=[],n;return t&&e.forEach(s=>{let i;if(s.citationMetadata&&(i={citations:s.citationMetadata.citationSources}),s.safetyRatings&&(n=s.safetyRatings.map(r=>({...r,severity:r.severity??Et.HARM_SEVERITY_UNSUPPORTED,probabilityScore:r.probabilityScore??0,severityScore:r.severityScore??0}))),s.content?.parts?.some(r=>"videoMetadata"in r&&r.videoMetadata))throw new d(u.UNSUPPORTED,"Part.videoMetadata is not supported in the Gemini Developer API. Please remove this property.");let o={index:s.index,content:s.content,finishReason:s.finishReason,finishMessage:s.finishMessage,safetyRatings:n,citationMetadata:i,groundingMetadata:s.groundingMetadata,urlContextMetadata:s.urlContextMetadata};t.push(o)}),t}function _s(e){let t=[];return(e.safetyRatings??[]).forEach(s=>{t.push({category:s.category,probability:s.probability,severity:s.severity??Et.HARM_SEVERITY_UNSUPPORTED,probabilityScore:s.probabilityScore??0,severityScore:s.severityScore??0,blocked:s.blocked})}),{blockReason:e.blockReason,safetyRatings:t,blockReasonMessage:e.blockReasonMessage}}var ht=/^data\: (.*)(?:\n\n|\r\r|\r\n\r\n)/;async function Ss(e,t,n){let s=e.body.pipeThrough(new TextDecoderStream("utf8",{fatal:!0})),i=ws(s),[o,r]=i.tee(),{response:a,firstValue:c}=await Os(r,t,n);return{stream:Cs(o,t,n),response:a,firstValue:c}}async function Os(e,t,n){let[s,i]=e.tee(),o=s.getReader(),{value:r}=await o.read();return{firstValue:r,response:As(i,t,n)}}async function As(e,t,n){let s=[],i=e.getReader();for(;;){let{done:o,value:r}=await i.read();if(o){let a=Is(s);return t.backend.backendType===R.GOOGLE_AI&&(a=xe(a)),X(a,n)}s.push(r)}}async function*Cs(e,t,n){let s=e.getReader();for(;;){let{value:i,done:o}=await s.read();if(o)break;let r;t.backend.backendType===R.GOOGLE_AI?r=X(xe(i),n):r=X(i,n);let a=r.candidates?.[0];!a?.content?.parts&&!a?.finishReason&&!a?.citationMetadata&&!a?.urlContextMetadata||(yield r)}}function ws(e){let t=e.getReader();return new ReadableStream({start(s){let i="";return o();function o(){return t.read().then(({value:r,done:a})=>{if(a){if(i.trim()){s.error(new d(u.PARSE_FAILED,"Failed to parse stream"));return}s.close();return}i+=r;let c=i.match(ht),l;for(;c;){try{l=JSON.parse(c[1])}catch{s.error(new d(u.PARSE_FAILED,`Error parsing JSON response: "${c[1]}`));return}s.enqueue(l),i=i.substring(c[0].length),c=i.match(ht)}return o()})}}})}function Is(e){let n={promptFeedback:e[e.length-1]?.promptFeedback};for(let s of e)if(s.candidates)for(let i of s.candidates){let o=i.index||0;n.candidates||(n.candidates=[]),n.candidates[o]||(n.candidates[o]={index:i.index}),n.candidates[o].citationMetadata=i.citationMetadata,n.candidates[o].finishReason=i.finishReason,n.candidates[o].finishMessage=i.finishMessage,n.candidates[o].safetyRatings=i.safetyRatings,n.candidates[o].groundingMetadata=i.groundingMetadata;let r=i.urlContextMetadata;if(typeof r=="object"&&r!==null&&Object.keys(r).length>0&&(n.candidates[o].urlContextMetadata=r),i.content){if(!i.content.parts)continue;n.candidates[o].content||(n.candidates[o].content={role:i.content.role||"user",parts:[]});for(let a of i.content.parts){if("text"in a&&a.text==="")continue;if(Object.keys(a).length===0)throw new d(u.INVALID_CONTENT,"Part should have at least one property, but there are none. This is likely caused by a malformed response from the backend.");let c=S({...a});Object.keys(c).length>0&&n.candidates[o].content.parts.push(c)}}}return n}var Rs=[u.FETCH_ERROR,u.ERROR,u.API_NOT_ENABLED];async function Ct(e,t,n,s){if(!t)return{response:await s(),inferenceSource:N.IN_CLOUD};switch(t.mode){case b.ONLY_ON_DEVICE:if(await t.isAvailable(e))return{response:await n(),inferenceSource:N.ON_DEVICE};throw new d(u.UNSUPPORTED,"Inference mode is ONLY_ON_DEVICE, but an on-device model is not available.");case b.ONLY_IN_CLOUD:return{response:await s(),inferenceSource:N.IN_CLOUD};case b.PREFER_IN_CLOUD:try{return{response:await s(),inferenceSource:N.IN_CLOUD}}catch(i){if(i instanceof d&&Rs.includes(i.code)&&await t.isAvailable(e))return{response:await n(),inferenceSource:N.ON_DEVICE};throw i}case b.PREFER_ON_DEVICE:return await t.isAvailable(e)?{response:await n(),inferenceSource:N.ON_DEVICE}:{response:await s(),inferenceSource:N.IN_CLOUD};default:throw new d(u.ERROR,`Unexpected infererence mode: ${t.mode}`)}}async function Ts(e,t,n,s){return n=Ot(n),e.backend.backendType===R.GOOGLE_AI&&(n=At(n)),ve({task:"streamGenerateContent",model:t,apiSettings:e,stream:!0,singleRequestOptions:s},JSON.stringify(n))}async function wt(e,t,n,s,i){let o=await Ct(n,s,()=>s.generateContentStream(n),()=>Ts(e,t,n,i));return Ss(o.response,e,o.inferenceSource)}async function Ds(e,t,n,s){return n=Ot(n),e.backend.backendType===R.GOOGLE_AI&&(n=At(n)),ve({model:t,task:"generateContent",apiSettings:e,stream:!1,singleRequestOptions:s},JSON.stringify(n))}async function It(e,t,n,s,i){let o=await Ct(n,s,()=>s.generateContent(n),()=>Ds(e,t,n,i)),r=await Ns(o.response,e);return{response:X(r,o.inferenceSource)}}async function Ns(e,t){let n=await e.json();return t.backend.backendType===R.GOOGLE_AI?xe(n):n}var pt="SILENT_ERROR",mt=10,Te=class{constructor(t,n,s){this.params=n,this.requestOptions=s,this._history=[],this._sendPromise=Promise.resolve(),this._apiSettings=t}async getHistory(){return await this._sendPromise,T(this._history).map(t=>({...t,parts:t.parts?t.parts.map(S):[]}))}async _sendMessage(t,n){let s={};await this._sendPromise;let i=[];return this._sendPromise=this._sendPromise.then(async()=>{let o,r=0,a=this.requestOptions?.maxSequentialFunctionCalls??mt;do{let c;if(o){r++;let p=await this._callFunctionsAsNeeded(o);c=G(p)}else c=G(t);let l=this._formatRequest(c,[...i]);i.push(c);let f=await this._callGenerateContent(l,n);if(f)if(s=f,o=this._getCallableFunctionCalls(f.response),f.response.candidates&&f.response.candidates.length>0){let p={parts:f.response.candidates?.[0].content.parts||[],role:f.response.candidates?.[0].content.role||"model"};i.push(T(p))}else{let p=L(f.response);p&&g.warn(`sendMessage() was unsuccessful. ${p}. Inspect response object for details.`)}else o=void 0}while(o&&r<a);o&&r>=a&&g.warn(`Automatic function calling exceeded the limit of ${a} function calls. Returning last model response.`)}),await this._sendPromise,this._history=this._history.concat(i),s}async _sendMessageStream(t,n){await this._sendPromise;let s=[],o=(async()=>{let r,a=0,c=this.requestOptions?.maxSequentialFunctionCalls??mt,l;do{let f;if(r){a++;let m=await this._callFunctionsAsNeeded(r);f=G(m)}else f=G(t);let p=this._formatRequest(f,[...s]);if(s.push(f),l=await this._callGenerateContentStream(p,n),r=this._getCallableFunctionCalls(l.firstValue),r&&l.firstValue&&l.firstValue.candidates&&l.firstValue.candidates.length>0){let m={...l.firstValue.candidates[0].content};m.role||(m.role="model"),s.push(m)}}while(r&&a<c);return r&&a>=c&&g.warn(`Automatic function calling exceeded the limit of ${c} function calls. Returning last model response.`),{stream:l.stream,response:l.response}})();return this._sendPromise=this._sendPromise.then(async()=>o).catch(r=>{throw new Error(pt)}).then(r=>r.response).then(r=>{if(r.candidates&&r.candidates.length>0){this._history=this._history.concat(s);let a={...r.candidates[0].content};a.role||(a.role="model"),this._history.push(T(a))}else{let a=L(r);a&&g.warn(`sendMessageStream() was unsuccessful. ${a}. Inspect response object for details.`)}}).catch(r=>{r.message!==pt&&r.name!=="AbortError"&&g.error(r)}),o}_getCallableFunctionCalls(t){let n=this.params?.tools?.find(i=>i.functionDeclarations);if(!n?.functionDeclarations)return;let s=bt(t);if(s){for(let i of s)if(!n.functionDeclarations?.some(r=>r.name===i.name&&typeof r.functionReference=="function"))return;return s}}async _callFunctionsAsNeeded(t){let n=[],s=[],i=this.params?.tools?.find(o=>o.functionDeclarations);if(i&&i.functionDeclarations){for(let r of t){let a=i.functionDeclarations.find(c=>c.name===r.name);if(a?.functionReference){let c=Promise.resolve(a.functionReference(r.args)).catch(l=>{let f=new d(u.ERROR,`Error in user-defined function "${a.name}": ${l.message}`);throw f.stack=l.stack,f});n.push({name:r.name,id:r.id,results:c}),s.push(c)}}await Promise.all(s);let o=[];for(let{name:r,id:a,results:c}of n){let l={name:r,response:await c};a&&(l.id=a),o.push({type:"functionResponse",functionResponse:l})}return o}else throw new d(u.REQUEST_ERROR,'No function declarations were provided in "tools".')}};var vs=["text","inlineData","functionCall","functionResponse","thought","thoughtSignature"],Ls={user:["text","inlineData","functionResponse"],function:["functionResponse"],model:["text","functionCall","thought","thoughtSignature"],system:["text"]},gt={user:["model"],function:["model"],model:["user","function"],system:[]};function Ms(e){let t=null;for(let n of e){let{role:s,parts:i}=n;if(!t&&s!=="user")throw new d(u.INVALID_CONTENT,`First Content should be with role 'user', got ${s}`);if(!dt.includes(s))throw new d(u.INVALID_CONTENT,`Each item should include role field. Got ${s} but valid roles are: ${JSON.stringify(dt)}`);if(!Array.isArray(i))throw new d(u.INVALID_CONTENT,"Content should have 'parts' property with an array of Parts");if(i.length===0)throw new d(u.INVALID_CONTENT,"Each Content should have at least one part");let o={text:0,inlineData:0,functionCall:0,functionResponse:0,thought:0,thoughtSignature:0,fileData:0,executableCode:0,codeExecutionResult:0};for(let a of i){if(a.type)o[a.type]+=1;else for(let c of["text","inlineData","functionCall","functionResponse","fileData","executableCode","codeExecutionResult"])c in a&&(o[c]+=1);"thought"in a&&a.thought&&(o.thought+=1),"thoughtSignature"in a&&a.thoughtSignature&&(o.thoughtSignature+=1)}let r=Ls[s];for(let a of vs)if(!r.includes(a)&&o[a]>0)throw new d(u.INVALID_CONTENT,`Content with role '${s}' can't contain '${a}' part`);if(t&&!gt[s].includes(t.role))throw new d(u.INVALID_CONTENT,`Content with role '${s}' can't follow '${t.role}'. Valid previous roles: ${JSON.stringify(gt)}`);t=n}}var De=class extends Te{constructor(t,n,s,i,o){super(t,i,o),this.model=n,this.chromeAdapter=s,this.params=i,this.requestOptions=o,i?.history&&(Ms(i.history),this._history=T(i.history)),this.params?.systemInstruction!=null&&(this.params={...this.params,systemInstruction:Le(this.params.systemInstruction)})}_formatRequest(t,n){return{safetySettings:this.params?.safetySettings,generationConfig:this.params?.generationConfig,tools:this.params?.tools,toolConfig:this.params?.toolConfig,systemInstruction:this.params?.systemInstruction,contents:[...this._history,...n,t]}}_callGenerateContent(t,n){return It(this._apiSettings,this.model,t,this.chromeAdapter,{...this.requestOptions,...n})}_callGenerateContentStream(t,n){return wt(this._apiSettings,this.model,t,this.chromeAdapter,{...this.requestOptions,...n})}async sendMessage(t,n){return this._sendMessage(t,n)}async sendMessageStream(t,n){return this._sendMessageStream(t,n)}};async function Ps(e,t,n,s){n=Es(n);let i="";if(e.backend.backendType===R.GOOGLE_AI){let r=ys(n,t);i=JSON.stringify(r)}else i=JSON.stringify(n);return(await ve({model:t,task:"countTokens",apiSettings:e,stream:!1,singleRequestOptions:s},i)).json()}async function xs(e,t,n,s,i){if(s?.mode===b.ONLY_ON_DEVICE)throw new d(u.UNSUPPORTED,"countTokens() is not supported for on-device models.");return Ps(e,t,n,i)}var Ne=class extends Ie{constructor(t,n,s,i){super(t,n.model),this.chromeAdapter=i,this.generationConfig=n.generationConfig||{},ks(this.generationConfig),this.safetySettings=n.safetySettings||[],this.tools=n.tools,this.toolConfig=n.toolConfig,this.systemInstruction=Le(n.systemInstruction),this.requestOptions=s||{}}async initializeDeviceModel(t){if(!this.chromeAdapter||this.chromeAdapter.mode===b.ONLY_IN_CLOUD)return;if(await this.chromeAdapter.downloadIfAvailable(t)===I.UNAVAILABLE){let s=new d(u.API_NOT_ENABLED,"Local LanguageModel API not available in this environment.");if(this.chromeAdapter.mode===b.ONLY_ON_DEVICE)throw s;g.debug(s.message)}await this.chromeAdapter.downloadPromise}async generateContent(t,n){let s=Ae(t);return It(this._apiSettings,this.model,{generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,...s},this.chromeAdapter,{...this.requestOptions,...n})}async generateContentStream(t,n){let s=Ae(t),{stream:i,response:o}=await wt(this._apiSettings,this.model,{generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,...s},this.chromeAdapter,{...this.requestOptions,...n});return{stream:i,response:o}}startChat(t){return new De(this._apiSettings,this.model,this.chromeAdapter,{tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,generationConfig:this.generationConfig,safetySettings:this.safetySettings,...t},this.requestOptions)}async countTokens(t,n){let s=Ae(t);return xs(this._apiSettings,this.model,s,this.chromeAdapter,{...this.requestOptions,...n})}};function ks(e){if(e.thinkingConfig?.thinkingBudget!=null&&e.thinkingConfig?.thinkingLevel)throw new d(u.UNSUPPORTED,"Cannot set both thinkingBudget and thinkingLevel in a config.");if(e.responseSchema!=null&&e.responseJsonSchema!=null)throw new d(u.UNSUPPORTED,"Cannot set both responseSchema and responseJsonSchema in a config.");if((e.responseSchema!=null||e.responseJsonSchema!=null)&&e.responseMimeType!=="application/json"&&e.responseMimeType!=="text/x.enum")throw new d(u.UNSUPPORTED,'responseMimeType must be set to "application/json" or "text/x.enum" if responseSchema or responseJsonSchema are set.')}var Us="audio-processor",Ni=`
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
  registerProcessor('${Us}', AudioProcessor);
`;function Rt(e=rt(),t){e=We(e);let n=it(e,k),s=t?.backend??new M,i=is(s),o=n.getImmediate({identifier:i}),r=o.options;if(r){let a=t?.useLimitedUseAppCheckTokens,c=!!r.useLimitedUseAppCheckTokens;if(a!=null&&!!a!==c)throw new d(u.ALREADY_INITIALIZED,`getAI() has already been called for app "${e.name}" and this backend with useLimitedUseAppCheckTokens: ${c}. This option cannot be changed after the AI instance has been initialized. Pass the desired options to the first getAI() call for this app and backend, or omit useLimitedUseAppCheckTokens to reuse the existing instance.`);return o}return o.options={useLimitedUseAppCheckTokens:t?.useLimitedUseAppCheckTokens??!1},o}var Fs=["mode","onDeviceParams","inCloudParams"];function Tt(e,t,n){let s=t,i;if(s.mode){for(let a of Object.keys(t))Fs.includes(a)||g.warn(`When a hybrid inference mode is specified (mode is currently set to ${s.mode}), "${a}" cannot be configured at the top level. Configuration for in-cloud and on-device must be done separately in inCloudParams and onDeviceParams. Configuration values set outside of inCloudParams and onDeviceParams will be ignored.`);i=s.inCloudParams||{model:ss}}else i=t;if(!i.model)throw new d(u.NO_MODEL,"Must provide a model name. Example: getGenerativeModel({ model: 'my-model-name' })");let o=e.chromeAdapterFactory?.(s.mode,typeof window>"u"?void 0:window,s.onDeviceParams),r=new Ne(e,i,n,o);return r._apiSettings.inferenceMode=s.mode,r}function Bs(){$(new A(k,as,"PUBLIC").setMultipleInstances(!0)),D(lt,Ce),D(lt,Ce,"esm2020")}Bs();var P=e=>e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),E={NAME:"NAME",DOCTOR:"DOCTOR",FACILITY:"FACILITY",ADDRESS:"ADDRESS",ID:"ID",CONTACT:"CONTACT",DOB:"DOB"},$s=[{type:E.CONTACT,re:/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g},{type:E.CONTACT,re:/(?:\+91[\s-]?|\b0)?[6-9]\d{4}[\s-]?\d{5}\b/g},{type:E.ID,re:/\b\d{4}[\s-]\d{4}[\s-]\d{4}\b/g},{type:E.ID,re:/\b[A-Z]{5}\d{4}[A-Z]\b/g}],Hs=[{type:E.NAME,re:/\b(?:Patient(?:'s)?\s*Name|Name\s*of\s*Patient|Pt\.?\s*Name|Name)\s*[:\-]\s*([^\n\r]+?)(?=\s{2,}|\t|\s+(?:Age|Sex|Gender|DOB|UHID|MRN)\b|$)/gim},{type:E.DOCTOR,re:/\b(?:Ref(?:erred|erring)?\.?\s*(?:By|Doctor|Dr\.?)|Consultant|Doctor|Physician|Pathologist)\s*[:\-]\s*([^\n\r]+?)(?=\s{2,}|\t|$)/gim},{type:E.DOCTOR,re:/\bDr\.? ?[A-Z][a-zA-Z.]*(?: [A-Z][a-zA-Z.]+){0,2}/g,whole:!0},{type:E.ID,re:/\b(?:UHID|MRN|MR\s*No|Patient\s*ID|Reg(?:istration)?\.?\s*No|Lab\s*(?:No|ID)|Sample\s*(?:No|ID)|Bill\s*No|Accession\s*No|Barcode|IP\s*No|OP\s*No)\.?\s*[:#\-]?\s*([A-Z0-9][A-Z0-9\/\-]{3,})/gi},{type:E.DOB,re:/\b(?:DOB|D\.O\.B\.?|Date\s*of\s*Birth)\s*[:\-]?\s*(\d{1,2}[\/\-.\s](?:\d{1,2}|[A-Za-z]{3,9})[\/\-.\s]\d{2,4})/gi},{type:E.ADDRESS,re:/\b(?:Address|Addr)[ \t]*[:\-][ \t]*([^\n\r]+)/gi},{type:E.ADDRESS,re:/\b(?:City|Town|Locality|Area|Village|Taluk|District|Dist|Landmark)[ \t]*:[ \t]*([A-Za-z][A-Za-z .'-]{1,40}?)[ \t]*(?=\s{2,}|[A-Z]{3,}[ \t]*:|$)/gim},{type:E.ADDRESS,re:/^[ \t]*([^\n:]{0,60}\b(?:Road|Rd|Street|Circle|Cross|Layout|Nagar|Lane|Marg|Colony|Sector|Phase|Stage|Extension|Apartments?|Residency|Society)\b[^\n]{0,80}?)[ \t,]*$/gim},{type:E.ADDRESS,re:/^[ \t]*([A-Z][A-Za-z]{2,}[ \t]*-[ \t]*\d{2,6})\b/gm},{type:E.CONTACT,re:/\b(?:Ph|Phone|Tel|Telephone|Mob|Mobile|Contact|Cell)\.?\s*(?:No\.?)?\s*[:\-]?\s*(\+?\d[\d\s\-]{6,16}\d)/gi},{type:E.FACILITY,re:/^[ \t]*([A-Za-z][A-Za-z.&' -]{2,60}\b(?:Diagnostics?|Laborator(?:y|ies)|Labs?|Hospitals?|Clinic|Centre|Center|Pathology|Healthcare|Medical|Imaging|Scans?|Nursing Home)\b[A-Za-z.&' -]{0,40}?)[ \t]*(?=\s{2,}|$)/gim},{type:E.ADDRESS,re:/^[ \t]*([A-Za-z0-9][^\n\r:]{4,80}?\b[1-9]\d{2}\s?\d{3})\b/gm}],ke=/^(na|n\/a|nil|none|nan|op|ip|electrolytes|biochemistry|haematology|hematology|lipid profile|lipid|profile|kidney|liver|thyroid|function|tests?|panel|routine|examination|serology|immunology|diabetes|complete|count|differential|hormones?|vitamins?|minerals|enzymes|cardiac|iron studies|urine|stool|summary|investigation|department|specimen|method|technology|units?|value|interval|name|names|patient|address|addr|ref|ref\.? by|self|doctor|dr|consultant|landmark|locality|city|state|area|age|sex|gender|sample|barcode|date|report|male|female|m|f|years?|yrs?|normal|high|low|positive|negative|fasting|serum|plasma|blood|urine|report|test|result|hemoglobin|haemoglobin|glucose|cholesterol|platelets?|wbc|rbc|tsh|hba1c|creatinine|vitamin\s*\w+)$/i;function Nt(e){let t=[];for(let{type:n,re:s}of $s)for(let i of e.matchAll(s))t.push({text:i[0].trim(),type:n,source:"pattern"});for(let{type:n,re:s,whole:i}of Hs)for(let o of e.matchAll(s)){let r=(i?o[0]:o[1]||"").trim().replace(/[,;.]+$/,"");n===E.ADDRESS&&/\d\s*(?:mg|g\/dl|u\/l|iu|meq|mmol|ng|pg|µ|%|cells|lakh|\/cumm|fl\b)/i.test(r)||r&&t.push({text:r,type:n,source:"pattern"})}return vt(t,e)}function Gs(e,t){let n=String(e).trim();return/[\n\r]/.test(n)&&(n=n.split(/[\n\r]/)[0].trim()),n=n.replace(/^[A-Za-z][A-Za-z .'\/]{1,28}:\s+/,""),n=n.replace(/^(?:reported|referred|ref\.?|signed|verified|checked|authori[sz]ed)\s+by\s*:?\s*/i,""),(t==="DOCTOR"||t==="NAME")&&(n=n.replace(/,\s*(?:MD|MBBS|DM|MS|DNB|MCh|FRCP|PhD)\b.*$/i,"")),n.replace(/[,;:.]+$/,"").trim()}var Dt=/\b(?:reports?|reported|was|were|is|are|has|have|had|kindly|advised|please|correlate|shows?|noted|for|with)\b/i,U=e=>e.split(/\s+/).filter(Boolean).length;function Vs(e,t){switch(t){case"DOB":return/\d{1,2}[\/\-. ](?:\d{1,2}|[A-Za-z]{3,9})[\/\-. ]\d{2,4}/.test(e);case"CONTACT":return e.includes("@")||(e.match(/\d/g)||[]).length>=7;case"ID":return/\d/.test(e)&&e.length>=4&&U(e)<=3;case"NAME":case"DOCTOR":return U(e)<=5&&!/\d/.test(e)&&!Dt.test(e);case"FACILITY":return U(e)<=8&&!Dt.test(e);case"ADDRESS":return U(e)<=18;default:return!1}}function vt(e,t){let n=new Set,s=[],i=t.toLowerCase();for(let o of e||[]){if(!o||typeof o.text!="string")continue;let r=E[o.type]||"NAME",a=o.source==="you"?o.text.trim():Gs(o.text,r);if(a.length<2||a.length>120||ke.test(a)||/^\d+(\.\d+)?\s*%?$/.test(a)&&a.length<6&&!(o.source==="pattern"&&r==="ID")||o.source!=="you"&&!Vs(a,r)||!i.includes(a.toLowerCase()))continue;let c=a.toLowerCase();n.has(c)||(n.add(c),s.push({text:a,type:r,source:o.source||"model"}))}return Js(zs(qs(s.map(o=>js(Ws(o,t),t)),t),t),t)}function js(e,t){if(e.type!=="ADDRESS")return e;let n=t.match(new RegExp(`(?:^|[\\s,:])((?:#\\s?)?\\d[\\dA-Za-z/-]{0,8}[ ,]+)${P(e.text)}`,"im"));return n?{...e,text:n[1]+e.text}:e}function Ws(e,t){if(e.type!=="FACILITY")return e;let n=t.split(/\r?\n/).find(o=>o.toLowerCase().includes(e.text.toLowerCase()));if(!n)return e;let s=n.trim(),i=s.toLowerCase().replace(e.text.toLowerCase(),"").trim();return i&&U(i)<=4&&!/[\d:]/.test(i)&&U(s)<=9?{...e,text:s}:e}var Ys=/^(road|rd|main|cross|street|st|lane|ln|new|old|near|opp|opposite|behind|city|locality|landmark|layout|stage|phase|block|sector|flat|house|h\.?no|no|floor|area|dist|district|taluk|state|india|colony|apartment|apartments|residency|hills|nagar|extension|ext|post|po|village|town|west|east|north|south|the|and|of)$/i;function zs(e,t){let n=t;for(let o of e)n=n.split(new RegExp(P(o.text),"gi")).join(" ");let s=new Set(e.map(o=>o.text.toLowerCase())),i=[];for(let o of e)if(!(o.type!=="ADDRESS"&&o.type!=="FACILITY"))for(let r of o.text.split(/[\s,.:;()\/-]+/))r.length<4||/\d/.test(r)||Ys.test(r)||ke.test(r)||s.has(r.toLowerCase())||o.type==="FACILITY"&&/^(diagnostics?|laborator(y|ies)|labs?|hospitals?|clinic|centre|center|pathology|healthcare|medical|research|imaging|scans?|technologies|ltd|limited|pvt)$/i.test(r)||new RegExp(`\\b${P(r)}\\b`,"i").test(n)&&(s.add(r.toLowerCase()),i.push({text:r,type:o.type,source:"pattern"}));return e.concat(i)}function Js(e,t){return e.filter(n=>{let s=e.filter(o=>o!==n&&o.text.length>n.text.length&&o.text.toLowerCase().includes(n.text.toLowerCase()));if(!s.length)return!0;let i=t;for(let o of s)i=i.split(new RegExp(P(o.text),"gi")).join(" ");return i.toLowerCase().includes(n.text.toLowerCase())})}var Ks=/^(mr|mrs|ms|miss|dr|shri|smt|sri|kumari|master|baby|md|prof)\.?$/i;function qs(e,t){let n=t;for(let o of e)n=n.split(new RegExp(P(o.text),"gi")).join(" ");let s=new Set(e.map(o=>o.text.toLowerCase())),i=[];for(let o of e)if(!(o.type!=="NAME"&&o.type!=="DOCTOR"))for(let r of o.text.split(/[\s.]+/))r.length<3||Ks.test(r)||ke.test(r)||s.has(r.toLowerCase())||new RegExp(`\\b${P(r)}\\b`,"i").test(n)&&(s.add(r.toLowerCase()),i.push({text:r,type:o.type,source:"pattern"}));return e.concat(i)}function Lt(e,t,n){return vt([...e||[],...t||[]],n)}function Mt(e,t){let n=[...t].sort((a,c)=>c.text.length-a.text.length),s={},i={},o={},r=e;for(let a of n){let c=a.text.toLowerCase();if(!o[c]){s[a.type]=(s[a.type]||0)+1;let f=`[${a.type}_${s[a.type]}]`;o[c]=f,i[f]=a.text}let l=/^\w+$/.test(a.text)?"\\b":"";r=r.replace(new RegExp(l+P(a.text)+l,"gi"),o[c])}return{sealed:r,map:i}}function Pt(e,t=2800){let n=[],s=e;for(;s.length>t;){let i=s.lastIndexOf(`
`,t);i<t*.5&&(i=t),n.push(s.slice(0,i)),s=s.slice(i)}return s.trim()&&n.push(s),n}function xt(e){if(!e)return null;let t=String(e).replace(/^```(?:json)?/i,"").replace(/```$/,"").trim();try{return JSON.parse(t)}catch{}let n=t.indexOf("{"),s=t.lastIndexOf("}");if(n>=0&&s>n)try{return JSON.parse(t.slice(n,s+1))}catch{}return null}var Zs={apiKey:"AIzaSyBNhTUtYR2NrarGlhKCs84yC1quvaEruWk",authDomain:"sealed-hybrid-ai.firebaseapp.com",projectId:"sealed-hybrid-ai",storageBucket:"sealed-hybrid-ai.firebasestorage.app",messagingSenderId:"864197298923",appId:"1:864197298923:web:6112612c5cc5f073a28cae"},kt={expectedInputs:[{type:"text",languages:["en"]}],expectedOutputs:[{type:"text",languages:["en"]}]},Qs={type:"object",properties:{entities:{type:"array",items:{type:"object",properties:{text:{type:"string"},type:{type:"string",enum:["NAME","DOCTOR","FACILITY","ADDRESS","ID","CONTACT","DOB"]}},required:["text","type"]}}},required:["entities"]},Xs=e=>`List the personal identifiers in this medical document: names of the patient, relatives and doctors; hospital and lab names; street addresses; ID numbers; phone numbers; emails; dates of birth.
Copy only the identifying words exactly as written, never the field label or a whole sentence. Never list tests, results, units, ranges, age or sex.
Return JSON: {"entities":[{"text":"...","type":"NAME|DOCTOR|FACILITY|ADDRESS|ID|CONTACT|DOB"}]}

DOCUMENT:
${e}`,ee=null;function ei(){if(ee)return ee;let e=be(Zs,"sealed-extension"),t=Rt(e,{backend:new M});return ee=Tt(t,{mode:b.ONLY_ON_DEVICE,onDeviceParams:{createOptions:kt,promptOptions:{responseConstraint:Qs}}}),ee}async function ti(){try{return"LanguageModel"in self?await self.LanguageModel.availability(kt):"unavailable"}catch{return"unavailable"}}async function Ut(e){let t=Nt(e),n=!1;if(await ti()==="available")try{let o=ei();try{await o.initializeDeviceModel?.()}catch{}let r=[];for(let a of Pt(e,2400)){let c=await o.generateContent(Xs(a)),l=xt(c.response.text());l?.entities&&(r=r.concat(l.entities))}t=Lt(t,r,e),n=!0}catch(o){console.warn("[Sealed] on-device model could not run; pattern rules only.",o)}let{sealed:s,map:i}=Mt(e,t);return{sealed:s,map:i,count:Object.keys(i).length,usedModel:n}}chrome.runtime.onMessage.addListener((e,t,n)=>e?.target!=="offscreen"||e.type!=="seal"?!1:(Ut(e.text).then(s=>n({ok:!0,...s})).catch(s=>n({ok:!1,error:String(s?.message||s)})),!0));
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
