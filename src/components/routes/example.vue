<script>
	import { mapMutations } from 'vuex';

	export default {
		head: {
			title: 'Example page'
		},
		methods: {
			...mapMutations(['pushItem']),
			createItem() {
				let id = parseInt(Math.random() * 1000);
				this.pushItem({
					id,
					title: `New item #${id}`
				});
			}
		}
	}
</script>
<template lang="pug">
	div
		h1 Example page
		button(@click="createItem()") Create item
</template>