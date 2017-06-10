const { config, options } = require('./base');
const webpack = require('webpack');
const HTMLPlugin = require('html-webpack-plugin');
const ExtractText = require('extract-text-webpack-plugin');

const baseConfig = config();

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
		new webpack.optimize.CommonsChunkPlugin({
			names: ['vendor']
		}),
		new HTMLPlugin({
			template: 'src/layout.pug'
		})
	])
});

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

	let vueConfig = clientConfig.module.rules.find(el => el.loader === 'vue-loader');

	vueConfig.options.loaders.stylus = ExtractText.extract({
		use: vueConfig.options.loaders.stylus.replace('vue-style-loader!', ''),
		fallback: 'vue-style-loader'
	});

	clientConfig.module.rules.push(
		{
			test: /\.styl$/,
			use: ExtractText.extract({
				use: [
					{
						loader: 'css-loader',
						options: options.css
					},
					{
						loader: 'stylus-loader',
						options: options.stylus
					}
				],
				fallback: 'style-loader'
			})
		},
		{
			test: /\.css$/,
			use: ExtractText.extract({
				loader: 'css-loader?' + options.css,
				fallback: 'style-loader'
			})
		}
	);
}
else {
	clientConfig.devtool = '#sourcemap';
	clientConfig.module.rules.push(
		{
			test: /\.styl$/,
			use: [
				'style-loader',
				{
					loader: 'css-loader',
					options: options.css
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
				'style-loader',
				{
					loader: 'css-loader',
					options: options.css
				}
			]
		}
	);
}

module.exports = clientConfig;