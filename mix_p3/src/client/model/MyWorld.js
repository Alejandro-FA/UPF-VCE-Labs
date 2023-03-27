const SCENE_NODES = {};
const WALK_AREAS = {"Spanish": SpanishWalkArea, "Japanese": JapaneseWalkArea}

class MyWorld {
    constructor(room, username) {
        this.user_avatar = null
        this.username = username
        this.room_name = room
        this.currentWalkArea = WALK_AREAS[room]
        MYCHAT.server.on_world_info = this.on_world_info.bind(this)

        this.world = null
        this.room = null
        this.users = null

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
                        0.4,
                        vec3.create([-40, 0, 0]),
                        "girl_idle",
                    )
                }
            })
            .catch(err => console.log(err))
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
     * This function sets the target of the specified user and orient the user
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
            character.orientTo(delta, false, [0, 1, 0], true, false)


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

    /**
     * Set the wanted character skin
     * @param username
     * @param character_name
     */
    setUserSkin(username, character_name) {
        if(this.users) {
            this.users[username].character = character_name
        }
    }

    /**
     * Update the data of the model
     * @param elapsed_time
     */
    update(elapsed_time) {

        //Update the position of every user
        for(let name in this.users){
            let user = this.users[name]
            if(!this.atTarget(name)) {
                this.moveCharacter(name, elapsed_time);
                user.position = SCENE_NODES[name].position
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
     * Move the chosen user to the target
     * @param name
     * @param dt
     */
    moveCharacter(name, dt) {
        let node = SCENE_NODES[name]
        let user = this.users[name]

        let delta = vec3.sub( vec3.create(), user.target, node.position );
        vec3.normalize(delta,delta);
        vec3.scaleAndAdd( node.position, node.position, delta, dt * 50);
        user.position = node.position = this.currentWalkArea.adjustPosition(name, node.position)
        node.updateMatrices();

        node.flags.flipX = delta[0] < 0;
    }

    /**
     * Teleports the chosen users at the wanted position
     * @param name
     * @param position
     * @param orientation
     */
    teleportUser(name, position, orientation) {
        let node = SCENE_NODES[name]


        let user = WORLD.users[name]
        node.position = user.position = user.target = position


        if(orientation){
            node.orientTo(orientation, false, [0, 1, 0], true, false)
        }

        let campos = character.localToGlobal([0, 180, -120])
        let camtarget = character.localToGlobal([0,65,-10]);
        camera.lookAt(campos, camtarget, [0, 1, 0])
    }
    /**
     * Changes all the necessary world data
     * TODO: Adapt it to 3d
     * @param room_name
     */
    changeRoom(room_name) {

        //Check if there is a song playing
        if(SONG_PLAYING) {
            let audio = document.querySelector("audio")
            audio.remove()
            SONG_PLAYING = false
        }

        //Delete the user from the old room
        let myuser = this.users[this.username]

        this.room.users = {}

        //Enter the new room
        this.room = Room.fromJson(this.world[room_name])


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
        MYCHAT.changeChat(room_name)
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

        if(dance) {
            user.anim = `${sceneNode.name}_dance`
        }

        if(freeze) {
            user.anim = `${sceneNode.name}_talk`
        }
        return true
    }

    /**
     * Callback that handles all the world synchronization
     * @param info
     */
    on_world_info( info ){
        info = JSON.parse(info)

        switch (info.type) {
            case "LOGIN":
                //LOGIN HANDLING
                parseLoginMessage(info)
                break;

            case "LOGOUT":
                //LOGOUT HANDLING
                parseLogoutMessage(info)
                break;

            case "MOVE":
                //UPDATE POSITION
                parseMoveMessage(info)

                break;

            case "WORLD":
                //LOAD THE WORLD
                parseWorldMessage(info)
                break;

            case "SKIN":
                //Change the skin of some client
                parseSkinMessage(info)
                break;

            case "SONG":
                //Play the song chosen by a client
                parseSongMessage(info)
                break;

            case "SING":
                //Tell all the room that a client is singing
                parseSingMessage(info)
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
     * @return {SceneNode}
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
        this.setUserSkin(username, character_name)

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
        loadAnimation(`${character_name}_talk`,`view/data/${character_name}/talk.skanim`);

        return character_pivot;
    }
}
