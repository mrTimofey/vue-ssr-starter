<script>
	import { mapGetters, mapActions } from 'vuex';
	import 'src/styles/reset.styl';

	export default {
		name: 'App',
		head: {
			title: 'App',
			titleTemplate: '%s | App',
			htmlAttrs: {
				lang: 'en'
			}
		},
		computed: mapGetters(['serverError']),
		methods: mapActions(['fetchUser']),
		mounted() {
			this.fetchUser();
		}
	};
</script>
<template lang="pug">
	p.server-error(v-if="serverError")!='Something went wrong...'
		template(v-if="serverError.message")
			br
			!='{{ serverError.message }}'
	router-view(v-else)
</template>