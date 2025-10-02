//HomePage.js
import React, { useState, useMemo } from 'react';


import Navbar from '../components/Navbar';
import ProjectFeed from '../components/ProjectFeed';
import ActivityFeed from '../components/ActivityFeed';
import Modal from '../components/Modal';
import CreateProject from '../components/CreateProject';
import GlobalSearch from '../components/GlobalSearch';
import { useProjects } from '../context/ProjectsContext';


//import './HomePage.css';


const HomePage = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { projects, currentUserId, friendships, globalActivity, loading, loadError } = useProjects();

  // Derived stats
  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const activeCheckouts = projects.filter(p => !p.isAvailable).length;
    const myCheckouts = projects.filter(p => p.checkedOutBy === currentUserId).length;
    const friendCount = friendships.filter(f => f.status === 'accepted' && (f.requesterId === currentUserId || f.recipientId === currentUserId)).length;
    const uniqueTags = new Set(projects.flatMap(p => p.hashtags || []));
    const tagCount = uniqueTags.size;
    const messageCount = projects.reduce((acc,p) => acc + (Array.isArray(p.messages)? p.messages.length:0), 0); // if messages stored per project later
    const activityCount = globalActivity.length; // total events
    return { totalProjects, activeCheckouts, myCheckouts, friendCount, tagCount, messageCount, activityCount };
  }, [projects, currentUserId, friendships, globalActivity]);

  // Show loading state
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

  // Show error state
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
        {/* Hero Section */}
        <section className="home-hero">
          <div className="home-hero-header">
            <div className="home-hero-left">
              <h1 className="home-hero-title">Your Project Hub</h1>
              <p className="home-hero-sub">Track checkouts, collaborate with friends, explore activity across the platform, and spin up new ideas instantly.</p>
              <div className="home-action-bar">
                <button className="btn-primary new-project-btn" onClick={() => setIsCreateOpen(true)}>+ New Project</button>
              </div>
              <div className="home-stat-row">
                <div className="home-stat"><span className="home-stat-label">Projects</span><span className="home-stat-value">{stats.totalProjects}</span></div>
                <div className="home-stat"><span className="home-stat-label">Checkouts</span><span className="home-stat-value">{stats.activeCheckouts}</span></div>
                <div className="home-stat"><span className="home-stat-label">My Checked Out</span><span className="home-stat-value">{stats.myCheckouts}</span></div>
                <div className="home-stat hidden sm:flex"><span className="home-stat-label">Friends</span><span className="home-stat-value">{stats.friendCount}</span></div>
                <div className="home-stat hidden sm:flex"><span className="home-stat-label">Tags</span><span className="home-stat-value">{stats.tagCount}</span></div>
                <div className="home-stat hidden sm:flex"><span className="home-stat-label">Activity</span><span className="home-stat-value">{stats.activityCount}</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Grid */}
        <div className="home-grid">
          <div className="home-col-main">
            <div className="project-feed-panel">
              <div className="panel-section-header"><h2 className="panel-section-title">Projects</h2></div>
              <ProjectFeed />
            </div>

            <div className="activity-panel">
              <div className="panel-section-header"><h2 className="panel-section-title">Recent Activity</h2></div>
              <ActivityFeed />
            </div>
          </div>
          <div className="home-col-side">
            <div className="global-search-panel">
              <div className="panel-section-header"><h2 className="panel-section-title">Global Search</h2></div>
              <div className="p-6">
                <GlobalSearch />
              </div>
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