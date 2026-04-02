class MatrixBiome extends Biome {
  static codeString = "";
  ballEmoji = "";
  ballEmojis = ["⚪", "🟣", "🔵", "🟢", "🟡", "🟠", "🔴"];

  fontSize = 18;
  gapLine = 25;

  ballCenterPos = createVector(0, 0);
  ballEffectRadius = 90;
  ballEffectStrength = 50;

  constructor(worldStartY) {
    super(
      worldStartY,
      3000, // biomeHeight
      50, // startOverlapHeight
      100, // startHeight
      100, // endHeight
      0.5, // gravity
      2 // maxVelocity
    );

    this.codeString = MatrixBiome.codeString;
    let { wrappedLines, textBlockHeight } = this.wrapCharacters();
    this.wrappedLines = wrappedLines;
    this.textBlockHeight = textBlockHeight;
    this.linesPerScreen = ceil(height / this.gapLine) + 1;
    this.ballEmoji = random(this.ballEmojis);
  }

  update(ball, topY) {
    this.ballEffectRadius = 2.25 * ball.radius;
    this.ballEffectStrength = 1.25 * ball.radius;
    this.ballCenterPos = ball.worldCenterPos.copy().sub(0, this.worldStartY);
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
      let newChar = String.fromCharCode(0x30a0 + floor(random(96)));
      let line = this.wrappedLines[lineIdx];
      this.wrappedLines[lineIdx] = line.substring(0, charIdx) + newChar + line.substring(charIdx + 1);
    }

    // Draw the text block many times to fill the screen
    let nbLinesAboveScreen = topY < 0 ? floor(-topY / this.gapLine) : 0;
    let firstY = topY + this.gapLine * (nbLinesAboveScreen + 1);

    for (let lineIndex = 0; lineIndex < this.linesPerScreen; lineIndex++) {
      let bottomLineY = firstY + lineIndex * this.gapLine;
      let midLineY = bottomLineY - this.fontSize / 2;

      let textBlockIndex = (nbLinesAboveScreen + lineIndex) % this.wrappedLines.length;
      let lineText = this.wrappedLines[textBlockIndex];

      // Print the text normally if the ball isn't near this line
      if (
        midLineY < this.ballCenterPos.y + topY - this.ballEffectRadius ||
        midLineY > this.ballCenterPos.y + topY + this.ballEffectRadius
      ) {
        text(lineText, 0, bottomLineY);
        continue;
      }

      // Find the characters affected by the ball
      let { firstCharIndex, lastCharIndex } = this.findCharsNearBall(topY, lineText, midLineY);

      // Print the text before firstchar normally, then the affected chars with the wave effect, then the text after lastchar normally
      let beforeText = lineText.substring(0, firstCharIndex);
      let afterText = lineText.substring(lastCharIndex + 1);
      let affectedText = lineText.substring(firstCharIndex, lastCharIndex + 1);
      text(beforeText, 0, bottomLineY);
      let currentX = textWidth(beforeText);
      fill(136, 50, 100); // Bright green

      for (let i = 0; i < affectedText.length; i++) {
        let char = affectedText[i];
        let charWidth = textWidth(char);
        let charX = currentX + charWidth / 2;
        let charY = midLineY;
        let d = dist(charX, charY, this.ballCenterPos.x, this.ballCenterPos.y + topY);
        let force = map(d, 0, this.ballEffectRadius, this.ballEffectStrength, 0); // Stronger when closer
        charX += ((charX - this.ballCenterPos.x) / d) * force;
        charY += ((charY - this.ballCenterPos.y - topY) / d) * force;
        text(char, charX - charWidth / 2, charY + this.fontSize / 2);
        currentX += charWidth;
      }

      fill(136, 100, 78); // Normal matrix green
      text(afterText, currentX, bottomLineY);
    }

    pop();
  }

  drawBodyFG(topY) {
    // Static horizontal lines
    push();
    stroke(0, 0, 100, 0.4);
    strokeWeight(2);
    for (let y = 0; y < this.biomeHeight; y += 6) {
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

    scanlineY = (frameCount * 8 + this.biomeHeight / 2) % this.biomeHeight;
    fill(136, 100, 50, 0.25);
    rect(0, topY + scanlineY, width, 100);
    fill(0, 0, 0, 0.1);
    rect(0, topY + scanlineY - 100, width, 50);
    pop();
  }

  drawStartFG(topY) {
    push();
    fill(150, 100, 30);
    rect(0, topY - this.startOverlapHeight, width, this.startHeight + this.startOverlapHeight);
    pop();
  }

  drawEndFG(topY) {
    push();
    fill(150, 100, 30);
    rect(0, topY + this.biomeHeight - this.endHeight, width, this.endHeight);
    pop();
  }

  drawBall(screenX, screenY, radius) {
    push();
    textSize(radius * 2);
    textAlign(CENTER, CENTER);
    text(this.ballEmoji, screenX, screenY + radius / 7);
    pop();
  }

  reset() {
    let { wrappedLines, _ } = this.wrapCharacters();
    this.wrappedLines = wrappedLines;
    this.ballEmoji = random(this.ballEmojis);
  }

  wrapCharacters() {
    let wrappedLines = [];
    let currentLine = "";

    push();
    textFont("Courier");
    textSize(this.fontSize);
    textStyle(BOLD);

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
    pop();

    let textBlockHeight = wrappedLines.length * this.gapLine;
    return {
      wrappedLines,
      textBlockHeight,
    };
  }

  findCharsNearBall(topY, lineText, midLineY) {
    // Most characters have the same width in Courier, so we can use the ball's position to estimate the affected characters
    let goodGuess = floor((this.ballCenterPos.x / width) * lineText.length);
    let nearBall = this.isCharNearBall(topY, goodGuess, lineText, midLineY);

    // Sequential search isn't ideal, but in our case, the ball won't be far for the guess, so it should be fine
    if (nearBall) {
      let lastCharIndex = this.searchCharNearBall(topY, lineText, midLineY, goodGuess + 1, "right");
      let firstCharIndex = this.searchCharNearBall(topY, lineText, midLineY, goodGuess - 1, "left");

      return {
        firstCharIndex,
        lastCharIndex,
      };
    }

    // Didn't find a char near the ball at the good guess, so we need to search in both directions
    // Try going right first since Katakana characters are often wider
    let firstCharIndex = this.searchCharNearBall(
      topY,
      lineText,
      midLineY,
      goodGuess + 1,
      "right",
      "oh no, where da money at?"
    );

    if (firstCharIndex !== -1) {
      // Found the first char near the ball, now find the last char
      let lastCharIndex = this.searchCharNearBall(topY, lineText, midLineY, firstCharIndex + 1, "right");
      return {
        firstCharIndex,
        lastCharIndex,
      };
    }

    // Didn't find any chars near the ball going right, so try left
    let lastCharIndex = this.searchCharNearBall(
      topY,
      lineText,
      midLineY,
      goodGuess - 1,
      "left",
      "oh no, where da money at?"
    );

    if (lastCharIndex !== -1) {
      // Found the last char near the ball, now find the first char
      let firstCharIndex = this.searchCharNearBall(topY, lineText, midLineY, lastCharIndex - 1, "left");
      return {
        firstCharIndex,
        lastCharIndex,
      };
    }

    // No chars near the ball in either direction, something went wrong
    return {
      firstCharIndex: -1,
      lastCharIndex: -1,
    };
  }

  isCharNearBall(topY, charIndex, lineText, midLineY) {
    let charMiddleX = textWidth(lineText.substring(0, charIndex)) + textWidth(lineText[charIndex]) / 2;
    let dx = this.ballCenterPos.x - charMiddleX;
    let dy = this.ballCenterPos.y + topY - midLineY;
    let distanceSq = dx * dx + dy * dy;
    return distanceSq < this.ballEffectRadius * this.ballEffectRadius;
  }

  searchCharNearBall(topY, lineText, midLineY, startIndex, direction, goal = "where da money end?") {
    if (startIndex < 0) {
      return goal === "where da money end?" ? 0 : -1;
    } else if (startIndex >= lineText.length) {
      return goal === "where da money end?" ? lineText.length - 1 : -1;
    }

    let nearBall = this.isCharNearBall(topY, startIndex, lineText, midLineY);
    let nextIndex = direction === "right" ? startIndex + 1 : startIndex - 1;

    if (goal === "where da money end?") {
      if (!nearBall) return direction === "right" ? startIndex - 1 : startIndex + 1;
      else return this.searchCharNearBall(topY, lineText, midLineY, nextIndex, direction, goal);
    } else {
      if (nearBall) return startIndex;
      else return this.searchCharNearBall(topY, lineText, midLineY, nextIndex, direction, goal);
    }
  }
}
