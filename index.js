const fs = require('fs');
const path = require('path');
const express = require('express');
const serialize = require('serialize-javascript');
const vueSR = require('vue-server-renderer');

const app = express();
const port = process.env.PORT || 8080;
const layoutPlaceholder = '<!-- APP -->';
const production = process.env.NODE_ENV === 'production';
const layoutFile = path.resolve('./dist/index.html');

let layout, renderer;

if (production) {
	layout = fs.readFileSync(layoutFile, 'utf-8');
	renderer = vueSR.createBundleRenderer(fs.readFileSync(path.resolve('./dist/server-bundle.js'), 'utf-8'));
}
else {
	require('./build/setup-dev-server')(app, {
		bundleUpdated(bundle) {
			renderer = vueSR.createBundleRenderer(bundle);
		},
		layoutUpdated(html) {
			layout = html;
		}
	});
}

function parseLayout() {
	const i = layout.indexOf(layoutPlaceholder);
	return {
		head: layout.slice(0, i),
		tail: layout.slice(i + layoutPlaceholder.length)
	};
}

app.use('/dist', express.static('./dist'));

app.get('/favicon.ico', (req, res) => {
	res.status(404).end('Not found');
});

app.get('*', (req, res) => {
	if (!renderer) return res.end('Compiling app, refresh in a moment...');

	res.setHeader('Content-Type', 'text/html');

	const context = { url: req.url };
	const stream = renderer.renderToStream(context);
	const layout = parseLayout();

	stream.once('data', () => {
		res.write(layout.head);
	});

	stream.on('data', chunk => {
		res.write(chunk);
	});

	stream.on('end', () => {
		if (context.initialState) res.write(`<script>window.__INITIAL_STATE__=${serialize(context.initialState)}</script>`);
		res.end(layout.tail);
	});

	stream.on('error', err => {
		console.log(err);
		res.status(500).end('Something went wrong...');
	});
});

app.listen(port);