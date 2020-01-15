const path = require('path'),
	{ staticFileLoaders, createConfig } = require('./base'),
	{ DefinePlugin } = require('webpack'),
	HTMLPlugin = require('html-webpack-plugin'),
	VueSSRClientPlugin = require('vue-server-renderer/client-plugin');

const baseConfig = createConfig('client');

const clientConfig = Object.assign({}, baseConfig, {
	entry: './src/entry/client.js',
	output: {
		...baseConfig.output,
		path: path.resolve(process.cwd(), 'dist/public'),
	},
	plugins: (baseConfig.plugins || []).concat([
		new DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
			'process.env.VUE_ENV': '"client"',
		}),
		new HTMLPlugin({
			template: 'src/layout.pug',
			// assets injection is controlled by vue-server-renderer with manifest in production
			inject: process.env.NODE_ENV !== 'production',
		}),
	]),
	optimization: {
		runtimeChunk: {
			name: 'rtm',
		},
		splitChunks: {
			chunks: 'all',
		},
	},
});

const imageLoader = {
	test: staticFileLoaders.images.test,
	exclude: /sprite\.svg$/,
	use: [
		{
			loader: 'url-loader',
			options: staticFileLoaders.images.options,
		},
		// image-webpack-loader is used here for non-development NODE_ENV
	],
};

clientConfig.module.rules = (baseConfig.module.rules || []).concat([
	{
		test: /sprite\.svg$/,
		loader: 'raw-loader',
	},
	{
		loader: 'file-loader',
		...staticFileLoaders.fonts,
	},
	{
		loader: 'file-loader',
		...staticFileLoaders.docs,
	},
	imageLoader,
]);

function addStyleRules(finalLoaders, sourceMap = false) {
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
						sourceMap,
					},
				},
			],
		},
		{
			test: /\.css$/,
			use: [],
		},
	]) {
		rule.use = [
			...finalLoaders,
			{
				loader: 'css-loader',
				options: { sourceMap },
			},
			...rule.use,
		];
		clientConfig.module.rules.push(rule);
	}
}

if (process.env.NODE_ENV === 'production') {
	const MiniCssExtractPlugin = require('mini-css-extract-plugin'),
		OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin'),
		MinifyPlugin = require('terser-webpack-plugin');
	addStyleRules([MiniCssExtractPlugin.loader]);
	imageLoader.use.push({
		loader: 'image-webpack-loader',
		options: {
			optipng: {
				optimizationLevel: 7,
			},
			gifsicle: {
				interlaced: false,
			},
			mozjpeg: {
				quality: 85,
				progressive: true,
			},
		},
	});
	clientConfig.plugins.push(
		new MiniCssExtractPlugin({ filename: '[name].[contenthash:8].css' }),
		new VueSSRClientPlugin(),
	);
	if (!clientConfig.optimization) clientConfig.optimization = {};
	clientConfig.optimization.minimizer = [
		new MinifyPlugin({
			cache: true,
			parallel: true,
		}),
		new OptimizeCSSAssetsPlugin({
			assetNameRegExp: /\.css(\?.*)?$/,
		}),
	];
	clientConfig.optimization.moduleIds = 'hashed';
}
else {
	const WebpackBarPlugin = require('webpackbar');

	addStyleRules([
		{
			loader: 'vue-style-loader',
			options: { sourceMap: true },
		},
	], true);
	clientConfig.optimization.moduleIds = 'named';
	clientConfig.plugins.push(
		new WebpackBarPlugin({
			name: 'client',
			color: 'green',
			reporters: ['fancy'],
		}),
	);
}

module.exports = clientConfig;
