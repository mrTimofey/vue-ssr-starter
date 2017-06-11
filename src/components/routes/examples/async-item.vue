<script>
	export default {
		routePath: ':id',
		props: ['id']
	};
</script>
<template lang="pug">
	h1 Item # {{ id }}
</template>