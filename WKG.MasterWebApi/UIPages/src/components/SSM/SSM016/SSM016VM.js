import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import * as cntrl from "../../../wkl-components";

export default class SSM016VM extends VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'SSM010';
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.FormID = "SSM016";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.GroupID_Copy = this.props.data.Grp_ID;
        model.Input = {
            Group_Name: '',
            Homepg_Config: true,
            Popular_Dest: true,
            Trans_Config: true,
            Banner_Config:true,
        };
        this.newMode();
    }
    newMode(flag = false) {
        console.log('NewMOde', this.props);
        const model = this.Data.Input;
        model.Group_Name = '';
        model.Homepg_Config = true;
        model.Popular_Dest = true;
        model.Trans_Config = true;
        model.Banner_Config = true;
        this.setTitle();
        var dataCopyEx = this.getData();
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();
    }
    getData() {
        const model = this.Data.Input;
        const dataInfo = {};
        dataInfo.pos_grp_nam = model.Group_Name;
        dataInfo.Homepg_Config = model.Homepg_Config ;
        dataInfo.Popular_Dest = model.Popular_Dest;
        dataInfo.Trans_Config = model.Trans_Config;
        dataInfo.Banner_Config = model.Banner_Config;
        dataInfo.pos_grp_id = this.Data.GroupID_Copy;
        return dataInfo;
    }
    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    isvalidSave(e) {
        const model = this.Data.Input;
        if (Utils.isNullOrEmpty(model.Group_Name)) {
            this.showAlert('Please enter New Group Name', 'Group_Name');
            return false;
        }
        return true;
    }
    handleSave(e) {
        const me = this;
        const model = this.Data;
        this.doSave(e);
    }
    doSave(e) {
        if (this.isvalidSave(e)) {
            const me = this;
            const model = this.Data;
            const dataInfo = this.getData();
            dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
            model.Loading = true;
            me.updateUI();
            Utils.ajax({ url: `${this._WebApi}/SSM016SaveCopyAsync`, data: dataInfo }, r => {
                try {
                    model.Loading = false;
                    r = r || {};
                    if (r.IsSuccess === true) {
                        model.IsSaved = true;
                        me.handleSaveFollowup(e);
                    }
                    else {
                        me.showAlert('Something went wrong');
                    }
                }
                catch (ex) { }
                finally {
                    me.updateUI();
                }
            });
        }
    }
    handleSaveFollowup(e) {
        const me = this;
        const model = this.Data;
        const dataInfo = {};
        dataInfo.save = true;
        //me.showAlert('Data copied successfully');
        this.close(dataInfo);
    }
    handleValueChange(followUpAction) {
        const model = this.Data;
        if (this.isValueChanged()) {
            const me = this;
            this.showConfirmation("Do you want to Discard the changes?", false, (e) => {
                try {
                    if (e == 0) {
                        me.close();
                    }
                }
                catch (ex) {

                }
                finally { }
            });
        }
        else {
            Utils.invoke(followUpAction);
        }
    }
    doClose() {
        const model = this.Data;
        this.handleValueChange(() => this.close());
    }
    setTitle() {
        console.log("Settitle : ", this.props)
        const model = this.Data;
        const props = this.props.data;
        model.Title = `${this.props.data.Grp_Name} / Copy `;
    }
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    showAlert(errorMsg, name) {
        if (typeof errorMsg === 'number')
            errorMsg = Utils.getMessage(errorMsg);

        const me = this;
        const opt = {
            text: errorMsg,
            messageboxType: WKLMessageboxTypes.question
        };
        if (name) {
            opt.onClose = (_e) => {
                me.setFocus(name);
            }
        }
        this.showMessageBox(opt);
    }
    showConfirmation(msgNo, isThreeOption, callback) {
        let options = [{ text: 'Yes' }, { text: 'No' }];
        if (isThreeOption)
            options = [{ text: 'Yes' }, { text: 'No' }, { text: 'Cancel' }];
        let text = '';
        if (typeof msgNo === 'number') {
            text = Utils.getMessage(msgNo)
        }
        else {
            text = msgNo;
        }
        this.showMessageBox({
            text: text,
            buttons: options,
            messageboxType: WKLMessageboxTypes.question,
            onClose: callback
        });
    }
}