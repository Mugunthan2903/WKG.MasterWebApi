import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import * as cntrl from '../../../wkl-components';

export default class SSM017VM extends VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'SSM010';
    }
    //initializing model object
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.FormID = "SSM017";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.pos_grp_id = this.props.data.Grp_ID;
        model.DefaultCarTpye= this.props.data.InputData;
        model.Input = {
            Postcode: "",
            Car_Tpy: model.DefaultCarTpye.Hybrid,
            Default_Airport: false,
            Default_Hotel: false,
            Eshuttle: true,
            Status: true,
            Modifiedby: "",
            Modifiedon: null,
        };
        model.IsEdit = false;
        model.SearchInput = {
            PostcodeSrch: "",
            Car_Tpy_Srch: model.DefaultCarTpye.Hybrid,
            //StatusSrch: true
        };
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 5 };
        model.GridInfo.Columns = [
            { text: 'Postcode', field: 'post_cd', width: '20%' },
            { text: 'Car Type', field: 'car_typ', width: '15%' },
            { text: 'Default Airport', field: 'dflt_arpt', width: '20%' },
            { text: 'Default Hotel', field: 'dflt_htl', width: '15%' },
            { text: 'Eshuttle', field: 'eshuttle', width: '15%' },
            { text: 'Status', field: 'act_inact_ind', width: '15%' },

        ];

        this.newMode();
    }
    newMode() {
        const model = this.Data;
        model.IsEdit = false;
        model.Input = {
            Postcode: "",
            Car_Tpy: model.DefaultCarTpye.Hybrid,
            Default_Airport: false,
            Default_Hotel: false,
            Eshuttle: true,
            Status: true,
            Modifiedby: "",
            Modifiedon: null,
        };
        this.setTitle();
        this.setFocus("Postcode");
        var dataCopyEx = this.getData();
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();
    }
    getMaxWindowHeight() {
        const model = this.Data;
        const gridFooter = document.querySelector(`.${model.FormID}`);
        const windowButtonArea = document.querySelector('.window-button-area');
        if (!gridFooter || !windowButtonArea) {
            return null;
        }
        const rectGridFooter = gridFooter.getBoundingClientRect();
        const rectWindowButtonArea = windowButtonArea.getBoundingClientRect();
        const distance = rectWindowButtonArea.top - rectGridFooter.bottom;
        return distance;
    }
    adjustPageSize() {
        const model = this.Data;
        var maxHeight = this.getMaxWindowHeight();
        var rowHeight = 27;
        var rowsPerPage = Math.floor(maxHeight / rowHeight);
        model.GridInfo.PageSize += rowsPerPage;
    }
    getData() {
        const dataModel = this.Data;
        const model = this.Data.Input;
        const dataInfo = {};
        dataInfo.pos_grp_id = dataModel.pos_grp_id;
        dataInfo.post_cd = model.Postcode.replaceAll(' ', '');
        dataInfo.car_typ = model.Car_Tpy;
        dataInfo.dflt_arpt = model.Default_Airport === true ? 1 : 0;
        dataInfo.dflt_htl = model.Default_Hotel === true ? 1 : 0;
        dataInfo.eshuttle = model.Eshuttle === true ? 1 : 0;
        dataInfo.act_inact_ind = model.Status === true ? 1 : 0;

        return dataInfo;
    }
    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    loadInitData() {
        this.adjustPageSize();
        this.loadPage(1);
    }
    onBlurSrch() {
        const me = this;
        const model = this.Data;
        const dataModel = this.Data.Input;
        const dataInfo = {};
        dataInfo.pos_grp_id = model.pos_grp_id;
        dataInfo.car_typ = dataModel.Car_Tpy;
        dataInfo.post_cd = dataModel.Postcode.replaceAll(' ', '');
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM017BlurSrchAsync`, data: dataInfo, files: [] }, (r) => {
            try {
                r = r || {};
                if (r.Isavailable === true) {
                    me.handleModified(r);
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
                me.loadSelectedData(data, true);
                me.setTitle();
            }
            else if (e == 1) {
                model.Input.Postcode = "";
                this.setFocus('Postcode');
            }

        });
    }

    handleSearchClear() {
        const me = this;
        me.doSearchClear(true);
    }
    doSearchClear(clearAll = false) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        if (clearAll === true) {
            model.SearchInput.PostcodeSrch = '';
            model.SearchInput.Car_Tpy_Srch = model.DefaultCarTpye.Hybrid;
            this.setFocus('PostcodeSrch');
            this.setTitle();
        }
        gridInfo.Items = [];
        gridInfo.SelectedItem = null;
        gridInfo.Page = 1;
        gridInfo.TotalPage = 1;
        gridInfo.TotalCount = 0;
        this.updateUI();
    }
    handleSearch(pageIndex) {
        this.loadPage(pageIndex);
    }
    loadPage(pageIndex) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.PageNo = pageIndex;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.pos_grp_id = model.pos_grp_id;
        dataInfo.post_cd = model.SearchInput.PostcodeSrch;
        dataInfo.car_typ = model.SearchInput.Car_Tpy_Srch;
        //dataInfo.act_inact_ind = model.SearchInput.StatusSrch === true ? 1 : 0;
        model.Loading = true;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM017GetOnloadSrchAsync`, data: dataInfo, files: [] }, (r) => {
            try {
                model.Loading = false;                
                me.fillSearchResult(r || {}, selectedItem);
            }
            catch (ex) {
                console.log(ex);
            }
            finally {
                me.updateUI();
            }
        });
    }
    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.Items.map((data) => {

            if (data.car_typ === "B") {
                data.car_typ = "Hybrid"
            }
            else {
                data.car_typ = "Eshuttle"
            }
            if (data.dflt_arpt === "True") {
                data.dflt_arpt = "Yes"
            }
            else {
                data.dflt_arpt = "No"
            }
            if (data.dflt_htl === "True") {
                data.dflt_htl = "Yes"
            }
            else {
                data.dflt_htl = "No"
            }
            if (data.eshuttle === "True") {
                data.eshuttle = "Yes"
            }
            else {
                data.eshuttle = "No"
            }
            if (data.act_inact_ind === "True") {
                data.act_inact_ind = "Active"
            }
            else {
                data.act_inact_ind = "Inactive"
            }
            return data;

        }) || [];
        gridInfo.Page = r.CurrentPage || 0;
        gridInfo.TotalPage = r.TotalPages || 0;
        gridInfo.TotalCount = r.TotalRecords || 0;
        if (gridInfo.Items.length > 0) {
            if (selectedItem !== undefined && selectedItem !== null) {
                selectedItem = gridInfo.Items.first(i => i.ID == selectedItem.ID);
            }
            if (selectedItem === null)
                selectedItem = gridInfo.Items[0];
        }

        if (selectedItem != null)
            selectedItem.isSelected = true;
        gridInfo.SelectedItem = selectedItem;
    }
    handleDataChange(selectedItem) {
        const me = this;
        const model = this.Data.Input;
        if (selectedItem) {
            if (selectedItem.post_cd === model.Postcode && (selectedItem.car_typ === 'Hybrid' ? "B" : "E") === model.Car_Tpy) {
                return;
            }
            else {
                if (this.isValueChanged()) {
                    this.showConfirmation("Unsaved changes exists. Save and proceed.", false, (e) => {
                        try {
                            if (e === 0) {
                                me.doSave();
                            }
                            else if (e === 1) {
                                me.setSelectedItem(selectedItem, true);
                                me.setFocus('');
                            }
                        }
                        catch (ex) {

                        }
                        finally { }
                    });
                }
                else {
                    this.setSelectedItem(selectedItem, true);
                    me.setFocus('');
                }
            }
        }
        else {
            if (this.isValueChanged()) {
                this.showConfirmation("Unsaved changes exists. Save and proceed.", false, (e) => {
                    try {
                        if (e == 0) {
                            me.Data.IsEdit = true;
                            me.doSave();
                            //me.newMode();
                        }
                        else if (e === 1) {
                            me.newMode();
                        }
                    }
                    catch (ex) {

                    }
                    finally { }
                });
            } else {
                me.newMode();
            }
        }
    }
    setSelectedItem(selectedItem, loadData = false) {
        const model = this.Data;
        model.GridInfo.SelectedItem = selectedItem;
        model.GridInfo.SelectedItem.isSelected = true;
        if (loadData === true)
            this.loadSelectedData(selectedItem);
    }
    loadSelectedData(selectedItem, onblur = false) {
        const me = this;
        const model = this.Data.Input;
        const dataInfo = {};
        dataInfo.post_cd = selectedItem.post_cd;
        if (onblur) {
            dataInfo.car_typ = selectedItem.car_typ;
        }
        else {
            dataInfo.car_typ = selectedItem.car_typ === "Hybrid" ? "B" : "E";
        }
        dataInfo.pos_grp_id = this.Data.pos_grp_id;
        me.Data.Loading = true;
        Utils.ajax({ url: `${this._WebApi}/SSM017GetSelectDataAsync`, data: dataInfo }, (r) => {
            try {
                if (r) {
                    me.Data.Loading = false;
                    console.log('Items : ', r);
                    r = r.Items[0];
                    model.Postcode = r.post_cd;
                    model.Car_Tpy = r.car_typ;
                    model.Default_Airport = r.dflt_arpt.toUpperCase() === "TRUE";
                    model.Default_Hotel = r.dflt_htl.toUpperCase() === "TRUE";
                    model.Eshuttle = r.eshuttle.toUpperCase() === "TRUE";
                    model.Status = r.act_inact_ind.toUpperCase() === "TRUE";
                    model.Modifiedby = r.mod_by_usr_cd;
                    model.Modifiedon = r.mod_dttm;
                    me.Data.IsEdit = true;
                    me.setTitle();
                    let dataCopyEx = me.getData();
                    me.Data.DataCopy = JSON.stringify(dataCopyEx);
                    me.updateUI();
                }
                else {
                    model.Postcode = "";
                    model.Car_Tpy = model.DefaultCarTpye.CarType;
                    model.Default_Airport = false;
                    model.Default_Hotel = false;
                    model.Eshuttle = true;
                    model.Status = true;
                    model.Modifiedby = "";
                    model.Modifiedon = null;
                    me.Data.IsEdit = true;
                }
            }
            catch (ex) {
                console.log(ex)
            }
            finally {
                this.updateUI();
            }
        });
        this.updateUI();
    }
    handleSave(e) {
        const me = this;
        const model = this.Data;
        if (this.isValueChanged()) {
            this.doSave(e);
        }
        else {
            if (model.IsEdit) {
                me.showAlert("No changes has been made.");
            }
            else {
                me.showAlert("Please Enter required fields.", 'Postcode');
            }

        }
    }
    isvalidSave(e) {
        const model = this.Data.Input;
        if (Utils.isNullOrEmpty(model.Postcode)) {
            this.showAlert('Please Enter Postcode', 'Postcode');
            return false;
        }
        if (Utils.isNullOrEmpty(model.Car_Tpy)) {
            this.showAlert('Please Enter Car Type', '');
            return false;
        }
        return true;
    }
    doSave(e) {
        if (this.isvalidSave(e)) {
            const me = this;
            const model = this.Data;
            const dataInfo = this.getData();
            dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
            dataInfo.Mode = model.IsEdit === true ? "UPDATE" : "SAVE";
            model.Loading = true;
            me.updateUI();
            Utils.ajax({ url: `${this._WebApi}/SSM017SaveDeleteDataAsync`, data: dataInfo }, r => {
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
                catch (ex) {
                    console.log(ex);
                }
                finally {
                    me.updateUI();
                }
            });
        }
    }
    handleSaveFollowup(e) {
        const me = this;
        const model = this.Data;
        let pageNo = model.GridInfo.Page;
        me.showAlert('Data saved successfully', 'Postcode');
        this.loadPage(pageNo);
        me.newMode();
    }
    handleDelete() {
        const model = this.Data.Input;
        const dataModel = this.Data;
        const gridInfo = dataModel.GridInfo;
        const me = this;
        this.showConfirmation("Are you sure you want to delete this record?", false, (e) => {
            if (e === 0) {
                const dataInfo = this.getData();
                dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
                dataInfo.Mode = "DELETE";
                me.Data.Loading = true;
                Utils.ajax({ url: `${this._WebApi}/SSM017SaveDeleteDataAsync`, data: dataInfo }, (r) => {
                    if (r && r.IsSuccess) {
                        me.Data.Loading = false;
                        //me.showAlert('Data Removed Successfully');
                        const opts = {
                            text: "Data Removed Successfully",
                            messageboxType: WKLMessageboxTypes.info,
                            onClose: (_e) => {
                                me.Data.GridInfo.SelectedItem = null;
                                me.loadPage(me.Data.GridInfo.Page);
                                me.newMode();
                            }
                        };
                        me.showMessageBox(opts);
                        // gridInfo.SelectedItem = null;
                        // me.loadPage(gridInfo.Page);
                        // me.newMode();
                    } else {
                        me.Data.Loading = false;
                        me.showAlert('Something went Wrong');
                    }
                });
            }

        });
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
        this.handleValueChange(() => this.close());
    }
    setTitle() {
        const model = this.Data;
        if (model.IsEdit)
            model.Title = `${this.props.data.Grp_Name} / Transfer Config / Edit / ${model.Input.Postcode}`;
        else
            model.Title = `${this.props.data.Grp_Name} / Transfer Config / New`;
    }
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    showConfirmation(msg, isThreeOption, callback) {
        let options = [{ text: 'Yes' }, { text: 'No' }];
        if (isThreeOption)
            options = [{ text: 'Yes' }, { text: 'No' }, { text: 'Cancel' }];

        this.showMessageBox({
            text: msg,
            buttons: options,
            messageboxType: WKLMessageboxTypes.info,
            onClose: callback
        });
    }
    showAlert(errorMsg, name, msgType = WKLMessageboxTypes.error) {
        console.log('show alert');
        if (typeof errorMsg === 'number') {
            console.log('show alert');
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
}