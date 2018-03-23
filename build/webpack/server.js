const { options, createConfig } = require('./base'),
	webpack = require('webpack');

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
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
			'process.env.VUE_ENV': '"server"',
			window: 'undefined'
		})
	])
});

serverConfig.module.rules = (baseConfig.module.rules || []).concat([
	{
		test: options.fonts.test,
		loader: 'file-loader',
		options: {
			name: options.fonts.name,
			emitFile: false
		}
	},
	{
		test: options.images.test,
		loader: 'url-loader',
		options: {
			limit: options.images.limit,
			name: options.images.name,
			emitFile: false
		}
	},
	{
		test: options.docs.test,
		loader: 'file-loader',
		options: {
			name: options.docs.name,
			emitFile: false
		}
	},
	{
		test: /\.(styl|css|less|sass|scss|sss)$/,
		loader: 'null-loader'
	}
]);

const vueLoader = serverConfig.module.rules.find(({ loader }) => loader === 'vue-loader');

for (let loader of ['stylus', 'css', 'sass', 'scss', 'less', 'postcss']) {
	vueLoader.options.loaders[loader] = 'null-loader';
}

module.exports = serverConfig;