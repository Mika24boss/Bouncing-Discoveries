class Asteroid {
  constructor(
    biomeHeight,
    startHeight,
    endHeight,
    beltHeight,
    isBackground,
    radius = null,
    position = null,
    velocity = null
  ) {
    this.biomeHeight = biomeHeight;
    this.startHeight = startHeight;
    this.endHeight = endHeight;
    this.toDelete = false;
    this.rotationSpeed = random(-0.01, 0.01);
    this.rotation = 0;

    if (radius) this.radius = radius;

    let positionRndNumber = -1;
    if (position && velocity) {
      this.position = position.copy();
      this.velocity = velocity.copy();
    } else {
      positionRndNumber = random();
    }

    // Background
    this.isBackground = isBackground;
    if (this.isBackground) {
      this.color = color(230, 0, random(8, 16));
      if (!radius) this.radius = random(5, 12);

      // Left spawn
      if (positionRndNumber > -1 && positionRndNumber < 0.5) {
        this.position = createVector(-this.radius, random(0, beltHeight));
        this.velocity = createVector(random(1, 2), random(-0.5, 0.5));
      }
      // Right spawn
      else if (positionRndNumber > -1) {
        this.position = createVector(width + this.radius, random(biomeHeight - beltHeight, biomeHeight));
        this.velocity = createVector(random(-2, -1), random(-0.5, 0.5));
      }
    } else {
      // Foreground
      this.color = color(230, 5, random(30, 55));
      if (!radius) this.radius = random(15, 30);

      // Left spawn
      if (positionRndNumber > -1 && positionRndNumber < 0.5) {
        this.position = createVector(-this.radius, random(0, beltHeight));
        this.velocity = createVector(random(3, 6), random(-3, 3));
      }
      // Right spawn
      else if (positionRndNumber > -1) {
        this.position = createVector(width + this.radius, random(biomeHeight - beltHeight, biomeHeight));
        this.velocity = createVector(random(-6, -3), random(-3, 3));
      }
    }

    // Asteroid shape
    this.numPoints = floor(random(5, 10));
    this.offset = [];
    for (var i = 0; i < this.numPoints; i++) {
      this.offset[i] = random(-this.radius * 0.5, this.radius * 0.5);
    }

    let h = hue(this.color);
    let s = saturation(this.color);
    let b = brightness(this.color);
    this.highlightColor = color(h, s * 0.8, b + 15);

    this.craterHighlight = color(h, s, b + 5);

    // Craters
    this.craters = [];
    let numCraters = floor(random(3, 6));
    for (let i = 0; i < numCraters; i++) {
      let brightnessOffset = random(-5, -15);
      this.craters.push({
        x: random(-this.radius * 0.3, this.radius * 0.3),
        y: random(-this.radius * 0.3, this.radius * 0.3),
        size: random(this.radius * 0.1, this.radius * 0.2),
        color: color(h, s, b + brightnessOffset),
      });
    }
  }

  update() {
    this.position.add(this.velocity);
    this.rotation += this.rotationSpeed;
  }

  draw(topY) {
    push();
    translate(this.position.x, this.position.y + topY);
    rotate(this.rotation);

    // Base shape (the shadow)
    fill(this.color);
    noStroke();
    this.drawAsteroidShape();

    // Highlight (the lit side)
    push();
    fill(this.highlightColor);
    translate(-this.radius * 0.1, -this.radius * 0.1);
    scale(0.8);
    this.drawAsteroidShape();
    pop();

    // Draw craters
    for (let crater of this.craters) {
      fill(crater.color);
      ellipse(crater.x, crater.y, crater.size, crater.size * 0.8);

      // Highlight on the crater
      noFill();
      stroke(this.craterHighlight);
      strokeWeight(1);
      arc(crater.x, crater.y, crater.size, crater.size * 0.8, PI, TWO_PI);
    }

    pop();
  }

  drawAsteroidShape() {
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

  isOutsideBiome() {
    // Top
    if (this.position.y + 2 * this.radius < this.startHeight) return true;
    // Bottom
    if (this.position.y - 2 * this.radius > this.biomeHeight - this.endHeight) return true;
    // Left
    if (this.position.x + 2 * this.radius < 0) return true;
    // Right
    if (this.position.x - 2 * this.radius > width) return true;

    return false;
  }

  isAsteroidHit(asteroid) {
    let dx = this.position.x - asteroid.position.x;
    let dy = this.position.y - asteroid.position.y;
    let distanceSq = dx * dx + dy * dy;
    let radiusSum = this.radius + asteroid.radius;
    return distanceSq < radiusSum * radiusSum;
  }
}
