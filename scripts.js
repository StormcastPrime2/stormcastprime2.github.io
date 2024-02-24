
//GAME CODE

// Select the relevant elements from the HTML
const grid = document.querySelector('.grid');
const timer = document.querySelector('.timer');
const endGameScreen = document.querySelector('.end-game-screen');
const endGameText = document.querySelector('.end-game-text');
const playAgainBtn = document.querySelector('.play-again');
const delay = async (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms)); 

// Nested Array
const gridMatrix = [
  ['birdhome', '', '', '', '', 'spikes', '', '', '', '', '', '', ''],
  ['cloudwall', 'cloudwall', 'cloudwall', 'cloudwall', 'cloudwall', 'cloudwall', '', 'cloudwall', 'cloudwall', 'cloudwall', 'cloudwall', 'cloudwall', 'cloudwall'],
  ['', '', 'spikes', '', '', '', '', 'spikes', '', '', '', '', ''],
  ['', 'cloudwall', 'cloudwall', 'cloudwall', 'cloudwall', 'cloudwall', 'cloudwall', 'cloudwall', 'cloudwall', 'cloudwall', '', 'cloudwall', 'cloudwall'],
  ['', '', 'spikes', '', '', '', '', '', '', 'spikes', '', '', ''],
  ['dirtwall', 'dirtwall', 'dirtwall', 'dirtwall', 'dirtwall', 'dirtwall', 'worm', 'dirtwall', 'dirtwall', 'dirtwall', 'dirtwall', 'dirtwall', 'dirtwall'],
  ['', '', 'spikes', '', '', '', '', 'spikes', '', '', '', '', ''],
  ['', 'dirtwall', 'dirtwall', 'dirtwall', 'dirtwall', 'dirtwall', 'dirtwall', 'dirtwall', '', 'dirtwall', 'dirtwall', 'dirtwall', 'dirtwall'],
  ['', '', 'spikes', '', '', '', '', '', '', '', '', '', ''],
  ['dirtwall', '', 'dirtwall', 'dirtwall', 'dirtwall', 'dirtwall', 'dirtwall', 'dirtwall', 'dirtwall', 'dirtwall', 'dirtwall', 'dirtwall', 'dirtwall'],
  ['', '', '', '', '', 'spikes', '', '', '', '', '', '', 'molehome'],
];

// Initialise variables that control the game "settings"
const victoryRow = 0;
const roadRows = [5, 6, 7, 8, 9, 10];
const riverRows = [0, 1, 2, 3, 4];
const molePosition = { x: 11, y: 10 };
const birdPosition = { x: 1, y: 0 };
const spikesArray = [];
const stunDuration = 3; // in seconds
const stunCdLength = 2; // in seconds
const shootCdDuration = 1; // in seconds
const projTickDelay = 0.1; //delay between projectile moving up or down one tile
let contentBeforeMole = '';
let contentBeforeBird = '';
let time = 60;
let moleStunned = false;
let birdStunned = false;
let moleStunCd = false;
let birdStunCd = false;
let moleShootCd = false;
let birdShootCd = false;
let hasWorm = '';
let spikesUp = false;
let projCollide = false; // used to destroy both projectiles if they hit each other

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
  if (moleStunned) {
    gridMatrix[molePosition.y][molePosition.x] = 'mole-hit';
  }
  else if (hasWorm == 'mole') {
    gridMatrix[molePosition.y][molePosition.x] = 'moleWorm';
  }
  else {
    gridMatrix[molePosition.y][molePosition.x] = 'mole';
  }
  
}

function playerInput(event) {
  const key = event.key;
  //console.log(key);
  if (gridMatrix[birdPosition.y][birdPosition.x] != 'mole') {
    gridMatrix[birdPosition.y][birdPosition.x] = contentBeforeBird;
  } 
  if (gridMatrix[molePosition.y][molePosition.x] != 'bird') {
    gridMatrix[molePosition.y][molePosition.x] = contentBeforeMole;
  }
  
  // arrows and "WASD"
  // includes checks to ensure mole does not move out of bounds.
  if (!moleStunned) {
    switch (key) {
      case 'ArrowUp':
        if (molePosition.y > 0 && !(gridMatrix[molePosition.y - 1][molePosition.x].endsWith('wall'))) molePosition.y--;
        break;
      case 'ArrowDown':
        if (molePosition.y < 10 && !(gridMatrix[molePosition.y + 1][molePosition.x].endsWith('wall'))) molePosition.y++;
        break;
      case 'ArrowLeft':
        if (molePosition.x > 0 && !(gridMatrix[molePosition.y][molePosition.x - 1].endsWith('wall'))) molePosition.x--;
        break;
      case 'ArrowRight':
        if (molePosition.x < 12 && !(gridMatrix[molePosition.y][molePosition.x + 1].endsWith('wall'))) molePosition.x++;
        break;
      case '0':
        if (!moleShootCd) {
          moleShoot();
        } 
        break;
    }
  }
  if (!birdStunned) {
    switch (key) {
      case 'w':
      case 'W':
        if (birdPosition.y > 0 && !(gridMatrix[birdPosition.y - 1][birdPosition.x].endsWith('wall'))) birdPosition.y--;
        break;
      case 's':
      case 'S':
        if (birdPosition.y < 10 && !(gridMatrix[birdPosition.y + 1][birdPosition.x].endsWith('wall'))) birdPosition.y++;
        break;
      case 'a':
      case 'A':
        if (birdPosition.x > 0 && !(gridMatrix[birdPosition.y][birdPosition.x - 1].endsWith('wall'))) birdPosition.x--;
        break;
      case 'd':
      case 'D':
        if (birdPosition.x < 12 && !(gridMatrix[birdPosition.y][birdPosition.x + 1].endsWith('wall'))) birdPosition.x++;
        break;
      case 'e':
      case 'E':
        if (!birdShootCd) {
          birdShoot();
        } 
        break;
    }
  }

  if(key == 'h') {
    console.log(gridMatrix);
  }
  render();
}

function updateMolePosition() {
  if (contentBeforeMole != 'worm' && contentBeforeMole != 'bird' && contentBeforeMole != 'mole') {
    gridMatrix[molePosition.y][molePosition.x] = contentBeforeMole;
  }
  else {
    gridMatrix[molePosition.y][molePosition.x] = '';
  }

  // Logic for moving the mole when it is on a log.
  /* if (contentBeforeMole === 'wood') {
    if (molePosition.y === 1 && molePosition.x < 8) molePosition.x++;
    else if (molePosition.y === 2 && molePosition.x > 0) molePosition.x--;
  } */
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
  }

  if (contentBeforeMole === 'molehome' && hasWorm === 'mole') {
    endGame('mole-arrived');
  }
  /* handles stunning the player when they touch spikes. 
  Note: cooldown currently affects all spikes, not just the one the player touched */
  if (contentBeforeMole === 'spikes' && !moleStunCd) {
    stunPlayer(true);
  }
}

// -------------------
// BIRD FUNCTIONS
// -------------------

function placeBird() {
  contentBeforeBird = gridMatrix[birdPosition.y][birdPosition.x];
  if (birdStunned) {
    gridMatrix[birdPosition.y][birdPosition.x] = 'bird-hit';
  }
  else if (hasWorm == 'bird') {
    gridMatrix[birdPosition.y][birdPosition.x] = 'birdWorm';
  }
  else {
    gridMatrix[birdPosition.y][birdPosition.x] = 'bird';
  }
}

function updateBirdPosition() {
  if (contentBeforeBird != 'worm' && contentBeforeMole != 'mole' && contentBeforeMole != 'bird') {
    gridMatrix[birdPosition.y][birdPosition.x] = contentBeforeBird;
  }
  else {
    gridMatrix[birdPosition.y][birdPosition.x] = '';
  }

  // Logic for moving the mole when it is on a log.
  /* if (contentBeforeBird === 'wood') {
    if (birdPosition.y === 1 && birdPosition.x < 8) birdPosition.x++;
    else if (birdPosition.y === 2 && birdPosition.x > 0) birdPosition.x--;
  } */
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
  }

  if (contentBeforeBird === 'birdhome' && hasWorm === 'bird') {
    endGame('bird-arrived');
  }
  /* handles stunning the player when they touch spikes. 
  Note: cooldown currently affects all spikes, not just the one the player touched */
  if (contentBeforeBird === 'spikes' && !birdStunCd) {
    stunPlayer(false);
  }
}

function dropWorm() {
  hasWorm = '';
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

async function moleShoot() {
  moleShootCd = true;
  setTimeout(function() {
    moleShootCd = false;
  }, shootCdDuration * 1000);

  let startX = molePosition.x;
  let prevYContent = '';
  let i = molePosition.y - 1;
  for (i; i >= 0; i--) {
    gridMatrix[i+1][startX] = prevYContent;
    if (gridMatrix[i][startX] === 'bird') {
      stunPlayer(false);
      break;
    }
    else if (gridMatrix[i][startX] === 'egg') {
      projCollide = true;
      break;
    }
    else if (projCollide) {
      projCollide = false;
      break;
    }
    
    prevYContent = gridMatrix[i][startX];
    gridMatrix[i][startX] = 'drill';
    await delay(projTickDelay * 1000); 
  }
  gridMatrix[i+1][startX] = prevYContent;
}

async function birdShoot() {
  birdShootCd = true;
  setTimeout(function() {
    birdShootCd = false;
  }, shootCdDuration * 1000);

  let startX = birdPosition.x;
  let prevYContent = '';
  let i = birdPosition.y + 1;
  for (i; i < gridMatrix.length; i++) {
    gridMatrix[i-1][startX] = prevYContent;
    if (gridMatrix[i][startX] === 'mole') {
      stunPlayer(true);
      break;
    }
    else if (gridMatrix[i][startX] === 'drill' || projCollide) {
      projCollide = true;
      break;
    }
    else if (projCollide) {
      projCollide = false;
      break;
    }
    
    prevYContent = gridMatrix[i][startX];
    gridMatrix[i][startX] = 'egg';
    await delay(projTickDelay * 1000); 
  }
  gridMatrix[i-1][startX] = prevYContent;
}



function stunPlayer(stunMole) {
  if (hasWorm == 'mole' && stunMole == true) { 
    dropWorm(); 
  }
  else if (hasWorm == 'bird' && stunMole == false) { 
    dropWorm(); 
  }
  stunMole ? moleStunned = true : birdStunned = true;
  stunMole ? moleStunCd = true : birdStunCd = true;
  //Note: both timers are triggered simultaneously, not one after the other.
  setTimeout(function() {
    stunMole ? moleStunned = false : birdStunned = false;
  }, stunDuration * 1000);

  setTimeout(function() {
    stunMole ? moleStunCd = false : birdStunCd = false;
  }, (stunDuration + stunCdLength) * 1000);
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
    endGameText.innerHTML = 'MOLE<br>WINS!';
    endGameScreen.classList.add('win');
    gridMatrix[molePosition.y][molePosition.x] = reason;
  }

  if (reason === 'bird-arrived') {
    endGameText.innerHTML = 'BIRD<br>WINS!';
    endGameScreen.classList.add('win');
    gridMatrix[birdPosition.y][birdPosition.x] = reason;
  }

  

  // Stop the countdown timer
  //clearInterval(countdownLoop);
  // Stop the game loop
  clearInterval(renderLoop);
  // Stop the player from being able to control the mole
  document.removeEventListener('keyup', playerInput);
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

//ensures that the worm is replaced if returning it to its spot fails (usually because a player is standing in the spot.)
function wormCheck() {
  if (hasWorm == '' && gridMatrix[5][6] == '') {
    gridMatrix[5][6] = 'worm';
  }
}

// RUNNING THE GAME

function render() {
  placeMole();
  placeBird();
  checkMolePosition();
  checkBirdPosition();
  drawGrid();
  wormCheck();
}

// anonymous function
const renderLoop = setInterval(function () {
  updateMolePosition();
  updateBirdPosition();
  animateGame();
  render();
}, 100);

//const countdownLoop = setInterval(countdown, 1000);
const spikeLoop = setInterval(changeSpikes, 2000);

recordSpikes();
document.addEventListener('keyup', playerInput);

playAgainBtn.addEventListener('click', function () {
  location.reload();
});