import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import * as cntrl from "../../../wkl-components";

export default class SSM160VM extends VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'SSM160';
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.FormID = "SSM160";
        model.Title = '';
        model.IsSaved = false;
        model.Loading = false
        model.DataCopy = null;
        model.Applic_supList = [];
        model.existSrl = [];
        model.Input = {
            Terms_SNO: "",
            Terms_nam: "",
            Status: true,
            Applic_sup: null,
            Terms_Dflt: true,
            Modifiedon: null,
            Modifiedby: "",
            IsEdit: false,
            lang_cd: ""
        };
        model.SearchInput = {
            TermsSrch: "",
            StatusSrch: true,
        };
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 5 };
        model.GridInfo.Columns = [
            { text: 'Terms Name', field: 'trm_nam', width: '60%', sort: { enabled: true } },
            { text: 'Default', field: 'trm_dflt', width: '20%' },
            { text: 'Status', field: 'act_inact_ind', width: '20%' },
        ];

        this.newMode();
    }
    newMode() {
        console.log("Props", this.props)
        const model = this.Data;
        const dataModel = this.Data.Input;
        dataModel.Terms_SNO = "";
        dataModel.Terms_nam = "";
        dataModel.Status = true;
        dataModel.Applic_sup = null;
        dataModel.Terms_Dflt = true;
        dataModel.Modifiedon = null;
        dataModel.Modifiedby = "";
        dataModel.IsEdit = false;
        dataModel.lang_cd = "";
        model.IsSaved = false;
        for (const itm of model.Applic_supList) {
            itm.isSelected = false;
        }
        this.setFocus('Terms_nam');
        this.setTitle();
        var dataCopyEx = this.getData();
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();
    }

    getData() {
        const model = this.Data;
        const dataModel = this.Data.Input;
        const dataInfo = {};
        dataInfo.trm_srl = dataModel.Terms_SNO;
        dataInfo.trm_nam = dataModel.Terms_nam || "";
        dataInfo.trm_dflt = dataModel.Terms_Dflt;
        dataInfo.act_inact_ind = dataModel.Status;
        if (!Utils.isNullOrEmpty(dataModel.Applic_sup)) {
            dataInfo.appl_supp_cds = dataModel.Applic_sup.map(item => item.ID).join(',');
        }
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
        this.onLoad(1);
    }

    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }

    onLoad(pageIndex) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.PageNo = pageIndex;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.act_inact_ind = model.SearchInput.StatusSrch === true ? 1 : 0;
        model.Loading = true;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM160OnloadAsync`, data: dataInfo, files: [] }, (r) => {
            try {
                model.Loading = false;
                if (r) {
                    if (r.Items) {
                        me.fillSearchResult(r || {}, selectedItem);
                        model.Applic_supList = r.ApiEnableItem.filter(data => data.act_inact_ind === true).map((data) => ({ ID: data.supp_map_id, Text: data.supp_nam }));

                    }
                }
            }
            catch (ex) {
                console.log(ex);
            }
            finally {
                me.newMode();
                me.updateUI();
            }
        });
    }

    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.Items.map(e => ({ ...e, act_inact_ind: e.act_inact_ind ? "Active" : "Inactive", trm_dflt: e.trm_dflt ? "Yes" : "No" })) || [];
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
    handleSearch(pageIndex) {
        this.loadPage(pageIndex);
    }
    loadPage(pageIndex, columnOptions = null,) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.PageNo = pageIndex;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.trm_nam = model.SearchInput.TermsSrch;
        dataInfo.act_inact_ind = model.SearchInput.StatusSrch === true ? 1 : 0;
        dataInfo.SortTyp = true;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "trm_nam" && !Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.SortTyp = itm.sort === 'asc';
                }
            }
        }
        model.Loading = true;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM160GetSearchAsync`, data: dataInfo, files: [] }, (r) => {
            try {
                model.Loading = false;
                if (r && r.Items) {
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
    handleSearchClear() {
        const me = this;
        me.doSearchClear(true);
    }
    doSearchClear(clearAll = false) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        if (clearAll === true) {
            model.SearchInput.TermsSrch = '';
            model.SearchInput.StatusSrch = true;
            this.setFocus('TermsSrch');
            this.setTitle();
        }
        gridInfo.Items = [];
        gridInfo.SelectedItem = null;
        gridInfo.Page = 1;
        gridInfo.TotalPage = 1;
        gridInfo.TotalCount = 0;
        this.updateUI();
    }

    handleDataChange(selectedItem) {
        const me = this;
        const dataModel = this.Data.Input;
        if (selectedItem) {
            if (selectedItem.trm_srl === dataModel.Terms_SNO) {
                this.setFocus('Terms_nam');
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
            this.loadSelectedData(selectedItem.trm_srl);
    }

    setApplcsupValues(value, type) {
        const model = this.Data;
        if (type === "multi") {
            if (value !== null && value !== '') {
                value = value.split(',');
                value.forEach((id) => { model.Input.Applic_sup.push(model.Applic_supList.find(i => i.ID === id)) });
                model.Input.Applic_sup = model.Input.Applic_sup.filter(lang => lang !== undefined);
            }
            else {
                model.Input.Applic_sup = null;
            }
            for (const itm of model.Applic_supList) {
                itm.isSelected = false;
            }
        }
        if (type === "single") {
            if (value !== null && value !== '') {
                model.Input.Applic_sup = model.Applic_supList.find(i => i.ID === value);
            }
            else {
                model.Input.Applic_sup = null;
            }
            for (const itm of model.Applic_supList) {
                itm.isSelected = false;
            }
        }
        this.updateUI();
    }

    loadSelectedData(trm_srl) {
        const me = this;
        const model = this.Data;
        const dataModel = this.Data.Input;
        const dataInfo = {};
        dataInfo.trm_srl = trm_srl;
        model.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM160GetSelectAsync`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                if (r) {
                    if (r.Items) {
                        const loct = r.Items[0];
                        model.Input.Applic_sup = [];

                        dataModel.Terms_SNO = loct.trm_srl
                        dataModel.Terms_nam = loct.trm_nam || "";
                        dataModel.Terms_Dflt = loct.trm_dflt;
                        dataModel.Status = loct.act_inact_ind;
                        // dataModel.Applic_sup = loct.appl_supp_cds;
                        dataModel.Modifiedon = loct.mod_dttm;
                        dataModel.Modifiedby = loct.mod_by_usr_cd;
                        dataModel.IsEdit = true;
                        dataModel.lang_cd = r.Lang_Cd;
                        this.setApplcsupValues(loct.appl_supp_cds, "multi");
                    }

                    me.setTitle();
                    let dataCopyEx = me.getData();
                    me.Data.DataCopy = JSON.stringify(dataCopyEx);
                    me.updateUI();
                }
                else {

                    dataModel.Terms_SNO = "";
                    dataModel.Terms_nam = "";
                    dataModel.Terms_Dflt = true;
                    dataModel.Status = true;
                    dataModel.Modifiedon = null;
                    dataModel.Modifiedby = "";
                    dataModel.Applic_sup = null
                    dataModel.IsEdit = false;
                    dataModel.lang_cd = "";

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
        if (Utils.isNullOrEmpty(dataModel.Terms_nam)) {
            this.showAlert('Please enter Terms Name', () => this.setFocus('Terms_nam'));
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
                me.showAlert("No changes has been made.", () => this.setFocus('Terms_nam'));
            }
            else {
                me.showAlert("Please Enter required fields.", () => this.setFocus('Terms_nam'));
            }
        }
    }

    isvalidsavedefaultcheck(callback) {
        const me = this;
        const model = this.Data;
        const dataModel = this.Data.Input;
        const dataInfo = {};
        if (!Utils.isNullOrEmpty(dataModel.Applic_sup)) {
            dataInfo.appl_supp_cds = dataModel.Applic_sup.map(item => item.ID).join(',');
        }
        model.Loading = true;
        this.updateUI();

        if (dataModel.Terms_Dflt) {

            Utils.ajax({ url: `${this._WebApi}/SSM160GetSelectDefaultcheck`, data: dataInfo }, (r) => {
                try {
                    model.Loading = false;
                    console.log("SSM160GetSelectDefaultcheck", r.Items);
                    if (r && r.Items?.length > 0) {
                        this.showConfirmation("The default selection is already done for the supplier. Still, do you want to continue?", false, (e) => {
                            if (e == 1) {
                                callback(false);
                            }
                            else if (e == 0) {
                                model.existSrl = r.Items.map(i => i.trm_srl);
                                callback(true);
                            }
                        });
                    } else {
                        callback(true);
                    }
                }
                catch (ex) {
                    console.log(ex);
                    callback(false);
                }
                finally {
                    this.updateUI();
                }
            });
        }
        else {
            callback(true);
        }
    }

    doSave(e) {
        const me = this;
        const model = this.Data;

        if (this.isvalidSave()) {
            // Use callback approach for async validation
            this.isvalidsavedefaultcheck((canProceed) => {
                if (canProceed) {
                    const dataInfo = this.getData();
                    dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
                    dataInfo.Mode = model.Input.IsEdit ? "UPDATE" : "INSERT";
                    model.Loading = true;
                    dataInfo.existSrl = JSON.stringify(model.existSrl);
                    me.updateUI();
                    console.log("SSM160SaveDataAsync", dataInfo);
                    Utils.ajax({ url: `${this._WebApi}/SSM160SaveDataAsync`, data: dataInfo }, r => {
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

            });
        }
    }

    handleSaveFollowup(e) {
        const me = this;
        const model = this.Data;
        let pageNo = model.GridInfo.Page;
        this.loadPage(pageNo);
        let dataCopyEx = me.getData();
        me.Data.DataCopy = JSON.stringify(dataCopyEx);
        me.showAlert('Data saved successfully', "");
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
            model.Title = `${this.props.data.Title} / Edit / ${model.Input.Terms_nam}`;
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
    openWindow(type) {
        const model = this.Data;
        const dataModel = this.Data.Input;
        const me = this;
        let Prod_Name = dataModel.Terms_nam;
        let Trms_srl = dataModel.Terms_SNO;
        let IsEdit = '';
        let Url = '';

        if (type == "btn_edit_trmdesc") {
            Url = 'SSM/SSM161';
            IsEdit = true;
            this.showWindow({
                url: Url, data: { Title: this.props.data.Title, IsEdit: IsEdit, Trms_srl: Trms_srl, Trms_nam: Prod_Name }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    me.loadSelectedData(dataModel.Terms_SNO);
                    me.updateUI();
                }
            });
        }
    }
}