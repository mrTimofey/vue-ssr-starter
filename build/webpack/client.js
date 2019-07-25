const path = require('path'),
	{ staticFileLoaders, createConfig } = require('./base'),
	{ DefinePlugin } = require('webpack'),
	WebpackBarPlugin = require('webpackbar'),
	HTMLPlugin = require('html-webpack-plugin'),
	VueSSRClientPlugin = require('vue-server-renderer/client-plugin');

const baseConfig = createConfig();

const clientConfig = Object.assign({}, baseConfig, {
	entry: './src/entry/client.ts',
	plugins: (baseConfig.plugins || []).concat([
		new DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
			'process.env.VUE_ENV': '"client"',
		}),
		new WebpackBarPlugin({
			name: 'client',
			color: 'green',
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
		test: staticFileLoaders.images.test,
		exclude: /sprite\.svg$/,
		loaders: [
			{
				loader: 'url-loader',
				options: staticFileLoaders.images.options,
			},
			{
				loader: 'image-webpack-loader',
				options: {
					optipng: {
						// optipng is really slow so disable it on dev
						enabled: process.env.NODE_ENV === 'production',
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
			},
		],
	},
	{
		loader: 'file-loader',
		...staticFileLoaders.docs,
	},
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
			finalLoader || {
				loader: 'vue-style-loader',
				options: { sourceMap },
			},
			{
				loader: 'css-loader',
				options: { sourceMap },
			},
			...rule.use,
		];
		clientConfig.module.rules.push(rule);
	}
}

function addDevHelpers() {
	const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin'),
		WebpackNotifier = require('fork-ts-checker-notifier-webpack-plugin');
	clientConfig.plugins.push(
		new ForkTsCheckerWebpackPlugin({
			vue: true,
		}),
		new WebpackNotifier()
	);
}

if (process.env.NODE_ENV === 'production') {
	const MiniCssExtractPlugin = require('mini-css-extract-plugin'),
		OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin'),
		MinifyPlugin = require('terser-webpack-plugin');
	addStyleRules(MiniCssExtractPlugin.loader);
	clientConfig.plugins.push(
		new MiniCssExtractPlugin({ filename: '[name].css?[hash:6]' }),
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
	if (process.env.NODE_ENV === 'development') addDevHelpers();
	addStyleRules();
	clientConfig.devtool = 'inline-source-map';
	clientConfig.optimization.moduleIds = 'named';
}

module.exports = clientConfig;
