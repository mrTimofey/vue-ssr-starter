import Vue from 'vue';

// call prefetch
Vue.mixin({
	data: () => ({
		prefetching: false
	}),
	created() {
		if (this.$root._isMounted && this.$options.prefetch) {
			this.prefetching = true;
			// let component catch errors or do something else with this promise
			this.prefetchPromise = this.$options.prefetch(this.$root.$store)
				.then(() => { this.prefetching = false; });
		}
	}
});

import app from './app';
app.$store.replaceState(window.__INITIAL_STATE__);
app.$mount(document.body.querySelector('[server-rendered]'));