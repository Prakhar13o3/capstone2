import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => (
  <header className="header">
    <div className="header-content">
      <div className="logo">FactFrenzy</div>
      <nav className="nav">
        <Link className="nav-link" to="/">Home</Link>
        <Link className="nav-link" to="/categories">Play Quiz</Link>
      </nav>
    </div>
  </header>
);

export default Header;