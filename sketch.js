// ==========================
// CONFIG
// ==========================
let WORLD_SIZE = 4000;
let MOVE_SPEED = 4.5;     // normal movement speed
let ACCEL_LERP = 0.15;    // normal acceleration
let SHOOT_COOLDOWN = 350;

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
let bullets = [];
let cameraX = 0;
let cameraY = 0;

let touchMoveDir = null;
let lastShotTime = 0;
let isShootLocked = false;

let spriteSheets = {};
let grassTiles = [];

let entities = [];
let collectedCount = 0;
let appleSprite;
let bananaSprites = [];
let sodaSprites = [];

let appleSpawnedGrid = {};

// Timer variables
let timerSeconds = 30;
let lastSecondUpdate = 0;
let gameOver = false;

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

  appleSprite = loadImage("assets/objects/apple/apple.png");
  bananaSprites.push(loadImage("assets/objects/banana/banana-1.png"));
  bananaSprites.push(loadImage("assets/objects/banana/banana-2.png"));
  sodaSprites.push(loadImage("assets/objects/soda/soda-1.png"));
  sodaSprites.push(loadImage("assets/objects/soda/soda-2.png"));
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

  // Initialize timer
  timerSeconds = 30;
  lastSecondUpdate = millis();
  gameOver = false;

  spawnApples(true); // initial spawn
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
    updateShootLock();
    updateMovement();
  }
  updateCamera();

  push();
  translate(-cameraX, -cameraY);

  drawGrass();
  spawnApples(false);
  drawEntities();
  drawPlayer();
  updateBullets();

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
      let itemCount = 0;
      if (density > 0.7) {
        itemCount = SPAWN_ITEMS_PER_CELL; // Dense cluster
      } else if (density > 0.5) {
        itemCount = 2; // Medium density
      } else if (density > 0.3) {
        itemCount = 1; // Sparse
      }
      
      // Use grid position as seed for deterministic randomness
      randomSeed(i * 1000 + j);
      
      // Spawn items in this grid cell
      for (let n = 0; n < itemCount; n++) {
        let offsetX = random(-APPLE_GRID_STEP/2.5, APPLE_GRID_STEP/2.5);
        let offsetY = random(-APPLE_GRID_STEP/2.5, APPLE_GRID_STEP/2.5);
        
        // Randomly choose item type with perlin noise influence
        let typeNoise = noise(i * 0.15 + n * 10, j * 0.15 + n * 10);
        let itemType;
        if (typeNoise < 0.4) {
          itemType = 'apple';
        } else if (typeNoise < 0.7) {
          itemType = 'banana';
        } else {
          itemType = 'soda';
        }
        
        // Randomly choose variation for banana/soda
        let variation = (itemType === 'banana' || itemType === 'soda') ? floor(random(2)) : 0;
        
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
      let sprite = appleSprite;
      if (e.type === 'banana') sprite = bananaSprites[e.variation];
      else if (e.type === 'soda') sprite = sodaSprites[e.variation];
      
      image(sprite, e.x, e.y, e.size, e.size);
      if (dist(player.x, player.y, e.x, e.y) < (player.size/2 + e.size/2)*0.6) {
        e.collected = true;
        collectedCount++;
        
        // Update timer based on item type
        if (e.type === 'apple' || e.type === 'banana') {
          timerSeconds += 5; // Healthy items add 5 seconds
        } else if (e.type === 'soda') {
          timerSeconds -= 5; // Junk food subtracts 5 seconds
          if (timerSeconds < 0) timerSeconds = 0;
        }
      }
    }
  }
}

// ==========================
// PLAYER
function updateShootLock() {
  if (isShootLocked && millis() - lastShotTime >= SHOOT_COOLDOWN) isShootLocked = false;
}

function updateMovement() {
  if (isShootLocked) { player.vx=0; player.vy=0; return; }

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

  let targetVX = inputX*MOVE_SPEED;
  let targetVY = inputY*MOVE_SPEED;

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
// BULLETS
function mousePressed(){ attemptShoot(mouseX+cameraX, mouseY+cameraY); }
function attemptShoot(x,y){ if(isShootLocked) return; shoot(x,y); }
function shoot(x,y){ lastShotTime=millis(); isShootLocked=true; player.vx=0; player.vy=0; let a=atan2(y-player.y,x-player.x); bullets.push({x:player.x,y:player.y,vx:cos(a)*12,vy:sin(a)*12}); }
function updateBullets(){ fill("yellow"); for(let b of bullets){ b.x+=b.vx; b.y+=b.vy; circle(b.x,b.y,10); } }

// ==========================
// UI
function drawUI(){
  noStroke();
  
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
    text("Refresh to restart", width / 2, height / 2 + 60);
    
    textAlign(LEFT, BASELINE); // Reset alignment
  }
}
