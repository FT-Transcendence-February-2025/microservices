const PLAY_FIELD_HEIGHT = 1080;
const PLAY_FIELD_WIDTH = 1920;

const PADDLE_WIDTH = 27;
const PADDLE_HEIGHT = 162;
const PADDLE_SPEED = 8;

const BALL_SPEED = 7;
const BALL_RADIUS = 10;

export const PongGame = {
    ball: { x: PLAY_FIELD_WIDTH/2, y: PLAY_FIELD_HEIGHT/2, dx: BALL_SPEED, dy: BALL_SPEED},
    paddle1: { y: PLAY_FIELD_HEIGHT/2 - PADDLE_HEIGHT/2, dir: 0, score: 0 },
    paddle2: { y: PLAY_FIELD_HEIGHT/2 - PADDLE_HEIGHT/2, dir: 0, score: 0 },

    resetBall() {
        this.ball.x = PLAY_FIELD_WIDTH/2;
        this.ball.y = PLAY_FIELD_HEIGHT/2;
    },
    
    getGameState() {
        return {
            ball: this.ball,
            paddle1: this.paddle1,
            paddle2: this.paddle2
        };
    },

    updatePaddle(paddle)
    {
        if (paddle.dir === 'down')
        {
            if (paddle.y + PADDLE_HEIGHT + PADDLE_SPEED > PLAY_FIELD_HEIGHT)
                paddle.y = PLAY_FIELD_HEIGHT - PADDLE_HEIGHT;
            else
                paddle.y += PADDLE_SPEED;
        }
        else if (paddle.dir === 'up')
        {
            if (paddle.y - PADDLE_SPEED < 0)
                paddle.y = 0;
            else
                paddle.y -= PADDLE_SPEED;
        }
    },

    update() {
        // Update paddles
        this.updatePaddle(this.paddle1);
        this.updatePaddle(this.paddle2);

        // Update ball position
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        // Ball collision with top and bottom walls
        if (this.ball.y - BALL_RADIUS <= 0 || this.ball.y + BALL_RADIUS >= PLAY_FIELD_HEIGHT)
            this.ball.dy *= -1;

        // Ball collision with paddles
        if (this.ball.x - BALL_RADIUS <= PADDLE_WIDTH && 
            this.ball.y >= this.paddle1.y && 
            this.ball.y <= this.paddle1.y + PADDLE_HEIGHT)
            this.ball.dx = BALL_SPEED;
        else if (this.ball.x + BALL_RADIUS >= PLAY_FIELD_WIDTH - PADDLE_WIDTH &&
            this.ball.y >= this.paddle2.y &&
            this.ball.y <= this.paddle2.y + PADDLE_HEIGHT)
            this.ball.dx = -BALL_RADIUS;

        // Ball out of bonds
        if (this.ball.x  - BALL_RADIUS <= 0) {
            this.paddle2.score++;
            this.resetBall();
        }
        else if (this.ball.x + BALL_RADIUS >= PLAY_FIELD_WIDTH) {
            this.paddle1.score++;
            this.resetBall();
        }
    }
};