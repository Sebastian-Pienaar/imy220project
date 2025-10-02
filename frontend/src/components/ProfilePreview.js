import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * ProfilePreview: compact representation of a user for followers/following/search results.
 * Props:
 *  - user: { id, name, bio?, avatar? }
 *  - onSelect?: callback(user)
 *  - showFollow?: boolean (default true)
 */
const ProfilePreview = ({ user, onSelect, showFollow = true }) => {
  const [isFollowing, setIsFollowing] = useState(user?.isFollowing || false);
  if (!user) return null;
  const initial = (user.name || '?').charAt(0).toUpperCase();
  const handleFollow = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsFollowing(f => !f); // stub toggle only
  };
  return (
    <Link
      to={`/profile/${user.id}`}
      className="profile-preview"
      onClick={() => onSelect?.(user)}
      aria-label={`Open profile for ${user.name}`}
    >
      <div className="profile-preview-avatar" aria-hidden="true">{initial}</div>
      <div className="profile-preview-meta">
        <span className="profile-preview-name">{user.name}</span>
        <span className="profile-preview-id">@{user.id}</span>
        {user.bio && <span className="profile-preview-bio">{user.bio.slice(0, 60)}{user.bio.length > 60 ? '…' : ''}</span>}
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
