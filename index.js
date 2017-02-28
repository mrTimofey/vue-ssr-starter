const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const port = process.env.PORT || 8080;
const layoutPlaceholder = '<!-- APP -->';

let layout = fs.readFileSync(path.resolve('./dist/index.html'), 'utf-8');
let renderer = require('vue-server-renderer').createBundleRenderer(fs.readFileSync(path.resolve('./dist/server-bundle.js'), 'utf-8'));

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
		if (context.initialState) res.write(`<script>window.__INITIAL_STATE__=${JSON.stringify(context.initialState)}</script>`);
		res.end(layout.tail);
	});

	stream.on('error', err => {
		console.log(err);
		res.status(500).end('Something went wrong...');
	});
});

app.listen(port);