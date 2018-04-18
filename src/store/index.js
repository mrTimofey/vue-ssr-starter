import Vue from 'vue';
import Vuex from 'vuex';
import http, { authorized, recallToken, logout } from 'src/http';

Vue.use(Vuex);

// we should return factory for SSR (runInNewContext: false)
export default () => new Vuex.Store({
	state: {
		serverError: false,
		// null if did not try to fetch, false if not authorized
		user: null
	},
	getters: {
		serverError: state => state.serverError,
		user: state => state.user
	},
	mutations: {
		fireServerError(state, err) {
			state.serverError = err || true;
		},
		clearServerError(state) {
			state.serverError = false;
		},
		setUser(state, data) {
			state.user = data;
		}
	},
	actions: {
		fetchUser({ commit }) {
			if (authorized()) return http.get('auth')
				.catch(err => err.response && err.response.status === 401 ? recallToken() : Promise.reject(err))
				.then(res => res && commit('setUser', res.data))
				.catch(err => {
					commit('setUser', false);
					throw err;
				});
			commit('setUser', false);
		},
		logout({ commit }) {
			logout();
			commit('setUser', false);
		}
	}
});