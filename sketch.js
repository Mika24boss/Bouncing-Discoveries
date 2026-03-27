const MARGIN = 5;

let codeString = "";
let yPos = 0;
let scrollSpeed = 2;
let fontSize = 18;
let gapLine = 25;
let rawTextCode;

function preload() {
  rawTextCode = loadStrings("code.txt");
}

function setup() {
  let canvasWidth = windowWidth - 2 * MARGIN;
  let canvasHeight = windowHeight - 2 * MARGIN;
  createCanvas(canvasWidth, canvasHeight);

  if (rawTextCode) codeString = rawTextCode.join("").replace(/\s+/g, ""); // Remove all whitespace

  colorMode(HSB);
  textFont("Courier");
  textSize(fontSize);
  textStyle(BOLD);
  textLeading(gapLine);
  textAlign(LEFT);
  calculateCharacterWrap();
}

function windowResized() {
  let canvasWidth = windowWidth - 2 * MARGIN;
  let canvasHeight = windowHeight - 2 * MARGIN;
  resizeCanvas(canvasWidth, canvasHeight);
  calculateCharacterWrap();
}

function calculateCharacterWrap() {
  wrappedLines = [];
  let currentLine = "";

  for (let i = 0; i < codeString.length; i++) {
    let char = codeString[i];
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
    while (textWidth(currentLine + codeString[charIndex % codeString.length]) <= width) {
      currentLine += codeString[charIndex % codeString.length];
      charIndex++;
    }
    wrappedLines.push(currentLine);
  }

  textBlockHeight = wrappedLines.length * gapLine;
}

function draw() {
  background(0);
  fill(140, 255, 170);

  yPos -= scrollSpeed;
  if (yPos <= -textBlockHeight) yPos = 0; // Reset to the top once the entire block has scrolled through

  // Draw the text block many times
  let startY = yPos;
  while (startY < height) {
    for (let i = 0; i < wrappedLines.length; i++) {
      let lineY = startY + i * gapLine;

      // Only draw lines that are actually visible on screen
      if (lineY + gapLine > 0 && lineY < height + gapLine) {
        text(wrappedLines[i], 0, lineY);
      }
    }
    startY += textBlockHeight;
  }
}
