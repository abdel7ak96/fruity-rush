// ==========================
// ENTITY MANAGER CLASS
// ==========================

class EntityManager {
  constructor() {
    this.entities = [];
    this.spawnedGrid = {};
  }
  
  /**
   * Spawn entities in viewport using Perlin noise for natural clustering
   * @param {Camera} camera - Camera object
   * @param {number} screenWidth - Screen width
   * @param {number} screenHeight - Screen height
   * @param {string} difficulty - Difficulty level (easy, medium, hard)
   */
  spawnInViewport(camera, screenWidth, screenHeight, difficulty) {
    let startX = floor((camera.x - TILE_RENDER_MARGIN) / APPLE_GRID_STEP);
    let endX = ceil((camera.x + screenWidth + TILE_RENDER_MARGIN) / APPLE_GRID_STEP);
    let startY = floor((camera.y - TILE_RENDER_MARGIN) / APPLE_GRID_STEP);
    let endY = ceil((camera.y + screenHeight + TILE_RENDER_MARGIN) / APPLE_GRID_STEP);
    
    for (let i = startX; i <= endX; i++) {
      for (let j = startY; j <= endY; j++) {
        let key = i + "_" + j;
        if (this.spawnedGrid[key]) continue;
        
        // Use perlin noise to create natural clustering
        let noiseValue = noise(i * 0.08, j * 0.08);
        let noiseValue2 = noise(i * 0.2 + 100, j * 0.2 + 100);
        let density = (noiseValue * 0.7 + noiseValue2 * 0.3);
        
        // Determine how many items to spawn in this cell
        let itemCount = 0;
        let thresholds = DIFFICULTY_SETTINGS[difficulty].densityThresholds;
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
          let offsetX = random(-APPLE_GRID_STEP / 2.5, APPLE_GRID_STEP / 2.5);
          let offsetY = random(-APPLE_GRID_STEP / 2.5, APPLE_GRID_STEP / 2.5);
          
          // Randomly choose item type with perlin noise influence
          let typeNoise = noise(i * 0.15 + n * 10, j * 0.15 + n * 10);
          let itemType;
          let healthyThreshold = DIFFICULTY_SETTINGS[difficulty].healthyRatio;
          if (typeNoise < healthyThreshold) {
            itemType = 'junky';
          } else {
            itemType = 'healthy';
          }
          
          // Randomly choose variation based on type
          let variation = (itemType === 'healthy') ? floor(random(6)) : floor(random(5));
          
          this.entities.push({
            x: i * APPLE_GRID_STEP + APPLE_GRID_STEP / 2 + offsetX,
            y: j * APPLE_GRID_STEP + APPLE_GRID_STEP / 2 + offsetY,
            size: ENTITY_SIZE,
            type: itemType,
            variation: variation,
            collected: false
          });
        }
        
        // Reset random seed for other game systems
        randomSeed(millis());
        
        this.spawnedGrid[key] = true;
      }
    }
  }
  
  /**
   * Check for collisions between player and entities
   * @param {Player} player - Player object
   * @returns {Array} Array of collected entities {type, variation}
   */
  checkCollisions(player) {
    let collected = [];
    
    for (let e of this.entities) {
      if (!e.collected) {
        let distance = dist(player.x, player.y, e.x, e.y);
        let collisionRadius = (player.size / 2 + e.size / 2) * 0.6;
        
        if (distance < collisionRadius) {
          e.collected = true;
          collected.push({type: e.type, variation: e.variation});
        }
      }
    }
    
    return collected;
  }
  
  /**
   * Clean up collected items far from player
   * @param {Player} player - Player object
   */
  cleanup(player) {
    this.entities = this.entities.filter(e => {
      if (!e.collected) return true;
      let dist = sqrt(pow(e.x - player.x, 2) + pow(e.y - player.y, 2));
      return dist < CLEANUP_DISTANCE;
    });
  }
  
  /**
   * Draw all uncollected entities
   * @param {object} sprites - Object containing healthySprites and junkySprites arrays
   */
  draw(sprites) {
    imageMode(CENTER);
    for (let e of this.entities) {
      if (!e.collected) {
        let sprite = (e.type === 'healthy') 
          ? sprites.healthySprites[e.variation] 
          : sprites.junkySprites[e.variation];
        
        image(sprite, e.x, e.y, e.size, e.size);
      }
    }
  }
  
  /**
   * Reset entity manager
   */
  reset() {
    this.entities = [];
    this.spawnedGrid = {};
  }
}
