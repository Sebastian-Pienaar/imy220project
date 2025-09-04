import React from 'react';

const ProjectPreview = ({ joinDate, isAvailable }) => {
  return (
    <article className="preview-card">
      <div className="project-image">project image</div>
      <div className="card-details">
        <div className="card-status">
          <span>you joined on {joinDate}</span>
          <span className="checkout-status">
            {isAvailable ? '✅' : '🚫'}
            {isAvailable ? 'available for checkout' : 'unavailable for checkout'}
          </span>
        </div>
      </div>
    </article>
  );
};

export default ProjectPreview;