var canvas = document.getElementById('game');
var context = canvas.getContext('2d');
var startScreen = document.getElementById('startScreen');
var player1ScoreDisplay = document.getElementById('player1Score');
var player2ScoreDisplay = document.getElementById('player2Score');
var highScoreDisplay = document.getElementById('highScore');

var grid = 16;
var gameRunning = false;
var playerCount = 1;  // Default to 1 player
var highScore = 0; // Store the highest score
const defaultSpeed = 5; // Initial speed (lower is faster)

// Player 1 snake
var snake1 = {
  x: 160,
  y: 160,
  dx: grid,
  dy: 0,
  cells: [],
  maxCells: 4,
  color: 'green',
  speed: defaultSpeed,
  applesEaten: 0,
  count: 0
};

// Player 2 snake
var snake2 = {
  x: 320,
  y: 320,
  dx: grid,
  dy: 0,
  cells: [],
  maxCells: 4,
  color: 'blue',
  speed: defaultSpeed,
  applesEaten: 0,
  count: 0
};

// Player scores
var player1Score = 0;
var player2Score = 0;

var apple = { x: 320, y: 320 };

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// Resize canvas to ensure even dimensions
function resizeCanvas() {
  const size = Math.min(
    Math.floor((window.innerWidth - 140) / grid) * grid,
    Math.floor((window.innerHeight - 140) / grid) * grid
  );
  canvas.width = size;
  canvas.height = size;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Start the game with 1 or 2 players
function startGame(players) {
  playerCount = players;  // Set the player count
  resetGame();
  startScreen.style.display = 'none';
  canvas.style.display = 'block';
  gameRunning = true;
  requestAnimationFrame(loop);
}

function resetGame() {
  Object.assign(snake1, { x: 160, y: 160, dx: grid, dy: 0, cells: [], maxCells: 4, speed: defaultSpeed, applesEaten: 0, count: 0 });
  Object.assign(snake2, { x: 320, y: 320, dx: grid, dy: 0, cells: [], maxCells: 4, speed: defaultSpeed, applesEaten: 0, count: 0 });
  apple.x = getRandomInt(0, canvas.width / grid) * grid;
  apple.y = getRandomInt(0, canvas.height / grid) * grid;
}

function gameOver() {
  gameRunning = false;
  canvas.style.display = 'none';
  startScreen.style.display = 'none';
  document.getElementById('gameOverScreen').style.display = 'flex'; // Show Game Over screen
  window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll back to the top  
}

function restartGame() {
  resetGame();
  document.getElementById('gameOverScreen').style.display = 'none'; // Hide Game Over screen
  startScreen.style.display = 'none'; // Ensure the start screen stays hidden
  canvas.style.display = 'block'; // Show the game canvas
  gameRunning = true;
  requestAnimationFrame(loop); // Restart the game loop
}

function checkCollision(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) < grid && Math.abs(y1 - y2) < grid;
}

function updateSnake(snake) {
  snake.x += snake.dx;
  snake.y += snake.dy;

  if (snake.x < 0) snake.x = canvas.width - grid;
  else if (snake.x >= canvas.width) snake.x = 0;

  if (snake.y < 0) snake.y = canvas.height - grid;
  else if (snake.y >= canvas.height) snake.y = 0;

  snake.cells.unshift({ x: snake.x, y: snake.y });

  if (snake.cells.length > snake.maxCells) snake.cells.pop();
}

function drawSnake(snake) {
  context.fillStyle = snake.color;
  snake.cells.forEach(function (cell) {
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

function loop() {
  if (!gameRunning) return;

  requestAnimationFrame(loop);

  context.clearRect(0, 0, canvas.width, canvas.height);

  drawGrid(); // Draw the grid

  // Update and draw Player 1 snake
  if (++snake1.count >= snake1.speed) {
    snake1.count = 0;
    updateSnake(snake1);
  }
  drawSnake(snake1);

  // Update and draw Player 2 snake if in 2-player mode
  if (playerCount === 2) {
    if (++snake2.count >= snake2.speed) {
      snake2.count = 0;
      updateSnake(snake2);
    }
    drawSnake(snake2);
  }

  context.fillStyle = 'red';
  context.fillRect(apple.x, apple.y, grid - 1, grid - 1);

  [snake1, playerCount === 2 ? snake2 : null].forEach(function (snake) {
    if (!snake) return;
    snake.cells.forEach(function (cell, index) {
      if (checkCollision(cell.x, cell.y, apple.x, apple.y)) {
        snake.maxCells++;
        apple.x = getRandomInt(0, canvas.width / grid) * grid;
        apple.y = getRandomInt(0, canvas.height / grid) * grid;
        snake.applesEaten++;

        // Increase speed based on apples eaten
        if (snake.applesEaten % 5 === 0 && snake.speed > 1) {
          snake.speed -= 0.5; // Decrease the interval to make the snake faster
        }
      }

      for (var i = index + 1; i < snake.cells.length; i++) {
        if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
          gameOver();
        }
      }
    });
  });
}

// Reference to the high score display
var highScoreDisplay = document.getElementById('highScoreDisplay');

// Update the high score in the sidebar
function updateScore(player) {
  if (player === 1) {
    player1Score++;
    player1ScoreDisplay.textContent = player1Score;
    if (player1Score > highScore) {
      highScore = player1Score;
      highScoreDisplay.textContent = highScore; // Update the sidebar
    }
  } else if (player === 2) {
    player2Score++;
    player2ScoreDisplay.textContent = player2Score;
  }
}

// Handle keyboard input
document.addEventListener('keydown', function (e) {
  if ([37, 38, 39, 40].includes(e.which)) e.preventDefault();

  if (e.which === 37 && snake1.dx === 0) {
    snake1.dx = -grid; snake1.dy = 0;
  } else if (e.which === 38 && snake1.dy === 0) {
    snake1.dy = -grid; snake1.dx = 0;
  } else if (e.which === 39 && snake1.dx === 0) {
    snake1.dx = grid; snake1.dy = 0;
  } else if (e.which === 40 && snake1.dy === 0) {
    snake1.dy = grid; snake1.dx = 0;
  }
  if (playerCount == 2) {
    if (e.key === 'a' && snake2.dx === 0) {
      snake2.dx = -grid; snake2.dy = 0;
    } else if (e.key === 'w' && snake2.dy === 0) {
      snake2.dy = -grid; snake2.dx = 0;
    } else if (e.key === 'd' && snake2.dx === 0) {
      snake2.dx = grid; snake2.dy = 0;
    } else if (e.key === 's' && snake2.dy === 0) {
      snake2.dy = grid; snake2.dx = 0;
    }
  }
});
