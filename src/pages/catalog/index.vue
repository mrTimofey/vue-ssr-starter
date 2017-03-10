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
	ul
		li(v-for="item in items"): router-link(':to'!="`/catalog/item/${item.id}`") {{ item.title }}<br><small>{{ item.id }}</small>
</template>