import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGame } from '../utils/gameStore';
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
      setError('Number of imposters must be at least one less than total players');
      return;
    }

    // Clear error if validation passes
    setError('');

    // Create game and navigate to host lobby
    const game = createGame(totalPlayers, numImposters);
    navigate(`/host/${game.code}`);
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
  const playerOptions = useMemo(() => Array.from({ length: 17 }, (_, i) => i + 4), []);
  const imposterOptions = useMemo(() => Array.from({ length: Math.max(1, totalPlayers - 1) }, (_, i) => i + 1), [totalPlayers]);

  return (
    <div className="game-setup-page">
      <button className="back-button" onClick={handleBack}>
        ← Back
      </button>
      <div className="game-setup-card">
        <h2 className="setup-title">Create Game</h2>
        
        <div className="setup-form">
          <div className="form-group">
            <label htmlFor="total-players" className="form-label">
              Number of Players
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
              {imposterOptions.map(num => {
                const disabled = num > totalPlayers - 1;
                return (
                  <option key={num} value={num} disabled={disabled}>
                    {num}
                  </option>
                );
              })}
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
            Create Game
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameSetup;

