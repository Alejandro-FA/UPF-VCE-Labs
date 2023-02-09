class MyWorld {
    constructor(canvas) {
        this.coords = new WorldCoords(canvas);
        this.inputState = new InputState();
        this.inputState.onKey = this.onKey;
        this.inputState.onMouse = this.onMouse;
        this.imageManager = new ImageManager()
        this.background = this.imageManager.getImage("img/room1.avif")
    }


    draw(ctx) {
        let canvas = ctx.canvas;

        // Fill canvas with specified color
        ctx.fillStyle = "#caffd8";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Get the image's width and height
        let imageWidth = this.background.width;
        let imageHeight = this.background.height;

        // Calculate the x and y position to center the image
        let xPos = (canvas.width - imageWidth) / 2;
        let yPos = (canvas.height - imageHeight) / 2;

        // Draw the image background
        ctx.drawImage(this.background, xPos, yPos, imageWidth, imageHeight);
        

        // Draw rectangle with specified color
        ctx.fillStyle = "#FF00FF";
        let world_mouse = this.coords.canvasToWorld(this.inputState.mousePos)
        ctx.fillRect(world_mouse[0], world_mouse[1], 50, 50);
    }


    update(elapsed_time) {
        // TODO:
    }


    onMouse = (event) => {
        switch (event.type) {
            case "mousedown":
                break;
            case "mouseup":
                break;
            case "mousemove":
                break;
            default:
                break;
        }
    }


    onKey = (event) => {
        switch (event.type) {
            case "keydown":
                break;
            case "keyup":
                break;
            default:
                break;
        }
    }
}
