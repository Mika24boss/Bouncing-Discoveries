class Manager {
  biomes = [];
  cameraWorldY = 0;
  lerpSpeed = 0.1; // Adjust smoothing factor for camera movement

  constructor() {
    const biomes = [SpaceBiome, MatrixBiome, AbstractBiome];
    let currentWorldY = 0;

    for (let BiomeClass of biomes) {
      this.biomes.push(new BiomeClass(currentWorldY));
      currentWorldY += this.biomes[this.biomes.length - 1].biomeHeight;
    }
    this.totalWorldHeight = currentWorldY;

    this.ball = new Ball(width / 2, height / 3, this.totalWorldHeight);
  }

  drawScene() {
    // Background
    let currentBiome = null;
    for (let biome of this.biomes) {
      biome.drawBackground(this.cameraWorldY);

      if (
        !currentBiome &&
        this.ball.worldPosition.y >= biome.worldStartY &&
        this.ball.worldPosition.y <= biome.worldStartY + biome.biomeHeight
      ) {
        currentBiome = biome;
      }
    }

    // Ball
    let ballScreenY = this.ball.worldPosition.y - this.cameraWorldY;
    this.ball.update(currentBiome.gravity, currentBiome.maxVelocity);
    this.ball.checkWorldEdges();
    currentBiome.drawBall(this.ball.worldPosition.x, ballScreenY, this.ball.radius);

    // Foreground
    for (let biome of this.biomes) {
      biome.drawForeground(this.cameraWorldY);
    }

    // Update camera
    let targetCameraY = this.ball.worldPosition.y - height / 3;
    if (targetCameraY < 0) targetCameraY = 0;
    else if (targetCameraY > this.totalWorldHeight - height) targetCameraY = this.totalWorldHeight - height;
    this.cameraWorldY += (targetCameraY - this.cameraWorldY) * this.lerpSpeed;
  }

  pushBall(x, y) {
    this.ball.applyForce(x, y);
  }
}
