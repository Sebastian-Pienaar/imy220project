import React from 'react';
import ActivityPreview from './ActivityPreview';

//Dummy
const friendActivity = [
  { id: 1, user: 'John Doe', role: 'owner', projectName: 'project_name', date: '25/08/04', memberCount: 7, isAvailable: true },
  { id: 2, user: 'Kyle Brown', role: 'member', projectName: 'project_name', date: '25/08/03', memberCount: 12, isAvailable: false },
  { id: 3, user: 'Emma White', role: 'member', projectName: 'project_name', date: '25/08/02', memberCount: 3, isAvailable: true },
];

const ActivityFeed = () => {
  return (
    <section className="feed-column">
      <div className="feed-header">
        <span className="sort-control">☰ SORT</span>
        <div className="feed-toggle">
            <button>GLOBAL</button>
            <button className="active">FRIENDS</button>
        </div>
      </div>
      <div className="feed-content">
        <div className="feed-title">
            <h3>FRIEND ACTIVITY</h3>
            <p>see what your fellow buggers are up to</p>
        </div>
        {friendActivity.map(activity => (
            <ActivityPreview 
                key={activity.id}
                user={activity.user}
                role={activity.role}
                projectName={activity.projectName}
                date={activity.date}
                memberCount={activity.memberCount}
                isAvailable={activity.isAvailable}
            />
        ))}
        <button className="more-btn">more</button>
      </div>
    </section>
  );
};

export default ActivityFeed;