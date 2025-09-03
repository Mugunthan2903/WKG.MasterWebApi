import * as cntrl from '../../../wkl-components';
import { Utils, WkgUtils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";

export default class SSM015VM extends cntrl.VMBase {
    constructor(props) {
        super(props);
        this._WebApi = 'SSM010';

        this.init();
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;

        model.FormID = "SSM015";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;

        model.SsmId = this.props.data.SSM_ID;
        model.Poscode = this.props.data.Poscd;
        model.Api_key = null;
        model.SignalRApi_key = null;
        model.DataApi_key = null;
        model.ssm_pwd = "";
        model.Img_dmn_path = "";
        model.Api_key_list = [];
        model.SignalRApi_key_list = [];
        model.DataApi_key_list = [];

        this.setTitle();
        this.updateUI();
    }
    loadInitData() {
        const me = this;
        const model = this.Data;
        const dataInfo = {};
        dataInfo.ssm_id = this.props.data.SSM_ID;
        dataInfo.pos_grp_id = this.props.data.Grp_ID;
        model.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM015ManageSSMAsync`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                if (r) {
                    model.ssm_pwd = r.ssm_pwd || '';
                    model.Img_dmn_path = r.Cntrlmst[0].img_dmn_path;
                    model.Api_key_list = r.Endpoint.filter(data => (data.end_pnt_typ === 'S' || data.end_pnt_typ === null)).map((data) => ({ ID: data.end_pnt_key, Text: data.end_pnt_nam, endpnturl: data.end_pnt_url }));
                    model.SignalRApi_key_list = r.Endpoint.filter(data => data.end_pnt_typ === 'N').map((data) => ({ ID: data.end_pnt_key, Text: data.end_pnt_nam, endpnturl: data.end_pnt_url }));
                    model.DataApi_key_list = r.Endpoint.filter(data => data.end_pnt_typ === 'D').map((data) => ({ ID: data.end_pnt_key, Text: data.end_pnt_nam, endpnturl: data.end_pnt_url }));
                }
            }
            catch (ex) {
                console.log(ex);
            }
            finally {
                const dataCopyEx = this.getData();
                model.DataCopy = JSON.stringify(dataCopyEx);
                me.updateUI();
            }
        });
    }
    newMode() {
        const model = this.Data;
        model.Api_key = null;
        model.SignalRApi_key = null;
        model.DataApi_key = null;
        //model.ssm_pwd = "";
        model.Img_dmn_path = "";
        const dataCopyEx = this.getData();
        model.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();
    }

    getData() {
        const model = this.Data;
        const dataInfo = {};
        dataInfo.Api_key = model.Api_key;
        dataInfo.SignalRApi_key = model.SignalRApi_key;
        dataInfo.DataApi_key = model.DataApi_key;
        dataInfo.ssm_pwd = model.ssm_pwd;
        dataInfo.Img_dmn_path = model.Img_dmn_path;

        return dataInfo;
    }

    isValueChanged() {
        const dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }

    handleDataChange() {
        const me = this;
        if (this.isValueChanged()) {
            this.showConfirmation("Unsaved changes exists. Save and proceed.", false, (e) => {
                if (e == 0) {
                    me.handleSave();
                }
                else {
                    me.newMode();
                }

            });
        }
        else {
            me.newMode();
        }
    }

    doClose() {
        const model = this.Data;
        const me = this;
        if (this.isValueChanged()) {
            this.showConfirmation("Do you want to Discard the changes?", false, (e) => {
                if (e == 0) {
                    this.close();
                }
            });
        }
        else {
            this.close();
        }

    }

    Checkfields() {
        const model = this.Data;
        if (Utils.isNullOrEmpty(model.Api_key)) {
            this.showAlert('Please Select API', 'Api_key');
            return false;
        }
        if (Utils.isNullOrEmpty(model.SignalRApi_key)) {
            this.showAlert("Please Select SignalR API", "SignalRApi_key");
            return false;
        }
        if (Utils.isNullOrEmpty(model.DataApi_key)) {
            this.showAlert("Please Select Data API", "DataApi_key");
            return false;
        }
        if (Utils.isNullOrEmpty(model.Img_dmn_path)) {
            this.showAlert('Enter Image Path', 'Img_dmn_path');
            return false;
        }

        return true;
    }
    handleSave() {
        if (this.Checkfields()) {
            const model = this.Data;
            const jsonData = {
                "Poscd": `${model.Poscode}`,
                "SSMId": `${model.SsmId}`,
                "api": `${model.Api_key.endpnturl}`,
                "api_key": `${model.ssm_pwd}`,
                "signalr_api": `${model.SignalRApi_key.endpnturl}`,
                "signalr_api_key": `${model.ssm_pwd}`,
                "data_api": `${model.DataApi_key.endpnturl}`,
                "data_api_key": `${model.ssm_pwd}`,
                "ImagePath": `${model.Img_dmn_path}`,
            };
            const winUrl = URL.createObjectURL(new Blob([JSON.stringify(jsonData)], { type: "application/json" }));
            let anchor = document.createElement("a");
            document.body.appendChild(anchor);
            anchor.href = winUrl;
            anchor.download = "ssm_config.json";
            anchor.click();
            window.setTimeout(() => {
                anchor.remove();
                window.URL.revokeObjectURL(winUrl);
            }, 100);
            this.close();
        }
    }
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
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
    setTitle() {
        const model = this.Data;
        model.Title = `${this.props.data.Grp_Name} / Generate Config / ${this.props.data.SSM_ID}`;
    }
}