/* eslint-disable quote-props */
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
		delete baseErr.response.request;
		delete baseErr.response.config;
	}
	err.message = baseErr.message;
	err.stack = baseErr.stack;
	err.response = baseErr.response;
	return Promise.reject(err);
});

export default http;