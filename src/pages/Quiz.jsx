import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../components/firebase';
import Results from './Results';

const Quiz = () => {
  const { categoryId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [isQuizOver, setIsQuizOver] = useState(false);
  const [timer, setTimer] = useState(30);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const categoryMapping = {
    English: 'arts_and_literature',
    'General Knowledge': 'general_knowledge',
    Science: 'science',
    Geography: 'geography',
    History: 'history'
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const apiCategory = categoryMapping[categoryId];
        const response = await fetch(
          `https://the-trivia-api.com/api/questions?categories=${apiCategory}&limit=10&difficulty=medium`
        );
        const data = await response.json();
        setQuestions(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [categoryId]);

  useEffect(() => {
    if (!loading && !isQuizOver && timer === 0) {
      handleAnswer(null); // auto skip on timeout
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
      const shuffled = [...current.incorrectAnswers, current.correctAnswer].sort(() => Math.random() - 0.5);
      setShuffledAnswers(shuffled);
    }
  }, [currentQuestionIndex, questions, loading]);

  const handleAnswer = (answer) => {
    const correct = answer === questions[currentQuestionIndex]?.correctAnswer;
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    
    if (correct) {
      setScore((prev) => prev + 1);
    }

    setTimeout(() => {
      setAnsweredQuestions((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setTimer(30);
      } else {
        setIsQuizOver(true);
      }
    }, 1000);
  };

  useEffect(() => {
    const saveAttempt = async () => {
      if (isQuizOver) {
        const user = auth.currentUser;
        if (!user) {
          console.log('Not logged in, attempt not saved.');
          return;
        }

        try {
          await addDoc(collection(db, 'quizAttempts'), {
            userId: user.email,
            quizId: categoryId,
            quizTitle: `${categoryId} Quiz`,
            quizCategory: categoryMapping[categoryId],
            score: score,
            totalQuestions: questions.length,
            playedAt: new Date(),
          });
          console.log('API quiz attempt saved!');
        } catch (err) {
          console.error('Error saving attempt:', err);
        }
      }
    };

    saveAttempt();
  }, [isQuizOver, categoryId, score, categoryMapping]);

  if (loading) return <p>Loading questions...</p>;
  if (error) return <p>{error}</p>;
  if (!questions.length) return <p>No questions found</p>;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="quiz-container">
      {isQuizOver ? (
        <Results score={score} totalQuestions={questions.length} />
      ) : (
        <>
          <h3>{categoryId} Quiz</h3>
          <p>Question {currentQuestionIndex + 1} of {questions.length}</p>
          <p>{currentQuestion.question}</p>

          <div className="answers">
            {shuffledAnswers.map((answer, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(answer)}
                style={{
                  backgroundColor: selectedAnswer === answer
                    ? isCorrect ? 'green' : 'red' : '',
                  color: selectedAnswer === answer ? 'white' : 'black'
                }}
                disabled={selectedAnswer !== null}
              >
                {answer}
                {selectedAnswer === answer && (
                  <span style={{ marginLeft: '10px' }}>
                    {isCorrect ? '✓' : '✗'}
                  </span>
                )}
              </button>
            ))}
          </div>

          {selectedAnswer !== null && !isCorrect && (
            <p style={{ color: 'red' }}>
              Correct answer: {currentQuestion.correctAnswer}
            </p>
          )}

          <p className="timer">Time left: {timer}s</p>
        </>
      )}
    </div>
  );
};

export default Quiz;