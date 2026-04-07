class CircleCollider extends Collider {
  constructor(worldCenterX, worldCenterY, radius, bounciness = 1) {
    super(worldCenterX, worldCenterY, bounciness);
    this.radius = radius;
  }

  collidesWith(other) {
    let dx = other.worldCenterPos.x - this.worldCenterPos.x;
    let dy = other.worldCenterPos.y - this.worldCenterPos.y;
    let radiusSum = this.radius + other.radius;
    return dx * dx + dy * dy < radiusSum * radiusSum;
  }

  getNormal(other) {
    // Normal points from collider center to other's center
    return p5.Vector.sub(other.worldCenterPos, this.worldCenterPos).normalize();
  }

  correctPosition(other, normal) {
    const overlap =
      this.radius +
      other.radius -
      dist(other.worldCenterPos.x, other.worldCenterPos.y, this.worldCenterPos.x, this.worldCenterPos.y);
    other.worldCenterPos.add(p5.Vector.mult(normal, overlap));
  }
}
