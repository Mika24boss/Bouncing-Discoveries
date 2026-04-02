const ASPECT_RATIO = 0.7; // Smaller aspect ratio for a skinnier canvas
let paused = false;
let manager;

let rawTextCode;

function preload() {
  rawTextCode = loadStrings("Biomes/MatrixBiome.js");
  StartBiome.titleFont = loadFont("Assets/Bungee-Regular.ttf");
}

function setup() {
  colorMode(HSB);
  let canvasHeight = windowHeight;
  let canvasWidth = windowWidth;
  canvasWidth = min(canvasWidth, windowWidth);
  createCanvas(canvasWidth, canvasHeight);

  // Inject processed matrix text into the class so it can access it
  MatrixBiome.codeString = rawTextCode
    .join(" ")
    .replace(/\s+/g, " ") // Replace whitespaces of all length by a single space
    .replace(/\p{Emoji_Presentation}/gu, ""); // Remove emojis

  manager = new Manager();
}

function draw() {
  if (paused) return;
  manager.update();
  manager.drawScene();
}

function keyPressed() {
  manager.userInput();
  if (Manager.titleAnimFramesLeft > 0) return;

  let force = 10;
  switch (keyCode) {
    case 32: // Space key
      paused = !paused;
      break;
    case UP_ARROW:
    case 87: // W key
      manager.pushBall(0, -force);
      break;
    case DOWN_ARROW:
    case 83: // S key
      manager.pushBall(0, force);
      break;
    case RIGHT_ARROW:
    case 68: // D key
      manager.pushBall(force, 0);
      break;
    case LEFT_ARROW:
    case 65: // A key
      manager.pushBall(-force, 0);
      break;
  }
}

function mouseClicked() {
  manager.userInput();
}
