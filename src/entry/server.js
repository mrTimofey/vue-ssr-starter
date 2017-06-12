import createApp from './app';
import http from 'src/http';

export default context => {
	const app = createApp(context);

	// replace relative baseURL with app URL
	if (!/^https?:\/\//.test(http.defaults.baseURL))
		http.defaults.baseURL = context.protocol + '://' + context.hostname + http.defaults.baseURL;

	return new Promise(resolve => {
		app.$router.onReady(() => {
			// router matched components with prefetch
			const comps = app.$router.getMatchedComponents()
				.filter(comp => typeof comp.prefetch === 'function');
			// prefetch call arguments
			const args = {
				store: app.$store,
				props: app.$route.params,
				route: app.$route
			};

			if (typeof app.$options.prefetch === 'function') comps.unshift(app.$options);

			Promise.all(comps.map(comp => comp.prefetch(args)))
				.then(compData => {
					context.meta = app.$meta();
					context.initialVuexState = app.$store.state;
					context.initialComponentsState = compData;
					if (app.$route.meta && app.$route.meta.statusCode) context.statusCode = app.$route.meta.statusCode;
					else if (app.$store.getters.serverError) context.statusCode = 500;
					resolve(app);
				})
				.catch(err => {
					// let the application deal with errors
					context.meta = app.$meta();
					app.$store.commit('fireServerError', err);
					context.initialStoreState = app.$store.state;
					context.statusCode = 500;
					resolve(app);
				});
		});
		app.$router.push(context.url);
	});
};