import axios from 'axios';

const API_URL = 'http://localhost:3000/users'; // Adjust the URL as necessary

export const fetchUsers = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const displayUsers = (users) => {
    const usersContainer = document.getElementById('users');
    if (usersContainer) {
        usersContainer.innerHTML = ''; // Clear previous content
        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.textContent = `User: ${user.name}, Email: ${user.email}`;
            usersContainer.appendChild(userElement);
        });
    }
};