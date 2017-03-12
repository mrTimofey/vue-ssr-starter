import Vue from 'vue';
import Vuex from 'vuex'

Vue.use(Vuex);

export default new Vuex.Store({
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
		pushItem(state, item) {
			state.items.push(item);
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
			// imitate async
			return new Promise((resolve, reject) => {
				return reject();
				setTimeout(() => {
					if (Math.random() > 0.5) {
						commit('setItems', [
							{
								id: 100,
								title: 'Item 100'
							},
							{
								id: 101,
								title: 'Item 101'
							},
							{
								id: 104,
								title: 'Item 104'
							}
						]);
						resolve()
					}
					else reject();
				}, 1000);
			});
		}
	}
});