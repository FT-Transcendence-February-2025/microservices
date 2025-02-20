import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/matchmaking'; // Adjust the base URL as needed

export const fetchMatchmakingData = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/data`);
        displayMatchmakingData(response.data);
    } catch (error) {
        console.error('Error fetching matchmaking data:', error);
    }
};

export const displayMatchmakingData = (data: any) => {
    const matchmakingContainer = document.getElementById('matchmaking-data');
    if (matchmakingContainer) {
        matchmakingContainer.innerHTML = JSON.stringify(data, null, 2);
    }
};