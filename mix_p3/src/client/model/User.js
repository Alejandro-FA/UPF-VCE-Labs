class User {
    constructor(character, position, scaling, target, anim) {
        this.character = character;
        this.position = position;
        this.scaling = scaling;
        this.target = target;
        this.anim = anim;
    }

    /**
     * Creates an instance of User from a Json of correct structure
     * @param object {object}
     * @returns {User}
     */
    static fromJson(object) {
        let user = new User(object.character, object.position, object.scaling, object.target, object.anim);
        return user;
    }

    /**
     * Converts the user into a JSON object
     * @returns {{character, scaling, position, anim, target, room, username}}
     */
    toJson(){
        return {
            "character": this.character,
            "position": this.position,
            "scaling": this.scaling,
            "target": this.target,
            "anim": this.anim,
            "room": this.room,
            "username": this.username
        }
    }
}