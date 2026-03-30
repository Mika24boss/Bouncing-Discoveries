class CircleCollider extends Collider {
  constructor(worldCenterX, worldCenterY, radius, bounciness = 1) {
    super(worldCenterX, worldCenterY, bounciness);
    this.radius = radius;
  }

  collidesWith(ball) {
    return (
      dist(ball.worldCenterPos.x, ball.worldCenterPos.y, this.worldCenterPos.x, this.worldCenterPos.y) <
      this.radius + ball.radius
    );
  }

  getNormal(ball) {
    // Normal points from collider center to ball center
    return p5.Vector.sub(ball.worldCenterPos, this.worldCenterPos).normalize();
  }

  correctPosition(ball, normal) {
    const overlap = (this.radius + ball.radius) - dist(ball.worldCenterPos.x, ball.worldCenterPos.y, this.worldCenterPos.x, this.worldCenterPos.y);
    ball.worldCenterPos.add(p5.Vector.mult(normal, overlap));
  }
}
