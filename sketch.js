const ASPECT_RATIO = 0.7; // Smaller aspect ratio for a skinnier canvas
let paused = false;
let manager;
let pauseButtonCurrentlyPressed = false; // To pause
let startMusic;
let abstractMusic;
let matrixMusic;
let oceanMusic;
let spaceMusic;

let rawTextCode;

function preload() {
  rawTextCode = loadStrings("Biomes/MatrixBiome.js");
  StartBiome.titleFont = loadFont("Assets/Bungee-Regular.ttf");
  startMusic = loadSound("Assets/start.mp3");
  abstractMusic = loadSound("Assets/abstract.mp3");
  matrixMusic = loadSound("Assets/matrix.mp3");
  // oceanMusic = loadSound("Assets/ocean.mp3");
  // spaceMusic = loadSound("Assets/space.mp3");
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
  handleGamepad();
  if (paused) return;
  manager.update();
  manager.drawScene();
}

function keyPressed() {
  manager.userInput(true);
  if (Manager.state !== "PLAYING") return;

  let force = 10;
  switch (keyCode) {
    case 32: // Space key
      paused = !paused;
      manager.userInput(true, true);
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
  manager.userInput(true);
}

function handleGamepad() {
  let gamepads = navigator.getGamepads();
  let gp = gamepads[0];

  if (!gp) return;

  if (gp.buttons.slice(0, 4).some((btn) => btn.pressed)) manager.userInput(true); // Click any buttons to begin

  if (Manager.state !== "PLAYING") return;

  let force = 10;
  let deadzone = 0.25;

  let xAxis = gp.axes[0];
  let yAxis = gp.axes[1];

  let stickMag = xAxis * xAxis + yAxis * yAxis;
  if (stickMag > deadzone * deadzone) {
    manager.userInput();
    manager.pushBall(xAxis * force, yAxis * force);
  }

  let pausePressed = gp.buttons[9].pressed;
  if (pausePressed && !pauseButtonCurrentlyPressed) {
    paused = !paused;
    manager.userInput(false, true);
  }
  pauseButtonCurrentlyPressed = pausePressed;
}
