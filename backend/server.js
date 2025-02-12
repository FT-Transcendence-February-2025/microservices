import Fastify from 'fastify'
import websocket from '@fastify/websocket'

const fastify = Fastify({
    // logger: true
})

await fastify.register(websocket, {
    options: { maxPayload: 100 }
})

let clientsConnected = 0;

const playFieldWidth = 1200;
const playFieledHeight = 800;

const paddleWidht = 20;
const paddleHeight = 100;
const paddleSpeed = 5

const gameState = {
    ball: { x: playFieldWidth/2 , y: playFieledHeight/2, dx: 5, dy: 5 },
    player1: { paddleY: playFieledHeight/2 - paddleHeight/2, paddleDir: 0, score: 0 },
    player2: { paddleY: playFieledHeight/2 - paddleHeight/2, paddleDir: 0, score: 0 },
}

// fastify.get('/', async function (request, response) {
//     return ({ Hello: 'World' })
// })

fastify.get('/game', { websocket: true }, (connection, request) => {
    console.log('New client Connected:' , request.socket.remoteAddress)
    clientsConnected++;
    if (clientsConnected === 1)
        console.log('Waiting for opponent ...')
    if (clientsConnected === 2) {
        console.log('Starting game ...')
        gameLoop()
    }
    connection.socket.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString())

            if (message.type === 'paddleMove') {
                if (message.player === 1) {
                    gameState.player1.paddleDir = message.dir;
                } else if (message.player === 2) {
                    gameState.player2.paddleDir = message.dir;
                }
                broadcastGameState()
            }
        } catch (error) {
          console.error('Error processing message:', error)
        }
    })

    connection.socket.on('error', (error) => {
        console.error('WebSocket error:', error)
    })

    connection.socket.on('close', () => {
        console.log('Client closed connection')
    })
})

async function gameLoop() {
    // Update paddle positions
    if (gameState.player1.paddleDir > 0 && gameState.player1.paddleY + paddleSpeed <= playFieledHeight - paddleHeight)
        gameState.player1.paddleY += paddleSpeed;
    else if (gameState.player1.paddleDir < 0 && gameState.player1.paddleY - paddleSpeed >= 0)
        gameState.player1.paddleY -= paddleSpeed;

    if (gameState.player2.paddleDir > 0 && gameState.player2.paddleY + paddleSpeed <= playFieledHeight - paddleHeight)
        gameState.player2.paddleY += paddleSpeed;
    else if (gameState.player2.paddleDir < 0 && gameState.player2.paddleY - paddleSpeed >= 0)
        gameState.player2.paddleY -= paddleSpeed;

    // Update ball position
    gameState.ball.x += gameState.ball.dx;
    gameState.ball.y += gameState.ball.dy;

    // Ball collision with top and bottom walls
    if (gameState.ball.y <= 0 || gameState.ball.y >= playFieledHeight) {
        gameState.ball.dy *= -1;
    }

    // Ball collision with paddles
    if ((
        gameState.ball.x <= paddleWidht &&
        gameState.ball.y >= gameState.player1.paddleY &&
        gameState.ball.y <= gameState.player1.paddleY + paddleHeight
    ) || (
        gameState.ball.x >= playFieldWidth - paddleWidht &&
        gameState.ball.y >= gameState.player2.paddleY &&
        gameState.ball.y <= gameState.player2.paddleY + paddleHeight
    )) {
        gameState.ball.dx *= -1
    }

    // Ball out of bonds
    if (gameState.ball.x < 0) {
        gameState.player2.score++;
        resetBall();
    }
    else if (gameState.ball.x > playFieldWidth) {
        gameState.player1.score++;
        resetBall();
    }

    // Broadcast updated state to all clients
    broadcastGameState();

    // Schedule next loop
    setTimeout(gameLoop, 16); // ~60 FPS
}

function resetBall() {
    gameState.ball.x = playFieldWidth/2;
    gameState.ball.y = playFieledHeight/2;
}

function broadcastGameState() {
    const server = fastify.websocketServer;
    const gameStateJSON = JSON.stringify(gameState);
    
    for (const client of server.clients) {
      if (client.readyState === 1) { // 1 means the connection is open
        client.send(gameStateJSON);
      }
    }
}

try {
    await fastify.listen({ port: 3000 })
    console.log('Server is listening on port 3000')
} catch (err) {
    fastify.log.error(err)
    process.exit(1)
}

// gameLoop()