// Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. See License.txt in the project root for license information.

;(function (undefined) {

  var objectTypes = {
    'function': true,
    'object': true
  };

  var
    freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports,
    freeSelf = objectTypes[typeof self] && self.Object && self,
    freeWindow = objectTypes[typeof window] && window && window.Object && window,
    freeModule = objectTypes[typeof module] && module && !module.nodeType && module,
    moduleExports = freeModule && freeModule.exports === freeExports && freeExports,
    freeGlobal = freeExports && freeModule && typeof global == 'object' && global && global.Object && global;

  var root = root = freeGlobal || ((freeWindow !== (this && this.window)) && freeWindow) || freeSelf || this;

  var Rx = {
    internals: {},
    config: {
      Promise: root.Promise
    },
    helpers: { }
  };

  // Defaults
  var noop = Rx.helpers.noop = function () { },
    identity = Rx.helpers.identity = function (x) { return x; },
    defaultNow = Rx.helpers.defaultNow = (function () { return !!Date.now ? Date.now : function () { return +new Date; }; }()),
    defaultComparer = Rx.helpers.defaultComparer = function (x, y) { return isEqual(x, y); },
    defaultSubComparer = Rx.helpers.defaultSubComparer = function (x, y) { return x > y ? 1 : (x < y ? -1 : 0); },
    defaultKeySerializer = Rx.helpers.defaultKeySerializer = function (x) { return x.toString(); },
    defaultError = Rx.helpers.defaultError = function (err) { throw err; },
    isPromise = Rx.helpers.isPromise = function (p) { return !!p && typeof p.subscribe !== 'function' && typeof p.then === 'function'; },
    isFunction = Rx.helpers.isFunction = (function () {
      var isFn = function (value) {
        return typeof value == 'function' || false;
      }

      // fallback for older versions of Chrome and Safari
      if (isFn(/x/)) {
        isFn = function(value) {
          return typeof value == 'function' && toString.call(value) == '[object Function]';
        };
      }
      return isFn;
    }());

    function cloneArray(arr) {
      var len = arr.length, a = new Array(len);
      for(var i = 0; i < len; i++) { a[i] = arr[i]; }
      return a;
    }

  var errorObj = {e: {}};
  var tryCatchTarget;
  function tryCatcher() {
    try {
      return tryCatchTarget.apply(this, arguments);
    } catch (e) {
      errorObj.e = e;
      return errorObj;
    }
  }
  function tryCatch(fn) {
    if (!isFunction(fn)) { throw new TypeError('fn must be a function'); }
    tryCatchTarget = fn;
    return tryCatcher;
  }
  function thrower(e) {
    throw e;
  }

  Rx.config.longStackSupport = false;
  var hasStacks = false, stacks = tryCatch(function () { throw new Error(); })();
  hasStacks = !!stacks.e && !!stacks.e.stack;

  // All code after this point will be filtered from stack traces reported by RxJS
  var rStartingLine = captureLine(), rFileName;

  var STACK_JUMP_SEPARATOR = 'From previous event:';

  function makeStackTraceLong(error, observable) {
    // If possible, transform the error stack trace by removing Node and RxJS
    // cruft, then concatenating with the stack trace of `observable`.
    if (hasStacks &&
        observable.stack &&
        typeof error === 'object' &&
        error !== null &&
        error.stack &&
        error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
    ) {
      var stacks = [];
      for (var o = observable; !!o; o = o.source) {
        if (o.stack) {
          stacks.unshift(o.stack);
        }
      }
      stacks.unshift(error.stack);

      var concatedStacks = stacks.join('\n' + STACK_JUMP_SEPARATOR + '\n');
      error.stack = filterStackString(concatedStacks);
    }
  }

  function filterStackString(stackString) {
    var lines = stackString.split('\n'), desiredLines = [];
    for (var i = 0, len = lines.length; i < len; i++) {
      var line = lines[i];

      if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
        desiredLines.push(line);
      }
    }
    return desiredLines.join('\n');
  }

  function isInternalFrame(stackLine) {
    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);
    if (!fileNameAndLineNumber) {
      return false;
    }
    var fileName = fileNameAndLineNumber[0], lineNumber = fileNameAndLineNumber[1];

    return fileName === rFileName &&
      lineNumber >= rStartingLine &&
      lineNumber <= rEndingLine;
  }

  function isNodeFrame(stackLine) {
    return stackLine.indexOf('(module.js:') !== -1 ||
      stackLine.indexOf('(node.js:') !== -1;
  }

  function captureLine() {
    if (!hasStacks) { return; }

    try {
      throw new Error();
    } catch (e) {
      var lines = e.stack.split('\n');
      var firstLine = lines[0].indexOf('@') > 0 ? lines[1] : lines[2];
      var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
      if (!fileNameAndLineNumber) { return; }

      rFileName = fileNameAndLineNumber[0];
      return fileNameAndLineNumber[1];
    }
  }

  function getFileNameAndLineNumber(stackLine) {
    // Named functions: 'at functionName (filename:lineNumber:columnNumber)'
    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
    if (attempt1) { return [attempt1[1], Number(attempt1[2])]; }

    // Anonymous functions: 'at filename:lineNumber:columnNumber'
    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
    if (attempt2) { return [attempt2[1], Number(attempt2[2])]; }

    // Firefox style: 'function@filename:lineNumber or @filename:lineNumber'
    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
    if (attempt3) { return [attempt3[1], Number(attempt3[2])]; }
  }

  var EmptyError = Rx.EmptyError = function() {
    this.message = 'Sequence contains no elements.';
    this.name = 'EmptyError';
    Error.call(this);
  };
  EmptyError.prototype = Object.create(Error.prototype);

  var ObjectDisposedError = Rx.ObjectDisposedError = function() {
    this.message = 'Object has been disposed';
    this.name = 'ObjectDisposedError';
    Error.call(this);
  };
  ObjectDisposedError.prototype = Object.create(Error.prototype);

  var ArgumentOutOfRangeError = Rx.ArgumentOutOfRangeError = function () {
    this.message = 'Argument out of range';
    this.name = 'ArgumentOutOfRangeError';
    Error.call(this);
  };
  ArgumentOutOfRangeError.prototype = Object.create(Error.prototype);

  var NotSupportedError = Rx.NotSupportedError = function (message) {
    this.message = message || 'This operation is not supported';
    this.name = 'NotSupportedError';
    Error.call(this);
  };
  NotSupportedError.prototype = Object.create(Error.prototype);

  var NotImplementedError = Rx.NotImplementedError = function (message) {
    this.message = message || 'This operation is not implemented';
    this.name = 'NotImplementedError';
    Error.call(this);
  };
  NotImplementedError.prototype = Object.create(Error.prototype);

  var notImplemented = Rx.helpers.notImplemented = function () {
    throw new NotImplementedError();
  };

  var notSupported = Rx.helpers.notSupported = function () {
    throw new NotSupportedError();
  };

  // Shim in iterator support
  var $iterator$ = (typeof Symbol === 'function' && Symbol.iterator) ||
    '_es6shim_iterator_';
  // Bug for mozilla version
  if (root.Set && typeof new root.Set()['@@iterator'] === 'function') {
    $iterator$ = '@@iterator';
  }

  var doneEnumerator = Rx.doneEnumerator = { done: true, value: undefined };

  var isIterable = Rx.helpers.isIterable = function (o) {
    return o[$iterator$] !== undefined;
  }

  var isArrayLike = Rx.helpers.isArrayLike = function (o) {
    return o && o.length !== undefined;
  }

  Rx.helpers.iterator = $iterator$;

  var bindCallback = Rx.internals.bindCallback = function (func, thisArg, argCount) {
    if (typeof thisArg === 'undefined') { return func; }
    switch(argCount) {
      case 0:
        return function() {
          return func.call(thisArg)
        };
      case 1:
        return function(arg) {
          return func.call(thisArg, arg);
        }
      case 2:
        return function(value, index) {
          return func.call(thisArg, value, index);
        };
      case 3:
        return function(value, index, collection) {
          return func.call(thisArg, value, index, collection);
        };
    }

    return function() {
      return func.apply(thisArg, arguments);
    };
  };

  /** Used to determine if values are of the language type Object */
  var dontEnums = ['toString',
    'toLocaleString',
    'valueOf',
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'constructor'],
  dontEnumsLength = dontEnums.length;

  /** `Object#toString` result shortcuts */
  var argsClass = '[object Arguments]',
    arrayClass = '[object Array]',
    boolClass = '[object Boolean]',
    dateClass = '[object Date]',
    errorClass = '[object Error]',
    funcClass = '[object Function]',
    numberClass = '[object Number]',
    objectClass = '[object Object]',
    regexpClass = '[object RegExp]',
    stringClass = '[object String]';

  var toString = Object.prototype.toString,
    hasOwnProperty = Object.prototype.hasOwnProperty,
    supportsArgsClass = toString.call(arguments) == argsClass, // For less <IE9 && FF<4
    supportNodeClass,
    errorProto = Error.prototype,
    objectProto = Object.prototype,
    stringProto = String.prototype,
    propertyIsEnumerable = objectProto.propertyIsEnumerable;

  try {
    supportNodeClass = !(toString.call(document) == objectClass && !({ 'toString': 0 } + ''));
  } catch (e) {
    supportNodeClass = true;
  }

  var nonEnumProps = {};
  nonEnumProps[arrayClass] = nonEnumProps[dateClass] = nonEnumProps[numberClass] = { 'constructor': true, 'toLocaleString': true, 'toString': true, 'valueOf': true };
  nonEnumProps[boolClass] = nonEnumProps[stringClass] = { 'constructor': true, 'toString': true, 'valueOf': true };
  nonEnumProps[errorClass] = nonEnumProps[funcClass] = nonEnumProps[regexpClass] = { 'constructor': true, 'toString': true };
  nonEnumProps[objectClass] = { 'constructor': true };

  var support = {};
  (function () {
    var ctor = function() { this.x = 1; },
      props = [];

    ctor.prototype = { 'valueOf': 1, 'y': 1 };
    for (var key in new ctor) { props.push(key); }
    for (key in arguments) { }

    // Detect if `name` or `message` properties of `Error.prototype` are enumerable by default.
    support.enumErrorProps = propertyIsEnumerable.call(errorProto, 'message') || propertyIsEnumerable.call(errorProto, 'name');

    // Detect if `prototype` properties are enumerable by default.
    support.enumPrototypes = propertyIsEnumerable.call(ctor, 'prototype');

    // Detect if `arguments` object indexes are non-enumerable
    support.nonEnumArgs = key != 0;

    // Detect if properties shadowing those on `Object.prototype` are non-enumerable.
    support.nonEnumShadows = !/valueOf/.test(props);
  }(1));

  var isObject = Rx.internals.isObject = function(value) {
    var type = typeof value;
    return value && (type == 'function' || type == 'object') || false;
  };

  function keysIn(object) {
    var result = [];
    if (!isObject(object)) {
      return result;
    }
    if (support.nonEnumArgs && object.length && isArguments(object)) {
      object = slice.call(object);
    }
    var skipProto = support.enumPrototypes && typeof object == 'function',
        skipErrorProps = support.enumErrorProps && (object === errorProto || object instanceof Error);

    for (var key in object) {
      if (!(skipProto && key == 'prototype') &&
          !(skipErrorProps && (key == 'message' || key == 'name'))) {
        result.push(key);
      }
    }

    if (support.nonEnumShadows && object !== objectProto) {
      var ctor = object.constructor,
          index = -1,
          length = dontEnumsLength;

      if (object === (ctor && ctor.prototype)) {
        var className = object === stringProto ? stringClass : object === errorProto ? errorClass : toString.call(object),
            nonEnum = nonEnumProps[className];
      }
      while (++index < length) {
        key = dontEnums[index];
        if (!(nonEnum && nonEnum[key]) && hasOwnProperty.call(object, key)) {
          result.push(key);
        }
      }
    }
    return result;
  }

  function internalFor(object, callback, keysFunc) {
    var index = -1,
      props = keysFunc(object),
      length = props.length;

    while (++index < length) {
      var key = props[index];
      if (callback(object[key], key, object) === false) {
        break;
      }
    }
    return object;
  }

  function internalForIn(object, callback) {
    return internalFor(object, callback, keysIn);
  }

  function isNode(value) {
    // IE < 9 presents DOM nodes as `Object` objects except they have `toString`
    // methods that are `typeof` "string" and still can coerce nodes to strings
    return typeof value.toString != 'function' && typeof (value + '') == 'string';
  }

  var isArguments = function(value) {
    return (value && typeof value == 'object') ? toString.call(value) == argsClass : false;
  }

  // fallback for browsers that can't detect `arguments` objects by [[Class]]
  if (!supportsArgsClass) {
    isArguments = function(value) {
      return (value && typeof value == 'object') ? hasOwnProperty.call(value, 'callee') : false;
    };
  }

  var isEqual = Rx.internals.isEqual = function (x, y) {
    return deepEquals(x, y, [], []);
  };

  /** @private
   * Used for deep comparison
   **/
  function deepEquals(a, b, stackA, stackB) {
    // exit early for identical values
    if (a === b) {
      // treat `+0` vs. `-0` as not equal
      return a !== 0 || (1 / a == 1 / b);
    }

    var type = typeof a,
        otherType = typeof b;

    // exit early for unlike primitive values
    if (a === a && (a == null || b == null ||
        (type != 'function' && type != 'object' && otherType != 'function' && otherType != 'object'))) {
      return false;
    }

    // compare [[Class]] names
    var className = toString.call(a),
        otherClass = toString.call(b);

    if (className == argsClass) {
      className = objectClass;
    }
    if (otherClass == argsClass) {
      otherClass = objectClass;
    }
    if (className != otherClass) {
      return false;
    }
    switch (className) {
      case boolClass:
      case dateClass:
        // coerce dates and booleans to numbers, dates to milliseconds and booleans
        // to `1` or `0` treating invalid dates coerced to `NaN` as not equal
        return +a == +b;

      case numberClass:
        // treat `NaN` vs. `NaN` as equal
        return (a != +a) ?
          b != +b :
          // but treat `-0` vs. `+0` as not equal
          (a == 0 ? (1 / a == 1 / b) : a == +b);

      case regexpClass:
      case stringClass:
        // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)
        // treat string primitives and their corresponding object instances as equal
        return a == String(b);
    }
    var isArr = className == arrayClass;
    if (!isArr) {

      // exit for functions and DOM nodes
      if (className != objectClass || (!support.nodeClass && (isNode(a) || isNode(b)))) {
        return false;
      }
      // in older versions of Opera, `arguments` objects have `Array` constructors
      var ctorA = !support.argsObject && isArguments(a) ? Object : a.constructor,
          ctorB = !support.argsObject && isArguments(b) ? Object : b.constructor;

      // non `Object` object instances with different constructors are not equal
      if (ctorA != ctorB &&
            !(hasOwnProperty.call(a, 'constructor') && hasOwnProperty.call(b, 'constructor')) &&
            !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&
            ('constructor' in a && 'constructor' in b)
          ) {
        return false;
      }
    }
    // assume cyclic structures are equal
    // the algorithm for detecting cyclic structures is adapted from ES 5.1
    // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)
    var initedStack = !stackA;
    stackA || (stackA = []);
    stackB || (stackB = []);

    var length = stackA.length;
    while (length--) {
      if (stackA[length] == a) {
        return stackB[length] == b;
      }
    }
    var size = 0;
    var result = true;

    // add `a` and `b` to the stack of traversed objects
    stackA.push(a);
    stackB.push(b);

    // recursively compare objects and arrays (susceptible to call stack limits)
    if (isArr) {
      // compare lengths to determine if a deep comparison is necessary
      length = a.length;
      size = b.length;
      result = size == length;

      if (result) {
        // deep compare the contents, ignoring non-numeric properties
        while (size--) {
          var index = length,
              value = b[size];

          if (!(result = deepEquals(a[size], value, stackA, stackB))) {
            break;
          }
        }
      }
    }
    else {
      // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
      // which, in this case, is more costly
      internalForIn(b, function(value, key, b) {
        if (hasOwnProperty.call(b, key)) {
          // count the number of properties.
          size++;
          // deep compare each property value.
          return (result = hasOwnProperty.call(a, key) && deepEquals(a[key], value, stackA, stackB));
        }
      });

      if (result) {
        // ensure both objects have the same number of properties
        internalForIn(a, function(value, key, a) {
          if (hasOwnProperty.call(a, key)) {
            // `size` will be `-1` if `a` has more properties than `b`
            return (result = --size > -1);
          }
        });
      }
    }
    stackA.pop();
    stackB.pop();

    return result;
  }

  var hasProp = {}.hasOwnProperty,
      slice = Array.prototype.slice;

  var inherits = Rx.internals.inherits = function (child, parent) {
    function __() { this.constructor = child; }
    __.prototype = parent.prototype;
    child.prototype = new __();
  };

  var addProperties = Rx.internals.addProperties = function (obj) {
    for(var sources = [], i = 1, len = arguments.length; i < len; i++) { sources.push(arguments[i]); }
    for (var idx = 0, ln = sources.length; idx < ln; idx++) {
      var source = sources[idx];
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    }
  };

  // Rx Utils
  var addRef = Rx.internals.addRef = function (xs, r) {
    return new AnonymousObservable(function (observer) {
      return new CompositeDisposable(r.getDisposable(), xs.subscribe(observer));
    });
  };

  function arrayInitialize(count, factory) {
    var a = new Array(count);
    for (var i = 0; i < count; i++) {
      a[i] = factory();
    }
    return a;
  }

  // Utilities
  var slice = Array.prototype.slice,
      toString = Object.prototype.toString;

  if (!Function.prototype.bind) {
    Function.prototype.bind = function (that) {
      var target = this,
        args = slice.call(arguments, 1);
      var bound = function () {
        if (this instanceof bound) {
          function F() { }
          F.prototype = target.prototype;
          var self = new F();
          var result = target.apply(self, args.concat(slice.call(arguments)));
          if (Object(result) === result) {
            return result;
          }
          return self;
        } else {
          return target.apply(that, args.concat(slice.call(arguments)));
        }
      };

      return bound;
    };
  }

  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (callback, thisArg) {
      var T, k;

      if (this == null) {
        throw new TypeError(' this is null or not defined');
      }

      var O = Object(this);
      var len = O.length >>> 0;

      if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
      }

      if (arguments.length > 1) {
        T = thisArg;
      }

      k = 0;
      while (k < len) {
        var kValue;
        if (k in O) {
          kValue = O[k];
          callback.call(T, kValue, k, O);
        }
        k++;
      }
    };
  }

  var boxedString = Object('a'),
      splitString = boxedString[0] !== 'a' || !(0 in boxedString);
  if (!Array.prototype.every) {
    Array.prototype.every = function every(fun /*, thisp */) {
      var object = Object(this),
        self = splitString && toString.call(this) === stringClass ?
          this.split('') :
          object,
        length = self.length >>> 0,
        thisp = arguments[1];

      if (toString.call(fun) !== funcClass) {
        throw new TypeError(fun + ' is not a function');
      }

      for (var i = 0; i < length; i++) {
        if (i in self && !fun.call(thisp, self[i], i, object)) {
          return false;
        }
      }
      return true;
    };
  }

  if (!Array.prototype.map) {
    Array.prototype.map = function map(fun /*, thisp*/) {
      var object = Object(this),
        self = splitString && toString.call(this) === stringClass ?
            this.split('') :
            object,
        length = self.length >>> 0,
        result = new Array(length),
        thisp = arguments[1];

      if (toString.call(fun) !== funcClass) {
        throw new TypeError(fun + ' is not a function');
      }

      for (var i = 0; i < length; i++) {
        if (i in self) {
          result[i] = fun.call(thisp, self[i], i, object);
        }
      }
      return result;
    };
  }

  if (!Array.prototype.filter) {
    Array.prototype.filter = function (predicate) {
      var results = [], item, t = new Object(this);
      for (var i = 0, len = t.length >>> 0; i < len; i++) {
        item = t[i];
        if (i in t && predicate.call(arguments[1], item, i, t)) {
          results.push(item);
        }
      }
      return results;
    };
  }

  if (!Array.isArray) {
    Array.isArray = function (arg) {
      return toString.call(arg) === arrayClass;
    };
  }

  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function indexOf(searchElement) {
      var t = Object(this);
      var len = t.length >>> 0;
      if (len === 0) {
        return -1;
      }
      var n = 0;
      if (arguments.length > 1) {
        n = Number(arguments[1]);
        if (n !== n) {
          n = 0;
        } else if (n !== 0 && n !== Infinity && n !== -Infinity) {
          n = (n > 0 || -1) * Math.floor(Math.abs(n));
        }
      }
      if (n >= len) {
        return -1;
      }
      var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
      for (; k < len; k++) {
        if (k in t && t[k] === searchElement) {
          return k;
        }
      }
      return -1;
    };
  }

  // Fix for Tessel
  if (!Object.prototype.propertyIsEnumerable) {
    Object.prototype.propertyIsEnumerable = function (key) {
      for (var k in this) { if (k === key) { return true; } }
      return false;
    };
  }

  if (!Object.keys) {
    Object.keys = (function() {
      'use strict';
      var hasOwnProperty = Object.prototype.hasOwnProperty,
      hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString');

      return function(obj) {
        if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
          throw new TypeError('Object.keys called on non-object');
        }

        var result = [], prop, i;

        for (prop in obj) {
          if (hasOwnProperty.call(obj, prop)) {
            result.push(prop);
          }
        }

        if (hasDontEnumBug) {
          for (i = 0; i < dontEnumsLength; i++) {
            if (hasOwnProperty.call(obj, dontEnums[i])) {
              result.push(dontEnums[i]);
            }
          }
        }
        return result;
      };
    }());
  }

  if (typeof Object.create !== 'function') {
  // Production steps of ECMA-262, Edition 5, 15.2.3.5
  // Reference: http://es5.github.io/#x15.2.3.5
  Object.create = (function() {
    function Temp() {}

    var hasOwn = Object.prototype.hasOwnProperty;

    return function (O) {
      if (typeof O !== 'object') {
        throw new TypeError('Object prototype may only be an Object or null');
      }

      Temp.prototype = O;
      var obj = new Temp();
      Temp.prototype = null;

      if (arguments.length > 1) {
        // Object.defineProperties does ToObject on its first argument.
        var Properties = Object(arguments[1]);
        for (var prop in Properties) {
          if (hasOwn.call(Properties, prop)) {
            obj[prop] = Properties[prop];
          }
        }
      }

      // 5. Return obj
      return obj;
    };
  })();
}

  /**
   * Represents a group of disposable resources that are disposed together.
   * @constructor
   */
  var CompositeDisposable = Rx.CompositeDisposable = function () {
    var args = [], i, len;
    if (Array.isArray(arguments[0])) {
      args = arguments[0];
      len = args.length;
    } else {
      len = arguments.length;
      args = new Array(len);
      for(i = 0; i < len; i++) { args[i] = arguments[i]; }
    }
    for(i = 0; i < len; i++) {
      if (!isDisposable(args[i])) { throw new TypeError('Not a disposable'); }
    }
    this.disposables = args;
    this.isDisposed = false;
    this.length = args.length;
  };

  var CompositeDisposablePrototype = CompositeDisposable.prototype;

  /**
   * Adds a disposable to the CompositeDisposable or disposes the disposable if the CompositeDisposable is disposed.
   * @param {Mixed} item Disposable to add.
   */
  CompositeDisposablePrototype.add = function (item) {
    if (this.isDisposed) {
      item.dispose();
    } else {
      this.disposables.push(item);
      this.length++;
    }
  };

  /**
   * Removes and disposes the first occurrence of a disposable from the CompositeDisposable.
   * @param {Mixed} item Disposable to remove.
   * @returns {Boolean} true if found; false otherwise.
   */
  CompositeDisposablePrototype.remove = function (item) {
    var shouldDispose = false;
    if (!this.isDisposed) {
      var idx = this.disposables.indexOf(item);
      if (idx !== -1) {
        shouldDispose = true;
        this.disposables.splice(idx, 1);
        this.length--;
        item.dispose();
      }
    }
    return shouldDispose;
  };

  /**
   *  Disposes all disposables in the group and removes them from the group.
   */
  CompositeDisposablePrototype.dispose = function () {
    if (!this.isDisposed) {
      this.isDisposed = true;
      var len = this.disposables.length, currentDisposables = new Array(len);
      for(var i = 0; i < len; i++) { currentDisposables[i] = this.disposables[i]; }
      this.disposables = [];
      this.length = 0;

      for (i = 0; i < len; i++) {
        currentDisposables[i].dispose();
      }
    }
  };

  /**
   * Provides a set of static methods for creating Disposables.
   * @param {Function} dispose Action to run during the first call to dispose. The action is guaranteed to be run at most once.
   */
  var Disposable = Rx.Disposable = function (action) {
    this.isDisposed = false;
    this.action = action || noop;
  };

  /** Performs the task of cleaning up resources. */
  Disposable.prototype.dispose = function () {
    if (!this.isDisposed) {
      this.action();
      this.isDisposed = true;
    }
  };

  /**
   * Creates a disposable object that invokes the specified action when disposed.
   * @param {Function} dispose Action to run during the first call to dispose. The action is guaranteed to be run at most once.
   * @return {Disposable} The disposable object that runs the given action upon disposal.
   */
  var disposableCreate = Disposable.create = function (action) { return new Disposable(action); };

  /**
   * Gets the disposable that does nothing when disposed.
   */
  var disposableEmpty = Disposable.empty = { dispose: noop };

  /**
   * Validates whether the given object is a disposable
   * @param {Object} Object to test whether it has a dispose method
   * @returns {Boolean} true if a disposable object, else false.
   */
  var isDisposable = Disposable.isDisposable = function (d) {
    return d && isFunction(d.dispose);
  };

  var checkDisposed = Disposable.checkDisposed = function (disposable) {
    if (disposable.isDisposed) { throw new ObjectDisposedError(); }
  };

  // Single assignment
  var SingleAssignmentDisposable = Rx.SingleAssignmentDisposable = function () {
    this.isDisposed = false;
    this.current = null;
  };
  SingleAssignmentDisposable.prototype.getDisposable = function () {
    return this.current;
  };
  SingleAssignmentDisposable.prototype.setDisposable = function (value) {
    if (this.current) { throw new Error('Disposable has already been assigned'); }
    var shouldDispose = this.isDisposed;
    !shouldDispose && (this.current = value);
    shouldDispose && value && value.dispose();
  };
  SingleAssignmentDisposable.prototype.dispose = function () {
    if (!this.isDisposed) {
      this.isDisposed = true;
      var old = this.current;
      this.current = null;
    }
    old && old.dispose();
  };

  // Multiple assignment disposable
  var SerialDisposable = Rx.SerialDisposable = function () {
    this.isDisposed = false;
    this.current = null;
  };
  SerialDisposable.prototype.getDisposable = function () {
    return this.current;
  };
  SerialDisposable.prototype.setDisposable = function (value) {
    var shouldDispose = this.isDisposed;
    if (!shouldDispose) {
      var old = this.current;
      this.current = value;
    }
    old && old.dispose();
    shouldDispose && value && value.dispose();
  };
  SerialDisposable.prototype.dispose = function () {
    if (!this.isDisposed) {
      this.isDisposed = true;
      var old = this.current;
      this.current = null;
    }
    old && old.dispose();
  };

  /**
   * Represents a disposable resource that only disposes its underlying disposable resource when all dependent disposable objects have been disposed.
   */
  var RefCountDisposable = Rx.RefCountDisposable = (function () {

    function InnerDisposable(disposable) {
      this.disposable = disposable;
      this.disposable.count++;
      this.isInnerDisposed = false;
    }

    InnerDisposable.prototype.dispose = function () {
      if (!this.disposable.isDisposed && !this.isInnerDisposed) {
        this.isInnerDisposed = true;
        this.disposable.count--;
        if (this.disposable.count === 0 && this.disposable.isPrimaryDisposed) {
          this.disposable.isDisposed = true;
          this.disposable.underlyingDisposable.dispose();
        }
      }
    };

    /**
     * Initializes a new instance of the RefCountDisposable with the specified disposable.
     * @constructor
     * @param {Disposable} disposable Underlying disposable.
      */
    function RefCountDisposable(disposable) {
      this.underlyingDisposable = disposable;
      this.isDisposed = false;
      this.isPrimaryDisposed = false;
      this.count = 0;
    }

    /**
     * Disposes the underlying disposable only when all dependent disposables have been disposed
     */
    RefCountDisposable.prototype.dispose = function () {
      if (!this.isDisposed && !this.isPrimaryDisposed) {
        this.isPrimaryDisposed = true;
        if (this.count === 0) {
          this.isDisposed = true;
          this.underlyingDisposable.dispose();
        }
      }
    };

    /**
     * Returns a dependent disposable that when disposed decreases the refcount on the underlying disposable.
     * @returns {Disposable} A dependent disposable contributing to the reference count that manages the underlying disposable's lifetime.
     */
    RefCountDisposable.prototype.getDisposable = function () {
      return this.isDisposed ? disposableEmpty : new InnerDisposable(this);
    };

    return RefCountDisposable;
  })();

  function ScheduledDisposable(scheduler, disposable) {
    this.scheduler = scheduler;
    this.disposable = disposable;
    this.isDisposed = false;
  }

  function scheduleItem(s, self) {
    if (!self.isDisposed) {
      self.isDisposed = true;
      self.disposable.dispose();
    }
  }

  ScheduledDisposable.prototype.dispose = function () {
    this.scheduler.scheduleWithState(this, scheduleItem);
  };

  var ScheduledItem = Rx.internals.ScheduledItem = function (scheduler, state, action, dueTime, comparer) {
    this.scheduler = scheduler;
    this.state = state;
    this.action = action;
    this.dueTime = dueTime;
    this.comparer = comparer || defaultSubComparer;
    this.disposable = new SingleAssignmentDisposable();
  }

  ScheduledItem.prototype.invoke = function () {
    this.disposable.setDisposable(this.invokeCore());
  };

  ScheduledItem.prototype.compareTo = function (other) {
    return this.comparer(this.dueTime, other.dueTime);
  };

  ScheduledItem.prototype.isCancelled = function () {
    return this.disposable.isDisposed;
  };

  ScheduledItem.prototype.invokeCore = function () {
    return this.action(this.scheduler, this.state);
  };

  /** Provides a set of static properties to access commonly used schedulers. */
  var Scheduler = Rx.Scheduler = (function () {

    function Scheduler(now, schedule, scheduleRelative, scheduleAbsolute) {
      this.now = now;
      this._schedule = schedule;
      this._scheduleRelative = scheduleRelative;
      this._scheduleAbsolute = scheduleAbsolute;
    }

    /** Determines whether the given object is a scheduler */
    Scheduler.isScheduler = function (s) {
      return s instanceof Scheduler;
    }

    function invokeAction(scheduler, action) {
      action();
      return disposableEmpty;
    }

    var schedulerProto = Scheduler.prototype;

    /**
     * Schedules an action to be executed.
     * @param {Function} action Action to execute.
     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
     */
    schedulerProto.schedule = function (action) {
      return this._schedule(action, invokeAction);
    };

    /**
     * Schedules an action to be executed.
     * @param state State passed to the action to be executed.
     * @param {Function} action Action to be executed.
     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
     */
    schedulerProto.scheduleWithState = function (state, action) {
      return this._schedule(state, action);
    };

    /**
     * Schedules an action to be executed after the specified relative due time.
     * @param {Function} action Action to execute.
     * @param {Number} dueTime Relative time after which to execute the action.
     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
     */
    schedulerProto.scheduleWithRelative = function (dueTime, action) {
      return this._scheduleRelative(action, dueTime, invokeAction);
    };

    /**
     * Schedules an action to be executed after dueTime.
     * @param state State passed to the action to be executed.
     * @param {Function} action Action to be executed.
     * @param {Number} dueTime Relative time after which to execute the action.
     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
     */
    schedulerProto.scheduleWithRelativeAndState = function (state, dueTime, action) {
      return this._scheduleRelative(state, dueTime, action);
    };

    /**
     * Schedules an action to be executed at the specified absolute due time.
     * @param {Function} action Action to execute.
     * @param {Number} dueTime Absolute time at which to execute the action.
     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
      */
    schedulerProto.scheduleWithAbsolute = function (dueTime, action) {
      return this._scheduleAbsolute(action, dueTime, invokeAction);
    };

    /**
     * Schedules an action to be executed at dueTime.
     * @param {Mixed} state State passed to the action to be executed.
     * @param {Function} action Action to be executed.
     * @param {Number}dueTime Absolute time at which to execute the action.
     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
     */
    schedulerProto.scheduleWithAbsoluteAndState = function (state, dueTime, action) {
      return this._scheduleAbsolute(state, dueTime, action);
    };

    /** Gets the current time according to the local machine's system clock. */
    Scheduler.now = defaultNow;

    /**
     * Normalizes the specified TimeSpan value to a positive value.
     * @param {Number} timeSpan The time span value to normalize.
     * @returns {Number} The specified TimeSpan value if it is zero or positive; otherwise, 0
     */
    Scheduler.normalize = function (timeSpan) {
      timeSpan < 0 && (timeSpan = 0);
      return timeSpan;
    };

    return Scheduler;
  }());

  var normalizeTime = Scheduler.normalize, isScheduler = Scheduler.isScheduler;

  (function (schedulerProto) {

    function invokeRecImmediate(scheduler, pair) {
      var state = pair[0], action = pair[1], group = new CompositeDisposable();
      action(state, innerAction);
      return group;

      function innerAction(state2) {
        var isAdded = false, isDone = false;

        var d = scheduler.scheduleWithState(state2, scheduleWork);
        if (!isDone) {
          group.add(d);
          isAdded = true;
        }

        function scheduleWork(_, state3) {
          if (isAdded) {
            group.remove(d);
          } else {
            isDone = true;
          }
          action(state3, innerAction);
          return disposableEmpty;
        }
      }
    }

    function invokeRecDate(scheduler, pair, method) {
      var state = pair[0], action = pair[1], group = new CompositeDisposable();
      action(state, innerAction);
      return group;

      function innerAction(state2, dueTime1) {
        var isAdded = false, isDone = false;

        var d = scheduler[method](state2, dueTime1, scheduleWork);
        if (!isDone) {
          group.add(d);
          isAdded = true;
        }

        function scheduleWork(_, state3) {
          if (isAdded) {
            group.remove(d);
          } else {
            isDone = true;
          }
          action(state3, innerAction);
          return disposableEmpty;
        }
      }
    }

    function invokeRecDateRelative(s, p) {
      return invokeRecDate(s, p, 'scheduleWithRelativeAndState');
    }

    function invokeRecDateAbsolute(s, p) {
      return invokeRecDate(s, p, 'scheduleWithAbsoluteAndState');
    }

    function scheduleInnerRecursive(action, self) {
      action(function(dt) { self(action, dt); });
    }

    /**
     * Schedules an action to be executed recursively.
     * @param {Function} action Action to execute recursively. The parameter passed to the action is used to trigger recursive scheduling of the action.
     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
     */
    schedulerProto.scheduleRecursive = function (action) {
      return this.scheduleRecursiveWithState(action, scheduleInnerRecursive);
    };

    /**
     * Schedules an action to be executed recursively.
     * @param {Mixed} state State passed to the action to be executed.
     * @param {Function} action Action to execute recursively. The last parameter passed to the action is used to trigger recursive scheduling of the action, passing in recursive invocation state.
     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
     */
    schedulerProto.scheduleRecursiveWithState = function (state, action) {
      return this.scheduleWithState([state, action], invokeRecImmediate);
    };

    /**
     * Schedules an action to be executed recursively after a specified relative due time.
     * @param {Function} action Action to execute recursively. The parameter passed to the action is used to trigger recursive scheduling of the action at the specified relative time.
     * @param {Number}dueTime Relative time after which to execute the action for the first time.
     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
     */
    schedulerProto.scheduleRecursiveWithRelative = function (dueTime, action) {
      return this.scheduleRecursiveWithRelativeAndState(action, dueTime, scheduleInnerRecursive);
    };

    /**
     * Schedules an action to be executed recursively after a specified relative due time.
     * @param {Mixed} state State passed to the action to be executed.
     * @param {Function} action Action to execute recursively. The last parameter passed to the action is used to trigger recursive scheduling of the action, passing in the recursive due time and invocation state.
     * @param {Number}dueTime Relative time after which to execute the action for the first time.
     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
     */
    schedulerProto.scheduleRecursiveWithRelativeAndState = function (state, dueTime, action) {
      return this._scheduleRelative([state, action], dueTime, invokeRecDateRelative);
    };

    /**
     * Schedules an action to be executed recursively at a specified absolute due time.
     * @param {Function} action Action to execute recursively. The parameter passed to the action is used to trigger recursive scheduling of the action at the specified absolute time.
     * @param {Number}dueTime Absolute time at which to execute the action for the first time.
     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
     */
    schedulerProto.scheduleRecursiveWithAbsolute = function (dueTime, action) {
      return this.scheduleRecursiveWithAbsoluteAndState(action, dueTime, scheduleInnerRecursive);
    };

    /**
     * Schedules an action to be executed recursively at a specified absolute due time.
     * @param {Mixed} state State passed to the action to be executed.
     * @param {Function} action Action to execute recursively. The last parameter passed to the action is used to trigger recursive scheduling of the action, passing in the recursive due time and invocation state.
     * @param {Number}dueTime Absolute time at which to execute the action for the first time.
     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
     */
    schedulerProto.scheduleRecursiveWithAbsoluteAndState = function (state, dueTime, action) {
      return this._scheduleAbsolute([state, action], dueTime, invokeRecDateAbsolute);
    };
  }(Scheduler.prototype));

  (function (schedulerProto) {

    /**
     * Schedules a periodic piece of work by dynamically discovering the scheduler's capabilities. The periodic task will be scheduled using window.setInterval for the base implementation.
     * @param {Number} period Period for running the work periodically.
     * @param {Function} action Action to be executed.
     * @returns {Disposable} The disposable object used to cancel the scheduled recurring action (best effort).
     */
    Scheduler.prototype.schedulePeriodic = function (period, action) {
      return this.schedulePeriodicWithState(null, period, action);
    };

    /**
     * Schedules a periodic piece of work by dynamically discovering the scheduler's capabilities. The periodic task will be scheduled using window.setInterval for the base implementation.
     * @param {Mixed} state Initial state passed to the action upon the first iteration.
     * @param {Number} period Period for running the work periodically.
     * @param {Function} action Action to be executed, potentially updating the state.
     * @returns {Disposable} The disposable object used to cancel the scheduled recurring action (best effort).
     */
    Scheduler.prototype.schedulePeriodicWithState = function(state, period, action) {
      if (typeof root.setInterval === 'undefined') { throw new NotSupportedError(); }
      period = normalizeTime(period);
      var s = state, id = root.setInterval(function () { s = action(s); }, period);
      return disposableCreate(function () { root.clearInterval(id); });
    };

  }(Scheduler.prototype));

  (function (schedulerProto) {
    /**
     * Returns a scheduler that wraps the original scheduler, adding exception handling for scheduled actions.
     * @param {Function} handler Handler that's run if an exception is caught. The exception will be rethrown if the handler returns false.
     * @returns {Scheduler} Wrapper around the original scheduler, enforcing exception handling.
     */
    schedulerProto.catchError = schedulerProto['catch'] = function (handler) {
      return new CatchScheduler(this, handler);
    };
  }(Scheduler.prototype));

  var SchedulePeriodicRecursive = Rx.internals.SchedulePeriodicRecursive = (function () {
    function tick(command, recurse) {
      recurse(0, this._period);
      try {
        this._state = this._action(this._state);
      } catch (e) {
        this._cancel.dispose();
        throw e;
      }
    }

    function SchedulePeriodicRecursive(scheduler, state, period, action) {
      this._scheduler = scheduler;
      this._state = state;
      this._period = period;
      this._action = action;
    }

    SchedulePeriodicRecursive.prototype.start = function () {
      var d = new SingleAssignmentDisposable();
      this._cancel = d;
      d.setDisposable(this._scheduler.scheduleRecursiveWithRelativeAndState(0, this._period, tick.bind(this)));

      return d;
    };

    return SchedulePeriodicRecursive;
  }());

  /** Gets a scheduler that schedules work immediately on the current thread. */
  var immediateScheduler = Scheduler.immediate = (function () {
    function scheduleNow(state, action) { return action(this, state); }
    return new Scheduler(defaultNow, scheduleNow, notSupported, notSupported);
  }());

  /**
   * Gets a scheduler that schedules work as soon as possible on the current thread.
   */
  var currentThreadScheduler = Scheduler.currentThread = (function () {
    var queue;

    function runTrampoline () {
      while (queue.length > 0) {
        var item = queue.shift();
        !item.isCancelled() && item.invoke();
      }
    }

    function scheduleNow(state, action) {
      var si = new ScheduledItem(this, state, action, this.now());

      if (!queue) {
        queue = [si];

        var result = tryCatch(runTrampoline)();
        queue = null;
        if (result === errorObj) { return thrower(result.e); }
      } else {
        queue.push(si);
      }
      return si.disposable;
    }

    var currentScheduler = new Scheduler(defaultNow, scheduleNow, notSupported, notSupported);
    currentScheduler.scheduleRequired = function () { return !queue; };

    return currentScheduler;
  }());

  var scheduleMethod, clearMethod;

  var localTimer = (function () {
    var localSetTimeout, localClearTimeout = noop;
    if (!!root.setTimeout) {
      localSetTimeout = root.setTimeout;
      localClearTimeout = root.clearTimeout;
    } else if (!!root.WScript) {
      localSetTimeout = function (fn, time) {
        root.WScript.Sleep(time);
        fn();
      };
    } else {
      throw new NotSupportedError();
    }

    return {
      setTimeout: localSetTimeout,
      clearTimeout: localClearTimeout
    };
  }());
  var localSetTimeout = localTimer.setTimeout,
    localClearTimeout = localTimer.clearTimeout;

  (function () {

    var nextHandle = 1, tasksByHandle = {}, currentlyRunning = false;

    clearMethod = function (handle) {
      delete tasksByHandle[handle];
    };

    function runTask(handle) {
      if (currentlyRunning) {
        localSetTimeout(function () { runTask(handle) }, 0);
      } else {
        var task = tasksByHandle[handle];
        if (task) {
          currentlyRunning = true;
          var result = tryCatch(task)();
          clearMethod(handle);
          currentlyRunning = false;
          if (result === errorObj) { return thrower(result.e); }
        }
      }
    }

    var reNative = RegExp('^' +
      String(toString)
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/toString| for [^\]]+/g, '.*?') + '$'
    );

    var setImmediate = typeof (setImmediate = freeGlobal && moduleExports && freeGlobal.setImmediate) == 'function' &&
      !reNative.test(setImmediate) && setImmediate;

    function postMessageSupported () {
      // Ensure not in a worker
      if (!root.postMessage || root.importScripts) { return false; }
      var isAsync = false, oldHandler = root.onmessage;
      // Test for async
      root.onmessage = function () { isAsync = true; };
      root.postMessage('', '*');
      root.onmessage = oldHandler;

      return isAsync;
    }

    // Use in order, setImmediate, nextTick, postMessage, MessageChannel, script readystatechanged, setTimeout
    if (isFunction(setImmediate)) {
      scheduleMethod = function (action) {
        var id = nextHandle++;
        tasksByHandle[id] = action;
        setImmediate(function () { runTask(id); });

        return id;
      };
    } else if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
      scheduleMethod = function (action) {
        var id = nextHandle++;
        tasksByHandle[id] = action;
        process.nextTick(function () { runTask(id); });

        return id;
      };
    } else if (postMessageSupported()) {
      var MSG_PREFIX = 'ms.rx.schedule' + Math.random();

      function onGlobalPostMessage(event) {
        // Only if we're a match to avoid any other global events
        if (typeof event.data === 'string' && event.data.substring(0, MSG_PREFIX.length) === MSG_PREFIX) {
          runTask(event.data.substring(MSG_PREFIX.length));
        }
      }

      if (root.addEventListener) {
        root.addEventListener('message', onGlobalPostMessage, false);
      } else if (root.attachEvent) {
        root.attachEvent('onmessage', onGlobalPostMessage);
      } else {
        root.onmessage = onGlobalPostMessage;
      }

      scheduleMethod = function (action) {
        var id = nextHandle++;
        tasksByHandle[id] = action;
        root.postMessage(MSG_PREFIX + currentId, '*');
        return id;
      };
    } else if (!!root.MessageChannel) {
      var channel = new root.MessageChannel();

      channel.port1.onmessage = function (e) { runTask(e.data); };

      scheduleMethod = function (action) {
        var id = nextHandle++;
        tasksByHandle[id] = action;
        channel.port2.postMessage(id);
        return id;
      };
    } else if ('document' in root && 'onreadystatechange' in root.document.createElement('script')) {

      scheduleMethod = function (action) {
        var scriptElement = root.document.createElement('script');
        var id = nextHandle++;
        tasksByHandle[id] = action;

        scriptElement.onreadystatechange = function () {
          runTask(id);
          scriptElement.onreadystatechange = null;
          scriptElement.parentNode.removeChild(scriptElement);
          scriptElement = null;
        };
        root.document.documentElement.appendChild(scriptElement);
        return id;
      };

    } else {
      scheduleMethod = function (action) {
        var id = nextHandle++;
        tasksByHandle[id] = action;
        localSetTimeout(function () {
          runTask(id);
        }, 0);

        return id;
      };
    }
  }());

  /**
   * Gets a scheduler that schedules work via a timed callback based upon platform.
   */
  var timeoutScheduler = Scheduler.timeout = Scheduler['default'] = (function () {

    function scheduleNow(state, action) {
      var scheduler = this, disposable = new SingleAssignmentDisposable();
      var id = scheduleMethod(function () {
        !disposable.isDisposed && disposable.setDisposable(action(scheduler, state));
      });
      return new CompositeDisposable(disposable, disposableCreate(function () {
        clearMethod(id);
      }));
    }

    function scheduleRelative(state, dueTime, action) {
      var scheduler = this, dt = Scheduler.normalize(dueTime), disposable = new SingleAssignmentDisposable();
      if (dt === 0) { return scheduler.scheduleWithState(state, action); }
      var id = localSetTimeout(function () {
        !disposable.isDisposed && disposable.setDisposable(action(scheduler, state));
      }, dt);
      return new CompositeDisposable(disposable, disposableCreate(function () {
        localClearTimeout(id);
      }));
    }

    function scheduleAbsolute(state, dueTime, action) {
      return this.scheduleWithRelativeAndState(state, dueTime - this.now(), action);
    }

    return new Scheduler(defaultNow, scheduleNow, scheduleRelative, scheduleAbsolute);
  })();

  var CatchScheduler = (function (__super__) {

    function scheduleNow(state, action) {
      return this._scheduler.scheduleWithState(state, this._wrap(action));
    }

    function scheduleRelative(state, dueTime, action) {
      return this._scheduler.scheduleWithRelativeAndState(state, dueTime, this._wrap(action));
    }

    function scheduleAbsolute(state, dueTime, action) {
      return this._scheduler.scheduleWithAbsoluteAndState(state, dueTime, this._wrap(action));
    }

    inherits(CatchScheduler, __super__);

    function CatchScheduler(scheduler, handler) {
      this._scheduler = scheduler;
      this._handler = handler;
      this._recursiveOriginal = null;
      this._recursiveWrapper = null;
      __super__.call(this, this._scheduler.now.bind(this._scheduler), scheduleNow, scheduleRelative, scheduleAbsolute);
    }

    CatchScheduler.prototype._clone = function (scheduler) {
        return new CatchScheduler(scheduler, this._handler);
    };

    CatchScheduler.prototype._wrap = function (action) {
      var parent = this;
      return function (self, state) {
        try {
          return action(parent._getRecursiveWrapper(self), state);
        } catch (e) {
          if (!parent._handler(e)) { throw e; }
          return disposableEmpty;
        }
      };
    };

    CatchScheduler.prototype._getRecursiveWrapper = function (scheduler) {
      if (this._recursiveOriginal !== scheduler) {
        this._recursiveOriginal = scheduler;
        var wrapper = this._clone(scheduler);
        wrapper._recursiveOriginal = scheduler;
        wrapper._recursiveWrapper = wrapper;
        this._recursiveWrapper = wrapper;
      }
      return this._recursiveWrapper;
    };

    CatchScheduler.prototype.schedulePeriodicWithState = function (state, period, action) {
      var self = this, failed = false, d = new SingleAssignmentDisposable();

      d.setDisposable(this._scheduler.schedulePeriodicWithState(state, period, function (state1) {
        if (failed) { return null; }
        try {
          return action(state1);
        } catch (e) {
          failed = true;
          if (!self._handler(e)) { throw e; }
          d.dispose();
          return null;
        }
      }));

      return d;
    };

    return CatchScheduler;
  }(Scheduler));

  /**
   *  Represents a notification to an observer.
   */
  var Notification = Rx.Notification = (function () {
    function Notification(kind, value, exception, accept, acceptObservable, toString) {
      this.kind = kind;
      this.value = value;
      this.exception = exception;
      this._accept = accept;
      this._acceptObservable = acceptObservable;
      this.toString = toString;
    }

    /**
     * Invokes the delegate corresponding to the notification or the observer's method corresponding to the notification and returns the produced result.
     *
     * @memberOf Notification
     * @param {Any} observerOrOnNext Delegate to invoke for an OnNext notification or Observer to invoke the notification on..
     * @param {Function} onError Delegate to invoke for an OnError notification.
     * @param {Function} onCompleted Delegate to invoke for an OnCompleted notification.
     * @returns {Any} Result produced by the observation.
     */
    Notification.prototype.accept = function (observerOrOnNext, onError, onCompleted) {
      return observerOrOnNext && typeof observerOrOnNext === 'object' ?
        this._acceptObservable(observerOrOnNext) :
        this._accept(observerOrOnNext, onError, onCompleted);
    };

    /**
     * Returns an observable sequence with a single notification.
     *
     * @memberOf Notifications
     * @param {Scheduler} [scheduler] Scheduler to send out the notification calls on.
     * @returns {Observable} The observable sequence that surfaces the behavior of the notification upon subscription.
     */
    Notification.prototype.toObservable = function (scheduler) {
      var self = this;
      isScheduler(scheduler) || (scheduler = immediateScheduler);
      return new AnonymousObservable(function (observer) {
        return scheduler.scheduleWithState(self, function (_, notification) {
          notification._acceptObservable(observer);
          notification.kind === 'N' && observer.onCompleted();
        });
      });
    };

    return Notification;
  })();

  /**
   * Creates an object that represents an OnNext notification to an observer.
   * @param {Any} value The value contained in the notification.
   * @returns {Notification} The OnNext notification containing the value.
   */
  var notificationCreateOnNext = Notification.createOnNext = (function () {
      function _accept(onNext) { return onNext(this.value); }
      function _acceptObservable(observer) { return observer.onNext(this.value); }
      function toString() { return 'OnNext(' + this.value + ')'; }

      return function (value) {
        return new Notification('N', value, null, _accept, _acceptObservable, toString);
      };
  }());

  /**
   * Creates an object that represents an OnError notification to an observer.
   * @param {Any} error The exception contained in the notification.
   * @returns {Notification} The OnError notification containing the exception.
   */
  var notificationCreateOnError = Notification.createOnError = (function () {
    function _accept (onNext, onError) { return onError(this.exception); }
    function _acceptObservable(observer) { return observer.onError(this.exception); }
    function toString () { return 'OnError(' + this.exception + ')'; }

    return function (e) {
      return new Notification('E', null, e, _accept, _acceptObservable, toString);
    };
  }());

  /**
   * Creates an object that represents an OnCompleted notification to an observer.
   * @returns {Notification} The OnCompleted notification.
   */
  var notificationCreateOnCompleted = Notification.createOnCompleted = (function () {
    function _accept (onNext, onError, onCompleted) { return onCompleted(); }
    function _acceptObservable(observer) { return observer.onCompleted(); }
    function toString () { return 'OnCompleted()'; }

    return function () {
      return new Notification('C', null, null, _accept, _acceptObservable, toString);
    };
  }());

  /**
   * Supports push-style iteration over an observable sequence.
   */
  var Observer = Rx.Observer = function () { };

  /**
   *  Creates a notification callback from an observer.
   * @returns The action that forwards its input notification to the underlying observer.
   */
  Observer.prototype.toNotifier = function () {
    var observer = this;
    return function (n) { return n.accept(observer); };
  };

  /**
   *  Hides the identity of an observer.
   * @returns An observer that hides the identity of the specified observer.
   */
  Observer.prototype.asObserver = function () {
    var self = this;
    return new AnonymousObserver(
      function (x) { self.onNext(x); },
      function (err) { self.onError(err); },
      function () { self.onCompleted(); });
  };

  /**
   *  Checks access to the observer for grammar violations. This includes checking for multiple OnError or OnCompleted calls, as well as reentrancy in any of the observer methods.
   *  If a violation is detected, an Error is thrown from the offending observer method call.
   * @returns An observer that checks callbacks invocations against the observer grammar and, if the checks pass, forwards those to the specified observer.
   */
  Observer.prototype.checked = function () { return new CheckedObserver(this); };

  /**
   *  Creates an observer from the specified OnNext, along with optional OnError, and OnCompleted actions.
   * @param {Function} [onNext] Observer's OnNext action implementation.
   * @param {Function} [onError] Observer's OnError action implementation.
   * @param {Function} [onCompleted] Observer's OnCompleted action implementation.
   * @returns {Observer} The observer object implemented using the given actions.
   */
  var observerCreate = Observer.create = function (onNext, onError, onCompleted) {
    onNext || (onNext = noop);
    onError || (onError = defaultError);
    onCompleted || (onCompleted = noop);
    return new AnonymousObserver(onNext, onError, onCompleted);
  };

  /**
   *  Creates an observer from a notification callback.
   *
   * @static
   * @memberOf Observer
   * @param {Function} handler Action that handles a notification.
   * @returns The observer object that invokes the specified handler using a notification corresponding to each message it receives.
   */
  Observer.fromNotifier = function (handler, thisArg) {
    var cb = bindCallback(handler, thisArg, 1);
    return new AnonymousObserver(function (x) {
      return cb(notificationCreateOnNext(x));
    }, function (e) {
      return cb(notificationCreateOnError(e));
    }, function () {
      return cb(notificationCreateOnCompleted());
    });
  };

  /**
   * Schedules the invocation of observer methods on the given scheduler.
   * @param {Scheduler} scheduler Scheduler to schedule observer messages on.
   * @returns {Observer} Observer whose messages are scheduled on the given scheduler.
   */
  Observer.prototype.notifyOn = function (scheduler) {
    return new ObserveOnObserver(scheduler, this);
  };

  Observer.prototype.makeSafe = function(disposable) {
    return new AnonymousSafeObserver(this._onNext, this._onError, this._onCompleted, disposable);
  };

  /**
   * Abstract base class for implementations of the Observer class.
   * This base class enforces the grammar of observers where OnError and OnCompleted are terminal messages.
   */
  var AbstractObserver = Rx.internals.AbstractObserver = (function (__super__) {
    inherits(AbstractObserver, __super__);

    /**
     * Creates a new observer in a non-stopped state.
     */
    function AbstractObserver() {
      this.isStopped = false;
    }

    // Must be implemented by other observers
    AbstractObserver.prototype.next = notImplemented;
    AbstractObserver.prototype.error = notImplemented;
    AbstractObserver.prototype.completed = notImplemented;

    /**
     * Notifies the observer of a new element in the sequence.
     * @param {Any} value Next element in the sequence.
     */
    AbstractObserver.prototype.onNext = function (value) {
      !this.isStopped && this.next(value);
    };

    /**
     * Notifies the observer that an exception has occurred.
     * @param {Any} error The error that has occurred.
     */
    AbstractObserver.prototype.onError = function (error) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.error(error);
      }
    };

    /**
     * Notifies the observer of the end of the sequence.
     */
    AbstractObserver.prototype.onCompleted = function () {
      if (!this.isStopped) {
        this.isStopped = true;
        this.completed();
      }
    };

    /**
     * Disposes the observer, causing it to transition to the stopped state.
     */
    AbstractObserver.prototype.dispose = function () { this.isStopped = true; };

    AbstractObserver.prototype.fail = function (e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.error(e);
        return true;
      }

      return false;
    };

    return AbstractObserver;
  }(Observer));

  /**
   * Class to create an Observer instance from delegate-based implementations of the on* methods.
   */
  var AnonymousObserver = Rx.AnonymousObserver = (function (__super__) {
    inherits(AnonymousObserver, __super__);

    /**
     * Creates an observer from the specified OnNext, OnError, and OnCompleted actions.
     * @param {Any} onNext Observer's OnNext action implementation.
     * @param {Any} onError Observer's OnError action implementation.
     * @param {Any} onCompleted Observer's OnCompleted action implementation.
     */
    function AnonymousObserver(onNext, onError, onCompleted) {
      __super__.call(this);
      this._onNext = onNext;
      this._onError = onError;
      this._onCompleted = onCompleted;
    }

    /**
     * Calls the onNext action.
     * @param {Any} value Next element in the sequence.
     */
    AnonymousObserver.prototype.next = function (value) {
      this._onNext(value);
    };

    /**
     * Calls the onError action.
     * @param {Any} error The error that has occurred.
     */
    AnonymousObserver.prototype.error = function (error) {
      this._onError(error);
    };

    /**
     *  Calls the onCompleted action.
     */
    AnonymousObserver.prototype.completed = function () {
      this._onCompleted();
    };

    return AnonymousObserver;
  }(AbstractObserver));

  var CheckedObserver = (function (__super__) {
    inherits(CheckedObserver, __super__);

    function CheckedObserver(observer) {
      __super__.call(this);
      this._observer = observer;
      this._state = 0; // 0 - idle, 1 - busy, 2 - done
    }

    var CheckedObserverPrototype = CheckedObserver.prototype;

    CheckedObserverPrototype.onNext = function (value) {
      this.checkAccess();
      var res = tryCatch(this._observer.onNext).call(this._observer, value);
      this._state = 0;
      res === errorObj && thrower(res.e);
    };

    CheckedObserverPrototype.onError = function (err) {
      this.checkAccess();
      var res = tryCatch(this._observer.onError).call(this._observer, err);
      this._state = 2;
      res === errorObj && thrower(res.e);
    };

    CheckedObserverPrototype.onCompleted = function () {
      this.checkAccess();
      var res = tryCatch(this._observer.onCompleted).call(this._observer);
      this._state = 2;
      res === errorObj && thrower(res.e);
    };

    CheckedObserverPrototype.checkAccess = function () {
      if (this._state === 1) { throw new Error('Re-entrancy detected'); }
      if (this._state === 2) { throw new Error('Observer completed'); }
      if (this._state === 0) { this._state = 1; }
    };

    return CheckedObserver;
  }(Observer));

  var ScheduledObserver = Rx.internals.ScheduledObserver = (function (__super__) {
    inherits(ScheduledObserver, __super__);

    function ScheduledObserver(scheduler, observer) {
      __super__.call(this);
      this.scheduler = scheduler;
      this.observer = observer;
      this.isAcquired = false;
      this.hasFaulted = false;
      this.queue = [];
      this.disposable = new SerialDisposable();
    }

    ScheduledObserver.prototype.next = function (value) {
      var self = this;
      this.queue.push(function () { self.observer.onNext(value); });
    };

    ScheduledObserver.prototype.error = function (e) {
      var self = this;
      this.queue.push(function () { self.observer.onError(e); });
    };

    ScheduledObserver.prototype.completed = function () {
      var self = this;
      this.queue.push(function () { self.observer.onCompleted(); });
    };

    ScheduledObserver.prototype.ensureActive = function () {
      var isOwner = false;
      if (!this.hasFaulted && this.queue.length > 0) {
        isOwner = !this.isAcquired;
        this.isAcquired = true;
      }
      if (isOwner) {
        this.disposable.setDisposable(this.scheduler.scheduleRecursiveWithState(this, function (parent, self) {
          var work;
          if (parent.queue.length > 0) {
            work = parent.queue.shift();
          } else {
            parent.isAcquired = false;
            return;
          }
          var res = tryCatch(work)();
          if (res === errorObj) {
            parent.queue = [];
            parent.hasFaulted = true;
            return thrower(res.e);
          }
          self(parent);
        }));
      }
    };

    ScheduledObserver.prototype.dispose = function () {
      __super__.prototype.dispose.call(this);
      this.disposable.dispose();
    };

    return ScheduledObserver;
  }(AbstractObserver));

  var ObserveOnObserver = (function (__super__) {
    inherits(ObserveOnObserver, __super__);

    function ObserveOnObserver(scheduler, observer, cancel) {
      __super__.call(this, scheduler, observer);
      this._cancel = cancel;
    }

    ObserveOnObserver.prototype.next = function (value) {
      __super__.prototype.next.call(this, value);
      this.ensureActive();
    };

    ObserveOnObserver.prototype.error = function (e) {
      __super__.prototype.error.call(this, e);
      this.ensureActive();
    };

    ObserveOnObserver.prototype.completed = function () {
      __super__.prototype.completed.call(this);
      this.ensureActive();
    };

    ObserveOnObserver.prototype.dispose = function () {
      __super__.prototype.dispose.call(this);
      this._cancel && this._cancel.dispose();
      this._cancel = null;
    };

    return ObserveOnObserver;
  })(ScheduledObserver);

  var observableProto;

  /**
   * Represents a push-style collection.
   */
  var Observable = Rx.Observable = (function () {

    function makeSubscribe(self, subscribe) {
      return function (o) {
        var oldOnError = o.onError;
        o.onError = function (e) {
          makeStackTraceLong(e, self);
          oldOnError.call(o, e);
        };

        return subscribe.call(self, o);
      };
    }

    function Observable(subscribe) {
      if (Rx.config.longStackSupport && hasStacks) {
        var e = tryCatch(thrower)(new Error()).e;
        this.stack = e.stack.substring(e.stack.indexOf('\n') + 1);
        this._subscribe = makeSubscribe(this, subscribe);
      } else {
        this._subscribe = subscribe;
      }
    }

    observableProto = Observable.prototype;

    /**
    * Determines whether the given object is an Observable
    * @param {Any} An object to determine whether it is an Observable
    * @returns {Boolean} true if an Observable, else false.
    */
    Observable.isObservable = function (o) {
      return o && isFunction(o.subscribe);
    }

    /**
     *  Subscribes an o to the observable sequence.
     *  @param {Mixed} [oOrOnNext] The object that is to receive notifications or an action to invoke for each element in the observable sequence.
     *  @param {Function} [onError] Action to invoke upon exceptional termination of the observable sequence.
     *  @param {Function} [onCompleted] Action to invoke upon graceful termination of the observable sequence.
     *  @returns {Diposable} A disposable handling the subscriptions and unsubscriptions.
     */
    observableProto.subscribe = observableProto.forEach = function (oOrOnNext, onError, onCompleted) {
      return this._subscribe(typeof oOrOnNext === 'object' ?
        oOrOnNext :
        observerCreate(oOrOnNext, onError, onCompleted));
    };

    /**
     * Subscribes to the next value in the sequence with an optional "this" argument.
     * @param {Function} onNext The function to invoke on each element in the observable sequence.
     * @param {Any} [thisArg] Object to use as this when executing callback.
     * @returns {Disposable} A disposable handling the subscriptions and unsubscriptions.
     */
    observableProto.subscribeOnNext = function (onNext, thisArg) {
      return this._subscribe(observerCreate(typeof thisArg !== 'undefined' ? function(x) { onNext.call(thisArg, x); } : onNext));
    };

    /**
     * Subscribes to an exceptional condition in the sequence with an optional "this" argument.
     * @param {Function} onError The function to invoke upon exceptional termination of the observable sequence.
     * @param {Any} [thisArg] Object to use as this when executing callback.
     * @returns {Disposable} A disposable handling the subscriptions and unsubscriptions.
     */
    observableProto.subscribeOnError = function (onError, thisArg) {
      return this._subscribe(observerCreate(null, typeof thisArg !== 'undefined' ? function(e) { onError.call(thisArg, e); } : onError));
    };

    /**
     * Subscribes to the next value in the sequence with an optional "this" argument.
     * @param {Function} onCompleted The function to invoke upon graceful termination of the observable sequence.
     * @param {Any} [thisArg] Object to use as this when executing callback.
     * @returns {Disposable} A disposable handling the subscriptions and unsubscriptions.
     */
    observableProto.subscribeOnCompleted = function (onCompleted, thisArg) {
      return this._subscribe(observerCreate(null, null, typeof thisArg !== 'undefined' ? function() { onCompleted.call(thisArg); } : onCompleted));
    };

    return Observable;
  })();

  var ObservableBase = Rx.ObservableBase = (function (__super__) {
    inherits(ObservableBase, __super__);

    function fixSubscriber(subscriber) {
      return subscriber && isFunction(subscriber.dispose) ? subscriber :
        isFunction(subscriber) ? disposableCreate(subscriber) : disposableEmpty;
    }

    function setDisposable(s, state) {
      var ado = state[0], self = state[1];
      var sub = tryCatch(self.subscribeCore).call(self, ado);

      if (sub === errorObj) {
        if(!ado.fail(errorObj.e)) { return thrower(errorObj.e); }
      }
      ado.setDisposable(fixSubscriber(sub));
    }

    function subscribe(observer) {
      var ado = new AutoDetachObserver(observer), state = [ado, this];

      if (currentThreadScheduler.scheduleRequired()) {
        currentThreadScheduler.scheduleWithState(state, setDisposable);
      } else {
        setDisposable(null, state);
      }
      return ado;
    }

    function ObservableBase() {
      __super__.call(this, subscribe);
    }

    ObservableBase.prototype.subscribeCore = notImplemented;

    return ObservableBase;
  }(Observable));

var FlatMapObservable = (function(__super__){

    inherits(FlatMapObservable, __super__);

    function FlatMapObservable(source, selector, resultSelector, thisArg) {
        this.resultSelector = Rx.helpers.isFunction(resultSelector) ?
            resultSelector : null;

        this.selector = Rx.internals.bindCallback(Rx.helpers.isFunction(selector) ? selector : function() { return selector; }, thisArg, 3);
        this.source = source;

        __super__.call(this);

    }

    FlatMapObservable.prototype.subscribeCore = function(o) {
        return this.source.subscribe(new InnerObserver(o, this.selector, this.resultSelector, this));
    };

    function InnerObserver(observer, selector, resultSelector, source) {
        this.i = 0;
        this.selector = selector;
        this.resultSelector = resultSelector;
        this.source = source;
        this.isStopped = false;
        this.o = observer;
    }

    InnerObserver.prototype._wrapResult = function(result, x, i) {
        return this.resultSelector ?
            result.map(function(y, i2) { return this.resultSelector(x, y, i, i2); }, this) :
            result;
    };

    InnerObserver.prototype.onNext = function(x) {

        if (this.isStopped) return;

        var i = this.i++;
        var result = tryCatch(this.selector)(x, i, this.source);

        if (result === errorObj) {
            return this.o.onError(result.e);
        }

        Rx.helpers.isPromise(result) && (result = Rx.Observable.fromPromise(result));
        (Rx.helpers.isArrayLike(result) || Rx.helpers.isIterable(result)) && (result = Rx.Observable.from(result));

        this.o.onNext(this._wrapResult(result, x, i));

    };

    InnerObserver.prototype.onError = function(e) {
        if(!this.isStopped) { this.isStopped = true; this.o.onError(e); }
    };

    InnerObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {this.isStopped = true; this.o.onCompleted(); }
    };

    return FlatMapObservable;

}(ObservableBase));

  var Enumerable = Rx.internals.Enumerable = function () { };

  var ConcatEnumerableObservable = (function(__super__) {
    inherits(ConcatEnumerableObservable, __super__);
    function ConcatEnumerableObservable(sources) {
      this.sources = sources;
      __super__.call(this);
    }
    
    ConcatEnumerableObservable.prototype.subscribeCore = function (o) {
      var isDisposed, subscription = new SerialDisposable();
      var cancelable = immediateScheduler.scheduleRecursiveWithState(this.sources[$iterator$](), function (e, self) {
        if (isDisposed) { return; }
        var currentItem = tryCatch(e.next).call(e);
        if (currentItem === errorObj) { return o.onError(currentItem.e); }

        if (currentItem.done) {
          return o.onCompleted();
        }

        // Check if promise
        var currentValue = currentItem.value;
        isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));

        var d = new SingleAssignmentDisposable();
        subscription.setDisposable(d);
        d.setDisposable(currentValue.subscribe(new InnerObserver(o, self, e)));
      });

      return new CompositeDisposable(subscription, cancelable, disposableCreate(function () {
        isDisposed = true;
      }));
    };
    
    function InnerObserver(o, s, e) {
      this.o = o;
      this.s = s;
      this.e = e;
      this.isStopped = false;
    }
    InnerObserver.prototype.onNext = function (x) { if(!this.isStopped) { this.o.onNext(x); } };
    InnerObserver.prototype.onError = function (err) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.o.onError(err);
      }
    };
    InnerObserver.prototype.onCompleted = function () {
      if (!this.isStopped) {
        this.isStopped = true;
        this.s(this.e);
      }
    };
    InnerObserver.prototype.dispose = function () { this.isStopped = true; };
    InnerObserver.prototype.fail = function (err) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.o.onError(err);
        return true;
      }
      return false;
    };
    
    return ConcatEnumerableObservable;
  }(ObservableBase));

  Enumerable.prototype.concat = function () {
    return new ConcatEnumerableObservable(this);
  };
  
  var CatchErrorObservable = (function(__super__) {
    inherits(CatchErrorObservable, __super__);
    function CatchErrorObservable(sources) {
      this.sources = sources;
      __super__.call(this);
    }
    
    CatchErrorObservable.prototype.subscribeCore = function (o) {
      var e = this.sources[$iterator$]();

      var isDisposed, subscription = new SerialDisposable();
      var cancelable = immediateScheduler.scheduleRecursiveWithState(null, function (lastException, self) {
        if (isDisposed) { return; }
        var currentItem = tryCatch(e.next).call(e);
        if (currentItem === errorObj) { return o.onError(currentItem.e); }

        if (currentItem.done) {
          return lastException !== null ? o.onError(lastException) : o.onCompleted();
        }

        // Check if promise
        var currentValue = currentItem.value;
        isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));

        var d = new SingleAssignmentDisposable();
        subscription.setDisposable(d);
        d.setDisposable(currentValue.subscribe(
          function(x) { o.onNext(x); },
          self,
          function() { o.onCompleted(); }));
      });
      return new CompositeDisposable(subscription, cancelable, disposableCreate(function () {
        isDisposed = true;
      }));
    };
    
    return CatchErrorObservable;
  }(ObservableBase));

  Enumerable.prototype.catchError = function () {
    return new CatchErrorObservable(this);
  };

  Enumerable.prototype.catchErrorWhen = function (notificationHandler) {
    var sources = this;
    return new AnonymousObservable(function (o) {
      var exceptions = new Subject(),
        notifier = new Subject(),
        handled = notificationHandler(exceptions),
        notificationDisposable = handled.subscribe(notifier);

      var e = sources[$iterator$]();

      var isDisposed,
        lastException,
        subscription = new SerialDisposable();
      var cancelable = immediateScheduler.scheduleRecursive(function (self) {
        if (isDisposed) { return; }
        var currentItem = tryCatch(e.next).call(e);
        if (currentItem === errorObj) { return o.onError(currentItem.e); }

        if (currentItem.done) {
          if (lastException) {
            o.onError(lastException);
          } else {
            o.onCompleted();
          }
          return;
        }

        // Check if promise
        var currentValue = currentItem.value;
        isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));

        var outer = new SingleAssignmentDisposable();
        var inner = new SingleAssignmentDisposable();
        subscription.setDisposable(new CompositeDisposable(inner, outer));
        outer.setDisposable(currentValue.subscribe(
          function(x) { o.onNext(x); },
          function (exn) {
            inner.setDisposable(notifier.subscribe(self, function(ex) {
              o.onError(ex);
            }, function() {
              o.onCompleted();
            }));

            exceptions.onNext(exn);
          },
          function() { o.onCompleted(); }));
      });

      return new CompositeDisposable(notificationDisposable, subscription, cancelable, disposableCreate(function () {
        isDisposed = true;
      }));
    });
  };
  
  var RepeatEnumerable = (function (__super__) {
    inherits(RepeatEnumerable, __super__);
    
    function RepeatEnumerable(v, c) {
      this.v = v;
      this.c = c == null ? -1 : c;
    }
    RepeatEnumerable.prototype[$iterator$] = function () {
      return new RepeatEnumerator(this); 
    };
    
    function RepeatEnumerator(p) {
      this.v = p.v;
      this.l = p.c;
    }
    RepeatEnumerator.prototype.next = function () {
      if (this.l === 0) { return doneEnumerator; }
      if (this.l > 0) { this.l--; }
      return { done: false, value: this.v }; 
    };
    
    return RepeatEnumerable;
  }(Enumerable));

  var enumerableRepeat = Enumerable.repeat = function (value, repeatCount) {
    return new RepeatEnumerable(value, repeatCount);
  };
  
  var OfEnumerable = (function(__super__) {
    inherits(OfEnumerable, __super__);
    function OfEnumerable(s, fn, thisArg) {
      this.s = s;
      this.fn = fn ? bindCallback(fn, thisArg, 3) : null;
    }
    OfEnumerable.prototype[$iterator$] = function () {
      return new OfEnumerator(this);
    };
    
    function OfEnumerator(p) {
      this.i = -1;
      this.s = p.s;
      this.l = this.s.length;
      this.fn = p.fn;
    }
    OfEnumerator.prototype.next = function () {
     return ++this.i < this.l ?
       { done: false, value: !this.fn ? this.s[this.i] : this.fn(this.s[this.i], this.i, this.s) } :
       doneEnumerator; 
    };
    
    return OfEnumerable;
  }(Enumerable));

  var enumerableOf = Enumerable.of = function (source, selector, thisArg) {
    return new OfEnumerable(source, selector, thisArg);
  };

   /**
   *  Wraps the source sequence in order to run its observer callbacks on the specified scheduler.
   *
   *  This only invokes observer callbacks on a scheduler. In case the subscription and/or unsubscription actions have side-effects
   *  that require to be run on a scheduler, use subscribeOn.
   *
   *  @param {Scheduler} scheduler Scheduler to notify observers on.
   *  @returns {Observable} The source sequence whose observations happen on the specified scheduler.
   */
  observableProto.observeOn = function (scheduler) {
    var source = this;
    return new AnonymousObservable(function (observer) {
      return source.subscribe(new ObserveOnObserver(scheduler, observer));
    }, source);
  };

   /**
   *  Wraps the source sequence in order to run its subscription and unsubscription logic on the specified scheduler. This operation is not commonly used;
   *  see the remarks section for more information on the distinction between subscribeOn and observeOn.

   *  This only performs the side-effects of subscription and unsubscription on the specified scheduler. In order to invoke observer
   *  callbacks on a scheduler, use observeOn.

   *  @param {Scheduler} scheduler Scheduler to perform subscription and unsubscription actions on.
   *  @returns {Observable} The source sequence whose subscriptions and unsubscriptions happen on the specified scheduler.
   */
  observableProto.subscribeOn = function (scheduler) {
    var source = this;
    return new AnonymousObservable(function (observer) {
      var m = new SingleAssignmentDisposable(), d = new SerialDisposable();
      d.setDisposable(m);
      m.setDisposable(scheduler.schedule(function () {
        d.setDisposable(new ScheduledDisposable(scheduler, source.subscribe(observer)));
      }));
      return d;
    }, source);
  };

  var FromPromiseObservable = (function(__super__) {
    inherits(FromPromiseObservable, __super__);
    function FromPromiseObservable(p) {
      this.p = p;
      __super__.call(this);
    }

    FromPromiseObservable.prototype.subscribeCore = function(o) {
      this.p.then(function (data) {
        o.onNext(data);
        o.onCompleted();
      }, function (err) { o.onError(err); });
      return disposableEmpty;
    };

    return FromPromiseObservable;
  }(ObservableBase));

  /**
  * Converts a Promise to an Observable sequence
  * @param {Promise} An ES6 Compliant promise.
  * @returns {Observable} An Observable sequence which wraps the existing promise success and failure.
  */
  var observableFromPromise = Observable.fromPromise = function (promise) {
    return new FromPromiseObservable(promise);
  };
  /*
   * Converts an existing observable sequence to an ES6 Compatible Promise
   * @example
   * var promise = Rx.Observable.return(42).toPromise(RSVP.Promise);
   *
   * // With config
   * Rx.config.Promise = RSVP.Promise;
   * var promise = Rx.Observable.return(42).toPromise();
   * @param {Function} [promiseCtor] The constructor of the promise. If not provided, it looks for it in Rx.config.Promise.
   * @returns {Promise} An ES6 compatible promise with the last value from the observable sequence.
   */
  observableProto.toPromise = function (promiseCtor) {
    promiseCtor || (promiseCtor = Rx.config.Promise);
    if (!promiseCtor) { throw new NotSupportedError('Promise type not provided nor in Rx.config.Promise'); }
    var source = this;
    return new promiseCtor(function (resolve, reject) {
      // No cancellation can be done
      var value, hasValue = false;
      source.subscribe(function (v) {
        value = v;
        hasValue = true;
      }, reject, function () {
        hasValue && resolve(value);
      });
    });
  };

  var ToArrayObservable = (function(__super__) {
    inherits(ToArrayObservable, __super__);
    function ToArrayObservable(source) {
      this.source = source;
      __super__.call(this);
    }

    ToArrayObservable.prototype.subscribeCore = function(o) {
      return this.source.subscribe(new InnerObserver(o));
    };

    function InnerObserver(o) {
      this.o = o;
      this.a = [];
      this.isStopped = false;
    }
    InnerObserver.prototype.onNext = function (x) { if(!this.isStopped) { this.a.push(x); } };
    InnerObserver.prototype.onError = function (e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.o.onError(e);
      }
    };
    InnerObserver.prototype.onCompleted = function () {
      if (!this.isStopped) {
        this.isStopped = true;
        this.o.onNext(this.a);
        this.o.onCompleted();
      }
    };
    InnerObserver.prototype.dispose = function () { this.isStopped = true; }
    InnerObserver.prototype.fail = function (e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.o.onError(e);
        return true;
      }
 
      return false;
    };

    return ToArrayObservable;
  }(ObservableBase));

  /**
  * Creates an array from an observable sequence.
  * @returns {Observable} An observable sequence containing a single element with a list containing all the elements of the source sequence.
  */
  observableProto.toArray = function () {
    return new ToArrayObservable(this);
  };

  /**
   *  Creates an observable sequence from a specified subscribe method implementation.
   * @example
   *  var res = Rx.Observable.create(function (observer) { return function () { } );
   *  var res = Rx.Observable.create(function (observer) { return Rx.Disposable.empty; } );
   *  var res = Rx.Observable.create(function (observer) { } );
   * @param {Function} subscribe Implementation of the resulting observable sequence's subscribe method, returning a function that will be wrapped in a Disposable.
   * @returns {Observable} The observable sequence with the specified implementation for the Subscribe method.
   */
  Observable.create = function (subscribe, parent) {
    return new AnonymousObservable(subscribe, parent);
  };

  /**
   *  Returns an observable sequence that invokes the specified factory function whenever a new observer subscribes.
   *
   * @example
   *  var res = Rx.Observable.defer(function () { return Rx.Observable.fromArray([1,2,3]); });
   * @param {Function} observableFactory Observable factory function to invoke for each observer that subscribes to the resulting sequence or Promise.
   * @returns {Observable} An observable sequence whose observers trigger an invocation of the given observable factory function.
   */
  var observableDefer = Observable.defer = function (observableFactory) {
    return new AnonymousObservable(function (observer) {
      var result;
      try {
        result = observableFactory();
      } catch (e) {
        return observableThrow(e).subscribe(observer);
      }
      isPromise(result) && (result = observableFromPromise(result));
      return result.subscribe(observer);
    });
  };

  var EmptyObservable = (function(__super__) {
    inherits(EmptyObservable, __super__);
    function EmptyObservable(scheduler) {
      this.scheduler = scheduler;
      __super__.call(this);
    }

    EmptyObservable.prototype.subscribeCore = function (observer) {
      var sink = new EmptySink(observer, this.scheduler);
      return sink.run();
    };

    function EmptySink(observer, scheduler) {
      this.observer = observer;
      this.scheduler = scheduler;
    }

    function scheduleItem(s, state) {
      state.onCompleted();
      return disposableEmpty;
    }

    EmptySink.prototype.run = function () {
      return this.scheduler.scheduleWithState(this.observer, scheduleItem);
    };

    return EmptyObservable;
  }(ObservableBase));

  var EMPTY_OBSERVABLE = new EmptyObservable(immediateScheduler);

  /**
   *  Returns an empty observable sequence, using the specified scheduler to send out the single OnCompleted message.
   *
   * @example
   *  var res = Rx.Observable.empty();
   *  var res = Rx.Observable.empty(Rx.Scheduler.timeout);
   * @param {Scheduler} [scheduler] Scheduler to send the termination call on.
   * @returns {Observable} An observable sequence with no elements.
   */
  var observableEmpty = Observable.empty = function (scheduler) {
    isScheduler(scheduler) || (scheduler = immediateScheduler);
    return scheduler === immediateScheduler ? EMPTY_OBSERVABLE : new EmptyObservable(scheduler);
  };

  var FromObservable = (function(__super__) {
    inherits(FromObservable, __super__);
    function FromObservable(iterable, mapper, scheduler) {
      this.iterable = iterable;
      this.mapper = mapper;
      this.scheduler = scheduler;
      __super__.call(this);
    }

    FromObservable.prototype.subscribeCore = function (o) {
      var sink = new FromSink(o, this);
      return sink.run();
    };

    return FromObservable;
  }(ObservableBase));

  var FromSink = (function () {
    function FromSink(o, parent) {
      this.o = o;
      this.parent = parent;
    }

    FromSink.prototype.run = function () {
      var list = Object(this.parent.iterable),
          it = getIterable(list),
          o = this.o,
          mapper = this.parent.mapper;

      function loopRecursive(i, recurse) {
        var next = tryCatch(it.next).call(it);
        if (next === errorObj) { return o.onError(next.e); }
        if (next.done) { return o.onCompleted(); }

        var result = next.value;

        if (isFunction(mapper)) {
          result = tryCatch(mapper)(result, i);
          if (result === errorObj) { return o.onError(result.e); }
        }

        o.onNext(result);
        recurse(i + 1);
      }

      return this.parent.scheduler.scheduleRecursiveWithState(0, loopRecursive);
    };

    return FromSink;
  }());

  var maxSafeInteger = Math.pow(2, 53) - 1;

  function StringIterable(s) {
    this._s = s;
  }

  StringIterable.prototype[$iterator$] = function () {
    return new StringIterator(this._s);
  };

  function StringIterator(s) {
    this._s = s;
    this._l = s.length;
    this._i = 0;
  }

  StringIterator.prototype[$iterator$] = function () {
    return this;
  };

  StringIterator.prototype.next = function () {
    return this._i < this._l ? { done: false, value: this._s.charAt(this._i++) } : doneEnumerator;
  };

  function ArrayIterable(a) {
    this._a = a;
  }

  ArrayIterable.prototype[$iterator$] = function () {
    return new ArrayIterator(this._a);
  };

  function ArrayIterator(a) {
    this._a = a;
    this._l = toLength(a);
    this._i = 0;
  }

  ArrayIterator.prototype[$iterator$] = function () {
    return this;
  };

  ArrayIterator.prototype.next = function () {
    return this._i < this._l ? { done: false, value: this._a[this._i++] } : doneEnumerator;
  };

  function numberIsFinite(value) {
    return typeof value === 'number' && root.isFinite(value);
  }

  function isNan(n) {
    return n !== n;
  }

  function getIterable(o) {
    var i = o[$iterator$], it;
    if (!i && typeof o === 'string') {
      it = new StringIterable(o);
      return it[$iterator$]();
    }
    if (!i && o.length !== undefined) {
      it = new ArrayIterable(o);
      return it[$iterator$]();
    }
    if (!i) { throw new TypeError('Object is not iterable'); }
    return o[$iterator$]();
  }

  function sign(value) {
    var number = +value;
    if (number === 0) { return number; }
    if (isNaN(number)) { return number; }
    return number < 0 ? -1 : 1;
  }

  function toLength(o) {
    var len = +o.length;
    if (isNaN(len)) { return 0; }
    if (len === 0 || !numberIsFinite(len)) { return len; }
    len = sign(len) * Math.floor(Math.abs(len));
    if (len <= 0) { return 0; }
    if (len > maxSafeInteger) { return maxSafeInteger; }
    return len;
  }

  /**
  * This method creates a new Observable sequence from an array-like or iterable object.
  * @param {Any} arrayLike An array-like or iterable object to convert to an Observable sequence.
  * @param {Function} [mapFn] Map function to call on every element of the array.
  * @param {Any} [thisArg] The context to use calling the mapFn if provided.
  * @param {Scheduler} [scheduler] Optional scheduler to use for scheduling.  If not provided, defaults to Scheduler.currentThread.
  */
  var observableFrom = Observable.from = function (iterable, mapFn, thisArg, scheduler) {
    if (iterable == null) {
      throw new Error('iterable cannot be null.')
    }
    if (mapFn && !isFunction(mapFn)) {
      throw new Error('mapFn when provided must be a function');
    }
    if (mapFn) {
      var mapper = bindCallback(mapFn, thisArg, 2);
    }
    isScheduler(scheduler) || (scheduler = currentThreadScheduler);
    return new FromObservable(iterable, mapper, scheduler);
  }

  var FromArrayObservable = (function(__super__) {
    inherits(FromArrayObservable, __super__);
    function FromArrayObservable(args, scheduler) {
      this.args = args;
      this.scheduler = scheduler;
      __super__.call(this);
    }

    FromArrayObservable.prototype.subscribeCore = function (observer) {
      var sink = new FromArraySink(observer, this);
      return sink.run();
    };

    return FromArrayObservable;
  }(ObservableBase));

  function FromArraySink(observer, parent) {
    this.observer = observer;
    this.parent = parent;
  }

  FromArraySink.prototype.run = function () {
    var observer = this.observer, args = this.parent.args, len = args.length;
    function loopRecursive(i, recurse) {
      if (i < len) {
        observer.onNext(args[i]);
        recurse(i + 1);
      } else {
        observer.onCompleted();
      }
    }

    return this.parent.scheduler.scheduleRecursiveWithState(0, loopRecursive);
  };

  /**
  *  Converts an array to an observable sequence, using an optional scheduler to enumerate the array.
  * @deprecated use Observable.from or Observable.of
  * @param {Scheduler} [scheduler] Scheduler to run the enumeration of the input sequence on.
  * @returns {Observable} The observable sequence whose elements are pulled from the given enumerable sequence.
  */
  var observableFromArray = Observable.fromArray = function (array, scheduler) {
    isScheduler(scheduler) || (scheduler = currentThreadScheduler);
    return new FromArrayObservable(array, scheduler)
  };

  /**
   *  Generates an observable sequence by running a state-driven loop producing the sequence's elements, using the specified scheduler to send out observer messages.
   *
   * @example
   *  var res = Rx.Observable.generate(0, function (x) { return x < 10; }, function (x) { return x + 1; }, function (x) { return x; });
   *  var res = Rx.Observable.generate(0, function (x) { return x < 10; }, function (x) { return x + 1; }, function (x) { return x; }, Rx.Scheduler.timeout);
   * @param {Mixed} initialState Initial state.
   * @param {Function} condition Condition to terminate generation (upon returning false).
   * @param {Function} iterate Iteration step function.
   * @param {Function} resultSelector Selector function for results produced in the sequence.
   * @param {Scheduler} [scheduler] Scheduler on which to run the generator loop. If not provided, defaults to Scheduler.currentThread.
   * @returns {Observable} The generated sequence.
   */
  Observable.generate = function (initialState, condition, iterate, resultSelector, scheduler) {
    isScheduler(scheduler) || (scheduler = currentThreadScheduler);
    return new AnonymousObservable(function (o) {
      var first = true;
      return scheduler.scheduleRecursiveWithState(initialState, function (state, self) {
        var hasResult, result;
        try {
          if (first) {
            first = false;
          } else {
            state = iterate(state);
          }
          hasResult = condition(state);
          hasResult && (result = resultSelector(state));
        } catch (e) {
          return o.onError(e);
        }
        if (hasResult) {
          o.onNext(result);
          self(state);
        } else {
          o.onCompleted();
        }
      });
    });
  };

  var NeverObservable = (function(__super__) {
    inherits(NeverObservable, __super__);
    function NeverObservable() {
      __super__.call(this);
    }

    NeverObservable.prototype.subscribeCore = function (observer) {
      return disposableEmpty;
    };

    return NeverObservable;
  }(ObservableBase));

  var NEVER_OBSERVABLE = new NeverObservable();

  /**
   * Returns a non-terminating observable sequence, which can be used to denote an infinite duration (e.g. when using reactive joins).
   * @returns {Observable} An observable sequence whose observers will never get called.
   */
  var observableNever = Observable.never = function () {
    return NEVER_OBSERVABLE;
  };

  function observableOf (scheduler, array) {
    isScheduler(scheduler) || (scheduler = currentThreadScheduler);
    return new FromArrayObservable(array, scheduler);
  }

  /**
  *  This method creates a new Observable instance with a variable number of arguments, regardless of number or type of the arguments.
  * @returns {Observable} The observable sequence whose elements are pulled from the given arguments.
  */
  Observable.of = function () {
    var len = arguments.length, args = new Array(len);
    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    return new FromArrayObservable(args, currentThreadScheduler);
  };

  /**
  *  This method creates a new Observable instance with a variable number of arguments, regardless of number or type of the arguments.
  * @param {Scheduler} scheduler A scheduler to use for scheduling the arguments.
  * @returns {Observable} The observable sequence whose elements are pulled from the given arguments.
  */
  Observable.ofWithScheduler = function (scheduler) {
    var len = arguments.length, args = new Array(len - 1);
    for(var i = 1; i < len; i++) { args[i - 1] = arguments[i]; }
    return new FromArrayObservable(args, scheduler);
  };

  var PairsObservable = (function(__super__) {
    inherits(PairsObservable, __super__);
    function PairsObservable(obj, scheduler) {
      this.obj = obj;
      this.keys = Object.keys(obj);
      this.scheduler = scheduler;
      __super__.call(this);
    }

    PairsObservable.prototype.subscribeCore = function (observer) {
      var sink = new PairsSink(observer, this);
      return sink.run();
    };

    return PairsObservable;
  }(ObservableBase));

  function PairsSink(observer, parent) {
    this.observer = observer;
    this.parent = parent;
  }

  PairsSink.prototype.run = function () {
    var observer = this.observer, obj = this.parent.obj, keys = this.parent.keys, len = keys.length;
    function loopRecursive(i, recurse) {
      if (i < len) {
        var key = keys[i];
        observer.onNext([key, obj[key]]);
        recurse(i + 1);
      } else {
        observer.onCompleted();
      }
    }

    return this.parent.scheduler.scheduleRecursiveWithState(0, loopRecursive);
  };

  /**
   * Convert an object into an observable sequence of [key, value] pairs.
   * @param {Object} obj The object to inspect.
   * @param {Scheduler} [scheduler] Scheduler to run the enumeration of the input sequence on.
   * @returns {Observable} An observable sequence of [key, value] pairs from the object.
   */
  Observable.pairs = function (obj, scheduler) {
    scheduler || (scheduler = currentThreadScheduler);
    return new PairsObservable(obj, scheduler);
  };

    var RangeObservable = (function(__super__) {
    inherits(RangeObservable, __super__);
    function RangeObservable(start, count, scheduler) {
      this.start = start;
      this.rangeCount = count;
      this.scheduler = scheduler;
      __super__.call(this);
    }

    RangeObservable.prototype.subscribeCore = function (observer) {
      var sink = new RangeSink(observer, this);
      return sink.run();
    };

    return RangeObservable;
  }(ObservableBase));

  var RangeSink = (function () {
    function RangeSink(observer, parent) {
      this.observer = observer;
      this.parent = parent;
    }

    RangeSink.prototype.run = function () {
      var start = this.parent.start, count = this.parent.rangeCount, observer = this.observer;
      function loopRecursive(i, recurse) {
        if (i < count) {
          observer.onNext(start + i);
          recurse(i + 1);
        } else {
          observer.onCompleted();
        }
      }

      return this.parent.scheduler.scheduleRecursiveWithState(0, loopRecursive);
    };

    return RangeSink;
  }());

  /**
  *  Generates an observable sequence of integral numbers within a specified range, using the specified scheduler to send out observer messages.
  * @param {Number} start The value of the first integer in the sequence.
  * @param {Number} count The number of sequential integers to generate.
  * @param {Scheduler} [scheduler] Scheduler to run the generator loop on. If not specified, defaults to Scheduler.currentThread.
  * @returns {Observable} An observable sequence that contains a range of sequential integral numbers.
  */
  Observable.range = function (start, count, scheduler) {
    isScheduler(scheduler) || (scheduler = currentThreadScheduler);
    return new RangeObservable(start, count, scheduler);
  };

  var RepeatObservable = (function(__super__) {
    inherits(RepeatObservable, __super__);
    function RepeatObservable(value, repeatCount, scheduler) {
      this.value = value;
      this.repeatCount = repeatCount == null ? -1 : repeatCount;
      this.scheduler = scheduler;
      __super__.call(this);
    }

    RepeatObservable.prototype.subscribeCore = function (observer) {
      var sink = new RepeatSink(observer, this);
      return sink.run();
    };

    return RepeatObservable;
  }(ObservableBase));

  function RepeatSink(observer, parent) {
    this.observer = observer;
    this.parent = parent;
  }

  RepeatSink.prototype.run = function () {
    var observer = this.observer, value = this.parent.value;
    function loopRecursive(i, recurse) {
      if (i === -1 || i > 0) {
        observer.onNext(value);
        i > 0 && i--;
      }
      if (i === 0) { return observer.onCompleted(); }
      recurse(i);
    }

    return this.parent.scheduler.scheduleRecursiveWithState(this.parent.repeatCount, loopRecursive);
  };

  /**
   *  Generates an observable sequence that repeats the given element the specified number of times, using the specified scheduler to send out observer messages.
   * @param {Mixed} value Element to repeat.
   * @param {Number} repeatCount [Optiona] Number of times to repeat the element. If not specified, repeats indefinitely.
   * @param {Scheduler} scheduler Scheduler to run the producer loop on. If not specified, defaults to Scheduler.immediate.
   * @returns {Observable} An observable sequence that repeats the given element the specified number of times.
   */
  Observable.repeat = function (value, repeatCount, scheduler) {
    isScheduler(scheduler) || (scheduler = currentThreadScheduler);
    return new RepeatObservable(value, repeatCount, scheduler);
  };

  var JustObservable = (function(__super__) {
    inherits(JustObservable, __super__);
    function JustObservable(value, scheduler) {
      this.value = value;
      this.scheduler = scheduler;
      __super__.call(this);
    }

    JustObservable.prototype.subscribeCore = function (observer) {
      var sink = new JustSink(observer, this.value, this.scheduler);
      return sink.run();
    };

    function JustSink(observer, value, scheduler) {
      this.observer = observer;
      this.value = value;
      this.scheduler = scheduler;
    }

    function scheduleItem(s, state) {
      var value = state[0], observer = state[1];
      observer.onNext(value);
      observer.onCompleted();
      return disposableEmpty;
    }

    JustSink.prototype.run = function () {
      var state = [this.value, this.observer];
      return this.scheduler === immediateScheduler ?
        scheduleItem(null, state) :
        this.scheduler.scheduleWithState(state, scheduleItem);
    };

    return JustObservable;
  }(ObservableBase));

  /**
   *  Returns an observable sequence that contains a single element, using the specified scheduler to send out observer messages.
   *  There is an alias called 'just' or browsers <IE9.
   * @param {Mixed} value Single element in the resulting observable sequence.
   * @param {Scheduler} scheduler Scheduler to send the single element on. If not specified, defaults to Scheduler.immediate.
   * @returns {Observable} An observable sequence containing the single specified element.
   */
  var observableReturn = Observable['return'] = Observable.just = function (value, scheduler) {
    isScheduler(scheduler) || (scheduler = immediateScheduler);
    return new JustObservable(value, scheduler);
  };

  var ThrowObservable = (function(__super__) {
    inherits(ThrowObservable, __super__);
    function ThrowObservable(error, scheduler) {
      this.error = error;
      this.scheduler = scheduler;
      __super__.call(this);
    }

    ThrowObservable.prototype.subscribeCore = function (o) {
      var sink = new ThrowSink(o, this);
      return sink.run();
    };

    function ThrowSink(o, p) {
      this.o = o;
      this.p = p;
    }

    function scheduleItem(s, state) {
      var e = state[0], o = state[1];
      o.onError(e);
    }

    ThrowSink.prototype.run = function () {
      return this.p.scheduler.scheduleWithState([this.p.error, this.o], scheduleItem);
    };

    return ThrowObservable;
  }(ObservableBase));

  /**
   *  Returns an observable sequence that terminates with an exception, using the specified scheduler to send out the single onError message.
   *  There is an alias to this method called 'throwError' for browsers <IE9.
   * @param {Mixed} error An object used for the sequence's termination.
   * @param {Scheduler} scheduler Scheduler to send the exceptional termination call on. If not specified, defaults to Scheduler.immediate.
   * @returns {Observable} The observable sequence that terminates exceptionally with the specified exception object.
   */
  var observableThrow = Observable['throw'] = function (error, scheduler) {
    isScheduler(scheduler) || (scheduler = immediateScheduler);
    return new ThrowObservable(error, scheduler);
  };

  /**
   * Constructs an observable sequence that depends on a resource object, whose lifetime is tied to the resulting observable sequence's lifetime.
   * @param {Function} resourceFactory Factory function to obtain a resource object.
   * @param {Function} observableFactory Factory function to obtain an observable sequence that depends on the obtained resource.
   * @returns {Observable} An observable sequence whose lifetime controls the lifetime of the dependent resource object.
   */
  Observable.using = function (resourceFactory, observableFactory) {
    return new AnonymousObservable(function (o) {
      var disposable = disposableEmpty;
      var resource = tryCatch(resourceFactory)();
      if (resource === errorObj) {
        return new CompositeDisposable(observableThrow(resource.e).subscribe(o), disposable);
      }
      resource && (disposable = resource);
      var source = tryCatch(observableFactory)(resource);
      if (source === errorObj) {
        return new CompositeDisposable(observableThrow(source.e).subscribe(o), disposable);
      }
      return new CompositeDisposable(source.subscribe(o), disposable);
    });
  };

  /**
   * Propagates the observable sequence or Promise that reacts first.
   * @param {Observable} rightSource Second observable sequence or Promise.
   * @returns {Observable} {Observable} An observable sequence that surfaces either of the given sequences, whichever reacted first.
   */
  observableProto.amb = function (rightSource) {
    var leftSource = this;
    return new AnonymousObservable(function (observer) {
      var choice,
        leftChoice = 'L', rightChoice = 'R',
        leftSubscription = new SingleAssignmentDisposable(),
        rightSubscription = new SingleAssignmentDisposable();

      isPromise(rightSource) && (rightSource = observableFromPromise(rightSource));

      function choiceL() {
        if (!choice) {
          choice = leftChoice;
          rightSubscription.dispose();
        }
      }

      function choiceR() {
        if (!choice) {
          choice = rightChoice;
          leftSubscription.dispose();
        }
      }

      var leftSubscribe = observerCreate(
        function (left) {
          choiceL();
          choice === leftChoice && observer.onNext(left);
        },
        function (e) {
          choiceL();
          choice === leftChoice && observer.onError(e);
        },
        function () {
          choiceL();
          choice === leftChoice && observer.onCompleted();
        }
      );
      var rightSubscribe = observerCreate(
        function (right) {
          choiceR();
          choice === rightChoice && observer.onNext(right);
        },
        function (e) {
          choiceR();
          choice === rightChoice && observer.onError(e);
        },
        function () {
          choiceR();
          choice === rightChoice && observer.onCompleted();
        }
      );

      leftSubscription.setDisposable(leftSource.subscribe(leftSubscribe));
      rightSubscription.setDisposable(rightSource.subscribe(rightSubscribe));

      return new CompositeDisposable(leftSubscription, rightSubscription);
    });
  };

  function amb(p, c) { return p.amb(c); }

  /**
   * Propagates the observable sequence or Promise that reacts first.
   * @returns {Observable} An observable sequence that surfaces any of the given sequences, whichever reacted first.
   */
  Observable.amb = function () {
    var acc = observableNever(), items;
    if (Array.isArray(arguments[0])) {
      items = arguments[0];
    } else {
      var len = arguments.length;
      items = new Array(items);
      for(var i = 0; i < len; i++) { items[i] = arguments[i]; }
    }
    for (var i = 0, len = items.length; i < len; i++) {
      acc = amb(acc, items[i]);
    }
    return acc;
  };

  var CatchObserver = (function(__super__) {
    inherits(CatchObserver, __super__);
    function CatchObserver(o, s, fn) {
      this._o = o;
      this._s = s;
      this._fn = fn;
      __super__.call(this);
    }

    CatchObserver.prototype.next = function (x) { this._o.onNext(x); };
    CatchObserver.prototype.completed = function () { return this._o.onCompleted(); };
    CatchObserver.prototype.error = function (e) {
      var result = tryCatch(this._fn)(e);
      if (result === errorObj) { return this._o.onError(result.e); }
      isPromise(result) && (result = observableFromPromise(result));

      var d = new SingleAssignmentDisposable();
      this._s.setDisposable(d);
      d.setDisposable(result.subscribe(this._o));
    };

    return CatchObserver;
  }(AbstractObserver));

  function observableCatchHandler(source, handler) {
    return new AnonymousObservable(function (o) {
      var d1 = new SingleAssignmentDisposable(), subscription = new SerialDisposable();
      subscription.setDisposable(d1);
      d1.setDisposable(source.subscribe(new CatchObserver(o, subscription, handler)));
      return subscription;
    }, source);
  }

  /**
   * Continues an observable sequence that is terminated by an exception with the next observable sequence.
   * @param {Mixed} handlerOrSecond Exception handler function that returns an observable sequence given the error that occurred in the first sequence, or a second observable sequence used to produce results when an error occurred in the first sequence.
   * @returns {Observable} An observable sequence containing the first sequence's elements, followed by the elements of the handler sequence in case an exception occurred.
   */
  observableProto['catch'] = function (handlerOrSecond) {
    return isFunction(handlerOrSecond) ? observableCatchHandler(this, handlerOrSecond) : observableCatch([this, handlerOrSecond]);
  };

  /**
   * Continues an observable sequence that is terminated by an exception with the next observable sequence.
   * @param {Array | Arguments} args Arguments or an array to use as the next sequence if an error occurs.
   * @returns {Observable} An observable sequence containing elements from consecutive source sequences until a source sequence terminates successfully.
   */
  var observableCatch = Observable['catch'] = function () {
    var items;
    if (Array.isArray(arguments[0])) {
      items = arguments[0];
    } else {
      var len = arguments.length;
      items = new Array(len);
      for(var i = 0; i < len; i++) { items[i] = arguments[i]; }
    }
    return enumerableOf(items).catchError();
  };

  /**
   * Merges the specified observable sequences into one observable sequence by using the selector function whenever any of the observable sequences or Promises produces an element.
   * This can be in the form of an argument list of observables or an array.
   *
   * @example
   * 1 - obs = observable.combineLatest(obs1, obs2, obs3, function (o1, o2, o3) { return o1 + o2 + o3; });
   * 2 - obs = observable.combineLatest([obs1, obs2, obs3], function (o1, o2, o3) { return o1 + o2 + o3; });
   * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
   */
  observableProto.combineLatest = function () {
    var len = arguments.length, args = new Array(len);
    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    if (Array.isArray(args[0])) {
      args[0].unshift(this);
    } else {
      args.unshift(this);
    }
    return combineLatest.apply(this, args);
  };

  function falseFactory() { return false; }
  function argumentsToArray() {
    var len = arguments.length, args = new Array(len);
    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    return args;
  }

  /**
   * Merges the specified observable sequences into one observable sequence by using the selector function whenever any of the observable sequences or Promises produces an element.
   *
   * @example
   * 1 - obs = Rx.Observable.combineLatest(obs1, obs2, obs3, function (o1, o2, o3) { return o1 + o2 + o3; });
   * 2 - obs = Rx.Observable.combineLatest([obs1, obs2, obs3], function (o1, o2, o3) { return o1 + o2 + o3; });
   * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
   */
  var combineLatest = Observable.combineLatest = function () {
    var len = arguments.length, args = new Array(len);
    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    var resultSelector = isFunction(args[len - 1]) ? args.pop() : argumentsToArray;
    Array.isArray(args[0]) && (args = args[0]);

    return new AnonymousObservable(function (o) {
      var n = args.length,
        hasValue = arrayInitialize(n, falseFactory),
        hasValueAll = false,
        isDone = arrayInitialize(n, falseFactory),
        values = new Array(n);

      function next(i) {
        hasValue[i] = true;
        if (hasValueAll || (hasValueAll = hasValue.every(identity))) {
          try {
            var res = resultSelector.apply(null, values);
          } catch (e) {
            return o.onError(e);
          }
          o.onNext(res);
        } else if (isDone.filter(function (x, j) { return j !== i; }).every(identity)) {
          o.onCompleted();
        }
      }

      function done (i) {
        isDone[i] = true;
        isDone.every(identity) && o.onCompleted();
      }

      var subscriptions = new Array(n);
      for (var idx = 0; idx < n; idx++) {
        (function (i) {
          var source = args[i], sad = new SingleAssignmentDisposable();
          isPromise(source) && (source = observableFromPromise(source));
          sad.setDisposable(source.subscribe(function (x) {
              values[i] = x;
              next(i);
            },
            function(e) { o.onError(e); },
            function () { done(i); }
          ));
          subscriptions[i] = sad;
        }(idx));
      }

      return new CompositeDisposable(subscriptions);
    }, this);
  };

  /**
   * Concatenates all the observable sequences.  This takes in either an array or variable arguments to concatenate.
   * @returns {Observable} An observable sequence that contains the elements of each given sequence, in sequential order.
   */
  observableProto.concat = function () {
    for(var args = [], i = 0, len = arguments.length; i < len; i++) { args.push(arguments[i]); }
    args.unshift(this);
    return observableConcat.apply(null, args);
  };

  var ConcatObservable = (function(__super__) {
    inherits(ConcatObservable, __super__);
    function ConcatObservable(sources) {
      this.sources = sources;
      __super__.call(this);
    }

    ConcatObservable.prototype.subscribeCore = function(o) {
      var sink = new ConcatSink(this.sources, o);
      return sink.run();
    };

    function ConcatSink(sources, o) {
      this.sources = sources;
      this.o = o;
    }
    ConcatSink.prototype.run = function () {
      var isDisposed, subscription = new SerialDisposable(), sources = this.sources, length = sources.length, o = this.o;
      var cancelable = immediateScheduler.scheduleRecursiveWithState(0, function (i, self) {
        if (isDisposed) { return; }
        if (i === length) {
          return o.onCompleted();
        }

        // Check if promise
        var currentValue = sources[i];
        isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));

        var d = new SingleAssignmentDisposable();
        subscription.setDisposable(d);
        d.setDisposable(currentValue.subscribe(
          function (x) { o.onNext(x); },
          function (e) { o.onError(e); },
          function () { self(i + 1); }
        ));
      });

      return new CompositeDisposable(subscription, cancelable, disposableCreate(function () {
        isDisposed = true;
      }));
    };


    return ConcatObservable;
  }(ObservableBase));

  /**
   * Concatenates all the observable sequences.
   * @param {Array | Arguments} args Arguments or an array to concat to the observable sequence.
   * @returns {Observable} An observable sequence that contains the elements of each given sequence, in sequential order.
   */
  var observableConcat = Observable.concat = function () {
    var args;
    if (Array.isArray(arguments[0])) {
      args = arguments[0];
    } else {
      args = new Array(arguments.length);
      for(var i = 0, len = arguments.length; i < len; i++) { args[i] = arguments[i]; }
    }
    return new ConcatObservable(args);
  };

  /**
   * Concatenates an observable sequence of observable sequences.
   * @returns {Observable} An observable sequence that contains the elements of each observed inner sequence, in sequential order.
   */
  observableProto.concatAll = function () {
    return this.merge(1);
  };

  var MergeObservable = (function (__super__) {
    inherits(MergeObservable, __super__);

    function MergeObservable(source, maxConcurrent) {
      this.source = source;
      this.maxConcurrent = maxConcurrent;
      __super__.call(this);
    }

    MergeObservable.prototype.subscribeCore = function(observer) {
      var g = new CompositeDisposable();
      g.add(this.source.subscribe(new MergeObserver(observer, this.maxConcurrent, g)));
      return g;
    };

    return MergeObservable;

  }(ObservableBase));

  var MergeObserver = (function () {
    function MergeObserver(o, max, g) {
      this.o = o;
      this.max = max;
      this.g = g;
      this.done = false;
      this.q = [];
      this.activeCount = 0;
      this.isStopped = false;
    }
    MergeObserver.prototype.handleSubscribe = function (xs) {
      var sad = new SingleAssignmentDisposable();
      this.g.add(sad);
      isPromise(xs) && (xs = observableFromPromise(xs));
      sad.setDisposable(xs.subscribe(new InnerObserver(this, sad)));
    };
    MergeObserver.prototype.onNext = function (innerSource) {
      if (this.isStopped) { return; }
        if(this.activeCount < this.max) {
          this.activeCount++;
          this.handleSubscribe(innerSource);
        } else {
          this.q.push(innerSource);
        }
      };
      MergeObserver.prototype.onError = function (e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
        }
      };
      MergeObserver.prototype.onCompleted = function () {
        if (!this.isStopped) {
          this.isStopped = true;
          this.done = true;
          this.activeCount === 0 && this.o.onCompleted();
        }
      };
      MergeObserver.prototype.dispose = function() { this.isStopped = true; };
      MergeObserver.prototype.fail = function (e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
          return true;
        }

        return false;
      };

      function InnerObserver(parent, sad) {
        this.parent = parent;
        this.sad = sad;
        this.isStopped = false;
      }
      InnerObserver.prototype.onNext = function (x) { if(!this.isStopped) { this.parent.o.onNext(x); } };
      InnerObserver.prototype.onError = function (e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.parent.o.onError(e);
        }
      };
      InnerObserver.prototype.onCompleted = function () {
        if(!this.isStopped) {
          this.isStopped = true;
          var parent = this.parent;
          parent.g.remove(this.sad);
          if (parent.q.length > 0) {
            parent.handleSubscribe(parent.q.shift());
          } else {
            parent.activeCount--;
            parent.done && parent.activeCount === 0 && parent.o.onCompleted();
          }
        }
      };
      InnerObserver.prototype.dispose = function() { this.isStopped = true; };
      InnerObserver.prototype.fail = function (e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.parent.o.onError(e);
          return true;
        }

        return false;
      };

      return MergeObserver;
  }());





  /**
  * Merges an observable sequence of observable sequences into an observable sequence, limiting the number of concurrent subscriptions to inner sequences.
  * Or merges two observable sequences into a single observable sequence.
  *
  * @example
  * 1 - merged = sources.merge(1);
  * 2 - merged = source.merge(otherSource);
  * @param {Mixed} [maxConcurrentOrOther] Maximum number of inner observable sequences being subscribed to concurrently or the second observable sequence.
  * @returns {Observable} The observable sequence that merges the elements of the inner sequences.
  */
  observableProto.merge = function (maxConcurrentOrOther) {
    return typeof maxConcurrentOrOther !== 'number' ?
      observableMerge(this, maxConcurrentOrOther) :
      new MergeObservable(this, maxConcurrentOrOther);
  };

  /**
   * Merges all the observable sequences into a single observable sequence.
   * The scheduler is optional and if not specified, the immediate scheduler is used.
   * @returns {Observable} The observable sequence that merges the elements of the observable sequences.
   */
  var observableMerge = Observable.merge = function () {
    var scheduler, sources = [], i, len = arguments.length;
    if (!arguments[0]) {
      scheduler = immediateScheduler;
      for(i = 1; i < len; i++) { sources.push(arguments[i]); }
    } else if (isScheduler(arguments[0])) {
      scheduler = arguments[0];
      for(i = 1; i < len; i++) { sources.push(arguments[i]); }
    } else {
      scheduler = immediateScheduler;
      for(i = 0; i < len; i++) { sources.push(arguments[i]); }
    }
    if (Array.isArray(sources[0])) {
      sources = sources[0];
    }
    return observableOf(scheduler, sources).mergeAll();
  };

  var MergeAllObservable = (function (__super__) {
    inherits(MergeAllObservable, __super__);

    function MergeAllObservable(source) {
      this.source = source;
      __super__.call(this);
    }

    MergeAllObservable.prototype.subscribeCore = function (observer) {
      var g = new CompositeDisposable(), m = new SingleAssignmentDisposable();
      g.add(m);
      m.setDisposable(this.source.subscribe(new MergeAllObserver(observer, g)));
      return g;
    };

    function MergeAllObserver(o, g) {
      this.o = o;
      this.g = g;
      this.isStopped = false;
      this.done = false;
    }
    MergeAllObserver.prototype.onNext = function(innerSource) {
      if(this.isStopped) { return; }
      var sad = new SingleAssignmentDisposable();
      this.g.add(sad);

      isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));

      sad.setDisposable(innerSource.subscribe(new InnerObserver(this, sad)));
    };
    MergeAllObserver.prototype.onError = function (e) {
      if(!this.isStopped) {
        this.isStopped = true;
        this.o.onError(e);
      }
    };
    MergeAllObserver.prototype.onCompleted = function () {
      if(!this.isStopped) {
        this.isStopped = true;
        this.done = true;
        this.g.length === 1 && this.o.onCompleted();
      }
    };
    MergeAllObserver.prototype.dispose = function() { this.isStopped = true; };
    MergeAllObserver.prototype.fail = function (e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.o.onError(e);
        return true;
      }

      return false;
    };

    function InnerObserver(parent, sad) {
      this.parent = parent;
      this.sad = sad;
      this.isStopped = false;
    }
    InnerObserver.prototype.onNext = function (x) { if (!this.isStopped) { this.parent.o.onNext(x); } };
    InnerObserver.prototype.onError = function (e) {
      if(!this.isStopped) {
        this.isStopped = true;
        this.parent.o.onError(e);
      }
    };
    InnerObserver.prototype.onCompleted = function () {
      if(!this.isStopped) {
        var parent = this.parent;
        this.isStopped = true;
        parent.g.remove(this.sad);
        parent.done && parent.g.length === 1 && parent.o.onCompleted();
      }
    };
    InnerObserver.prototype.dispose = function() { this.isStopped = true; };
    InnerObserver.prototype.fail = function (e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.parent.o.onError(e);
        return true;
      }

      return false;
    };

    return MergeAllObservable;
  }(ObservableBase));

  /**
  * Merges an observable sequence of observable sequences into an observable sequence.
  * @returns {Observable} The observable sequence that merges the elements of the inner sequences.
  */
  observableProto.mergeAll = function () {
    return new MergeAllObservable(this);
  };

  var CompositeError = Rx.CompositeError = function(errors) {
    this.name = "NotImplementedError";
    this.innerErrors = errors;
    this.message = 'This contains multiple errors. Check the innerErrors';
    Error.call(this);
  }
  CompositeError.prototype = Error.prototype;

  /**
  * Flattens an Observable that emits Observables into one Observable, in a way that allows an Observer to
  * receive all successfully emitted items from all of the source Observables without being interrupted by
  * an error notification from one of them.
  *
  * This behaves like Observable.prototype.mergeAll except that if any of the merged Observables notify of an
  * error via the Observer's onError, mergeDelayError will refrain from propagating that
  * error notification until all of the merged Observables have finished emitting items.
  * @param {Array | Arguments} args Arguments or an array to merge.
  * @returns {Observable} an Observable that emits all of the items emitted by the Observables emitted by the Observable
  */
  Observable.mergeDelayError = function() {
    var args;
    if (Array.isArray(arguments[0])) {
      args = arguments[0];
    } else {
      var len = arguments.length;
      args = new Array(len);
      for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    }
    var source = observableOf(null, args);

    return new AnonymousObservable(function (o) {
      var group = new CompositeDisposable(),
        m = new SingleAssignmentDisposable(),
        isStopped = false,
        errors = [];

      function setCompletion() {
        if (errors.length === 0) {
          o.onCompleted();
        } else if (errors.length === 1) {
          o.onError(errors[0]);
        } else {
          o.onError(new CompositeError(errors));
        }
      }

      group.add(m);

      m.setDisposable(source.subscribe(
        function (innerSource) {
          var innerSubscription = new SingleAssignmentDisposable();
          group.add(innerSubscription);

          // Check for promises support
          isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));

          innerSubscription.setDisposable(innerSource.subscribe(
            function (x) { o.onNext(x); },
            function (e) {
              errors.push(e);
              group.remove(innerSubscription);
              isStopped && group.length === 1 && setCompletion();
            },
            function () {
              group.remove(innerSubscription);
              isStopped && group.length === 1 && setCompletion();
          }));
        },
        function (e) {
          errors.push(e);
          isStopped = true;
          group.length === 1 && setCompletion();
        },
        function () {
          isStopped = true;
          group.length === 1 && setCompletion();
        }));
      return group;
    });
  };

  /**
   * Continues an observable sequence that is terminated normally or by an exception with the next observable sequence.
   * @param {Observable} second Second observable sequence used to produce results after the first sequence terminates.
   * @returns {Observable} An observable sequence that concatenates the first and second sequence, even if the first sequence terminates exceptionally.
   */
  observableProto.onErrorResumeNext = function (second) {
    if (!second) { throw new Error('Second observable is required'); }
    return onErrorResumeNext([this, second]);
  };

  /**
   * Continues an observable sequence that is terminated normally or by an exception with the next observable sequence.
   *
   * @example
   * 1 - res = Rx.Observable.onErrorResumeNext(xs, ys, zs);
   * 1 - res = Rx.Observable.onErrorResumeNext([xs, ys, zs]);
   * @returns {Observable} An observable sequence that concatenates the source sequences, even if a sequence terminates exceptionally.
   */
  var onErrorResumeNext = Observable.onErrorResumeNext = function () {
    var sources = [];
    if (Array.isArray(arguments[0])) {
      sources = arguments[0];
    } else {
      for(var i = 0, len = arguments.length; i < len; i++) { sources.push(arguments[i]); }
    }
    return new AnonymousObservable(function (observer) {
      var pos = 0, subscription = new SerialDisposable(),
      cancelable = immediateScheduler.scheduleRecursive(function (self) {
        var current, d;
        if (pos < sources.length) {
          current = sources[pos++];
          isPromise(current) && (current = observableFromPromise(current));
          d = new SingleAssignmentDisposable();
          subscription.setDisposable(d);
          d.setDisposable(current.subscribe(observer.onNext.bind(observer), self, self));
        } else {
          observer.onCompleted();
        }
      });
      return new CompositeDisposable(subscription, cancelable);
    });
  };

  /**
   * Returns the values from the source observable sequence only after the other observable sequence produces a value.
   * @param {Observable | Promise} other The observable sequence or Promise that triggers propagation of elements of the source sequence.
   * @returns {Observable} An observable sequence containing the elements of the source sequence starting from the point the other sequence triggered propagation.
   */
  observableProto.skipUntil = function (other) {
    var source = this;
    return new AnonymousObservable(function (o) {
      var isOpen = false;
      var disposables = new CompositeDisposable(source.subscribe(function (left) {
        isOpen && o.onNext(left);
      }, function (e) { o.onError(e); }, function () {
        isOpen && o.onCompleted();
      }));

      isPromise(other) && (other = observableFromPromise(other));

      var rightSubscription = new SingleAssignmentDisposable();
      disposables.add(rightSubscription);
      rightSubscription.setDisposable(other.subscribe(function () {
        isOpen = true;
        rightSubscription.dispose();
      }, function (e) { o.onError(e); }, function () {
        rightSubscription.dispose();
      }));

      return disposables;
    }, source);
  };

  var SwitchObservable = (function(__super__) {
    inherits(SwitchObservable, __super__);
    function SwitchObservable(source) {
      this.source = source;
      __super__.call(this);
    }

    SwitchObservable.prototype.subscribeCore = function (o) {
      var inner = new SerialDisposable(), s = this.source.subscribe(new SwitchObserver(o, inner));
      return new CompositeDisposable(s, inner);
    };

    function SwitchObserver(o, inner) {
      this.o = o;
      this.inner = inner;
      this.stopped = false;
      this.latest = 0;
      this.hasLatest = false;
      this.isStopped = false;
    }
    SwitchObserver.prototype.onNext = function (innerSource) {
      if (this.isStopped) { return; }
      var d = new SingleAssignmentDisposable(), id = ++this.latest;
      this.hasLatest = true;
      this.inner.setDisposable(d);
      isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));
      d.setDisposable(innerSource.subscribe(new InnerObserver(this, id)));
    };
    SwitchObserver.prototype.onError = function (e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.o.onError(e);
      }
    };
    SwitchObserver.prototype.onCompleted = function () {
      if (!this.isStopped) {
        this.isStopped = true;
        this.stopped = true;
        !this.hasLatest && this.o.onCompleted();
      }
    };
    SwitchObserver.prototype.dispose = function () { this.isStopped = true; };
    SwitchObserver.prototype.fail = function (e) {
      if(!this.isStopped) {
        this.isStopped = true;
        this.o.onError(e);
        return true;
      }
      return false;
    };

    function InnerObserver(parent, id) {
      this.parent = parent;
      this.id = id;
      this.isStopped = false;
    }
    InnerObserver.prototype.onNext = function (x) {
      if (this.isStopped) { return; }
      this.parent.latest === this.id && this.parent.o.onNext(x);
    };
    InnerObserver.prototype.onError = function (e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.parent.latest === this.id && this.parent.o.onError(e);
      }
    };
    InnerObserver.prototype.onCompleted = function () {
      if (!this.isStopped) {
        this.isStopped = true;
        if (this.parent.latest === this.id) {
          this.parent.hasLatest = false;
          this.parent.isStopped && this.parent.o.onCompleted();
        }
      }
    };
    InnerObserver.prototype.dispose = function () { this.isStopped = true; }
    InnerObserver.prototype.fail = function (e) {
      if(!this.isStopped) {
        this.isStopped = true;
        this.parent.o.onError(e);
        return true;
      }
      return false;
    };

    return SwitchObservable;
  }(ObservableBase));

  /**
  * Transforms an observable sequence of observable sequences into an observable sequence producing values only from the most recent observable sequence.
  * @returns {Observable} The observable sequence that at any point in time produces the elements of the most recent inner observable sequence that has been received.
  */
  observableProto['switch'] = observableProto.switchLatest = function () {
    return new SwitchObservable(this);
  };

  var TakeUntilObservable = (function(__super__) {
    inherits(TakeUntilObservable, __super__);

    function TakeUntilObservable(source, other) {
      this.source = source;
      this.other = isPromise(other) ? observableFromPromise(other) : other;
      __super__.call(this);
    }

    TakeUntilObservable.prototype.subscribeCore = function(o) {
      return new CompositeDisposable(
        this.source.subscribe(o),
        this.other.subscribe(new InnerObserver(o))
      );
    };

    function InnerObserver(o) {
      this.o = o;
      this.isStopped = false;
    }
    InnerObserver.prototype.onNext = function (x) {
      if (this.isStopped) { return; }
      this.o.onCompleted();
    };
    InnerObserver.prototype.onError = function (err) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.o.onError(err);
      }
    };
    InnerObserver.prototype.onCompleted = function () {
      !this.isStopped && (this.isStopped = true);
    };
    InnerObserver.prototype.dispose = function() { this.isStopped = true; };
    InnerObserver.prototype.fail = function (e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.o.onError(e);
        return true;
      }
      return false;
    };

    return TakeUntilObservable;
  }(ObservableBase));

  /**
   * Returns the values from the source observable sequence until the other observable sequence produces a value.
   * @param {Observable | Promise} other Observable sequence or Promise that terminates propagation of elements of the source sequence.
   * @returns {Observable} An observable sequence containing the elements of the source sequence up to the point the other sequence interrupted further propagation.
   */
  observableProto.takeUntil = function (other) {
    return new TakeUntilObservable(this, other);
  };

  function falseFactory() { return false; }

  /**
   * Merges the specified observable sequences into one observable sequence by using the selector function only when the (first) source observable sequence produces an element.
   * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
   */
  observableProto.withLatestFrom = function () {
    var len = arguments.length, args = new Array(len)
    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    var resultSelector = args.pop(), source = this;
    Array.isArray(args[0]) && (args = args[0]);

    return new AnonymousObservable(function (observer) {
      var n = args.length,
        hasValue = arrayInitialize(n, falseFactory),
        hasValueAll = false,
        values = new Array(n);

      var subscriptions = new Array(n + 1);
      for (var idx = 0; idx < n; idx++) {
        (function (i) {
          var other = args[i], sad = new SingleAssignmentDisposable();
          isPromise(other) && (other = observableFromPromise(other));
          sad.setDisposable(other.subscribe(function (x) {
            values[i] = x;
            hasValue[i] = true;
            hasValueAll = hasValue.every(identity);
          }, function (e) { observer.onError(e); }, noop));
          subscriptions[i] = sad;
        }(idx));
      }

      var sad = new SingleAssignmentDisposable();
      sad.setDisposable(source.subscribe(function (x) {
        var allValues = [x].concat(values);
        if (!hasValueAll) { return; }
        var res = tryCatch(resultSelector).apply(null, allValues);
        if (res === errorObj) { return observer.onError(res.e); }
        observer.onNext(res);
      }, function (e) { observer.onError(e); }, function () {
        observer.onCompleted();
      }));
      subscriptions[n] = sad;

      return new CompositeDisposable(subscriptions);
    }, this);
  };

  function falseFactory() { return false; }
  function emptyArrayFactory() { return []; }
  function argumentsToArray() {
    var len = arguments.length, args = new Array(len);
    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    return args;
  }

  /**
   * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences or an array have produced an element at a corresponding index.
   * The last element in the arguments must be a function to invoke for each series of elements at corresponding indexes in the args.
   * @returns {Observable} An observable sequence containing the result of combining elements of the args using the specified result selector function.
   */
  observableProto.zip = function () {
    if (arguments.length === 0) { throw new Error('invalid arguments'); }

    var len = arguments.length, args = new Array(len);
    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    var resultSelector = isFunction(args[len - 1]) ? args.pop() : argumentsToArray;
    Array.isArray(args[0]) && (args = args[0]);

    var parent = this;
    args.unshift(parent);
    return new AnonymousObservable(function (o) {
      var n = args.length,
        queues = arrayInitialize(n, emptyArrayFactory),
        isDone = arrayInitialize(n, falseFactory);

      var subscriptions = new Array(n);
      for (var idx = 0; idx < n; idx++) {
        (function (i) {
          var source = args[i], sad = new SingleAssignmentDisposable();

          isPromise(source) && (source = observableFromPromise(source));

          sad.setDisposable(source.subscribe(function (x) {
            queues[i].push(x);
            if (queues.every(function (x) { return x.length > 0; })) {
              var queuedValues = queues.map(function (x) { return x.shift(); }),
                  res = tryCatch(resultSelector).apply(parent, queuedValues);
              if (res === errorObj) { return o.onError(res.e); }
              o.onNext(res);
            } else if (isDone.filter(function (x, j) { return j !== i; }).every(identity)) {
              o.onCompleted();
            }
          }, function (e) { o.onError(e); }, function () {
            isDone[i] = true;
            isDone.every(identity) && o.onCompleted();
          }));
          subscriptions[i] = sad;
        })(idx);
      }

      return new CompositeDisposable(subscriptions);
    }, parent);
  };

  /**
   * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences have produced an element at a corresponding index.
   * @param arguments Observable sources.
   * @param {Function} resultSelector Function to invoke for each series of elements at corresponding indexes in the sources.
   * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
   */
  Observable.zip = function () {
    var len = arguments.length, args = new Array(len);
    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    if (Array.isArray(args[0])) {
      args = isFunction(args[1]) ? args[0].concat(args[1]) : args[0];
    }
    var first = args.shift();
    return first.zip.apply(first, args);
  };

function falseFactory() { return false; }
function emptyArrayFactory() { return []; }
function argumentsToArray() {
  var len = arguments.length, args = new Array(len);
  for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
  return args;
}

/**
 * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences or an array have produced an element at a corresponding index.
 * The last element in the arguments must be a function to invoke for each series of elements at corresponding indexes in the args.
 * @returns {Observable} An observable sequence containing the result of combining elements of the args using the specified result selector function.
 */
observableProto.zipIterable = function () {
  if (arguments.length === 0) { throw new Error('invalid arguments'); }

  var len = arguments.length, args = new Array(len);
  for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
  var resultSelector = isFunction(args[len - 1]) ? args.pop() : argumentsToArray;

  var parent = this;
  args.unshift(parent);
  return new AnonymousObservable(function (o) {
    var n = args.length,
      queues = arrayInitialize(n, emptyArrayFactory),
      isDone = arrayInitialize(n, falseFactory);

    var subscriptions = new Array(n);
    for (var idx = 0; idx < n; idx++) {
      (function (i) {
        var source = args[i], sad = new SingleAssignmentDisposable();

        (isArrayLike(source) || isIterable(source)) && (source = observableFrom(source));

        sad.setDisposable(source.subscribe(function (x) {
          queues[i].push(x);
          if (queues.every(function (x) { return x.length > 0; })) {
            var queuedValues = queues.map(function (x) { return x.shift(); }),
                res = tryCatch(resultSelector).apply(parent, queuedValues);
            if (res === errorObj) { return o.onError(res.e); }
            o.onNext(res);
          } else if (isDone.filter(function (x, j) { return j !== i; }).every(identity)) {
            o.onCompleted();
          }
        }, function (e) { o.onError(e); }, function () {
          isDone[i] = true;
          isDone.every(identity) && o.onCompleted();
        }));
        subscriptions[i] = sad;
      })(idx);
    }

    return new CompositeDisposable(subscriptions);
  }, parent);
};

  function asObservable(source) {
    return function subscribe(o) { return source.subscribe(o); };
  }

  /**
   *  Hides the identity of an observable sequence.
   * @returns {Observable} An observable sequence that hides the identity of the source sequence.
   */
  observableProto.asObservable = function () {
    return new AnonymousObservable(asObservable(this), this);
  };

  function toArray(x) { return x.toArray(); }
  function notEmpty(x) { return x.length > 0; }

  /**
   *  Projects each element of an observable sequence into zero or more buffers which are produced based on element count information.
   * @param {Number} count Length of each buffer.
   * @param {Number} [skip] Number of elements to skip between creation of consecutive buffers. If not provided, defaults to the count.
   * @returns {Observable} An observable sequence of buffers.
   */
  observableProto.bufferWithCount = function (count, skip) {
    typeof skip !== 'number' && (skip = count);
    return this.windowWithCount(count, skip)
      .flatMap(toArray)
      .filter(notEmpty);
  };

  /**
   * Dematerializes the explicit notification values of an observable sequence as implicit notifications.
   * @returns {Observable} An observable sequence exhibiting the behavior corresponding to the source sequence's notification values.
   */
  observableProto.dematerialize = function () {
    var source = this;
    return new AnonymousObservable(function (o) {
      return source.subscribe(function (x) { return x.accept(o); }, function(e) { o.onError(e); }, function () { o.onCompleted(); });
    }, this);
  };

  var DistinctUntilChangedObservable = (function(__super__) {
    inherits(DistinctUntilChangedObservable, __super__);
    function DistinctUntilChangedObservable(source, keyFn, comparer) {
      this.source = source;
      this.keyFn = keyFn;
      this.comparer = comparer;
      __super__.call(this);
    }

    DistinctUntilChangedObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new DistinctUntilChangedObserver(o, this.keyFn, this.comparer));
    };

    return DistinctUntilChangedObservable;
  }(ObservableBase));

  var DistinctUntilChangedObserver = (function(__super__) {
    inherits(DistinctUntilChangedObserver, __super__);
    function DistinctUntilChangedObserver(o, keyFn, comparer) {
      this.o = o;
      this.keyFn = keyFn;
      this.comparer = comparer;
      this.hasCurrentKey = false;
      this.currentKey = null;
      __super__.call(this);
    }

    DistinctUntilChangedObserver.prototype.next = function (x) {
      var key = x, comparerEquals;
      if (isFunction(this.keyFn)) {
        key = tryCatch(this.keyFn)(x);
        if (key === errorObj) { return this.o.onError(key.e); }
      }
      if (this.hasCurrentKey) {
        comparerEquals = tryCatch(this.comparer)(this.currentKey, key);
        if (comparerEquals === errorObj) { return this.o.onError(comparerEquals.e); }
      }
      if (!this.hasCurrentKey || !comparerEquals) {
        this.hasCurrentKey = true;
        this.currentKey = key;
        this.o.onNext(x);
      }
    };
    DistinctUntilChangedObserver.prototype.error = function(e) {
      this.o.onError(e);
    };
    DistinctUntilChangedObserver.prototype.completed = function () {
      this.o.onCompleted();
    };

    return DistinctUntilChangedObserver;
  }(AbstractObserver));

  /**
  *  Returns an observable sequence that contains only distinct contiguous elements according to the keyFn and the comparer.
  * @param {Function} [keyFn] A function to compute the comparison key for each element. If not provided, it projects the value.
  * @param {Function} [comparer] Equality comparer for computed key values. If not provided, defaults to an equality comparer function.
  * @returns {Observable} An observable sequence only containing the distinct contiguous elements, based on a computed key value, from the source sequence.
  */
  observableProto.distinctUntilChanged = function (keyFn, comparer) {
    comparer || (comparer = defaultComparer);
    return new DistinctUntilChangedObservable(this, keyFn, comparer);
  };

  var TapObservable = (function(__super__) {
    inherits(TapObservable,__super__);
    function TapObservable(source, observerOrOnNext, onError, onCompleted) {
      this.source = source;
      this._oN = observerOrOnNext;
      this._oE = onError;
      this._oC = onCompleted;
      __super__.call(this);
    }

    TapObservable.prototype.subscribeCore = function(o) {
      return this.source.subscribe(new InnerObserver(o, this));
    };

    function InnerObserver(o, p) {
      this.o = o;
      this.t = !p._oN || isFunction(p._oN) ?
        observerCreate(p._oN || noop, p._oE || noop, p._oC || noop) :
        p._oN;
      this.isStopped = false;
    }
    InnerObserver.prototype.onNext = function(x) {
      if (this.isStopped) { return; }
      var res = tryCatch(this.t.onNext).call(this.t, x);
      if (res === errorObj) { this.o.onError(res.e); }
      this.o.onNext(x);
    };
    InnerObserver.prototype.onError = function(err) {
      if (!this.isStopped) {
        this.isStopped = true;
        var res = tryCatch(this.t.onError).call(this.t, err);
        if (res === errorObj) { return this.o.onError(res.e); }
        this.o.onError(err);
      }
    };
    InnerObserver.prototype.onCompleted = function() {
      if (!this.isStopped) {
        this.isStopped = true;
        var res = tryCatch(this.t.onCompleted).call(this.t);
        if (res === errorObj) { return this.o.onError(res.e); }
        this.o.onCompleted();
      }
    };
    InnerObserver.prototype.dispose = function() { this.isStopped = true; };
    InnerObserver.prototype.fail = function (e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.o.onError(e);
        return true;
      }
      return false;
    };

    return TapObservable;
  }(ObservableBase));

  /**
  *  Invokes an action for each element in the observable sequence and invokes an action upon graceful or exceptional termination of the observable sequence.
  *  This method can be used for debugging, logging, etc. of query behavior by intercepting the message stream to run arbitrary actions for messages on the pipeline.
  * @param {Function | Observer} observerOrOnNext Action to invoke for each element in the observable sequence or an o.
  * @param {Function} [onError]  Action to invoke upon exceptional termination of the observable sequence. Used if only the observerOrOnNext parameter is also a function.
  * @param {Function} [onCompleted]  Action to invoke upon graceful termination of the observable sequence. Used if only the observerOrOnNext parameter is also a function.
  * @returns {Observable} The source sequence with the side-effecting behavior applied.
  */
  observableProto['do'] = observableProto.tap = observableProto.doAction = function (observerOrOnNext, onError, onCompleted) {
    return new TapObservable(this, observerOrOnNext, onError, onCompleted);
  };

  /**
  *  Invokes an action for each element in the observable sequence.
  *  This method can be used for debugging, logging, etc. of query behavior by intercepting the message stream to run arbitrary actions for messages on the pipeline.
  * @param {Function} onNext Action to invoke for each element in the observable sequence.
  * @param {Any} [thisArg] Object to use as this when executing callback.
  * @returns {Observable} The source sequence with the side-effecting behavior applied.
  */
  observableProto.doOnNext = observableProto.tapOnNext = function (onNext, thisArg) {
    return this.tap(typeof thisArg !== 'undefined' ? function (x) { onNext.call(thisArg, x); } : onNext);
  };

  /**
  *  Invokes an action upon exceptional termination of the observable sequence.
  *  This method can be used for debugging, logging, etc. of query behavior by intercepting the message stream to run arbitrary actions for messages on the pipeline.
  * @param {Function} onError Action to invoke upon exceptional termination of the observable sequence.
  * @param {Any} [thisArg] Object to use as this when executing callback.
  * @returns {Observable} The source sequence with the side-effecting behavior applied.
  */
  observableProto.doOnError = observableProto.tapOnError = function (onError, thisArg) {
    return this.tap(noop, typeof thisArg !== 'undefined' ? function (e) { onError.call(thisArg, e); } : onError);
  };

  /**
  *  Invokes an action upon graceful termination of the observable sequence.
  *  This method can be used for debugging, logging, etc. of query behavior by intercepting the message stream to run arbitrary actions for messages on the pipeline.
  * @param {Function} onCompleted Action to invoke upon graceful termination of the observable sequence.
  * @param {Any} [thisArg] Object to use as this when executing callback.
  * @returns {Observable} The source sequence with the side-effecting behavior applied.
  */
  observableProto.doOnCompleted = observableProto.tapOnCompleted = function (onCompleted, thisArg) {
    return this.tap(noop, null, typeof thisArg !== 'undefined' ? function () { onCompleted.call(thisArg); } : onCompleted);
  };

  /**
   *  Invokes a specified action after the source observable sequence terminates gracefully or exceptionally.
   * @param {Function} finallyAction Action to invoke after the source observable sequence terminates.
   * @returns {Observable} Source sequence with the action-invoking termination behavior applied.
   */
  observableProto['finally'] = function (action) {
    var source = this;
    return new AnonymousObservable(function (observer) {
      var subscription = tryCatch(source.subscribe).call(source, observer);
      if (subscription === errorObj) {
        action();
        return thrower(subscription.e);
      }
      return disposableCreate(function () {
        var r = tryCatch(subscription.dispose).call(subscription);
        action();
        r === errorObj && thrower(r.e);
      });
    }, this);
  };

  var IgnoreElementsObservable = (function(__super__) {
    inherits(IgnoreElementsObservable, __super__);

    function IgnoreElementsObservable(source) {
      this.source = source;
      __super__.call(this);
    }

    IgnoreElementsObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new InnerObserver(o));
    };

    function InnerObserver(o) {
      this.o = o;
      this.isStopped = false;
    }
    InnerObserver.prototype.onNext = noop;
    InnerObserver.prototype.onError = function (err) {
      if(!this.isStopped) {
        this.isStopped = true;
        this.o.onError(err);
      }
    };
    InnerObserver.prototype.onCompleted = function () {
      if(!this.isStopped) {
        this.isStopped = true;
        this.o.onCompleted();
      }
    };
    InnerObserver.prototype.dispose = function() { this.isStopped = true; };
    InnerObserver.prototype.fail = function (e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.observer.onError(e);
        return true;
      }

      return false;
    };

    return IgnoreElementsObservable;
  }(ObservableBase));

  /**
   *  Ignores all elements in an observable sequence leaving only the termination messages.
   * @returns {Observable} An empty observable sequence that signals termination, successful or exceptional, of the source sequence.
   */
  observableProto.ignoreElements = function () {
    return new IgnoreElementsObservable(this);
  };

  /**
   *  Materializes the implicit notifications of an observable sequence as explicit notification values.
   * @returns {Observable} An observable sequence containing the materialized notification values from the source sequence.
   */
  observableProto.materialize = function () {
    var source = this;
    return new AnonymousObservable(function (observer) {
      return source.subscribe(function (value) {
        observer.onNext(notificationCreateOnNext(value));
      }, function (e) {
        observer.onNext(notificationCreateOnError(e));
        observer.onCompleted();
      }, function () {
        observer.onNext(notificationCreateOnCompleted());
        observer.onCompleted();
      });
    }, source);
  };

  /**
   *  Repeats the observable sequence a specified number of times. If the repeat count is not specified, the sequence repeats indefinitely.
   * @param {Number} [repeatCount]  Number of times to repeat the sequence. If not provided, repeats the sequence indefinitely.
   * @returns {Observable} The observable sequence producing the elements of the given sequence repeatedly.
   */
  observableProto.repeat = function (repeatCount) {
    return enumerableRepeat(this, repeatCount).concat();
  };

  /**
   *  Repeats the source observable sequence the specified number of times or until it successfully terminates. If the retry count is not specified, it retries indefinitely.
   *  Note if you encounter an error and want it to retry once, then you must use .retry(2);
   *
   * @example
   *  var res = retried = retry.repeat();
   *  var res = retried = retry.repeat(2);
   * @param {Number} [retryCount]  Number of times to retry the sequence. If not provided, retry the sequence indefinitely.
   * @returns {Observable} An observable sequence producing the elements of the given sequence repeatedly until it terminates successfully.
   */
  observableProto.retry = function (retryCount) {
    return enumerableRepeat(this, retryCount).catchError();
  };

  /**
   *  Repeats the source observable sequence upon error each time the notifier emits or until it successfully terminates. 
   *  if the notifier completes, the observable sequence completes.
   *
   * @example
   *  var timer = Observable.timer(500);
   *  var source = observable.retryWhen(timer);
   * @param {Observable} [notifier] An observable that triggers the retries or completes the observable with onNext or onCompleted respectively.
   * @returns {Observable} An observable sequence producing the elements of the given sequence repeatedly until it terminates successfully.
   */
  observableProto.retryWhen = function (notifier) {
    return enumerableRepeat(this).catchErrorWhen(notifier);
  };
  var ScanObservable = (function(__super__) {
    inherits(ScanObservable, __super__);
    function ScanObservable(source, accumulator, hasSeed, seed) {
      this.source = source;
      this.accumulator = accumulator;
      this.hasSeed = hasSeed;
      this.seed = seed;
      __super__.call(this);
    }

    ScanObservable.prototype.subscribeCore = function(o) {
      return this.source.subscribe(new InnerObserver(o,this));
    };

    return ScanObservable;
  }(ObservableBase));

  function InnerObserver(o, parent) {
    this.o = o;
    this.accumulator = parent.accumulator;
    this.hasSeed = parent.hasSeed;
    this.seed = parent.seed;
    this.hasAccumulation = false;
    this.accumulation = null;
    this.hasValue = false;
    this.isStopped = false;
  }
  InnerObserver.prototype = {
    onNext: function (x) {
      if (this.isStopped) { return; }
      !this.hasValue && (this.hasValue = true);
      if (this.hasAccumulation) {
        this.accumulation = tryCatch(this.accumulator)(this.accumulation, x);
      } else {
        this.accumulation = this.hasSeed ? tryCatch(this.accumulator)(this.seed, x) : x;
        this.hasAccumulation = true;
      }
      if (this.accumulation === errorObj) { return this.o.onError(this.accumulation.e); }
      this.o.onNext(this.accumulation);
    },
    onError: function (e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.o.onError(e);
      }
    },
    onCompleted: function () {
      if (!this.isStopped) {
        this.isStopped = true;
        !this.hasValue && this.hasSeed && this.o.onNext(this.seed);
        this.o.onCompleted();
      }
    },
    dispose: function() { this.isStopped = true; },
    fail: function (e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.o.onError(e);
        return true;
      }
      return false;
    }
  };

  /**
  *  Applies an accumulator function over an observable sequence and returns each intermediate result. The optional seed value is used as the initial accumulator value.
  *  For aggregation behavior with no intermediate results, see Observable.aggregate.
  * @param {Mixed} [seed] The initial accumulator value.
  * @param {Function} accumulator An accumulator function to be invoked on each element.
  * @returns {Observable} An observable sequence containing the accumulated values.
  */
  observableProto.scan = function () {
    var hasSeed = false, seed, accumulator = arguments[0];
    if (arguments.length === 2) {
      hasSeed = true;
      seed = arguments[1];
    }
    return new ScanObservable(this, accumulator, hasSeed, seed);
  };

  /**
   *  Bypasses a specified number of elements at the end of an observable sequence.
   * @description
   *  This operator accumulates a queue with a length enough to store the first `count` elements. As more elements are
   *  received, elements are taken from the front of the queue and produced on the result sequence. This causes elements to be delayed.
   * @param count Number of elements to bypass at the end of the source sequence.
   * @returns {Observable} An observable sequence containing the source sequence elements except for the bypassed ones at the end.
   */
  observableProto.skipLast = function (count) {
    if (count < 0) { throw new ArgumentOutOfRangeError(); }
    var source = this;
    return new AnonymousObservable(function (o) {
      var q = [];
      return source.subscribe(function (x) {
        q.push(x);
        q.length > count && o.onNext(q.shift());
      }, function (e) { o.onError(e); }, function () { o.onCompleted(); });
    }, source);
  };

  /**
   *  Prepends a sequence of values to an observable sequence with an optional scheduler and an argument list of values to prepend.
   *  @example
   *  var res = source.startWith(1, 2, 3);
   *  var res = source.startWith(Rx.Scheduler.timeout, 1, 2, 3);
   * @param {Arguments} args The specified values to prepend to the observable sequence
   * @returns {Observable} The source sequence prepended with the specified values.
   */
  observableProto.startWith = function () {
    var values, scheduler, start = 0;
    if (!!arguments.length && isScheduler(arguments[0])) {
      scheduler = arguments[0];
      start = 1;
    } else {
      scheduler = immediateScheduler;
    }
    for(var args = [], i = start, len = arguments.length; i < len; i++) { args.push(arguments[i]); }
    return enumerableOf([observableFromArray(args, scheduler), this]).concat();
  };

  /**
   *  Returns a specified number of contiguous elements from the end of an observable sequence.
   * @description
   *  This operator accumulates a buffer with a length enough to store elements count elements. Upon completion of
   *  the source sequence, this buffer is drained on the result sequence. This causes the elements to be delayed.
   * @param {Number} count Number of elements to take from the end of the source sequence.
   * @returns {Observable} An observable sequence containing the specified number of elements from the end of the source sequence.
   */
  observableProto.takeLast = function (count) {
    if (count < 0) { throw new ArgumentOutOfRangeError(); }
    var source = this;
    return new AnonymousObservable(function (o) {
      var q = [];
      return source.subscribe(function (x) {
        q.push(x);
        q.length > count && q.shift();
      }, function (e) { o.onError(e); }, function () {
        while (q.length > 0) { o.onNext(q.shift()); }
        o.onCompleted();
      });
    }, source);
  };

  /**
   *  Returns an array with the specified number of contiguous elements from the end of an observable sequence.
   *
   * @description
   *  This operator accumulates a buffer with a length enough to store count elements. Upon completion of the
   *  source sequence, this buffer is produced on the result sequence.
   * @param {Number} count Number of elements to take from the end of the source sequence.
   * @returns {Observable} An observable sequence containing a single array with the specified number of elements from the end of the source sequence.
   */
  observableProto.takeLastBuffer = function (count) {
    var source = this;
    return new AnonymousObservable(function (o) {
      var q = [];
      return source.subscribe(function (x) {
        q.push(x);
        q.length > count && q.shift();
      }, function (e) { o.onError(e); }, function () {
        o.onNext(q);
        o.onCompleted();
      });
    }, source);
  };

  /**
   *  Projects each element of an observable sequence into zero or more windows which are produced based on element count information.
   *
   *  var res = xs.windowWithCount(10);
   *  var res = xs.windowWithCount(10, 1);
   * @param {Number} count Length of each window.
   * @param {Number} [skip] Number of elements to skip between creation of consecutive windows. If not specified, defaults to the count.
   * @returns {Observable} An observable sequence of windows.
   */
  observableProto.windowWithCount = function (count, skip) {
    var source = this;
    +count || (count = 0);
    Math.abs(count) === Infinity && (count = 0);
    if (count <= 0) { throw new ArgumentOutOfRangeError(); }
    skip == null && (skip = count);
    +skip || (skip = 0);
    Math.abs(skip) === Infinity && (skip = 0);

    if (skip <= 0) { throw new ArgumentOutOfRangeError(); }
    return new AnonymousObservable(function (observer) {
      var m = new SingleAssignmentDisposable(),
        refCountDisposable = new RefCountDisposable(m),
        n = 0,
        q = [];

      function createWindow () {
        var s = new Subject();
        q.push(s);
        observer.onNext(addRef(s, refCountDisposable));
      }

      createWindow();

      m.setDisposable(source.subscribe(
        function (x) {
          for (var i = 0, len = q.length; i < len; i++) { q[i].onNext(x); }
          var c = n - count + 1;
          c >= 0 && c % skip === 0 && q.shift().onCompleted();
          ++n % skip === 0 && createWindow();
        },
        function (e) {
          while (q.length > 0) { q.shift().onError(e); }
          observer.onError(e);
        },
        function () {
          while (q.length > 0) { q.shift().onCompleted(); }
          observer.onCompleted();
        }
      ));
      return refCountDisposable;
    }, source);
  };

observableProto.flatMapConcat = observableProto.concatMap = function(selector, resultSelector, thisArg) {
    return new FlatMapObservable(this, selector, resultSelector, thisArg).merge(1);
};
  /**
   * Projects each notification of an observable sequence to an observable sequence and concats the resulting observable sequences into one observable sequence.
   * @param {Function} onNext A transform function to apply to each element; the second parameter of the function represents the index of the source element.
   * @param {Function} onError A transform function to apply when an error occurs in the source sequence.
   * @param {Function} onCompleted A transform function to apply when the end of the source sequence is reached.
   * @param {Any} [thisArg] An optional "this" to use to invoke each transform.
   * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function corresponding to each notification in the input sequence.
   */
  observableProto.concatMapObserver = observableProto.selectConcatObserver = function(onNext, onError, onCompleted, thisArg) {
    var source = this,
        onNextFunc = bindCallback(onNext, thisArg, 2),
        onErrorFunc = bindCallback(onError, thisArg, 1),
        onCompletedFunc = bindCallback(onCompleted, thisArg, 0);
    return new AnonymousObservable(function (observer) {
      var index = 0;
      return source.subscribe(
        function (x) {
          var result;
          try {
            result = onNextFunc(x, index++);
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
        },
        function (err) {
          var result;
          try {
            result = onErrorFunc(err);
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        },
        function () {
          var result;
          try {
            result = onCompletedFunc();
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        });
    }, this).concatAll();
  };

    /**
     *  Returns the elements of the specified sequence or the specified value in a singleton sequence if the sequence is empty.
     *
     *  var res = obs = xs.defaultIfEmpty();
     *  2 - obs = xs.defaultIfEmpty(false);
     *
     * @memberOf Observable#
     * @param defaultValue The value to return if the sequence is empty. If not provided, this defaults to null.
     * @returns {Observable} An observable sequence that contains the specified default value if the source is empty; otherwise, the elements of the source itself.
     */
    observableProto.defaultIfEmpty = function (defaultValue) {
      var source = this;
      defaultValue === undefined && (defaultValue = null);
      return new AnonymousObservable(function (observer) {
        var found = false;
        return source.subscribe(function (x) {
          found = true;
          observer.onNext(x);
        },
        function (e) { observer.onError(e); }, 
        function () {
          !found && observer.onNext(defaultValue);
          observer.onCompleted();
        });
      }, source);
    };

  // Swap out for Array.findIndex
  function arrayIndexOfComparer(array, item, comparer) {
    for (var i = 0, len = array.length; i < len; i++) {
      if (comparer(array[i], item)) { return i; }
    }
    return -1;
  }

  function HashSet(comparer) {
    this.comparer = comparer;
    this.set = [];
  }
  HashSet.prototype.push = function(value) {
    var retValue = arrayIndexOfComparer(this.set, value, this.comparer) === -1;
    retValue && this.set.push(value);
    return retValue;
  };

  /**
   *  Returns an observable sequence that contains only distinct elements according to the keySelector and the comparer.
   *  Usage of this operator should be considered carefully due to the maintenance of an internal lookup structure which can grow large.
   *
   * @example
   *  var res = obs = xs.distinct();
   *  2 - obs = xs.distinct(function (x) { return x.id; });
   *  2 - obs = xs.distinct(function (x) { return x.id; }, function (a,b) { return a === b; });
   * @param {Function} [keySelector]  A function to compute the comparison key for each element.
   * @param {Function} [comparer]  Used to compare items in the collection.
   * @returns {Observable} An observable sequence only containing the distinct elements, based on a computed key value, from the source sequence.
   */
  observableProto.distinct = function (keySelector, comparer) {
    var source = this;
    comparer || (comparer = defaultComparer);
    return new AnonymousObservable(function (o) {
      var hashSet = new HashSet(comparer);
      return source.subscribe(function (x) {
        var key = x;

        if (keySelector) {
          try {
            key = keySelector(x);
          } catch (e) {
            o.onError(e);
            return;
          }
        }
        hashSet.push(key) && o.onNext(x);
      },
      function (e) { o.onError(e); }, function () { o.onCompleted(); });
    }, this);
  };

  var MapObservable = (function (__super__) {
    inherits(MapObservable, __super__);

    function MapObservable(source, selector, thisArg) {
      this.source = source;
      this.selector = bindCallback(selector, thisArg, 3);
      __super__.call(this);
    }

    function innerMap(selector, self) {
      return function (x, i, o) { return selector.call(this, self.selector(x, i, o), i, o); }
    }

    MapObservable.prototype.internalMap = function (selector, thisArg) {
      return new MapObservable(this.source, innerMap(selector, this), thisArg);
    };

    MapObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new InnerObserver(o, this.selector, this));
    };

    function InnerObserver(o, selector, source) {
      this.o = o;
      this.selector = selector;
      this.source = source;
      this.i = 0;
      this.isStopped = false;
    }

    InnerObserver.prototype.onNext = function(x) {
      if (this.isStopped) { return; }
      var result = tryCatch(this.selector)(x, this.i++, this.source);
      if (result === errorObj) { return this.o.onError(result.e); }
      this.o.onNext(result);
    };
    InnerObserver.prototype.onError = function (e) {
      if(!this.isStopped) { this.isStopped = true; this.o.onError(e); }
    };
    InnerObserver.prototype.onCompleted = function () {
      if(!this.isStopped) { this.isStopped = true; this.o.onCompleted(); }
    };
    InnerObserver.prototype.dispose = function() { this.isStopped = true; };
    InnerObserver.prototype.fail = function (e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.o.onError(e);
        return true;
      }

      return false;
    };

    return MapObservable;

  }(ObservableBase));

  /**
  * Projects each element of an observable sequence into a new form by incorporating the element's index.
  * @param {Function} selector A transform function to apply to each source element; the second parameter of the function represents the index of the source element.
  * @param {Any} [thisArg] Object to use as this when executing callback.
  * @returns {Observable} An observable sequence whose elements are the result of invoking the transform function on each element of source.
  */
  observableProto.map = observableProto.select = function (selector, thisArg) {
    var selectorFn = typeof selector === 'function' ? selector : function () { return selector; };
    return this instanceof MapObservable ?
      this.internalMap(selectorFn, thisArg) :
      new MapObservable(this, selectorFn, thisArg);
  };

  function plucker(args, len) {
    return function mapper(x) {
      var currentProp = x;
      for (var i = 0; i < len; i++) {
        var p = currentProp[args[i]];
        if (typeof p !== 'undefined') {
          currentProp = p;
        } else {
          return undefined;
        }
      }
      return currentProp;
    }
  }

  /**
   * Retrieves the value of a specified nested property from all elements in
   * the Observable sequence.
   * @param {Arguments} arguments The nested properties to pluck.
   * @returns {Observable} Returns a new Observable sequence of property values.
   */
  observableProto.pluck = function () {
    var len = arguments.length, args = new Array(len);
    if (len === 0) { throw new Error('List of properties cannot be empty.'); }
    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    return this.map(plucker(args, len));
  };

observableProto.flatMap = observableProto.selectMany = function(selector, resultSelector, thisArg) {
    return new FlatMapObservable(this, selector, resultSelector, thisArg).mergeAll();
};


//
//Rx.Observable.prototype.flatMapWithMaxConcurrent = function(limit, selector, resultSelector, thisArg) {
//    return new FlatMapObservable(this, selector, resultSelector, thisArg).merge(limit);
//};
//

  /**
   * Projects each notification of an observable sequence to an observable sequence and merges the resulting observable sequences into one observable sequence.
   * @param {Function} onNext A transform function to apply to each element; the second parameter of the function represents the index of the source element.
   * @param {Function} onError A transform function to apply when an error occurs in the source sequence.
   * @param {Function} onCompleted A transform function to apply when the end of the source sequence is reached.
   * @param {Any} [thisArg] An optional "this" to use to invoke each transform.
   * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function corresponding to each notification in the input sequence.
   */
  observableProto.flatMapObserver = observableProto.selectManyObserver = function (onNext, onError, onCompleted, thisArg) {
    var source = this;
    return new AnonymousObservable(function (observer) {
      var index = 0;

      return source.subscribe(
        function (x) {
          var result;
          try {
            result = onNext.call(thisArg, x, index++);
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
        },
        function (err) {
          var result;
          try {
            result = onError.call(thisArg, err);
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        },
        function () {
          var result;
          try {
            result = onCompleted.call(thisArg);
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        });
    }, source).mergeAll();
  };

Rx.Observable.prototype.flatMapLatest = function(selector, resultSelector, thisArg) {
    return new FlatMapObservable(this, selector, resultSelector, thisArg).switchLatest();
};
  var SkipObservable = (function(__super__) {
    inherits(SkipObservable, __super__);
    function SkipObservable(source, count) {
      this.source = source;
      this.skipCount = count;
      __super__.call(this);
    }
    
    SkipObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new InnerObserver(o, this.skipCount));
    };
    
    function InnerObserver(o, c) {
      this.c = c;
      this.r = c;
      this.o = o;
      this.isStopped = false;
    }
    InnerObserver.prototype.onNext = function (x) {
      if (this.isStopped) { return; }
      if (this.r <= 0) { 
        this.o.onNext(x);
      } else {
        this.r--;
      }
    };
    InnerObserver.prototype.onError = function(e) {
      if (!this.isStopped) { this.isStopped = true; this.o.onError(e); }
    };
    InnerObserver.prototype.onCompleted = function() {
      if (!this.isStopped) { this.isStopped = true; this.o.onCompleted(); }
    };
    InnerObserver.prototype.dispose = function() { this.isStopped = true; };
    InnerObserver.prototype.fail = function(e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.o.onError(e);
        return true;
      }
      return false;
    };
    
    return SkipObservable;
  }(ObservableBase));  
  
  /**
   * Bypasses a specified number of elements in an observable sequence and then returns the remaining elements.
   * @param {Number} count The number of elements to skip before returning the remaining elements.
   * @returns {Observable} An observable sequence that contains the elements that occur after the specified index in the input sequence.
   */
  observableProto.skip = function (count) {
    if (count < 0) { throw new ArgumentOutOfRangeError(); }
    return new SkipObservable(this, count);
  };
  /**
   *  Bypasses elements in an observable sequence as long as a specified condition is true and then returns the remaining elements.
   *  The element's index is used in the logic of the predicate function.
   *
   *  var res = source.skipWhile(function (value) { return value < 10; });
   *  var res = source.skipWhile(function (value, index) { return value < 10 || index < 10; });
   * @param {Function} predicate A function to test each element for a condition; the second parameter of the function represents the index of the source element.
   * @param {Any} [thisArg] Object to use as this when executing callback.
   * @returns {Observable} An observable sequence that contains the elements from the input sequence starting at the first element in the linear series that does not pass the test specified by predicate.
   */
  observableProto.skipWhile = function (predicate, thisArg) {
    var source = this,
        callback = bindCallback(predicate, thisArg, 3);
    return new AnonymousObservable(function (o) {
      var i = 0, running = false;
      return source.subscribe(function (x) {
        if (!running) {
          try {
            running = !callback(x, i++, source);
          } catch (e) {
            o.onError(e);
            return;
          }
        }
        running && o.onNext(x);
      }, function (e) { o.onError(e); }, function () { o.onCompleted(); });
    }, source);
  };

  /**
   *  Returns a specified number of contiguous elements from the start of an observable sequence, using the specified scheduler for the edge case of take(0).
   *
   *  var res = source.take(5);
   *  var res = source.take(0, Rx.Scheduler.timeout);
   * @param {Number} count The number of elements to return.
   * @param {Scheduler} [scheduler] Scheduler used to produce an OnCompleted message in case <paramref name="count count</paramref> is set to 0.
   * @returns {Observable} An observable sequence that contains the specified number of elements from the start of the input sequence.
   */
  observableProto.take = function (count, scheduler) {
    if (count < 0) { throw new ArgumentOutOfRangeError(); }
    if (count === 0) { return observableEmpty(scheduler); }
    var source = this;
    return new AnonymousObservable(function (o) {
      var remaining = count;
      return source.subscribe(function (x) {
        if (remaining-- > 0) {
          o.onNext(x);
          remaining <= 0 && o.onCompleted();
        }
      }, function (e) { o.onError(e); }, function () { o.onCompleted(); });
    }, source);
  };

  /**
   *  Returns elements from an observable sequence as long as a specified condition is true.
   *  The element's index is used in the logic of the predicate function.
   * @param {Function} predicate A function to test each element for a condition; the second parameter of the function represents the index of the source element.
   * @param {Any} [thisArg] Object to use as this when executing callback.
   * @returns {Observable} An observable sequence that contains the elements from the input sequence that occur before the element at which the test no longer passes.
   */
  observableProto.takeWhile = function (predicate, thisArg) {
    var source = this,
        callback = bindCallback(predicate, thisArg, 3);
    return new AnonymousObservable(function (o) {
      var i = 0, running = true;
      return source.subscribe(function (x) {
        if (running) {
          try {
            running = callback(x, i++, source);
          } catch (e) {
            o.onError(e);
            return;
          }
          if (running) {
            o.onNext(x);
          } else {
            o.onCompleted();
          }
        }
      }, function (e) { o.onError(e); }, function () { o.onCompleted(); });
    }, source);
  };

  var FilterObservable = (function (__super__) {
    inherits(FilterObservable, __super__);

    function FilterObservable(source, predicate, thisArg) {
      this.source = source;
      this.predicate = bindCallback(predicate, thisArg, 3);
      __super__.call(this);
    }

    FilterObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new InnerObserver(o, this.predicate, this));
    };
    
    function innerPredicate(predicate, self) {
      return function(x, i, o) { return self.predicate(x, i, o) && predicate.call(this, x, i, o); }
    }

    FilterObservable.prototype.internalFilter = function(predicate, thisArg) {
      return new FilterObservable(this.source, innerPredicate(predicate, this), thisArg);
    };
    
    function InnerObserver(o, predicate, source) {
      this.o = o;
      this.predicate = predicate;
      this.source = source;
      this.i = 0;
      this.isStopped = false;
    }
  
    InnerObserver.prototype.onNext = function(x) {
      if (this.isStopped) { return; }
      var shouldYield = tryCatch(this.predicate)(x, this.i++, this.source);
      if (shouldYield === errorObj) {
        return this.o.onError(shouldYield.e);
      }
      shouldYield && this.o.onNext(x);
    };
    InnerObserver.prototype.onError = function (e) {
      if(!this.isStopped) { this.isStopped = true; this.o.onError(e); }
    };
    InnerObserver.prototype.onCompleted = function () {
      if(!this.isStopped) { this.isStopped = true; this.o.onCompleted(); }
    };
    InnerObserver.prototype.dispose = function() { this.isStopped = true; };
    InnerObserver.prototype.fail = function (e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.o.onError(e);
        return true;
      }
      return false;
    };

    return FilterObservable;

  }(ObservableBase));

  /**
  *  Filters the elements of an observable sequence based on a predicate by incorporating the element's index.
  * @param {Function} predicate A function to test each source element for a condition; the second parameter of the function represents the index of the source element.
  * @param {Any} [thisArg] Object to use as this when executing callback.
  * @returns {Observable} An observable sequence that contains elements from the input sequence that satisfy the condition.
  */
  observableProto.filter = observableProto.where = function (predicate, thisArg) {
    return this instanceof FilterObservable ? this.internalFilter(predicate, thisArg) :
      new FilterObservable(this, predicate, thisArg);
  };

  /**
   * Executes a transducer to transform the observable sequence
   * @param {Transducer} transducer A transducer to execute
   * @returns {Observable} An Observable sequence containing the results from the transducer.
   */
  observableProto.transduce = function(transducer) {
    var source = this;

    function transformForObserver(o) {
      return {
        '@@transducer/init': function() {
          return o;
        },
        '@@transducer/step': function(obs, input) {
          return obs.onNext(input);
        },
        '@@transducer/result': function(obs) {
          return obs.onCompleted();
        }
      };
    }

    return new AnonymousObservable(function(o) {
      var xform = transducer(transformForObserver(o));
      return source.subscribe(
        function(v) {
          var res = tryCatch(xform['@@transducer/step']).call(xform, o, v);
          if (res === errorObj) { o.onError(res.e); }
        },
        function (e) { o.onError(e); },
        function() { xform['@@transducer/result'](o); }
      );
    }, source);
  };

  var AnonymousObservable = Rx.AnonymousObservable = (function (__super__) {
    inherits(AnonymousObservable, __super__);

    // Fix subscriber to check for undefined or function returned to decorate as Disposable
    function fixSubscriber(subscriber) {
      return subscriber && isFunction(subscriber.dispose) ? subscriber :
        isFunction(subscriber) ? disposableCreate(subscriber) : disposableEmpty;
    }

    function setDisposable(s, state) {
      var ado = state[0], self = state[1];
      var sub = tryCatch(self.__subscribe).call(self, ado);

      if (sub === errorObj) {
        if(!ado.fail(errorObj.e)) { return thrower(errorObj.e); }
      }
      ado.setDisposable(fixSubscriber(sub));
    }

    function innerSubscribe(observer) {
      var ado = new AutoDetachObserver(observer), state = [ado, this];

      if (currentThreadScheduler.scheduleRequired()) {
        currentThreadScheduler.scheduleWithState(state, setDisposable);
      } else {
        setDisposable(null, state);
      }
      return ado;
    }

    function AnonymousObservable(subscribe, parent) {
      this.source = parent;
      this.__subscribe = subscribe;
      __super__.call(this, innerSubscribe);
    }

    return AnonymousObservable;

  }(Observable));

  var AutoDetachObserver = (function (__super__) {
    inherits(AutoDetachObserver, __super__);

    function AutoDetachObserver(observer) {
      __super__.call(this);
      this.observer = observer;
      this.m = new SingleAssignmentDisposable();
    }

    var AutoDetachObserverPrototype = AutoDetachObserver.prototype;

    AutoDetachObserverPrototype.next = function (value) {
      var result = tryCatch(this.observer.onNext).call(this.observer, value);
      if (result === errorObj) {
        this.dispose();
        thrower(result.e);
      }
    };

    AutoDetachObserverPrototype.error = function (err) {
      var result = tryCatch(this.observer.onError).call(this.observer, err);
      this.dispose();
      result === errorObj && thrower(result.e);
    };

    AutoDetachObserverPrototype.completed = function () {
      var result = tryCatch(this.observer.onCompleted).call(this.observer);
      this.dispose();
      result === errorObj && thrower(result.e);
    };

    AutoDetachObserverPrototype.setDisposable = function (value) { this.m.setDisposable(value); };
    AutoDetachObserverPrototype.getDisposable = function () { return this.m.getDisposable(); };

    AutoDetachObserverPrototype.dispose = function () {
      __super__.prototype.dispose.call(this);
      this.m.dispose();
    };

    return AutoDetachObserver;
  }(AbstractObserver));

  var InnerSubscription = function (subject, observer) {
    this.subject = subject;
    this.observer = observer;
  };

  InnerSubscription.prototype.dispose = function () {
    if (!this.subject.isDisposed && this.observer !== null) {
      var idx = this.subject.observers.indexOf(this.observer);
      this.subject.observers.splice(idx, 1);
      this.observer = null;
    }
  };

  /**
   *  Represents an object that is both an observable sequence as well as an observer.
   *  Each notification is broadcasted to all subscribed observers.
   */
  var Subject = Rx.Subject = (function (__super__) {
    function subscribe(observer) {
      checkDisposed(this);
      if (!this.isStopped) {
        this.observers.push(observer);
        return new InnerSubscription(this, observer);
      }
      if (this.hasError) {
        observer.onError(this.error);
        return disposableEmpty;
      }
      observer.onCompleted();
      return disposableEmpty;
    }

    inherits(Subject, __super__);

    /**
     * Creates a subject.
     */
    function Subject() {
      __super__.call(this, subscribe);
      this.isDisposed = false,
      this.isStopped = false,
      this.observers = [];
      this.hasError = false;
    }

    addProperties(Subject.prototype, Observer.prototype, {
      /**
       * Indicates whether the subject has observers subscribed to it.
       * @returns {Boolean} Indicates whether the subject has observers subscribed to it.
       */
      hasObservers: function () { return this.observers.length > 0; },
      /**
       * Notifies all subscribed observers about the end of the sequence.
       */
      onCompleted: function () {
        checkDisposed(this);
        if (!this.isStopped) {
          this.isStopped = true;
          for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
            os[i].onCompleted();
          }

          this.observers.length = 0;
        }
      },
      /**
       * Notifies all subscribed observers about the exception.
       * @param {Mixed} error The exception to send to all observers.
       */
      onError: function (error) {
        checkDisposed(this);
        if (!this.isStopped) {
          this.isStopped = true;
          this.error = error;
          this.hasError = true;
          for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
            os[i].onError(error);
          }

          this.observers.length = 0;
        }
      },
      /**
       * Notifies all subscribed observers about the arrival of the specified element in the sequence.
       * @param {Mixed} value The value to send to all observers.
       */
      onNext: function (value) {
        checkDisposed(this);
        if (!this.isStopped) {
          for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
            os[i].onNext(value);
          }
        }
      },
      /**
       * Unsubscribe all observers and release resources.
       */
      dispose: function () {
        this.isDisposed = true;
        this.observers = null;
      }
    });

    /**
     * Creates a subject from the specified observer and observable.
     * @param {Observer} observer The observer used to send messages to the subject.
     * @param {Observable} observable The observable used to subscribe to messages sent from the subject.
     * @returns {Subject} Subject implemented using the given observer and observable.
     */
    Subject.create = function (observer, observable) {
      return new AnonymousSubject(observer, observable);
    };

    return Subject;
  }(Observable));

  /**
   *  Represents the result of an asynchronous operation.
   *  The last value before the OnCompleted notification, or the error received through OnError, is sent to all subscribed observers.
   */
  var AsyncSubject = Rx.AsyncSubject = (function (__super__) {

    function subscribe(observer) {
      checkDisposed(this);

      if (!this.isStopped) {
        this.observers.push(observer);
        return new InnerSubscription(this, observer);
      }

      if (this.hasError) {
        observer.onError(this.error);
      } else if (this.hasValue) {
        observer.onNext(this.value);
        observer.onCompleted();
      } else {
        observer.onCompleted();
      }

      return disposableEmpty;
    }

    inherits(AsyncSubject, __super__);

    /**
     * Creates a subject that can only receive one value and that value is cached for all future observations.
     * @constructor
     */
    function AsyncSubject() {
      __super__.call(this, subscribe);

      this.isDisposed = false;
      this.isStopped = false;
      this.hasValue = false;
      this.observers = [];
      this.hasError = false;
    }

    addProperties(AsyncSubject.prototype, Observer, {
      /**
       * Indicates whether the subject has observers subscribed to it.
       * @returns {Boolean} Indicates whether the subject has observers subscribed to it.
       */
      hasObservers: function () {
        checkDisposed(this);
        return this.observers.length > 0;
      },
      /**
       * Notifies all subscribed observers about the end of the sequence, also causing the last received value to be sent out (if any).
       */
      onCompleted: function () {
        var i, len;
        checkDisposed(this);
        if (!this.isStopped) {
          this.isStopped = true;
          var os = cloneArray(this.observers), len = os.length;

          if (this.hasValue) {
            for (i = 0; i < len; i++) {
              var o = os[i];
              o.onNext(this.value);
              o.onCompleted();
            }
          } else {
            for (i = 0; i < len; i++) {
              os[i].onCompleted();
            }
          }

          this.observers.length = 0;
        }
      },
      /**
       * Notifies all subscribed observers about the error.
       * @param {Mixed} error The Error to send to all observers.
       */
      onError: function (error) {
        checkDisposed(this);
        if (!this.isStopped) {
          this.isStopped = true;
          this.hasError = true;
          this.error = error;

          for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
            os[i].onError(error);
          }

          this.observers.length = 0;
        }
      },
      /**
       * Sends a value to the subject. The last value received before successful termination will be sent to all subscribed and future observers.
       * @param {Mixed} value The value to store in the subject.
       */
      onNext: function (value) {
        checkDisposed(this);
        if (this.isStopped) { return; }
        this.value = value;
        this.hasValue = true;
      },
      /**
       * Unsubscribe all observers and release resources.
       */
      dispose: function () {
        this.isDisposed = true;
        this.observers = null;
        this.exception = null;
        this.value = null;
      }
    });

    return AsyncSubject;
  }(Observable));

  var AnonymousSubject = Rx.AnonymousSubject = (function (__super__) {
    inherits(AnonymousSubject, __super__);

    function subscribe(observer) {
      return this.observable.subscribe(observer);
    }

    function AnonymousSubject(observer, observable) {
      this.observer = observer;
      this.observable = observable;
      __super__.call(this, subscribe);
    }

    addProperties(AnonymousSubject.prototype, Observer.prototype, {
      onCompleted: function () {
        this.observer.onCompleted();
      },
      onError: function (error) {
        this.observer.onError(error);
      },
      onNext: function (value) {
        this.observer.onNext(value);
      }
    });

    return AnonymousSubject;
  }(Observable));

  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    root.Rx = Rx;

    define(function() {
      return Rx;
    });
  } else if (freeExports && freeModule) {
    // in Node.js or RingoJS
    if (moduleExports) {
      (freeModule.exports = Rx).Rx = Rx;
    } else {
      freeExports.Rx = Rx;
    }
  } else {
    // in a browser or Rhino
    root.Rx = Rx;
  }

  // All code before this point will be filtered from stack traces.
  var rEndingLine = captureLine();

}.call(this));
