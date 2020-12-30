const path = require('path'),
	createConfig = require('./base'),
	{ DefinePlugin } = require('webpack'),
	VueSsrServerPlugin = require('vue-server-renderer/server-plugin');

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
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'process.env.VUE_ENV': '"server"',
			window: 'undefined',
		}),
		new VueSsrServerPlugin(),
	]),
});

serverConfig.module.rules.push({
	test: /\.(styl(us)?|css|less|sass|scss|sss)$/,
	loader: 'null-loader',
});

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
