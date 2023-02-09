//This module has to substitute the SillyClient module we were given


class MyClient 
{
    socket = null
    is_connected = null
    room = { name:"", clients:[] }
    clients = {}
    num_clients = 0

    user_id = 0
    user_name = "Default"

    on_connect = null; //when connected
	on_ready = null; //when we have an ID from the server
	on_message = null; //when somebody sends a message
	on_close = null; //when the server closes
	on_user_connected = null; //new user connected
	on_user_disconnected = null; //user leaves
	on_error = null; //when cannot connect

    connect(room_name, user_name) {

        room_name = room_name || ""
        user_name = user_name || "Default"
        this.user_name = user_name

        if (this.socket){
            this.socket.close()
        }

        this.clients = {}

        let url = `ws://localhost:9016/${room_name}?username=${user_name}`
        this.socket = new WebSocket(url)

        this.socket.onopen = () => {
            this.is_connected = true
            this.room.name = room_name
            console.log("Socket opened succesfully");

            if (this.on_connect){
                this.on_connect()
            }
        }

        this.socket.onclose = () => {
            this.is_connected = false 

            if(this.on_close){
                this.on_close()
            }

            this.socket = null
            this.room = null
            console.log("Socket has been closed");
        }

        this.socket.onmessage = (msg) => {
            this.manageServerMessage(msg)
        }

    }

    manageServerMessage( message ) {
        //TODO: manage different server events

        message = JSON.parse(message.data)
        switch (message.type) {
            case "ID":
                console.log("ID received");
                this.user_id = message.userID
                this.clients[this.user_id] = {id: this.user_id, name: this.user_name}

                if(this.on_ready){
                    this.on_ready(this.user_id, this.user_name)
                }
                break;
        
            case "LOGIN":
                if(!this.clients[ message.userID ]) {
                    this.clients[ message.userID ] = { id: message.userID, name: this.user_name };
                    this.num_clients += 1;
                }

                if(message.userID != this.user_id){
                    console.log("User connected");
                    if (this.on_user_connected) {
                        this.on_user_connected(message.userID, message.username)
                    }
                }
                break;

            case "LOGOUT":
                //CHANGE: erase the logout user in the client
                if(!this.clients[ message.userID ]) {
                    this.clients[ message.userID ] = { id: message.userID, name: this.user_name };
                    this.num_clients += 1;
                }

                console.log("User disconnected");
                if (this.on_user_disconnected) {
                    this.on_user_disconnected(message.userID, message.username)
                }
                
                break;

            case "text":

                if(message.userID != this.user_id){
                    console.log("Message received!");
                    if(this.on_message){
                        this.on_message(message.userID, JSON.stringify(message))
                    }
                }
                break;

            default:
                break;
        }
    }

    //Sends a JSON message to everyone or just the specified targets
    sendMessage(message, targets){
        if (!message){
            console.log("Message not defined");
            return
        }

        if(targets){
            //If we have targets we want to add them to the message
            message["targets"] = targets
        }
        console.log(JSON.stringify(message));
        this.socket.send(JSON.stringify(message))
    }
}