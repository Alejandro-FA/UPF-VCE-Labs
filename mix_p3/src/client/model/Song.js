
class Song {

    /**
     * Creates an instance of Song from a Json of correct structure
     * @param object {{title, artist, url}}
     * @return {Song}
     */
    static fromJson(object) {
        let song = new Song()

        song.title = object.title
        song.artist = object.artist
        song.url = object.url

        return song
    }

    /**
     * Converts the song into a JSON object
     * @return {{artist, title, url}}
     */
    toJson() {
        return {
            "title": this.title,
            "artist": this.artist,
            "url": this.url
        }
    }
}