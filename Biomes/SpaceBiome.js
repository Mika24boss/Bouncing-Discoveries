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
  asteroids = [];
  asteroidDelay = 0;
  minAsteroidDelay = 200;
  maxAsteroidDelay = 500;

  constructor(worldStartY) {
    super(
      worldStartY,
      1500, // biomeHeight
      0, // startOverlapHeight
      0, // startHeight
      0, // endHeight
      0.1, // gravity
      1 // maxVelocity
    );

    this.asteroidDelay = random(200, 300); // Initial delay before the first asteroid appears
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

  drawBodyFG(topY) {
    let indicesIndex = 0;
    let indices = [...Array(this.asteroids.length).keys()];
    let newAsteroids = [];

    while (indicesIndex < indices.length) {
      let asteroid = this.asteroids[indices[indicesIndex]];
      asteroid.update();

      if (asteroid.isOutsideBiome()) {
        indices.splice(indicesIndex, 1);
        continue;
      }

      // Check for collisions with other asteroids
      let otherIndex = indicesIndex + 1;
      while (otherIndex < indices.length) {
        let other = this.asteroids[indices[otherIndex]];

        if (asteroid.isAsteroidHit(other)) {
          indices.splice(indicesIndex, 1);
          indices.splice(otherIndex - 1, 1);

          let mid = p5.Vector.lerp(
            asteroid.position,
            other.position,
            asteroid.radius / (asteroid.radius + other.radius)
          );
          let distance = max(asteroid.radius, other.radius);
          let angle = random(0, PI / 2);
          let positions = [
            {
              pos: createVector(mid.x + distance * cos(angle), mid.y + distance * sin(angle)),
              angle: random(-PI / 4 + angle, PI / 4 + angle),
            },
            {
              pos: createVector(mid.x + distance * cos(angle + PI / 2), mid.y + distance * sin(angle + PI / 2)),
              angle: random(-PI / 4 + angle + PI / 2, PI / 4 + angle + PI / 2),
            },
            {
              pos: createVector(mid.x + distance * cos(angle + PI), mid.y + distance * sin(angle + PI)),
              angle: random(-PI / 4 + angle + PI, PI / 4 + angle + PI),
            },
            {
              pos: createVector(
                mid.x + distance * cos(angle + (3 * PI) / 2),
                mid.y + distance * sin(angle + (3 * PI) / 2)
              ),
              angle: random(-PI / 4 + angle + (3 * PI) / 2, PI / 4 + angle + (3 * PI) / 2),
            },
          ];
          positions.sort(() => random() - 0.5);

          let magAst = asteroid.velocity.mag();
          let magOther = other.velocity.mag();
          let minRadius = 20;
          let velocity;

          if (asteroid.radius > minRadius) {
            // Main asteroid baby 1
            velocity = createVector(cos(positions[0].angle), sin(positions[0].angle)).mult(magAst);
            newAsteroids.push(
              new Asteroid(
                this.biomeHeight,
                this.startHeight,
                this.endHeight,
                asteroid.radius / 2,
                positions[0].pos,
                velocity
              )
            );
            // Main asteroid baby 2
            velocity = createVector(cos(positions[1].angle), sin(positions[1].angle)).mult(magAst);
            newAsteroids.push(
              new Asteroid(
                this.biomeHeight,
                this.startHeight,
                this.endHeight,
                asteroid.radius / 2,
                positions[1].pos,
                velocity
              )
            );
          }
          if (other.radius > minRadius) {
            // Other asteroid baby 1
            velocity = createVector(cos(positions[2].angle), sin(positions[2].angle)).mult(magOther);
            newAsteroids.push(
              new Asteroid(
                this.biomeHeight,
                this.startHeight,
                this.endHeight,
                other.radius / 2,
                positions[2].pos,
                velocity
              )
            );
            // Other asteroid baby 2
            velocity = createVector(cos(positions[3].angle), sin(positions[3].angle)).mult(magOther);
            newAsteroids.push(
              new Asteroid(
                this.biomeHeight,
                this.startHeight,
                this.endHeight,
                other.radius / 2,
                positions[3].pos,
                velocity
              )
            );
          }
          indicesIndex--; // Stay on the same index since we removed the current asteroid
          break;
        } else {
          otherIndex++;
        }
      }

      asteroid.draw(topY);
      indicesIndex++;
    }

    this.asteroids = this.asteroids.filter((_, index) => indices.includes(index)).concat(newAsteroids);

    if (this.asteroidDelay <= 0) {
      this.asteroids.push(new Asteroid(this.biomeHeight, this.startHeight, this.endHeight));
      this.asteroidDelay = random(this.minAsteroidDelay, this.maxAsteroidDelay);
    }
    this.asteroidDelay--;
  }

  drawBall(screenX, screenY, radius) {
    push();
    textSize(radius * 2);
    textAlign(CENTER, CENTER);
    text(this.earthEmoji, screenX, screenY + radius / 7);
    pop();
  }
}

class Asteroid {
  constructor(biomeHeight, startHeight, endHeight, radius = null, position = null, velocity = null) {
    if (radius) {
      this.radius = radius;
    } else {
      this.radius = random(20, 50);
    }
    this.biomeHeight = biomeHeight;
    this.startHeight = startHeight;
    this.endHeight = endHeight;
    this.numPoints = floor(random(5, 10));
    this.offset = [];
    for (var i = 0; i < this.numPoints; i++) {
      this.offset[i] = random(-this.radius * 0.5, this.radius * 0.5);
    }

    if (position && velocity) {
      this.position = position.copy();
      this.velocity = velocity.copy();
      return;
    }

    let rnd = random();
    // Top spawn
    if (rnd < 0.15) {
      this.position = createVector(random(width), startHeight - this.radius);
      this.velocity = createVector(random(-5, 5), random(1, 5));
    }
    // Bottom spawn
    else if (rnd < 0.3) {
      this.position = createVector(random(width), biomeHeight - endHeight + this.radius);
      this.velocity = createVector(random(-5, 5), random(-5, -1));
    }
    // Left spawn
    else if (rnd < 0.65) {
      this.position = createVector(-this.radius, random(biomeHeight));
      this.velocity = createVector(random(1, 5), random(-5, 5));
    }
    // Right spawn
    else {
      this.position = createVector(width + this.radius, random(biomeHeight));
      this.velocity = createVector(random(-5, -1), random(-5, 5));
    }
  }

  update() {
    this.position.add(this.velocity);
  }

  draw(topY) {
    push();
    fill("grey");
    noStroke();
    translate(this.position.x, this.position.y + topY);
    beginShape();
    for (var i = 0; i < this.numPoints; i++) {
      var angle = map(i, 0, this.numPoints, 0, TWO_PI);
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
