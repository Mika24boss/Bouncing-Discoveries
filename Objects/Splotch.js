class Splotch {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D().mult(random(1, 4));
    this.alpha = 1;
    this.size = random(15, 30);
    this.colorHue = random(360); 
  }

  update() {
    this.position.add(this.velocity);
    this.alpha -= 0.02;
    this.size *= 0.98;
  }

  draw(cameraWorldY) {
    noStroke();
    fill(this.colorHue, 80, 100, this.alpha);
    circle(this.position.x, this.position.y - cameraWorldY, this.size);
  }

  isDead() {
    return this.alpha <= 0;
  }
}