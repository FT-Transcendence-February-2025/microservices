const PLAY_FIELD_HEIGHT = 1080;
const PLAY_FIELD_WIDTH = 1920;

const PADDLE_WIDTH = 30;
const PADDLE_HEIGHT = 180;
const PADDLE_SPEED = 15;

const BALL_START_SPEED = 8;
const BALL_ACCELERATION = 2;
const BALL_MAX_SPEED = 25;
const BALL_RADIUS = 15;

const WINNING_SCORE = 11;
const SCORE_DIFFERENCE = 2;

interface Ball {
    x: number;
    y: number;
    speed: number;
    angle: number;
    spin: number;
    lastCollision: Paddle | null;
}

interface Paddle {
    y: number;
    dir: number;
    score: number;
}

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

export default class PongGame {
    private _ball: Ball;
    private _paddleLeft: Paddle;
    private _paddleRight: Paddle;
    private _isGameOver: boolean;

    constructor() {
        this._ball = {
            x: PLAY_FIELD_WIDTH / 2,
            y: PLAY_FIELD_HEIGHT / 2,
            speed: BALL_START_SPEED,
            angle: Math.PI / 4 * (1 + 2 * Math.floor(Math.random() * 4)),
            spin: 0,
            lastCollision: null
        };
        this._paddleLeft = {
            y: PLAY_FIELD_HEIGHT / 2 - PADDLE_HEIGHT / 2,
            dir: 0,
            score: 0
        };
        this._paddleRight = {
            y: PLAY_FIELD_HEIGHT / 2 - PADDLE_HEIGHT / 2,
            dir: 0,
            score: 0
        };
        this._isGameOver = false;
    }

    private _resetBall() {
        this._ball.x = PLAY_FIELD_WIDTH / 2;
        this._ball.y = PLAY_FIELD_HEIGHT / 2;
        this._ball.speed = BALL_START_SPEED;
        if (this._ball.lastCollision === null)
            this._ball.angle = Math.PI / 4 * (1 + 2 * Math.floor(Math.random() * 4));
        else if (this._ball.lastCollision === this._paddleLeft)
            this._ball.angle = Math.random() < 0.5 ? (5 * Math.PI) / 4 : (7 * Math.PI) / 4;
        else
            this._ball.angle = Math.random() < 0.5 ? Math.PI / 4 : (3 * Math.PI) / 4;
        this._ball.spin = 0;
        this._ball.lastCollision = null;
    }

    private _updatePaddle(paddle: Paddle) {
        if (paddle.dir)
            paddle.y = Math.max(0, Math.min(PLAY_FIELD_HEIGHT - PADDLE_HEIGHT, paddle.y + paddle.dir * PADDLE_SPEED));
    }

    private _updateBall() {
        this._ball.x += Math.cos(this._ball.angle) * this._ball.speed;
        this._ball.y += Math.sin(this._ball.angle) * this._ball.speed;
        this._ball.angle += this._ball.spin;
        this._ball.spin *= 0.98; // Gradually reduce spin
    }

    private _ballHitsPaddles(): Paddle | false {
        if (this._ball.x - BALL_RADIUS <= PADDLE_WIDTH &&
            this._ball.y >= this._paddleLeft.y &&
            this._ball.y <= this._paddleLeft.y + PADDLE_HEIGHT)
            return this._paddleLeft;
        else if (this._ball.x + BALL_RADIUS >= PLAY_FIELD_WIDTH - PADDLE_WIDTH &&
            this._ball.y >= this._paddleRight.y &&
            this._ball.y <= this._paddleRight.y + PADDLE_HEIGHT)
            return this._paddleRight;
        else
            return false;
    }

    private _calculateNewAngle(paddle: Paddle): number {
        const hitPosition = (this._ball.y - paddle.y) / PADDLE_HEIGHT;
        const angleChange = (hitPosition - 0.5) * Math.PI / 4;
        let newAngle = Math.PI - this._ball.angle + angleChange;

        // Ensure newAngle is within [0, 2π]
        newAngle = newAngle % (2 * Math.PI);
        if (newAngle < 0) newAngle += 2 * Math.PI;

        const PI_4 = Math.PI / 4;  // 45 degrees
        const PI_3_4 = 3 * Math.PI / 4;  // 135 degrees
        const PI_5_4 = 5 * Math.PI / 4;  // 225 degrees
        const PI_7_4 = 7 * Math.PI / 4;  // 315 degrees

        if (newAngle > PI_4 && newAngle < PI_3_4)
            return newAngle > Math.PI / 2 ? PI_3_4 : PI_4;
        else if (newAngle > PI_5_4 && newAngle < PI_7_4)
            return newAngle < 3 * Math.PI / 2 ? PI_5_4 : PI_7_4;
        return newAngle;
    }

    private _checkCollisions() {
        // Top and bottom wall
        if (this._ball.y - BALL_RADIUS <= 0 || this._ball.y + BALL_RADIUS >= PLAY_FIELD_HEIGHT)
            this._ball.angle *= -1;

        // Paddles
        const paddle = this._ballHitsPaddles();
        if (paddle && this._ball.lastCollision != paddle) {
            this._ball.angle = this._calculateNewAngle(paddle);
            if (this._ball.speed < BALL_MAX_SPEED)
                this._ball.speed += BALL_ACCELERATION;
            this._ball.spin = paddle.dir * PADDLE_SPEED * 0.00075;
            this._ball.lastCollision = paddle;
        }
    }

    private _checkWin() {
        if ((this._paddleLeft.score >= WINNING_SCORE && this._paddleLeft.score >= this._paddleRight.score + SCORE_DIFFERENCE)
            || (this._paddleRight.score >= WINNING_SCORE && this._paddleRight.score >= this._paddleLeft.score + SCORE_DIFFERENCE))
            this._isGameOver = true;
    }

    private _checkScoring() {
        const isLeftSideScore = this._ball.x - BALL_RADIUS <= 0;
        const isRightSideScore = this._ball.x + BALL_RADIUS >= PLAY_FIELD_WIDTH;

        if (isLeftSideScore || isRightSideScore) {
            if (isLeftSideScore)
                this._paddleRight.score++;
            else
                this._paddleLeft.score++;
            this._resetBall();
            this._checkWin();
        }
    }

    setPaddleDir(paddle: string, direction: string) {
        if (paddle === 'left') {
            if (direction === 'down')
                this._paddleLeft.dir = 1;
            else if (direction === 'up')
                this._paddleLeft.dir = -1;
            else
                this._paddleLeft.dir = 0;
        }
        else if (paddle === 'right') {
            if (direction == 'down')
                this._paddleRight.dir = 1;
            else if (direction === 'up')
                this._paddleRight.dir = -1;
            else
                this._paddleRight.dir = 0;
        }
    }

    isGameOver(): boolean {
        return this._isGameOver;
    }

    getGameState(): GameState {
        return {
            ball: {
                x: this._ball.x,
                y: this._ball.y
            },
            paddleLeft: {
                y: this._paddleLeft.y,
                score: this._paddleLeft.score
            },
            paddleRight: {
                y: this._paddleRight.y,
                score: this._paddleRight.score
            }
        };
    }

    update() {
        this._updatePaddle(this._paddleLeft);
        this._updatePaddle(this._paddleRight);
        this._updateBall();
        this._checkCollisions();
        this._checkScoring();
    }
}