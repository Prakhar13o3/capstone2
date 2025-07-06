import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db, auth } from '../components/firebase';
import { Link } from 'react-router-dom';

const MyQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [challengeLink, setChallengeLink] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(collection(db, 'quizzes'), where('createdBy', '==', user.email));
        const snapshot = await getDocs(q);

        const userQuizzes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setQuizzes(userQuizzes);
      } catch (error) {
        console.error("Error loading quizzes:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCreateChallenge = async (quiz) => {
    try {
      if (!quiz?.id) {
        alert('Invalid quiz data');
        return;
      }

      const challengeRef = await addDoc(collection(db, 'challenges'), {
        quizId: quiz.id,
        quizTitle: quiz.title || 'Untitled Quiz',
        quizType: 'custom',
        createdBy: auth.currentUser.email,
        createdScore: 0,
        status: 'pending',
        createdAt: new Date(),
        questions: quiz.questions || []
      });

      // ONLY CHANGE MADE: Added hash (#) before the challenge path
      const link = `${window.location.origin}/#/challenge/${challengeRef.id}`;
      setChallengeLink(link);
      navigator.clipboard.writeText(link);
      alert(`Challenge link copied to clipboard! Share this: ${link}`);
    } catch (error) {
      console.error('Error creating challenge:', error);
      alert('Failed to create challenge');
    }
  };

  if (loading) return <div>Loading your quizzes...</div>;

  return (
    <div className="my-quizzes-container">
      <h2>My Quizzes</h2>
      
      {quizzes.length === 0 ? (
        <p>You haven't created any quizzes yet.</p>
      ) : (
        <div className="quiz-list">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="quiz-item">
              <h3>{quiz.title || 'Untitled Quiz'}</h3>
              <div className="quiz-actions">
                <Link to={`/custom-quiz/${quiz.id}`}>
                  <button className="play-button">Play Quiz</button>
                </Link>
                <button 
                  onClick={() => handleCreateChallenge(quiz)}
                  className="challenge-button"
                >
                  Challenge a Friend
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {challengeLink && (
        <div className="challenge-link">
          <p>Share this challenge link:</p>
          <input 
            type="text" 
            value={challengeLink} 
            readOnly 
            onClick={(e) => e.target.select()}
          />
        </div>
      )}
    </div>
  );
};

export default MyQuizzes;