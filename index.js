/* eslint-disable no-console */
const fs = require('fs'),
	path = require('path'),
	polka = require('polka'),
	serialize = require('serialize-javascript'),
	vueSR = require('vue-server-renderer');

const port = process.env.APP_PORT || 8080,
	config = {
		port,
		production: process.env.NODE_ENV === 'production',
		apiBaseUrl: {
			server: process.env.API_BASE_SSR && (process.env.API_BASE_SSR.replace(/\/$/, '') + '/') || `http://localhost:${port}/`,
			client: process.env.API_BASE_CLIENT && (process.env.API_BASE_CLIENT.replace(/\/$/, '') + '/') || '/',
		},
		proxyBase: process.env.PROXY_BASE || '',
	};

// application variables
const app = polka(),
	layoutFile = path.resolve('./dist/index.html'),
	faviconPath = path.join(process.cwd(), 'favicon.ico');

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
	layout = layout[1].split('</body>');
	const beforeClosingBody = layout[0],
		end = '</body>' + layout[1];

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
		beforeClosingBody,
		end,
	];
}

if (config.proxyBase) require('./setup-proxy')(app, config.proxyBase);

if (config.production) {
	const clientManifest = require('./dist/vue-ssr-client-manifest.json'),
		serverBundle = require('./dist/server/vue-ssr-server-bundle.json'),
		localPublicPath = clientManifest.publicPath;

	layout = parseLayout(fs.readFileSync(layoutFile, 'utf-8'));
	renderer = vueSR.createBundleRenderer(serverBundle, {
		runInNewContext: false,
		clientManifest,
	});

	if (localPublicPath.startsWith('/')) {
		let staticHandler = null;

		// polka understands only single-slash root paths, so register global middleware with some hacks to serve any required prefix
		app.use((req, res, next) => {
			if (req.path.startsWith(localPublicPath)) {
				// lazy-load static server for environments without an external static server
				if (!staticHandler) staticHandler = require('serve-static')('./dist/public', {
					maxAge: '3d',
					immutable: true,
				});
				// access log
				console.log({
					url: req.url,
					referer: req.headers.referer,
				});
				// hack request for staticHandler...
				const { path, url } = req;
				req.path = path.substring(localPublicPath.length) || '/';
				req.url = url.substring(localPublicPath.length) || '/';
				staticHandler(req, res, err => {
					// ...and revert it back
					req.path = path;
					req.url = url;
					next(err);
				});
			}
			else next();
		});
	}
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

if (fs.existsSync(faviconPath)) app.use(require('serve-favicon')(faviconPath));

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
		if (context.initialVuexState && context.initialVuexState.serverError)
			console.error(context.initialVuexState.serverError);
		res.statusCode = context.statusCode || 200;
		res.write(body);

		const injectData = { cfg: clientEnvConfig };
		if (context.initialVuexState) injectData.state = context.initialVuexState;
		if (context.initialComponentStates) injectData.cmp = context.initialComponentStates;
		else delete injectData.disableMarketingScripts;
		res.write(`<script>window.__APP__=${serialize(injectData)}</script>`);

		res.write(context.renderScripts());
		res.write(layout[1]);
		res.end(layout[2]);
	});

	stream.on('error', err => {
		errorOccurred = true;
		res.statusCode = 500;
		console.error(err);
		res.end(config.production ? 'Something went wrong...' : `<pre>${err.stack}\n\n<b>Watch console for more information</b></pre>`);
	});
});

app.listen(config.port);

console.log(`Server listening on port ${config.port}`);
