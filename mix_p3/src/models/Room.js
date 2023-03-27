const mongoose = require('mongoose');
const { Schema } = mongoose;
const User = require('./User');
const Song = require('./Song');

const RoomSchema = new Schema ({
    type: {type: String, default: "ROOM"},
    name: {type: String, required: true, default: "roomName"},
    //exit: {type: String, required: true},
    clients: [{type: Object, required: true}],
    length: {type: Number, required: false, default: 0},
    url: {type: String, required: true, default: "url"},
    songs: [{type: mongoose.ObjectId, ref: 'Song', required: false}],
    users: [{type: mongoose.ObjectId, ref: 'User', required: false}]

    //Problema con users: NO se pueden guardar diccinarios en mongoose!!
    //users: {{type: mongoose.ObjectId, ref: 'User', required: false}}
});

//const Room = mongoose.model('Room', RoomSchema);

//----------- Methods -----------

//RoomSchema.methods.getRoom = function()



//----------- Statics -----------
RoomSchema.statics.createRoomWithName = function(roomName) {
    let room = new RoomSchema();
    room.name = roomName;
    return room;
}

RoomSchema.statics.fromJson = function(object) {
    
    //Cogemos las canciones de la room y las transformamos a SongSchema
    let songs_list = []; //Lista de songs
    for(i = 0; i<object.songs.length; i++) { //Por cada song de la room
        let songObject = Song.fromJson(object.songs[i]); //Parseamos los datos
        let song = new Song(songObject); //Creamos la song con SongSchema
        songs_list.push(song); //Añadimos la song a la lista
    }

    //Creamos el objeto room con los datos
    let room = {
        //type: "ROOM",
        name: object.roomName,
        //exit: object.exit,
        clients: object.clients,
        length: 0,
        url: object.url,
        songs: songs_list,
        users: object.users
    }

    //Devolvemos el objeto
    return room;
}


RoomSchema.statics.toJson = function(roomObject) {

    //Cogemos las canciones de la room y las transformamos a "toJson"
    let songs_list = []; //Lista de songs
    for(i = 0; i<roomObject.songs.length; i++) { //Por cada song de la room
        let song = Song.toJson(roomObject.songs[i]); //Parseamos los datos
        songs_list.push(song); //Añadimos la song a la lista
    };

    //Repetimos con user
    let = users_list = [];
    for(i = 0; i<roomObject.users.length; i++) { //Por cada song de la room
        let user = User.toJson(roomObject.users[i]); //Parseamos los datos
        users_list.push(user); //Añadimos la song a la lista
    };

    //Construimos room object según los datos originales
    let room = {
        type: roomObject.type,
        name: roomObject.name,
        clients: roomObject.clients,
        length: roomObject.length,
        url: roomObject.url,
        songs: songs_list,
        users: users_list
    };

    //Devolvemos el objeto preparado para parsear a json
    return room;
}



//----------- Export the Schema -----------
module.exports = mongoose.model('Room', RoomSchema);