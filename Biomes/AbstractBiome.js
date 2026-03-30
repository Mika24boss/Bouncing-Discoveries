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
      density: 0.1,
    }),
    new RectangleStyle({
      parallaxScale: 0.6,
      isBackground: true,
      color: color(30, 100, 80),
      minHW: 20,
      maxHW: 30,
      minHH: 30,
      maxHH: 50,
      density: 0.05,
    }),
    new RectangleStyle({
      parallaxScale: 0.8,
      isBackground: true,
      color: color(60, 100, 100),
      minHW: 50,
      maxHW: 70,
      minHH: 20,
      maxHH: 30,
      density: 0.1,
    }),
    new RectangleStyle({
      parallaxScale: 2,
      isBackground: false,
      color: color(0, 0, 100, 0.8),
      minHW: 50,
      maxHW: 150,
      minHH: 50,
      maxHH: 150,
      density: 0.05,
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
      density: 0.04,
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

      let numberOfShapes = width * style.density;
      for (let i = 0; i < numberOfShapes; i++) {
        let newShape = new DecorativeRectangle(this, parallaxLayer.layerHeight, style);
        parallaxLayer.content.push(newShape);
      }
      if (style.isBackground) this.layersBG.push(parallaxLayer);
      else this.layersFG.push(parallaxLayer);
    }

    for (let style of this.interactiveStyles) {
      let numberOfShapes = width * style.density;
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

    this.layersBG.forEach((layer) => layer.draw(topY));

    for (let shape of this.interactiveShapes) {
      shape.draw(topY);
    }
  }

  drawBodyFG(topY) {
    this.layersFG.forEach((layer) => layer.draw(topY));
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
