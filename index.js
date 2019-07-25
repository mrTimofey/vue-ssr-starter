/* eslint-disable no-console */
const fs = require('fs'),
	path = require('path'),
	polka = require('polka'),
	serialize = require('serialize-javascript'),
	vueSR = require('vue-server-renderer');

const port = process.env.APP_PORT || 3000,
	config = {
		port,
		production: process.env.NODE_ENV === 'production',
		apiBaseUrl: {
			server: process.env.API_BASE_SSR || `http://localhost:${port}/`,
			client: process.env.API_BASE_CLIENT || '/',
		},
		proxyEnabled: !!process.env.PROXY_ENABLED,
		serveStatic: !!process.env.SERVE_STATIC,
	};

// application variables
const app = polka(),
	layoutFile = path.resolve('./dist/index.html'),
	faviconPath = path.join(process.cwd(), 'favicon.ico');

let formatError, layout, renderer;

if (config.production) {
	formatError = err => err.stack;
}
else {
	const prettyError = new (require('pretty-error'))();
	formatError = err => prettyError.render(err);
}

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

if (config.proxyEnabled) {
	require('./build/setup-proxy')(app);
}

if (config.serveStatic) {
	app.use('/dist', require('serve-static')('./dist'));
}

if (config.production) {
	layout = parseLayout(fs.readFileSync(layoutFile, 'utf-8'));
	renderer = vueSR.createBundleRenderer(path.resolve('./dist/vue-ssr-server-bundle.json'), {
		runInNewContext: false,
		clientManifest: require('./dist/vue-ssr-client-manifest.json'),
	});
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

if (fs.existsSync(faviconPath)) {
	app.use(require('serve-favicon')(faviconPath));
}

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

	let body = '',
		errorOccurred = false;

	stream.once('data', () => {
		try {
			// get head data from the vue-meta plugin
			const {
				meta, title, link, style, script, noscript,
				htmlAttrs,
				bodyAttrs,
			} = context.meta.inject();

			body += layout[0](
				// <head> ...
				[meta, title, link, style, script, noscript].reduce((acc, el) => acc + el.text(), '') +
				context.renderResourceHints() + context.renderStyles(),
				// <html ATTRS>
				htmlAttrs.text(),
				// <body ATTRS>
				bodyAttrs.text()
			);
		}
		catch(err) {
			stream.destroy(err);
		}
	});

	stream.on('data', chunk => {
		if (errorOccurred) return;
		body += chunk;
	});

	stream.on('end', () => {
		if (errorOccurred) return;
		if (context.initialVuexState && context.initialVuexState.serverError) {
			// let application handle server error if possible
			console.error((new Date()).toUTCString() + ': data prefetching error');
			console.error(context.initialVuexState.serverError);
		}
		res.statusCode = context.statusCode || 200;
		res.write(body);

		const injectData = { cnf: clientEnvConfig };
		if (context.initialVuexState) injectData.state = context.initialVuexState;
		if (context.initialComponentStates) injectData.cmp = context.initialComponentStates;
		res.write(`<script>window.__APP__=${serialize(injectData)}</script>`);

		res.write(context.renderScripts());
		res.end(layout[1]);
	});

	stream.on('error', err => {
		errorOccurred = true;
		res.statusCode = 500;
		console.error(new Date().toISOString());
		console.error(formatError(err));
		res.end(config.production ? 'Something went wrong...' : `<pre>${err.stack}\n\n<b>Watch console for more information</b></pre>`);
	});
});

app.listen(config.port);
