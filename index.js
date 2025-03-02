
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const launcherRadius = 30;
const bulletSpeed = 8;
const enemySpeed = 1.5;
const enemySpawnRate = 1000;
let enemies = [];
let bullets = [];
let angle = 0;
let gameOver = false;
let score = 0;

// Track mouse movement
canvas.addEventListener("mousemove", (event) => {
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    angle = Math.atan2(dy, dx);
});

// Shoot on click
canvas.addEventListener("click", () => {
    if (!gameOver) {
        bullets.push({
            x: centerX,
            y: centerY,
            dx: Math.cos(angle) * bulletSpeed,
            dy: Math.sin(angle) * bulletSpeed,
            radius: 5
        });
    }
});

// Spawn random enemies
setInterval(() => {
    if (!gameOver) {
        const side = Math.floor(Math.random() * 4);
        let x, y;

        if (side === 0) { // Top
            x = Math.random() * canvas.width;
            y = 0;
        } else if (side === 1) { // Bottom
            x = Math.random() * canvas.width;
            y = canvas.height;
        } else if (side === 2) { // Left
            x = 0;
            y = Math.random() * canvas.height;
        } else { // Right
            x = canvas.width;
            y = Math.random() * canvas.height;
        }

        const randomSize = Math.random() * 15 + 10; // Between 10 and 25
        const randomColor = `hsl(${Math.random() * 360}, 100%, 50%)`;

        enemies.push({ x, y, radius: randomSize, color: randomColor });
    }
}, enemySpawnRate);

// Game loop
function update() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw and update bullets
    bullets = bullets.filter(bullet => {
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fill();

        return bullet.x > 0 && bullet.x < canvas.width && bullet.y > 0 && bullet.y < canvas.height;
    });

    // Draw and update enemies
    enemies = enemies.filter((enemy, index) => {
        const dx = centerX - enemy.x;
        const dy = centerY - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        enemy.x += (dx / dist) * enemySpeed;
        enemy.y += (dy / dist) * enemySpeed;

        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fill();

        // Collision with launcher (Game Over)
        if (dist < launcherRadius + enemy.radius) {
            gameOver = true;
            alert(`Game Over! Final Score: ${score}`);
            return false; // Remove enemy on collision
        }

        return true;
    });

    // Bullet and enemy collision detection
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            const dx = bullet.x - enemy.x;
            const dy = bullet.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < bullet.radius + enemy.radius) {
                // Remove bullet & enemy on collision
                bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);
                score += 5; // Increase score
            }
        });
    });

    // Draw launcher
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(centerX, centerY, launcherRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw ray trace
    ctx.strokeStyle = "white";
    ctx.setLineDash([5, 10]); // Dotted line
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(angle) * 100, centerY + Math.sin(angle) * 100);
    ctx.stroke();
    ctx.setLineDash([]); // Reset to solid line

    // Display Score
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText(`Score: ${score}`, 20, 40);

    requestAnimationFrame(update);
}

update();
