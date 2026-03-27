class MatrixBiome extends Biome {
  static startOverlapHeight = 50;
  static codeString = "";

  fontSize = 18;
  gapLine = 25;

  constructor(worldStartHeight) {
    super(
      worldStartHeight,
      10000, // biomeHeight
      MatrixBiome.startOverlapHeight,
      200, // startHeight
      200, // endHeight
      0.5, // gravity
      10 // maxVelocity
    );

    this.codeString = MatrixBiome.codeString;
    let { wrappedLines, textBlockHeight } = this.wrapCharacters();
    this.wrappedLines = wrappedLines;
    this.textBlockHeight = textBlockHeight;
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

    // Draw the text block many times
    let startY = topY;
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
    fill(180, 100, 100);
    stroke(255);
    strokeWeight(2);
    circle(screenX, screenY, radius * 2);
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
      vertex(width, endTopY + 50);
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
