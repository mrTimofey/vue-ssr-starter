import Meta from 'vue-meta';

// setup cue plugins
export function setupPlugins(Vue) {
	Vue.use(Meta, {
		keyName: 'head',
		attribute: 'data-meta',
		ssrAttribute: 'data-meta-ssr',
		tagIDKeyName: 'vmid'
	});
}

// fill root component with additional parameters
export const component = {};