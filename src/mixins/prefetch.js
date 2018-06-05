function update(vm, next, route) {
	if (!route) route = vm.$route;
	const promise = vm.$options.prefetch({
		store: vm.$store,
		props: route.params,
		route
	});
	if (!promise) return next ? next() : undefined;
	vm.prefetching = true;
	vm._prefetchPromise = promise;
	promise
		.then(data => {
			if (data && vm._prefetchPromise === promise) Object.assign(vm.$data, data);
			if (next) next();
		})
		.catch(err => {
			vm.$store.commit('fireServerError', err);
			if (next) next(err);
		})
		.then(() => {
			if (vm._prefetchPromise === promise) vm.prefetching = false;
		});
}

export default {
	data: () => ({
		// let component know when prefetching is done
		prefetching: false
	}),
	created() {
		// add prefetched data only after hydration (just after SSR)
		if (this.$root._isMounted || !this.constructor.extendOptions.prefetchedData) return;
		Object.assign(this.$data, this.constructor.extendOptions.prefetchedData);
	},
	// on route parameter change
	beforeRouteUpdate(to, from, next) {
		if (this.$options.prefetch && to.path !== from.path) {
			update(this, null, to);
			next();
		}
		else next();
	},
	// trigger only on client (beforeMount is not triggered on server)
	beforeMount() {
		if (this.$root._isMounted && this.$options.prefetch || this.constructor.extendOptions.noSSR) update(this, () => {
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