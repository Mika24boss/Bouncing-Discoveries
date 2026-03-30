class Collider {
  constructor(worldCenterX, worldCenterY, bounciness = 1) {
    if (this.constructor === Collider) {
      throw new Error("Abstract class 'Collider' cannot be instantiated.");
    }

    this.worldCenterPos = createVector(worldCenterX, worldCenterY);
    this.bounciness = bounciness;
  }

  /**
   * Handles the collision response between the collider and the player's ball by bouncing the ball off the collider.
   * @param {Ball} ball Player's ball
   */
  handleCollision(ball) {
    const normal = this.getNormal(ball);
    if (normal.magSq() > 0) {
      ball.velocity = p5.Vector.reflect(ball.velocity, normal);
      ball.velocity.mult(this.bounciness);
      this.correctPosition(ball, normal);
    }
  }

  /**
   * Checks if the collider intersects with the player's ball.
   * @param {Ball} ball Player's ball
   * @returns {boolean} True if the collider and ball intersect, false otherwise
   */
  collidesWith(ball) {
    throw new Error("'collidesWith' method isn't implemented.");
  }

  /**
   * Calculates the normal vector at the point of collision between the collider and the ball.
   * @param {Ball} ball Player's ball
   * @returns {p5.Vector} The normal vector at the point of collision
   */
  getNormal(ball) {
    throw new Error("'getNormal' method isn't implemented.");
  }

  /**
   * Corrects the position of the ball after a collision to ensure it isn't inside the collider.
   * @param {Ball} ball Player's ball
   * @param {p5.Vector} normal The normal vector at the point of collision
   */
  correctPosition(ball, normal) {
    throw new Error("'correctPosition' method isn't implemented.");
  }
}
