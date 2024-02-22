
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
  ['birdhome', '', 'spikes', '', '', '', '', '', '', '', '', '', ''],
  ['wall', 'wall', 'wall', 'wall', '', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ['', '', 'spikes', '', '', '', 'spikes', '', '', '', '', '', ''],
  ['', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', '', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ['', '', 'spikes', '', '', '', 'spikes', '', '', '', '', '', ''],
  ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'worm', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ['', '', '', '', '', '', '', 'spikes', '', '', '', '', ''],
  ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', '', 'wall', 'wall', 'wall', 'wall'],
  ['', '', 'spikes', '', '', '', '', '', '', '', '', '', ''],
  ['wall', '', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ['', '', '', '', '', 'spikes', '', '', '', '', '', '', 'molehome'],
];

// Initialise variables that control the game "settings"
const victoryRow = 0;
const roadRows = [5, 6, 7, 8, 9, 10];
const riverRows = [0, 1, 2, 3, 4];
const molePosition = { x: 11, y: 10 };
const birdPosition = { x: 1, y: 0 };
const spikesArray = [];
let contentBeforeMole = '';
let contentBeforeBird = '';
let time = 60;
let moleStunned = false;
let birdStunned = false;
let moleStunCooldown = false;
let birdStunCooldown = false;
let hasWorm = '';
let spikesUp = false;

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
// MOLE FUNCTIONS
// -------------------
function placeMole() {
  contentBeforeMole = gridMatrix[molePosition.y][molePosition.x];
  gridMatrix[molePosition.y][molePosition.x] = 'mole';
}

function movePlayer(event) {
  const key = event.key;
  //console.log(key);
  gridMatrix[molePosition.y][molePosition.x] = contentBeforeMole;
  gridMatrix[birdPosition.y][birdPosition.x] = contentBeforeBird;
  // arrows and "WASD"
  // includes checks to ensure mole does not move out of bounds.
  if (!moleStunned) {
    switch (key) {
      case 'ArrowUp':
        if (molePosition.y > 0 && (gridMatrix[molePosition.y - 1][molePosition.x] != 'wall')) molePosition.y--;
        break;
      case 'ArrowDown':
        if (molePosition.y < 10 && (gridMatrix[molePosition.y + 1][molePosition.x] != 'wall')) molePosition.y++;
        break;
      case 'ArrowLeft':
        if (molePosition.x > 0 && (gridMatrix[molePosition.y][molePosition.x - 1] != 'wall')) molePosition.x--;
        break;
      case 'ArrowRight':
        if (molePosition.x < 12 && (gridMatrix[molePosition.y][molePosition.x + 1] != 'wall')) molePosition.x++;
        break;
    }
  }
  if (!birdStunned) {
    switch (key) {
      case 'w':
      case 'W':
        if (birdPosition.y > 0 && (gridMatrix[birdPosition.y - 1][birdPosition.x] != 'wall')) birdPosition.y--;
        break;
      case 's':
      case 'S':
        if (birdPosition.y < 10 && (gridMatrix[birdPosition.y + 1][birdPosition.x] != 'wall')) birdPosition.y++;
        break;
      case 'a':
      case 'A':
        if (birdPosition.x > 0 && (gridMatrix[birdPosition.y][birdPosition.x - 1] != 'wall')) birdPosition.x--;
        break;
      case 'd':
      case 'D':
        if (birdPosition.x < 12 && (gridMatrix[birdPosition.y][birdPosition.x + 1] != 'wall')) birdPosition.x++;
        break;
    }
  }
  render();
}

function updateMolePosition() {
  if (contentBeforeMole != 'worm') {
    gridMatrix[molePosition.y][molePosition.x] = contentBeforeMole;
  }
  else {
    gridMatrix[molePosition.y][molePosition.x] = '';
  }

  // Logic for moving the mole when it is on a log.
  if (contentBeforeMole === 'wood') {
    if (molePosition.y === 1 && molePosition.x < 8) molePosition.x++;
    else if (molePosition.y === 2 && molePosition.x > 0) molePosition.x--;
  }
}

// checks for end of game conditions
function checkMolePosition() {
  /* if (molePosition.y === victoryRow) endGame('mole-arrived'); 
  if (contentBeforeMole === 'river') { endGame('mole-drowned');}
  else if (contentBeforeMole === 'car' || contentBeforeMole === 'bus') {
    endGame('mole-hit');
  } */

  //Check if the player is touching the worm
  if (contentBeforeMole === 'worm' && hasWorm !== 'mole') {
    console.log("caught the worm!");
    hasWorm = 'mole';
    stunPlayer(true);
  }

  if (contentBeforeMole === 'molehome' && hasWorm === 'mole') {
    endGame('mole-arrived');
  }
  /* handles stunning the player when they touch spikes. 
  Note: cooldown currently affects all spikes, not just the one the player touched */
  if (contentBeforeMole === 'spikes' && !moleStunCooldown) {
    dropWorm();
    stunPlayer(true);
  }
}

// -------------------
// BIRD FUNCTIONS
// -------------------

function placeBird() {
  contentBeforeBird = gridMatrix[birdPosition.y][birdPosition.x];
  gridMatrix[birdPosition.y][birdPosition.x] = 'bird';
}

function updateBirdPosition() {
  if (contentBeforeBird != 'worm') {
    gridMatrix[birdPosition.y][birdPosition.x] = contentBeforeBird;
  }
  else {
    gridMatrix[birdPosition.y][birdPosition.x] = '';
  }

  // Logic for moving the mole when it is on a log.
  if (contentBeforeBird === 'wood') {
    if (birdPosition.y === 1 && birdPosition.x < 8) birdPosition.x++;
    else if (birdPosition.y === 2 && birdPosition.x > 0) birdPosition.x--;
  }
}

// checks for end of game conditions
function checkBirdPosition() {
  /* if (molePosition.y === victoryRow) endGame('mole-arrived'); 
  if (contentBeforeMole === 'river') { endGame('mole-drowned');}
  else if (contentBeforeMole === 'car' || contentBeforeMole === 'bus') {
    endGame('mole-hit');
  } */

  //Check if the player is touching the worm
  if (contentBeforeBird === 'worm' && hasWorm !== 'bird') {
    console.log("caught the worm!");
    hasWorm = 'bird';
    stunPlayer();
  }

  if (contentBeforeBird === 'birdhome' && hasWorm === 'bird') {
    endGame('mole-arrived');
  }
  /* handles stunning the player when they touch spikes. 
  Note: cooldown currently affects all spikes, not just the one the player touched */
  if (contentBeforeBird === 'spikes' && !birdStunCooldown) {
    dropWorm();
    stunPlayer(false);
  }
}

function dropWorm() {
  hasWorm = false;
  gridMatrix[5][6] = 'worm';
}

// temporary solution
function recordSpikes() {

  for(let i = 0; i < gridMatrix.length; i++) {
    let item = gridMatrix[i];
    for(let j = 0; j < item.length; j++) {
      if (item[j] === 'spikes') {
        let newItem = {x: j, y: i}; 
        spikesArray.push(newItem);
      }
    } 
  }
  console.log(spikesArray);
}

// temporary solution
function changeSpikes() {
  if (spikesUp) {
    spikesUp = false;
    spikesArray.forEach(element => {
      gridMatrix[element.y][element.x] = "spikesDown";
    });
  }
  else {
    spikesUp = true;
    spikesArray.forEach(element => {
      gridMatrix[element.y][element.x] = "spikes";
    });
  }
}

function stunPlayer(stunMole) {
  stunMole ? moleStunned = true : birdStunned = true;
  stunMole ? moleStunCooldown = true : birdStunCooldown = true;
  //Note: both timers are triggered simultaneously, not one after the other.
  setTimeout(function() {
    stunMole ? moleStunned = false : birdStunned = false;
  }, stunDuration * 1000);

  setTimeout(function() {
    stunMole ? moleStunCooldown = false : birdStunCooldown = false;
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
  if (reason === 'mole-arrived') {
    endGameText.innerHTML = 'YOU<br>WIN!';
    endGameScreen.classList.add('win');
  }

  gridMatrix[molePosition.y][molePosition.x] = reason;

  // Stop the countdown timer
  clearInterval(countdownLoop);
  // Stop the game loop
  clearInterval(renderLoop);
  // Stop the player from being able to control the mole
  document.removeEventListener('keyup', movePlayer);
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
  placeMole();
  placeBird();
  checkMolePosition();
  checkBirdPosition();
  drawGrid();
}

// anonymous function
const renderLoop = setInterval(function () {
  updateMolePosition();
  updateBirdPosition();
  animateGame();
  render();
}, 600);

const countdownLoop = setInterval(countdown, 1000);
const spikeLoop = setInterval(changeSpikes, 2000);

recordSpikes();
document.addEventListener('keyup', movePlayer);

playAgainBtn.addEventListener('click', function () {
  location.reload();
});