class RectCollider extends Collider {
  constructor(worldCenterX, worldCenterY, halfWidth, halfHeight, bounciness = 1, angle = 0) {
    super(worldCenterX, worldCenterY, bounciness);
    this.hw = halfWidth;
    this.hh = halfHeight;
    this.angle = angle;
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
    let local = this.toLocal(ball.worldCenterPos);
    let distLeft = local.x + this.hw;
    let distRight = this.hw - local.x;
    let distTop = local.y + this.hh;
    let distBottom = this.hh - local.y;
    let minDist = Math.min(distLeft, distRight, distTop, distBottom);

    let localNormal;
    if (minDist === distLeft) localNormal = createVector(-1, 0);
    else if (minDist === distRight) localNormal = createVector(1, 0);
    else if (minDist === distTop) localNormal = createVector(0, -1);
    else localNormal = createVector(0, 1);

    return this.toWorld(localNormal);
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
      let local = this.toLocal(ball.worldCenterPos);
      let distLeft = local.x + this.hw;
      let distRight = this.hw - local.x;
      let distTop = local.y + this.hh;
      let distBottom = this.hh - local.y;
      let minEdgeDist = Math.min(distLeft, distRight, distTop, distBottom);

      // The overlap is distance to closest edge + ball radius
      overlap = minEdgeDist + ball.radius;
    }

    ball.worldCenterPos.add(p5.Vector.mult(normal, overlap));
  }

  // Rotate a world-space point into the rect's local space
  toLocal(worldPoint) {
    let dx = worldPoint.x - this.worldCenterPos.x;
    let dy = worldPoint.y - this.worldCenterPos.y;
    let cos = Math.cos(-this.angle);
    let sin = Math.sin(-this.angle);
    return createVector(cos * dx - sin * dy, sin * dx + cos * dy);
  }

  // Rotate a local-space vector back into world space
  toWorld(localVec) {
    let cos = Math.cos(this.angle);
    let sin = Math.sin(this.angle);
    return createVector(cos * localVec.x - sin * localVec.y, sin * localVec.x + cos * localVec.y);
  }

  getClosestPoint(ball) {
    let local = this.toLocal(ball.worldCenterPos);
    let localClosest = createVector(constrain(local.x, -this.hw, this.hw), constrain(local.y, -this.hh, this.hh));
    return p5.Vector.add(this.worldCenterPos, this.toWorld(localClosest));
  }
}
