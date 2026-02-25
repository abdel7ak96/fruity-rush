// ==========================
// MENU SYSTEM MODULE
// ==========================

/**
 * Helper function to draw wrapped text
 * @param {string} txt - Text to wrap
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} maxWidth - Maximum width before wrapping
 * @param {number} lineHeight - Height between lines
 * @returns {number} - Height of rendered text block
 */
function drawWrappedText(txt, x, y, maxWidth, lineHeight) {
  let words = txt.split(' ');
  let line = '';
  let currentY = y;
  let lines = 0;
  
  for (let i = 0; i < words.length; i++) {
    let testLine = line + words[i] + ' ';
    let testWidth = textWidth(testLine);
    
    if (testWidth > maxWidth && i > 0) {
      text(line, x, currentY);
      line = words[i] + ' ';
      currentY += lineHeight;
      lines++;
    } else {
      line = testLine;
    }
  }
  text(line, x, currentY);
  lines++;
  
  return lines * lineHeight;
}

/**
 * Draw the welcome screen with game rules and credits
 * @param {number} screenWidth - Screen width
 * @param {number} screenHeight - Screen height
 */
function drawWelcomeScreen(screenWidth, screenHeight) {
  background(25);
  
  // Responsive sizing
  let isMobile = screenWidth < 600;
  let contentWidth = isMobile ? screenWidth * 0.9 : min(screenWidth * 0.8, 700);
  let margin = (screenWidth - contentWidth) / 2;
  
  // Responsive text sizes
  let titleSize = isMobile ? min(screenWidth * 0.12, 50) : 72;
  let subtitleSize = isMobile ? 18 : 24;
  let headerSize = isMobile ? 22 : 28;
  let bodySize = isMobile ? 16 : 20;
  let smallSize = isMobile ? 14 : 18;
  let ctaSize = isMobile ? 20 : 28;
  
  // Calculate content height and apply scroll
  let contentHeight = isMobile ? 1200 : 900;
  let maxScroll = max(0, contentHeight - screenHeight + 150);
  welcomeScrollOffset = constrain(welcomeScrollOffset, -maxScroll, 0);
  
  // Enable scrolling viewport
  push();
  translate(0, welcomeScrollOffset);
  
  fill(255);
  textAlign(CENTER, CENTER);
  
  // Title
  textSize(titleSize);
  text("Fruity Rush", screenWidth / 2, isMobile ? 60 : 100);
  
  // Tagline
  textSize(subtitleSize);
  fill(200);
  let taglineY = isMobile ? 100 : 150;
  drawWrappedText("Collect fruits before time runs out!", screenWidth / 2, taglineY, contentWidth, subtitleSize * 1.4);
  
  // Game Mechanics Section
  let currentY = isMobile ? 160 : 220;
  let lineHeight = bodySize * 1.6;
  
  textSize(headerSize);
  fill(255);
  text("How to Play:", screenWidth / 2, currentY);
  currentY += headerSize * 1.5;
  
  // Healthy items explanation
  textAlign(LEFT, TOP);
  textSize(bodySize);
  fill(100, 200, 100);
  text("🍎 Healthy Items:", margin, currentY);
  currentY += lineHeight;
  
  fill(200);
  textSize(smallSize);
  currentY += drawWrappedText("  • Add 5 seconds to your timer", margin, currentY, contentWidth, lineHeight);
  currentY += drawWrappedText("  • Increase your speed by 0.5x", margin, currentY, contentWidth, lineHeight);
  currentY += drawWrappedText("  • Add 1 point to your score", margin, currentY, contentWidth, lineHeight);
  currentY += lineHeight * 0.5;
  
  // Junky items explanation
  textSize(bodySize);
  fill(200, 100, 100);
  text("🍔 Junky Items:", margin, currentY);
  currentY += lineHeight;
  
  fill(200);
  textSize(smallSize);
  currentY += drawWrappedText("  • Subtract 5 seconds from your timer", margin, currentY, contentWidth, lineHeight);
  currentY += drawWrappedText("  • Decrease your speed by 0.5x", margin, currentY, contentWidth, lineHeight);
  currentY += drawWrappedText("  • Add 1 point to your score", margin, currentY, contentWidth, lineHeight);
  currentY += lineHeight;
  
  // Game objective
  textAlign(CENTER, TOP);
  textSize(bodySize);
  fill(255);
  currentY += drawWrappedText("⏱️  You start with 30 seconds. Game ends when time runs out!", screenWidth / 2, currentY, contentWidth, lineHeight);
  currentY += lineHeight;
  
  // Controls
  textSize(smallSize);
  fill(200, 200, 100);
  currentY += drawWrappedText("🎮 Controls: ZQSD or Arrow Keys to move  •  Touch controls supported", screenWidth / 2, currentY, contentWidth, lineHeight * 0.9);
  currentY += lineHeight * 1.2;
  
  // Credits
  textSize(smallSize);
  fill(180);
  currentY += drawWrappedText("Made with ❤️ by Abdelhak RAHMOUNI & Maxime ATZA", screenWidth / 2, currentY, contentWidth, lineHeight);
  
  pop();
  
  // Call to action (fixed at bottom, no scroll)
  textAlign(CENTER, CENTER);
  textSize(ctaSize);
  let pulseAlpha = 150 + sin(millis() * 0.003) * 100;
  fill(100, 200, 100, pulseAlpha);
  let ctaText = isMobile ? "Tap or swipe to continue" : "Click anywhere or press SPACE to continue";
  drawWrappedText(ctaText, screenWidth / 2, screenHeight - (isMobile ? 40 : 60), contentWidth * 0.9, ctaSize * 1.2);
  
  // Scroll indicator (only show if content is scrollable)
  if (maxScroll > 0) {
    fill(100, 200, 100, 100);
    textSize(12);
    text("↕️ Scroll for more", screenWidth / 2, screenHeight - (isMobile ? 80 : 100));
  }
  
  textAlign(LEFT, BASELINE);
}

/**
 * Draw the start menu with difficulty selection
 * @param {number} screenWidth - Screen width
 * @param {number} screenHeight - Screen height
 */
function drawStartMenu(screenWidth, screenHeight) {
  background(25);
  
  // Responsive sizing
  let isMobile = screenWidth < 600;
  let titleSize = isMobile ? min(screenWidth * 0.12, 50) : 72;
  let subtitleSize = isMobile ? min(screenWidth * 0.06, 24) : 32;
  let buttonTextSize = isMobile ? min(screenWidth * 0.055, 28) : 36;
  let buttonDescSize = isMobile ? min(screenWidth * 0.028, 14) : 16;
  let instructionSize = isMobile ? min(screenWidth * 0.035, 18) : 20;
  
  fill(255);
  textAlign(CENTER, CENTER);
  
  // Title
  textSize(titleSize);
  text("Fruity Rush", screenWidth / 2, screenHeight / 6);
  
  textSize(subtitleSize);
  text("Choose Your Difficulty", screenWidth / 2, screenHeight / 4);
  
  // Draw difficulty buttons with responsive sizing
  let buttonWidth = min(screenWidth * 0.85, 380);
  let buttonHeight = min(screenHeight * 0.12, 100);
  let spacing = isMobile ? 20 : 30;
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
    textSize(buttonTextSize);
    text(settings.name, x, y - buttonHeight * 0.15);
    
    textSize(buttonDescSize);
    text(settings.description, x, y + buttonHeight * 0.1);
    text(`Press ${keys[i]}`, x, y + buttonHeight * 0.3);
  }
  
  // Instructions
  textSize(instructionSize);
  fill(200);
  text("Click a button or press 1, 2, or 3 to start", screenWidth / 2, screenHeight - (isMobile ? 40 : 20));
  
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
  // Use same responsive sizing as drawStartMenu
  let isMobile = screenWidth < 600;
  let buttonWidth = min(screenWidth * 0.85, 380);
  let buttonHeight = min(screenHeight * 0.12, 100);
  let spacing = isMobile ? 20 : 30;
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
