// ==========================
// CAMERA CLASS
// ==========================

class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
  }
  
  /**
   * Update camera to follow player
   * @param {object} player - Player object with x, y properties
   * @param {number} screenWidth - Screen width
   * @param {number} screenHeight - Screen height
   */
  update(player, screenWidth, screenHeight) {
    this.x = floor(player.x - screenWidth / 2);
    this.y = floor(player.y - screenHeight / 2);
  }
}
