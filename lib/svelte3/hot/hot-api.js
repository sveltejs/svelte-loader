import DomAdapter from './proxy-adapter-dom';
import { initProxy } from './proxy';

const defaultHotOptions = {
	noPreserveState: false,
};

const registry = new Map();

const createProxy = initProxy(DomAdapter);

// One stop shop for HMR updates. Combines functionality of `configure`,
// `register`, and `reload`, based on current registry state.
//
// Additionaly does whatever it can to avoid crashing on runtime errors,
// and tries to decline HMR if that doesn't go well.
//
export function applyHMR(hotOptions, id, moduleHot, component) {
	// resolve existing record
	let record = registry.get(id);
	let broken = false;

	hotOptions = Object.assign({}, defaultHotOptions, hotOptions);

	// (re)render
	if (record) {
		const success = record.reload({ component, hotOptions });
		if (success === false) {
			broken = true;
		}
	} else {
		record = createProxy(id, component, hotOptions);
		registry.set(id, record);
	}

	const proxy = record && record.proxy;

	if (!proxy) {
		// well, endgame... we won't be able to render next updates, even
		// successful, if we don't have proxies in svelte's tree
		//
		// full reload required
		//
		// we can't command a full reload from here

		// tell webpack our HMR is dead, so next update should trigger a full reload
		moduleHot.decline();

		// TODO report error on client

		// since we won't return the proxy and the app will expect a svelte
		// component, it's gonna crash... so it's best to report the real cause
		throw new Error(`Failed to create HMR proxy for Svelte component ${id}`);
	}

	// Make sure we won't try to restore from an irrecuperable state.
	//
	// E.g. a component can partially render children to DOM from its
	// constructor, then crash without even leaving a reference in a
	// variable (since crash from the constructor). Maybe the compiler
	// could handle the situation, but we can't (so, according to HMR
	// Tao, better full reload than stale display).
	//
	if (broken) {
		moduleHot.decline();
	} else {
		moduleHot.accept();
	}

	return proxy;
}
