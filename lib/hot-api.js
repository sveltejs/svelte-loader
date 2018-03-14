import { Registry, configure as configureProxy, createProxy } from 'svelte-dev-helper';

let hotOptions = {
	noPreserveState: false
};

export function configure(options) {
	hotOptions = Object.assign(hotOptions, options);
	configureProxy(hotOptions);
}

export function register(id, component) {

	//store original component in registry
	Registry.set(id, {
		rollback: null,
		component,
		instances: []
	});

	//create the proxy itself
	const proxy = createProxy(id);

	//patch the registry record with proxy constructor
	const record = Registry.get(id);
	record.proxy = proxy;
	Registry.set(id, record);

	return proxy;
}

export function reload(id, component) {

	const record = Registry.get(id);

	//keep reference to previous version to enable rollback
	record.rollback = record.component;

	//replace component in registry with newly loaded component
	record.component = component;

	Registry.set(id, record);

	//re-render the proxy instances
	record.instances.slice().forEach(function(instance) {
		instance && instance._rerender();
	});

	//return the original proxy constructor that was `register()`-ed
	return record.proxy;
}