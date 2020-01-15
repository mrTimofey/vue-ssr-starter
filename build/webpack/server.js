const path = require('path'),
	{ staticFileLoaders, createConfig } = require('./base'),
	{ DefinePlugin } = require('webpack'),
	VueSSRServerPlugin = require('vue-server-renderer/server-plugin');

const baseConfig = createConfig('server');

const serverConfig = Object.assign({}, baseConfig, {
	target: 'node',
	entry: './src/entry/server.js',
	output: {
		...baseConfig.output,
		libraryTarget: 'commonjs2',
		filename: 'server-bundle.js',
		path: path.resolve(process.cwd(), 'dist/server'),
	},
	externals: Object.keys(require('../../package.json').dependencies),
	plugins: (baseConfig.plugins || []).concat([
		new DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
			'process.env.VUE_ENV': '"server"',
			window: 'undefined',
		}),
		new VueSSRServerPlugin(),
	]),
});

serverConfig.module.rules = (baseConfig.module.rules || []).concat([
	{
		test: staticFileLoaders.fonts.test,
		loader: 'file-loader',
		options: {
			...staticFileLoaders.fonts.options,
			emitFile: false,
		},
	},
	{
		test: staticFileLoaders.images.test,
		loader: 'url-loader',
		options: {
			...staticFileLoaders.images.options,
			emitFile: false,
		},
	},
	{
		test: staticFileLoaders.docs.test,
		loader: 'file-loader',
		options: {
			...staticFileLoaders.docs.options,
			emitFile: false,
		},
	},
	{
		test: /\.(styl(us)?|css|less|sass|scss|sss)$/,
		loader: 'null-loader',
	},
]);

if (process.env.NODE_ENV !== 'production') {
	const WebpackBarPlugin = require('webpackbar');

	serverConfig.plugins.push(
		new WebpackBarPlugin({
			name: 'server',
			color: 'yellow',
			reporters: ['fancy'],
		})
	);
}

module.exports = serverConfig;
