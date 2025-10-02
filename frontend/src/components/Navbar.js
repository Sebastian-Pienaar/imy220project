import React from 'react';
import { NavLink } from 'react-router-dom';
import SearchInput from './SearchInput';

const Navbar = () => {
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
         
          <NavLink to="/home">home</NavLink>
        
          <NavLink to="/project/some-cool-project">projects</NavLink>
        </div>
      </div>
      <div className="nav-right">
        <SearchInput />
        
        <NavLink to="/profile/seb-pienaar">
          <span className="profile-icon">👤</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;