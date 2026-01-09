import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getGame, GAME_STATE, endGame, selectNextPlayer, startVoting } from '../utils/gameStore';
import './StartingPlayerScreen.css';

function StartingPlayerScreen() {
	const navigate = useNavigate();
	const { code, playerNumber } = useParams();
	const [game, setGame] = useState(null);
	const parsedPlayerNumber = playerNumber ? parseInt(playerNumber, 10) : null;

	// Initial load and poll for game state updates
	useEffect(() => {
		if (!code) return;
		
		const loadGame = async () => {
			const latest = await getGame(code);
			if (latest) {
				setGame(latest);
			}
		};
		
		loadGame();
		
		const interval = setInterval(async () => {
			const latest = await getGame(code);
			if (latest) {
				setGame(latest);
				
				// Check if game has ended
				if (latest.state === GAME_STATE.ENDED) {
					navigate('/');
					return;
				}
				
				// Don't auto-navigate to voting - let each player choose when to vote
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

	const handleNext = async () => {
		if (code && !allPlayersSelected) {
			await selectNextPlayer(code);
		}
	};

	const handleEndGame = async () => {
		if (code) {
			await endGame(code);
			navigate('/');
		}
	};

	const handleVote = async () => {
		if (code && allPlayersSelected) {
			// Transition game to voting state (idempotent - safe to call multiple times)
			await startVoting(code);
			// Navigate only this individual player to voting screen
			navigate(`/voting/${code}/${parsedPlayerNumber}`);
		}
	};

	return (
		<div className="starting-player-page">
			{isHost && (
				<button
					className="corner-end-game-button"
					onClick={handleEndGame}
					title="End Game"
				>
					End Game
				</button>
			)}
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
					</div>
				)}
				{allPlayersSelected && (
					<button
						className="vote-button"
						onClick={handleVote}
					>
						Vote
					</button>
				)}
			</div>
		</div>
	);
}

export default StartingPlayerScreen;

