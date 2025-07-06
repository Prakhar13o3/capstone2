import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => (
  <div className="home-container">
    <h1 className="welcome-title">Welcome to FactFrenzy</h1>
    <div className="action-buttons">
      <Link to="/categories" className="nav-button">
        <button className="home-btn">Play Quiz</button>
      </Link>
      <Link to="/CreateQuiz" className="nav-button">
        <button className="home-btn">Create Quiz</button>
      </Link>
      <Link to="/myquizes" className="nav-button">
        <button className="home-btn">My Quizzes</button>
      </Link>
      <Link to="/playedquizes" className="nav-button">
        <button className="home-btn">Played Quizzes</button>
      </Link>
      <Link to="/challengehistory" className="nav-button">
        <button className="home-btn">Challenge History</button>
      </Link>
    </div>
  </div>
);

export default Home;