<script>
	export default {
		head: {
			title: 'Home'
		}
	};
</script>
<template lang="pug">
	include /mixins.pug
	article
		+sayHi()
		h1 Home page
		p Lorem ipsum dolor sit amet, consectetur adipisicing elit. A alias autem cupiditate deleniti dolor esse exercitationem, fugit hic impedit inventore laudantium necessitatibus obcaecati odit perspiciatis quas quos sequi vitae. Excepturi.

		p {{ "I AM LOWERCASED" | lower }} - `lower` filter
		p {{ "i am uppercased" | upper }} - `upper` filter
		input(v-focus placeholder="I am focused")
		!=' - `focus` directive'
</template>