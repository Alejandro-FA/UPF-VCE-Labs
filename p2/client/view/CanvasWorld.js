const RIGHT = 0;
const FRONT = 64;
const LEFT = 128;
const BACK = 192;

class MyWorld {
    constructor(canvas, room, username) {
        this.coords = new WorldCoords(canvas);
        this.inputState = new InputState();
        this.inputState.onKey = this.onKey.bind(this);
        this.inputState.onMouse = this.onMouse.bind(this);
        this.imageManager = new ImageManager()
        this.mouseDown = false

        this.user_avatar = null
        this.username = username
        this.room_name = room
        MYCHAT.server.on_world_info = this.on_world_info.bind(this)
        
        this.world = null
        this.room = null
        this.users = null
        this.background = null

        //TODO: change this to the new path
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
                    "pos": [300, 230],
                    "target": [300, 230],
                    "anim": [0],
                    "facing": FRONT
                }
            }

            this.users[username].url = this.user_avatar
        })
        .catch(error => {
            console.error('Error loading file:', error);
            this.world = {
                "living_room": {
                    url: "img/room1.avif",
                    users: {},
                    r_exit: "relax_room",
                    l_exit: null
                },
            
                "relax_room": {
                    url: "img/room2.avif",
                    users: {},
                    r_exit: "lounge_room",
                    l_exit: "living_room"
                }, 
            
                "lounge_room": {
                    url: "img/room3.avif",
                    users: {},
                    r_exit: null,
                    l_exit: "relax_room"
                }
            }

            this.room = this.world[room]
            this.users = this.room.users
            this.background = this.imageManager.getImage(this.room.url)

            if(!this.users[username]) {
                this.users[username] = {
                    "url": "img/spritesheet_1.png",
                    "pos": [300, 230],
                    "target": [300, 230],
                    "anim": [0],
                    "facing": FRONT
                }
            }

            this.users[username].url = this.user_avatar
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
            ctx.fillRect(world_mouse[0] - 10, world_mouse[1] - 10, 20, 20);
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
            this.renderAnimation(ctx, img, user.anim, user.pos[0], user.pos[1], 3, 0, user.facing)
        }
    }

    //Update the data of the model
    update(elapsed_time) {

        //Update the size of the canvas
        let canvas = document.querySelector("canvas");
        let parent = canvas.parentNode;
        let rect = parent.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;

        //Update the position of every user
        for(let name in this.users){
            let user = this.users[name]
            if(!this.atTarget(user)) {
                user.pos[0] = lerp( user.pos[0], user.target[0], elapsed_time );
            }

        }

        //Check if a user exits the room
        if(this.users){
            let myuser = this.users[this.username]

            let l_exit = this.room.l_exit ? 200 : null
            if(this.width == 0) {
                this.width = 99999
            }
            let r_exit = this.room.r_exit ? this.width - 200 : null
            
            if(r_exit && myuser && myuser.pos[0] >= r_exit){
                console.log("Exit on the right to room " + this.room.r_exit);
                this.changeRoom(this.room.r_exit)
            }

            if(l_exit && myuser && myuser.pos[0] <= l_exit){
                console.log("Exit on the left to room " + this.room.l_exit);
                this.changeRoom(this.room.l_exit)
            }

        }
    }

    //Change all the necessary world data
    changeRoom(room_name) {
        //Delete the user from the old room
        let myuser = this.users[this.username]

        delete this.room.users[this.username]

        //Enter the new room
        this.room = this.world[room_name]

        //Load the new background
        this.background = this.imageManager.getImage(this.room.url)

        //Change the current room name

        this.room_name = room_name
    
        //Reset the position and target of the user

        myuser.pos[0] = myuser.target[0] = 300

        //Add the user to the new room
        this.room.users[this.username] = myuser

        //Update the users object
        this.users = this.room.users

        //Change the room in the chat
        if(MYCHAT.visited_chats.includes(room_name)){
            MYCHAT.changeChat(room_name).call(MYCHAT)
        } else {
            MYCHAT.connectNewChat(room_name)
        }

    }

    //This function verifies if the user is at the range of it's target
    atTarget(user){
        if(user.pos[0] < user.target[0] -10 || user.pos[0] > user.target[0] +10) {
            user.anim = this.walking
            user.facing = user.pos[0] < user.target[0] ? RIGHT : LEFT
            return false
        }
        user.anim = this.idle
        user.facing = FRONT
        return true
    }

    onMouse( event ) {
        switch (event.type) {
            case "mousedown":
                //Check if the click is on the upper half of the screen
                if(this.inputState.mousePos[1] <= 440){
                    this.mouseDown = true
                    
                    let myuser = this.users[this.username]
                    myuser.target[0] = this.inputState.mousePos[0] - 48

                    let msg = {
                        room: this.room_name,
                        type: "MOVE",
                        username: this.username,
                        content: myuser,
                        userID: MYCHAT.server.user_id
                    }

                    MYCHAT.server.sendMessage(msg)
                }
                break;
        
            case "mouseup":
                this.mouseDown = false
                break;
            default:
                break;
        }
    }

    onKey( event ) {

    }

    //Callback that handles all the world synchronization
    on_world_info( info ){
        info = JSON.parse(info)
        console.log("Received the world info " + JSON.stringify(info));

        switch (info.type) {
            case "LOGIN":
                //LOGIN HANDLING
                if (MYCHAT.server.user_id === Number(Object.keys(MYCHAT.server.clients)[0])) {
                    let msg = {
                        room: this.room_name,
                        type: "WORLD",
                        user: this.username,
                        content: this.room,
                        userID: MYCHAT.server.user_id
                    }
                    MYCHAT.server.sendMessage(msg, info.userID)
                }

                
                this.room.users[info.username] = this.users[info.username] = info.content

                break;
            
            case "LOGOUT":
                //LOGOUT HANDLING
                /*{
                userID: ws.id,
                username: user_name,
                type: "LOGOUT",
                content: "",
                date: new Date()
                }*/

                delete this.users[info.username]
                delete this.room.users[info.username]
                break;
            
            case "MOVE":
                //UPDATE POSITION
                /*{
                        room: this.room_name,
                        type: "MOVE",
                        username: this.username,
                        content: myuser,
                        userID: MYCHAT.server.user_id
                    } 
                */
                let user = info.content

                this.room.users[info.username] = this.users[info.username] = user
                
                break;

            case "WORLD":
                //LOAD THE WORLD
                /*{
                    room: this.room_name,
                    type: "WORLD",
                    user: this.username,
                    content: this.room,
                    userID: MYCHAT.server.user_id
                }*/
                let room = info.content
                this.room = room
                this.room_name = info.room
                this.users = this.room.users

                if(!this.users[this.username]) {
                    this.users[this.username] = {
                        "url": this.user_avatar,
                        "pos": [300, 230],
                        "target": [300, 230],
                        "anim": [0],
                        "facing": FRONT
                    }
                }
                this.users[this.username].url = this.user_avatar
    
                this.background = this.imageManager.getImage(this.room.url) 
                break;

            default:
                console.error("Something went wrong")
                break;
        }
    }

    /***************************************************** 
     *                ANIMATION CODE                     *
    *****************************************************/

    idle = [0];
    walking = [2,3,4,5,6,7,8,9];
    talking = [0,1]

    renderAnimation( ctx, image, anim, x, y, scale, offset, facing ) {
        offset = offset || 0;
        let t = Math.floor(performance.now() * 0.001 * 10); 
        this.renderFrame( ctx, image, anim[ t % anim.length ] + offset,x,y,scale, facing);
    }

    renderFrame(ctx, image, frame, x, y, scale, facing) {
        let w = 32; //sprite width
        let h = 64; //sprite height
        scale = scale || 1;
        
        let num_hframes = image.width / w;
        let xf = (frame * w) % image.width;
        let yf = Math.floor(frame / num_hframes) * h; 

        
        ctx.save();

        ctx.translate(x,y); 

        if( image ){
            ctx.drawImage( image, xf,facing,w,h, 0,0,w*scale,h*scale );
        }
        ctx.restore();
    }

}

function lerp(a,b,f) {
    return a * (1-f) + b * f;
}