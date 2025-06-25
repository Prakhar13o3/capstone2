import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => (
  <div className="home">
    <h1 className="title">Welcome to FactFrenzy</h1>
    <div className="main-options">
      <Link to="/categories"><button>Play Quiz</button></Link>
      <button disabled>Create Quiz</button>
      <button disabled>Challenge a Friend</button>
      <button disabled >My Quizes</button>
    </div>
  </div>
);

export default Home;