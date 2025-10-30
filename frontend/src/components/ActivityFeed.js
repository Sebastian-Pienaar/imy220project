import React, { useState, useMemo } from 'react';
import ActivityPreview from './ActivityPreview';
import { useProjects } from '../context/ProjectsContext';

const ITEMS_PER_PAGE = 5;

const ActivityFeed = () => {
  const { friendActivity, globalActivity, projects } = useProjects();
  const [mode, setMode] = useState('local');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const activeList = useMemo(() => mode === 'local' ? friendActivity : globalActivity, [mode, friendActivity, globalActivity]);
  
  const visibleActivities = activeList.slice(0, visibleCount);
  const hasMore = visibleCount < activeList.length;
  
  const handleLoadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };
  
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setVisibleCount(ITEMS_PER_PAGE); 
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs tracking-wide text-neutral-500">Activity Feed</span>
        <div className="flex rounded-full overflow-hidden border border-neutral-700">
          <button
            type="button"
            className={`px-3 py-1 text-xs font-medium transition-colors ${mode==='local' ? 'bg-accent text-white' : 'bg-neutral-800/60 text-neutral-300 hover:text-white'}`}
            aria-pressed={mode === 'local'}
            onClick={() => handleModeChange('local')}
          >LOCAL</button>
          <button
            type="button"
            className={`px-3 py-1 text-xs font-medium transition-colors ${mode==='global' ? 'bg-accent text-white' : 'bg-neutral-800/60 text-neutral-300 hover:text-white'}`}
            aria-pressed={mode === 'global'}
            onClick={() => handleModeChange('global')}
          >GLOBAL</button>
        </div>
      </div>
      <div className="feed-inner">
        <div className="px-6 pt-5 pb-3 border-b border-neutral-800">
          <h3 className="panel-section-title">{mode === 'local' ? 'Local Activity' : 'Global Activity'}</h3>
          <p className="text-neutral-500 text-xs mt-1">{mode === 'local' ? 'Activity for projects you are a member of.' : 'All activity across the platform.'}</p>
        </div>
        <div className="space-y-3 p-4">
          {visibleActivities.map(activity => {
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
        {hasMore && (
          <div className="p-4 flex justify-center">
            <button className="btn-outline text-xs" onClick={handleLoadMore}>
              Load More ({activeList.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ActivityFeed;