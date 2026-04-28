const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const overlayContent = document.getElementById("overlayContent");
const currentScoreEl = document.getElementById("currentScore");
const highScoreEl = document.getElementById("highScore");

const box = 20;
const COLS = canvas.width / box;
const ROWS = canvas.height / box;
let score = 0;
let highScore = parseInt(localStorage.getItem("snakeHighScore") || "0");
highScoreEl.textContent = highScore;

let snake = [
    { x: 200, y: 200 },
    { x: 180, y: 200 },
    { x: 160, y: 200 },
    { x: 140, y: 200 }
];

let direction = null;
let lastDirection = null;
let gameStarted = false;
let gameOver = false;

let lastTime = 0;
const speed = 180;

const fruitsList = ["🍎", "🍌", "🍇", "🍓", "🍊"];
let fruits = [];
fruits = generateFruits(3);

// Generates `count` fruits that don't overlap the snake or already-placed fruits.
// Must be called AFTER the snake array reflects its current state for the tick.
function generateFruits(count) {
    const occupied = new Set();
    snake.forEach(s => occupied.add(s.x + "," + s.y));
    fruits.forEach(f => occupied.add(f.x + "," + f.y));

    const arr = [];
    let attempts = 0;
    while (arr.length < count && attempts < 1000) {
    attempts++;
    const x = Math.floor(Math.random() * COLS) * box;
    const y = Math.floor(Math.random() * ROWS) * box;
    const key = x + "," + y;
    if (!occupied.has(key)) {
        occupied.add(key);
        arr.push({ x, y, emoji: fruitsList[Math.floor(Math.random() * fruitsList.length)] });
    }
    }
    return arr;
}

function saveHighScore() {
    if (score > highScore) {
    highScore = score;
    localStorage.setItem("snakeHighScore", highScore);
    highScoreEl.textContent = highScore;
    }
}

document.addEventListener("keydown", changeDirection);

function changeDirection(event) {
    if (gameOver) return;

    if (!gameStarted && ["ArrowLeft","ArrowUp","ArrowRight","ArrowDown"].includes(event.key)) {
    gameStarted = true;
    overlay.classList.add("hidden");
    }

    if      (event.key === "ArrowLeft"  && lastDirection !== "RIGHT") direction = "LEFT";
    else if (event.key === "ArrowUp"    && lastDirection !== "DOWN")  direction = "UP";
    else if (event.key === "ArrowRight" && lastDirection !== "LEFT")  direction = "RIGHT";
    else if (event.key === "ArrowDown"  && lastDirection !== "UP")    direction = "DOWN";
}

function gameLoop(time) {
    if (gameOver) return;

    if (gameStarted && time - lastTime > speed) {
    update();
    lastTime = time;
    }

    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    let headX = snake[0].x;
    let headY = snake[0].y;

    if (direction === "LEFT")  headX -= box;
    if (direction === "UP")    headY -= box;
    if (direction === "RIGHT") headX += box;
    if (direction === "DOWN")  headY += box;

    lastDirection = direction;
    const newHead = { x: headX, y: headY };

    // Wall + self-collision check before mutating snake
    if (
    headX < 0 || headY < 0 ||
    headX >= canvas.width || headY >= canvas.height ||
    collision(newHead, snake)
    ) {
    triggerGameOver();
    return;
    }

    let ateFruit = false;
    fruits = fruits.filter(fruit => {
    if (fruit.x === headX && fruit.y === headY) {
        ateFruit = true;
        return false;
    }
    return true;
    });

    // Commit the move: add new head, remove tail only if didn't eat
    snake.unshift(newHead);
    if (!ateFruit) {
    snake.pop();
    } else {
    // Snake is now fully grown — generate replacement fruit with accurate occupied cells
    score++;
    currentScoreEl.textContent = score;
    saveHighScore();
    fruits = fruits.concat(generateFruits(1));
    }
}

function triggerGameOver() {
    gameOver = true;
    saveHighScore();
    draw();
    const isNewBest = score > 0 && score >= highScore;
    overlayContent.innerHTML = `
    <h2>Game Over!</h2>
    <p>${isNewBest ? "🏆 New high score!" : "Your score"}</p>
    <span class="final-score">${score}</span>
    ${highScore > 0 && !isNewBest ? `<p style="font-size:13px;color:#888;margin:-10px 0 16px;">Best: ${highScore}</p>` : ""}
    <button onclick="restartGame()">Play Again</button>
    `;
    overlay.classList.remove("hidden");
}

function restartGame() {
    snake = [
    { x: 200, y: 200 },
    { x: 180, y: 200 },
    { x: 160, y: 200 },
    { x: 140, y: 200 }
    ];
    direction = null;
    lastDirection = null;
    gameStarted = false;
    gameOver = false;
    score = 0;
    currentScoreEl.textContent = "0";
    fruits = generateFruits(3);

    overlayContent.innerHTML = `
    <h2>🐍 Snake</h2>
    <p>Press an arrow key to start</p>
    <p class="hint">Eat fruit to grow. Don't hit the walls or yourself!</p>
    `;
    overlay.classList.remove("hidden");

    lastTime = 0;
    requestAnimationFrame(gameLoop);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? "lime" : "green";
    ctx.beginPath();
    ctx.roundRect(segment.x, segment.y, box, box, 6);
    ctx.fill();
    });

    ctx.font = "20px Arial";
    fruits.forEach(fruit => {
    ctx.fillText(fruit.emoji, fruit.x + 2, fruit.y + 18);
    });
}

function collision(item, array) {
    return array.some(el => el.x === item.x && el.y === item.y);
}

requestAnimationFrame(gameLoop);
