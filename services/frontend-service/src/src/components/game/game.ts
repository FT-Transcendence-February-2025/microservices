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

<<<<<<< HEAD
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

let socket: any;

// try {
//     socket = new WebSocket(`ws://${window.location.hostname}:3001/game`);
// } catch (error) {
//     console.log('websocket not connected')
// }

export default class Game extends HTMLElement {
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
=======
export default class Game extends HTMLElement {
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _socket: WebSocket;
    private _secondSocket: WebSocket | null;
    private _local: boolean;
    private _upPressed: boolean;
    private _downPressed: boolean;
    private _wPressed: boolean;
    private _sPressed: boolean;
    private _gameState;
    private _trail : any;
>>>>>>> a71674a137cf46ac2b2daa4f9e71e7c05690af72

    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));

        this._canvas = this.querySelector("#pongCanvas") as HTMLCanvasElement;
        if (!this._canvas) 
            throw new Error("Could not find canvas element");

        this._ctx = this._canvas.getContext("2d") as CanvasRenderingContext2D;
        if (!this._ctx)
            throw new Error("Could not get 2d context");
<<<<<<< HEAD
=======

        window.location.hash === '#local' ? this._local = true : this._local = false;

        this._socket = new WebSocket(`ws://${window.location.hostname}:3001/game`);
        this._local === true ? this._secondSocket = new WebSocket(`ws://${window.location.hostname}:3001/game`) : this._secondSocket = null;
        this._upPressed = false;
        this._downPressed = false;
        this._wPressed = false;
        this._sPressed = false;
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
        this._trail= [];
>>>>>>> a71674a137cf46ac2b2daa4f9e71e7c05690af72
    }

    connectedCallback() {
        this._canvas.width = this._canvas.clientWidth;
        this._canvas.height = this._canvas.clientHeight;

<<<<<<< HEAD
        // socket.onmessage = (message) => {
        //     try {
        //         const parsedData = JSON.parse(message.data);
        //             this.updateGameState(parsedData);
        //     } catch (error) {
        //         console.error('Failed to parse received data:', error);
        //     }
        // }

        // socket.onopen = () => {
        //     console.log("Connected to WebSocket server.");
        // };

        // socket.onerror = (error) => {
        //     console.error("WebSocket error:", error);
        // };

        // socket.onclose = () => {
        //     console.log("WebSocket connection closed.");
        // };

        // this.addEventListeners();
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
=======
        document.addEventListener("touchstart", this.handleTouchStart.bind(this));
        document.addEventListener("touchend", this.handleTouchEnd.bind(this));
        document.addEventListener("keyup", this.handleKeyUp.bind(this));
        document.addEventListener("keydown", this.handleKeyDown.bind(this));
    }

    disconnectedCallback() {
        document.removeEventListener("touchstart", this.handleTouchStart);
        document.removeEventListener("touchend", this.handleTouchEnd);
        document.removeEventListener("keyup", this.handleKeyUp);
        document.removeEventListener("keydown", this.handleKeyDown);
    }

    handleTouchStart(event: TouchEvent) : void {
        event.preventDefault();

        if (this._local) {
            
        }
        else {
            const touchX = event.touches[event.touches.length - 1].clientX;
    
            if (touchX < window.innerWidth / 2 && this._upPressed === false) {
                this.sendPaddlePosition("up");
                this._upPressed = true;
                this._downPressed = false;
            } 
            else if (this._downPressed === false) {
                this.sendPaddlePosition("down");
                this._downPressed = true;
                this._upPressed = false;
            }
        }
    }

    handleTouchEnd(event: TouchEvent) : void {
        if (this._local) {

        }
        else {
            event.preventDefault();
            if (event.touches.length === 0) {
                this.sendPaddlePosition("none");
                this._upPressed = false;
                this._downPressed = false;
            }
        }
    }
    
    handleKeyUp(event: KeyboardEvent) : void{
        if (event.key === "ArrowUp" && this._upPressed === true) {
            this.sendPaddlePosition("none");
            this._upPressed = false;
        }
        else if (event.key === "ArrowDown" && this._downPressed === true) {
            this.sendPaddlePosition("none");
            this._downPressed = false;
        }
        if (this._local) {
            if (event.key === "w" && this._wPressed === true) {
                this.sendPaddlePositionSecondSocket("none");
                this._wPressed = false;
            }
            else if (event.key === "s" && this._sPressed === true) {
                this.sendPaddlePositionSecondSocket("none");
                this._downPressed = false;
            }
        }
    }

    handleKeyDown(event: KeyboardEvent) : void {
        if (event.key === "ArrowUp" && this._upPressed === false) {
            this.sendPaddlePosition("up");
            this._upPressed = true;
            this._downPressed = false;
        } 
        else if (event.key === "ArrowDown" && this._downPressed === false) {
            this.sendPaddlePosition("down");
            this._downPressed = true;
            this._upPressed = false;
        }
        if (this._local) {
            if (event.key === "w" && this._wPressed === false) {
                this.sendPaddlePositionSecondSocket("up");
                this._wPressed = true;
                this._sPressed = false;
            } 
            else if (event.key === "s" && this._sPressed === false) {
                this.sendPaddlePositionSecondSocket("down");
                this._sPressed = true;
                this._wPressed = false;
            }
        }
    }

    addSocketListener() : void {
        this._socket.onmessage = (message) => {
            try {
                const parsedData = JSON.parse(message.data);
                    this.updateGameState(parsedData);
                console.log(parsedData);
            } catch (error) {
                console.error('Failed to parse received data:', error);
            }
        }

        this._socket.onopen = () => {
            console.log("Connected WebSocket to server.");
        };

        this._socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        this._socket.onclose = () => {
            console.log("WebSocket connection closed.");
        };

        if (this._secondSocket) {
            this._secondSocket.onopen = () => {
                console.log("Connected second WebSocket to server.");
            };
    
            this._secondSocket.onerror = (error) => {
                console.error("Second WebSocket error:", error);
            };
    
            this._secondSocket.onclose = () => {
                console.log("Second WebSocket connection closed.");
            };
        }
    }

    updateGameState(parsedData: any) : void {
        if (!this.isGameState(parsedData))
            return ;
        this._gameState.ball.x = parsedData.ball.x / SERVER_PLAY_FIELD_WIDTH * this._canvas.width;
        this._gameState.ball.y = parsedData.ball.y / SERVER_PLAY_FIELD_HEIGHT * this._canvas.height;
        this._gameState.paddleLeft.y = parsedData.paddleLeft.y / SERVER_PLAY_FIELD_HEIGHT * this._canvas.height;
        this._gameState.paddleRight.y = parsedData.paddleRight.y / SERVER_PLAY_FIELD_HEIGHT * this._canvas.height;
        this._gameState.paddleLeft.score = parsedData.paddleLeft.score;
        this._gameState.paddleRight.score = parsedData.paddleRight.score;

>>>>>>> a71674a137cf46ac2b2daa4f9e71e7c05690af72
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
<<<<<<< HEAD
        if (socket.readyState === WebSocket.OPEN)
            socket.send(JSON.stringify(data));
=======
        if (this._socket.readyState === WebSocket.OPEN)
            this._socket.send(JSON.stringify(data));
    }

    sendPaddlePositionSecondSocket(direction: string) : void {
        const data = {
            type: "paddleMove",
            dir: direction,
        };
        if (this._secondSocket && this._secondSocket.readyState === WebSocket.OPEN)
            this._secondSocket.send(JSON.stringify(data));
>>>>>>> a71674a137cf46ac2b2daa4f9e71e7c05690af72
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
<<<<<<< HEAD
        trail.push({ x, y });
        if (trail.length > TRAIL_LENGTH)
            trail.shift();
        this._ctx.save();
        for (let i = 0; i < trail.length; i++) {
            const age = trail.length - i;
            const alpha = Math.max(1 - age / trail.length, 0);
=======
        this._trail.push({ x, y });
        if (this._trail.length > TRAIL_LENGTH)
            this._trail.shift();
        this._ctx.save();
        for (let i = 0; i < this._trail.length; i++) {
            const age = this._trail.length - i;
            const alpha = Math.max(1 - age / this._trail.length, 0);
>>>>>>> a71674a137cf46ac2b2daa4f9e71e7c05690af72
            const radius = SERVER_BALL_RADIUS/SERVER_PLAY_FIELD_HEIGHT * this._canvas.height * (0.5 + alpha * 0.5);
    
            this._ctx.beginPath();
            this._ctx.globalAlpha = alpha * 0.3;
            this._ctx.fillStyle = COLOR;
<<<<<<< HEAD
            this._ctx.arc(trail[i].x, trail[i].y, radius, 0, Math.PI * 2);
=======
            this._ctx.arc(this._trail[i].x, this._trail[i].y, radius, 0, Math.PI * 2);
>>>>>>> a71674a137cf46ac2b2daa4f9e71e7c05690af72
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
<<<<<<< HEAD
        const { ball, paddleLeft, paddleRight } = gameState;
=======
        const { ball, paddleLeft, paddleRight } = this._gameState;
>>>>>>> a71674a137cf46ac2b2daa4f9e71e7c05690af72
    
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this.drawBorder();
        this.drawNet();
        this.drawPaddle(0, paddleLeft.y);
        this.drawPaddle(this._canvas.width - SERVER_PADDLE_WIDTH/SERVER_PLAY_FIELD_WIDTH * this._canvas.width, paddleRight.y);
        this.drawBall(ball.x, ball.y);
        this.drawTrail(ball.x, ball.y);
        this.drawScore(paddleLeft.score, paddleRight.score);
    }
<<<<<<< HEAD

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
=======
>>>>>>> a71674a137cf46ac2b2daa4f9e71e7c05690af72
}

customElements.define("game-canvas", Game);