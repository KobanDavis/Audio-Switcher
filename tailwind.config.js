const { kdUI } = require('@kobandavis/ui')

module.exports = {
	content: ['src/**/*.{ts,tsx}'],
	theme: {
		extend: {},
	},
	plugins: [],
}

kdUI(module.exports)
