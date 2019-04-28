import createApp from './app';
import http from 'src/http';

export default context => {
	const app = createApp(context);

	// replace relative baseURL with app URL
	if (!/^https?:\/\//.test(http.defaults.baseURL))
		http.defaults.baseURL = context.protocol + '://' + context.hostname + http.defaults.baseURL;

	return new Promise(resolve => {
		app.$router.onReady(() => {
			const err = app.$store.getters.serverError;
			// try to set status code from error object or set 500 by default
			if (err) context.statusCode = err.statusCode || err.response && err.response.status || 500;
			// check if route has its own status code
			else if (app.$route && app.$route.meta && app.$route.meta.statusCode)
				context.statusCode = app.$route.meta.statusCode;
			context.meta = app.$meta();
			context.storeState = app.$store.state;
			resolve(app);
		});
		app.$router.push(context.url);
	});
};
