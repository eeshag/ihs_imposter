import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import GameSetup from './components/GameSetup';
import InfoPage from './components/InfoPage';
import JoinGame from './components/JoinGame';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/setup" element={<GameSetup />} />
        <Route path="/info" element={<InfoPage />} />
        <Route path="/join" element={<JoinGame />} />
      </Routes>
    </div>
  );
}

export default App;
