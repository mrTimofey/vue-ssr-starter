export function filenameToCamelCase(str, lowerFirst = false) {
	return str
	// remove extension
	.replace(/\.[a-z0-9]+$/i, '')
	// remove leading ./
	.replace(/^\.\//, '')
	// to CamelCase
	.split('/').join('-').split('_').join('-').split('-')
	.map((el, i) => el.substr(0, 1)[(lowerFirst && i === 0) ? 'toLowerCase' : 'toUpperCase']() + el.substr(1))
	.join('');
}