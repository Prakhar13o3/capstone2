import React from 'react';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="logo">FactFrenzy</h1>
        <nav className="nav">
          <a href="/" className="nav-link">Home</a>
          <a href="/profile" className="nav-link">Profile</a>
          <a href="/leaderboard" className="nav-link">Leaderboard</a>
        </nav>
      </div>
    </header>
  );
}

export default Header;
