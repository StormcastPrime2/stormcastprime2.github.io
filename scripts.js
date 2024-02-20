
//GAME CODE

// Select the relevant elements from the HTML
const grid = document.querySelector('.grid');
const timer = document.querySelector('.timer');
const endGameScreen = document.querySelector('.end-game-screen');
const endGameText = document.querySelector('.end-game-text');
const playAgainBtn = document.querySelector('.play-again');
const stunDuration = 3; // in seconds
const stunCooldownDuration = 1; // in seconds

// Nested Array
const gridMatrix = [
  ['home', '', 'spikes', '', '', '', '', '', '', '', '', '', ''],
  ['wall', 'wall', 'wall', 'wall', '', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ['', '', 'spikes', '', '', '', 'spikes', '', '', '', '', '', ''],
  ['', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', '', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ['', '', 'spikes', '', '', '', 'spikes', '', '', '', '', '', ''],
  ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'worm', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ['', '', '', '', '', '', '', 'spikes', '', '', '', '', ''],
  ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', '', 'wall', 'wall', 'wall', 'wall'],
  ['', '', 'spikes', '', '', '', '', '', '', '', '', '', ''],
  ['wall', '', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ['', '', '', '', '', 'spikes', '', '', '', '', '', '', 'home'],
];

// Initialise variables that control the game "settings"
const victoryRow = 0;
const roadRows = [5, 6, 7, 8];
const riverRows = [0, 1, 2, 3];
const duckPosition = { x: 11, y: 10 };
let contentBeforeDuck = '';
let time = 60;
let stunned = false;
let stunOnCooldown = false;
let hasWorm = false;

function drawGrid() {
  grid.innerHTML = '';

  // For each row in the gridMatrix, we need to process what is going to be drawn / displayed on the screen
  gridMatrix.forEach(function (gridRow, gridRowIndex) {
    gridRow.forEach(function (cellContent, cellContentIndex) {
      // Given the current grid row, create a cell for the grid in the game based on the cellContent
      const cellDiv = document.createElement('div');
      cellDiv.classList.add('cell');

      if (riverRows.includes(gridRowIndex)) {
        cellDiv.classList.add('river');
      } else if (roadRows.includes(gridRowIndex)) {
        cellDiv.classList.add('road');
      }

      if (cellContent) {
        cellDiv.classList.add(cellContent);
      }

      grid.appendChild(cellDiv);
    });
  });
}

// -------------------
// DUCK FUNCTIONS
// -------------------
function placeDuck() {
  contentBeforeDuck = gridMatrix[duckPosition.y][duckPosition.x];
  gridMatrix[duckPosition.y][duckPosition.x] = 'duck';
}

function moveDuck(event) {
  const key = event.key;
  //console.log(key);
  gridMatrix[duckPosition.y][duckPosition.x] = contentBeforeDuck;
  // arrows and "WASD"
  // includes checks to ensure duck does not move out of bounds.
  if (!stunned) {
    switch (key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (duckPosition.y > 0 && (gridMatrix[duckPosition.y - 1][duckPosition.x] != 'wall')) duckPosition.y--;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (duckPosition.y < 10 && (gridMatrix[duckPosition.y + 1][duckPosition.x] != 'wall')) duckPosition.y++;
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (duckPosition.x > 0 && (gridMatrix[duckPosition.y][duckPosition.x - 1] != 'wall')) duckPosition.x--;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (duckPosition.x < 12 && (gridMatrix[duckPosition.y][duckPosition.x + 1] != 'wall')) duckPosition.x++;
        break;
    }
  }
  render();
}

function updateDuckPosition() {
  if (contentBeforeDuck != 'worm') {
    gridMatrix[duckPosition.y][duckPosition.x] = contentBeforeDuck;
  }
  else {
    gridMatrix[duckPosition.y][duckPosition.x] = '';
  }

  // Logic for moving the duck when it is on a log.
  if (contentBeforeDuck === 'wood') {
    if (duckPosition.y === 1 && duckPosition.x < 8) duckPosition.x++;
    else if (duckPosition.y === 2 && duckPosition.x > 0) duckPosition.x--;
  }
}

// checks for end of game conditions
function checkPosition() {
  /* if (duckPosition.y === victoryRow) endGame('duck-arrived'); 
  if (contentBeforeDuck === 'river') { endGame('duck-drowned');}
  else if (contentBeforeDuck === 'car' || contentBeforeDuck === 'bus') {
    endGame('duck-hit');
  } */

  //Check if the player is touching the worm
  if (contentBeforeDuck === 'worm' && hasWorm == false) {
    console.log("caught the worm!");
    hasWorm = true;
    stunPlayer();
  }

  if (contentBeforeDuck === 'home' && hasWorm == true) {
    endGame('duck-arrived');
  }
  /* handles stunning the player when they touch spikes. 
  Note: cooldown currently affects all spikes, not just the one the player touched */
  if (contentBeforeDuck === 'spikes' && !stunOnCooldown) {
    dropWorm();
    stunPlayer();
  }
}

function dropWorm() {
  hasWorm = false;
  gridMatrix[5][6] = 'worm';
}

function stunPlayer() {
  stunned = true;
  stunOnCooldown = true;
  //Note: both timers are triggered simultaneously, not one after the other.
  setTimeout(function() {
    stunned = false;
  }, stunDuration * 1000);

  setTimeout(function() {
    stunOnCooldown = false;
  }, (stunDuration + stunCooldownDuration) * 1000);
}

// -------------------
// GAME ANIMATION
// -------------------

//moves cars and logs to the right when they reach the edge.
function moveRight(gridRowIndex) {
  // Get all of the cells in the current row
  const currentRow = gridMatrix[gridRowIndex];

  // Remove the last element...
  const lastElement = currentRow.pop();

  // And put it back to the beginning, i.e. index 0
  currentRow.unshift(lastElement);
}

//moves cars and logs to the left when they reach the edge.
function moveLeft(gridRowIndex) {
  const currentRow = gridMatrix[gridRowIndex];
  const firstElement = currentRow.shift();
  currentRow.push(firstElement);
}

function animateGame() {
  // Animate river:
  /*moveRight(1);
  moveLeft(2); */

  // Animate road:
  /*moveRight(4);
  moveRight(5);
  moveRight(6); */
}

// -------------------
// GAME WIN/LOSS LOGIC
// -------------------
function endGame(reason) {
  // Victory
  if (reason === 'duck-arrived') {
    endGameText.innerHTML = 'YOU<br>WIN!';
    endGameScreen.classList.add('win');
  }

  gridMatrix[duckPosition.y][duckPosition.x] = reason;

  // Stop the countdown timer
  clearInterval(countdownLoop);
  // Stop the game loop
  clearInterval(renderLoop);
  // Stop the player from being able to control the duck
  document.removeEventListener('keyup', moveDuck);
  // Display the game over screen
  endGameScreen.classList.remove('hidden');
}

function countdown() {
  if (time !== 0) {
    time--;
    timer.innerText = time.toString().padStart(5, '0');
  }

  if (time === 0) {
    // end the game -- player has lost!
    endGame();
  }
}

// RUNNING THE GAME

function render() {
  placeDuck();
  checkPosition();
  drawGrid();
}

// anonymous function
const renderLoop = setInterval(function () {
  updateDuckPosition();
  animateGame();
  render();
}, 600);

const countdownLoop = setInterval(countdown, 1000);

document.addEventListener('keyup', moveDuck);
playAgainBtn.addEventListener('click', function () {
  location.reload();
});