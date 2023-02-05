const express = require('express');
const WebSocket = require('ws');
const http = require('http');

class MyServer {

    constructor() {

        let app = express();

        app.use(express.static('public'));

        this.server = http.createServer( app );
        this.wss = new WebSocket.Server({ server: this.server });
        
        this.wss.on("connection", this.on_connection.bind(this));

        this.on_user_connected = null;
        this.on_message = null
        this.on_user_disconnected = null


    }


    //Server connection
    on_connection(WebSocketClient, req) {
        console.log("Connected");
        WebSocketClient.send('{"connection": "ok"}');

        WebSocketClient.on('message', (message) => {

            //for each websocket client
            this.wss
            .clients
            .forEach( client => {
                //send the client the current message
                client.send(`{ "message" : ${message} }`);
            });
        });
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
}

module.exports.MyServer = MyServer