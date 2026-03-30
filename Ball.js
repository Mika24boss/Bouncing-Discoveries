class Ball {
  constructor(worldCenterX, worldCenterY, totalWorldHeight) {
    this.worldCenterPos = createVector(worldCenterX, worldCenterY);
    this.velocity = createVector(0, 0);
    this.radius = 40;
    this.currentRenderer = null;
    this.totalWorldHeight = totalWorldHeight;
  }

  update(gravity, maxVelocity) {
    this.velocity.y += gravity;
    this.velocity.limit(maxVelocity);
    this.worldCenterPos.add(this.velocity);
  }

  applyForce(x, y) {
    this.velocity.add(createVector(x, y));
  }

  checkWorldEdges(bounciness = 1) {
    // Top border
    if (this.worldCenterPos.y - this.radius < 0) {
      this.worldCenterPos.y = this.radius;
      this.velocity.y *= -bounciness;
    }
    // Bottom border
    if (this.worldCenterPos.y + this.radius > this.totalWorldHeight) {
      this.worldCenterPos.y = this.totalWorldHeight - this.radius;
      this.velocity.y *= -bounciness;
    }
    // Left edge
    if (this.worldCenterPos.x - this.radius < 0) {
      this.worldCenterPos.x = this.radius;
      this.velocity.x *= -bounciness;
    }
    // Right edge
    if (this.worldCenterPos.x + this.radius > width) {
      this.worldCenterPos.x = width - this.radius;
      this.velocity.x *= -bounciness;
    }
  }
}