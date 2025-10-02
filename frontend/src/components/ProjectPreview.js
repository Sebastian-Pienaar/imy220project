import React from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectsContext';
import ProfilePopover from './ProfilePopover';
import Hashtag from './Hashtag';

const ProjectPreview = ({ project }) => {
  if (!project) return null;
  const { users } = useProjects();
  const { id, _id, name, joinDate, isAvailable, checkedOutBy, ownerId, hashtags = [], type, version } = project;
  const projectId = id || _id; // Handle both MongoDB ObjectId and regular ID
  const owner = users.find(u => u.id === ownerId || u._id === ownerId || u.mongoId === ownerId);
  return (
    <article className="preview-card" data-available={isAvailable} data-checkedout-by={checkedOutBy || ''}>
      <div className="project-image">project image</div>
      <div className="card-details">
        <div className="card-status">
          <span>
            {name} • {type} v{version} • joined {joinDate} {owner && (
              <>
                • <ProfilePopover user={owner}><button type="button" className="owner-link" aria-label={`View owner ${owner.name}`}>{owner.name}</button></ProfilePopover>
              </>
            )}
          </span>
          <span className="checkout-status">
            {isAvailable ? '✅ available' : `🔒 by ${checkedOutBy}`}
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