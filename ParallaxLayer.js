class ParallaxLayer {
  constructor(scale, spawnHeight, biomeHeight, content = []) {
    this.scale = scale;
    this.spawnHeight = spawnHeight;
    this.biomeHeight = biomeHeight;
    this.content = content; // Could be anything, like a list of shapes to scroll on screen for example
  }

  scaleTopY(topY) {
    let screenCenter = height / 2;
    let distanceFromCenter = topY + this.biomeHeight / 2 - screenCenter; // Distance between spawnable zone's middle and the screen center
    let scaledDistance = distanceFromCenter * this.scale; // Scale that distance based on the layer's parallax scale

    let scaledMiddleY = screenCenter + scaledDistance; // Get the new middle for the layer based on the scaled distance
    return scaledMiddleY - this.spawnHeight / 2; // Adjust to the top
  }
}
