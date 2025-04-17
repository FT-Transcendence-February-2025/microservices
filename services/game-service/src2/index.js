const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Sample in-memory data for game sessions
let gameSessions = [
    { id: 1, name: 'Game Session 1', status: 'active' },
    { id: 2, name: 'Game Session 2', status: 'inactive' },
];

// Get all game sessions
app.get('/api/game-sessions', (req, res) => {
    res.json(gameSessions);
});

// Get a specific game session by ID
app.get('/api/game-sessions/:id', (req, res) => {
    const sessionId = parseInt(req.params.id);
    const session = gameSessions.find(gs => gs.id === sessionId);
    if (session) {
        res.json(session);
    } else {
        res.status(404).send('Game session not found');
    }
});

// Create a new game session
app.post('/api/game-sessions', (req, res) => {
    const newSession = {
        id: gameSessions.length + 1,
        name: req.body.name,
        status: req.body.status,
    };
    gameSessions.push(newSession);
    res.status(201).json(newSession);
});

// Update an existing game session
app.put('/api/game-sessions/:id', (req, res) => {
    const sessionId = parseInt(req.params.id);
    const sessionIndex = gameSessions.findIndex(gs => gs.id === sessionId);
    if (sessionIndex !== -1) {
        gameSessions[sessionIndex] = { ...gameSessions[sessionIndex], ...req.body };
        res.json(gameSessions[sessionIndex]);
    } else {
        res.status(404).send('Game session not found');
    }
});

// Delete a game session
app.delete('/api/game-sessions/:id', (req, res) => {
    const sessionId = parseInt(req.params.id);
    const sessionIndex = gameSessions.findIndex(gs => gs.id === sessionId);
    if (sessionIndex !== -1) {
        gameSessions.splice(sessionIndex, 1);
        res.status(204).send();
    } else {
        res.status(404).send('Game session not found');
    }
});

app.listen(PORT, () => {
    console.log(`Game Session Service is running on port ${PORT}`);
});