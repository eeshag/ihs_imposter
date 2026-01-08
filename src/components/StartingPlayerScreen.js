import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getGame, GAME_STATE, endGame, selectNextPlayer } from '../utils/gameStore';
import './StartingPlayerScreen.css';

function StartingPlayerScreen() {
	const navigate = useNavigate();
	const { code, playerNumber } = useParams();
	const [game, setGame] = useState(() => (code ? getGame(code) : null));
	const parsedPlayerNumber = playerNumber ? parseInt(playerNumber, 10) : null;

	// Poll for game state updates
	useEffect(() => {
		if (!code) return;
		
		const interval = setInterval(() => {
			const latest = getGame(code);
			if (latest) {
				setGame(latest);
				
				// Check if game has ended
				if (latest.state === GAME_STATE.ENDED) {
					navigate('/');
				}
			} else {
				// Game was deleted/ended
				navigate('/');
			}
		}, 500);
		
		return () => clearInterval(interval);
	}, [code, navigate]);

	if (!game) {
		return (
			<div className="starting-player-page">
				<div className="starting-player-card">
					<div className="error-message">Game not found.</div>
				</div>
			</div>
		);
	}

	const startingPlayerNumber = game.startingPlayer;
	const isHost = parsedPlayerNumber === 1;
	const selectedPlayers = game.selectedPlayers || [];
	const totalPlayers = game.totalPlayers || 0;
	const currentSelectionIndex = selectedPlayers.length;
	const allPlayersSelected = selectedPlayers.length >= totalPlayers;

	const handleNext = () => {
		if (code && !allPlayersSelected) {
			selectNextPlayer(code);
		}
	};

	const handleEndGame = () => {
		if (code) {
			endGame(code);
			navigate('/');
		}
	};

	return (
		<div className="starting-player-page">
			<div className="starting-player-card">
				<h2 className="starting-title">
					Player {startingPlayerNumber} {currentSelectionIndex === 1 ? 'Starts!' : 'Goes Next!'}
				</h2>
				<div className="starting-subtitle">
					Begin describing the word (or bluff if you're the imposter)
				</div>
				{totalPlayers > 0 && (
					<div className="selection-progress">
						Player {currentSelectionIndex} of {totalPlayers}
					</div>
				)}
				{isHost && (
					<div className="host-buttons">
						{!allPlayersSelected && (
							<button
								className="next-button"
								onClick={handleNext}
							>
								Next
							</button>
						)}
						{allPlayersSelected && (
							<div className="all-selected-message">
								All players have been selected!
							</div>
						)}
						<button
							className="end-game-button"
							onClick={handleEndGame}
						>
							End Game
						</button>
					</div>
				)}
			</div>
		</div>
	);
}

export default StartingPlayerScreen;

