import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../components/firebase';
import { useNavigate } from 'react-router-dom';

const CreateQuiz = () => {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], correctIndex: 0 }
  ]);

  const navigate = useNavigate();


  const handleAddQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctIndex: 0 }]);
  };

  const handleChange = (qIndex, field, value) => {
    const updated = [...questions];
    if (field === 'question') updated[qIndex].question = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleCorrectChange = (qIndex, value) => {
    const updated = [...questions];
    updated[qIndex].correctIndex = parseInt(value);
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user){
      alert("You must be logged in to create a quiz.");
      navigate('/login');
    return;}

    try {
      await addDoc(collection(db, 'quizzes'), {
        title,
        createdBy: user.email,
        questions
      });
      alert("Quiz Created!");
      navigate('/');
    } catch (error) {
      console.error("Error saving quiz:", error);
    }
  };

  return (
    <div className="signup-container">
      <h1 className="welcome-message">Create Your Quiz</h1>
      <form className="signup-form" onSubmit={handleSubmit}>
        <label>Quiz Title:
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>

        {questions.map((q, i) => (
          <div key={i} style={{ marginBottom: '30px' }}>
            <label>Question {i + 1}
              <input type="text" value={q.question} onChange={(e) => handleChange(i, 'question', e.target.value)} />
            </label>
            {[0, 1, 2, 3].map((j) => (
              <label key={j}>Option {j + 1}
                <input
                  type="text"
                  value={q.options[j]}
                  onChange={(e) => handleOptionChange(i, j, e.target.value)}
                />
              </label>
            ))}
            <label>
              Correct Option (0-3):
              <input
                type="number"
                min="0"
                max="3"
                value={q.correctIndex}
                onChange={(e) => handleCorrectChange(i, e.target.value)}
              />
            </label>
          </div>
        ))}

        <button type="button" onClick={handleAddQuestion}>Add Question</button>
        <button type="submit">Save Quiz</button>
      </form>
    </div>
  );
};

export default CreateQuiz;
