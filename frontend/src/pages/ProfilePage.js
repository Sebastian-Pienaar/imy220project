//ProfilePage.js
import React from 'react';
import { useParams } from 'react-router-dom';


import UserProfileInfo from '../components/UserProfileInfo';
import UserProjects from '../components/UserProjects';
import UserInteractions from '../components/UserInteractions';


import './ProfilePage.css';

const ProfilePage = () => {
  
  const { profileId } = useParams();
  const userName = "seb pienaar"; 

  return (
    
    <main className="profile-page-container">
      <header className="profile-header">
        <a href="/home" className="back-button">←</a>
         <span>Banner for user: <strong>{profileId}</strong></span>
      </header>
      
      <div className="profile-content">
        <UserProfileInfo />
        
        <div className="profile-activity-column">
          <UserProjects userName={userName} />
          <UserInteractions userName={userName} />
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;