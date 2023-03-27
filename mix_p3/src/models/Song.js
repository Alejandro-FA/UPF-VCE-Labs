const mongoose = require('mongoose');
const { Schema } = mongoose;


const SongSchema = new Schema ({
    url: {type: String, required: true},
    title: {type: String, required: true},
    artist: {type: String, required: true}
});


//----------- Methods -----------

//SongSchema.methods.getSong = function()


//----------- Statics -----------

//From Json
SongSchema.statics.fromJson = function(object) {
    let song = {
        url: object.url,
        title: object.title,
        artist: object.artist
    };

    return song;
}


//From Json
SongSchema.statics.toJson = function(songObject) { //Igual a fromJson
    let song = {
        url: songObject.url,
        title: songObject.title,
        artist: songObject.artist
    };

    return song;
}


//----------- Export the Schema -----------
module.exports = mongoose.model('Song', SongSchema);