const express = require('express');
const router = express.Router();
const passport = require('passport');

const { isAuthenticated } = require('../helpers/auth');

router.get('/sing', isAuthenticated, (req, res) => {
    //res.send('About');
    res.render('canvas'); //show file about.hbs from views folder
});

module.exports = router;