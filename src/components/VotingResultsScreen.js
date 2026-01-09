import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getGame, GAME_STATE, getVotingResults, endGame, getPlayerRole, PLAYER_ROLE, revealImposters } from '../utils/gameStore';
import './VotingResultsScreen.css';

function VotingResultsScreen() {
	const navigate = useNavigate();
	const { code, playerNumber } = useParams();
	const [game, setGame] = useState(() => (code ? getGame(code) : null));
	const [results, setResults] = useState({});
	const parsedPlayerNumber = playerNumber ? parseInt(playerNumber, 10) : null;
	const isHost = parsedPlayerNumber === 1;

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
					return;
				}
				
				// Update results
				if (latest.state === GAME_STATE.VOTING_RESULTS) {
					const votingResults = getVotingResults(code);
					setResults(votingResults);
				}
			} else {
				navigate('/');
			}
		}, 500);
		
		return () => clearInterval(interval);
	}, [code, navigate]);

	// Calculate max votes for bar chart scaling
	const maxVotes = Math.max(...Object.values(results), 1);
	const allPlayerNumbers = game ? Array.from({ length: game.totalPlayers || 0 }, (_, i) => i + 1) : [];
	
	// Find players with most votes
	const maxVoteCount = Math.max(...Object.values(results), 0);
	const topVotedPlayers = allPlayerNumbers.filter(num => results[num] === maxVoteCount && maxVoteCount > 0);

	const handleRevealImposters = () => {
		if (code) {
			revealImposters(code);
		}
	};

	const handleEndGame = () => {
		if (code) {
			endGame(code);
			navigate('/');
		}
	};

	if (!game || !parsedPlayerNumber) {
		return (
			<div className="voting-results-page">
				<div className="voting-results-card">
					<div className="error-message">Game not found or invalid player number.</div>
				</div>
			</div>
		);
	}

	// Get actual imposters
	const actualImposters = [];
	allPlayerNumbers.forEach(num => {
		const role = getPlayerRole(code, num);
		if (role === PLAYER_ROLE.IMPOSTER) {
			actualImposters.push(num);
		}
	});

	return (
		<div className="voting-results-page">
			{isHost && (
				<button
					className="corner-end-game-button"
					onClick={handleEndGame}
					title="End Game"
				>
					End Game
				</button>
			)}
			<div className="voting-results-card">
				<h2 className="results-title">Voting Results</h2>
				
				<div className="bar-chart-container">
					{allPlayerNumbers.map(playerNum => {
						const votes = results[playerNum] || 0;
						const percentage = maxVotes > 0 ? (votes / maxVotes) * 100 : 0;
						const isTopVoted = topVotedPlayers.includes(playerNum);
						
						return (
							<div key={playerNum} className="bar-chart-item">
								<div className="bar-label">Player {playerNum}</div>
								<div className="bar-wrapper">
									<div
										className={`bar ${isTopVoted ? 'highlighted' : ''}`}
										style={{ width: `${percentage}%` }}
									>
										<span className="bar-value">{votes}</span>
									</div>
								</div>
							</div>
						);
					})}
				</div>

				{game.impostersRevealed && (
					<div className="imposter-reveal">
						<div className="imposter-reveal-title">The real imposters were:</div>
						<div className="imposter-list">
							{actualImposters.map(num => (
								<div key={num} className="imposter-badge">
									Player {num} - IMPOSTER
								</div>
							))}
						</div>
					</div>
				)}

				{isHost && !game.impostersRevealed && (
					<div className="host-controls">
						<button
							className="reveal-imposters-button"
							onClick={handleRevealImposters}
						>
							Reveal Real Imposters
						</button>
						<button
							className="end-game-button"
							onClick={handleEndGame}
						>
							End Game
						</button>
					</div>
				)}

				{isHost && game.impostersRevealed && (
					<div className="host-controls">
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

export default VotingResultsScreen;
