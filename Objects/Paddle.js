class Paddle {
  constructor(x, y, angle, worldStartY) {
    this.localCenterX = x;
    this.localCenterY = y;
    this.angle = angle;

    this.hw = 50;
    this.hh = 10;

    this.color = "grey";
    this.worldStartY = worldStartY;

    this.collider = new RectCollider(
      this.localCenterX,
      this.worldStartY + this.localCenterY,
      this.hw,
      this.hh,
      0.7,
      this.angle
    );
  }

  draw(topY) {
    const screenX = this.localCenterX;
    const screenY = this.localCenterY + topY;

    push();
    translate(screenX, screenY);
    rotate(this.angle);
    noStroke();
    fill(this.color);
    rect(-this.hw, -this.hh, this.hw * 2, this.hh * 2);
    pop();
  }

  handleCollision(ball) {
    this.collider.handleCollision(ball);
  }

  rotate(deltaAngle) {
    this.angle += deltaAngle;
    this.collider.angle = this.angle;
  }
}
