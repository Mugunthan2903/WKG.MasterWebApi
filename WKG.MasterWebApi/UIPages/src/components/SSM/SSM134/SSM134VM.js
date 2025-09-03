import { data } from "jquery";
import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import * as cntrl from "../../../wkl-components";

export default class SSM134VM extends VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'SSM130';
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.FormID = "SSM134";
        model.SupplierMapID = this.props.data.SuppMapID;
        model.Crrg_ID = this.props.data.Crrg_ID;
        model.Loading = false
        model.DataCopy = null;
        model.Input = {
            Diff_ID: "",
            Diff_Name: "",
            WKG_Diff_Cd: null,
            Description: "",
            Sort_ordr: "",
            Min_Age: "",
            Max_Age: "",
            Status: true,
            Modifiedon: null,
            Modifiedby: "",
            IsEdit: false,
        };
        model.SearchInput = {
            ScrhDiffName: "",
            Status_Srch: true,
            diff_avail_Srch: false,
        };
        model.WKG_Diff_CdList = [];
        model.AllSelected = false;
        model.GridInfo = {
            Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 5,
            Columns: [
                { text: 'Name', field: 'diffrt_nam', width: '30%', sort: { enabled: true } },
                { text: 'WKG Differential', field: 'wkg_diffrt_cd', width: '25%' },
                { text: 'Sort Order', field: 'sort_ordr', width: '15%' },
                { text: 'Status', field: 'act_inact_ind', width: '15%' },
                { text: 'Delisted ', field: 'diffrt_aval', width: '15%' },
            ]
        };
        this.newMode();
    }
    newMode() {
        const model = this.Data;
        const dataModel = this.Data.Input;
        model.ID = 0;
        dataModel.Diff_ID = "";
        dataModel.Diff_Name = "";
        dataModel.Sort_ordr = "";
        dataModel.Description = "";
        dataModel.Min_Age = "";
        dataModel.Max_Age = "";
        dataModel.WKG_Diff_Cd = null;
        dataModel.Status = true;
        dataModel.Modifiedon = null;
        dataModel.Modifiedby = "";
        dataModel.IsEdit = false;
        this.setFocus('ScrhDiffName');
        this.setTitle();
        var dataCopyEx = this.getData();
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();
    }

    getData() {
        const model = this.Data.Input;
        const dataModel = this.Data;
        const dataInfo = {};
        dataInfo.diffrt_cd = model.Diff_ID;
        dataInfo.diffrt_nam = model.Diff_Name;
        dataInfo.sort_ordr = model.Sort_ordr;
        dataInfo.crrg_id = dataModel.Crrg_ID;
        if (!Utils.isNullOrEmpty(model.WKG_Diff_Cd)) {
            dataInfo.wkg_diffrt_cd = model.WKG_Diff_Cd?.ID;
        }
        dataInfo.act_inact_ind = model.Status;
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
        dataInfo.diffrt_nam = "";
        dataInfo.SortTyp = true;
        dataInfo.crrg_id = model.Crrg_ID;
        dataInfo.diffrt_nam = model.SearchInput.ScrhDiffName;
        dataInfo.act_inact_ind = model.SearchInput.Status_Srch;
        dataInfo.diffrt_aval = !model.SearchInput.diff_avail_Srch;
        model.Loading = true;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM134DifferentialOnload`, data: dataInfo, files: [] }, (r) => {
            try {
                model.Loading = false;
                if (r) {
                    model.WKG_Diff_CdList = r.WKG_Diff_ComboList.map((data) => ({ ID: data.diffrt_cd, Text: data.diffrt_desc }));
                    if (r.Items)
                        me.fillSearchResult(r || {}, selectedItem);
                }
            }
            catch (ex) {
                console.error("Error in SSM134 onload differential: ", ex);
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
            diffrt_aval: e.diffrt_aval === true ? "No" : "Yes",
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
            model.SearchInput.ScrhDiffName = "";
            model.SearchInput.Status_Srch = true;
            model.SearchInput.diff_avail_Srch = false;
            this.setFocus('ScrhDiffName');
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
        dataInfo.crrg_id = model.Crrg_ID;
        dataInfo.diffrt_nam = model.SearchInput.ScrhDiffName;
        dataInfo.diffrt_aval = model.SearchInput.diff_avail_Srch === true ? 0 : 1;
        dataInfo.act_inact_ind = model.SearchInput.Status_Srch === true ? 1 : 0;
        dataInfo.SortTyp = true;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "diffrt_nam" && !cntrl.Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.SortTyp = itm.sort === 'asc';
                }
            }
        }
        model.Loading = true;
        me.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM134DifferentialSearch`, data: dataInfo, files: [] }, (r) => {
            try {
                model.Loading = false;
                me.fillSearchResult(r || {}, selectedItem);
            }
            catch (ex) {
                console.error("Error in SSM134 search differential: ", ex);
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
            this.loadSelectedData(selectedItem.diffrt_cd);
    }
    loadSelectedData(id) {
        const me = this;
        const model = this.Data;
        const dataInfo = {};
        dataInfo.diffrt_cd = id;
        dataInfo.crrg_id = model.Crrg_ID;
        model.Loading = true;
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM134DifferentialEdit`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                if (r) {
                    model.Input.Diff_ID = r.diffrt_cd;
                    model.Input.Diff_Name = r.diffrt_nam;
                    model.Input.Sort_ordr = r.sort_ordr || "";
                    model.Input.Description = r.diffrt_desc || "";
                    model.Input.Min_Age = r.diffrt_min_age;
                    model.Input.Max_Age = r.diffrt_max_age;
                    model.Input.WKG_Diff_Cd = model.WKG_Diff_CdList.find(i => i.ID === r.wkg_diffrt_cd) || null;
                    model.Input.Status = r.act_inact_ind;
                    model.Input.Modifiedon = r.mod_dttm;
                    model.Input.Modifiedby = r.mod_by_usr_cd;
                    model.Input.IsEdit = true;
                }
                else {

                    model.Input.Diff_ID = "";
                    model.Input.Diff_Name = "";
                    model.Input.Sort_ordr = "";
                    model.Input.Description = "";
                    model.Input.WKG_Diff_Cd = null;
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
                console.error("Error in SSM134 select differential: ", ex);
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
            if (selectedItem.diffrt_cd === model.Diff_ID) {
                this.setFocus('WKG_Diff_Cd');
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
        // if (Utils.isNullOrEmpty(model.WKG_Diff_Cd)) {
        //     this.showAlert('Please Select WKG_Diff_Cd', () => this.setFocus('WKG_Diff_Cd'));
        //     return false;
        // }
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
                me.showAlert("No changes has been made.", () => this.setFocus('WKG_Diff_Cd'));
            }
            else {
                me.showAlert("Please enter required fields.", () => this.setFocus('WKG_Diff_Cd'));
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
            Utils.ajax({ url: `${this._WebApi}/SSM134DifferentialSave`, data: dataInfo }, r => {
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
                    console.error("Error in SSM134 save differential: ", ex);
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
            model.Title = `${this.props.data.Title} / Differential / ${this.props.data.Crrg_Name} / Edit / ${model.Input.Diff_Name}`;
        }
        else {
            model.Title = `${this.props.data.Title} / Differential / ${this.props.data.Crrg_Name}`;
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