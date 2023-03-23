const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
    //res.send('Index');
    res.render('index'); //show file index.hbs from views folder
});

router.get('/about', (req, res) => {
    //res.send('About');
    res.render('about'); //show file about.hbs from views folder
});

module.exports = router;