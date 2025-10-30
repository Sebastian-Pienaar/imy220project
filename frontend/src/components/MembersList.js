import React, { useState } from 'react';
import ProfilePreview from './ProfilePreview';
import { useProjects } from '../context/ProjectsContext';

const MembersList = ({ projectId }) => {
  const { projects, users, currentUserId, addMember, removeMember, friendships } = useProjects();
  const [showAddMember, setShowAddMember] = useState(false);
  
  const project = projects.find(p => p.id === projectId || p._id === projectId);
  

  const owner = users.find(u => 
    u.id === project?.ownerId || 
    u._id === project?.ownerId || 
    u.mongoId === project?.ownerId
  );
  

  const members = project ? project.members.map(memberId => 
    users.find(u => u.id === memberId || u._id === memberId || u.mongoId === memberId)
  ).filter(Boolean) : [];
  

  const allMembers = owner && !members.some(m => 
    m.id === owner.id || m._id === owner._id || m.mongoId === owner.mongoId
  ) ? [owner, ...members] : members;
  
  const isOwner = project?.ownerId === currentUserId;
  const isMember = project?.members?.includes(currentUserId);
  

  const acceptedFriendships = friendships.filter(f => f.status === 'accepted');
  const friendIds = new Set();
  acceptedFriendships.forEach(f => {
    if (f.requesterId === currentUserId) friendIds.add(f.recipientId);
    if (f.recipientId === currentUserId) friendIds.add(f.requesterId);
  });
  
  const friendsNotInProject = users.filter(u => 
    friendIds.has(u.id) && !project?.members?.includes(u.id)
  );
  
  const handleAddMember = async (userId) => {
    await addMember(projectId, userId);
    setShowAddMember(false);
  };
  
  const handleRemoveMember = async (userId) => {
    if (window.confirm('Remove this member from the project?')) {
      await removeMember(projectId, userId);
    }
  };
  
  return (
    <div className="members-column">
      <div className="flex justify-between items-center mb-2">
        <h2 className="footer-title">Current members</h2>
        {isMember && friendsNotInProject.length > 0 && (
          <button 
            className="btn-outline text-xs px-2 py-1" 
            onClick={() => setShowAddMember(!showAddMember)}
          >
            {showAddMember ? 'Cancel' : '+ Add Friend'}
          </button>
        )}
      </div>
      
      {showAddMember && friendsNotInProject.length > 0 && (
        <div className="mb-4 p-2 bg-bg rounded">
          <p className="text-xs mb-2 text-[#a3a3a3]">Add a friend:</p>
          <ul className="list-none p-0">
            {friendsNotInProject.map(friend => (
              <li key={friend.id} className="flex justify-between items-center mb-2">
                <span className="text-[13px]">{friend.name}</span>
                <button 
                  className="btn-primary text-xs px-2 py-0.5" 
                  onClick={() => handleAddMember(friend.id)}
                >
                  Add
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      


      {project && !allMembers.length && <p className="empty">No members yet.</p>}
      <ul className="profile-preview-list">
        {allMembers.map(member => (
          <li key={member.id} className="profile-preview-list-item">
            <div className="member-preview-wrapper flex justify-between items-center">
              <div className="flex items-center gap-1">
                {(member.id === project.ownerId || member._id === project.ownerId || member.mongoId === project.ownerId) && 
                  <span className="owner-badge" title="Owner">☆</span>}
                <ProfilePreview user={member} showFollow={false} />
              </div>
              {isOwner && member.id !== project.ownerId && (
                <button 
                  className="btn-outline text-xs px-2 py-0.5 text-[#ff6b6b]" 
                  onClick={() => handleRemoveMember(member.id)}
                  title="Remove member"
                >
                  Remove
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};


export default MembersList;