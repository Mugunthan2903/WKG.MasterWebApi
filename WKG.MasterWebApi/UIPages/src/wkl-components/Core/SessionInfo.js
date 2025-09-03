export class SessionInfo {
    constructor({ AccessToken, RefreshToken, User, Data, Token }) {
        this.AccessToken = AccessToken;
        this.RefreshToken = RefreshToken;
        this.User = User;
        this.Data = Data;
        this.Token = Token;
    }
    toStorageString() {
        return JSON.stringify({
            AccessToken: this.AccessToken,
            RefreshToken: this.RefreshToken,
            User: this.User,
            Data: this.Data,
            Token: this.Token
        });
    }
    static fromStorageString(storageString) {
        return new SessionInfo(JSON.parse(storageString));
    }
}