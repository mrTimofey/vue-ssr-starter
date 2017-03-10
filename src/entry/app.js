import Vue from 'vue';
import Meta from 'vue-meta';
import { sync } from 'vuex-router-sync';

import app from '../app.vue';

import store from '../store';
import router from '../router';

sync(store, router);

Vue.use(Meta, {
	keyName: 'head',
	attribute: 'data-meta',
	ssrAttribute: 'data-meta-ssr',
	tagIDKeyName: 'vmid'
});

export default new Vue({ store, router, ...app });