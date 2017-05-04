import Vue from 'vue';
import Router from 'vue-router';
import prefetchMixin from 'src/mixins/prefetch';

import { filenameToCamelCase } from 'src/utils';

Vue.use(Router);

// register all components in directory as routes (excepting files/folders starting from "_")
const requirePage = require.context('src/components/routes/', true, /^(?:(?!\/?_).)+\.(vue|js)$/);
const routes = [];
let route404;

for (let name of requirePage.keys()) {
	let component = requirePage(name),
		route = {
			component,
			// generate route path based on file path
			path: name.substr(1, name.length - 5).replace(/\/index$/, '/') +
				// allow components adding their own route parameters
				(component.routePath ? ('/' + component.routePath) : '')
		};

	// prefetch data for all route components
	if (!component.mixins) component.mixins = [];
	component.mixins.push(prefetchMixin);

	// generate component name automatically
	if (!component.name) component.name = filenameToCamelCase(name);

	if (route.path === '/404') {
		route.path = '*';
		route404 = route;
	}
	else {
		// let components create their own sub routes
		if (component.routes) route.children = component.routes;
		// map route parameters to component props by default
		route.props = component.routeProps === undefined ? true : component.routeProps;
		routes.push(route);
	}
}

// catch-all route (404)
if (route404) routes.push(route404);

// we should return factory for SSR (runInNewContext: false)
export default () => new Router({ routes, mode: 'history' });