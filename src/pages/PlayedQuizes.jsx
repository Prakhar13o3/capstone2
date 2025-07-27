import React, { useEffect, useState } from 'react';
import { db, auth } from '../components/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const PlayedQuizzes = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        alert('You must be logged in!');
        setLoading(false);
        return;
      }

      fetchAttempts(user.email);
    });

    return () => unsubscribe();
  }, []);

  const fetchAttempts = async (userEmail) => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'quizAttempts'),
        where('userId', '==', userEmail)
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        playedAt: doc.data().playedAt?.toDate()
      }));

      data.sort((a, b) => b.playedAt - a.playedAt);
      setAttempts(data);
    } catch (error) {
      console.error("Error loading attempts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this attempt?')) {
      await deleteDoc(doc(db, 'quizAttempts', id));
      setAttempts(prev => prev.filter(a => a.id !== id));
    }
  };

  const deleteAllAttempts = async () => {
    if (!window.confirm('Delete ALL quiz attempts? This cannot be undone.')) return;

    try {
      const batch = writeBatch(db);

      for (const attempt of attempts) {
        batch.delete(doc(db, 'quizAttempts', attempt.id));
      }

      await batch.commit();
      setAttempts([]);
    } catch (error) {
      console.error("Error deleting all attempts:", error);
    }
  };

  if (loading) return <div className="center-text">Loading your quiz attempts...</div>;

  if (!attempts.length) return (
    <div className="center-text">
      <p>No quizzes played yet!</p>
    </div>
  );

  return (
    <div className="played-quizzes-container">
      <h2 className="played-quizzes-title">My Played Quizzes</h2>

      <div className="delete-all-container">
        <button className="glass-button" onClick={deleteAllAttempts}>Delete All History</button>
      </div>

      {attempts.map((attempt) => (
        <div key={attempt.id} className="attempt-card">
          <h3>{attempt.quizTitle || 'Untitled Quiz'}</h3>
          <p>Score: {attempt.score}/{attempt.totalQuestions}</p>
          <p>Played At: {attempt.playedAt?.toLocaleString()}</p>
          <button className="glass-button" onClick={() => handleDelete(attempt.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default PlayedQuizzes;
