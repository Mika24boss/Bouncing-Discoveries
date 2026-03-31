class InteractiveRectangle {
  constructor(biomeHeight, worldStartY, style) {
    this.localCenterX = random() * width;
    let spawnPaddingTop = 400; // Prevent spawning too close to the start of the biome
    this.localCenterY = random() * (biomeHeight - spawnPaddingTop) + spawnPaddingTop;

    this.hw = random() * (style.maxHW - style.minHW) + style.minHW;
    this.hh = random() * (style.maxHH - style.minHH) + style.minHH;

    this.color = style.color;
    this.biomeHeight = biomeHeight;
    this.worldStartY = worldStartY;

    this.collider = new RectCollider(this.localCenterX, this.worldStartY + this.localCenterY, this.hw, this.hh, 0.8);
  }

  draw(topY) {
    const screenX = this.localCenterX;
    const screenY = this.localCenterY + topY;
    if (screenY + this.hh < 0 || screenY - this.hh > height) return; // Skip if not on screen
    if (screenY + this.hh < topY || screenY - this.hh > topY + this.biomeHeight)
      return; // Skip if not in biome's range

    let topEdgeY = max(topY, screenY - this.hh);
    let bottomEdgeY = min(topY + this.biomeHeight, screenY + this.hh);

    push();
    noStroke();
    fill(this.color);
    rect(screenX - this.hw, topEdgeY, this.hw * 2, bottomEdgeY - topEdgeY);
    pop();
  }
}
