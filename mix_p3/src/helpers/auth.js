const helpers = {};


//Vamos a blindar las urls
helpers.isAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next(); //Continua con la siguiente función
    }

    req.flash('error_msg', 'No Authorized');
    res.redirect('/users/signin');
}

module.exports = helpers;