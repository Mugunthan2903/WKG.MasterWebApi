import * as cntrl from '../../../wkl-components';
import { Utils, WkgUtils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";

export default class SSM019VM extends cntrl.VMBase {
    constructor(props) {
        super(props);
        this._WebApi = 'SSM010';

        this.init();
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;

        model.FormID = "SSM019";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;

        model.SsmId = this.props.data.SSM_ID;
        model.Sec_tm_ot = "";
        model.At_cls_sec = "";
        model.Onl_mil_sec = "";
        model.Onl_chk_sec = "";
        model.Ptym_wt_min = "";
        model.Barcd_Rtry = "";
        model.Barcd_Rtry_list = [];
        model.Ptym_dvsc_lco = null;
        model.Enabled_apis = [];
        model.Enabled_apiname = "";
        model.Enabled_apiId = '';
        model.Enabled_lang = [];
        model.Enabled_langname = "";
        model.Enabled_langId = "";
        model.Gmp_Ky = "";
        model.Gmp_Sty_Id = "";
        model.ftp_url = "";
        model.ftp_uid = "";
        model.ftp_pwd = "";
        model.Theme = {};
        model.GmapCountryCode = {};
        model.ModifiedOn = "";
        model.ModifiedBy = null;
        model.IsEdit = false;

        model.GmapCountryCode_list = [];
        model.Theme_list = [];
        model.Theme_Default = [];
        model.Ptym_dvsc_lco_list = [];
        model.Enabled_apis_listTemp = [];
        model.Lang_List = [];

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
        Utils.ajax({ url: `${this._WebApi}/SSM019OnloadSSMAsync`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                if (r) {
                    let configData = null;

                    model.Enabled_apis = [];
                    model.Enabled_lang = [];
                    model.Enabled_apis_listTemp = r.ApiEnableItem.map((data) => ({ ID: data.supp_map_id, Text: data.supp_nam }));
                    model.Lang_List = r.LangItems.map((data) => ({ ID: data.lang_cd_mast, Text: data.lang_nam_mast }));
                    model.GmapCountryCode_list = r.GmapCountryCodeList;
                    model.Theme_Default = r.ThemeList;
                    model.Barcd_Rtry_list = this.buildBarcdRtryList();
                    model.Ptym_dvsc_lco_list = r.PaymentDeviceLocation;
                    if (r.SSMAppConfig) {
                        configData = r.SSMAppConfig;
                        model.Gmp_Ky = configData.gmap_key;
                        model.Gmp_Sty_Id = configData.gmap_styl_id;
                        model.ftp_url = configData.ftp_url;
                        model.ftp_uid = configData.ftp_uid;
                        model.ftp_pwd = configData.recordExists ? WkgUtils.getDecode(configData.ftp_pwd) : configData.ftp_pwd;
                        model.Sec_tm_ot = configData.ssn_tmout_scnd;
                        model.At_cls_sec = configData.auto_cls_tmout_scnd;
                        model.Onl_mil_sec = configData.onln_tmout_mscnd;
                        model.Onl_chk_sec = configData.onln_chck_intrvl_mscnd;
                        model.Ptym_wt_min = configData.pay_wt_mnts;
                        model.Barcd_Rtry = model.Barcd_Rtry_list.find((data) => (data.ID === configData.barcd_rtry)) || null;
                        model.Ptym_dvsc_lco = r.PaymentDeviceLocation.find((data) => (data.ID === configData.pay_dvc_loc)) || null;
                        model.ModifiedBy = configData.mod_by_usr_cd || "";
                        model.ModifiedOn = configData.mod_dttm || null;
                        model.IsEdit = configData.recordExists;
                    }
                    this.setEnabledApis(r.apis_enbld);
                    this.setEnabledLangs(r.lang_cd);
                    model.GmapCountryCode = r.GmapCountryCodeList.find((data) => (data.ID === r.pos_cntry_cd));
                    me.fetchThemeJson().then(themeArray => {
                        if (themeArray) {
                            model.Theme_list = themeArray.map((data) => ({ ID: data.ThemeName, Text: data.ThemeName }));
                            model.Theme = model.Theme_list.find((data) => (data.ID === configData?.theme_nam)) || model.Theme_list[0];
                        }
                        else {
                            model.Theme_list = model.Theme_Default;
                            model.Theme = model.Theme_list.find((data) => (data.ID === configData?.theme_nam)) || model.Theme_list[0];
                        }
                        const dataCopyEx2 = this.getData();
                        model.DataCopy = JSON.stringify(dataCopyEx2);
                        me.updateUI();
                    });
                }
            }
            catch (ex) {
                console.log(ex);
                if (ex && ex.message)
                    this.showAlert(ex.message);
            }
            finally {
                const dataCopyEx = this.getData();
                model.DataCopy = JSON.stringify(dataCopyEx);
                me.updateUI();
            }
        });
    }
    async fetchThemeJson() {
        let params = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        try {
            const response = await fetch(`${process.env.PUBLIC_URL}/json/theme.json`, params);
            if (!response.ok) {
                throw new Error('Error fetching theme.json');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.log("ERROR:", error);
            if (error && error.message)
                this.showAlert(error.message);
            return null;
        } finally { }
    }
    buildBarcdRtryList() {
        return Array.from({ length: 5 }, (_, i) => ({ ID: i + 1, Text: `${i + 1}` }));
    }
    setEnabledApis(value) {
        const model = this.Data;
        if (value !== null && value !== '') {
            value = value.split(',');
            value.forEach((id) => { model.Enabled_apis.push(model.Enabled_apis_listTemp.find(i => i.ID === id)) });
            model.Enabled_apis = model.Enabled_apis.filter(api => api !== undefined);
            model.Enabled_apiname = model.Enabled_apis.map(item => item.Text).join(',');
            model.Enabled_apiId = model.Enabled_apis.map(item => item.ID).join(',');
        }
        else {
            model.Enabled_apis = [];
        }

        this.updateUI();
    }

    setEnabledLangs(value) {
        const model = this.Data;
        if (value !== null && value !== '') {
            value = value.split(',');
            value.forEach((id) => { model.Enabled_lang.push(model.Lang_List.find(i => i.ID === id)) });
            model.Enabled_lang = model.Enabled_lang.filter(api => api !== undefined);
            model.Enabled_langname = model.Enabled_lang.map(item => item.Text).join(',');
            model.Enabled_langId = model.Enabled_lang.map(item => item.ID).join(',');
        }
        else {
            model.Enabled_lang = [];
        }
        this.updateUI();
    }
    newMode() {
        const model = this.Data;
        model.Sec_tm_ot = "";
        model.At_cls_sec = "";
        model.Onl_mil_sec = "";
        model.Onl_chk_sec = "";
        model.Ptym_wt_min = "";
        model.Barcd_Rtry = "";
        model.Ptym_dvsc_lco = null;
        model.Gmp_Ky = "";
        model.Gmp_Sty_Id = "";
        model.Theme = null;
        model.ftp_url = "";
        model.ftp_uid = "";
        model.ftp_pwd = "";
        const dataCopyEx = this.getData();
        model.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();
    }

    getData() {
        const model = this.Data;
        const dataInfo = {};
        dataInfo.ssm_id = model.SsmId;
        dataInfo.ssn_tmout_scnd = model.Sec_tm_ot;
        dataInfo.auto_cls_tmout_scnd = model.At_cls_sec;
        dataInfo.onln_tmout_mscnd = model.Onl_mil_sec;
        dataInfo.onln_chck_intrvl_mscnd = model.Onl_chk_sec;
        dataInfo.pay_wt_mnts = model.Ptym_wt_min;
        dataInfo.barcd_rtry = model.Barcd_Rtry ? model.Barcd_Rtry.ID : null;
        if (!Utils.isNullOrEmpty(model.Ptym_dvsc_lco)) {
            dataInfo.pay_dvc_loc = model.Ptym_dvsc_lco.ID;
        }
        dataInfo.gmap_key = model.Gmp_Ky;
        dataInfo.gmap_styl_id = model.Gmp_Sty_Id;
        dataInfo.theme_nam = model.Theme?.ID;
        dataInfo.ftp_url = model.ftp_url;
        dataInfo.ftp_uid = model.ftp_uid;
        dataInfo.ftp_pwd = WkgUtils.getEncode(model.ftp_pwd);

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
        if (Utils.isNullOrEmpty(model.Sec_tm_ot)) {
            this.showAlert('Enter Session timeout Seconds', 'Sec_tm_ot');
            return false;
        }
        if (Utils.isNullOrEmpty(model.At_cls_sec)) {
            this.showAlert('Enter Auto close timeout Seconds', 'At_cls_sec');
            return false;
        }
        if (Utils.isNullOrEmpty(model.Onl_mil_sec)) {
            this.showAlert('Enter Online timeout Milliseconds', 'Onl_mil_sec');
            return false;
        }
        if (Utils.isNullOrEmpty(model.Onl_chk_sec)) {
            this.showAlert('Enter Online check interval Milliseconds', 'Onl_chk_sec');
            return false;
        }
        if (Utils.isNullOrEmpty(model.Ptym_wt_min)) {
            this.showAlert('Enter Payment wait Minutes', 'Ptym_wt_min');
            return false;
        }
        if (Utils.isNullOrEmpty(model.Ptym_dvsc_lco)) {
            this.showAlert('Please Select Payment Device Location', 'Ptym_dvsc_lco');
            return false;
        }
        if (Utils.isNullOrEmpty(model.Gmp_Ky)) {
            this.showAlert('Enter Gmap Key', 'Gmp_Ky');
            return false;
        }
        if (Utils.isNullOrEmpty(model.Gmp_Sty_Id)) {
            this.showAlert('Enter Gmap Style Id', 'Gmp_Sty_Id');
            return false;
        }
        if (Utils.isNullOrEmpty(model.Theme)) {
            this.showAlert('Please Select Theme', 'Theme');
            return false;
        }
        if (Utils.isNullOrEmpty(model.ftp_url)) {
            this.showAlert('Enter Ftp Url', 'ftp_url');
            return false;
        }
        if (Utils.isNullOrEmpty(model.ftp_uid)) {
            this.showAlert('Enter Ftp User Id', 'ftp_uid');
            return false;
        }
        if (Utils.isNullOrEmpty(model.ftp_pwd)) {
            this.showAlert('Enter Ftp Password', 'ftp_pwd');
            return false;
        }

        return true;
    }

    handleSave(e) {
        const me = this;
        const model = this.Data;
        if (this.isValueChanged()) {
            this.doSave(e);
        }
        else {
            if (model.IsEdit && !Utils.isNullOrEmpty(model.Sec_tm_ot)) {
                me.showAlert("No changes has been made.", 'Sec_tm_ot');
            }
            else {
                this.Checkfields();
            }

        }
    }

    doSave() {
        if (this.Checkfields()) {
            const me = this;
            const model = this.Data;
            const dataInfo = this.getData();
            dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
            dataInfo.recordExists = model.IsEdit;
            model.Loading = true;
            me.updateUI();
            Utils.ajax({ url: `${this._WebApi}/SSM019SSMSaveAsync`, data: dataInfo }, r => {
                try {
                    model.Loading = false;
                    r = r || {};
                    if (r.IsSuccess === true) {
                        model.IsSaved = true;
                        me.handleSaveFollowup();
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
    handleSaveFollowup() {
        const me = this;
        me.showAlert('Data saved successfully');
        this.close();
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
        model.Title = `${this.props.data.Grp_Name} / Additional Config / ${this.props.data.SSM_ID}`;
    }
}