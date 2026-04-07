// Adapted from https://editor.p5js.org/brytlao/sketches/um2WVvzaN by brytlao

class Fish {
  constructor(biomeHeight, cellSize, rows, cols) {
    this.segSizes = [10, 30, 27, 26, 26, 25, 24, 23, 22, 19, 15, 10, 8, 6, 4, 3];
    this.marginSizes = [2, 2, 2, 2, 2, 2, 2, 2];

    this.segments = [];
    this.numSeg = 8;
    this.fishWidth = 15;
    this.fishLength = 20;
    this.fishSpeed = random(2.5, 4);
    this.pecFinSize = 84;
    this.analFinSize = 42;
    this.biomeHeight = biomeHeight;

    // Scale sizes based on screen size
    let scale = map(width, 1920, 2560, 0.5, 0.6, true);
    for (let i = 0; i < this.segSizes.length; i++) {
      this.segSizes[i] *= scale;
    }
    for (let i = 0; i < this.marginSizes.length; i++) {
      this.marginSizes[i] *= scale;
    }
    this.fishWidth *= scale;
    this.fishLength *= scale;
    this.pecFinSize *= scale;
    this.analFinSize *= scale;

    let x = random(width);
    let y = random(this.biomeHeight);
    this.base = createVector(x, y);
    this.guide = new FishGuide(x, y, this.fishSpeed, cellSize, rows, cols);

    // Init fish
    const fishShape = this.fishWidth / this.fishLength;
    this.segments.push(new Segment(this.biomeHeight, x, y, this.fishLength));
    for (let i = 1; i < this.numSeg; i++) {
      this.segments.push(
        new Segment(this.biomeHeight, this.segments[i - 1].x, this.segments[i - 1].y, this.fishLength)
      );
    }
    this.setSizes();
    this.segments[0].setAnchor(this.base); // Initial position
  }

  setSizes() {
    // set sizes for segments
    let trapCounter = 0;
    for (let i = this.numSeg - 1; i >= 0; i--) {
      this.segments[i].margin = this.marginSizes[i];

      this.segments[i].frontWidth = this.segSizes[trapCounter++];
      this.segments[i].backWidth = this.segSizes[trapCounter++];
    }

    // set sizes for fins
    this.segments[6].setFinWidth(this.pecFinSize);
    this.segments[3].setFinWidth(this.analFinSize);
  }

  update(flowField, boulders) {
    const nbSegments = this.segments.length;
    this.guide.update(flowField, boulders);

    const head = this.segments[nbSegments - 1];
    head.follow(this.guide.getPosition());
    head.calculateEnd();

    // Linkage behavior
    for (let i = nbSegments - 2; i >= 0; i--) {
      this.segments[i].follow(this.segments[i + 1].anchor);
      this.segments[i].calculateEnd();
    }

    // Attachment behavior
    for (let i = 1; i < nbSegments; i++) {
      this.segments[i].setAnchor(this.segments[i - 1].end);
    }

    // If it's above the biome, reset to the bottom
    if (this.segments[0].anchor.y < 50) {
      this.reposition();
    }
  }

  draw(topY) {
    push();
    // Fins
    for (let i = 0; i < this.numSeg; i++) {
      this.segments[i].drawFins(topY);
    }

    // Segments
    for (let i = 0; i < this.numSeg; i++) {
      this.segments[i].draw(topY);
    }

    // Dorsal fin
    const headColor = this.segments[2].color;
    stroke(headColor);
    strokeWeight(5);
    for (let i = 2; i < this.numSeg - 3; i++) {
      const curr = this.segments[i].anchor;
      const next = this.segments[i - 1].anchor;

      // Check if both points are outside the biome
      if ((curr.y < 50 && next.y < 50) || (curr.y > this.biomeHeight && next.y > this.biomeHeight)) continue;
      // Check if both points are outside the screen
      if ((curr.y + topY < 0 && next.y + topY < 0) || (curr.y + topY > height && next.y + topY > height)) continue;
      if ((curr.x < -50 && next.x < -50) || (curr.x > width + 50 && next.x > width + 50)) continue;

      line(curr.x, curr.y + topY, next.x, next.y + topY);
    }
    pop();
  }

  reposition() {
    let newX = random(width);
    let newY = this.biomeHeight + 200;

    this.guide.position.set(newX, newY);
    this.guide.direction.set(random(-1, 1), -1);

    this.base.set(newX, newY);
    for (let seg of this.segments) {
      seg.anchor.set(newX, newY);
      seg.calculateEnd();
    }
  }
}

class Segment {
  constructor(biomeHeight, x, y, len) {
    this.biomeHeight = biomeHeight;
    this.anchor = createVector(x, y);
    this.len = len;
    this.end = createVector(0, 0);
    this.calculateEnd();
    this.angle = 0;

    // Trapezoid params for the segment's shape
    this.color = this.getKoiColor();
    this.margin = 5;
    this.frontWidth = 20;
    this.backWidth = 10;

    this.finWidth = 0;
  }

  setFinWidth(finSize) {
    this.finWidth = finSize;
    this.finTaper = finSize / 8;
    this.finMargin = finSize / 20;
    this.finClock = 0;
    this.finInc = TWO_PI / 300;
    this.finMovMag = 0.3;
    this.finAngOffset = -0.3;
  }

  follow(target) {
    let dir = p5.Vector.sub(target, this.anchor);
    this.angle = dir.heading();

    // Keep the segment at its fixed length
    dir.setMag(this.len);
    dir.mult(-1);
    this.anchor = p5.Vector.add(target, dir);
  }

  setAnchor(pos) {
    this.anchor = pos.copy();
    this.calculateEnd();
  }

  calculateEnd() {
    const dx = this.len * cos(this.angle);
    const dy = this.len * sin(this.angle);
    this.end.set(this.anchor.x + dx, this.anchor.y + dy);
  }

  draw(topY) {
    if (this.isOffScreen(topY)) return;

    noStroke();
    fill(this.color);

    // Compute trapezoid
    let segmentLength = dist(this.anchor.x, this.anchor.y, this.end.x, this.end.y);
    let localTailPos = createVector(0, -segmentLength);

    // Create the 4 corners relative to (0,0)
    let frontLeft = createVector(0, 0);
    let frontRight = createVector(0, 0);
    let backRight = localTailPos.copy();
    let backLeft = localTailPos.copy();
    frontLeft.add(-this.frontWidth / 2, this.margin);
    frontRight.add(this.frontWidth / 2, this.margin);
    backRight.add(this.backWidth / 2, -this.margin);
    backLeft.add(-this.backWidth / 2, -this.margin);
    const trapPoints = [frontLeft, frontRight, backRight, backLeft];

    // Rotate and translate to the real position
    let headingVec = p5.Vector.sub(this.anchor, this.end);
    let rotationAngle = headingVec.heading() + radians(90);

    for (let trapPoint of trapPoints) {
      trapPoint.rotate(rotationAngle);
      trapPoint.add(this.anchor);
    }

    quad(
      trapPoints[0].x,
      trapPoints[0].y + topY,
      trapPoints[1].x,
      trapPoints[1].y + topY,
      trapPoints[2].x,
      trapPoints[2].y + topY,
      trapPoints[3].x,
      trapPoints[3].y + topY
    );
  }

  drawFins(topY) {
    if (this.isOffScreen(topY)) return;
    if (this.finWidth <= 0) return;
    this.plotFin(this.anchor, this.end, topY);
  }

  finCoor(frontPoint, backPoint, isLeftFin) {
    // Calculate distance between the 2 points on the body
    let segmentLength = dist(frontPoint.x, frontPoint.y, backPoint.x, backPoint.y);
    let localTailPos = createVector(0, -segmentLength);

    // Create fin shape
    let baseFront = createVector(0, 0).add(0, this.finMargin);
    let baseBack = localTailPos.copy().add(0, -this.finMargin);
    let finTip = localTailPos.copy();

    // Position fin
    let sideMultiplier = isLeftFin ? 1 : -1;
    finTip.add((this.finWidth / 2) * sideMultiplier, -this.finTaper);
    return [baseFront, baseBack, finTip];
  }

  plotFin(frontPoint, backPoint, topY) {
    fill(this.color);
    noStroke();

    this.finClock += this.finInc;
    const rotOffset = this.finMovMag * sin(this.finClock) + this.finAngOffset;

    // Left fin
    const leftFin = this.finCoor(frontPoint, backPoint, true);

    // Translate to real position
    for (let i = 0; i < leftFin.length; i++) {
      let h = frontPoint.copy();
      h.sub(backPoint);
      leftFin[i].rotate(h.heading());
      leftFin[i].rotate(radians(90));
      leftFin[i].rotate(rotOffset);
      leftFin[i].add(frontPoint);
    }

    triangle(leftFin[0].x, leftFin[0].y + topY, leftFin[1].x, leftFin[1].y + topY, leftFin[2].x, leftFin[2].y + topY);

    // Right fin
    const rightFin = this.finCoor(frontPoint, backPoint, false);

    // Translate to real position
    for (let i = 0; i < rightFin.length; i++) {
      let h = frontPoint.copy();
      h.sub(backPoint);
      rightFin[i].rotate(h.heading());
      rightFin[i].rotate(radians(90));
      rightFin[i].rotate(-rotOffset);
      rightFin[i].add(frontPoint);
    }

    triangle(
      rightFin[0].x,
      rightFin[0].y + topY,
      rightFin[1].x,
      rightFin[1].y + topY,
      rightFin[2].x,
      rightFin[2].y + topY
    );
  }

  getKoiColor() {
    const koiColors = [
      color(10, 80, 100), // dark orange
      color(25, 90, 90), // orange
      color(350, 15, 40), // dark gray
      color(90, 15, 90), // light green
    ];

    const rnd = random();
    if (rnd > 0.4) {
      return koiColors[random(koiColors.length) | 0];
    } else if (rnd > 0.15) {
      return color(0, 0, 100); // white
    } else {
      return color(0, 0, 15); // black
    }
  }

  isOffScreen(topY) {
    let padding = 50;
    if (
      this.anchor.y > this.biomeHeight + padding ||
      this.end.y < padding || // Positive padding since it's hidden behind the sand
      this.anchor.x < -padding ||
      this.anchor.x > width + padding
    )
      return true; // Skip if segment outside of biome
    if (this.anchor.y + topY > height + padding || this.end.y + topY < -padding) return true; // Skip if segment outside of screen
    return false;
  }
}

class FishGuide {
  constructor(x, y, fishSpeed, cellSize, rows, cols) {
    this.speed = fishSpeed;
    this.position = createVector(x, y);
    this.direction = createVector(random(-1, 1), -1);
    this.velocity = createVector(0, 0);

    this.sineTime = random(0, 1000);
    this.sineIncrement = (TWO_PI / 150) * random(0.9, 1.1);
    this.sineMagnitude = random(0.9, 1.1);

    this.noiseTime = random(0, 1000);
    this.noiseIncrement = 1;
    this.noiseMagnitude = 1;

    this.delayTime = 0;

    this.cellSize = cellSize;
    this.rows = rows;
    this.cols = cols;
    this.flowFieldProp = 0.02;
  }

  getPosition() {
    return this.position.copy();
  }

  tickSine() {
    this.sineTime += this.sineIncrement;
    return this.sineMagnitude * sin(this.sineTime);
  }

  tickPerlin() {
    this.noiseTime += this.noiseIncrement;
    return this.noiseMagnitude * noise(this.noiseTime);
  }

  update(flowField, boulders) {
    // Direction change delay
    if (this.delayTime > 0) {
      this.delayTime -= 1;
    }

    // Turn away from edges
    const padding = 150;
    const steerForce = 0.5;
    if (this.delayTime <= 0) {
      if (this.position.x < padding) {
        this.direction.x += steerForce;
        this.delayTime = 50;
      } else if (this.position.x > width - padding) {
        this.direction.x -= steerForce;
        this.delayTime = 50;
      }
      this.direction.normalize();
    }

    // Flow field influence
    let cellRow = floor(this.position.y / this.cellSize);
    let cellCol = floor(this.position.x / this.cellSize);
    cellRow = constrain(cellRow, 0, this.rows - 1);
    cellCol = constrain(cellCol, 0, this.cols - 1);
    let ff = flowField[cellRow][cellCol];

    this.direction.add(p5.Vector.mult(ff, this.flowFieldProp));
    this.direction.normalize();

    // Sinusoidal movement pattern
    this.velocity.set(this.speed, this.tickSine() + this.tickPerlin());

    // Rotate to primary direction
    this.velocity.rotate(this.direction.heading());
    this.velocity.setMag(this.speed);
    this.position.add(this.velocity);

    this.avoidBoulders(boulders);
  }

  avoidBoulders(boulders) {
    let lookAheadDist = 100;
    let lookAheadPos = p5.Vector.mult(this.direction, lookAheadDist).add(this.position);

    for (let b of boulders) {
      if (b.position.y > this.position.y) continue;
      // Calculate distance from boulder center to look-ahead point
      let dx = lookAheadPos.x - b.position.x;
      let dy = lookAheadPos.y - b.position.y;
      let distSquared = dx * dx + dy * dy;

      let avoidRadius = b.radius + 160;

      if (distSquared >= avoidRadius * avoidRadius) continue;
      
      // Vector pointing from boulder to look-ahead point (i.e. pointing away from boulder)
      let avoidVec = p5.Vector.sub(lookAheadPos, b.position);
      avoidVec.y = 0;
      let strength = map(distSquared, b.radius, avoidRadius, 1.0, 0.1, true) * 0.2;
      avoidVec.setMag(strength);

      // Nudge direction away from boulder
      this.direction.add(avoidVec);
    }
  }
}
