import React, { useState } from 'react';
import { useProjects } from '../context/ProjectsContext';

const PROJECT_TYPES = ['web-app','desktop-app','mobile-app','framework','library'];

const EditProjectForm = ({ project, onClose, onSave }) => {
  const { users, currentUserId } = useProjects();
  const [form, setForm] = useState({
    name: project.name,
    description: project.description,
    type: project.type || 'web-app',
    version: project.version || '1.0.0',
    hashtags: (project.hashtags || []).join(' ')
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(project.image || null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
   
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updates = {
      name: form.name,
      description: form.description,
      type: form.type,
      version: form.version,
      hashtags: form.hashtags.split(/\s+/).filter(Boolean).map(tag => tag.startsWith('#') ? tag : '#' + tag)
    };
    
  
    if (imagePreview && imagePreview !== project.image) {
      updates.image = imagePreview;
    }
    
    await onSave?.(updates);
    onClose?.();
  };

  return (
    <div className="p-5 bg-bg rounded-lg">
      <h3 className="mb-5 text-ink">Edit {project.name}</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="editProjectName" className="block mb-1 text-sm text-ink">Project Name</label>
          <input 
            type="text" 
            id="editProjectName" 
            name="name" 
            value={form.name} 
            onChange={handleChange}
            required
            className="w-full px-2 py-2 rounded border border-[#333] bg-[#2a2a2a] text-white"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="editProjectDescription" className="block mb-1 text-sm text-ink">Project Description</label>
          <textarea 
            id="editProjectDescription" 
            name="description" 
            value={form.description} 
            onChange={handleChange}
            rows="4"
            className="w-full px-2 py-2 rounded border border-[#333] bg-[#2a2a2a] text-white"
          ></textarea>
        </div>
        <div className="mb-4">
          <label htmlFor="editProjectType" className="block mb-1 text-sm text-ink">Type</label>
          <select 
            id="editProjectType" 
            name="type" 
            value={form.type} 
            onChange={handleChange}
            className="w-full px-2 py-2 rounded border border-[#333] bg-[#2a2a2a] text-white"
          >
            {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="editProjectVersion" className="block mb-1 text-sm text-ink">Version</label>
          <input 
            type="text" 
            id="editProjectVersion" 
            name="version" 
            value={form.version} 
            onChange={handleChange}
            placeholder="1.0.0"
            className="w-full px-2 py-2 rounded border border-[#333] bg-[#2a2a2a] text-white"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="editProjectHashtags" className="block mb-1 text-sm text-ink">Hashtags (space-separated)</label>
          <input 
            type="text" 
            id="editProjectHashtags" 
            name="hashtags" 
            value={form.hashtags} 
            onChange={handleChange}
            placeholder="#javascript #react"
            className="w-full px-2 py-2 rounded border border-[#333] bg-[#2a2a2a] text-white"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="editProjectImage" className="block mb-1 text-sm text-ink">Change Image</label>
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="w-[100px] h-[100px] object-cover mb-2 rounded" />
          )}
          <input 
            type="file" 
            id="editProjectImage" 
            accept="image/*"
            onChange={handleImageChange}
            className="block text-xs"
          />
        </div>
        <div className="flex gap-2 mt-5">
          <button type="submit" className="btn-primary flex-1">Save Changes</button>
          <button type="button" className="btn-outline flex-1" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default EditProjectForm;