import createApp from './app';

export default context => {
	const app = createApp(context);

	return new Promise(resolve => {
		app.$router.onReady(() => {
			const prefetchComponents = app.$router.getMatchedComponents()
				.filter(comp => typeof comp.prefetch === 'function');

			if (typeof app.$options.prefetch === 'function') prefetchComponents.unshift(app.$options);

			Promise.all(prefetchComponents.map(comp => comp.prefetch(app.$store)))
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