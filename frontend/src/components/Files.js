import React from 'react';

// Dummy Data
const projectFiles = [
    { id: 1, name: 'index.js', size: '12 KB' },
    { id: 2, name: 'App.css', size: '5 KB' },
    { id: 3, name: 'logo.svg', size: '2 KB' },
];

const Files = () => {
  return (
    <div className="files-container">
      <h3>Project Files</h3>
      <ul>
        {projectFiles.map(file => (
          <li key={file.id}>
            <span>{file.name}</span>
            <span>{file.size}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Files;