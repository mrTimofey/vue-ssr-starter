function onError(err, app) {
	if (typeof err === 'number') err = { statusCode: err };
	else if (!err) err = { statusCode: 500 };
	// let the app know if something goes wrong
	app.$store.commit('setError', err);
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
		props: route.params,
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

function created() {
	/* eslint-disable no-invalid-this */
	const data = this.constructor.extendOptions.prefetchedData;
	if (!data) return;
	// add prefetched data only before hydration (just after SSR) and then delete it
	Object.assign(this.$data, data);
	delete this.constructor.extendOptions.prefetchedData;
	/* eslint-enable no-invalid-this */
}

export const serverMixin = {
	data,
	created,
};

export const clientMixin = {
	data,
	created,
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
	},
};

export const prefetchMixin = window ? clientMixin : serverMixin;

export function serverPrefetch(app, context, comp) {
	const fn = comp ? comp.prefetch : app.$options.prefetch;
	if (!fn) return Promise.resolve();
	return fn({
		route: app.$route,
		store: app.$store,
		props: app.$route.params,
	}).then((data) => {
		if (!comp) return;
		// save component data to the context to restore it on the client side while hydrating
		if (!context.componentStates) context.componentStates = [];
		comp.prefetchedData = data || {};
		context.componentStates.push(comp.prefetchedData);
	}).catch(err => {
		onError(err, app);
	});
}
