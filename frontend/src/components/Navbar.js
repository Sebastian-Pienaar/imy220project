import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useProjects } from '../context/ProjectsContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { currentUserId, users } = useProjects();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isProjectPage = location.pathname.startsWith('/project/');
  
  const currentUser = users.find(u => u.id === currentUserId);
  
  return (
    <nav className="navbar">
      <div className="nav-left">
       
        <NavLink to="/" className="nav-logo">
          <span className="logo-icon">{'{'}<span className="bug">Ö</span>{'}'}</span>
          <span>BugBox</span>
        </NavLink>
      </div>
      <div className="nav-center">
        <div className="nav-links">
          <NavLink to="/home" className="flex items-center gap-2">
            {isProjectPage && <span className="text-base">←</span>}
            <span>home</span>
          </NavLink>
        </div>
      </div>
      <div className="nav-right">
        <button
          onClick={toggleTheme}
          className="mr-3 flex items-center justify-center w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 hover:border-accent hover:scale-105 transition-all"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <span className="text-xl">☀️</span>
          ) : (
            <span className="text-xl">🌙</span>
          )}
        </button>
        {currentUserId ? (
          <NavLink 
            to={`/profile/${currentUserId}`}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-accent border border-neutral-700 text-white hover:border-accent hover:scale-105 transition-all overflow-hidden"
          >
            {currentUser?.profileImage ? (
              <img 
                src={currentUser.profileImage} 
                alt={currentUser.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold">{currentUser?.name?.charAt(0) || '?'}</span>
            )}
          </NavLink>
        ) : (
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-600 cursor-not-allowed opacity-50">
            <span className="text-xl">👤</span>
          </span>
        )}
      </div>
    </nav>
  );
};

export default Navbar;