// ==========================
// UI MODULE
// ==========================

/**
 * Draw the speed indicator bar
 * @param {number} currentSpeed - Current speed value
 */
function drawSpeedBar(currentSpeed) {
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
}

/**
 * Draw the countdown timer
 * @param {number} seconds - Seconds remaining
 * @param {number} x - X position
 * @param {number} y - Y position
 */
function drawTimer(seconds, x, y) {
  let minutes = floor(seconds / 60);
  let secs = seconds % 60;
  let timeText = `${nf(minutes, 2)}:${nf(secs, 2)}`;
  
  textAlign(CENTER, TOP);
  
  // Urgency effect when timer <= 15 seconds
  if (seconds <= 15 && seconds > 0) {
    // Red color for urgency
    fill(255, 0, 0);
    // Pulsing effect using sine wave
    let pulse = sin(millis() * 0.005) * 8; // oscillates between -8 and +8
    textSize(64 + pulse);
  } else {
    fill(255);
    textSize(64);
  }
  
  text(timeText, x, y);
}

/**
 * Draw the score display
 * @param {number} score - Current score
 * @param {number} x - X position
 * @param {number} y - Y position
 */
function drawScore(score, x, y) {
  fill(255);
  textSize(32);
  textAlign(CENTER, TOP);
  text(`Score: ${score}`, x, y);
}

/**
 * Draw the game over screen
 * @param {number} score - Final score
 * @param {number} screenWidth - Screen width
 * @param {number} screenHeight - Screen height
 */
function drawGameOver(score, screenWidth, screenHeight) {
  fill(255, 0, 0);
  textSize(64);
  textAlign(CENTER, CENTER);
  text("TIME'S UP!", screenWidth / 2, screenHeight / 2 - 50);
  
  fill(255);
  textSize(32);
  text(`Final Score: ${score}`, screenWidth / 2, screenHeight / 2 + 20);
  text("Press R or click to restart", screenWidth / 2, screenHeight / 2 + 60);
}

/**
 * Draw all UI elements
 * @param {GameState} gameState - Game state object
 * @param {number} screenWidth - Screen width
 * @param {number} screenHeight - Screen height
 */
function drawUI(gameState, screenWidth, screenHeight) {
  noStroke();
  
  // Speed indicator at top left
  drawSpeedBar(gameState.currentSpeed);
  
  // Timer display at top center
  drawTimer(gameState.timerSeconds, screenWidth / 2, 20);
  
  // Total score below timer
  drawScore(gameState.score, screenWidth / 2, 90);
  
  // Reset text alignment
  textAlign(LEFT, BASELINE);
  
  // Game over screen
  if (gameState.gameOver) {
    drawGameOver(gameState.score, screenWidth, screenHeight);
    textAlign(LEFT, BASELINE); // Reset alignment
  }
}
