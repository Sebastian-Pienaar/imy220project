import React from 'react';

//Dummy
const userInfo = {
    name: 'seb pienaar',
    role: 'student',
    university: 'University of Pretoria',
    location: 'Pretoria, ZA',
    email: 'seb@gmail.com',
    phone: '060 8432 984',
    dob: '2004/02/27',
    bugFixes: 24,
};

const UserProfileInfo = () => {
  return (
    <aside className="profile-info-column">
      <div className="profile-avatar-section">
        <span className="profile-avatar">👤</span>
        <button className="add-friend-btn">+</button>
      </div>

      <div className="profile-name-title">
        <h2>{userInfo.name}</h2>
        <p>{userInfo.role}</p>
      </div>

      <div className="user-details-box">
        <div className="detail-item"><span className="detail-icon">💼</span>{userInfo.university}</div>
        <div className="detail-item"><span className="detail-icon">📍</span>{userInfo.location}</div>
        <div className="detail-item"><span className="detail-icon">✉️</span>{userInfo.email}</div>
        <div className="detail-item"><span className="detail-icon">📞</span>{userInfo.phone}</div>
        <div className="detail-item"><span className="detail-icon">🎂</span>{userInfo.dob}</div>
        <button className="edit-info-btn">📝 edit info</button>
      </div>

      <div className="bug-fixes-counter">
        <span className="trophy-icon">🏆</span>
        <span>{userInfo.bugFixes} bug fixes</span>
      </div>
    </aside>
  );
};

export default UserProfileInfo;