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
      this.asteroidsBG.push(new Asteroid(this.biomeHeight, this.beltHeight, true));
      this.asteroidDelayBG = random(this.minAsteroidDelayBG, this.maxAsteroidDelayBG);
    }

    if (this.asteroidDelayFG <= 0) {
      this.asteroidsFG.push(new Asteroid(this.biomeHeight, this.beltHeight, false));
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
