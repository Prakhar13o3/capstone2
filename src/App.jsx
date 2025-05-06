import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import './styles.css'; // Import the CSS file
import MiddleSection from './components/MiddleSection';

function App() {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <h1 className="title">Welcome to FactFrenzy!</h1>
        <MiddleSection/>
      </main>
      <Footer />
    </div>
  );
}

export default App;

