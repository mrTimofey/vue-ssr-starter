const base = require('./base');
const webpack = require('webpack');
const fs = require('fs');
const path = require('path');

module.exports = Object.assign({}, base, {
	target: 'node',
	entry: './src/entry/server.js',
	output: Object.assign({}, base.output, {
		filename: 'server-bundle.js',
		libraryTarget: 'commonjs2'
	}),
	externals: Object.keys(require('../../package.json').dependencies).concat([
		// prevent static assets bundling for server rendering
		new RegExp(`^(${fs.readdirSync(path.resolve(process.cwd(), 'assets')).join('|')})`)
	]),
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
			'process.env.VUE_ENV': '"server"'
		})
	]
});