const { options, env, createConfig } = require('./base'),
	{ DefinePlugin } = require('webpack'),
	HTMLPlugin = require('html-webpack-plugin'),
	MiniCssExtractPlugin = require('mini-css-extract-plugin');

const baseConfig = createConfig();

const clientConfig = Object.assign({}, baseConfig, {
	entry: './src/entry/client.js',
	plugins: (baseConfig.plugins || []).concat([
		new DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
			'process.env.VUE_ENV': '"client"',
			apiBaseURL: JSON.stringify(env.apiBaseURL && env.apiBaseURL.client || null)
		}),
		new HTMLPlugin({
			template: 'src/layout.pug'
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
});

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

function addStyleRules(extract = false) {
	for (let rule of [
		{
			test: /\.styl(us)?$/,
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
	]) {
		rule.use = [extract ? MiniCssExtractPlugin.loader : 'vue-style-loader', ...rule.use];
		clientConfig.module.rules.push(rule);
	}

	if (extract) clientConfig.plugins.push(
		new MiniCssExtractPlugin({ filename: '[name].css?[hash:6]' })
	);
}

if (process.env.NODE_ENV === 'production') {
	addStyleRules(true);
}
else {
	addStyleRules();
	clientConfig.devtool = '#sourcemap';
}

module.exports = clientConfig;