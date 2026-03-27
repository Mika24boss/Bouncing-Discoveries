class AbstractBiome extends Biome {
  static startOverlapHeight = 50;

  constructor(worldStartHeight) {
    super(
      worldStartHeight,
      10000, // biomeHeight
      AbstractBiome.startOverlapHeight,
      200, // startHeight
      200, // endHeight
      0.5, // gravity
      10 // maxVelocity
    );
  }

  drawBall(screenX, screenY, radius) {
  }
}
