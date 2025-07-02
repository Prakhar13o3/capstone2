import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../components/firebase';
import { Link } from 'react-router-dom';

const MyQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, 'quizzes'), where('createdBy', '==', user.email));
      const querySnapshot = await getDocs(q);

      const userQuizzes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setQuizzes(userQuizzes);
    };

    fetchQuizzes();
  }, []);

  return (
    <div>
      <h2>My Quizzes</h2>
      <ul>
        {quizzes.map((quiz) => (
          <li key={quiz.id}>
            <strong>{quiz.title}</strong>
            {' '}
            <Link to={`/custom-quiz/${quiz.id}`}>
              <button>Play Quiz</button>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyQuizzes;
