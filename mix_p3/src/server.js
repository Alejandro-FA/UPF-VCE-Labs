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


//Information to be stored for websocket server
const clients = [];
const usernameToClient = {};
let lastID = 1;


//initialize DB
require('./database');


//Get MongoDB Models
const User = require('./models/User');
const Room = require('./models/Room');
const Globals = require('./models/Globals');


//passport functionalities
require('./config/passport');
const url = require("url");
const qs = require("querystring");


//Globals for our server (using MongoDB)
const GLOBALS = new Globals();





//--------------SAVE WORLD.JSON DATA INTO MONGODB--------------
//const rooms = JSON.parse(fs.readFileSync("./src/world.json", "utf8")) // TODO: Change path to where the Json file is
const jsonFile = JSON.parse(fs.readFileSync("./src/worldCopy.json", "utf8"))

//Get info from jsonFile
GLOBALS.chargeWorldJson(jsonFile);


//--------------WEBSOCKET CALLBACKS--------------

wss.on("request", on_connection);

/**
 * Callback that handles connections
 * @param req
 */
async function on_connection(req) {
    let ws = req.accept();
    console.log(req.user);

    let path = url.parse(req.resource)
    let user_name = qs.parse(path.query).username
    get_new_id(ws);

    //Retrieve the user from the database according to their unique username
    let user = await User.findOne({username: user_name});
    let userInfo = get_user_info(user_name);//RAQUEL: ANTIGUO, PERO AUN NO SE PUEDE QUITAR

    ws.room = user.room;
    ws.username = user_name;

    let currentRoom = GLOBALS.findRoomByName(ws.room);

    //Add the new client
    if(!currentRoom){
        createRoom(ws.room) //TODO RAQUEL: cerrar conexión si no existe room!!
    }

    //Guardamos la conexión ws del user:
    usernameToClient[user_name] = ws //Diccionario del server
    clients.push(ws) //Dentro del server

    //console.log(GLOBALS.findRoomByName(ws.room));
    GLOBALS.findRoomByName(ws.room).clients.push(ws);
    GLOBALS.clients.push(ws);
    



    let clients_obj = {}

    for (let client of currentRoom.clients) {
        clients_obj[client.id] = {id: client.id, name: client.username};
        GLOBALS.addClientObject(client.id, client.username);
    }


    //Retrieve the url of the room model

    let room_url = currentRoom.url;

    let room = {
        type: "ROOM",
        name: ws.room,
        clients: GLOBALS.clients_obj,
        length: GLOBALS.clients_obj.length,
        url: room_url
    }

    sendToRoom(ws.room, JSON.stringify(room), ws.id)
    console.log("ORIGINAL: " + JSON.stringify(room));

    //RAQUEL: Mongo PRUBEAS msg room
    /*rooms[ws.room].clients = clients_obj;
    rooms[ws.room].length = clients_obj.length;
    console.log(JSON.stringify(Room.toJson(rooms[ws.room])));
    //sendToRoom(ws.room, JSON.stringify(Room.toJson(rooms[ws.room])), ws.id)*/

    //Tell everyone that a user has connected

    let msg = {
        userID: ws.id,
        username: user_name,
        type: "LOGIN",
        content: userInfo,
        //content: user, //RAQUEL: MONGODB aun por testar!
        date: new Date()
    }
    console.log(userInfo);
    sendToRoom(ws.room, JSON.stringify(msg))

    //Configure on message callback
    ws.on('message', on_message_received);

    //Configure on close and on error callback

    let connection_close = () => {

        //let room = rooms[ws.room]
        let room = currentRoom;
        if(!room) {
            return
        }
        let index = room.clients.indexOf(ws)

        room.clients.splice(index, 1)
        clients.splice(clients.indexOf(ws), 1)

        //Send logout message to all the clients
        let msg = {
            userID: ws.id,
            username: user_name,
            type: "LOGOUT",
            content: "",
            date: new Date()
        }

        sendToRoom(ws.room, JSON.stringify(msg));
        delete usernameToClient[user_name]

    }

    ws.on("close", connection_close)
    ws.on("error", connection_close)
}

/**
 * Retrieve all the useful information of the given user in MongoDB
 * @param username
 * @return {{character, room, position, scaling, target, anim}}
 */
function get_user_info(username) {

    return {  //TODO: Change so that it actually retrieves the information from the database
        character: "girl",
        room: "Spanish",
        //This is the default position.
        position: [0, 0, 0],
        scaling: 0.4,
        target: [0, 0, 0],
        anim: "girl_idle"
    }
}

/**
 * Given a ws, generate a new ID and send it to the user
 * @param ws
 * @return {int}
 */
function get_new_id(ws) {
    ws.id = lastID
    lastID++

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
    //rooms[room_name] = { clients: []}
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
    //let room = rooms[room_name]
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
        console.log(msg)
        client.send(msg)
    }
}

/**
 * Message received
 * @param message
 */
function on_message_received(message) {
    let msg = JSON.parse(message.utf8Data)

    if (msg.type === "CHANGE-ROOM") {
        let username = msg.user
        let ws = usernameToClient[username]

        let room = GLOBALS.findRoomByName(ws.room);
        //let room = rooms[ws.room]
        let index = room.clients.indexOf(ws)

        room.clients.splice(index, 1)

        ws.room = msg.room
        //room = rooms[ws.room]
        //room.clients.push(ws)
        GLOBALS.findRoomByName(ws.room).clients.push(ws);
        
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