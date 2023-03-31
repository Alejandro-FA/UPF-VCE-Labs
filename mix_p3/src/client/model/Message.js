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
    let user = msg.content;
    user.room = msg.room; //RAQUEL
    user.username = msg.username; //RAQUEL

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
 * Send a Dance message to the room
 * @param room
 * @param username
 * @param userId
 */
function sendDanceMessage(room, username, userId) {
    let msg = {
        room: room,
        type: "DANCE",
        username: username,
        userID: userId
    }
    MYCHAT.server.sendMessage(msg)
}

/**
 * Parses a Dance message
 * @param msg {{room, username, userId}}
 */
function parseDanceMessage(msg) {
    dance[msg.username] = true
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

    //Save my user inside room.users and then replace WORLD.users data
    WORLD.room.users[WORLD.username] = WORLD.users[WORLD.username];
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
            WORLD.createCharacter(user.character, name, user.position, character_scalings[user.character])
    }
}

/**
 * Parses a Login message
 * @param msg {{ userID, username, type, content, date}}
 */
function parseLoginMessage(msg) {
    if (WORLD.username === Object.keys(WORLD.users)[0]) {
        sendWorldMessage(WORLD.room_name, WORLD.username, WORLD.room.toJson(), MYCHAT.server.user_id)
    }

    WORLD.room.users[msg.username] = WORLD.users[msg.username] = User.fromJson(msg.content)
    WORLD.createCharacter(msg.content.character, msg.username, msg.content.position, character_scalings[msg.content.character])
}


/**
 * Parses a Logout message
 * @param msg {{userID, username, type, content, date}}
 */
function parseLogoutMessage(msg) {
    //Delete user logged out from this user world data
    let node = SCENE_NODES[msg.username]
    node.remove()

    delete dance[msg.username]
    delete SCENE_NODES[msg.username]
    delete WORLD.users[msg.username]
    delete WORLD.room.users[msg.username]
}

/**
 * Send a ChangeRoom message to all the room
 * @param room
 * @param username
 * @param userId
 */
function sendChangeRoomMessage(room, username, userId) {
    let msg = {
        room: room,
        type: "CHANGE-ROOM",
        user: username,
        userID: userId
    }
    MYCHAT.server.sendMessage(msg);
}

/**
 * Send a Song message to all the room that indicates that a song is playing
 * @param username
 * @param room_name
 * @param song_title
 * @param userId
 */
function sendSongMessage(username, room_name, song_title, userId) {
    let msg = {
        username: username,
        room: room_name,
        type: "SONG",
        content: song_title,
        userID: userId
    }
    MYCHAT.server.sendMessage(msg)
}

/**
 * Parse a Song Message
 * @param msg {{username, room, type, content, userID}}
 */
function parseSongMessage(msg) {
    let songs = WORLD.room.songs

    for (const song of songs) {
        if (song.title === msg.content) {
            song.play(msg.username);
        }
    }
}

/**
 * Send a Sing message to all the room that indicates that a user is singing
 * @param room_name
 * @param username
 * @param userId
 * @param peerId
 */
function sendSingMessage(room_name, username, userId, peerId) {
    let msg = {
        room: room_name,
        user: username,
        type: "SING",
        userID: userId,
        peerId: peerId,
    }
    MYCHAT.server.sendMessage(msg)
}

/**
 * Parse a Sing Message
 * @param msg {{room, type, userID, peerId}}
 */
function parseSingMessage(msg) {

    let conn = peer.connect( msg.peerId );
    conn.on("open", () => {
        conn.send({id: peerId});
    });

    peer.on('call', (call) => {
        call.answer()
        call.on('stream', (stream) => {
            // use the stream to receive audio
            console.log("Receiving the stream")
            const audioContext = new window.AudioContext();
            const audio = new Audio();

            let track = audioContext.createMediaElementSource(audio);

            //To control the sound
            const gainNode = audioContext.createGain();

            const volumeControl = document.querySelector("#microVolume");

            volumeControl.addEventListener(
                "input",
                () => {
                    gainNode.gain.value = volumeControl.value;
                },
                false
            );

            WORLD.teleportUser(msg.user, vec3.fromValues(-54, 0, 195), vec3.fromValues(0.001, 0,-1))
            freeze[msg.user] = true
            track.connect(gainNode).connect(audioContext.destination);
            audio.srcObject = stream;
            audio.play()
                .then(r => console.log(r))
                .catch(err => console.error(err));
        });

    });
}


//Function to inform the server to save user data because of disconnection
//INFO: NO VA
function sendSaveUserDataMessage(room_name, user_name, userInfo) {
    let msg = {
        room: room_name,
        type: "SAVE_USER_DATA",
        username: user_name,
        content: userInfo
    }
    MYCHAT.server.sendMessage(msg)
}