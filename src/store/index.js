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
		}
	}
});