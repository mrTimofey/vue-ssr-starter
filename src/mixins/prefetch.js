function update(vm, next, route) {
	if (!route) route = vm.$route;
	const promise = vm.$options.prefetch({
		store: vm.$store,
		props: route.params,
		route
	});
	if (!promise) return next ? next() : undefined;
	vm.prefetching = true;
	promise
		.then(data => {
			vm.prefetching = false;
			Object.assign(vm.$data, data);
			if (next) next();
		})
		.catch(err => {
			vm.prefetching = false;
			vm.$store.commit('fireServerError', err);
			if (next) next(err);
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
		if (this.$options.prefetch && to.path !== from.path) update(this, next, to);
		else next();
	},
	// trigger only on client (beforeMount is not triggered on server)
	beforeMount() {
		if (this.$root._isMounted && this.$options.prefetch) update(this, () => {
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