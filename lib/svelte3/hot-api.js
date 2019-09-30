import { doApplyHmr } from 'svelte-hmr/runtime';

export function applyHmr(args) {
	const { m } = args;

	const decline = () => {
		m.hot.decline();
	};

	const accept = () => {
		m.hot.accept();
	};

	return doApplyHmr(Object.assign({}, args, { accept, decline }));
}
