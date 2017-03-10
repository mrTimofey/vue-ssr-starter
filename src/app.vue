<script>
	import Vue from 'vue';
	import Meta from 'vue-meta';
	import Router from 'vue-router';
	import Vuex from 'vuex';
	import { sync } from 'vuex-router-sync';

	import routes from './routes';

	Vue.use(Vuex);
	Vue.use(Router);
	Vue.use(Meta, {
		keyName: 'head',
		attribute: 'data-meta',
		ssrAttribute: 'data-meta-ssr',
		tagIDKeyName: 'vmid'
	});

	const router = new Router({ routes, mode: 'history' });

	export default {
		router,
		head: {
			title: 'App',
			titleTemplate: '%s | App',
			htmlAttrs: {
				lang: 'en'
			}
		}
	};
</script>
<template lang="pug">
	#app
		nav
			router-link(to="/") Home
			!=' | '
			router-link(to="/example") Example
			!=' | '
			router-link(to="/catalog/item/123") Item 123
			!=' | '
			router-link(to="/catalog/item/500") Item 500
		router-view
</template>