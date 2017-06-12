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
			const comps = app.$router.getMatchedComponents().filter(comp => typeof comp.prefetch === 'function');
			// prefetch call arguments
			const args = {
				store: app.$store,
				props: app.$route.params,
				route: app.$route
			};

			const prefetches = comps.map(comp => {
				const data = comp.prefetch(args);
				comp.prefetchedData = data;
				return data;
			});

			if (typeof app.$options.prefetch === 'function') prefetches.push(app.$options.prefetch({
				store: app.$store,
				route: app.$route
			}));

			Promise.all(prefetches)
				.then(compData => {
					context.meta = app.$meta();
					context.initialVuexState = app.$store.state;
					// do not include root component here
					context.initialComponentStates = compData.slice(0, comps.length);
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