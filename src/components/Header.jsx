import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './../components/firebase';

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);


  const handleLogout = async () => {
    await signOut(auth);
    navigate('/Login');
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">FactFrenzy</div>
        <nav className="nav">
          <Link className="nav-link" to="/">Home</Link>
          <Link className="nav-link" to="/categories">Play Quiz</Link>

          {user ? (
            <>
              <span className="nav-user">Welcome, {user.email}</span>
              <Link className="nav-link" onClick={handleLogout}>Logout</Link>
            </>
          ) : (
            <>
              <Link className="nav-link" to="/Login">Login</Link>
              <Link className="nav-link" to="/Signup">Signup</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
