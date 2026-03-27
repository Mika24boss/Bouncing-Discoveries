class Manager {
  biomes = [];
  cameraWorldY = 0;
  lerpSpeed = 0.1; // Adjust smoothing factor for camera movement

  constructor() {
    const biomes = [MatrixBiome, SpaceBiome];
    let currentWorldY = biomes[0].startOverlapHeight; // Add the first biome's overlap since it is subtracted in the loop for all biomes

    for (let BiomeClass of biomes) {
      currentWorldY -= BiomeClass.startOverlapHeight; // Adjust for the start overlap
      this.biomes.push(new BiomeClass(currentWorldY));

      currentWorldY += this.biomes[this.biomes.length - 1].biomeHeight;
    }

    this.ball = new Ball(width / 2, height / 3);
  }

  drawScene() {
    // Background
    let currentBiome = null;
    for (let biome of this.biomes) {
      biome.drawBackground(this.cameraWorldY);

      if (
        !currentBiome &&
        this.ball.worldPosition.y >= biome.worldStartHeight &&
        this.ball.worldPosition.y <= biome.worldStartHeight + biome.biomeHeight
      ) {
        currentBiome = biome;
      }
    }

    // Ball
    let ballScreenY = this.ball.worldPosition.y - this.cameraWorldY;
    this.ball.update(currentBiome.gravity, currentBiome.maxVelocity);
    currentBiome.drawBall(this.ball.worldPosition.x, ballScreenY, this.ball.radius);

    // Foreground
    for (let biome of this.biomes) {
      biome.drawForeground(this.cameraWorldY);
    }

    // Update camera
    let targetCameraY = this.ball.worldPosition.y - height / 3;
    this.cameraWorldY += (targetCameraY - this.cameraWorldY) * this.lerpSpeed;
  }

  pushBall(x, y) {
    this.ball.applyForce(x, y);
  }
}
