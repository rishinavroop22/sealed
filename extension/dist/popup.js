var $e=()=>{};var Ge=function(e){let t=[],n=0;for(let s=0;s<e.length;s++){let i=e.charCodeAt(s);i<128?t[n++]=i:i<2048?(t[n++]=i>>6|192,t[n++]=i&63|128):(i&64512)===55296&&s+1<e.length&&(e.charCodeAt(s+1)&64512)===56320?(i=65536+((i&1023)<<10)+(e.charCodeAt(++s)&1023),t[n++]=i>>18|240,t[n++]=i>>12&63|128,t[n++]=i>>6&63|128,t[n++]=i&63|128):(t[n++]=i>>12|224,t[n++]=i>>6&63|128,t[n++]=i&63|128)}return t},Gt=function(e){let t=[],n=0,s=0;for(;n<e.length;){let i=e[n++];if(i<128)t[s++]=String.fromCharCode(i);else if(i>191&&i<224){let o=e[n++];t[s++]=String.fromCharCode((i&31)<<6|o&63)}else if(i>239&&i<365){let o=e[n++],r=e[n++],a=e[n++],c=((i&7)<<18|(o&63)<<12|(r&63)<<6|a&63)-65536;t[s++]=String.fromCharCode(55296+(c>>10)),t[s++]=String.fromCharCode(56320+(c&1023))}else{let o=e[n++],r=e[n++];t[s++]=String.fromCharCode((i&15)<<12|(o&63)<<6|r&63)}}return t.join("")},Ve={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(e,t){if(!Array.isArray(e))throw Error("encodeByteArray takes an array as a parameter");this.init_();let n=t?this.byteToCharMapWebSafe_:this.byteToCharMap_,s=[];for(let i=0;i<e.length;i+=3){let o=e[i],r=i+1<e.length,a=r?e[i+1]:0,c=i+2<e.length,l=c?e[i+2]:0,f=o>>2,m=(o&3)<<4|a>>4,g=(a&15)<<2|l>>6,j=l&63;c||(j=64,r||(g=64)),s.push(n[f],n[m],n[g],n[j])}return s.join("")},encodeString(e,t){return this.HAS_NATIVE_SUPPORT&&!t?btoa(e):this.encodeByteArray(Ge(e),t)},decodeString(e,t){return this.HAS_NATIVE_SUPPORT&&!t?atob(e):Gt(this.decodeStringToByteArray(e,t))},decodeStringToByteArray(e,t){this.init_();let n=t?this.charToByteMapWebSafe_:this.charToByteMap_,s=[];for(let i=0;i<e.length;){let o=n[e.charAt(i++)],a=i<e.length?n[e.charAt(i)]:0;++i;let l=i<e.length?n[e.charAt(i)]:64;++i;let m=i<e.length?n[e.charAt(i)]:64;if(++i,o==null||a==null||l==null||m==null)throw new ne;let g=o<<2|a>>4;if(s.push(g),l!==64){let j=a<<4&240|l>>2;if(s.push(j),m!==64){let Ht=l<<6&192|m;s.push(Ht)}}}return s},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let e=0;e<this.ENCODED_VALS.length;e++)this.byteToCharMap_[e]=this.ENCODED_VALS.charAt(e),this.charToByteMap_[this.byteToCharMap_[e]]=e,this.byteToCharMapWebSafe_[e]=this.ENCODED_VALS_WEBSAFE.charAt(e),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[e]]=e,e>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(e)]=e,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(e)]=e)}}},ne=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}},Vt=function(e){let t=Ge(e);return Ve.encodeByteArray(t,!0)},se=function(e){return Vt(e).replace(/\./g,"")},je=function(e){try{return Ve.decodeString(e,!0)}catch(t){console.error("base64Decode failed: ",t)}return null};function D(e){return We(void 0,e)}function We(e,t){if(!(t instanceof Object))return t;switch(t.constructor){case Date:let n=t;return new Date(n.getTime());case Object:e===void 0&&(e={});break;case Array:e=[];break;default:return t}for(let n in t)!t.hasOwnProperty(n)||!jt(n)||(e[n]=We(e[n],t[n]));return e}function jt(e){return e!=="__proto__"}function ie(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}var Wt=()=>ie().__FIREBASE_DEFAULTS__,Yt=()=>{if(typeof process>"u"||typeof process.env>"u")return;let e=process.env.__FIREBASE_DEFAULTS__;if(e)return JSON.parse(e)},zt=()=>{if(typeof document>"u")return;let e;try{e=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}let t=e&&je(e[1]);return t&&JSON.parse(t)},Jt=()=>{try{return $e()||Wt()||Yt()||zt()}catch(e){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${e}`);return}};var oe=()=>Jt()?.config;var B=class{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((t,n)=>{this.resolve=t,this.reject=n})}wrapCallback(t){return(n,s)=>{n?this.reject(n):this.resolve(s),typeof t=="function"&&(this.promise.catch(()=>{}),t.length===1?t(n):t(n,s))}}};function Ye(){try{return typeof indexedDB=="object"}catch{return!1}}function ze(){return new Promise((e,t)=>{try{let n=!0,s="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(s);i.onsuccess=()=>{i.result.close(),n||self.indexedDB.deleteDatabase(s),e(!0)},i.onupgradeneeded=()=>{n=!1},i.onerror=()=>{t(i.error?.message||"")}}catch(n){t(n)}})}var Kt="FirebaseError",C=class e extends Error{constructor(t,n,s){super(n),this.code=t,this.customData=s,this.name=Kt,Object.setPrototypeOf(this,e.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,$.prototype.create)}},$=class{constructor(t,n,s){this.service=t,this.serviceName=n,this.errors=s}create(t,...n){let s=n[0]||{},i=`${this.service}/${t}`,o=this.errors[t],r=o?qt(o,s):"Error",a=`${this.serviceName}: ${r} (${i}).`;return new C(i,a,s)}};function qt(e,t){try{let n=0,s="";for(;n<e.length;){let i=e.indexOf("{$",n);if(i===-1){s+=e.substring(n);break}let o=e.indexOf("}",i+2);if(o===-1){s+=e.substring(n);break}let r=e.substring(i+2,o),a=t[r];s+=e.substring(n,i)+(a!=null?String(a):`<${r}?>`),n=o+1}return s}catch{return e}}function W(e,t){if(e===t)return!0;let n=Object.keys(e),s=Object.keys(t);for(let i of n){if(!s.includes(i))return!1;let o=e[i],r=t[i];if(He(o)&&He(r)){if(!W(o,r))return!1}else if(o!==r)return!1}for(let i of s)if(!n.includes(i))return!1;return!0}function He(e){return e!==null&&typeof e=="object"}var ri=4*60*60*1e3;function Je(e){return e&&e._delegate?e._delegate:e}var A=class{constructor(t,n,s){this.name=t,this.instanceFactory=n,this.type=s,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(t){return this.instantiationMode=t,this}setMultipleInstances(t){return this.multipleInstances=t,this}setServiceProps(t){return this.serviceProps=t,this}setInstanceCreatedCallback(t){return this.onInstanceCreated=t,this}};var L="[DEFAULT]";var re=class{constructor(t,n){this.name=t,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(t){let n=this.normalizeInstanceIdentifier(t);if(!this.instancesDeferred.has(n)){let s=new B;if(this.instancesDeferred.set(n,s),this.isInitialized(n)||this.shouldAutoInitialize())try{let i=this.getOrInitializeService({instanceIdentifier:n});i&&s.resolve(i)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(t){let n=this.normalizeInstanceIdentifier(t?.identifier),s=t?.optional??!1;if(this.isInitialized(n)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:n})}catch(i){if(s)return null;throw i}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(t){if(t.name!==this.name)throw Error(`Mismatching Component ${t.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=t,!!this.shouldAutoInitialize()){if(Qt(t))try{this.getOrInitializeService({instanceIdentifier:L})}catch{}for(let[n,s]of this.instancesDeferred.entries()){let i=this.normalizeInstanceIdentifier(n);try{let o=this.getOrInitializeService({instanceIdentifier:i});s.resolve(o)}catch{}}}}clearInstance(t=L){this.instancesDeferred.delete(t),this.instancesOptions.delete(t),this.instances.delete(t)}async delete(){let t=Array.from(this.instances.values());await Promise.all([...t.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...t.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(t=L){return this.instances.has(t)}getOptions(t=L){return this.instancesOptions.get(t)||{}}initialize(t={}){let{options:n={}}=t,s=this.normalizeInstanceIdentifier(t.instanceIdentifier);if(this.isInitialized(s))throw Error(`${this.name}(${s}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);let i=this.getOrInitializeService({instanceIdentifier:s,options:n});for(let[o,r]of this.instancesDeferred.entries()){let a=this.normalizeInstanceIdentifier(o);s===a&&r.resolve(i)}return i}onInit(t,n){let s=this.normalizeInstanceIdentifier(n),i=this.onInitCallbacks.get(s)??new Set;i.add(t),this.onInitCallbacks.set(s,i);let o=this.instances.get(s);return o&&t(o,s),()=>{i.delete(t)}}invokeOnInitCallbacks(t,n){let s=this.onInitCallbacks.get(n);if(s)for(let i of s)try{i(t,n)}catch{}}getOrInitializeService({instanceIdentifier:t,options:n={}}){let s=this.instances.get(t);if(!s&&this.component&&(s=this.component.instanceFactory(this.container,{instanceIdentifier:Zt(t),options:n}),this.instances.set(t,s),this.instancesOptions.set(t,n),this.invokeOnInitCallbacks(s,t),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,t,s)}catch{}return s||null}normalizeInstanceIdentifier(t=L){return this.component?this.component.multipleInstances?t:L:t}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}};function Zt(e){return e===L?void 0:e}function Qt(e){return e.instantiationMode==="EAGER"}var Y=class{constructor(t){this.name=t,this.providers=new Map}addComponent(t){let n=this.getProvider(t.name);if(n.isComponentSet())throw new Error(`Component ${t.name} has already been registered with ${this.name}`);n.setComponent(t)}addOrOverwriteComponent(t){this.getProvider(t.name).isComponentSet()&&this.providers.delete(t.name),this.addComponent(t)}getProvider(t){if(this.providers.has(t))return this.providers.get(t);let n=new re(t,this);return this.providers.set(t,n),n}getProviders(){return Array.from(this.providers.values())}};var Xt=[],h;(function(e){e[e.DEBUG=0]="DEBUG",e[e.VERBOSE=1]="VERBOSE",e[e.INFO=2]="INFO",e[e.WARN=3]="WARN",e[e.ERROR=4]="ERROR",e[e.SILENT=5]="SILENT"})(h||(h={}));var en={debug:h.DEBUG,verbose:h.VERBOSE,info:h.INFO,warn:h.WARN,error:h.ERROR,silent:h.SILENT},tn=h.INFO,nn={[h.DEBUG]:"log",[h.VERBOSE]:"log",[h.INFO]:"info",[h.WARN]:"warn",[h.ERROR]:"error"},sn=(e,t,...n)=>{if(t<e.logLevel)return;let s=new Date().toISOString(),i=nn[t];if(i)console[i](`[${s}]  ${e.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${t})`)},k=class{constructor(t){this.name=t,this._logLevel=tn,this._logHandler=sn,this._userLogHandler=null,Xt.push(this)}get logLevel(){return this._logLevel}set logLevel(t){if(!(t in h))throw new TypeError(`Invalid value "${t}" assigned to \`logLevel\``);this._logLevel=t}setLogLevel(t){this._logLevel=typeof t=="string"?en[t]:t}get logHandler(){return this._logHandler}set logHandler(t){if(typeof t!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=t}get userLogHandler(){return this._userLogHandler}set userLogHandler(t){this._userLogHandler=t}debug(...t){this._userLogHandler&&this._userLogHandler(this,h.DEBUG,...t),this._logHandler(this,h.DEBUG,...t)}log(...t){this._userLogHandler&&this._userLogHandler(this,h.VERBOSE,...t),this._logHandler(this,h.VERBOSE,...t)}info(...t){this._userLogHandler&&this._userLogHandler(this,h.INFO,...t),this._logHandler(this,h.INFO,...t)}warn(...t){this._userLogHandler&&this._userLogHandler(this,h.WARN,...t),this._logHandler(this,h.WARN,...t)}error(...t){this._userLogHandler&&this._userLogHandler(this,h.ERROR,...t),this._logHandler(this,h.ERROR,...t)}};var on=(e,t)=>t.some(n=>e instanceof n),Ke,qe;function rn(){return Ke||(Ke=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function an(){return qe||(qe=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}var Ze=new WeakMap,ce=new WeakMap,Qe=new WeakMap,ae=new WeakMap,ue=new WeakMap;function cn(e){let t=new Promise((n,s)=>{let i=()=>{e.removeEventListener("success",o),e.removeEventListener("error",r)},o=()=>{n(S(e.result)),i()},r=()=>{s(e.error),i()};e.addEventListener("success",o),e.addEventListener("error",r)});return t.then(n=>{n instanceof IDBCursor&&Ze.set(n,e)}).catch(()=>{}),ue.set(t,e),t}function ln(e){if(ce.has(e))return;let t=new Promise((n,s)=>{let i=()=>{e.removeEventListener("complete",o),e.removeEventListener("error",r),e.removeEventListener("abort",r)},o=()=>{n(),i()},r=()=>{s(e.error||new DOMException("AbortError","AbortError")),i()};e.addEventListener("complete",o),e.addEventListener("error",r),e.addEventListener("abort",r)});ce.set(e,t)}var le={get(e,t,n){if(e instanceof IDBTransaction){if(t==="done")return ce.get(e);if(t==="objectStoreNames")return e.objectStoreNames||Qe.get(e);if(t==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return S(e[t])},set(e,t,n){return e[t]=n,!0},has(e,t){return e instanceof IDBTransaction&&(t==="done"||t==="store")?!0:t in e}};function Xe(e){le=e(le)}function un(e){return e===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(t,...n){let s=e.call(z(this),t,...n);return Qe.set(s,t.sort?t.sort():[t]),S(s)}:an().includes(e)?function(...t){return e.apply(z(this),t),S(Ze.get(this))}:function(...t){return S(e.apply(z(this),t))}}function dn(e){return typeof e=="function"?un(e):(e instanceof IDBTransaction&&ln(e),on(e,rn())?new Proxy(e,le):e)}function S(e){if(e instanceof IDBRequest)return cn(e);if(ae.has(e))return ae.get(e);let t=dn(e);return t!==e&&(ae.set(e,t),ue.set(t,e)),t}var z=e=>ue.get(e);function tt(e,t,{blocked:n,upgrade:s,blocking:i,terminated:o}={}){let r=indexedDB.open(e,t),a=S(r);return s&&r.addEventListener("upgradeneeded",c=>{s(S(r.result),c.oldVersion,c.newVersion,S(r.transaction),c)}),n&&r.addEventListener("blocked",c=>n(c.oldVersion,c.newVersion,c)),a.then(c=>{o&&c.addEventListener("close",()=>o()),i&&c.addEventListener("versionchange",l=>i(l.oldVersion,l.newVersion,l))}).catch(()=>{}),a}var fn=["get","getKey","getAll","getAllKeys","count"],hn=["put","add","delete","clear"],de=new Map;function et(e,t){if(!(e instanceof IDBDatabase&&!(t in e)&&typeof t=="string"))return;if(de.get(t))return de.get(t);let n=t.replace(/FromIndex$/,""),s=t!==n,i=hn.includes(n);if(!(n in(s?IDBIndex:IDBObjectStore).prototype)||!(i||fn.includes(n)))return;let o=async function(r,...a){let c=this.transaction(r,i?"readwrite":"readonly"),l=c.store;return s&&(l=l.index(a.shift())),(await Promise.all([l[n](...a),i&&c.done]))[0]};return de.set(t,o),o}Xe(e=>({...e,get:(t,n,s)=>et(t,n)||e.get(t,n,s),has:(t,n)=>!!et(t,n)||e.has(t,n)}));var he=class{constructor(t){this.container=t}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(pn(n)){let s=n.getImmediate();return`${s.library}/${s.version}`}else return null}).filter(n=>n).join(" ")}};function pn(e){return e.getComponent()?.type==="VERSION"}var pe="@firebase/app",nt="0.16.6";var I=new k("@firebase/app"),mn="@firebase/app-compat",gn="@firebase/analytics-compat",En="@firebase/analytics",yn="@firebase/app-check-compat",bn="@firebase/app-check",_n="@firebase/auth",Sn="@firebase/auth-compat",On="@firebase/crashlytics",Cn="@firebase/database",An="@firebase/data-connect",wn="@firebase/database-compat",In="@firebase/functions",Rn="@firebase/functions-compat",Tn="@firebase/installations",Dn="@firebase/installations-compat",Nn="@firebase/messaging",vn="@firebase/messaging-compat",Ln="@firebase/performance",Mn="@firebase/performance-compat",Pn="@firebase/remote-config",xn="@firebase/remote-config-compat",kn="@firebase/storage",Un="@firebase/storage-compat",Fn="@firebase/firestore",Bn="@firebase/ai",$n="@firebase/firestore-compat",Hn="firebase";var me="[DEFAULT]",Gn={[pe]:"fire-core",[mn]:"fire-core-compat",[En]:"fire-analytics",[gn]:"fire-analytics-compat",[bn]:"fire-app-check",[yn]:"fire-app-check-compat",[_n]:"fire-auth",[Sn]:"fire-auth-compat",[On]:"fire-cls",[Cn]:"fire-rtdb",[An]:"fire-data-connect",[wn]:"fire-rtdb-compat",[In]:"fire-fn",[Rn]:"fire-fn-compat",[Tn]:"fire-iid",[Dn]:"fire-iid-compat",[Nn]:"fire-fcm",[vn]:"fire-fcm-compat",[Ln]:"fire-perf",[Mn]:"fire-perf-compat",[Pn]:"fire-rc",[xn]:"fire-rc-compat",[kn]:"fire-gcs",[Un]:"fire-gcs-compat",[Fn]:"fire-fst",[$n]:"fire-fst-compat",[Bn]:"fire-vertex","fire-js":"fire-js",[Hn]:"fire-js-all"};var J=new Map,Vn=new Map,ge=new Map;function st(e,t){try{e.container.addComponent(t)}catch(n){I.debug(`Component ${t.name} failed to register with FirebaseApp ${e.name}`,n)}}function H(e){let t=e.name;if(ge.has(t))return I.debug(`There were multiple attempts to register component ${t}.`),!1;ge.set(t,e);for(let n of J.values())st(n,e);for(let n of Vn.values())st(n,e);return!0}function at(e,t){let n=e.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),e.container.getProvider(t)}function ct(e){return e==null?!1:e.settings!==void 0}var jn={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different {$mismatchedParam}. Existing: '{$oldValue}'. New: '{$newValue}'.","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},w=new $("app","Firebase",jn);var Ee=class{constructor(t,n,s){this._isDeleted=!1,this._options={...t},this._config={...n},this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=s,this.container.addComponent(new A("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(t){this.checkDestroyed(),this._automaticDataCollectionEnabled=t}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(t){this._isDeleted=t}checkDestroyed(){if(this.isDeleted)throw w.create("app-deleted",{appName:this._name})}};function _e(e,t={}){let n=e;typeof t!="object"&&(t={name:t});let s={name:me,automaticDataCollectionEnabled:!0,...t},i=s.name;if(typeof i!="string"||!i)throw w.create("bad-app-name",{appName:String(i)});if(n||(n=oe()),!n)throw w.create("no-options");let o=J.get(i);if(o)if(W(n,o.options)){if(W(s,o.config))return o;throw w.create("duplicate-app",{appName:i,mismatchedParam:"config",oldValue:JSON.stringify(o.config),newValue:JSON.stringify(s)})}else throw w.create("duplicate-app",{appName:i,mismatchedParam:"options",oldValue:JSON.stringify(o.options),newValue:JSON.stringify(n)});let r=new Y(i);for(let c of ge.values())r.addComponent(c);let a=new Ee(n,s,r);return J.set(i,a),a}function lt(e=me){let t=J.get(e);if(!t&&e===me&&oe())return _e();if(!t)throw w.create("no-app",{appName:e});return t}function N(e,t,n){let s=Gn[e]??e;n&&(s+=`-${n}`);let i=s.match(/\s|\//),o=t.match(/\s|\//);if(i||o){let r=[`Unable to register library "${s}" with version "${t}":`];i&&r.push(`library name "${s}" contains illegal characters (whitespace or "/")`),i&&o&&r.push("and"),o&&r.push(`version name "${t}" contains illegal characters (whitespace or "/")`),I.warn(r.join(" "));return}H(new A(`${s}-version`,()=>({library:s,version:t}),"VERSION"))}var Wn="firebase-heartbeat-database",Yn=1,G="firebase-heartbeat-store",fe=null;function ut(){return fe||(fe=tt(Wn,Yn,{upgrade:(e,t)=>{switch(t){case 0:try{e.createObjectStore(G)}catch(n){console.warn(n)}}}}).catch(e=>{throw w.create("idb-open",{originalErrorMessage:e.message})})),fe}async function zn(e){try{let n=(await ut()).transaction(G),s=await n.objectStore(G).get(dt(e));return await n.done,s}catch(t){if(t instanceof C)I.warn(t.message);else{let n=w.create("idb-get",{originalErrorMessage:t?.message});I.warn(n.message)}}}async function it(e,t){try{let s=(await ut()).transaction(G,"readwrite");await s.objectStore(G).put(t,dt(e)),await s.done}catch(n){if(n instanceof C)I.warn(n.message);else{let s=w.create("idb-set",{originalErrorMessage:n?.message});I.warn(s.message)}}}function dt(e){return`${e.name}!${e.options.appId}`}var Jn=1024,Kn=30,ye=class{constructor(t){this.container=t,this._heartbeatsCache=null;let n=this.container.getProvider("app").getImmediate();this._storage=new be(n),this._heartbeatsCachePromise=this._storage.read().then(s=>(this._heartbeatsCache=s,s))}async triggerHeartbeat(){try{let n=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=ot();if(this._heartbeatsCache?.heartbeats==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(i=>i.date===s))return;if(this._heartbeatsCache.heartbeats.push({date:s,agent:n}),this._heartbeatsCache.heartbeats.length>Kn){let i=Zn(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(i,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(t){I.warn(t)}}async getHeartbeatsHeader(){try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null||this._heartbeatsCache.heartbeats.length===0)return"";let t=ot(),{heartbeatsToSend:n,unsentEntries:s}=qn(this._heartbeatsCache.heartbeats),i=se(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return I.warn(t),""}}};function ot(){return new Date().toISOString().substring(0,10)}function qn(e,t=Jn){let n=[],s=e.slice();for(let i of e){let o=n.find(r=>r.agent===i.agent);if(o){if(o.dates.push(i.date),rt(n)>t){o.dates.pop();break}}else if(n.push({agent:i.agent,dates:[i.date]}),rt(n)>t){n.pop();break}s=s.slice(1)}return{heartbeatsToSend:n,unsentEntries:s}}var be=class{constructor(t){this.app=t,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Ye()?ze().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){let n=await zn(this.app);return n?.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(t){if(await this._canUseIndexedDBPromise){let s=await this.read();return it(this.app,{lastSentHeartbeatDate:t.lastSentHeartbeatDate??s.lastSentHeartbeatDate,heartbeats:t.heartbeats})}else return}async add(t){if(await this._canUseIndexedDBPromise){let s=await this.read();return it(this.app,{lastSentHeartbeatDate:t.lastSentHeartbeatDate??s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...t.heartbeats]})}else return}};function rt(e){return se(JSON.stringify({version:2,heartbeats:e})).length}function Zn(e){if(e.length===0)return-1;let t=0,n=e[0].date;for(let s=1;s<e.length;s++)e[s].date<n&&(n=e[s].date,t=s);return t}function Qn(e){H(new A("platform-logger",t=>new he(t),"PRIVATE")),H(new A("heartbeat",t=>new ye(t),"PRIVATE")),N(pe,nt,e),N(pe,nt,"esm2020"),N("fire-js","")}Qn("");var Xn="firebase",es="13.3.0";N(Xn,es,"app");var ft="@firebase/ai",we="3.1.0";var U="AI",ts="global",ns="firebasevertexai.googleapis.com",q="v1beta",ht=we,ss="gl-js",is="hybrid",os=180*1e3,rs="gemini-3.5-flash-lite";var d=class e extends C{constructor(t,n,s){let i=U,o=`${i}/${t}`,r=`${i}: ${n} (${o})`;super(t,r),this.code=t,this.customErrorData=s,Error.captureStackTrace&&Error.captureStackTrace(this,e),Object.setPrototypeOf(this,e.prototype),this.toString=()=>r}};var pt=["user","model","function","system"];var _t={HARM_SEVERITY_NEGLIGIBLE:"HARM_SEVERITY_NEGLIGIBLE",HARM_SEVERITY_LOW:"HARM_SEVERITY_LOW",HARM_SEVERITY_MEDIUM:"HARM_SEVERITY_MEDIUM",HARM_SEVERITY_HIGH:"HARM_SEVERITY_HIGH",HARM_SEVERITY_UNSUPPORTED:"HARM_SEVERITY_UNSUPPORTED"};var b={STOP:"STOP",MAX_TOKENS:"MAX_TOKENS",SAFETY:"SAFETY",RECITATION:"RECITATION",OTHER:"OTHER",BLOCKLIST:"BLOCKLIST",PROHIBITED_CONTENT:"PROHIBITED_CONTENT",SPII:"SPII",MALFORMED_FUNCTION_CALL:"MALFORMED_FUNCTION_CALL",IMAGE_SAFETY:"IMAGE_SAFETY",IMAGE_PROHIBITED_CONTENT:"IMAGE_PROHIBITED_CONTENT",IMAGE_OTHER:"IMAGE_OTHER",NO_IMAGE:"NO_IMAGE",IMAGE_RECITATION:"IMAGE_RECITATION",LANGUAGE:"LANGUAGE",UNEXPECTED_TOOL_CALL:"UNEXPECTED_TOOL_CALL",TOO_MANY_TOOL_CALLS:"TOO_MANY_TOOL_CALLS",MISSING_THOUGHT_SIGNATURE:"MISSING_THOUGHT_SIGNATURE",MALFORMED_RESPONSE:"MALFORMED_RESPONSE"};var _={PREFER_ON_DEVICE:"prefer_on_device",ONLY_ON_DEVICE:"only_on_device",ONLY_IN_CLOUD:"only_in_cloud",PREFER_IN_CLOUD:"prefer_in_cloud"},v={ON_DEVICE:"on_device",IN_CLOUD:"in_cloud"};var u={ERROR:"error",REQUEST_ERROR:"request-error",RESPONSE_ERROR:"response-error",FETCH_ERROR:"fetch-error",SESSION_CLOSED:"session-closed",INVALID_CONTENT:"invalid-content",API_NOT_ENABLED:"api-not-enabled",ALREADY_INITIALIZED:"already-initialized",INVALID_SCHEMA:"invalid-schema",NO_API_KEY:"no-api-key",NO_APP_ID:"no-app-id",NO_MODEL:"no-model",NO_PROJECT_ID:"no-project-id",PARSE_FAILED:"parse-failed",UNSUPPORTED:"unsupported"};var T={AGENT_PLATFORM:"AGENT_PLATFORM",GOOGLE_AI:"GOOGLE_AI"};var Z=class{constructor(t){this.backendType=t}},P=class extends Z{constructor(){super(T.GOOGLE_AI)}_getModelPath(t,n){return`/${q}/projects/${t}/${n}`}_getTemplatePath(t,n){return`/${q}/projects/${t}/templates/${n}`}},Q=class extends Z{constructor(t){super(T.AGENT_PLATFORM),this.location=ts,t&&(this.location=t)}_getModelPath(t,n){return`/${q}/projects/${t}/locations/${this.location}/${n}`}_getTemplatePath(t,n){return`/${q}/projects/${t}/locations/${this.location}/templates/${n}`}};function as(e){if(e instanceof P)return`${U}/googleai`;if(e instanceof Q)return`${U}/agentplatform/${e.location}`;throw new d(u.ERROR,`Invalid backend: ${JSON.stringify(e.backendType)}`)}function cs(e){let t=e.split("/");if(t[0]!==U)throw new d(u.ERROR,`Invalid instance identifier, unknown prefix '${t[0]}'`);switch(t[1]){case"agentplatform":let s=t[2];if(!s)throw new d(u.ERROR,`Invalid instance identifier, unknown location '${e}'`);return new Q(s);case"googleai":return new P;default:throw new d(u.ERROR,`Invalid instance identifier string: '${e}'`)}}var E=new k("@firebase/ai"),R;(function(e){e.UNAVAILABLE="unavailable",e.DOWNLOADABLE="downloadable",e.DOWNLOADING="downloading",e.AVAILABLE="available"})(R||(R={}));var St={type:"text",languages:["en"]},Se=[St,{type:"image"}],Oe=[St],X=class e{constructor(t,n,s){this.languageModelProvider=t,this.mode=n,this.downloadPromise=null,this.onDeviceParams={createOptions:{expectedInputs:Se,expectedOutputs:Oe}},s&&(this.onDeviceParams=s,this.onDeviceParams.createOptions?(this.onDeviceParams.createOptions.expectedInputs||(this.onDeviceParams.createOptions.expectedInputs=Se),this.onDeviceParams.createOptions.expectedOutputs||(this.onDeviceParams.createOptions.expectedOutputs=Oe)):this.onDeviceParams.createOptions={expectedInputs:Se,expectedOutputs:Oe})}async isAvailable(t){if(!this.mode)return E.debug("On-device inference unavailable because mode is undefined."),!1;if(this.mode===_.ONLY_IN_CLOUD)return E.debug('On-device inference unavailable because mode is "only_in_cloud".'),!1;let n=await this.languageModelProvider?.availability(this.onDeviceParams.createOptions);if(this.mode===_.ONLY_ON_DEVICE){if(n===R.UNAVAILABLE)throw new d(u.API_NOT_ENABLED,"Local LanguageModel API not available in this environment.");if(n===R.DOWNLOADABLE||n===R.DOWNLOADING){E.debug("Waiting for download of LanguageModel to complete.");try{await this.downloadPromise}catch(s){throw new d(u.ERROR,s.message)}return!0}return!0}return n!==R.AVAILABLE?(E.debug(`On-device inference unavailable because availability is "${n}".`),!1):e.isOnDeviceRequest(t)?!0:(E.debug("On-device inference unavailable because request is incompatible."),!1)}async generateContent(t){let n=await this.createSession(),s=await Promise.all(t.contents.map(e.toLanguageModelMessage)),i=await n.prompt(s,this.onDeviceParams.promptOptions);return e.toResponse(i)}async generateContentStream(t){let n=await this.createSession(),s=await Promise.all(t.contents.map(e.toLanguageModelMessage)),i=n.promptStreaming(s,this.onDeviceParams.promptOptions);return e.toStreamResponse(i)}async countTokens(t){throw new d(u.REQUEST_ERROR,"Count Tokens is not yet available for on-device model.")}static isOnDeviceRequest(t){if(t.contents.length===0)return E.debug("Empty prompt rejected for on-device inference."),!1;for(let n of t.contents){if(n.parts.some(s=>"functionResponse"in s))return E.debug("Content with a function response part rejected for on-device inference."),!1;for(let s of n.parts)if("inlineData"in s&&s.inlineData&&e.SUPPORTED_MIME_TYPES.indexOf(s.inlineData.mimeType)===-1)return E.debug(`Unsupported mime type "${s.inlineData.mimeType}" rejected for on-device inference.`),!1}return!0}async downloadIfAvailable(t){let n=await this.languageModelProvider?.availability(this.onDeviceParams.createOptions);return(n===R.DOWNLOADABLE||n===R.DOWNLOADING)&&this.download(t),n}download(t){if(this.downloadPromise)return;let n={...this.onDeviceParams.createOptions};n&&!n.monitor&&t&&(n.monitor=s=>{s.addEventListener("downloadprogress",i=>{t(i.loaded)})}),this.downloadPromise=this.languageModelProvider?.create(n).finally(()=>{this.downloadPromise=null})}static async toLanguageModelMessage(t){let n=await Promise.all(t.parts.map(e.toLanguageModelMessageContent));return{role:e.toLanguageModelMessageRole(t.role),content:n}}static async toLanguageModelMessageContent(t){if("text"in t&&typeof t.text=="string")return{type:"text",value:t.text};if("inlineData"in t&&t.inlineData){let s=await(await fetch(`data:${t.inlineData.mimeType};base64,${t.inlineData.data}`)).blob();return{type:"image",value:await createImageBitmap(s)}}throw new d(u.REQUEST_ERROR,"Processing of this Part type is not currently supported.")}static toLanguageModelMessageRole(t){return t==="model"?"assistant":"user"}async createSession(){if(!this.languageModelProvider)throw new d(u.UNSUPPORTED,"Chrome AI requested for unsupported browser version.");let t=await this.languageModelProvider.create(this.onDeviceParams.createOptions);return this.oldSession&&this.oldSession.destroy(),this.oldSession=t,t}static toResponse(t){return{json:async()=>({candidates:[{content:{parts:[{text:t}]}}]})}}static toStreamResponse(t){let n=new TextEncoder;return{body:t.pipeThrough(new TransformStream({transform(s,i){let o=JSON.stringify({candidates:[{content:{role:"model",parts:[{text:s}]}}]});i.enqueue(n.encode(`data: ${o}

`))}}))}}};X.SUPPORTED_MIME_TYPES=["image/jpeg","image/png"];function ls(e,t,n){let i=(t||ie()).LanguageModel;if(i&&e)return new X(i,e,n)}var Ie=class{constructor(t,n,s,i,o){this.app=t,this.backend=n,this.chromeAdapterFactory=o;let r=i?.getImmediate({optional:!0}),a=s?.getImmediate({optional:!0});this.auth=a||null,this.appCheck=r||null}_delete(){return Promise.resolve()}set options(t){this._options=t}get options(){return this._options}};function us(e,{instanceIdentifier:t}){if(!t)throw new d(u.ERROR,"AIService instance identifier is undefined.");let n=cs(t),s=e.getProvider("app").getImmediate(),i=e.getProvider("auth-internal"),o=e.getProvider("app-check-internal");return new Ie(s,n,i,o,ls)}function ds(e){if(e.app?.options?.apiKey)if(e.app?.options?.projectId){if(!e.app?.options?.appId)throw new d(u.NO_APP_ID,'The "appId" field is empty in the local Firebase config. Firebase AI requires this field to contain a valid app ID.')}else throw new d(u.NO_PROJECT_ID,'The "projectId" field is empty in the local Firebase config. Firebase AI requires this field to contain a valid project ID.');else throw new d(u.NO_API_KEY,'The "apiKey" field is empty in the local Firebase config. Firebase AI requires this field to contain a valid API key.');let t={apiKey:e.app.options.apiKey,project:e.app.options.projectId,appId:e.app.options.appId,automaticDataCollectionEnabled:e.app.automaticDataCollectionEnabled,backend:e.backend};if(ct(e.app)&&e.app.settings.appCheckToken){let n=e.app.settings.appCheckToken;t.getAppCheckToken=()=>Promise.resolve({token:n})}else e.appCheck&&(e.options?.useLimitedUseAppCheckTokens?t.getAppCheckToken=()=>e.appCheck.getLimitedUseToken():t.getAppCheckToken=()=>e.appCheck.getToken());return e.auth&&(t.getAuthToken=()=>e.auth.getToken()),t}var Re=class e{constructor(t,n){this._apiSettings=ds(t),this.model=e.normalizeModelName(n,this._apiSettings.backend.backendType)}static normalizeModelName(t,n){return n===T.GOOGLE_AI?e.normalizeGoogleAIModelName(t):e.normalizeVertexAIModelName(t)}static normalizeGoogleAIModelName(t){return`models/${t}`}static normalizeVertexAIModelName(t){let n;return t.includes("/")?t.startsWith("models/")?n=`publishers/google/${t}`:n=t:n=`publishers/google/models/${t}`,n}};var fs="Timeout has expired.",Ce="AbortError",Te=class{constructor(t){this.params=t}toString(){let t=new URL(this.baseUrl);return t.pathname=this.pathname,t.search=this.queryParams.toString(),t.toString()}get pathname(){return this.params.templateId?`${this.params.apiSettings.backend._getTemplatePath(this.params.apiSettings.project,this.params.templateId)}:${this.params.task}`:`${this.params.apiSettings.backend._getModelPath(this.params.apiSettings.project,this.params.model)}:${this.params.task}`}get baseUrl(){return this.params.singleRequestOptions?.baseUrl??`https://${ns}`}get queryParams(){let t=new URLSearchParams;return this.params.stream&&t.set("alt","sse"),t}};function hs(e){let t=[];return t.push(`${ss}/${ht}`),t.push(`fire/${ht}`),(e.params.apiSettings.inferenceMode===_.PREFER_ON_DEVICE||e.params.apiSettings.inferenceMode===_.PREFER_IN_CLOUD)&&t.push(is),t.join(" ")}async function ps(e){let t=new Headers;if(t.append("Content-Type","application/json"),t.append("x-goog-api-client",hs(e)),t.append("x-goog-api-key",e.params.apiSettings.apiKey),e.params.apiSettings.automaticDataCollectionEnabled&&t.append("X-Firebase-Appid",e.params.apiSettings.appId),e.params.apiSettings.getAppCheckToken){let n=await e.params.apiSettings.getAppCheckToken();n&&(t.append("X-Firebase-AppCheck",n.token),n.error&&E.warn(`Unable to obtain a valid App Check token: ${n.error.message}`))}if(e.params.apiSettings.getAuthToken){let n=await e.params.apiSettings.getAuthToken();n&&t.append("Authorization",`Firebase ${n.accessToken}`)}return t}async function Le(e,t){let n=new Te(e),s,i=e.singleRequestOptions?.signal,o=e.singleRequestOptions?.timeout!=null&&e.singleRequestOptions.timeout>=0?e.singleRequestOptions.timeout:os,r=new AbortController,a=setTimeout(()=>{r.abort(new DOMException(fs,Ce)),E.debug(`Aborting request to ${n} due to timeout (${o}ms)`)},o),c=AbortSignal.any(i?[i,r.signal]:[r.signal]);if(i&&i.aborted)throw clearTimeout(a),new DOMException(i.reason??"Aborted externally before fetch",Ce);try{let l={method:"POST",headers:await ps(n),signal:c,body:t};if(s=await fetch(n.toString(),l),!s.ok){let f="",m;try{let g=await s.json();f=g.error.message,g.error.details&&(f+=` ${JSON.stringify(g.error.details)}`,m=g.error.details)}catch{}throw s.status===403&&m&&m.some(g=>g.reason==="SERVICE_DISABLED")&&m.some(g=>g.links?.[0]?.description.includes("Google developers console API activation"))?new d(u.API_NOT_ENABLED,`The Firebase AI SDK requires the Firebase AI API ('firebasevertexai.googleapis.com') to be enabled in your Firebase project. Enable this API by visiting the Firebase Console at https://console.firebase.google.com/project/${n.params.apiSettings.project}/ailogic/ and clicking "Get started". If you enabled this API recently, wait a few minutes for the action to propagate to our systems and then retry.`,{status:s.status,statusText:s.statusText,errorDetails:m}):new d(u.FETCH_ERROR,`Error fetching from ${n}: [${s.status} ${s.statusText}] ${f}`,{status:s.status,statusText:s.statusText,errorDetails:m})}}catch(l){let f=l;throw l.code!==u.FETCH_ERROR&&l.code!==u.API_NOT_ENABLED&&l instanceof Error&&l.name!==Ce&&(f=new d(u.ERROR,`Error fetching from ${n.toString()}: ${l.message}`),f.stack=l.stack),f}finally{clearTimeout(a)}return s}function K(e){if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&E.warn(`This response had ${e.candidates.length} candidates. Returning text from the first candidate only. Access response.candidates directly to use the other candidates.`),Ct(e.candidates[0]))throw new d(u.RESPONSE_ERROR,`Response error: ${M(e)}. Response body stored in error.response`,{response:e});return!0}else return!1}function O(e){return"type"in e&&e.type?e:e.text!==void 0?{...e,type:"text"}:e.inlineData!==void 0?{...e,type:"inlineData"}:e.functionCall!==void 0?{...e,type:"functionCall"}:e.functionResponse!==void 0?{...e,type:"functionResponse"}:e.fileData!==void 0?{...e,type:"fileData"}:e.executableCode!==void 0?{...e,type:"executableCode"}:e.codeExecutionResult!==void 0?{...e,type:"codeExecutionResult"}:e}function ee(e,t=v.IN_CLOUD){if(e.candidates?.[0]&&!e.candidates[0].hasOwnProperty("index")&&(e.candidates[0].index=0),e.candidates)for(let s of e.candidates)s.content?.parts&&(s.content.parts=s.content.parts.map(O));let n=ms(e);return n.inferenceSource=t,n}function ms(e){return e.text=()=>{if(K(e))return mt(e,t=>!("thought"in t&&t.thought));if(e.promptFeedback)throw new d(u.RESPONSE_ERROR,`Text not available. ${M(e)}`,{response:e});return""},e.thoughtSummary=()=>{if(K(e)){let t=mt(e,n=>!!("thought"in n&&n.thought));return t===""?void 0:t}else if(e.promptFeedback)throw new d(u.RESPONSE_ERROR,`Thought summary not available. ${M(e)}`,{response:e})},e.inlineDataParts=()=>{if(K(e))return gs(e);if(e.promptFeedback)throw new d(u.RESPONSE_ERROR,`Data not available. ${M(e)}`,{response:e})},e.functionCalls=()=>{if(K(e))return Ot(e);if(e.promptFeedback)throw new d(u.RESPONSE_ERROR,`Function call not available. ${M(e)}`,{response:e})},e}function mt(e,t){let n=[];if(e.candidates?.[0].content?.parts)for(let s of e.candidates?.[0].content?.parts){let i=O(s);i.type==="text"&&t(i)&&n.push(i.text)}return n.length>0?n.join(""):""}function Ot(e){if(!e)return;let t=[];if(e.candidates?.[0].content?.parts)for(let n of e.candidates?.[0].content?.parts){let s=O(n);s.type==="functionCall"&&t.push(s.functionCall)}if(t.length>0)return t}function gs(e){let t=[];if(e.candidates?.[0].content?.parts)for(let n of e.candidates?.[0].content?.parts){let s=O(n);s.type==="inlineData"&&t.push(s)}if(t.length>0)return t}var Es=[b.RECITATION,b.SAFETY,b.BLOCKLIST,b.PROHIBITED_CONTENT,b.SPII,b.MALFORMED_FUNCTION_CALL,b.IMAGE_SAFETY,b.IMAGE_PROHIBITED_CONTENT,b.IMAGE_OTHER,b.NO_IMAGE,b.IMAGE_RECITATION,b.LANGUAGE,b.UNEXPECTED_TOOL_CALL,b.TOO_MANY_TOOL_CALLS,b.MISSING_THOUGHT_SIGNATURE,b.MALFORMED_RESPONSE];function Ct(e){return!!e.finishReason&&Es.some(t=>t===e.finishReason)}function M(e){let t="";if((!e.candidates||e.candidates.length===0)&&e.promptFeedback)t+="Response was blocked",e.promptFeedback?.blockReason&&(t+=` due to ${e.promptFeedback.blockReason}`),e.promptFeedback?.blockReasonMessage&&(t+=`: ${e.promptFeedback.blockReasonMessage}`);else if(e.candidates?.[0]){let n=e.candidates[0];Ct(n)&&(t+=`Candidate was blocked due to ${n.finishReason}`,n.finishMessage&&(t+=`: ${n.finishMessage}`))}return t}function Me(e){if(e!=null){if(typeof e=="string")return{role:"system",parts:[{type:"text",text:e}]};if(e.type==="text"||"text"in e&&typeof e.text=="string")return{role:"system",parts:[D(O(e))]};if(e.parts){let t=e.parts.map(n=>D(O(n)));return e.role?{...e,parts:t}:{role:"system",parts:t}}}}function V(e){let t=[];if(typeof e=="string")t=[{type:"text",text:e}];else for(let n of e)typeof n=="string"?t.push({type:"text",text:n}):t.push(D(O(n)));return ys(t)}function ys(e){let t={role:"user",parts:[]},n=!1,s=!1;for(let i of e)i.type==="functionResponse"||"functionResponse"in i?s=!0:n=!0,t.parts.push(i);if(n&&s)throw new d(u.INVALID_CONTENT,"Within a single message, FunctionResponse cannot be mixed with other type of Part in the request for sending chat message.");if(!n&&!s)throw new d(u.INVALID_CONTENT,"No Content is provided for sending chat message.");return t}function Ae(e){let t;if(e.contents){let n=e;t={...n,contents:n.contents.map(s=>({...s,parts:s.parts?s.parts.map(O):[]}))}}else t={contents:[V(e)]};return e.systemInstruction&&(t.systemInstruction=Me(e.systemInstruction)),t}function bs(e){return e.parts&&Array.isArray(e.parts)?{...e,parts:e.parts.map(Pe)}:e}function Pe(e){let t;if("type"in e){let{type:n,...s}=e;t=s}else t=e;return t.functionResponse&&(t={...t,functionResponse:bs(t.functionResponse)}),t}function xe(e){return e.parts?{...e,parts:e.parts.map(Pe)}:e}function At(e){return e==null||typeof e=="string"?e:"parts"in e&&Array.isArray(e.parts)?xe(e):Pe(e)}function wt(e){let t={...e};return t.contents&&(t.contents=t.contents.map(xe)),t.systemInstruction&&(t.systemInstruction=At(t.systemInstruction)),t}function _s(e){let t={...e};return t.contents&&(t.contents=t.contents.map(xe)),t.systemInstruction&&(t.systemInstruction=At(t.systemInstruction)),t}function It(e){if(e.safetySettings?.forEach(t=>{if(t.method)throw new d(u.UNSUPPORTED,"SafetySetting.method is not supported in the the Gemini Developer API. Please remove this property.")}),e.generationConfig?.topK){let t=Math.round(e.generationConfig.topK);t!==e.generationConfig.topK&&(E.warn("topK in GenerationConfig has been rounded to the nearest integer to match the format for requests to the Gemini Developer API."),e.generationConfig.topK=t)}return e}function ke(e){return{candidates:e.candidates?Os(e.candidates):void 0,promptFeedback:e.promptFeedback?Cs(e.promptFeedback):void 0,usageMetadata:e.usageMetadata}}function Ss(e,t){return{generateContentRequest:{model:t,...e}}}function Os(e){let t=[],n;return t&&e.forEach(s=>{let i;if(s.citationMetadata&&(i={citations:s.citationMetadata.citationSources}),s.safetyRatings&&(n=s.safetyRatings.map(r=>({...r,severity:r.severity??_t.HARM_SEVERITY_UNSUPPORTED,probabilityScore:r.probabilityScore??0,severityScore:r.severityScore??0}))),s.content?.parts?.some(r=>"videoMetadata"in r&&r.videoMetadata))throw new d(u.UNSUPPORTED,"Part.videoMetadata is not supported in the Gemini Developer API. Please remove this property.");let o={index:s.index,content:s.content,finishReason:s.finishReason,finishMessage:s.finishMessage,safetyRatings:n,citationMetadata:i,groundingMetadata:s.groundingMetadata,urlContextMetadata:s.urlContextMetadata};t.push(o)}),t}function Cs(e){let t=[];return(e.safetyRatings??[]).forEach(s=>{t.push({category:s.category,probability:s.probability,severity:s.severity??_t.HARM_SEVERITY_UNSUPPORTED,probabilityScore:s.probabilityScore??0,severityScore:s.severityScore??0,blocked:s.blocked})}),{blockReason:e.blockReason,safetyRatings:t,blockReasonMessage:e.blockReasonMessage}}var gt=/^data\: (.*)(?:\n\n|\r\r|\r\n\r\n)/;async function As(e,t,n){let s=e.body.pipeThrough(new TextDecoderStream("utf8",{fatal:!0})),i=Ts(s),[o,r]=i.tee(),{response:a,firstValue:c}=await ws(r,t,n);return{stream:Rs(o,t,n),response:a,firstValue:c}}async function ws(e,t,n){let[s,i]=e.tee(),o=s.getReader(),{value:r}=await o.read();return{firstValue:r,response:Is(i,t,n)}}async function Is(e,t,n){let s=[],i=e.getReader();for(;;){let{done:o,value:r}=await i.read();if(o){let a=Ds(s);return t.backend.backendType===T.GOOGLE_AI&&(a=ke(a)),ee(a,n)}s.push(r)}}async function*Rs(e,t,n){let s=e.getReader();for(;;){let{value:i,done:o}=await s.read();if(o)break;let r;t.backend.backendType===T.GOOGLE_AI?r=ee(ke(i),n):r=ee(i,n);let a=r.candidates?.[0];!a?.content?.parts&&!a?.finishReason&&!a?.citationMetadata&&!a?.urlContextMetadata||(yield r)}}function Ts(e){let t=e.getReader();return new ReadableStream({start(s){let i="";return o();function o(){return t.read().then(({value:r,done:a})=>{if(a){if(i.trim()){s.error(new d(u.PARSE_FAILED,"Failed to parse stream"));return}s.close();return}i+=r;let c=i.match(gt),l;for(;c;){try{l=JSON.parse(c[1])}catch{s.error(new d(u.PARSE_FAILED,`Error parsing JSON response: "${c[1]}`));return}s.enqueue(l),i=i.substring(c[0].length),c=i.match(gt)}return o()})}}})}function Ds(e){let n={promptFeedback:e[e.length-1]?.promptFeedback};for(let s of e)if(s.candidates)for(let i of s.candidates){let o=i.index||0;n.candidates||(n.candidates=[]),n.candidates[o]||(n.candidates[o]={index:i.index}),n.candidates[o].citationMetadata=i.citationMetadata,n.candidates[o].finishReason=i.finishReason,n.candidates[o].finishMessage=i.finishMessage,n.candidates[o].safetyRatings=i.safetyRatings,n.candidates[o].groundingMetadata=i.groundingMetadata;let r=i.urlContextMetadata;if(typeof r=="object"&&r!==null&&Object.keys(r).length>0&&(n.candidates[o].urlContextMetadata=r),i.content){if(!i.content.parts)continue;n.candidates[o].content||(n.candidates[o].content={role:i.content.role||"user",parts:[]});for(let a of i.content.parts){if("text"in a&&a.text==="")continue;if(Object.keys(a).length===0)throw new d(u.INVALID_CONTENT,"Part should have at least one property, but there are none. This is likely caused by a malformed response from the backend.");let c=O({...a});Object.keys(c).length>0&&n.candidates[o].content.parts.push(c)}}}return n}var Ns=[u.FETCH_ERROR,u.ERROR,u.API_NOT_ENABLED];async function Rt(e,t,n,s){if(!t)return{response:await s(),inferenceSource:v.IN_CLOUD};switch(t.mode){case _.ONLY_ON_DEVICE:if(await t.isAvailable(e))return{response:await n(),inferenceSource:v.ON_DEVICE};throw new d(u.UNSUPPORTED,"Inference mode is ONLY_ON_DEVICE, but an on-device model is not available.");case _.ONLY_IN_CLOUD:return{response:await s(),inferenceSource:v.IN_CLOUD};case _.PREFER_IN_CLOUD:try{return{response:await s(),inferenceSource:v.IN_CLOUD}}catch(i){if(i instanceof d&&Ns.includes(i.code)&&await t.isAvailable(e))return{response:await n(),inferenceSource:v.ON_DEVICE};throw i}case _.PREFER_ON_DEVICE:return await t.isAvailable(e)?{response:await n(),inferenceSource:v.ON_DEVICE}:{response:await s(),inferenceSource:v.IN_CLOUD};default:throw new d(u.ERROR,`Unexpected infererence mode: ${t.mode}`)}}async function vs(e,t,n,s){return n=wt(n),e.backend.backendType===T.GOOGLE_AI&&(n=It(n)),Le({task:"streamGenerateContent",model:t,apiSettings:e,stream:!0,singleRequestOptions:s},JSON.stringify(n))}async function Tt(e,t,n,s,i){let o=await Rt(n,s,()=>s.generateContentStream(n),()=>vs(e,t,n,i));return As(o.response,e,o.inferenceSource)}async function Ls(e,t,n,s){return n=wt(n),e.backend.backendType===T.GOOGLE_AI&&(n=It(n)),Le({model:t,task:"generateContent",apiSettings:e,stream:!1,singleRequestOptions:s},JSON.stringify(n))}async function Dt(e,t,n,s,i){let o=await Rt(n,s,()=>s.generateContent(n),()=>Ls(e,t,n,i)),r=await Ms(o.response,e);return{response:ee(r,o.inferenceSource)}}async function Ms(e,t){let n=await e.json();return t.backend.backendType===T.GOOGLE_AI?ke(n):n}var Et="SILENT_ERROR",yt=10,De=class{constructor(t,n,s){this.params=n,this.requestOptions=s,this._history=[],this._sendPromise=Promise.resolve(),this._apiSettings=t}async getHistory(){return await this._sendPromise,D(this._history).map(t=>({...t,parts:t.parts?t.parts.map(O):[]}))}async _sendMessage(t,n){let s={};await this._sendPromise;let i=[];return this._sendPromise=this._sendPromise.then(async()=>{let o,r=0,a=this.requestOptions?.maxSequentialFunctionCalls??yt;do{let c;if(o){r++;let m=await this._callFunctionsAsNeeded(o);c=V(m)}else c=V(t);let l=this._formatRequest(c,[...i]);i.push(c);let f=await this._callGenerateContent(l,n);if(f)if(s=f,o=this._getCallableFunctionCalls(f.response),f.response.candidates&&f.response.candidates.length>0){let m={parts:f.response.candidates?.[0].content.parts||[],role:f.response.candidates?.[0].content.role||"model"};i.push(D(m))}else{let m=M(f.response);m&&E.warn(`sendMessage() was unsuccessful. ${m}. Inspect response object for details.`)}else o=void 0}while(o&&r<a);o&&r>=a&&E.warn(`Automatic function calling exceeded the limit of ${a} function calls. Returning last model response.`)}),await this._sendPromise,this._history=this._history.concat(i),s}async _sendMessageStream(t,n){await this._sendPromise;let s=[],o=(async()=>{let r,a=0,c=this.requestOptions?.maxSequentialFunctionCalls??yt,l;do{let f;if(r){a++;let g=await this._callFunctionsAsNeeded(r);f=V(g)}else f=V(t);let m=this._formatRequest(f,[...s]);if(s.push(f),l=await this._callGenerateContentStream(m,n),r=this._getCallableFunctionCalls(l.firstValue),r&&l.firstValue&&l.firstValue.candidates&&l.firstValue.candidates.length>0){let g={...l.firstValue.candidates[0].content};g.role||(g.role="model"),s.push(g)}}while(r&&a<c);return r&&a>=c&&E.warn(`Automatic function calling exceeded the limit of ${c} function calls. Returning last model response.`),{stream:l.stream,response:l.response}})();return this._sendPromise=this._sendPromise.then(async()=>o).catch(r=>{throw new Error(Et)}).then(r=>r.response).then(r=>{if(r.candidates&&r.candidates.length>0){this._history=this._history.concat(s);let a={...r.candidates[0].content};a.role||(a.role="model"),this._history.push(D(a))}else{let a=M(r);a&&E.warn(`sendMessageStream() was unsuccessful. ${a}. Inspect response object for details.`)}}).catch(r=>{r.message!==Et&&r.name!=="AbortError"&&E.error(r)}),o}_getCallableFunctionCalls(t){let n=this.params?.tools?.find(i=>i.functionDeclarations);if(!n?.functionDeclarations)return;let s=Ot(t);if(s){for(let i of s)if(!n.functionDeclarations?.some(r=>r.name===i.name&&typeof r.functionReference=="function"))return;return s}}async _callFunctionsAsNeeded(t){let n=[],s=[],i=this.params?.tools?.find(o=>o.functionDeclarations);if(i&&i.functionDeclarations){for(let r of t){let a=i.functionDeclarations.find(c=>c.name===r.name);if(a?.functionReference){let c=Promise.resolve(a.functionReference(r.args)).catch(l=>{let f=new d(u.ERROR,`Error in user-defined function "${a.name}": ${l.message}`);throw f.stack=l.stack,f});n.push({name:r.name,id:r.id,results:c}),s.push(c)}}await Promise.all(s);let o=[];for(let{name:r,id:a,results:c}of n){let l={name:r,response:await c};a&&(l.id=a),o.push({type:"functionResponse",functionResponse:l})}return o}else throw new d(u.REQUEST_ERROR,'No function declarations were provided in "tools".')}};var Ps=["text","inlineData","functionCall","functionResponse","thought","thoughtSignature"],xs={user:["text","inlineData","functionResponse"],function:["functionResponse"],model:["text","functionCall","thought","thoughtSignature"],system:["text"]},bt={user:["model"],function:["model"],model:["user","function"],system:[]};function ks(e){let t=null;for(let n of e){let{role:s,parts:i}=n;if(!t&&s!=="user")throw new d(u.INVALID_CONTENT,`First Content should be with role 'user', got ${s}`);if(!pt.includes(s))throw new d(u.INVALID_CONTENT,`Each item should include role field. Got ${s} but valid roles are: ${JSON.stringify(pt)}`);if(!Array.isArray(i))throw new d(u.INVALID_CONTENT,"Content should have 'parts' property with an array of Parts");if(i.length===0)throw new d(u.INVALID_CONTENT,"Each Content should have at least one part");let o={text:0,inlineData:0,functionCall:0,functionResponse:0,thought:0,thoughtSignature:0,fileData:0,executableCode:0,codeExecutionResult:0};for(let a of i){if(a.type)o[a.type]+=1;else for(let c of["text","inlineData","functionCall","functionResponse","fileData","executableCode","codeExecutionResult"])c in a&&(o[c]+=1);"thought"in a&&a.thought&&(o.thought+=1),"thoughtSignature"in a&&a.thoughtSignature&&(o.thoughtSignature+=1)}let r=xs[s];for(let a of Ps)if(!r.includes(a)&&o[a]>0)throw new d(u.INVALID_CONTENT,`Content with role '${s}' can't contain '${a}' part`);if(t&&!bt[s].includes(t.role))throw new d(u.INVALID_CONTENT,`Content with role '${s}' can't follow '${t.role}'. Valid previous roles: ${JSON.stringify(bt)}`);t=n}}var Ne=class extends De{constructor(t,n,s,i,o){super(t,i,o),this.model=n,this.chromeAdapter=s,this.params=i,this.requestOptions=o,i?.history&&(ks(i.history),this._history=D(i.history)),this.params?.systemInstruction!=null&&(this.params={...this.params,systemInstruction:Me(this.params.systemInstruction)})}_formatRequest(t,n){return{safetySettings:this.params?.safetySettings,generationConfig:this.params?.generationConfig,tools:this.params?.tools,toolConfig:this.params?.toolConfig,systemInstruction:this.params?.systemInstruction,contents:[...this._history,...n,t]}}_callGenerateContent(t,n){return Dt(this._apiSettings,this.model,t,this.chromeAdapter,{...this.requestOptions,...n})}_callGenerateContentStream(t,n){return Tt(this._apiSettings,this.model,t,this.chromeAdapter,{...this.requestOptions,...n})}async sendMessage(t,n){return this._sendMessage(t,n)}async sendMessageStream(t,n){return this._sendMessageStream(t,n)}};async function Us(e,t,n,s){n=_s(n);let i="";if(e.backend.backendType===T.GOOGLE_AI){let r=Ss(n,t);i=JSON.stringify(r)}else i=JSON.stringify(n);return(await Le({model:t,task:"countTokens",apiSettings:e,stream:!1,singleRequestOptions:s},i)).json()}async function Fs(e,t,n,s,i){if(s?.mode===_.ONLY_ON_DEVICE)throw new d(u.UNSUPPORTED,"countTokens() is not supported for on-device models.");return Us(e,t,n,i)}var ve=class extends Re{constructor(t,n,s,i){super(t,n.model),this.chromeAdapter=i,this.generationConfig=n.generationConfig||{},Bs(this.generationConfig),this.safetySettings=n.safetySettings||[],this.tools=n.tools,this.toolConfig=n.toolConfig,this.systemInstruction=Me(n.systemInstruction),this.requestOptions=s||{}}async initializeDeviceModel(t){if(!this.chromeAdapter||this.chromeAdapter.mode===_.ONLY_IN_CLOUD)return;if(await this.chromeAdapter.downloadIfAvailable(t)===R.UNAVAILABLE){let s=new d(u.API_NOT_ENABLED,"Local LanguageModel API not available in this environment.");if(this.chromeAdapter.mode===_.ONLY_ON_DEVICE)throw s;E.debug(s.message)}await this.chromeAdapter.downloadPromise}async generateContent(t,n){let s=Ae(t);return Dt(this._apiSettings,this.model,{generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,...s},this.chromeAdapter,{...this.requestOptions,...n})}async generateContentStream(t,n){let s=Ae(t),{stream:i,response:o}=await Tt(this._apiSettings,this.model,{generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,...s},this.chromeAdapter,{...this.requestOptions,...n});return{stream:i,response:o}}startChat(t){return new Ne(this._apiSettings,this.model,this.chromeAdapter,{tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,generationConfig:this.generationConfig,safetySettings:this.safetySettings,...t},this.requestOptions)}async countTokens(t,n){let s=Ae(t);return Fs(this._apiSettings,this.model,s,this.chromeAdapter,{...this.requestOptions,...n})}};function Bs(e){if(e.thinkingConfig?.thinkingBudget!=null&&e.thinkingConfig?.thinkingLevel)throw new d(u.UNSUPPORTED,"Cannot set both thinkingBudget and thinkingLevel in a config.");if(e.responseSchema!=null&&e.responseJsonSchema!=null)throw new d(u.UNSUPPORTED,"Cannot set both responseSchema and responseJsonSchema in a config.");if((e.responseSchema!=null||e.responseJsonSchema!=null)&&e.responseMimeType!=="application/json"&&e.responseMimeType!=="text/x.enum")throw new d(u.UNSUPPORTED,'responseMimeType must be set to "application/json" or "text/x.enum" if responseSchema or responseJsonSchema are set.')}var $s="audio-processor",Li=`
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
  registerProcessor('${$s}', AudioProcessor);
`;function Nt(e=lt(),t){e=Je(e);let n=at(e,U),s=t?.backend??new P,i=as(s),o=n.getImmediate({identifier:i}),r=o.options;if(r){let a=t?.useLimitedUseAppCheckTokens,c=!!r.useLimitedUseAppCheckTokens;if(a!=null&&!!a!==c)throw new d(u.ALREADY_INITIALIZED,`getAI() has already been called for app "${e.name}" and this backend with useLimitedUseAppCheckTokens: ${c}. This option cannot be changed after the AI instance has been initialized. Pass the desired options to the first getAI() call for this app and backend, or omit useLimitedUseAppCheckTokens to reuse the existing instance.`);return o}return o.options={useLimitedUseAppCheckTokens:t?.useLimitedUseAppCheckTokens??!1},o}var Hs=["mode","onDeviceParams","inCloudParams"];function vt(e,t,n){let s=t,i;if(s.mode){for(let a of Object.keys(t))Hs.includes(a)||E.warn(`When a hybrid inference mode is specified (mode is currently set to ${s.mode}), "${a}" cannot be configured at the top level. Configuration for in-cloud and on-device must be done separately in inCloudParams and onDeviceParams. Configuration values set outside of inCloudParams and onDeviceParams will be ignored.`);i=s.inCloudParams||{model:rs}}else i=t;if(!i.model)throw new d(u.NO_MODEL,"Must provide a model name. Example: getGenerativeModel({ model: 'my-model-name' })");let o=e.chromeAdapterFactory?.(s.mode,typeof window>"u"?void 0:window,s.onDeviceParams),r=new ve(e,i,n,o);return r._apiSettings.inferenceMode=s.mode,r}function Gs(){H(new A(U,us,"PUBLIC").setMultipleInstances(!0)),N(ft,we),N(ft,we,"esm2020")}Gs();var x=e=>e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),y={NAME:"NAME",DOCTOR:"DOCTOR",FACILITY:"FACILITY",ADDRESS:"ADDRESS",ID:"ID",CONTACT:"CONTACT",DOB:"DOB"},Vs=[{type:y.CONTACT,re:/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g},{type:y.CONTACT,re:/(?:\+91[\s-]?|\b0)?[6-9]\d{4}[\s-]?\d{5}\b/g},{type:y.ID,re:/\b\d{4}[\s-]\d{4}[\s-]\d{4}\b/g},{type:y.ID,re:/\b[A-Z]{5}\d{4}[A-Z]\b/g}],js=[{type:y.NAME,re:/\b(?:Patient(?:'s)?\s*Name|Name\s*of\s*Patient|Pt\.?\s*Name|Name)\s*[:\-]\s*([^\n\r]+?)(?=\s{2,}|\t|\s+(?:Age|Sex|Gender|DOB|UHID|MRN)\b|$)/gim},{type:y.DOCTOR,re:/\b(?:Ref(?:erred|erring)?\.?\s*(?:By|Doctor|Dr\.?)|Consultant|Doctor|Physician|Pathologist)\s*[:\-]\s*([^\n\r]+?)(?=\s{2,}|\t|$)/gim},{type:y.DOCTOR,re:/\bDr\.? ?[A-Z][a-zA-Z.]*(?: [A-Z][a-zA-Z.]+){0,2}/g,whole:!0},{type:y.ID,re:/\b(?:UHID|MRN|MR\s*No|Patient\s*ID|Reg(?:istration)?\.?\s*No|Lab\s*(?:No|ID)|Sample\s*(?:No|ID)|Bill\s*No|Accession\s*No|Barcode|IP\s*No|OP\s*No)\.?\s*[:#\-]?\s*([A-Z0-9][A-Z0-9\/\-]{3,})/gi},{type:y.DOB,re:/\b(?:DOB|D\.O\.B\.?|Date\s*of\s*Birth)\s*[:\-]?\s*(\d{1,2}[\/\-.\s](?:\d{1,2}|[A-Za-z]{3,9})[\/\-.\s]\d{2,4})/gi},{type:y.ADDRESS,re:/\b(?:Address|Addr)[ \t]*[:\-][ \t]*([^\n\r]+)/gi},{type:y.ADDRESS,re:/\b(?:City|Town|Locality|Area|Village|Taluk|District|Dist|Landmark)[ \t]*:[ \t]*([A-Za-z][A-Za-z .'-]{1,40}?)[ \t]*(?=\s{2,}|[A-Z]{3,}[ \t]*:|$)/gim},{type:y.ADDRESS,re:/^[ \t]*([^\n:]{0,60}\b(?:Road|Rd|Street|Circle|Cross|Layout|Nagar|Lane|Marg|Colony|Sector|Phase|Stage|Extension|Apartments?|Residency|Society)\b[^\n]{0,80}?)[ \t,]*$/gim},{type:y.ADDRESS,re:/^[ \t]*([A-Z][A-Za-z]{2,}[ \t]*-[ \t]*\d{2,6})\b/gm},{type:y.CONTACT,re:/\b(?:Ph|Phone|Tel|Telephone|Mob|Mobile|Contact|Cell)\.?\s*(?:No\.?)?\s*[:\-]?\s*(\+?\d[\d\s\-]{6,16}\d)/gi},{type:y.FACILITY,re:/^[ \t]*([A-Za-z][A-Za-z.&' -]{2,60}\b(?:Diagnostics?|Laborator(?:y|ies)|Labs?|Hospitals?|Clinic|Centre|Center|Pathology|Healthcare|Medical|Imaging|Scans?|Nursing Home)\b[A-Za-z.&' -]{0,40}?)[ \t]*(?=\s{2,}|$)/gim},{type:y.ADDRESS,re:/^[ \t]*([A-Za-z0-9][^\n\r:]{4,80}?\b[1-9]\d{2}\s?\d{3})\b/gm}],Ue=/^(na|n\/a|nil|none|nan|op|ip|electrolytes|biochemistry|haematology|hematology|lipid profile|lipid|profile|kidney|liver|thyroid|function|tests?|panel|routine|examination|serology|immunology|diabetes|complete|count|differential|hormones?|vitamins?|minerals|enzymes|cardiac|iron studies|urine|stool|summary|investigation|department|specimen|method|technology|units?|value|interval|name|names|patient|address|addr|ref|ref\.? by|self|doctor|dr|consultant|landmark|locality|city|state|area|age|sex|gender|sample|barcode|date|report|male|female|m|f|years?|yrs?|normal|high|low|positive|negative|fasting|serum|plasma|blood|urine|report|test|result|hemoglobin|haemoglobin|glucose|cholesterol|platelets?|wbc|rbc|tsh|hba1c|creatinine|vitamin\s*\w+)$/i;function Mt(e){let t=[];for(let{type:n,re:s}of Vs)for(let i of e.matchAll(s))t.push({text:i[0].trim(),type:n,source:"pattern"});for(let{type:n,re:s,whole:i}of js)for(let o of e.matchAll(s)){let r=(i?o[0]:o[1]||"").trim().replace(/[,;.]+$/,"");n===y.ADDRESS&&/\d\s*(?:mg|g\/dl|u\/l|iu|meq|mmol|ng|pg|µ|%|cells|lakh|\/cumm|fl\b)/i.test(r)||r&&t.push({text:r,type:n,source:"pattern"})}return Pt(t,e)}function Ws(e,t){let n=String(e).trim();return/[\n\r]/.test(n)&&(n=n.split(/[\n\r]/)[0].trim()),n=n.replace(/^[A-Za-z][A-Za-z .'\/]{1,28}:\s+/,""),n=n.replace(/^(?:reported|referred|ref\.?|signed|verified|checked|authori[sz]ed)\s+by\s*:?\s*/i,""),(t==="DOCTOR"||t==="NAME")&&(n=n.replace(/,\s*(?:MD|MBBS|DM|MS|DNB|MCh|FRCP|PhD)\b.*$/i,"")),n.replace(/[,;:.]+$/,"").trim()}var Lt=/\b(?:reports?|reported|was|were|is|are|has|have|had|kindly|advised|please|correlate|shows?|noted|for|with)\b/i,F=e=>e.split(/\s+/).filter(Boolean).length;function Ys(e,t){switch(t){case"DOB":return/\d{1,2}[\/\-. ](?:\d{1,2}|[A-Za-z]{3,9})[\/\-. ]\d{2,4}/.test(e);case"CONTACT":return e.includes("@")||(e.match(/\d/g)||[]).length>=7;case"ID":return/\d/.test(e)&&e.length>=4&&F(e)<=3;case"NAME":case"DOCTOR":return F(e)<=5&&!/\d/.test(e)&&!Lt.test(e);case"FACILITY":return F(e)<=8&&!Lt.test(e);case"ADDRESS":return F(e)<=18;default:return!1}}function Pt(e,t){let n=new Set,s=[],i=t.toLowerCase();for(let o of e||[]){if(!o||typeof o.text!="string")continue;let r=y[o.type]||"NAME",a=o.source==="you"?o.text.trim():Ws(o.text,r);if(a.length<2||a.length>120||Ue.test(a)||/^\d+(\.\d+)?\s*%?$/.test(a)&&a.length<6&&!(o.source==="pattern"&&r==="ID")||o.source!=="you"&&!Ys(a,r)||!i.includes(a.toLowerCase()))continue;let c=a.toLowerCase();n.has(c)||(n.add(c),s.push({text:a,type:r,source:o.source||"model"}))}return Zs(qs(Xs(s.map(o=>zs(Js(o,t),t)),t),t),t)}function zs(e,t){if(e.type!=="ADDRESS")return e;let n=t.match(new RegExp(`(?:^|[\\s,:])((?:#\\s?)?\\d[\\dA-Za-z/-]{0,8}[ ,]+)${x(e.text)}`,"im"));return n?{...e,text:n[1]+e.text}:e}function Js(e,t){if(e.type!=="FACILITY")return e;let n=t.split(/\r?\n/).find(o=>o.toLowerCase().includes(e.text.toLowerCase()));if(!n)return e;let s=n.trim(),i=s.toLowerCase().replace(e.text.toLowerCase(),"").trim();return i&&F(i)<=4&&!/[\d:]/.test(i)&&F(s)<=9?{...e,text:s}:e}var Ks=/^(road|rd|main|cross|street|st|lane|ln|new|old|near|opp|opposite|behind|city|locality|landmark|layout|stage|phase|block|sector|flat|house|h\.?no|no|floor|area|dist|district|taluk|state|india|colony|apartment|apartments|residency|hills|nagar|extension|ext|post|po|village|town|west|east|north|south|the|and|of)$/i;function qs(e,t){let n=t;for(let o of e)n=n.split(new RegExp(x(o.text),"gi")).join(" ");let s=new Set(e.map(o=>o.text.toLowerCase())),i=[];for(let o of e)if(!(o.type!=="ADDRESS"&&o.type!=="FACILITY"))for(let r of o.text.split(/[\s,.:;()\/-]+/))r.length<4||/\d/.test(r)||Ks.test(r)||Ue.test(r)||s.has(r.toLowerCase())||o.type==="FACILITY"&&/^(diagnostics?|laborator(y|ies)|labs?|hospitals?|clinic|centre|center|pathology|healthcare|medical|research|imaging|scans?|technologies|ltd|limited|pvt)$/i.test(r)||new RegExp(`\\b${x(r)}\\b`,"i").test(n)&&(s.add(r.toLowerCase()),i.push({text:r,type:o.type,source:"pattern"}));return e.concat(i)}function Zs(e,t){return e.filter(n=>{let s=e.filter(o=>o!==n&&o.text.length>n.text.length&&o.text.toLowerCase().includes(n.text.toLowerCase()));if(!s.length)return!0;let i=t;for(let o of s)i=i.split(new RegExp(x(o.text),"gi")).join(" ");return i.toLowerCase().includes(n.text.toLowerCase())})}var Qs=/^(mr|mrs|ms|miss|dr|shri|smt|sri|kumari|master|baby|md|prof)\.?$/i;function Xs(e,t){let n=t;for(let o of e)n=n.split(new RegExp(x(o.text),"gi")).join(" ");let s=new Set(e.map(o=>o.text.toLowerCase())),i=[];for(let o of e)if(!(o.type!=="NAME"&&o.type!=="DOCTOR"))for(let r of o.text.split(/[\s.]+/))r.length<3||Qs.test(r)||Ue.test(r)||s.has(r.toLowerCase())||new RegExp(`\\b${x(r)}\\b`,"i").test(n)&&(s.add(r.toLowerCase()),i.push({text:r,type:o.type,source:"pattern"}));return e.concat(i)}function xt(e,t,n){return Pt([...e||[],...t||[]],n)}function kt(e,t){let n=[...t].sort((a,c)=>c.text.length-a.text.length),s={},i={},o={},r=e;for(let a of n){let c=a.text.toLowerCase();if(!o[c]){s[a.type]=(s[a.type]||0)+1;let f=`[${a.type}_${s[a.type]}]`;o[c]=f,i[f]=a.text}let l=/^\w+$/.test(a.text)?"\\b":"";r=r.replace(new RegExp(l+x(a.text)+l,"gi"),o[c])}return{sealed:r,map:i}}function Fe(e,t){let n=String(e??"");for(let[s,i]of Object.entries(t||{}))n=n.split(s).join(i);return n}function Ut(e,t=2800){let n=[],s=e;for(;s.length>t;){let i=s.lastIndexOf(`
`,t);i<t*.5&&(i=t),n.push(s.slice(0,i)),s=s.slice(i)}return s.trim()&&n.push(s),n}function Ft(e){if(!e)return null;let t=String(e).replace(/^```(?:json)?/i,"").replace(/```$/,"").trim();try{return JSON.parse(t)}catch{}let n=t.indexOf("{"),s=t.lastIndexOf("}");if(n>=0&&s>n)try{return JSON.parse(t.slice(n,s+1))}catch{}return null}var ei={apiKey:"AIzaSyBNhTUtYR2NrarGlhKCs84yC1quvaEruWk",authDomain:"sealed-hybrid-ai.firebaseapp.com",projectId:"sealed-hybrid-ai",storageBucket:"sealed-hybrid-ai.firebasestorage.app",messagingSenderId:"864197298923",appId:"1:864197298923:web:6112612c5cc5f073a28cae"},Bt={expectedInputs:[{type:"text",languages:["en"]}],expectedOutputs:[{type:"text",languages:["en"]}]},ti={type:"object",properties:{entities:{type:"array",items:{type:"object",properties:{text:{type:"string"},type:{type:"string",enum:["NAME","DOCTOR","FACILITY","ADDRESS","ID","CONTACT","DOB"]}},required:["text","type"]}}},required:["entities"]},ni=e=>`List the personal identifiers in this medical document: names of the patient, relatives and doctors; hospital and lab names; street addresses; ID numbers; phone numbers; emails; dates of birth.
Copy only the identifying words exactly as written, never the field label or a whole sentence. Never list tests, results, units, ranges, age or sex.
Return JSON: {"entities":[{"text":"...","type":"NAME|DOCTOR|FACILITY|ADDRESS|ID|CONTACT|DOB"}]}

DOCUMENT:
${e}`,te=null;function si(){if(te)return te;let e=_e(ei,"sealed-extension"),t=Nt(e,{backend:new P});return te=vt(t,{mode:_.ONLY_ON_DEVICE,onDeviceParams:{createOptions:Bt,promptOptions:{responseConstraint:ti}}}),te}async function Be(){try{return"LanguageModel"in self?await self.LanguageModel.availability(Bt):"unavailable"}catch{return"unavailable"}}async function $t(e){let t=Mt(e),n=!1;if(await Be()==="available")try{let o=si();try{await o.initializeDeviceModel?.()}catch{}let r=[];for(let a of Ut(e,2400)){let c=await o.generateContent(ni(a)),l=Ft(c.response.text());l?.entities&&(r=r.concat(l.entities))}t=xt(t,r,e),n=!0}catch(o){console.warn("[Sealed] on-device model could not run; pattern rules only.",o)}let{sealed:s,map:i}=kt(e,t);return{sealed:s,map:i,count:Object.keys(i).length,usedModel:n}}var p=e=>document.getElementById(e);chrome.storage.sync.get({enabled:!0},e=>{p("enabled").checked=e.enabled});p("enabled").addEventListener("change",()=>chrome.storage.sync.set({enabled:p("enabled").checked}));Be().then(e=>{p("status").textContent=e==="available"?"Gemini Nano: ready on this device":`Gemini Nano: ${e}. Pattern rules still work.`,p("status").className=e==="available"?"ok":"warn"});p("seal").addEventListener("click",async()=>{let e=p("in").value.trim();if(e){p("seal").disabled=!0,p("seal").textContent="Sealing on this device\u2026";try{let t=await $t(e);await chrome.storage.session.set({lastMap:t.map,lastCount:t.count,lastAt:Date.now()}),p("in").value=t.sealed,p("note").textContent=`${t.count} personal detail${t.count===1?"":"s"} hidden${t.usedModel?" with Gemini Nano and pattern rules":" with pattern rules"}. Copy it into any chatbot.`,p("copy").hidden=!1}catch(t){p("note").textContent="Could not seal: "+(t?.message||t)}p("seal").disabled=!1,p("seal").textContent="Seal on this device"}});p("copy").addEventListener("click",async()=>{await navigator.clipboard.writeText(p("in").value),p("copy").textContent="Copied",setTimeout(()=>{p("copy").textContent="Copy"},1500)});p("restore").addEventListener("click",async()=>{let{lastMap:e}=await chrome.storage.session.get("lastMap");if(!e){p("restored").textContent="Nothing sealed in this browser session yet.";return}p("restored").textContent=Fe(p("answer").value,e)});
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
