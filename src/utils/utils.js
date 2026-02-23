// ==========================
// UTILITY FUNCTIONS
// ==========================

/**
 * Get direction string based on velocity vector (8-directional)
 * @param {number} vx - Horizontal velocity
 * @param {number} vy - Vertical velocity
 * @param {string} currentDir - Current direction (fallback)
 * @returns {string} Direction string (down, up, left_down, right_down, left_up, right_up)
 */
function getDirection(vx, vy, currentDir = "down") {
  const THRESH = 0.3;
  
  if (vy > THRESH && abs(vx) < THRESH) return "down";
  if (vy < -THRESH && abs(vx) < THRESH) return "up";
  if (vx < -THRESH && vy > THRESH) return "left_down";
  if (vx > THRESH && vy > THRESH) return "right_down";
  if (vx < -THRESH && vy < -THRESH) return "left_up";
  if (vx > THRESH && vy < -THRESH) return "right_up";
  if (vx > THRESH && abs(vy) < THRESH) return "right_down";
  if (vx < -THRESH && abs(vy) < THRESH) return "left_down";
  
  return currentDir;
}

/**
 * Play a sprite sheet animation
 * @param {p5.Image} img - Sprite sheet image
 * @param {object} entity - Entity with animTimer and animFrame properties
 * @param {number} framesPerRow - Number of frames in the sprite sheet
 * @param {number} x - X position to draw
 * @param {number} y - Y position to draw
 * @param {number} w - Width to draw
 * @param {number} h - Height to draw
 */
function playSpriteAnimation(img, entity, framesPerRow, x, y, w, h) {
  entity.animTimer++;
  if (entity.animTimer >= 6) {
    entity.animTimer = 0;
    entity.animFrame++;
    if (entity.animFrame >= framesPerRow) {
      entity.animFrame = 0;
    }
  }
  
  let sx = entity.animFrame * FRAME_WIDTH;
  let sy = 0;
  let offsetY = h - DRAW_HEIGHT / FRAME_HEIGHT * FRAME_HEIGHT;
  
  imageMode(CENTER);
  image(img, x, y - offsetY / 2, w, h, sx, sy, FRAME_WIDTH, FRAME_HEIGHT);
}
