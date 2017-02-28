<script>
    export default {
    	props: ['message'],
        data: () => ({
	        test: 'test'
        })
    }
</script>
<template lang="pug">
	#app
		p Test: {{ test }}, message: {{ message }}
		input(v-model="test")
</template>
<style lang="stylus">
	#app p
		background gray
		color white
		padding 10px
		fixed false 0 0 0
</style>