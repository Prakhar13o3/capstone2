import React, { useState, useEffect } from 'react';
import Results from './Results';

const Quiz = ({ category }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [isQuizOver, setIsQuizOver] = useState(false);
  const [timer, setTimer] = useState(10);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categoryMapping = {
    English: 'arts_and_literature',
    'General Knowledge': 'general_knowledge',
    GK: 'general_knowledge',
    Science: 'science',
    Geography: 'geography',
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const apiCategory = categoryMapping[category] || 'general_knowledge';
        const response = await fetch(
          `https://the-trivia-api.com/api/questions?categories=${apiCategory}&limit=10&difficulty=medium`
        );

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        if (!data || data.length === 0) {
          throw new Error('No questions found for this category.');
        }

        setQuestions(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [category]);

  useEffect(() => {
    if (!loading && !isQuizOver && timer === 0) {
      handleAnswer(); // auto-skip on timeout
    }

    const timerInterval = setInterval(() => {
      if (!loading && !isQuizOver) {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [timer, loading, isQuizOver]);

  useEffect(() => {
    if (!loading && questions.length > 0) {
      const current = questions[currentQuestionIndex];
      const shuffled = [
        ...current.incorrectAnswers,
        current.correctAnswer,
      ].sort(() => Math.random() - 0.5);
      setShuffledAnswers(shuffled);
    }
  }, [currentQuestionIndex, questions, loading]);

  const handleAnswer = (isCorrect = false) => {
    setAnsweredQuestions((prev) => prev + 1);
    if (isCorrect) setScore((prev) => prev + 1);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTimer(10);
    } else {
      setIsQuizOver(true);
    }
  };

  if (loading) return <p>Loading questions...</p>;
  if (error) return (
    <div>
      <p style={{ color: 'red' }}>{error}</p>
      <button onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="quiz-container">
      {isQuizOver ? (
        <Results score={score} totalQuestions={questions.length} />
      ) : (
        <>
          <h3>{category} Quiz</h3>
          <p>Question {currentQuestionIndex + 1} of {questions.length}</p>
          <p>{currentQuestion.question}</p>

          <div className="answers">
            {shuffledAnswers.map((answer, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(answer === currentQuestion.correctAnswer)}
              >
                {answer}
              </button>
            ))}
          </div>

          <p className="timer">Time left: {timer}s</p>
        </>
      )}
    </div>
  );
};

export default Quiz;
