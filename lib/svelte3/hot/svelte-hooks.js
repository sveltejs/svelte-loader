/**
 * Emulates forthcoming HMR hooks in Svelte.
 *
 * All references to private compoonent state ($$) are now isolated in this
 * module.
 */
import { current_component, set_current_component } from 'svelte/internal';

const captureState = (cmp, captureLocalState = true) => {
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
	const result = { props, callbacks, bound };
	if (cmp.$capture_state) {
		result.state = cmp.$capture_state({ captureLocalState });
	}
	return result;
};

// restoreState
//
// It is too late to restore context at this point because component instance
// function has already been called (and so context has already been read).
// Instead, we rely on setting current_component to the same value it has when
// the component was first rendered -- which fix support for context, and is
// also generally more respectful of normal operation.
//
const restoreState = (cmp, restore) => {
	if (!restore) {
		return;
	}
	const { callbacks, bound, state } = restore;
	if (callbacks) {
		cmp.$$.callbacks = callbacks;
	}
	if (bound) {
		cmp.$$.bound = bound;
	}
	if (state && cmp.$inject_state) {
		cmp.$inject_state(state);
	}
	// props, props.$$slots are restored at component creation (works
	// better -- well, at all actually)
};

const filterProps = (props, { vars }) => {
	if (!vars) {
		return props;
	}
	const previousProps = props;
	const result = {};
	vars
		.filter(({ export_name }) => !!export_name)
		.forEach(({ export_name }) => {
			result[export_name] = previousProps[export_name];
		});
	Object.keys(previousProps)
		.filter(name => name.substr(0, 2) === '$$')
		.forEach(key => {
			result[key] = previousProps[key];
		});
	return result;
};

export const createProxiedComponent = (
	Component,
	initialOptions,
	{ preserveState, onInstance, onMount, onDestroy }
) => {
	let cmp;
	let parentComponent;
	let compileData;
	let options = initialOptions;

	const isCurrent = _cmp => cmp === _cmp;

	// it's better to restore props from the very beginning -- for example
	// slots (yup, stored in props as $$slots) are broken if not present at
	// component creation and later restored with $set
	const restoreProps = restore => {
		let props = restore && restore.props;
		if (props) {
			// $capture_state is not present in some cases on components. Also, it
			// does not preserves slots. So for now we need fallbacks.
			if (restore.state) {
				return { $$slots: props.$$slots };
			} else {
				if (compileData && compileData.vars) {
					props = filterProps(props, compileData);
				}
				return { props };
			}
		}
	};

	const assignOptions = (target, anchor, restore) =>
		Object.assign(options, { target, anchor }, restoreProps(restore));

	const instrument = targetCmp => {
		const createComponent = (Component, restore, previousCmp) => {
			set_current_component(parentComponent || previousCmp);
			const comp = new Component(options);
			restoreState(comp, restore);
			instrument(comp);
			return comp;
		};

		// `conservative: true` means we want to be sure that the new component has
		// actually been successfuly created before destroying the old instance.
		// This could be useful for preventing runtime errors in component init to
		// bring down the whole HMR. Unfortunately the implementation bellow is
		// broken (FIXME), but that remains an interesting target for when HMR hooks
		// will actually land in Svelte itself.
		//
		// The goal would be to render an error inplace in case of error, to avoid
		// losing the navigation stack (especially annoying in native, that is not
		// based on URL navigation, so we lose the current page on each error).
		//
		targetCmp.$replace = (
			Component,
			{ target = options.target, anchor = options.anchor, conservative = false }
		) => {
			compileData = Component.$$hmrCompileData;
			const restore = captureState(targetCmp, preserveState);
			assignOptions(target, anchor, restore);
			const previous = cmp;
			if (conservative) {
				try {
					cmp = createComponent(Component, restore, previous);
					targetCmp.$destroy();
				} catch (err) {
					cmp = targetCmp;
					throw err;
				}
			} else {
				cmp = null; // prevents on_destroy from firing on non-final cmp instance
				targetCmp.$destroy();
				cmp = createComponent(Component, restore, previous);
			}
			return cmp;
		};

		// NOTE onMount must provide target & anchor (for us to be able to determinate
		// 			actual DOM insertion point)
		if (onMount) {
			const m = targetCmp.$$.fragment.m;
			targetCmp.$$.fragment.m = (...args) => {
				const result = m(...args);
				onMount(...args);
				return result;
			};
		}

		// NOTE onDestroy must be called even if the call doesn't pass through the
		//      component's $destroy method (that we can hook onto by ourselves, since
		//      it's public API) -- this happens a lot in svelte's internals, that
		//      manipulates cmp.$$.fragment directly, often binding to fragment.d,
		//      for example
		if (onDestroy) {
			targetCmp.$$.on_destroy.push(() => {
				if (isCurrent(targetCmp)) {
					onDestroy();
				}
			});
		}

		if (onInstance) {
			onInstance(targetCmp);
		}

		// Svelte 3 creates and mount components from their constructor if
		// options.target is present.
		//
		// This means that at this point, the component's `fragment.c` and,
		// most notably, `fragment.m` will already have been called _from inside
		// createComponent_. That is: before we have a chance to hook on it.
		//
		// Proxy's constructor
		//   -> createComponent
		//     -> component constructor
		//       -> component.$$.fragment.c(...) (or l, if hydrate:true)
		//       -> component.$$.fragment.m(...)
		//
		//   -> you are here <-
		//
		if (onMount) {
			const { target, anchor } = options;
			if (target) {
				onMount(target, anchor);
			}
		}
	};

	parentComponent = current_component;
	cmp = new Component(options);
	instrument(cmp);

	return cmp;
};
