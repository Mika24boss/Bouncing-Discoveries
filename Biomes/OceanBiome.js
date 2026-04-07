class OceanBiome extends Biome {
  ballEmojis = ["🐡", "🐟", "🐠", "🐙"];
  ballEmoji = "";

  // Sand and water wave parameters
  waveSegments = 80; // Wave resolution
  grainDensity = 4000;
  sandFreq = 0.02;
  sandAmp = 15;
  waterOverlap = 80;
  waterFreq = 0.005;
  waterAmp = 50;
  shoreSpeed = 0.02;
  foamDensity = 15;
  bobaDensity = 50;
  bobaFreq = 0.05;
  bobaAmp = 10;

  // Flow field parameters
  CELL_SIZE = 100;
  NOISE_SCALE = 0.08;
  NOISE_TIME_SPEED = 0.05;
  FLOW_MAGNITUDE = 1;
  NB_PARTICLES = 6000;
  timeOffset = 0;

  NB_FISHIES = 20;
  NB_BALOUS = 12;

  constructor(worldStartY, ball) {
    super(
      worldStartY,
      3500, // biomeHeight
      100, // startOverlapHeight
      400, // startHeight
      400, // endHeight
      0.1, // gravity
      2, // maxVelocity
      ball
    );
    this.sandBuffer = createGraphics(width, this.startHeight + this.startOverlapHeight);
    this.sandBuffer.colorMode(HSB);

    this.particleBuffer = createGraphics(width, this.biomeHeight);
    this.particleBuffer.colorMode(HSB);

    this.initBiome();
  }

  initBiome() {
    this.sandSeed = random(1000);
    this.waterSeed = random(1000);
    this.bobaSeed = random(1000);
    this.timeOffset = random(1000);
    this.ballEmoji = random(this.ballEmojis);
    
    this.sandBuffer.clear();
    this.particleBuffer.clear();

    let { sandBottom, sandTop } = this.getShoreCoordinates(this.startOverlapHeight);
    this.generateSand(sandTop, sandBottom);
    this.generateSeaFoamBoba();
    this.generateRisingBoba();

    this.sandWaves = [];
    for (let i = 0; i <= this.waveSegments; i++) {
      let x = (i / this.waveSegments) * width;
      this.sandWaves.push({ x, y: this.computeWaveOffset("sand", x) });
    }
    this.drawSandBuffer(this.sandWaves, sandTop, sandBottom);

    this.rows = ceil(this.biomeHeight / this.CELL_SIZE);
    this.cols = ceil(width / this.CELL_SIZE);
    this.flowField = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.cols }, () => createVector(0, 0))
    );
    this.computeFlowField();

    this.particles = [];
    for (let i = 0; i < this.NB_PARTICLES; i++) {
      this.particles.push(new Particle(this.biomeHeight, this.CELL_SIZE, this.rows, this.cols, this.worldStartY, this.ball.radius));
    }

    this.fishies = [];
    for (let i = 0; i < this.NB_FISHIES; i++) {
      this.fishies.push(new Fish(this.biomeHeight, this.CELL_SIZE, this.rows, this.cols));
    }

    this.balous = [];
    for (let i = 0; i < this.NB_BALOUS; i++) {
      this.balous.push(new Boulder(this.biomeHeight, this.startHeight, this.endHeight, this.worldStartY, this.balous));
    }
  }

  update(topY) {
    if (frameCount % 5 === 0) {
      this.computeFlowField(); // Recompute flow field for dynamic movement
    }

    for (let balou of this.balous) {
      if (!balou.isOnScreen(topY)) continue;
      if (!balou.collider.collidesWith(this.ball)) continue;

      balou.collider.handleCollision(this.ball);
    }

    let circleColliders = this.balous.map((b) => b.collider);
    circleColliders.push(this.ball.collider);
    this.particles.forEach((p) => p.update(this.flowField, circleColliders));
    this.fishies.forEach((f) => f.update(this.flowField));
  }

  drawBodyBG(topY) {
    push();
    fill(190, 100, 100);
    rect(0, topY, width, this.biomeHeight);
    pop();

    this.particleBuffer.background(190, 100, 100, 0.1);
    this.particles.forEach((p) => p.draw(topY, this.particleBuffer));
    image(this.particleBuffer, 0, topY); // Draw the particle canvas onto the main canvas
  }

  drawBodyFG(topY) {
    this.fishies.forEach((f) => f.draw(topY));
    this.balous.forEach((b) => b.draw(topY));
  }

  drawStartFG(topY) {
    push();

    let { sandBottom, waterTop } = this.getShoreCoordinates(topY);
    let waterWaves = [];
    for (let i = 0; i <= this.waveSegments; i++) {
      let x = (i / this.waveSegments) * width;
      waterWaves.push({ x, y: this.computeWaveOffset("water", x) });
    }

    image(this.sandBuffer, 0, topY - this.startOverlapHeight);
    this.drawWater(waterWaves, waterTop, this.sandWaves, sandBottom);
    this.drawRisingBobas(topY, waterTop);

    pop();
  }

  drawEndFG(topY) {
    this.drawWaveTransition(topY + this.biomeHeight - 95);
  }

  drawBall(screenX, screenY, radius) {
    push();
    textSize(radius * 2);
    textAlign(CENTER, CENTER);
    text(this.ballEmoji, screenX, screenY);
    pop();
  }

  getShoreCoordinates(topY) {
    return {
      sandTop: topY - this.startOverlapHeight / 2,
      sandBottom: topY + this.startHeight / 2,
      waterTop: topY + this.startHeight / 2 - this.waterOverlap,
    };
  }

  computeWaveOffset(type, x) {
    switch (type) {
      case "sand":
        return sin((x + this.sandSeed) * this.sandFreq) * this.sandAmp;
      case "water":
        return noise((x + this.waterSeed) * this.waterFreq, frameCount * this.shoreSpeed) * this.waterAmp;
      case "boba":
        return sin((x + this.bobaSeed) * this.bobaFreq + frameCount * 0.05) * this.bobaAmp;
      default:
        return 0;
    }
  }

  drawSandBuffer(sandWaves, sandTop, sandBottom) {
    this.sandBuffer.noStroke();
    this.sandBuffer.fill(40, 38, 92);

    this.sandBuffer.beginShape();
    this.sandBuffer.vertex(0, sandBottom);
    for (let p of sandWaves) this.sandBuffer.vertex(p.x, sandTop + p.y); // Top wavy edge
    this.sandBuffer.vertex(width, sandBottom);
    for (let i = sandWaves.length - 1; i >= 0; i--) {
      this.sandBuffer.vertex(sandWaves[i].x, sandBottom + sandWaves[i].y); // Bottom wavy edge
    }
    this.sandBuffer.endShape(CLOSE);

    // Sand texture
    for (let i = 0; i < this.sand.length; i++) {
      let { x: grainX, y: grainY, tone, sWeight } = this.sand[i];
      this.sandBuffer.stroke(40 + tone, 38 + tone, 92 + tone);
      this.sandBuffer.strokeWeight(sWeight);
      this.sandBuffer.point(grainX, grainY);
    }

    // Top wet sand edge
    this.sandBuffer.noFill();
    this.sandBuffer.stroke(38, 44, 70);
    this.sandBuffer.strokeWeight(4);

    this.sandBuffer.beginShape();
    for (let p of sandWaves) this.sandBuffer.vertex(p.x, sandTop + p.y);
    this.sandBuffer.endShape();
  }

  drawWater(waterWaves, waterTop, sandWaves, sandBottom) {
    // Shore water
    noStroke();
    fill(190, 100, 100, 0.7);
    beginShape();
    for (let p of waterWaves) vertex(p.x, waterTop + p.y);
    for (let i = sandWaves.length - 1; i >= 0; i--) {
      vertex(sandWaves[i].x, sandBottom + sandWaves[i].y); // Bottom wavy edge of sand
    }
    endShape(CLOSE);

    // Sea foam bubbles
    this.seaFoamBoba.forEach((boba) => {
      let shoreY = this.computeWaveOffset("water", boba.x) + waterTop;
      fill(0, 0, 100, boba.alpha);
      circle(boba.x, boba.y + shoreY, boba.size);
    });
  }

  drawRisingBobas(topY, waterTop) {
    push();
    fill(0, 0, 100, 0.4);
    noStroke();
    for (let boba of this.boba) {
      boba.y -= boba.speed;
      let shoreY = waterTop + this.computeWaveOffset("water", boba.x);

      if (topY + boba.y < shoreY || boba.y > this.startHeight) boba.y = this.startHeight;

      let wobble = this.computeWaveOffset("boba", boba.x);
      circle(boba.x + wobble, topY + boba.y - boba.size / 2, boba.size);
    }
    pop();
  }

  generateSand(sandTop, sandBottom) {
    this.sand = [];
    for (let i = 0; i < this.grainDensity; i++) {
      let grainX = random(width);
      let grainY = random(sandTop - this.sandAmp, sandBottom + this.sandAmp);

      let tone = random(-20, 20);
      let sWeight = random(1, 3);

      let waveTop = sandTop + this.computeWaveOffset("sand", grainX);
      let waveBottom = sandBottom + this.computeWaveOffset("sand", grainX);
      if (grainY >= waveTop + sWeight && grainY <= waveBottom - sWeight) {
        this.sand.push({ x: grainX, y: grainY, tone, sWeight });
      }
    }
  }

  generateSeaFoamBoba() {
    this.seaFoamBoba = [];
    for (let x = 0; x <= width; x += this.foamDensity) {
      for (let j = 0; j < 3; j++) {
        let xJitter = random(-10, 10);
        let yJitter = random(-10, 10);
        let bobaSize = random(5, 15);
        let bobaAlpha = random(0.2, 0.8);
        this.seaFoamBoba.push({ x: x + xJitter, y: yJitter, size: bobaSize, alpha: bobaAlpha });
      }
    }
  }

  generateRisingBoba() {
    this.boba = [];
    for (let i = 0; i < this.bobaDensity; i++) {
      this.boba.push({
        x: random(width),
        y: random(-500, this.biomeHeight),
        size: random(5, 15),
        speed: random(1, 3),
      });
    }
  }

  drawWaveTransition(yAnchor) {
    push();
    noStroke();

    const waveLayers = 3;
    let layerGap = 70;
    let layerOffset = 0;
    for (let l = 0; l < waveLayers; l++) {
      let h = map(l, 0, waveLayers - 1, 200, 200);
      let b = map(l, 0, waveLayers - 1, 80, 100);
      let a = map(l, 0, waveLayers - 1, 0.5, 0.1);
      fill(h, 100, b, a);

      for (let x = -100; x < width + 100; x += 40) {
        let n = noise(x * 0.008, l * 0.5);
        let waveSize = (n + 1) * 4 * layerGap;
        let verticalDrift = n * 120;

        let finalY = yAnchor - layerOffset - verticalDrift + 60;
        ellipse(x, finalY, waveSize * 0.9, waveSize * 0.4);
      }
      layerOffset += layerGap;
    }
    pop();
  }

  computeFlowField() {
    for (let rowInd = 0; rowInd < this.rows; rowInd++) {
      for (let colInd = 0; colInd < this.cols; colInd++) {
        // Create angles between pi and 2 pi based on Perlin noise at each cell so it flows upwards
        let angle = noise(rowInd * this.NOISE_SCALE, colInd * this.NOISE_SCALE, this.timeOffset) * PI + PI;
        this.flowField[rowInd][colInd].set(cos(angle) * this.FLOW_MAGNITUDE, sin(angle) * this.FLOW_MAGNITUDE);
      }
    }
    this.timeOffset += this.NOISE_TIME_SPEED; // Increment the time offset to create evolving noise over time
  }

  reset() {
    this.initBiome();
  }
}
