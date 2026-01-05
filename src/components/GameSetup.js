import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GameSetup.css';

function GameSetup() {
  const navigate = useNavigate();
  const [totalPlayers, setTotalPlayers] = useState(6);
  const [numImposters, setNumImposters] = useState(1);
  const [error, setError] = useState('');

  const handleBack = () => {
    navigate('/');
  };

  const handleStartGame = () => {
    // Validation: number_of_imposters <= total_players - 1
    if (numImposters > totalPlayers - 1) {
      setError('Error: number of imposters must be at least one less than the number of total players');
      return;
    }

    // Clear error if validation passes
    setError('');
    
    // TODO: Navigate to next screen when implemented
    console.log('Game setup:', { totalPlayers, numImposters });
  };

  const handleTotalPlayersChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setTotalPlayers(value);
    setError(''); // Clear error when user changes selection
  };

  const handleNumImpostersChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setNumImposters(value);
    setError(''); // Clear error when user changes selection
  };

  // Generate options for dropdowns
  const playerOptions = Array.from({ length: 10 }, (_, i) => i + 3); // 3 to 12
  const imposterOptions = Array.from({ length: 11 }, (_, i) => i + 1); // 1 to 11

  return (
    <div className="game-setup-page">
      <button className="back-button" onClick={handleBack}>
        ← Back
      </button>
      <div className="game-setup-card">
        <h2 className="setup-title">Game Setup</h2>
        
        <div className="setup-form">
          <div className="form-group">
            <label htmlFor="total-players" className="form-label">
              Total Players
            </label>
            <select
              id="total-players"
              className="form-select"
              value={totalPlayers}
              onChange={handleTotalPlayersChange}
            >
              {playerOptions.map(num => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="num-imposters" className="form-label">
              Number of Imposters
            </label>
            <select
              id="num-imposters"
              className="form-select"
              value={numImposters}
              onChange={handleNumImpostersChange}
            >
              {imposterOptions.map(num => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            className="start-game-button"
            onClick={handleStartGame}
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameSetup;

