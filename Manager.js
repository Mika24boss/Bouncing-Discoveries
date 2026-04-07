class Manager {
  static state = "IDLE_TITLE"; // IDLE_TITLE, ANIM_TITLE, PLAYING

  biomes = [];
  cameraWorldY = 0;
  lerpSpeed = 0.1; // Adjust smoothing factor for camera movement
  currentBiome = null;
  idleRestartTime = 600; // Frames until auto-restart when idle
  idleFrames = 0;

  constructor() {
    this.ball = new Ball(width / 2, height / 3);

    const biomes = [StartBiome, AbstractBiome, MatrixBiome];
    const biomeMusic = [startMusic, abstractMusic, matrixMusic, oceanMusic, spaceMusic];
    let currentWorldY = 0;

    for (let i = 0; i < biomes.length; i++) {
      let BiomeClass = biomes[i];
      let instance = new BiomeClass(currentWorldY, this.ball);
      instance.music = biomeMusic[i];

      this.biomes.push(instance);
      currentWorldY += instance.biomeHeight;
    }
    this.totalWorldHeight = currentWorldY;
    this.ball.setTotalWorldHeight(this.totalWorldHeight);
    this.currentBiome = this.biomes[0];
    this.currentMusic = null;
  }

  updateMusic() {
    let targetMusic = this.currentBiome.music;
    if (!targetMusic) return;
    if (targetMusic === this.currentMusic) return;

    // Fade out current music
    if (this.currentMusic) {
      this.currentMusic.setVolume(0, 0.5);
      this.currentMusic.stop(0.5);
    }

    // Play next music
    this.currentMusic = targetMusic;
    this.currentMusic.loop();
    this.currentMusic.setVolume(1.0, 0.5);
  }

  update() {
    this.ball.update(this.currentBiome.gravity, this.currentBiome.maxVelocity);
    this.ball.checkWorldEdges();

    this.currentBiome = null;
    for (let biome of this.biomes) {
      let topY = biome.worldStartY - this.cameraWorldY;
      if (!biome.isOnScreen(topY)) continue;

      biome.update(topY);

      if (!this.currentBiome && this.ball.worldCenterPos.y <= biome.worldStartY + biome.biomeHeight) {
        this.currentBiome = biome;
      }
    }

    this.updateMusic();

    if (
      this.ball.velocity.magSq() < 0.1 &&
      Manager.state === "PLAYING" &&
      this.ball.worldCenterPos.y + this.ball.radius > this.totalWorldHeight - 1
    ) {
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

  userInput(isStartButton = false, isPause = false) {
    this.idleFrames = 0;

    if (isPause && Manager.state === "PLAYING") {
      if (paused) {
        this.currentMusic.pause();
      } else {
        this.currentMusic.loop();
      }
    }

    if (Manager.state === "IDLE_TITLE") {
      userStartAudio();
    }

    if (Manager.state === "IDLE_TITLE" && isStartButton) {
      Manager.state = "ANIM_TITLE";
    }
  }

  restart() {
    if (this.currentMusic && this.currentMusic.isPlaying()) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }

    for (let biome of this.biomes) {
      biome.reset();
    }

    Manager.state = "IDLE_TITLE";
    this.cameraWorldY = 0;
    this.currentBiome = this.biomes[0];
    this.ball.velocity.set(0, 0);
    this.ball.worldCenterPos.set(width / 2, height / 3);
  }
}
