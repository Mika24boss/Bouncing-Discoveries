class DecorativeRectangle {
  constructor(biome, layerHeight, style) {
    this.localCenterX = random() * width;
    this.localCenterY = random() * layerHeight;

    this.hw = random() * (style.maxHW - style.minHW) + style.minHW;
    this.hh = random() * (style.maxHH - style.minHH) + style.minHH;

    this.color = style.color;
    this.biomeHeight = biome.biomeHeight;
    this.startHeight = biome.startHeight;
    this.endHeight = biome.endHeight;
  }

  draw(topY, scaledTopY) {
    const screenX = this.localCenterX;
    const screenY = scaledTopY + this.localCenterY;
    if (screenY + this.hh < 0 || screenY - this.hh > height) return; // Skip if not on screen
    if (screenY + this.hh < topY + this.startHeight || screenY - this.hh > topY + this.biomeHeight - this.endHeight)
      return; // Skip if not in biome's range

    push();
    noStroke();
    fill(this.color);
    rect(screenX - this.hw, screenY - this.hh, this.hw * 2, this.hh * 2);
    pop();
  }
}
