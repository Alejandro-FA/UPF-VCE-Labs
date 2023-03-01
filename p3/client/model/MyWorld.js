const RIGHT = 0;
const FRONT = 64;
const LEFT = 128;
const BACK = 192;

class MyWorld {
    constructor(room, username) {
        this.user_avatar = null
        this.username = username
        this.room_name = room
        MYCHAT.server.on_world_info = this.on_world_info.bind(this)
        
        this.world = null
        this.room = null
        this.users = null
        this.sceneNode = null
        this.background = null

        //TODO: Change when using in server
        fetch('/p3/client/model/world.json')
        .then(response => response.json())
        .then(data => {
            this.world = data
            this.room = data[room]
            this.users = this.room.users

            if(!this.users[username]) {
                this.users[username] = {
                    "sceneNode": this.sceneNode,
                    "target": vec3.create([-40, 0, 0]),
                    "anim": "idle",
                }
            }

            this.users[username].url = this.user_avatar
        })
    }


    setUserSceneNode(username, SceneNode) {
        if(this.users){
            this.users[username].sceneNode = SceneNode;
        } else {
            this.sceneNode = SceneNode
        }
    }

    setThisUserSceneNode(SceneNode) {
        this.setUserSceneNode(this.username, SceneNode);
    }

    setUserTarget(username, target) {
        if(this.users) {
            this.users[username].target = target;
            this.users[username].anim = "walking"
        }
    }

    setThisUserTarget(target) {
        this.setUserTarget(this.username, target);
    }

    //Update the data of the model
    update(elapsed_time) {

        //Update the position of every user
        for(let name in this.users){
            let user = this.users[name]
            if(!this.atTarget(user)) {
                this.moveCharacter(user.sceneNode, user.target, elapsed_time);
                //user.pos[0] = lerp( user.pos[0], user.target[0], elapsed_time );
            }
            let t = getTime();
            let time_factor = 1;
            let anim = animations[user.anim]
            let character = user.sceneNode.children[0]
            //move bones in the skeleton based on animation
            anim.assignTime( t * 0.001 * time_factor );
            //copy the skeleton in the animation to the character
            character.skeleton.copyFrom( anim.skeleton );

        }
        
        //CHANGE: Check if a user exits the room - Adapt it to 3d
        if(this.users){
            let myuser = this.users[this.username]

            let l_exit = this.room.l_exit ? 200 : null
            if(this.width == 0) {
                this.width = 99999
            }
            let r_exit = this.room.r_exit ? this.width - 200 : null
            
            if(r_exit && myuser && myuser.pos[0] >= r_exit){
                this.changeRoom(this.room.r_exit)
            }

            if(l_exit && myuser && myuser.pos[0] <= l_exit){
                this.changeRoom(this.room.l_exit)
            }

        }
    }

    //Move the chosen sceneNode to the target
    moveCharacter(character, target, dt) {
        var delta = vec3.sub( vec3.create(), target, character.position );
        vec3.normalize(delta,delta);
        vec3.scaleAndAdd( character.position, character.position, delta, dt * 50);
        character.updateMatrices();
        character.flags.flipX = delta[0] < 0;
    }

    //CHANGE: Change all the necessary world data - Adapt it to 3d
    changeRoom(room_name) {
        //Delete the user from the old room
        let myuser = this.users[this.username]

        this.room.users = {}

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

    //CHANGE: This function verifies if the user is at the range of it's target - Adapt it to 3d
    atTarget(user){
        let sceneNode = user.sceneNode
        if((sceneNode.position[0] < user.target[0] -2 || sceneNode.position[0] > user.target[0] +2) && (sceneNode.position[2] < user.target[2] -2 || sceneNode.position[2] > user.target[2] +2)) {
            user.anim = "walking"
            return false
        }
        user.anim = "idle"
        return true
    }

    //Callback that handles all the world synchronization
    on_world_info( info ){
        info = JSON.parse(info)

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
                        "pos": vec3.create([-40, 0, 0]),
                        "target": vec3.create([-40, 0, 0]),
                        "anim": [0],
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
}
