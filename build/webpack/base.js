const path = require('path');
const koutoSwiss = require('kouto-swiss');

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
						pug: 'vue-loader/lib/template-loader?raw&engine=pug&doctype=html&basedir=' + path.resolve(process.cwd(), 'src'),
						stylus: 'vue-style-loader!css-loader!stylus-loader?compress&import[]=' + path.resolve(process.cwd(), 'node_modules/kouto-swiss/index.styl')
					}
					// require("pug-loader!../node_modules/vue-loader/lib/selector?type=template&index=0!./app.vue")
					// require("../node_modules/vue-loader/lib/template-loader?raw&engine=pug!../node_modules/vue-loader/lib/selector?type=template&index=0!./app.vue")
				}
			},
			{
				test: /\.js$/,
				loader: 'babel-loader'
			},
			{
				test: /\.styl$/,
				loader: 'stylus-loader',
				options: {
					use: [koutoSwiss()]
				}
			},
			{
				test: /\.pug$/,
				loader: 'pug-loader',
				options: {
					doctype: 'html',
					basedir: path.resolve(process.cwd(), 'src')
				}
			}
		]
	},
	performance: {
		hints: process.env.NODE_ENV === 'production' ? 'warning' : false
	}
};