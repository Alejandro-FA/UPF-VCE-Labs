class CanvasTransform {
    constructor(canvasCtx, originX=0, originY=0, scaleX = 0, scaleY = 0) {
        this.ctx = canvasCtx;
        this.origin = [originX, originY];
        this.scaling = [scaleX, scaleY];
    }


    // Move the origin of the canvas
    translate(newX, newY) {
        this.ctx.translate(newX, newY);
    }


    // Scale the canvas
    scale(xMultiplier, yMultiplier) {
        this.ctx.scale(xMultiplier, yMultiplier);
    }


    // Restore canvas transformations
    restore() {
        this.ctx.restore();
    }


    // Transform from canvas coordinates to webpage coordinates
    canvasToWorld(x, y) {
        // TODO: do somehting here
    }


    // Transform from webpage coordinates to Canvas coordinates
    worldToCanvas(x, y) {
        // TODO: do something here
    }
}