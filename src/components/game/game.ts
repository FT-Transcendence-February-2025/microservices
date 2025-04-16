import gameTemplate from './game.html?raw';
import PongGame from "./utils/LocalGame.js"

const template = document.createElement('template');
template.innerHTML = gameTemplate;

const LOCAL_GAME_LOOP_INTERVAL = 1000/60; // 60 FPS
const SERVER_PLAY_FIELD_HEIGHT = 1080;
const SERVER_PLAY_FIELD_WIDTH = 1920;
const SERVER_PADDLE_WIDTH = 30;
const SERVER_PADDLE_HEIGHT = 180;
const SERVER_BALL_RADIUS = 15;

const COLOR = '#f74fe6';
const TRAIL_LENGTH = 30;

interface GameState {
    ball: {
        x: number;
        y: number;
    };
    paddleLeft: {
        y: number;
        score: number;
    };
    paddleRight: {
        y: number;
        score: number;
    };
}

export default class Game extends HTMLElement {
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _socket: WebSocket | null;
    private _isLocal: boolean;
    private _upPressed: boolean;
    private _downPressed: boolean;
    private _wPressed: boolean;
    private _sPressed: boolean;
    private _gameState: GameState;
    private _localGame: PongGame | null;
    private _localGameLoop: number | null;
    private _trail : any;
    private _card: HTMLElement;
    private _playerId!: string;

    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
        this._canvas = this.querySelector("#pongCanvas") as HTMLCanvasElement;
        if (!this._canvas) 
            throw new Error("Could not find canvas element");
        this._ctx = this._canvas.getContext("2d") as CanvasRenderingContext2D;
        if (!this._ctx)
            throw new Error("Could not get 2d context");
        this._canvas.width = this._canvas.clientWidth;
        this._canvas.height = this._canvas.clientHeight;
        this._isLocal = window.location.hash === '#local' ? true : false;

        this._upPressed = false;
        this._downPressed = false;
        this._wPressed = false;
        this._sPressed = false;
        this._trail= [];
        this._socket = null;
        this._localGame = null;
        this._localGameLoop = null;
        this._gameState = {
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
        if (this._isLocal) {
            this._localGame = new PongGame();
            this._runLocalGame();
        }
        else {
            const urlParams = new URLSearchParams(window.location.search);
            const matchId = urlParams.get('matchId');
            const playerId = urlParams.get('playerId');
            if (!matchId || !playerId) throw new Error("Missing matchId or playerId");
            this._playerId = playerId;
            console.log("Parsed matchId:", matchId, "playerId:", playerId);
            this._socket = new WebSocket(`ws://${window.location.hostname}:3005/games/${matchId}?playerId=${playerId}`);
            this._addSocketListener();
        } 
        this._card = this.querySelector('.card') as HTMLElement;
        if (!this._card) {
            throw new Error("Could not find '.card' element")
        }
    }

    connectedCallback() {
        this._canvas.width = this._canvas.clientWidth;
        this._canvas.height = this._canvas.clientHeight;
        document.addEventListener("touchstart", this._handleTouchStart.bind(this));
        document.addEventListener("touchend", this._handleTouchEnd.bind(this));
        document.addEventListener("keyup", this._handleKeyUp.bind(this));
        document.addEventListener("keydown", this._handleKeyDown.bind(this));
    }

    disconnectedCallback() {
        document.removeEventListener("touchstart", this._handleTouchStart);
        document.removeEventListener("touchend", this._handleTouchEnd);
        document.removeEventListener("keyup", this._handleKeyUp);
        document.removeEventListener("keydown", this._handleKeyDown);
        if (this._isLocal && this._localGameLoop)
            clearInterval(this._localGameLoop);

    }

    private _runLocalGame() {
        this._localGameLoop = setInterval(() => {
            this._localGame?.update();
            this._updateGameState(this._localGame?.getGameState());
            if (this._localGame?.isGameOver() && this._localGameLoop)
                clearInterval(this._localGameLoop);
        }, LOCAL_GAME_LOOP_INTERVAL);
    }

    private _handleTouchStart(event: TouchEvent) : void {
        event.preventDefault();

        if (this._isLocal) {
            // needs to be implemented
        }
        else {
            const touchX = event.touches[event.touches.length - 1].clientX; 

            if (touchX < window.innerWidth / 2 && this._upPressed === false) {
                this._sendPaddlePosition("up");
                this._upPressed = true;
                this._downPressed = false;
            } 
            else if (this._downPressed === false) {
                this._sendPaddlePosition("down");
                this._downPressed = true;
                this._upPressed = false;
            }
        }
    }
    
    private _handleTouchEnd(event: TouchEvent) : void {
        event.preventDefault();

        if (this._isLocal) {
            // needs to be implemented
        }
        else {
            if (event.touches.length === 0) {
                this._sendPaddlePosition("none");
                this._upPressed = false;
                this._downPressed = false;
            }
        }
    }

    private _handleKeyUp(event: KeyboardEvent): void {
        if (this._isLocal) {
            if (event.key === "w" && this._wPressed === true) {
                this._localGame?.setPaddleDir('left', 'none');
                this._wPressed = false;
            }
            else if (event.key === "s" && this._sPressed === true) {
                this._localGame?.setPaddleDir('left', 'none');
                this._sPressed = false;
            }
            else if (event.key === "ArrowUp" && this._upPressed === true) {
                this._localGame?.setPaddleDir('right', 'none');
                this._upPressed = false;
            }
            else if (event.key === "ArrowDown" && this._downPressed === true) {
                this._localGame?.setPaddleDir('right', 'none');
                this._downPressed = false;
            }
        }
        else {
            if (event.key === "ArrowUp" && this._upPressed === true) {
                this._sendPaddlePosition("none");
                this._upPressed = false;
            }
            else if (event.key === "ArrowDown" && this._downPressed === true) {
                this._sendPaddlePosition("none");
                this._downPressed = false;
            }
        }
    }

    private _handleKeyDown(event: KeyboardEvent): void {
        if (this._isLocal) {
            if (event.key === "w" && this._wPressed === false) {
                this._localGame?.setPaddleDir('left', 'up');
                this._wPressed = true;
                this._sPressed = false;
            }
            else if (event.key === "s" && this._sPressed === false) {
                this._localGame?.setPaddleDir('left', 'down');
                this._sPressed = true;
                this._wPressed = false;
            }
            else if (event.key === "ArrowUp" && this._upPressed === false) {
                this._localGame?.setPaddleDir('right', 'up');
                this._upPressed = true;
                this._downPressed = false;
            }
            else if (event.key === "ArrowDown" && this._downPressed === false) {
                this._localGame?.setPaddleDir('right', 'down');
                this._downPressed = true;
                this._upPressed = false;
            }
        }
        else {
            if (event.key === "ArrowUp" && this._upPressed === false) {
                this._sendPaddlePosition("up");
                this._upPressed = true;
                this._downPressed = false;
            }
            else if (event.key === "ArrowDown" && this._downPressed === false) {
                this._sendPaddlePosition("down");
                this._downPressed = true;
                this._upPressed = false;
            }
        }
    }

    private _addSocketListener(): void {
        if (this._socket === null)
            return;
        this._socket.onopen = () => {
            console.log("Connected WebSocket to server.");
        };
        this._socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
        this._socket.onclose = () => {
            console.log("WebSocket connection closed.");
        };
        this._socket.onmessage = (message) => {
            try {
                const parsedData = JSON.parse(message.data);
                if (parsedData.type == 'matchFinished') {
                    console.log('Received finishMessage:', parsedData);
                    this.updateUIForMatchFinished({
                        winnerId: parsedData.winnerId,
                        winnerScore: parsedData.winnerScore,
                        loserScore: parsedData.loserScore
                    });
                } else {
                    this._updateGameState(parsedData);
                }
            } catch (error) {
                console.error('Failed to parse received data:', error);
            }
        }
    }

    private _updateGameState(parsedData: any): void {
        if (!this._isGameState(parsedData))
            return ;
        this._gameState.ball.x = parsedData.ball.x / SERVER_PLAY_FIELD_WIDTH * this._canvas.width;
        this._gameState.ball.y = parsedData.ball.y / SERVER_PLAY_FIELD_HEIGHT * this._canvas.height;
        this._gameState.paddleLeft.y = parsedData.paddleLeft.y / SERVER_PLAY_FIELD_HEIGHT * this._canvas.height;
        this._gameState.paddleRight.y = parsedData.paddleRight.y / SERVER_PLAY_FIELD_HEIGHT * this._canvas.height;
        this._gameState.paddleLeft.score = parsedData.paddleLeft.score;
        this._gameState.paddleRight.score = parsedData.paddleRight.score;
        // console.log('pre Render');
        this._renderGame();
    }

    private _isGameState(obj: any): boolean {
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
    
    private _sendPaddlePosition(direction: string): void {
        if (this._socket === null)
            return;
        const data = {
            type: "paddleMove",
            dir: direction,
        };
        if (this._socket.readyState === WebSocket.OPEN)
            this._socket.send(JSON.stringify(data));
    }

    private _drawPaddle (x: number, y: number): void {
        this._ctx.fillStyle = COLOR;
        this._ctx.fillRect(x, y, SERVER_PADDLE_WIDTH/SERVER_PLAY_FIELD_WIDTH * this._canvas.width, SERVER_PADDLE_HEIGHT/SERVER_PLAY_FIELD_HEIGHT * this._canvas.height);
    }
    
    private _drawBall(x: number, y: number) : void {
        this._ctx.beginPath();
        this._ctx.arc(x, y, SERVER_BALL_RADIUS/SERVER_PLAY_FIELD_HEIGHT * this._canvas.height, 0, Math.PI * 2);
        this._ctx.fillStyle = COLOR;
        this._ctx.fill();
        this._ctx.closePath();
    }
    
    private _drawTrail(x: number, y: number) : void {
        this._trail.push({ x, y });
        if (this._trail.length > TRAIL_LENGTH)
            this._trail.shift();
        this._ctx.save();
        for (let i = 0; i < this._trail.length; i++) {
            const age = this._trail.length - i;
            const alpha = Math.max(1 - age / this._trail.length, 0);
            const radius = SERVER_BALL_RADIUS/SERVER_PLAY_FIELD_HEIGHT * this._canvas.height * (0.5 + alpha * 0.5);
    
            this._ctx.beginPath();
            this._ctx.globalAlpha = alpha * 0.3;
            this._ctx.fillStyle = COLOR;
            this._ctx.arc(this._trail[i].x, this._trail[i].y, radius, 0, Math.PI * 2);
            this._ctx.fill();
        }
        this._ctx.restore();
    }
    
    private _drawScore(score1: number, score2: number) : void {
        this._ctx.font = `${this._canvas.height/15}px Arial`;
        this._ctx.fillStyle = COLOR;
        this._ctx.textAlign = "center";
        this._ctx.fillText(score1.toString(), this._canvas.width / 4, this._canvas.height/15);
        this._ctx.fillText(score2.toString(), 3 * this._canvas.width / 4, this._canvas.height/15);
    }
    
    private _drawNet() : void {
        this._ctx.setLineDash([this._canvas.height/25, this._canvas.height/25]);
        this._ctx.lineWidth = 2;
        this._ctx.strokeStyle = COLOR;
        this._ctx.beginPath();
        this._ctx.moveTo(this._canvas.width / 2, 0);
        this._ctx.lineTo(this._canvas.width / 2, this._canvas.height);
        this._ctx.stroke();
        this._ctx.setLineDash([]);
    }
    
    private _drawBorder() : void {
        this._ctx.lineWidth = 4;
        this._ctx.strokeStyle = COLOR;
        this._ctx.strokeRect(0, 0, this._canvas.width, this._canvas.height);
    }
    
    private _renderGame() : void {
        const { ball, paddleLeft, paddleRight } = this._gameState;
    
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this._drawBorder();
        this._drawNet();
        this._drawPaddle(0, paddleLeft.y);
        this._drawPaddle(this._canvas.width - SERVER_PADDLE_WIDTH/SERVER_PLAY_FIELD_WIDTH * this._canvas.width, paddleRight.y);
        this._drawBall(ball.x, ball.y);
        this._drawTrail(ball.x, ball.y);
        this._drawScore(paddleLeft.score, paddleRight.score);
    }

    private updateUIForMatchFinished(data: {winnerId: number, winnerScore: number, loserScore: number }): void {
        const currentUserId = Number(this._playerId);
        let resultMessage = "";

        if (currentUserId === data.winnerId) {
            resultMessage = `YOU WON! Score: ${data.winnerScore}`;
        } else {
            resultMessage = `YOU LOST! Score: ${data.loserScore}`;
        }
        this._card.innerHTML = `
        <div class="text-lg font-bold mb-6">${resultMessage}</div>
        <a href="/home" class="btn-primary w-full text-center" id="homeButton">Back Home</a>
        `;
        this._card.style.display = 'flex';
        const homeBtn = this._card.querySelector('#homeButton') as HTMLAnchorElement;
        if (homeBtn) {
            homeBtn.addEventListener('click', () => {
                this._socket?.close();
                // @ts-ignore
                window.navigateTo('/home');
            });
        } else {
            throw new Error("Could not find '#homeButton element");
        }
    }
}

customElements.define("game-canvas", Game);