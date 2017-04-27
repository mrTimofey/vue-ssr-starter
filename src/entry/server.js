import Vue from 'vue';

// prevent warnings when referencing prefetching flag
Vue.mixin({
	data: () => ({
		prefetching: false
	})
});

import createApp from './app';

export default context => {
	const app = createApp(context);

	return new Promise(resolve => {
		app.$router.onReady(() => {
			Promise.all(app.$router.getMatchedComponents().map(comp => {
				context.meta = app.$meta();
				return comp.prefetch && comp.prefetch(app.$store);
			}))
			.then(() => {
				context.initialState = app.$store.state;
				resolve(app);
			})
			.catch(err => {
				// let the application deal with errors
				app.$store.commit('fireServerError', err);
				context.initialState = app.$store.state;
				resolve(app);
			});
		});
		app.$router.push(context.url);
	});
};