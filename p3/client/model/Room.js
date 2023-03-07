class Room {

    /**
     * Creates an instance of Room from a Json of correct structure
     * @param object {{l_exit, r_exit, url, users }}
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
        room.r_exit = object.r_exit;
        room.l_exit = object.l_exit;
        return room
    }

    /**
     * Converts the room into a JSON object
     * @returns {{l_exit, r_exit, url, users}}
     */
    toJson() {

        let users = {};
        for (const username in this.users) {
            let user = this.users[username];
            users[username] = user.toJson();
        }
        return {
            "url": this.url,
            "users": users,
            "r_exit": this.r_exit,
            "l_exit": this.l_exit
        }
    }
}