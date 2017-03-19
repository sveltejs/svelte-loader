/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export noop */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "i", function() { return dispatchObservers; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return appendNode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return insertNode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return detachNode; });
/* unused harmony export detachBetween */
/* unused harmony export teardownEach */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return createElement; });
/* unused harmony export createSvgElement */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return createText; });
/* unused harmony export createComment */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return addEventListener; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return removeEventListener; });
/* unused harmony export setAttribute */
/* unused harmony export setXlinkAttribute */
/* unused harmony export getBindingGroupValue */
/* unused harmony export get */
/* unused harmony export fire */
/* unused harmony export observe */
/* unused harmony export observeDev */
/* unused harmony export on */
/* unused harmony export onDev */
/* unused harmony export set */
/* unused harmony export _flush */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return proto; });
/* unused harmony export protoDev */
function appendNode ( node, target ) {
	target.appendChild( node );
}

function insertNode ( node, target, anchor ) {
	target.insertBefore( node, anchor );
}

function detachNode ( node ) {
	node.parentNode.removeChild( node );
}

function detachBetween ( before, after ) {
	while ( before.nextSibling && before.nextSibling !== after ) {
		before.parentNode.removeChild( before.nextSibling );
	}
}

function teardownEach ( iterations, detach, start ) {
	for ( var i = ( start || 0 ); i < iterations.length; i += 1 ) {
		iterations[i].teardown( detach );
	}
}

function createElement ( name ) {
	return document.createElement( name );
}

function createSvgElement ( name ) {
	return document.createElementNS( 'http://www.w3.org/2000/svg', name );
}

function createText ( data ) {
	return document.createTextNode( data );
}

function createComment () {
	return document.createComment( '' );
}

function addEventListener ( node, event, handler ) {
	node.addEventListener ( event, handler, false );
}

function removeEventListener ( node, event, handler ) {
	node.removeEventListener ( event, handler, false );
}

function setAttribute ( node, attribute, value ) {
	node.setAttribute ( attribute, value );
}

function setXlinkAttribute ( node, attribute, value ) {
	node.setAttributeNS( 'http://www.w3.org/1999/xlink', attribute, value );
}

function getBindingGroupValue ( group ) {
	var value = [];
	for ( var i = 0; i < group.length; i += 1 ) {
		if ( group[i].checked ) value.push( group[i].__value );
	}
	return value;
}

function get ( key ) {
	return key ? this._state[ key ] : this._state;
}

function fire ( eventName, data ) {
	var handlers = eventName in this._handlers && this._handlers[ eventName ].slice();
	if ( !handlers ) return;

	for ( var i = 0; i < handlers.length; i += 1 ) {
		handlers[i].call( this, data );
	}
}

function observe ( key, callback, options ) {
	var group = ( options && options.defer ) ? this._observers.pre : this._observers.post;

	( group[ key ] || ( group[ key ] = [] ) ).push( callback );

	if ( !options || options.init !== false ) {
		callback.__calling = true;
		callback.call( this, this._state[ key ] );
		callback.__calling = false;
	}

	return {
		cancel: function () {
			var index = group[ key ].indexOf( callback );
			if ( ~index ) group[ key ].splice( index, 1 );
		}
	};
}

function observeDev ( key, callback, options ) {
	var c = ( key = '' + key ).search( /[^\w]/ );
	if ( c > -1 ) {
		var message = "The first argument to component.observe(...) must be the name of a top-level property";
		if ( c > 0 ) message += ", i.e. '" + key.slice( 0, c ) + "' rather than '" + key + "'";

		throw new Error( message );
	}

	var group = ( options && options.defer ) ? this._observers.pre : this._observers.post;

	( group[ key ] || ( group[ key ] = [] ) ).push( callback );

	if ( !options || options.init !== false ) {
		callback.__calling = true;
		callback.call( this, this._state[ key ] );
		callback.__calling = false;
	}

	return {
		cancel: function () {
			var index = group[ key ].indexOf( callback );
			if ( ~index ) group[ key ].splice( index, 1 );
		}
	};
}

function on ( eventName, handler ) {
	if ( eventName === 'teardown' ) return this.on( 'destroy', handler );

	var handlers = this._handlers[ eventName ] || ( this._handlers[ eventName ] = [] );
	handlers.push( handler );

	return {
		cancel: function () {
			var index = handlers.indexOf( handler );
			if ( ~index ) handlers.splice( index, 1 );
		}
	};
}

function onDev ( eventName, handler ) {
	if ( eventName === 'teardown' ) {
		console.warn( "Use component.on('destroy', ...) instead of component.on('teardown', ...) which has been deprecated and will be unsupported in Svelte 2" );
		return this.on( 'destroy', handler );
	}

	var handlers = this._handlers[ eventName ] || ( this._handlers[ eventName ] = [] );
	handlers.push( handler );

	return {
		cancel: function () {
			var index = handlers.indexOf( handler );
			if ( ~index ) handlers.splice( index, 1 );
		}
	};
}

function set ( newState ) {
	this._set( newState );
	( this._root || this )._flush();
}

function _flush () {
	if ( !this._renderHooks ) return;

	while ( this._renderHooks.length ) {
		var hook = this._renderHooks.pop();
		hook.fn.call( hook.context );
	}
}

var proto = {
	get: get,
	fire: fire,
	observe: observe,
	on: on,
	set: set,
	_flush: _flush
};

var protoDev = {
	get: get,
	fire: fire,
	observe: observeDev,
	on: onDev,
	set: set,
	_flush: _flush
};

function noop () {}

function dispatchObservers ( component, group, newState, oldState ) {
	for ( var key in group ) {
		if ( !( key in newState ) ) continue;

		var newValue = newState[ key ];
		var oldValue = oldState[ key ];

		if ( newValue === oldValue && typeof newValue !== 'object' ) continue;

		var callbacks = group[ key ];
		if ( !callbacks ) continue;

		for ( var i = 0; i < callbacks.length; i += 1 ) {
			var callback = callbacks[i];
			if ( callback.__calling ) continue;

			callback.__calling = true;
			callback.call( component, newValue, oldValue );
			callback.__calling = false;
		}
	}
}




/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__counter__ = __webpack_require__(3);
/* global document */



var counter = new __WEBPACK_IMPORTED_MODULE_0__counter__["a" /* default */]({
  target: document.querySelector('#counter')
});

document.querySelector('#reset-counter').addEventListener('click', function () {
  counter.set({ count: 0 });
});

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = hello;

function hello(name) {
  return "Hello " + name;
}

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__header__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__ = __webpack_require__(0);




var template = function () {
	return {
		data: function data() {
			return {
				count: 0
			};
		},

		components: {
			Header: __WEBPACK_IMPORTED_MODULE_0__header__["a" /* default */]
		}
	};
}();

function renderMainFragment(root, component) {
	var header_initialData = {
		dude: "walt"
	};

	if ('count' in root) header_initialData.count = root.count;
	var header = new template.components.Header({
		target: null,
		_root: component._root || component,
		data: header_initialData
	});

	var header_updating = false;

	component._bindings.push(function () {
		if (header._torndown) return;
		header.observe('count', function (value) {
			header_updating = true;
			component._set({ count: value });
			header_updating = false;
		});
	});

	header._context = {
		root: root
	};

	var text = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["a" /* createText */])("\n\n");

	var p = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["b" /* createElement */])('p');

	__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["c" /* appendNode */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["a" /* createText */])("Count: "), p);
	var last_text2 = root.count;
	var text2 = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["a" /* createText */])(last_text2);
	__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["c" /* appendNode */])(text2, p);
	var text3 = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["a" /* createText */])("\n");

	var button = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["b" /* createElement */])('button');

	function clickHandler(event) {
		var root = this.__svelte.root;

		component.set({ count: root.count + 1 });
	}

	__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["d" /* addEventListener */])(button, 'click', clickHandler);

	button.__svelte = {
		root: root
	};

	__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["c" /* appendNode */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["a" /* createText */])("+1"), button);

	return {
		mount: function mount(target, anchor) {
			header._fragment.mount(target, anchor);
			__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["e" /* insertNode */])(text, target, anchor);
			__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["e" /* insertNode */])(p, target, anchor);
			__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["e" /* insertNode */])(text3, target, anchor);
			__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["e" /* insertNode */])(button, target, anchor);
		},

		update: function update(changed, root) {
			var __tmp;

			if (!header_updating && 'count' in changed) {
				header._set({ count: root.count });
			}

			header._context.root = root;

			if ((__tmp = root.count) !== last_text2) {
				text2.data = last_text2 = __tmp;
			}

			button.__svelte.root = root;
		},

		teardown: function teardown(detach) {
			header.destroy(detach);
			__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["f" /* removeEventListener */])(button, 'click', clickHandler);

			if (detach) {
				__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["g" /* detachNode */])(text);
				__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["g" /* detachNode */])(p);
				__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["g" /* detachNode */])(text3);
				__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["g" /* detachNode */])(button);
			}
		}
	};
}

function Counter(options) {
	options = options || {};
	this._state = Object.assign(template.data(), options.data);

	this._observers = {
		pre: Object.create(null),
		post: Object.create(null)
	};

	this._handlers = Object.create(null);

	this._root = options._root;
	this._yield = options._yield;

	this._torndown = false;
	this._renderHooks = [];

	this._bindings = [];
	this._fragment = renderMainFragment(this._state, this);
	if (options.target) this._fragment.mount(options.target, null);
	while (this._bindings.length) {
		this._bindings.pop()();
	}this._flush();
}

Counter.prototype = Object.assign({}, __WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["h" /* proto */]);

Counter.prototype._set = function _set(newState) {
	var oldState = this._state;
	this._state = Object.assign({}, oldState, newState);

	__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["i" /* dispatchObservers */])(this, this._observers.pre, newState, oldState);
	if (this._fragment) this._fragment.update(newState, this._state);
	__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["i" /* dispatchObservers */])(this, this._observers.post, newState, oldState);

	while (this._bindings.length) {
		this._bindings.pop()();
	}this._flush();
};

Counter.prototype.teardown = Counter.prototype.destroy = function destroy(detach) {
	this.fire('destroy');

	this._fragment.teardown(detach !== false);
	this._fragment = null;

	this._state = {};
	this._torndown = true;
};

/* harmony default export */ __webpack_exports__["a"] = Counter;

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__helpers__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__ = __webpack_require__(0);
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };





function applyComputations(state, newState, oldState, isInitial) {
	if (isInitial || 'dude' in newState && _typeof(state.dude) === 'object' || state.dude !== oldState.dude) {
		state.salutation = newState.salutation = template.computed.salutation(state.dude);
	}
}

var template = function () {
	return {
		data: function data() {
			return {
				dude: 'Unknown',
				count: 0
			};
		},

		computed: {
			salutation: function salutation(dude) {
				return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__helpers__["a" /* hello */])(dude);
			}
		}
	};
}();

function renderMainFragment(root, component) {
	var h1 = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["b" /* createElement */])('h1');

	var last_text = root.salutation;
	var text = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["a" /* createText */])(last_text);
	__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["c" /* appendNode */])(text, h1);
	__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["c" /* appendNode */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["a" /* createText */])(", counted to "), h1);
	var last_text2 = root.count;
	var text2 = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["a" /* createText */])(last_text2);
	__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["c" /* appendNode */])(text2, h1);
	__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["c" /* appendNode */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["a" /* createText */])(" already!"), h1);

	return {
		mount: function mount(target, anchor) {
			__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["e" /* insertNode */])(h1, target, anchor);
		},

		update: function update(changed, root) {
			var __tmp;

			if ((__tmp = root.salutation) !== last_text) {
				text.data = last_text = __tmp;
			}

			if ((__tmp = root.count) !== last_text2) {
				text2.data = last_text2 = __tmp;
			}
		},

		teardown: function teardown(detach) {
			if (detach) {
				__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["g" /* detachNode */])(h1);
			}
		}
	};
}

function Header(options) {
	options = options || {};
	this._state = Object.assign(template.data(), options.data);
	applyComputations(this._state, this._state, {}, true);

	this._observers = {
		pre: Object.create(null),
		post: Object.create(null)
	};

	this._handlers = Object.create(null);

	this._root = options._root;
	this._yield = options._yield;

	this._torndown = false;

	this._fragment = renderMainFragment(this._state, this);
	if (options.target) this._fragment.mount(options.target, null);
}

Header.prototype = Object.assign({}, __WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["h" /* proto */]);

Header.prototype._set = function _set(newState) {
	var oldState = this._state;
	this._state = Object.assign({}, oldState, newState);
	applyComputations(this._state, newState, oldState, false);

	__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["i" /* dispatchObservers */])(this, this._observers.pre, newState, oldState);
	if (this._fragment) this._fragment.update(newState, this._state);
	__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_svelte_shared_js__["i" /* dispatchObservers */])(this, this._observers.post, newState, oldState);
};

Header.prototype.teardown = Header.prototype.destroy = function destroy(detach) {
	this.fire('destroy');

	this._fragment.teardown(detach !== false);
	this._fragment = null;

	this._state = {};
	this._torndown = true;
};

/* harmony default export */ __webpack_exports__["a"] = Header;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNTNkYzFhOTNkMjNiYzYzYWU2YTIiLCJ3ZWJwYWNrOi8vLy4vfi9zdmVsdGUvc2hhcmVkLmpzIiwid2VicGFjazovLy8uL3NyYy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaGVscGVycy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY291bnRlci5odG1sIiwid2VicGFjazovLy8uL3NyYy9oZWFkZXIuaHRtbCJdLCJuYW1lcyI6WyJjb3VudGVyIiwidGFyZ2V0IiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwiYWRkRXZlbnRMaXN0ZW5lciIsInNldCIsImNvdW50IiwiaGVsbG8iLCJuYW1lIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsbURBQTJDLGNBQWM7O0FBRXpEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDaEVBO0FBQUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhCQUE4Qix1QkFBdUI7QUFDckQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGlCQUFpQixrQkFBa0I7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxpQkFBaUIscUJBQXFCO0FBQ3RDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUEsa0JBQWtCLHNCQUFzQjtBQUN4QztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFUTs7Ozs7Ozs7O0FDbk5SO0FBQUE7O0FBRUE7O0FBRUEsSUFBTUEsVUFBVSxJQUFJLHlEQUFKLENBQVk7QUFDMUJDLFVBQVFDLFNBQVNDLGFBQVQsQ0FBdUIsVUFBdkI7QUFEa0IsQ0FBWixDQUFoQjs7QUFJQUQsU0FBU0MsYUFBVCxDQUF1QixnQkFBdkIsRUFBeUNDLGdCQUF6QyxDQUEwRCxPQUExRCxFQUFtRSxZQUFXO0FBQzVFSixVQUFRSyxHQUFSLENBQVksRUFBRUMsT0FBTyxDQUFULEVBQVo7QUFDRCxDQUZELEU7Ozs7Ozs7OztBQ1BPLFNBQVNDLEtBQVQsQ0FBZUMsSUFBZixFQUFxQjtBQUMxQixvQkFBZ0JBLElBQWhCO0FBQ0QsQzs7Ozs7Ozs7Ozs7OzsyQkNLRDtBQUFFO0FBQ00sd0JBQUc7QUFDTDtBQUNPLFdBQ0w7QUFGSztBQUdSOztBQUNTO0FBSWQ7QUFKZ0I7QUFOQzs7Ozs7Ozs7c0RBUkU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt1QkFFRjs7Ozs7Ozs7OztZQUNJLElBQUMsRUFBTyxZQUFPLFFBQU87Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs4QkFIeEI7Ozs7O3FCQUVGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsyQkNHakI7QUFBRTtBQUNNLHdCQUFHO0FBQ0w7QUFDTSxVQUFXO0FBQ1YsV0FDTjtBQUhNO0FBSVI7O0FBQ087QUFDSSxtQ0FBSyxNQUFFO0FBQ2YsV0FBWSwrRUFBTztBQUkzQjtBQU5jO0FBUEc7Ozs7OztzQkFMQTs7Ozt1QkFBd0I7Ozs7Ozs7Ozs7Ozs7cUJBQXhCOzs7O3FCQUF3QiIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBpZGVudGl0eSBmdW5jdGlvbiBmb3IgY2FsbGluZyBoYXJtb255IGltcG9ydHMgd2l0aCB0aGUgY29ycmVjdCBjb250ZXh0XG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmkgPSBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsdWU7IH07XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDUpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDUzZGMxYTkzZDIzYmM2M2FlNmEyIiwiZnVuY3Rpb24gYXBwZW5kTm9kZSAoIG5vZGUsIHRhcmdldCApIHtcblx0dGFyZ2V0LmFwcGVuZENoaWxkKCBub2RlICk7XG59XG5cbmZ1bmN0aW9uIGluc2VydE5vZGUgKCBub2RlLCB0YXJnZXQsIGFuY2hvciApIHtcblx0dGFyZ2V0Lmluc2VydEJlZm9yZSggbm9kZSwgYW5jaG9yICk7XG59XG5cbmZ1bmN0aW9uIGRldGFjaE5vZGUgKCBub2RlICkge1xuXHRub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoIG5vZGUgKTtcbn1cblxuZnVuY3Rpb24gZGV0YWNoQmV0d2VlbiAoIGJlZm9yZSwgYWZ0ZXIgKSB7XG5cdHdoaWxlICggYmVmb3JlLm5leHRTaWJsaW5nICYmIGJlZm9yZS5uZXh0U2libGluZyAhPT0gYWZ0ZXIgKSB7XG5cdFx0YmVmb3JlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoIGJlZm9yZS5uZXh0U2libGluZyApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHRlYXJkb3duRWFjaCAoIGl0ZXJhdGlvbnMsIGRldGFjaCwgc3RhcnQgKSB7XG5cdGZvciAoIHZhciBpID0gKCBzdGFydCB8fCAwICk7IGkgPCBpdGVyYXRpb25zLmxlbmd0aDsgaSArPSAxICkge1xuXHRcdGl0ZXJhdGlvbnNbaV0udGVhcmRvd24oIGRldGFjaCApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQgKCBuYW1lICkge1xuXHRyZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggbmFtZSApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTdmdFbGVtZW50ICggbmFtZSApIHtcblx0cmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgbmFtZSApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVUZXh0ICggZGF0YSApIHtcblx0cmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCBkYXRhICk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbW1lbnQgKCkge1xuXHRyZXR1cm4gZG9jdW1lbnQuY3JlYXRlQ29tbWVudCggJycgKTtcbn1cblxuZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lciAoIG5vZGUsIGV2ZW50LCBoYW5kbGVyICkge1xuXHRub2RlLmFkZEV2ZW50TGlzdGVuZXIgKCBldmVudCwgaGFuZGxlciwgZmFsc2UgKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRXZlbnRMaXN0ZW5lciAoIG5vZGUsIGV2ZW50LCBoYW5kbGVyICkge1xuXHRub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIgKCBldmVudCwgaGFuZGxlciwgZmFsc2UgKTtcbn1cblxuZnVuY3Rpb24gc2V0QXR0cmlidXRlICggbm9kZSwgYXR0cmlidXRlLCB2YWx1ZSApIHtcblx0bm9kZS5zZXRBdHRyaWJ1dGUgKCBhdHRyaWJ1dGUsIHZhbHVlICk7XG59XG5cbmZ1bmN0aW9uIHNldFhsaW5rQXR0cmlidXRlICggbm9kZSwgYXR0cmlidXRlLCB2YWx1ZSApIHtcblx0bm9kZS5zZXRBdHRyaWJ1dGVOUyggJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCBhdHRyaWJ1dGUsIHZhbHVlICk7XG59XG5cbmZ1bmN0aW9uIGdldEJpbmRpbmdHcm91cFZhbHVlICggZ3JvdXAgKSB7XG5cdHZhciB2YWx1ZSA9IFtdO1xuXHRmb3IgKCB2YXIgaSA9IDA7IGkgPCBncm91cC5sZW5ndGg7IGkgKz0gMSApIHtcblx0XHRpZiAoIGdyb3VwW2ldLmNoZWNrZWQgKSB2YWx1ZS5wdXNoKCBncm91cFtpXS5fX3ZhbHVlICk7XG5cdH1cblx0cmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiBnZXQgKCBrZXkgKSB7XG5cdHJldHVybiBrZXkgPyB0aGlzLl9zdGF0ZVsga2V5IF0gOiB0aGlzLl9zdGF0ZTtcbn1cblxuZnVuY3Rpb24gZmlyZSAoIGV2ZW50TmFtZSwgZGF0YSApIHtcblx0dmFyIGhhbmRsZXJzID0gZXZlbnROYW1lIGluIHRoaXMuX2hhbmRsZXJzICYmIHRoaXMuX2hhbmRsZXJzWyBldmVudE5hbWUgXS5zbGljZSgpO1xuXHRpZiAoICFoYW5kbGVycyApIHJldHVybjtcblxuXHRmb3IgKCB2YXIgaSA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkgKz0gMSApIHtcblx0XHRoYW5kbGVyc1tpXS5jYWxsKCB0aGlzLCBkYXRhICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gb2JzZXJ2ZSAoIGtleSwgY2FsbGJhY2ssIG9wdGlvbnMgKSB7XG5cdHZhciBncm91cCA9ICggb3B0aW9ucyAmJiBvcHRpb25zLmRlZmVyICkgPyB0aGlzLl9vYnNlcnZlcnMucHJlIDogdGhpcy5fb2JzZXJ2ZXJzLnBvc3Q7XG5cblx0KCBncm91cFsga2V5IF0gfHwgKCBncm91cFsga2V5IF0gPSBbXSApICkucHVzaCggY2FsbGJhY2sgKTtcblxuXHRpZiAoICFvcHRpb25zIHx8IG9wdGlvbnMuaW5pdCAhPT0gZmFsc2UgKSB7XG5cdFx0Y2FsbGJhY2suX19jYWxsaW5nID0gdHJ1ZTtcblx0XHRjYWxsYmFjay5jYWxsKCB0aGlzLCB0aGlzLl9zdGF0ZVsga2V5IF0gKTtcblx0XHRjYWxsYmFjay5fX2NhbGxpbmcgPSBmYWxzZTtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0Y2FuY2VsOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHR2YXIgaW5kZXggPSBncm91cFsga2V5IF0uaW5kZXhPZiggY2FsbGJhY2sgKTtcblx0XHRcdGlmICggfmluZGV4ICkgZ3JvdXBbIGtleSBdLnNwbGljZSggaW5kZXgsIDEgKTtcblx0XHR9XG5cdH07XG59XG5cbmZ1bmN0aW9uIG9ic2VydmVEZXYgKCBrZXksIGNhbGxiYWNrLCBvcHRpb25zICkge1xuXHR2YXIgYyA9ICgga2V5ID0gJycgKyBrZXkgKS5zZWFyY2goIC9bXlxcd10vICk7XG5cdGlmICggYyA+IC0xICkge1xuXHRcdHZhciBtZXNzYWdlID0gXCJUaGUgZmlyc3QgYXJndW1lbnQgdG8gY29tcG9uZW50Lm9ic2VydmUoLi4uKSBtdXN0IGJlIHRoZSBuYW1lIG9mIGEgdG9wLWxldmVsIHByb3BlcnR5XCI7XG5cdFx0aWYgKCBjID4gMCApIG1lc3NhZ2UgKz0gXCIsIGkuZS4gJ1wiICsga2V5LnNsaWNlKCAwLCBjICkgKyBcIicgcmF0aGVyIHRoYW4gJ1wiICsga2V5ICsgXCInXCI7XG5cblx0XHR0aHJvdyBuZXcgRXJyb3IoIG1lc3NhZ2UgKTtcblx0fVxuXG5cdHZhciBncm91cCA9ICggb3B0aW9ucyAmJiBvcHRpb25zLmRlZmVyICkgPyB0aGlzLl9vYnNlcnZlcnMucHJlIDogdGhpcy5fb2JzZXJ2ZXJzLnBvc3Q7XG5cblx0KCBncm91cFsga2V5IF0gfHwgKCBncm91cFsga2V5IF0gPSBbXSApICkucHVzaCggY2FsbGJhY2sgKTtcblxuXHRpZiAoICFvcHRpb25zIHx8IG9wdGlvbnMuaW5pdCAhPT0gZmFsc2UgKSB7XG5cdFx0Y2FsbGJhY2suX19jYWxsaW5nID0gdHJ1ZTtcblx0XHRjYWxsYmFjay5jYWxsKCB0aGlzLCB0aGlzLl9zdGF0ZVsga2V5IF0gKTtcblx0XHRjYWxsYmFjay5fX2NhbGxpbmcgPSBmYWxzZTtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0Y2FuY2VsOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHR2YXIgaW5kZXggPSBncm91cFsga2V5IF0uaW5kZXhPZiggY2FsbGJhY2sgKTtcblx0XHRcdGlmICggfmluZGV4ICkgZ3JvdXBbIGtleSBdLnNwbGljZSggaW5kZXgsIDEgKTtcblx0XHR9XG5cdH07XG59XG5cbmZ1bmN0aW9uIG9uICggZXZlbnROYW1lLCBoYW5kbGVyICkge1xuXHRpZiAoIGV2ZW50TmFtZSA9PT0gJ3RlYXJkb3duJyApIHJldHVybiB0aGlzLm9uKCAnZGVzdHJveScsIGhhbmRsZXIgKTtcblxuXHR2YXIgaGFuZGxlcnMgPSB0aGlzLl9oYW5kbGVyc1sgZXZlbnROYW1lIF0gfHwgKCB0aGlzLl9oYW5kbGVyc1sgZXZlbnROYW1lIF0gPSBbXSApO1xuXHRoYW5kbGVycy5wdXNoKCBoYW5kbGVyICk7XG5cblx0cmV0dXJuIHtcblx0XHRjYW5jZWw6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHZhciBpbmRleCA9IGhhbmRsZXJzLmluZGV4T2YoIGhhbmRsZXIgKTtcblx0XHRcdGlmICggfmluZGV4ICkgaGFuZGxlcnMuc3BsaWNlKCBpbmRleCwgMSApO1xuXHRcdH1cblx0fTtcbn1cblxuZnVuY3Rpb24gb25EZXYgKCBldmVudE5hbWUsIGhhbmRsZXIgKSB7XG5cdGlmICggZXZlbnROYW1lID09PSAndGVhcmRvd24nICkge1xuXHRcdGNvbnNvbGUud2FybiggXCJVc2UgY29tcG9uZW50Lm9uKCdkZXN0cm95JywgLi4uKSBpbnN0ZWFkIG9mIGNvbXBvbmVudC5vbigndGVhcmRvd24nLCAuLi4pIHdoaWNoIGhhcyBiZWVuIGRlcHJlY2F0ZWQgYW5kIHdpbGwgYmUgdW5zdXBwb3J0ZWQgaW4gU3ZlbHRlIDJcIiApO1xuXHRcdHJldHVybiB0aGlzLm9uKCAnZGVzdHJveScsIGhhbmRsZXIgKTtcblx0fVxuXG5cdHZhciBoYW5kbGVycyA9IHRoaXMuX2hhbmRsZXJzWyBldmVudE5hbWUgXSB8fCAoIHRoaXMuX2hhbmRsZXJzWyBldmVudE5hbWUgXSA9IFtdICk7XG5cdGhhbmRsZXJzLnB1c2goIGhhbmRsZXIgKTtcblxuXHRyZXR1cm4ge1xuXHRcdGNhbmNlbDogZnVuY3Rpb24gKCkge1xuXHRcdFx0dmFyIGluZGV4ID0gaGFuZGxlcnMuaW5kZXhPZiggaGFuZGxlciApO1xuXHRcdFx0aWYgKCB+aW5kZXggKSBoYW5kbGVycy5zcGxpY2UoIGluZGV4LCAxICk7XG5cdFx0fVxuXHR9O1xufVxuXG5mdW5jdGlvbiBzZXQgKCBuZXdTdGF0ZSApIHtcblx0dGhpcy5fc2V0KCBuZXdTdGF0ZSApO1xuXHQoIHRoaXMuX3Jvb3QgfHwgdGhpcyApLl9mbHVzaCgpO1xufVxuXG5mdW5jdGlvbiBfZmx1c2ggKCkge1xuXHRpZiAoICF0aGlzLl9yZW5kZXJIb29rcyApIHJldHVybjtcblxuXHR3aGlsZSAoIHRoaXMuX3JlbmRlckhvb2tzLmxlbmd0aCApIHtcblx0XHR2YXIgaG9vayA9IHRoaXMuX3JlbmRlckhvb2tzLnBvcCgpO1xuXHRcdGhvb2suZm4uY2FsbCggaG9vay5jb250ZXh0ICk7XG5cdH1cbn1cblxudmFyIHByb3RvID0ge1xuXHRnZXQ6IGdldCxcblx0ZmlyZTogZmlyZSxcblx0b2JzZXJ2ZTogb2JzZXJ2ZSxcblx0b246IG9uLFxuXHRzZXQ6IHNldCxcblx0X2ZsdXNoOiBfZmx1c2hcbn07XG5cbnZhciBwcm90b0RldiA9IHtcblx0Z2V0OiBnZXQsXG5cdGZpcmU6IGZpcmUsXG5cdG9ic2VydmU6IG9ic2VydmVEZXYsXG5cdG9uOiBvbkRldixcblx0c2V0OiBzZXQsXG5cdF9mbHVzaDogX2ZsdXNoXG59O1xuXG5mdW5jdGlvbiBub29wICgpIHt9XG5cbmZ1bmN0aW9uIGRpc3BhdGNoT2JzZXJ2ZXJzICggY29tcG9uZW50LCBncm91cCwgbmV3U3RhdGUsIG9sZFN0YXRlICkge1xuXHRmb3IgKCB2YXIga2V5IGluIGdyb3VwICkge1xuXHRcdGlmICggISgga2V5IGluIG5ld1N0YXRlICkgKSBjb250aW51ZTtcblxuXHRcdHZhciBuZXdWYWx1ZSA9IG5ld1N0YXRlWyBrZXkgXTtcblx0XHR2YXIgb2xkVmFsdWUgPSBvbGRTdGF0ZVsga2V5IF07XG5cblx0XHRpZiAoIG5ld1ZhbHVlID09PSBvbGRWYWx1ZSAmJiB0eXBlb2YgbmV3VmFsdWUgIT09ICdvYmplY3QnICkgY29udGludWU7XG5cblx0XHR2YXIgY2FsbGJhY2tzID0gZ3JvdXBbIGtleSBdO1xuXHRcdGlmICggIWNhbGxiYWNrcyApIGNvbnRpbnVlO1xuXG5cdFx0Zm9yICggdmFyIGkgPSAwOyBpIDwgY2FsbGJhY2tzLmxlbmd0aDsgaSArPSAxICkge1xuXHRcdFx0dmFyIGNhbGxiYWNrID0gY2FsbGJhY2tzW2ldO1xuXHRcdFx0aWYgKCBjYWxsYmFjay5fX2NhbGxpbmcgKSBjb250aW51ZTtcblxuXHRcdFx0Y2FsbGJhY2suX19jYWxsaW5nID0gdHJ1ZTtcblx0XHRcdGNhbGxiYWNrLmNhbGwoIGNvbXBvbmVudCwgbmV3VmFsdWUsIG9sZFZhbHVlICk7XG5cdFx0XHRjYWxsYmFjay5fX2NhbGxpbmcgPSBmYWxzZTtcblx0XHR9XG5cdH1cbn1cblxuZXhwb3J0IHsgbm9vcCwgZGlzcGF0Y2hPYnNlcnZlcnMsIGFwcGVuZE5vZGUsIGluc2VydE5vZGUsIGRldGFjaE5vZGUsIGRldGFjaEJldHdlZW4sIHRlYXJkb3duRWFjaCwgY3JlYXRlRWxlbWVudCwgY3JlYXRlU3ZnRWxlbWVudCwgY3JlYXRlVGV4dCwgY3JlYXRlQ29tbWVudCwgYWRkRXZlbnRMaXN0ZW5lciwgcmVtb3ZlRXZlbnRMaXN0ZW5lciwgc2V0QXR0cmlidXRlLCBzZXRYbGlua0F0dHJpYnV0ZSwgZ2V0QmluZGluZ0dyb3VwVmFsdWUsIGdldCwgZmlyZSwgb2JzZXJ2ZSwgb2JzZXJ2ZURldiwgb24sIG9uRGV2LCBzZXQsIF9mbHVzaCwgcHJvdG8sIHByb3RvRGV2IH07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vc3ZlbHRlL3NoYXJlZC5qc1xuLy8gbW9kdWxlIGlkID0gMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKiBnbG9iYWwgZG9jdW1lbnQgKi9cblxuaW1wb3J0IENvdW50ZXIgZnJvbSAnLi9jb3VudGVyJztcblxuY29uc3QgY291bnRlciA9IG5ldyBDb3VudGVyKHtcbiAgdGFyZ2V0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY291bnRlcicpXG59KTtcblxuZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3Jlc2V0LWNvdW50ZXInKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICBjb3VudGVyLnNldCh7IGNvdW50OiAwIH0pO1xufSk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2luZGV4LmpzIiwiXG5leHBvcnQgZnVuY3Rpb24gaGVsbG8obmFtZSkge1xuICByZXR1cm4gYEhlbGxvICR7bmFtZX1gO1xufVxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9oZWxwZXJzLmpzIiwiPEhlYWRlciBiaW5kOmNvdW50IGR1ZGU9XCJ3YWx0XCIgLz5cblxuPHA+Q291bnQ6IHt7Y291bnR9fTwvcD5cbjxidXR0b24gb246Y2xpY2s9J3NldCh7IGNvdW50OiBjb3VudCArIDEgfSknPisxPC9idXR0b24+XG5cbjxzY3JpcHQ+XG4gIGltcG9ydCBIZWFkZXIgZnJvbSAnLi9oZWFkZXInO1xuXG4gIGV4cG9ydCBkZWZhdWx0IHtcbiAgICBkYXRhKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY291bnQ6IDBcbiAgICAgIH07XG4gICAgfSxcbiAgICBjb21wb25lbnRzOiB7XG4gICAgICBIZWFkZXJcbiAgICB9XG4gIH07XG48L3NjcmlwdD5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvY291bnRlci5odG1sIiwiPGgxPnt7IHNhbHV0YXRpb24gfX0sIGNvdW50ZWQgdG8ge3sgY291bnQgfX0gYWxyZWFkeSE8L2gxPlxuXG48c2NyaXB0PlxuICBpbXBvcnQgeyBoZWxsbyB9IGZyb20gJy4vaGVscGVycyc7XG5cbiAgZXhwb3J0IGRlZmF1bHQge1xuICAgIGRhdGEoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBkdWRlOiAnVW5rbm93bicsXG4gICAgICAgIGNvdW50OiAwXG4gICAgICB9XG4gICAgfSxcbiAgICBjb21wdXRlZDoge1xuICAgICAgc2FsdXRhdGlvbihkdWRlKSB7XG4gICAgICAgIHJldHVybiBoZWxsbyhkdWRlKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG48L3NjcmlwdD5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvaGVhZGVyLmh0bWwiXSwic291cmNlUm9vdCI6IiJ9