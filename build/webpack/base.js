const path = require('path'),
	{ VueLoaderPlugin } = require('vue-loader');

// shared loader options which will be slightly different on server/client
const staticFileLoaders = {
		fonts: {
			test: /\.(woff|woff2|eot|otf|ttf)$/,
			options: {
				context: 'assets',
				name: '[path][name].[ext]?[hash:6]',
			},
		},
		images: {
			test: /\.(png|jpe?g|gif|svg)$/,
			options: {
				context: 'assets',
				limit: 256,
				name: '[path][name].[ext]?[hash:6]',
			},
		},
		docs: {
			test: /\.(pdf|docx?|pptx?|rtf|txt)$/,
			options: {
				context: 'assets',
				name: '[path][name].[ext]?[hash:6]',
			},
		},
	},
	pugOptions = {
		doctype: 'html',
		basedir: process.cwd(),
	};

exports.staticFileLoaders = staticFileLoaders;

exports.createConfig = () => ({
	devtool: false,
	mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
	output: {
		path: path.resolve(process.cwd(), 'dist'),
		publicPath: '/dist/',
		filename: '[name].js?[chunkhash:6]',
		chunkFilename: '[name].js?[chunkhash:6]',
	},
	module: {
		rules: [

			// source files

			{
				test: /\.vue$/,
				loader: 'vue-loader',
			},
			{
				test: /\.js$/,
				loader: 'buble-loader',
				options: {
					objectAssign: true,
					transforms: {
						dangerousForOf: true,
						modules: false,
					},
				},
				// needed for vue-loader to correctly import modules' components
				exclude: file => /node_modules/.test(file) && !/\.vue\.js/.test(file),
			},
			{
				test: /\.ts$/,
				loader: 'ts-loader',
				options: {
					appendTsSuffixTo: [/\.vue$/],
					transpileOnly: process.env.NODE_ENV !== 'production',
				},
			},
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
});
