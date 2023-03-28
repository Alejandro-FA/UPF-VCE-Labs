let SONG_PLAYING = false;
let peer = new Peer()
let peerId = null

peer.on("open", (id) => {
    peerId = id
})

peer.on("connection", (conn) => {
    conn.on("data", (data) => {
        console.log(data)
        let id = data.id
        sendAudioStream(id)
    })
})

/**
 * Send the audio from one peer to another
 * @param other_peer_id
 */
function sendAudioStream(other_peer_id) {
    let getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    getUserMedia({audio: true}, (stream) => {
        peer.call(other_peer_id, stream);
    }, (err) => {
        console.error('Failed to get local stream', err);
    });
}


class Song {

    //Constructor
    constructor(title="", artist="", url="", singingUser=null){
        this.title = title;
        this.artist = artist;
        this.url = url;
        this.singingUser = singingUser;
    }
    /**
     * Creates an instance of Song from a Json of correct structure
     * @param object {{title, artist, url}}
     * @return {Song}
     */
    static fromJson(object) {
        return new Song(object.title, object.artist, object.url, null);
    }

    /**
     * Converts the song into a JSON object
     * @return {{artist, title, url}}
     */
    toJson() {
        return {
            "title": this.title,
            "artist": this.artist,
            "url": this.url
        }
    }

    /**
     * Play a Song and connect via Peer.js to the other clients to send the audio stream
     * @param username
     * TODO: Use peer.js
     * TODO: Think how we will do if some user connects in the middle of a song
     */
    play(username) {
        //Check if some song is already playing
        if(SONG_PLAYING) {
            console.log("Song is playing");
            return;
        }

        SONG_PLAYING = true;

        //Initialize the audio context
        const audioContext = new window.AudioContext();

        let audioElement = document.createElement("audio");
        audioElement.src = this.url;
        //Event listener for when the song ends
        audioElement.addEventListener("ended", () => {
            console.log("Song ended");
            SONG_PLAYING = false;
            freeze = false;
            peer.destroy();
            WORLD.teleportUser(username, vec3.fromValues(0, 0, 0))
        });

        document.body.appendChild(audioElement);

        let track = audioContext.createMediaElementSource(audioElement);

        //To control the sound
        const gainNode = audioContext.createGain();

        //Exemple
        /*
        <input type="range" id="volume" min="0" max="2" value="1" step="0.01" />

        const volumeControl = document.querySelector("#volume");

        volumeControl.addEventListener(
          "input",
          () => {
            gainNode.gain.value = volumeControl.value;
          },
          false
        );

         */

        track.connect(gainNode).connect(audioContext.destination);

        audioElement.play()
            .then(r => console.log(r))
            .catch(r => console.error(r));

    }

    /**
     * Send Sing and Song messages to the room
     */
    sing() {
        //Send the song message to all the room
        if(!SONG_PLAYING)
            sendSongMessage(WORLD.username, WORLD.room_name, this.title, MYCHAT.server.user_id);

        sendSingMessage(WORLD.room_name, MYCHAT.server.user_id, peerId);

        this.play(WORLD.username)
    }
}