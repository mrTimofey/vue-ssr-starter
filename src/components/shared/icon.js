export default {
	props: {
		name: {
			type: String,
			required: true
		}
	},
	functional: true,
	render: (h, { props, data }) => h(
		'svg', data,
		[
			h('use', {
				attrs: {
					'xmlns:xlink': 'http://www.w3.org/1999/xlink',
					'xlink:href': '#i-' + props.name
				}
			})
		]
	)
};