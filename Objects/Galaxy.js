class Galaxy {
  constructor(
    spirals,
    spacingMult,
    starDensity,
    showOrbits,
    layerHeight,
    biomeHeight,
    cullPadding
  ) {
    this.spirals = spirals;
    this.spacingMult = spacingMult;
    this.starDensity = starDensity;
    this.showOrbits = showOrbits;
    this.layerHeight = layerHeight;
    this.biomeHeight = biomeHeight;
    this.cullPadding = cullPadding;

    this.spiralSpacing = (height * this.spacingMult) / this.spirals; // Spacing between spiral arms
    this.stars = []; // Array of random angles for stars

    this.ratio = 0; // Ratio for spiral tightness
    this.angle = 0; // Rotation angle for spirals
    this.time = random(TWO_PI); // Time for animation. Drives rotation of stars around the galaxy
    this.morphTime = random(1000); // Time for morphing. Drives the shape morphing by affecting the ratio and angle

    // Generate random angles for stars in each spiral
    for (let spiral = 0; spiral < this.spirals; spiral++) {
      for (let star = 0; star < this.starDensity; star++) {
        this.stars.push(random(TWO_PI));
      }
    }

    this.generateSpiralStyles();
  }

  draw(topY, scaledTopY) {
    push();

    noFill();

    let scaledMidY = scaledTopY + this.layerHeight / 2;
    let leftCullEdge = -width / 2 - this.cullPadding;
    let rightCullEdge = width / 2 + this.cullPadding;
    let topCullEdge = -this.cullPadding;
    let bottomCullEdge = height + this.cullPadding;
    let startCullEdge = topY + this.cullPadding;
    let endCullEdge = topY + this.biomeHeight + this.cullPadding;

    translate(width / 2, scaledMidY);

    this.time += 2 * PI * 0.001;
    this.morphTime += 0.005;

    this.ratio = map(sin(this.morphTime), -1, 1, 0.5, 2.0);
    this.angle = map(cos(this.morphTime * 0.5), -1, 1, 0, PI / 4);

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

      const style = this.spiralStyles[spiral];
      stroke(style.color);
      strokeWeight(style.weight);

      let starOffset = spiral * this.starDensity;
      let spiralRadiusRatio = this.ratio * this.spiralSpacing * spiral;
      let spiralRadius = this.spiralSpacing * spiral;

      // Draw stars for this spiral
      for (let star = 0; star < this.starDensity; star++) {
        let starAngle = this.stars[starOffset + star] + this.time;
        let x = (spiralRadiusRatio * cos(starAngle)) / 2;
        let y = (spiralRadius * sin(starAngle)) / 2;

        // Rotate by the cumulative angle
        let localX = x * cosAngle - y * sinAngle;
        let localY = x * sinAngle + y * cosAngle;
        let screenY = localY + scaledMidY;

        // Skip if the star isn't on screen
        if (localX < leftCullEdge || localX > rightCullEdge || screenY < topCullEdge || screenY > bottomCullEdge)
          continue;

        // Skip if the start isn't in the biome's range
        if (screenY < startCullEdge || screenY > endCullEdge) continue;

        point(localX, localY);
      }
    }

    pop();
  }

  generateSpiralStyles() {
    this.spiralStyles = [];
    let minStroke = max(1, width / 1000);

    for (let spiral = 0; spiral < this.spirals; spiral++) {
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

      let weight = map(spiral, 0, this.spirals, minStroke, 4 * minStroke);

      this.spiralStyles[spiral] = {
        color: color(h, s, b),
        weight: weight,
      };
    }
  }
}
