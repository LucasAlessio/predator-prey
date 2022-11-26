import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { EnviromentProvider } from './hooks/useEnviroment';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
	<React.StrictMode>
		<EnviromentProvider>
			<App />
		</EnviromentProvider>
	</React.StrictMode>
);
