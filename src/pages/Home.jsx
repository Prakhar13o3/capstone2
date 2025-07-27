import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => (
  <div className="home-container">
    <h1 className="welcome-title">Welcome to FactFrenzy</h1>
    <div className="action-buttons">
      <Link to="/categories" className="home-btn">Play Quiz</Link>
      <Link to="/CreateQuiz" className="home-btn">Create Quiz</Link>
      <Link to="/myquizes" className="home-btn">My Quizzes</Link>
      <Link to="/playedquizes" className="home-btn">Played Quizzes</Link>
      <Link to="/challengehistory" className="home-btn">Challenge History</Link>
    </div>
  </div>
);

export default Home;
