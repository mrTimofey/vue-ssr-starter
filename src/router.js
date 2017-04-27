import Vue from 'vue';
import Router from 'vue-router';

import { filenameToCamelCase } from 'src/utils';

Vue.use(Router);

// get all files in the directory excluding ones with "_" started names (and containing folders starting from "_")
const requirePage = require.context('src/components/routes/', true, /^(?:(?!\/?_).)+\.(vue|js)$/);
const routes = [];
let route404;

// prefetch data on route change or before mounting (client-side only)
const prefetchMixin = {
	data: () => ({
		// let component know when prefetching is done
		prefetching: false
	}),
	// for keep-alive components
	beforeRouteUpdate(to, from, next) {
		if (this.$options.prefetch) {
			const promise = this.$options.prefetch(this.$store);
			if (!promise) return next();
			this.prefetching = true;
			promise
			.then(() => {
				this.prefetching = false;
				next();
			})
			.catch(err => {
				this.prefetching = false;
				this.$store.commit('fireServerError', err);
				next(err);
			});
		}
		else next();
	},
	beforeMount() {
		if (this.$root._isMounted && this.$options.prefetch) {
			const promise = this.$options.prefetch(this.$root.$store);
			if (!promise) return;
			this.prefetching = true;
			promise
			.then(() => {
				this.prefetching = false;
			})
			.catch(err => {
				this.prefetching = false;
				this.$store.commit('fireServerError', err);
			});
		}
	}
};

for (let name of requirePage.keys()) {
	let component = requirePage(name),
		route = {
			component,
			path: name.substr(1, name.length - 5).replace(/\/index$/, '/') +
				// allow components adding their own route parameters
				(component.routePath ? ('/' + component.routePath) : '')
		};

	component.mixins = component.mixins || [];
	component.mixins.push(prefetchMixin);
	component.name = component.name || filenameToCamelCase(name);

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

// we should return factory for SSR
export default () => new Router({ routes, mode: 'history' });