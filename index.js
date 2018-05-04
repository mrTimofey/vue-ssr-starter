/* eslint-disable no-console */
const fs = require('fs'),
	path = require('path'),
	polka = require('polka'),
	serveStatic = require('serve-static'),
	serveFavicon = require('serve-favicon'),
	// serializes any data including functions
	serialize = require('serialize-javascript'),
	vueSR = require('vue-server-renderer');

// environment parameters
const envFile = path.resolve(process.cwd(), '.env.js'),
	env = fs.existsSync(envFile) ? require(envFile) : {};

// application variables
const app = polka(),
	port = env.port || process.env.PORT || 8080,
	production = process.env.NODE_ENV === 'production',
	layoutFile = path.resolve('./dist/index.html');

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
		end
	];
}

if (production) {
	layout = parseLayout(fs.readFileSync(layoutFile, 'utf-8'));
	renderer = vueSR.createBundleRenderer(fs.readFileSync(path.resolve('./dist/server-bundle.js'), 'utf-8'), {
		runInNewContext: false
	});
}
else {
	require('./build/setup-dev-server')(app, {
		bundleUpdated(bundle) {
			renderer = vueSR.createBundleRenderer(bundle);
		},
		layoutUpdated(html) {
			layout = parseLayout(html);
		}
	});
}

app.get('/dist/server-bundle.js', (req, res, next) => { next(); });
app.use('/dist', serveStatic('./dist'));
app.use(serveFavicon(path.join(process.cwd(), 'favicon.ico')));

// optional api proxy
if (env.apiProxy) app.use(require('http-proxy-middleware')(env.apiProxy.prefix, env.apiProxy));

app.get('*', (req, res) => {
	if (!renderer || !layout) return res.end('Compiling app, refresh in a moment...');
	res.setHeader('Content-Type', 'text/html');

	const context = req;
	const stream = renderer.renderToStream(context);
	let body = '';

	stream.once('data', () => {
		// get head data from the vue-meta plugin
		const {
			meta, title, link, style, script, noscript,
			htmlAttrs,
			bodyAttrs
		} = context.meta.inject();

		body += layout[0](
			// <head> ...
			[meta, title, link, style, script, noscript].reduce((acc, el) => acc + el.text(), ''),
			// <html ATTRS>
			htmlAttrs.text(),
			// <body ATTRS>
			bodyAttrs.text()
		);
	});

	stream.on('data', chunk => {
		body += chunk;
	});

	stream.on('end', () => {
		if (context.initialVuexState && context.initialVuexState.serverError) {
			// let application handle server error if possible
			console.error((new Date()).toUTCString() + ': data prefetching error');
			console.error(context.initialVuexState.serverError);
		}
		res.statusCode = context.statusCode || 200;
		res.write(body);

		if (context.initialVuexState)
			res.write(`<script>window.__INITIAL_VUEX_STATE__=${serialize(context.initialVuexState)}</script>`);
		if (context.initialComponentStates)
			res.write(`<script>window.__INITIAL_COMP_STATE__=${serialize(context.initialComponentStates)}</script>`);

		res.end(layout[1]);
	});

	stream.on('error', err => {
		res.statusCode = 500;
		console.error(new Date().toISOString());
		console.error(formatError(err));
		res.end(production ? 'Something went wrong...' : `<pre>${err.stack}\n\n<b>Watch console for more information</b></pre>`);
	});
});

app.listen(port);