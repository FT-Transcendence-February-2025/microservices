import { displayGameSessions } from './utils';

const apiUrl = 'http://localhost:3000/game-sessions';

export async function fetchGameSessions() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const gameSessions = await response.json();
        displayGameSessions(gameSessions);
    } catch (error) {
        console.error('Error fetching game sessions:', error);
    }
}