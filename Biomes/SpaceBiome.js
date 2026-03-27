class SpaceBiome extends Biome {
  static startOverlapHeight = 50;

  constructor(worldStartHeight) {
    super(
      worldStartHeight,
      10000, // biomeHeight
      SpaceBiome.startOverlapHeight,
      200, // startHeight
      200, // endHeight
      0.5, // gravity
      10 // maxVelocity
    );

    this.shapes = [];
    for (let i = 0; i < 200; i++) {
      this.shapes.push(new Rectangle(width, this.biomeHeight));
    }
  }

  drawBodyBG(topY) {
    topY *= 0.5; // Parallax effect for background
    this.shapes.filter(s => s.layer === 0).forEach(s => s.draw(topY));
  }

  drawBodyFG(topY) {
    this.shapes.filter(s => s.layer === 1).forEach(s => s.draw(topY));
  }

  drawStartBG(topY) {
    this.drawSectionShape(topY, this.startHeight, true);
  }

  drawEndBG(topY) {
    this.drawSectionShape(topY, this.endHeight, false);
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
      vertex(0, endTopY + 50);
      vertex(width * 0.25, endTopY);
      vertex(width * 0.5, endTopY + 50);
      vertex(width * 0.75, endTopY);
      vertex(width, endTopY + 50);
      vertex(width, endTopY + sectionHeight);
      vertex(0, endTopY + sectionHeight);
    }
    endShape(CLOSE);
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

class Rectangle {
  constructor(biomeWidth, biomeHeight) {
    this.layer = Math.random() > 0.5 ? 1 : 0;

    this.localX = Math.random() * biomeWidth;
    if (this.layer === 0) this.localY = Math.random() * (biomeHeight - 400) / 2 + 200;
    else this.localY = Math.random() * (biomeHeight - 400) + 200;
    
    this.w = Math.random() * 100 + 20;
    this.h = Math.random() * 100 + 20;
    
    this.color = this.layer === 1 ? 'rgb(255, 150, 0)' : 'rgb(100, 0, 150)';
  }

  draw(biomeTopY) {
    const screenX = this.localX;
    const screenY = biomeTopY + this.localY;

    if (screenY < -this.h || screenY > height) return;

    push();
    noStroke();
    fill(this.color);
    rect(screenX, screenY, this.w, this.h);
    pop();
  }
}