/**
 * Emulates forthcoming HMR hooks in Svelte.
 *
 * All references to private compoonent state ($$) are now isolated in this
 * module.
 */

export const captureState = cmp => {
	// sanity check: propper behaviour here is to crash noisily so that
	// user knows that they're looking at something broken
	if (!cmp) {
		throw new Error('Missing component');
	}
	if (!cmp.$$) {
		throw new Error('Invalid component');
	}
	const {
		$$: { callbacks, bound, ctx: props },
	} = cmp;
	return { props, callbacks, bound };
};

export const restoreState = (cmp, restore) => {
	if (!restore) {
		return;
	}
	const { callbacks, bound } = restore;
	if (callbacks) {
		cmp.$$.callbacks = callbacks;
	}
	if (bound) {
		cmp.$$.bound = bound;
	}
	// props, props.$$slots are restored at component creation (works
	// better -- well, at all actually)
};

// emulates (forthcoming?) svelte dev hooks
//
// NOTE onDestroy must be called even if the call doesn't pass through the
//      component's $destroy method (that we can hook onto by ourselves, since
//      it's public API) -- this happens a lot in svelte's internals, that
//      manipulates cmp.$$.fragment directly, often binding to fragment.d,
//      for example
//
// NOTE onMount must provide target & anchor (for us to be able to determinate
// 			actual DOM insertion point)
//
// TODO should copyComponentMethods be done here?
//
export const hookComponent = (proxy, cmp, { onMount, onDestroy }) => {
	if (onMount) {
		const m = cmp.$$.fragment.m;
		cmp.$$.fragment.m = (...args) => {
			const result = m(...args);
			onMount(...args);
			return result;
		};
	}

	if (onDestroy) {
		cmp.$$.on_destroy.push(onDestroy);
	}

	// WARNING the proxy MUST use the same $$ object as its component
	// instance, because a lot of wiring happens during component
	// initialisation... lots of references to $$ and $$.fragment have
	// already been distributed around when the component constructor
	// returns, before we have a chance to wrap them (and so we can't
	// wrap them no more, because existing references would become
	// invalid)
	proxy.$$ = cmp.$$;
};
