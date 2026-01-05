import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './JoinGame.css';

function JoinGame() {
  const navigate = useNavigate();
  const [gameCode, setGameCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle | success | error-invalid | error-full
  const inputRef = useRef(null);

  // Auto-focus on input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleBack = () => {
    navigate('/');
  };

  const handleGameCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setGameCode(value);
    // Clear error when user starts typing
    if (status !== 'idle') {
      setStatus('idle');
    }
  };

  const handleEnter = async () => {
    if (!gameCode.trim()) {
      return;
    }

    // TODO: Replace with actual API call to backend
    // For now, this is a mock implementation
    try {
      // Simulate API call
      // const response = await fetch(`/api/games/${gameCode}/join`, { method: 'POST' });
      // const data = await response.json();
      
      // Mock responses for testing different states:
      // Uncomment one of these to test different states:
      
      // Success case:
      // setStatus('success');
      
      // Invalid code case:
      // setStatus('error-invalid');
      
      // Game full case:
      // setStatus('error-full');
      
      // For now, default to success to show the waiting screen
      setStatus('success');
      
      // Real implementation would be:
      // if (response.ok) {
      //   setStatus('success');
      // } else if (response.status === 404) {
      //   setStatus('error-invalid');
      // } else if (response.status === 409) {
      //   setStatus('error-full');
      // }
    } catch (error) {
      setStatus('error-invalid');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleEnter();
    }
  };

  // Success screen (waiting for host)
  if (status === 'success') {
    return (
      <div className="join-game-page">
        <button className="back-button" onClick={handleBack}>
          ← Back
        </button>
        <div className="join-game-card">
          <h2 className="join-title">Join Game</h2>
          <div className="success-message">
            Success! Waiting for the host to start the game.
          </div>
        </div>
      </div>
    );
  }

  // Main join screen
  return (
    <div className="join-game-page">
      <button className="back-button" onClick={handleBack}>
        ← Back
      </button>
      <div className="join-game-card">
        <h2 className="join-title">Join Game</h2>
        
        <div className="join-form">
          <input
            ref={inputRef}
            type="text"
            className="game-code-input"
            placeholder="Game Code"
            value={gameCode}
            onChange={handleGameCodeChange}
            onKeyPress={handleKeyPress}
            maxLength={10}
          />
          
          <button
            className="enter-button"
            onClick={handleEnter}
            disabled={!gameCode.trim()}
          >
            Enter
          </button>

          {status === 'error-invalid' && (
            <div className="error-message">
              Error: invalid game code
            </div>
          )}

          {status === 'error-full' && (
            <div className="error-message">
              Sorry, this game is full!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default JoinGame;

