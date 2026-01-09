// API-backed game store to coordinate host/join flows across devices
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Game states
export const GAME_STATE = {
	WAITING_FOR_START: 'WAITING_FOR_START',
	ROLE_REVEAL: 'ROLE_REVEAL',
	ALL_READY: 'ALL_READY',
	START_PLAYER_SELECTED: 'START_PLAYER_SELECTED',
	GAME_IN_PROGRESS: 'GAME_IN_PROGRESS',
	VOTING: 'VOTING',
	VOTING_RESULTS: 'VOTING_RESULTS',
	ENDED: 'ENDED',
};

// Player roles
export const PLAYER_ROLE = {
	IMPOSTER: 'IMPOSTER',
	PLAYER: 'PLAYER',
};

// Word and hint pairs
const WORD_HINT_PAIRS = [
	{ word: 'math club', hint: 'nailong' },
	{ word: 'ihs pjs', hint: 'comfy' },
	{ word: 'track and field', hint: 'spring' },
	{ word: 'hello rally', hint: 'hi!' },
	{ word: 'double accel', hint: 'hard' },
	{ word: 'ihs quarter zip', hint: 'performative' },
	{ word: 'blue crew', hint: 'friday' },
];

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
	try {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			headers: {
				'Content-Type': 'application/json',
				...options.headers,
			},
			...options,
		});
		
		if (!response.ok) {
			const error = await response.json().catch(() => ({ error: 'Request failed' }));
			throw new Error(error.error || 'Request failed');
		}
		
		return await response.json();
	} catch (error) {
		console.error('API call failed:', error);
		throw error;
	}
}

export async function getGame(code) {
	try {
		const game = await apiCall(`/game/${code}`);
		return game;
	} catch (error) {
		console.error('Failed to get game:', error);
		return null;
	}
}

export function getAllGames() {
	// Not needed for API-based implementation
	return {};
}

export async function createGame(totalPlayers, numImposters) {
	try {
		const game = await apiCall('/game/create', {
			method: 'POST',
			body: JSON.stringify({ totalPlayers, numImposters }),
		});
		return game;
	} catch (error) {
		console.error('Failed to create game:', error);
		throw error;
	}
}

export async function tryJoinGame(code) {
	try {
		const result = await apiCall(`/game/${code}/join`, {
			method: 'POST',
		});
		return result;
	} catch (error) {
		console.error('Failed to join game:', error);
		// Return error response format
		if (error.message.includes('not found') || error.message.includes('404')) {
			return { ok: false, reason: 'invalid' };
		}
		if (error.message.includes('full')) {
			return { ok: false, reason: 'full' };
		}
		return { ok: false, reason: 'invalid' };
	}
}

// Select a random word and hint pair
function selectWordAndHint() {
	 const randomIndex = Math.floor(Math.random() * WORD_HINT_PAIRS.length);
	 return WORD_HINT_PAIRS[randomIndex];
}

// Assign roles to players
function assignRoles(totalPlayers, numImposters) {
	 const roles = {};
	 const playerNumbers = Array.from({ length: totalPlayers }, (_, i) => i + 1);
	 
	 // Randomly select imposter player numbers
	 const imposterNumbers = [];
	 const shuffled = [...playerNumbers].sort(() => Math.random() - 0.5);
	 for (let i = 0; i < numImposters; i++) {
	 	 imposterNumbers.push(shuffled[i]);
	 }
	 
	 // Assign roles
	 for (let i = 1; i <= totalPlayers; i++) {
	 	 roles[i] = {
	 	 	 role: imposterNumbers.includes(i) ? PLAYER_ROLE.IMPOSTER : PLAYER_ROLE.PLAYER,
	 	 	 ready: false,
	 	 };
	 }
	 
	 return roles;
}

// Start the game: assign roles and select word/hint
export async function startGame(code) {
	try {
		const game = await apiCall(`/game/${code}/start`, {
			method: 'POST',
		});
		return game;
	} catch (error) {
		console.error('Failed to start game:', error);
		return null;
	}
}

// Mark a player as ready
export async function markPlayerReady(code, playerNumber) {
	try {
		const game = await apiCall(`/game/${code}/ready`, {
			method: 'POST',
			body: JSON.stringify({ playerNumber }),
		});
		return game;
	} catch (error) {
		console.error('Failed to mark player ready:', error);
		return null;
	}
}

// Select starting player and transition to next state
export async function selectStartingPlayer(code) {
	try {
		const game = await apiCall(`/game/${code}/select-starting-player`, {
			method: 'POST',
		});
		return game;
	} catch (error) {
		console.error('Failed to select starting player:', error);
		return null;
	}
}

// Select next random player from remaining players
export async function selectNextPlayer(code) {
	try {
		const game = await apiCall(`/game/${code}/select-next-player`, {
			method: 'POST',
		});
		return game;
	} catch (error) {
		console.error('Failed to select next player:', error);
		return null;
	}
}

// Get player's role
export async function getPlayerRole(code, playerNumber) {
	const game = await getGame(code);
	if (!game || !game.players || !game.players[playerNumber]) {
		return null;
	}
	return game.players[playerNumber].role;
}

// Check if player is ready
export async function isPlayerReady(code, playerNumber) {
	const game = await getGame(code);
	if (!game || !game.players || !game.players[playerNumber]) {
		return false;
	}
	return game.players[playerNumber].ready;
}

// Store player number for a game code (in sessionStorage)
const PLAYER_NUMBER_KEY = 'ihs_player_numbers';

function readPlayerNumbers() {
	 try {
	 	 const raw = sessionStorage.getItem(PLAYER_NUMBER_KEY);
	 	 if (!raw) return {};
	 	 const parsed = JSON.parse(raw);
	 	 return typeof parsed === 'object' && parsed !== null ? parsed : {};
	 } catch (_) {
	 	 return {};
	 }
}

function writePlayerNumbers(numbers) {
	 sessionStorage.setItem(PLAYER_NUMBER_KEY, JSON.stringify(numbers));
}

export function setPlayerNumberForGame(code, playerNumber) {
	 const numbers = readPlayerNumbers();
	 numbers[code] = playerNumber;
	 writePlayerNumbers(numbers);
}

export function getPlayerNumberForGame(code) {
	 const numbers = readPlayerNumbers();
	 return numbers[code] || null;
}

// End the game - marks it as ended so all players can navigate home
export async function endGame(code) {
	try {
		const game = await apiCall(`/game/${code}/end`, {
			method: 'POST',
		});
		return game;
	} catch (error) {
		console.error('Failed to end game:', error);
		return null;
	}
}

// Start voting phase
export async function startVoting(code) {
	try {
		const game = await apiCall(`/game/${code}/start-voting`, {
			method: 'POST',
		});
		return game;
	} catch (error) {
		console.error('Failed to start voting:', error);
		return null;
	}
}

// Submit a vote from a player
export async function submitVote(code, playerNumber, votedPlayers) {
	try {
		const game = await apiCall(`/game/${code}/submit-vote`, {
			method: 'POST',
			body: JSON.stringify({ playerNumber, votedPlayers }),
		});
		return game;
	} catch (error) {
		console.error('Failed to submit vote:', error);
		return null;
	}
}

// Get voting results - returns object with player numbers as keys and vote counts as values
export async function getVotingResults(code) {
	const game = await getGame(code);
	if (!game || !game.votes) {
		return {};
	}
	
	const results = {};
	const allPlayerNumbers = Array.from({ length: game.totalPlayers }, (_, i) => i + 1);
	
	// Initialize all players with 0 votes
	allPlayerNumbers.forEach(num => {
		results[num] = 0;
	});
	
	// Count votes
	Object.values(game.votes).forEach(votedPlayers => {
		votedPlayers.forEach(playerNum => {
			if (results.hasOwnProperty(playerNum)) {
				results[playerNum] += 1;
			}
		});
	});
	
	return results;
}

// Reveal imposters (host action) - sets flag so all players see the reveal
export async function revealImposters(code) {
	try {
		const game = await apiCall(`/game/${code}/reveal-imposters`, {
			method: 'POST',
		});
		return game;
	} catch (error) {
		console.error('Failed to reveal imposters:', error);
		return null;
	}
}


