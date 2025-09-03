import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import * as cntrl from "../../../wkl-components";

export default class SSM110VM extends VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'SSM110';
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.FormID = "SSM110";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.Input = {
            tour_ctgry_id: "",
            NWTourctgrynam: null,
            Sort_order: "",
            lang_data_srl: "",
            Status: true,
            Modifiedon: null,
            Modifiedby: "",
            IsEdit: false,
        };
        model.SearchInput = {
            Tourctgrynam: "",
            StatusSrch: true,
        };

        model.NWTourctgrynam = [];
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 5 };
        model.GridInfo.Columns = [
            { text: 'Name', field: 'tour_ctgry_nam', width: '50%', sort: { enabled: true } },
            { text: 'Sort Order', field: 'sort_ordr', width: '30%' },
            { text: 'Status', field: 'act_inact_ind', width: '20%' },
        ];

        this.newMode();
    }
    newMode(flag = true) {
        console.log("Props", this.props)
        const model = this.Data;
        const dataModel = this.Data.Input;
        dataModel.tour_ctgry_id = "";
        dataModel.NWTourctgrynam = null;
        dataModel.Sort_order = "";
        dataModel.Status = true;
        dataModel.Modifiedon = null;
        dataModel.Modifiedby = "";
        dataModel.IsEdit = false;
        this.setTitle();
        if (flag) {
            this.setFocus('NWTourctgrynam');
        }
        var dataCopyEx = this.getData();
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();
    }
    getData() {
        const model = this.Data;
        const dataModel = this.Data.Input;
        const dataInfo = {};
        dataInfo.tour_ctgry_id = dataModel.tour_ctgry_id;
        if (!Utils.isNullOrEmpty(dataModel.NWTourctgrynam)) {
            dataInfo.lang_data_srl = dataModel.NWTourctgrynam.ID;
        }
        dataInfo.sort_ordr = dataModel.Sort_order;
        dataInfo.act_inact_ind = dataModel.Status;
        return dataInfo;
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
        this.onLoad(1, null, true);
    }
    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    onLoad(pageIndex, columnOptions, onloadFlag = false) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.PageNo = pageIndex;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.tour_ctgry_nam = model.SearchInput.Tourctgrynam;
        dataInfo.act_inact_ind = model.SearchInput.StatusSrch === true ? 1 : 0;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "tour_ctgry_nam" && !Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.SortTyp = itm.sort === 'asc';
                }
            }
        }
        model.Loading = true;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM110OnloadAsync`, data: dataInfo, files: [] }, (r) => {
            try {
                model.Loading = false;
                if (r) {
                    if (r.Items) {
                        me.fillSearchResult(r || {}, selectedItem);
                    }
                    console.log("combo" + r.Combdata);
                    if (onloadFlag) {
                        if (r.Combdata && Array.isArray(r.Combdata)) {
                            model.NWTourctgrynam = r.Combdata.map((data) => ({ ID: data.data_srl, Text: data.tour_ctgry_nam }));
                        }
                    }
                }
            }
            catch (ex) {
                console.log(ex);
            }
            finally {
                if (onloadFlag) {
                    me.newMode(false);
                }
                me.updateUI();
            }
        });
    }

    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.Items.map(e => ({ ...e, act_inact_ind: e.act_inact_ind ? "Active" : "Inactive" })) || [];
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
    handleSearch(pageIndex, columnOptions) {
        this.onLoad(pageIndex, columnOptions);
    }
    handleSearchClear() {
        const me = this;
        me.doSearchClear(true);
    }
    doSearchClear(clearAll = false) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        if (clearAll === true) {
            model.SearchInput.Tourctgrynam = '';
            model.SearchInput.StatusSrch = true;
            this.setFocus('Tourctgrynam');
            this.setTitle();
        }
        gridInfo.Items = [];
        gridInfo.SelectedItem = null;
        gridInfo.Page = 1;
        gridInfo.TotalPage = 1;
        gridInfo.TotalCount = 0;
        this.updateUI();
    }
    onBlurSrch(srl) {
        const me = this;
        const model = this.Data;
        const dataInfo = {};
        dataInfo.lang_data_srl = srl;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SMST110BlurAsync`, data: dataInfo, files: [] }, (r) => {
            try {
                r = r || {};
                if (r.Isavailable === true) {
                    me.handleModified(r.Item.tour_ctgry_id);
                }
                else if (r.ErrorNo == -1) {
                    const info = r.Items[0];
                    model.Input.tour_ctgry_id = "";
                    me.showAlert(`This Category name already exist`);
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
    handleModified(tour_ctgry_id) {
        const model = this.Data;
        const me = this;
        this.showConfirmation("Record already exists.Do you want to retrieve?", false, (e) => {
            if (e == 0) {
                me.loadSelectedData(tour_ctgry_id);
            }
            else {
                //this.onLoad(1, null);
                model.Input.NWTourctgrynam = null;
                me.setFocus('NWTourctgrynam');
            }

        });
    }
    handleDataChange(selectedItem) {
        const me = this;
        const dataModel = this.Data.Input;
        if (selectedItem) {
            if (selectedItem.tour_ctgry_id === dataModel.tour_ctgry_id) {
                this.setFocus('NWTourctgrynam');
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
                            me.doSave();
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
            this.loadSelectedData(selectedItem.tour_ctgry_id);
    }
    loadSelectedData(tour_ctgry_id) {
        const me = this;
        const model = this.Data;
        const dataModel = this.Data.Input;
        const dataInfo = {};
        dataInfo.tour_ctgry_id = tour_ctgry_id;
        model.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM110GetSelectAsync`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                if (r) {
                    if (r.Items) {
                        const Sltdata = r.Items[0];
                        dataModel.tour_ctgry_id = Sltdata.tour_ctgry_id
                        dataModel.NWTourctgrynam = model.NWTourctgrynam.find(i => i.ID === Sltdata.lang_data_srl) || null;
                        dataModel.Sort_order = Sltdata.sort_ordr || "";
                        dataModel.Status = Sltdata.act_inact_ind;
                        dataModel.Modifiedon = Sltdata.mod_dttm;
                        dataModel.Modifiedby = Sltdata.mod_by_usr_cd;
                        dataModel.IsEdit = true;
                    }
                    me.setTitle();
                    let dataCopyEx = me.getData();
                    me.Data.DataCopy = JSON.stringify(dataCopyEx);
                    me.updateUI();
                }
                else {

                    dataModel.tour_ctgry_id = ""
                    dataModel.NWTourctgrynam = model.NWTourctgrynam.find(e => e.value === "");
                    dataModel.Sort_order = "";
                    dataModel.Status = true;
                    dataModel.Modifiedon = null;
                    dataModel.Modifiedby = "";
                    dataModel.IsEdit = false;
                }
            }
            catch (ex) {
                console.log(ex)
            }
            finally {
                this.updateUI();
            }
        });
    }
    isvalidSave(e) {
        const me = this;
        const dataModel = this.Data.Input;
        const model = this.Data;
        let result = true;
        if (Utils.isNullOrEmpty(dataModel.NWTourctgrynam)) {
            this.showAlert('Please Select Name', () => this.setFocus('NWTourctgrynam'));
            result = false;
            return false;

        }
        return result;
    }
    handleSave(e) {
        const me = this;
        const model = this.Data;
        if (this.isValueChanged()) {
            this.doSave(e);
        }
        else {
            if (model.Input.IsEdit) {
                me.showAlert("No changes has been made.", () => this.setFocus('NWTourctgrynam'));
            }
            else {
                me.showAlert("Please Enter required fields.", () => this.setFocus('NWTourctgrynam'));
            }
        }
    }
    doSave(e) {
        const me = this;
        const model = this.Data;
        if (this.isvalidSave()) {
            const dataInfo = this.getData();
            dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
            dataInfo.Mode = model.Input.IsEdit ? "UPDATE" : "INSERT";
            model.Loading = true;
            me.updateUI();
            Utils.ajax({ url: `${this._WebApi}/SSM110SaveDataAsync`, data: dataInfo, files: model.Image_Array || [] }, r => {
                try {
                    model.Loading = false;
                    r = r || {};
                    if (r.IsSuccess === true) {
                        console.log("saved");
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
        this.loadInitData(pageNo);
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
        const model = this.Data;
        if (model.Input.IsEdit) {
            model.Title = `${this.props.data.Title} / Edit / ${model.Input.NWTourctgrynam.Text}`;
        }
        else {
            model.Title = `${this.props.data.Title} / New `;
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