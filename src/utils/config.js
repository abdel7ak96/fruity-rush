// ==========================
// CONFIGURATION & CONSTANTS
// ==========================

// World Settings
const WORLD_SIZE = 4000;
const ACCEL_LERP = 0.15; // normal acceleration

// Speed System
const MIN_SPEED = 2.5;
const MAX_SPEED = 6.5;
const DEFAULT_SPEED = 4.5;
const SPEED_CHANGE_HEALTHY = 0.5; // speed increase per healthy item
const SPEED_CHANGE_JUNKY = 0.5;   // speed decrease per junky item

// Sprite Dimensions
const FRAME_WIDTH = 48;
const FRAME_HEIGHT = 64;
const DRAW_WIDTH = 192;
const DRAW_HEIGHT = 256;

// Tile & Entity Settings
const TILE_SIZE = 64;
const TILE_RENDER_MARGIN = TILE_SIZE * 2;
const ENTITY_SIZE = 48;
const APPLE_GRID_STEP = 240; // distance between apples
const SPAWN_ITEMS_PER_CELL = 3; // max items per grid cell
const CLEANUP_DISTANCE = 2000; // remove collected items beyond this distance

// UI Settings
const TOUCH_BTN_SIZE_RATIO = 0.12; // % of smaller screen dimension

// Difficulty Settings
const DIFFICULTY_SETTINGS = {
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
