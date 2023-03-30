class Room {
    //Constructor
    constructor(name="", url="", usersDict={}, songsList=[], exit="") {
        this.name = name;
        this.url = url;
        this.songs = [...songsList];
        this.users = {};
        this.exit = exit;

        for (const username in usersDict) {
            let user = usersDict[username];
            this.users[username] = user;
        }
    }

    /**
     * Creates an instance of Room from a Json of correct structure
     * @param object {{exit, url, users, songs}}
     * @returns {Room}
     */
    static fromJson(object) {
        let name = object.name || "";
        let url = object.url;
        let exit = object.exit;

        let users = {};
        for (const username in object.users) {
            let user = object.users[username];
            users[username] = User.fromJson(user);
        }

        let songs = [];
        for (let i = 0; i < object.songs.length; i++) {
            songs[i] = Song.fromJson(object.songs[i])
        }
        
        return new Room(name, url, users, songs, exit);
    }

    /**
     * Converts the room into a JSON object
     * @returns {{name, exit, url, users, songs}}
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
            "name": this.name,
            "url": this.url,
            "users": users,
            "exit": this.exit,
            "songs": songs
        }
    }
}