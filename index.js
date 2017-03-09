const fs = require('fs');
const path = require('path');
const express = require('express');
// serializes any type including functions
const serialize = require('serialize-javascript');
const vueSR = require('vue-server-renderer');

const app = express();
const port = process.env.PORT || 8080;
// marker to be replaced with additional head tags and an actual application content
const layoutDelimeter = 'INJECT-HERE';
const production = process.env.NODE_ENV === 'production';
const layoutFile = path.resolve('./dist/index.html');

let layout, renderer;

if (production) {
	layout = fs.readFileSync(layoutFile, 'utf-8').split(layoutDelimeter);
	renderer = vueSR.createBundleRenderer(fs.readFileSync(path.resolve('./dist/server-bundle.js'), 'utf-8'));
}
else {
	require('./build/setup-dev-server')(app, {
		bundleUpdated(bundle) {
			renderer = vueSR.createBundleRenderer(bundle);
		},
		layoutUpdated(html) {
			layout = html.split(layoutDelimeter);
		}
	});
}

app.use('/dist', express.static('./dist'));

app.get('/favicon.ico', (req, res) => {
	res.status(404).end('Not found');
});

app.get('*', (req, res) => {
	if (!renderer || !layout) return res.end('Compiling app, refresh in a moment...');

	res.setHeader('Content-Type', 'text/html');

	const context = { url: req.url };
	const stream = renderer.renderToStream(context);

	stream.once('data', () => {
		const {
			meta, title, link, style, script, noscript,
			htmlAttrs,
			bodyAttrs
		} = context.meta.inject();
		res.write(layout[0]);
		res.write(htmlAttrs.text());
		res.write(layout[1]);
		res.write([meta, title, link, style, script, noscript].reduce((acc, el) => acc + el.text(), ''));
		res.write(layout[2]);
		res.write(bodyAttrs.text());
		res.write(layout[3]);
	});

	stream.on('data', chunk => {
		res.write(chunk);
	});

	stream.on('end', () => {
		if (context.initialState) res.write(`<script>window.__INITIAL_STATE__=${serialize(context.initialState)}</script>`);
		res.end(layout[4]);
	});

	stream.on('error', err => {
		console.log(err);
		res.status(500).end('Something went wrong...');
	});
});

app.listen(port);