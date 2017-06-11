import createApp from './app';
import http from 'src/http';

export default context => {
	const app = createApp(context);

	// replace relative baseURL with app URL
	if (!/^https?:\/\//.test(http.defaults.baseURL))
		http.defaults.baseURL = context.protocol + '://' + context.hostname + http.defaults.baseURL;

	return new Promise(resolve => {
		app.$router.onReady(() => {
			const prefetchComponents = app.$router.getMatchedComponents()
				.filter(comp => typeof comp.prefetch === 'function');

			if (typeof app.$options.prefetch === 'function') prefetchComponents.unshift(app.$options);

			Promise.all(prefetchComponents.map(comp => comp.prefetch(app.$store, app.$route.params, app.$route)))
			.then(() => {
				context.meta = app.$meta();
				context.initialState = app.$store.state;
				resolve(app);
			})
			.catch(err => {
				// let the application deal with errors
				context.meta = app.$meta();
				app.$store.commit('fireServerError', err);
				context.initialState = app.$store.state;
				resolve(app);
			});
		});
		app.$router.push(context.url);
	});
};