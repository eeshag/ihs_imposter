// Simple localStorage-backed game store to coordinate host/join flows on the client
const STORAGE_KEY = 'ihs_games';

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

function readGames() {
	 try {
	 	 const raw = localStorage.getItem(STORAGE_KEY);
	 	 if (!raw) return {};
	 	 const parsed = JSON.parse(raw);
	 	 return typeof parsed === 'object' && parsed !== null ? parsed : {};
	 } catch (_) {
	 	 return {};
	 }
}

function writeGames(games) {
	 localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

export function getGame(code) {
	 const games = readGames();
	 return games[code] || null;
}

export function getAllGames() {
	 return readGames();
}

export function saveGame(game) {
	 const games = readGames();
	 games[game.code] = game;
	 writeGames(games);
	 return game;
}

export function updateGame(code, updater) {
	 const games = readGames();
	 const existing = games[code];
	 if (!existing) return null;
	 const updated = updater({ ...existing });
	 games[code] = updated;
	 writeGames(games);
	 return updated;
}

export function generateGameCode() {
	 const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // avoid ambiguous chars
	 const games = readGames();
	 let attempt = 0;
	 while (attempt < 10000) {
	 	 let code = '';
	 	 for (let i = 0; i < 6; i += 1) {
	 	 	 code += alphabet[Math.floor(Math.random() * alphabet.length)];
	 	 }
	 	 if (!games[code]) {
	 	 	 return code;
	 	 }
	 	 attempt += 1;
	 }
	 // Fallback (extremely unlikely to hit)
	 return String(Date.now()).slice(-6);
}

export function createGame(totalPlayers, numImposters) {
	 const code = generateGameCode();
	 const game = {
	 	 code,
	 	 totalPlayers,
	 	 numImposters,
	 	 joinedCount: 1, // host counts as first player
	 	 createdAt: Date.now(),
	 	 state: GAME_STATE.WAITING_FOR_START,
	 	 players: { 1: { role: null, ready: false } }, // Initialize host (player 1)
		word: null,
		hint: null,
		startingPlayer: null,
		selectedPlayers: [], // Track which players have been selected
		votes: {}, // Track votes: { playerNumber: [array of voted player numbers] }
		voteCount: 0, // Number of players who have submitted votes
		impostersRevealed: false, // Whether imposters have been revealed to all players
	};
	 return saveGame(game);
}

export function tryJoinGame(code) {
	 const game = getGame(code);
	 if (!game) {
	 	 return { ok: false, reason: 'invalid' };
	 }
	 if (game.joinedCount >= game.totalPlayers) {
	 	 return { ok: false, reason: 'full' };
	 }
	 const assignedPlayerNumber = game.joinedCount + 1;
	 const updated = updateGame(code, g => {
	 	 const next = { ...g };
	 	 if (next.joinedCount < next.totalPlayers) {
	 	 	 next.joinedCount += 1;
	 	 }
	 	 // Initialize player entry if not exists
	 	 if (!next.players) {
	 	 	 next.players = {};
	 	 }
	 	 if (!next.players[assignedPlayerNumber]) {
	 	 	 next.players[assignedPlayerNumber] = { role: null, ready: false };
	 	 }
	 	 return next;
	 });
	 return { ok: true, game: updated, playerNumber: assignedPlayerNumber };
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
export function startGame(code) {
	 const game = getGame(code);
	 if (!game) {
	 	 return null;
	 }
	 if (game.state !== GAME_STATE.WAITING_FOR_START) {
	 	 return game; // Already started
	 }
	 if (game.joinedCount < game.totalPlayers) {
	 	 return game; // Not enough players
	 }
	 
	 const { word, hint } = selectWordAndHint();
	 const roles = assignRoles(game.totalPlayers, game.numImposters);
	 
	 return updateGame(code, g => ({
	 	 ...g,
	 	 state: GAME_STATE.ROLE_REVEAL,
	 	 word,
	 	 hint,
	 	 players: roles,
	 }));
}

// Mark a player as ready
export function markPlayerReady(code, playerNumber) {
	 return updateGame(code, g => {
	 	 if (!g.players || !g.players[playerNumber]) {
	 	 	 return g;
	 	 }
	 	 const updated = { ...g };
	 	 updated.players = { ...g.players };
	 	 updated.players[playerNumber] = {
	 	 	 ...g.players[playerNumber],
	 	 	 ready: true,
	 	 };
	 	 
	 	 // Check if all players are ready
	 	 const allReady = Object.values(updated.players).every(p => p.ready);
	 	 if (allReady && updated.state === GAME_STATE.ROLE_REVEAL) {
	 	 	 updated.state = GAME_STATE.ALL_READY;
	 	 }
	 	 
	 	 return updated;
	 });
}

// Select starting player and transition to next state
export function selectStartingPlayer(code) {
	 const game = getGame(code);
	 if (!game || game.state !== GAME_STATE.ALL_READY) {
	 	 return game;
	 }
	 
	 const startingPlayer = Math.floor(Math.random() * game.totalPlayers) + 1;
	 
	 return updateGame(code, g => ({
	 	 ...g,
	 	 state: GAME_STATE.START_PLAYER_SELECTED,
	 	 startingPlayer,
	 	 selectedPlayers: [startingPlayer], // Initialize with first selected player
	 }));
}

// Select next random player from remaining players
export function selectNextPlayer(code) {
	 const game = getGame(code);
	 if (!game || game.state !== GAME_STATE.START_PLAYER_SELECTED) {
	 	 return game;
	 }
	 
	 const selectedPlayers = game.selectedPlayers || [];
	 const allPlayers = Array.from({ length: game.totalPlayers }, (_, i) => i + 1);
	 const remainingPlayers = allPlayers.filter(p => !selectedPlayers.includes(p));
	 
	 // If all players have been selected, return current game
	 if (remainingPlayers.length === 0) {
	 	 return game;
	 }
	 
	 // Randomly select from remaining players
	 const nextPlayer = remainingPlayers[Math.floor(Math.random() * remainingPlayers.length)];
	 
	 return updateGame(code, g => ({
	 	 ...g,
	 	 startingPlayer: nextPlayer,
	 	 selectedPlayers: [...selectedPlayers, nextPlayer],
	 }));
}

// Get player's role
export function getPlayerRole(code, playerNumber) {
	 const game = getGame(code);
	 if (!game || !game.players || !game.players[playerNumber]) {
	 	 return null;
	 }
	 return game.players[playerNumber].role;
}

// Check if player is ready
export function isPlayerReady(code, playerNumber) {
	 const game = getGame(code);
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
export function endGame(code) {
	 return updateGame(code, g => ({
	 	 ...g,
	 	 state: GAME_STATE.ENDED,
	 }));
}

// Cancel the game - deletes it from storage so all players are kicked back to home
export function cancelGame(code) {
	 const games = readGames();
	 if (games[code]) {
	 	 delete games[code];
	 	 writeGames(games);
	 	 return true;
	 }
	 return false;
}

// Start voting phase - transition from game in progress to voting
// Idempotent: safe to call multiple times, won't reset votes if already in voting
export function startVoting(code) {
	 const game = getGame(code);
	 if (!game) {
	 	 return null;
	 }
	 
	 // If already in voting state, don't reset votes
	 if (game.state === GAME_STATE.VOTING || game.state === GAME_STATE.VOTING_RESULTS) {
	 	 return game;
	 }
	 
	 return updateGame(code, g => ({
	 	 ...g,
	 	 state: GAME_STATE.VOTING,
	 	 votes: g.votes || {},
	 	 voteCount: g.voteCount || 0,
	 }));
}

// Submit a vote from a player
export function submitVote(code, playerNumber, votedPlayers) {
	 const game = getGame(code);
	 if (!game) {
	 	 return null;
	 }
	 if (game.state !== GAME_STATE.VOTING) {
	 	 return game;
	 }
	 if (!votedPlayers || votedPlayers.length !== game.numImposters) {
	 	 return game; // Invalid vote
	 }
	 
	 return updateGame(code, g => {
	 	 const updated = { ...g };
	 	 if (!updated.votes) {
	 	 	 updated.votes = {};
	 	 }
	 	 if (!updated.voteCount) {
	 	 	 updated.voteCount = 0;
	 	 }
	 	 
	 	 // Only count if this player hasn't voted yet
	 	 if (!updated.votes[playerNumber]) {
	 	 	 updated.voteCount += 1;
	 	 }
	 	 
	 	 updated.votes[playerNumber] = [...votedPlayers];
	 	 
	 	 // Check if all players have voted
	 	 if (updated.voteCount >= updated.totalPlayers) {
	 	 	 updated.state = GAME_STATE.VOTING_RESULTS;
	 	 }
	 	 
	 	 return updated;
	 });
}

// Get voting results - returns object with player numbers as keys and vote counts as values
export function getVotingResults(code) {
	 const game = getGame(code);
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
export function revealImposters(code) {
	 const game = getGame(code);
	 if (!game) {
	 	 return null;
	 }
	 
	 return updateGame(code, g => ({
	 	 ...g,
	 	 impostersRevealed: true,
	 }));
}


