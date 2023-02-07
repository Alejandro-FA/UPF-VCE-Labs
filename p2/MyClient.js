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
            let message = JSON.parse(msg.data)
            this.manageServerMessage(message)
        }

    }

    manageServerMessage( message ) {
        //TODO: manage different server events

        switch (message.type) {
            case "ID":
                console.log("ID received");
                this.user_id = message.userID
                this.clients[this.user_id] = {id: this.user_id, name: this.user_name}

                if(this.on_ready){
                    this.on_ready()
                }
                break;
        
            case "LOGIN":
                if(!this.clients[ message.userID ]) {
                    this.clients[ message.userID ] = { id: message.userID, name: this.user_name };
                    this.num_clients += 1;
                }

                if(message.content != this.user_id){
                    console.log("User connected");
                    if (this.on_user_connected) {
                        this.on_user_connected(message.userID)
                    }
                }
                break;

            default:
                break;
        }
    }
}

let client = new MyClient()

client.connect("hello", "world")