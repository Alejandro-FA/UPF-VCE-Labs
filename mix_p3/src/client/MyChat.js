//MYCHAT object
const MYCHAT = {

    //Current instance of MyClient
    server: undefined,

    currentChat: "Spanish",

    user_name: "anonymous",

    password: "undefined",

    //Initial code to be run when loading the Script
    init: function () {
        this.server = new MyClient();
        this.configureServer();

        this.configureEventListeners();
    },

    //This function sets all the event listeners
    configureEventListeners: function () {
        let input = document.getElementById("message-input")

        input.addEventListener("keydown", (e) => {
            if(e.code === "Enter") {
                let message = input.value
                this.sendMessage(this.user_name, message)
            }
        })
    },

    //Configure all the server callbacks
    configureServer: function () {
        this.server.on_connect = this.on_connect.bind(this);
        this.server.on_ready = this.on_ready.bind(this);
        this.server.on_message = this.on_message.bind(this);
        this.server.on_user_connected = this.on_user_connected.bind(this);
        this.server.on_user_disconnected = this.on_user_disconnected.bind(this);
        this.server.on_close = this.on_close.bind(this);
        this.server.on_error = this.on_error.bind(this);
    },

    //Connect for the first time (from the connection screen)
    firstConnection: function (username) {
        this.user_name = username;
        return this.connection(this.user_name);
    },

    //Given a username, connects to the server
    connection: function (user_name) {
        this.server.user = user_name;

        if (user_name === "") {
            alert("Empty user name");
            return false;
        }

        this.server.connect(user_name);

        return true;
    },

    //Send the message and make it appear on the chat
    sendMessage: function (sender, message) {
        if (message === "") {
            return;
        }

        let room = this.server.room.name;

        let msg = {
            room: room,
            type: "text",
            user: sender,
            avatar: this.avatar,
            content: message,
            userID: this.server.user_id
        };

        this.server.sendMessage(msg);

        this.displayMessage(sender, message);

        document.getElementById("message-input").value = "";
    },

    //Display the message that has been sent
    displayMessage: function (sender, message) {
        let chat = document.querySelector(".mychat .message-space");
        let elem = document.createElement("div");

        elem.className = "message-container";

        let elem2 = document.createElement("div");
        elem2.classList.add("message");

        let user = this.server.user === sender ? "me" : "it";

        elem.classList.add(user);

        let userName = document.createElement("div");
        userName.classList.add("sender");
        userName.innerHTML = sender

        let content = document.createElement("div");
        content.classList.add("content");
        content.innerHTML = message;

        elem2.appendChild(userName);
        elem2.appendChild(content);

        elem.appendChild(elem2);
        chat.appendChild(elem);

        chat.scrollTop = 10000;
    },

    //Returns a function that changes to the chat which ID is passed
    changeChat: function (chatName) {

        MYCHAT.currentChat = chatName;

        let main = document.querySelector(".mychat .message-space");
        main.innerHTML = "";

        if (MYCHAT.server.room.name !== chatName) {
            MYCHAT.connection(chatName, MYCHAT.server.user, this.password);
        }

    },

    //Send a system message
    systemMessage: function (message) {
        let chat = document.querySelector(".mychat .message-space");
        let elem = document.createElement("div");

        elem.classList.add("message");

        elem.classList.add("system");
        elem.innerHTML = message;

        chat.appendChild(elem);

        chat.scrollTop = 10000;
    },
    /****server connection code ****/

    //this method is called when the server gives the user his ID (ready to start transmiting)
    on_connect: function () {

        this.systemMessage(
          `Entered the ${this.currentChat} room`
        );

    },

    //this method is called when we receive the info about the current state of the room (clients connected)
    on_ready: function (id, user_name) {
        //user has an ID
        console.log(`Your ID is ${id} and username is ${user_name}`);
        this.server.user_id = id
    },

    //this method receives messages from other users (author_id is a unique identifier per user)
    on_message: function (msg) {
        //data received

        let message = JSON.parse(msg);
        console.log(message)

        let type = message.type;

        if (message.room === this.server.room.name) {
            switch (type) {
                case "text":
                    this.displayMessage(message.user, message.content);
                    break;
            }
        }
    },

    //this method is called when a new user is connected
    on_user_connected: function (user_name) {
        //new user!
        this.systemMessage(`${user_name} has entered the room`);
    },

    //this method is called when a user leaves the room
    on_user_disconnected: function (user_name) {
        //user is gone
        this.systemMessage(`${user_name} has left the room`)
    },

    //this method is called when the server gets closed (it shutdowns)
    on_close: function () {
        //server closed
        console.log("server closed");
    },

    //this method is called when couldn't connect to the server
    on_error: function (err) {
        console.log("Couldn't connect to the server");
    },

    /**
     * Method that shows the chat
     */
    show: function () {
        let chat = document.querySelector(".mychat");
        chat.style.display = "flex"
    },

    /**
     * Method that hides the chat
     */
    hide: function () {
        let chat = document.querySelector(".mychat");
        chat.style.display = "none"
    },

};
