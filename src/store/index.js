import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

// we should return factory for SSR (runInNewContext: false)
export default () => new Vuex.Store({
	state: {
		serverError: false,
	},
	getters: {
		serverError: state => state.serverError,
	},
	mutations: {
		setError(state, err) {
			state.serverError = err || true;
		},
		fireNotFoundError(state, message = '404 Not found') {
			state.serverError = { statusCode: 404, message };
		},
		clearError(state) {
			state.serverError = false;
		},
	},
});
