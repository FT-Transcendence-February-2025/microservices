import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/tournaments'; // Adjust the base URL as needed

export async function fetchTournaments() {
    try {
        const response = await axios.get(API_BASE_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching tournaments:', error);
        throw error;
    }
}

export function displayTournaments(tournaments: any[]) {
    const tournamentsContainer = document.getElementById('tournaments');
    if (tournamentsContainer) {
        tournamentsContainer.innerHTML = ''; // Clear previous results
        tournaments.forEach(tournament => {
            const tournamentElement = document.createElement('div');
            tournamentElement.textContent = `Tournament: ${tournament.name}, Date: ${tournament.date}`;
            tournamentsContainer.appendChild(tournamentElement);
        });
    }
}