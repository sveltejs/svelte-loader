import { makeApplyHmr } from 'svelte-hmr/runtime';

// eslint-disable-next-line no-undef
const g = typeof window !== 'undefined' ? window : global;

const globalKey =
	typeof Symbol !== 'undefined'
		? Symbol('SVELTE_LOADER_HOT')
		: '__SVELTE_LOADER_HOT';

if (!g[globalKey]) {
	// do updating refs counting to know when a full update has been applied
	let updatingCount = 0;

	const notifyStart = () => {
		updatingCount++;
	};

	const notifyError = reload => err => {
		const errString = (err && err.stack) || err;
		// eslint-disable-next-line no-console
		console.error(
			'[HMR] Failed to accept update (nollup compat mode)',
			errString
		);
		reload();
		notifyEnd();
	};

	const notifyEnd = () => {
		updatingCount--;
		if (updatingCount === 0) {
			// NOTE this message is important for timing in tests
			// eslint-disable-next-line no-console
			console.log('[HMR:Svelte] Up to date');
		}
	};

	g[globalKey] = {
		hotStates: {},
		notifyStart,
		notifyError,
		notifyEnd,
	};
}

const runAcceptHandlers = (acceptHandlers, bubbled) => {
	const queue = [...acceptHandlers];
	const next = () => {
		const cur = queue.shift();
		if (cur) {
			return cur({ bubbled }).then(next);
		} else {
			return Promise.resolve(null);
		}
	};
	return next();
};

const isBubbled = (children, lastChildren) => {
	if (children.length !== lastChildren.length) return false;
	return children.some((x, i) => x !== lastChildren[i]);
};

export const applyHmr = makeApplyHmr(args => {
	const { notifyStart, notifyError, notifyEnd } = g[globalKey];
	const { m, reload } = args;

	const acceptHandlers = (m.hot.data && m.hot.data.acceptHandlers) || [];
	const nextAcceptHandlers = [];

	const children = m.children.map(x => require.cache[x]);

	const lastChildren = m.hot.data && m.hot.data.children;

	m.hot.dispose(data => {
		data.acceptHandlers = nextAcceptHandlers;
		data.children = children;
	});

	const dispose = (...args) => m.hot.dispose(...args);

	const accept = handler => {
		if (nextAcceptHandlers.length === 0) {
			m.hot.accept();
		}
		nextAcceptHandlers.push(handler);
	};

	const check = status => {
		if (status === 'ready') {
			notifyStart();
		} else if (status === 'idle') {
			const bubbled =
				acceptHandlers.length > 0
					? isBubbled(children, lastChildren)
					: undefined;
			runAcceptHandlers(acceptHandlers, bubbled)
				.then(notifyEnd)
				.catch(notifyError(reload));
		}
	};

	m.hot.addStatusHandler(check);

	m.hot.dispose(() => {
		m.hot.removeStatusHandler(check);
	});

	const hot = {
		data: m.hot.data,
		dispose,
		accept,
	};

	return { ...args, hot };
});
