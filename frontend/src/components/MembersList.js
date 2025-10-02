import React from 'react';
import ProfilePreview from './ProfilePreview';
import { useProjects } from '../context/ProjectsContext';

const MembersList = ({ projectId }) => {
  const { projects, users } = useProjects();
  const project = projects.find(p => p.id === projectId || p._id === projectId);
  const members = project ? project.members.map(memberId => 
    users.find(u => u.id === memberId || u._id === memberId || u.mongoId === memberId)
  ).filter(Boolean) : [];
  return (
    <div className="members-column">
      <h2 className="footer-title">Current members</h2>
      {project && !members.length && <p className="empty">No members yet.</p>}
      <ul className="profile-preview-list">
        {members.map(member => (
          <li key={member.id} className="profile-preview-list-item">
            <div className="member-preview-wrapper">
              {(member.id === project.ownerId || member._id === project.ownerId || member.mongoId === project.ownerId) && 
                <span className="owner-badge" title="Owner">☆</span>}
              <ProfilePreview user={member} showFollow={false} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MembersList;