/* global Symbol */

// This module monkey patches Page#showModal in order to be able to
// access from the HMR proxy data passed to `showModal` in svelte-native.
//
// Data are stored in a opaque prop accessible with `getModalData`.
//
// It also switches the `closeCallback` option with a custom brewed one
// in order to give the proxy control over when its own instance will be
// destroyed.
//
// Obviously this method suffer from extreme coupling with the target code
// in svelte-native. So it would be wise to recheck compatibility on SN
// version upgrades.
//
// Relevant code is there (last checked version):
//
// https://github.com/halfnelson/svelte-native/blob/08702e6b178644f43052f6ec0a789a51e800d21b/src/dom/svelte/StyleElement.ts
//

// FIXME should we override ViewBase#showModal instead?
import { Page } from 'tns-core-modules/ui/page';

const prop =
	typeof Symbol !== 'undefined'
		? Symbol('hmr_svelte_native_modal')
		: '___HMR_SVELTE_NATIVE_MODAL___';

const sup = Page.prototype.showModal;

let patched = false;

export const patchShowModal = () => {
	// guard: already patched
	if (patched) return;
	patched = true;

	Page.prototype.showModal = function(modalView, options) {
		const modalData = {
			originalOptions: options,
			closeCallback: options.closeCallback,
		};

		modalView[prop] = modalData;

		// Proxies to a function that can be swapped on the fly by HMR proxy.
		//
		// The default is still to call the original closeCallback from svelte
		// navtive, which will destroy the modal view & component. This way, if
		// no HMR happens on the modal content, normal behaviour is preserved
		// without the proxy having any work to do.
		//
		const closeCallback = (...args) => {
			return modalData.closeCallback(...args);
		};

		const temperedOptions = Object.assign({}, options, { closeCallback });

		return sup.call(this, modalView, temperedOptions);
	};
};

export const getModalData = modalView => modalView[prop];
