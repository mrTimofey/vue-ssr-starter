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
		img#logo(src="~i/webpack.svg")
		icon.my-con(name="vk")
		nav
			router-link(to="/") Home
			!=' | '
			router-link(to="/example") Example
			!=' | '
			router-link(to="/catalog") Catalog
			!=' | '
			router-link(to="/catalog/item/123") Item 123
			!=' | '
			router-link(to="/catalog/item/500") Item 500
			!=' | '
			a(href="~docs/test.txt" target="_blank") VK
		p.error(v-if="serverError") Что-то пошло не так...
		router-view(v-else)
</template>
<style lang="stylus" rel="stylesheet/stylus">
	#logo
		max-width 300px
		fixed false false 0 0
</style>