const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const http = require('http');
const fs = require('fs');
const WebSocketServer = require('websocket').server;



//---------------INITIALIZATIONS ---------------
const app = express();

//initialize a simple http server
const server = http.createServer( app );

//initialize the WebSocket server instance
const wss = new WebSocketServer({ httpServer: server });


//initialize DB
require('./database');


//Get MongoDB Models
const User = require('./models/User');
const Room = require('./models/Room');
const Song = require('./models/Song');
const Globals = require('./models/Globals');


//passport functionalities
require('./config/passport');
const url = require("url");
const qs = require("querystring");


//Globals for our server (using MongoDB): Information to be stored for websocket server
const GLOBALS = new Globals();





//--------------SAVE WORLD.JSON DATA INTO MONGODB / THE SERVER--------------

//Get info from jsonFile
const jsonFile = JSON.parse(fs.readFileSync("./src/world.json", "utf8"))
GLOBALS.chargeWorldJson(jsonFile);


//--------------WEBSOCKET CALLBACKS--------------

wss.on("request", on_connection);

/**
 * Callback that handles connections
 * @param req
 */
async function on_connection(req) {
    let ws = req.accept();

    let path = url.parse(req.resource)
    let user_name = qs.parse(path.query).username
    get_new_id(ws);

    //Retrieve the user from the database according to their unique username
    let user = await User.findOne({username: user_name});
    GLOBALS.users.push(user);
    let userInfo = user.getUserInfo();
    
    ws.room = user.room;
    ws.username = user_name;

    let currentRoom = GLOBALS.findRoomByName(ws.room);

    //Add the new client
    if(!currentRoom){
        //In case of any break, Spanish room is the secure one
        ws.room = "Spanish"; //Default room
        currentRoom = GLOBALS.findRoomByName(ws.room);
    }

    //Guardamos la conexión ws del user:
    GLOBALS.findRoomByName(ws.room).clients.push(ws);
    GLOBALS.clients.push(ws);
    
    //Fill clientsObject
    for (let client of currentRoom.clients) {
        GLOBALS.addClientObject(client.id, client.username);
    }

    //Retrieve the information of the World: Rooms and their songs
    let worldInfo = GLOBALS.generateWorldInfo(userInfo);

    //Generate the first message in order to send the WorldInfo to the new user
    let room = {
        type: "ROOM",
        name: ws.room,
        clients: GLOBALS.clientObjectListToDict(),
        length: GLOBALS.clients_obj.length,
        userInfo: userInfo,
        content: worldInfo,
        url: currentRoom.url
    }

    sendToRoom(ws.room, JSON.stringify(room), ws.id)


    //Tell everyone that a user has connected
    let msg = {
        userID: ws.id,
        username: user_name,
        type: "LOGIN",
        content: userInfo,
        date: new Date()
    }

    sendToRoom(ws.room, JSON.stringify(msg))

    //Configure on message callback
    ws.on('message', on_message_received);

    //Configure on close and on error callback

    let connection_close = async () => {

        //Get currentRoom and check if exists
        let room = GLOBALS.findRoomByName(ws.room);
        if(!room) {
            return
        }

        //Save user data
        let user = GLOBALS.usernameToUser(ws.username);
        if(!user){
            return;
        }
        user.target = user.position;
        await user.save().then((data)=>{}).catch((error)=>{});

        //Delete client from... (using index)
        room.clients.splice(room.clients.indexOf(ws), 1) //Room.clients array
        GLOBALS.clients.splice(GLOBALS.clients.indexOf(ws), 1) //Global Clients array
        GLOBALS.users.splice(GLOBALS.users.indexOf(user), 1);

        //Send logout message to all the clients
        let msg = {
            userID: ws.id,
            username: user_name,
            type: "LOGOUT",
            content: "",
            date: new Date()
        }

        sendToRoom(ws.room, JSON.stringify(msg));
        let client_obj = GLOBALS.findClientObjectByUsername(user_name);
        GLOBALS.clients_obj.splice(GLOBALS.clients_obj.indexOf(client_obj), 1)

    }

    ws.on("close", connection_close)
    ws.on("error", connection_close)
}

/**
 * Given a ws, generate a new ID and send it to the user
 * @param ws
 * @return {int}
 */
function get_new_id(ws) {
    ws.id = GLOBALS.lastID;
    GLOBALS.lastID++;

    let msg = {
        userID: ws.id,
        content: "",
        type: "ID",
        date: new Date()
    }
    ws.send(JSON.stringify(msg))
    return ws.id
}

/**
 * Create a new room
 * @param room_name
 */
function createRoom(room_name) {
    let room = new Room();
    room.name = room_name;
    GLOBALS.rooms.push(room);
}

/**
 * //Helper function that broadcasts a message to all the clients of a room (or to the targeted ID's)
 * @param room_name
 * @param msg
 * @param target
 */
function sendToRoom(room_name, msg, target) {

    if ( msg === undefined){
        return
    }
    let room = GLOBALS.findRoomByName(room_name);
    if ( !room ){
        return
    }

    for(let client of room.clients){
        let type = JSON.parse(msg).type

        if (target && client.id !== target) {
            continue
        }
        if(!client.connected){
            continue;
        }
       
        client.send(msg)
    }
}

/**
 * Message received
 * @param message
 */
 function on_message_received(message) {
    let msg = JSON.parse(message.utf8Data)

    //If user wants to change the room
    if (msg.type === "CHANGE-ROOM") {
        let username = msg.user
        let ws = GLOBALS.usernameToClient(username);
        
        //Delete user from past room
        let room = GLOBALS.findRoomByName(ws.room);
        let index = room.clients.indexOf(ws)
        room.clients.splice(index, 1)

        //Send logout message to the room it comes from
        let message = {
            userID: ws.id,
            username: username,
            type: "LOGOUT",
            content: "",
            date: new Date()
        }

        sendToRoom(ws.room, JSON.stringify(message));

        //Get new room name
        ws.room = msg.room

        //Send login message to the new room
        let user = GLOBALS.usernameToUser(username)
        let userInfo = user.getUserInfo();
        message = {
            userID: ws.id,
            username: username,
            type: "LOGIN",
            content: userInfo,
            date: new Date()
        }

        sendToRoom(ws.room, JSON.stringify(message))

        //Add user to the new room
        GLOBALS.findRoomByName(ws.room).clients.push(ws);

        //update user data with NEW room
        GLOBALS.usernameToUser(msg.user).room = ws.room;
    }

    //If the user changes their skin
    if(msg.type === "SKIN") {
        let user = GLOBALS.usernameToUser(msg.user);
        if(user) {
            //Update user character
            user.character = msg.content;
        }
    }

    //If user moves
    if (msg.type === "MOVE") {
        let user = GLOBALS.usernameToUser(msg.username);
        if(user) {
            //Update user world info 
            let userInfo = msg.content;
            user.room = msg.room;
            user.saveUserData(userInfo)
        }
    }

    //RAQUEL: SAVE_USER_DATA NO LLEGA NUNCA :(
    if (msg.type === "SAVE_USER_DATA") {
        let user = GLOBALS.usernameToUser(msg.username);
        if(user) {
            let userInfo = msg.content;
            //Set position == target
            userInfo.position = userInfo.target;

            //Save user room
            user.room = msg.room;

            //Update user from GLOBALS.users[
            user.saveUserData(userInfo);
        }
    }

    sendToRoom(msg.room, JSON.stringify(msg), msg.targets)
}






//--------------- SETTINGS ---------------

//port
app.set('port', 9017); //Tomar port 9017

//paths (usamos path.join porque según el OS el path cambia! Y así estandarizamos)
app.set('views', path.join(__dirname, 'views'));
app.set('routes', path.join(__dirname, 'routes'));

//engine con propiedades 
app.engine('.hbs', exphbs.engine({
    defaultLayout: 'main', //plantilla con diseño principal
    layoutsDir: path.join(app.get('views'), 'layouts'), //dir del folder donde estarán los layouts
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs' //la extensión de los files para NO TENER QUE ESCRIBIRLA en cada momento
}));
app.set('view engine', '.hbs'); //para poder usar el engine de las vistas






//--------------- MIDDLEWARES ---------------
//Todas las funciones que serán ejecutadas antes de que lleguen al server, 
//o antes que pasárselo a las rutas

//formularios
app.use(express.urlencoded({extended:false})); //poder usar formularios (extended:false pq no queremos imgs, solo txt)

//formularios: pueden usar otros métodos
app.use(methodOverride('_method'));

//sesiones de express con settings / propiedades
app.use(session({
    secret: 'mysecretchat',
    resave: true,
    saveUninitialized: true
}));

//passport
app.use(passport.initialize());
app.use(passport.session());

//para req.flash
app.use(flash());





//--------------- GLOBAL VARIABLES ---------------
//Datos que queremos que toda nuestra app tenga accesible
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error'); //passport flash errors
    res.locals.user = req.user || null;

    next();
});





//--------------- ROUTES ---------------
//Paths funcionales en cualquier OS
app.use(require(path.join(app.get('routes'), 'index')));
app.use(require(path.join(app.get('routes'), 'users')));
app.use(require(path.join(app.get('routes'), 'notes')));
app.use(require(path.join(app.get('routes'), 'canvas')));




//--------------- STATIC FILES ---------------
//Donde estará la carpeta de archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'client')));





module.exports = {server, app};