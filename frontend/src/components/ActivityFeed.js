import React, { useState, useMemo } from 'react';
import ActivityPreview from './ActivityPreview';
import { useProjects } from '../context/ProjectsContext';

const ActivityFeed = () => {
  const { friendActivity, globalActivity, projects } = useProjects();
  const [mode, setMode] = useState('friends'); // 'friends' | 'global'

  const activeList = useMemo(() => mode === 'friends' ? friendActivity : globalActivity, [mode, friendActivity, globalActivity]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs tracking-wide text-neutral-500">Activity Feed</span>
        <div className="flex rounded-full overflow-hidden border border-neutral-700">
          <button
            type="button"
            className={`px-3 py-1 text-xs font-medium transition-colors ${mode==='global' ? 'bg-accent text-white' : 'bg-neutral-800/60 text-neutral-300 hover:text-white'}`}
            aria-pressed={mode === 'global'}
            onClick={() => setMode('global')}
          >GLOBAL</button>
          <button
            type="button"
            className={`px-3 py-1 text-xs font-medium transition-colors ${mode==='friends' ? 'bg-accent text-white' : 'bg-neutral-800/60 text-neutral-300 hover:text-white'}`}
            aria-pressed={mode === 'friends'}
            onClick={() => setMode('friends')}
          >FRIENDS</button>
        </div>
      </div>
      <div className="feed-inner">
        <div className="px-6 pt-5 pb-3 border-b border-neutral-800">
          <h3 className="panel-section-title">{mode === 'friends' ? 'Friend Activity' : 'Global Activity'}</h3>
          <p className="text-neutral-500 text-xs mt-1">{mode === 'friends' ? 'What your network has been doing.' : 'Platform-wide recent actions.'}</p>
        </div>
        <div className="space-y-3 p-4">
          {activeList.map(activity => {
            const project = projects.find(p => p.id === activity.projectId);
            return (
              <ActivityPreview
                key={activity.id}
                activity={activity}
                project={project}
              />
            );
          })}
          {!activeList.length && <p className="feed-empty">No recent activity.</p>}
        </div>
        <div className="p-4 flex justify-center">
          <button className="btn-outline text-xs">Load More</button>
        </div>
      </div>
    </section>
  );
};

export default ActivityFeed;