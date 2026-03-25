const MARGIN = 5;
let paused = false;

function setup() {
  colorMode(HSB);
  let canvasWidth = windowWidth - 2 * MARGIN;
  let canvasHeight = windowHeight - 2 * MARGIN;
  createCanvas(canvasWidth, canvasHeight);
}

function windowResized() {
  let canvasWidth = windowWidth - 2 * MARGIN;
  let canvasHeight = windowHeight - 2 * MARGIN;
  resizeCanvas(canvasWidth, canvasHeight);
}

function draw() {
  // Background gradient
  background(0);
  let darkblue = color(240, 100, 20);
  let marineblue = color(240, 100, 40);
  let lightblue = color(200, 100, 60);

  for (let i = 0; i < height; i++) {
    let mergeColor = lerpColor(darkblue, marineblue, i / height);
    mergeColor = lerpColor(mergeColor, lightblue, i / height);
    stroke(mergeColor);
    line(0, i, width, i);
  }
}

function keyPressed() {
  switch (keyCode) {
    case 32: // Space key
      paused = !paused;
      break;
  }
}
