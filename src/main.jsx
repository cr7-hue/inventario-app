import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import React from 'react';//
import ReactDOM from 'react-dom/client';//
import App from './App.jsx';
import './index.css';
import { Workbox } from 'workbox-window';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  const wb = new Workbox('/sw.js');
  wb.register();
}