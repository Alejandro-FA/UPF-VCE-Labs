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