<script>
	import { mapGetters, mapActions } from 'vuex';
	import 'src/styles/reset.styl';

	import ServerError from 'src/components/server-error.vue';
	import NotFound from 'src/components/not-found.vue';

	export default {
		name: 'App',
		head: {
			title: 'App',
			titleTemplate: '%s | App',
			htmlAttrs: {
				lang: 'en'
			}
		},
		computed: mapGetters(['serverError']),
		methods: mapActions(['fetchUser']),
		mounted() {
			this.fetchUser();
		},
		components: { ServerError, NotFound }
	};
</script>
<template lang="pug">
	server-error(v-if="serverError" :error="serverError")
	router-view(v-else)
</template>