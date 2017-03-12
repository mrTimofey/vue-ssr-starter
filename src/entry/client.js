import Vue from 'vue';
import sprite from 'assets/sprite.svg';

// call prefetch on component creation
Vue.mixin({
	data: () => ({
		// let component know when prefetching is done
		prefetching: false
	}),
	created() {
		if (this.$root._isMounted && this.$options.prefetch) {
			this.prefetching = true;
			this.$options.prefetch(this.$root.$store).then(
				() => { this.prefetching = false; },
				err => { this.$store.commit('fireServerError', err); }
			);
		}
	}
});

let div = document.createElement('div');
div.style.display = 'none';
div.innerHTML = sprite;
if (document.body.childNodes && document.body.childNodes.length) document.body.insertBefore(div, document.body.childNodes[0]);
else document.body.appendChild(div);

import app from './app';
app.$store.replaceState(window.__INITIAL_STATE__);
app.$mount(document.body.querySelector('[server-rendered]'));

app.$router.beforeEach((from, to, next) => {
	if (app.$store.getters.serverError) app.$store.commit('clearServerError');
	next();
});