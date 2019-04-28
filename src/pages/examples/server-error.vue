<script>
	export default {
		// test server error
		prefetch: () => Promise.reject({ message: 'Example error' })
	};
</script>
<template lang="pug">
	p(v-if="prefetching") Loading...
	p(v-else) You will never see this text
</template>
