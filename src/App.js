import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import GameSetup from './components/GameSetup';
import InfoPage from './components/InfoPage';
import JoinGame from './components/JoinGame';
import HostLobby from './components/HostLobby';
import RoleReveal from './components/RoleReveal';
import StartingPlayerScreen from './components/StartingPlayerScreen';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/setup" element={<GameSetup />} />
        <Route path="/info" element={<InfoPage />} />
        <Route path="/join" element={<JoinGame />} />
        <Route path="/host/:code" element={<HostLobby />} />
        <Route path="/role-reveal/:code/:playerNumber" element={<RoleReveal />} />
        <Route path="/starting-player/:code/:playerNumber" element={<StartingPlayerScreen />} />
      </Routes>
    </div>
  );
}

export default App;
