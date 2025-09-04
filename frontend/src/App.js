import React from 'react';
import { Routes, Route } from 'react-router-dom';


import SplashPage from './pages/SplashPage';
import HomePage from './pages/HomePage';
import ProjectPage from './pages/ProjectPage';
import ProfilePage from './pages/ProfilePage';

import './App.css';
import './pages/HomePage.css';
import './pages/ProjectPage.css';
import './pages/ProfilePage.css';


function App() {
  return (
    <div className="App">
   
      <Routes>
        {/*Static Routes*/}
        <Route path="/" element={<SplashPage />} />
        <Route path="/home" element={<HomePage />} />

        {/*Dynamic routes*/}
        
        <Route path="/project/:projectId" element={<ProjectPage />} />

        
        <Route path="/profile/:profileId" element={<ProfilePage />} />
      </Routes>
    </div>
  );
}

export default App;