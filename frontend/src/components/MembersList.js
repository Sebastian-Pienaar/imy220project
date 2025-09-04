import React from 'react';

//Dummy
const members = [
    { id: 1, name: 'John Doe', isOwner: true },
    { id: 2, name: 'Stacy Clarke', isOwner: false },
    { id: 3, name: 'Josh Smith', isOwner: false },
];

const MembersList = () => {
  return (
    <div className="members-column">
      <h2 className="footer-title">Current members</h2>
      <ul className="members-list">
        {members.map(member => (
          <li key={member.id}>
            {member.isOwner ? (
              <span className="owner-star">☆</span>
            ) : (
              <span>•</span>
            )}
            {' '}{member.name}{member.isOwner && ' (OWNER)'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MembersList;