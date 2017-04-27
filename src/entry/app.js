import Vue from 'vue';
import Meta from 'vue-meta';
import { sync } from 'vuex-router-sync';

function filenameToCamelCase(str, lowerFirst = false) {
	return str
	// remove extension
	.replace(/\.[a-z0-9]+$/i, '')
	// remove leading ./
	.replace(/^\.\//, '')
	// to CamelCase
	.split('/').join('-').split('_').join('-').split('-')
	.map((el, i) => el.substr(0, 1)[(lowerFirst && i === 0) ? 'toLowerCase' : 'toUpperCase']() + el.substr(1))
	.join();
}

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
const requireComp = require.context('src/components/shared/', true, /\.(vue|js)$/);
for (let name of requireComp.keys()) {
	let component = requireComp(name);
	if (component.default) component = component.default;
	Vue.component(filenameToCamelCase(name), component);
}

// filters
const requireFilter = require.context('src/filters/', true, /\.js$/);
for (let name of requireFilter.keys()) {
	let filter = requireFilter(name);
	if (filter.default) filter = filter.default;
	Vue.filter(filenameToCamelCase(name, true), filter);
}

// directives
const requireDirective = require.context('src/directives/', true, /\.js$/);
for (let name of requireDirective.keys()) {
	let directive = requireDirective(name);
	if (directive.default) directive = directive.default;
	Vue.directive(filenameToCamelCase(name, true), directive);
}

export default context => {
	const store = createStore(context),
		router = createRouter(context);
	sync(store, router);
	return new Vue({ store, router, ...app });
};