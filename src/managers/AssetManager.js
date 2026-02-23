// ==========================
// ASSET MANAGER CLASS
// ==========================

class AssetManager {
  constructor() {
    this.spriteSheets = {};
    this.grassTiles = [];
    this.healthySprites = [];
    this.junkySprites = [];
  }
  
  /**
   * Preload all game assets
   * Must be called from p5's preload() function
   */
  preloadAll() {
    // Load sprite sheets for player
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
      this.spriteSheets[state] = {};
      for (let dir in paths[state]) {
        this.spriteSheets[state][dir] = loadImage(paths[state][dir]);
      }
    }
    
    // Load grass tiles
    for (let i = 1; i <= 6; i++) {
      this.grassTiles.push(loadImage(`assets/floor/grass/grass0${i}.png`));
    }
    
    // Load healthy item sprites
    for (let i = 1; i <= 6; i++) {
      this.healthySprites.push(loadImage(`assets/objects/healthy/${i}.png`));
    }
    
    // Load junky item sprites
    for (let i = 1; i <= 5; i++) {
      this.junkySprites.push(loadImage(`assets/objects/junky/${i}.png`));
    }
  }
}
