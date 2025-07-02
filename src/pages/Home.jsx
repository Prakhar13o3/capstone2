import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => (
  <div className="home">
    <h1 className="title">Welcome to FactFrenzy</h1>
    <div className="main-options">
      <Link to="/categories"><button>Play Quiz</button></Link>
      <Link to="/CreateQuiz"><button>Create Quiz</button></Link>
      <Link to="/myquizes"><button>My Quizes</button></Link>
      <Link to="/playedquizes"><button>Played Quizes</button></Link>
      <Link to="/challengehistory"><button>Challenge History</button></Link>
    </div>
  </div>
);

export default Home;