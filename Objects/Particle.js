class Particle {
  MAX_VELOCITY_DEFAULT = 2;
  MAX_VELOCITY_DEVIATION = 5;
  maxVelocity = this.MAX_VELOCITY_DEFAULT;
  velocity = createVector(0, 0);
  acceleration = createVector(0, 0); // Reusable vector to avoid creating new ones in the update function

  SIZE = 10;
  COLORS = [
    color(195, 100, 100),
    color(195, 90, 100),
    color(195, 75, 100),
    color(195, 60, 100),
    color(195, 45, 100),
    color(195, 30, 100),
  ];
  ENERGY_PER_COLOR_LEVEL = 42;
  energy = 0;
  previousPosition;
  forceToBall = createVector(0, 0); // Reusable vector to avoid creating new ones in the deviation force calculation

  constructor(biomeHeight, cellSize, rows, cols) {
    this.biomeHeight = biomeHeight;
    this.cellSize = cellSize;
    this.rows = rows;
    this.cols = cols;

    this.position = createVector(random(width), random(biomeHeight + 100));
    this.previousPosition = this.position.copy();
  }

  draw(topY, buffer) {
    if (
      this.position.x + this.SIZE / 2 < 0 ||
      this.position.x - this.SIZE / 2 > width ||
      this.position.y + this.SIZE / 2 + topY < 0 ||
      this.position.y - this.SIZE / 2 + topY > height
    )
      return;

    let colorIndex = floor(this.energy / this.ENERGY_PER_COLOR_LEVEL);
    buffer.stroke(this.COLORS[constrain(colorIndex, 0, this.COLORS.length - 1)]);
    buffer.strokeWeight(this.SIZE);
    buffer.line(this.previousPosition.x, this.previousPosition.y, this.position.x, this.position.y);
  }

  update(topY, flowField, ballBiomePosition, ballRadius) {
    this.energy = max(this.energy - 1, 0);
    this.previousPosition = this.position.copy();

    // this.velocity.mult(0.96); // Damping for smoother movement
    let cellRow = floor(this.position.y / this.cellSize);
    let cellCol = floor(this.position.x / this.cellSize);
    cellRow = constrain(cellRow, 0, this.rows - 1);
    cellCol = constrain(cellCol, 0, this.cols - 1);

    let acceleration = this.acceleration.set(flowField[cellRow][cellCol]);
    acceleration.add(this.calculateDeviationForce(ballBiomePosition, ballRadius));
    this.velocity.add(acceleration);
    this.velocity.limit(this.maxVelocity);
    this.position.add(this.velocity);

    this.checkEdges();
  }

  calculateDeviationForce(ballBiomePosition, ballRadius) {
    // Vector pointing from particle to ball
    this.forceToBall.set(ballBiomePosition.x - this.position.x, ballBiomePosition.y - this.position.y);
    let distanceSq = this.forceToBall.magSq();
    let maxDistance = ballRadius + this.SIZE;

    if (distanceSq > maxDistance * maxDistance) { // No deviation if particle is too far
      this.maxVelocity = this.MAX_VELOCITY_DEFAULT;
      return createVector(0, 0);
    }

    // Determine if the particle is moving towards the ball
    let particleDir = this.velocity.copy(); // Current direction of the particle
    let dotProduct = particleDir.dot(this.forceToBall);
    if (dotProduct <= 0) {
      // If dot product <= 0, the vectors aren't pointing in the same direction
      this.maxVelocity = this.MAX_VELOCITY_DEFAULT;
      return createVector(0, 0);
    }

    let ratio = dotProduct / (maxDistance * this.MAX_VELOCITY_DEFAULT);
    ratio = constrain(ratio, 0, 1);

    this.maxVelocity = this.MAX_VELOCITY_DEFAULT + ratio * (this.MAX_VELOCITY_DEVIATION - this.MAX_VELOCITY_DEFAULT);
    let maxEnergy = this.ENERGY_PER_COLOR_LEVEL * (this.COLORS.length + 2); // +2 to spend more time on the bright color
    let newEnergy = ratio * maxEnergy;
    this.energy = max(this.energy, newEnergy);

    // Deviate particle around ball
    let tangent = createVector(-this.forceToBall.y, this.forceToBall.x); // Rotates a vector 90 degrees counterclockwise (so it's turning clockwise around the ball)
    if (particleDir.dot(tangent) < 0) tangent.mult(-1); // If dot product > 0, the particle is moving in the clockwise direction like the tangent
    tangent.setMag(this.maxVelocity);
    return tangent;
  }

  reset() {
    this.position.x = random(width);
    this.position.y = this.biomeHeight;
    this.velocity = createVector(0, 0);
    this.previousPosition = this.position.copy();
  }

  checkEdges() {
    // If particle leaves the biome, mark it for reset
    let padding = 100;
    if (
      this.position.x > width + padding ||
      this.position.x < -padding ||
      this.position.y > this.biomeHeight + padding ||
      this.position.y < -padding
    ) {
      this.reset();
    }
  }
}
