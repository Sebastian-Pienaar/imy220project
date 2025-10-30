import React, { useState } from 'react';
import { useProjects } from '../context/ProjectsContext';
import { useParams } from 'react-router-dom';

const Files = ({ projectId: propProjectId }) => {
  const { projectId: paramProjectId } = useParams();
  const projectId = propProjectId || paramProjectId;
  const { projects, currentUserId, users } = useProjects();
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  const project = projects.find(p => p.id === projectId || p._id === projectId);
  const files = project?.files || [];
  
  console.log('[Files] projectId:', projectId, 'project found:', !!project, 'files count:', files.length);

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files);
    setSelectedFiles(newFiles);
  };

  const handleAddFiles = async () => {
    if (selectedFiles.length === 0) {
      console.log('[Files] No files selected');
      return;
    }
    
    if (!projectId) {
      console.error('[Files] No projectId available');
      return;
    }

    try {
      console.log('[Files] Starting file upload for project:', projectId, 'files:', selectedFiles.length);
      console.log('[Files] Current user ID:', currentUserId);
      
      
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      
      
      const currentUser = users.find(u => u.id === currentUserId);
      const userMongoId = currentUser?.mongoId || currentUser?._id || currentUserId;
      console.log('[Files] Sending userId:', userMongoId);
      formData.append('userId', userMongoId);

    
      const uploadUrl = `/api/projects/${projectId}/files`;
      console.log('[Files] Uploading to:', uploadUrl);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      console.log('[Files] Upload response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[Files] Upload successful, files saved:', data.files);
        setSelectedFiles([]);
    
        window.location.reload();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        console.error('[Files] Upload failed. Status:', response.status, 'Response:', errorData);
        alert(errorData.message || 'Upload failed');
      }
    } catch (error) {
      console.error('[Files] Error uploading files:', error);
      alert('Error uploading files');
    }
  };

  return (
    <div className="files-container">
      <h3>Project Files</h3>
      {files.length === 0 ? (
        <p className="empty-soft">No files uploaded yet.</p>
      ) : (
        <ul>
          {files.map(file => (
            <li key={file.id || file._id || file.name}>
              <span>{file.name}</span>
              <span>{file.size ? (file.size / 1024).toFixed(1) + ' KB' : 'N/A'}</span>
            </li>
          ))}
        </ul>
      )}
      
      <div className="files-upload-section">
        <input
          type="file"
          id="file-input"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="*/*"
        />
        <label htmlFor="file-input" className="btn-outline text-xs cursor-pointer">
          📁 Select Files
        </label>
        
        {selectedFiles.length > 0 && (
          <div className="files-selected mt-2">
            <p className="text-xs text-neutral-400 mb-1">Selected: {selectedFiles.length} file(s)</p>
            <ul className="text-xs text-neutral-300 space-y-1">
              {selectedFiles.map((file, idx) => (
                <li key={idx} className="truncate">• {file.name}</li>
              ))}
            </ul>
            <button
              onClick={handleAddFiles}
              className="btn-primary text-xs mt-2 w-full"
            >
              Upload Files
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Files;