export default {
	inserted(el, binding) {
		if (binding.value || !binding.hasOwnProperty('value')) setTimeout(() => {
			el.focus();
		}, 200);
	}
};