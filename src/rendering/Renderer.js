// ==========================
// RENDERER MODULE
// ==========================

/**
 * Draw grass tiles using Perlin noise for variety
 * @param {Array} grassTiles - Array of grass tile images
 * @param {Camera} camera - Camera object
 * @param {number} screenWidth - Screen width
 * @param {number} screenHeight - Screen height
 */
function drawGrass(grassTiles, camera, screenWidth, screenHeight) {
  noStroke();
  
  let startX = floor((camera.x - TILE_RENDER_MARGIN) / TILE_SIZE);
  let endX = ceil((camera.x + screenWidth + TILE_RENDER_MARGIN) / TILE_SIZE);
  let startY = floor((camera.y - TILE_RENDER_MARGIN) / TILE_SIZE);
  let endY = ceil((camera.y + screenHeight + TILE_RENDER_MARGIN) / TILE_SIZE);
  
  for (let i = startX; i <= endX; i++) {
    for (let j = startY; j <= endY; j++) {
      let worldX = floor(i * TILE_SIZE);
      let worldY = floor(j * TILE_SIZE);
      
      // Use Perlin noise to select tile variation
      let n = pow(noise(i * 0.15, j * 0.15), 1.5);
      let index = floor(map(n, 0, 1, 0, grassTiles.length - 1));
      index = constrain(index, 0, grassTiles.length - 1);
      
      imageMode(CORNER);
      image(grassTiles[index], worldX, worldY, TILE_SIZE, TILE_SIZE);
    }
  }
}
