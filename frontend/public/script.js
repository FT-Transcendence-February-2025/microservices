const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const PLAY_FIELD_HEIGHT = 1080;
const PLAY_FIELD_WIDTH = 1920;

const PADDLE_WIDTH = 27;
const PADDLE_HEIGHT = 162;
const PADDLE_SPEED = 8;

const BALL_SPEED = 7;
const BALL_RADIUS = 10;

// WebSocket setup
const socket = new WebSocket("ws://localhost:3000/game");

socket.onopen = () => {
    console.log("Connected to WebSocket server.");
};

socket.onerror = (error) => {
    console.error("WebSocket error:", error);
};

socket.onclose = () => {
    console.log("WebSocket connection closed.");
};

// Paddle movement
let upPressed = false;
let downPressed = false;

// Send paddle position to the server via WebSocket
function sendPaddlePosition(direction) {
    const data = {
        type: "paddleMove",
        dir: direction,
    };

    if (socket.readyState === WebSocket.OPEN)
        socket.send(JSON.stringify(data));
}

// Event listeners for paddle control
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp" && upPressed === false) {
        sendPaddlePosition("up");
        upPressed = true;
        downPressed = false;
    } 
    else if (event.key === "ArrowDown" && downPressed === false) {
        sendPaddlePosition("down");
        downPressed = true;
        upPressed = false;
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "ArrowUp" && upPressed === true) {
        sendPaddlePosition("none");
        upPressed = false;
    }
    else if (event.key === "ArrowDown" && downPressed === true) {
        sendPaddlePosition("none");
        downPressed = false;
    }
});

// Draw elements on the canvas
function drawPaddle(x, y) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(x, y/PLAY_FIELD_HEIGHT * canvas.height, PADDLE_WIDTH/PLAY_FIELD_WIDTH * canvas.width, PADDLE_HEIGHT/PLAY_FIELD_HEIGHT * canvas.height);
}

function drawBall(x, y) {
    ctx.beginPath();
    ctx.arc(x/PLAY_FIELD_WIDTH * canvas.width, y/PLAY_FIELD_HEIGHT * canvas.height, BALL_RADIUS/PLAY_FIELD_HEIGHT * canvas.height, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.closePath();
}

function drawNet() {
    ctx.setLineDash([canvas.width/27, canvas.height/27]);
    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
}

function drawScore(score1, score2) {
    ctx.font = "48px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(score1, canvas.width / 4, 50);
    ctx.fillText(score2, 3 * canvas.width / 4, 50);
}

// Render game state received from the server
function renderGame(state) {
    const { ball, paddle1, paddle2 } = state;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw net
    drawNet();

    // Draw paddles and ball
    drawPaddle(0, paddle1.y); // Player's paddle on the left side
    drawPaddle(canvas.width - PADDLE_WIDTH/PLAY_FIELD_WIDTH * canvas.width, paddle2.y); // Opponent's paddle on the right side
    drawBall(ball.x, ball.y); // Ball position

    // Draw scores
    drawScore(paddle1.score, paddle2.score);
}

// Listen for game state updates from the server
socket.onmessage = (message) => {
    const gameState = JSON.parse(message.data);

    // Render the updated game state on the canvas
    renderGame(gameState);
};

// Main game loop
function gameLoop() {
    console.log(`w: ${canvas.width} h: ${canvas.height}`);
    requestAnimationFrame(gameLoop); // Continue the loop
}

// Start the game loop when everything is loaded.
gameLoop();