class StartBiome extends Biome {
  titleFont = null;

  title = "BOUNCING DISCOVERIES";
  fontSize = 48;
  paddleWidth = 100;
  paddleHeight = 20;

  constructor(worldStartY) {
    super(
      worldStartY,
      2000, // biomeHeight
      0, // startOverlapHeight
      200, // startHeight
      200, // endHeight
      0.5, // gravity
      10 // maxVelocity
    );
    this.biomeHeight = height * 1.5;
    this.originalFrames = Manager.titleAnimFramesLeft;
    this.titleY = worldStartY + height / 2 + 25;
    this.paddle1 = new Paddle(width / 2 - 50, height / 3 + 40, PI / 4, worldStartY);
    this.paddle2 = new Paddle(width / 2 + 50, height / 3 + 40, -PI / 4, worldStartY);

    push();
    textFont(StartBiome.titleFont);
    textSize(this.fontSize);
    if (textWidth(this.title) > width * 0.9) {
      this.title = this.title.split(" ").join("\n");
    }
    pop();
  }

  update(topY) {
    if (Manager.titleAnimFramesLeft > 0 && Manager.titleAnimFramesLeft <= this.originalFrames / 2) {
      let deltaAngle = PI / 4 / (this.originalFrames / 2);
      this.paddle1.rotate(deltaAngle);
      this.paddle2.rotate(-deltaAngle);
    }

    if (this.paddle1.collider.collidesWith(this.ball)) this.paddle1.handleCollision(this.ball);
    if (this.paddle2.collider.collidesWith(this.ball)) this.paddle2.handleCollision(this.ball);
  }

  drawBodyBG(topY) {
    push();
    noStroke();
    fill(200, 100, 100);
    rect(0, topY, width, this.biomeHeight);
    pop();

    this.paddle1.draw(topY);
    this.paddle2.draw(topY);
  }

  drawBodyFG(topY) {
    let blurStrength = map(Manager.titleAnimFramesLeft, 0, this.originalFrames, 0, 6);
    let alpha = map(Manager.titleAnimFramesLeft, 0, this.originalFrames, 0.3, 1);
    push();
    if (Manager.titleAnimFramesLeft > 0) filter(BLUR, blurStrength);

    textFont(StartBiome.titleFont);
    textSize(this.fontSize);
    textAlign(CENTER, CENTER);
    fill(0, alpha);
    text(this.title, width / 2, this.titleY + topY);
    pop();
  }

  drawBall(screenX, screenY, radius) {
    push();
    fill(240, 100, 100);
    stroke(255);
    strokeWeight(2);
    circle(screenX, screenY, radius * 2);
    pop();
  }

  reset() {
    this.paddle1.rotate(-PI / 4);
    this.paddle2.rotate(PI / 4);
  }
}
