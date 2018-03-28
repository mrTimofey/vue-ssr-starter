const { options, createConfig } = require('./base'),
	webpack = require('webpack'),
	HTMLPlugin = require('html-webpack-plugin'),
	MiniCssExtractPlugin = require('mini-css-extract-plugin');

const baseConfig = createConfig();

const vueStyleLoaders = {
	css: `css-loader?${options.css}`,
	stylus: `css-loader?${options.cssAfterPreprocessor}!stylus-loader?${options.stylus}`
};

const clientConfig = Object.assign({}, baseConfig, {
	entry: './src/entry/client.js',
	plugins: (baseConfig.plugins || []).concat([
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
			'process.env.VUE_ENV': '"client"'
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
			name: options.docs.name
		}
	}
]);

const vueLoader = clientConfig.module.rules.find(({ loader }) => loader === 'vue-loader');

function addStyleRules(extract = false) {
	for (let rule of [
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
	]) {
		rule.use = [extract ? MiniCssExtractPlugin.loader : 'style-loader', ...rule.use];
		clientConfig.module.rules.push(rule);
	}

	for (let loader of Object.keys(vueStyleLoaders))
		vueLoader.options.loaders[loader] =
			(extract ? MiniCssExtractPlugin.loader : 'vue-style-loader') + '!' + vueStyleLoaders[loader];

	if (extract) clientConfig.plugins.push(
		new MiniCssExtractPlugin()
	);
}

if (process.env.NODE_ENV === 'production') {
	addStyleRules();
}
else {
	addStyleRules(true);
	clientConfig.devtool = '#sourcemap';
}

module.exports = clientConfig;