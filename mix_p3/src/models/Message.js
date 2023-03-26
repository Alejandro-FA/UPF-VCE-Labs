const mongoose = require('mongoose');
const { Schema } = mongoose;
const User = require('./User');
const Room = require('./Room');



//----------- Schema -----------
const MessageSchema = new Schema ({
    userID: {type: Number, required: true},
    username: {type: String, required: true},
    type: {type: String, required: true},
    content: {type: mongoose.Mixed, default: ""},
    //userInfo,
    //date: {type: Date, default: new Date()}
    date:  {type: Date, default: Date.now}
});



//----------- Methods -----------





//----------- Statics -----------
MessageSchema.statics.fromJson = function(object) { //RAQUEL: Una vez terminada toJson replicar aquí pero "al revés"
    return null;
}




MessageSchema.statics.toJson = function(messageObject) {
    let content = "";

    switch (content) {
        case("LOGIN"):
            content = User.toJson(messageObject.content);
        break;

        case("LOGINERROR"):

        break;

        case("REGISTER"):
            //RAQUEL: Este msg se usa?????
        break;

        case("LOGOUT"):
            content = "";
        break;

        //case("ROOM"):

        //break;

        case("ID"):
            content = "";
        break;

        case("text"):
            content = messageObject.content;
        break;

        case("history"):

        break;

        case("private"):

        break;

        case("CHANGE-ROOM"):

        break;

        case("MOVE"): //RAQUEL: DUDAS DE SI OK O NO!!!
            content = User.toJson(messageObject.content);
        break;

        case("SKIN"):
            content = messageObject.content; //character_name
        break;

        case("WORLD"):
            content = Room.toJson(messageObject.content) //room Schema
        break;

        case("SONG"):
            content = messageObject.content; //song_title
        break;

        case("SING"): //RAQUEL: mod este tipo de msg pq tiene fields DISTINTOS!!
        /*let msg = {
            room: room_name,
            type: "SING",
            userID: userId,
            peerId: peerId,
        }*/

        break;

        default:
            content = "";
    }
    
    let message = {
        userId: messageObject.userId,
        username: messageObject.username,
        type: messageObject.type,
        content: content,
        date: messageObject.date
    }

    return message;
}



//----------- Export the Schema -----------
module.exports = mongoose.model('Message', MessageSchema);