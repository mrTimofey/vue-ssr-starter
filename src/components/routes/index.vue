<script>
	export default {
		head: {
			title: 'Home'
		}
	}
</script>
<template lang="pug">
	article
		h1 Home page
		p Lorem ipsum dolor sit amet, consectetur adipisicing elit. A alias autem cupiditate deleniti dolor esse exercitationem, fugit hic impedit inventore laudantium necessitatibus obcaecati odit perspiciatis quas quos sequi vitae. Excepturi.
		p {{ "I AM LOWERCASED" | lower }}
		p {{ "i am uppercased" | upper }}
		input(v-focus placeholder="I am focused")
</template>