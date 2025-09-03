export class idleManager {
    _timeout = 30000;//in milliseconds
    _timer = undefined;
    _callback = null;
    _isRunning = false;
    constructor() {
        this._init();
    }

    isRunning() {
        if (this._isRunning)
            return true;
        return false;
    }
    start(callback, timeoutMinutes = 10) {
        this._callback = callback;
        this._timeout = (timeoutMinutes * 60) * 1000;
        this._isRunning = true;
        this._restTimer();
    }
    stop() {
        this._isRunning = false;
        this._restTimer();
    }


    _init() {
        // window.onload = () => this._restTimer();
        // window.onmousemove = () => this._restTimer();
        // window.onmousedown = () => this._restTimer();  // catches touchscreen presses as well      
        // window.ontouchstart = () => this._restTimer(); // catches touchscreen swipes as well 
        // window.onclick = () => this._restTimer();      // catches touchpad clicks as well
        // window.onkeypress = () => this._restTimer();
        // window.addEventListener('scroll', () => this._restTimer(), true); // improved; see comments

        window.addEventListener('load', this._restTimer); // improved; see comments
        window.addEventListener('mousemove', this._restTimer); // improved; see comments
        window.addEventListener('mousedown', this._restTimer); // improved; see comments
        window.addEventListener('touchstart', this._restTimer); // improved; see comments
        window.addEventListener('click', this._restTimer); // improved; see comments
        window.addEventListener('keydown', this._restTimer); // improved; see comments
        window.addEventListener('scroll', this._restTimer, true); // improved; see comments
    }
    _timeoutHandler() {
        try {
            this._callback();
        }
        catch { }
        this.stop();
    }
    _restTimer = () => {
        if (this._timer !== undefined)
            window.clearTimeout(this._timer);
        this._timer = undefined;
        if (this._isRunning === true)
            this._timer = setTimeout(() => this._timeoutHandler(), this._timeout);
    }
}
const IdleManager = new idleManager();
export { IdleManager };