import WebSocket from 'ws';

const token = '$2a$12$po5KeyhOn71ZhIzzAIWkouAslkUTWqJBINGEAcIJcaF7f8MdHJTPS';
const token2 = '$2a$12$68zuVnGHkB8uZ7BVpNEsH.emyUeG72NeHQcg4JxK5q4FtDbgyTj2q';
const ws1 = new WebSocket('ws://localhost:3001/ws');
const ws2 = new WebSocket('ws://localhost:3001/ws');

ws1.on('open', () => {
  console.log('Player 1 connected');

  // Send joinQueue message
  ws1.send(
    JSON.stringify({
      type: 'joinQueue',
      userId: 7,
      token,
    })
  );
});

ws2.on('open', () => {
  console.log('Player 2 connected');

  // Send joinQueue message
  ws2.send(
    JSON.stringify({
      type: 'joinQueue',
      userId: 8,
      token: token2,
    })
  );
});

ws1.on('message', (data) => {
  const message = JSON.parse(data);
  console.log('Player 1 received:', message);

  switch (message.type) {
    case 'queueJoined':
      console.log('Player 1 joined queue');
      break;
    case 'matchCreated':
      console.log('Match created for player 1');
      // Accept the match
      ws1.send(
        JSON.stringify({
          type: 'matchAccept',
          userId: 7,
          matchId: message.matchId,
        })
      );
      break;
    case 'matchStarted':
      console.log('Match started for player 1');
      setTimeout(() => ws1.close(), 1000);
      break;
  }
});

ws2.on('message', (data) => {
  const message = JSON.parse(data);
  console.log('Player 2 received:', message);

  switch (message.type) {
    case 'queueJoined':
      console.log('Player 2 joined queue');
      break;
    case 'matchCreated':
      console.log('Match created for player 2');
      // Accept the match
      ws2.send(
        JSON.stringify({
          type: 'matchAccept',
          userId: 8,
          matchId: message.matchId,
        })
      );
      break;
    case 'matchStarted':
      console.log('Match started for player 2');
      setTimeout(() => ws2.close(), 1000);
      break;
  }
});

ws1.on('error', console.error);
ws2.on('error', console.error);

ws1.on('close', () => console.log('Player 1 disconnected'));
ws2.on('close', () => console.log('Player 2 disconnected'));
