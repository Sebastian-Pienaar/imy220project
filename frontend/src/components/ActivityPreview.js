import React from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectsContext';

const ActivityPreview = ({ activity, project }) => {
  if (!activity) return null;
  
  const { userId, type, date, memberCount, message, version, projectName, projectImage } = activity;
  const actualProjectName = project?.name || projectName || 'unknown project';
  const actualProjectImage = project?.image || projectImage;
  const isAvailable = project ? project.isAvailable : false;
  const projectId = project ? project.id : activity.projectId;
  const { users } = useProjects();
  
  const userObj = users.find(u => u.id === userId);
  const userName = userObj?.name || userId || 'Unknown User';
  

  let activityDescription = '';
  if (type === 'checkout') {
    activityDescription = `checked out ${actualProjectName}`;
  } else if (type === 'return') {
    activityDescription = `returned ${actualProjectName}`;
  } else if (type === 'checkin') {
    activityDescription = `checked in to ${actualProjectName}`;
  } else if (type === 'creation') {
    activityDescription = `created ${actualProjectName}`;
  } else {
    activityDescription = `performed activity on ${actualProjectName}`;
  }

  return (
    <article className="preview-card" data-project-id={projectId} data-available={isAvailable}>
      <div className="card-details">
        <div className="activity-card-header">
          <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
            {userObj?.profileImage ? (
              <img 
                src={userObj.profileImage} 
                alt={userObj.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg">{userName.charAt(0)}</span>
            )}
          </div>
          <div className="activity-user-info">
            <div className="user-name">
              {userObj ? (
                <Link to={`/profile/${userObj.id}`} className="user-pop-btn hover:text-accent transition-colors">{userName}</Link>
              ) : userName}
            </div>
            <p className="role-info font-medium text-[#e5e5e5] mt-1">
              {activityDescription}
            </p>
            {message && type === 'checkin' && (
              <p className="role-info italic text-[#a3a3a3] mt-0.5">
                "{message}"
              </p>
            )}
            {version && type === 'checkin' && (
              <p className="role-info text-[#737373] mt-0.5">
                Version: {version}
              </p>
            )}
            <p className="role-info text-[#737373] mt-1">
              {date}
            </p>
          </div>
        </div>
      </div>
      <div className="project-image">
        {actualProjectImage ? (
          <img src={actualProjectImage} alt={actualProjectName} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="m-0 mb-2 text-xs text-center text-[#737373]">
              {memberCount} active members
            </p>
            <span className="text-[10px] text-[#525252]">project image</span>
          </div>
        )}
      </div>
      <div className="checkout-status" title={isAvailable ? 'Available for checkout' : 'Currently checked out'}>
        {isAvailable ? '✅' : '🔒'}
      </div>
      {projectId && (
        <div className="card-actions">
          <Link to={`/project/${projectId}`} className="small-btn">open</Link>
        </div>
      )}
    </article>
  );
};

export default ActivityPreview;