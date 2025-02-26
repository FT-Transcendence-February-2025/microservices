const canvas = document.getElementById("pongCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const PLAY_FIELD_HEIGHT = 1080;
const PLAY_FIELD_WIDTH = 1920;

const PADDLE_WIDTH = 30;
const PADDLE_HEIGHT = 180;

const BALL_RADIUS = 15;
const COLOR = '#B026FF';

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

interface GameState {
    ball: {
      x: number;
      y: number;
    };
    paddle1: {
      y: number;
      score: number;
    };
    paddle2: {
      y: number;
      score: number;
    };
}

const socket = new WebSocket(`ws://${window.location.hostname}:3000/game`);

function isGameState(obj: any): obj is GameState {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'ball' in obj &&
      'paddle1' in obj &&
      'paddle2' in obj &&
      typeof obj.ball.x === 'number' &&
      typeof obj.ball.y === 'number' &&
      typeof obj.paddle1.y === 'number' &&
      typeof obj.paddle1.score === 'number' &&
      typeof obj.paddle2.y === 'number' &&
      typeof obj.paddle2.score === 'number'
    );
}

socket.onmessage = (message) => {

    try {
        const parsedData = JSON.parse(message.data) as GameState;
        if (isGameState(parsedData))
            renderGame(parsedData);
    } catch (error) {
        console.error('Failed to parse received data:', error);
    }
}

socket.onopen = () => {
    console.log("Connected to WebSocket server.");
};

socket.onerror = (error) => {
    console.error("WebSocket error:", error);
};

socket.onclose = () => {
    console.log("WebSocket connection closed.");
};

let upPressed = false;
let downPressed = false;

function sendPaddlePosition(direction: string) {
    const data = {
        type: "paddleMove",
        dir: direction,
    };
    if (socket.readyState === WebSocket.OPEN)
        socket.send(JSON.stringify(data));
}

document.addEventListener("touchstart", (event) => {
    event.preventDefault();
    
    const screenHeight = window.innerHeight;
    const halfHeight = screenHeight / 2;

    const touch = event.touches[event.touches.length - 1];
    const touchY = touch.clientY;

    if (touchY < halfHeight && upPressed === false) {
        sendPaddlePosition("up");
        upPressed = true;
        downPressed = false;
    } 
    else if (downPressed === false) {
        sendPaddlePosition("down");
        downPressed = true;
        upPressed = false;
    }
});

document.addEventListener("touchend", (event) => {
    event.preventDefault();
    if (event.touches.length === 0) {
        sendPaddlePosition("none");
        upPressed = false;
        downPressed = false;
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

function drawPaddle(x: number, y: number) {
    ctx.fillStyle = COLOR;
    ctx.fillRect(x, y/PLAY_FIELD_HEIGHT * canvas.height, PADDLE_WIDTH/PLAY_FIELD_WIDTH * canvas.width, PADDLE_HEIGHT/PLAY_FIELD_HEIGHT * canvas.height);
}

function drawBall(x: number, y: number) {
    ctx.beginPath();
    ctx.arc(x/PLAY_FIELD_WIDTH * canvas.width, y/PLAY_FIELD_HEIGHT * canvas.height, BALL_RADIUS/PLAY_FIELD_HEIGHT * canvas.height, 0, Math.PI * 2);
    ctx.fillStyle = COLOR;
    ctx.fill();
    ctx.closePath();
}

function drawNet() {
    ctx.setLineDash([canvas.width/27, canvas.height/27]);
    ctx.strokeStyle = COLOR;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
}

function drawScore(score1: number, score2: number) {
    ctx.font = "48px Arial";
    ctx.fillStyle = COLOR;
    ctx.textAlign = "center";
    ctx.fillText(score1.toString(), canvas.width / 4, 50);
    ctx.fillText(score2.toString(), 3 * canvas.width / 4, 50);
}

const trailLength = 35; // Adjust for longer/shorter trail
const trail:any = [];

function drawTrail() {
    ctx.save();
    for (let i = 0; i < trail.length; i++) {
        const age = trail.length - i;
        const alpha = Math.max(1 - age / trail.length, 0);
        const radius = 8 * (0.5 + alpha * 0.5);
        
        ctx.beginPath();
        ctx.globalAlpha = alpha * 0.3;
        ctx.fillStyle = COLOR;
        ctx.arc(
            trail[i].x / PLAY_FIELD_WIDTH * canvas.width,
            trail[i].y / PLAY_FIELD_HEIGHT * canvas.height,
            radius,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
    ctx.restore();
}

function drawBorder() {
    ctx.setLineDash([]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = COLOR;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

function renderGame(state: GameState) {
    const { ball, paddle1, paddle2 } = state;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    trail.push({ x: ball.x, y: ball.y });
    if (trail.length > trailLength)
        trail.shift();

    drawBorder();
    drawNet();
    drawPaddle(0, paddle1.y);
    drawPaddle(canvas.width - PADDLE_WIDTH/PLAY_FIELD_WIDTH * canvas.width, paddle2.y);
    drawBall(ball.x, ball.y);
    drawTrail();
    drawScore(paddle1.score, paddle2.score);
}

function gameLoop() {
    requestAnimationFrame(gameLoop);
}

gameLoop();