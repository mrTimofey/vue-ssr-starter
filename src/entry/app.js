import Vue from 'vue';
import Meta from 'vue-meta';
import { sync } from 'vuex-router-sync';;

import http from '../http'
import store from '../store';
import router from '../router';
import app from '../app.vue';

Vue.http = http;
Vue.prototype.$http = http;
sync(store, router);

Vue.use(Meta, {
	keyName: 'head',
	attribute: 'data-meta',
	ssrAttribute: 'data-meta-ssr',
	tagIDKeyName: 'vmid'
});

import Icon from '../icon';

Vue.component('Icon', Icon);

export default new Vue({ store, router, ...app });