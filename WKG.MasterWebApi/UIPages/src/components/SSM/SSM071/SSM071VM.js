import * as cntrl from "../../../wkl-components";
import util from "../../../wkl-components/WKLEditor/src/lib/util";

export default class SSM071VM extends cntrl.VMBase {
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
        model.FormID = "SSM071";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.supp_map_id = this.props.data.supp_map_id;
        model.supp_nam = this.props.data.supp_nam;
        model.radios = {
            Sandbox: '',
            Production: ''
        };
        model.Input = {
            IsEdit: false,
            Pos_cd_F: null,
            IsActive_F: '',
            mod_dttm: "",
            mod_by_usr_cd: ""
        };
        model.SearchInput = {
            PosCdList: null,
        };
        model.PosCdList = [];
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 5 };
        model.GridInfo.Columns = [
            //{ text: '', field: 'Text', width: '25px' },
            { text: 'Supplier Name', field: 'supp_nam', width: '35%' },
            { text: 'Pos Name', field: 'pos_nam', width: '35%' },
            { text: 'Pos Active Endpoint', field: 'pos_actv_end_pnt', width: '30%' }
        ];

        this.newMode();
    }
    newMode(flag = true) {
        const model = this.Data;
        model.Input = {
            IsEdit: false,
            Pos_cd_F: null,
            IsActive_F: model.radios.Sandbox,
            mod_dttm: "",
            mod_by_usr_cd: ""
        };
        this.setTitle();
        if (flag)
            this.setFocus('Pos_cd_F');
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
        dataInfo.supp_map_id = model.supp_map_id;
        dataInfo.PageNo = 1;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.SortTyp = true;
        model.Loading = true;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM071GetOnloadAsync`, data: dataInfo, files: [] }, (r) => {
            model.Loading = false;
            if (r) {
                try {
                    model.PosCdList = r.PosmastList.map((e) => ({ ID: e.pos_cd, Text: e.pos_nam }));
                    model.radios = r.radios;
                    this.newMode(false);
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
            ...e, pos_actv_end_pnt: e.pos_actv_end_pnt === 'S' ? 'Sandbox' : 'Production'
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
    loadPage(pageIndex) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.supp_map_id = model.supp_map_id;
        dataInfo.pos_cd = model.SearchInput.Pos_cd_S ? model.SearchInput.Pos_cd_S.ID : null;
        dataInfo.act_inact_ind = model.SearchInput.IsActiveS;
        dataInfo.PageNo = pageIndex;
        dataInfo.PageSize = gridInfo.PageSize;
        model.Loading = true;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM071GetSearchAsync`, data: dataInfo }, (r) => {
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
    handleSearchClear() {
        const me = this;
        me.doSearchClear(true);
    }
    doSearchClear(clearAll = false) {
        const model = this.Data;
        const gridInfo = model.GridInfo;

        if (clearAll === true) {
            this.setFocus('Pos_cd_S');
            this.setTitle();
            model.SearchInput.Pos_cd_S = null;
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
            this.loadSelectedData(selectedItem.pos_cd);
    }
    loadSelectedData(pos_cd) {
        const me = this;
        const model = this.Data;
        const datamodel = this.Data.Input;
        model.Loading = true;
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM071GetSelectAsync`, data: { pos_cd, supp_map_id: model.supp_map_id } }, (r) => {
            model.Loading = false;
            if (r) {
                datamodel.IsEdit = true;
                datamodel.Pos_cd_F = model.PosCdList.find(ex => ex.ID === r.Items[0].pos_cd);
                datamodel.IsActive_F = r.Items[0].pos_actv_end_pnt || model.radios.Sandbox;
                datamodel.mod_dttm = r.Items[0].mod_dttm;
                datamodel.mod_by_usr_cd = r.Items[0].mod_by_usr_cd;
            }
            // me.setFocus('Production_endpt_F');
            me.setTitle();
            let dataCopyEx = me.getData();
            model.DataCopy = JSON.stringify(dataCopyEx);
            me.updateUI();
        });
        this.updateUI();
    }
    handleDataChange(selectedItem) {
        const me = this;
        const model = this.Data.Input;
        if (selectedItem) {
            if (selectedItem.pos_cd === (model.Pos_cd_F ? model.Pos_cd_F.ID : "")) {
                // me.setFocus('Production_endpt_F');
                return;
            }
            else {
                if (this.isValueChanged()) {
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
                me.showAlert("No changes has been made", () => me.setFocus(''));
            }
            else {
                me.showAlert("Please enter required fields", () => me.setFocus('Pos_cd_F'));
            }

        }
    }
    isvalidSave(e) {
        const me = this;
        const model = this.Data.Input;
        if (cntrl.Utils.isNullOrEmpty(model.Pos_cd_F)) {
            this.showAlert('Please select Pos Name', () => me.setFocus('Pos_cd_F'));
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
            model.Loading = true;
            me.updateUI();
            cntrl.Utils.ajax({ url: `${this._WebApi}/SSM071SaveAsync`, data: dataInfo }, r => {
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
    handleDelete() {
        const model = this.Data;
        const me = this;
        const dataInfo = { supp_map_id: model.supp_map_id, pos_cd: model.Input.Pos_cd_F.ID };
        dataInfo.Mode = 'DELETE';
        model.Loading = true;
        me.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM071SaveAsync`, data: dataInfo }, r => {
            try {
                model.Loading = false;
                r = r || {};
                if (r.IsSuccess === true) {
                    me.showAlert('Data Removed Successfully', (_e) => {
                        me.Data.GridInfo.SelectedItem = null;
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
    BlurCheck(pos_cd) {
        const model = this.Data;
        const me = this;
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM071CheckPosExist`, data: { pos_cd, supp_map_id: model.supp_map_id } }, r => {
            try {
                if (r) {
                    if (r.pos_avail) {
                        me.showConfirmation('Record already exists.Do you want to retrieve?', false, (_e) => {
                            if (_e === 0) {
                                me.loadSelectedData(r.Items[0].pos_cd);
                            } else {
                                model.Input.Pos_cd_F = null;
                                me.setFocus('Pos_cd_F');
                            }
                        });
                    }
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
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    setTitle() {
        const model = this.Data;
        if (model.Input.IsEdit) {
            model.Title = `Api Config / Pos Config / ${model.supp_nam} / Edit / ${model.Input.Pos_cd_F.Text}`;
        } else {
            model.Title = `Api Config / Pos Config / ${model.supp_nam} / New`;
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
            pos_cd: model.Input.Pos_cd_F ? model.Input.Pos_cd_F.ID : "",
            pos_actv_end_pnt: model.Input.IsActive_F,
            supp_map_id: model.supp_map_id
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