import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectsContext';

const LoginForm = ({ onSwitchToSignUp }) => {
  const navigate = useNavigate();
  const { login } = useProjects();
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const usernameOrEmail = formData.get('email');
    const password = formData.get('password');
    setError(null); setLoading(true);
    try {
      const user = await login(usernameOrEmail, password);
      navigate(`/profile/${user.username}`);
    } catch(e){
      setError(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="registration-form">
      <div className="form-content">
        <h2>Login here</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label htmlFor="email">email</label><input type="email" id="email" name="email" required /></div>
          <div className="form-group"><label htmlFor="password">password</label><input type="password" id="password" name="password" required /></div>
          <button type="submit" className="register-btn" disabled={loading}>{loading ? '...' : 'login'}</button>
          {error && <p className="validation-error" style={{marginTop:'8px'}}>{error}</p>}
        </form>
        <div className="form-switcher">
          <p>
            Don't have an account?{' '}
            <button type="button" onClick={onSwitchToSignUp}>
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;