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
  earthEmoji = ""; // Emoji to represent Earth in the biome
  earthEmojis = ["🌍", "🌎", "🌏"];

  // Background asteroids
  asteroidsBG = [];
  asteroidDelayBG = 0;
  minAsteroidDelayBG = 5;
  maxAsteroidDelayBG = 10;
  minAsteroidRadiusBG = 5;

  // Foreground asteroids
  asteroidsFG = [];
  asteroidDelayFG = 0;
  minAsteroidDelayFG = 5;
  maxAsteroidDelayFG = 10;
  minAsteroidRadiusFG = 5;

  childAsteroidSpeedMult = 0.5; // Multiplier for child asteroid speed compared to parent asteroid
  childAsteroidSpreadProp = 0.5; // Controls the spread of child asteroids (between 0 and 1), where 0 means all children have the same velocity
  beltHeight = 1000; // Height taken up by the asteroid belt

  constructor(worldStartY) {
    super(
      worldStartY,
      5000, // biomeHeight
      0, // startOverlapHeight
      0, // startHeight
      0, // endHeight
      0.1, // gravity
      3 // maxVelocity
    );

    this.earthEmoji = random(this.earthEmojis);
    this.time = random(TWO_PI);
    this.morphTime = random(1000);
    this.spiralSpacing = (height * this.spacingMult) / this.spirals;

    // Generate random angles for stars in each spiral
    for (let spiral = 0; spiral < this.spirals; spiral++) {
      for (let star = 0; star < this.starDensity; star++) {
        this.stars.push(random(TWO_PI));
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

  update() {
    this.asteroidsBG = this.updateAsteroids(true, this.asteroidsBG, this.asteroidDelayBG, this.minAsteroidDelayBG, this.maxAsteroidDelayBG, this.minAsteroidRadiusBG);
    this.asteroidsFG = this.updateAsteroids(false, this.asteroidsFG, this.asteroidDelayFG, this.minAsteroidDelayFG, this.maxAsteroidDelayFG, this.minAsteroidRadiusFG);
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

  updateAsteroids(isBackground, asteroids, asteroidDelay, minAsteroidDelay, maxAsteroidDelay, minAsteroidRadius) {
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

        const { directions, params } = this.calculateChildrenParams(minAsteroidRadius, intersection, creationGap, asteroid, other);

        newAsteroids = newAsteroids.concat(this.createChildrenAsteroids(isBackground, directions, params, baseVelocity));
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
  constructor(biomeHeight, startHeight, endHeight, beltHeight, isBackground, radius = null, position = null, velocity = null) {
    if (radius) this.radius = radius;

    let positionRndNumber = -1;
    if (position && velocity) {
      this.position = position.copy();
      this.velocity = velocity.copy();
    } else {
      positionRndNumber = random();
    }

    this.isBackground = isBackground;

    // Background
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

    } else { // Foreground
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

    this.biomeHeight = biomeHeight;
    this.startHeight = startHeight;
    this.endHeight = endHeight;
    this.toDelete = false;
    this.numPoints = floor(random(5, 10));
    this.offset = [];
    for (var i = 0; i < this.numPoints; i++) {
      this.offset[i] = random(-this.radius * 0.5, this.radius * 0.5);
    }
    this.rotationSpeed = random(-0.01, 0.01);
    this.rotation = 0;
  }

  update() {
    this.position.add(this.velocity);
    this.rotation += this.rotationSpeed;
  }

  draw(topY) {
    push();
    fill(this.color);
    noStroke();
    translate(this.position.x, this.position.y + topY);
    beginShape();
    for (var i = 0; i < this.numPoints; i++) {
      var angle = map(i, 0, this.numPoints, 0, TWO_PI);
      angle += this.rotation;
      var r = this.radius + this.offset[i];
      var x = r * cos(angle);
      var y = r * sin(angle);
      vertex(x, y);
    }
    endShape(CLOSE);
    pop();
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
    var d = dist(this.position.x, this.position.y, asteroid.position.x, asteroid.position.y);
    return d < asteroid.radius + this.radius;
  }
}
