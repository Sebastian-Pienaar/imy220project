import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import apiClient, { setAuthToken as applyAuthToken } from '../api/client';

const ProjectsContext = createContext(null);

const initialProjects = [];
const initialUsers = [];
const initialFriendActivity = [];
const initialGlobalActivity = [];

export const ProjectsProvider = ({ currentUserId: providedCurrentUserId, children }) => {
  const [projects, setProjects] = useState(() => initialProjects);
  const [activeHashtag, setActiveHashtag] = useState(null);
  const [users, setUsers] = useState(() => initialUsers);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [friendActivity, setFriendActivity] = useState(initialFriendActivity);
  const [globalActivity, setGlobalActivity] = useState(initialGlobalActivity);
  const storedAuthUser = (() => { try { return JSON.parse(localStorage.getItem('authUser')); } catch { return null; } })();
  const [authToken, setAuthTokenState] = useState(() => localStorage.getItem('authToken'));
  const [authUser, setAuthUser] = useState(() => storedAuthUser);
  const [currentUserId, setCurrentUserId] = useState(() => localStorage.getItem('currentUserId') || storedAuthUser?.username || providedCurrentUserId || null);

  useEffect(() => { if (authToken) applyAuthToken(authToken); }, [authToken]);

  const [friendships, setFriendships] = useState(() => {
    const stored = localStorage.getItem('friendships');
    if (stored) { try { return JSON.parse(stored); } catch { /* ignore */ } }
    return [];
  });
  const [friendRequests, setFriendRequests] = useState(() => {
    const stored = localStorage.getItem('friendRequests');
    if (stored) { try { return JSON.parse(stored); } catch { /* ignore */ } }
    return [];
  });

  // Bootstrap: Load all app data from backend on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true); setLoadError(null);
      console.log('[ProjectsContext] Starting bootstrap...');
      try {
        const data = await apiClient.fetchBootstrap();
        console.log('[ProjectsContext] Bootstrap data received:', { 
          usersCount: data.users?.length, 
          projectsCount: data.projects?.length,
          friendshipsCount: data.friendships?.length 
        });
        if (!cancelled) {
          if (Array.isArray(data.users)) {
            const mappedUsers = data.users.map(u => ({
              ...u,
              mongoId: u._id,
              id: u.username || u._id,
            }));
            setUsers(mappedUsers);
            const userByMongo = Object.fromEntries(mappedUsers.map(u => [u.mongoId, u]));

            if (Array.isArray(data.projects)) {
              const mappedProjects = data.projects.map(p => {
                const activity = (p.activity || []).map(a => ({
                  ...a,
                  id: a._id || ('act-' + Math.random().toString(36).slice(2)),
                  type: a.type || 'checkin',
                  userId: userByMongo[a.userId]?.id || a.userId,
                  ts: a.createdAt ? new Date(a.createdAt).getTime() : Date.now()
                }));
                return {
                  ...p,
                  id: p._id,
                  ownerMongoId: p.ownerId,
                  ownerId: userByMongo[p.ownerId]?.id || p.ownerId,
                  memberMongoIds: p.members || [],
                  members: (p.members || []).map(m => userByMongo[m]?.id || m),
                  checkedOutBy: p.checkedOutBy ? (userByMongo[p.checkedOutBy]?.id || p.checkedOutBy) : null,
                  hashtags: p.hashtags || [],
                  activity
                };
              });
              setProjects(mappedProjects);
            }
            if (Array.isArray(data.friendships)) {
              setFriendships(data.friendships.map(f => ({
                id: f._id,
                requesterMongoId: f.requesterId,
                recipientMongoId: f.recipientId,
                requesterId: userByMongo[f.requesterId]?.id || f.requesterId,
                recipientId: userByMongo[f.recipientId]?.id || f.recipientId,
                status: f.status
              })));
            }
          } else if (Array.isArray(data.projects)) {
            setProjects(data.projects.map(p => ({ ...p, id: p._id, hashtags: p.hashtags||[], members: p.members||[], activity: p.activity||[] })));
          }
        }
      } catch (e) {
        if (!cancelled) {
          console.error('[ProjectsContext] Bootstrap failed:', e);
          setLoadError(`Failed to load app data: ${e.message}`);
          
          if (window.confirm('Failed to connect to the server. Would you like to retry?')) {
            setTimeout(() => {
              if (!cancelled) {
                console.log('[ProjectsContext] Retrying bootstrap...');
                window.location.reload();
              }
            }, 1000);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          console.log('[ProjectsContext] Bootstrap complete');
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Persist state to localStorage
  useEffect(() => { localStorage.setItem('appUsers', JSON.stringify(users)); }, [users]);
  useEffect(() => { if (currentUserId) localStorage.setItem('currentUserId', currentUserId); }, [currentUserId]);
  useEffect(() => { if (authToken) localStorage.setItem('authToken', authToken); else localStorage.removeItem('authToken'); }, [authToken]);
  useEffect(() => { if (authUser) localStorage.setItem('authUser', JSON.stringify(authUser)); else localStorage.removeItem('authUser'); }, [authUser]);
  useEffect(() => { localStorage.setItem('friendships', JSON.stringify(friendships)); }, [friendships]);
  useEffect(() => { localStorage.setItem('friendRequests', JSON.stringify(friendRequests)); }, [friendRequests]);

  const checkoutProject = useCallback(async (projectId) => {
    const proj = projects.find(p => p.id === projectId);
    if (!proj || !proj.isAvailable) return;
    try {
      const updated = await apiClient.checkoutProjectApi(projectId, users.find(u=>u.id===currentUserId)?.mongoId || currentUserId);
      setProjects(prev => prev.map(p => p.id===projectId ? {
        ...p,
        isAvailable: updated.isAvailable,
        checkedOutBy: currentUserId,
        activity: [...p.activity, { id: 'act-' + Date.now(), type:'checkout', userId: currentUserId, ts: Date.now(), message:'Checked out project.' }]
      } : p));
    } catch(e){ console.warn('Checkout failed', e); }
  }, [projects, currentUserId, users]);

  const returnProject = useCallback(async (projectId) => {
    const proj = projects.find(p => p.id === projectId);
    if (!proj || proj.checkedOutBy !== currentUserId) return;
    try {
      const updated = await apiClient.returnProjectApi(projectId, users.find(u=>u.id===currentUserId)?.mongoId || currentUserId);
      setProjects(prev => prev.map(p => p.id===projectId ? {
        ...p,
        isAvailable: updated.isAvailable,
        checkedOutBy: null,
        activity: [...p.activity, { id: 'act-' + Date.now(), type:'return', userId: currentUserId, ts: Date.now(), message:'Returned project.' }]
      } : p));
    } catch(e){ console.warn('Return failed', e); }
  }, [projects, currentUserId, users]);

  const createProject = useCallback(async (name, description, { type='web-app', hashtags=[], files=[], image=null } = {}) => {
    try {
      const currentUser = users.find(u => u.id === currentUserId || u.username === currentUserId);
      const ownerMongoId = currentUser?.mongoId || authUser?.id || currentUserId;
      
      const payload = {
        name,
        description,
        ownerId: ownerMongoId,
        type,
        version: '1.0.0',
        hashtags,
        files: (files||[]).map(f => ({ name: f.name, size: f.size, mime: f.type })),
        image
      };
      const created = await apiClient.createProjectApi(payload);
      const mapped = {
        ...created,
        id: created._id,
        ownerMongoId: created.ownerId,
        ownerId: users.find(u=>u.mongoId===created.ownerId)?.id || created.ownerId,
        members: (created.members||[]).map(m => users.find(u=>u.mongoId===m)?.id || m),
        hashtags: created.hashtags||[],
        activity: (created.activity||[]).map(a => ({
          ...a,
          id: a._id || ('act-' + Math.random().toString(36).slice(2)),
          type: a.type || 'checkin',
          userId: users.find(u=>u.mongoId===a.userId)?.id || a.userId,
          ts: a.createdAt ? new Date(a.createdAt).getTime() : Date.now()
        }))
      };
      setProjects(prev => [mapped, ...prev]);
      return mapped;
    } catch(e){ console.warn('Create project failed', e); return null; }
  }, [currentUserId, users, authUser]);

  const bumpVersion = (ver) => {
    const parts = ver.split('.').map(n=>parseInt(n,10));
    if (parts.length!==3 || parts.some(isNaN)) return '1.0.0';
    parts[2] += 1;
    return parts.join('.');
  };

  const checkInProject = useCallback(async (projectId, { files=[], message='Checked in new changes.' } = {}) => {
    const proj = projects.find(p => p.id === projectId);
    if (!proj || proj.checkedOutBy !== currentUserId) return;
    const addedFiles = files.map(f => ({ name:f.name, size:f.size, mime:f.type }));
    const version = bumpVersion(proj.version);
    try {
      await apiClient.addCheckInApi(projectId, {
        message,
        version,
        addedFiles,
        userId: users.find(u=>u.id===currentUserId)?.mongoId || currentUserId
      });
      setProjects(prev => prev.map(p => p.id===projectId ? {
        ...p,
        isAvailable: true,
        checkedOutBy: null,
        version,
        files: [...p.files, ...addedFiles.map(f => ({ id: 'file-' + Date.now() + '-' + f.name, ...f }))],
        activity: [...p.activity, { id:'act-'+Date.now(), type:'checkin', userId: currentUserId, ts: Date.now(), message, addedFiles: addedFiles.map(f=>f.name), version }]
      } : p));
    } catch(e){ console.warn('Check-in failed', e); }
  }, [projects, currentUserId, users]);

  const addMember = useCallback(async (projectId, userId) => {
    const proj = projects.find(p=>p.id===projectId);
    if (!proj) return;
    if (proj.members.includes(userId)) return;
    try {
      const currentUser = users.find(u => u.id === currentUserId);
      const requesterMongoId = currentUser?.mongoId || authUser?.id || currentUserId;
      const userToAddMongoId = users.find(u=>u.id===userId)?.mongoId || userId;
      
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: userToAddMongoId,
          requesterId: requesterMongoId
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add member');
      }
      
      const updated = await response.json();
      setProjects(prev => prev.map(p => p.id===projectId ? {
        ...p,
        members: [...p.members, userId],
        memberMongoIds: updated.members
      } : p));
    } catch(e){ console.warn('Add member failed', e); }
  }, [projects, users, currentUserId, authUser]);

  const removeMember = useCallback(async (projectId, userId) => {
    const proj = projects.find(p=>p.id===projectId);
    if (!proj) return;
    try {
      const currentUser = users.find(u => u.id === currentUserId);
      const requesterMongoId = currentUser?.mongoId || authUser?.id || currentUserId;
      const userToRemoveMongoId = users.find(u=>u.id===userId)?.mongoId || userId;
      
      const response = await fetch(`/api/projects/${projectId}/members/${userToRemoveMongoId}?requesterId=${requesterMongoId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove member');
      }
      
      const updated = await response.json();
      setProjects(prev => prev.map(p => p.id===projectId ? {
        ...p,
        members: p.members.filter(m => m!==userId),
        memberMongoIds: updated.members
      } : p));
    } catch(e){ console.warn('Remove member failed', e); }
  }, [projects, users, currentUserId, authUser]);

  const transferOwnership = useCallback(async (projectId, newOwnerId) => {
    const proj = projects.find(p=>p.id===projectId);
    if (!proj) return;
    try {
      const newOwnerMongo = users.find(u=>u.id===newOwnerId)?.mongoId || newOwnerId;
      const ensureMembers = proj.memberMongoIds.includes(newOwnerMongo) ? proj.memberMongoIds : [...proj.memberMongoIds, newOwnerMongo];
      
      const currentUser = users.find(u => u.id === currentUserId);
      const currentUserMongoId = currentUser?.mongoId || authUser?.mongoId || currentUserId;
      
      const patch = { 
        ownerId: newOwnerMongo, 
        members: ensureMembers,
        userId: currentUserMongoId
      };
      const updated = await apiClient.updateProjectApi(projectId, patch);
      setProjects(prev => prev.map(p => p.id===projectId ? {
        ...p,
        ownerId: newOwnerId,
        ownerMongoId: updated.ownerId,
        members: ensureMembers.map(m => users.find(u=>u.mongoId===m)?.id || m),
        memberMongoIds: updated.members
      } : p));
    } catch(e){ console.warn('Transfer ownership failed', e); }
  }, [projects, users, currentUserId, authUser]);

  const deleteProject = useCallback(async (projectId) => {
    try {
      const currentUser = users.find(u => u.id === currentUserId);
      const userMongoId = currentUser?.mongoId || currentUserId;
      await apiClient.deleteProjectApi?.(projectId, userMongoId) || await fetch(`/api/projects/${projectId}?userId=${userMongoId}`, { method:'DELETE' });
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch(e){ console.warn('Delete project failed', e); }
  }, [currentUserId, users]);

  const updateProjectDetails = useCallback(async (projectId, updates) => {
    try {
      const currentUser = users.find(u => u.id === currentUserId);
      const userMongoId = currentUser?.mongoId || currentUserId;
      const updated = await apiClient.updateProjectApi(projectId, { ...updates, userId: userMongoId });
      setProjects(prev => prev.map(p => p.id === projectId ? {
        ...p,
        ...updates,
        hashtags: updates.hashtags || p.hashtags
      } : p));
      return updated;
    } catch(e){ 
      console.warn('Update project failed', e);
      throw e;
    }
  }, [currentUserId, users]);

  // Auth functions
  const login = useCallback(async (usernameOrEmail, password) => {
    const { token, user } = await apiClient.loginApi(usernameOrEmail, password);
    setAuthTokenState(token);
    const enrichedUser = {
      ...user,
      mongoId: user.id,
      username: user.username
    };
    setAuthUser(enrichedUser);
    setCurrentUserId(user.username);
    return enrichedUser;
  }, []);

  const signup = useCallback(async ({ username, name, email, password }) => {
    const { token, user } = await apiClient.signupApi({ username, name, email, password });
    setAuthTokenState(token);
    const enrichedUser = {
      ...user,
      mongoId: user.id,
      username: user.username
    };
    setAuthUser(enrichedUser);
    setCurrentUserId(user.username);
    
    const newUser = {
      ...user,
      mongoId: user.id,
      id: user.username || user.id,
      languages: user.languages || [],
      location: user.location || '',
      bio: user.bio || '',
      profileImage: user.profileImage || null
    };
    setUsers(prev => [...prev, newUser]);
    
    return enrichedUser;
  }, []);

  const logout = useCallback(() => {
    setAuthTokenState(null);
    setAuthUser(null);
    setCurrentUserId(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('currentUserId');
  }, []);

  const updateUser = useCallback(async (userId, patch) => {
    try {
      const user = users.find(u => u.id === userId);
      const mongoId = user?.mongoId || user?._id || userId;
      
      const currentUser = users.find(u => u.id === currentUserId);
      const currentUserMongoId = currentUser?.mongoId || authUser?.id || currentUserId;
      
      const response = await fetch(`/api/users/${mongoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...patch,
          requesterId: currentUserMongoId
        })
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(prev => prev.map(u => 
          u.id === userId 
            ? { ...u, ...patch, mongoId: updatedUser._id } 
            : u
        ));
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  }, [users, currentUserId, authUser]);

  // Friendship helpers
  const isFriends = useCallback((a,b) => friendships.some(f => f.status === 'accepted' && ((f.requesterId === a && f.recipientId === b) || (f.requesterId === b && f.recipientId === a))), [friendships]);
  const hasPendingRequest = useCallback((from,to) => friendships.some(f => f.status === 'pending' && f.requesterId === from && f.recipientId === to), [friendships]);
  const inboundRequest = useCallback((from,to) => friendships.some(f => f.status === 'pending' && f.requesterId === from && f.recipientId === to), [friendships]);
  const usernameToMongo = useCallback((uname) => users.find(u => u.id === uname)?.mongoId || uname, [users]);

  const sendFriendRequest = useCallback(async (targetId) => {
    if (targetId === currentUserId) return;
    if (isFriends(currentUserId, targetId) || hasPendingRequest(currentUserId, targetId)) return;
    const requesterMongo = usernameToMongo(currentUserId);
    const recipientMongo = usernameToMongo(targetId);
    try {
      const fr = await apiClient.createFriendRequestApi(requesterMongo, recipientMongo);
      setFriendships(prev => [...prev, {
        id: fr._id,
        requesterMongoId: fr.requesterId,
        recipientMongoId: fr.recipientId,
        requesterId: currentUserId,
        recipientId: targetId,
        status: fr.status
      }]);
    } catch(e){ console.warn('Friend request failed', e); }
  }, [currentUserId, isFriends, hasPendingRequest, usernameToMongo]);

  const acceptFriendRequest = useCallback(async (fromId) => {
    if (!inboundRequest(fromId, currentUserId)) return;
    const edge = friendships.find(f => f.requesterId === fromId && f.recipientId === currentUserId && f.status === 'pending');
    if (!edge) return;
    try {
      const updated = await apiClient.acceptFriendRequestApi(edge.id);
      if (updated) {
        setFriendships(prev => prev.map(f => f.id===edge.id ? { ...f, status:'accepted' } : f));
      }
    } catch(e){ console.warn('Accept friend failed', e); }
  }, [currentUserId, inboundRequest, friendships]);

  const unfriend = useCallback(async (friendId) => {
    const edge = friendships.find(f => 
      f.status === 'accepted' && 
      ((f.requesterId === currentUserId && f.recipientId === friendId) || 
       (f.requesterId === friendId && f.recipientId === currentUserId))
    );
    if (!edge) return;
    
    try {
      const response = await fetch(`/api/friendships/${edge.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok || response.status === 204) {
        setFriendships(prev => prev.filter(f => f.id !== edge.id));
      }
    } catch(e) { 
      console.warn('Unfriend failed', e); 
    }
  }, [currentUserId, friendships]);

  // Dynamic activity feeds: Generate LOCAL and GLOBAL feeds from project activities
  useEffect(() => {
    const memberProjects = projects.filter(p => 
      p.ownerId === currentUserId || (p.members || []).includes(currentUserId)
    );
    
    const localFeed = memberProjects.flatMap(p => {
      if (p.activity && p.activity.length > 0) {
        return p.activity.map(a => ({
          id: a.id || ('act-'+Math.random().toString(36).slice(2)),
          type: a.type || 'checkin',
          role: a.type || 'checkin',
          message: a.message || '',
          version: a.version,
          date: new Date(a.ts || Date.now()).toLocaleDateString('en-GB').replace(/\//g,'/'),
          userId: a.userId,
          projectId: p.id,
          projectName: p.name,
          projectImage: p.image,
          projectOwnerId: p.ownerId,
          memberCount: (p.members || []).length,
          ts: a.ts || Date.now()
        }));
      }
      return [];
    });
    localFeed.sort((a,b) => (b.ts||0) - (a.ts||0));
    setFriendActivity(localFeed);

    const globalFeed = projects.flatMap(p => {
      if (p.activity && p.activity.length > 0) {
        return p.activity.map(a => ({
          id: a.id || ('act-'+Math.random().toString(36).slice(2)),
          type: a.type || 'checkin',
          role: a.type || 'checkin',
          message: a.message || '',
          version: a.version,
          date: new Date(a.ts || Date.now()).toLocaleDateString('en-GB').replace(/\//g,'/'),
          userId: a.userId,
          projectId: p.id,
          projectName: p.name,
          projectImage: p.image,
          projectOwnerId: p.ownerId,
          memberCount: (p.members || []).length,
          ts: a.ts || Date.now()
        }));
      }
      return [];
    });
    globalFeed.sort((a,b) => (b.ts||0) - (a.ts||0));
    setGlobalActivity(globalFeed);
  }, [projects, currentUserId]);

  // Search functions
  const searchUsers = useCallback(async (query) => {
    const q = (query || '').trim();
    if (!q) return [];
    try {
      const raw = await apiClient.searchUsersApi(q);
      return raw.map(u => ({
        ...u,
        id: u.username || u._id,
        mongoId: u._id
      }));
    } catch(e){
      console.warn('User search failed', e);
      return [];
    }
  }, []);

  const searchCheckIns = useCallback(async (query) => {
    const q = (query || '').trim();
    if (!q) return [];
    try {
      const projectsMatched = await apiClient.searchCheckInsApi(q);
      const lower = q.toLowerCase();
      const results = [];
      projectsMatched.forEach(p => {
        const pTypeMatch = p.type && p.type.toLowerCase().includes(lower);
        const hashMatch = Array.isArray(p.hashtags) && p.hashtags.some(tag => tag.toLowerCase().includes(lower));
        (p.activity || []).forEach(a => {
          const msgMatch = a.message && a.message.toLowerCase().includes(lower);
          if (msgMatch || pTypeMatch || hashMatch) {
            results.push({
              projectId: p._id,
              projectName: p.name,
              version: a.version || p.version,
              message: a.message,
              hashtags: p.hashtags || [],
              projectType: p.type,
              ts: a.createdAt ? new Date(a.createdAt).getTime() : Date.now()
            });
          }
        });
      });
      results.sort((a,b) => b.ts - a.ts);
      return results;
    } catch(e){
      console.warn('Check-in search failed', e);
      return [];
    }
  }, []);

  const value = { 
    projects,
    activeHashtag,
    setActiveHashtag,
    users,
    friendActivity,
    globalActivity,
    checkoutProject,
    returnProject,
    createProject,
    checkInProject,
    addMember,
    removeMember,
    transferOwnership,
    deleteProject,
    updateProjectDetails,
    currentUserId,
    setCurrentUserId,
    updateUser,
    friendships,
    friendRequests,
    isFriends,
    hasPendingRequest,
    sendFriendRequest,
    acceptFriendRequest,
    unfriend,
    searchUsers,
    searchCheckIns,
    loading,
    loadError,
    authToken,
    authUser,
    isAdmin: authUser?.isAdmin || false,
    login,
    signup,
    logout
  };
  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
};

export const useProjects = () => {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error('useProjects must be used within ProjectsProvider');
  return ctx;
};
