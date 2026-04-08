class Manager {
  static state = "IDLE_TITLE"; // IDLE_TITLE, ANIM_TITLE, PLAYING

  biomes = [];
  cameraWorldY = 0;
  lerpSpeed = 0.1; // Adjust smoothing factor for camera movement
  currentBiome = null;
  idleRestartTime = 600; // Frames until auto-restart when idle
  idleStartTime = 600; // Frames until auto-start from the title screen
  idleFrames = 0;

  blastRadius = 300;
  blastParticleRadius = 150;
  blastStrength = 50;
  nbSplotches = 10;

  constructor() {
    this.ball = new Ball(width / 2, height / 3);

    const biomes = [StartBiome, AbstractBiome, MatrixBiome, OceanBiome, SpaceBiome];
    const biomeMusic = [startMusic, abstractMusic, matrixMusic, oceanMusic, spaceMusic];
    this.loadMusic(biomeMusic);
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

    this.splotches = [];
  }

  updateMusic() {
    let targetMusic = this.currentBiome.music;
    if (!targetMusic) return;

    // Currently playing the right music, check for fade in or fade out
    if (targetMusic === this.currentMusic) {
      let fadeDistance = this.currentBiome.maxVelocity * 200;
      fadeDistance = constrain(fadeDistance, 50, height);
      let fadeInLimit = this.currentBiome.worldStartY + fadeDistance;
      let fadeOutLimit = this.currentBiome.worldStartY + this.currentBiome.biomeHeight - fadeDistance;

      let fadeIn = this.ball.worldCenterPos.y < fadeInLimit; // Fade in when close to the top of the biome
      let fadeOut = this.ball.worldCenterPos.y > fadeOutLimit; // Fade out when close to the bottom of the biome

      if (this.currentBiome instanceof StartBiome) {
        fadeIn = false; // Don't fade in the start biome
        fadeOut &&= this.currentBiome.clawState === "DROPPING"; // Only fade out when the ball is falling
      }
      if (this.currentBiome instanceof SpaceBiome) {
        fadeOut = false; // Don't fade out in the space biome since it's the end
      }

      if (fadeIn) {
        let volume = (this.ball.worldCenterPos.y - this.currentBiome.worldStartY) / fadeDistance;
        this.currentMusic.setVolume(volume);
      } else if (fadeOut) {
        let volume = 1 - (this.ball.worldCenterPos.y - fadeOutLimit) / fadeDistance;
        this.currentMusic.setVolume(volume);
      }
      return;
    }

    // Switch to a different music
    if (this.currentMusic) {
      this.currentMusic.stop();
    }
    this.currentMusic = targetMusic;
    this.currentMusic.loop();
    if (this.currentBiome instanceof StartBiome) this.currentMusic.setVolume(1);
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
    } else if (Manager.state === "IDLE_TITLE") {
      this.idleFrames++;
    } else {
      this.idleFrames = 0;
    }
    if (Manager.state === "PLAYING" && this.idleFrames > this.idleRestartTime) this.restart();
    else if (Manager.state === "IDLE_TITLE" && this.idleFrames > this.idleStartTime) Manager.state = "ANIM_TITLE";

    for (let i = this.splotches.length - 1; i >= 0; i--) {
      this.splotches[i].update();
      if (this.splotches[i].isDead()) this.splotches.splice(i, 1);
    }
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

    push();
    for (let splotch of this.splotches) {
      splotch.draw(this.cameraWorldY);
    }
    pop();

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

  handleExplosion() {
    let mouseWorldY = mouseY + this.cameraWorldY;
    let dx = this.ball.worldCenterPos.x - mouseX;
    let dy = this.ball.worldCenterPos.y - mouseWorldY;
    let distSquared = dx * dx + dy * dy;

    // Create visual splotches at mouse click
    for (let i = 0; i < this.nbSplotches; i++) {
      this.splotches.push(new Splotch(mouseX, mouseWorldY));
    }

    // Apply forces to particles within the blast radius
    let oceanBiome = this.biomes[3]; // I know the ocean biome is the 4th one, don't crucify me please
    if (mouseWorldY > oceanBiome.worldStartY && mouseWorldY < oceanBiome.worldStartY + oceanBiome.biomeHeight) {
      for (let p of oceanBiome.particles) {
        let pdx = p.position.x - mouseX;
        let pdy = p.position.y + oceanBiome.worldStartY - mouseWorldY;
        let pDistSq = pdx * pdx + pdy * pdy;

        if (pDistSq >= this.blastParticleRadius * this.blastParticleRadius || pDistSq === 0) continue;

        let pDist = sqrt(pDistSq);
        let pPower = map(pDist, 0, this.blastParticleRadius, this.blastStrength, 0);
        p.applyExplosionForce((pdx / pDist) * pPower, (pdy / pDist) * pPower, 1 - pDist / this.blastParticleRadius);
      }
    }

    // Apply blast force to the ball if within the blast radius
    if (distSquared >= this.blastRadius * this.blastRadius || distSquared === 0) return;

    let distance = sqrt(distSquared);
    let power = map(distance, 0, this.blastRadius, this.blastStrength, 0);
    let forceX = (dx / distance) * power;
    let forceY = (dy / distance) * power;

    this.ball.applyForce(forceX, forceY);
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

  loadMusic(biomeMusic) {
    // Preload and immediately stop each music to prevent lag spikes later
    for (let music of biomeMusic) {
      if (!music) continue;
      music.setVolume(0);
      music.play();
      music.stop();
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
    this.idleFrames = 0;
    this.cameraWorldY = 0;
    this.currentBiome = this.biomes[0];
    this.ball.velocity.set(0, 0);
    this.ball.worldCenterPos.set(width / 2, height / 3);
  }
}
