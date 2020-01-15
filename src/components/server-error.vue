<script>
	import NotFound from 'src/components/not-found.vue';
	export default {
		components: { NotFound },
		props: {
			error: null,
		},
	};
</script>
<template lang="pug">
	not-found(v-if="error.response && error.response.status === 404 || error.statusCode === 404")
	p.server-error(v-else)!='Something went wrong...'
		template(v-if="error.message")
			br
			| {{ error.message }}
</template>
