import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Categories from './pages/Categories';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import CustomQuiz from './pages/CustomQuiz';
import { Signup } from './pages/Signup';
import { Login } from './pages/Login';
import './styles.css';
import CreateQuiz from './pages/CreateQuiz';
import MyQuizzes from './pages/MyQuizes';
import PlayedQuizzes from './pages/PlayedQuizes';
import Challenge from './pages/Challenges';
import ChallengeHistory from './pages/ChallengeHistory';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/quiz/:categoryId" element={<Quiz />} />
            <Route path="/results" element={<Results />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/createquiz" element={<CreateQuiz />} />
            <Route path="/myquizes" element={<MyQuizzes />} />
            <Route path="/custom-quiz/:quizId" element={<CustomQuiz />} />
            <Route path="/playedquizes" element={<PlayedQuizzes />} />
            <Route path="/challenge/:id" element={<Challenge />} />
            <Route path="/challengehistory" element={<ChallengeHistory />} />
            <Route path="*" element={<Home />} /> {/* Fallback route */}
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;