class PongGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.startButton = document.getElementById('start-button');
        this.resetButton = document.getElementById('reset-button');
        this.playerScoreElement = document.getElementById('player-score');
        this.aiScoreElement = document.getElementById('ai-score');
        
        // Game state
        this.gameRunning = false;
        this.playerScore = 0;
        this.aiScore = 0;
        
        // Game objects
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 8,
            dx: 4,
            dy: 4,
            speed: 4
        };
        
        this.playerPaddle = {
            x: 20,
            y: this.canvas.height / 2 - 50,
            width: 10,
            height: 100,
            speed: 0
        };
        
        this.aiPaddle = {
            x: this.canvas.width - 30,
            y: this.canvas.height / 2 - 50,
            width: 10,
            height: 100,
            speed: 3
        };
        
        this.setupEventListeners();
        this.draw();
    }
    
    setupEventListeners() {
        // Mouse movement for player paddle
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.gameRunning) {
                const rect = this.canvas.getBoundingClientRect();
                const mouseY = e.clientY - rect.top;
                this.playerPaddle.y = mouseY - this.playerPaddle.height / 2;
                
                // Keep paddle within canvas bounds
                if (this.playerPaddle.y < 0) {
                    this.playerPaddle.y = 0;
                } else if (this.playerPaddle.y + this.playerPaddle.height > this.canvas.height) {
                    this.playerPaddle.y = this.canvas.height - this.playerPaddle.height;
                }
            }
        });
        
        // Start button
        this.startButton.addEventListener('click', () => {
            if (!this.gameRunning) {
                this.startGame();
            } else {
                this.pauseGame();
            }
        });
        
        // Reset button
        this.resetButton.addEventListener('click', () => {
            this.resetGame();
        });
    }
    
    startGame() {
        this.gameRunning = true;
        this.startButton.textContent = 'Pause Game';
        this.gameLoop();
    }
    
    pauseGame() {
        this.gameRunning = false;
        this.startButton.textContent = 'Start Game';
    }
    
    resetGame() {
        this.gameRunning = false;
        this.playerScore = 0;
        this.aiScore = 0;
        this.playerScoreElement.textContent = '0';
        this.aiScoreElement.textContent = '0';
        this.startButton.textContent = 'Start Game';
        
        // Reset ball position
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.dx = Math.random() > 0.5 ? 4 : -4;
        this.ball.dy = Math.random() > 0.5 ? 4 : -4;
        
        // Reset paddle positions
        this.playerPaddle.y = this.canvas.height / 2 - 50;
        this.aiPaddle.y = this.canvas.height / 2 - 50;
        
        this.draw();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // Update ball position
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        // Ball collision with top and bottom walls
        if (this.ball.y <= 0 || this.ball.y >= this.canvas.height) {
            this.ball.dy = -this.ball.dy;
        }
        
        // Ball collision with paddles
        this.checkPaddleCollision();
        
        // Ball out of bounds (scoring)
        if (this.ball.x <= 0) {
            this.aiScore++;
            this.aiScoreElement.textContent = this.aiScore;
            this.resetBall();
        } else if (this.ball.x >= this.canvas.width) {
            this.playerScore++;
            this.playerScoreElement.textContent = this.playerScore;
            this.resetBall();
        }
        
        // AI paddle movement
        this.updateAIPaddle();
    }
    
    checkPaddleCollision() {
        // Player paddle collision
        if (this.ball.x <= this.playerPaddle.x + this.playerPaddle.width &&
            this.ball.x >= this.playerPaddle.x &&
            this.ball.y >= this.playerPaddle.y &&
            this.ball.y <= this.playerPaddle.y + this.playerPaddle.height) {
            
            this.ball.dx = Math.abs(this.ball.dx);
            this.adjustBallAngle(this.playerPaddle);
        }
        
        // AI paddle collision
        if (this.ball.x >= this.aiPaddle.x - this.ball.radius &&
            this.ball.x <= this.aiPaddle.x + this.aiPaddle.width &&
            this.ball.y >= this.aiPaddle.y &&
            this.ball.y <= this.aiPaddle.y + this.aiPaddle.height) {
            
            this.ball.dx = -Math.abs(this.ball.dx);
            this.adjustBallAngle(this.aiPaddle);
        }
    }
    
    adjustBallAngle(paddle) {
        // Calculate where the ball hit the paddle (0 = top, 1 = bottom)
        const hitPosition = (this.ball.y - paddle.y) / paddle.height;
        
        // Adjust the ball's vertical direction based on where it hit the paddle
        const angle = (hitPosition - 0.5) * 2; // -1 to 1
        this.ball.dy = angle * this.ball.speed;
        
        // Ensure minimum speed
        if (Math.abs(this.ball.dy) < 2) {
            this.ball.dy = this.ball.dy > 0 ? 2 : -2;
        }
    }
    
    updateAIPaddle() {
        const paddleCenter = this.aiPaddle.y + this.aiPaddle.height / 2;
        const ballCenter = this.ball.y;
        
        // Simple AI: move towards the ball
        if (paddleCenter < ballCenter - 10) {
            this.aiPaddle.y += this.aiPaddle.speed;
        } else if (paddleCenter > ballCenter + 10) {
            this.aiPaddle.y -= this.aiPaddle.speed;
        }
        
        // Keep AI paddle within bounds
        if (this.aiPaddle.y < 0) {
            this.aiPaddle.y = 0;
        } else if (this.aiPaddle.y + this.aiPaddle.height > this.canvas.height) {
            this.aiPaddle.y = this.canvas.height - this.aiPaddle.height;
        }
    }
    
    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        
        // Random direction
        this.ball.dx = Math.random() > 0.5 ? 4 : -4;
        this.ball.dy = Math.random() > 0.5 ? 4 : -4;
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw center line
        this.ctx.strokeStyle = '#fff';
        this.ctx.setLineDash([5, 15]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw ball
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw player paddle
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(
            this.playerPaddle.x,
            this.playerPaddle.y,
            this.playerPaddle.width,
            this.playerPaddle.height
        );
        
        // Draw AI paddle
        this.ctx.fillStyle = '#f44336';
        this.ctx.fillRect(
            this.aiPaddle.x,
            this.aiPaddle.y,
            this.aiPaddle.width,
            this.aiPaddle.height
        );
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PongGame();
}); 