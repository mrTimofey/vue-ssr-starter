const path = require('path'),
	fs = require('fs'),
	createConfig = require('./base'),
	{ DefinePlugin } = require('webpack'),
	HtmlPlugin = require('html-webpack-plugin'),
	VueSsrClientPlugin = require('vue-server-renderer/client-plugin');

const baseConfig = createConfig('client');

const clientConfig = Object.assign({}, baseConfig, {
	entry: './src/entry/client.js',
	output: {
		...baseConfig.output,
		path: path.resolve(process.cwd(), 'dist/public'),
	},
	plugins: (baseConfig.plugins || []).concat([
		new DefinePlugin({
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'process.env.VUE_ENV': '"client"',
		}),
		new HtmlPlugin({
			template: 'src/layout.pug',
			// assets injection is controlled by vue-server-renderer with manifest in production
			inject: process.env.NODE_ENV !== 'production',
			// pug-loader outputs already minified html and html-webpack-plugin
			// minifier removes necessary <!--APP--> comment, so disable minification
			minify: false,
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

function addStyleRules(finalLoaders, sourceMap = false) {
	for (let rule of [
		{
			test: /\.styl(us)?$/,
			use: [
				{
					loader: 'stylus-loader',
					options: {
						stylusOptions: {
							import: [
								path.resolve(process.cwd(), 'node_modules/kouto-swiss/index.styl'),
								path.resolve(process.cwd(), 'src/shared.styl'),
							],
						},
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

if (process.env.NODE_ENV === 'development') {
	const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin'),
		WebpackNotifier = require('fork-ts-checker-notifier-webpack-plugin');
	clientConfig.plugins.push(
		new ForkTsCheckerWebpackPlugin({
			typescript: {
				diagnosticsOptions: {
					syntactic: true,
					semantic: true,
					declaration: true,
					global: true,
				},
				extensions: { vue: true },
			},
		}),
		new WebpackNotifier()
	);
}

if (process.env.NODE_ENV === 'production') {
	const MiniCssExtractPlugin = require('mini-css-extract-plugin'),
		OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin'),
		MinifyPlugin = require('terser-webpack-plugin');
	addStyleRules([
		{
			loader: MiniCssExtractPlugin.loader,
		},
	]);
	clientConfig.plugins.push(
		new MiniCssExtractPlugin({ filename: '[name].[contenthash:8].css' }),
		new VueSsrClientPlugin()
	);

	if (!clientConfig.optimization) clientConfig.optimization = {};
	clientConfig.optimization.minimizer = [
		new MinifyPlugin({
			cache: true,
			parallel: true,
		}),
		new OptimizeCssAssetsPlugin({
			assetNameRegExp: /\.css(\?.*)?$/,
		}),
		// move non-public files from public folder to the /dist root
		{
			apply(compiler) {
				compiler.hooks.done.tap('MoveFilesAfterBuild', () => {
					for (const file of ['index.html', 'vue-ssr-client-manifest.json']) {
						const dest = path.resolve(process.cwd(), 'dist', file);
						if (fs.existsSync(dest)) fs.unlinkSync(dest);
						fs.renameSync(path.resolve(clientConfig.output.path, file), dest);
					}
				});
			},
		},
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
