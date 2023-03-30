const mongoose = require('mongoose');
const { Schema } = mongoose;
const User = require('./User');
const Song = require('./Song');
const Room = require('./Room');


const GlobalsSchema = new Schema ({
    rooms: [{type: mongoose.ObjectId, ref: 'Room', required: false}],
    users: [{type: mongoose.ObjectId, ref: 'User', required: false}],
    clients: [{type: Object, required: false}],
    clients_obj: [{type: Object, required: false}],
    lastID: {type: Number, required: false, default: 1},
})

//----------- Methods -----------
GlobalsSchema.methods.findRoomByName = function(roomName) {
    let rooms = this.rooms;
    for(let i = 0; i<rooms.length; i++) {
        if(rooms[i].name === roomName) {
            return rooms[i];
        }
    }
    return null;
}

GlobalsSchema.methods.usernameToClient = function(username) {
    let clients = this.clients;
    for(let i = 0; i<clients.length; i++) {
        if(clients[i].username === username) {
            return clients[i];
        }
    }
    return null;
}

GlobalsSchema.methods.usernameToUser = function(username) {
    let users = this.users;
    for(let i = 0; i<users.length; i++) {
        if(users[i].username === username) {
            return users[i];
        }
    }
    return null;
}

GlobalsSchema.methods.addClientObject = function(id, username) {
    let client_obj = {
        id: id,
        name: username
    };
    this.clients_obj.push(client_obj);
}


GlobalsSchema.methods.clientObjectListToDict = function() {
    let clientObjDict = {};
    for(let i = 0; i < this.clients_obj.length; i++) {
        clientObjDict[this.clients_obj[i].id] = {
            id: this.clients_obj[i].id,
            name: this.clients_obj[i].name
        };
    };
    return clientObjDict;
}



GlobalsSchema.methods.findClientObjectByUsername = function(username) {
    for(const client_obj of this.clients_obj) {
        if (client_obj.name === username) return client_obj;
    }

    return null;
}



GlobalsSchema.methods.createNewRoom = function(roomName) {
    let room = new Room();
    room.name = roomName;
    this.rooms.push(room);
}

GlobalsSchema.methods.chargeWorldJson = function(json) {
    //Charge rooms data
    for (let i = 0; i<json['rooms'].length; i++) {
        let roomObject = Room.fromJson(json['rooms'][i]);
        let room = new Room(roomObject);
        this.rooms.push(room);
    }
}


//
GlobalsSchema.methods.generateWorldInfo = function (userInfo) {

    let roomsDict = {};
    for(let i = 0; i< this.rooms.length; i++) {
        let room = this.rooms[i]
        
        let room_songs = [];
        for(let j = 0; j < room.songs.length; j++) {
            room_songs.push(Song.toJson(room.songs[j]));
        }

        //Send room_users
        let room_users = {};
        for( let k = 0; k < room.users.length; k++) {
            room_users[room.users[i].username] = room.users[i];
        }

        roomsDict[room.name] = {
            url: room.url,
            users: {},
            exit: "default",
            songs: room_songs,
            clients: []
        }
    }

    let worldInfo = {
        rooms: roomsDict,
        user: JSON.stringify(userInfo)
    }

    return worldInfo;
}



//----------- Export the Schema -----------
module.exports = mongoose.model('Globals', GlobalsSchema);