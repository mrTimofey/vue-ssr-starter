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
			return new Promise((resolve, reject) => {
				if (authorized()) return http.get('me')
					.then(res => { commit('setUser', res.data); resolve(res); })
					.catch(() => {
						recallToken()
							.then(res => { commit('setUser', res.data); resolve(res); })
							.catch(err => { commit('setUser', false); if (err) reject(err); else resolve(); });
					});
				commit('setUser', false);
				resolve();
			});
		},
		logout({ commit }) {
			logout();
			commit('setUser', false);
		}
	}
});