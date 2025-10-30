import React from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectsContext';
import Hashtag from './Hashtag';

const ProjectPreview = ({ project }) => {
  if (!project) return null;
  const { users } = useProjects();
  const { id, _id, name, isAvailable, checkedOutBy, ownerId, hashtags = [], image } = project;
  const projectId = id || _id;
  const owner = users.find(u => u.id === ownerId || u._id === ownerId || u.mongoId === ownerId);
  return (
    <article className="preview-card" data-available={isAvailable} data-checkedout-by={checkedOutBy || ''}>
      <div className="project-image">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs text-neutral-500">project image</span>
        )}
      </div>
      <div className="card-details">
        <div className="card-info">
          <h3 className="text-lg font-semibold text-white mb-1">{name}</h3>
          {owner && (
            <p className="text-sm text-neutral-400">
              by <Link to={`/profile/${owner.id}`} className="owner-link hover:text-accent transition-colors">{owner.name}</Link>
            </p>
          )}
        </div>
        <div className="card-status">
          <span className="checkout-status">
            {isAvailable ? '✅ available' : `🔒 ${checkedOutBy}`}
          </span>
        </div>
        {hashtags.length > 0 && (
          <div className="hashtags-row">
            {hashtags.map(tag => <Hashtag key={tag} tag={tag} />)}
          </div>
        )}
        <div className="card-actions">
          <Link to={`/project/${projectId}`} className="small-btn">open</Link>
        </div>
      </div>
    </article>
  );
};

export default ProjectPreview;