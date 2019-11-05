import { makeApplyHmr } from 'svelte-hmr/runtime';

const runAcceptHandlers = acceptHandlers => {
	const queue = [...acceptHandlers];
	const next = () => {
		const cur = queue.shift();
		if (cur) {
			return cur(null).then(next);
		} else {
			return Promise.resolve();
		}
	};
	return next();
};

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
		const errString = (err && err.stack) || err;
		console.error('[HMR:Svelte] Failed to accept update', errString);
		reload();
	});

	const hot = {
		data: m.hot.data,
		dispose,
		accept,
	};

	return Object.assign({}, args, { hot });
});
