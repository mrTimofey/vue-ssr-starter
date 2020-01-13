const path = require('path'),
	{ options, env, createConfig } = require('./base'),
	{ DefinePlugin } = require('webpack'),
	WebpackBarPlugin = require('webpackbar'),
	HTMLPlugin = require('html-webpack-plugin'),
	VueSSRClientPlugin = require('vue-server-renderer/client-plugin');

const baseConfig = createConfig();

const clientConfig = {
	...baseConfig,
	entry: './src/entry/client.js',
	plugins: (baseConfig.plugins || []).concat([
		new DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
			'process.env.VUE_ENV': '"client"',
			apiBaseURL: JSON.stringify(env.apiBaseURL && env.apiBaseURL.client || null)
		}),
		new VueSSRClientPlugin(),
		new HTMLPlugin({
			template: 'src/layout.pug',
			// assets injection is controlled by vue-server-renderer with manifest in production
			inject: process.env.NODE_ENV !== 'production'
		}),
		new WebpackBarPlugin({
			name: 'client',
			color: 'green'
		})
	]),
	optimization: {
		runtimeChunk: {
			name: 'rtm'
		},
		splitChunks: {
			chunks: 'all'
		}
	}
};

clientConfig.module.rules = (baseConfig.module.rules || []).concat([
	{
		test: /sprite\.svg$/,
		loader: 'raw-loader'
	},
	{
		test: options.fonts.test,
		loader: 'file-loader',
		options: {
			context: 'assets',
			name: options.fonts.name
		}
	},
	{
		test: options.images.test,
		exclude: /sprite\.svg$/,
		loaders: [
			{
				loader: 'url-loader',
				options: {
					context: 'assets',
					limit: options.images.limit,
					name: options.images.name
				}
			},
			{
				loader: 'image-webpack-loader',
				options: {
					optipng: {
						optimizationLevel: 7
					},
					gifsicle: {
						interlaced: false
					},
					mozjpeg: {
						quality: 85,
						progressive: true
					}
				}
			}
		]
	},
	{
		test: options.docs.test,
		loader: 'file-loader',
		options: {
			context: 'assets',
			name: options.docs.name
		}
	}
]);

function addStyleRules(finalLoader) {
	const sourceMap = process.env.NODE_ENV !== 'production';
	for (let rule of [
		{
			test: /\.styl(us)?$/,
			use: [
				{
					loader: 'stylus-loader',
					options: {
						import: [
							path.resolve(process.cwd(), 'node_modules/kouto-swiss/index.styl'),
							path.resolve(process.cwd(), 'src/shared.styl'),
						],
						sourceMap
					},
				},
			],
		},
		{
			test: /\.css$/,
			use: []
		},
	]) {
		rule.use = [
			finalLoader || {
				loader: 'vue-style-loader',
				options: { sourceMap }
			},
			{
				loader: 'css-loader',
				options: { sourceMap }
			},
			...rule.use
		];
		clientConfig.module.rules.push(rule);
	}
}

if (process.env.NODE_ENV === 'production') {
	const MiniCssExtractPlugin = require('mini-css-extract-plugin'),
		OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin'),
		MinifyPlugin = require('terser-webpack-plugin');
	addStyleRules(MiniCssExtractPlugin.loader);
	clientConfig.plugins.push(
		new MiniCssExtractPlugin({ filename: '[name].css?[hash:6]' })
	);
	if (!clientConfig.optimization) clientConfig.optimization = {};
	clientConfig.optimization.minimizer = [
		new MinifyPlugin({
			cache: true,
			parallel: true
		}),
		new OptimizeCSSAssetsPlugin({
			assetNameRegExp: /\.css(\?.*)?$/
		})
	];
}
else {
	addStyleRules();
	clientConfig.devtool = '#sourcemap';
}

module.exports = clientConfig;