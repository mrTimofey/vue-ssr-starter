import Vue from 'vue';
import Vuex from 'vuex';
import http from 'src/http';

Vue.use(Vuex);

// we should return factory for SSR (runInNewContext: false)
export default () => new Vuex.Store({
	state: {
		serverError: false
	},
	getters: {
		serverError: state => state.serverError
	},
	mutations: {
		fireServerError(state, err) {
			state.serverError = err || true;
		},
		clearServerError(state) {
			state.serverError = false;
		}
	},
	actions: {}
});