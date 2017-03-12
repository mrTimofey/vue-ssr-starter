const base = require('./base');
const webpack = require('webpack');
const HTMLPlugin = require('html-webpack-plugin');
const ExtractText = require('extract-text-webpack-plugin');
const pug = require('pug');

const config = Object.assign({}, base, {
	entry: {
		shim: 'es6-shim',
		app: './src/entry/client.js',
		vendor: [
			'axios',
			'vue',
			'vue-router',
			'vue-meta',
			'vuex',
			'vuex-router-sync'
		]
	},
	plugins: (base.plugins || []).concat([
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
			'process.env.VUE_ENV': '"client"'
		}),
		new webpack.optimize.CommonsChunkPlugin({
			names: ['shim', 'vendor']
		}),
		new HTMLPlugin({
			template: 'src/layout.pug'
		})
	])
});

if (process.env.NODE_ENV === 'production') {
	let vueConfig = config.module.rules.find(el => el.loader === 'vue-loader');

	vueConfig.options.loaders.stylus = ExtractText.extract({
		use: vueConfig.options.loaders.stylus.replace('vue-style-loader!', ''),
		fallback: 'vue-style-loader'
	});

	config.plugins.push(
		new ExtractText('styles.css?[hash:6]'),
		new webpack.optimize.UglifyJsPlugin({
			comment: true,
			compress: {
				warnings: false
			}
		})
	);

	// prevent url and file loaders file emitting twice with server bundle
	for (let rule of config.module.rules) {
		let loaders = /file-loader|url-loader/;
		if (loaders.test(rule.loader)) {
			rule.options.emitFile = false;
		}
	}
}
else {
	config.devtool = '#sourcemap';
}

module.exports = config;