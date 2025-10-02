import React, { useMemo } from 'react';
import { useProjects } from '../context/ProjectsContext';

/**
 * UserActivity: Shows activity items related to a specific user (authored or about their projects)
 * props: userId
 */
const UserActivity = ({ userId }) => {
  const { friendActivity, globalActivity, projects, users } = useProjects();
  const user = users.find(u => u.id === userId);

  // Collect this user's owned project IDs
  const userProjects = useMemo(() => projects.filter(p => p.ownerId === userId).map(p => p.id), [projects, userId]);

  // Merge friend + global feeds, deduplicate by id (they can overlap), then filter for user involvement
  const filtered = useMemo(() => {
    if (!user) return [];
    
    // Debug logging
    console.log('UserActivity Debug:', {
      userId,
      user: user,
      friendActivity: friendActivity.slice(0, 3), // Show first 3 items
      globalActivity: globalActivity.slice(0, 3),
      userProjects: userProjects
    });
    
    const map = new Map();
    [...friendActivity, ...globalActivity].forEach(a => {
      if (a && a.id && !map.has(a.id)) map.set(a.id, a);
    });
    const arr = Array.from(map.values()).filter(a => (
      a.userId === user.id || userProjects.includes(a.projectId)
    ));
    // Sort newest first if ts present
    arr.sort((a,b) => (b.ts||0) - (a.ts||0));
    
    console.log('UserActivity filtered result:', arr);
    return arr;
  }, [friendActivity, globalActivity, user, userProjects, userId]);

  if (!user) return null;

  if (!filtered.length) {
    return <section className="activity-box"><h3>User Activity</h3><p className="empty">No recent activity.</p></section>;
  }
  return (
    <section className="activity-box">
      <h3>User Activity</h3>
      <ul className="user-activity-list">
        {filtered.map(item => {
          const project = projects.find(p => p.id === item.projectId);
          const actor = users.find(u => u.id === item.userId);
          return (
            <li key={item.id} className="user-activity-item">
              <span className="ua-user">{actor?.name || item.userId}</span> {item.role || item.type || 'activity'} on <span className="ua-proj">{project?.name || item.projectId}</span> ({item.date})
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default UserActivity;
