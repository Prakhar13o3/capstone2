import React, { useState } from 'react';
import Quiz from './Quiz';

const Categories = () => {
  const categories = ['English', 'General Knowledge', 'Science', 'Geography'];
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div className="categories-container">
      <h3 className="categories-title">Select a Category</h3>
      <div className="category-buttons">
        {categories.map((category, index) => (
          <button
            key={index}
            className="category-btn"
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {selectedCategory && <Quiz category={selectedCategory} />}
    </div>
  );
};

export default Categories;
