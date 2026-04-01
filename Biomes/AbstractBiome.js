class AbstractBiome extends Biome {
  decorativeStyles = [
    new DecorativeRectStyle({
      parallaxScale: 0.4,
      isBackground: true,
      color: color(52, 50, 95, 1),
      minHW: 10,
      maxHW: 20,
      minHH: 10,
      maxHH: 20,
      density: 0.1,
    }),
    new DecorativeRectStyle({
      parallaxScale: 0.6,
      isBackground: true,
      color: color(270, 55, 100, 0.5),
      minHW: 20,
      maxHW: 30,
      minHH: 30,
      maxHH: 50,
      density: 0.05,
    }),
    new DecorativeRectStyle({
      parallaxScale: 0.8,
      isBackground: true,
      color: color(300, 45, 100, 0.7),
      minHW: 50,
      maxHW: 70,
      minHH: 20,
      maxHH: 30,
      density: 0.1,
    }),
    new DecorativeRectStyle({
      parallaxScale: 2,
      isBackground: false,
      color: color(0, 0, 100, 0.4),
      minHW: 50,
      maxHW: 150,
      minHH: 50,
      maxHH: 150,
      density: 0.05,
    }),
  ];

  interactiveStyles = [
    new InteractiveRectStyle({
      colors: [color(38, 60, 100, 0.8), color(350, 80, 85), color(250, 90, 80), color(140, 70, 60)],
      minHW: 30,
      maxHW: 60,
      minHH: 30,
      maxHH: 60,
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
      20 // maxVelocity
    );

    for (let style of this.decorativeStyles) {
      let scale = style.parallaxScale;
      let parallaxLayer = new ParallaxLayer(scale, this.biomeHeight);

      let numberOfShapes = width * style.density;
      for (let i = 0; i < numberOfShapes; i++) {
        let newShape = new DecorativeRectangle(this.biomeHeight, parallaxLayer.layerHeight, style);
        parallaxLayer.content.push(newShape);
      }
      if (style.isBackground) this.layersBG.push(parallaxLayer);
      else this.layersFG.push(parallaxLayer);
    }

    for (let style of this.interactiveStyles) {
      let numberOfShapes = width * style.density;
      for (let i = 0; i < numberOfShapes; i++) {
        let newShape = new InteractiveRectangle(this.biomeHeight, this.worldStartY, style);
        this.interactiveShapes.push(newShape);
      }
    }
  }

  update(ball, topY) {
    for (let shape of this.interactiveShapes) {
      if (!shape.isOnScreen(shape.localCenterY + topY)) continue;
      if (!shape.collider.collidesWith(ball)) continue;

      shape.handleCollision(ball);
    }
  }

  drawBodyBG(topY) {
    push();
    fill(195, 55, 100);
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
    fill(140, 85, 100);
    stroke(150, 90, 70);
    strokeWeight(2);
    circle(screenX, screenY, radius * 2);
    pop();
  }

  reset() {
    this.layersBG = [];
    this.layersFG = [];
    this.interactiveShapes = [];

    for (let style of this.decorativeStyles) {
      let scale = style.parallaxScale;
      let parallaxLayer = new ParallaxLayer(scale, this.biomeHeight);

      let numberOfShapes = width * style.density;
      for (let i = 0; i < numberOfShapes; i++) {
        let newShape = new DecorativeRectangle(this.biomeHeight, parallaxLayer.layerHeight, style);
        parallaxLayer.content.push(newShape);
      }
      if (style.isBackground) this.layersBG.push(parallaxLayer);
      else this.layersFG.push(parallaxLayer);
    }

    for (let style of this.interactiveStyles) {
      let numberOfShapes = width * style.density;
      for (let i = 0; i < numberOfShapes; i++) {
        let newShape = new InteractiveRectangle(this.biomeHeight, this.worldStartY, style);
        this.interactiveShapes.push(newShape);
      }
    }
  }
}
