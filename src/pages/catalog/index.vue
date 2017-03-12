<script>
	import { mapGetters } from 'vuex';

	export default {
		data: () => ({
			error: false
		}),
		computed: {
			...mapGetters(['items'])
		},
		prefetch: store => store.dispatch('fetchItems')
	}
</script>
<template lang="pug">
	div
		transition(name="opacity")
			p.loading-message(key="loading" v-if="prefetching") Загрузка...
			ul(key="list" v-else)
				li(v-for="item in items")
					h3 {{ item.name.title }} {{ item.name.first }} {{ item.name.last }}
					img(':src'="item.picture.thumbnail")
</template>
<style lang="stylus" rel="stylesheet/stylus">
	@import '../../style'
	.loading-message
		some-mixin(gray)
	.opacity-enter-active
		transition opacity 0.5s
	.opacity-enter, .opacity-leave-to
		opacity 0
</style>