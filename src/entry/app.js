import Vue from 'vue';
import Meta from 'vue-meta';
import { sync } from 'vuex-router-sync';
import { filenameToCamelCase, requireAll } from 'src/utils';

// IMPORTANT NOTE: imports order bellow matters if we want CSS related imports to be in desired order

// we should import app.vue first
// assuming common styles, resets, etc. are imported from app.vue itself and they should be loaded first
import app from 'src/app.vue';

// then we will require auto-loaded shared components to ensure their styles to go just after root component's ones

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

// page components are adding styles next
import createRouter from 'src/router';
import createStore from 'src/store';

Vue.use(Meta, {
	keyName: 'head',
	attribute: 'data-meta',
	ssrAttribute: 'data-meta-ssr',
	tagIDKeyName: 'vmid'
});

// we should return factory for SSR (runInNewContext: false)
export default context => {
	const store = createStore(context),
		router = createRouter(context);
	sync(store, router);
	return new Vue({ store, router, ...app });
};