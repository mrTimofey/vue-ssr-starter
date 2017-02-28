import App from '../../src/app.vue';
import Vue from 'vue';

export default context => {
	return new Vue({
		render: h => h(App, { props: { message: context.url }})
	});
};