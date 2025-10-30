import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProjects } from '../context/ProjectsContext';
import Navbar from '../components/Navbar';
import Messages from '../components/Messages';
import ProjectDashboard from '../components/ProjectDashboard';
import MembersList from '../components/MembersList';
import EditProjectForm from '../components/EditProjectForm';
import Files from '../components/Files';
import Toast from '../components/Toast';
import Hashtag from '../components/Hashtag';


const ProjectPage = () => {
  const { projectId } = useParams();
  const { projects, checkoutProject, returnProject, currentUserId, addMember, removeMember, deleteProject, updateProjectDetails, isAdmin } = useProjects();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [enlarge, setEnlarge] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  

  const project = projects.find(p => p.id === projectId || p._id === projectId);
  
  if (!project) {
    return (
      <div className="min-h-screen bg-bg text-ink">
        <Navbar />
        <main className="project-shell">
          <div className="text-center py-12">
            <h1 className="text-2xl font-heading font-semibold text-neutral-400">Project not found</h1>
            <p className="text-neutral-500 mt-2">The project you're looking for doesn't exist or has been deleted.</p>
          </div>
        </main>
      </div>
    );
  }

  const isCheckedOutByUser = project.checkedOutBy === currentUserId;
  const isOwner = project.ownerId === currentUserId;
  const isMember = (project.members || []).includes(currentUserId);
  const canEdit = isOwner || isAdmin; //Owner or admin can edit
  const canDelete = isOwner || isAdmin; //Owner or admin can delete
  const createdDate = project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '—';

  const handlePrimaryAction = () => {
    if (project.isAvailable) {
      checkoutProject(project.id);
      setToastMessage('Project checked out.');
      setShowToast(true);
    } else if (isCheckedOutByUser) {
      returnProject(project.id);
      setToastMessage('Project returned.');
      setShowToast(true);
    }
  };


  const handleMembershipToggle = async () => {
    if (isMember) {
      await removeMember(project.id, currentUserId);
      setToastMessage('Left project.');
      setShowToast(true);
    } else {
      await addMember(project.id, currentUserId);
      setToastMessage('Joined project!');
      setShowToast(true);
    }
  };



  const handleUpdateProject = async (updates) => {
    try {
      await updateProjectDetails(project.id, updates);
      setToastMessage('Project updated successfully!');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Failed to update project.');
      setShowToast(true);
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"? This will remove all associated data including activity and files.`)) {
      try {
        await deleteProject(project.id);
        setToastMessage('Project deleted.');
        setShowToast(true);
        setTimeout(() => {
          window.location.href = '/home';
        }, 1500);
      } catch (error) {
        setToastMessage('Failed to delete project.');
        setShowToast(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink">
      <Navbar />
      <main className="project-shell">
        {/* Hero */}
        <section className="project-hero">
          <div className="project-media" onClick={() => setEnlarge(true)} role="button" tabIndex={0}>
            {project.image ? <img src={project.image} alt={project.name} /> : 'project image'}
          </div>
          <div className="project-meta">
            <h1 className="project-title">{project.name}</h1>
            <div className="project-meta-row">
              <span className="meta-pill">Type: {project.type || 'n/a'}</span>
              <span className="meta-pill">Version: {project.version || '1.0.0'}</span>
              <span className="meta-pill">Created: {createdDate}</span>
            </div>
            {project.hashtags && project.hashtags.length > 0 && (
              <div className="project-hashtags-row">
                {project.hashtags.map(tag => <Hashtag key={tag} tag={tag} />)}
              </div>
            )}
            <div className="project-actions">
              <button
                className="btn-primary project-checkout-btn"
                disabled={!project.isAvailable && !isCheckedOutByUser}
                onClick={handlePrimaryAction}
              >
                {project.isAvailable ? 'Check Out Project' : (isCheckedOutByUser ? 'Return Project' : 'Unavailable')}
              </button>
              {!isOwner && !isAdmin && (
                <button
                  className={isMember ? "btn-outline project-checkout-btn ml-2" : "btn-primary project-checkout-btn ml-2"}
                  onClick={handleMembershipToggle}
                >
                  {isMember ? 'Leave Project' : 'Join Project'}
                </button>
              )}
              {canEdit && (
                <>
                  <button
                    className="btn-outline project-checkout-btn ml-2"
                    onClick={() => setShowEditForm(!showEditForm)}
                  >
                    {showEditForm ? 'Cancel Edit' : 'Edit Project'}
                  </button>
                  <button
                    className="btn-outline project-checkout-btn ml-2 text-[#ff6b6b] border-[#ff6b6b]"
                    onClick={handleDeleteProject}
                  >
                    Delete Project
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Body Grid */}
        <div className="project-body-grid">
          <div className="project-col-main">
            {showEditForm && canEdit && (
              <div className="mb-5">
                <EditProjectForm 
                  project={project} 
                  onClose={() => setShowEditForm(false)}
                  onSave={handleUpdateProject}
                />
              </div>
            )}
            
            <div className="project-description-box">
              <div className="panel-header"><h2 className="panel-title">Description</h2></div>
              <div className="project-description-text">{project.description}</div>
            </div>

            <div className="activity-log-modern">
              <div className="panel-header"><h3 className="panel-title">Activity Log</h3></div>
              {project.activity && project.activity.length ? (
                <ul className="activity-log-list">
                  {project.activity.map(a => (
                    <li key={a.id} className={`activity-log-item type-${a.type}`}>
                      <span className="log-time">{new Date(a.ts).toLocaleTimeString()}</span>
                      <span className="log-type">{a.type}</span>
                      <span className="log-msg">{a.message}</span>
                      {a.version && <span className="log-version">v{a.version}</span>}
                    </li>
                  ))}
                </ul>
              ) : <p className="feed-empty">No activity yet.</p>}
            </div>

            <div className="messages-panel">
              <div className="panel-header"><h3 className="panel-title">Messages</h3></div>
              <Messages />
            </div>
          </div>
          <div className="project-col-side">
            <div className="dashboard-panel">
              <div className="panel-header"><h3 className="panel-title">Dashboard</h3></div>
              <ProjectDashboard projectId={projectId} />
            </div>
            <div className="members-panel">
              <div className="panel-header"><h3 className="panel-title">Members</h3></div>
              <MembersList projectId={project.id} />
            </div>
            <div className="files-panel">
              <div className="panel-header"><h3 className="panel-title">Files</h3></div>
              <Files projectId={project.id} />
            </div>
          </div>
        </div>
      </main>
      {enlarge && project.image && (
        <div className="image-lightbox" role="dialog" aria-label="Full size project image" onClick={() => setEnlarge(false)}>
          <img src={project.image} alt={project.name} />
        </div>
      )}
      <Toast
        isVisible={showToast}
        message={toastMessage}
        variant="success"
        onDismiss={() => setShowToast(false)}
      />
    </div>
  );
};

export default ProjectPage;