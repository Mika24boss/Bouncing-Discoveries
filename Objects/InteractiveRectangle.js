class InteractiveRectangle {
  constructor(biome, style) {
    this.localCenterX = random() * width;
    let spawnPaddingTop = 400; // Prevent spawning too close to the start of the biome
    this.localCenterY =
      random() * (biome.biomeHeight - biome.startHeight - biome.endHeight - spawnPaddingTop) +
      biome.startHeight +
      spawnPaddingTop;

    this.hw = random() * (style.maxHW - style.minHW) + style.minHW;
    this.hh = random() * (style.maxHH - style.minHH) + style.minHH;

    this.color = style.color;
    this.biomeHeight = biome.biomeHeight;
    this.startHeight = biome.startHeight;
    this.endHeight = biome.endHeight;
    this.worldStartY = biome.worldStartY;

    this.collider = new RectCollider(this.localCenterX, this.worldStartY + this.localCenterY, this.hw, this.hh, 0.8);
  }

  draw(topY) {
    const screenX = this.localCenterX;
    const screenY = this.localCenterY + topY;
    if (screenY + this.hh < 0 || screenY - this.hh > height) return; // Skip if not on screen
    if (screenY + this.hh < topY + this.startHeight || screenY - this.hh > topY + this.biomeHeight - this.endHeight)
      return; // Skip if not in biome's range

    push();
    noStroke();
    fill(this.color);
    rect(screenX - this.hw, screenY - this.hh, this.hw * 2, this.hh * 2);

    noFill();
    stroke("red");
    strokeWeight(2);
    rect(
      this.collider.worldCenterPos.x - this.collider.hw,
      this.collider.worldCenterPos.y - this.collider.hh - this.worldStartY + topY,
      this.collider.hw * 2,
      this.collider.hh * 2
    );
    pop();
  }
}
