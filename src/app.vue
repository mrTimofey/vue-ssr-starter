<script>
	import { mapGetters } from 'vuex';

	export default {
		head: {
			title: 'App',
			titleTemplate: '%s | App',
			htmlAttrs: {
				lang: 'en'
			}
		},
		computed: mapGetters(['serverError']),
	};
</script>
<template lang="pug">
	#app
		header
			.logos
				router-link(to="/")
					img(src="~assets/i/webpack.svg")
					img(src="~assets/i/vue.png")
					icon(name="webpack")
			nav
				b!='Examples: '
				router-link(to="/examples/async") Async
				!=' | '
				router-link(to="/examples/server-error") Server error
				!=' | '
				router-link(to="/whatever") 404
				!=' | '
				a(href="~assets/docs/example.txt" download) Download
		hr
		main
			p.server-error(v-if="serverError")!='Something went wrong... '
				template(v-if="serverError.message")
					br
					!='{{ serverError.message }}'
			router-view(v-else)
</template>
<style lang="stylus">
	.server-error
		// variable from src/shared.styl
		color $red
	.logos
		img, svg
			max-width 80px
			max-height 80px
</style>