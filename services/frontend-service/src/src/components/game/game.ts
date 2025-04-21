import gameTemplate from './game.html?raw';
import PongGame from "./utils/LocalGame.js";

const template = document.createElement('template');
template.innerHTML = gameTemplate;

const LOCAL_GAME_LOOP_INTERVAL = 1000/60; // 60 FPS
const SERVER_PLAY_FIELD_HEIGHT = 1080;
const SERVER_PLAY_FIELD_WIDTH = 1920;
const SERVER_PADDLE_WIDTH = 30;
const SERVER_PADDLE_HEIGHT = 180;
const SERVER_BALL_RADIUS = 15;

const COLOR = '#e1f734';
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
    private _trail: Array<{ x: number; y: number }>;
    private _gameResult: HTMLElement;
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
        this._gameResult = this.querySelector('#gameResult') as HTMLElement;
        if (!this._gameResult)
            throw new Error("Could not find gameResult element");
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
            if (!matchId || !playerId)
                throw new Error("Missing matchId or playerId");
            this._playerId = playerId;
            console.log("Parsed matchId:", matchId, "playerId:", playerId);
            this._socket = new WebSocket(`wss://${window.location.hostname}:3005/games/${matchId}?playerId=${playerId}`);
            this._addSocketListener();
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

    private _renderGameResult(gameEndState: GameState) {
        this._canvas.style.display = 'none';
        this._gameResult.innerHTML = `
            <div class="fixed inset-0 flex items-center justify-center z-[9999]">
            <div class="card text-center max-w-lg w-full bg-white p-8 rounded-lg shadow-lg">
                <h1 class="text-3xl font-bold mb-4 text-gray-900">Game Over</h1>
                <div class="flex justify-around gap-8 mb-6 text-xl font-semibold">
                    <div>
                        <div class="mb-2 text-gray-700">Left Player</div>
                        <div id="left-score" class="text-3xl text-blue-600">${gameEndState.paddleLeft.score}</div>
                    </div>
                    <div>
                        <div class="mb-2 text-gray-700">Right Player</div>
                        <div id="right-score" class="text-3xl text-red-600">${gameEndState.paddleRight.score}</div>
                    </div>
                </div>
                <button class="btn-primary w-3/4 mx-auto mb-4" onClick="window.navigateTo('/game#local')">Rematch</button>
                <button class="btn-primary w-3/4 mx-auto" onClick="window.navigateTo('/home')">Home</button>
            </div>
        </div>
        `;
    }

    private _runLocalGame() {
        this._localGame
        this._localGameLoop = window.setInterval(() => {
            this._localGame?.update();
            this._updateGameState(this._localGame?.getGameState());
            if (this._localGame?.isGameOver() && this._localGameLoop) {
                clearInterval(this._localGameLoop);
                this._renderGameResult(this._localGame?.getGameState());
            }
        }, LOCAL_GAME_LOOP_INTERVAL);
    }

    private _handleTouchStart(event: TouchEvent) : void {
        event.preventDefault();
        if (this._isLocal) {
            let leftUp = false;
            let leftDown = false;
            let rightUp = false;
            let rightDown = false;
            for (let i = 0; i < event.touches.length; i++) {
                const touch = event.touches[i];
                const x = touch.clientX;
                const y = touch.clientY;
                const isLeftSide = x < window.innerWidth / 2;
                const isTopHalf = y < window.innerHeight / 2;

                if (isLeftSide) {
                    if (isTopHalf)
                        leftUp = true;
                    else
                        leftDown = true;
                } 
                else {
                    if (isTopHalf)
                        rightUp = true;
                    else
                        rightDown = true;
                }
            }
            if (leftUp && !this._wPressed) {
                this._localGame?.setPaddleDir('left', 'up');
                this._wPressed = true;
                this._sPressed = false;
            } else if (leftDown && !this._sPressed) {
                this._localGame?.setPaddleDir('left', 'down');
                this._sPressed = true;
                this._wPressed = false;
            }
            if (rightUp && !this._upPressed) {
                this._localGame?.setPaddleDir('right', 'up');

                this._upPressed = true;
                this._downPressed = false;
            } else if (rightDown && !this._downPressed) {
                this._localGame?.setPaddleDir('right', 'down');
                this._downPressed = true;
                this._upPressed = false;
            }
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
            let leftUp = false;
            let leftDown = false;
            let rightUp = false;
            let rightDown = false;
            for (let i = 0; i < event.touches.length; i++) {
                const touch = event.touches[i];
                const x = touch.clientX;
                const y = touch.clientY;
                const isLeftSide = x < window.innerWidth / 2;
                const isTopHalf = y < window.innerHeight / 2;
        
                if (isLeftSide) {
                    if (isTopHalf)
                        leftUp = true;
                    else
                        leftDown = true;
                }
                else {
                    if (isTopHalf)
                        rightUp = true;
                    else
                        rightDown = true;
                }
            }
            if (!leftUp && !leftDown && (this._wPressed || this._sPressed)) {
                this._localGame?.setPaddleDir('left', 'none');
                this._wPressed = false;
                this._sPressed = false;
            }
            if (!rightUp && !rightDown && (this._upPressed || this._downPressed)) {
                this._localGame?.setPaddleDir('right', 'none');
                this._upPressed = false;
                this._downPressed = false;
            } 
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
                    this.renderMatchOutcome({
                        winnerId: parsedData.winnerId,
                        winnerScore: parsedData.winnerScore,
                        loserScore: parsedData.loserScore
                    });
                } else {
                    this._updateGameState(parsedData);
                }
                    this._updateGameState(parsedData);
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

    private renderMatchOutcome(data: { winnerId: number, winnerScore: number, loserScore: number }): void {
        const currentUserId = Number(this._playerId);
        let resultMessage = "";
        let borderColor = "";

        if (currentUserId === data.winnerId) {
            resultMessage = `<strong>Victory!</strong><br><br>Your Score: ${data.winnerScore}`;
            borderColor = "#39ff14";
        } else {
            resultMessage = `<strong>Defeat!</strong><br><br>Your Score: ${data.loserScore}`;
            borderColor = "#ff073a";
        }
        this._gameResult.innerHTML = this._renderOnlineGameResult(resultMessage, borderColor);
        this._gameResult.style.display = 'flex';
        const homeBtn = this._gameResult.querySelector('#homeButton') as HTMLAnchorElement;
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

    private _renderOnlineGameResult(resultMessage: string, borderColor: string): string {
        this._canvas.style.display = 'none';
        return `
            <div class="fixed inset-0 flex items-center justify-center z-[9999]">
            <div class="card text-center max-w-lg w-full bg-white p-8 rounded-lg shadow-lg" style="
                border: 2px solid ${borderColor};
                box-shadow: 0 0 20px ${borderColor};
            ">
                <div class="flex flex-col space-y-8">
                    <h1 class="text-2xl font-bold mb-4 text-black">Game Over</h1>
                    <div class="text-lg mb-6 text-gray-800">
                        ${resultMessage}
                    </div>
                    <a href="/home" class="btn-primary w-3/4 mx-auto" id="homeButton">Return Home</a>
                </div>
            </div>
        </div>
        `;
    }
}

customElements.define("game-canvas", Game);