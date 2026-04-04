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

  constructor(worldStartY) {
    super(
      worldStartY,
      2000, // biomeHeight
      50, // startOverlapHeight
      400, // startHeight
      400, // endHeight
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
    fill(190, 100, 100);
    rect(0, topY, width, this.biomeHeight);
    pop();
  }

  drawStartFG(topY) {
    push();

    let { sandTop, sandBottom, waterTop } = this.getShoreCoordinates(topY);
    let sandWaves = [];
    let waterWaves = [];
    for (let i = 0; i <= this.waveSegments; i++) {
      let x = (i / this.waveSegments) * width;
      sandWaves.push({ x, y: this.computeWaveOffset("sand", x) });
      waterWaves.push({ x, y: this.computeWaveOffset("water", x) });
    }

    this.drawSand(topY, sandWaves, sandTop, sandBottom);
    this.drawWater(waterWaves, waterTop, sandWaves, sandBottom);
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
      sandTop: topY - this.startOverlapHeight,
      sandBottom: topY + this.startHeight / 2,
      waterTop: topY + this.startHeight / 2 - this.waterOverlap
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
    fill(40, 38, 92);

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
}
