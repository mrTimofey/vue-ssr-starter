/* eslint-disable quote-props,dot-notation */
import Axios from 'axios';

const http = Axios.create({
	headers: {
		'X-Requested-With': 'XMLHttpRequest',
		'Accept': 'application/json',
	},
});

http.interceptors.response.use(null, baseErr => {
	if (Axios.isCancel(baseErr)) {
		baseErr.isCancelError = true;
		throw baseErr;
	}
	const err = {};
	// prevent circular stringify error
	if (baseErr.response) {
		if (baseErr.response.request) {
			err.request = {
				method: baseErr.response.request.method,
				path: baseErr.response.request.path,
				headers: baseErr.response.request._headers,
			};
		}
		delete baseErr.response.request;
		delete baseErr.response.config;
	}
	err.message = baseErr.message;
	err.stack = baseErr.stack;
	err.response = baseErr.response;
	throw err;
});

export default http;
export const CancelToken = Axios.CancelToken;
