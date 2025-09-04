import React from 'react';

//Dummy
const projects = [
    { id: 1, name: 'project_1 (member)', date: 'joined 5 August 2025' },
    { id: 2, name: 'project_2 (owner)', date: 'created 28 July 2025' },
    { id: 3, name: 'project_3 (owner)', date: 'created 2 July 2025' },
    { id: 4, name: 'project_4 (member)', date: 'joined 27 February 2025' },
];

const UserProjects = ({ userName }) => {
  return (
    <section className="activity-box">
      <h3>{userName}'s projects...</h3>
      <ul className="activity-list">
        {projects.map(project => (
          <li key={project.id}>
            <span className="list-icon">🖼️</span>
            <span>{project.name}, {project.date}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default UserProjects;