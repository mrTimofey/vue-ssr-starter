const path = require('path'),
	{ VueLoaderPlugin } = require('vue-loader');

const pugOptions = {
		doctype: 'html',
		basedir: process.cwd(),
	},
	cacheDirectory = path.resolve(process.cwd(), 'node_modules/.cache'),
	cpuCount = require('os').cpus().length,
	svgSpriteRegex = /assets[\\/]sprite\.svg$/;

module.exports = runtimeEnv => {
	const tsLoader = {
			test: /\.ts$/,
			use: [
				// thread-loader, cache-loader used for development
				{
					loader: 'ts-loader',
					options: {
						appendTsSuffixTo: [/\.vue$/],
						// omit typescript checks to decrease build time
						transpileOnly: true,
					},
				},
			],
		},
		vueLoader = {
			test: /\.vue$/,
			loader: 'vue-loader',
			options: {},
		},
		imageLoader = {
			test: /\.(png|jpe?g|gif|svg)$/,
			exclude: svgSpriteRegex,
			use: [
				{
					loader: 'url-loader',
					options: {
						limit: 256,
						name: 'images/[name].[contenthash:6].[ext]',
					},
				},
				{
					loader: 'image-webpack-loader',
					options: {
						disable: process.env.NODE_ENV !== 'production',
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
				},
			],
		},
		// assets loaders use shared cache on production build to share client and server output
		assetLoaders = [
			imageLoader,
			{
				test: /\.(woff|woff2|eot|otf|ttf)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: 'fonts/[name].[contenthash:6].[ext]',
						},
					},
				],
			},
			{
				test: /\.(pdf|docx?|pptx?|rtf|txt)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: 'docs/[name].[contenthash:6].[ext]',
						},
					},
				],
			},
		];

	const config = {
		devtool: false,
		mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
		output: {
			publicPath: (process.env.BUILD_ASSETS_PATH || '/dist').replace(/\/$/, '') + '/',
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
				tsLoader,
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

				// assets (should be defined in base config to maintain consistent file names with hash in all environments)

				...assetLoaders,
				{
					test: svgSpriteRegex,
					loader: 'raw-loader',
				},
			],
		},
		resolve: {
			extensions: ['.js', '.ts', '.vue', '.json'],
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
		tsLoader.use[0].options.happyPackMode = true;
		tsLoader.use.unshift(
			{
				loader: 'cache-loader',
				options: {
					cacheDirectory,
					cacheIdentifier: 'ts:' + runtimeEnv,
				},
			},
			{
				loader: 'thread-loader',
				options: {
					// there should be 1 cpu for the fork-ts-checker-webpack-plugin
					workers: Math.max(cpuCount - 1, 1),
				},
			},
		);

		vueLoader.options.cacheDirectory = cacheDirectory;
		vueLoader.options.cacheIdentifier = 'vue:' + runtimeEnv;
	}

	if (process.env.NODE_ENV === 'production') {
		// use cache to generate new files only on first build, reuse output on next
		const cacheLoader = {
			loader: 'cache-loader',
			options: {
				cacheDirectory: cacheDirectory + '/production-assets',
			},
		};
		for (const loader of assetLoaders)
			loader.use.unshift(cacheLoader);
	}

	return config;
};
