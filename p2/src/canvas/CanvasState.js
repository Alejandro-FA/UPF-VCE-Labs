/**
 * @abstract This class is meant to be treated like an interface and it should
 * not be instantiated. To use it, you should create a new class, inherit from
 * it and override all required methods
 */
class CanvasState {
    items = []

    constructor() {
        if (new.target === CanvasState) {
            throw new TypeError("CanvasState cannot be instantiated. It is an abstract class.")
        }
    }

    addItem(item) {
        this.items.push(item);
    }

    removeItem(index) {
        this.items.splice(index, 1)
    }

    drawAll(canvasCtx) {
        for (const i of this.items) i.draw(canvasCtx);
    }
}


/**
 * This @class implements the `CanvasState` interface.
 */
class MyWorld extends CanvasState {

}


/**
 * This @class contains all the information that an item that has to be
 * drawn to a Canvas might need to store
 */
class CanvasItem {
    draw(canvasCtx) {

    }
}