// ==========================
// MENU SYSTEM MODULE
// ==========================

/**
 * Draw the start menu with difficulty selection
 * @param {number} screenWidth - Screen width
 * @param {number} screenHeight - Screen height
 */
function drawStartMenu(screenWidth, screenHeight) {
  background(25);
  
  fill(255);
  textAlign(CENTER, CENTER);
  
  // Title
  textSize(72);
  text("Food Collector", screenWidth / 2, screenHeight / 4);
  
  textSize(32);
  text("Choose Your Difficulty", screenWidth / 2, screenHeight / 4 + 80);
  
  // Draw difficulty buttons
  let buttonWidth = 280;
  let buttonHeight = 100;
  let spacing = 30;
  let startY = screenHeight / 2 - 50;
  
  let difficulties = ['easy', 'medium', 'hard'];
  let colors = [
    [100, 200, 100],  // Green for easy
    [200, 200, 100],  // Yellow for medium
    [200, 100, 100]   // Red for hard
  ];
  let keys = ['1', '2', '3'];
  
  for (let i = 0; i < difficulties.length; i++) {
    let difficulty = difficulties[i];
    let settings = DIFFICULTY_SETTINGS[difficulty];
    let y = startY + i * (buttonHeight + spacing);
    let x = screenWidth / 2;
    
    // Check if mouse is hovering
    let isHovering = mouseX > x - buttonWidth / 2 && mouseX < x + buttonWidth / 2 &&
                     mouseY > y - buttonHeight / 2 && mouseY < y + buttonHeight / 2;
    
    // Button background
    if (isHovering) {
      fill(colors[i][0], colors[i][1], colors[i][2], 200);
    } else {
      fill(colors[i][0], colors[i][1], colors[i][2], 120);
    }
    stroke(255);
    strokeWeight(3);
    rect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 10);
    
    // Button text
    noStroke();
    fill(255);
    textSize(36);
    text(settings.name, x, y - 20);
    
    textSize(16);
    text(settings.description, x, y + 15);
    text(`Press ${keys[i]}`, x, y + 35);
  }
  
  // Instructions
  textSize(20);
  fill(200);
  text("Click a button or press 1, 2, or 3 to start", screenWidth / 2, screenHeight - 60);
  
  textAlign(LEFT, BASELINE);
}

/**
 * Check if mouse click is on a difficulty button
 * @param {number} mouseX - Mouse X position
 * @param {number} mouseY - Mouse Y position
 * @param {number} screenWidth - Screen width
 * @param {number} screenHeight - Screen height
 * @returns {string|null} Difficulty level or null
 */
function checkMenuButtonClick(mouseX, mouseY, screenWidth, screenHeight) {
  let buttonWidth = 280;
  let buttonHeight = 100;
  let spacing = 30;
  let startY = screenHeight / 2 - 50;
  let x = screenWidth / 2;
  
  let difficulties = ['easy', 'medium', 'hard'];
  
  for (let i = 0; i < difficulties.length; i++) {
    let y = startY + i * (buttonHeight + spacing);
    if (mouseX > x - buttonWidth / 2 && mouseX < x + buttonWidth / 2 &&
        mouseY > y - buttonHeight / 2 && mouseY < y + buttonHeight / 2) {
      return difficulties[i];
    }
  }
  
  return null;
}
