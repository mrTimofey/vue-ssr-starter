const { options, env, createConfig } = require('./base'),
	{ DefinePlugin } = require('webpack');

const baseConfig = createConfig();

const serverConfig = Object.assign({}, baseConfig, {
	target: 'node',
	entry: './src/entry/server.js',
	output: Object.assign({}, baseConfig.output, {
		filename: 'server-bundle.js',
		libraryTarget: 'commonjs2'
	}),
	externals: Object.keys(require('../../package.json').dependencies),
	plugins: (baseConfig.plugins || []).concat([
		new DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
			'process.env.VUE_ENV': '"server"',
			window: 'undefined',
			apiBaseURL: JSON.stringify(env.apiBaseURL && env.apiBaseURL.server || 'http://localhost:8000')
		})
	])
});

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