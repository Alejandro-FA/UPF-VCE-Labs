//This module has to substitute the SillyClient module we were given


class MyClient 
{
    socket = null
    is_connected = null
    room = { name:"", clients:{} }
    clients = {}
    num_clients = 0

    user_id = 0
    user_name = "Default"

    //Callbacks
    on_connect = null; //when connected
	on_ready = null; //when we have an ID from the server
	on_message = null; //when somebody sends a message
	on_close = null; //when the server closes
	on_user_connected = null; //new user connected
	on_user_disconnected = null; //user leaves
	on_error = null; //when cannot connect
	on_world_info = null; //when a user moves

    /**
     * Connect to the server
     * @param user_name
     */
    connect(user_name) {

        user_name = user_name || "Default"
        this.user_name = user_name

        if (this.socket){
            this.socket.close()
        }

        //let url = `wss://ecv-etic.upf.edu/node/9017/ws/`
        let url = `ws://localhost:9017?username=${user_name}`
        //let url = `ws://localhost:5500/${room_name}?username=${user_name}&password=${password}`
        this.socket = new WebSocket(url)

        this.socket.onopen = () => {

            this.clients = {}
            if(!this.room ){
                this.room = {name: "", clients: []}
            }
            this.is_connected = true

        }

        //Configure the onclose callback
        let that = this
        this.socket.onclose = function () {

            console.log("Socket closed")
            if(that.socket !== this){
                return
            }

            that.is_connected = false
            that.socket = null
            that.room = { name:"", clients:{} }
        }

        //Configure the onmessage callback
        this.socket.onmessage = (msg) => {
            this.manageServerMessage(msg)
        }

    }

    /**
     * Manages all the messages coming from the server
     * @param message
     */
    manageServerMessage( message ) {
        message = JSON.parse(message.data)
        switch (message.type) {
            case "ID":
                this.user_id = message.userID
                this.clients[this.user_id] = {id: this.user_id, name: this.user_name}

                if(this.on_ready){
                    this.on_ready(this.user_id, this.user_name)
                }
                break;

            case "LOGIN":
                
                if(!this.clients[ message.userID ]) {
                    this.clients[ message.userID ] = { id: message.userID, name: message.user_name };
                    this.room.clients[ message.userID ] = { id: message.userID, name: this.user_name }
                    this.num_clients += 1;
                }
                
                if(message.userID !== this.user_id){
                    if (this.on_user_connected) {
                        this.on_user_connected(message.username)
                    }
                    if(this.on_world_info) {
                        this.on_world_info(JSON.stringify(message))
                    }
                }

                break;

            case "LOGINERROR":

                alert(message.content)

                this.socket.close()

                break;

            case "LOGOUT":
                delete this.clients[ message.userID ];
                delete this.room.clients[ message.userID ];
                this.num_clients -= 1;
                if (this.on_user_disconnected) {
                    this.on_user_disconnected(message.userID, message.username)
                }
                if(this.on_world_info) {
                    this.on_world_info(JSON.stringify(message))
                }
                
                break;

            case "ROOM":
                this.clients = message.clients
                this.num_clients = message.length

                if (this.on_connect){
                    this.on_connect()
                }

                let user_name = MYCHAT.user_name
                this.room.name = message.name
                WORLD = new MyWorld(this.room.name, user_name);

                //Initiate the rendering of the World - TODO: change so that it uses the info queried from the database
                init(user_name, "view/data/Room Spain.glb", "girl", [-40, 0, 0]);
                break;

            case "MOVE": 
                if(message.userID !== this.user_id){
                    if(this.on_world_info){
                        this.on_world_info(JSON.stringify(message))
                    }
                }
                break;
            case "WORLD":
                if(message.userID !== this.user_id){
                    if(this.on_world_info){
                        this.on_world_info(JSON.stringify(message))
                    }
                }
                break;

            case "SKIN":
                if(message.userID !== this.user_id){
                    if(this.on_world_info){
                        this.on_world_info(JSON.stringify(message))
                    }
                }
                break;

            case "SONG":
                if(message.userID !== this.user_id){
                    if(this.on_world_info){
                        this.on_world_info(JSON.stringify(message))
                    }
                }
                break;

            case "SING":
                if(message.userID !== this.user_id){
                    if(this.on_world_info){
                        this.on_world_info(JSON.stringify(message))
                    }
                }
                break;

            default:

                if(message.userID !== this.user_id){
                    if(this.on_message){
                        this.on_message(JSON.stringify(message))
                    }
                }
                break;

        }
    }

    /**
     * Sends a JSON message to everyone or just the specified targets
     * @param message
     * @param targets
     */
    sendMessage(message, targets){
        if (!message){
            console.error("Message not defined");
            return
        }

        if(targets){
            //If we have targets we want to add them to the message
            message["targets"] = targets
        }
        this.socket.send(JSON.stringify(message))
    }

}
