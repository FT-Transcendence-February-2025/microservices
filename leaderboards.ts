import { displayLeaderboards } from './utils';

const apiUrl = 'http://localhost:3000/api/leaderboards';

export async function fetchLeaderboards() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        displayLeaderboards(data);
    } catch (error) {
        console.error('Error fetching leaderboards:', error);
    }
}