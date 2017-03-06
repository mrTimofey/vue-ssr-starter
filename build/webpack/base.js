const path = require('path');
const koutoSwiss = require('kouto-swiss');

const stylusQuery = 'compress&import[]=' + path.resolve(process.cwd(), 'node_modules/kouto-swiss/index.styl');
const pugQuery = 'doctype=html&basedir=' + path.resolve(process.cwd(), 'src');

module.exports = {
	devtool: false,
	output: {
		path: path.resolve(process.cwd(), 'dist'),
		publicPath: '/dist/',
		filename: '[name].[chunkhash].js'
	},
	module: {
		rules: [
			{
				test: /\.vue$/,
				loader: 'vue-loader',
				options: {
					loaders: {
						pug: 'vue-loader/lib/template-loader?raw&engine=pug&' + pugQuery,
						stylus: 'vue-style-loader!css-loader!stylus-loader?' + stylusQuery
					}
				}
			},
			{
				test: /\.js$/,
				loader: 'babel-loader'
			},
			{
				test: /\.styl$/,
				loader: 'css-loader!stylus-loader?' + stylusQuery
			},
			{
				test: /\.pug$/,
				loader: 'pug-loader?' + pugQuery
			}
		]
	},
	performance: {
		hints: process.env.NODE_ENV === 'production' ? 'warning' : false
	}
};