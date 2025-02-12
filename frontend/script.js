const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

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
let playerPaddleY = (canvas.height - 100) / 2; // Initial paddle position
let upPressed = false;
let downPressed = false;

// Send paddle position to the server via WebSocket
function sendPaddlePosition(direction) {
    const data = {
        type: "paddleMove",
        player: 1, // Assuming this is Player 1; adjust as needed
        dir: direction,
    };

    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
    }
}

// Event listeners for paddle control
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp" && upPressed === false) {
        sendPaddlePosition(-1);
        upPressed = true;
        downPressed = false;
    } else if (event.key === "ArrowDown" && downPressed === false) {
        sendPaddlePosition(1);
        downPressed = true;
        upPressed = false;
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "ArrowUp" && upPressed === true) {
        sendPaddlePosition(0);
        upPressed = false;
    } else if (event.key === "ArrowDown" && downPressed === true) {
        sendPaddlePosition(0);
        downPressed = false;
    }
});

// Draw elements on the canvas
function drawPaddle(x, y) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(x, y, 10, 100);
}

function drawBall(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.closePath();
}

function drawNet() {
    ctx.setLineDash([5, 15]);
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
    const { ball, player1, player2 } = state;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw net
    drawNet();

    // Draw paddles and ball
    drawPaddle(0, player1.paddleY); // Player's paddle on the left side
    drawPaddle(canvas.width - 10, player2.paddleY); // Opponent's paddle on the right side
    drawBall(ball.x, ball.y); // Ball position

    // Draw scores
    drawScore(player1.score, player2.score);
}

// Listen for game state updates from the server
socket.onmessage = (message) => {
    const gameState = JSON.parse(message.data);

    // Render the updated game state on the canvas
    renderGame(gameState);
};

// Main game loop
function gameLoop() {
    requestAnimationFrame(gameLoop); // Continue the loop
}

// Start the game loop when everything is loaded.
gameLoop();