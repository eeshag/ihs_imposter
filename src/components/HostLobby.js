import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getGame, startGame, endGame, setPlayerNumberForGame, GAME_STATE } from '../utils/gameStore';
import './HostLobby.css';

function HostLobby() {
	const navigate = useNavigate();
	const { code } = useParams();
	const [game, setGame] = useState(null);
	const [copied, setCopied] = useState(false);

	// Store host player number (always 1)
	useEffect(() => {
		if (code) {
			setPlayerNumberForGame(code, 1);
		}
	}, [code]);

	// Initial load and poll for game updates
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

	const handleStart = async () => {
		if (!code) return;
		
		try {
			// Start the game: assign roles and select word/hint
			const updatedGame = await startGame(code);
			if (updatedGame) {
				// Navigate to role reveal screen
				navigate(`/role-reveal/${code}/1`);
			}
		} catch (error) {
			console.error('Failed to start game:', error);
		}
	};

	const handleCancel = async () => {
		if (!code) return;
		
		try {
			// End the game - this will mark it as ended and all players will be redirected
			await endGame(code);
			// Navigate back to home
			navigate('/');
		} catch (error) {
			console.error('Failed to cancel game:', error);
			// Navigate anyway
			navigate('/');
		}
	};

	const displayCode = useMemo(() => (game?.code || code || '').toString().toUpperCase(), [game, code]);

	const handleCopyCode = async () => {
		const codeToCopy = displayCode;
		if (!codeToCopy) return;

		try {
			await navigator.clipboard.writeText(codeToCopy);
			setCopied(true);
			setTimeout(() => {
				setCopied(false);
			}, 2000);
		} catch (err) {
			// Fallback for older browsers
			const textArea = document.createElement('textarea');
			textArea.value = codeToCopy;
			textArea.style.position = 'fixed';
			textArea.style.opacity = '0';
			document.body.appendChild(textArea);
			textArea.select();
			try {
				document.execCommand('copy');
				setCopied(true);
				setTimeout(() => {
					setCopied(false);
				}, 2000);
			} catch (e) {
				console.error('Failed to copy code', e);
			}
			document.body.removeChild(textArea);
		}
	};

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
				<div className="game-code-container">
					<div className="game-code-value">{displayCode}</div>
					<button
						className="copy-button"
						onClick={handleCopyCode}
						title={copied ? "Copied!" : "Copy code"}
					>
						{copied ? "✓" : "📋"}
					</button>
				</div>
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

				<button
					className="cancel-button"
					onClick={handleCancel}
				>
					Cancel Game
				</button>
			</div>
		</div>
	);
}

export default HostLobby;


