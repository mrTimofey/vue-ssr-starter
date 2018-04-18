const fs = require('fs'),
	path = require('path'),
	qs = require('qs');

// environment parameters
const envFile = path.resolve(process.cwd(), '.env.js'),
	env = fs.existsSync(envFile) ? require(envFile) : {};

// allows options to represent both object and query string
class Options {
	constructor(options) {
		for (let k of Object.keys(options)) this[k] = options[k];
	}
	toString() {
		return qs.stringify(this, { encode: false, arrayFormat: 'brackets' }).replace(/=true/g, '');
	}
}

// shared options to use in multiple loaders (vue-loader and others in general)
const options = {
	buble: new Options({
		objectAssign: 'Object.assign',
		transforms: {
			dangerousForOf: true,
			modules: false
		}
	}),
	pug: new Options({
		doctype: 'html',
		basedir: process.cwd()
	}),
	cssAfterPreprocessor: new Options({
		minimize: true,
		import: false
	}),
	css: new Options({
		minimize: true
	}),
	stylus: new Options({
		import: [
			path.resolve(process.cwd(), 'node_modules/kouto-swiss/index.styl'),
			path.resolve(process.cwd(), 'src/shared.styl')
		]
	}),
	fonts: {
		test: /\.(woff|woff2|eot|otf|ttf)$/,
		name: 'fonts/[name].[ext]?[hash:6]'
	},
	images: {
		test: /\.(png|jpe?g|gif|svg)$/,
		limit: 256,
		name: 'i/[name].[ext]?[hash:6]'
	},
	docs: {
		test: /\.(pdf|docx?|pptx?|rtf|txt)$/,
		name: 'docs/[name].[ext]?[hash:6]'
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
				loader: 'vue-loader',
				options: {
					template: options.pug,
					loaders: {
						stylus: `css-loader?${options.css}!stylus-loader?${options.stylus}`,
						js: [
							{
								loader: 'buble-loader',
								options: options.buble
							}
						]
					}
				}
			},
			{
				test: /\.js$/,
				loader: 'buble-loader',
				exclude: /node_modules/,
				options: options.buble
			},
			{
				test: /\.pug$/,
				loader: 'pug-loader',
				options: options.pug
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
	}
});