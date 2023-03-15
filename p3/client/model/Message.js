/**
 * In this file we can find all the functions that send and parse the different messages
 * needed in the MyWorld class. When defining a new message, we must define the function
 * that sends it and the function that parses it
 */

/**
 * Send a move message to the room
 * @param room
 * @param username
 * @param myuser
 * @param userId
 */
function sendMoveMessage(room, username, myuser, userId) {
    let msg = {
        room: WORLD.room_name,
        type: "MOVE",
        username: username,
        content: myuser,
        userID: MYCHAT.server.user_id
    }

    MYCHAT.server.sendMessage(msg)
}

/**
 * Parses a Skin Message
 * @param msg {{room, username, myuser, userId}}
 */
function parseMoveMessage(msg) {
    /*{
        room: this.room_name,
        type: "MOVE",
        username: this.username,
        content: myuser,
        userID: MYCHAT.server.user_id
    }*/
    let user = msg.content

    WORLD.setUserTarget(msg.username, user.target)

    WORLD.room.users[msg.username] = WORLD.users[msg.username] = User.fromJson(user);
}

/**
 * Send a Skin message to all the room
 * @param room
 * @param username
 * @param character_name
 * @param userId
 */
function sendSkinMessage(room, username, character_name, userId) {
    let msg = {
        room: room,
        type: "SKIN",
        user: username,
        content: character_name,
        userID: userId
    }
    MYCHAT.server.sendMessage(msg)
}

/**
 * Parses a Skin message
 * @param msg {{room, username, character_name, userId}}
 */
function parseSkinMessage(msg) {
    /*let msg = {
        room: this.room_name,
        type: "SKIN",
        user: this.username,
        content: character_name,
        userID: MYCHAT.server.user_id
    }*/
    let node = SCENE_NODES[msg.user]
    let pos = node.position
    let character_name = msg.content

    //Overwrite the current scene node
    scene.root.removeChild(node)
    WORLD.createCharacter(character_name, msg.user, pos, character_scalings[character_name])
    let changingUser = WORLD.users[msg.user]
    //Update the user object with the new Skin
    changingUser.character = character_name
}

/**
 * Send a World message to the specified target
 * @param room_name
 * @param username
 * @param room_info
 * @param userId
 * @param target
 */
function sendWorldMessage(room_name, username, room_info, userId, target) {
    let msg = {
        room: room_name,
        type: "WORLD",
        user: username,
        content: room_info,
        userID: userId
    }
    MYCHAT.server.sendMessage(msg, target)
}

/**
 * Parses a World message
 * @param msg {{room, type, user, content, userID}}
 */
function parseWorldMessage(msg) {

    let room = msg.content
    WORLD.room = Room.fromJson(room)
    WORLD.room_name = msg.room
    WORLD.users = WORLD.room.users

    if(!WORLD.users[WORLD.username]) {
        WORLD.users[WORLD.username] = new User(
            "girl",
            vec3.create([-40, 0, 0]),
            0.4,
            vec3.create([-40, 0, 0]),
            "girl_idle"
        )
    }

    for (let name in WORLD.users) {
        let user = WORLD.users[name];
        if(name !== WORLD.username)
            WORLD.createCharacter(user.character, name, user.position, user.scaling)
    }
}

/**
 * Parses a Login message
 * @param msg {{ userID, username, type, content, date}}
 */
function parseLoginMessage(msg) {
    if (MYCHAT.server.user_id === Number(Object.keys(MYCHAT.server.clients)[0])) {
        sendWorldMessage(WORLD.room_name, WORLD.username, WORLD.room.toJson(), MYCHAT.server.user_id)
    }

    WORLD.room.users[msg.username] = WORLD.users[msg.username] = msg.content
    WORLD.createCharacter(msg.content.character, msg.username, msg.content.position, msg.content.scaling)
}


/**
 * Parses a Logout message
 * @param msg {{userID, username, type, content, date}}
 */
function parseLogoutMessage(msg) {

    delete SCENE_NODES[msg.username]
    delete WORLD.users[msg.username]
    delete WORLD.room.users[msg.username]
}