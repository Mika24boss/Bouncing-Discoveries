class DecorativeRectangle {
  constructor(biomeHeight, layerHeight, style) {
    this.localCenterX = random() * width;
    this.localCenterY = random() * layerHeight;

    this.hw = random() * (style.maxHW - style.minHW) + style.minHW;
    this.hh = random() * (style.maxHH - style.minHH) + style.minHH;

    this.color = style.color;
    this.biomeHeight = biomeHeight;
  }

  draw(topY, scaledTopY) {
    const screenX = this.localCenterX;
    const screenY = scaledTopY + this.localCenterY;
    if (!this.isOnScreen(screenY)) return;
    if (screenY + this.hh < topY || screenY - this.hh > topY + this.biomeHeight) return; // Skip if not in biome's range

    let topEdgeY = max(topY, screenY - this.hh);
    let bottomEdgeY = min(topY + this.biomeHeight, screenY + this.hh);

    push();
    noStroke();
    fill(this.color);
    rect(screenX - this.hw, topEdgeY, this.hw * 2, bottomEdgeY - topEdgeY);
    pop();
  }

  isOnScreen(screenY) {
    return screenY + this.hh >= 0 && screenY - this.hh <= height;
  }
}

class DecorativeRectStyle {
  constructor({ parallaxScale, isBackground, color, minHW, maxHW, minHH, maxHH, density }) {
    this.parallaxScale = parallaxScale;
    this.isBackground = isBackground;
    this.color = color;
    this.minHW = minHW;
    this.maxHW = maxHW;
    this.minHH = minHH;
    this.maxHH = maxHH;
    this.density = density;
  }
}
