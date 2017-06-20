import Vue from 'vue';
import Router from 'vue-router';
import prefetchMixin from 'src/mixins/prefetch';

import { filenameToCamelCase, requireAll } from 'src/utils';

Vue.use(Router);

const routes = [];
let route404, pathMap;

if (process.env.NODE_ENV !== 'production') pathMap = {};

// register all components in directory as routes (excepting files/folders starting from "_")
requireAll(require.context('src/pages/', true, /^(?:(?!\/?_).)+\.(vue|js)$/), (component, name) => {
	const route = {
		component,
		// generate route path based on file path
		// remove file extension and '/index'
		path: name.substr(1).replace(/(\/index)?\.[a-zA-Z0-9]+$/, '') +
			// allow components adding their own route parameters
			(component.routePath ? ('/' + component.routePath) : ''),
		// add meta fields if there are any
		meta: component.routeMeta
	};

	// prefetch data for all route components
	if (!component.mixins) component.mixins = [];
	component.mixins.push(prefetchMixin);

	if (route.path === '/404') {
		// generate component name automatically
		if (!component.name) component.name = 'NotFoundPage';

		route.path = '*';
		if (!route.meta) route.meta = { statusCode: 404 };
		else if (!route.meta.statusCode) route.meta.statusCode = 404;
		route404 = route;
	}
	else {
		if (route.path === '') route.path = '/';
		// generate component name automatically
		if (!component.name) component.name = filenameToCamelCase(name) + 'Page';

		// let components create their own sub routes
		if (component.routes) route.children = component.routes;
		// map route parameters to component props by default
		route.props = component.routeProps === undefined ? true : component.routeProps;

		if (process.env.NODE_ENV !== 'production') {
			if (pathMap[route.path])
				throw new Error(`Duplicate path in vue router: ${route.path}, components are: ${pathMap[route.path]}, ${name}`);
			pathMap[route.path] = name;
		}
		routes.push(route);
	}
});

// catch-all route (404)
if (route404) routes.push(route404);

// we should return factory for SSR (runInNewContext: false)
export default () => new Router({
	routes,
	mode: 'history',
	scrollBehavior(to, from, saved) {
		return to.path === from.path ? saved : { x: 0, y: 0 };
	}
});