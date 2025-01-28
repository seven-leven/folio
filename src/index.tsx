// Index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import  { HashRouter } from 'react-router-dom';
import App from './App.tsx'
import './global.css';


// Root rendering logic
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);