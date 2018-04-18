/* eslint-disable quote-props,dot-notation */
import Axios from 'axios';

const http = Axios.create({
	headers: {
		'X-Requested-With': 'XMLHttpRequest',
		'Accept': 'application/json'
	}
});

http.interceptors.response.use(null, baseErr => {
	const err = {};
	// prevent circular stringify error
	if (baseErr.response) {
		if (baseErr.response.request) {
			err.request = {
				method: baseErr.response.request.method,
				path: baseErr.response.request.path,
				headers: baseErr.response.request._headers
			};
		}
		delete baseErr.response.request;
		delete baseErr.response.config;
	}
	err.message = baseErr.message;
	err.stack = baseErr.stack;
	err.response = baseErr.response;
	return Promise.reject(err);
});

/**
 * Authorize all further http requests.
 * @param {Object} data login response data
 * @return {undefined}
 */
export function authorize(data = null) {
	if (!window) return;
	if (data) {
		if (data.api_token) window.localStorage.apiToken = data.api_token;
		if (data.remember_token) window.localStorage.rememberToken = data.remember_token;
	}
	if (!window.localStorage.apiToken) return;
	http.defaults.headers['Authorization'] = 'Bearer ' + window.localStorage.apiToken;
}

/**
 * Check 'Authorization' header.
 * @return {boolean} requests contain 'Authorization' header
 */
export function authorized() {
	return http.defaults.headers.hasOwnProperty('Authorization');
}

/**
 * Forget authorization token and send logout request to backend.
 * @return {undefined}
 */
export function logout() {
	if (!window) return;
	if (authorized()) http.post('auth/logout');
	window.localStorage.removeItem('apiToken');
	window.localStorage.removeItem('rememberToken');
	delete http.defaults.headers['Authorization'];
}

/**
 * Try to recall api token by remember token.
 * @return {Promise} axios request
 */
export function recallToken() {
	if (!window.localStorage.rememberToken) return Promise.resolve();
	return http.post('auth/recall', { token: window.localStorage.rememberToken })
		.then(res => {
			authorize(res.data);
			return res;
		})
		.catch(err => {
			logout();
			throw err;
		});
}

/**
 * Get api token.
 * @return {String|undefined} token
 */
export function getApiToken() {
	return http.defaults.headers['Authorization'] && http.defaults.headers['Authorization'].substr(7);
}

authorize();
export default http;