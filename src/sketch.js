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
let welcomeScrollOffset = 0;

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

  // Show welcome screen first
  if (gameState.showWelcome) {
    drawWelcomeScreen(width, height);
    return;
  }

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
  // Dismiss welcome screen
  if (gameState.showWelcome && (key === ' ' || keyCode === ENTER)) {
    gameState.dismissWelcome();
    welcomeScrollOffset = 0;
    return;
  }
  
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
  
  // Dismiss welcome screen
  if (gameState.showWelcome) {
    gameState.dismissWelcome();
    welcomeScrollOffset = 0;
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
  
  // Store initial touch position for scrolling on welcome screen
  if (gameState.showWelcome) {
    window.lastTouchY = touches[0].y;
    return false;
  }
  
  // Store touch start position for menu buttons
  if (!gameState.started && !gameState.gameOver) {
    window.touchStartX = touches[0].x;
    window.touchStartY = touches[0].y;
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
  
  // Handle scrolling on welcome screen
  if (gameState.showWelcome && window.lastTouchY !== undefined) {
    let deltaY = touches[0].y - window.lastTouchY;
    welcomeScrollOffset += deltaY;
    window.lastTouchY = touches[0].y;
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
  // Handle tap to dismiss welcome screen (only if no scroll occurred)
  if (gameState.showWelcome) {
    if (window.lastTouchY !== undefined) {
      // Check if this was a tap (minimal movement) not a scroll
      let touchStart = window.lastTouchY;
      let touchEnd = touches.length > 0 ? touches[0].y : touchStart;
      if (abs(touchEnd - touchStart) < 10) {
        gameState.dismissWelcome();
        welcomeScrollOffset = 0;
      }
      window.lastTouchY = undefined;
    }
    return false;
  }
  
  // Handle touch clicks on menu buttons
  if (!gameState.started && !gameState.gameOver) {
    if (window.touchStartX !== undefined && window.touchStartY !== undefined) {
      // Get the touch end position
      let touchEndX = touches.length > 0 ? touches[0].x : window.touchStartX;
      let touchEndY = touches.length > 0 ? touches[0].y : window.touchStartY;
      
      // Check if this was a tap (minimal movement) not a drag
      if (abs(touchEndX - window.touchStartX) < 20 && abs(touchEndY - window.touchStartY) < 20) {
        // Use the original touch position to check button click
        let difficulty = checkMenuButtonClick(window.touchStartX, window.touchStartY, width, height);
        if (difficulty) {
          startGame(difficulty);
        }
      }
      
      window.touchStartX = undefined;
      window.touchStartY = undefined;
    }
    return false;
  }
  
  // Handle restart from game over screen
  if (gameState.gameOver) {
    restartGame();
    return false;
  }
  
  touchMoveDir = null;
  return false;
}

/**
 * Handle mouse wheel scrolling on welcome screen
 */
function mouseWheel(event) {
  if (gameState.showWelcome) {
    welcomeScrollOffset -= event.delta * 0.5;
    return false; // Prevent page scrolling
  }
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
