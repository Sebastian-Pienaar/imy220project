//ProjectPage.js
import React from 'react';


import './ProjectPage.css';


import Navbar from '../components/Navbar';
import ProjectDetail from '../components/ProjectDetail';
import Messages from '../components/Messages';
import ProjectDashboard from '../components/ProjectDashboard';
import MembersList from '../components/MembersList';

const ProjectPage = () => {

  const project = {
    name: 'PROJECT_NAME',
    image: 'project image',
    description: 'project description',
  };

  return (
    <div className="project-page">
      <Navbar />
      <main className="project-page-container">
        <article className="project-card">
          <header>
            <p className="checkout-banner">You are currently checking out</p>
            <div className="project-header">
              <h1>{project.name}</h1>
            </div>
          </header>

          <ProjectDetail imageName={project.image} description={project.description} />
          
          <Messages />
          
          <footer className="project-footer-grid">
            <ProjectDashboard />
            <MembersList />
          </footer>

        </article>
      </main>
    </div>
  );
};

export default ProjectPage;