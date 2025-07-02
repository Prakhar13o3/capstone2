// ✅ Add at top if not already
import { useNavigate } from 'react-router-dom';

const Quiz = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate(); // ✅

  // other state stays same
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [isQuizOver, setIsQuizOver] = useState(false);
  const [timer, setTimer] = useState(30);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categoryMapping = {
    English: 'arts_and_literature',
    'General Knowledge': 'general_knowledge',
    Science: 'science',
    Geography: 'geography',
    History: 'history',
  };

  // ✅ ENFORCE LOGIN BEFORE PLAYING
  useEffect(() => {
    if (!auth.currentUser) {
      alert('Please log in first!');
      navigate('/login');
    }
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const apiCategory = categoryMapping[categoryId];
        const response = await fetch(
          `https://the-trivia-api.com/api/questions?categories=${apiCategory}&limit=10&difficulty=medium`
        );

        const data = await response.json();
        setQuestions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [categoryId]);

  // ✅ SAME TIMER + SHUFFLING LOGIC (unchanged)

  useEffect(() => {
    if (!loading && !isQuizOver && timer === 0) {
      handleAnswer();
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
      setTimer(30);
    } else {
      setIsQuizOver(true);
    }
  };

  useEffect(() => {
    if (isQuizOver) {
      saveAttempt();
    }
  }, [isQuizOver]);

  const saveAttempt = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await addDoc(collection(db, 'quizAttempts'), {
        userId: user.email,
        quizId: categoryId,      // ✅ for API quiz: category name
        quizTitle: categoryId,   // ✅
        quizType: 'api',         // ✅ distinguish type
        score: score,
        playedAt: new Date(),
      });

      console.log('API quiz attempt saved!');
    } catch (error) {
      console.error('Error saving attempt:', error);
    }
  };

  if (loading) return <p>Loading questions...</p>;
  if (error) return <p>{error}</p>;

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
