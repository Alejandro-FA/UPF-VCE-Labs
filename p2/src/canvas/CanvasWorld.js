/**
 * @abstract This class is meant to be treated like an interface and it should
 * not be instantiated. To use it, you should create a new class, inherit from
 * it and override all required methods
 */
class CanvasWorld {
    constructor(canvas, inputState = null) {
        if (new.target === CanvasWorld) {
            throw new TypeError("CanvasWorld cannot be instantiated. It is an abstract class.")
        }
        this.canvas = canvas;
        this.inputState = inputState ?? new InputState();
    }

    draw(canvasCtx) {
        throw Error("Abstract method `draw` cannot be called.");
        // for (const i of this.items) i.draw(canvasCtx);
    }

    update(elapsed_time) {
        throw Error("Abstract method `update` cannot be called.");
    }
}



/**
 * This @class implements the `CanvasWorld` interface.
 */
class MyWorld extends CanvasWorld {
    mouse_pos = [0,0];

    constructor(canvas, inputState = null) {
        super(canvas, inputState);
        // Set which actions to perform when an input event happens
        this.inputState.onKey = this.onKey;
        this.inputState.onMouse = this.onMouse;
    }


    draw(ctx) {
        let canvas = ctx.canvas;

        // Fill canvas with specified color
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw rectangle with specified color
        ctx.fillStyle = "#FF00FF";
        ctx.fillRect(this.mouse_pos[0], this.mouse_pos[1], 50, 50);
    }


    update(elapsed_time) {
        // TODO:
    }


    onMouse = (event) => {
        // FIXME: These 3 lines should be done with the WorldCoords class
        let rect = this.canvas.getBoundingClientRect();
        this.mouse_pos[0] = this.inputState.mouse_pos[0] - rect.left; 
        this.mouse_pos[1] = this.inputState.mouse_pos[1] - rect.top;
    
        switch (event.type) {
            case "mousedown":
                break;
            case "mouseup":
                break;
            case "mousemove":
                break;
            default:
                break;
        }
    }


    onKey = (event) => {
        switch (event.type) {
            case "keydown":
                break;
            case "keyup":
                break;
            default:
                break;
        }
    }
}


/**
 * This @class contains all the information that an item that has to be
 * drawn to a Canvas might need to store
 */
class CanvasItem {
    draw(canvasCtx) {

    }
}