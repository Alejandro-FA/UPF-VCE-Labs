const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

const UserSchema = new Schema ({
    //Register info (PERMANENT! NOT CHANGABLE)
    username: {type: String, required: true},
    password: {type: String, required: true},
    date:  {type: Date, default: Date.now},

    //World info with DEFAULT values
    character: {type: String, default: "girl"},
    room: {type: String, default: "Spanish"},
    position: {type: Array, default: [0, 0, 0]},
    scaling: {type: Number, default: 0.4},
    target: {type: Array, default: [0, 0, 0]},
    anim: {type: String, default: "girl_idle"}
});



//----------- Methods -----------

//Encriptar password
UserSchema.methods.encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = bcrypt.hash(password, salt);
    return hash;
};

//Comparar password ingresada vs hash password original
UserSchema.methods.matchPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

UserSchema.methods.getUserInfo = function() {
    let user = {
        character: this.character,
        room: this.room,
        position: this.position,
        scaling: this.scaling,
        target: this.target,
        anim: this.anim,
    }
    return user;
}

UserSchema.methods.saveUserData = function (userInfo) {
    this.position = userInfo.position;
    this.target = userInfo.target;
    this.character = userInfo.character;
    this.scaling = userInfo.scaling;
    this.anim = userInfo.anim;
}



//----------- Statics -----------
UserSchema.statics.fromJson = function(object) {
    let user = {
        username: object.username,
        password: object.password,
        date: object.date,
        character: object.character,
        room: object.room,
        position: object.position,
        scaling: object.scaling,
        target: object.target,
        anim: object.anim
    }

    return user;
}


UserSchema.statics.toJson = function(userObject) { //Igual a fromJson
    let user = {
        username: userObject.username,
        password: userObject.password,
        date: userObject.date,
        character: userObject.character,
        room: userObject.room,
        position: userObject.position,
        scaling: userObject.scaling,
        target: userObject.target,
        anim: userObject.anim
    }

    return user;
}




//----------- Export the Schema -----------
module.exports = mongoose.model('User', UserSchema);