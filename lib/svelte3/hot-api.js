import { makeApplyHmr } from 'svelte-hmr/runtime';

export const applyHmr = makeApplyHmr(args => {
	const { m } = args;

	let currentAcceptHandlers = m.hot.data && m.hot.data.acceptHandlers || [];
	let acceptHandlers = [];
	let currentCatchHandlers = m.hot.data && m.hot.data.catchHandlers || [];

	m.hot.dispose(data => {
		data.acceptHandlers = acceptHandlers;
	});

	const dispose = (...args) => m.hot.dispose(...args);

	const accept = handler => {
		if (acceptHandlers.length === 0) {
			m.hot.accept(err => {
				const handlers = currentAcceptHandlers;
				if (handlers.length > 0) {
					currentAcceptHandlers = [];
					handlers.forEach(handler => {
						handler(err);
					});
				}
			});
		}
		acceptHandlers.push(handler);
	};

	setTimeout(() => {
		if (currentAcceptHandlers.length > 0) {
			const handlers = currentAcceptHandlers;
			currentAcceptHandlers = [];
			try {
				handlers.forEach(handler => {
					handler(null);
				});
			} catch (err) {
				const handlers = currentCatchHandlers;
				currentCatchHandlers = [];
				if (handlers.length > 0) {
					handlers.forEach(handler => {
						handler(err);
					});
				} else {
					throw err;
				}
			}
		}
	});

	const hot = {
		data: m.hot.data,
		dispose,
		accept,
	};

	return Object.assign({}, args, { hot });
});
