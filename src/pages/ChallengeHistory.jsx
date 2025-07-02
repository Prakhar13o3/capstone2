import React, { useEffect, useState } from 'react';
import { db, auth } from '../components/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const ChallengeHistory = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenges = async () => {
      const user = auth.currentUser;
      if (!user) {
        alert('You must be logged in to view your challenge history.');
        return;
      }

      const q = query(
        collection(db, 'challenges'),
        where('createdBy', '==', user.email)
      );

      const q2 = query(
        collection(db, 'challenges'),
        where('opponentId', '==', user.email)
      );

      const [createdSnapshot, acceptedSnapshot] = await Promise.all([
        getDocs(q),
        getDocs(q2),
      ]);

      const createdChallenges = createdSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'created'
      }));

      const acceptedChallenges = acceptedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'accepted'
      }));

      const all = [...createdChallenges, ...acceptedChallenges];
      all.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());

      setChallenges(all);
      setLoading(false);
    };

    fetchChallenges();
  }, []);

  if (loading) return <p>Loading challenge history...</p>;

  if (!challenges.length) return <p>No challenges yet!</p>;

  return (
    <div className="challenge-history">
      <h2>My Challenge History</h2>
      {challenges.map(challenge => {
        let result = '—';
        if (challenge.status === 'completed') {
          if (challenge.createdScore > challenge.opponentScore) {
            result = challenge.type === 'created' ? 'You Won' : 'You Lost';
          } else if (challenge.createdScore < challenge.opponentScore) {
            result = challenge.type === 'created' ? 'You Lost' : 'You Won';
          } else {
            result = 'Draw';
          }
        }

        return (
          <div key={challenge.id} className="challenge-card">
            <h3>{challenge.type === 'created' ? 'You challenged someone' : 'You accepted a challenge'}</h3>
            <p>Quiz ID: {challenge.quizId}</p>
            <p>Your Score: {challenge.type === 'created' ? challenge.createdScore : challenge.opponentScore || '—'}</p>
            <p>
              {challenge.type === 'created'
                ? `Opponent: ${challenge.opponentId || '—'}`
                : `Original Player: ${challenge.createdBy}`}
            </p>
            {challenge.opponentScore !== undefined && (
              <p>Opponent Score: {challenge.opponentScore}</p>
            )}
            <p>Status: {challenge.status}</p>
            {challenge.status === 'completed' && (
              <p>Result: {result}</p>
            )}
            <p>Created At: {challenge.createdAt?.toDate().toLocaleString()}</p>
            {challenge.completedAt && (
              <p>Completed At: {challenge.completedAt?.toDate().toLocaleString()}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChallengeHistory;
