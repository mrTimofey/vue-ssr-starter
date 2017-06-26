<script>
	export default {
		routeMeta: {
			// just testing
			statusCode: 201
		},
		head: {
			title: 'Home'
		}
	};
</script>
<template lang="pug">
	//- test relative import
	include ../mixins.pug
	article
		// test mixins
		+sayHi()
		h1 Home page
		p Lorem ipsum dolor sit amet, consectetur adipisicing elit. A alias autem cupiditate deleniti dolor esse exercitationem, fugit hic impedit inventore laudantium necessitatibus obcaecati odit perspiciatis quas quos sequi vitae. Excepturi.

		// test filters
		p {{ "I AM LOWERCASED" | lower }} - `lower` filter
		p {{ "i am uppercased" | upper }} - `upper` filter

		//- test focus directive
		input(v-focus placeholder="I am focused")
		!=' - `focus` directive'
</template>