import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import './styles.css'; // Import the CSS file

function App() {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <h1 className="title">Welcome to FactFrenzy!</h1>
        {/* Add your game components here like Categories, Quiz Modes, etc. */}
      </main>
      <Footer />
    </div>
  );
}

export default App;

