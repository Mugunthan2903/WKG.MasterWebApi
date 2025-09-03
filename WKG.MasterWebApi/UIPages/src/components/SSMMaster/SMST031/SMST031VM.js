import * as cntrl from "../../../wkl-components";

export default class SMST031VM extends cntrl.VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'SMST030';
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.MultiSelectList = null;
        model.FormID = "SMST031";
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
        };
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 12 };
        model.GridInfo.Columns = [
            // { text: 'selectall', field: 'selectall', width: '10%' },
            { text: 'Event Name', field: 'evnt_typ_nam', width: '40%', sort: { enabled: true } },
            { text: 'Sort Order', field: 'sort_ordr', width: '30%' },
            { text: 'Status', field: 'act_inact_ind', width: '30%' },
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
        this.setTitle();
        this.setFocus('Event_name_S');
        var dataCopyEx = this.getData();
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();
    }
    loadInitData() {
        this.loadPage(1);
    }
    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.Items.map(e => {
            if (e.act_inact_ind) {
                return { ...e, act_inact_ind: "Active" }
            } else {
                return { ...e, act_inact_ind: "Inactive" }
            }
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
        cntrl.Utils.ajax({ url: `${this._WebApi}/SMST031SearchAsync`, data: dataInfo, files: [] }, (r) => {
            try {
                model.Loading = false;
                me.fillSearchResult(r || {}, selectedItem);
            }
            catch (ex) { }
            finally {
                me.setFocus('Event_name_S');
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
            model.SearchInput.Event_name_S = "";
            model.SearchInput.IsActiveS = true;
            this.setFocus('Event_name_S');
            this.setTitle();
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
        me.Data.Loading = true;
        cntrl.Utils.ajax({ url: `${this._WebApi}/SMST031LoadSelectedDataAsync`, data: { evnt_typ_id } }, (r) => {
            dataModel.evnt_typ_id = r.evnt_typ_id;
            dataModel.Event_name_F = r.evnt_typ_nam;
            dataModel.Short_name_F = r.evnt_shrt_nam || dataModel.Event_name_F;
            dataModel.IsActiveF = r.act_inact_ind;
            dataModel.LTD_avail_F = r.evnt_typ_aval ? "Yes" : "No";
            dataModel.Sort_ordr_F = r.sort_ordr;
            dataModel.Modifiedon = r.mod_dttm;
            dataModel.Modifiedby = r.mod_by_usr_cd || "123";
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
                if (this.isValueChanged()) {
                    let options = [{ text: 'Yes' }, { text: 'No' }, { text: 'Cancel' }];
                    this.showMessageBox({
                        text: "Do you want to save the current data ?",
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
            if (this.isValueChanged()) {
                let options = [{ text: 'Yes' }, { text: 'No' }, { text: 'Cancel' }];
                this.showMessageBox({
                    text: "Do you want to save the current data ?",
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
                act_inact_ind: model.IsActiveF,
            }
            cntrl.Utils.ajax({ url: `${this._WebApi}/SMST031SaveDataAsync`, data: dataInfo }, (r) => {
                if (r.IsSuccess) {
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
        }
    }
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    setTitle() {
        const model = this.Data;
        model.Title = `${this.props.data.Title} / Edit ${model.Input.Event_name_F === "" ? "" : "/ " + model.Input.Event_name_F}`;
    };

    getData() {
        const model = this.Data.Input;
        const dataInfo = {};
        dataInfo.Event_name_F = model.Event_name_F;
        dataInfo.IsActiveF = model.IsActiveF;
        dataInfo.Short_name_F = model.Short_name_F;
        return dataInfo;
    }
    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    doClose() {
        const me = this;
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