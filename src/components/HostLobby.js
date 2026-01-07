import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getGame, startGame, setPlayerNumberForGame, GAME_STATE } from '../utils/gameStore';
import './HostLobby.css';

function HostLobby() {
	const navigate = useNavigate();
	const { code } = useParams();
	const [game, setGame] = useState(() => (code ? getGame(code) : null));

	// Store host player number (always 1)
	useEffect(() => {
		if (code) {
			setPlayerNumberForGame(code, 1);
		}
	}, [code]);

	// Poll localStorage to reflect joined players in this tab
	useEffect(() => {
		if (!code) return;
		
		const interval = setInterval(() => {
			const latest = getGame(code);
			if (latest) {
				setGame(latest);
				
				// If game has started, navigate to role reveal
				if (latest.state === GAME_STATE.ROLE_REVEAL || latest.state === GAME_STATE.ALL_READY) {
					navigate(`/role-reveal/${code}/1`);
				} else if (latest.state === GAME_STATE.START_PLAYER_SELECTED) {
					navigate(`/starting-player/${code}/1`);
				}
			}
		}, 500);
		return () => clearInterval(interval);
	}, [code, navigate]);

	const playersJoined = game?.joinedCount ?? 0;
	const totalPlayers = game?.totalPlayers ?? 0;
	const isFull = playersJoined >= totalPlayers && totalPlayers > 0;

	const handleBack = () => {
		navigate('/');
	};

	const handleStart = () => {
		if (!code) return;
		
		// Start the game: assign roles and select word/hint
		const updatedGame = startGame(code);
		if (updatedGame) {
			// Navigate to role reveal screen
			navigate(`/role-reveal/${code}/1`);
		}
	};

	const displayCode = useMemo(() => (game?.code || code || '').toString().toUpperCase(), [game, code]);

	if (!game) {
		return (
			<div className="host-lobby-page">
				<button className="back-button" onClick={handleBack}>
					← Back
				</button>
				<div className="host-lobby-card">
					<h2 className="lobby-title">Host Lobby</h2>
					<div className="error-message">Game not found.</div>
				</div>
			</div>
		);
	}

	return (
		<div className="host-lobby-page">
			<button className="back-button" onClick={handleBack}>
				← Back
			</button>
			<div className="host-lobby-card">
				<h2 className="lobby-title">Host Lobby</h2>
				<div className="game-code-label">Game Code</div>
				<div className="game-code-value">{displayCode}</div>
				<div className="code-subtext">Share this code with players to join</div>

				<div className="players-count">
					Players Joined: {playersJoined} / {totalPlayers}
				</div>

				<button
					className="start-button"
					onClick={handleStart}
					disabled={!isFull}
				>
					Start Game
				</button>
			</div>
		</div>
	);
}

export default HostLobby;


