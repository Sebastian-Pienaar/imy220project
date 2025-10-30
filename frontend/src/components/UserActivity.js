import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectsContext';


const UserActivity = ({ userId }) => {
  const { friendActivity, globalActivity, projects, users } = useProjects();
  const user = users.find(u => u.id === userId);

 
  const userProjects = useMemo(() => projects.filter(p => p.ownerId === userId).map(p => p.id), [projects, userId]);

  
  const filtered = useMemo(() => {
    if (!user) return [];
    
    
    console.log('UserActivity Debug:', {
      userId,
      user: user,
      friendActivity: friendActivity.slice(0, 3), //first 3
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
    //newest first if ts present
    arr.sort((a,b) => (b.ts||0) - (a.ts||0));
    
    console.log('UserActivity filtered result:', arr);
    return arr;
  }, [friendActivity, globalActivity, user, userProjects, userId]);

  if (!user) return null;

  if (!filtered.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <span className="text-4xl mb-3">📭</span>
        <p className="text-neutral-400 text-sm">No recent activity</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {filtered.map(item => {
        const project = projects.find(p => p.id === item.projectId);
        const actor = users.find(u => u.id === item.userId);
        
        
        const getActionStyle = (type) => {
          switch(type) {
            case 'checkout': return { icon: '📤', color: 'text-blue-400' };
            case 'return': return { icon: '📥', color: 'text-green-400', label: 'check in' };
            case 'creation': return { icon: '✨', color: 'text-purple-400' };
            case 'message': return { icon: '💬', color: 'text-cyan-400' };
            default: return { icon: '🔔', color: 'text-neutral-400' };
          }
        };
        
        const { icon, color, label } = getActionStyle(item.type);
        
        return (
          <div 
            key={item.id} 
            className="flex items-start gap-3 p-3 rounded-lg bg-neutral-800/40 hover:bg-neutral-800/60 transition-colors border border-neutral-700/50"
          >
            <span className="text-xl flex-shrink-0">{icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-neutral-200 leading-relaxed">
                {actor ? (
                  <Link to={`/profile/${actor.id}`} className="font-semibold text-white hover:text-accent transition-colors">
                    {actor.name}
                  </Link>
                ) : (
                  <span className="font-semibold text-white">{item.userId}</span>
                )}
                {' '}
                <span className={color}>{label || item.role || item.type || 'activity'}</span>
                {' on '}
                <span className="font-medium text-accent">{project?.name || item.projectId}</span>
              </p>
              {item.date && (
                <p className="text-xs text-neutral-500 mt-1">{item.date}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserActivity;
