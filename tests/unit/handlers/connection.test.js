import { test } from 'node:test';
import assert from 'node:assert';
import { db } from '../../../src/db/connection.js';
import { connectionHandler } from '../../../src/websocket/handlers/connection.js';

// Create a mock WebSocket class
class MockWebSocket {
  constructor() {
    this.sentMessages = [];
    this.messageHandlers = [];
    this.errorHandlers = [];
    this.closeHandlers = [];
  }

  send(message) {
    // Store the parsed message if it's JSON, otherwise store as-is
    try {
      this.sentMessages.push(JSON.parse(message));
    } catch {
      this.sentMessages.push(message);
    }
  }

  on(event, handler) {
    switch (event) {
      case 'message':
        this.messageHandlers.push(handler);
        break;
      case 'error':
        this.errorHandlers.push(handler);
        break;
      case 'close':
        this.closeHandlers.push(handler);
        break;
    }
  }

  // Helper method to simulate receiving a message
  simulateMessage(messageData) {
    // Don't stringify if it's already a string
    const messageString = typeof messageData === 'string' ? messageData : JSON.stringify(messageData);
    
    const message = {
      toString: () => messageString
    };

    this.messageHandlers.forEach(handler => handler(message));
  }
}

// Setup and teardown
test.beforeEach(async () => {
  await db('matchmaking').del();
  await db('users').del();

  // Insert test users
  await db('users').insert([
    {
      id: 1,
      username: 'testuser1',
      email: 'test1@example.com',
      password: 'password123',
    },
    {
      id: 2,
      username: 'testuser2',
      email: 'test2@example.com',
      password: 'password123',
    },
  ]);
});

test('messageHandler - joinQueue with valid user', async (t) => {
  const mockSocket = new MockWebSocket();
  const mockConnection = { socket: mockSocket };

  // Set up connection
  connectionHandler(mockConnection);

  // Simulate joining queue
  mockSocket.simulateMessage({
      type: 'joinQueue',
      userId: 1,
    });

  // Wait for async operations
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Assert the response
  assert.equal(mockSocket.sentMessages[0].type, 'queueJoined');
});

test('messageHandler - matchmaking with two players', async (t) => {
  const mockSocket1 = new MockWebSocket();
  const mockSocket2 = new MockWebSocket();

  const mockConnection1 = { socket: mockSocket1 };
  const mockConnection2 = { socket: mockSocket2 };

  // Set up connections
  connectionHandler(mockConnection1);
  connectionHandler(mockConnection2);

  // Simulate both players joining queue
  mockSocket1.simulateMessage({
      type: 'joinQueue',
      userId: 1,
 	});

  // Wait for first player to join
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Log first player's messages for debugging
  console.log('Player 1 messages after joining:', mockSocket1.sentMessages);

  mockSocket2.simulateMessage({
      type: 'joinQueue',
      userId: 2,
    });

  // Wait for match creation
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Log messages for debugging
  console.log('Player 1 messages:', mockSocket1.sentMessages);
  console.log('Player 2 messages:', mockSocket2.sentMessages);

  // Verify match was created
  const match = await db('matchmaking')
    .where({
      player1_id: 1,
      player2_id: 2,
      match_status: 'pending',
    })
    .first();

   assert.ok(match, 'Match was not created');
  // Check sent messages
  assert.ok(
    mockSocket1.sentMessages.length >= 2,
    'Player 1 did not receive enough messages'
  );
  assert.ok(
    mockSocket2.sentMessages.length >= 2,
    'Player 2 did not receive enough messages'
  );

  // Verify message types
  assert.equal(
    mockSocket1.sentMessages[0].type,
    'queueJoined'
  );
  assert.equal(
    mockSocket1.sentMessages[1].type,
    'matchCreated'
  );
  assert.equal(
    mockSocket2.sentMessages[0].type,
    'queueJoined'
  );
  assert.equal(
    mockSocket2.sentMessages[1].type,
    'matchCreated'
  );
});
