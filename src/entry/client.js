import createApp from './app';
import sprite from 'assets/sprite.svg';

// inject svg sprite
const div = document.createElement('div');
div.style.display = 'none';
div.innerHTML = sprite;
if (document.body.childNodes && document.body.childNodes.length) document.body.insertBefore(div, document.body.childNodes[0]);
else document.body.appendChild(div);

// fix route hash
window.__INITIAL_STATE__.route.hash = location.hash;

// create app
const app = createApp();

app.$router.beforeEach((from, to, next) => {
	if (app.$store.getters.serverError) app.$store.commit('clearServerError');
	next();
});

app.$store.replaceState(window.__INITIAL_STATE__);
delete window.__INITIAL_STATE__;
app.$mount(document.body.querySelector('[data-server-rendered]'));