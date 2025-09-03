import * as cntrl from "../../../wkl-components";

export default class SSM031VM extends cntrl.VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'SSM030';
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.MultiSelectList = null;
        model.FormID = "SSM031";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.Input = {
            Event_name_F: "",
            Short_name_F: "",
            IsActiveF: true,
            LTD_avail_F: "",
            Sort_ordr_F: "",
            IsEdit: false,
            Modifiedon: "",
            Modifiedby: "",
            evnt_typ_id: ""
        };
        model.SearchInput = {
            Event_name_S: "",
            IsActiveS: true,
            delisted_S: false,
        };
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 5 };
        model.GridInfo.Columns = [
            // { text: 'selectall', field: 'selectall', width: '10%' },
            { text: 'Event Name', field: 'evnt_typ_nam', width: '40%', sort: { enabled: true } },
            { text: 'Sort', field: 'sort_ordr', width: '20%' },
            { text: 'Delisted', field: 'evnt_typ_aval', width: '20%' },
            { text: 'Status', field: 'act_inact_ind', width: '20%' },
        ];

        this.newMode();
    }
    newMode() {
        const model = this.Data.Input;
        model.ID = 0;
        model.Event_name_F = "";
        model.Short_name_F = "";
        model.IsActiveF = true;
        model.IsEdit = false;
        model.LTD_avail_F = "";
        model.Sort_ordr_F = "";
        model.Modifiedon = "";
        model.Modifiedby = "";
        model.evnt_typ_id = "";
        this.setTitle();
        this.setFocus('Event_name_S');
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
        this.loadPage(1);
    }
    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.Items.map(e => ({ ...e, act_inact_ind: e.act_inact_ind ? "Active" : "Inactive", evnt_typ_aval: e.evnt_typ_aval ? "No" : "Yes" })) || [];
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
        dataInfo.evnt_typ_nam = model.SearchInput.Event_name_S;
        dataInfo.act_inact_ind = model.SearchInput.IsActiveS;
        dataInfo.evnt_typ_aval = !model.SearchInput.delisted_S;
        dataInfo.sortType = true;
        // dataInfo.ssmAsc = model.SearchInput.prevSort;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "evnt_typ_nam" && !cntrl.Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.sortType = itm.sort === 'asc';
                    // model.SearchInput.prevSort = dataInfo.ssmAsc;
                }
            }
        }
        model.Loading = true;
        model.AllSelected = false;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM031SearchAsync`, data: dataInfo, files: [] }, (r) => {
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
            this.setFocus('Event_name_S');
            this.setTitle();
            model.SearchInput.Event_name_S = "";
            model.SearchInput.IsActiveS = true;
            model.SearchInput.delisted_S = false;
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
            this.loadSelectedData(selectedItem.evnt_typ_id);
    }
    loadSelectedData(evnt_typ_id) {
        const me = this;
        const model = this.Data;
        const dataModel = this.Data.Input;
        model.Loading = true;
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM031LoadSelectedDataAsync`, data: { evnt_typ_id } }, (r) => {
            dataModel.evnt_typ_id = r.evnt_typ_id;
            dataModel.Event_name_F = r.evnt_typ_nam;
            dataModel.Short_name_F = r.evnt_shrt_nam || dataModel.Event_name_F;
            dataModel.IsActiveF = r.act_inact_ind;
            dataModel.LTD_avail_F = r.evnt_typ_aval ? "No" : "Yes";
            dataModel.Sort_ordr_F = r.sort_ordr;
            dataModel.Modifiedon = r.mod_dttm;
            dataModel.Modifiedby = r.mod_by_usr_cd;
            dataModel.IsEdit = true;
            model.Loading = false;
            me.setTitle();
            let dataCopyEx = me.getData();
            model.DataCopy = JSON.stringify(dataCopyEx);
            me.setFocus('Short_name_F');
            me.updateUI();
        });
        this.updateUI();
    }
    handleDataChange(selectedItem) {
        const me = this;
        const model = this.Data.Input;
        if (selectedItem) {
            if (selectedItem.evnt_typ_nam === model.Event_name_F) {
                return;
            }
            else {
                if (this.isValueChanged() && model.IsEdit) {
                    let options = [{ text: 'Yes' }, { text: 'No' }];
                    this.showMessageBox({
                        text: "Unsaved changes exists. Save and proceed",
                        buttons: options,
                        messageboxType: cntrl.WKLMessageboxTypes.info,
                        onClose: (_e) => {
                            if (_e === 0) {
                                me.handleSave();
                            } else if (_e === 1) {
                                me.setSelectedItem(selectedItem, true);
                                me.setFocus('Event_name_F');
                            }
                        }
                    });
                }
                else {
                    this.setSelectedItem(selectedItem, true);
                    me.setFocus('Event_name_F');
                }
            }
        }
        else {
            if (this.isValueChanged() && model.IsEdit) {
                let options = [{ text: 'Yes' }, { text: 'No' }];
                this.showMessageBox({
                    text: "Unsaved changes exists. Save and proceed",
                    buttons: options,
                    messageboxType: cntrl.WKLMessageboxTypes.info,
                    onClose: (_e) => {
                        if (_e === 0) {
                            me.Data.Input.IsEdit = true;
                            me.handleSave();
                        } else if (_e === 1) {
                            me.newMode();
                        }
                    }
                });
            } else {
                me.newMode();
            }
        }
    }
    handleSave() {
        const model = this.Data.Input;
        const me = this;
        if (this.isValueChanged()) {
            const dataInfo = {
                evnt_typ_id: model.evnt_typ_id,
                evnt_typ_nam: model.Event_name_F,
                evnt_shrt_nam: model.Short_name_F,
                sort_ordr: model.Sort_ordr_F,
                act_inact_ind: model.IsActiveF,
                mod_by_usr_cd: cntrl.ApiManager.getUser().ID
            }
            me.Data.Loading = true;
            this.updateUI();
            cntrl.Utils.ajax({ url: `${this._WebApi}/SSM031SaveDataAsync`, data: dataInfo }, (r) => {
                me.Data.Loading = false;
                if (r && r.IsSuccess) {
                    const opts = {
                        text: "Data Saved Successfully",
                        messageboxType: cntrl.WKLMessageboxTypes.info,
                        onClose: (_e) => {
                            model.evnt_typ_id = "";
                            me.handleSearch(me.Data.GridInfo.Page);
                            me.newMode();
                        }
                    };
                    this.showMessageBox(opts);
                } else {
                    const opts = {
                        text: "Something went Wrong",
                        messageboxType: cntrl.WKLMessageboxTypes.info,
                        onClose: (_e) => {
                        }
                    };
                    this.showMessageBox(opts);
                }
                me.updateUI();
            });
        } else {
            const opts = {
                text: "No changes has been made.",
                messageboxType: cntrl.WKLMessageboxTypes.info,
                onClose: (_e) => {
                    me.setFocus("Short_name_F");
                }
            };
            this.showMessageBox(opts);
            me.updateUI();
        }
    }
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    setTitle() {
        const model = this.Data;
        model.Title = `Ltd Product / ${this.props.data.Title} ${model.Input.Event_name_F === "" ? "" : "/ Edit / " + model.Input.Event_name_F}`;
    };

    getData() {
        const model = this.Data.Input;
        const dataInfo = {};
        dataInfo.IsActiveF = model.IsActiveF;
        dataInfo.Short_name_F = model.Short_name_F;
        dataInfo.Sort_ordr_F = model.Sort_ordr_F;
        return dataInfo;
    }
    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    doClose() {
        const me = this;
        const model = this.Data;
        if (this.isValueChanged() && model.Input.IsEdit) {
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