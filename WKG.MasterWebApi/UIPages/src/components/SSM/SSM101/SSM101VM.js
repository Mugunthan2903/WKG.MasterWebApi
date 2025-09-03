import { data } from "jquery";
import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import * as cntrl from "../../../wkl-components";

export default class SSM101VM extends VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'SSM100';
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.MultiSelectList = null;
        model.FormID = "SSM101";
        model.SupplierMapID = this.props.data.SuppMapID;
        model.Loading = false
        model.DataCopy = null;
        model.Input = {
            City_ID: "",
            City_Name: "",
            WKG_City: null,
            Status: true,
            Modifiedon: null,
            Modifiedby: "",
            IsEdit: false,
        };
        model.SearchInput = {
            ScrhcityName: "",
            Status_Srch: true,
            city_avail_Srch: false,
            IsEdit: false,
        };
        model.AllSelected = false;
        model.GridInfo = {
            Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 5,
            Columns: [
                // { text: '', field: 'vntrt_city_cd', width: '5%' },
                { text: 'Name', field: 'vntrt_city_nam', width: '30%', sort: { enabled: true } },
                { text: 'Country Name', field: 'vntrt_cntry_nam', width: '30%' },
                { text: 'WKG City', field: 'wkg_city_nam', width: '30%' },
                { text: 'Status', field: 'act_inact_ind', width: '20%' },
                { text: 'Delisted ', field: 'vntrt_city_aval', width: '20%' },
            ]
        };
        this.newMode();
    }
    newMode() {
        const model = this.Data;
        const dataModel = this.Data.Input;
        model.ID = 0;
        dataModel.City_ID = "";
        dataModel.City_Name = "";
        dataModel.WKG_City = null;
        dataModel.Status = true;
        dataModel.Modifiedon = null;
        dataModel.Modifiedby = "";
        dataModel.IsEdit = false;
        this.setFocus('ScrhcityName');
        this.setTitle();
        var dataCopyEx = this.getData();
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();
    }

    getData() {
        const model = this.Data.Input;
        const dataModel = this.Data;
        const dataInfo = {};
        dataInfo.vntrt_city_cd = model.City_ID;
        dataInfo.vntrt_city_nam = model.City_Name;
        dataInfo.supp_map_id = dataModel.SupplierMapID;
        if (!Utils.isNullOrEmpty(model.WKG_City)) {
            dataInfo.wkg_city_cd = model.WKG_City?.ID;
        }
        dataInfo.act_inact_ind = model.Status === true ? 1 : 0;
        console.log('dataInfo ', dataInfo)
        return dataInfo;
    }
    isValueChanged() {
        const model = this.Data;
        if (model.Input.IsEdit) {
            var dataCopyEx = this.getData();
            return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
        }
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
    loadInitData() {
        this.adjustPageSize();
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.PageNo = 1;
        dataInfo.vntrt_city_nam = "";
        dataInfo.SortTyp = true;
        dataInfo.supp_map_id = model.SupplierMapID;
        dataInfo.vntrt_city_nam = model.SearchInput.ScrhcityName;
        dataInfo.act_inact_ind = model.SearchInput.Status_Srch;
        dataInfo.vntrt_city_aval = !model.SearchInput.city_avail_Srch;
        model.Loading = true;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM101GetCityOnload`, data: dataInfo, files: [] }, (r) => {
            try {
                model.Loading = false;
                if (r) {
                    me.fillSearchResult(r || {}, selectedItem);
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
    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.Items.map(e => ({
            ...e,
            act_inact_ind: e.act_inact_ind === true ? "Active" : "Inactive",
            vntrt_city_aval: e.vntrt_city_aval === true ? "No" : "Yes",
            IsChecked: e.act_inact_ind

        })) || [];
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
    handleSearch() {
        const me = this;
        me.loadPage(1);
    }
    handleSearchClear() {
        const me = this;
        me.doSearchClear(true);
    }
    doSearchClear(clearAll = false) {
        const model = this.Data;
        const gridInfo = model.GridInfo;

        if (clearAll === true) {
            model.SearchInput.ScrhcityName = "";
            model.SearchInput.Status_Srch = true;
            model.SearchInput.city_avail_Srch = false;
            this.setFocus('ScrhcityName');
        }
        gridInfo.Items = [];
        gridInfo.SelectedItem = null;
        gridInfo.Page = 1;
        gridInfo.TotalPage = 1;
        gridInfo.TotalCount = 0;

        this.updateUI();
    }

    loadPage(pageIndex, columnOptions = null, onload = false) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.PageNo = pageIndex;
        dataInfo.supp_map_id = model.SupplierMapID;
        dataInfo.vntrt_city_nam = model.SearchInput.ScrhcityName;
        dataInfo.vntrt_city_aval = model.SearchInput.city_avail_Srch === true ? 0 : 1;
        dataInfo.act_inact_ind = model.SearchInput.Status_Srch === true ? 1 : 0;
        dataInfo.SortTyp = true;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "vntrt_city_nam" && !cntrl.Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.SortTyp = itm.sort === 'asc';
                }
            }
        }
        model.Loading = true;
        me.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM101GetCitySearch`, data: dataInfo, files: [] }, (r) => {
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

    setSelectedItem(selectedItem, loadData = false) {
        const model = this.Data;
        model.GridInfo.SelectedItem = selectedItem;
        model.GridInfo.SelectedItem.isSelected = true;
        if (loadData === true)
            this.loadSelectedData(selectedItem.vntrt_city_cd);
    }
    loadSelectedData(id) {
        const me = this;
        const model = this.Data;
        const dataInfo = {};
        dataInfo.vntrt_city_cd = id;
        dataInfo.supp_map_id = model.SupplierMapID;
        model.Loading = true;
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM101GetEditCity`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                if (r) {
                    model.Input.City_ID = r.vntrt_city_cd;
                    model.Input.City_Name = r.vntrt_city_nam;
                    if (r.wkg_city_cd) {
                        let citydesc = r.wkg_city_cd?.split('/');
                        model.Input.WKG_City = { ID: citydesc[0], Text: citydesc[1] };
                    }
                    else {
                        model.Input.WKG_City = null;
                    }
                    model.Input.Status = r.act_inact_ind;
                    model.Input.Modifiedon = r.mod_dttm;
                    model.Input.Modifiedby = r.mod_by_usr_cd;
                    model.Input.IsEdit = true;
                }
                else {

                    model.Input.City_ID = "";
                    model.Input.City_Name = "";
                    model.Input.WKG_City = null;
                    model.Input.Status = false;
                    model.Input.Modifiedon = null;
                    model.Input.Modifiedby = '';
                    model.Input.IsEdit = false;
                }
                me.setTitle();
                let dataCopyEx = me.getData();
                model.DataCopy = JSON.stringify(dataCopyEx);
                me.setFocus('');
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

    handleDataChange(selectedItem) {
        const me = this;
        const model = this.Data.Input;
        if (selectedItem) {
            if (selectedItem.vntrt_city_cd === model.City_ID) {
                this.setFocus('WKG_City');
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
                            me.Data.Input.IsEdit = true;
                            me.doSave();
                            me.newMode();
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

    isvalidSave(e) {
        const model = this.Data.Input;
        if (Utils.isNullOrEmpty(model.WKG_City)) {
            this.showAlert('Please Select WKG_City', () => this.setFocus('WKG_City'));
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
                me.showAlert("No changes has been made.", () => this.setFocus('WKG_City'));
            }
            else {
                me.showAlert("Please enter required fields.", () => this.setFocus('WKG_City'));
            }
        }
    }
    doSave(e) {
        const me = this;
        const model = this.Data;
        if (this.isvalidSave(e)) {
            const dataInfo = this.getData();
            dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
            dataInfo.Mode = "FORM";
            model.Loading = true;
            me.updateUI();
            Utils.ajax({ url: `${this._WebApi}/SSM101SaveCityForm`, data: dataInfo }, r => {
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
        let pageNo = model.GridInfo.Page;
        me.showAlert('Data saved successfully', () => me.newMode());
        this.loadPage(pageNo, '');
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
        if (model.Input.IsEdit) {
            model.Title = `${this.props.data.Title} / City / Edit / ${model.Input.City_Name}`;
        }
        else {
            model.Title = `${this.props.data.Title} / City `;
        }


    }
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    showAlert(errorMsg, callback) {
        if (typeof errorMsg === 'number')
            errorMsg = Utils.getMessage(errorMsg);

        const me = this;
        const opt = {
            text: errorMsg,
            messageboxType: WKLMessageboxTypes.question,
            onClose: callback
        };
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