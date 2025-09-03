import { ApplicationInfo, ApplicationPaths, Msgs } from './ApiConstants';
import { WebStorageStateStore } from './WebStorageStateStore';
import { SessionManager } from './SessionManager';
import { SessionInfo } from './SessionInfo';
import { IdleManager } from './IdleManager';
import { NotificationManager } from './NotificationManager';

class apiManager {

    _fetchList = [];
    _allEventCallbacks = [];
    _sessionInfo = null;
    _isAuthenticated = false;
    _configInfo = undefined;
    _systemState = '';

    constructor() {
        this._init();
    }

    isAuthenticated() {
        const user = this.getUser();
        return user !== undefined && user !== null;
    }

    startSessionTimeout() {
        if (!IdleManager.isRunning())
            IdleManager.start(() => {
                this._updateSessionTimeout();
            });
    }
    isSystemReady() {
        if (this._configInfo && !this._isNullOrEmpty(this._configInfo.LoginUrl))
            return true;
        return false;
    }
    getApiConfig() {
        return this._configInfo;
    }
    getUser() {
        if (this._sessionInfo && this._sessionInfo.User) {
            return this._sessionInfo.User;
        }
        const sessionInfo = this._sessionManager.getSession();
        return sessionInfo && sessionInfo.User;
    }
    updateUser(userInfo) {
        if (userInfo) {
            const sessionInfo = this._sessionManager.getSession();
            sessionInfo.User = userInfo;
            this._sessionManager.storeSession(sessionInfo);
            return this._sessionInfo = sessionInfo;
        }
    }
    getSessionData() {
        if (this._sessionInfo && this._sessionInfo.Data) {
            return this._sessionInfo.Data;
        }
        const sessionInfo = this._sessionManager.getSession();
        return sessionInfo && sessionInfo.Data;
    }
    getSessionInfo() {
        if (this._sessionInfo) {
            return this._sessionInfo;
        }
        const sessionInfo = this._sessionManager.getSession();
        return sessionInfo && sessionInfo;
    }

    getAccessToken() {
        const sessionInfo = this._sessionManager.getSession();
        return sessionInfo && sessionInfo.AccessToken;
    }
    getRefreshToken() {
        const sessionInfo = this._sessionManager.getSession();
        return sessionInfo && sessionInfo.RefreshToken;
    }
    _init() {
        const settings = { authority: ApplicationInfo.Authority };
        settings.sessionStore = new WebStorageStateStore({
            prefix: ApplicationInfo.Name
        });
        this._sessionManager = new SessionManager(settings);
        this._ensureInitialized();
    }
    _ensureInitialized() {
        if (this._configInfo !== undefined) {
            return;
        }
        fetch(ApplicationPaths.ConfigUrl)
            .then(res => res.json())
            .then(
                (result) => {
                    this._configInfo = result;
                    this._startPendFetch();
                },
                (error) => {
                }
            );
    }
    _startPendFetch() {
        NotificationManager.notify(Msgs.ApiUrlLoaded, null);
        if (this._fetchList.length > 0) {
            for (var i = 0; i < this._fetchList.length; i++) {
                const action = this._fetchList[i];
                if (action.From === 'signIn')
                    this.signIn(action.options, action.callback);
                else if (action.From === 'fetchData')
                    this.fetchData(action.options, action.callback);
            }
            this._fetchList = [];
        }
    }

    subscribe(callback, action = null) {
        return NotificationManager.subscribe(callback, action);
    }

    unsubscribe(subscriptionId) {
        return NotificationManager.unsubscribe(subscriptionId);
    }
    _updateState(sessionInfo, message = undefined) {
        this._sessionInfo = sessionInfo;
        this._isAuthenticated = !this._sessionInfo;
        if (message)
            NotificationManager.notify(message);
    }
    _updateSessionTimeout() {
        NotificationManager.notify(Msgs.SessionTimeout);
    }
    _getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    async _fetchFromServer(opt) {
        let { url } = opt.options;
        const config = this._getAjaxSettings(opt, true);
        let baseUrl = this._configInfo.ServiceUrl;
        let apiUrl = `${baseUrl}/${url}`;
        //https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
        var response = await fetch(apiUrl, config);
        if (response.ok) { //all is good, return the response
            return response;
        }
        if (response.status === 401 && response.headers.has('Token-Expired')) {

            var refreshResponse = await this._refreshToken();
            if (refreshResponse === undefined || refreshResponse === null || !refreshResponse.ok) {
                return response; //failed to refresh so return original 401 response
            }
            var r = await refreshResponse.json(); //read the json with the new tokens
            const seesionInfo = new SessionInfo(r.Token);
            this._sessionManager.storeSession(seesionInfo);
            this._updateState(seesionInfo);

            return await this._fetchFromServer(opt); //repeat the original request
        } else { //status is not 401 and/or there's no Token-Expired header
            return response; //return the original 401 response
        }
    }
    async _refreshToken() {
        try {
            let baseUrl = this._configInfo.LoginUrl;
            const refreshToken = this.getRefreshToken();
            const accessToken = this.getAccessToken();
            const opt = { options: { data: { AccessToken: accessToken, RefreshToken: refreshToken } } };
            let apiUrl = `${baseUrl}/${ApplicationPaths.RefreshToken}`;
            const config = this._getAjaxSettings(opt, true);
            return await fetch(apiUrl, config);
        }
        catch (ex) { }
    }
    openFileInWindow(options, callback) {
        const opt = { options, settings: { responseType: 'blob' } };
        this._fetchFromServer(opt)
            .then(res => {
                if (res.ok)
                    return res.blob();
            }).then((blobby) => {
                try {
                    let objectUrl = window.URL.createObjectURL(blobby);
                    window.open(objectUrl, "_blank", 'fullscreen=yes');
                    window.URL.revokeObjectURL(objectUrl);
                    callback();
                }
                catch (ex) { }
            })
            .catch((er) => {

            });
    }
    downloadFile(options, callback) {
        const opt = { options, settings: { responseType: 'blob', isFile: true } };
        this._fetchFromServer(opt)
            .then(res => {
                if (res.ok)
                    return res.blob();
            }).then((blobby) => {
                try {
                    const isAttachment = options.isAttachment || false;
                    let anchor = null;
                    let downfileName = 'no-file-name';
                    if (isAttachment === true) {
                        anchor = document.createElement("a");
                        document.body.appendChild(anchor);

                        if (!this._isNullOrEmpty(options.fileName))
                            downfileName = options.fileName;
                    }
                    if (isAttachment === true) {
                        let objectUrl = window.URL.createObjectURL(blobby);
                        anchor.href = objectUrl;
                        anchor.download = downfileName;
                        anchor.click();
                        window.URL.revokeObjectURL(objectUrl);
                    }
                    else {
                        //var file = new Blob([blobby], {type: 'application/pdf'});
                        var file = blobby;
                        var fileURL = URL.createObjectURL(file);
                        window.open(fileURL, "_blank", 'fullscreen=yes');
                    }
                    callback({ downloaded: true });
                    return;
                } catch (ex) {
                    callback({ downloaded: false });
                }
            })
            .catch((er) => {
                callback({ downloaded: false });
            });

    }
    _getAjaxSettings(opt, addToken = true) {
        opt.options = opt.options || {};
        opt.settings = opt.settings || {};
        const data = opt.options.data || null;
        const files = opt.options.files || null;
        const isFile = opt.settings.isFile || false;
        const responseType = opt.settings.responseType || null;

        let config = {};
        config.method = 'POST';
        config.async = true;
        config.credentials = 'include';
        config.crossDomain = true;
        config.processData = false;
        config.contentType = false;
        config.mimeType = "multipart/form-data";
        var formData = new FormData();
        if (data !== undefined && data !== null)
            formData.append("Parameters", JSON.stringify(data));
        if (files && files.length > 0) {
            for (const fs of files) {
                if (fs)
                    formData.append("Files", fs, fs.name);
            }
        }
        if (isFile === false) {
            config.headers = {
                'Accept': 'application/json;charset=utf8'
            };
        }
        else {
            config.headers = {};
        }
        config.body = formData;
        /* }
         else {
             config.headers = {
                 'Content-Type': 'application/json',
                 'Accept': 'application/json;charset=utf8'
             };
             config.body = data;
         }*/
        if (addToken === true) {
            const token = this.getAccessToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                config.headers["X-CSRF-TOKEN"] = this._getCookie('XSRF-TOKEN');
            }
        }
        if (responseType)
            config.headers.responseType = responseType;
        return config;
    }
    async resignIn() {
        const oldSessionInfo = this.getSessionInfo();
        var refreshResponse = await this._refreshToken();
        if (refreshResponse === undefined || refreshResponse === null || !refreshResponse.ok) {
            return false; //failed to refresh so return original 401 response
        }
        var r = await refreshResponse.json(); //read the json with the new tokens
        if (r.IsValid === false) {
            alert('Session expired!. Please login again');
            this._clearSession();
            return;
        }
        const seesionInfo = new SessionInfo(r.Token);
        seesionInfo.Data = oldSessionInfo.Data;
        this._sessionManager.storeSession(seesionInfo);
        this._updateState(seesionInfo);
        return true;
    }
    signIn(options, callback, isUnlock = false) {
        if (this._configInfo === undefined) {
            this._fetchList.push({ options, callback, From: 'signIn' });
            return;
        }

        let baseUrl = this._configInfo.LoginUrl;
        const opt = { options };
        let apiUrl = `${baseUrl}/${ApplicationPaths.SignIn}`;
        const config = this._getAjaxSettings(opt, false);
        fetch(apiUrl, config)
            .then(res => {
                if (res.ok) {
                    if (res.headers.get("content-type").indexOf("application/json") !== -1)
                        return res.json();
                    else
                        return res.text();
                }
            }).then(async (r) => {
                if (r && r.IsValid === true) {
                    this.createSession(r, isUnlock);
                }
                callback(r);
            }, (er) => { callback(null); });
    }
    createSession(r, isUnlock = false) {
        const sessionInfo = new SessionInfo(r.Token);
        if (isUnlock === true) {
            if (this._sessionInfo) {
                sessionInfo.Data = this._sessionInfo.Data;
            }
        }
        this._sessionManager.storeSession(sessionInfo);
        this._updateState(sessionInfo, ((isUnlock === true) ? Msgs.SessionUnlock : Msgs.Signin));
    }
    updateSession(data) {
        const sessionInfo = this._sessionManager.getSession();
        sessionInfo.Data = data;
        this._sessionInfo = sessionInfo;
        this._sessionManager.storeSession(sessionInfo);
    }
    sessionLock(callback) {
        let baseUrl = this._configInfo.LoginUrl;
        let sessionInfo = this.getSessionInfo();
        sessionInfo = JSON.parse(JSON.stringify(sessionInfo));
        const opt = { options: { data: { AccessToken: sessionInfo.AccessToken, RefreshToken: sessionInfo.RefreshToken } } };

        let apiUrl = `${baseUrl}/${ApplicationPaths.Signout}`;
        const config = this._getAjaxSettings(opt, true);

        fetch(apiUrl, config)
            .then(res => {
                if (res.ok) {
                    if (res.headers.get("content-type").indexOf("application/json") !== -1)
                        return res.json();
                    else
                        return res.text();
                }
            }).then(async (r) => {
                r = r || {};
                if (r && r.IsValid === true) {
                    delete sessionInfo.AccessToken;
                    delete sessionInfo.RefreshToken;

                    this._sessionManager.removeSession();
                    this._updateState(undefined, Msgs.SessionLock);
                }
                callback(r);
            }, (er) => { /*callback(null);*/ });
    }
    signout(skip = false) {
        let baseUrl = this._configInfo.LoginUrl;
        let sessionInfo = this.getSessionInfo();
        sessionInfo = JSON.parse(JSON.stringify(sessionInfo));
        const opt = { options: { data: { AccessToken: sessionInfo.AccessToken, RefreshToken: sessionInfo.RefreshToken } } };

        let apiUrl = `${baseUrl}/${ApplicationPaths.Signout}`;
        const config = this._getAjaxSettings(opt, true);
        fetch(apiUrl, config)
            .then(res => {
                if (res.ok) {
                    if (res.headers.get("content-type").indexOf("application/json") !== -1)
                        return res.json();
                    else
                        return res.text();
                }
            }).then(async (r) => {
                if (skip === false) {
                    //if (r && r.IsValid === true) {
                    this._clearSession();
                    // }
                }
            }, (er) => { });
        if (skip === true) {
            this._clearSession(false);
            return;
        }
    }
    _clearSession(notify = true) {
        this._sessionManager.removeSession();
        if (notify === true)
            this._updateState(undefined, Msgs.Signout);
        this._sessionManager = null;
        window.location.reload();
    }
    fetchData(options, callback) {
        if (this._configInfo === undefined) {
            this._fetchList.push({ options, callback, From: 'fetchData' });
            return;
        }
        try {
            const opt = { options };
            this._fetchFromServer(opt)
                .then(res => {
                    if (res.ok) {
                        if (res.headers.get("content-type").indexOf("application/json") !== -1)
                            return res.json();
                        else
                            return res.text();
                    }
                }).then((r) => {
                    callback(r);
                }, (er) => { callback(null); });
        }
        catch (ex) {
            console.error(ex);
        }
    }
    _isNullOrEmpty(v) {
        return (v === undefined || v === null || v.trim() === "");
    };
}

const ApiManager = new apiManager();
//Object.freeze(ApiManager);
export { ApiManager };