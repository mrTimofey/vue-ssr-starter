import Vue from 'vue';
import Vuex from 'vuex';
import http from 'src/http';

Vue.use(Vuex);

const store = {
	state: {
		serverError: false,
		items: []
	},
	getters: {
		items: state => state.items,
		serverError: state => state.serverError
	},
	mutations: {
		setItems(state, items) {
			Vue.set(state, 'items', items);
		},
		fireServerError(state, err) {
			state.serverError = err || true;
		},
		clearServerError(state) {
			state.serverError = false;
		}
	},
	actions: {
		fetchItems({ commit }) {
			return http.get('https://randomuser.me/api/', { params: { results: 10 } }).then(res => {
				commit('setItems', res.data.results);
			});
		}
	}
};

// we should return factory for SSR (runInNewContext: false)
export default () => new Vuex.Store(store);