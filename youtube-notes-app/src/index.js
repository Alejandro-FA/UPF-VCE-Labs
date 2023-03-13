const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');



//---------------INITIALIZATIONS ---------------
const app = express();

//initialize DB
require('./database');

//passport functionalities
require('./config/passport');



//--------------- SETTINGS ---------------

//port
app.set('port', process.env.PORT || 3000); //Si existe port en mi pc, que lo tome. Sino el 3000

//paths
app.set('views', path.join(__dirname, 'views'));

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
    res.locals.sucess_msg = req.flash('sucess_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error'); //passport flash errors

    next();
});




//--------------- ROUTES ---------------
app.use(require('./routes/index'));
app.use(require('./routes/users'));
app.use(require('./routes/notes'));




//--------------- STATIC FILES ---------------
//Donde estará la carpeta de archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));




//--------------- SERVER IS LISTENING ---------------
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'))
})