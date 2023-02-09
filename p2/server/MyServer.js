const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const url = require('url');
const qs = require('querystring');

class MyServer {

    rooms = {}
    clients = []
    usernameToClient = {}
    db = {}
    lastID = 1

    constructor() {

        let app = express();

        app.use(express.static('public'));

        this.server = http.createServer( app );
        this.wss = new WebSocket.Server({ server: this.server });
        
        this.wss.on("connection", this.on_connection.bind(this));

        this.on_user_connected = null
        this.on_message = null
        this.on_user_disconnected = null


    }


    //Server connection
    on_connection (ws, req) {
        console.log("Connected");

        //Parse the url

        let path = url.parse(req.url)
        let user_name = qs.parse(path.query).username
        ws.username = user_name

        let room_name = path.pathname
        ws.room = room_name.substr(1, room_name.length)

        
        //Accept the new client and give it it's ID
        this.get_new_id(ws)
        
        
        //Add the new client 
        if(this.rooms[ws.room] == null){
            this.createRoom(ws.room)
        }
        this.usernameToClient[user_name] = ws
        this.clients.push(ws)
        this.rooms[ws.room].clients.push(ws)

        console.log(this.rooms);

        let clients = {}

        for (let client of this.rooms[ws.room].clients) {
            clients[client.id] = {id: client.id, name: client.username}
        }

        let room = {
            type: "ROOM",
            name: ws.room,
            clients: clients,
            length: clients.length
        }

        this.sendToRoom(ws.room, JSON.stringify(room), ws.id)
        
        //Tell everyone that a user has connected

        let msg = {
            userID: ws.id,
            username: user_name,
            type: "LOGIN",
            content: "",
            date: new Date()
        }
        this.sendToRoom(ws.room, JSON.stringify(msg))

        //Configure on message callback
        ws.on('message', this.on_message_received.bind(this));

        //Configure on close and on error callback
        //TODO

        let connection_close = () => {

            //TODO: erase the client from the room and server

            let room = this.rooms[ws.room]
            let index = room.clients.indexOf(ws)

            room.clients.splice(index, 1)
            this.clients.splice(this.clients.indexOf(ws), 1)

            if(room.clients.length == 0){
                delete this.rooms[ws.room]
            }

            //Send logout message to all the clients
            let msg = {
                userID: ws.id,
                username: user_name,
                type: "LOGOUT",
                content: "",
                date: new Date()
            }

            this.sendToRoom(ws.room, JSON.stringify(msg));

            if(this.on_user_disconnected){
                this.on_user_disconnected()
            }
        }

        ws.on("close", connection_close)
        ws.on("error", connection_close)
    }

    //Create a new room 
    createRoom(room_name) {
        this.rooms[room_name] = { clients: []}
    }
    
    get_new_id(ws) {
        ws.id = this.lastID
        this.lastID++
        
        let msg = {
            userID: ws.id,
            content: "", 
            type: "ID",
            date: new Date()
        }
        ws.send(JSON.stringify(msg))
        console.log("Sent the new id " + ws.id);
        return ws.id
    }
    
    //Helper function that broadcasts a message to all the clients of a room (or to the targeted ID's)
    sendToRoom(room_name, msg, target) {

        if ( msg === undefined){
            return
        }
        let room = this.rooms[room_name]
        if ( !room ){
            return
        }

        for(let client of room.clients){

            if (target && client.id !== target) {
                continue
            }
            if(client.readyState != WebSocket.OPEN){
                continue;
            }

            client.send(msg)
        }
    }
    
    //Message received
    on_message_received(message) {
        
        let msg = JSON.parse(message)


        
        if(this.on_message){
            this.on_message()
        }
        
        console.log(msg);
        this.sendToRoom(msg.room, JSON.stringify(msg), msg.targets)
    }

    listen ( port ) {
        this.port = port;
        this.server.listen(port, () => {
            console.log("Server listening on port " + port);
        });
    }

}

module.exports.MyServer = MyServer
