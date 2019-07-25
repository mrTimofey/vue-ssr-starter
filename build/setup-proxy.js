const hpm = require('http-proxy-middleware');

/**
 * '/path-prefix': 'http://api-host'
 * 		OR
 * '/path-prefix': { ...config }
 * @see https://github.com/chimurai/http-proxy-middleware#options for config options
 */
const apiProxy = {
	'/api/': 'http://api-host',
};

module.exports = app => {
	for (const prefix of Object.keys(apiProxy)) {
		app.use(hpm(
			prefix,
			(typeof apiProxy[prefix] === 'string') ?
				{
					secure: false,
					changeOrigin: true,
					target: apiProxy[prefix],
				} :
				apiProxy[prefix]
		));
	}
};
