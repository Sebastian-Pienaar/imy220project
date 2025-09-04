import React from 'react';
import ProjectPreview from './ProjectPreview';

//dummy
const userProjects = [
  { id: 1, joinDate: '25/08/04', isAvailable: true },
  { id: 2, joinDate: '25/08/04', isAvailable: true },
  { id: 3, joinDate: '25/08/04', isAvailable: false },
];

const CreateProjectButton = () => (
    <button className="create-project-btn">
        <span className="plus-icon">+</span> create new project
    </button>
);

const ProjectFeed = () => {
  return (
    <section className="feed-column">
      <CreateProjectButton />
      <div className="feed-header">
        <span className="sort-control">☰ SORT</span>
      </div>
      <div className="feed-content">
        <div className="feed-title">
          <h3>YOUR PROJECTS</h3>
          <p>Your current project. Let's squash some bugs!</p>
        </div>
        {userProjects.map(project => (
          <ProjectPreview
            key={project.id}
            joinDate={project.joinDate}
            isAvailable={project.isAvailable}
          />
        ))}
        <button className="more-btn">more</button>
      </div>
    </section>
  );
};

export default ProjectFeed;