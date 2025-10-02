import React, { useState } from 'react';
import { useProjects } from '../context/ProjectsContext';

const PROJECT_TYPES = ['web-app','desktop-app','mobile-app','framework','library'];

const CreateProject = ({ onCreated }) => {
  const { createProject } = useProjects();
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImage = (file) => {
    if (!file) return setPreview(null);
    if (file.size > 5 * 1024 * 1024) { //>5MB
      setError('Image exceeds 5MB. Please choose a smaller image.');
      return setPreview(null);
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get('projectName');
    const description = formData.get('projectDescription');
    const type = formData.get('projectType');
    const hashtagsRaw = formData.get('projectHashtags') || '';
    const hashtags = hashtagsRaw.split(/\s+/).filter(Boolean).map(tag => tag.startsWith('#')? tag.toLowerCase(): '#'+tag.toLowerCase());
    const imageFile = formData.get('projectImage');
    const filesList = formData.getAll('projectFiles');
    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
      setError('Image exceeds 5MB.');
      return;
    }
    const newProj = createProject(name, description, { type, hashtags, files: filesList, image: preview });
    if (onCreated) onCreated(newProj);
    event.target.reset();
    setPreview(null);
  };

  return (
    <div className="create-project-container space-y-6 p-6 bg-neutral-900/60 border border-neutral-700 rounded-2xl backdrop-blur">
      <div className="text-center">
        <h2 className="text-2xl font-heading font-semibold tracking-tight text-white mb-2">Create a New Project</h2>
        <p className="text-neutral-400 text-sm">Build something amazing and share it with the community</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="form-group">
          <label htmlFor="projectName" className="block text-sm font-medium text-neutral-200 mb-2">
            Project Name
          </label>
          <input 
            type="text" 
            id="projectName" 
            name="projectName" 
            required 
            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
            placeholder="Enter your project name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="projectDescription" className="block text-sm font-medium text-neutral-200 mb-2">
            Description
          </label>
          <textarea 
            id="projectDescription" 
            name="projectDescription" 
            required
            rows="4"
            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all resize-none"
            placeholder="Describe what your project does..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="projectType" className="block text-sm font-medium text-neutral-200 mb-2">
            Project Type
          </label>
          <select 
            id="projectType" 
            name="projectType" 
            required 
            defaultValue={PROJECT_TYPES[0]}
            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
          >
            {PROJECT_TYPES.map(t => (
              <option key={t} value={t} className="bg-neutral-800 text-white">
                {t.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="projectHashtags" className="block text-sm font-medium text-neutral-200 mb-2">
            Hashtags
            <span className="text-neutral-400 text-xs ml-1">(space separated)</span>
          </label>
          <input 
            type="text" 
            id="projectHashtags" 
            name="projectHashtags" 
            placeholder="#javascript #react #frontend"
            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
          />
        </div>

        <div className="form-group">
          <label htmlFor="projectImage" className="block text-sm font-medium text-neutral-200 mb-2">
            Project Image
            <span className="text-neutral-400 text-xs ml-1">(max 5MB)</span>
          </label>
          <div className="space-y-3">
            <input 
              type="file" 
              id="projectImage" 
              name="projectImage" 
              accept="image/*" 
              onChange={e => handleImage(e.target.files[0])}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-600 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent file:text-white hover:file:bg-accent/90 file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
            />
            {preview && (
              <div className="relative">
                <img 
                  src={preview} 
                  alt="Project preview" 
                  className="w-full h-48 object-cover rounded-xl border border-neutral-600"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl" />
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <span className="text-red-400 text-sm">⚠️ {error}</span>
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="projectFiles" className="block text-sm font-medium text-neutral-200 mb-2">
            Add Initial Files
            <span className="text-neutral-400 text-xs ml-1">(optional)</span>
          </label>
          <input 
            type="file" 
            id="projectFiles" 
            name="projectFiles" 
            multiple
            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-600 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-neutral-700 file:text-neutral-200 hover:file:bg-neutral-600 file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
          />
        </div>

        <div className="pt-4 border-t border-neutral-700">
          <button 
            type="submit" 
            className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 px-6 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-neutral-900"
          >
            Create Project
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;