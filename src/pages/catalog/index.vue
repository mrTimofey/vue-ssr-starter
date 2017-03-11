<script>
	import { mapGetters } from 'vuex';

	export default {
		computed: {
			...mapGetters(['items'])
		},
		prefetch(store) {
			return store.dispatch('fetchItems');
		}
	}
</script>
<template lang="pug">
	div
		transition(name="opacity")
			p.loading-message(key="loading" v-if="prefetching") Загрузка...
			ul(key="list" v-else)
				li(v-for="item in items"): router-link(':to'!="`/catalog/item/${item.id}`") {{ item.title }}<br><small>{{ item.id }}</small>
</template>
<style lang="stylus" rel="stylesheet/stylus">
	.loading-message
		color gray
	.opacity-enter-active
		transition opacity 0.5s
	.opacity-enter, .opacity-leave-to
		opacity 0
</style>