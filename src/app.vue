<script>
	import { mapGetters, mapActions } from 'vuex';
	// test styl import
	import 'src/styles/reset.styl';
	import 'src/app.styl';
	// test css import
	import 'src/footer.css';

	import txt from 'assets/docs/example.txt';

	import ServerError from 'src/components/server-error.vue';

	export default {
		name: 'App',
		// test async prefetch
		prefetch: () => new Promise(resolve => setTimeout(resolve, 200)),
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
		data: () => ({
			txt
		}),
		computed: mapGetters(['serverError']),
		methods: mapActions(['fetchUser']),
		mounted() {
			this.fetchUser();
		},
		components: { ServerError }
	};
</script>
<!-- test external template -->
<template lang="pug" src="src/app.pug"></template>
<!-- test style -->
<style lang="stylus">
	footer
		fixed false 0 0 0
		background $blue
</style>
<!-- test external style -->
<style lang="stylus" src="src/header.styl"></style>