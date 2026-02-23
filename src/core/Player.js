// ==========================
// PLAYER CLASS
// ==========================

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.size = DRAW_WIDTH;
    this.lastDir = "down";
    this.animFrame = 0;
    this.animTimer = 0;
  }
  
  /**
   * Update player movement based on input
   * @param {number} inputX - Horizontal input (-1 to 1)
   * @param {number} inputY - Vertical input (-1 to 1)
   * @param {number} speed - Current movement speed
   */
  update(inputX, inputY, speed) {
    // Normalize input
    let mag = sqrt(inputX * inputX + inputY * inputY);
    if (mag > 0) {
      inputX /= mag;
      inputY /= mag;
    }
    
    let targetVX = inputX * speed;
    let targetVY = inputY * speed;
    
    this.vx = lerp(this.vx, targetVX, ACCEL_LERP);
    this.vy = lerp(this.vy, targetVY, ACCEL_LERP);
    
    this.x += this.vx;
    this.y += this.vy;
    
    if (mag > 0) {
      this.lastDir = getDirection(inputX, inputY, this.lastDir);
    }
  }
  
  /**
   * Draw the player with animated sprites
   * @param {object} spriteSheets - Object containing idle and walk sprite sheets
   */
  draw(spriteSheets) {
    let state = (abs(this.vx) > 0.1 || abs(this.vy) > 0.1) ? "walk" : "idle";
    let dir = (state === "idle") ? this.lastDir : getDirection(this.vx, this.vy, this.lastDir);
    let img = spriteSheets[state][dir];
    
    if (!img) {
      // Fallback if image not found
      fill("blue");
      circle(this.x, this.y, DRAW_WIDTH);
      return;
    }
    
    let framesPerRow = img.width / FRAME_WIDTH;
    playSpriteAnimation(img, this, framesPerRow, this.x, this.y, DRAW_WIDTH, DRAW_HEIGHT);
  }
  
  /**
   * Reset player to initial position
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  reset(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.lastDir = "down";
    this.animFrame = 0;
    this.animTimer = 0;
  }
}
