class Nebula {
  constructor(biomeHeight, layerHeight, startHeight, endHeight) {
    this.biomeHeight = biomeHeight;

    let h = random(200, 280);
    let s = random(70, 100);
    let b = random(50, 70);
    let p5Color = color(h, s, b, 0.25);

    this.centerX = random(width);
    this.centerY = random(startHeight, layerHeight - (startHeight + endHeight) * 0.5);
    this.radius = random(0.35 * width, 0.75 * width);
    this.color = p5Color.toString();
  }

  draw(topY, scaledTopY) {
    const screenY = scaledTopY + this.centerY;
    if (screenY + this.radius < 0 || screenY - this.radius > height) return;

    push();
    drawingContext.save(); // Isolate the native canvas state

    let grad = drawingContext.createRadialGradient(this.centerX, screenY, 0, this.centerX, screenY, this.radius);
    grad.addColorStop(0, this.color);
    grad.addColorStop(1, "rgba(0,0,0,0)");

    drawingContext.fillStyle = grad;
    // Draw the rectangle centered on the nebula's position
    let rectTopEdge = max(topY, screenY - this.radius);
    let rectBottomEdge = min(topY + this.biomeHeight, screenY + this.radius);
    drawingContext.fillRect(this.centerX - this.radius, rectTopEdge, this.radius * 2, rectBottomEdge - rectTopEdge);

    drawingContext.restore();

    pop();
  }
}
