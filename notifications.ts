import { displayNotifications } from './displayNotifications';

export async function fetchNotifications() {
    try {
        const response = await fetch('http://localhost:3000/notifications');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const notifications = await response.json();
        displayNotifications(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
}