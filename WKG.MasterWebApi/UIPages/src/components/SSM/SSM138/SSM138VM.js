import { data } from "jquery";
import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import * as cntrl from "../../../wkl-components";
import util from "../../../wkl-components/WKLEditor/src/lib/util";

export default class SSM138VM extends VMBase {
    constructor(props) {
        super(props);
        this.init();
        this._WebApi = 'SSM130';
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.FormID = "SSM138";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.Pos_grp_idsList = [];
        model.Input = {
            Grp_stn_SNO: "",
            Grp_stn_nam: "",
            Pos_grp_ids:null,
            dprt_stn_cds:null,
            arvl_stn_cds: null,
            Status: true,
            Modifiedon: null,
            Modifiedby: "",
            IsEdit: false,
        };
        model.SearchInput = {
            Stationsrch: "",
            StatusSrch: true,
        };
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 5 };
        model.GridInfo.Columns = [
            { text: 'Name', field: 'combi_nam', width: '40%', sort: { enabled: true } },
            { text: 'Group Name', field: 'pos_grp_ids', width: '48%' },
            { text: 'Status', field: 'act_inact_ind', width: '12%' },
        ];

        this.newMode();
    }
    newMode() {
        console.log("Props", this.props)
        const model = this.Data;
        const dataModel = this.Data.Input;
        dataModel.Grp_stn_SNO = "";
        dataModel.Grp_stn_nam = "";
        dataModel.Pos_grp_ids =null;
        dataModel.dprt_stn_cds = null;
        dataModel.arvl_stn_cds = null;
        dataModel.Status = true;
        dataModel.Modifiedon = null;
        dataModel.Modifiedby = "";
        dataModel.IsEdit = false;
        for (const itm of model.Pos_grp_idsList) {
            itm.isSelected = false;
        }

        this.setFocus('Grp_stn_nam');
        this.setTitle();
        var dataCopyEx = this.getData();
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();
    }
    getData() {
        const model = this.Data;
        const dataModel = this.Data.Input;
        const dataInfo = {};
        dataInfo.combi_srl = dataModel.Grp_stn_SNO || "";
        dataInfo.combi_nam = dataModel.Grp_stn_nam || "";
        if (!Utils.isNullOrEmpty(dataModel.Pos_grp_ids)) {
            dataInfo.pos_grp_ids = dataModel.Pos_grp_ids.map(item => item.ID).join(',');
        }
        if (!Utils.isNullOrEmpty(dataModel.dprt_stn_cds)) {
            dataInfo.dprt_stn_cds = dataModel.dprt_stn_cds.map(item => item.ID).join(',');
        }
        if (!Utils.isNullOrEmpty(dataModel.arvl_stn_cds)) {
            dataInfo.arvl_stn_cds = dataModel.arvl_stn_cds.map(item => item.ID).join(',');
        }
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
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM138OnloadAsync`, data: dataInfo, files: [] }, (r) => {
            try {
                model.Loading = false;
                if (r) {
                    console.log("Response", r);
                    if (r.PosGrpItem) {
                        model.Pos_grp_idsList = r.PosGrpItem.filter(data => data.act_inact_ind === true).map((data) => ({ ID: data.pos_grp_id, Text: data.pos_grp_nam }));
                    }
                    if (r.Items) {
                        me.fillSearchResult(r || {}, selectedItem);
                       
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
      
        gridInfo.Items = r.Items.map(e => {
            const newItem = {
                ...e,
                act_inact_ind: e.act_inact_ind ? "Active" : "Inactive"
            };

            if (e.pos_grp_ids) {
                const idsToProcess = e.pos_grp_ids.split(',');
               const foundPosGrpItems = idsToProcess.map(id => {
                    return r.PosGrpItem.find(item => item.pos_grp_id === id);
                }).filter(Boolean); 
                newItem.pos_grp_ids = foundPosGrpItems.map(item => item.pos_grp_nam).join(', ');
            }

            return newItem;
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

    fillSearchgetResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
      
        gridInfo.Items = r.Items.map(e => {
            const newItem = {
                ...e,
                act_inact_ind: e.act_inact_ind ? "Active" : "Inactive"
            };

            if (e.pos_grp_ids) {
                const idsToProcess = e.pos_grp_ids.split(',');
               const foundPosGrpItems = idsToProcess.map(id => {
                    return model.Pos_grp_idsList.find(item => item.ID === id);
                }).filter(Boolean); 
                newItem.pos_grp_ids = foundPosGrpItems.map(item => item.Text).join(', ');
            }

            return newItem;
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
        dataInfo.combi_nam = model.SearchInput.Stationsrch;
        dataInfo.act_inact_ind = model.SearchInput.StatusSrch === true ? 1 : 0;
        dataInfo.SortTyp = true;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "combi_nam" && !Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.SortTyp = itm.sort === 'asc';
                }
            }
        }
        model.Loading = true;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM138GetSearchAsync`, data: dataInfo, files: [] }, (r) => {
            try {
                model.Loading = false;
                if (r && r.Items) {
                    me.fillSearchgetResult(r || {}, selectedItem);
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
            model.SearchInput.Stationsrch = '';
            model.SearchInput.StatusSrch = true;
            this.setFocus('Stationsrch');
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
            if (selectedItem.combi_srl === dataModel.Grp_stn_SNO) {
                this.setFocus('Grp_stn_nam');
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
            this.loadSelectedData(selectedItem);
    }
    loadSelectedData(selectedItem) {
        const me = this;
        const model = this.Data;
        const dataModel = this.Data.Input;
        const dataInfo = {};
        dataInfo.combi_srl = selectedItem.combi_srl;
        model.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM138GetSelectAsync`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                if (r) {
                    if (r.Items) {
                        const loct = r.Items[0];
                        model.Input.Pos_grp_ids = [];
                        model.Input.dprt_stn_cds = [];
                        model.Input.arvl_stn_cds = [];
                        dataModel.Grp_stn_SNO = loct.combi_srl
                        dataModel.Grp_stn_nam = loct.combi_nam || "";
                        dataModel.Status = loct.act_inact_ind;
                        dataModel.Modifiedon = loct.mod_dttm;
                        dataModel.Modifiedby = loct.mod_by_usr_cd;
                        dataModel.IsEdit = true;
                        this.setPosgrpValues(loct.pos_grp_ids, "multi");
                        this.setStatinCode(loct.dprt_stn_cds , "D");
                        this.setStatinCode(loct.arvl_stn_cds , "A");
                    }
                    
                    me.setTitle();
                    let dataCopyEx = me.getData();
                    me.Data.DataCopy = JSON.stringify(dataCopyEx);
                    me.updateUI();
                }
                else {
                   
                    dataModel.Grp_stn_SNO = "";
                    dataModel.Grp_stn_nam = "";
                    dataModel.Pos_grp_ids = null;
                    dataModel.dprt_stn_cds = null;
                    dataModel.arvl_stn_cds = null;
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
    
    setPosgrpValues(value, type) {
        const model = this.Data;
        if (type === "multi") {
            if (value !== null && value !== '') {
                value = value.split(',');
                value.forEach((id) => { model.Input.Pos_grp_ids.push(model.Pos_grp_idsList.find(i => i.ID === id)) });
                //model.Input.Pos_grp_ids = model.Input.Pos_grp_ids.filter(lang => lang !== undefined);
            }
            else {
                model.Input.Pos_grp_ids = null;
            }
            for (const itm of model.Pos_grp_idsList) {
                itm.isSelected = false;
            }
        }
        if (type === "single") {
            if (value !== null && value !== '') {
                model.Input.Pos_grp_ids = model.Pos_grp_idsList.find(i => i.ID === value);
            }
            else {
                model.Input.Pos_grp_ids = null;
            }
            for (const itm of model.Pos_grp_idsList) {
                itm.isSelected = false;
            }
        }
        this.updateUI();
    }

    setStatinCode(value, type) {

        if (type === "D") {
            const model = this.Data;
            if (value !== null && value !== '') {
                
                value = value.split(',');
                value.forEach((item) => {
                    let dprtdesc = item?.split('/');
                    model.Input.dprt_stn_cds.push({ ID: dprtdesc[0], Text: dprtdesc[1] });
                });
            }
            else {
                model.Input.dprt_stn_cds = null;
            }
        }
        if (type === "A") {
           
            const model = this.Data;
            if (value !== null && value !== '') {
                
                value = value.split(',');
                value.forEach((item) => {
                    let arrdesc = item?.split('/');
                    model.Input.arvl_stn_cds.push({ ID: arrdesc[0], Text: arrdesc[1] });
                });
            }
            else {
                model.Input.arvl_stn_cds = null;
            }
        }
        this.updateUI();
    }

    isvalidSave(e) {
        const me = this;
        const dataModel = this.Data.Input;
        const model = this.Data;
        let result = true;
        if (Utils.isNullOrEmpty(dataModel.Grp_stn_nam)) {
            this.showAlert('Please enter Name', () => this.setFocus('Grp_stn_nam'));
            result = false;
            return false;

        }
        if (Utils.isNullOrEmpty(dataModel.Pos_grp_ids)) {
            this.showAlert('Please enter Group Name', () => this.setFocus('Pos_grp_ids'));
            result = false;
            return false;

        }
        if (Utils.isNullOrEmpty(dataModel.dprt_stn_cds) && Utils.isNullOrEmpty(dataModel.arvl_stn_cds)) {
            this.showAlert('Please enter atleast One Station Name', () => this.setFocus('dprt_stn_cds'));
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
                me.showAlert("No changes has been made.", () => this.setFocus('Grp_stn_nam'));
            }
            else {
                me.showAlert("Please Enter required fields.", () => this.setFocus('Grp_stn_nam'));
            }
        }
    }

    doSave(e) {
        const me = this;
        const model = this.Data;
        if (this.isvalidSave()) {
            const dataInfo = this.getData();
            console.log("DataInfo", dataInfo);
            dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
            dataInfo.Mode = model.Input.IsEdit ? "UPDATE" : "INSERT";
            model.Loading = true;
            me.updateUI();
            Utils.ajax({ url: `${this._WebApi}/SSM138SaveDataAsync`, data: dataInfo }, r => {
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
        this.loadPage(pageNo);
        me.showAlert('Data saved successfully', () => me.newMode());
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
        model.Title = `${this.props.data.Title} / Group Station Combinations `;
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