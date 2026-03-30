const ASPECT_RATIO = 0.7; // Smaller aspect ratio for a skinnier canvas
let paused = false;
let manager;

let rawTextCode;

function preload() {
  rawTextCode = loadStrings("code.txt");
}

function setup() {
  colorMode(HSB);
  let canvasHeight = windowHeight;
  let canvasWidth = canvasHeight * ASPECT_RATIO;
  // let canvasWidth = windowWidth;
  canvasWidth = min(canvasWidth, windowWidth);
  createCanvas(canvasWidth, canvasHeight);

  // Inject processed matrix text into the class so it can access it
  MatrixBiome.codeString = rawTextCode.join("").replace(/\s+/g, ""); // Remove all whitespace
  
  manager = new Manager();
}

function draw() {
  if (paused) return;
  manager.update();
  manager.drawScene();
}

function keyPressed() {
  let force = 30;
  switch (keyCode) {
    case 32: // Space key
      paused = !paused;
      break;
    case UP_ARROW:
      manager.pushBall(0, -force);
      break;
    case RIGHT_ARROW:
      manager.pushBall(force, 0);
      break;
    case LEFT_ARROW:
      manager.pushBall(-force, 0);
      break;
  }
}
