import Vue from 'vue';
import App from '../app.vue';

const app = new Vue(App);
const meta = app.$meta();

export default context => {
	context.meta = meta;
	app.$router.push(context.url);
	return app;
}