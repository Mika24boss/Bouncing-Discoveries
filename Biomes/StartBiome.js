class StartBiome extends Biome {
  titleFont = null;

  title = "BOUNCING DISCOVERIES";
  fontSize = 48;
  ballPool = [];
  ballPoolFillness = 0.5; // todo: make random
  clawGrabDepth = 0.4; // todo: make random. How far down the claw goes to grab the ball (0 to 1)
  dropperWidth = 180;

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
    this.fillTopY = this.biomeHeight * (1 - this.ballPoolFillness);
    this.fillBottomY = this.biomeHeight;
    this.biomeCollider = new RectCollider(width / 2, worldStartY + this.biomeHeight / 2, width / 2, this.biomeHeight / 2, 0.5);

    // Claw machine
    this.clawX = width / 2;
    this.clawY = 80;
    this.clawState = "IDLE"; // IDLE, DESCENDING, MOVING, DROPPING

    // Dropper
    this.dropperX = width - this.dropperWidth;
    this.dropperY = height * 0.3;
    this.dropperHeight = this.biomeHeight - this.dropperY;

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

    let clawGrabY = this.fillTopY + (this.fillBottomY - this.fillTopY) * this.clawGrabDepth;
    let clawDropY = 100; // todo: make this variable if the height of the dropper is variable
    if (this.clawState === "DESCENDING") {
      this.clawY += 5;
      if (this.clawY > clawGrabY) this.clawState = "MOVING";
    } else if (this.clawState === "MOVING") {
      let arrived = true;
      if (this.clawY > clawDropY) {
        this.clawY -= 5;
        arrived = false;
      }
      if (this.clawX < width - this.dropperWidth / 2) {
        this.clawX += 5;
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
    fill(200, 100, 100); // Todo: random background color and complementary claw color and ball color, matching ball to next biome
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
    fill(240, 100, 100);
    stroke(255);
    strokeWeight(2);
    circle(screenX, screenY, radius * 2);
    pop();
  }

  generateBallPool() {
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
          color: color(random(360), 70, 90),
        }); // todo: change colors
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
    stroke(50);
    strokeWeight(8);
    line(worldClawX, topY, worldClawX, worldClawY);

    // Clips
    fill(255);
    noStroke();
    rectMode(CENTER);
    rect(worldClawX, worldClawY, middleWidth, 18, 5);
    rect(worldClawX - middleWidth / 2, worldClawY + this.ball.radius, 10, middleWidth, 5);
    rect(worldClawX + middleWidth / 2, worldClawY + this.ball.radius, 10, middleWidth, 5);
  }

  drawDropper(topY) {
    let bottomDropperHeight = this.biomeHeight - this.fillTopY;

    // Top part of dropper
    fill(200, 80, 80, 0.5); // todo: change color
    noStroke();
    rect(this.dropperX, topY + this.dropperY, this.dropperWidth, this.dropperHeight - bottomDropperHeight);

    // Bottom part of dropper
    fill(0, 0, 50, 1); // todo: change color
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
    this.clawState = "IDLE";
    this.clawX = width / 2;
    this.clawY = 80;
    this.generateBallPool();
  }
}
