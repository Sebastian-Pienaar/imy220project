import React from 'react';

//dummy
const interactions = [
    { id: 1, name: 'John doe', collaborations: 13 },
    { id: 2, name: 'James Smith', collaborations: 8 },
    { id: 3, name: 'Ethan Bradley', collaborations: 6 },
];

const UserInteractions = ({ userName }) => {
  return (
    <section className="activity-box">
      <h3>{userName} interacts most with...</h3>
      <ul className="activity-list">
        {interactions.map(friend => (
          <li key={friend.id}>
            <span className="list-icon">👤</span>
            <span>{friend.name} - {friend.collaborations} collaborations</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default UserInteractions;