import React, { useState } from 'react';
import Categories from '../pages/Categories'; // Import the Categories component

const MiddleSection = () => {
  const [showCategories, setShowCategories] = useState(false);

  const handlePlayQuizClick = () => {
    setShowCategories(true); // Show categories when the Play Quiz button is clicked
  };

  return (
    <section className="middle-section">
      {!showCategories ? (
        <div className="buttons-container">
          <button className="action-btn play-quiz-btn" onClick={handlePlayQuizClick}>
            Play Quiz
          </button>
          <button className="action-btn create-quiz-btn">Create Quiz</button>
          <button className="action-btn challenge-btn">Challenge a Friend</button>
        </div>
      ) : (
        <Categories /> // Show categories when showCategories state is true
      )}
    </section>
  );
};

export default MiddleSection;
