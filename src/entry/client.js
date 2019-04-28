import createApp from './app';
import sprite from 'assets/sprite.svg';

// inject svg sprite
const div = document.createElement('div');
div.style.display = 'none';
div.innerHTML = sprite;
if (document.body.childNodes && document.body.childNodes.length) document.body.insertBefore(div, document.body.childNodes[0]);
else document.body.appendChild(div);

// create app
const app = createApp(window.location);

app.$router.beforeEach((from, to, next) => {
	// clear server error before next route activating
	if (app.$store.getters.serverError) app.$store.commit('clearServerError');
	next();
});

if (window.__STORE_STATE__) {
	app.$store.replaceState(window.__STORE_STATE__);
	delete window.__STORE_STATE__;
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
