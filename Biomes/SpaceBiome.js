class SpaceBiome extends Biome {
  spirals = 75; // Number of spiral arms
  spacingMult = 2; // Multiplier for spacing between spirals
  starDensity = 100; // Number of stars per spiral
  showOrbits = false; // Show orbit paths
  stars = []; // Array of random angles for stars
  spiralSpacing = 0; // Spacing between spiral arms
  ratio = 0; // Ratio for spiral tightness
  angle = 0; // Rotation angle for spirals
  time = 0; // Time for animation. Drives rotation of stars around the galaxy
  morphTime = 0; // Time for morphing. Drives the shape morphing by affecting the ratio and angle
  nebulae = []; // Array to hold nebula properties
  cullPadding = 5; // Extra padding for culling stars outside the screen (without padding, some partially visible stars at the edges can be culled)

  constructor(worldStartY) {
    super(
      worldStartY,
      1000, // biomeHeight
      0, // startOverlapHeight
      0, // startHeight
      0, // endHeight
      0.1, // gravity
      1 // maxVelocity
    );

    this.time = random(TWO_PI);
    this.morphTime = random(1000);
    this.spiralSpacing = (height * this.spacingMult) / this.spirals;

    // Generate random angles for stars in each spiral
    for (let spiral = 0; spiral < this.spirals; spiral++) {
      for (let star = 0; star < this.starDensity; star++) {
        this.stars.push(random(2 * PI));
      }
    }

    for (let i = 0; i < 25; i++) {
      let h = random(200, 280);
      let s = random(70, 100);
      let b = random(30, 50);

      let p5Color = color(h, s, b, 0.2);

      this.nebulae.push({
        x: random(-width / 2, width / 2),
        y: random(-(this.biomeHeight - this.startHeight) / 2, (this.biomeHeight - this.startHeight) / 2),
        radius: random(0.35 * width, 0.75 * width),
        color: p5Color.toString(),
      });
    }
  }

  drawBodyBG(topY) {
    push();
    fill(240, 50, 4);
    noStroke();
    rect(0, topY, width, this.biomeHeight);
    translate(width / 2, this.biomeHeight / 2 + topY);

    for (let n of this.nebulae) {
      drawingContext.save(); // Isolate the native canvas state

      let grad = drawingContext.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
      grad.addColorStop(0, n.color);
      grad.addColorStop(1, "rgba(0,0,0,0)");

      drawingContext.fillStyle = grad;
      // Draw the rectangle centered on the nebula's position
      drawingContext.fillRect(n.x - n.radius, n.y - n.radius, n.radius * 2, n.radius * 2);

      drawingContext.restore();
    }

    this.time += 2 * PI * 0.001;
    this.morphTime += 0.005;

    this.ratio = map(sin(this.morphTime), -1, 1, 0.5, 2.0);
    this.angle = map(cos(this.morphTime * 0.5), -1, 1, 0, PI / 4);
    noFill();

    // Draw spirals
    let cumulativeAngle = 0;
    for (let spiral = 0; spiral < this.spirals; spiral++) {
      cumulativeAngle += this.angle;
      let cosAngle = cos(cumulativeAngle);
      let sinAngle = sin(cumulativeAngle);

      if (this.showOrbits) {
        push();
        rotate(cumulativeAngle);
        stroke(255, 50);
        strokeWeight(0.4);
        ellipse(0, 0, this.ratio * this.spiralSpacing * spiral, this.spiralSpacing * spiral);
        pop();
      }

      let distFraction = spiral / this.spirals;
      let h, s, b;
      let fadeToWhiteProportion = 0.3;
      if (distFraction < fadeToWhiteProportion) {
        h = 230;
        s = lerp(0, 100, distFraction / fadeToWhiteProportion);
        b = 100;
      } else {
        h = lerp(230, 280, (distFraction - fadeToWhiteProportion) / (1 - fadeToWhiteProportion));
        s = 100;
        b = 100;
      }

      let starColor = color(h, s, b);
      stroke(starColor);

      let minStroke = max(1, width / 500);
      strokeWeight(map(spiral, 0, this.spirals, minStroke, 4 * minStroke));

      // Draw stars for this spiral
      for (let star = 0; star < this.starDensity; star++) {
        let starAngle = this.stars[spiral * this.starDensity + star] + this.time;
        let x = (this.ratio * this.spiralSpacing * spiral * cos(starAngle)) / 2;
        let y = (this.spiralSpacing * spiral * sin(starAngle)) / 2;

        // Rotate by the cumulative angle
        let localX = x * cosAngle - y * sinAngle;
        let localY = x * sinAngle + y * cosAngle;
        let screenY = localY + (this.biomeHeight / 2 + topY);

        // Skip if the star isn't on screen
        if (
          localX < -width / 2 - this.cullPadding ||
          localX > width / 2 + this.cullPadding ||
          screenY < -this.cullPadding ||
          screenY > height + this.cullPadding
        )
          continue;

        // Skip if the start isn't in the biome's range
        if (
          localY < -this.biomeHeight / 2 + this.startHeight - this.cullPadding ||
          localY > this.biomeHeight / 2 - this.endHeight + this.cullPadding
        )
          continue;

        point(localX, localY);
      }
    }
    pop();
  }

  drawBall(screenX, screenY, radius) {
    push();
    fill(180, 100, 100);
    stroke(255);
    strokeWeight(2);
    circle(screenX, screenY, radius * 2);
    pop();
  }
}
