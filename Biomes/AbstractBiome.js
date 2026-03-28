class AbstractBiome extends Biome {
  parallaxLayers = [];

  constructor(worldStartY) {
    super(
      worldStartY,
      5000, // biomeHeight
      50, // startOverlapHeight
      200, // startHeight
      200, // endHeight
      0.5, // gravity
      10 // maxVelocity
    );

    let layerScales = [0.2, 0.6, 1, 1.5]; // Different parallax scales for different layers of shapes
    
    for (let scale of layerScales) {
      // Spawn height covers the full range the layer across all scroll positions
      let spawnHeight = this.biomeHeight * scale + height * abs(1-scale);
      this.parallaxLayers.push(new ParallaxLayer(scale, spawnHeight));
    }

    this.shapes = {};
    for (let i = 0; i < 300; i++) {
      let parallaxLayer = random(this.parallaxLayers);
      let newShape = new Rectangle(parallaxLayer, this.biomeHeight, this.startHeight, this.endHeight);

      if (parallaxLayer.scale in this.shapes) this.shapes[parallaxLayer.scale].push(newShape);
      else this.shapes[parallaxLayer.scale] = [newShape];
    }
  }

  drawBodyBG(topY) {
    push();
    fill(240, 80, 100);
    noStroke();
    rect(0, topY, width, this.biomeHeight);
    pop();

    // Layer 0
    let scaledTopY = this.scaleTopY(topY, this.parallaxLayers[0]);
    this.shapes[this.parallaxLayers[0].scale]?.forEach((s) => s.draw(topY, scaledTopY));

    // Layer 1
    scaledTopY = this.scaleTopY(topY, this.parallaxLayers[1]);
    this.shapes[this.parallaxLayers[1].scale]?.forEach((s) => s.draw(topY, scaledTopY));

    // Layer 2
    scaledTopY = this.scaleTopY(topY, this.parallaxLayers[2]);
    this.shapes[this.parallaxLayers[2].scale]?.forEach((s) => s.draw(topY, scaledTopY));
  }

  drawBodyFG(topY) {
    // Layer 3
    let scaledTopY = this.scaleTopY(topY, this.parallaxLayers[3]);
    this.shapes[this.parallaxLayers[3].scale]?.forEach((s) => s.draw(topY, scaledTopY));
  }

  drawStartBG(topY) {
    this.drawBGSection(topY, this.startHeight, true);
  }

  drawStartFG(topY) {
    this.drawFGSection(topY, this.startHeight, true);
  }

  drawEndBG(topY) {
    this.drawBGSection(topY, this.endHeight, false);
  }

  drawEndFG(topY) {
    this.drawFGSection(topY, this.endHeight, false);
  }

  drawBall(screenX, screenY, radius) {
    push();
    fill(300, 100, 100);
    stroke(255);
    strokeWeight(2);
    circle(screenX, screenY, radius * 2);
    pop();
  }

  drawBGSection(topY, sectionHeight, isStart) {
    push();
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
      vertex(0, endTopY + sectionHeight / 2);
      vertex(width * 0.25, endTopY);
      vertex(width * 0.5, endTopY + sectionHeight / 2);
      vertex(width * 0.75, endTopY);
      vertex(width, endTopY + sectionHeight / 2);
      vertex(width, endTopY + sectionHeight);
      vertex(0, endTopY + sectionHeight);
    }
    endShape(CLOSE);
    pop();
  }

  drawFGSection(topY, sectionHeight, isStart) {
    push();
    fill(180, 100, 40, 100);
    noStroke();
    beginShape();
    if (isStart) {
      vertex(0, topY - this.startOverlapHeight + 20);
      vertex(width * 0.25, topY);
      vertex(width * 0.5, topY - this.startOverlapHeight + 20);
      vertex(width * 0.75, topY);
      vertex(width, topY - this.startOverlapHeight + 20);
      vertex(width, topY + sectionHeight - 50);
      vertex(0, topY + sectionHeight - 50);
    } else {
      const endTopY = topY + this.biomeHeight - this.endHeight;
      vertex(0, endTopY + 20);
      vertex(width * 0.25, endTopY + sectionHeight / 2);
      vertex(width * 0.5, endTopY + 20);
      vertex(width * 0.75, endTopY + sectionHeight / 2);
      vertex(width, endTopY + 20);
      vertex(width, endTopY + sectionHeight - 20);
      vertex(0, endTopY + sectionHeight - 20);
    }
    endShape(CLOSE);
    pop();
  }

  scaleTopY(topY, layer) {
    let screenCenter = height / 2;
    let middleY = topY + this.biomeHeight / 2;
    let distanceFromCenter = middleY - screenCenter;
    let scaledDistance = distanceFromCenter * layer.scale;

    let scaledMiddleY = screenCenter + scaledDistance;
    let scaledTopY = scaledMiddleY - layer.spawnHeight / 2;
    return scaledTopY;
  }
}

class Rectangle {
  constructor(parallaxLayer, biomeHeight, startHeight, endHeight) {
    this.localX = random() * width;
    this.localY = random() * parallaxLayer.spawnHeight;

    this.w = random() * (parallaxLayer.scale * 40) + 10;
    this.h = random() * (parallaxLayer.scale * 40) + 10;

    this.color = color(parallaxLayer.scale * 60, 100, parallaxLayer.scale * 40 + 30);
    this.biomeHeight = biomeHeight;
    this.startHeight = startHeight;
    this.endHeight = endHeight;
  }

  draw(topY, scaledTopY) {
    const screenX = this.localX;
    const screenY = scaledTopY + this.localY;
    if (screenY + this.h / 2 < 0 || screenY - this.h / 2 > height) return; // Skip if not on screen
    if (screenY + this.h / 2 < topY + this.startHeight / 2 || screenY - this.h / 2 > topY + this.biomeHeight - this.endHeight / 2) return; // Skip if not in biome's range

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
