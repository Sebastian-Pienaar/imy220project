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
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-section-header">
          <h2 className="panel-section-title"></h2>
          {!isOwner && <span className="text-xs bg-neutral-700 text-neutral-300 px-2 py-1 rounded-full">Member Access</span>}
        </div>
        
        <div className="p-4 space-y-4">
          <div className="bg-neutral-800/40 border border-neutral-700 rounded-lg p-3">
            <h3 className="text-xs font-semibold text-neutral-400 mb-2 flex items-center gap-1.5">
              <span>📋</span>
              Project Details
            </h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Status:</span>
                <span className="text-white font-medium">{project.isAvailable ? '✅ Available' : '🔒 Checked Out'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Members:</span>
                <span className="text-white font-medium">{memberUsers.length}</span>
              </div>
            </div>
          </div>

          {isOwner && (
            <>
              {/* Add Member*/}
              <div className="bg-neutral-800/40 border border-neutral-700 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-neutral-400 mb-3 flex items-center gap-1.5">
                  <span>👥</span>
                  Add Member
                </h3>
                <form onSubmit={handleAddMember} className="space-y-2">
                  <select 
                    id="addMemberSelect" 
                    value={memberId} 
                    onChange={e=>setMemberId(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  >
                    <option value="">-- Choose a user --</option>
                    {availableUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                  <button 
                    type="submit" 
                    disabled={!memberId}
                    className="w-full px-3 py-2 bg-accent hover:bg-accent/90 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-xs"
                  >
                    Add
                  </button>
                </form>
              </div>

              {/* Transfer Ownership */}
              <div className="bg-neutral-800/40 border border-neutral-700 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-neutral-400 mb-3 flex items-center gap-1.5">
                  <span>🔄</span>
                  Transfer Ownership
                </h3>
                <form onSubmit={handleTransfer} className="space-y-2">
                  <select 
                    id="transferOwnerSelect" 
                    value={newOwnerId} 
                    onChange={e=>setNewOwnerId(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  >
                    <option value="">-- Select a member --</option>
                    {memberUsers.filter(m=>m.id!==project.ownerId).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                  <button 
                    type="submit" 
                    disabled={!newOwnerId}
                    className="w-full px-3 py-2 bg-accent hover:bg-accent/90 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-xs"
                  >
                    Transfer
                  </button>
                </form>
              </div>

              {/* Delete Project*/}
              <div className="bg-red-900/10 border border-red-800/50 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1.5">
                  Danger Zone
                </h3>
                <button 
                  onClick={handleDelete}
                  className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors text-xs"
                >
                  Delete Project
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;