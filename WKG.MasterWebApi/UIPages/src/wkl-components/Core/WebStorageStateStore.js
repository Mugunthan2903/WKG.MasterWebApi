import { Global } from './Global';

export class WebStorageStateStore {
    constructor({ prefix = "wkl.WKG.", store = Global.sessionStorage } = {}) {
        this._store = store;
        this._prefix = prefix;
    }

    set(key, value) {
        key = this._prefix + key;

        this._store.setItem(key, value);
    }

    get(key) {

        key = this._prefix + key;
        return this._store.getItem(key);
    }

    remove(key) {

        key = this._prefix + key;
        let item = this._store.getItem(key);
        this._store.removeItem(key);
        return item;
    }

    getAllKeys() {
        var keys = [];

        for (let index = 0; index < this._store.length; index++) {
            let key = this._store.key(index);

            if (key.indexOf(this._prefix) === 0) {
                keys.push(key.substr(this._prefix.length));
            }
        }

        return keys;
    }
}