const { createConfig } = require('./base');
const webpack = require('webpack');

const baseConfig = createConfig();

const serverConfig = Object.assign({}, baseConfig, {
	target: 'node',
	entry: './src/entry/server.js',
	output: Object.assign({}, baseConfig.output, {
		filename: 'server-bundle.js',
		libraryTarget: 'commonjs2'
	}),
	externals: Object.keys(require('../../package.json').dependencies),
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
			'process.env.VUE_ENV': '"server"',
			window: 'undefined'
		})
	]
});

const vueLoader = serverConfig.module.rules.find(({ loader }) => loader === 'vue-loader');

// ignore styles, they are already loaded by the client side builder
serverConfig.module.rules.push({
	test: /\.(styl|css)$/,
	use: 'null-loader'
});

for (let loader of ['stylus', 'css']) {
	vueLoader.options.loaders[loader] = 'null-loader';
}

module.exports = serverConfig;