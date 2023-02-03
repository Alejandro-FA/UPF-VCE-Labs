class MyChat {
    inputBox = document.querySelector("input#write_message");
    sendButton = document.querySelector("button#send_message");
    conversation = document.querySelector("#grid_conversation");
    dialog = document.querySelector("#welcome_dialog");
    dialogForm = document.querySelector("#dialog_form");
    connectNotification = document.querySelector("#connecting_server");
    newChannelBox = document.querySelector("input#write_new_channel");
    openChannels = document.querySelector("#channel_selection");

    factory = new HtmlFactory();
    server = new SillyClient();

    username;
    userID;
    channelSelected;
    msgLog = {
        type: "history",
        content: [],
    };

    init() {
        // Display pop-up to select username and channel
        this.dialog.showModal();
        this.dialog.addEventListener("cancel", e => e.preventDefault());
        this.dialogForm.addEventListener("submit", this.onFormSubmitted);

        // Initialize server events listeners
        this.server.on_ready = this.onServerReady;
        this.server.on_close = this.onServerClosed;
        this.server.on_message = this.onReceiveMessage;
        this.server.on_user_connected = this.onUserConnected;
        this.server.on_user_disconnected = this.onUserDisconnected;
    }

    onFormSubmitted = () => {
        this.username = this.dialogForm["name"].value.trim();
        this.username = this.username.replaceAll(/\s\s+/g, " "); // Multiple whitespaces are changed to just 1
        let channelSelected = this.dialogForm["channel"].value.trim();
        channelSelected = channelSelected.replaceAll(/\s\s+/g, " ");

        // Connect to server once we know to which channel we want to connect to
        this.connectToServer(channelSelected);
    }

    onServerReady = (id) => {
        // From this point on it is possible to send messages
        this.userID = Number(id);
        this.connectNotification.close();
        this.sendButton.removeAttribute("disabled");
        this.inputBox.removeAttribute("disabled");
        this.sendButton.addEventListener("click", this.onSendMessage);
        this.inputBox.addEventListener("keydown", this.onSendMessage);
        this.newChannelBox.addEventListener("keydown", this.onNewChannel);

        this.server.getReport(this.onReportReady);
    }

    onServerClosed = () => {
        this.connectNotification.innerHTML = "Connection lost. Trying to reconnect...";
        // TODO: Try to reconnect
        // this.connectToServer(); // FIXME: This does not work (it attempts to connect to the server before selecting channel).
    }

    onReportReady = (report) => {
        this.showRooms(report.rooms);
        for (let roomBox of this.openChannels.children) {
            roomBox.addEventListener("click", this.onChannelClicked);
        }
    }

    onChannelClicked = (event) => {
        this.connectToServer(event.target.innerHTML);        
    }

    onReceiveMessage = (author_id, msg) => {
        msg = Message.fromJSON(msg);

        switch (msg.type) {
            case "text":
                this.showMessage(msg);
                this.msgLog.content.push(msg);
                break;

            case "history":
                this.msgLog = msg;
                for (let m of msg.content) {
                    this.showMessage(m);
                }
        
            default:
                break;
        }
    }

    onSendMessage = (event) => {
        if (event.type === "keydown" && event.key != "Enter") return;

        // Empty messages (or with only whitespaces) cannot be sent
        let inputText = this.inputBox.value.trim();
        if (!inputText) return;

        let msg = new Message({
            username: this.username,
            content: inputText,
            type: "text",
        });

        this.showMessage(msg);
        this.msgLog.content.push(msg);
        this.sendMessage(msg);
    }

    onNewChannel = (event) => {
        if (event.type === "keydown" && event.key != "Enter") return;

        // Empty channels (or with only whitespaces) cannot be created
        let inputText = this.newChannelBox.value.trim();
        if (!inputText) return;

        this.newChannelBox.value = "";
        this.connectToServer(inputText); // Connect to created channel
    }

    onUserConnected = (user_id) => {
        this.server.getRoomInfo(this.channelSelected, room_info => {
            let lowestID = Math.min(...(room_info.clients));
            if (lowestID === this.userID) {
                this.sendMessage(this.msgLog, user_id);
            }
        });
    }

    onUserDisconnected = (user_id) => {
        //TODO:
    }

    connectToServer(channelName) {
        // Display channel selected
        this.channelSelected = channelName;
        document.querySelector("#channel_selected").innerHTML = channelName;

        // Delete current conversation and open channels sidebar
        this.openChannels.replaceChildren();
        this.conversation.replaceChildren();

        // Connect to server
        this.connectNotification.showModal();
        this.server.close();
        this.server.connect("wss://ecv-etic.upf.edu/node/9000/ws", channelName);
    }

    sendMessage(msg, userID) {
        this.server.sendMessage(JSON.stringify(msg), userID);
    }

    showMessage(msg) {
        // Create HTML element for message
        let msgBox = this.factory.createMessage(msg);
        msgBox.classList.add(this.username === msg.username ? "me" : "other");

        // Add message to conversation and clear input
        this.conversation.appendChild(msgBox);
        this.conversation.scrollTop = this.conversation.scrollHeight;
        this.inputBox.value = "";
    }

    showRooms(rooms) {
        for (let r in rooms) {
            let roomBox = this.factory.createRoomSelector(r);
            this.openChannels.appendChild(roomBox);
        }
    }
}

class Message {
    constructor({username, content, type = 'text', date = new Date()}) {
        this.username = username;
        this.content = content;
        this.type = type;
        this.date = new Date(date); // If date is string, convert it to date
    }

    static asHistory(msg) {
        const content = [];
        for (let m of msg.content) {
            content.push(new Message(m));
        }
        return {
            type: msg.type,
            content: content,
        };
    }

    static fromJSON(msg) {
        msg = JSON.parse(msg);
        switch (msg.type) {
            case "history":
                return Message.asHistory(msg);
            default:
                return new Message(msg);
        }
    }
}

