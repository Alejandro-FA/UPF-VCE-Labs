class MyCanvas {
    // Application state variables
    keys = {};
    mouse_pos = [0,0];
    mouse_buttons = 0;
    canvas = document.querySelector("canvas");

    
    constructor() {
        // Add event listeners
        document.body.addEventListener("mousedown", this.onMouse);
        document.body.addEventListener("mouseup", this.onMouse);
        document.body.addEventListener("mousemove", this.onMouse);
        document.body.addEventListener("keydown", this.onKeyDown );
        document.body.addEventListener("keyup", this.onKeyUp );

        // Start the render loop
        this.lastFrameTime = performance.now(); // Time at which we draw the last frame
        this.loop();
    }


    loop = () => {
        // Draw new frame
        this.draw();

        // Update internal state
        let now = performance.now();
        let dt = now - this.lastFrameTime; // Elapsed time in ms
        this.lastFrameTime = now;
        this.update(dt);

        // Request to call loop() again before next frame
        requestAnimationFrame( this.loop );
    }


    draw = () => {
        this.resize();
        let ctx = this.canvas.getContext('2d');

        // Clear canvas before drawing
        ctx.clearRect(0,0, this.canvas.width, this.canvas.height);

        // Fill canvas with specified color
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw rectangle with specified color
        ctx.fillStyle = "#FF00FF";
        ctx.fillRect(this.mouse_pos[0], this.mouse_pos[1], 50, 50);
    }


    update = (elapsed_time) => {
        let dt = elapsed_time / 1000; // Convert elapsed time from ms to s
    }


    resize = () => {
        // Resize canvas to fullscreen
        let parent = this.canvas.parentNode;
        let rect = parent.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }


    onMouse = (event) => {
        let rect = this.canvas.getBoundingClientRect();
        let x = this.mouse_pos[0] = event.clientX - rect.left;
        let y = this.mouse_pos[1] = event.clientY - rect.top;
        this.mouse_buttons = event.buttons;

        switch (event.type) {
            case "mousedown":
                // TODO:
                break;
            case "mouseup":
                // TODO:
                break;
            case "mousemove":
                // TODO:
                break;
            default:
                break;
        }
    }


    onKeyDown = (event) => {
        // Mark the key as being pressed
        this.keys[event.key] = true;
    }


    onKeyUp = (event) => {
        // Mark the key as being pressed
        this.keys[event.key] = false;
    }
}