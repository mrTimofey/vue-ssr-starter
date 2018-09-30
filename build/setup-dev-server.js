/* eslint-disable no-console */
const path = require('path'),
	webpack = require('webpack'),
	MFS = require('memory-fs');

const clientConfig = require('./webpack/client'),
	serverConfig = require('./webpack/server');

module.exports = (app, opts) => {
	// modify client config to work with hot middleware
	clientConfig.entry = ['webpack-hot-middleware/client', clientConfig.entry];
	clientConfig.output.filename = '[name].js';
	if (!clientConfig.plugins) clientConfig.plugins = [];
	clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
	if (!clientConfig.optimization) clientConfig.optimization = {};
	clientConfig.optimization.noEmitOnErrors = true;

	// dev middleware
	const clientCompiler = webpack(clientConfig),
		devMiddleware = require('webpack-dev-middleware')(clientCompiler, {
			publicPath: clientConfig.output.publicPath,
			stats: {
				colors: true,
				chunks: false
			}
		});

	app.use(devMiddleware);
	clientCompiler.hooks.done.tap('done', () => {
		const fs = devMiddleware.fileSystem,
			filePath = path.join(clientConfig.output.path, 'index.html');
		if (fs.existsSync(filePath)) {
			const index = fs.readFileSync(filePath, 'utf-8');
			opts.layoutUpdated(index);
		}
	});

	// hot middleware
	app.use(require('webpack-hot-middleware')(clientCompiler));

	// watch and update server renderer
	const serverCompiler = webpack(serverConfig),
		mfs = new MFS(),
		outputPath = path.join(serverConfig.output.path, serverConfig.output.filename);
	serverCompiler.outputFileSystem = mfs;
	serverCompiler.watch({}, (err, stats) => {
		if (err) throw err;
		stats = stats.toJson();
		stats.errors.forEach(err => console.error(err));
		stats.warnings.forEach(err => console.warn(err));
		opts.bundleUpdated(mfs.readFileSync(outputPath, 'utf-8'));
	});
};