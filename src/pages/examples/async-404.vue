<script>
	export default {
		prefetch: () => new Promise((resolve, reject) => {
			setTimeout(() => {
				reject(404);
			}, 200);
		}),
	};
</script>

<template lang="pug">
	p(v-if="prefetching") Loading...
	p(v-else) You will never see this text
</template>
