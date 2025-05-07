import React from 'react';
import { useNavigate } from 'react-router-dom';

const categories = [
  { id: 9, name: 'General Knowledge' },
  { id: 10, name: 'English' },
  { id: 17, name: 'Science' },
  { id: 22, name: 'Geography' },
  { id: 23, name: 'History' },
];

const Categories = () => {
  const navigate = useNavigate();
  const handleCategoryClick = (id) =>
  {
    console.log(id)
    navigate(`/quiz/${id}`)
  }

  return (
    <div className="categories-container">
      <h2 className="categories-title">Select a Category</h2>
      <div className="category-buttons">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className="category-btn"
            onClick={() => handleCategoryClick(cat.name)}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Categories;