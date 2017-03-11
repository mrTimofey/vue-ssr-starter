const path = require('path');

const stylusQuery = 'compress&import[]=' + path.resolve(process.cwd(), 'node_modules/kouto-swiss/index.styl');
const pugQuery = 'doctype=html&basedir=' + path.resolve(process.cwd(), 'src');

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
						stylus: 'vue-style-loader!css-loader?minimize&import=false!stylus-loader?' + stylusQuery,
						js: 'buble-loader?objectAssign=Object.assign&transforms[dangerousForOf]=true&transforms[modules]=false'
					}
				}
			},
			{
				test: /\.js$/,
				loader: 'buble-loader',
				exclude: /node_modules/,
				options: {
					objectAssign: 'Object.assign',
					transforms: {
						dangerousForOf: true,
						modules: false
					}
				}
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
				test: /\.(png|jpg|gif|svg)$/,
				loader: 'url-loader',
				options: {
					limit: 1000,
					name: 'i/[name].[ext]?[hash:5]'
				}
			},
			{
				test: /\.(woff|woff2)$/,
				loader: 'url-loader',
				options: {
					limit: 100000,
					name: 'fonts/[name].[ext]'
				}
			},
			{
				test: /\.(doc|docx|ppt|pptx|pdf|txt|rtf)$/,
				loader: 'file-loader',
				options: {
					name: 'docs/[name].[hash:5].[ext]'
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