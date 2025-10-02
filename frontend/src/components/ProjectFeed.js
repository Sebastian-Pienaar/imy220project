import React from 'react';
import ProjectPreview from './ProjectPreview';
import { useProjects } from '../context/ProjectsContext';

const ProjectFeed = () => {
  const { projects, activeHashtag, setActiveHashtag } = useProjects();
  const filtered = activeHashtag ? projects.filter(p => (p.hashtags||[]).includes(activeHashtag)) : projects;
  return (
    <section className="space-y-4">
      {activeHashtag && (
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2 text-xs bg-neutral-800/60 px-3 py-1 rounded-full border border-neutral-700">
            <span>Filter: {activeHashtag}</span>
            <button type="button" onClick={() => setActiveHashtag(null)} aria-label="Clear hashtag filter" className="text-neutral-400 hover:text-accent">×</button>
          </div>
        </div>
      )}
      <div className="feed-inner">
        <div className="px-6 pt-5 pb-3 border-b border-neutral-800">
          <h3 className="panel-section-title">{activeHashtag ? 'Filtered Projects' : 'Your Projects'}</h3>
          <p className="text-neutral-500 text-xs mt-1">{activeHashtag ? 'Projects tagged with ' + activeHashtag : "Active workspaces and repos you're involved in."}</p>
        </div>
        <div className="space-y-3 p-4">
          {filtered.map(project => (
            <ProjectPreview key={project.id} project={project} />
          ))}
          {!filtered.length && <p className="feed-empty">No projects match this hashtag.</p>}
        </div>
        <div className="p-4 flex justify-center">
          <button className="btn-outline text-xs">Load More</button>
        </div>
      </div>
    </section>
  );
};

export default ProjectFeed;