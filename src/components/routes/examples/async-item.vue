<script>
	export default {
		routePath: ':id',
		props: ['id'],
		data: () => ({
			name: 'loading...',
			description: 'loading...'
		}),
		prefetch: ({ props }) => new Promise(resolve => setTimeout(() => {
			resolve({
				name: 'Name of ' + props.id,
				description: 'something'
			});
		}, 200))
	};
</script>
<template lang="pug">
	article
		h1 Item # {{ id }}
		h2 {{ name }}
		p {{ description }}
</template>