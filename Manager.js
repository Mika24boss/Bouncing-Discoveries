class Manager {
  biomes = [];
  cameraWorldY = 0;
  lerpSpeed = 0.1; // Adjust smoothing factor for camera movement
  currentBiome = null;

  constructor() {
    const biomes = [MatrixBiome, AbstractBiome, SpaceBiome];
    let currentWorldY = 0;

    for (let BiomeClass of biomes) {
      this.biomes.push(new BiomeClass(currentWorldY));
      currentWorldY += this.biomes[this.biomes.length - 1].biomeHeight;
    }
    this.totalWorldHeight = currentWorldY;

    this.ball = new Ball(width / 2, height / 3, this.totalWorldHeight);
  }

  update() {
    this.currentBiome = null;
    for (let biome of this.biomes) {
      if (!biome.isOnScreen(biome.worldStartY - this.cameraWorldY)) continue;

      biome.update(this.ball);

      if (!this.currentBiome && this.ball.worldCenterPos.y <= biome.worldStartY + biome.biomeHeight) {
        this.currentBiome = biome;
      }
    }

    this.ball.update(this.currentBiome.gravity, this.currentBiome.maxVelocity);
    this.ball.checkWorldEdges();
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
}
