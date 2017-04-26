const path = require('path');
const qs = require('qs');

const stylusOptions = {
	import: [
		path.resolve(process.cwd(), 'node_modules/kouto-swiss/index.styl'),
		path.resolve(process.cwd(), 'src/shared.styl')
	]
};
const pugOptions = {
	doctype: 'html',
	basedir: path.resolve(process.cwd(), 'src')
};
const bubleOptions = {
	objectAssign: 'Object.assign',
	transforms: {
		dangerousForOf: true,
		modules: false
	}
};

exports.options = {
	buble: bubleOptions,
	stylus: stylusOptions,
	pug: pugOptions
};

exports.config = () => ({
	devtool: false,
	output: {
		path: path.resolve(process.cwd(), 'dist'),
		publicPath: '/dist/',
		filename: '[name].js?[chunkhash:6]'
	},
	module: {
		rules: [

			// source files

			{
				test: /\.vue$/,
				loader: 'vue-loader',
				options: {
					template: pugOptions,
					loaders: {
						stylus: 'vue-style-loader!css-loader?minimize&import=false!stylus-loader?' +
							qs.stringify(stylusOptions, { encode: false, arrayFormat: 'brackets' })
					},
					transformToRequire: {
						img: 'src',
						image: 'xlink:href',
						a: 'href'
					},
					buble: bubleOptions
				}
			},
			{
				test: /\.js$/,
				loader: 'buble-loader',
				exclude: /node_modules/,
				options: bubleOptions
			},
			{
				test: /\.pug$/,
				loader: 'pug-loader',
				options: pugOptions
			},

			// styles loading is different for server and client so let them define the loaders

			// assets

			{
				test: /\.(woff|woff2|eot|otf|ttf)$/,
				loader: 'file-loader',
				options: {
					name: 'fonts/[name].[ext]'
				}
			},
			{
				test: /sprite\.svg$/,
				loader: 'raw-loader'
			},
			{
				test: /\.(png|jpe?g|gif|svg)$/,
				exclude: /sprite\.svg$/,
				loader: 'url-loader',
				options: {
					limit: 256,
					name: 'i/[name].[ext]?[hash:6]'
				}
			},
			{
				test: /\.(pdf|docx?|pptx?|rtf|txt)$/,
				loader: 'file-loader',
				options: {
					name: 'docs/[name].[ext]?[hash:6]'
				}
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