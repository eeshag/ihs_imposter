import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGame, tryJoinGame, setPlayerNumberForGame, GAME_STATE } from '../utils/gameStore';
import './JoinGame.css';

function JoinGame() {
  const navigate = useNavigate();
  const [gameCode, setGameCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle | success | error-invalid | error-full
  const [playerNumber, setPlayerNumber] = useState(null);
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
    setPlayerNumber(null);
    // Clear error when user starts typing
    if (status !== 'idle') {
      setStatus('idle');
    }
  };

  const handleEnter = () => {
    if (!gameCode.trim()) {
      return;
    }

    const normalized = gameCode.trim().toUpperCase();
    const game = getGame(normalized);
    if (!game) {
      setStatus('error-invalid');
      return;
    }

    const result = tryJoinGame(normalized);
    if (!result.ok) {
      if (result.reason === 'full') {
        setStatus('error-full');
      } else {
        setStatus('error-invalid');
      }
      return;
    }

    const assignedPlayerNumber = result.playerNumber ?? null;
    setPlayerNumber(assignedPlayerNumber);
    
    // Store player number for this game
    if (assignedPlayerNumber) {
      setPlayerNumberForGame(normalized, assignedPlayerNumber);
    }
    
    setStatus('success');
    
    // Check if game has already started (get fresh game state after joining)
    const updatedGame = getGame(normalized);
    if (updatedGame && (updatedGame.state === GAME_STATE.ROLE_REVEAL || updatedGame.state === GAME_STATE.ALL_READY)) {
      navigate(`/role-reveal/${normalized}/${assignedPlayerNumber}`);
    } else if (updatedGame && updatedGame.state === GAME_STATE.START_PLAYER_SELECTED) {
      navigate(`/starting-player/${normalized}/${assignedPlayerNumber}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleEnter();
    }
  };

  // Poll for game state when successfully joined
  useEffect(() => {
    if (status === 'success' && gameCode && playerNumber) {
      const interval = setInterval(() => {
        const game = getGame(gameCode.toUpperCase());
        if (game) {
          // If game has started, navigate to role reveal
          if (game.state === GAME_STATE.ROLE_REVEAL || game.state === GAME_STATE.ALL_READY) {
            navigate(`/role-reveal/${gameCode.toUpperCase()}/${playerNumber}`);
          } else if (game.state === GAME_STATE.START_PLAYER_SELECTED) {
            navigate(`/starting-player/${gameCode.toUpperCase()}/${playerNumber}`);
          }
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [status, gameCode, playerNumber, navigate]);

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
            {playerNumber ? `Success! You are Player ${playerNumber}.` : 'Success!'}
            <br />
            Waiting for the host to start the game.
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


