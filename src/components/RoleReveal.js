import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getGame, getPlayerRole, markPlayerReady, selectStartingPlayer, GAME_STATE, PLAYER_ROLE } from '../utils/gameStore';
import './RoleReveal.css';

function RoleReveal() {
	const navigate = useNavigate();
	const { code, playerNumber } = useParams();
	const [game, setGame] = useState(() => (code ? getGame(code) : null));
	const [hasPressedOK, setHasPressedOK] = useState(false);
	
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
					return;
				}
				
				// Check if we should transition to starting player screen
				if (latest.state === GAME_STATE.START_PLAYER_SELECTED) {
					navigate(`/starting-player/${code}/${parsedPlayerNumber}`);
				}
			} else {
				// Game was deleted/ended
				navigate('/');
			}
		}, 500);
		
		return () => clearInterval(interval);
	}, [code, navigate, parsedPlayerNumber]);

	// Check if player has already pressed OK
	useEffect(() => {
		if (game && parsedPlayerNumber) {
			const ready = game.players?.[parsedPlayerNumber]?.ready || false;
			setHasPressedOK(ready);
		}
	}, [game, parsedPlayerNumber]);

	if (!game || !parsedPlayerNumber) {
		return (
			<div className="role-reveal-page">
				<div className="role-reveal-card">
					<div className="error-message">Game not found or invalid player number.</div>
				</div>
			</div>
		);
	}

	const playerRole = getPlayerRole(code, parsedPlayerNumber);
	const isImposter = playerRole === PLAYER_ROLE.IMPOSTER;

	const handleOK = () => {
		if (hasPressedOK) return; // Prevent double-clicking
		
		markPlayerReady(code, parsedPlayerNumber);
		setHasPressedOK(true);
		
		// Check if all players are ready, then select starting player
		setTimeout(() => {
			const updatedGame = getGame(code);
			if (updatedGame && updatedGame.state === GAME_STATE.ALL_READY) {
				selectStartingPlayer(code);
			}
		}, 100);
	};

	return (
		<div className="role-reveal-page">
			<div className="role-reveal-card">
				{isImposter ? (
					<>
						<h2 className="role-title">You are the Imposter</h2>
						<div className="hint-container">
							<div className="hint-label">Hint:</div>
							<div className="hint-text">{game.hint}</div>
						</div>
						<div className="role-message">
							Try to blend in. You don't know the word.
						</div>
					</>
				) : (
					<>
						<h2 className="role-title">Your Word</h2>
						<div className="word-text">{game.word}</div>
					</>
				)}
				
				<button
					className="ok-button"
					onClick={handleOK}
					disabled={hasPressedOK}
				>
					OK
				</button>
			</div>
		</div>
	);
}

export default RoleReveal;

