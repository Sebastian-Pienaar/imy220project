import React, { useState } from 'react';
import { useProjects } from '../context/ProjectsContext';

const PROJECT_TYPES = ['web-app','desktop-app','mobile-app','framework','library'];

const EditProjectForm = ({ project, onClose }) => {
  const { projects, createProject } = useProjects(); // placeholder: would use updateProject (not yet implemented)
  const [form, setForm] = useState({
    name: project.name,
    description: project.description,
    type: project.type || 'web-app',
    hashtags: (project.hashtags || []).join(' ')
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // NOTE: For now just log; real implementation would patch project in context.
    console.log('Save project changes', form);
    onClose?.();
  };

  return (
    <div className="edit-project-form-container">
      <h3>Edit {project.name}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="editProjectName">Project Name</label>
          <input type="text" id="editProjectName" name="name" value={form.name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="editProjectDescription">Project Description</label>
          <textarea id="editProjectDescription" name="description" value={form.description} onChange={handleChange}></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="editProjectType">Type</label>
          <select id="editProjectType" name="type" value={form.type} onChange={handleChange}>
            {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="editProjectHashtags">Hashtags</label>
          <input type="text" id="editProjectHashtags" name="hashtags" value={form.hashtags} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="editProjectImage">Change Image</label>
          <input type="file" id="editProjectImage" />
        </div>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditProjectForm;