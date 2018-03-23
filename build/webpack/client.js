const { options, createConfig } = require('./base'),
	webpack = require('webpack'),
	HTMLPlugin = require('html-webpack-plugin'),
	ExtractText = require('extract-text-webpack-plugin');

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

if (process.env.NODE_ENV === 'production') {
	clientConfig.plugins.push(
		new ExtractText('styles.css?[hash:6]')
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