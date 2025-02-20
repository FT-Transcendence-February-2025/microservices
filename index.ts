import { fetchUsers, displayUsers } from './users';
import { fetchTournaments, displayTournaments } from './tournaments';
import { fetchMatchmakingData, displayMatchmakingData } from './matchmaking';
import { fetchGameSessions, displayGameSessions } from './game_sessions';
import { fetchNotifications, displayNotifications } from './notifications';
import { fetchLeaderboards, displayLeaderboards } from './leaderboards';

document.getElementById('fetch-users')?.addEventListener('click', async () => {
    const users = await fetchUsers();
    displayUsers(users);
});

document.getElementById('fetch-tournaments')?.addEventListener('click', async () => {
    const tournaments = await fetchTournaments();
    displayTournaments(tournaments);
});

document.getElementById('fetch-matchmaking')?.addEventListener('click', async () => {
    const matchmakingData = await fetchMatchmakingData();
    displayMatchmakingData(matchmakingData);
});

document.getElementById('fetch-game-sessions')?.addEventListener('click', async () => {
    const gameSessions = await fetchGameSessions();
    displayGameSessions(gameSessions);
});

document.getElementById('fetch-notifications')?.addEventListener('click', async () => {
    const notifications = await fetchNotifications();
    displayNotifications(notifications);
});

document.getElementById('fetch-leaderboards')?.addEventListener('click', async () => {
    const leaderboards = await fetchLeaderboards();
    displayLeaderboards(leaderboards);
});