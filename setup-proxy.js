const hpm = require('http-proxy-middleware');

module.exports = (app, config) => {
	/**
	 * '/path-prefix': 'http://api-host'
	 * 		OR
	 * '/path-prefix': { ...config }
	 * @see https://github.com/chimurai/http-proxy-middleware#options for config options
	 */
	const apiProxy = {
		'/api': config.apiBaseUrl.server,
	};

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
