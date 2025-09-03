import * as cntrl from "../../../wkl-components";
import { Utils } from "../../../wkl-components";

export default class SSM070VM extends cntrl.VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'SSM070';
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.MultiSelectList = null;
        model.FormID = "SSM070";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.radios = {
            Percentage: '',
            Fixed: ''
        }
        model.Input = {
            IsEdit: false,
            Supp_Name_F: null,
            Production_endpt_F: null,
            Sandbox_endpt_F: null,
            Email_req_F: true,
            Mobile_req_F: false,
            Status_F: true,
            Pull_dt_F: "",
            mod_dttm: "",
            mod_by_usr_cd: "",
            booking_fee: "",
            bkfee_type: ''
        };
        model.SearchInput = {
            Supp_name_S: null,
            IsActiveS: true,
        };
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 5 };
        model.GridInfo.Columns = [
            //{ text: '', field: 'Text', width: '25px' },
            { text: 'Supplier Name', field: 'supp_nam', width: '35%' },
            { text: 'Last Pull Datetime', field: 'lst_pull_dt', width: '35%' },
            // { text: 'E-mail Required', field: 'email_req', width: '20%' },
            { text: 'Mobile Required', field: 'mobile_req', width: '20%' },
            { text: 'Status', field: 'act_inact_ind', width: '10%' }
        ];
        model.Supp_List = [];
        model.EndptList = [];

        this.newMode();
    }
    newMode() {
        const model = this.Data;
        model.Input = {
            IsEdit: false,
            Supp_Name_F: null,
            Production_endpt_F: null,
            Sandbox_endpt_F: null,
            Email_req_F: true,
            Mobile_req_F: false,
            Status_F: true,
            Pull_dt_F: "",
            mod_dttm: "",
            mod_by_usr_cd: "",
            booking_fee: "",
            bkfee_type: model.radios.Percentage
        };
        this.setTitle();
        // this.setFocus('Supp_Name_F');
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
    loadInitData() {
        this.adjustPageSize();
        this.onLoad();
    }
    onLoad() {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.PageNo = 1;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.SortTyp = true;
        model.Loading = true;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM070GetOnloadAsync`, data: dataInfo, files: [] }, (r) => {
            model.Loading = false;
            if (r) {
                try {
                    model.Supp_List = r.SuppConfigList.map((e) => ({ ID: e.supp_map_id, Text: e.supp_nam }));
                    model.EndptList = r.EndPointList.map((e) => ({ ID: e, Text: e }));
                    model.radios = r.radios;
                    this.newMode();
                    me.fillSearchResult(r || {}, selectedItem);
                }
                catch (ex) { }
                finally {
                    me.updateUI();
                }
            }
        });
    }
    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.Items.map(e => ({
            ...e, act_inact_ind: e.act_inact_ind ? "Active" : "Inactive", mobile_req: e.mobile_req ? 'Yes' : 'No', email_req: e.email_req ? 'Yes' : 'No'
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
    handleSearch(pageIndex) {
        this.loadPage(pageIndex);
    }
    loadPage(pageIndex, columnOptions = null) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.supp_map_id = model.SearchInput.Supp_name_S ? model.SearchInput.Supp_name_S.ID : null;
        dataInfo.act_inact_ind = model.SearchInput.IsActiveS;
        dataInfo.PageNo = pageIndex;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.SortTyp = true;
        // dataInfo.ssmAsc = model.SearchInput.prevSort;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "supp_nam" && !cntrl.Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.SortTyp = itm.sort === 'asc';
                    // model.SearchInput.prevSort = dataInfo.ssmAsc;
                }
            }
        }
        model.Loading = true;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM070GetSearchAsync`, data: dataInfo }, (r) => {
            model.Loading = false;
            if (r) {
                try {
                    me.fillSearchResult(r || {}, selectedItem);
                }
                catch (ex) { }
                finally {
                    me.updateUI();
                }
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
            this.setFocus('Supp_name_S');
            this.setTitle();
            model.SearchInput.Supp_name_S = null;
            model.SearchInput.IsActiveS = true;
        }
        gridInfo.Items = [];
        gridInfo.SelectedItem = null;
        gridInfo.Page = 1;
        gridInfo.TotalPage = 1;
        this.updateUI();
    }
    setSelectedItem(selectedItem, loadData = false) {
        const model = this.Data;
        model.GridInfo.SelectedItem = selectedItem;
        model.GridInfo.SelectedItem.isSelected = true;
        if (loadData === true)
            this.loadSelectedData(selectedItem.supp_map_id);
    }
    loadSelectedData(supp_map_id) {
        const me = this;
        const model = this.Data;
        const datamodel = this.Data.Input;
        model.Loading = true;
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM070GetSelectAsync`, data: { supp_map_id } }, (r) => {
            model.Loading = false;
            if (r) {
                datamodel.IsEdit = true;
                datamodel.Supp_Name_F = model.Supp_List.find(ex => ex.ID === r.Items[0].supp_map_id);
                datamodel.Production_endpt_F = model.EndptList.find(ex => ex.ID === r.Items[0].prod_end_pnt_nam);
                datamodel.Sandbox_endpt_F = model.EndptList.find(ex => ex.ID === r.Items[0].sndbx_end_pnt_nam);
                datamodel.Email_req_F = r.Items[0].email_req || false;
                datamodel.Mobile_req_F = r.Items[0].mobile_req || false;
                datamodel.Status_F = r.Items[0].act_inact_ind;
                datamodel.Pull_dt_F = r.Items[0].lst_pull_dt || "";
                datamodel.mod_dttm = r.Items[0].mod_dttm;
                datamodel.mod_by_usr_cd = r.Items[0].mod_by_usr_cd;
                datamodel.booking_fee = r.Items[0].bkng_fee || "";
                datamodel.bkfee_type = r.Items[0].bkng_fee_typ !== null ? (r.Items[0].bkng_fee_typ) : model.radios.Percentage;
            }
            // me.setFocus('Production_endpt_F');
            me.setTitle();
            let dataCopyEx = me.getData();
            model.DataCopy = JSON.stringify(dataCopyEx);
            // me.setFocus('group_name');
            me.updateUI();
        });
        this.updateUI();
    }
    handleDataChange(selectedItem) {
        const me = this;
        const model = this.Data.Input;
        if (selectedItem) {
            if (selectedItem.supp_nam === (model.Supp_Name_F ? model.Supp_Name_F.Text : "")) {
                // me.setFocus('Production_endpt_F');
                return;
            }
            else {
                if (this.isValueChanged() && model.IsEdit) {
                    this.showConfirmation('Unsaved changes exists. Save and proceed', false, (_e) => {
                        if (_e === 0) {
                            me.handleSave();
                        } else if (_e === 1) {
                            me.setSelectedItem(selectedItem, true);
                        }
                    });
                }
                else {
                    this.setSelectedItem(selectedItem, true);
                }
            }
        }
        else {
            if (this.isValueChanged() && model.IsEdit) {
                this.showConfirmation('Unsaved changes exists. Save and proceed', false, (_e) => {
                    if (_e === 0) {
                        me.handleSave();
                    } else if (_e === 1) {
                        me.newMode();
                    }
                });
            } else {
                me.newMode();
            }
        }
    }
    handleSave(e) {
        const me = this;
        const model = this.Data;
        if (this.isValueChanged()) {
            this.doSave(e);
        }
        else {
            if (model.Input.IsEdit) {
                me.showAlert("No changes has been made", () => me.setFocus('Production_endpt_F'));
            }
            else {
                me.showAlert("Please enter required fields", () => me.setFocus('Supp_Name_F'));
            }

        }
    }
    isvalidSave(e) {
        const me = this;
        const model = this.Data.Input;
        if (cntrl.Utils.isNullOrEmpty(model.Supp_Name_F)) {
            this.showAlert('', () => me.setFocus('Supp_Name_F'));
            return false;
        }
        return true;
    }
    doSave(e) {
        if (this.isvalidSave(e)) {
            const me = this;
            const model = this.Data;
            const dataInfo = this.getData();
            dataInfo.mod_by_usr_cd = cntrl.ApiManager.getUser().ID;
            dataInfo.Mode = model.Input.IsEdit ? "UPDATE" : "INSERT";
            dataInfo.bkng_fee_typ = cntrl.Utils.isNullOrEmpty(model.Input.booking_fee) ? "" : (model.Input.bkfee_type)
            model.Loading = true;
            me.updateUI();
            cntrl.Utils.ajax({ url: `${this._WebApi}/SSM070SaveAsync`, data: dataInfo }, r => {
                try {
                    model.Loading = false;
                    r = r || {};
                    if (r.IsSuccess === true) {
                        me.showAlert('Data Saved Successfully', (_e) => {
                            me.loadPage(1);
                            me.newMode();
                        });
                    }
                    else {
                        me.showAlert('Something went Wrong', (_e) => {
                        });
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
    openWindow() {
        const model = this.Data;
        const me = this;
        let urlbtn = "";
        let title = "";
        urlbtn = "SSM/SSM071";
        title = "Pos Config";
        this.showWindow({
            url: urlbtn,
            data: { Title: title, supp_map_id: model.Input.Supp_Name_F.ID, supp_nam: model.Input.Supp_Name_F.Text },
            windowStyle: cntrl.WKLWindowStyles.slideLeft, onClose: (e) => {
            }
        });
    }
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    setTitle() {
        const model = this.Data;
        if (model.Input.IsEdit) {
            model.Title = `Api Config / Edit / ${model.Input.Supp_Name_F ? model.Input.Supp_Name_F.Text : ""}`;
        } else {
            model.Title = `Api Config`;
        }
    };
    showConfirmation(msg, isThreeOption, callback) {
        let options = [{ text: 'Yes' }, { text: 'No' }];
        if (isThreeOption)
            options = [{ text: 'Yes' }, { text: 'No' }, { text: 'Cancel' }];

        this.showMessageBox({
            text: msg,
            buttons: options,
            messageboxType: cntrl.WKLMessageboxTypes.info,
            onClose: callback
        });
    }
    showAlert(errorMsg, callback) {
        if (typeof errorMsg === 'number')
            errorMsg = cntrl.Utils.getMessage(errorMsg);

        const me = this;
        const opt = {
            text: errorMsg,
            messageboxType: cntrl.WKLMessageboxTypes.question
        };
        if (callback && typeof callback === 'function') {
            opt.onClose = (_e) => {
                callback();
            }
        }
        this.showMessageBox(opt);
    }
    getData() {
        const model = this.Data;
        const dataInfo = {
            supp_map_id: model.Input.Supp_Name_F ? model.Input.Supp_Name_F.ID : null,
            prod_end_pnt_nam: model.Input.Production_endpt_F ? model.Input.Production_endpt_F.ID : null,
            sndbx_end_pnt_nam: model.Input.Sandbox_endpt_F ? model.Input.Sandbox_endpt_F.ID : null,
            email_req: model.Input.Email_req_F,
            mobile_req: model.Input.Mobile_req_F,
            act_inact_ind: model.Input.Status_F,
            bkng_fee: model.Input.booking_fee,
            bkng_fee_typ: Utils.isNullOrEmpty(model.Input.booking_fee) ? "" : model.Input.bkfee_type
        };
        return dataInfo;
    }
    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    doClose() {
        const me = this;
        const model = this.Data.Input;
        if (this.isValueChanged() && model.IsEdit) {
            me.showConfirmation('Do you want to Discard the changes?', false, (ex) => {
                if (ex === 0) {
                    me.close();
                }
            });
        }
        else {
            this.close()
        }
    }
}