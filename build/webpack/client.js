const { createConfig, options } = require('./base');
const webpack = require('webpack');
const HTMLPlugin = require('html-webpack-plugin');
const ExtractText = require('extract-text-webpack-plugin');

const baseConfig = createConfig();

const styleLoaders = [
	{
		test: /\.styl$/,
		use: [
			{
				loader: 'css-loader',
				options: options.cssAfterPreprocessor
			},
			{
				loader: 'stylus-loader',
				options: options.stylus
			}
		]
	},
	{
		test: /\.css$/,
		use: [
			{
				loader: 'css-loader',
				options: options.css
			}
		]
	}
];

const vueStyleLoaders = {
	css: `css-loader?${options.css}`,
	stylus: `css-loader?${options.cssAfterPreprocessor}!stylus-loader?${options.stylus}`
};

const clientConfig = Object.assign({}, baseConfig, {
	entry: {
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
	plugins: (baseConfig.plugins || []).concat([
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
			'process.env.VUE_ENV': '"client"'
		}),
		new HTMLPlugin({
			template: 'src/layout.pug'
		}),
		new webpack.optimize.CommonsChunkPlugin({
			name: 'vendor',
			minChunks: Infinity
		}),
		new webpack.optimize.CommonsChunkPlugin({
			name: 'runtime'
		})
	])
});

const vueLoader = clientConfig.module.rules.find(({ loader }) => loader === 'vue-loader');

if (process.env.NODE_ENV === 'production') {
	clientConfig.plugins.push(
		new ExtractText('styles.css?[hash:6]'),
		new webpack.optimize.UglifyJsPlugin({
			comment: true,
			compress: {
				warnings: false
			}
		})
	);

	for (let loader of Object.keys(vueStyleLoaders)) {
		vueLoader.options.loaders[loader] = ExtractText.extract({
			use: vueStyleLoaders[loader],
			fallback: 'vue-style-loader'
		});
	}

	clientConfig.module.rules.push(...styleLoaders.map(
		loader => Object.assign({}, loader, {
			use: ExtractText.extract({
				use: loader.use,
				fallback: 'style-loader'
			})
		})
	));
}
else {
	clientConfig.devtool = '#sourcemap';

	for (let loader of Object.keys(vueStyleLoaders)) {
		vueLoader.options.loaders[loader] = 'vue-style-loader!' + vueStyleLoaders[loader];
	}

	clientConfig.module.rules.push(...styleLoaders.map(
		loader => Object.assign({}, loader, {
			use: ['style-loader', ...loader.use]
		})
	));
}

module.exports = clientConfig;