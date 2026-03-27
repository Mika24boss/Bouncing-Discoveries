class OceanBiome extends Biome {
  constructor(worldStartY) {
    super(
      worldStartY,
      5000, // biomeHeight
      50, // startOverlapHeight
      200, // startHeight
      200, // endHeight
      0.5, // gravity
      10 // maxVelocity
    );
  }

  drawBall(screenX, screenY, radius) {
    push();
    fill(180, 100, 100);
    stroke(255);
    strokeWeight(2);
    circle(screenX, screenY, radius * 2);
    pop();
  }
}
