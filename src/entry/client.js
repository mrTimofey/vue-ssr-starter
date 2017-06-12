import createApp from './app';
import sprite from 'assets/sprite.svg';

// inject svg sprite
const div = document.createElement('div');
div.style.display = 'none';
div.innerHTML = sprite;
if (document.body.childNodes && document.body.childNodes.length) document.body.insertBefore(div, document.body.childNodes[0]);
else document.body.appendChild(div);

// fix route hash
if (window.__INITIAL_VUEX_STATE__) window.__INITIAL_VUEX_STATE__.route.hash = location.hash;

// create app
const app = createApp();

app.$router.beforeEach((from, to, next) => {
	// clear server error before next route activating
	if (app.$store.getters.serverError) app.$store.commit('clearServerError');
	next();
});

if (window.__INITIAL_VUEX_STATE__) {
	app.$store.replaceState(window.__INITIAL_VUEX_STATE__);
	delete window.__INITIAL_VUEX_STATE__;
}

if (window.__INITIAL_COMP_STATE__) {
	app.$router.onReady(() => {
		const comps = app.$router.getMatchedComponents().filter(comp => typeof comp.prefetch === 'function');
		for (let i in comps)
			if (window.__INITIAL_COMP_STATE__[i]) comps[i].prefetchedData = window.__INITIAL_COMP_STATE__[i];
		delete window.__INITIAL_COMP_STATE__;
	});
}

app.$mount(document.body.querySelector('[data-server-rendered]'));