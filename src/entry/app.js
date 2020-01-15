import Vue from 'vue';
import { filenameToCamelCase } from 'src/utils';

// IMPORTANT NOTE: imports order bellow matters if we want CSS related imports to be in desired order

// we should import app.vue first
// assuming common styles, resets, etc. are imported from app.vue itself and they should be loaded first
import app from 'src/app.vue';

// filters
const requireFilters = require.context('src/filters/', true, /\.(js|ts)$/);
for (const name of requireFilters.keys())
	Vue.filter(filenameToCamelCase(name), requireFilters(name).default);

// page components are adding styles next
import createRouter from 'src/router';
import createStore from 'src/store';

// we should return factory for SSR (runInNewContext: false)
export default context => {
	const store = createStore(context),
		router = createRouter(context);
	return new Vue({ store, router, ...app });
};
