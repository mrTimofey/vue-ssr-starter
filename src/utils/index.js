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
