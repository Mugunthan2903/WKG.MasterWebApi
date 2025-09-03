import { Utils, WKLMessageboxTypes, VMBase } from "../../../wkl-components";

export default class AuthenticationVM extends VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'UserAccess';
    }
    init() {
        if (Object.keys(this.Data).length !== 0)
            return;

        this._saving = false;

        const model = this.Data;
        model.Loading = false;
        model.Input = { LoginID: '', Password: '' };

        if (this.props.data) {
            model.FormID = this.props.data.FormID || null;
            model.ControlID = this.props.data.ControlID || null;
        }
    }
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    showAlert(errorMsg, name, msgType = WKLMessageboxTypes.error) {
        if (typeof errorMsg === 'number') {
            errorMsg = Utils.getMessage(errorMsg);
        }

        const opts = {
            text: errorMsg,
            messageboxType: msgType
        };
        if (name) {
            opts.onClose = (_e) => {
                this.setFocus(name);
            }
        }
        this.showMessageBox(opts);
    }
    isvalidSave(e) {
        const model = this.Data.Input;
        if (Utils.isNullOrEmpty(model.LoginID)) {
            this.showAlert('Please enter login id', 'LoginID');
            return false;
        }
        if (Utils.isNullOrEmpty(model.Password)) {
            this.showAlert('Please enter password', 'Password');
            return false;
        }
        return true;
    }
    getData() {
        const model = this.Data;
        const dataModel = model.Input;
        const dataInfo = {};
        dataInfo.LoginID = dataModel.LoginID;
        dataInfo.Password = dataModel.Password;
        dataInfo.FormID = model.FormID;
        dataInfo.ControlID = model.ControlID;
        return dataInfo;
    }
    doSave(e) {
        if (this.isvalidSave(e)) {
            const me = this;
            const model = this.Data;
            const dataInfo = this.getData();
            model.Loading = true;
            me.updateUI();
            Utils.ajax({ url: `${this._WebApi}/GetAuthorizationAsync`, data: dataInfo }, r => {
                try {
                    model.Loading = false;
                    r = r || {};
                    let data = r.Result || {};
                    let userID = +data.UserID;
                    if (!isFinite(userID) || isNaN(userID))
                        userID = 0;
                    if (r.IsSuccess === true && userID > 0) {
                        this.close({ IsValid: true, UserID: userID });
                    }
                    else {
                        if (r.Msg === 'INVALID')
                            me.showAlert('Invalid Login ID or Password');
                        else if (r.Msg === 'ACCESS-DENIED')
                            me.showAlert('Access Denied!');
                        else
                            me.showAlert(1);
                    }
                }
                catch (ex) {
                    console.log(ex);
                }
                finally {
                    me.updateUI();
                }
            });
        }
    }
    doClose() {
        this.close({ IsValid: false });
    }
}