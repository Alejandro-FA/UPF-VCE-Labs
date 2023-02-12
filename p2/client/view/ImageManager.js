class ImageManager {
    cachedImgs = {};

    getImage(url) {
        // Check if the image is already cached
        if (url in this.cachedImgs) return this.cachedImgs[url];

        // If we do not have the image cached, then we create it
        let img = this.cachedImgs[url] = new Image();
        img.src = url;
        return img;
    }
}