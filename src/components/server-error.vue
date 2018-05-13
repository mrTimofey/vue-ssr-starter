<script>
	import NotFound from 'src/components/not-found.vue';
	export default {
		props: ['error'],
		components: { NotFound }
	};
</script>
<template lang="pug">
	not-found(v-if="error.response && error.response.status === 404 || error.statusCode === 404")
	p.server-error(v-else)!='Что-то пошло не так...'
		template(v-if="error.message")
			br
			| {{ error.message }}
</template>