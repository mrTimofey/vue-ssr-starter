<script>
	export default {
		head() {
			return {
				title: `Item #${this.id}`
			};
		},
		props: ['id'],
		routePath: ':id',
		created() {
			console.log(this.$options.computed);
		}
	}
</script>
<template lang="pug">
	h1!='Catalog item #{{ id }}'
</template>