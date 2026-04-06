class Ball {
  constructor(worldCenterX, worldCenterY) {
    this.worldCenterPos = createVector(worldCenterX, worldCenterY);
    this.velocity = createVector(0, 0);
    this.radius = max(0.016 * width, 25);
    this.radius = min(this.radius, 45);
    this.color = color(0, 0, 0);
  }

  setTotalWorldHeight(totalWorldHeight) {
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

  checkWorldEdges(sideBounciness = 0.95, verticalBounciness = 0.8, groundFriction = 0.9) {
    // Top border
    if (this.worldCenterPos.y - this.radius < 0) {
      this.worldCenterPos.y = this.radius;
      this.velocity.y *= -verticalBounciness;
    }
    // Bottom border
    if (this.worldCenterPos.y + this.radius > this.totalWorldHeight) {
      this.worldCenterPos.y = this.totalWorldHeight - this.radius;
      this.velocity.y *= -verticalBounciness;
      this.velocity.x *= groundFriction;
    }
    // Left edge
    if (this.worldCenterPos.x - this.radius < 0) {
      this.worldCenterPos.x = this.radius;
      this.velocity.x *= -sideBounciness;
    }
    // Right edge
    if (this.worldCenterPos.x + this.radius > width) {
      this.worldCenterPos.x = width - this.radius;
      this.velocity.x *= -sideBounciness;
    }
  }
}
