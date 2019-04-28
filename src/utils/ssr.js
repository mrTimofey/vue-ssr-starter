function prefetch(vm) {
	if (!vm.$options.prefetch) return Promise.resolve();
	// res: undefined | null | object | Promise<object>
	const res = vm.$options.prefetch.call(vm);
	if (!res) return Promise.resolve();
	if (typeof res.then !== 'function') return Promise.resolve({ data: res });
	vm._prefetchPromise = res;
	vm.prefetching = true;
	return res
		.then(data => {
			// respect only the last promise if there are several unresolved hanging promises
			if (vm._prefetchPromise !== res) return;
			if (!data) return { data: null };
			Object.assign(vm.$data, data);
			return { data };
		})
		.catch(err => {
			if (typeof err === 'number') err = { statusCode: err };
			else if (!err) err = { statusCode: 500 };
			// let the app know if something goes wrong
			vm.$store.commit('fireServerError', err);
			return { err };
		})
		.then(obj => {
			if (!obj) return;
			vm.prefetching = false;
			// obj: { err: any } | { data: any }
			return obj;
		});
}

const data = () => ({ prefetching: false });

export const serverMixin = {
	data,
	serverPrefetch() {
		return prefetch(this).then(({ data } = {}) => {
			if (!data || Object.keys(data).length === 0) return;
			// save component data to the context to restore it on the client side while hydrating
			if (!this.$ssrContext.componentStates) this.$ssrContext.componentStates = {};
			this.$ssrContext.componentStates[this.$options.name] = data;
		});
	}
};

export const clientMixin = {
	data,
	created() {
		if (!window.__COMP_STATES__ || !window.__COMP_STATES__[this.$options.name]) return;
		// add prefetched data only after hydration (just after SSR)
		Object.assign(this.$data, window.__COMP_STATES__[this.$options.name]);
		delete window.__COMP_STATES__[this.$options.name];
	},
	// on route path change
	beforeRouteUpdate(to, from, next) {
		if (to.path !== from.path) prefetch(this).then(({ err }) => {
			next(err);
		});
		else next();
	},
	// trigger only on client (beforeMount is not triggered on server)
	beforeMount() {
		if (this.$root._isMounted && this.$options.prefetch || this.constructor.extendOptions.noSSR) prefetch(this).then(() => {
			// try to restore scroll position
			if (this.$route.meta.scrollPosition) this.$nextTick(
				() => {
					window.scrollTo(this.$route.meta.scrollPosition.x, this.$route.meta.scrollPosition.y);
					delete this.$route.meta.scrollPosition;
				}
			);
		});
	}
};

export const prefetchMixin = process.env.VUE_ENV === 'server' ? serverMixin : clientMixin;
