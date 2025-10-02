import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ProjectsProvider } from './context/ProjectsContext';
// Tailwind base and component layers
import './styles/tailwind.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ProjectsProvider>
        <App />
      </ProjectsProvider>
    </BrowserRouter>
  </React.StrictMode>
);