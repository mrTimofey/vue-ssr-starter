<script>
	export default {
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
		img#logo(src="~i/webpack.svg")
		!='<svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#i-vk"></use></svg>'
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
		router-view
</template>
<style lang="stylus" rel="stylesheet/stylus">
	#logo
		max-width 300px
		fixed false false 0 0
</style>