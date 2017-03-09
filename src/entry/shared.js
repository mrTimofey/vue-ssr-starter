import Meta from 'vue-meta';
import Router from 'vue-router';
import routes from '../routes';

// setup vue plugins
export function setupPlugins(Vue) {
	Vue.use(Router);
	Vue.use(Meta, {
		keyName: 'head',
		attribute: 'data-meta',
		ssrAttribute: 'data-meta-ssr',
		tagIDKeyName: 'vmid'
	});
}

// root component object
export const component = {
	router: new Router({ routes, mode: 'history' })
};