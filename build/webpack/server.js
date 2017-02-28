const base = require('./base');

module.exports = Object.assign({}, base, {
	target: 'node',
	entry: './build/entry/server.js',
	output: Object.assign({}, base.output, {
		filename: 'server-bundle.js',
		libraryTarget: 'commonjs2'
	}),
	externals: Object.keys(require('../../package.json').dependencies)
});