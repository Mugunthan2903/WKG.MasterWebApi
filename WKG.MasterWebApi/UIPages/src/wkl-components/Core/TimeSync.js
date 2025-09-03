import moment from "moment";

const syncInterval = 60 * 60 * 1000;
class timeSync {
    _id = 0;
    _timeout = null;
    _serverCallback = null;
    _interval = syncInterval;
    _offset = 0;
    init({ Interval, ServerCallback }) {
        this._interval = Interval || syncInterval;
        this._serverCallback = ServerCallback;
    }
    start() {
        this.stop();
        this._timeout = setInterval(() => this.sync(), this._interval);
        this.sync();
    }
    updateLog() {
        document.title = moment(new Date(this.now())).format('DD MMM YYYY hh:mm');
        console.log(document.title);
    }

    stop() {
        if (this._timeout)
            clearTimeout(this._timeout);
    }
    _validNumber(offset) {
        return offset !== null && isFinite(offset);
    }
    sync() {
        this._id++;
        let start = Date.now();
        if (this._serverCallback) {
            this._serverCallback(this._id, ({ id, time }) => {
                try {
                    if (time !== undefined && time !== null) {
                        if (this._validNumber(id) && this._id === id) {
                            if (this._validNumber(time)) {
                                let end = Date.now();
                                let roundtrip = end - start;
                                let offset = (time - end) + (roundtrip / 2); // offset from local system time
                                if (this._validNumber(offset))
                                    this._offset = offset;
                            }
                        }
                    }
                } catch (ex) {
                    console.log(ex);
                }
            });
        }
    }
    now() {
        return Date.now() + this._offset;
    }
    dispose() {
        if (this._timeout)
            clearTimeout(this._timeout);
        this._serverCallback = null;
    }
}

const TimeSync = new timeSync();
export { TimeSync };