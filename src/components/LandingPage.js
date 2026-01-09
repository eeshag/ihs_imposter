import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  const handleCreateGame = () => {
    navigate('/setup');
  };

  const handleJoinGame = () => {
    navigate('/join');
  };

  const handleInfoClick = () => {
    navigate('/info');
  };

  return (
    <div className="landing-page">
      <button className="info-button" onClick={handleInfoClick}>
        ℹ
      </button>
      <div className="landing-content">
        <div className="landing-left">
          <img 
            src="/irvington.png" 
            alt="Irvington High School" 
            className="header-image"
          />
        </div>
        <div className="landing-right">
          <h1 className="landing-title">
            <span className="title-line-1">Blue Crew</span>
            <span className="title-line-2">Imposter</span>
          </h1>
          <div className="button-group">
            <button 
              className="create-game-button"
              onClick={handleCreateGame}
            >
              Create Game
            </button>
            <button 
              className="join-game-button"
              onClick={handleJoinGame}
            >
              Join Game
            </button>
          </div>
        </div>
      </div>
      <div className="landing-bottom-right">
        <img 
          src="/blue_1.jpg" 
          alt="Blue Crew Character" 
          className="bottom-right-image"
        />
      </div>
    </div>
  );
}

export default LandingPage;

