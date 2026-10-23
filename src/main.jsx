import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { LanguageProvider } from './context/LanguageContext';
import { KhataProvider } from './context/KhataContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <KhataProvider>
        <App />
      </KhataProvider>
    </LanguageProvider>
  </React.StrictMode>
);
