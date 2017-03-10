<script>
	export default {
		head() {
			return {
				title: `Item #${this.id}`
			};
		},
		props: ['id'],
		routePath: ':id'
	}
</script>
<template lang="pug">
	h1!='Item #{{ id }}'
</template>