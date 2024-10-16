var canvas = document.getElementById('game');
var context = canvas.getContext('2d');
var startScreen = document.getElementById('startScreen');
var settingsScreen = document.getElementById('settingsScreen');
var scoreDisplay1 = document.getElementById('score1'); // Score for Player 1
var scoreDisplay21 = document.getElementById('score21'); // Score for Player 1 in 2-player mode
var scoreDisplay22 = document.getElementById('score22'); // Score for Player 2
var gameOverScreen = document.getElementById('gameOverScreen');
var grid = 16;
var gameRunning = false;
var playerCount = 1;
const baseSpeed = 15;
const MAX_SPEED = 60;
var walls = document.getElementById('wallsSwitch').checked;


var snakes = [
  {
    x: 160,
    y: 160,
    dx: grid,
    dy: 0,
    cells: [],
    maxCells: 4,
    color: 'green',
    speed: baseSpeed,
    score: 0,
  },
  {
    x: 320,
    y: 320,
    dx: grid,
    dy: 0,
    cells: [],
    maxCells: 4,
    color: 'blue',
    speed: baseSpeed,
    score: 0,
  },
];

var apple = { x: 320, y: 320 };

function settings() {
  // Hide start screen and game canvas
  startScreen.style.display = 'none';
  gameOverScreen.style.display = 'none';
  canvas.style.display = 'none';

  // Show settings screen
  settingsScreen.style.display = 'flex';
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function resizeCanvas() {
  const size = Math.min(
    Math.floor((window.innerWidth - 140) / grid) * grid,
    Math.floor((window.innerHeight - 140) / grid) * grid
  );
  canvas.width = size;
  canvas.height = size;
  document.getElementById('canvasHeader1').style.width = `${size - 12}px`;
  document.getElementById('canvasHeader2').style.width = `${size - 12}px`;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function showElement() {
  // Show or hide headers and scores based on the number of players
  if (playerCount === 1) {
    document.getElementById('canvasHeader1').style.display = 'block'; // Show Player 1 header
    document.getElementById('canvasHeader2').style.display = 'none'; // Hide Player 2 header
    scoreDisplay1.parentElement.style.display = 'inline'; // Show Player 1 score
    scoreDisplay21.parentElement.style.display = 'none'; // Hide Player 1 score in 2-player mode
    scoreDisplay22.parentElement.style.display = 'none'; // Hide Player 2 score
  } else if (playerCount === 2) {
    document.getElementById('canvasHeader1').style.display = 'none'; // Hide Player 1 header
    document.getElementById('canvasHeader2').style.display = 'block'; // Show Player 2 header
    scoreDisplay1.parentElement.style.display = 'none'; // Hide Player 1 score
    scoreDisplay21.parentElement.style.display = 'inline'; // Show Player 1 score in 2-player mode
    scoreDisplay22.parentElement.style.display = 'inline'; // Show Player 2 score
  }
}

function startGame(players) {
  playerCount = players;
  resetGame();

  // Show or hide headers and scores based on the number of players
  showElement();

  // Ensure the header is visible
  canvas.style.display = 'block';
  settingsScreen.style.display = "none";
  startScreen.style.display = 'none';
  gameRunning = true;
  requestAnimationFrame(loop);
}

function resetGame() {
  snakes.forEach((snake, index) => {
    if (index < playerCount) {
      Object.assign(snake, {
        x: index === 0 ? 160 : 320,
        y: index === 0 ? 160 : 320,
        dx: grid,
        dy: 0,
        cells: [],
        maxCells: 4,
        speed: baseSpeed,
        score: 0,
      });
    } else {
      Object.assign(snake, {
        cells: [],
        maxCells: 0,
        score: 0,
        dx: 0,
        dy: 0,
        speed: 0,
      });
    }
  });
  spawnApple();
  gameRunning = false;
  canvas.style.display = 'none';
  settingsScreen.style.display = 'none'; // Fix here
  startScreen.style.display = 'flex';
  scoreDisplay1.textContent = 0; // Reset Player 1 score display
  scoreDisplay21.textContent = 0; // Reset Player 1 score display in 2-player mode
  scoreDisplay22.textContent = 0; // Reset Player 2 score display
  showElement();
}

function spawnApple() {
  let overlap;
  do {
    overlap = false;
    apple.x = getRandomInt(0, canvas.width / grid) * grid;
    apple.y = getRandomInt(0, canvas.height / grid) * grid;

    // Check if the apple spawns on any snake's body
    snakes.forEach(snake => {
      snake.cells.forEach(cell => {
        if (checkCollision(cell.x, cell.y, apple.x, apple.y)) {
          overlap = true; // Set overlap to true to re-spawn
        }
      });
    });
  } while (overlap); // Keep spawning until no overlap
}

function gameOver() {
  gameRunning = false;
  canvas.style.display = 'none';
  startScreen.style.display = 'none';
  settingsScreen.display = 'none';
  snakes.forEach(snake => (snake.score = 0));
  scoreDisplay1.textContent = snakes[0].score; // Reset Player 1 score
  scoreDisplay21.textContent = snakes[0].score; // Reset Player 1 score in 2-player mode
  scoreDisplay22.textContent = snakes[1].score; // Reset Player 2 score
  gameOverScreen.style.display = 'flex';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function restartGame() {
  resetGame();
  gameOverScreen.style.display = 'none';
  startScreen.style.display = 'flex';
  canvas.style.display = 'block';
}

function checkCollision(x1, y1, x2, y2) {
  return x1 === x2 && y1 === y2;
}

function updateSnake(snake) {
  snake.x += snake.dx;
  snake.y += snake.dy;

  // Check for wall collision
  if (walls) {
    // If walls are enabled, check for collisions with canvas borders
    if (snake.x < 0 || snake.x >= canvas.width || snake.y < 0 || snake.y >= canvas.height) {
      gameOver(); // End the game if the snake hits a wall
    }
  } else {
    // If walls are not enabled, allow wrapping around the canvas
    if (snake.x < 0) snake.x = canvas.width - grid;
    else if (snake.x >= canvas.width) snake.x = 0;
    if (snake.y < 0) snake.y = canvas.height - grid;
    else if (snake.y >= canvas.height) snake.y = 0;
  }

  snake.cells.unshift({ x: snake.x, y: snake.y });
  if (snake.cells.length > snake.maxCells) {
    snake.cells.pop();
  }
}

function drawSnake(snake) {
  context.fillStyle = snake.color;
  snake.cells.forEach(cell => {
    context.fillRect(cell.x, cell.y, grid - 1, grid - 1);
  });
}

function drawGrid() {
  context.strokeStyle = 'gray';
  for (var x = 0; x < canvas.width; x += grid) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }
  for (var y = 0; y < canvas.height; y += grid) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.stroke();
  }
}

function drawApple() {
  context.fillStyle = 'red';
  context.fillRect(apple.x, apple.y, grid - 1, grid - 1);
}

function loop(timestamp) {
  if (!gameRunning) return;

  context.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawApple();

  snakes.forEach((snake, index) => {
    if (index >= playerCount) return; // Skip inactive snakes

    const timeSinceLastRender = timestamp - (snake.lastRenderTime || 0);
    const speedInterval = 1000 / snake.speed;

    if (timeSinceLastRender >= speedInterval) {
      updateSnake(snake);
      snake.lastRenderTime = timestamp;
    }
    drawSnake(snake);

    // Check for collisions with the apple
    snake.cells.forEach((cell, i) => {
      if (checkCollision(cell.x, cell.y, apple.x, apple.y)) {
        snake.maxCells++;
        spawnApple();
        snake.score++;

        // Update score displays
        if (playerCount === 1) {
          scoreDisplay1.textContent = snakes[0].score; // Update Player 1 score
        } else {
          scoreDisplay21.textContent = snakes[0].score; // Update Player 1 score in 2-player mode
          scoreDisplay22.textContent = snakes[1].score; // Update Player 2 score
        }

        // Increase speed for the respective snake that ate the apple
        if (snake.speed < MAX_SPEED) {
          snake.speed = Math.min(MAX_SPEED, snake.speed + 0.5); // Control speed increment
        }
      }

      // Check for self-collision
      for (var j = i + 1; j < snake.cells.length; j++) {
        if (cell.x === snake.cells[j].x && cell.y === snake.cells[j].y) {
          gameOver();
        }
      }
    });
  });

  requestAnimationFrame(loop);
}
document.getElementById('wallsSwitch').addEventListener('change', function () {
  walls = this.checked; // Update walls based on whether the checkbox is checked
  console.log('Walls:', walls); // For debugging, to check the value
});

// Handle keyboard input
document.addEventListener('keydown', function (e) {
  // Prevent default behavior for arrow keys
  if ([37, 38, 39, 40].includes(e.which)) e.preventDefault();

  const player1Controls = { 37: [-grid, 0], 38: [0, -grid], 39: [grid, 0], 40: [0, grid] }; // Arrow keys
  const player2Controls = { 65: [-grid, 0], 87: [0, -grid], 68: [grid, 0], 83: [0, grid] }; // WASD for Player 2

  // Check for Player 1 controls (arrow keys or WASD)
  if (playerCount === 1) {
    if (e.which in player1Controls) {
      if (snakes[0].dx !== -player1Controls[e.which][0] || snakes[0].dy !== -player1Controls[e.which][1]) {
        snakes[0].dx = player1Controls[e.which][0];
        snakes[0].dy = player1Controls[e.which][1];
      }
    } else if (e.which in player2Controls) {
      if (snakes[0].dx !== -player2Controls[e.which][0] || snakes[0].dy !== -player2Controls[e.which][1]) {
        snakes[0].dx = player2Controls[e.which][0];
        snakes[0].dy = player2Controls[e.which][1];
      }
    }
  } else if (playerCount === 2) {
    // Handle Player 1 controls
    if (e.which in player1Controls) {
      if (snakes[0].dx !== -player1Controls[e.which][0] || snakes[0].dy !== -player1Controls[e.which][1]) {
        snakes[0].dx = player1Controls[e.which][0];
        snakes[0].dy = player1Controls[e.which][1];
      }
    }

    // Handle Player 2 controls
    if (e.which in player2Controls) {
      if (snakes[1].dx !== -player2Controls[e.which][0] || snakes[1].dy !== -player2Controls[e.which][1]) {
        snakes[1].dx = player2Controls[e.which][0];
        snakes[1].dy = player2Controls[e.which][1];
      }
    }
  }
});