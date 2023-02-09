class WorldCoords {
    constructor(canvas, originX=0, originY=0, scaleX = 0, scaleY = 0) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
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
        let rect = this.canvas.getBoundingClientRect();
        return [x - rect.left, y - rect.top];
    }


    // Transform from webpage coordinates to Canvas coordinates
    worldToCanvas(x, y) {
        let rect = this.canvas.getBoundingClientRect();
        return [x + rect.left, y + rect.top];
    }
}