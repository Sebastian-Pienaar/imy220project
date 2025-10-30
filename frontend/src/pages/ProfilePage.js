
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectsContext';
import EditProfileForm from '../components/EditProfileForm';
import CreateProject from '../components/CreateProject';
import TagCloud from '../components/TagCloud';
import UserActivity from '../components/UserActivity';



const ProfilePage = () => {
  const { profileId } = useParams();
  const { users, currentUserId, updateUser, isFriends, hasPendingRequest, sendFriendRequest, acceptFriendRequest, unfriend, friendships, projects, logout } = useProjects();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [fetchedUser, setFetchedUser] = useState(null);
  const isSlug = profileId && /[a-zA-Z]/.test(profileId) && profileId.length < 64;

  let profileUser = users.find(u => u.id === profileId);
  if (!profileUser && isSlug) {
    profileUser = users.find(u => (u.username || '').toLowerCase() === profileId.toLowerCase());
  }
  if (!profileUser) profileUser = users.find(u => u.id === currentUserId);

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
  const memberProjects = ownedProjects;

  const friendState = useMemo(() => {
    if (!profileUser || isOwn) return null;
    if (isFriends(currentUserId, profileUser.id)) return 'friends';
    if (hasPendingRequest(currentUserId, profileUser.id)) return 'request-sent';
    if (hasPendingRequest(profileUser.id, currentUserId)) return 'request-received';
    return 'none';
  }, [profileUser, isOwn, isFriends, hasPendingRequest, currentUserId]);

  const userFriends = useMemo(() => {
    if (!profileUser) return [];
    return friendships
      .filter(f => f.status === 'accepted' && (f.requesterId === profileUser.id || f.recipientId === profileUser.id))
      .map(f => {
        const friendId = f.requesterId === profileUser.id ? f.recipientId : f.requesterId;
        return users.find(u => u.id === friendId);
      })
      .filter(Boolean); 
  }, [profileUser, friendships, users]);

  const handleFriendAction = () => {
    if (!profileUser || isOwn) return;
    if (friendState === 'none') sendFriendRequest(profileUser.id);
    if (friendState === 'request-received') acceptFriendRequest(profileUser.id);
    if (friendState === 'friends') {
      if (window.confirm(`Are you sure you want to unfriend ${profileUser.name}?`)) {
        unfriend(profileUser.id);
      }
    }
  };

  if (!profileUser) return <main className="profile-shell"><p className="empty-soft">User not found.</p></main>;

  const friendButtonLabel = {
    friends: 'Unfriend',
    'request-sent': 'Request Sent',
    'request-received': 'Accept Request',
    none: 'Add Friend'
  }[friendState] || '';

  const friendBtnDisabled = friendState === 'request-sent';


  const canViewFullProfile = isOwn || friendState === 'friends';

  return (
    <main className="profile-shell">
      {/* Hero Section */}
      <section className="profile-hero">
        <div className="avatar-ring" aria-label="User avatar">
          {profileUser.profileImage ? (
            <img 
              src={profileUser.profileImage} 
              alt={`${profileUser.name}'s profile`}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            profileUser.name.charAt(0)
          )}
        </div>
        <div className="profile-meta">
          <div className="flex items-start gap-4 flex-wrap">
            <h1 className="profile-name">{profileUser.name}</h1>
            {isOwn && <span className="friend-badge">you</span>}
          </div>

          <div className="profile-stat-grid">
            <div className="stat-card"><span className="stat-label">Projects Owned</span><span className="stat-value">{ownedProjects.length}</span></div>
            <div className="stat-card"><span className="stat-label">Friends</span><span className="stat-value">{friendships.filter(f => f.status === 'accepted' && (f.requesterId === profileUser.id || f.recipientId === profileUser.id)).length}</span></div>
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

      {!canViewFullProfile && (
        <div className="panel max-w-2xl mx-auto mt-8">
          <div className="panel-header">
            <h2 className="panel-title">🔒 Private Profile</h2>
          </div>
          <div className="p-6 text-center">
            <p className="text-neutral-300 mb-4">
              This profile is private. Become friends with <strong>{profileUser.name}</strong> to view their full profile, projects, and activity.
            </p>
            {friendState === 'none' && (
              <button 
                className="btn-primary"
                onClick={handleFriendAction}
              >
                Send Friend Request
              </button>
            )}
            {friendState === 'request-sent' && (
              <p className="text-neutral-400 text-sm">Friend request pending...</p>
            )}
            {friendState === 'request-received' && (
              <button 
                className="btn-primary"
                onClick={handleFriendAction}
              >
                Accept Friend Request
              </button>
            )}
          </div>
        </div>
      )}

      {canViewFullProfile && (
      <div className="profile-grid">
        {/* Left column */}
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
            <div className="panel-header">
              <h2 className="panel-title">Connections</h2>
              <span className="text-neutral-400 text-xs">({userFriends.length} friends)</span>
            </div>
            {userFriends.length > 0 ? (
              <div className="space-y-2">
                {userFriends.map(friend => (
                  <Link 
                    key={friend.id} 
                    to={`/profile/${friend.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold flex-shrink-0">
                      {friend.profileImage ? (
                        <img 
                          src={friend.profileImage} 
                          alt={friend.name} 
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-lg">{friend.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{friend.name}</p>
                      <p className="text-neutral-400 text-xs truncate">@{friend.username || friend.id}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-neutral-400 text-sm">No friends yet.</p>
            )}
          </div>
          {isOwn && (
            <div className="panel">
              <div className="panel-header"><h2 className="panel-title">Create Project</h2></div>
              <CreateProject />
            </div>
          )}
        </div>

        {/*Right column */}
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
              <div className="panel-header">
                <h2 className="panel-title">Recent Activity</h2>
                <span className="text-xs text-neutral-500">Latest updates</span>
              </div>
              <UserActivity userId={profileUser.id} />
            </div>
        </div>
      </div>
      )}
    </main>
  );
};

export default ProfilePage;