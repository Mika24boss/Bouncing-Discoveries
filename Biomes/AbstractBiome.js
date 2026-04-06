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
      minSizeScaleAt1080p: 0.75,
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
      minSizeScaleAt1080p: 0.75,
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
      minSizeScaleAt1080p: 0.75,
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
      minSizeScaleAt1080p: 0.75,
      density: 0.05,
    }),
  ];

  interactiveStyles = [
    new InteractiveRectStyle({
      colors: [color(38, 60, 100, 0.8), color(350, 80, 85), color(250, 90, 80), color(140, 70, 60)],
      minHW: 40,
      maxHW: 80,
      minHH: 40,
      maxHH: 80,
      minSizeScaleAt1080p: 0.75,
      density: 0.04,
    }),
  ];

  layersBG = [];
  layersFG = [];
  interactiveShapes = [];
  transitionRects = [];

  constructor(worldStartY, ball) {
    super(
      worldStartY,
      5000, // biomeHeight
      150, // startOverlapHeight
      150, // startHeight
      100, // endHeight
      0.3, // gravity
      20, // maxVelocity
      ball
    );

    this.generateShapes();
    this.generateTransitionRects();
  }

  update(topY) {
    for (let shape of this.interactiveShapes) {
      if (!shape.isOnScreen(shape.localCenterY + topY)) continue;
      if (!shape.collider.collidesWith(this.ball)) continue;

      shape.handleCollision(this.ball);
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
    noStroke();

    for (let r of this.transitionRects) {
      fill(r.color);
      rect(r.x, topY + r.topEdge, r.width, r.height);
    }
    pop();
  }

  drawBall(screenX, screenY, radius) {
    push();
    fill(this.ball.color);
    stroke(0, 0, 0, 0.2);
    strokeWeight(1);
    circle(screenX, screenY, radius * 2);
    pop();
  }

  reset() {
    this.generateShapes();
    this.generateTransitionRects();
  }

  generateShapes() {
    this.layersBG = [];
    this.layersFG = [];
    this.interactiveShapes = [];

    for (let style of this.decorativeStyles) {
      let scale = style.parallaxScale;
      let parallaxLayer = new ParallaxLayer(scale, this.biomeHeight);

      let numberOfShapes = width * height * style.density / 1000;
      for (let i = 0; i < numberOfShapes; i++) {
        let newShape = new DecorativeRectangle(this.biomeHeight, parallaxLayer.layerHeight, style);
        parallaxLayer.content.push(newShape);
      }
      if (style.isBackground) this.layersBG.push(parallaxLayer);
      else this.layersFG.push(parallaxLayer);
    }

    for (let style of this.interactiveStyles) {
      let numberOfShapes = width * height * style.density / 1000;
      for (let i = 0; i < numberOfShapes; i++) {
        let newShape = new InteractiveRectangle(this.biomeHeight, this.worldStartY, style);
        this.interactiveShapes.push(newShape);
      }
    }
  }

  generateTransitionRects() {
    this.transitionRects = [];
    let currentX = 0;
    const colorChoices = [
      color(51, 45, 100, 0.8),
      color(120, 46, 95, 0.8),
      color(223, 80, 95, 0.8),
      color(260, 53, 100, 0.8),
    ];
    while (currentX < width) {
      let rectWidth = random(60, 120);
      let topEdge = -random(this.startOverlapHeight / 3, this.startOverlapHeight);
      let bottomEdge = random(this.startHeight / 10, this.startHeight / 3);

      this.transitionRects.push({
        x: currentX,
        width: rectWidth,
        height: bottomEdge - topEdge,
        topEdge: topEdge,
        color: random(colorChoices)
      });
      currentX += rectWidth - random(10, 30);
    }
    currentX = 0;
    while (currentX < width) {
      let rectWidth = random(60, 120);
      let topEdge = -random(this.startOverlapHeight / 10, this.startOverlapHeight / 3);
      let bottomEdge = random(this.startHeight / 3, this.startHeight);

      this.transitionRects.push({
        x: currentX,
        width: rectWidth,
        height: bottomEdge - topEdge,
        topEdge: topEdge,
        color: random(colorChoices)
      });
      currentX += rectWidth - random(10, 30);
    }
    this.transitionRects.sort(() => random() - 0.5)
  }
}
