import gameTemplate from './game.html?raw';

const template = document.createElement('template');
template.innerHTML = gameTemplate;

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

let upPressed = false;
let downPressed = false;

const trail: any = [];

const socket = new WebSocket(`ws://${window.location.hostname}:3001/game`);


export default class Game extends HTMLElement {
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;

    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));

        this._canvas = this.querySelector("#pongCanvas") as HTMLCanvasElement;
        if (!this._canvas) 
            throw new Error("Could not find canvas element");

        this._ctx = this._canvas.getContext("2d") as CanvasRenderingContext2D;
        if (!this._ctx)
            throw new Error("Could not get 2d context");
    }

    connectedCallback() {
        this._canvas.width = this._canvas.clientWidth;
        this._canvas.height = this._canvas.clientHeight;

        socket.onmessage = (message) => {
            try {
                const parsedData = JSON.parse(message.data);
                    this.updateGameState(parsedData);
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

        this.addEventListeners();
    }

    updateGameState(parsedData: any) {
        if (!this.isGameState(parsedData))
            return ;
        gameState.ball.x = parsedData.ball.x / SERVER_PLAY_FIELD_WIDTH * this._canvas.width;
        gameState.ball.y = parsedData.ball.y / SERVER_PLAY_FIELD_HEIGHT * this._canvas.height;
        gameState.paddleLeft.y = parsedData.paddleLeft.y / SERVER_PLAY_FIELD_HEIGHT * this._canvas.height;
        gameState.paddleRight.y = parsedData.paddleRight.y / SERVER_PLAY_FIELD_HEIGHT * this._canvas.height;
        gameState.paddleLeft.score = parsedData.paddleLeft.score;
        gameState.paddleRight.score = parsedData.paddleRight.score;
        this.renderGame();
    }

    isGameState(obj: any) : boolean {
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
    
    sendPaddlePosition(direction: string) : void {
        const data = {
            type: "paddleMove",
            dir: direction,
        };
        if (socket.readyState === WebSocket.OPEN)
            socket.send(JSON.stringify(data));
    }

    drawPaddle (x: number, y: number) : void {
        this._ctx.fillStyle = COLOR;
        this._ctx.fillRect(x, y, SERVER_PADDLE_WIDTH/SERVER_PLAY_FIELD_WIDTH * this._canvas.width, SERVER_PADDLE_HEIGHT/SERVER_PLAY_FIELD_HEIGHT * this._canvas.height);
    }
    
    drawBall(x: number, y: number) : void {
        this._ctx.beginPath();
        this._ctx.arc(x, y, SERVER_BALL_RADIUS/SERVER_PLAY_FIELD_HEIGHT * this._canvas.height, 0, Math.PI * 2);
        this._ctx.fillStyle = COLOR;
        this._ctx.fill();
        this._ctx.closePath();
    }
    
    drawTrail(x: number, y: number) : void {
        trail.push({ x, y });
        if (trail.length > TRAIL_LENGTH)
            trail.shift();
        this._ctx.save();
        for (let i = 0; i < trail.length; i++) {
            const age = trail.length - i;
            const alpha = Math.max(1 - age / trail.length, 0);
            const radius = SERVER_BALL_RADIUS/SERVER_PLAY_FIELD_HEIGHT * this._canvas.height * (0.5 + alpha * 0.5);
    
            this._ctx.beginPath();
            this._ctx.globalAlpha = alpha * 0.3;
            this._ctx.fillStyle = COLOR;
            this._ctx.arc(trail[i].x, trail[i].y, radius, 0, Math.PI * 2);
            this._ctx.fill();
        }
        this._ctx.restore();
    }
    
    drawScore(score1: number, score2: number) : void {
        this._ctx.font = `${this._canvas.height/15}px Arial`;
        this._ctx.fillStyle = COLOR;
        this._ctx.textAlign = "center";
        this._ctx.fillText(score1.toString(), this._canvas.width / 4, this._canvas.height/15);
        this._ctx.fillText(score2.toString(), 3 * this._canvas.width / 4, this._canvas.height/15);
    }
    
    drawNet() : void {
        this._ctx.setLineDash([this._canvas.height/25, this._canvas.height/25]);
        this._ctx.lineWidth = 2;
        this._ctx.strokeStyle = COLOR;
        this._ctx.beginPath();
        this._ctx.moveTo(this._canvas.width / 2, 0);
        this._ctx.lineTo(this._canvas.width / 2, this._canvas.height);
        this._ctx.stroke();
        this._ctx.setLineDash([]);
    }
    
    drawBorder() : void {
        this._ctx.lineWidth = 4;
        this._ctx.strokeStyle = COLOR;
        this._ctx.strokeRect(0, 0, this._canvas.width, this._canvas.height);
    }
    
    renderGame() : void {
        const { ball, paddleLeft, paddleRight } = gameState;
    
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this.drawBorder();
        this.drawNet();
        this.drawPaddle(0, paddleLeft.y);
        this.drawPaddle(this._canvas.width - SERVER_PADDLE_WIDTH/SERVER_PLAY_FIELD_WIDTH * this._canvas.width, paddleRight.y);
        this.drawBall(ball.x, ball.y);
        this.drawTrail(ball.x, ball.y);
        this.drawScore(paddleLeft.score, paddleRight.score);
    }

    addEventListeners(): void {
        document.addEventListener("touchstart", (event) => {
            event.preventDefault();
            const touchX = event.touches[event.touches.length - 1].clientX;
        
            if (touchX < window.innerWidth / 2 && upPressed === false) {
                this.sendPaddlePosition("up");
                upPressed = true;
                downPressed = false;
            } 
            else if (downPressed === false) {
                this.sendPaddlePosition("down");
                downPressed = true;
                upPressed = false;
            }
        });

        document.addEventListener("touchend", (event) => {
            event.preventDefault();
            if (event.touches.length === 0) {
                this.sendPaddlePosition("none");
                upPressed = false;
                downPressed = false;
            } 
        });

        document.addEventListener("keyup", (event) => {
            if (event.key === "ArrowUp" && upPressed === true) {
                this.sendPaddlePosition("none");
                upPressed = false;
            }
            else if (event.key === "ArrowDown" && downPressed === true) {
                this.sendPaddlePosition("none");
                downPressed = false;
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "ArrowUp" && upPressed === false) {
                this.sendPaddlePosition("up");
                upPressed = true;
                downPressed = false;
            } 
            else if (event.key === "ArrowDown" && downPressed === false) {
                this.sendPaddlePosition("down");
                downPressed = true;
                upPressed = false;
            }
        });
    }
}

customElements.define("game-canvas", Game);