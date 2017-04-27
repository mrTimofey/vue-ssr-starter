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
	app.$router.push(context.url);

	return new Promise(resolve => {
		Promise.all(app.$router.getMatchedComponents().map(comp => {
			context.meta = app.$meta();
			return comp.prefetch && comp.prefetch(app.$store);
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
};