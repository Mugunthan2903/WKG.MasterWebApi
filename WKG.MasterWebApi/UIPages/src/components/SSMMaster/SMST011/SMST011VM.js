import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import * as cntrl from "../../../wkl-components";

export default class SMST011VM extends VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'SMST010';
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.MultiSelectList = null;
        model.FormID = "SMST011";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.Input = {
            groupName_C: null,
            Refresh_Type_C: 1,
            Schedule_Date_C: null,
        };
        model.groupNamesListC = null;
        this.newMode();
    }
    newMode() {
        const model = this.Data;
        model.Input.ID = 0;
        model.Input.groupName_C = null;
        model.Input.Refresh_Type_C = 1;
        model.Input.Schedule_Date_C = null;
        this.setFocus('groupName_C');
        this.setTitle();
        var dataCopyEx = this.getData();
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();
    }
    loadInitData() {
        const me = this;
        const model = this.Data;
        const dataInfo = {};
        model.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SMST010InitLoadDataConfigAsync`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                model.groupNamesListC = r.map(e => ({ ID: e.pos_grp_id, Text: e.pos_grp_nam }));
            }
            catch (ex) { }
            finally {
                me.updateUI();
            }
        });
        // this.setFocus("groupName_C");
    }
    handleDataChange() {
        const me = this;
        const model = this.Data;
        if (this.isValueChanged()) {
            let options = [{ text: 'Yes' }, { text: 'No' }, { text: 'Cancel' }];
            this.showMessageBox({
                text: "Do you want to save the current data ?",
                buttons: options,
                messageboxType: WKLMessageboxTypes.info,
                onClose: (_e) => {
                    if (_e === 0) {
                        me.handleSave(1);
                        me.setFocus('groupName_C');
                    } else if (_e === 1) {
                        me.newMode();
                        me.setFocus('groupName_C');
                    }
                }
            });
        } else {
            me.newMode();
        }
    }
    handleSave(e) {
        const model = this.Data.Input;
        const me = this;
        if (this.isRequiredFieldsEmpty()) {
            const opts = {
                text: "",
                messageboxType: WKLMessageboxTypes.info,
                onClose: (_e) => {
                    if (model.groupName_C === null) {
                        if (_e === 10) return;
                        me.setFocus("groupName_C");
                        me.updateUI();
                    } else if ((model.Refresh_Type_C === 1 || model.Refresh_Type_C === 3) && model.Schedule_Date_C === null) {
                        if (_e === 10) return;
                        me.setFocus("Schedule_Date_C");
                        me.updateUI();
                    }
                }
            };
            if (model.groupName_C === null) {
                opts.text = "Please Enter Group Name";
            } else if ((model.Refresh_Type_C === 1 || model.Refresh_Type_C === 3) && model.Schedule_Date_C === null) {
                opts.text = "Please Enter Schedule Date";
            }
            this.showMessageBox(opts);
            return;
        }
        if (!this.isValueChanged()) {
            const opts = {
                text: "Existing Data Conflict!",
                messageboxType: WKLMessageboxTypes.info,
                onClose: (_e) => {
                    me.setFocus("groupName_C");
                }
            };
            this.showMessageBox(opts);
            return;
        }
        let tomorrow = new Date();
        if (model.Refresh_Type_C === 1 || model.Refresh_Type_C === 3) {
            tomorrow = new Date(model.Schedule_Date_C);
            tomorrow.setDate(model.Schedule_Date_C?.getDate() + 1);
        }
        const dataInfo = {
            pos_grp_id: model.groupName_C.ID,
            refresh_type: model.Refresh_Type_C,
            schedule_date: tomorrow.toISOString(),
            mod_by_usr_cd: ApiManager.getUser().ID,
        }
        Utils.ajax({ url: `${this._WebApi}/SMST010SaveConfigDataAsync`, data: dataInfo }, (r) => {
            if (r.IsSuccess) {
                const opts = {
                    text: "Data Saved Successfully",
                    messageboxType: WKLMessageboxTypes.info,
                    onClose: (_e) => {
                        if (e === 5) return;
                        me.newMode();
                        me.setFocus("groupName_C");
                    }
                };
                this.showMessageBox(opts);

            } else {
                const opts = {
                    text: "Something went Wrong",
                    messageboxType: WKLMessageboxTypes.info,
                    onClose: (_e) => {
                    }
                };
                this.showMessageBox(opts);
            }
        });
    }
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    setTitle() {
        const model = this.Data;
        model.Title = `${this.props.data.Title} / Edit`;
    }
    getData() {
        const model = this.Data.Input;
        const dataInfo = {};
        dataInfo.groupName_C = model.groupName_C;
        dataInfo.Refresh_Type_C = model.Refresh_Type_C;
        dataInfo.Schedule_Date_C = model.Schedule_Date_C;
        return dataInfo;
    }
    isRequiredFieldsEmpty() {
        const model = this.Data.Input;
        if (model.groupName_C === null) {
            return true;
        } else if ((model.Refresh_Type_C === 1 || model.Refresh_Type_C === 3) && model.Schedule_Date_C === null) {
            return true;
        }
        return false;
    }
    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    doClose() {
        const me = this;
        if (this.isValueChanged()) {
            let options = [{ text: 'Yes' }, { text: 'No' }];
            this.showMessageBox({
                text: "Do you want to Discard the changes?",
                buttons: options,
                messageboxType: WKLMessageboxTypes.info,
                onClose: (_e) => {
                    if (_e === 0) {
                        me.close();
                    }
                }
            });
        }
        else {
            this.close()
        }
    }
}