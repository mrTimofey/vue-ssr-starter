const fs = require('fs'),
	path = require('path'),
	{ VueLoaderPlugin } = require('vue-loader');

// environment parameters
const envFile = path.resolve(process.cwd(), '.env.js'),
	env = fs.existsSync(envFile) ? require(envFile) : {};

// shared options to use in multiple loaders (vue-loader and others in general)
const options = {
	buble: {
		objectAssign: true,
		transforms: {
			dangerousForOf: true,
			modules: false
		}
	},
	pug: {
		doctype: 'html',
		basedir: process.cwd()
	},
	fonts: {
		test: /\.(woff|woff2|eot|otf|ttf)$/,
		name: '[path][name].[ext]?[hash:6]'
	},
	images: {
		test: /\.(png|jpe?g|gif|svg)$/,
		limit: 256,
		name: '[path][name].[ext]?[hash:6]'
	},
	docs: {
		test: /\.(pdf|docx?|pptx?|rtf|txt)$/,
		name: '[path][name].[ext]?[hash:6]'
	}
};

exports.options = options;

exports.env = env;

exports.createConfig = () => ({
	devtool: false,
	mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
	output: {
		path: path.resolve(process.cwd(), 'dist'),
		publicPath: '/dist/',
		filename: '[name].js?[chunkhash:6]',
		chunkFilename: '[name].js?[chunkhash:6]'
	},
	module: {
		rules: [

			// source files

			{
				test: /\.vue$/,
				loader: 'vue-loader'
			},
			{
				test: /\.js$/,
				loader: 'buble-loader',
				// needed for vue-loader to correctly import modules' components
				exclude: file => /node_modules/.test(file) && !/\.vue\.js/.test(file),
				options: options.buble
			},
			{
				test: /\.pug$/,
				oneOf: [
					// this applies to <template lang="pug"> in Vue components
					{
						resourceQuery: /^\?vue/,
						loader: 'pug-plain-loader',
						options: options.pug
					},
					// this applies to pug imports inside JavaScript
					{
						use: ['raw-loader', {
							loader: 'pug-plain-loader',
							options: options.pug
						}]
					}
				]
			}
		]
	},
	resolve: {
		modules: [
			'node_modules',
			process.cwd()
		]
	},
	performance: {
		hints: process.env.NODE_ENV === 'production' ? 'warning' : false
	},
	plugins: [
		new VueLoaderPlugin()
	]
});