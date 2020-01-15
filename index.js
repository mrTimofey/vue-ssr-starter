/* eslint-disable no-console */
const fs = require('fs'),
	path = require('path'),
	polka = require('polka'),
	serveStatic = require('serve-static'),
	serveFavicon = require('serve-favicon'),
	// safely serializes any data including functions
	serialize = require('serialize-javascript'),
	vueSR = require('vue-server-renderer');

// application variables
const port = process.env.PORT || 8080,
	production = process.env.NODE_ENV === 'production',
	config = {
		production,
		port,
		apiBaseUrl: {
			server: process.env.API_BASE_SSR && (process.env.API_BASE_SSR.replace(/\/$/, '') + '/') || `http://localhost:${port}/`,
			client: process.env.API_BASE_CLIENT && (process.env.API_BASE_CLIENT.replace(/\/$/, '') + '/') || '/',
		},
		proxyEnabled: process.env.PROXY_ENABLED || !production,
	};

let pe;
if (!production) pe = new (require('pretty-error'))();
const formatError = production ? err => err.stack : err => pe.render(err);

let layout, renderer;

/**
 * Split layout HTML allowing server renderer to inject component output, store data, meta tags, etc.
 * @param {string} html layout HTML
 * @return {[function,string]} [
 *    function({string} meta tags, {string} attributes for <html>, {string} attributes for body),
 *    {string} page ending
 * ]
 */
function parseLayout(html) {
	let layout = html.split('<html>');

	const start = layout[0] + '<html';
	layout = layout[1].split('</head>');
	const head = '>' + layout[0];
	layout = layout[1].split('<body>');
	const body = '</head>' + layout[0] + '<body';
	layout = layout[1].split('<!--APP-->');
	const afterBody = '>' + layout[0];
	const end = layout[1];

	return [
		// before app layout
		(headMeta, htmlAttrs, bodyAttrs) => {
			headMeta = headMeta || '';
			htmlAttrs = htmlAttrs.replace('data-meta=""', '');
			bodyAttrs = bodyAttrs.replace('data-meta=""', '');

			htmlAttrs = ' data-meta-ssr' + (htmlAttrs ? (' ' + htmlAttrs) : '');
			bodyAttrs = bodyAttrs ? (' ' + bodyAttrs.replace('data-meta=""', '')) : '';
			return start + htmlAttrs +
				head + headMeta +
				body + bodyAttrs +
				afterBody;
		},
		// after app layout
		end,
	];
}

console.log('Starting app server...');

const app = polka();

if (config.proxyEnabled) require('./setup-proxy')(app, config);

if (config.production) {
	layout = parseLayout(fs.readFileSync(path.resolve('./dist/index.html'), 'utf-8'));
	renderer = vueSR.createBundleRenderer(path.resolve('./dist/server/vue-ssr-server-bundle.json'), {
		runInNewContext: false,
		clientManifest: require('./dist/vue-ssr-client-manifest.json'),
	});
	app.use('/dist', serveStatic('./dist/public'));
}
else {
	require('./build/setup-dev-server')(app, {
		bundleUpdated(bundle) {
			renderer = vueSR.createBundleRenderer(bundle);
		},
		layoutUpdated(html) {
			layout = parseLayout(html);
		},
	});
}

app.use(serveFavicon(path.join(process.cwd(), 'favicon.ico')));

app.get('*', (req, res) => {
	if (!renderer || !layout) return res.end('Compiling app, refresh in a moment...');
	res.setHeader('Content-Type', 'text/html');

	req.envConfig = {
		apiBaseUrl: config.apiBaseUrl.server,
	};

	const clientEnvConfig = {
		apiBaseUrl: config.apiBaseUrl.client,
	};

	const context = req,
		stream = renderer.renderToStream(context);

	let body = [],
		errorOccurred = false;

	stream.once('data', () => {
		try {
			// get head data from the vue-meta plugin
			const {
				meta, title, link, style, script, noscript,
				htmlAttrs,
				bodyAttrs,
			} = context.meta.inject();

			body.push(layout[0](
				// <head> ...
				[meta, title, link, style, script, noscript].reduce((acc, el) => acc + el.text(), '') +
				context.renderResourceHints() + context.renderStyles(),
				// <html ATTRS>
				htmlAttrs.text(),
				// <body ATTRS>
				bodyAttrs.text()
			));
		}
		catch (err) {
			stream.destroy(err);
		}
	});

	stream.on('data', chunk => {
		if (errorOccurred) return;
		body.push(chunk);
	});

	stream.on('end', () => {
		if (errorOccurred) return;
		if (context.storeState && context.storeState.serverError)
			// let application handle server error if possible
			console.error(context.storeState.serverError);
		res.statusCode = context.statusCode || 200;
		body.forEach(chunk => { res.write(chunk); });

		const injectData = { cfg: clientEnvConfig };

		if (context.storeState) injectData.state = context.storeState;
		if (context.componentStates) injectData.cmp = context.componentStates;

		res.write(`<script>window.__APP__=${serialize(injectData)}</script>`);

		res.write(context.renderScripts());
		res.end(layout[1]);
	});

	stream.on('error', err => {
		errorOccurred = true;
		res.statusCode = 500;
		console.error(formatError(err));
		res.end(config.production ? 'Something went wrong...' : `<pre>${err.stack}\n\n<b>Watch console for more information</b></pre>`);
	});
});

app.listen(config.port);

console.log('Server listening on port ' + config.port);

// handle system signals

if (config.production) {
	const signals = {
		SIGHUP: 1,
		SIGINT: 2,
		SIGTERM: 15,
	};

	Object.keys(signals).forEach((signal) => {
		process.on(signal, () => {
			console.log(`Received ${signal} ${signals[signal]}, shutting down the server...`);
			app.server.close(() => {
				console.log('Server stopped');
				process.exit(128 + signals[signal]);
			});
		});
	});
}
