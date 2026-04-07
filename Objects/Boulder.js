class Boulder {
  constructor(biomeHeight, startHeight, endHeight, worldStartY, boulders) {
    let radiusScale = map(width, 1920, 2560, 0.75, 1, true);
    this.radius = random(50, 150) * radiusScale;

    let allowedOverlap = 50;
    let closestDistSquared = Infinity;
    let minDistance = 0;
    let x, y;
    do {
      x = random(this.radius * 2, width - this.radius * 2);
      y = random(startHeight + this.radius, biomeHeight - endHeight - this.radius);
      closestDistSquared = Infinity;
      let closestRadius = 0;
      // Get closest distance to any of the existing boulders
      for (let boulder of boulders) {
        let dx = boulder.position.x - x;
        let dy = boulder.position.y - y;
        let distSquared = dx * dx + dy * dy;
        if (distSquared < closestDistSquared) {
          closestDistSquared = distSquared;
          closestRadius = boulder.radius;
        }
      }
      minDistance = closestRadius + this.radius - allowedOverlap;
    } while (closestDistSquared < minDistance * minDistance);

    this.position = createVector(x, y);
    this.collider = new CircleCollider(this.position.x, this.position.y + worldStartY, this.radius, 0.4);

    // Boulder shape
    this.numPoints = floor(random(12, 20));
    this.offset = [];
    for (var i = 0; i < this.numPoints; i++) {
      this.offset[i] = random(-this.radius * 0.2, this.radius * 0.2);
    }

    this.color = color(230, 5, random(50, 70));
    let h = hue(this.color);
    let s = saturation(this.color);
    let b = brightness(this.color);
    this.highlightColor = color(h, s * 0.8, b + 15);
  }

  draw(topY) {
    push();
    translate(this.position.x, this.position.y + topY);

    // Base shape
    fill(this.color);
    noStroke();
    this.drawBoulderShape();

    // Highlight
    fill(this.highlightColor);
    translate(-this.radius * 0.1, -this.radius * 0.1);
    scale(0.8);
    this.drawBoulderShape();
    pop();
  }

  drawBoulderShape() {
    beginShape();
    for (var i = 0; i < this.numPoints; i++) {
      var angle = map(i, 0, this.numPoints, 0, TWO_PI);
      var r = this.radius + this.offset[i];
      var x = r * cos(angle);
      var y = r * sin(angle);
      vertex(x, y);
    }
    endShape(CLOSE);
  }

  isOnScreen(topY) {
    let screenY = this.position.y + topY;
    return screenY + this.radius * 2 >= 0 && screenY - this.radius * 2 <= height;
  }
}
