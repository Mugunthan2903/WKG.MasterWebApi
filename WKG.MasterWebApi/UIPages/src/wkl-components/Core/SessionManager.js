import { SessionInfo } from './SessionInfo';
import { ApplicationInfo } from './ApiConstants';

export class SessionManager {
    constructor(settings = { authority: ApplicationInfo.authority }) {
        this.settings = settings;
    }
    get _seesionStore() {
        return this.settings.sessionStore;
    }
    getSession() {
        return this._loadUser();
    }
    removeSession() {
        this.storeSession(null);
    }
    get _sessionStoreKey() {
        return `session:${this.settings.authority}`;
    }

    _loadUser() {
        const storageString = this._seesionStore.get(this._sessionStoreKey);
        if (storageString) {
            return SessionInfo.fromStorageString(storageString);
        }
        return null;
    }
    storeSession(sessionInfo) {
        if (sessionInfo) {
            var storageString = sessionInfo.toStorageString();
            this._seesionStore.set(this._sessionStoreKey, storageString);
        }
        else {
            return this._seesionStore.remove(this._sessionStoreKey);
        }
    }
}