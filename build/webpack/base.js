const path = require('path'),
	{ VueLoaderPlugin } = require('vue-loader');

// shared loader options which will be slightly different on server/client
const staticFileLoaders = {
		fonts: {
			test: /\.(woff|woff2|eot|otf|ttf)$/,
			options: {
				esModule: false,
				context: 'src/assets',
				name: '[path][name].[ext]?[hash:6]',
			},
		},
		images: {
			test: /\.(png|jpe?g|gif|svg)$/,
			options: {
				esModule: false,
				context: 'src/assets',
				limit: 256,
				name: '[path][name].[ext]?[hash:6]',
			},
		},
		docs: {
			test: /\.(pdf|docx?|pptx?|rtf|txt)$/,
			options: {
				esModule: false,
				context: 'src/assets',
				name: '[path][name].[ext]?[hash:6]',
			},
		},
	},
	pugOptions = {
		doctype: 'html',
		basedir: process.cwd(),
	};

exports.staticFileLoaders = staticFileLoaders;

exports.createConfig = (runtimeEnv) => {
	const vueLoader = {
		test: /\.vue$/,
		loader: 'vue-loader',
		options: {},
	};

	const config = {
		devtool: false,
		mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
		output: {
			publicPath: '/dist/',
			filename: '[name].[chunkhash:8].js',
			chunkFilename: '[name].[chunkhash:8].js',
		},
		module: {
			rules: [

				// source files

				{
					test: /\.js$/,
					loader: 'babel-loader',
					// needed for vue-loader to correctly import modules' components
					exclude: file => /node_modules/.test(file) && !/\.vue\.js/.test(file),
				},
				vueLoader,
				{
					test: /\.pug$/,
					oneOf: [
						// this applies to <template lang="pug"> in Vue components
						{
							resourceQuery: /^\?vue/,
							loader: 'pug-plain-loader',
							options: pugOptions,
						},
						// this applies to pug imports inside JavaScript
						{
							use: ['raw-loader', {
								loader: 'pug-plain-loader',
								options: pugOptions,
							}],
						},
					],
				},
			],
		},
		resolve: {
			extensions: ['.js', '.vue', '.json'],
			modules: [
				'node_modules',
				process.cwd(),
			],
		},
		performance: {
			hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
		},
		plugins: [
			new VueLoaderPlugin(),
		],
		stats: {
			all: false,
			colors: true,
			errors: true,
			hash: true,
			timings: true,
			version: true,
		},
	};

	if (process.env.NODE_ENV === 'development') {
		vueLoader.options.cacheDirectory = path.resolve(process.cwd(), 'node_modules/.cache/vue-loader-cache');
		vueLoader.options.cacheIdentifier = runtimeEnv;
	}

	return config;
};
