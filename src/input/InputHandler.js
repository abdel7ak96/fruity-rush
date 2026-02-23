// ==========================
// INPUT HANDLER MODULE
// ==========================

/**
 * Get keyboard movement input
 * @returns {object} Input vector {x, y}
 */
function getMovementInput() {
  let inputX = 0;
  let inputY = 0;
  
  // Z or Up Arrow = move up
  if (keyIsDown(90) || keyIsDown(UP_ARROW)) inputY -= 1;
  
  // S or Down Arrow = move down
  if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) inputY += 1;
  
  // Q or Left Arrow = move left
  if (keyIsDown(81) || keyIsDown(LEFT_ARROW)) inputX -= 1;
  
  // D or Right Arrow = move right
  if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) inputX += 1;
  
  return {x: inputX, y: inputY};
}

/**
 * Handle menu key presses (1, 2, 3 for difficulty selection)
 * @returns {string|null} Difficulty level ('easy', 'medium', 'hard') or null
 */
function handleMenuKeyPress() {
  if (key === '1') return 'easy';
  if (key === '2') return 'medium';
  if (key === '3') return 'hard';
  return null;
}

/**
 * Handle restart key press (R key)
 * @returns {boolean} True if R was pressed
 */
function handleRestartKeyPress() {
  return (key === 'r' || key === 'R');
}
