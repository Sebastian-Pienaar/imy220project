import React, { useState } from 'react';
import { Link } from 'react-router-dom';


const ProfilePreview = ({ user, onSelect, showFollow = true }) => {
  const [isFollowing, setIsFollowing] = useState(user?.isFollowing || false);
  if (!user) return null;
  const handleFollow = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsFollowing(f => !f); 
  };
  return (
    <Link
      to={`/profile/${user.id}`}
      className="profile-preview"
      onClick={() => onSelect?.(user)}
      aria-label={`Open profile for ${user.name}`}
    >
      <div className="profile-preview-meta">
        <span className="profile-preview-name">{user.name}</span>
      </div>
      {showFollow && (
        <button
          type="button"
            className={`follow-btn ${isFollowing ? 'following' : ''}`}
          onClick={handleFollow}
          aria-pressed={isFollowing}
          aria-label={isFollowing ? `Unfollow ${user.name}` : `Follow ${user.name}`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      )}
    </Link>
  );
};

export default ProfilePreview;
