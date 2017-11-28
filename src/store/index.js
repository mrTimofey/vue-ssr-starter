import Vue from 'vue';
import Vuex from 'vuex';
import http, { authorized, recallToken, logout } from 'src/http';

Vue.use(Vuex);

// we should return factory for SSR (runInNewContext: false)
export default () => new Vuex.Store({
	state: {
		serverError: false,
		// null if did not try to fetch, false if not authorized
		user: null,
		items: []
	},
	getters: {
		serverError: state => state.serverError,
		user: state => state.user,
		items: state => state.items
	},
	mutations: {
		fireServerError(state, err) {
			state.serverError = err || true;
		},
		clearServerError(state) {
			state.serverError = false;
		},
		setUser(state, user) {
			state.user = user;
		},
		setItems(state, items) {
			state.items = items;
		}
	},
	actions: {
		fetchUser({ commit }) {
			if (authorized()) return http.get('me')
				.catch(err => err.response && err.response.status === 401 ? recallToken() : Promise.reject(err))
				.then(res => commit('setUser', res.data))
				.catch(err => {
					commit('setUser', false);
					throw err;
				});
			commit('setUser', false);
			return Promise.reject();
		},
		logout({ commit }) {
			logout();
			commit('setUser', false);
		},
		fetchItems({ commit }) {
			return http.get('https://randomuser.me/api/', { params: { results: 10 } }).then(res => {
				commit('setItems', res.data.results);
			});
		}
	}
});