import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ThemeProvider } from '@kobandavis/ui'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
	<React.StrictMode>
		<ThemeProvider initialTheme={{ secondary: '#000', primary: '#fff' }}>
			<App />
		</ThemeProvider>
	</React.StrictMode>
)
