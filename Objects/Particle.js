class Particle {
  MAX_VELOCITY_DEFAULT = 2;
  maxVelocity = this.MAX_VELOCITY_DEFAULT;
  velocity = createVector(0, 0);
  acceleration = createVector(0, 0); // Reusable vector to avoid creating new ones in the update function

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
  radius = 10;
  previousPosition;

  constructor(biomeHeight, cellSize, rows, cols, worldStartY, ballRadius) {
    this.biomeHeight = biomeHeight;
    this.cellSize = cellSize;
    this.rows = rows;
    this.cols = cols;
    this.worldStartY = worldStartY;

    this.position = createVector(random(width), random(biomeHeight + 100));
    this.worldCenterPos = createVector(this.position.x, this.position.y + this.worldStartY);
    this.previousPosition = this.position.copy();
    this.glowMaxGap = ballRadius; // Surprinsingly good value for the glow radius
    this.maxEnergy = this.ENERGY_PER_COLOR_LEVEL * (this.COLORS.length + 2);
  }

  draw(topY, buffer) {
    if (
      this.position.x + this.radius / 2 < 0 ||
      this.position.x - this.radius / 2 > width ||
      this.position.y + this.radius / 2 + topY < 0 ||
      this.position.y - this.radius / 2 + topY > height
    )
      return;

    let colorIndex = floor(this.energy / this.ENERGY_PER_COLOR_LEVEL);
    buffer.stroke(this.COLORS[constrain(colorIndex, 0, this.COLORS.length - 1)]);
    buffer.strokeWeight(this.radius);
    buffer.line(this.previousPosition.x, this.previousPosition.y, this.position.x, this.position.y);
  }

  update(flowField, circleColliders) {
    this.energy = max(this.energy - 1, 0);
    this.previousPosition = this.position.copy();

    // Apply flow field force
    let cellRow = floor(this.position.y / this.cellSize);
    let cellCol = floor(this.position.x / this.cellSize);
    cellRow = constrain(cellRow, 0, this.rows - 1);
    cellCol = constrain(cellCol, 0, this.cols - 1);

    let acceleration = this.acceleration.set(flowField[cellRow][cellCol].x, flowField[cellRow][cellCol].y);
    this.velocity.add(acceleration);
    this.velocity.limit(this.maxVelocity);
    this.position.add(this.velocity);
    this.worldCenterPos.set(this.position.x, this.position.y + this.worldStartY);

    for (let collider of circleColliders) {
      if (collider.worldCenterPos.y - 200 > this.worldCenterPos.y) continue; // Skip colliders far below the particle

      // Calculate distance between particle and collider
      let dx = this.worldCenterPos.x - collider.worldCenterPos.x;
      let dy = this.worldCenterPos.y - collider.worldCenterPos.y;
      let distToColliderSq = dx * dx + dy * dy;
      let glowMaxDist = collider.radius + this.glowMaxGap + this.radius;

      if (distToColliderSq >= glowMaxDist * glowMaxDist) continue;

      // Increase energy based on proximity
      let distToCollider = Math.sqrt(distToColliderSq);
      let proximityRatio = map(distToCollider, collider.radius, glowMaxDist, 1, 0, true);
      let newEnergy = proximityRatio ** 2 * this.maxEnergy;
      this.energy = max(this.energy, newEnergy);

      if (distToCollider > collider.radius + this.radius) continue;

      // Apply collision response to particle
      collider.handleCollision(this);
      this.position.set(this.worldCenterPos.x, this.worldCenterPos.y - this.worldStartY);
    }

    this.checkEdges();
  }

  reset() {
    this.position.x = random(width);
    this.position.y = this.biomeHeight + random(100);
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

  applyExplosionForce(fx, fy, boostRatio) {
    this.velocity.x += fx;
    this.velocity.y += fy;
    this.energy = min(this.maxEnergy, this.energy + this.maxEnergy * boostRatio);
  }
}
