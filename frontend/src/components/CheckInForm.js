import React, { useState } from 'react';
import { useProjects } from '../context/ProjectsContext';

const CheckInForm = ({ projectId }) => {
  const { checkInProject, projects, currentUserId } = useProjects();
  const project = projects.find(p => p.id === projectId);
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');
  if (!project) return null;
  const canCheckIn = project.checkedOutBy === currentUserId;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canCheckIn) return;
    checkInProject(projectId, { files, message: message || 'Updated files.' });
    setFiles([]);
    setMessage('');
  };

  return (
    <form className="checkin-form" onSubmit={handleSubmit}>
      <h3>Check In Changes</h3>
      {!canCheckIn && <p className="small-note">You must check out this project first.</p>}
      <div className="form-group">
        <label htmlFor={`checkinFiles-${projectId}`}>Files</label>
        <input id={`checkinFiles-${projectId}`} type="file" multiple disabled={!canCheckIn} onChange={e=>setFiles(Array.from(e.target.files))} />
      </div>
      <div className="form-group">
        <label htmlFor={`checkinMsg-${projectId}`}>Message</label>
        <input id={`checkinMsg-${projectId}`} type="text" value={message} disabled={!canCheckIn} onChange={e=>setMessage(e.target.value)} placeholder="Describe your changes" />
      </div>
      <button type="submit" disabled={!canCheckIn || !files.length} className="primary-btn">Check In</button>
    </form>
  );
};

export default CheckInForm;
