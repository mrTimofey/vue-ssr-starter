const requirePage = require.context('./pages/', true, /\.vue$/);
export default requirePage.keys().map(name => {
	const component = requirePage(name);
	const path = name.substr(1, name.length - 5)
		.replace(/\/index$/, '/') +
		// allow components adding additional route parameters
		(component.routePath ? ('/' + component.routePath) : '');

	const children = component.routes || [];
	return { component, path, children, props: component.routeProps || true };
});