const express = require('express');
const WebSocketServer = require('websocket').server;
const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');
const DB = require('./Database');

class MyServer {

    rooms = {}
    clients = []
    usernameToClient = {}
    lastID = 1

    constructor() {

        let app = express();

        app.use(express.static('../client'));

        app.get("/world", (req, res) => {
            let worldData = fs.readFileSync("./world.json")
            res.send(worldData);
        })

        this.server = http.createServer( app );
        this.wss = new WebSocketServer({ httpServer: this.server });
        
        this.wss.on("request", this.on_connection.bind(this));

        this.on_user_connected = null
        this.on_message = null
        this.on_user_disconnected = null


    }


    //Server connection
    on_connection (req) {
        console.log("Connected");

        //Parse the url

        let ws = req.accept()

        let path = url.parse(req.resource)
        let user_name = qs.parse(path.query).username
        let password = qs.parse(path.query).password
        ws.username = user_name


        let room_name = path.pathname
        ws.room = room_name.substr(1, room_name.length)

        if(ws.room == "register") {
            console.log("Someone is registering");
            let msg = {
                type: "REGISTER",
                exists: false
            }

            if(DB.getPassword(user_name)) {
                msg.exists = true
            } else {
                DB.setUser(user_name, password)
            }
            ws.send(JSON.stringify(msg))
            return
        }

        if(!(user_name in this.usernameToClient)){
            if(DB.getPassword(user_name) !== password) {
                let msg = {
                    type: "LOGINERROR",
		    content: "Username or password is wrong"	
                }
                ws.send(JSON.stringify(msg))
                return
            } 
    
        } else {
            //If the user already exists
            let msg = {
                type: "LOGINERROR",
                content: "User is already connected"
            }
            ws.send(JSON.stringify(msg))
            return
        }
        
        //Accept the new client and give it it's ID
        this.get_new_id(ws)
        
        
        //Add the new client 
        if(this.rooms[ws.room] == null){
            this.createRoom(ws.room)
        }
        this.usernameToClient[user_name] = ws
        this.clients.push(ws)
        this.rooms[ws.room].clients.push(ws)


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
            content: {
                character: "girl",
                //This is the default position. TODO: restore the position from previous connection
                position: [-40, 0, 0],
                scaling: 0.3,
                target: [-40, 0, 0],
                anim: "default"
            },
            date: new Date()
        }
        this.sendToRoom(ws.room, JSON.stringify(msg))

        //Configure on message callback
        ws.on('message', this.on_message_received.bind(this));

        //Configure on close and on error callback

        let connection_close = () => {

            let room = this.rooms[ws.room]
            if(!room) {
                return
            }
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
            delete this.usernameToClient[user_name]

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
            let type = JSON.parse(msg).type

            if (target && client.id !== target) {
                continue
            }
            if(!client.connected){
                continue;
            }
	    console.log(msg)
            client.send(msg)
        }
    }
    
    //Message received
    on_message_received(message) {
        let msg = JSON.parse(message.utf8Data)
        
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
