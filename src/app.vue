<script>
	import { mapGetters, mapActions } from 'vuex';
	import 'src/styles/reset.styl';

	import ServerError from 'src/components/server-error.vue';

	export default {
		name: 'App',
		head() {
			let title = 'Loading...';
			if (this.serverError) {
				if (this.serverError.response && this.serverError.response.status === 404)
					title = '404 Page not found';
				else title = this.serverError.message ||
					this.serverError.response && this.serverError.response.data.message ||
					'Something went wrong...';
			}
			return {
				title,
				titleTemplate: '%s | App',
				htmlAttrs: {
					lang: 'en'
				}
			};
		},
		components: { ServerError },
		computed: mapGetters(['serverError']),
		mounted() {
			this.fetchUser();
		},
		methods: mapActions(['fetchUser'])
	};
</script>
<template lang="pug">
	#wrapper
		main
			server-error(v-if="serverError" :error="serverError")
			router-view(v-else)
</template>