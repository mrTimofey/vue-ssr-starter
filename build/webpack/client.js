const base = require('./base');
const webpack = require('webpack');
const HTMLPlugin = require('html-webpack-plugin');
const pug = require('pug');

module.exports = Object.assign({}, base, {
	devtool: '#sourcemap',
	entry: {
		app: './build/entry/client.js',
		vendor: [
			//'babel-polyfill',
			//'axios',
			'vue',
			//'vue-router',
			//'vuex',
			//'vuex-router-sync'
		]
	},
	plugins: (base.plugins || []).concat([
		new webpack.optimize.CommonsChunkPlugin({
			name: 'vendor'
		}),
		new HTMLPlugin({
			template: 'src/layout.pug'
		})
	])
});