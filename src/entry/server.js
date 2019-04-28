import createApp from './app';
import http from 'src/http';
import { serverPrefetch } from 'src/utils/ssr';

function init(app, context, err) {
	if (!err) err = app.$store.getters.serverError;
	if (err) context.statusCode = err.statusCode || err.response && err.response.status || 500;
	else if (app.$route && app.$route.meta && app.$route.meta.statusCode) context.statusCode = app.$route.meta.statusCode;
	context.meta = app.$meta();
	context.storeState = app.$store.state;
}

export default context => {
	const app = createApp(context);

	// replace relative baseURL with app URL
	if (!/^https?:\/\//.test(http.defaults.baseURL))
		http.defaults.baseURL = context.protocol + '://' + context.hostname + http.defaults.baseURL;

	return new Promise((resolve, reject) => {
		app.$router.onReady(() => {
			// router matched components with prefetch
			const errors = [],
				prefetches = app.$router.getMatchedComponents().map(comp => {
					const prefetch = serverPrefetch(app, comp);
					if (prefetch && prefetch.catch) return prefetch.catch(err => {
						errors.push(err);
					});
					return prefetch;
				});

			prefetches.push(serverPrefetch(app));

			if (prefetches.length) Promise.all(prefetches).then(() => {
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
