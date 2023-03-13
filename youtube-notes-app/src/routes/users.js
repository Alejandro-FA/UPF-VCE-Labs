const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passport = require('passport');


// ------ GET ------
//para mandar las urls


//User authentication (if has an account)
router.get('/users/signin', (req, res) => {
    //res.send("Ingresando a la app");
    //res.send(req.flash());
    res.render('users/signin');
});

//User registration (for the first time)
router.get('/users/signup', (req, res) => {
    //res.send("Formulario de registro");
    res.render('users/signup');
});




// ------ POST ------
//para recibir datos que el user ingrese

router.post('/users/signin', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: 'signin',
    failureFlash: true
}));

//para registrarse
router.post('/users/signup', async (req, res) => {
    //console.log(req.body);
    const {username, email, password, confirm_password} = req.body;
    console.log(req.body);

    //Vamos a comprobar errores
    const errors = [];
    if(password != confirm_password) {
        errors.push({text: 'Password do not match'});
    }
    if(password.length < 4) {
        errors.push({text: 'Password must be at least 4 characters'});
    }
    if(username.length <= 0) {
        errors.push({text: 'Write a username'});
    }

    //Gestión final de los errores
    if(errors.length > 0) {
        res.render('users/signup', {errors, username, email, password, confirm_password});
    } else {
        const inputUsername = await User.findOne({username: username});
        console.log(inputUsername);
        
        //si ya existe ese username
        if(inputUsername) {
            req.flash('error_msg', 'The username is already in use');
            res.redirect('users/signup');
        } else {
            //Creamos user nuevo
            const newUser = new User({username, email, password});
            //hasheamos password
            newUser.password = await newUser.encryptPassword(password);
            //Guardamos user
            await newUser.save();
            //Enviamos msgs
            req.flash('sucess_msg', 'You are registered');
            res.redirect('users/signin');
        }
    }
    
})

module.exports = router;