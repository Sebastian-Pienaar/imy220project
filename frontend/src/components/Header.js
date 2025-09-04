import React from 'react';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <div className="logo-icon">
          <span>{'{'} </span><span className="bug">Ö</span><span> {'}'}</span>
        </div>
        <h1 className="logo-text">BugBox</h1>
      </div>
      <p className="tagline">Share your broken code. We'll fix it together</p>
    </header>
  );
};

export default Header;