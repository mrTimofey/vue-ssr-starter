import Vue from 'vue';
import App from '../../src/app.vue';
import { setupPlugins, component } from './shared';

setupPlugins(Vue);

const app = new Vue({
	render: h => h(App),
	...component
});
const meta = app.$meta();

export default context => {
	context.meta = meta;
	return app;
}