<script>
	import { mapGetters } from 'vuex';
	// test styl import
	import 'src/app.styl';
	// test css import
	import 'src/footer.css';

	export default {
		name: 'App',
		// test async
		prefetch: () => new Promise(resolve => setTimeout(resolve, 200)),
		head: {
			title: 'App',
			titleTemplate: '%s | App',
			htmlAttrs: {
				lang: 'en'
			}
		},
		computed: mapGetters(['serverError'])
	};
</script>
<!-- test external template -->
<template lang="pug" src="src/app.pug"></template>
<!-- test style -->
<style lang="stylus">
	footer
		fixed false 0 0 0
		background blue
</style>
<!-- test external -->
<style lang="stylus" src="src/header.styl"></style>