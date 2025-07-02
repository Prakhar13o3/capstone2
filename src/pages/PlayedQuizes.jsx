import React, { useEffect, useState } from 'react';
import { db, auth } from '../components/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const PlayedQuizzes = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [challengeLink, setChallengeLink] = useState('');

  useEffect(() => {
    const fetchAttempts = async () => {
      const user = auth.currentUser;
      if (!user) {
        alert('You must be logged in!');
        return;
      }

      const q = query(
        collection(db, 'quizAttempts'),
        where('userId', '==', user.email)
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAttempts(data);
      setLoading(false);
    };

    fetchAttempts();
  }, []);

  const handleCreateChallenge = async (attempt) => {
  try {
    let quizType = 'custom';
    let quizCategory = '';

    if (attempt.quizId === attempt.quizTitle) {
      quizType = 'api';
      quizCategory = attempt.categoryId; // ✅ Use ID, not title!
    }

    const challengeRef = await addDoc(collection(db, 'challenges'), {
      quizId: attempt.quizId,
      quizTitle: attempt.quizTitle,
      quizType: quizType,
      quizCategory: quizCategory,
      createdBy: auth.currentUser.email,
      createdScore: attempt.score,
      status: 'pending',
      createdAt: new Date(),
    });

    const link = `${window.location.origin}/challenge/${challengeRef.id}`;
    setChallengeLink(link);
    alert(`Challenge link ready! Share this: ${link}`);
  } catch (error) {
    console.error('Error creating challenge:', error);
  }
};


  if (loading) return <p>Loading your quiz attempts...</p>;

  if (!attempts.length) return <p>No quizzes played yet!</p>;

  return (
    <div className="my-quizzes">
      <h2>My Played Quizzes</h2>

      {attempts.map((attempt) => (
        <div key={attempt.id} className="quiz-card">
          <h3>{attempt.quizTitle || 'Untitled Quiz'}</h3>
          <p>Score: {attempt.score}</p>
          <p>Played At: {attempt.playedAt?.toDate().toLocaleString()}</p>
          <button onClick={() => handleCreateChallenge(attempt)}>
            Challenge a Friend
          </button>
        </div>
      ))}

      {challengeLink && (
        <div>
          <p>Share this link with your friend:</p>
          <a href={challengeLink} target="_blank" rel="noopener noreferrer">{challengeLink}</a>
        </div>
      )}
    </div>
  );
};

export default PlayedQuizzes;
