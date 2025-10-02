//ProfilePage.js
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectsContext';

import EditProfileForm from '../components/EditProfileForm';
import CreateProject from '../components/CreateProject';
import UserProjects from '../components/UserProjects';
import UserInteractions from '../components/UserInteractions';
import FollowersList from '../components/FollowersList';
import TagCloud from '../components/TagCloud';
import UserActivity from '../components/UserActivity';

//import './ProfilePage.css';

const ProfilePage = () => {
  const { profileId } = useParams();
  const { users, currentUserId, updateUser, isFriends, hasPendingRequest, sendFriendRequest, acceptFriendRequest, friendships, projects, logout } = useProjects();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  // Resolve profile user by:
  // 1. Direct ID match
  // 2. Username (case-insensitive) if slug-like param
  // 3. Fallback to current user
  const [fetchedUser, setFetchedUser] = useState(null);
  const isSlug = profileId && /[a-zA-Z]/.test(profileId) && profileId.length < 64; // heuristic: ObjectId length 24

  let profileUser = users.find(u => u.id === profileId);
  if (!profileUser && isSlug) {
    profileUser = users.find(u => (u.username || '').toLowerCase() === profileId.toLowerCase());
  }
  if (!profileUser) profileUser = users.find(u => u.id === currentUserId);

  // On-demand fetch if still not found and we have a slug candidate
  useEffect(() => {
    if (!profileUser && isSlug && profileId) {
      fetch(`/api/users/by-username/${profileId}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setFetchedUser(data); });
    }
  }, [profileUser, isSlug, profileId]);

  if (!profileUser && fetchedUser) {
    profileUser = fetchedUser;
  }
  const isOwn = profileUser?.id === currentUserId;

  const ownedProjects = useMemo(() => projects.filter(p => p.ownerId === profileUser?.id), [projects, profileUser]);
  const memberProjects = ownedProjects; // placeholder: would include membership list when model extended

  const friendState = useMemo(() => {
    if (!profileUser || isOwn) return null;
    if (isFriends(currentUserId, profileUser.id)) return 'friends';
    if (hasPendingRequest(currentUserId, profileUser.id)) return 'request-sent';
    if (hasPendingRequest(profileUser.id, currentUserId)) return 'request-received';
    return 'none';
  }, [profileUser, isOwn, isFriends, hasPendingRequest, currentUserId]);

  const handleFriendAction = () => {
    if (!profileUser || isOwn) return;
    if (friendState === 'none') sendFriendRequest(profileUser.id);
    if (friendState === 'request-received') acceptFriendRequest(profileUser.id);
  };

  if (!profileUser) return <main className="profile-shell"><p className="empty-soft">User not found.</p></main>;

  const friendButtonLabel = {
    friends: '✓ Friends',
    'request-sent': 'Request Sent',
    'request-received': 'Accept Request',
    none: 'Add Friend'
  }[friendState] || '';

  const friendBtnDisabled = friendState === 'friends' || friendState === 'request-sent';

  return (
    <main className="profile-shell">
      {/* Hero Section */}
      <section className="profile-hero">
        <div className="avatar-ring" aria-label="User avatar">{profileUser.name.charAt(0)}</div>
        <div className="profile-meta">
          <div className="flex items-start gap-4 flex-wrap">
            <h1 className="profile-name">{profileUser.name}</h1>
            <span className="profile-role">{profileUser.role || 'Role not set'}</span>
            {isOwn && <span className="friend-badge">you</span>}
          </div>

          <div className="profile-stat-grid">
            <div className="stat-card"><span className="stat-label">Owned</span><span className="stat-value">{ownedProjects.length}</span></div>
            <div className="stat-card"><span className="stat-label">Friends</span><span className="stat-value">{friendships.filter(f => f.status === 'accepted' && (f.requesterId === profileUser.id || f.recipientId === profileUser.id)).length}</span></div>
            <div className="stat-card"><span className="stat-label">Activity</span><span className="stat-value">{(profileUser.activity?.length) || 0}</span></div>
          </div>

          <div className="action-bar">
            <Link to="/home" className="btn-outline">← Back</Link>
            {isOwn && (
              <>
                <button className="btn-outline" onClick={() => setEditing(e => !e)}>{editing ? 'Close Editor' : 'Edit Profile'}</button>
                <button className="btn-outline" onClick={() => { logout(); navigate('/'); }}>Logout</button>
              </>
            )}
            {!isOwn && friendState && (
              <button
                className={`btn-primary ${friendBtnDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={handleFriendAction}
                disabled={friendBtnDisabled}
              >{friendButtonLabel}</button>
            )}
          </div>
        </div>
      </section>

      {editing && (
        <div className="panel">
          <div className="panel-header"><h2 className="panel-title">Edit Profile</h2></div>
          <EditProfileForm currentUser={profileUser} onClose={() => setEditing(false)} />
        </div>
      )}

      <div className="profile-grid">
        {/* Left Column */}
        <div className="profile-col-left">
          <div className="panel">
            <div className="panel-header"><h2 className="panel-title">About</h2></div>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 text-sm text-neutral-300"><span>📍</span><span>{profileUser.location || 'Location not set'}</span></div>
              <div className="flex items-start gap-3 text-sm text-neutral-300"><span>🧾</span><span>{profileUser.bio || 'No bio yet.'}</span></div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-header"><h2 className="panel-title">Languages</h2></div>
            <div className="tag-cloud-modern">
              {(profileUser.languages || []).length ? (
                <TagCloud languages={profileUser.languages || []} />
              ) : <p className="empty-soft">No languages added.</p>}
            </div>
          </div>
          <div className="panel">
            <div className="panel-header"><h2 className="panel-title">Connections</h2></div>
            <p className="text-neutral-300 text-sm">{friendships.filter(f => f.status === 'accepted' && (f.requesterId === profileUser.id || f.recipientId === profileUser.id)).length} friends</p>
          </div>
          {isOwn && (
            <div className="panel">
              <div className="panel-header"><h2 className="panel-title">Create Project</h2></div>
              <CreateProject />
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="profile-col-right">
            <div className="panel">
              <div className="panel-header"><h2 className="panel-title">Owned Projects</h2></div>
              {ownedProjects.length ? (
                <ul className="project-pill-list">{ownedProjects.map(p => <li key={p.id} className="project-pill">{p.name}</li>)}</ul>
              ) : <p className="empty-soft">No owned projects.</p>}
            </div>
            <div className="panel">
              <div className="panel-header"><h2 className="panel-title">Member Projects</h2></div>
              {memberProjects.length ? (
                <ul className="project-pill-list">{memberProjects.map(p => <li key={p.id} className="project-pill">{p.name}</li>)}</ul>
              ) : <p className="empty-soft">No member projects.</p>}
            </div>
            <div className="panel">
              <div className="panel-header"><h2 className="panel-title">Recent Activity</h2></div>
              <UserActivity userId={profileUser.id} />
            </div>
            <div className="panel">
              <div className="panel-header"><h2 className="panel-title">Interactions</h2></div>
              <UserInteractions userName={profileUser.name} />
            </div>
            <div className="panel">
              <div className="panel-header"><h2 className="panel-title">Followers</h2></div>
              <FollowersList />
            </div>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;