import React from 'react';
import { useProjects } from '../context/ProjectsContext';
import { useParams } from 'react-router-dom';

const Messages = () => {
  const { projectId } = useParams();
  const { projects, users } = useProjects();
  
  // Get the current project and its activity
  const project = projects.find(p => p.id === projectId);
  const messagesData = (project?.activity || [])
    .filter(activity => activity.message && activity.message.trim()) // Only show activities with meaningful messages
    .sort((a, b) => new Date(b.createdAt || b.ts) - new Date(a.createdAt || a.ts)) // Sort by newest first
    .map(activity => {
      const user = users.find(u => u.id === activity.userId || u.mongoId === activity.userId);
      return {
        id: activity.id || activity._id,
        user: user?.name || 'Unknown User',
        message: activity.message,
        timestamp: activity.createdAt || activity.ts,
        type: activity.type || 'checkin',
        version: activity.version
      };
    });
  return (
    <section className="messages-log">
      {messagesData.map((msg, index) => (
        <div className="message" key={msg.id}>
          {index % 2 === 0 ? (
            <>
              <span className="message-user"><span className="user-icon">👤</span> {msg.user}</span>
              <span>{msg.message}</span>
              <span className="message-user"></span>
            </>
          ) : (
            <>
              <span className="message-user"></span>
              <span>{msg.message}</span>
              <span className="message-user">{msg.user} <span className="user-icon">👤</span></span>
            </>
          )}
        </div>
      ))}
    </section>
  );
};

export default Messages;