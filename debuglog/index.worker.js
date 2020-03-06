var Module = typeof Module !== "undefined" ? Module : {};

Module["mmh"] = function() {
 FS.mkdir("/output");
  FS.createPreloadedFile("/output", "side.wasm", "http://localhost:8080/side.wasm", true, true, () => {
   var sideExists = FS.analyzePath("/output/side.wasm").exists;
   console.log("mmh sideExists:" + sideExists);
   var start = Date.now();
   loadDynamicLibrary("/output/side.wasm", {
    global: true,
    nodelete: true,
    fs: FS
   });
   console.log("loadDynamicLibrary:" + (Date.now() - start));
  });
};

Module["preRun"] = function() {
 Module["mmh"]();
};

var moduleOverrides = {};

var key;

for (key in Module) {
 if (Module.hasOwnProperty(key)) {
  moduleOverrides[key] = Module[key];
 }
}

var arguments_ = [];

var thisProgram = "./this.program";

var quit_ = function(status, toThrow) {
 throw toThrow;
};

var ENVIRONMENT_IS_WEB = false;

var ENVIRONMENT_IS_WORKER = false;

var ENVIRONMENT_IS_NODE = false;

var ENVIRONMENT_HAS_NODE = false;

var ENVIRONMENT_IS_SHELL = false;

ENVIRONMENT_IS_WEB = typeof window === "object";

ENVIRONMENT_IS_WORKER = typeof importScripts === "function";

ENVIRONMENT_HAS_NODE = typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node === "string";

ENVIRONMENT_IS_NODE = ENVIRONMENT_HAS_NODE && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER;

ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (Module["ENVIRONMENT"]) {
 throw new Error("Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -s ENVIRONMENT=web or -s ENVIRONMENT=node)");
}

var scriptDirectory = "";

function locateFile(path) {
 if (Module["locateFile"]) {
  return Module["locateFile"](path, scriptDirectory);
 }
 return scriptDirectory + path;
}

var read_, readAsync, readBinary, setWindowTitle;

var nodeFS;

var nodePath;

if (ENVIRONMENT_IS_NODE) {
 scriptDirectory = __dirname + "/";
 read_ = function shell_read(filename, binary) {
  if (!nodeFS) nodeFS = require("fs");
  if (!nodePath) nodePath = require("path");
  filename = nodePath["normalize"](filename);
  return nodeFS["readFileSync"](filename, binary ? null : "utf8");
 };
 readBinary = function readBinary(filename) {
  var ret = read_(filename, true);
  if (!ret.buffer) {
   ret = new Uint8Array(ret);
  }
  assert(ret.buffer);
  return ret;
 };
 if (process["argv"].length > 1) {
  thisProgram = process["argv"][1].replace(/\\/g, "/");
 }
 arguments_ = process["argv"].slice(2);
 if (typeof module !== "undefined") {
  module["exports"] = Module;
 }
 process["on"]("uncaughtException", function(ex) {
  if (!(ex instanceof ExitStatus)) {
   throw ex;
  }
 });
 process["on"]("unhandledRejection", abort);
 quit_ = function(status) {
  process["exit"](status);
 };
 Module["inspect"] = function() {
  return "[Emscripten Module object]";
 };
} else if (ENVIRONMENT_IS_SHELL) {
 if (typeof read != "undefined") {
  read_ = function shell_read(f) {
   return read(f);
  };
 }
 readBinary = function readBinary(f) {
  var data;
  if (typeof readbuffer === "function") {
   return new Uint8Array(readbuffer(f));
  }
  data = read(f, "binary");
  assert(typeof data === "object");
  return data;
 };
 if (typeof scriptArgs != "undefined") {
  arguments_ = scriptArgs;
 } else if (typeof arguments != "undefined") {
  arguments_ = arguments;
 }
 if (typeof quit === "function") {
  quit_ = function(status) {
   quit(status);
  };
 }
 if (typeof print !== "undefined") {
  if (typeof console === "undefined") console = {};
  console.log = print;
  console.warn = console.error = typeof printErr !== "undefined" ? printErr : print;
 }
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
 if (ENVIRONMENT_IS_WORKER) {
  scriptDirectory = self.location.href;
 } else if (document.currentScript) {
  scriptDirectory = document.currentScript.src;
 }
 if (scriptDirectory.indexOf("blob:") !== 0) {
  scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf("/") + 1);
 } else {
  scriptDirectory = "";
 }
 {
  read_ = function shell_read(url) {
   var xhr = new XMLHttpRequest();
   xhr.open("GET", url, false);
   xhr.send(null);
   return xhr.responseText;
  };
  if (ENVIRONMENT_IS_WORKER) {
   readBinary = function readBinary(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.responseType = "arraybuffer";
    xhr.send(null);
    return new Uint8Array(xhr.response);
   };
  }
  readAsync = function readAsync(url, onload, onerror) {
   var xhr = new XMLHttpRequest();
   xhr.open("GET", url, true);
   xhr.responseType = "arraybuffer";
   xhr.onload = function xhr_onload() {
    if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
     onload(xhr.response);
     return;
    }
    onerror();
   };
   xhr.onerror = onerror;
   xhr.send(null);
  };
 }
 setWindowTitle = function(title) {
  document.title = title;
 };
} else {
 throw new Error("environment detection error");
}

var out = Module["print"] || console.log.bind(console);

var err = Module["printErr"] || console.warn.bind(console);

for (key in moduleOverrides) {
 if (moduleOverrides.hasOwnProperty(key)) {
  Module[key] = moduleOverrides[key];
 }
}

moduleOverrides = null;

if (Module["arguments"]) arguments_ = Module["arguments"];

if (!Object.getOwnPropertyDescriptor(Module, "arguments")) Object.defineProperty(Module, "arguments", {
 configurable: true,
 get: function() {
  abort("Module.arguments has been replaced with plain arguments_");
 }
});

if (Module["thisProgram"]) thisProgram = Module["thisProgram"];

if (!Object.getOwnPropertyDescriptor(Module, "thisProgram")) Object.defineProperty(Module, "thisProgram", {
 configurable: true,
 get: function() {
  abort("Module.thisProgram has been replaced with plain thisProgram");
 }
});

if (Module["quit"]) quit_ = Module["quit"];

if (!Object.getOwnPropertyDescriptor(Module, "quit")) Object.defineProperty(Module, "quit", {
 configurable: true,
 get: function() {
  abort("Module.quit has been replaced with plain quit_");
 }
});

assert(typeof Module["memoryInitializerPrefixURL"] === "undefined", "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead");

assert(typeof Module["pthreadMainPrefixURL"] === "undefined", "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead");

assert(typeof Module["cdInitializerPrefixURL"] === "undefined", "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead");

assert(typeof Module["filePackagePrefixURL"] === "undefined", "Module.filePackagePrefixURL option was removed, use Module.locateFile instead");

assert(typeof Module["read"] === "undefined", "Module.read option was removed (modify read_ in JS)");

assert(typeof Module["readAsync"] === "undefined", "Module.readAsync option was removed (modify readAsync in JS)");

assert(typeof Module["readBinary"] === "undefined", "Module.readBinary option was removed (modify readBinary in JS)");

assert(typeof Module["setWindowTitle"] === "undefined", "Module.setWindowTitle option was removed (modify setWindowTitle in JS)");

if (!Object.getOwnPropertyDescriptor(Module, "read")) Object.defineProperty(Module, "read", {
 configurable: true,
 get: function() {
  abort("Module.read has been replaced with plain read_");
 }
});

if (!Object.getOwnPropertyDescriptor(Module, "readAsync")) Object.defineProperty(Module, "readAsync", {
 configurable: true,
 get: function() {
  abort("Module.readAsync has been replaced with plain readAsync");
 }
});

if (!Object.getOwnPropertyDescriptor(Module, "readBinary")) Object.defineProperty(Module, "readBinary", {
 configurable: true,
 get: function() {
  abort("Module.readBinary has been replaced with plain readBinary");
 }
});

var STACK_ALIGN = 16;

stackSave = stackRestore = stackAlloc = function() {
 abort("cannot use the stack before compiled code is ready to run, and has provided stack access");
};

function dynamicAlloc(size) {
 assert(DYNAMICTOP_PTR);
 var ret = HEAP32[DYNAMICTOP_PTR >> 2];
 var end = ret + size + 15 & -16;
 if (end > _emscripten_get_heap_size()) {
  abort("failure to dynamicAlloc - memory growth etc. is not supported there, call malloc/sbrk directly");
 }
 HEAP32[DYNAMICTOP_PTR >> 2] = end;
 return ret;
}

function alignMemory(size, factor) {
 if (!factor) factor = STACK_ALIGN;
 return Math.ceil(size / factor) * factor;
}

function getNativeTypeSize(type) {
 switch (type) {
 case "i1":
 case "i8":
  return 1;

 case "i16":
  return 2;

 case "i32":
  return 4;

 case "i64":
  return 8;

 case "float":
  return 4;

 case "double":
  return 8;

 default:
  {
   if (type[type.length - 1] === "*") {
    return 4;
   } else if (type[0] === "i") {
    var bits = parseInt(type.substr(1));
    assert(bits % 8 === 0, "getNativeTypeSize invalid bits " + bits + ", type " + type);
    return bits / 8;
   } else {
    return 0;
   }
  }
 }
}

function warnOnce(text) {
 if (!warnOnce.shown) warnOnce.shown = {};
 if (!warnOnce.shown[text]) {
  warnOnce.shown[text] = 1;
  err(text);
 }
}

var LDSO = {
 nextHandle: 1,
 loadedLibs: {
  "-1": {
   refcount: Infinity,
   name: "__self__",
   module: Module,
   global: true
  }
 },
 loadedLibNames: {
  "__self__": -1
 }
};

function fetchBinary(url) {
 return fetch(url, {
  credentials: "same-origin"
 }).then(function(response) {
  if (!response["ok"]) {
   throw "failed to load binary file at '" + url + "'";
  }
  return response["arrayBuffer"]();
 }).then(function(buffer) {
  return new Uint8Array(buffer);
 });
}

function loadDynamicLibrary(lib, flags) {
 flags = flags || {
  global: true,
  nodelete: true
 };
 var handle = LDSO.loadedLibNames[lib];
 var dso;
 if (handle) {
  dso = LDSO.loadedLibs[handle];
  if (flags.global && !dso.global) {
   dso.global = true;
   if (dso.module !== "loading") {
    mergeLibSymbols(dso.module);
   }
  }
  if (flags.nodelete && dso.refcount !== Infinity) {
   dso.refcount = Infinity;
  }
  dso.refcount++;
  return flags.loadAsync ? Promise.resolve(handle) : handle;
 }
 handle = LDSO.nextHandle++;
 dso = {
  refcount: flags.nodelete ? Infinity : 1,
  name: lib,
  module: "loading",
  global: flags.global
 };
 LDSO.loadedLibNames[lib] = handle;
 LDSO.loadedLibs[handle] = dso;
 function loadLibData() {
  if (flags.fs) {
   var libData = flags.fs.readFile(lib, {
    encoding: "binary"
   });
   if (!(libData instanceof Uint8Array)) {
    libData = new Uint8Array(lib_data);
   }
   return flags.loadAsync ? Promise.resolve(libData) : libData;
  }
  if (flags.loadAsync) {
   return fetchBinary(lib);
  }
  return readBinary(lib);
 }
 function createLibModule(libData) {
  return loadWebAssemblyModule(libData, flags);
 }
 function getLibModule() {
  if (Module["preloadedWasm"] !== undefined && Module["preloadedWasm"][lib] !== undefined) {
   var libModule = Module["preloadedWasm"][lib];
   return flags.loadAsync ? Promise.resolve(libModule) : libModule;
  }
  if (flags.loadAsync) {
   return loadLibData(lib).then(function(libData) {
    return createLibModule(libData);
   });
  }
  return createLibModule(loadLibData(lib));
 }
 function mergeLibSymbols(libModule) {
  for (var sym in libModule) {
   if (!libModule.hasOwnProperty(sym)) {
    continue;
   }
   var module_sym = sym;
   module_sym = "_" + sym;
   if (!Module.hasOwnProperty(module_sym)) {
    Module[module_sym] = libModule[sym];
   }
  }
 }
 function moduleLoaded(libModule) {
  if (dso.global) {
   mergeLibSymbols(libModule);
  }
  dso.module = libModule;
 }
 if (flags.loadAsync) {
  return getLibModule().then(function(libModule) {
   moduleLoaded(libModule);
   return handle;
  });
 }
 moduleLoaded(getLibModule());
 return handle;
}

function relocateExports(exports, memoryBase, tableBase, moduleLocal) {
 var relocated = {};
 for (var e in exports) {
  var value = exports[e];
  if (typeof value === "object") {
   value = value.value;
  }
  if (typeof value === "number") {
   value = value + memoryBase;
  }
  relocated[e] = value;
  if (moduleLocal) {
   moduleLocal["_" + e] = value;
  }
 }
 return relocated;
}

function loadWebAssemblyModule(binary, flags) {
 var int32View = new Uint32Array(new Uint8Array(binary.subarray(0, 24)).buffer);
 assert(int32View[0] == 1836278016, "need to see wasm magic number");
 assert(binary[8] === 0, "need the dylink section to be first");
 var next = 9;
 function getLEB() {
  var ret = 0;
  var mul = 1;
  while (1) {
   var byte = binary[next++];
   ret += (byte & 127) * mul;
   mul *= 128;
   if (!(byte & 128)) break;
  }
  return ret;
 }
 var sectionSize = getLEB();
 assert(binary[next] === 6);
 next++;
 assert(binary[next] === "d".charCodeAt(0));
 next++;
 assert(binary[next] === "y".charCodeAt(0));
 next++;
 assert(binary[next] === "l".charCodeAt(0));
 next++;
 assert(binary[next] === "i".charCodeAt(0));
 next++;
 assert(binary[next] === "n".charCodeAt(0));
 next++;
 assert(binary[next] === "k".charCodeAt(0));
 next++;
 var memorySize = getLEB();
 var memoryAlign = getLEB();
 var tableSize = getLEB();
 var tableAlign = getLEB();
 var neededDynlibsCount = getLEB();
 var neededDynlibs = [];
 for (var i = 0; i < neededDynlibsCount; ++i) {
  var nameLen = getLEB();
  var nameUTF8 = binary.subarray(next, next + nameLen);
  next += nameLen;
  var name = UTF8ArrayToString(nameUTF8, 0);
  neededDynlibs.push(name);
 }
 function loadModule() {
  memoryAlign = Math.pow(2, memoryAlign);
  tableAlign = Math.pow(2, tableAlign);
  memoryAlign = Math.max(memoryAlign, STACK_ALIGN);
  assert(tableAlign === 1, "invalid tableAlign " + tableAlign);
  var memoryBase = alignMemory(getMemory(memorySize + memoryAlign), memoryAlign);
  for (var i = memoryBase; i < memoryBase + memorySize; ++i) HEAP8[i] = 0;
  var env = asmLibraryArg;
  var table = wasmTable;
  var tableBase = table.length;
  var originalTable = table;
  table.grow(tableSize);
  assert(table === originalTable);
  for (var i = memoryBase; i < memoryBase + memorySize; i++) {
   HEAP8[i] = 0;
  }
  for (var i = tableBase; i < tableBase + tableSize; i++) {
   table.set(i, null);
  }
  var moduleLocal = {};
  var resolveSymbol = function(sym, type, legalized) {
   if (legalized) {
    sym = "orig$" + sym;
   }
   var resolved = Module["asm"][sym];
   if (!resolved) {
    sym = "_" + sym;
    resolved = Module[sym];
    if (!resolved) {
     resolved = moduleLocal[sym];
    }
    assert(resolved, "missing linked " + type + " `" + sym + "`. perhaps a side module was not linked in? if this global was expected to arrive from a system library, try to build the MAIN_MODULE with EMCC_FORCE_STDLIBS=1 in the environment");
   }
   return resolved;
  };
  for (var x in Module) {
   if (!(x in env)) {
    env[x] = Module[x];
   }
  }
  var proxyHandler = {
   "get": function(obj, prop) {
    switch (prop) {
    case "__memory_base":
    case "gb":
     return memoryBase;

    case "__table_base":
    case "fb":
     return tableBase;
    }
    if (prop in obj) {
     return obj[prop];
    }
    if (prop.startsWith("g$")) {
     var name = prop.substr(2);
     return obj[prop] = function() {
      return resolveSymbol(name, "global");
     };
    }
    if (prop.startsWith("fp$")) {
     var parts = prop.split("$");
     assert(parts.length == 3);
     var name = parts[1];
     var sig = parts[2];
     var legalized = sig.indexOf("j") >= 0;
     var fp = 0;
     return obj[prop] = function() {
      if (!fp) {
       var f = resolveSymbol(name, "function", legalized);
       fp = addFunction(f, sig);
      }
      return fp;
     };
    }
    if (prop.startsWith("invoke_")) {
     return obj[prop] = invoke_X;
    }
    return obj[prop] = function() {
     return resolveSymbol(prop, "function").apply(null, arguments);
    };
   }
  };
  var proxy = new Proxy(env, proxyHandler);
  var info = {
   global: {
    "NaN": NaN,
    Infinity: Infinity
   },
   "global.Math": Math,
   env: proxy,
   wasi_snapshot_preview1: proxy
  };
  var oldTable = [];
  for (var i = 0; i < tableBase; i++) {
   oldTable.push(table.get(i));
  }
  function postInstantiation(instance, moduleLocal) {
   assert(table === originalTable);
   assert(table === wasmTable);
   for (var i = 0; i < tableBase; i++) {
    assert(table.get(i) === oldTable[i], "old table entries must remain the same");
   }
   for (var i = 0; i < tableSize; i++) {
    assert(table.get(tableBase + i) !== undefined, "table entry was not filled in");
   }
   var exports = relocateExports(instance.exports, memoryBase, tableBase, moduleLocal);
   var init = exports["__post_instantiate"];
   if (init) {
    if (runtimeInitialized) {
     init();
    } else {
     __ATINIT__.push(init);
    }
   }
   return exports;
  }
  if (flags.loadAsync) {
   return WebAssembly.instantiate(binary, info).then(function(result) {
    return postInstantiation(result.instance, moduleLocal);
   });
  } else {
   var instance = new WebAssembly.Instance(new WebAssembly.Module(binary), info);
   return postInstantiation(instance, moduleLocal);
  }
 }
 if (flags.loadAsync) {
  return Promise.all(neededDynlibs.map(function(dynNeeded) {
   return loadDynamicLibrary(dynNeeded, flags);
  })).then(function() {
   return loadModule();
  });
 }
 neededDynlibs.forEach(function(dynNeeded) {
  loadDynamicLibrary(dynNeeded, flags);
 });
 return loadModule();
}

Module["loadWebAssemblyModule"] = loadWebAssemblyModule;

function convertJsFunctionToWasm(func, sig) {
 if (typeof WebAssembly.Function === "function") {
  var typeNames = {
   "i": "i32",
   "j": "i64",
   "f": "f32",
   "d": "f64"
  };
  var type = {
   parameters: [],
   results: sig[0] == "v" ? [] : [ typeNames[sig[0]] ]
  };
  for (var i = 1; i < sig.length; ++i) {
   type.parameters.push(typeNames[sig[i]]);
  }
  return new WebAssembly.Function(type, func);
 }
 var typeSection = [ 1, 0, 1, 96 ];
 var sigRet = sig.slice(0, 1);
 var sigParam = sig.slice(1);
 var typeCodes = {
  "i": 127,
  "j": 126,
  "f": 125,
  "d": 124
 };
 typeSection.push(sigParam.length);
 for (var i = 0; i < sigParam.length; ++i) {
  typeSection.push(typeCodes[sigParam[i]]);
 }
 if (sigRet == "v") {
  typeSection.push(0);
 } else {
  typeSection = typeSection.concat([ 1, typeCodes[sigRet] ]);
 }
 typeSection[1] = typeSection.length - 2;
 var bytes = new Uint8Array([ 0, 97, 115, 109, 1, 0, 0, 0 ].concat(typeSection, [ 2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0 ]));
 var module = new WebAssembly.Module(bytes);
 var instance = new WebAssembly.Instance(module, {
  "e": {
   "f": func
  }
 });
 var wrappedFunc = instance.exports["f"];
 return wrappedFunc;
}

function addFunctionWasm(func, sig) {
 var table = wasmTable;
 var ret = table.length;
 try {
  table.grow(1);
 } catch (err) {
  if (!(err instanceof RangeError)) {
   throw err;
  }
  throw "Unable to grow wasm table. Use a higher value for RESERVED_FUNCTION_POINTERS or set ALLOW_TABLE_GROWTH.";
 }
 try {
  table.set(ret, func);
 } catch (err) {
  if (!(err instanceof TypeError)) {
   throw err;
  }
  assert(typeof sig !== "undefined", "Missing signature argument to addFunction");
  var wrapped = convertJsFunctionToWasm(func, sig);
  table.set(ret, wrapped);
 }
 return ret;
}

function addFunction(func, sig) {
 assert(typeof func !== "undefined");
 return addFunctionWasm(func, sig);
}

var funcWrappers = {};

function getFuncWrapper(func, sig) {
 if (!func) return;
 assert(sig);
 if (!funcWrappers[sig]) {
  funcWrappers[sig] = {};
 }
 var sigCache = funcWrappers[sig];
 if (!sigCache[func]) {
  if (sig.length === 1) {
   sigCache[func] = function dynCall_wrapper() {
    return dynCall(sig, func);
   };
  } else if (sig.length === 2) {
   sigCache[func] = function dynCall_wrapper(arg) {
    return dynCall(sig, func, [ arg ]);
   };
  } else {
   sigCache[func] = function dynCall_wrapper() {
    return dynCall(sig, func, Array.prototype.slice.call(arguments));
   };
  }
 }
 return sigCache[func];
}

function makeBigInt(low, high, unsigned) {
 return unsigned ? +(low >>> 0) + +(high >>> 0) * 4294967296 : +(low >>> 0) + +(high | 0) * 4294967296;
}

function dynCall(sig, ptr, args) {
 if (args && args.length) {
  assert(args.length === sig.substring(1).replace(/j/g, "--").length);
  assert("dynCall_" + sig in Module, "bad function pointer type - no table for sig '" + sig + "'");
  return Module["dynCall_" + sig].apply(null, [ ptr ].concat(args));
 } else {
  assert(sig.length == 1);
  assert("dynCall_" + sig in Module, "bad function pointer type - no table for sig '" + sig + "'");
  return Module["dynCall_" + sig].call(null, ptr);
 }
}

var tempRet0 = 0;

var setTempRet0 = function(value) {
 tempRet0 = value;
};

var getTempRet0 = function() {
 return tempRet0;
};

function getCompilerSetting(name) {
 throw "You must build with -s RETAIN_COMPILER_SETTINGS=1 for getCompilerSetting or emscripten_get_compiler_setting to work";
}

var Runtime = {
 getTempRet0: function() {
  abort('getTempRet0() is now a top-level function, after removing the Runtime object. Remove "Runtime."');
 },
 staticAlloc: function() {
  abort('staticAlloc() is now a top-level function, after removing the Runtime object. Remove "Runtime."');
 },
 stackAlloc: function() {
  abort('stackAlloc() is now a top-level function, after removing the Runtime object. Remove "Runtime."');
 }
};

var GLOBAL_BASE = 1024;

GLOBAL_BASE = alignMemory(GLOBAL_BASE, 1);

var wasmBinary;

if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];

if (!Object.getOwnPropertyDescriptor(Module, "wasmBinary")) Object.defineProperty(Module, "wasmBinary", {
 configurable: true,
 get: function() {
  abort("Module.wasmBinary has been replaced with plain wasmBinary");
 }
});

var noExitRuntime;

if (Module["noExitRuntime"]) noExitRuntime = Module["noExitRuntime"];

if (!Object.getOwnPropertyDescriptor(Module, "noExitRuntime")) Object.defineProperty(Module, "noExitRuntime", {
 configurable: true,
 get: function() {
  abort("Module.noExitRuntime has been replaced with plain noExitRuntime");
 }
});

if (typeof WebAssembly !== "object") {
 abort("No WebAssembly support found. Build with -s WASM=0 to target JavaScript instead.");
}

function setValue(ptr, value, type, noSafe) {
 type = type || "i8";
 if (type.charAt(type.length - 1) === "*") type = "i32";
 switch (type) {
 case "i1":
  HEAP8[ptr >> 0] = value;
  break;

 case "i8":
  HEAP8[ptr >> 0] = value;
  break;

 case "i16":
  HEAP16[ptr >> 1] = value;
  break;

 case "i32":
  HEAP32[ptr >> 2] = value;
  break;

 case "i64":
  tempI64 = [ value >>> 0, (tempDouble = value, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
  HEAP32[ptr >> 2] = tempI64[0], HEAP32[ptr + 4 >> 2] = tempI64[1];
  break;

 case "float":
  HEAPF32[ptr >> 2] = value;
  break;

 case "double":
  HEAPF64[ptr >> 3] = value;
  break;

 default:
  abort("invalid type for setValue: " + type);
 }
}

var wasmMemory;

var wasmTable = new WebAssembly.Table({
 "initial": 3,
 "element": "anyfunc"
});

var ABORT = false;

var EXITSTATUS = 0;

function assert(condition, text) {
 if (!condition) {
  abort("Assertion failed: " + text);
 }
}

var ALLOC_NORMAL = 0;

var ALLOC_STACK = 1;

var ALLOC_NONE = 3;

function allocate(slab, types, allocator, ptr) {
 var zeroinit, size;
 if (typeof slab === "number") {
  zeroinit = true;
  size = slab;
 } else {
  zeroinit = false;
  size = slab.length;
 }
 var singleType = typeof types === "string" ? types : null;
 var ret;
 if (allocator == ALLOC_NONE) {
  ret = ptr;
 } else {
  ret = [ _malloc, stackAlloc, dynamicAlloc ][allocator](Math.max(size, singleType ? 1 : types.length));
 }
 if (zeroinit) {
  var stop;
  ptr = ret;
  assert((ret & 3) == 0);
  stop = ret + (size & ~3);
  for (;ptr < stop; ptr += 4) {
   HEAP32[ptr >> 2] = 0;
  }
  stop = ret + size;
  while (ptr < stop) {
   HEAP8[ptr++ >> 0] = 0;
  }
  return ret;
 }
 if (singleType === "i8") {
  if (slab.subarray || slab.slice) {
   HEAPU8.set(slab, ret);
  } else {
   HEAPU8.set(new Uint8Array(slab), ret);
  }
  return ret;
 }
 var i = 0, type, typeSize, previousType;
 while (i < size) {
  var curr = slab[i];
  type = singleType || types[i];
  if (type === 0) {
   i++;
   continue;
  }
  assert(type, "Must know what type to store in allocate!");
  if (type == "i64") type = "i32";
  setValue(ret + i, curr, type);
  if (previousType !== type) {
   typeSize = getNativeTypeSize(type);
   previousType = type;
  }
  i += typeSize;
 }
 return ret;
}

function getMemory(size) {
 if (!runtimeInitialized) return dynamicAlloc(size);
 return _malloc(size);
}

var UTF8Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : undefined;

function UTF8ArrayToString(u8Array, idx, maxBytesToRead) {
 var endIdx = idx + maxBytesToRead;
 var endPtr = idx;
 while (u8Array[endPtr] && !(endPtr >= endIdx)) ++endPtr;
 if (endPtr - idx > 16 && u8Array.subarray && UTF8Decoder) {
  return UTF8Decoder.decode(u8Array.subarray(idx, endPtr));
 } else {
  var str = "";
  while (idx < endPtr) {
   var u0 = u8Array[idx++];
   if (!(u0 & 128)) {
    str += String.fromCharCode(u0);
    continue;
   }
   var u1 = u8Array[idx++] & 63;
   if ((u0 & 224) == 192) {
    str += String.fromCharCode((u0 & 31) << 6 | u1);
    continue;
   }
   var u2 = u8Array[idx++] & 63;
   if ((u0 & 240) == 224) {
    u0 = (u0 & 15) << 12 | u1 << 6 | u2;
   } else {
    if ((u0 & 248) != 240) warnOnce("Invalid UTF-8 leading byte 0x" + u0.toString(16) + " encountered when deserializing a UTF-8 string on the asm.js/wasm heap to a JS string!");
    u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | u8Array[idx++] & 63;
   }
   if (u0 < 65536) {
    str += String.fromCharCode(u0);
   } else {
    var ch = u0 - 65536;
    str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
   }
  }
 }
 return str;
}

function UTF8ToString(ptr, maxBytesToRead) {
 return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
}

function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
 if (!(maxBytesToWrite > 0)) return 0;
 var startIdx = outIdx;
 var endIdx = outIdx + maxBytesToWrite - 1;
 for (var i = 0; i < str.length; ++i) {
  var u = str.charCodeAt(i);
  if (u >= 55296 && u <= 57343) {
   var u1 = str.charCodeAt(++i);
   u = 65536 + ((u & 1023) << 10) | u1 & 1023;
  }
  if (u <= 127) {
   if (outIdx >= endIdx) break;
   outU8Array[outIdx++] = u;
  } else if (u <= 2047) {
   if (outIdx + 1 >= endIdx) break;
   outU8Array[outIdx++] = 192 | u >> 6;
   outU8Array[outIdx++] = 128 | u & 63;
  } else if (u <= 65535) {
   if (outIdx + 2 >= endIdx) break;
   outU8Array[outIdx++] = 224 | u >> 12;
   outU8Array[outIdx++] = 128 | u >> 6 & 63;
   outU8Array[outIdx++] = 128 | u & 63;
  } else {
   if (outIdx + 3 >= endIdx) break;
   if (u >= 2097152) warnOnce("Invalid Unicode code point 0x" + u.toString(16) + " encountered when serializing a JS string to an UTF-8 string on the asm.js/wasm heap! (Valid unicode code points should be in range 0-0x1FFFFF).");
   outU8Array[outIdx++] = 240 | u >> 18;
   outU8Array[outIdx++] = 128 | u >> 12 & 63;
   outU8Array[outIdx++] = 128 | u >> 6 & 63;
   outU8Array[outIdx++] = 128 | u & 63;
  }
 }
 outU8Array[outIdx] = 0;
 return outIdx - startIdx;
}

function stringToUTF8(str, outPtr, maxBytesToWrite) {
 assert(typeof maxBytesToWrite == "number", "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
 return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
}

function lengthBytesUTF8(str) {
 var len = 0;
 for (var i = 0; i < str.length; ++i) {
  var u = str.charCodeAt(i);
  if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
  if (u <= 127) ++len; else if (u <= 2047) len += 2; else if (u <= 65535) len += 3; else len += 4;
 }
 return len;
}

var UTF16Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-16le") : undefined;

function allocateUTF8(str) {
 var size = lengthBytesUTF8(str) + 1;
 var ret = _malloc(size);
 if (ret) stringToUTF8Array(str, HEAP8, ret, size);
 return ret;
}

function allocateUTF8OnStack(str) {
 var size = lengthBytesUTF8(str) + 1;
 var ret = stackAlloc(size);
 stringToUTF8Array(str, HEAP8, ret, size);
 return ret;
}

function writeArrayToMemory(array, buffer) {
 assert(array.length >= 0, "writeArrayToMemory array must have a length (should be an array or typed array)");
 HEAP8.set(array, buffer);
}

function writeAsciiToMemory(str, buffer, dontAddNull) {
 for (var i = 0; i < str.length; ++i) {
  assert(str.charCodeAt(i) === str.charCodeAt(i) & 255);
  HEAP8[buffer++ >> 0] = str.charCodeAt(i);
 }
 if (!dontAddNull) HEAP8[buffer >> 0] = 0;
}

var WASM_PAGE_SIZE = 65536;

var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

function updateGlobalBufferAndViews(buf) {
 buffer = buf;
 Module["HEAP8"] = HEAP8 = new Int8Array(buf);
 Module["HEAP16"] = HEAP16 = new Int16Array(buf);
 Module["HEAP32"] = HEAP32 = new Int32Array(buf);
 Module["HEAPU8"] = HEAPU8 = new Uint8Array(buf);
 Module["HEAPU16"] = HEAPU16 = new Uint16Array(buf);
 Module["HEAPU32"] = HEAPU32 = new Uint32Array(buf);
 Module["HEAPF32"] = HEAPF32 = new Float32Array(buf);
 Module["HEAPF64"] = HEAPF64 = new Float64Array(buf);
}

var STACK_BASE = 5246672, STACKTOP = STACK_BASE, STACK_MAX = 3792, DYNAMIC_BASE = 5246672, DYNAMICTOP_PTR = 3632;

assert(STACK_BASE % 16 === 0, "stack must start aligned");

assert(DYNAMIC_BASE % 16 === 0, "heap must start aligned");

var TOTAL_STACK = 5242880;

if (Module["TOTAL_STACK"]) assert(TOTAL_STACK === Module["TOTAL_STACK"], "the stack size can no longer be determined at runtime");

var INITIAL_TOTAL_MEMORY = Module["TOTAL_MEMORY"] || 16777216;

if (!Object.getOwnPropertyDescriptor(Module, "TOTAL_MEMORY")) Object.defineProperty(Module, "TOTAL_MEMORY", {
 configurable: true,
 get: function() {
  abort("Module.TOTAL_MEMORY has been replaced with plain INITIAL_TOTAL_MEMORY");
 }
});

assert(INITIAL_TOTAL_MEMORY >= TOTAL_STACK, "TOTAL_MEMORY should be larger than TOTAL_STACK, was " + INITIAL_TOTAL_MEMORY + "! (TOTAL_STACK=" + TOTAL_STACK + ")");

assert(typeof Int32Array !== "undefined" && typeof Float64Array !== "undefined" && Int32Array.prototype.subarray !== undefined && Int32Array.prototype.set !== undefined, "JS engine does not provide full typed array support");

if (Module["wasmMemory"]) {
 wasmMemory = Module["wasmMemory"];
} else {
 wasmMemory = new WebAssembly.Memory({
  "initial": INITIAL_TOTAL_MEMORY / WASM_PAGE_SIZE,
  "maximum": INITIAL_TOTAL_MEMORY / WASM_PAGE_SIZE
 });
}

if (wasmMemory) {
 buffer = wasmMemory.buffer;
}

INITIAL_TOTAL_MEMORY = buffer.byteLength;

assert(INITIAL_TOTAL_MEMORY % WASM_PAGE_SIZE === 0);

updateGlobalBufferAndViews(buffer);

HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;

function writeStackCookie() {
 assert((STACK_MAX & 3) == 0);
 HEAPU32[(STACK_MAX >> 2) + 1] = 34821223;
 HEAPU32[(STACK_MAX >> 2) + 2] = 2310721022;
 HEAP32[0] = 1668509029;
}

function checkStackCookie() {
 var cookie1 = HEAPU32[(STACK_MAX >> 2) + 1];
 var cookie2 = HEAPU32[(STACK_MAX >> 2) + 2];
 if (cookie1 != 34821223 || cookie2 != 2310721022) {
  abort("Stack overflow! Stack cookie has been overwritten, expected hex dwords 0x89BACDFE and 0x2135467, but received 0x" + cookie2.toString(16) + " " + cookie1.toString(16));
 }
 if (HEAP32[0] !== 1668509029) abort("Runtime error: The application has corrupted its heap memory area (address zero)!");
}

function abortStackOverflow(allocSize) {
 abort("Stack overflow! Attempted to allocate " + allocSize + " bytes on the stack, but stack has only " + (STACK_MAX - stackSave() + allocSize) + " bytes available!");
}

(function() {
 var h16 = new Int16Array(1);
 var h8 = new Int8Array(h16.buffer);
 h16[0] = 25459;
 if (h8[0] !== 115 || h8[1] !== 99) throw "Runtime error: expected the system to be little-endian!";
})();

function callRuntimeCallbacks(callbacks) {
 while (callbacks.length > 0) {
  var callback = callbacks.shift();
  if (typeof callback == "function") {
   callback();
   continue;
  }
  var func = callback.func;
  if (typeof func === "number") {
   if (callback.arg === undefined) {
    Module["dynCall_v"](func);
   } else {
    Module["dynCall_vi"](func, callback.arg);
   }
  } else {
   func(callback.arg === undefined ? null : callback.arg);
  }
 }
}

var __ATPRERUN__ = [];

var __ATINIT__ = [];

var __ATMAIN__ = [];

var __ATEXIT__ = [];

var __ATPOSTRUN__ = [];

var runtimeInitialized = false;

var runtimeExited = false;

function preRun() {
 if (Module["preRun"]) {
  if (typeof Module["preRun"] == "function") Module["preRun"] = [ Module["preRun"] ];
  while (Module["preRun"].length) {
   addOnPreRun(Module["preRun"].shift());
  }
 }
 callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
 checkStackCookie();
 assert(!runtimeInitialized);
 runtimeInitialized = true;
 if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
 TTY.init();
 PIPEFS.root = FS.mount(PIPEFS, {}, null);
 SOCKFS.root = FS.mount(SOCKFS, {}, null);
 callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
 checkStackCookie();
 FS.ignorePermissions = false;
 callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
 checkStackCookie();
 runtimeExited = true;
}

function postRun() {
 checkStackCookie();
 if (Module["postRun"]) {
  if (typeof Module["postRun"] == "function") Module["postRun"] = [ Module["postRun"] ];
  while (Module["postRun"].length) {
   addOnPostRun(Module["postRun"].shift());
  }
 }
 callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
 __ATPRERUN__.unshift(cb);
}

function addOnPostRun(cb) {
 __ATPOSTRUN__.unshift(cb);
}

function unSign(value, bits, ignore) {
 if (value >= 0) {
  return value;
 }
 return bits <= 32 ? 2 * Math.abs(1 << bits - 1) + value : Math.pow(2, bits) + value;
}

function reSign(value, bits, ignore) {
 if (value <= 0) {
  return value;
 }
 var half = bits <= 32 ? Math.abs(1 << bits - 1) : Math.pow(2, bits - 1);
 if (value >= half && (bits <= 32 || value > half)) {
  value = -2 * half + value;
 }
 return value;
}

assert(Math.imul, "This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");

assert(Math.fround, "This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");

assert(Math.clz32, "This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");

assert(Math.trunc, "This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");

var Math_abs = Math.abs;

var Math_cos = Math.cos;

var Math_sin = Math.sin;

var Math_tan = Math.tan;

var Math_acos = Math.acos;

var Math_asin = Math.asin;

var Math_atan = Math.atan;

var Math_atan2 = Math.atan2;

var Math_exp = Math.exp;

var Math_log = Math.log;

var Math_sqrt = Math.sqrt;

var Math_ceil = Math.ceil;

var Math_floor = Math.floor;

var Math_pow = Math.pow;

var Math_imul = Math.imul;

var Math_min = Math.min;

var Math_max = Math.max;

var Math_clz32 = Math.clz32;

var Math_trunc = Math.trunc;

var runDependencies = 0;

var runDependencyWatcher = null;

var dependenciesFulfilled = null;

var runDependencyTracking = {};

function getUniqueRunDependency(id) {
 var orig = id;
 while (1) {
  if (!runDependencyTracking[id]) return id;
  id = orig + Math.random();
 }
 return id;
}

function addRunDependency(id) {
 runDependencies++;
 if (Module["monitorRunDependencies"]) {
  Module["monitorRunDependencies"](runDependencies);
 }
 if (id) {
  assert(!runDependencyTracking[id]);
  runDependencyTracking[id] = 1;
  if (runDependencyWatcher === null && typeof setInterval !== "undefined") {
   runDependencyWatcher = setInterval(function() {
    if (ABORT) {
     clearInterval(runDependencyWatcher);
     runDependencyWatcher = null;
     return;
    }
    var shown = false;
    for (var dep in runDependencyTracking) {
     if (!shown) {
      shown = true;
      err("still waiting on run dependencies:");
     }
     err("dependency: " + dep);
    }
    if (shown) {
     err("(end of list)");
    }
   }, 1e4);
  }
 } else {
  err("warning: run dependency added without ID");
 }
}

function removeRunDependency(id) {
 runDependencies--;
 if (Module["monitorRunDependencies"]) {
  Module["monitorRunDependencies"](runDependencies);
 }
 if (id) {
  assert(runDependencyTracking[id]);
  delete runDependencyTracking[id];
 } else {
  err("warning: run dependency removed without ID");
 }
 if (runDependencies == 0) {
  if (runDependencyWatcher !== null) {
   clearInterval(runDependencyWatcher);
   runDependencyWatcher = null;
  }
  if (dependenciesFulfilled) {
   var callback = dependenciesFulfilled;
   dependenciesFulfilled = null;
   callback();
  }
 }
}

Module["preloadedImages"] = {};

Module["preloadedAudios"] = {};

Module["preloadedWasm"] = {};

function abort(what) {
 if (Module["onAbort"]) {
  Module["onAbort"](what);
 }
 what += "";
 out(what);
 err(what);
 ABORT = true;
 EXITSTATUS = 1;
 var output = "abort(" + what + ") at " + stackTrace();
 what = output;
 throw new WebAssembly.RuntimeError(what);
}

addOnPreRun(function() {
 function loadDynamicLibraries(libs) {
  if (libs) {
   libs.forEach(function(lib) {
    loadDynamicLibrary(lib, {
     global: true,
     nodelete: true
    });
   });
  }
 }
 if (Module["dynamicLibraries"] && Module["dynamicLibraries"].length > 0 && !readBinary) {
  addRunDependency("preload_dynamicLibraries");
  Promise.all(Module["dynamicLibraries"].map(function(lib) {
   return loadDynamicLibrary(lib, {
    loadAsync: true,
    global: true,
    nodelete: true
   });
  })).then(function() {
   removeRunDependency("preload_dynamicLibraries");
  });
  return;
 }
 loadDynamicLibraries(Module["dynamicLibraries"]);
});

var dataURIPrefix = "data:application/octet-stream;base64,";

function isDataURI(filename) {
 return String.prototype.startsWith ? filename.startsWith(dataURIPrefix) : filename.indexOf(dataURIPrefix) === 0;
}

var wasmBinaryFile = "index.wasm";

if (!isDataURI(wasmBinaryFile)) {
 wasmBinaryFile = locateFile(wasmBinaryFile);
}

function getBinary() {
 try {
  if (wasmBinary) {
   return new Uint8Array(wasmBinary);
  }
  if (readBinary) {
   return readBinary(wasmBinaryFile);
  } else {
   throw "both async and sync fetching of the wasm failed";
  }
 } catch (err) {
  abort(err);
 }
}

function getBinaryPromise() {
 if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && typeof fetch === "function") {
  return fetch(wasmBinaryFile, {
   credentials: "same-origin"
  }).then(function(response) {
   if (!response["ok"]) {
    throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
   }
   return response["arrayBuffer"]();
  }).catch(function() {
   return getBinary();
  });
 }
 return new Promise(function(resolve, reject) {
  resolve(getBinary());
 });
}

function createWasm() {
 var info = {
  "env": asmLibraryArg,
  "wasi_snapshot_preview1": asmLibraryArg
 };
 function receiveInstance(instance, module) {
  var exports = instance.exports;
  exports = relocateExports(exports, GLOBAL_BASE, 0);
  Module["asm"] = exports;
  removeRunDependency("wasm-instantiate");
 }
 addRunDependency("wasm-instantiate");
 var trueModule = Module;
 function receiveInstantiatedSource(output) {
  assert(Module === trueModule, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?");
  trueModule = null;
  receiveInstance(output["instance"]);
 }
 function instantiateArrayBuffer(receiver) {
  return getBinaryPromise().then(function(binary) {
   return WebAssembly.instantiate(binary, info);
  }).then(receiver, function(reason) {
   err("failed to asynchronously prepare wasm: " + reason);
   abort(reason);
  });
 }
 function instantiateAsync() {
  if (!wasmBinary && typeof WebAssembly.instantiateStreaming === "function" && !isDataURI(wasmBinaryFile) && typeof fetch === "function") {
   fetch(wasmBinaryFile, {
    credentials: "same-origin"
   }).then(function(response) {
    var result = WebAssembly.instantiateStreaming(response, info);
    return result.then(receiveInstantiatedSource, function(reason) {
     err("wasm streaming compile failed: " + reason);
     err("falling back to ArrayBuffer instantiation");
     instantiateArrayBuffer(receiveInstantiatedSource);
    });
   });
  } else {
   return instantiateArrayBuffer(receiveInstantiatedSource);
  }
 }
 if (Module["instantiateWasm"]) {
  try {
   var exports = Module["instantiateWasm"](info, receiveInstance);
   return exports;
  } catch (e) {
   err("Module.instantiateWasm callback failed with error: " + e);
   return false;
  }
 }
 instantiateAsync();
 return {};
}

var tempDouble;

var tempI64;

var ASM_CONSTS = {
 0: function() {
  console.log("main+ js");
 }
};

function _emscripten_asm_const_iii(code, sigPtr, argbuf) {
 code -= 1024;
 var args = readAsmConstArgs(sigPtr, argbuf);
 return ASM_CONSTS[code].apply(null, args);
}

__ATINIT__.push({
 func: function() {
  ___assign_got_enties();
 }
}, {
 func: function() {
  ___wasm_call_ctors();
 }
});

function _emscripten_set_main_loop_timing(mode, value) {
 Browser.mainLoop.timingMode = mode;
 Browser.mainLoop.timingValue = value;
 if (!Browser.mainLoop.func) {
  console.error("emscripten_set_main_loop_timing: Cannot set timing mode for main loop since a main loop does not exist! Call emscripten_set_main_loop first to set one up.");
  return 1;
 }
 if (mode == 0) {
  Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setTimeout() {
   var timeUntilNextTick = Math.max(0, Browser.mainLoop.tickStartTime + value - _emscripten_get_now()) | 0;
   setTimeout(Browser.mainLoop.runner, timeUntilNextTick);
  };
  Browser.mainLoop.method = "timeout";
 } else if (mode == 1) {
  Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
   Browser.requestAnimationFrame(Browser.mainLoop.runner);
  };
  Browser.mainLoop.method = "rAF";
 } else if (mode == 2) {
  if (typeof setImmediate === "undefined") {
   var setImmediates = [];
   var emscriptenMainLoopMessageId = "setimmediate";
   var Browser_setImmediate_messageHandler = function(event) {
    if (event.data === emscriptenMainLoopMessageId || event.data.target === emscriptenMainLoopMessageId) {
     event.stopPropagation();
     setImmediates.shift()();
    }
   };
   addEventListener("message", Browser_setImmediate_messageHandler, true);
   setImmediate = function Browser_emulated_setImmediate(func) {
    setImmediates.push(func);
    if (ENVIRONMENT_IS_WORKER) {
     if (Module["setImmediates"] === undefined) Module["setImmediates"] = [];
     Module["setImmediates"].push(func);
     postMessage({
      target: emscriptenMainLoopMessageId
     });
    } else postMessage(emscriptenMainLoopMessageId, "*");
   };
  }
  Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setImmediate() {
   setImmediate(Browser.mainLoop.runner);
  };
  Browser.mainLoop.method = "immediate";
 }
 return 0;
}

Module["_emscripten_set_main_loop_timing"] = _emscripten_set_main_loop_timing;

function _emscripten_get_now() {
 abort();
}

Module["_emscripten_get_now"] = _emscripten_get_now;

function _emscripten_set_main_loop(func, fps, simulateInfiniteLoop, arg, noSetTiming) {
 noExitRuntime = true;
 assert(!Browser.mainLoop.func, "emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.");
 Browser.mainLoop.func = func;
 Browser.mainLoop.arg = arg;
 var browserIterationFunc;
 if (typeof arg !== "undefined") {
  browserIterationFunc = function() {
   Module["dynCall_vi"](func, arg);
  };
 } else {
  browserIterationFunc = function() {
   Module["dynCall_v"](func);
  };
 }
 var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;
 Browser.mainLoop.runner = function Browser_mainLoop_runner() {
  if (ABORT) return;
  if (Browser.mainLoop.queue.length > 0) {
   var start = Date.now();
   var blocker = Browser.mainLoop.queue.shift();
   blocker.func(blocker.arg);
   if (Browser.mainLoop.remainingBlockers) {
    var remaining = Browser.mainLoop.remainingBlockers;
    var next = remaining % 1 == 0 ? remaining - 1 : Math.floor(remaining);
    if (blocker.counted) {
     Browser.mainLoop.remainingBlockers = next;
    } else {
     next = next + .5;
     Browser.mainLoop.remainingBlockers = (8 * remaining + next) / 9;
    }
   }
   console.log('main loop blocker "' + blocker.name + '" took ' + (Date.now() - start) + " ms");
   Browser.mainLoop.updateStatus();
   if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
   setTimeout(Browser.mainLoop.runner, 0);
   return;
  }
  if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
  Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0;
  if (Browser.mainLoop.timingMode == 1 && Browser.mainLoop.timingValue > 1 && Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0) {
   Browser.mainLoop.scheduler();
   return;
  } else if (Browser.mainLoop.timingMode == 0) {
   Browser.mainLoop.tickStartTime = _emscripten_get_now();
  }
  if (Browser.mainLoop.method === "timeout" && Module.ctx) {
   warnOnce("Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!");
   Browser.mainLoop.method = "";
  }
  Browser.mainLoop.runIter(browserIterationFunc);
  checkStackCookie();
  if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
  if (typeof SDL === "object" && SDL.audio && SDL.audio.queueNewAudioData) SDL.audio.queueNewAudioData();
  Browser.mainLoop.scheduler();
 };
 if (!noSetTiming) {
  if (fps && fps > 0) _emscripten_set_main_loop_timing(0, 1e3 / fps); else _emscripten_set_main_loop_timing(1, 1);
  Browser.mainLoop.scheduler();
 }
 if (simulateInfiniteLoop) {
  throw "unwind";
 }
}

Module["_emscripten_set_main_loop"] = _emscripten_set_main_loop;

var Browser = {
 mainLoop: {
  scheduler: null,
  method: "",
  currentlyRunningMainloop: 0,
  func: null,
  arg: 0,
  timingMode: 0,
  timingValue: 0,
  currentFrameNumber: 0,
  queue: [],
  pause: function() {
   Browser.mainLoop.scheduler = null;
   Browser.mainLoop.currentlyRunningMainloop++;
  },
  resume: function() {
   Browser.mainLoop.currentlyRunningMainloop++;
   var timingMode = Browser.mainLoop.timingMode;
   var timingValue = Browser.mainLoop.timingValue;
   var func = Browser.mainLoop.func;
   Browser.mainLoop.func = null;
   _emscripten_set_main_loop(func, 0, false, Browser.mainLoop.arg, true);
   _emscripten_set_main_loop_timing(timingMode, timingValue);
   Browser.mainLoop.scheduler();
  },
  updateStatus: function() {
   if (Module["setStatus"]) {
    var message = Module["statusMessage"] || "Please wait...";
    var remaining = Browser.mainLoop.remainingBlockers;
    var expected = Browser.mainLoop.expectedBlockers;
    if (remaining) {
     if (remaining < expected) {
      Module["setStatus"](message + " (" + (expected - remaining) + "/" + expected + ")");
     } else {
      Module["setStatus"](message);
     }
    } else {
     Module["setStatus"]("");
    }
   }
  },
  runIter: function(func) {
   if (ABORT) return;
   if (Module["preMainLoop"]) {
    var preRet = Module["preMainLoop"]();
    if (preRet === false) {
     return;
    }
   }
   try {
    func();
   } catch (e) {
    if (e instanceof ExitStatus) {
     return;
    } else {
     if (e && typeof e === "object" && e.stack) err("exception thrown: " + [ e, e.stack ]);
     throw e;
    }
   }
   if (Module["postMainLoop"]) Module["postMainLoop"]();
  }
 },
 isFullscreen: false,
 pointerLock: false,
 moduleContextCreatedCallbacks: [],
 workers: [],
 init: function() {
  if (!Module["preloadPlugins"]) Module["preloadPlugins"] = [];
  if (Browser.initted) return;
  Browser.initted = true;
  try {
   new Blob();
   Browser.hasBlobConstructor = true;
  } catch (e) {
   Browser.hasBlobConstructor = false;
   console.log("warning: no blob constructor, cannot create blobs with mimetypes");
  }
  Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : !Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null;
  Browser.URLObject = typeof window != "undefined" ? window.URL ? window.URL : window.webkitURL : undefined;
  if (!Module.noImageDecoding && typeof Browser.URLObject === "undefined") {
   console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
   Module.noImageDecoding = true;
  }
  var imagePlugin = {};
  imagePlugin["canHandle"] = function imagePlugin_canHandle(name) {
   return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
  };
  imagePlugin["handle"] = function imagePlugin_handle(byteArray, name, onload, onerror) {
   var b = null;
   if (Browser.hasBlobConstructor) {
    try {
     b = new Blob([ byteArray ], {
      type: Browser.getMimetype(name)
     });
     if (b.size !== byteArray.length) {
      b = new Blob([ new Uint8Array(byteArray).buffer ], {
       type: Browser.getMimetype(name)
      });
     }
    } catch (e) {
     warnOnce("Blob constructor present but fails: " + e + "; falling back to blob builder");
    }
   }
   if (!b) {
    var bb = new Browser.BlobBuilder();
    bb.append(new Uint8Array(byteArray).buffer);
    b = bb.getBlob();
   }
   var url = Browser.URLObject.createObjectURL(b);
   assert(typeof url == "string", "createObjectURL must return a url as a string");
   var img = new Image();
   img.onload = function img_onload() {
    assert(img.complete, "Image " + name + " could not be decoded");
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    Module["preloadedImages"][name] = canvas;
    Browser.URLObject.revokeObjectURL(url);
    if (onload) onload(byteArray);
   };
   img.onerror = function img_onerror(event) {
    console.log("Image " + url + " could not be decoded");
    if (onerror) onerror();
   };
   img.src = url;
  };
  Module["preloadPlugins"].push(imagePlugin);
  var audioPlugin = {};
  audioPlugin["canHandle"] = function audioPlugin_canHandle(name) {
   return !Module.noAudioDecoding && name.substr(-4) in {
    ".ogg": 1,
    ".wav": 1,
    ".mp3": 1
   };
  };
  audioPlugin["handle"] = function audioPlugin_handle(byteArray, name, onload, onerror) {
   var done = false;
   function finish(audio) {
    if (done) return;
    done = true;
    Module["preloadedAudios"][name] = audio;
    if (onload) onload(byteArray);
   }
   function fail() {
    if (done) return;
    done = true;
    Module["preloadedAudios"][name] = new Audio();
    if (onerror) onerror();
   }
   if (Browser.hasBlobConstructor) {
    try {
     var b = new Blob([ byteArray ], {
      type: Browser.getMimetype(name)
     });
    } catch (e) {
     return fail();
    }
    var url = Browser.URLObject.createObjectURL(b);
    assert(typeof url == "string", "createObjectURL must return a url as a string");
    var audio = new Audio();
    audio.addEventListener("canplaythrough", function() {
     finish(audio);
    }, false);
    audio.onerror = function audio_onerror(event) {
     if (done) return;
     console.log("warning: browser could not fully decode audio " + name + ", trying slower base64 approach");
     function encode64(data) {
      var BASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      var PAD = "=";
      var ret = "";
      var leftchar = 0;
      var leftbits = 0;
      for (var i = 0; i < data.length; i++) {
       leftchar = leftchar << 8 | data[i];
       leftbits += 8;
       while (leftbits >= 6) {
        var curr = leftchar >> leftbits - 6 & 63;
        leftbits -= 6;
        ret += BASE[curr];
       }
      }
      if (leftbits == 2) {
       ret += BASE[(leftchar & 3) << 4];
       ret += PAD + PAD;
      } else if (leftbits == 4) {
       ret += BASE[(leftchar & 15) << 2];
       ret += PAD;
      }
      return ret;
     }
     audio.src = "data:audio/x-" + name.substr(-3) + ";base64," + encode64(byteArray);
     finish(audio);
    };
    audio.src = url;
    Browser.safeSetTimeout(function() {
     finish(audio);
    }, 1e4);
   } else {
    return fail();
   }
  };
  Module["preloadPlugins"].push(audioPlugin);
  var wasmPlugin = {};
  wasmPlugin["asyncWasmLoadPromise"] = new Promise(function(resolve, reject) {
   return resolve();
  });
  wasmPlugin["canHandle"] = function(name) {
   return !Module.noWasmDecoding && name.endsWith(".so");
  };
  wasmPlugin["handle"] = function(byteArray, name, onload, onerror) {
   this["asyncWasmLoadPromise"] = this["asyncWasmLoadPromise"].then(function() {
    return loadWebAssemblyModule(byteArray, {
     loadAsync: true,
     nodelete: true
    });
   }).then(function(module) {
    Module["preloadedWasm"][name] = module;
    onload();
   }, function(err) {
    console.warn("Couldn't instantiate wasm: " + name + " '" + err + "'");
    onerror();
   });
  };
  Module["preloadPlugins"].push(wasmPlugin);
  function pointerLockChange() {
   Browser.pointerLock = document["pointerLockElement"] === Module["canvas"] || document["mozPointerLockElement"] === Module["canvas"] || document["webkitPointerLockElement"] === Module["canvas"] || document["msPointerLockElement"] === Module["canvas"];
  }
  var canvas = Module["canvas"];
  if (canvas) {
   canvas.requestPointerLock = canvas["requestPointerLock"] || canvas["mozRequestPointerLock"] || canvas["webkitRequestPointerLock"] || canvas["msRequestPointerLock"] || function() {};
   canvas.exitPointerLock = document["exitPointerLock"] || document["mozExitPointerLock"] || document["webkitExitPointerLock"] || document["msExitPointerLock"] || function() {};
   canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
   document.addEventListener("pointerlockchange", pointerLockChange, false);
   document.addEventListener("mozpointerlockchange", pointerLockChange, false);
   document.addEventListener("webkitpointerlockchange", pointerLockChange, false);
   document.addEventListener("mspointerlockchange", pointerLockChange, false);
   if (Module["elementPointerLock"]) {
    canvas.addEventListener("click", function(ev) {
     if (!Browser.pointerLock && Module["canvas"].requestPointerLock) {
      Module["canvas"].requestPointerLock();
      ev.preventDefault();
     }
    }, false);
   }
  }
 },
 createContext: function(canvas, useWebGL, setInModule, webGLContextAttributes) {
  if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx;
  var ctx;
  var contextHandle;
  if (useWebGL) {
   var contextAttributes = {
    antialias: false,
    alpha: false,
    majorVersion: 1
   };
   if (webGLContextAttributes) {
    for (var attribute in webGLContextAttributes) {
     contextAttributes[attribute] = webGLContextAttributes[attribute];
    }
   }
   if (typeof GL !== "undefined") {
    contextHandle = GL.createContext(canvas, contextAttributes);
    if (contextHandle) {
     ctx = GL.getContext(contextHandle).GLctx;
    }
   }
  } else {
   ctx = canvas.getContext("2d");
  }
  if (!ctx) return null;
  if (setInModule) {
   if (!useWebGL) assert(typeof GLctx === "undefined", "cannot set in module if GLctx is used, but we are a non-GL context that would replace it");
   Module.ctx = ctx;
   if (useWebGL) GL.makeContextCurrent(contextHandle);
   Module.useWebGL = useWebGL;
   Browser.moduleContextCreatedCallbacks.forEach(function(callback) {
    callback();
   });
   Browser.init();
  }
  return ctx;
 },
 destroyContext: function(canvas, useWebGL, setInModule) {},
 fullscreenHandlersInstalled: false,
 lockPointer: undefined,
 resizeCanvas: undefined,
 requestFullscreen: function(lockPointer, resizeCanvas, vrDevice) {
  Browser.lockPointer = lockPointer;
  Browser.resizeCanvas = resizeCanvas;
  Browser.vrDevice = vrDevice;
  if (typeof Browser.lockPointer === "undefined") Browser.lockPointer = true;
  if (typeof Browser.resizeCanvas === "undefined") Browser.resizeCanvas = false;
  if (typeof Browser.vrDevice === "undefined") Browser.vrDevice = null;
  var canvas = Module["canvas"];
  function fullscreenChange() {
   Browser.isFullscreen = false;
   var canvasContainer = canvas.parentNode;
   if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvasContainer) {
    canvas.exitFullscreen = Browser.exitFullscreen;
    if (Browser.lockPointer) canvas.requestPointerLock();
    Browser.isFullscreen = true;
    if (Browser.resizeCanvas) {
     Browser.setFullscreenCanvasSize();
    } else {
     Browser.updateCanvasDimensions(canvas);
    }
   } else {
    canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
    canvasContainer.parentNode.removeChild(canvasContainer);
    if (Browser.resizeCanvas) {
     Browser.setWindowedCanvasSize();
    } else {
     Browser.updateCanvasDimensions(canvas);
    }
   }
   if (Module["onFullScreen"]) Module["onFullScreen"](Browser.isFullscreen);
   if (Module["onFullscreen"]) Module["onFullscreen"](Browser.isFullscreen);
  }
  if (!Browser.fullscreenHandlersInstalled) {
   Browser.fullscreenHandlersInstalled = true;
   document.addEventListener("fullscreenchange", fullscreenChange, false);
   document.addEventListener("mozfullscreenchange", fullscreenChange, false);
   document.addEventListener("webkitfullscreenchange", fullscreenChange, false);
   document.addEventListener("MSFullscreenChange", fullscreenChange, false);
  }
  var canvasContainer = document.createElement("div");
  canvas.parentNode.insertBefore(canvasContainer, canvas);
  canvasContainer.appendChild(canvas);
  canvasContainer.requestFullscreen = canvasContainer["requestFullscreen"] || canvasContainer["mozRequestFullScreen"] || canvasContainer["msRequestFullscreen"] || (canvasContainer["webkitRequestFullscreen"] ? function() {
   canvasContainer["webkitRequestFullscreen"](Element["ALLOW_KEYBOARD_INPUT"]);
  } : null) || (canvasContainer["webkitRequestFullScreen"] ? function() {
   canvasContainer["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"]);
  } : null);
  if (vrDevice) {
   canvasContainer.requestFullscreen({
    vrDisplay: vrDevice
   });
  } else {
   canvasContainer.requestFullscreen();
  }
 },
 requestFullScreen: function() {
  abort("Module.requestFullScreen has been replaced by Module.requestFullscreen (without a capital S)");
 },
 exitFullscreen: function() {
  if (!Browser.isFullscreen) {
   return false;
  }
  var CFS = document["exitFullscreen"] || document["cancelFullScreen"] || document["mozCancelFullScreen"] || document["msExitFullscreen"] || document["webkitCancelFullScreen"] || function() {};
  CFS.apply(document, []);
  return true;
 },
 nextRAF: 0,
 fakeRequestAnimationFrame: function(func) {
  var now = Date.now();
  if (Browser.nextRAF === 0) {
   Browser.nextRAF = now + 1e3 / 60;
  } else {
   while (now + 2 >= Browser.nextRAF) {
    Browser.nextRAF += 1e3 / 60;
   }
  }
  var delay = Math.max(Browser.nextRAF - now, 0);
  setTimeout(func, delay);
 },
 requestAnimationFrame: function(func) {
  if (typeof requestAnimationFrame === "function") {
   requestAnimationFrame(func);
   return;
  }
  var RAF = Browser.fakeRequestAnimationFrame;
  RAF(func);
 },
 safeCallback: function(func) {
  return function() {
   if (!ABORT) return func.apply(null, arguments);
  };
 },
 allowAsyncCallbacks: true,
 queuedAsyncCallbacks: [],
 pauseAsyncCallbacks: function() {
  Browser.allowAsyncCallbacks = false;
 },
 resumeAsyncCallbacks: function() {
  Browser.allowAsyncCallbacks = true;
  if (Browser.queuedAsyncCallbacks.length > 0) {
   var callbacks = Browser.queuedAsyncCallbacks;
   Browser.queuedAsyncCallbacks = [];
   callbacks.forEach(function(func) {
    func();
   });
  }
 },
 safeRequestAnimationFrame: function(func) {
  return Browser.requestAnimationFrame(function() {
   if (ABORT) return;
   if (Browser.allowAsyncCallbacks) {
    func();
   } else {
    Browser.queuedAsyncCallbacks.push(func);
   }
  });
 },
 safeSetTimeout: function(func, timeout) {
  noExitRuntime = true;
  return setTimeout(function() {
   if (ABORT) return;
   if (Browser.allowAsyncCallbacks) {
    func();
   } else {
    Browser.queuedAsyncCallbacks.push(func);
   }
  }, timeout);
 },
 safeSetInterval: function(func, timeout) {
  noExitRuntime = true;
  return setInterval(function() {
   if (ABORT) return;
   if (Browser.allowAsyncCallbacks) {
    func();
   }
  }, timeout);
 },
 getMimetype: function(name) {
  return {
   "jpg": "image/jpeg",
   "jpeg": "image/jpeg",
   "png": "image/png",
   "bmp": "image/bmp",
   "ogg": "audio/ogg",
   "wav": "audio/wav",
   "mp3": "audio/mpeg"
  }[name.substr(name.lastIndexOf(".") + 1)];
 },
 getUserMedia: function(func) {
  if (!window.getUserMedia) {
   window.getUserMedia = navigator["getUserMedia"] || navigator["mozGetUserMedia"];
  }
  window.getUserMedia(func);
 },
 getMovementX: function(event) {
  return event["movementX"] || event["mozMovementX"] || event["webkitMovementX"] || 0;
 },
 getMovementY: function(event) {
  return event["movementY"] || event["mozMovementY"] || event["webkitMovementY"] || 0;
 },
 getMouseWheelDelta: function(event) {
  var delta = 0;
  switch (event.type) {
  case "DOMMouseScroll":
   delta = event.detail / 3;
   break;

  case "mousewheel":
   delta = event.wheelDelta / 120;
   break;

  case "wheel":
   delta = event.deltaY;
   switch (event.deltaMode) {
   case 0:
    delta /= 100;
    break;

   case 1:
    delta /= 3;
    break;

   case 2:
    delta *= 80;
    break;

   default:
    throw "unrecognized mouse wheel delta mode: " + event.deltaMode;
   }
   break;

  default:
   throw "unrecognized mouse wheel event: " + event.type;
  }
  return delta;
 },
 mouseX: 0,
 mouseY: 0,
 mouseMovementX: 0,
 mouseMovementY: 0,
 touches: {},
 lastTouches: {},
 calculateMouseEvent: function(event) {
  if (Browser.pointerLock) {
   if (event.type != "mousemove" && "mozMovementX" in event) {
    Browser.mouseMovementX = Browser.mouseMovementY = 0;
   } else {
    Browser.mouseMovementX = Browser.getMovementX(event);
    Browser.mouseMovementY = Browser.getMovementY(event);
   }
   if (typeof SDL != "undefined") {
    Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
    Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
   } else {
    Browser.mouseX += Browser.mouseMovementX;
    Browser.mouseY += Browser.mouseMovementY;
   }
  } else {
   var rect = Module["canvas"].getBoundingClientRect();
   var cw = Module["canvas"].width;
   var ch = Module["canvas"].height;
   var scrollX = typeof window.scrollX !== "undefined" ? window.scrollX : window.pageXOffset;
   var scrollY = typeof window.scrollY !== "undefined" ? window.scrollY : window.pageYOffset;
   assert(typeof scrollX !== "undefined" && typeof scrollY !== "undefined", "Unable to retrieve scroll position, mouse positions likely broken.");
   if (event.type === "touchstart" || event.type === "touchend" || event.type === "touchmove") {
    var touch = event.touch;
    if (touch === undefined) {
     return;
    }
    var adjustedX = touch.pageX - (scrollX + rect.left);
    var adjustedY = touch.pageY - (scrollY + rect.top);
    adjustedX = adjustedX * (cw / rect.width);
    adjustedY = adjustedY * (ch / rect.height);
    var coords = {
     x: adjustedX,
     y: adjustedY
    };
    if (event.type === "touchstart") {
     Browser.lastTouches[touch.identifier] = coords;
     Browser.touches[touch.identifier] = coords;
    } else if (event.type === "touchend" || event.type === "touchmove") {
     var last = Browser.touches[touch.identifier];
     if (!last) last = coords;
     Browser.lastTouches[touch.identifier] = last;
     Browser.touches[touch.identifier] = coords;
    }
    return;
   }
   var x = event.pageX - (scrollX + rect.left);
   var y = event.pageY - (scrollY + rect.top);
   x = x * (cw / rect.width);
   y = y * (ch / rect.height);
   Browser.mouseMovementX = x - Browser.mouseX;
   Browser.mouseMovementY = y - Browser.mouseY;
   Browser.mouseX = x;
   Browser.mouseY = y;
  }
 },
 asyncLoad: function(url, onload, onerror, noRunDep) {
  var dep = !noRunDep ? getUniqueRunDependency("al " + url) : "";
  readAsync(url, function(arrayBuffer) {
   assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
   onload(new Uint8Array(arrayBuffer));
   if (dep) removeRunDependency(dep);
  }, function(event) {
   if (onerror) {
    onerror();
   } else {
    throw 'Loading data file "' + url + '" failed.';
   }
  });
  if (dep) addRunDependency(dep);
 },
 resizeListeners: [],
 updateResizeListeners: function() {
  var canvas = Module["canvas"];
  Browser.resizeListeners.forEach(function(listener) {
   listener(canvas.width, canvas.height);
  });
 },
 setCanvasSize: function(width, height, noUpdates) {
  var canvas = Module["canvas"];
  Browser.updateCanvasDimensions(canvas, width, height);
  if (!noUpdates) Browser.updateResizeListeners();
 },
 windowedWidth: 0,
 windowedHeight: 0,
 setFullscreenCanvasSize: function() {
  if (typeof SDL != "undefined") {
   var flags = HEAPU32[SDL.screen >> 2];
   flags = flags | 8388608;
   HEAP32[SDL.screen >> 2] = flags;
  }
  Browser.updateCanvasDimensions(Module["canvas"]);
  Browser.updateResizeListeners();
 },
 setWindowedCanvasSize: function() {
  if (typeof SDL != "undefined") {
   var flags = HEAPU32[SDL.screen >> 2];
   flags = flags & ~8388608;
   HEAP32[SDL.screen >> 2] = flags;
  }
  Browser.updateCanvasDimensions(Module["canvas"]);
  Browser.updateResizeListeners();
 },
 updateCanvasDimensions: function(canvas, wNative, hNative) {
  if (wNative && hNative) {
   canvas.widthNative = wNative;
   canvas.heightNative = hNative;
  } else {
   wNative = canvas.widthNative;
   hNative = canvas.heightNative;
  }
  var w = wNative;
  var h = hNative;
  if (Module["forcedAspectRatio"] && Module["forcedAspectRatio"] > 0) {
   if (w / h < Module["forcedAspectRatio"]) {
    w = Math.round(h * Module["forcedAspectRatio"]);
   } else {
    h = Math.round(w / Module["forcedAspectRatio"]);
   }
  }
  if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvas.parentNode && typeof screen != "undefined") {
   var factor = Math.min(screen.width / w, screen.height / h);
   w = Math.round(w * factor);
   h = Math.round(h * factor);
  }
  if (Browser.resizeCanvas) {
   if (canvas.width != w) canvas.width = w;
   if (canvas.height != h) canvas.height = h;
   if (typeof canvas.style != "undefined") {
    canvas.style.removeProperty("width");
    canvas.style.removeProperty("height");
   }
  } else {
   if (canvas.width != wNative) canvas.width = wNative;
   if (canvas.height != hNative) canvas.height = hNative;
   if (typeof canvas.style != "undefined") {
    if (w != wNative || h != hNative) {
     canvas.style.setProperty("width", w + "px", "important");
     canvas.style.setProperty("height", h + "px", "important");
    } else {
     canvas.style.removeProperty("width");
     canvas.style.removeProperty("height");
    }
   }
  }
 },
 wgetRequests: {},
 nextWgetRequestHandle: 0,
 getNextWgetRequestHandle: function() {
  var handle = Browser.nextWgetRequestHandle;
  Browser.nextWgetRequestHandle++;
  return handle;
 }
};

Module["Browser"] = Browser;

function demangle(func) {
 warnOnce("warning: build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling");
 return func;
}

Module["demangle"] = demangle;

function demangleAll(text) {
 var regex = /\b_Z[\w\d_]+/g;
 return text.replace(regex, function(x) {
  var y = demangle(x);
  return x === y ? x : y + " [" + x + "]";
 });
}

Module["demangleAll"] = demangleAll;

function jsStackTrace() {
 var err = new Error();
 if (!err.stack) {
  try {
   throw new Error();
  } catch (e) {
   err = e;
  }
  if (!err.stack) {
   return "(no stack trace available)";
  }
 }
 return err.stack.toString();
}

Module["jsStackTrace"] = jsStackTrace;

function stackTrace() {
 var js = jsStackTrace();
 if (Module["extraStackTrace"]) js += "\n" + Module["extraStackTrace"]();
 return demangleAll(js);
}

Module["stackTrace"] = stackTrace;

function __Z5sideyx() {
 if (!Module["__Z5sideyx"]) abort("external function '_Z5sideyx' is missing. perhaps a side module was not linked in? if this function was expected to arrive from a system library, try to build the MAIN_MODULE with EMCC_FORCE_STDLIBS=1 in the environment");
 return Module["__Z5sideyx"].apply(null, arguments);
}

function __Z6sidey2x() {
 if (!Module["__Z6sidey2x"]) abort("external function '_Z6sidey2x' is missing. perhaps a side module was not linked in? if this function was expected to arrive from a system library, try to build the MAIN_MODULE with EMCC_FORCE_STDLIBS=1 in the environment");
 return Module["__Z6sidey2x"].apply(null, arguments);
}

function ___handle_stack_overflow() {
 abort("stack overflow");
}

Module["___handle_stack_overflow"] = ___handle_stack_overflow;

function ___lock() {}

Module["___lock"] = ___lock;

function ___unlock() {}

Module["___unlock"] = ___unlock;

function _abort() {
 abort();
}

Module["_abort"] = _abort;

var _emscripten_get_now_is_monotonic = 0 || ENVIRONMENT_IS_NODE || typeof dateNow !== "undefined" || 1;

Module["_emscripten_get_now_is_monotonic"] = _emscripten_get_now_is_monotonic;

function ___setErrNo(value) {
 if (Module["___errno_location"]) HEAP32[Module["___errno_location"]() >> 2] = value; else err("failed to set errno from JS");
 return value;
}

Module["___setErrNo"] = ___setErrNo;

function _clock_gettime(clk_id, tp) {
 var now;
 if (clk_id === 0) {
  now = Date.now();
 } else if (clk_id === 1 && _emscripten_get_now_is_monotonic) {
  now = _emscripten_get_now();
 } else {
  ___setErrNo(28);
  return -1;
 }
 HEAP32[tp >> 2] = now / 1e3 | 0;
 HEAP32[tp + 4 >> 2] = now % 1e3 * 1e3 * 1e3 | 0;
 return 0;
}

Module["_clock_gettime"] = _clock_gettime;

function _emscripten_get_heap_size() {
 return HEAP8.length;
}

Module["_emscripten_get_heap_size"] = _emscripten_get_heap_size;

function _emscripten_get_sbrk_ptr() {
 return 3632;
}

Module["_emscripten_get_sbrk_ptr"] = _emscripten_get_sbrk_ptr;

function _emscripten_memcpy_big(dest, src, num) {
 HEAPU8.set(HEAPU8.subarray(src, src + num), dest);
}

Module["_emscripten_memcpy_big"] = _emscripten_memcpy_big;

function abortOnCannotGrowMemory(requestedSize) {
 abort("Cannot enlarge memory arrays to size " + requestedSize + " bytes (OOM). Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value " + HEAP8.length + ", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ");
}

Module["abortOnCannotGrowMemory"] = abortOnCannotGrowMemory;

function _emscripten_resize_heap(requestedSize) {
 abortOnCannotGrowMemory(requestedSize);
}

Module["_emscripten_resize_heap"] = _emscripten_resize_heap;

var ENV = {};

Module["ENV"] = ENV;

function _emscripten_get_environ() {
 if (!_emscripten_get_environ.strings) {
  var env = {
   "USER": "web_user",
   "LOGNAME": "web_user",
   "PATH": "/",
   "PWD": "/",
   "HOME": "/home/web_user",
   "LANG": (typeof navigator === "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8",
   "_": thisProgram
  };
  for (var x in ENV) {
   env[x] = ENV[x];
  }
  var strings = [];
  for (var x in env) {
   strings.push(x + "=" + env[x]);
  }
  _emscripten_get_environ.strings = strings;
 }
 return _emscripten_get_environ.strings;
}

Module["_emscripten_get_environ"] = _emscripten_get_environ;

function _environ_get(__environ, environ_buf) {
 var strings = _emscripten_get_environ();
 var bufSize = 0;
 strings.forEach(function(string, i) {
  var ptr = environ_buf + bufSize;
  HEAP32[__environ + i * 4 >> 2] = ptr;
  writeAsciiToMemory(string, ptr);
  bufSize += string.length + 1;
 });
 return 0;
}

Module["_environ_get"] = _environ_get;

function _environ_sizes_get(penviron_count, penviron_buf_size) {
 var strings = _emscripten_get_environ();
 HEAP32[penviron_count >> 2] = strings.length;
 var bufSize = 0;
 strings.forEach(function(string) {
  bufSize += string.length + 1;
 });
 HEAP32[penviron_buf_size >> 2] = bufSize;
 return 0;
}

Module["_environ_sizes_get"] = _environ_sizes_get;

var PATH = {
 splitPath: function(filename) {
  var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
  return splitPathRe.exec(filename).slice(1);
 },
 normalizeArray: function(parts, allowAboveRoot) {
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
   var last = parts[i];
   if (last === ".") {
    parts.splice(i, 1);
   } else if (last === "..") {
    parts.splice(i, 1);
    up++;
   } else if (up) {
    parts.splice(i, 1);
    up--;
   }
  }
  if (allowAboveRoot) {
   for (;up; up--) {
    parts.unshift("..");
   }
  }
  return parts;
 },
 normalize: function(path) {
  var isAbsolute = path.charAt(0) === "/", trailingSlash = path.substr(-1) === "/";
  path = PATH.normalizeArray(path.split("/").filter(function(p) {
   return !!p;
  }), !isAbsolute).join("/");
  if (!path && !isAbsolute) {
   path = ".";
  }
  if (path && trailingSlash) {
   path += "/";
  }
  return (isAbsolute ? "/" : "") + path;
 },
 dirname: function(path) {
  var result = PATH.splitPath(path), root = result[0], dir = result[1];
  if (!root && !dir) {
   return ".";
  }
  if (dir) {
   dir = dir.substr(0, dir.length - 1);
  }
  return root + dir;
 },
 basename: function(path) {
  if (path === "/") return "/";
  var lastSlash = path.lastIndexOf("/");
  if (lastSlash === -1) return path;
  return path.substr(lastSlash + 1);
 },
 extname: function(path) {
  return PATH.splitPath(path)[3];
 },
 join: function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return PATH.normalize(paths.join("/"));
 },
 join2: function(l, r) {
  return PATH.normalize(l + "/" + r);
 }
};

Module["PATH"] = PATH;

var PATH_FS = {
 resolve: function() {
  var resolvedPath = "", resolvedAbsolute = false;
  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
   var path = i >= 0 ? arguments[i] : FS.cwd();
   if (typeof path !== "string") {
    throw new TypeError("Arguments to path.resolve must be strings");
   } else if (!path) {
    return "";
   }
   resolvedPath = path + "/" + resolvedPath;
   resolvedAbsolute = path.charAt(0) === "/";
  }
  resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter(function(p) {
   return !!p;
  }), !resolvedAbsolute).join("/");
  return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
 },
 relative: function(from, to) {
  from = PATH_FS.resolve(from).substr(1);
  to = PATH_FS.resolve(to).substr(1);
  function trim(arr) {
   var start = 0;
   for (;start < arr.length; start++) {
    if (arr[start] !== "") break;
   }
   var end = arr.length - 1;
   for (;end >= 0; end--) {
    if (arr[end] !== "") break;
   }
   if (start > end) return [];
   return arr.slice(start, end - start + 1);
  }
  var fromParts = trim(from.split("/"));
  var toParts = trim(to.split("/"));
  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
   if (fromParts[i] !== toParts[i]) {
    samePartsLength = i;
    break;
   }
  }
  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
   outputParts.push("..");
  }
  outputParts = outputParts.concat(toParts.slice(samePartsLength));
  return outputParts.join("/");
 }
};

Module["PATH_FS"] = PATH_FS;

var TTY = {
 ttys: [],
 init: function() {},
 shutdown: function() {},
 register: function(dev, ops) {
  TTY.ttys[dev] = {
   input: [],
   output: [],
   ops: ops
  };
  FS.registerDevice(dev, TTY.stream_ops);
 },
 stream_ops: {
  open: function(stream) {
   var tty = TTY.ttys[stream.node.rdev];
   if (!tty) {
    throw new FS.ErrnoError(43);
   }
   stream.tty = tty;
   stream.seekable = false;
  },
  close: function(stream) {
   stream.tty.ops.flush(stream.tty);
  },
  flush: function(stream) {
   stream.tty.ops.flush(stream.tty);
  },
  read: function(stream, buffer, offset, length, pos) {
   if (!stream.tty || !stream.tty.ops.get_char) {
    throw new FS.ErrnoError(60);
   }
   var bytesRead = 0;
   for (var i = 0; i < length; i++) {
    var result;
    try {
     result = stream.tty.ops.get_char(stream.tty);
    } catch (e) {
     throw new FS.ErrnoError(29);
    }
    if (result === undefined && bytesRead === 0) {
     throw new FS.ErrnoError(6);
    }
    if (result === null || result === undefined) break;
    bytesRead++;
    buffer[offset + i] = result;
   }
   if (bytesRead) {
    stream.node.timestamp = Date.now();
   }
   return bytesRead;
  },
  write: function(stream, buffer, offset, length, pos) {
   if (!stream.tty || !stream.tty.ops.put_char) {
    throw new FS.ErrnoError(60);
   }
   try {
    for (var i = 0; i < length; i++) {
     stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
    }
   } catch (e) {
    throw new FS.ErrnoError(29);
   }
   if (length) {
    stream.node.timestamp = Date.now();
   }
   return i;
  }
 },
 default_tty_ops: {
  get_char: function(tty) {
   if (!tty.input.length) {
    var result = null;
    if (ENVIRONMENT_IS_NODE) {
     var BUFSIZE = 256;
     var buf = Buffer.alloc ? Buffer.alloc(BUFSIZE) : new Buffer(BUFSIZE);
     var bytesRead = 0;
     try {
      bytesRead = nodeFS.readSync(process.stdin.fd, buf, 0, BUFSIZE, null);
     } catch (e) {
      if (e.toString().indexOf("EOF") != -1) bytesRead = 0; else throw e;
     }
     if (bytesRead > 0) {
      result = buf.slice(0, bytesRead).toString("utf-8");
     } else {
      result = null;
     }
    } else if (typeof window != "undefined" && typeof window.prompt == "function") {
     result = window.prompt("Input: ");
     if (result !== null) {
      result += "\n";
     }
    } else if (typeof readline == "function") {
     result = readline();
     if (result !== null) {
      result += "\n";
     }
    }
    if (!result) {
     return null;
    }
    tty.input = intArrayFromString(result, true);
   }
   return tty.input.shift();
  },
  put_char: function(tty, val) {
   if (val === null || val === 10) {
    out(UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   } else {
    if (val != 0) tty.output.push(val);
   }
  },
  flush: function(tty) {
   if (tty.output && tty.output.length > 0) {
    out(UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   }
  }
 },
 default_tty1_ops: {
  put_char: function(tty, val) {
   if (val === null || val === 10) {
    err(UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   } else {
    if (val != 0) tty.output.push(val);
   }
  },
  flush: function(tty) {
   if (tty.output && tty.output.length > 0) {
    err(UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   }
  }
 }
};

Module["TTY"] = TTY;

var MEMFS = {
 ops_table: null,
 mount: function(mount) {
  return MEMFS.createNode(null, "/", 16384 | 511, 0);
 },
 createNode: function(parent, name, mode, dev) {
  if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
   throw new FS.ErrnoError(63);
  }
  if (!MEMFS.ops_table) {
   MEMFS.ops_table = {
    dir: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr,
      lookup: MEMFS.node_ops.lookup,
      mknod: MEMFS.node_ops.mknod,
      rename: MEMFS.node_ops.rename,
      unlink: MEMFS.node_ops.unlink,
      rmdir: MEMFS.node_ops.rmdir,
      readdir: MEMFS.node_ops.readdir,
      symlink: MEMFS.node_ops.symlink
     },
     stream: {
      llseek: MEMFS.stream_ops.llseek
     }
    },
    file: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr
     },
     stream: {
      llseek: MEMFS.stream_ops.llseek,
      read: MEMFS.stream_ops.read,
      write: MEMFS.stream_ops.write,
      allocate: MEMFS.stream_ops.allocate,
      mmap: MEMFS.stream_ops.mmap,
      msync: MEMFS.stream_ops.msync
     }
    },
    link: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr,
      readlink: MEMFS.node_ops.readlink
     },
     stream: {}
    },
    chrdev: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr
     },
     stream: FS.chrdev_stream_ops
    }
   };
  }
  var node = FS.createNode(parent, name, mode, dev);
  if (FS.isDir(node.mode)) {
   node.node_ops = MEMFS.ops_table.dir.node;
   node.stream_ops = MEMFS.ops_table.dir.stream;
   node.contents = {};
  } else if (FS.isFile(node.mode)) {
   node.node_ops = MEMFS.ops_table.file.node;
   node.stream_ops = MEMFS.ops_table.file.stream;
   node.usedBytes = 0;
   node.contents = null;
  } else if (FS.isLink(node.mode)) {
   node.node_ops = MEMFS.ops_table.link.node;
   node.stream_ops = MEMFS.ops_table.link.stream;
  } else if (FS.isChrdev(node.mode)) {
   node.node_ops = MEMFS.ops_table.chrdev.node;
   node.stream_ops = MEMFS.ops_table.chrdev.stream;
  }
  node.timestamp = Date.now();
  if (parent) {
   parent.contents[name] = node;
  }
  return node;
 },
 getFileDataAsRegularArray: function(node) {
  if (node.contents && node.contents.subarray) {
   var arr = [];
   for (var i = 0; i < node.usedBytes; ++i) arr.push(node.contents[i]);
   return arr;
  }
  return node.contents;
 },
 getFileDataAsTypedArray: function(node) {
  if (!node.contents) return new Uint8Array();
  if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
  return new Uint8Array(node.contents);
 },
 expandFileStorage: function(node, newCapacity) {
  var prevCapacity = node.contents ? node.contents.length : 0;
  if (prevCapacity >= newCapacity) return;
  var CAPACITY_DOUBLING_MAX = 1024 * 1024;
  newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) | 0);
  if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
  var oldContents = node.contents;
  node.contents = new Uint8Array(newCapacity);
  if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
  return;
 },
 resizeFileStorage: function(node, newSize) {
  if (node.usedBytes == newSize) return;
  if (newSize == 0) {
   node.contents = null;
   node.usedBytes = 0;
   return;
  }
  if (!node.contents || node.contents.subarray) {
   var oldContents = node.contents;
   node.contents = new Uint8Array(new ArrayBuffer(newSize));
   if (oldContents) {
    node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
   }
   node.usedBytes = newSize;
   return;
  }
  if (!node.contents) node.contents = [];
  if (node.contents.length > newSize) node.contents.length = newSize; else while (node.contents.length < newSize) node.contents.push(0);
  node.usedBytes = newSize;
 },
 node_ops: {
  getattr: function(node) {
   var attr = {};
   attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
   attr.ino = node.id;
   attr.mode = node.mode;
   attr.nlink = 1;
   attr.uid = 0;
   attr.gid = 0;
   attr.rdev = node.rdev;
   if (FS.isDir(node.mode)) {
    attr.size = 4096;
   } else if (FS.isFile(node.mode)) {
    attr.size = node.usedBytes;
   } else if (FS.isLink(node.mode)) {
    attr.size = node.link.length;
   } else {
    attr.size = 0;
   }
   attr.atime = new Date(node.timestamp);
   attr.mtime = new Date(node.timestamp);
   attr.ctime = new Date(node.timestamp);
   attr.blksize = 4096;
   attr.blocks = Math.ceil(attr.size / attr.blksize);
   return attr;
  },
  setattr: function(node, attr) {
   if (attr.mode !== undefined) {
    node.mode = attr.mode;
   }
   if (attr.timestamp !== undefined) {
    node.timestamp = attr.timestamp;
   }
   if (attr.size !== undefined) {
    MEMFS.resizeFileStorage(node, attr.size);
   }
  },
  lookup: function(parent, name) {
   throw FS.genericErrors[44];
  },
  mknod: function(parent, name, mode, dev) {
   return MEMFS.createNode(parent, name, mode, dev);
  },
  rename: function(old_node, new_dir, new_name) {
   if (FS.isDir(old_node.mode)) {
    var new_node;
    try {
     new_node = FS.lookupNode(new_dir, new_name);
    } catch (e) {}
    if (new_node) {
     for (var i in new_node.contents) {
      throw new FS.ErrnoError(55);
     }
    }
   }
   delete old_node.parent.contents[old_node.name];
   old_node.name = new_name;
   new_dir.contents[new_name] = old_node;
   old_node.parent = new_dir;
  },
  unlink: function(parent, name) {
   delete parent.contents[name];
  },
  rmdir: function(parent, name) {
   var node = FS.lookupNode(parent, name);
   for (var i in node.contents) {
    throw new FS.ErrnoError(55);
   }
   delete parent.contents[name];
  },
  readdir: function(node) {
   var entries = [ ".", ".." ];
   for (var key in node.contents) {
    if (!node.contents.hasOwnProperty(key)) {
     continue;
    }
    entries.push(key);
   }
   return entries;
  },
  symlink: function(parent, newname, oldpath) {
   var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
   node.link = oldpath;
   return node;
  },
  readlink: function(node) {
   if (!FS.isLink(node.mode)) {
    throw new FS.ErrnoError(28);
   }
   return node.link;
  }
 },
 stream_ops: {
  read: function(stream, buffer, offset, length, position) {
   var contents = stream.node.contents;
   if (position >= stream.node.usedBytes) return 0;
   var size = Math.min(stream.node.usedBytes - position, length);
   assert(size >= 0);
   if (size > 8 && contents.subarray) {
    buffer.set(contents.subarray(position, position + size), offset);
   } else {
    for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
   }
   return size;
  },
  write: function(stream, buffer, offset, length, position, canOwn) {
   assert(!(buffer instanceof ArrayBuffer));
   if (!length) return 0;
   var node = stream.node;
   node.timestamp = Date.now();
   if (buffer.subarray && (!node.contents || node.contents.subarray)) {
    if (canOwn) {
     assert(position === 0, "canOwn must imply no weird position inside the file");
     node.contents = buffer.subarray(offset, offset + length);
     node.usedBytes = length;
     return length;
    } else if (node.usedBytes === 0 && position === 0) {
     node.contents = new Uint8Array(buffer.subarray(offset, offset + length));
     node.usedBytes = length;
     return length;
    } else if (position + length <= node.usedBytes) {
     node.contents.set(buffer.subarray(offset, offset + length), position);
     return length;
    }
   }
   MEMFS.expandFileStorage(node, position + length);
   if (node.contents.subarray && buffer.subarray) node.contents.set(buffer.subarray(offset, offset + length), position); else {
    for (var i = 0; i < length; i++) {
     node.contents[position + i] = buffer[offset + i];
    }
   }
   node.usedBytes = Math.max(node.usedBytes, position + length);
   return length;
  },
  llseek: function(stream, offset, whence) {
   var position = offset;
   if (whence === 1) {
    position += stream.position;
   } else if (whence === 2) {
    if (FS.isFile(stream.node.mode)) {
     position += stream.node.usedBytes;
    }
   }
   if (position < 0) {
    throw new FS.ErrnoError(28);
   }
   return position;
  },
  allocate: function(stream, offset, length) {
   MEMFS.expandFileStorage(stream.node, offset + length);
   stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
  },
  mmap: function(stream, buffer, offset, length, position, prot, flags) {
   assert(!(buffer instanceof ArrayBuffer));
   if (!FS.isFile(stream.node.mode)) {
    throw new FS.ErrnoError(43);
   }
   var ptr;
   var allocated;
   var contents = stream.node.contents;
   if (!(flags & 2) && contents.buffer === buffer.buffer) {
    allocated = false;
    ptr = contents.byteOffset;
   } else {
    if (position > 0 || position + length < stream.node.usedBytes) {
     if (contents.subarray) {
      contents = contents.subarray(position, position + length);
     } else {
      contents = Array.prototype.slice.call(contents, position, position + length);
     }
    }
    allocated = true;
    var fromHeap = buffer.buffer == HEAP8.buffer;
    ptr = _malloc(length);
    if (!ptr) {
     throw new FS.ErrnoError(48);
    }
    (fromHeap ? HEAP8 : buffer).set(contents, ptr);
   }
   return {
    ptr: ptr,
    allocated: allocated
   };
  },
  msync: function(stream, buffer, offset, length, mmapFlags) {
   if (!FS.isFile(stream.node.mode)) {
    throw new FS.ErrnoError(43);
   }
   if (mmapFlags & 2) {
    return 0;
   }
   var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
   return 0;
  }
 }
};

Module["MEMFS"] = MEMFS;

var ERRNO_CODES = {
 EPERM: 63,
 ENOENT: 44,
 ESRCH: 71,
 EINTR: 27,
 EIO: 29,
 ENXIO: 60,
 E2BIG: 1,
 ENOEXEC: 45,
 EBADF: 8,
 ECHILD: 12,
 EAGAIN: 6,
 EWOULDBLOCK: 6,
 ENOMEM: 48,
 EACCES: 2,
 EFAULT: 21,
 ENOTBLK: 105,
 EBUSY: 10,
 EEXIST: 20,
 EXDEV: 75,
 ENODEV: 43,
 ENOTDIR: 54,
 EISDIR: 31,
 EINVAL: 28,
 ENFILE: 41,
 EMFILE: 33,
 ENOTTY: 59,
 ETXTBSY: 74,
 EFBIG: 22,
 ENOSPC: 51,
 ESPIPE: 70,
 EROFS: 69,
 EMLINK: 34,
 EPIPE: 64,
 EDOM: 18,
 ERANGE: 68,
 ENOMSG: 49,
 EIDRM: 24,
 ECHRNG: 106,
 EL2NSYNC: 156,
 EL3HLT: 107,
 EL3RST: 108,
 ELNRNG: 109,
 EUNATCH: 110,
 ENOCSI: 111,
 EL2HLT: 112,
 EDEADLK: 16,
 ENOLCK: 46,
 EBADE: 113,
 EBADR: 114,
 EXFULL: 115,
 ENOANO: 104,
 EBADRQC: 103,
 EBADSLT: 102,
 EDEADLOCK: 16,
 EBFONT: 101,
 ENOSTR: 100,
 ENODATA: 116,
 ETIME: 117,
 ENOSR: 118,
 ENONET: 119,
 ENOPKG: 120,
 EREMOTE: 121,
 ENOLINK: 47,
 EADV: 122,
 ESRMNT: 123,
 ECOMM: 124,
 EPROTO: 65,
 EMULTIHOP: 36,
 EDOTDOT: 125,
 EBADMSG: 9,
 ENOTUNIQ: 126,
 EBADFD: 127,
 EREMCHG: 128,
 ELIBACC: 129,
 ELIBBAD: 130,
 ELIBSCN: 131,
 ELIBMAX: 132,
 ELIBEXEC: 133,
 ENOSYS: 52,
 ENOTEMPTY: 55,
 ENAMETOOLONG: 37,
 ELOOP: 32,
 EOPNOTSUPP: 138,
 EPFNOSUPPORT: 139,
 ECONNRESET: 15,
 ENOBUFS: 42,
 EAFNOSUPPORT: 5,
 EPROTOTYPE: 67,
 ENOTSOCK: 57,
 ENOPROTOOPT: 50,
 ESHUTDOWN: 140,
 ECONNREFUSED: 14,
 EADDRINUSE: 3,
 ECONNABORTED: 13,
 ENETUNREACH: 40,
 ENETDOWN: 38,
 ETIMEDOUT: 73,
 EHOSTDOWN: 142,
 EHOSTUNREACH: 23,
 EINPROGRESS: 26,
 EALREADY: 7,
 EDESTADDRREQ: 17,
 EMSGSIZE: 35,
 EPROTONOSUPPORT: 66,
 ESOCKTNOSUPPORT: 137,
 EADDRNOTAVAIL: 4,
 ENETRESET: 39,
 EISCONN: 30,
 ENOTCONN: 53,
 ETOOMANYREFS: 141,
 EUSERS: 136,
 EDQUOT: 19,
 ESTALE: 72,
 ENOTSUP: 138,
 ENOMEDIUM: 148,
 EILSEQ: 25,
 EOVERFLOW: 61,
 ECANCELED: 11,
 ENOTRECOVERABLE: 56,
 EOWNERDEAD: 62,
 ESTRPIPE: 135
};

Module["ERRNO_CODES"] = ERRNO_CODES;

var NODEFS = {
 isWindows: false,
 staticInit: function() {
  NODEFS.isWindows = !!process.platform.match(/^win/);
  var flags = process["binding"]("constants");
  if (flags["fs"]) {
   flags = flags["fs"];
  }
  NODEFS.flagsForNodeMap = {
   1024: flags["O_APPEND"],
   64: flags["O_CREAT"],
   128: flags["O_EXCL"],
   0: flags["O_RDONLY"],
   2: flags["O_RDWR"],
   4096: flags["O_SYNC"],
   512: flags["O_TRUNC"],
   1: flags["O_WRONLY"]
  };
 },
 bufferFrom: function(arrayBuffer) {
  return Buffer["alloc"] ? Buffer.from(arrayBuffer) : new Buffer(arrayBuffer);
 },
 convertNodeCode: function(e) {
  var code = e.code;
  assert(code in ERRNO_CODES);
  return ERRNO_CODES[code];
 },
 mount: function(mount) {
  assert(ENVIRONMENT_HAS_NODE);
  return NODEFS.createNode(null, "/", NODEFS.getMode(mount.opts.root), 0);
 },
 createNode: function(parent, name, mode, dev) {
  if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
   throw new FS.ErrnoError(28);
  }
  var node = FS.createNode(parent, name, mode);
  node.node_ops = NODEFS.node_ops;
  node.stream_ops = NODEFS.stream_ops;
  return node;
 },
 getMode: function(path) {
  var stat;
  try {
   stat = fs.lstatSync(path);
   if (NODEFS.isWindows) {
    stat.mode = stat.mode | (stat.mode & 292) >> 2;
   }
  } catch (e) {
   if (!e.code) throw e;
   throw new FS.ErrnoError(NODEFS.convertNodeCode(e));
  }
  return stat.mode;
 },
 realPath: function(node) {
  var parts = [];
  while (node.parent !== node) {
   parts.push(node.name);
   node = node.parent;
  }
  parts.push(node.mount.opts.root);
  parts.reverse();
  return PATH.join.apply(null, parts);
 },
 flagsForNode: function(flags) {
  flags &= ~2097152;
  flags &= ~2048;
  flags &= ~32768;
  flags &= ~524288;
  var newFlags = 0;
  for (var k in NODEFS.flagsForNodeMap) {
   if (flags & k) {
    newFlags |= NODEFS.flagsForNodeMap[k];
    flags ^= k;
   }
  }
  if (!flags) {
   return newFlags;
  } else {
   throw new FS.ErrnoError(28);
  }
 },
 node_ops: {
  getattr: function(node) {
   var path = NODEFS.realPath(node);
   var stat;
   try {
    stat = fs.lstatSync(path);
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(NODEFS.convertNodeCode(e));
   }
   if (NODEFS.isWindows && !stat.blksize) {
    stat.blksize = 4096;
   }
   if (NODEFS.isWindows && !stat.blocks) {
    stat.blocks = (stat.size + stat.blksize - 1) / stat.blksize | 0;
   }
   return {
    dev: stat.dev,
    ino: stat.ino,
    mode: stat.mode,
    nlink: stat.nlink,
    uid: stat.uid,
    gid: stat.gid,
    rdev: stat.rdev,
    size: stat.size,
    atime: stat.atime,
    mtime: stat.mtime,
    ctime: stat.ctime,
    blksize: stat.blksize,
    blocks: stat.blocks
   };
  },
  setattr: function(node, attr) {
   var path = NODEFS.realPath(node);
   try {
    if (attr.mode !== undefined) {
     fs.chmodSync(path, attr.mode);
     node.mode = attr.mode;
    }
    if (attr.timestamp !== undefined) {
     var date = new Date(attr.timestamp);
     fs.utimesSync(path, date, date);
    }
    if (attr.size !== undefined) {
     fs.truncateSync(path, attr.size);
    }
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(NODEFS.convertNodeCode(e));
   }
  },
  lookup: function(parent, name) {
   var path = PATH.join2(NODEFS.realPath(parent), name);
   var mode = NODEFS.getMode(path);
   return NODEFS.createNode(parent, name, mode);
  },
  mknod: function(parent, name, mode, dev) {
   var node = NODEFS.createNode(parent, name, mode, dev);
   var path = NODEFS.realPath(node);
   try {
    if (FS.isDir(node.mode)) {
     fs.mkdirSync(path, node.mode);
    } else {
     fs.writeFileSync(path, "", {
      mode: node.mode
     });
    }
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(NODEFS.convertNodeCode(e));
   }
   return node;
  },
  rename: function(oldNode, newDir, newName) {
   var oldPath = NODEFS.realPath(oldNode);
   var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
   try {
    fs.renameSync(oldPath, newPath);
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(NODEFS.convertNodeCode(e));
   }
  },
  unlink: function(parent, name) {
   var path = PATH.join2(NODEFS.realPath(parent), name);
   try {
    fs.unlinkSync(path);
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(NODEFS.convertNodeCode(e));
   }
  },
  rmdir: function(parent, name) {
   var path = PATH.join2(NODEFS.realPath(parent), name);
   try {
    fs.rmdirSync(path);
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(NODEFS.convertNodeCode(e));
   }
  },
  readdir: function(node) {
   var path = NODEFS.realPath(node);
   try {
    return fs.readdirSync(path);
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(NODEFS.convertNodeCode(e));
   }
  },
  symlink: function(parent, newName, oldPath) {
   var newPath = PATH.join2(NODEFS.realPath(parent), newName);
   try {
    fs.symlinkSync(oldPath, newPath);
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(NODEFS.convertNodeCode(e));
   }
  },
  readlink: function(node) {
   var path = NODEFS.realPath(node);
   try {
    path = fs.readlinkSync(path);
    path = NODEJS_PATH.relative(NODEJS_PATH.resolve(node.mount.opts.root), path);
    return path;
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(NODEFS.convertNodeCode(e));
   }
  }
 },
 stream_ops: {
  open: function(stream) {
   var path = NODEFS.realPath(stream.node);
   try {
    if (FS.isFile(stream.node.mode)) {
     stream.nfd = fs.openSync(path, NODEFS.flagsForNode(stream.flags));
    }
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(NODEFS.convertNodeCode(e));
   }
  },
  close: function(stream) {
   try {
    if (FS.isFile(stream.node.mode) && stream.nfd) {
     fs.closeSync(stream.nfd);
    }
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(NODEFS.convertNodeCode(e));
   }
  },
  read: function(stream, buffer, offset, length, position) {
   if (length === 0) return 0;
   try {
    return fs.readSync(stream.nfd, NODEFS.bufferFrom(buffer.buffer), offset, length, position);
   } catch (e) {
    throw new FS.ErrnoError(NODEFS.convertNodeCode(e));
   }
  },
  write: function(stream, buffer, offset, length, position) {
   try {
    return fs.writeSync(stream.nfd, NODEFS.bufferFrom(buffer.buffer), offset, length, position);
   } catch (e) {
    throw new FS.ErrnoError(NODEFS.convertNodeCode(e));
   }
  },
  llseek: function(stream, offset, whence) {
   var position = offset;
   if (whence === 1) {
    position += stream.position;
   } else if (whence === 2) {
    if (FS.isFile(stream.node.mode)) {
     try {
      var stat = fs.fstatSync(stream.nfd);
      position += stat.size;
     } catch (e) {
      throw new FS.ErrnoError(NODEFS.convertNodeCode(e));
     }
    }
   }
   if (position < 0) {
    throw new FS.ErrnoError(28);
   }
   return position;
  }
 }
};

Module["NODEFS"] = NODEFS;

var ERRNO_MESSAGES = {
 0: "Success",
 1: "Arg list too long",
 2: "Permission denied",
 3: "Address already in use",
 4: "Address not available",
 5: "Address family not supported by protocol family",
 6: "No more processes",
 7: "Socket already connected",
 8: "Bad file number",
 9: "Trying to read unreadable message",
 10: "Mount device busy",
 11: "Operation canceled",
 12: "No children",
 13: "Connection aborted",
 14: "Connection refused",
 15: "Connection reset by peer",
 16: "File locking deadlock error",
 17: "Destination address required",
 18: "Math arg out of domain of func",
 19: "Quota exceeded",
 20: "File exists",
 21: "Bad address",
 22: "File too large",
 23: "Host is unreachable",
 24: "Identifier removed",
 25: "Illegal byte sequence",
 26: "Connection already in progress",
 27: "Interrupted system call",
 28: "Invalid argument",
 29: "I/O error",
 30: "Socket is already connected",
 31: "Is a directory",
 32: "Too many symbolic links",
 33: "Too many open files",
 34: "Too many links",
 35: "Message too long",
 36: "Multihop attempted",
 37: "File or path name too long",
 38: "Network interface is not configured",
 39: "Connection reset by network",
 40: "Network is unreachable",
 41: "Too many open files in system",
 42: "No buffer space available",
 43: "No such device",
 44: "No such file or directory",
 45: "Exec format error",
 46: "No record locks available",
 47: "The link has been severed",
 48: "Not enough core",
 49: "No message of desired type",
 50: "Protocol not available",
 51: "No space left on device",
 52: "Function not implemented",
 53: "Socket is not connected",
 54: "Not a directory",
 55: "Directory not empty",
 56: "State not recoverable",
 57: "Socket operation on non-socket",
 59: "Not a typewriter",
 60: "No such device or address",
 61: "Value too large for defined data type",
 62: "Previous owner died",
 63: "Not super-user",
 64: "Broken pipe",
 65: "Protocol error",
 66: "Unknown protocol",
 67: "Protocol wrong type for socket",
 68: "Math result not representable",
 69: "Read only file system",
 70: "Illegal seek",
 71: "No such process",
 72: "Stale file handle",
 73: "Connection timed out",
 74: "Text file busy",
 75: "Cross-device link",
 100: "Device not a stream",
 101: "Bad font file fmt",
 102: "Invalid slot",
 103: "Invalid request code",
 104: "No anode",
 105: "Block device required",
 106: "Channel number out of range",
 107: "Level 3 halted",
 108: "Level 3 reset",
 109: "Link number out of range",
 110: "Protocol driver not attached",
 111: "No CSI structure available",
 112: "Level 2 halted",
 113: "Invalid exchange",
 114: "Invalid request descriptor",
 115: "Exchange full",
 116: "No data (for no delay io)",
 117: "Timer expired",
 118: "Out of streams resources",
 119: "Machine is not on the network",
 120: "Package not installed",
 121: "The object is remote",
 122: "Advertise error",
 123: "Srmount error",
 124: "Communication error on send",
 125: "Cross mount point (not really error)",
 126: "Given log. name not unique",
 127: "f.d. invalid for this operation",
 128: "Remote address changed",
 129: "Can   access a needed shared lib",
 130: "Accessing a corrupted shared lib",
 131: ".lib section in a.out corrupted",
 132: "Attempting to link in too many libs",
 133: "Attempting to exec a shared library",
 135: "Streams pipe error",
 136: "Too many users",
 137: "Socket type not supported",
 138: "Not supported",
 139: "Protocol family not supported",
 140: "Can't send after socket shutdown",
 141: "Too many references",
 142: "Host is down",
 148: "No medium (in tape drive)",
 156: "Level 2 not synchronized"
};

Module["ERRNO_MESSAGES"] = ERRNO_MESSAGES;

var FS = {
 root: null,
 mounts: [],
 devices: {},
 streams: [],
 nextInode: 1,
 nameTable: null,
 currentPath: "/",
 initialized: false,
 ignorePermissions: true,
 trackingDelegate: {},
 tracking: {
  openFlags: {
   READ: 1,
   WRITE: 2
  }
 },
 ErrnoError: null,
 genericErrors: {},
 filesystems: null,
 syncFSRequests: 0,
 handleFSError: function(e) {
  if (!(e instanceof FS.ErrnoError)) throw e + " : " + stackTrace();
  return ___setErrNo(e.errno);
 },
 lookupPath: function(path, opts) {
  path = PATH_FS.resolve(FS.cwd(), path);
  opts = opts || {};
  if (!path) return {
   path: "",
   node: null
  };
  var defaults = {
   follow_mount: true,
   recurse_count: 0
  };
  for (var key in defaults) {
   if (opts[key] === undefined) {
    opts[key] = defaults[key];
   }
  }
  if (opts.recurse_count > 8) {
   throw new FS.ErrnoError(32);
  }
  var parts = PATH.normalizeArray(path.split("/").filter(function(p) {
   return !!p;
  }), false);
  var current = FS.root;
  var current_path = "/";
  for (var i = 0; i < parts.length; i++) {
   var islast = i === parts.length - 1;
   if (islast && opts.parent) {
    break;
   }
   current = FS.lookupNode(current, parts[i]);
   current_path = PATH.join2(current_path, parts[i]);
   if (FS.isMountpoint(current)) {
    if (!islast || islast && opts.follow_mount) {
     current = current.mounted.root;
    }
   }
   if (!islast || opts.follow) {
    var count = 0;
    while (FS.isLink(current.mode)) {
     var link = FS.readlink(current_path);
     current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
     var lookup = FS.lookupPath(current_path, {
      recurse_count: opts.recurse_count
     });
     current = lookup.node;
     if (count++ > 40) {
      throw new FS.ErrnoError(32);
     }
    }
   }
  }
  return {
   path: current_path,
   node: current
  };
 },
 getPath: function(node) {
  var path;
  while (true) {
   if (FS.isRoot(node)) {
    var mount = node.mount.mountpoint;
    if (!path) return mount;
    return mount[mount.length - 1] !== "/" ? mount + "/" + path : mount + path;
   }
   path = path ? node.name + "/" + path : node.name;
   node = node.parent;
  }
 },
 hashName: function(parentid, name) {
  var hash = 0;
  for (var i = 0; i < name.length; i++) {
   hash = (hash << 5) - hash + name.charCodeAt(i) | 0;
  }
  return (parentid + hash >>> 0) % FS.nameTable.length;
 },
 hashAddNode: function(node) {
  var hash = FS.hashName(node.parent.id, node.name);
  node.name_next = FS.nameTable[hash];
  FS.nameTable[hash] = node;
 },
 hashRemoveNode: function(node) {
  var hash = FS.hashName(node.parent.id, node.name);
  if (FS.nameTable[hash] === node) {
   FS.nameTable[hash] = node.name_next;
  } else {
   var current = FS.nameTable[hash];
   while (current) {
    if (current.name_next === node) {
     current.name_next = node.name_next;
     break;
    }
    current = current.name_next;
   }
  }
 },
 lookupNode: function(parent, name) {
  var errCode = FS.mayLookup(parent);
  if (errCode) {
   throw new FS.ErrnoError(errCode, parent);
  }
  var hash = FS.hashName(parent.id, name);
  for (var node = FS.nameTable[hash]; node; node = node.name_next) {
   var nodeName = node.name;
   if (node.parent.id === parent.id && nodeName === name) {
    return node;
   }
  }
  return FS.lookup(parent, name);
 },
 createNode: function(parent, name, mode, rdev) {
  if (!FS.FSNode) {
   FS.FSNode = function(parent, name, mode, rdev) {
    if (!parent) {
     parent = this;
    }
    this.parent = parent;
    this.mount = parent.mount;
    this.mounted = null;
    this.id = FS.nextInode++;
    this.name = name;
    this.mode = mode;
    this.node_ops = {};
    this.stream_ops = {};
    this.rdev = rdev;
   };
   FS.FSNode.prototype = {};
   var readMode = 292 | 73;
   var writeMode = 146;
   Object.defineProperties(FS.FSNode.prototype, {
    read: {
     get: function() {
      return (this.mode & readMode) === readMode;
     },
     set: function(val) {
      val ? this.mode |= readMode : this.mode &= ~readMode;
     }
    },
    write: {
     get: function() {
      return (this.mode & writeMode) === writeMode;
     },
     set: function(val) {
      val ? this.mode |= writeMode : this.mode &= ~writeMode;
     }
    },
    isFolder: {
     get: function() {
      return FS.isDir(this.mode);
     }
    },
    isDevice: {
     get: function() {
      return FS.isChrdev(this.mode);
     }
    }
   });
  }
  var node = new FS.FSNode(parent, name, mode, rdev);
  FS.hashAddNode(node);
  return node;
 },
 destroyNode: function(node) {
  FS.hashRemoveNode(node);
 },
 isRoot: function(node) {
  return node === node.parent;
 },
 isMountpoint: function(node) {
  return !!node.mounted;
 },
 isFile: function(mode) {
  return (mode & 61440) === 32768;
 },
 isDir: function(mode) {
  return (mode & 61440) === 16384;
 },
 isLink: function(mode) {
  return (mode & 61440) === 40960;
 },
 isChrdev: function(mode) {
  return (mode & 61440) === 8192;
 },
 isBlkdev: function(mode) {
  return (mode & 61440) === 24576;
 },
 isFIFO: function(mode) {
  return (mode & 61440) === 4096;
 },
 isSocket: function(mode) {
  return (mode & 49152) === 49152;
 },
 flagModes: {
  "r": 0,
  "rs": 1052672,
  "r+": 2,
  "w": 577,
  "wx": 705,
  "xw": 705,
  "w+": 578,
  "wx+": 706,
  "xw+": 706,
  "a": 1089,
  "ax": 1217,
  "xa": 1217,
  "a+": 1090,
  "ax+": 1218,
  "xa+": 1218
 },
 modeStringToFlags: function(str) {
  var flags = FS.flagModes[str];
  if (typeof flags === "undefined") {
   throw new Error("Unknown file open mode: " + str);
  }
  return flags;
 },
 flagsToPermissionString: function(flag) {
  var perms = [ "r", "w", "rw" ][flag & 3];
  if (flag & 512) {
   perms += "w";
  }
  return perms;
 },
 nodePermissions: function(node, perms) {
  if (FS.ignorePermissions) {
   return 0;
  }
  if (perms.indexOf("r") !== -1 && !(node.mode & 292)) {
   return 2;
  } else if (perms.indexOf("w") !== -1 && !(node.mode & 146)) {
   return 2;
  } else if (perms.indexOf("x") !== -1 && !(node.mode & 73)) {
   return 2;
  }
  return 0;
 },
 mayLookup: function(dir) {
  var errCode = FS.nodePermissions(dir, "x");
  if (errCode) return errCode;
  if (!dir.node_ops.lookup) return 2;
  return 0;
 },
 mayCreate: function(dir, name) {
  try {
   var node = FS.lookupNode(dir, name);
   return 20;
  } catch (e) {}
  return FS.nodePermissions(dir, "wx");
 },
 mayDelete: function(dir, name, isdir) {
  var node;
  try {
   node = FS.lookupNode(dir, name);
  } catch (e) {
   return e.errno;
  }
  var errCode = FS.nodePermissions(dir, "wx");
  if (errCode) {
   return errCode;
  }
  if (isdir) {
   if (!FS.isDir(node.mode)) {
    return 54;
   }
   if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
    return 10;
   }
  } else {
   if (FS.isDir(node.mode)) {
    return 31;
   }
  }
  return 0;
 },
 mayOpen: function(node, flags) {
  if (!node) {
   return 44;
  }
  if (FS.isLink(node.mode)) {
   return 32;
  } else if (FS.isDir(node.mode)) {
   if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
    return 31;
   }
  }
  return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
 },
 MAX_OPEN_FDS: 4096,
 nextfd: function(fd_start, fd_end) {
  fd_start = fd_start || 0;
  fd_end = fd_end || FS.MAX_OPEN_FDS;
  for (var fd = fd_start; fd <= fd_end; fd++) {
   if (!FS.streams[fd]) {
    return fd;
   }
  }
  throw new FS.ErrnoError(33);
 },
 getStream: function(fd) {
  return FS.streams[fd];
 },
 createStream: function(stream, fd_start, fd_end) {
  if (!FS.FSStream) {
   FS.FSStream = function() {};
   FS.FSStream.prototype = {};
   Object.defineProperties(FS.FSStream.prototype, {
    object: {
     get: function() {
      return this.node;
     },
     set: function(val) {
      this.node = val;
     }
    },
    isRead: {
     get: function() {
      return (this.flags & 2097155) !== 1;
     }
    },
    isWrite: {
     get: function() {
      return (this.flags & 2097155) !== 0;
     }
    },
    isAppend: {
     get: function() {
      return this.flags & 1024;
     }
    }
   });
  }
  var newStream = new FS.FSStream();
  for (var p in stream) {
   newStream[p] = stream[p];
  }
  stream = newStream;
  var fd = FS.nextfd(fd_start, fd_end);
  stream.fd = fd;
  FS.streams[fd] = stream;
  return stream;
 },
 closeStream: function(fd) {
  FS.streams[fd] = null;
 },
 chrdev_stream_ops: {
  open: function(stream) {
   var device = FS.getDevice(stream.node.rdev);
   stream.stream_ops = device.stream_ops;
   if (stream.stream_ops.open) {
    stream.stream_ops.open(stream);
   }
  },
  llseek: function() {
   throw new FS.ErrnoError(70);
  }
 },
 major: function(dev) {
  return dev >> 8;
 },
 minor: function(dev) {
  return dev & 255;
 },
 makedev: function(ma, mi) {
  return ma << 8 | mi;
 },
 registerDevice: function(dev, ops) {
  FS.devices[dev] = {
   stream_ops: ops
  };
 },
 getDevice: function(dev) {
  return FS.devices[dev];
 },
 getMounts: function(mount) {
  var mounts = [];
  var check = [ mount ];
  while (check.length) {
   var m = check.pop();
   mounts.push(m);
   check.push.apply(check, m.mounts);
  }
  return mounts;
 },
 syncfs: function(populate, callback) {
  if (typeof populate === "function") {
   callback = populate;
   populate = false;
  }
  FS.syncFSRequests++;
  if (FS.syncFSRequests > 1) {
   err("warning: " + FS.syncFSRequests + " FS.syncfs operations in flight at once, probably just doing extra work");
  }
  var mounts = FS.getMounts(FS.root.mount);
  var completed = 0;
  function doCallback(errCode) {
   assert(FS.syncFSRequests > 0);
   FS.syncFSRequests--;
   return callback(errCode);
  }
  function done(errCode) {
   if (errCode) {
    if (!done.errored) {
     done.errored = true;
     return doCallback(errCode);
    }
    return;
   }
   if (++completed >= mounts.length) {
    doCallback(null);
   }
  }
  mounts.forEach(function(mount) {
   if (!mount.type.syncfs) {
    return done(null);
   }
   mount.type.syncfs(mount, populate, done);
  });
 },
 mount: function(type, opts, mountpoint) {
  if (typeof type === "string") {
   throw type;
  }
  var root = mountpoint === "/";
  var pseudo = !mountpoint;
  var node;
  if (root && FS.root) {
   throw new FS.ErrnoError(10);
  } else if (!root && !pseudo) {
   var lookup = FS.lookupPath(mountpoint, {
    follow_mount: false
   });
   mountpoint = lookup.path;
   node = lookup.node;
   if (FS.isMountpoint(node)) {
    throw new FS.ErrnoError(10);
   }
   if (!FS.isDir(node.mode)) {
    throw new FS.ErrnoError(54);
   }
  }
  var mount = {
   type: type,
   opts: opts,
   mountpoint: mountpoint,
   mounts: []
  };
  var mountRoot = type.mount(mount);
  mountRoot.mount = mount;
  mount.root = mountRoot;
  if (root) {
   FS.root = mountRoot;
  } else if (node) {
   node.mounted = mount;
   if (node.mount) {
    node.mount.mounts.push(mount);
   }
  }
  return mountRoot;
 },
 unmount: function(mountpoint) {
  var lookup = FS.lookupPath(mountpoint, {
   follow_mount: false
  });
  if (!FS.isMountpoint(lookup.node)) {
   throw new FS.ErrnoError(28);
  }
  var node = lookup.node;
  var mount = node.mounted;
  var mounts = FS.getMounts(mount);
  Object.keys(FS.nameTable).forEach(function(hash) {
   var current = FS.nameTable[hash];
   while (current) {
    var next = current.name_next;
    if (mounts.indexOf(current.mount) !== -1) {
     FS.destroyNode(current);
    }
    current = next;
   }
  });
  node.mounted = null;
  var idx = node.mount.mounts.indexOf(mount);
  assert(idx !== -1);
  node.mount.mounts.splice(idx, 1);
 },
 lookup: function(parent, name) {
  return parent.node_ops.lookup(parent, name);
 },
 mknod: function(path, mode, dev) {
  var lookup = FS.lookupPath(path, {
   parent: true
  });
  var parent = lookup.node;
  var name = PATH.basename(path);
  if (!name || name === "." || name === "..") {
   throw new FS.ErrnoError(28);
  }
  var errCode = FS.mayCreate(parent, name);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  if (!parent.node_ops.mknod) {
   throw new FS.ErrnoError(63);
  }
  return parent.node_ops.mknod(parent, name, mode, dev);
 },
 create: function(path, mode) {
  mode = mode !== undefined ? mode : 438;
  mode &= 4095;
  mode |= 32768;
  return FS.mknod(path, mode, 0);
 },
 mkdir: function(path, mode) {
  mode = mode !== undefined ? mode : 511;
  mode &= 511 | 512;
  mode |= 16384;
  return FS.mknod(path, mode, 0);
 },
 mkdirTree: function(path, mode) {
  var dirs = path.split("/");
  var d = "";
  for (var i = 0; i < dirs.length; ++i) {
   if (!dirs[i]) continue;
   d += "/" + dirs[i];
   try {
    FS.mkdir(d, mode);
   } catch (e) {
    if (e.errno != 20) throw e;
   }
  }
 },
 mkdev: function(path, mode, dev) {
  if (typeof dev === "undefined") {
   dev = mode;
   mode = 438;
  }
  mode |= 8192;
  return FS.mknod(path, mode, dev);
 },
 symlink: function(oldpath, newpath) {
  if (!PATH_FS.resolve(oldpath)) {
   throw new FS.ErrnoError(44);
  }
  var lookup = FS.lookupPath(newpath, {
   parent: true
  });
  var parent = lookup.node;
  if (!parent) {
   throw new FS.ErrnoError(44);
  }
  var newname = PATH.basename(newpath);
  var errCode = FS.mayCreate(parent, newname);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  if (!parent.node_ops.symlink) {
   throw new FS.ErrnoError(63);
  }
  return parent.node_ops.symlink(parent, newname, oldpath);
 },
 rename: function(old_path, new_path) {
  var old_dirname = PATH.dirname(old_path);
  var new_dirname = PATH.dirname(new_path);
  var old_name = PATH.basename(old_path);
  var new_name = PATH.basename(new_path);
  var lookup, old_dir, new_dir;
  try {
   lookup = FS.lookupPath(old_path, {
    parent: true
   });
   old_dir = lookup.node;
   lookup = FS.lookupPath(new_path, {
    parent: true
   });
   new_dir = lookup.node;
  } catch (e) {
   throw new FS.ErrnoError(10);
  }
  if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
  if (old_dir.mount !== new_dir.mount) {
   throw new FS.ErrnoError(75);
  }
  var old_node = FS.lookupNode(old_dir, old_name);
  var relative = PATH_FS.relative(old_path, new_dirname);
  if (relative.charAt(0) !== ".") {
   throw new FS.ErrnoError(28);
  }
  relative = PATH_FS.relative(new_path, old_dirname);
  if (relative.charAt(0) !== ".") {
   throw new FS.ErrnoError(55);
  }
  var new_node;
  try {
   new_node = FS.lookupNode(new_dir, new_name);
  } catch (e) {}
  if (old_node === new_node) {
   return;
  }
  var isdir = FS.isDir(old_node.mode);
  var errCode = FS.mayDelete(old_dir, old_name, isdir);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  if (!old_dir.node_ops.rename) {
   throw new FS.ErrnoError(63);
  }
  if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
   throw new FS.ErrnoError(10);
  }
  if (new_dir !== old_dir) {
   errCode = FS.nodePermissions(old_dir, "w");
   if (errCode) {
    throw new FS.ErrnoError(errCode);
   }
  }
  try {
   if (FS.trackingDelegate["willMovePath"]) {
    FS.trackingDelegate["willMovePath"](old_path, new_path);
   }
  } catch (e) {
   err("FS.trackingDelegate['willMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message);
  }
  FS.hashRemoveNode(old_node);
  try {
   old_dir.node_ops.rename(old_node, new_dir, new_name);
  } catch (e) {
   throw e;
  } finally {
   FS.hashAddNode(old_node);
  }
  try {
   if (FS.trackingDelegate["onMovePath"]) FS.trackingDelegate["onMovePath"](old_path, new_path);
  } catch (e) {
   err("FS.trackingDelegate['onMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message);
  }
 },
 rmdir: function(path) {
  var lookup = FS.lookupPath(path, {
   parent: true
  });
  var parent = lookup.node;
  var name = PATH.basename(path);
  var node = FS.lookupNode(parent, name);
  var errCode = FS.mayDelete(parent, name, true);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  if (!parent.node_ops.rmdir) {
   throw new FS.ErrnoError(63);
  }
  if (FS.isMountpoint(node)) {
   throw new FS.ErrnoError(10);
  }
  try {
   if (FS.trackingDelegate["willDeletePath"]) {
    FS.trackingDelegate["willDeletePath"](path);
   }
  } catch (e) {
   err("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message);
  }
  parent.node_ops.rmdir(parent, name);
  FS.destroyNode(node);
  try {
   if (FS.trackingDelegate["onDeletePath"]) FS.trackingDelegate["onDeletePath"](path);
  } catch (e) {
   err("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message);
  }
 },
 readdir: function(path) {
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  var node = lookup.node;
  if (!node.node_ops.readdir) {
   throw new FS.ErrnoError(54);
  }
  return node.node_ops.readdir(node);
 },
 unlink: function(path) {
  var lookup = FS.lookupPath(path, {
   parent: true
  });
  var parent = lookup.node;
  var name = PATH.basename(path);
  var node = FS.lookupNode(parent, name);
  var errCode = FS.mayDelete(parent, name, false);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  if (!parent.node_ops.unlink) {
   throw new FS.ErrnoError(63);
  }
  if (FS.isMountpoint(node)) {
   throw new FS.ErrnoError(10);
  }
  try {
   if (FS.trackingDelegate["willDeletePath"]) {
    FS.trackingDelegate["willDeletePath"](path);
   }
  } catch (e) {
   err("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message);
  }
  parent.node_ops.unlink(parent, name);
  FS.destroyNode(node);
  try {
   if (FS.trackingDelegate["onDeletePath"]) FS.trackingDelegate["onDeletePath"](path);
  } catch (e) {
   err("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message);
  }
 },
 readlink: function(path) {
  var lookup = FS.lookupPath(path);
  var link = lookup.node;
  if (!link) {
   throw new FS.ErrnoError(44);
  }
  if (!link.node_ops.readlink) {
   throw new FS.ErrnoError(28);
  }
  return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
 },
 stat: function(path, dontFollow) {
  var lookup = FS.lookupPath(path, {
   follow: !dontFollow
  });
  var node = lookup.node;
  if (!node) {
   throw new FS.ErrnoError(44);
  }
  if (!node.node_ops.getattr) {
   throw new FS.ErrnoError(63);
  }
  return node.node_ops.getattr(node);
 },
 lstat: function(path) {
  return FS.stat(path, true);
 },
 chmod: function(path, mode, dontFollow) {
  var node;
  if (typeof path === "string") {
   var lookup = FS.lookupPath(path, {
    follow: !dontFollow
   });
   node = lookup.node;
  } else {
   node = path;
  }
  if (!node.node_ops.setattr) {
   throw new FS.ErrnoError(63);
  }
  node.node_ops.setattr(node, {
   mode: mode & 4095 | node.mode & ~4095,
   timestamp: Date.now()
  });
 },
 lchmod: function(path, mode) {
  FS.chmod(path, mode, true);
 },
 fchmod: function(fd, mode) {
  var stream = FS.getStream(fd);
  if (!stream) {
   throw new FS.ErrnoError(8);
  }
  FS.chmod(stream.node, mode);
 },
 chown: function(path, uid, gid, dontFollow) {
  var node;
  if (typeof path === "string") {
   var lookup = FS.lookupPath(path, {
    follow: !dontFollow
   });
   node = lookup.node;
  } else {
   node = path;
  }
  if (!node.node_ops.setattr) {
   throw new FS.ErrnoError(63);
  }
  node.node_ops.setattr(node, {
   timestamp: Date.now()
  });
 },
 lchown: function(path, uid, gid) {
  FS.chown(path, uid, gid, true);
 },
 fchown: function(fd, uid, gid) {
  var stream = FS.getStream(fd);
  if (!stream) {
   throw new FS.ErrnoError(8);
  }
  FS.chown(stream.node, uid, gid);
 },
 truncate: function(path, len) {
  if (len < 0) {
   throw new FS.ErrnoError(28);
  }
  var node;
  if (typeof path === "string") {
   var lookup = FS.lookupPath(path, {
    follow: true
   });
   node = lookup.node;
  } else {
   node = path;
  }
  if (!node.node_ops.setattr) {
   throw new FS.ErrnoError(63);
  }
  if (FS.isDir(node.mode)) {
   throw new FS.ErrnoError(31);
  }
  if (!FS.isFile(node.mode)) {
   throw new FS.ErrnoError(28);
  }
  var errCode = FS.nodePermissions(node, "w");
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  node.node_ops.setattr(node, {
   size: len,
   timestamp: Date.now()
  });
 },
 ftruncate: function(fd, len) {
  var stream = FS.getStream(fd);
  if (!stream) {
   throw new FS.ErrnoError(8);
  }
  if ((stream.flags & 2097155) === 0) {
   throw new FS.ErrnoError(28);
  }
  FS.truncate(stream.node, len);
 },
 utime: function(path, atime, mtime) {
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  var node = lookup.node;
  node.node_ops.setattr(node, {
   timestamp: Math.max(atime, mtime)
  });
 },
 open: function(path, flags, mode, fd_start, fd_end) {
  if (path === "") {
   throw new FS.ErrnoError(44);
  }
  flags = typeof flags === "string" ? FS.modeStringToFlags(flags) : flags;
  mode = typeof mode === "undefined" ? 438 : mode;
  if (flags & 64) {
   mode = mode & 4095 | 32768;
  } else {
   mode = 0;
  }
  var node;
  if (typeof path === "object") {
   node = path;
  } else {
   path = PATH.normalize(path);
   try {
    var lookup = FS.lookupPath(path, {
     follow: !(flags & 131072)
    });
    node = lookup.node;
   } catch (e) {}
  }
  var created = false;
  if (flags & 64) {
   if (node) {
    if (flags & 128) {
     throw new FS.ErrnoError(20);
    }
   } else {
    node = FS.mknod(path, mode, 0);
    created = true;
   }
  }
  if (!node) {
   throw new FS.ErrnoError(44);
  }
  if (FS.isChrdev(node.mode)) {
   flags &= ~512;
  }
  if (flags & 65536 && !FS.isDir(node.mode)) {
   throw new FS.ErrnoError(54);
  }
  if (!created) {
   var errCode = FS.mayOpen(node, flags);
   if (errCode) {
    throw new FS.ErrnoError(errCode);
   }
  }
  if (flags & 512) {
   FS.truncate(node, 0);
  }
  flags &= ~(128 | 512);
  var stream = FS.createStream({
   node: node,
   path: FS.getPath(node),
   flags: flags,
   seekable: true,
   position: 0,
   stream_ops: node.stream_ops,
   ungotten: [],
   error: false
  }, fd_start, fd_end);
  if (stream.stream_ops.open) {
   stream.stream_ops.open(stream);
  }
  if (Module["logReadFiles"] && !(flags & 1)) {
   if (!FS.readFiles) FS.readFiles = {};
   if (!(path in FS.readFiles)) {
    FS.readFiles[path] = 1;
    err("FS.trackingDelegate error on read file: " + path);
   }
  }
  try {
   if (FS.trackingDelegate["onOpenFile"]) {
    var trackingFlags = 0;
    if ((flags & 2097155) !== 1) {
     trackingFlags |= FS.tracking.openFlags.READ;
    }
    if ((flags & 2097155) !== 0) {
     trackingFlags |= FS.tracking.openFlags.WRITE;
    }
    FS.trackingDelegate["onOpenFile"](path, trackingFlags);
   }
  } catch (e) {
   err("FS.trackingDelegate['onOpenFile']('" + path + "', flags) threw an exception: " + e.message);
  }
  return stream;
 },
 close: function(stream) {
  if (FS.isClosed(stream)) {
   throw new FS.ErrnoError(8);
  }
  if (stream.getdents) stream.getdents = null;
  try {
   if (stream.stream_ops.close) {
    stream.stream_ops.close(stream);
   }
  } catch (e) {
   throw e;
  } finally {
   FS.closeStream(stream.fd);
  }
  stream.fd = null;
 },
 isClosed: function(stream) {
  return stream.fd === null;
 },
 llseek: function(stream, offset, whence) {
  if (FS.isClosed(stream)) {
   throw new FS.ErrnoError(8);
  }
  if (!stream.seekable || !stream.stream_ops.llseek) {
   throw new FS.ErrnoError(70);
  }
  if (whence != 0 && whence != 1 && whence != 2) {
   throw new FS.ErrnoError(28);
  }
  stream.position = stream.stream_ops.llseek(stream, offset, whence);
  stream.ungotten = [];
  return stream.position;
 },
 read: function(stream, buffer, offset, length, position) {
  if (length < 0 || position < 0) {
   throw new FS.ErrnoError(28);
  }
  if (FS.isClosed(stream)) {
   throw new FS.ErrnoError(8);
  }
  if ((stream.flags & 2097155) === 1) {
   throw new FS.ErrnoError(8);
  }
  if (FS.isDir(stream.node.mode)) {
   throw new FS.ErrnoError(31);
  }
  if (!stream.stream_ops.read) {
   throw new FS.ErrnoError(28);
  }
  var seeking = typeof position !== "undefined";
  if (!seeking) {
   position = stream.position;
  } else if (!stream.seekable) {
   throw new FS.ErrnoError(70);
  }
  var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
  if (!seeking) stream.position += bytesRead;
  return bytesRead;
 },
 write: function(stream, buffer, offset, length, position, canOwn) {
  if (length < 0 || position < 0) {
   throw new FS.ErrnoError(28);
  }
  if (FS.isClosed(stream)) {
   throw new FS.ErrnoError(8);
  }
  if ((stream.flags & 2097155) === 0) {
   throw new FS.ErrnoError(8);
  }
  if (FS.isDir(stream.node.mode)) {
   throw new FS.ErrnoError(31);
  }
  if (!stream.stream_ops.write) {
   throw new FS.ErrnoError(28);
  }
  if (stream.flags & 1024) {
   FS.llseek(stream, 0, 2);
  }
  var seeking = typeof position !== "undefined";
  if (!seeking) {
   position = stream.position;
  } else if (!stream.seekable) {
   throw new FS.ErrnoError(70);
  }
  var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
  if (!seeking) stream.position += bytesWritten;
  try {
   if (stream.path && FS.trackingDelegate["onWriteToFile"]) FS.trackingDelegate["onWriteToFile"](stream.path);
  } catch (e) {
   err("FS.trackingDelegate['onWriteToFile']('" + stream.path + "') threw an exception: " + e.message);
  }
  return bytesWritten;
 },
 allocate: function(stream, offset, length) {
  if (FS.isClosed(stream)) {
   throw new FS.ErrnoError(8);
  }
  if (offset < 0 || length <= 0) {
   throw new FS.ErrnoError(28);
  }
  if ((stream.flags & 2097155) === 0) {
   throw new FS.ErrnoError(8);
  }
  if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
   throw new FS.ErrnoError(43);
  }
  if (!stream.stream_ops.allocate) {
   throw new FS.ErrnoError(138);
  }
  stream.stream_ops.allocate(stream, offset, length);
 },
 mmap: function(stream, buffer, offset, length, position, prot, flags) {
  if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
   throw new FS.ErrnoError(2);
  }
  if ((stream.flags & 2097155) === 1) {
   throw new FS.ErrnoError(2);
  }
  if (!stream.stream_ops.mmap) {
   throw new FS.ErrnoError(43);
  }
  return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
 },
 msync: function(stream, buffer, offset, length, mmapFlags) {
  if (!stream || !stream.stream_ops.msync) {
   return 0;
  }
  return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
 },
 munmap: function(stream) {
  return 0;
 },
 ioctl: function(stream, cmd, arg) {
  if (!stream.stream_ops.ioctl) {
   throw new FS.ErrnoError(59);
  }
  return stream.stream_ops.ioctl(stream, cmd, arg);
 },
 readFile: function(path, opts) {
  opts = opts || {};
  opts.flags = opts.flags || "r";
  opts.encoding = opts.encoding || "binary";
  if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
   throw new Error('Invalid encoding type "' + opts.encoding + '"');
  }
  var ret;
  var stream = FS.open(path, opts.flags);
  var stat = FS.stat(path);
  var length = stat.size;
  var buf = new Uint8Array(length);
  FS.read(stream, buf, 0, length, 0);
  if (opts.encoding === "utf8") {
   ret = UTF8ArrayToString(buf, 0);
  } else if (opts.encoding === "binary") {
   ret = buf;
  }
  FS.close(stream);
  return ret;
 },
 writeFile: function(path, data, opts) {
  opts = opts || {};
  opts.flags = opts.flags || "w";
  var stream = FS.open(path, opts.flags, opts.mode);
  if (typeof data === "string") {
   var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
   var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
   FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
  } else if (ArrayBuffer.isView(data)) {
   FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
  } else {
   throw new Error("Unsupported data type");
  }
  FS.close(stream);
 },
 cwd: function() {
  return FS.currentPath;
 },
 chdir: function(path) {
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  if (lookup.node === null) {
   throw new FS.ErrnoError(44);
  }
  if (!FS.isDir(lookup.node.mode)) {
   throw new FS.ErrnoError(54);
  }
  var errCode = FS.nodePermissions(lookup.node, "x");
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  FS.currentPath = lookup.path;
 },
 createDefaultDirectories: function() {
  FS.mkdir("/tmp");
  FS.mkdir("/home");
  FS.mkdir("/home/web_user");
 },
 createDefaultDevices: function() {
  FS.mkdir("/dev");
  FS.registerDevice(FS.makedev(1, 3), {
   read: function() {
    return 0;
   },
   write: function(stream, buffer, offset, length, pos) {
    return length;
   }
  });
  FS.mkdev("/dev/null", FS.makedev(1, 3));
  TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
  TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
  FS.mkdev("/dev/tty", FS.makedev(5, 0));
  FS.mkdev("/dev/tty1", FS.makedev(6, 0));
  var random_device;
  if (typeof crypto === "object" && typeof crypto["getRandomValues"] === "function") {
   var randomBuffer = new Uint8Array(1);
   random_device = function() {
    crypto.getRandomValues(randomBuffer);
    return randomBuffer[0];
   };
  } else if (ENVIRONMENT_IS_NODE) {
   try {
    var crypto_module = require("crypto");
    random_device = function() {
     return crypto_module["randomBytes"](1)[0];
    };
   } catch (e) {}
  } else {}
  if (!random_device) {
   random_device = function() {
    abort("no cryptographic support found for random_device. consider polyfilling it if you want to use something insecure like Math.random(), e.g. put this in a --pre-js: var crypto = { getRandomValues: function(array) { for (var i = 0; i < array.length; i++) array[i] = (Math.random()*256)|0 } };");
   };
  }
  FS.createDevice("/dev", "random", random_device);
  FS.createDevice("/dev", "urandom", random_device);
  FS.mkdir("/dev/shm");
  FS.mkdir("/dev/shm/tmp");
 },
 createSpecialDirectories: function() {
  FS.mkdir("/proc");
  FS.mkdir("/proc/self");
  FS.mkdir("/proc/self/fd");
  FS.mount({
   mount: function() {
    var node = FS.createNode("/proc/self", "fd", 16384 | 511, 73);
    node.node_ops = {
     lookup: function(parent, name) {
      var fd = +name;
      var stream = FS.getStream(fd);
      if (!stream) throw new FS.ErrnoError(8);
      var ret = {
       parent: null,
       mount: {
        mountpoint: "fake"
       },
       node_ops: {
        readlink: function() {
         return stream.path;
        }
       }
      };
      ret.parent = ret;
      return ret;
     }
    };
    return node;
   }
  }, {}, "/proc/self/fd");
 },
 createStandardStreams: function() {
  if (Module["stdin"]) {
   FS.createDevice("/dev", "stdin", Module["stdin"]);
  } else {
   FS.symlink("/dev/tty", "/dev/stdin");
  }
  if (Module["stdout"]) {
   FS.createDevice("/dev", "stdout", null, Module["stdout"]);
  } else {
   FS.symlink("/dev/tty", "/dev/stdout");
  }
  if (Module["stderr"]) {
   FS.createDevice("/dev", "stderr", null, Module["stderr"]);
  } else {
   FS.symlink("/dev/tty1", "/dev/stderr");
  }
  var stdin = FS.open("/dev/stdin", "r");
  var stdout = FS.open("/dev/stdout", "w");
  var stderr = FS.open("/dev/stderr", "w");
  assert(stdin.fd === 0, "invalid handle for stdin (" + stdin.fd + ")");
  assert(stdout.fd === 1, "invalid handle for stdout (" + stdout.fd + ")");
  assert(stderr.fd === 2, "invalid handle for stderr (" + stderr.fd + ")");
 },
 ensureErrnoError: function() {
  if (FS.ErrnoError) return;
  FS.ErrnoError = function ErrnoError(errno, node) {
   this.node = node;
   this.setErrno = function(errno) {
    this.errno = errno;
    for (var key in ERRNO_CODES) {
     if (ERRNO_CODES[key] === errno) {
      this.code = key;
      break;
     }
    }
   };
   this.setErrno(errno);
   this.message = ERRNO_MESSAGES[errno];
   if (this.stack) {
    Object.defineProperty(this, "stack", {
     value: new Error().stack,
     writable: true
    });
    this.stack = demangleAll(this.stack);
   }
  };
  FS.ErrnoError.prototype = new Error();
  FS.ErrnoError.prototype.constructor = FS.ErrnoError;
  [ 44 ].forEach(function(code) {
   FS.genericErrors[code] = new FS.ErrnoError(code);
   FS.genericErrors[code].stack = "<generic error, no stack>";
  });
 },
 staticInit: function() {
  FS.ensureErrnoError();
  FS.nameTable = new Array(4096);
  FS.mount(MEMFS, {}, "/");
  FS.createDefaultDirectories();
  FS.createDefaultDevices();
  FS.createSpecialDirectories();
  FS.filesystems = {
   "MEMFS": MEMFS,
   "NODEFS": NODEFS
  };
 },
 init: function(input, output, error) {
  assert(!FS.init.initialized, "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)");
  FS.init.initialized = true;
  FS.ensureErrnoError();
  Module["stdin"] = input || Module["stdin"];
  Module["stdout"] = output || Module["stdout"];
  Module["stderr"] = error || Module["stderr"];
  FS.createStandardStreams();
 },
 quit: function() {
  FS.init.initialized = false;
  var fflush = Module["_fflush"];
  if (fflush) fflush(0);
  for (var i = 0; i < FS.streams.length; i++) {
   var stream = FS.streams[i];
   if (!stream) {
    continue;
   }
   FS.close(stream);
  }
 },
 getMode: function(canRead, canWrite) {
  var mode = 0;
  if (canRead) mode |= 292 | 73;
  if (canWrite) mode |= 146;
  return mode;
 },
 joinPath: function(parts, forceRelative) {
  var path = PATH.join.apply(null, parts);
  if (forceRelative && path[0] == "/") path = path.substr(1);
  return path;
 },
 absolutePath: function(relative, base) {
  return PATH_FS.resolve(base, relative);
 },
 standardizePath: function(path) {
  return PATH.normalize(path);
 },
 findObject: function(path, dontResolveLastLink) {
  var ret = FS.analyzePath(path, dontResolveLastLink);
  if (ret.exists) {
   return ret.object;
  } else {
   ___setErrNo(ret.error);
   return null;
  }
 },
 analyzePath: function(path, dontResolveLastLink) {
  try {
   var lookup = FS.lookupPath(path, {
    follow: !dontResolveLastLink
   });
   path = lookup.path;
  } catch (e) {}
  var ret = {
   isRoot: false,
   exists: false,
   error: 0,
   name: null,
   path: null,
   object: null,
   parentExists: false,
   parentPath: null,
   parentObject: null
  };
  try {
   var lookup = FS.lookupPath(path, {
    parent: true
   });
   ret.parentExists = true;
   ret.parentPath = lookup.path;
   ret.parentObject = lookup.node;
   ret.name = PATH.basename(path);
   lookup = FS.lookupPath(path, {
    follow: !dontResolveLastLink
   });
   ret.exists = true;
   ret.path = lookup.path;
   ret.object = lookup.node;
   ret.name = lookup.node.name;
   ret.isRoot = lookup.path === "/";
  } catch (e) {
   ret.error = e.errno;
  }
  return ret;
 },
 createFolder: function(parent, name, canRead, canWrite) {
  var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
  var mode = FS.getMode(canRead, canWrite);
  return FS.mkdir(path, mode);
 },
 createPath: function(parent, path, canRead, canWrite) {
  parent = typeof parent === "string" ? parent : FS.getPath(parent);
  var parts = path.split("/").reverse();
  while (parts.length) {
   var part = parts.pop();
   if (!part) continue;
   var current = PATH.join2(parent, part);
   try {
    FS.mkdir(current);
   } catch (e) {}
   parent = current;
  }
  return current;
 },
 createFile: function(parent, name, properties, canRead, canWrite) {
  var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
  var mode = FS.getMode(canRead, canWrite);
  return FS.create(path, mode);
 },
 createDataFile: function(parent, name, data, canRead, canWrite, canOwn) {
  var path = name ? PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name) : parent;
  var mode = FS.getMode(canRead, canWrite);
  var node = FS.create(path, mode);
  if (data) {
   if (typeof data === "string") {
    var arr = new Array(data.length);
    for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
    data = arr;
   }
   FS.chmod(node, mode | 146);
   var stream = FS.open(node, "w");
   FS.write(stream, data, 0, data.length, 0, canOwn);
   FS.close(stream);
   FS.chmod(node, mode);
  }
  return node;
 },
 createDevice: function(parent, name, input, output) {
  var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
  var mode = FS.getMode(!!input, !!output);
  if (!FS.createDevice.major) FS.createDevice.major = 64;
  var dev = FS.makedev(FS.createDevice.major++, 0);
  FS.registerDevice(dev, {
   open: function(stream) {
    stream.seekable = false;
   },
   close: function(stream) {
    if (output && output.buffer && output.buffer.length) {
     output(10);
    }
   },
   read: function(stream, buffer, offset, length, pos) {
    var bytesRead = 0;
    for (var i = 0; i < length; i++) {
     var result;
     try {
      result = input();
     } catch (e) {
      throw new FS.ErrnoError(29);
     }
     if (result === undefined && bytesRead === 0) {
      throw new FS.ErrnoError(6);
     }
     if (result === null || result === undefined) break;
     bytesRead++;
     buffer[offset + i] = result;
    }
    if (bytesRead) {
     stream.node.timestamp = Date.now();
    }
    return bytesRead;
   },
   write: function(stream, buffer, offset, length, pos) {
    for (var i = 0; i < length; i++) {
     try {
      output(buffer[offset + i]);
     } catch (e) {
      throw new FS.ErrnoError(29);
     }
    }
    if (length) {
     stream.node.timestamp = Date.now();
    }
    return i;
   }
  });
  return FS.mkdev(path, mode, dev);
 },
 createLink: function(parent, name, target, canRead, canWrite) {
  var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
  return FS.symlink(target, path);
 },
 forceLoadFile: function(obj) {
  if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
  var success = true;
  if (typeof XMLHttpRequest !== "undefined") {
   throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
  } else if (read_) {
   try {
    obj.contents = intArrayFromString(read_(obj.url), true);
    obj.usedBytes = obj.contents.length;
   } catch (e) {
    success = false;
   }
  } else {
   throw new Error("Cannot load without read() or XMLHttpRequest.");
  }
  if (!success) ___setErrNo(29);
  return success;
 },
 createLazyFile: function(parent, name, url, canRead, canWrite) {
  function LazyUint8Array() {
   this.lengthKnown = false;
   this.chunks = [];
  }
  LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
   if (idx > this.length - 1 || idx < 0) {
    return undefined;
   }
   var chunkOffset = idx % this.chunkSize;
   var chunkNum = idx / this.chunkSize | 0;
   return this.getter(chunkNum)[chunkOffset];
  };
  LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
   this.getter = getter;
  };
  LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
   var xhr = new XMLHttpRequest();
   xhr.open("HEAD", url, false);
   xhr.send(null);
   if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
   var datalength = Number(xhr.getResponseHeader("Content-length"));
   var header;
   var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
   var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
   var chunkSize = 1024 * 1024;
   if (!hasByteServing) chunkSize = datalength;
   var doXHR = function(from, to) {
    if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
    if (to > datalength - 1) throw new Error("only " + datalength + " bytes available! programmer error!");
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
    if (typeof Uint8Array != "undefined") xhr.responseType = "arraybuffer";
    if (xhr.overrideMimeType) {
     xhr.overrideMimeType("text/plain; charset=x-user-defined");
    }
    xhr.send(null);
    if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
    if (xhr.response !== undefined) {
     return new Uint8Array(xhr.response || []);
    } else {
     return intArrayFromString(xhr.responseText || "", true);
    }
   };
   var lazyArray = this;
   lazyArray.setDataGetter(function(chunkNum) {
    var start = chunkNum * chunkSize;
    var end = (chunkNum + 1) * chunkSize - 1;
    end = Math.min(end, datalength - 1);
    if (typeof lazyArray.chunks[chunkNum] === "undefined") {
     lazyArray.chunks[chunkNum] = doXHR(start, end);
    }
    if (typeof lazyArray.chunks[chunkNum] === "undefined") throw new Error("doXHR failed!");
    return lazyArray.chunks[chunkNum];
   });
   if (usesGzip || !datalength) {
    chunkSize = datalength = 1;
    datalength = this.getter(0).length;
    chunkSize = datalength;
    out("LazyFiles on gzip forces download of the whole file when length is accessed");
   }
   this._length = datalength;
   this._chunkSize = chunkSize;
   this.lengthKnown = true;
  };
  if (typeof XMLHttpRequest !== "undefined") {
   if (!ENVIRONMENT_IS_WORKER) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
   var lazyArray = new LazyUint8Array();
   Object.defineProperties(lazyArray, {
    length: {
     get: function() {
      if (!this.lengthKnown) {
       this.cacheLength();
      }
      return this._length;
     }
    },
    chunkSize: {
     get: function() {
      if (!this.lengthKnown) {
       this.cacheLength();
      }
      return this._chunkSize;
     }
    }
   });
   var properties = {
    isDevice: false,
    contents: lazyArray
   };
  } else {
   var properties = {
    isDevice: false,
    url: url
   };
  }
  var node = FS.createFile(parent, name, properties, canRead, canWrite);
  if (properties.contents) {
   node.contents = properties.contents;
  } else if (properties.url) {
   node.contents = null;
   node.url = properties.url;
  }
  Object.defineProperties(node, {
   usedBytes: {
    get: function() {
     return this.contents.length;
    }
   }
  });
  var stream_ops = {};
  var keys = Object.keys(node.stream_ops);
  keys.forEach(function(key) {
   var fn = node.stream_ops[key];
   stream_ops[key] = function forceLoadLazyFile() {
    if (!FS.forceLoadFile(node)) {
     throw new FS.ErrnoError(29);
    }
    return fn.apply(null, arguments);
   };
  });
  stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
   if (!FS.forceLoadFile(node)) {
    throw new FS.ErrnoError(29);
   }
   var contents = stream.node.contents;
   if (position >= contents.length) return 0;
   var size = Math.min(contents.length - position, length);
   assert(size >= 0);
   if (contents.slice) {
    for (var i = 0; i < size; i++) {
     buffer[offset + i] = contents[position + i];
    }
   } else {
    for (var i = 0; i < size; i++) {
     buffer[offset + i] = contents.get(position + i);
    }
   }
   return size;
  };
  node.stream_ops = stream_ops;
  return node;
 },
 createPreloadedFile: function(parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) {
  Browser.init();
  var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
  var dep = getUniqueRunDependency("cp " + fullname);
  function processData(byteArray) {
   function finish(byteArray) {
    if (preFinish) preFinish();
    if (!dontCreateFile) {
     FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
    }
    if (onload) onload();
    removeRunDependency(dep);
   }
   var handled = false;
   Module["preloadPlugins"].forEach(function(plugin) {
    if (handled) return;
    if (plugin["canHandle"](fullname)) {
     plugin["handle"](byteArray, fullname, finish, function() {
      if (onerror) onerror();
      removeRunDependency(dep);
     });
     handled = true;
    }
   });
   if (!handled) finish(byteArray);
  }
  addRunDependency(dep);
  if (typeof url == "string") {
   Browser.asyncLoad(url, function(byteArray) {
    processData(byteArray);
   }, onerror);
  } else {
   processData(url);
  }
 },
 indexedDB: function() {
  return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
 },
 DB_NAME: function() {
  return "EM_FS_" + window.location.pathname;
 },
 DB_VERSION: 20,
 DB_STORE_NAME: "FILE_DATA",
 saveFilesToDB: function(paths, onload, onerror) {
  onload = onload || function() {};
  onerror = onerror || function() {};
  var indexedDB = FS.indexedDB();
  try {
   var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
  } catch (e) {
   return onerror(e);
  }
  openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
   out("creating db");
   var db = openRequest.result;
   db.createObjectStore(FS.DB_STORE_NAME);
  };
  openRequest.onsuccess = function openRequest_onsuccess() {
   var db = openRequest.result;
   var transaction = db.transaction([ FS.DB_STORE_NAME ], "readwrite");
   var files = transaction.objectStore(FS.DB_STORE_NAME);
   var ok = 0, fail = 0, total = paths.length;
   function finish() {
    if (fail == 0) onload(); else onerror();
   }
   paths.forEach(function(path) {
    var putRequest = files.put(FS.analyzePath(path).object.contents, path);
    putRequest.onsuccess = function putRequest_onsuccess() {
     ok++;
     if (ok + fail == total) finish();
    };
    putRequest.onerror = function putRequest_onerror() {
     fail++;
     if (ok + fail == total) finish();
    };
   });
   transaction.onerror = onerror;
  };
  openRequest.onerror = onerror;
 },
 loadFilesFromDB: function(paths, onload, onerror) {
  onload = onload || function() {};
  onerror = onerror || function() {};
  var indexedDB = FS.indexedDB();
  try {
   var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
  } catch (e) {
   return onerror(e);
  }
  openRequest.onupgradeneeded = onerror;
  openRequest.onsuccess = function openRequest_onsuccess() {
   var db = openRequest.result;
   try {
    var transaction = db.transaction([ FS.DB_STORE_NAME ], "readonly");
   } catch (e) {
    onerror(e);
    return;
   }
   var files = transaction.objectStore(FS.DB_STORE_NAME);
   var ok = 0, fail = 0, total = paths.length;
   function finish() {
    if (fail == 0) onload(); else onerror();
   }
   paths.forEach(function(path) {
    var getRequest = files.get(path);
    getRequest.onsuccess = function getRequest_onsuccess() {
     if (FS.analyzePath(path).exists) {
      FS.unlink(path);
     }
     FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
     ok++;
     if (ok + fail == total) finish();
    };
    getRequest.onerror = function getRequest_onerror() {
     fail++;
     if (ok + fail == total) finish();
    };
   });
   transaction.onerror = onerror;
  };
  openRequest.onerror = onerror;
 }
};

Module["FS"] = FS;

var SYSCALLS = {
 DEFAULT_POLLMASK: 5,
 mappings: {},
 umask: 511,
 calculateAt: function(dirfd, path) {
  if (path[0] !== "/") {
   var dir;
   if (dirfd === -100) {
    dir = FS.cwd();
   } else {
    var dirstream = FS.getStream(dirfd);
    if (!dirstream) throw new FS.ErrnoError(8);
    dir = dirstream.path;
   }
   path = PATH.join2(dir, path);
  }
  return path;
 },
 doStat: function(func, path, buf) {
  try {
   var stat = func(path);
  } catch (e) {
   if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
    return -54;
   }
   throw e;
  }
  HEAP32[buf >> 2] = stat.dev;
  HEAP32[buf + 4 >> 2] = 0;
  HEAP32[buf + 8 >> 2] = stat.ino;
  HEAP32[buf + 12 >> 2] = stat.mode;
  HEAP32[buf + 16 >> 2] = stat.nlink;
  HEAP32[buf + 20 >> 2] = stat.uid;
  HEAP32[buf + 24 >> 2] = stat.gid;
  HEAP32[buf + 28 >> 2] = stat.rdev;
  HEAP32[buf + 32 >> 2] = 0;
  tempI64 = [ stat.size >>> 0, (tempDouble = stat.size, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
  HEAP32[buf + 40 >> 2] = tempI64[0], HEAP32[buf + 44 >> 2] = tempI64[1];
  HEAP32[buf + 48 >> 2] = 4096;
  HEAP32[buf + 52 >> 2] = stat.blocks;
  HEAP32[buf + 56 >> 2] = stat.atime.getTime() / 1e3 | 0;
  HEAP32[buf + 60 >> 2] = 0;
  HEAP32[buf + 64 >> 2] = stat.mtime.getTime() / 1e3 | 0;
  HEAP32[buf + 68 >> 2] = 0;
  HEAP32[buf + 72 >> 2] = stat.ctime.getTime() / 1e3 | 0;
  HEAP32[buf + 76 >> 2] = 0;
  tempI64 = [ stat.ino >>> 0, (tempDouble = stat.ino, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
  HEAP32[buf + 80 >> 2] = tempI64[0], HEAP32[buf + 84 >> 2] = tempI64[1];
  return 0;
 },
 doMsync: function(addr, stream, len, flags, offset) {
  var buffer = new Uint8Array(HEAPU8.subarray(addr, addr + len));
  FS.msync(stream, buffer, offset, len, flags);
 },
 doMkdir: function(path, mode) {
  path = PATH.normalize(path);
  if (path[path.length - 1] === "/") path = path.substr(0, path.length - 1);
  FS.mkdir(path, mode, 0);
  return 0;
 },
 doMknod: function(path, mode, dev) {
  switch (mode & 61440) {
  case 32768:
  case 8192:
  case 24576:
  case 4096:
  case 49152:
   break;

  default:
   return -28;
  }
  FS.mknod(path, mode, dev);
  return 0;
 },
 doReadlink: function(path, buf, bufsize) {
  if (bufsize <= 0) return -28;
  var ret = FS.readlink(path);
  var len = Math.min(bufsize, lengthBytesUTF8(ret));
  var endChar = HEAP8[buf + len];
  stringToUTF8(ret, buf, bufsize + 1);
  HEAP8[buf + len] = endChar;
  return len;
 },
 doAccess: function(path, amode) {
  if (amode & ~7) {
   return -28;
  }
  var node;
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  node = lookup.node;
  if (!node) {
   return -44;
  }
  var perms = "";
  if (amode & 4) perms += "r";
  if (amode & 2) perms += "w";
  if (amode & 1) perms += "x";
  if (perms && FS.nodePermissions(node, perms)) {
   return -2;
  }
  return 0;
 },
 doDup: function(path, flags, suggestFD) {
  var suggest = FS.getStream(suggestFD);
  if (suggest) FS.close(suggest);
  return FS.open(path, flags, 0, suggestFD, suggestFD).fd;
 },
 doReadv: function(stream, iov, iovcnt, offset) {
  var ret = 0;
  for (var i = 0; i < iovcnt; i++) {
   var ptr = HEAP32[iov + i * 8 >> 2];
   var len = HEAP32[iov + (i * 8 + 4) >> 2];
   var curr = FS.read(stream, HEAP8, ptr, len, offset);
   if (curr < 0) return -1;
   ret += curr;
   if (curr < len) break;
  }
  return ret;
 },
 doWritev: function(stream, iov, iovcnt, offset) {
  var ret = 0;
  for (var i = 0; i < iovcnt; i++) {
   var ptr = HEAP32[iov + i * 8 >> 2];
   var len = HEAP32[iov + (i * 8 + 4) >> 2];
   var curr = FS.write(stream, HEAP8, ptr, len, offset);
   if (curr < 0) return -1;
   ret += curr;
  }
  return ret;
 },
 varargs: 0,
 get: function(varargs) {
  SYSCALLS.varargs += 4;
  var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];
  return ret;
 },
 getStr: function() {
  var ret = UTF8ToString(SYSCALLS.get());
  return ret;
 },
 getStreamFromFD: function(fd) {
  if (fd === undefined) fd = SYSCALLS.get();
  var stream = FS.getStream(fd);
  if (!stream) throw new FS.ErrnoError(8);
  return stream;
 },
 get64: function() {
  var low = SYSCALLS.get(), high = SYSCALLS.get();
  if (low >= 0) assert(high === 0); else assert(high === -1);
  return low;
 },
 getZero: function() {
  assert(SYSCALLS.get() === 0);
 }
};

Module["SYSCALLS"] = SYSCALLS;

function _fd_write(fd, iov, iovcnt, pnum) {
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  var num = SYSCALLS.doWritev(stream, iov, iovcnt);
  HEAP32[pnum >> 2] = num;
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return e.errno;
 }
}

Module["_fd_write"] = _fd_write;

function _fp$_Z10directCallx$jj() {
 if (!Module["_fp$_Z10directCallx$jj"]) abort("external function 'fp$_Z10directCallx$jj' is missing. perhaps a side module was not linked in? if this function was expected to arrive from a system library, try to build the MAIN_MODULE with EMCC_FORCE_STDLIBS=1 in the environment");
 return Module["_fp$_Z10directCallx$jj"].apply(null, arguments);
}

function _fp$_Z5sideyx$jj() {
 if (!Module["_fp$_Z5sideyx$jj"]) abort("external function 'fp$_Z5sideyx$jj' is missing. perhaps a side module was not linked in? if this function was expected to arrive from a system library, try to build the MAIN_MODULE with EMCC_FORCE_STDLIBS=1 in the environment");
 return Module["_fp$_Z5sideyx$jj"].apply(null, arguments);
}

function _fp$__stdio_write$iiii() {
 if (!Module["_fp$__stdio_write$iiii"]) abort("external function 'fp$__stdio_write$iiii' is missing. perhaps a side module was not linked in? if this function was expected to arrive from a system library, try to build the MAIN_MODULE with EMCC_FORCE_STDLIBS=1 in the environment");
 return Module["_fp$__stdio_write$iiii"].apply(null, arguments);
}

function _g$_ZN20__em_asm_sig_builderI19__em_asm_type_tupleIJEEE6bufferE() {
 if (!Module["__ZN20__em_asm_sig_builderI19__em_asm_type_tupleIJEEE6bufferE"]) abort("external global '_ZN20__em_asm_sig_builderI19__em_asm_type_tupleIJEEE6bufferE' is missing. perhaps a side module was not linked in? if this function was expected to arrive from a system library, try to build the MAIN_MODULE with EMCC_FORCE_STDLIBS=1 in the environment");
 return Module["__ZN20__em_asm_sig_builderI19__em_asm_type_tupleIJEEE6bufferE"];
}

function _g$__THREW__() {
 if (!Module["___THREW__"]) abort("external global '__THREW__' is missing. perhaps a side module was not linked in? if this function was expected to arrive from a system library, try to build the MAIN_MODULE with EMCC_FORCE_STDLIBS=1 in the environment");
 return Module["___THREW__"];
}

function _g$__environ() {
 if (!Module["___environ"]) abort("external global '__environ' is missing. perhaps a side module was not linked in? if this function was expected to arrive from a system library, try to build the MAIN_MODULE with EMCC_FORCE_STDLIBS=1 in the environment");
 return Module["___environ"];
}

function _g$__stdout_used() {
 if (!Module["___stdout_used"]) abort("external global '__stdout_used' is missing. perhaps a side module was not linked in? if this function was expected to arrive from a system library, try to build the MAIN_MODULE with EMCC_FORCE_STDLIBS=1 in the environment");
 return Module["___stdout_used"];
}

function _g$__threwValue() {
 if (!Module["___threwValue"]) abort("external global '__threwValue' is missing. perhaps a side module was not linked in? if this function was expected to arrive from a system library, try to build the MAIN_MODULE with EMCC_FORCE_STDLIBS=1 in the environment");
 return Module["___threwValue"];
}

function _g$stdout() {
 if (!Module["_stdout"]) abort("external global 'stdout' is missing. perhaps a side module was not linked in? if this function was expected to arrive from a system library, try to build the MAIN_MODULE with EMCC_FORCE_STDLIBS=1 in the environment");
 return Module["_stdout"];
}

function _getTempRet0() {
 return getTempRet0() | 0;
}

Module["_getTempRet0"] = _getTempRet0;

function _memcpy(dest, src, num) {
 dest = dest | 0;
 src = src | 0;
 num = num | 0;
 var ret = 0;
 var aligned_dest_end = 0;
 var block_aligned_dest_end = 0;
 var dest_end = 0;
 if ((num | 0) >= 8192) {
  _emscripten_memcpy_big(dest | 0, src | 0, num | 0) | 0;
  return dest | 0;
 }
 ret = dest | 0;
 dest_end = dest + num | 0;
 if ((dest & 3) == (src & 3)) {
  while (dest & 3) {
   if ((num | 0) == 0) return ret | 0;
   HEAP8[dest >> 0] = HEAP8[src >> 0] | 0;
   dest = dest + 1 | 0;
   src = src + 1 | 0;
   num = num - 1 | 0;
  }
  aligned_dest_end = dest_end & -4 | 0;
  block_aligned_dest_end = aligned_dest_end - 64 | 0;
  while ((dest | 0) <= (block_aligned_dest_end | 0)) {
   HEAP32[dest >> 2] = HEAP32[src >> 2] | 0;
   HEAP32[dest + 4 >> 2] = HEAP32[src + 4 >> 2] | 0;
   HEAP32[dest + 8 >> 2] = HEAP32[src + 8 >> 2] | 0;
   HEAP32[dest + 12 >> 2] = HEAP32[src + 12 >> 2] | 0;
   HEAP32[dest + 16 >> 2] = HEAP32[src + 16 >> 2] | 0;
   HEAP32[dest + 20 >> 2] = HEAP32[src + 20 >> 2] | 0;
   HEAP32[dest + 24 >> 2] = HEAP32[src + 24 >> 2] | 0;
   HEAP32[dest + 28 >> 2] = HEAP32[src + 28 >> 2] | 0;
   HEAP32[dest + 32 >> 2] = HEAP32[src + 32 >> 2] | 0;
   HEAP32[dest + 36 >> 2] = HEAP32[src + 36 >> 2] | 0;
   HEAP32[dest + 40 >> 2] = HEAP32[src + 40 >> 2] | 0;
   HEAP32[dest + 44 >> 2] = HEAP32[src + 44 >> 2] | 0;
   HEAP32[dest + 48 >> 2] = HEAP32[src + 48 >> 2] | 0;
   HEAP32[dest + 52 >> 2] = HEAP32[src + 52 >> 2] | 0;
   HEAP32[dest + 56 >> 2] = HEAP32[src + 56 >> 2] | 0;
   HEAP32[dest + 60 >> 2] = HEAP32[src + 60 >> 2] | 0;
   dest = dest + 64 | 0;
   src = src + 64 | 0;
  }
  while ((dest | 0) < (aligned_dest_end | 0)) {
   HEAP32[dest >> 2] = HEAP32[src >> 2] | 0;
   dest = dest + 4 | 0;
   src = src + 4 | 0;
  }
 } else {
  aligned_dest_end = dest_end - 4 | 0;
  while ((dest | 0) < (aligned_dest_end | 0)) {
   HEAP8[dest >> 0] = HEAP8[src >> 0] | 0;
   HEAP8[dest + 1 >> 0] = HEAP8[src + 1 >> 0] | 0;
   HEAP8[dest + 2 >> 0] = HEAP8[src + 2 >> 0] | 0;
   HEAP8[dest + 3 >> 0] = HEAP8[src + 3 >> 0] | 0;
   dest = dest + 4 | 0;
   src = src + 4 | 0;
  }
 }
 while ((dest | 0) < (dest_end | 0)) {
  HEAP8[dest >> 0] = HEAP8[src >> 0] | 0;
  dest = dest + 1 | 0;
  src = src + 1 | 0;
 }
 return ret | 0;
}

Module["_memcpy"] = _memcpy;

function _memset(ptr, value, num) {
 ptr = ptr | 0;
 value = value | 0;
 num = num | 0;
 var end = 0, aligned_end = 0, block_aligned_end = 0, value4 = 0;
 end = ptr + num | 0;
 value = value & 255;
 if ((num | 0) >= 67) {
  while ((ptr & 3) != 0) {
   HEAP8[ptr >> 0] = value;
   ptr = ptr + 1 | 0;
  }
  aligned_end = end & -4 | 0;
  value4 = value | value << 8 | value << 16 | value << 24;
  block_aligned_end = aligned_end - 64 | 0;
  while ((ptr | 0) <= (block_aligned_end | 0)) {
   HEAP32[ptr >> 2] = value4;
   HEAP32[ptr + 4 >> 2] = value4;
   HEAP32[ptr + 8 >> 2] = value4;
   HEAP32[ptr + 12 >> 2] = value4;
   HEAP32[ptr + 16 >> 2] = value4;
   HEAP32[ptr + 20 >> 2] = value4;
   HEAP32[ptr + 24 >> 2] = value4;
   HEAP32[ptr + 28 >> 2] = value4;
   HEAP32[ptr + 32 >> 2] = value4;
   HEAP32[ptr + 36 >> 2] = value4;
   HEAP32[ptr + 40 >> 2] = value4;
   HEAP32[ptr + 44 >> 2] = value4;
   HEAP32[ptr + 48 >> 2] = value4;
   HEAP32[ptr + 52 >> 2] = value4;
   HEAP32[ptr + 56 >> 2] = value4;
   HEAP32[ptr + 60 >> 2] = value4;
   ptr = ptr + 64 | 0;
  }
  while ((ptr | 0) < (aligned_end | 0)) {
   HEAP32[ptr >> 2] = value4;
   ptr = ptr + 4 | 0;
  }
 }
 while ((ptr | 0) < (end | 0)) {
  HEAP8[ptr >> 0] = value;
  ptr = ptr + 1 | 0;
 }
 return end - num | 0;
}

Module["_memset"] = _memset;

function _setTempRet0($i) {
 setTempRet0($i | 0);
}

Module["_setTempRet0"] = _setTempRet0;

function readAsmConstArgs(sigPtr, buf) {
 if (!readAsmConstArgs.array) {
  readAsmConstArgs.array = [];
 }
 var args = readAsmConstArgs.array;
 args.length = 0;
 var ch;
 while (ch = HEAPU8[sigPtr++]) {
  if (ch === 100 || ch === 102) {
   buf = buf + 7 & ~7;
   args.push(HEAPF64[buf >> 3]);
   buf += 8;
  } else if (ch === 105) {
   buf = buf + 3 & ~3;
   args.push(HEAP32[buf >> 2]);
   buf += 4;
  } else abort("unexpected char in asm const signature " + ch);
 }
 return args;
}

Module["readAsmConstArgs"] = readAsmConstArgs;

var PROCINFO = {
 ppid: 1,
 pid: 42,
 sid: 42,
 pgid: 42
};

Module["PROCINFO"] = PROCINFO;

function stringToNewUTF8(jsString) {
 var length = lengthBytesUTF8(jsString) + 1;
 var cString = _malloc(length);
 stringToUTF8(jsString, cString, length);
 return cString;
}

Module["stringToNewUTF8"] = stringToNewUTF8;

function _utime(path, times) {
 var time;
 if (times) {
  var offset = 4;
  time = HEAP32[times + offset >> 2];
  time *= 1e3;
 } else {
  time = Date.now();
 }
 path = UTF8ToString(path);
 try {
  FS.utime(path, time, time);
  return 0;
 } catch (e) {
  FS.handleFSError(e);
  return -1;
 }
}

Module["_utime"] = _utime;

function _utimes(path, times) {
 var time;
 if (times) {
  var offset = 8 + 0;
  time = HEAP32[times + offset >> 2] * 1e3;
  offset = 8 + 4;
  time += HEAP32[times + offset >> 2] / 1e3;
 } else {
  time = Date.now();
 }
 path = UTF8ToString(path);
 try {
  FS.utime(path, time, time);
  return 0;
 } catch (e) {
  FS.handleFSError(e);
  return -1;
 }
}

Module["_utimes"] = _utimes;

function _flock(fd, operation) {
 return 0;
}

Module["_flock"] = _flock;

function _chroot(path) {
 ___setErrNo(2);
 return -1;
}

Module["_chroot"] = _chroot;

function _fpathconf(fildes, name) {
 switch (name) {
 case 0:
  return 32e3;

 case 1:
 case 2:
 case 3:
  return 255;

 case 4:
 case 5:
 case 16:
 case 17:
 case 18:
  return 4096;

 case 6:
 case 7:
 case 20:
  return 1;

 case 8:
  return 0;

 case 9:
 case 10:
 case 11:
 case 12:
 case 14:
 case 15:
 case 19:
  return -1;

 case 13:
  return 64;
 }
 ___setErrNo(28);
 return -1;
}

Module["_fpathconf"] = _fpathconf;

function _pathconf() {
 return _fpathconf.apply(null, arguments);
}

Module["_pathconf"] = _pathconf;

function _confstr(name, buf, len) {
 var value;
 switch (name) {
 case 0:
  value = ENV["PATH"] || "/";
  break;

 case 1:
  value = "POSIX_V6_ILP32_OFF32\nPOSIX_V6_ILP32_OFFBIG";
  break;

 case 2:
  value = "glibc 2.14";
  break;

 case 3:
  value = "";
  break;

 case 1118:
 case 1122:
 case 1124:
 case 1125:
 case 1126:
 case 1128:
 case 1129:
 case 1130:
  value = "";
  break;

 case 1116:
 case 1117:
 case 1121:
  value = "-m32";
  break;

 case 1120:
  value = "-m32 -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64";
  break;

 default:
  ___setErrNo(28);
  return 0;
 }
 if (len == 0 || buf == 0) {
  return value.length + 1;
 } else {
  var length = Math.min(len, value.length);
  for (var i = 0; i < length; i++) {
   HEAP8[buf + i >> 0] = value.charCodeAt(i);
  }
  if (len > length) HEAP8[buf + i++ >> 0] = 0;
  return i;
 }
}

Module["_confstr"] = _confstr;

function _execl() {
 ___setErrNo(45);
 return -1;
}

Module["_execl"] = _execl;

function _execle() {
 return _execl.apply(null, arguments);
}

Module["_execle"] = _execle;

function _execlp() {
 return _execl.apply(null, arguments);
}

Module["_execlp"] = _execlp;

function _execv() {
 return _execl.apply(null, arguments);
}

Module["_execv"] = _execv;

function _execve() {
 return _execl.apply(null, arguments);
}

Module["_execve"] = _execve;

function _execvp() {
 return _execl.apply(null, arguments);
}

Module["_execvp"] = _execvp;

function ___execvpe() {
 return _execl.apply(null, arguments);
}

Module["___execvpe"] = ___execvpe;

function _fexecve() {
 return _execl.apply(null, arguments);
}

Module["_fexecve"] = _fexecve;

function _exit(status) {
 exit(status);
}

Module["_exit"] = _exit;

function __exit(a0) {
 return _exit(a0);
}

Module["__exit"] = __exit;

function __Exit(a0) {
 return _exit(a0);
}

Module["__Exit"] = __Exit;

function _fork() {
 ___setErrNo(6);
 return -1;
}

Module["_fork"] = _fork;

function _vfork() {
 return _fork.apply(null, arguments);
}

Module["_vfork"] = _vfork;

function _posix_spawn() {
 return _fork.apply(null, arguments);
}

Module["_posix_spawn"] = _posix_spawn;

function _posix_spawnp() {
 return _fork.apply(null, arguments);
}

Module["_posix_spawnp"] = _posix_spawnp;

function _sysconf(name) {
 switch (name) {
 case 30:
  return 16384;

 case 85:
  var maxHeapSize = 2 * 1024 * 1024 * 1024 - 65536;
  maxHeapSize = HEAPU8.length;
  return maxHeapSize / 16384;

 case 132:
 case 133:
 case 12:
 case 137:
 case 138:
 case 15:
 case 235:
 case 16:
 case 17:
 case 18:
 case 19:
 case 20:
 case 149:
 case 13:
 case 10:
 case 236:
 case 153:
 case 9:
 case 21:
 case 22:
 case 159:
 case 154:
 case 14:
 case 77:
 case 78:
 case 139:
 case 80:
 case 81:
 case 82:
 case 68:
 case 67:
 case 164:
 case 11:
 case 29:
 case 47:
 case 48:
 case 95:
 case 52:
 case 51:
 case 46:
  return 200809;

 case 79:
  return 0;

 case 27:
 case 246:
 case 127:
 case 128:
 case 23:
 case 24:
 case 160:
 case 161:
 case 181:
 case 182:
 case 242:
 case 183:
 case 184:
 case 243:
 case 244:
 case 245:
 case 165:
 case 178:
 case 179:
 case 49:
 case 50:
 case 168:
 case 169:
 case 175:
 case 170:
 case 171:
 case 172:
 case 97:
 case 76:
 case 32:
 case 173:
 case 35:
  return -1;

 case 176:
 case 177:
 case 7:
 case 155:
 case 8:
 case 157:
 case 125:
 case 126:
 case 92:
 case 93:
 case 129:
 case 130:
 case 131:
 case 94:
 case 91:
  return 1;

 case 74:
 case 60:
 case 69:
 case 70:
 case 4:
  return 1024;

 case 31:
 case 42:
 case 72:
  return 32;

 case 87:
 case 26:
 case 33:
  return 2147483647;

 case 34:
 case 1:
  return 47839;

 case 38:
 case 36:
  return 99;

 case 43:
 case 37:
  return 2048;

 case 0:
  return 2097152;

 case 3:
  return 65536;

 case 28:
  return 32768;

 case 44:
  return 32767;

 case 75:
  return 16384;

 case 39:
  return 1e3;

 case 89:
  return 700;

 case 71:
  return 256;

 case 40:
  return 255;

 case 2:
  return 100;

 case 180:
  return 64;

 case 25:
  return 20;

 case 5:
  return 16;

 case 6:
  return 6;

 case 73:
  return 4;

 case 84:
  {
   if (typeof navigator === "object") return navigator["hardwareConcurrency"] || 1;
   return 1;
  }
 }
 ___setErrNo(28);
 return -1;
}

Module["_sysconf"] = _sysconf;

function _setgroups(ngroups, gidset) {
 if (ngroups < 1 || ngroups > _sysconf(3)) {
  ___setErrNo(28);
  return -1;
 } else {
  ___setErrNo(63);
  return -1;
 }
}

Module["_setgroups"] = _setgroups;

function _getpagesize() {
 return 16384;
}

Module["_getpagesize"] = _getpagesize;

function emscripten_realloc_buffer(size) {
 try {
  wasmMemory.grow(size - buffer.byteLength + 65535 >> 16);
  updateGlobalBufferAndViews(wasmMemory.buffer);
  return 1;
 } catch (e) {
  console.error("emscripten_realloc_buffer: Attempted to grow heap from " + buffer.byteLength + " bytes to " + size + " bytes, but got error: " + e);
 }
}

Module["emscripten_realloc_buffer"] = emscripten_realloc_buffer;

function _emscripten_notify_memory_growth(memoryIndex) {
 assert(memoryIndex == 0);
 updateGlobalBufferAndViews(wasmMemory.buffer);
}

Module["_emscripten_notify_memory_growth"] = _emscripten_notify_memory_growth;

function _system(command) {
 ___setErrNo(6);
 return -1;
}

Module["_system"] = _system;

var _abs = Math_abs;

Module["_abs"] = _abs;

var _labs = Math_abs;

Module["_labs"] = _labs;

function __ZSt9terminatev() {
 _exit(-1234);
}

Module["__ZSt9terminatev"] = __ZSt9terminatev;

function _atexit(func, arg) {
 warnOnce("atexit() called, but EXIT_RUNTIME is not set, so atexits() will not be called. set EXIT_RUNTIME to 1 (see the FAQ)");
 __ATEXIT__.unshift({
  func: func,
  arg: arg
 });
}

Module["_atexit"] = _atexit;

function ___cxa_atexit() {
 return _atexit.apply(null, arguments);
}

Module["___cxa_atexit"] = ___cxa_atexit;

function ___cxa_thread_atexit() {
 return _atexit.apply(null, arguments);
}

Module["___cxa_thread_atexit"] = ___cxa_thread_atexit;

function ___cxa_thread_atexit_impl() {
 return _atexit.apply(null, arguments);
}

Module["___cxa_thread_atexit_impl"] = ___cxa_thread_atexit_impl;

function ___buildEnvironment(environ) {
 var MAX_ENV_VALUES = 64;
 var TOTAL_ENV_SIZE = 1024;
 var poolPtr;
 var envPtr;
 if (!___buildEnvironment.called) {
  ___buildEnvironment.called = true;
  ENV["USER"] = "web_user";
  ENV["LOGNAME"] = "web_user";
  ENV["PATH"] = "/";
  ENV["PWD"] = "/";
  ENV["HOME"] = "/home/web_user";
  ENV["LANG"] = (typeof navigator === "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8";
  ENV["_"] = thisProgram;
  poolPtr = getMemory(TOTAL_ENV_SIZE);
  envPtr = getMemory(MAX_ENV_VALUES * 4);
  HEAP32[envPtr >> 2] = poolPtr;
  HEAP32[environ >> 2] = envPtr;
 } else {
  envPtr = HEAP32[environ >> 2];
  poolPtr = HEAP32[envPtr >> 2];
 }
 var strings = [];
 var totalSize = 0;
 for (var key in ENV) {
  if (typeof ENV[key] === "string") {
   var line = key + "=" + ENV[key];
   strings.push(line);
   totalSize += line.length;
  }
 }
 if (totalSize > TOTAL_ENV_SIZE) {
  throw new Error("Environment size exceeded TOTAL_ENV_SIZE!");
 }
 var ptrSize = 4;
 for (var i = 0; i < strings.length; i++) {
  var line = strings[i];
  writeAsciiToMemory(line, poolPtr);
  HEAP32[envPtr + i * ptrSize >> 2] = poolPtr;
  poolPtr += line.length + 1;
 }
 HEAP32[envPtr + strings.length * ptrSize >> 2] = 0;
}

Module["___buildEnvironment"] = ___buildEnvironment;

function _getenv(name) {
 if (name === 0) return 0;
 name = UTF8ToString(name);
 if (!ENV.hasOwnProperty(name)) return 0;
 if (_getenv.ret) _free(_getenv.ret);
 _getenv.ret = allocateUTF8(ENV[name]);
 return _getenv.ret;
}

Module["_getenv"] = _getenv;

function _emscripten_get_env() {
 return _getenv.apply(null, arguments);
}

Module["_emscripten_get_env"] = _emscripten_get_env;

function _clearenv() {
 ENV = {};
 ___buildEnvironment(__get_environ());
 return 0;
}

Module["_clearenv"] = _clearenv;

function _setenv(envname, envval, overwrite) {
 if (envname === 0) {
  ___setErrNo(28);
  return -1;
 }
 var name = UTF8ToString(envname);
 var val = UTF8ToString(envval);
 if (name === "" || name.indexOf("=") !== -1) {
  ___setErrNo(28);
  return -1;
 }
 if (ENV.hasOwnProperty(name) && !overwrite) return 0;
 ENV[name] = val;
 ___buildEnvironment(__get_environ());
 return 0;
}

Module["_setenv"] = _setenv;

function _unsetenv(name) {
 if (name === 0) {
  ___setErrNo(28);
  return -1;
 }
 name = UTF8ToString(name);
 if (name === "" || name.indexOf("=") !== -1) {
  ___setErrNo(28);
  return -1;
 }
 if (ENV.hasOwnProperty(name)) {
  delete ENV[name];
  ___buildEnvironment(__get_environ());
 }
 return 0;
}

Module["_unsetenv"] = _unsetenv;

function _putenv(string) {
 if (string === 0) {
  ___setErrNo(28);
  return -1;
 }
 string = UTF8ToString(string);
 var splitPoint = string.indexOf("=");
 if (string === "" || string.indexOf("=") === -1) {
  ___setErrNo(28);
  return -1;
 }
 var name = string.slice(0, splitPoint);
 var value = string.slice(splitPoint + 1);
 if (!(name in ENV) || ENV[name] !== value) {
  ENV[name] = value;
  ___buildEnvironment(__get_environ());
 }
 return 0;
}

Module["_putenv"] = _putenv;

function _getloadavg(loadavg, nelem) {
 var limit = Math.min(nelem, 3);
 var doubleSize = 8;
 for (var i = 0; i < limit; i++) {
  HEAPF64[loadavg + i * doubleSize >> 3] = .1;
 }
 return limit;
}

Module["_getloadavg"] = _getloadavg;

function _arc4random() {
 return _rand.apply(null, arguments);
}

Module["_arc4random"] = _arc4random;

function _memmove(dest, src, num) {
 dest = dest | 0;
 src = src | 0;
 num = num | 0;
 var ret = 0;
 if ((src | 0) < (dest | 0) & (dest | 0) < (src + num | 0)) {
  ret = dest;
  src = src + num | 0;
  dest = dest + num | 0;
  while ((num | 0) > 0) {
   dest = dest - 1 | 0;
   src = src - 1 | 0;
   num = num - 1 | 0;
   HEAP8[dest >> 0] = HEAP8[src >> 0] | 0;
  }
  dest = ret;
 } else {
  _memcpy(dest, src, num) | 0;
 }
 return dest | 0;
}

Module["_memmove"] = _memmove;

var _llvm_memcpy_i32 = _memcpy;

Module["_llvm_memcpy_i32"] = _llvm_memcpy_i32;

var _llvm_memcpy_i64 = _memcpy;

Module["_llvm_memcpy_i64"] = _llvm_memcpy_i64;

var _llvm_memcpy_p0i8_p0i8_i32 = _memcpy;

Module["_llvm_memcpy_p0i8_p0i8_i32"] = _llvm_memcpy_p0i8_p0i8_i32;

var _llvm_memcpy_p0i8_p0i8_i64 = _memcpy;

Module["_llvm_memcpy_p0i8_p0i8_i64"] = _llvm_memcpy_p0i8_p0i8_i64;

var _llvm_memmove_i32 = _memmove;

Module["_llvm_memmove_i32"] = _llvm_memmove_i32;

var _llvm_memmove_i64 = _memmove;

Module["_llvm_memmove_i64"] = _llvm_memmove_i64;

var _llvm_memmove_p0i8_p0i8_i32 = _memmove;

Module["_llvm_memmove_p0i8_p0i8_i32"] = _llvm_memmove_p0i8_p0i8_i32;

var _llvm_memmove_p0i8_p0i8_i64 = _memmove;

Module["_llvm_memmove_p0i8_p0i8_i64"] = _llvm_memmove_p0i8_p0i8_i64;

var _llvm_memset_i32 = _memset;

Module["_llvm_memset_i32"] = _llvm_memset_i32;

var _llvm_memset_p0i8_i32 = _memset;

Module["_llvm_memset_p0i8_i32"] = _llvm_memset_p0i8_i32;

var _llvm_memset_p0i8_i64 = _memset;

Module["_llvm_memset_p0i8_i64"] = _llvm_memset_p0i8_i64;

function ___builtin_prefetch() {}

Module["___builtin_prefetch"] = ___builtin_prefetch;

function _llvm_va_end() {}

Module["_llvm_va_end"] = _llvm_va_end;

function _llvm_va_copy(ppdest, ppsrc) {
 HEAP8[ppdest >> 0] = HEAP8[ppsrc >> 0];
 HEAP8[ppdest + 1 >> 0] = HEAP8[ppsrc + 1 >> 0];
 HEAP8[ppdest + 2 >> 0] = HEAP8[ppsrc + 2 >> 0];
 HEAP8[ppdest + 3 >> 0] = HEAP8[ppsrc + 3 >> 0];
 HEAP8[ppdest + 4 >> 0] = HEAP8[ppsrc + 4 >> 0];
 HEAP8[ppdest + 4 + 1 >> 0] = HEAP8[ppsrc + 4 + 1 >> 0];
 HEAP8[ppdest + 4 + 2 >> 0] = HEAP8[ppsrc + 4 + 2 >> 0];
 HEAP8[ppdest + 4 + 3 >> 0] = HEAP8[ppsrc + 4 + 3 >> 0];
}

Module["_llvm_va_copy"] = _llvm_va_copy;

function _llvm_bswap_i16(x) {
 x = x | 0;
 return (x & 255) << 8 | x >> 8 & 255 | 0;
}

Module["_llvm_bswap_i16"] = _llvm_bswap_i16;

function _llvm_bswap_i32(x) {
 x = x | 0;
 return (x & 255) << 24 | (x >> 8 & 255) << 16 | (x >> 16 & 255) << 8 | x >>> 24 | 0;
}

Module["_llvm_bswap_i32"] = _llvm_bswap_i32;

function _llvm_bswap_i64(l, h) {
 var retl = _llvm_bswap_i32(h) >>> 0;
 var reth = _llvm_bswap_i32(l) >>> 0;
 return (setTempRet0(reth), retl) | 0;
}

Module["_llvm_bswap_i64"] = _llvm_bswap_i64;

function _llvm_ctlz_i8(x, isZeroUndef) {
 x = x | 0;
 isZeroUndef = isZeroUndef | 0;
 return (Math_clz32(x & 255) | 0) - 24 | 0;
}

Module["_llvm_ctlz_i8"] = _llvm_ctlz_i8;

function _llvm_ctlz_i16(x, isZeroUndef) {
 x = x | 0;
 isZeroUndef = isZeroUndef | 0;
 return (Math_clz32(x & 65535) | 0) - 16 | 0;
}

Module["_llvm_ctlz_i16"] = _llvm_ctlz_i16;

function _llvm_ctlz_i64(l, h, isZeroUndef) {
 l = l | 0;
 h = h | 0;
 isZeroUndef = isZeroUndef | 0;
 var ret = 0;
 ret = Math_clz32(h) | 0;
 if ((ret | 0) == 32) ret = ret + (Math_clz32(l) | 0) | 0;
 setTempRet0(0 | 0);
 return ret | 0;
}

Module["_llvm_ctlz_i64"] = _llvm_ctlz_i64;

function _llvm_cttz_i32(x) {
 x = x | 0;
 return (x ? 31 - (Math_clz32(x ^ x - 1) | 0) | 0 : 32) | 0;
}

Module["_llvm_cttz_i32"] = _llvm_cttz_i32;

function _llvm_cttz_i64(l, h) {
 var ret = _llvm_cttz_i32(l);
 if (ret == 32) ret += _llvm_cttz_i32(h);
 return (setTempRet0(0), ret) | 0;
}

Module["_llvm_cttz_i64"] = _llvm_cttz_i64;

function _llvm_ctpop_i32(x) {
 x = x | 0;
 x = x - (x >>> 1 & 1431655765) | 0;
 x = (x & 858993459) + (x >>> 2 & 858993459) | 0;
 return Math_imul(x + (x >>> 4) & 252645135, 16843009) >>> 24 | 0;
}

Module["_llvm_ctpop_i32"] = _llvm_ctpop_i32;

function _llvm_ctpop_i64(l, h) {
 l = l | 0;
 h = h | 0;
 return (_llvm_ctpop_i32(l) | 0) + (_llvm_ctpop_i32(h) | 0) | 0;
}

Module["_llvm_ctpop_i64"] = _llvm_ctpop_i64;

function _llvm_trap() {
 abort("trap!");
}

Module["_llvm_trap"] = _llvm_trap;

function _llvm_prefetch() {}

Module["_llvm_prefetch"] = _llvm_prefetch;

function ___assert_fail(condition, filename, line, func) {
 abort("Assertion failed: " + UTF8ToString(condition) + ", at: " + [ filename ? UTF8ToString(filename) : "unknown filename", line, func ? UTF8ToString(func) : "unknown function" ]);
}

Module["___assert_fail"] = ___assert_fail;

function ___assert_func(filename, line, func, condition) {
 abort("Assertion failed: " + (condition ? UTF8ToString(condition) : "unknown condition") + ", at: " + [ filename ? UTF8ToString(filename) : "unknown filename", line, func ? UTF8ToString(func) : "unknown function" ]);
}

Module["___assert_func"] = ___assert_func;

function ___cxa_call_unexpected(exception) {
 err("Unexpected exception thrown, this is not properly supported - aborting");
 ABORT = true;
 throw exception;
}

Module["___cxa_call_unexpected"] = ___cxa_call_unexpected;

function _terminate() {
 return ___cxa_call_unexpected.apply(null, arguments);
}

Module["_terminate"] = _terminate;

function ___gxx_personality_v0() {}

Module["___gxx_personality_v0"] = ___gxx_personality_v0;

function ___gcc_personality_v0() {}

Module["___gcc_personality_v0"] = ___gcc_personality_v0;

function _llvm_stacksave() {
 var self = _llvm_stacksave;
 if (!self.LLVM_SAVEDSTACKS) {
  self.LLVM_SAVEDSTACKS = [];
 }
 self.LLVM_SAVEDSTACKS.push(stackSave());
 return self.LLVM_SAVEDSTACKS.length - 1;
}

Module["_llvm_stacksave"] = _llvm_stacksave;

function _llvm_stackrestore(p) {
 var self = _llvm_stacksave;
 var ret = self.LLVM_SAVEDSTACKS[p];
 self.LLVM_SAVEDSTACKS.splice(p, 1);
 stackRestore(ret);
}

Module["_llvm_stackrestore"] = _llvm_stackrestore;

function _llvm_flt_rounds() {
 return -1;
}

Module["_llvm_flt_rounds"] = _llvm_flt_rounds;

function _llvm_objectsize_i32() {
 return -1;
}

Module["_llvm_objectsize_i32"] = _llvm_objectsize_i32;

function _llvm_bitreverse_i32(x) {
 x = x | 0;
 x = (x & 2863311530) >>> 1 | (x & 1431655765) << 1;
 x = (x & 3435973836) >>> 2 | (x & 858993459) << 2;
 x = (x & 4042322160) >>> 4 | (x & 252645135) << 4;
 x = (x & 4278255360) >>> 8 | (x & 16711935) << 8;
 return x >>> 16 | x << 16;
}

Module["_llvm_bitreverse_i32"] = _llvm_bitreverse_i32;

function _llvm_mono_load_i8_p0i8(ptr) {
 return HEAP8[ptr >> 0];
}

Module["_llvm_mono_load_i8_p0i8"] = _llvm_mono_load_i8_p0i8;

function _llvm_mono_store_i8_p0i8(value, ptr) {
 HEAP8[ptr >> 0] = value;
}

Module["_llvm_mono_store_i8_p0i8"] = _llvm_mono_store_i8_p0i8;

function _llvm_mono_load_i16_p0i16(ptr) {
 return HEAP16[ptr >> 1];
}

Module["_llvm_mono_load_i16_p0i16"] = _llvm_mono_load_i16_p0i16;

function _llvm_mono_store_i16_p0i16(value, ptr) {
 HEAP16[ptr >> 1] = value;
}

Module["_llvm_mono_store_i16_p0i16"] = _llvm_mono_store_i16_p0i16;

function _llvm_mono_load_i32_p0i32(ptr) {
 return HEAP32[ptr >> 2];
}

Module["_llvm_mono_load_i32_p0i32"] = _llvm_mono_load_i32_p0i32;

function _llvm_mono_store_i32_p0i32(value, ptr) {
 HEAP32[ptr >> 2] = value;
}

Module["_llvm_mono_store_i32_p0i32"] = _llvm_mono_store_i32_p0i32;

var _cos = Math_cos;

Module["_cos"] = _cos;

var _cosf = Math_cos;

Module["_cosf"] = _cosf;

var _cosl = Math_cos;

Module["_cosl"] = _cosl;

var _sin = Math_sin;

Module["_sin"] = _sin;

var _sinf = Math_sin;

Module["_sinf"] = _sinf;

var _sinl = Math_sin;

Module["_sinl"] = _sinl;

var _tan = Math_tan;

Module["_tan"] = _tan;

var _tanf = Math_tan;

Module["_tanf"] = _tanf;

var _tanl = Math_tan;

Module["_tanl"] = _tanl;

var _acos = Math_acos;

Module["_acos"] = _acos;

var _acosf = Math_acos;

Module["_acosf"] = _acosf;

var _acosl = Math_acos;

Module["_acosl"] = _acosl;

var _asin = Math_asin;

Module["_asin"] = _asin;

var _asinf = Math_asin;

Module["_asinf"] = _asinf;

var _asinl = Math_asin;

Module["_asinl"] = _asinl;

var _atan = Math_atan;

Module["_atan"] = _atan;

var _atanf = Math_atan;

Module["_atanf"] = _atanf;

var _atanl = Math_atan;

Module["_atanl"] = _atanl;

var _atan2 = Math_atan2;

Module["_atan2"] = _atan2;

var _atan2f = Math_atan2;

Module["_atan2f"] = _atan2f;

var _atan2l = Math_atan2;

Module["_atan2l"] = _atan2l;

var _exp = Math_exp;

Module["_exp"] = _exp;

var _expf = Math_exp;

Module["_expf"] = _expf;

var _expl = Math_exp;

Module["_expl"] = _expl;

var _log = Math_log;

Module["_log"] = _log;

var _logf = Math_log;

Module["_logf"] = _logf;

var _logl = Math_log;

Module["_logl"] = _logl;

var _sqrt = Math_sqrt;

Module["_sqrt"] = _sqrt;

var _sqrtf = Math_sqrt;

Module["_sqrtf"] = _sqrtf;

var _sqrtl = Math_sqrt;

Module["_sqrtl"] = _sqrtl;

var _fabs = Math_abs;

Module["_fabs"] = _fabs;

var _fabsf = Math_abs;

Module["_fabsf"] = _fabsf;

var _fabsl = Math_abs;

Module["_fabsl"] = _fabsl;

var _llvm_fabs_f32 = Math_abs;

Module["_llvm_fabs_f32"] = _llvm_fabs_f32;

var _llvm_fabs_f64 = Math_abs;

Module["_llvm_fabs_f64"] = _llvm_fabs_f64;

var _ceil = Math_ceil;

Module["_ceil"] = _ceil;

var _ceilf = Math_ceil;

Module["_ceilf"] = _ceilf;

var _ceill = Math_ceil;

Module["_ceill"] = _ceill;

var _floor = Math_floor;

Module["_floor"] = _floor;

var _floorf = Math_floor;

Module["_floorf"] = _floorf;

var _floorl = Math_floor;

Module["_floorl"] = _floorl;

var _pow = Math_pow;

Module["_pow"] = _pow;

var _powf = Math_pow;

Module["_powf"] = _powf;

var _powl = Math_pow;

Module["_powl"] = _powl;

var _llvm_sqrt_f32 = Math_sqrt;

Module["_llvm_sqrt_f32"] = _llvm_sqrt_f32;

var _llvm_sqrt_f64 = Math_sqrt;

Module["_llvm_sqrt_f64"] = _llvm_sqrt_f64;

var _llvm_pow_f32 = Math_pow;

Module["_llvm_pow_f32"] = _llvm_pow_f32;

var _llvm_pow_f64 = Math_pow;

Module["_llvm_pow_f64"] = _llvm_pow_f64;

var _llvm_powi_f32 = Math_pow;

Module["_llvm_powi_f32"] = _llvm_powi_f32;

var _llvm_powi_f64 = Math_pow;

Module["_llvm_powi_f64"] = _llvm_powi_f64;

var _llvm_log_f32 = Math_log;

Module["_llvm_log_f32"] = _llvm_log_f32;

var _llvm_log_f64 = Math_log;

Module["_llvm_log_f64"] = _llvm_log_f64;

var _llvm_exp_f32 = Math_exp;

Module["_llvm_exp_f32"] = _llvm_exp_f32;

var _llvm_exp_f64 = Math_exp;

Module["_llvm_exp_f64"] = _llvm_exp_f64;

var _llvm_cos_f32 = Math_cos;

Module["_llvm_cos_f32"] = _llvm_cos_f32;

var _llvm_cos_f64 = Math_cos;

Module["_llvm_cos_f64"] = _llvm_cos_f64;

var _llvm_sin_f32 = Math_sin;

Module["_llvm_sin_f32"] = _llvm_sin_f32;

var _llvm_sin_f64 = Math_sin;

Module["_llvm_sin_f64"] = _llvm_sin_f64;

var _llvm_trunc_f32 = Math_trunc;

Module["_llvm_trunc_f32"] = _llvm_trunc_f32;

var _llvm_trunc_f64 = Math_trunc;

Module["_llvm_trunc_f64"] = _llvm_trunc_f64;

var _llvm_ceil_f32 = Math_ceil;

Module["_llvm_ceil_f32"] = _llvm_ceil_f32;

var _llvm_ceil_f64 = Math_ceil;

Module["_llvm_ceil_f64"] = _llvm_ceil_f64;

var _llvm_floor_f32 = Math_floor;

Module["_llvm_floor_f32"] = _llvm_floor_f32;

var _llvm_floor_f64 = Math_floor;

Module["_llvm_floor_f64"] = _llvm_floor_f64;

function _llvm_exp2_f32(x) {
 return Math.pow(2, x);
}

Module["_llvm_exp2_f32"] = _llvm_exp2_f32;

function _llvm_exp2_f64(a0) {
 return _llvm_exp2_f32(a0);
}

Module["_llvm_exp2_f64"] = _llvm_exp2_f64;

function _llvm_log2_f32(x) {
 return Math.log(x) / Math.LN2;
}

Module["_llvm_log2_f32"] = _llvm_log2_f32;

function _llvm_log2_f64(a0) {
 return _llvm_log2_f32(a0);
}

Module["_llvm_log2_f64"] = _llvm_log2_f64;

function _llvm_log10_f32(x) {
 return Math.log(x) / Math.LN10;
}

Module["_llvm_log10_f32"] = _llvm_log10_f32;

function _llvm_log10_f64(a0) {
 return _llvm_log10_f32(a0);
}

Module["_llvm_log10_f64"] = _llvm_log10_f64;

function _llvm_copysign_f32(x, y) {
 return y < 0 || y === 0 && 1 / y < 0 ? -Math_abs(x) : Math_abs(x);
}

Module["_llvm_copysign_f32"] = _llvm_copysign_f32;

function _llvm_copysign_f64(x, y) {
 return y < 0 || y === 0 && 1 / y < 0 ? -Math_abs(x) : Math_abs(x);
}

Module["_llvm_copysign_f64"] = _llvm_copysign_f64;

function _round(d) {
 d = +d;
 return d >= +0 ? +Math_floor(d + +.5) : +Math_ceil(d - +.5);
}

Module["_round"] = _round;

function _roundf(d) {
 d = +d;
 return d >= +0 ? +Math_floor(d + +.5) : +Math_ceil(d - +.5);
}

Module["_roundf"] = _roundf;

function _llvm_round_f64(d) {
 d = +d;
 return d >= +0 ? +Math_floor(d + +.5) : +Math_ceil(d - +.5);
}

Module["_llvm_round_f64"] = _llvm_round_f64;

function _llvm_round_f32(f) {
 f = +f;
 return f >= +0 ? +Math_floor(f + +.5) : +Math_ceil(f - +.5);
}

Module["_llvm_round_f32"] = _llvm_round_f32;

function _rintf(f) {
 f = +f;
 return f - +Math_floor(f) != .5 ? +_round(f) : +_round(f / +2) * +2;
}

Module["_rintf"] = _rintf;

function _llvm_rint_f32(f) {
 f = +f;
 return f - +Math_floor(f) != .5 ? +_roundf(f) : +_roundf(f / +2) * +2;
}

Module["_llvm_rint_f32"] = _llvm_rint_f32;

function _llvm_rint_f64(f) {
 f = +f;
 return f - +Math_floor(f) != .5 ? +_round(f) : +_round(f / +2) * +2;
}

Module["_llvm_rint_f64"] = _llvm_rint_f64;

function _llvm_nearbyint_f32(f) {
 f = +f;
 return f - +Math_floor(f) != .5 ? +_roundf(f) : +_roundf(f / +2) * +2;
}

Module["_llvm_nearbyint_f32"] = _llvm_nearbyint_f32;

function _llvm_nearbyint_f64(f) {
 f = +f;
 return f - +Math_floor(f) != .5 ? +_round(f) : +_round(f / +2) * +2;
}

Module["_llvm_nearbyint_f64"] = _llvm_nearbyint_f64;

function _llvm_minnum_f32(x, y) {
 x = +x;
 y = +y;
 if (x != x) return +y;
 if (y != y) return +x;
 return +Math_min(+x, +y);
}

Module["_llvm_minnum_f32"] = _llvm_minnum_f32;

function _llvm_minnum_f64(x, y) {
 x = +x;
 y = +y;
 if (x != x) return +y;
 if (y != y) return +x;
 return +Math_min(+x, +y);
}

Module["_llvm_minnum_f64"] = _llvm_minnum_f64;

function _llvm_maxnum_f32(x, y) {
 x = +x;
 y = +y;
 if (x != x) return +y;
 if (y != y) return +x;
 return +Math_max(+x, +y);
}

Module["_llvm_maxnum_f32"] = _llvm_maxnum_f32;

function _llvm_maxnum_f64(x, y) {
 x = +x;
 y = +y;
 if (x != x) return +y;
 if (y != y) return +x;
 return +Math_max(+x, +y);
}

Module["_llvm_maxnum_f64"] = _llvm_maxnum_f64;

function __reallyNegative(x) {
 return x < 0 || x === 0 && 1 / x === -Infinity;
}

Module["__reallyNegative"] = __reallyNegative;

var DLFCN = {
 error: null,
 errorMsg: null
};

Module["DLFCN"] = DLFCN;

function _dlopen(filenameAddr, flag) {
 var searchpaths = [];
 var filename;
 if (filenameAddr === 0) {
  filename = "__self__";
 } else {
  filename = UTF8ToString(filenameAddr);
  var isValidFile = function(filename) {
   var target = FS.findObject(filename);
   return target && !target.isFolder && !target.isDevice;
  };
  if (!isValidFile(filename)) {
   if (ENV["LD_LIBRARY_PATH"]) {
    searchpaths = ENV["LD_LIBRARY_PATH"].split(":");
   }
   for (var ident in searchpaths) {
    var searchfile = PATH.join2(searchpaths[ident], filename);
    if (isValidFile(searchfile)) {
     filename = searchfile;
     break;
    }
   }
  }
 }
 var flags = {
  global: Boolean(flag & 256),
  nodelete: Boolean(flag & 4096),
  fs: FS
 };
 try {
  var handle = loadDynamicLibrary(filename, flags);
 } catch (e) {
  err("Error in loading dynamic library " + filename + ": " + e);
  DLFCN.errorMsg = "Could not load dynamic lib: " + filename + "\n" + e;
  return 0;
 }
 return handle;
}

Module["_dlopen"] = _dlopen;

function _dlclose(handle) {
 if (!LDSO.loadedLibs[handle]) {
  DLFCN.errorMsg = "Tried to dlclose() unopened handle: " + handle;
  return 1;
 } else {
  var lib_record = LDSO.loadedLibs[handle];
  if (--lib_record.refcount == 0) {
   if (lib_record.module.cleanups) {
    lib_record.module.cleanups.forEach(function(cleanup) {
     cleanup();
    });
   }
   delete LDSO.loadedLibNames[lib_record.name];
   delete LDSO.loadedLibs[handle];
  }
  return 0;
 }
}

Module["_dlclose"] = _dlclose;

function _dlsym(handle, symbol) {
 symbol = UTF8ToString(symbol);
 if (!LDSO.loadedLibs[handle]) {
  DLFCN.errorMsg = "Tried to dlsym() from an unopened handle: " + handle;
  return 0;
 }
 var lib = LDSO.loadedLibs[handle];
 var isMainModule = lib.module == Module;
 var mangled = "_" + symbol;
 var modSymbol = mangled;
 if (!isMainModule) {
  modSymbol = symbol;
 }
 if (!lib.module.hasOwnProperty(modSymbol)) {
  DLFCN.errorMsg = 'Tried to lookup unknown symbol "' + modSymbol + '" in dynamic lib: ' + lib.name;
  return 0;
 }
 var result = lib.module[modSymbol];
 if (isMainModule) {
  var asmSymbol = symbol;
  if (lib.module["asm"][asmSymbol]) {
   result = lib.module["asm"][asmSymbol];
  }
 }
 if (typeof result !== "function") return result;
 return addFunctionWasm(result);
}

Module["_dlsym"] = _dlsym;

function _dlerror() {
 if (DLFCN.errorMsg === null) {
  return 0;
 } else {
  if (DLFCN.error) _free(DLFCN.error);
  DLFCN.error = stringToNewUTF8(DLFCN.errorMsg);
  DLFCN.errorMsg = null;
  return DLFCN.error;
 }
}

Module["_dlerror"] = _dlerror;

function _dladdr(addr, info) {
 var fname = stringToNewUTF8(thisProgram || "./this.program");
 HEAP32[info >> 2] = fname;
 HEAP32[info + 4 >> 2] = 0;
 HEAP32[info + 8 >> 2] = 0;
 HEAP32[info + 12 >> 2] = 0;
 return 1;
}

Module["_dladdr"] = _dladdr;

function _getpwuid() {
 throw "getpwuid: TODO";
}

Module["_getpwuid"] = _getpwuid;

function _clock() {
 if (_clock.start === undefined) _clock.start = Date.now();
 return (Date.now() - _clock.start) * (1e6 / 1e3) | 0;
}

Module["_clock"] = _clock;

function _time(ptr) {
 var ret = Date.now() / 1e3 | 0;
 if (ptr) {
  HEAP32[ptr >> 2] = ret;
 }
 return ret;
}

Module["_time"] = _time;

function _difftime(time1, time0) {
 return time1 - time0;
}

Module["_difftime"] = _difftime;

var ___tm_current = 3648;

Module["___tm_current"] = ___tm_current;

var ___tm_timezone = (stringToUTF8("GMT", 3696, 4), 3696);

Module["___tm_timezone"] = ___tm_timezone;

var ___tm_formatted = 3712;

Module["___tm_formatted"] = ___tm_formatted;

function _tzset() {
 if (_tzset.called) return;
 _tzset.called = true;
 HEAP32[__get_timezone() >> 2] = new Date().getTimezoneOffset() * 60;
 var currentYear = new Date().getFullYear();
 var winter = new Date(currentYear, 0, 1);
 var summer = new Date(currentYear, 6, 1);
 HEAP32[__get_daylight() >> 2] = Number(winter.getTimezoneOffset() != summer.getTimezoneOffset());
 function extractZone(date) {
  var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
  return match ? match[1] : "GMT";
 }
 var winterName = extractZone(winter);
 var summerName = extractZone(summer);
 var winterNamePtr = allocate(intArrayFromString(winterName), "i8", ALLOC_NORMAL);
 var summerNamePtr = allocate(intArrayFromString(summerName), "i8", ALLOC_NORMAL);
 if (summer.getTimezoneOffset() < winter.getTimezoneOffset()) {
  HEAP32[__get_tzname() >> 2] = winterNamePtr;
  HEAP32[__get_tzname() + 4 >> 2] = summerNamePtr;
 } else {
  HEAP32[__get_tzname() >> 2] = summerNamePtr;
  HEAP32[__get_tzname() + 4 >> 2] = winterNamePtr;
 }
}

Module["_tzset"] = _tzset;

function _mktime(tmPtr) {
 _tzset();
 var date = new Date(HEAP32[tmPtr + 20 >> 2] + 1900, HEAP32[tmPtr + 16 >> 2], HEAP32[tmPtr + 12 >> 2], HEAP32[tmPtr + 8 >> 2], HEAP32[tmPtr + 4 >> 2], HEAP32[tmPtr >> 2], 0);
 var dst = HEAP32[tmPtr + 32 >> 2];
 var guessedOffset = date.getTimezoneOffset();
 var start = new Date(date.getFullYear(), 0, 1);
 var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
 var winterOffset = start.getTimezoneOffset();
 var dstOffset = Math.min(winterOffset, summerOffset);
 if (dst < 0) {
  HEAP32[tmPtr + 32 >> 2] = Number(summerOffset != winterOffset && dstOffset == guessedOffset);
 } else if (dst > 0 != (dstOffset == guessedOffset)) {
  var nonDstOffset = Math.max(winterOffset, summerOffset);
  var trueOffset = dst > 0 ? dstOffset : nonDstOffset;
  date.setTime(date.getTime() + (trueOffset - guessedOffset) * 6e4);
 }
 HEAP32[tmPtr + 24 >> 2] = date.getDay();
 var yday = (date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24) | 0;
 HEAP32[tmPtr + 28 >> 2] = yday;
 return date.getTime() / 1e3 | 0;
}

Module["_mktime"] = _mktime;

function _timelocal() {
 return _mktime.apply(null, arguments);
}

Module["_timelocal"] = _timelocal;

function _gmtime_r(time, tmPtr) {
 var date = new Date(HEAP32[time >> 2] * 1e3);
 HEAP32[tmPtr >> 2] = date.getUTCSeconds();
 HEAP32[tmPtr + 4 >> 2] = date.getUTCMinutes();
 HEAP32[tmPtr + 8 >> 2] = date.getUTCHours();
 HEAP32[tmPtr + 12 >> 2] = date.getUTCDate();
 HEAP32[tmPtr + 16 >> 2] = date.getUTCMonth();
 HEAP32[tmPtr + 20 >> 2] = date.getUTCFullYear() - 1900;
 HEAP32[tmPtr + 24 >> 2] = date.getUTCDay();
 HEAP32[tmPtr + 36 >> 2] = 0;
 HEAP32[tmPtr + 32 >> 2] = 0;
 var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
 var yday = (date.getTime() - start) / (1e3 * 60 * 60 * 24) | 0;
 HEAP32[tmPtr + 28 >> 2] = yday;
 HEAP32[tmPtr + 40 >> 2] = ___tm_timezone;
 return tmPtr;
}

Module["_gmtime_r"] = _gmtime_r;

function _gmtime(time) {
 return _gmtime_r(time, ___tm_current);
}

Module["_gmtime"] = _gmtime;

function _timegm(tmPtr) {
 _tzset();
 var time = Date.UTC(HEAP32[tmPtr + 20 >> 2] + 1900, HEAP32[tmPtr + 16 >> 2], HEAP32[tmPtr + 12 >> 2], HEAP32[tmPtr + 8 >> 2], HEAP32[tmPtr + 4 >> 2], HEAP32[tmPtr >> 2], 0);
 var date = new Date(time);
 HEAP32[tmPtr + 24 >> 2] = date.getUTCDay();
 var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
 var yday = (date.getTime() - start) / (1e3 * 60 * 60 * 24) | 0;
 HEAP32[tmPtr + 28 >> 2] = yday;
 return date.getTime() / 1e3 | 0;
}

Module["_timegm"] = _timegm;

function _localtime_r(time, tmPtr) {
 _tzset();
 var date = new Date(HEAP32[time >> 2] * 1e3);
 HEAP32[tmPtr >> 2] = date.getSeconds();
 HEAP32[tmPtr + 4 >> 2] = date.getMinutes();
 HEAP32[tmPtr + 8 >> 2] = date.getHours();
 HEAP32[tmPtr + 12 >> 2] = date.getDate();
 HEAP32[tmPtr + 16 >> 2] = date.getMonth();
 HEAP32[tmPtr + 20 >> 2] = date.getFullYear() - 1900;
 HEAP32[tmPtr + 24 >> 2] = date.getDay();
 var start = new Date(date.getFullYear(), 0, 1);
 var yday = (date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24) | 0;
 HEAP32[tmPtr + 28 >> 2] = yday;
 HEAP32[tmPtr + 36 >> 2] = -(date.getTimezoneOffset() * 60);
 var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
 var winterOffset = start.getTimezoneOffset();
 var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
 HEAP32[tmPtr + 32 >> 2] = dst;
 var zonePtr = HEAP32[__get_tzname() + (dst ? 4 : 0) >> 2];
 HEAP32[tmPtr + 40 >> 2] = zonePtr;
 return tmPtr;
}

Module["_localtime_r"] = _localtime_r;

function _localtime(time) {
 return _localtime_r(time, ___tm_current);
}

Module["_localtime"] = _localtime;

function _asctime_r(tmPtr, buf) {
 var date = {
  tm_sec: HEAP32[tmPtr >> 2],
  tm_min: HEAP32[tmPtr + 4 >> 2],
  tm_hour: HEAP32[tmPtr + 8 >> 2],
  tm_mday: HEAP32[tmPtr + 12 >> 2],
  tm_mon: HEAP32[tmPtr + 16 >> 2],
  tm_year: HEAP32[tmPtr + 20 >> 2],
  tm_wday: HEAP32[tmPtr + 24 >> 2]
 };
 var days = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];
 var months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
 var s = days[date.tm_wday] + " " + months[date.tm_mon] + (date.tm_mday < 10 ? "  " : " ") + date.tm_mday + (date.tm_hour < 10 ? " 0" : " ") + date.tm_hour + (date.tm_min < 10 ? ":0" : ":") + date.tm_min + (date.tm_sec < 10 ? ":0" : ":") + date.tm_sec + " " + (1900 + date.tm_year) + "\n";
 stringToUTF8(s, buf, 26);
 return buf;
}

Module["_asctime_r"] = _asctime_r;

function _asctime(tmPtr) {
 return _asctime_r(tmPtr, ___tm_formatted);
}

Module["_asctime"] = _asctime;

function _ctime_r(time, buf) {
 var stack = stackSave();
 var rv = _asctime_r(_localtime_r(time, stackAlloc(44)), buf);
 stackRestore(stack);
 return rv;
}

Module["_ctime_r"] = _ctime_r;

function _ctime(timer) {
 return _ctime_r(timer, ___tm_current);
}

Module["_ctime"] = _ctime;

function _dysize(year) {
 var leap = year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
 return leap ? 366 : 365;
}

Module["_dysize"] = _dysize;

function _stime(when) {
 ___setErrNo(63);
 return -1;
}

Module["_stime"] = _stime;

function ___map_file(pathname, size) {
 ___setErrNo(63);
 return -1;
}

Module["___map_file"] = ___map_file;

var __MONTH_DAYS_REGULAR = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

Module["__MONTH_DAYS_REGULAR"] = __MONTH_DAYS_REGULAR;

var __MONTH_DAYS_LEAP = [ 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

Module["__MONTH_DAYS_LEAP"] = __MONTH_DAYS_LEAP;

function __isLeapYear(year) {
 return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

Module["__isLeapYear"] = __isLeapYear;

function __arraySum(array, index) {
 var sum = 0;
 for (var i = 0; i <= index; sum += array[i++]) ;
 return sum;
}

Module["__arraySum"] = __arraySum;

function __addDays(date, days) {
 var newDate = new Date(date.getTime());
 while (days > 0) {
  var leap = __isLeapYear(newDate.getFullYear());
  var currentMonth = newDate.getMonth();
  var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
  if (days > daysInCurrentMonth - newDate.getDate()) {
   days -= daysInCurrentMonth - newDate.getDate() + 1;
   newDate.setDate(1);
   if (currentMonth < 11) {
    newDate.setMonth(currentMonth + 1);
   } else {
    newDate.setMonth(0);
    newDate.setFullYear(newDate.getFullYear() + 1);
   }
  } else {
   newDate.setDate(newDate.getDate() + days);
   return newDate;
  }
 }
 return newDate;
}

Module["__addDays"] = __addDays;

function _strftime(s, maxsize, format, tm) {
 var tm_zone = HEAP32[tm + 40 >> 2];
 var date = {
  tm_sec: HEAP32[tm >> 2],
  tm_min: HEAP32[tm + 4 >> 2],
  tm_hour: HEAP32[tm + 8 >> 2],
  tm_mday: HEAP32[tm + 12 >> 2],
  tm_mon: HEAP32[tm + 16 >> 2],
  tm_year: HEAP32[tm + 20 >> 2],
  tm_wday: HEAP32[tm + 24 >> 2],
  tm_yday: HEAP32[tm + 28 >> 2],
  tm_isdst: HEAP32[tm + 32 >> 2],
  tm_gmtoff: HEAP32[tm + 36 >> 2],
  tm_zone: tm_zone ? UTF8ToString(tm_zone) : ""
 };
 var pattern = UTF8ToString(format);
 var EXPANSION_RULES_1 = {
  "%c": "%a %b %d %H:%M:%S %Y",
  "%D": "%m/%d/%y",
  "%F": "%Y-%m-%d",
  "%h": "%b",
  "%r": "%I:%M:%S %p",
  "%R": "%H:%M",
  "%T": "%H:%M:%S",
  "%x": "%m/%d/%y",
  "%X": "%H:%M:%S",
  "%Ec": "%c",
  "%EC": "%C",
  "%Ex": "%m/%d/%y",
  "%EX": "%H:%M:%S",
  "%Ey": "%y",
  "%EY": "%Y",
  "%Od": "%d",
  "%Oe": "%e",
  "%OH": "%H",
  "%OI": "%I",
  "%Om": "%m",
  "%OM": "%M",
  "%OS": "%S",
  "%Ou": "%u",
  "%OU": "%U",
  "%OV": "%V",
  "%Ow": "%w",
  "%OW": "%W",
  "%Oy": "%y"
 };
 for (var rule in EXPANSION_RULES_1) {
  pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_1[rule]);
 }
 var WEEKDAYS = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
 var MONTHS = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
 function leadingSomething(value, digits, character) {
  var str = typeof value === "number" ? value.toString() : value || "";
  while (str.length < digits) {
   str = character[0] + str;
  }
  return str;
 }
 function leadingNulls(value, digits) {
  return leadingSomething(value, digits, "0");
 }
 function compareByDay(date1, date2) {
  function sgn(value) {
   return value < 0 ? -1 : value > 0 ? 1 : 0;
  }
  var compare;
  if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
   if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
    compare = sgn(date1.getDate() - date2.getDate());
   }
  }
  return compare;
 }
 function getFirstWeekStartDate(janFourth) {
  switch (janFourth.getDay()) {
  case 0:
   return new Date(janFourth.getFullYear() - 1, 11, 29);

  case 1:
   return janFourth;

  case 2:
   return new Date(janFourth.getFullYear(), 0, 3);

  case 3:
   return new Date(janFourth.getFullYear(), 0, 2);

  case 4:
   return new Date(janFourth.getFullYear(), 0, 1);

  case 5:
   return new Date(janFourth.getFullYear() - 1, 11, 31);

  case 6:
   return new Date(janFourth.getFullYear() - 1, 11, 30);
  }
 }
 function getWeekBasedYear(date) {
  var thisDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
  var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
  var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
  var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
  var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
   if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
    return thisDate.getFullYear() + 1;
   } else {
    return thisDate.getFullYear();
   }
  } else {
   return thisDate.getFullYear() - 1;
  }
 }
 var EXPANSION_RULES_2 = {
  "%a": function(date) {
   return WEEKDAYS[date.tm_wday].substring(0, 3);
  },
  "%A": function(date) {
   return WEEKDAYS[date.tm_wday];
  },
  "%b": function(date) {
   return MONTHS[date.tm_mon].substring(0, 3);
  },
  "%B": function(date) {
   return MONTHS[date.tm_mon];
  },
  "%C": function(date) {
   var year = date.tm_year + 1900;
   return leadingNulls(year / 100 | 0, 2);
  },
  "%d": function(date) {
   return leadingNulls(date.tm_mday, 2);
  },
  "%e": function(date) {
   return leadingSomething(date.tm_mday, 2, " ");
  },
  "%g": function(date) {
   return getWeekBasedYear(date).toString().substring(2);
  },
  "%G": function(date) {
   return getWeekBasedYear(date);
  },
  "%H": function(date) {
   return leadingNulls(date.tm_hour, 2);
  },
  "%I": function(date) {
   var twelveHour = date.tm_hour;
   if (twelveHour == 0) twelveHour = 12; else if (twelveHour > 12) twelveHour -= 12;
   return leadingNulls(twelveHour, 2);
  },
  "%j": function(date) {
   return leadingNulls(date.tm_mday + __arraySum(__isLeapYear(date.tm_year + 1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon - 1), 3);
  },
  "%m": function(date) {
   return leadingNulls(date.tm_mon + 1, 2);
  },
  "%M": function(date) {
   return leadingNulls(date.tm_min, 2);
  },
  "%n": function() {
   return "\n";
  },
  "%p": function(date) {
   if (date.tm_hour >= 0 && date.tm_hour < 12) {
    return "AM";
   } else {
    return "PM";
   }
  },
  "%S": function(date) {
   return leadingNulls(date.tm_sec, 2);
  },
  "%t": function() {
   return "\t";
  },
  "%u": function(date) {
   return date.tm_wday || 7;
  },
  "%U": function(date) {
   var janFirst = new Date(date.tm_year + 1900, 0, 1);
   var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7 - janFirst.getDay());
   var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
   if (compareByDay(firstSunday, endDate) < 0) {
    var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
    var firstSundayUntilEndJanuary = 31 - firstSunday.getDate();
    var days = firstSundayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
    return leadingNulls(Math.ceil(days / 7), 2);
   }
   return compareByDay(firstSunday, janFirst) === 0 ? "01" : "00";
  },
  "%V": function(date) {
   var janFourthThisYear = new Date(date.tm_year + 1900, 0, 4);
   var janFourthNextYear = new Date(date.tm_year + 1901, 0, 4);
   var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
   var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
   var endDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
   if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
    return "53";
   }
   if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
    return "01";
   }
   var daysDifference;
   if (firstWeekStartThisYear.getFullYear() < date.tm_year + 1900) {
    daysDifference = date.tm_yday + 32 - firstWeekStartThisYear.getDate();
   } else {
    daysDifference = date.tm_yday + 1 - firstWeekStartThisYear.getDate();
   }
   return leadingNulls(Math.ceil(daysDifference / 7), 2);
  },
  "%w": function(date) {
   return date.tm_wday;
  },
  "%W": function(date) {
   var janFirst = new Date(date.tm_year, 0, 1);
   var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7 - janFirst.getDay() + 1);
   var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
   if (compareByDay(firstMonday, endDate) < 0) {
    var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
    var firstMondayUntilEndJanuary = 31 - firstMonday.getDate();
    var days = firstMondayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
    return leadingNulls(Math.ceil(days / 7), 2);
   }
   return compareByDay(firstMonday, janFirst) === 0 ? "01" : "00";
  },
  "%y": function(date) {
   return (date.tm_year + 1900).toString().substring(2);
  },
  "%Y": function(date) {
   return date.tm_year + 1900;
  },
  "%z": function(date) {
   var off = date.tm_gmtoff;
   var ahead = off >= 0;
   off = Math.abs(off) / 60;
   off = off / 60 * 100 + off % 60;
   return (ahead ? "+" : "-") + String("0000" + off).slice(-4);
  },
  "%Z": function(date) {
   return date.tm_zone;
  },
  "%%": function() {
   return "%";
  }
 };
 for (var rule in EXPANSION_RULES_2) {
  if (pattern.indexOf(rule) >= 0) {
   pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_2[rule](date));
  }
 }
 var bytes = intArrayFromString(pattern, false);
 if (bytes.length > maxsize) {
  return 0;
 }
 writeArrayToMemory(bytes, s);
 return bytes.length - 1;
}

Module["_strftime"] = _strftime;

function _strftime_l(s, maxsize, format, tm) {
 return _strftime(s, maxsize, format, tm);
}

Module["_strftime_l"] = _strftime_l;

function _strptime(buf, format, tm) {
 var pattern = UTF8ToString(format);
 var SPECIAL_CHARS = "\\!@#$^&*()+=-[]/{}|:<>?,.";
 for (var i = 0, ii = SPECIAL_CHARS.length; i < ii; ++i) {
  pattern = pattern.replace(new RegExp("\\" + SPECIAL_CHARS[i], "g"), "\\" + SPECIAL_CHARS[i]);
 }
 var EQUIVALENT_MATCHERS = {
  "%A": "%a",
  "%B": "%b",
  "%c": "%a %b %d %H:%M:%S %Y",
  "%D": "%m\\/%d\\/%y",
  "%e": "%d",
  "%F": "%Y-%m-%d",
  "%h": "%b",
  "%R": "%H\\:%M",
  "%r": "%I\\:%M\\:%S\\s%p",
  "%T": "%H\\:%M\\:%S",
  "%x": "%m\\/%d\\/(?:%y|%Y)",
  "%X": "%H\\:%M\\:%S"
 };
 for (var matcher in EQUIVALENT_MATCHERS) {
  pattern = pattern.replace(matcher, EQUIVALENT_MATCHERS[matcher]);
 }
 var DATE_PATTERNS = {
  "%a": "(?:Sun(?:day)?)|(?:Mon(?:day)?)|(?:Tue(?:sday)?)|(?:Wed(?:nesday)?)|(?:Thu(?:rsday)?)|(?:Fri(?:day)?)|(?:Sat(?:urday)?)",
  "%b": "(?:Jan(?:uary)?)|(?:Feb(?:ruary)?)|(?:Mar(?:ch)?)|(?:Apr(?:il)?)|May|(?:Jun(?:e)?)|(?:Jul(?:y)?)|(?:Aug(?:ust)?)|(?:Sep(?:tember)?)|(?:Oct(?:ober)?)|(?:Nov(?:ember)?)|(?:Dec(?:ember)?)",
  "%C": "\\d\\d",
  "%d": "0[1-9]|[1-9](?!\\d)|1\\d|2\\d|30|31",
  "%H": "\\d(?!\\d)|[0,1]\\d|20|21|22|23",
  "%I": "\\d(?!\\d)|0\\d|10|11|12",
  "%j": "00[1-9]|0?[1-9](?!\\d)|0?[1-9]\\d(?!\\d)|[1,2]\\d\\d|3[0-6]\\d",
  "%m": "0[1-9]|[1-9](?!\\d)|10|11|12",
  "%M": "0\\d|\\d(?!\\d)|[1-5]\\d",
  "%n": "\\s",
  "%p": "AM|am|PM|pm|A\\.M\\.|a\\.m\\.|P\\.M\\.|p\\.m\\.",
  "%S": "0\\d|\\d(?!\\d)|[1-5]\\d|60",
  "%U": "0\\d|\\d(?!\\d)|[1-4]\\d|50|51|52|53",
  "%W": "0\\d|\\d(?!\\d)|[1-4]\\d|50|51|52|53",
  "%w": "[0-6]",
  "%y": "\\d\\d",
  "%Y": "\\d\\d\\d\\d",
  "%%": "%",
  "%t": "\\s"
 };
 var MONTH_NUMBERS = {
  JAN: 0,
  FEB: 1,
  MAR: 2,
  APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11
 };
 var DAY_NUMBERS_SUN_FIRST = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6
 };
 var DAY_NUMBERS_MON_FIRST = {
  MON: 0,
  TUE: 1,
  WED: 2,
  THU: 3,
  FRI: 4,
  SAT: 5,
  SUN: 6
 };
 for (var datePattern in DATE_PATTERNS) {
  pattern = pattern.replace(datePattern, "(" + datePattern + DATE_PATTERNS[datePattern] + ")");
 }
 var capture = [];
 for (var i = pattern.indexOf("%"); i >= 0; i = pattern.indexOf("%")) {
  capture.push(pattern[i + 1]);
  pattern = pattern.replace(new RegExp("\\%" + pattern[i + 1], "g"), "");
 }
 var matches = new RegExp("^" + pattern, "i").exec(UTF8ToString(buf));
 function initDate() {
  function fixup(value, min, max) {
   return typeof value !== "number" || isNaN(value) ? min : value >= min ? value <= max ? value : max : min;
  }
  return {
   year: fixup(HEAP32[tm + 20 >> 2] + 1900, 1970, 9999),
   month: fixup(HEAP32[tm + 16 >> 2], 0, 11),
   day: fixup(HEAP32[tm + 12 >> 2], 1, 31),
   hour: fixup(HEAP32[tm + 8 >> 2], 0, 23),
   min: fixup(HEAP32[tm + 4 >> 2], 0, 59),
   sec: fixup(HEAP32[tm >> 2], 0, 59)
  };
 }
 if (matches) {
  var date = initDate();
  var value;
  var getMatch = function(symbol) {
   var pos = capture.indexOf(symbol);
   if (pos >= 0) {
    return matches[pos + 1];
   }
   return;
  };
  if (value = getMatch("S")) {
   date.sec = parseInt(value);
  }
  if (value = getMatch("M")) {
   date.min = parseInt(value);
  }
  if (value = getMatch("H")) {
   date.hour = parseInt(value);
  } else if (value = getMatch("I")) {
   var hour = parseInt(value);
   if (value = getMatch("p")) {
    hour += value.toUpperCase()[0] === "P" ? 12 : 0;
   }
   date.hour = hour;
  }
  if (value = getMatch("Y")) {
   date.year = parseInt(value);
  } else if (value = getMatch("y")) {
   var year = parseInt(value);
   if (value = getMatch("C")) {
    year += parseInt(value) * 100;
   } else {
    year += year < 69 ? 2e3 : 1900;
   }
   date.year = year;
  }
  if (value = getMatch("m")) {
   date.month = parseInt(value) - 1;
  } else if (value = getMatch("b")) {
   date.month = MONTH_NUMBERS[value.substring(0, 3).toUpperCase()] || 0;
  }
  if (value = getMatch("d")) {
   date.day = parseInt(value);
  } else if (value = getMatch("j")) {
   var day = parseInt(value);
   var leapYear = __isLeapYear(date.year);
   for (var month = 0; month < 12; ++month) {
    var daysUntilMonth = __arraySum(leapYear ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, month - 1);
    if (day <= daysUntilMonth + (leapYear ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[month]) {
     date.day = day - daysUntilMonth;
    }
   }
  } else if (value = getMatch("a")) {
   var weekDay = value.substring(0, 3).toUpperCase();
   if (value = getMatch("U")) {
    var weekDayNumber = DAY_NUMBERS_SUN_FIRST[weekDay];
    var weekNumber = parseInt(value);
    var janFirst = new Date(date.year, 0, 1);
    var endDate;
    if (janFirst.getDay() === 0) {
     endDate = __addDays(janFirst, weekDayNumber + 7 * (weekNumber - 1));
    } else {
     endDate = __addDays(janFirst, 7 - janFirst.getDay() + weekDayNumber + 7 * (weekNumber - 1));
    }
    date.day = endDate.getDate();
    date.month = endDate.getMonth();
   } else if (value = getMatch("W")) {
    var weekDayNumber = DAY_NUMBERS_MON_FIRST[weekDay];
    var weekNumber = parseInt(value);
    var janFirst = new Date(date.year, 0, 1);
    var endDate;
    if (janFirst.getDay() === 1) {
     endDate = __addDays(janFirst, weekDayNumber + 7 * (weekNumber - 1));
    } else {
     endDate = __addDays(janFirst, 7 - janFirst.getDay() + 1 + weekDayNumber + 7 * (weekNumber - 1));
    }
    date.day = endDate.getDate();
    date.month = endDate.getMonth();
   }
  }
  var fullDate = new Date(date.year, date.month, date.day, date.hour, date.min, date.sec, 0);
  HEAP32[tm >> 2] = fullDate.getSeconds();
  HEAP32[tm + 4 >> 2] = fullDate.getMinutes();
  HEAP32[tm + 8 >> 2] = fullDate.getHours();
  HEAP32[tm + 12 >> 2] = fullDate.getDate();
  HEAP32[tm + 16 >> 2] = fullDate.getMonth();
  HEAP32[tm + 20 >> 2] = fullDate.getFullYear() - 1900;
  HEAP32[tm + 24 >> 2] = fullDate.getDay();
  HEAP32[tm + 28 >> 2] = __arraySum(__isLeapYear(fullDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, fullDate.getMonth() - 1) + fullDate.getDate() - 1;
  HEAP32[tm + 32 >> 2] = 0;
  return buf + intArrayFromString(matches[0]).length - 1;
 }
 return 0;
}

Module["_strptime"] = _strptime;

function _strptime_l(buf, format, tm) {
 return _strptime(buf, format, tm);
}

Module["_strptime_l"] = _strptime_l;

function _getdate(string) {
 return 0;
}

Module["_getdate"] = _getdate;

function _timespec_get(ts, base) {
 if (base !== 1) {
  ___setErrNo(28);
  return 0;
 }
 var ret = _clock_gettime(0, ts);
 return ret < 0 ? 0 : base;
}

Module["_timespec_get"] = _timespec_get;

function ___clock_gettime(a0, a1) {
 return _clock_gettime(a0, a1);
}

Module["___clock_gettime"] = ___clock_gettime;

function _clock_settime(clk_id, tp) {
 ___setErrNo(clk_id === 0 ? 63 : 28);
 return -1;
}

Module["_clock_settime"] = _clock_settime;

function _emscripten_get_now_res() {
 if (ENVIRONMENT_IS_NODE) {
  return 1;
 } else if (typeof dateNow !== "undefined") {
  return 1e3;
 } else return 1e3;
}

Module["_emscripten_get_now_res"] = _emscripten_get_now_res;

function _clock_getres(clk_id, res) {
 var nsec;
 if (clk_id === 0) {
  nsec = 1e3 * 1e3;
 } else if (clk_id === 1 && _emscripten_get_now_is_monotonic) {
  nsec = _emscripten_get_now_res();
 } else {
  ___setErrNo(28);
  return -1;
 }
 HEAP32[res >> 2] = nsec / 1e9 | 0;
 HEAP32[res + 4 >> 2] = nsec;
 return 0;
}

Module["_clock_getres"] = _clock_getres;

function _clock_getcpuclockid(pid, clk_id) {
 if (pid < 0) return 71;
 if (pid !== 0 && pid !== PROCINFO.pid) return 52;
 if (clk_id) HEAP32[clk_id >> 2] = 2;
 return 0;
}

Module["_clock_getcpuclockid"] = _clock_getcpuclockid;

function _gettimeofday(ptr) {
 var now = Date.now();
 HEAP32[ptr >> 2] = now / 1e3 | 0;
 HEAP32[ptr + 4 >> 2] = now % 1e3 * 1e3 | 0;
 return 0;
}

Module["_gettimeofday"] = _gettimeofday;

function _ftime(p) {
 var millis = Date.now();
 HEAP32[p >> 2] = millis / 1e3 | 0;
 HEAP16[p + 4 >> 1] = millis % 1e3;
 HEAP16[p + 6 >> 1] = 0;
 HEAP16[p + 8 >> 1] = 0;
 return 0;
}

Module["_ftime"] = _ftime;

function _times(buffer) {
 if (buffer !== 0) {
  _memset(buffer, 0, 16);
 }
 return 0;
}

Module["_times"] = _times;

function _makedev(maj, min) {
 return maj << 8 | min;
}

Module["_makedev"] = _makedev;

function _gnu_dev_makedev() {
 return _makedev.apply(null, arguments);
}

Module["_gnu_dev_makedev"] = _gnu_dev_makedev;

function _major(dev) {
 return dev >> 8;
}

Module["_major"] = _major;

function _gnu_dev_major() {
 return _major.apply(null, arguments);
}

Module["_gnu_dev_major"] = _gnu_dev_major;

function _minor(dev) {
 return dev & 255;
}

Module["_minor"] = _minor;

function _gnu_dev_minor() {
 return _minor.apply(null, arguments);
}

Module["_gnu_dev_minor"] = _gnu_dev_minor;

var setjmpId = 0;

Module["setjmpId"] = setjmpId;

function _realloc() {
 throw "bad realloc called";
}

Module["_realloc"] = _realloc;

function _saveSetjmp(env, label, table, size) {
 env = env | 0;
 label = label | 0;
 table = table | 0;
 size = size | 0;
 var i = 0;
 setjmpId = setjmpId + 1 | 0;
 HEAP32[env >> 2] = setjmpId;
 while ((i | 0) < (size | 0)) {
  if ((HEAP32[table + (i << 3) >> 2] | 0) == 0) {
   HEAP32[table + (i << 3) >> 2] = setjmpId;
   HEAP32[table + ((i << 3) + 4) >> 2] = label;
   HEAP32[table + ((i << 3) + 8) >> 2] = 0;
   setTempRet0(size | 0);
   return table | 0;
  }
  i = i + 1 | 0;
 }
 size = size * 2 | 0;
 table = _realloc(table | 0, 8 * (size + 1 | 0) | 0) | 0;
 table = _saveSetjmp(env | 0, label | 0, table | 0, size | 0) | 0;
 setTempRet0(size | 0);
 return table | 0;
}

Module["_saveSetjmp"] = _saveSetjmp;

function _testSetjmp(id, table, size) {
 id = id | 0;
 table = table | 0;
 size = size | 0;
 var i = 0, curr = 0;
 while ((i | 0) < (size | 0)) {
  curr = HEAP32[table + (i << 3) >> 2] | 0;
  if ((curr | 0) == 0) break;
  if ((curr | 0) == (id | 0)) {
   return HEAP32[table + ((i << 3) + 4) >> 2] | 0;
  }
  i = i + 1 | 0;
 }
 return 0;
}

Module["_testSetjmp"] = _testSetjmp;

function _longjmp(env, value) {
 _setThrew(env, value || 1);
 throw "longjmp";
}

Module["_longjmp"] = _longjmp;

function _emscripten_longjmp(env, value) {
 _longjmp(env, value);
}

Module["_emscripten_longjmp"] = _emscripten_longjmp;

function _wait(stat_loc) {
 ___setErrNo(12);
 return -1;
}

Module["_wait"] = _wait;

function _waitid() {
 return _wait.apply(null, arguments);
}

Module["_waitid"] = _waitid;

function _waitpid() {
 return _wait.apply(null, arguments);
}

Module["_waitpid"] = _waitpid;

function _wait3() {
 return _wait.apply(null, arguments);
}

Module["_wait3"] = _wait3;

function _wait4() {
 return _wait.apply(null, arguments);
}

Module["_wait4"] = _wait4;

function _sched_yield() {
 return 0;
}

Module["_sched_yield"] = _sched_yield;

function __inet_pton4_raw(str) {
 var b = str.split(".");
 for (var i = 0; i < 4; i++) {
  var tmp = Number(b[i]);
  if (isNaN(tmp)) return null;
  b[i] = tmp;
 }
 return (b[0] | b[1] << 8 | b[2] << 16 | b[3] << 24) >>> 0;
}

Module["__inet_pton4_raw"] = __inet_pton4_raw;

function _inet_addr(ptr) {
 var addr = __inet_pton4_raw(UTF8ToString(ptr));
 if (addr === null) {
  return -1;
 }
 return addr;
}

Module["_inet_addr"] = _inet_addr;

var _in6addr_any = 3760;

Module["_in6addr_any"] = _in6addr_any;

var _in6addr_loopback = 3776;

Module["_in6addr_loopback"] = _in6addr_loopback;

function __inet_ntop4_raw(addr) {
 return (addr & 255) + "." + (addr >> 8 & 255) + "." + (addr >> 16 & 255) + "." + (addr >> 24 & 255);
}

Module["__inet_ntop4_raw"] = __inet_ntop4_raw;

function _htons() {
 if (!Module["_htons"]) abort("external function 'htons' is missing. perhaps a side module was not linked in? if this function was expected to arrive from a system library, try to build the MAIN_MODULE with EMCC_FORCE_STDLIBS=1 in the environment");
 return Module["_htons"].apply(null, arguments);
}

function _ntohs() {
 if (!Module["_ntohs"]) abort("external function 'ntohs' is missing. perhaps a side module was not linked in? if this function was expected to arrive from a system library, try to build the MAIN_MODULE with EMCC_FORCE_STDLIBS=1 in the environment");
 return Module["_ntohs"].apply(null, arguments);
}

function __inet_pton6_raw(str) {
 var words;
 var w, offset, z;
 var valid6regx = /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i;
 var parts = [];
 if (!valid6regx.test(str)) {
  return null;
 }
 if (str === "::") {
  return [ 0, 0, 0, 0, 0, 0, 0, 0 ];
 }
 if (str.indexOf("::") === 0) {
  str = str.replace("::", "Z:");
 } else {
  str = str.replace("::", ":Z:");
 }
 if (str.indexOf(".") > 0) {
  str = str.replace(new RegExp("[.]", "g"), ":");
  words = str.split(":");
  words[words.length - 4] = parseInt(words[words.length - 4]) + parseInt(words[words.length - 3]) * 256;
  words[words.length - 3] = parseInt(words[words.length - 2]) + parseInt(words[words.length - 1]) * 256;
  words = words.slice(0, words.length - 2);
 } else {
  words = str.split(":");
 }
 offset = 0;
 z = 0;
 for (w = 0; w < words.length; w++) {
  if (typeof words[w] === "string") {
   if (words[w] === "Z") {
    for (z = 0; z < 8 - words.length + 1; z++) {
     parts[w + z] = 0;
    }
    offset = z - 1;
   } else {
    parts[w + offset] = _htons(parseInt(words[w], 16));
   }
  } else {
   parts[w + offset] = words[w];
  }
 }
 return [ parts[1] << 16 | parts[0], parts[3] << 16 | parts[2], parts[5] << 16 | parts[4], parts[7] << 16 | parts[6] ];
}

Module["__inet_pton6_raw"] = __inet_pton6_raw;

function __inet_pton6(src, dst) {
 var ints = __inet_pton6_raw(UTF8ToString(src));
 if (ints === null) {
  return 0;
 }
 for (var i = 0; i < 4; i++) {
  HEAP32[dst + i * 4 >> 2] = ints[i];
 }
 return 1;
}

Module["__inet_pton6"] = __inet_pton6;

function __inet_ntop6_raw(ints) {
 var str = "";
 var word = 0;
 var longest = 0;
 var lastzero = 0;
 var zstart = 0;
 var len = 0;
 var i = 0;
 var parts = [ ints[0] & 65535, ints[0] >> 16, ints[1] & 65535, ints[1] >> 16, ints[2] & 65535, ints[2] >> 16, ints[3] & 65535, ints[3] >> 16 ];
 var hasipv4 = true;
 var v4part = "";
 for (i = 0; i < 5; i++) {
  if (parts[i] !== 0) {
   hasipv4 = false;
   break;
  }
 }
 if (hasipv4) {
  v4part = __inet_ntop4_raw(parts[6] | parts[7] << 16);
  if (parts[5] === -1) {
   str = "::ffff:";
   str += v4part;
   return str;
  }
  if (parts[5] === 0) {
   str = "::";
   if (v4part === "0.0.0.0") v4part = "";
   if (v4part === "0.0.0.1") v4part = "1";
   str += v4part;
   return str;
  }
 }
 for (word = 0; word < 8; word++) {
  if (parts[word] === 0) {
   if (word - lastzero > 1) {
    len = 0;
   }
   lastzero = word;
   len++;
  }
  if (len > longest) {
   longest = len;
   zstart = word - longest + 1;
  }
 }
 for (word = 0; word < 8; word++) {
  if (longest > 1) {
   if (parts[word] === 0 && word >= zstart && word < zstart + longest) {
    if (word === zstart) {
     str += ":";
     if (zstart === 0) str += ":";
    }
    continue;
   }
  }
  str += Number(_ntohs(parts[word] & 65535)).toString(16);
  str += word < 7 ? ":" : "";
 }
 return str;
}

Module["__inet_ntop6_raw"] = __inet_ntop6_raw;

var Sockets = {
 BUFFER_SIZE: 10240,
 MAX_BUFFER_SIZE: 10485760,
 nextFd: 1,
 fds: {},
 nextport: 1,
 maxport: 65535,
 peer: null,
 connections: {},
 portmap: {},
 localAddr: 4261412874,
 addrPool: [ 33554442, 50331658, 67108874, 83886090, 100663306, 117440522, 134217738, 150994954, 167772170, 184549386, 201326602, 218103818, 234881034 ]
};

Module["Sockets"] = Sockets;

function __read_sockaddr(sa, salen) {
 var family = HEAP16[sa >> 1];
 var port = _ntohs(HEAPU16[sa + 2 >> 1]);
 var addr;
 switch (family) {
 case 2:
  if (salen !== 16) {
   return {
    errno: 28
   };
  }
  addr = HEAP32[sa + 4 >> 2];
  addr = __inet_ntop4_raw(addr);
  break;

 case 10:
  if (salen !== 28) {
   return {
    errno: 28
   };
  }
  addr = [ HEAP32[sa + 8 >> 2], HEAP32[sa + 12 >> 2], HEAP32[sa + 16 >> 2], HEAP32[sa + 20 >> 2] ];
  addr = __inet_ntop6_raw(addr);
  break;

 default:
  return {
   errno: 5
  };
 }
 return {
  family: family,
  addr: addr,
  port: port
 };
}

Module["__read_sockaddr"] = __read_sockaddr;

function __write_sockaddr(sa, family, addr, port) {
 switch (family) {
 case 2:
  addr = __inet_pton4_raw(addr);
  HEAP16[sa >> 1] = family;
  HEAP32[sa + 4 >> 2] = addr;
  HEAP16[sa + 2 >> 1] = _htons(port);
  break;

 case 10:
  addr = __inet_pton6_raw(addr);
  HEAP32[sa >> 2] = family;
  HEAP32[sa + 8 >> 2] = addr[0];
  HEAP32[sa + 12 >> 2] = addr[1];
  HEAP32[sa + 16 >> 2] = addr[2];
  HEAP32[sa + 20 >> 2] = addr[3];
  HEAP16[sa + 2 >> 1] = _htons(port);
  HEAP32[sa + 4 >> 2] = 0;
  HEAP32[sa + 24 >> 2] = 0;
  break;

 default:
  return {
   errno: 5
  };
 }
 return {};
}

Module["__write_sockaddr"] = __write_sockaddr;

var DNS = {
 address_map: {
  id: 1,
  addrs: {},
  names: {}
 },
 lookup_name: function(name) {
  var res = __inet_pton4_raw(name);
  if (res !== null) {
   return name;
  }
  res = __inet_pton6_raw(name);
  if (res !== null) {
   return name;
  }
  var addr;
  if (DNS.address_map.addrs[name]) {
   addr = DNS.address_map.addrs[name];
  } else {
   var id = DNS.address_map.id++;
   assert(id < 65535, "exceeded max address mappings of 65535");
   addr = "172.29." + (id & 255) + "." + (id & 65280);
   DNS.address_map.names[addr] = name;
   DNS.address_map.addrs[name] = addr;
  }
  return addr;
 },
 lookup_addr: function(addr) {
  if (DNS.address_map.names[addr]) {
   return DNS.address_map.names[addr];
  }
  return null;
 }
};

Module["DNS"] = DNS;

function _gethostbyname(name) {
 name = UTF8ToString(name);
 var ret = _malloc(20);
 var nameBuf = _malloc(name.length + 1);
 stringToUTF8(name, nameBuf, name.length + 1);
 HEAP32[ret >> 2] = nameBuf;
 var aliasesBuf = _malloc(4);
 HEAP32[aliasesBuf >> 2] = 0;
 HEAP32[ret + 4 >> 2] = aliasesBuf;
 var afinet = 2;
 HEAP32[ret + 8 >> 2] = afinet;
 HEAP32[ret + 12 >> 2] = 4;
 var addrListBuf = _malloc(12);
 HEAP32[addrListBuf >> 2] = addrListBuf + 8;
 HEAP32[addrListBuf + 4 >> 2] = 0;
 HEAP32[addrListBuf + 8 >> 2] = __inet_pton4_raw(DNS.lookup_name(name));
 HEAP32[ret + 16 >> 2] = addrListBuf;
 return ret;
}

Module["_gethostbyname"] = _gethostbyname;

function _gethostbyaddr(addr, addrlen, type) {
 if (type !== 2) {
  ___setErrNo(5);
  return null;
 }
 addr = HEAP32[addr >> 2];
 var host = __inet_ntop4_raw(addr);
 var lookup = DNS.lookup_addr(host);
 if (lookup) {
  host = lookup;
 }
 var hostp = allocate(intArrayFromString(host), "i8", ALLOC_STACK);
 return _gethostbyname(hostp);
}

Module["_gethostbyaddr"] = _gethostbyaddr;

function _gethostbyname_r(name, ret, buf, buflen, out, err) {
 var data = _gethostbyname(name);
 _memcpy(ret, data, 20);
 _free(data);
 HEAP32[err >> 2] = 0;
 HEAP32[out >> 2] = ret;
 return 0;
}

Module["_gethostbyname_r"] = _gethostbyname_r;

function _getaddrinfo(node, service, hint, out) {
 var addr = 0;
 var port = 0;
 var flags = 0;
 var family = 0;
 var type = 0;
 var proto = 0;
 var ai;
 function allocaddrinfo(family, type, proto, canon, addr, port) {
  var sa, salen, ai;
  var res;
  salen = family === 10 ? 28 : 16;
  addr = family === 10 ? __inet_ntop6_raw(addr) : __inet_ntop4_raw(addr);
  sa = _malloc(salen);
  res = __write_sockaddr(sa, family, addr, port);
  assert(!res.errno);
  ai = _malloc(32);
  HEAP32[ai + 4 >> 2] = family;
  HEAP32[ai + 8 >> 2] = type;
  HEAP32[ai + 12 >> 2] = proto;
  HEAP32[ai + 24 >> 2] = canon;
  HEAP32[ai + 20 >> 2] = sa;
  if (family === 10) {
   HEAP32[ai + 16 >> 2] = 28;
  } else {
   HEAP32[ai + 16 >> 2] = 16;
  }
  HEAP32[ai + 28 >> 2] = 0;
  return ai;
 }
 if (hint) {
  flags = HEAP32[hint >> 2];
  family = HEAP32[hint + 4 >> 2];
  type = HEAP32[hint + 8 >> 2];
  proto = HEAP32[hint + 12 >> 2];
 }
 if (type && !proto) {
  proto = type === 2 ? 17 : 6;
 }
 if (!type && proto) {
  type = proto === 17 ? 2 : 1;
 }
 if (proto === 0) {
  proto = 6;
 }
 if (type === 0) {
  type = 1;
 }
 if (!node && !service) {
  return -2;
 }
 if (flags & ~(1 | 2 | 4 | 1024 | 8 | 16 | 32)) {
  return -1;
 }
 if (hint !== 0 && HEAP32[hint >> 2] & 2 && !node) {
  return -1;
 }
 if (flags & 32) {
  return -2;
 }
 if (type !== 0 && type !== 1 && type !== 2) {
  return -7;
 }
 if (family !== 0 && family !== 2 && family !== 10) {
  return -6;
 }
 if (service) {
  service = UTF8ToString(service);
  port = parseInt(service, 10);
  if (isNaN(port)) {
   if (flags & 1024) {
    return -2;
   }
   return -8;
  }
 }
 if (!node) {
  if (family === 0) {
   family = 2;
  }
  if ((flags & 1) === 0) {
   if (family === 2) {
    addr = _htonl(2130706433);
   } else {
    addr = [ 0, 0, 0, 1 ];
   }
  }
  ai = allocaddrinfo(family, type, proto, null, addr, port);
  HEAP32[out >> 2] = ai;
  return 0;
 }
 node = UTF8ToString(node);
 addr = __inet_pton4_raw(node);
 if (addr !== null) {
  if (family === 0 || family === 2) {
   family = 2;
  } else if (family === 10 && flags & 8) {
   addr = [ 0, 0, _htonl(65535), addr ];
   family = 10;
  } else {
   return -2;
  }
 } else {
  addr = __inet_pton6_raw(node);
  if (addr !== null) {
   if (family === 0 || family === 10) {
    family = 10;
   } else {
    return -2;
   }
  }
 }
 if (addr != null) {
  ai = allocaddrinfo(family, type, proto, node, addr, port);
  HEAP32[out >> 2] = ai;
  return 0;
 }
 if (flags & 4) {
  return -2;
 }
 node = DNS.lookup_name(node);
 addr = __inet_pton4_raw(node);
 if (family === 0) {
  family = 2;
 } else if (family === 10) {
  addr = [ 0, 0, _htonl(65535), addr ];
 }
 ai = allocaddrinfo(family, type, proto, null, addr, port);
 HEAP32[out >> 2] = ai;
 return 0;
}

Module["_getaddrinfo"] = _getaddrinfo;

function _getnameinfo(sa, salen, node, nodelen, serv, servlen, flags) {
 var info = __read_sockaddr(sa, salen);
 if (info.errno) {
  return -6;
 }
 var port = info.port;
 var addr = info.addr;
 var overflowed = false;
 if (node && nodelen) {
  var lookup;
  if (flags & 1 || !(lookup = DNS.lookup_addr(addr))) {
   if (flags & 8) {
    return -2;
   }
  } else {
   addr = lookup;
  }
  var numBytesWrittenExclNull = stringToUTF8(addr, node, nodelen);
  if (numBytesWrittenExclNull + 1 >= nodelen) {
   overflowed = true;
  }
 }
 if (serv && servlen) {
  port = "" + port;
  var numBytesWrittenExclNull = stringToUTF8(port, serv, servlen);
  if (numBytesWrittenExclNull + 1 >= servlen) {
   overflowed = true;
  }
 }
 if (overflowed) {
  return -12;
 }
 return 0;
}

Module["_getnameinfo"] = _getnameinfo;

var GAI_ERRNO_MESSAGES = {};

Module["GAI_ERRNO_MESSAGES"] = GAI_ERRNO_MESSAGES;

function _gai_strerror(val) {
 var buflen = 256;
 if (!_gai_strerror.buffer) {
  _gai_strerror.buffer = _malloc(buflen);
  GAI_ERRNO_MESSAGES["0"] = "Success";
  GAI_ERRNO_MESSAGES["" + -1] = "Invalid value for 'ai_flags' field";
  GAI_ERRNO_MESSAGES["" + -2] = "NAME or SERVICE is unknown";
  GAI_ERRNO_MESSAGES["" + -3] = "Temporary failure in name resolution";
  GAI_ERRNO_MESSAGES["" + -4] = "Non-recoverable failure in name res";
  GAI_ERRNO_MESSAGES["" + -6] = "'ai_family' not supported";
  GAI_ERRNO_MESSAGES["" + -7] = "'ai_socktype' not supported";
  GAI_ERRNO_MESSAGES["" + -8] = "SERVICE not supported for 'ai_socktype'";
  GAI_ERRNO_MESSAGES["" + -10] = "Memory allocation failure";
  GAI_ERRNO_MESSAGES["" + -11] = "System error returned in 'errno'";
  GAI_ERRNO_MESSAGES["" + -12] = "Argument buffer overflow";
 }
 var msg = "Unknown error";
 if (val in GAI_ERRNO_MESSAGES) {
  if (GAI_ERRNO_MESSAGES[val].length > buflen - 1) {
   msg = "Message too long";
  } else {
   msg = GAI_ERRNO_MESSAGES[val];
  }
 }
 writeAsciiToMemory(msg, _gai_strerror.buffer);
 return _gai_strerror.buffer;
}

Module["_gai_strerror"] = _gai_strerror;

var Protocols = {
 list: [],
 map: {}
};

Module["Protocols"] = Protocols;

function _setprotoent(stayopen) {
 function allocprotoent(name, proto, aliases) {
  var nameBuf = _malloc(name.length + 1);
  writeAsciiToMemory(name, nameBuf);
  var j = 0;
  var length = aliases.length;
  var aliasListBuf = _malloc((length + 1) * 4);
  for (var i = 0; i < length; i++, j += 4) {
   var alias = aliases[i];
   var aliasBuf = _malloc(alias.length + 1);
   writeAsciiToMemory(alias, aliasBuf);
   HEAP32[aliasListBuf + j >> 2] = aliasBuf;
  }
  HEAP32[aliasListBuf + j >> 2] = 0;
  var pe = _malloc(12);
  HEAP32[pe >> 2] = nameBuf;
  HEAP32[pe + 4 >> 2] = aliasListBuf;
  HEAP32[pe + 8 >> 2] = proto;
  return pe;
 }
 var list = Protocols.list;
 var map = Protocols.map;
 if (list.length === 0) {
  var entry = allocprotoent("tcp", 6, [ "TCP" ]);
  list.push(entry);
  map["tcp"] = map["6"] = entry;
  entry = allocprotoent("udp", 17, [ "UDP" ]);
  list.push(entry);
  map["udp"] = map["17"] = entry;
 }
 _setprotoent.index = 0;
}

Module["_setprotoent"] = _setprotoent;

function _endprotoent() {}

Module["_endprotoent"] = _endprotoent;

function _getprotoent(number) {
 if (_setprotoent.index === Protocols.list.length) {
  return 0;
 } else {
  var result = Protocols.list[_setprotoent.index++];
  return result;
 }
}

Module["_getprotoent"] = _getprotoent;

function _getprotobyname(name) {
 name = UTF8ToString(name);
 _setprotoent(true);
 var result = Protocols.map[name];
 return result;
}

Module["_getprotobyname"] = _getprotobyname;

function _getprotobynumber(number) {
 _setprotoent(true);
 var result = Protocols.map[number];
 return result;
}

Module["_getprotobynumber"] = _getprotobynumber;

function _getpwnam() {
 throw "getpwnam: TODO";
}

Module["_getpwnam"] = _getpwnam;

function _getpwnam_r() {
 throw "getpwnam_r: TODO";
}

Module["_getpwnam_r"] = _getpwnam_r;

function _getpwuid_r() {
 throw "getpwuid_r: TODO";
}

Module["_getpwuid_r"] = _getpwuid_r;

function _setpwent() {
 throw "setpwent: TODO";
}

Module["_setpwent"] = _setpwent;

function _getpwent() {
 throw "getpwent: TODO";
}

Module["_getpwent"] = _getpwent;

function _endpwent() {
 throw "endpwent: TODO";
}

Module["_endpwent"] = _endpwent;

function _getgrgid() {
 throw "getgrgid: TODO";
}

Module["_getgrgid"] = _getgrgid;

function _getgrgid_r() {
 throw "getgrgid_r: TODO";
}

Module["_getgrgid_r"] = _getgrgid_r;

function _getgrnam() {
 throw "getgrnam: TODO";
}

Module["_getgrnam"] = _getgrnam;

function _getgrnam_r() {
 throw "getgrnam_r: TODO";
}

Module["_getgrnam_r"] = _getgrnam_r;

function _getgrent() {
 throw "getgrent: TODO";
}

Module["_getgrent"] = _getgrent;

function _endgrent() {
 throw "endgrent: TODO";
}

Module["_endgrent"] = _endgrent;

function _setgrent() {
 throw "setgrent: TODO";
}

Module["_setgrent"] = _setgrent;

function _emscripten_run_script(ptr) {
 eval(UTF8ToString(ptr));
}

Module["_emscripten_run_script"] = _emscripten_run_script;

function _emscripten_run_script_int(ptr) {
 return eval(UTF8ToString(ptr)) | 0;
}

Module["_emscripten_run_script_int"] = _emscripten_run_script_int;

function _emscripten_run_script_string(ptr) {
 var s = eval(UTF8ToString(ptr));
 if (s == null) {
  return 0;
 }
 s += "";
 var me = _emscripten_run_script_string;
 var len = lengthBytesUTF8(s);
 if (!me.bufferSize || me.bufferSize < len + 1) {
  if (me.bufferSize) _free(me.buffer);
  me.bufferSize = len + 1;
  me.buffer = _malloc(me.bufferSize);
 }
 stringToUTF8(s, me.buffer, me.bufferSize);
 return me.buffer;
}

Module["_emscripten_run_script_string"] = _emscripten_run_script_string;

function _emscripten_random() {
 return Math.random();
}

Module["_emscripten_random"] = _emscripten_random;

function __emscripten_traverse_stack(args) {
 if (!args || !args.callee || !args.callee.name) {
  return [ null, "", "" ];
 }
 var funstr = args.callee.toString();
 var funcname = args.callee.name;
 var str = "(";
 var first = true;
 for (var i in args) {
  var a = args[i];
  if (!first) {
   str += ", ";
  }
  first = false;
  if (typeof a === "number" || typeof a === "string") {
   str += a;
  } else {
   str += "(" + typeof a + ")";
  }
 }
 str += ")";
 var caller = args.callee.caller;
 args = caller ? caller.arguments : [];
 if (first) str = "";
 return [ args, funcname, str ];
}

Module["__emscripten_traverse_stack"] = __emscripten_traverse_stack;

function _emscripten_get_callstack_js(flags) {
 var callstack = jsStackTrace();
 var iThisFunc = callstack.lastIndexOf("_emscripten_log");
 var iThisFunc2 = callstack.lastIndexOf("_emscripten_get_callstack");
 var iNextLine = callstack.indexOf("\n", Math.max(iThisFunc, iThisFunc2)) + 1;
 callstack = callstack.slice(iNextLine);
 if (flags & 8 && typeof emscripten_source_map === "undefined") {
  warnOnce('Source map information is not available, emscripten_log with EM_LOG_C_STACK will be ignored. Build with "--pre-js $EMSCRIPTEN/src/emscripten-source-map.min.js" linker flag to add source map loading to code.');
  flags ^= 8;
  flags |= 16;
 }
 var stack_args = null;
 if (flags & 128) {
  stack_args = __emscripten_traverse_stack(arguments);
  while (stack_args[1].indexOf("_emscripten_") >= 0) stack_args = __emscripten_traverse_stack(stack_args[0]);
 }
 var lines = callstack.split("\n");
 callstack = "";
 var newFirefoxRe = new RegExp("\\s*(.*?)@(.*?):([0-9]+):([0-9]+)");
 var firefoxRe = new RegExp("\\s*(.*?)@(.*):(.*)(:(.*))?");
 var chromeRe = new RegExp("\\s*at (.*?) \\((.*):(.*):(.*)\\)");
 for (var l in lines) {
  var line = lines[l];
  var jsSymbolName = "";
  var file = "";
  var lineno = 0;
  var column = 0;
  var parts = chromeRe.exec(line);
  if (parts && parts.length == 5) {
   jsSymbolName = parts[1];
   file = parts[2];
   lineno = parts[3];
   column = parts[4];
  } else {
   parts = newFirefoxRe.exec(line);
   if (!parts) parts = firefoxRe.exec(line);
   if (parts && parts.length >= 4) {
    jsSymbolName = parts[1];
    file = parts[2];
    lineno = parts[3];
    column = parts[4] | 0;
   } else {
    callstack += line + "\n";
    continue;
   }
  }
  var cSymbolName = flags & 32 ? demangle(jsSymbolName) : jsSymbolName;
  if (!cSymbolName) {
   cSymbolName = jsSymbolName;
  }
  var haveSourceMap = false;
  if (flags & 8) {
   var orig = emscripten_source_map.originalPositionFor({
    line: lineno,
    column: column
   });
   haveSourceMap = orig && orig.source;
   if (haveSourceMap) {
    if (flags & 64) {
     orig.source = orig.source.substring(orig.source.replace(/\\/g, "/").lastIndexOf("/") + 1);
    }
    callstack += "    at " + cSymbolName + " (" + orig.source + ":" + orig.line + ":" + orig.column + ")\n";
   }
  }
  if (flags & 16 || !haveSourceMap) {
   if (flags & 64) {
    file = file.substring(file.replace(/\\/g, "/").lastIndexOf("/") + 1);
   }
   callstack += (haveSourceMap ? "     = " + jsSymbolName : "    at " + cSymbolName) + " (" + file + ":" + lineno + ":" + column + ")\n";
  }
  if (flags & 128 && stack_args[0]) {
   if (stack_args[1] == jsSymbolName && stack_args[2].length > 0) {
    callstack = callstack.replace(/\s+$/, "");
    callstack += " with values: " + stack_args[1] + stack_args[2] + "\n";
   }
   stack_args = __emscripten_traverse_stack(stack_args[0]);
  }
 }
 callstack = callstack.replace(/\s+$/, "");
 return callstack;
}

Module["_emscripten_get_callstack_js"] = _emscripten_get_callstack_js;

function _emscripten_get_callstack(flags, str, maxbytes) {
 var callstack = _emscripten_get_callstack_js(flags);
 if (!str || maxbytes <= 0) {
  return lengthBytesUTF8(callstack) + 1;
 }
 var bytesWrittenExcludingNull = stringToUTF8(callstack, str, maxbytes);
 return bytesWrittenExcludingNull + 1;
}

Module["_emscripten_get_callstack"] = _emscripten_get_callstack;

function _emscripten_log_js(flags, str) {
 if (flags & 24) {
  str = str.replace(/\s+$/, "");
  str += (str.length > 0 ? "\n" : "") + _emscripten_get_callstack_js(flags);
 }
 if (flags & 1) {
  if (flags & 4) {
   console.error(str);
  } else if (flags & 2) {
   console.warn(str);
  } else {
   console.log(str);
  }
 } else if (flags & 6) {
  err(str);
 } else {
  out(str);
 }
}

Module["_emscripten_log_js"] = _emscripten_log_js;

function __formatString(format, varargs) {
 assert((varargs & 3) === 0);
 var textIndex = format;
 var argIndex = varargs;
 function prepVararg(ptr, type) {
  if (type === "double" || type === "i64") {
   if (ptr & 7) {
    assert((ptr & 7) === 4);
    ptr += 4;
   }
  } else {
   assert((ptr & 3) === 0);
  }
  return ptr;
 }
 function getNextArg(type) {
  var ret;
  argIndex = prepVararg(argIndex, type);
  if (type === "double") {
   ret = HEAPF64[argIndex >> 3];
   argIndex += 8;
  } else if (type == "i64") {
   ret = [ HEAP32[argIndex >> 2], HEAP32[argIndex + 4 >> 2] ];
   argIndex += 8;
  } else {
   assert((argIndex & 3) === 0);
   type = "i32";
   ret = HEAP32[argIndex >> 2];
   argIndex += 4;
  }
  return ret;
 }
 var ret = [];
 var curr, next, currArg;
 while (1) {
  var startTextIndex = textIndex;
  curr = HEAP8[textIndex >> 0];
  if (curr === 0) break;
  next = HEAP8[textIndex + 1 >> 0];
  if (curr == 37) {
   var flagAlwaysSigned = false;
   var flagLeftAlign = false;
   var flagAlternative = false;
   var flagZeroPad = false;
   var flagPadSign = false;
   flagsLoop: while (1) {
    switch (next) {
    case 43:
     flagAlwaysSigned = true;
     break;

    case 45:
     flagLeftAlign = true;
     break;

    case 35:
     flagAlternative = true;
     break;

    case 48:
     if (flagZeroPad) {
      break flagsLoop;
     } else {
      flagZeroPad = true;
      break;
     }

    case 32:
     flagPadSign = true;
     break;

    default:
     break flagsLoop;
    }
    textIndex++;
    next = HEAP8[textIndex + 1 >> 0];
   }
   var width = 0;
   if (next == 42) {
    width = getNextArg("i32");
    textIndex++;
    next = HEAP8[textIndex + 1 >> 0];
   } else {
    while (next >= 48 && next <= 57) {
     width = width * 10 + (next - 48);
     textIndex++;
     next = HEAP8[textIndex + 1 >> 0];
    }
   }
   var precisionSet = false, precision = -1;
   if (next == 46) {
    precision = 0;
    precisionSet = true;
    textIndex++;
    next = HEAP8[textIndex + 1 >> 0];
    if (next == 42) {
     precision = getNextArg("i32");
     textIndex++;
    } else {
     while (1) {
      var precisionChr = HEAP8[textIndex + 1 >> 0];
      if (precisionChr < 48 || precisionChr > 57) break;
      precision = precision * 10 + (precisionChr - 48);
      textIndex++;
     }
    }
    next = HEAP8[textIndex + 1 >> 0];
   }
   if (precision < 0) {
    precision = 6;
    precisionSet = false;
   }
   var argSize;
   switch (String.fromCharCode(next)) {
   case "h":
    var nextNext = HEAP8[textIndex + 2 >> 0];
    if (nextNext == 104) {
     textIndex++;
     argSize = 1;
    } else {
     argSize = 2;
    }
    break;

   case "l":
    var nextNext = HEAP8[textIndex + 2 >> 0];
    if (nextNext == 108) {
     textIndex++;
     argSize = 8;
    } else {
     argSize = 4;
    }
    break;

   case "L":
   case "q":
   case "j":
    argSize = 8;
    break;

   case "z":
   case "t":
   case "I":
    argSize = 4;
    break;

   default:
    argSize = null;
   }
   if (argSize) textIndex++;
   next = HEAP8[textIndex + 1 >> 0];
   switch (String.fromCharCode(next)) {
   case "d":
   case "i":
   case "u":
   case "o":
   case "x":
   case "X":
   case "p":
    {
     var signed = next == 100 || next == 105;
     argSize = argSize || 4;
     currArg = getNextArg("i" + argSize * 8);
     var argText;
     if (argSize == 8) {
      currArg = makeBigInt(currArg[0], currArg[1], next == 117);
     }
     if (argSize <= 4) {
      var limit = Math.pow(256, argSize) - 1;
      currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
     }
     var currAbsArg = Math.abs(currArg);
     var prefix = "";
     if (next == 100 || next == 105) {
      argText = reSign(currArg, 8 * argSize, 1).toString(10);
     } else if (next == 117) {
      argText = unSign(currArg, 8 * argSize, 1).toString(10);
      currArg = Math.abs(currArg);
     } else if (next == 111) {
      argText = (flagAlternative ? "0" : "") + currAbsArg.toString(8);
     } else if (next == 120 || next == 88) {
      prefix = flagAlternative && currArg != 0 ? "0x" : "";
      if (currArg < 0) {
       currArg = -currArg;
       argText = (currAbsArg - 1).toString(16);
       var buffer = [];
       for (var i = 0; i < argText.length; i++) {
        buffer.push((15 - parseInt(argText[i], 16)).toString(16));
       }
       argText = buffer.join("");
       while (argText.length < argSize * 2) argText = "f" + argText;
      } else {
       argText = currAbsArg.toString(16);
      }
      if (next == 88) {
       prefix = prefix.toUpperCase();
       argText = argText.toUpperCase();
      }
     } else if (next == 112) {
      if (currAbsArg === 0) {
       argText = "(nil)";
      } else {
       prefix = "0x";
       argText = currAbsArg.toString(16);
      }
     }
     if (precisionSet) {
      while (argText.length < precision) {
       argText = "0" + argText;
      }
     }
     if (currArg >= 0) {
      if (flagAlwaysSigned) {
       prefix = "+" + prefix;
      } else if (flagPadSign) {
       prefix = " " + prefix;
      }
     }
     if (argText.charAt(0) == "-") {
      prefix = "-" + prefix;
      argText = argText.substr(1);
     }
     while (prefix.length + argText.length < width) {
      if (flagLeftAlign) {
       argText += " ";
      } else {
       if (flagZeroPad) {
        argText = "0" + argText;
       } else {
        prefix = " " + prefix;
       }
      }
     }
     argText = prefix + argText;
     argText.split("").forEach(function(chr) {
      ret.push(chr.charCodeAt(0));
     });
     break;
    }

   case "f":
   case "F":
   case "e":
   case "E":
   case "g":
   case "G":
    {
     currArg = getNextArg("double");
     var argText;
     if (isNaN(currArg)) {
      argText = "nan";
      flagZeroPad = false;
     } else if (!isFinite(currArg)) {
      argText = (currArg < 0 ? "-" : "") + "inf";
      flagZeroPad = false;
     } else {
      var isGeneral = false;
      var effectivePrecision = Math.min(precision, 20);
      if (next == 103 || next == 71) {
       isGeneral = true;
       precision = precision || 1;
       var exponent = parseInt(currArg.toExponential(effectivePrecision).split("e")[1], 10);
       if (precision > exponent && exponent >= -4) {
        next = (next == 103 ? "f" : "F").charCodeAt(0);
        precision -= exponent + 1;
       } else {
        next = (next == 103 ? "e" : "E").charCodeAt(0);
        precision--;
       }
       effectivePrecision = Math.min(precision, 20);
      }
      if (next == 101 || next == 69) {
       argText = currArg.toExponential(effectivePrecision);
       if (/[eE][-+]\d$/.test(argText)) {
        argText = argText.slice(0, -1) + "0" + argText.slice(-1);
       }
      } else if (next == 102 || next == 70) {
       argText = currArg.toFixed(effectivePrecision);
       if (currArg === 0 && __reallyNegative(currArg)) {
        argText = "-" + argText;
       }
      }
      var parts = argText.split("e");
      if (isGeneral && !flagAlternative) {
       while (parts[0].length > 1 && parts[0].indexOf(".") != -1 && (parts[0].slice(-1) == "0" || parts[0].slice(-1) == ".")) {
        parts[0] = parts[0].slice(0, -1);
       }
      } else {
       if (flagAlternative && argText.indexOf(".") == -1) parts[0] += ".";
       while (precision > effectivePrecision++) parts[0] += "0";
      }
      argText = parts[0] + (parts.length > 1 ? "e" + parts[1] : "");
      if (next == 69) argText = argText.toUpperCase();
      if (currArg >= 0) {
       if (flagAlwaysSigned) {
        argText = "+" + argText;
       } else if (flagPadSign) {
        argText = " " + argText;
       }
      }
     }
     while (argText.length < width) {
      if (flagLeftAlign) {
       argText += " ";
      } else {
       if (flagZeroPad && (argText[0] == "-" || argText[0] == "+")) {
        argText = argText[0] + "0" + argText.slice(1);
       } else {
        argText = (flagZeroPad ? "0" : " ") + argText;
       }
      }
     }
     if (next < 97) argText = argText.toUpperCase();
     argText.split("").forEach(function(chr) {
      ret.push(chr.charCodeAt(0));
     });
     break;
    }

   case "s":
    {
     var arg = getNextArg("i8*");
     var argLength = arg ? _strlen(arg) : "(null)".length;
     if (precisionSet) argLength = Math.min(argLength, precision);
     if (!flagLeftAlign) {
      while (argLength < width--) {
       ret.push(32);
      }
     }
     if (arg) {
      for (var i = 0; i < argLength; i++) {
       ret.push(HEAPU8[arg++ >> 0]);
      }
     } else {
      ret = ret.concat(intArrayFromString("(null)".substr(0, argLength), true));
     }
     if (flagLeftAlign) {
      while (argLength < width--) {
       ret.push(32);
      }
     }
     break;
    }

   case "c":
    {
     if (flagLeftAlign) ret.push(getNextArg("i8"));
     while (--width > 0) {
      ret.push(32);
     }
     if (!flagLeftAlign) ret.push(getNextArg("i8"));
     break;
    }

   case "n":
    {
     var ptr = getNextArg("i32*");
     HEAP32[ptr >> 2] = ret.length;
     break;
    }

   case "%":
    {
     ret.push(curr);
     break;
    }

   default:
    {
     for (var i = startTextIndex; i < textIndex + 2; i++) {
      ret.push(HEAP8[i >> 0]);
     }
    }
   }
   textIndex += 2;
  } else {
   ret.push(curr);
   textIndex += 1;
  }
 }
 return ret;
}

Module["__formatString"] = __formatString;

function _emscripten_log(flags, varargs) {
 var format = HEAP32[varargs >> 2];
 varargs += 4;
 var str = "";
 if (format) {
  var result = __formatString(format, varargs);
  for (var i = 0; i < result.length; ++i) {
   str += String.fromCharCode(result[i]);
  }
 }
 _emscripten_log_js(flags, str);
}

Module["_emscripten_log"] = _emscripten_log;

function _emscripten_get_compiler_setting(name) {
 name = UTF8ToString(name);
 var ret = getCompilerSetting(name);
 if (typeof ret === "number") return ret;
 if (!_emscripten_get_compiler_setting.cache) _emscripten_get_compiler_setting.cache = {};
 var cache = _emscripten_get_compiler_setting.cache;
 var fullname = name + "__str";
 var fullret = cache[fullname];
 if (fullret) return fullret;
 return cache[fullname] = allocate(intArrayFromString(ret + ""), "i8", ALLOC_NORMAL);
}

Module["_emscripten_get_compiler_setting"] = _emscripten_get_compiler_setting;

function _emscripten_has_asyncify() {
 return 0;
}

Module["_emscripten_has_asyncify"] = _emscripten_has_asyncify;

function _emscripten_debugger() {
 debugger;
}

Module["_emscripten_debugger"] = _emscripten_debugger;

function _emscripten_print_double(x, to, max) {
 var str = x + "";
 if (to) return stringToUTF8(str, to, max); else return lengthBytesUTF8(str);
}

Module["_emscripten_print_double"] = _emscripten_print_double;

function _emscripten_generate_pc(frame) {
 abort("Cannot use emscripten_generate_pc (needed by __builtin_return_address) without -s USE_OFFSET_CONVERTER");
 var match;
 if (match = /\bwasm-function\[\d+\]:(0x[0-9a-f]+)/.exec(frame)) {
  return +match[1];
 } else if (match = /\bwasm-function\[(\d+)\]:(\d+)/.exec(frame)) {
  return wasmOffsetConverter.convert(+match[1], +match[2]);
 } else if (match = /:(\d+):\d+(?:\)|$)/.exec(frame)) {
  return 2147483648 | +match[1];
 } else {
  return 0;
 }
}

Module["_emscripten_generate_pc"] = _emscripten_generate_pc;

function _emscripten_return_address(level) {
 var callstack = new Error().stack.split("\n");
 if (callstack[0] == "Error") {
  callstack.shift();
 }
 return _emscripten_generate_pc(callstack[level + 2]);
}

Module["_emscripten_return_address"] = _emscripten_return_address;

var UNWIND_CACHE = {};

Module["UNWIND_CACHE"] = UNWIND_CACHE;

function __emscripten_save_in_unwind_cache(callstack) {
 callstack.forEach(function(frame) {
  var pc = _emscripten_generate_pc(frame);
  if (pc) {
   UNWIND_CACHE[pc] = frame;
  }
 });
}

Module["__emscripten_save_in_unwind_cache"] = __emscripten_save_in_unwind_cache;

function _emscripten_stack_snapshot() {
 var callstack = new Error().stack.split("\n");
 if (callstack[0] == "Error") {
  callstack.shift();
 }
 __emscripten_save_in_unwind_cache(callstack);
 UNWIND_CACHE.last_addr = _emscripten_generate_pc(callstack[2]);
 UNWIND_CACHE.last_stack = callstack;
 return UNWIND_CACHE.last_addr;
}

Module["_emscripten_stack_snapshot"] = _emscripten_stack_snapshot;

function _emscripten_stack_unwind_buffer(addr, buffer, count) {
 var stack;
 if (UNWIND_CACHE.last_addr == addr) {
  stack = UNWIND_CACHE.last_stack;
 } else {
  stack = new Error().stack.split("\n");
  if (stack[0] == "Error") {
   stack.shift();
  }
  __emscripten_save_in_unwind_cache(stack);
 }
 var offset = 2;
 while (stack[offset] && _emscripten_generate_pc(stack[offset]) != addr) {
  ++offset;
 }
 for (var i = 0; i < count && stack[i + offset]; ++i) {
  HEAP32[buffer + i * 4 >> 2] = _emscripten_generate_pc(stack[i + offset]);
 }
 return i;
}

Module["_emscripten_stack_unwind_buffer"] = _emscripten_stack_unwind_buffer;

function _emscripten_builtin_malloc() {
 if (!Module["_emscripten_builtin_malloc"]) abort("external function 'emscripten_builtin_malloc' is missing. perhaps a side module was not linked in? if this function was expected to arrive from a system library, try to build the MAIN_MODULE with EMCC_FORCE_STDLIBS=1 in the environment");
 return Module["_emscripten_builtin_malloc"].apply(null, arguments);
}

function _emscripten_builtin_free() {
 if (!Module["_emscripten_builtin_free"]) abort("external function 'emscripten_builtin_free' is missing. perhaps a side module was not linked in? if this function was expected to arrive from a system library, try to build the MAIN_MODULE with EMCC_FORCE_STDLIBS=1 in the environment");
 return Module["_emscripten_builtin_free"].apply(null, arguments);
}

function _emscripten_builtin_memalign() {
 if (!Module["_emscripten_builtin_memalign"]) abort("external function 'emscripten_builtin_memalign' is missing. perhaps a side module was not linked in? if this function was expected to arrive from a system library, try to build the MAIN_MODULE with EMCC_FORCE_STDLIBS=1 in the environment");
 return Module["_emscripten_builtin_memalign"].apply(null, arguments);
}

function _emscripten_with_builtin_malloc(func) {
 var prev_malloc = typeof _malloc !== "undefined" ? _malloc : undefined;
 var prev_memalign = typeof _memalign !== "undefined" ? _memalign : undefined;
 var prev_free = typeof _free !== "undefined" ? _free : undefined;
 _malloc = _emscripten_builtin_malloc;
 _memalign = _emscripten_builtin_memalign;
 _free = _emscripten_builtin_free;
 try {
  return func();
 } finally {
  _malloc = prev_malloc;
  _memalign = prev_memalign;
  _free = prev_free;
 }
}

Module["_emscripten_with_builtin_malloc"] = _emscripten_with_builtin_malloc;

function _emscripten_pc_get_function(pc) {
 abort("Cannot use emscripten_pc_get_function without -s USE_OFFSET_CONVERTER");
 var name;
 if (pc & 2147483648) {
  var frame = UNWIND_CACHE[pc];
  if (!frame) return 0;
  var match;
  if (match = /^\s+at (.*) \(.*\)$/.exec(frame)) {
   name = match[1];
  } else if (match = /^(.+?)@/.exec(frame)) {
   name = match[1];
  } else {
   return 0;
  }
 } else {
  name = wasmOffsetConverter.getName(pc);
 }
 _emscripten_with_builtin_malloc(function() {
  if (_emscripten_pc_get_function.ret) _free(_emscripten_pc_get_function.ret);
  _emscripten_pc_get_function.ret = allocateUTF8(name);
 });
 return _emscripten_pc_get_function.ret;
}

Module["_emscripten_pc_get_function"] = _emscripten_pc_get_function;

function _emscripten_pc_get_source_js(pc) {
 if (UNWIND_CACHE.last_get_source_pc == pc) return UNWIND_CACHE.last_source;
 var match;
 var source;
 if (!source) {
  var frame = UNWIND_CACHE[pc];
  if (!frame) return null;
  if (match = /\((.*):(\d+):(\d+)\)$/.exec(frame)) {
   source = {
    file: match[1],
    line: match[2],
    column: match[3]
   };
  } else if (match = /@(.*):(\d+):(\d+)/.exec(frame)) {
   source = {
    file: match[1],
    line: match[2],
    column: match[3]
   };
  }
 }
 UNWIND_CACHE.last_get_source_pc = pc;
 UNWIND_CACHE.last_source = source;
 return source;
}

Module["_emscripten_pc_get_source_js"] = _emscripten_pc_get_source_js;

function _emscripten_pc_get_file(pc) {
 var result = _emscripten_pc_get_source_js(pc);
 if (!result) return 0;
 _emscripten_with_builtin_malloc(function() {
  if (_emscripten_pc_get_file.ret) _free(_emscripten_pc_get_file.ret);
  _emscripten_pc_get_file.ret = allocateUTF8(result.file);
 });
 return _emscripten_pc_get_file.ret;
}

Module["_emscripten_pc_get_file"] = _emscripten_pc_get_file;

function _emscripten_pc_get_line(pc) {
 var result = _emscripten_pc_get_source_js(pc);
 return result ? result.line : 0;
}

Module["_emscripten_pc_get_line"] = _emscripten_pc_get_line;

function _emscripten_pc_get_column(pc) {
 var result = _emscripten_pc_get_source_js(pc);
 return result ? result.column || 0 : 0;
}

Module["_emscripten_pc_get_column"] = _emscripten_pc_get_column;

function _emscripten_get_module_name(buf, length) {
 return stringToUTF8(wasmBinaryFile, buf, length);
}

Module["_emscripten_get_module_name"] = _emscripten_get_module_name;

function _memalign() {
 if (!Module["_memalign"]) abort("external function 'memalign' is missing. perhaps a side module was not linked in? if this function was expected to arrive from a system library, try to build the MAIN_MODULE with EMCC_FORCE_STDLIBS=1 in the environment");
 return Module["_memalign"].apply(null, arguments);
}

function __emscripten_syscall_mmap2(addr, len, prot, flags, fd, off) {
 off <<= 12;
 var ptr;
 var allocated = false;
 if ((flags & 16) !== 0 && addr % 16384 !== 0) {
  return -28;
 }
 if ((flags & 32) !== 0) {
  ptr = _memalign(16384, len);
  if (!ptr) return -48;
  _memset(ptr, 0, len);
  allocated = true;
 } else {
  var info = FS.getStream(fd);
  if (!info) return -8;
  var res = FS.mmap(info, HEAPU8, addr, len, off, prot, flags);
  ptr = res.ptr;
  allocated = res.allocated;
 }
 SYSCALLS.mappings[ptr] = {
  malloc: ptr,
  len: len,
  allocated: allocated,
  fd: fd,
  flags: flags,
  offset: off
 };
 return ptr;
}

Module["__emscripten_syscall_mmap2"] = __emscripten_syscall_mmap2;

function _emscripten_builtin_mmap2(addr, len, prot, flags, fd, off) {
 return _emscripten_with_builtin_malloc(function() {
  return __emscripten_syscall_mmap2(addr, len, prot, flags, fd, off);
 });
}

Module["_emscripten_builtin_mmap2"] = _emscripten_builtin_mmap2;

function __emscripten_syscall_munmap(addr, len) {
 if (addr === -1 || len === 0) {
  return -28;
 }
 var info = SYSCALLS.mappings[addr];
 if (!info) return 0;
 if (len === info.len) {
  var stream = FS.getStream(info.fd);
  SYSCALLS.doMsync(addr, stream, len, info.flags, info.offset);
  FS.munmap(stream);
  SYSCALLS.mappings[addr] = null;
  if (info.allocated) {
   _free(info.malloc);
  }
 }
 return 0;
}

Module["__emscripten_syscall_munmap"] = __emscripten_syscall_munmap;

function _emscripten_builtin_munmap(addr, len) {
 return _emscripten_with_builtin_malloc(function() {
  return __emscripten_syscall_munmap(addr, len);
 });
}

Module["_emscripten_builtin_munmap"] = _emscripten_builtin_munmap;

function _emscripten_get_stack_top() {
 return STACKTOP;
}

Module["_emscripten_get_stack_top"] = _emscripten_get_stack_top;

function _emscripten_get_stack_base() {
 return STACK_BASE;
}

Module["_emscripten_get_stack_base"] = _emscripten_get_stack_base;

function _i64Add(a, b, c, d) {
 a = a | 0;
 b = b | 0;
 c = c | 0;
 d = d | 0;
 var l = 0, h = 0;
 l = a + c >>> 0;
 h = b + d + (l >>> 0 < a >>> 0 | 0) >>> 0;
 return (setTempRet0(h | 0), l | 0) | 0;
}

Module["_i64Add"] = _i64Add;

function _i64Subtract(a, b, c, d) {
 a = a | 0;
 b = b | 0;
 c = c | 0;
 d = d | 0;
 var l = 0, h = 0;
 l = a - c >>> 0;
 h = b - d >>> 0;
 h = b - d - (c >>> 0 > a >>> 0 | 0) >>> 0;
 return (setTempRet0(h | 0), l | 0) | 0;
}

Module["_i64Subtract"] = _i64Subtract;

function _bitshift64Shl(low, high, bits) {
 low = low | 0;
 high = high | 0;
 bits = bits | 0;
 var ander = 0;
 if ((bits | 0) < 32) {
  ander = (1 << bits) - 1 | 0;
  setTempRet0(high << bits | (low & ander << 32 - bits) >>> 32 - bits | 0);
  return low << bits;
 }
 setTempRet0(low << bits - 32 | 0);
 return 0;
}

Module["_bitshift64Shl"] = _bitshift64Shl;

function _bitshift64Ashr(low, high, bits) {
 low = low | 0;
 high = high | 0;
 bits = bits | 0;
 var ander = 0;
 if ((bits | 0) < 32) {
  ander = (1 << bits) - 1 | 0;
  setTempRet0(high >> bits | 0);
  return low >>> bits | (high & ander) << 32 - bits;
 }
 setTempRet0(((high | 0) < 0 ? -1 : 0) | 0);
 return high >> bits - 32 | 0;
}

Module["_bitshift64Ashr"] = _bitshift64Ashr;

function _bitshift64Lshr(low, high, bits) {
 low = low | 0;
 high = high | 0;
 bits = bits | 0;
 var ander = 0;
 if ((bits | 0) < 32) {
  ander = (1 << bits) - 1 | 0;
  setTempRet0(high >>> bits | 0);
  return low >>> bits | (high & ander) << 32 - bits;
 }
 setTempRet0(0 | 0);
 return high >>> bits - 32 | 0;
}

Module["_bitshift64Lshr"] = _bitshift64Lshr;

function ___lockfile() {
 return 1;
}

Module["___lockfile"] = ___lockfile;

function ___unlockfile() {}

Module["___unlockfile"] = ___unlockfile;

function __Unwind_Backtrace(func, arg) {
 var trace = _emscripten_get_callstack_js();
 var parts = trace.split("\n");
 for (var i = 0; i < parts.length; i++) {
  var ret = dynCall_iii(func, 0, arg);
  if (ret !== 0) return;
 }
}

Module["__Unwind_Backtrace"] = __Unwind_Backtrace;

function __Unwind_GetIPInfo() {
 abort("Unwind_GetIPInfo");
}

Module["__Unwind_GetIPInfo"] = __Unwind_GetIPInfo;

function __Unwind_FindEnclosingFunction() {
 return 0;
}

Module["__Unwind_FindEnclosingFunction"] = __Unwind_FindEnclosingFunction;

var ___exception_infos = {};

Module["___exception_infos"] = ___exception_infos;

var ___exception_last = 0;

Module["___exception_last"] = ___exception_last;

function __ZSt18uncaught_exceptionv() {
 return __ZSt18uncaught_exceptionv.uncaught_exceptions > 0;
}

Module["__ZSt18uncaught_exceptionv"] = __ZSt18uncaught_exceptionv;

function ___cxa_throw(ptr, type, destructor) {
 ___exception_infos[ptr] = {
  ptr: ptr,
  adjusted: [ ptr ],
  type: type,
  destructor: destructor,
  refcount: 0,
  caught: false,
  rethrown: false
 };
 ___exception_last = ptr;
 if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
  __ZSt18uncaught_exceptionv.uncaught_exceptions = 1;
 } else {
  __ZSt18uncaught_exceptionv.uncaught_exceptions++;
 }
 throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch." + " (note: in dynamic linking, if a side module wants exceptions, the main module must be built with that support)";
}

Module["___cxa_throw"] = ___cxa_throw;

function __Unwind_RaiseException(ex) {
 err("Warning: _Unwind_RaiseException is not correctly implemented");
 return ___cxa_throw(ex, 0, 0);
}

Module["__Unwind_RaiseException"] = __Unwind_RaiseException;

function __Unwind_DeleteException(ex) {
 err("TODO: Unwind_DeleteException");
}

Module["__Unwind_DeleteException"] = __Unwind_DeleteException;

function _emscripten_autodebug_i64(line, valuel, valueh) {
 out("AD:" + [ line, valuel, valueh ]);
}

Module["_emscripten_autodebug_i64"] = _emscripten_autodebug_i64;

function _emscripten_autodebug_i32(line, value) {
 out("AD:" + [ line, value ]);
}

Module["_emscripten_autodebug_i32"] = _emscripten_autodebug_i32;

function _emscripten_autodebug_i16(line, value) {
 out("AD:" + [ line, value ]);
}

Module["_emscripten_autodebug_i16"] = _emscripten_autodebug_i16;

function _emscripten_autodebug_i8(line, value) {
 out("AD:" + [ line, value ]);
}

Module["_emscripten_autodebug_i8"] = _emscripten_autodebug_i8;

function _emscripten_autodebug_float(line, value) {
 out("AD:" + [ line, value ]);
}

Module["_emscripten_autodebug_float"] = _emscripten_autodebug_float;

function _emscripten_autodebug_double(line, value) {
 out("AD:" + [ line, value ]);
}

Module["_emscripten_autodebug_double"] = _emscripten_autodebug_double;

function _emscripten_scan_stack(func) {
 var base = STACK_BASE;
 var end = stackSave();
 dynCall_vii(func, Math.min(base, end), Math.max(base, end));
}

Module["_emscripten_scan_stack"] = _emscripten_scan_stack;

var _emscripten_prep_setjmp = true;

Module["_emscripten_prep_setjmp"] = _emscripten_prep_setjmp;

var _emscripten_cleanup_setjmp = true;

Module["_emscripten_cleanup_setjmp"] = _emscripten_cleanup_setjmp;

var _emscripten_check_longjmp = true;

Module["_emscripten_check_longjmp"] = _emscripten_check_longjmp;

var _emscripten_get_longjmp_result = true;

Module["_emscripten_get_longjmp_result"] = _emscripten_get_longjmp_result;

var _emscripten_setjmp = true;

Module["_emscripten_setjmp"] = _emscripten_setjmp;

var _emscripten_preinvoke = true;

Module["_emscripten_preinvoke"] = _emscripten_preinvoke;

var _emscripten_postinvoke = true;

Module["_emscripten_postinvoke"] = _emscripten_postinvoke;

var _emscripten_resume = true;

Module["_emscripten_resume"] = _emscripten_resume;

var _emscripten_landingpad = true;

Module["_emscripten_landingpad"] = _emscripten_landingpad;

var _getHigh32 = true;

Module["_getHigh32"] = _getHigh32;

var _setHigh32 = true;

Module["_setHigh32"] = _setHigh32;

var _FtoILow = true;

Module["_FtoILow"] = _FtoILow;

var _FtoIHigh = true;

Module["_FtoIHigh"] = _FtoIHigh;

var _DtoILow = true;

Module["_DtoILow"] = _DtoILow;

var _DtoIHigh = true;

Module["_DtoIHigh"] = _DtoIHigh;

var _BDtoILow = true;

Module["_BDtoILow"] = _BDtoILow;

var _BDtoIHigh = true;

Module["_BDtoIHigh"] = _BDtoIHigh;

var _SItoF = true;

Module["_SItoF"] = _SItoF;

var _UItoF = true;

Module["_UItoF"] = _UItoF;

var _SItoD = true;

Module["_SItoD"] = _SItoD;

var _UItoD = true;

Module["_UItoD"] = _UItoD;

var _BItoD = true;

Module["_BItoD"] = _BItoD;

var _llvm_dbg_value = true;

Module["_llvm_dbg_value"] = _llvm_dbg_value;

var _llvm_debugtrap = true;

Module["_llvm_debugtrap"] = _llvm_debugtrap;

var _llvm_ctlz_i32 = true;

Module["_llvm_ctlz_i32"] = _llvm_ctlz_i32;

var _emscripten_asm_const = true;

Module["_emscripten_asm_const"] = _emscripten_asm_const;

var _emscripten_asm_const_int = true;

Module["_emscripten_asm_const_int"] = _emscripten_asm_const_int;

var _emscripten_asm_const_double = true;

Module["_emscripten_asm_const_double"] = _emscripten_asm_const_double;

var _emscripten_asm_const_int_sync_on_main_thread = true;

Module["_emscripten_asm_const_int_sync_on_main_thread"] = _emscripten_asm_const_int_sync_on_main_thread;

var _emscripten_asm_const_double_sync_on_main_thread = true;

Module["_emscripten_asm_const_double_sync_on_main_thread"] = _emscripten_asm_const_double_sync_on_main_thread;

var _emscripten_asm_const_async_on_main_thread = true;

Module["_emscripten_asm_const_async_on_main_thread"] = _emscripten_asm_const_async_on_main_thread;

function ___muldsi3($a, $b) {
 $a = $a | 0;
 $b = $b | 0;
 var $1 = 0, $2 = 0, $3 = 0, $6 = 0, $8 = 0, $11 = 0, $12 = 0;
 $1 = $a & 65535;
 $2 = $b & 65535;
 $3 = Math_imul($2, $1) | 0;
 $6 = $a >>> 16;
 $8 = ($3 >>> 16) + (Math_imul($2, $6) | 0) | 0;
 $11 = $b >>> 16;
 $12 = Math_imul($11, $1) | 0;
 return (setTempRet0((($8 >>> 16) + (Math_imul($11, $6) | 0) | 0) + ((($8 & 65535) + $12 | 0) >>> 16) | 0 | 0), 
 0 | ($8 + $12 << 16 | $3 & 65535)) | 0;
}

Module["___muldsi3"] = ___muldsi3;

function ___udivmoddi4($a$0, $a$1, $b$0, $b$1, $rem) {
 $a$0 = $a$0 | 0;
 $a$1 = $a$1 | 0;
 $b$0 = $b$0 | 0;
 $b$1 = $b$1 | 0;
 $rem = $rem | 0;
 var $n_sroa_0_0_extract_trunc = 0, $n_sroa_1_4_extract_shift$0 = 0, $n_sroa_1_4_extract_trunc = 0, $d_sroa_0_0_extract_trunc = 0, $d_sroa_1_4_extract_shift$0 = 0, $d_sroa_1_4_extract_trunc = 0, $4 = 0, $17 = 0, $37 = 0, $49 = 0, $51 = 0, $57 = 0, $58 = 0, $66 = 0, $78 = 0, $86 = 0, $88 = 0, $89 = 0, $91 = 0, $92 = 0, $95 = 0, $105 = 0, $117 = 0, $119 = 0, $125 = 0, $126 = 0, $130 = 0, $q_sroa_1_1_ph = 0, $q_sroa_0_1_ph = 0, $r_sroa_1_1_ph = 0, $r_sroa_0_1_ph = 0, $sr_1_ph = 0, $d_sroa_0_0_insert_insert99$0 = 0, $d_sroa_0_0_insert_insert99$1 = 0, $137$0 = 0, $137$1 = 0, $carry_0203 = 0, $sr_1202 = 0, $r_sroa_0_1201 = 0, $r_sroa_1_1200 = 0, $q_sroa_0_1199 = 0, $q_sroa_1_1198 = 0, $147 = 0, $149 = 0, $r_sroa_0_0_insert_insert42$0 = 0, $r_sroa_0_0_insert_insert42$1 = 0, $150$1 = 0, $151$0 = 0, $152 = 0, $154$0 = 0, $r_sroa_0_0_extract_trunc = 0, $r_sroa_1_4_extract_trunc = 0, $155 = 0, $carry_0_lcssa$0 = 0, $carry_0_lcssa$1 = 0, $r_sroa_0_1_lcssa = 0, $r_sroa_1_1_lcssa = 0, $q_sroa_0_1_lcssa = 0, $q_sroa_1_1_lcssa = 0, $q_sroa_0_0_insert_ext75$0 = 0, $q_sroa_0_0_insert_ext75$1 = 0, $q_sroa_0_0_insert_insert77$1 = 0, $_0$0 = 0, $_0$1 = 0;
 $n_sroa_0_0_extract_trunc = $a$0;
 $n_sroa_1_4_extract_shift$0 = $a$1;
 $n_sroa_1_4_extract_trunc = $n_sroa_1_4_extract_shift$0;
 $d_sroa_0_0_extract_trunc = $b$0;
 $d_sroa_1_4_extract_shift$0 = $b$1;
 $d_sroa_1_4_extract_trunc = $d_sroa_1_4_extract_shift$0;
 if (($n_sroa_1_4_extract_trunc | 0) == 0) {
  $4 = ($rem | 0) != 0;
  if (($d_sroa_1_4_extract_trunc | 0) == 0) {
   if ($4) {
    HEAP32[$rem >> 2] = ($n_sroa_0_0_extract_trunc >>> 0) % ($d_sroa_0_0_extract_trunc >>> 0);
    HEAP32[$rem + 4 >> 2] = 0;
   }
   $_0$1 = 0;
   $_0$0 = ($n_sroa_0_0_extract_trunc >>> 0) / ($d_sroa_0_0_extract_trunc >>> 0) >>> 0;
   return (setTempRet0($_0$1 | 0), $_0$0) | 0;
  } else {
   if (!$4) {
    $_0$1 = 0;
    $_0$0 = 0;
    return (setTempRet0($_0$1 | 0), $_0$0) | 0;
   }
   HEAP32[$rem >> 2] = $a$0 & -1;
   HEAP32[$rem + 4 >> 2] = $a$1 & 0;
   $_0$1 = 0;
   $_0$0 = 0;
   return (setTempRet0($_0$1 | 0), $_0$0) | 0;
  }
 }
 $17 = ($d_sroa_1_4_extract_trunc | 0) == 0;
 do {
  if (($d_sroa_0_0_extract_trunc | 0) == 0) {
   if ($17) {
    if (($rem | 0) != 0) {
     HEAP32[$rem >> 2] = ($n_sroa_1_4_extract_trunc >>> 0) % ($d_sroa_0_0_extract_trunc >>> 0);
     HEAP32[$rem + 4 >> 2] = 0;
    }
    $_0$1 = 0;
    $_0$0 = ($n_sroa_1_4_extract_trunc >>> 0) / ($d_sroa_0_0_extract_trunc >>> 0) >>> 0;
    return (setTempRet0($_0$1 | 0), $_0$0) | 0;
   }
   if (($n_sroa_0_0_extract_trunc | 0) == 0) {
    if (($rem | 0) != 0) {
     HEAP32[$rem >> 2] = 0;
     HEAP32[$rem + 4 >> 2] = ($n_sroa_1_4_extract_trunc >>> 0) % ($d_sroa_1_4_extract_trunc >>> 0);
    }
    $_0$1 = 0;
    $_0$0 = ($n_sroa_1_4_extract_trunc >>> 0) / ($d_sroa_1_4_extract_trunc >>> 0) >>> 0;
    return (setTempRet0($_0$1 | 0), $_0$0) | 0;
   }
   $37 = $d_sroa_1_4_extract_trunc - 1 | 0;
   if (($37 & $d_sroa_1_4_extract_trunc | 0) == 0) {
    if (($rem | 0) != 0) {
     HEAP32[$rem >> 2] = 0 | $a$0 & -1;
     HEAP32[$rem + 4 >> 2] = $37 & $n_sroa_1_4_extract_trunc | $a$1 & 0;
    }
    $_0$1 = 0;
    $_0$0 = $n_sroa_1_4_extract_trunc >>> ((_llvm_cttz_i32($d_sroa_1_4_extract_trunc | 0) | 0) >>> 0);
    return (setTempRet0($_0$1 | 0), $_0$0) | 0;
   }
   $49 = Math_clz32($d_sroa_1_4_extract_trunc | 0) | 0;
   $51 = $49 - (Math_clz32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
   if ($51 >>> 0 <= 30) {
    $57 = $51 + 1 | 0;
    $58 = 31 - $51 | 0;
    $sr_1_ph = $57;
    $r_sroa_0_1_ph = $n_sroa_1_4_extract_trunc << $58 | $n_sroa_0_0_extract_trunc >>> ($57 >>> 0);
    $r_sroa_1_1_ph = $n_sroa_1_4_extract_trunc >>> ($57 >>> 0);
    $q_sroa_0_1_ph = 0;
    $q_sroa_1_1_ph = $n_sroa_0_0_extract_trunc << $58;
    break;
   }
   if (($rem | 0) == 0) {
    $_0$1 = 0;
    $_0$0 = 0;
    return (setTempRet0($_0$1 | 0), $_0$0) | 0;
   }
   HEAP32[$rem >> 2] = 0 | $a$0 & -1;
   HEAP32[$rem + 4 >> 2] = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
   $_0$1 = 0;
   $_0$0 = 0;
   return (setTempRet0($_0$1 | 0), $_0$0) | 0;
  } else {
   if (!$17) {
    $117 = Math_clz32($d_sroa_1_4_extract_trunc | 0) | 0;
    $119 = $117 - (Math_clz32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
    if ($119 >>> 0 <= 31) {
     $125 = $119 + 1 | 0;
     $126 = 31 - $119 | 0;
     $130 = $119 - 31 >> 31;
     $sr_1_ph = $125;
     $r_sroa_0_1_ph = $n_sroa_0_0_extract_trunc >>> ($125 >>> 0) & $130 | $n_sroa_1_4_extract_trunc << $126;
     $r_sroa_1_1_ph = $n_sroa_1_4_extract_trunc >>> ($125 >>> 0) & $130;
     $q_sroa_0_1_ph = 0;
     $q_sroa_1_1_ph = $n_sroa_0_0_extract_trunc << $126;
     break;
    }
    if (($rem | 0) == 0) {
     $_0$1 = 0;
     $_0$0 = 0;
     return (setTempRet0($_0$1 | 0), $_0$0) | 0;
    }
    HEAP32[$rem >> 2] = 0 | $a$0 & -1;
    HEAP32[$rem + 4 >> 2] = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
    $_0$1 = 0;
    $_0$0 = 0;
    return (setTempRet0($_0$1 | 0), $_0$0) | 0;
   }
   $66 = $d_sroa_0_0_extract_trunc - 1 | 0;
   if (($66 & $d_sroa_0_0_extract_trunc | 0) != 0) {
    $86 = (Math_clz32($d_sroa_0_0_extract_trunc | 0) | 0) + 33 | 0;
    $88 = $86 - (Math_clz32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
    $89 = 64 - $88 | 0;
    $91 = 32 - $88 | 0;
    $92 = $91 >> 31;
    $95 = $88 - 32 | 0;
    $105 = $95 >> 31;
    $sr_1_ph = $88;
    $r_sroa_0_1_ph = $91 - 1 >> 31 & $n_sroa_1_4_extract_trunc >>> ($95 >>> 0) | ($n_sroa_1_4_extract_trunc << $91 | $n_sroa_0_0_extract_trunc >>> ($88 >>> 0)) & $105;
    $r_sroa_1_1_ph = $105 & $n_sroa_1_4_extract_trunc >>> ($88 >>> 0);
    $q_sroa_0_1_ph = $n_sroa_0_0_extract_trunc << $89 & $92;
    $q_sroa_1_1_ph = ($n_sroa_1_4_extract_trunc << $89 | $n_sroa_0_0_extract_trunc >>> ($95 >>> 0)) & $92 | $n_sroa_0_0_extract_trunc << $91 & $88 - 33 >> 31;
    break;
   }
   if (($rem | 0) != 0) {
    HEAP32[$rem >> 2] = $66 & $n_sroa_0_0_extract_trunc;
    HEAP32[$rem + 4 >> 2] = 0;
   }
   if (($d_sroa_0_0_extract_trunc | 0) == 1) {
    $_0$1 = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
    $_0$0 = 0 | $a$0 & -1;
    return (setTempRet0($_0$1 | 0), $_0$0) | 0;
   } else {
    $78 = _llvm_cttz_i32($d_sroa_0_0_extract_trunc | 0) | 0;
    $_0$1 = 0 | $n_sroa_1_4_extract_trunc >>> ($78 >>> 0);
    $_0$0 = $n_sroa_1_4_extract_trunc << 32 - $78 | $n_sroa_0_0_extract_trunc >>> ($78 >>> 0) | 0;
    return (setTempRet0($_0$1 | 0), $_0$0) | 0;
   }
  }
 } while (0);
 if (($sr_1_ph | 0) == 0) {
  $q_sroa_1_1_lcssa = $q_sroa_1_1_ph;
  $q_sroa_0_1_lcssa = $q_sroa_0_1_ph;
  $r_sroa_1_1_lcssa = $r_sroa_1_1_ph;
  $r_sroa_0_1_lcssa = $r_sroa_0_1_ph;
  $carry_0_lcssa$1 = 0;
  $carry_0_lcssa$0 = 0;
 } else {
  $d_sroa_0_0_insert_insert99$0 = 0 | $b$0 & -1;
  $d_sroa_0_0_insert_insert99$1 = $d_sroa_1_4_extract_shift$0 | $b$1 & 0;
  $137$0 = _i64Add($d_sroa_0_0_insert_insert99$0 | 0, $d_sroa_0_0_insert_insert99$1 | 0, -1, -1) | 0;
  $137$1 = getTempRet0() | 0;
  $q_sroa_1_1198 = $q_sroa_1_1_ph;
  $q_sroa_0_1199 = $q_sroa_0_1_ph;
  $r_sroa_1_1200 = $r_sroa_1_1_ph;
  $r_sroa_0_1201 = $r_sroa_0_1_ph;
  $sr_1202 = $sr_1_ph;
  $carry_0203 = 0;
  while (1) {
   $147 = $q_sroa_0_1199 >>> 31 | $q_sroa_1_1198 << 1;
   $149 = $carry_0203 | $q_sroa_0_1199 << 1;
   $r_sroa_0_0_insert_insert42$0 = 0 | ($r_sroa_0_1201 << 1 | $q_sroa_1_1198 >>> 31);
   $r_sroa_0_0_insert_insert42$1 = $r_sroa_0_1201 >>> 31 | $r_sroa_1_1200 << 1 | 0;
   _i64Subtract($137$0 | 0, $137$1 | 0, $r_sroa_0_0_insert_insert42$0 | 0, $r_sroa_0_0_insert_insert42$1 | 0) | 0;
   $150$1 = getTempRet0() | 0;
   $151$0 = $150$1 >> 31 | (($150$1 | 0) < 0 ? -1 : 0) << 1;
   $152 = $151$0 & 1;
   $154$0 = _i64Subtract($r_sroa_0_0_insert_insert42$0 | 0, $r_sroa_0_0_insert_insert42$1 | 0, $151$0 & $d_sroa_0_0_insert_insert99$0 | 0, ((($150$1 | 0) < 0 ? -1 : 0) >> 31 | (($150$1 | 0) < 0 ? -1 : 0) << 1) & $d_sroa_0_0_insert_insert99$1 | 0) | 0;
   $r_sroa_0_0_extract_trunc = $154$0;
   $r_sroa_1_4_extract_trunc = getTempRet0() | 0;
   $155 = $sr_1202 - 1 | 0;
   if (($155 | 0) == 0) {
    break;
   } else {
    $q_sroa_1_1198 = $147;
    $q_sroa_0_1199 = $149;
    $r_sroa_1_1200 = $r_sroa_1_4_extract_trunc;
    $r_sroa_0_1201 = $r_sroa_0_0_extract_trunc;
    $sr_1202 = $155;
    $carry_0203 = $152;
   }
  }
  $q_sroa_1_1_lcssa = $147;
  $q_sroa_0_1_lcssa = $149;
  $r_sroa_1_1_lcssa = $r_sroa_1_4_extract_trunc;
  $r_sroa_0_1_lcssa = $r_sroa_0_0_extract_trunc;
  $carry_0_lcssa$1 = 0;
  $carry_0_lcssa$0 = $152;
 }
 $q_sroa_0_0_insert_ext75$0 = $q_sroa_0_1_lcssa;
 $q_sroa_0_0_insert_ext75$1 = 0;
 $q_sroa_0_0_insert_insert77$1 = $q_sroa_1_1_lcssa | $q_sroa_0_0_insert_ext75$1;
 if (($rem | 0) != 0) {
  HEAP32[$rem >> 2] = 0 | $r_sroa_0_1_lcssa;
  HEAP32[$rem + 4 >> 2] = $r_sroa_1_1_lcssa | 0;
 }
 $_0$1 = (0 | $q_sroa_0_0_insert_ext75$0) >>> 31 | $q_sroa_0_0_insert_insert77$1 << 1 | ($q_sroa_0_0_insert_ext75$1 << 1 | $q_sroa_0_0_insert_ext75$0 >>> 31) & 0 | $carry_0_lcssa$1;
 $_0$0 = ($q_sroa_0_0_insert_ext75$0 << 1 | 0 >>> 31) & -2 | $carry_0_lcssa$0;
 return (setTempRet0($_0$1 | 0), $_0$0) | 0;
}

Module["___udivmoddi4"] = ___udivmoddi4;

function ___divdi3($a$0, $a$1, $b$0, $b$1) {
 $a$0 = $a$0 | 0;
 $a$1 = $a$1 | 0;
 $b$0 = $b$0 | 0;
 $b$1 = $b$1 | 0;
 var $1$0 = 0, $1$1 = 0, $2$0 = 0, $2$1 = 0, $4$0 = 0, $4$1 = 0, $6$0 = 0, $7$0 = 0, $7$1 = 0, $8$0 = 0, $10$0 = 0;
 $1$0 = $a$1 >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
 $1$1 = (($a$1 | 0) < 0 ? -1 : 0) >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
 $2$0 = $b$1 >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
 $2$1 = (($b$1 | 0) < 0 ? -1 : 0) >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
 $4$0 = _i64Subtract($1$0 ^ $a$0 | 0, $1$1 ^ $a$1 | 0, $1$0 | 0, $1$1 | 0) | 0;
 $4$1 = getTempRet0() | 0;
 $6$0 = _i64Subtract($2$0 ^ $b$0 | 0, $2$1 ^ $b$1 | 0, $2$0 | 0, $2$1 | 0) | 0;
 $7$0 = $2$0 ^ $1$0;
 $7$1 = $2$1 ^ $1$1;
 $8$0 = ___udivmoddi4($4$0, $4$1, $6$0, getTempRet0() | 0, 0) | 0;
 $10$0 = _i64Subtract($8$0 ^ $7$0 | 0, (getTempRet0() | 0) ^ $7$1 | 0, $7$0 | 0, $7$1 | 0) | 0;
 return $10$0 | 0;
}

Module["___divdi3"] = ___divdi3;

function ___remdi3($a$0, $a$1, $b$0, $b$1) {
 $a$0 = $a$0 | 0;
 $a$1 = $a$1 | 0;
 $b$0 = $b$0 | 0;
 $b$1 = $b$1 | 0;
 var $rem = 0, $1$0 = 0, $1$1 = 0, $2$0 = 0, $2$1 = 0, $4$0 = 0, $4$1 = 0, $6$0 = 0, $10$0 = 0, $10$1 = 0, __stackBase__ = 0;
 __stackBase__ = STACKTOP;
 STACKTOP = STACKTOP + 16 | 0;
 $rem = __stackBase__ | 0;
 $1$0 = $a$1 >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
 $1$1 = (($a$1 | 0) < 0 ? -1 : 0) >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
 $2$0 = $b$1 >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
 $2$1 = (($b$1 | 0) < 0 ? -1 : 0) >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
 $4$0 = _i64Subtract($1$0 ^ $a$0 | 0, $1$1 ^ $a$1 | 0, $1$0 | 0, $1$1 | 0) | 0;
 $4$1 = getTempRet0() | 0;
 $6$0 = _i64Subtract($2$0 ^ $b$0 | 0, $2$1 ^ $b$1 | 0, $2$0 | 0, $2$1 | 0) | 0;
 ___udivmoddi4($4$0, $4$1, $6$0, getTempRet0() | 0, $rem) | 0;
 $10$0 = _i64Subtract(HEAP32[$rem >> 2] ^ $1$0 | 0, HEAP32[$rem + 4 >> 2] ^ $1$1 | 0, $1$0 | 0, $1$1 | 0) | 0;
 $10$1 = getTempRet0() | 0;
 STACKTOP = __stackBase__;
 return (setTempRet0($10$1 | 0), $10$0) | 0;
}

Module["___remdi3"] = ___remdi3;

function ___muldi3($a$0, $a$1, $b$0, $b$1) {
 $a$0 = $a$0 | 0;
 $a$1 = $a$1 | 0;
 $b$0 = $b$0 | 0;
 $b$1 = $b$1 | 0;
 var $x_sroa_0_0_extract_trunc = 0, $y_sroa_0_0_extract_trunc = 0, $1$0 = 0, $1$1 = 0, $2 = 0;
 $x_sroa_0_0_extract_trunc = $a$0;
 $y_sroa_0_0_extract_trunc = $b$0;
 $1$0 = ___muldsi3($x_sroa_0_0_extract_trunc, $y_sroa_0_0_extract_trunc) | 0;
 $1$1 = getTempRet0() | 0;
 $2 = Math_imul($a$1, $y_sroa_0_0_extract_trunc) | 0;
 return (setTempRet0(((Math_imul($b$1, $x_sroa_0_0_extract_trunc) | 0) + $2 | 0) + $1$1 | $1$1 & 0 | 0), 
 0 | $1$0 & -1) | 0;
}

Module["___muldi3"] = ___muldi3;

function ___udivdi3($a$0, $a$1, $b$0, $b$1) {
 $a$0 = $a$0 | 0;
 $a$1 = $a$1 | 0;
 $b$0 = $b$0 | 0;
 $b$1 = $b$1 | 0;
 var $1$0 = 0;
 $1$0 = ___udivmoddi4($a$0, $a$1, $b$0, $b$1, 0) | 0;
 return $1$0 | 0;
}

Module["___udivdi3"] = ___udivdi3;

function ___uremdi3($a$0, $a$1, $b$0, $b$1) {
 $a$0 = $a$0 | 0;
 $a$1 = $a$1 | 0;
 $b$0 = $b$0 | 0;
 $b$1 = $b$1 | 0;
 var $rem = 0, __stackBase__ = 0;
 __stackBase__ = STACKTOP;
 STACKTOP = STACKTOP + 16 | 0;
 $rem = __stackBase__ | 0;
 ___udivmoddi4($a$0, $a$1, $b$0, $b$1, $rem) | 0;
 STACKTOP = __stackBase__;
 return (setTempRet0(HEAP32[$rem + 4 >> 2] | 0 | 0), HEAP32[$rem >> 2] | 0) | 0;
}

Module["___uremdi3"] = ___uremdi3;

function _printf(format, varargs) {
 var result = __formatString(format, varargs);
 var string = intArrayToString(result);
 if (string[string.length - 1] === "\n") string = string.substr(0, string.length - 1);
 out(string);
 return result.length;
}

Module["_printf"] = _printf;

function _puts(s) {
 var result = UTF8ToString(s);
 var string = result.substr(0);
 if (string[string.length - 1] === "\n") string = string.substr(0, string.length - 1);
 out(string);
 return result.length;
}

Module["_puts"] = _puts;

var __sigalrm_handler = 0;

Module["__sigalrm_handler"] = __sigalrm_handler;

function _signal(sig, func) {
 if (sig == 14) {
  __sigalrm_handler = func;
 } else {
  err("Calling stub instead of signal()");
 }
 return 0;
}

Module["_signal"] = _signal;

function _sigemptyset(set) {
 HEAP32[set >> 2] = 0;
 return 0;
}

Module["_sigemptyset"] = _sigemptyset;

function _sigfillset(set) {
 HEAP32[set >> 2] = -1 >>> 0;
 return 0;
}

Module["_sigfillset"] = _sigfillset;

function _sigaddset(set, signum) {
 HEAP32[set >> 2] = HEAP32[set >> 2] | 1 << signum - 1;
 return 0;
}

Module["_sigaddset"] = _sigaddset;

function _sigdelset(set, signum) {
 HEAP32[set >> 2] = HEAP32[set >> 2] & ~(1 << signum - 1);
 return 0;
}

Module["_sigdelset"] = _sigdelset;

function _sigismember(set, signum) {
 return HEAP32[set >> 2] & 1 << signum - 1;
}

Module["_sigismember"] = _sigismember;

function _sigaction(signum, act, oldact) {
 err("Calling stub instead of sigaction()");
 return 0;
}

Module["_sigaction"] = _sigaction;

function _sigprocmask() {
 err("Calling stub instead of sigprocmask()");
 return 0;
}

Module["_sigprocmask"] = _sigprocmask;

function ___libc_current_sigrtmin() {
 err("Calling stub instead of __libc_current_sigrtmin");
 return 0;
}

Module["___libc_current_sigrtmin"] = ___libc_current_sigrtmin;

function ___libc_current_sigrtmax() {
 err("Calling stub instead of __libc_current_sigrtmax");
 return 0;
}

Module["___libc_current_sigrtmax"] = ___libc_current_sigrtmax;

function _kill(pid, sig) {
 err("Calling stub instead of kill()");
 ___setErrNo(ERRNO_CODES.EPERM);
 return -1;
}

Module["_kill"] = _kill;

function _killpg() {
 err("Calling stub instead of killpg()");
 ___setErrNo(ERRNO_CODES.EPERM);
 return -1;
}

Module["_killpg"] = _killpg;

function _siginterrupt() {
 err("Calling stub instead of siginterrupt()");
 return 0;
}

Module["_siginterrupt"] = _siginterrupt;

function _raise(sig) {
 err("Calling stub instead of raise()");
 ___setErrNo(ERRNO_CODES.ENOSYS);
 warnOnce("raise() returning an error as we do not support it");
 return -1;
}

Module["_raise"] = _raise;

function _alarm(seconds) {
 setTimeout(function() {
  if (__sigalrm_handler) dynCall_vi(__sigalrm_handler, 0);
 }, seconds * 1e3);
}

Module["_alarm"] = _alarm;

function _ualarm() {
 throw "ualarm() is not implemented yet";
}

Module["_ualarm"] = _ualarm;

function _setitimer() {
 throw "setitimer() is not implemented yet";
}

Module["_setitimer"] = _setitimer;

function _getitimer() {
 throw "getitimer() is not implemented yet";
}

Module["_getitimer"] = _getitimer;

function _pause() {
 err("Calling stub instead of pause()");
 ___setErrNo(ERRNO_CODES.EINTR);
 return -1;
}

Module["_pause"] = _pause;

function _siglongjmp(env, value) {
 warnOnce("Calling longjmp() instead of siglongjmp()");
 _longjmp(env, value);
}

Module["_siglongjmp"] = _siglongjmp;

function _sigpending(set) {
 HEAP32[set >> 2] = 0;
 return 0;
}

Module["_sigpending"] = _sigpending;

function ___syscall1(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var status = SYSCALLS.get();
  exit(status);
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall1"] = ___syscall1;

function ___syscall3(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(), buf = SYSCALLS.get(), count = SYSCALLS.get();
  return FS.read(stream, HEAP8, buf, count);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall3"] = ___syscall3;

function ___syscall4(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(), buf = SYSCALLS.get(), count = SYSCALLS.get();
  return FS.write(stream, HEAP8, buf, count);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall4"] = ___syscall4;

function ___syscall5(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var pathname = SYSCALLS.getStr(), flags = SYSCALLS.get(), mode = SYSCALLS.get();
  var stream = FS.open(pathname, flags, mode);
  return stream.fd;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall5"] = ___syscall5;

function ___syscall9(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var oldpath = SYSCALLS.get(), newpath = SYSCALLS.get();
  return -34;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall9"] = ___syscall9;

function ___syscall10(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var path = SYSCALLS.getStr();
  FS.unlink(path);
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall10"] = ___syscall10;

function ___syscall12(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var path = SYSCALLS.getStr();
  FS.chdir(path);
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall12"] = ___syscall12;

function ___syscall14(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var path = SYSCALLS.getStr(), mode = SYSCALLS.get(), dev = SYSCALLS.get();
  return SYSCALLS.doMknod(path, mode, dev);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall14"] = ___syscall14;

function ___syscall15(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var path = SYSCALLS.getStr(), mode = SYSCALLS.get();
  FS.chmod(path, mode);
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall15"] = ___syscall15;

function ___syscall20(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  return PROCINFO.pid;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall20"] = ___syscall20;

function ___syscall29(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  return -27;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall29"] = ___syscall29;

function ___syscall33(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var path = SYSCALLS.getStr(), amode = SYSCALLS.get();
  return SYSCALLS.doAccess(path, amode);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall33"] = ___syscall33;

function ___syscall34(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var inc = SYSCALLS.get();
  return -63;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall34"] = ___syscall34;

function ___syscall36(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall36"] = ___syscall36;

function ___syscall38(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var old_path = SYSCALLS.getStr(), new_path = SYSCALLS.getStr();
  FS.rename(old_path, new_path);
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall38"] = ___syscall38;

function ___syscall39(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var path = SYSCALLS.getStr(), mode = SYSCALLS.get();
  return SYSCALLS.doMkdir(path, mode);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall39"] = ___syscall39;

function ___syscall40(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var path = SYSCALLS.getStr();
  FS.rmdir(path);
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall40"] = ___syscall40;

function ___syscall41(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var old = SYSCALLS.getStreamFromFD();
  return FS.open(old.path, old.flags, 0).fd;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall41"] = ___syscall41;

var PIPEFS = {
 BUCKET_BUFFER_SIZE: 8192,
 mount: function(mount) {
  return FS.createNode(null, "/", 16384 | 511, 0);
 },
 createPipe: function() {
  var pipe = {
   buckets: []
  };
  pipe.buckets.push({
   buffer: new Uint8Array(PIPEFS.BUCKET_BUFFER_SIZE),
   offset: 0,
   roffset: 0
  });
  var rName = PIPEFS.nextname();
  var wName = PIPEFS.nextname();
  var rNode = FS.createNode(PIPEFS.root, rName, 4096, 0);
  var wNode = FS.createNode(PIPEFS.root, wName, 4096, 0);
  rNode.pipe = pipe;
  wNode.pipe = pipe;
  var readableStream = FS.createStream({
   path: rName,
   node: rNode,
   flags: FS.modeStringToFlags("r"),
   seekable: false,
   stream_ops: PIPEFS.stream_ops
  });
  rNode.stream = readableStream;
  var writableStream = FS.createStream({
   path: wName,
   node: wNode,
   flags: FS.modeStringToFlags("w"),
   seekable: false,
   stream_ops: PIPEFS.stream_ops
  });
  wNode.stream = writableStream;
  return {
   readable_fd: readableStream.fd,
   writable_fd: writableStream.fd
  };
 },
 stream_ops: {
  poll: function(stream) {
   var pipe = stream.node.pipe;
   if ((stream.flags & 2097155) === 1) {
    return 256 | 4;
   } else {
    if (pipe.buckets.length > 0) {
     for (var i = 0; i < pipe.buckets.length; i++) {
      var bucket = pipe.buckets[i];
      if (bucket.offset - bucket.roffset > 0) {
       return 64 | 1;
      }
     }
    }
   }
   return 0;
  },
  ioctl: function(stream, request, varargs) {
   return ERRNO_CODES.EINVAL;
  },
  fsync: function(stream) {
   return ERRNO_CODES.EINVAL;
  },
  read: function(stream, buffer, offset, length, position) {
   var pipe = stream.node.pipe;
   var currentLength = 0;
   for (var i = 0; i < pipe.buckets.length; i++) {
    var bucket = pipe.buckets[i];
    currentLength += bucket.offset - bucket.roffset;
   }
   assert(buffer instanceof ArrayBuffer || ArrayBuffer.isView(buffer));
   var data = buffer.subarray(offset, offset + length);
   if (length <= 0) {
    return 0;
   }
   if (currentLength == 0) {
    throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
   }
   var toRead = Math.min(currentLength, length);
   var totalRead = toRead;
   var toRemove = 0;
   for (var i = 0; i < pipe.buckets.length; i++) {
    var currBucket = pipe.buckets[i];
    var bucketSize = currBucket.offset - currBucket.roffset;
    if (toRead <= bucketSize) {
     var tmpSlice = currBucket.buffer.subarray(currBucket.roffset, currBucket.offset);
     if (toRead < bucketSize) {
      tmpSlice = tmpSlice.subarray(0, toRead);
      currBucket.roffset += toRead;
     } else {
      toRemove++;
     }
     data.set(tmpSlice);
     break;
    } else {
     var tmpSlice = currBucket.buffer.subarray(currBucket.roffset, currBucket.offset);
     data.set(tmpSlice);
     data = data.subarray(tmpSlice.byteLength);
     toRead -= tmpSlice.byteLength;
     toRemove++;
    }
   }
   if (toRemove && toRemove == pipe.buckets.length) {
    toRemove--;
    pipe.buckets[toRemove].offset = 0;
    pipe.buckets[toRemove].roffset = 0;
   }
   pipe.buckets.splice(0, toRemove);
   return totalRead;
  },
  write: function(stream, buffer, offset, length, position) {
   var pipe = stream.node.pipe;
   assert(buffer instanceof ArrayBuffer || ArrayBuffer.isView(buffer));
   var data = buffer.subarray(offset, offset + length);
   var dataLen = data.byteLength;
   if (dataLen <= 0) {
    return 0;
   }
   var currBucket = null;
   if (pipe.buckets.length == 0) {
    currBucket = {
     buffer: new Uint8Array(PIPEFS.BUCKET_BUFFER_SIZE),
     offset: 0,
     roffset: 0
    };
    pipe.buckets.push(currBucket);
   } else {
    currBucket = pipe.buckets[pipe.buckets.length - 1];
   }
   assert(currBucket.offset <= PIPEFS.BUCKET_BUFFER_SIZE);
   var freeBytesInCurrBuffer = PIPEFS.BUCKET_BUFFER_SIZE - currBucket.offset;
   if (freeBytesInCurrBuffer >= dataLen) {
    currBucket.buffer.set(data, currBucket.offset);
    currBucket.offset += dataLen;
    return dataLen;
   } else if (freeBytesInCurrBuffer > 0) {
    currBucket.buffer.set(data.subarray(0, freeBytesInCurrBuffer), currBucket.offset);
    currBucket.offset += freeBytesInCurrBuffer;
    data = data.subarray(freeBytesInCurrBuffer, data.byteLength);
   }
   var numBuckets = data.byteLength / PIPEFS.BUCKET_BUFFER_SIZE | 0;
   var remElements = data.byteLength % PIPEFS.BUCKET_BUFFER_SIZE;
   for (var i = 0; i < numBuckets; i++) {
    var newBucket = {
     buffer: new Uint8Array(PIPEFS.BUCKET_BUFFER_SIZE),
     offset: PIPEFS.BUCKET_BUFFER_SIZE,
     roffset: 0
    };
    pipe.buckets.push(newBucket);
    newBucket.buffer.set(data.subarray(0, PIPEFS.BUCKET_BUFFER_SIZE));
    data = data.subarray(PIPEFS.BUCKET_BUFFER_SIZE, data.byteLength);
   }
   if (remElements > 0) {
    var newBucket = {
     buffer: new Uint8Array(PIPEFS.BUCKET_BUFFER_SIZE),
     offset: data.byteLength,
     roffset: 0
    };
    pipe.buckets.push(newBucket);
    newBucket.buffer.set(data);
   }
   return dataLen;
  },
  close: function(stream) {
   var pipe = stream.node.pipe;
   pipe.buckets = null;
  }
 },
 nextname: function() {
  if (!PIPEFS.nextname.current) {
   PIPEFS.nextname.current = 0;
  }
  return "pipe[" + PIPEFS.nextname.current++ + "]";
 }
};

Module["PIPEFS"] = PIPEFS;

function ___syscall42(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var fdPtr = SYSCALLS.get();
  if (fdPtr == 0) {
   throw new FS.ErrnoError(21);
  }
  var res = PIPEFS.createPipe();
  HEAP32[fdPtr >> 2] = res.readable_fd;
  HEAP32[fdPtr + 4 >> 2] = res.writable_fd;
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall42"] = ___syscall42;

function ___syscall51(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  return -52;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall51"] = ___syscall51;

function ___syscall54(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(), op = SYSCALLS.get();
  switch (op) {
  case 21509:
  case 21505:
   {
    if (!stream.tty) return -59;
    return 0;
   }

  case 21510:
  case 21511:
  case 21512:
  case 21506:
  case 21507:
  case 21508:
   {
    if (!stream.tty) return -59;
    return 0;
   }

  case 21519:
   {
    if (!stream.tty) return -59;
    var argp = SYSCALLS.get();
    HEAP32[argp >> 2] = 0;
    return 0;
   }

  case 21520:
   {
    if (!stream.tty) return -59;
    return -28;
   }

  case 21531:
   {
    var argp = SYSCALLS.get();
    return FS.ioctl(stream, op, argp);
   }

  case 21523:
   {
    if (!stream.tty) return -59;
    return 0;
   }

  case 21524:
   {
    if (!stream.tty) return -59;
    return 0;
   }

  default:
   abort("bad ioctl syscall " + op);
  }
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall54"] = ___syscall54;

function ___syscall57(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var pid = SYSCALLS.get(), pgid = SYSCALLS.get();
  if (pid && pid !== PROCINFO.pid) return -71;
  if (pgid && pgid !== PROCINFO.pgid) return -63;
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall57"] = ___syscall57;

function ___syscall60(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var mask = SYSCALLS.get();
  var old = SYSCALLS.umask;
  SYSCALLS.umask = mask;
  return old;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall60"] = ___syscall60;

function ___syscall63(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var old = SYSCALLS.getStreamFromFD(), suggestFD = SYSCALLS.get();
  if (old.fd === suggestFD) return suggestFD;
  return SYSCALLS.doDup(old.path, old.flags, suggestFD);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall63"] = ___syscall63;

function ___syscall64(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  return PROCINFO.ppid;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall64"] = ___syscall64;

function ___syscall65(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  return PROCINFO.pgid;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall65"] = ___syscall65;

function ___syscall66(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall66"] = ___syscall66;

function ___syscall75(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall75"] = ___syscall75;

function ___syscall77(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var who = SYSCALLS.get(), usage = SYSCALLS.get();
  _memset(usage, 0, 136);
  HEAP32[usage >> 2] = 1;
  HEAP32[usage + 4 >> 2] = 2;
  HEAP32[usage + 8 >> 2] = 3;
  HEAP32[usage + 12 >> 2] = 4;
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall77"] = ___syscall77;

function ___syscall83(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var target = SYSCALLS.getStr(), linkpath = SYSCALLS.getStr();
  FS.symlink(target, linkpath);
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall83"] = ___syscall83;

function ___syscall85(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var path = SYSCALLS.getStr(), buf = SYSCALLS.get(), bufsize = SYSCALLS.get();
  return SYSCALLS.doReadlink(path, buf, bufsize);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall85"] = ___syscall85;

function ___syscall91(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var addr = SYSCALLS.get(), len = SYSCALLS.get();
  return __emscripten_syscall_munmap(addr, len);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall91"] = ___syscall91;

function ___syscall94(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var fd = SYSCALLS.get(), mode = SYSCALLS.get();
  FS.fchmod(fd, mode);
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall94"] = ___syscall94;

function ___syscall96(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall96"] = ___syscall96;

function ___syscall97(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  return -63;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall97"] = ___syscall97;

var SOCKFS = {
 mount: function(mount) {
  Module["websocket"] = Module["websocket"] && "object" === typeof Module["websocket"] ? Module["websocket"] : {};
  Module["websocket"]._callbacks = {};
  Module["websocket"]["on"] = function(event, callback) {
   if ("function" === typeof callback) {
    this._callbacks[event] = callback;
   }
   return this;
  };
  Module["websocket"].emit = function(event, param) {
   if ("function" === typeof this._callbacks[event]) {
    this._callbacks[event].call(this, param);
   }
  };
  return FS.createNode(null, "/", 16384 | 511, 0);
 },
 createSocket: function(family, type, protocol) {
  var streaming = type == 1;
  if (protocol) {
   assert(streaming == (protocol == 6));
  }
  var sock = {
   family: family,
   type: type,
   protocol: protocol,
   server: null,
   error: null,
   peers: {},
   pending: [],
   recv_queue: [],
   sock_ops: SOCKFS.websocket_sock_ops
  };
  var name = SOCKFS.nextname();
  var node = FS.createNode(SOCKFS.root, name, 49152, 0);
  node.sock = sock;
  var stream = FS.createStream({
   path: name,
   node: node,
   flags: FS.modeStringToFlags("r+"),
   seekable: false,
   stream_ops: SOCKFS.stream_ops
  });
  sock.stream = stream;
  return sock;
 },
 getSocket: function(fd) {
  var stream = FS.getStream(fd);
  if (!stream || !FS.isSocket(stream.node.mode)) {
   return null;
  }
  return stream.node.sock;
 },
 stream_ops: {
  poll: function(stream) {
   var sock = stream.node.sock;
   return sock.sock_ops.poll(sock);
  },
  ioctl: function(stream, request, varargs) {
   var sock = stream.node.sock;
   return sock.sock_ops.ioctl(sock, request, varargs);
  },
  read: function(stream, buffer, offset, length, position) {
   var sock = stream.node.sock;
   var msg = sock.sock_ops.recvmsg(sock, length);
   if (!msg) {
    return 0;
   }
   buffer.set(msg.buffer, offset);
   return msg.buffer.length;
  },
  write: function(stream, buffer, offset, length, position) {
   var sock = stream.node.sock;
   return sock.sock_ops.sendmsg(sock, buffer, offset, length);
  },
  close: function(stream) {
   var sock = stream.node.sock;
   sock.sock_ops.close(sock);
  }
 },
 nextname: function() {
  if (!SOCKFS.nextname.current) {
   SOCKFS.nextname.current = 0;
  }
  return "socket[" + SOCKFS.nextname.current++ + "]";
 },
 websocket_sock_ops: {
  createPeer: function(sock, addr, port) {
   var ws;
   if (typeof addr === "object") {
    ws = addr;
    addr = null;
    port = null;
   }
   if (ws) {
    if (ws._socket) {
     addr = ws._socket.remoteAddress;
     port = ws._socket.remotePort;
    } else {
     var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
     if (!result) {
      throw new Error("WebSocket URL must be in the format ws(s)://address:port");
     }
     addr = result[1];
     port = parseInt(result[2], 10);
    }
   } else {
    try {
     var runtimeConfig = Module["websocket"] && "object" === typeof Module["websocket"];
     var url = "ws:#".replace("#", "//");
     if (runtimeConfig) {
      if ("string" === typeof Module["websocket"]["url"]) {
       url = Module["websocket"]["url"];
      }
     }
     if (url === "ws://" || url === "wss://") {
      var parts = addr.split("/");
      url = url + parts[0] + ":" + port + "/" + parts.slice(1).join("/");
     }
     var subProtocols = "binary";
     if (runtimeConfig) {
      if ("string" === typeof Module["websocket"]["subprotocol"]) {
       subProtocols = Module["websocket"]["subprotocol"];
      }
     }
     var opts = undefined;
     if (subProtocols !== "null") {
      subProtocols = subProtocols.replace(/^ +| +$/g, "").split(/ *, */);
      opts = ENVIRONMENT_IS_NODE ? {
       "protocol": subProtocols.toString()
      } : subProtocols;
     }
     if (runtimeConfig && null === Module["websocket"]["subprotocol"]) {
      subProtocols = "null";
      opts = undefined;
     }
     var WebSocketConstructor;
     if (ENVIRONMENT_IS_NODE) {
      WebSocketConstructor = require("ws");
     } else if (ENVIRONMENT_IS_WEB) {
      WebSocketConstructor = window["WebSocket"];
     } else {
      WebSocketConstructor = WebSocket;
     }
     ws = new WebSocketConstructor(url, opts);
     ws.binaryType = "arraybuffer";
    } catch (e) {
     throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
    }
   }
   var peer = {
    addr: addr,
    port: port,
    socket: ws,
    dgram_send_queue: []
   };
   SOCKFS.websocket_sock_ops.addPeer(sock, peer);
   SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
   if (sock.type === 2 && typeof sock.sport !== "undefined") {
    peer.dgram_send_queue.push(new Uint8Array([ 255, 255, 255, 255, "p".charCodeAt(0), "o".charCodeAt(0), "r".charCodeAt(0), "t".charCodeAt(0), (sock.sport & 65280) >> 8, sock.sport & 255 ]));
   }
   return peer;
  },
  getPeer: function(sock, addr, port) {
   return sock.peers[addr + ":" + port];
  },
  addPeer: function(sock, peer) {
   sock.peers[peer.addr + ":" + peer.port] = peer;
  },
  removePeer: function(sock, peer) {
   delete sock.peers[peer.addr + ":" + peer.port];
  },
  handlePeerEvents: function(sock, peer) {
   var first = true;
   var handleOpen = function() {
    Module["websocket"].emit("open", sock.stream.fd);
    try {
     var queued = peer.dgram_send_queue.shift();
     while (queued) {
      peer.socket.send(queued);
      queued = peer.dgram_send_queue.shift();
     }
    } catch (e) {
     peer.socket.close();
    }
   };
   function handleMessage(data) {
    if (typeof data === "string") {
     var encoder = new TextEncoder();
     data = encoder.encode(data);
    } else {
     assert(data.byteLength !== undefined);
     if (data.byteLength == 0) {
      return;
     } else {
      data = new Uint8Array(data);
     }
    }
    var wasfirst = first;
    first = false;
    if (wasfirst && data.length === 10 && data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 && data[4] === "p".charCodeAt(0) && data[5] === "o".charCodeAt(0) && data[6] === "r".charCodeAt(0) && data[7] === "t".charCodeAt(0)) {
     var newport = data[8] << 8 | data[9];
     SOCKFS.websocket_sock_ops.removePeer(sock, peer);
     peer.port = newport;
     SOCKFS.websocket_sock_ops.addPeer(sock, peer);
     return;
    }
    sock.recv_queue.push({
     addr: peer.addr,
     port: peer.port,
     data: data
    });
    Module["websocket"].emit("message", sock.stream.fd);
   }
   if (ENVIRONMENT_IS_NODE) {
    peer.socket.on("open", handleOpen);
    peer.socket.on("message", function(data, flags) {
     if (!flags.binary) {
      return;
     }
     handleMessage(new Uint8Array(data).buffer);
    });
    peer.socket.on("close", function() {
     Module["websocket"].emit("close", sock.stream.fd);
    });
    peer.socket.on("error", function(error) {
     sock.error = ERRNO_CODES.ECONNREFUSED;
     Module["websocket"].emit("error", [ sock.stream.fd, sock.error, "ECONNREFUSED: Connection refused" ]);
    });
   } else {
    peer.socket.onopen = handleOpen;
    peer.socket.onclose = function() {
     Module["websocket"].emit("close", sock.stream.fd);
    };
    peer.socket.onmessage = function peer_socket_onmessage(event) {
     handleMessage(event.data);
    };
    peer.socket.onerror = function(error) {
     sock.error = ERRNO_CODES.ECONNREFUSED;
     Module["websocket"].emit("error", [ sock.stream.fd, sock.error, "ECONNREFUSED: Connection refused" ]);
    };
   }
  },
  poll: function(sock) {
   if (sock.type === 1 && sock.server) {
    return sock.pending.length ? 64 | 1 : 0;
   }
   var mask = 0;
   var dest = sock.type === 1 ? SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) : null;
   if (sock.recv_queue.length || !dest || dest && dest.socket.readyState === dest.socket.CLOSING || dest && dest.socket.readyState === dest.socket.CLOSED) {
    mask |= 64 | 1;
   }
   if (!dest || dest && dest.socket.readyState === dest.socket.OPEN) {
    mask |= 4;
   }
   if (dest && dest.socket.readyState === dest.socket.CLOSING || dest && dest.socket.readyState === dest.socket.CLOSED) {
    mask |= 16;
   }
   return mask;
  },
  ioctl: function(sock, request, arg) {
   switch (request) {
   case 21531:
    var bytes = 0;
    if (sock.recv_queue.length) {
     bytes = sock.recv_queue[0].data.length;
    }
    HEAP32[arg >> 2] = bytes;
    return 0;

   default:
    return ERRNO_CODES.EINVAL;
   }
  },
  close: function(sock) {
   if (sock.server) {
    try {
     sock.server.close();
    } catch (e) {}
    sock.server = null;
   }
   var peers = Object.keys(sock.peers);
   for (var i = 0; i < peers.length; i++) {
    var peer = sock.peers[peers[i]];
    try {
     peer.socket.close();
    } catch (e) {}
    SOCKFS.websocket_sock_ops.removePeer(sock, peer);
   }
   return 0;
  },
  bind: function(sock, addr, port) {
   if (typeof sock.saddr !== "undefined" || typeof sock.sport !== "undefined") {
    throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
   }
   sock.saddr = addr;
   sock.sport = port;
   if (sock.type === 2) {
    if (sock.server) {
     sock.server.close();
     sock.server = null;
    }
    try {
     sock.sock_ops.listen(sock, 0);
    } catch (e) {
     if (!(e instanceof FS.ErrnoError)) throw e;
     if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
    }
   }
  },
  connect: function(sock, addr, port) {
   if (sock.server) {
    throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
   }
   if (typeof sock.daddr !== "undefined" && typeof sock.dport !== "undefined") {
    var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
    if (dest) {
     if (dest.socket.readyState === dest.socket.CONNECTING) {
      throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
     } else {
      throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
     }
    }
   }
   var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
   sock.daddr = peer.addr;
   sock.dport = peer.port;
   throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
  },
  listen: function(sock, backlog) {
   if (!ENVIRONMENT_IS_NODE) {
    throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
   }
   if (sock.server) {
    throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
   }
   var WebSocketServer = require("ws").Server;
   var host = sock.saddr;
   sock.server = new WebSocketServer({
    host: host,
    port: sock.sport
   });
   Module["websocket"].emit("listen", sock.stream.fd);
   sock.server.on("connection", function(ws) {
    if (sock.type === 1) {
     var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
     var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
     newsock.daddr = peer.addr;
     newsock.dport = peer.port;
     sock.pending.push(newsock);
     Module["websocket"].emit("connection", newsock.stream.fd);
    } else {
     SOCKFS.websocket_sock_ops.createPeer(sock, ws);
     Module["websocket"].emit("connection", sock.stream.fd);
    }
   });
   sock.server.on("closed", function() {
    Module["websocket"].emit("close", sock.stream.fd);
    sock.server = null;
   });
   sock.server.on("error", function(error) {
    sock.error = ERRNO_CODES.EHOSTUNREACH;
    Module["websocket"].emit("error", [ sock.stream.fd, sock.error, "EHOSTUNREACH: Host is unreachable" ]);
   });
  },
  accept: function(listensock) {
   if (!listensock.server) {
    throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
   }
   var newsock = listensock.pending.shift();
   newsock.stream.flags = listensock.stream.flags;
   return newsock;
  },
  getname: function(sock, peer) {
   var addr, port;
   if (peer) {
    if (sock.daddr === undefined || sock.dport === undefined) {
     throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
    }
    addr = sock.daddr;
    port = sock.dport;
   } else {
    addr = sock.saddr || 0;
    port = sock.sport || 0;
   }
   return {
    addr: addr,
    port: port
   };
  },
  sendmsg: function(sock, buffer, offset, length, addr, port) {
   if (sock.type === 2) {
    if (addr === undefined || port === undefined) {
     addr = sock.daddr;
     port = sock.dport;
    }
    if (addr === undefined || port === undefined) {
     throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
    }
   } else {
    addr = sock.daddr;
    port = sock.dport;
   }
   var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
   if (sock.type === 1) {
    if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
     throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
    } else if (dest.socket.readyState === dest.socket.CONNECTING) {
     throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
    }
   }
   if (ArrayBuffer.isView(buffer)) {
    offset += buffer.byteOffset;
    buffer = buffer.buffer;
   }
   var data;
   data = buffer.slice(offset, offset + length);
   if (sock.type === 2) {
    if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
     if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
      dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
     }
     dest.dgram_send_queue.push(data);
     return length;
    }
   }
   try {
    dest.socket.send(data);
    return length;
   } catch (e) {
    throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
   }
  },
  recvmsg: function(sock, length) {
   if (sock.type === 1 && sock.server) {
    throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
   }
   var queued = sock.recv_queue.shift();
   if (!queued) {
    if (sock.type === 1) {
     var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
     if (!dest) {
      throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
     } else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
      return null;
     } else {
      throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
     }
    } else {
     throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
    }
   }
   var queuedLength = queued.data.byteLength || queued.data.length;
   var queuedOffset = queued.data.byteOffset || 0;
   var queuedBuffer = queued.data.buffer || queued.data;
   var bytesRead = Math.min(length, queuedLength);
   var res = {
    buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
    addr: queued.addr,
    port: queued.port
   };
   if (sock.type === 1 && bytesRead < queuedLength) {
    var bytesRemaining = queuedLength - bytesRead;
    queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
    sock.recv_queue.unshift(queued);
   }
   return res;
  }
 }
};

Module["SOCKFS"] = SOCKFS;

function ___syscall102(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var call = SYSCALLS.get(), socketvararg = SYSCALLS.get();
  SYSCALLS.varargs = socketvararg;
  var getSocketFromFD = function() {
   var socket = SOCKFS.getSocket(SYSCALLS.get());
   if (!socket) throw new FS.ErrnoError(8);
   return socket;
  };
  var getSocketAddress = function(allowNull) {
   var addrp = SYSCALLS.get(), addrlen = SYSCALLS.get();
   if (allowNull && addrp === 0) return null;
   var info = __read_sockaddr(addrp, addrlen);
   if (info.errno) throw new FS.ErrnoError(info.errno);
   info.addr = DNS.lookup_addr(info.addr) || info.addr;
   return info;
  };
  switch (call) {
  case 1:
   {
    var domain = SYSCALLS.get(), type = SYSCALLS.get(), protocol = SYSCALLS.get();
    var sock = SOCKFS.createSocket(domain, type, protocol);
    assert(sock.stream.fd < 64);
    return sock.stream.fd;
   }

  case 2:
   {
    var sock = getSocketFromFD(), info = getSocketAddress();
    sock.sock_ops.bind(sock, info.addr, info.port);
    return 0;
   }

  case 3:
   {
    var sock = getSocketFromFD(), info = getSocketAddress();
    sock.sock_ops.connect(sock, info.addr, info.port);
    return 0;
   }

  case 4:
   {
    var sock = getSocketFromFD(), backlog = SYSCALLS.get();
    sock.sock_ops.listen(sock, backlog);
    return 0;
   }

  case 5:
   {
    var sock = getSocketFromFD(), addr = SYSCALLS.get(), addrlen = SYSCALLS.get();
    var newsock = sock.sock_ops.accept(sock);
    if (addr) {
     var res = __write_sockaddr(addr, newsock.family, DNS.lookup_name(newsock.daddr), newsock.dport);
     assert(!res.errno);
    }
    return newsock.stream.fd;
   }

  case 6:
   {
    var sock = getSocketFromFD(), addr = SYSCALLS.get(), addrlen = SYSCALLS.get();
    var res = __write_sockaddr(addr, sock.family, DNS.lookup_name(sock.saddr || "0.0.0.0"), sock.sport);
    assert(!res.errno);
    return 0;
   }

  case 7:
   {
    var sock = getSocketFromFD(), addr = SYSCALLS.get(), addrlen = SYSCALLS.get();
    if (!sock.daddr) {
     return -53;
    }
    var res = __write_sockaddr(addr, sock.family, DNS.lookup_name(sock.daddr), sock.dport);
    assert(!res.errno);
    return 0;
   }

  case 11:
   {
    var sock = getSocketFromFD(), message = SYSCALLS.get(), length = SYSCALLS.get(), flags = SYSCALLS.get(), dest = getSocketAddress(true);
    if (!dest) {
     return FS.write(sock.stream, HEAP8, message, length);
    } else {
     return sock.sock_ops.sendmsg(sock, HEAP8, message, length, dest.addr, dest.port);
    }
   }

  case 12:
   {
    var sock = getSocketFromFD(), buf = SYSCALLS.get(), len = SYSCALLS.get(), flags = SYSCALLS.get(), addr = SYSCALLS.get(), addrlen = SYSCALLS.get();
    var msg = sock.sock_ops.recvmsg(sock, len);
    if (!msg) return 0;
    if (addr) {
     var res = __write_sockaddr(addr, sock.family, DNS.lookup_name(msg.addr), msg.port);
     assert(!res.errno);
    }
    HEAPU8.set(msg.buffer, buf);
    return msg.buffer.byteLength;
   }

  case 14:
   {
    return -50;
   }

  case 15:
   {
    var sock = getSocketFromFD(), level = SYSCALLS.get(), optname = SYSCALLS.get(), optval = SYSCALLS.get(), optlen = SYSCALLS.get();
    if (level === 1) {
     if (optname === 4) {
      HEAP32[optval >> 2] = sock.error;
      HEAP32[optlen >> 2] = 4;
      sock.error = null;
      return 0;
     }
    }
    return -50;
   }

  case 16:
   {
    var sock = getSocketFromFD(), message = SYSCALLS.get(), flags = SYSCALLS.get();
    var iov = HEAP32[message + 8 >> 2];
    var num = HEAP32[message + 12 >> 2];
    var addr, port;
    var name = HEAP32[message >> 2];
    var namelen = HEAP32[message + 4 >> 2];
    if (name) {
     var info = __read_sockaddr(name, namelen);
     if (info.errno) return -info.errno;
     port = info.port;
     addr = DNS.lookup_addr(info.addr) || info.addr;
    }
    var total = 0;
    for (var i = 0; i < num; i++) {
     total += HEAP32[iov + (8 * i + 4) >> 2];
    }
    var view = new Uint8Array(total);
    var offset = 0;
    for (var i = 0; i < num; i++) {
     var iovbase = HEAP32[iov + (8 * i + 0) >> 2];
     var iovlen = HEAP32[iov + (8 * i + 4) >> 2];
     for (var j = 0; j < iovlen; j++) {
      view[offset++] = HEAP8[iovbase + j >> 0];
     }
    }
    return sock.sock_ops.sendmsg(sock, view, 0, total, addr, port);
   }

  case 17:
   {
    var sock = getSocketFromFD(), message = SYSCALLS.get(), flags = SYSCALLS.get();
    var iov = HEAP32[message + 8 >> 2];
    var num = HEAP32[message + 12 >> 2];
    var total = 0;
    for (var i = 0; i < num; i++) {
     total += HEAP32[iov + (8 * i + 4) >> 2];
    }
    var msg = sock.sock_ops.recvmsg(sock, total);
    if (!msg) return 0;
    var name = HEAP32[message >> 2];
    if (name) {
     var res = __write_sockaddr(name, sock.family, DNS.lookup_name(msg.addr), msg.port);
     assert(!res.errno);
    }
    var bytesRead = 0;
    var bytesRemaining = msg.buffer.byteLength;
    for (var i = 0; bytesRemaining > 0 && i < num; i++) {
     var iovbase = HEAP32[iov + (8 * i + 0) >> 2];
     var iovlen = HEAP32[iov + (8 * i + 4) >> 2];
     if (!iovlen) {
      continue;
     }
     var length = Math.min(iovlen, bytesRemaining);
     var buf = msg.buffer.subarray(bytesRead, bytesRead + length);
     HEAPU8.set(buf, iovbase + bytesRead);
     bytesRead += length;
     bytesRemaining -= length;
    }
    return bytesRead;
   }

  default:
   {
    return -52;
   }
  }
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall102"] = ___syscall102;

function ___syscall104(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  return -52;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall104"] = ___syscall104;

function ___syscall114(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  abort("cannot wait on child processes");
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall114"] = ___syscall114;

function ___syscall121(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  return -63;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall121"] = ___syscall121;

function ___syscall122(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var buf = SYSCALLS.get();
  if (!buf) return -21;
  var layout = {
   "__size__": 390,
   "sysname": 0,
   "nodename": 65,
   "release": 130,
   "version": 195,
   "machine": 260,
   "domainname": 325
  };
  var copyString = function(element, value) {
   var offset = layout[element];
   writeAsciiToMemory(value, buf + offset);
  };
  copyString("sysname", "Emscripten");
  copyString("nodename", "emscripten");
  copyString("release", "1.0");
  copyString("version", "#1");
  copyString("machine", "x86-JS");
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall122"] = ___syscall122;

function ___syscall125(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall125"] = ___syscall125;

function ___syscall132(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var pid = SYSCALLS.get();
  if (pid && pid !== PROCINFO.pid) return -71;
  return PROCINFO.pgid;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall132"] = ___syscall132;

function ___syscall133(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD();
  FS.chdir(stream.path);
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall133"] = ___syscall133;

function ___syscall142(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var nfds = SYSCALLS.get(), readfds = SYSCALLS.get(), writefds = SYSCALLS.get(), exceptfds = SYSCALLS.get(), timeout = SYSCALLS.get();
  assert(nfds <= 64, "nfds must be less than or equal to 64");
  assert(!exceptfds, "exceptfds not supported");
  var total = 0;
  var srcReadLow = readfds ? HEAP32[readfds >> 2] : 0, srcReadHigh = readfds ? HEAP32[readfds + 4 >> 2] : 0;
  var srcWriteLow = writefds ? HEAP32[writefds >> 2] : 0, srcWriteHigh = writefds ? HEAP32[writefds + 4 >> 2] : 0;
  var srcExceptLow = exceptfds ? HEAP32[exceptfds >> 2] : 0, srcExceptHigh = exceptfds ? HEAP32[exceptfds + 4 >> 2] : 0;
  var dstReadLow = 0, dstReadHigh = 0;
  var dstWriteLow = 0, dstWriteHigh = 0;
  var dstExceptLow = 0, dstExceptHigh = 0;
  var allLow = (readfds ? HEAP32[readfds >> 2] : 0) | (writefds ? HEAP32[writefds >> 2] : 0) | (exceptfds ? HEAP32[exceptfds >> 2] : 0);
  var allHigh = (readfds ? HEAP32[readfds + 4 >> 2] : 0) | (writefds ? HEAP32[writefds + 4 >> 2] : 0) | (exceptfds ? HEAP32[exceptfds + 4 >> 2] : 0);
  var check = function(fd, low, high, val) {
   return fd < 32 ? low & val : high & val;
  };
  for (var fd = 0; fd < nfds; fd++) {
   var mask = 1 << fd % 32;
   if (!check(fd, allLow, allHigh, mask)) {
    continue;
   }
   var stream = FS.getStream(fd);
   if (!stream) throw new FS.ErrnoError(8);
   var flags = SYSCALLS.DEFAULT_POLLMASK;
   if (stream.stream_ops.poll) {
    flags = stream.stream_ops.poll(stream);
   }
   if (flags & 1 && check(fd, srcReadLow, srcReadHigh, mask)) {
    fd < 32 ? dstReadLow = dstReadLow | mask : dstReadHigh = dstReadHigh | mask;
    total++;
   }
   if (flags & 4 && check(fd, srcWriteLow, srcWriteHigh, mask)) {
    fd < 32 ? dstWriteLow = dstWriteLow | mask : dstWriteHigh = dstWriteHigh | mask;
    total++;
   }
   if (flags & 2 && check(fd, srcExceptLow, srcExceptHigh, mask)) {
    fd < 32 ? dstExceptLow = dstExceptLow | mask : dstExceptHigh = dstExceptHigh | mask;
    total++;
   }
  }
  if (readfds) {
   HEAP32[readfds >> 2] = dstReadLow;
   HEAP32[readfds + 4 >> 2] = dstReadHigh;
  }
  if (writefds) {
   HEAP32[writefds >> 2] = dstWriteLow;
   HEAP32[writefds + 4 >> 2] = dstWriteHigh;
  }
  if (exceptfds) {
   HEAP32[exceptfds >> 2] = dstExceptLow;
   HEAP32[exceptfds + 4 >> 2] = dstExceptHigh;
  }
  return total;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall142"] = ___syscall142;

function ___syscall144(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var addr = SYSCALLS.get(), len = SYSCALLS.get(), flags = SYSCALLS.get();
  var info = SYSCALLS.mappings[addr];
  if (!info) return 0;
  SYSCALLS.doMsync(addr, FS.getStream(info.fd), len, info.flags, 0);
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall144"] = ___syscall144;

function ___syscall147(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var pid = SYSCALLS.get();
  if (pid && pid !== PROCINFO.pid) return -71;
  return PROCINFO.sid;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall147"] = ___syscall147;

function ___syscall148(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD();
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall148"] = ___syscall148;

function ___syscall153(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall153"] = ___syscall153;

function ___syscall150(a0, a1) {
 return ___syscall153(a0, a1);
}

Module["___syscall150"] = ___syscall150;

function ___syscall151(a0, a1) {
 return ___syscall153(a0, a1);
}

Module["___syscall151"] = ___syscall151;

function ___syscall152(a0, a1) {
 return ___syscall153(a0, a1);
}

Module["___syscall152"] = ___syscall152;

function ___syscall163(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  return -48;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall163"] = ___syscall163;

function ___syscall168(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var fds = SYSCALLS.get(), nfds = SYSCALLS.get(), timeout = SYSCALLS.get();
  var nonzero = 0;
  for (var i = 0; i < nfds; i++) {
   var pollfd = fds + 8 * i;
   var fd = HEAP32[pollfd >> 2];
   var events = HEAP16[pollfd + 4 >> 1];
   var mask = 32;
   var stream = FS.getStream(fd);
   if (stream) {
    mask = SYSCALLS.DEFAULT_POLLMASK;
    if (stream.stream_ops.poll) {
     mask = stream.stream_ops.poll(stream);
    }
   }
   mask &= events | 8 | 16;
   if (mask) nonzero++;
   HEAP16[pollfd + 6 >> 1] = mask;
  }
  return nonzero;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall168"] = ___syscall168;

function ___syscall178(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall178"] = ___syscall178;

function ___syscall180(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(), buf = SYSCALLS.get(), count = SYSCALLS.get(), zero = SYSCALLS.getZero(), offset = SYSCALLS.get64();
  return FS.read(stream, HEAP8, buf, count, offset);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall180"] = ___syscall180;

function ___syscall181(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(), buf = SYSCALLS.get(), count = SYSCALLS.get(), zero = SYSCALLS.getZero(), offset = SYSCALLS.get64();
  return FS.write(stream, HEAP8, buf, count, offset);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall181"] = ___syscall181;

function ___syscall183(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var buf = SYSCALLS.get(), size = SYSCALLS.get();
  if (size === 0) return -28;
  var cwd = FS.cwd();
  var cwdLengthInBytes = lengthBytesUTF8(cwd);
  if (size < cwdLengthInBytes + 1) return -68;
  stringToUTF8(cwd, buf, size);
  return buf;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall183"] = ___syscall183;

function ___syscall191(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var resource = SYSCALLS.get(), rlim = SYSCALLS.get();
  HEAP32[rlim >> 2] = -1;
  HEAP32[rlim + 4 >> 2] = -1;
  HEAP32[rlim + 8 >> 2] = -1;
  HEAP32[rlim + 12 >> 2] = -1;
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall191"] = ___syscall191;

function ___syscall192(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var addr = SYSCALLS.get(), len = SYSCALLS.get(), prot = SYSCALLS.get(), flags = SYSCALLS.get(), fd = SYSCALLS.get(), off = SYSCALLS.get();
  return __emscripten_syscall_mmap2(addr, len, prot, flags, fd, off);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall192"] = ___syscall192;

function ___syscall193(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var path = SYSCALLS.getStr(), zero = SYSCALLS.getZero(), length = SYSCALLS.get64();
  FS.truncate(path, length);
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall193"] = ___syscall193;

function ___syscall194(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var fd = SYSCALLS.get(), zero = SYSCALLS.getZero(), length = SYSCALLS.get64();
  FS.ftruncate(fd, length);
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall194"] = ___syscall194;

function ___syscall195(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var path = SYSCALLS.getStr(), buf = SYSCALLS.get();
  return SYSCALLS.doStat(FS.stat, path, buf);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall195"] = ___syscall195;

function ___syscall196(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var path = SYSCALLS.getStr(), buf = SYSCALLS.get();
  return SYSCALLS.doStat(FS.lstat, path, buf);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall196"] = ___syscall196;

function ___syscall197(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(), buf = SYSCALLS.get();
  return SYSCALLS.doStat(FS.stat, stream.path, buf);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall197"] = ___syscall197;

function ___syscall198(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var path = SYSCALLS.getStr(), owner = SYSCALLS.get(), group = SYSCALLS.get();
  FS.chown(path, owner, group);
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall198"] = ___syscall198;

function ___syscall202(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall202"] = ___syscall202;

function ___syscall199(a0, a1) {
 return ___syscall202(a0, a1);
}

Module["___syscall199"] = ___syscall199;

function ___syscall200(a0, a1) {
 return ___syscall202(a0, a1);
}

Module["___syscall200"] = ___syscall200;

function ___syscall201(a0, a1) {
 return ___syscall202(a0, a1);
}

Module["___syscall201"] = ___syscall201;

function ___syscall207(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var fd = SYSCALLS.get(), owner = SYSCALLS.get(), group = SYSCALLS.get();
  FS.fchown(fd, owner, group);
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall207"] = ___syscall207;

function ___syscall212(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var path = SYSCALLS.getStr(), owner = SYSCALLS.get(), group = SYSCALLS.get();
  FS.chown(path, owner, group);
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall212"] = ___syscall212;

function ___syscall214(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var uid = SYSCALLS.get();
  if (uid !== 0) return -63;
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall214"] = ___syscall214;

function ___syscall203(a0, a1) {
 return ___syscall214(a0, a1);
}

Module["___syscall203"] = ___syscall203;

function ___syscall204(a0, a1) {
 return ___syscall214(a0, a1);
}

Module["___syscall204"] = ___syscall204;

function ___syscall213(a0, a1) {
 return ___syscall214(a0, a1);
}

Module["___syscall213"] = ___syscall213;

function ___syscall205(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var size = SYSCALLS.get(), list = SYSCALLS.get();
  if (size < 1) return -28;
  HEAP32[list >> 2] = 0;
  return 1;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall205"] = ___syscall205;

function ___syscall210(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var ruid = SYSCALLS.get(), euid = SYSCALLS.get(), suid = SYSCALLS.get();
  if (euid !== 0) return -63;
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall210"] = ___syscall210;

function ___syscall208(a0, a1) {
 return ___syscall210(a0, a1);
}

Module["___syscall208"] = ___syscall208;

function ___syscall211(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var ruid = SYSCALLS.get(), euid = SYSCALLS.get(), suid = SYSCALLS.get();
  HEAP32[ruid >> 2] = 0;
  HEAP32[euid >> 2] = 0;
  HEAP32[suid >> 2] = 0;
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall211"] = ___syscall211;

function ___syscall209(a0, a1) {
 return ___syscall211(a0, a1);
}

Module["___syscall209"] = ___syscall209;

function ___syscall218(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  return -52;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall218"] = ___syscall218;

function ___syscall219(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall219"] = ___syscall219;

function ___syscall220(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(), dirp = SYSCALLS.get(), count = SYSCALLS.get();
  if (!stream.getdents) {
   stream.getdents = FS.readdir(stream.path);
  }
  var struct_size = 280;
  var pos = 0;
  var off = FS.llseek(stream, 0, 1);
  var idx = Math.floor(off / struct_size);
  while (idx < stream.getdents.length && pos + struct_size <= count) {
   var id;
   var type;
   var name = stream.getdents[idx];
   if (name[0] === ".") {
    id = 1;
    type = 4;
   } else {
    var child = FS.lookupNode(stream.node, name);
    id = child.id;
    type = FS.isChrdev(child.mode) ? 2 : FS.isDir(child.mode) ? 4 : FS.isLink(child.mode) ? 10 : 8;
   }
   tempI64 = [ id >>> 0, (tempDouble = id, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
   HEAP32[dirp + pos >> 2] = tempI64[0], HEAP32[dirp + pos + 4 >> 2] = tempI64[1];
   tempI64 = [ (idx + 1) * struct_size >>> 0, (tempDouble = (idx + 1) * struct_size, 
   +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
   HEAP32[dirp + pos + 8 >> 2] = tempI64[0], HEAP32[dirp + pos + 12 >> 2] = tempI64[1];
   HEAP16[dirp + pos + 16 >> 1] = 280;
   HEAP8[dirp + pos + 18 >> 0] = type;
   stringToUTF8(name, dirp + pos + 19, 256);
   pos += struct_size;
   idx += 1;
  }
  FS.llseek(stream, idx * struct_size, 0);
  return pos;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall220"] = ___syscall220;

function ___syscall221(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(), cmd = SYSCALLS.get();
  switch (cmd) {
  case 0:
   {
    var arg = SYSCALLS.get();
    if (arg < 0) {
     return -28;
    }
    var newStream;
    newStream = FS.open(stream.path, stream.flags, 0, arg);
    return newStream.fd;
   }

  case 1:
  case 2:
   return 0;

  case 3:
   return stream.flags;

  case 4:
   {
    var arg = SYSCALLS.get();
    stream.flags |= arg;
    return 0;
   }

  case 12:
   {
    var arg = SYSCALLS.get();
    var offset = 0;
    HEAP16[arg + offset >> 1] = 2;
    return 0;
   }

  case 13:
  case 14:
   return 0;

  case 16:
  case 8:
   return -28;

  case 9:
   ___setErrNo(28);
   return -1;

  default:
   {
    return -28;
   }
  }
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall221"] = ___syscall221;

function ___syscall252(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var status = SYSCALLS.get();
  exit(status);
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall252"] = ___syscall252;

function ___syscall268(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var path = SYSCALLS.getStr(), size = SYSCALLS.get(), buf = SYSCALLS.get();
  assert(size === 64);
  HEAP32[buf + 4 >> 2] = 4096;
  HEAP32[buf + 40 >> 2] = 4096;
  HEAP32[buf + 8 >> 2] = 1e6;
  HEAP32[buf + 12 >> 2] = 5e5;
  HEAP32[buf + 16 >> 2] = 5e5;
  HEAP32[buf + 20 >> 2] = FS.nextInode;
  HEAP32[buf + 24 >> 2] = 1e6;
  HEAP32[buf + 28 >> 2] = 42;
  HEAP32[buf + 44 >> 2] = 2;
  HEAP32[buf + 36 >> 2] = 255;
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall268"] = ___syscall268;

function ___syscall269(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(), size = SYSCALLS.get(), buf = SYSCALLS.get();
  return ___syscall([ 268, 0, size, buf ], 0);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall269"] = ___syscall269;

function ___syscall272(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall272"] = ___syscall272;

function ___syscall295(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var dirfd = SYSCALLS.get(), path = SYSCALLS.getStr(), flags = SYSCALLS.get(), mode = SYSCALLS.get();
  path = SYSCALLS.calculateAt(dirfd, path);
  return FS.open(path, flags, mode).fd;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall295"] = ___syscall295;

function ___syscall296(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var dirfd = SYSCALLS.get(), path = SYSCALLS.getStr(), mode = SYSCALLS.get();
  path = SYSCALLS.calculateAt(dirfd, path);
  return SYSCALLS.doMkdir(path, mode);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall296"] = ___syscall296;

function ___syscall297(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var dirfd = SYSCALLS.get(), path = SYSCALLS.getStr(), mode = SYSCALLS.get(), dev = SYSCALLS.get();
  path = SYSCALLS.calculateAt(dirfd, path);
  return SYSCALLS.doMknod(path, mode, dev);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall297"] = ___syscall297;

function ___syscall298(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var dirfd = SYSCALLS.get(), path = SYSCALLS.getStr(), owner = SYSCALLS.get(), group = SYSCALLS.get(), flags = SYSCALLS.get();
  assert(flags === 0);
  path = SYSCALLS.calculateAt(dirfd, path);
  FS.chown(path, owner, group);
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall298"] = ___syscall298;

function ___syscall299(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  abort("futimesat is obsolete");
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall299"] = ___syscall299;

function ___syscall300(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var dirfd = SYSCALLS.get(), path = SYSCALLS.getStr(), buf = SYSCALLS.get(), flags = SYSCALLS.get();
  var nofollow = flags & 256;
  flags = flags & ~256;
  assert(!flags, flags);
  path = SYSCALLS.calculateAt(dirfd, path);
  return SYSCALLS.doStat(nofollow ? FS.lstat : FS.stat, path, buf);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall300"] = ___syscall300;

function ___syscall301(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var dirfd = SYSCALLS.get(), path = SYSCALLS.getStr(), flags = SYSCALLS.get();
  path = SYSCALLS.calculateAt(dirfd, path);
  if (flags === 0) {
   FS.unlink(path);
  } else if (flags === 512) {
   FS.rmdir(path);
  } else {
   abort("Invalid flags passed to unlinkat");
  }
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall301"] = ___syscall301;

function ___syscall302(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var olddirfd = SYSCALLS.get(), oldpath = SYSCALLS.getStr(), newdirfd = SYSCALLS.get(), newpath = SYSCALLS.getStr();
  oldpath = SYSCALLS.calculateAt(olddirfd, oldpath);
  newpath = SYSCALLS.calculateAt(newdirfd, newpath);
  FS.rename(oldpath, newpath);
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall302"] = ___syscall302;

function ___syscall303(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  return -34;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall303"] = ___syscall303;

function ___syscall304(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var target = SYSCALLS.get(), newdirfd = SYSCALLS.get(), linkpath = SYSCALLS.get();
  linkpath = SYSCALLS.calculateAt(newdirfd, linkpath);
  FS.symlink(target, linkpath);
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall304"] = ___syscall304;

function ___syscall305(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var dirfd = SYSCALLS.get(), path = SYSCALLS.getStr(), buf = SYSCALLS.get(), bufsize = SYSCALLS.get();
  path = SYSCALLS.calculateAt(dirfd, path);
  return SYSCALLS.doReadlink(path, buf, bufsize);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall305"] = ___syscall305;

function ___syscall306(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var dirfd = SYSCALLS.get(), path = SYSCALLS.getStr(), mode = SYSCALLS.get(), flags = SYSCALLS.get();
  assert(flags === 0);
  path = SYSCALLS.calculateAt(dirfd, path);
  FS.chmod(path, mode);
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall306"] = ___syscall306;

function ___syscall307(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var dirfd = SYSCALLS.get(), path = SYSCALLS.getStr(), amode = SYSCALLS.get(), flags = SYSCALLS.get();
  assert(flags === 0);
  path = SYSCALLS.calculateAt(dirfd, path);
  return SYSCALLS.doAccess(path, amode);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall307"] = ___syscall307;

function ___syscall308(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  return -52;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall308"] = ___syscall308;

function ___syscall320(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var dirfd = SYSCALLS.get(), path = SYSCALLS.getStr(), times = SYSCALLS.get(), flags = SYSCALLS.get();
  assert(flags === 0);
  path = SYSCALLS.calculateAt(dirfd, path);
  var seconds = HEAP32[times >> 2];
  var nanoseconds = HEAP32[times + 4 >> 2];
  var atime = seconds * 1e3 + nanoseconds / (1e3 * 1e3);
  times += 8;
  seconds = HEAP32[times >> 2];
  nanoseconds = HEAP32[times + 4 >> 2];
  var mtime = seconds * 1e3 + nanoseconds / (1e3 * 1e3);
  FS.utime(path, atime, mtime);
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall320"] = ___syscall320;

function ___syscall324(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(), mode = SYSCALLS.get(), offset = SYSCALLS.get64(), len = SYSCALLS.get64();
  assert(mode === 0);
  FS.allocate(stream, offset, len);
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall324"] = ___syscall324;

function ___syscall330(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var old = SYSCALLS.getStreamFromFD(), suggestFD = SYSCALLS.get(), flags = SYSCALLS.get();
  assert(!flags);
  if (old.fd === suggestFD) return -28;
  return SYSCALLS.doDup(old.path, old.flags, suggestFD);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall330"] = ___syscall330;

function ___syscall331(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  return -52;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall331"] = ___syscall331;

function ___syscall333(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(), iov = SYSCALLS.get(), iovcnt = SYSCALLS.get(), offset = SYSCALLS.get();
  return SYSCALLS.doReadv(stream, iov, iovcnt, offset);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall333"] = ___syscall333;

function ___syscall334(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(), iov = SYSCALLS.get(), iovcnt = SYSCALLS.get(), offset = SYSCALLS.get();
  return SYSCALLS.doWritev(stream, iov, iovcnt, offset);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall334"] = ___syscall334;

function ___syscall337(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall337"] = ___syscall337;

function ___syscall340(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var pid = SYSCALLS.get(), resource = SYSCALLS.get(), new_limit = SYSCALLS.get(), old_limit = SYSCALLS.get();
  if (old_limit) {
   HEAP32[old_limit >> 2] = -1;
   HEAP32[old_limit + 4 >> 2] = -1;
   HEAP32[old_limit + 8 >> 2] = -1;
   HEAP32[old_limit + 12 >> 2] = -1;
  }
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall340"] = ___syscall340;

function ___syscall345(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

Module["___syscall345"] = ___syscall345;

function _fd_close(fd) {
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  FS.close(stream);
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return e.errno;
 }
}

Module["_fd_close"] = _fd_close;

function _fd_read(fd, iov, iovcnt, pnum) {
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  var num = SYSCALLS.doReadv(stream, iov, iovcnt);
  HEAP32[pnum >> 2] = num;
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return e.errno;
 }
}

Module["_fd_read"] = _fd_read;

function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  var HIGH_OFFSET = 4294967296;
  var offset = offset_high * HIGH_OFFSET + (offset_low >>> 0);
  var DOUBLE_LIMIT = 9007199254740992;
  if (offset <= -DOUBLE_LIMIT || offset >= DOUBLE_LIMIT) {
   return -61;
  }
  FS.llseek(stream, offset, whence);
  tempI64 = [ stream.position >>> 0, (tempDouble = stream.position, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
  HEAP32[newOffset >> 2] = tempI64[0], HEAP32[newOffset + 4 >> 2] = tempI64[1];
  if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return e.errno;
 }
}

Module["_fd_seek"] = _fd_seek;

function _fd_fdstat_get(fd, pbuf) {
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  var type = stream.tty ? 2 : FS.isDir(stream.mode) ? 3 : FS.isLink(stream.mode) ? 7 : 4;
  HEAP8[pbuf >> 0] = type;
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return e.errno;
 }
}

Module["_fd_fdstat_get"] = _fd_fdstat_get;

function _fd_sync(fd) {
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  if (stream.stream_ops && stream.stream_ops.fsync) {
   return -stream.stream_ops.fsync(stream);
  }
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return e.errno;
 }
}

Module["_fd_sync"] = _fd_sync;

var JSEvents = {
 keyEvent: 0,
 mouseEvent: 0,
 wheelEvent: 0,
 uiEvent: 0,
 focusEvent: 0,
 deviceOrientationEvent: 0,
 deviceMotionEvent: 0,
 fullscreenChangeEvent: 0,
 pointerlockChangeEvent: 0,
 visibilityChangeEvent: 0,
 touchEvent: 0,
 previousFullscreenElement: null,
 previousScreenX: null,
 previousScreenY: null,
 removeEventListenersRegistered: false,
 removeAllEventListeners: function() {
  for (var i = JSEvents.eventHandlers.length - 1; i >= 0; --i) {
   JSEvents._removeHandler(i);
  }
  JSEvents.eventHandlers = [];
  JSEvents.deferredCalls = [];
 },
 registerRemoveEventListeners: function() {
  if (!JSEvents.removeEventListenersRegistered) {
   __ATEXIT__.push(JSEvents.removeAllEventListeners);
   JSEvents.removeEventListenersRegistered = true;
  }
 },
 deferredCalls: [],
 deferCall: function(targetFunction, precedence, argsList) {
  function arraysHaveEqualContent(arrA, arrB) {
   if (arrA.length != arrB.length) return false;
   for (var i in arrA) {
    if (arrA[i] != arrB[i]) return false;
   }
   return true;
  }
  for (var i in JSEvents.deferredCalls) {
   var call = JSEvents.deferredCalls[i];
   if (call.targetFunction == targetFunction && arraysHaveEqualContent(call.argsList, argsList)) {
    return;
   }
  }
  JSEvents.deferredCalls.push({
   targetFunction: targetFunction,
   precedence: precedence,
   argsList: argsList
  });
  JSEvents.deferredCalls.sort(function(x, y) {
   return x.precedence < y.precedence;
  });
 },
 removeDeferredCalls: function(targetFunction) {
  for (var i = 0; i < JSEvents.deferredCalls.length; ++i) {
   if (JSEvents.deferredCalls[i].targetFunction == targetFunction) {
    JSEvents.deferredCalls.splice(i, 1);
    --i;
   }
  }
 },
 canPerformEventHandlerRequests: function() {
  return JSEvents.inEventHandler && JSEvents.currentEventHandler.allowsDeferredCalls;
 },
 runDeferredCalls: function() {
  if (!JSEvents.canPerformEventHandlerRequests()) {
   return;
  }
  for (var i = 0; i < JSEvents.deferredCalls.length; ++i) {
   var call = JSEvents.deferredCalls[i];
   JSEvents.deferredCalls.splice(i, 1);
   --i;
   call.targetFunction.apply(this, call.argsList);
  }
 },
 inEventHandler: 0,
 currentEventHandler: null,
 eventHandlers: [],
 removeAllHandlersOnTarget: function(target, eventTypeString) {
  for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
   if (JSEvents.eventHandlers[i].target == target && (!eventTypeString || eventTypeString == JSEvents.eventHandlers[i].eventTypeString)) {
    JSEvents._removeHandler(i--);
   }
  }
 },
 _removeHandler: function(i) {
  var h = JSEvents.eventHandlers[i];
  h.target.removeEventListener(h.eventTypeString, h.eventListenerFunc, h.useCapture);
  JSEvents.eventHandlers.splice(i, 1);
 },
 registerOrRemoveHandler: function(eventHandler) {
  var jsEventHandler = function jsEventHandler(event) {
   ++JSEvents.inEventHandler;
   JSEvents.currentEventHandler = eventHandler;
   JSEvents.runDeferredCalls();
   eventHandler.handlerFunc(event);
   JSEvents.runDeferredCalls();
   --JSEvents.inEventHandler;
  };
  if (eventHandler.callbackfunc) {
   eventHandler.eventListenerFunc = jsEventHandler;
   eventHandler.target.addEventListener(eventHandler.eventTypeString, jsEventHandler, eventHandler.useCapture);
   JSEvents.eventHandlers.push(eventHandler);
   JSEvents.registerRemoveEventListeners();
  } else {
   for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
    if (JSEvents.eventHandlers[i].target == eventHandler.target && JSEvents.eventHandlers[i].eventTypeString == eventHandler.eventTypeString) {
     JSEvents._removeHandler(i--);
    }
   }
  }
 },
 getNodeNameForTarget: function(target) {
  if (!target) return "";
  if (target == window) return "#window";
  if (target == screen) return "#screen";
  return target && target.nodeName ? target.nodeName : "";
 },
 fullscreenEnabled: function() {
  return document.fullscreenEnabled || document.webkitFullscreenEnabled;
 }
};

Module["JSEvents"] = JSEvents;

function __maybeCStringToJsString(cString) {
 return cString === cString + 0 ? UTF8ToString(cString) : cString;
}

Module["__maybeCStringToJsString"] = __maybeCStringToJsString;

var __specialEventTargets = [ 0, typeof document !== "undefined" ? document : 0, typeof window !== "undefined" ? window : 0 ];

Module["__specialEventTargets"] = __specialEventTargets;

function __findEventTarget(target) {
 var domElement = __specialEventTargets[target] || (typeof document !== "undefined" ? document.querySelector(__maybeCStringToJsString(target)) : undefined);
 return domElement;
}

Module["__findEventTarget"] = __findEventTarget;

function __registerKeyEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
 if (!JSEvents.keyEvent) JSEvents.keyEvent = _malloc(164);
 var keyEventHandlerFunc = function(ev) {
  var e = ev || event;
  var keyEventData = JSEvents.keyEvent;
  stringToUTF8(e.key ? e.key : "", keyEventData + 0, 32);
  stringToUTF8(e.code ? e.code : "", keyEventData + 32, 32);
  HEAP32[keyEventData + 64 >> 2] = e.location;
  HEAP32[keyEventData + 68 >> 2] = e.ctrlKey;
  HEAP32[keyEventData + 72 >> 2] = e.shiftKey;
  HEAP32[keyEventData + 76 >> 2] = e.altKey;
  HEAP32[keyEventData + 80 >> 2] = e.metaKey;
  HEAP32[keyEventData + 84 >> 2] = e.repeat;
  stringToUTF8(e.locale ? e.locale : "", keyEventData + 88, 32);
  stringToUTF8(e.char ? e.char : "", keyEventData + 120, 32);
  HEAP32[keyEventData + 152 >> 2] = e.charCode;
  HEAP32[keyEventData + 156 >> 2] = e.keyCode;
  HEAP32[keyEventData + 160 >> 2] = e.which;
  if (dynCall_iiii(callbackfunc, eventTypeId, keyEventData, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: __findEventTarget(target),
  allowsDeferredCalls: true,
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: keyEventHandlerFunc,
  useCapture: useCapture
 };
 JSEvents.registerOrRemoveHandler(eventHandler);
}

Module["__registerKeyEventCallback"] = __registerKeyEventCallback;

function __findCanvasEventTarget(target) {
 return __findEventTarget(target);
}

Module["__findCanvasEventTarget"] = __findCanvasEventTarget;

function _emscripten_set_keypress_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerKeyEventCallback(target, userData, useCapture, callbackfunc, 1, "keypress", targetThread);
 return 0;
}

Module["_emscripten_set_keypress_callback_on_thread"] = _emscripten_set_keypress_callback_on_thread;

function _emscripten_set_keydown_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerKeyEventCallback(target, userData, useCapture, callbackfunc, 2, "keydown", targetThread);
 return 0;
}

Module["_emscripten_set_keydown_callback_on_thread"] = _emscripten_set_keydown_callback_on_thread;

function _emscripten_set_keyup_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerKeyEventCallback(target, userData, useCapture, callbackfunc, 3, "keyup", targetThread);
 return 0;
}

Module["_emscripten_set_keyup_callback_on_thread"] = _emscripten_set_keyup_callback_on_thread;

function __getBoundingClientRect(e) {
 return e.getBoundingClientRect();
}

Module["__getBoundingClientRect"] = __getBoundingClientRect;

function __fillMouseEventData(eventStruct, e, target) {
 HEAP32[eventStruct >> 2] = e.screenX;
 HEAP32[eventStruct + 4 >> 2] = e.screenY;
 HEAP32[eventStruct + 8 >> 2] = e.clientX;
 HEAP32[eventStruct + 12 >> 2] = e.clientY;
 HEAP32[eventStruct + 16 >> 2] = e.ctrlKey;
 HEAP32[eventStruct + 20 >> 2] = e.shiftKey;
 HEAP32[eventStruct + 24 >> 2] = e.altKey;
 HEAP32[eventStruct + 28 >> 2] = e.metaKey;
 HEAP16[eventStruct + 32 >> 1] = e.button;
 HEAP16[eventStruct + 34 >> 1] = e.buttons;
 var movementX = e["movementX"] || e.screenX - JSEvents.previousScreenX;
 var movementY = e["movementY"] || e.screenY - JSEvents.previousScreenY;
 HEAP32[eventStruct + 36 >> 2] = movementX;
 HEAP32[eventStruct + 40 >> 2] = movementY;
 var rect = __specialEventTargets.indexOf(target) < 0 ? __getBoundingClientRect(target) : {
  "left": 0,
  "top": 0
 };
 HEAP32[eventStruct + 44 >> 2] = e.clientX - rect.left;
 HEAP32[eventStruct + 48 >> 2] = e.clientY - rect.top;
 if (e.type !== "wheel" && e.type !== "mousewheel") {
  JSEvents.previousScreenX = e.screenX;
  JSEvents.previousScreenY = e.screenY;
 }
}

Module["__fillMouseEventData"] = __fillMouseEventData;

function __registerMouseEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
 if (!JSEvents.mouseEvent) JSEvents.mouseEvent = _malloc(64);
 target = __findEventTarget(target);
 var mouseEventHandlerFunc = function(ev) {
  var e = ev || event;
  __fillMouseEventData(JSEvents.mouseEvent, e, target);
  if (dynCall_iiii(callbackfunc, eventTypeId, JSEvents.mouseEvent, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: target,
  allowsDeferredCalls: eventTypeString != "mousemove" && eventTypeString != "mouseenter" && eventTypeString != "mouseleave",
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: mouseEventHandlerFunc,
  useCapture: useCapture
 };
 JSEvents.registerOrRemoveHandler(eventHandler);
}

Module["__registerMouseEventCallback"] = __registerMouseEventCallback;

function _emscripten_set_click_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerMouseEventCallback(target, userData, useCapture, callbackfunc, 4, "click", targetThread);
 return 0;
}

Module["_emscripten_set_click_callback_on_thread"] = _emscripten_set_click_callback_on_thread;

function _emscripten_set_mousedown_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerMouseEventCallback(target, userData, useCapture, callbackfunc, 5, "mousedown", targetThread);
 return 0;
}

Module["_emscripten_set_mousedown_callback_on_thread"] = _emscripten_set_mousedown_callback_on_thread;

function _emscripten_set_mouseup_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerMouseEventCallback(target, userData, useCapture, callbackfunc, 6, "mouseup", targetThread);
 return 0;
}

Module["_emscripten_set_mouseup_callback_on_thread"] = _emscripten_set_mouseup_callback_on_thread;

function _emscripten_set_dblclick_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerMouseEventCallback(target, userData, useCapture, callbackfunc, 7, "dblclick", targetThread);
 return 0;
}

Module["_emscripten_set_dblclick_callback_on_thread"] = _emscripten_set_dblclick_callback_on_thread;

function _emscripten_set_mousemove_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerMouseEventCallback(target, userData, useCapture, callbackfunc, 8, "mousemove", targetThread);
 return 0;
}

Module["_emscripten_set_mousemove_callback_on_thread"] = _emscripten_set_mousemove_callback_on_thread;

function _emscripten_set_mouseenter_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerMouseEventCallback(target, userData, useCapture, callbackfunc, 33, "mouseenter", targetThread);
 return 0;
}

Module["_emscripten_set_mouseenter_callback_on_thread"] = _emscripten_set_mouseenter_callback_on_thread;

function _emscripten_set_mouseleave_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerMouseEventCallback(target, userData, useCapture, callbackfunc, 34, "mouseleave", targetThread);
 return 0;
}

Module["_emscripten_set_mouseleave_callback_on_thread"] = _emscripten_set_mouseleave_callback_on_thread;

function _emscripten_set_mouseover_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerMouseEventCallback(target, userData, useCapture, callbackfunc, 35, "mouseover", targetThread);
 return 0;
}

Module["_emscripten_set_mouseover_callback_on_thread"] = _emscripten_set_mouseover_callback_on_thread;

function _emscripten_set_mouseout_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerMouseEventCallback(target, userData, useCapture, callbackfunc, 36, "mouseout", targetThread);
 return 0;
}

Module["_emscripten_set_mouseout_callback_on_thread"] = _emscripten_set_mouseout_callback_on_thread;

function _emscripten_get_mouse_status(mouseState) {
 if (!JSEvents.mouseEvent) return -7;
 HEAP8.set(HEAP8.subarray(JSEvents.mouseEvent, JSEvents.mouseEvent + 64), mouseState);
 return 0;
}

Module["_emscripten_get_mouse_status"] = _emscripten_get_mouse_status;

function __registerWheelEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
 if (!JSEvents.wheelEvent) JSEvents.wheelEvent = _malloc(96);
 var wheelHandlerFunc = function(ev) {
  var e = ev || event;
  var wheelEvent = JSEvents.wheelEvent;
  __fillMouseEventData(wheelEvent, e, target);
  HEAPF64[wheelEvent + 64 >> 3] = e["deltaX"];
  HEAPF64[wheelEvent + 72 >> 3] = e["deltaY"];
  HEAPF64[wheelEvent + 80 >> 3] = e["deltaZ"];
  HEAP32[wheelEvent + 88 >> 2] = e["deltaMode"];
  if (dynCall_iiii(callbackfunc, eventTypeId, wheelEvent, userData)) e.preventDefault();
 };
 var mouseWheelHandlerFunc = function(ev) {
  var e = ev || event;
  __fillMouseEventData(JSEvents.wheelEvent, e, target);
  HEAPF64[JSEvents.wheelEvent + 64 >> 3] = e["wheelDeltaX"] || 0;
  var wheelDeltaY = -(e["wheelDeltaY"] || e["wheelDelta"]);
  HEAPF64[JSEvents.wheelEvent + 72 >> 3] = wheelDeltaY;
  HEAPF64[JSEvents.wheelEvent + 80 >> 3] = 0;
  HEAP32[JSEvents.wheelEvent + 88 >> 2] = 0;
  var shouldCancel = dynCall_iiii(callbackfunc, eventTypeId, JSEvents.wheelEvent, userData);
  if (shouldCancel) {
   e.preventDefault();
  }
 };
 var eventHandler = {
  target: target,
  allowsDeferredCalls: true,
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: eventTypeString == "wheel" ? wheelHandlerFunc : mouseWheelHandlerFunc,
  useCapture: useCapture
 };
 JSEvents.registerOrRemoveHandler(eventHandler);
}

Module["__registerWheelEventCallback"] = __registerWheelEventCallback;

function _emscripten_set_wheel_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 target = __findEventTarget(target);
 if (typeof target.onwheel !== "undefined") {
  __registerWheelEventCallback(target, userData, useCapture, callbackfunc, 9, "wheel", targetThread);
  return 0;
 } else if (typeof target.onmousewheel !== "undefined") {
  __registerWheelEventCallback(target, userData, useCapture, callbackfunc, 9, "mousewheel", targetThread);
  return 0;
 } else {
  return -1;
 }
}

Module["_emscripten_set_wheel_callback_on_thread"] = _emscripten_set_wheel_callback_on_thread;

function __registerUiEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
 if (!JSEvents.uiEvent) JSEvents.uiEvent = _malloc(36);
 target = __findEventTarget(target);
 var uiEventHandlerFunc = function(ev) {
  var e = ev || event;
  if (e.target != target) {
   return;
  }
  var uiEvent = JSEvents.uiEvent;
  var b = document.body;
  HEAP32[uiEvent >> 2] = e.detail;
  HEAP32[uiEvent + 4 >> 2] = b.clientWidth;
  HEAP32[uiEvent + 8 >> 2] = b.clientHeight;
  HEAP32[uiEvent + 12 >> 2] = innerWidth;
  HEAP32[uiEvent + 16 >> 2] = innerHeight;
  HEAP32[uiEvent + 20 >> 2] = outerWidth;
  HEAP32[uiEvent + 24 >> 2] = outerHeight;
  HEAP32[uiEvent + 28 >> 2] = pageXOffset;
  HEAP32[uiEvent + 32 >> 2] = pageYOffset;
  if (dynCall_iiii(callbackfunc, eventTypeId, uiEvent, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: target,
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: uiEventHandlerFunc,
  useCapture: useCapture
 };
 JSEvents.registerOrRemoveHandler(eventHandler);
}

Module["__registerUiEventCallback"] = __registerUiEventCallback;

function _emscripten_set_resize_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerUiEventCallback(target, userData, useCapture, callbackfunc, 10, "resize", targetThread);
 return 0;
}

Module["_emscripten_set_resize_callback_on_thread"] = _emscripten_set_resize_callback_on_thread;

function _emscripten_set_scroll_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerUiEventCallback(target, userData, useCapture, callbackfunc, 11, "scroll", targetThread);
 return 0;
}

Module["_emscripten_set_scroll_callback_on_thread"] = _emscripten_set_scroll_callback_on_thread;

function __registerFocusEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
 if (!JSEvents.focusEvent) JSEvents.focusEvent = _malloc(256);
 var focusEventHandlerFunc = function(ev) {
  var e = ev || event;
  var nodeName = JSEvents.getNodeNameForTarget(e.target);
  var id = e.target.id ? e.target.id : "";
  var focusEvent = JSEvents.focusEvent;
  stringToUTF8(nodeName, focusEvent + 0, 128);
  stringToUTF8(id, focusEvent + 128, 128);
  if (dynCall_iiii(callbackfunc, eventTypeId, focusEvent, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: __findEventTarget(target),
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: focusEventHandlerFunc,
  useCapture: useCapture
 };
 JSEvents.registerOrRemoveHandler(eventHandler);
}

Module["__registerFocusEventCallback"] = __registerFocusEventCallback;

function _emscripten_set_blur_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerFocusEventCallback(target, userData, useCapture, callbackfunc, 12, "blur", targetThread);
 return 0;
}

Module["_emscripten_set_blur_callback_on_thread"] = _emscripten_set_blur_callback_on_thread;

function _emscripten_set_focus_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerFocusEventCallback(target, userData, useCapture, callbackfunc, 13, "focus", targetThread);
 return 0;
}

Module["_emscripten_set_focus_callback_on_thread"] = _emscripten_set_focus_callback_on_thread;

function _emscripten_set_focusin_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerFocusEventCallback(target, userData, useCapture, callbackfunc, 14, "focusin", targetThread);
 return 0;
}

Module["_emscripten_set_focusin_callback_on_thread"] = _emscripten_set_focusin_callback_on_thread;

function _emscripten_set_focusout_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerFocusEventCallback(target, userData, useCapture, callbackfunc, 15, "focusout", targetThread);
 return 0;
}

Module["_emscripten_set_focusout_callback_on_thread"] = _emscripten_set_focusout_callback_on_thread;

function __fillDeviceOrientationEventData(eventStruct, e, target) {
 HEAPF64[eventStruct >> 3] = e.alpha;
 HEAPF64[eventStruct + 8 >> 3] = e.beta;
 HEAPF64[eventStruct + 16 >> 3] = e.gamma;
 HEAP32[eventStruct + 24 >> 2] = e.absolute;
}

Module["__fillDeviceOrientationEventData"] = __fillDeviceOrientationEventData;

function __registerDeviceOrientationEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
 if (!JSEvents.deviceOrientationEvent) JSEvents.deviceOrientationEvent = _malloc(32);
 var deviceOrientationEventHandlerFunc = function(ev) {
  var e = ev || event;
  __fillDeviceOrientationEventData(JSEvents.deviceOrientationEvent, e, target);
  if (dynCall_iiii(callbackfunc, eventTypeId, JSEvents.deviceOrientationEvent, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: __findEventTarget(target),
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: deviceOrientationEventHandlerFunc,
  useCapture: useCapture
 };
 JSEvents.registerOrRemoveHandler(eventHandler);
}

Module["__registerDeviceOrientationEventCallback"] = __registerDeviceOrientationEventCallback;

function _emscripten_set_deviceorientation_callback_on_thread(userData, useCapture, callbackfunc, targetThread) {
 __registerDeviceOrientationEventCallback(2, userData, useCapture, callbackfunc, 16, "deviceorientation", targetThread);
 return 0;
}

Module["_emscripten_set_deviceorientation_callback_on_thread"] = _emscripten_set_deviceorientation_callback_on_thread;

function _emscripten_get_deviceorientation_status(orientationState) {
 if (!JSEvents.deviceOrientationEvent) return -7;
 HEAP32.set(HEAP32.subarray(JSEvents.deviceOrientationEvent, 32), orientationState);
 return 0;
}

Module["_emscripten_get_deviceorientation_status"] = _emscripten_get_deviceorientation_status;

function __fillDeviceMotionEventData(eventStruct, e, target) {
 var supportedFields = 0;
 var a = e["acceleration"];
 supportedFields |= a && 1;
 var ag = e["accelerationIncludingGravity"];
 supportedFields |= ag && 2;
 var rr = e["rotationRate"];
 supportedFields |= rr && 4;
 a = a || {};
 ag = ag || {};
 rr = rr || {};
 HEAPF64[eventStruct >> 3] = a["x"];
 HEAPF64[eventStruct + 8 >> 3] = a["y"];
 HEAPF64[eventStruct + 16 >> 3] = a["z"];
 HEAPF64[eventStruct + 24 >> 3] = ag["x"];
 HEAPF64[eventStruct + 32 >> 3] = ag["y"];
 HEAPF64[eventStruct + 40 >> 3] = ag["z"];
 HEAPF64[eventStruct + 48 >> 3] = rr["alpha"];
 HEAPF64[eventStruct + 56 >> 3] = rr["beta"];
 HEAPF64[eventStruct + 64 >> 3] = rr["gamma"];
}

Module["__fillDeviceMotionEventData"] = __fillDeviceMotionEventData;

function __registerDeviceMotionEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
 if (!JSEvents.deviceMotionEvent) JSEvents.deviceMotionEvent = _malloc(80);
 var deviceMotionEventHandlerFunc = function(ev) {
  var e = ev || event;
  __fillDeviceMotionEventData(JSEvents.deviceMotionEvent, e, target);
  if (dynCall_iiii(callbackfunc, eventTypeId, JSEvents.deviceMotionEvent, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: __findEventTarget(target),
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: deviceMotionEventHandlerFunc,
  useCapture: useCapture
 };
 JSEvents.registerOrRemoveHandler(eventHandler);
}

Module["__registerDeviceMotionEventCallback"] = __registerDeviceMotionEventCallback;

function _emscripten_set_devicemotion_callback_on_thread(userData, useCapture, callbackfunc, targetThread) {
 __registerDeviceMotionEventCallback(2, userData, useCapture, callbackfunc, 17, "devicemotion", targetThread);
 return 0;
}

Module["_emscripten_set_devicemotion_callback_on_thread"] = _emscripten_set_devicemotion_callback_on_thread;

function _emscripten_get_devicemotion_status(motionState) {
 if (!JSEvents.deviceMotionEvent) return -7;
 HEAP32.set(HEAP32.subarray(JSEvents.deviceMotionEvent, 80), motionState);
 return 0;
}

Module["_emscripten_get_devicemotion_status"] = _emscripten_get_devicemotion_status;

function __screenOrientation() {
 if (!screen) return undefined;
 return screen.orientation || screen.mozOrientation || screen.webkitOrientation || screen.msOrientation;
}

Module["__screenOrientation"] = __screenOrientation;

function __fillOrientationChangeEventData(eventStruct, e) {
 var orientations = [ "portrait-primary", "portrait-secondary", "landscape-primary", "landscape-secondary" ];
 var orientations2 = [ "portrait", "portrait", "landscape", "landscape" ];
 var orientationString = __screenOrientation();
 var orientation = orientations.indexOf(orientationString);
 if (orientation == -1) {
  orientation = orientations2.indexOf(orientationString);
 }
 HEAP32[eventStruct >> 2] = 1 << orientation;
 HEAP32[eventStruct + 4 >> 2] = orientation;
}

Module["__fillOrientationChangeEventData"] = __fillOrientationChangeEventData;

function __registerOrientationChangeEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
 if (!JSEvents.orientationChangeEvent) JSEvents.orientationChangeEvent = _malloc(8);
 var orientationChangeEventHandlerFunc = function(ev) {
  var e = ev || event;
  var orientationChangeEvent = JSEvents.orientationChangeEvent;
  __fillOrientationChangeEventData(orientationChangeEvent, e);
  if (dynCall_iiii(callbackfunc, eventTypeId, orientationChangeEvent, userData)) e.preventDefault();
 };
 if (eventTypeString == "orientationchange" && screen.mozOrientation !== undefined) {
  eventTypeString = "mozorientationchange";
 }
 var eventHandler = {
  target: target,
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: orientationChangeEventHandlerFunc,
  useCapture: useCapture
 };
 JSEvents.registerOrRemoveHandler(eventHandler);
}

Module["__registerOrientationChangeEventCallback"] = __registerOrientationChangeEventCallback;

function _emscripten_set_orientationchange_callback_on_thread(userData, useCapture, callbackfunc, targetThread) {
 if (!screen || !screen.addEventListener) return -1;
 __registerOrientationChangeEventCallback(screen, userData, useCapture, callbackfunc, 18, "orientationchange", targetThread);
 return 0;
}

Module["_emscripten_set_orientationchange_callback_on_thread"] = _emscripten_set_orientationchange_callback_on_thread;

function _emscripten_get_orientation_status(orientationChangeEvent) {
 if (!__screenOrientation() && typeof orientation === "undefined") return -1;
 __fillOrientationChangeEventData(orientationChangeEvent);
 return 0;
}

Module["_emscripten_get_orientation_status"] = _emscripten_get_orientation_status;

function _emscripten_lock_orientation(allowedOrientations) {
 var orientations = [];
 if (allowedOrientations & 1) orientations.push("portrait-primary");
 if (allowedOrientations & 2) orientations.push("portrait-secondary");
 if (allowedOrientations & 4) orientations.push("landscape-primary");
 if (allowedOrientations & 8) orientations.push("landscape-secondary");
 var succeeded;
 if (screen.lockOrientation) {
  succeeded = screen.lockOrientation(orientations);
 } else if (screen.mozLockOrientation) {
  succeeded = screen.mozLockOrientation(orientations);
 } else if (screen.webkitLockOrientation) {
  succeeded = screen.webkitLockOrientation(orientations);
 } else if (screen.msLockOrientation) {
  succeeded = screen.msLockOrientation(orientations);
 } else {
  return -1;
 }
 if (succeeded) {
  return 0;
 } else {
  return -6;
 }
}

Module["_emscripten_lock_orientation"] = _emscripten_lock_orientation;

function _emscripten_unlock_orientation() {
 if (screen.unlockOrientation) {
  screen.unlockOrientation();
 } else if (screen.mozUnlockOrientation) {
  screen.mozUnlockOrientation();
 } else if (screen.webkitUnlockOrientation) {
  screen.webkitUnlockOrientation();
 } else if (screen.msUnlockOrientation) {
  screen.msUnlockOrientation();
 } else {
  return -1;
 }
 return 0;
}

Module["_emscripten_unlock_orientation"] = _emscripten_unlock_orientation;

function __fillFullscreenChangeEventData(eventStruct, e) {
 var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
 var isFullscreen = !!fullscreenElement;
 HEAP32[eventStruct >> 2] = isFullscreen;
 HEAP32[eventStruct + 4 >> 2] = JSEvents.fullscreenEnabled();
 var reportedElement = isFullscreen ? fullscreenElement : JSEvents.previousFullscreenElement;
 var nodeName = JSEvents.getNodeNameForTarget(reportedElement);
 var id = reportedElement && reportedElement.id ? reportedElement.id : "";
 stringToUTF8(nodeName, eventStruct + 8, 128);
 stringToUTF8(id, eventStruct + 136, 128);
 HEAP32[eventStruct + 264 >> 2] = reportedElement ? reportedElement.clientWidth : 0;
 HEAP32[eventStruct + 268 >> 2] = reportedElement ? reportedElement.clientHeight : 0;
 HEAP32[eventStruct + 272 >> 2] = screen.width;
 HEAP32[eventStruct + 276 >> 2] = screen.height;
 if (isFullscreen) {
  JSEvents.previousFullscreenElement = fullscreenElement;
 }
}

Module["__fillFullscreenChangeEventData"] = __fillFullscreenChangeEventData;

function __registerFullscreenChangeEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
 if (!JSEvents.fullscreenChangeEvent) JSEvents.fullscreenChangeEvent = _malloc(280);
 var fullscreenChangeEventhandlerFunc = function(ev) {
  var e = ev || event;
  var fullscreenChangeEvent = JSEvents.fullscreenChangeEvent;
  __fillFullscreenChangeEventData(fullscreenChangeEvent, e);
  if (dynCall_iiii(callbackfunc, eventTypeId, fullscreenChangeEvent, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: target,
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: fullscreenChangeEventhandlerFunc,
  useCapture: useCapture
 };
 JSEvents.registerOrRemoveHandler(eventHandler);
}

Module["__registerFullscreenChangeEventCallback"] = __registerFullscreenChangeEventCallback;

function _emscripten_set_fullscreenchange_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 if (!JSEvents.fullscreenEnabled()) return -1;
 target = __findEventTarget(target);
 if (!target) return -4;
 __registerFullscreenChangeEventCallback(target, userData, useCapture, callbackfunc, 19, "fullscreenchange", targetThread);
 __registerFullscreenChangeEventCallback(target, userData, useCapture, callbackfunc, 19, "webkitfullscreenchange", targetThread);
 return 0;
}

Module["_emscripten_set_fullscreenchange_callback_on_thread"] = _emscripten_set_fullscreenchange_callback_on_thread;

function _emscripten_get_fullscreen_status(fullscreenStatus) {
 if (!JSEvents.fullscreenEnabled()) return -1;
 __fillFullscreenChangeEventData(fullscreenStatus);
 return 0;
}

Module["_emscripten_get_fullscreen_status"] = _emscripten_get_fullscreen_status;

function _emscripten_get_canvas_element_size(target, width, height) {
 var canvas = __findCanvasEventTarget(target);
 if (!canvas) return -4;
 HEAP32[width >> 2] = canvas.width;
 HEAP32[height >> 2] = canvas.height;
}

Module["_emscripten_get_canvas_element_size"] = _emscripten_get_canvas_element_size;

function __get_canvas_element_size(target) {
 var stackTop = stackSave();
 var w = stackAlloc(8);
 var h = w + 4;
 var targetInt = stackAlloc(target.id.length + 1);
 stringToUTF8(target.id, targetInt, target.id.length + 1);
 var ret = _emscripten_get_canvas_element_size(targetInt, w, h);
 var size = [ HEAP32[w >> 2], HEAP32[h >> 2] ];
 stackRestore(stackTop);
 return size;
}

Module["__get_canvas_element_size"] = __get_canvas_element_size;

function _emscripten_set_canvas_element_size(target, width, height) {
 var canvas = __findCanvasEventTarget(target);
 if (!canvas) return -4;
 canvas.width = width;
 canvas.height = height;
 return 0;
}

Module["_emscripten_set_canvas_element_size"] = _emscripten_set_canvas_element_size;

function __set_canvas_element_size(target, width, height) {
 if (!target.controlTransferredOffscreen) {
  target.width = width;
  target.height = height;
 } else {
  var stackTop = stackSave();
  var targetInt = stackAlloc(target.id.length + 1);
  stringToUTF8(target.id, targetInt, target.id.length + 1);
  _emscripten_set_canvas_element_size(targetInt, width, height);
  stackRestore(stackTop);
 }
}

Module["__set_canvas_element_size"] = __set_canvas_element_size;

function __registerRestoreOldStyle(canvas) {
 var canvasSize = __get_canvas_element_size(canvas);
 var oldWidth = canvasSize[0];
 var oldHeight = canvasSize[1];
 var oldCssWidth = canvas.style.width;
 var oldCssHeight = canvas.style.height;
 var oldBackgroundColor = canvas.style.backgroundColor;
 var oldDocumentBackgroundColor = document.body.style.backgroundColor;
 var oldPaddingLeft = canvas.style.paddingLeft;
 var oldPaddingRight = canvas.style.paddingRight;
 var oldPaddingTop = canvas.style.paddingTop;
 var oldPaddingBottom = canvas.style.paddingBottom;
 var oldMarginLeft = canvas.style.marginLeft;
 var oldMarginRight = canvas.style.marginRight;
 var oldMarginTop = canvas.style.marginTop;
 var oldMarginBottom = canvas.style.marginBottom;
 var oldDocumentBodyMargin = document.body.style.margin;
 var oldDocumentOverflow = document.documentElement.style.overflow;
 var oldDocumentScroll = document.body.scroll;
 var oldImageRendering = canvas.style.imageRendering;
 function restoreOldStyle() {
  var fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
  if (!fullscreenElement) {
   document.removeEventListener("fullscreenchange", restoreOldStyle);
   document.removeEventListener("webkitfullscreenchange", restoreOldStyle);
   __set_canvas_element_size(canvas, oldWidth, oldHeight);
   canvas.style.width = oldCssWidth;
   canvas.style.height = oldCssHeight;
   canvas.style.backgroundColor = oldBackgroundColor;
   if (!oldDocumentBackgroundColor) document.body.style.backgroundColor = "white";
   document.body.style.backgroundColor = oldDocumentBackgroundColor;
   canvas.style.paddingLeft = oldPaddingLeft;
   canvas.style.paddingRight = oldPaddingRight;
   canvas.style.paddingTop = oldPaddingTop;
   canvas.style.paddingBottom = oldPaddingBottom;
   canvas.style.marginLeft = oldMarginLeft;
   canvas.style.marginRight = oldMarginRight;
   canvas.style.marginTop = oldMarginTop;
   canvas.style.marginBottom = oldMarginBottom;
   document.body.style.margin = oldDocumentBodyMargin;
   document.documentElement.style.overflow = oldDocumentOverflow;
   document.body.scroll = oldDocumentScroll;
   canvas.style.imageRendering = oldImageRendering;
   if (canvas.GLctxObject) canvas.GLctxObject.GLctx.viewport(0, 0, oldWidth, oldHeight);
   if (__currentFullscreenStrategy.canvasResizedCallback) {
    dynCall_iiii(__currentFullscreenStrategy.canvasResizedCallback, 37, 0, __currentFullscreenStrategy.canvasResizedCallbackUserData);
   }
  }
 }
 document.addEventListener("fullscreenchange", restoreOldStyle);
 document.addEventListener("webkitfullscreenchange", restoreOldStyle);
 return restoreOldStyle;
}

Module["__registerRestoreOldStyle"] = __registerRestoreOldStyle;

function __setLetterbox(element, topBottom, leftRight) {
 element.style.paddingLeft = element.style.paddingRight = leftRight + "px";
 element.style.paddingTop = element.style.paddingBottom = topBottom + "px";
}

Module["__setLetterbox"] = __setLetterbox;

function _JSEvents_resizeCanvasForFullscreen(target, strategy) {
 var restoreOldStyle = __registerRestoreOldStyle(target);
 var cssWidth = strategy.softFullscreen ? innerWidth : screen.width;
 var cssHeight = strategy.softFullscreen ? innerHeight : screen.height;
 var rect = __getBoundingClientRect(target);
 var windowedCssWidth = rect.width;
 var windowedCssHeight = rect.height;
 var canvasSize = __get_canvas_element_size(target);
 var windowedRttWidth = canvasSize[0];
 var windowedRttHeight = canvasSize[1];
 if (strategy.scaleMode == 3) {
  __setLetterbox(target, (cssHeight - windowedCssHeight) / 2, (cssWidth - windowedCssWidth) / 2);
  cssWidth = windowedCssWidth;
  cssHeight = windowedCssHeight;
 } else if (strategy.scaleMode == 2) {
  if (cssWidth * windowedRttHeight < windowedRttWidth * cssHeight) {
   var desiredCssHeight = windowedRttHeight * cssWidth / windowedRttWidth;
   __setLetterbox(target, (cssHeight - desiredCssHeight) / 2, 0);
   cssHeight = desiredCssHeight;
  } else {
   var desiredCssWidth = windowedRttWidth * cssHeight / windowedRttHeight;
   __setLetterbox(target, 0, (cssWidth - desiredCssWidth) / 2);
   cssWidth = desiredCssWidth;
  }
 }
 if (!target.style.backgroundColor) target.style.backgroundColor = "black";
 if (!document.body.style.backgroundColor) document.body.style.backgroundColor = "black";
 target.style.width = cssWidth + "px";
 target.style.height = cssHeight + "px";
 if (strategy.filteringMode == 1) {
  target.style.imageRendering = "optimizeSpeed";
  target.style.imageRendering = "-moz-crisp-edges";
  target.style.imageRendering = "-o-crisp-edges";
  target.style.imageRendering = "-webkit-optimize-contrast";
  target.style.imageRendering = "optimize-contrast";
  target.style.imageRendering = "crisp-edges";
  target.style.imageRendering = "pixelated";
 }
 var dpiScale = strategy.canvasResolutionScaleMode == 2 ? devicePixelRatio : 1;
 if (strategy.canvasResolutionScaleMode != 0) {
  var newWidth = cssWidth * dpiScale | 0;
  var newHeight = cssHeight * dpiScale | 0;
  __set_canvas_element_size(target, newWidth, newHeight);
  if (target.GLctxObject) target.GLctxObject.GLctx.viewport(0, 0, newWidth, newHeight);
 }
 return restoreOldStyle;
}

Module["_JSEvents_resizeCanvasForFullscreen"] = _JSEvents_resizeCanvasForFullscreen;

function _JSEvents_requestFullscreen(target, strategy) {
 if (strategy.scaleMode != 0 || strategy.canvasResolutionScaleMode != 0) {
  _JSEvents_resizeCanvasForFullscreen(target, strategy);
 }
 if (target.requestFullscreen) {
  target.requestFullscreen();
 } else if (target.webkitRequestFullscreen) {
  target.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
 } else {
  return JSEvents.fullscreenEnabled() ? -3 : -1;
 }
 if (strategy.canvasResizedCallback) {
  dynCall_iiii(strategy.canvasResizedCallback, 37, 0, strategy.canvasResizedCallbackUserData);
 }
 return 0;
}

Module["_JSEvents_requestFullscreen"] = _JSEvents_requestFullscreen;

function __hideEverythingExceptGivenElement(onlyVisibleElement) {
 var child = onlyVisibleElement;
 var parent = child.parentNode;
 var hiddenElements = [];
 while (child != document.body) {
  var children = parent.children;
  for (var i = 0; i < children.length; ++i) {
   if (children[i] != child) {
    hiddenElements.push({
     node: children[i],
     displayState: children[i].style.display
    });
    children[i].style.display = "none";
   }
  }
  child = parent;
  parent = parent.parentNode;
 }
 return hiddenElements;
}

Module["__hideEverythingExceptGivenElement"] = __hideEverythingExceptGivenElement;

function __restoreHiddenElements(hiddenElements) {
 for (var i = 0; i < hiddenElements.length; ++i) {
  hiddenElements[i].node.style.display = hiddenElements[i].displayState;
 }
}

Module["__restoreHiddenElements"] = __restoreHiddenElements;

var __currentFullscreenStrategy = {};

Module["__currentFullscreenStrategy"] = __currentFullscreenStrategy;

var __restoreOldWindowedStyle = null;

Module["__restoreOldWindowedStyle"] = __restoreOldWindowedStyle;

function __softFullscreenResizeWebGLRenderTarget() {
 var dpr = devicePixelRatio;
 var inHiDPIFullscreenMode = __currentFullscreenStrategy.canvasResolutionScaleMode == 2;
 var inAspectRatioFixedFullscreenMode = __currentFullscreenStrategy.scaleMode == 2;
 var inPixelPerfectFullscreenMode = __currentFullscreenStrategy.canvasResolutionScaleMode != 0;
 var inCenteredWithoutScalingFullscreenMode = __currentFullscreenStrategy.scaleMode == 3;
 var screenWidth = inHiDPIFullscreenMode ? Math.round(innerWidth * dpr) : innerWidth;
 var screenHeight = inHiDPIFullscreenMode ? Math.round(innerHeight * dpr) : innerHeight;
 var w = screenWidth;
 var h = screenHeight;
 var canvas = __currentFullscreenStrategy.target;
 var canvasSize = __get_canvas_element_size(canvas);
 var x = canvasSize[0];
 var y = canvasSize[1];
 var topMargin;
 if (inAspectRatioFixedFullscreenMode) {
  if (w * y < x * h) h = w * y / x | 0; else if (w * y > x * h) w = h * x / y | 0;
  topMargin = (screenHeight - h) / 2 | 0;
 }
 if (inPixelPerfectFullscreenMode) {
  __set_canvas_element_size(canvas, w, h);
  if (canvas.GLctxObject) canvas.GLctxObject.GLctx.viewport(0, 0, w, h);
 }
 if (inHiDPIFullscreenMode) {
  topMargin /= dpr;
  w /= dpr;
  h /= dpr;
  w = Math.round(w * 1e4) / 1e4;
  h = Math.round(h * 1e4) / 1e4;
  topMargin = Math.round(topMargin * 1e4) / 1e4;
 }
 if (inCenteredWithoutScalingFullscreenMode) {
  var t = (innerHeight - parseInt(canvas.style.height)) / 2;
  var b = (innerWidth - parseInt(canvas.style.width)) / 2;
  __setLetterbox(canvas, t, b);
 } else {
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  var b = (innerWidth - w) / 2;
  __setLetterbox(canvas, topMargin, b);
 }
 if (!inCenteredWithoutScalingFullscreenMode && __currentFullscreenStrategy.canvasResizedCallback) {
  dynCall_iiii(__currentFullscreenStrategy.canvasResizedCallback, 37, 0, __currentFullscreenStrategy.canvasResizedCallbackUserData);
 }
}

Module["__softFullscreenResizeWebGLRenderTarget"] = __softFullscreenResizeWebGLRenderTarget;

function __emscripten_do_request_fullscreen(target, strategy) {
 if (!JSEvents.fullscreenEnabled()) return -1;
 target = __findEventTarget(target);
 if (!target) return -4;
 if (!target.requestFullscreen && !target.webkitRequestFullscreen) {
  return -3;
 }
 var canPerformRequests = JSEvents.canPerformEventHandlerRequests();
 if (!canPerformRequests) {
  if (strategy.deferUntilInEventHandler) {
   JSEvents.deferCall(_JSEvents_requestFullscreen, 1, [ target, strategy ]);
   return 1;
  } else {
   return -2;
  }
 }
 return _JSEvents_requestFullscreen(target, strategy);
}

Module["__emscripten_do_request_fullscreen"] = __emscripten_do_request_fullscreen;

function _emscripten_request_fullscreen(target, deferUntilInEventHandler) {
 var strategy = {};
 strategy.scaleMode = 0;
 strategy.canvasResolutionScaleMode = 0;
 strategy.filteringMode = 0;
 strategy.deferUntilInEventHandler = deferUntilInEventHandler;
 strategy.canvasResizedCallbackTargetThread = 2;
 return __emscripten_do_request_fullscreen(target, strategy);
}

Module["_emscripten_request_fullscreen"] = _emscripten_request_fullscreen;

function _emscripten_request_fullscreen_strategy(target, deferUntilInEventHandler, fullscreenStrategy) {
 var strategy = {};
 strategy.scaleMode = HEAP32[fullscreenStrategy >> 2];
 strategy.canvasResolutionScaleMode = HEAP32[fullscreenStrategy + 4 >> 2];
 strategy.filteringMode = HEAP32[fullscreenStrategy + 8 >> 2];
 strategy.deferUntilInEventHandler = deferUntilInEventHandler;
 strategy.canvasResizedCallback = HEAP32[fullscreenStrategy + 12 >> 2];
 strategy.canvasResizedCallbackUserData = HEAP32[fullscreenStrategy + 16 >> 2];
 __currentFullscreenStrategy = strategy;
 return __emscripten_do_request_fullscreen(target, strategy);
}

Module["_emscripten_request_fullscreen_strategy"] = _emscripten_request_fullscreen_strategy;

function _emscripten_enter_soft_fullscreen(target, fullscreenStrategy) {
 target = __findEventTarget(target);
 if (!target) return -4;
 var strategy = {};
 strategy.scaleMode = HEAP32[fullscreenStrategy >> 2];
 strategy.canvasResolutionScaleMode = HEAP32[fullscreenStrategy + 4 >> 2];
 strategy.filteringMode = HEAP32[fullscreenStrategy + 8 >> 2];
 strategy.canvasResizedCallback = HEAP32[fullscreenStrategy + 12 >> 2];
 strategy.canvasResizedCallbackUserData = HEAP32[fullscreenStrategy + 16 >> 2];
 strategy.target = target;
 strategy.softFullscreen = true;
 var restoreOldStyle = _JSEvents_resizeCanvasForFullscreen(target, strategy);
 document.documentElement.style.overflow = "hidden";
 document.body.scroll = "no";
 document.body.style.margin = "0px";
 var hiddenElements = __hideEverythingExceptGivenElement(target);
 function restoreWindowedState() {
  restoreOldStyle();
  __restoreHiddenElements(hiddenElements);
  removeEventListener("resize", __softFullscreenResizeWebGLRenderTarget);
  if (strategy.canvasResizedCallback) {
   dynCall_iiii(strategy.canvasResizedCallback, 37, 0, strategy.canvasResizedCallbackUserData);
  }
  __currentFullscreenStrategy = 0;
 }
 __restoreOldWindowedStyle = restoreWindowedState;
 __currentFullscreenStrategy = strategy;
 addEventListener("resize", __softFullscreenResizeWebGLRenderTarget);
 if (strategy.canvasResizedCallback) {
  dynCall_iiii(strategy.canvasResizedCallback, 37, 0, strategy.canvasResizedCallbackUserData);
 }
 return 0;
}

Module["_emscripten_enter_soft_fullscreen"] = _emscripten_enter_soft_fullscreen;

function _emscripten_exit_soft_fullscreen() {
 if (__restoreOldWindowedStyle) __restoreOldWindowedStyle();
 __restoreOldWindowedStyle = null;
 return 0;
}

Module["_emscripten_exit_soft_fullscreen"] = _emscripten_exit_soft_fullscreen;

function _emscripten_exit_fullscreen() {
 if (!JSEvents.fullscreenEnabled()) return -1;
 JSEvents.removeDeferredCalls(_JSEvents_requestFullscreen);
 var d = __specialEventTargets[1];
 if (d.exitFullscreen) {
  d.fullscreenElement && d.exitFullscreen();
 } else if (d.webkitExitFullscreen) {
  d.webkitFullscreenElement && d.webkitExitFullscreen();
 } else {
  return -1;
 }
 return 0;
}

Module["_emscripten_exit_fullscreen"] = _emscripten_exit_fullscreen;

function __fillPointerlockChangeEventData(eventStruct, e) {
 var pointerLockElement = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement || document.msPointerLockElement;
 var isPointerlocked = !!pointerLockElement;
 HEAP32[eventStruct >> 2] = isPointerlocked;
 var nodeName = JSEvents.getNodeNameForTarget(pointerLockElement);
 var id = pointerLockElement && pointerLockElement.id ? pointerLockElement.id : "";
 stringToUTF8(nodeName, eventStruct + 4, 128);
 stringToUTF8(id, eventStruct + 132, 128);
}

Module["__fillPointerlockChangeEventData"] = __fillPointerlockChangeEventData;

function __registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
 if (!JSEvents.pointerlockChangeEvent) JSEvents.pointerlockChangeEvent = _malloc(260);
 var pointerlockChangeEventHandlerFunc = function(ev) {
  var e = ev || event;
  var pointerlockChangeEvent = JSEvents.pointerlockChangeEvent;
  __fillPointerlockChangeEventData(pointerlockChangeEvent, e);
  if (dynCall_iiii(callbackfunc, eventTypeId, pointerlockChangeEvent, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: target,
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: pointerlockChangeEventHandlerFunc,
  useCapture: useCapture
 };
 JSEvents.registerOrRemoveHandler(eventHandler);
}

Module["__registerPointerlockChangeEventCallback"] = __registerPointerlockChangeEventCallback;

function _emscripten_set_pointerlockchange_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 if (!document || !document.body || !document.body.requestPointerLock && !document.body.mozRequestPointerLock && !document.body.webkitRequestPointerLock && !document.body.msRequestPointerLock) {
  return -1;
 }
 target = __findEventTarget(target);
 if (!target) return -4;
 __registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "pointerlockchange", targetThread);
 __registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "mozpointerlockchange", targetThread);
 __registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "webkitpointerlockchange", targetThread);
 __registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "mspointerlockchange", targetThread);
 return 0;
}

Module["_emscripten_set_pointerlockchange_callback_on_thread"] = _emscripten_set_pointerlockchange_callback_on_thread;

function __registerPointerlockErrorEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
 var pointerlockErrorEventHandlerFunc = function(ev) {
  var e = ev || event;
  if (dynCall_iiii(callbackfunc, eventTypeId, 0, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: target,
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: pointerlockErrorEventHandlerFunc,
  useCapture: useCapture
 };
 JSEvents.registerOrRemoveHandler(eventHandler);
}

Module["__registerPointerlockErrorEventCallback"] = __registerPointerlockErrorEventCallback;

function _emscripten_set_pointerlockerror_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 if (!document || !document.body.requestPointerLock && !document.body.mozRequestPointerLock && !document.body.webkitRequestPointerLock && !document.body.msRequestPointerLock) {
  return -1;
 }
 target = __findEventTarget(target);
 if (!target) return -4;
 __registerPointerlockErrorEventCallback(target, userData, useCapture, callbackfunc, 38, "pointerlockerror", targetThread);
 __registerPointerlockErrorEventCallback(target, userData, useCapture, callbackfunc, 38, "mozpointerlockerror", targetThread);
 __registerPointerlockErrorEventCallback(target, userData, useCapture, callbackfunc, 38, "webkitpointerlockerror", targetThread);
 __registerPointerlockErrorEventCallback(target, userData, useCapture, callbackfunc, 38, "mspointerlockerror", targetThread);
 return 0;
}

Module["_emscripten_set_pointerlockerror_callback_on_thread"] = _emscripten_set_pointerlockerror_callback_on_thread;

function _emscripten_get_pointerlock_status(pointerlockStatus) {
 if (pointerlockStatus) __fillPointerlockChangeEventData(pointerlockStatus);
 if (!document.body || !document.body.requestPointerLock && !document.body.mozRequestPointerLock && !document.body.webkitRequestPointerLock && !document.body.msRequestPointerLock) {
  return -1;
 }
 return 0;
}

Module["_emscripten_get_pointerlock_status"] = _emscripten_get_pointerlock_status;

function __requestPointerLock(target) {
 if (target.requestPointerLock) {
  target.requestPointerLock();
 } else if (target.msRequestPointerLock) {
  target.msRequestPointerLock();
 } else {
  if (document.body.requestPointerLock || document.body.msRequestPointerLock) {
   return -3;
  } else {
   return -1;
  }
 }
 return 0;
}

Module["__requestPointerLock"] = __requestPointerLock;

function _emscripten_request_pointerlock(target, deferUntilInEventHandler) {
 target = __findEventTarget(target);
 if (!target) return -4;
 if (!target.requestPointerLock && !target.msRequestPointerLock) {
  return -1;
 }
 var canPerformRequests = JSEvents.canPerformEventHandlerRequests();
 if (!canPerformRequests) {
  if (deferUntilInEventHandler) {
   JSEvents.deferCall(__requestPointerLock, 2, [ target ]);
   return 1;
  } else {
   return -2;
  }
 }
 return __requestPointerLock(target);
}

Module["_emscripten_request_pointerlock"] = _emscripten_request_pointerlock;

function _emscripten_exit_pointerlock() {
 JSEvents.removeDeferredCalls(__requestPointerLock);
 if (document.exitPointerLock) {
  document.exitPointerLock();
 } else if (document.msExitPointerLock) {
  document.msExitPointerLock();
 } else {
  return -1;
 }
 return 0;
}

Module["_emscripten_exit_pointerlock"] = _emscripten_exit_pointerlock;

function _emscripten_vibrate(msecs) {
 if (!navigator.vibrate) return -1;
 navigator.vibrate(msecs);
 return 0;
}

Module["_emscripten_vibrate"] = _emscripten_vibrate;

function _emscripten_vibrate_pattern(msecsArray, numEntries) {
 if (!navigator.vibrate) return -1;
 var vibrateList = [];
 for (var i = 0; i < numEntries; ++i) {
  var msecs = HEAP32[msecsArray + i * 4 >> 2];
  vibrateList.push(msecs);
 }
 navigator.vibrate(vibrateList);
 return 0;
}

Module["_emscripten_vibrate_pattern"] = _emscripten_vibrate_pattern;

function __fillVisibilityChangeEventData(eventStruct, e) {
 var visibilityStates = [ "hidden", "visible", "prerender", "unloaded" ];
 var visibilityState = visibilityStates.indexOf(document.visibilityState);
 HEAP32[eventStruct >> 2] = document.hidden;
 HEAP32[eventStruct + 4 >> 2] = visibilityState;
}

Module["__fillVisibilityChangeEventData"] = __fillVisibilityChangeEventData;

function __registerVisibilityChangeEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
 if (!JSEvents.visibilityChangeEvent) JSEvents.visibilityChangeEvent = _malloc(8);
 var visibilityChangeEventHandlerFunc = function(ev) {
  var e = ev || event;
  var visibilityChangeEvent = JSEvents.visibilityChangeEvent;
  __fillVisibilityChangeEventData(visibilityChangeEvent, e);
  if (dynCall_iiii(callbackfunc, eventTypeId, visibilityChangeEvent, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: target,
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: visibilityChangeEventHandlerFunc,
  useCapture: useCapture
 };
 JSEvents.registerOrRemoveHandler(eventHandler);
}

Module["__registerVisibilityChangeEventCallback"] = __registerVisibilityChangeEventCallback;

function _emscripten_set_visibilitychange_callback_on_thread(userData, useCapture, callbackfunc, targetThread) {
 if (!__specialEventTargets[1]) {
  return -4;
 }
 __registerVisibilityChangeEventCallback(__specialEventTargets[1], userData, useCapture, callbackfunc, 21, "visibilitychange", targetThread);
 return 0;
}

Module["_emscripten_set_visibilitychange_callback_on_thread"] = _emscripten_set_visibilitychange_callback_on_thread;

function _emscripten_get_visibility_status(visibilityStatus) {
 if (typeof document.visibilityState === "undefined" && typeof document.hidden === "undefined") {
  return -1;
 }
 __fillVisibilityChangeEventData(visibilityStatus);
 return 0;
}

Module["_emscripten_get_visibility_status"] = _emscripten_get_visibility_status;

function __registerTouchEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
 if (!JSEvents.touchEvent) JSEvents.touchEvent = _malloc(1684);
 target = __findEventTarget(target);
 var touchEventHandlerFunc = function(ev) {
  var e = ev || event;
  var touches = {};
  for (var i = 0; i < e.touches.length; ++i) {
   var touch = e.touches[i];
   touch.changed = false;
   touches[touch.identifier] = touch;
  }
  for (var i = 0; i < e.changedTouches.length; ++i) {
   var touch = e.changedTouches[i];
   touches[touch.identifier] = touch;
   touch.changed = true;
  }
  for (var i = 0; i < e.targetTouches.length; ++i) {
   var touch = e.targetTouches[i];
   touches[touch.identifier].onTarget = true;
  }
  var touchEvent = JSEvents.touchEvent;
  var ptr = touchEvent;
  HEAP32[ptr + 4 >> 2] = e.ctrlKey;
  HEAP32[ptr + 8 >> 2] = e.shiftKey;
  HEAP32[ptr + 12 >> 2] = e.altKey;
  HEAP32[ptr + 16 >> 2] = e.metaKey;
  ptr += 20;
  var targetRect = __getBoundingClientRect(target);
  var numTouches = 0;
  for (var i in touches) {
   var t = touches[i];
   HEAP32[ptr >> 2] = t.identifier;
   HEAP32[ptr + 4 >> 2] = t.screenX;
   HEAP32[ptr + 8 >> 2] = t.screenY;
   HEAP32[ptr + 12 >> 2] = t.clientX;
   HEAP32[ptr + 16 >> 2] = t.clientY;
   HEAP32[ptr + 20 >> 2] = t.pageX;
   HEAP32[ptr + 24 >> 2] = t.pageY;
   HEAP32[ptr + 28 >> 2] = t.changed;
   HEAP32[ptr + 32 >> 2] = t.onTarget;
   HEAP32[ptr + 36 >> 2] = t.clientX - targetRect.left;
   HEAP32[ptr + 40 >> 2] = t.clientY - targetRect.top;
   ptr += 52;
   if (++numTouches >= 32) {
    break;
   }
  }
  HEAP32[touchEvent >> 2] = numTouches;
  if (dynCall_iiii(callbackfunc, eventTypeId, touchEvent, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: target,
  allowsDeferredCalls: eventTypeString == "touchstart" || eventTypeString == "touchend",
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: touchEventHandlerFunc,
  useCapture: useCapture
 };
 JSEvents.registerOrRemoveHandler(eventHandler);
}

Module["__registerTouchEventCallback"] = __registerTouchEventCallback;

function _emscripten_set_touchstart_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerTouchEventCallback(target, userData, useCapture, callbackfunc, 22, "touchstart", targetThread);
 return 0;
}

Module["_emscripten_set_touchstart_callback_on_thread"] = _emscripten_set_touchstart_callback_on_thread;

function _emscripten_set_touchend_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerTouchEventCallback(target, userData, useCapture, callbackfunc, 23, "touchend", targetThread);
 return 0;
}

Module["_emscripten_set_touchend_callback_on_thread"] = _emscripten_set_touchend_callback_on_thread;

function _emscripten_set_touchmove_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerTouchEventCallback(target, userData, useCapture, callbackfunc, 24, "touchmove", targetThread);
 return 0;
}

Module["_emscripten_set_touchmove_callback_on_thread"] = _emscripten_set_touchmove_callback_on_thread;

function _emscripten_set_touchcancel_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerTouchEventCallback(target, userData, useCapture, callbackfunc, 25, "touchcancel", targetThread);
 return 0;
}

Module["_emscripten_set_touchcancel_callback_on_thread"] = _emscripten_set_touchcancel_callback_on_thread;

function __fillGamepadEventData(eventStruct, e) {
 HEAPF64[eventStruct >> 3] = e.timestamp;
 for (var i = 0; i < e.axes.length; ++i) {
  HEAPF64[eventStruct + i * 8 + 16 >> 3] = e.axes[i];
 }
 for (var i = 0; i < e.buttons.length; ++i) {
  if (typeof e.buttons[i] === "object") {
   HEAPF64[eventStruct + i * 8 + 528 >> 3] = e.buttons[i].value;
  } else {
   HEAPF64[eventStruct + i * 8 + 528 >> 3] = e.buttons[i];
  }
 }
 for (var i = 0; i < e.buttons.length; ++i) {
  if (typeof e.buttons[i] === "object") {
   HEAP32[eventStruct + i * 4 + 1040 >> 2] = e.buttons[i].pressed;
  } else {
   HEAP32[eventStruct + i * 4 + 1040 >> 2] = e.buttons[i] == 1;
  }
 }
 HEAP32[eventStruct + 1296 >> 2] = e.connected;
 HEAP32[eventStruct + 1300 >> 2] = e.index;
 HEAP32[eventStruct + 8 >> 2] = e.axes.length;
 HEAP32[eventStruct + 12 >> 2] = e.buttons.length;
 stringToUTF8(e.id, eventStruct + 1304, 64);
 stringToUTF8(e.mapping, eventStruct + 1368, 64);
}

Module["__fillGamepadEventData"] = __fillGamepadEventData;

function __registerGamepadEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
 if (!JSEvents.gamepadEvent) JSEvents.gamepadEvent = _malloc(1432);
 var gamepadEventHandlerFunc = function(ev) {
  var e = ev || event;
  var gamepadEvent = JSEvents.gamepadEvent;
  __fillGamepadEventData(gamepadEvent, e["gamepad"]);
  if (dynCall_iiii(callbackfunc, eventTypeId, gamepadEvent, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: __findEventTarget(target),
  allowsDeferredCalls: true,
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: gamepadEventHandlerFunc,
  useCapture: useCapture
 };
 JSEvents.registerOrRemoveHandler(eventHandler);
}

Module["__registerGamepadEventCallback"] = __registerGamepadEventCallback;

function _emscripten_set_gamepadconnected_callback_on_thread(userData, useCapture, callbackfunc, targetThread) {
 if (!navigator.getGamepads && !navigator.webkitGetGamepads) return -1;
 __registerGamepadEventCallback(2, userData, useCapture, callbackfunc, 26, "gamepadconnected", targetThread);
 return 0;
}

Module["_emscripten_set_gamepadconnected_callback_on_thread"] = _emscripten_set_gamepadconnected_callback_on_thread;

function _emscripten_set_gamepaddisconnected_callback_on_thread(userData, useCapture, callbackfunc, targetThread) {
 if (!navigator.getGamepads && !navigator.webkitGetGamepads) return -1;
 __registerGamepadEventCallback(2, userData, useCapture, callbackfunc, 27, "gamepaddisconnected", targetThread);
 return 0;
}

Module["_emscripten_set_gamepaddisconnected_callback_on_thread"] = _emscripten_set_gamepaddisconnected_callback_on_thread;

function _emscripten_sample_gamepad_data() {
 return (JSEvents.lastGamepadState = navigator.getGamepads ? navigator.getGamepads() : navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : null) ? 0 : -1;
}

Module["_emscripten_sample_gamepad_data"] = _emscripten_sample_gamepad_data;

function _emscripten_get_num_gamepads() {
 if (!JSEvents.lastGamepadState) throw "emscripten_get_num_gamepads() can only be called after having first called emscripten_sample_gamepad_data() and that function has returned EMSCRIPTEN_RESULT_SUCCESS!";
 return JSEvents.lastGamepadState.length;
}

Module["_emscripten_get_num_gamepads"] = _emscripten_get_num_gamepads;

function _emscripten_get_gamepad_status(index, gamepadState) {
 if (!JSEvents.lastGamepadState) throw "emscripten_get_gamepad_status() can only be called after having first called emscripten_sample_gamepad_data() and that function has returned EMSCRIPTEN_RESULT_SUCCESS!";
 if (index < 0 || index >= JSEvents.lastGamepadState.length) return -5;
 if (!JSEvents.lastGamepadState[index]) return -7;
 __fillGamepadEventData(gamepadState, JSEvents.lastGamepadState[index]);
 return 0;
}

Module["_emscripten_get_gamepad_status"] = _emscripten_get_gamepad_status;

function __registerBeforeUnloadEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
 var beforeUnloadEventHandlerFunc = function(ev) {
  var e = ev || event;
  var confirmationMessage = dynCall_iiii(callbackfunc, eventTypeId, 0, userData);
  if (confirmationMessage) {
   confirmationMessage = UTF8ToString(confirmationMessage);
  }
  if (confirmationMessage) {
   e.preventDefault();
   e.returnValue = confirmationMessage;
   return confirmationMessage;
  }
 };
 var eventHandler = {
  target: __findEventTarget(target),
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: beforeUnloadEventHandlerFunc,
  useCapture: useCapture
 };
 JSEvents.registerOrRemoveHandler(eventHandler);
}

Module["__registerBeforeUnloadEventCallback"] = __registerBeforeUnloadEventCallback;

function _emscripten_set_beforeunload_callback_on_thread(userData, callbackfunc, targetThread) {
 if (typeof onbeforeunload === "undefined") return -1;
 if (targetThread !== 1) return -5;
 __registerBeforeUnloadEventCallback(2, userData, true, callbackfunc, 28, "beforeunload");
 return 0;
}

Module["_emscripten_set_beforeunload_callback_on_thread"] = _emscripten_set_beforeunload_callback_on_thread;

function __fillBatteryEventData(eventStruct, e) {
 HEAPF64[eventStruct >> 3] = e.chargingTime;
 HEAPF64[eventStruct + 8 >> 3] = e.dischargingTime;
 HEAPF64[eventStruct + 16 >> 3] = e.level;
 HEAP32[eventStruct + 24 >> 2] = e.charging;
}

Module["__fillBatteryEventData"] = __fillBatteryEventData;

function __battery() {
 return navigator.battery || navigator.mozBattery || navigator.webkitBattery;
}

Module["__battery"] = __battery;

function __registerBatteryEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
 if (!JSEvents.batteryEvent) JSEvents.batteryEvent = _malloc(32);
 var batteryEventHandlerFunc = function(ev) {
  var e = ev || event;
  var batteryEvent = JSEvents.batteryEvent;
  __fillBatteryEventData(batteryEvent, __battery());
  if (dynCall_iiii(callbackfunc, eventTypeId, batteryEvent, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: __findEventTarget(target),
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: batteryEventHandlerFunc,
  useCapture: useCapture
 };
 JSEvents.registerOrRemoveHandler(eventHandler);
}

Module["__registerBatteryEventCallback"] = __registerBatteryEventCallback;

function _emscripten_set_batterychargingchange_callback_on_thread(userData, callbackfunc, targetThread) {
 if (!__battery()) return -1;
 __registerBatteryEventCallback(__battery(), userData, true, callbackfunc, 29, "chargingchange", targetThread);
 return 0;
}

Module["_emscripten_set_batterychargingchange_callback_on_thread"] = _emscripten_set_batterychargingchange_callback_on_thread;

function _emscripten_set_batterylevelchange_callback_on_thread(userData, callbackfunc, targetThread) {
 if (!__battery()) return -1;
 __registerBatteryEventCallback(__battery(), userData, true, callbackfunc, 30, "levelchange", targetThread);
 return 0;
}

Module["_emscripten_set_batterylevelchange_callback_on_thread"] = _emscripten_set_batterylevelchange_callback_on_thread;

function _emscripten_get_battery_status(batteryState) {
 if (!__battery()) return -1;
 __fillBatteryEventData(batteryState, __battery());
 return 0;
}

Module["_emscripten_get_battery_status"] = _emscripten_get_battery_status;

function _emscripten_webgl_init_context_attributes(attributes) {
 assert(attributes);
 var a = attributes >> 2;
 for (var i = 0; i < 56 >> 2; ++i) {
  HEAP32[a + i] = 0;
 }
 HEAP32[a + (0 >> 2)] = HEAP32[a + (4 >> 2)] = HEAP32[a + (12 >> 2)] = HEAP32[a + (16 >> 2)] = HEAP32[a + (32 >> 2)] = HEAP32[a + (40 >> 2)] = 1;
}

Module["_emscripten_webgl_init_context_attributes"] = _emscripten_webgl_init_context_attributes;

var __emscripten_webgl_power_preferences = [ "default", "low-power", "high-performance" ];

Module["__emscripten_webgl_power_preferences"] = __emscripten_webgl_power_preferences;

function __webgl_acquireInstancedArraysExtension(ctx) {
 var ext = ctx.getExtension("ANGLE_instanced_arrays");
 if (ext) {
  ctx["vertexAttribDivisor"] = function(index, divisor) {
   ext["vertexAttribDivisorANGLE"](index, divisor);
  };
  ctx["drawArraysInstanced"] = function(mode, first, count, primcount) {
   ext["drawArraysInstancedANGLE"](mode, first, count, primcount);
  };
  ctx["drawElementsInstanced"] = function(mode, count, type, indices, primcount) {
   ext["drawElementsInstancedANGLE"](mode, count, type, indices, primcount);
  };
 }
}

Module["__webgl_acquireInstancedArraysExtension"] = __webgl_acquireInstancedArraysExtension;

function __webgl_acquireVertexArrayObjectExtension(ctx) {
 var ext = ctx.getExtension("OES_vertex_array_object");
 if (ext) {
  ctx["createVertexArray"] = function() {
   return ext["createVertexArrayOES"]();
  };
  ctx["deleteVertexArray"] = function(vao) {
   ext["deleteVertexArrayOES"](vao);
  };
  ctx["bindVertexArray"] = function(vao) {
   ext["bindVertexArrayOES"](vao);
  };
  ctx["isVertexArray"] = function(vao) {
   return ext["isVertexArrayOES"](vao);
  };
 }
}

Module["__webgl_acquireVertexArrayObjectExtension"] = __webgl_acquireVertexArrayObjectExtension;

function __webgl_acquireDrawBuffersExtension(ctx) {
 var ext = ctx.getExtension("WEBGL_draw_buffers");
 if (ext) {
  ctx["drawBuffers"] = function(n, bufs) {
   ext["drawBuffersWEBGL"](n, bufs);
  };
 }
}

Module["__webgl_acquireDrawBuffersExtension"] = __webgl_acquireDrawBuffersExtension;

var GL = {
 counter: 1,
 lastError: 0,
 buffers: [],
 mappedBuffers: {},
 programs: [],
 framebuffers: [],
 renderbuffers: [],
 textures: [],
 uniforms: [],
 shaders: [],
 vaos: [],
 contexts: {},
 currentContext: null,
 offscreenCanvases: {},
 timerQueriesEXT: [],
 programInfos: {},
 stringCache: {},
 unpackAlignment: 4,
 init: function() {
  var miniTempFloatBuffer = new Float32Array(GL.MINI_TEMP_BUFFER_SIZE);
  for (var i = 0; i < GL.MINI_TEMP_BUFFER_SIZE; i++) {
   GL.miniTempBufferFloatViews[i] = miniTempFloatBuffer.subarray(0, i + 1);
  }
  var miniTempIntBuffer = new Int32Array(GL.MINI_TEMP_BUFFER_SIZE);
  for (var i = 0; i < GL.MINI_TEMP_BUFFER_SIZE; i++) {
   GL.miniTempBufferIntViews[i] = miniTempIntBuffer.subarray(0, i + 1);
  }
 },
 recordError: function recordError(errorCode) {
  if (!GL.lastError) {
   GL.lastError = errorCode;
  }
 },
 getNewId: function(table) {
  var ret = GL.counter++;
  for (var i = table.length; i < ret; i++) {
   table[i] = null;
  }
  return ret;
 },
 MINI_TEMP_BUFFER_SIZE: 256,
 miniTempBufferFloatViews: [ 0 ],
 miniTempBufferIntViews: [ 0 ],
 getSource: function(shader, count, string, length) {
  var source = "";
  for (var i = 0; i < count; ++i) {
   var len = length ? HEAP32[length + i * 4 >> 2] : -1;
   source += UTF8ToString(HEAP32[string + i * 4 >> 2], len < 0 ? undefined : len);
  }
  return source;
 },
 createContext: function(canvas, webGLContextAttributes) {
  var ctx = canvas.getContext("webgl", webGLContextAttributes);
  if (!ctx) return 0;
  var handle = GL.registerContext(ctx, webGLContextAttributes);
  return handle;
 },
 registerContext: function(ctx, webGLContextAttributes) {
  var handle = _malloc(8);
  var context = {
   handle: handle,
   attributes: webGLContextAttributes,
   version: webGLContextAttributes.majorVersion,
   GLctx: ctx
  };
  if (ctx.canvas) ctx.canvas.GLctxObject = context;
  GL.contexts[handle] = context;
  if (typeof webGLContextAttributes.enableExtensionsByDefault === "undefined" || webGLContextAttributes.enableExtensionsByDefault) {
   GL.initExtensions(context);
  }
  return handle;
 },
 makeContextCurrent: function(contextHandle) {
  GL.currentContext = GL.contexts[contextHandle];
  Module.ctx = GLctx = GL.currentContext && GL.currentContext.GLctx;
  return !(contextHandle && !GLctx);
 },
 getContext: function(contextHandle) {
  return GL.contexts[contextHandle];
 },
 deleteContext: function(contextHandle) {
  if (GL.currentContext === GL.contexts[contextHandle]) GL.currentContext = null;
  if (typeof JSEvents === "object") JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas);
  if (GL.contexts[contextHandle] && GL.contexts[contextHandle].GLctx.canvas) GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined;
  _free(GL.contexts[contextHandle]);
  GL.contexts[contextHandle] = null;
 },
 initExtensions: function(context) {
  if (!context) context = GL.currentContext;
  if (context.initExtensionsDone) return;
  context.initExtensionsDone = true;
  var GLctx = context.GLctx;
  if (context.version < 2) {
   __webgl_acquireInstancedArraysExtension(GLctx);
   __webgl_acquireVertexArrayObjectExtension(GLctx);
   __webgl_acquireDrawBuffersExtension(GLctx);
  }
  GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query");
  var automaticallyEnabledExtensions = [ "OES_texture_float", "OES_texture_half_float", "OES_standard_derivatives", "OES_vertex_array_object", "WEBGL_compressed_texture_s3tc", "WEBGL_depth_texture", "OES_element_index_uint", "EXT_texture_filter_anisotropic", "EXT_frag_depth", "WEBGL_draw_buffers", "ANGLE_instanced_arrays", "OES_texture_float_linear", "OES_texture_half_float_linear", "EXT_blend_minmax", "EXT_shader_texture_lod", "EXT_texture_norm16", "WEBGL_compressed_texture_pvrtc", "EXT_color_buffer_half_float", "WEBGL_color_buffer_float", "EXT_sRGB", "WEBGL_compressed_texture_etc1", "EXT_disjoint_timer_query", "WEBGL_compressed_texture_etc", "WEBGL_compressed_texture_astc", "EXT_color_buffer_float", "WEBGL_compressed_texture_s3tc_srgb", "EXT_disjoint_timer_query_webgl2", "WEBKIT_WEBGL_compressed_texture_pvrtc" ];
  var exts = GLctx.getSupportedExtensions() || [];
  exts.forEach(function(ext) {
   if (automaticallyEnabledExtensions.indexOf(ext) != -1) {
    GLctx.getExtension(ext);
   }
  });
 },
 populateUniformTable: function(program) {
  var p = GL.programs[program];
  var ptable = GL.programInfos[program] = {
   uniforms: {},
   maxUniformLength: 0,
   maxAttributeLength: -1,
   maxUniformBlockNameLength: -1
  };
  var utable = ptable.uniforms;
  var numUniforms = GLctx.getProgramParameter(p, 35718);
  for (var i = 0; i < numUniforms; ++i) {
   var u = GLctx.getActiveUniform(p, i);
   var name = u.name;
   ptable.maxUniformLength = Math.max(ptable.maxUniformLength, name.length + 1);
   if (name.slice(-1) == "]") {
    name = name.slice(0, name.lastIndexOf("["));
   }
   var loc = GLctx.getUniformLocation(p, name);
   if (loc) {
    var id = GL.getNewId(GL.uniforms);
    utable[name] = [ u.size, id ];
    GL.uniforms[id] = loc;
    for (var j = 1; j < u.size; ++j) {
     var n = name + "[" + j + "]";
     loc = GLctx.getUniformLocation(p, n);
     id = GL.getNewId(GL.uniforms);
     GL.uniforms[id] = loc;
    }
   }
  }
 }
};

Module["GL"] = GL;

function _emscripten_webgl_do_create_context(target, attributes) {
 assert(attributes);
 var contextAttributes = {};
 var a = attributes >> 2;
 contextAttributes["alpha"] = !!HEAP32[a + (0 >> 2)];
 contextAttributes["depth"] = !!HEAP32[a + (4 >> 2)];
 contextAttributes["stencil"] = !!HEAP32[a + (8 >> 2)];
 contextAttributes["antialias"] = !!HEAP32[a + (12 >> 2)];
 contextAttributes["premultipliedAlpha"] = !!HEAP32[a + (16 >> 2)];
 contextAttributes["preserveDrawingBuffer"] = !!HEAP32[a + (20 >> 2)];
 var powerPreference = HEAP32[a + (24 >> 2)];
 contextAttributes["powerPreference"] = __emscripten_webgl_power_preferences[powerPreference];
 contextAttributes["failIfMajorPerformanceCaveat"] = !!HEAP32[a + (28 >> 2)];
 contextAttributes.majorVersion = HEAP32[a + (32 >> 2)];
 contextAttributes.minorVersion = HEAP32[a + (36 >> 2)];
 contextAttributes.enableExtensionsByDefault = HEAP32[a + (40 >> 2)];
 contextAttributes.explicitSwapControl = HEAP32[a + (44 >> 2)];
 contextAttributes.proxyContextToMainThread = HEAP32[a + (48 >> 2)];
 contextAttributes.renderViaOffscreenBackBuffer = HEAP32[a + (52 >> 2)];
 var canvas = __findCanvasEventTarget(target);
 if (!canvas) {
  return 0;
 }
 if (contextAttributes.explicitSwapControl) {
  return 0;
 }
 var contextHandle = GL.createContext(canvas, contextAttributes);
 return contextHandle;
}

Module["_emscripten_webgl_do_create_context"] = _emscripten_webgl_do_create_context;

function _emscripten_webgl_create_context(a0, a1) {
 return _emscripten_webgl_do_create_context(a0, a1);
}

Module["_emscripten_webgl_create_context"] = _emscripten_webgl_create_context;

function _emscripten_webgl_do_get_current_context() {
 return GL.currentContext ? GL.currentContext.handle : 0;
}

Module["_emscripten_webgl_do_get_current_context"] = _emscripten_webgl_do_get_current_context;

function _emscripten_webgl_get_current_context() {
 return _emscripten_webgl_do_get_current_context();
}

Module["_emscripten_webgl_get_current_context"] = _emscripten_webgl_get_current_context;

function _emscripten_webgl_do_commit_frame() {
 if (!GL.currentContext || !GL.currentContext.GLctx) {
  return -3;
 }
 if (!GL.currentContext.attributes.explicitSwapControl) {
  return -3;
 }
 return 0;
}

Module["_emscripten_webgl_do_commit_frame"] = _emscripten_webgl_do_commit_frame;

function _emscripten_webgl_commit_frame() {
 return _emscripten_webgl_do_commit_frame();
}

Module["_emscripten_webgl_commit_frame"] = _emscripten_webgl_commit_frame;

function _emscripten_webgl_make_context_current(contextHandle) {
 var success = GL.makeContextCurrent(contextHandle);
 return success ? 0 : -5;
}

Module["_emscripten_webgl_make_context_current"] = _emscripten_webgl_make_context_current;

function _emscripten_webgl_get_drawing_buffer_size_calling_thread(contextHandle, width, height) {
 var GLContext = GL.getContext(contextHandle);
 if (!GLContext || !GLContext.GLctx || !width || !height) {
  return -5;
 }
 HEAP32[width >> 2] = GLContext.GLctx.drawingBufferWidth;
 HEAP32[height >> 2] = GLContext.GLctx.drawingBufferHeight;
 return 0;
}

Module["_emscripten_webgl_get_drawing_buffer_size_calling_thread"] = _emscripten_webgl_get_drawing_buffer_size_calling_thread;

function _emscripten_webgl_get_drawing_buffer_size(a0, a1, a2) {
 return _emscripten_webgl_get_drawing_buffer_size_calling_thread(a0, a1, a2);
}

Module["_emscripten_webgl_get_drawing_buffer_size"] = _emscripten_webgl_get_drawing_buffer_size;

function _emscripten_webgl_get_context_attributes(c, a) {
 if (!a) return -5;
 c = GL.contexts[c];
 if (!c) return -3;
 var t = c.GLctx;
 if (!t) return -3;
 t = t.getContextAttributes();
 HEAP32[a >> 2] = t.alpha;
 HEAP32[a + 4 >> 2] = t.depth;
 HEAP32[a + 8 >> 2] = t.stencil;
 HEAP32[a + 12 >> 2] = t.antialias;
 HEAP32[a + 16 >> 2] = t.premultipliedAlpha;
 HEAP32[a + 20 >> 2] = t.preserveDrawingBuffer;
 var power = t["powerPreference"] && __emscripten_webgl_power_preferences.indexOf(t["powerPreference"]);
 HEAP32[a + 24 >> 2] = power;
 HEAP32[a + 28 >> 2] = t.failIfMajorPerformanceCaveat;
 HEAP32[a + 32 >> 2] = c.version;
 HEAP32[a + 36 >> 2] = 0;
 HEAP32[a + 40 >> 2] = c.attributes.enableExtensionsByDefault;
 return 0;
}

Module["_emscripten_webgl_get_context_attributes"] = _emscripten_webgl_get_context_attributes;

function _emscripten_webgl_destroy_context_calling_thread(contextHandle) {
 if (GL.currentContext == contextHandle) GL.currentContext = 0;
 GL.deleteContext(contextHandle);
}

Module["_emscripten_webgl_destroy_context_calling_thread"] = _emscripten_webgl_destroy_context_calling_thread;

function _emscripten_webgl_destroy_context(a0) {
 return _emscripten_webgl_destroy_context_calling_thread(a0);
}

Module["_emscripten_webgl_destroy_context"] = _emscripten_webgl_destroy_context;

function _emscripten_webgl_enable_extension_calling_thread(contextHandle, extension) {
 var context = GL.getContext(contextHandle);
 var extString = UTF8ToString(extension);
 if (extString.indexOf("GL_") == 0) extString = extString.substr(3);
 if (extString == "ANGLE_instanced_arrays") __webgl_acquireInstancedArraysExtension(GLctx); else if (extString == "OES_vertex_array_object") __webgl_acquireVertexArrayObjectExtension(GLctx); else if (extString == "WEBGL_draw_buffers") __webgl_acquireDrawBuffersExtension(GLctx);
 var ext = context.GLctx.getExtension(extString);
 return !!ext;
}

Module["_emscripten_webgl_enable_extension_calling_thread"] = _emscripten_webgl_enable_extension_calling_thread;

function _emscripten_supports_offscreencanvas() {
 return 0;
}

Module["_emscripten_supports_offscreencanvas"] = _emscripten_supports_offscreencanvas;

function _emscripten_webgl_enable_extension(a0, a1) {
 return _emscripten_webgl_enable_extension_calling_thread(a0, a1);
}

Module["_emscripten_webgl_enable_extension"] = _emscripten_webgl_enable_extension;

function __registerWebGlEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
 var webGlEventHandlerFunc = function(ev) {
  var e = ev || event;
  if (dynCall_iiii(callbackfunc, eventTypeId, 0, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: __findEventTarget(target),
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: webGlEventHandlerFunc,
  useCapture: useCapture
 };
 JSEvents.registerOrRemoveHandler(eventHandler);
}

Module["__registerWebGlEventCallback"] = __registerWebGlEventCallback;

function _emscripten_set_webglcontextlost_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerWebGlEventCallback(target, userData, useCapture, callbackfunc, 31, "webglcontextlost", targetThread);
 return 0;
}

Module["_emscripten_set_webglcontextlost_callback_on_thread"] = _emscripten_set_webglcontextlost_callback_on_thread;

function _emscripten_set_webglcontextrestored_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerWebGlEventCallback(target, userData, useCapture, callbackfunc, 32, "webglcontextrestored", targetThread);
 return 0;
}

Module["_emscripten_set_webglcontextrestored_callback_on_thread"] = _emscripten_set_webglcontextrestored_callback_on_thread;

function _emscripten_is_webgl_context_lost(target) {
 return !GL.contexts[target] || GL.contexts[target].GLctx.isContextLost();
}

Module["_emscripten_is_webgl_context_lost"] = _emscripten_is_webgl_context_lost;

function _emscripten_set_element_css_size(target, width, height) {
 target = __findEventTarget(target);
 if (!target) return -4;
 target.style.width = width + "px";
 target.style.height = height + "px";
 return 0;
}

Module["_emscripten_set_element_css_size"] = _emscripten_set_element_css_size;

function _emscripten_get_element_css_size(target, width, height) {
 target = __findEventTarget(target);
 if (!target) return -4;
 var rect = __getBoundingClientRect(target);
 HEAPF64[width >> 3] = rect.width;
 HEAPF64[height >> 3] = rect.height;
 return 0;
}

Module["_emscripten_get_element_css_size"] = _emscripten_get_element_css_size;

function _emscripten_html5_remove_all_event_listeners() {
 JSEvents.removeAllEventListeners();
}

Module["_emscripten_html5_remove_all_event_listeners"] = _emscripten_html5_remove_all_event_listeners;

function _emscripten_request_animation_frame(cb, userData) {
 return requestAnimationFrame(function(timeStamp) {
  dynCall_idi(cb, timeStamp, userData);
 });
}

Module["_emscripten_request_animation_frame"] = _emscripten_request_animation_frame;

function _emscripten_cancel_animation_frame(id) {
 cancelAnimationFrame(id);
}

Module["_emscripten_cancel_animation_frame"] = _emscripten_cancel_animation_frame;

function _emscripten_request_animation_frame_loop(cb, userData) {
 function tick(timeStamp) {
  if (dynCall_idi(cb, timeStamp, userData)) {
   requestAnimationFrame(tick);
  }
 }
 return requestAnimationFrame(tick);
}

Module["_emscripten_request_animation_frame_loop"] = _emscripten_request_animation_frame_loop;

function __polyfill_set_immediate() {}

Module["__polyfill_set_immediate"] = __polyfill_set_immediate;

function _emscripten_set_immediate(cb, userData) {
 __polyfill_set_immediate();
 return setImmediate(function() {
  dynCall_vi(cb, userData);
 });
}

Module["_emscripten_set_immediate"] = _emscripten_set_immediate;

function _emscripten_clear_immediate(id) {
 clearImmediate(id);
}

Module["_emscripten_clear_immediate"] = _emscripten_clear_immediate;

function _emscripten_set_immediate_loop(cb, userData) {
 __polyfill_set_immediate();
 function tick() {
  if (dynCall_ii(cb, userData)) {
   setImmediate(tick);
  }
 }
 return setImmediate(tick);
}

Module["_emscripten_set_immediate_loop"] = _emscripten_set_immediate_loop;

function _emscripten_set_timeout(cb, msecs, userData) {
 return setTimeout(function() {
  dynCall_vi(cb, userData);
 }, msecs);
}

Module["_emscripten_set_timeout"] = _emscripten_set_timeout;

function _emscripten_clear_timeout(id) {
 clearTimeout(id);
}

Module["_emscripten_clear_timeout"] = _emscripten_clear_timeout;

function _emscripten_set_timeout_loop(cb, msecs, userData) {
 function tick() {
  var t = performance.now();
  var n = t + msecs;
  if (dynCall_idi(cb, t, userData)) {
   setTimeout(tick, t - performance.now());
  }
 }
 return setTimeout(tick, 0);
}

Module["_emscripten_set_timeout_loop"] = _emscripten_set_timeout_loop;

function _emscripten_set_interval(cb, msecs, userData) {
 return setInterval(function() {
  dynCall_vi(cb, userData);
 }, msecs);
}

Module["_emscripten_set_interval"] = _emscripten_set_interval;

function _emscripten_clear_interval(id) {
 clearInterval(id);
}

Module["_emscripten_clear_interval"] = _emscripten_clear_interval;

function _emscripten_date_now() {
 return Date.now();
}

Module["_emscripten_date_now"] = _emscripten_date_now;

function _emscripten_performance_now() {
 return performance.now();
}

Module["_emscripten_performance_now"] = _emscripten_performance_now;

function _emscripten_console_log(str) {
 assert(typeof str === "number");
 console.log(UTF8ToString(str));
}

Module["_emscripten_console_log"] = _emscripten_console_log;

function _emscripten_console_warn(str) {
 assert(typeof str === "number");
 console.warn(UTF8ToString(str));
}

Module["_emscripten_console_warn"] = _emscripten_console_warn;

function _emscripten_console_error(str) {
 assert(typeof str === "number");
 console.error(UTF8ToString(str));
}

Module["_emscripten_console_error"] = _emscripten_console_error;

function _emscripten_throw_number(number) {
 throw number;
}

Module["_emscripten_throw_number"] = _emscripten_throw_number;

function _emscripten_throw_string(str) {
 assert(typeof str === "number");
 throw UTF8ToString(str);
}

Module["_emscripten_throw_string"] = _emscripten_throw_string;

function _emscripten_unwind_to_js_event_loop() {
 throw "unwind";
}

Module["_emscripten_unwind_to_js_event_loop"] = _emscripten_unwind_to_js_event_loop;

function _emscripten_get_device_pixel_ratio() {
 return devicePixelRatio || 1;
}

Module["_emscripten_get_device_pixel_ratio"] = _emscripten_get_device_pixel_ratio;

function _proc_exit(code) {
 return _exit(code);
}

Module["_proc_exit"] = _proc_exit;

function _args_sizes_get(pargc, pargv_buf_size) {
 HEAP32[pargc >> 2] = mainArgs.length;
 var bufSize = 0;
 mainArgs.forEach(function(arg) {
  bufSize += arg.length + 1;
 });
 HEAP32[pargv_buf_size >> 2] = bufSize;
 return 0;
}

Module["_args_sizes_get"] = _args_sizes_get;

function _args_get(argv, argv_buf) {
 var bufSize = 0;
 mainArgs.forEach(function(arg, i) {
  var ptr = argv_buf + bufSize;
  HEAP32[argv + i * 4 >> 2] = ptr;
  writeAsciiToMemory(arg, ptr);
  bufSize += arg.length + 1;
 });
 return 0;
}

Module["_args_get"] = _args_get;

var ___exception_caught = [];

Module["___exception_caught"] = ___exception_caught;

function ___exception_deAdjust(adjusted) {
 if (!adjusted || ___exception_infos[adjusted]) return adjusted;
 for (var key in ___exception_infos) {
  var ptr = +key;
  var adj = ___exception_infos[ptr].adjusted;
  var len = adj.length;
  for (var i = 0; i < len; i++) {
   if (adj[i] === adjusted) {
    return ptr;
   }
  }
 }
 return adjusted;
}

Module["___exception_deAdjust"] = ___exception_deAdjust;

function ___exception_addRef(ptr) {
 if (!ptr) return;
 var info = ___exception_infos[ptr];
 info.refcount++;
}

Module["___exception_addRef"] = ___exception_addRef;

function ___cxa_free_exception(ptr) {
 try {
  return _free(ptr);
 } catch (e) {
  err("exception during cxa_free_exception: " + e);
 }
}

Module["___cxa_free_exception"] = ___cxa_free_exception;

function ___exception_decRef(ptr) {
 if (!ptr) return;
 var info = ___exception_infos[ptr];
 assert(info.refcount > 0);
 info.refcount--;
 if (info.refcount === 0 && !info.rethrown) {
  if (info.destructor) {
   Module["dynCall_ii"](info.destructor, ptr);
  }
  delete ___exception_infos[ptr];
  ___cxa_free_exception(ptr);
 }
}

Module["___exception_decRef"] = ___exception_decRef;

function ___exception_clearRef(ptr) {
 if (!ptr) return;
 var info = ___exception_infos[ptr];
 info.refcount = 0;
}

Module["___exception_clearRef"] = ___exception_clearRef;

function ___cxa_allocate_exception(size) {
 return _malloc(size);
}

Module["___cxa_allocate_exception"] = ___cxa_allocate_exception;

function ___cxa_increment_exception_refcount(ptr) {
 ___exception_addRef(___exception_deAdjust(ptr));
}

Module["___cxa_increment_exception_refcount"] = ___cxa_increment_exception_refcount;

function ___cxa_decrement_exception_refcount(ptr) {
 ___exception_decRef(___exception_deAdjust(ptr));
}

Module["___cxa_decrement_exception_refcount"] = ___cxa_decrement_exception_refcount;

function ___cxa_rethrow() {
 var ptr = ___exception_caught.pop();
 ptr = ___exception_deAdjust(ptr);
 if (!___exception_infos[ptr].rethrown) {
  ___exception_caught.push(ptr);
  ___exception_infos[ptr].rethrown = true;
 }
 ___exception_last = ptr;
 throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch." + " (note: in dynamic linking, if a side module wants exceptions, the main module must be built with that support)";
}

Module["___cxa_rethrow"] = ___cxa_rethrow;

function _llvm_eh_exception() {
 return ___exception_last;
}

Module["_llvm_eh_exception"] = _llvm_eh_exception;

var _llvm_eh_selector__jsargs = true;

Module["_llvm_eh_selector__jsargs"] = _llvm_eh_selector__jsargs;

function _llvm_eh_selector(unused_exception_value, personality) {
 var type = ___exception_last;
 for (var i = 2; i < arguments.length; i++) {
  if (arguments[i] == type) return type;
 }
 return 0;
}

Module["_llvm_eh_selector"] = _llvm_eh_selector;

function _llvm_eh_typeid_for(type) {
 return type;
}

Module["_llvm_eh_typeid_for"] = _llvm_eh_typeid_for;

function ___cxa_begin_catch(ptr) {
 var info = ___exception_infos[ptr];
 if (info && !info.caught) {
  info.caught = true;
  __ZSt18uncaught_exceptionv.uncaught_exceptions--;
 }
 if (info) info.rethrown = false;
 ___exception_caught.push(ptr);
 ___exception_addRef(___exception_deAdjust(ptr));
 return ptr;
}

Module["___cxa_begin_catch"] = ___cxa_begin_catch;

function ___cxa_end_catch() {
 _setThrew(0);
 var ptr = ___exception_caught.pop();
 if (ptr) {
  ___exception_decRef(___exception_deAdjust(ptr));
  ___exception_last = 0;
 }
}

Module["___cxa_end_catch"] = ___cxa_end_catch;

function ___cxa_get_exception_ptr(ptr) {
 return ptr;
}

Module["___cxa_get_exception_ptr"] = ___cxa_get_exception_ptr;

function ___cxa_uncaught_exceptions() {
 return __ZSt18uncaught_exceptionv.uncaught_exceptions;
}

Module["___cxa_uncaught_exceptions"] = ___cxa_uncaught_exceptions;

function ___cxa_current_primary_exception() {
 var ret = ___exception_caught[___exception_caught.length - 1] || 0;
 if (ret) ___exception_addRef(___exception_deAdjust(ret));
 return ret;
}

Module["___cxa_current_primary_exception"] = ___cxa_current_primary_exception;

function ___cxa_rethrow_primary_exception(ptr) {
 if (!ptr) return;
 ptr = ___exception_deAdjust(ptr);
 ___exception_caught.push(ptr);
 ___exception_infos[ptr].rethrown = true;
 ___cxa_rethrow();
}

Module["___cxa_rethrow_primary_exception"] = ___cxa_rethrow_primary_exception;

function ___resumeException(ptr) {
 if (!___exception_last) {
  ___exception_last = ptr;
 }
 throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch." + " (note: in dynamic linking, if a side module wants exceptions, the main module must be built with that support)";
}

Module["___resumeException"] = ___resumeException;

function ___cxa_find_matching_catch() {
 var thrown = ___exception_last;
 if (!thrown) {
  return (setTempRet0(0), 0) | 0;
 }
 var info = ___exception_infos[thrown];
 var throwntype = info.type;
 if (!throwntype) {
  return (setTempRet0(0), thrown) | 0;
 }
 var typeArray = Array.prototype.slice.call(arguments);
 var pointer = Module["___cxa_is_pointer_type"](throwntype);
 var buffer = 0;
 HEAP32[buffer >> 2] = thrown;
 thrown = buffer;
 for (var i = 0; i < typeArray.length; i++) {
  if (typeArray[i] && Module["___cxa_can_catch"](typeArray[i], throwntype, thrown)) {
   thrown = HEAP32[thrown >> 2];
   info.adjusted.push(thrown);
   return (setTempRet0(typeArray[i]), thrown) | 0;
  }
 }
 thrown = HEAP32[thrown >> 2];
 return (setTempRet0(throwntype), thrown) | 0;
}

Module["___cxa_find_matching_catch"] = ___cxa_find_matching_catch;

function _emscripten_async_wget(url, file, onload, onerror) {
 noExitRuntime = true;
 var _url = UTF8ToString(url);
 var _file = UTF8ToString(file);
 _file = PATH_FS.resolve(_file);
 function doCallback(callback) {
  if (callback) {
   var stack = stackSave();
   dynCall_vi(callback, allocate(intArrayFromString(_file), "i8", ALLOC_STACK));
   stackRestore(stack);
  }
 }
 var destinationDirectory = PATH.dirname(_file);
 FS.createPreloadedFile(destinationDirectory, PATH.basename(_file), _url, true, true, function() {
  doCallback(onload);
 }, function() {
  doCallback(onerror);
 }, false, false, function() {
  try {
   FS.unlink(_file);
  } catch (e) {}
  FS.mkdirTree(destinationDirectory);
 });
}

Module["_emscripten_async_wget"] = _emscripten_async_wget;

function _emscripten_async_wget_data(url, arg, onload, onerror) {
 Browser.asyncLoad(UTF8ToString(url), function(byteArray) {
  var buffer = _malloc(byteArray.length);
  HEAPU8.set(byteArray, buffer);
  dynCall_viii(onload, arg, buffer, byteArray.length);
  _free(buffer);
 }, function() {
  if (onerror) dynCall_vi(onerror, arg);
 }, true);
}

Module["_emscripten_async_wget_data"] = _emscripten_async_wget_data;

function _emscripten_async_wget2(url, file, request, param, arg, onload, onerror, onprogress) {
 noExitRuntime = true;
 var _url = UTF8ToString(url);
 var _file = UTF8ToString(file);
 _file = PATH_FS.resolve(_file);
 var _request = UTF8ToString(request);
 var _param = UTF8ToString(param);
 var index = _file.lastIndexOf("/");
 var http = new XMLHttpRequest();
 http.open(_request, _url, true);
 http.responseType = "arraybuffer";
 var handle = Browser.getNextWgetRequestHandle();
 var destinationDirectory = PATH.dirname(_file);
 http.onload = function http_onload(e) {
  if (http.status >= 200 && http.status < 300) {
   try {
    FS.unlink(_file);
   } catch (e) {}
   FS.mkdirTree(destinationDirectory);
   FS.createDataFile(_file.substr(0, index), _file.substr(index + 1), new Uint8Array(http.response), true, true, false);
   if (onload) {
    var stack = stackSave();
    dynCall_viii(onload, handle, arg, allocate(intArrayFromString(_file), "i8", ALLOC_STACK));
    stackRestore(stack);
   }
  } else {
   if (onerror) dynCall_viii(onerror, handle, arg, http.status);
  }
  delete Browser.wgetRequests[handle];
 };
 http.onerror = function http_onerror(e) {
  if (onerror) dynCall_viii(onerror, handle, arg, http.status);
  delete Browser.wgetRequests[handle];
 };
 http.onprogress = function http_onprogress(e) {
  if (e.lengthComputable || e.lengthComputable === undefined && e.total != 0) {
   var percentComplete = e.loaded / e.total * 100;
   if (onprogress) dynCall_viii(onprogress, handle, arg, percentComplete);
  }
 };
 http.onabort = function http_onabort(e) {
  delete Browser.wgetRequests[handle];
 };
 if (_request == "POST") {
  http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  http.send(_param);
 } else {
  http.send(null);
 }
 Browser.wgetRequests[handle] = http;
 return handle;
}

Module["_emscripten_async_wget2"] = _emscripten_async_wget2;

function _emscripten_async_wget2_data(url, request, param, arg, free, onload, onerror, onprogress) {
 var _url = UTF8ToString(url);
 var _request = UTF8ToString(request);
 var _param = UTF8ToString(param);
 var http = new XMLHttpRequest();
 http.open(_request, _url, true);
 http.responseType = "arraybuffer";
 var handle = Browser.getNextWgetRequestHandle();
 http.onload = function http_onload(e) {
  if (http.status >= 200 && http.status < 300 || _url.substr(0, 4).toLowerCase() != "http") {
   var byteArray = new Uint8Array(http.response);
   var buffer = _malloc(byteArray.length);
   HEAPU8.set(byteArray, buffer);
   if (onload) dynCall_viiii(onload, handle, arg, buffer, byteArray.length);
   if (free) _free(buffer);
  } else {
   if (onerror) dynCall_viiii(onerror, handle, arg, http.status, http.statusText);
  }
  delete Browser.wgetRequests[handle];
 };
 http.onerror = function http_onerror(e) {
  if (onerror) {
   dynCall_viiii(onerror, handle, arg, http.status, http.statusText);
  }
  delete Browser.wgetRequests[handle];
 };
 http.onprogress = function http_onprogress(e) {
  if (onprogress) dynCall_viiii(onprogress, handle, arg, e.loaded, e.lengthComputable || e.lengthComputable === undefined ? e.total : 0);
 };
 http.onabort = function http_onabort(e) {
  delete Browser.wgetRequests[handle];
 };
 if (_request == "POST") {
  http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  http.send(_param);
 } else {
  http.send(null);
 }
 Browser.wgetRequests[handle] = http;
 return handle;
}

Module["_emscripten_async_wget2_data"] = _emscripten_async_wget2_data;

function _emscripten_async_wget2_abort(handle) {
 var http = Browser.wgetRequests[handle];
 if (http) {
  http.abort();
 }
}

Module["_emscripten_async_wget2_abort"] = _emscripten_async_wget2_abort;

function _emscripten_run_preload_plugins(file, onload, onerror) {
 noExitRuntime = true;
 var _file = UTF8ToString(file);
 var data = FS.analyzePath(_file);
 if (!data.exists) return -1;
 FS.createPreloadedFile(PATH.dirname(_file), PATH.basename(_file), new Uint8Array(data.object.contents), true, true, function() {
  if (onload) dynCall_vi(onload, file);
 }, function() {
  if (onerror) dynCall_vi(onerror, file);
 }, true);
 return 0;
}

Module["_emscripten_run_preload_plugins"] = _emscripten_run_preload_plugins;

function _emscripten_run_preload_plugins_data(data, size, suffix, arg, onload, onerror) {
 noExitRuntime = true;
 var _suffix = UTF8ToString(suffix);
 if (!Browser.asyncPrepareDataCounter) Browser.asyncPrepareDataCounter = 0;
 var name = "prepare_data_" + Browser.asyncPrepareDataCounter++ + "." + _suffix;
 var lengthAsUTF8 = lengthBytesUTF8(name);
 var cname = _malloc(lengthAsUTF8 + 1);
 stringToUTF8(name, cname, lengthAsUTF8 + 1);
 FS.createPreloadedFile("/", name, HEAPU8.subarray(data, data + size), true, true, function() {
  if (onload) dynCall_vii(onload, arg, cname);
 }, function() {
  if (onerror) dynCall_vi(onerror, arg);
 }, true);
}

Module["_emscripten_run_preload_plugins_data"] = _emscripten_run_preload_plugins_data;

function _emscripten_async_run_script(script, millis) {
 noExitRuntime = true;
 Browser.safeSetTimeout(function() {
  _emscripten_run_script(script);
 }, millis);
}

Module["_emscripten_async_run_script"] = _emscripten_async_run_script;

function _emscripten_async_load_script(url, onload, onerror) {
 onload = getFuncWrapper(onload, "v");
 onerror = getFuncWrapper(onerror, "v");
 noExitRuntime = true;
 assert(runDependencies === 0, "async_load_script must be run when no other dependencies are active");
 var script = document.createElement("script");
 if (onload) {
  script.onload = function script_onload() {
   if (runDependencies > 0) {
    dependenciesFulfilled = onload;
   } else {
    onload();
   }
  };
 }
 if (onerror) script.onerror = onerror;
 script.src = UTF8ToString(url);
 document.body.appendChild(script);
}

Module["_emscripten_async_load_script"] = _emscripten_async_load_script;

function _emscripten_get_main_loop_timing(mode, value) {
 if (mode) HEAP32[mode >> 2] = Browser.mainLoop.timingMode;
 if (value) HEAP32[value >> 2] = Browser.mainLoop.timingValue;
}

Module["_emscripten_get_main_loop_timing"] = _emscripten_get_main_loop_timing;

function _emscripten_set_main_loop_arg(func, arg, fps, simulateInfiniteLoop) {
 _emscripten_set_main_loop(func, fps, simulateInfiniteLoop, arg);
}

Module["_emscripten_set_main_loop_arg"] = _emscripten_set_main_loop_arg;

function _emscripten_cancel_main_loop() {
 Browser.mainLoop.pause();
 Browser.mainLoop.func = null;
}

Module["_emscripten_cancel_main_loop"] = _emscripten_cancel_main_loop;

function _emscripten_pause_main_loop() {
 Browser.mainLoop.pause();
}

Module["_emscripten_pause_main_loop"] = _emscripten_pause_main_loop;

function _emscripten_resume_main_loop() {
 Browser.mainLoop.resume();
}

Module["_emscripten_resume_main_loop"] = _emscripten_resume_main_loop;

function __emscripten_push_main_loop_blocker(func, arg, name) {
 Browser.mainLoop.queue.push({
  func: function() {
   dynCall_vi(func, arg);
  },
  name: UTF8ToString(name),
  counted: true
 });
 Browser.mainLoop.updateStatus();
}

Module["__emscripten_push_main_loop_blocker"] = __emscripten_push_main_loop_blocker;

function __emscripten_push_uncounted_main_loop_blocker(func, arg, name) {
 Browser.mainLoop.queue.push({
  func: function() {
   dynCall_vi(func, arg);
  },
  name: UTF8ToString(name),
  counted: false
 });
 Browser.mainLoop.updateStatus();
}

Module["__emscripten_push_uncounted_main_loop_blocker"] = __emscripten_push_uncounted_main_loop_blocker;

function _emscripten_set_main_loop_expected_blockers(num) {
 Browser.mainLoop.expectedBlockers = num;
 Browser.mainLoop.remainingBlockers = num;
 Browser.mainLoop.updateStatus();
}

Module["_emscripten_set_main_loop_expected_blockers"] = _emscripten_set_main_loop_expected_blockers;

function _emscripten_async_call(func, arg, millis) {
 noExitRuntime = true;
 function wrapper() {
  getFuncWrapper(func, "vi")(arg);
 }
 if (millis >= 0) {
  Browser.safeSetTimeout(wrapper, millis);
 } else {
  Browser.safeRequestAnimationFrame(wrapper);
 }
}

Module["_emscripten_async_call"] = _emscripten_async_call;

function _emscripten_exit_with_live_runtime() {
 noExitRuntime = true;
 throw "unwind";
}

Module["_emscripten_exit_with_live_runtime"] = _emscripten_exit_with_live_runtime;

function _emscripten_force_exit(status) {
 warnOnce("emscripten_force_exit cannot actually shut down the runtime, as the build does not have EXIT_RUNTIME set");
 noExitRuntime = false;
 exit(status);
}

Module["_emscripten_force_exit"] = _emscripten_force_exit;

function _emscripten_hide_mouse() {
 var styleSheet = document.styleSheets[0];
 var rules = styleSheet.cssRules;
 for (var i = 0; i < rules.length; i++) {
  if (rules[i].cssText.substr(0, 6) == "canvas") {
   styleSheet.deleteRule(i);
   i--;
  }
 }
 styleSheet.insertRule("canvas.emscripten { border: 1px solid black; cursor: none; }", 0);
}

Module["_emscripten_hide_mouse"] = _emscripten_hide_mouse;

function _emscripten_set_canvas_size(width, height) {
 Browser.setCanvasSize(width, height);
}

Module["_emscripten_set_canvas_size"] = _emscripten_set_canvas_size;

function _emscripten_get_canvas_size(width, height, isFullscreen) {
 var canvas = Module["canvas"];
 HEAP32[width >> 2] = canvas.width;
 HEAP32[height >> 2] = canvas.height;
 HEAP32[isFullscreen >> 2] = Browser.isFullscreen ? 1 : 0;
}

Module["_emscripten_get_canvas_size"] = _emscripten_get_canvas_size;

function _emscripten_create_worker(url) {
 url = UTF8ToString(url);
 var id = Browser.workers.length;
 var info = {
  worker: new Worker(url),
  callbacks: [],
  awaited: 0,
  buffer: 0,
  bufferSize: 0
 };
 info.worker.onmessage = function info_worker_onmessage(msg) {
  if (ABORT) return;
  var info = Browser.workers[id];
  if (!info) return;
  var callbackId = msg.data["callbackId"];
  var callbackInfo = info.callbacks[callbackId];
  if (!callbackInfo) return;
  if (msg.data["finalResponse"]) {
   info.awaited--;
   info.callbacks[callbackId] = null;
  }
  var data = msg.data["data"];
  if (data) {
   if (!data.byteLength) data = new Uint8Array(data);
   if (!info.buffer || info.bufferSize < data.length) {
    if (info.buffer) _free(info.buffer);
    info.bufferSize = data.length;
    info.buffer = _malloc(data.length);
   }
   HEAPU8.set(data, info.buffer);
   callbackInfo.func(info.buffer, data.length, callbackInfo.arg);
  } else {
   callbackInfo.func(0, 0, callbackInfo.arg);
  }
 };
 Browser.workers.push(info);
 return id;
}

Module["_emscripten_create_worker"] = _emscripten_create_worker;

function _emscripten_destroy_worker(id) {
 var info = Browser.workers[id];
 info.worker.terminate();
 if (info.buffer) _free(info.buffer);
 Browser.workers[id] = null;
}

Module["_emscripten_destroy_worker"] = _emscripten_destroy_worker;

function _emscripten_call_worker(id, funcName, data, size, callback, arg) {
 noExitRuntime = true;
 funcName = UTF8ToString(funcName);
 var info = Browser.workers[id];
 var callbackId = -1;
 if (callback) {
  callbackId = info.callbacks.length;
  info.callbacks.push({
   func: getFuncWrapper(callback, "viii"),
   arg: arg
  });
  info.awaited++;
 }
 var transferObject = {
  "funcName": funcName,
  "callbackId": callbackId,
  "data": data ? new Uint8Array(HEAPU8.subarray(data, data + size)) : 0
 };
 if (data) {
  info.worker.postMessage(transferObject, [ transferObject.data.buffer ]);
 } else {
  info.worker.postMessage(transferObject);
 }
}

Module["_emscripten_call_worker"] = _emscripten_call_worker;

function _emscripten_worker_respond_provisionally(data, size) {
 if (workerResponded) throw "already responded with final response!";
 var transferObject = {
  "callbackId": workerCallbackId,
  "finalResponse": false,
  "data": data ? new Uint8Array(HEAPU8.subarray(data, data + size)) : 0
 };
 if (data) {
  postMessage(transferObject, [ transferObject.data.buffer ]);
 } else {
  postMessage(transferObject);
 }
}

Module["_emscripten_worker_respond_provisionally"] = _emscripten_worker_respond_provisionally;

function _emscripten_worker_respond(data, size) {
 if (workerResponded) throw "already responded with final response!";
 workerResponded = true;
 var transferObject = {
  "callbackId": workerCallbackId,
  "finalResponse": true,
  "data": data ? new Uint8Array(HEAPU8.subarray(data, data + size)) : 0
 };
 if (data) {
  postMessage(transferObject, [ transferObject.data.buffer ]);
 } else {
  postMessage(transferObject);
 }
}

Module["_emscripten_worker_respond"] = _emscripten_worker_respond;

function _emscripten_get_worker_queue_size(id) {
 var info = Browser.workers[id];
 if (!info) return -1;
 return info.awaited;
}

Module["_emscripten_get_worker_queue_size"] = _emscripten_get_worker_queue_size;

function _emscripten_get_preloaded_image_data(path, w, h) {
 if ((path | 0) === path) path = UTF8ToString(path);
 path = PATH_FS.resolve(path);
 var canvas = Module["preloadedImages"][path];
 if (canvas) {
  var ctx = canvas.getContext("2d");
  var image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var buf = _malloc(canvas.width * canvas.height * 4);
  HEAPU8.set(image.data, buf);
  HEAP32[w >> 2] = canvas.width;
  HEAP32[h >> 2] = canvas.height;
  return buf;
 }
 return 0;
}

Module["_emscripten_get_preloaded_image_data"] = _emscripten_get_preloaded_image_data;

function _emscripten_get_preloaded_image_data_from_FILE(file, w, h) {
 var fd = Module["_fileno"](file);
 var stream = FS.getStream(fd);
 if (stream) {
  return _emscripten_get_preloaded_image_data(stream.path, w, h);
 }
 return 0;
}

Module["_emscripten_get_preloaded_image_data_from_FILE"] = _emscripten_get_preloaded_image_data_from_FILE;

function ___set_network_callback(event, userData, callback) {
 function _callback(data) {
  try {
   if (event === "error") {
    var sp = stackSave();
    var msg = allocate(intArrayFromString(data[2]), "i8", ALLOC_STACK);
    dynCall_viiii(callback, data[0], data[1], msg, userData);
    stackRestore(sp);
   } else {
    dynCall_vii(callback, data, userData);
   }
  } catch (e) {
   if (e instanceof ExitStatus) {
    return;
   } else {
    if (e && typeof e === "object" && e.stack) err("exception thrown: " + [ e, e.stack ]);
    throw e;
   }
  }
 }
 noExitRuntime = true;
 Module["websocket"]["on"](event, callback ? _callback : null);
}

Module["___set_network_callback"] = ___set_network_callback;

function _emscripten_set_socket_error_callback(userData, callback) {
 ___set_network_callback("error", userData, callback);
}

Module["_emscripten_set_socket_error_callback"] = _emscripten_set_socket_error_callback;

function _emscripten_set_socket_open_callback(userData, callback) {
 ___set_network_callback("open", userData, callback);
}

Module["_emscripten_set_socket_open_callback"] = _emscripten_set_socket_open_callback;

function _emscripten_set_socket_listen_callback(userData, callback) {
 ___set_network_callback("listen", userData, callback);
}

Module["_emscripten_set_socket_listen_callback"] = _emscripten_set_socket_listen_callback;

function _emscripten_set_socket_connection_callback(userData, callback) {
 ___set_network_callback("connection", userData, callback);
}

Module["_emscripten_set_socket_connection_callback"] = _emscripten_set_socket_connection_callback;

function _emscripten_set_socket_message_callback(userData, callback) {
 ___set_network_callback("message", userData, callback);
}

Module["_emscripten_set_socket_message_callback"] = _emscripten_set_socket_message_callback;

function _emscripten_set_socket_close_callback(userData, callback) {
 ___set_network_callback("close", userData, callback);
}

Module["_emscripten_set_socket_close_callback"] = _emscripten_set_socket_close_callback;

var __tempFixedLengthArray = [];

Module["__tempFixedLengthArray"] = __tempFixedLengthArray;

function __heapObjectForWebGLType(type) {
 type -= 5120;
 if (type == 1) return HEAPU8;
 if (type == 4) return HEAP32;
 if (type == 6) return HEAPF32;
 if (type == 5 || type == 28922) return HEAPU32;
 return HEAPU16;
}

Module["__heapObjectForWebGLType"] = __heapObjectForWebGLType;

function __heapAccessShiftForWebGLHeap(heap) {
 return 31 - Math.clz32(heap.BYTES_PER_ELEMENT);
}

Module["__heapAccessShiftForWebGLHeap"] = __heapAccessShiftForWebGLHeap;

function _glPixelStorei(pname, param) {
 if (pname == 3317) {
  GL.unpackAlignment = param;
 }
 GLctx.pixelStorei(pname, param);
}

Module["_glPixelStorei"] = _glPixelStorei;

function _glGetString(name_) {
 if (GL.stringCache[name_]) return GL.stringCache[name_];
 var ret;
 switch (name_) {
 case 7939:
  var exts = GLctx.getSupportedExtensions() || [];
  exts = exts.concat(exts.map(function(e) {
   return "GL_" + e;
  }));
  ret = stringToNewUTF8(exts.join(" "));
  break;

 case 7936:
 case 7937:
 case 37445:
 case 37446:
  var s = GLctx.getParameter(name_);
  if (!s) {
   GL.recordError(1280);
  }
  ret = stringToNewUTF8(s);
  break;

 case 7938:
  var glVersion = GLctx.getParameter(7938);
  {
   glVersion = "OpenGL ES 2.0 (" + glVersion + ")";
  }
  ret = stringToNewUTF8(glVersion);
  break;

 case 35724:
  var glslVersion = GLctx.getParameter(35724);
  var ver_re = /^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/;
  var ver_num = glslVersion.match(ver_re);
  if (ver_num !== null) {
   if (ver_num[1].length == 3) ver_num[1] = ver_num[1] + "0";
   glslVersion = "OpenGL ES GLSL ES " + ver_num[1] + " (" + glslVersion + ")";
  }
  ret = stringToNewUTF8(glslVersion);
  break;

 default:
  GL.recordError(1280);
  return 0;
 }
 GL.stringCache[name_] = ret;
 return ret;
}

Module["_glGetString"] = _glGetString;

function emscriptenWebGLGet(name_, p, type) {
 if (!p) {
  GL.recordError(1281);
  return;
 }
 var ret = undefined;
 switch (name_) {
 case 36346:
  ret = 1;
  break;

 case 36344:
  if (type != 0 && type != 1) {
   GL.recordError(1280);
  }
  return;

 case 36345:
  ret = 0;
  break;

 case 34466:
  var formats = GLctx.getParameter(34467);
  ret = formats ? formats.length : 0;
  break;
 }
 if (ret === undefined) {
  var result = GLctx.getParameter(name_);
  switch (typeof result) {
  case "number":
   ret = result;
   break;

  case "boolean":
   ret = result ? 1 : 0;
   break;

  case "string":
   GL.recordError(1280);
   return;

  case "object":
   if (result === null) {
    switch (name_) {
    case 34964:
    case 35725:
    case 34965:
    case 36006:
    case 36007:
    case 32873:
    case 34229:
    case 34068:
     {
      ret = 0;
      break;
     }

    default:
     {
      GL.recordError(1280);
      return;
     }
    }
   } else if (result instanceof Float32Array || result instanceof Uint32Array || result instanceof Int32Array || result instanceof Array) {
    for (var i = 0; i < result.length; ++i) {
     switch (type) {
     case 0:
      HEAP32[p + i * 4 >> 2] = result[i];
      break;

     case 2:
      HEAPF32[p + i * 4 >> 2] = result[i];
      break;

     case 4:
      HEAP8[p + i >> 0] = result[i] ? 1 : 0;
      break;
     }
    }
    return;
   } else {
    try {
     ret = result.name | 0;
    } catch (e) {
     GL.recordError(1280);
     err("GL_INVALID_ENUM in glGet" + type + "v: Unknown object returned from WebGL getParameter(" + name_ + ")! (error: " + e + ")");
     return;
    }
   }
   break;

  default:
   GL.recordError(1280);
   err("GL_INVALID_ENUM in glGet" + type + "v: Native code calling glGet" + type + "v(" + name_ + ") and it returns " + result + " of type " + typeof result + "!");
   return;
  }
 }
 switch (type) {
 case 1:
  tempI64 = [ ret >>> 0, (tempDouble = ret, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
  HEAP32[p >> 2] = tempI64[0], HEAP32[p + 4 >> 2] = tempI64[1];
  break;

 case 0:
  HEAP32[p >> 2] = ret;
  break;

 case 2:
  HEAPF32[p >> 2] = ret;
  break;

 case 4:
  HEAP8[p >> 0] = ret ? 1 : 0;
  break;
 }
}

Module["emscriptenWebGLGet"] = emscriptenWebGLGet;

function _glGetIntegerv(name_, p) {
 emscriptenWebGLGet(name_, p, 0);
}

Module["_glGetIntegerv"] = _glGetIntegerv;

function _glGetFloatv(name_, p) {
 emscriptenWebGLGet(name_, p, 2);
}

Module["_glGetFloatv"] = _glGetFloatv;

function _glGetBooleanv(name_, p) {
 emscriptenWebGLGet(name_, p, 4);
}

Module["_glGetBooleanv"] = _glGetBooleanv;

function _glDeleteTextures(n, textures) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[textures + i * 4 >> 2];
  var texture = GL.textures[id];
  if (!texture) continue;
  GLctx.deleteTexture(texture);
  texture.name = 0;
  GL.textures[id] = null;
 }
}

Module["_glDeleteTextures"] = _glDeleteTextures;

function _glCompressedTexImage2D(target, level, internalFormat, width, height, border, imageSize, data) {
 GLctx["compressedTexImage2D"](target, level, internalFormat, width, height, border, data ? HEAPU8.subarray(data, data + imageSize) : null);
}

Module["_glCompressedTexImage2D"] = _glCompressedTexImage2D;

function _glCompressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, imageSize, data) {
 GLctx["compressedTexSubImage2D"](target, level, xoffset, yoffset, width, height, format, data ? HEAPU8.subarray(data, data + imageSize) : null);
}

Module["_glCompressedTexSubImage2D"] = _glCompressedTexSubImage2D;

function __computeUnpackAlignedImageSize(width, height, sizePerPixel, alignment) {
 function roundedToNextMultipleOf(x, y) {
  return x + y - 1 & -y;
 }
 var plainRowSize = width * sizePerPixel;
 var alignedRowSize = roundedToNextMultipleOf(plainRowSize, alignment);
 return height * alignedRowSize;
}

Module["__computeUnpackAlignedImageSize"] = __computeUnpackAlignedImageSize;

function __colorChannelsInGlTextureFormat(format) {
 var colorChannels = {
  5: 3,
  6: 4,
  8: 2,
  29502: 3,
  29504: 4
 };
 return colorChannels[format - 6402] || 1;
}

Module["__colorChannelsInGlTextureFormat"] = __colorChannelsInGlTextureFormat;

function emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) {
 var heap = __heapObjectForWebGLType(type);
 var shift = __heapAccessShiftForWebGLHeap(heap);
 var byteSize = 1 << shift;
 var sizePerPixel = __colorChannelsInGlTextureFormat(format) * byteSize;
 var bytes = __computeUnpackAlignedImageSize(width, height, sizePerPixel, GL.unpackAlignment);
 return heap.subarray(pixels >> shift, pixels + bytes >> shift);
}

Module["emscriptenWebGLGetTexPixelData"] = emscriptenWebGLGetTexPixelData;

function _glTexImage2D(target, level, internalFormat, width, height, border, format, type, pixels) {
 GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixels ? emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) : null);
}

Module["_glTexImage2D"] = _glTexImage2D;

function _glTexSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels) {
 var pixelData = null;
 if (pixels) pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, 0);
 GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixelData);
}

Module["_glTexSubImage2D"] = _glTexSubImage2D;

function _glReadPixels(x, y, width, height, format, type, pixels) {
 var pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, format);
 if (!pixelData) {
  GL.recordError(1280);
  return;
 }
 GLctx.readPixels(x, y, width, height, format, type, pixelData);
}

Module["_glReadPixels"] = _glReadPixels;

function _glBindTexture(target, texture) {
 GLctx.bindTexture(target, GL.textures[texture]);
}

Module["_glBindTexture"] = _glBindTexture;

function _glGetTexParameterfv(target, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 HEAPF32[params >> 2] = GLctx.getTexParameter(target, pname);
}

Module["_glGetTexParameterfv"] = _glGetTexParameterfv;

function _glGetTexParameteriv(target, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 HEAP32[params >> 2] = GLctx.getTexParameter(target, pname);
}

Module["_glGetTexParameteriv"] = _glGetTexParameteriv;

function _glTexParameterfv(target, pname, params) {
 var param = HEAPF32[params >> 2];
 GLctx.texParameterf(target, pname, param);
}

Module["_glTexParameterfv"] = _glTexParameterfv;

function _glTexParameteriv(target, pname, params) {
 var param = HEAP32[params >> 2];
 GLctx.texParameteri(target, pname, param);
}

Module["_glTexParameteriv"] = _glTexParameteriv;

function _glIsTexture(id) {
 var texture = GL.textures[id];
 if (!texture) return 0;
 return GLctx.isTexture(texture);
}

Module["_glIsTexture"] = _glIsTexture;

function __glGenObject(n, buffers, createFunction, objectTable) {
 for (var i = 0; i < n; i++) {
  var buffer = GLctx[createFunction]();
  var id = buffer && GL.getNewId(objectTable);
  if (buffer) {
   buffer.name = id;
   objectTable[id] = buffer;
  } else {
   GL.recordError(1282);
  }
  HEAP32[buffers + i * 4 >> 2] = id;
 }
}

Module["__glGenObject"] = __glGenObject;

function _glGenBuffers(n, buffers) {
 __glGenObject(n, buffers, "createBuffer", GL.buffers);
}

Module["_glGenBuffers"] = _glGenBuffers;

function _glGenTextures(n, textures) {
 __glGenObject(n, textures, "createTexture", GL.textures);
}

Module["_glGenTextures"] = _glGenTextures;

function _glDeleteBuffers(n, buffers) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[buffers + i * 4 >> 2];
  var buffer = GL.buffers[id];
  if (!buffer) continue;
  GLctx.deleteBuffer(buffer);
  buffer.name = 0;
  GL.buffers[id] = null;
  if (id == GL.currArrayBuffer) GL.currArrayBuffer = 0;
  if (id == GL.currElementArrayBuffer) GL.currElementArrayBuffer = 0;
 }
}

Module["_glDeleteBuffers"] = _glDeleteBuffers;

function _glGetBufferParameteriv(target, value, data) {
 if (!data) {
  GL.recordError(1281);
  return;
 }
 HEAP32[data >> 2] = GLctx.getBufferParameter(target, value);
}

Module["_glGetBufferParameteriv"] = _glGetBufferParameteriv;

function _glBufferData(target, size, data, usage) {
 GLctx.bufferData(target, data ? HEAPU8.subarray(data, data + size) : size, usage);
}

Module["_glBufferData"] = _glBufferData;

function _glBufferSubData(target, offset, size, data) {
 GLctx.bufferSubData(target, offset, HEAPU8.subarray(data, data + size));
}

Module["_glBufferSubData"] = _glBufferSubData;

function _glGenQueriesEXT(n, ids) {
 for (var i = 0; i < n; i++) {
  var query = GLctx.disjointTimerQueryExt["createQueryEXT"]();
  if (!query) {
   GL.recordError(1282);
   while (i < n) HEAP32[ids + i++ * 4 >> 2] = 0;
   return;
  }
  var id = GL.getNewId(GL.timerQueriesEXT);
  query.name = id;
  GL.timerQueriesEXT[id] = query;
  HEAP32[ids + i * 4 >> 2] = id;
 }
}

Module["_glGenQueriesEXT"] = _glGenQueriesEXT;

function _glDeleteQueriesEXT(n, ids) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[ids + i * 4 >> 2];
  var query = GL.timerQueriesEXT[id];
  if (!query) continue;
  GLctx.disjointTimerQueryExt["deleteQueryEXT"](query);
  GL.timerQueriesEXT[id] = null;
 }
}

Module["_glDeleteQueriesEXT"] = _glDeleteQueriesEXT;

function _glIsQueryEXT(id) {
 var query = GL.timerQueriesEXT[id];
 if (!query) return 0;
 return GLctx.disjointTimerQueryExt["isQueryEXT"](query);
}

Module["_glIsQueryEXT"] = _glIsQueryEXT;

function _glBeginQueryEXT(target, id) {
 GLctx.disjointTimerQueryExt["beginQueryEXT"](target, GL.timerQueriesEXT[id]);
}

Module["_glBeginQueryEXT"] = _glBeginQueryEXT;

function _glEndQueryEXT(target) {
 GLctx.disjointTimerQueryExt["endQueryEXT"](target);
}

Module["_glEndQueryEXT"] = _glEndQueryEXT;

function _glQueryCounterEXT(id, target) {
 GLctx.disjointTimerQueryExt["queryCounterEXT"](GL.timerQueriesEXT[id], target);
}

Module["_glQueryCounterEXT"] = _glQueryCounterEXT;

function _glGetQueryivEXT(target, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 HEAP32[params >> 2] = GLctx.disjointTimerQueryExt["getQueryEXT"](target, pname);
}

Module["_glGetQueryivEXT"] = _glGetQueryivEXT;

function _glGetQueryObjectivEXT(id, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 var query = GL.timerQueriesEXT[id];
 var param = GLctx.disjointTimerQueryExt["getQueryObjectEXT"](query, pname);
 var ret;
 if (typeof param == "boolean") {
  ret = param ? 1 : 0;
 } else {
  ret = param;
 }
 HEAP32[params >> 2] = ret;
}

Module["_glGetQueryObjectivEXT"] = _glGetQueryObjectivEXT;

function _glGetQueryObjectuivEXT(id, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 var query = GL.timerQueriesEXT[id];
 var param = GLctx.disjointTimerQueryExt["getQueryObjectEXT"](query, pname);
 var ret;
 if (typeof param == "boolean") {
  ret = param ? 1 : 0;
 } else {
  ret = param;
 }
 HEAP32[params >> 2] = ret;
}

Module["_glGetQueryObjectuivEXT"] = _glGetQueryObjectuivEXT;

function _glGetQueryObjecti64vEXT(id, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 var query = GL.timerQueriesEXT[id];
 var param = GLctx.disjointTimerQueryExt["getQueryObjectEXT"](query, pname);
 var ret;
 if (typeof param == "boolean") {
  ret = param ? 1 : 0;
 } else {
  ret = param;
 }
 tempI64 = [ ret >>> 0, (tempDouble = ret, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
 HEAP32[params >> 2] = tempI64[0], HEAP32[params + 4 >> 2] = tempI64[1];
}

Module["_glGetQueryObjecti64vEXT"] = _glGetQueryObjecti64vEXT;

function _glGetQueryObjectui64vEXT(id, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 var query = GL.timerQueriesEXT[id];
 var param = GLctx.disjointTimerQueryExt["getQueryObjectEXT"](query, pname);
 var ret;
 if (typeof param == "boolean") {
  ret = param ? 1 : 0;
 } else {
  ret = param;
 }
 tempI64 = [ ret >>> 0, (tempDouble = ret, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
 HEAP32[params >> 2] = tempI64[0], HEAP32[params + 4 >> 2] = tempI64[1];
}

Module["_glGetQueryObjectui64vEXT"] = _glGetQueryObjectui64vEXT;

function _glIsBuffer(buffer) {
 var b = GL.buffers[buffer];
 if (!b) return 0;
 return GLctx.isBuffer(b);
}

Module["_glIsBuffer"] = _glIsBuffer;

function _glGenRenderbuffers(n, renderbuffers) {
 __glGenObject(n, renderbuffers, "createRenderbuffer", GL.renderbuffers);
}

Module["_glGenRenderbuffers"] = _glGenRenderbuffers;

function _glDeleteRenderbuffers(n, renderbuffers) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[renderbuffers + i * 4 >> 2];
  var renderbuffer = GL.renderbuffers[id];
  if (!renderbuffer) continue;
  GLctx.deleteRenderbuffer(renderbuffer);
  renderbuffer.name = 0;
  GL.renderbuffers[id] = null;
 }
}

Module["_glDeleteRenderbuffers"] = _glDeleteRenderbuffers;

function _glBindRenderbuffer(target, renderbuffer) {
 GLctx.bindRenderbuffer(target, GL.renderbuffers[renderbuffer]);
}

Module["_glBindRenderbuffer"] = _glBindRenderbuffer;

function _glGetRenderbufferParameteriv(target, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 HEAP32[params >> 2] = GLctx.getRenderbufferParameter(target, pname);
}

Module["_glGetRenderbufferParameteriv"] = _glGetRenderbufferParameteriv;

function _glIsRenderbuffer(renderbuffer) {
 var rb = GL.renderbuffers[renderbuffer];
 if (!rb) return 0;
 return GLctx.isRenderbuffer(rb);
}

Module["_glIsRenderbuffer"] = _glIsRenderbuffer;

function emscriptenWebGLGetUniform(program, location, params, type) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 var data = GLctx.getUniform(GL.programs[program], GL.uniforms[location]);
 if (typeof data == "number" || typeof data == "boolean") {
  switch (type) {
  case 0:
   HEAP32[params >> 2] = data;
   break;

  case 2:
   HEAPF32[params >> 2] = data;
   break;

  default:
   throw "internal emscriptenWebGLGetUniform() error, bad type: " + type;
  }
 } else {
  for (var i = 0; i < data.length; i++) {
   switch (type) {
   case 0:
    HEAP32[params + i * 4 >> 2] = data[i];
    break;

   case 2:
    HEAPF32[params + i * 4 >> 2] = data[i];
    break;

   default:
    throw "internal emscriptenWebGLGetUniform() error, bad type: " + type;
   }
  }
 }
}

Module["emscriptenWebGLGetUniform"] = emscriptenWebGLGetUniform;

function _glGetUniformfv(program, location, params) {
 emscriptenWebGLGetUniform(program, location, params, 2);
}

Module["_glGetUniformfv"] = _glGetUniformfv;

function _glGetUniformiv(program, location, params) {
 emscriptenWebGLGetUniform(program, location, params, 0);
}

Module["_glGetUniformiv"] = _glGetUniformiv;

function _glGetUniformLocation(program, name) {
 name = UTF8ToString(name);
 var arrayIndex = 0;
 if (name[name.length - 1] == "]") {
  var leftBrace = name.lastIndexOf("[");
  arrayIndex = name[leftBrace + 1] != "]" ? parseInt(name.slice(leftBrace + 1)) : 0;
  name = name.slice(0, leftBrace);
 }
 var uniformInfo = GL.programInfos[program] && GL.programInfos[program].uniforms[name];
 if (uniformInfo && arrayIndex >= 0 && arrayIndex < uniformInfo[0]) {
  return uniformInfo[1] + arrayIndex;
 } else {
  return -1;
 }
}

Module["_glGetUniformLocation"] = _glGetUniformLocation;

function emscriptenWebGLGetVertexAttrib(index, pname, params, type) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 var data = GLctx.getVertexAttrib(index, pname);
 if (pname == 34975) {
  HEAP32[params >> 2] = data["name"];
 } else if (typeof data == "number" || typeof data == "boolean") {
  switch (type) {
  case 0:
   HEAP32[params >> 2] = data;
   break;

  case 2:
   HEAPF32[params >> 2] = data;
   break;

  case 5:
   HEAP32[params >> 2] = Math.fround(data);
   break;

  default:
   throw "internal emscriptenWebGLGetVertexAttrib() error, bad type: " + type;
  }
 } else {
  for (var i = 0; i < data.length; i++) {
   switch (type) {
   case 0:
    HEAP32[params + i * 4 >> 2] = data[i];
    break;

   case 2:
    HEAPF32[params + i * 4 >> 2] = data[i];
    break;

   case 5:
    HEAP32[params + i * 4 >> 2] = Math.fround(data[i]);
    break;

   default:
    throw "internal emscriptenWebGLGetVertexAttrib() error, bad type: " + type;
   }
  }
 }
}

Module["emscriptenWebGLGetVertexAttrib"] = emscriptenWebGLGetVertexAttrib;

function _glGetVertexAttribfv(index, pname, params) {
 emscriptenWebGLGetVertexAttrib(index, pname, params, 2);
}

Module["_glGetVertexAttribfv"] = _glGetVertexAttribfv;

function _glGetVertexAttribiv(index, pname, params) {
 emscriptenWebGLGetVertexAttrib(index, pname, params, 5);
}

Module["_glGetVertexAttribiv"] = _glGetVertexAttribiv;

function _glGetVertexAttribPointerv(index, pname, pointer) {
 if (!pointer) {
  GL.recordError(1281);
  return;
 }
 HEAP32[pointer >> 2] = GLctx.getVertexAttribOffset(index, pname);
}

Module["_glGetVertexAttribPointerv"] = _glGetVertexAttribPointerv;

function _glGetActiveUniform(program, index, bufSize, length, size, type, name) {
 program = GL.programs[program];
 var info = GLctx.getActiveUniform(program, index);
 if (!info) return;
 var numBytesWrittenExclNull = bufSize > 0 && name ? stringToUTF8(info.name, name, bufSize) : 0;
 if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
 if (size) HEAP32[size >> 2] = info.size;
 if (type) HEAP32[type >> 2] = info.type;
}

Module["_glGetActiveUniform"] = _glGetActiveUniform;

function _glUniform1f(location, v0) {
 GLctx.uniform1f(GL.uniforms[location], v0);
}

Module["_glUniform1f"] = _glUniform1f;

function _glUniform2f(location, v0, v1) {
 GLctx.uniform2f(GL.uniforms[location], v0, v1);
}

Module["_glUniform2f"] = _glUniform2f;

function _glUniform3f(location, v0, v1, v2) {
 GLctx.uniform3f(GL.uniforms[location], v0, v1, v2);
}

Module["_glUniform3f"] = _glUniform3f;

function _glUniform4f(location, v0, v1, v2, v3) {
 GLctx.uniform4f(GL.uniforms[location], v0, v1, v2, v3);
}

Module["_glUniform4f"] = _glUniform4f;

function _glUniform1i(location, v0) {
 GLctx.uniform1i(GL.uniforms[location], v0);
}

Module["_glUniform1i"] = _glUniform1i;

function _glUniform2i(location, v0, v1) {
 GLctx.uniform2i(GL.uniforms[location], v0, v1);
}

Module["_glUniform2i"] = _glUniform2i;

function _glUniform3i(location, v0, v1, v2) {
 GLctx.uniform3i(GL.uniforms[location], v0, v1, v2);
}

Module["_glUniform3i"] = _glUniform3i;

function _glUniform4i(location, v0, v1, v2, v3) {
 GLctx.uniform4i(GL.uniforms[location], v0, v1, v2, v3);
}

Module["_glUniform4i"] = _glUniform4i;

function _glUniform1iv(location, count, value) {
 if (count <= GL.MINI_TEMP_BUFFER_SIZE) {
  var view = GL.miniTempBufferIntViews[count - 1];
  for (var i = 0; i < count; ++i) {
   view[i] = HEAP32[value + 4 * i >> 2];
  }
 } else {
  var view = HEAP32.subarray(value >> 2, value + count * 4 >> 2);
 }
 GLctx.uniform1iv(GL.uniforms[location], view);
}

Module["_glUniform1iv"] = _glUniform1iv;

function _glUniform2iv(location, count, value) {
 if (2 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
  var view = GL.miniTempBufferIntViews[2 * count - 1];
  for (var i = 0; i < 2 * count; i += 2) {
   view[i] = HEAP32[value + 4 * i >> 2];
   view[i + 1] = HEAP32[value + (4 * i + 4) >> 2];
  }
 } else {
  var view = HEAP32.subarray(value >> 2, value + count * 8 >> 2);
 }
 GLctx.uniform2iv(GL.uniforms[location], view);
}

Module["_glUniform2iv"] = _glUniform2iv;

function _glUniform3iv(location, count, value) {
 if (3 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
  var view = GL.miniTempBufferIntViews[3 * count - 1];
  for (var i = 0; i < 3 * count; i += 3) {
   view[i] = HEAP32[value + 4 * i >> 2];
   view[i + 1] = HEAP32[value + (4 * i + 4) >> 2];
   view[i + 2] = HEAP32[value + (4 * i + 8) >> 2];
  }
 } else {
  var view = HEAP32.subarray(value >> 2, value + count * 12 >> 2);
 }
 GLctx.uniform3iv(GL.uniforms[location], view);
}

Module["_glUniform3iv"] = _glUniform3iv;

function _glUniform4iv(location, count, value) {
 if (4 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
  var view = GL.miniTempBufferIntViews[4 * count - 1];
  for (var i = 0; i < 4 * count; i += 4) {
   view[i] = HEAP32[value + 4 * i >> 2];
   view[i + 1] = HEAP32[value + (4 * i + 4) >> 2];
   view[i + 2] = HEAP32[value + (4 * i + 8) >> 2];
   view[i + 3] = HEAP32[value + (4 * i + 12) >> 2];
  }
 } else {
  var view = HEAP32.subarray(value >> 2, value + count * 16 >> 2);
 }
 GLctx.uniform4iv(GL.uniforms[location], view);
}

Module["_glUniform4iv"] = _glUniform4iv;

function _glUniform1fv(location, count, value) {
 if (count <= GL.MINI_TEMP_BUFFER_SIZE) {
  var view = GL.miniTempBufferFloatViews[count - 1];
  for (var i = 0; i < count; ++i) {
   view[i] = HEAPF32[value + 4 * i >> 2];
  }
 } else {
  var view = HEAPF32.subarray(value >> 2, value + count * 4 >> 2);
 }
 GLctx.uniform1fv(GL.uniforms[location], view);
}

Module["_glUniform1fv"] = _glUniform1fv;

function _glUniform2fv(location, count, value) {
 if (2 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
  var view = GL.miniTempBufferFloatViews[2 * count - 1];
  for (var i = 0; i < 2 * count; i += 2) {
   view[i] = HEAPF32[value + 4 * i >> 2];
   view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
  }
 } else {
  var view = HEAPF32.subarray(value >> 2, value + count * 8 >> 2);
 }
 GLctx.uniform2fv(GL.uniforms[location], view);
}

Module["_glUniform2fv"] = _glUniform2fv;

function _glUniform3fv(location, count, value) {
 if (3 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
  var view = GL.miniTempBufferFloatViews[3 * count - 1];
  for (var i = 0; i < 3 * count; i += 3) {
   view[i] = HEAPF32[value + 4 * i >> 2];
   view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
   view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2];
  }
 } else {
  var view = HEAPF32.subarray(value >> 2, value + count * 12 >> 2);
 }
 GLctx.uniform3fv(GL.uniforms[location], view);
}

Module["_glUniform3fv"] = _glUniform3fv;

function _glUniform4fv(location, count, value) {
 if (4 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
  var view = GL.miniTempBufferFloatViews[4 * count - 1];
  for (var i = 0; i < 4 * count; i += 4) {
   view[i] = HEAPF32[value + 4 * i >> 2];
   view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
   view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2];
   view[i + 3] = HEAPF32[value + (4 * i + 12) >> 2];
  }
 } else {
  var view = HEAPF32.subarray(value >> 2, value + count * 16 >> 2);
 }
 GLctx.uniform4fv(GL.uniforms[location], view);
}

Module["_glUniform4fv"] = _glUniform4fv;

function _glUniformMatrix2fv(location, count, transpose, value) {
 if (4 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
  var view = GL.miniTempBufferFloatViews[4 * count - 1];
  for (var i = 0; i < 4 * count; i += 4) {
   view[i] = HEAPF32[value + 4 * i >> 2];
   view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
   view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2];
   view[i + 3] = HEAPF32[value + (4 * i + 12) >> 2];
  }
 } else {
  var view = HEAPF32.subarray(value >> 2, value + count * 16 >> 2);
 }
 GLctx.uniformMatrix2fv(GL.uniforms[location], !!transpose, view);
}

Module["_glUniformMatrix2fv"] = _glUniformMatrix2fv;

function _glUniformMatrix3fv(location, count, transpose, value) {
 if (9 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
  var view = GL.miniTempBufferFloatViews[9 * count - 1];
  for (var i = 0; i < 9 * count; i += 9) {
   view[i] = HEAPF32[value + 4 * i >> 2];
   view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
   view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2];
   view[i + 3] = HEAPF32[value + (4 * i + 12) >> 2];
   view[i + 4] = HEAPF32[value + (4 * i + 16) >> 2];
   view[i + 5] = HEAPF32[value + (4 * i + 20) >> 2];
   view[i + 6] = HEAPF32[value + (4 * i + 24) >> 2];
   view[i + 7] = HEAPF32[value + (4 * i + 28) >> 2];
   view[i + 8] = HEAPF32[value + (4 * i + 32) >> 2];
  }
 } else {
  var view = HEAPF32.subarray(value >> 2, value + count * 36 >> 2);
 }
 GLctx.uniformMatrix3fv(GL.uniforms[location], !!transpose, view);
}

Module["_glUniformMatrix3fv"] = _glUniformMatrix3fv;

function _glUniformMatrix4fv(location, count, transpose, value) {
 if (16 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
  var view = GL.miniTempBufferFloatViews[16 * count - 1];
  for (var i = 0; i < 16 * count; i += 16) {
   view[i] = HEAPF32[value + 4 * i >> 2];
   view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
   view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2];
   view[i + 3] = HEAPF32[value + (4 * i + 12) >> 2];
   view[i + 4] = HEAPF32[value + (4 * i + 16) >> 2];
   view[i + 5] = HEAPF32[value + (4 * i + 20) >> 2];
   view[i + 6] = HEAPF32[value + (4 * i + 24) >> 2];
   view[i + 7] = HEAPF32[value + (4 * i + 28) >> 2];
   view[i + 8] = HEAPF32[value + (4 * i + 32) >> 2];
   view[i + 9] = HEAPF32[value + (4 * i + 36) >> 2];
   view[i + 10] = HEAPF32[value + (4 * i + 40) >> 2];
   view[i + 11] = HEAPF32[value + (4 * i + 44) >> 2];
   view[i + 12] = HEAPF32[value + (4 * i + 48) >> 2];
   view[i + 13] = HEAPF32[value + (4 * i + 52) >> 2];
   view[i + 14] = HEAPF32[value + (4 * i + 56) >> 2];
   view[i + 15] = HEAPF32[value + (4 * i + 60) >> 2];
  }
 } else {
  var view = HEAPF32.subarray(value >> 2, value + count * 64 >> 2);
 }
 GLctx.uniformMatrix4fv(GL.uniforms[location], !!transpose, view);
}

Module["_glUniformMatrix4fv"] = _glUniformMatrix4fv;

function _glBindBuffer(target, buffer) {
 GLctx.bindBuffer(target, GL.buffers[buffer]);
}

Module["_glBindBuffer"] = _glBindBuffer;

function _glVertexAttrib1fv(index, v) {
 GLctx.vertexAttrib1f(index, HEAPF32[v >> 2]);
}

Module["_glVertexAttrib1fv"] = _glVertexAttrib1fv;

function _glVertexAttrib2fv(index, v) {
 GLctx.vertexAttrib2f(index, HEAPF32[v >> 2], HEAPF32[v + 4 >> 2]);
}

Module["_glVertexAttrib2fv"] = _glVertexAttrib2fv;

function _glVertexAttrib3fv(index, v) {
 GLctx.vertexAttrib3f(index, HEAPF32[v >> 2], HEAPF32[v + 4 >> 2], HEAPF32[v + 8 >> 2]);
}

Module["_glVertexAttrib3fv"] = _glVertexAttrib3fv;

function _glVertexAttrib4fv(index, v) {
 GLctx.vertexAttrib4f(index, HEAPF32[v >> 2], HEAPF32[v + 4 >> 2], HEAPF32[v + 8 >> 2], HEAPF32[v + 12 >> 2]);
}

Module["_glVertexAttrib4fv"] = _glVertexAttrib4fv;

function _glGetAttribLocation(program, name) {
 return GLctx.getAttribLocation(GL.programs[program], UTF8ToString(name));
}

Module["_glGetAttribLocation"] = _glGetAttribLocation;

function _glGetActiveAttrib(program, index, bufSize, length, size, type, name) {
 program = GL.programs[program];
 var info = GLctx.getActiveAttrib(program, index);
 if (!info) return;
 var numBytesWrittenExclNull = bufSize > 0 && name ? stringToUTF8(info.name, name, bufSize) : 0;
 if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
 if (size) HEAP32[size >> 2] = info.size;
 if (type) HEAP32[type >> 2] = info.type;
}

Module["_glGetActiveAttrib"] = _glGetActiveAttrib;

function _glCreateShader(shaderType) {
 var id = GL.getNewId(GL.shaders);
 GL.shaders[id] = GLctx.createShader(shaderType);
 return id;
}

Module["_glCreateShader"] = _glCreateShader;

function _glDeleteShader(id) {
 if (!id) return;
 var shader = GL.shaders[id];
 if (!shader) {
  GL.recordError(1281);
  return;
 }
 GLctx.deleteShader(shader);
 GL.shaders[id] = null;
}

Module["_glDeleteShader"] = _glDeleteShader;

function _glGetAttachedShaders(program, maxCount, count, shaders) {
 var result = GLctx.getAttachedShaders(GL.programs[program]);
 var len = result.length;
 if (len > maxCount) {
  len = maxCount;
 }
 HEAP32[count >> 2] = len;
 for (var i = 0; i < len; ++i) {
  var id = GL.shaders.indexOf(result[i]);
  HEAP32[shaders + i * 4 >> 2] = id;
 }
}

Module["_glGetAttachedShaders"] = _glGetAttachedShaders;

function _glShaderSource(shader, count, string, length) {
 var source = GL.getSource(shader, count, string, length);
 GLctx.shaderSource(GL.shaders[shader], source);
}

Module["_glShaderSource"] = _glShaderSource;

function _glGetShaderSource(shader, bufSize, length, source) {
 var result = GLctx.getShaderSource(GL.shaders[shader]);
 if (!result) return;
 var numBytesWrittenExclNull = bufSize > 0 && source ? stringToUTF8(result, source, bufSize) : 0;
 if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
}

Module["_glGetShaderSource"] = _glGetShaderSource;

function _glCompileShader(shader) {
 GLctx.compileShader(GL.shaders[shader]);
}

Module["_glCompileShader"] = _glCompileShader;

function _glGetShaderInfoLog(shader, maxLength, length, infoLog) {
 var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
 if (log === null) log = "(unknown error)";
 var numBytesWrittenExclNull = maxLength > 0 && infoLog ? stringToUTF8(log, infoLog, maxLength) : 0;
 if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
}

Module["_glGetShaderInfoLog"] = _glGetShaderInfoLog;

function _glGetShaderiv(shader, pname, p) {
 if (!p) {
  GL.recordError(1281);
  return;
 }
 if (pname == 35716) {
  var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
  if (log === null) log = "(unknown error)";
  HEAP32[p >> 2] = log.length + 1;
 } else if (pname == 35720) {
  var source = GLctx.getShaderSource(GL.shaders[shader]);
  var sourceLength = source === null || source.length == 0 ? 0 : source.length + 1;
  HEAP32[p >> 2] = sourceLength;
 } else {
  HEAP32[p >> 2] = GLctx.getShaderParameter(GL.shaders[shader], pname);
 }
}

Module["_glGetShaderiv"] = _glGetShaderiv;

function _glGetProgramiv(program, pname, p) {
 if (!p) {
  GL.recordError(1281);
  return;
 }
 if (program >= GL.counter) {
  GL.recordError(1281);
  return;
 }
 var ptable = GL.programInfos[program];
 if (!ptable) {
  GL.recordError(1282);
  return;
 }
 if (pname == 35716) {
  var log = GLctx.getProgramInfoLog(GL.programs[program]);
  if (log === null) log = "(unknown error)";
  HEAP32[p >> 2] = log.length + 1;
 } else if (pname == 35719) {
  HEAP32[p >> 2] = ptable.maxUniformLength;
 } else if (pname == 35722) {
  if (ptable.maxAttributeLength == -1) {
   program = GL.programs[program];
   var numAttribs = GLctx.getProgramParameter(program, 35721);
   ptable.maxAttributeLength = 0;
   for (var i = 0; i < numAttribs; ++i) {
    var activeAttrib = GLctx.getActiveAttrib(program, i);
    ptable.maxAttributeLength = Math.max(ptable.maxAttributeLength, activeAttrib.name.length + 1);
   }
  }
  HEAP32[p >> 2] = ptable.maxAttributeLength;
 } else if (pname == 35381) {
  if (ptable.maxUniformBlockNameLength == -1) {
   program = GL.programs[program];
   var numBlocks = GLctx.getProgramParameter(program, 35382);
   ptable.maxUniformBlockNameLength = 0;
   for (var i = 0; i < numBlocks; ++i) {
    var activeBlockName = GLctx.getActiveUniformBlockName(program, i);
    ptable.maxUniformBlockNameLength = Math.max(ptable.maxUniformBlockNameLength, activeBlockName.length + 1);
   }
  }
  HEAP32[p >> 2] = ptable.maxUniformBlockNameLength;
 } else {
  HEAP32[p >> 2] = GLctx.getProgramParameter(GL.programs[program], pname);
 }
}

Module["_glGetProgramiv"] = _glGetProgramiv;

function _glIsShader(shader) {
 var s = GL.shaders[shader];
 if (!s) return 0;
 return GLctx.isShader(s);
}

Module["_glIsShader"] = _glIsShader;

function _glCreateProgram() {
 var id = GL.getNewId(GL.programs);
 var program = GLctx.createProgram();
 program.name = id;
 GL.programs[id] = program;
 return id;
}

Module["_glCreateProgram"] = _glCreateProgram;

function _glDeleteProgram(id) {
 if (!id) return;
 var program = GL.programs[id];
 if (!program) {
  GL.recordError(1281);
  return;
 }
 GLctx.deleteProgram(program);
 program.name = 0;
 GL.programs[id] = null;
 GL.programInfos[id] = null;
}

Module["_glDeleteProgram"] = _glDeleteProgram;

function _glAttachShader(program, shader) {
 GLctx.attachShader(GL.programs[program], GL.shaders[shader]);
}

Module["_glAttachShader"] = _glAttachShader;

function _glDetachShader(program, shader) {
 GLctx.detachShader(GL.programs[program], GL.shaders[shader]);
}

Module["_glDetachShader"] = _glDetachShader;

function _glGetShaderPrecisionFormat(shaderType, precisionType, range, precision) {
 var result = GLctx.getShaderPrecisionFormat(shaderType, precisionType);
 HEAP32[range >> 2] = result.rangeMin;
 HEAP32[range + 4 >> 2] = result.rangeMax;
 HEAP32[precision >> 2] = result.precision;
}

Module["_glGetShaderPrecisionFormat"] = _glGetShaderPrecisionFormat;

function _glLinkProgram(program) {
 GLctx.linkProgram(GL.programs[program]);
 GL.populateUniformTable(program);
}

Module["_glLinkProgram"] = _glLinkProgram;

function _glGetProgramInfoLog(program, maxLength, length, infoLog) {
 var log = GLctx.getProgramInfoLog(GL.programs[program]);
 if (log === null) log = "(unknown error)";
 var numBytesWrittenExclNull = maxLength > 0 && infoLog ? stringToUTF8(log, infoLog, maxLength) : 0;
 if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
}

Module["_glGetProgramInfoLog"] = _glGetProgramInfoLog;

function _glUseProgram(program) {
 GLctx.useProgram(GL.programs[program]);
}

Module["_glUseProgram"] = _glUseProgram;

function _glValidateProgram(program) {
 GLctx.validateProgram(GL.programs[program]);
}

Module["_glValidateProgram"] = _glValidateProgram;

function _glIsProgram(program) {
 program = GL.programs[program];
 if (!program) return 0;
 return GLctx.isProgram(program);
}

Module["_glIsProgram"] = _glIsProgram;

function _glBindAttribLocation(program, index, name) {
 GLctx.bindAttribLocation(GL.programs[program], index, UTF8ToString(name));
}

Module["_glBindAttribLocation"] = _glBindAttribLocation;

function _glBindFramebuffer(target, framebuffer) {
 GLctx.bindFramebuffer(target, GL.framebuffers[framebuffer]);
}

Module["_glBindFramebuffer"] = _glBindFramebuffer;

function _glGenFramebuffers(n, ids) {
 __glGenObject(n, ids, "createFramebuffer", GL.framebuffers);
}

Module["_glGenFramebuffers"] = _glGenFramebuffers;

function _glDeleteFramebuffers(n, framebuffers) {
 for (var i = 0; i < n; ++i) {
  var id = HEAP32[framebuffers + i * 4 >> 2];
  var framebuffer = GL.framebuffers[id];
  if (!framebuffer) continue;
  GLctx.deleteFramebuffer(framebuffer);
  framebuffer.name = 0;
  GL.framebuffers[id] = null;
 }
}

Module["_glDeleteFramebuffers"] = _glDeleteFramebuffers;

function _glFramebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer) {
 GLctx.framebufferRenderbuffer(target, attachment, renderbuffertarget, GL.renderbuffers[renderbuffer]);
}

Module["_glFramebufferRenderbuffer"] = _glFramebufferRenderbuffer;

function _glFramebufferTexture2D(target, attachment, textarget, texture, level) {
 GLctx.framebufferTexture2D(target, attachment, textarget, GL.textures[texture], level);
}

Module["_glFramebufferTexture2D"] = _glFramebufferTexture2D;

function _glGetFramebufferAttachmentParameteriv(target, attachment, pname, params) {
 var result = GLctx.getFramebufferAttachmentParameter(target, attachment, pname);
 if (result instanceof WebGLRenderbuffer || result instanceof WebGLTexture) {
  result = result.name | 0;
 }
 HEAP32[params >> 2] = result;
}

Module["_glGetFramebufferAttachmentParameteriv"] = _glGetFramebufferAttachmentParameteriv;

function _glIsFramebuffer(framebuffer) {
 var fb = GL.framebuffers[framebuffer];
 if (!fb) return 0;
 return GLctx.isFramebuffer(fb);
}

Module["_glIsFramebuffer"] = _glIsFramebuffer;

function _glGenVertexArrays(n, arrays) {
 __glGenObject(n, arrays, "createVertexArray", GL.vaos);
}

Module["_glGenVertexArrays"] = _glGenVertexArrays;

function _glDeleteVertexArrays(n, vaos) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[vaos + i * 4 >> 2];
  GLctx["deleteVertexArray"](GL.vaos[id]);
  GL.vaos[id] = null;
 }
}

Module["_glDeleteVertexArrays"] = _glDeleteVertexArrays;

function _glBindVertexArray(vao) {
 GLctx["bindVertexArray"](GL.vaos[vao]);
}

Module["_glBindVertexArray"] = _glBindVertexArray;

function _glIsVertexArray(array) {
 var vao = GL.vaos[array];
 if (!vao) return 0;
 return GLctx["isVertexArray"](vao);
}

Module["_glIsVertexArray"] = _glIsVertexArray;

function _glVertexPointer() {
 throw "Legacy GL function (glVertexPointer) called. If you want legacy GL emulation, you need to compile with -s LEGACY_GL_EMULATION=1 to enable legacy GL emulation.";
}

Module["_glVertexPointer"] = _glVertexPointer;

function _glMatrixMode() {
 throw "Legacy GL function (glMatrixMode) called. If you want legacy GL emulation, you need to compile with -s LEGACY_GL_EMULATION=1 to enable legacy GL emulation.";
}

Module["_glMatrixMode"] = _glMatrixMode;

function _glBegin() {
 throw "Legacy GL function (glBegin) called. If you want legacy GL emulation, you need to compile with -s LEGACY_GL_EMULATION=1 to enable legacy GL emulation.";
}

Module["_glBegin"] = _glBegin;

function _glLoadIdentity() {
 throw "Legacy GL function (glLoadIdentity) called. If you want legacy GL emulation, you need to compile with -s LEGACY_GL_EMULATION=1 to enable legacy GL emulation.";
}

Module["_glLoadIdentity"] = _glLoadIdentity;

function _glGenVertexArraysOES(n, arrays) {
 __glGenObject(n, arrays, "createVertexArray", GL.vaos);
}

Module["_glGenVertexArraysOES"] = _glGenVertexArraysOES;

function _glDeleteVertexArraysOES(n, vaos) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[vaos + i * 4 >> 2];
  GLctx["deleteVertexArray"](GL.vaos[id]);
  GL.vaos[id] = null;
 }
}

Module["_glDeleteVertexArraysOES"] = _glDeleteVertexArraysOES;

function _glBindVertexArrayOES(vao) {
 GLctx["bindVertexArray"](GL.vaos[vao]);
}

Module["_glBindVertexArrayOES"] = _glBindVertexArrayOES;

function _glIsVertexArrayOES(array) {
 var vao = GL.vaos[array];
 if (!vao) return 0;
 return GLctx["isVertexArray"](vao);
}

Module["_glIsVertexArrayOES"] = _glIsVertexArrayOES;

function _gluPerspective(fov, aspect, near, far) {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrix[GLImmediate.currentMatrix] = GLImmediate.matrixLib.mat4.perspective(fov, aspect, near, far, GLImmediate.matrix[GLImmediate.currentMatrix]);
}

Module["_gluPerspective"] = _gluPerspective;

function _gluLookAt(ex, ey, ez, cx, cy, cz, ux, uy, uz) {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrixLib.mat4.lookAt(GLImmediate.matrix[GLImmediate.currentMatrix], [ ex, ey, ez ], [ cx, cy, cz ], [ ux, uy, uz ]);
}

Module["_gluLookAt"] = _gluLookAt;

function _gluProject(objX, objY, objZ, model, proj, view, winX, winY, winZ) {
 var inVec = new Float32Array(4);
 var outVec = new Float32Array(4);
 GLImmediate.matrixLib.mat4.multiplyVec4(HEAPF64.subarray(model >> 3, model + 128 >> 3), [ objX, objY, objZ, 1 ], outVec);
 GLImmediate.matrixLib.mat4.multiplyVec4(HEAPF64.subarray(proj >> 3, proj + 128 >> 3), outVec, inVec);
 if (inVec[3] == 0) {
  return 0;
 }
 inVec[0] /= inVec[3];
 inVec[1] /= inVec[3];
 inVec[2] /= inVec[3];
 inVec[0] = inVec[0] * .5 + .5;
 inVec[1] = inVec[1] * .5 + .5;
 inVec[2] = inVec[2] * .5 + .5;
 inVec[0] = inVec[0] * HEAP32[view + 8 >> 2] + HEAP32[view >> 2];
 inVec[1] = inVec[1] * HEAP32[view + 12 >> 2] + HEAP32[view + 4 >> 2];
 HEAPF64[winX >> 3] = inVec[0];
 HEAPF64[winY >> 3] = inVec[1];
 HEAPF64[winZ >> 3] = inVec[2];
 return 1;
}

Module["_gluProject"] = _gluProject;

function _gluUnProject(winX, winY, winZ, model, proj, view, objX, objY, objZ) {
 var result = GLImmediate.matrixLib.mat4.unproject([ winX, winY, winZ ], HEAPF64.subarray(model >> 3, model + 128 >> 3), HEAPF64.subarray(proj >> 3, proj + 128 >> 3), HEAP32.subarray(view >> 2, view + 16 >> 2));
 if (result === null) {
  return 0;
 }
 HEAPF64[objX >> 3] = result[0];
 HEAPF64[objY >> 3] = result[1];
 HEAPF64[objZ >> 3] = result[2];
 return 1;
}

Module["_gluUnProject"] = _gluUnProject;

function _glOrtho() {
 if (!Module["_glOrtho"]) abort("external function 'glOrtho' is missing. perhaps a side module was not linked in? if this function was expected to arrive from a system library, try to build the MAIN_MODULE with EMCC_FORCE_STDLIBS=1 in the environment");
 return Module["_glOrtho"].apply(null, arguments);
}

function _gluOrtho2D(left, right, bottom, top) {
 _glOrtho(left, right, bottom, top, -1, 1);
}

Module["_gluOrtho2D"] = _gluOrtho2D;

function _glVertexAttribPointer(index, size, type, normalized, stride, ptr) {
 GLctx.vertexAttribPointer(index, size, type, !!normalized, stride, ptr);
}

Module["_glVertexAttribPointer"] = _glVertexAttribPointer;

function _glEnableVertexAttribArray(index) {
 GLctx.enableVertexAttribArray(index);
}

Module["_glEnableVertexAttribArray"] = _glEnableVertexAttribArray;

function _glDisableVertexAttribArray(index) {
 GLctx.disableVertexAttribArray(index);
}

Module["_glDisableVertexAttribArray"] = _glDisableVertexAttribArray;

function _glDrawArrays(mode, first, count) {
 GLctx.drawArrays(mode, first, count);
}

Module["_glDrawArrays"] = _glDrawArrays;

function _glDrawElements(mode, count, type, indices) {
 GLctx.drawElements(mode, count, type, indices);
}

Module["_glDrawElements"] = _glDrawElements;

function _glShaderBinary() {
 GL.recordError(1280);
}

Module["_glShaderBinary"] = _glShaderBinary;

function _glReleaseShaderCompiler() {}

Module["_glReleaseShaderCompiler"] = _glReleaseShaderCompiler;

function _glGetError() {
 var error = GLctx.getError() || GL.lastError;
 GL.lastError = 0;
 return error;
}

Module["_glGetError"] = _glGetError;

function _glVertexAttribDivisor(index, divisor) {
 GLctx["vertexAttribDivisor"](index, divisor);
}

Module["_glVertexAttribDivisor"] = _glVertexAttribDivisor;

function _glDrawArraysInstanced(mode, first, count, primcount) {
 GLctx["drawArraysInstanced"](mode, first, count, primcount);
}

Module["_glDrawArraysInstanced"] = _glDrawArraysInstanced;

function _glDrawElementsInstanced(mode, count, type, indices, primcount) {
 GLctx["drawElementsInstanced"](mode, count, type, indices, primcount);
}

Module["_glDrawElementsInstanced"] = _glDrawElementsInstanced;

function _glVertexAttribDivisorNV(index, divisor) {
 GLctx["vertexAttribDivisor"](index, divisor);
}

Module["_glVertexAttribDivisorNV"] = _glVertexAttribDivisorNV;

function _glDrawArraysInstancedNV(mode, first, count, primcount) {
 GLctx["drawArraysInstanced"](mode, first, count, primcount);
}

Module["_glDrawArraysInstancedNV"] = _glDrawArraysInstancedNV;

function _glDrawElementsInstancedNV(mode, count, type, indices, primcount) {
 GLctx["drawElementsInstanced"](mode, count, type, indices, primcount);
}

Module["_glDrawElementsInstancedNV"] = _glDrawElementsInstancedNV;

function _glVertexAttribDivisorEXT(index, divisor) {
 GLctx["vertexAttribDivisor"](index, divisor);
}

Module["_glVertexAttribDivisorEXT"] = _glVertexAttribDivisorEXT;

function _glDrawArraysInstancedEXT(mode, first, count, primcount) {
 GLctx["drawArraysInstanced"](mode, first, count, primcount);
}

Module["_glDrawArraysInstancedEXT"] = _glDrawArraysInstancedEXT;

function _glDrawElementsInstancedEXT(mode, count, type, indices, primcount) {
 GLctx["drawElementsInstanced"](mode, count, type, indices, primcount);
}

Module["_glDrawElementsInstancedEXT"] = _glDrawElementsInstancedEXT;

function _glVertexAttribDivisorARB(index, divisor) {
 GLctx["vertexAttribDivisor"](index, divisor);
}

Module["_glVertexAttribDivisorARB"] = _glVertexAttribDivisorARB;

function _glDrawArraysInstancedARB(mode, first, count, primcount) {
 GLctx["drawArraysInstanced"](mode, first, count, primcount);
}

Module["_glDrawArraysInstancedARB"] = _glDrawArraysInstancedARB;

function _glDrawElementsInstancedARB(mode, count, type, indices, primcount) {
 GLctx["drawElementsInstanced"](mode, count, type, indices, primcount);
}

Module["_glDrawElementsInstancedARB"] = _glDrawElementsInstancedARB;

function _glVertexAttribDivisorANGLE(index, divisor) {
 GLctx["vertexAttribDivisor"](index, divisor);
}

Module["_glVertexAttribDivisorANGLE"] = _glVertexAttribDivisorANGLE;

function _glDrawArraysInstancedANGLE(mode, first, count, primcount) {
 GLctx["drawArraysInstanced"](mode, first, count, primcount);
}

Module["_glDrawArraysInstancedANGLE"] = _glDrawArraysInstancedANGLE;

function _glDrawElementsInstancedANGLE(mode, count, type, indices, primcount) {
 GLctx["drawElementsInstanced"](mode, count, type, indices, primcount);
}

Module["_glDrawElementsInstancedANGLE"] = _glDrawElementsInstancedANGLE;

function _glDrawBuffers(n, bufs) {
 var bufArray = __tempFixedLengthArray[n];
 for (var i = 0; i < n; i++) {
  bufArray[i] = HEAP32[bufs + i * 4 >> 2];
 }
 GLctx["drawBuffers"](bufArray);
}

Module["_glDrawBuffers"] = _glDrawBuffers;

function _glDrawBuffersEXT(n, bufs) {
 var bufArray = __tempFixedLengthArray[n];
 for (var i = 0; i < n; i++) {
  bufArray[i] = HEAP32[bufs + i * 4 >> 2];
 }
 GLctx["drawBuffers"](bufArray);
}

Module["_glDrawBuffersEXT"] = _glDrawBuffersEXT;

function _glDrawBuffersWEBGL(n, bufs) {
 var bufArray = __tempFixedLengthArray[n];
 for (var i = 0; i < n; i++) {
  bufArray[i] = HEAP32[bufs + i * 4 >> 2];
 }
 GLctx["drawBuffers"](bufArray);
}

Module["_glDrawBuffersWEBGL"] = _glDrawBuffersWEBGL;

function _glColorMask(red, green, blue, alpha) {
 GLctx.colorMask(!!red, !!green, !!blue, !!alpha);
}

Module["_glColorMask"] = _glColorMask;

function _glDepthMask(flag) {
 GLctx.depthMask(!!flag);
}

Module["_glDepthMask"] = _glDepthMask;

function _glSampleCoverage(value, invert) {
 GLctx.sampleCoverage(value, !!invert);
}

Module["_glSampleCoverage"] = _glSampleCoverage;

function _glFinish() {
 GLctx["finish"]();
}

Module["_glFinish"] = _glFinish;

function _glFlush() {
 GLctx["flush"]();
}

Module["_glFlush"] = _glFlush;

function _glClearDepth(x0) {
 GLctx["clearDepth"](x0);
}

Module["_glClearDepth"] = _glClearDepth;

function _glClearDepthf(x0) {
 GLctx["clearDepth"](x0);
}

Module["_glClearDepthf"] = _glClearDepthf;

function _glDepthFunc(x0) {
 GLctx["depthFunc"](x0);
}

Module["_glDepthFunc"] = _glDepthFunc;

function _glEnable(x0) {
 GLctx["enable"](x0);
}

Module["_glEnable"] = _glEnable;

function _glDisable(x0) {
 GLctx["disable"](x0);
}

Module["_glDisable"] = _glDisable;

function _glFrontFace(x0) {
 GLctx["frontFace"](x0);
}

Module["_glFrontFace"] = _glFrontFace;

function _glCullFace(x0) {
 GLctx["cullFace"](x0);
}

Module["_glCullFace"] = _glCullFace;

function _glClear(x0) {
 GLctx["clear"](x0);
}

Module["_glClear"] = _glClear;

function _glLineWidth(x0) {
 GLctx["lineWidth"](x0);
}

Module["_glLineWidth"] = _glLineWidth;

function _glClearStencil(x0) {
 GLctx["clearStencil"](x0);
}

Module["_glClearStencil"] = _glClearStencil;

function _glStencilMask(x0) {
 GLctx["stencilMask"](x0);
}

Module["_glStencilMask"] = _glStencilMask;

function _glCheckFramebufferStatus(x0) {
 return GLctx["checkFramebufferStatus"](x0);
}

Module["_glCheckFramebufferStatus"] = _glCheckFramebufferStatus;

function _glGenerateMipmap(x0) {
 GLctx["generateMipmap"](x0);
}

Module["_glGenerateMipmap"] = _glGenerateMipmap;

function _glActiveTexture(x0) {
 GLctx["activeTexture"](x0);
}

Module["_glActiveTexture"] = _glActiveTexture;

function _glBlendEquation(x0) {
 GLctx["blendEquation"](x0);
}

Module["_glBlendEquation"] = _glBlendEquation;

function _glIsEnabled(x0) {
 return GLctx["isEnabled"](x0);
}

Module["_glIsEnabled"] = _glIsEnabled;

function _glBlendFunc(x0, x1) {
 GLctx["blendFunc"](x0, x1);
}

Module["_glBlendFunc"] = _glBlendFunc;

function _glBlendEquationSeparate(x0, x1) {
 GLctx["blendEquationSeparate"](x0, x1);
}

Module["_glBlendEquationSeparate"] = _glBlendEquationSeparate;

function _glDepthRange(x0, x1) {
 GLctx["depthRange"](x0, x1);
}

Module["_glDepthRange"] = _glDepthRange;

function _glDepthRangef(x0, x1) {
 GLctx["depthRange"](x0, x1);
}

Module["_glDepthRangef"] = _glDepthRangef;

function _glStencilMaskSeparate(x0, x1) {
 GLctx["stencilMaskSeparate"](x0, x1);
}

Module["_glStencilMaskSeparate"] = _glStencilMaskSeparate;

function _glHint(x0, x1) {
 GLctx["hint"](x0, x1);
}

Module["_glHint"] = _glHint;

function _glPolygonOffset(x0, x1) {
 GLctx["polygonOffset"](x0, x1);
}

Module["_glPolygonOffset"] = _glPolygonOffset;

function _glVertexAttrib1f(x0, x1) {
 GLctx["vertexAttrib1f"](x0, x1);
}

Module["_glVertexAttrib1f"] = _glVertexAttrib1f;

function _glTexParameteri(x0, x1, x2) {
 GLctx["texParameteri"](x0, x1, x2);
}

Module["_glTexParameteri"] = _glTexParameteri;

function _glTexParameterf(x0, x1, x2) {
 GLctx["texParameterf"](x0, x1, x2);
}

Module["_glTexParameterf"] = _glTexParameterf;

function _glVertexAttrib2f(x0, x1, x2) {
 GLctx["vertexAttrib2f"](x0, x1, x2);
}

Module["_glVertexAttrib2f"] = _glVertexAttrib2f;

function _glStencilFunc(x0, x1, x2) {
 GLctx["stencilFunc"](x0, x1, x2);
}

Module["_glStencilFunc"] = _glStencilFunc;

function _glStencilOp(x0, x1, x2) {
 GLctx["stencilOp"](x0, x1, x2);
}

Module["_glStencilOp"] = _glStencilOp;

function _glViewport(x0, x1, x2, x3) {
 GLctx["viewport"](x0, x1, x2, x3);
}

Module["_glViewport"] = _glViewport;

function _glClearColor(x0, x1, x2, x3) {
 GLctx["clearColor"](x0, x1, x2, x3);
}

Module["_glClearColor"] = _glClearColor;

function _glScissor(x0, x1, x2, x3) {
 GLctx["scissor"](x0, x1, x2, x3);
}

Module["_glScissor"] = _glScissor;

function _glVertexAttrib3f(x0, x1, x2, x3) {
 GLctx["vertexAttrib3f"](x0, x1, x2, x3);
}

Module["_glVertexAttrib3f"] = _glVertexAttrib3f;

function _glRenderbufferStorage(x0, x1, x2, x3) {
 GLctx["renderbufferStorage"](x0, x1, x2, x3);
}

Module["_glRenderbufferStorage"] = _glRenderbufferStorage;

function _glBlendFuncSeparate(x0, x1, x2, x3) {
 GLctx["blendFuncSeparate"](x0, x1, x2, x3);
}

Module["_glBlendFuncSeparate"] = _glBlendFuncSeparate;

function _glBlendColor(x0, x1, x2, x3) {
 GLctx["blendColor"](x0, x1, x2, x3);
}

Module["_glBlendColor"] = _glBlendColor;

function _glStencilFuncSeparate(x0, x1, x2, x3) {
 GLctx["stencilFuncSeparate"](x0, x1, x2, x3);
}

Module["_glStencilFuncSeparate"] = _glStencilFuncSeparate;

function _glStencilOpSeparate(x0, x1, x2, x3) {
 GLctx["stencilOpSeparate"](x0, x1, x2, x3);
}

Module["_glStencilOpSeparate"] = _glStencilOpSeparate;

function _glVertexAttrib4f(x0, x1, x2, x3, x4) {
 GLctx["vertexAttrib4f"](x0, x1, x2, x3, x4);
}

Module["_glVertexAttrib4f"] = _glVertexAttrib4f;

function _glCopyTexImage2D(x0, x1, x2, x3, x4, x5, x6, x7) {
 GLctx["copyTexImage2D"](x0, x1, x2, x3, x4, x5, x6, x7);
}

Module["_glCopyTexImage2D"] = _glCopyTexImage2D;

function _glCopyTexSubImage2D(x0, x1, x2, x3, x4, x5, x6, x7) {
 GLctx["copyTexSubImage2D"](x0, x1, x2, x3, x4, x5, x6, x7);
}

Module["_glCopyTexSubImage2D"] = _glCopyTexSubImage2D;

function _emscripten_glPixelStorei(pname, param) {
 if (pname == 3317) {
  GL.unpackAlignment = param;
 }
 GLctx.pixelStorei(pname, param);
}

Module["_emscripten_glPixelStorei"] = _emscripten_glPixelStorei;

function _emscripten_glGetString(name_) {
 if (GL.stringCache[name_]) return GL.stringCache[name_];
 var ret;
 switch (name_) {
 case 7939:
  var exts = GLctx.getSupportedExtensions() || [];
  exts = exts.concat(exts.map(function(e) {
   return "GL_" + e;
  }));
  ret = stringToNewUTF8(exts.join(" "));
  break;

 case 7936:
 case 7937:
 case 37445:
 case 37446:
  var s = GLctx.getParameter(name_);
  if (!s) {
   GL.recordError(1280);
  }
  ret = stringToNewUTF8(s);
  break;

 case 7938:
  var glVersion = GLctx.getParameter(7938);
  {
   glVersion = "OpenGL ES 2.0 (" + glVersion + ")";
  }
  ret = stringToNewUTF8(glVersion);
  break;

 case 35724:
  var glslVersion = GLctx.getParameter(35724);
  var ver_re = /^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/;
  var ver_num = glslVersion.match(ver_re);
  if (ver_num !== null) {
   if (ver_num[1].length == 3) ver_num[1] = ver_num[1] + "0";
   glslVersion = "OpenGL ES GLSL ES " + ver_num[1] + " (" + glslVersion + ")";
  }
  ret = stringToNewUTF8(glslVersion);
  break;

 default:
  GL.recordError(1280);
  return 0;
 }
 GL.stringCache[name_] = ret;
 return ret;
}

Module["_emscripten_glGetString"] = _emscripten_glGetString;

function _emscripten_glGetIntegerv(name_, p) {
 emscriptenWebGLGet(name_, p, 0);
}

Module["_emscripten_glGetIntegerv"] = _emscripten_glGetIntegerv;

function _emscripten_glGetFloatv(name_, p) {
 emscriptenWebGLGet(name_, p, 2);
}

Module["_emscripten_glGetFloatv"] = _emscripten_glGetFloatv;

function _emscripten_glGetBooleanv(name_, p) {
 emscriptenWebGLGet(name_, p, 4);
}

Module["_emscripten_glGetBooleanv"] = _emscripten_glGetBooleanv;

function _emscripten_glDeleteTextures(n, textures) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[textures + i * 4 >> 2];
  var texture = GL.textures[id];
  if (!texture) continue;
  GLctx.deleteTexture(texture);
  texture.name = 0;
  GL.textures[id] = null;
 }
}

Module["_emscripten_glDeleteTextures"] = _emscripten_glDeleteTextures;

function _emscripten_glCompressedTexImage2D(target, level, internalFormat, width, height, border, imageSize, data) {
 GLctx["compressedTexImage2D"](target, level, internalFormat, width, height, border, data ? HEAPU8.subarray(data, data + imageSize) : null);
}

Module["_emscripten_glCompressedTexImage2D"] = _emscripten_glCompressedTexImage2D;

function _emscripten_glCompressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, imageSize, data) {
 GLctx["compressedTexSubImage2D"](target, level, xoffset, yoffset, width, height, format, data ? HEAPU8.subarray(data, data + imageSize) : null);
}

Module["_emscripten_glCompressedTexSubImage2D"] = _emscripten_glCompressedTexSubImage2D;

function _emscripten_glTexImage2D(target, level, internalFormat, width, height, border, format, type, pixels) {
 GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixels ? emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) : null);
}

Module["_emscripten_glTexImage2D"] = _emscripten_glTexImage2D;

function _emscripten_glTexSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels) {
 var pixelData = null;
 if (pixels) pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, 0);
 GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixelData);
}

Module["_emscripten_glTexSubImage2D"] = _emscripten_glTexSubImage2D;

function _emscripten_glReadPixels(x, y, width, height, format, type, pixels) {
 var pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, format);
 if (!pixelData) {
  GL.recordError(1280);
  return;
 }
 GLctx.readPixels(x, y, width, height, format, type, pixelData);
}

Module["_emscripten_glReadPixels"] = _emscripten_glReadPixels;

function _emscripten_glBindTexture(target, texture) {
 GLctx.bindTexture(target, GL.textures[texture]);
}

Module["_emscripten_glBindTexture"] = _emscripten_glBindTexture;

function _emscripten_glGetTexParameterfv(target, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 HEAPF32[params >> 2] = GLctx.getTexParameter(target, pname);
}

Module["_emscripten_glGetTexParameterfv"] = _emscripten_glGetTexParameterfv;

function _emscripten_glGetTexParameteriv(target, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 HEAP32[params >> 2] = GLctx.getTexParameter(target, pname);
}

Module["_emscripten_glGetTexParameteriv"] = _emscripten_glGetTexParameteriv;

function _emscripten_glTexParameterfv(target, pname, params) {
 var param = HEAPF32[params >> 2];
 GLctx.texParameterf(target, pname, param);
}

Module["_emscripten_glTexParameterfv"] = _emscripten_glTexParameterfv;

function _emscripten_glTexParameteriv(target, pname, params) {
 var param = HEAP32[params >> 2];
 GLctx.texParameteri(target, pname, param);
}

Module["_emscripten_glTexParameteriv"] = _emscripten_glTexParameteriv;

function _emscripten_glIsTexture(id) {
 var texture = GL.textures[id];
 if (!texture) return 0;
 return GLctx.isTexture(texture);
}

Module["_emscripten_glIsTexture"] = _emscripten_glIsTexture;

function _emscripten_glGenBuffers(n, buffers) {
 __glGenObject(n, buffers, "createBuffer", GL.buffers);
}

Module["_emscripten_glGenBuffers"] = _emscripten_glGenBuffers;

function _emscripten_glGenTextures(n, textures) {
 __glGenObject(n, textures, "createTexture", GL.textures);
}

Module["_emscripten_glGenTextures"] = _emscripten_glGenTextures;

function _emscripten_glDeleteBuffers(n, buffers) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[buffers + i * 4 >> 2];
  var buffer = GL.buffers[id];
  if (!buffer) continue;
  GLctx.deleteBuffer(buffer);
  buffer.name = 0;
  GL.buffers[id] = null;
  if (id == GL.currArrayBuffer) GL.currArrayBuffer = 0;
  if (id == GL.currElementArrayBuffer) GL.currElementArrayBuffer = 0;
 }
}

Module["_emscripten_glDeleteBuffers"] = _emscripten_glDeleteBuffers;

function _emscripten_glGetBufferParameteriv(target, value, data) {
 if (!data) {
  GL.recordError(1281);
  return;
 }
 HEAP32[data >> 2] = GLctx.getBufferParameter(target, value);
}

Module["_emscripten_glGetBufferParameteriv"] = _emscripten_glGetBufferParameteriv;

function _emscripten_glBufferData(target, size, data, usage) {
 GLctx.bufferData(target, data ? HEAPU8.subarray(data, data + size) : size, usage);
}

Module["_emscripten_glBufferData"] = _emscripten_glBufferData;

function _emscripten_glBufferSubData(target, offset, size, data) {
 GLctx.bufferSubData(target, offset, HEAPU8.subarray(data, data + size));
}

Module["_emscripten_glBufferSubData"] = _emscripten_glBufferSubData;

function _emscripten_glGenQueriesEXT(n, ids) {
 for (var i = 0; i < n; i++) {
  var query = GLctx.disjointTimerQueryExt["createQueryEXT"]();
  if (!query) {
   GL.recordError(1282);
   while (i < n) HEAP32[ids + i++ * 4 >> 2] = 0;
   return;
  }
  var id = GL.getNewId(GL.timerQueriesEXT);
  query.name = id;
  GL.timerQueriesEXT[id] = query;
  HEAP32[ids + i * 4 >> 2] = id;
 }
}

Module["_emscripten_glGenQueriesEXT"] = _emscripten_glGenQueriesEXT;

function _emscripten_glDeleteQueriesEXT(n, ids) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[ids + i * 4 >> 2];
  var query = GL.timerQueriesEXT[id];
  if (!query) continue;
  GLctx.disjointTimerQueryExt["deleteQueryEXT"](query);
  GL.timerQueriesEXT[id] = null;
 }
}

Module["_emscripten_glDeleteQueriesEXT"] = _emscripten_glDeleteQueriesEXT;

function _emscripten_glIsQueryEXT(id) {
 var query = GL.timerQueriesEXT[id];
 if (!query) return 0;
 return GLctx.disjointTimerQueryExt["isQueryEXT"](query);
}

Module["_emscripten_glIsQueryEXT"] = _emscripten_glIsQueryEXT;

function _emscripten_glBeginQueryEXT(target, id) {
 GLctx.disjointTimerQueryExt["beginQueryEXT"](target, GL.timerQueriesEXT[id]);
}

Module["_emscripten_glBeginQueryEXT"] = _emscripten_glBeginQueryEXT;

function _emscripten_glEndQueryEXT(target) {
 GLctx.disjointTimerQueryExt["endQueryEXT"](target);
}

Module["_emscripten_glEndQueryEXT"] = _emscripten_glEndQueryEXT;

function _emscripten_glQueryCounterEXT(id, target) {
 GLctx.disjointTimerQueryExt["queryCounterEXT"](GL.timerQueriesEXT[id], target);
}

Module["_emscripten_glQueryCounterEXT"] = _emscripten_glQueryCounterEXT;

function _emscripten_glGetQueryivEXT(target, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 HEAP32[params >> 2] = GLctx.disjointTimerQueryExt["getQueryEXT"](target, pname);
}

Module["_emscripten_glGetQueryivEXT"] = _emscripten_glGetQueryivEXT;

function _emscripten_glGetQueryObjectivEXT(id, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 var query = GL.timerQueriesEXT[id];
 var param = GLctx.disjointTimerQueryExt["getQueryObjectEXT"](query, pname);
 var ret;
 if (typeof param == "boolean") {
  ret = param ? 1 : 0;
 } else {
  ret = param;
 }
 HEAP32[params >> 2] = ret;
}

Module["_emscripten_glGetQueryObjectivEXT"] = _emscripten_glGetQueryObjectivEXT;

function _emscripten_glGetQueryObjectuivEXT(id, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 var query = GL.timerQueriesEXT[id];
 var param = GLctx.disjointTimerQueryExt["getQueryObjectEXT"](query, pname);
 var ret;
 if (typeof param == "boolean") {
  ret = param ? 1 : 0;
 } else {
  ret = param;
 }
 HEAP32[params >> 2] = ret;
}

Module["_emscripten_glGetQueryObjectuivEXT"] = _emscripten_glGetQueryObjectuivEXT;

function _emscripten_glGetQueryObjecti64vEXT(id, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 var query = GL.timerQueriesEXT[id];
 var param = GLctx.disjointTimerQueryExt["getQueryObjectEXT"](query, pname);
 var ret;
 if (typeof param == "boolean") {
  ret = param ? 1 : 0;
 } else {
  ret = param;
 }
 tempI64 = [ ret >>> 0, (tempDouble = ret, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
 HEAP32[params >> 2] = tempI64[0], HEAP32[params + 4 >> 2] = tempI64[1];
}

Module["_emscripten_glGetQueryObjecti64vEXT"] = _emscripten_glGetQueryObjecti64vEXT;

function _emscripten_glGetQueryObjectui64vEXT(id, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 var query = GL.timerQueriesEXT[id];
 var param = GLctx.disjointTimerQueryExt["getQueryObjectEXT"](query, pname);
 var ret;
 if (typeof param == "boolean") {
  ret = param ? 1 : 0;
 } else {
  ret = param;
 }
 tempI64 = [ ret >>> 0, (tempDouble = ret, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
 HEAP32[params >> 2] = tempI64[0], HEAP32[params + 4 >> 2] = tempI64[1];
}

Module["_emscripten_glGetQueryObjectui64vEXT"] = _emscripten_glGetQueryObjectui64vEXT;

function _emscripten_glIsBuffer(buffer) {
 var b = GL.buffers[buffer];
 if (!b) return 0;
 return GLctx.isBuffer(b);
}

Module["_emscripten_glIsBuffer"] = _emscripten_glIsBuffer;

function _emscripten_glGenRenderbuffers(n, renderbuffers) {
 __glGenObject(n, renderbuffers, "createRenderbuffer", GL.renderbuffers);
}

Module["_emscripten_glGenRenderbuffers"] = _emscripten_glGenRenderbuffers;

function _emscripten_glDeleteRenderbuffers(n, renderbuffers) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[renderbuffers + i * 4 >> 2];
  var renderbuffer = GL.renderbuffers[id];
  if (!renderbuffer) continue;
  GLctx.deleteRenderbuffer(renderbuffer);
  renderbuffer.name = 0;
  GL.renderbuffers[id] = null;
 }
}

Module["_emscripten_glDeleteRenderbuffers"] = _emscripten_glDeleteRenderbuffers;

function _emscripten_glBindRenderbuffer(target, renderbuffer) {
 GLctx.bindRenderbuffer(target, GL.renderbuffers[renderbuffer]);
}

Module["_emscripten_glBindRenderbuffer"] = _emscripten_glBindRenderbuffer;

function _emscripten_glGetRenderbufferParameteriv(target, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 HEAP32[params >> 2] = GLctx.getRenderbufferParameter(target, pname);
}

Module["_emscripten_glGetRenderbufferParameteriv"] = _emscripten_glGetRenderbufferParameteriv;

function _emscripten_glIsRenderbuffer(renderbuffer) {
 var rb = GL.renderbuffers[renderbuffer];
 if (!rb) return 0;
 return GLctx.isRenderbuffer(rb);
}

Module["_emscripten_glIsRenderbuffer"] = _emscripten_glIsRenderbuffer;

function _emscripten_glGetUniformfv(program, location, params) {
 emscriptenWebGLGetUniform(program, location, params, 2);
}

Module["_emscripten_glGetUniformfv"] = _emscripten_glGetUniformfv;

function _emscripten_glGetUniformiv(program, location, params) {
 emscriptenWebGLGetUniform(program, location, params, 0);
}

Module["_emscripten_glGetUniformiv"] = _emscripten_glGetUniformiv;

function _emscripten_glGetUniformLocation(program, name) {
 name = UTF8ToString(name);
 var arrayIndex = 0;
 if (name[name.length - 1] == "]") {
  var leftBrace = name.lastIndexOf("[");
  arrayIndex = name[leftBrace + 1] != "]" ? parseInt(name.slice(leftBrace + 1)) : 0;
  name = name.slice(0, leftBrace);
 }
 var uniformInfo = GL.programInfos[program] && GL.programInfos[program].uniforms[name];
 if (uniformInfo && arrayIndex >= 0 && arrayIndex < uniformInfo[0]) {
  return uniformInfo[1] + arrayIndex;
 } else {
  return -1;
 }
}

Module["_emscripten_glGetUniformLocation"] = _emscripten_glGetUniformLocation;

function _emscripten_glGetVertexAttribfv(index, pname, params) {
 emscriptenWebGLGetVertexAttrib(index, pname, params, 2);
}

Module["_emscripten_glGetVertexAttribfv"] = _emscripten_glGetVertexAttribfv;

function _emscripten_glGetVertexAttribiv(index, pname, params) {
 emscriptenWebGLGetVertexAttrib(index, pname, params, 5);
}

Module["_emscripten_glGetVertexAttribiv"] = _emscripten_glGetVertexAttribiv;

function _emscripten_glGetVertexAttribPointerv(index, pname, pointer) {
 if (!pointer) {
  GL.recordError(1281);
  return;
 }
 HEAP32[pointer >> 2] = GLctx.getVertexAttribOffset(index, pname);
}

Module["_emscripten_glGetVertexAttribPointerv"] = _emscripten_glGetVertexAttribPointerv;

function _emscripten_glGetActiveUniform(program, index, bufSize, length, size, type, name) {
 program = GL.programs[program];
 var info = GLctx.getActiveUniform(program, index);
 if (!info) return;
 var numBytesWrittenExclNull = bufSize > 0 && name ? stringToUTF8(info.name, name, bufSize) : 0;
 if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
 if (size) HEAP32[size >> 2] = info.size;
 if (type) HEAP32[type >> 2] = info.type;
}

Module["_emscripten_glGetActiveUniform"] = _emscripten_glGetActiveUniform;

function _emscripten_glUniform1f(location, v0) {
 GLctx.uniform1f(GL.uniforms[location], v0);
}

Module["_emscripten_glUniform1f"] = _emscripten_glUniform1f;

function _emscripten_glUniform2f(location, v0, v1) {
 GLctx.uniform2f(GL.uniforms[location], v0, v1);
}

Module["_emscripten_glUniform2f"] = _emscripten_glUniform2f;

function _emscripten_glUniform3f(location, v0, v1, v2) {
 GLctx.uniform3f(GL.uniforms[location], v0, v1, v2);
}

Module["_emscripten_glUniform3f"] = _emscripten_glUniform3f;

function _emscripten_glUniform4f(location, v0, v1, v2, v3) {
 GLctx.uniform4f(GL.uniforms[location], v0, v1, v2, v3);
}

Module["_emscripten_glUniform4f"] = _emscripten_glUniform4f;

function _emscripten_glUniform1i(location, v0) {
 GLctx.uniform1i(GL.uniforms[location], v0);
}

Module["_emscripten_glUniform1i"] = _emscripten_glUniform1i;

function _emscripten_glUniform2i(location, v0, v1) {
 GLctx.uniform2i(GL.uniforms[location], v0, v1);
}

Module["_emscripten_glUniform2i"] = _emscripten_glUniform2i;

function _emscripten_glUniform3i(location, v0, v1, v2) {
 GLctx.uniform3i(GL.uniforms[location], v0, v1, v2);
}

Module["_emscripten_glUniform3i"] = _emscripten_glUniform3i;

function _emscripten_glUniform4i(location, v0, v1, v2, v3) {
 GLctx.uniform4i(GL.uniforms[location], v0, v1, v2, v3);
}

Module["_emscripten_glUniform4i"] = _emscripten_glUniform4i;

function _emscripten_glUniform1iv(location, count, value) {
 if (count <= GL.MINI_TEMP_BUFFER_SIZE) {
  var view = GL.miniTempBufferIntViews[count - 1];
  for (var i = 0; i < count; ++i) {
   view[i] = HEAP32[value + 4 * i >> 2];
  }
 } else {
  var view = HEAP32.subarray(value >> 2, value + count * 4 >> 2);
 }
 GLctx.uniform1iv(GL.uniforms[location], view);
}

Module["_emscripten_glUniform1iv"] = _emscripten_glUniform1iv;

function _emscripten_glUniform2iv(location, count, value) {
 if (2 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
  var view = GL.miniTempBufferIntViews[2 * count - 1];
  for (var i = 0; i < 2 * count; i += 2) {
   view[i] = HEAP32[value + 4 * i >> 2];
   view[i + 1] = HEAP32[value + (4 * i + 4) >> 2];
  }
 } else {
  var view = HEAP32.subarray(value >> 2, value + count * 8 >> 2);
 }
 GLctx.uniform2iv(GL.uniforms[location], view);
}

Module["_emscripten_glUniform2iv"] = _emscripten_glUniform2iv;

function _emscripten_glUniform3iv(location, count, value) {
 if (3 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
  var view = GL.miniTempBufferIntViews[3 * count - 1];
  for (var i = 0; i < 3 * count; i += 3) {
   view[i] = HEAP32[value + 4 * i >> 2];
   view[i + 1] = HEAP32[value + (4 * i + 4) >> 2];
   view[i + 2] = HEAP32[value + (4 * i + 8) >> 2];
  }
 } else {
  var view = HEAP32.subarray(value >> 2, value + count * 12 >> 2);
 }
 GLctx.uniform3iv(GL.uniforms[location], view);
}

Module["_emscripten_glUniform3iv"] = _emscripten_glUniform3iv;

function _emscripten_glUniform4iv(location, count, value) {
 if (4 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
  var view = GL.miniTempBufferIntViews[4 * count - 1];
  for (var i = 0; i < 4 * count; i += 4) {
   view[i] = HEAP32[value + 4 * i >> 2];
   view[i + 1] = HEAP32[value + (4 * i + 4) >> 2];
   view[i + 2] = HEAP32[value + (4 * i + 8) >> 2];
   view[i + 3] = HEAP32[value + (4 * i + 12) >> 2];
  }
 } else {
  var view = HEAP32.subarray(value >> 2, value + count * 16 >> 2);
 }
 GLctx.uniform4iv(GL.uniforms[location], view);
}

Module["_emscripten_glUniform4iv"] = _emscripten_glUniform4iv;

function _emscripten_glUniform1fv(location, count, value) {
 if (count <= GL.MINI_TEMP_BUFFER_SIZE) {
  var view = GL.miniTempBufferFloatViews[count - 1];
  for (var i = 0; i < count; ++i) {
   view[i] = HEAPF32[value + 4 * i >> 2];
  }
 } else {
  var view = HEAPF32.subarray(value >> 2, value + count * 4 >> 2);
 }
 GLctx.uniform1fv(GL.uniforms[location], view);
}

Module["_emscripten_glUniform1fv"] = _emscripten_glUniform1fv;

function _emscripten_glUniform2fv(location, count, value) {
 if (2 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
  var view = GL.miniTempBufferFloatViews[2 * count - 1];
  for (var i = 0; i < 2 * count; i += 2) {
   view[i] = HEAPF32[value + 4 * i >> 2];
   view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
  }
 } else {
  var view = HEAPF32.subarray(value >> 2, value + count * 8 >> 2);
 }
 GLctx.uniform2fv(GL.uniforms[location], view);
}

Module["_emscripten_glUniform2fv"] = _emscripten_glUniform2fv;

function _emscripten_glUniform3fv(location, count, value) {
 if (3 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
  var view = GL.miniTempBufferFloatViews[3 * count - 1];
  for (var i = 0; i < 3 * count; i += 3) {
   view[i] = HEAPF32[value + 4 * i >> 2];
   view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
   view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2];
  }
 } else {
  var view = HEAPF32.subarray(value >> 2, value + count * 12 >> 2);
 }
 GLctx.uniform3fv(GL.uniforms[location], view);
}

Module["_emscripten_glUniform3fv"] = _emscripten_glUniform3fv;

function _emscripten_glUniform4fv(location, count, value) {
 if (4 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
  var view = GL.miniTempBufferFloatViews[4 * count - 1];
  for (var i = 0; i < 4 * count; i += 4) {
   view[i] = HEAPF32[value + 4 * i >> 2];
   view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
   view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2];
   view[i + 3] = HEAPF32[value + (4 * i + 12) >> 2];
  }
 } else {
  var view = HEAPF32.subarray(value >> 2, value + count * 16 >> 2);
 }
 GLctx.uniform4fv(GL.uniforms[location], view);
}

Module["_emscripten_glUniform4fv"] = _emscripten_glUniform4fv;

function _emscripten_glUniformMatrix2fv(location, count, transpose, value) {
 if (4 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
  var view = GL.miniTempBufferFloatViews[4 * count - 1];
  for (var i = 0; i < 4 * count; i += 4) {
   view[i] = HEAPF32[value + 4 * i >> 2];
   view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
   view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2];
   view[i + 3] = HEAPF32[value + (4 * i + 12) >> 2];
  }
 } else {
  var view = HEAPF32.subarray(value >> 2, value + count * 16 >> 2);
 }
 GLctx.uniformMatrix2fv(GL.uniforms[location], !!transpose, view);
}

Module["_emscripten_glUniformMatrix2fv"] = _emscripten_glUniformMatrix2fv;

function _emscripten_glUniformMatrix3fv(location, count, transpose, value) {
 if (9 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
  var view = GL.miniTempBufferFloatViews[9 * count - 1];
  for (var i = 0; i < 9 * count; i += 9) {
   view[i] = HEAPF32[value + 4 * i >> 2];
   view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
   view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2];
   view[i + 3] = HEAPF32[value + (4 * i + 12) >> 2];
   view[i + 4] = HEAPF32[value + (4 * i + 16) >> 2];
   view[i + 5] = HEAPF32[value + (4 * i + 20) >> 2];
   view[i + 6] = HEAPF32[value + (4 * i + 24) >> 2];
   view[i + 7] = HEAPF32[value + (4 * i + 28) >> 2];
   view[i + 8] = HEAPF32[value + (4 * i + 32) >> 2];
  }
 } else {
  var view = HEAPF32.subarray(value >> 2, value + count * 36 >> 2);
 }
 GLctx.uniformMatrix3fv(GL.uniforms[location], !!transpose, view);
}

Module["_emscripten_glUniformMatrix3fv"] = _emscripten_glUniformMatrix3fv;

function _emscripten_glUniformMatrix4fv(location, count, transpose, value) {
 if (16 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
  var view = GL.miniTempBufferFloatViews[16 * count - 1];
  for (var i = 0; i < 16 * count; i += 16) {
   view[i] = HEAPF32[value + 4 * i >> 2];
   view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
   view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2];
   view[i + 3] = HEAPF32[value + (4 * i + 12) >> 2];
   view[i + 4] = HEAPF32[value + (4 * i + 16) >> 2];
   view[i + 5] = HEAPF32[value + (4 * i + 20) >> 2];
   view[i + 6] = HEAPF32[value + (4 * i + 24) >> 2];
   view[i + 7] = HEAPF32[value + (4 * i + 28) >> 2];
   view[i + 8] = HEAPF32[value + (4 * i + 32) >> 2];
   view[i + 9] = HEAPF32[value + (4 * i + 36) >> 2];
   view[i + 10] = HEAPF32[value + (4 * i + 40) >> 2];
   view[i + 11] = HEAPF32[value + (4 * i + 44) >> 2];
   view[i + 12] = HEAPF32[value + (4 * i + 48) >> 2];
   view[i + 13] = HEAPF32[value + (4 * i + 52) >> 2];
   view[i + 14] = HEAPF32[value + (4 * i + 56) >> 2];
   view[i + 15] = HEAPF32[value + (4 * i + 60) >> 2];
  }
 } else {
  var view = HEAPF32.subarray(value >> 2, value + count * 64 >> 2);
 }
 GLctx.uniformMatrix4fv(GL.uniforms[location], !!transpose, view);
}

Module["_emscripten_glUniformMatrix4fv"] = _emscripten_glUniformMatrix4fv;

function _emscripten_glBindBuffer(target, buffer) {
 GLctx.bindBuffer(target, GL.buffers[buffer]);
}

Module["_emscripten_glBindBuffer"] = _emscripten_glBindBuffer;

function _emscripten_glVertexAttrib1fv(index, v) {
 GLctx.vertexAttrib1f(index, HEAPF32[v >> 2]);
}

Module["_emscripten_glVertexAttrib1fv"] = _emscripten_glVertexAttrib1fv;

function _emscripten_glVertexAttrib2fv(index, v) {
 GLctx.vertexAttrib2f(index, HEAPF32[v >> 2], HEAPF32[v + 4 >> 2]);
}

Module["_emscripten_glVertexAttrib2fv"] = _emscripten_glVertexAttrib2fv;

function _emscripten_glVertexAttrib3fv(index, v) {
 GLctx.vertexAttrib3f(index, HEAPF32[v >> 2], HEAPF32[v + 4 >> 2], HEAPF32[v + 8 >> 2]);
}

Module["_emscripten_glVertexAttrib3fv"] = _emscripten_glVertexAttrib3fv;

function _emscripten_glVertexAttrib4fv(index, v) {
 GLctx.vertexAttrib4f(index, HEAPF32[v >> 2], HEAPF32[v + 4 >> 2], HEAPF32[v + 8 >> 2], HEAPF32[v + 12 >> 2]);
}

Module["_emscripten_glVertexAttrib4fv"] = _emscripten_glVertexAttrib4fv;

function _emscripten_glGetAttribLocation(program, name) {
 return GLctx.getAttribLocation(GL.programs[program], UTF8ToString(name));
}

Module["_emscripten_glGetAttribLocation"] = _emscripten_glGetAttribLocation;

function _emscripten_glGetActiveAttrib(program, index, bufSize, length, size, type, name) {
 program = GL.programs[program];
 var info = GLctx.getActiveAttrib(program, index);
 if (!info) return;
 var numBytesWrittenExclNull = bufSize > 0 && name ? stringToUTF8(info.name, name, bufSize) : 0;
 if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
 if (size) HEAP32[size >> 2] = info.size;
 if (type) HEAP32[type >> 2] = info.type;
}

Module["_emscripten_glGetActiveAttrib"] = _emscripten_glGetActiveAttrib;

function _emscripten_glCreateShader(shaderType) {
 var id = GL.getNewId(GL.shaders);
 GL.shaders[id] = GLctx.createShader(shaderType);
 return id;
}

Module["_emscripten_glCreateShader"] = _emscripten_glCreateShader;

function _emscripten_glDeleteShader(id) {
 if (!id) return;
 var shader = GL.shaders[id];
 if (!shader) {
  GL.recordError(1281);
  return;
 }
 GLctx.deleteShader(shader);
 GL.shaders[id] = null;
}

Module["_emscripten_glDeleteShader"] = _emscripten_glDeleteShader;

function _emscripten_glGetAttachedShaders(program, maxCount, count, shaders) {
 var result = GLctx.getAttachedShaders(GL.programs[program]);
 var len = result.length;
 if (len > maxCount) {
  len = maxCount;
 }
 HEAP32[count >> 2] = len;
 for (var i = 0; i < len; ++i) {
  var id = GL.shaders.indexOf(result[i]);
  HEAP32[shaders + i * 4 >> 2] = id;
 }
}

Module["_emscripten_glGetAttachedShaders"] = _emscripten_glGetAttachedShaders;

function _emscripten_glShaderSource(shader, count, string, length) {
 var source = GL.getSource(shader, count, string, length);
 GLctx.shaderSource(GL.shaders[shader], source);
}

Module["_emscripten_glShaderSource"] = _emscripten_glShaderSource;

function _emscripten_glGetShaderSource(shader, bufSize, length, source) {
 var result = GLctx.getShaderSource(GL.shaders[shader]);
 if (!result) return;
 var numBytesWrittenExclNull = bufSize > 0 && source ? stringToUTF8(result, source, bufSize) : 0;
 if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
}

Module["_emscripten_glGetShaderSource"] = _emscripten_glGetShaderSource;

function _emscripten_glCompileShader(shader) {
 GLctx.compileShader(GL.shaders[shader]);
}

Module["_emscripten_glCompileShader"] = _emscripten_glCompileShader;

function _emscripten_glGetShaderInfoLog(shader, maxLength, length, infoLog) {
 var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
 if (log === null) log = "(unknown error)";
 var numBytesWrittenExclNull = maxLength > 0 && infoLog ? stringToUTF8(log, infoLog, maxLength) : 0;
 if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
}

Module["_emscripten_glGetShaderInfoLog"] = _emscripten_glGetShaderInfoLog;

function _emscripten_glGetShaderiv(shader, pname, p) {
 if (!p) {
  GL.recordError(1281);
  return;
 }
 if (pname == 35716) {
  var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
  if (log === null) log = "(unknown error)";
  HEAP32[p >> 2] = log.length + 1;
 } else if (pname == 35720) {
  var source = GLctx.getShaderSource(GL.shaders[shader]);
  var sourceLength = source === null || source.length == 0 ? 0 : source.length + 1;
  HEAP32[p >> 2] = sourceLength;
 } else {
  HEAP32[p >> 2] = GLctx.getShaderParameter(GL.shaders[shader], pname);
 }
}

Module["_emscripten_glGetShaderiv"] = _emscripten_glGetShaderiv;

function _emscripten_glGetProgramiv(program, pname, p) {
 if (!p) {
  GL.recordError(1281);
  return;
 }
 if (program >= GL.counter) {
  GL.recordError(1281);
  return;
 }
 var ptable = GL.programInfos[program];
 if (!ptable) {
  GL.recordError(1282);
  return;
 }
 if (pname == 35716) {
  var log = GLctx.getProgramInfoLog(GL.programs[program]);
  if (log === null) log = "(unknown error)";
  HEAP32[p >> 2] = log.length + 1;
 } else if (pname == 35719) {
  HEAP32[p >> 2] = ptable.maxUniformLength;
 } else if (pname == 35722) {
  if (ptable.maxAttributeLength == -1) {
   program = GL.programs[program];
   var numAttribs = GLctx.getProgramParameter(program, 35721);
   ptable.maxAttributeLength = 0;
   for (var i = 0; i < numAttribs; ++i) {
    var activeAttrib = GLctx.getActiveAttrib(program, i);
    ptable.maxAttributeLength = Math.max(ptable.maxAttributeLength, activeAttrib.name.length + 1);
   }
  }
  HEAP32[p >> 2] = ptable.maxAttributeLength;
 } else if (pname == 35381) {
  if (ptable.maxUniformBlockNameLength == -1) {
   program = GL.programs[program];
   var numBlocks = GLctx.getProgramParameter(program, 35382);
   ptable.maxUniformBlockNameLength = 0;
   for (var i = 0; i < numBlocks; ++i) {
    var activeBlockName = GLctx.getActiveUniformBlockName(program, i);
    ptable.maxUniformBlockNameLength = Math.max(ptable.maxUniformBlockNameLength, activeBlockName.length + 1);
   }
  }
  HEAP32[p >> 2] = ptable.maxUniformBlockNameLength;
 } else {
  HEAP32[p >> 2] = GLctx.getProgramParameter(GL.programs[program], pname);
 }
}

Module["_emscripten_glGetProgramiv"] = _emscripten_glGetProgramiv;

function _emscripten_glIsShader(shader) {
 var s = GL.shaders[shader];
 if (!s) return 0;
 return GLctx.isShader(s);
}

Module["_emscripten_glIsShader"] = _emscripten_glIsShader;

function _emscripten_glCreateProgram() {
 var id = GL.getNewId(GL.programs);
 var program = GLctx.createProgram();
 program.name = id;
 GL.programs[id] = program;
 return id;
}

Module["_emscripten_glCreateProgram"] = _emscripten_glCreateProgram;

function _emscripten_glDeleteProgram(id) {
 if (!id) return;
 var program = GL.programs[id];
 if (!program) {
  GL.recordError(1281);
  return;
 }
 GLctx.deleteProgram(program);
 program.name = 0;
 GL.programs[id] = null;
 GL.programInfos[id] = null;
}

Module["_emscripten_glDeleteProgram"] = _emscripten_glDeleteProgram;

function _emscripten_glAttachShader(program, shader) {
 GLctx.attachShader(GL.programs[program], GL.shaders[shader]);
}

Module["_emscripten_glAttachShader"] = _emscripten_glAttachShader;

function _emscripten_glDetachShader(program, shader) {
 GLctx.detachShader(GL.programs[program], GL.shaders[shader]);
}

Module["_emscripten_glDetachShader"] = _emscripten_glDetachShader;

function _emscripten_glGetShaderPrecisionFormat(shaderType, precisionType, range, precision) {
 var result = GLctx.getShaderPrecisionFormat(shaderType, precisionType);
 HEAP32[range >> 2] = result.rangeMin;
 HEAP32[range + 4 >> 2] = result.rangeMax;
 HEAP32[precision >> 2] = result.precision;
}

Module["_emscripten_glGetShaderPrecisionFormat"] = _emscripten_glGetShaderPrecisionFormat;

function _emscripten_glLinkProgram(program) {
 GLctx.linkProgram(GL.programs[program]);
 GL.populateUniformTable(program);
}

Module["_emscripten_glLinkProgram"] = _emscripten_glLinkProgram;

function _emscripten_glGetProgramInfoLog(program, maxLength, length, infoLog) {
 var log = GLctx.getProgramInfoLog(GL.programs[program]);
 if (log === null) log = "(unknown error)";
 var numBytesWrittenExclNull = maxLength > 0 && infoLog ? stringToUTF8(log, infoLog, maxLength) : 0;
 if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
}

Module["_emscripten_glGetProgramInfoLog"] = _emscripten_glGetProgramInfoLog;

function _emscripten_glUseProgram(program) {
 GLctx.useProgram(GL.programs[program]);
}

Module["_emscripten_glUseProgram"] = _emscripten_glUseProgram;

function _emscripten_glValidateProgram(program) {
 GLctx.validateProgram(GL.programs[program]);
}

Module["_emscripten_glValidateProgram"] = _emscripten_glValidateProgram;

function _emscripten_glIsProgram(program) {
 program = GL.programs[program];
 if (!program) return 0;
 return GLctx.isProgram(program);
}

Module["_emscripten_glIsProgram"] = _emscripten_glIsProgram;

function _emscripten_glBindAttribLocation(program, index, name) {
 GLctx.bindAttribLocation(GL.programs[program], index, UTF8ToString(name));
}

Module["_emscripten_glBindAttribLocation"] = _emscripten_glBindAttribLocation;

function _emscripten_glBindFramebuffer(target, framebuffer) {
 GLctx.bindFramebuffer(target, GL.framebuffers[framebuffer]);
}

Module["_emscripten_glBindFramebuffer"] = _emscripten_glBindFramebuffer;

function _emscripten_glGenFramebuffers(n, ids) {
 __glGenObject(n, ids, "createFramebuffer", GL.framebuffers);
}

Module["_emscripten_glGenFramebuffers"] = _emscripten_glGenFramebuffers;

function _emscripten_glDeleteFramebuffers(n, framebuffers) {
 for (var i = 0; i < n; ++i) {
  var id = HEAP32[framebuffers + i * 4 >> 2];
  var framebuffer = GL.framebuffers[id];
  if (!framebuffer) continue;
  GLctx.deleteFramebuffer(framebuffer);
  framebuffer.name = 0;
  GL.framebuffers[id] = null;
 }
}

Module["_emscripten_glDeleteFramebuffers"] = _emscripten_glDeleteFramebuffers;

function _emscripten_glFramebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer) {
 GLctx.framebufferRenderbuffer(target, attachment, renderbuffertarget, GL.renderbuffers[renderbuffer]);
}

Module["_emscripten_glFramebufferRenderbuffer"] = _emscripten_glFramebufferRenderbuffer;

function _emscripten_glFramebufferTexture2D(target, attachment, textarget, texture, level) {
 GLctx.framebufferTexture2D(target, attachment, textarget, GL.textures[texture], level);
}

Module["_emscripten_glFramebufferTexture2D"] = _emscripten_glFramebufferTexture2D;

function _emscripten_glGetFramebufferAttachmentParameteriv(target, attachment, pname, params) {
 var result = GLctx.getFramebufferAttachmentParameter(target, attachment, pname);
 if (result instanceof WebGLRenderbuffer || result instanceof WebGLTexture) {
  result = result.name | 0;
 }
 HEAP32[params >> 2] = result;
}

Module["_emscripten_glGetFramebufferAttachmentParameteriv"] = _emscripten_glGetFramebufferAttachmentParameteriv;

function _emscripten_glIsFramebuffer(framebuffer) {
 var fb = GL.framebuffers[framebuffer];
 if (!fb) return 0;
 return GLctx.isFramebuffer(fb);
}

Module["_emscripten_glIsFramebuffer"] = _emscripten_glIsFramebuffer;

function _emscripten_glGenVertexArrays(n, arrays) {
 __glGenObject(n, arrays, "createVertexArray", GL.vaos);
}

Module["_emscripten_glGenVertexArrays"] = _emscripten_glGenVertexArrays;

function _emscripten_glDeleteVertexArrays(n, vaos) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[vaos + i * 4 >> 2];
  GLctx["deleteVertexArray"](GL.vaos[id]);
  GL.vaos[id] = null;
 }
}

Module["_emscripten_glDeleteVertexArrays"] = _emscripten_glDeleteVertexArrays;

function _emscripten_glBindVertexArray(vao) {
 GLctx["bindVertexArray"](GL.vaos[vao]);
}

Module["_emscripten_glBindVertexArray"] = _emscripten_glBindVertexArray;

function _emscripten_glIsVertexArray(array) {
 var vao = GL.vaos[array];
 if (!vao) return 0;
 return GLctx["isVertexArray"](vao);
}

Module["_emscripten_glIsVertexArray"] = _emscripten_glIsVertexArray;

function _emscripten_glVertexPointer() {
 throw "Legacy GL function (glVertexPointer) called. If you want legacy GL emulation, you need to compile with -s LEGACY_GL_EMULATION=1 to enable legacy GL emulation.";
}

Module["_emscripten_glVertexPointer"] = _emscripten_glVertexPointer;

function _emscripten_glMatrixMode() {
 throw "Legacy GL function (glMatrixMode) called. If you want legacy GL emulation, you need to compile with -s LEGACY_GL_EMULATION=1 to enable legacy GL emulation.";
}

Module["_emscripten_glMatrixMode"] = _emscripten_glMatrixMode;

function _emscripten_glBegin() {
 throw "Legacy GL function (glBegin) called. If you want legacy GL emulation, you need to compile with -s LEGACY_GL_EMULATION=1 to enable legacy GL emulation.";
}

Module["_emscripten_glBegin"] = _emscripten_glBegin;

function _emscripten_glLoadIdentity() {
 throw "Legacy GL function (glLoadIdentity) called. If you want legacy GL emulation, you need to compile with -s LEGACY_GL_EMULATION=1 to enable legacy GL emulation.";
}

Module["_emscripten_glLoadIdentity"] = _emscripten_glLoadIdentity;

function _emscripten_glGenVertexArraysOES(n, arrays) {
 __glGenObject(n, arrays, "createVertexArray", GL.vaos);
}

Module["_emscripten_glGenVertexArraysOES"] = _emscripten_glGenVertexArraysOES;

function _emscripten_glDeleteVertexArraysOES(n, vaos) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[vaos + i * 4 >> 2];
  GLctx["deleteVertexArray"](GL.vaos[id]);
  GL.vaos[id] = null;
 }
}

Module["_emscripten_glDeleteVertexArraysOES"] = _emscripten_glDeleteVertexArraysOES;

function _emscripten_glBindVertexArrayOES(vao) {
 GLctx["bindVertexArray"](GL.vaos[vao]);
}

Module["_emscripten_glBindVertexArrayOES"] = _emscripten_glBindVertexArrayOES;

function _emscripten_glIsVertexArrayOES(array) {
 var vao = GL.vaos[array];
 if (!vao) return 0;
 return GLctx["isVertexArray"](vao);
}

Module["_emscripten_glIsVertexArrayOES"] = _emscripten_glIsVertexArrayOES;

function _emscripten_gluPerspective(fov, aspect, near, far) {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrix[GLImmediate.currentMatrix] = GLImmediate.matrixLib.mat4.perspective(fov, aspect, near, far, GLImmediate.matrix[GLImmediate.currentMatrix]);
}

Module["_emscripten_gluPerspective"] = _emscripten_gluPerspective;

function _emscripten_gluLookAt(ex, ey, ez, cx, cy, cz, ux, uy, uz) {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrixLib.mat4.lookAt(GLImmediate.matrix[GLImmediate.currentMatrix], [ ex, ey, ez ], [ cx, cy, cz ], [ ux, uy, uz ]);
}

Module["_emscripten_gluLookAt"] = _emscripten_gluLookAt;

function _emscripten_gluProject(objX, objY, objZ, model, proj, view, winX, winY, winZ) {
 var inVec = new Float32Array(4);
 var outVec = new Float32Array(4);
 GLImmediate.matrixLib.mat4.multiplyVec4(HEAPF64.subarray(model >> 3, model + 128 >> 3), [ objX, objY, objZ, 1 ], outVec);
 GLImmediate.matrixLib.mat4.multiplyVec4(HEAPF64.subarray(proj >> 3, proj + 128 >> 3), outVec, inVec);
 if (inVec[3] == 0) {
  return 0;
 }
 inVec[0] /= inVec[3];
 inVec[1] /= inVec[3];
 inVec[2] /= inVec[3];
 inVec[0] = inVec[0] * .5 + .5;
 inVec[1] = inVec[1] * .5 + .5;
 inVec[2] = inVec[2] * .5 + .5;
 inVec[0] = inVec[0] * HEAP32[view + 8 >> 2] + HEAP32[view >> 2];
 inVec[1] = inVec[1] * HEAP32[view + 12 >> 2] + HEAP32[view + 4 >> 2];
 HEAPF64[winX >> 3] = inVec[0];
 HEAPF64[winY >> 3] = inVec[1];
 HEAPF64[winZ >> 3] = inVec[2];
 return 1;
}

Module["_emscripten_gluProject"] = _emscripten_gluProject;

function _emscripten_gluUnProject(winX, winY, winZ, model, proj, view, objX, objY, objZ) {
 var result = GLImmediate.matrixLib.mat4.unproject([ winX, winY, winZ ], HEAPF64.subarray(model >> 3, model + 128 >> 3), HEAPF64.subarray(proj >> 3, proj + 128 >> 3), HEAP32.subarray(view >> 2, view + 16 >> 2));
 if (result === null) {
  return 0;
 }
 HEAPF64[objX >> 3] = result[0];
 HEAPF64[objY >> 3] = result[1];
 HEAPF64[objZ >> 3] = result[2];
 return 1;
}

Module["_emscripten_gluUnProject"] = _emscripten_gluUnProject;

function _emscripten_gluOrtho2D(left, right, bottom, top) {
 _glOrtho(left, right, bottom, top, -1, 1);
}

Module["_emscripten_gluOrtho2D"] = _emscripten_gluOrtho2D;

function _emscripten_glVertexAttribPointer(index, size, type, normalized, stride, ptr) {
 GLctx.vertexAttribPointer(index, size, type, !!normalized, stride, ptr);
}

Module["_emscripten_glVertexAttribPointer"] = _emscripten_glVertexAttribPointer;

function _emscripten_glEnableVertexAttribArray(index) {
 GLctx.enableVertexAttribArray(index);
}

Module["_emscripten_glEnableVertexAttribArray"] = _emscripten_glEnableVertexAttribArray;

function _emscripten_glDisableVertexAttribArray(index) {
 GLctx.disableVertexAttribArray(index);
}

Module["_emscripten_glDisableVertexAttribArray"] = _emscripten_glDisableVertexAttribArray;

function _emscripten_glDrawArrays(mode, first, count) {
 GLctx.drawArrays(mode, first, count);
}

Module["_emscripten_glDrawArrays"] = _emscripten_glDrawArrays;

function _emscripten_glDrawElements(mode, count, type, indices) {
 GLctx.drawElements(mode, count, type, indices);
}

Module["_emscripten_glDrawElements"] = _emscripten_glDrawElements;

function _emscripten_glShaderBinary() {
 GL.recordError(1280);
}

Module["_emscripten_glShaderBinary"] = _emscripten_glShaderBinary;

function _emscripten_glReleaseShaderCompiler() {}

Module["_emscripten_glReleaseShaderCompiler"] = _emscripten_glReleaseShaderCompiler;

function _emscripten_glGetError() {
 var error = GLctx.getError() || GL.lastError;
 GL.lastError = 0;
 return error;
}

Module["_emscripten_glGetError"] = _emscripten_glGetError;

function _emscripten_glVertexAttribDivisor(index, divisor) {
 GLctx["vertexAttribDivisor"](index, divisor);
}

Module["_emscripten_glVertexAttribDivisor"] = _emscripten_glVertexAttribDivisor;

function _emscripten_glDrawArraysInstanced(mode, first, count, primcount) {
 GLctx["drawArraysInstanced"](mode, first, count, primcount);
}

Module["_emscripten_glDrawArraysInstanced"] = _emscripten_glDrawArraysInstanced;

function _emscripten_glDrawElementsInstanced(mode, count, type, indices, primcount) {
 GLctx["drawElementsInstanced"](mode, count, type, indices, primcount);
}

Module["_emscripten_glDrawElementsInstanced"] = _emscripten_glDrawElementsInstanced;

function _emscripten_glVertexAttribDivisorNV(index, divisor) {
 GLctx["vertexAttribDivisor"](index, divisor);
}

Module["_emscripten_glVertexAttribDivisorNV"] = _emscripten_glVertexAttribDivisorNV;

function _emscripten_glDrawArraysInstancedNV(mode, first, count, primcount) {
 GLctx["drawArraysInstanced"](mode, first, count, primcount);
}

Module["_emscripten_glDrawArraysInstancedNV"] = _emscripten_glDrawArraysInstancedNV;

function _emscripten_glDrawElementsInstancedNV(mode, count, type, indices, primcount) {
 GLctx["drawElementsInstanced"](mode, count, type, indices, primcount);
}

Module["_emscripten_glDrawElementsInstancedNV"] = _emscripten_glDrawElementsInstancedNV;

function _emscripten_glVertexAttribDivisorEXT(index, divisor) {
 GLctx["vertexAttribDivisor"](index, divisor);
}

Module["_emscripten_glVertexAttribDivisorEXT"] = _emscripten_glVertexAttribDivisorEXT;

function _emscripten_glDrawArraysInstancedEXT(mode, first, count, primcount) {
 GLctx["drawArraysInstanced"](mode, first, count, primcount);
}

Module["_emscripten_glDrawArraysInstancedEXT"] = _emscripten_glDrawArraysInstancedEXT;

function _emscripten_glDrawElementsInstancedEXT(mode, count, type, indices, primcount) {
 GLctx["drawElementsInstanced"](mode, count, type, indices, primcount);
}

Module["_emscripten_glDrawElementsInstancedEXT"] = _emscripten_glDrawElementsInstancedEXT;

function _emscripten_glVertexAttribDivisorARB(index, divisor) {
 GLctx["vertexAttribDivisor"](index, divisor);
}

Module["_emscripten_glVertexAttribDivisorARB"] = _emscripten_glVertexAttribDivisorARB;

function _emscripten_glDrawArraysInstancedARB(mode, first, count, primcount) {
 GLctx["drawArraysInstanced"](mode, first, count, primcount);
}

Module["_emscripten_glDrawArraysInstancedARB"] = _emscripten_glDrawArraysInstancedARB;

function _emscripten_glDrawElementsInstancedARB(mode, count, type, indices, primcount) {
 GLctx["drawElementsInstanced"](mode, count, type, indices, primcount);
}

Module["_emscripten_glDrawElementsInstancedARB"] = _emscripten_glDrawElementsInstancedARB;

function _emscripten_glVertexAttribDivisorANGLE(index, divisor) {
 GLctx["vertexAttribDivisor"](index, divisor);
}

Module["_emscripten_glVertexAttribDivisorANGLE"] = _emscripten_glVertexAttribDivisorANGLE;

function _emscripten_glDrawArraysInstancedANGLE(mode, first, count, primcount) {
 GLctx["drawArraysInstanced"](mode, first, count, primcount);
}

Module["_emscripten_glDrawArraysInstancedANGLE"] = _emscripten_glDrawArraysInstancedANGLE;

function _emscripten_glDrawElementsInstancedANGLE(mode, count, type, indices, primcount) {
 GLctx["drawElementsInstanced"](mode, count, type, indices, primcount);
}

Module["_emscripten_glDrawElementsInstancedANGLE"] = _emscripten_glDrawElementsInstancedANGLE;

function _emscripten_glDrawBuffers(n, bufs) {
 var bufArray = __tempFixedLengthArray[n];
 for (var i = 0; i < n; i++) {
  bufArray[i] = HEAP32[bufs + i * 4 >> 2];
 }
 GLctx["drawBuffers"](bufArray);
}

Module["_emscripten_glDrawBuffers"] = _emscripten_glDrawBuffers;

function _emscripten_glDrawBuffersEXT(n, bufs) {
 var bufArray = __tempFixedLengthArray[n];
 for (var i = 0; i < n; i++) {
  bufArray[i] = HEAP32[bufs + i * 4 >> 2];
 }
 GLctx["drawBuffers"](bufArray);
}

Module["_emscripten_glDrawBuffersEXT"] = _emscripten_glDrawBuffersEXT;

function _emscripten_glDrawBuffersWEBGL(n, bufs) {
 var bufArray = __tempFixedLengthArray[n];
 for (var i = 0; i < n; i++) {
  bufArray[i] = HEAP32[bufs + i * 4 >> 2];
 }
 GLctx["drawBuffers"](bufArray);
}

Module["_emscripten_glDrawBuffersWEBGL"] = _emscripten_glDrawBuffersWEBGL;

function _emscripten_glColorMask(red, green, blue, alpha) {
 GLctx.colorMask(!!red, !!green, !!blue, !!alpha);
}

Module["_emscripten_glColorMask"] = _emscripten_glColorMask;

function _emscripten_glDepthMask(flag) {
 GLctx.depthMask(!!flag);
}

Module["_emscripten_glDepthMask"] = _emscripten_glDepthMask;

function _emscripten_glSampleCoverage(value, invert) {
 GLctx.sampleCoverage(value, !!invert);
}

Module["_emscripten_glSampleCoverage"] = _emscripten_glSampleCoverage;

function _emscripten_glFinish() {
 GLctx["finish"]();
}

Module["_emscripten_glFinish"] = _emscripten_glFinish;

function _emscripten_glFlush() {
 GLctx["flush"]();
}

Module["_emscripten_glFlush"] = _emscripten_glFlush;

function _emscripten_glClearDepth(x0) {
 GLctx["clearDepth"](x0);
}

Module["_emscripten_glClearDepth"] = _emscripten_glClearDepth;

function _emscripten_glClearDepthf(x0) {
 GLctx["clearDepth"](x0);
}

Module["_emscripten_glClearDepthf"] = _emscripten_glClearDepthf;

function _emscripten_glDepthFunc(x0) {
 GLctx["depthFunc"](x0);
}

Module["_emscripten_glDepthFunc"] = _emscripten_glDepthFunc;

function _emscripten_glEnable(x0) {
 GLctx["enable"](x0);
}

Module["_emscripten_glEnable"] = _emscripten_glEnable;

function _emscripten_glDisable(x0) {
 GLctx["disable"](x0);
}

Module["_emscripten_glDisable"] = _emscripten_glDisable;

function _emscripten_glFrontFace(x0) {
 GLctx["frontFace"](x0);
}

Module["_emscripten_glFrontFace"] = _emscripten_glFrontFace;

function _emscripten_glCullFace(x0) {
 GLctx["cullFace"](x0);
}

Module["_emscripten_glCullFace"] = _emscripten_glCullFace;

function _emscripten_glClear(x0) {
 GLctx["clear"](x0);
}

Module["_emscripten_glClear"] = _emscripten_glClear;

function _emscripten_glLineWidth(x0) {
 GLctx["lineWidth"](x0);
}

Module["_emscripten_glLineWidth"] = _emscripten_glLineWidth;

function _emscripten_glClearStencil(x0) {
 GLctx["clearStencil"](x0);
}

Module["_emscripten_glClearStencil"] = _emscripten_glClearStencil;

function _emscripten_glStencilMask(x0) {
 GLctx["stencilMask"](x0);
}

Module["_emscripten_glStencilMask"] = _emscripten_glStencilMask;

function _emscripten_glCheckFramebufferStatus(x0) {
 return GLctx["checkFramebufferStatus"](x0);
}

Module["_emscripten_glCheckFramebufferStatus"] = _emscripten_glCheckFramebufferStatus;

function _emscripten_glGenerateMipmap(x0) {
 GLctx["generateMipmap"](x0);
}

Module["_emscripten_glGenerateMipmap"] = _emscripten_glGenerateMipmap;

function _emscripten_glActiveTexture(x0) {
 GLctx["activeTexture"](x0);
}

Module["_emscripten_glActiveTexture"] = _emscripten_glActiveTexture;

function _emscripten_glBlendEquation(x0) {
 GLctx["blendEquation"](x0);
}

Module["_emscripten_glBlendEquation"] = _emscripten_glBlendEquation;

function _emscripten_glIsEnabled(x0) {
 return GLctx["isEnabled"](x0);
}

Module["_emscripten_glIsEnabled"] = _emscripten_glIsEnabled;

function _emscripten_glBlendFunc(x0, x1) {
 GLctx["blendFunc"](x0, x1);
}

Module["_emscripten_glBlendFunc"] = _emscripten_glBlendFunc;

function _emscripten_glBlendEquationSeparate(x0, x1) {
 GLctx["blendEquationSeparate"](x0, x1);
}

Module["_emscripten_glBlendEquationSeparate"] = _emscripten_glBlendEquationSeparate;

function _emscripten_glDepthRange(x0, x1) {
 GLctx["depthRange"](x0, x1);
}

Module["_emscripten_glDepthRange"] = _emscripten_glDepthRange;

function _emscripten_glDepthRangef(x0, x1) {
 GLctx["depthRange"](x0, x1);
}

Module["_emscripten_glDepthRangef"] = _emscripten_glDepthRangef;

function _emscripten_glStencilMaskSeparate(x0, x1) {
 GLctx["stencilMaskSeparate"](x0, x1);
}

Module["_emscripten_glStencilMaskSeparate"] = _emscripten_glStencilMaskSeparate;

function _emscripten_glHint(x0, x1) {
 GLctx["hint"](x0, x1);
}

Module["_emscripten_glHint"] = _emscripten_glHint;

function _emscripten_glPolygonOffset(x0, x1) {
 GLctx["polygonOffset"](x0, x1);
}

Module["_emscripten_glPolygonOffset"] = _emscripten_glPolygonOffset;

function _emscripten_glVertexAttrib1f(x0, x1) {
 GLctx["vertexAttrib1f"](x0, x1);
}

Module["_emscripten_glVertexAttrib1f"] = _emscripten_glVertexAttrib1f;

function _emscripten_glTexParameteri(x0, x1, x2) {
 GLctx["texParameteri"](x0, x1, x2);
}

Module["_emscripten_glTexParameteri"] = _emscripten_glTexParameteri;

function _emscripten_glTexParameterf(x0, x1, x2) {
 GLctx["texParameterf"](x0, x1, x2);
}

Module["_emscripten_glTexParameterf"] = _emscripten_glTexParameterf;

function _emscripten_glVertexAttrib2f(x0, x1, x2) {
 GLctx["vertexAttrib2f"](x0, x1, x2);
}

Module["_emscripten_glVertexAttrib2f"] = _emscripten_glVertexAttrib2f;

function _emscripten_glStencilFunc(x0, x1, x2) {
 GLctx["stencilFunc"](x0, x1, x2);
}

Module["_emscripten_glStencilFunc"] = _emscripten_glStencilFunc;

function _emscripten_glStencilOp(x0, x1, x2) {
 GLctx["stencilOp"](x0, x1, x2);
}

Module["_emscripten_glStencilOp"] = _emscripten_glStencilOp;

function _emscripten_glViewport(x0, x1, x2, x3) {
 GLctx["viewport"](x0, x1, x2, x3);
}

Module["_emscripten_glViewport"] = _emscripten_glViewport;

function _emscripten_glClearColor(x0, x1, x2, x3) {
 GLctx["clearColor"](x0, x1, x2, x3);
}

Module["_emscripten_glClearColor"] = _emscripten_glClearColor;

function _emscripten_glScissor(x0, x1, x2, x3) {
 GLctx["scissor"](x0, x1, x2, x3);
}

Module["_emscripten_glScissor"] = _emscripten_glScissor;

function _emscripten_glVertexAttrib3f(x0, x1, x2, x3) {
 GLctx["vertexAttrib3f"](x0, x1, x2, x3);
}

Module["_emscripten_glVertexAttrib3f"] = _emscripten_glVertexAttrib3f;

function _emscripten_glRenderbufferStorage(x0, x1, x2, x3) {
 GLctx["renderbufferStorage"](x0, x1, x2, x3);
}

Module["_emscripten_glRenderbufferStorage"] = _emscripten_glRenderbufferStorage;

function _emscripten_glBlendFuncSeparate(x0, x1, x2, x3) {
 GLctx["blendFuncSeparate"](x0, x1, x2, x3);
}

Module["_emscripten_glBlendFuncSeparate"] = _emscripten_glBlendFuncSeparate;

function _emscripten_glBlendColor(x0, x1, x2, x3) {
 GLctx["blendColor"](x0, x1, x2, x3);
}

Module["_emscripten_glBlendColor"] = _emscripten_glBlendColor;

function _emscripten_glStencilFuncSeparate(x0, x1, x2, x3) {
 GLctx["stencilFuncSeparate"](x0, x1, x2, x3);
}

Module["_emscripten_glStencilFuncSeparate"] = _emscripten_glStencilFuncSeparate;

function _emscripten_glStencilOpSeparate(x0, x1, x2, x3) {
 GLctx["stencilOpSeparate"](x0, x1, x2, x3);
}

Module["_emscripten_glStencilOpSeparate"] = _emscripten_glStencilOpSeparate;

function _emscripten_glVertexAttrib4f(x0, x1, x2, x3, x4) {
 GLctx["vertexAttrib4f"](x0, x1, x2, x3, x4);
}

Module["_emscripten_glVertexAttrib4f"] = _emscripten_glVertexAttrib4f;

function _emscripten_glCopyTexImage2D(x0, x1, x2, x3, x4, x5, x6, x7) {
 GLctx["copyTexImage2D"](x0, x1, x2, x3, x4, x5, x6, x7);
}

Module["_emscripten_glCopyTexImage2D"] = _emscripten_glCopyTexImage2D;

function _emscripten_glCopyTexSubImage2D(x0, x1, x2, x3, x4, x5, x6, x7) {
 GLctx["copyTexSubImage2D"](x0, x1, x2, x3, x4, x5, x6, x7);
}

Module["_emscripten_glCopyTexSubImage2D"] = _emscripten_glCopyTexSubImage2D;

var AL = {
 QUEUE_INTERVAL: 25,
 QUEUE_LOOKAHEAD: .1,
 DEVICE_NAME: "Emscripten OpenAL",
 CAPTURE_DEVICE_NAME: "Emscripten OpenAL capture",
 ALC_EXTENSIONS: {
  ALC_SOFT_pause_device: true,
  ALC_SOFT_HRTF: true
 },
 AL_EXTENSIONS: {
  AL_EXT_float32: true,
  AL_SOFT_loop_points: true,
  AL_SOFT_source_length: true,
  AL_EXT_source_distance_model: true,
  AL_SOFT_source_spatialize: true
 },
 _alcErr: 0,
 alcErr: 0,
 deviceRefCounts: {},
 alcStringCache: {},
 paused: false,
 stringCache: {},
 contexts: {},
 currentCtx: null,
 buffers: {
  0: {
   id: 0,
   refCount: 0,
   audioBuf: null,
   frequency: 0,
   bytesPerSample: 2,
   channels: 1,
   length: 0
  }
 },
 paramArray: [],
 _nextId: 1,
 newId: function() {
  return AL.freeIds.length > 0 ? AL.freeIds.pop() : AL._nextId++;
 },
 freeIds: [],
 scheduleContextAudio: function(ctx) {
  if (Browser.mainLoop.timingMode === 1 && document["visibilityState"] != "visible") {
   return;
  }
  for (var i in ctx.sources) {
   AL.scheduleSourceAudio(ctx.sources[i]);
  }
 },
 scheduleSourceAudio: function(src, lookahead) {
  if (Browser.mainLoop.timingMode === 1 && document["visibilityState"] != "visible") {
   return;
  }
  if (src.state !== 4114) {
   return;
  }
  var currentTime = AL.updateSourceTime(src);
  var startTime = src.bufStartTime;
  var startOffset = src.bufOffset;
  var bufCursor = src.bufsProcessed;
  for (var i = 0; i < src.audioQueue.length; i++) {
   var audioSrc = src.audioQueue[i];
   startTime = audioSrc._startTime + audioSrc._duration;
   startOffset = 0;
   bufCursor += audioSrc._skipCount + 1;
  }
  if (!lookahead) {
   lookahead = AL.QUEUE_LOOKAHEAD;
  }
  var lookaheadTime = currentTime + lookahead;
  var skipCount = 0;
  while (startTime < lookaheadTime) {
   if (bufCursor >= src.bufQueue.length) {
    if (src.looping) {
     bufCursor %= src.bufQueue.length;
    } else {
     break;
    }
   }
   var buf = src.bufQueue[bufCursor % src.bufQueue.length];
   if (buf.length === 0) {
    skipCount++;
    if (skipCount === src.bufQueue.length) {
     break;
    }
   } else {
    var audioSrc = src.context.audioCtx.createBufferSource();
    audioSrc.buffer = buf.audioBuf;
    audioSrc.playbackRate.value = src.playbackRate;
    if (buf.audioBuf._loopStart || buf.audioBuf._loopEnd) {
     audioSrc.loopStart = buf.audioBuf._loopStart;
     audioSrc.loopEnd = buf.audioBuf._loopEnd;
    }
    var duration = 0;
    if (src.type === 4136 && src.looping) {
     duration = Number.POSITIVE_INFINITY;
     audioSrc.loop = true;
     if (buf.audioBuf._loopStart) {
      audioSrc.loopStart = buf.audioBuf._loopStart;
     }
     if (buf.audioBuf._loopEnd) {
      audioSrc.loopEnd = buf.audioBuf._loopEnd;
     }
    } else {
     duration = (buf.audioBuf.duration - startOffset) / src.playbackRate;
    }
    audioSrc._startOffset = startOffset;
    audioSrc._duration = duration;
    audioSrc._skipCount = skipCount;
    skipCount = 0;
    audioSrc.connect(src.gain);
    if (typeof audioSrc.start !== "undefined") {
     startTime = Math.max(startTime, src.context.audioCtx.currentTime);
     audioSrc.start(startTime, startOffset);
    } else if (typeof audioSrc.noteOn !== "undefined") {
     startTime = Math.max(startTime, src.context.audioCtx.currentTime);
     audioSrc.noteOn(startTime);
    }
    audioSrc._startTime = startTime;
    src.audioQueue.push(audioSrc);
    startTime += duration;
   }
   startOffset = 0;
   bufCursor++;
  }
 },
 updateSourceTime: function(src) {
  var currentTime = src.context.audioCtx.currentTime;
  if (src.state !== 4114) {
   return currentTime;
  }
  if (!isFinite(src.bufStartTime)) {
   src.bufStartTime = currentTime - src.bufOffset / src.playbackRate;
   src.bufOffset = 0;
  }
  var nextStartTime = 0;
  while (src.audioQueue.length) {
   var audioSrc = src.audioQueue[0];
   src.bufsProcessed += audioSrc._skipCount;
   nextStartTime = audioSrc._startTime + audioSrc._duration;
   if (currentTime < nextStartTime) {
    break;
   }
   src.audioQueue.shift();
   src.bufStartTime = nextStartTime;
   src.bufOffset = 0;
   src.bufsProcessed++;
  }
  if (src.bufsProcessed >= src.bufQueue.length && !src.looping) {
   AL.setSourceState(src, 4116);
  } else if (src.type === 4136 && src.looping) {
   var buf = src.bufQueue[0];
   if (buf.length === 0) {
    src.bufOffset = 0;
   } else {
    var delta = (currentTime - src.bufStartTime) * src.playbackRate;
    var loopStart = buf.audioBuf._loopStart || 0;
    var loopEnd = buf.audioBuf._loopEnd || buf.audioBuf.duration;
    if (loopEnd <= loopStart) {
     loopEnd = buf.audioBuf.duration;
    }
    if (delta < loopEnd) {
     src.bufOffset = delta;
    } else {
     src.bufOffset = loopStart + (delta - loopStart) % (loopEnd - loopStart);
    }
   }
  } else if (src.audioQueue[0]) {
   src.bufOffset = (currentTime - src.audioQueue[0]._startTime) * src.playbackRate;
  } else {
   if (src.type !== 4136 && src.looping) {
    var srcDuration = AL.sourceDuration(src) / src.playbackRate;
    if (srcDuration > 0) {
     src.bufStartTime += Math.floor((currentTime - src.bufStartTime) / srcDuration) * srcDuration;
    }
   }
   for (var i = 0; i < src.bufQueue.length; i++) {
    if (src.bufsProcessed >= src.bufQueue.length) {
     if (src.looping) {
      src.bufsProcessed %= src.bufQueue.length;
     } else {
      AL.setSourceState(src, 4116);
      break;
     }
    }
    var buf = src.bufQueue[src.bufsProcessed];
    if (buf.length > 0) {
     nextStartTime = src.bufStartTime + buf.audioBuf.duration / src.playbackRate;
     if (currentTime < nextStartTime) {
      src.bufOffset = (currentTime - src.bufStartTime) * src.playbackRate;
      break;
     }
     src.bufStartTime = nextStartTime;
    }
    src.bufOffset = 0;
    src.bufsProcessed++;
   }
  }
  return currentTime;
 },
 cancelPendingSourceAudio: function(src) {
  AL.updateSourceTime(src);
  for (var i = 1; i < src.audioQueue.length; i++) {
   var audioSrc = src.audioQueue[i];
   audioSrc.stop();
  }
  if (src.audioQueue.length > 1) {
   src.audioQueue.length = 1;
  }
 },
 stopSourceAudio: function(src) {
  for (var i = 0; i < src.audioQueue.length; i++) {
   src.audioQueue[i].stop();
  }
  src.audioQueue.length = 0;
 },
 setSourceState: function(src, state) {
  if (state === 4114) {
   if (src.state === 4114 || src.state == 4116) {
    src.bufsProcessed = 0;
    src.bufOffset = 0;
   } else {}
   AL.stopSourceAudio(src);
   src.state = 4114;
   src.bufStartTime = Number.NEGATIVE_INFINITY;
   AL.scheduleSourceAudio(src);
  } else if (state === 4115) {
   if (src.state === 4114) {
    AL.updateSourceTime(src);
    AL.stopSourceAudio(src);
    src.state = 4115;
   }
  } else if (state === 4116) {
   if (src.state !== 4113) {
    src.state = 4116;
    src.bufsProcessed = src.bufQueue.length;
    src.bufStartTime = Number.NEGATIVE_INFINITY;
    src.bufOffset = 0;
    AL.stopSourceAudio(src);
   }
  } else if (state === 4113) {
   if (src.state !== 4113) {
    src.state = 4113;
    src.bufsProcessed = 0;
    src.bufStartTime = Number.NEGATIVE_INFINITY;
    src.bufOffset = 0;
    AL.stopSourceAudio(src);
   }
  }
 },
 initSourcePanner: function(src) {
  if (src.type === 4144) {
   return;
  }
  var templateBuf = AL.buffers[0];
  for (var i = 0; i < src.bufQueue.length; i++) {
   if (src.bufQueue[i].id !== 0) {
    templateBuf = src.bufQueue[i];
    break;
   }
  }
  if (src.spatialize === 1 || src.spatialize === 2 && templateBuf.channels === 1) {
   if (src.panner) {
    return;
   }
   src.panner = src.context.audioCtx.createPanner();
   AL.updateSourceGlobal(src);
   AL.updateSourceSpace(src);
   src.panner.connect(src.context.gain);
   src.gain.disconnect();
   src.gain.connect(src.panner);
  } else {
   if (!src.panner) {
    return;
   }
   src.panner.disconnect();
   src.gain.disconnect();
   src.gain.connect(src.context.gain);
   src.panner = null;
  }
 },
 updateContextGlobal: function(ctx) {
  for (var i in ctx.sources) {
   AL.updateSourceGlobal(ctx.sources[i]);
  }
 },
 updateSourceGlobal: function(src) {
  var panner = src.panner;
  if (!panner) {
   return;
  }
  panner.refDistance = src.refDistance;
  panner.maxDistance = src.maxDistance;
  panner.rolloffFactor = src.rolloffFactor;
  panner.panningModel = src.context.hrtf ? "HRTF" : "equalpower";
  var distanceModel = src.context.sourceDistanceModel ? src.distanceModel : src.context.distanceModel;
  switch (distanceModel) {
  case 0:
   panner.distanceModel = "inverse";
   panner.refDistance = 3.40282e38;
   break;

  case 53249:
  case 53250:
   panner.distanceModel = "inverse";
   break;

  case 53251:
  case 53252:
   panner.distanceModel = "linear";
   break;

  case 53253:
  case 53254:
   panner.distanceModel = "exponential";
   break;
  }
 },
 updateListenerSpace: function(ctx) {
  var listener = ctx.audioCtx.listener;
  if (listener.positionX) {
   listener.positionX.value = ctx.listener.position[0];
   listener.positionY.value = ctx.listener.position[1];
   listener.positionZ.value = ctx.listener.position[2];
  } else {
   listener.setPosition(ctx.listener.position[0], ctx.listener.position[1], ctx.listener.position[2]);
  }
  if (listener.forwardX) {
   listener.forwardX.value = ctx.listener.direction[0];
   listener.forwardY.value = ctx.listener.direction[1];
   listener.forwardZ.value = ctx.listener.direction[2];
   listener.upX.value = ctx.listener.up[0];
   listener.upY.value = ctx.listener.up[1];
   listener.upZ.value = ctx.listener.up[2];
  } else {
   listener.setOrientation(ctx.listener.direction[0], ctx.listener.direction[1], ctx.listener.direction[2], ctx.listener.up[0], ctx.listener.up[1], ctx.listener.up[2]);
  }
  for (var i in ctx.sources) {
   AL.updateSourceSpace(ctx.sources[i]);
  }
 },
 updateSourceSpace: function(src) {
  if (!src.panner) {
   return;
  }
  var panner = src.panner;
  var posX = src.position[0];
  var posY = src.position[1];
  var posZ = src.position[2];
  var dirX = src.direction[0];
  var dirY = src.direction[1];
  var dirZ = src.direction[2];
  var listener = src.context.listener;
  var lPosX = listener.position[0];
  var lPosY = listener.position[1];
  var lPosZ = listener.position[2];
  if (src.relative) {
   var lBackX = -listener.direction[0];
   var lBackY = -listener.direction[1];
   var lBackZ = -listener.direction[2];
   var lUpX = listener.up[0];
   var lUpY = listener.up[1];
   var lUpZ = listener.up[2];
   var inverseMagnitude = function(x, y, z) {
    var length = Math.sqrt(x * x + y * y + z * z);
    if (length < Number.EPSILON) {
     return 0;
    }
    return 1 / length;
   };
   var invMag = inverseMagnitude(lBackX, lBackY, lBackZ);
   lBackX *= invMag;
   lBackY *= invMag;
   lBackZ *= invMag;
   invMag = inverseMagnitude(lUpX, lUpY, lUpZ);
   lUpX *= invMag;
   lUpY *= invMag;
   lUpZ *= invMag;
   var lRightX = lUpY * lBackZ - lUpZ * lBackY;
   var lRightY = lUpZ * lBackX - lUpX * lBackZ;
   var lRightZ = lUpX * lBackY - lUpY * lBackX;
   invMag = inverseMagnitude(lRightX, lRightY, lRightZ);
   lRightX *= invMag;
   lRightY *= invMag;
   lRightZ *= invMag;
   lUpX = lBackY * lRightZ - lBackZ * lRightY;
   lUpY = lBackZ * lRightX - lBackX * lRightZ;
   lUpZ = lBackX * lRightY - lBackY * lRightX;
   var oldX = dirX;
   var oldY = dirY;
   var oldZ = dirZ;
   dirX = oldX * lRightX + oldY * lUpX + oldZ * lBackX;
   dirY = oldX * lRightY + oldY * lUpY + oldZ * lBackY;
   dirZ = oldX * lRightZ + oldY * lUpZ + oldZ * lBackZ;
   oldX = posX;
   oldY = posY;
   oldZ = posZ;
   posX = oldX * lRightX + oldY * lUpX + oldZ * lBackX;
   posY = oldX * lRightY + oldY * lUpY + oldZ * lBackY;
   posZ = oldX * lRightZ + oldY * lUpZ + oldZ * lBackZ;
   posX += lPosX;
   posY += lPosY;
   posZ += lPosZ;
  }
  if (panner.positionX) {
   panner.positionX.value = posX;
   panner.positionY.value = posY;
   panner.positionZ.value = posZ;
  } else {
   panner.setPosition(posX, posY, posZ);
  }
  if (panner.orientationX) {
   panner.orientationX.value = dirX;
   panner.orientationY.value = dirY;
   panner.orientationZ.value = dirZ;
  } else {
   panner.setOrientation(dirX, dirY, dirZ);
  }
  var oldShift = src.dopplerShift;
  var velX = src.velocity[0];
  var velY = src.velocity[1];
  var velZ = src.velocity[2];
  var lVelX = listener.velocity[0];
  var lVelY = listener.velocity[1];
  var lVelZ = listener.velocity[2];
  if (posX === lPosX && posY === lPosY && posZ === lPosZ || velX === lVelX && velY === lVelY && velZ === lVelZ) {
   src.dopplerShift = 1;
  } else {
   var speedOfSound = src.context.speedOfSound;
   var dopplerFactor = src.context.dopplerFactor;
   var slX = lPosX - posX;
   var slY = lPosY - posY;
   var slZ = lPosZ - posZ;
   var magSl = Math.sqrt(slX * slX + slY * slY + slZ * slZ);
   var vls = (slX * lVelX + slY * lVelY + slZ * lVelZ) / magSl;
   var vss = (slX * velX + slY * velY + slZ * velZ) / magSl;
   vls = Math.min(vls, speedOfSound / dopplerFactor);
   vss = Math.min(vss, speedOfSound / dopplerFactor);
   src.dopplerShift = (speedOfSound - dopplerFactor * vls) / (speedOfSound - dopplerFactor * vss);
  }
  if (src.dopplerShift !== oldShift) {
   AL.updateSourceRate(src);
  }
 },
 updateSourceRate: function(src) {
  if (src.state === 4114) {
   AL.cancelPendingSourceAudio(src);
   var audioSrc = src.audioQueue[0];
   if (!audioSrc) {
    return;
   }
   var duration;
   if (src.type === 4136 && src.looping) {
    duration = Number.POSITIVE_INFINITY;
   } else {
    duration = (audioSrc.buffer.duration - audioSrc._startOffset) / src.playbackRate;
   }
   audioSrc._duration = duration;
   audioSrc.playbackRate.value = src.playbackRate;
   AL.scheduleSourceAudio(src);
  }
 },
 sourceDuration: function(src) {
  var length = 0;
  for (var i = 0; i < src.bufQueue.length; i++) {
   var audioBuf = src.bufQueue[i].audioBuf;
   length += audioBuf ? audioBuf.duration : 0;
  }
  return length;
 },
 sourceTell: function(src) {
  AL.updateSourceTime(src);
  var offset = 0;
  for (var i = 0; i < src.bufsProcessed; i++) {
   offset += src.bufQueue[i].audioBuf.duration;
  }
  offset += src.bufOffset;
  return offset;
 },
 sourceSeek: function(src, offset) {
  var playing = src.state == 4114;
  if (playing) {
   AL.setSourceState(src, 4113);
  }
  if (src.bufQueue[src.bufsProcessed].audioBuf !== null) {
   src.bufsProcessed = 0;
   while (offset > src.bufQueue[src.bufsProcessed].audioBuf.duration) {
    offset -= src.bufQueue[src.bufsProcessed].audiobuf.duration;
    src.bufsProcessed++;
   }
   src.bufOffset = offset;
  }
  if (playing) {
   AL.setSourceState(src, 4114);
  }
 },
 getGlobalParam: function(funcname, param) {
  if (!AL.currentCtx) {
   return null;
  }
  switch (param) {
  case 49152:
   return AL.currentCtx.dopplerFactor;

  case 49155:
   return AL.currentCtx.speedOfSound;

  case 53248:
   return AL.currentCtx.distanceModel;

  default:
   AL.currentCtx.err = 40962;
   return null;
  }
 },
 setGlobalParam: function(funcname, param, value) {
  if (!AL.currentCtx) {
   return;
  }
  switch (param) {
  case 49152:
   if (!Number.isFinite(value) || value < 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   AL.currentCtx.dopplerFactor = value;
   AL.updateListenerSpace(AL.currentCtx);
   break;

  case 49155:
   if (!Number.isFinite(value) || value <= 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   AL.currentCtx.speedOfSound = value;
   AL.updateListenerSpace(AL.currentCtx);
   break;

  case 53248:
   switch (value) {
   case 0:
   case 53249:
   case 53250:
   case 53251:
   case 53252:
   case 53253:
   case 53254:
    AL.currentCtx.distanceModel = value;
    AL.updateContextGlobal(AL.currentCtx);
    break;

   default:
    AL.currentCtx.err = 40963;
    return;
   }
   break;

  default:
   AL.currentCtx.err = 40962;
   return;
  }
 },
 getListenerParam: function(funcname, param) {
  if (!AL.currentCtx) {
   return null;
  }
  switch (param) {
  case 4100:
   return AL.currentCtx.listener.position;

  case 4102:
   return AL.currentCtx.listener.velocity;

  case 4111:
   return AL.currentCtx.listener.direction.concat(AL.currentCtx.listener.up);

  case 4106:
   return AL.currentCtx.gain.gain.value;

  default:
   AL.currentCtx.err = 40962;
   return null;
  }
 },
 setListenerParam: function(funcname, param, value) {
  if (!AL.currentCtx) {
   return;
  }
  if (value === null) {
   AL.currentCtx.err = 40962;
   return;
  }
  var listener = AL.currentCtx.listener;
  switch (param) {
  case 4100:
   if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
    AL.currentCtx.err = 40963;
    return;
   }
   listener.position[0] = value[0];
   listener.position[1] = value[1];
   listener.position[2] = value[2];
   AL.updateListenerSpace(AL.currentCtx);
   break;

  case 4102:
   if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
    AL.currentCtx.err = 40963;
    return;
   }
   listener.velocity[0] = value[0];
   listener.velocity[1] = value[1];
   listener.velocity[2] = value[2];
   AL.updateListenerSpace(AL.currentCtx);
   break;

  case 4106:
   if (!Number.isFinite(value) || value < 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   AL.currentCtx.gain.gain.value = value;
   break;

  case 4111:
   if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2]) || !Number.isFinite(value[3]) || !Number.isFinite(value[4]) || !Number.isFinite(value[5])) {
    AL.currentCtx.err = 40963;
    return;
   }
   listener.direction[0] = value[0];
   listener.direction[1] = value[1];
   listener.direction[2] = value[2];
   listener.up[0] = value[3];
   listener.up[1] = value[4];
   listener.up[2] = value[5];
   AL.updateListenerSpace(AL.currentCtx);
   break;

  default:
   AL.currentCtx.err = 40962;
   return;
  }
 },
 getBufferParam: function(funcname, bufferId, param) {
  if (!AL.currentCtx) {
   return;
  }
  var buf = AL.buffers[bufferId];
  if (!buf || bufferId === 0) {
   AL.currentCtx.err = 40961;
   return;
  }
  switch (param) {
  case 8193:
   return buf.frequency;

  case 8194:
   return buf.bytesPerSample * 8;

  case 8195:
   return buf.channels;

  case 8196:
   return buf.length * buf.bytesPerSample * buf.channels;

  case 8213:
   if (buf.length === 0) {
    return [ 0, 0 ];
   } else {
    return [ (buf.audioBuf._loopStart || 0) * buf.frequency, (buf.audioBuf._loopEnd || buf.length) * buf.frequency ];
   }

  default:
   AL.currentCtx.err = 40962;
   return null;
  }
 },
 setBufferParam: function(funcname, bufferId, param, value) {
  if (!AL.currentCtx) {
   return;
  }
  var buf = AL.buffers[bufferId];
  if (!buf || bufferId === 0) {
   AL.currentCtx.err = 40961;
   return;
  }
  if (value === null) {
   AL.currentCtx.err = 40962;
   return;
  }
  switch (param) {
  case 8196:
   if (value !== 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   break;

  case 8213:
   if (value[0] < 0 || value[0] > buf.length || value[1] < 0 || value[1] > buf.Length || value[0] >= value[1]) {
    AL.currentCtx.err = 40963;
    return;
   }
   if (buf.refCount > 0) {
    AL.currentCtx.err = 40964;
    return;
   }
   if (buf.audioBuf) {
    buf.audioBuf._loopStart = value[0] / buf.frequency;
    buf.audioBuf._loopEnd = value[1] / buf.frequency;
   }
   break;

  default:
   AL.currentCtx.err = 40962;
   return;
  }
 },
 getSourceParam: function(funcname, sourceId, param) {
  if (!AL.currentCtx) {
   return null;
  }
  var src = AL.currentCtx.sources[sourceId];
  if (!src) {
   AL.currentCtx.err = 40961;
   return null;
  }
  switch (param) {
  case 514:
   return src.relative;

  case 4097:
   return src.coneInnerAngle;

  case 4098:
   return src.coneOuterAngle;

  case 4099:
   return src.pitch;

  case 4100:
   return src.position;

  case 4101:
   return src.direction;

  case 4102:
   return src.velocity;

  case 4103:
   return src.looping;

  case 4105:
   if (src.type === 4136) {
    return src.bufQueue[0].id;
   } else {
    return 0;
   }

  case 4106:
   return src.gain.gain.value;

  case 4109:
   return src.minGain;

  case 4110:
   return src.maxGain;

  case 4112:
   return src.state;

  case 4117:
   if (src.bufQueue.length === 1 && src.bufQueue[0].id === 0) {
    return 0;
   } else {
    return src.bufQueue.length;
   }

  case 4118:
   if (src.bufQueue.length === 1 && src.bufQueue[0].id === 0 || src.looping) {
    return 0;
   } else {
    return src.bufsProcessed;
   }

  case 4128:
   return src.refDistance;

  case 4129:
   return src.rolloffFactor;

  case 4130:
   return src.coneOuterGain;

  case 4131:
   return src.maxDistance;

  case 4132:
   return AL.sourceTell(src);

  case 4133:
   var offset = AL.sourceTell(src);
   if (offset > 0) {
    offset *= src.bufQueue[0].frequency;
   }
   return offset;

  case 4134:
   var offset = AL.sourceTell(src);
   if (offset > 0) {
    offset *= src.bufQueue[0].frequency * src.bufQueue[0].bytesPerSample;
   }
   return offset;

  case 4135:
   return src.type;

  case 4628:
   return src.spatialize;

  case 8201:
   var length = 0;
   var bytesPerFrame = 0;
   for (var i = 0; i < src.bufQueue.length; i++) {
    length += src.bufQueue[i].length;
    if (src.bufQueue[i].id !== 0) {
     bytesPerFrame = src.bufQueue[i].bytesPerSample * src.bufQueue[i].channels;
    }
   }
   return length * bytesPerFrame;

  case 8202:
   var length = 0;
   for (var i = 0; i < src.bufQueue.length; i++) {
    length += src.bufQueue[i].length;
   }
   return length;

  case 8203:
   return AL.sourceDuration(src);

  case 53248:
   return src.distanceModel;

  default:
   AL.currentCtx.err = 40962;
   return null;
  }
 },
 setSourceParam: function(funcname, sourceId, param, value) {
  if (!AL.currentCtx) {
   return;
  }
  var src = AL.currentCtx.sources[sourceId];
  if (!src) {
   AL.currentCtx.err = 40961;
   return;
  }
  if (value === null) {
   AL.currentCtx.err = 40962;
   return;
  }
  switch (param) {
  case 514:
   if (value === 1) {
    src.relative = true;
    AL.updateSourceSpace(src);
   } else if (value === 0) {
    src.relative = false;
    AL.updateSourceSpace(src);
   } else {
    AL.currentCtx.err = 40963;
    return;
   }
   break;

  case 4097:
   if (!Number.isFinite(value)) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.coneInnerAngle = value;
   if (src.panner) {
    src.panner.coneInnerAngle = value % 360;
   }
   break;

  case 4098:
   if (!Number.isFinite(value)) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.coneOuterAngle = value;
   if (src.panner) {
    src.panner.coneOuterAngle = value % 360;
   }
   break;

  case 4099:
   if (!Number.isFinite(value) || value <= 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   if (src.pitch === value) {
    break;
   }
   src.pitch = value;
   AL.updateSourceRate(src);
   break;

  case 4100:
   if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.position[0] = value[0];
   src.position[1] = value[1];
   src.position[2] = value[2];
   AL.updateSourceSpace(src);
   break;

  case 4101:
   if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.direction[0] = value[0];
   src.direction[1] = value[1];
   src.direction[2] = value[2];
   AL.updateSourceSpace(src);
   break;

  case 4102:
   if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.velocity[0] = value[0];
   src.velocity[1] = value[1];
   src.velocity[2] = value[2];
   AL.updateSourceSpace(src);
   break;

  case 4103:
   if (value === 1) {
    src.looping = true;
    AL.updateSourceTime(src);
    if (src.type === 4136 && src.audioQueue.length > 0) {
     var audioSrc = src.audioQueue[0];
     audioSrc.loop = true;
     audioSrc._duration = Number.POSITIVE_INFINITY;
    }
   } else if (value === 0) {
    src.looping = false;
    var currentTime = AL.updateSourceTime(src);
    if (src.type === 4136 && src.audioQueue.length > 0) {
     var audioSrc = src.audioQueue[0];
     audioSrc.loop = false;
     audioSrc._duration = src.bufQueue[0].audioBuf.duration / src.playbackRate;
     audioSrc._startTime = currentTime - src.bufOffset / src.playbackRate;
    }
   } else {
    AL.currentCtx.err = 40963;
    return;
   }
   break;

  case 4105:
   if (src.state === 4114 || src.state === 4115) {
    AL.currentCtx.err = 40964;
    return;
   }
   if (value === 0) {
    for (var i in src.bufQueue) {
     src.bufQueue[i].refCount--;
    }
    src.bufQueue.length = 1;
    src.bufQueue[0] = AL.buffers[0];
    src.bufsProcessed = 0;
    src.type = 4144;
   } else {
    var buf = AL.buffers[value];
    if (!buf) {
     AL.currentCtx.err = 40963;
     return;
    }
    for (var i in src.bufQueue) {
     src.bufQueue[i].refCount--;
    }
    src.bufQueue.length = 0;
    buf.refCount++;
    src.bufQueue = [ buf ];
    src.bufsProcessed = 0;
    src.type = 4136;
   }
   AL.initSourcePanner(src);
   AL.scheduleSourceAudio(src);
   break;

  case 4106:
   if (!Number.isFinite(value) || value < 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.gain.gain.value = value;
   break;

  case 4109:
   if (!Number.isFinite(value) || value < 0 || value > Math.min(src.maxGain, 1)) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.minGain = value;
   break;

  case 4110:
   if (!Number.isFinite(value) || value < Math.max(0, src.minGain) || value > 1) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.maxGain = value;
   break;

  case 4128:
   if (!Number.isFinite(value) || value < 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.refDistance = value;
   if (src.panner) {
    src.panner.refDistance = value;
   }
   break;

  case 4129:
   if (!Number.isFinite(value) || value < 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.rolloffFactor = value;
   if (src.panner) {
    src.panner.rolloffFactor = value;
   }
   break;

  case 4130:
   if (!Number.isFinite(value) || value < 0 || value > 1) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.coneOuterGain = value;
   if (src.panner) {
    src.panner.coneOuterGain = value;
   }
   break;

  case 4131:
   if (!Number.isFinite(value) || value < 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.maxDistance = value;
   if (src.panner) {
    src.panner.maxDistance = value;
   }
   break;

  case 4132:
   if (value < 0 || value > AL.sourceDuration(src)) {
    AL.currentCtx.err = 40963;
    return;
   }
   AL.sourceSeek(src, value);
   break;

  case 4133:
   var srcLen = AL.sourceDuration(src);
   if (srcLen > 0) {
    var frequency;
    for (var bufId in src.bufQueue) {
     if (bufId !== 0) {
      frequency = src.bufQueue[bufId].frequency;
      break;
     }
    }
    value /= frequency;
   }
   if (value < 0 || value > srcLen) {
    AL.currentCtx.err = 40963;
    return;
   }
   AL.sourceSeek(src, value);
   break;

  case 4134:
   var srcLen = AL.sourceDuration(src);
   if (srcLen > 0) {
    var bytesPerSec;
    for (var bufId in src.bufQueue) {
     if (bufId !== 0) {
      var buf = src.bufQueue[bufId];
      bytesPerSec = buf.frequency * buf.bytesPerSample * buf.channels;
      break;
     }
    }
    value /= bytesPerSec;
   }
   if (value < 0 || value > srcLen) {
    AL.currentCtx.err = 40963;
    return;
   }
   AL.sourceSeek(src, value);
   break;

  case 4628:
   if (value !== 0 && value !== 1 && value !== 2) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.spatialize = value;
   AL.initSourcePanner(src);
   break;

  case 8201:
  case 8202:
  case 8203:
   AL.currentCtx.err = 40964;
   break;

  case 53248:
   switch (value) {
   case 0:
   case 53249:
   case 53250:
   case 53251:
   case 53252:
   case 53253:
   case 53254:
    src.distanceModel = value;
    if (AL.currentCtx.sourceDistanceModel) {
     AL.updateContextGlobal(AL.currentCtx);
    }
    break;

   default:
    AL.currentCtx.err = 40963;
    return;
   }
   break;

  default:
   AL.currentCtx.err = 40962;
   return;
  }
 },
 captures: {},
 sharedCaptureAudioCtx: null,
 requireValidCaptureDevice: function(deviceId, funcname) {
  if (deviceId === 0) {
   AL.alcErr = 40961;
   return null;
  }
  var c = AL.captures[deviceId];
  if (!c) {
   AL.alcErr = 40961;
   return null;
  }
  var err = c.mediaStreamError;
  if (err) {
   AL.alcErr = 40961;
   return null;
  }
  return c;
 }
};

Module["AL"] = AL;

function _alcCaptureOpenDevice(pDeviceName, requestedSampleRate, format, bufferFrameCapacity) {
 var resolvedDeviceName = AL.CAPTURE_DEVICE_NAME;
 if (pDeviceName !== 0) {
  resolvedDeviceName = UTF8ToString(pDeviceName);
  if (resolvedDeviceName !== AL.CAPTURE_DEVICE_NAME) {
   AL.alcErr = 40965;
   return 0;
  }
 }
 if (bufferFrameCapacity < 0) {
  AL.alcErr = 40964;
  return 0;
 }
 navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
 var has_getUserMedia = navigator.getUserMedia || navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
 if (!has_getUserMedia) {
  AL.alcErr = 40965;
  return 0;
 }
 var AudioContext = window.AudioContext || window.webkitAudioContext;
 if (!AL.sharedCaptureAudioCtx) {
  try {
   AL.sharedCaptureAudioCtx = new AudioContext();
  } catch (e) {
   AL.alcErr = 40965;
   return 0;
  }
 }
 var outputChannelCount;
 switch (format) {
 case 65552:
 case 4353:
 case 4352:
  outputChannelCount = 1;
  break;

 case 65553:
 case 4355:
 case 4354:
  outputChannelCount = 2;
  break;

 default:
  AL.alcErr = 40964;
  return 0;
 }
 function newF32Array(cap) {
  return new Float32Array(cap);
 }
 function newI16Array(cap) {
  return new Int16Array(cap);
 }
 function newU8Array(cap) {
  return new Uint8Array(cap);
 }
 var requestedSampleType;
 var newSampleArray;
 switch (format) {
 case 65552:
 case 65553:
  requestedSampleType = "f32";
  newSampleArray = newF32Array;
  break;

 case 4353:
 case 4355:
  requestedSampleType = "i16";
  newSampleArray = newI16Array;
  break;

 case 4352:
 case 4354:
  requestedSampleType = "u8";
  newSampleArray = newU8Array;
  break;
 }
 var buffers = [];
 try {
  for (var chan = 0; chan < outputChannelCount; ++chan) {
   buffers[chan] = newSampleArray(bufferFrameCapacity);
  }
 } catch (e) {
  AL.alcErr = 40965;
  return 0;
 }
 var newCapture = {
  audioCtx: AL.sharedCaptureAudioCtx,
  deviceName: resolvedDeviceName,
  requestedSampleRate: requestedSampleRate,
  requestedSampleType: requestedSampleType,
  outputChannelCount: outputChannelCount,
  inputChannelCount: null,
  mediaStreamError: null,
  mediaStreamSourceNode: null,
  mergerNode: null,
  splitterNode: null,
  scriptProcessorNode: null,
  isCapturing: false,
  buffers: buffers,
  get bufferFrameCapacity() {
   return buffers[0].length;
  },
  capturePlayhead: 0,
  capturedFrameCount: 0
 };
 var onError = function(mediaStreamError) {
  newCapture.mediaStreamError = mediaStreamError;
 };
 var onSuccess = function(mediaStream) {
  newCapture.mediaStreamSourceNode = newCapture.audioCtx.createMediaStreamSource(mediaStream);
  var inputChannelCount = 1;
  switch (newCapture.mediaStreamSourceNode.channelCountMode) {
  case "max":
   inputChannelCount = outputChannelCount;
   break;

  case "clamped-max":
   inputChannelCount = Math.min(outputChannelCount, newCapture.mediaStreamSourceNode.channelCount);
   break;

  case "explicit":
   inputChannelCount = newCapture.mediaStreamSourceNode.channelCount;
   break;
  }
  newCapture.inputChannelCount = inputChannelCount;
  var processorFrameCount = 512;
  newCapture.scriptProcessorNode = newCapture.audioCtx.createScriptProcessor(processorFrameCount, inputChannelCount, outputChannelCount);
  if (inputChannelCount > outputChannelCount) {
   newCapture.mergerNode = newCapture.audioCtx.createChannelMerger(inputChannelCount);
   newCapture.mediaStreamSourceNode.connect(newCapture.mergerNode);
   newCapture.mergerNode.connect(newCapture.scriptProcessorNode);
  } else if (inputChannelCount < outputChannelCount) {
   newCapture.splitterNode = newCapture.audioCtx.createChannelSplitter(outputChannelCount);
   newCapture.mediaStreamSourceNode.connect(newCapture.splitterNode);
   newCapture.splitterNode.connect(newCapture.scriptProcessorNode);
  } else {
   newCapture.mediaStreamSourceNode.connect(newCapture.scriptProcessorNode);
  }
  newCapture.scriptProcessorNode.connect(newCapture.audioCtx.destination);
  newCapture.scriptProcessorNode.onaudioprocess = function(audioProcessingEvent) {
   if (!newCapture.isCapturing) {
    return;
   }
   var c = newCapture;
   var srcBuf = audioProcessingEvent.inputBuffer;
   switch (format) {
   case 65552:
    var channel0 = srcBuf.getChannelData(0);
    for (var i = 0; i < srcBuf.length; ++i) {
     var wi = (c.capturePlayhead + i) % c.bufferFrameCapacity;
     c.buffers[0][wi] = channel0[i];
    }
    break;

   case 65553:
    var channel0 = srcBuf.getChannelData(0);
    var channel1 = srcBuf.getChannelData(1);
    for (var i = 0; i < srcBuf.length; ++i) {
     var wi = (c.capturePlayhead + i) % c.bufferFrameCapacity;
     c.buffers[0][wi] = channel0[i];
     c.buffers[1][wi] = channel1[i];
    }
    break;

   case 4353:
    var channel0 = srcBuf.getChannelData(0);
    for (var i = 0; i < srcBuf.length; ++i) {
     var wi = (c.capturePlayhead + i) % c.bufferFrameCapacity;
     c.buffers[0][wi] = channel0[i] * 32767;
    }
    break;

   case 4355:
    var channel0 = srcBuf.getChannelData(0);
    var channel1 = srcBuf.getChannelData(1);
    for (var i = 0; i < srcBuf.length; ++i) {
     var wi = (c.capturePlayhead + i) % c.bufferFrameCapacity;
     c.buffers[0][wi] = channel0[i] * 32767;
     c.buffers[1][wi] = channel1[i] * 32767;
    }
    break;

   case 4352:
    var channel0 = srcBuf.getChannelData(0);
    for (var i = 0; i < srcBuf.length; ++i) {
     var wi = (c.capturePlayhead + i) % c.bufferFrameCapacity;
     c.buffers[0][wi] = (channel0[i] + 1) * 127;
    }
    break;

   case 4354:
    var channel0 = srcBuf.getChannelData(0);
    var channel1 = srcBuf.getChannelData(1);
    for (var i = 0; i < srcBuf.length; ++i) {
     var wi = (c.capturePlayhead + i) % c.bufferFrameCapacity;
     c.buffers[0][wi] = (channel0[i] + 1) * 127;
     c.buffers[1][wi] = (channel1[i] + 1) * 127;
    }
    break;
   }
   c.capturePlayhead += srcBuf.length;
   c.capturePlayhead %= c.bufferFrameCapacity;
   c.capturedFrameCount += srcBuf.length;
   c.capturedFrameCount = Math.min(c.capturedFrameCount, c.bufferFrameCapacity);
  };
 };
 if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({
   audio: true
  }).then(onSuccess).catch(onError);
 } else {
  navigator.getUserMedia({
   audio: true
  }, onSuccess, onError);
 }
 var id = AL.newId();
 AL.captures[id] = newCapture;
 return id;
}

Module["_alcCaptureOpenDevice"] = _alcCaptureOpenDevice;

function _alcCaptureCloseDevice(deviceId) {
 var c = AL.requireValidCaptureDevice(deviceId, "alcCaptureCloseDevice");
 if (!c) return false;
 delete AL.captures[deviceId];
 AL.freeIds.push(deviceId);
 if (c.mediaStreamSourceNode) c.mediaStreamSourceNode.disconnect();
 if (c.mergerNode) c.mergerNode.disconnect();
 if (c.splitterNode) c.splitterNode.disconnect();
 if (c.scriptProcessorNode) c.scriptProcessorNode.disconnect();
 delete c.buffers;
 c.capturedFrameCount = 0;
 c.isCapturing = false;
 return true;
}

Module["_alcCaptureCloseDevice"] = _alcCaptureCloseDevice;

function _alcCaptureStart(deviceId) {
 var c = AL.requireValidCaptureDevice(deviceId, "alcCaptureStart");
 if (!c) return;
 if (c.isCapturing) {
  return;
 }
 c.isCapturing = true;
 c.capturedFrameCount = 0;
 c.capturePlayhead = 0;
}

Module["_alcCaptureStart"] = _alcCaptureStart;

function _alcCaptureStop(deviceId) {
 var c = AL.requireValidCaptureDevice(deviceId, "alcCaptureStop");
 if (!c) return;
 c.isCapturing = false;
}

Module["_alcCaptureStop"] = _alcCaptureStop;

function _alcCaptureSamples(deviceId, pFrames, requestedFrameCount) {
 var c = AL.requireValidCaptureDevice(deviceId, "alcCaptureSamples");
 if (!c) return;
 if (requestedFrameCount < 0 || requestedFrameCount > c.capturedFrameCount) {
  console.error("alcCaptureSamples() with invalid bufferSize");
  AL.alcErr = 40964;
  return;
 }
 function setF32Sample(i, sample) {
  HEAPF32[pFrames + 4 * i >> 2] = sample;
 }
 function setI16Sample(i, sample) {
  HEAP16[pFrames + 2 * i >> 1] = sample;
 }
 function setU8Sample(i, sample) {
  HEAP8[pFrames + i >> 0] = sample;
 }
 var setSample;
 switch (c.requestedSampleType) {
 case "f32":
  setSample = setF32Sample;
  break;

 case "i16":
  setSample = setI16Sample;
  break;

 case "u8":
  setSample = setU8Sample;
  break;

 default:
  return;
 }
 var dstfreq = c.requestedSampleRate;
 var srcfreq = c.audioCtx.sampleRate;
 if (srcfreq == dstfreq) {
  for (var i = 0, frame_i = 0; frame_i < requestedFrameCount; ++frame_i) {
   for (var chan = 0; chan < c.buffers.length; ++chan, ++i) {
    var src_i = (frame_i + c.capturePlayhead) % c.capturedFrameCount;
    setSample(i, c.buffers[chan][src_i]);
   }
  }
 } else {
  var lerp = function(from, to, progress) {
   return (1 - progress) * from + progress * to;
  };
  for (var i = 0, frame_i = 0; frame_i < requestedFrameCount; ++frame_i) {
   var t = frame_i / dstfreq;
   var src_i = (Math.floor(t * srcfreq) + c.capturePlayhead) % c.capturedFrameCount;
   var src_next_i = (src_i + 1) % c.capturedFrameCount;
   var between = t * srcfreq - src_i;
   for (var chan = 0; chan < c.buffers.length; ++chan, ++i) {
    var cb = c.buffers[chan];
    var sample = lerp(cb[src_i], cb[src_next_i], between);
    setSample(i, sample);
   }
  }
 }
 c.capturedFrameCount = 0;
}

Module["_alcCaptureSamples"] = _alcCaptureSamples;

function _alcOpenDevice(pDeviceName) {
 if (pDeviceName) {
  var name = UTF8ToString(pDeviceName);
  if (name !== AL.DEVICE_NAME) {
   return 0;
  }
 }
 if (typeof AudioContext !== "undefined" || typeof webkitAudioContext !== "undefined") {
  var deviceId = AL.newId();
  AL.deviceRefCounts[deviceId] = 0;
  return deviceId;
 } else {
  return 0;
 }
}

Module["_alcOpenDevice"] = _alcOpenDevice;

function _alcCloseDevice(deviceId) {
 if (!(deviceId in AL.deviceRefCounts) || AL.deviceRefCounts[deviceId] > 0) {
  return 0;
 }
 delete AL.deviceRefCounts[deviceId];
 AL.freeIds.push(deviceId);
 return 1;
}

Module["_alcCloseDevice"] = _alcCloseDevice;

function _alcCreateContext(deviceId, pAttrList) {
 if (!(deviceId in AL.deviceRefCounts)) {
  AL.alcErr = 40961;
  return 0;
 }
 var options = null;
 var attrs = [];
 var hrtf = null;
 pAttrList >>= 2;
 if (pAttrList) {
  var attr = 0;
  var val = 0;
  while (true) {
   attr = HEAP32[pAttrList++];
   attrs.push(attr);
   if (attr === 0) {
    break;
   }
   val = HEAP32[pAttrList++];
   attrs.push(val);
   switch (attr) {
   case 4103:
    if (!options) {
     options = {};
    }
    options.sampleRate = val;
    break;

   case 4112:
   case 4113:
    break;

   case 6546:
    switch (val) {
    case 0:
     hrtf = false;
     break;

    case 1:
     hrtf = true;
     break;

    case 2:
     break;

    default:
     AL.alcErr = 40964;
     return 0;
    }
    break;

   case 6550:
    if (val !== 0) {
     AL.alcErr = 40964;
     return 0;
    }
    break;

   default:
    AL.alcErr = 40964;
    return 0;
   }
  }
 }
 var AudioContext = window.AudioContext || window.webkitAudioContext;
 var ac = null;
 try {
  if (options) {
   ac = new AudioContext(options);
  } else {
   ac = new AudioContext();
  }
 } catch (e) {
  if (e.name === "NotSupportedError") {
   AL.alcErr = 40964;
  } else {
   AL.alcErr = 40961;
  }
  return 0;
 }
 if (typeof ac.createGain === "undefined") {
  ac.createGain = ac.createGainNode;
 }
 var gain = ac.createGain();
 gain.connect(ac.destination);
 var ctx = {
  deviceId: deviceId,
  id: AL.newId(),
  attrs: attrs,
  audioCtx: ac,
  listener: {
   position: [ 0, 0, 0 ],
   velocity: [ 0, 0, 0 ],
   direction: [ 0, 0, 0 ],
   up: [ 0, 0, 0 ]
  },
  sources: [],
  interval: setInterval(function() {
   AL.scheduleContextAudio(ctx);
  }, AL.QUEUE_INTERVAL),
  gain: gain,
  distanceModel: 53250,
  speedOfSound: 343.3,
  dopplerFactor: 1,
  sourceDistanceModel: false,
  hrtf: hrtf || false,
  _err: 0,
  get err() {
   return this._err;
  },
  set err(val) {
   if (this._err === 0 || val === 0) {
    this._err = val;
   }
  }
 };
 AL.deviceRefCounts[deviceId]++;
 AL.contexts[ctx.id] = ctx;
 if (hrtf !== null) {
  for (var ctxId in AL.contexts) {
   var c = AL.contexts[ctxId];
   if (c.deviceId === deviceId) {
    c.hrtf = hrtf;
    AL.updateContextGlobal(c);
   }
  }
 }
 return ctx.id;
}

Module["_alcCreateContext"] = _alcCreateContext;

function _alcDestroyContext(contextId) {
 var ctx = AL.contexts[contextId];
 if (AL.currentCtx === ctx) {
  AL.alcErr = 40962;
  return;
 }
 if (AL.contexts[contextId].interval) {
  clearInterval(AL.contexts[contextId].interval);
 }
 AL.deviceRefCounts[ctx.deviceId]--;
 delete AL.contexts[contextId];
 AL.freeIds.push(contextId);
}

Module["_alcDestroyContext"] = _alcDestroyContext;

function _alcGetError(deviceId) {
 var err = AL.alcErr;
 AL.alcErr = 0;
 return err;
}

Module["_alcGetError"] = _alcGetError;

function _alcGetCurrentContext() {
 if (AL.currentCtx !== null) {
  return AL.currentCtx.id;
 } else {
  return 0;
 }
}

Module["_alcGetCurrentContext"] = _alcGetCurrentContext;

function _alcMakeContextCurrent(contextId) {
 if (contextId === 0) {
  AL.currentCtx = null;
  return 0;
 } else {
  AL.currentCtx = AL.contexts[contextId];
  return 1;
 }
}

Module["_alcMakeContextCurrent"] = _alcMakeContextCurrent;

function _alcGetContextsDevice(contextId) {
 if (contextId in AL.contexts) {
  return AL.contexts[contextId].deviceId;
 } else {
  return 0;
 }
}

Module["_alcGetContextsDevice"] = _alcGetContextsDevice;

function _alcProcessContext(contextId) {}

Module["_alcProcessContext"] = _alcProcessContext;

function _alcSuspendContext(contextId) {}

Module["_alcSuspendContext"] = _alcSuspendContext;

function _alcIsExtensionPresent(deviceId, pExtName) {
 var name = UTF8ToString(pExtName);
 return AL.ALC_EXTENSIONS[name] ? 1 : 0;
}

Module["_alcIsExtensionPresent"] = _alcIsExtensionPresent;

function _emscripten_GetAlcProcAddress() {
 if (!Module["_emscripten_GetAlcProcAddress"]) abort("external function 'emscripten_GetAlcProcAddress' is missing. perhaps a side module was not linked in? if this function was expected to arrive from a system library, try to build the MAIN_MODULE with EMCC_FORCE_STDLIBS=1 in the environment");
 return Module["_emscripten_GetAlcProcAddress"].apply(null, arguments);
}

function _alcGetProcAddress(deviceId, pProcName) {
 if (!pProcName) {
  AL.alcErr = 40964;
  return 0;
 }
 return _emscripten_GetAlcProcAddress(pProcName);
}

Module["_alcGetProcAddress"] = _alcGetProcAddress;

function _alcGetEnumValue(deviceId, pEnumName) {
 if (deviceId !== 0 && !deviceId in AL.deviceRefCounts) {
  return 0;
 } else if (!pEnumName) {
  AL.alcErr = 40964;
  return 0;
 }
 name = UTF8ToString(pEnumName);
 switch (name) {
 case "ALC_NO_ERROR":
  return 0;

 case "ALC_INVALID_DEVICE":
  return 40961;

 case "ALC_INVALID_CONTEXT":
  return 40962;

 case "ALC_INVALID_ENUM":
  return 40963;

 case "ALC_INVALID_VALUE":
  return 40964;

 case "ALC_OUT_OF_MEMORY":
  return 40965;

 case "ALC_MAJOR_VERSION":
  return 4096;

 case "ALC_MINOR_VERSION":
  return 4097;

 case "ALC_ATTRIBUTES_SIZE":
  return 4098;

 case "ALC_ALL_ATTRIBUTES":
  return 4099;

 case "ALC_DEFAULT_DEVICE_SPECIFIER":
  return 4100;

 case "ALC_DEVICE_SPECIFIER":
  return 4101;

 case "ALC_EXTENSIONS":
  return 4102;

 case "ALC_FREQUENCY":
  return 4103;

 case "ALC_REFRESH":
  return 4104;

 case "ALC_SYNC":
  return 4105;

 case "ALC_MONO_SOURCES":
  return 4112;

 case "ALC_STEREO_SOURCES":
  return 4113;

 case "ALC_CAPTURE_DEVICE_SPECIFIER":
  return 784;

 case "ALC_CAPTURE_DEFAULT_DEVICE_SPECIFIER":
  return 785;

 case "ALC_CAPTURE_SAMPLES":
  return 786;

 case "ALC_HRTF_SOFT":
  return 6546;

 case "ALC_HRTF_ID_SOFT":
  return 6550;

 case "ALC_DONT_CARE_SOFT":
  return 2;

 case "ALC_HRTF_STATUS_SOFT":
  return 6547;

 case "ALC_NUM_HRTF_SPECIFIERS_SOFT":
  return 6548;

 case "ALC_HRTF_SPECIFIER_SOFT":
  return 6549;

 case "ALC_HRTF_DISABLED_SOFT":
  return 0;

 case "ALC_HRTF_ENABLED_SOFT":
  return 1;

 case "ALC_HRTF_DENIED_SOFT":
  return 2;

 case "ALC_HRTF_REQUIRED_SOFT":
  return 3;

 case "ALC_HRTF_HEADPHONES_DETECTED_SOFT":
  return 4;

 case "ALC_HRTF_UNSUPPORTED_FORMAT_SOFT":
  return 5;

 default:
  AL.alcErr = 40964;
  return 0;
 }
}

Module["_alcGetEnumValue"] = _alcGetEnumValue;

function _alcGetString(deviceId, param) {
 if (AL.alcStringCache[param]) {
  return AL.alcStringCache[param];
 }
 var ret;
 switch (param) {
 case 0:
  ret = "No Error";
  break;

 case 40961:
  ret = "Invalid Device";
  break;

 case 40962:
  ret = "Invalid Context";
  break;

 case 40963:
  ret = "Invalid Enum";
  break;

 case 40964:
  ret = "Invalid Value";
  break;

 case 40965:
  ret = "Out of Memory";
  break;

 case 4100:
  if (typeof AudioContext !== "undefined" || typeof webkitAudioContext !== "undefined") {
   ret = AL.DEVICE_NAME;
  } else {
   return 0;
  }
  break;

 case 4101:
  if (typeof AudioContext !== "undefined" || typeof webkitAudioContext !== "undefined") {
   ret = AL.DEVICE_NAME.concat("\0");
  } else {
   ret = "\0";
  }
  break;

 case 785:
  ret = AL.CAPTURE_DEVICE_NAME;
  break;

 case 784:
  if (deviceId === 0) ret = AL.CAPTURE_DEVICE_NAME.concat("\0"); else {
   var c = AL.requireValidCaptureDevice(deviceId, "alcGetString");
   if (!c) {
    return 0;
   }
   ret = c.deviceName;
  }
  break;

 case 4102:
  if (!deviceId) {
   AL.alcErr = 40961;
   return 0;
  }
  ret = "";
  for (var ext in AL.ALC_EXTENSIONS) {
   ret = ret.concat(ext);
   ret = ret.concat(" ");
  }
  ret = ret.trim();
  break;

 default:
  AL.alcErr = 40963;
  return 0;
 }
 ret = allocate(intArrayFromString(ret), "i8", ALLOC_NORMAL);
 AL.alcStringCache[param] = ret;
 return ret;
}

Module["_alcGetString"] = _alcGetString;

function _alcGetIntegerv(deviceId, param, size, pValues) {
 if (size === 0 || !pValues) {
  return;
 }
 switch (param) {
 case 4096:
  HEAP32[pValues >> 2] = 1;
  break;

 case 4097:
  HEAP32[pValues >> 2] = 1;
  break;

 case 4098:
  if (!deviceId in AL.deviceRefCounts) {
   AL.alcErr = 40961;
   return;
  }
  if (!AL.currentCtx) {
   AL.alcErr = 40962;
   return;
  }
  HEAP32[pValues >> 2] = AL.currentCtx.attrs.length;
  break;

 case 4099:
  if (!deviceId in AL.deviceRefCounts) {
   AL.alcErr = 40961;
   return;
  }
  if (!AL.currentCtx) {
   AL.alcErr = 40962;
   return;
  }
  for (var i = 0; i < AL.currentCtx.attrs.length; i++) {
   HEAP32[pValues + i * 4 >> 2] = AL.currentCtx.attrs[i];
  }
  break;

 case 4103:
  if (!deviceId in AL.deviceRefCounts) {
   AL.alcErr = 40961;
   return;
  }
  if (!AL.currentCtx) {
   AL.alcErr = 40962;
   return;
  }
  HEAP32[pValues >> 2] = AL.currentCtx.audioCtx.sampleRate;
  break;

 case 4112:
 case 4113:
  if (!deviceId in AL.deviceRefCounts) {
   AL.alcErr = 40961;
   return;
  }
  if (!AL.currentCtx) {
   AL.alcErr = 40962;
   return;
  }
  HEAP32[pValues >> 2] = 2147483647;
  break;

 case 6546:
 case 6547:
  if (!deviceId in AL.deviceRefCounts) {
   AL.alcErr = 40961;
   return;
  }
  var hrtfStatus = 0;
  for (var ctxId in AL.contexts) {
   var ctx = AL.contexts[ctxId];
   if (ctx.deviceId === deviceId) {
    hrtfStatus = ctx.hrtf ? 1 : 0;
   }
  }
  HEAP32[pValues >> 2] = hrtfStatus;
  break;

 case 6548:
  if (!deviceId in AL.deviceRefCounts) {
   AL.alcErr = 40961;
   return;
  }
  HEAP32[pValues >> 2] = 1;
  break;

 case 131075:
  if (!deviceId in AL.deviceRefCounts) {
   AL.alcErr = 40961;
   return;
  }
  if (!AL.currentCtx) {
   AL.alcErr = 40962;
   return;
  }
  HEAP32[pValues >> 2] = 1;

 case 786:
  var c = AL.requireValidCaptureDevice(deviceId, "alcGetIntegerv");
  if (!c) {
   return;
  }
  var n = c.capturedFrameCount;
  var dstfreq = c.requestedSampleRate;
  var srcfreq = c.audioCtx.sampleRate;
  var nsamples = Math.floor(n * (dstfreq / srcfreq));
  HEAP32[pValues >> 2] = nsamples;
  break;

 default:
  AL.alcErr = 40963;
  return;
 }
}

Module["_alcGetIntegerv"] = _alcGetIntegerv;

function _emscripten_alcDevicePauseSOFT(deviceId) {
 if (!deviceId in AL.deviceRefCounts) {
  AL.alcErr = 40961;
  return;
 }
 if (AL.paused) {
  return;
 }
 AL.paused = true;
 for (ctxId in AL.contexts) {
  var ctx = AL.contexts[ctxId];
  if (ctx.deviceId !== deviceId) {
   continue;
  }
  ctx.audioCtx.suspend();
  clearInterval(ctx.interval);
  ctx.interval = null;
 }
}

Module["_emscripten_alcDevicePauseSOFT"] = _emscripten_alcDevicePauseSOFT;

function _emscripten_alcDeviceResumeSOFT(deviceId) {
 if (!deviceId in AL.deviceRefCounts) {
  AL.alcErr = 40961;
  return;
 }
 if (!AL.paused) {
  return;
 }
 AL.paused = false;
 for (ctxId in AL.contexts) {
  var ctx = AL.contexts[ctxId];
  if (ctx.deviceId !== deviceId) {
   continue;
  }
  ctx.interval = setInterval(function() {
   AL.scheduleContextAudio(ctx);
  }, AL.QUEUE_INTERVAL);
  ctx.audioCtx.resume();
 }
}

Module["_emscripten_alcDeviceResumeSOFT"] = _emscripten_alcDeviceResumeSOFT;

function _emscripten_alcGetStringiSOFT(deviceId, param, index) {
 if (!deviceId in AL.deviceRefCounts) {
  AL.alcErr = 40961;
  return 0;
 }
 if (AL.alcStringCache[param]) {
  return AL.alcStringCache[param];
 }
 var ret;
 switch (param) {
 case 6549:
  if (index === 0) {
   ret = "Web Audio HRTF";
  } else {
   AL.alcErr = 40964;
   return 0;
  }

 default:
  if (index === 0) {
   return _alcGetString(deviceId, param);
  } else {
   AL.alcErr = 40963;
   return 0;
  }
 }
 ret = allocate(intArrayFromString(ret), "i8", ALLOC_NORMAL);
 AL.alcStringCache[param] = ret;
 return ret;
}

Module["_emscripten_alcGetStringiSOFT"] = _emscripten_alcGetStringiSOFT;

function _emscripten_alcResetDeviceSOFT(deviceId, pAttrList) {
 if (!deviceId in AL.deviceRefCounts) {
  AL.alcErr = 40961;
  return 0;
 }
 var hrtf = null;
 pAttrList >>= 2;
 if (pAttrList) {
  var attr = 0;
  var val = 0;
  while (true) {
   attr = HEAP32[pAttrList++];
   if (attr === 0) {
    break;
   }
   val = HEAP32[pAttrList++];
   switch (attr) {
   case 6546:
    if (val === 1) {
     hrtf = true;
    } else if (val === 0) {
     hrtf = false;
    }
    break;
   }
  }
 }
 if (hrtf !== null) {
  for (var ctxId in AL.contexts) {
   var ctx = AL.contexts[ctxId];
   if (ctx.deviceId === deviceId) {
    ctx.hrtf = hrtf;
    AL.updateContextGlobal(ctx);
   }
  }
 }
 return 1;
}

Module["_emscripten_alcResetDeviceSOFT"] = _emscripten_alcResetDeviceSOFT;

function _alGenBuffers(count, pBufferIds) {
 if (!AL.currentCtx) {
  return;
 }
 for (var i = 0; i < count; ++i) {
  var buf = {
   deviceId: AL.currentCtx.deviceId,
   id: AL.newId(),
   refCount: 0,
   audioBuf: null,
   frequency: 0,
   bytesPerSample: 2,
   channels: 1,
   length: 0
  };
  AL.deviceRefCounts[buf.deviceId]++;
  AL.buffers[buf.id] = buf;
  HEAP32[pBufferIds + i * 4 >> 2] = buf.id;
 }
}

Module["_alGenBuffers"] = _alGenBuffers;

function _alDeleteBuffers(count, pBufferIds) {
 if (!AL.currentCtx) {
  return;
 }
 for (var i = 0; i < count; ++i) {
  var bufId = HEAP32[pBufferIds + i * 4 >> 2];
  if (bufId === 0) {
   continue;
  }
  if (!AL.buffers[bufId]) {
   AL.currentCtx.err = 40961;
   return;
  }
  if (AL.buffers[bufId].refCount) {
   AL.currentCtx.err = 40964;
   return;
  }
 }
 for (var i = 0; i < count; ++i) {
  var bufId = HEAP32[pBufferIds + i * 4 >> 2];
  if (bufId === 0) {
   continue;
  }
  AL.deviceRefCounts[AL.buffers[bufId].deviceId]--;
  delete AL.buffers[bufId];
  AL.freeIds.push(bufId);
 }
}

Module["_alDeleteBuffers"] = _alDeleteBuffers;

function _alGenSources(count, pSourceIds) {
 if (!AL.currentCtx) {
  return;
 }
 for (var i = 0; i < count; ++i) {
  var gain = AL.currentCtx.audioCtx.createGain();
  gain.connect(AL.currentCtx.gain);
  var src = {
   context: AL.currentCtx,
   id: AL.newId(),
   type: 4144,
   state: 4113,
   bufQueue: [ AL.buffers[0] ],
   audioQueue: [],
   looping: false,
   pitch: 1,
   dopplerShift: 1,
   gain: gain,
   minGain: 0,
   maxGain: 1,
   panner: null,
   bufsProcessed: 0,
   bufStartTime: Number.NEGATIVE_INFINITY,
   bufOffset: 0,
   relative: false,
   refDistance: 1,
   maxDistance: 3.40282e38,
   rolloffFactor: 1,
   position: [ 0, 0, 0 ],
   velocity: [ 0, 0, 0 ],
   direction: [ 0, 0, 0 ],
   coneOuterGain: 0,
   coneInnerAngle: 360,
   coneOuterAngle: 360,
   distanceModel: 53250,
   spatialize: 2,
   get playbackRate() {
    return this.pitch * this.dopplerShift;
   }
  };
  AL.currentCtx.sources[src.id] = src;
  HEAP32[pSourceIds + i * 4 >> 2] = src.id;
 }
}

Module["_alGenSources"] = _alGenSources;

function _alSourcei(sourceId, param, value) {
 switch (param) {
 case 514:
 case 4097:
 case 4098:
 case 4103:
 case 4105:
 case 4128:
 case 4129:
 case 4131:
 case 4132:
 case 4133:
 case 4134:
 case 4628:
 case 8201:
 case 8202:
 case 53248:
  AL.setSourceParam("alSourcei", sourceId, param, value);
  break;

 default:
  AL.setSourceParam("alSourcei", sourceId, param, null);
  break;
 }
}

Module["_alSourcei"] = _alSourcei;

function _alDeleteSources(count, pSourceIds) {
 if (!AL.currentCtx) {
  return;
 }
 for (var i = 0; i < count; ++i) {
  var srcId = HEAP32[pSourceIds + i * 4 >> 2];
  if (!AL.currentCtx.sources[srcId]) {
   AL.currentCtx.err = 40961;
   return;
  }
 }
 for (var i = 0; i < count; ++i) {
  var srcId = HEAP32[pSourceIds + i * 4 >> 2];
  AL.setSourceState(AL.currentCtx.sources[srcId], 4116);
  _alSourcei(srcId, 4105, 0);
  delete AL.currentCtx.sources[srcId];
  AL.freeIds.push(srcId);
 }
}

Module["_alDeleteSources"] = _alDeleteSources;

function _alGetError() {
 if (!AL.currentCtx) {
  return 40964;
 } else {
  var err = AL.currentCtx.err;
  AL.currentCtx.err = 0;
  return err;
 }
}

Module["_alGetError"] = _alGetError;

function _alIsExtensionPresent(pExtName) {
 name = UTF8ToString(pExtName);
 return AL.AL_EXTENSIONS[name] ? 1 : 0;
}

Module["_alIsExtensionPresent"] = _alIsExtensionPresent;

function _emscripten_GetAlProcAddress() {
 if (!Module["_emscripten_GetAlProcAddress"]) abort("external function 'emscripten_GetAlProcAddress' is missing. perhaps a side module was not linked in? if this function was expected to arrive from a system library, try to build the MAIN_MODULE with EMCC_FORCE_STDLIBS=1 in the environment");
 return Module["_emscripten_GetAlProcAddress"].apply(null, arguments);
}

function _alGetProcAddress(pProcName) {
 if (!AL.currentCtx) {
  return;
 }
 if (!pProcName) {
  AL.currentCtx.err = 40963;
  return 0;
 }
 return _emscripten_GetAlProcAddress(pProcName);
}

Module["_alGetProcAddress"] = _alGetProcAddress;

function _alGetEnumValue(pEnumName) {
 if (!AL.currentCtx) {
  return 0;
 }
 if (!pEnumName) {
  AL.currentCtx.err = 40963;
  return 0;
 }
 name = UTF8ToString(pEnumName);
 switch (name) {
 case "AL_BITS":
  return 8194;

 case "AL_BUFFER":
  return 4105;

 case "AL_BUFFERS_PROCESSED":
  return 4118;

 case "AL_BUFFERS_QUEUED":
  return 4117;

 case "AL_BYTE_OFFSET":
  return 4134;

 case "AL_CHANNELS":
  return 8195;

 case "AL_CONE_INNER_ANGLE":
  return 4097;

 case "AL_CONE_OUTER_ANGLE":
  return 4098;

 case "AL_CONE_OUTER_GAIN":
  return 4130;

 case "AL_DIRECTION":
  return 4101;

 case "AL_DISTANCE_MODEL":
  return 53248;

 case "AL_DOPPLER_FACTOR":
  return 49152;

 case "AL_DOPPLER_VELOCITY":
  return 49153;

 case "AL_EXPONENT_DISTANCE":
  return 53253;

 case "AL_EXPONENT_DISTANCE_CLAMPED":
  return 53254;

 case "AL_EXTENSIONS":
  return 45060;

 case "AL_FORMAT_MONO16":
  return 4353;

 case "AL_FORMAT_MONO8":
  return 4352;

 case "AL_FORMAT_STEREO16":
  return 4355;

 case "AL_FORMAT_STEREO8":
  return 4354;

 case "AL_FREQUENCY":
  return 8193;

 case "AL_GAIN":
  return 4106;

 case "AL_INITIAL":
  return 4113;

 case "AL_INVALID":
  return -1;

 case "AL_ILLEGAL_ENUM":
 case "AL_INVALID_ENUM":
  return 40962;

 case "AL_INVALID_NAME":
  return 40961;

 case "AL_ILLEGAL_COMMAND":
 case "AL_INVALID_OPERATION":
  return 40964;

 case "AL_INVALID_VALUE":
  return 40963;

 case "AL_INVERSE_DISTANCE":
  return 53249;

 case "AL_INVERSE_DISTANCE_CLAMPED":
  return 53250;

 case "AL_LINEAR_DISTANCE":
  return 53251;

 case "AL_LINEAR_DISTANCE_CLAMPED":
  return 53252;

 case "AL_LOOPING":
  return 4103;

 case "AL_MAX_DISTANCE":
  return 4131;

 case "AL_MAX_GAIN":
  return 4110;

 case "AL_MIN_GAIN":
  return 4109;

 case "AL_NONE":
  return 0;

 case "AL_NO_ERROR":
  return 0;

 case "AL_ORIENTATION":
  return 4111;

 case "AL_OUT_OF_MEMORY":
  return 40965;

 case "AL_PAUSED":
  return 4115;

 case "AL_PENDING":
  return 8209;

 case "AL_PITCH":
  return 4099;

 case "AL_PLAYING":
  return 4114;

 case "AL_POSITION":
  return 4100;

 case "AL_PROCESSED":
  return 8210;

 case "AL_REFERENCE_DISTANCE":
  return 4128;

 case "AL_RENDERER":
  return 45059;

 case "AL_ROLLOFF_FACTOR":
  return 4129;

 case "AL_SAMPLE_OFFSET":
  return 4133;

 case "AL_SEC_OFFSET":
  return 4132;

 case "AL_SIZE":
  return 8196;

 case "AL_SOURCE_RELATIVE":
  return 514;

 case "AL_SOURCE_STATE":
  return 4112;

 case "AL_SOURCE_TYPE":
  return 4135;

 case "AL_SPEED_OF_SOUND":
  return 49155;

 case "AL_STATIC":
  return 4136;

 case "AL_STOPPED":
  return 4116;

 case "AL_STREAMING":
  return 4137;

 case "AL_UNDETERMINED":
  return 4144;

 case "AL_UNUSED":
  return 8208;

 case "AL_VELOCITY":
  return 4102;

 case "AL_VENDOR":
  return 45057;

 case "AL_VERSION":
  return 45058;

 case "AL_AUTO_SOFT":
  return 2;

 case "AL_SOURCE_DISTANCE_MODEL":
  return 512;

 case "AL_SOURCE_SPATIALIZE_SOFT":
  return 4628;

 case "AL_LOOP_POINTS_SOFT":
  return 8213;

 case "AL_BYTE_LENGTH_SOFT":
  return 8201;

 case "AL_SAMPLE_LENGTH_SOFT":
  return 8202;

 case "AL_SEC_LENGTH_SOFT":
  return 8203;

 case "AL_FORMAT_MONO_FLOAT32":
  return 65552;

 case "AL_FORMAT_STEREO_FLOAT32":
  return 65553;

 default:
  AL.currentCtx.err = 40963;
  return 0;
 }
}

Module["_alGetEnumValue"] = _alGetEnumValue;

function _alGetString(param) {
 if (!AL.currentCtx) {
  return 0;
 }
 if (AL.stringCache[param]) {
  return AL.stringCache[param];
 }
 var ret;
 switch (param) {
 case 0:
  ret = "No Error";
  break;

 case 40961:
  ret = "Invalid Name";
  break;

 case 40962:
  ret = "Invalid Enum";
  break;

 case 40963:
  ret = "Invalid Value";
  break;

 case 40964:
  ret = "Invalid Operation";
  break;

 case 40965:
  ret = "Out of Memory";
  break;

 case 45057:
  ret = "Emscripten";
  break;

 case 45058:
  ret = "1.1";
  break;

 case 45059:
  ret = "WebAudio";
  break;

 case 45060:
  ret = "";
  for (var ext in AL.AL_EXTENSIONS) {
   ret = ret.concat(ext);
   ret = ret.concat(" ");
  }
  ret = ret.trim();
  break;

 default:
  AL.currentCtx.err = 40962;
  return 0;
 }
 ret = allocate(intArrayFromString(ret), "i8", ALLOC_NORMAL);
 AL.stringCache[param] = ret;
 return ret;
}

Module["_alGetString"] = _alGetString;

function _alEnable(param) {
 if (!AL.currentCtx) {
  return;
 }
 switch (param) {
 case "AL_SOURCE_DISTANCE_MODEL":
  AL.currentCtx.sourceDistanceModel = true;
  AL.updateContextGlobal(AL.currentCtx);
  break;

 default:
  AL.currentCtx.err = 40962;
  return;
 }
}

Module["_alEnable"] = _alEnable;

function _alDisable(param) {
 if (!AL.currentCtx) {
  return;
 }
 switch (pname) {
 case "AL_SOURCE_DISTANCE_MODEL":
  AL.currentCtx.sourceDistanceModel = false;
  AL.updateContextGlobal(AL.currentCtx);
  break;

 default:
  AL.currentCtx.err = 40962;
  return;
 }
}

Module["_alDisable"] = _alDisable;

function _alIsEnabled(param) {
 if (!AL.currentCtx) {
  return 0;
 }
 switch (pname) {
 case "AL_SOURCE_DISTANCE_MODEL":
  return AL.currentCtx.sourceDistanceModel ? 0 : 1;

 default:
  AL.currentCtx.err = 40962;
  return 0;
 }
}

Module["_alIsEnabled"] = _alIsEnabled;

function _alGetDouble(param) {
 var val = AL.getGlobalParam("alGetDouble", param);
 if (val === null) {
  return 0;
 }
 switch (param) {
 case 49152:
 case 49155:
 case 53248:
  return val;

 default:
  AL.currentCtx.err = 40962;
  return 0;
 }
}

Module["_alGetDouble"] = _alGetDouble;

function _alGetDoublev(param, pValues) {
 var val = AL.getGlobalParam("alGetDoublev", param);
 if (val === null || !pValues) {
  return;
 }
 switch (param) {
 case 49152:
 case 49155:
 case 53248:
  HEAPF64[pValues >> 3] = val;
  break;

 default:
  AL.currentCtx.err = 40962;
  return;
 }
}

Module["_alGetDoublev"] = _alGetDoublev;

function _alGetFloat(param) {
 var val = AL.getGlobalParam("alGetFloat", param);
 if (val === null) {
  return 0;
 }
 switch (param) {
 case 49152:
 case 49155:
 case 53248:
  return val;

 default:
  return 0;
 }
}

Module["_alGetFloat"] = _alGetFloat;

function _alGetFloatv(param, pValues) {
 var val = AL.getGlobalParam("alGetFloatv", param);
 if (val === null || !pValues) {
  return;
 }
 switch (param) {
 case 49152:
 case 49155:
 case 53248:
  HEAPF32[pValues >> 2] = val;
  break;

 default:
  AL.currentCtx.err = 40962;
  return;
 }
}

Module["_alGetFloatv"] = _alGetFloatv;

function _alGetInteger(param) {
 var val = AL.getGlobalParam("alGetInteger", param);
 if (val === null) {
  return 0;
 }
 switch (param) {
 case 49152:
 case 49155:
 case 53248:
  return val;

 default:
  AL.currentCtx.err = 40962;
  return 0;
 }
}

Module["_alGetInteger"] = _alGetInteger;

function _alGetIntegerv(param, pValues) {
 var val = AL.getGlobalParam("alGetIntegerv", param);
 if (val === null || !pValues) {
  return;
 }
 switch (param) {
 case 49152:
 case 49155:
 case 53248:
  HEAP32[pValues >> 2] = val;
  break;

 default:
  AL.currentCtx.err = 40962;
  return;
 }
}

Module["_alGetIntegerv"] = _alGetIntegerv;

function _alGetBoolean(param) {
 var val = AL.getGlobalParam("alGetBoolean", param);
 if (val === null) {
  return 0;
 }
 switch (param) {
 case 49152:
 case 49155:
 case 53248:
  return val !== 0 ? 1 : 0;

 default:
  AL.currentCtx.err = 40962;
  return 0;
 }
}

Module["_alGetBoolean"] = _alGetBoolean;

function _alGetBooleanv(param, pValues) {
 var val = AL.getGlobalParam("alGetBooleanv", param);
 if (val === null || !pValues) {
  return;
 }
 switch (param) {
 case 49152:
 case 49155:
 case 53248:
  HEAP8[pValues >> 0] = val;
  break;

 default:
  AL.currentCtx.err = 40962;
  return;
 }
}

Module["_alGetBooleanv"] = _alGetBooleanv;

function _alDistanceModel(model) {
 AL.setGlobalParam("alDistanceModel", 53248, model);
}

Module["_alDistanceModel"] = _alDistanceModel;

function _alSpeedOfSound(value) {
 AL.setGlobalParam("alSpeedOfSound", 49155, value);
}

Module["_alSpeedOfSound"] = _alSpeedOfSound;

function _alDopplerFactor(value) {
 AL.setGlobalParam("alDopplerFactor", 49152, value);
}

Module["_alDopplerFactor"] = _alDopplerFactor;

function _alDopplerVelocity(value) {
 warnOnce("alDopplerVelocity() is deprecated, and only kept for compatibility with OpenAL 1.0. Use alSpeedOfSound() instead.");
 if (!AL.currentCtx) {
  return;
 }
 if (value <= 0) {
  AL.currentCtx.err = 40963;
  return;
 }
}

Module["_alDopplerVelocity"] = _alDopplerVelocity;

function _alGetListenerf(param, pValue) {
 var val = AL.getListenerParam("alGetListenerf", param);
 if (val === null) {
  return;
 }
 if (!pValue) {
  AL.currentCtx.err = 40963;
  return;
 }
 switch (param) {
 case 4106:
  HEAPF32[pValue >> 2] = val;
  break;

 default:
  AL.currentCtx.err = 40962;
  return;
 }
}

Module["_alGetListenerf"] = _alGetListenerf;

function _alGetListener3f(param, pValue0, pValue1, pValue2) {
 var val = AL.getListenerParam("alGetListener3f", param);
 if (val === null) {
  return;
 }
 if (!pValue0 || !pValue1 || !pValue2) {
  AL.currentCtx.err = 40963;
  return;
 }
 switch (param) {
 case 4100:
 case 4102:
  HEAPF32[pValue0 >> 2] = val[0];
  HEAPF32[pValue1 >> 2] = val[1];
  HEAPF32[pValue2 >> 2] = val[2];
  break;

 default:
  AL.currentCtx.err = 40962;
  return;
 }
}

Module["_alGetListener3f"] = _alGetListener3f;

function _alGetListenerfv(param, pValues) {
 var val = AL.getListenerParam("alGetListenerfv", param);
 if (val === null) {
  return;
 }
 if (!pValues) {
  AL.currentCtx.err = 40963;
  return;
 }
 switch (param) {
 case 4100:
 case 4102:
  HEAPF32[pValues >> 2] = val[0];
  HEAPF32[pValues + 4 >> 2] = val[1];
  HEAPF32[pValues + 8 >> 2] = val[2];
  break;

 case 4111:
  HEAPF32[pValues >> 2] = val[0];
  HEAPF32[pValues + 4 >> 2] = val[1];
  HEAPF32[pValues + 8 >> 2] = val[2];
  HEAPF32[pValues + 12 >> 2] = val[3];
  HEAPF32[pValues + 16 >> 2] = val[4];
  HEAPF32[pValues + 20 >> 2] = val[5];
  break;

 default:
  AL.currentCtx.err = 40962;
  return;
 }
}

Module["_alGetListenerfv"] = _alGetListenerfv;

function _alGetListeneri(param, pValue) {
 var val = AL.getListenerParam("alGetListeneri", param);
 if (val === null) {
  return;
 }
 if (!pValue) {
  AL.currentCtx.err = 40963;
  return;
 }
 AL.currentCtx.err = 40962;
}

Module["_alGetListeneri"] = _alGetListeneri;

function _alGetListener3i(param, pValue0, pValue1, pValue2) {
 var val = AL.getListenerParam("alGetListener3i", param);
 if (val === null) {
  return;
 }
 if (!pValue0 || !pValue1 || !pValue2) {
  AL.currentCtx.err = 40963;
  return;
 }
 switch (param) {
 case 4100:
 case 4102:
  HEAP32[pValue0 >> 2] = val[0];
  HEAP32[pValue1 >> 2] = val[1];
  HEAP32[pValue2 >> 2] = val[2];
  break;

 default:
  AL.currentCtx.err = 40962;
  return;
 }
}

Module["_alGetListener3i"] = _alGetListener3i;

function _alGetListeneriv(param, pValues) {
 var val = AL.getListenerParam("alGetListeneriv", param);
 if (val === null) {
  return;
 }
 if (!pValues) {
  AL.currentCtx.err = 40963;
  return;
 }
 switch (param) {
 case 4100:
 case 4102:
  HEAP32[pValues >> 2] = val[0];
  HEAP32[pValues + 4 >> 2] = val[1];
  HEAP32[pValues + 8 >> 2] = val[2];
  break;

 case 4111:
  HEAP32[pValues >> 2] = val[0];
  HEAP32[pValues + 4 >> 2] = val[1];
  HEAP32[pValues + 8 >> 2] = val[2];
  HEAP32[pValues + 12 >> 2] = val[3];
  HEAP32[pValues + 16 >> 2] = val[4];
  HEAP32[pValues + 20 >> 2] = val[5];
  break;

 default:
  AL.currentCtx.err = 40962;
  return;
 }
}

Module["_alGetListeneriv"] = _alGetListeneriv;

function _alListenerf(param, value) {
 switch (param) {
 case 4106:
  AL.setListenerParam("alListenerf", param, value);
  break;

 default:
  AL.setListenerParam("alListenerf", param, null);
  break;
 }
}

Module["_alListenerf"] = _alListenerf;

function _alListener3f(param, value0, value1, value2) {
 switch (param) {
 case 4100:
 case 4102:
  AL.paramArray[0] = value0;
  AL.paramArray[1] = value1;
  AL.paramArray[2] = value2;
  AL.setListenerParam("alListener3f", param, AL.paramArray);
  break;

 default:
  AL.setListenerParam("alListener3f", param, null);
  break;
 }
}

Module["_alListener3f"] = _alListener3f;

function _alListenerfv(param, pValues) {
 if (!AL.currentCtx) {
  return;
 }
 if (!pValues) {
  AL.currentCtx.err = 40963;
  return;
 }
 switch (param) {
 case 4100:
 case 4102:
  AL.paramArray[0] = HEAPF32[pValues >> 2];
  AL.paramArray[1] = HEAPF32[pValues + 4 >> 2];
  AL.paramArray[2] = HEAPF32[pValues + 8 >> 2];
  AL.setListenerParam("alListenerfv", param, AL.paramArray);
  break;

 case 4111:
  AL.paramArray[0] = HEAPF32[pValues >> 2];
  AL.paramArray[1] = HEAPF32[pValues + 4 >> 2];
  AL.paramArray[2] = HEAPF32[pValues + 8 >> 2];
  AL.paramArray[3] = HEAPF32[pValues + 12 >> 2];
  AL.paramArray[4] = HEAPF32[pValues + 16 >> 2];
  AL.paramArray[5] = HEAPF32[pValues + 20 >> 2];
  AL.setListenerParam("alListenerfv", param, AL.paramArray);
  break;

 default:
  AL.setListenerParam("alListenerfv", param, null);
  break;
 }
}

Module["_alListenerfv"] = _alListenerfv;

function _alListeneri(param, value) {
 AL.setListenerParam("alListeneri", param, null);
}

Module["_alListeneri"] = _alListeneri;

function _alListener3i(param, value0, value1, value2) {
 switch (param) {
 case 4100:
 case 4102:
  AL.paramArray[0] = value0;
  AL.paramArray[1] = value1;
  AL.paramArray[2] = value2;
  AL.setListenerParam("alListener3i", param, AL.paramArray);
  break;

 default:
  AL.setListenerParam("alListener3i", param, null);
  break;
 }
}

Module["_alListener3i"] = _alListener3i;

function _alListeneriv(param, pValues) {
 if (!AL.currentCtx) {
  return;
 }
 if (!pValues) {
  AL.currentCtx.err = 40963;
  return;
 }
 switch (param) {
 case 4100:
 case 4102:
  AL.paramArray[0] = HEAP32[pValues >> 2];
  AL.paramArray[1] = HEAP32[pValues + 4 >> 2];
  AL.paramArray[2] = HEAP32[pValues + 8 >> 2];
  AL.setListenerParam("alListeneriv", param, AL.paramArray);
  break;

 case 4111:
  AL.paramArray[0] = HEAP32[pValues >> 2];
  AL.paramArray[1] = HEAP32[pValues + 4 >> 2];
  AL.paramArray[2] = HEAP32[pValues + 8 >> 2];
  AL.paramArray[3] = HEAP32[pValues + 12 >> 2];
  AL.paramArray[4] = HEAP32[pValues + 16 >> 2];
  AL.paramArray[5] = HEAP32[pValues + 20 >> 2];
  AL.setListenerParam("alListeneriv", param, AL.paramArray);
  break;

 default:
  AL.setListenerParam("alListeneriv", param, null);
  break;
 }
}

Module["_alListeneriv"] = _alListeneriv;

function _alIsBuffer(bufferId) {
 if (!AL.currentCtx) {
  return false;
 }
 if (bufferId > AL.buffers.length) {
  return false;
 }
 if (!AL.buffers[bufferId]) {
  return false;
 } else {
  return true;
 }
}

Module["_alIsBuffer"] = _alIsBuffer;

function _alBufferData(bufferId, format, pData, size, freq) {
 if (!AL.currentCtx) {
  return;
 }
 var buf = AL.buffers[bufferId];
 if (!buf) {
  AL.currentCtx.err = 40963;
  return;
 }
 if (freq <= 0) {
  AL.currentCtx.err = 40963;
  return;
 }
 var audioBuf = null;
 try {
  switch (format) {
  case 4352:
   if (size > 0) {
    audioBuf = AL.currentCtx.audioCtx.createBuffer(1, size, freq);
    var channel0 = audioBuf.getChannelData(0);
    for (var i = 0; i < size; ++i) {
     channel0[i] = HEAPU8[pData++] * .0078125 - 1;
    }
   }
   buf.bytesPerSample = 1;
   buf.channels = 1;
   buf.length = size;
   break;

  case 4353:
   if (size > 0) {
    audioBuf = AL.currentCtx.audioCtx.createBuffer(1, size >> 1, freq);
    var channel0 = audioBuf.getChannelData(0);
    pData >>= 1;
    for (var i = 0; i < size >> 1; ++i) {
     channel0[i] = HEAP16[pData++] * 30517578125e-15;
    }
   }
   buf.bytesPerSample = 2;
   buf.channels = 1;
   buf.length = size >> 1;
   break;

  case 4354:
   if (size > 0) {
    audioBuf = AL.currentCtx.audioCtx.createBuffer(2, size >> 1, freq);
    var channel0 = audioBuf.getChannelData(0);
    var channel1 = audioBuf.getChannelData(1);
    for (var i = 0; i < size >> 1; ++i) {
     channel0[i] = HEAPU8[pData++] * .0078125 - 1;
     channel1[i] = HEAPU8[pData++] * .0078125 - 1;
    }
   }
   buf.bytesPerSample = 1;
   buf.channels = 2;
   buf.length = size >> 1;
   break;

  case 4355:
   if (size > 0) {
    audioBuf = AL.currentCtx.audioCtx.createBuffer(2, size >> 2, freq);
    var channel0 = audioBuf.getChannelData(0);
    var channel1 = audioBuf.getChannelData(1);
    pData >>= 1;
    for (var i = 0; i < size >> 2; ++i) {
     channel0[i] = HEAP16[pData++] * 30517578125e-15;
     channel1[i] = HEAP16[pData++] * 30517578125e-15;
    }
   }
   buf.bytesPerSample = 2;
   buf.channels = 2;
   buf.length = size >> 2;
   break;

  case 65552:
   if (size > 0) {
    audioBuf = AL.currentCtx.audioCtx.createBuffer(1, size >> 2, freq);
    var channel0 = audioBuf.getChannelData(0);
    pData >>= 2;
    for (var i = 0; i < size >> 2; ++i) {
     channel0[i] = HEAPF32[pData++];
    }
   }
   buf.bytesPerSample = 4;
   buf.channels = 1;
   buf.length = size >> 2;
   break;

  case 65553:
   if (size > 0) {
    audioBuf = AL.currentCtx.audioCtx.createBuffer(2, size >> 3, freq);
    var channel0 = audioBuf.getChannelData(0);
    var channel1 = audioBuf.getChannelData(1);
    pData >>= 2;
    for (var i = 0; i < size >> 3; ++i) {
     channel0[i] = HEAPF32[pData++];
     channel1[i] = HEAPF32[pData++];
    }
   }
   buf.bytesPerSample = 4;
   buf.channels = 2;
   buf.length = size >> 3;
   break;

  default:
   AL.currentCtx.err = 40963;
   return;
  }
  buf.frequency = freq;
  buf.audioBuf = audioBuf;
 } catch (e) {
  AL.currentCtx.err = 40963;
  return;
 }
}

Module["_alBufferData"] = _alBufferData;

function _alGetBufferf(bufferId, param, pValue) {
 var val = AL.getBufferParam("alGetBufferf", bufferId, param);
 if (val === null) {
  return;
 }
 if (!pValue) {
  AL.currentCtx.err = 40963;
  return;
 }
 AL.currentCtx.err = 40962;
}

Module["_alGetBufferf"] = _alGetBufferf;

function _alGetBuffer3f(bufferId, param, pValue0, pValue1, pValue2) {
 var val = AL.getBufferParam("alGetBuffer3f", bufferId, param);
 if (val === null) {
  return;
 }
 if (!pValue0 || !pValue1 || !pValue2) {
  AL.currentCtx.err = 40963;
  return;
 }
 AL.currentCtx.err = 40962;
}

Module["_alGetBuffer3f"] = _alGetBuffer3f;

function _alGetBufferfv(bufferId, param, pValues) {
 var val = AL.getBufferParam("alGetBufferfv", bufferId, param);
 if (val === null) {
  return;
 }
 if (!pValues) {
  AL.currentCtx.err = 40963;
  return;
 }
 AL.currentCtx.err = 40962;
}

Module["_alGetBufferfv"] = _alGetBufferfv;

function _alGetBufferi(bufferId, param, pValue) {
 var val = AL.getBufferParam("alGetBufferi", bufferId, param);
 if (val === null) {
  return;
 }
 if (!pValue) {
  AL.currentCtx.err = 40963;
  return;
 }
 switch (param) {
 case 8193:
 case 8194:
 case 8195:
 case 8196:
  HEAP32[pValue >> 2] = val;
  break;

 default:
  AL.currentCtx.err = 40962;
  return;
 }
}

Module["_alGetBufferi"] = _alGetBufferi;

function _alGetBuffer3i(bufferId, param, pValue0, pValue1, pValue2) {
 var val = AL.getBufferParam("alGetBuffer3i", bufferId, param);
 if (val === null) {
  return;
 }
 if (!pValue0 || !pValue1 || !pValue2) {
  AL.currentCtx.err = 40963;
  return;
 }
 AL.currentCtx.err = 40962;
}

Module["_alGetBuffer3i"] = _alGetBuffer3i;

function _alGetBufferiv(bufferId, param, pValues) {
 var val = AL.getBufferParam("alGetBufferiv", bufferId, param);
 if (val === null) {
  return;
 }
 if (!pValues) {
  AL.currentCtx.err = 40963;
  return;
 }
 switch (param) {
 case 8193:
 case 8194:
 case 8195:
 case 8196:
  HEAP32[pValues >> 2] = val;
  break;

 case 8213:
  HEAP32[pValues >> 2] = val[0];
  HEAP32[pValues + 4 >> 2] = val[1];
  break;

 default:
  AL.currentCtx.err = 40962;
  return;
 }
}

Module["_alGetBufferiv"] = _alGetBufferiv;

function _alBufferf(bufferId, param, value) {
 AL.setBufferParam("alBufferf", bufferId, param, null);
}

Module["_alBufferf"] = _alBufferf;

function _alBuffer3f(bufferId, param, value0, value1, value2) {
 AL.setBufferParam("alBuffer3f", bufferId, param, null);
}

Module["_alBuffer3f"] = _alBuffer3f;

function _alBufferfv(bufferId, param, pValues) {
 if (!AL.currentCtx) {
  return;
 }
 if (!pValues) {
  AL.currentCtx.err = 40963;
  return;
 }
 AL.setBufferParam("alBufferfv", bufferId, param, null);
}

Module["_alBufferfv"] = _alBufferfv;

function _alBufferi(bufferId, param, value) {
 AL.setBufferParam("alBufferi", bufferId, param, null);
}

Module["_alBufferi"] = _alBufferi;

function _alBuffer3i(bufferId, param, value0, value1, value2) {
 AL.setBufferParam("alBuffer3i", bufferId, param, null);
}

Module["_alBuffer3i"] = _alBuffer3i;

function _alBufferiv(bufferId, param, pValues) {
 if (!AL.currentCtx) {
  return;
 }
 if (!pValues) {
  AL.currentCtx.err = 40963;
  return;
 }
 switch (param) {
 case 8213:
  AL.paramArray[0] = HEAP32[pValues >> 2];
  AL.paramArray[1] = HEAP32[pValues + 4 >> 2];
  AL.setBufferParam("alBufferiv", bufferId, param, AL.paramArray);
  break;

 default:
  AL.setBufferParam("alBufferiv", bufferId, param, null);
  break;
 }
}

Module["_alBufferiv"] = _alBufferiv;

function _alIsSource(sourceId) {
 if (!AL.currentCtx) {
  return false;
 }
 if (!AL.currentCtx.sources[sourceId]) {
  return false;
 } else {
  return true;
 }
}

Module["_alIsSource"] = _alIsSource;

function _alSourceQueueBuffers(sourceId, count, pBufferIds) {
 if (!AL.currentCtx) {
  return;
 }
 var src = AL.currentCtx.sources[sourceId];
 if (!src) {
  AL.currentCtx.err = 40961;
  return;
 }
 if (src.type === 4136) {
  AL.currentCtx.err = 40964;
  return;
 }
 if (count === 0) {
  return;
 }
 var templateBuf = AL.buffers[0];
 for (var i = 0; i < src.bufQueue.length; i++) {
  if (src.bufQueue[i].id !== 0) {
   templateBuf = src.bufQueue[i];
   break;
  }
 }
 for (var i = 0; i < count; ++i) {
  var bufId = HEAP32[pBufferIds + i * 4 >> 2];
  var buf = AL.buffers[bufId];
  if (!buf) {
   AL.currentCtx.err = 40961;
   return;
  }
  if (templateBuf.id !== 0 && (buf.frequency !== templateBuf.frequency || buf.bytesPerSample !== templateBuf.bytesPerSample || buf.channels !== templateBuf.channels)) {
   AL.currentCtx.err = 40964;
  }
 }
 if (src.bufQueue.length === 1 && src.bufQueue[0].id === 0) {
  src.bufQueue.length = 0;
 }
 src.type = 4137;
 for (var i = 0; i < count; ++i) {
  var bufId = HEAP32[pBufferIds + i * 4 >> 2];
  var buf = AL.buffers[bufId];
  buf.refCount++;
  src.bufQueue.push(buf);
 }
 if (src.looping) {
  AL.cancelPendingSourceAudio(src);
 }
 AL.initSourcePanner(src);
 AL.scheduleSourceAudio(src);
}

Module["_alSourceQueueBuffers"] = _alSourceQueueBuffers;

function _alSourceUnqueueBuffers(sourceId, count, pBufferIds) {
 if (!AL.currentCtx) {
  return;
 }
 var src = AL.currentCtx.sources[sourceId];
 if (!src) {
  AL.currentCtx.err = 40961;
  return;
 }
 if (count > (src.bufQueue.length === 1 && src.bufQueue[0].id === 0 ? 0 : src.bufsProcessed)) {
  AL.currentCtx.err = 40963;
  return;
 }
 if (count === 0) {
  return;
 }
 for (var i = 0; i < count; i++) {
  var buf = src.bufQueue.shift();
  buf.refCount--;
  HEAP32[pBufferIds + i * 4 >> 2] = buf.id;
  src.bufsProcessed--;
 }
 if (src.bufQueue.length === 0) {
  src.bufQueue.push(AL.buffers[0]);
 }
 AL.initSourcePanner(src);
 AL.scheduleSourceAudio(src);
}

Module["_alSourceUnqueueBuffers"] = _alSourceUnqueueBuffers;

function _alSourcePlay(sourceId) {
 if (!AL.currentCtx) {
  return;
 }
 var src = AL.currentCtx.sources[sourceId];
 if (!src) {
  AL.currentCtx.err = 40961;
  return;
 }
 AL.setSourceState(src, 4114);
}

Module["_alSourcePlay"] = _alSourcePlay;

function _alSourcePlayv(count, pSourceIds) {
 if (!AL.currentCtx) {
  return;
 }
 if (!pSourceIds) {
  AL.currentCtx.err = 40963;
 }
 for (var i = 0; i < count; ++i) {
  if (!AL.currentCtx.sources[HEAP32[pSourceIds + i * 4 >> 2]]) {
   AL.currentCtx.err = 40961;
   return;
  }
 }
 for (var i = 0; i < count; ++i) {
  AL.setSourceState(HEAP32[pSourceIds + i * 4 >> 2], 4114);
 }
}

Module["_alSourcePlayv"] = _alSourcePlayv;

function _alSourceStop(sourceId) {
 if (!AL.currentCtx) {
  return;
 }
 var src = AL.currentCtx.sources[sourceId];
 if (!src) {
  AL.currentCtx.err = 40961;
  return;
 }
 AL.setSourceState(src, 4116);
}

Module["_alSourceStop"] = _alSourceStop;

function _alSourceStopv(count, pSourceIds) {
 if (!AL.currentCtx) {
  return;
 }
 if (!pSourceIds) {
  AL.currentCtx.err = 40963;
 }
 for (var i = 0; i < count; ++i) {
  if (!AL.currentCtx.sources[HEAP32[pSourceIds + i * 4 >> 2]]) {
   AL.currentCtx.err = 40961;
   return;
  }
 }
 for (var i = 0; i < count; ++i) {
  AL.setSourceState(HEAP32[pSourceIds + i * 4 >> 2], 4116);
 }
}

Module["_alSourceStopv"] = _alSourceStopv;

function _alSourceRewind(sourceId) {
 if (!AL.currentCtx) {
  return;
 }
 var src = AL.currentCtx.sources[sourceId];
 if (!src) {
  AL.currentCtx.err = 40961;
  return;
 }
 AL.setSourceState(src, 4116);
 AL.setSourceState(src, 4113);
}

Module["_alSourceRewind"] = _alSourceRewind;

function _alSourceRewindv(count, pSourceIds) {
 if (!AL.currentCtx) {
  return;
 }
 if (!pSourceIds) {
  AL.currentCtx.err = 40963;
 }
 for (var i = 0; i < count; ++i) {
  if (!AL.currentCtx.sources[HEAP32[pSourceIds + i * 4 >> 2]]) {
   AL.currentCtx.err = 40961;
   return;
  }
 }
 for (var i = 0; i < count; ++i) {
  AL.setSourceState(HEAP32[pSourceIds + i * 4 >> 2], 4113);
 }
}

Module["_alSourceRewindv"] = _alSourceRewindv;

function _alSourcePause(sourceId) {
 if (!AL.currentCtx) {
  return;
 }
 var src = AL.currentCtx.sources[sourceId];
 if (!src) {
  AL.currentCtx.err = 40961;
  return;
 }
 AL.setSourceState(src, 4115);
}

Module["_alSourcePause"] = _alSourcePause;

function _alSourcePausev(count, pSourceIds) {
 if (!AL.currentCtx) {
  return;
 }
 if (!pSourceIds) {
  AL.currentCtx.err = 40963;
 }
 for (var i = 0; i < count; ++i) {
  if (!AL.currentCtx.sources[HEAP32[pSourceIds + i * 4 >> 2]]) {
   AL.currentCtx.err = 40961;
   return;
  }
 }
 for (var i = 0; i < count; ++i) {
  AL.setSourceState(HEAP32[pSourceIds + i * 4 >> 2], 4115);
 }
}

Module["_alSourcePausev"] = _alSourcePausev;

function _alGetSourcef(sourceId, param, pValue) {
 var val = AL.getSourceParam("alGetSourcef", sourceId, param);
 if (val === null) {
  return;
 }
 if (!pValue) {
  AL.currentCtx.err = 40963;
  return;
 }
 switch (param) {
 case 4097:
 case 4098:
 case 4099:
 case 4106:
 case 4109:
 case 4110:
 case 4128:
 case 4129:
 case 4130:
 case 4131:
 case 4132:
 case 4133:
 case 4134:
 case 8203:
  HEAPF32[pValue >> 2] = val;
  break;

 default:
  AL.currentCtx.err = 40962;
  return;
 }
}

Module["_alGetSourcef"] = _alGetSourcef;

function _alGetSource3f(sourceId, param, pValue0, pValue1, pValue2) {
 var val = AL.getSourceParam("alGetSource3f", sourceId, param);
 if (val === null) {
  return;
 }
 if (!pValue0 || !pValue1 || !pValue2) {
  AL.currentCtx.err = 40963;
  return;
 }
 switch (param) {
 case 4100:
 case 4101:
 case 4102:
  HEAPF32[pValue0 >> 2] = val[0];
  HEAPF32[pValue1 >> 2] = val[1];
  HEAPF32[pValue2 >> 2] = val[2];
  break;

 default:
  AL.currentCtx.err = 40962;
  return;
 }
}

Module["_alGetSource3f"] = _alGetSource3f;

function _alGetSourcefv(sourceId, param, pValues) {
 var val = AL.getSourceParam("alGetSourcefv", sourceId, param);
 if (val === null) {
  return;
 }
 if (!pValues) {
  AL.currentCtx.err = 40963;
  return;
 }
 switch (param) {
 case 4097:
 case 4098:
 case 4099:
 case 4106:
 case 4109:
 case 4110:
 case 4128:
 case 4129:
 case 4130:
 case 4131:
 case 4132:
 case 4133:
 case 4134:
 case 8203:
  HEAPF32[pValues >> 2] = val[0];
  break;

 case 4100:
 case 4101:
 case 4102:
  HEAPF32[pValues >> 2] = val[0];
  HEAPF32[pValues + 4 >> 2] = val[1];
  HEAPF32[pValues + 8 >> 2] = val[2];
  break;

 default:
  AL.currentCtx.err = 40962;
  return;
 }
}

Module["_alGetSourcefv"] = _alGetSourcefv;

function _alGetSourcei(sourceId, param, pValue) {
 var val = AL.getSourceParam("alGetSourcei", sourceId, param);
 if (val === null) {
  return;
 }
 if (!pValue) {
  AL.currentCtx.err = 40963;
  return;
 }
 switch (param) {
 case 514:
 case 4097:
 case 4098:
 case 4103:
 case 4105:
 case 4112:
 case 4117:
 case 4118:
 case 4128:
 case 4129:
 case 4131:
 case 4132:
 case 4133:
 case 4134:
 case 4135:
 case 4628:
 case 8201:
 case 8202:
 case 53248:
  HEAP32[pValue >> 2] = val;
  break;

 default:
  AL.currentCtx.err = 40962;
  return;
 }
}

Module["_alGetSourcei"] = _alGetSourcei;

function _alGetSource3i(source, param, pValue0, pValue1, pValue2) {
 var val = AL.getSourceParam("alGetSource3i", sourceId, param);
 if (val === null) {
  return;
 }
 if (!pValue0 || !pValue1 || !pValue2) {
  AL.currentCtx.err = 40963;
  return;
 }
 switch (param) {
 case 4100:
 case 4101:
 case 4102:
  HEAP32[pValue0 >> 2] = val[0];
  HEAP32[pValue1 >> 2] = val[1];
  HEAP32[pValue2 >> 2] = val[2];
  break;

 default:
  AL.currentCtx.err = 40962;
  return;
 }
}

Module["_alGetSource3i"] = _alGetSource3i;

function _alGetSourceiv(sourceId, param, pValues) {
 var val = AL.getSourceParam("alGetSourceiv", sourceId, param);
 if (val === null) {
  return;
 }
 if (!pValues) {
  AL.currentCtx.err = 40963;
  return;
 }
 switch (param) {
 case 514:
 case 4097:
 case 4098:
 case 4103:
 case 4105:
 case 4112:
 case 4117:
 case 4118:
 case 4128:
 case 4129:
 case 4131:
 case 4132:
 case 4133:
 case 4134:
 case 4135:
 case 4628:
 case 8201:
 case 8202:
 case 53248:
  HEAP32[pValues >> 2] = val;
  break;

 case 4100:
 case 4101:
 case 4102:
  HEAP32[pValues >> 2] = val[0];
  HEAP32[pValues + 4 >> 2] = val[1];
  HEAP32[pValues + 8 >> 2] = val[2];
  break;

 default:
  AL.currentCtx.err = 40962;
  return;
 }
}

Module["_alGetSourceiv"] = _alGetSourceiv;

function _alSourcef(sourceId, param, value) {
 switch (param) {
 case 4097:
 case 4098:
 case 4099:
 case 4106:
 case 4109:
 case 4110:
 case 4128:
 case 4129:
 case 4130:
 case 4131:
 case 4132:
 case 4133:
 case 4134:
 case 8203:
  AL.setSourceParam("alSourcef", sourceId, param, value);
  break;

 default:
  AL.setSourceParam("alSourcef", sourceId, param, null);
  break;
 }
}

Module["_alSourcef"] = _alSourcef;

function _alSource3f(sourceId, param, value0, value1, value2) {
 switch (param) {
 case 4100:
 case 4101:
 case 4102:
  AL.paramArray[0] = value0;
  AL.paramArray[1] = value1;
  AL.paramArray[2] = value2;
  AL.setSourceParam("alSource3f", sourceId, param, AL.paramArray);
  break;

 default:
  AL.setSourceParam("alSource3f", sourceId, param, null);
  break;
 }
}

Module["_alSource3f"] = _alSource3f;

function _alSourcefv(sourceId, param, pValues) {
 if (!AL.currentCtx) {
  return;
 }
 if (!pValues) {
  AL.currentCtx.err = 40963;
  return;
 }
 switch (param) {
 case 4097:
 case 4098:
 case 4099:
 case 4106:
 case 4109:
 case 4110:
 case 4128:
 case 4129:
 case 4130:
 case 4131:
 case 4132:
 case 4133:
 case 4134:
 case 8203:
  var val = HEAPF32[pValues >> 2];
  AL.setSourceParam("alSourcefv", sourceId, param, val);
  break;

 case 4100:
 case 4101:
 case 4102:
  AL.paramArray[0] = HEAPF32[pValues >> 2];
  AL.paramArray[1] = HEAPF32[pValues + 4 >> 2];
  AL.paramArray[2] = HEAPF32[pValues + 8 >> 2];
  AL.setSourceParam("alSourcefv", sourceId, param, AL.paramArray);
  break;

 default:
  AL.setSourceParam("alSourcefv", sourceId, param, null);
  break;
 }
}

Module["_alSourcefv"] = _alSourcefv;

function _alSource3i(sourceId, param, value0, value1, value2) {
 switch (param) {
 case 4100:
 case 4101:
 case 4102:
  AL.paramArray[0] = value0;
  AL.paramArray[1] = value1;
  AL.paramArray[2] = value2;
  AL.setSourceParam("alSource3i", sourceId, param, AL.paramArray);
  break;

 default:
  AL.setSourceParam("alSource3i", sourceId, param, null);
  break;
 }
}

Module["_alSource3i"] = _alSource3i;

function _alSourceiv(source, param, pValues) {
 if (!AL.currentCtx) {
  return;
 }
 if (!pValues) {
  AL.currentCtx.err = 40963;
  return;
 }
 switch (param) {
 case 514:
 case 4097:
 case 4098:
 case 4103:
 case 4105:
 case 4128:
 case 4129:
 case 4131:
 case 4132:
 case 4133:
 case 4134:
 case 4628:
 case 8201:
 case 8202:
 case 53248:
  var val = HEAP32[pValues >> 2];
  AL.setSourceParam("alSourceiv", sourceId, param, val);
  break;

 case 4100:
 case 4101:
 case 4102:
  AL.paramArray[0] = HEAP32[pValues >> 2];
  AL.paramArray[1] = HEAP32[pValues + 4 >> 2];
  AL.paramArray[2] = HEAP32[pValues + 8 >> 2];
  AL.setSourceParam("alSourceiv", sourceId, param, AL.paramArray);
  break;

 default:
  AL.setSourceParam("alSourceiv", sourceId, param, null);
  break;
 }
}

Module["_alSourceiv"] = _alSourceiv;

var WebVR = {
 EYE_LEFT: 0,
 EYE_RIGHT: 1,
 POSE_POSITION: 1,
 POSE_LINEAR_VELOCITY: 2,
 POSE_LINEAR_ACCELERATION: 4,
 POSE_ORIENTATION: 8,
 POSE_ANGULAR_VELOCITY: 16,
 POSE_ANGULAR_ACCELERATION: 32,
 initialized: false,
 ready: false,
 version: [ -1, -1 ],
 displays: [],
 displayNames: [],
 init: function(callback) {
  if (WebVR.initialized) return;
  WebVR.initialized = true;
  if (!navigator.getVRDisplays) {
   WebVR.ready = true;
   WebVR.displays = [];
   return 0;
  }
  WebVR.version = [ 1, 1 ];
  navigator.getVRDisplays().then(function(displays) {
   WebVR.ready = true;
   WebVR.displays = displays;
   WebVR.displayNames = new Array(displays.length);
   callback();
  });
  return 1;
 },
 deinit: function() {
  WebVR.displayNames.forEach(function(name) {
   _free(name);
  });
  return 1;
 },
 dereferenceDisplayHandle: function(displayHandle) {
  if (displayHandle < 1 || displayHandle > WebVR.displays.length) {
   console.log("library_vr dereferenceDisplayHandle invalid display handle at: " + stackTrace());
   return null;
  }
  return WebVR.displays[displayHandle - 1];
 }
};

Module["WebVR"] = WebVR;

function _emscripten_vr_init(func, userData) {
 return WebVR.init(function() {
  Runtime.dynCall("vi", func, [ userData ]);
 });
}

Module["_emscripten_vr_init"] = _emscripten_vr_init;

function _emscripten_vr_deinit() {
 return WebVR.deinit();
}

Module["_emscripten_vr_deinit"] = _emscripten_vr_deinit;

function _emscripten_vr_version_major() {
 return WebVR.version[0];
}

Module["_emscripten_vr_version_major"] = _emscripten_vr_version_major;

function _emscripten_vr_version_minor() {
 return WebVR.version[1];
}

Module["_emscripten_vr_version_minor"] = _emscripten_vr_version_minor;

function _emscripten_vr_ready() {
 return WebVR.ready ? 1 : 0;
}

Module["_emscripten_vr_ready"] = _emscripten_vr_ready;

function _emscripten_vr_count_displays() {
 return WebVR.displays.length;
}

Module["_emscripten_vr_count_displays"] = _emscripten_vr_count_displays;

function _emscripten_vr_get_display_handle(displayIndex) {
 if (displayIndex < 0 || displayIndex >= WebVR.displays.length) {
  return -1;
 }
 return displayIndex + 1;
}

Module["_emscripten_vr_get_display_handle"] = _emscripten_vr_get_display_handle;

function _emscripten_vr_get_display_name(displayHandle) {
 var display = WebVR.dereferenceDisplayHandle(displayHandle);
 if (!display) return 0;
 var name = WebVR.displayNames[displayHandle - 1];
 if (name) {
  return name;
 }
 var buffer, displayName;
 displayName = display ? display.displayName : "";
 var len = lengthBytesUTF8(displayName);
 buffer = _malloc(len + 1);
 stringToUTF8(displayName, buffer, len + 1);
 WebVR.displayNames[displayHandle - 1] = buffer;
 return buffer;
}

Module["_emscripten_vr_get_display_name"] = _emscripten_vr_get_display_name;

function _emscripten_vr_get_display_capabilities(displayHandle, capsPtr) {
 if (!capsPtr) return 0;
 var display = WebVR.dereferenceDisplayHandle(displayHandle);
 if (!display) return 0;
 var caps = display.capabilities;
 HEAP32[capsPtr >> 2] = caps.hasPosition ? 1 : 0;
 HEAP32[capsPtr + 4 >> 2] = caps.hasExternalDisplay ? 1 : 0;
 HEAP32[capsPtr + 8 >> 2] = caps.canPresent ? 1 : 0;
 HEAP32[capsPtr + 12 >> 2] = caps.maxLayers;
 return 1;
}

Module["_emscripten_vr_get_display_capabilities"] = _emscripten_vr_get_display_capabilities;

function _emscripten_vr_get_eye_parameters(displayHandle, whichEye, eyeParamsPtr) {
 if (!eyeParamsPtr) return 0;
 var display = WebVR.dereferenceDisplayHandle(displayHandle);
 if (!display) return 0;
 var params = display.getEyeParameters(whichEye == WebVR.EYE_LEFT ? "left" : "right");
 HEAPF32[eyeParamsPtr >> 2] = params.offset[0];
 HEAPF32[eyeParamsPtr + 4 >> 2] = params.offset[1];
 HEAPF32[eyeParamsPtr + 8 >> 2] = params.offset[2];
 HEAP32[eyeParamsPtr + 12 >> 2] = params.renderWidth;
 HEAP32[eyeParamsPtr + 16 >> 2] = params.renderHeight;
 return 1;
}

Module["_emscripten_vr_get_eye_parameters"] = _emscripten_vr_get_eye_parameters;

function _emscripten_vr_display_connected(displayHandle) {
 var display = WebVR.dereferenceDisplayHandle(displayHandle);
 if (!display || !display.isConnected) return 0;
 return 1;
}

Module["_emscripten_vr_display_connected"] = _emscripten_vr_display_connected;

function _emscripten_vr_display_presenting(displayHandle) {
 var display = WebVR.dereferenceDisplayHandle(displayHandle);
 if (!display || !display.isPresenting) return 0;
 return 1;
}

Module["_emscripten_vr_display_presenting"] = _emscripten_vr_display_presenting;

function _emscripten_vr_set_display_render_loop(displayHandle, func, arg) {
 var display = WebVR.dereferenceDisplayHandle(displayHandle);
 if (!display) return 0;
 assert(!display.mainLoop || !display.mainLoop.scheduler, "emscripten_vr_set_device_main_loop: there can only be one render loop function per VRDisplay: call emscripten_vr_cancel_render_loop to cancel the previous one before setting a new one with different parameters.");
 var displayIterationFunc;
 if (typeof arg !== "undefined") {
  displayIterationFunc = function() {
   dynCall("vi", func, [ arg ]);
  };
 } else {
  displayIterationFunc = function() {
   dynCall("v", func);
  };
 }
 display.mainLoop = {
  running: !display.mainLoop ? false : display.mainLoop.running,
  scheduler: function() {
   display.requestAnimationFrame(display.mainLoop.runner);
  },
  runner: function() {
   if (ABORT) return;
   display.mainLoop.running = true;
   try {
    displayIterationFunc();
   } catch (e) {
    if (e instanceof ExitStatus) {
     return;
    } else {
     if (e && typeof e === "object" && e.stack) err("exception thrown in render loop of VR display " + displayHandle.toString() + ": " + [ e, e.stack ]);
     throw e;
    }
   }
   checkStackCookie();
   if (!display.mainLoop.scheduler) {
    display.mainLoop.running = false;
   } else {
    display.mainLoop.scheduler();
   }
  },
  pause: function() {
   display.mainLoop.scheduler = null;
  }
 };
 if (!display.mainLoop.running) {
  display.mainLoop.scheduler();
 }
 return 1;
}

Module["_emscripten_vr_set_display_render_loop"] = _emscripten_vr_set_display_render_loop;

function _emscripten_vr_set_display_render_loop_arg(displayHandle, func, arg) {
 return _emscripten_vr_set_display_render_loop(displayHandle, func, arg);
}

Module["_emscripten_vr_set_display_render_loop_arg"] = _emscripten_vr_set_display_render_loop_arg;

function _emscripten_vr_cancel_display_render_loop(displayHandle) {
 var display = WebVR.dereferenceDisplayHandle(displayHandle);
 if (!display || !display.mainLoop) return 0;
 display.mainLoop.pause();
 return 1;
}

Module["_emscripten_vr_cancel_display_render_loop"] = _emscripten_vr_cancel_display_render_loop;

function _emscripten_vr_request_present(displayHandle, layerInitPtr, layerCount, func, userData) {
 var display = WebVR.dereferenceDisplayHandle(displayHandle);
 if (!display) return 0;
 layerInit = new Array(layerCount);
 for (var i = 0; i < layerCount; ++i) {
  sourceStrPtr = HEAP32[layerInitPtr >> 2];
  var source = null;
  if (sourceStrPtr == 0) {
   source = Module["canvas"];
  } else {
   sourceStr = UTF8ToString(sourceStrPtr);
   if (sourceStr && sourceStr.length > 0) {
    source = document.getElementById(sourceStr);
   }
   if (!source) {
    return 0;
   }
  }
  leftBounds = new Float32Array(4);
  rightBounds = new Float32Array(4);
  var ptr = layerInitPtr;
  for (var j = 0; j < 4; ++j) {
   leftBounds[j] = HEAPF32[layerInitPtr + (4 + 4 * j) >> 2];
   rightBounds[j] = HEAPF32[layerInitPtr + (20 + 4 * j) >> 2];
   ptr += 4;
  }
  layerInit[i] = {
   source: source,
   leftBounds: leftBounds,
   rightBounds: rightBounds
  };
  layerInitPtr += 36;
 }
 display.requestPresent(layerInit).then(function() {
  if (!func) return;
  dynCall("vi", func, [ userData ]);
 });
 return 1;
}

Module["_emscripten_vr_request_present"] = _emscripten_vr_request_present;

function _emscripten_vr_exit_present(displayHandle) {
 var display = WebVR.dereferenceDisplayHandle(displayHandle);
 if (!display) return 0;
 display.exitPresent();
 return 1;
}

Module["_emscripten_vr_exit_present"] = _emscripten_vr_exit_present;

function _emscripten_vr_get_frame_data(displayHandle, frameDataPtr) {
 var display = WebVR.dereferenceDisplayHandle(displayHandle);
 if (!display || !display.mainLoop || !frameDataPtr) return 0;
 if (!display.frameData) {
  display.frameData = new VRFrameData();
 }
 display.getFrameData(display.frameData);
 var poseFlags = 0;
 HEAPF64[frameDataPtr >> 3] = display.frameData.timestamp;
 if (display.frameData.pose.position !== null) {
  HEAPF32[frameDataPtr + 264 >> 2] = display.frameData.pose.position[0];
  HEAPF32[frameDataPtr + 268 >> 2] = display.frameData.pose.position[1];
  HEAPF32[frameDataPtr + 272 >> 2] = display.frameData.pose.position[2];
  poseFlags |= WebVR.POSE_POSITION;
 }
 if (display.frameData.pose.linearVelocity !== null) {
  HEAPF32[frameDataPtr + 276 >> 2] = display.frameData.pose.linearVelocity[0];
  HEAPF32[frameDataPtr + 280 >> 2] = display.frameData.pose.linearVelocity[1];
  HEAPF32[frameDataPtr + 284 >> 2] = display.frameData.pose.linearVelocity[2];
  poseFlags |= WebVR.POSE_LINEAR_VELOCITY;
 }
 if (display.frameData.pose.linearAcceleration !== null) {
  HEAPF32[frameDataPtr + 288 >> 2] = display.frameData.pose.linearAcceleration[0];
  HEAPF32[frameDataPtr + 292 >> 2] = display.frameData.pose.linearAcceleration[1];
  HEAPF32[frameDataPtr + 296 >> 2] = display.frameData.pose.linearAcceleration[2];
  poseFlags |= WebVR.POSE_LINEAR_ACCELERATION;
 }
 if (display.frameData.pose.orientation !== null) {
  HEAPF32[frameDataPtr + 300 >> 2] = display.frameData.pose.orientation[0];
  HEAPF32[frameDataPtr + 304 >> 2] = display.frameData.pose.orientation[1];
  HEAPF32[frameDataPtr + 308 >> 2] = display.frameData.pose.orientation[2];
  HEAPF32[frameDataPtr + 312 >> 2] = display.frameData.pose.orientation[3];
  poseFlags |= WebVR.POSE_ORIENTATION;
 }
 if (display.frameData.pose.angularVelocity !== null) {
  HEAPF32[frameDataPtr + 316 >> 2] = display.frameData.pose.angularVelocity[0];
  HEAPF32[frameDataPtr + 320 >> 2] = display.frameData.pose.angularVelocity[1];
  HEAPF32[frameDataPtr + 324 >> 2] = display.frameData.pose.angularVelocity[2];
  poseFlags |= WebVR.POSE_ANGULAR_VELOCITY;
 }
 if (display.frameData.pose.angularAcceleration !== null) {
  HEAPF32[frameDataPtr + 328 >> 2] = display.frameData.pose.angularAcceleration[0];
  HEAPF32[frameDataPtr + 332 >> 2] = display.frameData.pose.angularAcceleration[1];
  HEAPF32[frameDataPtr + 336 >> 2] = display.frameData.pose.angularAcceleration[0];
  poseFlags |= WebVR.POSE_ANGULAR_ACCELERATION;
 }
 HEAP32[frameDataPtr + 340 >> 2] = poseFlags;
 for (var i = 0; i < 16; ++i) {
  HEAPF32[frameDataPtr + (8 + i * 4) >> 2] = display.frameData.leftProjectionMatrix[i];
 }
 for (var i = 0; i < 16; ++i) {
  HEAPF32[frameDataPtr + (72 + i * 4) >> 2] = display.frameData.leftViewMatrix[i];
 }
 for (var i = 0; i < 16; ++i) {
  HEAPF32[frameDataPtr + (136 + i * 4) >> 2] = display.frameData.rightProjectionMatrix[i];
 }
 for (var i = 0; i < 16; ++i) {
  HEAPF32[frameDataPtr + (200 + i * 4) >> 2] = display.frameData.rightViewMatrix[i];
 }
 return 1;
}

Module["_emscripten_vr_get_frame_data"] = _emscripten_vr_get_frame_data;

function _emscripten_vr_submit_frame(displayHandle) {
 var display = WebVR.dereferenceDisplayHandle(displayHandle);
 if (!display || !display.mainLoop) return 0;
 display.submitFrame();
 return 1;
}

Module["_emscripten_vr_submit_frame"] = _emscripten_vr_submit_frame;

function _SDL_GetTicks() {
 return Date.now() - SDL.startTime | 0;
}

Module["_SDL_GetTicks"] = _SDL_GetTicks;

function _SDL_LockSurface(surf) {
 var surfData = SDL.surfaces[surf];
 surfData.locked++;
 if (surfData.locked > 1) return 0;
 if (!surfData.buffer) {
  surfData.buffer = _malloc(surfData.width * surfData.height * 4);
  HEAP32[surf + 20 >> 2] = surfData.buffer;
 }
 HEAP32[surf + 20 >> 2] = surfData.buffer;
 if (surf == SDL.screen && Module.screenIsReadOnly && surfData.image) return 0;
 if (SDL.defaults.discardOnLock) {
  if (!surfData.image) {
   surfData.image = surfData.ctx.createImageData(surfData.width, surfData.height);
  }
  if (!SDL.defaults.opaqueFrontBuffer) return;
 } else {
  surfData.image = surfData.ctx.getImageData(0, 0, surfData.width, surfData.height);
 }
 if (surf == SDL.screen && SDL.defaults.opaqueFrontBuffer) {
  var data = surfData.image.data;
  var num = data.length;
  for (var i = 0; i < num / 4; i++) {
   data[i * 4 + 3] = 255;
  }
 }
 if (SDL.defaults.copyOnLock && !SDL.defaults.discardOnLock) {
  if (surfData.isFlagSet(2097152)) {
   throw "CopyOnLock is not supported for SDL_LockSurface with SDL_HWPALETTE flag set" + new Error().stack;
  } else {
   HEAPU8.set(surfData.image.data, surfData.buffer);
  }
 }
 return 0;
}

Module["_SDL_LockSurface"] = _SDL_LockSurface;

var SDL = {
 defaults: {
  width: 320,
  height: 200,
  copyOnLock: true,
  discardOnLock: false,
  opaqueFrontBuffer: true
 },
 version: null,
 surfaces: {},
 canvasPool: [],
 events: [],
 fonts: [ null ],
 audios: [ null ],
 rwops: [ null ],
 music: {
  audio: null,
  volume: 1
 },
 mixerFrequency: 22050,
 mixerFormat: 32784,
 mixerNumChannels: 2,
 mixerChunkSize: 1024,
 channelMinimumNumber: 0,
 GL: false,
 glAttributes: {
  0: 3,
  1: 3,
  2: 2,
  3: 0,
  4: 0,
  5: 1,
  6: 16,
  7: 0,
  8: 0,
  9: 0,
  10: 0,
  11: 0,
  12: 0,
  13: 0,
  14: 0,
  15: 1,
  16: 0,
  17: 0,
  18: 0
 },
 keyboardState: null,
 keyboardMap: {},
 canRequestFullscreen: false,
 isRequestingFullscreen: false,
 textInput: false,
 startTime: null,
 initFlags: 0,
 buttonState: 0,
 modState: 0,
 DOMButtons: [ 0, 0, 0 ],
 DOMEventToSDLEvent: {},
 TOUCH_DEFAULT_ID: 0,
 eventHandler: null,
 eventHandlerContext: null,
 eventHandlerTemp: 0,
 keyCodes: {
  16: 1249,
  17: 1248,
  18: 1250,
  20: 1081,
  33: 1099,
  34: 1102,
  35: 1101,
  36: 1098,
  37: 1104,
  38: 1106,
  39: 1103,
  40: 1105,
  44: 316,
  45: 1097,
  46: 127,
  91: 1251,
  93: 1125,
  96: 1122,
  97: 1113,
  98: 1114,
  99: 1115,
  100: 1116,
  101: 1117,
  102: 1118,
  103: 1119,
  104: 1120,
  105: 1121,
  106: 1109,
  107: 1111,
  109: 1110,
  110: 1123,
  111: 1108,
  112: 1082,
  113: 1083,
  114: 1084,
  115: 1085,
  116: 1086,
  117: 1087,
  118: 1088,
  119: 1089,
  120: 1090,
  121: 1091,
  122: 1092,
  123: 1093,
  124: 1128,
  125: 1129,
  126: 1130,
  127: 1131,
  128: 1132,
  129: 1133,
  130: 1134,
  131: 1135,
  132: 1136,
  133: 1137,
  134: 1138,
  135: 1139,
  144: 1107,
  160: 94,
  161: 33,
  162: 34,
  163: 35,
  164: 36,
  165: 37,
  166: 38,
  167: 95,
  168: 40,
  169: 41,
  170: 42,
  171: 43,
  172: 124,
  173: 45,
  174: 123,
  175: 125,
  176: 126,
  181: 127,
  182: 129,
  183: 128,
  188: 44,
  190: 46,
  191: 47,
  192: 96,
  219: 91,
  220: 92,
  221: 93,
  222: 39,
  224: 1251
 },
 scanCodes: {
  8: 42,
  9: 43,
  13: 40,
  27: 41,
  32: 44,
  35: 204,
  39: 53,
  44: 54,
  46: 55,
  47: 56,
  48: 39,
  49: 30,
  50: 31,
  51: 32,
  52: 33,
  53: 34,
  54: 35,
  55: 36,
  56: 37,
  57: 38,
  58: 203,
  59: 51,
  61: 46,
  91: 47,
  92: 49,
  93: 48,
  96: 52,
  97: 4,
  98: 5,
  99: 6,
  100: 7,
  101: 8,
  102: 9,
  103: 10,
  104: 11,
  105: 12,
  106: 13,
  107: 14,
  108: 15,
  109: 16,
  110: 17,
  111: 18,
  112: 19,
  113: 20,
  114: 21,
  115: 22,
  116: 23,
  117: 24,
  118: 25,
  119: 26,
  120: 27,
  121: 28,
  122: 29,
  127: 76,
  305: 224,
  308: 226,
  316: 70
 },
 loadRect: function(rect) {
  return {
   x: HEAP32[rect + 0 >> 2],
   y: HEAP32[rect + 4 >> 2],
   w: HEAP32[rect + 8 >> 2],
   h: HEAP32[rect + 12 >> 2]
  };
 },
 updateRect: function(rect, r) {
  HEAP32[rect >> 2] = r.x;
  HEAP32[rect + 4 >> 2] = r.y;
  HEAP32[rect + 8 >> 2] = r.w;
  HEAP32[rect + 12 >> 2] = r.h;
 },
 intersectionOfRects: function(first, second) {
  var leftX = Math.max(first.x, second.x);
  var leftY = Math.max(first.y, second.y);
  var rightX = Math.min(first.x + first.w, second.x + second.w);
  var rightY = Math.min(first.y + first.h, second.y + second.h);
  return {
   x: leftX,
   y: leftY,
   w: Math.max(leftX, rightX) - leftX,
   h: Math.max(leftY, rightY) - leftY
  };
 },
 checkPixelFormat: function(fmt) {
  var format = HEAP32[fmt >> 2];
  if (format != -2042224636) {
   warnOnce("Unsupported pixel format!");
  }
 },
 loadColorToCSSRGB: function(color) {
  var rgba = HEAP32[color >> 2];
  return "rgb(" + (rgba & 255) + "," + (rgba >> 8 & 255) + "," + (rgba >> 16 & 255) + ")";
 },
 loadColorToCSSRGBA: function(color) {
  var rgba = HEAP32[color >> 2];
  return "rgba(" + (rgba & 255) + "," + (rgba >> 8 & 255) + "," + (rgba >> 16 & 255) + "," + (rgba >> 24 & 255) / 255 + ")";
 },
 translateColorToCSSRGBA: function(rgba) {
  return "rgba(" + (rgba & 255) + "," + (rgba >> 8 & 255) + "," + (rgba >> 16 & 255) + "," + (rgba >>> 24) / 255 + ")";
 },
 translateRGBAToCSSRGBA: function(r, g, b, a) {
  return "rgba(" + (r & 255) + "," + (g & 255) + "," + (b & 255) + "," + (a & 255) / 255 + ")";
 },
 translateRGBAToColor: function(r, g, b, a) {
  return r | g << 8 | b << 16 | a << 24;
 },
 makeSurface: function(width, height, flags, usePageCanvas, source, rmask, gmask, bmask, amask) {
  flags = flags || 0;
  var is_SDL_HWSURFACE = flags & 1;
  var is_SDL_HWPALETTE = flags & 2097152;
  var is_SDL_OPENGL = flags & 67108864;
  var surf = _malloc(60);
  var pixelFormat = _malloc(44);
  var bpp = is_SDL_HWPALETTE ? 1 : 4;
  var buffer = 0;
  if (!is_SDL_HWSURFACE && !is_SDL_OPENGL) {
   buffer = _malloc(width * height * 4);
  }
  HEAP32[surf >> 2] = flags;
  HEAP32[surf + 4 >> 2] = pixelFormat;
  HEAP32[surf + 8 >> 2] = width;
  HEAP32[surf + 12 >> 2] = height;
  HEAP32[surf + 16 >> 2] = width * bpp;
  HEAP32[surf + 20 >> 2] = buffer;
  HEAP32[surf + 36 >> 2] = 0;
  HEAP32[surf + 40 >> 2] = 0;
  HEAP32[surf + 44 >> 2] = Module["canvas"].width;
  HEAP32[surf + 48 >> 2] = Module["canvas"].height;
  HEAP32[surf + 56 >> 2] = 1;
  HEAP32[pixelFormat >> 2] = -2042224636;
  HEAP32[pixelFormat + 4 >> 2] = 0;
  HEAP8[pixelFormat + 8 >> 0] = bpp * 8;
  HEAP8[pixelFormat + 9 >> 0] = bpp;
  HEAP32[pixelFormat + 12 >> 2] = rmask || 255;
  HEAP32[pixelFormat + 16 >> 2] = gmask || 65280;
  HEAP32[pixelFormat + 20 >> 2] = bmask || 16711680;
  HEAP32[pixelFormat + 24 >> 2] = amask || 4278190080;
  SDL.GL = SDL.GL || is_SDL_OPENGL;
  var canvas;
  if (!usePageCanvas) {
   if (SDL.canvasPool.length > 0) {
    canvas = SDL.canvasPool.pop();
   } else {
    canvas = document.createElement("canvas");
   }
   canvas.width = width;
   canvas.height = height;
  } else {
   canvas = Module["canvas"];
  }
  var webGLContextAttributes = {
   antialias: SDL.glAttributes[13] != 0 && SDL.glAttributes[14] > 1,
   depth: SDL.glAttributes[6] > 0,
   stencil: SDL.glAttributes[7] > 0,
   alpha: SDL.glAttributes[3] > 0
  };
  var ctx = Browser.createContext(canvas, is_SDL_OPENGL, usePageCanvas, webGLContextAttributes);
  SDL.surfaces[surf] = {
   width: width,
   height: height,
   canvas: canvas,
   ctx: ctx,
   surf: surf,
   buffer: buffer,
   pixelFormat: pixelFormat,
   alpha: 255,
   flags: flags,
   locked: 0,
   usePageCanvas: usePageCanvas,
   source: source,
   isFlagSet: function(flag) {
    return flags & flag;
   }
  };
  return surf;
 },
 copyIndexedColorData: function(surfData, rX, rY, rW, rH) {
  if (!surfData.colors) {
   return;
  }
  var fullWidth = Module["canvas"].width;
  var fullHeight = Module["canvas"].height;
  var startX = rX || 0;
  var startY = rY || 0;
  var endX = (rW || fullWidth - startX) + startX;
  var endY = (rH || fullHeight - startY) + startY;
  var buffer = surfData.buffer;
  if (!surfData.image.data32) {
   surfData.image.data32 = new Uint32Array(surfData.image.data.buffer);
  }
  var data32 = surfData.image.data32;
  var colors32 = surfData.colors32;
  for (var y = startY; y < endY; ++y) {
   var base = y * fullWidth;
   for (var x = startX; x < endX; ++x) {
    data32[base + x] = colors32[HEAPU8[buffer + base + x >> 0]];
   }
  }
 },
 freeSurface: function(surf) {
  var refcountPointer = surf + 56;
  var refcount = HEAP32[refcountPointer >> 2];
  if (refcount > 1) {
   HEAP32[refcountPointer >> 2] = refcount - 1;
   return;
  }
  var info = SDL.surfaces[surf];
  if (!info.usePageCanvas && info.canvas) SDL.canvasPool.push(info.canvas);
  if (info.buffer) _free(info.buffer);
  _free(info.pixelFormat);
  _free(surf);
  SDL.surfaces[surf] = null;
  if (surf === SDL.screen) {
   SDL.screen = null;
  }
 },
 blitSurface: function(src, srcrect, dst, dstrect, scale) {
  var srcData = SDL.surfaces[src];
  var dstData = SDL.surfaces[dst];
  var sr, dr;
  if (srcrect) {
   sr = SDL.loadRect(srcrect);
  } else {
   sr = {
    x: 0,
    y: 0,
    w: srcData.width,
    h: srcData.height
   };
  }
  if (dstrect) {
   dr = SDL.loadRect(dstrect);
  } else {
   dr = {
    x: 0,
    y: 0,
    w: srcData.width,
    h: srcData.height
   };
  }
  if (dstData.clipRect) {
   var widthScale = !scale || sr.w === 0 ? 1 : sr.w / dr.w;
   var heightScale = !scale || sr.h === 0 ? 1 : sr.h / dr.h;
   dr = SDL.intersectionOfRects(dstData.clipRect, dr);
   sr.w = dr.w * widthScale;
   sr.h = dr.h * heightScale;
   if (dstrect) {
    SDL.updateRect(dstrect, dr);
   }
  }
  var blitw, blith;
  if (scale) {
   blitw = dr.w;
   blith = dr.h;
  } else {
   blitw = sr.w;
   blith = sr.h;
  }
  if (sr.w === 0 || sr.h === 0 || blitw === 0 || blith === 0) {
   return 0;
  }
  var oldAlpha = dstData.ctx.globalAlpha;
  dstData.ctx.globalAlpha = srcData.alpha / 255;
  dstData.ctx.drawImage(srcData.canvas, sr.x, sr.y, sr.w, sr.h, dr.x, dr.y, blitw, blith);
  dstData.ctx.globalAlpha = oldAlpha;
  if (dst != SDL.screen) {
   warnOnce("WARNING: copying canvas data to memory for compatibility");
   _SDL_LockSurface(dst);
   dstData.locked--;
  }
  return 0;
 },
 downFingers: {},
 savedKeydown: null,
 receiveEvent: function(event) {
  function unpressAllPressedKeys() {
   for (var code in SDL.keyboardMap) {
    SDL.events.push({
     type: "keyup",
     keyCode: SDL.keyboardMap[code]
    });
   }
  }
  switch (event.type) {
  case "touchstart":
  case "touchmove":
   {
    event.preventDefault();
    var touches = [];
    if (event.type === "touchstart") {
     for (var i = 0; i < event.touches.length; i++) {
      var touch = event.touches[i];
      if (SDL.downFingers[touch.identifier] != true) {
       SDL.downFingers[touch.identifier] = true;
       touches.push(touch);
      }
     }
    } else {
     touches = event.touches;
    }
    var firstTouch = touches[0];
    if (firstTouch) {
     if (event.type == "touchstart") {
      SDL.DOMButtons[0] = 1;
     }
     var mouseEventType;
     switch (event.type) {
     case "touchstart":
      mouseEventType = "mousedown";
      break;

     case "touchmove":
      mouseEventType = "mousemove";
      break;
     }
     var mouseEvent = {
      type: mouseEventType,
      button: 0,
      pageX: firstTouch.clientX,
      pageY: firstTouch.clientY
     };
     SDL.events.push(mouseEvent);
    }
    for (var i = 0; i < touches.length; i++) {
     var touch = touches[i];
     SDL.events.push({
      type: event.type,
      touch: touch
     });
    }
    break;
   }

  case "touchend":
   {
    event.preventDefault();
    for (var i = 0; i < event.changedTouches.length; i++) {
     var touch = event.changedTouches[i];
     if (SDL.downFingers[touch.identifier] === true) {
      delete SDL.downFingers[touch.identifier];
     }
    }
    var mouseEvent = {
     type: "mouseup",
     button: 0,
     pageX: event.changedTouches[0].clientX,
     pageY: event.changedTouches[0].clientY
    };
    SDL.DOMButtons[0] = 0;
    SDL.events.push(mouseEvent);
    for (var i = 0; i < event.changedTouches.length; i++) {
     var touch = event.changedTouches[i];
     SDL.events.push({
      type: "touchend",
      touch: touch
     });
    }
    break;
   }

  case "DOMMouseScroll":
  case "mousewheel":
  case "wheel":
   var delta = -Browser.getMouseWheelDelta(event);
   delta = delta == 0 ? 0 : delta > 0 ? Math.max(delta, 1) : Math.min(delta, -1);
   var button = delta > 0 ? 3 : 4;
   SDL.events.push({
    type: "mousedown",
    button: button,
    pageX: event.pageX,
    pageY: event.pageY
   });
   SDL.events.push({
    type: "mouseup",
    button: button,
    pageX: event.pageX,
    pageY: event.pageY
   });
   SDL.events.push({
    type: "wheel",
    deltaX: 0,
    deltaY: delta
   });
   event.preventDefault();
   break;

  case "mousemove":
   if (SDL.DOMButtons[0] === 1) {
    SDL.events.push({
     type: "touchmove",
     touch: {
      identifier: 0,
      deviceID: -1,
      pageX: event.pageX,
      pageY: event.pageY
     }
    });
   }
   if (Browser.pointerLock) {
    if ("mozMovementX" in event) {
     event["movementX"] = event["mozMovementX"];
     event["movementY"] = event["mozMovementY"];
    }
    if (event["movementX"] == 0 && event["movementY"] == 0) {
     event.preventDefault();
     return;
    }
   }

  case "keydown":
  case "keyup":
  case "keypress":
  case "mousedown":
  case "mouseup":
   if (event.type !== "keydown" || !SDL.unicode && !SDL.textInput || (event.keyCode === 8 || event.keyCode === 9)) {
    event.preventDefault();
   }
   if (event.type == "mousedown") {
    SDL.DOMButtons[event.button] = 1;
    SDL.events.push({
     type: "touchstart",
     touch: {
      identifier: 0,
      deviceID: -1,
      pageX: event.pageX,
      pageY: event.pageY
     }
    });
   } else if (event.type == "mouseup") {
    if (!SDL.DOMButtons[event.button]) {
     return;
    }
    SDL.events.push({
     type: "touchend",
     touch: {
      identifier: 0,
      deviceID: -1,
      pageX: event.pageX,
      pageY: event.pageY
     }
    });
    SDL.DOMButtons[event.button] = 0;
   }
   if (event.type === "keydown" || event.type === "mousedown") {
    SDL.canRequestFullscreen = true;
   } else if (event.type === "keyup" || event.type === "mouseup") {
    if (SDL.isRequestingFullscreen) {
     Module["requestFullscreen"](true, true);
     SDL.isRequestingFullscreen = false;
    }
    SDL.canRequestFullscreen = false;
   }
   if (event.type === "keypress" && SDL.savedKeydown) {
    SDL.savedKeydown.keypressCharCode = event.charCode;
    SDL.savedKeydown = null;
   } else if (event.type === "keydown") {
    SDL.savedKeydown = event;
   }
   if (event.type !== "keypress" || SDL.textInput) {
    SDL.events.push(event);
   }
   break;

  case "mouseout":
   for (var i = 0; i < 3; i++) {
    if (SDL.DOMButtons[i]) {
     SDL.events.push({
      type: "mouseup",
      button: i,
      pageX: event.pageX,
      pageY: event.pageY
     });
     SDL.DOMButtons[i] = 0;
    }
   }
   event.preventDefault();
   break;

  case "focus":
   SDL.events.push(event);
   event.preventDefault();
   break;

  case "blur":
   SDL.events.push(event);
   unpressAllPressedKeys();
   event.preventDefault();
   break;

  case "visibilitychange":
   SDL.events.push({
    type: "visibilitychange",
    visible: !document.hidden
   });
   unpressAllPressedKeys();
   event.preventDefault();
   break;

  case "unload":
   if (Browser.mainLoop.runner) {
    SDL.events.push(event);
    Browser.mainLoop.runner();
   }
   return;

  case "resize":
   SDL.events.push(event);
   if (event.preventDefault) {
    event.preventDefault();
   }
   break;
  }
  if (SDL.events.length >= 1e4) {
   err("SDL event queue full, dropping events");
   SDL.events = SDL.events.slice(0, 1e4);
  }
  SDL.flushEventsToHandler();
  return;
 },
 lookupKeyCodeForEvent: function(event) {
  var code = event.keyCode;
  if (code >= 65 && code <= 90) {
   code += 32;
  } else {
   code = SDL.keyCodes[event.keyCode] || event.keyCode;
   if (event.location === KeyboardEvent.DOM_KEY_LOCATION_RIGHT && code >= (224 | 1 << 10) && code <= (227 | 1 << 10)) {
    code += 4;
   }
  }
  return code;
 },
 handleEvent: function(event) {
  if (event.handled) return;
  event.handled = true;
  switch (event.type) {
  case "touchstart":
  case "touchend":
  case "touchmove":
   {
    Browser.calculateMouseEvent(event);
    break;
   }

  case "keydown":
  case "keyup":
   {
    var down = event.type === "keydown";
    var code = SDL.lookupKeyCodeForEvent(event);
    HEAP8[SDL.keyboardState + code >> 0] = down;
    SDL.modState = (HEAP8[SDL.keyboardState + 1248 >> 0] ? 64 : 0) | (HEAP8[SDL.keyboardState + 1249 >> 0] ? 1 : 0) | (HEAP8[SDL.keyboardState + 1250 >> 0] ? 256 : 0) | (HEAP8[SDL.keyboardState + 1252 >> 0] ? 128 : 0) | (HEAP8[SDL.keyboardState + 1253 >> 0] ? 2 : 0) | (HEAP8[SDL.keyboardState + 1254 >> 0] ? 512 : 0);
    if (down) {
     SDL.keyboardMap[code] = event.keyCode;
    } else {
     delete SDL.keyboardMap[code];
    }
    break;
   }

  case "mousedown":
  case "mouseup":
   if (event.type == "mousedown") {
    SDL.buttonState |= 1 << event.button;
   } else if (event.type == "mouseup") {
    SDL.buttonState &= ~(1 << event.button);
   }

  case "mousemove":
   {
    Browser.calculateMouseEvent(event);
    break;
   }
  }
 },
 flushEventsToHandler: function() {
  if (!SDL.eventHandler) return;
  while (SDL.pollEvent(SDL.eventHandlerTemp)) {
   Module["dynCall_iii"](SDL.eventHandler, SDL.eventHandlerContext, SDL.eventHandlerTemp);
  }
 },
 pollEvent: function(ptr) {
  if (SDL.initFlags & 512 && SDL.joystickEventState) {
   SDL.queryJoysticks();
  }
  if (ptr) {
   while (SDL.events.length > 0) {
    if (SDL.makeCEvent(SDL.events.shift(), ptr) !== false) return 1;
   }
   return 0;
  } else {
   return SDL.events.length > 0;
  }
 },
 makeCEvent: function(event, ptr) {
  if (typeof event === "number") {
   _memcpy(ptr, event, 28);
   _free(event);
   return;
  }
  SDL.handleEvent(event);
  switch (event.type) {
  case "keydown":
  case "keyup":
   {
    var down = event.type === "keydown";
    var key = SDL.lookupKeyCodeForEvent(event);
    var scan;
    if (key >= 1024) {
     scan = key - 1024;
    } else {
     scan = SDL.scanCodes[key] || key;
    }
    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
    HEAP8[ptr + 8 >> 0] = down ? 1 : 0;
    HEAP8[ptr + 9 >> 0] = 0;
    HEAP32[ptr + 12 >> 2] = scan;
    HEAP32[ptr + 16 >> 2] = key;
    HEAP16[ptr + 20 >> 1] = SDL.modState;
    HEAP32[ptr + 24 >> 2] = event.keypressCharCode || key;
    break;
   }

  case "keypress":
   {
    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
    var cStr = intArrayFromString(String.fromCharCode(event.charCode));
    for (var i = 0; i < cStr.length; ++i) {
     HEAP8[ptr + (8 + i) >> 0] = cStr[i];
    }
    break;
   }

  case "mousedown":
  case "mouseup":
  case "mousemove":
   {
    if (event.type != "mousemove") {
     var down = event.type === "mousedown";
     HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
     HEAP32[ptr + 4 >> 2] = 0;
     HEAP32[ptr + 8 >> 2] = 0;
     HEAP32[ptr + 12 >> 2] = 0;
     HEAP8[ptr + 16 >> 0] = event.button + 1;
     HEAP8[ptr + 17 >> 0] = down ? 1 : 0;
     HEAP32[ptr + 20 >> 2] = Browser.mouseX;
     HEAP32[ptr + 24 >> 2] = Browser.mouseY;
    } else {
     HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
     HEAP32[ptr + 4 >> 2] = 0;
     HEAP32[ptr + 8 >> 2] = 0;
     HEAP32[ptr + 12 >> 2] = 0;
     HEAP32[ptr + 16 >> 2] = SDL.buttonState;
     HEAP32[ptr + 20 >> 2] = Browser.mouseX;
     HEAP32[ptr + 24 >> 2] = Browser.mouseY;
     HEAP32[ptr + 28 >> 2] = Browser.mouseMovementX;
     HEAP32[ptr + 32 >> 2] = Browser.mouseMovementY;
    }
    break;
   }

  case "wheel":
   {
    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
    HEAP32[ptr + 16 >> 2] = event.deltaX;
    HEAP32[ptr + 20 >> 2] = event.deltaY;
    break;
   }

  case "touchstart":
  case "touchend":
  case "touchmove":
   {
    var touch = event.touch;
    if (!Browser.touches[touch.identifier]) break;
    var w = Module["canvas"].width;
    var h = Module["canvas"].height;
    var x = Browser.touches[touch.identifier].x / w;
    var y = Browser.touches[touch.identifier].y / h;
    var lx = Browser.lastTouches[touch.identifier].x / w;
    var ly = Browser.lastTouches[touch.identifier].y / h;
    var dx = x - lx;
    var dy = y - ly;
    if (touch["deviceID"] === undefined) touch.deviceID = SDL.TOUCH_DEFAULT_ID;
    if (dx === 0 && dy === 0 && event.type === "touchmove") return false;
    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
    HEAP32[ptr + 4 >> 2] = _SDL_GetTicks();
    tempI64 = [ touch.deviceID >>> 0, (tempDouble = touch.deviceID, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
    HEAP32[ptr + 8 >> 2] = tempI64[0], HEAP32[ptr + 12 >> 2] = tempI64[1];
    tempI64 = [ touch.identifier >>> 0, (tempDouble = touch.identifier, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
    HEAP32[ptr + 16 >> 2] = tempI64[0], HEAP32[ptr + 20 >> 2] = tempI64[1];
    HEAPF32[ptr + 24 >> 2] = x;
    HEAPF32[ptr + 28 >> 2] = y;
    HEAPF32[ptr + 32 >> 2] = dx;
    HEAPF32[ptr + 36 >> 2] = dy;
    if (touch.force !== undefined) {
     HEAPF32[ptr + 40 >> 2] = touch.force;
    } else {
     HEAPF32[ptr + 40 >> 2] = event.type == "touchend" ? 0 : 1;
    }
    break;
   }

  case "unload":
   {
    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
    break;
   }

  case "resize":
   {
    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
    HEAP32[ptr + 4 >> 2] = event.w;
    HEAP32[ptr + 8 >> 2] = event.h;
    break;
   }

  case "joystick_button_up":
  case "joystick_button_down":
   {
    var state = event.type === "joystick_button_up" ? 0 : 1;
    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
    HEAP8[ptr + 4 >> 0] = event.index;
    HEAP8[ptr + 5 >> 0] = event.button;
    HEAP8[ptr + 6 >> 0] = state;
    break;
   }

  case "joystick_axis_motion":
   {
    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
    HEAP8[ptr + 4 >> 0] = event.index;
    HEAP8[ptr + 5 >> 0] = event.axis;
    HEAP32[ptr + 8 >> 2] = SDL.joystickAxisValueConversion(event.value);
    break;
   }

  case "focus":
   {
    var SDL_WINDOWEVENT_FOCUS_GAINED = 12;
    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
    HEAP32[ptr + 4 >> 2] = 0;
    HEAP8[ptr + 8 >> 0] = SDL_WINDOWEVENT_FOCUS_GAINED;
    break;
   }

  case "blur":
   {
    var SDL_WINDOWEVENT_FOCUS_LOST = 13;
    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
    HEAP32[ptr + 4 >> 2] = 0;
    HEAP8[ptr + 8 >> 0] = SDL_WINDOWEVENT_FOCUS_LOST;
    break;
   }

  case "visibilitychange":
   {
    var SDL_WINDOWEVENT_SHOWN = 1;
    var SDL_WINDOWEVENT_HIDDEN = 2;
    var visibilityEventID = event.visible ? SDL_WINDOWEVENT_SHOWN : SDL_WINDOWEVENT_HIDDEN;
    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
    HEAP32[ptr + 4 >> 2] = 0;
    HEAP8[ptr + 8 >> 0] = visibilityEventID;
    break;
   }

  default:
   throw "Unhandled SDL event: " + event.type;
  }
 },
 makeFontString: function(height, fontName) {
  if (fontName.charAt(0) != "'" && fontName.charAt(0) != '"') {
   fontName = '"' + fontName + '"';
  }
  return height + "px " + fontName + ", serif";
 },
 estimateTextWidth: function(fontData, text) {
  var h = fontData.size;
  var fontString = SDL.makeFontString(h, fontData.name);
  var tempCtx = SDL.ttfContext;
  assert(tempCtx, "TTF_Init must have been called");
  tempCtx.font = fontString;
  var ret = tempCtx.measureText(text).width | 0;
  return ret;
 },
 allocateChannels: function(num) {
  if (SDL.numChannels && SDL.numChannels >= num && num != 0) return;
  SDL.numChannels = num;
  SDL.channels = [];
  for (var i = 0; i < num; i++) {
   SDL.channels[i] = {
    audio: null,
    volume: 1
   };
  }
 },
 setGetVolume: function(info, volume) {
  if (!info) return 0;
  var ret = info.volume * 128;
  if (volume != -1) {
   info.volume = Math.min(Math.max(volume, 0), 128) / 128;
   if (info.audio) {
    try {
     info.audio.volume = info.volume;
     if (info.audio.webAudioGainNode) info.audio.webAudioGainNode["gain"]["value"] = info.volume;
    } catch (e) {
     err("setGetVolume failed to set audio volume: " + e);
    }
   }
  }
  return ret;
 },
 setPannerPosition: function(info, x, y, z) {
  if (!info) return;
  if (info.audio) {
   if (info.audio.webAudioPannerNode) {
    info.audio.webAudioPannerNode["setPosition"](x, y, z);
   }
  }
 },
 playWebAudio: function(audio) {
  if (!audio) return;
  if (audio.webAudioNode) return;
  if (!SDL.webAudioAvailable()) return;
  try {
   var webAudio = audio.resource.webAudio;
   audio.paused = false;
   if (!webAudio.decodedBuffer) {
    if (webAudio.onDecodeComplete === undefined) abort("Cannot play back audio object that was not loaded");
    webAudio.onDecodeComplete.push(function() {
     if (!audio.paused) SDL.playWebAudio(audio);
    });
    return;
   }
   audio.webAudioNode = SDL.audioContext["createBufferSource"]();
   audio.webAudioNode["buffer"] = webAudio.decodedBuffer;
   audio.webAudioNode["loop"] = audio.loop;
   audio.webAudioNode["onended"] = function() {
    audio["onended"]();
   };
   audio.webAudioPannerNode = SDL.audioContext["createPanner"]();
   audio.webAudioPannerNode["setPosition"](0, 0, -.5);
   audio.webAudioPannerNode["panningModel"] = "equalpower";
   audio.webAudioGainNode = SDL.audioContext["createGain"]();
   audio.webAudioGainNode["gain"]["value"] = audio.volume;
   audio.webAudioNode["connect"](audio.webAudioPannerNode);
   audio.webAudioPannerNode["connect"](audio.webAudioGainNode);
   audio.webAudioGainNode["connect"](SDL.audioContext["destination"]);
   audio.webAudioNode["start"](0, audio.currentPosition);
   audio.startTime = SDL.audioContext["currentTime"] - audio.currentPosition;
  } catch (e) {
   err("playWebAudio failed: " + e);
  }
 },
 pauseWebAudio: function(audio) {
  if (!audio) return;
  if (audio.webAudioNode) {
   try {
    audio.currentPosition = (SDL.audioContext["currentTime"] - audio.startTime) % audio.resource.webAudio.decodedBuffer.duration;
    audio.webAudioNode["onended"] = undefined;
    audio.webAudioNode.stop(0);
    audio.webAudioNode = undefined;
   } catch (e) {
    err("pauseWebAudio failed: " + e);
   }
  }
  audio.paused = true;
 },
 openAudioContext: function() {
  if (!SDL.audioContext) {
   if (typeof AudioContext !== "undefined") SDL.audioContext = new AudioContext(); else if (typeof webkitAudioContext !== "undefined") SDL.audioContext = new webkitAudioContext();
  }
 },
 webAudioAvailable: function() {
  return !!SDL.audioContext;
 },
 fillWebAudioBufferFromHeap: function(heapPtr, sizeSamplesPerChannel, dstAudioBuffer) {
  var numChannels = SDL.audio.channels;
  for (var c = 0; c < numChannels; ++c) {
   var channelData = dstAudioBuffer["getChannelData"](c);
   if (channelData.length != sizeSamplesPerChannel) {
    throw "Web Audio output buffer length mismatch! Destination size: " + channelData.length + " samples vs expected " + sizeSamplesPerChannel + " samples!";
   }
   if (SDL.audio.format == 32784) {
    for (var j = 0; j < sizeSamplesPerChannel; ++j) {
     channelData[j] = HEAP16[heapPtr + (j * numChannels + c) * 2 >> 1] / 32768;
    }
   } else if (SDL.audio.format == 8) {
    for (var j = 0; j < sizeSamplesPerChannel; ++j) {
     var v = HEAP8[heapPtr + (j * numChannels + c) >> 0];
     channelData[j] = (v >= 0 ? v - 128 : v + 128) / 128;
    }
   } else if (SDL.audio.format == 33056) {
    for (var j = 0; j < sizeSamplesPerChannel; ++j) {
     channelData[j] = HEAPF32[heapPtr + (j * numChannels + c) * 4 >> 2];
    }
   } else {
    throw "Invalid SDL audio format " + SDL.audio.format + "!";
   }
  }
 },
 debugSurface: function(surfData) {
  console.log("dumping surface " + [ surfData.surf, surfData.source, surfData.width, surfData.height ]);
  var image = surfData.ctx.getImageData(0, 0, surfData.width, surfData.height);
  var data = image.data;
  var num = Math.min(surfData.width, surfData.height);
  for (var i = 0; i < num; i++) {
   console.log("   diagonal " + i + ":" + [ data[i * surfData.width * 4 + i * 4 + 0], data[i * surfData.width * 4 + i * 4 + 1], data[i * surfData.width * 4 + i * 4 + 2], data[i * surfData.width * 4 + i * 4 + 3] ]);
  }
 },
 joystickEventState: 1,
 lastJoystickState: {},
 joystickNamePool: {},
 recordJoystickState: function(joystick, state) {
  var buttons = new Array(state.buttons.length);
  for (var i = 0; i < state.buttons.length; i++) {
   buttons[i] = SDL.getJoystickButtonState(state.buttons[i]);
  }
  SDL.lastJoystickState[joystick] = {
   buttons: buttons,
   axes: state.axes.slice(0),
   timestamp: state.timestamp,
   index: state.index,
   id: state.id
  };
 },
 getJoystickButtonState: function(button) {
  if (typeof button === "object") {
   return button["pressed"];
  } else {
   return button > 0;
  }
 },
 queryJoysticks: function() {
  for (var joystick in SDL.lastJoystickState) {
   var state = SDL.getGamepad(joystick - 1);
   var prevState = SDL.lastJoystickState[joystick];
   if (typeof state === "undefined") return;
   if (state === null) return;
   if (typeof state.timestamp !== "number" || state.timestamp !== prevState.timestamp || !state.timestamp) {
    var i;
    for (i = 0; i < state.buttons.length; i++) {
     var buttonState = SDL.getJoystickButtonState(state.buttons[i]);
     if (buttonState !== prevState.buttons[i]) {
      SDL.events.push({
       type: buttonState ? "joystick_button_down" : "joystick_button_up",
       joystick: joystick,
       index: joystick - 1,
       button: i
      });
     }
    }
    for (i = 0; i < state.axes.length; i++) {
     if (state.axes[i] !== prevState.axes[i]) {
      SDL.events.push({
       type: "joystick_axis_motion",
       joystick: joystick,
       index: joystick - 1,
       axis: i,
       value: state.axes[i]
      });
     }
    }
    SDL.recordJoystickState(joystick, state);
   }
  }
 },
 joystickAxisValueConversion: function(value) {
  value = Math.min(1, Math.max(value, -1));
  return Math.ceil((value + 1) * 32767.5 - 32768);
 },
 getGamepads: function() {
  var fcn = navigator.getGamepads || navigator.webkitGamepads || navigator.mozGamepads || navigator.gamepads || navigator.webkitGetGamepads;
  if (fcn !== undefined) {
   return fcn.apply(navigator);
  } else {
   return [];
  }
 },
 getGamepad: function(deviceIndex) {
  var gamepads = SDL.getGamepads();
  if (gamepads.length > deviceIndex && deviceIndex >= 0) {
   return gamepads[deviceIndex];
  }
  return null;
 }
};

Module["SDL"] = SDL;

function _SDL_Linked_Version() {
 if (SDL.version === null) {
  SDL.version = _malloc(3);
  HEAP8[SDL.version + 0 >> 0] = 1;
  HEAP8[SDL.version + 1 >> 0] = 3;
  HEAP8[SDL.version + 2 >> 0] = 0;
 }
 return SDL.version;
}

Module["_SDL_Linked_Version"] = _SDL_Linked_Version;

function _SDL_Init(initFlags) {
 SDL.startTime = Date.now();
 SDL.initFlags = initFlags;
 if (!Module["doNotCaptureKeyboard"]) {
  var keyboardListeningElement = Module["keyboardListeningElement"] || document;
  keyboardListeningElement.addEventListener("keydown", SDL.receiveEvent);
  keyboardListeningElement.addEventListener("keyup", SDL.receiveEvent);
  keyboardListeningElement.addEventListener("keypress", SDL.receiveEvent);
  window.addEventListener("focus", SDL.receiveEvent);
  window.addEventListener("blur", SDL.receiveEvent);
  document.addEventListener("visibilitychange", SDL.receiveEvent);
 }
 window.addEventListener("unload", SDL.receiveEvent);
 SDL.keyboardState = _malloc(65536);
 _memset(SDL.keyboardState, 0, 65536);
 SDL.DOMEventToSDLEvent["keydown"] = 768;
 SDL.DOMEventToSDLEvent["keyup"] = 769;
 SDL.DOMEventToSDLEvent["keypress"] = 771;
 SDL.DOMEventToSDLEvent["mousedown"] = 1025;
 SDL.DOMEventToSDLEvent["mouseup"] = 1026;
 SDL.DOMEventToSDLEvent["mousemove"] = 1024;
 SDL.DOMEventToSDLEvent["wheel"] = 1027;
 SDL.DOMEventToSDLEvent["touchstart"] = 1792;
 SDL.DOMEventToSDLEvent["touchend"] = 1793;
 SDL.DOMEventToSDLEvent["touchmove"] = 1794;
 SDL.DOMEventToSDLEvent["unload"] = 256;
 SDL.DOMEventToSDLEvent["resize"] = 28673;
 SDL.DOMEventToSDLEvent["visibilitychange"] = 512;
 SDL.DOMEventToSDLEvent["focus"] = 512;
 SDL.DOMEventToSDLEvent["blur"] = 512;
 SDL.DOMEventToSDLEvent["joystick_axis_motion"] = 1536;
 SDL.DOMEventToSDLEvent["joystick_button_down"] = 1539;
 SDL.DOMEventToSDLEvent["joystick_button_up"] = 1540;
 return 0;
}

Module["_SDL_Init"] = _SDL_Init;

function _SDL_WasInit() {
 if (SDL.startTime === null) {
  _SDL_Init();
 }
 return 1;
}

Module["_SDL_WasInit"] = _SDL_WasInit;

function _SDL_GetVideoInfo() {
 var ret = _malloc(5 * 4);
 HEAP32[ret + 0 >> 2] = 0;
 HEAP32[ret + 4 >> 2] = 0;
 HEAP32[ret + 8 >> 2] = 0;
 HEAP32[ret + 12 >> 2] = Module["canvas"].width;
 HEAP32[ret + 16 >> 2] = Module["canvas"].height;
 return ret;
}

Module["_SDL_GetVideoInfo"] = _SDL_GetVideoInfo;

function _SDL_ListModes(format, flags) {
 return -1;
}

Module["_SDL_ListModes"] = _SDL_ListModes;

function _SDL_VideoModeOK(width, height, depth, flags) {
 return depth;
}

Module["_SDL_VideoModeOK"] = _SDL_VideoModeOK;

function _SDL_VideoDriverName(buf, max_size) {
 if (SDL.startTime === null) {
  return 0;
 }
 var driverName = [ 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 95, 115, 100, 108, 95, 100, 114, 105, 118, 101, 114 ];
 var index = 0;
 var size = driverName.length;
 if (max_size <= size) {
  size = max_size - 1;
 }
 while (index < size) {
  var value = driverName[index];
  HEAP8[buf + index >> 0] = value;
  index++;
 }
 HEAP8[buf + index >> 0] = 0;
 return buf;
}

Module["_SDL_VideoDriverName"] = _SDL_VideoDriverName;

function _SDL_AudioDriverName(buf, max_size) {
 return _SDL_VideoDriverName(buf, max_size);
}

Module["_SDL_AudioDriverName"] = _SDL_AudioDriverName;

function _SDL_SetVideoMode(width, height, depth, flags) {
 [ "touchstart", "touchend", "touchmove", "mousedown", "mouseup", "mousemove", "DOMMouseScroll", "mousewheel", "wheel", "mouseout" ].forEach(function(event) {
  Module["canvas"].addEventListener(event, SDL.receiveEvent, true);
 });
 var canvas = Module["canvas"];
 if (width == 0 && height == 0) {
  width = canvas.width;
  height = canvas.height;
 }
 if (!SDL.addedResizeListener) {
  SDL.addedResizeListener = true;
  Browser.resizeListeners.push(function(w, h) {
   if (!SDL.settingVideoMode) {
    SDL.receiveEvent({
     type: "resize",
     w: w,
     h: h
    });
   }
  });
 }
 SDL.settingVideoMode = true;
 Browser.setCanvasSize(width, height);
 SDL.settingVideoMode = false;
 if (SDL.screen) {
  SDL.freeSurface(SDL.screen);
  assert(!SDL.screen);
 }
 if (SDL.GL) flags = flags | 67108864;
 SDL.screen = SDL.makeSurface(width, height, flags, true, "screen");
 return SDL.screen;
}

Module["_SDL_SetVideoMode"] = _SDL_SetVideoMode;

function _SDL_GetVideoSurface() {
 return SDL.screen;
}

Module["_SDL_GetVideoSurface"] = _SDL_GetVideoSurface;

function _SDL_AudioQuit() {
 for (var i = 0; i < SDL.numChannels; ++i) {
  if (SDL.channels[i].audio) {
   SDL.channels[i].audio.pause();
   SDL.channels[i].audio = undefined;
  }
 }
 if (SDL.music.audio) SDL.music.audio.pause();
 SDL.music.audio = undefined;
}

Module["_SDL_AudioQuit"] = _SDL_AudioQuit;

function _SDL_VideoQuit() {
 out("SDL_VideoQuit called (and ignored)");
}

Module["_SDL_VideoQuit"] = _SDL_VideoQuit;

function _SDL_QuitSubSystem(flags) {
 out("SDL_QuitSubSystem called (and ignored)");
}

Module["_SDL_QuitSubSystem"] = _SDL_QuitSubSystem;

function _SDL_Quit() {
 _SDL_AudioQuit();
 out("SDL_Quit called (and ignored)");
}

Module["_SDL_Quit"] = _SDL_Quit;

function _SDL_UnlockSurface(surf) {
 assert(!SDL.GL);
 var surfData = SDL.surfaces[surf];
 if (!surfData.locked || --surfData.locked > 0) {
  return;
 }
 if (surfData.isFlagSet(2097152)) {
  SDL.copyIndexedColorData(surfData);
 } else if (!surfData.colors) {
  var data = surfData.image.data;
  var buffer = surfData.buffer;
  assert(buffer % 4 == 0, "Invalid buffer offset: " + buffer);
  var src = buffer >> 2;
  var dst = 0;
  var isScreen = surf == SDL.screen;
  var num;
  if (typeof CanvasPixelArray !== "undefined" && data instanceof CanvasPixelArray) {
   num = data.length;
   while (dst < num) {
    var val = HEAP32[src];
    data[dst] = val & 255;
    data[dst + 1] = val >> 8 & 255;
    data[dst + 2] = val >> 16 & 255;
    data[dst + 3] = isScreen ? 255 : val >> 24 & 255;
    src++;
    dst += 4;
   }
  } else {
   var data32 = new Uint32Array(data.buffer);
   if (isScreen && SDL.defaults.opaqueFrontBuffer) {
    num = data32.length;
    data32.set(HEAP32.subarray(src, src + num));
    var data8 = new Uint8Array(data.buffer);
    var i = 3;
    var j = i + 4 * num;
    if (num % 8 == 0) {
     while (i < j) {
      data8[i] = 255;
      i = i + 4 | 0;
      data8[i] = 255;
      i = i + 4 | 0;
      data8[i] = 255;
      i = i + 4 | 0;
      data8[i] = 255;
      i = i + 4 | 0;
      data8[i] = 255;
      i = i + 4 | 0;
      data8[i] = 255;
      i = i + 4 | 0;
      data8[i] = 255;
      i = i + 4 | 0;
      data8[i] = 255;
      i = i + 4 | 0;
     }
    } else {
     while (i < j) {
      data8[i] = 255;
      i = i + 4 | 0;
     }
    }
   } else {
    data32.set(HEAP32.subarray(src, src + data32.length));
   }
  }
 } else {
  var width = Module["canvas"].width;
  var height = Module["canvas"].height;
  var s = surfData.buffer;
  var data = surfData.image.data;
  var colors = surfData.colors;
  for (var y = 0; y < height; y++) {
   var base = y * width * 4;
   for (var x = 0; x < width; x++) {
    var val = HEAPU8[s++ >> 0] * 4;
    var start = base + x * 4;
    data[start] = colors[val];
    data[start + 1] = colors[val + 1];
    data[start + 2] = colors[val + 2];
   }
   s += width * 3;
  }
 }
 surfData.ctx.putImageData(surfData.image, 0, 0);
}

Module["_SDL_UnlockSurface"] = _SDL_UnlockSurface;

function _SDL_Flip(surf) {}

Module["_SDL_Flip"] = _SDL_Flip;

function _SDL_UpdateRect(surf, x, y, w, h) {}

Module["_SDL_UpdateRect"] = _SDL_UpdateRect;

function _SDL_UpdateRects(surf, numrects, rects) {}

Module["_SDL_UpdateRects"] = _SDL_UpdateRects;

function _SDL_Delay(delay) {
 if (!ENVIRONMENT_IS_WORKER) abort("SDL_Delay called on the main thread! Potential infinite loop, quitting. (consider building with async support like ASYNCIFY)");
 var now = Date.now();
 while (Date.now() - now < delay) {}
}

Module["_SDL_Delay"] = _SDL_Delay;

function _SDL_WM_SetCaption(title, icon) {
 if (title && typeof setWindowTitle !== "undefined") {
  setWindowTitle(UTF8ToString(title));
 }
 icon = icon && UTF8ToString(icon);
}

Module["_SDL_WM_SetCaption"] = _SDL_WM_SetCaption;

function _SDL_EnableKeyRepeat(delay, interval) {}

Module["_SDL_EnableKeyRepeat"] = _SDL_EnableKeyRepeat;

function _SDL_GetKeyboardState(numKeys) {
 if (numKeys) {
  HEAP32[numKeys >> 2] = 65536;
 }
 return SDL.keyboardState;
}

Module["_SDL_GetKeyboardState"] = _SDL_GetKeyboardState;

function _SDL_GetKeyState() {
 return _SDL_GetKeyboardState();
}

Module["_SDL_GetKeyState"] = _SDL_GetKeyState;

function _SDL_GetKeyName(key) {
 if (!SDL.keyName) {
  SDL.keyName = allocate(intArrayFromString("unknown key"), "i8", ALLOC_NORMAL);
 }
 return SDL.keyName;
}

Module["_SDL_GetKeyName"] = _SDL_GetKeyName;

function _SDL_GetModState() {
 return SDL.modState;
}

Module["_SDL_GetModState"] = _SDL_GetModState;

function _SDL_GetMouseState(x, y) {
 if (x) HEAP32[x >> 2] = Browser.mouseX;
 if (y) HEAP32[y >> 2] = Browser.mouseY;
 return SDL.buttonState;
}

Module["_SDL_GetMouseState"] = _SDL_GetMouseState;

function _SDL_WarpMouse(x, y) {
 return;
}

Module["_SDL_WarpMouse"] = _SDL_WarpMouse;

function _SDL_ShowCursor(toggle) {
 switch (toggle) {
 case 0:
  if (Browser.isFullscreen) {
   Module["canvas"].requestPointerLock();
   return 0;
  } else {
   return 1;
  }
  break;

 case 1:
  Module["canvas"].exitPointerLock();
  return 1;
  break;

 case -1:
  return !Browser.pointerLock;
  break;

 default:
  console.log("SDL_ShowCursor called with unknown toggle parameter value: " + toggle + ".");
  break;
 }
}

Module["_SDL_ShowCursor"] = _SDL_ShowCursor;

function _SDL_GetError() {
 if (!SDL.errorMessage) {
  SDL.errorMessage = allocate(intArrayFromString("unknown SDL-emscripten error"), "i8", ALLOC_NORMAL);
 }
 return SDL.errorMessage;
}

Module["_SDL_GetError"] = _SDL_GetError;

function _SDL_SetError() {}

Module["_SDL_SetError"] = _SDL_SetError;

function _SDL_malloc() {
 return _malloc.apply(null, arguments);
}

Module["_SDL_malloc"] = _SDL_malloc;

function _SDL_free() {
 return _free.apply(null, arguments);
}

Module["_SDL_free"] = _SDL_free;

function _SDL_CreateRGBSurface(flags, width, height, depth, rmask, gmask, bmask, amask) {
 return SDL.makeSurface(width, height, flags, false, "CreateRGBSurface", rmask, gmask, bmask, amask);
}

Module["_SDL_CreateRGBSurface"] = _SDL_CreateRGBSurface;

function _SDL_CreateRGBSurfaceFrom(pixels, width, height, depth, pitch, rmask, gmask, bmask, amask) {
 var surf = SDL.makeSurface(width, height, 0, false, "CreateRGBSurfaceFrom", rmask, gmask, bmask, amask);
 if (depth !== 32) {
  console.log("TODO: Partially unimplemented SDL_CreateRGBSurfaceFrom called!");
  return surf;
 }
 var data = SDL.surfaces[surf];
 var image = data.ctx.createImageData(width, height);
 var pitchOfDst = width * 4;
 for (var row = 0; row < height; ++row) {
  var baseOfSrc = row * pitch;
  var baseOfDst = row * pitchOfDst;
  for (var col = 0; col < width * 4; ++col) {
   image.data[baseOfDst + col] = HEAPU8[pixels + (baseOfDst + col) >> 0];
  }
 }
 data.ctx.putImageData(image, 0, 0);
 return surf;
}

Module["_SDL_CreateRGBSurfaceFrom"] = _SDL_CreateRGBSurfaceFrom;

function _SDL_ConvertSurface(surf, format, flags) {
 if (format) {
  SDL.checkPixelFormat(format);
 }
 var oldData = SDL.surfaces[surf];
 var ret = SDL.makeSurface(oldData.width, oldData.height, oldData.flags, false, "copy:" + oldData.source);
 var newData = SDL.surfaces[ret];
 newData.ctx.globalCompositeOperation = "copy";
 newData.ctx.drawImage(oldData.canvas, 0, 0);
 newData.ctx.globalCompositeOperation = oldData.ctx.globalCompositeOperation;
 return ret;
}

Module["_SDL_ConvertSurface"] = _SDL_ConvertSurface;

function _SDL_DisplayFormatAlpha(surf) {
 return _SDL_ConvertSurface(surf);
}

Module["_SDL_DisplayFormatAlpha"] = _SDL_DisplayFormatAlpha;

function _SDL_FreeSurface(surf) {
 if (surf) SDL.freeSurface(surf);
}

Module["_SDL_FreeSurface"] = _SDL_FreeSurface;

function _SDL_UpperBlit(src, srcrect, dst, dstrect) {
 return SDL.blitSurface(src, srcrect, dst, dstrect, false);
}

Module["_SDL_UpperBlit"] = _SDL_UpperBlit;

function _SDL_UpperBlitScaled(src, srcrect, dst, dstrect) {
 return SDL.blitSurface(src, srcrect, dst, dstrect, true);
}

Module["_SDL_UpperBlitScaled"] = _SDL_UpperBlitScaled;

function _SDL_LowerBlit() {
 return _SDL_UpperBlit.apply(null, arguments);
}

Module["_SDL_LowerBlit"] = _SDL_LowerBlit;

function _SDL_LowerBlitScaled() {
 return _SDL_UpperBlitScaled.apply(null, arguments);
}

Module["_SDL_LowerBlitScaled"] = _SDL_LowerBlitScaled;

function _SDL_GetClipRect(surf, rect) {
 assert(rect);
 var surfData = SDL.surfaces[surf];
 var r = surfData.clipRect || {
  x: 0,
  y: 0,
  w: surfData.width,
  h: surfData.height
 };
 SDL.updateRect(rect, r);
}

Module["_SDL_GetClipRect"] = _SDL_GetClipRect;

function _SDL_SetClipRect(surf, rect) {
 var surfData = SDL.surfaces[surf];
 if (rect) {
  surfData.clipRect = SDL.intersectionOfRects({
   x: 0,
   y: 0,
   w: surfData.width,
   h: surfData.height
  }, SDL.loadRect(rect));
 } else {
  delete surfData.clipRect;
 }
}

Module["_SDL_SetClipRect"] = _SDL_SetClipRect;

function _SDL_FillRect(surf, rect, color) {
 var surfData = SDL.surfaces[surf];
 assert(!surfData.locked);
 if (surfData.isFlagSet(2097152)) {
  color = surfData.colors32[color];
 }
 var r = rect ? SDL.loadRect(rect) : {
  x: 0,
  y: 0,
  w: surfData.width,
  h: surfData.height
 };
 if (surfData.clipRect) {
  r = SDL.intersectionOfRects(surfData.clipRect, r);
  if (rect) {
   SDL.updateRect(rect, r);
  }
 }
 surfData.ctx.save();
 surfData.ctx.fillStyle = SDL.translateColorToCSSRGBA(color);
 surfData.ctx.fillRect(r.x, r.y, r.w, r.h);
 surfData.ctx.restore();
 return 0;
}

Module["_SDL_FillRect"] = _SDL_FillRect;

function _SDL_BlitSurface(src, srcrect, dst, dstrect) {
 return SDL.blitSurface(src, srcrect, dst, dstrect, false);
}

Module["_SDL_BlitSurface"] = _SDL_BlitSurface;

function _SDL_BlitScaled(src, srcrect, dst, dstrect) {
 return SDL.blitSurface(src, srcrect, dst, dstrect, true);
}

Module["_SDL_BlitScaled"] = _SDL_BlitScaled;

function _zoomSurface(src, x, y, smooth) {
 var srcData = SDL.surfaces[src];
 var w = srcData.width * x;
 var h = srcData.height * y;
 var ret = SDL.makeSurface(Math.abs(w), Math.abs(h), srcData.flags, false, "zoomSurface");
 var dstData = SDL.surfaces[ret];
 if (x >= 0 && y >= 0) dstData.ctx.drawImage(srcData.canvas, 0, 0, w, h); else {
  dstData.ctx.save();
  dstData.ctx.scale(x < 0 ? -1 : 1, y < 0 ? -1 : 1);
  dstData.ctx.drawImage(srcData.canvas, w < 0 ? w : 0, h < 0 ? h : 0, Math.abs(w), Math.abs(h));
  dstData.ctx.restore();
 }
 return ret;
}

Module["_zoomSurface"] = _zoomSurface;

function _rotozoomSurface(src, angle, zoom, smooth) {
 if (angle % 360 === 0) {
  return _zoomSurface(src, zoom, zoom, smooth);
 }
 var srcData = SDL.surfaces[src];
 var w = srcData.width * zoom;
 var h = srcData.height * zoom;
 var diagonal = Math.ceil(Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2)));
 var ret = SDL.makeSurface(diagonal, diagonal, srcData.flags, false, "rotozoomSurface");
 var dstData = SDL.surfaces[ret];
 dstData.ctx.translate(diagonal / 2, diagonal / 2);
 dstData.ctx.rotate(-angle * Math.PI / 180);
 dstData.ctx.drawImage(srcData.canvas, -w / 2, -h / 2, w, h);
 return ret;
}

Module["_rotozoomSurface"] = _rotozoomSurface;

function _SDL_SetAlpha(surf, flag, alpha) {
 var surfData = SDL.surfaces[surf];
 surfData.alpha = alpha;
 if (!(flag & 65536)) {
  surfData.alpha = 255;
 }
}

Module["_SDL_SetAlpha"] = _SDL_SetAlpha;

function _SDL_SetColorKey(surf, flag, key) {
 warnOnce("SDL_SetColorKey is a no-op for performance reasons");
 return 0;
}

Module["_SDL_SetColorKey"] = _SDL_SetColorKey;

function _SDL_PollEvent(ptr) {
 return SDL.pollEvent(ptr);
}

Module["_SDL_PollEvent"] = _SDL_PollEvent;

function _SDL_PushEvent(ptr) {
 var copy = _malloc(28);
 _memcpy(copy, ptr, 28);
 SDL.events.push(copy);
 return 0;
}

Module["_SDL_PushEvent"] = _SDL_PushEvent;

function _SDL_PeepEvents(events, requestedEventCount, action, from, to) {
 switch (action) {
 case 2:
  {
   assert(requestedEventCount == 1);
   var index = 0;
   var retrievedEventCount = 0;
   while (index < SDL.events.length && retrievedEventCount < requestedEventCount) {
    var event = SDL.events[index];
    var type = SDL.DOMEventToSDLEvent[event.type];
    if (from <= type && type <= to) {
     if (SDL.makeCEvent(event, events) === false) {
      index++;
     } else {
      SDL.events.splice(index, 1);
      retrievedEventCount++;
     }
    } else {
     index++;
    }
   }
   return retrievedEventCount;
  }

 default:
  throw "SDL_PeepEvents does not yet support that action: " + action;
 }
}

Module["_SDL_PeepEvents"] = _SDL_PeepEvents;

function _SDL_PumpEvents() {
 SDL.events.forEach(function(event) {
  SDL.handleEvent(event);
 });
}

Module["_SDL_PumpEvents"] = _SDL_PumpEvents;

function _emscripten_SDL_SetEventHandler(handler, userdata) {
 SDL.eventHandler = handler;
 SDL.eventHandlerContext = userdata;
 if (!SDL.eventHandlerTemp) SDL.eventHandlerTemp = _malloc(28);
}

Module["_emscripten_SDL_SetEventHandler"] = _emscripten_SDL_SetEventHandler;

function _SDL_SetColors(surf, colors, firstColor, nColors) {
 var surfData = SDL.surfaces[surf];
 if (!surfData.colors) {
  var buffer = new ArrayBuffer(256 * 4);
  surfData.colors = new Uint8Array(buffer);
  surfData.colors32 = new Uint32Array(buffer);
 }
 for (var i = 0; i < nColors; ++i) {
  var index = (firstColor + i) * 4;
  surfData.colors[index] = HEAPU8[colors + i * 4 >> 0];
  surfData.colors[index + 1] = HEAPU8[colors + (i * 4 + 1) >> 0];
  surfData.colors[index + 2] = HEAPU8[colors + (i * 4 + 2) >> 0];
  surfData.colors[index + 3] = 255;
 }
 return 1;
}

Module["_SDL_SetColors"] = _SDL_SetColors;

function _SDL_SetPalette(surf, flags, colors, firstColor, nColors) {
 return _SDL_SetColors(surf, colors, firstColor, nColors);
}

Module["_SDL_SetPalette"] = _SDL_SetPalette;

function _SDL_MapRGB(fmt, r, g, b) {
 SDL.checkPixelFormat(fmt);
 return r & 255 | (g & 255) << 8 | (b & 255) << 16 | 4278190080;
}

Module["_SDL_MapRGB"] = _SDL_MapRGB;

function _SDL_MapRGBA(fmt, r, g, b, a) {
 SDL.checkPixelFormat(fmt);
 return r & 255 | (g & 255) << 8 | (b & 255) << 16 | (a & 255) << 24;
}

Module["_SDL_MapRGBA"] = _SDL_MapRGBA;

function _SDL_GetRGB(pixel, fmt, r, g, b) {
 SDL.checkPixelFormat(fmt);
 if (r) {
  HEAP8[r >> 0] = pixel & 255;
 }
 if (g) {
  HEAP8[g >> 0] = pixel >> 8 & 255;
 }
 if (b) {
  HEAP8[b >> 0] = pixel >> 16 & 255;
 }
}

Module["_SDL_GetRGB"] = _SDL_GetRGB;

function _SDL_GetRGBA(pixel, fmt, r, g, b, a) {
 SDL.checkPixelFormat(fmt);
 if (r) {
  HEAP8[r >> 0] = pixel & 255;
 }
 if (g) {
  HEAP8[g >> 0] = pixel >> 8 & 255;
 }
 if (b) {
  HEAP8[b >> 0] = pixel >> 16 & 255;
 }
 if (a) {
  HEAP8[a >> 0] = pixel >> 24 & 255;
 }
}

Module["_SDL_GetRGBA"] = _SDL_GetRGBA;

function _SDL_GetAppState() {
 var state = 0;
 if (Browser.pointerLock) {
  state |= 1;
 }
 if (document.hasFocus()) {
  state |= 2;
 }
 state |= 4;
 return state;
}

Module["_SDL_GetAppState"] = _SDL_GetAppState;

function _SDL_WM_GrabInput() {}

Module["_SDL_WM_GrabInput"] = _SDL_WM_GrabInput;

function _SDL_WM_ToggleFullScreen(surf) {
 if (Browser.exitFullscreen()) {
  return 1;
 } else {
  if (!SDL.canRequestFullscreen) {
   return 0;
  }
  SDL.isRequestingFullscreen = true;
  return 1;
 }
}

Module["_SDL_WM_ToggleFullScreen"] = _SDL_WM_ToggleFullScreen;

function _IMG_Init(flags) {
 return flags;
}

Module["_IMG_Init"] = _IMG_Init;

function _SDL_FreeRW(rwopsID) {
 SDL.rwops[rwopsID] = null;
 while (SDL.rwops.length > 0 && SDL.rwops[SDL.rwops.length - 1] === null) {
  SDL.rwops.pop();
 }
}

Module["_SDL_FreeRW"] = _SDL_FreeRW;

function _IMG_Load_RW(rwopsID, freeSrc) {
 try {
  var cleanup = function() {
   if (rwops && freeSrc) _SDL_FreeRW(rwopsID);
  };
  var rwops = SDL.rwops[rwopsID];
  if (rwops === undefined) {
   return 0;
  }
  var filename = rwops.filename;
  if (filename === undefined) {
   warnOnce("Only file names that have been preloaded are supported for IMG_Load_RW. Consider using STB_IMAGE=1 if you want synchronous image decoding (see settings.js), or package files with --use-preload-plugins");
   return 0;
  }
  if (!raw) {
   filename = PATH_FS.resolve(filename);
   var raw = Module["preloadedImages"][filename];
   if (!raw) {
    if (raw === null) err("Trying to reuse preloaded image, but freePreloadedMediaOnUse is set!");
    warnOnce("Cannot find preloaded image " + filename);
    warnOnce("Cannot find preloaded image " + filename + ". Consider using STB_IMAGE=1 if you want synchronous image decoding (see settings.js), or package files with --use-preload-plugins");
    return 0;
   } else if (Module["freePreloadedMediaOnUse"]) {
    Module["preloadedImages"][filename] = null;
   }
  }
  var surf = SDL.makeSurface(raw.width, raw.height, 0, false, "load:" + filename);
  var surfData = SDL.surfaces[surf];
  surfData.ctx.globalCompositeOperation = "copy";
  if (!raw.rawData) {
   surfData.ctx.drawImage(raw, 0, 0, raw.width, raw.height, 0, 0, raw.width, raw.height);
  } else {
   var imageData = surfData.ctx.getImageData(0, 0, surfData.width, surfData.height);
   if (raw.bpp == 4) {
    imageData.data.set(HEAPU8.subarray(raw.data, raw.data + raw.size));
   } else if (raw.bpp == 3) {
    var pixels = raw.size / 3;
    var data = imageData.data;
    var sourcePtr = raw.data;
    var destPtr = 0;
    for (var i = 0; i < pixels; i++) {
     data[destPtr++] = HEAPU8[sourcePtr++ >> 0];
     data[destPtr++] = HEAPU8[sourcePtr++ >> 0];
     data[destPtr++] = HEAPU8[sourcePtr++ >> 0];
     data[destPtr++] = 255;
    }
   } else if (raw.bpp == 2) {
    var pixels = raw.size;
    var data = imageData.data;
    var sourcePtr = raw.data;
    var destPtr = 0;
    for (var i = 0; i < pixels; i++) {
     var gray = HEAPU8[sourcePtr++ >> 0];
     var alpha = HEAPU8[sourcePtr++ >> 0];
     data[destPtr++] = gray;
     data[destPtr++] = gray;
     data[destPtr++] = gray;
     data[destPtr++] = alpha;
    }
   } else if (raw.bpp == 1) {
    var pixels = raw.size;
    var data = imageData.data;
    var sourcePtr = raw.data;
    var destPtr = 0;
    for (var i = 0; i < pixels; i++) {
     var value = HEAPU8[sourcePtr++ >> 0];
     data[destPtr++] = value;
     data[destPtr++] = value;
     data[destPtr++] = value;
     data[destPtr++] = 255;
    }
   } else {
    err("cannot handle bpp " + raw.bpp);
    return 0;
   }
   surfData.ctx.putImageData(imageData, 0, 0);
  }
  surfData.ctx.globalCompositeOperation = "source-over";
  _SDL_LockSurface(surf);
  surfData.locked--;
  if (SDL.GL) {
   surfData.canvas = surfData.ctx = null;
  }
  return surf;
 } finally {
  cleanup();
 }
}

Module["_IMG_Load_RW"] = _IMG_Load_RW;

function _SDL_RWFromFile(_name, mode) {
 var id = SDL.rwops.length;
 var name = UTF8ToString(_name);
 SDL.rwops.push({
  filename: name,
  mimetype: Browser.getMimetype(name)
 });
 return id;
}

Module["_SDL_RWFromFile"] = _SDL_RWFromFile;

function _IMG_Load(filename) {
 var rwops = _SDL_RWFromFile(filename);
 var result = _IMG_Load_RW(rwops, 1);
 return result;
}

Module["_IMG_Load"] = _IMG_Load;

function _SDL_LoadBMP() {
 return _IMG_Load.apply(null, arguments);
}

Module["_SDL_LoadBMP"] = _SDL_LoadBMP;

function _SDL_LoadBMP_RW() {
 return _IMG_Load_RW.apply(null, arguments);
}

Module["_SDL_LoadBMP_RW"] = _SDL_LoadBMP_RW;

function _IMG_Quit() {
 out("IMG_Quit called (and ignored)");
}

Module["_IMG_Quit"] = _IMG_Quit;

function _SDL_OpenAudio(desired, obtained) {
 try {
  SDL.audio = {
   freq: HEAPU32[desired >> 2],
   format: HEAPU16[desired + 4 >> 1],
   channels: HEAPU8[desired + 6 >> 0],
   samples: HEAPU16[desired + 8 >> 1],
   callback: HEAPU32[desired + 16 >> 2],
   userdata: HEAPU32[desired + 20 >> 2],
   paused: true,
   timer: null
  };
  if (SDL.audio.format == 8) {
   SDL.audio.silence = 128;
  } else if (SDL.audio.format == 32784) {
   SDL.audio.silence = 0;
  } else if (SDL.audio.format == 33056) {
   SDL.audio.silence = 0;
  } else {
   throw "Invalid SDL audio format " + SDL.audio.format + "!";
  }
  if (SDL.audio.freq <= 0) {
   throw "Unsupported sound frequency " + SDL.audio.freq + "!";
  } else if (SDL.audio.freq <= 22050) {
   SDL.audio.freq = 22050;
  } else if (SDL.audio.freq <= 32e3) {
   SDL.audio.freq = 32e3;
  } else if (SDL.audio.freq <= 44100) {
   SDL.audio.freq = 44100;
  } else if (SDL.audio.freq <= 48e3) {
   SDL.audio.freq = 48e3;
  } else if (SDL.audio.freq <= 96e3) {
   SDL.audio.freq = 96e3;
  } else {
   throw "Unsupported sound frequency " + SDL.audio.freq + "!";
  }
  if (SDL.audio.channels == 0) {
   SDL.audio.channels = 1;
  } else if (SDL.audio.channels < 0 || SDL.audio.channels > 32) {
   throw "Unsupported number of audio channels for SDL audio: " + SDL.audio.channels + "!";
  } else if (SDL.audio.channels != 1 && SDL.audio.channels != 2) {
   console.log("Warning: Using untested number of audio channels " + SDL.audio.channels);
  }
  if (SDL.audio.samples < 128 || SDL.audio.samples > 524288) {
   throw "Unsupported audio callback buffer size " + SDL.audio.samples + "!";
  } else if ((SDL.audio.samples & SDL.audio.samples - 1) != 0) {
   throw "Audio callback buffer size " + SDL.audio.samples + " must be a power-of-two!";
  }
  var totalSamples = SDL.audio.samples * SDL.audio.channels;
  if (SDL.audio.format == 8) {
   SDL.audio.bytesPerSample = 1;
  } else if (SDL.audio.format == 32784) {
   SDL.audio.bytesPerSample = 2;
  } else if (SDL.audio.format == 33056) {
   SDL.audio.bytesPerSample = 4;
  } else {
   throw "Invalid SDL audio format " + SDL.audio.format + "!";
  }
  SDL.audio.bufferSize = totalSamples * SDL.audio.bytesPerSample;
  SDL.audio.bufferDurationSecs = SDL.audio.bufferSize / SDL.audio.bytesPerSample / SDL.audio.channels / SDL.audio.freq;
  SDL.audio.bufferingDelay = 50 / 1e3;
  SDL.audio.buffer = _malloc(SDL.audio.bufferSize);
  SDL.audio.numSimultaneouslyQueuedBuffers = Module["SDL_numSimultaneouslyQueuedBuffers"] || 5;
  SDL.audio.queueNewAudioData = function SDL_queueNewAudioData() {
   if (!SDL.audio) return;
   for (var i = 0; i < SDL.audio.numSimultaneouslyQueuedBuffers; ++i) {
    var secsUntilNextPlayStart = SDL.audio.nextPlayTime - SDL.audioContext["currentTime"];
    if (secsUntilNextPlayStart >= SDL.audio.bufferingDelay + SDL.audio.bufferDurationSecs * SDL.audio.numSimultaneouslyQueuedBuffers) return;
    dynCall_viii(SDL.audio.callback, SDL.audio.userdata, SDL.audio.buffer, SDL.audio.bufferSize);
    SDL.audio.pushAudio(SDL.audio.buffer, SDL.audio.bufferSize);
   }
  };
  SDL.audio.caller = function SDL_audioCaller() {
   if (!SDL.audio) return;
   --SDL.audio.numAudioTimersPending;
   SDL.audio.queueNewAudioData();
   var secsUntilNextPlayStart = SDL.audio.nextPlayTime - SDL.audioContext["currentTime"];
   var preemptBufferFeedSecs = SDL.audio.bufferDurationSecs / 2;
   if (SDL.audio.numAudioTimersPending < SDL.audio.numSimultaneouslyQueuedBuffers) {
    ++SDL.audio.numAudioTimersPending;
    SDL.audio.timer = Browser.safeSetTimeout(SDL.audio.caller, Math.max(0, 1e3 * (secsUntilNextPlayStart - preemptBufferFeedSecs)));
    if (SDL.audio.numAudioTimersPending < SDL.audio.numSimultaneouslyQueuedBuffers) {
     ++SDL.audio.numAudioTimersPending;
     Browser.safeSetTimeout(SDL.audio.caller, 1);
    }
   }
  };
  SDL.audio.audioOutput = new Audio();
  SDL.openAudioContext();
  if (!SDL.audioContext) throw "Web Audio API is not available!";
  SDL.audio.nextPlayTime = 0;
  SDL.audio.pushAudio = function(ptr, sizeBytes) {
   try {
    if (SDL.audio.paused) return;
    var sizeSamples = sizeBytes / SDL.audio.bytesPerSample;
    var sizeSamplesPerChannel = sizeSamples / SDL.audio.channels;
    if (sizeSamplesPerChannel != SDL.audio.samples) {
     throw "Received mismatching audio buffer size!";
    }
    var source = SDL.audioContext["createBufferSource"]();
    var soundBuffer = SDL.audioContext["createBuffer"](SDL.audio.channels, sizeSamplesPerChannel, SDL.audio.freq);
    source["connect"](SDL.audioContext["destination"]);
    SDL.fillWebAudioBufferFromHeap(ptr, sizeSamplesPerChannel, soundBuffer);
    source["buffer"] = soundBuffer;
    var curtime = SDL.audioContext["currentTime"];
    if (curtime > SDL.audio.nextPlayTime && SDL.audio.nextPlayTime != 0) {
     console.log("warning: Audio callback had starved sending audio by " + (curtime - SDL.audio.nextPlayTime) + " seconds.");
    }
    var playtime = Math.max(curtime + SDL.audio.bufferingDelay, SDL.audio.nextPlayTime);
    if (typeof source["start"] !== "undefined") {
     source["start"](playtime);
    } else if (typeof source["noteOn"] !== "undefined") {
     source["noteOn"](playtime);
    }
    SDL.audio.nextPlayTime = playtime + SDL.audio.bufferDurationSecs;
   } catch (e) {
    console.log("Web Audio API error playing back audio: " + e.toString());
   }
  };
  if (obtained) {
   HEAP32[obtained >> 2] = SDL.audio.freq;
   HEAP16[obtained + 4 >> 1] = SDL.audio.format;
   HEAP8[obtained + 6 >> 0] = SDL.audio.channels;
   HEAP8[obtained + 7 >> 0] = SDL.audio.silence;
   HEAP16[obtained + 8 >> 1] = SDL.audio.samples;
   HEAP32[obtained + 16 >> 2] = SDL.audio.callback;
   HEAP32[obtained + 20 >> 2] = SDL.audio.userdata;
  }
  SDL.allocateChannels(32);
 } catch (e) {
  console.log('Initializing SDL audio threw an exception: "' + e.toString() + '"! Continuing without audio.');
  SDL.audio = null;
  SDL.allocateChannels(0);
  if (obtained) {
   HEAP32[obtained >> 2] = 0;
   HEAP16[obtained + 4 >> 1] = 0;
   HEAP8[obtained + 6 >> 0] = 0;
   HEAP8[obtained + 7 >> 0] = 0;
   HEAP16[obtained + 8 >> 1] = 0;
   HEAP32[obtained + 16 >> 2] = 0;
   HEAP32[obtained + 20 >> 2] = 0;
  }
 }
 if (!SDL.audio) {
  return -1;
 }
 return 0;
}

Module["_SDL_OpenAudio"] = _SDL_OpenAudio;

function _SDL_PauseAudio(pauseOn) {
 if (!SDL.audio) {
  return;
 }
 if (pauseOn) {
  if (SDL.audio.timer !== undefined) {
   clearTimeout(SDL.audio.timer);
   SDL.audio.numAudioTimersPending = 0;
   SDL.audio.timer = undefined;
  }
 } else if (!SDL.audio.timer) {
  SDL.audio.numAudioTimersPending = 1;
  SDL.audio.timer = Browser.safeSetTimeout(SDL.audio.caller, 1);
 }
 SDL.audio.paused = pauseOn;
}

Module["_SDL_PauseAudio"] = _SDL_PauseAudio;

function _SDL_CloseAudio() {
 if (SDL.audio) {
  if (SDL.audio.callbackRemover) {
   SDL.audio.callbackRemover();
   SDL.audio.callbackRemover = null;
  }
  _SDL_PauseAudio(1);
  _free(SDL.audio.buffer);
  SDL.audio = null;
  SDL.allocateChannels(0);
 }
}

Module["_SDL_CloseAudio"] = _SDL_CloseAudio;

function _SDL_LockAudio() {}

Module["_SDL_LockAudio"] = _SDL_LockAudio;

function _SDL_UnlockAudio() {}

Module["_SDL_UnlockAudio"] = _SDL_UnlockAudio;

function _SDL_CreateMutex() {
 return 0;
}

Module["_SDL_CreateMutex"] = _SDL_CreateMutex;

function _SDL_LockMutex() {}

Module["_SDL_LockMutex"] = _SDL_LockMutex;

function _SDL_UnlockMutex() {}

Module["_SDL_UnlockMutex"] = _SDL_UnlockMutex;

function _SDL_mutexP() {
 return 0;
}

Module["_SDL_mutexP"] = _SDL_mutexP;

function _SDL_mutexV() {
 return 0;
}

Module["_SDL_mutexV"] = _SDL_mutexV;

function _SDL_DestroyMutex() {}

Module["_SDL_DestroyMutex"] = _SDL_DestroyMutex;

function _SDL_CreateCond() {
 return 0;
}

Module["_SDL_CreateCond"] = _SDL_CreateCond;

function _SDL_CondSignal() {}

Module["_SDL_CondSignal"] = _SDL_CondSignal;

function _SDL_CondWait() {}

Module["_SDL_CondWait"] = _SDL_CondWait;

function _SDL_DestroyCond() {}

Module["_SDL_DestroyCond"] = _SDL_DestroyCond;

function _SDL_StartTextInput() {
 SDL.textInput = true;
}

Module["_SDL_StartTextInput"] = _SDL_StartTextInput;

function _SDL_StopTextInput() {
 SDL.textInput = false;
}

Module["_SDL_StopTextInput"] = _SDL_StopTextInput;

function _Mix_Init(flags) {
 if (!flags) return 0;
 return 8;
}

Module["_Mix_Init"] = _Mix_Init;

function _Mix_Quit() {}

Module["_Mix_Quit"] = _Mix_Quit;

function _Mix_OpenAudio(frequency, format, channels, chunksize) {
 SDL.openAudioContext();
 SDL.allocateChannels(32);
 SDL.mixerFrequency = frequency;
 SDL.mixerFormat = format;
 SDL.mixerNumChannels = channels;
 SDL.mixerChunkSize = chunksize;
 return 0;
}

Module["_Mix_OpenAudio"] = _Mix_OpenAudio;

function _Mix_CloseAudio() {
 return _SDL_CloseAudio.apply(null, arguments);
}

Module["_Mix_CloseAudio"] = _Mix_CloseAudio;

function _Mix_AllocateChannels(num) {
 SDL.allocateChannels(num);
 return num;
}

Module["_Mix_AllocateChannels"] = _Mix_AllocateChannels;

function _Mix_ChannelFinished(func) {
 SDL.channelFinished = func;
}

Module["_Mix_ChannelFinished"] = _Mix_ChannelFinished;

function _Mix_Volume(channel, volume) {
 if (channel == -1) {
  for (var i = 0; i < SDL.numChannels - 1; i++) {
   _Mix_Volume(i, volume);
  }
  return _Mix_Volume(SDL.numChannels - 1, volume);
 }
 return SDL.setGetVolume(SDL.channels[channel], volume);
}

Module["_Mix_Volume"] = _Mix_Volume;

function _Mix_SetPanning(channel, left, right) {
 left /= 255;
 right /= 255;
 SDL.setPannerPosition(SDL.channels[channel], right - left, 0, .1);
 return 1;
}

Module["_Mix_SetPanning"] = _Mix_SetPanning;

function _Mix_LoadWAV_RW(rwopsID, freesrc) {
 var rwops = SDL.rwops[rwopsID];
 if (rwops === undefined) return 0;
 var filename = "";
 var audio;
 var webAudio;
 var bytes;
 if (rwops.filename !== undefined) {
  filename = PATH_FS.resolve(rwops.filename);
  var raw = Module["preloadedAudios"][filename];
  if (!raw) {
   if (raw === null) err("Trying to reuse preloaded audio, but freePreloadedMediaOnUse is set!");
   if (!Module.noAudioDecoding) warnOnce("Cannot find preloaded audio " + filename);
   try {
    bytes = FS.readFile(filename);
   } catch (e) {
    err("Couldn't find file for: " + filename);
    return 0;
   }
  }
  if (Module["freePreloadedMediaOnUse"]) {
   Module["preloadedAudios"][filename] = null;
  }
  audio = raw;
 } else if (rwops.bytes !== undefined) {
  if (SDL.webAudioAvailable()) bytes = HEAPU8.buffer.slice(rwops.bytes, rwops.bytes + rwops.count); else bytes = HEAPU8.subarray(rwops.bytes, rwops.bytes + rwops.count);
 } else {
  return 0;
 }
 var arrayBuffer = bytes ? bytes.buffer || bytes : bytes;
 var canPlayWithWebAudio = Module["SDL_canPlayWithWebAudio"] === undefined || Module["SDL_canPlayWithWebAudio"](filename, arrayBuffer);
 if (bytes !== undefined && SDL.webAudioAvailable() && canPlayWithWebAudio) {
  audio = undefined;
  webAudio = {};
  webAudio.onDecodeComplete = [];
  var onDecodeComplete = function(data) {
   webAudio.decodedBuffer = data;
   webAudio.onDecodeComplete.forEach(function(e) {
    e();
   });
   webAudio.onDecodeComplete = undefined;
  };
  SDL.audioContext["decodeAudioData"](arrayBuffer, onDecodeComplete);
 } else if (audio === undefined && bytes) {
  var blob = new Blob([ bytes ], {
   type: rwops.mimetype
  });
  var url = URL.createObjectURL(blob);
  audio = new Audio();
  audio.src = url;
  audio.mozAudioChannelType = "content";
 }
 var id = SDL.audios.length;
 SDL.audios.push({
  source: filename,
  audio: audio,
  webAudio: webAudio
 });
 return id;
}

Module["_Mix_LoadWAV_RW"] = _Mix_LoadWAV_RW;

function _Mix_LoadWAV(filename) {
 var rwops = _SDL_RWFromFile(filename);
 var result = _Mix_LoadWAV_RW(rwops);
 _SDL_FreeRW(rwops);
 return result;
}

Module["_Mix_LoadWAV"] = _Mix_LoadWAV;

function _Mix_QuickLoad_RAW(mem, len) {
 var audio;
 var webAudio;
 var numSamples = len >> 1;
 var buffer = new Float32Array(numSamples);
 for (var i = 0; i < numSamples; ++i) {
  buffer[i] = HEAP16[mem + i * 2 >> 1] / 32768;
 }
 if (SDL.webAudioAvailable()) {
  webAudio = {};
  webAudio.decodedBuffer = buffer;
 } else {
  var audio = new Audio();
  audio.mozAudioChannelType = "content";
  audio.numChannels = SDL.mixerNumChannels;
  audio.frequency = SDL.mixerFrequency;
 }
 var id = SDL.audios.length;
 SDL.audios.push({
  source: "",
  audio: audio,
  webAudio: webAudio,
  buffer: buffer
 });
 return id;
}

Module["_Mix_QuickLoad_RAW"] = _Mix_QuickLoad_RAW;

function _Mix_FreeChunk(id) {
 SDL.audios[id] = null;
}

Module["_Mix_FreeChunk"] = _Mix_FreeChunk;

function _Mix_ReserveChannels(num) {
 SDL.channelMinimumNumber = num;
}

Module["_Mix_ReserveChannels"] = _Mix_ReserveChannels;

function _Mix_PlayChannel(channel, id, loops) {
 var info = SDL.audios[id];
 if (!info) return -1;
 if (!info.audio && !info.webAudio) return -1;
 if (channel == -1) {
  for (var i = SDL.channelMinimumNumber; i < SDL.numChannels; i++) {
   if (!SDL.channels[i].audio) {
    channel = i;
    break;
   }
  }
  if (channel == -1) {
   err("All " + SDL.numChannels + " channels in use!");
   return -1;
  }
 }
 var channelInfo = SDL.channels[channel];
 var audio;
 if (info.webAudio) {
  audio = {};
  audio.resource = info;
  audio.paused = false;
  audio.currentPosition = 0;
  audio.play = function() {
   SDL.playWebAudio(this);
  };
  audio.pause = function() {
   SDL.pauseWebAudio(this);
  };
 } else {
  audio = info.audio.cloneNode(true);
  audio.numChannels = info.audio.numChannels;
  audio.frequency = info.audio.frequency;
 }
 audio["onended"] = function SDL_audio_onended() {
  if (channelInfo.audio == this) {
   channelInfo.audio.paused = true;
   channelInfo.audio = null;
  }
  if (SDL.channelFinished) getFuncWrapper(SDL.channelFinished, "vi")(channel);
 };
 channelInfo.audio = audio;
 audio.loop = loops != 0;
 audio.volume = channelInfo.volume;
 audio.play();
 return channel;
}

Module["_Mix_PlayChannel"] = _Mix_PlayChannel;

function _Mix_PlayChannelTimed() {
 return _Mix_PlayChannel.apply(null, arguments);
}

Module["_Mix_PlayChannelTimed"] = _Mix_PlayChannelTimed;

function _Mix_FadingChannel(channel) {
 return 0;
}

Module["_Mix_FadingChannel"] = _Mix_FadingChannel;

function _Mix_HaltChannel(channel) {
 function halt(channel) {
  var info = SDL.channels[channel];
  if (info.audio) {
   info.audio.pause();
   info.audio = null;
  }
  if (SDL.channelFinished) {
   getFuncWrapper(SDL.channelFinished, "vi")(channel);
  }
 }
 if (channel != -1) {
  halt(channel);
 } else {
  for (var i = 0; i < SDL.channels.length; ++i) halt(i);
 }
 return 0;
}

Module["_Mix_HaltChannel"] = _Mix_HaltChannel;

function _Mix_HaltMusic() {
 var audio = SDL.music.audio;
 if (audio) {
  audio.src = audio.src;
  audio.currentPosition = 0;
  audio.pause();
 }
 SDL.music.audio = null;
 if (SDL.hookMusicFinished) {
  dynCall_v(SDL.hookMusicFinished);
 }
 return 0;
}

Module["_Mix_HaltMusic"] = _Mix_HaltMusic;

function _Mix_HookMusicFinished(func) {
 SDL.hookMusicFinished = func;
 if (SDL.music.audio) {
  SDL.music.audio["onended"] = _Mix_HaltMusic;
 }
}

Module["_Mix_HookMusicFinished"] = _Mix_HookMusicFinished;

function _Mix_VolumeMusic(volume) {
 return SDL.setGetVolume(SDL.music, volume);
}

Module["_Mix_VolumeMusic"] = _Mix_VolumeMusic;

function _Mix_LoadMUS_RW() {
 return _Mix_LoadWAV_RW.apply(null, arguments);
}

Module["_Mix_LoadMUS_RW"] = _Mix_LoadMUS_RW;

function _Mix_LoadMUS(filename) {
 var rwops = _SDL_RWFromFile(filename);
 var result = _Mix_LoadMUS_RW(rwops);
 _SDL_FreeRW(rwops);
 return result;
}

Module["_Mix_LoadMUS"] = _Mix_LoadMUS;

function _Mix_FreeMusic() {
 return _Mix_FreeChunk.apply(null, arguments);
}

Module["_Mix_FreeMusic"] = _Mix_FreeMusic;

function _Mix_PlayMusic(id, loops) {
 if (SDL.music.audio) {
  if (!SDL.music.audio.paused) err("Music is already playing. " + SDL.music.source);
  SDL.music.audio.pause();
 }
 var info = SDL.audios[id];
 var audio;
 if (info.webAudio) {
  audio = {};
  audio.resource = info;
  audio.paused = false;
  audio.currentPosition = 0;
  audio.play = function() {
   SDL.playWebAudio(this);
  };
  audio.pause = function() {
   SDL.pauseWebAudio(this);
  };
 } else if (info.audio) {
  audio = info.audio;
 }
 audio["onended"] = function() {
  if (SDL.music.audio == this) _Mix_HaltMusic();
 };
 audio.loop = loops != 0;
 audio.volume = SDL.music.volume;
 SDL.music.audio = audio;
 audio.play();
 return 0;
}

Module["_Mix_PlayMusic"] = _Mix_PlayMusic;

function _Mix_PauseMusic() {
 var audio = SDL.music.audio;
 if (audio) audio.pause();
}

Module["_Mix_PauseMusic"] = _Mix_PauseMusic;

function _Mix_ResumeMusic() {
 var audio = SDL.music.audio;
 if (audio) audio.play();
}

Module["_Mix_ResumeMusic"] = _Mix_ResumeMusic;

function _Mix_FadeInMusicPos() {
 return _Mix_PlayMusic.apply(null, arguments);
}

Module["_Mix_FadeInMusicPos"] = _Mix_FadeInMusicPos;

function _Mix_FadeOutMusic() {
 return _Mix_HaltMusic.apply(null, arguments);
}

Module["_Mix_FadeOutMusic"] = _Mix_FadeOutMusic;

function _Mix_PlayingMusic() {
 return SDL.music.audio && !SDL.music.audio.paused ? 1 : 0;
}

Module["_Mix_PlayingMusic"] = _Mix_PlayingMusic;

function _Mix_Playing(channel) {
 if (channel === -1) {
  var count = 0;
  for (var i = 0; i < SDL.channels.length; i++) {
   count += _Mix_Playing(i);
  }
  return count;
 }
 var info = SDL.channels[channel];
 if (info && info.audio && !info.audio.paused) {
  return 1;
 }
 return 0;
}

Module["_Mix_Playing"] = _Mix_Playing;

function _Mix_Pause(channel) {
 if (channel === -1) {
  for (var i = 0; i < SDL.channels.length; i++) {
   _Mix_Pause(i);
  }
  return;
 }
 var info = SDL.channels[channel];
 if (info && info.audio) {
  info.audio.pause();
 } else {}
}

Module["_Mix_Pause"] = _Mix_Pause;

function _Mix_Paused(channel) {
 if (channel === -1) {
  var pausedCount = 0;
  for (var i = 0; i < SDL.channels.length; i++) {
   pausedCount += _Mix_Paused(i);
  }
  return pausedCount;
 }
 var info = SDL.channels[channel];
 if (info && info.audio && info.audio.paused) {
  return 1;
 }
 return 0;
}

Module["_Mix_Paused"] = _Mix_Paused;

function _Mix_PausedMusic() {
 return SDL.music.audio && SDL.music.audio.paused ? 1 : 0;
}

Module["_Mix_PausedMusic"] = _Mix_PausedMusic;

function _Mix_Resume(channel) {
 if (channel === -1) {
  for (var i = 0; i < SDL.channels.length; i++) {
   _Mix_Resume(i);
  }
  return;
 }
 var info = SDL.channels[channel];
 if (info && info.audio) info.audio.play();
}

Module["_Mix_Resume"] = _Mix_Resume;

function _TTF_Init() {
 try {
  var offscreenCanvas = new OffscreenCanvas(0, 0);
  SDL.ttfContext = offscreenCanvas.getContext("2d");
 } catch (ex) {
  var canvas = document.createElement("canvas");
  SDL.ttfContext = canvas.getContext("2d");
 }
 return 0;
}

Module["_TTF_Init"] = _TTF_Init;

function _TTF_OpenFont(filename, size) {
 filename = PATH.normalize(UTF8ToString(filename));
 var id = SDL.fonts.length;
 SDL.fonts.push({
  name: filename,
  size: size
 });
 return id;
}

Module["_TTF_OpenFont"] = _TTF_OpenFont;

function _TTF_CloseFont(font) {
 SDL.fonts[font] = null;
}

Module["_TTF_CloseFont"] = _TTF_CloseFont;

function _TTF_RenderText_Solid(font, text, color) {
 text = UTF8ToString(text) || " ";
 var fontData = SDL.fonts[font];
 var w = SDL.estimateTextWidth(fontData, text);
 var h = fontData.size;
 color = SDL.loadColorToCSSRGB(color);
 var fontString = SDL.makeFontString(h, fontData.name);
 var surf = SDL.makeSurface(w, h, 0, false, "text:" + text);
 var surfData = SDL.surfaces[surf];
 surfData.ctx.save();
 surfData.ctx.fillStyle = color;
 surfData.ctx.font = fontString;
 surfData.ctx.textBaseline = "bottom";
 surfData.ctx.fillText(text, 0, h | 0);
 surfData.ctx.restore();
 return surf;
}

Module["_TTF_RenderText_Solid"] = _TTF_RenderText_Solid;

function _TTF_RenderText_Blended() {
 return _TTF_RenderText_Solid.apply(null, arguments);
}

Module["_TTF_RenderText_Blended"] = _TTF_RenderText_Blended;

function _TTF_RenderText_Shaded() {
 return _TTF_RenderText_Solid.apply(null, arguments);
}

Module["_TTF_RenderText_Shaded"] = _TTF_RenderText_Shaded;

function _TTF_RenderUTF8_Solid() {
 return _TTF_RenderText_Solid.apply(null, arguments);
}

Module["_TTF_RenderUTF8_Solid"] = _TTF_RenderUTF8_Solid;

function _TTF_SizeText(font, text, w, h) {
 var fontData = SDL.fonts[font];
 if (w) {
  HEAP32[w >> 2] = SDL.estimateTextWidth(fontData, UTF8ToString(text));
 }
 if (h) {
  HEAP32[h >> 2] = fontData.size;
 }
 return 0;
}

Module["_TTF_SizeText"] = _TTF_SizeText;

function _TTF_SizeUTF8() {
 return _TTF_SizeText.apply(null, arguments);
}

Module["_TTF_SizeUTF8"] = _TTF_SizeUTF8;

function _TTF_GlyphMetrics(font, ch, minx, maxx, miny, maxy, advance) {
 var fontData = SDL.fonts[font];
 var width = SDL.estimateTextWidth(fontData, String.fromCharCode(ch));
 if (advance) {
  HEAP32[advance >> 2] = width;
 }
 if (minx) {
  HEAP32[minx >> 2] = 0;
 }
 if (maxx) {
  HEAP32[maxx >> 2] = width;
 }
 if (miny) {
  HEAP32[miny >> 2] = 0;
 }
 if (maxy) {
  HEAP32[maxy >> 2] = fontData.size;
 }
}

Module["_TTF_GlyphMetrics"] = _TTF_GlyphMetrics;

function _TTF_FontAscent(font) {
 var fontData = SDL.fonts[font];
 return fontData.size * .98 | 0;
}

Module["_TTF_FontAscent"] = _TTF_FontAscent;

function _TTF_FontDescent(font) {
 var fontData = SDL.fonts[font];
 return fontData.size * .02 | 0;
}

Module["_TTF_FontDescent"] = _TTF_FontDescent;

function _TTF_FontHeight(font) {
 var fontData = SDL.fonts[font];
 return fontData.size;
}

Module["_TTF_FontHeight"] = _TTF_FontHeight;

function _TTF_FontLineSkip() {
 return _TTF_FontHeight.apply(null, arguments);
}

Module["_TTF_FontLineSkip"] = _TTF_FontLineSkip;

function _TTF_Quit() {
 out("TTF_Quit called (and ignored)");
}

Module["_TTF_Quit"] = _TTF_Quit;

var SDL_gfx = {
 drawRectangle: function(surf, x1, y1, x2, y2, action, cssColor) {
  x1 = x1 << 16 >> 16;
  y1 = y1 << 16 >> 16;
  x2 = x2 << 16 >> 16;
  y2 = y2 << 16 >> 16;
  var surfData = SDL.surfaces[surf];
  assert(!surfData.locked);
  var x = x1 < x2 ? x1 : x2;
  var y = y1 < y2 ? y1 : y2;
  var w = Math.abs(x2 - x1);
  var h = Math.abs(y2 - y1);
  surfData.ctx.save();
  surfData.ctx[action + "Style"] = cssColor;
  surfData.ctx[action + "Rect"](x, y, w, h);
  surfData.ctx.restore();
 },
 drawLine: function(surf, x1, y1, x2, y2, cssColor) {
  x1 = x1 << 16 >> 16;
  y1 = y1 << 16 >> 16;
  x2 = x2 << 16 >> 16;
  y2 = y2 << 16 >> 16;
  var surfData = SDL.surfaces[surf];
  assert(!surfData.locked);
  surfData.ctx.save();
  surfData.ctx.strokeStyle = cssColor;
  surfData.ctx.beginPath();
  surfData.ctx.moveTo(x1, y1);
  surfData.ctx.lineTo(x2, y2);
  surfData.ctx.stroke();
  surfData.ctx.restore();
 },
 drawEllipse: function(surf, x, y, rx, ry, action, cssColor) {
  x = x << 16 >> 16;
  y = y << 16 >> 16;
  rx = rx << 16 >> 16;
  ry = ry << 16 >> 16;
  var surfData = SDL.surfaces[surf];
  assert(!surfData.locked);
  surfData.ctx.save();
  surfData.ctx.beginPath();
  surfData.ctx.translate(x, y);
  surfData.ctx.scale(rx, ry);
  surfData.ctx.arc(0, 0, 1, 0, 2 * Math.PI);
  surfData.ctx.restore();
  surfData.ctx.save();
  surfData.ctx[action + "Style"] = cssColor;
  surfData.ctx[action]();
  surfData.ctx.restore();
 },
 translateColorToCSSRGBA: function(rgba) {
  return "rgba(" + (rgba >>> 24) + "," + (rgba >> 16 & 255) + "," + (rgba >> 8 & 255) + "," + (rgba & 255) + ")";
 }
};

Module["SDL_gfx"] = SDL_gfx;

function _boxColor(surf, x1, y1, x2, y2, color) {
 return SDL_gfx.drawRectangle(surf, x1, y1, x2, y2, "fill", SDL_gfx.translateColorToCSSRGBA(color));
}

Module["_boxColor"] = _boxColor;

function _boxRGBA(surf, x1, y1, x2, y2, r, g, b, a) {
 return SDL_gfx.drawRectangle(surf, x1, y1, x2, y2, "fill", SDL.translateRGBAToCSSRGBA(r, g, b, a));
}

Module["_boxRGBA"] = _boxRGBA;

function _rectangleColor(surf, x1, y1, x2, y2, color) {
 return SDL_gfx.drawRectangle(surf, x1, y1, x2, y2, "stroke", SDL_gfx.translateColorToCSSRGBA(color));
}

Module["_rectangleColor"] = _rectangleColor;

function _rectangleRGBA(surf, x1, y1, x2, y2, r, g, b, a) {
 return SDL_gfx.drawRectangle(surf, x1, y1, x2, y2, "stroke", SDL.translateRGBAToCSSRGBA(r, g, b, a));
}

Module["_rectangleRGBA"] = _rectangleRGBA;

function _ellipseColor(surf, x, y, rx, ry, color) {
 return SDL_gfx.drawEllipse(surf, x, y, rx, ry, "stroke", SDL_gfx.translateColorToCSSRGBA(color));
}

Module["_ellipseColor"] = _ellipseColor;

function _ellipseRGBA(surf, x, y, rx, ry, r, g, b, a) {
 return SDL_gfx.drawEllipse(surf, x, y, rx, ry, "stroke", SDL.translateRGBAToCSSRGBA(r, g, b, a));
}

Module["_ellipseRGBA"] = _ellipseRGBA;

function _filledEllipseColor(surf, x, y, rx, ry, color) {
 return SDL_gfx.drawEllipse(surf, x, y, rx, ry, "fill", SDL_gfx.translateColorToCSSRGBA(color));
}

Module["_filledEllipseColor"] = _filledEllipseColor;

function _filledEllipseRGBA(surf, x, y, rx, ry, r, g, b, a) {
 return SDL_gfx.drawEllipse(surf, x, y, rx, ry, "fill", SDL.translateRGBAToCSSRGBA(r, g, b, a));
}

Module["_filledEllipseRGBA"] = _filledEllipseRGBA;

function _lineColor(surf, x1, y1, x2, y2, color) {
 return SDL_gfx.drawLine(surf, x1, y1, x2, y2, SDL_gfx.translateColorToCSSRGBA(color));
}

Module["_lineColor"] = _lineColor;

function _lineRGBA(surf, x1, y1, x2, y2, r, g, b, a) {
 return SDL_gfx.drawLine(surf, x1, y1, x2, y2, SDL.translateRGBAToCSSRGBA(r, g, b, a));
}

Module["_lineRGBA"] = _lineRGBA;

function _pixelRGBA(surf, x1, y1, r, g, b, a) {
 _boxRGBA(surf, x1, y1, x1, y1, r, g, b, a);
}

Module["_pixelRGBA"] = _pixelRGBA;

function _SDL_GL_SetAttribute(attr, value) {
 if (!(attr in SDL.glAttributes)) {
  abort("Unknown SDL GL attribute (" + attr + "). Please check if your SDL version is supported.");
 }
 SDL.glAttributes[attr] = value;
}

Module["_SDL_GL_SetAttribute"] = _SDL_GL_SetAttribute;

function _SDL_GL_GetAttribute(attr, value) {
 if (!(attr in SDL.glAttributes)) {
  abort("Unknown SDL GL attribute (" + attr + "). Please check if your SDL version is supported.");
 }
 if (value) HEAP32[value >> 2] = SDL.glAttributes[attr];
 return 0;
}

Module["_SDL_GL_GetAttribute"] = _SDL_GL_GetAttribute;

function _emscripten_GetProcAddress() {
 if (!Module["_emscripten_GetProcAddress"]) abort("external function 'emscripten_GetProcAddress' is missing. perhaps a side module was not linked in? if this function was expected to arrive from a system library, try to build the MAIN_MODULE with EMCC_FORCE_STDLIBS=1 in the environment");
 return Module["_emscripten_GetProcAddress"].apply(null, arguments);
}

function _SDL_GL_GetProcAddress(name_) {
 return _emscripten_GetProcAddress(name_);
}

Module["_SDL_GL_GetProcAddress"] = _SDL_GL_GetProcAddress;

function _SDL_GL_SwapBuffers() {
 if (Browser.doSwapBuffers) Browser.doSwapBuffers();
}

Module["_SDL_GL_SwapBuffers"] = _SDL_GL_SwapBuffers;

function _SDL_GL_ExtensionSupported(extension) {
 return Module.ctx.getExtension(extension) | 0;
}

Module["_SDL_GL_ExtensionSupported"] = _SDL_GL_ExtensionSupported;

function _SDL_DestroyWindow(window) {}

Module["_SDL_DestroyWindow"] = _SDL_DestroyWindow;

function _SDL_DestroyRenderer(renderer) {}

Module["_SDL_DestroyRenderer"] = _SDL_DestroyRenderer;

function _SDL_GetWindowFlags() {}

Module["_SDL_GetWindowFlags"] = _SDL_GetWindowFlags;

function _SDL_GL_SwapWindow(window) {}

Module["_SDL_GL_SwapWindow"] = _SDL_GL_SwapWindow;

function _SDL_GL_MakeCurrent(window, context) {}

Module["_SDL_GL_MakeCurrent"] = _SDL_GL_MakeCurrent;

function _SDL_GL_DeleteContext(context) {}

Module["_SDL_GL_DeleteContext"] = _SDL_GL_DeleteContext;

function _SDL_GL_GetSwapInterval(state) {
 if (Browser.mainLoop.timingMode == 1) return Browser.mainLoop.timingValue; else return 0;
}

Module["_SDL_GL_GetSwapInterval"] = _SDL_GL_GetSwapInterval;

function _SDL_GL_SetSwapInterval(state) {
 _emscripten_set_main_loop_timing(1, state);
}

Module["_SDL_GL_SetSwapInterval"] = _SDL_GL_SetSwapInterval;

function _SDL_SetWindowTitle(window, title) {
 if (title) document.title = UTF8ToString(title);
}

Module["_SDL_SetWindowTitle"] = _SDL_SetWindowTitle;

function _SDL_GetWindowSize(window, width, height) {
 var w = Module["canvas"].width;
 var h = Module["canvas"].height;
 if (width) HEAP32[width >> 2] = w;
 if (height) HEAP32[height >> 2] = h;
}

Module["_SDL_GetWindowSize"] = _SDL_GetWindowSize;

function _SDL_LogSetOutputFunction(callback, userdata) {}

Module["_SDL_LogSetOutputFunction"] = _SDL_LogSetOutputFunction;

function _SDL_SetWindowFullscreen(window, fullscreen) {
 if (Browser.isFullscreen) {
  Module["canvas"].exitFullscreen();
  return 1;
 } else {
  return 0;
 }
}

Module["_SDL_SetWindowFullscreen"] = _SDL_SetWindowFullscreen;

function _SDL_ClearError() {}

Module["_SDL_ClearError"] = _SDL_ClearError;

function _SDL_getenv() {
 return _getenv.apply(null, arguments);
}

Module["_SDL_getenv"] = _SDL_getenv;

function _SDL_putenv() {
 return _putenv.apply(null, arguments);
}

Module["_SDL_putenv"] = _SDL_putenv;

function _SDL_SetGamma(r, g, b) {
 return -1;
}

Module["_SDL_SetGamma"] = _SDL_SetGamma;

function _SDL_SetGammaRamp(redTable, greenTable, blueTable) {
 return -1;
}

Module["_SDL_SetGammaRamp"] = _SDL_SetGammaRamp;

function _SDL_NumJoysticks() {
 var count = 0;
 var gamepads = SDL.getGamepads();
 for (var i = 0; i < gamepads.length; i++) {
  if (gamepads[i] !== undefined) count++;
 }
 return count;
}

Module["_SDL_NumJoysticks"] = _SDL_NumJoysticks;

function _SDL_JoystickName(deviceIndex) {
 var gamepad = SDL.getGamepad(deviceIndex);
 if (gamepad) {
  var name = gamepad.id;
  if (SDL.joystickNamePool.hasOwnProperty(name)) {
   return SDL.joystickNamePool[name];
  }
  return SDL.joystickNamePool[name] = allocate(intArrayFromString(name), "i8", ALLOC_NORMAL);
 }
 return 0;
}

Module["_SDL_JoystickName"] = _SDL_JoystickName;

function _SDL_JoystickOpen(deviceIndex) {
 var gamepad = SDL.getGamepad(deviceIndex);
 if (gamepad) {
  var joystick = deviceIndex + 1;
  SDL.recordJoystickState(joystick, gamepad);
  return joystick;
 }
 return 0;
}

Module["_SDL_JoystickOpen"] = _SDL_JoystickOpen;

function _SDL_JoystickOpened(deviceIndex) {
 return SDL.lastJoystickState.hasOwnProperty(deviceIndex + 1) ? 1 : 0;
}

Module["_SDL_JoystickOpened"] = _SDL_JoystickOpened;

function _SDL_JoystickIndex(joystick) {
 return joystick - 1;
}

Module["_SDL_JoystickIndex"] = _SDL_JoystickIndex;

function _SDL_JoystickNumAxes(joystick) {
 var gamepad = SDL.getGamepad(joystick - 1);
 if (gamepad) {
  return gamepad.axes.length;
 }
 return 0;
}

Module["_SDL_JoystickNumAxes"] = _SDL_JoystickNumAxes;

function _SDL_JoystickNumBalls(joystick) {
 return 0;
}

Module["_SDL_JoystickNumBalls"] = _SDL_JoystickNumBalls;

function _SDL_JoystickNumHats(joystick) {
 return 0;
}

Module["_SDL_JoystickNumHats"] = _SDL_JoystickNumHats;

function _SDL_JoystickNumButtons(joystick) {
 var gamepad = SDL.getGamepad(joystick - 1);
 if (gamepad) {
  return gamepad.buttons.length;
 }
 return 0;
}

Module["_SDL_JoystickNumButtons"] = _SDL_JoystickNumButtons;

function _SDL_JoystickUpdate() {
 SDL.queryJoysticks();
}

Module["_SDL_JoystickUpdate"] = _SDL_JoystickUpdate;

function _SDL_JoystickEventState(state) {
 if (state < 0) {
  return SDL.joystickEventState;
 }
 return SDL.joystickEventState = state;
}

Module["_SDL_JoystickEventState"] = _SDL_JoystickEventState;

function _SDL_JoystickGetAxis(joystick, axis) {
 var gamepad = SDL.getGamepad(joystick - 1);
 if (gamepad && gamepad.axes.length > axis) {
  return SDL.joystickAxisValueConversion(gamepad.axes[axis]);
 }
 return 0;
}

Module["_SDL_JoystickGetAxis"] = _SDL_JoystickGetAxis;

function _SDL_JoystickGetHat(joystick, hat) {
 return 0;
}

Module["_SDL_JoystickGetHat"] = _SDL_JoystickGetHat;

function _SDL_JoystickGetBall(joystick, ball, dxptr, dyptr) {
 return -1;
}

Module["_SDL_JoystickGetBall"] = _SDL_JoystickGetBall;

function _SDL_JoystickGetButton(joystick, button) {
 var gamepad = SDL.getGamepad(joystick - 1);
 if (gamepad && gamepad.buttons.length > button) {
  return SDL.getJoystickButtonState(gamepad.buttons[button]) ? 1 : 0;
 }
 return 0;
}

Module["_SDL_JoystickGetButton"] = _SDL_JoystickGetButton;

function _SDL_JoystickClose(joystick) {
 delete SDL.lastJoystickState[joystick];
}

Module["_SDL_JoystickClose"] = _SDL_JoystickClose;

function _SDL_InitSubSystem(flags) {
 return 0;
}

Module["_SDL_InitSubSystem"] = _SDL_InitSubSystem;

function _SDL_RWFromConstMem(mem, size) {
 var id = SDL.rwops.length;
 SDL.rwops.push({
  bytes: mem,
  count: size
 });
 return id;
}

Module["_SDL_RWFromConstMem"] = _SDL_RWFromConstMem;

function _SDL_RWFromMem() {
 return _SDL_RWFromConstMem.apply(null, arguments);
}

Module["_SDL_RWFromMem"] = _SDL_RWFromMem;

function _SDL_GetNumAudioDrivers() {
 return 1;
}

Module["_SDL_GetNumAudioDrivers"] = _SDL_GetNumAudioDrivers;

function _SDL_GetCurrentAudioDriver() {
 return allocate(intArrayFromString("Emscripten Audio"), "i8", ALLOC_NORMAL);
}

Module["_SDL_GetCurrentAudioDriver"] = _SDL_GetCurrentAudioDriver;

function _SDL_GetAudioDriver(index) {
 return _SDL_GetCurrentAudioDriver();
}

Module["_SDL_GetAudioDriver"] = _SDL_GetAudioDriver;

function _SDL_EnableUNICODE(on) {
 var ret = SDL.unicode || 0;
 SDL.unicode = on;
 return ret;
}

Module["_SDL_EnableUNICODE"] = _SDL_EnableUNICODE;

function _SDL_AddTimer(interval, callback, param) {
 return window.setTimeout(function() {
  dynCall_iii(callback, interval, param);
 }, interval);
}

Module["_SDL_AddTimer"] = _SDL_AddTimer;

function _SDL_RemoveTimer(id) {
 window.clearTimeout(id);
 return true;
}

Module["_SDL_RemoveTimer"] = _SDL_RemoveTimer;

function _SDL_CreateThread() {
 throw "SDL threads cannot be supported in the web platform because they assume shared state. See emscripten_create_worker etc. for a message-passing concurrency model that does let you run code in another thread.";
}

Module["_SDL_CreateThread"] = _SDL_CreateThread;

function _SDL_WaitThread() {
 throw "SDL_WaitThread";
}

Module["_SDL_WaitThread"] = _SDL_WaitThread;

function _SDL_GetThreadID() {
 throw "SDL_GetThreadID";
}

Module["_SDL_GetThreadID"] = _SDL_GetThreadID;

function _SDL_ThreadID() {
 return 0;
}

Module["_SDL_ThreadID"] = _SDL_ThreadID;

function _SDL_AllocRW() {
 throw "SDL_AllocRW: TODO";
}

Module["_SDL_AllocRW"] = _SDL_AllocRW;

function _SDL_CondBroadcast() {
 throw "SDL_CondBroadcast: TODO";
}

Module["_SDL_CondBroadcast"] = _SDL_CondBroadcast;

function _SDL_CondWaitTimeout() {
 throw "SDL_CondWaitTimeout: TODO";
}

Module["_SDL_CondWaitTimeout"] = _SDL_CondWaitTimeout;

function _SDL_WM_IconifyWindow() {
 throw "SDL_WM_IconifyWindow TODO";
}

Module["_SDL_WM_IconifyWindow"] = _SDL_WM_IconifyWindow;

function _Mix_SetPostMix() {
 warnOnce("Mix_SetPostMix: TODO");
}

Module["_Mix_SetPostMix"] = _Mix_SetPostMix;

function _Mix_VolumeChunk(chunk, volume) {
 throw "Mix_VolumeChunk: TODO";
}

Module["_Mix_VolumeChunk"] = _Mix_VolumeChunk;

function _Mix_SetPosition(channel, angle, distance) {
 throw "Mix_SetPosition: TODO";
}

Module["_Mix_SetPosition"] = _Mix_SetPosition;

function _Mix_QuerySpec() {
 throw "Mix_QuerySpec: TODO";
}

Module["_Mix_QuerySpec"] = _Mix_QuerySpec;

function _Mix_FadeInChannelTimed() {
 throw "Mix_FadeInChannelTimed";
}

Module["_Mix_FadeInChannelTimed"] = _Mix_FadeInChannelTimed;

function _Mix_FadeOutChannel() {
 throw "Mix_FadeOutChannel";
}

Module["_Mix_FadeOutChannel"] = _Mix_FadeOutChannel;

function _Mix_Linked_Version() {
 throw "Mix_Linked_Version: TODO";
}

Module["_Mix_Linked_Version"] = _Mix_Linked_Version;

function _SDL_SaveBMP_RW() {
 throw "SDL_SaveBMP_RW: TODO";
}

Module["_SDL_SaveBMP_RW"] = _SDL_SaveBMP_RW;

function _SDL_WM_SetIcon() {}

Module["_SDL_WM_SetIcon"] = _SDL_WM_SetIcon;

function _SDL_HasRDTSC() {
 return 0;
}

Module["_SDL_HasRDTSC"] = _SDL_HasRDTSC;

function _SDL_HasMMX() {
 return 0;
}

Module["_SDL_HasMMX"] = _SDL_HasMMX;

function _SDL_HasMMXExt() {
 return 0;
}

Module["_SDL_HasMMXExt"] = _SDL_HasMMXExt;

function _SDL_Has3DNow() {
 return 0;
}

Module["_SDL_Has3DNow"] = _SDL_Has3DNow;

function _SDL_Has3DNowExt() {
 return 0;
}

Module["_SDL_Has3DNowExt"] = _SDL_Has3DNowExt;

function _SDL_HasSSE() {
 return 0;
}

Module["_SDL_HasSSE"] = _SDL_HasSSE;

function _SDL_HasSSE2() {
 return 0;
}

Module["_SDL_HasSSE2"] = _SDL_HasSSE2;

function _SDL_HasAltiVec() {
 return 0;
}

Module["_SDL_HasAltiVec"] = _SDL_HasAltiVec;

function _glutPostRedisplay() {
 if (GLUT.displayFunc && !GLUT.requestedAnimationFrame) {
  GLUT.requestedAnimationFrame = true;
  Browser.requestAnimationFrame(function() {
   GLUT.requestedAnimationFrame = false;
   Browser.mainLoop.runIter(function() {
    dynCall_v(GLUT.displayFunc);
   });
  });
 }
}

Module["_glutPostRedisplay"] = _glutPostRedisplay;

var GLUT = {
 initTime: null,
 idleFunc: null,
 displayFunc: null,
 keyboardFunc: null,
 keyboardUpFunc: null,
 specialFunc: null,
 specialUpFunc: null,
 reshapeFunc: null,
 motionFunc: null,
 passiveMotionFunc: null,
 mouseFunc: null,
 buttons: 0,
 modifiers: 0,
 initWindowWidth: 256,
 initWindowHeight: 256,
 initDisplayMode: 18,
 windowX: 0,
 windowY: 0,
 windowWidth: 0,
 windowHeight: 0,
 requestedAnimationFrame: false,
 saveModifiers: function(event) {
  GLUT.modifiers = 0;
  if (event["shiftKey"]) GLUT.modifiers += 1;
  if (event["ctrlKey"]) GLUT.modifiers += 2;
  if (event["altKey"]) GLUT.modifiers += 4;
 },
 onMousemove: function(event) {
  var lastX = Browser.mouseX;
  var lastY = Browser.mouseY;
  Browser.calculateMouseEvent(event);
  var newX = Browser.mouseX;
  var newY = Browser.mouseY;
  if (newX == lastX && newY == lastY) return;
  if (GLUT.buttons == 0 && event.target == Module["canvas"] && GLUT.passiveMotionFunc) {
   event.preventDefault();
   GLUT.saveModifiers(event);
   dynCall_vii(GLUT.passiveMotionFunc, lastX, lastY);
  } else if (GLUT.buttons != 0 && GLUT.motionFunc) {
   event.preventDefault();
   GLUT.saveModifiers(event);
   dynCall_vii(GLUT.motionFunc, lastX, lastY);
  }
 },
 getSpecialKey: function(keycode) {
  var key = null;
  switch (keycode) {
  case 8:
   key = 120;
   break;

  case 46:
   key = 111;
   break;

  case 112:
   key = 1;
   break;

  case 113:
   key = 2;
   break;

  case 114:
   key = 3;
   break;

  case 115:
   key = 4;
   break;

  case 116:
   key = 5;
   break;

  case 117:
   key = 6;
   break;

  case 118:
   key = 7;
   break;

  case 119:
   key = 8;
   break;

  case 120:
   key = 9;
   break;

  case 121:
   key = 10;
   break;

  case 122:
   key = 11;
   break;

  case 123:
   key = 12;
   break;

  case 37:
   key = 100;
   break;

  case 38:
   key = 101;
   break;

  case 39:
   key = 102;
   break;

  case 40:
   key = 103;
   break;

  case 33:
   key = 104;
   break;

  case 34:
   key = 105;
   break;

  case 36:
   key = 106;
   break;

  case 35:
   key = 107;
   break;

  case 45:
   key = 108;
   break;

  case 16:
  case 5:
   key = 112;
   break;

  case 6:
   key = 113;
   break;

  case 17:
  case 3:
   key = 114;
   break;

  case 4:
   key = 115;
   break;

  case 18:
  case 2:
   key = 116;
   break;

  case 1:
   key = 117;
   break;
  }
  return key;
 },
 getASCIIKey: function(event) {
  if (event["ctrlKey"] || event["altKey"] || event["metaKey"]) return null;
  var keycode = event["keyCode"];
  if (48 <= keycode && keycode <= 57) return keycode;
  if (65 <= keycode && keycode <= 90) return event["shiftKey"] ? keycode : keycode + 32;
  if (96 <= keycode && keycode <= 105) return keycode - 48;
  if (106 <= keycode && keycode <= 111) return keycode - 106 + 42;
  switch (keycode) {
  case 9:
  case 13:
  case 27:
  case 32:
  case 61:
   return keycode;
  }
  var s = event["shiftKey"];
  switch (keycode) {
  case 186:
   return s ? 58 : 59;

  case 187:
   return s ? 43 : 61;

  case 188:
   return s ? 60 : 44;

  case 189:
   return s ? 95 : 45;

  case 190:
   return s ? 62 : 46;

  case 191:
   return s ? 63 : 47;

  case 219:
   return s ? 123 : 91;

  case 220:
   return s ? 124 : 47;

  case 221:
   return s ? 125 : 93;

  case 222:
   return s ? 34 : 39;
  }
  return null;
 },
 onKeydown: function(event) {
  if (GLUT.specialFunc || GLUT.keyboardFunc) {
   var key = GLUT.getSpecialKey(event["keyCode"]);
   if (key !== null) {
    if (GLUT.specialFunc) {
     event.preventDefault();
     GLUT.saveModifiers(event);
     dynCall_viii(GLUT.specialFunc, key, Browser.mouseX, Browser.mouseY);
    }
   } else {
    key = GLUT.getASCIIKey(event);
    if (key !== null && GLUT.keyboardFunc) {
     event.preventDefault();
     GLUT.saveModifiers(event);
     dynCall_viii(GLUT.keyboardFunc, key, Browser.mouseX, Browser.mouseY);
    }
   }
  }
 },
 onKeyup: function(event) {
  if (GLUT.specialUpFunc || GLUT.keyboardUpFunc) {
   var key = GLUT.getSpecialKey(event["keyCode"]);
   if (key !== null) {
    if (GLUT.specialUpFunc) {
     event.preventDefault();
     GLUT.saveModifiers(event);
     dynCall_viii(GLUT.specialUpFunc, key, Browser.mouseX, Browser.mouseY);
    }
   } else {
    key = GLUT.getASCIIKey(event);
    if (key !== null && GLUT.keyboardUpFunc) {
     event.preventDefault();
     GLUT.saveModifiers(event);
     dynCall_viii(GLUT.keyboardUpFunc, key, Browser.mouseX, Browser.mouseY);
    }
   }
  }
 },
 touchHandler: function(event) {
  if (event.target != Module["canvas"]) {
   return;
  }
  var touches = event.changedTouches, main = touches[0], type = "";
  switch (event.type) {
  case "touchstart":
   type = "mousedown";
   break;

  case "touchmove":
   type = "mousemove";
   break;

  case "touchend":
   type = "mouseup";
   break;

  default:
   return;
  }
  var simulatedEvent = document.createEvent("MouseEvent");
  simulatedEvent.initMouseEvent(type, true, true, window, 1, main.screenX, main.screenY, main.clientX, main.clientY, false, false, false, false, 0, null);
  main.target.dispatchEvent(simulatedEvent);
  event.preventDefault();
 },
 onMouseButtonDown: function(event) {
  Browser.calculateMouseEvent(event);
  GLUT.buttons |= 1 << event["button"];
  if (event.target == Module["canvas"] && GLUT.mouseFunc) {
   try {
    event.target.setCapture();
   } catch (e) {}
   event.preventDefault();
   GLUT.saveModifiers(event);
   dynCall_viiii(GLUT.mouseFunc, event["button"], 0, Browser.mouseX, Browser.mouseY);
  }
 },
 onMouseButtonUp: function(event) {
  Browser.calculateMouseEvent(event);
  GLUT.buttons &= ~(1 << event["button"]);
  if (GLUT.mouseFunc) {
   event.preventDefault();
   GLUT.saveModifiers(event);
   dynCall_viiii(GLUT.mouseFunc, event["button"], 1, Browser.mouseX, Browser.mouseY);
  }
 },
 onMouseWheel: function(event) {
  Browser.calculateMouseEvent(event);
  var e = window.event || event;
  var delta = -Browser.getMouseWheelDelta(event);
  delta = delta == 0 ? 0 : delta > 0 ? Math.max(delta, 1) : Math.min(delta, -1);
  var button = 3;
  if (delta < 0) {
   button = 4;
  }
  if (GLUT.mouseFunc) {
   event.preventDefault();
   GLUT.saveModifiers(event);
   dynCall_viiii(GLUT.mouseFunc, button, 0, Browser.mouseX, Browser.mouseY);
  }
 },
 onFullscreenEventChange: function(event) {
  var width;
  var height;
  if (document["fullscreen"] || document["fullScreen"] || document["mozFullScreen"] || document["webkitIsFullScreen"]) {
   width = screen["width"];
   height = screen["height"];
  } else {
   width = GLUT.windowWidth;
   height = GLUT.windowHeight;
   document.removeEventListener("fullscreenchange", GLUT.onFullscreenEventChange, true);
   document.removeEventListener("mozfullscreenchange", GLUT.onFullscreenEventChange, true);
   document.removeEventListener("webkitfullscreenchange", GLUT.onFullscreenEventChange, true);
  }
  Browser.setCanvasSize(width, height, true);
  if (GLUT.reshapeFunc) {
   dynCall_vii(GLUT.reshapeFunc, width, height);
  }
  _glutPostRedisplay();
 }
};

Module["GLUT"] = GLUT;

function _glutGetModifiers() {
 return GLUT.modifiers;
}

Module["_glutGetModifiers"] = _glutGetModifiers;

function _glutInit(argcp, argv) {
 GLUT.initTime = Date.now();
 var isTouchDevice = "ontouchstart" in document.documentElement;
 if (isTouchDevice) {
  window.addEventListener("touchmove", GLUT.touchHandler, true);
  window.addEventListener("touchstart", GLUT.touchHandler, true);
  window.addEventListener("touchend", GLUT.touchHandler, true);
 }
 window.addEventListener("keydown", GLUT.onKeydown, true);
 window.addEventListener("keyup", GLUT.onKeyup, true);
 window.addEventListener("mousemove", GLUT.onMousemove, true);
 window.addEventListener("mousedown", GLUT.onMouseButtonDown, true);
 window.addEventListener("mouseup", GLUT.onMouseButtonUp, true);
 window.addEventListener("mousewheel", GLUT.onMouseWheel, true);
 window.addEventListener("DOMMouseScroll", GLUT.onMouseWheel, true);
 Browser.resizeListeners.push(function(width, height) {
  if (GLUT.reshapeFunc) {
   dynCall_vii(GLUT.reshapeFunc, width, height);
  }
 });
 __ATEXIT__.push(function() {
  if (isTouchDevice) {
   window.removeEventListener("touchmove", GLUT.touchHandler, true);
   window.removeEventListener("touchstart", GLUT.touchHandler, true);
   window.removeEventListener("touchend", GLUT.touchHandler, true);
  }
  window.removeEventListener("keydown", GLUT.onKeydown, true);
  window.removeEventListener("keyup", GLUT.onKeyup, true);
  window.removeEventListener("mousemove", GLUT.onMousemove, true);
  window.removeEventListener("mousedown", GLUT.onMouseButtonDown, true);
  window.removeEventListener("mouseup", GLUT.onMouseButtonUp, true);
  window.removeEventListener("mousewheel", GLUT.onMouseWheel, true);
  window.removeEventListener("DOMMouseScroll", GLUT.onMouseWheel, true);
  Module["canvas"].width = Module["canvas"].height = 1;
 });
}

Module["_glutInit"] = _glutInit;

function _glutInitWindowSize(width, height) {
 Browser.setCanvasSize(GLUT.initWindowWidth = width, GLUT.initWindowHeight = height);
}

Module["_glutInitWindowSize"] = _glutInitWindowSize;

function _glutInitWindowPosition(x, y) {}

Module["_glutInitWindowPosition"] = _glutInitWindowPosition;

function _glutGet(type) {
 switch (type) {
 case 100:
  return 0;

 case 101:
  return 0;

 case 102:
  return Module["canvas"].width;

 case 103:
  return Module["canvas"].height;

 case 200:
  return Module["canvas"].width;

 case 201:
  return Module["canvas"].height;

 case 500:
  return 0;

 case 501:
  return 0;

 case 502:
  return GLUT.initWindowWidth;

 case 503:
  return GLUT.initWindowHeight;

 case 700:
  var now = Date.now();
  return now - GLUT.initTime;

 case 105:
  return Module.ctx.getContextAttributes().stencil ? 8 : 0;

 case 106:
  return Module.ctx.getContextAttributes().depth ? 8 : 0;

 case 110:
  return Module.ctx.getContextAttributes().alpha ? 8 : 0;

 case 120:
  return Module.ctx.getContextAttributes().antialias ? 1 : 0;

 default:
  throw "glutGet(" + type + ") not implemented yet";
 }
}

Module["_glutGet"] = _glutGet;

function _glutIdleFunc(func) {
 function callback() {
  if (GLUT.idleFunc) {
   dynCall_v(GLUT.idleFunc);
   Browser.safeSetTimeout(callback, 4);
  }
 }
 if (!GLUT.idleFunc) {
  Browser.safeSetTimeout(callback, 0);
 }
 GLUT.idleFunc = func;
}

Module["_glutIdleFunc"] = _glutIdleFunc;

function _glutTimerFunc(msec, func, value) {
 Browser.safeSetTimeout(function() {
  dynCall_vi(func, value);
 }, msec);
}

Module["_glutTimerFunc"] = _glutTimerFunc;

function _glutDisplayFunc(func) {
 GLUT.displayFunc = func;
}

Module["_glutDisplayFunc"] = _glutDisplayFunc;

function _glutKeyboardFunc(func) {
 GLUT.keyboardFunc = func;
}

Module["_glutKeyboardFunc"] = _glutKeyboardFunc;

function _glutKeyboardUpFunc(func) {
 GLUT.keyboardUpFunc = func;
}

Module["_glutKeyboardUpFunc"] = _glutKeyboardUpFunc;

function _glutSpecialFunc(func) {
 GLUT.specialFunc = func;
}

Module["_glutSpecialFunc"] = _glutSpecialFunc;

function _glutSpecialUpFunc(func) {
 GLUT.specialUpFunc = func;
}

Module["_glutSpecialUpFunc"] = _glutSpecialUpFunc;

function _glutReshapeFunc(func) {
 GLUT.reshapeFunc = func;
}

Module["_glutReshapeFunc"] = _glutReshapeFunc;

function _glutMotionFunc(func) {
 GLUT.motionFunc = func;
}

Module["_glutMotionFunc"] = _glutMotionFunc;

function _glutPassiveMotionFunc(func) {
 GLUT.passiveMotionFunc = func;
}

Module["_glutPassiveMotionFunc"] = _glutPassiveMotionFunc;

function _glutMouseFunc(func) {
 GLUT.mouseFunc = func;
}

Module["_glutMouseFunc"] = _glutMouseFunc;

function _glutSetCursor(cursor) {
 var cursorStyle = "auto";
 switch (cursor) {
 case 0:
  break;

 case 1:
  break;

 case 2:
  cursorStyle = "pointer";
  break;

 case 3:
  break;

 case 4:
  cursorStyle = "help";
  break;

 case 5:
  break;

 case 6:
  break;

 case 7:
  cursorStyle = "wait";
  break;

 case 8:
  cursorStyle = "text";
  break;

 case 9:
 case 102:
  cursorStyle = "crosshair";
  break;

 case 10:
  cursorStyle = "ns-resize";
  break;

 case 11:
  cursorStyle = "ew-resize";
  break;

 case 12:
  cursorStyle = "n-resize";
  break;

 case 13:
  cursorStyle = "s-resize";
  break;

 case 14:
  cursorStyle = "w-resize";
  break;

 case 15:
  cursorStyle = "e-resize";
  break;

 case 16:
  cursorStyle = "nw-resize";
  break;

 case 17:
  cursorStyle = "ne-resize";
  break;

 case 18:
  cursorStyle = "se-resize";
  break;

 case 19:
  cursorStyle = "sw-resize";
  break;

 case 100:
  break;

 case 101:
  cursorStyle = "none";
  break;

 default:
  throw "glutSetCursor: Unknown cursor type: " + cursor;
 }
 Module["canvas"].style.cursor = cursorStyle;
}

Module["_glutSetCursor"] = _glutSetCursor;

function _glutCreateWindow(name) {
 var contextAttributes = {
  antialias: (GLUT.initDisplayMode & 128) != 0,
  depth: (GLUT.initDisplayMode & 16) != 0,
  stencil: (GLUT.initDisplayMode & 32) != 0,
  alpha: (GLUT.initDisplayMode & 8) != 0
 };
 Module.ctx = Browser.createContext(Module["canvas"], true, true, contextAttributes);
 return Module.ctx ? 1 : 0;
}

Module["_glutCreateWindow"] = _glutCreateWindow;

function _glutDestroyWindow(name) {
 Module.ctx = Browser.destroyContext(Module["canvas"], true, true);
 return 1;
}

Module["_glutDestroyWindow"] = _glutDestroyWindow;

function _glutReshapeWindow(width, height) {
 Browser.exitFullscreen();
 Browser.setCanvasSize(width, height, true);
 if (GLUT.reshapeFunc) {
  dynCall_vii(GLUT.reshapeFunc, width, height);
 }
 _glutPostRedisplay();
}

Module["_glutReshapeWindow"] = _glutReshapeWindow;

function _glutPositionWindow(x, y) {
 Browser.exitFullscreen();
 _glutPostRedisplay();
}

Module["_glutPositionWindow"] = _glutPositionWindow;

function _glutFullScreen() {
 GLUT.windowX = 0;
 GLUT.windowY = 0;
 GLUT.windowWidth = Module["canvas"].width;
 GLUT.windowHeight = Module["canvas"].height;
 document.addEventListener("fullscreenchange", GLUT.onFullscreenEventChange, true);
 document.addEventListener("mozfullscreenchange", GLUT.onFullscreenEventChange, true);
 document.addEventListener("webkitfullscreenchange", GLUT.onFullscreenEventChange, true);
 Browser.requestFullscreen(false, false);
}

Module["_glutFullScreen"] = _glutFullScreen;

function _glutInitDisplayMode(mode) {
 GLUT.initDisplayMode = mode;
}

Module["_glutInitDisplayMode"] = _glutInitDisplayMode;

function _glutSwapBuffers() {}

Module["_glutSwapBuffers"] = _glutSwapBuffers;

function _glutMainLoop() {
 _glutReshapeWindow(Module["canvas"].width, Module["canvas"].height);
 _glutPostRedisplay();
 throw "unwind";
}

Module["_glutMainLoop"] = _glutMainLoop;

function _XOpenDisplay() {
 return 1;
}

Module["_XOpenDisplay"] = _XOpenDisplay;

function _XCreateWindow(display, parent, x, y, width, height, border_width, depth, class_, visual, valuemask, attributes) {
 Browser.setCanvasSize(width, height);
 return 2;
}

Module["_XCreateWindow"] = _XCreateWindow;

function _XChangeWindowAttributes() {}

Module["_XChangeWindowAttributes"] = _XChangeWindowAttributes;

function _XSetWMHints() {}

Module["_XSetWMHints"] = _XSetWMHints;

function _XMapWindow() {}

Module["_XMapWindow"] = _XMapWindow;

function _XStoreName() {}

Module["_XStoreName"] = _XStoreName;

function _XInternAtom(display, name_, hmm) {
 return 0;
}

Module["_XInternAtom"] = _XInternAtom;

function _XSendEvent() {}

Module["_XSendEvent"] = _XSendEvent;

function _XPending(display) {
 return 0;
}

Module["_XPending"] = _XPending;

var EGL = {
 errorCode: 12288,
 defaultDisplayInitialized: false,
 currentContext: 0,
 currentReadSurface: 0,
 currentDrawSurface: 0,
 contextAttributes: {
  alpha: false,
  depth: false,
  stencil: false,
  antialias: false
 },
 stringCache: {},
 setErrorCode: function(code) {
  EGL.errorCode = code;
 },
 chooseConfig: function(display, attribList, config, config_size, numConfigs) {
  if (display != 62e3) {
   EGL.setErrorCode(12296);
   return 0;
  }
  if (attribList) {
   for (;;) {
    var param = HEAP32[attribList >> 2];
    if (param == 12321) {
     var alphaSize = HEAP32[attribList + 4 >> 2];
     EGL.contextAttributes.alpha = alphaSize > 0;
    } else if (param == 12325) {
     var depthSize = HEAP32[attribList + 4 >> 2];
     EGL.contextAttributes.depth = depthSize > 0;
    } else if (param == 12326) {
     var stencilSize = HEAP32[attribList + 4 >> 2];
     EGL.contextAttributes.stencil = stencilSize > 0;
    } else if (param == 12337) {
     var samples = HEAP32[attribList + 4 >> 2];
     EGL.contextAttributes.antialias = samples > 0;
    } else if (param == 12338) {
     var samples = HEAP32[attribList + 4 >> 2];
     EGL.contextAttributes.antialias = samples == 1;
    } else if (param == 12544) {
     var requestedPriority = HEAP32[attribList + 4 >> 2];
     EGL.contextAttributes.lowLatency = requestedPriority != 12547;
    } else if (param == 12344) {
     break;
    }
    attribList += 8;
   }
  }
  if ((!config || !config_size) && !numConfigs) {
   EGL.setErrorCode(12300);
   return 0;
  }
  if (numConfigs) {
   HEAP32[numConfigs >> 2] = 1;
  }
  if (config && config_size > 0) {
   HEAP32[config >> 2] = 62002;
  }
  EGL.setErrorCode(12288);
  return 1;
 }
};

Module["EGL"] = EGL;

function _eglGetDisplay(nativeDisplayType) {
 EGL.setErrorCode(12288);
 return 62e3;
}

Module["_eglGetDisplay"] = _eglGetDisplay;

function _eglInitialize(display, majorVersion, minorVersion) {
 if (display == 62e3) {
  if (majorVersion) {
   HEAP32[majorVersion >> 2] = 1;
  }
  if (minorVersion) {
   HEAP32[minorVersion >> 2] = 4;
  }
  EGL.defaultDisplayInitialized = true;
  EGL.setErrorCode(12288);
  return 1;
 } else {
  EGL.setErrorCode(12296);
  return 0;
 }
}

Module["_eglInitialize"] = _eglInitialize;

function _eglTerminate(display) {
 if (display != 62e3) {
  EGL.setErrorCode(12296);
  return 0;
 }
 EGL.currentContext = 0;
 EGL.currentReadSurface = 0;
 EGL.currentDrawSurface = 0;
 EGL.defaultDisplayInitialized = false;
 EGL.setErrorCode(12288);
 return 1;
}

Module["_eglTerminate"] = _eglTerminate;

function _eglGetConfigs(display, configs, config_size, numConfigs) {
 return EGL.chooseConfig(display, 0, configs, config_size, numConfigs);
}

Module["_eglGetConfigs"] = _eglGetConfigs;

function _eglChooseConfig(display, attrib_list, configs, config_size, numConfigs) {
 return EGL.chooseConfig(display, attrib_list, configs, config_size, numConfigs);
}

Module["_eglChooseConfig"] = _eglChooseConfig;

function _eglGetConfigAttrib(display, config, attribute, value) {
 if (display != 62e3) {
  EGL.setErrorCode(12296);
  return 0;
 }
 if (config != 62002) {
  EGL.setErrorCode(12293);
  return 0;
 }
 if (!value) {
  EGL.setErrorCode(12300);
  return 0;
 }
 EGL.setErrorCode(12288);
 switch (attribute) {
 case 12320:
  HEAP32[value >> 2] = EGL.contextAttributes.alpha ? 32 : 24;
  return 1;

 case 12321:
  HEAP32[value >> 2] = EGL.contextAttributes.alpha ? 8 : 0;
  return 1;

 case 12322:
  HEAP32[value >> 2] = 8;
  return 1;

 case 12323:
  HEAP32[value >> 2] = 8;
  return 1;

 case 12324:
  HEAP32[value >> 2] = 8;
  return 1;

 case 12325:
  HEAP32[value >> 2] = EGL.contextAttributes.depth ? 24 : 0;
  return 1;

 case 12326:
  HEAP32[value >> 2] = EGL.contextAttributes.stencil ? 8 : 0;
  return 1;

 case 12327:
  HEAP32[value >> 2] = 12344;
  return 1;

 case 12328:
  HEAP32[value >> 2] = 62002;
  return 1;

 case 12329:
  HEAP32[value >> 2] = 0;
  return 1;

 case 12330:
  HEAP32[value >> 2] = 4096;
  return 1;

 case 12331:
  HEAP32[value >> 2] = 16777216;
  return 1;

 case 12332:
  HEAP32[value >> 2] = 4096;
  return 1;

 case 12333:
  HEAP32[value >> 2] = 0;
  return 1;

 case 12334:
  HEAP32[value >> 2] = 0;
  return 1;

 case 12335:
  HEAP32[value >> 2] = 12344;
  return 1;

 case 12337:
  HEAP32[value >> 2] = EGL.contextAttributes.antialias ? 4 : 0;
  return 1;

 case 12338:
  HEAP32[value >> 2] = EGL.contextAttributes.antialias ? 1 : 0;
  return 1;

 case 12339:
  HEAP32[value >> 2] = 4;
  return 1;

 case 12340:
  HEAP32[value >> 2] = 12344;
  return 1;

 case 12341:
 case 12342:
 case 12343:
  HEAP32[value >> 2] = -1;
  return 1;

 case 12345:
 case 12346:
  HEAP32[value >> 2] = 0;
  return 1;

 case 12347:
  HEAP32[value >> 2] = 0;
  return 1;

 case 12348:
  HEAP32[value >> 2] = 1;
  return 1;

 case 12349:
 case 12350:
  HEAP32[value >> 2] = 0;
  return 1;

 case 12351:
  HEAP32[value >> 2] = 12430;
  return 1;

 case 12352:
  HEAP32[value >> 2] = 4;
  return 1;

 case 12354:
  HEAP32[value >> 2] = 0;
  return 1;

 default:
  EGL.setErrorCode(12292);
  return 0;
 }
}

Module["_eglGetConfigAttrib"] = _eglGetConfigAttrib;

function _eglCreateWindowSurface(display, config, win, attrib_list) {
 if (display != 62e3) {
  EGL.setErrorCode(12296);
  return 0;
 }
 if (config != 62002) {
  EGL.setErrorCode(12293);
  return 0;
 }
 EGL.setErrorCode(12288);
 return 62006;
}

Module["_eglCreateWindowSurface"] = _eglCreateWindowSurface;

function _eglDestroySurface(display, surface) {
 if (display != 62e3) {
  EGL.setErrorCode(12296);
  return 0;
 }
 if (surface != 62006) {
  EGL.setErrorCode(12301);
  return 1;
 }
 if (EGL.currentReadSurface == surface) {
  EGL.currentReadSurface = 0;
 }
 if (EGL.currentDrawSurface == surface) {
  EGL.currentDrawSurface = 0;
 }
 EGL.setErrorCode(12288);
 return 1;
}

Module["_eglDestroySurface"] = _eglDestroySurface;

function _eglCreateContext(display, config, hmm, contextAttribs) {
 if (display != 62e3) {
  EGL.setErrorCode(12296);
  return 0;
 }
 var glesContextVersion = 1;
 for (;;) {
  var param = HEAP32[contextAttribs >> 2];
  if (param == 12440) {
   glesContextVersion = HEAP32[contextAttribs + 4 >> 2];
  } else if (param == 12344) {
   break;
  } else {
   EGL.setErrorCode(12292);
   return 0;
  }
  contextAttribs += 8;
 }
 if (glesContextVersion != 2) {
  EGL.setErrorCode(12293);
  return 0;
 }
 EGL.contextAttributes.majorVersion = glesContextVersion - 1;
 EGL.contextAttributes.minorVersion = 0;
 EGL.context = GL.createContext(Module["canvas"], EGL.contextAttributes);
 if (EGL.context != 0) {
  EGL.setErrorCode(12288);
  GL.makeContextCurrent(EGL.context);
  Module.useWebGL = true;
  Browser.moduleContextCreatedCallbacks.forEach(function(callback) {
   callback();
  });
  GL.makeContextCurrent(null);
  return 62004;
 } else {
  EGL.setErrorCode(12297);
  return 0;
 }
}

Module["_eglCreateContext"] = _eglCreateContext;

function _eglDestroyContext(display, context) {
 if (display != 62e3) {
  EGL.setErrorCode(12296);
  return 0;
 }
 if (context != 62004) {
  EGL.setErrorCode(12294);
  return 0;
 }
 GL.deleteContext(EGL.context);
 EGL.setErrorCode(12288);
 if (EGL.currentContext == context) {
  EGL.currentContext = 0;
 }
 return 1;
}

Module["_eglDestroyContext"] = _eglDestroyContext;

function _eglQuerySurface(display, surface, attribute, value) {
 if (display != 62e3) {
  EGL.setErrorCode(12296);
  return 0;
 }
 if (surface != 62006) {
  EGL.setErrorCode(12301);
  return 0;
 }
 if (!value) {
  EGL.setErrorCode(12300);
  return 0;
 }
 EGL.setErrorCode(12288);
 switch (attribute) {
 case 12328:
  HEAP32[value >> 2] = 62002;
  return 1;

 case 12376:
  return 1;

 case 12375:
  HEAP32[value >> 2] = Module.canvas.width;
  return 1;

 case 12374:
  HEAP32[value >> 2] = Module.canvas.height;
  return 1;

 case 12432:
  HEAP32[value >> 2] = -1;
  return 1;

 case 12433:
  HEAP32[value >> 2] = -1;
  return 1;

 case 12434:
  HEAP32[value >> 2] = -1;
  return 1;

 case 12422:
  HEAP32[value >> 2] = 12420;
  return 1;

 case 12441:
  HEAP32[value >> 2] = 12442;
  return 1;

 case 12435:
  HEAP32[value >> 2] = 12437;
  return 1;

 case 12416:
 case 12417:
 case 12418:
 case 12419:
  return 1;

 default:
  EGL.setErrorCode(12292);
  return 0;
 }
}

Module["_eglQuerySurface"] = _eglQuerySurface;

function _eglQueryContext(display, context, attribute, value) {
 if (display != 62e3) {
  EGL.setErrorCode(12296);
  return 0;
 }
 if (context != 62004) {
  EGL.setErrorCode(12294);
  return 0;
 }
 if (!value) {
  EGL.setErrorCode(12300);
  return 0;
 }
 EGL.setErrorCode(12288);
 switch (attribute) {
 case 12328:
  HEAP32[value >> 2] = 62002;
  return 1;

 case 12439:
  HEAP32[value >> 2] = 12448;
  return 1;

 case 12440:
  HEAP32[value >> 2] = EGL.contextAttributes.majorVersion + 1;
  return 1;

 case 12422:
  HEAP32[value >> 2] = 12420;
  return 1;

 default:
  EGL.setErrorCode(12292);
  return 0;
 }
}

Module["_eglQueryContext"] = _eglQueryContext;

function _eglGetError() {
 return EGL.errorCode;
}

Module["_eglGetError"] = _eglGetError;

function _eglQueryString(display, name) {
 if (display != 62e3) {
  EGL.setErrorCode(12296);
  return 0;
 }
 EGL.setErrorCode(12288);
 if (EGL.stringCache[name]) return EGL.stringCache[name];
 var ret;
 switch (name) {
 case 12371:
  ret = allocate(intArrayFromString("Emscripten"), "i8", ALLOC_NORMAL);
  break;

 case 12372:
  ret = allocate(intArrayFromString("1.4 Emscripten EGL"), "i8", ALLOC_NORMAL);
  break;

 case 12373:
  ret = allocate(intArrayFromString(""), "i8", ALLOC_NORMAL);
  break;

 case 12429:
  ret = allocate(intArrayFromString("OpenGL_ES"), "i8", ALLOC_NORMAL);
  break;

 default:
  EGL.setErrorCode(12300);
  return 0;
 }
 EGL.stringCache[name] = ret;
 return ret;
}

Module["_eglQueryString"] = _eglQueryString;

function _eglBindAPI(api) {
 if (api == 12448) {
  EGL.setErrorCode(12288);
  return 1;
 } else {
  EGL.setErrorCode(12300);
  return 0;
 }
}

Module["_eglBindAPI"] = _eglBindAPI;

function _eglQueryAPI() {
 EGL.setErrorCode(12288);
 return 12448;
}

Module["_eglQueryAPI"] = _eglQueryAPI;

function _eglWaitClient() {
 EGL.setErrorCode(12288);
 return 1;
}

Module["_eglWaitClient"] = _eglWaitClient;

function _eglWaitNative(nativeEngineId) {
 EGL.setErrorCode(12288);
 return 1;
}

Module["_eglWaitNative"] = _eglWaitNative;

function _eglWaitGL() {
 return _eglWaitClient.apply(null, arguments);
}

Module["_eglWaitGL"] = _eglWaitGL;

function _eglSwapInterval(display, interval) {
 if (display != 62e3) {
  EGL.setErrorCode(12296);
  return 0;
 }
 if (interval == 0) _emscripten_set_main_loop_timing(0, 0); else _emscripten_set_main_loop_timing(1, interval);
 EGL.setErrorCode(12288);
 return 1;
}

Module["_eglSwapInterval"] = _eglSwapInterval;

function _eglMakeCurrent(display, draw, read, context) {
 if (display != 62e3) {
  EGL.setErrorCode(12296);
  return 0;
 }
 if (context != 0 && context != 62004) {
  EGL.setErrorCode(12294);
  return 0;
 }
 if (read != 0 && read != 62006 || draw != 0 && draw != 62006) {
  EGL.setErrorCode(12301);
  return 0;
 }
 GL.makeContextCurrent(context ? EGL.context : null);
 EGL.currentContext = context;
 EGL.currentDrawSurface = draw;
 EGL.currentReadSurface = read;
 EGL.setErrorCode(12288);
 return 1;
}

Module["_eglMakeCurrent"] = _eglMakeCurrent;

function _eglGetCurrentContext() {
 return EGL.currentContext;
}

Module["_eglGetCurrentContext"] = _eglGetCurrentContext;

function _eglGetCurrentSurface(readdraw) {
 if (readdraw == 12378) {
  return EGL.currentReadSurface;
 } else if (readdraw == 12377) {
  return EGL.currentDrawSurface;
 } else {
  EGL.setErrorCode(12300);
  return 0;
 }
}

Module["_eglGetCurrentSurface"] = _eglGetCurrentSurface;

function _eglGetCurrentDisplay() {
 return EGL.currentContext ? 62e3 : 0;
}

Module["_eglGetCurrentDisplay"] = _eglGetCurrentDisplay;

function _eglSwapBuffers() {
 if (Browser.doSwapBuffers) Browser.doSwapBuffers();
 if (!EGL.defaultDisplayInitialized) {
  EGL.setErrorCode(12289);
 } else if (!Module.ctx) {
  EGL.setErrorCode(12290);
 } else if (Module.ctx.isContextLost()) {
  EGL.setErrorCode(12302);
 } else {
  EGL.setErrorCode(12288);
  return 1;
 }
 return 0;
}

Module["_eglSwapBuffers"] = _eglSwapBuffers;

function _eglGetProcAddress(name_) {
 return _emscripten_GetProcAddress(name_);
}

Module["_eglGetProcAddress"] = _eglGetProcAddress;

function _eglReleaseThread() {
 EGL.currentContext = 0;
 EGL.currentReadSurface = 0;
 EGL.currentDrawSurface = 0;
 EGL.setErrorCode(12288);
 return 1;
}

Module["_eglReleaseThread"] = _eglReleaseThread;

var GLFW = {
 Window: function(id, width, height, title, monitor, share) {
  this.id = id;
  this.x = 0;
  this.y = 0;
  this.fullscreen = false;
  this.storedX = 0;
  this.storedY = 0;
  this.width = width;
  this.height = height;
  this.storedWidth = width;
  this.storedHeight = height;
  this.title = title;
  this.monitor = monitor;
  this.share = share;
  this.attributes = GLFW.hints;
  this.inputModes = {
   208897: 212993,
   208898: 0,
   208899: 0
  };
  this.buttons = 0;
  this.keys = new Array();
  this.domKeys = new Array();
  this.shouldClose = 0;
  this.title = null;
  this.windowPosFunc = null;
  this.windowSizeFunc = null;
  this.windowCloseFunc = null;
  this.windowRefreshFunc = null;
  this.windowFocusFunc = null;
  this.windowIconifyFunc = null;
  this.framebufferSizeFunc = null;
  this.mouseButtonFunc = null;
  this.cursorPosFunc = null;
  this.cursorEnterFunc = null;
  this.scrollFunc = null;
  this.dropFunc = null;
  this.keyFunc = null;
  this.charFunc = null;
  this.userptr = null;
 },
 WindowFromId: function(id) {
  if (id <= 0 || !GLFW.windows) return null;
  return GLFW.windows[id - 1];
 },
 joystickFunc: null,
 errorFunc: null,
 monitorFunc: null,
 active: null,
 windows: null,
 monitors: null,
 monitorString: null,
 versionString: null,
 initialTime: null,
 extensions: null,
 hints: null,
 defaultHints: {
  131073: 0,
  131074: 0,
  131075: 1,
  131076: 1,
  131077: 1,
  135169: 8,
  135170: 8,
  135171: 8,
  135172: 8,
  135173: 24,
  135174: 8,
  135175: 0,
  135176: 0,
  135177: 0,
  135178: 0,
  135179: 0,
  135180: 0,
  135181: 0,
  135182: 0,
  135183: 0,
  139265: 196609,
  139266: 1,
  139267: 0,
  139268: 0,
  139269: 0,
  139270: 0,
  139271: 0,
  139272: 0
 },
 DOMToGLFWKeyCode: function(keycode) {
  switch (keycode) {
  case 32:
   return 32;

  case 222:
   return 39;

  case 188:
   return 44;

  case 173:
   return 45;

  case 189:
   return 45;

  case 190:
   return 46;

  case 191:
   return 47;

  case 48:
   return 48;

  case 49:
   return 49;

  case 50:
   return 50;

  case 51:
   return 51;

  case 52:
   return 52;

  case 53:
   return 53;

  case 54:
   return 54;

  case 55:
   return 55;

  case 56:
   return 56;

  case 57:
   return 57;

  case 59:
   return 59;

  case 61:
   return 61;

  case 187:
   return 61;

  case 65:
   return 65;

  case 66:
   return 66;

  case 67:
   return 67;

  case 68:
   return 68;

  case 69:
   return 69;

  case 70:
   return 70;

  case 71:
   return 71;

  case 72:
   return 72;

  case 73:
   return 73;

  case 74:
   return 74;

  case 75:
   return 75;

  case 76:
   return 76;

  case 77:
   return 77;

  case 78:
   return 78;

  case 79:
   return 79;

  case 80:
   return 80;

  case 81:
   return 81;

  case 82:
   return 82;

  case 83:
   return 83;

  case 84:
   return 84;

  case 85:
   return 85;

  case 86:
   return 86;

  case 87:
   return 87;

  case 88:
   return 88;

  case 89:
   return 89;

  case 90:
   return 90;

  case 219:
   return 91;

  case 220:
   return 92;

  case 221:
   return 93;

  case 192:
   return 94;

  case 27:
   return 256 + 1;

  case 112:
   return 256 + 2;

  case 113:
   return 256 + 3;

  case 114:
   return 256 + 4;

  case 115:
   return 256 + 5;

  case 116:
   return 256 + 6;

  case 117:
   return 256 + 7;

  case 118:
   return 256 + 8;

  case 119:
   return 256 + 9;

  case 120:
   return 256 + 10;

  case 121:
   return 256 + 11;

  case 122:
   return 256 + 12;

  case 123:
   return 256 + 13;

  case 124:
   return 256 + 14;

  case 125:
   return 256 + 15;

  case 126:
   return 256 + 16;

  case 127:
   return 256 + 17;

  case 128:
   return 256 + 18;

  case 129:
   return 256 + 19;

  case 130:
   return 256 + 20;

  case 131:
   return 256 + 21;

  case 132:
   return 256 + 22;

  case 133:
   return 256 + 23;

  case 134:
   return 256 + 24;

  case 135:
   return 256 + 25;

  case 136:
   return 256 + 26;

  case 39:
   return 256 + 30;

  case 37:
   return 256 + 29;

  case 40:
   return 256 + 28;

  case 38:
   return 256 + 27;

  case 16:
   return 256 + 31;

  case 17:
   return 256 + 33;

  case 18:
   return 256 + 35;

  case 9:
   return 256 + 37;

  case 13:
   return 256 + 38;

  case 8:
   return 256 + 39;

  case 45:
   return 256 + 40;

  case 46:
   return 256 + 41;

  case 33:
   return 256 + 42;

  case 34:
   return 256 + 43;

  case 36:
   return 256 + 44;

  case 35:
   return 256 + 45;

  case 96:
   return 256 + 46;

  case 97:
   return 256 + 47;

  case 98:
   return 256 + 48;

  case 99:
   return 256 + 49;

  case 100:
   return 256 + 50;

  case 101:
   return 256 + 51;

  case 102:
   return 256 + 52;

  case 103:
   return 256 + 53;

  case 104:
   return 256 + 54;

  case 105:
   return 256 + 55;

  case 111:
   return 256 + 56;

  case 106:
   return 256 + 57;

  case 109:
   return 256 + 58;

  case 107:
   return 256 + 59;

  case 110:
   return 256 + 60;

  case 144:
   return 256 + 63;

  case 20:
   return 256 + 64;

  case 145:
   return 256 + 65;

  case 19:
   return 256 + 66;

  case 91:
   return 256 + 67;

  case 93:
   return 256 + 69;

  default:
   return -1;
  }
 },
 getModBits: function(win) {
  var mod = 0;
  if (win.keys[340]) mod |= 1;
  if (win.keys[341]) mod |= 2;
  if (win.keys[342]) mod |= 4;
  if (win.keys[343]) mod |= 8;
  return mod;
 },
 onKeyPress: function(event) {
  if (!GLFW.active || !GLFW.active.charFunc) return;
  if (event.ctrlKey || event.metaKey) return;
  var charCode = event.charCode;
  if (charCode == 0 || charCode >= 0 && charCode <= 31) return;
  dynCall_vii(GLFW.active.charFunc, charCode, 1);
 },
 onKeyChanged: function(keyCode, status) {
  if (!GLFW.active) return;
  var key = GLFW.DOMToGLFWKeyCode(keyCode);
  if (key == -1) return;
  GLFW.active.keys[key] = status;
  GLFW.active.domKeys[keyCode] = status;
  if (!GLFW.active.keyFunc) return;
  dynCall_vii(GLFW.active.keyFunc, key, status);
 },
 onGamepadConnected: function(event) {
  GLFW.refreshJoysticks();
 },
 onGamepadDisconnected: function(event) {
  GLFW.refreshJoysticks();
 },
 onKeydown: function(event) {
  GLFW.onKeyChanged(event.keyCode, 1);
  if (event.keyCode === 8 || event.keyCode === 9) {
   event.preventDefault();
  }
 },
 onKeyup: function(event) {
  GLFW.onKeyChanged(event.keyCode, 0);
 },
 onBlur: function(event) {
  if (!GLFW.active) return;
  for (var i = 0; i < GLFW.active.domKeys.length; ++i) {
   if (GLFW.active.domKeys[i]) {
    GLFW.onKeyChanged(i, 0);
   }
  }
 },
 onMousemove: function(event) {
  if (!GLFW.active) return;
  Browser.calculateMouseEvent(event);
  if (event.target != Module["canvas"] || !GLFW.active.cursorPosFunc) return;
  dynCall_vii(GLFW.active.cursorPosFunc, Browser.mouseX, Browser.mouseY);
 },
 DOMToGLFWMouseButton: function(event) {
  var eventButton = event["button"];
  if (eventButton > 0) {
   if (eventButton == 1) {
    eventButton = 2;
   } else {
    eventButton = 1;
   }
  }
  return eventButton;
 },
 onMouseenter: function(event) {
  if (!GLFW.active) return;
  if (event.target != Module["canvas"] || !GLFW.active.cursorEnterFunc) return;
 },
 onMouseleave: function(event) {
  if (!GLFW.active) return;
  if (event.target != Module["canvas"] || !GLFW.active.cursorEnterFunc) return;
 },
 onMouseButtonChanged: function(event, status) {
  if (!GLFW.active) return;
  Browser.calculateMouseEvent(event);
  if (event.target != Module["canvas"]) return;
  var eventButton = GLFW.DOMToGLFWMouseButton(event);
  if (status == 1) {
   GLFW.active.buttons |= 1 << eventButton;
   try {
    event.target.setCapture();
   } catch (e) {}
  } else {
   GLFW.active.buttons &= ~(1 << eventButton);
  }
  if (!GLFW.active.mouseButtonFunc) return;
  dynCall_vii(GLFW.active.mouseButtonFunc, eventButton, status);
 },
 onMouseButtonDown: function(event) {
  if (!GLFW.active) return;
  GLFW.onMouseButtonChanged(event, 1);
 },
 onMouseButtonUp: function(event) {
  if (!GLFW.active) return;
  GLFW.onMouseButtonChanged(event, 0);
 },
 onMouseWheel: function(event) {
  var delta = -Browser.getMouseWheelDelta(event);
  delta = delta == 0 ? 0 : delta > 0 ? Math.max(delta, 1) : Math.min(delta, -1);
  GLFW.wheelPos += delta;
  if (!GLFW.active || !GLFW.active.scrollFunc || event.target != Module["canvas"]) return;
  dynCall_vi(GLFW.active.scrollFunc, GLFW.wheelPos);
  event.preventDefault();
 },
 onCanvasResize: function(width, height) {
  if (!GLFW.active) return;
  var resizeNeeded = true;
  if (document["fullscreen"] || document["fullScreen"] || document["mozFullScreen"] || document["webkitIsFullScreen"]) {
   GLFW.active.storedX = GLFW.active.x;
   GLFW.active.storedY = GLFW.active.y;
   GLFW.active.storedWidth = GLFW.active.width;
   GLFW.active.storedHeight = GLFW.active.height;
   GLFW.active.x = GLFW.active.y = 0;
   GLFW.active.width = screen.width;
   GLFW.active.height = screen.height;
   GLFW.active.fullscreen = true;
  } else if (GLFW.active.fullscreen == true) {
   GLFW.active.x = GLFW.active.storedX;
   GLFW.active.y = GLFW.active.storedY;
   GLFW.active.width = GLFW.active.storedWidth;
   GLFW.active.height = GLFW.active.storedHeight;
   GLFW.active.fullscreen = false;
  } else if (GLFW.active.width != width || GLFW.active.height != height) {
   GLFW.active.width = width;
   GLFW.active.height = height;
  } else {
   resizeNeeded = false;
  }
  if (resizeNeeded) {
   Browser.setCanvasSize(GLFW.active.width, GLFW.active.height, true);
   GLFW.onWindowSizeChanged();
   GLFW.onFramebufferSizeChanged();
  }
 },
 onWindowSizeChanged: function() {
  if (!GLFW.active) return;
  if (!GLFW.active.windowSizeFunc) return;
  dynCall_vii(GLFW.active.windowSizeFunc, GLFW.active.width, GLFW.active.height);
 },
 onFramebufferSizeChanged: function() {
  if (!GLFW.active) return;
  if (!GLFW.active.framebufferSizeFunc) return;
 },
 getTime: function() {
  return _emscripten_get_now() / 1e3;
 },
 setWindowTitle: function(winid, title) {
  var win = GLFW.WindowFromId(winid);
  if (!win) return;
  win.title = UTF8ToString(title);
  if (GLFW.active.id == win.id) {
   document.title = win.title;
  }
 },
 setJoystickCallback: function(cbfun) {
  GLFW.joystickFunc = cbfun;
  GLFW.refreshJoysticks();
 },
 joys: {},
 lastGamepadState: null,
 lastGamepadStateFrame: null,
 refreshJoysticks: function() {
  if (Browser.mainLoop.currentFrameNumber !== GLFW.lastGamepadStateFrame || !Browser.mainLoop.currentFrameNumber) {
   GLFW.lastGamepadState = navigator.getGamepads ? navigator.getGamepads() : navigator.webkitGetGamepads ? navigator.webkitGetGamepads : null;
   GLFW.lastGamepadStateFrame = Browser.mainLoop.currentFrameNumber;
   for (var joy = 0; joy < GLFW.lastGamepadState.length; ++joy) {
    var gamepad = GLFW.lastGamepadState[joy];
    if (gamepad) {
     if (!GLFW.joys[joy]) {
      console.log("glfw joystick connected:", joy);
      GLFW.joys[joy] = {
       id: allocate(intArrayFromString(gamepad.id), "i8", ALLOC_NORMAL),
       buttonsCount: gamepad.buttons.length,
       axesCount: gamepad.axes.length,
       buttons: allocate(new Array(gamepad.buttons.length), "i8", ALLOC_NORMAL),
       axes: allocate(new Array(gamepad.axes.length * 4), "float", ALLOC_NORMAL)
      };
      if (GLFW.joystickFunc) {
       dynCall_vii(GLFW.joystickFunc, joy, 262145);
      }
     }
     var data = GLFW.joys[joy];
     for (var i = 0; i < gamepad.buttons.length; ++i) {
      setValue(data.buttons + i, gamepad.buttons[i].pressed, "i8");
     }
     for (var i = 0; i < gamepad.axes.length; ++i) {
      setValue(data.axes + i * 4, gamepad.axes[i], "float");
     }
    } else {
     if (GLFW.joys[joy]) {
      console.log("glfw joystick disconnected", joy);
      if (GLFW.joystickFunc) {
       dynCall_vii(GLFW.joystickFunc, joy, 262146);
      }
      _free(GLFW.joys[joy].id);
      _free(GLFW.joys[joy].buttons);
      _free(GLFW.joys[joy].axes);
      delete GLFW.joys[joy];
     }
    }
   }
  }
 },
 setKeyCallback: function(winid, cbfun) {
  var win = GLFW.WindowFromId(winid);
  if (!win) return null;
  var prevcbfun = win.keyFunc;
  win.keyFunc = cbfun;
  return prevcbfun;
 },
 setCharCallback: function(winid, cbfun) {
  var win = GLFW.WindowFromId(winid);
  if (!win) return null;
  var prevcbfun = win.charFunc;
  win.charFunc = cbfun;
  return prevcbfun;
 },
 setMouseButtonCallback: function(winid, cbfun) {
  var win = GLFW.WindowFromId(winid);
  if (!win) return null;
  var prevcbfun = win.mouseButtonFunc;
  win.mouseButtonFunc = cbfun;
  return prevcbfun;
 },
 setCursorPosCallback: function(winid, cbfun) {
  var win = GLFW.WindowFromId(winid);
  if (!win) return null;
  var prevcbfun = win.cursorPosFunc;
  win.cursorPosFunc = cbfun;
  return prevcbfun;
 },
 setScrollCallback: function(winid, cbfun) {
  var win = GLFW.WindowFromId(winid);
  if (!win) return null;
  var prevcbfun = win.scrollFunc;
  win.scrollFunc = cbfun;
  return prevcbfun;
 },
 setDropCallback: function(winid, cbfun) {
  var win = GLFW.WindowFromId(winid);
  if (!win) return null;
  var prevcbfun = win.dropFunc;
  win.dropFunc = cbfun;
  return prevcbfun;
 },
 onDrop: function(event) {
  if (!GLFW.active || !GLFW.active.dropFunc) return;
  if (!event.dataTransfer || !event.dataTransfer.files || event.dataTransfer.files.length == 0) return;
  event.preventDefault();
  var filenames = allocate(new Array(event.dataTransfer.files.length * 4), "i8*", ALLOC_NORMAL);
  var filenamesArray = [];
  var count = event.dataTransfer.files.length;
  var written = 0;
  var drop_dir = ".glfw_dropped_files";
  FS.createPath("/", drop_dir);
  function save(file) {
   var path = "/" + drop_dir + "/" + file.name.replace(/\//g, "_");
   var reader = new FileReader();
   reader.onloadend = function(e) {
    if (reader.readyState != 2) {
     ++written;
     console.log("failed to read dropped file: " + file.name + ": " + reader.error);
     return;
    }
    var data = e.target.result;
    FS.writeFile(path, new Uint8Array(data));
    if (++written === count) {
     dynCall_viii(GLFW.active.dropFunc, GLFW.active.id, count, filenames);
     for (var i = 0; i < filenamesArray.length; ++i) {
      _free(filenamesArray[i]);
     }
     _free(filenames);
    }
   };
   reader.readAsArrayBuffer(file);
   var filename = allocate(intArrayFromString(path), "i8", ALLOC_NORMAL);
   filenamesArray.push(filename);
   setValue(filenames + i * 4, filename, "i8*");
  }
  for (var i = 0; i < count; ++i) {
   save(event.dataTransfer.files[i]);
  }
  return false;
 },
 onDragover: function(event) {
  if (!GLFW.active || !GLFW.active.dropFunc) return;
  event.preventDefault();
  return false;
 },
 setWindowSizeCallback: function(winid, cbfun) {
  var win = GLFW.WindowFromId(winid);
  if (!win) return null;
  var prevcbfun = win.windowSizeFunc;
  win.windowSizeFunc = cbfun;
  if (!win.windowSizeFunc) return null;
  dynCall_vii(win.windowSizeFunc, win.width, win.height);
  return prevcbfun;
 },
 setWindowCloseCallback: function(winid, cbfun) {
  var win = GLFW.WindowFromId(winid);
  if (!win) return null;
  var prevcbfun = win.windowCloseFunc;
  win.windowCloseFunc = cbfun;
  return prevcbfun;
 },
 setWindowRefreshCallback: function(winid, cbfun) {
  var win = GLFW.WindowFromId(winid);
  if (!win) return null;
  var prevcbfun = win.windowRefreshFunc;
  win.windowRefreshFunc = cbfun;
  return prevcbfun;
 },
 onClickRequestPointerLock: function(e) {
  if (!Browser.pointerLock && Module["canvas"].requestPointerLock) {
   Module["canvas"].requestPointerLock();
   e.preventDefault();
  }
 },
 setInputMode: function(winid, mode, value) {
  var win = GLFW.WindowFromId(winid);
  if (!win) return;
  switch (mode) {
  case 208897:
   {
    switch (value) {
    case 212993:
     {
      win.inputModes[mode] = value;
      Module["canvas"].removeEventListener("click", GLFW.onClickRequestPointerLock, true);
      Module["canvas"].exitPointerLock();
      break;
     }

    case 212994:
     {
      console.log("glfwSetInputMode called with GLFW_CURSOR_HIDDEN value not implemented.");
      break;
     }

    case 212995:
     {
      win.inputModes[mode] = value;
      Module["canvas"].addEventListener("click", GLFW.onClickRequestPointerLock, true);
      Module["canvas"].requestPointerLock();
      break;
     }

    default:
     {
      console.log("glfwSetInputMode called with unknown value parameter value: " + value + ".");
      break;
     }
    }
    break;
   }

  case 208898:
   {
    console.log("glfwSetInputMode called with GLFW_STICKY_KEYS mode not implemented.");
    break;
   }

  case 208899:
   {
    console.log("glfwSetInputMode called with GLFW_STICKY_MOUSE_BUTTONS mode not implemented.");
    break;
   }

  default:
   {
    console.log("glfwSetInputMode called with unknown mode parameter value: " + mode + ".");
    break;
   }
  }
 },
 getKey: function(winid, key) {
  var win = GLFW.WindowFromId(winid);
  if (!win) return 0;
  return win.keys[key];
 },
 getMouseButton: function(winid, button) {
  var win = GLFW.WindowFromId(winid);
  if (!win) return 0;
  return (win.buttons & 1 << button) > 0;
 },
 getCursorPos: function(winid, x, y) {
  setValue(x, Browser.mouseX, "double");
  setValue(y, Browser.mouseY, "double");
 },
 getMousePos: function(winid, x, y) {
  setValue(x, Browser.mouseX, "i32");
  setValue(y, Browser.mouseY, "i32");
 },
 setCursorPos: function(winid, x, y) {},
 getWindowPos: function(winid, x, y) {
  var wx = 0;
  var wy = 0;
  var win = GLFW.WindowFromId(winid);
  if (win) {
   wx = win.x;
   wy = win.y;
  }
  setValue(x, wx, "i32");
  setValue(y, wy, "i32");
 },
 setWindowPos: function(winid, x, y) {
  var win = GLFW.WindowFromId(winid);
  if (!win) return;
  win.x = x;
  win.y = y;
 },
 getWindowSize: function(winid, width, height) {
  var ww = 0;
  var wh = 0;
  var win = GLFW.WindowFromId(winid);
  if (win) {
   ww = win.width;
   wh = win.height;
  }
  setValue(width, ww, "i32");
  setValue(height, wh, "i32");
 },
 setWindowSize: function(winid, width, height) {
  var win = GLFW.WindowFromId(winid);
  if (!win) return;
  if (GLFW.active.id == win.id) {
   if (width == screen.width && height == screen.height) {
    Browser.requestFullscreen();
   } else {
    Browser.exitFullscreen();
    Browser.setCanvasSize(width, height);
    win.width = width;
    win.height = height;
   }
  }
  if (!win.windowSizeFunc) return;
  dynCall_vii(win.windowSizeFunc, width, height);
 },
 createWindow: function(width, height, title, monitor, share) {
  var i, id;
  for (i = 0; i < GLFW.windows.length && GLFW.windows[i] !== null; i++) ;
  if (i > 0) throw "glfwCreateWindow only supports one window at time currently";
  id = i + 1;
  if (width <= 0 || height <= 0) return 0;
  if (monitor) {
   Browser.requestFullscreen();
  } else {
   Browser.setCanvasSize(width, height);
  }
  for (i = 0; i < GLFW.windows.length && GLFW.windows[i] == null; i++) ;
  if (i == GLFW.windows.length) {
   var contextAttributes = {
    antialias: GLFW.hints[135181] > 1,
    depth: GLFW.hints[135173] > 0,
    stencil: GLFW.hints[135174] > 0,
    alpha: GLFW.hints[135172] > 0
   };
   Module.ctx = Browser.createContext(Module["canvas"], true, true, contextAttributes);
  }
  if (!Module.ctx) return 0;
  var win = new GLFW.Window(id, width, height, title, monitor, share);
  if (id - 1 == GLFW.windows.length) {
   GLFW.windows.push(win);
  } else {
   GLFW.windows[id - 1] = win;
  }
  GLFW.active = win;
  return win.id;
 },
 destroyWindow: function(winid) {
  var win = GLFW.WindowFromId(winid);
  if (!win) return;
  GLFW.windows[win.id - 1] = null;
  if (GLFW.active.id == win.id) GLFW.active = null;
  for (var i = 0; i < GLFW.windows.length; i++) if (GLFW.windows[i] !== null) return;
  Module.ctx = Browser.destroyContext(Module["canvas"], true, true);
 },
 swapBuffers: function(winid) {},
 GLFW2ParamToGLFW3Param: function(param) {
  var table = {
   196609: 0,
   196610: 0,
   196611: 0,
   196612: 0,
   196613: 0,
   196614: 0,
   131073: 0,
   131074: 0,
   131075: 0,
   131076: 0,
   131077: 135169,
   131078: 135170,
   131079: 135171,
   131080: 135172,
   131081: 135173,
   131082: 135174,
   131083: 135183,
   131084: 135175,
   131085: 135176,
   131086: 135177,
   131087: 135178,
   131088: 135179,
   131089: 135180,
   131090: 0,
   131091: 135181,
   131092: 139266,
   131093: 139267,
   131094: 139270,
   131095: 139271,
   131096: 139272
  };
  return table[param];
 }
};

Module["GLFW"] = GLFW;

function _glfwInit() {
 if (GLFW.windows) return 1;
 GLFW.initialTime = GLFW.getTime();
 GLFW.hints = GLFW.defaultHints;
 GLFW.windows = new Array();
 GLFW.active = null;
 window.addEventListener("gamepadconnected", GLFW.onGamepadConnected, true);
 window.addEventListener("gamepaddisconnected", GLFW.onGamepadDisconnected, true);
 window.addEventListener("keydown", GLFW.onKeydown, true);
 window.addEventListener("keypress", GLFW.onKeyPress, true);
 window.addEventListener("keyup", GLFW.onKeyup, true);
 window.addEventListener("blur", GLFW.onBlur, true);
 Module["canvas"].addEventListener("mousemove", GLFW.onMousemove, true);
 Module["canvas"].addEventListener("mousedown", GLFW.onMouseButtonDown, true);
 Module["canvas"].addEventListener("mouseup", GLFW.onMouseButtonUp, true);
 Module["canvas"].addEventListener("wheel", GLFW.onMouseWheel, true);
 Module["canvas"].addEventListener("mousewheel", GLFW.onMouseWheel, true);
 Module["canvas"].addEventListener("mouseenter", GLFW.onMouseenter, true);
 Module["canvas"].addEventListener("mouseleave", GLFW.onMouseleave, true);
 Module["canvas"].addEventListener("drop", GLFW.onDrop, true);
 Module["canvas"].addEventListener("dragover", GLFW.onDragover, true);
 Browser.resizeListeners.push(function(width, height) {
  GLFW.onCanvasResize(width, height);
 });
 return 1;
}

Module["_glfwInit"] = _glfwInit;

function _glfwTerminate() {
 window.removeEventListener("gamepadconnected", GLFW.onGamepadConnected, true);
 window.removeEventListener("gamepaddisconnected", GLFW.onGamepadDisconnected, true);
 window.removeEventListener("keydown", GLFW.onKeydown, true);
 window.removeEventListener("keypress", GLFW.onKeyPress, true);
 window.removeEventListener("keyup", GLFW.onKeyup, true);
 window.removeEventListener("blur", GLFW.onBlur, true);
 Module["canvas"].removeEventListener("mousemove", GLFW.onMousemove, true);
 Module["canvas"].removeEventListener("mousedown", GLFW.onMouseButtonDown, true);
 Module["canvas"].removeEventListener("mouseup", GLFW.onMouseButtonUp, true);
 Module["canvas"].removeEventListener("wheel", GLFW.onMouseWheel, true);
 Module["canvas"].removeEventListener("mousewheel", GLFW.onMouseWheel, true);
 Module["canvas"].removeEventListener("mouseenter", GLFW.onMouseenter, true);
 Module["canvas"].removeEventListener("mouseleave", GLFW.onMouseleave, true);
 Module["canvas"].removeEventListener("drop", GLFW.onDrop, true);
 Module["canvas"].removeEventListener("dragover", GLFW.onDragover, true);
 Module["canvas"].width = Module["canvas"].height = 1;
 GLFW.windows = null;
 GLFW.active = null;
}

Module["_glfwTerminate"] = _glfwTerminate;

function _glfwGetVersion(major, minor, rev) {
 setValue(major, 2, "i32");
 setValue(minor, 7, "i32");
 setValue(rev, 7, "i32");
}

Module["_glfwGetVersion"] = _glfwGetVersion;

function _glfwPollEvents() {}

Module["_glfwPollEvents"] = _glfwPollEvents;

function _glfwWaitEvents() {}

Module["_glfwWaitEvents"] = _glfwWaitEvents;

function _glfwGetTime() {
 return GLFW.getTime() - GLFW.initialTime;
}

Module["_glfwGetTime"] = _glfwGetTime;

function _glfwSetTime(time) {
 GLFW.initialTime = GLFW.getTime() - time;
}

Module["_glfwSetTime"] = _glfwSetTime;

function _glfwExtensionSupported(extension) {
 if (!GLFW.extensions) {
  GLFW.extensions = UTF8ToString(_glGetString(7939)).split(" ");
 }
 if (GLFW.extensions.indexOf(extension) != -1) return 1;
 return GLFW.extensions.indexOf("GL_" + extension) != -1;
}

Module["_glfwExtensionSupported"] = _glfwExtensionSupported;

function _glfwGetProcAddress(procname) {
 return _emscripten_GetProcAddress(procname);
}

Module["_glfwGetProcAddress"] = _glfwGetProcAddress;

function _glfwSwapInterval(interval) {
 interval = Math.abs(interval);
 if (interval == 0) _emscripten_set_main_loop_timing(0, 0); else _emscripten_set_main_loop_timing(1, interval);
}

Module["_glfwSwapInterval"] = _glfwSwapInterval;

function _glfwOpenWindow(width, height, redbits, greenbits, bluebits, alphabits, depthbits, stencilbits, mode) {
 GLFW.hints[135169] = redbits;
 GLFW.hints[135170] = greenbits;
 GLFW.hints[135171] = bluebits;
 GLFW.hints[135172] = alphabits;
 GLFW.hints[135173] = depthbits;
 GLFW.hints[135174] = stencilbits;
 GLFW.createWindow(width, height, "GLFW2 Window", 0, 0);
 return 1;
}

Module["_glfwOpenWindow"] = _glfwOpenWindow;

function _glfwCloseWindow() {
 GLFW.destroyWindow(GLFW.active.id);
}

Module["_glfwCloseWindow"] = _glfwCloseWindow;

function _glfwOpenWindowHint(target, hint) {
 target = GLFW.GLFW2ParamToGLFW3Param(target);
 GLFW.hints[target] = hint;
}

Module["_glfwOpenWindowHint"] = _glfwOpenWindowHint;

function _glfwGetWindowSize(width, height) {
 GLFW.getWindowSize(GLFW.active.id, width, height);
}

Module["_glfwGetWindowSize"] = _glfwGetWindowSize;

function _glfwSetWindowSize(width, height) {
 GLFW.setWindowSize(GLFW.active.id, width, height);
}

Module["_glfwSetWindowSize"] = _glfwSetWindowSize;

function _glfwGetWindowPos(x, y) {
 GLFW.getWindowPos(GLFW.active.id, x, y);
}

Module["_glfwGetWindowPos"] = _glfwGetWindowPos;

function _glfwSetWindowPos(x, y) {
 GLFW.setWindowPos(GLFW.active.id, x, y);
}

Module["_glfwSetWindowPos"] = _glfwSetWindowPos;

function _glfwSetWindowTitle(title) {
 GLFW.setWindowTitle(GLFW.active.id, title);
}

Module["_glfwSetWindowTitle"] = _glfwSetWindowTitle;

function _glfwIconifyWindow() {
 GLFW.iconifyWindow(GLFW.active.id);
}

Module["_glfwIconifyWindow"] = _glfwIconifyWindow;

function _glfwRestoreWindow() {
 GLFW.restoreWindow(GLFW.active.id);
}

Module["_glfwRestoreWindow"] = _glfwRestoreWindow;

function _glfwSwapBuffers() {
 GLFW.swapBuffers(GLFW.active.id);
}

Module["_glfwSwapBuffers"] = _glfwSwapBuffers;

function _glfwGetWindowParam(param) {
 param = GLFW.GLFW2ParamToGLFW3Param(param);
 return GLFW.hints[param];
}

Module["_glfwGetWindowParam"] = _glfwGetWindowParam;

function _glfwSetWindowSizeCallback(cbfun) {
 GLFW.setWindowSizeCallback(GLFW.active.id, cbfun);
}

Module["_glfwSetWindowSizeCallback"] = _glfwSetWindowSizeCallback;

function _glfwSetWindowCloseCallback(cbfun) {
 GLFW.setWindowCloseCallback(GLFW.active.id, cbfun);
}

Module["_glfwSetWindowCloseCallback"] = _glfwSetWindowCloseCallback;

function _glfwSetWindowRefreshCallback(cbfun) {
 GLFW.setWindowRefreshCallback(GLFW.active.id, cbfun);
}

Module["_glfwSetWindowRefreshCallback"] = _glfwSetWindowRefreshCallback;

function _glfwGetKey(key) {
 return GLFW.getKey(GLFW.active.id, key);
}

Module["_glfwGetKey"] = _glfwGetKey;

function _glfwGetMouseButton(button) {
 return GLFW.getMouseButton(GLFW.active.id, button);
}

Module["_glfwGetMouseButton"] = _glfwGetMouseButton;

function _glfwGetMousePos(x, y) {
 GLFW.getMousePos(GLFW.active.id, x, y);
}

Module["_glfwGetMousePos"] = _glfwGetMousePos;

function _glfwSetMousePos(x, y) {
 GLFW.setCursorPos(GLFW.active.id, x, y);
}

Module["_glfwSetMousePos"] = _glfwSetMousePos;

function _glfwGetMouseWheel() {
 return 0;
}

Module["_glfwGetMouseWheel"] = _glfwGetMouseWheel;

function _glfwSetMouseWheel(pos) {}

Module["_glfwSetMouseWheel"] = _glfwSetMouseWheel;

function _glfwSetKeyCallback(cbfun) {
 GLFW.setKeyCallback(GLFW.active.id, cbfun);
}

Module["_glfwSetKeyCallback"] = _glfwSetKeyCallback;

function _glfwSetCharCallback(cbfun) {
 GLFW.setCharCallback(GLFW.active.id, cbfun);
}

Module["_glfwSetCharCallback"] = _glfwSetCharCallback;

function _glfwSetMouseButtonCallback(cbfun) {
 GLFW.setMouseButtonCallback(GLFW.active.id, cbfun);
}

Module["_glfwSetMouseButtonCallback"] = _glfwSetMouseButtonCallback;

function _glfwSetMousePosCallback(cbfun) {
 GLFW.setCursorPosCallback(GLFW.active.id, cbfun);
}

Module["_glfwSetMousePosCallback"] = _glfwSetMousePosCallback;

function _glfwSetMouseWheelCallback(cbfun) {
 GLFW.setScrollCallback(GLFW.active.id, cbfun);
}

Module["_glfwSetMouseWheelCallback"] = _glfwSetMouseWheelCallback;

function _glfwGetDesktopMode(mode) {
 throw "glfwGetDesktopMode is not implemented.";
}

Module["_glfwGetDesktopMode"] = _glfwGetDesktopMode;

function _sleep() {
 if (!Module["_sleep"]) abort("external function 'sleep' is missing. perhaps a side module was not linked in? if this function was expected to arrive from a system library, try to build the MAIN_MODULE with EMCC_FORCE_STDLIBS=1 in the environment");
 return Module["_sleep"].apply(null, arguments);
}

function _glfwSleep(time) {
 _sleep(time);
}

Module["_glfwSleep"] = _glfwSleep;

function _glfwEnable(target) {
 target = GLFW.GLFW2ParamToGLFW3Param(target);
 GLFW.hints[target] = false;
}

Module["_glfwEnable"] = _glfwEnable;

function _glfwDisable(target) {
 target = GLFW.GLFW2ParamToGLFW3Param(target);
 GLFW.hints[target] = true;
}

Module["_glfwDisable"] = _glfwDisable;

function _glfwGetGLVersion(major, minor, rev) {
 setValue(major, 0, "i32");
 setValue(minor, 0, "i32");
 setValue(rev, 1, "i32");
}

Module["_glfwGetGLVersion"] = _glfwGetGLVersion;

function _glfwCreateThread(fun, arg) {
 var str = "v";
 for (var i in arg) {
  str += "i";
 }
 dynCall(str, fun, arg);
 return 0;
}

Module["_glfwCreateThread"] = _glfwCreateThread;

function _glfwDestroyThread(ID) {}

Module["_glfwDestroyThread"] = _glfwDestroyThread;

function _glfwWaitThread(ID, waitmode) {}

Module["_glfwWaitThread"] = _glfwWaitThread;

function _glfwGetThreadID() {
 return 0;
}

Module["_glfwGetThreadID"] = _glfwGetThreadID;

function _glfwCreateMutex() {
 throw "glfwCreateMutex is not implemented.";
}

Module["_glfwCreateMutex"] = _glfwCreateMutex;

function _glfwDestroyMutex(mutex) {
 throw "glfwDestroyMutex is not implemented.";
}

Module["_glfwDestroyMutex"] = _glfwDestroyMutex;

function _glfwLockMutex(mutex) {
 throw "glfwLockMutex is not implemented.";
}

Module["_glfwLockMutex"] = _glfwLockMutex;

function _glfwUnlockMutex(mutex) {
 throw "glfwUnlockMutex is not implemented.";
}

Module["_glfwUnlockMutex"] = _glfwUnlockMutex;

function _glfwCreateCond() {
 throw "glfwCreateCond is not implemented.";
}

Module["_glfwCreateCond"] = _glfwCreateCond;

function _glfwDestroyCond(cond) {
 throw "glfwDestroyCond is not implemented.";
}

Module["_glfwDestroyCond"] = _glfwDestroyCond;

function _glfwWaitCond(cond, mutex, timeout) {
 throw "glfwWaitCond is not implemented.";
}

Module["_glfwWaitCond"] = _glfwWaitCond;

function _glfwSignalCond(cond) {
 throw "glfwSignalCond is not implemented.";
}

Module["_glfwSignalCond"] = _glfwSignalCond;

function _glfwBroadcastCond(cond) {
 throw "glfwBroadcastCond is not implemented.";
}

Module["_glfwBroadcastCond"] = _glfwBroadcastCond;

function _glfwGetNumberOfProcessors() {
 return 1;
}

Module["_glfwGetNumberOfProcessors"] = _glfwGetNumberOfProcessors;

function _glfwReadImage(name, img, flags) {
 throw "glfwReadImage is not implemented.";
}

Module["_glfwReadImage"] = _glfwReadImage;

function _glfwReadMemoryImage(data, size, img, flags) {
 throw "glfwReadMemoryImage is not implemented.";
}

Module["_glfwReadMemoryImage"] = _glfwReadMemoryImage;

function _glfwFreeImage(img) {
 throw "glfwFreeImage is not implemented.";
}

Module["_glfwFreeImage"] = _glfwFreeImage;

function _glfwLoadTexture2D(name, flags) {
 throw "glfwLoadTexture2D is not implemented.";
}

Module["_glfwLoadTexture2D"] = _glfwLoadTexture2D;

function _glfwLoadMemoryTexture2D(data, size, flags) {
 throw "glfwLoadMemoryTexture2D is not implemented.";
}

Module["_glfwLoadMemoryTexture2D"] = _glfwLoadMemoryTexture2D;

function _glfwLoadTextureImage2D(img, flags) {
 throw "glfwLoadTextureImage2D is not implemented.";
}

Module["_glfwLoadTextureImage2D"] = _glfwLoadTextureImage2D;

function _uuid_clear(uu) {
 _memset(uu, 0, 16);
}

Module["_uuid_clear"] = _uuid_clear;

function _memcmp() {
 if (!Module["_memcmp"]) abort("external function 'memcmp' is missing. perhaps a side module was not linked in? if this function was expected to arrive from a system library, try to build the MAIN_MODULE with EMCC_FORCE_STDLIBS=1 in the environment");
 return Module["_memcmp"].apply(null, arguments);
}

function _uuid_compare(uu1, uu2) {
 return _memcmp(uu1, uu2, 16);
}

Module["_uuid_compare"] = _uuid_compare;

function _uuid_copy(dst, src) {
 _memcpy(dst, src, 16);
}

Module["_uuid_copy"] = _uuid_copy;

function _uuid_generate(out) {
 var uuid = null;
 if (ENVIRONMENT_IS_NODE) {
  try {
   var rb = require("crypto")["randomBytes"];
   uuid = rb(16);
  } catch (e) {}
 } else if (ENVIRONMENT_IS_WEB && typeof window.crypto !== "undefined" && typeof window.crypto.getRandomValues !== "undefined") {
  uuid = new Uint8Array(16);
  window.crypto.getRandomValues(uuid);
 }
 if (!uuid) {
  uuid = new Array(16);
  var d = new Date().getTime();
  for (var i = 0; i < 16; i++) {
   var r = (d + Math.random() * 256) % 256 | 0;
   d = d / 256 | 0;
   uuid[i] = r;
  }
 }
 uuid[6] = uuid[6] & 15 | 64;
 uuid[8] = uuid[8] & 127 | 128;
 writeArrayToMemory(uuid, out);
}

Module["_uuid_generate"] = _uuid_generate;

function _uuid_is_null(uu) {
 for (var i = 0; i < 4; i++, uu = uu + 4 | 0) {
  var val = HEAP32[uu >> 2];
  if (val) {
   return 0;
  }
 }
 return 1;
}

Module["_uuid_is_null"] = _uuid_is_null;

function _uuid_parse(inp, uu) {
 var inp = UTF8ToString(inp);
 if (inp.length === 36) {
  var i = 0;
  var uuid = new Array(16);
  inp.toLowerCase().replace(/[0-9a-f]{2}/g, function(byte) {
   if (i < 16) {
    uuid[i++] = parseInt(byte, 16);
   }
  });
  if (i < 16) {
   return -1;
  } else {
   writeArrayToMemory(uuid, uu);
   return 0;
  }
 } else {
  return -1;
 }
}

Module["_uuid_parse"] = _uuid_parse;

function _uuid_unparse(uu, out, upper) {
 var i = 0;
 var uuid = "xxxx-xx-xx-xx-xxxxxx".replace(/[x]/g, function(c) {
  var r = upper ? HEAPU8[uu + i >> 0].toString(16).toUpperCase() : HEAPU8[uu + i >> 0].toString(16);
  r = r.length === 1 ? "0" + r : r;
  i++;
  return r;
 });
 stringToUTF8(uuid, out, 37);
}

Module["_uuid_unparse"] = _uuid_unparse;

function _uuid_unparse_lower(uu, out) {
 _uuid_unparse(uu, out);
}

Module["_uuid_unparse_lower"] = _uuid_unparse_lower;

function _uuid_unparse_upper(uu, out) {
 _uuid_unparse(uu, out, true);
}

Module["_uuid_unparse_upper"] = _uuid_unparse_upper;

function _uuid_type(uu) {
 return 4;
}

Module["_uuid_type"] = _uuid_type;

function _uuid_variant(uu) {
 return 1;
}

Module["_uuid_variant"] = _uuid_variant;

var GLEW = {
 isLinaroFork: 1,
 extensions: null,
 error: {
  0: null,
  1: null,
  2: null,
  3: null,
  4: null,
  5: null,
  6: null,
  7: null,
  8: null
 },
 version: {
  1: null,
  2: null,
  3: null,
  4: null
 },
 errorStringConstantFromCode: function(error) {
  if (GLEW.isLinaroFork) {
   switch (error) {
   case 4:
    return "OpenGL ES lib expected, found OpenGL lib";

   case 5:
    return "OpenGL lib expected, found OpenGL ES lib";

   case 6:
    return "Missing EGL version";

   case 7:
    return "EGL 1.1 and up are supported";

   default:
    break;
   }
  }
  switch (error) {
  case 0:
   return "No error";

  case 1:
   return "Missing GL version";

  case 2:
   return "GL 1.1 and up are supported";

  case 3:
   return "GLX 1.2 and up are supported";

  default:
   return null;
  }
 },
 errorString: function(error) {
  if (!GLEW.error[error]) {
   var string = GLEW.errorStringConstantFromCode(error);
   if (!string) {
    string = "Unknown error";
    error = 8;
   }
   GLEW.error[error] = allocate(intArrayFromString(string), "i8", ALLOC_NORMAL);
  }
  return GLEW.error[error];
 },
 versionStringConstantFromCode: function(name) {
  switch (name) {
  case 1:
   return "1.10.0";

  case 2:
   return "1";

  case 3:
   return "10";

  case 4:
   return "0";

  default:
   return null;
  }
 },
 versionString: function(name) {
  if (!GLEW.version[name]) {
   var string = GLEW.versionStringConstantFromCode(name);
   if (!string) return 0;
   GLEW.version[name] = allocate(intArrayFromString(string), "i8", ALLOC_NORMAL);
  }
  return GLEW.version[name];
 },
 extensionIsSupported: function(name) {
  if (!GLEW.extensions) {
   GLEW.extensions = UTF8ToString(_glGetString(7939)).split(" ");
  }
  if (GLEW.extensions.indexOf(name) != -1) return 1;
  return GLEW.extensions.indexOf("GL_" + name) != -1;
 }
};

Module["GLEW"] = GLEW;

function _glewInit() {
 return 0;
}

Module["_glewInit"] = _glewInit;

function _glewIsSupported(name) {
 var exts = UTF8ToString(name).split(" ");
 for (var i in exts) {
  if (!GLEW.extensionIsSupported(exts[i])) return 0;
 }
 return 1;
}

Module["_glewIsSupported"] = _glewIsSupported;

function _glewGetExtension(name) {
 return GLEW.extensionIsSupported(UTF8ToString(name));
}

Module["_glewGetExtension"] = _glewGetExtension;

function _glewGetErrorString(error) {
 return GLEW.errorString(error);
}

Module["_glewGetErrorString"] = _glewGetErrorString;

function _glewGetString(name) {
 return GLEW.versionString(name);
}

Module["_glewGetString"] = _glewGetString;

var IDBStore = {
 indexedDB: function() {
  if (typeof indexedDB !== "undefined") return indexedDB;
  var ret = null;
  if (typeof window === "object") ret = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  assert(ret, "IDBStore used, but indexedDB not supported");
  return ret;
 },
 DB_VERSION: 22,
 DB_STORE_NAME: "FILE_DATA",
 dbs: {},
 blobs: [ 0 ],
 getDB: function(name, callback) {
  var db = IDBStore.dbs[name];
  if (db) {
   return callback(null, db);
  }
  var req;
  try {
   req = IDBStore.indexedDB().open(name, IDBStore.DB_VERSION);
  } catch (e) {
   return callback(e);
  }
  req.onupgradeneeded = function(e) {
   var db = e.target.result;
   var transaction = e.target.transaction;
   var fileStore;
   if (db.objectStoreNames.contains(IDBStore.DB_STORE_NAME)) {
    fileStore = transaction.objectStore(IDBStore.DB_STORE_NAME);
   } else {
    fileStore = db.createObjectStore(IDBStore.DB_STORE_NAME);
   }
  };
  req.onsuccess = function() {
   db = req.result;
   IDBStore.dbs[name] = db;
   callback(null, db);
  };
  req.onerror = function(e) {
   callback(this.error);
   e.preventDefault();
  };
 },
 getStore: function(dbName, type, callback) {
  IDBStore.getDB(dbName, function(error, db) {
   if (error) return callback(error);
   var transaction = db.transaction([ IDBStore.DB_STORE_NAME ], type);
   transaction.onerror = function(e) {
    callback(this.error || "unknown error");
    e.preventDefault();
   };
   var store = transaction.objectStore(IDBStore.DB_STORE_NAME);
   callback(null, store);
  });
 },
 getFile: function(dbName, id, callback) {
  IDBStore.getStore(dbName, "readonly", function(err, store) {
   if (err) return callback(err);
   var req = store.get(id);
   req.onsuccess = function(event) {
    var result = event.target.result;
    if (!result) {
     return callback("file " + id + " not found");
    } else {
     return callback(null, result);
    }
   };
   req.onerror = function(error) {
    callback(error);
   };
  });
 },
 setFile: function(dbName, id, data, callback) {
  IDBStore.getStore(dbName, "readwrite", function(err, store) {
   if (err) return callback(err);
   var req = store.put(data, id);
   req.onsuccess = function(event) {
    callback();
   };
   req.onerror = function(error) {
    callback(error);
   };
  });
 },
 deleteFile: function(dbName, id, callback) {
  IDBStore.getStore(dbName, "readwrite", function(err, store) {
   if (err) return callback(err);
   var req = store.delete(id);
   req.onsuccess = function(event) {
    callback();
   };
   req.onerror = function(error) {
    callback(error);
   };
  });
 },
 existsFile: function(dbName, id, callback) {
  IDBStore.getStore(dbName, "readonly", function(err, store) {
   if (err) return callback(err);
   var req = store.count(id);
   req.onsuccess = function(event) {
    callback(null, event.target.result > 0);
   };
   req.onerror = function(error) {
    callback(error);
   };
  });
 }
};

Module["IDBStore"] = IDBStore;

function _emscripten_idb_async_load(db, id, arg, onload, onerror) {
 IDBStore.getFile(UTF8ToString(db), UTF8ToString(id), function(error, byteArray) {
  if (error) {
   if (onerror) dynCall_vi(onerror, arg);
   return;
  }
  var buffer = _malloc(byteArray.length);
  HEAPU8.set(byteArray, buffer);
  dynCall_viii(onload, arg, buffer, byteArray.length);
  _free(buffer);
 });
}

Module["_emscripten_idb_async_load"] = _emscripten_idb_async_load;

function _emscripten_idb_async_store(db, id, ptr, num, arg, onstore, onerror) {
 IDBStore.setFile(UTF8ToString(db), UTF8ToString(id), new Uint8Array(HEAPU8.subarray(ptr, ptr + num)), function(error) {
  if (error) {
   if (onerror) dynCall_vi(onerror, arg);
   return;
  }
  if (onstore) dynCall_vi(onstore, arg);
 });
}

Module["_emscripten_idb_async_store"] = _emscripten_idb_async_store;

function _emscripten_idb_async_delete(db, id, arg, ondelete, onerror) {
 IDBStore.deleteFile(UTF8ToString(db), UTF8ToString(id), function(error) {
  if (error) {
   if (onerror) dynCall_vi(onerror, arg);
   return;
  }
  if (ondelete) dynCall_vi(ondelete, arg);
 });
}

Module["_emscripten_idb_async_delete"] = _emscripten_idb_async_delete;

function _emscripten_idb_async_exists(db, id, arg, oncheck, onerror) {
 IDBStore.existsFile(UTF8ToString(db), UTF8ToString(id), function(error, exists) {
  if (error) {
   if (onerror) dynCall_vi(onerror, arg);
   return;
  }
  if (oncheck) dynCall_vii(oncheck, arg, exists);
 });
}

Module["_emscripten_idb_async_exists"] = _emscripten_idb_async_exists;

function _emscripten_idb_load() {
 throw "Please compile your program with async support in order to use synchronous operations like emscripten_idb_load, etc.";
}

Module["_emscripten_idb_load"] = _emscripten_idb_load;

function _emscripten_idb_store() {
 throw "Please compile your program with async support in order to use synchronous operations like emscripten_idb_store, etc.";
}

Module["_emscripten_idb_store"] = _emscripten_idb_store;

function _emscripten_idb_delete() {
 throw "Please compile your program with async support in order to use synchronous operations like emscripten_idb_delete, etc.";
}

Module["_emscripten_idb_delete"] = _emscripten_idb_delete;

function _emscripten_idb_exists() {
 throw "Please compile your program with async support in order to use synchronous operations like emscripten_idb_exists, etc.";
}

Module["_emscripten_idb_exists"] = _emscripten_idb_exists;

function runAndAbortIfError(func) {
 try {
  return func();
 } catch (e) {
  abort(e);
 }
}

Module["runAndAbortIfError"] = runAndAbortIfError;

function _emscripten_sleep() {
 throw "Please compile your program with async support in order to use asynchronous operations like emscripten_sleep";
}

Module["_emscripten_sleep"] = _emscripten_sleep;

function _emscripten_coroutine_create() {
 throw "Please compile your program with async support in order to use asynchronous operations like emscripten_coroutine_create";
}

Module["_emscripten_coroutine_create"] = _emscripten_coroutine_create;

function _emscripten_coroutine_next() {
 throw "Please compile your program with async support in order to use asynchronous operations like emscripten_coroutine_next";
}

Module["_emscripten_coroutine_next"] = _emscripten_coroutine_next;

function _emscripten_yield() {
 throw "Please compile your program with async support in order to use asynchronous operations like emscripten_yield";
}

Module["_emscripten_yield"] = _emscripten_yield;

function _emscripten_wget(url, file) {
 throw "Please compile your program with async support in order to use asynchronous operations like emscripten_wget";
}

Module["_emscripten_wget"] = _emscripten_wget;

function _emscripten_wget_data(url, file) {
 throw "Please compile your program with async support in order to use asynchronous operations like emscripten_wget_data";
}

Module["_emscripten_wget_data"] = _emscripten_wget_data;

function _emscripten_scan_registers(url, file) {
 throw "Please compile your program with async support in order to use asynchronous operations like emscripten_scan_registers";
}

Module["_emscripten_scan_registers"] = _emscripten_scan_registers;

function _emscripten_fiber_init() {
 throw "Please compile your program with async support in order to use asynchronous operations like emscripten_fiber_init";
}

Module["_emscripten_fiber_init"] = _emscripten_fiber_init;

function _emscripten_fiber_init_from_current_context() {
 throw "Please compile your program with async support in order to use asynchronous operations like emscripten_fiber_init_from_current_context";
}

Module["_emscripten_fiber_init_from_current_context"] = _emscripten_fiber_init_from_current_context;

function _emscripten_fiber_swap() {
 throw "Please compile your program with async support in order to use asynchronous operations like emscripten_fiber_swap";
}

Module["_emscripten_fiber_swap"] = _emscripten_fiber_swap;

function _emscripten_is_main_browser_thread() {
 return !ENVIRONMENT_IS_WORKER;
}

Module["_emscripten_is_main_browser_thread"] = _emscripten_is_main_browser_thread;

function _pthread_mutexattr_init() {}

Module["_pthread_mutexattr_init"] = _pthread_mutexattr_init;

function _pthread_mutexattr_setschedparam() {}

Module["_pthread_mutexattr_setschedparam"] = _pthread_mutexattr_setschedparam;

function _pthread_mutexattr_setprotocol() {}

Module["_pthread_mutexattr_setprotocol"] = _pthread_mutexattr_setprotocol;

function _pthread_mutexattr_settype() {}

Module["_pthread_mutexattr_settype"] = _pthread_mutexattr_settype;

function _pthread_mutexattr_destroy() {}

Module["_pthread_mutexattr_destroy"] = _pthread_mutexattr_destroy;

function _pthread_mutexattr_setpshared(attr, pshared) {
 return 0;
}

Module["_pthread_mutexattr_setpshared"] = _pthread_mutexattr_setpshared;

function _pthread_cond_init() {
 return 0;
}

Module["_pthread_cond_init"] = _pthread_cond_init;

function _pthread_cond_destroy() {
 return 0;
}

Module["_pthread_cond_destroy"] = _pthread_cond_destroy;

function _pthread_cond_wait() {
 return 0;
}

Module["_pthread_cond_wait"] = _pthread_cond_wait;

function _pthread_cond_timedwait() {
 return 0;
}

Module["_pthread_cond_timedwait"] = _pthread_cond_timedwait;

function _pthread_cond_signal() {
 return 0;
}

Module["_pthread_cond_signal"] = _pthread_cond_signal;

function _pthread_condattr_init() {
 return 0;
}

Module["_pthread_condattr_init"] = _pthread_condattr_init;

function _pthread_condattr_destroy() {
 return 0;
}

Module["_pthread_condattr_destroy"] = _pthread_condattr_destroy;

function _pthread_condattr_setclock() {
 return 0;
}

Module["_pthread_condattr_setclock"] = _pthread_condattr_setclock;

function _pthread_condattr_setpshared() {
 return 0;
}

Module["_pthread_condattr_setpshared"] = _pthread_condattr_setpshared;

function _pthread_condattr_getclock() {
 return 0;
}

Module["_pthread_condattr_getclock"] = _pthread_condattr_getclock;

function _pthread_condattr_getpshared() {
 return 0;
}

Module["_pthread_condattr_getpshared"] = _pthread_condattr_getpshared;

function _pthread_cond_broadcast(x) {
 x = x | 0;
 return 0;
}

Module["_pthread_cond_broadcast"] = _pthread_cond_broadcast;

function _pthread_attr_init(attr) {
 return 0;
}

Module["_pthread_attr_init"] = _pthread_attr_init;

function _pthread_getattr_np(thread, attr) {
 return 0;
}

Module["_pthread_getattr_np"] = _pthread_getattr_np;

function _pthread_attr_destroy(attr) {
 return 0;
}

Module["_pthread_attr_destroy"] = _pthread_attr_destroy;

function _pthread_attr_getstack(attr, stackaddr, stacksize) {
 HEAP32[stackaddr >> 2] = STACK_BASE;
 HEAP32[stacksize >> 2] = TOTAL_STACK;
 return 0;
}

Module["_pthread_attr_getstack"] = _pthread_attr_getstack;

function _pthread_attr_getdetachstate(attr, detachstate) {
 return 0;
}

Module["_pthread_attr_getdetachstate"] = _pthread_attr_getdetachstate;

function _pthread_setcancelstate() {
 return 0;
}

Module["_pthread_setcancelstate"] = _pthread_setcancelstate;

function _pthread_setcanceltype() {
 return 0;
}

Module["_pthread_setcanceltype"] = _pthread_setcanceltype;

function _pthread_cleanup_push(routine, arg) {
 __ATEXIT__.push(function() {
  dynCall_vi(routine, arg);
 });
 _pthread_cleanup_push.level = __ATEXIT__.length;
}

Module["_pthread_cleanup_push"] = _pthread_cleanup_push;

function _pthread_cleanup_pop() {
 assert(_pthread_cleanup_push.level == __ATEXIT__.length, "cannot pop if something else added meanwhile!");
 __ATEXIT__.pop();
 _pthread_cleanup_push.level = __ATEXIT__.length;
}

Module["_pthread_cleanup_pop"] = _pthread_cleanup_pop;

function __pthread_cleanup_push(a0, a1) {
 return _pthread_cleanup_push(a0, a1);
}

Module["__pthread_cleanup_push"] = __pthread_cleanup_push;

function __pthread_cleanup_pop() {
 _pthread_cleanup_pop();
}

Module["__pthread_cleanup_pop"] = __pthread_cleanup_pop;

function _pthread_sigmask(how, set, oldset) {
 err("pthread_sigmask() is not supported: this is a no-op.");
 return 0;
}

Module["_pthread_sigmask"] = _pthread_sigmask;

function _pthread_atfork(prepare, parent, child) {
 err("fork() is not supported: pthread_atfork is a no-op.");
 return 0;
}

Module["_pthread_atfork"] = _pthread_atfork;

function _pthread_rwlock_init() {
 return 0;
}

Module["_pthread_rwlock_init"] = _pthread_rwlock_init;

function _pthread_rwlock_destroy() {
 return 0;
}

Module["_pthread_rwlock_destroy"] = _pthread_rwlock_destroy;

function _pthread_rwlock_rdlock() {
 return 0;
}

Module["_pthread_rwlock_rdlock"] = _pthread_rwlock_rdlock;

function _pthread_rwlock_tryrdlock() {
 return 0;
}

Module["_pthread_rwlock_tryrdlock"] = _pthread_rwlock_tryrdlock;

function _pthread_rwlock_timedrdlock() {
 return 0;
}

Module["_pthread_rwlock_timedrdlock"] = _pthread_rwlock_timedrdlock;

function _pthread_rwlock_wrlock() {
 return 0;
}

Module["_pthread_rwlock_wrlock"] = _pthread_rwlock_wrlock;

function _pthread_rwlock_trywrlock() {
 return 0;
}

Module["_pthread_rwlock_trywrlock"] = _pthread_rwlock_trywrlock;

function _pthread_rwlock_timedwrlock() {
 return 0;
}

Module["_pthread_rwlock_timedwrlock"] = _pthread_rwlock_timedwrlock;

function _pthread_rwlock_unlock() {
 return 0;
}

Module["_pthread_rwlock_unlock"] = _pthread_rwlock_unlock;

function _pthread_rwlockattr_init() {
 return 0;
}

Module["_pthread_rwlockattr_init"] = _pthread_rwlockattr_init;

function _pthread_rwlockattr_destroy() {
 return 0;
}

Module["_pthread_rwlockattr_destroy"] = _pthread_rwlockattr_destroy;

function _pthread_rwlockattr_setpshared() {
 return 0;
}

Module["_pthread_rwlockattr_setpshared"] = _pthread_rwlockattr_setpshared;

function _pthread_rwlockattr_getpshared() {
 return 0;
}

Module["_pthread_rwlockattr_getpshared"] = _pthread_rwlockattr_getpshared;

function _pthread_spin_init() {
 return 0;
}

Module["_pthread_spin_init"] = _pthread_spin_init;

function _pthread_spin_destroy() {
 return 0;
}

Module["_pthread_spin_destroy"] = _pthread_spin_destroy;

function _pthread_spin_lock() {
 return 0;
}

Module["_pthread_spin_lock"] = _pthread_spin_lock;

function _pthread_spin_trylock() {
 return 0;
}

Module["_pthread_spin_trylock"] = _pthread_spin_trylock;

function _pthread_spin_unlock() {
 return 0;
}

Module["_pthread_spin_unlock"] = _pthread_spin_unlock;

function _pthread_attr_setdetachstate() {}

Module["_pthread_attr_setdetachstate"] = _pthread_attr_setdetachstate;

function _pthread_attr_setschedparam() {}

Module["_pthread_attr_setschedparam"] = _pthread_attr_setschedparam;

function _pthread_attr_setstacksize() {}

Module["_pthread_attr_setstacksize"] = _pthread_attr_setstacksize;

function _pthread_create() {
 return 6;
}

Module["_pthread_create"] = _pthread_create;

function _pthread_cancel() {}

Module["_pthread_cancel"] = _pthread_cancel;

function _pthread_exit(status) {
 _exit(status);
}

Module["_pthread_exit"] = _pthread_exit;

function _pthread_equal(x, y) {
 return x == y;
}

Module["_pthread_equal"] = _pthread_equal;

function _pthread_join() {}

Module["_pthread_join"] = _pthread_join;

function _pthread_detach() {}

Module["_pthread_detach"] = _pthread_detach;

function _sem_init() {}

Module["_sem_init"] = _sem_init;

function _sem_post() {}

Module["_sem_post"] = _sem_post;

function _sem_wait() {}

Module["_sem_wait"] = _sem_wait;

function _sem_trywait() {}

Module["_sem_trywait"] = _sem_trywait;

function _sem_destroy() {}

Module["_sem_destroy"] = _sem_destroy;

function _pthread_self() {
 if (!Module["_pthread_self"]) abort("external function 'pthread_self' is missing. perhaps a side module was not linked in? if this function was expected to arrive from a system library, try to build the MAIN_MODULE with EMCC_FORCE_STDLIBS=1 in the environment");
 return Module["_pthread_self"].apply(null, arguments);
}

function _emscripten_main_browser_thread_id() {
 return _pthread_self();
}

Module["_emscripten_main_browser_thread_id"] = _emscripten_main_browser_thread_id;

function _usleep(useconds) {
 var msec = useconds / 1e3;
 if ((ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && self["performance"] && self["performance"]["now"]) {
  var start = self["performance"]["now"]();
  while (self["performance"]["now"]() - start < msec) {}
 } else {
  var start = Date.now();
  while (Date.now() - start < msec) {}
 }
 return 0;
}

Module["_usleep"] = _usleep;

function _nanosleep(rqtp, rmtp) {
 if (rqtp === 0) {
  ___setErrNo(28);
  return -1;
 }
 var seconds = HEAP32[rqtp >> 2];
 var nanoseconds = HEAP32[rqtp + 4 >> 2];
 if (nanoseconds < 0 || nanoseconds > 999999999 || seconds < 0) {
  ___setErrNo(28);
  return -1;
 }
 if (rmtp !== 0) {
  HEAP32[rmtp >> 2] = 0;
  HEAP32[rmtp + 4 >> 2] = 0;
 }
 return _usleep(seconds * 1e6 + nanoseconds / 1e3);
}

Module["_nanosleep"] = _nanosleep;

function _llvm_memory_barrier() {}

Module["_llvm_memory_barrier"] = _llvm_memory_barrier;

function _llvm_atomic_load_add_i32_p0i32(ptr, delta) {
 var ret = HEAP32[ptr >> 2];
 HEAP32[ptr >> 2] = ret + delta;
 return ret;
}

Module["_llvm_atomic_load_add_i32_p0i32"] = _llvm_atomic_load_add_i32_p0i32;

function ___atomic_is_lock_free(size, ptr) {
 return size <= 4 && (size & size - 1) == 0 && (ptr & size - 1) == 0;
}

Module["___atomic_is_lock_free"] = ___atomic_is_lock_free;

function ___atomic_load_8(ptr, memmodel) {
 return (setTempRet0(HEAP32[ptr + 4 >> 2]), HEAP32[ptr >> 2]) | 0;
}

Module["___atomic_load_8"] = ___atomic_load_8;

function ___atomic_store_8(ptr, vall, valh, memmodel) {
 HEAP32[ptr >> 2] = vall;
 HEAP32[ptr + 4 >> 2] = valh;
}

Module["___atomic_store_8"] = ___atomic_store_8;

function ___atomic_exchange_8(ptr, vall, valh, memmodel) {
 var l = HEAP32[ptr >> 2];
 var h = HEAP32[ptr + 4 >> 2];
 HEAP32[ptr >> 2] = vall;
 HEAP32[ptr + 4 >> 2] = valh;
 return (setTempRet0(h), l) | 0;
}

Module["___atomic_exchange_8"] = ___atomic_exchange_8;

function ___atomic_compare_exchange_8(ptr, expected, desiredl, desiredh, weak, success_memmodel, failure_memmodel) {
 var pl = HEAP32[ptr >> 2];
 var ph = HEAP32[ptr + 4 >> 2];
 var el = HEAP32[expected >> 2];
 var eh = HEAP32[expected + 4 >> 2];
 if (pl === el && ph === eh) {
  HEAP32[ptr >> 2] = desiredl;
  HEAP32[ptr + 4 >> 2] = desiredh;
  return 1;
 } else {
  HEAP32[expected >> 2] = pl;
  HEAP32[expected + 4 >> 2] = ph;
  return 0;
 }
}

Module["___atomic_compare_exchange_8"] = ___atomic_compare_exchange_8;

function ___atomic_fetch_add_8(ptr, vall, valh, memmodel) {
 var l = HEAP32[ptr >> 2];
 var h = HEAP32[ptr + 4 >> 2];
 HEAP32[ptr >> 2] = _i64Add(l, h, vall, valh);
 HEAP32[ptr + 4 >> 2] = getTempRet0();
 return (setTempRet0(h), l) | 0;
}

Module["___atomic_fetch_add_8"] = ___atomic_fetch_add_8;

function ___atomic_fetch_sub_8(ptr, vall, valh, memmodel) {
 var l = HEAP32[ptr >> 2];
 var h = HEAP32[ptr + 4 >> 2];
 HEAP32[ptr >> 2] = _i64Subtract(l, h, vall, valh);
 HEAP32[ptr + 4 >> 2] = getTempRet0();
 return (setTempRet0(h), l) | 0;
}

Module["___atomic_fetch_sub_8"] = ___atomic_fetch_sub_8;

function ___atomic_fetch_and_8(ptr, vall, valh, memmodel) {
 var l = HEAP32[ptr >> 2];
 var h = HEAP32[ptr + 4 >> 2];
 HEAP32[ptr >> 2] = l & vall;
 HEAP32[ptr + 4 >> 2] = h & valh;
 return (setTempRet0(h), l) | 0;
}

Module["___atomic_fetch_and_8"] = ___atomic_fetch_and_8;

function ___atomic_fetch_or_8(ptr, vall, valh, memmodel) {
 var l = HEAP32[ptr >> 2];
 var h = HEAP32[ptr + 4 >> 2];
 HEAP32[ptr >> 2] = l | vall;
 HEAP32[ptr + 4 >> 2] = h | valh;
 return (setTempRet0(h), l) | 0;
}

Module["___atomic_fetch_or_8"] = ___atomic_fetch_or_8;

function ___atomic_fetch_xor_8(ptr, vall, valh, memmodel) {
 var l = HEAP32[ptr >> 2];
 var h = HEAP32[ptr + 4 >> 2];
 HEAP32[ptr >> 2] = l ^ vall;
 HEAP32[ptr + 4 >> 2] = h ^ valh;
 return (setTempRet0(h), l) | 0;
}

Module["___atomic_fetch_xor_8"] = ___atomic_fetch_xor_8;

function _emscripten_atomic_add_u32(a0, a1) {
 return _llvm_atomic_load_add_i32_p0i32(a0, a1);
}

Module["_emscripten_atomic_add_u32"] = _emscripten_atomic_add_u32;

function _emscripten_atomic_load_u64(a0, a1) {
 return ___atomic_load_8(a0, a1);
}

Module["_emscripten_atomic_load_u64"] = _emscripten_atomic_load_u64;

function _emscripten_atomic_store_u64(a0, a1, a2, a3) {
 return ___atomic_store_8(a0, a1, a2, a3);
}

Module["_emscripten_atomic_store_u64"] = _emscripten_atomic_store_u64;

function _emscripten_atomic_cas_u64(a0, a1, a2, a3, a4, a5, a6) {
 return ___atomic_compare_exchange_8(a0, a1, a2, a3, a4, a5, a6);
}

Module["_emscripten_atomic_cas_u64"] = _emscripten_atomic_cas_u64;

function _emscripten_atomic_exchange_u64(a0, a1, a2, a3) {
 return ___atomic_exchange_8(a0, a1, a2, a3);
}

Module["_emscripten_atomic_exchange_u64"] = _emscripten_atomic_exchange_u64;

function __emscripten_atomic_fetch_and_add_u64(a0, a1, a2, a3) {
 return ___atomic_fetch_add_8(a0, a1, a2, a3);
}

Module["__emscripten_atomic_fetch_and_add_u64"] = __emscripten_atomic_fetch_and_add_u64;

function __emscripten_atomic_fetch_and_sub_u64(a0, a1, a2, a3) {
 return ___atomic_fetch_sub_8(a0, a1, a2, a3);
}

Module["__emscripten_atomic_fetch_and_sub_u64"] = __emscripten_atomic_fetch_and_sub_u64;

function __emscripten_atomic_fetch_and_and_u64(a0, a1, a2, a3) {
 return ___atomic_fetch_and_8(a0, a1, a2, a3);
}

Module["__emscripten_atomic_fetch_and_and_u64"] = __emscripten_atomic_fetch_and_and_u64;

function __emscripten_atomic_fetch_and_or_u64(a0, a1, a2, a3) {
 return ___atomic_fetch_or_8(a0, a1, a2, a3);
}

Module["__emscripten_atomic_fetch_and_or_u64"] = __emscripten_atomic_fetch_and_or_u64;

function __emscripten_atomic_fetch_and_xor_u64(a0, a1, a2, a3) {
 return ___atomic_fetch_xor_8(a0, a1, a2, a3);
}

Module["__emscripten_atomic_fetch_and_xor_u64"] = __emscripten_atomic_fetch_and_xor_u64;

function ___wait() {}

Module["___wait"] = ___wait;

Module["requestFullscreen"] = function Module_requestFullscreen(lockPointer, resizeCanvas, vrDevice) {
 Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice);
};

Module["requestFullScreen"] = function Module_requestFullScreen() {
 Browser.requestFullScreen();
};

Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) {
 Browser.requestAnimationFrame(func);
};

Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) {
 Browser.setCanvasSize(width, height, noUpdates);
};

Module["pauseMainLoop"] = function Module_pauseMainLoop() {
 Browser.mainLoop.pause();
};

Module["resumeMainLoop"] = function Module_resumeMainLoop() {
 Browser.mainLoop.resume();
};

Module["getUserMedia"] = function Module_getUserMedia() {
 Browser.getUserMedia();
};

Module["createContext"] = function Module_createContext(canvas, useWebGL, setInModule, webGLContextAttributes) {
 return Browser.createContext(canvas, useWebGL, setInModule, webGLContextAttributes);
};

if (ENVIRONMENT_IS_NODE) {
 _emscripten_get_now = function _emscripten_get_now_actual() {
  var t = process["hrtime"]();
  return t[0] * 1e3 + t[1] / 1e6;
 };
} else if (typeof dateNow !== "undefined") {
 _emscripten_get_now = dateNow;
} else _emscripten_get_now = function() {
 return performance["now"]();
};

FS.staticInit();

if (ENVIRONMENT_HAS_NODE) {
 var fs = require("fs");
 var NODEJS_PATH = require("path");
 NODEFS.staticInit();
}

var GLctx;

GL.init();

var __setImmediate_id_counter = 0;

var __setImmediate_queue = [];

var __setImmediate_message_id = "_si";

function __setImmediate_cb(e) {
 if (e.data === __setImmediate_message_id) {
  e.stopPropagation();
  __setImmediate_queue.shift()();
  ++__setImmediate_id_counter;
 }
}

if (typeof setImmediate === "undefined" && typeof addEventListener === "function") {
 addEventListener("message", __setImmediate_cb, true);
 setImmediate = function(func) {
  postMessage(__setImmediate_message_id, "*");
  return __setImmediate_id_counter + __setImmediate_queue.push(func) - 1;
 };
 clearImmediate = function(id) {
  var index = id - __setImmediate_id_counter;
  if (index >= 0 && index < __setImmediate_queue.length) __setImmediate_queue[index] = function() {};
 };
}

for (var i = 0; i < 32; i++) __tempFixedLengthArray.push(new Array(i));

var ASSERTIONS = true;

function intArrayFromString(stringy, dontAddNull, length) {
 var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
 var u8array = new Array(len);
 var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
 if (dontAddNull) u8array.length = numBytesWritten;
 return u8array;
}

function intArrayToString(array) {
 var ret = [];
 for (var i = 0; i < array.length; i++) {
  var chr = array[i];
  if (chr > 255) {
   if (ASSERTIONS) {
    assert(false, "Character code " + chr + " (" + String.fromCharCode(chr) + ")  at offset " + i + " not in 0x00-0xFF.");
   }
   chr &= 255;
  }
  ret.push(String.fromCharCode(chr));
 }
 return ret.join("");
}

var gb = GLOBAL_BASE;

var asmLibraryArg = {
 "_Z5sideyx": __Z5sideyx,
 "_Z6sidey2x": __Z6sidey2x,
 "__handle_stack_overflow": ___handle_stack_overflow,
 "__lock": ___lock,
 "__memory_base": 1024,
 "__stack_pointer": STACK_BASE,
 "__table_base": 1,
 "__unlock": ___unlock,
 "abort": _abort,
 "clock_gettime": _clock_gettime,
 "emscripten_asm_const_iii": _emscripten_asm_const_iii,
 "emscripten_memcpy_big": _emscripten_memcpy_big,
 "emscripten_resize_heap": _emscripten_resize_heap,
 "environ_get": _environ_get,
 "environ_sizes_get": _environ_sizes_get,
 "fd_write": _fd_write,
 "fp$_Z10directCallx$jj": _fp$_Z10directCallx$jj,
 "fp$_Z5sideyx$jj": _fp$_Z5sideyx$jj,
 "fp$__stdio_write$iiii": _fp$__stdio_write$iiii,
 "g$_ZN20__em_asm_sig_builderI19__em_asm_type_tupleIJEEE6bufferE": _g$_ZN20__em_asm_sig_builderI19__em_asm_type_tupleIJEEE6bufferE,
 "g$__THREW__": _g$__THREW__,
 "g$__environ": _g$__environ,
 "g$__stdout_used": _g$__stdout_used,
 "g$__threwValue": _g$__threwValue,
 "g$stdout": _g$stdout,
 "getTempRet0": _getTempRet0,
 "memory": wasmMemory,
 "setTempRet0": _setTempRet0,
 "table": wasmTable
};

var asm = createWasm();

Module["asm"] = asm;

var ___wasm_call_ctors = Module["___wasm_call_ctors"] = function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return Module["asm"]["__wasm_call_ctors"].apply(null, arguments);
};

var __Z5mainyx = Module["__Z5mainyx"] = function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return Module["asm"]["_Z5mainyx"].apply(null, arguments);
};

var __Z10directCallx = Module["__Z10directCallx"] = function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return Module["asm"]["_Z10directCallx"].apply(null, arguments);
};

var __Z9dummyCallx = Module["__Z9dummyCallx"] = function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return Module["asm"]["_Z9dummyCallx"].apply(null, arguments);
};

var _main = Module["_main"] = function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return Module["asm"]["main"].apply(null, arguments);
};

var ___errno_location = Module["___errno_location"] = function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return Module["asm"]["__errno_location"].apply(null, arguments);
};

var _srand = Module["_srand"] = function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return Module["asm"]["srand"].apply(null, arguments);
};

var _rand = Module["_rand"] = function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return Module["asm"]["rand"].apply(null, arguments);
};

var _fflush = Module["_fflush"] = function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return Module["asm"]["fflush"].apply(null, arguments);
};

var _iprintf = Module["_iprintf"] = function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return Module["asm"]["iprintf"].apply(null, arguments);
};

var ___stdio_write = Module["___stdio_write"] = function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return Module["asm"]["__stdio_write"].apply(null, arguments);
};

var _setThrew = Module["_setThrew"] = function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return Module["asm"]["setThrew"].apply(null, arguments);
};

var __ZNSt3__26chrono12steady_clock3nowEv = Module["__ZNSt3__26chrono12steady_clock3nowEv"] = function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return Module["asm"]["_ZNSt3__26chrono12steady_clock3nowEv"].apply(null, arguments);
};

var _malloc = Module["_malloc"] = function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return Module["asm"]["malloc"].apply(null, arguments);
};

var _free = Module["_free"] = function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return Module["asm"]["free"].apply(null, arguments);
};

var ___set_stack_limit = Module["___set_stack_limit"] = function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return Module["asm"]["__set_stack_limit"].apply(null, arguments);
};

var stackSave = Module["stackSave"] = function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return Module["asm"]["stackSave"].apply(null, arguments);
};

var stackAlloc = Module["stackAlloc"] = function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return Module["asm"]["stackAlloc"].apply(null, arguments);
};

var stackRestore = Module["stackRestore"] = function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return Module["asm"]["stackRestore"].apply(null, arguments);
};

var __growWasmMemory = Module["__growWasmMemory"] = function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return Module["asm"]["__growWasmMemory"].apply(null, arguments);
};

var ___assign_got_enties = Module["___assign_got_enties"] = function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return Module["asm"]["__assign_got_enties"].apply(null, arguments);
};

var dynCall_ii = Module["dynCall_ii"] = function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return Module["asm"]["dynCall_ii"].apply(null, arguments);
};

var dynCall_jiji = Module["dynCall_jiji"] = function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return Module["asm"]["dynCall_jiji"].apply(null, arguments);
};

var _orig$_Z5mainyx = Module["_orig$_Z5mainyx"] = function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return Module["asm"]["orig$_Z5mainyx"].apply(null, arguments);
};

var _orig$_Z10directCallx = Module["_orig$_Z10directCallx"] = function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return Module["asm"]["orig$_Z10directCallx"].apply(null, arguments);
};

var _orig$_Z9dummyCallx = Module["_orig$_Z9dummyCallx"] = function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return Module["asm"]["orig$_Z9dummyCallx"].apply(null, arguments);
};

var _orig$_ZNSt3__26chrono12steady_clock3nowEv = Module["_orig$_ZNSt3__26chrono12steady_clock3nowEv"] = function() {
 assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
 assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
 return Module["asm"]["orig$_ZNSt3__26chrono12steady_clock3nowEv"].apply(null, arguments);
};

var NAMED_GLOBALS = {
 "_ZN20__em_asm_sig_builderI19__em_asm_type_tupleIJEEE6bufferE": 25,
 "__stdout_used": 188,
 "stdout": 184,
 "__environ": 2544,
 "__THREW__": 2600,
 "__threwValue": 2604,
 "__data_end": 2608
};

for (var named in NAMED_GLOBALS) {
 Module["_" + named] = gb + NAMED_GLOBALS[named];
}

Module["NAMED_GLOBALS"] = NAMED_GLOBALS;

for (var named in NAMED_GLOBALS) {
 (function(named) {
  var addr = Module["_" + named];
  Module["g$_" + named] = function() {
   return addr;
  };
 })(named);
}

Module["_fp$_Z10directCallx$jj"] = function() {
 assert(Module["__Z10directCallx"] || typeof __Z10directCallx !== "undefined", "external function `_Z10directCallx` is missing.perhaps a side module was not linked in? if this symbol was expected to arrive from a system library, try to build the MAIN_MODULE with EMCC_FORCE_STDLIBS=XX in the environment");
 var func = Module["asm"]["orig$_Z10directCallx"];
 if (!func) func = Module["_orig$_Z10directCallx"];
 if (!func) func = Module["__Z10directCallx"];
 if (!func) func = __Z10directCallx;
 var fp = addFunction(func, "jj");
 Module["_fp$_Z10directCallx$jj"] = function() {
  return fp;
 };
 return fp;
};

Module["_fp$_Z5sideyx$jj"] = function() {
 assert(Module["__Z5sideyx"] || typeof __Z5sideyx !== "undefined", "external function `_Z5sideyx` is missing.perhaps a side module was not linked in? if this symbol was expected to arrive from a system library, try to build the MAIN_MODULE with EMCC_FORCE_STDLIBS=XX in the environment");
 var func = Module["asm"]["orig$_Z5sideyx"];
 if (!func) func = Module["_orig$_Z5sideyx"];
 if (!func) func = Module["__Z5sideyx"];
 if (!func) func = __Z5sideyx;
 var fp = addFunction(func, "jj");
 Module["_fp$_Z5sideyx$jj"] = function() {
  return fp;
 };
 return fp;
};

Module["_fp$__stdio_write$iiii"] = function() {
 assert(Module["___stdio_write"] || typeof ___stdio_write !== "undefined", "external function `__stdio_write` is missing.perhaps a side module was not linked in? if this symbol was expected to arrive from a system library, try to build the MAIN_MODULE with EMCC_FORCE_STDLIBS=XX in the environment");
 var func = Module["asm"]["__stdio_write"];
 if (!func) func = Module["___stdio_write"];
 if (!func) func = Module["___stdio_write"];
 if (!func) func = ___stdio_write;
 var fp = addFunction(func, "iiii");
 Module["_fp$__stdio_write$iiii"] = function() {
  return fp;
 };
 return fp;
};

function invoke_X() {
 var sp = stackSave();
 try {
  var args = Array.prototype.slice.call(arguments);
  return wasmTable.get(args[0]).apply(null, args.slice(1));
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0 && e !== "longjmp") throw e;
  _setThrew(1, 0);
 }
}

if (ENVIRONMENT_IS_WORKER) {
 function WebGLBuffer(id) {
  this.what = "buffer";
  this.id = id;
 }
 function WebGLProgram(id) {
  this.what = "program";
  this.id = id;
  this.shaders = [];
  this.attributes = {};
  this.attributeVec = [];
  this.nextAttributes = {};
  this.nextAttributeVec = [];
 }
 function WebGLFramebuffer(id) {
  this.what = "frameBuffer";
  this.id = id;
 }
 function WebGLRenderbuffer(id) {
  this.what = "renderBuffer";
  this.id = id;
 }
 function WebGLTexture(id) {
  this.what = "texture";
  this.id = id;
  this.binding = 0;
 }
 function WebGLWorker() {
  this.DEPTH_BUFFER_BIT = 256;
  this.STENCIL_BUFFER_BIT = 1024;
  this.COLOR_BUFFER_BIT = 16384;
  this.POINTS = 0;
  this.LINES = 1;
  this.LINE_LOOP = 2;
  this.LINE_STRIP = 3;
  this.TRIANGLES = 4;
  this.TRIANGLE_STRIP = 5;
  this.TRIANGLE_FAN = 6;
  this.ZERO = 0;
  this.ONE = 1;
  this.SRC_COLOR = 768;
  this.ONE_MINUS_SRC_COLOR = 769;
  this.SRC_ALPHA = 770;
  this.ONE_MINUS_SRC_ALPHA = 771;
  this.DST_ALPHA = 772;
  this.ONE_MINUS_DST_ALPHA = 773;
  this.DST_COLOR = 774;
  this.ONE_MINUS_DST_COLOR = 775;
  this.SRC_ALPHA_SATURATE = 776;
  this.FUNC_ADD = 32774;
  this.BLEND_EQUATION = 32777;
  this.BLEND_EQUATION_RGB = 32777;
  this.BLEND_EQUATION_ALPHA = 34877;
  this.FUNC_SUBTRACT = 32778;
  this.FUNC_REVERSE_SUBTRACT = 32779;
  this.BLEND_DST_RGB = 32968;
  this.BLEND_SRC_RGB = 32969;
  this.BLEND_DST_ALPHA = 32970;
  this.BLEND_SRC_ALPHA = 32971;
  this.CONSTANT_COLOR = 32769;
  this.ONE_MINUS_CONSTANT_COLOR = 32770;
  this.CONSTANT_ALPHA = 32771;
  this.ONE_MINUS_CONSTANT_ALPHA = 32772;
  this.BLEND_COLOR = 32773;
  this.ARRAY_BUFFER = 34962;
  this.ELEMENT_ARRAY_BUFFER = 34963;
  this.ARRAY_BUFFER_BINDING = 34964;
  this.ELEMENT_ARRAY_BUFFER_BINDING = 34965;
  this.STREAM_DRAW = 35040;
  this.STATIC_DRAW = 35044;
  this.DYNAMIC_DRAW = 35048;
  this.BUFFER_SIZE = 34660;
  this.BUFFER_USAGE = 34661;
  this.CURRENT_VERTEX_ATTRIB = 34342;
  this.FRONT = 1028;
  this.BACK = 1029;
  this.FRONT_AND_BACK = 1032;
  this.CULL_FACE = 2884;
  this.BLEND = 3042;
  this.DITHER = 3024;
  this.STENCIL_TEST = 2960;
  this.DEPTH_TEST = 2929;
  this.SCISSOR_TEST = 3089;
  this.POLYGON_OFFSET_FILL = 32823;
  this.SAMPLE_ALPHA_TO_COVERAGE = 32926;
  this.SAMPLE_COVERAGE = 32928;
  this.NO_ERROR = 0;
  this.INVALID_ENUM = 1280;
  this.INVALID_VALUE = 1281;
  this.INVALID_OPERATION = 1282;
  this.OUT_OF_MEMORY = 1285;
  this.CW = 2304;
  this.CCW = 2305;
  this.LINE_WIDTH = 2849;
  this.ALIASED_POINT_SIZE_RANGE = 33901;
  this.ALIASED_LINE_WIDTH_RANGE = 33902;
  this.CULL_FACE_MODE = 2885;
  this.FRONT_FACE = 2886;
  this.DEPTH_RANGE = 2928;
  this.DEPTH_WRITEMASK = 2930;
  this.DEPTH_CLEAR_VALUE = 2931;
  this.DEPTH_FUNC = 2932;
  this.STENCIL_CLEAR_VALUE = 2961;
  this.STENCIL_FUNC = 2962;
  this.STENCIL_FAIL = 2964;
  this.STENCIL_PASS_DEPTH_FAIL = 2965;
  this.STENCIL_PASS_DEPTH_PASS = 2966;
  this.STENCIL_REF = 2967;
  this.STENCIL_VALUE_MASK = 2963;
  this.STENCIL_WRITEMASK = 2968;
  this.STENCIL_BACK_FUNC = 34816;
  this.STENCIL_BACK_FAIL = 34817;
  this.STENCIL_BACK_PASS_DEPTH_FAIL = 34818;
  this.STENCIL_BACK_PASS_DEPTH_PASS = 34819;
  this.STENCIL_BACK_REF = 36003;
  this.STENCIL_BACK_VALUE_MASK = 36004;
  this.STENCIL_BACK_WRITEMASK = 36005;
  this.VIEWPORT = 2978;
  this.SCISSOR_BOX = 3088;
  this.COLOR_CLEAR_VALUE = 3106;
  this.COLOR_WRITEMASK = 3107;
  this.UNPACK_ALIGNMENT = 3317;
  this.PACK_ALIGNMENT = 3333;
  this.MAX_TEXTURE_SIZE = 3379;
  this.MAX_VIEWPORT_DIMS = 3386;
  this.SUBPIXEL_BITS = 3408;
  this.RED_BITS = 3410;
  this.GREEN_BITS = 3411;
  this.BLUE_BITS = 3412;
  this.ALPHA_BITS = 3413;
  this.DEPTH_BITS = 3414;
  this.STENCIL_BITS = 3415;
  this.POLYGON_OFFSET_UNITS = 10752;
  this.POLYGON_OFFSET_FACTOR = 32824;
  this.TEXTURE_BINDING_2D = 32873;
  this.SAMPLE_BUFFERS = 32936;
  this.SAMPLES = 32937;
  this.SAMPLE_COVERAGE_VALUE = 32938;
  this.SAMPLE_COVERAGE_INVERT = 32939;
  this.COMPRESSED_TEXTURE_FORMATS = 34467;
  this.DONT_CARE = 4352;
  this.FASTEST = 4353;
  this.NICEST = 4354;
  this.GENERATE_MIPMAP_HINT = 33170;
  this.BYTE = 5120;
  this.UNSIGNED_BYTE = 5121;
  this.SHORT = 5122;
  this.UNSIGNED_SHORT = 5123;
  this.INT = 5124;
  this.UNSIGNED_INT = 5125;
  this.FLOAT = 5126;
  this.DEPTH_COMPONENT = 6402;
  this.ALPHA = 6406;
  this.RGB = 6407;
  this.RGBA = 6408;
  this.LUMINANCE = 6409;
  this.LUMINANCE_ALPHA = 6410;
  this.UNSIGNED_SHORT_4_4_4_4 = 32819;
  this.UNSIGNED_SHORT_5_5_5_1 = 32820;
  this.UNSIGNED_SHORT_5_6_5 = 33635;
  this.FRAGMENT_SHADER = 35632;
  this.VERTEX_SHADER = 35633;
  this.MAX_VERTEX_ATTRIBS = 34921;
  this.MAX_VERTEX_UNIFORM_VECTORS = 36347;
  this.MAX_VARYING_VECTORS = 36348;
  this.MAX_COMBINED_TEXTURE_IMAGE_UNITS = 35661;
  this.MAX_VERTEX_TEXTURE_IMAGE_UNITS = 35660;
  this.MAX_TEXTURE_IMAGE_UNITS = 34930;
  this.MAX_FRAGMENT_UNIFORM_VECTORS = 36349;
  this.SHADER_TYPE = 35663;
  this.DELETE_STATUS = 35712;
  this.LINK_STATUS = 35714;
  this.VALIDATE_STATUS = 35715;
  this.ATTACHED_SHADERS = 35717;
  this.ACTIVE_UNIFORMS = 35718;
  this.ACTIVE_ATTRIBUTES = 35721;
  this.SHADING_LANGUAGE_VERSION = 35724;
  this.CURRENT_PROGRAM = 35725;
  this.NEVER = 512;
  this.LESS = 513;
  this.EQUAL = 514;
  this.LEQUAL = 515;
  this.GREATER = 516;
  this.NOTEQUAL = 517;
  this.GEQUAL = 518;
  this.ALWAYS = 519;
  this.KEEP = 7680;
  this.REPLACE = 7681;
  this.INCR = 7682;
  this.DECR = 7683;
  this.INVERT = 5386;
  this.INCR_WRAP = 34055;
  this.DECR_WRAP = 34056;
  this.VENDOR = 7936;
  this.RENDERER = 7937;
  this.VERSION = 7938;
  this.NEAREST = 9728;
  this.LINEAR = 9729;
  this.NEAREST_MIPMAP_NEAREST = 9984;
  this.LINEAR_MIPMAP_NEAREST = 9985;
  this.NEAREST_MIPMAP_LINEAR = 9986;
  this.LINEAR_MIPMAP_LINEAR = 9987;
  this.TEXTURE_MAG_FILTER = 10240;
  this.TEXTURE_MIN_FILTER = 10241;
  this.TEXTURE_WRAP_S = 10242;
  this.TEXTURE_WRAP_T = 10243;
  this.TEXTURE_2D = 3553;
  this.TEXTURE = 5890;
  this.TEXTURE_CUBE_MAP = 34067;
  this.TEXTURE_BINDING_CUBE_MAP = 34068;
  this.TEXTURE_CUBE_MAP_POSITIVE_X = 34069;
  this.TEXTURE_CUBE_MAP_NEGATIVE_X = 34070;
  this.TEXTURE_CUBE_MAP_POSITIVE_Y = 34071;
  this.TEXTURE_CUBE_MAP_NEGATIVE_Y = 34072;
  this.TEXTURE_CUBE_MAP_POSITIVE_Z = 34073;
  this.TEXTURE_CUBE_MAP_NEGATIVE_Z = 34074;
  this.MAX_CUBE_MAP_TEXTURE_SIZE = 34076;
  this.TEXTURE0 = 33984;
  this.TEXTURE1 = 33985;
  this.TEXTURE2 = 33986;
  this.TEXTURE3 = 33987;
  this.TEXTURE4 = 33988;
  this.TEXTURE5 = 33989;
  this.TEXTURE6 = 33990;
  this.TEXTURE7 = 33991;
  this.TEXTURE8 = 33992;
  this.TEXTURE9 = 33993;
  this.TEXTURE10 = 33994;
  this.TEXTURE11 = 33995;
  this.TEXTURE12 = 33996;
  this.TEXTURE13 = 33997;
  this.TEXTURE14 = 33998;
  this.TEXTURE15 = 33999;
  this.TEXTURE16 = 34e3;
  this.TEXTURE17 = 34001;
  this.TEXTURE18 = 34002;
  this.TEXTURE19 = 34003;
  this.TEXTURE20 = 34004;
  this.TEXTURE21 = 34005;
  this.TEXTURE22 = 34006;
  this.TEXTURE23 = 34007;
  this.TEXTURE24 = 34008;
  this.TEXTURE25 = 34009;
  this.TEXTURE26 = 34010;
  this.TEXTURE27 = 34011;
  this.TEXTURE28 = 34012;
  this.TEXTURE29 = 34013;
  this.TEXTURE30 = 34014;
  this.TEXTURE31 = 34015;
  this.ACTIVE_TEXTURE = 34016;
  this.REPEAT = 10497;
  this.CLAMP_TO_EDGE = 33071;
  this.MIRRORED_REPEAT = 33648;
  this.FLOAT_VEC2 = 35664;
  this.FLOAT_VEC3 = 35665;
  this.FLOAT_VEC4 = 35666;
  this.INT_VEC2 = 35667;
  this.INT_VEC3 = 35668;
  this.INT_VEC4 = 35669;
  this.BOOL = 35670;
  this.BOOL_VEC2 = 35671;
  this.BOOL_VEC3 = 35672;
  this.BOOL_VEC4 = 35673;
  this.FLOAT_MAT2 = 35674;
  this.FLOAT_MAT3 = 35675;
  this.FLOAT_MAT4 = 35676;
  this.SAMPLER_2D = 35678;
  this.SAMPLER_3D = 35679;
  this.SAMPLER_CUBE = 35680;
  this.VERTEX_ATTRIB_ARRAY_ENABLED = 34338;
  this.VERTEX_ATTRIB_ARRAY_SIZE = 34339;
  this.VERTEX_ATTRIB_ARRAY_STRIDE = 34340;
  this.VERTEX_ATTRIB_ARRAY_TYPE = 34341;
  this.VERTEX_ATTRIB_ARRAY_NORMALIZED = 34922;
  this.VERTEX_ATTRIB_ARRAY_POINTER = 34373;
  this.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING = 34975;
  this.IMPLEMENTATION_COLOR_READ_TYPE = 35738;
  this.IMPLEMENTATION_COLOR_READ_FORMAT = 35739;
  this.COMPILE_STATUS = 35713;
  this.LOW_FLOAT = 36336;
  this.MEDIUM_FLOAT = 36337;
  this.HIGH_FLOAT = 36338;
  this.LOW_INT = 36339;
  this.MEDIUM_INT = 36340;
  this.HIGH_INT = 36341;
  this.FRAMEBUFFER = 36160;
  this.RENDERBUFFER = 36161;
  this.RGBA4 = 32854;
  this.RGB5_A1 = 32855;
  this.RGB565 = 36194;
  this.DEPTH_COMPONENT16 = 33189;
  this.STENCIL_INDEX = 6401;
  this.STENCIL_INDEX8 = 36168;
  this.DEPTH_STENCIL = 34041;
  this.RENDERBUFFER_WIDTH = 36162;
  this.RENDERBUFFER_HEIGHT = 36163;
  this.RENDERBUFFER_INTERNAL_FORMAT = 36164;
  this.RENDERBUFFER_RED_SIZE = 36176;
  this.RENDERBUFFER_GREEN_SIZE = 36177;
  this.RENDERBUFFER_BLUE_SIZE = 36178;
  this.RENDERBUFFER_ALPHA_SIZE = 36179;
  this.RENDERBUFFER_DEPTH_SIZE = 36180;
  this.RENDERBUFFER_STENCIL_SIZE = 36181;
  this.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE = 36048;
  this.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME = 36049;
  this.FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL = 36050;
  this.FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE = 36051;
  this.COLOR_ATTACHMENT0 = 36064;
  this.DEPTH_ATTACHMENT = 36096;
  this.STENCIL_ATTACHMENT = 36128;
  this.DEPTH_STENCIL_ATTACHMENT = 33306;
  this.NONE = 0;
  this.FRAMEBUFFER_COMPLETE = 36053;
  this.FRAMEBUFFER_INCOMPLETE_ATTACHMENT = 36054;
  this.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 36055;
  this.FRAMEBUFFER_INCOMPLETE_DIMENSIONS = 36057;
  this.FRAMEBUFFER_UNSUPPORTED = 36061;
  this.ACTIVE_TEXTURE = 34016;
  this.FRAMEBUFFER_BINDING = 36006;
  this.RENDERBUFFER_BINDING = 36007;
  this.MAX_RENDERBUFFER_SIZE = 34024;
  this.INVALID_FRAMEBUFFER_OPERATION = 1286;
  this.UNPACK_FLIP_Y_WEBGL = 37440;
  this.UNPACK_PREMULTIPLY_ALPHA_WEBGL = 37441;
  this.CONTEXT_LOST_WEBGL = 37442;
  this.UNPACK_COLORSPACE_CONVERSION_WEBGL = 37443;
  this.BROWSER_DEFAULT_WEBGL = 37444;
  var commandBuffer = [];
  var nextId = 1;
  var bindings = {
   texture2D: null,
   arrayBuffer: null,
   elementArrayBuffer: null,
   program: null,
   framebuffer: null,
   activeTexture: this.TEXTURE0,
   generateMipmapHint: this.DONT_CARE,
   blendSrcRGB: this.ONE,
   blendSrcAlpha: this.ONE,
   blendDstRGB: this.ZERO,
   blendDstAlpha: this.ZERO,
   blendEquationRGB: this.FUNC_ADD,
   blendEquationAlpha: this.FUNC_ADD,
   enabledState: {}
  };
  var stateDisabledByDefault = [ this.BLEND, this.CULL_FACE, this.DEPTH_TEST, this.DITHER, this.POLYGON_OFFSET_FILL, this.SAMPLE_ALPHA_TO_COVERAGE, this.SAMPLE_COVERAGE, this.SCISSOR_TEST, this.STENCIL_TEST ];
  for (var i in stateDisabledByDefault) {
   bindings.enabledState[stateDisabledByDefault[i]] = false;
  }
  var that = this;
  this.onmessage = function(msg) {
   switch (msg.op) {
   case "setPrefetched":
    {
     WebGLWorker.prototype.prefetchedParameters = msg.parameters;
     WebGLWorker.prototype.prefetchedExtensions = msg.extensions;
     WebGLWorker.prototype.prefetchedPrecisions = msg.precisions;
     removeRunDependency("gl-prefetch");
     break;
    }

   default:
    throw "weird gl onmessage " + JSON.stringify(msg);
   }
  };
  function revname(name) {
   for (var x in that) if (that[x] === name) return x;
   return null;
  }
  this.getParameter = function(name) {
   assert(name);
   if (name in this.prefetchedParameters) return this.prefetchedParameters[name];
   switch (name) {
   case this.TEXTURE_BINDING_2D:
    {
     return bindings.texture2D;
    }

   case this.ARRAY_BUFFER_BINDING:
    {
     return bindings.arrayBuffer;
    }

   case this.ELEMENT_ARRAY_BUFFER_BINDING:
    {
     return bindings.elementArrayBuffer;
    }

   case this.CURRENT_PROGRAM:
    {
     return bindings.program;
    }

   case this.FRAMEBUFFER_BINDING:
    {
     return bindings.framebuffer;
    }

   case this.ACTIVE_TEXTURE:
    {
     return bindings.activeTexture;
    }

   case this.GENERATE_MIPMAP_HINT:
    {
     return bindings.generateMipmapHint;
    }

   case this.BLEND_SRC_RGB:
    {
     return bindings.blendSrcRGB;
    }

   case this.BLEND_SRC_ALPHA:
    {
     return bindings.blendSrcAlpha;
    }

   case this.BLEND_DST_RGB:
    {
     return bindings.blendDstRGB;
    }

   case this.BLEND_DST_ALPHA:
    {
     return bindings.blendDstAlpha;
    }

   case this.BLEND_EQUATION_RGB:
    {
     return bindings.blendEquationRGB;
    }

   case this.BLEND_EQUATION_ALPHA:
    {
     return bindings.blendEquationAlpha;
    }

   default:
    {
     if (bindings.enabledState[name] !== undefined) return bindings.enabledState[name];
     throw "TODO: get parameter " + name + " : " + revname(name);
    }
   }
  };
  this.getExtension = function(name) {
   var i = this.prefetchedExtensions.indexOf(name);
   if (i < 0) return null;
   commandBuffer.push(1, name);
   switch (name) {
   case "EXT_texture_filter_anisotropic":
    {
     return {
      TEXTURE_MAX_ANISOTROPY_EXT: 34046,
      MAX_TEXTURE_MAX_ANISOTROPY_EXT: 34047
     };
    }

   case "WEBGL_draw_buffers":
    {
     return {
      COLOR_ATTACHMENT0_WEBGL: 36064,
      COLOR_ATTACHMENT1_WEBGL: 36065,
      COLOR_ATTACHMENT2_WEBGL: 36066,
      COLOR_ATTACHMENT3_WEBGL: 36067,
      COLOR_ATTACHMENT4_WEBGL: 36068,
      COLOR_ATTACHMENT5_WEBGL: 36069,
      COLOR_ATTACHMENT6_WEBGL: 36070,
      COLOR_ATTACHMENT7_WEBGL: 36071,
      COLOR_ATTACHMENT8_WEBGL: 36072,
      COLOR_ATTACHMENT9_WEBGL: 36073,
      COLOR_ATTACHMENT10_WEBGL: 36074,
      COLOR_ATTACHMENT11_WEBGL: 36075,
      COLOR_ATTACHMENT12_WEBGL: 36076,
      COLOR_ATTACHMENT13_WEBGL: 36077,
      COLOR_ATTACHMENT14_WEBGL: 36078,
      COLOR_ATTACHMENT15_WEBGL: 36079,
      DRAW_BUFFER0_WEBGL: 34853,
      DRAW_BUFFER1_WEBGL: 34854,
      DRAW_BUFFER2_WEBGL: 34855,
      DRAW_BUFFER3_WEBGL: 34856,
      DRAW_BUFFER4_WEBGL: 34857,
      DRAW_BUFFER5_WEBGL: 34858,
      DRAW_BUFFER6_WEBGL: 34859,
      DRAW_BUFFER7_WEBGL: 34860,
      DRAW_BUFFER8_WEBGL: 34861,
      DRAW_BUFFER9_WEBGL: 34862,
      DRAW_BUFFER10_WEBGL: 34863,
      DRAW_BUFFER11_WEBGL: 34864,
      DRAW_BUFFER12_WEBGL: 34865,
      DRAW_BUFFER13_WEBGL: 34866,
      DRAW_BUFFER14_WEBGL: 34867,
      DRAW_BUFFER15_WEBGL: 34868,
      MAX_COLOR_ATTACHMENTS_WEBGL: 36063,
      MAX_DRAW_BUFFERS_WEBGL: 34852,
      drawBuffersWEBGL: function(buffers) {
       that.drawBuffersWEBGL(buffers);
      }
     };
    }

   case "OES_standard_derivatives":
    {
     return {
      FRAGMENT_SHADER_DERIVATIVE_HINT_OES: 35723
     };
    }
   }
   return true;
  };
  this.getSupportedExtensions = function() {
   return this.prefetchedExtensions;
  };
  this.getShaderPrecisionFormat = function(shaderType, precisionType) {
   return this.prefetchedPrecisions[shaderType][precisionType];
  };
  this.enable = function(cap) {
   commandBuffer.push(2, cap);
   bindings.enabledState[cap] = true;
  };
  this.isEnabled = function(cap) {
   return bindings.enabledState[cap];
  };
  this.disable = function(cap) {
   commandBuffer.push(3, cap);
   bindings.enabledState[cap] = false;
  };
  this.clear = function(mask) {
   commandBuffer.push(4, mask);
  };
  this.clearColor = function(r, g, b, a) {
   commandBuffer.push(5, r, g, b, a);
  };
  this.createShader = function(type) {
   var id = nextId++;
   commandBuffer.push(6, type, id);
   return {
    id: id,
    what: "shader",
    type: type
   };
  };
  this.deleteShader = function(shader) {
   if (!shader) return;
   commandBuffer.push(7, shader.id);
  };
  this.shaderSource = function(shader, source) {
   shader.source = source;
   commandBuffer.push(8, shader.id, source);
  };
  this.compileShader = function(shader) {
   commandBuffer.push(9, shader.id);
  };
  this.getShaderInfoLog = function(shader) {
   return "";
  };
  this.createProgram = function() {
   var id = nextId++;
   commandBuffer.push(10, id);
   return new WebGLProgram(id);
  };
  this.deleteProgram = function(program) {
   if (!program) return;
   commandBuffer.push(11, program.id);
  };
  this.attachShader = function(program, shader) {
   program.shaders.push(shader);
   commandBuffer.push(12, program.id, shader.id);
  };
  this.bindAttribLocation = function(program, index, name) {
   program.nextAttributes[name] = {
    what: "attribute",
    name: name,
    size: -1,
    location: index,
    type: "?"
   };
   program.nextAttributeVec[index] = name;
   commandBuffer.push(13, program.id, index, name);
  };
  this.getAttribLocation = function(program, name) {
   if (name in program.attributes) return program.attributes[name].location;
   return -1;
  };
  this.linkProgram = function(program) {
   function getTypeId(text) {
    switch (text) {
    case "bool":
     return that.BOOL;

    case "int":
     return that.INT;

    case "uint":
     return that.UNSIGNED_INT;

    case "float":
     return that.FLOAT;

    case "vec2":
     return that.FLOAT_VEC2;

    case "vec3":
     return that.FLOAT_VEC3;

    case "vec4":
     return that.FLOAT_VEC4;

    case "ivec2":
     return that.INT_VEC2;

    case "ivec3":
     return that.INT_VEC3;

    case "ivec4":
     return that.INT_VEC4;

    case "bvec2":
     return that.BOOL_VEC2;

    case "bvec3":
     return that.BOOL_VEC3;

    case "bvec4":
     return that.BOOL_VEC4;

    case "mat2":
     return that.FLOAT_MAT2;

    case "mat3":
     return that.FLOAT_MAT3;

    case "mat4":
     return that.FLOAT_MAT4;

    case "sampler2D":
     return that.SAMPLER_2D;

    case "sampler3D":
     return that.SAMPLER_3D;

    case "samplerCube":
     return that.SAMPLER_CUBE;

    default:
     throw "not yet recognized type text: " + text;
    }
   }
   function parseElementType(shader, type, obj, vec) {
    var source = shader.source;
    source = source.replace(/\n/g, "|\n");
    var newItems = source.match(new RegExp(type + "\\s+\\w+\\s+[\\w,\\s[\\]]+;", "g"));
    if (!newItems) return;
    newItems.forEach(function(item) {
     var m = new RegExp(type + "\\s+(\\w+)\\s+([\\w,\\s[\\]]+);").exec(item);
     assert(m);
     m[2].split(",").map(function(name) {
      name = name.trim();
      return name.search(/\s/) >= 0 ? "" : name;
     }).filter(function(name) {
      return !!name;
     }).forEach(function(name) {
      var size = 1;
      var open = name.indexOf("[");
      var fullname = name;
      if (open >= 0) {
       var close = name.indexOf("]");
       size = parseInt(name.substring(open + 1, close));
       name = name.substr(0, open);
       fullname = name + "[0]";
      }
      if (!obj[name]) {
       obj[name] = {
        what: type,
        name: fullname,
        size: size,
        location: -1,
        type: getTypeId(m[1])
       };
       if (vec) vec.push(name);
      }
     });
    });
   }
   program.uniforms = {};
   program.uniformVec = [];
   program.attributes = program.nextAttributes;
   program.attributeVec = program.nextAttributeVec;
   program.nextAttributes = {};
   program.nextAttributeVec = [];
   var existingAttributes = {};
   program.shaders.forEach(function(shader) {
    parseElementType(shader, "uniform", program.uniforms, program.uniformVec);
    parseElementType(shader, "attribute", existingAttributes, null);
   });
   for (var attr in existingAttributes) {
    if (!(attr in program.attributes)) {
     var index = program.attributeVec.length;
     program.attributes[attr] = {
      what: "attribute",
      name: attr,
      size: -1,
      location: index,
      type: "?"
     };
     program.attributeVec[index] = attr;
     commandBuffer.push(13, program.id, index, attr);
    }
    program.attributes[attr].size = existingAttributes[attr].size;
    program.attributes[attr].type = existingAttributes[attr].type;
   }
   commandBuffer.push(14, program.id);
  };
  this.getProgramParameter = function(program, name) {
   switch (name) {
   case this.ACTIVE_UNIFORMS:
    return program.uniformVec.length;

   case this.ACTIVE_ATTRIBUTES:
    return program.attributeVec.length;

   case this.LINK_STATUS:
    {
     commandBuffer.push(15, program.id, name);
     return true;
    }

   default:
    throw "bad getProgramParameter " + revname(name);
   }
  };
  this.getActiveAttrib = function(program, index) {
   var name = program.attributeVec[index];
   if (!name) return null;
   return program.attributes[name];
  };
  this.getActiveUniform = function(program, index) {
   var name = program.uniformVec[index];
   if (!name) return null;
   return program.uniforms[name];
  };
  this.getUniformLocation = function(program, name) {
   var fullname = name;
   var index = -1;
   var open = name.indexOf("[");
   if (open >= 0) {
    var close = name.indexOf("]");
    index = parseInt(name.substring(open + 1, close));
    name = name.substr(0, open);
   }
   if (!(name in program.uniforms)) return null;
   var id = nextId++;
   commandBuffer.push(16, program.id, fullname, id);
   return {
    what: "location",
    uniform: program.uniforms[name],
    id: id,
    index: index
   };
  };
  this.getProgramInfoLog = function(shader) {
   return "";
  };
  this.useProgram = function(program) {
   commandBuffer.push(17, program ? program.id : 0);
   bindings.program = program;
  };
  this.uniform1i = function(location, data) {
   if (!location) return;
   commandBuffer.push(18, location.id, data);
  };
  this.uniform1f = function(location, data) {
   if (!location) return;
   commandBuffer.push(19, location.id, data);
  };
  this.uniform3fv = function(location, data) {
   if (!location) return;
   commandBuffer.push(20, location.id, new Float32Array(data));
  };
  this.uniform4f = function(location, x, y, z, w) {
   if (!location) return;
   commandBuffer.push(21, location.id, new Float32Array([ x, y, z, w ]));
  };
  this.uniform4fv = function(location, data) {
   if (!location) return;
   commandBuffer.push(21, location.id, new Float32Array(data));
  };
  this.uniformMatrix4fv = function(location, transpose, data) {
   if (!location) return;
   commandBuffer.push(22, location.id, transpose, new Float32Array(data));
  };
  this.vertexAttrib4fv = function(index, values) {
   commandBuffer.push(23, index, new Float32Array(values));
  };
  this.createBuffer = function() {
   var id = nextId++;
   commandBuffer.push(24, id);
   return new WebGLBuffer(id);
  };
  this.deleteBuffer = function(buffer) {
   if (!buffer) return;
   commandBuffer.push(25, buffer.id);
  };
  this.bindBuffer = function(target, buffer) {
   commandBuffer.push(26, target, buffer ? buffer.id : 0);
   switch (target) {
   case this.ARRAY_BUFFER_BINDING:
    {
     bindings.arrayBuffer = buffer;
     break;
    }

   case this.ELEMENT_ARRAY_BUFFER_BINDING:
    {
     bindings.elementArrayBuffer = buffer;
     break;
    }
   }
  };
  function duplicate(something) {
   if (!something || typeof something === "number") return something;
   if (something.slice) return something.slice(0);
   return new something.constructor(something);
  }
  this.bufferData = function(target, something, usage) {
   commandBuffer.push(27, target, duplicate(something), usage);
  };
  this.bufferSubData = function(target, offset, something) {
   commandBuffer.push(28, target, offset, duplicate(something));
  };
  this.viewport = function(x, y, w, h) {
   commandBuffer.push(29, x, y, w, h);
  };
  this.vertexAttribPointer = function(index, size, type, normalized, stride, offset) {
   commandBuffer.push(30, index, size, type, normalized, stride, offset);
  };
  this.enableVertexAttribArray = function(index) {
   commandBuffer.push(31, index);
  };
  this.disableVertexAttribArray = function(index) {
   commandBuffer.push(32, index);
  };
  this.drawArrays = function(mode, first, count) {
   commandBuffer.push(33, mode, first, count);
  };
  this.drawElements = function(mode, count, type, offset) {
   commandBuffer.push(34, mode, count, type, offset);
  };
  this.getError = function() {
   commandBuffer.push(35);
   return this.NO_ERROR;
  };
  this.createTexture = function() {
   var id = nextId++;
   commandBuffer.push(36, id);
   return new WebGLTexture(id);
  };
  this.deleteTexture = function(texture) {
   if (!texture) return;
   commandBuffer.push(37, texture.id);
   texture.id = 0;
  };
  this.isTexture = function(texture) {
   return texture && texture.what === "texture" && texture.id > 0 && texture.binding;
  };
  this.bindTexture = function(target, texture) {
   switch (target) {
   case that.TEXTURE_2D:
    {
     bindings.texture2D = texture;
     break;
    }
   }
   if (texture) texture.binding = target;
   commandBuffer.push(38, target, texture ? texture.id : 0);
  };
  this.texParameteri = function(target, pname, param) {
   commandBuffer.push(39, target, pname, param);
  };
  this.texImage2D = function(target, level, internalformat, width, height, border, format, type, pixels) {
   if (pixels === undefined) {
    format = width;
    type = height;
    pixels = border;
    assert(pixels instanceof Image);
    assert(internalformat === format && format === this.RGBA);
    assert(type === this.UNSIGNED_BYTE);
    var data = pixels.data;
    width = data.width;
    height = data.height;
    border = 0;
    pixels = new Uint8Array(data.data);
   }
   commandBuffer.push(40, target, level, internalformat, width, height, border, format, type, duplicate(pixels));
  };
  this.compressedTexImage2D = function(target, level, internalformat, width, height, border, pixels) {
   commandBuffer.push(41, target, level, internalformat, width, height, border, duplicate(pixels));
  };
  this.activeTexture = function(texture) {
   commandBuffer.push(42, texture);
   bindings.activeTexture = texture;
  };
  this.getShaderParameter = function(shader, pname) {
   switch (pname) {
   case this.SHADER_TYPE:
    return shader.type;

   case this.COMPILE_STATUS:
    {
     commandBuffer.push(43, shader.id, pname);
     return true;
    }

   default:
    throw "unsupported getShaderParameter " + pname;
   }
  };
  this.clearDepth = function(depth) {
   commandBuffer.push(44, depth);
  };
  this.depthFunc = function(depth) {
   commandBuffer.push(45, depth);
  };
  this.frontFace = function(depth) {
   commandBuffer.push(46, depth);
  };
  this.cullFace = function(depth) {
   commandBuffer.push(47, depth);
  };
  this.readPixels = function(depth) {
   abort("readPixels is impossible, we are async GL");
  };
  this.pixelStorei = function(pname, param) {
   commandBuffer.push(48, pname, param);
  };
  this.depthMask = function(flag) {
   commandBuffer.push(49, flag);
  };
  this.depthRange = function(near, far) {
   commandBuffer.push(50, near, far);
  };
  this.blendFunc = function(sfactor, dfactor) {
   commandBuffer.push(51, sfactor, dfactor);
   bindings.blendSrcRGB = bindings.blendSrcAlpha = sfactor;
   bindings.blendDstRGB = bindings.blendDstAlpha = dfactor;
  };
  this.scissor = function(x, y, width, height) {
   commandBuffer.push(52, x, y, width, height);
  };
  this.colorMask = function(red, green, blue, alpha) {
   commandBuffer.push(53, red, green, blue, alpha);
  };
  this.lineWidth = function(width) {
   commandBuffer.push(54, width);
  };
  this.createFramebuffer = function() {
   var id = nextId++;
   commandBuffer.push(55, id);
   return new WebGLFramebuffer(id);
  };
  this.deleteFramebuffer = function(framebuffer) {
   if (!framebuffer) return;
   commandBuffer.push(56, framebuffer.id);
  };
  this.bindFramebuffer = function(target, framebuffer) {
   commandBuffer.push(57, target, framebuffer ? framebuffer.id : 0);
   bindings.framebuffer = framebuffer;
  };
  this.framebufferTexture2D = function(target, attachment, textarget, texture, level) {
   commandBuffer.push(58, target, attachment, textarget, texture ? texture.id : 0, level);
  };
  this.checkFramebufferStatus = function(target) {
   return this.FRAMEBUFFER_COMPLETE;
  };
  this.createRenderbuffer = function() {
   var id = nextId++;
   commandBuffer.push(59, id);
   return new WebGLRenderbuffer(id);
  };
  this.deleteRenderbuffer = function(renderbuffer) {
   if (!renderbuffer) return;
   commandBuffer.push(60, renderbuffer.id);
  };
  this.bindRenderbuffer = function(target, renderbuffer) {
   commandBuffer.push(61, target, renderbuffer ? renderbuffer.id : 0);
  };
  this.renderbufferStorage = function(target, internalformat, width, height) {
   commandBuffer.push(62, target, internalformat, width, height);
  };
  this.framebufferRenderbuffer = function(target, attachment, renderbuffertarget, renderbuffer) {
   commandBuffer.push(63, target, attachment, renderbuffertarget, renderbuffer ? renderbuffer.id : 0);
  };
  this.debugPrint = function(text) {
   commandBuffer.push(64, text);
  };
  this.hint = function(target, mode) {
   commandBuffer.push(65, target, mode);
   if (target == this.GENERATE_MIPMAP_HINT) bindings.generateMipmapHint = mode;
  };
  this.blendEquation = function(mode) {
   commandBuffer.push(66, mode);
   bindings.blendEquationRGB = bindings.blendEquationAlpha = mode;
  };
  this.generateMipmap = function(target) {
   commandBuffer.push(67, target);
  };
  this.uniformMatrix3fv = function(location, transpose, data) {
   if (!location) return;
   commandBuffer.push(68, location.id, transpose, new Float32Array(data));
  };
  this.stencilMask = function(mask) {
   commandBuffer.push(69, mask);
  };
  this.clearStencil = function(s) {
   commandBuffer.push(70, s);
  };
  this.texSubImage2D = function(target, level, xoffset, yoffset, width, height, format, type, pixels) {
   if (pixels === undefined) {
    var formatTemp = format;
    format = width;
    type = height;
    pixels = formatTemp;
    assert(pixels instanceof Image);
    assert(format === this.RGBA);
    assert(type === this.UNSIGNED_BYTE);
    var data = pixels.data;
    width = data.width;
    height = data.height;
    pixels = new Uint8Array(data.data);
   }
   commandBuffer.push(71, target, level, xoffset, yoffset, width, height, format, type, duplicate(pixels));
  };
  this.uniform3f = function(location, x, y, z) {
   if (!location) return;
   commandBuffer.push(72, location.id, x, y, z);
  };
  this.blendFuncSeparate = function(srcRGB, dstRGB, srcAlpha, dstAlpha) {
   commandBuffer.push(73, srcRGB, dstRGB, srcAlpha, dstAlpha);
   bindings.blendSrcRGB = srcRGB;
   bindings.blendSrcAlpha = srcAlpha;
   bindings.blendDstRGB = dstRGB;
   bindings.blendDstAlpha = dstAlpha;
  };
  this.uniform2fv = function(location, data) {
   if (!location) return;
   commandBuffer.push(74, location.id, new Float32Array(data));
  };
  this.texParameterf = function(target, pname, param) {
   commandBuffer.push(75, target, pname, param);
  };
  this.isContextLost = function() {
   commandBuffer.push(76);
   return false;
  };
  this.isProgram = function(program) {
   return program && program.what === "program";
  };
  this.blendEquationSeparate = function(rgb, alpha) {
   commandBuffer.push(77, rgb, alpha);
   bindings.blendEquationRGB = rgb;
   bindings.blendEquationAlpha = alpha;
  };
  this.stencilFuncSeparate = function(face, func, ref, mask) {
   commandBuffer.push(78, face, func, ref, mask);
  };
  this.stencilOpSeparate = function(face, fail, zfail, zpass) {
   commandBuffer.push(79, face, fail, zfail, zpass);
  };
  this.drawBuffersWEBGL = function(buffers) {
   commandBuffer.push(80, buffers);
  };
  this.uniform1iv = function(location, data) {
   if (!location) return;
   commandBuffer.push(81, location.id, new Int32Array(data));
  };
  this.uniform1fv = function(location, data) {
   if (!location) return;
   commandBuffer.push(82, location.id, new Float32Array(data));
  };
  var theoreticalTracker = new FPSTracker("server (theoretical)");
  var throttledTracker = new FPSTracker("server (client-throttled)");
  function preRAF() {
   if (Math.abs(frameId - clientFrameId) >= 4) {
    return false;
   }
  }
  var postRAFed = false;
  function postRAF() {
   if (commandBuffer.length > 0) {
    postMessage({
     target: "gl",
     op: "render",
     commandBuffer: commandBuffer
    });
    commandBuffer = [];
   }
   postRAFed = true;
  }
  assert(!Browser.doSwapBuffers);
  Browser.doSwapBuffers = postRAF;
  var trueRAF = window.requestAnimationFrame;
  window.requestAnimationFrame = function(func) {
   trueRAF(function() {
    if (preRAF() === false) {
     window.requestAnimationFrame(func);
     return;
    }
    postRAFed = false;
    func();
    if (!postRAFed) {
     postRAF();
    }
   });
  };
 }
 WebGLWorker.prototype.prefetchedParameters = {};
 WebGLWorker.prototype.prefetchedExtensions = {};
 WebGLWorker.prototype.prefetchedPrecisions = {};
 if (typeof console === "undefined") {
  var console = {
   log: function(x) {
    if (typeof dump === "function") dump("log: " + x + "\n");
   },
   debug: function(x) {
    if (typeof dump === "function") dump("debug: " + x + "\n");
   },
   info: function(x) {
    if (typeof dump === "function") dump("info: " + x + "\n");
   },
   warn: function(x) {
    if (typeof dump === "function") dump("warn: " + x + "\n");
   },
   error: function(x) {
    if (typeof dump === "function") dump("error: " + x + "\n");
   }
  };
 }
 function FPSTracker(text) {
  var last = 0;
  var mean = 0;
  var counter = 0;
  this.tick = function() {
   var now = Date.now();
   if (last > 0) {
    var diff = now - last;
    mean = .99 * mean + .01 * diff;
    if (counter++ === 60) {
     counter = 0;
     dump(text + " fps: " + (1e3 / mean).toFixed(2) + "\n");
    }
   }
   last = now;
  };
 }
 function Element() {
  throw "TODO: Element";
 }
 var KeyboardEvent = {
  "DOM_KEY_LOCATION_RIGHT": 2
 };
 function PropertyBag() {
  this.addProperty = function() {};
  this.removeProperty = function() {};
  this.setProperty = function() {};
 }
 var IndexedObjects = {
  nextId: 1,
  cache: {},
  add: function(object) {
   object.id = this.nextId++;
   this.cache[object.id] = object;
  }
 };
 function EventListener() {
  this.listeners = {};
  this.addEventListener = function addEventListener(event, func) {
   if (!this.listeners[event]) this.listeners[event] = [];
   this.listeners[event].push(func);
  };
  this.removeEventListener = function(event, func) {
   var list = this.listeners[event];
   if (!list) return;
   var me = list.indexOf(func);
   if (me < 0) return;
   list.splice(me, 1);
  };
  this.fireEvent = function fireEvent(event) {
   event.preventDefault = function() {};
   if (event.type in this.listeners) {
    this.listeners[event.type].forEach(function(listener) {
     listener(event);
    });
   }
  };
 }
 function Image() {
  IndexedObjects.add(this);
  EventListener.call(this);
  var src = "";
  Object.defineProperty(this, "src", {
   set: function(value) {
    src = value;
    assert(this.id);
    postMessage({
     target: "Image",
     method: "src",
     src: src,
     id: this.id
    });
   },
   get: function() {
    return src;
   }
  });
 }
 Image.prototype.onload = function() {};
 Image.prototype.onerror = function() {};
 var window = this;
 var windowExtra = new EventListener();
 for (var x in windowExtra) window[x] = windowExtra[x];
 window.close = function window_close() {
  postMessage({
   target: "window",
   method: "close"
  });
 };
 window.alert = function(text) {
  err("alert forever: " + text);
  while (1) {}
 };
 window.scrollX = window.scrollY = 0;
 window.WebGLRenderingContext = WebGLWorker;
 window.requestAnimationFrame = function() {
  var nextRAF = 0;
  return function(func) {
   var now = Date.now();
   if (nextRAF === 0) {
    nextRAF = now + 1e3 / 60;
   } else {
    while (now + 2 >= nextRAF) {
     nextRAF += 1e3 / 60;
    }
   }
   var delay = Math.max(nextRAF - now, 0);
   setTimeout(func, delay);
  };
 }();
 var webGLWorker = new WebGLWorker();
 var document = new EventListener();
 document.createElement = function document_createElement(what) {
  switch (what) {
  case "canvas":
   {
    var canvas = new EventListener();
    canvas.ensureData = function canvas_ensureData() {
     if (!canvas.data || canvas.data.width !== canvas.width || canvas.data.height !== canvas.height) {
      canvas.data = {
       width: canvas.width,
       height: canvas.height,
       data: new Uint8Array(canvas.width * canvas.height * 4)
      };
      if (canvas === Module["canvas"]) {
       postMessage({
        target: "canvas",
        op: "resize",
        width: canvas.width,
        height: canvas.height
       });
      }
     }
    };
    canvas.getContext = function canvas_getContext(type, attributes) {
     if (canvas === Module["canvas"]) {
      postMessage({
       target: "canvas",
       op: "getContext",
       type: type,
       attributes: attributes
      });
     }
     if (type === "2d") {
      return {
       getImageData: function(x, y, w, h) {
        assert(x == 0 && y == 0 && w == canvas.width && h == canvas.height);
        canvas.ensureData();
        return {
         width: canvas.data.width,
         height: canvas.data.height,
         data: new Uint8Array(canvas.data.data)
        };
       },
       putImageData: function(image, x, y) {
        canvas.ensureData();
        assert(x == 0 && y == 0 && image.width == canvas.width && image.height == canvas.height);
        canvas.data.data.set(image.data);
        if (canvas === Module["canvas"]) {
         postMessage({
          target: "canvas",
          op: "render",
          image: canvas.data
         });
        }
       },
       drawImage: function(image, x, y, w, h, ox, oy, ow, oh) {
        assert(!x && !y && !ox && !oy);
        assert(w === ow && h === oh);
        assert(canvas.width === w || w === undefined);
        assert(canvas.height === h || h === undefined);
        assert(image.width === canvas.width && image.height === canvas.height);
        canvas.ensureData();
        canvas.data.data.set(image.data.data);
        if (canvas === Module["canvas"]) {
         postMessage({
          target: "canvas",
          op: "render",
          image: canvas.data
         });
        }
       }
      };
     } else {
      return webGLWorker;
     }
    };
    canvas.boundingClientRect = {};
    canvas.getBoundingClientRect = function canvas_getBoundingClientRect() {
     return {
      width: canvas.boundingClientRect.width,
      height: canvas.boundingClientRect.height,
      top: canvas.boundingClientRect.top,
      left: canvas.boundingClientRect.left,
      bottom: canvas.boundingClientRect.bottom,
      right: canvas.boundingClientRect.right
     };
    };
    canvas.style = new PropertyBag();
    canvas.exitPointerLock = function() {};
    canvas.width_ = canvas.width_ || 0;
    canvas.height_ = canvas.height_ || 0;
    Object.defineProperty(canvas, "width", {
     set: function(value) {
      canvas.width_ = value;
      if (canvas === Module["canvas"]) {
       postMessage({
        target: "canvas",
        op: "resize",
        width: canvas.width_,
        height: canvas.height_
       });
      }
     },
     get: function() {
      return canvas.width_;
     }
    });
    Object.defineProperty(canvas, "height", {
     set: function(value) {
      canvas.height_ = value;
      if (canvas === Module["canvas"]) {
       postMessage({
        target: "canvas",
        op: "resize",
        width: canvas.width_,
        height: canvas.height_
       });
      }
     },
     get: function() {
      return canvas.height_;
     }
    });
    var style = {
     parentCanvas: canvas,
     removeProperty: function() {},
     setProperty: function() {}
    };
    Object.defineProperty(style, "cursor", {
     set: function(value) {
      if (!style.cursor_ || style.cursor_ !== value) {
       style.cursor_ = value;
       if (style.parentCanvas === Module["canvas"]) {
        postMessage({
         target: "canvas",
         op: "setObjectProperty",
         object: "style",
         property: "cursor",
         value: style.cursor_
        });
       }
      }
     },
     get: function() {
      return style.cursor_;
     }
    });
    canvas.style = style;
    return canvas;
   }

  default:
   throw "document.createElement " + what;
  }
 };
 document.getElementById = function(id) {
  if (id === "canvas" || id === "application-canvas") {
   return Module.canvas;
  }
  throw "document.getElementById failed on " + id;
 };
 document.querySelector = function(id) {
  if (id === "#canvas" || id === "#application-canvas" || id === "canvas" || id === "application-canvas") {
   return Module.canvas;
  }
  throw "document.querySelector failed on " + id;
 };
 document.documentElement = {};
 document.styleSheets = [ {
  cssRules: [],
  insertRule: function(rule, i) {
   this.cssRules.splice(i, 0, rule);
  }
 } ];
 document.URL = "http://worker.not.yet.ready.wait.for.window.onload?fake";
 function Audio() {
  warnOnce("faking Audio elements, no actual sound will play");
 }
 Audio.prototype = new EventListener();
 Object.defineProperty(Audio.prototype, "src", {
  set: function(value) {
   if (value[0] === "d") return;
   this.onerror();
  }
 });
 Audio.prototype.play = function() {};
 Audio.prototype.pause = function() {};
 Audio.prototype.cloneNode = function() {
  return new Audio();
 };
 function AudioContext() {
  warnOnce("faking WebAudio elements, no actual sound will play");
  function makeNode() {
   return {
    connect: function() {},
    disconnect: function() {}
   };
  }
  this.listener = {
   setPosition: function() {},
   setOrientation: function() {}
  };
  this.decodeAudioData = function() {};
  this.createBuffer = makeNode;
  this.createBufferSource = makeNode;
  this.createGain = makeNode;
  this.createPanner = makeNode;
 }
 var screen = {
  width: 0,
  height: 0
 };
 Module.canvas = document.createElement("canvas");
 Module.setStatus = function() {};
 out = function Module_print(x) {
  postMessage({
   target: "stdout",
   content: x
  });
 };
 err = function Module_printErr(x) {
  postMessage({
   target: "stderr",
   content: x
  });
 };
 var frameId = 0;
 var clientFrameId = 0;
 var postMainLoop = Module["postMainLoop"];
 Module["postMainLoop"] = function() {
  if (postMainLoop) postMainLoop();
  postMessage({
   target: "tick",
   id: frameId++
  });
  commandBuffer = [];
 };
 addRunDependency("gl-prefetch");
 addRunDependency("worker-init");
 var messageBuffer = null;
 var messageResenderTimeout = null;
 function messageResender() {
  if (calledMain) {
   assert(messageBuffer && messageBuffer.length > 0);
   messageResenderTimeout = null;
   messageBuffer.forEach(function(message) {
    onmessage(message);
   });
   messageBuffer = null;
  } else {
   messageResenderTimeout = setTimeout(messageResender, 100);
  }
 }
 function onMessageFromMainEmscriptenThread(message) {
  if (!calledMain && !message.data.preMain) {
   if (!messageBuffer) {
    messageBuffer = [];
    messageResenderTimeout = setTimeout(messageResender, 100);
   }
   messageBuffer.push(message);
   return;
  }
  if (calledMain && messageResenderTimeout) {
   clearTimeout(messageResenderTimeout);
   messageResender();
  }
  switch (message.data.target) {
  case "document":
   {
    document.fireEvent(message.data.event);
    break;
   }

  case "window":
   {
    window.fireEvent(message.data.event);
    break;
   }

  case "canvas":
   {
    if (message.data.event) {
     Module.canvas.fireEvent(message.data.event);
    } else if (message.data.boundingClientRect) {
     Module.canvas.boundingClientRect = message.data.boundingClientRect;
    } else throw "ey?";
    break;
   }

  case "gl":
   {
    webGLWorker.onmessage(message.data);
    break;
   }

  case "tock":
   {
    clientFrameId = message.data.id;
    break;
   }

  case "Image":
   {
    var img = IndexedObjects.cache[message.data.id];
    switch (message.data.method) {
    case "onload":
     {
      img.width = message.data.width;
      img.height = message.data.height;
      img.data = {
       width: img.width,
       height: img.height,
       data: message.data.data
      };
      img.complete = true;
      img.onload();
      break;
     }

    case "onerror":
     {
      img.onerror({
       srcElement: img
      });
      break;
     }
    }
    break;
   }

  case "IDBStore":
   {
    assert(message.data.method === "response");
    assert(IDBStore.pending);
    IDBStore.pending(message.data);
    break;
   }

  case "worker-init":
   {
    Module.canvas = document.createElement("canvas");
    screen.width = Module.canvas.width_ = message.data.width;
    screen.height = Module.canvas.height_ = message.data.height;
    Module.canvas.boundingClientRect = message.data.boundingClientRect;
    document.URL = message.data.URL;
    window.fireEvent({
     type: "load"
    });
    removeRunDependency("worker-init");
    break;
   }

  case "custom":
   {
    if (Module["onCustomMessage"]) {
     Module["onCustomMessage"](message);
    } else {
     throw "Custom message received but worker Module.onCustomMessage not implemented.";
    }
    break;
   }

  case "setimmediate":
   {
    if (Module["setImmediates"]) Module["setImmediates"].shift()();
    break;
   }

  default:
   throw "wha? " + message.data.target;
  }
 }
 onmessage = onMessageFromMainEmscriptenThread;
 if (typeof __specialEventTargets !== "undefined") {
  __specialEventTargets = [ 0, document, window ];
 }
}

Module["asm"] = asm;

if (!Object.getOwnPropertyDescriptor(Module, "intArrayFromString")) Module["intArrayFromString"] = function() {
 abort("'intArrayFromString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "intArrayToString")) Module["intArrayToString"] = function() {
 abort("'intArrayToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "ccall")) Module["ccall"] = function() {
 abort("'ccall' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "cwrap")) Module["cwrap"] = function() {
 abort("'cwrap' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "setValue")) Module["setValue"] = function() {
 abort("'setValue' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "getValue")) Module["getValue"] = function() {
 abort("'getValue' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

Module["allocate"] = allocate;

Module["getMemory"] = getMemory;

if (!Object.getOwnPropertyDescriptor(Module, "AsciiToString")) Module["AsciiToString"] = function() {
 abort("'AsciiToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "stringToAscii")) Module["stringToAscii"] = function() {
 abort("'stringToAscii' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "UTF8ArrayToString")) Module["UTF8ArrayToString"] = function() {
 abort("'UTF8ArrayToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "UTF8ToString")) Module["UTF8ToString"] = function() {
 abort("'UTF8ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF8Array")) Module["stringToUTF8Array"] = function() {
 abort("'stringToUTF8Array' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF8")) Module["stringToUTF8"] = function() {
 abort("'stringToUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "lengthBytesUTF8")) Module["lengthBytesUTF8"] = function() {
 abort("'lengthBytesUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "UTF16ToString")) Module["UTF16ToString"] = function() {
 abort("'UTF16ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF16")) Module["stringToUTF16"] = function() {
 abort("'stringToUTF16' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "lengthBytesUTF16")) Module["lengthBytesUTF16"] = function() {
 abort("'lengthBytesUTF16' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "UTF32ToString")) Module["UTF32ToString"] = function() {
 abort("'UTF32ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF32")) Module["stringToUTF32"] = function() {
 abort("'stringToUTF32' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "lengthBytesUTF32")) Module["lengthBytesUTF32"] = function() {
 abort("'lengthBytesUTF32' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "allocateUTF8")) Module["allocateUTF8"] = function() {
 abort("'allocateUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "allocateUTF8OnStack")) Module["allocateUTF8OnStack"] = function() {
 abort("'allocateUTF8OnStack' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "stackTrace")) Module["stackTrace"] = function() {
 abort("'stackTrace' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "addOnPreRun")) Module["addOnPreRun"] = function() {
 abort("'addOnPreRun' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "addOnInit")) Module["addOnInit"] = function() {
 abort("'addOnInit' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "addOnPreMain")) Module["addOnPreMain"] = function() {
 abort("'addOnPreMain' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "addOnExit")) Module["addOnExit"] = function() {
 abort("'addOnExit' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "addOnPostRun")) Module["addOnPostRun"] = function() {
 abort("'addOnPostRun' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "writeStringToMemory")) Module["writeStringToMemory"] = function() {
 abort("'writeStringToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "writeArrayToMemory")) Module["writeArrayToMemory"] = function() {
 abort("'writeArrayToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "writeAsciiToMemory")) Module["writeAsciiToMemory"] = function() {
 abort("'writeAsciiToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "addRunDependency")) Module["addRunDependency"] = function() {
 abort("'addRunDependency' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
};

if (!Object.getOwnPropertyDescriptor(Module, "removeRunDependency")) Module["removeRunDependency"] = function() {
 abort("'removeRunDependency' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
};

if (!Object.getOwnPropertyDescriptor(Module, "ENV")) Module["ENV"] = function() {
 abort("'ENV' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "FS")) Module["FS"] = function() {
 abort("'FS' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "FS_createFolder")) Module["FS_createFolder"] = function() {
 abort("'FS_createFolder' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
};

if (!Object.getOwnPropertyDescriptor(Module, "FS_createPath")) Module["FS_createPath"] = function() {
 abort("'FS_createPath' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
};

if (!Object.getOwnPropertyDescriptor(Module, "FS_createDataFile")) Module["FS_createDataFile"] = function() {
 abort("'FS_createDataFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
};

if (!Object.getOwnPropertyDescriptor(Module, "FS_createPreloadedFile")) Module["FS_createPreloadedFile"] = function() {
 abort("'FS_createPreloadedFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
};

if (!Object.getOwnPropertyDescriptor(Module, "FS_createLazyFile")) Module["FS_createLazyFile"] = function() {
 abort("'FS_createLazyFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
};

if (!Object.getOwnPropertyDescriptor(Module, "FS_createLink")) Module["FS_createLink"] = function() {
 abort("'FS_createLink' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
};

if (!Object.getOwnPropertyDescriptor(Module, "FS_createDevice")) Module["FS_createDevice"] = function() {
 abort("'FS_createDevice' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
};

if (!Object.getOwnPropertyDescriptor(Module, "FS_unlink")) Module["FS_unlink"] = function() {
 abort("'FS_unlink' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
};

if (!Object.getOwnPropertyDescriptor(Module, "GL")) Module["GL"] = function() {
 abort("'GL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "dynamicAlloc")) Module["dynamicAlloc"] = function() {
 abort("'dynamicAlloc' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "loadDynamicLibrary")) Module["loadDynamicLibrary"] = function() {
 abort("'loadDynamicLibrary' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "loadWebAssemblyModule")) Module["loadWebAssemblyModule"] = function() {
 abort("'loadWebAssemblyModule' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "getLEB")) Module["getLEB"] = function() {
 abort("'getLEB' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "getFunctionTables")) Module["getFunctionTables"] = function() {
 abort("'getFunctionTables' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "alignFunctionTables")) Module["alignFunctionTables"] = function() {
 abort("'alignFunctionTables' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "registerFunctions")) Module["registerFunctions"] = function() {
 abort("'registerFunctions' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "addFunction")) Module["addFunction"] = function() {
 abort("'addFunction' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "removeFunction")) Module["removeFunction"] = function() {
 abort("'removeFunction' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "getFuncWrapper")) Module["getFuncWrapper"] = function() {
 abort("'getFuncWrapper' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "prettyPrint")) Module["prettyPrint"] = function() {
 abort("'prettyPrint' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "makeBigInt")) Module["makeBigInt"] = function() {
 abort("'makeBigInt' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "dynCall")) Module["dynCall"] = function() {
 abort("'dynCall' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "getCompilerSetting")) Module["getCompilerSetting"] = function() {
 abort("'getCompilerSetting' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "print")) Module["print"] = function() {
 abort("'print' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "printErr")) Module["printErr"] = function() {
 abort("'printErr' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "getTempRet0")) Module["getTempRet0"] = function() {
 abort("'getTempRet0' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "setTempRet0")) Module["setTempRet0"] = function() {
 abort("'setTempRet0' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "callMain")) Module["callMain"] = function() {
 abort("'callMain' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "abort")) Module["abort"] = function() {
 abort("'abort' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "warnOnce")) Module["warnOnce"] = function() {
 abort("'warnOnce' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "stackSave")) Module["stackSave"] = function() {
 abort("'stackSave' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "stackRestore")) Module["stackRestore"] = function() {
 abort("'stackRestore' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

if (!Object.getOwnPropertyDescriptor(Module, "stackAlloc")) Module["stackAlloc"] = function() {
 abort("'stackAlloc' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
};

Module["writeStackCookie"] = writeStackCookie;

Module["checkStackCookie"] = checkStackCookie;

Module["abortStackOverflow"] = abortStackOverflow;

if (!Object.getOwnPropertyDescriptor(Module, "ALLOC_NORMAL")) Object.defineProperty(Module, "ALLOC_NORMAL", {
 configurable: true,
 get: function() {
  abort("'ALLOC_NORMAL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 }
});

if (!Object.getOwnPropertyDescriptor(Module, "ALLOC_STACK")) Object.defineProperty(Module, "ALLOC_STACK", {
 configurable: true,
 get: function() {
  abort("'ALLOC_STACK' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 }
});

if (!Object.getOwnPropertyDescriptor(Module, "ALLOC_DYNAMIC")) Object.defineProperty(Module, "ALLOC_DYNAMIC", {
 configurable: true,
 get: function() {
  abort("'ALLOC_DYNAMIC' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 }
});

if (!Object.getOwnPropertyDescriptor(Module, "ALLOC_NONE")) Object.defineProperty(Module, "ALLOC_NONE", {
 configurable: true,
 get: function() {
  abort("'ALLOC_NONE' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 }
});

if (!Object.getOwnPropertyDescriptor(Module, "calledRun")) Object.defineProperty(Module, "calledRun", {
 configurable: true,
 get: function() {
  abort("'calledRun' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
 }
});

var calledRun;

function ExitStatus(status) {
 this.name = "ExitStatus";
 this.message = "Program terminated with exit(" + status + ")";
 this.status = status;
}

var calledMain = false;

dependenciesFulfilled = function runCaller() {
 if (!calledRun) run();
 if (!calledRun) dependenciesFulfilled = runCaller;
};

function callMain(args) {
 assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on Module["onRuntimeInitialized"])');
 assert(__ATPRERUN__.length == 0, "cannot call main when preRun functions remain to be called");
 var entryFunction = Module["_main"];
 if (!entryFunction) return;
 args = args || [];
 var argc = args.length + 1;
 var argv = stackAlloc((argc + 1) * 4);
 HEAP32[argv >> 2] = allocateUTF8OnStack(thisProgram);
 for (var i = 1; i < argc; i++) {
  HEAP32[(argv >> 2) + i] = allocateUTF8OnStack(args[i - 1]);
 }
 HEAP32[(argv >> 2) + argc] = 0;
 try {
  Module["___set_stack_limit"](STACK_MAX);
  var ret = entryFunction(argc, argv);
  exit(ret, true);
 } catch (e) {
  if (e instanceof ExitStatus) {
   return;
  } else if (e == "unwind") {
   noExitRuntime = true;
   return;
  } else {
   var toLog = e;
   if (e && typeof e === "object" && e.stack) {
    toLog = [ e, e.stack ];
   }
   err("exception thrown: " + toLog);
   quit_(1, e);
  }
 } finally {
  calledMain = true;
 }
}

function run(args) {
 args = args || arguments_;
 if (runDependencies > 0) {
  return;
 }
 writeStackCookie();
 preRun();
 if (runDependencies > 0) return;
 function doRun() {
  if (calledRun) return;
  calledRun = true;
  if (ABORT) return;
  initRuntime();
  preMain();
  if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
  if (shouldRunNow) callMain(args);
  postRun();
 }
 if (Module["setStatus"]) {
  Module["setStatus"]("Running...");
  setTimeout(function() {
   setTimeout(function() {
    Module["setStatus"]("");
   }, 1);
   doRun();
  }, 1);
 } else {
  doRun();
 }
 checkStackCookie();
}

Module["run"] = run;

function checkUnflushedContent() {
 var print = out;
 var printErr = err;
 var has = false;
 out = err = function(x) {
  has = true;
 };
 try {
  var flush = Module["_fflush"];
  if (flush) flush(0);
  [ "stdout", "stderr" ].forEach(function(name) {
   var info = FS.analyzePath("/dev/" + name);
   if (!info) return;
   var stream = info.object;
   var rdev = stream.rdev;
   var tty = TTY.ttys[rdev];
   if (tty && tty.output && tty.output.length) {
    has = true;
   }
  });
 } catch (e) {}
 out = print;
 err = printErr;
 if (has) {
  warnOnce("stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the FAQ), or make sure to emit a newline when you printf etc.");
 }
}

function exit(status, implicit) {
 checkUnflushedContent();
 if (implicit && noExitRuntime && status === 0) {
  return;
 }
 if (noExitRuntime) {
  if (!implicit) {
   err("program exited (with status: " + status + "), but EXIT_RUNTIME is not set, so halting execution but not exiting the runtime or preventing further async execution (build with EXIT_RUNTIME=1, if you want a true shutdown)");
  }
 } else {
  ABORT = true;
  EXITSTATUS = status;
  exitRuntime();
  if (Module["onExit"]) Module["onExit"](status);
 }
 quit_(status, new ExitStatus(status));
}

if (Module["preInit"]) {
 if (typeof Module["preInit"] == "function") Module["preInit"] = [ Module["preInit"] ];
 while (Module["preInit"].length > 0) {
  Module["preInit"].pop()();
 }
}

var shouldRunNow = true;

if (Module["noInitialRun"]) shouldRunNow = false;

noExitRuntime = true;

run();
