import * as cntrl from "../../../wkl-components";
import util from "../../../wkl-components/WKLEditor/src/lib/util";

export default class SSM052VM extends cntrl.VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'SSM050';
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.MultiSelectList = null;
        model.FormID = "SSM052";
        model.Title = '';
        model.prod_id = this.props.data.InputData.pid;
        model.prod_name = this.props.data.InputData.pname;
        model.SuppMapID = this.props.data.InputData.SuppMapID;
        model.excptn_srl = null;
        model.Loading = false
        model.DataCopy = null;
        model.DefaultMarkupType = {
            Percentage:"",
            Fixed:""
          };
        model.Input = {
            group_name: null,
            Markup_Amount: "",
            mrkup_typ: model.DefaultMarkupType.Fixed,
            Sort_ordr: "",
            IsActive: true,
            IsEdit: false,
            mod_dttm: "",
            mod_by_usr_cd: ""
        };
        model.SearchInput = {
            Group_name_S: null,
            IsActiveS: true,
        };
        model.Group_Name_List = [];
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 5 };
        model.GridInfo.Columns = [
            { text: 'Group Name', field: 'pos_grp_nam', width: '30%', sort: { enabled: true } },
            { text: 'Markup Amount', field: 'wkg_markup', width: '30%' },
            { text: 'Markup Type', field: 'wkg_markup_typ', width: '20%' },
            { text: 'Status', field: 'act_inact_ind', width: '20%' },
        ];

        this.newMode();
    }
    newMode(flag=true) {
        const model = this.Data;
        model.Input = {
            group_name: null,
            Markup_Amount: "",
            mrkup_typ: model.DefaultMarkupType.Fixed,
            Sort_ordr: "",
            IsActive: true,
            IsEdit: false,
            mod_dttm: "",
            mod_by_usr_cd: ""
        };
        this.setTitle();
        if(flag){
            this.setFocus('group_name');
        }
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
        dataInfo.prod_id = model.prod_id;
        dataInfo.supp_map_id = model.SuppMapID;
        dataInfo.PageNo = 1;
        dataInfo.PageSize = gridInfo.PageSize;
        model.Loading = true;
        model.AllSelected = false;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM052OnLoadDataAsync`, data: dataInfo, files: [] }, (r) => {
            model.Loading = false;
            if (r) {
                try {
                    model.DefaultMarkupType = r.BookingFeeType;
                    model.Group_Name_List = r.comboList.map(e => ({ ID: e.pos_grp_id, Text: e.pos_grp_nam }))
                    me.fillSearchResult(r.grid || {}, selectedItem);
                }
                catch (ex) { }
                finally {
                    me.newMode(false);
                    me.updateUI();
                }
            }
        });
    }
    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.Items.map(e => ({ ...e, act_inact_ind: e.act_inact_ind ? "Active" : "Inactive", wkg_markup_typ: e.wkg_markup_typ === 'P' ? 'Percentage' : 'Fixed' })) || [];
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
        dataInfo.PageNo = pageIndex;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.pos_grp_id = model.SearchInput.Group_name_S ? model.SearchInput.Group_name_S.ID : '';
        dataInfo.act_inact_ind = model.SearchInput.IsActiveS === true ? 1 : 0;
        dataInfo.supp_map_id = model.SuppMapID;
        dataInfo.prod_id = model.prod_id;
        dataInfo.sortType = true;
        // dataInfo.ssmAsc = model.SearchInput.prevSort;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "pos_grp_nam" && !cntrl.Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.sortType = itm.sort === 'asc';
                    // model.SearchInput.prevSort = dataInfo.ssmAsc;
                }
            }
        }
        model.Loading = true;
        model.AllSelected = false;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM052SearchDataAsync`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                me.fillSearchResult(r || {}, selectedItem);
            }
            catch (ex) { }
            finally {
                me.updateUI();
            }
        });
    }
    onBlurSearch() {
        const me = this;
        const model = this.Data;
        const dataInfo = {};
        dataInfo.pos_grp_id = model.Input.group_name.ID;
        dataInfo.prod_id = model.prod_id;
        dataInfo.supp_map_id = model.SuppMapID;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM052BlurSrchAsync`, data: dataInfo, files: [] }, (r) => {
            try {
                if (r && r.Isavailable === true) {
                    me.showConfirmation('Record already exists.Do you want to retrieve?', false, (_e) => {
                        if (_e === 0) {
                            me.loadSelectedData(r.excptn_srl);
                        } else {
                            model.Input.group_name = null;
                            me.setFocus('group_name');
                        }
                    })
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
            this.setFocus('Group_name_S');
            this.setTitle();
            model.SearchInput.Group_name_S = null;
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
            this.loadSelectedData(selectedItem.excptn_srl);
    }
    loadSelectedData(excptn_srl) {
        const me = this;
        const model = this.Data;
        const datamodel = this.Data.Input;
        model.Loading = true;
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM052LoadSelectedData`, data: { excptn_srl } }, (r) => {
            model.Loading = false;
            if (r) {
                datamodel.IsEdit = true;
                model.excptn_srl = r.excptn_srl;
                datamodel.group_name = model.Group_Name_List.find(e => e.ID === r.pos_grp_id);
                datamodel.Markup_Amount = r.wkg_markup || "";
                datamodel.mrkup_typ = r.wkg_markup_typ || model.DefaultMarkupType.Fixed;
                datamodel.Sort_ordr = r.sort_ordr || "";
                datamodel.IsActive = r.act_inact_ind;
                datamodel.mod_dttm = r.mod_dttm;
                datamodel.mod_by_usr_cd = r.mod_by_usr_cd;
            }
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
            if (selectedItem.pos_grp_nam === (model.group_name ? model.group_name.Text : "")) {
                me.setFocus('Markup_Amount');
                return;
            }
            else {
                if (this.isValueChanged()) {
                    this.showConfirmation('Unsaved changes exists. Save and proceed', false, (_e) => {
                        if (_e === 0) {
                            me.handleSave();
                        } else if (_e === 1) {
                            me.setSelectedItem(selectedItem, true);
                            me.setFocus('Markup_Amount');
                        }
                    });
                }
                else {
                    this.setSelectedItem(selectedItem, true);
                    me.setFocus('Markup_Amount');
                }
            }
        }
        else {
            if (this.isValueChanged()) {
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
                me.showAlert("No changes has been made.", 'Markup_Amount');
            }
            else {
                me.showAlert("Please enter required fields", 'group_name');
            }

        }
    }
    isvalidSave(e) {
        const me = this;
        const model = this.Data.Input;
        if (cntrl.Utils.isNullOrEmpty(model.group_name)) {
            this.showMessageBox({
                text: "Please Select Group Name",
                messageboxType: cntrl.WKLMessageboxTypes.info,
                onClose: (_e) => {
                    me.setFocus('group_name');
                }
            });
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
            dataInfo.supp_map_id = model.SuppMapID;
            dataInfo.EXSavedata = model.Input.IsEdit ? "EXUPDATE" : "EXINSERT";
            //  EXSavedata: model.Input.IsEdit ? "EXUPDATE" : "EXINSERT",
            model.Loading = true;
            me.updateUI();
            cntrl.Utils.ajax({ url: `${this._WebApi}/SSM050_SaveAsyncMinex`, data: dataInfo }, r => {
                try {
                    model.Loading = false;
                    r = r || {};
                    if (r.IsSuccess === true) {
                        const opts = {
                            text: "Data Saved Successfully",
                            messageboxType: cntrl.WKLMessageboxTypes.info,
                            onClose: (_e) => {
                                me.loadPage(1);
                                me.newMode();
                            }
                        };
                        this.showMessageBox(opts);
                    }
                    else {
                        const opts = {
                            text: "Something went Wrong",
                            messageboxType: cntrl.WKLMessageboxTypes.info,
                            onClose: (_e) => {
                            }
                        };
                        this.showMessageBox(opts);
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

    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    setTitle() {
        const model = this.Data;
        if (model.Input.IsEdit) {
            model.Title = `Big Bus Product / Exception / ${model.prod_name} / Edit ${cntrl.Utils.isNullOrEmpty(model.Input.group_name) ? "" : "/ " + model.Input.group_name.Text}`;
        } else {
            model.Title = `Big Bus Product / Exception / ${model.prod_name} / New`;
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
    showAlert(errorMsg, name) {
        if (typeof errorMsg === 'number')
            errorMsg = cntrl.Utils.getMessage(errorMsg);

        const me = this;
        const opt = {
            text: errorMsg,
            messageboxType: cntrl.WKLMessageboxTypes.question
        };
        if (name) {
            opt.onClose = (_e) => {
                me.setFocus(name);
            }
        }
        this.showMessageBox(opt);
    }
    getData() {
        const model = this.Data;
        const dataInfo = {
            bg_prod_id: model.prod_id,
            pos_grp_id: model.Input.group_name ? model.Input.group_name.ID : "",
            excptn_srl: model.excptn_srl,
            wkg_markup: model.Input.Markup_Amount,
            wkg_markup_typ: model.Input.mrkup_typ,
            act_inact_ind: model.Input.IsActive === true ? 1 : 0,
            sort_ordr: model.Input.Sort_ordr
        };
        return dataInfo;
    }
    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    doClose() {
        const me = this;
        const model = this.Data;
        if (this.isValueChanged()) {
            let options = [{ text: 'Yes' }, { text: 'No' }];
            this.showMessageBox({
                text: "Do you want to Discard the changes?",
                buttons: options,
                messageboxType: cntrl.WKLMessageboxTypes.info,
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

