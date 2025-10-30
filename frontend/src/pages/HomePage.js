
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

import Navbar from '../components/Navbar';
import ProjectFeed from '../components/ProjectFeed';
import ActivityFeed from '../components/ActivityFeed';
import Modal from '../components/Modal';
import CreateProject from '../components/CreateProject';
import GlobalSearch from '../components/GlobalSearch';
import { useProjects } from '../context/ProjectsContext';




const HomePage = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { projects, currentUserId, friendships, globalActivity, loading, loadError, users, acceptFriendRequest } = useProjects();

 
  const pendingRequests = useMemo(() => {
    return friendships
      .filter(f => f.status === 'pending' && f.recipientId === currentUserId)
      .map(f => {
        const requester = users.find(u => u.id === f.requesterId);
        return { ...f, requester };
      })
      .filter(r => r.requester);
  }, [friendships, currentUserId, users]);


  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const activeCheckouts = projects.filter(p => !p.isAvailable).length;
    const myCheckouts = projects.filter(p => p.checkedOutBy === currentUserId).length;
    const friendCount = friendships.filter(f => f.status === 'accepted' && (f.requesterId === currentUserId || f.recipientId === currentUserId)).length;
    const uniqueTags = new Set(projects.flatMap(p => p.hashtags || []));
    const tagCount = uniqueTags.size;
    const messageCount = projects.reduce((acc,p) => acc + (Array.isArray(p.messages)? p.messages.length:0), 0); 
    const activityCount = globalActivity.length;
    return { totalProjects, activeCheckouts, myCheckouts, friendCount, tagCount, messageCount, activityCount };
  }, [projects, currentUserId, friendships, globalActivity]);

 
  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-ink flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="text-neutral-400">Loading your project hub...</p>
        </div>
      </div>
    );
  }


  if (loadError) {
    return (
      <div className="min-h-screen bg-bg text-ink flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md p-6">
          <div className="text-red-400 text-4xl">⚠️</div>
          <h2 className="text-xl font-heading font-semibold">Connection Failed</h2>
          <p className="text-neutral-400 text-sm">{loadError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      <Navbar />
      <main className="home-shell">
        {/*Hero Section */}
        <section className="home-hero">
          <div className="home-hero-header">
            <div className="home-hero-left">
              <h1 className="home-hero-title">Your Project Hub</h1>
              <p className="home-hero-sub">Track checkouts, collaborate with friends, explore activity across the platform, and spin up new ideas instantly.</p>
              <div className="home-action-bar">
                <button className="btn-primary new-project-btn" onClick={() => setIsCreateOpen(true)}>+ New Project</button>
              </div>
            </div>
          </div>
        </section>

        {/*Search  */}
        <div className="global-search-panel">
          <div className="panel-section-header">
            <h2 className="panel-section-title">Search Projects & Users</h2>
          </div>
          <div className="p-6">
            <GlobalSearch />
          </div>
        </div>

        {/* Main Grid.Projects left, Activity right */}
        <div className="home-grid">
          {/* Projects */}
          <div className="home-col-main">
            <div className="project-feed-panel">
              <div className="panel-section-header">
                <h2 className="panel-section-title">Projects</h2>
                <span className="text-xs text-neutral-500">Browse all projects</span>
              </div>
              <ProjectFeed />
            </div>
          </div>

          {/* Activity Feed & Friend Requests */}
          <div className="home-col-side">
            {pendingRequests.length > 0 && (
              <div className="panel mb-6">
                <div className="panel-section-header">
                  <h2 className="panel-section-title">Friend Requests</h2>
                  <span className="text-xs bg-accent text-white px-2 py-1 rounded-full">{pendingRequests.length}</span>
                </div>
                <div className="p-4 space-y-3">
                  {pendingRequests.map(request => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                      <Link to={`/profile/${request.requester.id}`} className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold">
                          {request.requester.profileImage ? (
                            <img src={request.requester.profileImage} alt={request.requester.name} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            request.requester.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{request.requester.name}</p>
                          <p className="text-neutral-400 text-xs">@{request.requester.username || request.requester.id}</p>
                        </div>
                      </Link>
                      <button
                        onClick={() => acceptFriendRequest(request.requesterId)}
                        className="btn-primary text-xs px-3 py-1"
                      >
                        Accept
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="activity-panel">
              <div className="panel-section-header">
                <h2 className="panel-section-title">Recent Activity</h2>
                <span className="text-xs text-neutral-500">Latest updates</span>
              </div>
              <ActivityFeed />
            </div>
          </div>
        </div>
      </main>
      
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Project"
      >
        <CreateProject onCreated={() => setIsCreateOpen(false)} />
      </Modal>
    </div>
  );
};


export default HomePage;