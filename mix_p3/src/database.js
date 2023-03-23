const mongoose = require('mongoose');

//url de mongo DB
const MONGODB_URL = 'mongodb://localhost/notes-db-app'

mongoose.connect(MONGODB_URL)
.then(db => console.log('DB is connected'))
.catch(err => console.error(err));