const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let shootSound = document.getElementById("shootSound");
let hitSound = document.getElementById("hitSound");

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
let difficulty = 1;

document.addEventListener("keydown", e => {
  if (gameOver && e.key === "r") restartGame();

  if (!gameOver) {
    if (e.key === "ArrowUp") player.y -= player.speed;
    if (e.key === "ArrowDown") player.y += player.speed;
    if (e.key === " ") {
      shootSound.currentTime = 0;
      shootSound.play();
      bullets.push({
        x: player.x + player.width,
        y: player.y + player.height / 2 - 5,
        width: 10,
        height: 5,
        color: "red",
        speed: 8
      });
    }
  }
});

function spawnEnemy() {
  if (!gameOver) {
    const y = Math.random() * (canvas.height - 40);
    const type = Math.random() < 0.7 ? "normal" : "fast";
    const speed = type === "normal" ? 3 + difficulty : 6 + difficulty;
    enemies.push({
      x: canvas.width,
      y,
      width: 40,
      height: 40,
      color: type === "fast" ? "crimson" : "orange",
      speed,
      type
    });
  }
}

function update() {
  bullets.forEach(b => b.x += b.speed);
  enemies.forEach(e => e.x -= e.speed);

  bullets = bullets.filter(b => b.x < canvas.width);
  enemies = enemies.filter(e => e.x + e.width > 0 && !e.hit);

  // Столкновение пули и врага
  for (let b of bullets) {
    for (let e of enemies) {
      if (collision(b, e)) {
        e.hit = true;
        b.hit = true;
        score += e.type === "fast" ? 2 : 1;
        hitSound.currentTime = 0;
        hitSound.play();
        if (score % 10 === 0) difficulty++;
      }
    }
  }

  bullets = bullets.filter(b => !b.hit);

  // Столкновение игрока и врага
  for (let e of enemies) {
    if (collision(player, e)) {
      e.hit = true;
      player.health--;
      hitSound.currentTime = 0;
      hitSound.play();
      if (player.health <= 0) {
        gameOver = true;
      }
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Игрок
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Пули
  bullets.forEach(b => {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.width, b.height);
  });

  // Враги
  enemies.forEach(e => {
    ctx.fillStyle = e.color;
    ctx.fillRect(e.x, e.y, e.width, e.height);
  });

  // UI
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Очки: ${score}`, 10, 25);
  ctx.fillText(`Здоровье: ${player.health}`, 10, 50);
  ctx.fillText(`Сложность: ${difficulty}`, 10, 75);

  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "40px Arial";
    ctx.fillText("Игра окончена", canvas.width / 2 - 140, canvas.height / 2);
    ctx.font = "20px Arial";
    ctx.fillText("Нажми R, чтобы перезапустить", canvas.width / 2 - 130, canvas.height / 2 + 40);
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
  difficulty = 1;
  player.health = 3;
  gameOver = false;
}

setInterval(spawnEnemy, 1200);
gameLoop();
