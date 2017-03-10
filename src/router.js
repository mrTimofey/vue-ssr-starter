import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

const requirePage = require.context('./pages/', true, /\.vue$/);
const routes = [];
let route404;

for (let name of requirePage.keys()) {
	let component = requirePage(name),
		route = {
			component,
			path: name.substr(1, name.length - 5).replace(/\/index$/, '/') +
				// allow components adding additional route parameters
				(component.routePath ? ('/' + component.routePath) : ''),
			children: component.routes || [],
			props: component.routeProps || true
		};
	if (route.path === '/404') {
		route.path = '*';
		route404 = route;
	}
	else routes.push(route);
}

if (route404) routes.push(route404);

export default new Router({ routes, mode: 'history' });