class CircleCollider extends Collider {
  constructor(worldX, worldY, radius, bounciness = 1) {
    super(worldX, worldY, bounciness);
    this.radius = radius;
  }

  collidesWith(ball) {
    return (
      dist(ball.worldPosition.x, ball.worldPosition.y, this.worldPosition.x, this.worldPosition.y) <
      this.radius + ball.radius
    );
  }

  getNormal(ball) {
    // Normal points from collider center to ball center
    return p5.Vector.sub(ball.worldPosition, this.worldPosition).normalize();
  }

  correctPosition(ball, normal) {
    const overlap = (this.radius + ball.radius) - dist(ball.worldPosition.x, ball.worldPosition.y, this.worldPosition.x, this.worldPosition.y);
    ball.worldPosition.add(p5.Vector.mult(normal, overlap));
  }
}
