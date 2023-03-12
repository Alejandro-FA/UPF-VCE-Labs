const RIGHT = 0;
const FRONT = 64;
const LEFT = 128;
const BACK = 192;

const SCENE_NODES = {};

class MyWorld {
    constructor(room, username) {
        this.user_avatar = null
        this.username = username
        this.room_name = room
        MYCHAT.server.on_world_info = this.on_world_info.bind(this)
        
        this.world = null
        this.room = null
        this.users = null
        this.background = null

        //TODO: Change when using in server
        //fetch('https://ecv-etic.upf.edu/node/9017/world')
        fetch('model/world.json')
        .then(response => response.json())
        .then(data => {

            this.world = data
	    if(!this.room){
           	 this.room = Room.fromJson(data[room])
           	 this.users = this.room.users
	    }

            if(!this.users[username]) {
                this.users[username] = new User(
                    "girl",
                    vec3.create([-40, 0, 0]),
                    0.3,
                    vec3.create([-40, 0, 0]),
                    "girl_idle",
                )
            }

        })
    }

    /**
     * Set the specified SceneNode to the specified username
     * @param username {String}
     * @param SceneNode {SceneNode}
     */
    setUserSceneNode(username, SceneNode) {
        if(this.users){
            this.users[username].position = SceneNode.position;
        } 
        SCENE_NODES[username] = SceneNode
    }

    setThisUserSceneNode(SceneNode) {
        this.setUserSceneNode(this.username, SceneNode);
    }

    /**
     * This function sets the target of the specified user and orients said character
     * @param {String} username Name of the user that changes target
     * @param {vec3} target New target of the specified user
    * */
    setUserTarget(username, target) {
        if(this.users) {
            this.users[username].target = target;
            this.setUserAnim(username, `${SCENE_NODES[username]}_walking`)

            //Orient the character to the new target
            let character = SCENE_NODES[username]
            let delta = vec3.sub(vec3.create(), target, character.position)
            //Face the wanted direction
            delta[0] = -delta[0]
            character.orientTo(delta, false, [0, 1, 0], true)
        }
    }

    /**
     * Set this users target
     * @param target
     */
    setThisUserTarget(target) {
        this.setUserTarget(this.username, target);
    }

    setThisUserAnim(anim) {
        this.setUserAnim(this.username, anim);
    }

    /**
     * Set the wanted user animation
     * @param username
     * @param anim
     */
    setUserAnim(username, anim) {
        if(this.users) {
            this.users[username].anim = `${anim}`;
        }
    }


    //Update the data of the model
    update(elapsed_time) {

        //Update the position of every user
        for(let name in this.users){
            let user = this.users[name]
            if(!this.atTarget(name)) {
                this.moveCharacter(SCENE_NODES[name], user.target, elapsed_time);
                //user.pos[0] = lerp( user.pos[0], user.target[0], elapsed_time );
            }
            let t = getTime();
            let time_factor = 1;
            let anim = animations[user.anim]
            let character = SCENE_NODES[name].children[0]
            //move bones in the skeleton based on animation
            anim.assignTime( t * 0.001 * time_factor );
            //copy the skeleton in the animation to the character
            character.skeleton.copyFrom( anim.skeleton );

        }

    }

    /**
     * Move the chosen sceneNode to the target
     * @param character
     * @param target
     * @param dt
     */
    moveCharacter(character, target, dt) {
        let delta = vec3.sub( vec3.create(), target, character.position );
        vec3.normalize(delta,delta);
        vec3.scaleAndAdd( character.position, character.position, delta, dt * 50);
        character.updateMatrices();
        character.flags.flipX = delta[0] < 0;
    }

    /**
     * Changes all the necessary world data
     * TODO: Adapt it to 3d
     * @param room_name
     */
    changeRoom(room_name) {
        //Delete the user from the old room
        let myuser = this.users[this.username]

        this.room.users = {}

        //Enter the new room
        this.room = this.world[room_name]


        let node = scene.root.findNodeByName("room")

        node.removeAllChildren()
        setTimeout(() => {
            node.loadGLTF(this.room.url)
        }, 500)

        //Change the current room name

        this.room_name = room_name
    
        //Reset the position and target of the user

        myuser.position = SCENE_NODES[this.username].position = myuser.target = [0, 0, 0]

        //Add the user to the new room
        this.room.users[this.username] = myuser

        //Update the users object
        this.users = this.room.users

        //Change the room in the chat
        /*
        if(MYCHAT.visited_chats.includes(room_name)){
            MYCHAT.changeChat(room_name).call(MYCHAT)
        } else {
            MYCHAT.connectNewChat(room_name)
        }
        */
    }

    /**
     * This function verifies if the user is at the range of it's target
     * TODO: Adapt it to 3d
     * @param username
     * @returns {boolean}
     */
    atTarget(username){
        let user = this.users[username]
        let sceneNode = SCENE_NODES[username]
        if((sceneNode.position[0] < user.target[0] -2 || sceneNode.position[0] > user.target[0] +2)
            && (sceneNode.position[2] < user.target[2] -2 || sceneNode.position[2] > user.target[2] +2)) {

            user.anim = `${sceneNode.name}_walking`
            return false
        }
        user.anim = `${sceneNode.name}_idle`
        return true
    }

    /**
     * Callback that handles all the world synchronization
     * @param info {{room, userID, username, type, content, date}}
     */
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
                        content: this.room.toJson(),
                        userID: MYCHAT.server.user_id
                    }
                    MYCHAT.server.sendMessage(msg, info.userID)
                }

                this.room.users[info.username] = this.users[info.username] = info.content
                this.createCharacter(info.content.character, info.username, info.content.position, info.content.scaling)

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

                delete SCENE_NODES[info.username]
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

                this.setUserTarget(info.username, user.target)

                this.room.users[info.username] = this.users[info.username] = User.fromJson(user);

                
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
                this.room = Room.fromJson(room)
                this.room_name = info.room
                this.users = this.room.users

                if(!this.users[this.username]) {
                    this.users[this.username] = new User(
                         "girl",
                         vec3.create([-40, 0, 0]),
                         0.3,
                         vec3.create([-40, 0, 0]),
                         "girl_idle"
                    )
                }
                
                for (let name in this.users) {
                    let user = this.users[name];
                    if(name !== this.username)
                        this.createCharacter(user.character, name, user.position, user.scaling)
                }
                break;

            default:
                console.error("Something went wrong")
                break;
        }
    }

    /**
     * Create a character from a LOGIN message
     * @param character_name
     * @param username
     * @param position
     * @param scaling
     */
    createCharacter(character_name, username, position, scaling) {

        //create material for the character
        let mat = new RD.Material({
            textures: {
                color: `${character_name}/${character_name}.png` }
            });
        mat.register(`${character_name}`);

        //create pivot point for the character
        let character_pivot = new RD.SceneNode({
            position: position,
            name: character_name
        });

        //create a mesh for the character
        let character = new RD.SceneNode({
            scaling: scaling,
            mesh: `${character_name}/${character_name}.wbin`,
            material: `${character_name}`
        });
        character_pivot.addChild(character);
        character.skeleton = new RD.Skeleton();

        this.setUserSceneNode(username, character_pivot);
        this.setUserTarget(username, position);
        this.setUserAnim(username, `${character_name}_idle`)

        scene.root.addChild( character_pivot );

        //Create a selector for the character
        let character_selector = new RD.SceneNode({
            position: [0, 0, 0],
            mesh: "cube",
            material: `${character_name}`,
            scaling: [10, 80, 10],
            name: "character_selector",
            layers: 0b1000
        })
        character_pivot.addChild(character_selector);
        SCENE_NODES[username] = character_pivot;

        loadAnimation(`${character_name}_idle`,`view/data/${character_name}/idle.skanim`);
        loadAnimation(`${character_name}_walking`,`view/data/${character_name}/walking.skanim`);
        loadAnimation(`${character_name}_dance`,`view/data/${character_name}/dance.skanim`);
    }
}
