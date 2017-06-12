import createApp from './app';
import http from 'src/http';

function init(app, context) {
	context.meta = app.$meta();
	context.initialVuexState = app.$store.state;
}

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

			const prefetches = comps.map(comp => comp.prefetch(args));

			if (typeof app.$options.prefetch === 'function') prefetches.push(app.$options.prefetch({
				store: app.$store,
				route: app.$route
			}));

			if (prefetches.length) Promise.all(prefetches)
				.then(compData => {
					init(app, context);
					// do not include root component here
					context.initialComponentStates = compData.slice(0, comps.length);
					for (let i in comps) comps[i].prefetchedData = context.initialComponentStates[i];
					if (app.$route.meta && app.$route.meta.statusCode) context.statusCode = app.$route.meta.statusCode;
					else if (app.$store.getters.serverError) context.statusCode = 500;
					resolve(app);
				})
				.catch(err => {
					// let the application deal with errors
					app.$store.commit('fireServerError', err);
					init(app, context);
					context.statusCode = 500;
					resolve(app);
				});
			else {
				init(app, context);
				resolve(app);
			}
		});
		app.$router.push(context.url);
	});
};