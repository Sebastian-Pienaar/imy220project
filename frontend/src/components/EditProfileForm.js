import React, { useState } from 'react';
import { useProjects } from '../context/ProjectsContext';


const EditProfileForm = ({ currentUser, onClose }) => {
  const { updateUser } = useProjects();
  const [form, setForm] = useState({
    name: currentUser?.name || '',
    role: currentUser?.role || '',
    location: currentUser?.location || '',
    bio: currentUser?.bio || '',
    languages: (currentUser?.languages || []).join(', ')
  });
  const [profileImage, setProfileImage] = useState(currentUser?.profileImage || null);
  const [imagePreview, setImagePreview] = useState(currentUser?.profileImage || null);
  const [uploadError, setUploadError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

   
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be less than 5MB');
      return;
    }


    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    setUploadError('');


    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setProfileImage(reader.result); 
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    updateUser(currentUser.id, {
      name: form.name.trim(),
      role: form.role.trim(),
      location: form.location.trim(),
      bio: form.bio.trim(),
      languages: form.languages.split(',').map(l => l.trim()).filter(Boolean),
      profileImage: profileImage
    });
    onClose?.();
  };

  return (
    <div className="edit-profile-form-container">
      <h2>Edit Your Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="profileImage">Profile Image</label>
          {imagePreview && (
            <div className="mb-3">
              <img 
                src={imagePreview} 
                alt="Profile preview" 
                className="w-32 h-32 rounded-full object-cover border-4 border-neutral-700"
              />
            </div>
          )}
          <input 
            type="file" 
            id="profileImage" 
            name="profileImage" 
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent file:text-white hover:file:bg-accent/90 file:cursor-pointer"
          />
          {uploadError && (
            <p className="text-red-400 text-sm mt-1">{uploadError}</p>
          )}
        </div>
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

