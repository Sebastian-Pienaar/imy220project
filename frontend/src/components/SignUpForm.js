import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectsContext';


const SignUpForm = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();
  const { signup } = useProjects();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    setError('');
   
    const formData = new FormData(event.target);
    const fullName = formData.get('full-name');
    const email = formData.get('email');
    
    const username = (email.split('@')[0] || fullName.split(' ')[0]).toLowerCase().replace(/[^a-z0-9-]/g,'-');
    try {
      setLoading(true);
      const user = await signup({ username, name: fullName, email, password });
      navigate('/home');
    } catch(e){
      setError(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="registration-form">
      <div className="form-content">
        <h2>Register here</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="full-name">full name</label>
            <input type="text" id="full-name" name="full-name" required />
          </div>
          <div className="form-group">
            <label htmlFor="email">email</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password">confirm password</label>
            <input 
              type="password" 
              id="confirm-password" 
              name="confirm-password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
            />
          </div>
          {error && <p className="validation-error text-red-400 text-sm mt-2">{error}</p>}
          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? '...' : 'register'}
          </button>
        </form>
        <div className="form-switcher">
          <p>
            Already have an account?{' '}
            <button type="button" onClick={onSwitchToLogin}>
              Log In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;