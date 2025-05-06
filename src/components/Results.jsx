const Results = ({ score, totalQuestions }) => {
    return (
      <div className="results-container">
        <h2>Quiz Complete!</h2>
        <p>Your Score: {score} / {totalQuestions}</p>
        <p>Correct Answers: {score}</p>
        <p>Wrong Answers: {totalQuestions - score}</p>
        <button onClick={() => window.location.reload()}>Play Again</button>
      </div>
    );
  };
  
  export default Results;
  