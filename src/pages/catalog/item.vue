<script>
	export default {
		head: () => ({
			title: this.id
		}),
		props: ['id'],
		routePath: ':id'
	}
</script>
<template lang="pug">
	h1!='Catalog item #{{ id }}'
</template>