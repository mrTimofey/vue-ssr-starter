import createApp from './app';
import http from 'src/http';

function init(app, context, err) {
	app.serverPrefetched = true;
	if (!err) err = app.$store.getters.serverError;
	if (err) context.statusCode = err.statusCode || err.response && err.response.status || 500;
	else if (app.$route && app.$route.meta && app.$route.meta.statusCode) context.statusCode = app.$route.meta.statusCode;
	context.meta = app.$meta();
	context.initialVuexState = app.$store.state;
}

export default context => {
	const app = createApp(context);
	app.serverPrefetched = false;

	// replace relative baseURL with app URL
	if (!/^https?:\/\//.test(http.defaults.baseURL))
		http.defaults.baseURL = context.protocol + '://' + context.hostname + http.defaults.baseURL;

	return new Promise((resolve, reject) => {
		app.$router.onReady(() => {
			// router matched components with prefetch
			const comps = app.$router.getMatchedComponents().filter(comp => typeof comp.prefetch === 'function');

			// prefetch call arguments
			const args = {
					store: app.$store,
					props: app.$route.params,
					route: app.$route
				},
				errors = [];

			const prefetches = comps.map(comp => {
				const prefetch = comp.prefetch(args);
				if (prefetch && prefetch.catch) prefetch.catch(err => {
					errors.push(err);
				});
				return prefetch;
			});

			if (typeof app.$options.prefetch === 'function') prefetches.push(app.$options.prefetch({
				store: app.$store,
				route: app.$route
			}));

			if (prefetches.length) Promise.all(prefetches).then(compData => {
				// do not include root component here
				context.initialComponentStates = compData.slice(0, comps.length);
				for (let i in comps) comps[i].prefetchedData = context.initialComponentStates[i];
				if (errors.length) app.$store.commit('fireServerError', errors[0]);
				init(app, context, errors[0]);
				resolve(app);
			}).catch(reject);
			else {
				init(app, context);
				resolve(app);
			}
		});
		app.$router.push(context.url);
	});
};