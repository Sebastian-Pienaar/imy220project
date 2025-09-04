import React from 'react';

const ProjectDashboard = () => {
  return (
    <div className="dashboard-column">
      <h2 className="footer-title">Project dashboard</h2>
      <ul className="dashboard-actions">
        <li><a href="#"><span className="icon">+</span> add people or files</a></li>
        <li><a href="#"><span className="icon">→</span> check out</a></li>
        <li><a href="#"><span className="icon">↓</span> download</a></li>
      </ul>
    </div>
  );
};

export default ProjectDashboard;