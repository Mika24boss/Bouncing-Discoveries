class MatrixBiome extends Biome {
  static codeString = "";
  ballEmoji = "";
  ballEmojis = ["⚪", "🟣", "🔵", "🟢", "🟡", "🟠", "🔴"];

  fontSize = 18;
  gapLine = 25;
  streamFontSize = 24;

  constructor(worldStartY) {
    super(
      worldStartY,
      3000, // biomeHeight
      50, // startOverlapHeight
      100, // startHeight
      100, // endHeight
      0.2, // gravity
      2 // maxVelocity
    );

    this.codeString = MatrixBiome.codeString;
    let { wrappedLines, textBlockHeight } = this.wrapCharacters();
    this.wrappedLines = wrappedLines;
    this.textBlockHeight = textBlockHeight;
    this.linesPerScreen = ceil(height / this.gapLine) + 1;
    this.ballEmoji = random(this.ballEmojis);

    this.streams = [];
    let columnWidth = 30; // The smaller, the more streams we have
    for (let x = 0; x < width; x += columnWidth) {
      this.streams.push({
        x: x,
        y: random(-500, this.biomeHeight),
        speed: random(2, 8),
        symbols: this.generateSymbols(floor(random(8, 20))),
        switchInterval: floor(random(1, 3)),
      });
    }
  }

  setBall(ball) {
    this.ball = ball;
    let ballEffectRadiusMult = map(width, 1920, 2560, 3, 2.25, true);
    let ballEffectStrengthMult = map(width, 1920, 2560, 1.4, 1.25, true);
    this.ballEffectRadius = ballEffectRadiusMult * ball.radius;
    this.ballEffectStrength = ballEffectStrengthMult * ball.radius;
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

    let ballScreenX = this.ball.worldCenterPos.x;
    let ballScreenY = this.ball.worldCenterPos.y - this.worldStartY + topY;

    for (let lineIndex = 0; lineIndex < this.linesPerScreen; lineIndex++) {
      let bottomLineY = firstY + lineIndex * this.gapLine;
      let midLineY = bottomLineY - this.fontSize / 2;

      let textBlockIndex = (nbLinesAboveScreen + lineIndex) % this.wrappedLines.length;
      let lineText = this.wrappedLines[textBlockIndex];

      // Print the text normally if the ball isn't near this line
      if (
        midLineY < ballScreenY - this.ballEffectRadius ||
        midLineY > ballScreenY + this.ballEffectRadius
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
        let d = dist(charX, charY, ballScreenX, ballScreenY);
        let force = map(d, 0, this.ballEffectRadius, this.ballEffectStrength, 0); // Stronger when closer
        charX += ((charX - ballScreenX) / d) * force;
        charY += ((charY - ballScreenY) / d) * force;
        text(char, charX - charWidth / 2, charY + this.fontSize / 2);
        currentX += charWidth;
      }

      fill(136, 100, 78); // Normal matrix green
      text(afterText, currentX, bottomLineY);
    }
    pop();
  }

  drawBodyFG(topY) {
    this.drawMatrixRain(topY);
    this.drawScanLines(topY);
  }

  drawStartFG(topY) {
    push();
    colorMode(RGB);
    let pastelblue = color(115, 220, 255);
    let darkblue = color(4, 74, 214);
    let neongreen = color(0, 199, 53, 200);
    strokeWeight(2);

    let gradientHeight = this.startHeight + this.startOverlapHeight;
    for (let i = 0; i < gradientHeight; i++) {
      let mergeColor = lerpColor(pastelblue, darkblue, i / gradientHeight);
      mergeColor = lerpColor(mergeColor, neongreen, i / gradientHeight);
      stroke(mergeColor);
      line(0, topY + i - this.startOverlapHeight, width, topY + i - this.startOverlapHeight);
    }
    colorMode(HSB);
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
    let goodGuess = floor((this.ball.worldCenterPos.x / width) * lineText.length);
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
    let ballScreenY = this.ball.worldCenterPos.y - this.worldStartY + topY;
    let dx = this.ball.worldCenterPos.x - charMiddleX;
    let dy = ballScreenY - midLineY;
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

  generateSymbols(len) {
    let symbols = [];
    for (let i = 0; i < len; i++) {
      symbols.push(String.fromCharCode(0x30a0 + floor(random(96))));
    }
    return symbols;
  }

  drawMatrixRain(topY) {
    push();
    textFont("Courier");
    textSize(this.streamFontSize);
    textStyle(BOLD);
    textAlign(CENTER, TOP);

    for (let stream of this.streams) {
      let nbSymbols = stream.symbols.length;

      stream.y += stream.speed;
      if (stream.y > this.biomeHeight + this.streamFontSize * nbSymbols) stream.y = -500; // Reset to a random position above the screen

      for (let symbol = 0; symbol < nbSymbols; symbol++) {
        let symbolY = topY + stream.y - symbol * this.streamFontSize;

        if (symbolY < topY - 50 || symbolY > topY + this.biomeHeight + 50) continue;

        if (symbol === 0) {
          fill(120, 30, 100);
        } else {
          let fade = map(symbol, 0, nbSymbols, 100, 20);
          fill(120, 100, fade, 0.8);
        }

        // Randomly switch characters at intervals
        if (frameCount % stream.switchInterval === 0 && random() > 0.95) {
          stream.symbols[symbol] = String.fromCharCode(0x30a0 + floor(random(96)));
        }

        text(stream.symbols[symbol], stream.x, symbolY);
      }
    }
    pop();
  }

  drawScanLines(topY) {
    push();
    // Static horizontal lines
    stroke(0, 0, 100, 0.4);
    strokeWeight(2);
    for (let y = 0; y < this.biomeHeight; y += 6) {
      line(0, topY + y, width, topY + y);
    }
    noStroke();

    // Use frameCount to move a bar down the screen
    let scanlineY = (frameCount * 8) % this.biomeHeight;
    let shadowY = max(topY + scanlineY - 100, topY);

    // Green scanline
    fill(136, 100, 50, 0.25);
    rect(0, topY + scanlineY, width, 100);
    // Darker shadow bar
    fill(0, 0, 0, 0.1);
    rect(0, shadowY, width, 50);

    scanlineY = (frameCount * 8 + this.biomeHeight / 2) % this.biomeHeight;
    shadowY = max(topY + scanlineY - 100, topY);
    fill(136, 100, 50, 0.25);
    rect(0, topY + scanlineY, width, 100);
    fill(0, 0, 0, 0.1);
    rect(0, shadowY, width, 50);
    pop();
  }
}
