import app from './app';

export default context => {
	app.$router.push(context.url);

	return Promise.all(app.$router.getMatchedComponents().map(comp => {
		context.meta = app.$meta();
		comp.serverRendered = true;
		if (comp.prefetch) return comp.prefetch(app.$store);
	})).then(() => {
		context.initialState = app.$store.state;
		return app;
	});
}