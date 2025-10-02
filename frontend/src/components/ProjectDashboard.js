import React, { useState } from 'react';
import { useProjects } from '../context/ProjectsContext';

const ProjectDashboard = ({ projectId }) => {
  const { projects, users, addMember, transferOwnership, deleteProject, currentUserId } = useProjects();
  const project = projects.find(p => p.id === projectId);
  const [memberId, setMemberId] = useState('');
  const [newOwnerId, setNewOwnerId] = useState('');
  if (!project) return <div className="dashboard-column"><p>Project not found.</p></div>;
  const isOwner = project.ownerId === currentUserId;

  const handleAddMember = (e) => {
    e.preventDefault();
    if (memberId) addMember(projectId, memberId);
    setMemberId('');
  };
  const handleTransfer = (e) => {
    e.preventDefault();
    if (newOwnerId) transferOwnership(projectId, newOwnerId);
    setNewOwnerId('');
  };
  const handleDelete = () => {
    if (window.confirm('Delete project? This cannot be undone.')) {
      deleteProject(projectId);
    }
  };

  const availableUsers = users.filter(u => !project.members.includes(u.id));
  const memberUsers = project.members.map(id => users.find(u => u.id === id)).filter(Boolean);

  return (
    <div className="dashboard-column">
      <h2 className="footer-title">Project dashboard</h2>
      {!isOwner && <p className="small-note">Member access</p>}
      {isOwner && (
        <>
          <form onSubmit={handleAddMember} className="dash-form">
            <label htmlFor="addMemberSelect">Add Member</label>
            <select id="addMemberSelect" value={memberId} onChange={e=>setMemberId(e.target.value)}>
              <option value="">-- choose friend --</option>
              {availableUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <button type="submit" disabled={!memberId}>Add</button>
          </form>
          <form onSubmit={handleTransfer} className="dash-form">
            <label htmlFor="transferOwnerSelect">Transfer Ownership</label>
            <select id="transferOwnerSelect" value={newOwnerId} onChange={e=>setNewOwnerId(e.target.value)}>
              <option value="">-- select member --</option>
              {memberUsers.filter(m=>m.id!==project.ownerId).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <button type="submit" disabled={!newOwnerId}>Transfer</button>
          </form>
          <button className="danger-btn" onClick={handleDelete}>Delete Project</button>
        </>
      )}
    </div>
  );
};

export default ProjectDashboard;