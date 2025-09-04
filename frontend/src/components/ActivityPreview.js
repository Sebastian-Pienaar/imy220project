import React from 'react';

const ActivityPreview = ({ user, role, projectName, date, memberCount, isAvailable }) => {
  return (
    <article className="preview-card">
      <div className="card-details">
        <div className="activity-card-header">
          <span className="activity-user-icon">👤</span>
          <div className="activity-user-info">
            <p className="user-name">{user}</p>
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
       <div className="checkout-status">
          {isAvailable ? '✅' : '🚫'}
       </div>
    </article>
  );
};

export default ActivityPreview;