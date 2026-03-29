class RectCollider extends Collider {
  constructor(worldX, worldY, width, height, bounciness = 1) {
    super(worldX, worldY, bounciness);
    this.width = width;
    this.height = height;
  }

  collidesWith(ball) {
    let closest = this.getClosestPoint(ball);
    return dist(ball.worldPosition.x, ball.worldPosition.y, closest.x, closest.y) < ball.radius;
  }

  getNormal(ball) {
    let closest = this.getClosestPoint(ball);
    let d = dist(ball.worldPosition, closest);

    // Ball center is outside the rectangle
    if (d > 0.0001) {
      return sub(ball.worldPosition, closest).normalize();
    }

    // Ball center is inside the rectangle, so find the closest edge and create normal pointing to it
    let distLeft = ball.worldPosition.x - (this.worldPosition.x - this.width / 2);
    let distRight = this.worldPosition.x + this.width / 2 - ball.worldPosition.x;
    let distTop = ball.worldPosition.y - (this.worldPosition.y - this.height / 2);
    let distBottom = this.worldPosition.y + this.height / 2 - ball.worldPosition.y;
    let minDist = Math.min(distLeft, distRight, distTop, distBottom);

    if (minDist === distLeft) return createVector(-1, 0);
    if (minDist === distRight) return createVector(1, 0);
    if (minDist === distTop) return createVector(0, -1);
    return createVector(0, 1);
  }

  correctPosition(ball, normal) {
    let closest = this.getClosestPoint(ball);
    let d = p5.Vector.dist(ball.worldPosition, closest);

    let overlap;
    if (d > 0.0001) {
      // Ball center is outside the rectangle
      overlap = ball.radius - d;
    } else {
      // Ball center is inside the rectangle
      let distLeft = ball.worldPosition.x - (this.worldPosition.x - this.width / 2);
      let distRight = this.worldPosition.x + this.width / 2 - ball.worldPosition.x;
      let distTop = ball.worldPosition.y - (this.worldPosition.y - this.height / 2);
      let distBottom = this.worldPosition.y + this.height / 2 - ball.worldPosition.y;

      // The overlap is distance to closest edge + ball radius
      overlap = Math.min(distLeft, distRight, distTop, distBottom) + ball.radius;
    }

    ball.worldPosition.add(p5.Vector.mult(normal, overlap));
  }

  getClosestPoint(ball) {
    return createVector(
      constrain(ball.worldPosition.x, this.worldPosition.x - this.width / 2, this.worldPosition.x + this.width / 2),
      constrain(ball.worldPosition.y, this.worldPosition.y - this.height / 2, this.worldPosition.y + this.height / 2)
    );
  }
}
