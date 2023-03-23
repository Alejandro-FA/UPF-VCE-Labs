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
        let user = new User();
        user.character = object.character;
        user.position = object.position;
        user.scaling = object.scaling;
        user.target = object.target;
        user.anim = object.anim;
        return user
    }

    /**
     * Converts the user into a JSON object
     * @returns {{character, scaling, position, anim, target}}
     */
    toJson(){
        return {
            "character": this.character,
            "position": this.position,
            "scaling": this.scaling,
            "target": this.target,
            "anim": this.anim,
        }
    }
}