const { options, env, createConfig } = require('./base'),
	{ DefinePlugin } = require('webpack'),
	WebpackBarPlugin = require('webpackbar'),
	VueSSRServerPlugin = require('vue-server-renderer/server-plugin');

const baseConfig = createConfig();

const serverConfig = {
	...baseConfig,
	target: 'node',
	entry: './src/entry/server.js',
	output: {
		...baseConfig.output,
		filename: 'server-bundle.js',
		libraryTarget: 'commonjs2'
	},
	externals: Object.keys(require('../../package.json').dependencies),
	plugins: (baseConfig.plugins || []).concat([
		new DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
			'process.env.VUE_ENV': '"server"',
			window: 'undefined',
			apiBaseURL: JSON.stringify(env.apiBaseURL && env.apiBaseURL.server || 'http://localhost:8000')
		}),
		new VueSSRServerPlugin(),
		new WebpackBarPlugin({
			name: 'server',
			color: 'yellow'
		})
	])
};

serverConfig.module.rules = (baseConfig.module.rules || []).concat([
	{
		test: options.fonts.test,
		loader: 'file-loader',
		options: {
			context: 'assets',
			emitFile: false,
			name: options.fonts.name
		}
	},
	{
		test: options.images.test,
		loader: 'url-loader',
		options: {
			context: 'assets',
			limit: options.images.limit,
			emitFile: false,
			name: options.images.name
		}
	},
	{
		test: options.docs.test,
		loader: 'file-loader',
		options: {
			context: 'assets',
			emitFile: false,
			name: options.docs.name
		}
	},
	{
		test: /\.(styl(us)?|css|less|sass|scss|sss)$/,
		loader: 'null-loader'
	}
]);

module.exports = serverConfig;