const { config } = require('./base');
const webpack = require('webpack');
const fs = require('fs');
const path = require('path');

const baseConfig = config();

const serverConfig = Object.assign({}, baseConfig, {
	target: 'node',
	entry: './src/entry/server.js',
	output: Object.assign({}, baseConfig.output, {
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

serverConfig.module.rules.push({
	test: /\.(styl|css)$/,
	use: 'null-loader'
});

module.exports = serverConfig;