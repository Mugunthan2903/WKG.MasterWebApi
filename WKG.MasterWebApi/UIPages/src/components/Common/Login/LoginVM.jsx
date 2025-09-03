import * as cntrl from '../../../wkl-components';

export default class LoginVM extends cntrl.VMBase {
    constructor(props) {
        super(props);
        this.init();
    }

    init() {
        const model = this.Data;
        if (Object.keys(model).length !== 0)
            return;

        model.RememberMe = true;
        model.Name = '';
        model.UniqueID = cntrl.Utils.getUniqueID();
        model.LoginID = '';
        model.Password = '';
        model.ShowLoading = false;

        if (this.props.data && this.props.data.IsLocked === true) {
            const user = this.props.data.User;
            model.Name = user.Name || '';
            model.Password = "";
        }
    }

    showAlert(errorMsg, name) {
        const me = this;
        const opt = {
            text: errorMsg,//Please enter the rate name
            messageboxType: cntrl.WKLMessageboxTypes.error
        };
        if (name) {
            opt.onClose = (_e) => {
                if (me.ComponentRef) {
                    me.ComponentRef.setFocus(name);
                }
            }
        }
        this.showMessageBox(opt);
    }
    isvalid() {
        const model = this.Data;
        if (!cntrl.ApiManager.isSystemReady()) {
            this.showAlert('System configuration fails to load. Please contact system Administartor!');
            return false;
        }
        if (cntrl.Utils.isNullOrEmpty(model.LoginID)) {
            this.showAlert('Please enter login id', 'LoginID');
            return false;
        }
        if (cntrl.Utils.isNullOrEmpty(model.Password)) {
            this.showAlert('Please enter password', 'Password');
            return false;
        }
        return true;
    }
    sessionUnlock() {
        const model = this.Data;
        const me = this;

        if (cntrl.Utils.isNullOrEmpty(model.Password)) {
            this.showAlert('Please enter password', 'Password');
            return false;
        }

        let loginInfo = {};
        loginInfo.Token = this.props.data.User.Token;
        loginInfo.Password = model.Password;
        model.ShowLoading = true;
        this.updateUI();
        cntrl.ApiManager.signIn({ data: loginInfo }, (r) => {
            try {
                model.ShowLoading = false;
                if (r && r.IsValid === true) {
                    cntrl.ApiManager.startSessionTimeout();
                    me.close({ IsLogedIn: true, });
                }
                else {
                    me.showAlert('login Failed!');
                }
            }
            catch { }
            finally {
                me.updateUI();
            }
        }, true);
    }
    updateRemberMe() {
        const model = this.Data;
        if (model.RememberMe === true) {
            localStorage.wkl_poschkbox = true;
            localStorage.wkl_posloginid = model.LoginID;
        } else {
            localStorage.wkl_poschkbox = false;
            localStorage.wkl_posloginid = null;
        }
    }
    LoginUser() {
        if (!this.isvalid())
            return;
        const model = this.Data;
        const me = this;

        let loginInfo = {};

        loginInfo.LoginID = model.LoginID;
        loginInfo.Password = model.Password;
        model.ShowLoading = true;
        this.updateUI();
        cntrl.Utils.loginAjax(loginInfo, (r) => {
            try {
                model.ShowLoading = false;
                r = r || null;
                if (r.UserValid === true) {
                    me.updateRemberMe();
                    return;
                }
                else {
                    let msg = r.ErrorMessage;
                    if (cntrl.Utils.isNullOrEmpty(r.ErrorMessage))
                        msg = "Invalid Login Id \ Password";
                    me.showAlert(msg, 'LoginID');
                }
            }
            catch { }
            finally {
                this.updateUI();
            }
        });
    };

}