import Vue from 'vue';

// prevent warnings when referencing prefetching flag
Vue.mixin({
	data: () => ({
		prefetching: false
	})
});

import app from './app';

export default context => {
	app.$router.push(context.url);

	return new Promise(resolve => {
		Promise.all(app.$router.getMatchedComponents().map(comp => {
			context.meta = app.$meta();
			if (comp.prefetch) return comp.prefetch(app.$store);
		})).then(
			() => {
				context.initialState = app.$store.state;
				resolve(app);
			},
			err => {
				app.$store.commit('fireServerError', err);
				context.initialState = app.$store.state;
				resolve(app);
			}
		);
	});
}