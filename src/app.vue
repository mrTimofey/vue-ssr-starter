<script>
	import { mapGetters } from 'vuex';
	import 'src/app.styl';
	import 'src/footer.css';

	export default {
		head: {
			title: 'App',
			titleTemplate: '%s | App',
			htmlAttrs: {
				lang: 'en'
			}
		},
		computed: mapGetters(['serverError'])
	};
</script>
<template lang="pug" src="src/app.pug"></template>