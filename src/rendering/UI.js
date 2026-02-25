// ==========================
// UI MODULE
// ==========================

/**
 * Draw the speed indicator bar
 * @param {number} currentSpeed - Current speed value
 */
function drawSpeedBar(currentSpeed) {
  // Responsive sizing
  let barWidth = min(width * 0.25, 180);
  let barHeight = min(height * 0.03, 24);
  let barX = min(width * 0.025, 20);
  let barY = min(height * 0.025, 20);
  let textSize_speed = min(width * 0.02, 14);
  
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
  textSize(textSize_speed);
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
  
  // Responsive sizing
  let timerSize = min(width * 0.08, height * 0.08, 64);
  
  textAlign(CENTER, TOP);
  
  // Urgency effect when timer <= 15 seconds
  if (seconds <= 15 && seconds > 0) {
    // Red color for urgency
    fill(255, 0, 0);
    // Pulsing effect using sine wave
    let pulse = sin(millis() * 0.005) * (timerSize * 0.125); // Scale pulse with size
    textSize(timerSize + pulse);
  } else {
    fill(255);
    textSize(timerSize);
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
  // Responsive sizing
  let scoreSize = min(width * 0.04, height * 0.04, 32);
  
  fill(255);
  textSize(scoreSize);
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
  // Responsive sizing
  let titleSize = min(screenWidth * 0.1, screenHeight * 0.08, 64);
  let textSize_gameOver = min(screenWidth * 0.05, screenHeight * 0.04, 32);
  
  fill(255, 0, 0);
  textSize(titleSize);
  textAlign(CENTER, CENTER);
  text("TIME'S UP!", screenWidth / 2, screenHeight / 2 - titleSize * 0.8);
  
  fill(255);
  textSize(textSize_gameOver);
  text(`Final Score: ${score}`, screenWidth / 2, screenHeight / 2 + textSize_gameOver * 0.6);
  text("Press R or click to restart", screenWidth / 2, screenHeight / 2 + textSize_gameOver * 1.9);
}

/**
 * Draw the volume slider
 * @param {number} x - X position (top-left corner)
 * @param {number} y - Y position (top-left corner)
 * @param {number} w - Width of slider
 * @param {number} h - Height of slider
 * @param {number} volume - Current volume (0.0 to 1.0)
 */
function drawVolumeSlider(x, y, w, h, volume) {
  // Responsive sizing already handled by caller in sketch.js
  // Check if mouse is hovering over slider
  let isHovering = mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
  
  // Draw background bar
  fill(50);
  stroke(255);
  strokeWeight(2);
  rect(x, y, w, h, 4);
  
  // Draw filled portion (volume indicator)
  let fillWidth = w * volume;
  noStroke();
  if (isHovering) {
    fill(100, 150, 255); // Blue highlight on hover
  } else {
    fill(100, 200, 100); // Green fill
  }
  rect(x, y, fillWidth, h, 4);
  
  // Draw volume icon/label (scale with slider height)
  fill(255);
  textSize(max(h * 0.6, 10));
  textAlign(LEFT, TOP);
  noStroke();
  text("🔊", x, y + h + 4);
}

/**
 * Check if mouse/touch is interacting with volume slider
 * @param {number} mx - Mouse/touch X coordinate
 * @param {number} my - Mouse/touch Y coordinate
 * @param {number} sliderX - Slider X position
 * @param {number} sliderY - Slider Y position
 * @param {number} sliderW - Slider width
 * @param {number} sliderH - Slider height
 * @returns {number|null} Volume value (0.0-1.0) or null if outside slider
 */
function checkVolumeSliderInteraction(mx, my, sliderX, sliderY, sliderW, sliderH) {
  // Check if coordinates are within slider bounds
  if (mx >= sliderX && mx <= sliderX + sliderW && my >= sliderY && my <= sliderY + sliderH) {
    // Calculate volume based on X position
    let volume = (mx - sliderX) / sliderW;
    return constrain(volume, 0.0, 1.0);
  }
  return null;
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
