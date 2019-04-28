function onError(err, app) {
	if (typeof err === 'number') err = { statusCode: err };
	else if (!err) err = { statusCode: 500 };
	// let the app know if something goes wrong
	app.$store.commit('fireServerError', err);
	return { err };
}

function update(vm, route) {
	const fn = vm.$options.prefetch;
	if (!fn) return Promise.resolve();
	if (!route) route = vm.$route;
	// res: undefined | null | object | Promise<object>
	const res = fn({
		route,
		store: vm.$store,
		props: route.params
	});
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
		.catch(err => onError(err, vm.$root))
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
	created() {
		// fill data on component create
		if (this.$ssrContext.componentStates && this.$ssrContext.componentStates[this.$options.name])
			Object.assign(this.$data, this.$ssrContext.componentStates[this.$options.name]);
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
		if (to.path !== from.path) update(this, to).then(({ err }) => {
			next(err);
		});
		else next();
	},
	// trigger only on client (beforeMount is not triggered on server)
	beforeMount() {
		if (this.$root._isMounted && this.$options.prefetch || this.constructor.extendOptions.noSSR)
			update(this).then(() => {
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

export function serverPrefetch(app, context, comp) {
	const fn = comp ? comp.prefetch : app.$options.prefetch,
		key = comp ? comp.name : false;
	return fn ?
		fn({
			route: app.$route,
			store: app.$store,
			props: app.$route.params
		}).then((data) => {
			if (!key || !data || Object.keys(data).length === 0) return;
			// save component data to the context to restore it on the client side while hydrating
			if (!context.componentStates) context.componentStates = {};
			context.componentStates[key] = data;
		}).catch(err => {
			onError(err, app);
		}) :
		Promise.resolve();
}
