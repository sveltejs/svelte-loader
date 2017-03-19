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
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
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
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _counter = __webpack_require__(2);
	
	var _counter2 = _interopRequireDefault(_counter);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var counter = new _counter2.default({
	  target: document.querySelector('#counter')
	}); /* global document */
	
	document.querySelector('#reset-counter').addEventListener('click', function () {
	  counter.set({ count: 0 });
	});

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var Header = __webpack_require__(3);
	
	Header = Header && Header.__esModule ? Header['default'] : Header;
	
	var template = function () {
		return {
			data: function data() {
				return {
					count: 0
				};
			},
	
			components: {
				Header: Header
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
	
		var text = createText("\n\n");
	
		var p = createElement('p');
	
		appendNode(createText("Count: "), p);
		var last_text2 = root.count;
		var text2 = createText(last_text2);
		appendNode(text2, p);
		var text3 = createText("\n");
	
		var button = createElement('button');
	
		function clickHandler(event) {
			var root = this.__svelte.root;
	
			component.set({ count: root.count + 1 });
		}
	
		addEventListener(button, 'click', clickHandler);
	
		button.__svelte = {
			root: root
		};
	
		appendNode(createText("+1"), button);
	
		return {
			mount: function mount(target, anchor) {
				header._fragment.mount(target, anchor);
				insertNode(text, target, anchor);
				insertNode(p, target, anchor);
				insertNode(text3, target, anchor);
				insertNode(button, target, anchor);
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
				removeEventListener(button, 'click', clickHandler);

				if (detach) {
					detachNode(text);
					detachNode(p);
					detachNode(text3);
					detachNode(button);
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

	Counter.prototype.get = get;
	Counter.prototype.fire = fire;
	Counter.prototype.observe = observe;
	Counter.prototype.on = on;
	Counter.prototype.set = set;
	Counter.prototype._flush = _flush;

	Counter.prototype._set = function _set(newState) {
		var oldState = this._state;
		this._state = Object.assign({}, oldState, newState);

		dispatchObservers(this, this._observers.pre, newState, oldState);
		if (this._fragment) this._fragment.update(newState, this._state);
		dispatchObservers(this, this._observers.post, newState, oldState);

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

	function createText(data) {
		return document.createTextNode(data);
	}

	function insertNode(node, target, anchor) {
		target.insertBefore(node, anchor);
	}

	function detachNode(node) {
		node.parentNode.removeChild(node);
	}

	function createElement(name) {
		return document.createElement(name);
	}

	function appendNode(node, target) {
		target.appendChild(node);
	}

	function addEventListener(node, event, handler) {
		node.addEventListener(event, handler, false);
	}

	function removeEventListener(node, event, handler) {
		node.removeEventListener(event, handler, false);
	}

	function dispatchObservers(component, group, newState, oldState) {
		for (var key in group) {
			if (!(key in newState)) continue;

			var newValue = newState[key];
			var oldValue = oldState[key];

			if (newValue === oldValue && (typeof newValue === 'undefined' ? 'undefined' : _typeof(newValue)) !== 'object') continue;

			var callbacks = group[key];
			if (!callbacks) continue;

			for (var i = 0; i < callbacks.length; i += 1) {
				var callback = callbacks[i];
				if (callback.__calling) continue;

				callback.__calling = true;
				callback.call(component, newValue, oldValue);
				callback.__calling = false;
			}
		}
	}

	function get(key) {
		return key ? this._state[key] : this._state;
	}

	function fire(eventName, data) {
		var handlers = eventName in this._handlers && this._handlers[eventName].slice();
		if (!handlers) return;

		for (var i = 0; i < handlers.length; i += 1) {
			handlers[i].call(this, data);
		}
	}

	function observe(key, callback, options) {
		var group = options && options.defer ? this._observers.pre : this._observers.post;

		(group[key] || (group[key] = [])).push(callback);

		if (!options || options.init !== false) {
			callback.__calling = true;
			callback.call(this, this._state[key]);
			callback.__calling = false;
		}

		return {
			cancel: function cancel() {
				var index = group[key].indexOf(callback);
				if (~index) group[key].splice(index, 1);
			}
		};
	}

	function on(eventName, handler) {
		if (eventName === 'teardown') return this.on('destroy', handler);

		var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
		handlers.push(handler);

		return {
			cancel: function cancel() {
				var index = handlers.indexOf(handler);
				if (~index) handlers.splice(index, 1);
			}
		};
	}

	function set(newState) {
		this._set(newState);
		(this._root || this)._flush();
	}

	function _flush() {
		if (!this._renderHooks) return;

		while (this._renderHooks.length) {
			var hook = this._renderHooks.pop();
			hook.fn.call(hook.context);
		}
	}

	module.exports = Counter;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var __import0 = __webpack_require__(4);
	
	var hello = __import0.hello;
	
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
					return hello(dude);
				}
			}
		};
	}();
	
	function renderMainFragment(root, component) {
		var h1 = createElement('h1');
	
		var last_text = root.salutation;
		var text = createText(last_text);
		appendNode(text, h1);
		appendNode(createText(", counted to "), h1);
		var last_text2 = root.count;
		var text2 = createText(last_text2);
		appendNode(text2, h1);
		appendNode(createText(" already!"), h1);
	
		return {
			mount: function mount(target, anchor) {
				insertNode(h1, target, anchor);
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
					detachNode(h1);
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

	Header.prototype.get = get;
	Header.prototype.fire = fire;
	Header.prototype.observe = observe;
	Header.prototype.on = on;
	Header.prototype.set = set;
	Header.prototype._flush = _flush;

	Header.prototype._set = function _set(newState) {
		var oldState = this._state;
		this._state = Object.assign({}, oldState, newState);
		applyComputations(this._state, newState, oldState, false);

		dispatchObservers(this, this._observers.pre, newState, oldState);
		if (this._fragment) this._fragment.update(newState, this._state);
		dispatchObservers(this, this._observers.post, newState, oldState);
	};

	Header.prototype.teardown = Header.prototype.destroy = function destroy(detach) {
		this.fire('destroy');

		this._fragment.teardown(detach !== false);
		this._fragment = null;

		this._state = {};
		this._torndown = true;
	};

	function createElement(name) {
		return document.createElement(name);
	}

	function detachNode(node) {
		node.parentNode.removeChild(node);
	}

	function insertNode(node, target, anchor) {
		target.insertBefore(node, anchor);
	}

	function createText(data) {
		return document.createTextNode(data);
	}

	function appendNode(node, target) {
		target.appendChild(node);
	}

	function dispatchObservers(component, group, newState, oldState) {
		for (var key in group) {
			if (!(key in newState)) continue;

			var newValue = newState[key];
			var oldValue = oldState[key];

			if (newValue === oldValue && (typeof newValue === 'undefined' ? 'undefined' : _typeof(newValue)) !== 'object') continue;

			var callbacks = group[key];
			if (!callbacks) continue;

			for (var i = 0; i < callbacks.length; i += 1) {
				var callback = callbacks[i];
				if (callback.__calling) continue;

				callback.__calling = true;
				callback.call(component, newValue, oldValue);
				callback.__calling = false;
			}
		}
	}

	function get(key) {
		return key ? this._state[key] : this._state;
	}

	function fire(eventName, data) {
		var handlers = eventName in this._handlers && this._handlers[eventName].slice();
		if (!handlers) return;

		for (var i = 0; i < handlers.length; i += 1) {
			handlers[i].call(this, data);
		}
	}

	function observe(key, callback, options) {
		var group = options && options.defer ? this._observers.pre : this._observers.post;

		(group[key] || (group[key] = [])).push(callback);

		if (!options || options.init !== false) {
			callback.__calling = true;
			callback.call(this, this._state[key]);
			callback.__calling = false;
		}

		return {
			cancel: function cancel() {
				var index = group[key].indexOf(callback);
				if (~index) group[key].splice(index, 1);
			}
		};
	}

	function on(eventName, handler) {
		if (eventName === 'teardown') return this.on('destroy', handler);

		var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
		handlers.push(handler);

		return {
			cancel: function cancel() {
				var index = handlers.indexOf(handler);
				if (~index) handlers.splice(index, 1);
			}
		};
	}

	function set(newState) {
		this._set(newState);
		(this._root || this)._flush();
	}

	function _flush() {
		if (!this._renderHooks) return;

		while (this._renderHooks.length) {
			var hook = this._renderHooks.pop();
			hook.fn.call(hook.context);
		}
	}

	module.exports = Header;

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.hello = hello;
	function hello(name) {
	  return "Hello " + name;
	}

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgY2U4MzNlMzk0NDg0MmQzMTI4OTUiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovLy8uL3NyYy9jb3VudGVyLmh0bWwiLCJ3ZWJwYWNrOi8vLy4vc3JjL2hlYWRlci5odG1sIiwid2VicGFjazovLy8uL3NyYy9oZWxwZXJzLmpzIl0sIm5hbWVzIjpbImNvdW50ZXIiLCJ0YXJnZXQiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJhZGRFdmVudExpc3RlbmVyIiwic2V0IiwiY291bnQiLCJoZWxsbyIsIm5hbWUiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7O0FDcENBOzs7Ozs7QUFFQSxLQUFNQSxVQUFVLHNCQUFZO0FBQzFCQyxXQUFRQyxTQUFTQyxhQUFULENBQXVCLFVBQXZCO0FBRGtCLEVBQVosQ0FBaEIsQyxDQUpBOztBQVFBRCxVQUFTQyxhQUFULENBQXVCLGdCQUF2QixFQUF5Q0MsZ0JBQXpDLENBQTBELE9BQTFELEVBQW1FLFlBQVc7QUFDNUVKLFdBQVFLLEdBQVIsQ0FBWSxFQUFFQyxPQUFPLENBQVQsRUFBWjtBQUNELEVBRkQsRTs7Ozs7Ozs7Ozs7Ozs7NEJDQUE7QUFBRTtBQUNNLHlCQUFHO0FBQ0w7QUFDTyxZQUNMO0FBRks7QUFHUjs7QUFDUztBQUlkO0FBSmdCO0FBTkM7Ozs7Ozs7O3VEQVJFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7d0JBRUY7Ozs7Ozs7Ozs7YUFDSSxJQUFDLEVBQU8sWUFBTyxRQUFPOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7K0JBSHhCOzs7OztzQkFFRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQ0dqQjtBQUFFO0FBQ00seUJBQUc7QUFDTDtBQUNNLFdBQVc7QUFDVixZQUNOO0FBSE07QUFJUjs7QUFDTztBQUNJLG9DQUFLLE1BQUU7QUFDZixZQUFZLE1BQU87QUFJM0I7QUFOYztBQVBHOzs7Ozs7dUJBTEE7Ozs7d0JBQXdCOzs7Ozs7Ozs7Ozs7O3NCQUF4Qjs7OztzQkFBd0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7U0NDekJDLEssR0FBQUEsSztBQUFULFVBQVNBLEtBQVQsQ0FBZUMsSUFBZixFQUFxQjtBQUMxQixxQkFBZ0JBLElBQWhCO0FBQ0QsRSIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRleHBvcnRzOiB7fSxcbiBcdFx0XHRpZDogbW9kdWxlSWQsXG4gXHRcdFx0bG9hZGVkOiBmYWxzZVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIGNlODMzZTM5NDQ4NDJkMzEyODk1IiwiLyogZ2xvYmFsIGRvY3VtZW50ICovXG5cbmltcG9ydCBDb3VudGVyIGZyb20gJy4vY291bnRlcic7XG5cbmNvbnN0IGNvdW50ZXIgPSBuZXcgQ291bnRlcih7XG4gIHRhcmdldDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NvdW50ZXInKVxufSk7XG5cbmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNyZXNldC1jb3VudGVyJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgY291bnRlci5zZXQoeyBjb3VudDogMCB9KTtcbn0pO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9pbmRleC5qcyIsIjxIZWFkZXIgYmluZDpjb3VudCBkdWRlPVwid2FsdFwiIC8+XG5cbjxwPkNvdW50OiB7e2NvdW50fX08L3A+XG48YnV0dG9uIG9uOmNsaWNrPSdzZXQoeyBjb3VudDogY291bnQgKyAxIH0pJz4rMTwvYnV0dG9uPlxuXG48c2NyaXB0PlxuICBpbXBvcnQgSGVhZGVyIGZyb20gJy4vaGVhZGVyJztcblxuICBleHBvcnQgZGVmYXVsdCB7XG4gICAgZGF0YSgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvdW50OiAwXG4gICAgICB9O1xuICAgIH0sXG4gICAgY29tcG9uZW50czoge1xuICAgICAgSGVhZGVyXG4gICAgfVxuICB9O1xuPC9zY3JpcHQ+XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2NvdW50ZXIuaHRtbCIsIjxoMT57eyBzYWx1dGF0aW9uIH19LCBjb3VudGVkIHRvIHt7IGNvdW50IH19IGFscmVhZHkhPC9oMT5cblxuPHNjcmlwdD5cbiAgaW1wb3J0IHsgaGVsbG8gfSBmcm9tICcuL2hlbHBlcnMnO1xuXG4gIGV4cG9ydCBkZWZhdWx0IHtcbiAgICBkYXRhKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZHVkZTogJ1Vua25vd24nLFxuICAgICAgICBjb3VudDogMFxuICAgICAgfVxuICAgIH0sXG4gICAgY29tcHV0ZWQ6IHtcbiAgICAgIHNhbHV0YXRpb24oZHVkZSkge1xuICAgICAgICByZXR1cm4gaGVsbG8oZHVkZSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuPC9zY3JpcHQ+XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2hlYWRlci5odG1sIiwiXG5leHBvcnQgZnVuY3Rpb24gaGVsbG8obmFtZSkge1xuICByZXR1cm4gYEhlbGxvICR7bmFtZX1gO1xufVxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9oZWxwZXJzLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==