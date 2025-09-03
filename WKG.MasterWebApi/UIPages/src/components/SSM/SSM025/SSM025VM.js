import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import * as cntrl from "../../../wkl-components";

export default class SSM025VM extends VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'SSM020';
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.FormID = "SSM025";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.SuppMapID = this.props.data.SuppMapID;
        model.Input = {
            Lang_SNO: 0,
            Prod_ID: this.props.data.Prod_ID,
            Props_Prod_Name: this.props.data.Prod_Name,
            Prod_Name: '',
            Language: null,
            ModifiedOn: null,
            ModifiedBy: "",
            IsEdit: this.props.data.IsEdit,
        };

        model.Props_Data = this.props.data.InputData;
        this.newMode();

    }
    newMode(flag = false) {
        const model = this.Data.Props_Data;
        const dataModel = this.Data.Input;
        dataModel.Lang_SNO = 0;
        dataModel.Props_Prod_Name = this.props.data.Prod_Name;
        dataModel.Prod_ID = this.props.data.Prod_ID;
        dataModel.Prod_Name = '';

        if (flag === true) {
            dataModel.IsEdit = false;
            dataModel.Language = null;
        }
        else {
            dataModel.IsEdit = this.props.data.IsEdit;
            if (dataModel.IsEdit) {
                dataModel.Language = model.lang_cd;
            }
        }
        dataModel.ModifiedOn = null;
        dataModel.ModifiedBy = "";

        this.setFocus('Language');
        this.setTitle();
        var dataCopyEx = this.getData();
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();

    }
    getData() {
        const model = this.Data.Input;
        const dataModel = this.Data;
        const dataInfo = {};

        dataInfo.lang_srl = model.Lang_SNO;
        dataInfo.prod_id = this.props.data.Prod_ID;
        dataInfo.supp_map_id = dataModel.SuppMapID;
        if (!Utils.isNullOrEmpty(model.Language)) {
            dataInfo.lang_cd = model.Language.ID;
        }
        dataInfo.prod_nam = model.Prod_Name;


        return dataInfo;
    }
    loadInitData() {

        const me = this;
        const model = this.Data;
        const Props = this.Data.Props_Data;
        const dataInfo = {};
        dataInfo.prod_id = model.Input.Prod_ID;
        dataInfo.lang_cd = model.Input.Language;
        dataInfo.supp_map_id = model.SuppMapID;
        model.Loading = true;
        model.AllSelected = false;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM025Newseconloadcmb`, data: dataInfo, files: [] }, (r) => {
            try {
                model.Loading = false;
                model.LanguageList = r.Lng_cmb_rslt.map((data) => ({ ID: data.lang_cd, Text: data.lang_nam }));

                if (model.Input.IsEdit) {
                    if (r.Nwrsltsec.length !== 0) {
                        const info = r.Nwrsltsec[0];
                        this.setLangauge(info.lang_cd);
                        model.Input.Prod_Name = info.prod_nam;
                        model.Input.Prod_ID = info.prod_id;
                        model.Input.Lang_SNO = info.lang_srl;
                        model.Input.ModifiedOn = info.mod_dttm;
                        model.Input.ModifiedBy = info.mod_by_usr_cd;
                    }
                }
            }
            catch (ex) {
                console.log(ex);
            }
            finally {
                var dataCopyEx = this.getData();
                this.Data.DataCopy = JSON.stringify(dataCopyEx);
                me.updateUI();
            }
        });
    };

    setLangauge(value) {
        const model = this.Data;

        if (value !== null && value !== '') {
            model.Input.Language = model.LanguageList.find(i => i.ID === value);
        }
        else {
            model.Input.Language = null;
        }
        for (const itm of model.LanguageList) {
            itm.isSelected = false;
        }
        this.updateUI();
    }
    onBlurSrch() {
        const me = this;
        const model = this.Data;
        const dataInfo = {};
        dataInfo.prod_id = model.Input.Prod_ID;
        dataInfo.supp_map_id = model.SuppMapID;
        if (!Utils.isNullOrEmpty(model.Input.Language)) {
            dataInfo.lang_cd = model.Input.Language.ID;
        }

        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM025OnBlurSearch`, data: dataInfo, files: [] }, (r) => {
            try {
                r = r || {};
                if (r.Isavailable === true) {
                    me.handleModified(r.Nwrsltsec[0]);
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

    handleModified(data) {
        const model = this.Data;
        const me = this;
        this.showConfirmation("Record already exists.Do you want to retrieve?", false, (e) => {
            if (e == 0) {
                model.Input.IsEdit = true;
                model.Input.Prod_ID = data.prod_id;
                model.Input.Language = data.lang_cd;
                me.loadInitData();
                me.setTitle();

            }
            else if (e == 1) {
                model.Input.Language = null;
                this.setFocus('Language');
            }

        });
    }

    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }

    handleDataChange() {
        const me = this;
        const model = this.Data;
        if (this.isValueChanged()) {
            this.showConfirmation("Unsaved changes exists. Save and proceed.", false, (_e) => {
                try {
                    if (_e === 0) {
                        Utils.invokeAction({
                            owner: this,
                            formID: model.FormID,
                            controlID: model.IsEdit ? 'btn_edit' : 'btn_new',
                            callback: (e) => {
                                e = e || {};
                                me.doSave(e);
                            }
                        });
                    }
                    else if (_e === 1) {
                        this.newMode(true);
                    }
                }
                catch (ex) { }
                finally { }
            });
        }
        else {
            this.newMode(true);
        }
    }

    isvalidSave(e) {
        const model = this.Data.Input;
        if (Utils.isNullOrEmpty(model.Language)) {
            this.showAlert('Please Select Language', 'Language');
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
            if (model.Input.IsEdit) {
                me.showAlert("No changes has been made.", 'Prod_Name');
            }
            else {
                me.showAlert("Please Enter required fields.", 'Language');
            }

        }
    }
    doSave(e) {
        if (this.isvalidSave(e)) {
            const me = this;
            const model = this.Data;
            const dataInfo = this.getData();
            dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
            dataInfo.Savedata = model.Input.IsEdit === true ? "STMWUPDATE" : "STMWINSERT";
            model.Loading = true;
            me.updateUI();
            Utils.ajax({ url: `${this._WebApi}/SSM024SaveDataSectionconfigandimg`, data: dataInfo }, r => {
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
        me.showAlert('Data saved successfully');
        this.close();
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

        if (model.Input.IsEdit) {
            model.Title = `${this.props.data.Prod_Name} / Edit `;
        }
        else {
            model.Title = `${this.props.data.Prod_Name} / New `;
        }
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