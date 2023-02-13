//MYCHAT object
const MYCHAT = {

  //Current instance of MyClient
  server: undefined,

  //Variable that will indicate which avatar is selected (default 1)
  avatar: 1,

  //Variable to keep track of wich is the current chat
  currentChat: "living_room",

  //Variable to keep track of how many chats there are
  n_chats: 1,

  //Object where the history of the visited chats will be stored
  history: {},

  //Boolean variable that will be used to know if the current chat is private or not
  private: false,

  //History that will be stored locally
  privateHistory: {},

  user_name: "anonymous",

  //Visited chats

  visited_chats: [],

  id_user: {},

  password: "undefined",

  //Initial code to be run when loading the Script
  init: function () {
    this.server = new MyClient();
    this.configureServer();

    this.configureEventListeners();
  },

  //This function sets all the event listeners
  configureEventListeners: function () {
    //Event listener for sending messages
    let elem = document.getElementById("message");
    elem.addEventListener("keydown", (event) => {
      if (event.code == "Enter") {
        let message = document.getElementById("message").value;
        this.sendMessage(this.server.user, message);
      }
    });

    //document.querySelector(".mychat li").onclick = this.changeChat(0);

    //Event listener for the avatar selection
    let avatars = document.querySelectorAll(".mychat .avatar");
    avatars.forEach((elem) => {
      elem.addEventListener("click", (event) => {
        this.selectAvatar(event.target);
      });
    });

    //Event listener of the input for new rooms
    elem = document.getElementById("new-room");
    elem.addEventListener("keydown", (event) => {
      if (event.code == "Enter") {
        let chatName = document.getElementById("new-room").value;
        this.connectNewChat(chatName);
      }
    });
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
  firstConnection: function (username, roomname, password) {
    password = password || document.getElementById("Password").value;
    let user_name = username || document.getElementById("User").value;

    this.password = password

    this.user_name = user_name;

    this.visited_chats.push(roomname)

    if (this.connection(roomname, user_name, this.password)) {
    
      this.history[roomname] = {
        room: roomname,
        type: "history",
        content: [],
				user: this.user_name,
				id: this.server.user_id
      };
    }
  },

  //Given a room name and a user name, connects to the server
  connection: function (room_name, user_name, password) {
    this.server.user = user_name;

    let chatTitle = document.querySelector(".mychat .chat-title");
    let chatName = document.querySelector(".mychat .selected .chat-name");

    chatTitle.innerHTML = room_name;
    chatName.innerHTML = room_name;
    this.server.room.name = room_name;

    if (room_name == "") {
      alert("Empty room name");
      return false;
    }
    if (user_name == "") {
      alert("Empty user name");
      return false;
    }

    this.server.connect(room_name, user_name, password);

    return true;
  },

  //Send the message and make it appear on the chat
  sendMessage: function (sender, message) {
    if (message == "") {
      return;
    }

    let room = this.server.room.name;

    if (!this.private) {
      let msg = {
        room: room,
        type: "text",
        user: sender,
        avatar: this.avatar,
        content: message,
				userID: this.server.user_id
      };

      this.history[room].content.push(msg);

      this.server.sendMessage(msg);

      this.displayMessage(sender, message, this.avatar, false, this.server.user_id);

      document.getElementById("message").value = "";
    } else {
      let chatName = document.querySelector(".mychat .chat-title").innerHTML;

      this.privateHistory[chatName].push({
        room: room,
        type: "text",
        user: sender,
        avatar: this.avatar,
        content: message,
      });

      document.getElementById("message").value = "";

      this.displayMessage(sender, message, this.avatar, false, this.server.user_id);

      let clients = this.server.clients;
      let userID = chatName.slice(1);
      if (userID in clients) {
        let msg = {
          room: room,
          type: "private",
          user: sender,
          avatar: this.avatar,
          content: message,
					id: this.server.user_id
        };
        this.server.sendMessage(msg, userID);
      }
    }
  },

  //Update the preview of the last message that there is under the name
  updatePreview: function (sender, message) {
    let currentChat = document.getElementById(this.currentChat);
    currentChat.querySelector(
      ".mychat .last-message"
    ).innerHTML = `${sender}: ${message}`;
  },

  //Display the message that has been sent
  displayMessage: function (sender, message, avatar, isPrivate, userID) {
    let chat = document.querySelector(".mychat main");
    let elem = document.createElement("div");

    elem.className = "message-container";

    let img = document.createElement("img");
    switch (avatar) {
      case 1:
        img.src = "img/Profile 1.png";
        break;
      case 2:
        img.src = "img/Profile 2.png";
        break;
      case 3:
        img.src = "img/Profile 3.png";
        break;
      case 4:
        img.src = "img/Profile 4.png";
        break;
    }

    elem.appendChild(img);
    let elem2 = document.createElement("div");
    elem2.classList.add("message");

    let user = this.server.user == sender ? "me" : "it";

    if (isPrivate) {
      elem2.classList.add("private");
    }

    elem.classList.add(user);

    let userName = document.createElement("div");
    userName.classList.add("sender");
    userName.innerHTML = sender + '#' + userID;

    let content = document.createElement("div");
    content.classList.add("content");
    content.innerHTML = message;

    elem2.appendChild(userName);
    elem2.appendChild(content);

    elem.appendChild(elem2);
    chat.appendChild(elem);

    this.updatePreview(sender, message);
    chat.scrollTop = 10000;
  },

  //Returns a function that changes to the chat which ID is passed
  changeChat: function (chatName) {
    return function () {

      let chat = document.getElementById(chatName);
      let oldChat = document.querySelector(".mychat li.selected");

      oldChat.classList.remove("selected");
      chat.classList.add("selected");

      MYCHAT.currentChat = chat.id;

      document.querySelector(".mychat .chat-title").innerHTML = chatName;

      let main = document.querySelector(".mychat main");
      main.innerHTML = "";

      let c = chatName.charAt(0);

      if (c != "_") {
        if (MYCHAT.server.room.name != chatName) {
          MYCHAT.connection(chatName, MYCHAT.server.user, this.password);
        }

				MYCHAT.private = false;

        MYCHAT.history[chatName].content.forEach(
          (elem) => {
            MYCHAT.displayMessage(elem.user, elem.content, elem.avatar,false, elem.userID);
          }
        );

      } else {
        MYCHAT.private = true;
        let history = MYCHAT.privateHistory[chatName];
        history.forEach((elem) => {
          MYCHAT.displayMessage(elem.user, elem.content, elem.avatar);
        });
      }
    };
  },

  //Creates a new Client for a new room
  connectNewChat: function (chatName) {

    if (chatName in this.visited_chats) {
      console.error("Room " + chatName + " already exists")
      return
    } else {
      this.visited_chats.push(chatName)
    }

    document.getElementById("new-room").value = "";

    if (chatName == "") {
      alert("Room name needed");
      return;
    }

    this.n_chats += 1;
    let c = chatName.charAt(0);
    if (c === "_") {
      this.privateChat(chatName);
    } else {
      this.createNewChat(chatName);
    }


    this.history[chatName] = {
      room: chatName,
      type: "history",
      content: [],
			user: this.user_name,
			id: this.server.user_id
    };

    let newchat = document.getElementById(chatName);
    //newchat.onclick = this.changeChat(chatName).bind(MYCHAT);

    this.changeChat(chatName).call(this);
  },

  //Create a new private chat
  privateChat: function (chatName) {
    this.createNewChat(chatName);
    this.privateHistory[chatName] = [];
    let clients = this.server.clients;

    let userID = chatName.slice(1);
    if (userID in clients) {
      console.log("I am private");
    }
  },

  //Create the HTML element with all the attributes
  createNewChat: function (chatName) {
    let nav = document.querySelector(".mychat nav");

    let li = document.createElement("li");
    li.id = chatName;
    li.className = "chat selected";
    li = nav.appendChild(li);


    let img = document.createElement("img");
    img.src = "img/group.svg";
    img.className = "room-icon";
    li.appendChild(img);

    let div = document.createElement("div");
    div.className = "chat-container";
    div = li.appendChild(div);

    let text1 = document.createElement("text");
    text1.className = "chat-name";
    text1.innerHTML = chatName;
    div.appendChild(text1);
    let text2 = document.createElement("text");
    text2.className = "last-message";
    text2.innerHTML = "No messages yet!";
    div.appendChild(text2);
  },

  //Send a system message that wont be stored on history
  systemMessage: function (message) {
    let chat = document.querySelector(".mychat main");
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
      `Entered the room ${this.server.room.name}`
    );
  },

  //this method is called when we receive the info about the current state of the room (clients connected)
  on_ready: function (id, user_name) {
    //user has an ID
    console.log(`Your ID is ${id} and username is ${user_name}`);
		this.server.user_id = id
  },

  //this methods receives messages from other users (author_id is an unique identifier per user)
  on_message: function (author_id, msg) {
    //data received

    let message = JSON.parse(msg);

    let type = message.type;

    if (message.room == this.server.room.name) {
      switch (type) {
        case "text":
          this.history[message.room].content.push(message);
          if (!this.private) {
            this.displayMessage(message.user, message.content, message.avatar, false, message.userID);
          }
          break;

        case "history":
          this.history[message.room].content = message.content;
          this.history[message.room].content.forEach((elem) => {
            this.displayMessage(elem.user, elem.content, elem.avatar, false, elem.userID);
          });

					this.id_user[message.userID] = message.user

          break;

        case "private":
          this.displayMessage(
            message.user,
            message.content,
            message.avatar,
            true
          );
          break;

      }
    }
  },

  //this methods is called when a new user is connected
  on_user_connected: function (user_id, user_name) {
    //new user!
    this.id_user[user_id] = user_name		
    this.systemMessage(`${user_name}#${user_id} has entered the room`);

    if (this.server.user_id === Number(Object.keys(this.server.clients)[0])) {
			let history = this.history[this.server.room.name]
			history.userID = this.server.user_id
      this.server.sendMessage(history, user_id);
    }
  },

  //this methods is called when a user leaves the room
  on_user_disconnected: function (user_id, user_name) {
    //user is gone

		this.systemMessage(`${user_name}#${user_id} has left the room`)
  },

  //this methods is called when the server gets closed (it shutdowns)
  on_close: function () {
    //server closed
    console.log("server closed");
  },

  //this method is called when coulndt connect to the server
  on_error: function (err) {
    console.log("Couldn't connect to the server");
  },

  //this methods changes the selected avatar when clicking on them
  selectAvatar: function (target) {
    let previousSelected = document.querySelector(".mychat .selected");
    previousSelected.classList.remove("selected");

    target.classList.add("selected");
    let id = 1;
    switch (target.id) {
      case "avatar1":
        id = 1;
        break;

      case "avatar2":
        id = 2;
        break;

      case "avatar3":
        id = 3;
        break;

      case "avatar4":
        id = 4
        break;
    }
    this.avatar = Number(id);
  },
};
