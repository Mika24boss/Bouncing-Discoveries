class AbstractBiome extends Biome {
  decorativeStyles = [
    new RectangleStyle({
      parallaxScale: 0.4,
      isBackground: true,
      color: color(0, 100, 60),
      minHW: 10,
      maxHW: 20,
      minHH: 10,
      maxHH: 20,
      density: 0.01,
    }),
    new RectangleStyle({
      parallaxScale: 0.6,
      isBackground: true,
      color: color(30, 100, 80),
      minHW: 20,
      maxHW: 30,
      minHH: 30,
      maxHH: 50,
      density: 0.005,
    }),
    new RectangleStyle({
      parallaxScale: 0.8,
      isBackground: true,
      color: color(60, 100, 100),
      minHW: 50,
      maxHW: 70,
      minHH: 20,
      maxHH: 30,
      density: 0.01,
    }),
    new RectangleStyle({
      parallaxScale: 2,
      isBackground: false,
      color: color(0, 0, 100, 0.8),
      minHW: 50,
      maxHW: 150,
      minHH: 50,
      maxHH: 150,
      density: 0.005,
    }),
  ];

  interactiveStyles = [
    new RectangleStyle({
      parallaxScale: 1,
      isBackground: true,
      color: color(180, 100, 100),
      minHW: 40,
      maxHW: 80,
      minHH: 40,
      maxHH: 80,
      density: 0.008,
    }),
  ];

  layersBG = [];
  layersFG = [];
  interactiveShapes = [];

  constructor(worldStartY) {
    super(
      worldStartY,
      5000, // biomeHeight
      50, // startOverlapHeight
      100, // startHeight
      100, // endHeight
      0.3, // gravity
      30 // maxVelocity
    );

    for (let style of this.decorativeStyles) {
      let scale = style.parallaxScale;
      let parallaxLayer = new ParallaxLayer(scale, this.biomeHeight);

      let numberOfShapes = this.biomeHeight * style.density;
      for (let i = 0; i < numberOfShapes; i++) {
        let newShape = new DecorativeRectangle(this, parallaxLayer, style);
        parallaxLayer.content.push(newShape);
      }
      if (style.isBackground) this.layersBG.push(parallaxLayer);
      else this.layersFG.push(parallaxLayer);
    }

    for (let style of this.interactiveStyles) {
      let numberOfShapes = this.biomeHeight * style.density;
      for (let i = 0; i < numberOfShapes; i++) {
        let newShape = new InteractiveRectangle(this, style);
        this.interactiveShapes.push(newShape);
      }
    }
  }

  update(ball) {
    for (let shape of this.interactiveShapes) {
      if (!shape.collider.collidesWith(ball)) continue;

      shape.collider.handleCollision(ball);
      break;
    }
  }

  drawBodyBG(topY) {
    push();
    fill(240, 80, 100);
    noStroke();
    rect(0, topY, width, this.biomeHeight);
    pop();

    this.layersBG.forEach(layer => layer.draw(topY));

    for (let shape of this.interactiveShapes) {
      shape.draw(topY);
    }
  }

  drawBodyFG(topY) {
    this.layersFG.forEach(layer => layer.draw(topY));
  }

  drawStartFG(topY) {
    push();
    fill(120, 100, 80);
    rect(0, topY - this.startOverlapHeight, width, this.startHeight + this.startOverlapHeight);
    pop();
  }

  drawEndFG(topY) {
    push();
    fill(240, 100, 80);
    rect(0, topY + this.biomeHeight - this.endHeight, width, this.endHeight);
    pop();
  }

  drawBall(screenX, screenY, radius) {
    push();
    fill(300, 100, 100);
    stroke(255);
    strokeWeight(2);
    circle(screenX, screenY, radius * 2);
    pop();
  }
}

class RectangleStyle {
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

class DecorativeRectangle {
  constructor(biome, parallaxLayer, style) {
    this.localCenterX = random() * width;
    this.localCenterY = random() * parallaxLayer.spawnHeight;

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

class InteractiveRectangle {
  constructor(biome, style) {
    this.localCenterX = random() * width;
    let spawnPaddingTop = 400; // Prevent spawning too close to the start of the biome
    this.localCenterY = random() * (biome.biomeHeight - biome.startHeight - biome.endHeight - spawnPaddingTop) + biome.startHeight + spawnPaddingTop;

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
