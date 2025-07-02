import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../components/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Results from './Results';

const Challenge = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [timer, setTimer] = useState(30);
  const [isQuizOver, setIsQuizOver] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallengeAndQuiz = async () => {
      const user = auth.currentUser;

      if (!user) {
        alert('You must be logged in to accept a challenge.');
        navigate('/login', { state: { from: `/challenge/${id}` } });
        return;
      }

      const challengeRef = doc(db, 'challenges', id);
      const challengeSnap = await getDoc(challengeRef);

      if (!challengeSnap.exists()) {
        alert('Challenge not found.');
        navigate('/');
        return;
      }

      const challengeData = challengeSnap.data();
      setChallenge({ id: challengeSnap.id, ...challengeData });

      if (challengeData.quizType === 'custom') {
        const quizRef = doc(db, 'quizzes', challengeData.quizId);
        const quizSnap = await getDoc(quizRef);

        if (!quizSnap.exists()) {
          alert('Quiz not found.');
          navigate('/');
          return;
        }

        const quizData = quizSnap.data();
        setQuiz(quizData);
        setQuestions(quizData.questions);
        setLoading(false);

      } else if (challengeData.quizType === 'api') {
        try {
          const res = await fetch(
            `https://opentdb.com/api.php?amount=5&category=${challengeData.quizCategory}&type=multiple`
          );
          const data = await res.json();

          const formatted = data.results.map((q) => {
            const options = [...q.incorrect_answers];
            const correctIndex = Math.floor(Math.random() * (options.length + 1));
            options.splice(correctIndex, 0, q.correct_answer);

            return {
              question: q.question,
              options,
              correctIndex
            };
          });

          setQuiz({ title: `API Category ${challengeData.quizCategory}` });
          setQuestions(formatted);
          setLoading(false);
        } catch (err) {
          console.error(err);
          alert('Failed to load API quiz.');
          navigate('/');
        }

      } else {
        alert('Unknown quiz type.');
        navigate('/');
      }
    };

    fetchChallengeAndQuiz();
  }, [id, navigate]);

  useEffect(() => {
    if (!loading && !isQuizOver && timer === 0) {
      handleAnswer();
    }

    const interval = setInterval(() => {
      if (!loading && !isQuizOver) {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, loading, isQuizOver]);

  useEffect(() => {
    if (!loading && questions.length > 0) {
      const current = questions[currentQuestionIndex];
      const shuffled = [...current.options].sort(() => Math.random() - 0.5);
      setShuffledAnswers(shuffled);
    }
  }, [currentQuestionIndex, questions, loading]);

  const handleAnswer = (answer) => {
    const current = questions[currentQuestionIndex];
    const isCorrect = answer === current.options[current.correctIndex];
    if (isCorrect) setScore((prev) => prev + 1);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTimer(30);
    } else {
      setIsQuizOver(true);
    }
  };

  useEffect(() => {
    const saveResult = async () => {
      if (isQuizOver && challenge && auth.currentUser) {
        const challengeRef = doc(db, 'challenges', challenge.id);
        await updateDoc(challengeRef, {
          opponentId: auth.currentUser.email,
          opponentScore: score,
          status: 'completed',
          completedAt: new Date(),
        });
      }
    };

    saveResult();
  }, [isQuizOver, challenge, score]);

  if (loading) return <p>Loading challenge quiz...</p>;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="quiz-container">
      {isQuizOver ? (
        <Results
          score={score}
          totalQuestions={questions.length}
          extra={<p>Original Player’s Score: {challenge.createdScore}</p>}
        />
      ) : (
        <>
          <h2>Challenge Quiz</h2>
          <p>Question {currentQuestionIndex + 1} of {questions.length}</p>
          <p dangerouslySetInnerHTML={{ __html: currentQuestion.question }}></p>

          <div className="answers">
            {shuffledAnswers.map((ans, idx) => (
              <button key={idx} onClick={() => handleAnswer(ans)}
                dangerouslySetInnerHTML={{ __html: ans }}>
              </button>
            ))}
          </div>

          <p>Time Left: {timer}s</p>
        </>
      )}
    </div>
  );
};

export default Challenge;
