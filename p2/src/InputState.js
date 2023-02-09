class InputState {
    // Mouse and keyboard state
    _keys = {};
    _mouse_pos = [0,0];
    _mouse_buttons = 0;


    constructor() {
        // Add event listeners
        document.body.addEventListener("mousedown", this._onMouse);
        document.body.addEventListener("mouseup", this._onMouse);
        document.body.addEventListener("mousemove", this._onMouse);
        document.body.addEventListener("keydown", this._onKey);
        document.body.addEventListener("keyup", this._onKey);
    }


    // Getters
    get keys() {
        return this._keys;
    }


    get mousePos() {
        return this._mouse_pos;
    }


    get mouseButtons() {
        return this._mouse_buttons;
    }


    /**
     * Callback actions setters.
     * @param action must a function that receives an event as a parameter;
     */
    set onMouse(action) {
        this._onMouseAction = action;
    }


    set onKey(action) {
        this._onKeyAction = action;
    }


    // Private methods, do not modify them
    _onMouse = (event) => {
        this._mouse_pos[0] = event.clientX;
        this._mouse_pos[1] = event.clientY;
        this._mouse_buttons = event.buttons;
        this._onMouseAction?.(event); // Call this only if it exists
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
        this._onKeyAction?.(event); // Call this only if it exists
    }
}