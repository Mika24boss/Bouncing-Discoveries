class Ball {
  constructor(worldX, worldY, totalWorldHeight) {
    this.worldPosition = createVector(worldX, worldY);
    this.velocity = createVector(0, 0);
    this.radius = 40;
    this.currentRenderer = null;
    this.totalWorldHeight = totalWorldHeight;
  }

  update(gravity, maxVelocity) {
    this.velocity.y += gravity;
    this.velocity.limit(maxVelocity);
    this.worldPosition.add(this.velocity);
  }

  applyForce(x, y) {
    this.velocity.add(createVector(x, y));
  }

  checkWorldEdges(bounciness = 1) {
    // Top border
    if (this.worldPosition.y - this.radius < 0) {
      this.worldPosition.y = this.radius;
      this.velocity.y *= -bounciness;
    }
    // Bottom border
    if (this.worldPosition.y + this.radius > this.totalWorldHeight) {
      this.worldPosition.y = this.totalWorldHeight - this.radius;
      this.velocity.y *= -bounciness;
    }
    // Left edge
    if (this.worldPosition.x - this.radius < 0) {
      this.worldPosition.x = this.radius;
      this.velocity.x *= -bounciness;
    }
    // Right edge
    if (this.worldPosition.x + this.radius > width) {
      this.worldPosition.x = width - this.radius;
      this.velocity.x *= -bounciness;
    }
  }
}