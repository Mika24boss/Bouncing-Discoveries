class MatrixBiome extends Biome {
  static codeString = "";
  ballEmoji = "";
  ballEmojis = ["⚪", "🟣", "🔵", "🟢", "🟡", "🟠", "🔴"];

  fontSize = 18;
  gapLine = 25;

  constructor(worldStartY) {
    super(
      worldStartY,
      5000, // biomeHeight
      50, // startOverlapHeight
      200, // startHeight
      200, // endHeight
      0.5, // gravity
      2 // maxVelocity
    );

    this.codeString = MatrixBiome.codeString;
    let { wrappedLines, textBlockHeight } = this.wrapCharacters();
    this.wrappedLines = wrappedLines;
    this.textBlockHeight = textBlockHeight;
    this.ballEmoji = random(this.ballEmojis);
  }

  drawBodyBG(topY) {
    push();
    // Use a rectangle as the background for the main body of the biome
    fill(0);
    noStroke();
    rect(0, topY, width, this.biomeHeight);

    textFont("Courier");
    textSize(this.fontSize);
    textStyle(BOLD);
    textLeading(this.gapLine);
    textAlign(LEFT);
    fill(136, 100, 78);

    if (frameCount % 3 === 0) {
      let lineIdx = floor(random(this.wrappedLines.length));
      let charIdx = floor(random(this.wrappedLines[lineIdx].length));
      // Replace a character in the string
      let chars = this.wrappedLines[lineIdx].split('');
      chars[charIdx] = String.fromCharCode(0x30A0 + random(96)); // Katakana range
      this.wrappedLines[lineIdx] = chars.join('');
    }

    // Draw the text block many times
    let startY = topY + this.startHeight;
    while (startY < topY + this.biomeHeight) {
      for (let i = 0; i < this.wrappedLines.length; i++) {
        let lineY = startY + i * this.gapLine;

        // Only draw lines that are actually visible on screen
        if (lineY + this.gapLine > 0 && lineY <= topY + this.biomeHeight) {
          text(this.wrappedLines[i], 0, lineY);
        }
      }
      startY += this.textBlockHeight;
    }

    // Static horizontal lines
    push();
    stroke(0, 0, 100, 0.3);
    strokeWeight(1);
    for (let y = 0; y < this.biomeHeight; y += 3) {
      line(0, topY + y, width, topY + y);
    }

    // Refresh bar
    noStroke();
    // Use frameCount to move a bar down the screen
    let scanlineY = (frameCount * 8) % this.biomeHeight;
    fill(136, 100, 50, 0.25);
    rect(0, topY + scanlineY, width, 100);

    // Darker shadow bar right behind it
    fill(0, 0, 0, 0.1);
    rect(0, topY + scanlineY - 100, width, 50);
    pop();

    scanlineY = (frameCount * 8 + this.biomeHeight / 2) % this.biomeHeight;
    fill(136, 100, 50, 0.25);
    rect(0, topY + scanlineY, width, 100);
    fill(0, 0, 0, 0.1);
    rect(0, topY + scanlineY - 100, width, 50);
    pop();

    pop();
  }

  drawStartBG(topY) {
    this.drawSectionShape(topY, this.startHeight, true);
  }

  drawEndBG(topY) {
    this.drawSectionShape(topY, this.endHeight, false);
  }

  drawBall(screenX, screenY, radius) {
    push();
    textSize(radius * 2);
    textAlign(CENTER, CENTER);
    text(this.ballEmoji, screenX, screenY + radius / 7);
    pop();
  }

  drawSectionShape(topY, sectionHeight, isStart) {
    fill(150, 100, 30, 100);
    noStroke();
    beginShape();
    if (isStart) {
      vertex(0, topY - this.startOverlapHeight);
      vertex(width, topY);
      vertex(width, topY + sectionHeight);
      vertex(0, topY + sectionHeight);
    } else {
      const endTopY = topY + this.biomeHeight - this.endHeight;
      vertex(0, endTopY);
      vertex(width, endTopY + sectionHeight / 2);
      vertex(width, endTopY + sectionHeight);
      vertex(0, endTopY + sectionHeight);
    }
    endShape(CLOSE);
  }

  wrapCharacters() {
    let wrappedLines = [];
    let currentLine = "";

    for (let i = 0; i < this.codeString.length; i++) {
      let char = this.codeString[i];
      let testLine = currentLine + char;

      // If adding this character exceeds the width, start a new line
      if (textWidth(testLine) > width) {
        wrappedLines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }

    // Add any remaining characters as the last line
    if (currentLine.length > 0) {
      let charIndex = 0;
      // Keep adding characters from the start of the code until the line is full
      while (textWidth(currentLine + this.codeString[charIndex % this.codeString.length]) <= width) {
        currentLine += this.codeString[charIndex % this.codeString.length];
        charIndex++;
      }
      wrappedLines.push(currentLine);
    }

    let textBlockHeight = wrappedLines.length * this.gapLine;
    return {
      wrappedLines,
      textBlockHeight,
    };
  }
}
