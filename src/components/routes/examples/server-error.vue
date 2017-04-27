<script>
	export default {
		prefetch: store => store.commit('fireServerError', { message: 'Example error' })
	};
</script>
<template lang="pug">
	p You will never see this text
</template>