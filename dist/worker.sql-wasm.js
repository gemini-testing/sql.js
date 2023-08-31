
// We are modularizing this manually because the current modularize setting in Emscripten has some issues:
// https://github.com/kripken/emscripten/issues/5820
// In addition, When you use emcc's modularization, it still expects to export a global object called `Module`,
// which is able to be used/called before the WASM is loaded.
// The modularization below exports a promise that loads and resolves to the actual sql.js module.
// That way, this module can't be used before the WASM is finished loading.

// We are going to define a function that a user will call to start loading initializing our Sql.js library
// However, that function might be called multiple times, and on subsequent calls, we don't actually want it to instantiate a new instance of the Module
// Instead, we want to return the previously loaded module

// TODO: Make this not declare a global if used in the browser
var initSqlJsPromise = undefined;

var initSqlJs = function (moduleConfig) {

    if (initSqlJsPromise){
      return initSqlJsPromise;
    }
    // If we're here, we've never called this function before
    initSqlJsPromise = new Promise(function (resolveModule, reject) {

        // We are modularizing this manually because the current modularize setting in Emscripten has some issues:
        // https://github.com/kripken/emscripten/issues/5820

        // The way to affect the loading of emcc compiled modules is to create a variable called `Module` and add
        // properties to it, like `preRun`, `postRun`, etc
        // We are using that to get notified when the WASM has finished loading.
        // Only then will we return our promise

        // If they passed in a moduleConfig object, use that
        // Otherwise, initialize Module to the empty object
        var Module = typeof moduleConfig !== 'undefined' ? moduleConfig : {};

        // EMCC only allows for a single onAbort function (not an array of functions)
        // So if the user defined their own onAbort function, we remember it and call it
        var originalOnAbortFunction = Module['onAbort'];
        Module['onAbort'] = function (errorThatCausedAbort) {
            reject(new Error(errorThatCausedAbort));
            if (originalOnAbortFunction){
              originalOnAbortFunction(errorThatCausedAbort);
            }
        };

        Module['postRun'] = Module['postRun'] || [];
        Module['postRun'].push(function () {
            // When Emscripted calls postRun, this promise resolves with the built Module
            resolveModule(Module);
        });

        // There is a section of code in the emcc-generated code below that looks like this:
        // (Note that this is lowercase `module`)
        // if (typeof module !== 'undefined') {
        //     module['exports'] = Module;
        // }
        // When that runs, it's going to overwrite our own modularization export efforts in shell-post.js!
        // The only way to tell emcc not to emit it is to pass the MODULARIZE=1 or MODULARIZE_INSTANCE=1 flags,
        // but that carries with it additional unnecessary baggage/bugs we don't want either.
        // So, we have three options:
        // 1) We undefine `module`
        // 2) We remember what `module['exports']` was at the beginning of this function and we restore it later
        // 3) We write a script to remove those lines of code as part of the Make process.
        //
        // Since those are the only lines of code that care about module, we will undefine it. It's the most straightforward
        // of the options, and has the side effect of reducing emcc's efforts to modify the module if its output were to change in the future.
        // That's a nice side effect since we're handling the modularization efforts ourselves
        module = undefined;

        // The emcc-generated code and shell-post.js code goes below,
        // meaning that all of it runs inside of this promise. If anything throws an exception, our promise will abort

var e;e||(e=typeof Module !== 'undefined' ? Module : {});null;
e.onRuntimeInitialized=function(){function a(g,m){switch(typeof m){case "boolean":gc(g,m?1:0);break;case "number":hc(g,m);break;case "string":ic(g,m,-1,-1);break;case "object":if(null===m)kb(g);else if(null!=m.length){var n=ba(m);jc(g,n,m.length,-1);ca(n)}else xa(g,"Wrong API use : tried to return a value of an unknown type ("+m+").",-1);break;default:kb(g)}}function b(g,m){for(var n=[],p=0;p<g;p+=1){var v=l(m+4*p,"i32"),x=kc(v);if(1===x||2===x)v=lc(v);else if(3===x)v=mc(v);else if(4===x){x=v;v=nc(x);
x=oc(x);for(var H=new Uint8Array(v),G=0;G<v;G+=1)H[G]=r[x+G];v=H}else v=null;n.push(v)}return n}function c(g,m){this.La=g;this.db=m;this.Ja=1;this.fb=[]}function d(g,m){this.db=m;m=da(g)+1;this.Ya=ea(m);if(null===this.Ya)throw Error("Unable to allocate memory for the SQL string");t(g,u,this.Ya,m);this.eb=this.Ya;this.Ua=this.ib=null}function f(g,m){this.filename="dbfile_"+(4294967295*Math.random()>>>0);if(null!=g){var n=this.filename,p="/",v=n;p&&(p="string"==typeof p?p:fa(p),v=n?z(p+"/"+n):p);n=
ha(!0,!0);v=ia(v,(void 0!==n?n:438)&4095|32768,0);if(g){if("string"==typeof g){p=Array(g.length);for(var x=0,H=g.length;x<H;++x)p[x]=g.charCodeAt(x);g=p}ja(v,n|146);p=ka(v,577);la(p,g,0,g.length,0);ma(p);ja(v,n)}}this.handleError(q(this.filename,h));this.db=l(h,"i32");pc(this.db);m&&(this.run("VACUUM"),g=B("/").node,g=C(g,this.filename),n=g.Ha?g.Ha.length:0,n>=m||(m=Math.max(m,n*(1048576>n?2:1.125)|0),0!==n&&(m=Math.max(m,256)),n=g.Ha,g.Ha=new Uint8Array(m),0<g.Ma&&g.Ha.set(n.subarray(0,g.Ma),0)));
this.Za={};this.Na={}}var h=D(4),k=e.cwrap,q=k("sqlite3_open","number",["string","number"]),y=k("sqlite3_close_v2","number",["number"]),w=k("sqlite3_exec","number",["number","string","number","number","number"]),A=k("sqlite3_changes","number",["number"]),S=k("sqlite3_prepare_v2","number",["number","string","number","number","number"]),nb=k("sqlite3_sql","string",["number"]),qc=k("sqlite3_normalized_sql","string",["number"]),ob=k("sqlite3_prepare_v2","number",["number","number","number","number","number"]),
rc=k("sqlite3_bind_text","number",["number","number","number","number","number"]),pb=k("sqlite3_bind_blob","number",["number","number","number","number","number"]),sc=k("sqlite3_bind_double","number",["number","number","number"]),tc=k("sqlite3_bind_int","number",["number","number","number"]),uc=k("sqlite3_bind_parameter_index","number",["number","string"]),vc=k("sqlite3_step","number",["number"]),wc=k("sqlite3_errmsg","string",["number"]),xc=k("sqlite3_column_count","number",["number"]),yc=k("sqlite3_data_count",
"number",["number"]),zc=k("sqlite3_column_double","number",["number","number"]),qb=k("sqlite3_column_text","string",["number","number"]),Ac=k("sqlite3_column_blob","number",["number","number"]),Bc=k("sqlite3_column_bytes","number",["number","number"]),Cc=k("sqlite3_column_type","number",["number","number"]),Dc=k("sqlite3_column_name","string",["number","number"]),Ec=k("sqlite3_reset","number",["number"]),Fc=k("sqlite3_clear_bindings","number",["number"]),Gc=k("sqlite3_finalize","number",["number"]),
rb=k("sqlite3_create_function_v2","number","number string number number number number number number number".split(" ")),kc=k("sqlite3_value_type","number",["number"]),nc=k("sqlite3_value_bytes","number",["number"]),mc=k("sqlite3_value_text","string",["number"]),oc=k("sqlite3_value_blob","number",["number"]),lc=k("sqlite3_value_double","number",["number"]),hc=k("sqlite3_result_double","",["number","number"]),kb=k("sqlite3_result_null","",["number"]),ic=k("sqlite3_result_text","",["number","string",
"number","number"]),jc=k("sqlite3_result_blob","",["number","number","number","number"]),gc=k("sqlite3_result_int","",["number","number"]),xa=k("sqlite3_result_error","",["number","string","number"]),sb=k("sqlite3_aggregate_context","number",["number","number"]),pc=k("RegisterExtensionFunctions","number",["number"]);c.prototype.bind=function(g){if(!this.La)throw"Statement closed";this.reset();return Array.isArray(g)?this.xb(g):null!=g&&"object"===typeof g?this.yb(g):!0};c.prototype.step=function(){if(!this.La)throw"Statement closed";
this.Ja=1;var g=vc(this.La);switch(g){case 100:return!0;case 101:return!1;default:throw this.db.handleError(g);}};c.prototype.sb=function(g){null==g&&(g=this.Ja,this.Ja+=1);return zc(this.La,g)};c.prototype.Cb=function(g){null==g&&(g=this.Ja,this.Ja+=1);g=qb(this.La,g);if("function"!==typeof BigInt)throw Error("BigInt is not supported");return BigInt(g)};c.prototype.Db=function(g){null==g&&(g=this.Ja,this.Ja+=1);return qb(this.La,g)};c.prototype.getBlob=function(g){null==g&&(g=this.Ja,this.Ja+=1);
var m=Bc(this.La,g);g=Ac(this.La,g);for(var n=new Uint8Array(m),p=0;p<m;p+=1)n[p]=r[g+p];return n};c.prototype.get=function(g,m){m=m||{};null!=g&&this.bind(g)&&this.step();g=[];for(var n=yc(this.La),p=0;p<n;p+=1)switch(Cc(this.La,p)){case 1:var v=m.useBigInt?this.Cb(p):this.sb(p);g.push(v);break;case 2:g.push(this.sb(p));break;case 3:g.push(this.Db(p));break;case 4:g.push(this.getBlob(p));break;default:g.push(null)}return g};c.prototype.getColumnNames=function(){for(var g=[],m=xc(this.La),n=0;n<m;n+=
1)g.push(Dc(this.La,n));return g};c.prototype.getAsObject=function(g,m){g=this.get(g,m);m=this.getColumnNames();for(var n={},p=0;p<m.length;p+=1)n[m[p]]=g[p];return n};c.prototype.getSQL=function(){return nb(this.La)};c.prototype.getNormalizedSQL=function(){return qc(this.La)};c.prototype.run=function(g){null!=g&&this.bind(g);this.step();return this.reset()};c.prototype.nb=function(g,m){null==m&&(m=this.Ja,this.Ja+=1);g=oa(g);var n=ba(g);this.fb.push(n);this.db.handleError(rc(this.La,m,n,g.length-
1,0))};c.prototype.wb=function(g,m){null==m&&(m=this.Ja,this.Ja+=1);var n=ba(g);this.fb.push(n);this.db.handleError(pb(this.La,m,n,g.length,0))};c.prototype.mb=function(g,m){null==m&&(m=this.Ja,this.Ja+=1);this.db.handleError((g===(g|0)?tc:sc)(this.La,m,g))};c.prototype.zb=function(g){null==g&&(g=this.Ja,this.Ja+=1);pb(this.La,g,0,0,0)};c.prototype.ob=function(g,m){null==m&&(m=this.Ja,this.Ja+=1);switch(typeof g){case "string":this.nb(g,m);return;case "number":this.mb(g,m);return;case "bigint":this.nb(g.toString(),
m);return;case "boolean":this.mb(g+0,m);return;case "object":if(null===g){this.zb(m);return}if(null!=g.length){this.wb(g,m);return}}throw"Wrong API use : tried to bind a value of an unknown type ("+g+").";};c.prototype.yb=function(g){var m=this;Object.keys(g).forEach(function(n){var p=uc(m.La,n);0!==p&&m.ob(g[n],p)});return!0};c.prototype.xb=function(g){for(var m=0;m<g.length;m+=1)this.ob(g[m],m+1);return!0};c.prototype.reset=function(){this.freemem();return 0===Fc(this.La)&&0===Ec(this.La)};c.prototype.freemem=
function(){for(var g;void 0!==(g=this.fb.pop());)ca(g)};c.prototype.free=function(){this.freemem();var g=0===Gc(this.La);delete this.db.Za[this.La];this.La=0;return g};d.prototype.next=function(){if(null===this.Ya)return{done:!0};null!==this.Ua&&(this.Ua.free(),this.Ua=null);if(!this.db.db)throw this.gb(),Error("Database closed");var g=pa(),m=D(4);qa(h);qa(m);try{this.db.handleError(ob(this.db.db,this.eb,-1,h,m));this.eb=l(m,"i32");var n=l(h,"i32");if(0===n)return this.gb(),{done:!0};this.Ua=new c(n,
this.db);this.db.Za[n]=this.Ua;return{value:this.Ua,done:!1}}catch(p){throw this.ib=E(this.eb),this.gb(),p;}finally{ra(g)}};d.prototype.gb=function(){ca(this.Ya);this.Ya=null};d.prototype.getRemainingSQL=function(){return null!==this.ib?this.ib:E(this.eb)};"function"===typeof Symbol&&"symbol"===typeof Symbol.iterator&&(d.prototype[Symbol.iterator]=function(){return this});f.prototype.run=function(g,m){if(!this.db)throw"Database closed";if(m){g=this.prepare(g,m);try{g.step()}finally{g.free()}}else this.handleError(w(this.db,
g,0,0,h));return this};f.prototype.exec=function(g,m,n){if(!this.db)throw"Database closed";var p=pa(),v=null;try{var x=da(g)+1,H=D(x);t(g,r,H,x);var G=H;var I=D(4);for(g=[];0!==l(G,"i8");){qa(h);qa(I);this.handleError(ob(this.db,G,-1,h,I));var J=l(h,"i32");G=l(I,"i32");if(0!==J){x=null;v=new c(J,this);for(null!=m&&v.bind(m);v.step();)null===x&&(x={columns:v.getColumnNames(),values:[]},g.push(x)),x.values.push(v.get(null,n));v.free()}}return g}catch(na){throw v&&v.free(),na;}finally{ra(p)}};f.prototype.each=
function(g,m,n,p,v){"function"===typeof m&&(p=n,n=m,m=void 0);g=this.prepare(g,m);try{for(;g.step();)n(g.getAsObject(null,v))}finally{g.free()}if("function"===typeof p)return p()};f.prototype.prepare=function(g,m){qa(h);this.handleError(S(this.db,g,-1,h,0));g=l(h,"i32");if(0===g)throw"Nothing to prepare";var n=new c(g,this);null!=m&&n.bind(m);return this.Za[g]=n};f.prototype.iterateStatements=function(g){return new d(g,this)};f.prototype["export"]=function(){Object.values(this.Za).forEach(function(m){m.free()});
Object.values(this.Na).forEach(sa);this.Na={};this.handleError(y(this.db));var g=ta(this.filename);this.handleError(q(this.filename,h));this.db=l(h,"i32");return g};f.prototype.close=function(){null!==this.db&&(Object.values(this.Za).forEach(function(g){g.free()}),Object.values(this.Na).forEach(sa),this.Na={},this.handleError(y(this.db)),ua("/"+this.filename),this.db=null)};f.prototype.handleError=function(g){if(0===g)return null;g=wc(this.db);throw Error(g);};f.prototype.getRowsModified=function(){return A(this.db)};
f.prototype.create_function=function(g,m){Object.prototype.hasOwnProperty.call(this.Na,g)&&(sa(this.Na[g]),delete this.Na[g]);var n=va(function(p,v,x){v=b(v,x);try{var H=m.apply(null,v)}catch(G){xa(p,G,-1);return}a(p,H)},"viii");this.Na[g]=n;this.handleError(rb(this.db,g,m.length,1,0,n,0,0,0));return this};f.prototype.create_aggregate=function(g,m){var n=m.init||function(){return null},p=m.finalize||function(I){return I},v=m.step;if(!v)throw"An aggregate function must have a step function in "+g;
var x={};Object.hasOwnProperty.call(this.Na,g)&&(sa(this.Na[g]),delete this.Na[g]);m=g+"__finalize";Object.hasOwnProperty.call(this.Na,m)&&(sa(this.Na[m]),delete this.Na[m]);var H=va(function(I,J,na){var aa=sb(I,1);Object.hasOwnProperty.call(x,aa)||(x[aa]=n());J=b(J,na);J=[x[aa]].concat(J);try{x[aa]=v.apply(null,J)}catch(Ic){delete x[aa],xa(I,Ic,-1)}},"viii"),G=va(function(I){var J=sb(I,1);try{var na=p(x[J])}catch(aa){delete x[J];xa(I,aa,-1);return}a(I,na);delete x[J]},"vi");this.Na[g]=H;this.Na[m]=
G;this.handleError(rb(this.db,g,v.length-1,1,0,0,H,G,0));return this};e.Database=f};var wa=Object.assign({},e),ya="./this.program",za="object"==typeof window,Aa="function"==typeof importScripts,Ba="object"==typeof process&&"object"==typeof process.versions&&"string"==typeof process.versions.node,F="",Ca,Da,Ea,fs,Fa,Ga;
if(Ba)F=Aa?require("path").dirname(F)+"/":__dirname+"/",Ga=()=>{Fa||(fs=require("fs"),Fa=require("path"))},Ca=function(a,b){Ga();a=Fa.normalize(a);return fs.readFileSync(a,b?void 0:"utf8")},Ea=a=>{a=Ca(a,!0);a.buffer||(a=new Uint8Array(a));return a},Da=(a,b,c)=>{Ga();a=Fa.normalize(a);fs.readFile(a,function(d,f){d?c(d):b(f.buffer)})},1<process.argv.length&&(ya=process.argv[1].replace(/\\/g,"/")),process.argv.slice(2),"undefined"!=typeof module&&(module.exports=e),e.inspect=function(){return"[Emscripten Module object]"};
else if(za||Aa)Aa?F=self.location.href:"undefined"!=typeof document&&document.currentScript&&(F=document.currentScript.src),F=0!==F.indexOf("blob:")?F.substr(0,F.replace(/[?#].*/,"").lastIndexOf("/")+1):"",Ca=a=>{var b=new XMLHttpRequest;b.open("GET",a,!1);b.send(null);return b.responseText},Aa&&(Ea=a=>{var b=new XMLHttpRequest;b.open("GET",a,!1);b.responseType="arraybuffer";b.send(null);return new Uint8Array(b.response)}),Da=(a,b,c)=>{var d=new XMLHttpRequest;d.open("GET",a,!0);d.responseType="arraybuffer";
d.onload=()=>{200==d.status||0==d.status&&d.response?b(d.response):c()};d.onerror=c;d.send(null)};var Ha=e.print||console.log.bind(console),Ia=e.printErr||console.warn.bind(console);Object.assign(e,wa);wa=null;e.thisProgram&&(ya=e.thisProgram);var Ja;e.wasmBinary&&(Ja=e.wasmBinary);var noExitRuntime=e.noExitRuntime||!0;"object"!=typeof WebAssembly&&K("no native wasm support detected");var Ka,La=!1,Ma="undefined"!=typeof TextDecoder?new TextDecoder("utf8"):void 0;
function Na(a,b,c){var d=b+c;for(c=b;a[c]&&!(c>=d);)++c;if(16<c-b&&a.buffer&&Ma)return Ma.decode(a.subarray(b,c));for(d="";b<c;){var f=a[b++];if(f&128){var h=a[b++]&63;if(192==(f&224))d+=String.fromCharCode((f&31)<<6|h);else{var k=a[b++]&63;f=224==(f&240)?(f&15)<<12|h<<6|k:(f&7)<<18|h<<12|k<<6|a[b++]&63;65536>f?d+=String.fromCharCode(f):(f-=65536,d+=String.fromCharCode(55296|f>>10,56320|f&1023))}}else d+=String.fromCharCode(f)}return d}function E(a,b){return a?Na(u,a,b):""}
function t(a,b,c,d){if(!(0<d))return 0;var f=c;d=c+d-1;for(var h=0;h<a.length;++h){var k=a.charCodeAt(h);if(55296<=k&&57343>=k){var q=a.charCodeAt(++h);k=65536+((k&1023)<<10)|q&1023}if(127>=k){if(c>=d)break;b[c++]=k}else{if(2047>=k){if(c+1>=d)break;b[c++]=192|k>>6}else{if(65535>=k){if(c+2>=d)break;b[c++]=224|k>>12}else{if(c+3>=d)break;b[c++]=240|k>>18;b[c++]=128|k>>12&63}b[c++]=128|k>>6&63}b[c++]=128|k&63}}b[c]=0;return c-f}
function da(a){for(var b=0,c=0;c<a.length;++c){var d=a.charCodeAt(c);127>=d?b++:2047>=d?b+=2:55296<=d&&57343>=d?(b+=4,++c):b+=3}return b}var Oa,r,u,Pa,L,M,Qa,Ra;function Sa(){var a=Ka.buffer;Oa=a;e.HEAP8=r=new Int8Array(a);e.HEAP16=Pa=new Int16Array(a);e.HEAP32=L=new Int32Array(a);e.HEAPU8=u=new Uint8Array(a);e.HEAPU16=new Uint16Array(a);e.HEAPU32=M=new Uint32Array(a);e.HEAPF32=Qa=new Float32Array(a);e.HEAPF64=Ra=new Float64Array(a)}var N,Ta=[],Ua=[],Va=[];
function Wa(){var a=e.preRun.shift();Ta.unshift(a)}var Xa=0,Ya=null,Za=null;function K(a){if(e.onAbort)e.onAbort(a);a="Aborted("+a+")";Ia(a);La=!0;throw new WebAssembly.RuntimeError(a+". Build with -sASSERTIONS for more info.");}function $a(){return O.startsWith("data:application/octet-stream;base64,")}var O;O="sql-wasm.wasm";if(!$a()){var ab=O;O=e.locateFile?e.locateFile(ab,F):F+ab}
function bb(){var a=O;try{if(a==O&&Ja)return new Uint8Array(Ja);if(Ea)return Ea(a);throw"both async and sync fetching of the wasm failed";}catch(b){K(b)}}
function cb(){if(!Ja&&(za||Aa)){if("function"==typeof fetch&&!O.startsWith("file://"))return fetch(O,{credentials:"same-origin"}).then(function(a){if(!a.ok)throw"failed to load wasm binary file at '"+O+"'";return a.arrayBuffer()}).catch(function(){return bb()});if(Da)return new Promise(function(a,b){Da(O,function(c){a(new Uint8Array(c))},b)})}return Promise.resolve().then(function(){return bb()})}var P,Q;function db(a){for(;0<a.length;)a.shift()(e)}
function l(a,b="i8"){b.endsWith("*")&&(b="*");switch(b){case "i1":return r[a>>0];case "i8":return r[a>>0];case "i16":return Pa[a>>1];case "i32":return L[a>>2];case "i64":return L[a>>2];case "float":return Qa[a>>2];case "double":return Ra[a>>3];case "*":return M[a>>2];default:K("invalid type for getValue: "+b)}return null}
function qa(a){var b="i32";b.endsWith("*")&&(b="*");switch(b){case "i1":r[a>>0]=0;break;case "i8":r[a>>0]=0;break;case "i16":Pa[a>>1]=0;break;case "i32":L[a>>2]=0;break;case "i64":Q=[0,(P=0,1<=+Math.abs(P)?0<P?(Math.min(+Math.floor(P/4294967296),4294967295)|0)>>>0:~~+Math.ceil((P-+(~~P>>>0))/4294967296)>>>0:0)];L[a>>2]=Q[0];L[a+4>>2]=Q[1];break;case "float":Qa[a>>2]=0;break;case "double":Ra[a>>3]=0;break;case "*":M[a>>2]=0;break;default:K("invalid type for setValue: "+b)}}
var eb=(a,b)=>{for(var c=0,d=a.length-1;0<=d;d--){var f=a[d];"."===f?a.splice(d,1):".."===f?(a.splice(d,1),c++):c&&(a.splice(d,1),c--)}if(b)for(;c;c--)a.unshift("..");return a},z=a=>{var b="/"===a.charAt(0),c="/"===a.substr(-1);(a=eb(a.split("/").filter(d=>!!d),!b).join("/"))||b||(a=".");a&&c&&(a+="/");return(b?"/":"")+a},fb=a=>{var b=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(a).slice(1);a=b[0];b=b[1];if(!a&&!b)return".";b&&(b=b.substr(0,b.length-1));return a+b},gb=a=>{if("/"===
a)return"/";a=z(a);a=a.replace(/\/$/,"");var b=a.lastIndexOf("/");return-1===b?a:a.substr(b+1)};function hb(){if("object"==typeof crypto&&"function"==typeof crypto.getRandomValues){var a=new Uint8Array(1);return()=>{crypto.getRandomValues(a);return a[0]}}if(Ba)try{var b=require("crypto");return()=>b.randomBytes(1)[0]}catch(c){}return()=>K("randomDevice")}
function ib(){for(var a="",b=!1,c=arguments.length-1;-1<=c&&!b;c--){b=0<=c?arguments[c]:"/";if("string"!=typeof b)throw new TypeError("Arguments to path.resolve must be strings");if(!b)return"";a=b+"/"+a;b="/"===b.charAt(0)}a=eb(a.split("/").filter(d=>!!d),!b).join("/");return(b?"/":"")+a||"."}function oa(a,b){var c=Array(da(a)+1);a=t(a,c,0,c.length);b&&(c.length=a);return c}var jb=[];function lb(a,b){jb[a]={input:[],output:[],Xa:b};mb(a,tb)}
var tb={open:function(a){var b=jb[a.node.rdev];if(!b)throw new R(43);a.tty=b;a.seekable=!1},close:function(a){a.tty.Xa.fsync(a.tty)},fsync:function(a){a.tty.Xa.fsync(a.tty)},read:function(a,b,c,d){if(!a.tty||!a.tty.Xa.tb)throw new R(60);for(var f=0,h=0;h<d;h++){try{var k=a.tty.Xa.tb(a.tty)}catch(q){throw new R(29);}if(void 0===k&&0===f)throw new R(6);if(null===k||void 0===k)break;f++;b[c+h]=k}f&&(a.node.timestamp=Date.now());return f},write:function(a,b,c,d){if(!a.tty||!a.tty.Xa.jb)throw new R(60);
try{for(var f=0;f<d;f++)a.tty.Xa.jb(a.tty,b[c+f])}catch(h){throw new R(29);}d&&(a.node.timestamp=Date.now());return f}},ub={tb:function(a){if(!a.input.length){var b=null;if(Ba){var c=Buffer.alloc(256),d=0;try{d=fs.readSync(process.stdin.fd,c,0,256,-1)}catch(f){if(f.toString().includes("EOF"))d=0;else throw f;}0<d?b=c.slice(0,d).toString("utf-8"):b=null}else"undefined"!=typeof window&&"function"==typeof window.prompt?(b=window.prompt("Input: "),null!==b&&(b+="\n")):"function"==typeof readline&&(b=
readline(),null!==b&&(b+="\n"));if(!b)return null;a.input=oa(b,!0)}return a.input.shift()},jb:function(a,b){null===b||10===b?(Ha(Na(a.output,0)),a.output=[]):0!=b&&a.output.push(b)},fsync:function(a){a.output&&0<a.output.length&&(Ha(Na(a.output,0)),a.output=[])}},vb={jb:function(a,b){null===b||10===b?(Ia(Na(a.output,0)),a.output=[]):0!=b&&a.output.push(b)},fsync:function(a){a.output&&0<a.output.length&&(Ia(Na(a.output,0)),a.output=[])}},T={Qa:null,Ra:function(){return T.createNode(null,"/",16895,
0)},createNode:function(a,b,c,d){if(24576===(c&61440)||4096===(c&61440))throw new R(63);T.Qa||(T.Qa={dir:{node:{Pa:T.Ga.Pa,Oa:T.Ga.Oa,lookup:T.Ga.lookup,ab:T.Ga.ab,rename:T.Ga.rename,unlink:T.Ga.unlink,rmdir:T.Ga.rmdir,readdir:T.Ga.readdir,symlink:T.Ga.symlink},stream:{Ta:T.Ia.Ta}},file:{node:{Pa:T.Ga.Pa,Oa:T.Ga.Oa},stream:{Ta:T.Ia.Ta,read:T.Ia.read,write:T.Ia.write,lb:T.Ia.lb,bb:T.Ia.bb,cb:T.Ia.cb}},link:{node:{Pa:T.Ga.Pa,Oa:T.Ga.Oa,readlink:T.Ga.readlink},stream:{}},pb:{node:{Pa:T.Ga.Pa,Oa:T.Ga.Oa},
stream:wb}});c=xb(a,b,c,d);16384===(c.mode&61440)?(c.Ga=T.Qa.dir.node,c.Ia=T.Qa.dir.stream,c.Ha={}):32768===(c.mode&61440)?(c.Ga=T.Qa.file.node,c.Ia=T.Qa.file.stream,c.Ma=0,c.Ha=null):40960===(c.mode&61440)?(c.Ga=T.Qa.link.node,c.Ia=T.Qa.link.stream):8192===(c.mode&61440)&&(c.Ga=T.Qa.pb.node,c.Ia=T.Qa.pb.stream);c.timestamp=Date.now();a&&(a.Ha[b]=c,a.timestamp=c.timestamp);return c},Jb:function(a){return a.Ha?a.Ha.subarray?a.Ha.subarray(0,a.Ma):new Uint8Array(a.Ha):new Uint8Array(0)},qb:function(a,
b){var c=a.Ha?a.Ha.length:0;c>=b||(b=Math.max(b,c*(1048576>c?2:1.125)>>>0),0!=c&&(b=Math.max(b,256)),c=a.Ha,a.Ha=new Uint8Array(b),0<a.Ma&&a.Ha.set(c.subarray(0,a.Ma),0))},Gb:function(a,b){if(a.Ma!=b)if(0==b)a.Ha=null,a.Ma=0;else{var c=a.Ha;a.Ha=new Uint8Array(b);c&&a.Ha.set(c.subarray(0,Math.min(b,a.Ma)));a.Ma=b}},Ga:{Pa:function(a){var b={};b.dev=8192===(a.mode&61440)?a.id:1;b.ino=a.id;b.mode=a.mode;b.nlink=1;b.uid=0;b.gid=0;b.rdev=a.rdev;16384===(a.mode&61440)?b.size=4096:32768===(a.mode&61440)?
b.size=a.Ma:40960===(a.mode&61440)?b.size=a.link.length:b.size=0;b.atime=new Date(a.timestamp);b.mtime=new Date(a.timestamp);b.ctime=new Date(a.timestamp);b.Ab=4096;b.blocks=Math.ceil(b.size/b.Ab);return b},Oa:function(a,b){void 0!==b.mode&&(a.mode=b.mode);void 0!==b.timestamp&&(a.timestamp=b.timestamp);void 0!==b.size&&T.Gb(a,b.size)},lookup:function(){throw yb[44];},ab:function(a,b,c,d){return T.createNode(a,b,c,d)},rename:function(a,b,c){if(16384===(a.mode&61440)){try{var d=C(b,c)}catch(h){}if(d)for(var f in d.Ha)throw new R(55);
}delete a.parent.Ha[a.name];a.parent.timestamp=Date.now();a.name=c;b.Ha[c]=a;b.timestamp=a.parent.timestamp;a.parent=b},unlink:function(a,b){delete a.Ha[b];a.timestamp=Date.now()},rmdir:function(a,b){var c=C(a,b),d;for(d in c.Ha)throw new R(55);delete a.Ha[b];a.timestamp=Date.now()},readdir:function(a){var b=[".",".."],c;for(c in a.Ha)a.Ha.hasOwnProperty(c)&&b.push(c);return b},symlink:function(a,b,c){a=T.createNode(a,b,41471,0);a.link=c;return a},readlink:function(a){if(40960!==(a.mode&61440))throw new R(28);
return a.link}},Ia:{read:function(a,b,c,d,f){var h=a.node.Ha;if(f>=a.node.Ma)return 0;a=Math.min(a.node.Ma-f,d);if(8<a&&h.subarray)b.set(h.subarray(f,f+a),c);else for(d=0;d<a;d++)b[c+d]=h[f+d];return a},write:function(a,b,c,d,f,h){b.buffer===r.buffer&&(h=!1);if(!d)return 0;a=a.node;a.timestamp=Date.now();if(b.subarray&&(!a.Ha||a.Ha.subarray)){if(h)return a.Ha=b.subarray(c,c+d),a.Ma=d;if(0===a.Ma&&0===f)return a.Ha=b.slice(c,c+d),a.Ma=d;if(f+d<=a.Ma)return a.Ha.set(b.subarray(c,c+d),f),d}T.qb(a,f+
d);if(a.Ha.subarray&&b.subarray)a.Ha.set(b.subarray(c,c+d),f);else for(h=0;h<d;h++)a.Ha[f+h]=b[c+h];a.Ma=Math.max(a.Ma,f+d);return d},Ta:function(a,b,c){1===c?b+=a.position:2===c&&32768===(a.node.mode&61440)&&(b+=a.node.Ma);if(0>b)throw new R(28);return b},lb:function(a,b,c){T.qb(a.node,b+c);a.node.Ma=Math.max(a.node.Ma,b+c)},bb:function(a,b,c,d,f){if(32768!==(a.node.mode&61440))throw new R(43);a=a.node.Ha;if(f&2||a.buffer!==Oa){if(0<c||c+b<a.length)a.subarray?a=a.subarray(c,c+b):a=Array.prototype.slice.call(a,
c,c+b);c=!0;b=65536*Math.ceil(b/65536);(f=zb(65536,b))?(u.fill(0,f,f+b),b=f):b=0;if(!b)throw new R(48);r.set(a,b)}else c=!1,b=a.byteOffset;return{Fb:b,vb:c}},cb:function(a,b,c,d,f){if(32768!==(a.node.mode&61440))throw new R(43);if(f&2)return 0;T.Ia.write(a,b,0,d,c,!1);return 0}}},Ab=null,Bb={},U=[],Cb=1,V=null,Db=!0,R=null,yb={},B=(a,b={})=>{a=ib("/",a);if(!a)return{path:"",node:null};b=Object.assign({rb:!0,kb:0},b);if(8<b.kb)throw new R(32);a=eb(a.split("/").filter(k=>!!k),!1);for(var c=Ab,d="/",
f=0;f<a.length;f++){var h=f===a.length-1;if(h&&b.parent)break;c=C(c,a[f]);d=z(d+"/"+a[f]);c.Va&&(!h||h&&b.rb)&&(c=c.Va.root);if(!h||b.Sa)for(h=0;40960===(c.mode&61440);)if(c=Eb(d),d=ib(fb(d),c),c=B(d,{kb:b.kb+1}).node,40<h++)throw new R(32);}return{path:d,node:c}},fa=a=>{for(var b;;){if(a===a.parent)return a=a.Ra.ub,b?"/"!==a[a.length-1]?a+"/"+b:a+b:a;b=b?a.name+"/"+b:a.name;a=a.parent}},Fb=(a,b)=>{for(var c=0,d=0;d<b.length;d++)c=(c<<5)-c+b.charCodeAt(d)|0;return(a+c>>>0)%V.length},Gb=a=>{var b=
Fb(a.parent.id,a.name);if(V[b]===a)V[b]=a.Wa;else for(b=V[b];b;){if(b.Wa===a){b.Wa=a.Wa;break}b=b.Wa}},C=(a,b)=>{var c;if(c=(c=Hb(a,"x"))?c:a.Ga.lookup?0:2)throw new R(c,a);for(c=V[Fb(a.id,b)];c;c=c.Wa){var d=c.name;if(c.parent.id===a.id&&d===b)return c}return a.Ga.lookup(a,b)},xb=(a,b,c,d)=>{a=new Ib(a,b,c,d);b=Fb(a.parent.id,a.name);a.Wa=V[b];return V[b]=a},Jb={r:0,"r+":2,w:577,"w+":578,a:1089,"a+":1090},Kb=a=>{var b=["r","w","rw"][a&3];a&512&&(b+="w");return b},Hb=(a,b)=>{if(Db)return 0;if(!b.includes("r")||
a.mode&292){if(b.includes("w")&&!(a.mode&146)||b.includes("x")&&!(a.mode&73))return 2}else return 2;return 0},Lb=(a,b)=>{try{return C(a,b),20}catch(c){}return Hb(a,"wx")},Mb=(a,b,c)=>{try{var d=C(a,b)}catch(f){return f.Ka}if(a=Hb(a,"wx"))return a;if(c){if(16384!==(d.mode&61440))return 54;if(d===d.parent||"/"===fa(d))return 10}else if(16384===(d.mode&61440))return 31;return 0},Nb=(a=0)=>{for(;4096>=a;a++)if(!U[a])return a;throw new R(33);},Pb=(a,b)=>{Ob||(Ob=function(){this.$a={}},Ob.prototype={},
Object.defineProperties(Ob.prototype,{object:{get:function(){return this.node},set:function(c){this.node=c}},flags:{get:function(){return this.$a.flags},set:function(c){this.$a.flags=c}},position:{get:function(){return this.$a.position},set:function(c){this.$a.position=c}}}));a=Object.assign(new Ob,a);b=Nb(b);a.fd=b;return U[b]=a},wb={open:a=>{a.Ia=Bb[a.node.rdev].Ia;a.Ia.open&&a.Ia.open(a)},Ta:()=>{throw new R(70);}},mb=(a,b)=>{Bb[a]={Ia:b}},Qb=(a,b)=>{var c="/"===b,d=!b;if(c&&Ab)throw new R(10);
if(!c&&!d){var f=B(b,{rb:!1});b=f.path;f=f.node;if(f.Va)throw new R(10);if(16384!==(f.mode&61440))throw new R(54);}b={type:a,Kb:{},ub:b,Eb:[]};a=a.Ra(b);a.Ra=b;b.root=a;c?Ab=a:f&&(f.Va=b,f.Ra&&f.Ra.Eb.push(b))},ia=(a,b,c)=>{var d=B(a,{parent:!0}).node;a=gb(a);if(!a||"."===a||".."===a)throw new R(28);var f=Lb(d,a);if(f)throw new R(f);if(!d.Ga.ab)throw new R(63);return d.Ga.ab(d,a,b,c)},W=(a,b)=>ia(a,(void 0!==b?b:511)&1023|16384,0),Rb=(a,b,c)=>{"undefined"==typeof c&&(c=b,b=438);ia(a,b|8192,c)},Sb=
(a,b)=>{if(!ib(a))throw new R(44);var c=B(b,{parent:!0}).node;if(!c)throw new R(44);b=gb(b);var d=Lb(c,b);if(d)throw new R(d);if(!c.Ga.symlink)throw new R(63);c.Ga.symlink(c,b,a)},Tb=a=>{var b=B(a,{parent:!0}).node;a=gb(a);var c=C(b,a),d=Mb(b,a,!0);if(d)throw new R(d);if(!b.Ga.rmdir)throw new R(63);if(c.Va)throw new R(10);b.Ga.rmdir(b,a);Gb(c)},ua=a=>{var b=B(a,{parent:!0}).node;if(!b)throw new R(44);a=gb(a);var c=C(b,a),d=Mb(b,a,!1);if(d)throw new R(d);if(!b.Ga.unlink)throw new R(63);if(c.Va)throw new R(10);
b.Ga.unlink(b,a);Gb(c)},Eb=a=>{a=B(a).node;if(!a)throw new R(44);if(!a.Ga.readlink)throw new R(28);return ib(fa(a.parent),a.Ga.readlink(a))},Ub=(a,b)=>{a=B(a,{Sa:!b}).node;if(!a)throw new R(44);if(!a.Ga.Pa)throw new R(63);return a.Ga.Pa(a)},Vb=a=>Ub(a,!0),ja=(a,b)=>{a="string"==typeof a?B(a,{Sa:!0}).node:a;if(!a.Ga.Oa)throw new R(63);a.Ga.Oa(a,{mode:b&4095|a.mode&-4096,timestamp:Date.now()})},Wb=(a,b)=>{if(0>b)throw new R(28);a="string"==typeof a?B(a,{Sa:!0}).node:a;if(!a.Ga.Oa)throw new R(63);if(16384===
(a.mode&61440))throw new R(31);if(32768!==(a.mode&61440))throw new R(28);var c=Hb(a,"w");if(c)throw new R(c);a.Ga.Oa(a,{size:b,timestamp:Date.now()})},ka=(a,b,c)=>{if(""===a)throw new R(44);if("string"==typeof b){var d=Jb[b];if("undefined"==typeof d)throw Error("Unknown file open mode: "+b);b=d}c=b&64?("undefined"==typeof c?438:c)&4095|32768:0;if("object"==typeof a)var f=a;else{a=z(a);try{f=B(a,{Sa:!(b&131072)}).node}catch(h){}}d=!1;if(b&64)if(f){if(b&128)throw new R(20);}else f=ia(a,c,0),d=!0;if(!f)throw new R(44);
8192===(f.mode&61440)&&(b&=-513);if(b&65536&&16384!==(f.mode&61440))throw new R(54);if(!d&&(c=f?40960===(f.mode&61440)?32:16384===(f.mode&61440)&&("r"!==Kb(b)||b&512)?31:Hb(f,Kb(b)):44))throw new R(c);b&512&&!d&&Wb(f,0);b&=-131713;f=Pb({node:f,path:fa(f),flags:b,seekable:!0,position:0,Ia:f.Ia,Ib:[],error:!1});f.Ia.open&&f.Ia.open(f);!e.logReadFiles||b&1||(Xb||(Xb={}),a in Xb||(Xb[a]=1));return f},ma=a=>{if(null===a.fd)throw new R(8);a.hb&&(a.hb=null);try{a.Ia.close&&a.Ia.close(a)}catch(b){throw b;
}finally{U[a.fd]=null}a.fd=null},Yb=(a,b,c)=>{if(null===a.fd)throw new R(8);if(!a.seekable||!a.Ia.Ta)throw new R(70);if(0!=c&&1!=c&&2!=c)throw new R(28);a.position=a.Ia.Ta(a,b,c);a.Ib=[]},Zb=(a,b,c,d,f)=>{if(0>d||0>f)throw new R(28);if(null===a.fd)throw new R(8);if(1===(a.flags&2097155))throw new R(8);if(16384===(a.node.mode&61440))throw new R(31);if(!a.Ia.read)throw new R(28);var h="undefined"!=typeof f;if(!h)f=a.position;else if(!a.seekable)throw new R(70);b=a.Ia.read(a,b,c,d,f);h||(a.position+=
b);return b},la=(a,b,c,d,f)=>{if(0>d||0>f)throw new R(28);if(null===a.fd)throw new R(8);if(0===(a.flags&2097155))throw new R(8);if(16384===(a.node.mode&61440))throw new R(31);if(!a.Ia.write)throw new R(28);a.seekable&&a.flags&1024&&Yb(a,0,2);var h="undefined"!=typeof f;if(!h)f=a.position;else if(!a.seekable)throw new R(70);b=a.Ia.write(a,b,c,d,f,void 0);h||(a.position+=b);return b},ta=a=>{var b="binary";if("utf8"!==b&&"binary"!==b)throw Error('Invalid encoding type "'+b+'"');var c;var d=ka(a,d||0);
a=Ub(a).size;var f=new Uint8Array(a);Zb(d,f,0,a,0);"utf8"===b?c=Na(f,0):"binary"===b&&(c=f);ma(d);return c},$b=()=>{R||(R=function(a,b){this.node=b;this.Hb=function(c){this.Ka=c};this.Hb(a);this.message="FS error"},R.prototype=Error(),R.prototype.constructor=R,[44].forEach(a=>{yb[a]=new R(a);yb[a].stack="<generic error, no stack>"}))},ac,ha=(a,b)=>{var c=0;a&&(c|=365);b&&(c|=146);return c},cc=(a,b,c)=>{a=z("/dev/"+a);var d=ha(!!b,!!c);bc||(bc=64);var f=bc++<<8|0;mb(f,{open:h=>{h.seekable=!1},close:()=>
{c&&c.buffer&&c.buffer.length&&c(10)},read:(h,k,q,y)=>{for(var w=0,A=0;A<y;A++){try{var S=b()}catch(nb){throw new R(29);}if(void 0===S&&0===w)throw new R(6);if(null===S||void 0===S)break;w++;k[q+A]=S}w&&(h.node.timestamp=Date.now());return w},write:(h,k,q,y)=>{for(var w=0;w<y;w++)try{c(k[q+w])}catch(A){throw new R(29);}y&&(h.node.timestamp=Date.now());return w}});Rb(a,d,f)},bc,X={},Ob,Xb;
function dc(a,b,c){if("/"===b.charAt(0))return b;a=-100===a?"/":Y(a).path;if(0==b.length){if(!c)throw new R(44);return a}return z(a+"/"+b)}
function ec(a,b,c){try{var d=a(b)}catch(f){if(f&&f.node&&z(b)!==z(fa(f.node)))return-54;throw f;}L[c>>2]=d.dev;L[c+8>>2]=d.ino;L[c+12>>2]=d.mode;M[c+16>>2]=d.nlink;L[c+20>>2]=d.uid;L[c+24>>2]=d.gid;L[c+28>>2]=d.rdev;Q=[d.size>>>0,(P=d.size,1<=+Math.abs(P)?0<P?(Math.min(+Math.floor(P/4294967296),4294967295)|0)>>>0:~~+Math.ceil((P-+(~~P>>>0))/4294967296)>>>0:0)];L[c+40>>2]=Q[0];L[c+44>>2]=Q[1];L[c+48>>2]=4096;L[c+52>>2]=d.blocks;Q=[Math.floor(d.atime.getTime()/1E3)>>>0,(P=Math.floor(d.atime.getTime()/
1E3),1<=+Math.abs(P)?0<P?(Math.min(+Math.floor(P/4294967296),4294967295)|0)>>>0:~~+Math.ceil((P-+(~~P>>>0))/4294967296)>>>0:0)];L[c+56>>2]=Q[0];L[c+60>>2]=Q[1];M[c+64>>2]=0;Q=[Math.floor(d.mtime.getTime()/1E3)>>>0,(P=Math.floor(d.mtime.getTime()/1E3),1<=+Math.abs(P)?0<P?(Math.min(+Math.floor(P/4294967296),4294967295)|0)>>>0:~~+Math.ceil((P-+(~~P>>>0))/4294967296)>>>0:0)];L[c+72>>2]=Q[0];L[c+76>>2]=Q[1];M[c+80>>2]=0;Q=[Math.floor(d.ctime.getTime()/1E3)>>>0,(P=Math.floor(d.ctime.getTime()/1E3),1<=+Math.abs(P)?
0<P?(Math.min(+Math.floor(P/4294967296),4294967295)|0)>>>0:~~+Math.ceil((P-+(~~P>>>0))/4294967296)>>>0:0)];L[c+88>>2]=Q[0];L[c+92>>2]=Q[1];M[c+96>>2]=0;Q=[d.ino>>>0,(P=d.ino,1<=+Math.abs(P)?0<P?(Math.min(+Math.floor(P/4294967296),4294967295)|0)>>>0:~~+Math.ceil((P-+(~~P>>>0))/4294967296)>>>0:0)];L[c+104>>2]=Q[0];L[c+108>>2]=Q[1];return 0}var fc=void 0;function Hc(){fc+=4;return L[fc-4>>2]}function Y(a){a=U[a];if(!a)throw new R(8);return a}function Jc(a){return M[a>>2]+4294967296*L[a+4>>2]}
function Kc(a){var b=da(a)+1,c=ea(b);c&&t(a,r,c,b);return c}function Lc(a,b,c){function d(y){return(y=y.toTimeString().match(/\(([A-Za-z ]+)\)$/))?y[1]:"GMT"}var f=(new Date).getFullYear(),h=new Date(f,0,1),k=new Date(f,6,1);f=h.getTimezoneOffset();var q=k.getTimezoneOffset();L[a>>2]=60*Math.max(f,q);L[b>>2]=Number(f!=q);a=d(h);b=d(k);a=Kc(a);b=Kc(b);q<f?(M[c>>2]=a,M[c+4>>2]=b):(M[c>>2]=b,M[c+4>>2]=a)}function Mc(a,b,c){Mc.Bb||(Mc.Bb=!0,Lc(a,b,c))}var Nc;
Nc=Ba?()=>{var a=process.hrtime();return 1E3*a[0]+a[1]/1E6}:()=>performance.now();var Oc={};function Pc(){if(!Qc){var a={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:("object"==typeof navigator&&navigator.languages&&navigator.languages[0]||"C").replace("-","_")+".UTF-8",_:ya||"./this.program"},b;for(b in Oc)void 0===Oc[b]?delete a[b]:a[b]=Oc[b];var c=[];for(b in a)c.push(b+"="+a[b]);Qc=c}return Qc}var Qc,Z=void 0,Rc=[];
function va(a,b){if(!Z){Z=new WeakMap;var c=N.length;if(Z)for(var d=0;d<0+c;d++){var f=N.get(d);f&&Z.set(f,d)}}if(Z.has(a))return Z.get(a);if(Rc.length)c=Rc.pop();else{try{N.grow(1)}catch(q){if(!(q instanceof RangeError))throw q;throw"Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";}c=N.length-1}try{N.set(c,a)}catch(q){if(!(q instanceof TypeError))throw q;if("function"==typeof WebAssembly.Function){d=WebAssembly.Function;f={i:"i32",j:"i64",f:"f32",d:"f64",p:"i32"};for(var h={parameters:[],results:"v"==
b[0]?[]:[f[b[0]]]},k=1;k<b.length;++k)h.parameters.push(f[b[k]]);b=new d(h,a)}else{d=[1,96];f=b.slice(0,1);b=b.slice(1);h={i:127,p:127,j:126,f:125,d:124};k=b.length;128>k?d.push(k):d.push(k%128|128,k>>7);for(k=0;k<b.length;++k)d.push(h[b[k]]);"v"==f?d.push(0):d.push(1,h[f]);b=[0,97,115,109,1,0,0,0,1];f=d.length;128>f?b.push(f):b.push(f%128|128,f>>7);b.push.apply(b,d);b.push(2,7,1,1,101,1,102,0,0,7,5,1,1,102,0,0);b=new WebAssembly.Module(new Uint8Array(b));b=(new WebAssembly.Instance(b,{e:{f:a}})).exports.f}N.set(c,
b)}Z.set(a,c);return c}function sa(a){Z.delete(N.get(a));Rc.push(a)}var Sc=0,Tc=1;function ba(a){var b=Sc==Tc?D(a.length):ea(a.length);a.subarray||a.slice||(a=new Uint8Array(a));u.set(a,b);return b}
function Uc(a,b,c,d){var f={string:w=>{var A=0;if(null!==w&&void 0!==w&&0!==w){var S=(w.length<<2)+1;A=D(S);t(w,u,A,S)}return A},array:w=>{var A=D(w.length);r.set(w,A);return A}};a=e["_"+a];var h=[],k=0;if(d)for(var q=0;q<d.length;q++){var y=f[c[q]];y?(0===k&&(k=pa()),h[q]=y(d[q])):h[q]=d[q]}c=a.apply(null,h);return c=function(w){0!==k&&ra(k);return"string"===b?E(w):"boolean"===b?!!w:w}(c)}
function Ib(a,b,c,d){a||(a=this);this.parent=a;this.Ra=a.Ra;this.Va=null;this.id=Cb++;this.name=b;this.mode=c;this.Ga={};this.Ia={};this.rdev=d}Object.defineProperties(Ib.prototype,{read:{get:function(){return 365===(this.mode&365)},set:function(a){a?this.mode|=365:this.mode&=-366}},write:{get:function(){return 146===(this.mode&146)},set:function(a){a?this.mode|=146:this.mode&=-147}}});$b();V=Array(4096);Qb(T,"/");W("/tmp");W("/home");W("/home/web_user");
(()=>{W("/dev");mb(259,{read:()=>0,write:(b,c,d,f)=>f});Rb("/dev/null",259);lb(1280,ub);lb(1536,vb);Rb("/dev/tty",1280);Rb("/dev/tty1",1536);var a=hb();cc("random",a);cc("urandom",a);W("/dev/shm");W("/dev/shm/tmp")})();(()=>{W("/proc");var a=W("/proc/self");W("/proc/self/fd");Qb({Ra:()=>{var b=xb(a,"fd",16895,73);b.Ga={lookup:(c,d)=>{var f=U[+d];if(!f)throw new R(8);c={parent:null,Ra:{ub:"fake"},Ga:{readlink:()=>f.path}};return c.parent=c}};return b}},"/proc/self/fd")})();
var Wc={a:function(a,b,c,d){K("Assertion failed: "+E(a)+", at: "+[b?E(b):"unknown filename",c,d?E(d):"unknown function"])},h:function(a,b){try{return a=E(a),ja(a,b),0}catch(c){if("undefined"==typeof X||!(c instanceof R))throw c;return-c.Ka}},H:function(a,b,c){try{b=E(b);b=dc(a,b);if(c&-8)return-28;var d=B(b,{Sa:!0}).node;if(!d)return-44;a="";c&4&&(a+="r");c&2&&(a+="w");c&1&&(a+="x");return a&&Hb(d,a)?-2:0}catch(f){if("undefined"==typeof X||!(f instanceof R))throw f;return-f.Ka}},i:function(a,b){try{var c=
U[a];if(!c)throw new R(8);ja(c.node,b);return 0}catch(d){if("undefined"==typeof X||!(d instanceof R))throw d;return-d.Ka}},g:function(a){try{var b=U[a];if(!b)throw new R(8);var c=b.node;var d="string"==typeof c?B(c,{Sa:!0}).node:c;if(!d.Ga.Oa)throw new R(63);d.Ga.Oa(d,{timestamp:Date.now()});return 0}catch(f){if("undefined"==typeof X||!(f instanceof R))throw f;return-f.Ka}},b:function(a,b,c){fc=c;try{var d=Y(a);switch(b){case 0:var f=Hc();return 0>f?-28:Pb(d,f).fd;case 1:case 2:return 0;case 3:return d.flags;
case 4:return f=Hc(),d.flags|=f,0;case 5:return f=Hc(),Pa[f+0>>1]=2,0;case 6:case 7:return 0;case 16:case 8:return-28;case 9:return L[Vc()>>2]=28,-1;default:return-28}}catch(h){if("undefined"==typeof X||!(h instanceof R))throw h;return-h.Ka}},G:function(a,b){try{var c=Y(a);return ec(Ub,c.path,b)}catch(d){if("undefined"==typeof X||!(d instanceof R))throw d;return-d.Ka}},l:function(a,b,c){try{b=c+2097152>>>0<4194305-!!b?(b>>>0)+4294967296*c:NaN;if(isNaN(b))return-61;var d=U[a];if(!d)throw new R(8);
if(0===(d.flags&2097155))throw new R(28);Wb(d.node,b);return 0}catch(f){if("undefined"==typeof X||!(f instanceof R))throw f;return-f.Ka}},B:function(a,b){try{if(0===b)return-28;var c=da("/")+1;if(b<c)return-68;t("/",u,a,b);return c}catch(d){if("undefined"==typeof X||!(d instanceof R))throw d;return-d.Ka}},E:function(a,b){try{return a=E(a),ec(Vb,a,b)}catch(c){if("undefined"==typeof X||!(c instanceof R))throw c;return-c.Ka}},y:function(a,b,c){try{return b=E(b),b=dc(a,b),b=z(b),"/"===b[b.length-1]&&
(b=b.substr(0,b.length-1)),W(b,c),0}catch(d){if("undefined"==typeof X||!(d instanceof R))throw d;return-d.Ka}},D:function(a,b,c,d){try{b=E(b);var f=d&256;b=dc(a,b,d&4096);return ec(f?Vb:Ub,b,c)}catch(h){if("undefined"==typeof X||!(h instanceof R))throw h;return-h.Ka}},v:function(a,b,c,d){fc=d;try{b=E(b);b=dc(a,b);var f=d?Hc():0;return ka(b,c,f).fd}catch(h){if("undefined"==typeof X||!(h instanceof R))throw h;return-h.Ka}},t:function(a,b,c,d){try{b=E(b);b=dc(a,b);if(0>=d)return-28;var f=Eb(b),h=Math.min(d,
da(f)),k=r[c+h];t(f,u,c,d+1);r[c+h]=k;return h}catch(q){if("undefined"==typeof X||!(q instanceof R))throw q;return-q.Ka}},s:function(a){try{return a=E(a),Tb(a),0}catch(b){if("undefined"==typeof X||!(b instanceof R))throw b;return-b.Ka}},F:function(a,b){try{return a=E(a),ec(Ub,a,b)}catch(c){if("undefined"==typeof X||!(c instanceof R))throw c;return-c.Ka}},p:function(a,b,c){try{return b=E(b),b=dc(a,b),0===c?ua(b):512===c?Tb(b):K("Invalid flags passed to unlinkat"),0}catch(d){if("undefined"==typeof X||
!(d instanceof R))throw d;return-d.Ka}},o:function(a,b,c){try{b=E(b);b=dc(a,b,!0);if(c){var d=Jc(c),f=L[c+8>>2];h=1E3*d+f/1E6;c+=16;d=Jc(c);f=L[c+8>>2];k=1E3*d+f/1E6}else var h=Date.now(),k=h;a=h;var q=B(b,{Sa:!0}).node;q.Ga.Oa(q,{timestamp:Math.max(a,k)});return 0}catch(y){if("undefined"==typeof X||!(y instanceof R))throw y;return-y.Ka}},e:function(){return Date.now()},j:function(a,b){a=new Date(1E3*Jc(a));L[b>>2]=a.getSeconds();L[b+4>>2]=a.getMinutes();L[b+8>>2]=a.getHours();L[b+12>>2]=a.getDate();
L[b+16>>2]=a.getMonth();L[b+20>>2]=a.getFullYear()-1900;L[b+24>>2]=a.getDay();var c=new Date(a.getFullYear(),0,1);L[b+28>>2]=(a.getTime()-c.getTime())/864E5|0;L[b+36>>2]=-(60*a.getTimezoneOffset());var d=(new Date(a.getFullYear(),6,1)).getTimezoneOffset();c=c.getTimezoneOffset();L[b+32>>2]=(d!=c&&a.getTimezoneOffset()==Math.min(c,d))|0},w:function(a,b,c,d,f,h){try{var k=Y(d);if(0!==(b&2)&&0===(c&2)&&2!==(k.flags&2097155))throw new R(2);if(1===(k.flags&2097155))throw new R(2);if(!k.Ia.bb)throw new R(43);
var q=k.Ia.bb(k,a,f,b,c);var y=q.Fb;L[h>>2]=q.vb;return y}catch(w){if("undefined"==typeof X||!(w instanceof R))throw w;return-w.Ka}},x:function(a,b,c,d,f,h){try{var k=Y(f);if(c&2){var q=u.slice(a,a+b);k&&k.Ia.cb&&k.Ia.cb(k,q,h,b,d)}}catch(y){if("undefined"==typeof X||!(y instanceof R))throw y;return-y.Ka}},n:Mc,q:function(){return 2147483648},d:Nc,c:function(a){var b=u.length;a>>>=0;if(2147483648<a)return!1;for(var c=1;4>=c;c*=2){var d=b*(1+.2/c);d=Math.min(d,a+100663296);var f=Math;d=Math.max(a,
d);f=f.min.call(f,2147483648,d+(65536-d%65536)%65536);a:{try{Ka.grow(f-Oa.byteLength+65535>>>16);Sa();var h=1;break a}catch(k){}h=void 0}if(h)return!0}return!1},z:function(a,b){var c=0;Pc().forEach(function(d,f){var h=b+c;f=M[a+4*f>>2]=h;for(h=0;h<d.length;++h)r[f++>>0]=d.charCodeAt(h);r[f>>0]=0;c+=d.length+1});return 0},A:function(a,b){var c=Pc();M[a>>2]=c.length;var d=0;c.forEach(function(f){d+=f.length+1});M[b>>2]=d;return 0},f:function(a){try{var b=Y(a);ma(b);return 0}catch(c){if("undefined"==
typeof X||!(c instanceof R))throw c;return c.Ka}},m:function(a,b){try{var c=Y(a);r[b>>0]=c.tty?2:16384===(c.mode&61440)?3:40960===(c.mode&61440)?7:4;return 0}catch(d){if("undefined"==typeof X||!(d instanceof R))throw d;return d.Ka}},u:function(a,b,c,d){try{a:{var f=Y(a);a=b;for(var h=b=0;h<c;h++){var k=M[a>>2],q=M[a+4>>2];a+=8;var y=Zb(f,r,k,q);if(0>y){var w=-1;break a}b+=y;if(y<q)break}w=b}M[d>>2]=w;return 0}catch(A){if("undefined"==typeof X||!(A instanceof R))throw A;return A.Ka}},k:function(a,
b,c,d,f){try{b=c+2097152>>>0<4194305-!!b?(b>>>0)+4294967296*c:NaN;if(isNaN(b))return 61;var h=Y(a);Yb(h,b,d);Q=[h.position>>>0,(P=h.position,1<=+Math.abs(P)?0<P?(Math.min(+Math.floor(P/4294967296),4294967295)|0)>>>0:~~+Math.ceil((P-+(~~P>>>0))/4294967296)>>>0:0)];L[f>>2]=Q[0];L[f+4>>2]=Q[1];h.hb&&0===b&&0===d&&(h.hb=null);return 0}catch(k){if("undefined"==typeof X||!(k instanceof R))throw k;return k.Ka}},C:function(a){try{var b=Y(a);return b.Ia&&b.Ia.fsync?b.Ia.fsync(b):0}catch(c){if("undefined"==
typeof X||!(c instanceof R))throw c;return c.Ka}},r:function(a,b,c,d){try{a:{var f=Y(a);a=b;for(var h=b=0;h<c;h++){var k=M[a>>2],q=M[a+4>>2];a+=8;var y=la(f,r,k,q);if(0>y){var w=-1;break a}b+=y}w=b}M[d>>2]=w;return 0}catch(A){if("undefined"==typeof X||!(A instanceof R))throw A;return A.Ka}}};
(function(){function a(f){e.asm=f.exports;Ka=e.asm.I;Sa();N=e.asm.Aa;Ua.unshift(e.asm.J);Xa--;e.monitorRunDependencies&&e.monitorRunDependencies(Xa);0==Xa&&(null!==Ya&&(clearInterval(Ya),Ya=null),Za&&(f=Za,Za=null,f()))}function b(f){a(f.instance)}function c(f){return cb().then(function(h){return WebAssembly.instantiate(h,d)}).then(function(h){return h}).then(f,function(h){Ia("failed to asynchronously prepare wasm: "+h);K(h)})}var d={a:Wc};Xa++;e.monitorRunDependencies&&e.monitorRunDependencies(Xa);
if(e.instantiateWasm)try{return e.instantiateWasm(d,a)}catch(f){return Ia("Module.instantiateWasm callback failed with error: "+f),!1}(function(){return Ja||"function"!=typeof WebAssembly.instantiateStreaming||$a()||O.startsWith("file://")||Ba||"function"!=typeof fetch?c(b):fetch(O,{credentials:"same-origin"}).then(function(f){return WebAssembly.instantiateStreaming(f,d).then(b,function(h){Ia("wasm streaming compile failed: "+h);Ia("falling back to ArrayBuffer instantiation");return c(b)})})})();
return{}})();e.___wasm_call_ctors=function(){return(e.___wasm_call_ctors=e.asm.J).apply(null,arguments)};e._sqlite3_free=function(){return(e._sqlite3_free=e.asm.K).apply(null,arguments)};e._sqlite3_value_double=function(){return(e._sqlite3_value_double=e.asm.L).apply(null,arguments)};e._sqlite3_value_text=function(){return(e._sqlite3_value_text=e.asm.M).apply(null,arguments)};var Vc=e.___errno_location=function(){return(Vc=e.___errno_location=e.asm.N).apply(null,arguments)};
e._sqlite3_prepare_v2=function(){return(e._sqlite3_prepare_v2=e.asm.O).apply(null,arguments)};e._sqlite3_step=function(){return(e._sqlite3_step=e.asm.P).apply(null,arguments)};e._sqlite3_finalize=function(){return(e._sqlite3_finalize=e.asm.Q).apply(null,arguments)};e._sqlite3_reset=function(){return(e._sqlite3_reset=e.asm.R).apply(null,arguments)};e._sqlite3_value_int=function(){return(e._sqlite3_value_int=e.asm.S).apply(null,arguments)};
e._sqlite3_clear_bindings=function(){return(e._sqlite3_clear_bindings=e.asm.T).apply(null,arguments)};e._sqlite3_value_blob=function(){return(e._sqlite3_value_blob=e.asm.U).apply(null,arguments)};e._sqlite3_value_bytes=function(){return(e._sqlite3_value_bytes=e.asm.V).apply(null,arguments)};e._sqlite3_value_type=function(){return(e._sqlite3_value_type=e.asm.W).apply(null,arguments)};e._sqlite3_result_blob=function(){return(e._sqlite3_result_blob=e.asm.X).apply(null,arguments)};
e._sqlite3_result_double=function(){return(e._sqlite3_result_double=e.asm.Y).apply(null,arguments)};e._sqlite3_result_error=function(){return(e._sqlite3_result_error=e.asm.Z).apply(null,arguments)};e._sqlite3_result_int=function(){return(e._sqlite3_result_int=e.asm._).apply(null,arguments)};e._sqlite3_result_int64=function(){return(e._sqlite3_result_int64=e.asm.$).apply(null,arguments)};e._sqlite3_result_null=function(){return(e._sqlite3_result_null=e.asm.aa).apply(null,arguments)};
e._sqlite3_result_text=function(){return(e._sqlite3_result_text=e.asm.ba).apply(null,arguments)};e._sqlite3_sql=function(){return(e._sqlite3_sql=e.asm.ca).apply(null,arguments)};e._sqlite3_aggregate_context=function(){return(e._sqlite3_aggregate_context=e.asm.da).apply(null,arguments)};e._sqlite3_column_count=function(){return(e._sqlite3_column_count=e.asm.ea).apply(null,arguments)};e._sqlite3_data_count=function(){return(e._sqlite3_data_count=e.asm.fa).apply(null,arguments)};
e._sqlite3_column_blob=function(){return(e._sqlite3_column_blob=e.asm.ga).apply(null,arguments)};e._sqlite3_column_bytes=function(){return(e._sqlite3_column_bytes=e.asm.ha).apply(null,arguments)};e._sqlite3_column_double=function(){return(e._sqlite3_column_double=e.asm.ia).apply(null,arguments)};e._sqlite3_column_text=function(){return(e._sqlite3_column_text=e.asm.ja).apply(null,arguments)};e._sqlite3_column_type=function(){return(e._sqlite3_column_type=e.asm.ka).apply(null,arguments)};
e._sqlite3_column_name=function(){return(e._sqlite3_column_name=e.asm.la).apply(null,arguments)};e._sqlite3_bind_blob=function(){return(e._sqlite3_bind_blob=e.asm.ma).apply(null,arguments)};e._sqlite3_bind_double=function(){return(e._sqlite3_bind_double=e.asm.na).apply(null,arguments)};e._sqlite3_bind_int=function(){return(e._sqlite3_bind_int=e.asm.oa).apply(null,arguments)};e._sqlite3_bind_text=function(){return(e._sqlite3_bind_text=e.asm.pa).apply(null,arguments)};
e._sqlite3_bind_parameter_index=function(){return(e._sqlite3_bind_parameter_index=e.asm.qa).apply(null,arguments)};e._sqlite3_normalized_sql=function(){return(e._sqlite3_normalized_sql=e.asm.ra).apply(null,arguments)};e._sqlite3_errmsg=function(){return(e._sqlite3_errmsg=e.asm.sa).apply(null,arguments)};e._sqlite3_exec=function(){return(e._sqlite3_exec=e.asm.ta).apply(null,arguments)};e._sqlite3_changes=function(){return(e._sqlite3_changes=e.asm.ua).apply(null,arguments)};
e._sqlite3_close_v2=function(){return(e._sqlite3_close_v2=e.asm.va).apply(null,arguments)};e._sqlite3_create_function_v2=function(){return(e._sqlite3_create_function_v2=e.asm.wa).apply(null,arguments)};e._sqlite3_open=function(){return(e._sqlite3_open=e.asm.xa).apply(null,arguments)};var ea=e._malloc=function(){return(ea=e._malloc=e.asm.ya).apply(null,arguments)},ca=e._free=function(){return(ca=e._free=e.asm.za).apply(null,arguments)};
e._RegisterExtensionFunctions=function(){return(e._RegisterExtensionFunctions=e.asm.Ba).apply(null,arguments)};var zb=e._emscripten_builtin_memalign=function(){return(zb=e._emscripten_builtin_memalign=e.asm.Ca).apply(null,arguments)},pa=e.stackSave=function(){return(pa=e.stackSave=e.asm.Da).apply(null,arguments)},ra=e.stackRestore=function(){return(ra=e.stackRestore=e.asm.Ea).apply(null,arguments)},D=e.stackAlloc=function(){return(D=e.stackAlloc=e.asm.Fa).apply(null,arguments)};e.UTF8ToString=E;
e.stackAlloc=D;e.stackSave=pa;e.stackRestore=ra;e.cwrap=function(a,b,c,d){c=c||[];var f=c.every(h=>"number"===h||"boolean"===h);return"string"!==b&&f&&!d?e["_"+a]:function(){return Uc(a,b,c,arguments)}};var Xc;Za=function Yc(){Xc||Zc();Xc||(Za=Yc)};
function Zc(){function a(){if(!Xc&&(Xc=!0,e.calledRun=!0,!La)){e.noFSInit||ac||(ac=!0,$b(),e.stdin=e.stdin,e.stdout=e.stdout,e.stderr=e.stderr,e.stdin?cc("stdin",e.stdin):Sb("/dev/tty","/dev/stdin"),e.stdout?cc("stdout",null,e.stdout):Sb("/dev/tty","/dev/stdout"),e.stderr?cc("stderr",null,e.stderr):Sb("/dev/tty1","/dev/stderr"),ka("/dev/stdin",0),ka("/dev/stdout",1),ka("/dev/stderr",1));Db=!1;db(Ua);if(e.onRuntimeInitialized)e.onRuntimeInitialized();if(e.postRun)for("function"==typeof e.postRun&&
(e.postRun=[e.postRun]);e.postRun.length;){var b=e.postRun.shift();Va.unshift(b)}db(Va)}}if(!(0<Xa)){if(e.preRun)for("function"==typeof e.preRun&&(e.preRun=[e.preRun]);e.preRun.length;)Wa();db(Ta);0<Xa||(e.setStatus?(e.setStatus("Running..."),setTimeout(function(){setTimeout(function(){e.setStatus("")},1);a()},1)):a())}}if(e.preInit)for("function"==typeof e.preInit&&(e.preInit=[e.preInit]);0<e.preInit.length;)e.preInit.pop()();Zc();


        // The shell-pre.js and emcc-generated code goes above
        return Module;
    }); // The end of the promise being returned

  return initSqlJsPromise;
} // The end of our initSqlJs function

// This bit below is copied almost exactly from what you get when you use the MODULARIZE=1 flag with emcc
// However, we don't want to use the emcc modularization. See shell-pre.js
if (typeof exports === 'object' && typeof module === 'object'){
    module.exports = initSqlJs;
    // This will allow the module to be used in ES6 or CommonJS
    module.exports.default = initSqlJs;
}
else if (typeof define === 'function' && define['amd']) {
    define([], function() { return initSqlJs; });
}
else if (typeof exports === 'object'){
    exports["Module"] = initSqlJs;
}
/* global initSqlJs */
/* eslint-env worker */
/* eslint no-restricted-globals: ["error"] */

"use strict";

var db;

function onModuleReady(SQL) {
    function createDb(data) {
        if (db != null) db.close();
        db = new SQL.Database(data);
        return db;
    }

    var buff; var data; var result;
    data = this["data"];
    var config = data["config"] ? data["config"] : {};
    switch (data && data["action"]) {
        case "open":
            buff = data["buffer"];
            createDb(buff && new Uint8Array(buff));
            return postMessage({
                id: data["id"],
                ready: true
            });
        case "exec":
            if (db === null) {
                createDb();
            }
            if (!data["sql"]) {
                throw "exec: Missing query string";
            }
            return postMessage({
                id: data["id"],
                results: db.exec(data["sql"], data["params"], config)
            });
        case "each":
            if (db === null) {
                createDb();
            }
            var callback = function callback(row) {
                return postMessage({
                    id: data["id"],
                    row: row,
                    finished: false
                });
            };
            var done = function done() {
                return postMessage({
                    id: data["id"],
                    finished: true
                });
            };
            return db.each(data["sql"], data["params"], callback, done, config);
        case "export":
            buff = db["export"]();
            result = {
                id: data["id"],
                buffer: buff
            };
            try {
                return postMessage(result, [result]);
            } catch (error) {
                return postMessage(result);
            }
        case "close":
            if (db) {
                db.close();
            }
            return postMessage({
                id: data["id"]
            });
        default:
            throw new Error("Invalid action : " + (data && data["action"]));
    }
}

function onError(err) {
    return postMessage({
        id: this["data"]["id"],
        error: err["message"]
    });
}

if (typeof importScripts === "function") {
    db = null;
    var sqlModuleReady = initSqlJs();
    self.onmessage = function onmessage(event) {
        return sqlModuleReady
            .then(onModuleReady.bind(event))
            .catch(onError.bind(event));
    };
}
