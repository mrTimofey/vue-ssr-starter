import Vue from 'vue';
import createApp from './app';
import http from 'src/http';
import { filenameToCamelCase } from 'src/utils';
import { serverPrefetch } from 'src/utils/ssr';

// directives
for (const name of require.context('src/directives/', true, /\.(js|ts)$/).keys())
	Vue.directive(filenameToCamelCase(name), {});

function init(app, context, err) {
	if (!err) err = app.$store.getters.serverError;
	if (err) context.statusCode = err.statusCode || err.response && err.response.status || 500;
	else if (app.$route && app.$route.meta && app.$route.meta.statusCode) context.statusCode = app.$route.meta.statusCode;
	context.meta = app.$meta();
	context.storeState = app.$store.state;
}

export default context => {
	const app = createApp(context);

	if (context.envConfig.apiBaseUrl)
		http.defaults.baseURL = context.envConfig.apiBaseUrl;
	if (!/^https?:\/\//.test(http.defaults.baseURL))
		http.defaults.baseURL = context.protocol + '://' + context.hostname + http.defaults.baseURL;

	return new Promise((resolve, reject) => {
		app.$router.onReady(() => {
			// router matched components with prefetch
			const errors = [],
				prefetches = app.$router.getMatchedComponents()
					.map(comp => serverPrefetch(app, context, comp).catch(err => {
						errors.push(err);
					}));

			prefetches.push(serverPrefetch(app, context));

			if (prefetches.length) Promise.all(prefetches).then(() => {
				if (errors.length) app.$store.commit('setError', errors[0]);
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
