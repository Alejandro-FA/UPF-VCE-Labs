class MyCanvas {
    canvas = document.querySelector("canvas");
    ctx = this.canvas.getContext('2d');
    
    constructor() {
        this.world = new MyWorld(this.canvas);
        
        this.ctx.imageSmoothingEnabled = false;
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
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
        this.world.draw(this.ctx);
    }


    update = (elapsed_time) => {
        let dt = elapsed_time / 1000; // Convert elapsed time from ms to s
        this.world.update(dt);
    }


    resize = () => {
        // Resize canvas to fullscreen
        let parent = this.canvas.parentNode;
        let rect = parent.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }
}