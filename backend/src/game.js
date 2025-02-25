const PLAY_FIELD_HEIGHT = 1080;
const PLAY_FIELD_WIDTH = 1920;

const PADDLE_WIDTH = 30;
const PADDLE_HEIGHT = 180;
const PADDLE_SPEED = 15;

const BALL_START_SPEED = 8;
const BALL_ACCELERATION = 2;
const BALL_MAX_SPEED = 20;
const BALL_RADIUS = 15;

export const PongGame = {
    ball: {
        x: PLAY_FIELD_WIDTH/2,
        y: PLAY_FIELD_HEIGHT/2,
        speed: BALL_START_SPEED,
        angle: Math.PI / 4,
        spin: 0, 
    },
    paddle1: {
        y: PLAY_FIELD_HEIGHT/2 - PADDLE_HEIGHT/2, 
        dir: 'none', 
        score: 0 
    },
    paddle2: {
        y: PLAY_FIELD_HEIGHT/2 - PADDLE_HEIGHT/2, 
        dir: 'none', 
        score: 0 
    },
    lastCollision: null,

    resetBall(ball, dir) {
        ball.x = PLAY_FIELD_WIDTH/2;
        ball.y = PLAY_FIELD_HEIGHT/2;
        ball.speed = BALL_START_SPEED;
        if (this.lastCollision === null) {
            const angles = [Math.PI / 4, -Math.PI / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
            const randomIndex = Math.floor(Math.random() * angles.length);
            ball.angle = angles[randomIndex];
        }
        else if (this.lastCollision === this.paddle1)
            ball.angle = Math.random() > 0.5 ? Math.PI / 4 : -Math.PI / 4;
        else
            ball.angle = Math.random() > 0.5 ? (5 * Math.PI) / 4 : (7 * Math.PI) / 4;
        ball.spin = 0;
        this.lastCollision = null;
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

    updateBall(ball) {
        ball.x += Math.cos(ball.angle) * ball.speed;
        ball.y += Math.sin(ball.angle) * ball.speed;
        ball.angle += ball.spin;
        ball.spin *= 0.98; // Gradually reduce spin
    },

    ballHitsPaddles(ball, paddle1, paddle2) {
        if (ball.x - BALL_RADIUS <= PADDLE_WIDTH && 
            ball.y >= paddle1.y && 
            ball.y <= paddle1.y + PADDLE_HEIGHT)
            return true;
        else if (ball.x + BALL_RADIUS >= PLAY_FIELD_WIDTH - PADDLE_WIDTH &&
            ball.y >= paddle2.y &&
            ball.y <= paddle2.y + PADDLE_HEIGHT)
            return true;
        else
            return false;
    },

    checkCollisions(ball, paddle1, paddle2) {
        // Top and bottom walls
        if (ball.y - BALL_RADIUS <= 0 || ball.y + BALL_RADIUS >= PLAY_FIELD_HEIGHT)
            ball.angle = -ball.angle;

        // Paddles
        if (this.ballHitsPaddles(ball, paddle1, paddle2)) {
            const paddle = ball.x < PLAY_FIELD_WIDTH / 2 ? paddle1 : paddle2;
            if (this.lastCollision != paddle) {
                const hitPosition = (ball.y - paddle.y) / PADDLE_HEIGHT;
                const angleChange = (hitPosition - 0.5) * Math.PI / 4;
                const paddleSpeed = paddle.dir === 'up' ? -PADDLE_SPEED : paddle.dir === 'down' ? PADDLE_SPEED : 0;
                if (ball.speed < BALL_MAX_SPEED)
                    ball.speed += BALL_ACCELERATION;
                
                // Calculate the new angle
                let newAngle = Math.PI - ball.angle + angleChange;
                
                // Convert to degrees for easier comparison
                let angleDegrees = (newAngle * 180 / Math.PI) % 360;
                if (angleDegrees < 0) angleDegrees += 360;
                
                // Constrain the angle
                if (angleDegrees < 45 || (angleDegrees > 135 && angleDegrees < 225) || angleDegrees > 315) {
                    // If the angle is out of the allowed ranges, set it to the nearest allowed angle
                    if (angleDegrees < 45 || angleDegrees > 315) {
                        newAngle = (angleDegrees < 45 ? 45 : 330) * Math.PI / 180;
                    } else {
                        newAngle = (angleDegrees < 180 ? 135 : 225) * Math.PI / 180;
                    }
                }
                ball.angle = newAngle;
                ball.spin = paddleSpeed * 0.001;
                this.lastCollision = paddle;
            }
        }

        // Scoring
        if (ball.x -BALL_RADIUS <= 0) {
            paddle2.score++;
            this.resetBall(ball, 'right');
        } 
        else if (ball.x + BALL_RADIUS >= PLAY_FIELD_WIDTH) {
            paddle1.score++;
            this.resetBall(ball, 'left');
        }
    },

    update() {
        this.updatePaddle(this.paddle1);
        this.updatePaddle(this.paddle2);
        this.updateBall(this.ball);
        this.checkCollisions(this.ball, this.paddle1, this.paddle2);
    }
};