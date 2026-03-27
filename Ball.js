class Ball {
  constructor(x, y) {
    this.worldPosition = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.radius = 40;
    this.currentRenderer = null;
  }

  update(gravity, maxVelocity) {
    this.velocity.y += gravity;
    this.velocity.limit(maxVelocity);
    this.worldPosition.add(this.velocity);
  }

  applyForce(x, y) {
    this.velocity.add(createVector(x, y));
  }
}