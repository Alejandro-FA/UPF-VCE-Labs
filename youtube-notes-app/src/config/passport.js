const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/User');

passport.use(new LocalStrategy({
    usernameField: 'username',
}, async (username, password, done) => {
    const user = await User.findOne({username: username});
    console.log(user);
    if(!user) {
        return done(null, false, {message: 'Not user found'});
    } else {
        const match = await user.matchPassword(password);
        if(match) {
            return done(null, user);
        } else {
            return done(null, false, {message: 'Incorrect password'});
        }
    }    
}));


passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser(function(user, done) { 
    done(null, user); 
});


//Errores porque findById NO acepta callbacks y esto es un lío tremendo
/*passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
    await User.findById(id, (err, user) => {
        done(err, user);
    });
});*/