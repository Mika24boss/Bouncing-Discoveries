class StartBiome extends Biome {
  titleFont = null;

  title = "BOUNCING DISCOVERIES";
  fontSize = 48;
  ballPool = [];

  constructor(worldStartY, ball) {
    super(
      worldStartY,
      200, // biomeHeight
      0, // startOverlapHeight
      0, // startHeight
      0, // endHeight
      0.5, // gravity
      10, // maxVelocity
      ball
    );

    this.biomeHeight = height * 1.5;
    this.originalFadeOutFrames = 60;
    this.fadeOutFrames = this.originalFadeOutFrames;
    this.titleY = worldStartY + height / 3 + 25;
    this.biomeCollider = new RectCollider(
      width / 2,
      worldStartY + this.biomeHeight / 2,
      width / 2,
      this.biomeHeight / 2,
      0.5
    );

    this.generateColors();
    this.generateClawAndDropper();

    // Ball pool
    this.ballPoolBuffer = createGraphics(width, this.biomeHeight);
    this.ballPoolBuffer.colorMode(HSB);
    this.generateBallPool();
    this.drawBallPoolBuffer();
  }

  update(topY) {
    if (!this.biomeCollider.collidesWith(this.ball)) {
      Manager.state = "PLAYING";
      return;
    }
    if (Manager.state === "PLAYING") {
      this.biomeCollider.handleCollision(this.ball);
      return;
    }

    if (Manager.state === "ANIM_TITLE" && this.clawState === "IDLE") {
      this.clawState = "DESCENDING";
    }

    if (Manager.state === "ANIM_TITLE" && this.fadeOutFrames > 0) {
      this.fadeOutFrames--;
    }

    if (this.clawState === "DESCENDING") {
      this.clawY += 5;
      if (this.clawY > this.fillTopY + (this.fillBottomY - this.fillTopY) * this.clawGrabDepth)
        this.clawState = "ASCENDING";
    }
    if (this.clawState === "ASCENDING") {
      this.clawY -= this.clawSpeed;
      if (this.clawY <= this.clawDropY) this.clawState = "MOVING";
    } else if (this.clawState === "MOVING") {
      let arrived = true;
      if (this.clawX < width - this.dropperWidth / 2) {
        this.clawX += this.clawSpeed;
        arrived = false;
      }
      if (arrived) this.clawState = "DROPPING";
    }

    if (this.clawState !== "DROPPING") {
      this.ball.worldCenterPos.y = this.clawY + this.ball.radius + 10;
      this.ball.worldCenterPos.x = this.clawX;
    }
  }

  drawBodyBG(topY) {
    push();
    noStroke();
    fill(this.primColor);
    rect(0, topY, width, this.biomeHeight);
    this.drawClaw(topY);
    pop();
  }

  drawBodyFG(topY) {
    let alphaTitle = map(this.fadeOutFrames, 0, this.originalFadeOutFrames, 0.3, 1);
    textAlign(CENTER, CENTER);

    push();
    textFont(StartBiome.titleFont);
    textSize(this.fontSize);
    fill(0, alphaTitle);
    text(this.title, width / 2, this.titleY + topY);
    pop();

    image(this.ballPoolBuffer, 0, topY);
    this.drawStartPrompt();
    this.drawDropper(topY);
  }

  drawBall(screenX, screenY, radius) {
    if (this.clawState === "IDLE" || this.clawState === "DESCENDING") return;
    push();
    fill(this.ball.color);
    stroke(0, 0, 0, 0.2);
    strokeWeight(1);
    circle(screenX, screenY, radius * 2);
    pop();
  }

  generateColors() {
    this.primColor = color(random(360), random(70, 90), random(70, 90)); // For bg and claw
    this.secColor = color(hue(this.primColor), 100, 50); // For claw and dropper
    this.ball.color = color(random(360), random(80, 100), random(80, 100));
  }

  generateClawAndDropper() {
    // Claw
    this.clawState = "IDLE"; // IDLE, DESCENDING, ASCENDING, MOVING, DROPPING
    this.clawX = width / 2;
    this.clawY = 80;
    this.clawDropY = this.clawY;
    this.clawSpeed = 12;
    this.clawGrabDepth = random(0.2, 0.6);

    // Dropper
    this.dropperWidth = 180;
    this.dropperX = width - this.dropperWidth;
    this.dropperY = this.clawY + this.ball.radius * 2 + 80;
    this.dropperHeight = this.biomeHeight - this.dropperY;
  }

  generateBallPool() {
    // Pool properties
    this.fillTopYMin = this.titleY + 200;
    this.fillTopYMax = (height * 3) / 4;
    this.fillTopY = random(this.fillTopYMin, this.fillTopYMax);
    this.fillBottomY = this.biomeHeight;

    let ballRadius = this.ball.radius;
    let ballDiameter = ballRadius * 2;

    // Hexagonal packing algorithm
    let hSpacing = ballDiameter;
    let vSpacing = ballDiameter * sin(radians(60));

    this.ballPool = [];

    let rowIndex = 0;
    for (let y = this.fillTopY + ballRadius; y <= this.fillBottomY - ballRadius; y += vSpacing) {
      let xOffset = rowIndex % 2 === 0 ? 0 : ballRadius; // Offset every other row for hex packing

      for (let x = -50 + ballRadius + xOffset; x <= this.dropperX + 50 - ballRadius; x += hSpacing) {
        this.ballPool.push({
          x: x,
          y: y,
          size: ballDiameter,
          color: color(random(360), random(80, 100), random(80, 100)),
        });
      }
      rowIndex++;
    }
  }

  drawBallPoolBuffer() {
    this.ballPoolBuffer.push();
    this.ballPoolBuffer.fill(0);
    this.ballPoolBuffer.rect(
      0,
      this.fillTopY + this.ball.radius,
      width - this.dropperWidth,
      this.fillBottomY - this.fillTopY
    );

    for (let b of this.ballPool) {
      this.ballPoolBuffer.fill(b.color);
      this.ballPoolBuffer.stroke(0, 0, 0, 0.2);
      this.ballPoolBuffer.strokeWeight(1);
      this.ballPoolBuffer.circle(b.x, b.y, b.size);
    }
    this.ballPoolBuffer.pop();
  }

  drawClaw(topY) {
    let worldClawX = this.clawX;
    let worldClawY = this.clawY + topY;
    let middleWidth = this.ball.radius * 2 + 30;

    // Cable
    stroke(0, 0, 30);
    strokeWeight(8);
    line(worldClawX, topY, worldClawX, worldClawY);

    // Clips
    fill(this.secColor);
    noStroke();
    rectMode(CENTER);
    rect(worldClawX, worldClawY, middleWidth, 18, 5);
    rect(worldClawX - middleWidth / 2, worldClawY + this.ball.radius, 10, middleWidth, 5);
    rect(worldClawX + middleWidth / 2, worldClawY + this.ball.radius, 10, middleWidth, 5);
  }

  drawDropper(topY) {
    let bottomDropperHeight = this.biomeHeight - this.fillTopY;

    // Top part of dropper
    fill(hue(this.secColor), saturation(this.secColor), brightness(this.secColor), 0.4);
    noStroke();
    rect(this.dropperX, topY + this.dropperY, this.dropperWidth, this.dropperHeight - bottomDropperHeight);

    // Bottom part of dropper
    fill(0, 0, 55);
    noStroke();
    rect(this.dropperX, this.fillTopY + topY, this.dropperWidth, bottomDropperHeight);
  }

  drawStartPrompt() {
    if (this.fadeOutFrames > 0) {
      push();
      let progress = this.fadeOutFrames / this.originalFadeOutFrames;
      let alphaPrompt = pow(progress, 2);
      let promptY = this.titleY + 100;
      let pulse = map(sin(frameCount * 0.1), -1, 1, 0.3, 1);
      let finalAlpha = alphaPrompt * pulse;

      textFont(StartBiome.titleFont);
      textSize(22);

      let txt1 = "PRESS  ";
      let txt2 = "ANY BUTTON/KEY";
      let txt3 = "  TO START";

      let w1 = textWidth(txt1);
      let w2 = textWidth(txt2) + 35; // Add padding for the rectangle
      let rectHeight = 40;
      let w3 = textWidth(txt3);
      let totalW = w1 + w2 + w3;
      let startX = (width - totalW) / 2;

      // Draw "PRESS  "
      fill(0, finalAlpha);
      noStroke();
      text(txt1, startX + w1 / 2, promptY);

      // Draw the rounded rectangle
      let rectX = startX + w1 + w2 / 2;
      rectMode(CENTER);
      fill(0, 0, 0, finalAlpha);
      stroke(255, finalAlpha);
      strokeWeight(4);
      rect(rectX, promptY + 3.5, w2, rectHeight, 50);

      // Draw "ANY BUTTON/KEY"
      fill(119, 90, 70, finalAlpha);
      noStroke();
      text(txt2, rectX, promptY);

      // Draw "  TO START"
      fill(0, finalAlpha);
      text(txt3, startX + w1 + w2 + w3 / 2, promptY);

      pop();
    }
  }

  reset() {
    this.fadeOutFrames = this.originalFadeOutFrames;
    this.generateColors();
    this.generateClawAndDropper();
    this.ballPoolBuffer = createGraphics(width, this.biomeHeight);
    this.ballPoolBuffer.colorMode(HSB);
    this.generateBallPool();
    this.drawBallPoolBuffer();
  }
}
