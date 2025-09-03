import { data } from "jquery";
import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import * as cntrl from "../../../wkl-components";

export default class SSM022VM extends VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'SSM020';
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.FormID = "SSM022";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.DataCopyGrid = null;
        model.DataCopyGridarr = null;
        model.Input = {
            Ctgry_ID: "",
            Ctgry_Name: "",
            Ctgry_Type: null,
            Sort_Order: "",
            Status: true,
            Modifiedon: null,
            Modifiedby: "",
            IsEdit: false,
        };
        model.gridSave = false;
        model.SearchInput = {
            Ctgry_Name_Srch: "",
            Status_Srch: true,
            Tui_Delist_Srch: false,

        };
        model.Ctgry_TypeList = [];
        model.Ctgry_TypeListALL = [];
        model.AllSelected = false;
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 5 };
        model.GridInfo.Columns = [
            { text: '', field: 'Text', width: '8%' },
            { text: 'Name', field: 'tui_ctgry_nam', width: '32%', sort: { enabled: true } },
            { text: 'WKG Category', field: 'ctgry_nam', width: '25%' },
            // { text: 'Sort Order', field: 'sort_ordr', width: '10%' },
            { text: 'Delisted', field: 'tui_ctgry_aval', width: '20%' },
            { text: 'Status', field: 'act_inact_ind', width: '15%' },
        ];
        this.newMode();
    }
    newMode() {
        const model = this.Data;
        const dataModel = this.Data.Input;
        model.ID = 0;
        dataModel.Ctgry_ID = "";
        dataModel.Ctgry_Name = "";
        dataModel.Ctgry_Type = null;
        dataModel.Sort_Order = "";
        dataModel.Status = true;
        dataModel.Modifiedon = null;
        dataModel.Modifiedby = "";
        dataModel.IsEdit = false;
        this.setFocus('Ctgry_Name_Srch');
        this.setTitle();
        var dataCopyEx = this.getData();
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();
    }

    getData() {
        const model = this.Data.Input;
        const dataInfo = {};

        dataInfo.tui_ctgry_id = model.Ctgry_ID;
        dataInfo.tui_ctgry_nam = model.Ctgry_Name;

        if (!Utils.isNullOrEmpty(model.Ctgry_Type)) {
            dataInfo.wkg_ctgry_ids = model.Ctgry_Type.map(item => item.ID).join(',');
        }
        //dataInfo.ctgry_typ = model.Ctgry_Type;

        dataInfo.sort_ordr = model.Sort_Order;

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
    isGridChanged(e) {
        return JSON.stringify(e) !== this.Data.DataCopyGrid;
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
        dataInfo.tui_ctgry_nam = "";
        dataInfo.sortType = true;
        model.Loading = true;
        // model.AllSelected = false;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM022OnloadAsync`, data: dataInfo, files: [] }, (r) => {
            try {
                model.Loading = false;
                model.Ctgry_TypeList = r.CtgryType.filter((item)=> item.act_inact_ind === true).map((data) => ({ ID: data.tour_ctgry_id, Text: data.tour_ctgry_nam }));
                model.Ctgry_TypeListALL = r.CtgryType.map((data) => ({ ID: data.tour_ctgry_id, Text: data.tour_ctgry_nam }));
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
        gridInfo.Items = r.Items.map(e => ({
            ...e,
            act_inact_ind: e.act_inact_ind === true ? "Active" : "Inactive",
            tui_ctgry_aval: e.tui_ctgry_aval === true ? "No" : "Yes",
            IsChecked: e.act_inact_ind

        })) || [];
        model.AllSelected = (gridInfo.Items.length === gridInfo.Items.count(i => i.IsChecked) && gridInfo.Items.length !== 0);
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
        this.Data.DataCopyGrid = JSON.stringify(gridInfo.Items.map(e => ({ IsChecked: e.IsChecked })));
        this.Data.DataCopyGridarr = gridInfo.Items.map(e => ({ IsChecked: e.IsChecked }));
    }
    handleSearch() {
        const me = this;
        const model = this.Data;
        if (this.isGridChanged(model.GridInfo.Items.map(e => ({ IsChecked: e.IsChecked })))) {
            this.showConfirmation("Unsaved changes exists. Save and proceed.", false, (e) => {
                try {
                    if (e == 0) {
                        me.doSave();
                    }
                    else {
                        me.loadPage(1);
                    }
                }
                catch (ex) {

                }
                finally { }
            });
        }
        else {
            me.loadPage(1);
        }
    }
    handleSearchClear() {
        const me = this;
        const model = this.Data;
        if (this.isGridChanged(model.GridInfo.Items.map(e => ({ IsChecked: e.IsChecked })))) {
            this.showConfirmation("Unsaved changes exists. Save and proceed.", false, (e) => {
                try {
                    if (e == 0) {
                        me.doSave();
                    }
                    else {
                        me.doSearchClear(true);
                    }
                }
                catch (ex) {

                }
                finally { }
            });
        }
        else {
            me.doSearchClear(true);
        }

    }
    doSearchClear(clearAll = false) {
        const model = this.Data;
        const gridInfo = model.GridInfo;

        if (clearAll === true) {
            model.SearchInput.Ctgry_Name_Srch = "";
            model.SearchInput.Status_Srch = true;
            model.SearchInput.Tui_Delist_Srch = false;
            this.setFocus('Ctgry_Name_Srch');
        }

        model.AllSelected = false;
        gridInfo.Items = [];
        gridInfo.SelectedItem = null;
        gridInfo.Page = 1;
        gridInfo.TotalPage = 1;
        gridInfo.TotalCount = 0;

        this.Data.DataCopyGrid = JSON.stringify(gridInfo.Items.map(e => ({ IsChecked: e.IsChecked })));

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
        dataInfo.tui_ctgry_nam = model.SearchInput.Ctgry_Name_Srch;
        dataInfo.tui_ctgry_aval = model.SearchInput.Tui_Delist_Srch === true ? 0 : 1;
        dataInfo.act_inact_ind = model.SearchInput.Status_Srch === true ? 1 : 0;
        dataInfo.sortType = true;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "tui_ctgry_nam" && !cntrl.Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.sortType = itm.sort === 'asc';
                }
            }
        }
        if (onload === true) {
            if (this.isGridChanged(gridInfo.Items.map(e => ({ IsChecked: e.IsChecked })))) {

                this.showConfirmation('Unsaved changes exists. Save and proceed.', false, (e) => {
                    if (e === 0) {
                        me.handleSave();
                    } else if (e === 1) {
                        this.ajaxcall(dataInfo, selectedItem);
                    }
                });
            } else {
                this.ajaxcall(dataInfo, selectedItem);
            }
        }
        else {
            this.ajaxcall(dataInfo, selectedItem);
        }
        // model.AllSelected = false;
        this.updateUI();
    }

    ajaxcall(dataInfo, selectedItem) {
        const me = this;
        const model = this.Data;
        model.Loading = true;
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM022SearchDataAsync`, data: dataInfo, files: [] }, (r) => {
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
            this.loadSelectedData(selectedItem.tui_ctgry_id);
    }
    loadSelectedData(tui_ctgry_id) {
        const me = this;
        const model = this.Data;
        model.Loading = true;
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM022LoadFormDataAsync`, data: { tui_ctgry_id } }, (r) => {
            try {
                model.Loading = false;
                if (r) {

                    model.Input.Ctgry_Type = [];
                    model.Input.Ctgry_ID = r.tui_ctgry_id;
                    model.Input.Ctgry_Name = r.tui_ctgry_nam;
                    this.Set_Ctgry_Type(r.wkg_ctgry_ids);
                    model.Input.Sort_Order = r.sort_ordr || '';
                    model.Input.Status = r.act_inact_ind;
                    model.Input.Modifiedon = r.mod_dttm;
                    model.Input.Modifiedby = r.mod_by_usr_cd;
                    model.Input.IsEdit = true;
                    model.gridSave = false;
                }
                else {

                    model.Input.Ctgry_ID = "";
                    model.Input.Ctgry_Name = "";
                    model.Input.Ctgry_Type = null;
                    model.Input.Sort_Order = "";
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

    Set_Ctgry_Type(value) {
        const model = this.Data;

        if (value !== null && value !== '') {
            value = value.split(',');
            value.forEach((id) => { model.Input.Ctgry_Type.push(model.Ctgry_TypeListALL.find(i => i.ID === id)) });
        }
        else {
            model.Input.Ctgry_Type = null;
        }
        for (const itm of model.Ctgry_TypeList) {
            itm.isSelected = false;
        }

        this.updateUI();
    }

    handleDataChange(selectedItem) {
        const me = this;
        const model = this.Data.Input;
        if (selectedItem) {
            if (selectedItem.tui_ctgry_nam === model.Ctgry_Name) {
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
        if (Utils.isNullOrEmpty(model.Ctgry_Type)) {
            this.showAlert('Please Select WKG Category',()=>this.setFocus('Ctgry_Type'));
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
            if (this.isGridChanged(model.GridInfo.Items.map(e => ({ IsChecked: e.IsChecked })))) {
                this.doSave(e);
            } else {
                if (model.Input.IsEdit) {
                    me.showAlert("No changes has been made.",()=>this.setFocus('Ctgry_Type'));
                }
                else {
                    me.showAlert("Please Enter required fields.",()=>this.setFocus('Ctgry_Type'));
                }
            }
        }
    }
    doSave(e) {
        const me = this;
        const model = this.Data;
        if (model.gridSave) {
            const dataInfo = this.getData();
            dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
            dataInfo.Mode = "UPDATE";
            dataInfo.Savedata = "Category"
            const temp = model.GridInfo.Items.filter((e, i) => e.IsChecked != model.DataCopyGridarr[i].IsChecked);
            dataInfo.Selectedrow = temp.map(e => e.IsChecked ? { ...e, act_inact_ind: "Active" } : { ...e, act_inact_ind: "Inactive" });
            model.Loading = true;
            me.updateUI();
            Utils.ajax({ url: `${this._WebApi}/SSM020SaveAsync`, data: dataInfo }, r => {
                try {
                    model.Loading = false;
                    r = r || {};
                    if (r.IsSuccess === true) {
                        model.IsSaved = true;
                        model.gridSave = false;
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
        else if (this.isvalidSave(e)) {
            const dataInfo = this.getData();
            dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
            dataInfo.Mode = "UPDATE";
            dataInfo.gridList = model.GridInfo.Items.map(ex => ({ tui_ctgry_id: ex.tui_ctgry_id, act_inact_ind: e.IsChecked }));
            model.Loading = true;
            me.updateUI();
            Utils.ajax({ url: `${this._WebApi}/SSM022SaveCategoryAsync`, data: dataInfo }, r => {
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
        me.showAlert('Data saved successfully', ()=> me.newMode());
        this.loadPage(pageNo, '');
        //me.newMode();
    }
    handleValueChange(followUpAction) {
        const model = this.Data;
        if (this.isValueChanged() || this.isGridChanged(model.GridInfo.Items.map(e => ({ IsChecked: e.IsChecked })))) {
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
            // model.Title = `${this.props.data.Title} / Edit / ${model.Input.Ctgry_Name}`;
            model.Title = `Tui Product / Filter Types / Edit / ${model.Input.Ctgry_Name}`;
        }
        else {
            // model.Title = `${this.props.data.Title} / New `;
            model.Title = "Tui Product / Filter Types";
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