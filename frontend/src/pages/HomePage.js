//HomePage.js
import React from 'react';


import Navbar from '../components/Navbar';
import ProjectFeed from '../components/ProjectFeed';
import ActivityFeed from '../components/ActivityFeed';


import './HomePage.css';


const HomePage = () => {
  return (
   
    <div className="home-page">
      
     
      <Navbar />

    
      <main className="main-container">
        <div className="content-area">
          
   
          <ProjectFeed />
          
        
          <ActivityFeed />
          
        </div>
      </main>
    </div>
  );
};


export default HomePage;