import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

// get all files in directory but exclude ones with "_" started names (and containing folders starting from "_")
const requirePage = require.context('src/components/routes/', true, /^(?:(?!\/?_).)+\.(vue|js)$/);
const routes = [];
let route404;

for (let name of requirePage.keys()) {
	let component = requirePage(name),
		route = {
			component,
			path: name.substr(1, name.length - 5).replace(/\/index$/, '/') +
				// allow components adding their own route parameters
				(component.routePath ? ('/' + component.routePath) : '')
		};
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

if (route404) routes.push(route404);

export default new Router({ routes, mode: 'history' });