class Manager {
  static showingTitle = true;
  static titleAnimFramesLeft = 60;

  biomes = [];
  cameraWorldY = 0;
  lerpSpeed = 0.1; // Adjust smoothing factor for camera movement
  currentBiome = null;
  idleRestartTime = 1000; // Frames until auto-restart when idle
  idleFrames = 0;

  constructor() {
    const biomes = [StartBiome, AbstractBiome, MatrixBiome, SpaceBiome];
    let currentWorldY = 0;

    for (let BiomeClass of biomes) {
      this.biomes.push(new BiomeClass(currentWorldY));
      currentWorldY += this.biomes[this.biomes.length - 1].biomeHeight;
    }
    this.totalWorldHeight = currentWorldY;
    this.currentBiome = this.biomes[0];

    this.ball = new Ball(width / 2, height / 3, this.totalWorldHeight);
  }

  update() {
    if (!Manager.showingTitle && Manager.titleAnimFramesLeft > 0) {
      Manager.titleAnimFramesLeft--;
    }

    this.ball.update(this.currentBiome.gravity, this.currentBiome.maxVelocity);
    this.ball.checkWorldEdges();

    this.currentBiome = null;
    for (let biome of this.biomes) {
      let topY = biome.worldStartY - this.cameraWorldY;
      if (!biome.isOnScreen(topY)) continue;

      biome.update(this.ball, topY);

      if (!this.currentBiome && this.ball.worldCenterPos.y <= biome.worldStartY + biome.biomeHeight) {
        this.currentBiome = biome;
      }
    }

    if (
      this.ball.velocity.magSq() < 0.1 &&
      !Manager.showingTitle &&
      this.ball.worldCenterPos.y + this.ball.radius > this.totalWorldHeight - 1
    ) {
      console.log("Idle frames: " + this.idleFrames);
      this.idleFrames++;
    } else {
      this.idleFrames = 0;
    }
    if (this.idleFrames > this.idleRestartTime) this.restart();
  }

  drawScene() {
    // Background
    for (let biome of this.biomes) {
      biome.drawBackground(this.cameraWorldY);
    }

    // Ball
    let ballScreenY = this.ball.worldCenterPos.y - this.cameraWorldY;
    this.currentBiome.drawBall(this.ball.worldCenterPos.x, ballScreenY, this.ball.radius);

    // Foreground
    for (let biome of this.biomes) {
      biome.drawForeground(this.cameraWorldY);
    }

    // Update camera
    let targetCameraY = this.ball.worldCenterPos.y - height / 3;
    if (targetCameraY < 0) targetCameraY = 0;
    else if (targetCameraY > this.totalWorldHeight - height) targetCameraY = this.totalWorldHeight - height;
    this.cameraWorldY += (targetCameraY - this.cameraWorldY) * this.lerpSpeed;
  }

  pushBall(x, y) {
    this.ball.velocity.x = x;
    this.ball.velocity.y = y;
  }

  userInput() {
    Manager.showingTitle = false;
    this.idleFrames = 0;
  }

  restart() {
    for (let biome of this.biomes) {
      biome.reset();
    }

    Manager.showingTitle = true;
    Manager.titleAnimFramesLeft = 60;
    this.cameraWorldY = 0;
    this.currentBiome = this.biomes[0];
    this.ball = new Ball(width / 2, height / 3, this.totalWorldHeight);
  }
}
