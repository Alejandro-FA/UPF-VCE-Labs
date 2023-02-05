class MyApp {
    // Menu bar buttons
    privateMsgMenuButton = document.getElementById("private_messages_button");
    roomsMenuButton = document.getElementById("rooms_button");
    canvasMenuButton = document.getElementById("canvas_button");

    // Applications
    chatDiv = document.getElementById("mychat");
    canvasDiv = document.getElementById("mycanvas");


    constructor() {
        // Hide canvas by default
        hide(this.canvasDiv);

        // Create applications
        this.chat = new MyChat();
        this.canvas = new MyCanvas();
        this.chat.init();

        // Add event listeners
        this.privateMsgMenuButton.addEventListener("click", this.onSelectPMessages);
        this.roomsMenuButton.addEventListener("click", this.onSelectRooms);
        this.canvasMenuButton.addEventListener("click", this.onSelectCanvas);
    }


    onSelectPMessages = () => {
        // TODO:
    }


    onSelectRooms = () => {
        show(this.chatDiv);
        hide(this.canvasDiv);
        // TODO: Add a color indicator to the button
    }


    onSelectCanvas = () => {
        show(this.canvasDiv);
        hide(this.chatDiv);
        // TODO: Add a color indicator to the button
    }
}


function hide(htmlElem) {
    if (htmlElem.style.display !== "none") {
        htmlElem.dataset.display = htmlElem.style.display;
        htmlElem.style.display = "none";
    }
}


function show(htmlElem) {
    if (htmlElem.style.display === "none") {
        htmlElem.style.display = htmlElem.dataset.display || "";
        delete htmlElem.dataset.display;
    }
}