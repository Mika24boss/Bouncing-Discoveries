class ParallaxLayer {
  constructor(scale, biomeHeight, content = []) {
    this.scale = scale;
    this.layerHeight = biomeHeight * abs(scale) + height * abs(1 - abs(scale)); // Calculates the necessary coverage to cover the full range of the biome, including all its scroll positions on the screen
    this.biomeHeight = biomeHeight;
    this.content = content; // List of shapes with a draw(topY, scaledTopY) method
  }

  scaleTopY(topY) {
    let screenCenter = height / 2;
    let distanceFromCenter = topY + this.biomeHeight / 2 - screenCenter; // Distance between spawnable zone's middle and the screen center
    let scaledDistance = distanceFromCenter * this.scale; // Scale that distance based on the layer's parallax scale

    let scaledMiddleY = screenCenter + scaledDistance; // Get the new middle for the layer based on the scaled distance
    return scaledMiddleY - this.layerHeight / 2; // Adjust to the top
  }

  draw(topY) {
    const scaledTopY = this.scaleTopY(topY);
    this.content.forEach(s => s.draw(topY, scaledTopY));
  }
}
