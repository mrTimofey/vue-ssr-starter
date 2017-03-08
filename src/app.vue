<script>
	const test = { var1: 'val', var2: 'val' };

    export default {
	    head: {
		    title: 'Site name',
		    titleTemplate: 'Home | %s',
		    htmlAttrs: {
			    lang: 'en'
		    }
	    },
    	props: ['message'],
        data: () => ({
	        test: 'test',
			...test
        })
    }
</script>
<template lang="pug">
	#app
		p Test: {{ test }}, message: {{ message }} {{ test }}
		input(v-model="test" ':required'="false")
</template>
<style lang="stylus" rel="stylesheet/stylus">
	#app p
		background gray
		color white
		padding 10px
		fixed false 0 0 0
	#app input
		background gray
</style>