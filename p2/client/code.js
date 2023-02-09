//MYCHAT object
const MYCHAT = {
  //Room prefix so that only users of this chat can communicate
  ROOM_PREFIX: "ACEITE_DE_IGUANA_",

  //Current instance of SillyClient
  server: undefined,

  //Variable that will indicate which avatar is selected (default 1)
  avatar: 1,

  //Variable to keep track of wich is the current chat
  currentChat: 0,

  //Variable to keep track of how many chats there are
  n_chats: 1,

  //Object where the history of the visited chats will be stored
  history: {},

  //Boolean variable that will be used to know if the current chat is private or not
  private: false,

  //History that will be stored locally
  privateHistory: {},

  user_name: "anonymous",

  id_user: {},

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

    document.querySelector(".mychat li").onclick = this.changeChat(0);

    //Event listener for the avatar selection
    let avatars = document.querySelectorAll(".mychat .avatar");
    avatars.forEach((elem) => {
      elem.addEventListener("click", (event) => {
        console.log(event);
        this.selectAvatar(event.target);
      });
    });

    //Event listener of the input for new rooms
    elem = document.getElementById("new-room");
    elem.addEventListener("keydown", (event) => {
      if (event.code == "Enter") {
        this.connectNewChat();
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
  firstConnection: function () {
    let room_name = document.getElementById("Room").value;
    let user_name = document.getElementById("User").value;

    this.user_name = user_name;

    if (this.connection(room_name, user_name)) {
      let conScreen = document.querySelector(".mychat .connecting");
      let msgScreen = document.querySelector(".mychat .chatting");

      conScreen.style.display = "none";
      msgScreen.style.display = "grid";

      room_name = this.ROOM_PREFIX + room_name;

      this.history[room_name] = {
        room: room_name,
        type: "history",
        content: [],
				user: this.user_name,
				id: this.server.user_id
      };
    }
  },

  //Given a room name and a user name, connects to the server
  connection: function (room_name, user_name) {
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
    room_name = this.ROOM_PREFIX + room_name;
    this.server.connect(room_name, user_name);

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
    let currentChat = document.getElementById(`${this.currentChat}`);
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
  changeChat: function (chatID) {
    return function () {
      console.log(`Current chat is ${chatID}`);
      let chat = document.getElementById(`${chatID}`);
      let oldChat = document.querySelector(".mychat li.selected");
      let chatName = chat.querySelector(".mychat .chat-name").innerHTML;

      oldChat.classList.remove("selected");
      chat.classList.add("selected");

      MYCHAT.currentChat = Number(chat.id);

      document.querySelector(".mychat .chat-title").innerHTML = chatName;

      let main = document.querySelector(".mychat main");
      main.innerHTML = "";

      let c = chatName.charAt(0);

      if (c != "_") {
        if (MYCHAT.server.room.name != MYCHAT.ROOM_PREFIX + chatName) {
          MYCHAT.connection(chatName, MYCHAT.server.user);
        }

				MYCHAT.private = false;

        MYCHAT.history[MYCHAT.ROOM_PREFIX + chatName].content.forEach(
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

  //Creates a new Sillyclient for a new room
  connectNewChat: function () {
    let chatName = document.getElementById("new-room").value;
    document.getElementById("new-room").value = "";

    if (chatName == "") {
      alert("Room name needed");
      return;
    }

    let id = this.n_chats;
    this.n_chats += 1;
    let c = chatName.charAt(0);
    if (c === "_") {
      this.privateChat(id, chatName);
    } else {
      this.createNewChat(id, chatName);
    }

    chatName = this.ROOM_PREFIX + chatName;
    console.log(chatName);
    this.history[chatName] = {
      room: chatName,
      type: "history",
      content: [],
			user: this.user_name,
			id: this.server.user_id
    };

    document.getElementById(`${id}`).onclick = this.changeChat(id).bind(MYCHAT);

    this.changeChat(id).call(this);
  },

  //Create a new private chat
  privateChat: function (id, chatName) {
    this.createNewChat(id, chatName);
    this.privateHistory[chatName] = [];
    let clients = this.server.clients;

    let userID = chatName.slice(1);
    if (userID in clients) {
      console.log("I am private");
    }
  },

  //Create the HTML element with all the attributes
  createNewChat: function (id, chatName) {
    let nav = document.querySelector(".mychat nav");

    let li = document.createElement("li");
    li.id = id;
    li.className = "chat selected";
    li = nav.appendChild(li);
    console.log(li);

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
      `Connected to the server at room ${this.server.room.name}`
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
    console.log(`User ${author_id} has sent the message ${msg}`);

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
    this.systemMessage(`${user_name}#${user_id} has landed on the server`);

    if (this.server.user_id === Number(Object.keys(this.server.clients)[0])) {
			let history = this.history[this.server.room.name]
			history.userID = this.server.user_id
      this.server.sendMessage(history, user_id);
      console.log("Message sent");
    }
  },

  //this methods is called when a user leaves the room
  on_user_disconnected: function (user_id, user_name) {
    //user is gone

		this.systemMessage(`${user_name}#${user_id} has left the server`)
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
    }
    this.avatar = Number(id);
  },
};
