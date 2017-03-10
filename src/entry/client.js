import app from './app';
app.$store.replaceState(window.__INITIAL_STATE__);
app.$mount(document.body.querySelector('[server-rendered]'));