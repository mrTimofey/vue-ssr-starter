const base = require('./base');
const webpack = require('webpack');
const fs = require('fs');
const path = require('path');

const config = Object.assign({}, base, {
	target: 'node',
	entry: './src/entry/server.js',
	output: Object.assign({}, base.output, {
		filename: 'server-bundle.js',
		libraryTarget: 'commonjs2'
	}),
	externals: Object.keys(require('../../package.json').dependencies),
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
			'process.env.VUE_ENV': '"server"'
		})
	]
});

// prevent url and file loaders file emitting for SSR
for (let rule of config.module.rules) {
	let loaders = /file-loader|url-loader/;
	if (loaders.test(rule.loader)) {
		rule.options.emitFile = false;
	}
}

module.exports = config;