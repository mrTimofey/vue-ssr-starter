import Vue from 'vue';
import createApp from './app';
import { filenameToCamelCase } from 'src/utils';
import http from 'src/http';
import sprite from 'src/assets/sprite.svg';

// directives
const requireDirectives = require.context('src/directives/', true, /\.(js|ts)$/);
for (const name of requireDirectives.keys())
	Vue.directive(filenameToCamelCase(name), requireDirectives(name).default);

// inject svg sprite
const div = document.createElement('div');
div.style.display = 'none';
div.innerHTML = sprite;
if (document.body.childNodes && document.body.childNodes.length) document.body.insertBefore(div, document.body.childNodes[0]);
else document.body.appendChild(div);

if (window.__APP__ && window.__APP__.cfg) http.defaults.baseURL = window.__APP__.cfg.apiBaseUrl;

// create app
const app = createApp(window.location);

app.$router.beforeEach((from, to, next) => {
	// clear server error before next route activating
	if (app.$store.getters.serverError) app.$store.commit('clearError');
	next();
});

if (window.__APP__) {
	if (window.__APP__.state) app.$store.replaceState(window.__APP__.state);
	if (window.__APP__.cmp && window.__APP__.cmp.length) {
		app.$router.onReady(() => {
			const comps = app.$router.getMatchedComponents();
			for (let i in comps)
				if (window.__APP__.cmp[i]) comps[i].prefetchedData = window.__APP__.cmp[i];
		});
	}
	delete window.__APP__;
}

const rootEl = document.body.querySelector('[data-server-rendered]');
if (process.env.NODE_ENV === 'production') {
	app.$mount(rootEl);
}
else {
	if (rootEl) app.$mount(rootEl);
	else {
		const errorText = 'Couldn\'t mount root Vue element to `document.body.querySelector(\'[data-server-rendered]\')`';
		// eslint-disable-next-line no-console
		console.error(errorText);
		document.body.innerHTML = `<div style="font-size:30px;color:red;text-align:center;margin:30px">${errorText}</div>`;
	}
}
