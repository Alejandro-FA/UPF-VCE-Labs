class Room {

    /**
     * Creates an instance of Room from a Json of correct structure
     * @param object {{exit, url, users, songs}}
     * @returns {Room}
     */
    static fromJson(object) {
        let room = new Room();
        room.url = object.url;

        let users = {};
        for (const username in object.users) {
            let user = object.users[username];
            users[username] = User.fromJson(user);
        }

        room.users = users;
        room.exit = object.exit;

        room.songs = []
        for (let i = 0; i < object.songs.length; i++) {
            room.songs[i] = Song.fromJson(object.songs[i])
        }

        return room
    }

    /**
     * Converts the room into a JSON object
     * @returns {{exit, url, users, songs}}
     */
    toJson() {

        let users = {};
        for (const username in this.users) {
            let user = this.users[username];
            users[username] = user.toJson();
        }

        let songs = [];
        for (let i = 0; i < this.songs.length; i++) {
            songs[i] = this.songs[i].toJson();
        }

        return {
            "url": this.url,
            "users": users,
            "exit": this.exit,
            "songs": songs
        }
    }
}