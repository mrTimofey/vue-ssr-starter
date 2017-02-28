const path = require('path');
const koutoSwiss = require('kouto-swiss')();

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
					pug: {
						basedir: path.resolve(process.cwd(), 'src'),
						doctype: 'html'
					}
				}
			},
			{
				test: /\.js$/,
				loader: 'babel-loader'
			},
			{
				test: /\.styl$/,
				loader: 'stylus-loader'
			},
			{
				test: /\.pug$/,
				loader: 'pug-loader',
				options: {
					doctype: 'html'
				}
			}
		]
	},
	performance: {
		hints: process.env.NODE_ENV === 'production' ? 'warning' : false
	}
};