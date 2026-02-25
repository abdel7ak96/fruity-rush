// ==========================
// MAIN SKETCH - ORCHESTRATOR
// ==========================
// This file coordinates all game systems
// All logic has been modularized into separate files

// ==========================
// GLOBAL INSTANCES
// ==========================
let assetManager;
let gameState;
let player;
let camera;
let entityManager;

let touchMoveDir = null;
let touchBtnSize;
let touchMargin;

let currentVolume = 0.5;
let wasGameOver = false;

// ==========================
// PRELOAD
// ==========================
function preload() {
  assetManager = new AssetManager();
  assetManager.preloadAll();
}

// ==========================
// SETUP
// ==========================
function setup() {
  createCanvas(windowWidth, windowHeight);
  noSmooth();
  document.body.style.overflow = "hidden";
  document.addEventListener("touchmove", e => e.preventDefault(), { passive: false });

  touchBtnSize = min(width, height) * TOUCH_BTN_SIZE_RATIO;
  touchMargin = touchBtnSize * 0.25;

  // Initialize game systems
  gameState = new GameState();
  player = new Player(width / 2, height / 2);
  camera = new Camera();
  entityManager = new EntityManager();

  noiseDetail(4, 0.5);
  
  // Set initial master volume
  outputVolume(currentVolume);
}

// ==========================
// RESIZE
// ==========================
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  touchBtnSize = min(width, height) * TOUCH_BTN_SIZE_RATIO;
  touchMargin = touchBtnSize * 0.25;
}

// ==========================
// DRAW LOOP
// ==========================
function draw() {
  background(25);

  // Show start menu if game hasn't started
  if (!gameState.started) {
    drawStartMenu(width, height);
    return;
  }

  // Update countdown timer and check for game over
  gameState.updateTimer();
  
  // Check if game just ended
  if (gameState.gameOver && !wasGameOver) {
    assetManager.sounds.gameOver.play();
    assetManager.sounds.background.stop();
    wasGameOver = true;
  }

  // Gameplay updates (stop when game is over)
  if (!gameState.gameOver) {
    handlePlayerMovement();
  }
  
  camera.update(player, width, height);

  // Render world (with camera transform)
  push();
  translate(-camera.x, -camera.y);

  drawGrass(assetManager.grassTiles, camera, width, height);
  entityManager.spawnInViewport(camera, width, height, gameState.selectedDifficulty);
  
  // Check collisions and update game state
  let collected = entityManager.checkCollisions(player);
  for (let item of collected) {
    gameState.collectItem(item.type);
    // Play collection sound based on item type
    if (item.type === 'healthy') {
      assetManager.sounds.healthy.play();
    } else if (item.type === 'junky') {
      assetManager.sounds.junky.play();
    }
  }
  
  entityManager.cleanup(player);
  entityManager.draw(assetManager);
  player.draw(assetManager.spriteSheets);

  pop();

  // Render UI (no camera transform)
  drawUI(gameState, width, height);
  drawTouchButtons(width, height, touchBtnSize, touchMargin);
  
  // Draw volume slider (always visible)
  drawVolumeSlider(width - 140, 20, 120, 20, currentVolume);
}

// ==========================
// PLAYER MOVEMENT
// ==========================
function handlePlayerMovement() {
  // Get keyboard input
  let input = getMovementInput();
  
  // Override with touch input if active
  if (touchMoveDir) {
    input.x = touchMoveDir.x;
    input.y = touchMoveDir.y;
  }
  
  player.update(input.x, input.y, gameState.currentSpeed);
}

// ==========================
// EVENT HANDLERS
// ==========================

/**
 * Handle key presses for menu selection and restart
 */
function keyPressed() {
  // Menu selection
  if (!gameState.started && !gameState.gameOver) {
    let difficulty = handleMenuKeyPress();
    if (difficulty) {
      startGame(difficulty);
    }
  }
  
  // Restart
  if (gameState.gameOver && handleRestartKeyPress()) {
    restartGame();
  }
}

/**
 * Handle mouse clicks for menu and restart
 */
function mousePressed() {
  // Check volume slider interaction first
  let newVolume = checkVolumeSliderInteraction(mouseX, mouseY, width - 140, 20, 120, 20);
  if (newVolume !== null) {
    currentVolume = newVolume;
    outputVolume(currentVolume);
    return;
  }
  
  // Restart from game over
  if (gameState.gameOver) {
    restartGame();
    return;
  }
  
  // Menu button clicks
  if (!gameState.started) {
    let difficulty = checkMenuButtonClick(mouseX, mouseY, width, height);
    if (difficulty) {
      startGame(difficulty);
    }
  }
}

/**
 * Handle mouse dragging for smooth volume adjustment
 */
function mouseDragged() {
  let newVolume = checkVolumeSliderInteraction(mouseX, mouseY, width - 140, 20, 120, 20);
  if (newVolume !== null) {
    currentVolume = newVolume;
    outputVolume(currentVolume);
    return false;
  }
}

/**
 * Handle touch start
 */
function touchStarted() {
  // Check volume slider interaction first
  let newVolume = checkVolumeSliderInteraction(touches[0].x, touches[0].y, width - 140, 20, 120, 20);
  if (newVolume !== null) {
    currentVolume = newVolume;
    outputVolume(currentVolume);
    return false;
  }
  
  let dir = getTouchDirection(touches[0].x, touches[0].y, width, height, touchBtnSize, touchMargin);
  touchMoveDir = dir;
  return false;
}

/**
 * Handle touch move
 */
function touchMoved() {
  // Check volume slider interaction first
  let newVolume = checkVolumeSliderInteraction(touches[0].x, touches[0].y, width - 140, 20, 120, 20);
  if (newVolume !== null) {
    currentVolume = newVolume;
    outputVolume(currentVolume);
    return false;
  }
  
  let dir = getTouchDirection(touches[0].x, touches[0].y, width, height, touchBtnSize, touchMargin);
  touchMoveDir = dir;
  return false;
}

/**
 * Handle touch end
 */
function touchEnded() {
  touchMoveDir = null;
  return false;
}

// ==========================
// GAME STATE MANAGEMENT
// ==========================

/**
 * Start a new game with selected difficulty
 */
function startGame(difficulty) {
  gameState.startGame(difficulty);
  entityManager.reset();
  player.reset(width / 2, height / 2);
  wasGameOver = false;
  
  // Play game start sound and start background music
  assetManager.sounds.gameStart.play();
  assetManager.sounds.background.loop();
  
  // Spawn initial entities
  entityManager.spawnInViewport(camera, width, height, difficulty);
}

/**
 * Restart game (return to menu)
 */
function restartGame() {
  gameState.restartGame();
  entityManager.reset();
  touchMoveDir = null;
  wasGameOver = false;
  
  // Stop background music
  assetManager.sounds.background.stop();
}
