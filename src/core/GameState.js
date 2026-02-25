// ==========================
// GAME STATE CLASS
// ==========================

class GameState {
  constructor() {
    this.showWelcome = true;
    this.started = false;
    this.gameOver = false;
    this.selectedDifficulty = null;
    
    this.timerSeconds = 30;
    this.lastSecondUpdate = 0;
    
    this.score = 0;
    this.currentSpeed = DEFAULT_SPEED;
  }
  
  /**
   * Start a new game with selected difficulty
   * @param {string} difficulty - Difficulty level (easy, medium, hard)
   */
  startGame(difficulty) {
    this.selectedDifficulty = difficulty;
    this.started = true;
    this.gameOver = false;
    
    this.score = 0;
    this.currentSpeed = DIFFICULTY_SETTINGS[difficulty].initialSpeed;
    
    this.timerSeconds = 30;
    this.lastSecondUpdate = millis();
  }
  
  /**
   * Dismiss the welcome screen and show the menu
   */
  dismissWelcome() {
    this.showWelcome = false;
  }
  
  /**
   * Restart game (return to menu, skip welcome screen)
   */
  restartGame() {
    this.showWelcome = false;  // Skip welcome on restart
    this.started = false;
    this.gameOver = false;
    this.selectedDifficulty = null;
    this.score = 0;
    this.timerSeconds = 30;
    this.currentSpeed = DEFAULT_SPEED;
  }
  
  /**
   * Update countdown timer
   * @returns {boolean} True if game over (time ran out)
   */
  updateTimer() {
    if (this.gameOver) return false;
    
    let currentTime = millis();
    if (currentTime - this.lastSecondUpdate >= 1000) {
      this.timerSeconds--;
      this.lastSecondUpdate = currentTime;
      
      if (this.timerSeconds <= 0) {
        this.timerSeconds = 0;
        this.gameOver = true;
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Collect an item and update score, timer, and speed
   * @param {string} type - Item type ('healthy' or 'junky')
   */
  collectItem(type) {
    this.score++;
    
    if (type === 'healthy') {
      // Healthy items add time and increase speed
      this.timerSeconds += 5;
      this.currentSpeed = constrain(
        this.currentSpeed + SPEED_CHANGE_HEALTHY,
        MIN_SPEED,
        MAX_SPEED
      );
    } else {
      // Junky items subtract time and decrease speed
      this.timerSeconds -= 5;
      if (this.timerSeconds < 0) this.timerSeconds = 0;
      
      this.currentSpeed = constrain(
        this.currentSpeed - SPEED_CHANGE_JUNKY,
        MIN_SPEED,
        MAX_SPEED
      );
    }
  }
}
