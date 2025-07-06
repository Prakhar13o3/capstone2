import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../components/firebase';
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import Results from './Results';

const Challenge = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isQuizOver, setIsQuizOver] = useState(false);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerStatus, setAnswerStatus] = useState(null);

  useEffect(() => {
    const fetchChallengeAndQuiz = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login', { state: { from: `/challenge/${id}` } });
        return;
      }

      try {
        const challengeRef = doc(db, 'challenges', id);
        const challengeSnap = await getDoc(challengeRef);

        if (!challengeSnap.exists()) {
          throw new Error('Challenge not found');
        }

        const challengeData = challengeSnap.data();
        setChallenge({ id: challengeSnap.id, ...challengeData });

        if (challengeData.quizType === 'custom') {
          const quizRef = doc(db, 'quizzes', challengeData.quizId);
          const quizSnap = await getDoc(quizRef);
          
          if (quizSnap.exists()) {
            const quizData = quizSnap.data();
            const validatedQuestions = quizData.questions.map(q => ({
              question: q.question,
              options: q.options || [],
              correctIndex: typeof q.correctIndex === 'number' ? 
                Math.max(0, Math.min(q.correctIndex, q.options.length - 1)) : 0
            }));
            setQuestions(validatedQuestions);
          }
        } else {
          // API quiz loading logic
          const res = await fetch(
            `https://the-trivia-api.com/api/questions?categories=${challengeData.quizCategory}&limit=5&difficulty=medium`
          );
          const data = await res.json();
          setQuestions(data.map(q => ({
            question: q.question,
            options: [...q.incorrectAnswers, q.correctAnswer].sort(() => Math.random() - 0.5),
            correctAnswer: q.correctAnswer
          })));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChallengeAndQuiz();
  }, [id, navigate]);

  const handleAnswer = (selectedAnswer) => {
    const currentQuestion = questions[currentQuestionIndex];
    let isCorrect = false;

    if (challenge.quizType === 'custom') {
      // For custom quizzes, compare selected index with correctIndex
      const selectedIndex = currentQuestion.options.indexOf(selectedAnswer);
      isCorrect = selectedIndex === currentQuestion.correctIndex;
    } else {
      // For API quizzes, compare selected answer with correctAnswer
      isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    }

    setSelectedOption(selectedAnswer);
    setAnswerStatus(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setTimer(30);
        setSelectedOption(null);
        setAnswerStatus(null);
      } else {
        setIsQuizOver(true);
      }
    }, 1000);
  };

  const saveAttempt = async () => {
    const user = auth.currentUser;
    if (!user || !challenge) return;

    try {
      await addDoc(collection(db, 'quizAttempts'), {
        userId: user.email,
        challengeId: challenge.id,
        quizId: challenge.quizId,
        quizTitle: challenge.quizTitle,
        score: score,
        totalQuestions: questions.length,
        playedAt: new Date(),
        isChallenge: true
      });

      if (user.email !== challenge.createdBy) {
        await updateDoc(doc(db, 'challenges', challenge.id), {
          opponentId: user.email,
          opponentScore: score,
          status: 'completed',
          completedAt: new Date()
        });
      }
    } catch (error) {
      console.error("Error saving attempt:", error);
    }
  };

  useEffect(() => {
    if (isQuizOver) {
      saveAttempt();
    }
  }, [isQuizOver]);

  useEffect(() => {
    if (!loading && !isQuizOver && timer === 0) {
      handleAnswer(null);
    }

    const interval = setInterval(() => {
      if (!loading && !isQuizOver && !answerStatus) {
        setTimer(prev => (prev > 0 ? prev - 1 : 0));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, loading, isQuizOver, answerStatus]);

  if (loading) return <div>Loading challenge...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!questions.length) return <div>No questions found.</div>;

  const currentQuestion = questions[currentQuestionIndex];
  const isCustomQuiz = challenge.quizType === 'custom';

  return (
    <div className="quiz-container">
      {isQuizOver ? (
        <Results score={score} totalQuestions={questions.length} />
      ) : (
        <>
          <h2>Challenge: {challenge.quizTitle}</h2>
          <p>Question {currentQuestionIndex + 1} of {questions.length}</p>
          <p>{currentQuestion.question}</p>

          <div className="answers">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                style={{
                  backgroundColor: selectedOption === option ? 
                    (answerStatus === 'correct' ? 'green' : 
                     answerStatus === 'incorrect' ? 'red' : '#f0f0f0') : '',
                  color: selectedOption === option ? 'white' : 'black'
                }}
              >
                {option}
                {selectedOption === option && (
                  <span style={{ marginLeft: '10px' }}>
                    {answerStatus === 'correct' ? '✓' : answerStatus === 'incorrect' ? '✗' : ''}
                  </span>
                )}
              </button>
            ))}
          </div>

          {answerStatus === 'correct' && <p>Correct!</p>}
          {answerStatus === 'incorrect' && (
            <p>Wrong! The correct answer is: {
              isCustomQuiz 
                ? currentQuestion.options[currentQuestion.correctIndex] 
                : currentQuestion.correctAnswer
            }</p>
          )}
                    <p>Time left: {timer}s</p>
        </>
      )}
    </div>
  );
};

export default Challenge;