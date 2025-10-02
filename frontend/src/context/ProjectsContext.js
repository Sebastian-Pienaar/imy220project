import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import apiClient, { setAuthToken as applyAuthToken } from '../api/client';

/**
 * ProjectsContext: manages dummy project list and checkout state for Deliverable 1.
 * Each project shape: { id, name, joinDate, isAvailable, checkedOutBy }
 */
const ProjectsContext = createContext(null);

// --- DUMMY DATA (Deliverable 1) REMOVED ---
// The arrays below previously provided placeholder projects for the UI before the backend existed.
// They are now commented out so that ONLY data coming from the backend bootstrap (MongoDB) is used.
// If you ever need sample data offline, you can temporarily uncomment, but keep them disabled for Part 2.
/*
const initialProjects = [ { id:'proj-1', name:'project_1', description:'Demo project 1', joinDate:'25/08/04', createdAt:Date.now()-86400000, ownerId:'seb-pienaar', isAvailable:true, checkedOutBy:null, type:'web-app', version:'1.0.0', hashtags:['#javascript','#react'], files:[{id:'f1',name:'index.js',size:1200,content:'// file stub'}], members:['seb-pienaar'], activity:[] }, { id:'proj-2', name:'project_2', description:'Demo project 2', joinDate:'25/08/04', createdAt:Date.now()-172800000, ownerId:'jane-doe', isAvailable:true, checkedOutBy:null, type:'library', version:'0.3.2', hashtags:['#java','#spring'], files:[{id:'f2',name:'Main.java',size:2400,content:'// java file'}], members:['jane-doe'], activity:[] }, { id:'proj-3', name:'project_3', description:'Demo project 3', joinDate:'25/08/04', createdAt:Date.now()-259200000, ownerId:'john-smith', isAvailable:false, checkedOutBy:'seb-pienaar', type:'framework', version:'2.1.1', hashtags:['#go'], files:[{id:'f3',name:'main.go',size:900,content:'// go file'}], members:['john-smith'], activity:[] } ];
*/
const initialProjects = [];

/*
const initialUsers = [ { id:'seb-pienaar', name:'Seb Pienaar', email:'seb@example.com', role:'student', location:'Pretoria, ZA', bio:'React & collaboration focused dev.', languages:['JavaScript','JavaScript','React','CSS','Node','CSS'] }, { id:'jane-doe', name:'Jane Doe', email:'jane@example.com', role:'full-stack dev', location:'Cape Town, ZA', bio:'Full-stack explorer. Loves refactoring.', languages:['Java','Java','Spring','SQL','Docker'] }, { id:'john-smith', name:'John Smith', email:'john@example.com', role:'backend dev', location:'Gauteng, ZA', bio:'Chasing elusive race conditions.', languages:['Go','Go','Go','Rust','Python'] }, { id:'emma-white', name:'Emma White', email:'emma@example.com', role:'frontend dev', location:'Johannesburg, ZA', bio:'Pixel perfection + clean commits.', languages:['CSS','CSS','CSS','HTML','JavaScript','React'] }, { id:'john-doe', name:'John Doe', email:'john.doe@example.com', role:'member', location:'Pretoria, ZA', bio:'Exploring new repos.', languages:['JavaScript','HTML','CSS'] }, { id:'kyle-brown', name:'Kyle Brown', email:'kyle.brown@example.com', role:'member', location:'Cape Town, ZA', bio:'Learning collaborative workflows.', languages:['Python','Flask','SQL'] }, { id:'globaluser1', name:'GlobalUser1', email:'global1@example.com', role:'contributor', location:'Remote', bio:'Global contributor.', languages:['Python','Python','Flask'] }, { id:'globaluser2', name:'GlobalUser2', email:'global2@example.com', role:'member', location:'Remote', bio:'Always shipping patches.', languages:['C#','C#','C#','Azure'] }, { id:'globaluser3', name:'GlobalUser3', email:'global3@example.com', role:'debugger', location:'Remote', bio:'Async debugging addict.', languages:['JavaScript','Node','Async'] }, { id:'globaluser4', name:'GlobalUser4', email:'global4@example.com', role:'security', location:'Remote', bio:'Security & performance.', languages:['Rust','Rust','C','Wasm'] }, ];
*/
const initialUsers = [];

/*
const initialFriendActivity = [ { id:'act-1', userId:'john-doe', role:'owner', projectId:'proj-1', date:'25/08/04', memberCount:7 }, { id:'act-2', userId:'kyle-brown', role:'member', projectId:'proj-2', date:'25/08/03', memberCount:12 }, { id:'act-3', userId:'emma-white', role:'member', projectId:'proj-3', date:'25/08/02', memberCount:3 } ];
*/
const initialFriendActivity = [];

/*
const initialGlobalActivity = [ { id:'gact-1', userId:'globaluser1', role:'owner', projectId:'proj-2', date:'25/08/04', memberCount:22 }, { id:'gact-2', userId:'globaluser2', role:'member', projectId:'proj-1', date:'25/08/03', memberCount:9 }, { id:'gact-3', userId:'globaluser3', role:'member', projectId:'proj-3', date:'25/08/01', memberCount:14 }, { id:'gact-4', userId:'globaluser4', role:'owner', projectId:'proj-1', date:'25/07/30', memberCount:5 } ];
*/
const initialGlobalActivity = [];

export const ProjectsProvider = ({ currentUserId: providedCurrentUserId, children }) => {
  const [projects, setProjects] = useState(() => initialProjects); // starts empty; filled by backend bootstrap
  const [activeHashtag, setActiveHashtag] = useState(null);
  const [users, setUsers] = useState(() => {
    // Remove localStorage bootstrap fallback so we rely solely on backend data.
    return initialUsers; // empty, will populate after fetchBootstrap
  });
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  // Dynamic feeds derived later; initialize empty
  const [friendActivity, setFriendActivity] = useState(initialFriendActivity);
  const [globalActivity, setGlobalActivity] = useState(initialGlobalActivity);
  const storedAuthUser = (() => { try { return JSON.parse(localStorage.getItem('authUser')); } catch { return null; } })();
  const [authToken, setAuthTokenState] = useState(() => localStorage.getItem('authToken'));
  const [authUser, setAuthUser] = useState(() => storedAuthUser);
  const [currentUserId, setCurrentUserId] = useState(() => localStorage.getItem('currentUserId') || storedAuthUser?.username || providedCurrentUserId || null);

  // Apply token to API client if present
  useEffect(() => { if (authToken) applyAuthToken(authToken); }, [authToken]);

  // friendships stored as pairs, friendRequests stored as {from,to}
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

  // bootstrap fetch from backend
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
          // --- Map USERS ---
          if (Array.isArray(data.users)) {
            const mappedUsers = data.users.map(u => ({
              ...u,
              mongoId: u._id,          // preserve original
              id: u.username || u._id, // legacy frontend expects 'id'; keep username slug if present
            }));
            setUsers(mappedUsers);
            // Build quick lookup by mongo _id for project/user relation mapping
            const userByMongo = Object.fromEntries(mappedUsers.map(u => [u.mongoId, u]));

            // --- Map PROJECTS ---
            if (Array.isArray(data.projects)) {
              const mappedProjects = data.projects.map(p => {
                const activity = (p.activity || []).map(a => ({
                  ...a,
                  id: a._id || ('act-' + Math.random().toString(36).slice(2)),
                  type: 'checkin', // backend entries are check-ins
                  userId: userByMongo[a.userId]?.id || a.userId, // translate to username id
                  ts: a.createdAt ? new Date(a.createdAt).getTime() : Date.now()
                }));
                return {
                  ...p,
                  id: p._id, // normalize id field for frontend
                  ownerMongoId: p.ownerId,
                  ownerId: userByMongo[p.ownerId]?.id || p.ownerId, // translate owner to username id
                  memberMongoIds: p.members || [],
                  members: (p.members || []).map(m => userByMongo[m]?.id || m),
                  hashtags: p.hashtags || [],
                  activity
                };
              });
              setProjects(mappedProjects);
            }
            // --- Friendships bootstrap (raw mongo docs) ---
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
            // Fallback if users missing: still set projects with minimal mapping
            setProjects(data.projects.map(p => ({ ...p, id: p._id, hashtags: p.hashtags||[], members: p.members||[], activity: p.activity||[] })));
          }
        }
      } catch (e) {
        if (!cancelled) {
          console.error('[ProjectsContext] Bootstrap failed:', e);
          setLoadError(`Failed to load app data: ${e.message}`);
          
          // Show user-friendly error notification
          if (window.confirm('Failed to connect to the server. Would you like to retry?')) {
            // Retry after a short delay
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

  // persist relevant slices
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
      // Map returned project minimally (no population yet)
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
      // Prepare payload (storing only metadata; real file storage not implemented yet)
      const payload = {
        name,
        description,
        ownerId: users.find(u=>u.id===currentUserId)?.mongoId || currentUserId,
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
        activity: []
      };
      setProjects(prev => [mapped, ...prev]);
      return mapped;
    } catch(e){ console.warn('Create project failed', e); return null; }
  }, [currentUserId, users]);

  const bumpVersion = (ver) => {
    const parts = ver.split('.').map(n=>parseInt(n,10));
    if (parts.length!==3 || parts.some(isNaN)) return '1.0.0';
    parts[2] += 1; // patch increment
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
      const patch = { members: [...proj.memberMongoIds, users.find(u=>u.id===userId)?.mongoId || userId] };
      const updated = await apiClient.updateProjectApi(projectId, patch);
      setProjects(prev => prev.map(p => p.id===projectId ? {
        ...p,
        members: [...p.members, userId],
        memberMongoIds: updated.members
      } : p));
    } catch(e){ console.warn('Add member failed', e); }
  }, [projects, users]);

  const removeMember = useCallback(async (projectId, userId) => {
    const proj = projects.find(p=>p.id===projectId);
    if (!proj) return;
    try {
      const remainingMongo = proj.memberMongoIds.filter(m => users.find(u=>u.mongoId===m)?.id !== userId);
      const patch = { members: remainingMongo };
      const updated = await apiClient.updateProjectApi(projectId, patch);
      setProjects(prev => prev.map(p => p.id===projectId ? {
        ...p,
        members: p.members.filter(m => m!==userId),
        memberMongoIds: updated.members
      } : p));
    } catch(e){ console.warn('Remove member failed', e); }
  }, [projects, users]);

  const transferOwnership = useCallback(async (projectId, newOwnerId) => {
    const proj = projects.find(p=>p.id===projectId);
    if (!proj) return;
    try {
      const newOwnerMongo = users.find(u=>u.id===newOwnerId)?.mongoId || newOwnerId;
      const ensureMembers = proj.memberMongoIds.includes(newOwnerMongo) ? proj.memberMongoIds : [...proj.memberMongoIds, newOwnerMongo];
      const patch = { ownerId: newOwnerMongo, members: ensureMembers };
      const updated = await apiClient.updateProjectApi(projectId, patch);
      setProjects(prev => prev.map(p => p.id===projectId ? {
        ...p,
        ownerId: newOwnerId,
        ownerMongoId: updated.ownerId,
        members: ensureMembers.map(m => users.find(u=>u.mongoId===m)?.id || m),
        memberMongoIds: updated.members
      } : p));
    } catch(e){ console.warn('Transfer ownership failed', e); }
  }, [projects, users]);

  const deleteProject = useCallback(async (projectId) => {
    try {
      await apiClient.deleteProjectApi?.(projectId) || await fetch('/api/projects/'+projectId, { method:'DELETE' });
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch(e){ console.warn('Delete project failed', e); }
  }, []);

  // ---- Auth functions ----
  const login = useCallback(async (usernameOrEmail, password) => {
    const { token, user } = await apiClient.loginApi(usernameOrEmail, password);
    setAuthTokenState(token);
    setAuthUser(user);
    setCurrentUserId(user.username);
    return user;
  }, []);

  const signup = useCallback(async ({ username, name, email, password }) => {
    const { token, user } = await apiClient.signupApi({ username, name, email, password });
    setAuthTokenState(token);
    setAuthUser(user);
    setCurrentUserId(user.username);
    return user;
  }, []);

  const logout = useCallback(() => {
    setAuthTokenState(null);
    setAuthUser(null);
    setCurrentUserId(null);
  }, []);

  // profile editing
  const updateUser = useCallback((userId, patch) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...patch } : u));
  }, []);

  // friendship helpers
  const isFriends = useCallback((a,b) => friendships.some(f => f.status === 'accepted' && ((f.requesterId === a && f.recipientId === b) || (f.requesterId === b && f.recipientId === a))), [friendships]);
  const hasPendingRequest = useCallback((from,to) => friendships.some(f => f.status === 'pending' && f.requesterId === from && f.recipientId === to), [friendships]);
  const inboundRequest = useCallback((from,to) => friendships.some(f => f.status === 'pending' && f.requesterId === from && f.recipientId === to), [friendships]);

  // API-backed friendship actions (temporary translation using username -> mongoId lookup)
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
    // find friendship edge in pending list (we stored only simplified friendRequests previously; now search friendships array)
    const edge = friendships.find(f => f.requesterId === fromId && f.recipientId === currentUserId && f.status === 'pending');
    if (!edge) return;
    try {
      const updated = await apiClient.acceptFriendRequestApi(edge.id);
      if (updated) {
        setFriendships(prev => prev.map(f => f.id===edge.id ? { ...f, status:'accepted' } : f));
      }
    } catch(e){ console.warn('Accept friend failed', e); }
  }, [currentUserId, inboundRequest, friendships]);

  // ---- Dynamic Activity Feed Derivation ----
  useEffect(() => {
    // Build mapping projectId -> member count for quick lookup
    const projectMemberCounts = Object.fromEntries(projects.map(p => [p.id, p.members.length]));
    // Flatten project activities into a normalized list for global feed
    const allActivities = [];
    projects.forEach(p => {
      (p.activity || []).forEach(a => {
        allActivities.push({
          id: a.id || ('act-'+Math.random().toString(36).slice(2)),
            // Use checkin/checkout/return/create as role placeholder
          role: a.type || 'activity',
          date: new Date(a.ts || Date.now()).toLocaleDateString('en-GB').replace(/\//g,'/'),
          userId: a.userId,
          projectId: p.id,
          memberCount: projectMemberCounts[p.id] || 0
        });
      });
    });
    // Sort newest first (assuming ts present)
    allActivities.sort((a,b) => (b.ts||0) - (a.ts||0));
    setGlobalActivity(allActivities);

    // Determine friend set (accepted friendships) + self
    const accepted = friendships.filter(f => f.status === 'accepted');
    const friendUsernames = new Set();
    accepted.forEach(f => {
      // Map to usernames already stored in friendship objects (requesterId/recipientId)
      friendUsernames.add(f.requesterId);
      friendUsernames.add(f.recipientId);
    });
    // Keep only accepted friends excluding self for friend-only calculation but include self for feed scope
    const scope = new Set([currentUserId, ...friendUsernames]);
    const friendFeed = allActivities.filter(a => scope.has(a.userId));
    setFriendActivity(friendFeed);
  }, [projects, friendships, currentUserId]);

  // --- Backend search helpers (triggered on explicit user action) ---
  // Asynchronous: call backend endpoints and map results into prior frontend-friendly shapes.
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
    currentUserId,
    setCurrentUserId,
    updateUser,
    friendships,
    friendRequests,
    isFriends,
    hasPendingRequest,
    sendFriendRequest,
    acceptFriendRequest,
  searchUsers, // async now
  searchCheckIns, // async now
    loading,
    loadError,
    // auth
    authToken,
    authUser,
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
