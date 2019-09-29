import { doApplyHMR } from 'svelte-hmr/runtime';

export function applyHMR(
	targetModule,
	id,
	hotOptions,
	Component,
	ProxyAdapter,
	compileData
) {
	try {
		const { proxy, error } = doApplyHMR(
			hotOptions,
			id,
			Component,
			ProxyAdapter,
			compileData
		);

		if (error && !hotOptions.optimistic) {
			targetModule.hot.decline();
		} else {
			targetModule.hot.accept();
		}

		return proxy;
	} catch (err) {
		targetModule.hot.decline();
		// since we won't return the proxy and the app will expect a svelte
		// component, it's gonna crash... so it's best to report the real cause
		const errString = (err && err.stack) || err;
		throw new Error(
			`Failed to create HMR proxy for Svelte component ${id}: ${errString}`
		);
	}
}
