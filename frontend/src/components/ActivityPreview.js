import React from 'react';
import { Link } from 'react-router-dom';
import ProfilePopover from './ProfilePopover';
import { useProjects } from '../context/ProjectsContext';

const ActivityPreview = ({ activity, project }) => {
  if (!activity) return null;
  const { user, userId, role, date, memberCount } = activity;
  const projectName = project ? project.name : 'unknown project';
  const isAvailable = project ? project.isAvailable : false;
  const projectId = project ? project.id : undefined;
  const { users } = useProjects();
  const resolvedUserId = userId || (user ? user.replace(/\s+/g,'-').toLowerCase() : null);
  const userObj = users.find(u => u.id === resolvedUserId || (user && u.name === user));

  return (
    <article className="preview-card" data-project-id={projectId} data-available={isAvailable}>
      <div className="card-details">
        <div className="activity-card-header">
          <span className="activity-user-icon">👤</span>
          <div className="activity-user-info">
            <div className="user-name">
              {userObj ? (
                <ProfilePopover user={userObj}>
                  <button type="button" className="user-pop-btn" aria-label={`View profile for ${userObj.name}`}>{userObj.name}</button>
                </ProfilePopover>
              ) : (user || resolvedUserId || 'Unknown User')}
            </div>
            <p className="role-info">{role} of ({projectName})</p>
            <p className="role-info">created {date}</p>
          </div>
        </div>
      </div>
      <div className="project-image">
        <div>
          <p style={{ margin: '0 0 10px 0', fontSize: '12px', textAlign: 'center' }}>
            {memberCount} active members
          </p>
          project image
        </div>
      </div>
      <div className="checkout-status" title={isAvailable ? 'Available for checkout' : 'Currently checked out'}>
        {isAvailable ? '✅' : '�'}
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