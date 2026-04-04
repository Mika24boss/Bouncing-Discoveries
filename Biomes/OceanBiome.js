class OceanBiome extends Biome {
  ballEmojis = ["🐡", "🐟", "🐠", "🐙", "🏐"]; // todo: change this
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

  constructor(worldStartY) {
    super(
      worldStartY,
      2000, // biomeHeight
      50, // startOverlapHeight
      500, // startHeight
      100, // endHeight
      0.5, // gravity
      3 // maxVelocity
    );
    this.sandSeed = random(1000);
    this.waterSeed = random(1000);
    this.bobaSeed = random(1000);

    this.ballEmoji = random(this.ballEmojis);
    this.generateSand();
    this.generateSeaFoamBoba();
    this.generateRisingBoba();
  }

  drawBodyBG(topY) {
    push();
    for (let i = 0; i < 10; i++) {
      let segmentH = this.biomeHeight / 10;
      let inter = map(i, 0, 10, 0, 1);
      let c = lerpColor(color(205, 100, 100), color(225, 100, 30), inter);
      fill(c);
      noStroke();
      rect(0, topY + i * segmentH, width, segmentH + 1);
    }
    pop();
  }

  drawStartFG(topY) {
    push();

    let { sandTop, sandBottom, waterTop, waterBottom } = this.getShoreCoordinates(topY);
    let sandWaves = [];
    let waterWaves = [];
    for (let i = 0; i <= this.waveSegments; i++) {
      let x = (i / this.waveSegments) * width;
      sandWaves.push({ x, y: this.computeWaveOffset("sand", x) });
      waterWaves.push({ x, y: this.computeWaveOffset("water", x) });
    }

    this.drawSand(topY, sandWaves, sandTop, sandBottom);
    this.drawWater(topY, waterWaves, waterTop, waterBottom);
    this.drawRisingBobas(topY, waterTop);

    pop();

    // noFill();
    // strokeWeight(4);
    // stroke(0, 0, 0)
    // rect(0, topY, width, this.startHeight);
    // pop();
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
      sandTop: topY - this.startOverlapHeight,
      sandBottom: topY + this.startHeight / 2,
      waterTop: topY + this.startHeight / 2 - this.waterOverlap,
      waterBottom: topY + this.startHeight,
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

  drawSand(topY, sandWaves, sandTop, sandBottom) {
    noStroke();
    fill(40, 38, 92); // todo: gradient?

    beginShape();
    vertex(0, sandBottom);
    for (let p of sandWaves) vertex(p.x, sandTop + p.y); // Top wavy edge
    vertex(width, sandBottom);
    for (let i = sandWaves.length - 1; i >= 0; i--) {
      vertex(sandWaves[i].x, sandBottom + sandWaves[i].y); // Bottom wavy edge
    }
    endShape(CLOSE);

    // Sand texture
    for (let i = 0; i < this.sand.length; i++) {
      let { x: grainX, y: grainY, tone, sWeight } = this.sand[i];
      stroke(40 + tone, 38 + tone, 92 + tone);
      strokeWeight(sWeight);
      point(grainX, grainY + topY);
    }

    // Top wet sand edge
    noFill();
    stroke(38, 44, 70);
    strokeWeight(4);

    beginShape();
    for (let p of sandWaves) vertex(p.x, sandTop + p.y);
    endShape();
  }

  drawWater(topY, waterWaves, waterTop, waterBottom) {
    // Shore water
    noStroke();
    fill(174, 70, 88, 0.8); // todo: gradient?
    beginShape();
    vertex(0, waterBottom);
    for (let p of waterWaves) vertex(p.x, waterTop + p.y);
    vertex(width, waterBottom);
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

  generateSand() {
    this.sand = [];
    for (let i = 0; i < this.grainDensity; i++) {
      let grainX = random(width);
      let grainY = random(-this.startOverlapHeight - this.sandAmp, this.startHeight / 2 + this.sandAmp);

      let tone = random(-20, 20);
      let sWeight = random(1, 3);

      let waveTop = -this.startOverlapHeight + this.computeWaveOffset("sand", grainX);
      let waveBottom = this.startHeight / 2 + this.computeWaveOffset("sand", grainX);
      if (grainY >= waveTop && grainY <= waveBottom) {
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
}
