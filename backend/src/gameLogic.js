const PLAY_FIELD_HEIGHT = 1080;
const PLAY_FIELD_WIDTH = 1920;

const PADDLE_WIDTH = 30;
const PADDLE_HEIGHT = 180;
const PADDLE_SPEED = 15;

const BALL_START_SPEED = 8;
const BALL_ACCELERATION = 2;
const BALL_MAX_SPEED = 20;
const BALL_RADIUS = 15;

const WINNING_SCORE = 11;
const SCORE_DIFFERENCE = 2;

const pongGame = {
    ball: {
        x: PLAY_FIELD_WIDTH/2,
        y: PLAY_FIELD_HEIGHT/2,
        speed: BALL_START_SPEED,
        angle: Math.PI / 4 * (1 + 2 * Math.floor(Math.random() * 4)),
        spin: 0,
        lastCollision: null
    },
    paddle1: {
        y: PLAY_FIELD_HEIGHT/2 - PADDLE_HEIGHT/2, 
        dir: 0, 
        score: 0 
    },
    paddle2: {
        y: PLAY_FIELD_HEIGHT/2 - PADDLE_HEIGHT/2, 
        dir: 0, 
        score: 0 
    },
    isGameOver: false,

    resetBall() {
        this.ball.x = PLAY_FIELD_WIDTH/2;
        this.ball.y = PLAY_FIELD_HEIGHT/2;
        this.ball.speed = BALL_START_SPEED;
        if (this.ball.lastCollision === null)
            this.ball.angle = Math.PI / 4 * (1 + 2 * Math.floor(Math.random() * 4));
        else if (this.ball.lastCollision === this.paddle1)
            this.ball.angle = Math.random() < 0.5 ? (5 * Math.PI) / 4 : (7 * Math.PI) / 4;
        else
            this.ball.angle = Math.random() < 0.5 ? Math.PI / 4 : (3 * Math.PI) / 4;
        this.ball.spin = 0;
        this.ball.lastCollision = null;
    },
    
    getGameState() {
        return {
            ball: {
                x: this.ball.x,
                y: this.ball.y
            },
            paddle1: {
                y: this.paddle1.y,
                score: this.paddle1.score
            },
            paddle2: {
                y: this.paddle2.y,
                score: this.paddle2.score
            }
        };
    },

    updatePaddle(paddle)
    {
        if (paddle.dir)
            paddle.y = Math.max(0, Math.min(PLAY_FIELD_HEIGHT - PADDLE_HEIGHT, paddle.y + paddle.dir * PADDLE_SPEED));
    },

    updateBall() {
        this.ball.x += Math.cos(this.ball.angle) * this.ball.speed;
        this.ball.y += Math.sin(this.ball.angle) * this.ball.speed;
        this.ball.angle += this.ball.spin;
        this.ball.spin *= 0.98; // Gradually reduce spin
    },

    ballHitsPaddles() {
        if (this.ball.x - BALL_RADIUS <= PADDLE_WIDTH && 
            this.ball.y >= this.paddle1.y && 
            this.ball.y <= this.paddle1.y + PADDLE_HEIGHT)
            return this.paddle1;
        else if (this.ball.x + BALL_RADIUS >= PLAY_FIELD_WIDTH - PADDLE_WIDTH &&
            this.ball.y >= this.paddle2.y &&
            this.ball.y <= this.paddle2.y + PADDLE_HEIGHT)
            return this.paddle2;
        else
            return false;
    },

    calculateNewAngle(paddle) {
        const hitPosition = (this.ball.y - paddle.y) / PADDLE_HEIGHT;
        const angleChange = (hitPosition - 0.5) * Math.PI / 4;
        let newAngle = Math.PI - this.ball.angle + angleChange;
    
        // Ensure newAngle is within [0, 2π]
        newAngle = newAngle % (2 * Math.PI);
        if (newAngle < 0) newAngle += 2 * Math.PI;
    
        const PI_4 = Math.PI / 4;  // 45 degrees
        const PI_3_4 = 3 * Math.PI / 4;  // 135 degrees
        const PI_5_4 = 5 * Math.PI / 4;  // 225 degrees
        const PI_7_4 = 7 * Math.PI / 4;  // 315 degrees
    
        if (newAngle < PI_4)
            return PI_4;
        else if (newAngle > PI_3_4 && newAngle < PI_5_4)
            return (newAngle < Math.PI) ? PI_3_4 : PI_5_4;
        else if (newAngle > PI_7_4)
            return PI_7_4;
        return newAngle;
    },
    
    checkCollisions() {
        // Top and bottom wall
        if (this.ball.y - BALL_RADIUS <= 0 || this.ball.y + BALL_RADIUS >= PLAY_FIELD_HEIGHT)
            this.ball.angle *= -1;

        // Paddles
        const paddle = this.ballHitsPaddles();
        if (paddle && this.ball.lastCollision != paddle) {
            this.ball.angle = this.calculateNewAngle(paddle);
            if (this.ball.speed < BALL_MAX_SPEED)
                this.ball.speed += BALL_ACCELERATION;
            this.ball.spin = paddle.dir * PADDLE_SPEED * 0.00075;
            this.ball.lastCollision = paddle; 
        }
    },

    checkWin() {
        if ((this.paddle1.score >= WINNING_SCORE && this.paddle1.score >= this.paddle2.score + SCORE_DIFFERENCE) 
            || (this.paddle2.score >= WINNING_SCORE && this.paddle2.score >= this.paddle1.score + SCORE_DIFFERENCE))
            this.isGameOver = true;
    },

    checkScoring() {
        const isLeftSideScore = this.ball.x - BALL_RADIUS <= 0;
        const isRightSideScore = this.ball.x + BALL_RADIUS >= PLAY_FIELD_WIDTH;

        if (isLeftSideScore || isRightSideScore) {
            if (isLeftSideScore)
                this.paddle2.score++;
            else
                this.paddle1.score++;
            this.resetBall();
            this.checkWin();
        }
    },

    update(gameLoop) {
        if (this.isGameOver)
            clearInterval(gameLoop);
        this.updatePaddle(this.paddle1);
        this.updatePaddle(this.paddle2);
        this.updateBall();
        this.checkCollisions();
        this.checkScoring();
    }
};

export default pongGame