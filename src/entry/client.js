import Vue from 'vue';
import App from '../app.vue';
import { setupPlugins, component} from './shared';

setupPlugins(Vue);

const root = new Vue({
	render: h => h(App, { props: { message: 'hi' } }),
	...component
});

root.$mount(document.body.querySelector('[server-rendered]'));