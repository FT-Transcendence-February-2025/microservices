const canvas = document.getElementById("pongCanvas") as HTMLCanvasElement;
if (canvas === null) throw new Error("Could not find canvas element");

const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
if (ctx === null) throw new Error("Could not get 2d context");

const SERVER_PLAY_FIELD_HEIGHT = 1080;
const SERVER_PLAY_FIELD_WIDTH = 1920;
const SERVER_PADDLE_WIDTH = 30;
const SERVER_PADDLE_HEIGHT = 180;
const SERVER_BALL_RADIUS = 15;

const COLOR = '#f74fe6';
const TRAIL_LENGTH = 30;

const gameState = {
    ball: {
      x: 0,
      y: 0
    },
    paddleLeft: {
        y: 0,
        score: 0
    },
    paddleRight: {
        y: 0,
        score: 0
    }
};

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

let matchId = null;
let playerId = null;

const urlParams = new URLSearchParams(window.location.search);
const isLocalGame = urlParams.get('isLocal') === 'true';
if (urlParams.has('matchId') && urlParams.has('playerId')) {
    matchId = urlParams.get('matchId');
    playerId = urlParams.get('playerId');
}

const socket = matchId && playerId
    ? new WebSocket(`ws://${window.location.hostname}:3003/games/${matchId}?playerId=${playerId}`)
    : new WebSocket(`ws://${window.location.hostname}:3003/games`);

function updateGameState(parsedData: any) {
    if (!isGameState(parsedData))
        return ;
    gameState.ball.x = parsedData.ball.x / SERVER_PLAY_FIELD_WIDTH * canvas.width;
    gameState.ball.y = parsedData.ball.y / SERVER_PLAY_FIELD_HEIGHT * canvas.height;
    gameState.paddleLeft.y = parsedData.paddleLeft.y / SERVER_PLAY_FIELD_HEIGHT * canvas.height;
    gameState.paddleRight.y = parsedData.paddleRight.y / SERVER_PLAY_FIELD_HEIGHT * canvas.height;
    gameState.paddleLeft.score = parsedData.paddleLeft.score;
    gameState.paddleRight.score = parsedData.paddleRight.score;
    renderGame();
}

socket.onmessage = (message) => {

    try {
        const parsedData = JSON.parse(message.data);
            updateGameState(parsedData);
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
let wPressed = false;
let sPressed = false;

document.addEventListener("touchstart", (event) => {
    event.preventDefault();
    const touchX = event.touches[event.touches.length - 1].clientX;

    if (touchX < window.innerWidth / 2 && upPressed === false) {
        sendPaddlePosition("up", "right");
        upPressed = true;
        downPressed = false;
    } 
    else if (downPressed === false) {
        sendPaddlePosition("down", "right");
        downPressed = true;
        upPressed = false;
    }
});

document.addEventListener("touchend", (event) => {
    event.preventDefault();
    if (event.touches.length === 0) {
        sendPaddlePosition("none", "right");
        upPressed = false;
        downPressed = false;
    } 
});

document.addEventListener("keyup", (event) => {
    if (event.key === "ArrowUp" && upPressed === true) {
        sendPaddlePosition("none", "right");
        upPressed = false;
    }
    else if (event.key === "ArrowDown" && downPressed === true) {
        sendPaddlePosition("none", "right");
        downPressed = false;
    }
    if (isLocalGame) {
        if (event.key.toLowerCase() === 'w' && wPressed) {
            sendPaddlePosition("none", "left");
            wPressed = false;
        } else if (event.key.toLowerCase() === "s" && sPressed) {
            sendPaddlePosition("none", "left");
            sPressed = false;
        }
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp" && upPressed === false) {
        sendPaddlePosition("up", "right");
        upPressed = true;
        downPressed = false;
    } 
    else if (event.key === "ArrowDown" && downPressed === false) {
        sendPaddlePosition("down", "right");
        downPressed = true;
        upPressed = false;
    }
    if (isLocalGame) {
        if (event.key.toLowerCase() === 'w' && wPressed === false) {
            sendPaddlePosition("up", "left");
            wPressed = true;
        } else if (event.key.toLowerCase() === "s" && sPressed === false) {
            sendPaddlePosition("down", "left");
            sPressed = true;
        }
    }
});

function isGameState(obj: any){
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'ball' in obj &&
        'paddleLeft' in obj &&
        'paddleRight' in obj &&
        typeof obj.ball.x === 'number' &&
        typeof obj.ball.y === 'number' &&
        typeof obj.paddleLeft.y === 'number' &&
        typeof obj.paddleLeft.score === 'number' &&
        typeof obj.paddleRight.y === 'number' &&
        typeof obj.paddleRight.score === 'number'
    );
}

function sendPaddlePosition(direction: string, side: string) {
    const data = {
        type: "paddleMove",
        dir: direction,
        side: side
    };
    if (socket.readyState === WebSocket.OPEN)
        socket.send(JSON.stringify(data));
}

function drawPaddle (x: number, y: number) {
    ctx.fillStyle = COLOR;
    ctx.fillRect(x, y, SERVER_PADDLE_WIDTH/SERVER_PLAY_FIELD_WIDTH * canvas.width, SERVER_PADDLE_HEIGHT/SERVER_PLAY_FIELD_HEIGHT * canvas.height);
}

function drawBall(x: number, y: number) {
    ctx.beginPath();
    ctx.arc(x, y, SERVER_BALL_RADIUS/SERVER_PLAY_FIELD_HEIGHT * canvas.height, 0, Math.PI * 2);
    ctx.fillStyle = COLOR;
    ctx.fill();
    ctx.closePath();
}

const trail: any = [];

function drawTrail(x: number, y: number) {
    trail.push({ x, y });
    if (trail.length > TRAIL_LENGTH)
        trail.shift();
    ctx.save();
    for (let i = 0; i < trail.length; i++) {
        const age = trail.length - i;
        const alpha = Math.max(1 - age / trail.length, 0);
        const radius = SERVER_BALL_RADIUS/SERVER_PLAY_FIELD_HEIGHT * canvas.height * (0.5 + alpha * 0.5);

        ctx.beginPath();
        ctx.globalAlpha = alpha * 0.3;
        ctx.fillStyle = COLOR;
        ctx.arc(trail[i].x, trail[i].y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function drawScore(score1: number, score2: number) {
    ctx.font = `${canvas.height/15}px Arial`;
    ctx.fillStyle = COLOR;
    ctx.textAlign = "center";
    ctx.fillText(score1.toString(), canvas.width / 4, canvas.height/15);
    ctx.fillText(score2.toString(), 3 * canvas.width / 4, canvas.height/15);
}

function drawNet() {
    ctx.setLineDash([canvas.height/25, canvas.height/25]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = COLOR;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawBorder() {
    ctx.lineWidth = 4;
    ctx.strokeStyle = COLOR;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

function renderGame() {
    const { ball, paddleLeft, paddleRight } = gameState;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBorder();
    drawNet();
    drawPaddle(0, paddleLeft.y);
    drawPaddle(canvas.width - SERVER_PADDLE_WIDTH/SERVER_PLAY_FIELD_WIDTH * canvas.width, paddleRight.y);
    drawBall(ball.x, ball.y);
    drawTrail(ball.x, ball.y);
    drawScore(paddleLeft.score, paddleRight.score);
}