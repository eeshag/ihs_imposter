import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getGame, GAME_STATE, submitVote, endGame, getPlayerNumberForGame } from '../utils/gameStore';
import './VotingScreen.css';

function VotingScreen() {
	const navigate = useNavigate();
	const { code, playerNumber } = useParams();
	const [game, setGame] = useState(null);
	const [selectedPlayers, setSelectedPlayers] = useState([]);
	const [hasSubmitted, setHasSubmitted] = useState(false);
	const parsedPlayerNumber = playerNumber ? parseInt(playerNumber, 10) : null;
	const isHost = parsedPlayerNumber === 1;

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
				
				// Check if we've moved to results
				if (latest.state === GAME_STATE.VOTING_RESULTS) {
					navigate(`/voting-results/${code}/${parsedPlayerNumber}`);
					return;
				}
				
				// Check if this player has already voted
				if (latest.votes && latest.votes[parsedPlayerNumber]) {
					setHasSubmitted(true);
				}
			} else {
				navigate('/');
			}
		}, 500);
		
		return () => clearInterval(interval);
	}, [code, navigate, parsedPlayerNumber]);

	// Initialize hasSubmitted from game state
	useEffect(() => {
		if (game && parsedPlayerNumber && game.votes && game.votes[parsedPlayerNumber]) {
			setHasSubmitted(true);
		}
	}, [game, parsedPlayerNumber]);

	if (!game || !parsedPlayerNumber) {
		return (
			<div className="voting-page">
				<div className="voting-card">
					<div className="error-message">Game not found or invalid player number.</div>
				</div>
			</div>
		);
	}

	const numImposters = game.numImposters || 1;
	const totalPlayers = game.totalPlayers || 0;
	const allPlayerNumbers = Array.from({ length: totalPlayers }, (_, i) => i + 1);
	const voteCount = game.voteCount || 0;

	const handleTogglePlayer = (playerNum) => {
		if (hasSubmitted) return;
		
		setSelectedPlayers(prev => {
			if (prev.includes(playerNum)) {
				return prev.filter(n => n !== playerNum);
			} else {
				if (prev.length < numImposters) {
					return [...prev, playerNum];
				}
				return prev;
			}
		});
	};

	const handleSubmitVote = async () => {
		if (hasSubmitted) return;
		if (selectedPlayers.length !== numImposters) return;
		
		await submitVote(code, parsedPlayerNumber, selectedPlayers);
		setHasSubmitted(true);
	};

	const handleEndGame = async () => {
		if (code) {
			await endGame(code);
			navigate('/');
		}
	};

	const canSubmit = selectedPlayers.length === numImposters && !hasSubmitted;

	return (
		<div className="voting-page">
			{isHost && (
				<button
					className="corner-end-game-button"
					onClick={handleEndGame}
					title="End Game"
				>
					End Game
				</button>
			)}
			<div className="voting-card">
				<h2 className="voting-title">Vote for the Imposters</h2>
				<div className="voting-subtext">
					Choose carefully — once you submit, you can't change your vote.
				</div>
				
				{hasSubmitted ? (
					<>
						<div className="vote-submitted-message">
							Vote submitted. Waiting for other players…
						</div>
						<div className="vote-progress">
							Votes submitted: {voteCount} / {totalPlayers}
						</div>
						<div className="loading-indicator">
							<div className="spinner"></div>
						</div>
					</>
				) : (
					<>
						<div className="voting-instructions">
							Select exactly {numImposters} player{numImposters !== 1 ? 's' : ''} you think {numImposters === 1 ? 'is' : 'are'} the imposter{numImposters !== 1 ? 's' : ''}:
						</div>
						<div className="player-list">
							{allPlayerNumbers.map(playerNum => {
								const isSelected = selectedPlayers.includes(playerNum);
								const isDisabled = !isSelected && selectedPlayers.length >= numImposters;
								return (
									<label
										key={playerNum}
										className={`player-option ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
									>
										<input
											type="checkbox"
											checked={isSelected}
											onChange={() => handleTogglePlayer(playerNum)}
											disabled={isDisabled}
										/>
										<span className="player-label">Player {playerNum}</span>
									</label>
								);
							})}
						</div>
						{selectedPlayers.length < numImposters && (
							<div className="selection-error">
								You must select exactly {numImposters} player{numImposters !== 1 ? 's' : ''}.
							</div>
						)}
						<button
							className="submit-vote-button"
							onClick={handleSubmitVote}
							disabled={!canSubmit}
						>
							Submit Vote
						</button>
					</>
				)}
			</div>
		</div>
	);
}

export default VotingScreen;
