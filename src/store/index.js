import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const fireNotFoundError = (state, message = '404 Not found') => {
	state.serverError = { statusCode: 404, message };
};

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
			if (err === 404) fireNotFoundError(state);
			else state.serverError = err || true;
		},
		fireNotFoundError,
		clearError(state) {
			state.serverError = false;
		},
	},
});
