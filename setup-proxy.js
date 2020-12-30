const { createProxyMiddleware } = require('http-proxy-middleware');

const paths = [
	'/api',
];

module.exports = (app, target) => {
	const hpmConfig = {
		secure: false,
		changeOrigin: true,
		target,
	};
	for (const prefix of paths) app.use(createProxyMiddleware(prefix, hpmConfig));
};
