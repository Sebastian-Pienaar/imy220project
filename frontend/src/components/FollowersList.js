import React from 'react';
import ProfilePreview from './ProfilePreview';

// Dummy follower data
const followers = [
  { id: 'seb-pienaar', name: 'Seb Pienaar', bio: 'React & collaboration focused dev.' },
  { id: 'jane-doe', name: 'Jane Doe', bio: 'Full-stack explorer. Loves refactoring.' },
  { id: 'john-smith', name: 'John Smith', bio: 'Chasing elusive race conditions.' },
  { id: 'emma-white', name: 'Emma White', bio: 'Pixel perfection + clean commits.' },
];

const FollowersList = ({ title = 'Followers' }) => {
  return (
    <section className="activity-box">
      <h3>{title}</h3>
      <ul className="profile-preview-list">
        {followers.map(user => (
          <li key={user.id} className="profile-preview-list-item">
            <ProfilePreview user={user} />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default FollowersList;
