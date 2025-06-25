const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Адаптивный размер канваса
function resizeCanvas() {
  canvas.width = window.innerWidth * 0.95;
  canvas.height = window.innerHeight * 0.6;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let player = {
  x: 50,
  y: canvas.height / 2 - 25,
  width: 40,
  height: 40,
  color: "lime",
  speed: 5,
  health: 3
};

let bullets = [];
let enemies = [];
let score = 0;
let gameOver = false;

// Управление через кнопки
document.getElementById("upBtn").addEventListener("touchstart", () => {
  player.y -= player.speed;
});
document.getElementById("downBtn").addEventListener("touchstart", () => {
  player.y += player.speed;
});
document.getElementById("shootBtn").addEventListener("touchstart", () => {
  shoot();
});

// Клавиши для ПК
document.addEventListener("keydown", e => {
  if (gameOver && e.key === "r") restartGame();

  if (!gameOver) {
    if (e.key === "ArrowUp") player.y -= player.speed;
    if (e.key === "ArrowDown") player.y += player.speed;
    if (e.key === " ") shoot();
  }
});

function shoot() {
  bullets.push({
    x: player.x + player.width,
    y: player.y + player.height / 2 - 5,
    width: 10,
    height: 5,
    color: "red",
    speed: 8
  });
}

function spawnEnemy() {
  if (!gameOver) {
    let y = Math.random() * (canvas.height - 40);
    enemies.push({
      x: canvas.width,
      y,
      width: 40,
      height: 40,
      color: "orange",
      speed: 3
    });
  }
}

function update() {
  bullets.forEach(b => b.x += b.speed);
  enemies.forEach(e => e.x -= e.speed);

  bullets = bullets.filter(b => b.x < canvas.width);
  enemies = enemies.filter(e => e.x + e.width > 0 && !e.hit);

  for (let b of bullets) {
    for (let e of enemies) {
      if (collision(b, e)) {
        e.hit = true;
        b.hit = true;
        score++;
      }
    }
  }

  bullets = bullets.filter(b => !b.hit);

  for (let e of enemies) {
    if (collision(player, e)) {
      e.hit = true;
      player.health--;
      if (player.health <= 0) gameOver = true;
    }
  }

  // Ограничение игрока внутри экрана
  if (player.y < 0) player.y = 0;
  if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  bullets.forEach(b => {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.width, b.height);
  });

  enemies.forEach(e => {
    ctx.fillStyle = e.color;
    ctx.fillRect(e.x, e.y, e.width, e.height);
  });

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Очки: " + score, 10, 20);
  ctx.fillText("Здоровье: " + player.health, 10, 45);

  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "40px Arial";
    ctx.fillText("Игра окончена", canvas.width / 2 - 130, canvas.height / 2);
    ctx.font = "20px Arial";
    ctx.fillText("Нажми R для перезапуска", canvas.width / 2 - 110, canvas.height / 2 + 40);
  }
}

function gameLoop() {
  if (!gameOver) update();
  draw();
  requestAnimationFrame(gameLoop);
}

function collision(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

function restartGame() {
  bullets = [];
  enemies = [];
  score = 0;
  player.health = 3;
  gameOver = false;
}

setInterval(spawnEnemy, 1500);
gameLoop();
