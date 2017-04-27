/* eslint-disable quote-props */
import Axios from 'axios';
export default Axios.create({
	headers: {
		'X-Requested-With': 'XMLHttpRequest',
		'Accept': 'application/json'
	}
});