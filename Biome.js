class Biome {
  worldStartY; // World y coordinate where the biome starts, not including the start overlap
  biomeHeight; // Total biome height, including the start and end sections, but not including the start overlap
  startOverlapHeight; // Extra overlap height above the biome that extends over the previous biome that isn't counted in the biome height
  startHeight; // Start section height, not including the overlap
  endHeight; // End section height
  gravity; // Biome-specific gravity affecting the player's speed
  maxVelocity; // Biome-specific max velocity for the player

  constructor(worldStartY, biomeHeight, startOverlapHeight, startHeight, endHeight, gravity, maxVelocity) {
    if (this.constructor === Biome) {
      throw new Error("Abstract class 'Biome' cannot be instantiated.");
    }

    this.worldStartY = worldStartY;
    this.biomeHeight = biomeHeight;
    this.startOverlapHeight = startOverlapHeight;
    this.startHeight = startHeight;
    this.endHeight = endHeight;
    this.gravity = gravity;
    this.maxVelocity = maxVelocity;
  }

  drawBackground(cameraWorldY) {
    const topY = this.worldStartY - cameraWorldY;

    if (!this.isOnScreen(topY)) return;

    // Draw the middle section
    this.drawBodyBG(topY);

    // Draw the start section if visible
    if (topY + this.startHeight >= 0) {
      this.drawStartBG(topY);
    }

    // Draw the end section if visible
    if (topY + this.biomeHeight - this.endHeight <= height) {
      this.drawEndBG(topY);
    }
  }

  drawForeground(cameraWorldY) {
    const topY = this.worldStartY - cameraWorldY;

    if (!this.isOnScreen(topY)) return;

    // Draw the middle section
    this.drawBodyFG(topY);

    // Draw the start section if visible
    if (topY + this.startHeight >= 0) {
      this.drawStartFG(topY);
    }

    // Draw the end section if visible
    if (topY + this.biomeHeight - this.endHeight <= height) {
      this.drawEndFG(topY);
    }
  }

  isOnScreen(topY) {
    return topY - this.startOverlapHeight <= height && topY + this.biomeHeight >= 0;
  }

  update(ball) {}
  drawBodyBG(topY) {}
  drawBodyFG(topY) {}
  drawStartBG(topY) {}
  drawStartFG(topY) {}
  drawEndBG(topY) {}
  drawEndFG(topY) {}
  drawBall(screenX, screenY, radius) {
    throw new Error("'drawBall' method isn't implemented.");
  }
}
