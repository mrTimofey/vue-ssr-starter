import Vue from 'vue';
import Meta from 'vue-meta';
import { sync } from 'vuex-router-sync';

import { filenameToCamelCase, requireAll } from 'src/utils';

import createStore from 'src/store';
import createRouter from 'src/router';
import app from 'src/app.vue';

Vue.use(Meta, {
	keyName: 'head',
	attribute: 'data-meta',
	ssrAttribute: 'data-meta-ssr',
	tagIDKeyName: 'vmid'
});

// shared components
requireAll(require.context('src/components/shared/', true, /\.(vue|js)$/), (module, name) => {
	Vue.component(filenameToCamelCase(name), module);
});

// filters
requireAll(require.context('src/filters/', true, /\.js$/), (module, name) => {
	Vue.filter(filenameToCamelCase(name), module);
});

// directives
requireAll(require.context('src/directives/', true, /\.js$/), (module, name) => {
	Vue.directive(filenameToCamelCase(name), module);
});

// we should return factory for SSR (runInNewContext: false)
export default context => {
	const store = createStore(context),
		router = createRouter(context);
	sync(store, router);
	return new Vue({ store, router, ...app });
};