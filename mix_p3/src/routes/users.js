const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passport = require('passport');


// ------ GET ------
//para mandar las urls


//User authentication (if has an account)
router.get('/users/signin', (req, res) => {
    //res.send(req.flash());
    res.render('users/signin');
});

//User registration (for the first time)
router.get('/users/signup', (req, res) => {
    res.render('users/signup');
});




// ------ POST ------
//para recibir datos que el user ingrese
/*
router.post('/users/signin', (req, res) => {
    passport.authenticate('local', {
        successRedirect: '/canvas',
        failureRedirect: 'signin',
        failureFlash: true
    });
    const {username, password} = req.body;
    console.log(username);
});*/

router.post('/users/signin',
    passport.authenticate('local', {
        successRedirect: '/canvas',
        failureRedirect: 'signin',
        failureFlash: true
    })
);

//para registrarse
router.post('/users/signup', async (req, res) => {
    const {username, password, confirm_password} = req.body;
    console.log(req.body);

    //Vamos a comprobar errores
    const errors = [];
    if(password != confirm_password) {
        errors.push({text: 'Password do not match', id: errors.length});
    }
    if(password.length < 4) {
        errors.push({text: 'Password must be at least 4 characters', id: errors.length});
    }
    if(username.length <= 0) {
        errors.push({text: 'Write a username', id: errors.length});
    }

    //Gestión final de los errores
    if(errors.length > 0) {
        res.render('users/signup', {errors, username, password, confirm_password});
    } else {
        //Coge el username si ya existe
        const inputUsername = await User.findOne({username: username});
        console.log(inputUsername);
        
        //si ya existe ese username
        if(inputUsername) {
            req.flash('error_msg', 'The username is already in use');
            return res.redirect('/users/signup');
        } else {
            //Creamos user nuevo
            const newUser = new User({username, password});
            //hasheamos password
            newUser.password = await newUser.encryptPassword(password);
            //Guardamos user
            await newUser.save();
            //Enviamos msgs
            req.flash('success_msg', 'You are registered');
            res.redirect('signin');
        }
    }
    
})


//Cuando user selecciona logout en el navigation bar
router.get('/users/logout', (req, res) => {
    req.logOut(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
}); 

module.exports = router;