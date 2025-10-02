import React, { useState } from 'react';
import { useProjects } from '../context/ProjectsContext';

// In a real app, this component would receive the current user's data as props
const EditProfileForm = ({ currentUser, onClose }) => {
  const { updateUser } = useProjects();
  const [form, setForm] = useState({
    name: currentUser?.name || '',
    role: currentUser?.role || '',
    location: currentUser?.location || '',
    bio: currentUser?.bio || '',
    languages: (currentUser?.languages || []).join(', ')
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    updateUser(currentUser.id, {
      name: form.name.trim(),
      role: form.role.trim(),
      location: form.location.trim(),
      bio: form.bio.trim(),
      languages: form.languages.split(',').map(l => l.trim()).filter(Boolean)
    });
    onClose?.();
  };

  return (
    <div className="edit-profile-form-container">
      <h2>Edit Your Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input type="text" id="name" name="name" value={form.name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="role">Role / Title</label>
          <input type="text" id="role" name="role" value={form.role} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="location">Location</label>
            <input type="text" id="location" name="location" value={form.location} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea id="bio" name="bio" rows={3} value={form.bio} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="languages">Favourite Languages (comma separated; repeat to emphasise)</label>
          <input type="text" id="languages" name="languages" value={form.languages} onChange={handleChange} placeholder="JavaScript, JavaScript, React, CSS" />
        </div>
        <button type="submit" className="register-btn">Save Changes</button>
      </form>
    </div>
  );
};

export default EditProfileForm;
// At the top of ProfilePage.js
