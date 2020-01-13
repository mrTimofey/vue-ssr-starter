module.exports = {
	// (optional) http-proxy-middleware options
	/** @see https://github.com/chimurai/http-proxy-middleware#options */
	apiProxy: {
		target: 'http://localhost:8000',
		prefix: ['/api', '/storage']
	},
	// path prefix for all Axios requests (separately for client and SSR)
	apiBaseURL: {
		client: '/api/',
		server: 'http://localhost:8000/api/'
	},
	// application port (can be overwritten by process.env.PORT)
	port: 8080,
};