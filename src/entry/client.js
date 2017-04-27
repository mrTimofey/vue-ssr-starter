import Vue from 'vue';
import createApp from './app';
import sprite from 'assets/sprite.svg';

// call prefetch on component creation
Vue.mixin({
	data: () => ({
		// let component know when prefetching is done
		prefetching: false
	}),
	created() {
		if (this.$root._isMounted && this.$options.prefetch) {
			let promise = this.$options.prefetch(this.$root.$store);
			if (!promise) return;
			this.prefetching = true;
			promise.then(
				() => { this.prefetching = false; },
				err => { this.$store.commit('fireServerError', err); }
			);
		}
	}
});

// inject svg sprite
const div = document.createElement('div');
div.style.display = 'none';
div.innerHTML = sprite;
if (document.body.childNodes && document.body.childNodes.length) document.body.insertBefore(div, document.body.childNodes[0]);
else document.body.appendChild(div);

// create app
const app = createApp();

app.$router.beforeEach((from, to, next) => {
	if (app.$store.getters.serverError) app.$store.commit('clearServerError');
	next();
});

app.$store.replaceState(window.__INITIAL_STATE__);
app.$mount(document.body.querySelector('[server-rendered]'));