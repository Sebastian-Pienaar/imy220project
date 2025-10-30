import React, { useState } from 'react';
import { useProjects } from '../context/ProjectsContext';
import { useParams } from 'react-router-dom';

const Messages = () => {
  const { projectId } = useParams();
  const { projects, users, currentUserId } = useProjects();
  const [newMessage, setNewMessage] = useState('');
  const [posting, setPosting] = useState(false);
  
  
  const project = projects.find(p => p.id === projectId);
  const isMember = project?.members?.includes(currentUserId);
  const currentUser = users.find(u => u.id === currentUserId);
  
  const messagesData = (project?.activity || [])
    .filter(activity => activity.message && activity.message.trim()) 
    .sort((a, b) => (b.ts || 0) - (a.ts || 0)) 
    .map(activity => {
      const user = users.find(u => u.id === activity.userId || u.mongoId === activity.userId);
      return {
        id: activity.id || activity._id,
        user: user?.name || 'Unknown User',
        userId: activity.userId,
        message: activity.message,
        timestamp: activity.ts || Date.now(),
        type: activity.type || 'checkin',
        version: activity.version
      };
    });

  const handlePostMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !isMember) return;
    
    setPosting(true);
    try {
      
      const response = await fetch(`/api/projects/${projectId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.mongoId || currentUserId,
          message: newMessage.trim()
        })
      });
      
      if (response.ok) {
        setNewMessage('');
     
        window.location.reload();
      } else {
        alert('Failed to post message');
      }
    } catch (error) {
      console.error('Error posting message:', error);
      alert('Error posting message');
    } finally {
      setPosting(false);
    }
  };

  const formatTimestamp = (ts) => {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div>
      {isMember && (
        <form onSubmit={handlePostMessage} className="mb-5 p-4 bg-bg rounded-lg">
          <div className="flex gap-2 items-start">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Add a message to the discussion..."
              rows="3"
              className="flex-1 px-2 py-2 rounded border border-[#333] bg-[#2a2a2a] text-white resize-y text-sm"
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim() || posting}
              className="btn-primary px-5 py-2 min-w-[80px]"
            >
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      )}
      
      <section className="messages-log">
        {messagesData.length === 0 && (
          <p className="text-center text-[#737373] py-5">
            No messages yet. {isMember ? 'Start the discussion!' : ''}
          </p>
        )}
        {messagesData.map((msg, index) => {
          const isCurrentUser = msg.userId === currentUserId;
          const typeLabel = msg.type === 'checkin' ? '📝' : msg.type === 'checkout' ? '📤' : msg.type === 'return' ? '📥' : msg.type === 'message' ? '💬' : '';
          
          return (
            <div 
              className={`message flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              key={msg.id}
            >
              <div 
                className={`max-w-[70%] px-4 py-3 rounded-xl ${
                  isCurrentUser 
                    ? 'bg-[#2563eb] border-none' 
                    : 'bg-[#2a2a2a] border border-[#333]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-[13px]">
                    {typeLabel} {msg.user}
                  </span>
                  <span className="text-[11px] text-[#a3a3a3]">
                    {formatTimestamp(msg.timestamp)}
                  </span>
                </div>
                <p className="m-0 text-sm leading-relaxed">
                  {msg.message}
                </p>
                {msg.version && (
                  <span className="text-[11px] text-[#a3a3a3] mt-1 block">
                    Version: {msg.version}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default Messages;