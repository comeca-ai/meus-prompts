import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Import the generated Tailwind CSS
// @ts-ignore
import './output.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
