import { makeApplyHmr } from 'svelte-hmr/runtime';

const runAcceptHandlers = acceptHandlers =>
	Promise.resolve().then(() =>
		Promise.all(acceptHandlers.map(handler => handler(null)))
	);

export const applyHmr = makeApplyHmr(args => {
	const { m, reload } = args;

	let acceptHandlers = (m.hot.data && m.hot.data.acceptHandlers) || [];
	let nextAcceptHandlers = [];

	m.hot.dispose(data => {
		data.acceptHandlers = nextAcceptHandlers;
	});

	const dispose = (...args) => m.hot.dispose(...args);

	const accept = handler => {
		if (nextAcceptHandlers.length === 0) {
			m.hot.accept();
		}
		nextAcceptHandlers.push(handler);
	};

	runAcceptHandlers(acceptHandlers).catch(err => {
		const msg = '[HMR][Svelte] Failed to accept update';
		console.error(msg, (err && err.stack) || err);
		reload();
	});

	const hot = {
		data: m.hot.data,
		dispose,
		accept,
	};

	return Object.assign({}, args, { hot });
});
