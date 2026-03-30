class SpaceBiome extends Biome {
  layersBG = []; // Parallax layers for the background

  spirals = 75; // Number of spiral arms
  spacingMult = 1.5; // Multiplier for spacing between spirals
  starDensity = 100; // Number of stars per spiral
  showOrbits = false; // Show orbit paths
  cullPadding = 5; // Extra padding for culling stars outside the screen (without padding, some partially visible stars at the edges can be culled)
  galaxyParallaxScale = 1; // Parallax scale for the galaxy layer
  nebulaeParallaxScale = 0.5; // Parallax scale for the nebulae layer
  numNebulae = 30; // Number of nebulae in the background
  earthEmoji = ""; // Emoji to represent Earth in the biome
  earthEmojis = ["🌍", "🌎", "🌏"];

  // Background asteroids
  asteroidsBG = []; // Array of asteroids
  asteroidDelayBG = 0; // Spawning delay
  minAsteroidDelayBG = 4; // Minimum spawning delay
  maxAsteroidDelayBG = 8; // Maximum spawning delay
  minAsteroidRadiusBG = 5; // Minimum radius

  // Foreground asteroids
  asteroidsFG = []; // Array of asteroids
  asteroidDelayFG = 0; // Spawning delay
  minAsteroidDelayFG = 4; // Minimum spawning delay
  maxAsteroidDelayFG = 6; // Maximum spawning delay
  minAsteroidRadiusFG = 5; // Minimum radius

  childAsteroidSpeedMult = 0.5; // Multiplier for child asteroid speed compared to parent asteroid
  childAsteroidSpreadProp = 0.5; // Controls the spread of child asteroids (between 0 and 1), where 0 means all children have the same velocity
  beltHeight = 1500; // Height taken up by the asteroid belt

  originalMaxVelocity = 0;
  slowZoneDistance = 1000; // Distance from the biome center where the player starts slowing down
  slowZoneCenter = 200; // Distance from the biome center where the player is at the slowest
  slowMaxVelocity = 0.4;

  constructor(worldStartY) {
    super(
      worldStartY,
      7000, // biomeHeight
      0, // startOverlapHeight
      0, // startHeight
      0, // endHeight
      0.05, // gravity
      3 // maxVelocity
    );

    this.originalMaxVelocity = this.maxVelocity;
    this.biomeWorldCenterY = this.worldStartY + this.biomeHeight / 2 - height / 4; // Center the slow zone around the middle of the biome, slightly shifted up to account for the ball's offset

    let nebulaLayer = new ParallaxLayer(this.nebulaeParallaxScale, this.biomeHeight);
    for (let i = 0; i < this.numNebulae; i++) {
      nebulaLayer.content.push(new Nebula(nebulaLayer.layerHeight, this.startHeight, this.endHeight));
    }
    this.layersBG.push(nebulaLayer);

    let galaxyLayer = new ParallaxLayer(this.galaxyParallaxScale, this.biomeHeight);
    let galaxy = new Galaxy(
      this.spirals,
      this.spacingMult,
      this.starDensity,
      this.showOrbits,
      galaxyLayer.layerHeight,
      this.biomeHeight,
      this.startHeight,
      this.endHeight,
      this.cullPadding
    );
    galaxyLayer.content.push(galaxy);
    this.layersBG.push(galaxyLayer);

    this.earthEmoji = random(this.earthEmojis);
  }

  update(ball) {
    let distFromCenter = abs(ball.worldCenterPos.y - this.biomeWorldCenterY);

    if (distFromCenter < this.slowZoneCenter) {
      this.maxVelocity = this.slowMaxVelocity;
    } else if (distFromCenter < this.slowZoneDistance) {
      let t = (distFromCenter - this.slowZoneCenter) / (this.slowZoneDistance - this.slowZoneCenter);
      this.maxVelocity = lerp(this.slowMaxVelocity, this.originalMaxVelocity, t);
    } else {
      this.maxVelocity = this.originalMaxVelocity;
    }

    this.asteroidsBG = this.updateAsteroids(true, this.asteroidsBG, this.minAsteroidRadiusBG);
    this.asteroidsFG = this.updateAsteroids(false, this.asteroidsFG, this.minAsteroidRadiusFG);
    this.asteroidDelayBG--;
    this.asteroidDelayFG--;

    if (this.asteroidDelayBG <= 0) {
      this.asteroidsBG.push(new Asteroid(this.biomeHeight, this.startHeight, this.endHeight, this.beltHeight, true));
      this.asteroidDelayBG = random(this.minAsteroidDelayBG, this.maxAsteroidDelayBG);
    }

    if (this.asteroidDelayFG <= 0) {
      this.asteroidsFG.push(new Asteroid(this.biomeHeight, this.startHeight, this.endHeight, this.beltHeight, false));
      this.asteroidDelayFG = random(this.minAsteroidDelayFG, this.maxAsteroidDelayFG);
    }
  }

  updateAsteroids(isBackground, asteroids, minAsteroidRadius) {
    let newAsteroids = [];

    for (let astIndex = 0; astIndex < asteroids.length; astIndex++) {
      let asteroid = asteroids[astIndex];
      if (asteroid.toDelete) continue;

      asteroid.update();

      if (asteroid.isOutsideBiome()) {
        asteroid.toDelete = true;
        continue;
      }

      // Check for collisions with other asteroids
      for (let otherIndex = astIndex + 1; otherIndex < asteroids.length; otherIndex++) {
        let other = asteroids[otherIndex];

        if (other.toDelete) continue;
        if (!asteroid.isAsteroidHit(other)) continue;

        asteroid.toDelete = true;
        other.toDelete = true;

        let intersection = p5.Vector.lerp(
          asteroid.position,
          other.position,
          asteroid.radius / (asteroid.radius + other.radius)
        );
        let baseVelocity = p5.Vector.lerp(
          asteroid.velocity,
          other.velocity,
          asteroid.radius / (asteroid.radius + other.radius)
        );
        baseVelocity.y *= this.childAsteroidSpeedMult * (1 - this.childAsteroidSpreadProp);
        let creationGap = max(asteroid.radius, other.radius) * 1.1;

        const { directions, params } = this.calculateChildrenParams(
          minAsteroidRadius,
          intersection,
          creationGap,
          asteroid,
          other
        );

        newAsteroids = newAsteroids.concat(
          this.createChildrenAsteroids(isBackground, directions, params, baseVelocity)
        );
        break;
      }
    }

    asteroids = asteroids.filter((a) => !a.toDelete).concat(newAsteroids);

    return asteroids;
  }

  drawBodyBG(topY) {
    push();
    fill(240, 50, 4);
    noStroke();
    rect(0, topY, width, this.biomeHeight);
    pop();

    this.layersBG.forEach((layer) => layer.draw(topY));

    for (let asteroid of this.asteroidsBG) {
      asteroid.draw(topY);
    }
  }

  drawBodyFG(topY) {
    for (let asteroid of this.asteroidsFG) {
      asteroid.draw(topY);
    }
  }

  drawBall(screenX, screenY, radius) {
    push();
    textSize(radius * 2);
    textAlign(CENTER, CENTER);
    text(this.earthEmoji, screenX, screenY + radius / 7);
    pop();
  }

  calculateChildrenParams(minAsteroidRadius, intersection, creationGap, asteroid1, asteroid2) {
    // Create children angles and spawn positions
    let angle = random(0, PI / 2);
    let angles = [angle, angle + PI / 2, angle + PI, angle + (3 * PI) / 2];
    let directions = [];
    for (let angle of angles) {
      let randomAngle = angle + random(-PI / 6, PI / 6);
      directions.push({
        x: intersection.x + creationGap * cos(randomAngle),
        y: intersection.y + creationGap * sin(randomAngle),
        angle: randomAngle,
      });
    }
    directions.sort(() => random() - 0.5);

    // Calculate children velocities and radius
    let params = [];
    let mag1 = asteroid1.velocity.mag() * this.childAsteroidSpeedMult * this.childAsteroidSpreadProp;
    let mag2 = asteroid2.velocity.mag() * this.childAsteroidSpeedMult * this.childAsteroidSpreadProp;

    if (asteroid1.radius / 2 >= minAsteroidRadius) {
      for (let i = 0; i < 2; i++) {
        params.push({
          mag: mag1,
          radius: asteroid1.radius / 2,
        });
      }
    }

    if (asteroid2.radius / 2 >= minAsteroidRadius) {
      for (let i = 0; i < 2; i++) {
        params.push({
          mag: mag2,
          radius: asteroid2.radius / 2,
        });
      }
    }

    return {
      directions,
      params,
    };
  }

  createChildrenAsteroids(isBackground, directions, params, baseVelocity) {
    let newAsteroids = [];

    for (let index = 0; index < params.length; index++) {
      let direction = directions[index];
      let param = params[index];

      let velocity = createVector(cos(direction.angle), sin(direction.angle)).mult(param.mag).add(baseVelocity);
      newAsteroids.push(
        new Asteroid(
          this.biomeHeight,
          this.startHeight,
          this.endHeight,
          this.beltHeight,
          isBackground,
          param.radius,
          createVector(direction.x, direction.y),
          velocity
        )
      );
    }

    return newAsteroids;
  }
}

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

class Galaxy {
  constructor(
    spirals,
    spacingMult,
    starDensity,
    showOrbits,
    layerHeight,
    biomeHeight,
    startHeight,
    endHeight,
    cullPadding
  ) {
    this.spirals = spirals;
    this.spacingMult = spacingMult;
    this.starDensity = starDensity;
    this.showOrbits = showOrbits;
    this.layerHeight = layerHeight;
    this.biomeHeight = biomeHeight;
    this.startHeight = startHeight;
    this.endHeight = endHeight;
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
    let startCullEdge = topY + this.startHeight - this.cullPadding;
    let endCullEdge = topY + this.biomeHeight - this.endHeight + this.cullPadding;

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
    let minStroke = max(1, width / 500);

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

class Nebula {
  constructor(layerHeight, startHeight, endHeight) {
    let h = random(200, 280);
    let s = random(70, 100);
    let b = random(40, 60);
    let p5Color = color(h, s, b, 0.2);

    this.centerX = random(width);
    this.centerY = random(startHeight, layerHeight - startHeight - endHeight);
    this.radius = random(0.35 * width, 0.75 * width);
    this.color = p5Color.toString();
  }

  draw(topY, scaledTopY) {
    const screenY = scaledTopY + this.centerY;
    if (screenY + this.radius < 0 || screenY - this.radius > height) return;

    push();
    drawingContext.save(); // Isolate the native canvas state

    let grad = drawingContext.createRadialGradient(this.centerX, screenY, 0, this.centerX, screenY, this.radius);
    grad.addColorStop(0, this.color);
    grad.addColorStop(1, "rgba(0,0,0,0)");

    drawingContext.fillStyle = grad;
    // Draw the rectangle centered on the nebula's position
    drawingContext.fillRect(this.centerX - this.radius, screenY - this.radius, this.radius * 2, this.radius * 2);

    drawingContext.restore();

    pop();
  }
}
