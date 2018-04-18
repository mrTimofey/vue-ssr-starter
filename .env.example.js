module.exports = {
	// (optional) http-proxy-middleware options
	apiProxy: {
		target: 'http://localhost:8000',
		prefix: ['/api', '/storage']
	},
	apiBaseURL: {
		client: '/api/',
		server: 'http://localhost:8000/api/'
	},
	port: 8080,
};