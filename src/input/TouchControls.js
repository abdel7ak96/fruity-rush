// ==========================
// TOUCH CONTROLS MODULE
// ==========================

/**
 * Draw touch control buttons (virtual D-pad)
 * @param {number} screenWidth - Screen width
 * @param {number} screenHeight - Screen height
 * @param {number} buttonSize - Button size
 * @param {number} margin - Margin size
 */
function drawTouchButtons(screenWidth, screenHeight, buttonSize, margin) {
  fill(100, 150);
  noStroke();
  
  // Position buttons higher on the screen
  const y0 = screenHeight - margin - buttonSize * 4;
  const x0 = screenWidth / 2 - buttonSize * 1.5;
  
  // Up
  rect(x0 + buttonSize, y0, buttonSize, buttonSize, 10);
  // Left
  rect(x0, y0 + buttonSize, buttonSize, buttonSize, 10);
  // Down
  rect(x0 + buttonSize, y0 + buttonSize, buttonSize, buttonSize, 10);
  // Right
  rect(x0 + buttonSize * 2, y0 + buttonSize, buttonSize, buttonSize, 10);
}

/**
 * Get touch direction from touch coordinates
 * @param {number} tx - Touch X position
 * @param {number} ty - Touch Y position
 * @param {number} screenWidth - Screen width
 * @param {number} screenHeight - Screen height
 * @param {number} buttonSize - Button size
 * @param {number} margin - Margin size
 * @returns {object|null} Direction object {x, y} or null
 */
function getTouchDirection(tx, ty, screenWidth, screenHeight, buttonSize, margin) {
  const y0 = screenHeight - margin - buttonSize * 4;
  const x0 = screenWidth / 2 - buttonSize * 1.5;
  
  // Check Up button
  if (tx > x0 + buttonSize && tx < x0 + buttonSize * 2 && 
      ty > y0 && ty < y0 + buttonSize) {
    return {x: 0, y: -1};
  }
  
  // Check Left button
  if (tx > x0 && tx < x0 + buttonSize && 
      ty > y0 + buttonSize && ty < y0 + buttonSize * 2) {
    return {x: -1, y: 0};
  }
  
  // Check Down button
  if (tx > x0 + buttonSize && tx < x0 + buttonSize * 2 && 
      ty > y0 + buttonSize && ty < y0 + buttonSize * 2) {
    return {x: 0, y: 1};
  }
  
  // Check Right button
  if (tx > x0 + buttonSize * 2 && tx < x0 + buttonSize * 3 && 
      ty > y0 + buttonSize && ty < y0 + buttonSize * 2) {
    return {x: 1, y: 0};
  }
  
  return null;
}
