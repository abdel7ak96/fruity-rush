// ==========================
// CONFIG
// ==========================
let WORLD_SIZE = 4000;
let ACCEL_LERP = 0.15;    // normal acceleration

// Speed system
const MIN_SPEED = 2.5;
const MAX_SPEED = 6.5;
const DEFAULT_SPEED = 4.5;
const SPEED_CHANGE_HEALTHY = 0.5;  // speed increase per healthy item
const SPEED_CHANGE_JUNKY = 0.5;    // speed decrease per junky item

const FRAME_WIDTH = 48;
const FRAME_HEIGHT = 64;

const DRAW_WIDTH = 192;
const DRAW_HEIGHT = 256;

const TILE_SIZE = 64;
const TILE_RENDER_MARGIN = TILE_SIZE * 2;

const ENTITY_SIZE = 48;
const APPLE_GRID_STEP = 240; // distance between apples
const SPAWN_ITEMS_PER_CELL = 3; // max items per grid cell
const CLEANUP_DISTANCE = 2000; // remove collected items beyond this distance

const TOUCH_BTN_SIZE_RATIO = 0.12; // % of smaller screen dimension

// ==========================
// GLOBALS
// ==========================
let player;
let cameraX = 0;
let cameraY = 0;

let touchMoveDir = null;

let spriteSheets = {};
let grassTiles = [];

let entities = [];
let collectedCount = 0;
let healthySprites = [];
let junkySprites = [];

let appleSpawnedGrid = {};

// Timer variables
let timerSeconds = 30;
let lastSecondUpdate = 0;
let gameOver = false;

// Speed variables
let currentSpeed;

// Game state variables
let gameStarted = false;
let selectedDifficulty = null;

// Difficulty settings
let difficultySettings = {
  easy: {
    name: "Easy",
    healthyRatio: 0.5,        // 50% healthy items
    densityThresholds: [0.6, 0.4, 0.2],  // [dense, medium, sparse]
    initialSpeed: 5.5,
    description: "50% healthy, More items, Faster"
  },
  medium: {
    name: "Medium",
    healthyRatio: 0.7,        // 30% healthy items (inverse: <0.7 = junky)
    densityThresholds: [0.7, 0.5, 0.3],
    initialSpeed: 4.5,
    description: "30% healthy, Normal items, Normal speed"
  },
  hard: {
    name: "Hard",
    healthyRatio: 0.8,        // 20% healthy items (inverse: <0.8 = junky)
    densityThresholds: [0.8, 0.6, 0.4],
    initialSpeed: 3.5,
    description: "20% healthy, Fewer items, Slower"
  }
};

let TOUCH_BTN_SIZE;
let margin;

// ==========================
// PRELOAD
// ==========================
function preload() {
  const paths = {
    idle: {
      down: "assets/sprites/idle/Idle_Down.png",
      up: "assets/sprites/idle/Idle_Up.png",
      left_down: "assets/sprites/idle/Idle_Left_Down.png",
      right_down: "assets/sprites/idle/Idle_Right_Down.png",
      left_up: "assets/sprites/idle/Idle_Left_Up.png",
      right_up: "assets/sprites/idle/Idle_Right_Up.png"
    },
    walk: {
      down: "assets/sprites/walk/walk_Down.png",
      up: "assets/sprites/walk/walk_Up.png",
      left_down: "assets/sprites/walk/walk_Left_Down.png",
      right_down: "assets/sprites/walk/walk_Right_Down.png",
      left_up: "assets/sprites/walk/walk_Left_Up.png",
      right_up: "assets/sprites/walk/walk_Right_Up.png"
    }
  };

  for (let state in paths) {
    spriteSheets[state] = {};
    for (let dir in paths[state]) {
      spriteSheets[state][dir] = loadImage(paths[state][dir]);
    }
  }

  for (let i = 1; i <= 6; i++) {
    grassTiles.push(loadImage(`assets/floor/grass/grass0${i}.png`));
  }

  for (let i = 1; i <= 6; i++) {
    healthySprites.push(loadImage(`assets/objects/healthy/${i}.png`));
  }
  
  for (let i = 1; i <= 5; i++) {
    junkySprites.push(loadImage(`assets/objects/junky/${i}.png`));
  }
}

// ==========================
// SETUP
// ==========================
function setup() {
  createCanvas(windowWidth, windowHeight);
  noSmooth();
  document.body.style.overflow = "hidden";
  document.addEventListener("touchmove", e => e.preventDefault(), { passive: false });

  TOUCH_BTN_SIZE = min(width, height) * TOUCH_BTN_SIZE_RATIO;
  margin = TOUCH_BTN_SIZE * 0.25;

  player = {
    x: width / 2,
    y: height / 2,
    vx: 0,
    vy: 0,
    size: DRAW_WIDTH,
    lastDir: "down",
    animFrame: 0,
    animTimer: 0
  };

  noiseDetail(4, 0.5);

  // Initialize timer (will be reset when game starts)
  timerSeconds = 30;
  lastSecondUpdate = millis();
  gameOver = false;
  gameStarted = false;
  selectedDifficulty = null;
  
  // Speed will be set when difficulty is chosen
  // Don't spawn apples until game starts
}

// ==========================
// RESIZE
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  TOUCH_BTN_SIZE = min(width, height) * TOUCH_BTN_SIZE_RATIO;
  margin = TOUCH_BTN_SIZE * 0.25;
}

// ==========================
// DRAW LOOP
// ==========================
function draw() {
  background(25);

  // Show start menu if game hasn't started
  if (!gameStarted) {
    drawStartMenu();
    return;
  }

  // Update countdown timer
  if (!gameOver) {
    let currentTime = millis();
    if (currentTime - lastSecondUpdate >= 1000) {
      timerSeconds--;
      lastSecondUpdate = currentTime;
      if (timerSeconds <= 0) {
        timerSeconds = 0;
        gameOver = true;
      }
    }
  }

  // Stop gameplay when game is over
  if (!gameOver) {
    updateMovement();
  }
  updateCamera();

  push();
  translate(-cameraX, -cameraY);

  drawGrass();
  spawnApples(false);
  drawEntities();
  drawPlayer();

  pop();

  drawUI();
  drawTouchButtons();
}

// ==========================
// GRASS
function drawGrass() {
  noStroke();
  let startX = floor((cameraX - TILE_RENDER_MARGIN) / TILE_SIZE);
  let endX   = ceil((cameraX + width + TILE_RENDER_MARGIN) / TILE_SIZE);
  let startY = floor((cameraY - TILE_RENDER_MARGIN) / TILE_SIZE);
  let endY   = ceil((cameraY + height + TILE_RENDER_MARGIN) / TILE_SIZE);

  for (let i = startX; i <= endX; i++) {
    for (let j = startY; j <= endY; j++) {
      let worldX = floor(i * TILE_SIZE);
      let worldY = floor(j * TILE_SIZE);

      let n = pow(noise(i*0.15, j*0.15), 1.5);
      let index = floor(map(n, 0, 1, 0, grassTiles.length - 1));
      index = constrain(index, 0, grassTiles.length - 1);

      imageMode(CORNER);
      image(grassTiles[index], worldX, worldY, TILE_SIZE, TILE_SIZE);
    }
  }
}

// ==========================
// APPLE SPAWNING
function spawnApples(initial=false) {
  let startX = floor((cameraX - TILE_RENDER_MARGIN) / APPLE_GRID_STEP);
  let endX   = ceil((cameraX + width + TILE_RENDER_MARGIN) / APPLE_GRID_STEP);
  let startY = floor((cameraY - TILE_RENDER_MARGIN) / APPLE_GRID_STEP);
  let endY   = ceil((cameraY + height + TILE_RENDER_MARGIN) / APPLE_GRID_STEP);

  // Clean up collected items far from camera to prevent memory issues
  if (!initial) {
    entities = entities.filter(e => {
      if (!e.collected) return true;
      let dist = sqrt(pow(e.x - player.x, 2) + pow(e.y - player.y, 2));
      return dist < CLEANUP_DISTANCE;
    });
  }

  for (let i = startX; i <= endX; i++) {
    for (let j = startY; j <= endY; j++) {
      let key = i + "_" + j;
      if (appleSpawnedGrid[key]) continue;

      // Use perlin noise to create natural clustering
      // Higher frequency for more variation
      let noiseValue = noise(i * 0.08, j * 0.08);
      
      // Second layer of noise for more interesting patterns
      let noiseValue2 = noise(i * 0.2 + 100, j * 0.2 + 100);
      
      // Combine noise values - creates clusters and sparse areas
      let density = (noiseValue * 0.7 + noiseValue2 * 0.3);
      
      // Determine how many items to spawn in this cell
      // Use difficulty-specific density thresholds
      let itemCount = 0;
      let thresholds = difficultySettings[selectedDifficulty].densityThresholds;
      if (density > thresholds[0]) {
        itemCount = SPAWN_ITEMS_PER_CELL; // Dense cluster
      } else if (density > thresholds[1]) {
        itemCount = 2; // Medium density
      } else if (density > thresholds[2]) {
        itemCount = 1; // Sparse
      }
      
      // Use grid position as seed for deterministic randomness
      randomSeed(i * 1000 + j);
      
      // Spawn items in this grid cell
      for (let n = 0; n < itemCount; n++) {
        let offsetX = random(-APPLE_GRID_STEP/2.5, APPLE_GRID_STEP/2.5);
        let offsetY = random(-APPLE_GRID_STEP/2.5, APPLE_GRID_STEP/2.5);
        
        // Randomly choose item type with perlin noise influence
        // Use difficulty-specific ratio
        let typeNoise = noise(i * 0.15 + n * 10, j * 0.15 + n * 10);
        let itemType;
        let healthyThreshold = difficultySettings[selectedDifficulty].healthyRatio;
        if (typeNoise < healthyThreshold) {
          itemType = 'junky';
        } else {
          itemType = 'healthy';
        }
        
        // Randomly choose variation based on type
        let variation = (itemType === 'healthy') ? floor(random(6)) : floor(random(5));
        
        entities.push({
          x: i*APPLE_GRID_STEP + APPLE_GRID_STEP/2 + offsetX,
          y: j*APPLE_GRID_STEP + APPLE_GRID_STEP/2 + offsetY,
          size: ENTITY_SIZE,
          type: itemType,
          variation: variation,
          collected: false
        });
      }
      
      // Reset random seed for other game systems
      randomSeed(millis());
      
      appleSpawnedGrid[key] = true;
    }
  }
}

// ==========================
// ENTITIES
function drawEntities() {
  imageMode(CENTER);
  for (let e of entities) {
    if (!e.collected) {
      // Draw appropriate sprite based on type and variation
      let sprite = (e.type === 'healthy') ? healthySprites[e.variation] : junkySprites[e.variation];
      
      image(sprite, e.x, e.y, e.size, e.size);
      if (dist(player.x, player.y, e.x, e.y) < (player.size/2 + e.size/2)*0.6) {
        e.collected = true;
        collectedCount++;
        
        // Update timer based on item type
        if (e.type === 'healthy') {
          timerSeconds += 5; // Healthy items add 5 seconds
          currentSpeed = constrain(currentSpeed + SPEED_CHANGE_HEALTHY, MIN_SPEED, MAX_SPEED);
        } else {
          timerSeconds -= 5; // Junky items subtract 5 seconds
          if (timerSeconds < 0) timerSeconds = 0;
          currentSpeed = constrain(currentSpeed - SPEED_CHANGE_JUNKY, MIN_SPEED, MAX_SPEED);
        }
      }
    }
  }
}

// ==========================
// PLAYER
function updateMovement() {
  let inputX = 0, inputY = 0;

  if (keyIsDown(90) || keyIsDown(UP_ARROW)) inputY -= 1; // Z or Up Arrow
  if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) inputY += 1; // S or Down Arrow
  if (keyIsDown(81) || keyIsDown(LEFT_ARROW)) inputX -= 1; // Q or Left Arrow
  if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) inputX += 1; // D or Right Arrow

  if (touchMoveDir) {
    inputX = touchMoveDir.x;
    inputY = touchMoveDir.y;
  }

  let mag = sqrt(inputX*inputX + inputY*inputY);
  if (mag>0){ inputX/=mag; inputY/=mag; }

  let targetVX = inputX*currentSpeed;
  let targetVY = inputY*currentSpeed;

  player.vx = lerp(player.vx, targetVX, ACCEL_LERP);
  player.vy = lerp(player.vy, targetVY, ACCEL_LERP);

  player.x += player.vx;
  player.y += player.vy;

  if(mag>0) player.lastDir = getDirection(inputX,inputY);
}

const THRESH = 0.3;
function getDirection(vx,vy){
  if(vy>THRESH && abs(vx)<THRESH) return "down";
  if(vy<-THRESH && abs(vx)<THRESH) return "up";
  if(vx<-THRESH && vy>THRESH) return "left_down";
  if(vx>THRESH && vy>THRESH) return "right_down";
  if(vx<-THRESH && vy<-THRESH) return "left_up";
  if(vx>THRESH && vy<-THRESH) return "right_up";
  if(vx>THRESH && abs(vy)<THRESH) return "right_down";
  if(vx<-THRESH && abs(vy)<THRESH) return "left_down";
  return player.lastDir;
}

function updateCamera() { cameraX = floor(player.x - width/2); cameraY = floor(player.y - height/2); }

function drawPlayer() {
  let state = (abs(player.vx)>0.1||abs(player.vy)>0.1)?"walk":"idle";
  let dir = (state==="idle")?player.lastDir:getDirection(player.vx,player.vy);
  let img = spriteSheets[state][dir];
  if(!img){ fill("blue"); circle(player.x,player.y,DRAW_WIDTH); return; }
  let framesPerRow = img.width/FRAME_WIDTH;
  playSpriteAnimation(img,player,framesPerRow,player.x,player.y,DRAW_WIDTH,DRAW_HEIGHT);
}

function playSpriteAnimation(img, entity, framesPerRow, x, y, w, h){
  entity.animTimer++;
  if(entity.animTimer>=6){ entity.animTimer=0; entity.animFrame++; if(entity.animFrame>=framesPerRow) entity.animFrame=0; }
  let sx = entity.animFrame*FRAME_WIDTH, sy = 0;
  let offsetY = h - DRAW_HEIGHT / FRAME_HEIGHT * FRAME_HEIGHT;
  imageMode(CENTER);
  image(img,x,y-offsetY/2,w,h,sx,sy,FRAME_WIDTH,FRAME_HEIGHT);
}

// ==========================
// TOUCH BUTTONS (CENTERED HIGHER)
function drawTouchButtons() {
  fill(100,150);
  noStroke();

  // higher on the screen
  const y0 = height - margin - TOUCH_BTN_SIZE*4;
  const x0 = width/2 - TOUCH_BTN_SIZE*1.5;

  // Up
  rect(x0 + TOUCH_BTN_SIZE, y0, TOUCH_BTN_SIZE, TOUCH_BTN_SIZE, 10);
  // Left
  rect(x0, y0 + TOUCH_BTN_SIZE, TOUCH_BTN_SIZE, TOUCH_BTN_SIZE, 10);
  // Down
  rect(x0 + TOUCH_BTN_SIZE, y0 + TOUCH_BTN_SIZE, TOUCH_BTN_SIZE, TOUCH_BTN_SIZE, 10);
  // Right
  rect(x0 + TOUCH_BTN_SIZE*2, y0 + TOUCH_BTN_SIZE, TOUCH_BTN_SIZE, TOUCH_BTN_SIZE, 10);
}

function getTouchDirection(tx, ty) {
  const y0 = height - margin - TOUCH_BTN_SIZE*4;
  const x0 = width/2 - TOUCH_BTN_SIZE*1.5;

  if (tx>x0+TOUCH_BTN_SIZE && tx<x0+TOUCH_BTN_SIZE*2 && ty>y0 && ty<y0+TOUCH_BTN_SIZE) return {x:0,y:-1};
  if (tx>x0 && tx<x0+TOUCH_BTN_SIZE && ty>y0+TOUCH_BTN_SIZE && ty<y0+TOUCH_BTN_SIZE*2) return {x:-1,y:0};
  if (tx>x0+TOUCH_BTN_SIZE && tx<x0+TOUCH_BTN_SIZE*2 && ty>y0+TOUCH_BTN_SIZE && ty<y0+TOUCH_BTN_SIZE*2) return {x:0,y:1};
  if (tx>x0+TOUCH_BTN_SIZE*2 && tx<x0+TOUCH_BTN_SIZE*3 && ty>y0+TOUCH_BTN_SIZE && ty<y0+TOUCH_BTN_SIZE*2) return {x:1,y:0};

  return null;
}

function touchStarted() {
  let dir = getTouchDirection(touches[0].x, touches[0].y);
  if(dir) touchMoveDir = dir;
  else touchMoveDir = null;
  return false;
}

function touchMoved() {
  let dir = getTouchDirection(touches[0].x, touches[0].y);
  if(dir) touchMoveDir = dir;
  else touchMoveDir = null;
  return false;
}

function touchEnded() {
  touchMoveDir = null;
  return false;
}

// ==========================
// UI
function drawUI(){
  noStroke();
  
  // Speed indicator at top left
  let barX = 20;
  let barY = 20;
  let barWidth = 180;
  let barHeight = 24;
  
  // Calculate fill amount (0 to 1)
  let speedPercent = (currentSpeed - MIN_SPEED) / (MAX_SPEED - MIN_SPEED);
  let fillWidth = barWidth * speedPercent;
  
  // Draw bar background (dark gray)
  fill(50);
  stroke(255);
  strokeWeight(2);
  rect(barX, barY, barWidth, barHeight, 4);
  
  // Draw three colored sections as background guides
  noStroke();
  // Red zone (0-33%)
  fill(200, 50, 50, 100);
  rect(barX, barY, barWidth / 3, barHeight, 4, 0, 0, 4);
  // Yellow zone (33-66%)
  fill(200, 200, 50, 100);
  rect(barX + barWidth / 3, barY, barWidth / 3, barHeight);
  // Green zone (66-100%)
  fill(50, 200, 50, 100);
  rect(barX + barWidth * 2 / 3, barY, barWidth / 3, barHeight, 0, 4, 4, 0);
  
  // Draw filled portion (brighter color based on current zone)
  noStroke();
  if (speedPercent < 0.33) {
    fill(255, 100, 100); // Bright red
  } else if (speedPercent < 0.66) {
    fill(255, 255, 100); // Bright yellow
  } else {
    fill(100, 255, 100); // Bright green
  }
  rect(barX, barY, fillWidth, barHeight, 4);
  
  // Draw divider lines at 33% and 66%
  stroke(255);
  strokeWeight(1);
  line(barX + barWidth / 3, barY, barX + barWidth / 3, barY + barHeight);
  line(barX + barWidth * 2 / 3, barY, barX + barWidth * 2 / 3, barY + barHeight);
  
  // Draw speed text below bar
  noStroke();
  fill(255);
  textSize(14);
  textAlign(LEFT, TOP);
  text(`Speed: ${nf(currentSpeed, 1, 1)}x`, barX, barY + barHeight + 6);
  
  // Timer display at top center
  let minutes = floor(timerSeconds / 60);
  let seconds = timerSeconds % 60;
  let timeText = `${nf(minutes, 2)}:${nf(seconds, 2)}`;
  
  textAlign(CENTER, TOP);
  
  // Urgency effect when timer <= 15 seconds
  if (timerSeconds <= 15 && timerSeconds > 0) {
    // Red color for urgency
    fill(255, 0, 0);
    // Pulsing effect using sine wave
    let pulse = sin(millis() * 0.005) * 8; // oscillates between -8 and +8
    textSize(64 + pulse);
  } else {
    fill(255);
    textSize(64);
  }
  
  text(timeText, width / 2, 20);
  
  // Total score below timer
  fill(255);
  textSize(32);
  text(`Score: ${collectedCount}`, width / 2, 90);
  
  // Reset text alignment
  textAlign(LEFT, BASELINE);
  
  // Game over screen
  if (gameOver) {
    fill(255, 0, 0);
    textSize(64);
    textAlign(CENTER, CENTER);
    text("TIME'S UP!", width / 2, height / 2 - 50);
    
    fill(255);
    textSize(32);
    text(`Final Score: ${collectedCount}`, width / 2, height / 2 + 20);
    text("Press R or click to restart", width / 2, height / 2 + 60);
    
    textAlign(LEFT, BASELINE); // Reset alignment
  }
}

// ==========================
// START MENU
function drawStartMenu() {
  background(25);
  
  fill(255);
  textAlign(CENTER, CENTER);
  
  // Title
  textSize(72);
  text("Food Collector", width / 2, height / 4);
  
  textSize(32);
  text("Choose Your Difficulty", width / 2, height / 4 + 80);
  
  // Draw difficulty buttons
  let buttonWidth = 280;
  let buttonHeight = 100;
  let spacing = 30;
  let startY = height / 2 - 50;
  
  let difficulties = ['easy', 'medium', 'hard'];
  let colors = [
    [100, 200, 100],  // Green for easy
    [200, 200, 100],  // Yellow for medium
    [200, 100, 100]   // Red for hard
  ];
  let keys = ['1', '2', '3'];
  
  for (let i = 0; i < difficulties.length; i++) {
    let difficulty = difficulties[i];
    let settings = difficultySettings[difficulty];
    let y = startY + i * (buttonHeight + spacing);
    let x = width / 2;
    
    // Check if mouse is hovering
    let isHovering = mouseX > x - buttonWidth/2 && mouseX < x + buttonWidth/2 &&
                     mouseY > y - buttonHeight/2 && mouseY < y + buttonHeight/2;
    
    // Button background
    if (isHovering) {
      fill(colors[i][0], colors[i][1], colors[i][2], 200);
    } else {
      fill(colors[i][0], colors[i][1], colors[i][2], 120);
    }
    stroke(255);
    strokeWeight(3);
    rect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 10);
    
    // Button text
    noStroke();
    fill(255);
    textSize(36);
    text(settings.name, x, y - 20);
    
    textSize(16);
    text(settings.description, x, y + 15);
    text(`Press ${keys[i]}`, x, y + 35);
  }
  
  // Instructions
  textSize(20);
  fill(200);
  text("Click a button or press 1, 2, or 3 to start", width / 2, height - 60);
  
  textAlign(LEFT, BASELINE);
}

// ==========================
// GAME STATE MANAGEMENT
function startGame(difficulty) {
  selectedDifficulty = difficulty;
  gameStarted = true;
  gameOver = false;
  
  // Reset game state
  collectedCount = 0;
  entities = [];
  appleSpawnedGrid = {};
  
  // Apply difficulty settings
  currentSpeed = difficultySettings[difficulty].initialSpeed;
  
  // Reset timer
  timerSeconds = 30;
  lastSecondUpdate = millis();
  
  // Initialize player position
  player.x = width / 2;
  player.y = height / 2;
  player.vx = 0;
  player.vy = 0;
  
  // Spawn initial items
  spawnApples(true);
}

function restartGame() {
  gameStarted = false;
  gameOver = false;
  selectedDifficulty = null;
  touchMoveDir = null;
}

// ==========================
// INPUT HANDLERS
function keyPressed() {
  // Menu selection
  if (!gameStarted && !gameOver) {
    if (key === '1') startGame('easy');
    else if (key === '2') startGame('medium');
    else if (key === '3') startGame('hard');
  }
  
  // Restart
  if (gameOver && (key === 'r' || key === 'R')) {
    restartGame();
  }
}

function mousePressed() {
  // Restart from game over
  if (gameOver) {
    restartGame();
    return;
  }
  
  // Menu button clicks
  if (!gameStarted) {
    let buttonWidth = 280;
    let buttonHeight = 100;
    let spacing = 30;
    let startY = height / 2 - 50;
    let x = width / 2;
    
    let difficulties = ['easy', 'medium', 'hard'];
    for (let i = 0; i < difficulties.length; i++) {
      let y = startY + i * (buttonHeight + spacing);
      if (mouseX > x - buttonWidth/2 && mouseX < x + buttonWidth/2 &&
          mouseY > y - buttonHeight/2 && mouseY < y + buttonHeight/2) {
        startGame(difficulties[i]);
        return;
      }
    }
  }
}
