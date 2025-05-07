import React from 'react';

import { useNavigate } from 'react-router-dom';


const Results = ({ score, totalQuestions }) => {
  const navigate = useNavigate();
  return (
    <div className="results-container">
      <h2>Quiz Results</h2>
      <p>Your Score: {score} / {totalQuestions}</p>
      <p>Correct Answers: {score}</p>
      <p>Incorrect Answers: {totalQuestions - score}</p>
      <button onClick={() => navigate('/')}>Go Home</button>
    </div>
  );
};

export default Results;
