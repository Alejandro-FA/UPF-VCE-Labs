class HtmlFactory {
    createMessage(msg) {
        // User that sent the message
        const user = document.createElement("p");
        user.innerHTML = msg.username;
        user.classList.add("user");

        // Time of the message
        const time = document.createElement("p");
        time.innerHTML = this.formatDate(msg.date);
        time.classList.add("time");

        // Header of the message
        const header = document.createElement("div");
        header.classList.add("header", "flex_row");
        header.append(user, time);

        // Text of the message
        const content = document.createElement("p");
        content.innerHTML = msg.content;
        content.classList.add("content");

        // Message container
        const msgBox = document.createElement("div");
        msgBox.classList.add("message");
        msgBox.append(header, content);

        return msgBox;
    }

    createRoomSelector(roomName) {
        // Room name
        const channelSelector = document.createElement("button");
        channelSelector.innerHTML = roomName;
        channelSelector.classList.add("room_name")
        return channelSelector;
    }

    formatDate(date) {
        const options = {
            hour12: false,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        }

        return date.toLocaleString(undefined, options);
    }
}