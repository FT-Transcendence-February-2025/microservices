import WebSocket from 'ws';

const ws1 = new WebSocket('ws://localhost:3000/ws');
const ws2 = new WebSocket('ws://localhost:3000/ws');

ws1.on('open', () => {
  console.log('Player 1 connected');

  // Send joinQueue message
  ws1.send(
    JSON.stringify({
      type: 'joinQueue',
      userId: 1,
    })
  );
});

ws2.on('open', () => {
  console.log('Player 2 connected');

  // Send joinQueue message
  ws2.send(
    JSON.stringify({
      type: 'joinQueue',
      userId: 2,
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
          userId: 1,
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
      ws1.send(
        JSON.stringify({
          type: 'matchAccept',
          userId: 2,
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
