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

        this.on_user_connected
        this.on_message = null
        this.on_user_disconnected = null


    }


    //Server connection
    on_connection (ws, req) {
        console.log("Connected");

        //Parse the url

        let path = url.parse(req.url)
        let user_name = qs.parse(path.query).username

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

        //Tell everyone that a user has connected

        let msg = {
            username: user_name,
            type: "LOGIN",
            content: ws.id,
            date: new Date()
        }
        this.sendToRoom(ws.room, JSON.stringify(msg))

        //Configure on message callback
        ws.on('message', this.on_message_received);
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

    
    //Message received
    on_message_received(message) {
        
        message = JSON.parse(message)

        switch (message.type) {
            case "":
                break;
        
            default:
                break;
        }
    }

    //User Connection

    //User Login
    
    //User Logout
    
    //Message sent
    
    //User Disconnection
    
    //Server Disconnection

    listen ( port ) {
        this.port = port;
        this.server.listen(port, () => {
            console.log("Server listening on port " + port);
        });
    }

    //Helper function that broadcasts a message to all the clients of a room (or to the targeted ID's)
    sendToRoom (room_name, msg, target){

        if ( msg === undefined){
            return
        }
        let room = this.rooms[room_name]
        if ( !room ){
            return
        }
        console.log(room.clients.length);
        for(let client of room.clients){
            if (target && !(client.user_id in target)) {
                continue
            }
            if(client.readyState != WebSocket.OPEN){
			    continue;
            }
            client.send(msg)
        }
    }
}

module.exports.MyServer = MyServer
