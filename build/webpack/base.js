const path = require('path');

const stylusQuery = 'compress&import[]=' + path.resolve(process.cwd(), 'node_modules/kouto-swiss/index.styl');
const pugQuery = 'doctype=html&basedir=' + path.resolve(process.cwd(), 'src');
const bubleOptions = {
	objectAssign: 'Object.assign',
	transforms: {
		dangerousForOf: true,
		modules: false
	}
};

module.exports = {
	devtool: false,
	output: {
		path: path.resolve(process.cwd(), 'dist'),
		publicPath: '/dist/',
		filename: '[name].[chunkhash:7].js'
	},
	module: {
		rules: [

			// source files

			{
				test: /\.vue$/,
				loader: 'vue-loader',
				options: {
					loaders: {
						pug: 'vue-loader/lib/template-loader?raw&engine=pug&' + pugQuery,
						stylus: 'vue-style-loader!css-loader?minimize&import=false!stylus-loader?' + stylusQuery
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
				test: /\.styl$/,
				loader: 'css-loader!stylus-loader?' + stylusQuery
			},
			{
				test: /\.css$/,
				loader: 'css-loader?minimize'
			},
			{
				test: /\.pug$/,
				loader: 'pug-loader?' + pugQuery
			},

			// assets

			{
				test: /\.(png|jpe?g|gif|svg)$/,
				loader: 'url-loader',
				options: {
					limit: 1000,
					name: 'i/[name].[ext]?[hash:5]'
				}
			},
			{
				test: /\.(woff|woff2)$/,
				loader: 'file-loader',
				options: {
					name: 'fonts/[name].[ext]'
				}
			},
			{
				test: /\.(doc|docx|ppt|pptx|pdf|txt|rtf)$/,
				loader: 'file-loader',
				options: {
					name: 'docs/[name].[ext]?[hash:5]'
				}
			}
		]
	},
	resolve: {
		modules: [
			'node_modules',
			path.resolve(process.cwd(), 'assets')
		]
	},
	performance: {
		hints: process.env.NODE_ENV === 'production' ? 'warning' : false
	}
};