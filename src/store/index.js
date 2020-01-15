import Vue from 'vue';
import Vuex from 'vuex';
import http from 'src/http';

Vue.use(Vuex);

// we should return factory for SSR (runInNewContext: false)
export default () => new Vuex.Store({
	state: {
		serverError: false,
		items: [],
	},
	getters: {
		serverError: state => state.serverError,
		items: state => state.items,
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
		setItems(state, items) {
			state.items = items;
		},
	},
	actions: {
		fetchItems({ commit }) {
			return http.get('https://randomuser.me/api/', { params: { results: 10 } }).then(res => {
				commit('setItems', res.data.results);
			});
		},
	},
});
