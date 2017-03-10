import Vue from 'vue';
import Vuex from 'vuex'

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		items: []
	},
	getters: {
		items: state => state.items
	},
	mutations: {
		setItems(state, items) {
			Vue.set(state, 'items', items);
		},
		pushItem(state, item) {
			state.items.push(item);
		}
	},
	actions: {
		/*async fetchItems({ commit }) {
			commit('setItems', await new Promise(resolve => {
				setTimeout(() => {
					resolve([
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
				}, 1000);
			}));
		}*/
		fetchItems({ commit }) {
			return new Promise(resolve => {
				setTimeout(() => {
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
					resolve();
				}, 1000);
			});
		}
	}
});