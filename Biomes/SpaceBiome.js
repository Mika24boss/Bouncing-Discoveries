class SpaceBiome extends Biome {
  layersBG = []; // Parallax layers for the background
  layersFG = []; // Parallax layers for the foreground

  // Galaxy
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

  // Asteroid belt and collision
  childAsteroidSpeedMult = 0.5; // Multiplier for child asteroid speed compared to parent asteroid
  childAsteroidSpreadProp = 0.5; // Controls the spread of child asteroids (between 0 and 1), where 0 means all children have the same velocity
  beltHeight = 1250; // Height of the asteroid belt
  originalMaxVelocity = 0; // Original max velocity
  slowZoneDistance = 1000; // Distance from the biome center where the player starts slowing down
  slowZoneCenter = 200; // Distance from the biome center where the player is at the slowest
  slowMaxVelocity = 0.4;

  // Static asteroids
  numStaticAsteroidsBG = 8; // Number of static asteroids in the background
  numStaticAsteroidsFG = 8; // Number of static asteroids in the foreground
  staticBeltHeight = 400; // Height of the static asteroid belt

  constructor(worldStartY) {
    super(
      worldStartY,
      7000, // biomeHeight
      0, // startOverlapHeight
      600, // startHeight
      600, // endHeight
      0.05, // gravity
      3 // maxVelocity
    );

    this.originalMaxVelocity = this.maxVelocity;
    this.biomeWorldCenterY = this.worldStartY + this.biomeHeight / 2 - height / 4; // Center the slow zone around the middle of the biome, slightly shifted up to account for the ball's offset

    let nebulaLayer = new ParallaxLayer(this.nebulaeParallaxScale, this.biomeHeight);
    for (let i = 0; i < this.numNebulae; i++) {
      nebulaLayer.content.push(new Nebula(this.biomeHeight, nebulaLayer.layerHeight, this.startHeight, this.endHeight));
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

    let asteroidsStaticBG = [];
    let asteroidsStaticFG = [];
    let staticBeltLayerBG = new ParallaxLayer(0.75, this.biomeHeight);
    let staticBeltLayerFG = new ParallaxLayer(0.95, this.biomeHeight);

    // Top belt
    this.createStaticAsteroidBelt(
      this.numStaticAsteroidsBG,
      asteroidsStaticBG,
      staticBeltLayerBG.layerHeight,
      true,
      true
    );
    this.createStaticAsteroidBelt(
      this.numStaticAsteroidsFG,
      asteroidsStaticFG,
      staticBeltLayerFG.layerHeight,
      false,
      true
    );
    // Bottom belt
    this.createStaticAsteroidBelt(
      this.numStaticAsteroidsBG,
      asteroidsStaticBG,
      staticBeltLayerBG.layerHeight,
      true,
      false
    );
    this.createStaticAsteroidBelt(
      this.numStaticAsteroidsFG,
      asteroidsStaticFG,
      staticBeltLayerFG.layerHeight,
      false,
      false
    );

    staticBeltLayerBG.content = asteroidsStaticBG;
    staticBeltLayerFG.content = asteroidsStaticFG;
    this.layersBG.push(staticBeltLayerBG);
    this.layersFG.push(staticBeltLayerFG);

    this.earthEmoji = random(this.earthEmojis);
  }

  createStaticAsteroidBelt(numAsteroids, asteroids, layerHeight, isBackground, isTop) {
    for (let astStat = 0; astStat < numAsteroids; astStat++) {
      let minY = isTop ? this.startHeight / 2 : this.biomeHeight - this.staticBeltHeight - this.endHeight / 2;
      let maxY = isTop ? this.startHeight / 2 + this.staticBeltHeight : this.biomeHeight - this.endHeight / 2;
      minY = (minY * layerHeight) / this.biomeHeight;
      maxY = (maxY * layerHeight) / this.biomeHeight;

      let position = createVector(random(width), random(minY, maxY));
      let newAsteroid = new StaticAsteroid(this.biomeHeight, isBackground, position);

      let diameter = newAsteroid.radius * 2;
      if (isTop) {
        if (diameter > newAsteroid.position.y) {
          newAsteroid.position.y = diameter;
        }
      } else {
        if (diameter > this.biomeHeight - newAsteroid.position.y) {
          newAsteroid.position.y = this.biomeHeight - diameter;
        }
      }
      asteroids.push(newAsteroid);
    }
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
      this.asteroidsBG.push(
        new Asteroid(this.biomeHeight, this.startHeight, this.endHeight, this.beltHeight, this.staticBeltHeight, true)
      );
      this.asteroidDelayBG = random(this.minAsteroidDelayBG, this.maxAsteroidDelayBG);
    }

    if (this.asteroidDelayFG <= 0) {
      this.asteroidsFG.push(
        new Asteroid(this.biomeHeight, this.startHeight, this.endHeight, this.beltHeight, this.staticBeltHeight, false)
      );
      this.asteroidDelayFG = random(this.minAsteroidDelayFG, this.maxAsteroidDelayFG);
    }

    this.layersBG[this.layersBG.length - 1].content.forEach((astStat) => astStat.update()); // We assume that static asteroids are always in the last layer :P
    this.layersFG[0].content.forEach((astStat) => astStat.update()); 
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
    this.layersFG.forEach((layer) => layer.draw(topY));
  }

  drawStartFG(topY) {
    this.drawCloudTransition(topY, true);
  }

  drawEndFG(topY) {
    this.drawCloudTransition(topY + this.biomeHeight, false);
  }

  drawCloudTransition(yAnchor, isTop) {
    push();
    noStroke();

    const cloudLayers = 5;
    let totalHeight = isTop ? this.startHeight : this.endHeight;
    let layerGap = totalHeight / cloudLayers / 2;
    let layerOffset = 0;
    for (let l = 0; l < cloudLayers; l++) {
      let h = map(l, 0, cloudLayers - 1, 200, 275);
      let b = map(l, 0, cloudLayers - 1, 60, 25);
      let a = map(l, 0, cloudLayers - 1, 0.5, 0.1);
      fill(h, 100, b, a);

      for (let x = -100; x < width + 100; x += 60) {
        let n = noise(x * 0.008, l * 0.5);
        let cloudSize = (n + 1) * 4 * layerGap;
        let verticalDrift = n * 120;

        let finalY = isTop ? yAnchor + layerOffset + verticalDrift - 60 : yAnchor - layerOffset - verticalDrift + 60;
        ellipse(x, finalY, cloudSize, cloudSize * 0.5);
      }
      layerOffset += layerGap;
    }
    pop();
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
          this.staticBeltHeight,
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
