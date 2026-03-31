class RectCollider extends Collider {
  constructor(worldCenterX, worldCenterY, halfWidth, halfHeight, bounciness = 1) {
    super(worldCenterX, worldCenterY, bounciness);
    this.hw = halfWidth;
    this.hh = halfHeight;
  }

  collidesWith(ball) {
    let closest = this.getClosestPoint(ball);
    let dx = ball.worldCenterPos.x - closest.x;
    let dy = ball.worldCenterPos.y - closest.y;
    let distSquared = dx * dx + dy * dy;
    return distSquared < ball.radius * ball.radius;
  }

  getNormal(ball) {
    let closest = this.getClosestPoint(ball);
    let dx = ball.worldCenterPos.x - closest.x;
    let dy = ball.worldCenterPos.y - closest.y;
    let distSquared = dx * dx + dy * dy;

    // Ball center is outside the rectangle
    if (distSquared > 0.0001) {
      let normalizeDenom = 1 / Math.sqrt(distSquared);
      return createVector(dx * normalizeDenom, dy * normalizeDenom);
    }

    // Ball center is inside the rectangle, so find the closest edge and create normal pointing to it
    let distLeft = ball.worldCenterPos.x - (this.worldCenterPos.x - this.hw);
    let distRight = this.worldCenterPos.x + this.hw - ball.worldCenterPos.x;
    let distTop = ball.worldCenterPos.y - (this.worldCenterPos.y - this.hh);
    let distBottom = this.worldCenterPos.y + this.hh - ball.worldCenterPos.y;
    let minDist = Math.min(distLeft, distRight, distTop, distBottom);

    if (minDist === distLeft) return createVector(-1, 0);
    if (minDist === distRight) return createVector(1, 0);
    if (minDist === distTop) return createVector(0, -1);
    return createVector(0, 1);
  }

  correctPosition(ball, normal) {
    let closest = this.getClosestPoint(ball);
    let dx = ball.worldCenterPos.x - closest.x;
    let dy = ball.worldCenterPos.y - closest.y;
    let distSquared = dx * dx + dy * dy;

    let overlap;
    if (distSquared > 0.0001) {
      // Ball center is outside the rectangle
      overlap = ball.radius - Math.sqrt(distSquared);
    } else {
      // Ball center is inside the rectangle
      let distLeft = ball.worldCenterPos.x - (this.worldCenterPos.x - this.hw);
      let distRight = this.worldCenterPos.x + this.hw - ball.worldCenterPos.x;
      let distTop = ball.worldCenterPos.y - (this.worldCenterPos.y - this.hh);
      let distBottom = this.worldCenterPos.y + this.hh - ball.worldCenterPos.y;

      // The overlap is distance to closest edge + ball radius
      overlap = Math.min(distLeft, distRight, distTop, distBottom) + ball.radius;
    }

    ball.worldCenterPos.add(p5.Vector.mult(normal, overlap));
  }

  getClosestPoint(ball) {
    return createVector(
      constrain(ball.worldCenterPos.x, this.worldCenterPos.x - this.hw, this.worldCenterPos.x + this.hw),
      constrain(ball.worldCenterPos.y, this.worldCenterPos.y - this.hh, this.worldCenterPos.y + this.hh)
    );
  }
}
