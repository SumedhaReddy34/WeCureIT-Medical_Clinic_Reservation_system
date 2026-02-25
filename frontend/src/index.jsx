import React from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot
import App from './App';
import AppContextProvider from './PatientMode/context/AppContext.jsx'

const container = document.getElementById('root'); // Get the root element
const root = createRoot(container); // Create a root using createRoot

root.render(
    <React.StrictMode>
  
        <App />

        
    </React.StrictMode>
);