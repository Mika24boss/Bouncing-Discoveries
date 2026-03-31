class InteractiveRectangle {
  constructor(biomeHeight, worldStartY, style) {
    this.localCenterX = random() * width;
    let spawnPaddingTop = 400; // Prevent spawning too close to the start of the biome
    this.localCenterY = random() * (biomeHeight - spawnPaddingTop) + spawnPaddingTop;

    this.hw = random() * (style.maxHW - style.minHW) + style.minHW;
    this.hh = random() * (style.maxHH - style.minHH) + style.minHH;

    this.colors = style.colors;
    this.colorIndex = 0;
    this.biomeHeight = biomeHeight;
    this.worldStartY = worldStartY;

    this.collider = new RectCollider(this.localCenterX, this.worldStartY + this.localCenterY, this.hw, this.hh, 0.7);
  }

  draw(topY) {
    const screenX = this.localCenterX;
    const screenY = this.localCenterY + topY;
    if (!this.isOnScreen(screenY)) return;

    let topEdgeY = max(topY, screenY - this.hh);
    let bottomEdgeY = min(topY + this.biomeHeight, screenY + this.hh);

    push();
    noStroke();
    fill(this.colors[this.colorIndex]);
    rect(screenX - this.hw, topEdgeY, this.hw * 2, bottomEdgeY - topEdgeY);
    pop();
  }

  isOnScreen(screenY) {
    return screenY + this.hh >= 0 && screenY - this.hh <= height;
  }

  handleCollision(ball) {
    let normal = this.collider.getNormal(ball);
    const impactSpeed = -p5.Vector.dot(ball.velocity, normal);

    this.collider.handleCollision(ball);

    // Only change color if the collision is hard enough
    if (impactSpeed < 1) return;

    this.colorIndex = (this.colorIndex + 1) % this.colors.length;
  }
}
