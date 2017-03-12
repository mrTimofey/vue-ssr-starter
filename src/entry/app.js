import Vue from 'vue';
import Meta from 'vue-meta';
import { sync } from 'vuex-router-sync';

import http from 'src/http'
import store from 'src/store';
import router from 'src/router';
import app from 'src/app.vue';

Vue.http = http;
Vue.prototype.$http = http;
sync(store, router);

Vue.use(Meta, {
	keyName: 'head',
	attribute: 'data-meta',
	ssrAttribute: 'data-meta-ssr',
	tagIDKeyName: 'vmid'
});

const requireComp = require.context('src/components/shared/', true, /\.(vue|js)$/);

for (let name of requireComp.keys()) {
	let component = requireComp(name);
	if (component.default) component = component.default;

	Vue.component(name
			// remove extension
			.replace(/\.[a-z0-9]+$/i, '')
			// remove leading ./
			.replace(/^\.\//, '')
			// to CamelCase
			.split('/').join('-').split('-').map(el => el.substr(0, 1).toUpperCase() + el.substr(1))
			.join(),
		component);
}

export default new Vue({ store, router, ...app });