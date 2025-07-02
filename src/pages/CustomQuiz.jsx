import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore'; // ✅ add `collection` and `addDoc`
import { db, auth } from '../components/firebase'; // ✅ import `auth`
import Results from './Results';

const CustomQuiz = () => {
  const { quizId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isQuizOver, setIsQuizOver] = useState(false);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizRef = doc(db, 'quizzes', quizId);
        const quizSnap = await getDoc(quizRef);

        if (quizSnap.exists()) {
          const quizData = quizSnap.data();
          setQuestions(quizData.questions);
        } else {
          setError('Quiz not found');
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const currentQuestion = questions[currentQuestionIndex] || {};

  const handleAnswer = (selectedAnswer) => {
    const isCorrect = currentQuestion.options.indexOf(selectedAnswer) === currentQuestion.correctIndex;
    if (isCorrect) setScore((prev) => prev + 1);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTimer(30);
    } else {
      setIsQuizOver(true);
    }
  };

  // ✅ Save attempt when quiz ends
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
            quizId: quizId,
            quizTitle: 'My Custom Quiz',
            score: score,
            playedAt: new Date(),
          });
          console.log('Custom quiz attempt saved!');
        } catch (err) {
          console.error('Error saving attempt:', err);
        }
      }
    };

    saveAttempt();
  }, [isQuizOver, quizId, score]);

  useEffect(() => {
    if (!loading && !isQuizOver && timer === 0) {
      handleAnswer(null); // auto skip
    }

    const interval = setInterval(() => {
      if (!loading && !isQuizOver) {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, loading, isQuizOver]);

  if (loading) return <p>Loading quiz...</p>;
  if (error) return <p>{error}</p>;
  if (!questions.length) return <p>No questions found.</p>;

  return (
    <div className="quiz-container">
      {isQuizOver ? (
        <Results score={score} totalQuestions={questions.length} />
      ) : (
        <>
          <h3>Custom Quiz</h3>
          <p>Question {currentQuestionIndex + 1} of {questions.length}</p>
          <p>{currentQuestion.question}</p>

          <div className="answers">
            {currentQuestion.options.map((answer, idx) => (
              <button key={idx} onClick={() => handleAnswer(answer)}>
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

export default CustomQuiz;
