// Matrix background animation
const matrixCanvas = document.getElementById('matrix');
const matrixCtx = matrixCanvas.getContext('2d');

// Bouncing balls canvas
const bouncingCanvas = document.getElementById('bouncingCanvas');
const bouncingCtx = bouncingCanvas.getContext('2d');

// Control buttons
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');

// Animation state
let isAnimating = false;
let animationId = null;

// Set canvas sizes
function resizeCanvas() {
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    
    // Set bouncing canvas size
    bouncingCanvas.width = 600;
    bouncingCanvas.height = 400;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Matrix characters
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
const fontSize = 14;
const columns = matrixCanvas.width / fontSize;
const drops = [];

// Initialize drops
for (let i = 0; i < columns; i++) {
    drops[i] = 1;
}

// Draw Matrix rain
function drawMatrix() {
    matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

    matrixCtx.fillStyle = '#0F0';
    matrixCtx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        matrixCtx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

// Ball class for bouncing animation
class Ball {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.dx = (Math.random() - 0.5) * 4;
        this.dy = (Math.random() - 0.5) * 4;
        this.mass = radius; // Mass proportional to radius
    }

    draw() {
        bouncingCtx.beginPath();
        bouncingCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        bouncingCtx.fillStyle = this.color;
        bouncingCtx.fill();
        bouncingCtx.strokeStyle = '#0f0';
        bouncingCtx.lineWidth = 2;
        bouncingCtx.stroke();
        bouncingCtx.closePath();
    }

    update(balls) {
        // Bounce off walls
        if (this.x + this.radius > bouncingCanvas.width || this.x - this.radius < 0) {
            this.dx = -this.dx;
        }
        if (this.y + this.radius > bouncingCanvas.height || this.y - this.radius < 0) {
            this.dy = -this.dy;
        }

        // Check collision with other balls
        for (let ball of balls) {
            if (ball === this) continue;

            // Calculate distance between balls
            const dx = ball.x - this.x;
            const dy = ball.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Check if balls are colliding
            if (distance < this.radius + ball.radius) {
                // Collision resolution
                const normalX = dx / distance;
                const normalY = dy / distance;

                // Relative velocity
                const relativeVelocityX = this.dx - ball.dx;
                const relativeVelocityY = this.dy - ball.dy;

                // Calculate impulse
                const speed = relativeVelocityX * normalX + relativeVelocityY * normalY;
                if (speed < 0) continue; // Balls are moving apart

                const impulse = 2 * speed / (this.mass + ball.mass);

                // Update velocities
                this.dx -= impulse * ball.mass * normalX;
                this.dy -= impulse * ball.mass * normalY;
                ball.dx += impulse * this.mass * normalX;
                ball.dy += impulse * this.mass * normalY;

                // Move balls apart to prevent sticking
                const overlap = (this.radius + ball.radius - distance) / 2;
                this.x -= overlap * normalX;
                this.y -= overlap * normalY;
                ball.x += overlap * normalX;
                ball.y += overlap * normalY;
            }
        }

        // Update position
        this.x += this.dx;
        this.y += this.dy;

        this.draw();
    }
}

// Create balls
const balls = [];
const colors = ['#ff0', '#0f0', '#f0f', '#0ff', '#f00'];
for (let i = 0; i < 10; i++) {
    const radius = 15;
    const x = Math.random() * (bouncingCanvas.width - radius * 2) + radius;
    const y = Math.random() * (bouncingCanvas.height - radius * 2) + radius;
    const color = colors[Math.floor(Math.random() * colors.length)];
    balls.push(new Ball(x, y, radius, color));
}

// Animation loop
function animate() {
    if (!isAnimating) return;
    
    // Clear bouncing canvas
    bouncingCtx.clearRect(0, 0, bouncingCanvas.width, bouncingCanvas.height);
    
    // Update and draw balls
    balls.forEach(ball => ball.update(balls));
    
    // Draw matrix background
    drawMatrix();
    
    animationId = requestAnimationFrame(animate);
}

// Control button event listeners
startBtn.addEventListener('click', () => {
    if (!isAnimating) {
        isAnimating = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        animate();
    }
});

pauseBtn.addEventListener('click', () => {
    if (isAnimating) {
        isAnimating = false;
        cancelAnimationFrame(animationId);
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }
});

// Add hover effects to menu items
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('mouseover', () => {
        const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
        audio.volume = 0.1;
        audio.play().catch(() => {});
    });
});

// Add cursor trail effect
const cursor = document.createElement('div');
cursor.style.cssText = `
    position: fixed;
    width: 20px;
    height: 20px;
    background: #0f0;
    border-radius: 50%;
    pointer-events: none;
    mix-blend-mode: screen;
    transition: transform 0.1s;
    z-index: 9999;
`;
document.body.appendChild(cursor);

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX - 10 + 'px';
    cursor.style.top = e.clientY - 10 + 'px';
    cursor.style.transform = 'scale(1.5)';
    setTimeout(() => {
        cursor.style.transform = 'scale(1)';
    }, 100);
}); 