class MyWorld {
    constructor(canvas, room, username) {
        this.coords = new WorldCoords(canvas);
        this.inputState = new InputState();
        this.inputState.onKey = this.onKey.bind(this);
        this.inputState.onMouse = this.onMouse.bind(this);
        this.imageManager = new ImageManager()
        this.mouseDown = false

        this.user_avatar = null
        
        this.world = null
        this.room = null
        this.users = null
        this.background = null

        fetch('model/world.json')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            this.world = data
            this.room = data[room]
            this.users = this.room.users
            this.background = this.imageManager.getImage(this.room.url)

            if(!this.users[username]) {
                this.users[username] = {
                    "url": "img/spritesheet_1.png",
                    "pos": [50, 230],
                    "target": [50, 230],
                    "anim": [0]
                }
            }

            this.users[username].url = this.user_avatar
        })
        .catch(error => {
            console.error('Error loading file:', error);
        });
    }


    draw(ctx) {
        ctx.imageSmoothingEnabled = false;
        let canvas = ctx.canvas;

        // Fill canvas with specified color
        ctx.fillStyle = "#caffd8";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        //Draw the current world
        this.drawWorld(ctx)

        // Draw rectangle with specified color

        if(this.mouseDown){
            ctx.fillStyle = "red";
            let world_mouse = this.coords.canvasToWorld(this.inputState.mousePos)
            ctx.fillRect(world_mouse[0] - 25, world_mouse[1] - 25, 50, 50);
        }
    }

    //From the world object draws the frame
    drawWorld(ctx) {

        let canvas = ctx.canvas
        // Get the image's width and height
        let imageWidth = canvas.width - 5;
        let imageHeight = canvas.height - 5;

        // Calculate the x and y position to center the image
        let xPos = (canvas.width - imageWidth) / 2;
        let yPos = (canvas.height - imageHeight) / 2;

        // Draw the image background
        if(this.background){
            ctx.drawImage(this.background, xPos, yPos, imageWidth, imageHeight);
        }

        //Draw the users

        for(let name in this.users){
            let user = this.users[name]
            let img = this.imageManager.getImage(user.url)
            this.renderAnimation(ctx, img, user.anim, user.pos[0], user.pos[1], 3)
        }
    }

    update(elapsed_time) {
        // TODO:
    }

    onMouse( event ) {
        if (event.type === "mousedown") {
            this.mouseDown = this.mouseDown ? false : true
            
        }
    }

    onKey( event ) {

    }

    /***************************************************** 
     *                ANIMATION CODE                     *
    *****************************************************/

    idle = [0];
    walking = [2,3,4,5,6,7,8,9];
    talking = [0,1]

    renderAnimation( ctx, image, anim, x, y, scale, offset, flip ) {
        offset = offset || 0;
        let t = Math.floor(performance.now() * 0.001 * 10); 
        this.renderFrame( ctx, image, anim[ t % anim.length ] + offset,x,y,scale,flip);
    }

    renderFrame(ctx, image, frame, x, y, scale, flip) {
        let w = 32; //sprite width
        let h = 64; //sprite height
        scale = scale || 1;
        
        let num_hframes = image.width / w;
        let xf = (frame * w) % image.width;
        let yf = Math.floor(frame / num_hframes) * h; 
        
        ctx.save();

        ctx.translate(x,y); 
        if( flip ){
            ctx.translate(w*scale,0);
            ctx.scale(-1,1);
        }
        if(image){
            ctx.drawImage( image, xf,yf,w,h, 0,0,w*scale,h*scale );
        }
        ctx.restore();
    }

}

function lerp(a,b,f) {
    return a * (1-f) + b * f;
}