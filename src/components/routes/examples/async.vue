<script>
	import { mapGetters } from 'vuex';

	export default {
		computed: {
			...mapGetters(['items'])
		},
		head() {
			return {
				// test dynamic head title
				title: this.prefetching ? 'Loading...' : ('Items fetched: ' + this.items.length)
			};
		},
		// test async loading from the external API
		prefetch: ({ store }) => store.dispatch('fetchItems')
	};
</script>
<template lang="pug">
	div
		transition(name="opacity")
			p.loading-message(key="loading" v-if="prefetching") Loading items...
			ul(key="list" v-else)
				li(v-for="item in items"): router-link(':to'="'async-item/' + item.phone")
					h3 {{ item.name.title }} {{ item.name.first }} {{ item.name.last }}
					img(':src'="item.picture.thumbnail")
</template>
<style lang="stylus">
	.opacity-enter-active
		transition opacity 0.5s
	.opacity-enter, .opacity-leave-to
		opacity 0
</style>