class InputState {
    // Mouse and keyboard state
    keys = {};
    mouse_pos = [0,0];
    mouse_buttons = 0;

    // Functions to execute in case that an event is triggered
    _onMouseActions = [];
    _onKeyActions = [];


    constructor() {
        // Add event listeners
        document.body.addEventListener("mousedown", this._onMouse);
        document.body.addEventListener("mouseup", this._onMouse);
        document.body.addEventListener("mousemove", this._onMouse);
        document.body.addEventListener("keydown", this._onKey);
        document.body.addEventListener("keyup", this._onKey);
    }


    /**
     * Callback actions setters.
     * @param action must a function that receives an event as a parameter;
     */
    set onMouse(action) {
        this._onMouseActions.push(action);
    }


    set onKey(action) {
        this._onKeyActions.push(action);
    }


    // Private methods, do not modify them
    _onMouse = (event) => {
        this.mouse_pos[0] = event.clientX;
        this.mouse_pos[1] = event.clientY;
        this.mouse_buttons = event.buttons;
        for (let action of this._onMouseActions) {
            action(event);
        }
    }


    _onKey = (event) => {
        switch (event.type) {
            case "keydown":
                this._keys[event.key] = true; // Mark the key as being pressed
                break;
            case "keyup":
                this._keys[event.key] = false; // Mark the key as NOT being pressed
                break;
            default:
                break;
        }
        for (let action of this._onKeyActions) {
            action(event);
        }
    }
}