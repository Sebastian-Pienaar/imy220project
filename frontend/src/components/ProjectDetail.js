import React from 'react';

const ProjectDetail = ({ imageName, description }) => {
  return (
    <section className="project-details-grid">
      <div className="project-image-large">{imageName}</div>
      <div className="project-description">{description}</div>
    </section>
  );
};

export default ProjectDetail;