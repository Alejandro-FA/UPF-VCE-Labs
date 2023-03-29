const mongoose = require('mongoose');

//url de mongo DB
const MONGODB_URL = 'mongodb://localhost/notes-db-app'

mongoose.connect(MONGODB_URL)
.then(db => console.log('DB is connected'))
.catch(err => console.error(err));



/* AGENJO SERVER??*/
/*
var MongoClient = require('mongodb').MongoClient;

const MONGODB_URL = 'mongodb://localhost:9017/notes-db-app';
var url_mongo = 'mongodb://localhost:9017/myproject';

MongoClient.connect( MONGODB_URL, function(err, db) {
    console.log("Connected successfully to server");
    db.close();
});
*/