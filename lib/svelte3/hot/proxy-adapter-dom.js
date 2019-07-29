/* global document */

const removeElement = el => el && el.parentNode && el.parentNode.removeChild(el);

export default class ProxyAdapterDom {
	constructor(instance) {
		this.instance = instance;
		this.insertionPoint = null;

		this.afterMount = this.afterMount.bind(this);
		this.rerender = this.rerender.bind(this);
	}

	dispose() {
		// Component is being destroyed, detaching is not optional in Svelte3's
		// component API, so we can dispose of the insertion point in every case.
		if (this.insertionPoint) {
			removeElement(this.insertionPoint);
			this.insertionPoint = null;
		}
	}

	afterMount(target, anchor) {
		const {
			instance: { debugName },
		} = this;
		// insertionPoint needs to be updated _only when the target changes_ --
		// i.e. when the component is mounted, i.e. (in svelte3) when the component
		// is _created_, and svelte3 doesn't allow it to move afterward -- that
		// is, insertionPoint only needs to be created once when the component is
		// first mounted.
		//
		// DEBUG is it really true that components' elements cannot move in the
		// DOM? what about keyed list?
		//
		if (!this.insertionPoint) {
			this.insertionPoint = document.createComment(debugName);
			target.insertBefore(this.insertionPoint, anchor);
		}
	}

	rerender() {
		const {
			instance: { refreshComponent },
			insertionPoint,
		} = this;
		if (!insertionPoint) {
			throw new Error('Cannot rerender: Missing insertion point');
		}
		refreshComponent(insertionPoint.parentNode, insertionPoint);
	}

	renderError(err, target, anchor) {
		const {
			instance: { debugName },
		} = this;
		const style = {
			section: `
        border: 3px solid red;
        background-color: #fee;
        padding: 12px;
      `,
			h2: `
        margin: 0 0 12px;
        color: red;
      `,
			pre: `
        background: #eee;
        padding: 6px;
        margin: 0;
        border: 1px solid #ddd;
      `,
		};
		const title = debugName || err.moduleName || 'Error';
		const h2 = document.createElement('h2');
		h2.textContent = title;
		const pre = document.createElement('pre');
		pre.textContent = err.stack || err;
		const section = document.createElement('section');
		section.appendChild(h2);
		section.appendChild(pre);
		// style
		section.style = style.section;
		h2.style = style.h2;
		pre.style = style.pre;
		if (anchor) {
			target.insertBefore(section, anchor);
		} else {
			if (!target) {
				target = document.body;
				section.style.posititon = 'absolute';
			}
			target.appendChild(section);
		}
		return () => {
			target.removeChild(section);
		};
	}
}
