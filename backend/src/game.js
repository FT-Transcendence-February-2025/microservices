const PLAY_FIELD_HEIGHT = 800;
const PLAY_FIELD_WIDTH = 1200;

const PADDLE_WIDTH = 20;
const PADDLE_HEIGHT = 100;
const PADDLE_SPEED = 5;

const BALL_SPEED = 5;
const BALL_RADIUS = 5;

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

    update() {
        // Update paddle1 position
        if (this.paddle1.dir > 0 && this.paddle1.y + PADDLE_SPEED <= PLAY_FIELD_HEIGHT - PADDLE_HEIGHT)
            this.paddle1.y += PADDLE_SPEED;
        else if (this.paddle1.dir < 0 && this.paddle1.y - PADDLE_SPEED >= 0)
            this.paddle1.y -= PADDLE_SPEED;

        // Update paddle2 position
        if (this.paddle2.dir > 0 && this.paddle2.y + PADDLE_SPEED <= PLAY_FIELD_HEIGHT - PADDLE_HEIGHT)
            this.paddle2.y += PADDLE_SPEED;
        else if (this.paddle2.dir < 0 && this.paddle2.y - PADDLE_SPEED >= 0)
            this.paddle2.y -= PADDLE_SPEED;

        // Update ball position
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        // Ball collision with top and bottom walls
        if (this.ball.y - BALL_RADIUS <= 0 || this.ball.y + BALL_RADIUS >= PLAY_FIELD_HEIGHT) {
            this.ball.dy *= -1;
        }

        // Ball collision with paddles
        if ((
            this.ball.x - BALL_RADIUS <= PADDLE_WIDTH &&
            this.ball.y >= this.paddle1.y &&
            this.ball.y <= this.paddle1.y + PADDLE_HEIGHT
        ) || (
            this.ball.x + BALL_RADIUS >= PLAY_FIELD_WIDTH - PADDLE_WIDTH &&
            this.ball.y >= this.paddle2.y &&
            this.ball.y <= this.paddle2.y + PADDLE_HEIGHT
        )) {
            this.ball.dx *= -1;
        }

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