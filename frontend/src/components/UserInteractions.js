import React from 'react';
import ProfilePreview from './ProfilePreview';

//dummy
const interactions = [
  { id: 'john-doe', name: 'John Doe', collaborations: 13, bio: 'Collab heavy contributor.' },
  { id: 'james-smith', name: 'James Smith', collaborations: 8, bio: 'Frequent reviewer.' },
  { id: 'ethan-bradley', name: 'Ethan Bradley', collaborations: 6, bio: 'Async PR responder.' },
];

const UserInteractions = ({ userName }) => {
  return (
    <section className="activity-box">
      <h3>{userName} interacts most with...</h3>
      <ul className="profile-preview-list">
        {interactions.map(friend => (
          <li key={friend.id} className="profile-preview-list-item">
            <ProfilePreview user={friend} showFollow={false} />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default UserInteractions;