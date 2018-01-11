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

	return createProxy(id);
}

export function reload(id, component) {

	const record = Registry.get(id);

	//keep reference to previous version to enable rollback
	record.rollback = record.component;

	//replace component in registry with newly loaded component
	record.component = component;

	Registry.set(id, record);

	//re-render the proxies
	record.instances.slice().forEach(function(instance) {
		instance && instance._rerender();
	});
}