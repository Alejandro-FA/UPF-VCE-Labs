const mongoose = require('mongoose');
const { Schema } = mongoose;
const User = require('./User');
const Song = require('./Song');
const Room = require('./Room');

const GlobalsSchema = new Schema ({
    rooms: [{type: mongoose.ObjectId, ref: 'Room', required: false}],
    clients: [{type: Object, required: false}], //clients == usernameToClient
    clients_obj: [{type: Object, required: false}],
    lastID: {type: Number, required: false, default: 1},
    currentRoom: {type: mongoose.ObjectId, ref: 'Room', required: false}
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
        if(clients[i].username === uername) {
            return clients[i];
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

GlobalsSchema.methods.chargeWorldJson = function(json) {
    //Charge rooms data
    for (let i = 0; i<json['rooms'].length; i++) {
        let roomObject = Room.fromJson(json['rooms'][i]);
        let room = new Room(roomObject);
        this.rooms.push(room);
    }
}


//----------- Export the Schema -----------
module.exports = mongoose.model('Globals', GlobalsSchema);