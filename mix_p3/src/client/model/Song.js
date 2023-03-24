let SONG_PLAYING = false;
class Song {

    /**
     * Creates an instance of Song from a Json of correct structure
     * @param object {{title, artist, url}}
     * @return {Song}
     */
    static fromJson(object) {
        let song = new Song()

        song.title = object.title
        song.artist = object.artist
        song.url = object.url

        return song
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
     * TODO: Use peer.js
     * TODO: Think how we will do if some user connects in the middle of a song
     */
    play() {
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
        });

        document.body.appendChild(audioElement);

        let track = audioContext.createMediaElementSource(audioElement);

        //To control the sound
        const gainNode = audioContext.createGain();

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
            sendSongMessage(WORLD.room_name, this.title, MYCHAT.server.user_id);

        let peer = new peerjs.Peer();

        peer.on("open", (peerId) => {
            sendSingMessage(WORLD.room_name, MYCHAT.server.user_id, peerId);
        })

        peer.on("connection", (conn) => {
            conn.on("data", () => {

            })
        })
        this.play()
    }
}