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
const rooms = {};

const clients = [];

const usernameToClient = {};

let lastID = 1;

let on_user_connected = null
let on_message = null
let on_user_disconnected = null

const world = JSON.parse(fs.readFileSync("./src/world.json", "utf8")) // TODO: Change path to where the Json file is


//initialize DB
require('./database');

//passport functionalities
require('./config/passport');
const url = require("url");
const qs = require("querystring");

//--------------WEBSOCKET CALLBACKS--------------

wss.on("request", on_connection);

/**
 * Callback that handles connections
 * @param req
 */
function on_connection(req) {
    let ws = req.accept();

    let path = url.parse(req.resource)
    let user_name = qs.parse(path.query).username
    get_new_id(ws);

    //Retrieve all the needed information from the database TODO: use mongoDB to retrieve said information
    let userInfo = get_user_info(user_name);

    ws.room = userInfo.room

    //Add the new client
    if(!rooms[ws.room]){
        createRoom(ws.room)
    }
    usernameToClient[user_name] = ws
    clients.push(ws)
    rooms[ws.room].clients.push(ws)


    let clients_obj = {}

    for (let client of rooms[ws.room].clients) {
        clients_obj[client.id] = {id: client.id, name: client.username}
    }


    //Retrieve the url of the room model

    let room_url = world[ws.room].url

    let room = {
        type: "ROOM",
        name: ws.room,
        clients: clients_obj,
        length: clients_obj.length,
        url: room_url
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

    let connection_close = () => {

        let room = rooms[ws.room]
        if(!room) {
            return
        }
        let index = room.clients.indexOf(ws)

        room.clients.splice(index, 1)
        clients.splice(clients.indexOf(ws), 1)

        if(room.clients.length === 0){
            delete rooms[ws.room]
        }

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

        if(on_user_disconnected){
            on_user_disconnected()
        }
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
    rooms[room_name] = { clients: []}
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
    let room = rooms[room_name]
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

    if(on_message){
        on_message()
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
//Todas las funciones que serán ejecutadas antes de que
//lleguen al server al server, o antes que pasárselo a las rutas

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
/*app.use(require('./routes/index'));
app.use(require('./routes/users'));
app.use(require('./routes/notes'));
app.use(require('./routes/canvas'));*/
app.use(require(path.join(app.get('routes'), 'index')));
app.use(require(path.join(app.get('routes'), 'users')));
app.use(require(path.join(app.get('routes'), 'notes')));
app.use(require(path.join(app.get('routes'), 'canvas')));




//--------------- STATIC FILES ---------------
//Donde estará la carpeta de archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'client')));





module.exports = {server, app};