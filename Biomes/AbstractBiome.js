class AbstractBiome extends Biome {
  parallaxLayers = [];

  constructor(worldStartHeight) {
    super(
      worldStartHeight,
      2000, // biomeHeight
      0, // startOverlapHeight
      10, // startHeight
      10, // endHeight
      0.5, // gravity
      10 // maxVelocity
    );

    let layerScales = [0.2, 0.6, 1, 1.5]; // Different parallax scales for different layers of shapes
    let spawnHeight = this.biomeHeight - this.startHeight - this.endHeight;
    for (let scale of layerScales) {
      let bigger = max(spawnHeight, height);
      let smaller = min(spawnHeight, height);
      let scaledDifference = (bigger - smaller) * scale;
      // console.log(`Scale: ${scale}, SpawnHeight: ${spawnHeight}, ScreenHeight: ${height}, Bigger: ${bigger}, Smaller: ${smaller}, ScaledDifference: ${scaledDifference}`);
      spawnHeight = smaller + scaledDifference;
      let spawnStartY = (bigger - spawnHeight) / 2;
      // console.log(`Adjusted SpawnHeight: ${spawnHeight}, SpawnStartY: ${spawnStartY}`);

      this.parallaxLayers.push(new ParallaxLayer(scale, spawnHeight));
    }

    this.shapes = {};
    for (let i = 0; i < 200; i++) {
      let parallaxLayer = random(this.parallaxLayers);
      let newShape = new Rectangle(parallaxLayer, this.startHeight);

      if (parallaxLayer.scale in this.shapes) this.shapes[parallaxLayer.scale].push(newShape);
      else this.shapes[parallaxLayer.scale] = [newShape];
    }
  }

  drawBodyBG(topY) {
    // Layer 0
    let scaledTopY = this.scaleTopY(topY, this.parallaxLayers[0]);
    this.shapes[this.parallaxLayers[0].scale]?.forEach((s) => s.draw(topY, scaledTopY));

    // Layer 1
    scaledTopY = this.scaleTopY(topY, this.parallaxLayers[1]);
    this.shapes[this.parallaxLayers[1].scale]?.forEach((s) => s.draw(topY, scaledTopY));
  }

  drawBodyFG(topY) {
    // Layer 2
    let scaledTopY = this.scaleTopY(topY, this.parallaxLayers[2]);
    this.shapes[this.parallaxLayers[2].scale]?.forEach((s) => s.draw(topY, scaledTopY));

    // Layer 3
    scaledTopY = this.scaleTopY(topY, this.parallaxLayers[3]);
    this.shapes[this.parallaxLayers[3].scale]?.forEach((s) => s.draw(topY, scaledTopY));
  }

  drawStartBG(topY) {
    this.drawSectionShape(topY, this.startHeight, true);
  }

  drawEndBG(topY) {
    this.drawSectionShape(topY, this.endHeight, false);
  }

  drawBall(screenX, screenY, radius) {
    push();
    fill(300, 100, 100);
    stroke(255);
    strokeWeight(2);
    circle(screenX, screenY, radius * 2);
    pop();
  }

  drawSectionShape(topY, sectionHeight, isStart) {
    fill(0, 100, 40, 100);
    noStroke();
    beginShape();
    if (isStart) {
      vertex(0, topY - this.startOverlapHeight);
      vertex(width * 0.25, topY);
      vertex(width * 0.5, topY - this.startOverlapHeight);
      vertex(width * 0.75, topY);
      vertex(width, topY - this.startOverlapHeight);
      vertex(width, topY + sectionHeight);
      vertex(0, topY + sectionHeight);
    } else {
      const endTopY = topY + this.biomeHeight - this.endHeight;
      vertex(0, endTopY + sectionHeight);
      vertex(width * 0.25, endTopY);
      vertex(width * 0.5, endTopY + sectionHeight);
      vertex(width * 0.75, endTopY);
      vertex(width, endTopY + sectionHeight);
      vertex(width, endTopY + sectionHeight);
      vertex(0, endTopY + sectionHeight);
    }
    endShape(CLOSE);
  }

  scaleTopY(topY, layer) {
    let scale = layer.scale;
    let spawnHeight = layer.spawnHeight;

    let screenCenter = height / 2;
    let middleY = topY + this.biomeHeight / 2;
    let distanceFromCenter = middleY - screenCenter;
    let scaledDistance = distanceFromCenter * scale;

    let scaledMiddleY = middleY + scaledDistance;
    let scaledTopY = scaledMiddleY - spawnHeight / 2 - this.startHeight;
    return scaledTopY;
  }
}

class Rectangle {
  constructor(parallaxLayer, startHeight) {
    this.localX = random() * width;
    this.localY = random() * parallaxLayer.spawnHeight + startHeight;

    this.w = random() * (parallaxLayer.scale * 40) + 10;
    this.h = random() * (parallaxLayer.scale * 40) + 10;

    this.color = color(parallaxLayer.scale * 60, 100, parallaxLayer.scale * 40 + 30);
  }

  draw(topY, scaledTopY) {
    const screenX = this.localX;
    const screenY = scaledTopY + this.localY;
    // if (screenY + this.h < 0 || screenY > height) return; // Skip if not on screen
    // if (screenY + this.h < topY || screenY > topY + this.biomeHeight) return; // Skip if not in biome's range

    push();
    noStroke();
    fill(this.color);
    rect(screenX - this.w / 2, screenY - this.h / 2, this.w, this.h);
    pop();
  }
}

class ParallaxLayer {
  constructor(scale, spawnHeight) {
    this.scale = scale;
    this.spawnHeight = spawnHeight;
  }
}
