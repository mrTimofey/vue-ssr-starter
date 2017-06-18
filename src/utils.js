/**
 * Converts
 * @param {string} str string to process
 * @param {bool} lowerFirst lowercase first letter (uppercase by default)
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
 * @param {Function} cb<{string} name, module> callback function, optional
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
	return new Promise((resolve, reject) => {
		Promise.all(Object.values(obj)).then(values => {
			const map = {},
				keys = Object.keys(obj);
			for (let i in keys) map[keys[i]] = values[i];
			resolve(map);
		}).catch(reject);
	});
}