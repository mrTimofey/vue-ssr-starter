function update(comp, next) {
	const promise = comp.$options.prefetch(comp.$store);
	if (!promise) return next();
	comp.prefetching = true;
	promise
		.then(() => {
			comp.prefetching = false;
			if (next) next();
		})
		.catch(err => {
			comp.prefetching = false;
			comp.$store.commit('fireServerError', err);
			if (next) next(err);
		});
}

export default {
	data: () => ({
		// let component know when prefetching is done
		prefetching: false
	}),
	// on route parameter change
	beforeRouteUpdate(to, from, next) {
		if (this.$options.prefetch) update(this, next);
		else next();
	},
	// trigger only on client (beforeMount is not triggered on server)
	beforeMount() {
		if (this.$root._isMounted && this.$options.prefetch) update(this);
	}
};