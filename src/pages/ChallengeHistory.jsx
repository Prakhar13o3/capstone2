import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db, auth } from '../components/firebase';
import { useNavigate } from 'react-router-dom';


const ChallengeHistory = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedChallenge, setExpandedChallenge] = useState(null);
  const [attempts, setAttempts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChallenges = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const q = query(collection(db, 'challenges'), where('createdBy', '==', user.email));
        const querySnapshot = await getDocs(q);
        const challengesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }));
        setChallenges(challengesData);
      } catch (error) {
        console.error("Error loading challenges:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [navigate]);

  const fetchAttempts = async (challengeId) => {
    try {
      const q = query(collection(db, 'quizAttempts'), where('challengeId', '==', challengeId));
      const querySnapshot = await getDocs(q);
      const attemptsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        playedAt: doc.data().playedAt?.toDate()
      }));
      setAttempts(prev => ({ ...prev, [challengeId]: attemptsData }));
    } catch (error) {
      console.error("Error loading attempts:", error);
    }
  };

  const toggleChallenge = async (challengeId) => {
    if (expandedChallenge === challengeId) {
      setExpandedChallenge(null);
    } else {
      setExpandedChallenge(challengeId);
      if (!attempts[challengeId]) {
        await fetchAttempts(challengeId);
      }
    }
  };

  const deleteChallenge = async (challengeId) => {
    if (!window.confirm('Delete this challenge and all its attempts?')) return;

    try {
      const batch = writeBatch(db);

      const attemptsQuery = query(collection(db, 'quizAttempts'), where('challengeId', '==', challengeId));
      const attemptsSnapshot = await getDocs(attemptsQuery);
      attemptsSnapshot.forEach(doc => batch.delete(doc.ref));

      batch.delete(doc(db, 'challenges', challengeId));
      await batch.commit();

      setChallenges(prev => prev.filter(c => c.id !== challengeId));
      setAttempts(prev => {
        const newAttempts = { ...prev };
        delete newAttempts[challengeId];
        return newAttempts;
      });
    } catch (error) {
      console.error("Error deleting challenge:", error);
    }
  };

  const deleteAllChallenges = async () => {
    if (!window.confirm('Delete ALL challenges and attempts? This cannot be undone.')) return;

    try {
      const batch = writeBatch(db);

      for (const challenge of challenges) {
        const attemptsQuery = query(collection(db, 'quizAttempts'), where('challengeId', '==', challenge.id));
        const attemptsSnapshot = await getDocs(attemptsQuery);
        attemptsSnapshot.forEach(doc => batch.delete(doc.ref));
        batch.delete(doc(db, 'challenges', challenge.id));
      }

      await batch.commit();
      setChallenges([]);
      setAttempts({});
    } catch (error) {
      console.error("Error deleting all challenges:", error);
    }
  };

  if (loading) return <div className="loading-message">Loading challenges...</div>;

  return (
    <div className="challenge-container">
      <h2 className="challenge-heading">Challenge History</h2>

      {challenges.length === 0 ? (
        <div className="empty-message">
          <p>No challenges found</p>
          <button className="glass-button" onClick={() => navigate('/myquizes')}>Create Challenge</button>
        </div>
      ) : (
        <div>
          <div className="centered-button">
            <button className="glass-button" onClick={deleteAllChallenges}>Delete All History</button>
          </div>

          {challenges.map(challenge => (
            <div key={challenge.id} className="challenge-box">
              <div className="challenge-header" onClick={() => toggleChallenge(challenge.id)}>
                <h3>{challenge.quizTitle || 'Untitled Quiz'}</h3>
                <p>Created: {challenge.createdAt?.toLocaleString() || 'N/A'}</p>
                <button
                  className="glass-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChallenge(challenge.id);
                  }}
                >
                  Delete
                </button>
              </div>

              {expandedChallenge === challenge.id && (
                <div className="attempts-section">
                  <h4>Attempts</h4>
                  {attempts[challenge.id]?.length > 0 ? (
                    <table className="attempts-table">
                      <thead>
                        <tr>
                          <th>Player</th>
                          <th>Score</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attempts[challenge.id].map(attempt => (
                          <tr key={attempt.id}>
                            <td>{attempt.userId}</td>
                            <td>{attempt.score}/{attempt.totalQuestions}</td>
                            <td>{attempt.playedAt?.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No attempts</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChallengeHistory;
