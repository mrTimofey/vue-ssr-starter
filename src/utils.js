import http, { CancelToken } from 'src/http';

/**
 * Converts
 * @param {string} str string to process
 * @param {bool} [lowerFirst] lowercase first letter (uppercase by default)
 * @returns {string} processed string
 */
export function filenameToCamelCase(str, lowerFirst) {
	return str
		// remove extension
		.replace(/\.[a-z0-9]+$/i, '')
		// remove leading ./
		.replace(/^\.\//, '')
		// split by '-', '_', '/'
		.split(/[-_/]/)
		// remove empty pieces
		.filter(piece => piece.length)
		// capitalize each piece
		.map((el, i) => el.substr(0, 1)[(lowerFirst && i === 0) ? 'toLowerCase' : 'toUpperCase']() + el.substr(1))
		.join('');
}

/**
 * Require all modules from require.context, applies callback to each module or returns name => module mappings
 * if callback is omitted.
 * @param {Object} requireFile require.context call result
 * @param {Function} [cb]<{string} name, module> callback function, optional
 * @returns {Object|undefined} module name => module mapping or nothing if callback is omitted
 */
export function requireAll(requireFile, cb) {
	let modules;
	if (!cb) modules = {};
	for (let name of requireFile.keys()) {
		let module = requireFile(name);
		if (module.default) module = module.default;
		if (cb) cb(module, name);
		else modules[name] = module;
	}
	if (!cb) return modules;
}

/**
 * Returns a promise which will be resolved with provided async calls data. Useful with prefetch when you have to
 * fetch data from multiple sources and assign it to different keys within component data.
 * @param {Object} obj [key] => {promise, must be resoled with data that will be assigned to the key}
 * @returns {Promise} promise
 */
export function promiseMapAll(obj) {
	return Promise.all(Object.values(obj)).then(values => {
		const map = {},
			keys = Object.keys(obj);
		for (let i in keys) map[keys[i]] = values[i];
		return map;
	});
}

/**
 * Mix all resolved promise data objects into a single object.
 * @param {Array<Promise|Object>} ar promises or data array
 * @returns {Promise<Object>} mixed promise
 */
export function promiseMixAll(ar) {
	return Promise.all(ar).then(data => data.reduce((all, data) => Object.assign(all, data), {}));
}

export class ListDataFetcher {
	/**
	 * Create new instance.
	 * @param {string} url target API url
	 * @param {function({ route: Object, props: Object })} paramsCallback callback to make params object
	 */
	constructor(url, paramsCallback = null) {
		this.url = url;
		this.paramsCallback = paramsCallback;
	}

	/**
	 * Send new http request and cancel previous one if there is any
	 * @param {Object} route vue-router route object
	 * @param {Object} props route component props
	 * @param {Object|null} args optional additional arguments passed to paramsCallback
	 * @returns {Promise<{
	 * 		items: Array,
	 * 		pagination: { total: number, currentPage: number, latPage: number, perPage: number }
	 * 	}|null>} request promise, resolves with null if request is cancelled due to sending a new one
	 */
	fetch(route, props, args = null) {
		// cancel previous request
		this.cancel();
		return http.get(this.url, {
			/**
			 * Do some magical shit to make this request cancellable to prevent data overlap
			 * @see https://github.com/axios/axios#cancellation
			 */
			cancelToken: window && new CancelToken(c => { this._cancelLast = window && c; }),
			params: this.paramsCallback ? this.paramsCallback({ ...args, route, props }) : {}
		}).then(res => {
			this._cancelLast = null;
			// noinspection JSUnresolvedVariable, JSCheckFunctionSignatures
			return {
				items: res.data.items,
				pagination: {
					total: parseInt(res.data.pagination.total) || 0,
					currentPage: parseInt(res.data.pagination.current_page) || 0,
					lastPage: parseInt(res.data.pagination.last_page) || 0,
					perPage: parseInt(res.data.pagination.per_page) || 0
				}
			};
		}).catch(err => {
			if (!err.isCancelError) throw err;
		});
	}

	/**
	 * Cancel last request if there is any.
	 * @returns {void}
	 */
	cancel() {
		if (this._cancelLast) {
			this._cancelLast();
			this._cancelLast = null;
		}
	}
}