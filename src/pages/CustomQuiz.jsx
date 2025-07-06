import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../components/firebase';
import Results from './Results';

const CustomQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const [isQuizOver, setIsQuizOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerStatus, setAnswerStatus] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizRef = doc(db, 'quizzes', quizId);
        const quizSnap = await getDoc(quizRef);

        if (!quizSnap.exists()) {
          throw new Error('Quiz not found');
        }

        const quizData = quizSnap.data();
        const validatedQuestions = quizData.questions.map((q, i) => {
          const options = Array.isArray(q.options) ? q.options : [];
          let correctIndex = typeof q.correctIndex === 'number' ? 
            Math.max(0, Math.min(q.correctIndex, options.length - 1)) : 0;
          
          return {
            question: q.question || 'No question text',
            options: options,
            correctIndex: correctIndex
          };
        });

        setQuiz({ id: quizSnap.id, ...quizData });
        setQuestions(validatedQuestions);
        setLoading(false);
      } catch (err) {
        console.error('Error loading quiz:', err);
        setError(err.message);
        setLoading(false);
        navigate('/myquizes');
      }
    };

    fetchQuiz();
  }, [quizId, navigate]);

  // Timer effect
  useEffect(() => {
    let timerInterval;
    
    if (questions.length > 0 && !isQuizOver && !answerStatus) {
      timerInterval = setInterval(() => {
        setTimer(prevTimer => {
          if (prevTimer <= 1) {
            clearInterval(timerInterval);
            handleAnswer(-1); // Auto-submit when time runs out
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerInterval);
  }, [questions, currentQuestionIndex, isQuizOver, answerStatus]);

  const handleAnswer = (selectedIndex) => {
    const currentQuestion = questions[currentQuestionIndex];
    setSelectedOption(selectedIndex);

    if (!currentQuestion || !Array.isArray(currentQuestion.options)) {
      setAnswerStatus('Error: Invalid question format');
      return;
    }

    const isCorrect = selectedIndex === currentQuestion.correctIndex;
    setAnswerStatus(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      setAnswerStatus(null);
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setTimer(30);
        setSelectedOption(null);
      } else {
        setIsQuizOver(true);
      }
    }, 1000);
  };

  if (loading) return <div>Loading quiz...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!questions.length) return <div>No questions found in this quiz</div>;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="quiz-container">
      {isQuizOver ? (
        <Results 
          score={score} 
          totalQuestions={questions.length} 
          quizTitle={quiz?.title}
        />
      ) : (
        <>
          <h2>{quiz?.title || 'Custom Quiz'}</h2>
          <div>Question {currentQuestionIndex + 1} of {questions.length}</div>

          
          <div>
            <h3>{currentQuestion.question}</h3>
            <div>
              {currentQuestion.options.map((option, index) => (
                <button 
                  key={index} 
                  onClick={() => handleAnswer(index)}
                  style={{
                    backgroundColor: selectedOption === index ? 
                      (answerStatus === 'correct' ? 'green' : 
                       answerStatus === 'incorrect' ? 'red' : '#f0f0f0') : '',
                    color: selectedOption === index ? 'white' : 'black',
                    margin: '5px',
                    padding: '8px 12px',
                    cursor: 'pointer'
                  }}
                >
                  {option}
                  {selectedOption === index && (
                    <span style={{ marginLeft: '10px' }}>
                      {answerStatus === 'correct' ? '✓' : answerStatus === 'incorrect' ? '✗' : ''}
                    </span>
                  )}
                </button>
              ))}
            </div>
            {answerStatus === 'correct' && <div style={{ color: 'green' }}>Correct!</div>}
            {answerStatus === 'incorrect' && (
              <div style={{ color: 'red' }}>
                Wrong! The correct answer is: {currentQuestion.options[currentQuestion.correctIndex]}
              </div>
            )}
          </div>
                    <div>Time left: {timer}s</div>
        </>
      )}
    </div>
  );
};

export default CustomQuiz;